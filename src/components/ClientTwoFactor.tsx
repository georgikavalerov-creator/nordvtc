"use client";
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase-browser";
import { BusyLabel, Loader } from "./Loader";

type Factor = { id: string; friendly_name?: string; status: string; created_at: string };

/** Double authentification de l'espace client (code à 6 chiffres d'une application d'authentification). */
export default function ClientTwoFactor() {
  const [factor, setFactor] = useState<Factor | null | undefined>(undefined);
  const [setup, setSetup] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [ask, setAsk] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await browserClient().auth.mfa.listFactors();
    setFactor((data?.totp?.find((f) => f.status === "verified") as Factor | undefined) ?? null);
  }
  useEffect(() => { load(); }, []);

  async function start() {
    setErr(""); setMsg(""); setBusy(true);
    const sb = browserClient();
    // Une ancienne tentative non terminée bloque une nouvelle inscription : on la retire d'abord.
    const { data: l } = await sb.auth.mfa.listFactors();
    for (const f of (l?.all ?? []).filter((x) => x.factor_type === "totp" && x.status !== "verified")) await sb.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: "Nord VTC", issuer: "Nord VTC" });
    setBusy(false);
    if (error || !data) return setErr("Activation impossible pour le moment. Réessayez dans quelques minutes.");
    setSetup({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }
  async function confirm(c = code) {
    if (!setup || !/^\d{6}$/.test(c)) return setErr("Saisissez les 6 chiffres affichés dans l'application.");
    setBusy(true); setErr("");
    const { error } = await browserClient().auth.mfa.challengeAndVerify({ factorId: setup.id, code: c });
    setBusy(false);
    if (error) { setCode(""); return setErr("Code incorrect : vérifiez l'heure de votre téléphone et saisissez le code affiché maintenant."); }
    setSetup(null); setCode(""); setMsg("Double authentification activée. Elle vous sera demandée à chaque nouvelle connexion."); load();
  }
  async function disable() {
    if (!factor) return;
    setBusy(true); setErr("");
    const { error } = await browserClient().auth.mfa.unenroll({ factorId: factor.id });
    setBusy(false); setAsk(false);
    if (error) return setErr("Pour désactiver, reconnectez-vous puis réessayez (le code vous sera demandé).");
    setMsg("Double authentification désactivée."); load();
  }

  if (factor === undefined) return <div className="callgate tfa-box"><p className="muted ld-inline" style={{ margin: 0 }}><Loader size={16} />Chargement…</p></div>;
  return (
    <div className="callgate tfa-box">
      <div className="tfa-head">
        <span className="tfa-ico" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg></span>
        <div>
          <strong>Double authentification</strong>
          <p className="muted">Même si quelqu&apos;un obtient l&apos;accès à votre e-mail ou à votre mot de passe, il lui faudra aussi le code à 6 chiffres de votre téléphone.</p>
        </div>
        <span className={`pill ${factor ? "ok" : ""}`}>{factor ? "Activée" : "Désactivée"}</span>
      </div>
      {msg && <p className="notice" role="status" style={{ margin: 0 }}>{msg}</p>}
      {err && <p className="error" role="alert" style={{ margin: 0 }}>{err}</p>}
      {factor ? (
        ask ? (
          <span className="trip-del-ask" role="group">
            <span>Désactiver la double authentification ?</span>
            <button type="button" className="btn small danger" onClick={disable} disabled={busy}>Oui, désactiver</button>
            <button type="button" className="btn small ghost" onClick={() => setAsk(false)} disabled={busy}>Non</button>
          </span>
        ) : <button type="button" className="btn small ghost" onClick={() => setAsk(true)}>Désactiver</button>
      ) : setup ? (
        <div className="tfa-setup">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qr} alt="QR code à scanner avec votre application d'authentification" width={180} height={180} className="tfa-qr" />
          <ol className="tfa-steps">
            <li>Ouvrez votre application (Google Authenticator, Mots de passe d&apos;iPhone, 1Password…) et scannez ce QR code.</li>
            <li>Sur ce téléphone ? Saisissez plutôt cette clé : <code className="tfa-secret">{setup.secret}</code></li>
            <li>
              Entrez le code à 6 chiffres affiché :
              <span className="tfa-confirm">
                <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={code} aria-label="Code à 6 chiffres"
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); setCode(v); if (v.length === 6) confirm(v); }} />
                <button type="button" className="btn small" onClick={() => confirm()} disabled={busy}><BusyLabel busy={busy}>Activer</BusyLabel></button>
              </span>
            </li>
          </ol>
        </div>
      ) : (
        <button type="button" className="btn small" onClick={start} disabled={busy}><BusyLabel busy={busy}>Activer la double authentification</BusyLabel></button>
      )}
    </div>
  );
}
