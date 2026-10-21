import { createHmac } from "node:crypto";
import { SITE } from "./site";

export type CalBooking = {
  id: string; status: string; origin_label: string; dest_label: string; pickup_at: string; duration_s: number | null;
  passengers: number; luggage: number; child_seat: boolean; flight: string | null;
  customer_name: string; customer_phone: string; customer_email: string; notes: string | null;
  price_cents: number; paid_cents: number; admin_note?: string | null; driver?: string | null;
  origin_lat?: number | null; origin_lng?: number | null; dest_lat?: number | null; dest_lng?: number | null;
};

const eur = (c: number) => `${(c / 100).toFixed(2).replace(".", ",")} €`;
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
// Les lignes d'un fichier .ics ne dépassent pas 75 octets : on les replie.
const fold = (l: string) => {
  const out: string[] = []; let cur = "";
  for (const ch of l) { if (Buffer.byteLength(cur + ch) > 74) { out.push(cur); cur = " " + ch; } else cur += ch; }
  out.push(cur); return out.join("\r\n");
};
const map = (label: string, lat?: number | null, lng?: number | null) =>
  lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;

const span = (b: CalBooking) => { const s = new Date(b.pickup_at); return [s, new Date(s.getTime() + Math.max(30, Math.round((b.duration_s || 3600) / 60) + 15) * 60_000)] as const; };
const title = (b: CalBooking) => `🚗 ${b.customer_name} · ${b.origin_label.split(",")[0]} → ${b.dest_label.split(",")[0]}`;

export function details(b: CalBooking): string {
  const rest = Math.max(0, b.price_cents - b.paid_cents);
  return [
    `Client : ${b.customer_name}`,
    `Téléphone : ${b.customer_phone}`,
    b.customer_email ? `E-mail : ${b.customer_email}` : "",
    "",
    `Départ : ${b.origin_label}`,
    `Itinéraire départ : ${map(b.origin_label, b.origin_lat, b.origin_lng)}`,
    `Arrivée : ${b.dest_label}`,
    `Itinéraire arrivée : ${map(b.dest_label, b.dest_lat, b.dest_lng)}`,
    "",
    `Passagers : ${b.passengers} · Bagages : ${b.luggage}${b.child_seat ? " · Siège enfant" : ""}`,
    b.flight ? `Vol / train : ${b.flight}` : "",
    `Prix : ${eur(b.price_cents)} · Réglé : ${eur(b.paid_cents)} · Reste à encaisser : ${eur(rest)}`,
    b.driver ? `Chauffeur : ${b.driver}` : "",
    b.notes ? `Message du client : ${b.notes}` : "",
    b.admin_note ? `Note interne : ${b.admin_note}` : "",
    `Réf. ${b.id.slice(0, 8)}`,
  ].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n");
}

function vevent(b: CalBooking): string[] {
  const [s, e] = span(b);
  const cancelled = b.status === "cancelled";
  return [
    "BEGIN:VEVENT",
    `UID:${b.id}@${new URL(SITE.url).hostname}`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(s)}`, `DTEND:${utc(e)}`,
    `SUMMARY:${esc((cancelled ? "ANNULÉE · " : "") + title(b))}`,
    `LOCATION:${esc(b.origin_label)}`,
    `DESCRIPTION:${esc(details(b))}`,
    `URL:${map(b.origin_label, b.origin_lat, b.origin_lng)}`,
    `STATUS:${cancelled ? "CANCELLED" : "CONFIRMED"}`,
    "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Course dans 1 h", "TRIGGER:-PT1H", "END:VALARM",
    "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Course dans 15 min", "TRIGGER:-PT15M", "END:VALARM",
    "END:VEVENT",
  ];
}

export function calendar(list: CalBooking[], name = "Nord VTC · courses"): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Nord VTC//Courses//FR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(name)}`, "X-WR-TIMEZONE:Europe/Paris", "REFRESH-INTERVAL;VALUE=DURATION:PT1H", "X-PUBLISHED-TTL:PT1H", ...list.flatMap(vevent), "END:VCALENDAR"];
  return lines.map(fold).join("\r\n") + "\r\n";
}

// Lien « Ajouter à Google Agenda » (Android) : ouvre l'application avec tous les champs remplis.
export function googleUrl(b: CalBooking): string {
  const [s, e] = span(b);
  const q = new URLSearchParams({ action: "TEMPLATE", text: title(b), dates: `${utc(s)}/${utc(e)}`, details: details(b), location: b.origin_label });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

// Jeton secret du lien d'abonnement : dérivé de ADMIN_SESSION_SECRET (change si le secret change).
export function agendaToken(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 24) return "";
  return createHmac("sha256", s).update("agenda-feed-v1").digest("hex").slice(0, 40);
}
