"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Bloc de saisie rapide façon application de VTC : départ + arrivée, puis ouverture du formulaire complet pré-rempli.
export default function HeroBooking() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  return (
    <form
      className="quick"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams();
        if (from.trim()) q.set("from", from.trim());
        if (to.trim()) q.set("to", to.trim());
        router.push(`/reservation${q.toString() ? `?${q}` : ""}`);
      }}
    >
      <div className="quick-fields">
        <span className="quick-line" aria-hidden="true"><i /><b /><i className="sq" /></span>
        <label className="quick-field">
          <span className="sr-only">Adresse de départ</span>
          <input id="hb-from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Adresse de départ" autoComplete="off" />
        </label>
        <label className="quick-field">
          <span className="sr-only">Destination</span>
          <input id="hb-to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Destination (gare, aéroport, adresse)" autoComplete="off" />
        </label>
      </div>
      <button type="submit" className="btn quick-btn btn-arrow">Voir mon prix</button>
      <p className="quick-note">Gratuit · sans compte · prix ferme avant de payer</p>
    </form>
  );
}
