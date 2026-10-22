"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AddressField, { type Place } from "./AddressField";
import IconC from "./IconC";
import { deletePlace, savePlace } from "@/app/compte/(espace)/actions";
import type { SavedPlace } from "@/lib/account";

const KINDS = { home: ["house", "Domicile"], work: ["briefcase", "Travail"], other: ["pin", "Autre"] } as const;

export default function PlacesManager({ places }: { places: SavedPlace[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<"home" | "work" | "other">(places.some((p) => p.kind === "home") ? (places.some((p) => p.kind === "work") ? "other" : "work") : "home");
  const [place, setPlace] = useState<Place | null>(null);
  const [label, setLabel] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const [key, setKey] = useState(0);

  function add() {
    if (!place) return setErr("Choisissez une adresse dans la liste proposée.");
    const l = kind === "other" ? label.trim() : KINDS[kind][1];
    if (!l) return setErr("Donnez un nom à cette adresse (ex. Parents).");
    start(async () => {
      const r = await savePlace({ kind, label: l, address: place.label, lat: place.lat, lng: place.lng });
      if (r?.error) return setErr(r.error);
      setErr(""); setPlace(null); setLabel(""); setKey((k) => k + 1); router.refresh();
    });
  }
  return (
    <>
      <ul className="place-list">
        {places.map((p) => (
          <li key={p.id}>
            <span className="place-ico" aria-hidden="true"><IconC name={KINDS[p.kind][0]} size={20} /></span>
            <span><strong>{p.label}</strong><br /><span className="muted">{p.address}</span></span>
            <button type="button" className="linklike" disabled={pending} onClick={() => start(async () => { await deletePlace(p.id); router.refresh(); })}>Supprimer</button>
          </li>
        ))}
        {!places.length && <li className="place-empty muted">Aucune adresse enregistrée pour l&apos;instant.</li>}
      </ul>
      <div className="callgate" style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: "1.1rem" }}>Ajouter une adresse</h2>
        <div className="chips" style={{ marginBottom: 12 }}>
          {(Object.keys(KINDS) as (keyof typeof KINDS)[]).map((k) => (
            <button key={k} type="button" className={`chip${kind === k ? " on" : ""}`} aria-pressed={kind === k} onClick={() => setKind(k)}><IconC name={KINDS[k][0]} size={16} /> {KINDS[k][1]}</button>
          ))}
        </div>
        {kind === "other" && <label className="form" style={{ display: "block", marginBottom: 12 }}>Nom<input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40} placeholder="Parents, Salle de sport…" /></label>}
        <AddressField key={key} label="Adresse" value={place} onChange={setPlace} placeholder="Rue, ville…" />
        {err && <p className="error" role="alert">{err}</p>}
        <button type="button" className="btn" style={{ marginTop: 12 }} disabled={pending} onClick={add}>{pending ? "Enregistrement…" : "Enregistrer"}</button>
      </div>
    </>
  );
}
