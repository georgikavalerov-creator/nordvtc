import type { CalEvent } from "./icloud";

// Une course notée dans l'agenda = un événement « départ » suivi, le même jour, de l'événement « arrivée »
// (même client ou dans les 4 h). Partagé par l'import et le calendrier de l'administration.
export type AgendaCourse = { ref: string; dep: CalEvent; arr: CalEvent | null };

const words = (s: string) => new Set(s.toLowerCase().normalize("NFD").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length >= 3 && !["arrivee", "depart", "course", "dépose", "depose", "prise", "charge", "pour"].includes(w)));
const mins = (e: CalEvent) => Number(e.time.slice(0, 2)) * 60 + Number(e.time.slice(3, 5));

export function pairUp(events: CalEvent[]): AgendaCourse[] {
  const out: AgendaCourse[] = [];
  for (let k = 0; k < events.length; k++) {
    const a = events[k], b = events[k + 1];
    const arrWord = (e: CalEvent) => /arriv|dépos|depos|destination|→/i.test(e.title);
    const sameClient = b ? [...words(a.title)].some((w) => words(b.title).has(w)) : false;
    const close = b && !a.allDay && !b.allDay && b.date === a.date && mins(b) >= mins(a) && mins(b) - mins(a) <= 240;
    if (b && close && (sameClient || arrWord(b) || (!arrWord(a) && !!b.location))) { out.push({ ref: a.ref, dep: a, arr: b }); k++; }
    else out.push({ ref: a.ref, dep: a, arr: null });
  }
  return out;
}

const describe = (e: CalEvent, role: string) => [`${role} — ${e.title}`, e.location && `Lieu : ${e.location}`, e.notes && `Notes : ${e.notes}`, `Heure : ${e.allDay ? "journée entière" : e.time}`].filter(Boolean).join("\n");
/** Texte remis à l'IA pour lire une course de l'agenda. */
export const courseText = (c: AgendaCourse) => c.arr
  ? `Course notée en deux événements le ${c.dep.date}.\n${describe(c.dep, "Événement 1 (départ)")}\n${describe(c.arr, "Événement 2 (arrivée)")}`
  : `${describe(c.dep, "Événement")}\nDate : ${c.dep.date}`;
