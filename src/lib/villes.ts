// Pages locales « VTC à <ville> » pour le référencement dans la métropole lilloise.
// Prix relevés le 22/10/2026 avec le calcul du site (tarif de jour, départ depuis le centre de la commune).
// Ce sont des prix « à partir de » : le prix exact dépend de l'adresse et s'affiche dans le formulaire.

export type Route = { to: string; price: number; km: number; min: number };
export type Ville = {
  slug: string;
  name: string; // nom affiché
  inName: string; // « à Roubaix », « au Touquet »…
  fromName: string; // « de Roubaix », « d'Armentières »…
  query: string; // texte pré-rempli dans le formulaire
  intro: string[];
  places: string[]; // lieux de prise en charge fréquents (connus de tous)
  routes: Route[];
};

const R = (aeroport: number[], gare: number[], cdg: number[], zav: number[]): Route[] => [
  { to: "Aéroport de Lille-Lesquin", price: aeroport[0], km: aeroport[1], min: aeroport[2] },
  { to: "Gare de Lille-Europe", price: gare[0], km: gare[1], min: gare[2] },
  { to: "Aéroport de Bruxelles-Zaventem", price: zav[0], km: zav[1], min: zav[2] },
  { to: "Aéroport Paris-Charles-de-Gaulle", price: cdg[0], km: cdg[1], min: cdg[2] },
];

