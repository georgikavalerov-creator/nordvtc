"use client";
import { useEffect } from "react";
import { mountMap } from "@/lib/mapScene";

// Carte animée de la métropole lilloise (trajet A → B au défilement).
export default function MapMount({ target }: { target: string }) {
  useEffect(() => {
    const el = document.getElementById(target);
    if (!el) return;
    // Démarre après le chargement, quand le navigateur est libre.
    let stop: (() => void) | undefined;
    let cancelled = false;
    const start = () => { if (!cancelled) stop = mountMap(el) ?? undefined; };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => (w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 300));
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => { cancelled = true; window.removeEventListener("load", go); stop?.(); };
  }, [target]);
  return null;
}
