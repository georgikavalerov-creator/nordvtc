import Link from "next/link";
import { euro } from "@/lib/pricing";
import { fmtDate, STATUS, type Booking } from "@/lib/account";
import { docPath } from "@/lib/docsign";
import HideTrip from "@/components/HideTrip";

/** Trajet qu'on peut retirer de son espace : terminé, annulé, non payé ou passé (un trajet à venir s'annule d'abord). */
export const removable = (b: Pick<Booking, "status" | "pickup_at">) =>
  b.status === "completed" || b.status === "cancelled" || b.status === "pending_payment" || new Date(b.pickup_at).getTime() < Date.now();

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
        {(b.status === "confirmed" || b.status === "completed") && <Link href={docPath("bon", b.id)} className="btn small ghost">Bon de commande</Link>}
        {rebook && <Link href={rebookHref(b)} className="btn small ghost">Réserver à nouveau</Link>}
        {removable(b) && <HideTrip ids={[b.id]} />}
      </div>
    </article>
  );
}
