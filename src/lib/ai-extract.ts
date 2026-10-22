import { getCloudflareContext } from "@opennextjs/cloudflare";
import { suggestPlaces, type Place } from "@/lib/here";

// Lecture des courses par l'IA (Workers AI, modèle multimodal hébergé par Cloudflare : aucune clé à gérer).
// Sert pour les captures d'écran de l'agenda iPhone et pour les événements de l'agenda iCloud.

export type Course = {
  name: string; phone: string; email: string; date: string; time: string;
  from: string; to: string; passengers: number; luggage: number;
  price: number | null; flight: string; notes: string; company: string;
};
export type CourseFound = Course & { origin: Place | null; dest: Place | null; ref?: string };

const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

const SCHEMA = {
  type: "object",
  properties: {
    courses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" }, phone: { type: "string" }, email: { type: "string" },
          date: { type: "string", description: "AAAA-MM-JJ" }, time: { type: "string", description: "HH:MM (24 h)" },
          from: { type: "string" }, to: { type: "string" },
          passengers: { type: "integer" }, luggage: { type: "integer" },
          price: { type: ["number", "null"] }, flight: { type: "string" }, notes: { type: "string" }, company: { type: "string" },
        },
        required: ["name", "date", "time", "from", "to"],
      },
    },
  },
  required: ["courses"],
};

const rules = (today: string) => `Tu aides un chauffeur VTC de la métropole lilloise (France) à transformer ses notes d'agenda en bons de commande.
Aujourd'hui nous sommes le ${today} (fuseau Europe/Paris). Pour chaque course trouvée, renvoie :
- name : nom du client (ou de la société) ; phone : téléphone tel qu'écrit ; email si présent ;
- date au format AAAA-MM-JJ (déduis l'année et les jours relatifs comme « demain » ou « lundi » à partir d'aujourd'hui) ; time : heure de prise en charge HH:MM ;
- from / to : adresses ou lieux de départ et d'arrivée les plus complets possible, en ajoutant la ville si elle est évidente (ex. « Gare Lille Flandres », « Aéroport de Lille-Lesquin », « 12 rue Nationale, Lille ») ;
- passengers (1 par défaut), luggage (0 par défaut), price en euros si un montant est écrit (sinon null), flight (numéro de vol ou de train), company (société si indiquée), notes (le reste utile : terminal, siège enfant, remarques).
Le chauffeur note souvent une course en DEUX événements consécutifs : le premier porte l'adresse de départ (heure de prise en charge), le second l'adresse d'arrivée. Fusionne-les en UNE seule course (from = lieu du premier, to = lieu du second, time = heure du premier).
Ignore les rendez-vous qui ne sont pas des courses (dentiste, anniversaire…). N'invente rien : laisse "" quand une information manque. Réponds uniquement en JSON.`;

async function ai() {
  const { env } = await getCloudflareContext({ async: true });
  const AI = (env as unknown as { AI?: { run: (m: string, i: unknown) => Promise<{ response?: unknown }> } }).AI;
  if (!AI) throw new Error("Workers AI indisponible");
  return AI;
}

function parse(out: unknown): Course[] {
  let o = out;
  if (typeof o === "string") { const m = o.match(/\{[\s\S]*\}/); try { o = m ? JSON.parse(m[0]) : {}; } catch { o = {}; } }
  const list = (o as { courses?: unknown[] })?.courses ?? [];
  const s = (v: unknown, n = 200) => (typeof v === "string" ? v.trim().slice(0, n) : "");
  return list.map((c) => {
    const x = c as Record<string, unknown>;
    const date = s(x.date, 10), time = s(x.time, 5).replace(/^(\d):/, "0$1:").replace("h", ":");
    const num = (v: unknown, d: number, max: number) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : d; };
    const price = x.price === null || x.price === undefined || x.price === "" ? null : Number(String(x.price).replace(",", "."));
    return {
      name: s(x.name, 100), phone: s(x.phone, 30), email: s(x.email, 200).toLowerCase(),
      date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "", time: /^\d{2}:\d{2}$/.test(time) ? time : "",
      from: s(x.from, 250), to: s(x.to, 250), passengers: Math.max(1, num(x.passengers, 1, 8)), luggage: num(x.luggage, 0, 20),
      price: price !== null && Number.isFinite(price) && price > 0 ? Math.round(price * 100) / 100 : null,
      flight: s(x.flight, 30), notes: s(x.notes, 500), company: s(x.company, 120),
    };
  }).filter((c) => c.from || c.to || c.name);
}

async function geocode(q: string): Promise<Place | null> {
  if (!q || q.length < 3) return null;
  try { return (await suggestPlaces(q))[0] ?? null; } catch { return null; }
}

export async function withPlaces(list: Course[]): Promise<CourseFound[]> {
  return Promise.all(list.map(async (c) => ({ ...c, origin: await geocode(c.from), dest: await geocode(c.to) })));
}

const todayParis = () => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(new Date()) +
  " (" + new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long" }).format(new Date()) + ")";

/** Une capture d'écran (data URL JPEG/PNG) → courses trouvées. */
export async function coursesFromImage(dataUrl: string): Promise<Course[]> {
  const r = await (await ai()).run(MODEL, {
    messages: [
      { role: "system", content: rules(todayParis()) },
      { role: "user", content: [
        { type: "text", text: "Voici une capture d'écran de mon agenda (ou d'un message) avec une ou plusieurs courses. Extrais-les." },
        { type: "image_url", image_url: { url: dataUrl } },
      ] },
    ],
    response_format: { type: "json_schema", json_schema: SCHEMA },
    max_tokens: 2000, temperature: 0.1,
  });
  return parse(r.response);
}

/** Texte d'un événement d'agenda (titre, lieu, notes, date) → course. */
export async function coursesFromText(text: string): Promise<Course[]> {
  const r = await (await ai()).run(MODEL, {
    messages: [
      { role: "system", content: rules(todayParis()) },
      { role: "user", content: `Événement de mon agenda :\n${text.slice(0, 3000)}` },
    ],
    response_format: { type: "json_schema", json_schema: SCHEMA },
    max_tokens: 1200, temperature: 0.1,
  });
  return parse(r.response);
}
