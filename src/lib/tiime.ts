import { Resend } from "resend";
import { db } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import { getSiteSettings } from "@/lib/content";
import { invoicePdf } from "@/lib/invoice-pdf";

// Comptabilité Tiime : chaque facture émise part en PDF (pièce jointe) vers l'adresse de dépôt Tiime du compte,
// où elle devient automatiquement un justificatif. L'adresse se règle dans Administration → Réglages.

export async function tiimeAddress() {
  const a = ((await getSiteSettings()).tiimeEmail || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a) ? a : "";
}

export async function sendInvoiceToTiime(bookingId: string, force = false): Promise<{ ok: true } | { error: string }> {
  const to = await tiimeAddress();
  if (!to) return { error: "Adresse Tiime non renseignée." };
  const key = process.env.RESEND_API_KEY;
  if (!key) return { error: "Envoi d'e-mails non configuré." };
  if (!force) {
    const { data } = await db().from("bookings").select("tiime_sent_at").eq("id", bookingId).maybeSingle();
    if (data?.tiime_sent_at) return { ok: true };
  }
  const pdf = await invoicePdf(bookingId);
  if (!pdf) return { error: "Facture introuvable." };
  const { error } = await new Resend(key).emails.send({
    from: process.env.MAIL_FROM ?? `${SITE.name} <onboarding@resend.dev>`,
    to,
    subject: `Facture ${pdf.number} - ${SITE.name}`,
    text: `Facture ${pdf.number} en pièce jointe (envoi automatique depuis ${SITE.url.replace(/^https?:\/\//, "")}).`,
    attachments: [{ filename: pdf.filename, content: Buffer.from(pdf.bytes).toString("base64") }],
  });
  if (error) { console.error("tiime", JSON.stringify(error)); return { error: `Envoi refusé : ${error.message}` }; }
  await db().from("bookings").update({ tiime_sent_at: new Date().toISOString() }).eq("id", bookingId);
  return { ok: true };
}

/** Rattrapage : envoie les factures pas encore transmises (par lots). */
export async function sendPendingToTiime(limit = 25) {
  const { data } = await db().from("bookings").select("id").not("invoice_number", "is", null).is("tiime_sent_at", null).order("invoice_issued_at").limit(limit);
  let sent = 0, failed = 0;
  for (const r of data ?? []) { const x = await sendInvoiceToTiime(r.id as string); if ("ok" in x) sent++; else failed++; }
  const { count } = await db().from("bookings").select("id", { count: "exact", head: true }).not("invoice_number", "is", null).is("tiime_sent_at", null);
  return { sent, failed, left: count ?? 0 };
}
