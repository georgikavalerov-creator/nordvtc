"use client";

import { useActionState, useState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [pw, setPw] = useState(""); // conservé entre les deux étapes (mot de passe puis code)
  return (
    <form action={action} className="form ticket" style={{ maxWidth: 420 }}>
      <label>
        Mot de passe
        <input name="password" type="password" required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
      </label>
      {state?.need2fa && (
        <label>
          Code de vérification (application d&apos;authentification)
          <input name="code" inputMode="numeric" pattern="[0-9 ]{6,7}" maxLength={7} autoComplete="one-time-code" autoFocus required placeholder="123 456" />
        </label>
      )}
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
    </form>
  );
}
