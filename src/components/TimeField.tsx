"use client";
import { useRef } from "react";

// Sélecteur d'heure : flèches ▲▼ (clic), flèches du clavier ↑↓, molette (champ actif) et glissement vertical au doigt sur mobile.
// Valeur au format "HH:MM" (chaîne vide tant que rien n'est choisi).
const pad = (n: number) => String(n).padStart(2, "0");

function Col({ label, value, max, step, onChange, onDone }: { label: string; value: number | null; max: number; step: number; onChange: (n: number) => void; onDone?: () => void }) {
  const drag = useRef<{ y: number; v: number; moved: boolean } | null>(null);
  const bump = (d: number) => {
    const base = value ?? (d > 0 ? -step : max + 1);
    // on s'aligne sur le pas (5 min) avant d'avancer
    const aligned = d > 0 ? Math.floor(base / step) * step + step : Math.ceil(base / step) * step - step;
    onChange(((aligned % (max + 1)) + (max + 1)) % (max + 1));
  };
  return (
    <span className="tf-col">
      <input
        inputMode="numeric"
        aria-label={label}
        placeholder="--"
        maxLength={2}
        value={value === null ? "" : pad(value)}
        onChange={(e) => {
          const d = e.target.value.replace(/\D/g, "").slice(-2);
          if (d === "") return;
          const n = Math.min(max, Number(d));
          onChange(n);
          if (d.length === 2) onDone?.();
        }}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") { e.preventDefault(); bump(1); }
          if (e.key === "ArrowDown") { e.preventDefault(); bump(-1); }
        }}
        onWheel={(e) => {
          if (document.activeElement !== e.currentTarget) return;
          bump(e.deltaY < 0 ? 1 : -1);
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") return;
          drag.current = { y: e.clientY, v: value ?? 0, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const steps = Math.round((d.y - e.clientY) / 22);
          if (steps === 0) return;
          d.moved = true;
          const span = max + 1;
          onChange((((d.v + steps * step) % span) + span) % span);
        }}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
      />
      <span className="tf-arrows">
        <button type="button" tabIndex={-1} aria-label={`${label} +`} onClick={() => bump(1)}>▲</button>
        <button type="button" tabIndex={-1} aria-label={`${label} −`} onClick={() => bump(-1)}>▼</button>
      </span>
    </span>
  );
}

export default function TimeField({ value, onChange, invalid }: { value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const [h, m] = value ? value.split(":").map(Number) : [null, null];
  const set = (nh: number | null, nm: number | null) => onChange(`${pad(nh ?? 8)}:${pad(nm ?? 0)}`);
  const minRef = useRef<HTMLSpanElement>(null);
  return (
    <span className="tf" aria-invalid={invalid || undefined} role="group" aria-label="Heure de prise en charge">
      <Col label="Heures" value={h} max={23} step={1} onChange={(n) => set(n, m)} onDone={() => minRef.current?.querySelector("input")?.focus()} />
      <b aria-hidden="true">:</b>
      <span ref={minRef} style={{ display: "contents" }}>
        <Col label="Minutes" value={m} max={59} step={5} onChange={(n) => set(h, n)} />
      </span>
    </span>
  );
}
