"use client";

import { useActionState, useState } from "react";
import { adminPkLogin, adminPkLoginOptions, login, sendCode } from "./actions";
import FaceIdLogin from "@/components/FaceIdLogin";
import { BusyLabel } from "@/components/Loader";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [pw, setPw] = useState(""); // conservé entre les deux étapes (mot de passe puis code)
  const [info, setInfo] = useState("");
  const m = state?.methods;
  const ask = async (via: "email" | "sms") => { setInfo("Envoi…"); const r = await sendCode(via); setInfo(r.ok || r.error || ""); };
  return (
    <form action={action} className="form ticket" style={{ maxWidth: 440 }}>
      {!state?.need2fa && <FaceIdLogin getOptions={adminPkLoginOptions} verify={adminPkLogin} next="/admin" />}
      <label>
        Mot de passe
        <input name="password" type="password" required autoComplete="current-password webauthn" value={pw} onChange={(e) => setPw(e.target.value)} />
      </label>
      {state?.need2fa && (
        <>
          <label>
            Code de vérification
            <input name="code" inputMode="text" maxLength={10} autoComplete="one-time-code" autoFocus required placeholder={m?.app ? "Code de l'application" : "Code reçu"} />
          </label>
          <div className="tfa-ways">
            {m?.app && <small>Application d&apos;authentification : ouvrez-la et saisissez le code.</small>}
            {m?.email && <button type="button" className="btn ghost small" onClick={() => ask("email")}>Recevoir un code par e-mail</button>}
            {m?.sms && <button type="button" className="btn ghost small" onClick={() => ask("sms")}>Recevoir un code par SMS</button>}
            {m && m.backup > 0 && <small>Téléphone perdu ? Saisissez un de vos codes de secours (XXXX-XXXX).</small>}
          </div>
          {info && <p className="muted" role="status">{info}</p>}
        </>
      )}
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <button className="btn" disabled={pending}><BusyLabel busy={pending} busyText="Connexion…">Se connecter</BusyLabel></button>
    </form>
  );
}
