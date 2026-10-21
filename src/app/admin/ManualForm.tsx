"use client";
import { useActionState, useState } from "react";
import AddressField, { type Place } from "@/components/AddressField";
import { createManualBooking } from "./actions";

export default function ManualForm({ mode = "booking", action = createManualBooking }: { mode?: "booking" | "bon"; action?: typeof createManualBooking }) {
  const [s, act, pending] = useActionState(action, undefined);
  const [o, setO] = useState<Place | null>(null);
  const [d, setD] = useState<Place | null>(null);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  return (
    <form action={act} className="form adm-box" style={{ display: "grid", gap: 14, maxWidth: 760 }}>
      <input type="hidden" name="origin" value={o ? JSON.stringify(o) : ""} />
      <input type="hidden" name="dest" value={d ? JSON.stringify(d) : ""} />
      {mode === "bon" && <input type="hidden" name="goto" value="bon" />}
      <strong>Client</strong>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <label>Nom et prénom<input name="name" required autoComplete="off" /></label>
        <label>Téléphone<input name="phone" required inputMode="tel" autoComplete="off" /></label>
        <label>E-mail (facultatif, pour la facture)<input name="email" type="email" autoComplete="off" /></label>
      </div>
      {mode === "bon" && (
        <details>
          <summary style={{ cursor: "pointer" }}>Client professionnel (société) : facultatif</summary>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", marginTop: 10 }}>
            <label>Société<input name="company" /></label>
            <label>Adresse de facturation<input name="billing_address" /></label>
            <label>SIREN<input name="siren" inputMode="numeric" /></label>
          </div>
        </details>
      )}
      <strong>Trajet</strong>
      <AddressField label="Adresse de départ" value={o} onChange={setO} placeholder="Adresse, gare, aéroport…" />
      <AddressField label="Adresse d'arrivée" value={d} onChange={setD} placeholder="Adresse, gare, aéroport…" />
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))" }}>
        <label>Date<input type="date" name="date" required defaultValue={tomorrow} /></label>
        <label>Heure<input type="time" name="time" required defaultValue="08:00" /></label>
        <label>Passagers<input type="number" name="passengers" min={1} max={8} defaultValue={1} /></label>
        <label>Bagages<input type="number" name="luggage" min={0} max={20} defaultValue={0} /></label>
      </div>
      <label>Vol / train (facultatif)<input name="flight" placeholder="AF1234" /></label>
      <label className="inline"><input type="checkbox" name="child_seat" /> <span>Siège enfant</span></label>
      <label>Remarque du client<textarea name="notes" style={{ minHeight: 60 }} /></label>
      <strong>Prix</strong>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <label>Prix (€) — vide = calculé automatiquement<input name="price" inputMode="decimal" placeholder="auto" /></label>
        <label>Déjà encaissé (€)<input name="paid" inputMode="decimal" defaultValue="0" /></label>
      </div>
      {s?.error && <p className="error">{s.error}</p>}
      <button className="btn" disabled={pending || !o || !d}>{pending ? "Création…" : mode === "bon" ? "Générer le bon de commande" : "Créer la réservation"}</button>
      {(!o || !d) && <small className="muted">Choisissez les deux adresses dans la liste proposée.</small>}
    </form>
  );
}
