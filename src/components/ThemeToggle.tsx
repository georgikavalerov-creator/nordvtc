"use client";
import { useEffect, useState } from "react";

type Mode = "auto" | "light" | "dark";
const KEY = "nordvtc-theme";
const LABEL: Record<Mode, string> = { auto: "Automatique", light: "Jour", dark: "Nuit" };
const NEXT: Record<Mode, Mode> = { auto: "light", light: "dark", dark: "auto" };

function apply(m: Mode) {
  const r = document.documentElement;
  // Coupe les transitions le temps du changement : sinon chaque couleur glisse à sa propre vitesse.
  r.classList.add("theme-switching");
  if (m === "auto") r.removeAttribute("data-theme");
  else r.setAttribute("data-theme", m);
  try { m === "auto" ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, m); } catch { /* navigation privée */ }
  window.dispatchEvent(new CustomEvent("nordvtc-theme", { detail: m }));
  void getComputedStyle(r).opacity; // applique les nouvelles couleurs tout de suite
  requestAnimationFrame(() => requestAnimationFrame(() => r.classList.remove("theme-switching")));
}

function useMode(): [Mode, (m: Mode) => void] {
  const [mode, setMode] = useState<Mode>("auto");
  useEffect(() => {
    try { const v = localStorage.getItem(KEY); if (v === "light" || v === "dark") setMode(v); } catch { /* ignoré */ }
    const on = (e: Event) => setMode((e as CustomEvent<Mode>).detail);
    window.addEventListener("nordvtc-theme", on);
    return () => window.removeEventListener("nordvtc-theme", on);
  }, []);
  return [mode, (m) => { setMode(m); apply(m); }];
}

const ICON: Record<Mode, string> = {
  auto: '<path d="M12 3a9 9 0 1 0 0 18z" fill="currentColor"/><circle cx="12" cy="12" r="9"/>',
  light: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
  dark: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
};

/** Bouton d'en-tête : change de mode à chaque clic (Auto → Jour → Nuit). */
export function ThemeButton() {
  const [mode, set] = useMode();
  return (
    <button type="button" className="theme-btn" onClick={() => set(NEXT[mode])} aria-label={`Affichage : ${LABEL[mode]}. Changer`} title={`Affichage : ${LABEL[mode]}`}>
      <svg key={mode} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[mode] }} />
    </button>
  );
}

/** Sélecteur du pied de page : Auto / Jour / Nuit. */
export function ThemeSwitch() {
  const [mode, set] = useMode();
  return (
    <div className="theme-switch" role="group" aria-label="Affichage du site">
      <span>Affichage</span>
      {(["auto", "light", "dark"] as Mode[]).map((m) => (
        <button key={m} type="button" aria-pressed={mode === m} onClick={() => set(m)}>{LABEL[m]}</button>
      ))}
    </div>
  );
}

/** Script exécuté avant l'affichage pour éviter le flash de thème. */
export const THEME_INIT = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
