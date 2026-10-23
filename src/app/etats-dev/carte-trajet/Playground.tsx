import Link from "next/link";
import TripCard from "@/components/TripCard";
import type { Booking } from "@/lib/account";

const H = 3_600_000, D = 24 * H;
const at = (ms: number, hour?: number) => {
  const d = new Date(Date.now() + ms);
  if (hour !== undefined) d.setHours(hour, 15, 0, 0);
  return d.toISOString();
};

const base: Booking = {
  id: "7f3c9a21-5b8e-4d2a-9c41-0e6b2f8d1a37", status: "confirmed", created_at: at(-6 * D),
  origin_label: "Gare Lille Flandres, Place de la Gare, 59000 Lille",
  dest_label: "Aéroport de Lille-Lesquin, Route de l'Aéroport, 59810 Lesquin",
  pickup_at: at(3 * D, 6), passengers: 2, luggage: 2, flight: "V7 2142", child_seat: false, pet: false, notes: null,
  price_cents: 6800, paid_cents: 6800, charge_cents: 6800, pay_mode: "full", distance_m: 11800, duration_s: 1260,
  customer_name: "Camille Dufresne", customer_email: "camille.dufresne@orange.fr", customer_phone: "+33 6 42 18 77 05",
  paid_at: at(-6 * D), promo_code: null, discount_cents: 0, refunded_cents: 0, user_hidden_at: null,
};

type S = { key: string; label: string; b: Booking; rebook?: boolean; trash?: boolean };
const GROUPS: { title: string; states: S[] }[] = [
  { title: "Paiement", states: [
    { key: "paiement-attente", label: "Paiement en attente", b: { ...base, status: "pending_payment", paid_cents: 0, charge_cents: 0, paid_at: null } },
    { key: "acompte", label: "Acompte versé (30 %)", b: { ...base, pay_mode: "deposit", paid_cents: 2000, charge_cents: 2000 } },
    { key: "code-promo", label: "Code promo appliqué", b: { ...base, promo_code: "BIENVENUE10", discount_cents: 680, price_cents: 6120, paid_cents: 6120 } },
  ] },
  { title: "Échéance", states: [
    { key: "a-venir", label: "À venir (dans 3 jours)", b: base },
    { key: "aujourdhui", label: "Aujourd'hui, dans 2 h", b: { ...base, pickup_at: at(2 * H) } },
    { key: "nuit", label: "Départ de nuit (4 h 30)", b: { ...base, pickup_at: at(5 * D, 4), price_cents: 8160, paid_cents: 8160 } },
    { key: "passe-confirme", label: "Date passée, encore « confirmée »", b: { ...base, pickup_at: at(-2 * D, 9) } },
    { key: "terminee", label: "Terminée", b: { ...base, status: "completed", pickup_at: at(-12 * D, 9) }, rebook: true },
  ] },
  { title: "Annulation", states: [
    { key: "annulee-remboursee", label: "Annulée, remboursée", b: { ...base, status: "cancelled", refunded_cents: 6800 }, rebook: true },
    { key: "annulee-partielle", label: "Annulée < 24 h (acompte gardé)", b: { ...base, status: "cancelled", pickup_at: at(-1 * D, 7), refunded_cents: 4800 }, rebook: true },
    { key: "annulee-impayee", label: "Annulée avant paiement", b: { ...base, status: "cancelled", paid_cents: 0, charge_cents: 0, paid_at: null }, rebook: true },
  ] },
  { title: "Corbeille", states: [
    { key: "corbeille", label: "Dans la corbeille", b: { ...base, status: "completed", pickup_at: at(-40 * D, 14), user_hidden_at: at(-3 * D) }, trash: true },
    { key: "corbeille-sans-date", label: "Corbeille, date de suppression absente", b: { ...base, status: "completed", pickup_at: at(-40 * D, 14) }, trash: true },
  ] },
  { title: "Contenu", states: [
    { key: "adresses-longues", label: "Adresses très longues", b: { ...base, origin_label: "Résidence Les Jardins de la Citadelle, Bâtiment C, 128 avenue du Peuple Belge, 59800 Lille", dest_label: "Aéroport de Paris-Charles-de-Gaulle, Terminal 2E, Hall K, 95700 Roissy-en-France", price_cents: 48100, paid_cents: 48100 } },
    { key: "sans-code-postal", label: "Adresse sans code postal", b: { ...base, origin_label: "Lesquin", dest_label: "Bruxelles-Midi" } },
    { key: "gros-montant", label: "Montant élevé (1 245 €)", b: { ...base, price_cents: 124500, paid_cents: 124500 } },
  ] },
];

const ALL = GROUPS.flatMap((g) => g.states);

// Sélecteur volontairement neutre, hors charte du site.
const sw = {
  aside: { alignSelf: "start", width: 270, maxWidth: "100%", background: "#1d1d1f", color: "#d4d4d8", borderRadius: 12, padding: 8, font: "13px/1.3 ui-sans-serif, system-ui, sans-serif" },
  h: { margin: "10px 10px 4px", fontSize: 11, color: "#8e8e93", textTransform: "uppercase", letterSpacing: ".06em" },
  a: { display: "block", padding: "7px 10px", borderRadius: 7, color: "inherit", textDecoration: "none" },
} as const;

export default function Playground({ state }: { state: string }) {
  const cur = ALL.find((s) => s.key === state) ?? ALL[0];
  return (
    <section className="acc-shell" style={{ padding: "32px 0 80px" }}>
      <div className="wrap" style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
        <aside style={sw.aside} aria-label="États">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p style={sw.h}>↪ {g.title}</p>
              {g.states.map((s) => (
                <Link key={s.key} href={`?__state=${s.key}`} scroll={false} style={{ ...sw.a, background: s.key === cur.key ? "#3a3a3c" : "transparent", color: s.key === cur.key ? "#fff" : undefined }}>{s.label}</Link>
              ))}
            </div>
          ))}
        </aside>
        <div className="acc-body" style={{ flex: "1 1 520px", maxWidth: 760 }}>
          <TripCard key={cur.key} b={cur.b} rebook={cur.rebook} trash={cur.trash} />
        </div>
      </div>
    </section>
  );
}
