import Link from "next/link";
import { euro } from "@/lib/pricing";
import { STATUS, type Booking } from "@/lib/account";
import { docPath } from "@/lib/docsign";
import HideTrip from "@/components/HideTrip";
import RestoreTrip from "@/components/RestoreTrip";

/** Trajet payé et à venir : le supprimer de l'espace ne l'annule pas (avertissement avant confirmation). */
export const stillBooked = (b: Pick<Booking, "status" | "pickup_at">) =>
  b.status === "confirmed" && new Date(b.pickup_at).getTime() >= Date.now();

export function rebookHref(b: Pick<Booking, "origin_label" | "dest_label">) {
  return `/reservation?from=${encodeURIComponent(b.origin_label.slice(0, 120))}&to=${encodeURIComponent(b.dest_label.slice(0, 120))}`;
}

const TZ = "Europe/Paris";
const part = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, ...o }).format(new Date(iso));
/** « Gare Lille Flandres » + « Lille » à partir d'une adresse complète. */
export function placeParts(label: string) {
  const p = label.split(",").map((s) => s.trim()).filter(Boolean);
  const city = (p.find((x) => /\d{5}/.test(x)) ?? p[1] ?? "").replace(/^\d{5}\s*/, "");
  return { main: p[0] ?? label, sub: city && city !== p[0] ? city : "" };
}

/** Itinéraire vertical départ → arrivée. */
export function Route({ from, to }: { from: string; to: string }) {
  const a = placeParts(from), b = placeParts(to);
  return (
    <ol className="tc-route">
      <li title={from}><strong>{a.main}</strong>{a.sub && <small>{a.sub}</small>}</li>
      <li title={to}><strong>{b.main}</strong>{b.sub && <small>{b.sub}</small>}</li>
    </ol>
  );
}

export default function TripCard({ b, rebook = false, trash = false }: { b: Booking; rebook?: boolean; trash?: boolean }) {
  const st = STATUS[b.status] ?? { label: b.status, cls: "" };
  return (
    <article className={`trip-card tc-${b.status}${trash ? " tc-trash" : ""}`}>
      {trash ? (
        <span className="tc-date">
          <span>{part(b.pickup_at, { day: "numeric" })}</span>
          <small>{part(b.pickup_at, { month: "short" }).replace(".", "")}</small>
        </span>
      ) : (
        <Link href={`/compte/trajets/${b.id}`} className="tc-date" aria-label="Voir le détail du trajet">
          <span>{part(b.pickup_at, { day: "numeric" })}</span>
          <small>{part(b.pickup_at, { month: "short" }).replace(".", "")}</small>
        </Link>
      )}
      <div className="tc-main">
        <div className="tc-top">
          <span className="tc-when">{part(b.pickup_at, { weekday: "long" })} · {part(b.pickup_at, { hour: "2-digit", minute: "2-digit" })}</span>
          <span className={`pill ${st.cls}`}>{st.label}</span>
        </div>
        <Route from={b.origin_label} to={b.dest_label} />
        <div className="tc-foot">
          <span className="tc-price">{euro(b.price_cents)}</span>
          <span className="tc-ref">Réf. {b.id.slice(0, 8).toUpperCase()}</span>
        </div>
        {trash ? (
          <div className="trip-actions tc-actions">
            <RestoreTrip ids={[b.id]} primary />
            {b.user_hidden_at && <span className="tc-ref">Supprimé le {part(b.user_hidden_at, { day: "numeric", month: "long" })}</span>}
          </div>
        ) : (
          <div className="trip-actions tc-actions">
            <Link href={`/compte/trajets/${b.id}`} className="btn small">Détails</Link>
            {(b.status === "confirmed" || b.status === "completed") && <Link href={docPath("bon", b.id)} className="btn small ghost">Bon de commande</Link>}
            {rebook && <Link href={rebookHref(b)} className="btn small ghost">Réserver à nouveau</Link>}
            <HideTrip ids={[b.id]} booked={stillBooked(b)} detailHref={`/compte/trajets/${b.id}`} />
          </div>
        )}
      </div>
    </article>
  );
}
