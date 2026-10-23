"use client";
import { useState, useTransition } from "react";
import { rateTrip } from "@/app/compte/(espace)/actions";
import { BusyLabel } from "./Loader";

export default function RateTrip({ id, initial = 0, initialComment = "", googleUrl = "" }: { id: string; initial?: number; initialComment?: string; googleUrl?: string }) {
  const [stars, setStars] = useState(initial);
  const [comment, setComment] = useState(initialComment);
  const [saved, setSaved] = useState(initial > 0);
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");
  return (
    <div className="rate">
      <div role="radiogroup" aria-label="Note du trajet" className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} étoile${n > 1 ? "s" : ""}`} className={n <= stars ? "on" : ""} onClick={() => { setStars(n); setSaved(false); }}>★</button>
        ))}
      </div>
      <textarea rows={2} maxLength={500} placeholder="Un commentaire ? (facultatif)" value={comment} onChange={(e) => { setComment(e.target.value); setSaved(false); }} />
      {err && <p className="error" role="alert">{err}</p>}
      <button className="btn small" disabled={!stars || pending || saved} onClick={() => start(async () => { const r = await rateTrip(id, stars, comment); if (r?.error) setErr(r.error); else { setErr(""); setSaved(true); } })}>
        {saved ? "Merci pour votre avis ✓" : <BusyLabel busy={pending} busyText="Envoi…">Envoyer mon avis</BusyLabel>}
      </button>
      {saved && stars >= 4 && googleUrl && (
        <a className="btn small ghost" href={googleUrl} target="_blank" rel="noopener noreferrer">Publier aussi sur Google</a>
      )}
    </div>
  );
}
