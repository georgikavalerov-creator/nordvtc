"use client";
import { useEffect, useId, useRef, useState } from "react";

export type CompanyPick = { name: string; siren: string; siret: string; address: string; city: string; active: boolean };

// Champ « Société » avec suggestions de l'annuaire officiel des entreprises (nom, SIREN ou SIRET).
export default function CompanyField({ label, value, onChange, onPick, required, name, placeholder = "Nom, SIREN ou SIRET" }: {
  label: string; value: string; onChange: (v: string) => void; onPick: (c: CompanyPick) => void; required?: boolean; name?: string; placeholder?: string;
}) {
  const id = useId();
  const [items, setItems] = useState<CompanyPick[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);
  const skip = useRef(false);

  useEffect(() => {
    if (skip.current) { skip.current = false; return; }
    const q = value.trim();
    if (q.length < 3) { setItems([]); return; }
    const my = ++seq.current;
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/entreprises?q=${encodeURIComponent(q)}`);
        const d = await r.json();
        if (my === seq.current) { setItems(d.results ?? []); setOpen(true); setActive(-1); }
      } catch { /* hors ligne */ } finally { if (my === seq.current) setLoading(false); }
    }, 280);
    return () => window.clearTimeout(t);
  }, [value]);

  function pick(c: CompanyPick) {
    skip.current = true;
    onPick(c); setOpen(false); setItems([]);
  }

  return (
    <label className="suggest co-field" htmlFor={id}>
      {label}
      <input
        id={id} name={name} value={value} required={required} maxLength={120} autoComplete="organization" placeholder={placeholder}
        role="combobox" aria-expanded={open && items.length > 0} aria-controls={`${id}-list`} aria-autocomplete="list"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!open || !items.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
          else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(items[active]); }
          else if (e.key === "Escape") setOpen(false);
        }}
      />
      {loading && <span className="co-wait" aria-hidden="true" />}
      {open && items.length > 0 && (
        <ul id={`${id}-list`} role="listbox">
          {items.map((c, k) => (
            <li key={c.siren + c.siret}>
              <button type="button" role="option" aria-selected={k === active} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(c)}>
                <strong>{c.name}</strong>{!c.active && <em className="co-closed"> · fermée</em>}
                <small>SIREN {c.siren.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}{c.address ? ` · ${c.address}` : ""}</small>
              </button>
            </li>
          ))}
          <li className="co-src">Source : annuaire des entreprises de l&apos;État</li>
        </ul>
      )}
    </label>
  );
}
