"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { restoreTrips } from "@/app/compte/(espace)/actions";
import { UNDO_EVENT } from "./HideTrip";
import { BusyLabel } from "./Loader";

/** Après une suppression : « 1 trajet supprimé · Annuler » pendant 12 secondes (sinon : corbeille). */
export default function UndoBar() {
  const [ids, setIds] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  useEffect(() => {
    const on = (e: Event) => {
      const list = ((e as CustomEvent).detail?.ids ?? []) as string[];
      setIds(list); setMsg("");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setIds([]), 12_000);
    };
    window.addEventListener(UNDO_EVENT, on);
    return () => { window.removeEventListener(UNDO_EVENT, on); if (timer.current) clearTimeout(timer.current); };
  }, []);
  if (!ids.length && !msg) return null;
  const close = () => { setIds([]); setMsg(""); };
  return (
    <div className="undo-bar" role="status" aria-live="polite">
      {msg ? <span>{msg}</span> : <span>{ids.length > 1 ? `${ids.length} trajets supprimés` : "Trajet supprimé"}</span>}
      {!msg && (
        <button type="button" className="undo-btn" disabled={pending} onClick={() => start(async () => {
          const r = await restoreTrips(ids);
          if (timer.current) clearTimeout(timer.current);
          setIds([]);
          setMsg(r.error ? r.error : ids.length > 1 ? "Trajets restaurés" : "Trajet restauré");
          timer.current = setTimeout(() => setMsg(""), 3_000);
          router.refresh();
        })}><BusyLabel busy={pending}>Annuler</BusyLabel></button>
      )}
      {!msg && <Link href="/compte/trajets?v=corbeille" className="undo-link" onClick={close}>Corbeille</Link>}
      <button type="button" className="undo-x" aria-label="Fermer" onClick={close}>×</button>
    </div>
  );
}
