"use client";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AddressField, { type Place } from "./AddressField";

// Bloc « Où allez-vous ? » de l'espace client : mêmes suggestions d'adresses que le formulaire de réservation.
export default function AccountSearch({ children }: { children?: ReactNode }) {
  const router = useRouter();
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  return (
    <form
      className="acc-search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams();
        if (from) q.set("from", from.label.slice(0, 120));
        if (to) q.set("to", to.label.slice(0, 120));
        router.push(`/reservation${q.toString() ? `?${q}` : ""}`);
      }}
    >
      <h2>Où allez-vous ?</h2>
      <AddressField label="" value={from} onChange={setFrom} placeholder="Départ" />
      <AddressField label="" value={to} onChange={setTo} placeholder="Destination" />
      <button className="btn" type="submit">Voir le prix</button>
      {children}
    </form>
  );
}
