import type { Metadata } from "next";
import Link from "next/link";
import { SERVICE_PIC } from "@/lib/images";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import JsonLd from "@/components/JsonLd";
import { SERVICES, getService } from "@/lib/services";
import { CONTENT } from "@/lib/service-content";
import OnBoard from "@/components/OnBoard";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getService((await params).slug);
  if (!s) return {};
  const c = CONTENT[s.slug];
  const title = c?.metaTitle ?? s.metaTitle;
  const description = c?.metaDescription ?? s.metaDescription;
  return {
    title,
    description,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { title, description, url: `${SITE.url}/services/${s.slug}`, type: "website", locale: "fr_FR", siteName: SITE.name, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ServicePage({ params }: Props) {
  const s = getService((await params).slug);
  if (!s) notFound();
  const c = CONTENT[s.slug];
  const faqs = [...s.faq, ...c.moreFaq];
  const related = [...SERVICES.filter((x) => x.category === s.category && x.slug !== s.slug), ...SERVICES.filter((x) => x.category !== s.category && x.slug !== s.slug)].slice(0, 6);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.h1,
          description: c.metaDescription,
          url: `${SITE.url}/services/${s.slug}`,
          serviceType: "Transport de personnes avec chauffeur (VTC)",
          areaServed: ["Lille", "Métropole européenne de Lille", "Hauts-de-France"],
          provider: { "@type": "LocalBusiness", name: SITE.name, url: SITE.url },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Trajets", item: `${SITE.url}/services` },
            { "@type": "ListItem", position: 3, name: s.label, item: `${SITE.url}/services/${s.slug}` },
          ],
        }}
      />
      <section className="page-hero">
        <div className="wrap">
          <p className="crumbs">
            <Link href="/">Accueil</Link> / <Link href="/services">Trajets</Link> / {s.label}
          </p>
          <div className="split">
            <div>
              <span className="eyebrow">{s.category}</span>
              <h1>{s.h1}</h1>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="split-img" src={SERVICE_PIC[s.slug].src} alt={SERVICE_PIC[s.slug].alt} width={1000} height={666} style={{ objectPosition: SERVICE_PIC[s.slug].pos }} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid cols-2" style={{ gap: 48, alignItems: "start" }}>
          <div className="prose">
            {s.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <ul className="checks" style={{ marginTop: 24 }}>
              {s.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <aside className="keyfacts" aria-label="Informations pratiques">
              <h2>En bref</h2>
              <dl>
                {c.facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
            {c.sections.map((sec) => (
              <section key={sec.title}>
                <h2>{sec.title}</h2>
                {sec.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </section>
            ))}
            <p className="seo-links">
              Consultez aussi la <Link href="/tarifs">grille de tarifs indicatifs</Link> ou{" "}
              <Link href="/reservation">réservez directement en ligne</Link>.
            </p>
          </div>
          <div className="sticky-col">
            {s.kind === "route" ? (
              <>
                <h2 style={{ fontSize: "1.4rem" }}>Calculez votre prix et réservez</h2>
                <BookingForm initialFrom={s.from} initialTo={s.to} />
              </>
            ) : (
              <div className="ticket">
                <h2 style={{ fontSize: "1.4rem" }}>Demandez votre devis</h2>
                <p className="muted">
                  Ce service se prépare avec vous : donnez-nous la date, les lieux et vos horaires, nous vous répondons avec une proposition.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href={`/contact?sujet=${encodeURIComponent(s.label)}`} className="btn btn-arrow">Demander mon devis gratuit</Link>
                  <Link className="btn ghost" href="/contact#appel">Être rappelé</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>À bord</h2>
          <OnBoard />
        </div>
      </section>

      <section className="section alt">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <h2>Questions fréquentes</h2>
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p className="muted" style={{ marginTop: 10 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 style={{ fontSize: "1.4rem" }}>Autres trajets</h2>
          <div className="grid cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/services/${r.slug}`} className="card">
                <span className="tag">{r.category}</span>
                <h3>{r.label}</h3>
                <p className="muted">{CONTENT[r.slug].tags.join(" · ")}</p>
                <span className="more">Voir ce trajet →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
