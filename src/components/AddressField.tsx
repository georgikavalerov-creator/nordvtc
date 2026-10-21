"use client";

import { useEffect, useId, useRef, useState } from "react";

export type Place = { label: string; lat: number; lng: number };

type Props = {
  label: string;
  value: Place | null;
  onChange: (p: Place | null) => void;
  initialText?: string;
  placeholder?: string;
  error?: string;
};

// Champ d'adresse avec autocomplétion (via /api/places, qui appelle HERE côté serveur).
export default function AddressField({ label, value, onChange, initialText = "", placeholder, error }: Props) {
  const id = useId();
  const [text, setText] = useState(value?.label ?? initialText);
  const [items, setItems] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);
  const resolvedInitial = useRef(!!value);

  async function search(q: string): Promise<Place[]> {
    const my = ++seq.current;
    try {
      const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`);
      if (!res.ok) return [];
      const data = (await res.json()) as { items?: Place[] };
      return my === seq.current ? (data.items ?? []) : [];
    } catch {
      return [];
    }
  }

  // Résout automatiquement un texte pré-rempli (liens depuis les pages de trajets).
  useEffect(() => {
    if (resolvedInitial.current || !initialText) return;
    resolvedInitial.current = true;
    search(initialText).then((r) => {
      if (r[0]) {
        setText(r[0].label);
        onChange(r[0]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onInput(v: string) {
    setText(v);
    onChange(null);
    setActive(-1);
    if (timer.current) clearTimeout(timer.current);
    if (v.trim().length < 3) {
      setItems([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      const r = await search(v.trim());
      setItems(r);
      setOpen(r.length > 0);
    }, 250);
  }

  function pick(p: Place) {
    setText(p.label);
    onChange(p);
    setOpen(false);
    setItems([]);
  }

  function onKey(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <label className="suggest" htmlFor={id}>
      {label}
      <input
        id={id}
        value={text}
        onChange={(e) => onInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-invalid={!!error || (text.length > 2 && !value)}
        aria-describedby={error ? `${id}-err` : undefined}
        inputMode="search"
        enterKeyHint="next"
      />
      {open && (
        <ul id={`${id}-list`} role="listbox">
          {items.map((p, i) => (
            <li key={`${p.lat},${p.lng},${i}`} role="presentation">
              <button type="button" role="option" aria-selected={i === active} onMouseDown={() => pick(p)}>
                <span className="sg-tile" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.200-7-11.500a7 7 0 0 1 14 0C19 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/></svg>
                </span>
                <span className="sg-txt"><strong>{p.label.split(",")[0]}</strong><small>{p.label.split(",").slice(1).join(",").trim()}</small></span>
                <span className="sg-chev" aria-hidden="true">›</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <span id={`${id}-err`} className="field-error" role="alert">
          {error}
        </span>
      )}
      {!error && text.length > 2 && !value && !open && (
        <span className="muted" style={{ fontWeight: 400, fontSize: "0.82rem" }}>
          Choisissez une adresse dans la liste proposée.
        </span>
      )}
    </label>
  );
}
