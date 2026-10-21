"use client";
import { useEffect } from "react";

// Halo qui suit la souris + légère inclinaison 3D sur les cartes de prix (souris uniquement).
export default function PricingFx() {
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const c = (e.target as Element | null)?.closest?.<HTMLElement>(".pricing");
      if (!c) return;
      const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty("--mx", `${x}px`); c.style.setProperty("--my", `${y}px`);
      c.style.setProperty("--rx", `${((y / r.height - 0.5) * -7).toFixed(2)}deg`);
      c.style.setProperty("--ry", `${((x / r.width - 0.5) * 9).toFixed(2)}deg`);
    };
    const out = (e: PointerEvent) => {
      const c = (e.target as Element | null)?.closest?.<HTMLElement>(".pricing");
      if (c && !c.contains(e.relatedTarget as Node | null)) { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); }
    };
    const click = (e: MouseEvent) => {
      const c = (e.target as Element | null)?.closest?.<HTMLElement>(".pricing");
      if (c && !(e.target as Element).closest("a")) c.querySelector<HTMLAnchorElement>("a.btn")?.click();
    };
    document.addEventListener("click", click);
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", out, { passive: true });
    return () => { document.removeEventListener("click", click); document.removeEventListener("pointermove", move); document.removeEventListener("pointerout", out); };
  }, []);
  return null;
}
