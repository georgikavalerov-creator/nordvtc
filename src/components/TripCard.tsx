import Link from "next/link";
import { euro } from "@/lib/pricing";
import { fmtDate, STATUS, type Booking } from "@/lib/account";

export function rebookHref(b: Pick<Booking, "origin_label" | "dest_label">) {
  return `/reservation?from=${encodeURIComponent(b.origin_label.slice(0, 120))}&to=${encodeURIComponent(b.dest_label.slice(0, 120))}`;
}
export default function TripCard({ b, rebook = false }: { b: Booking; rebook?: boolean }) {
  const st = STATUS[b.status] ?? { label: b.status, cls: "" };
  return (
    <article className="trip-card">
      <header>
        <strong>{fmtDate(b.pickup_at)}</strong>
        <span className={`pill ${st.cls}`}>{st.label}</span>
      </header>
      <p className="trip-route"><span>{b.origin_label}</span><span aria-hidden="true">↓</span><span>{b.dest_label}</span></p>
      <p className="trip-price"><strong>{euro(b.price_cents)}</strong> <span className="muted">· Réf. {b.id.slice(0, 8)}</span></p>
      <div className="trip-actions">
        <Link href={`/compte/trajets/${b.id}`} className="btn small">Détails</Link>
        {rebook && <Link href={rebookHref(b)} className="btn small ghost">Réserver à nouveau</Link>}
      </div>
    </article>
  );
}
