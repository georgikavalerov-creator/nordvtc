"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";
import { biometricLabel } from "./FaceIdLogin";

type Opts = Parameters<typeof startRegistration>[0]["optionsJSON"];
type Resp = Awaited<ReturnType<typeof startRegistration>>;

/** Invitation visible juste après la connexion : « Activer Face ID » en un geste (si pas encore activé). */
export default function FaceIdPrompt({ count, getOptions, save, storeKey }: { count: number; getOptions: () => Promise<Opts>; save: (r: Resp, name: string) => Promise<{ ok?: boolean; error?: string }>; storeKey: string }) {
  const [show, setShow] = useState(false);
  const [label, setLabel] = useState("Face ID");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  useEffect(() => {
    let hidden = false;
    try { hidden = localStorage.getItem(`nvtc-fid-${storeKey}`) === "later"; } catch {}
    setLabel(biometricLabel());
    setShow(count === 0 && !hidden && browserSupportsWebAuthn());
  }, [count, storeKey]);
  if (!show) return null;
  const later = () => { try { localStorage.setItem(`nvtc-fid-${storeKey}`, "later"); } catch {} setShow(false); };
  async function on() {
    setBusy(true); setMsg("");
    try {
      const ua = navigator.userAgent;
      const name = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Macintosh/.test(ua) ? "Mac" : /Android/.test(ua) ? "Téléphone Android" : /Windows/.test(ua) ? "PC Windows" : "Appareil";
      const r = await save(await startRegistration({ optionsJSON: await getOptions() }), name);
      if (r.error) setMsg(r.error); else { setMsg(`${label} activé ✓ La prochaine fois, connectez-vous en un regard.`); setTimeout(() => { setShow(false); router.refresh(); }, 2500); }
    } catch (e) {
      const n = (e as Error)?.name ?? "";
      setMsg(n === "InvalidStateError" ? `${label} est déjà activé sur cet appareil.` : n === "NotAllowedError" ? "Activation annulée." : "Activation impossible sur cet appareil.");
    } finally { setBusy(false); }
  }
  return (
    <div className="faceid-prompt" role="region" aria-label={`Activer ${label}`}>
      <span className="faceid-ico" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 9v1.5M15 9v1.5M12 9v4h-1M9.5 16a3.5 3.5 0 0 0 5 0" /></svg>
      </span>
      <div className="faceid-prompt-txt">
        <strong>Connectez-vous avec {label}</strong>
        <span>Plus besoin de mot de passe la prochaine fois : un regard suffit.</span>
        {msg && <span className="faceid-prompt-msg" role="status">{msg}</span>}
      </div>
      <div className="faceid-prompt-act">
        <button type="button" className="btn small faceid-btn" onClick={on} disabled={busy}>{busy ? "…" : "Activer"}</button>
        <button type="button" className="linklike" onClick={later}>Plus tard</button>
      </div>
    </div>
  );
}
