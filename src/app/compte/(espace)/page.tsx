import Link from "next/link";
import AccountSearch from "@/components/AccountSearch";
import IconC from "@/components/IconC";
import TripCard, { rebookHref, placeParts, Route } from "@/components/TripCard";
import { getPlaces, requireUser, STATUS, userBookings } from "@/lib/account";
import { docPath } from "@/lib/docsign";
import { euro } from "@/lib/pricing";

export const metadata = { title: "Mon espace" };

const TZ = "Europe/Paris";
const f = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, ...o }).format(new Date(iso));
const ICON = { home: "house", work: "briefcase", other: "pin" } as const;

export default async function Accueil() {
  const user = await requireUser();
  const [list, places] = await Promise.all([userBookings(user), getPlaces(user.id)]);
  const now = Date.now();
  const upcoming = list.filter((b) => new Date(b.pickup_at).getTime() >= now && (b.status === "confirmed" || b.status === "pending_payment")).reverse();
  const done = list.filter((b) => b.status === "completed");
  const spent = done.reduce((s, b) => s + b.price_cents, 0);
  const next = upcoming[0];
  const others = upcoming.slice(1);
  const seen = new Set<string>();
  const recent = done.filter((b) => { const k = `${b.origin_label}|${b.dest_label}`; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 3);
  const st = next ? STATUS[next.status] ?? { label: next.status, cls: "" } : null;

  return (
    <>
      {next ? (
        <section className="acc-next" aria-label="Prochain trajet">
          <div className="acc-next-head">
            <span className="acc-kicker">Prochain trajet</span>
            {st && <span className={`pill ${st.cls}`}>{st.label}</span>}
          </div>
          <div className="acc-next-when">
            <strong>{f(next.pickup_at, { hour: "2-digit", minute: "2-digit" })}</strong>
            <span>{f(next.pickup_at, { weekday: "long", day: "numeric", month: "long" })}</span>
          </div>
          <Route from={next.origin_label} to={next.dest_label} />
          <dl className="acc-next-facts">
            <div><dt>Passagers</dt><dd>{next.passengers}</dd></div>
            <div><dt>Bagages</dt><dd>{next.luggage}</dd></div>
            {next.flight && <div><dt>Vol / train</dt><dd>{next.flight}</dd></div>}
            <div><dt>{next.status === "confirmed" ? "Reste à régler à bord" : "Prix"}</dt><dd>{euro(next.status === "confirmed" ? Math.max(0, next.price_cents - next.paid_cents) : next.price_cents)}</dd></div>
          </dl>
          <div className="trip-actions">
            <Link href={`/compte/trajets/${next.id}`} className="btn small">Voir le détail</Link>
            {next.status === "confirmed" && <Link href={docPath("bon", next.id)} className="btn small ghost">Bon de commande</Link>}
          </div>
        </section>
      ) : (
        <section className="acc-empty">
          <span className="acc-empty-ico"><IconC name="calendar" size={26} /></span>
          <div>
            <strong>Aucun trajet prévu</strong>
            <p className="muted">Le prix s&apos;affiche dès que vous saisissez vos adresses, sans engagement.</p>
          </div>
          <Link href="/reservation" className="btn small">Réserver</Link>
        </section>
      )}

      <dl className="acc-stats">
        <div><dt>Trajets effectués</dt><dd>{done.length}</dd></div>
        <div><dt>À venir</dt><dd>{upcoming.length}</dd></div>
        <div><dt>Total réglé</dt><dd>{euro(spent)}</dd></div>
      </dl>

      <AccountSearch>
        {places.length > 0 && (
          <div className="acc-places">
            {places.map((p) => (
              <Link key={p.id} className="acc-place" href={`/reservation?to=${encodeURIComponent(p.address.slice(0, 120))}`}>
                <IconC name={ICON[p.kind]} size={18} />
                <span>{p.label}</span>
              </Link>
            ))}
          </div>
        )}
      </AccountSearch>

      {others.length > 0 && (
        <>
          <h2 className="acc-h">Également prévus <span>{others.length}</span></h2>
          {others.map((b) => <TripCard key={b.id} b={b} />)}
        </>
      )}

      {recent.length > 0 && (
        <>
          <h2 className="acc-h">Refaire un trajet</h2>
          <div className="acc-rebook">
            {recent.map((b) => {
              const a = placeParts(b.origin_label), c = placeParts(b.dest_label);
              return (
                <Link key={b.id} href={rebookHref(b)} className="rebook">
                  <span className="rebook-ico"><IconC name="route" size={18} /></span>
                  <span className="rebook-txt"><strong>{a.main} → {c.main}</strong><small>Dernière fois le {f(b.pickup_at, { day: "numeric", month: "long" })} · {euro(b.price_cents)}</small></span>
                  <span className="rebook-go" aria-hidden="true">›</span>
                </Link>
              );
            })}
          </div>
        </>
      )}
      {places.length === 0 && (
        <p className="acc-tip"><IconC name="house" size={18} /> Enregistrez votre domicile et votre travail pour réserver plus vite. <Link href="/compte/adresses">Ajouter mes adresses</Link></p>
      )}
    </>
  );
}
