import { getSiteSettings } from "./content";
import { createHash } from "node:crypto";
import { sendCallbackNotice } from "./mail";
import { db, dbConfigured } from "./supabase";


/** Enregistre la demande, prévient le chauffeur, et renvoie le numéro à afficher (lu côté serveur uniquement). */
export async function saveLeadAndReveal(l: { name: string; phone: string; need?: string; ip: string; verified: boolean }) {
  const ipHash = createHash("sha256").update(l.ip).digest("hex").slice(0, 16);
  if (dbConfigured()) {
    const { error } = await db().from("callback_leads").insert({
      name: l.name, phone: l.phone, need: l.need ?? null, verified: l.verified, ip_hash: ipHash,
    });
    if (error) console.error("callback_leads", error.message);
  }
  try { await sendCallbackNotice(l); } catch (e) { console.error("callback mail", e); }
  return (await getSiteSettings()).driverPhone || (process.env.DRIVER_PHONE ?? "");
}
