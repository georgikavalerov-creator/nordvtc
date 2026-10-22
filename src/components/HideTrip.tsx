"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { hideTrips } from "@/app/compte/(espace)/actions";

/** Bouton « Supprimer » avec confirmation sur place (un trajet ou tous ceux d'un onglet). */
export default function HideTrip({ ids, label = "Supprimer", confirmText = "Retirer ce trajet de votre espace ?", after }: { ids: string[]; label?: string; confirmText?: string; after?: string }) {
  const [ask, setAsk] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!ids.length) return null;
  const go = () => start(async () => {
    const r = await hideTrips(ids);
    if (r.error) { setErr(r.error); return; }
    setAsk(false);
    if (after) router.push(after); else router.refresh();
  });
  if (!ask) return (
    <button type="button" className="btn small ghost trip-del" onClick={() => { setErr(""); setAsk(true); }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
      {label}
    </button>
  );
  return (
    <span className="trip-del-ask" role="group" aria-label="Confirmer la suppression">
      <span>{confirmText}</span>
      <button type="button" className="btn small danger" onClick={go} disabled={pending}>{pending ? "…" : "Oui, supprimer"}</button>
      <button type="button" className="btn small ghost" onClick={() => setAsk(false)} disabled={pending}>Non</button>
      {err && <span className="error" role="alert">{err}</span>}
    </span>
  );
}
