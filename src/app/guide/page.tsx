import type { Metadata } from "next";
import Link from "next/link";
import CtaBand from "@/components/CtaBand";
import { fmtDate } from "@/lib/blog";
import { getAllPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Guide de Lille : conseils pour vos déplacements",
  description: "Conseils pratiques pour vos trajets à Lille : aéroport de Lesquin, gares, événements, sorties. Le guide Nord VTC.",
  alternates: { canonical: "/guide" },
};

export const revalidate = 60;

export default async function GuidePage() {
  const posts = await getAllPosts();
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Guide</span>
          <h1>Le guide pratique de Lille</h1>
          <p className="muted prose">Aéroport, gares, événements, sorties : tout pour bien vous déplacer dans la métropole lilloise.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap grid cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={`/guide/${p.slug}`} className="card">
              <span className="tag">{p.tag}</span>
              <h3>{p.title}</h3>
              <p className="muted" style={{ marginBottom: 12 }}>{p.description.slice(0, 130).trim()}…</p>
              <small className="muted">{fmtDate(p.date)} · {p.minutes} min de lecture</small>
              <br />
              <span className="more">Lire l'article →</span>
            </Link>
          ))}
        </div>
      </section>
      <CtaBand title="Besoin d'un chauffeur ?" text="Indiquez vos deux adresses : le prix s'affiche tout de suite." />
    </>
  );
}
