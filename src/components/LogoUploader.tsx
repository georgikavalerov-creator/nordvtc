"use client";
import { useActionState } from "react";
import { BusyLabel } from "./Loader";

type R = { error?: string; ok?: boolean } | undefined;
// Envoi / suppression d'un logo. Les actions viennent de l'administration ou de l'espace chauffeur.
export default function LogoUploader({ current, save, remove }: { current: string | null; save: (s: R, f: FormData) => Promise<R>; remove: (s: R) => Promise<R> }) {
  const [s, act, pending] = useActionState(save, undefined);
  const [rs, ract, rpending] = useActionState(remove, undefined);
  return (
    <div className="adm-box" style={{ display: "grid", gap: 12, maxWidth: 560 }}>
      <strong>Logo sur vos documents</strong>
      <p className="muted" style={{ margin: 0 }}>Affiché en haut des bons de commande, notes et factures. PNG, JPEG ou WebP, 3 Mo maximum. Un fond transparent (PNG) rend mieux à l'impression.</p>
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="Logo actuel" style={{ maxHeight: 80, maxWidth: "100%", objectFit: "contain", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: 8, justifySelf: "start" }} />
      ) : <p className="muted" style={{ margin: 0 }}>Aucun logo pour le moment.</p>}
      <form action={act} className="form" style={{ display: "grid", gap: 8 }}>
        <input type="file" name="logo" accept="image/png,image/jpeg,image/webp" required />
        {s?.error && <p className="error">{s.error}</p>}
        {s?.ok && <p className="notice okmsg">Logo enregistré ✓</p>}
        <button className="btn small" disabled={pending}><BusyLabel busy={pending} busyText="Envoi…">{current ? "Remplacer le logo" : "Ajouter le logo"}</BusyLabel></button>
      </form>
      {current && (
        <form action={ract}>
          <button className="btn ghost small" disabled={rpending}>Supprimer le logo</button>
          {rs?.ok && <small className="muted"> Logo supprimé.</small>}
        </form>
      )}
    </div>
  );
}
