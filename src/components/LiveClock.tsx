"use client";
import { useEffect, useState } from "react";

// Formateurs créés une seule fois (les créer coûte cher sur mobile), à la première utilisation.
let F: { hm: Intl.DateTimeFormat; h: Intl.DateTimeFormat } | null = null;
const fmts = () => (F ??= {
  hm: new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }),
  h: new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", hourCycle: "h23" }),
});
const fmt = () => fmts().hm.format(new Date());
const hourParis = () => Number(fmts().h.format(new Date()));

/** Heure de Lille en direct (et rappel du tarif de nuit entre 22 h et 6 h). Rien n'est rendu côté serveur : pas de décalage d'hydratation. */
export default function LiveClock() {
  const [now, setNow] = useState<{ t: string; night: boolean } | null>(null);
  useEffect(() => {
    const tick = () => { const h = hourParis(); setNow({ t: fmt(), night: h >= 22 || h < 6 }); };
    // Première lecture quand le téléphone est libre (l'heure n'est pas utile dès la première image).
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const first = w.requestIdleCallback ? w.requestIdleCallback(tick, { timeout: 2000 }) : window.setTimeout(tick, 600);
    const id = setInterval(tick, 15_000);
    return () => { clearInterval(id); if (w.cancelIdleCallback) w.cancelIdleCallback(first); else window.clearTimeout(first); };
  }, []);
  if (!now) return null;
  const [h, m] = now.t.split(":");
  return (
    <span className="live-clock" title={now.night ? "Heure de Lille · tarif de nuit en cours (+20 %)" : "Heure de Lille"}>
      {" · "}<time aria-label={`${h} h ${m}`}>{h}<i aria-hidden="true">:</i>{m}</time>{now.night && <em> · tarif de nuit</em>}
    </span>
  );
}
