"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Micro-interactions légères (aucune bibliothèque) :
//  - onde au clic sur boutons, flèches et cartes cliquables
//  - halo qui suit le pointeur sur les cartes (appareils avec souris uniquement)
//  - lien de la page courante souligné dans le menu
export default function Interact() {
  const path = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const onDown = (e: PointerEvent) => {
      if (reduced || e.button > 0) return;
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(".btn, .pass-ctrl button, a.card, .quick-btn");
      if (!el || (el as HTMLButtonElement).disabled) return;
      const r = el.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const s = document.createElement("span");
      s.className = "ripple";
      s.style.width = s.style.height = `${size}px`;
      s.style.left = `${e.clientX - r.left - size / 2}px`;
      s.style.top = `${e.clientY - r.top - size / 2}px`;
      el.appendChild(s);
      s.addEventListener("animationend", () => s.remove(), { once: true });
      setTimeout(() => s.remove(), 900);
    };

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      const t = e.target as HTMLElement | null;
      const el = t?.closest<HTMLElement>(".card, .iconbox, .pricing, .reassure");
      if (!el) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };

    document.addEventListener("pointerdown", onDown, { passive: true });
    if (fine && !reduced) document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.querySelectorAll<HTMLAnchorElement>(".nav a:not(.btn)").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const on = href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
      a.classList.toggle("is-current", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }, [path]);

  return null;
}
