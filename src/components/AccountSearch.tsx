"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AddressField, { type Place } from "./AddressField";
import DateField from "./DateField";
import TimeField from "./TimeField";
import IconC from "./IconC";

type Saved = { id: string; kind: "home" | "work" | "other"; label: string; address: string; lat: number; lng: number; sig?: string };
type Quote = { priceCents: number; distanceKm: number; durationMin: number; night?: boolean };

const euro = (c: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: c % 100 ? 2 : 0 }).format(c / 100);
const todayIso = () => { const d = new Date(); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
const ICON = { home: "house", work: "briefcase", other: "pin" } as const;
/** Adresse transmise telle quelle à la page de réservation (avec sa signature : aucune nouvelle recherche). */
const pack = (p: Place & { sig?: string }) => [p.label.slice(0, 160), String(p.lat), String(p.lng), p.sig ?? ""].join("|");

// Bloc « Réserver un nouveau trajet » de l'espace client : le prix s'affiche ici dès que les deux adresses sont choisies,
// puis un seul clic ouvre la réservation déjà remplie (adresses, date, heure).
export default function AccountSearch({ places = [] }: { places?: Saved[] }) {
  const router = useRouter();
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [k, setK] = useState(0); // recrée les champs après inversion ou adresse enregistrée
  const [quote, setQuote] = useState<Quote | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    setErr("");
    if (!from || !to) { setQuote(null); return; }
    const my = ++seq.current;
    setLoading(true);
    fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin: { lat: from.lat, lng: from.lng }, dest: { lat: to.lat, lng: to.lng }, time: time || undefined }),
    })
      .then(async (r) => { const d = await r.json().catch(() => ({})); if (my !== seq.current) return; if (!r.ok) { setQuote(null); setErr(d.error ?? "Calcul indisponible."); } else setQuote(d.quote); })
      .catch(() => { if (my === seq.current) setErr("Calcul indisponible pour le moment."); })
      .finally(() => { if (my === seq.current) setLoading(false); });
  }, [from, to, time]);

  const swap = () => { setFrom(to); setTo(from); setK((x) => x + 1); };
  const pickSaved = (s: Saved) => {
    const p = { label: s.address, lat: s.lat, lng: s.lng, sig: s.sig } as Place;
    if (!from) setFrom(p); else setTo(p);
    setK((x) => x + 1);
  };
  const go = () => {
    const q = new URLSearchParams();
    if (from) { q.set("from", from.label.slice(0, 120)); q.set("o", pack(from)); }
    if (to) { q.set("to", to.label.slice(0, 120)); q.set("d", pack(to)); }
    if (date) q.set("date", date);
    if (time) q.set("time", time);
    router.push(`/reservation${q.toString() ? `?${q}` : ""}`);
  };

  return (
    <form className="acc-search acc-book" onSubmit={(e) => { e.preventDefault(); go(); }}>
      <div className="ab-head">
        <h2>Réserver un nouveau trajet</h2>
        <span className="muted">Le prix s&apos;affiche tout de suite</span>
      </div>
      <div className="ab-route">
        <AddressField key={`f${k}`} label="" value={from} onChange={setFrom} placeholder="Départ" autoResolve={false} />
        <button type="button" className="ab-swap" onClick={swap} aria-label="Inverser départ et destination" disabled={!from && !to}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 4v16M7 4 3 8M7 4l4 4M17 20V4M17 20l-4-4M17 20l4-4" /></svg>
        </button>
        <AddressField key={`t${k}`} label="" value={to} onChange={setTo} placeholder="Destination" autoResolve={false} />
      </div>
      {places.length > 0 && (
        <div className="acc-places" aria-label="Mes adresses">
          {places.map((p) => (
            <button key={p.id} type="button" className="acc-place" onClick={() => pickSaved(p)}>
              <IconC name={ICON[p.kind]} size={18} /><span>{p.label}</span>
            </button>
          ))}
        </div>
      )}
      <div className="ab-when">
        <div className="tf-label"><span>Date <span className="muted">(facultatif)</span></span><DateField value={date} onChange={setDate} min={todayIso()} /></div>
        <div className="tf-label"><span>Heure <span className="muted">(facultatif)</span></span><TimeField value={time} onChange={setTime} /></div>
      </div>
      <div className={`ab-price${quote ? " on" : ""}`} aria-live="polite">
        {loading ? <span className="muted">Calcul du prix…</span>
          : quote ? (
            <>
              <div><small>{time ? "Prix du trajet" : "Prix de jour"}</small><strong>{euro(quote.priceCents)}</strong></div>
              <span className="muted">{Math.round(quote.distanceKm)} km · environ {quote.durationMin} min{!time ? " · majoration de nuit si départ entre 22 h et 6 h" : ""}</span>
            </>
          ) : err ? <span className="error" role="alert">{err}</span>
          : <span className="muted">Choisissez le départ et la destination pour voir le prix.</span>}
      </div>
      <button className="btn" type="submit" disabled={!from || !to}>{quote ? `Réserver ce trajet · ${euro(quote.priceCents)}` : "Voir le prix"}</button>
    </form>
  );
}
