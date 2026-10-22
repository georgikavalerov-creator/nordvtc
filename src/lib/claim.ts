import { db } from "@/lib/supabase";
import { fmtDate } from "@/lib/account";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { sendClaimDecision, sendClaimReceived } from "@/lib/mail";

// Annulation sans frais sur justificatif (train ou vol annulé) — CGV art. 5.
// Le client dépose le justificatif ; l'exploitant le vérifie puis accepte (annulation + remboursement total) ou refuse.

export type Claim = { id: string; booking_id: string; created_at: string; kind: "train" | "avion"; file_path: string; note: string | null; status: "pending" | "accepted" | "refused" };

const MAX = 5 * 1024 * 1024;
const TYPES: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif" };
const BUCKET = "justificatifs";

export async function latestClaim(bookingId: string): Promise<Claim | null> {
  const { data } = await db().from("cancel_claims").select("*").eq("booking_id", bookingId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return (data as Claim) ?? null;
}

/** Un justificatif peut être déposé tant que la réservation est confirmée, jusqu'à 24 h après l'heure prévue. */
export const claimOpen = (status: string, pickupAt: string) => status === "confirmed" && new Date(pickupAt).getTime() > Date.now() - 24 * 3_600_000;

export async function submitClaimCore(bookingId: string, form: FormData): Promise<{ ok?: boolean; error?: string }> {
  const { data: b } = await db().from("bookings").select("id,status,pickup_at,customer_name,customer_email,origin_label,dest_label").eq("id", bookingId).maybeSingle();
  if (!b) return { error: "Réservation introuvable." };
  if (!claimOpen(b.status, b.pickup_at)) return { error: "Cette réservation ne peut plus faire l'objet d'une demande en ligne : contactez-nous." };
  const prev = await latestClaim(bookingId);
  if (prev?.status === "pending") return { error: "Une demande est déjà en cours de vérification." };

  const kind = form.get("kind");
  if (kind !== "train" && kind !== "avion") return { error: "Précisez s'il s'agit d'un train ou d'un vol." };
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Ajoutez le justificatif d'annulation (photo ou PDF)." };
  const ext = TYPES[file.type];
  if (!ext) return { error: "Format accepté : PDF, JPG, PNG ou photo du téléphone." };
  if (file.size > MAX) return { error: "Fichier trop lourd (5 Mo maximum)." };
  const note = String(form.get("note") ?? "").trim().slice(0, 500) || null;

  const path = `${bookingId}/${Date.now()}.${ext}`;
  const up = await db().storage.from(BUCKET).upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
  if (up.error) { console.error("claim upload", up.error); return { error: "Envoi du fichier impossible, réessayez." }; }
  const { error } = await db().from("cancel_claims").insert({ booking_id: bookingId, kind, file_path: path, note });
  if (error) { console.error("claim insert", error); return { error: "Enregistrement impossible, réessayez." }; }

  const signed = await db().storage.from(BUCKET).createSignedUrl(path, 7 * 24 * 3600);
  await sendClaimReceived({
    id: b.id, name: b.customer_name, email: b.customer_email, kind: kind === "train" ? "train" : "vol",
    trip: `${b.origin_label} → ${b.dest_label} · ${fmtDate(b.pickup_at)}`, fileUrl: signed.data?.signedUrl ?? "", note,
  }).catch((e) => console.error("claim mail", e));
  return { ok: true };
}

export async function claimFileUrl(path: string): Promise<string> {
  const { data } = await db().storage.from(BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? "";
}

/** Décision de l'exploitant. Accepter = annulation + remboursement de tout ce qui a été payé en ligne. */
export async function decideClaimCore(claimId: string, accept: boolean): Promise<{ ok?: string; error?: string }> {
  const { data: c } = await db().from("cancel_claims").select("*").eq("id", claimId).maybeSingle();
  if (!c || c.status !== "pending") return { error: "Demande déjà traitée." };
  const { data: b } = await db().from("bookings").select("*").eq("id", c.booking_id).maybeSingle();
  if (!b) return { error: "Réservation introuvable." };
  const trip = `${b.origin_label} → ${b.dest_label} · ${fmtDate(b.pickup_at)}`;

  if (!accept) {
    await db().from("cancel_claims").update({ status: "refused", decided_at: new Date().toISOString() }).eq("id", claimId);
    await sendClaimDecision({ id: b.id, name: b.customer_name, email: b.customer_email, trip, accepted: false, refundedCents: 0 }).catch((e) => console.error("claim mail", e));
    return { ok: "Demande refusée, le client est prévenu." };
  }

  const left = (b.paid_cents ?? 0) - (b.refunded_cents ?? 0);
  let refunded = 0;
  if (left > 0 && b.status === "confirmed") {
    if (!stripeConfigured() || !b.stripe_payment_intent) return { error: "Paiement hors Stripe : remboursez le client à la main, puis passez la réservation en « annulée »." };
    try {
      await getStripe().refunds.create({ payment_intent: b.stripe_payment_intent, amount: left, metadata: { booking_id: b.id, reason: "justificatif" } }, { idempotencyKey: `claim-${claimId}` });
      refunded = left;
    } catch (e) {
      console.error("claim refund", e);
      return { error: "Stripe a refusé le remboursement : rien n'a été modifié." };
    }
  }
  await db().from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString(), refunded_cents: (b.refunded_cents ?? 0) + refunded }).eq("id", b.id);
  await db().from("cancel_claims").update({ status: "accepted", decided_at: new Date().toISOString() }).eq("id", claimId);
  await sendClaimDecision({ id: b.id, name: b.customer_name, email: b.customer_email, trip, accepted: true, refundedCents: refunded }).catch((e) => console.error("claim mail", e));
  return { ok: `Annulée et ${(refunded / 100).toFixed(2).replace(".", ",")} € remboursés.` };
}
