import { db } from "@/lib/supabase";
import { cancelPolicy, fmtDate } from "@/lib/account";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { sendCancellationEmails } from "@/lib/mail";

type Result = { ok?: boolean; error?: string; refunded?: number };

/**
 * Annulation d'une réservation confirmée (rembourse via Stripe si la prise en charge est dans plus de 24 h).
 * L'appelant doit avoir vérifié le droit d'annuler (compte propriétaire OU lien de suivi signé).
 */
export async function cancelBookingCore(bookingId: string, userId?: string): Promise<Result> {
  if (!/^[0-9a-f-]{36}$/.test(bookingId)) return { error: "Réservation introuvable." };
  const { data: b } = await db().from("bookings").select("*").eq("id", bookingId).maybeSingle();
  if (!b) return { error: "Réservation introuvable." };
  if (b.status !== "confirmed") return { error: "Cette réservation ne peut plus être annulée en ligne." };
  const pol = cancelPolicy(b.pickup_at, b.paid_cents, b.price_cents);
  if (!pol.canCancel) return { error: "Le trajet a déjà commencé : contactez-nous." };
  if (pol.refundCents > 0 && (!stripeConfigured() || !b.stripe_payment_intent)) return { error: "Remboursement automatique indisponible : contactez-nous, nous annulons et remboursons pour vous." };

  // On « réserve » l'annulation d'abord (un double clic ne peut pas rembourser deux fois).
  const patch: Record<string, unknown> = { status: "cancelled", cancelled_at: new Date().toISOString(), refunded_cents: pol.refundCents };
  if (userId) patch.user_id = userId;
  const { data: claimed } = await db().from("bookings").update(patch).eq("id", bookingId).eq("status", "confirmed").select("id").maybeSingle();
  if (!claimed) return { error: "Cette réservation vient d'être modifiée." };

  if (pol.refundCents > 0) {
    try {
      await getStripe().refunds.create({ payment_intent: b.stripe_payment_intent, amount: pol.refundCents, metadata: { booking_id: bookingId } }, { idempotencyKey: `cancel-${bookingId}` });
    } catch (e) {
      console.error("refund", e);
      await db().from("bookings").update({ status: "confirmed", cancelled_at: null, refunded_cents: 0 }).eq("id", bookingId);
      return { error: "Le remboursement a échoué : votre réservation est conservée. Contactez-nous." };
    }
  }
  try {
    await sendCancellationEmails({ id: b.id, name: b.customer_name, email: b.customer_email, originLabel: b.origin_label, destLabel: b.dest_label, pickupAtLocal: fmtDate(b.pickup_at), refundedCents: pol.refundCents, keptCents: pol.keptCents });
  } catch (e) { console.error("cancel mail", e); }
  return { ok: true, refunded: pol.refundCents };
}
