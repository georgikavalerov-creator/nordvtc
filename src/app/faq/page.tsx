import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import FaqList from "@/components/FaqList";
import { ALL_FAQ, FAQ_GROUPS } from "@/lib/faq";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Questions fréquentes : réservation, prix, annulation",
  description: "Toutes les réponses sur votre chauffeur VTC à Lille : réservation, prix et paiement, annulation, attente, bagages, animaux, siège enfant, facture.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: ALL_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Accueil", item: SITE.url }, { "@type": "ListItem", position: 2, name: "Questions fréquentes", item: `${SITE.url}/faq` }] }} />
      <section className="page-hero">
        <div className="wrap">
          <p className="crumbs"><Link href="/">Accueil</Link> / Questions fréquentes</p>
          <span className="eyebrow">Aide</span>
          <h1>Questions fréquentes</h1>
          <p className="muted" style={{ maxWidth: 680 }}>{ALL_FAQ.length} réponses sur la réservation, le prix, l&apos;annulation et le jour du trajet. Tapez un mot-clé pour trouver la vôtre.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap" style={{ maxWidth: 860 }}>
          <FaqList groups={FAQ_GROUPS} all />
          <p className="muted" style={{ marginTop: 28 }}>Une autre question ? <Link href="/contact">Écrivez-nous</Link> ou <Link href="/contact#appel">demandez à être rappelé</Link>.</p>
        </div>
      </section>
    </>
  );
}
