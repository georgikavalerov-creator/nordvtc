"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Effets de défilement façon « page produit » : chaque élément [data-fx] reçoit des variables CSS
// --enter (0→1 quand il entre à l'écran), --p (0→1 pendant toute la traversée) et --leave (0→1 quand il sort par le haut).
// Un seul écouteur de scroll, throttlé par requestAnimationFrame. Sans JS, tout reste visible (valeurs par défaut).
export default function ScrollFX() {
  const path = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("fx-on");

    // découpe des phrases en mots pour l'effet « texte qui s'allume »
    document.querySelectorAll<HTMLElement>("[data-words]:not([data-split])").forEach((el) => {
      const words = (el.textContent || "").trim().split(/\s+/);
      el.textContent = "";
      words.forEach((w, i) => {
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = w;
        s.style.setProperty("--i", String(i));
        el.appendChild(s);
        el.appendChild(document.createTextNode(" "));
      });
      el.style.setProperty("--n", String(words.length));
      el.dataset.split = "1";
    });

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-fx]"));
    let raf = 0;
    const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        el.style.setProperty("--enter", clamp((vh - r.top) / (vh * 0.75)).toFixed(3));
        el.style.setProperty("--p", clamp((vh - r.top) / (vh + r.height)).toFixed(3));
        el.style.setProperty("--leave", clamp(-r.top / Math.max(r.height, 1)).toFixed(3));
        // section collante : progression à l'intérieur du conteneur
        if (el.dataset.fx === "sticky") el.style.setProperty("--s", clamp(-r.top / Math.max(r.height - vh, 1)).toFixed(3));
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [path]);
  return null;
}
