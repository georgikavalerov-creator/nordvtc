import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/supabase";
import { sendBookingEmails } from "@/lib/mail";
import { docPath } from "@/lib/docsign";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Non configuré" }, { status: 400 });

  const body = await req.text(); // corps brut indispensable pour vérifier la signature
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const id = s.metadata?.booking_id;
      if (id && s.payment_status === "paid") {
        // Idempotent : on ne confirme qu'une réservation encore en attente de paiement.
        const { data: b } = await db()
          .from("bookings")
          .update({
            status: "confirmed",
            paid_cents: s.amount_total ?? 0,
            stripe_payment_intent: typeof s.payment_intent === "string" ? s.payment_intent : null,
            paid_at: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("status", "pending_payment")
          .select("*")
          .maybeSingle();
        if (b) {
          const when = new Intl.DateTimeFormat("fr-FR", {
            timeZone: "Europe/Paris",
            dateStyle: "full",
            timeStyle: "short",
          }).format(new Date(b.pickup_at));
          await db().rpc("issue_order", { bid: b.id });
          await sendBookingEmails({
            orderUrl: `${SITE.url}${docPath("bon", b.id)}`,
            id: b.id,
            name: b.customer_name,
            email: b.customer_email,
            phone: b.customer_phone,
            originLabel: b.origin_label,
            destLabel: b.dest_label,
            pickupAtLocal: when,
            passengers: b.passengers,
            luggage: b.luggage,
            childSeat: b.child_seat,
            flight: b.flight,
            notes: b.notes,
            priceCents: b.price_cents,
            paidCents: b.paid_cents,
          }).catch((e) => console.error("mail", e));
        }
      }
    } else if (event.type === "checkout.session.expired") {
      const s = event.data.object as Stripe.Checkout.Session;
      const id = s.metadata?.booking_id;
      if (id) await db().from("bookings").update({ status: "expired" }).eq("id", id).eq("status", "pending_payment");
    }
  } catch (e) {
    console.error("webhook", e);
    return NextResponse.json({ error: "Erreur de traitement" }, { status: 500 }); // Stripe réessaiera
  }
  return NextResponse.json({ received: true });
}
