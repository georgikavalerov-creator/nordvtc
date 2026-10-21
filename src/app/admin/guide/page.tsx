import type { Metadata } from "next";
import Link from "next/link";
import { db, dbConfigured } from "@/lib/supabase";
import { POSTS } from "@/lib/blog";
import { fmtDate } from "@/lib/blog";
import { AdminPage } from "../gate";

export const metadata: Metadata = { title: "Administration · Guide", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const rows = dbConfigured() ? (((await db().from("site_posts").select("slug,title,tag,published_on,published")).data) ?? []) : [];
  const dbMap = new Map(rows.map((r: { slug: string }) => [r.slug, r]));
  const list = [
    ...rows.map((r: { slug: string; title: string; tag: string; published_on: string; published: boolean }) => ({ slug: r.slug, title: r.title, tag: r.tag, date: r.published_on, live: r.published, src: "base" as const })),
    ...POSTS.filter((p) => !dbMap.has(p.slug)).map((p) => ({ slug: p.slug, title: p.title, tag: p.tag, date: p.date, live: true, src: "code" as const })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <AdminPage title="Guide" actions={<Link className="btn small" href="/admin/guide/nouveau">+ Nouvel article</Link>}>
      {!dbConfigured() && <p className="notice">Connectez Supabase pour écrire des articles depuis cette page.</p>}
      <p className="muted" style={{ margin: 0 }}>Chaque article publié apparaît dans le guide et dans le plan du site envoyé à Google.</p>
      <div style={{ display: "grid", gap: 8 }}>
        {list.map((p) => (
          <Link key={p.slug} href={`/admin/guide/${p.slug}`} className="adm-box" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <strong>{p.title}</strong>
            <span className={`badge ${p.live ? "ok" : "warn"}`}>{p.live ? "Publié" : "Masqué"}</span>
            <span className="muted">{p.tag} · {fmtDate(p.date)}</span>
            <span className="more" style={{ marginLeft: "auto" }}>Modifier →</span>
          </Link>
        ))}
      </div>
    </AdminPage>
  );
}
