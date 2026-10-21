"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="form ticket" style={{ maxWidth: 420 }}>
      <label>
        Mot de passe
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
    </form>
  );
}
