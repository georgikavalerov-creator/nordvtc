"use client";
import { useEffect, useRef, useState } from "react";

// Heure à la minute près, en deux touches : on choisit l'heure dans une grille, puis les minutes
// (raccourcis de 5 en 5 + boutons −1 / +1 pour la minute exacte). On peut aussi taper « 1435 » directement.
// Valeur au format "HH:MM" ("" tant que rien n'est choisi).
const pad = (n: number) => String(n).padStart(2, "0");
const show = (v: string) => (v ? v.replace(":", " h ") : "");

export default function TimeField({ value, onChange, invalid, label = "Heure" }: { value: string; onChange: (v: string) => void; invalid?: boolean; label?: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"h" | "m">("h");
  const [typed, setTyped] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const h = value ? Number(value.slice(0, 2)) : null;
  const m = value ? Number(value.slice(3, 5)) : null;

  useEffect(() => {
    if (!open) return;
    const out = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) { setOpen(false); setTyped(null); } };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", out);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", out); document.removeEventListener("keydown", esc); };
  }, [open]);

  const set = (hh: number, mm: number) => onChange(`${pad(((hh % 24) + 24) % 24)}:${pad(((mm % 60) + 60) % 60)}`);
  const nudge = (d: number) => { const t = ((h ?? 12) * 60 + (m ?? 0) + d + 1440) % 1440; set(Math.floor(t / 60), t % 60); };

  return (
    <div className="pk" ref={box}>
      <div className={`pk-field pk-time${value ? "" : " empty"}`} aria-invalid={invalid || undefined}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
        <input
          inputMode="numeric" aria-label={label} placeholder="Choisir…" autoComplete="off"
          value={typed ?? show(value)}
          onFocus={() => { setOpen(true); setStep(value ? "m" : "h"); }}
          onClick={() => setOpen(true)}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(0, 4);
            setTyped(d.length > 2 ? `${d.slice(0, 2)} h ${d.slice(2)}` : d);
            if (d.length === 4 && Number(d.slice(0, 2)) < 24 && Number(d.slice(2)) < 60) { set(Number(d.slice(0, 2)), Number(d.slice(2))); setTyped(null); setOpen(false); }
          }}
          onBlur={() => setTyped(null)}
        />
      </div>
      {open && (
        <div className="pk-pop pk-clock" role="dialog" aria-label="Choisir l'heure">
          <div className="pk-tabs">
            <button type="button" className={step === "h" ? "on" : ""} onClick={() => setStep("h")}>Heure{h !== null ? ` · ${pad(h)} h` : ""}</button>
            <button type="button" className={step === "m" ? "on" : ""} onClick={() => setStep("m")} disabled={h === null}>Minutes{m !== null ? ` · ${pad(m)}` : ""}</button>
          </div>
          {step === "h" ? (
            <div className="pk-hours">
              {Array.from({ length: 24 }, (_, i) => (i + 5) % 24).map((hh) => (
                <button key={hh} type="button" className={hh === h ? "on" : ""} onClick={() => { set(hh, m ?? 0); setStep("m"); }}>{pad(hh)}</button>
              ))}
            </div>
          ) : (
            <>
              <div className="pk-mins">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((mm) => (
                  <button key={mm} type="button" className={mm === m ? "on" : ""} onClick={() => { set(h ?? 0, mm); }}>:{pad(mm)}</button>
                ))}
              </div>
              <div className="pk-fine">
                <button type="button" onClick={() => nudge(-1)} aria-label="Une minute de moins">−1 min</button>
                <strong>{show(value) || "--"}</strong>
                <button type="button" onClick={() => nudge(1)} aria-label="Une minute de plus">+1 min</button>
              </div>
              <button type="button" className="pk-ok" onClick={() => setOpen(false)}>Valider</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
