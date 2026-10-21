"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { currentUser, authClient } from "@/lib/auth";
import { db, dbConfigured } from "@/lib/supabase";
import { normalizePhone } from "@/lib/callback";
import { cancelPolicy, fmtDate } from "@/lib/account";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { sendCancellationEmails } from "@/lib/mail";

async function me() {
  const u = await currentUser();
  if (!u || !dbConfigured()) throw new Error("non autorisé");
  return u;
}

export async function saveProfile(_: unknown, f: FormData): Promise<{ ok?: boolean; error?: string }> {
  const u = await me();
  const p = z.object({
    full_name: z.string().trim().max(80),
    phone: z.string().trim().max(25),
    country: z.string().length(2).default("FR"),
    default_passengers: z.coerce.number().int().min(1).max(4),
  }).safeParse(Object.fromEntries(f));
  if (!p.success) return { error: "Vérifiez les champs." };
  let phone: string | null = null;
  if (p.data.phone) {
    phone = normalizePhone(p.data.phone, p.data.country);
    if (!phone) return { error: "Numéro de mobile invalide pour le pays choisi." };
  }
  const { error } = await db().from("profiles").upsert({
    user_id: u.id, full_name: p.data.full_name || null, phone,
    default_passengers: p.data.default_passengers,
    default_child_seat: f.get("default_child_seat") === "on",
    marketing_opt_in: f.get("marketing_opt_in") === "on",
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/compte", "layout");
  return { ok: true };
}

export async function savePlace(input: { kind: "home" | "work" | "other"; label: string; address: string; lat: number; lng: number }) {
  const u = await me();
  const p = z.object({
    kind: z.enum(["home", "work", "other"]), label: z.string().trim().min(1).max(40),
    address: z.string().trim().min(3).max(300), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180),
  }).parse(input);
  if (p.kind !== "other") await db().from("saved_places").delete().eq("user_id", u.id).eq("kind", p.kind); // un seul domicile / travail
  else {
    const { count } = await db().from("saved_places").select("id", { count: "exact", head: true }).eq("user_id", u.id);
    if ((count ?? 0) >= 12) return { error: "12 adresses maximum." };
  }
  await db().from("saved_places").insert({ user_id: u.id, ...p });
  revalidatePath("/compte/adresses");
  return {};
}

export async function deletePlace(id: string) {
  const u = await me();
  await db().from("saved_places").delete().eq("id", id).eq("user_id", u.id);
  revalidatePath("/compte/adresses");
}

export async function rateTrip(bookingId: string, stars: number, comment: string) {
  const u = await me();
  const s = z.number().int().min(1).max(5).parse(stars);
  const { data: b } = await db().from("bookings").select("id,status,user_id,customer_email").eq("id", bookingId).maybeSingle();
  const mine = b && (b.user_id === u.id || (u.email_confirmed_at && b.customer_email?.toLowerCase() === (u.email ?? "").toLowerCase()));
  if (!mine || b.status !== "completed") return { error: "Avis impossible." };
  await db().from("trip_ratings").upsert({ booking_id: bookingId, user_id: u.id, stars: s, comment: comment.slice(0, 500) || null });
  revalidatePath(`/compte/trajets/${bookingId}`);
  return {};
}

export async function deleteAccount(f: FormData) {
  const u = await me();
  if (f.get("confirm") !== "SUPPRIMER") return;
  await db().from("bookings").update({ user_id: null }).eq("user_id", u.id); // les réservations restent pour la comptabilité
  await db().auth.admin.deleteUser(u.id);
  await (await authClient()).auth.signOut();
  redirect("/?compte=supprime");
}

/** Annulation en un clic : rembourse via Stripe si la prise en charge est dans plus de 24 h. */
export async function cancelBooking(bookingId: string): Promise<{ ok?: boolean; error?: string; refunded?: number }> {
  const u = await me();
  if (!/^[0-9a-f-]{36}$/.test(bookingId)) return { error: "Réservation introuvable." };
  const { data: b } = await db().from("bookings").select("*").eq("id", bookingId).maybeSingle();
  const mine = b && (b.user_id === u.id || (u.email_confirmed_at && b.customer_email?.toLowerCase() === (u.email ?? "").toLowerCase()));
  if (!b || !mine) return { error: "Réservation introuvable." };
  if (b.status !== "confirmed") return { error: "Cette réservation ne peut plus être annulée en ligne." };
  const pol = cancelPolicy(b.pickup_at, b.paid_cents);
  if (!pol.canCancel) return { error: "Le trajet a déjà commencé : contactez-nous." };
  if (pol.refundCents > 0 && (!stripeConfigured() || !b.stripe_payment_intent)) return { error: "Remboursement automatique indisponible : contactez-nous, nous annulons et remboursons pour vous." };

  // On « réserve » l'annulation d'abord (un double clic ne peut pas rembourser deux fois).
  const { data: claimed } = await db().from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString(), refunded_cents: pol.refundCents, user_id: u.id })
    .eq("id", bookingId).eq("status", "confirmed").select("id").maybeSingle();
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
  revalidatePath("/compte", "layout");
  return { ok: true, refunded: pol.refundCents };
}
