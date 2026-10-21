import { getSiteSettings } from "./content";
import { createHash } from "node:crypto";
import { Resend } from "resend";
import { db, dbConfigured } from "./supabase";
import { SITE } from "./site";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Enregistre la demande, prévient le chauffeur, et renvoie le numéro à afficher (lu côté serveur uniquement). */
export async function saveLeadAndReveal(l: { name: string; phone: string; need?: string; ip: string; verified: boolean }) {
  const ipHash = createHash("sha256").update(l.ip).digest("hex").slice(0, 16);
  if (dbConfigured()) {
    const { error } = await db().from("callback_leads").insert({
      name: l.name, phone: l.phone, need: l.need ?? null, verified: l.verified, ip_hash: ipHash,
    });
    if (error) console.error("callback_leads", error.message);
  }
  const key = process.env.RESEND_API_KEY, to = process.env.MAIL_NOTIFY_TO;
  if (key && to) {
    try {
      await new Resend(key).emails.send({
        from: process.env.MAIL_FROM ?? `${SITE.name} <onboarding@resend.dev>`,
        to,
        subject: `À rappeler : ${l.name} ${l.phone}${l.verified ? " (numéro vérifié)" : ""}`,
        html: `<p><strong>${esc(l.name)}</strong> — <a href="tel:${esc(l.phone)}">${esc(l.phone)}</a>${l.verified ? " ✔ vérifié par SMS" : ""}</p>${l.need ? `<p>${esc(l.need)}</p>` : ""}`,
      });
    } catch (e) { console.error("callback mail", e); }
  }
  return (await getSiteSettings()).driverPhone || (process.env.DRIVER_PHONE ?? "");
}
