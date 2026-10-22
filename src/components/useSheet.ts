"use client";
import { useEffect, useState } from "react";

/** Sur téléphone, le calendrier et l'horloge s'ouvrent en panneau fixé en bas de l'écran.
 *  Ils sont alors rendus directement dans <body> : un parent avec effet de verre (backdrop-filter)
 *  ne peut plus les « accrocher » en bas du formulaire, et la page ne défile pas. */
export function useSheet(open: boolean) {
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    try { setSheet(window.matchMedia("(max-width: 560px)").matches); } catch {}
  }, [open]);
  useEffect(() => {
    if (!open || !sheet) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { html.style.overflow = prev; };
  }, [open, sheet]);
  return sheet;
}
