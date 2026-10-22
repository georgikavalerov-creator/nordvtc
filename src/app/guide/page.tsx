import type { Metadata } from "next";
import Link from "next/link";
import CtaBand from "@/components/CtaBand";
import Icon from "@/components/Icon";
import { fmtDate } from "@/lib/blog";
import { getAllPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Guide de Lille : conseils pour vos déplacements",
  description: "Conseils pratiques pour vos trajets à Lille : aéroport de Lesquin, gares, événements, sorties. Le guide Nord VTC.",
  alternates: { canonical: "/guide" },
};

export const dynamic = "force-dynamic";

// Une couleur et une icône par rubrique, pour repérer les articles d'un coup d'œil.
const THEME: Record<string, { icon: string; c: string }> = {
  "Aéroport": { icon: "plane", c: "blue" }, "Gares": { icon: "train", c: "teal" }, "Événements": { icon: "sparkle", c: "amber" },
  "Visiter Lille": { icon: "pin", c: "violet" }, "Conseils": { icon: "seal", c: "green" },
};
const theme = (tag: string) => THEME[tag] ?? { icon: "mapTrifold", c: "blue" };

export default async function GuidePage() {
  const posts = await getAllPosts();
  const [first, ...rest] = posts;
  const tags = [...new Set(posts.map((p) => p.tag))];
  return (
    <>
      <section className="page-hero gd-hero">
        <div className="wrap">
          <span className="eyebrow">Le guide</span>
          <h1>Bien se déplacer à Lille et autour</h1>
          <p className="muted prose">Aéroports, gares, grands événements, sorties : des conseils concrets, écrits par un chauffeur qui fait ces trajets tous les jours.</p>
          {tags.length > 1 && <p className="gd-tags">{tags.map((t) => <span key={t} className={`gd-tag c-${theme(t).c}`}><Icon name={theme(t).icon} size={14} /> {t}</span>)}</p>}
        </div>
      </section>

      <section className="section gd-sec">
        <div className="wrap">
          {first && (
            <Link href={`/guide/${first.slug}`} className={`gd-feature c-${theme(first.tag).c}`}>
              <span className="gd-feature-art" aria-hidden="true">
                <Icon name={theme(first.tag).icon} size={64} />
                <span className="gd-feature-kicker">À la une</span>
              </span>
              <span className="gd-feature-body">
                <span className={`gd-tag c-${theme(first.tag).c}`}><Icon name={theme(first.tag).icon} size={14} /> {first.tag}</span>
                <h2>{first.title}</h2>
                <p className="muted">{first.description}</p>
                <span className="gd-meta">{fmtDate(first.date)} · {first.minutes} min de lecture</span>
                <span className="gd-read">Lire l&apos;article →</span>
              </span>
            </Link>
          )}
          {rest.length > 0 && (
            <div className="gd-grid">
              {rest.map((p) => (
                <Link key={p.slug} href={`/guide/${p.slug}`} className={`gd-card c-${theme(p.tag).c}`}>
                  <span className="gd-card-art" aria-hidden="true"><Icon name={theme(p.tag).icon} size={34} /></span>
                  <span className="gd-card-body">
                    <span className={`gd-tag c-${theme(p.tag).c}`}>{p.tag}</span>
                    <h2 className="g-card-t">{p.title}</h2>
                    <p className="muted">{p.description.slice(0, 140).trim()}…</p>
                    <span className="gd-meta">{fmtDate(p.date)} · {p.minutes} min</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <CtaBand title="Besoin d'un chauffeur ?" text="Indiquez vos deux adresses : le prix s'affiche tout de suite." />
    </>
  );
}
