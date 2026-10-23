"use client";
import { useActionState } from "react";
import { changeDriverPassword, driverPkLogin, driverPkLoginOptions, loginDriver, saveDriverProfile } from "./actions";
import FaceIdLogin from "@/components/FaceIdLogin";
import type { Driver } from "@/lib/driver-auth";
import { BusyLabel } from "@/components/Loader";

const Msg = ({ s, ok = "Enregistré ✓" }: { s: { error?: string; ok?: boolean } | undefined; ok?: string }) =>
  s?.error ? <p className="error">{s.error}</p> : s?.ok ? <p className="notice okmsg">{ok}</p> : null;

export function DriverLogin() {
  const [s, act, pending] = useActionState(loginDriver, undefined);
  return (
    <form action={act} className="form adm-box" style={{ display: "grid", gap: 12, maxWidth: 420 }}>
      <FaceIdLogin getOptions={driverPkLoginOptions} verify={driverPkLogin} next="/chauffeur" />
      <label>E-mail<input name="email" type="email" required autoComplete="username webauthn" /></label>
      <label>Mot de passe<input name="password" type="password" required autoComplete="current-password" /></label>
      <Msg s={s} />
      <button className="btn" disabled={pending}><BusyLabel busy={pending} busyText="Connexion…">Se connecter</BusyLabel></button>
    </form>
  );
}

export function ProfileForm({ d }: { d: Driver }) {
  const [s, act, pending] = useActionState(saveDriverProfile, undefined);
  return (
    <form action={act} className="form adm-box" style={{ display: "grid", gap: 12 }}>
      <p className="muted" style={{ margin: 0 }}>Ces informations apparaissent sur vos bons de commande en tant qu'exploitant. Elles doivent correspondre à votre inscription au registre des exploitants VTC.</p>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
        <label>Nom et prénom<input name="name" required defaultValue={d.name} /></label>
        <label>Téléphone<input name="phone" defaultValue={d.phone ?? ""} /></label>
        <label>Société / nom commercial<input name="company" required defaultValue={d.company ?? ""} /></label>
        <label>Forme juridique<input name="legal_form" defaultValue={d.legal_form ?? "Entreprise individuelle (micro-entrepreneur)"} /></label>
        <label>SIRET (14 chiffres)<input name="siret" required inputMode="numeric" defaultValue={d.siret ?? ""} /></label>
        <label>Adresse de l'entreprise<input name="address" required defaultValue={d.address ?? ""} /></label>
        <label>N° registre des exploitants VTC<input name="registre" required placeholder="EVTC000000000" defaultValue={d.registre ?? ""} /></label>
        <label>N° carte professionnelle VTC<input name="carte_vtc" required defaultValue={d.carte_vtc ?? ""} /></label>
        <label>Véhicule (marque, modèle)<input name="vehicule" required defaultValue={d.vehicule ?? ""} /></label>
        <label>Immatriculation<input name="plaque" required placeholder="AB-123-CD" defaultValue={d.plaque ?? ""} /></label>
      </div>
      <label>Assurance RC professionnelle (assureur, adresse)<input name="insurer" required defaultValue={d.insurer ?? ""} /></label>
      <label>Mention TVA<input name="vat_note" defaultValue={d.vat_note ?? "TVA non applicable, art. 293 B du CGI"} /></label>
      <Msg s={s} />
      <button className="btn" disabled={pending}><BusyLabel busy={pending} busyText="Enregistrement…">Enregistrer mon profil</BusyLabel></button>
    </form>
  );
}

export function PasswordForm() {
  const [s, act, pending] = useActionState(changeDriverPassword, undefined);
  return (
    <form action={act} className="form adm-box" style={{ display: "grid", gap: 10, maxWidth: 420 }}>
      <strong>Changer mon mot de passe</strong>
      <label>Mot de passe actuel<input name="current" type="password" required autoComplete="current-password" /></label>
      <label>Nouveau (10 caractères minimum)<input name="next" type="password" required minLength={10} autoComplete="new-password" /></label>
      <Msg s={s} ok="Mot de passe modifié ✓" />
      <button className="btn ghost small" disabled={pending}>Modifier</button>
    </form>
  );
}
