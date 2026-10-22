import { db, dbConfigured } from "./supabase";

/** Photo de l'administrateur (réglage « admin_photo »). */
export async function getAdminPhoto(): Promise<string | null> {
  if (!dbConfigured()) return null;
  const { data } = await db().from("settings").select("value").eq("key", "admin_photo").maybeSingle();
  return ((data?.value as { src?: string } | null)?.src) ?? null;
}
