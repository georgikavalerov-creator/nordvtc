"use client";
import { useActionState, useState } from "react";
import AddressField, { type Place } from "@/components/AddressField";
import { createManualBooking } from "./actions";
import CompanyField from "@/components/CompanyField";

export type ManualInitial = {
  name?: string; phone?: string; email?: string; date?: string; time?: string; passengers?: number; luggage?: number;
  flight?: string; notes?: string; price?: number | null; company?: string; from?: string; to?: string;
  origin?: Place | null; dest?: Place | null; ref?: string;
};

// stay : après création, on reste sur la page (import de plusieurs courses) et on affiche le lien du bon.
export default function ManualForm({ mode = "booking", action = createManualBooking, initial, stay = false, drivers = [] }: { mode?: "booking" | "bon"; action?: typeof createManualBooking; initial?: ManualInitial; stay?: boolean; drivers?: { id: string; name: string }[] }) {
  const [s, act, pending] = useActionState(action, undefined);
  const [o, setO] = useState<Place | null>(initial?.origin ?? null);
  const [d, setD] = useState<Place | null>(initial?.dest ?? null);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const i = initial ?? {};
  const [co, setCo] = useState(i.company ?? "");
  const [coAddr, setCoAddr] = useState("");
  const [coSiren, setCoSiren] = useState("");
  if (s && "url" in s && s.url) {
    const id = "id" in s ? s.id : undefined;
    return (
      <div className="adm-box imp-done adm-created">
        <strong>✓ Course enregistrée et bon de commande créé{i.name ? ` · ${i.name}` : ""}</strong>
        <p className="muted" style={{ margin: 0 }}>Elle apparaît dans vos réservations, votre calendrier et, si vous l&apos;avez choisi, dans votre agenda iPhone.</p>
        <div className="adm-actions">
          <a className="btn small" href={s.url} target="_blank" rel="noreferrer">Ouvrir le bon de commande</a>
          {id && <a className="btn small ghost" href={`/admin/ics/${id}`}>Ajouter à l&apos;agenda</a>}
          {id && <a className="btn small ghost" href={`/admin/reservations?q=${id.slice(0, 8)}&ouvrir=1`}>Voir la réservation</a>}
          <a className="btn small ghost" href="/admin/reservations/nouvelle">Nouvelle course</a>
        </div>
      </div>
    );
  }
  return (
    <form action={act} className="form adm-box adm-manual">
      <input type="hidden" name="origin" value={o ? JSON.stringify(o) : ""} />
      <input type="hidden" name="dest" value={d ? JSON.stringify(d) : ""} />
      {mode === "bon" && <input type="hidden" name="goto" value={stay ? "stay" : "bon"} />}
      {i.ref && <input type="hidden" name="source_ref" value={i.ref} />}
      <strong>Client</strong>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <label>Nom et prénom<input name="name" required autoComplete="off" defaultValue={i.name} /></label>
        <label>Téléphone<input name="phone" required inputMode="tel" autoComplete="off" defaultValue={i.phone} /></label>
        <label>E-mail (facultatif, pour la facture)<input name="email" type="email" autoComplete="off" defaultValue={i.email} /></label>
      </div>
      {mode === "bon" && (
        <details>
          <summary style={{ cursor: "pointer" }}>Client professionnel (société) : facultatif</summary>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", marginTop: 10 }}>
            <CompanyField label="Société" name="company" value={co} onChange={setCo} onPick={(c) => { setCo(c.name); setCoSiren(c.siren); if (c.address) setCoAddr(c.address); }} />
            <label>Adresse de facturation<input name="billing_address" value={coAddr} onChange={(e) => setCoAddr(e.target.value)} /></label>
            <label>SIREN<input name="siren" inputMode="numeric" value={coSiren} onChange={(e) => setCoSiren(e.target.value.replace(/\s/g, "").slice(0, 14))} /></label>
          </div>
        </details>
      )}
      <strong>Trajet</strong>
      <AddressField label="Adresse de départ" value={o} onChange={setO} initialText={i.from} placeholder="Adresse, gare, aéroport…" />
      <AddressField label="Adresse d'arrivée" value={d} onChange={setD} initialText={i.to} placeholder="Adresse, gare, aéroport…" />
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))" }}>
        <label>Date<input type="date" name="date" required defaultValue={i.date || tomorrow} /></label>
        <label>Heure<input type="time" name="time" required defaultValue={i.time || "08:00"} /></label>
        <label>Passagers<input type="number" name="passengers" min={1} max={8} defaultValue={i.passengers ?? 1} /></label>
        <label>Bagages<input type="number" name="luggage" min={0} max={20} defaultValue={i.luggage ?? 0} /></label>
      </div>
      <details>
        <summary style={{ cursor: "pointer" }}>Ajouter un retour (autre date possible)</summary>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", marginTop: 10 }}>
          <label>Date du retour<input type="date" name="ret_date" /></label>
          <label>Heure du retour<input type="time" name="ret_time" /></label>
        </div>
        <small className="muted">Crée une seconde réservation (trajet inverse). Prix identique si vous en avez fixé un, sinon calculé.</small>
      </details>
      <label>Vol / train (facultatif)<input name="flight" placeholder="AF1234" defaultValue={i.flight} /></label>
      <label className="inline"><input type="checkbox" name="child_seat" /> <span>Siège enfant</span></label>
      <label className="inline"><input type="checkbox" name="pet" /> <span>Animal de compagnie</span></label>
      <label>Remarque du client<textarea name="notes" style={{ minHeight: 60 }} defaultValue={i.notes} /></label>
      {drivers.length > 0 && (
        <label>Chauffeur sur le bon (ses nom, SIRET, carte VTC et véhicule y figurent)
          <select name="driver_id" defaultValue="">
            <option value="">Moi (Nord VTC)</option>
            {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
      )}
      <strong>Prix</strong>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <label>Prix (€) — vide = calculé automatiquement<input name="price" inputMode="decimal" placeholder="auto" defaultValue={i.price ? String(i.price).replace(".", ",") : ""} /></label>
        <label>Déjà encaissé (€)<input name="paid" inputMode="decimal" defaultValue="0" /></label>
      </div>
      {s?.error && <p className="error">{s.error}</p>}
      <button className="btn" disabled={pending || !o || !d}>{pending ? "Création…" : mode === "bon" ? "Générer le bon de commande" : "Créer la réservation"}</button>
      {(!o || !d) && <small className="muted">Choisissez les deux adresses dans la liste proposée.</small>}
    </form>
  );
}
