// Pont avec l'agenda iCloud (iPhone) en CalDAV : lecture (import) et écriture des courses dans l'agenda choisi (icloud-push).
// Identifiants : ICLOUD_APPLE_ID + ICLOUD_APP_PASSWORD (mot de passe d'application créé sur appleid.apple.com),
// saisis comme secrets dans Cloudflare, jamais dans le code. ICLOUD_CALENDARS (facultatif) : noms des agendas à lire, séparés par des virgules.

export type CalEvent = { uid: string; ref: string; calendar: string; title: string; location: string; notes: string; date: string; time: string; allDay: boolean; start: string; href?: string; recurring?: boolean };

const ROOT = "https://caldav.icloud.com";
export const icloudConfigured = () => !!(process.env.ICLOUD_APPLE_ID && process.env.ICLOUD_APP_PASSWORD);

function auth() {
  return "Basic " + btoa(`${process.env.ICLOUD_APPLE_ID}:${process.env.ICLOUD_APP_PASSWORD}`);
}

export const icloudAuth = auth;

async function dav(url: string, method: "PROPFIND" | "REPORT", body: string, depth: "0" | "1") {
  const r = await fetch(url, { method, headers: { Authorization: auth(), Depth: depth, "Content-Type": "application/xml; charset=utf-8" }, body, redirect: "follow", cache: "no-store" });
  if (r.status === 401 || r.status === 403) throw new Error("AUTH");
  if (!r.ok && r.status !== 207) throw new Error(`CalDAV ${r.status}`);
  return { text: await r.text(), url: r.url || url };
}

// Lecture XML minimale (les réponses CalDAV sont simples) : on ignore les préfixes d'espace de noms.
const tag = (xml: string, name: string) => { const m = new RegExp(`<(?:[\\w-]+:)?${name}\\b[^>]*>([\\s\\S]*?)</(?:[\\w-]+:)?${name}>`, "i").exec(xml); return m ? m[1] : ""; };
const tags = (xml: string, name: string) => [...xml.matchAll(new RegExp(`<(?:[\\w-]+:)?${name}\\b[^>]*>([\\s\\S]*?)</(?:[\\w-]+:)?${name}>`, "gi"))].map((m) => m[1]);
const xmlText = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#13;/g, "\r").replace(/&#10;/g, "\n").replace(/&amp;/g, "&").trim();
const abs = (href: string, base: string) => new URL(xmlText(tag(href, "href") || href), base).toString();

