import { googleUrl, type CalBooking } from "@/lib/ics";

// Deux boutons : iPhone/Mac (fichier .ics) et Android (Google Agenda pré-rempli).
export default function CalButtons({ b, base = "/admin/ics" }: { b: CalBooking; base?: string }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <a className="btn ghost small" href={`${base}/${b.id}`}>Calendrier iPhone</a>
      <a className="btn ghost small" href={googleUrl(b)} target="_blank" rel="noopener">Google Agenda (Android)</a>
    </div>
  );
}
