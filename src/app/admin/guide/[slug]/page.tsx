import type { Metadata } from "next";
import Link from "next/link";
import { db, dbConfigured } from "@/lib/supabase";
import { POSTS } from "@/lib/blog";
import { bodyToText } from "@/lib/content";
import { AdminPage } from "../../gate";
import { PostForm, type PostInit } from "../../Forms";
import { deletePost } from "../../actions";

export const metadata: Metadata = { title: "Administration · Article", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isNew = slug === "nouveau";
  let init: PostInit = { slug: "", title: "", description: "", tag: "Conseils", minutes: 3, published_on: new Date().toISOString().slice(0, 10), published: true, body: "", isNew: true };
  let inDb = false;
  if (!isNew) {
    const row = dbConfigured() ? (await db().from("site_posts").select("*").eq("slug", slug).maybeSingle()).data : null;
    const st = POSTS.find((p) => p.slug === slug);
    if (row) { inDb = true; init = { slug, title: row.title, description: row.description, tag: row.tag, minutes: row.minutes, published_on: row.published_on, published: row.published, body: bodyToText(row.body), isNew: false }; }
    else if (st) init = { slug, title: st.title, description: st.description, tag: st.tag, minutes: st.minutes, published_on: st.date, published: true, body: bodyToText(st.body), isNew: false };
  }
  return (
    <AdminPage title={isNew ? "Nouvel article" : "Modifier l'article"} actions={<Link className="btn ghost small" href="/admin/guide">← Articles</Link>}>
      <PostForm p={init} />
      {!isNew && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn ghost small" href={`/guide/${slug}`} target="_blank">Voir sur le site</Link>
          {inDb && (
            <form action={deletePost}>
              <input type="hidden" name="slug" value={slug} />
              <button className="btn ghost small">Supprimer cette version</button>
            </form>
          )}
        </div>
      )}
    </AdminPage>
  );
}
