"use client";
import { useMemo, useState } from "react";
import type { FaqGroup } from "@/lib/faq";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** FAQ par thème (onglets) avec recherche instantanée. Toutes les questions restent dans la page. */
export default function FaqList({ groups, all = false }: { groups: FaqGroup[]; all?: boolean }) {
  const [tab, setTab] = useState(groups[0]?.id ?? "");
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const n = norm(q.trim());
    if (n.length < 2) return null;
    return groups.flatMap((g) => g.items.filter((it) => norm(it.q + " " + it.a).includes(n)));
  }, [q, groups]);

  return (
    <div className="faq">
      <label className="faq-search">
        <span className="sr-only">Rechercher dans les questions</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher : bagages, annulation, facture, animaux…" />
      </label>
      {results ? (
        <div className="faq-list">
          {results.length === 0 && <p className="muted">Aucune réponse pour « {q} ». Écrivez-nous depuis la page contact.</p>}
          {results.map((f) => (
            <details key={f.q} open={results.length <= 2}>
              <summary>{f.q}</summary>
              <p className="muted">{f.a}</p>
            </details>
          ))}
        </div>
      ) : (
        <>
          {!all && (
            <div className="faq-tabs" role="tablist" aria-label="Thèmes">
              {groups.map((g) => (
                <button key={g.id} type="button" role="tab" aria-selected={tab === g.id} className={`chip${tab === g.id ? " on" : ""}`} onClick={() => setTab(g.id)}>
                  {g.title} <span className="faq-n">{g.items.length}</span>
                </button>
              ))}
            </div>
          )}
          {groups.map((g) => (
            <section key={g.id} id={`faq-${g.id}`} className="faq-list" hidden={!all && tab !== g.id}>
              {all && <h2 className="faq-h">{g.title}</h2>}
              {g.items.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p className="muted">{f.a}</p>
                </details>
              ))}
            </section>
          ))}
        </>
      )}
    </div>
  );
}
