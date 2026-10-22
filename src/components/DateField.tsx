"use client";
import { useEffect, useRef, useState } from "react";
import IconC from "./IconC";

// Calendrier maison, aux couleurs du site (remplace le calendrier natif du navigateur).
// Valeur au format "AAAA-MM-JJ" ; les jours avant `min` sont grisés.
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const JOURS = ["L", "M", "M", "J", "V", "S", "D"];
const label = (s: string) => new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "long" }).format(parse(s));

export default function DateField({ value, onChange, min, invalid, ariaLabel = "Date" }: { value: string; onChange: (v: string) => void; min?: string; invalid?: boolean; ariaLabel?: string }) {
  const [open, setOpen] = useState(false);
  const base = value ? parse(value) : min ? parse(min) : new Date();
  const [view, setView] = useState(new Date(base.getFullYear(), base.getMonth(), 1));
  const box = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) requestAnimationFrame(() => pop.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const b = value ? parse(value) : min ? parse(min) : new Date();
    setView(new Date(b.getFullYear(), b.getMonth(), 1));
    const out = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", out);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", out); document.removeEventListener("keydown", esc); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7; // lundi en premier
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const todayIso = iso(new Date());
  const minDate = min ? parse(min) : null;
  const canPrev = !minDate || new Date(view.getFullYear(), view.getMonth(), 0) >= minDate;
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => iso(new Date(view.getFullYear(), view.getMonth(), i + 1)))];

  return (
    <div className="pk" ref={box}>
      <button type="button" className={`pk-field${value ? "" : " empty"}`} aria-haspopup="dialog" aria-expanded={open} aria-invalid={invalid || undefined} aria-label={value ? `${ariaLabel} : ${label(value)}` : ariaLabel} onClick={() => setOpen((o) => !o)}>
        <IconC name="calendar" size={20} />
        <span>{value ? label(value) : "Choisir…"}</span>
      </button>
      {open && (
        <div ref={pop} className="pk-pop pk-cal" role="dialog" aria-label="Choisir une date">
          <div className="pk-head">
            <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} disabled={!canPrev} aria-label="Mois précédent">‹</button>
            <strong>{MOIS[view.getMonth()]} {view.getFullYear()}</strong>
            <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} aria-label="Mois suivant">›</button>
          </div>
          <div className="pk-grid pk-week" aria-hidden="true">{JOURS.map((j, i) => <span key={i}>{j}</span>)}</div>
          <div className="pk-grid">
            {cells.map((d, i) => d === null ? <span key={`x${i}`} /> : (
              <button
                key={d} type="button"
                className={`${d === value ? "on" : ""}${d === todayIso ? " today" : ""}`}
                disabled={!!min && d < min}
                onClick={() => { onChange(d); setOpen(false); }}
                aria-label={label(d)} aria-pressed={d === value}
              >{Number(d.slice(8))}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
