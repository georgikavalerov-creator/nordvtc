"use server";
import { revalidatePath } from "next/cache";
import { cancelBookingCore } from "@/lib/cancel";
import { verifyTrack } from "@/lib/docsign";
import { dbConfigured } from "@/lib/supabase";
import { submitClaimCore } from "@/lib/claim";
import { allow } from "@/lib/ratelimit";

/** Annulation sans compte : autorisée uniquement avec le lien de suivi signé (reçu par e-mail ou après le paiement). */
export async function cancelByLink(id: string, k: string): Promise<{ ok?: boolean; error?: string; refunded?: number }> {
  if (!dbConfigured() || !/^[0-9a-f-]{36}$/.test(id) || !verifyTrack(id, k)) return { error: "Lien invalide." };
  const r = await cancelBookingCore(id);
  if (r.ok) revalidatePath(`/reservation/suivi/${id}`);
  return r;
}

/** Demande d'annulation sans frais sur justificatif (train ou vol annulé), sans compte. */
export async function claimByLink(id: string, k: string, _: { ok?: boolean; error?: string } | undefined, form: FormData): Promise<{ ok?: boolean; error?: string }> {
  if (!dbConfigured() || !/^[0-9a-f-]{36}$/.test(id) || !verifyTrack(id, k)) return { error: "Lien invalide." };
  if (!allow(`claim:${id}`, 5, 3_600_000)) return { error: "Trop d'envois, réessayez plus tard." };
  const r = await submitClaimCore(id, form);
  if (r.ok) revalidatePath(`/reservation/suivi/${id}`);
  return r;
}

/** Modification d'une réservation confirmée, sans compte (lien de suivi signé). */
export async function modifyByLink(id: string, k: string, input: unknown, confirm: boolean): Promise<import("@/lib/modify").ModifyResult> {
  if (!dbConfigured() || !/^[0-9a-f-]{36}$/.test(id) || !verifyTrack(id, k)) return { error: "Lien invalide." };
  if (!allow(`modify:${id}`, 30, 15 * 60_000)) return { error: "Trop de tentatives. Réessayez dans quelques minutes." };
  const { modifyBookingCore } = await import("@/lib/modify");
  const r = await modifyBookingCore(id, input, confirm);
  if (r.done) revalidatePath(`/reservation/suivi/${id}`);
  return r;
}
