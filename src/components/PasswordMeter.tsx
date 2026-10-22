"use client";
import { useEffect, useState } from "react";

const TARGET = 16; // longueur conseillée
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
  const level = len === 0 ? 0 : bits < 40 || len < 8 ? 1 : bits < 60 || len < 12 ? 2 : len < TARGET ? 3 : 4;
  const [leaked, setLeaked] = useState(0);

  useEffect(() => {
    setLeaked(0); onLeaked?.(false);
    if (len < 8) return;
    const t = setTimeout(async () => { const n = await pwned(value); setLeaked(n); onLeaked?.(n > 0); }, 600);
    return () => clearTimeout(t);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const lv = leaked > 0 ? 1 : level;
  const names = ["", "Faible", "Moyen", "Bon", "Excellent"];
  return (
    <div className={`pwm2 lv${lv}`} aria-live="polite">
      <div className="pwm2-bar" aria-hidden="true">{[1, 2, 3, 4].map((i) => <span key={i} className={i <= lv ? "on" : ""} />)}</div>
      {len === 0 ? (
        <p className="pwm2-tip">10 caractères minimum. Conseil : plusieurs mots simples (« croissant chaud lille matin ») sont plus solides qu&apos;un mot compliqué.</p>
      ) : (
        <p className="pwm2-txt"><strong>{names[lv]}</strong><span> · temps estimé pour le deviner : {label} · {len} caractère{len > 1 ? "s" : ""}</span></p>
      )}
      {leaked > 0 && <p className="error" role="alert">Ce mot de passe apparaît dans des fuites de données ({new Intl.NumberFormat("fr-FR").format(leaked)} fois). Choisissez-en un autre.</p>}
    </div>
  );
}
