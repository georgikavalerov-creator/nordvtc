"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AddressField, { type Place } from "./AddressField";

// Bloc de saisie rapide façon application de VTC : départ + arrivée (avec suggestions d'adresses),
// puis ouverture du formulaire complet pré-rempli.
export default function HeroBooking() {
  const router = useRouter();
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  return (
    <form
      className="quick"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams();
        if (from) q.set("from", from.label.slice(0, 120));
        if (to) q.set("to", to.label.slice(0, 120));
        router.push(`/reservation${q.toString() ? `?${q}` : ""}`);
      }}
    >
      <div className="quick-fields">
        <span className="quick-line" aria-hidden="true"><i /><b /><i className="sq" /></span>
        <div className="quick-field">
          <AddressField label="" value={from} onChange={setFrom} placeholder="Adresse de départ" />
        </div>
        <div className="quick-field">
          <AddressField label="" value={to} onChange={setTo} placeholder="Destination (gare, aéroport, adresse)" />
        </div>
      </div>
      <button type="submit" className="btn quick-btn btn-arrow">Voir mon prix</button>
      <p className="quick-note">Gratuit · sans compte · prix ferme avant de payer</p>
    </form>
  );
}
