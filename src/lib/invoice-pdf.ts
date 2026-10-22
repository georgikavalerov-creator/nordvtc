import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { db } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import { getSiteSettings } from "@/lib/content";

// Facture en PDF (mêmes mentions que la facture en ligne), générée côté serveur pour l'envoi à la comptabilité (Tiime).
// Polices standard (pas de fichier à charger) : on remplace les caractères hors WinAnsi.

const clean = (s: unknown) => String(s ?? "").replace(/[  ]/g, " ").replace(/[→]/g, "->").replace(/[’]/g, "'").replace(/[–—]/g, "-").replace(/[^\x20-\x7e -ÿ€]/g, "");
const eur = (c: number) => `${(c / 100).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ")} €`;
const dt = (iso: string, withTime = true) => clean(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(new Date(iso)));
const METHOD: Record<string, string> = { card: "carte bancaire à bord", cash: "espèces à bord", none: "aucun solde à régler" };

function wrap(text: string, font: PDFFont, size: number, max: number) {
  const out: string[] = [];
  for (const para of clean(text).split("\n")) {
    let line = "";
    for (const w of para.split(" ")) {
      const t = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(t, size) > max && line) { out.push(line); line = w; } else line = t;
    }
    out.push(line);
  }
  return out;
}

export async function invoicePdf(bookingId: string): Promise<{ bytes: Uint8Array; filename: string; number: string } | null> {
  const { data: b } = await db().from("bookings").select("*").eq("id", bookingId).maybeSingle();
  if (!b?.invoice_number) return null;
  const cfg = await getSiteSettings();
  const drv = b.driver_id ? (await db().from("drivers").select("*").eq("id", b.driver_id).maybeSingle()).data : null;
  const L = drv
    ? { registeredName: drv.company || drv.name, form: drv.legal_form || "", siret: drv.siret || "", vatNote: drv.vat_note || "", address: drv.address || "", email: drv.email || "" }
    : { registeredName: SITE.legal.registeredName, form: SITE.legal.form, siret: SITE.legal.siret, vatNote: SITE.legal.vatNote, address: SITE.address, email: cfg.email || SITE.email || "contact@nordvtc.fr" };

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Facture ${b.invoice_number}`); pdf.setAuthor(clean(L.registeredName)); pdf.setCreator(SITE.name);
  const page: PDFPage = pdf.addPage([595.28, 841.89]);
  const reg = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.06, 0.07, 0.09), muted = rgb(0.42, 0.45, 0.5), line = rgb(0.88, 0.89, 0.92), blue = rgb(0.12, 0.36, 1);
  const M = 50, W = 595.28 - 2 * M;
  let y = 790;
  const text = (s: string, x: number, yy: number, o: { f?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; right?: boolean } = {}) => {
    const f = o.f ?? reg, size = o.size ?? 10, t = clean(s);
    page.drawText(t, { x: o.right ? x - f.widthOfTextAtSize(t, size) : x, y: yy, size, font: f, color: o.color ?? ink });
  };
  const para = (s: string, o: { f?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; width?: number; x?: number } = {}) => {
    const size = o.size ?? 10;
    for (const l of wrap(s, o.f ?? reg, size, o.width ?? W)) { text(l, o.x ?? M, y, { ...o, size }); y -= size + 4; }
  };

  // En-tête : vendeur à gauche, facture à droite
  page.drawRectangle({ x: 0, y: 841.89 - 6, width: 595.28, height: 6, color: blue });
  text(L.registeredName, M, y, { f: bold, size: 14 }); if (!drv) text(`- ${SITE.name}`, M + bold.widthOfTextAtSize(clean(L.registeredName), 14) + 6, y, { size: 12, color: muted });
  text("FACTURE", 595.28 - M, y, { f: bold, size: 18, right: true, color: blue });
  y -= 18;
  const sellerLines = [L.form, `SIRET ${L.siret}`, L.address, L.email].filter(Boolean);
  let ys = y;
  for (const s of sellerLines) { text(s, M, ys, { color: muted }); ys -= 14; }
  text(`N° ${b.invoice_number}`, 595.28 - M, y, { f: bold, size: 11, right: true });
  text(`Émise le ${dt(b.invoice_issued_at, false)}`, 595.28 - M, y - 15, { right: true, color: muted });
  text(`Prestation du ${dt(b.pickup_at, false)}`, 595.28 - M, y - 29, { right: true, color: muted });
  y = Math.min(ys, y - 40) - 18;

  // Client
  page.drawRectangle({ x: M, y: y - 62, width: W, height: 74, color: rgb(0.96, 0.97, 0.98) });
  text("CLIENT", M + 14, y - 4, { f: bold, size: 8, color: muted });
  const pro = !!b.billing_company;
  const clientLines = [pro ? `${b.billing_company} (contact : ${b.customer_name})` : b.customer_name, b.billing_address, pro && b.billing_siren ? `SIREN ${b.billing_siren}` : "", b.customer_email].filter(Boolean) as string[];
  let yc = y - 20;
  for (const [k, s] of clientLines.slice(0, 4).entries()) { text(s, M + 14, yc, { f: k === 0 ? bold : reg, size: k === 0 ? 11 : 10 }); yc -= 13; }
  y -= 90;

  // Détail du trajet
  const rows: [string, string][] = [
    ["Date et heure de prise en charge", dt(b.pickup_at)],
    ["Lieu de prise en charge", b.origin_label],
    ["Destination", b.dest_label],
    ["Passagers / bagages", `${b.passengers} / ${b.luggage}${b.flight ? ` · ${b.flight}` : ""}`],
  ];
  for (const [k, v] of rows) {
    page.drawLine({ start: { x: M, y: y + 12 }, end: { x: M + W, y: y + 12 }, thickness: 0.6, color: line });
    text(k, M, y, { color: muted });
    const lines = wrap(v, reg, 10, W * 0.6);
    lines.forEach((l, i) => text(l, M + W, y - i * 13, { right: true }));
    y -= 13 * lines.length + 10;
  }
  y -= 14;

  // Montants
  page.drawRectangle({ x: M, y: y - 4, width: W, height: 22, color: rgb(0.06, 0.07, 0.09) });
  text("Désignation", M + 10, y + 3, { f: bold, color: rgb(1, 1, 1) });
  text("Montant TTC", M + W - 10, y + 3, { f: bold, color: rgb(1, 1, 1), right: true });
  y -= 24;
  const amount = (label: string, value: string, strong = false) => {
    text(label, M + 10, y, { f: strong ? bold : reg, size: strong ? 11 : 10 });
    text(value, M + W - 10, y, { f: strong ? bold : reg, size: strong ? 11 : 10, right: true });
    y -= 18;
  };
  amount(`Transport public routier de personnes (VTC), course du ${dt(b.pickup_at, false)}`, eur(b.price_cents + (b.discount_cents ?? 0)));
  if (b.discount_cents > 0) amount(`Remise - code ${b.promo_code}`, `-${eur(b.discount_cents)}`);
  page.drawLine({ start: { x: M, y: y + 10 }, end: { x: M + W, y: y + 10 }, thickness: 0.8, color: line });
  amount("Total TTC", eur(b.price_cents), true);
  amount(`Réglé en ligne (${b.pay_mode === "full" ? "totalité" : "acompte"})`, eur(b.paid_cents));
  amount(`Solde réglé (${METHOD[b.balance_method ?? "none"] ?? "à bord"})`, eur(Math.max(0, b.price_cents - b.paid_cents)));
  y -= 16;

  para(`${L.vatNote}. Paiement comptant, sans escompte.`, { color: muted, size: 9 });
  if (pro) para("En cas de retard de paiement : pénalités au taux de 3 fois le taux d'intérêt légal et indemnité forfaitaire de recouvrement de 40 €.", { color: muted, size: 9 });
  para(`Date de la prestation : ${dt(b.pickup_at, false)}. Référence de réservation : ${String(b.id).slice(0, 8).toUpperCase()}.`, { color: muted, size: 9 });

  text(`${SITE.name} · ${SITE.url.replace(/^https?:\/\//, "")}`, 595.28 / 2 - reg.widthOfTextAtSize(clean(`${SITE.name} · ${SITE.url.replace(/^https?:\/\//, "")}`), 8) / 2, 30, { size: 8, color: muted });

  const number = String(b.invoice_number);
  return { bytes: await pdf.save(), filename: `Facture-${number.replace(/[^\w-]+/g, "-")}.pdf`, number };
}
