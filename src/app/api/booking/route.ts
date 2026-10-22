import { NextResponse } from "next/server";
import { z } from "zod";
import { routeSummary } from "@/lib/here";
import { computeQuote, euro, parisToUtc } from "@/lib/pricing";
import { db, dbConfigured, getPricing } from "@/lib/supabase";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { trackKey } from "@/lib/docsign";
import { SITE } from "@/lib/site";
import { allow, clientIp } from "@/lib/ratelimit";
import { currentUser } from "@/lib/auth";
import { applyDiscount, validatePromo } from "@/lib/promo";

const place = z.object({
  label: z.string().min(3).max(300),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const schema = z.object({
  origin: place,
  dest: place,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  passengers: z.number().int().min(1).max(4),
  luggage: z.number().int().min(0).max(12),
  childSeat: z.boolean(),
  flight: z.string().trim().max(30).optional(),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(200),
  notes: z.string().trim().max(500).optional(),
  returnTrip: z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: z.string().regex(/^\d{2}:\d{2}$/) }).optional(),
  payMode: z.enum(["deposit", "full"]),
  promo: z.string().max(40).optional(),
  billingCompany: z.string().trim().max(120).optional(),
  billingAddress: z.string().trim().max(300).optional(),
  billingSiren: z.string().trim().regex(/^\d{9}$/).optional().or(z.literal("").transform(() => undefined)),
  accept: z.literal(true),
});

