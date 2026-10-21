"use client";
import { useState } from "react";
import { browserClient } from "@/lib/supabase-browser";
import PasswordMeter from "./PasswordMeter";

export default function NewPasswordForm() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [leaked, setLeaked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if ([...pw].length < 10) return setErr("Au moins 10 caractères (16 recommandés).");
    if (leaked) return setErr("Ce mot de passe a fuité : choisissez-en un autre.");
    setBusy(true); setErr("");
    const { error } = await browserClient().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) setErr("Modification impossible. Reconnectez-vous puis réessayez."); else setDone(true);
  }
  if (done) return <p className="notice" role="status">Mot de passe enregistré ✓ Vous pouvez désormais vous connecter avec.</p>;
  return (
    <form className="form callgate" onSubmit={submit}>
      <label>Nouveau mot de passe
        <span className="pw-field">
          <input type={show ? "text" : "password"} required value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" minLength={10} />
          <button type="button" className="linklike" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? "Masquer" : "Afficher"}</button>
        </span>
      </label>
      <PasswordMeter value={pw} onLeaked={setLeaked} />
      {err && <p className="error" role="alert">{err}</p>}
      <button className="btn" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer le mot de passe"}</button>
    </form>
  );
}
