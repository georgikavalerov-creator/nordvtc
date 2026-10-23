// Injecte des données structurées schema.org. Le contenu est généré côté serveur à partir de données maîtrisées.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Fil d'Ariane schema.org « Accueil › <page> » pour les pages de premier niveau. */
export function Crumb({ name, path }: { name: string; path: string }) {
  const base = "https://nordvtc.fr";
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: base },
          { "@type": "ListItem", position: 2, name, item: `${base}${path}` },
        ],
      }}
    />
  );
}
