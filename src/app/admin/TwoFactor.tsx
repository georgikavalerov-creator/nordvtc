"use client";
import { useActionState, useState } from "react";
import { confirm2fa, disable2fa, makeBackupCodes, set2faChannel, start2fa } from "./actions";

type R = { error?: string; ok?: boolean | string } | undefined;
const Msg = ({ s }: { s: R }) => (s?.error ? <p className="error">{s.error}</p> : s?.ok ? <p className="notice okmsg">{typeof s.ok === "string" ? s.ok : "Enregistré ✓"}</p> : null);

export function TwoFactorChannels({ email, sms, smsAvailable, phone, backup }: { email: boolean; sms: boolean; smsAvailable: boolean; phone: string; backup: number }) {
  const [st, setSt] = useState({ email, sms });
  const [codes, setCodes] = useState<string[] | null>(null);
  const [left, setLeft] = useState(backup);
  const toggle = async (via: "email" | "sms") => { const on = !st[via]; await set2faChannel(via, on); setSt((x) => ({ ...x, [via]: on })); };
  return (
    <div className="adm-box" style={{ display: "grid", gap: 10, maxWidth: 640 }}>
      <strong>Autres moyens de recevoir le code</strong>
      <label className="inline"><input type="checkbox" checked={st.email} onChange={() => toggle("email")} /> <span>Code par e-mail (envoyé à votre adresse de notification)</span></label>
      <label className="inline" style={{ opacity: smsAvailable ? 1 : .5 }}><input type="checkbox" checked={st.sms} disabled={!smsAvailable} onChange={() => toggle("sms")} /> <span>Code par SMS{phone ? ` au ${phone}` : ""}{smsAvailable ? "" : " (service SMS non configuré)"}</span></label>
      <div style={{ display: "grid", gap: 6 }}>
        <span><b>Codes de secours</b> : {left > 0 ? `${left} code(s) restant(s)` : "aucun"}. À garder en lieu sûr (papier, coffre-fort de mots de passe) : chacun permet une connexion si le téléphone est perdu.</span>
        <button type="button" className="btn ghost small" style={{ justifySelf: "start" }} onClick={async () => { const c = await makeBackupCodes(); setCodes(c); setLeft(c.length); }}>{left > 0 ? "Générer de nouveaux codes" : "Générer 10 codes de secours"}</button>
        {codes && (
          <div className="tfa-codes">
            <p className="error" style={{ margin: 0 }}>Notez-les maintenant : ils ne seront plus jamais affichés.</p>
            <ul>{codes.map((c) => <li key={c}><code>{c}</code></li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TwoFactor({ enabled }: { enabled: boolean }) {
  const [setup, setSetup] = useState<{ qr: string; secret: string; uri: string } | null>(null);
  const [err, setErr] = useState("");
  const [cs, confirm, cPending] = useActionState(confirm2fa, undefined);
  const [ds, disable, dPending] = useActionState(disable2fa, undefined);
  if (enabled || cs?.ok) {
    return (
      <form action={disable} className="adm-box" style={{ display: "grid", gap: 10, maxWidth: 640 }}>
        <strong>Double authentification : activée ✓</strong>
        <small className="muted">Le code de votre application est demandé à chaque connexion à l&apos;administration.</small>
        <Msg s={cs} /><Msg s={ds} />
        <details>
          <summary style={{ cursor: "pointer" }}>Désactiver (téléphone changé…)</summary>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <input name="code" inputMode="numeric" maxLength={7} placeholder="Code actuel" autoComplete="one-time-code" style={{ maxWidth: 160 }} />
            <button className="btn ghost small" disabled={dPending}>Désactiver</button>
          </div>
        </details>
      </form>
    );
  }
  return (
    <div className="adm-box" style={{ display: "grid", gap: 10, maxWidth: 640 }}>
      <strong>Double authentification (fortement recommandée)</strong>
      <small className="muted">Même si quelqu&apos;un vole votre mot de passe, il ne pourra pas entrer sans le code à 6 chiffres de votre téléphone (Google Authenticator, Mots de passe d&apos;iPhone, 1Password…).</small>
      {!setup ? (
        <button type="button" className="btn small" style={{ justifySelf: "start" }} onClick={async () => { const r = await start2fa(); if ("error" in r) setErr(r.error); else setSetup(r); }}>Activer</button>
      ) : (
        <form action={confirm} style={{ display: "grid", gap: 10 }}>
          <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6, fontSize: ".92rem" }}>
            <li>Scannez ce QR code avec l&apos;appareil photo de l&apos;iPhone (ou votre application d&apos;authentification).</li>
            <li>Entrez le code à 6 chiffres affiché pour confirmer.</li>
          </ol>
          <div className="tfa-qr" dangerouslySetInnerHTML={{ __html: setup.qr }} />
          <small className="muted">Sur le téléphone lui-même : <a href={setup.uri}>ajouter directement</a> · clé manuelle : <code style={{ wordBreak: "break-all" }}>{setup.secret}</code></small>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input name="code" inputMode="numeric" maxLength={7} placeholder="123 456" autoComplete="one-time-code" required style={{ maxWidth: 160 }} />
            <button className="btn small" disabled={cPending}>{cPending ? "Vérification…" : "Confirmer"}</button>
          </div>
          <Msg s={cs} />
        </form>
      )}
      {err && <p className="error">{err}</p>}
    </div>
  );
}
