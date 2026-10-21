"use client";
import { useActionState } from "react";
import { createDriver, resetDriverPassword } from "./actions";

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
