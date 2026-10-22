"use client";
import { useActionState } from "react";
import { adminSaveDriver, createDriver, resetDriverPassword } from "./actions";

function Result({ s }: { s: { error?: string; ok?: string; password?: string } | undefined }) {
  if (s?.error) return <p className="error">{s.error}</p>;
  if (!s?.ok) return null;
  return (
    <div className="notice okmsg">
      {s.ok} {s.password && <><strong style={{ fontFamily: "monospace", fontSize: "1.05rem" }}>{s.password}</strong><br /><small>À transmettre au chauffeur maintenant : il ne sera plus affiché. Il pourra le changer depuis son profil.</small></>}
    </div>
  );
}

export function NewDriverForm() {
  const [s, act, pending] = useActionState(createDriver, undefined);
  return (
    <form action={act} className="form adm-box" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", alignItems: "end" }}>
      <label>Nom et prénom<input name="name" required /></label>
      <label>E-mail (identifiant de connexion)<input name="email" type="email" required autoComplete="off" /></label>
      <label>Téléphone<input name="phone" inputMode="tel" /></label>
      <button className="btn small" disabled={pending}>{pending ? "…" : "Créer le compte"}</button>
      <div style={{ gridColumn: "1 / -1" }}><Result s={s} /></div>
    </form>
  );
}

export function ResetPasswordForm({ id }: { id: string }) {
  const [s, act, pending] = useActionState(resetDriverPassword, undefined);
  return (
    <form action={act} style={{ display: "grid", gap: 6 }}>
      <input type="hidden" name="id" value={id} />
      <button className="btn ghost small" disabled={pending}>Nouveau mot de passe</button>
      <Result s={s} />
    </form>
  );
}

type DrvFull = { id: string; name: string; phone: string | null; company: string | null; legal_form: string | null; siret: string | null; address: string | null; registre: string | null; carte_vtc: string | null; vehicule: string | null; plaque: string | null; insurer: string | null; vat_note: string | null };
/** Coordonnées et mentions légales du chauffeur, telles qu'elles apparaissent sur ses bons de commande. */
export function AdminDriverForm({ d }: { d: DrvFull }) {
  const [s, act, pending] = useActionState(adminSaveDriver, undefined);
  const f = (name: keyof DrvFull, label: string, ph = "") => <label>{label}<input name={name} defaultValue={(d[name] as string | null) ?? ""} placeholder={ph} /></label>;
  return (
    <details className="drv-legal">
      <summary>Coordonnées sur le bon de commande</summary>
      <form action={act} className="form adm-cols" style={{ marginTop: 10 }}>
        <input type="hidden" name="id" value={d.id} />
        {f("name", "Nom et prénom")}
        {f("phone", "Téléphone")}
        {f("company", "Raison sociale / nom commercial")}
        {f("legal_form", "Forme juridique", "Entreprise individuelle, SASU…")}
        {f("siret", "SIRET (14 chiffres)")}
        {f("address", "Adresse professionnelle")}
        {f("registre", "N° registre VTC", "EVTC123456789")}
        {f("carte_vtc", "N° carte professionnelle VTC")}
        {f("vehicule", "Véhicule (marque, modèle)")}
        {f("plaque", "Immatriculation", "AB-123-CD")}
        {f("insurer", "Assurance RC pro (assureur, n° de contrat)")}
        {f("vat_note", "Mention TVA", "TVA non applicable, art. 293 B du CGI")}
        <div className="adm-span">{s?.error && <p className="error" style={{ margin: 0 }}>{s.error}</p>}{s?.ok && <p className="notice" style={{ margin: 0 }}>Enregistré ✓ — ces informations figurent sur ses bons.</p>}</div>
        <button className="btn small adm-save" disabled={pending}>{pending ? "…" : "Enregistrer"}</button>
      </form>
    </details>
  );
}
