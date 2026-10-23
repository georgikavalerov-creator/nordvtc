"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";

// Mesure de conversion sans cookie : clics sur les boutons de réservation et d'appel.
export default function CtaTracker() {
  useEffect(() => {
    // Après le premier affichage : les pages suivantes (navigation interne) auront leur fondu d'entrée.
    // Posé au premier clic sur un lien interne (pas au chargement : changer une classe de <html> pendant
    // le chargement oblige le navigateur à recalculer toute la page).
    const ready = () => {
      if (document.documentElement.classList.contains("nav-ready")) return;
      document.querySelectorAll(".page-enter").forEach((el) => el.setAttribute("data-seen", ""));
      document.documentElement.classList.add("nav-ready");
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("/")) ready();
      const page = location.pathname;
      if (href.startsWith("tel:")) track("Clic Appeler", { page });
      else if (href.startsWith("/reservation")) track("Clic Réserver", { page });
    };
    // Mobile / tablette : même retour visuel qu'au survol (couleur + halo + flèche) au toucher.
    const timers = new WeakMap<Element, number>();
    const onDown = (e: Event) => {
      const b = (e.target as Element | null)?.closest?.(".btn, .quick-btn");
      if (!b) return;
      b.classList.add("is-pressed");
      window.clearTimeout(timers.get(b));
      timers.set(b, window.setTimeout(() => b.classList.remove("is-pressed"), 700));
    };
    const noop = () => {}; // active :active sur iOS Safari
    document.addEventListener("click", onClick, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("touchstart", noop, { passive: true });
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("touchstart", noop);
    };
  }, []);
  return null;
}
