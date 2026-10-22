import { SITE } from "./site";

// Gabarit commun à tous les e-mails : tableaux et styles en ligne (compatibles Gmail, Outlook, Apple Mail, mobile).
// Les images sont servies depuis le site en PNG/JPG (le SVG et le WebP ne passent pas partout).

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const CONTACT_EMAIL = SITE.email || "contact@nordvtc.fr";
const FONT = "'Figtree','Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif";
const INK = "#0b0b0c", MUTED = "#6b7280", LINE = "#e7e9ef", BLUE = "#1f5bff", SOFT = "#f5f6f9";
const img = (p: string) => `${SITE.url}/email/${p}`;

type Tone = "blue" | "green" | "red" | "amber" | "grey";
const TONES: Record<Tone, [string, string]> = {
  blue: ["#e8efff", "#1f4fd8"], green: ["#e5f6ec", "#137a3f"], red: ["#fdeaea", "#b42318"], amber: ["#fff4e0", "#a15c00"], grey: ["#eef0f4", "#4b5563"],
};

export const pill = (label: string, tone: Tone = "blue") => {
  const [bg, fg] = TONES[tone];
  return `<span style="display:inline-block;background:${bg};color:${fg};font:700 11px/1 ${FONT};letter-spacing:.08em;text-transform:uppercase;padding:7px 10px;border-radius:999px">${esc(label)}</span>`;
};

export const p = (html: string, style = "") => `<p style="margin:0 0 14px;font:400 15px/1.6 ${FONT};color:#2b2f36;${style}">${html}</p>`;
export const small = (html: string) => `<p style="margin:0 0 10px;font:400 13px/1.55 ${FONT};color:${MUTED}">${html}</p>`;
export const h2 = (t: string) => `<p style="margin:22px 0 10px;font:700 12px/1 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:${MUTED}">${esc(t)}</p>`;

/** Bouton « à l'épreuve des balles » (fonctionne aussi dans Outlook). */
export const button = (href: string, label: string, kind: "primary" | "dark" | "light" = "primary") => {
  const [bg, fg, bd] = kind === "primary" ? [BLUE, "#ffffff", BLUE] : kind === "dark" ? [INK, "#ffffff", INK] : ["#ffffff", INK, "#d5d9e2"];
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 8px 10px 0"><tr><td style="border-radius:12px;background:${bg};border:1px solid ${bd}"><a href="${esc(href)}" style="display:inline-block;padding:13px 22px;font:700 15px/1 ${FONT};color:${fg};text-decoration:none;border-radius:12px">${esc(label)}</a></td></tr></table>`;
};
export const buttons = (...b: string[]) => `<div style="margin:20px 0 8px">${b.join("")}</div>`;

/** Carte trajet : départ → arrivée, avec la date de prise en charge. */
export const tripCard = (from: string, to: string, when?: string) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SOFT};border-radius:14px;margin:6px 0 18px">
  <tr><td style="padding:18px 20px">
    ${when ? `<p style="margin:0 0 14px;font:700 15px/1.3 ${FONT};color:${INK}">${esc(when)}</p>` : ""}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="22" valign="top" style="padding-top:4px"><div style="width:10px;height:10px;border-radius:50%;border:2px solid ${INK};background:#fff"></div></td>
        <td style="padding:0 0 4px"><p style="margin:0;font:600 11px/1 ${FONT};letter-spacing:.08em;text-transform:uppercase;color:${MUTED}">Départ</p><p style="margin:4px 0 0;font:600 15px/1.4 ${FONT};color:${INK}">${esc(from)}</p></td>
      </tr>
      <tr><td width="22" style="padding:0 0 0 6px"><div style="width:2px;height:18px;background:#c9cfdb"></div></td><td></td></tr>
      <tr>
        <td width="22" valign="top" style="padding-top:4px"><div style="width:14px;height:14px;border-radius:50%;background:${BLUE}"></div></td>
        <td><p style="margin:0;font:600 11px/1 ${FONT};letter-spacing:.08em;text-transform:uppercase;color:${MUTED}">Arrivée</p><p style="margin:4px 0 0;font:600 15px/1.4 ${FONT};color:${INK}">${esc(to)}</p></td>
      </tr>
    </table>
  </td></tr>
</table>`;

/** Tableau libellé / valeur (valeurs déjà échappées ou HTML sûr). */
export const rows = (items: ([string, string] | null | false | undefined | "")[]) => {
  const list = items.filter(Boolean) as [string, string][];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;border-top:1px solid ${LINE}">${list
    .map(([k, v]) => `<tr><td style="padding:11px 12px 11px 0;border-bottom:1px solid ${LINE};font:400 14px/1.45 ${FONT};color:${MUTED};width:42%" valign="top">${esc(k)}</td><td style="padding:11px 0;border-bottom:1px solid ${LINE};font:600 14px/1.45 ${FONT};color:${INK};text-align:right" valign="top">${v}</td></tr>`)
    .join("")}</table>`;
};

/** Récapitulatif de prix ; la dernière ligne est mise en avant. */
export const priceBox = (items: [string, string][]) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${LINE};border-radius:14px;margin:4px 0 18px">
  ${items.map(([k, v], i) => {
    const last = i === items.length - 1;
    return `<tr><td style="padding:${last ? "14px 18px 16px" : i === 0 ? "16px 18px 6px" : "6px 18px"};${last ? `border-top:1px solid ${LINE};` : ""}font:${last ? 700 : 400} ${last ? 16 : 14}px/1.4 ${FONT};color:${last ? INK : MUTED}">${esc(k)}</td><td style="padding:${last ? "14px 18px 16px" : i === 0 ? "16px 18px 6px" : "6px 18px"};${last ? `border-top:1px solid ${LINE};` : ""}text-align:right;font:${last ? 800 : 600} ${last ? 18 : 14}px/1.4 ${FONT};color:${INK}">${esc(v)}</td></tr>`;
  }).join("")}
