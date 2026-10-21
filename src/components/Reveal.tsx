"use client";
import { useEffect } from "react";

// Apparition douce des blocs au défilement. Léger : un seul IntersectionObserver, aucune bibliothèque.
export default function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".checks li"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("rv-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach((el, k) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) return; // déjà visible : on ne cache pas
      el.style.transitionDelay = `${(k % 4) * 70}ms`;
      el.classList.add("rv");
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
