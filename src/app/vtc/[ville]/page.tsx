import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import JsonLd from "@/components/JsonLd";
import OnBoard from "@/components/OnBoard";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";
import { VILLES, getVille } from "@/lib/villes";

type Props = { params: Promise<{ ville: string }> };

export function generateStaticParams() {
  return VILLES.map((v) => ({ ville: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = getVille((await params).ville);
  if (!v) return {};
  const cheapest = Math.min(...v.routes.map((r) => r.price));
  const title = `VTC ${v.name} : chauffeur privé dès ${cheapest} €`;
  const description = `Chauffeur privé ${v.inName} à prix fixé : aéroport de Lille-Lesquin, gares de Lille, Paris, Bruxelles. Réservation en 1 min, annulation gratuite.`;
  return {
    title,
    description,
    alternates: { canonical: `/vtc/${v.slug}` },
    openGraph: { title, description, url: `${SITE.url}/vtc/${v.slug}`, type: "website", locale: "fr_FR", siteName: SITE.name, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function VillePage({ params }: Props) {
  const v = getVille((await params).ville);
  if (!v) notFound();
  const [airport, gare] = v.routes;
  const faqs = [
    { q: `Combien coûte un VTC ${v.fromName} à l'aéroport de Lille-Lesquin ?`, a: `Comptez à partir de ${airport.price} € pour environ ${airport.km} km (${airport.min} minutes hors embouteillages), en journée. Le prix exact dépend de votre adresse : il s'affiche dans le formulaire avant de payer et ne change plus ensuite.` },
    { q: `Combien coûte un VTC ${v.fromName} à la gare de Lille-Europe ?`, a: `À partir de ${gare.price} € en journée, pour environ ${gare.km} km. Une majoration de nuit de 20 % s'applique entre 22 h et 6 h ; elle est incluse dans le prix affiché.` },
    { q: `Peut-on réserver un chauffeur ${v.inName} tôt le matin ou tard le soir ?`, a: "Oui, 7 jours sur 7, à toute heure, sur réservation au moins 2 heures à l'avance. Pour un vol très matinal, réservez la veille : le chauffeur est confirmé par e-mail." },
    { q: `Le chauffeur suit-il mon vol ou mon train au départ ${v.fromName} ?`, a: "Oui : indiquez le numéro de vol ou de train à la réservation. En cas de retard, l'heure de prise en charge est adaptée sans frais." },
    { q: "Comment se passe le paiement ?", a: "Vous réglez un acompte en ligne par carte, Apple Pay ou Google Pay pour confirmer, puis le solde à bord. Vous pouvez aussi tout payer en ligne. L'annulation est gratuite jusqu'à 24 heures avant." },
  ];
  const others = VILLES.filter((x) => x.slug !== v.slug);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `VTC ${v.name} — chauffeur privé`,
          serviceType: "Transport de personnes avec chauffeur (VTC)",
          url: `${SITE.url}/vtc/${v.slug}`,
          areaServed: { "@type": "City", name: v.name },
          provider: { "@type": "TaxiService", name: SITE.name, url: SITE.url },
          offers: v.routes.map((r) => ({
            "@type": "Offer",
            name: `${v.name} → ${r.to}`,
            priceCurrency: "EUR",
            price: r.price,
            priceSpecification: { "@type": "PriceSpecification", minPrice: r.price, priceCurrency: "EUR" },
            url: `${SITE.url}/reservation?${new URLSearchParams({ from: v.query, to: r.to })}`,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Villes desservies", item: `${SITE.url}/vtc` },
            { "@type": "ListItem", position: 3, name: `VTC ${v.name}`, item: `${SITE.url}/vtc/${v.slug}` },
          ],
        }}
      />

      <section className="page-hero">
        <div className="wrap">
          <p className="crumbs">
            <Link href="/">Accueil</Link> / <Link href="/vtc">Villes desservies</Link> / {v.name}
          </p>
          <span className="eyebrow">Métropole lilloise</span>
          <h1>VTC {v.inName} : votre chauffeur privé, prix fixé d&apos;avance</h1>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid cols-2" style={{ gap: 48, alignItems: "start" }}>
          <div className="prose">
            {v.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}

            <h2>Prix d&apos;un VTC {v.fromName}</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Trajet</th><th>Distance</th><th>Durée</th><th>Prix</th></tr>
                </thead>
                <tbody>
                  {v.routes.map((r) => (
                    <tr key={r.to}>
                      <td><Link href={`/reservation?${new URLSearchParams({ from: v.query, to: r.to })}`}>{v.name} → {r.to}</Link></td>
                      <td>{Math.round(r.km)} km</td>
                      <td>~{r.min < 60 ? `${r.min} min` : `${Math.floor(r.min / 60)} h ${String(r.min % 60).padStart(2, "0")}`}</td>
                      <td><strong>dès {r.price} €</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted" style={{ fontSize: ".9rem" }}>
              Prix de jour, au départ du centre-ville. Le prix exact de votre adresse s&apos;affiche dans le formulaire et ne change plus après la réservation. Nuit (22 h–6 h) : +20 %.
            </p>

            <h2>Où votre chauffeur vous prend en charge {v.inName}</h2>
            <p>À votre domicile, à votre hôtel, à votre bureau ou à l&apos;un de ces lieux, entre autres :</p>
            <ul className="checks">
              {v.places.map((p) => <li key={p}>{p}</li>)}
            </ul>

            <h2>Pourquoi réserver un chauffeur privé {v.inName}</h2>
            <ul className="checks">
              <li>Prix ferme annoncé avant de payer, sans tarif dynamique</li>
              <li>Le même chauffeur du début à la fin, titulaire des cartes VTC et taxi</li>
              <li>Suivi de votre vol ou de votre train, attente gratuite incluse</li>
              <li>Toyota Auris hybride, siège enfant sur demande, eau et chargeurs à bord</li>
              <li>Annulation gratuite jusqu&apos;à 24 heures avant, facture fournie</li>
            </ul>
            <p className="seo-links">
              Trajets fréquents depuis la métropole : <Link href="/services/aeroport-lille-lesquin">aéroport de Lille-Lesquin</Link>,{" "}
              <Link href="/services/gare-lille-europe">gare de Lille-Europe</Link>, <Link href="/services/lille-bruxelles">Lille ↔ Bruxelles</Link>,{" "}
              <Link href="/services/aeroport-roissy-cdg">Paris-Charles-de-Gaulle</Link>. Voir aussi la <Link href="/tarifs">grille de tarifs</Link>.
            </p>
          </div>
          <div className="sticky-col">
            <h2 style={{ fontSize: "1.4rem" }}>Votre prix {v.fromName}, tout de suite</h2>
            <BookingForm initialFrom={v.query} initialTo={airport.to} />
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
          <h2>Questions fréquentes : VTC {v.inName}</h2>
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
          <h2 style={{ fontSize: "1.4rem" }}>Autres villes desservies</h2>
          <p className="chips">
            {others.map((o) => (
              <Link key={o.slug} href={`/vtc/${o.slug}`} className="chip">VTC {o.name}</Link>
            ))}
            <Link href="/" className="chip">VTC Lille</Link>
          </p>
          <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>Trajets et services</h2>
          <p className="chips">
            {SERVICES.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="chip">{s.label}</Link>
            ))}
          </p>
        </div>
      </section>
    </>
  );
}
