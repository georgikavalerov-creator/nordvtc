"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hideTrips } from "@/app/compte/(espace)/actions";
import { BusyLabel } from "./Loader";

export const UNDO_EVENT = "nvtc-trips-hidden";

/** Bouton « Supprimer » avec confirmation sur place (un trajet ou tous ceux d'un onglet).
 *  Le trajet part dans la corbeille : une barre « Annuler » permet de le récupérer aussitôt. */
export default function HideTrip({ ids, label = "Supprimer", confirmText = "Supprimer ce trajet de votre espace ?", after, booked = false, detailHref }: { ids: string[]; label?: string; confirmText?: string; after?: string; booked?: boolean; detailHref?: string }) {
  const [ask, setAsk] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!ids.length) return null;
  const go = () => start(async () => {
    const r = await hideTrips(ids);
    if (r.error) { setErr(r.error); return; }
    setAsk(false);
    window.dispatchEvent(new CustomEvent(UNDO_EVENT, { detail: { ids: r.ids ?? ids } }));
    if (after) router.push(after); else router.refresh();
  });
  if (!ask) return (
    <button type="button" className="btn small ghost trip-del" onClick={() => { setErr(""); setAsk(true); }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
      <span className="trip-del-t">{label}</span>
    </button>
  );
  return (
    <span className={`trip-del-ask${booked ? " warn" : ""}`} role="group" aria-label="Confirmer la suppression">
      {booked ? (
        <span><strong>Ce trajet est toujours réservé.</strong> Le supprimer de votre espace ne l&apos;annule pas.{detailHref && <> Pour ne plus faire la course, <Link href={detailHref}>annulez-la d&apos;abord</Link>.</>}</span>
      ) : <span>{confirmText}</span>}
      <button type="button" className="btn small danger" onClick={go} disabled={pending}><BusyLabel busy={pending}>{booked ? "Supprimer quand même" : "Oui, supprimer"}</BusyLabel></button>
      <button type="button" className="btn small ghost" onClick={() => setAsk(false)} disabled={pending}>Non</button>
      {err && <span className="error" role="alert">{err}</span>}
    </span>
  );
}
