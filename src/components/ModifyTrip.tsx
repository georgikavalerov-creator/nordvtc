"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddressField, { type Place } from "./AddressField";
import DateField from "./DateField";
import TimeField from "./TimeField";
import type { ModifyResult } from "@/lib/modify";
import { BusyLabel } from "./Loader";

export type ModifyInitial = {
  origin: Place; dest: Place; date: string; time: string;
  passengers: number; luggage: number; flight: string; childSeat: boolean; pet: boolean; notes: string;
};

const euro = (c: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: c % 100 ? 2 : 0 }).format(c / 100);
const todayIso = () => { const d = new Date(); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };

/** Modification en ligne d'une réservation confirmée : nouveau prix calculé par le serveur, jamais inférieur à ce qui est déjà réglé. */
export default function ModifyTrip({ initial, action, contactHref = "/contact", label = "Modifier" }: { initial: ModifyInitial; action: (input: unknown, confirm: boolean) => Promise<ModifyResult>; contactHref?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<Place | null>(initial.origin);
  const [dest, setDest] = useState<Place | null>(initial.dest);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [passengers, setPassengers] = useState(initial.passengers);
  const [luggage, setLuggage] = useState(initial.luggage);
  const [flight, setFlight] = useState(initial.flight);
  const [childSeat, setChildSeat] = useState(initial.childSeat);
  const [pet, setPet] = useState(initial.pet);
  const [notes, setNotes] = useState(initial.notes);
  const [preview, setPreview] = useState<ModifyResult | null>(null);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  const touch = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPreview(null); setErr(""); };
  const input = () => ({ origin, dest, date, time, passengers, luggage, flight: flight.trim() || undefined, childSeat, pet, notes: notes.trim() || undefined });
  const run = (confirm: boolean) => start(async () => {
    setErr("");
    if (!origin || !dest) { setErr("Choisissez le départ et l'arrivée dans la liste proposée."); return; }
    if (!date || !time) { setErr("Indiquez la date et l'heure."); return; }
    const r = await action(input(), confirm);
    if (r.error) { setErr(r.error); setPreview(null); return; }
    if (confirm && r.done) { setDone(true); setOpen(false); setPreview(null); router.refresh(); return; }
    setPreview(r);
  });

  if (!open) return (
    <>
      <button type="button" className="btn small ghost" onClick={() => { setOpen(true); setDone(false); }}>{label}</button>
      {done && <p className="notice mod-done" role="status">Modification enregistrée. Un e-mail de confirmation vous a été envoyé et le bon de commande est à jour.</p>}
    </>
  );

  return (
    <div className="mod-box" role="region" aria-label="Modifier la réservation">
      <div className="mod-head">
        <strong>Modifier ma réservation</strong>
        <button type="button" className="mod-x" aria-label="Fermer" onClick={() => setOpen(false)}>×</button>
      </div>
      <p className="muted mod-lead">Le nouveau prix est calculé tout de suite. Il ne peut pas être inférieur à ce que vous avez déjà réglé en ligne.</p>
      <div className="mod-grid">
        <AddressField label="Départ" value={origin} onChange={touch(setOrigin)} placeholder="Adresse, gare, aéroport…" autoResolve={false} />
        <AddressField label="Arrivée" value={dest} onChange={touch(setDest)} placeholder="Adresse, gare, aéroport…" autoResolve={false} />
        <div className="tf-label">Date<DateField value={date} onChange={touch(setDate)} min={todayIso()} /></div>
        <div className="tf-label">Heure<TimeField value={time} onChange={touch(setTime)} /></div>
        <label>Passagers
          <select value={passengers} onChange={(e) => touch(setPassengers)(Number(e.target.value))}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</select>
        </label>
        <label>Bagages
          <select value={luggage} onChange={(e) => touch(setLuggage)(Number(e.target.value))}>{Array.from({ length: 13 }, (_, n) => <option key={n} value={n}>{n}</option>)}</select>
        </label>
        <label className="mod-wide"><span>N° de vol, train ou bus <span className="muted">(facultatif)</span></span>
          <input value={flight} maxLength={30} onChange={(e) => touch(setFlight)(e.target.value)} placeholder="Ex. Avion AF1234" />
        </label>
        <label className={`toggle${childSeat ? " on" : ""}`}><input type="checkbox" checked={childSeat} onChange={(e) => touch(setChildSeat)(e.target.checked)} /><span>Siège enfant ou rehausseur</span></label>
        <label className={`toggle${pet ? " on" : ""}`}><input type="checkbox" checked={pet} onChange={(e) => touch(setPet)(e.target.checked)} /><span>J&apos;ai un animal de compagnie</span></label>
        <label className="mod-wide"><span>Précision pour le chauffeur <span className="muted">(facultatif)</span></span>
          <textarea rows={2} maxLength={500} value={notes} onChange={(e) => touch(setNotes)(e.target.value)} placeholder="Terminal, bagage volumineux…" />
        </label>
      </div>

      {preview?.ok && (
        <div className={`mod-price${preview.floor ? " floor" : ""}`} role="status">
          <dl>
            <div><dt>Nouveau prix</dt><dd>{euro(preview.finalCents!)}</dd></div>
            <div><dt>Déjà réglé</dt><dd>{euro(preview.paidCents!)}</dd></div>
            <div><dt>Reste à bord</dt><dd>{euro(preview.restCents!)}</dd></div>
          </dl>
          <p className="muted">{preview.distanceKm} km · environ {preview.minutes} min{preview.oldPriceCents !== undefined && preview.oldPriceCents !== preview.finalCents ? ` · prix actuel ${euro(preview.oldPriceCents)}` : ""}</p>
          {preview.floor && (
            <p className="mod-floor">Ce nouveau trajet est calculé à <strong>{euro(preview.newPriceCents!)}</strong>, moins que les <strong>{euro(preview.paidCents!)}</strong> déjà réglés : c&apos;est ce montant qui sera retenu, sans remboursement. Si cela ne vous convient pas, <Link href={contactHref}>contactez-nous</Link>.</p>
          )}
        </div>
      )}
      {err && <p className="error" role="alert">{err}</p>}
      <div className="trip-actions">
        {preview?.ok ? (
          <>
            <button type="button" className="btn small" disabled={pending} onClick={() => run(true)}><BusyLabel busy={pending}>Confirmer la modification</BusyLabel></button>
            <button type="button" className="btn small ghost" disabled={pending} onClick={() => setPreview(null)}>Changer encore</button>
          </>
        ) : (
          <button type="button" className="btn small" disabled={pending} onClick={() => run(false)}><BusyLabel busy={pending} busyText="Calcul…">Voir le nouveau prix</BusyLabel></button>
        )}
        <button type="button" className="btn small ghost" disabled={pending} onClick={() => setOpen(false)}>Annuler</button>
      </div>
    </div>
  );
}
