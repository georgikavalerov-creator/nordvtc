"use client";
import { useEffect, useState } from "react";
import { rememberId } from "@/lib/faceid-local";
import { browserSupportsWebAuthn, browserSupportsWebAuthnAutofill, startAuthentication, WebAuthnAbortService } from "@simplewebauthn/browser";
import { BusyLabel } from "./Loader";

type Opts = Parameters<typeof startAuthentication>[0]["optionsJSON"];
type Resp = Awaited<ReturnType<typeof startAuthentication>>;

/** Libellé adapté à l'appareil : Face ID sur iPhone/iPad, empreinte sur Android, Windows Hello sur PC. */
export function biometricLabel() {
  // Le site ne peut pas savoir si l'appareil utilise le visage ou l'empreinte : on nomme les deux.
  if (typeof navigator === "undefined") return "Face ID / Touch ID";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Macintosh/.test(ua)) return "Face ID / Touch ID";
  if (/Android/.test(ua)) return "empreinte ou visage";
  if (/Windows/.test(ua)) return "Windows Hello";
  return "Face ID / Touch ID";
}

export default function FaceIdLogin({ getOptions, verify, next, orText = "ou avec votre mot de passe" }: { getOptions: () => Promise<Opts>; verify: (r: Resp) => Promise<{ ok?: boolean; error?: string }>; next: string; orText?: string }) {
  const [ok, setOk] = useState(false);
  const [label, setLabel] = useState("Face ID / Touch ID");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { setOk(browserSupportsWebAuthn()); setLabel(biometricLabel()); }, []);
  // Clé proposée directement au-dessus du clavier dès qu'on touche le champ de connexion (un appui → Face ID).
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (!(await browserSupportsWebAuthnAutofill())) return;
        if (!document.querySelector('input[autocomplete*="webauthn"]')) return;
        const optionsJSON = await getOptions();
        if (!live) return;
        const resp = await startAuthentication({ optionsJSON, useBrowserAutofill: true });
        const r = await verify(resp);
        if (r.ok) { rememberId(resp.id); window.location.href = next; } else if (live) setErr(r.error ?? "Connexion impossible.");
      } catch { /* proposition ignorée ou remplacée par le bouton */ }
    })();
    return () => { live = false; try { WebAuthnAbortService.cancelCeremony(); } catch {} };
  }, [getOptions, verify, next]);
  if (!ok) return null;
  async function go() {
    setBusy(true); setErr("");
    try {
      const optionsJSON = await getOptions();
      const resp = await startAuthentication({ optionsJSON });
      const r = await verify(resp);
      if (r.ok) { rememberId(resp.id); window.location.href = next; return; }
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
        <BusyLabel busy={busy} busyText="Vérification…">{`Se connecter avec ${label}`}</BusyLabel>
      </button>
      {err && <p className="error" role="alert">{err}</p>}
      <p className="faceid-or"><span>{orText}</span></p>
    </div>
  );
}
