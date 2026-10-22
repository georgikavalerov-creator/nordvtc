"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Affiche (et active) son contenu seulement à l'approche à l'écran : la page s'ouvre plus vite.
 *  L'espace est réservé à l'avance pour éviter tout saut de mise en page. */
export default function WhenNear({ children, minHeight = 600, margin = "150% 0px" }: { children: ReactNode; minHeight?: number; margin?: string }) {
  const [on, setOn] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el || on) return;
    if (!("IntersectionObserver" in window)) { setOn(true); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setOn(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [on, margin]);
  return <div ref={box} style={on ? undefined : { minHeight }} className={on ? undefined : "when-near"}>{on ? children : null}</div>;
}
