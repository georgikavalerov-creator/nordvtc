"use client";
import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AddressField, { type Place } from "./AddressField";
import { BusyLabel, Dots } from "./Loader";

type Quote = { priceCents: number; distanceKm: number; durationMin: number };
const euro = (c: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: c % 100 ? 2 : 0 }).format(c / 100);
// Même format que l'espace client : la réservation reprend l'adresse exacte (coordonnées), sans nouvelle recherche.
const pack = (p: Place & { sig?: string }) => [p.label.slice(0, 160), String(p.lat), String(p.lng), p.sig ?? ""].join("|");

// Bloc de saisie rapide façon application de VTC : départ + arrivée (avec suggestions d'adresses),
// prix affiché dès que les deux adresses sont choisies, puis ouverture du formulaire complet pré-rempli.
export default function HeroBooking() {
  const router = useRouter();
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const seq = useRef(0);
  // Reste « en cours » jusqu'à l'affichage de la page de réservation.
  const [going, startGoing] = useTransition();

  // Prix au tarif de jour, calculé par le même service que la page de réservation.
  useEffect(() => {
    setErr("");
    if (!from || !to) { setQuote(null); setLoading(false); return; }
    const my = ++seq.current;
    setLoading(true);
    fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin: { lat: from.lat, lng: from.lng }, dest: { lat: to.lat, lng: to.lng } }),
    })
      .then(async (r) => { const d = await r.json().catch(() => ({})); if (my !== seq.current) return; if (!r.ok) { setQuote(null); setErr(d.error ?? "Calcul indisponible pour le moment."); } else setQuote(d.quote); })
      .catch(() => { if (my === seq.current) setErr("Calcul indisponible pour le moment."); })
      .finally(() => { if (my === seq.current) setLoading(false); });
  }, [from, to]);

  // Le trait départ → arrivée relie le centre des deux champs, même quand un message s'affiche sous l'un d'eux.
  const box = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = box.current, ln = line.current;
    if (!el || !ln) return;
    const place = () => {
      const inputs = el.querySelectorAll<HTMLInputElement>(".quick-field input");
      if (inputs.length < 2) return;
      const base = el.getBoundingClientRect();
      const a = inputs[0].getBoundingClientRect(), b = inputs[1].getBoundingClientRect();
      const top = a.top - base.top + a.height / 2 - 5, bottom = b.top - base.top + b.height / 2 + 5;
      ln.style.top = `${top}px`; ln.style.bottom = "auto"; ln.style.height = `${Math.max(0, bottom - top)}px`;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <form
      className="quick"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams();
        if (from) { q.set("from", from.label.slice(0, 120)); q.set("o", pack(from)); }
        if (to) { q.set("to", to.label.slice(0, 120)); q.set("d", pack(to)); }
        startGoing(() => router.push(`/reservation${q.toString() ? `?${q}` : ""}`));
      }}
    >
      <div className="quick-fields" ref={box}>
        <span ref={line} className={`quick-line${from && to ? " ready" : ""}`} aria-hidden="true"><i /><b /><i className="sq" /></span>
        <div className="quick-field">
          <AddressField label="" value={from} onChange={setFrom} placeholder="Adresse de départ" />
        </div>
        <div className="quick-field">
          <AddressField label="" value={to} onChange={setTo} placeholder="Destination (gare, aéroport, adresse)" />
        </div>
      </div>
      {(loading || quote || err) && (
        <div className={`quick-price${quote && !loading ? " on" : ""}`} aria-live="polite">
          {loading ? <span className="qp-wait"><Dots size={16} />Calcul du prix…</span>
            : quote ? (
              <>
                <span className="qp-main"><small>Prix de jour</small><strong>{euro(quote.priceCents)}</strong></span>
                <span className="qp-meta">{Math.round(quote.distanceKm)} km · environ {quote.durationMin} min<br />+20 % de 22 h à 6 h · prix ferme</span>
              </>
            ) : <span className="qp-err" role="alert">{err}</span>}
        </div>
      )}
      <button type="submit" className="btn quick-btn btn-arrow" aria-busy={going || undefined}>
        <BusyLabel busy={going}>{quote ? "Réserver ce trajet" : "Voir mon prix"}</BusyLabel>
      </button>
      <p className="quick-note">Gratuit · sans compte · prix ferme avant de payer</p>
    </form>
  );
}
