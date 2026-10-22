"use server";
import { revalidatePath } from "next/cache";
import { cancelBookingCore } from "@/lib/cancel";
import { verifyTrack } from "@/lib/docsign";
import { dbConfigured } from "@/lib/supabase";

/** Annulation sans compte : autorisée uniquement avec le lien de suivi signé (reçu par e-mail ou après le paiement). */
export async function cancelByLink(id: string, k: string): Promise<{ ok?: boolean; error?: string; refunded?: number }> {
  if (!dbConfigured() || !/^[0-9a-f-]{36}$/.test(id) || !verifyTrack(id, k)) return { error: "Lien invalide." };
  const r = await cancelBookingCore(id);
  if (r.ok) revalidatePath(`/reservation/suivi/${id}`);
  return r;
}
