"use client";
import { useEffect } from "react";

// Carte animée de la métropole lilloise (trajet A → B au défilement).
export default function MapMount({ target, near = false, margin = "150% 0px" }: { target: string; near?: boolean; margin?: string }) {
  useEffect(() => {
    const el = document.getElementById(target);
    if (!el) return;
    // Démarre après le chargement, quand le navigateur est libre.
    let stop: (() => void) | undefined;
    let cancelled = false;
    // Code de la scène chargé seulement au démarrage de l'animation (pas au chargement de la page).
    const start = () => { if (!cancelled) import("@/lib/mapScene").then((m) => { if (!cancelled) stop = m.mountMap(el) ?? undefined; }); };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => (w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 300));
    // near : rien n'est préparé (ni téléchargé) avant que le bloc approche de l'écran.
    let io: IntersectionObserver | undefined;
    const arm = () => {
      if (!near || !("IntersectionObserver" in window)) return go();
      io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io?.disconnect(); go(); } }, { rootMargin: margin });
      io.observe(el);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => { cancelled = true; window.removeEventListener("load", arm); io?.disconnect(); stop?.(); };
  }, [target, near, margin]);
  return null;
}
