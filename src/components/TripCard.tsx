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

/** « Aujourd'hui » / « Demain » plutôt que le jour de la semaine (heure de Paris). */
function dayLabel(iso: string) {
  const key = (d: Date) => new Intl.DateTimeFormat("fr-CA", { timeZone: TZ }).format(d);
  const day = key(new Date(iso)), now = new Date();
  if (day === key(now)) return "Aujourd'hui";
  if (day === key(new Date(now.getTime() + 86_400_000))) return "Demain";
  return part(iso, { weekday: "long" });
}

/** Montant avec centimes s'ils ne sont pas nuls (6,80 € et non 7 €). */
const cents = (c: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: c % 100 ? 2 : 0 }).format(c / 100);

/** Ligne d'argent sous le prix : ce que le client doit savoir sans ouvrir le détail. */
function moneyNote(b: Booking): { text: string; cls?: string } | null {
  if (b.status === "pending_payment") return { text: "Paiement en cours de validation", cls: "warn" };
  if (b.status === "cancelled") {
    if (!b.paid_cents) return { text: "Aucun paiement débité" };
    if (b.refunded_cents >= b.paid_cents) return { text: `Remboursé ${cents(b.refunded_cents)}`, cls: "ok" };
    if (b.refunded_cents > 0) return { text: `Remboursé ${cents(b.refunded_cents)} · ${cents(b.paid_cents - b.refunded_cents)} retenus` };
    return { text: "Remboursement en préparation" };
  }
  const rest = b.price_cents - b.paid_cents;
  if (b.paid_cents > 0 && rest > 0) return { text: `Acompte ${cents(b.paid_cents)} · ${cents(rest)} à bord` };
  if (b.discount_cents > 0) return { text: `${b.promo_code ? `Code ${b.promo_code}` : "Remise"} : −${cents(b.discount_cents)}`, cls: "ok" };
  return null;
}

export default function TripCard({ b, rebook = false, trash = false }: { b: Booking; rebook?: boolean; trash?: boolean }) {
  // Date passée mais trajet pas encore clôturé : on ne l'affiche plus comme « à venir ».
  const past = b.status === "confirmed" && new Date(b.pickup_at).getTime() < Date.now();
  const st = past ? { label: "Date passée", cls: "" } : STATUS[b.status] ?? { label: "En traitement", cls: "" };
  const note = moneyNote(b);
  return (
    <article className={`trip-card tc-${b.status}${past ? " tc-past" : ""}${trash ? " tc-trash" : ""}`}>
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
          <span className="tc-when">{dayLabel(b.pickup_at)} · {part(b.pickup_at, { hour: "2-digit", minute: "2-digit" })}</span>
          <span className={`pill ${st.cls}`}>{st.label}</span>
        </div>
        <Route from={b.origin_label} to={b.dest_label} />
        <div className="tc-foot">
          <span className="tc-price">{b.status === "cancelled" ? <s>{euro(b.price_cents)}</s> : euro(b.price_cents)}</span>
          {note && <span className={`tc-note${note.cls ? ` ${note.cls}` : ""}`}>{note.text}</span>}
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
