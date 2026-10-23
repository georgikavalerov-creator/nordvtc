"use client";
import { useEffect } from "react";

/**
 * Pastille glissante (démo « tabs » d'interfaces.dev) pour tous les groupes d'onglets du site :
 * réservée aux groupes d'un seul tenant (pas aux puces séparées) ;
 * une seule couche colorée par groupe, découpée sur l'élément actif par un clip-path qui glisse
 * (peinture seule, aucun recalcul de mise en page). Sa couleur est lue sur l'élément actif lui-même,
 * donc elle suit le thème jour / nuit sans réglage.
 */
const GROUPS: [container: string, items: string][] = [
  [".acc-tabs", ":scope > a, :scope > button"],
  [".theme-switch", ":scope > button"],
  [".acc-nav-list", ":scope > a"],
  [".adm-nav", "a"],
];
const ACTIVE = '.on, [aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], [aria-current="page"]';

type G = { el: HTMLElement; items: string; layer: HTMLElement; look?: string };

export default function Gliders() {
  useEffect(() => {
    if (!("clipPath" in document.documentElement.style)) return;
    const groups = new Map<HTMLElement, G>();

    const activeOf = (g: G) => [...g.el.querySelectorAll<HTMLElement>(g.items)].find((i) => i.matches(ACTIVE)) ?? null;

    // Lit l'apparence « active » réelle (fond, rayon) avant de la confier à la pastille.
    const readLook = (g: G, item: HTMLElement) => {
      item.removeAttribute("data-glide-on");
      const cs = getComputedStyle(item);
      g.layer.style.backgroundColor = cs.backgroundColor;
      g.layer.style.backgroundImage = cs.backgroundImage;
      g.look = cs.borderTopLeftRadius;
    };

    const place = (g: G, animate: boolean) => {
      const item = activeOf(g);
      g.el.querySelectorAll("[data-glide-on]").forEach((n) => n !== item && n.removeAttribute("data-glide-on"));
      if (!item) { g.layer.style.opacity = "0"; return; }
      if (!item.hasAttribute("data-glide-on")) readLook(g, item);
      // Repère du contenu (et non de la zone visible) : juste aussi dans un groupe qui défile.
      const el = g.el, c = el.getBoundingClientRect(), r = item.getBoundingClientRect();
      const W = el.scrollWidth, H = el.scrollHeight;
      const t = r.top - c.top - el.clientTop + el.scrollTop, l = r.left - c.left - el.clientLeft + el.scrollLeft;
      g.layer.style.width = `${W}px`; g.layer.style.height = `${H}px`;
      const clip = `inset(${t}px ${W - l - r.width}px ${H - t - r.height}px ${l}px round ${g.look || "999px"})`;
      g.layer.classList.toggle("glide-anim", animate && g.layer.style.opacity === "1");
      g.layer.style.clipPath = clip;
      g.layer.style.opacity = "1";
      item.setAttribute("data-glide-on", "");
    };

    const attach = () => {
      for (const [sel, items] of GROUPS) {
        document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          if (groups.has(el) || !el.querySelector(items)) return;
          const layer = document.createElement("span");
          layer.className = "glider";
          layer.setAttribute("aria-hidden", "true");
          layer.style.opacity = "0";
          el.classList.add("has-glider");
          if (getComputedStyle(el).position === "static") el.style.position = "relative";
          el.prepend(layer);
          const g = { el, items, layer };
          groups.set(el, g);
          place(g, false);
        });
      }
      for (const [el, g] of groups) if (!el.isConnected) { g.layer.remove(); groups.delete(el); }
    };

    let raf = 0, pendingAttach = false;
    const schedule = (withAttach: boolean) => {
      pendingAttach ||= withAttach;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (pendingAttach) { pendingAttach = false; attach(); }
        groups.forEach((g) => place(g, true));
      });
    };
    // Re-lecture des couleurs quand le thème change.
    const relook = () => groups.forEach((g) => { const i = activeOf(g); if (i) { readLook(g, i); place(g, false); } });

    attach();
    const mo = new MutationObserver((list) => {
      let structure = false, state = false;
      for (const m of list) {
        if (m.type === "childList") structure = true;
        else if (m.target instanceof HTMLElement && m.target.closest(".has-glider") && m.attributeName !== "data-glide-on") state = true;
      }
      if (structure || state) schedule(structure);
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "aria-selected", "aria-pressed", "aria-checked", "aria-current"] });
    const onResize = () => groups.forEach((g) => place(g, false));
    addEventListener("resize", onResize);
    addEventListener("nordvtc-theme", () => requestAnimationFrame(relook));
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", relook);
    return () => { mo.disconnect(); removeEventListener("resize", onResize); mq.removeEventListener("change", relook); cancelAnimationFrame(raf); };
  }, []);
  return null;
}