export async function calendars() {
  const p1 = await dav(`${ROOT}/`, "PROPFIND", `<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:current-user-principal/></d:prop></d:propfind>`, "0");
  const principal = abs(tag(p1.text, "current-user-principal"), p1.url);
  const p2 = await dav(principal, "PROPFIND", `<?xml version="1.0"?><d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><c:calendar-home-set/></d:prop></d:propfind>`, "0");
  const home = abs(tag(p2.text, "calendar-home-set"), p2.url);
  const p3 = await dav(home, "PROPFIND", `<?xml version="1.0"?><d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><d:displayname/><d:resourcetype/><c:supported-calendar-component-set/></d:prop></d:propfind>`, "1");
  return tags(p3.text, "response")
    .filter((r) => /<(?:[\w-]+:)?calendar\b/i.test(tag(r, "resourcetype")) && (!/comp\b/i.test(r) || /name=["']VEVENT["']/i.test(r)))
    .map((r) => ({ url: abs(tag(r, "href"), home), name: xmlText(tag(r, "displayname")) || "Calendrier" }));
}

// ---------- Lecture iCalendar ----------
const unfold = (ics: string) => ics.replace(/\r?\n[ \t]/g, "");
const icsVal = (v: string) => v.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\").trim();
const paris = (d: Date) => {
  const f = new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const g = (t: string) => f.find((x) => x.type === t)?.value ?? "00";
  return { date: `${g("year")}-${g("month")}-${g("day")}`, time: `${g("hour") === "24" ? "00" : g("hour")}:${g("minute")}` };
};

function parseEvents(ics: string, calendar: string): CalEvent[] {
  const out: CalEvent[] = [];
  for (const block of unfold(ics).split("BEGIN:VEVENT").slice(1)) {
    const body = block.split("END:VEVENT")[0];
    const prop = (name: string) => { const m = new RegExp(`^${name}((?:;[^:\\r\\n]*)?):(.*)$`, "mi").exec(body); return m ? { params: m[1], value: m[2].trim() } : null; };
    const st = prop("DTSTART"); if (!st) continue;
    let date = "", time = "", allDay = false, startIso = "";
    const v = st.value;
    if (/VALUE=DATE(?!-)/i.test(st.params) || /^\d{8}$/.test(v)) { allDay = true; date = `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`; startIso = `${date}T00:00:00`; }
    else if (v.endsWith("Z")) { const d = new Date(`${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}T${v.slice(9, 11)}:${v.slice(11, 13)}:${v.slice(13, 15)}Z`); ({ date, time } = paris(d)); startIso = d.toISOString(); }
    else { date = `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`; time = `${v.slice(9, 11)}:${v.slice(11, 13)}`; startIso = `${date}T${time}:00`; } // heure locale (agenda en Europe/Paris)
    const uid = prop("UID")?.value ?? `${date}${time}`;
    if (/^[0-9a-f-]{36}@/i.test(uid)) continue; // courses du site déjà envoyées dans l'agenda : pas à réimporter
    out.push({
      uid, ref: `ical:${uid}@${date}`.slice(0, 200), calendar,
      title: icsVal(prop("SUMMARY")?.value ?? ""), location: icsVal(prop("LOCATION")?.value ?? ""), notes: icsVal(prop("DESCRIPTION")?.value ?? ""),
      date, time, allDay, start: startIso,
    });
  }
  return out;
}

const icalStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Événements entre maintenant - `pastDays` et maintenant + `days`, triés par date. */
export async function icloudEvents(days = 30, pastDays = 2, only?: string | null): Promise<CalEvent[]> {
  return icloudEventsBetween(new Date(Date.now() - pastDays * 86_400_000), new Date(Date.now() + days * 86_400_000), only);
}

/** Événements d'une période. `only` : URL de l'agenda choisi dans l'administration (sinon ICLOUD_CALENDARS, sinon tous). */
export async function icloudEventsBetween(from: Date, to: Date, only?: string | null): Promise<CalEvent[]> {
  const wanted = (process.env.ICLOUD_CALENDARS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const all = await calendars();
  const cals = only ? all.filter((c) => c.url === only) : all.filter((c) => !wanted.length || wanted.includes(c.name.toLowerCase()));
  const body = `<?xml version="1.0"?><c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><c:calendar-data><c:expand start="${icalStamp(from)}" end="${icalStamp(to)}"/></c:calendar-data></d:prop><c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="VEVENT"><c:time-range start="${icalStamp(from)}" end="${icalStamp(to)}"/></c:comp-filter></c:comp-filter></c:filter></c:calendar-query>`;
  const lists = await Promise.all(cals.map(async (c) => {
    try {
      const r = await dav(c.url, "REPORT", body, "1");
      // Chaque réponse = un fichier d'événement de l'agenda (son adresse sert à le supprimer depuis l'administration).
      return tags(r.text, "response").flatMap((resp) => {
        const href = abs(tag(resp, "href"), r.url);
        const data = xmlText(tag(resp, "calendar-data"));
        if (!data) return [];
        const list = parseEvents(data, c.name);
        return list.map((e) => ({ ...e, href, recurring: list.length > 1 || /RRULE|RECURRENCE-ID/.test(data) }));
      });
    }
    catch (e) { if ((e as Error).message === "AUTH") throw e; console.error("icloud cal", c.name, e); return []; }
  }));
  const seen = new Set<string>();
  return lists.flat().filter((e) => !seen.has(e.ref) && seen.add(e.ref)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

/** Supprime un événement de l'agenda iCloud (son fichier entier : une série répétée disparaît en entier). */
export async function deleteIcloudEvent(href: string): Promise<void> {
  if (!/^https:\/\/[a-z0-9-]+\.icloud\.com\//i.test(href) && !href.startsWith(ROOT)) throw new Error("Adresse invalide");
  const r = await fetch(href, { method: "DELETE", headers: { Authorization: auth() }, cache: "no-store" });
  if (r.status === 401) throw new Error("AUTH");
  if (r.status === 403) throw new Error("READONLY");
  if (!r.ok && r.status !== 404) throw new Error(`CalDAV ${r.status}`);
}
