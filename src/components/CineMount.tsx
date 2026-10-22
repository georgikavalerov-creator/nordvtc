"use client";
import { useEffect } from "react";
import { mountCine } from "@/lib/cineScene";

// Démarre la scène animée (canvas) d'une section marquée .cine-root.
export default function CineMount({ target, near = false }: { target: string; near?: boolean }) {
  useEffect(() => {
    const el = document.getElementById(target);
    if (!el) return;
    // Démarre après le chargement, quand le navigateur est libre : la page devient interactive plus vite.
    let stop: (() => void) | undefined;
    let cancelled = false;
    const start = () => { if (!cancelled) stop = mountCine(el); };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => (w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 300));
    // near : rien n'est préparé (ni téléchargé) avant que le bloc approche de l'écran.
    let io: IntersectionObserver | undefined;
    const arm = () => {
      if (!near || !("IntersectionObserver" in window)) return go();
      io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io?.disconnect(); go(); } }, { rootMargin: "150% 0px" });
      io.observe(el);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => { cancelled = true; window.removeEventListener("load", arm); io?.disconnect(); stop?.(); };
  }, [target, near]);
  return null;
}