export async function POST(req: Request) {
  if (!allow(`booking:${clientIp(req)}`, 8, 10 * 60_000)) {
    return NextResponse.json({ error: "Trop de tentatives, réessayez dans quelques minutes." }, { status: 429 });
  }
  if (!dbConfigured() || !stripeConfigured()) {
    return NextResponse.json(
      { error: "La réservation en ligne n'est pas encore ouverte. Contactez-nous directement." },
      { status: 503 },
    );
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Merci de vérifier les champs du formulaire." }, { status: 400 });
  }
  const d = parsed.data;

  try {
    const pricing = await getPricing();
    const pickup = parisToUtc(d.date, d.time);
    const now = Date.now();
    if (Number.isNaN(pickup.getTime()) || pickup.getTime() < now + pricing.minLeadHours * 3_600_000) {
      return NextResponse.json(
        { error: `Réservation en ligne possible au moins ${pricing.minLeadHours} h à l'avance. Contactez-nous pour une course plus proche.` },
        { status: 422 },
      );
    }
    if (pickup.getTime() > now + 365 * 86_400_000) {
      return NextResponse.json({ error: "Date trop lointaine." }, { status: 422 });
    }

    // Dates bloquées depuis l'administration (congés, indisponibilités)
    const { data: blocked } = await db().from("blocked_periods").select("id").lte("start_at", pickup.toISOString()).gt("end_at", pickup.toISOString()).limit(1);
    if (blocked?.length) {
      return NextResponse.json({ error: "Nous ne sommes pas disponibles à cette date. Choisissez un autre créneau ou contactez-nous." }, { status: 422 });
    }

    // Le prix est toujours recalculé côté serveur : on ne fait jamais confiance au navigateur.
    const route = await routeSummary(d.origin, d.dest);
    if (route.distanceM / 1000 > pricing.maxDistanceKm) {
      return NextResponse.json({ error: "Trajet très long : contactez-nous pour un devis." }, { status: 422 });
    }
    let quote = computeQuote(route.distanceM, route.durationS, Number(d.time.slice(0, 2)), pricing);
    const user = await currentUser();
    let promoCode: string | null = null;
    let discountCents = 0;
    if (d.promo?.trim()) {
      const r = await validatePromo(d.promo, quote.priceCents, { userId: user?.id, email: d.email });
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: 422 });
      promoCode = r.code; discountCents = r.discountCents;
      quote = applyDiscount(quote, discountCents, pricing);
    }
    const chargeCents = d.payMode === "full" ? quote.fullCents : quote.depositCents;

    // Trajet retour (facultatif) : même parcours en sens inverse, à une autre date.
    let ret: { pickup: Date; quote: ReturnType<typeof computeQuote>; charge: number; distanceM: number; durationS: number } | null = null;
    if (d.returnTrip) {
      const rp = parisToUtc(d.returnTrip.date, d.returnTrip.time);
      if (Number.isNaN(rp.getTime()) || rp.getTime() < pickup.getTime() + (route.durationS + 1800) * 1000) {
        return NextResponse.json({ error: "Le retour doit être après l'arrivée de l'aller." }, { status: 422 });
      }
      if (rp.getTime() > now + 365 * 86_400_000) return NextResponse.json({ error: "Date de retour trop lointaine." }, { status: 422 });
      const { data: blockedR } = await db().from("blocked_periods").select("id").lte("start_at", rp.toISOString()).gt("end_at", rp.toISOString()).limit(1);
      if (blockedR?.length) return NextResponse.json({ error: "Nous ne sommes pas disponibles à la date de retour. Choisissez un autre créneau ou contactez-nous." }, { status: 422 });
      const back = await routeSummary(d.dest, d.origin);
      const rq = computeQuote(back.distanceM, back.durationS, Number(d.returnTrip.time.slice(0, 2)), pricing);
      ret = { pickup: rp, quote: rq, charge: d.payMode === "full" ? rq.fullCents : rq.depositCents, distanceM: back.distanceM, durationS: back.durationS };
    }

    const { data: row, error } = await db()
      .from("bookings")
      .insert({
        status: "pending_payment",
        user_id: user?.id ?? null,
        promo_code: promoCode,
        billing_company: d.billingCompany || null,
        billing_address: d.billingAddress || null,
        billing_siren: d.billingSiren || null,
        discount_cents: discountCents,
        origin_label: d.origin.label,
        origin_lat: d.origin.lat,
        origin_lng: d.origin.lng,
        dest_label: d.dest.label,
        dest_lat: d.dest.lat,
        dest_lng: d.dest.lng,
        pickup_at: pickup.toISOString(),
        passengers: d.passengers,
        luggage: d.luggage,
        child_seat: d.childSeat,
        flight: d.flight || null,
        customer_name: d.name,
        customer_phone: d.phone,
        customer_email: d.email,
        notes: d.notes || null,
        distance_m: Math.round(route.distanceM),
        duration_s: Math.round(route.durationS),
        price_cents: quote.priceCents,
        charge_cents: chargeCents,
        pay_mode: d.payMode,
      })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "insertion impossible");

    const ids = [row.id as string];
    if (ret) {
      const { data: row2, error: err2 } = await db()
        .from("bookings")
        .insert({
          status: "pending_payment",
          user_id: user?.id ?? null,
          group_id: row.id,
          is_return: true,
          billing_company: d.billingCompany || null,
          billing_address: d.billingAddress || null,
          billing_siren: d.billingSiren || null,
          origin_label: d.dest.label, origin_lat: d.dest.lat, origin_lng: d.dest.lng,
          dest_label: d.origin.label, dest_lat: d.origin.lat, dest_lng: d.origin.lng,
          pickup_at: ret.pickup.toISOString(),
          passengers: d.passengers, luggage: d.luggage, child_seat: d.childSeat,
          customer_name: d.name, customer_phone: d.phone, customer_email: d.email,
          notes: d.notes || null,
          distance_m: Math.round(ret.distanceM), duration_s: Math.round(ret.durationS),
          price_cents: ret.quote.priceCents, charge_cents: ret.charge, pay_mode: d.payMode,
        })
        .select("id")
        .single();
      if (err2 || !row2) {
        await db().from("bookings").update({ status: "expired" }).eq("id", row.id);
        throw new Error(err2?.message ?? "insertion retour impossible");
      }
      await db().from("bookings").update({ group_id: row.id }).eq("id", row.id);
      ids.push(row2.id as string);
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      customer_email: d.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: chargeCents,
            product_data: {
              name: `${ret ? "Aller — " : "Course — "}${d.payMode === "full" ? "paiement total" : "acompte de réservation"}`,
              description: `${d.origin.label} → ${d.dest.label} (${euro(quote.priceCents)} au total)`.slice(0, 300),
            },
          },
        },
        ...(ret
          ? [{
              quantity: 1,
              price_data: {
                currency: "eur",
                unit_amount: ret.charge,
                product_data: {
                  name: `Retour — ${d.payMode === "full" ? "paiement total" : "acompte de réservation"}`,
                  description: `${d.dest.label} → ${d.origin.label} (${euro(ret.quote.priceCents)} au total)`.slice(0, 300),
                },
              },
            }]
          : []),
      ],
      metadata: { booking_id: row.id, booking_ids: ids.join(",") },
      payment_intent_data: { metadata: { booking_id: row.id, booking_ids: ids.join(",") } },
      success_url: `${SITE.url}/reservation/merci?ref=${row.id}&k=${trackKey(row.id)}`,
      cancel_url: `${SITE.url}/reservation?annule=1`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    await db().from("bookings").update({ stripe_session_id: session.id }).in("id", ids);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("booking", e);
    return NextResponse.json({ error: "Impossible de finaliser la réservation pour le moment." }, { status: 500 });
  }
}
