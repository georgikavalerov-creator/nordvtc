"use client";

// Choix de l'heure en un seul geste : liste native (roue sur iPhone/Android, liste au clavier sur ordinateur),
// créneaux de 15 minutes regroupés par moment de la journée. Valeur au format "HH:MM" ("" tant que rien n'est choisi).
const pad = (n: number) => String(n).padStart(2, "0");
const GROUPS: [string, number, number][] = [
  ["Matin", 5, 11],
  ["Après-midi", 12, 17],
  ["Soir", 18, 23],
  ["Nuit", 0, 4],
];
const slots = (from: number, to: number) => {
  const out: string[] = [];
  for (let h = from; h <= to; h++) for (let m = 0; m < 60; m += 15) out.push(`${pad(h)}:${pad(m)}`);
  return out;
};

export default function TimeField({ value, onChange, invalid, label = "Heure" }: { value: string; onChange: (v: string) => void; invalid?: boolean; label?: string }) {
  const offGrid = value && !/^\d{2}:(00|15|30|45)$/.test(value) ? value : "";
  return (
    <select
      className="tf-select"
      aria-label={label}
      aria-invalid={invalid || undefined}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
    >
      <option value="" disabled>Choisir…</option>
      {offGrid && <option value={offGrid}>{offGrid.replace(":", " h ")}</option>}
      {GROUPS.map(([name, a, b]) => (
        <optgroup key={name} label={name}>
          {slots(a, b).map((t) => (
            <option key={t} value={t}>{t.replace(":", " h ")}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
