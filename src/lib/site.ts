// Informations de l'entreprise : à vérifier avant la mise en ligne.
// Les coordonnées de contact et l'adresse se règlent dans .env.local (voir .env.example).

export const SITE = {
  name: "Nord VTC",
  tagline: "Chauffeur privé à Lille — transferts aéroport, gares et longues distances",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nordvtc.fr").replace(/\/$/, ""),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "2 rue Charles Devendeville, 59810 Lesquin",
  legalPhone: "07 68 24 15 98", // affiché uniquement dans les mentions légales (obligation légale)
  area: "Lille et métropole lilloise, Hauts-de-France",
  legal: {
    form: "Entreprise individuelle (micro-entrepreneur)",
    owner: "Georgi Kavalerov",
    registeredName: "KAVALEROV GEORGI",
    siret: "88513522800025",
    host: "Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis (cloudflare.com)",
    registre: "EVTC059210198", // valable jusqu'au 30/12/2026 : à renouveler
    carteVtc: "05921285402", // carte professionnelle VTC, valable jusqu'au 24/11/2030
    plaque: "EB-069-PS",
    vehicule: "Toyota Auris hybride",
    insurer: "Mutuelle Fraternelle d'Assurances (MFA), 6 rue Fournier, 92110 Clichy",
    vatNote: "TVA non applicable, art. 293 B du CGI",
  },
} as const;

export const NAV = [
  { href: "/services", label: "Trajets" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/guide", label: "Guide" },
  { href: "/contact", label: "Contact" },
] as const;
