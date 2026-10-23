"use client";
import { useEffect, useState } from "react";

const fmt = () => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).format(new Date());
const hourParis = () => Number(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", hourCycle: "h23" }).format(new Date()));

/** Heure de Lille en direct (et rappel du tarif de nuit entre 22 h et 6 h). Rien n'est rendu côté serveur : pas de décalage d'hydratation. */
export default function LiveClock() {
  const [now, setNow] = useState<{ t: string; night: boolean } | null>(null);
  useEffect(() => {
    const tick = () => { const h = hourParis(); setNow({ t: fmt(), night: h >= 22 || h < 6 }); };
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return null;
  const [h, m] = now.t.split(":");
  return (
    <span className="live-clock" title={now.night ? "Heure de Lille · tarif de nuit en cours (+20 %)" : "Heure de Lille"}>
      {" · "}<time aria-label={`${h} h ${m}`}>{h}<i aria-hidden="true">:</i>{m}</time>{now.night && <em> · tarif de nuit</em>}
    </span>
  );
}
