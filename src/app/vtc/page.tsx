import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site";
import { VILLES } from "@/lib/villes";

export const metadata: Metadata = {
  title: "VTC métropole lilloise : villes et prix",
  description: "Chauffeur privé à Lille, Roubaix, Tourcoing, Villeneuve-d'Ascq, Marcq-en-Barœul, Lesquin et toute la métropole : prix fixé, aéroport, gares, Paris, Bruxelles.",
  alternates: { canonical: "/vtc" },
};

export default function VillesPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Villes desservies par Nord VTC",
          itemListElement: VILLES.map((v, i) => ({ "@type": "ListItem", position: i + 1, name: `VTC ${v.name}`, url: `${SITE.url}/vtc/${v.slug}` })),
        }}
      />
      <section className="page-hero">
        <div className="wrap">
          <p className="crumbs"><Link href="/">Accueil</Link> / Villes desservies</p>
          <span className="eyebrow">Métropole lilloise</span>
          <h1>Chauffeur privé dans toute la métropole lilloise</h1>
          <p className="muted" style={{ maxWidth: 680 }}>
            Basé à Lesquin, Nord VTC vous prend en charge à Lille et dans les communes voisines, 7 jours sur 7, pour l&apos;aéroport, les gares, Paris, Bruxelles ou vos déplacements du quotidien. Le prix est fixé avant de réserver.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="grid cols-3">
            <Link href="/" className="card">
              <span className="tag">Lille</span>
              <h2 style={{ fontSize: "1.2rem" }}>VTC Lille</h2>
              <p className="muted">Centre, Vieux-Lille, Euralille, Wazemmes, Lille-Sud… aéroport dès 68 €.</p>
              <span className="more">Voir les prix →</span>
            </Link>
            {VILLES.map((v) => {
              const a = v.routes[0];
              return (
                <Link key={v.slug} href={`/vtc/${v.slug}`} className="card">
                  <span className="tag">Métropole</span>
                  <h2 style={{ fontSize: "1.2rem" }}>VTC {v.name}</h2>
                  <p className="muted">Aéroport de Lille-Lesquin dès {a.price} € · gare de Lille-Europe dès {v.routes[1].price} €</p>
                  <span className="more">Voir les prix →</span>
                </Link>
              );
            })}
          </div>
          <p className="muted" style={{ marginTop: 24 }}>
            Votre commune n&apos;est pas dans la liste ? Nous desservons toute la métropole et le Nord : <Link href="/reservation">saisissez votre adresse</Link> pour voir le prix exact.
          </p>
        </div>
      </section>
    </>
  );
}
