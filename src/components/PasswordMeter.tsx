"use client";
import { useEffect, useState } from "react";

const TARGET = 16;
const COMMON = ["password", "motdepasse", "azerty", "qwerty", "123456", "admin", "bonjour", "iloveyou", "football"];

/** Estime le temps pour casser le mot de passe (attaque hors-ligne rapide : 10 milliards d'essais / s). */
export function estimate(pw: string) {
  if (!pw) return { bits: 0, label: "" };
  const lower = pw.toLowerCase();
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  const unique = new Set(pw).size;
  let bits = Math.min(pw.length, unique * 2.2) * Math.log2(Math.max(pool, 2));
  if (COMMON.some((w) => lower.includes(w))) bits = Math.min(bits, 22 + pw.length);
  if (/^(.)\1+$/.test(pw) || /(0123|1234|2345|3456|abcd|bcde|cdef)/.test(lower)) bits = Math.min(bits, 20);
  const secs = Math.pow(2, bits) / 1e10;
  const f = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);
  let label: string;
  if (secs < 1) label = "instantanément";
  else if (secs < 60) label = `${f(secs)} secondes`;
  else if (secs < 3600) label = `${f(secs / 60)} minutes`;
  else if (secs < 86400) label = `${f(secs / 3600)} heures`;
  else if (secs < 86400 * 365) label = `${f(secs / 86400)} jours`;
  else if (secs < 86400 * 365 * 1e3) label = `${f(secs / (86400 * 365))} ans`;
  else if (secs < 86400 * 365 * 1e6) label = `${f(secs / (86400 * 365 * 1e3))} milliers d'années`;
  else if (secs < 86400 * 365 * 1e9) label = `${f(secs / (86400 * 365 * 1e6))} millions d'années`;
  else label = "des milliards d'années";
  return { bits, label };
}

async function pwned(pw: string): Promise<number> {
  try {
    const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(pw));
    const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const res = await fetch(`https://api.pwnedpasswords.com/range/${hex.slice(0, 5)}`, { headers: { "Add-Padding": "true" } });
    const line = (await res.text()).split("\n").find((l) => l.startsWith(hex.slice(5)));
    return line ? Number(line.split(":")[1]) : 0;
  } catch { return 0; }
}

export default function PasswordMeter({ value, onLeaked }: { value: string; onLeaked?: (leaked: boolean) => void }) {
  const len = [...value].length;
  const { bits, label } = estimate(value);
  const progress = Math.min(1, len / TARGET);
  const level = len === 0 ? 0 : bits < 40 || len < 8 ? 1 : bits < 60 || len < 12 ? 2 : len < TARGET ? 3 : 4;
  const [leaked, setLeaked] = useState(0);

  useEffect(() => {
    setLeaked(0); onLeaked?.(false);
    if (len < 8) return;
    const t = setTimeout(async () => { const n = await pwned(value); setLeaked(n); onLeaked?.(n > 0); }, 600);
    return () => clearTimeout(t);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const msg = [
    "Le taxi attend son premier caractère… 🚕",
    "Panne sèche ⛽ : même une trottinette irait plus loin.",
    "Ça roule… mais en 2 CV. Appuyez sur l'accélérateur !",
    `Plus que ${TARGET - len} caractère${TARGET - len > 1 ? "s" : ""} avant Paris 🗼 Vous y êtes presque !`,
    "Arrivé à Paris sans bouchon ! Mot de passe béton 🎉",
  ][level];
  const police = leaked > 0;
  const arrived = level === 4 && !police;
  const moving = len > 0 && !arrived && !police;
  // La voiture ne dépasse pas le palier atteint : sa position reste cohérente avec le message.
  const pos = arrived ? 1 : Math.min(progress, [0, 0.3, 0.6, 0.92][Math.min(level, 3)]);
  return (
    <div className={`pwm lv${level}${police ? " police" : ""}${moving ? " moving" : ""}`} aria-live="polite">
      <div className="pwm-road" aria-hidden="true">
        <span>🏠</span>
        <div className="pwm-lane">
          <span className="pwm-track" style={{ transform: `translateX(${pos * 100}%)` }}>
            <span className="pwm-car">
              {police && <span className="pwm-siren">🚨</span>}
              {arrived && <span className="pwm-bubble" key="honk">POUET !</span>}
              {moving && <span className="pwm-puff">💨</span>}
              <span className={`pwm-car-i${len === 0 ? " idle" : ""}`}>{police ? "🚓" : "🚕"}</span>
            </span>
          </span>
          {arrived && (
            <span className="pwm-confetti" key="confetti">
              {Array.from({ length: 16 }, (_, i) => (
                <i key={i} style={{ ["--dx" as string]: `${((i % 8) - 3.5) * 22}px`, ["--dy" as string]: `${-30 - (i % 4) * 16}px`, ["--r" as string]: `${i * 83}deg`, ["--h" as string]: String((i * 47) % 360), animationDelay: `${(i % 5) * 40}ms` }} />
              ))}
            </span>
          )}
        </div>
        <span className={arrived ? "pwm-paris hop" : "pwm-paris"}>🗼</span>
      </div>
      <div className="pwm-main">
        <p className="pwm-msg"><strong>{police ? "🚓 Contrôle de police ! Ce mot de passe est fiché : changez de véhicule." : msg}</strong></p>
        {len > 0 && <p className="pwm-time">Temps pour le casser : <strong key={label}>{label}</strong> <span className="muted">· {len} caractère{len > 1 ? "s" : ""}</span></p>}
        {police && <p className="error" role="alert">Il apparaît dans des fuites de données ({new Intl.NumberFormat("fr-FR").format(leaked)} fois). Choisissez-en un autre.</p>}
        {len === 0 && <p className="muted pwm-tip">Astuce : 4 mots simples valent mieux qu'un mot compliqué.</p>}
        {len > 0 && len < TARGET && !police && <p className="muted pwm-tip">Astuce : « croissant chaud lille matin » est plus solide que « Xk9!pQ ».</p>}
        <span className="sr-only">{Math.round(progress * 100)} % de la longueur recommandée</span>
      </div>
    </div>
  );
}
