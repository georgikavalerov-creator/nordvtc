"use client";
import { useEffect, useState } from "react";
import { browserSupportsWebAuthn, startAuthentication } from "@simplewebauthn/browser";

type Opts = Parameters<typeof startAuthentication>[0]["optionsJSON"];
type Resp = Awaited<ReturnType<typeof startAuthentication>>;

/** Libellé adapté à l'appareil : Face ID sur iPhone/iPad, empreinte sur Android, Windows Hello sur PC. */
export function biometricLabel() {
  if (typeof navigator === "undefined") return "Face ID";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "Face ID";
  if (/Macintosh/.test(ua)) return navigator.maxTouchPoints > 1 ? "Face ID" : "Touch ID";
  if (/Android/.test(ua)) return "l'empreinte digitale";
  if (/Windows/.test(ua)) return "Windows Hello";
  return "Face ID";
}

export default function FaceIdLogin({ getOptions, verify, next }: { getOptions: () => Promise<Opts>; verify: (r: Resp) => Promise<{ ok?: boolean; error?: string }>; next: string }) {
  const [ok, setOk] = useState(false);
  const [label, setLabel] = useState("Face ID");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { setOk(browserSupportsWebAuthn()); setLabel(biometricLabel()); }, []);
  if (!ok) return null;
  async function go() {
    setBusy(true); setErr("");
    try {
      const optionsJSON = await getOptions();
      const resp = await startAuthentication({ optionsJSON });
      const r = await verify(resp);
      if (r.ok) { window.location.href = next; return; }
      setErr(r.error ?? "Connexion impossible.");
    } catch (e) {
      const m = (e as Error)?.message ?? "";
      setErr(m.includes("Trop") ? m : `Connexion annulée, ou ${label} pas encore activé sur cet appareil : connectez-vous avec votre mot de passe, puis activez-le dans vos réglages.`);
    } finally { setBusy(false); }
  }
  return (
    <div className="faceid-login">
      <button type="button" className="btn faceid-btn" onClick={go} disabled={busy}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 9v1.5M15 9v1.5M12 9v4h-1M9.5 16a3.5 3.5 0 0 0 5 0" /></svg>
        {busy ? "Vérification…" : `Se connecter avec ${label}`}
      </button>
      {err && <p className="error" role="alert">{err}</p>}
      <p className="faceid-or"><span>ou avec votre mot de passe</span></p>
    </div>
  );
}
