"use client";
import { useState } from "react";
import { quickBon } from "./actions";

export type AgendaItem = { ref: string; date: string; time: string; title: string; route: string; done?: { url: string } };
type St = "wait" | { url: string } | { error: string };

const dayLabel = (d: string) => new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${d}T12:00:00`));

/** Courses notées dans l'agenda iPhone : un clic = bon de commande créé (lecture par l'IA). */
export default function AgendaCourses({ items }: { items: AgendaItem[] }) {
  const [st, setSt] = useState<Record<string, St>>({});
  const [all, setAll] = useState(false);
  const run = async (it: AgendaItem) => {
    setSt((s) => ({ ...s, [it.ref]: "wait" }));
    const r: { url?: string; error?: string } = await quickBon(it.ref, it.date).catch(() => ({ error: "Erreur réseau, réessayez." }));
    setSt((s) => ({ ...s, [it.ref]: r.url ? { url: r.url } : { error: r.error ?? "Création impossible." } }));
    return r;
  };
  const todo = items.filter((i) => !i.done && !(st[i.ref] && typeof st[i.ref] === "object" && "url" in (st[i.ref] as object)));
  const runAll = async () => { setAll(true); for (const it of todo) await run(it); setAll(false); };

  if (!items.length) return <p className="muted" style={{ margin: 0 }}>Aucune course dans votre agenda pour ce mois.</p>;
  return (
    <div className="ag-list">
      {todo.length > 1 && <button type="button" className="btn small" onClick={runAll} disabled={all}>{all ? "Création des bons…" : `Créer tous les bons (${todo.length})`}</button>}
      <ul>
        {items.map((it) => {
          const s = st[it.ref];
          const url = it.done?.url ?? (s && typeof s === "object" && "url" in s ? s.url : null);
          return (
            <li key={it.ref} className={url ? "is-done" : ""}>
              <span className="ag-when"><b>{dayLabel(it.date)}</b><small>{it.time || "Journée"}</small></span>
              <span className="ag-txt"><strong>{it.title || "(sans titre)"}</strong>{it.route && <small>{it.route}</small>}</span>
              <span className="ag-act">
                {url ? <a className="btn small ghost" href={url} target="_blank" rel="noreferrer">✓ Voir le bon</a>
                  : s === "wait" ? <span className="imp-badge is-wait">Création…</span>
                  : <button type="button" className="btn small" onClick={() => run(it)}>Bon de commande</button>}
              </span>
              {s && typeof s === "object" && "error" in s && <p className="error ag-err">{s.error} <a href="/admin/import">Ouvrir l&apos;import</a></p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
