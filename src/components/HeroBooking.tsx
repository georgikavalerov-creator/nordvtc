"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AddressField, { type Place } from "./AddressField";
import { BusyLabel } from "./Loader";

// Bloc de saisie rapide façon application de VTC : départ + arrivée (avec suggestions d'adresses),
// puis ouverture du formulaire complet pré-rempli.
export default function HeroBooking() {
  const router = useRouter();
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  // Reste « en cours » jusqu'à l'affichage de la page de réservation.
  const [going, startGoing] = useTransition();
  return (
    <form
      className="quick"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams();
        if (from) q.set("from", from.label.slice(0, 120));
        if (to) q.set("to", to.label.slice(0, 120));
        startGoing(() => router.push(`/reservation${q.toString() ? `?${q}` : ""}`));
      }}
    >
      <div className="quick-fields">
        <span className={`quick-line${from && to ? " ready" : ""}`} aria-hidden="true"><i /><b /><i className="sq" /></span>
        <div className="quick-field">
          <AddressField label="" value={from} onChange={setFrom} placeholder="Adresse de départ" />
        </div>
        <div className="quick-field">
          <AddressField label="" value={to} onChange={setTo} placeholder="Destination (gare, aéroport, adresse)" />
        </div>
      </div>
      <button type="submit" className="btn quick-btn btn-arrow" aria-busy={going || undefined}><BusyLabel busy={going}>Voir mon prix</BusyLabel></button>
      <p className="quick-note">Gratuit · sans compte · prix ferme avant de payer</p>
    </form>
  );
}