export const VILLES: Ville[] = [
  {
    slug: "roubaix", name: "Roubaix", inName: "à Roubaix", fromName: "de Roubaix", query: "Roubaix",
    intro: [
      "Vous partez de Roubaix pour prendre un avion ou un train ? Votre chauffeur privé vient vous chercher à votre porte, dans tous les quartiers de Roubaix, et vous dépose directement au terminal ou devant la gare.",
      "Le prix est fixé avant la réservation : pas de compteur, pas de majoration aux heures de pointe sur la métropole. Vous payez un acompte en ligne, le reste se règle à bord.",
    ],
    places: ["Gare de Roubaix", "Musée La Piscine", "Vélodrome de Roubaix", "Centre-ville et Grand-Place"],
    routes: R([82, 25, 32], [52, 11.7, 18], [500, 206, 125], [313, 125, 109]),
  },
  {
    slug: "tourcoing", name: "Tourcoing", inName: "à Tourcoing", fromName: "de Tourcoing", query: "Tourcoing",
    intro: [
      "Chauffeur privé à Tourcoing pour vos trajets vers l'aéroport de Lille-Lesquin, les gares de Lille, Bruxelles ou Paris. Prise en charge à domicile, à l'heure convenue, avec un prix connu d'avance.",
      "Tourcoing est à deux pas de la frontière belge : l'aéroport de Bruxelles-Zaventem se rejoint en voiture en moins de deux heures, sans correspondance.",
    ],
    places: ["Gare de Tourcoing", "Le Fresnoy", "Centre-ville", "Zone de la Marlière"],
    routes: R([90, 28, 32], [54, 12.5, 19], [505, 209, 124], [295, 117, 103]),
  },
  {
    slug: "villeneuve-d-ascq", name: "Villeneuve-d'Ascq", inName: "à Villeneuve-d'Ascq", fromName: "de Villeneuve-d'Ascq", query: "Villeneuve-d'Ascq",
    intro: [
      "VTC à Villeneuve-d'Ascq : étudiants, enseignants, visiteurs du campus ou supporters, votre chauffeur vous prend en charge partout dans la ville, de la Cité scientifique au Stade Pierre-Mauroy.",
      "L'aéroport de Lille-Lesquin est à une vingtaine de minutes : idéal pour un vol tôt le matin, quand les transports en commun ne circulent pas encore.",
    ],
    places: ["Stade Pierre-Mauroy", "Campus de la Cité scientifique", "LaM (musée d'art moderne)", "Centre commercial V2"],
    routes: R([63, 16.6, 21], [55, 12.9, 18], [480, 198, 115], [336, 135, 108]),
  },
  {
    slug: "marcq-en-baroeul", name: "Marcq-en-Barœul", inName: "à Marcq-en-Barœul", fromName: "de Marcq-en-Barœul", query: "Marcq-en-Barœul",
    intro: [
      "Votre chauffeur privé à Marcq-en-Barœul pour rejoindre les gares de Lille en quelques minutes, l'aéroport de Lesquin ou un rendez-vous professionnel à Paris ou Bruxelles.",
      "Voiture hybride, silencieuse et propre, chauffeur titulaire des cartes VTC et taxi : un service soigné pour vos déplacements personnels comme pour vos invités.",
    ],
    places: ["Hippodrome du Croisé-Laroche", "Grand Boulevard", "Centre-ville", "Zones d'activités"],
    routes: R([77, 22.5, 26], [37, 5.3, 9], [489, 202, 119], [311, 124, 104]),
  },
  {
    slug: "lambersart", name: "Lambersart", inName: "à Lambersart", fromName: "de Lambersart", query: "Lambersart",
    intro: [
      "Chauffeur privé à Lambersart pour vos départs en voyage ou vos trajets du quotidien : gares de Lille en un quart d'heure, aéroport de Lesquin, Paris et Bruxelles sans changement.",
      "Vous réservez en ligne en trois minutes, le prix est fixé et le chauffeur est le même du début à la fin.",
    ],
    places: ["Bords de la Deûle", "Canteleu", "Centre-ville", "Proximité de la Citadelle de Lille"],
    routes: R([76, 22.1, 28], [39, 6.2, 13], [491, 203, 120], [325, 130, 106]),
  },
  {
    slug: "la-madeleine", name: "La Madeleine", inName: "à La Madeleine", fromName: "de La Madeleine", query: "La Madeleine",
    intro: [
      "VTC à La Madeleine : collée à Lille, la ville est idéale pour rejoindre les gares Lille-Europe et Lille-Flandres en quelques minutes, avec vos bagages, sans chercher de place.",
      "Pour l'aéroport de Lille-Lesquin, Paris ou Bruxelles, votre chauffeur suit l'heure de votre vol ou de votre train et adapte la prise en charge en cas de retard.",
    ],
    places: ["Gare de La Madeleine", "Grand Boulevard", "Centre-ville", "Romarin"],
    routes: R([71, 20, 22], [32, 2.9, 7], [484, 199, 115], [317, 127, 108]),
  },
  {
    slug: "lesquin", name: "Lesquin", inName: "à Lesquin", fromName: "de Lesquin", query: "Lesquin",
    intro: [
      "Basé à Lesquin, votre chauffeur est à quelques minutes de l'aéroport de Lille-Lesquin : prise en charge rapide pour un départ ou un retour de vol, même tôt le matin ou tard le soir.",
      "Depuis Lesquin, rejoignez aussi les gares de Lille, Paris-Charles-de-Gaulle ou Bruxelles-Zaventem avec un prix fixé avant de partir.",
    ],
    places: ["Aéroport de Lille-Lesquin", "Zone d'activités de Lesquin", "Centre-ville", "Hôtels de l'aéroport"],
    routes: R([46, 9, 15], [47, 9.4, 15], [468, 193, 112], [336, 135, 109]),
  },
  {
    slug: "seclin", name: "Seclin", inName: "à Seclin", fromName: "de Seclin", query: "Seclin",
    intro: [
      "Chauffeur privé à Seclin pour l'aéroport de Lille-Lesquin, tout proche, les gares de Lille ou les trajets longue distance vers Paris et Bruxelles.",
      "Rendez-vous médical, déplacement professionnel ou départ en vacances : la course est réservée à l'avance, au prix annoncé.",
    ],
    places: ["Centre hospitalier de Seclin", "Gare de Seclin", "Zones d'activités", "Centre-ville"],
    routes: R([45, 8.8, 16], [65, 17.5, 24], [458, 188, 110], [354, 143, 113]),
  },
  {
    slug: "armentieres", name: "Armentières", inName: "à Armentières", fromName: "d'Armentières", query: "Armentières",
    intro: [
      "VTC à Armentières : votre chauffeur vient vous chercher à domicile pour rejoindre Lille, l'aéroport de Lesquin ou une gare TGV, sans correspondance ni attente sur un quai.",
      "Pour les longues distances, Paris-Charles-de-Gaulle et Bruxelles-Zaventem sont desservis directement, avec un prix fixé à la réservation.",
    ],
    places: ["Gare d'Armentières", "Centre-ville", "Bords de la Lys", "Zones d'activités"],
    routes: R([112, 37.7, 40], [90, 28.4, 31], [527, 218, 132], [345, 139, 118]),
  },
  {
    slug: "wasquehal", name: "Wasquehal", inName: "à Wasquehal", fromName: "de Wasquehal", query: "Wasquehal",
    intro: [
      "Chauffeur privé à Wasquehal, entre Lille et Roubaix : gares de Lille en une dizaine de minutes, aéroport de Lesquin, Paris et Bruxelles.",
      "Vous connaissez le prix avant de réserver, la course est confirmée par e-mail et vous pouvez l'annuler gratuitement jusqu'à 24 heures avant.",
    ],
    places: ["Grand Boulevard", "Centre-ville", "Zones d'activités", "Gare de Croix-Wasquehal"],
    routes: R([74, 21.5, 26], [42, 7.2, 11], [491, 203, 119], [312, 125, 104]),
  },
];

export const getVille = (slug: string) => VILLES.find((v) => v.slug === slug);
