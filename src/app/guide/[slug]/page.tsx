import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CtaBand from "@/components/CtaBand";
import JsonLd from "@/components/JsonLd";
import RichText from "@/components/RichText";
import { POSTS, fmtDate } from "@/lib/blog";
import { findPost, getAllPosts } from "@/lib/content";
import { SITE } from "@/lib/site";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await findPost((await params).slug);
  if (!p) return {};
  const description = p.description.length > 160 ? `${p.description.slice(0, 155).replace(/\s+\S*$/, "")}…` : p.description;
  return {
    title: { absolute: p.title.length > 52 ? p.title : `${p.title} | ${SITE.name}` },
    description,
    alternates: { canonical: `/guide/${p.slug}` },
    openGraph: { title: p.title, description: p.description, url: `${SITE.url}/guide/${p.slug}`, type: "article", locale: "fr_FR", siteName: SITE.name, publishedTime: p.date, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: p.title }] },
    twitter: { card: "summary_large_image", title: p.title, description: p.description },
  };
}

export default async function PostPage({ params }: Props) {
  const p = await findPost((await params).slug);
  if (!p) notFound();
  const more = (await getAllPosts()).filter((x) => x.slug !== p.slug).slice(0, 3);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: p.title,
          description: p.description,
          datePublished: p.date,
          dateModified: p.date,
          inLanguage: "fr-FR",
          mainEntityOfPage: `${SITE.url}/guide/${p.slug}`,
          author: { "@type": "Organization", name: SITE.name, url: SITE.url },
          publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Guide", item: `${SITE.url}/guide` },
            { "@type": "ListItem", position: 3, name: p.title, item: `${SITE.url}/guide/${p.slug}` },
          ],
        }}
      />
      <section className="page-hero">
        <div className="wrap">
          <p className="crumbs"><Link href="/">Accueil</Link> / <Link href="/guide">Guide</Link> / {p.tag}</p>
          <h1>{p.title}</h1>
          <p className="muted">{fmtDate(p.date)} · {p.minutes} min de lecture</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap prose">
          {p.body.map((b, i) =>
            b.t === "ul" ? <ul key={i}>{b.v.map((li, j) => <li key={j}><RichText text={li} /></li>)}</ul>
            : b.t === "h" ? <h2 key={i}>{b.v}</h2>
            : <p key={i}><RichText text={b.v} /></p>
          )}
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <h2 style={{ fontSize: "1.4rem" }}>À lire aussi</h2>
          <div className="grid cols-3">
            {more.map((x) => (
              <Link key={x.slug} href={`/guide/${x.slug}`} className="card">
                <span className="tag">{x.tag}</span>
                <h3>{x.title}</h3>
                <span className="more">Lire →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="Réservez votre chauffeur" text="Prix affiché avant de réserver, paiement sécurisé." />
    </>
  );
}
