import Link from "next/link";
import AccountSearch from "@/components/AccountSearch";
import TripCard, { rebookHref } from "@/components/TripCard";
import { getPlaces, requireUser, userBookings } from "@/lib/account";
import { euro } from "@/lib/pricing";

export const metadata = { title: "Mon espace" };

export default async function Accueil() {
  const user = await requireUser();
  const [list, places] = await Promise.all([userBookings(user), getPlaces(user.id)]);
  const now = Date.now();
  const upcoming = list.filter((b) => new Date(b.pickup_at).getTime() >= now && (b.status === "confirmed" || b.status === "pending_payment")).reverse();
  const done = list.filter((b) => b.status === "completed");
  const spent = done.reduce((s, b) => s + b.price_cents, 0);
  const recent = done.slice(0, 3);
  return (
    <>
      <AccountSearch>
        {places.length > 0 && (
          <div className="chips">
            {places.map((p) => (
              <Link key={p.id} className="chip" href={`/reservation?to=${encodeURIComponent(p.address.slice(0, 120))}`}>
                {p.kind === "home" ? "🏠" : p.kind === "work" ? "💼" : "📍"} {p.label}
              </Link>
            ))}
          </div>
        )}
      </AccountSearch>

      <div className="acc-stats">
        <div><strong>{done.length}</strong><span>trajet{done.length > 1 ? "s" : ""} effectué{done.length > 1 ? "s" : ""}</span></div>
        <div><strong>{euro(spent)}</strong><span>dépensés</span></div>
        <div><strong>{upcoming.length}</strong><span>à venir</span></div>
      </div>

      <h2 className="acc-h">Prochains trajets</h2>
      {upcoming.length ? upcoming.map((b) => <TripCard key={b.id} b={b} />) : <p className="muted">Aucun trajet à venir. <Link href="/reservation">Réservez le prochain.</Link></p>}

      {recent.length > 0 && (
        <>
          <h2 className="acc-h">Refaire un trajet</h2>
          <div className="acc-rebook">
            {recent.map((b) => (
              <Link key={b.id} href={rebookHref(b)} className="rebook">
                <strong>{b.origin_label.split(",")[0]} → {b.dest_label.split(",")[0]}</strong>
                <span className="muted">Réserver à nouveau</span>
              </Link>
            ))}
          </div>
        </>
      )}
      {places.length === 0 && <p className="notice" style={{ marginTop: 24 }}>Enregistrez votre domicile et votre travail pour réserver en un clic. <Link href="/compte/adresses">Ajouter mes adresses</Link></p>}
    </>
  );
}
