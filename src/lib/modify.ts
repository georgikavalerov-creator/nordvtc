import { z } from "zod";
import { db, getPricing } from "@/lib/supabase";
import { routeSummary } from "@/lib/here";
import { trustPlace } from "@/lib/place-sign";
import { computeQuote, parisToUtc } from "@/lib/pricing";
import { applyDiscount } from "@/lib/promo";
import { fmtDate } from "@/lib/account";
import { sendModificationEmails } from "@/lib/mail";

// Modification d'une réservation confirmée par le client (espace client ou lien de suivi signé).
// Règle : le prix est recalculé côté serveur. S'il est inférieur à ce qui a déjà été réglé en ligne,
// le prix retenu est le montant déjà réglé (pas de remboursement automatique : le client peut nous contacter).

const place = z.object({ label: z.string().min(3).max(300), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), sig: z.string().max(40).optional() });
export const modifySchema = z.object({
  origin: place,
  dest: place,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  passengers: z.number().int().min(1).max(4),
  luggage: z.number().int().min(0).max(12),
  childSeat: z.boolean(),
  pet: z.boolean(),
  flight: z.string().trim().max(30).optional(),
  notes: z.string().trim().max(500).optional(),
});
export type ModifyInput = z.infer<typeof modifySchema>;
export type ModifyResult = {
  ok?: boolean; error?: string; done?: boolean;
  newPriceCents?: number; finalCents?: number; paidCents?: number; restCents?: number; oldPriceCents?: number;
  floor?: boolean; distanceKm?: number; minutes?: number;
};

/** Un trajet confirmé se modifie en ligne jusqu'au délai minimum de réservation (2 h par défaut). */
export async function canModify(status: string, pickupAt: string) {
  if (status !== "confirmed") return false;
  const pricing = await getPricing();
  return new Date(pickupAt).getTime() > Date.now() + pricing.minLeadHours * 3_600_000;
}

export async function modifyBookingCore(bookingId: string, raw: unknown, confirm: boolean): Promise<ModifyResult> {
  const parsed = modifySchema.safeParse(raw);
  if (!parsed.success) return { error: "Merci de vérifier les champs." };
  const d = parsed.data;
  const { data: b } = await db().from("bookings").select("*").eq("id", bookingId).maybeSingle();
  if (!b) return { error: "Réservation introuvable." };
  if (b.status !== "confirmed") return { error: "Seule une réservation confirmée peut être modifiée en ligne." };
  const pricing = await getPricing();
  const now = Date.now();
  const lead = pricing.minLeadHours * 3_600_000;
  if (new Date(b.pickup_at).getTime() < now + lead) return { error: `La prise en charge est dans moins de ${pricing.minLeadHours} h : contactez-nous pour toute modification.` };

  // Adresses : inchangées = coordonnées enregistrées ; nouvelles = signature du site ou recalcul depuis le libellé.
  const keep = (p: typeof d.origin, label: string, lat: number, lng: number) => p.label === label && !p.sig ? { label, lat, lng } : null;
  const origin = keep(d.origin, b.origin_label, b.origin_lat, b.origin_lng) ?? await trustPlace(d.origin);
  const dest = keep(d.dest, b.dest_label, b.dest_lat, b.dest_lng) ?? await trustPlace(d.dest);
  if (!origin || !dest) return { error: "Adresse non reconnue : choisissez-la dans la liste proposée." };

  const pickup = parisToUtc(d.date, d.time);
  if (Number.isNaN(pickup.getTime()) || pickup.getTime() < now + lead) return { error: `La nouvelle heure doit être au moins ${pricing.minLeadHours} h après maintenant.` };
  if (pickup.getTime() > now + 365 * 86_400_000) return { error: "Date trop lointaine." };
  const { data: blocked } = await db().from("blocked_periods").select("id").lte("start_at", pickup.toISOString()).gt("end_at", pickup.toISOString()).limit(1);
  if (blocked?.length) return { error: "Nous ne sommes pas disponibles à cette date. Choisissez un autre créneau ou contactez-nous." };

  const route = await routeSummary(origin, dest);
  if (route.distanceM / 1000 > pricing.maxDistanceKm) return { error: "Trajet très long : contactez-nous pour un devis." };
  let quote = computeQuote(route.distanceM, route.durationS, Number(d.time.slice(0, 2)), pricing);
  if (b.discount_cents > 0) quote = applyDiscount(quote, Math.min(b.discount_cents, quote.priceCents), pricing);
  const newPriceCents = quote.priceCents;
  const paidCents = b.paid_cents as number;
  const finalCents = Math.max(newPriceCents, paidCents);
  const preview: ModifyResult = {
    ok: true, newPriceCents, finalCents, paidCents, oldPriceCents: b.price_cents, restCents: finalCents - paidCents,
    floor: newPriceCents < paidCents, distanceKm: Math.round(route.distanceM / 1000), minutes: Math.round(route.durationS / 60),
  };
  if (!confirm) return preview;

  const flight = d.flight?.trim() || null;
  const notes = d.notes?.trim() || null;
  const { data: upd } = await db().from("bookings").update({
    origin_label: origin.label, origin_lat: origin.lat, origin_lng: origin.lng,
    dest_label: dest.label, dest_lat: dest.lat, dest_lng: dest.lng,
    pickup_at: pickup.toISOString(), passengers: d.passengers, luggage: d.luggage,
    child_seat: d.childSeat, pet: d.pet, flight, notes,
    distance_m: Math.round(route.distanceM), duration_s: Math.round(route.durationS),
    price_cents: finalCents, modified_at: new Date().toISOString(),
  }).eq("id", bookingId).eq("status", "confirmed").select("id").maybeSingle();
  if (!upd) return { error: "Cette réservation vient d'être modifiée. Rechargez la page." };

  try {
    await sendModificationEmails({
      id: b.id, name: b.customer_name, email: b.customer_email, phone: b.customer_phone,
      before: { originLabel: b.origin_label, destLabel: b.dest_label, pickupAtLocal: fmtDate(b.pickup_at), priceCents: b.price_cents },
      after: { originLabel: origin.label, destLabel: dest.label, pickupAtLocal: fmtDate(pickup.toISOString()), priceCents: finalCents },
      passengers: d.passengers, luggage: d.luggage, childSeat: d.childSeat, pet: d.pet, flight, notes,
      paidCents, floor: preview.floor ?? false, quotedCents: newPriceCents,
    });
  } catch (e) { console.error("modify mail", e); }
  return { ...preview, done: true };
}