</table>`;

/** Message cité (discussion, demande de contact). */
export const quote = (text: string, who?: string) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 18px">
  <tr><td style="background:${SOFT};border-left:4px solid ${BLUE};border-radius:4px 14px 14px 4px;padding:16px 18px">
    ${who ? `<p style="margin:0 0 6px;font:700 12px/1 ${FONT};letter-spacing:.06em;text-transform:uppercase;color:${MUTED}">${esc(who)}</p>` : ""}
    <p style="margin:0;font:400 16px/1.6 ${FONT};color:${INK};white-space:pre-wrap">${esc(text)}</p>
  </td></tr>
</table>`;

/** Encadré d'information (conseil, avertissement). */
export const note = (html: string, tone: Tone = "blue") => {
  const [bg, fg] = TONES[tone];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 18px"><tr><td style="background:${bg};border-radius:12px;padding:14px 16px;font:500 14px/1.55 ${FONT};color:${fg}">${html}</td></tr></table>`;
};

/** Signature du chauffeur avec photo. */
export const signature = (phone?: string) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 4px">
  <tr>
    <td valign="middle" style="padding-right:14px"><img src="${img("chauffeur.jpg")}" width="52" height="52" alt="" style="display:block;border-radius:50%;width:52px;height:52px"></td>
    <td valign="middle">
      <p style="margin:0;font:700 15px/1.3 ${FONT};color:${INK}">Georgi Kavalerov</p>
      <p style="margin:2px 0 0;font:400 13px/1.4 ${FONT};color:${MUTED}">Votre chauffeur · ${esc(SITE.name)}${phone ? ` · <a href="tel:${esc(phone.replace(/\s/g, ""))}" style="color:${MUTED};text-decoration:none;white-space:nowrap">${esc(phone)}</a>` : ""}</p>
    </td>
  </tr>
</table>`;

/**
 * Enveloppe complète. `preheader` = aperçu affiché dans la boîte de réception.
 * `audience` "admin" : pied de page réduit (e-mails internes au chauffeur).
 */
export function layout(o: { preheader: string; badge?: string; title: string; body: string; audience?: "client" | "admin" }) {
  const admin = o.audience === "admin";
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(o.title)}</title>
<style>@media (max-width:620px){.nv-pad{padding-left:22px!important;padding-right:22px!important}.nv-h1{font-size:24px!important}.nv-outer{padding:0!important}.nv-card{border-radius:0!important}}a{color:${BLUE}}</style></head>
<body style="margin:0;padding:0;background:#eceef3;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(o.preheader)}${"&#8199;&#65279;&#847; ".repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eceef3">
  <tr><td align="center" class="nv-outer" style="padding:28px 12px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="nv-card" style="width:100%;max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden">
      <tr><td style="background:#000000;padding:22px 32px" class="nv-pad">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td><a href="${SITE.url}" style="text-decoration:none"><img src="${img("logo-clair.png")}" width="228" height="38" alt="${esc(SITE.name)} — chauffeur privé à Lille" style="display:block;border:0;width:228px;height:38px"></a></td>
          ${admin ? `<td align="right" style="font:600 11px/1 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:#8b8f99">Espace chauffeur</td>` : ""}
        </tr></table>
      </td></tr>
      <tr><td class="nv-pad" style="padding:32px 36px 12px">
        ${o.badge ? `<div style="margin:0 0 14px">${o.badge}</div>` : ""}
        <h1 class="nv-h1" style="margin:0 0 16px;font:800 27px/1.2 ${FONT};letter-spacing:-.01em;color:${INK}">${esc(o.title)}</h1>
        ${o.body}
      </td></tr>
      <tr><td class="nv-pad" style="padding:8px 36px 30px">
        <div style="height:1px;background:${LINE};margin:8px 0 18px"></div>
        ${admin
          ? `<p style="margin:0;font:400 12px/1.6 ${FONT};color:#9aa0ab">E-mail automatique du site <a href="${SITE.url}/admin" style="color:#9aa0ab">${SITE.url.replace(/^https?:\/\//, "")}</a></p>`
          : `<p style="margin:0 0 6px;font:400 12px/1.6 ${FONT};color:#9aa0ab">Une question ? Répondez simplement à cet e-mail ou écrivez à <a href="mailto:${CONTACT_EMAIL}" style="color:#6b7280">${CONTACT_EMAIL}</a>.</p>
             <p style="margin:0;font:400 12px/1.6 ${FONT};color:#9aa0ab">${esc(SITE.name)} · Chauffeur privé · ${esc(SITE.address)}<br>© ${year} · <a href="${SITE.url}" style="color:#9aa0ab">nordvtc.fr</a> · <a href="${SITE.url}/cgv" style="color:#9aa0ab">CGV</a> · <a href="${SITE.url}/confidentialite" style="color:#9aa0ab">Confidentialité</a></p>`}
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

/** Version texte (lisible sans HTML, améliore aussi la délivrabilité). */
export const toText = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<div style="display:none[\s\S]*?<\/div>/i, "")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, h, t) => { const txt = t.replace(/<[^>]+>/g, "").trim(); return txt && !h.startsWith("mailto:") && !h.startsWith("tel:") && txt !== h ? `${txt} : ${h}` : txt; })
    .replace(/<\/(p|h1|tr|table|div)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/td>/gi, "  ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
