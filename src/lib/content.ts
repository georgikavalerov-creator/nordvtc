import { cache } from "react";
import { db, dbConfigured } from "./supabase";
import { POSTS as STATIC_POSTS, type Block, type Post } from "./blog";

// ---------- Réglages modifiables depuis l'administration (table settings, clé "site") ----------
export type SiteSettings = {
  email: string;
  legalPhone: string;
  driverPhone: string;
  mediatorName: string;
  mediatorUrl: string;
  mediatorAddress: string;
  carteVtc: string;
  plaque: string;
  vehicule: string;
  tiimeEmail: string;
};

export const getSiteSettings = cache(async (): Promise<Partial<SiteSettings>> => {
  if (!dbConfigured()) return {};
  try {
    const { data } = await db().from("settings").select("value").eq("key", "site").maybeSingle();
    return (data?.value as Partial<SiteSettings>) ?? {};
  } catch {
    return {};
  }
});

// ---------- Guide : articles de la base + articles intégrés au code ----------
type Row = { slug: string; title: string; description: string; tag: string; minutes: number; published_on: string; published: boolean; body: Block[] };
const fromRow = (r: Row): Post => ({ slug: r.slug, title: r.title, description: r.description, tag: r.tag, minutes: r.minutes, date: r.published_on, body: r.body ?? [] });

async function dbRows(): Promise<Row[]> {
  if (!dbConfigured()) return [];
  try {
    const { data } = await db().from("site_posts").select("*");
    return (data as Row[]) ?? [];
  } catch {
    return [];
  }
}

// Un article de la base remplace celui du code qui a le même identifiant ; "published = false" le masque.
export const getAllPosts = cache(async (): Promise<Post[]> => {
  const rows = await dbRows();
  const hidden = new Set(rows.filter((r) => !r.published).map((r) => r.slug));
  const over = new Map(rows.filter((r) => r.published).map((r) => [r.slug, fromRow(r)]));
  const base = STATIC_POSTS.filter((p) => !hidden.has(p.slug) && !over.has(p.slug));
  return [...base, ...over.values()].sort((a, b) => b.date.localeCompare(a.date));
});
export const findPost = async (slug: string) => (await getAllPosts()).find((p) => p.slug === slug);

// ---------- Texte simple <-> blocs ----------
// "## Titre" = intertitre ; "- ligne" = puce ; le reste = paragraphes séparés par une ligne vide.
export function parseBody(text: string): Block[] {
  const out: Block[] = [];
  for (const chunk of text.replace(/\r/g, "").split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    let list: string[] = [];
    let para: string[] = [];
    const flush = () => {
      if (list.length) out.push({ t: "ul", v: list });
      if (para.length) out.push({ t: "p", v: para.join(" ") });
      list = []; para = [];
    };
    for (const l of lines) {
      if (l.startsWith("## ")) { flush(); out.push({ t: "h", v: l.slice(3).trim() }); }
      else if (/^[-•]\s+/.test(l)) { if (para.length) flush(); list.push(l.replace(/^[-•]\s+/, "")); }
      else { if (list.length) flush(); para.push(l); }
    }
    flush();
  }
  return out;
}
export function bodyToText(body: Block[]): string {
  return body.map((b) => (b.t === "h" ? `## ${b.v}` : b.t === "ul" ? b.v.map((x) => `- ${x}`).join("\n") : b.v)).join("\n\n");
}
