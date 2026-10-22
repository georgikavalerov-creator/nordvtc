"use client";
import { useRef, useState } from "react";
import ManualForm, { type ManualInitial } from "../ManualForm";
import type { CalEvent } from "@/lib/icloud";

type Found = ManualInitial & { key: string };

const dayLabel = (d: string) => new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${d}T12:00:00`));
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

// Réduit la capture (≈1400 px, JPEG) avant l'envoi : plus rapide, et suffisant pour la lecture.
async function shrink(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85);
}

async function analyse(payload: object): Promise<{ courses?: (ManualInitial & { from: string; to: string })[]; error?: string }> {
  const r = await fetch("/api/admin/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return r.json().catch(() => ({ error: "Réponse illisible." }));
}

type Course = { ref: string; dep: CalEvent; arr: CalEvent | null };
const words = (s: string) => new Set(s.toLowerCase().normalize("NFD").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length >= 3 && !["arrivee", "depart", "course", "dépose", "depose", "prise", "charge", "pour"].includes(w)));
const mins = (e: CalEvent) => Number(e.time.slice(0, 2)) * 60 + Number(e.time.slice(3, 5));
/** Une course = un événement « départ » suivi, le même jour, de l'événement « arrivée » (même client ou dans les 4 h). */
function pairUp(events: CalEvent[]): Course[] {
  const out: Course[] = [];
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

export default function ImportClient({ connected, calError, events, done }: { connected: boolean; calError: string; events: CalEvent[]; done: string[] }) {
  const [prepared, setPrepared] = useState<Record<string, Found | "loading" | { error: string }>>({});
  const [shots, setShots] = useState<Found[]>([]);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const doneSet = new Set(done);

  const courses = pairUp(events);
  const describe = (e: CalEvent, role: string) => [`${role} — ${e.title}`, e.location && `Lieu : ${e.location}`, e.notes && `Notes : ${e.notes}`, `Heure : ${e.allDay ? "journée entière" : e.time}`].filter(Boolean).join("\n");

  async function prepare(c: Course) {
    const e = c.dep;
    setPrepared((p) => ({ ...p, [c.ref]: "loading" }));
    const text = c.arr
      ? `Course notée en deux événements le ${e.date}.\n${describe(e, "Événement 1 (départ)")}\n${describe(c.arr, "Événement 2 (arrivée)")}`
      : `${describe(e, "Événement")}\nDate : ${e.date}`;
    const r = await analyse({ text, date: e.date, time: e.allDay ? undefined : e.time, ref: c.ref, from: e.location || undefined, to: c.arr?.location || undefined });
    const f = r.courses?.[0];
    setPrepared((p) => ({ ...p, [c.ref]: f ? { ...f, ref: c.ref, key: c.ref } : { error: r.error || "Aucune course reconnue." } }));
  }

  async function prepareAll() {
    for (const c of courses) if (!doneSet.has(c.ref) && !prepared[c.ref]) await prepare(c);
  }

  async function onFiles(list: FileList | File[]) {
    const files = [...list].filter((f) => f.type.startsWith("image/")).slice(0, 10);
    if (!files.length) return;
    setErr("");
    for (let n = 0; n < files.length; n++) {
      setBusy(`Lecture de la capture ${n + 1} sur ${files.length}…`);
      try {
        const r = await analyse({ image: await shrink(files[n]) });
        if (r.error) { setErr(r.error); continue; }
        const found = (r.courses ?? []).map((c, k) => ({ ...c, ref: `img:${c.date}-${c.time}-${slug(c.name || c.from || "")}`, key: `${Date.now()}-${n}-${k}` }));
        if (!found.length) setErr(`Aucune course trouvée sur la capture ${n + 1}.`);
        setShots((s) => [...s, ...found]);
      } catch { setErr("Capture illisible."); }
    }
    setBusy("");
  }

  const pending = courses.filter((c) => !doneSet.has(c.ref));
  let lastDay = "";
  return (
    <div className="imp">
      <section className="adm-box imp-sec">
        <div className="imp-head">
          <div>
            <h2>Depuis votre agenda iPhone</h2>
            <p className="muted">Vos courses des 30 prochains jours. L'événement de départ et celui d'arrivée sont regroupés en une seule course ; un clic et l'IA prépare le bon de commande.</p>
          </div>
          {connected && pending.length > 0 && <button type="button" className="btn small" onClick={prepareAll}>Tout préparer ({pending.length})</button>}
        </div>
        {!connected && (
          <div className="imp-setup">
            <strong>Relier votre agenda iCloud (une seule fois)</strong>
            <ol>
              <li>Sur <a href="https://account.apple.com" target="_blank" rel="noreferrer">account.apple.com</a> → Connexion et sécurité → <b>Mots de passe d&apos;app</b> → créez-en un nommé « Nord VTC ».</li>
              <li>Dans Cloudflare → Workers → <b>nordvtc</b> → Paramètres → Variables et secrets, ajoutez deux <b>secrets</b> : <code>ICLOUD_APPLE_ID</code> (votre identifiant Apple) et <code>ICLOUD_APP_PASSWORD</code> (le mot de passe d&apos;app).</li>
              <li>Facultatif : <code>ICLOUD_CALENDARS</code> = nom(s) de l&apos;agenda des courses, pour ignorer les autres agendas.</li>
            </ol>
            <p className="muted">Accès en lecture seule. Le mot de passe d&apos;app se révoque à tout moment depuis votre compte Apple.</p>
          </div>
        )}
        {calError && <p className="error">{calError}</p>}
        {connected && !calError && events.length === 0 && <p className="muted">Aucun événement dans les 30 prochains jours.</p>}
        <ul className="imp-events">
          {courses.map((c) => {
            const e = c.dep;
            const st = prepared[c.ref];
            const isDone = doneSet.has(c.ref);
            const head = e.date !== lastDay ? (lastDay = e.date) : "";
            return (
              <li key={c.ref}>
                {head && <p className="imp-day">{dayLabel(e.date)}</p>}
                <div className={`imp-ev${isDone ? " is-done" : ""}`}>
                  <span className="imp-time">{e.allDay ? "Journée" : e.time}{c.arr && !c.arr.allDay && <small>→ {c.arr.time}</small>}</span>
                  <span className="imp-txt">
                    <strong>{e.title || "(sans titre)"}</strong>
                    {(e.location || c.arr?.location) && <small>{e.location || "?"}{c.arr ? ` → ${c.arr.location || c.arr.title}` : ""}</small>}
                  </span>
                  {isDone ? <span className="imp-badge">Bon créé</span>
                    : st === "loading" ? <span className="imp-badge is-wait">Lecture…</span>
                    : !st || "error" in st ? <button type="button" className="btn small ghost" onClick={() => prepare(c)}>Préparer le bon</button> : null}
                </div>
                {st && st !== "loading" && "error" in st && <p className="error">{st.error}</p>}
                {st && st !== "loading" && !("error" in st) && <ManualForm mode="bon" stay initial={st} />}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="adm-box imp-sec">
        <h2>Depuis des captures d&apos;écran</h2>
        <p className="muted">Capture de votre agenda, d&apos;un SMS ou d&apos;un WhatsApp : l&apos;IA repère chaque course (client, téléphone, date, heure, adresses, prix) et prépare les bons. Vous vérifiez, puis un clic par bon.</p>
        <div
          className="imp-drop" role="button" tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") fileRef.current?.click(); }}
          onDragOver={(ev) => ev.preventDefault()}
          onDrop={(ev) => { ev.preventDefault(); onFiles(ev.dataTransfer.files); }}
          onPaste={(ev) => onFiles([...ev.clipboardData.files])}
        >
          <strong>{busy || "Choisir des captures"}</strong>
          <span className="muted">ou glissez-les ici, ou collez-les (Cmd/Ctrl + V) · 10 maximum</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(ev) => { if (ev.target.files) onFiles(ev.target.files); ev.target.value = ""; }} />
        {err && <p className="error">{err}</p>}
        <div className="imp-shots">
          {shots.map((c) => (
            <div key={c.key} className="imp-shot">
              <p className="imp-day">{c.date ? `${dayLabel(c.date)}${c.time ? ` · ${c.time}` : ""}` : "Date à vérifier"}{c.name ? ` · ${c.name}` : ""}</p>
              <ManualForm mode="bon" stay initial={c} />
              <button type="button" className="linklike" onClick={() => setShots((s) => s.filter((x) => x.key !== c.key))}>Retirer</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
