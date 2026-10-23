"use client";
import { useEffect } from "react";

/**
 * Ligne de parcours des étapes (inspirée de mikes.cv) : sur téléphone, un trait relie les pastilles
 * et se remplit au défilement ; chaque étape s'allume (petite pulsation) quand on l'atteint.
 * Tout passe par transform et des classes : aucun recalcul de mise en page pendant le défilement.
 */
export default function StepsTrack({ target }: { target: string }) {
  useEffect(() => {
    const ol = document.getElementById(target);
    const wrap = ol?.parentElement;
    if (!ol || !wrap) return;
    const items = [...ol.querySelectorAll<HTMLLIElement>(":scope > li")];
    if (items.length < 2) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vertical = matchMedia("(max-width: 900px)");

    const track = document.createElement("div");
    track.className = "steps-track";
    track.setAttribute("aria-hidden", "true");
    // Un segment par intervalle entre deux pastilles : le trait ne passe jamais sur les numéros.
    track.innerHTML = "<span><i></i></span>".repeat(items.length - 1);
    if (getComputedStyle(wrap).position === "static") wrap.style.position = "relative";
    wrap.appendChild(track);
    const segs = [...track.children] as HTMLElement[];

    let centers: number[] = [];
    let half = 26, gap = 6;
    // Positions de mise en page (offsetTop/Left : insensibles aux animations d'entrée), mesurées une fois
    // et au redimensionnement, jamais pendant le défilement.
    const offset = (el: HTMLElement) => {
      let x = 0, y = 0, n: HTMLElement | null = el;
      while (n && n !== wrap) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
      return { x, y };
    };
    const measure = () => {
      half = (parseFloat(getComputedStyle(items[0], "::before").height) || 52) / 2;
      centers = items.map((li) => offset(li).y + parseFloat(getComputedStyle(li).paddingTop) + half);
      const x = offset(items[0]).x + parseFloat(getComputedStyle(items[0]).paddingLeft) + half;
      track.style.cssText = `left:${x - 1}px;top:0;height:0`;
      segs.forEach((s, i) => { s.style.cssText = `top:${centers[i] + half + gap}px;height:${Math.max(0, centers[i + 1] - centers[i] - 2 * (half + gap))}px`; });
      track.hidden = !vertical.matches;
      ol.classList.toggle("has-track", vertical.matches);
      update();
    };
    let raf = 0;
    const update = () => {
      raf = 0;
      const base = wrap.getBoundingClientRect().top;
      const anchor = innerHeight * 0.62 - base; // repère de lecture, dans le repère du conteneur
      items.forEach((li, i) => li.classList.toggle("is-lit", centers[i] < anchor));
      segs.forEach((s, i) => {
        const a = centers[i] + half + gap, b = centers[i + 1] - half - gap;
        const p = reduced ? 1 : Math.min(1, Math.max(0, (anchor - a) / Math.max(1, b - a)));
        (s.firstElementChild as HTMLElement).style.transform = `scaleY(${p.toFixed(4)})`;
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    measure();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", measure);
    vertical.addEventListener("change", measure);
    const ro = new ResizeObserver(measure); ro.observe(ol);
    return () => {
      removeEventListener("scroll", onScroll); removeEventListener("resize", measure);
      vertical.removeEventListener("change", measure); ro.disconnect(); cancelAnimationFrame(raf);
      track.remove(); ol.classList.remove("has-track"); items.forEach((li) => li.classList.remove("is-lit"));
    };
  }, [target]);
  return null;
}
