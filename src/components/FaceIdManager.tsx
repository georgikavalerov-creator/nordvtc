"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";
import { biometricLabel } from "./FaceIdLogin";

type Opts = Parameters<typeof startRegistration>[0]["optionsJSON"];
type Resp = Awaited<ReturnType<typeof startRegistration>>;
type Row = { id: string; name: string; created_at: string; last_used_at: string | null };

const deviceName = () => {
  const ua = navigator.userAgent;
  return /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "iPad" : /Macintosh/.test(ua) ? "Mac" : /Android/.test(ua) ? "Téléphone Android" : /Windows/.test(ua) ? "PC Windows" : "Appareil";
};
const d = (s: string | null) => (s ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(s)) : "jamais");

/** Activer / retirer Face ID (clé d'accès) sur ses appareils. */
export default function FaceIdManager({ list, getOptions, save, remove }: { list: Row[]; getOptions: () => Promise<Opts>; save: (r: Resp, name: string) => Promise<{ ok?: boolean; error?: string }>; remove: (id: string) => Promise<{ ok?: boolean; error?: string }> }) {
  const [supported, setSupported] = useState(true);
  const [label, setLabel] = useState("Face ID");
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
  const [pending, start] = useTransition();
  const router = useRouter();
  useEffect(() => { setSupported(browserSupportsWebAuthn()); setLabel(biometricLabel()); }, []);

  async function add() {
    setMsg({});
    try {
      const optionsJSON = await getOptions();
      const resp = await startRegistration({ optionsJSON });
      const r = await save(resp, deviceName());
      if (r.error) setMsg({ error: r.error }); else { setMsg({ ok: `${label} activé sur cet appareil ✓` }); router.refresh(); }
    } catch (e) {
      const n = (e as Error)?.name ?? "";
      setMsg({ error: n === "InvalidStateError" ? `${label} est déjà activé sur cet appareil.` : n === "NotAllowedError" ? "Activation annulée." : "Activation impossible sur cet appareil." });
    }
  }

  return (
    <section className="adm-box faceid-box" id="face-id">
      <div className="faceid-head">
        <span className="faceid-ico" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 9v1.5M15 9v1.5M12 9v4h-1M9.5 16a3.5 3.5 0 0 0 5 0" /></svg>
        </span>
        <div>
          <strong>Connexion avec {label}</strong>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: ".9rem" }}>Plus besoin du mot de passe ni du code : votre visage ou votre empreinte suffit. Ils ne quittent jamais votre appareil.</p>
        </div>
      </div>
      {list.length > 0 && (
        <ul className="faceid-list">
          {list.map((k) => (
            <li key={k.id}>
              <span><strong>{k.name}</strong><small className="muted">Ajouté le {d(k.created_at)} · dernière utilisation : {d(k.last_used_at)}</small></span>
              <button type="button" className="btn small ghost" disabled={pending} onClick={() => start(async () => { await remove(k.id); router.refresh(); })}>Retirer</button>
            </li>
          ))}
        </ul>
      )}
      {supported ? <button type="button" className="btn small" onClick={add}>Activer {label} sur cet appareil</button> : <p className="muted">Ce navigateur ne gère pas les clés d&apos;accès.</p>}
      {msg.error && <p className="error" role="alert">{msg.error}</p>}
      {msg.ok && <p className="notice okmsg" role="status">{msg.ok}</p>}
    </section>
  );
}
