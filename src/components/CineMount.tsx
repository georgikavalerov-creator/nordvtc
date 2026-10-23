"use client";
import { useEffect } from "react";

// Démarre la scène animée (canvas) d'une section marquée .cine-root.
export default function CineMount({ target, near = false, margin = "150% 0px" }: { target: string; near?: boolean; margin?: string }) {
  useEffect(() => {
    const el = document.getElementById(target);
    if (!el) return;
    // Démarre après le chargement, quand le navigateur est libre : la page devient interactive plus vite.
    let stop: (() => void) | undefined;
    let cancelled = false;
    // Code de la scène chargé seulement au démarrage de l'animation (pas au chargement de la page).
    const start = () => { if (!cancelled) import("@/lib/cineScene").then((m) => { if (!cancelled) stop = m.mountCine(el) ?? undefined; }); };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    // Haut de page : on laisse d'abord la page s'afficher et devenir utilisable, puis l'animation démarre.
    const idle = () => (w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 300));
    const go = () => (near ? idle() : window.setTimeout(idle, 1200));
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
