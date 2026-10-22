"use client";
import { useEffect } from "react";
import { mountCine } from "@/lib/cineScene";

// Démarre la scène animée (canvas) d'une section marquée .cine-root.
export default function CineMount({ target }: { target: string }) {
  useEffect(() => {
    const el = document.getElementById(target);
    if (!el) return;
    // Démarre après le chargement, quand le navigateur est libre : la page devient interactive plus vite.
    let stop: (() => void) | undefined;
    let cancelled = false;
    const start = () => { if (!cancelled) stop = mountCine(el); };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => (w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 300));
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => { cancelled = true; window.removeEventListener("load", go); stop?.(); };
  }, [target]);
  return null;
}
