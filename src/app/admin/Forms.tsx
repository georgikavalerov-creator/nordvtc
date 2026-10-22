"use client";
import { useActionState } from "react";
import { decideClaim, refundBooking, savePost, saveSettings, tiimeCatchUp } from "./actions";
import type { SiteSettings } from "@/lib/content";

type R = { error?: string; ok?: boolean | string } | undefined;
const Msg = ({ s }: { s: R }) => (s?.error ? <p className="error">{s.error}</p> : s?.ok ? <p className="notice okmsg">{typeof s.ok === "string" ? s.ok : "Enregistré ✓"}</p> : null);

export function SettingsForm({ v, envPhone }: { v: Partial<SiteSettings>; envPhone: boolean }) {
  const [s, act, pending] = useActionState(saveSettings, undefined);
  return (
    <form action={act} className="form adm-box adm-cols">
      <strong className="adm-span">Informations du site</strong>
      <label>E-mail de contact (mentions légales, contact)<input name="email" type="email" defaultValue={v.email ?? ""} placeholder="contact@nordvtc.fr" /></label>
      <label>Téléphone des mentions légales (obligatoire, masqué aux robots)<input name="legalPhone" defaultValue={v.legalPhone ?? ""} placeholder="07 68 24 15 98" /></label>
      <label>Numéro révélé après le formulaire « Appeler / être rappelé »<input name="driverPhone" defaultValue={v.driverPhone ?? ""} placeholder={envPhone ? "(variable DRIVER_PHONE utilisée si vide)" : "07 …"} /></label>
      <label>N° de carte professionnelle VTC (figure sur le bon de commande)<input name="carteVtc" defaultValue={v.carteVtc ?? ""} placeholder="N° délivré par la préfecture" /></label>
      <label>Immatriculation du véhicule<input name="plaque" defaultValue={v.plaque ?? ""} placeholder="AB-123-CD" /></label>
      <label>Véhicule (marque, modèle)<input name="vehicule" defaultValue={v.vehicule ?? ""} placeholder="Toyota Auris hybride" /></label>
      <label>Médiateur de la consommation (nom)<input name="mediatorName" defaultValue={v.mediatorName ?? ""} placeholder="Société Médiation Professionnelle" /></label>
      <label>Site web du médiateur<input name="mediatorUrl" type="url" defaultValue={v.mediatorUrl ?? ""} placeholder="https://…" /></label>
      <label>Adresse postale du médiateur<input name="mediatorAddress" defaultValue={v.mediatorAddress ?? ""} /></label>
      <label>Adresse de dépôt Tiime (chaque facture y est envoyée en PDF)<input name="tiimeEmail" type="email" defaultValue={v.tiimeEmail ?? ""} placeholder="votre-adresse@…tiime…" /></label>
      <small className="muted adm-span" style={{ marginTop: -6 }}>Dans Tiime : bloc « Déposer ici un document » en bas à gauche (web) ou Réglages → Gestion des documents (appli). Cliquez sur l&apos;adresse pour la copier.</small>
      <div className="adm-span"><Msg s={s} /></div>
      <button className="btn adm-save" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</button>
    </form>
  );
}

export type PostInit = { slug: string; title: string; description: string; tag: string; minutes: number; published_on: string; published: boolean; body: string; isNew: boolean };
export function PostForm({ p }: { p: PostInit }) {
  const [s, act, pending] = useActionState(savePost, undefined);
  return (
    <form action={act} className="form adm-box" style={{ display: "grid", gap: 12 }}>
      <label>Titre<input name="title" required defaultValue={p.title} /></label>
      <label>Adresse de l'article (/guide/…)<input name="slug" required defaultValue={p.slug} readOnly={!p.isNew} pattern="[a-z0-9-]{3,80}" placeholder="mon-article-sur-lille" /></label>
      <label>Description pour Google (30 à 200 caractères)<textarea name="description" required maxLength={200} style={{ minHeight: 70 }} defaultValue={p.description} /></label>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
        <label>Rubrique<input name="tag" required defaultValue={p.tag} /></label>
        <label>Lecture (min)<input name="minutes" type="number" min={1} max={60} defaultValue={p.minutes} /></label>
        <label>Date<input name="published_on" type="date" required defaultValue={p.published_on} /></label>
      </div>
      <label>Texte
        <textarea name="body" required style={{ minHeight: 320 }} defaultValue={p.body} />
        <small className="muted">Paragraphes séparés par une ligne vide · « ## Titre » pour un intertitre · « - texte » pour une puce · lien : [texte](/tarifs) ou [texte](/services/lille-paris)</small>
      </label>
      <label className="inline"><input type="checkbox" name="published" defaultChecked={p.published} /> <span>Publié (décoché = masqué du site)</span></label>
      <Msg s={s} />
      <button className="btn" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer l'article"}</button>
    </form>
  );
}

export function RefundForm({ id, max }: { id: string; max: number }) {
  const [s, act, pending] = useActionState(refundBooking, undefined);
  return (
    <form action={act} className="form" style={{ display: "grid", gap: 6 }}>
      <input type="hidden" name="id" value={id} />
      <label>Rembourser (€, max {(max / 100).toFixed(2)})<input name="amount" inputMode="decimal" defaultValue={(max / 100).toFixed(2)} /></label>
      <label className="inline"><input type="checkbox" name="cancel" /> <span>Annuler aussi la course</span></label>
      <Msg s={s} />
      <button className="btn ghost small" disabled={pending}>{pending ? "…" : "Rembourser via Stripe"}</button>
    </form>
  );
}

export function ClaimDecision({ id }: { id: string }) {
  const [s, act, pending] = useActionState(decideClaim, undefined);
  if (s?.ok) return <Msg s={s} />;
  return (
    <form action={act} className="trip-actions" style={{ marginTop: 6 }}>
      <input type="hidden" name="claim" value={id} />
      <button className="btn small" name="decision" value="accept" disabled={pending}>{pending ? "…" : "Accepter : annuler et tout rembourser"}</button>
      <button className="btn small ghost" name="decision" value="refuse" disabled={pending}>Refuser</button>
      <Msg s={s} />
    </form>
  );
}

export function TiimeCatchUp() {
  const [s, act, pending] = useActionState(tiimeCatchUp, undefined);
  return (
    <form action={act} className="adm-box" style={{ display: "grid", gap: 8, maxWidth: 640 }}>
      <strong>Tiime : factures déjà émises</strong>
      <small className="muted">Les nouvelles factures partent automatiquement. Ce bouton envoie celles émises avant l&apos;activation (25 par clic).</small>
      <Msg s={s} />
      <button className="btn ghost small" disabled={pending} style={{ justifySelf: "start" }}>{pending ? "Envoi…" : "Envoyer les factures en attente"}</button>
    </form>
  );
}
