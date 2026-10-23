"use client";
import { useEffect, useRef, useState } from "react";
import { browserClient } from "@/lib/supabase-browser";
import { BusyLabel } from "./Loader";

/** Deuxième étape de connexion : code à 6 chiffres de l'application d'authentification. */
export default function MfaVerify({ next }: { next: string }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);

  async function submit(c = code) {
    if (!/^\d{6}$/.test(c)) return setErr("Saisissez les 6 chiffres affichés dans votre application.");
    setBusy(true); setErr("");
    const sb = browserClient();
    const { data: f } = await sb.auth.mfa.listFactors();
    const factor = f?.totp?.find((x) => x.status === "verified");
    if (!factor) { window.location.href = next; return; }
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: factor.id, code: c });
    setBusy(false);
    if (error) { setErr("Code incorrect ou expiré. Réessayez avec le code affiché maintenant."); setCode(""); input.current?.focus(); return; }
    window.location.href = next;
  }

  return (
    <form className="callgate authbox mfa-box" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <label htmlFor="mfa-code">Code de vérification</label>
      <input
        id="mfa-code" ref={input} className="mfa-code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} placeholder="000000"
        value={code} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); setCode(v); if (v.length === 6) submit(v); }}
      />
      {err && <p className="error" role="alert" style={{ margin: 0 }}>{err}</p>}
      <button className="btn" disabled={busy}><BusyLabel busy={busy} busyText="Vérification…">Valider</BusyLabel></button>
    </form>
  );
}
