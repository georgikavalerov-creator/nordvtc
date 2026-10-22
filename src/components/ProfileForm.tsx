"use client";
import { useActionState, useState } from "react";
import { saveProfile } from "@/app/compte/(espace)/actions";
import type { Profile } from "@/lib/account";

type C = { code: string; dial: string; label: string; flag: string };
export default function ProfileForm({ profile, email, countries }: { profile: Profile; email: string; countries: C[] }) {
  const [state, action, pending] = useActionState(saveProfile, {} as { ok?: boolean; error?: string });
  const [country, setCountry] = useState("FR");
  return (
    <form action={action} className="form callgate">
      <label>E-mail<input value={email} disabled readOnly /></label>
      <label>Nom complet<input name="full_name" defaultValue={profile.full_name ?? ""} maxLength={80} autoComplete="name" /></label>
      <label>Mobile
        <span className="cg-phone">
          <select name="country" value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Pays">
            {countries.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.label} ({c.dial})</option>)}
          </select>
          <input name="phone" defaultValue={profile.phone ?? ""} type="tel" inputMode="tel" autoComplete="tel-national" placeholder={profile.phone ? "" : "06 12 34 56 78"} />
        </span>
        {profile.phone && <span className="muted" style={{ fontSize: ".85rem" }}>Enregistré : {profile.phone}. Laissez vide pour l'effacer.</span>}
      </label>
      <label>Nombre de passagers habituel
        <select name="default_passengers" defaultValue={profile.default_passengers}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</select>
      </label>
      <label className="cg-consent"><input type="checkbox" name="default_pet" defaultChecked={!!profile.default_pet} /><span>J&apos;ai un animal de compagnie</span></label>
      <label className="cg-consent"><input type="checkbox" name="default_child_seat" defaultChecked={profile.default_child_seat} /><span>Je voyage habituellement avec un siège enfant</span></label>
      <label className="cg-consent"><input type="checkbox" name="marketing_opt_in" defaultChecked={profile.marketing_opt_in} /><span>Recevoir les offres et actualités de Nord VTC</span></label>
      {state.error && <p className="error" role="alert">{state.error}</p>}
      {state.ok && <p className="notice" role="status">Profil enregistré ✓</p>}
      <button className="btn" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</button>
    </form>
  );
}
