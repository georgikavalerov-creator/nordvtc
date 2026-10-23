// Pages locales « VTC à <ville> » pour le référencement dans la métropole lilloise.
// Distances relevées le 23/10/2026 avec le calcul du site (itinéraire sans circulation, stable ; départ du centre) ;
// les prix « à partir de » en sont déduits par la formule du site (src/lib/prix-depart.ts, tarif de jour).
// Le prix exact dépend de l'adresse et s'affiche dans le formulaire.
import { prixDes } from "./prix-depart";

export type Route = { to: string; price: number; km: number; min: number };
export type Ville = {
  slug: string;
  name: string; // nom affiché
  inName: string; // « à Roubaix », « au Touquet »…
  fromName: string; // « de Roubaix », « d'Armentières »…
  query: string; // texte pré-rempli dans le formulaire
  intro: string[];
  places: string[]; // lieux de prise en charge fréquents (connus de tous)
  local: string[]; // contexte propre à la ville (trajets, repères), pour une page vraiment utile
  routes: Route[];
};

// Chaque trajet : [distance en km, durée en minutes].
const R = (aeroport: number[], gare: number[], cdg: number[], zav: number[]): Route[] => [
  { to: "Aéroport de Lille-Lesquin", price: prixDes(aeroport[0]), km: aeroport[0], min: aeroport[1] },
  { to: "Gare de Lille-Europe", price: prixDes(gare[0]), km: gare[0], min: gare[1] },
  { to: "Aéroport de Bruxelles-Zaventem", price: prixDes(zav[0]), km: zav[0], min: zav[1] },
  { to: "Aéroport Paris-Charles-de-Gaulle", price: prixDes(cdg[0]), km: cdg[0], min: cdg[1] },
];

export const VILLES: Ville[] = [
  {
    slug: "roubaix", name: "Roubaix", inName: "à Roubaix", fromName: "de Roubaix", query: "Roubaix",
    intro: [
      "Vous partez de Roubaix pour prendre un avion ou un train ? Votre chauffeur privé vient vous chercher à votre porte, dans tous les quartiers de Roubaix, et vous dépose directement au terminal ou devant la gare.",
      "Le prix est fixé avant la réservation : pas de compteur, pas de majoration aux heures de pointe sur la métropole. Vous payez un acompte en ligne, le reste se règle à bord.",
    ],
    places: ["Gare de Roubaix", "Musée La Piscine", "Vélodrome de Roubaix", "Centre-ville et Grand-Place"],
    local: [
      "Depuis Roubaix, la route vers l'aéroport de Lille-Lesquin traverse la métropole par la voie rapide : comptez une petite demi-heure hors pointe, davantage le matin en semaine. Pour un vol tôt, une prise en charge à domicile évite de rejoindre Lille en métro avec ses valises.",
      "Le chauffeur connaît bien la ville, du centre et de la Grand-Place au parc Barbieux, en passant par les abords du Vélodrome les jours de course. Pour les visiteurs, La Piscine, le musée d'art et d'industrie installé dans une ancienne piscine Art déco, est une étape à ne pas manquer.",
    ],
    routes: R([20.87, 26], [11.31, 21], [208.27, 132], [126.96, 101]),
  },
  {
    slug: "tourcoing", name: "Tourcoing", inName: "à Tourcoing", fromName: "de Tourcoing", query: "Tourcoing",
    intro: [
      "Chauffeur privé à Tourcoing pour vos trajets vers l'aéroport de Lille-Lesquin, les gares de Lille, Bruxelles ou Paris. Prise en charge à domicile, à l'heure convenue, avec un prix connu d'avance.",
      "Tourcoing est à deux pas de la frontière belge : l'aéroport de Bruxelles-Zaventem se rejoint en voiture en moins de deux heures, sans correspondance.",
    ],
    places: ["Gare de Tourcoing", "Le Fresnoy", "Centre-ville", "Zone de la Marlière"],
    local: [
      "Tourcoing est l'une des communes de la métropole les plus proches de la Belgique : Bruxelles et son aéroport de Zaventem se rejoignent directement par l'autoroute, sans passer par le centre de Lille. C'est souvent le trajet le plus simple pour un vol au départ de Bruxelles.",
      "Pour les gares de Lille, le trajet prend un peu plus de vingt minutes hors pointe. Le chauffeur vous prend en charge en centre-ville, près du Fresnoy, le studio national des arts contemporains, ou dans les quartiers résidentiels, et vous dépose devant l'entrée de la gare.",
    ],
    routes: R([21.31, 28], [12.18, 22], [208.7, 134], [116.96, 95]),
  },
  {
    slug: "villeneuve-d-ascq", name: "Villeneuve-d'Ascq", inName: "à Villeneuve-d'Ascq", fromName: "de Villeneuve-d'Ascq", query: "Villeneuve-d'Ascq",
    intro: [
      "VTC à Villeneuve-d'Ascq : étudiants, enseignants, visiteurs du campus ou supporters, votre chauffeur vous prend en charge partout dans la ville, de la Cité scientifique au Stade Pierre-Mauroy.",
      "L'aéroport de Lille-Lesquin est à un quart d'heure environ : idéal pour un vol tôt le matin, quand les transports en commun ne circulent pas encore.",
    ],
    places: ["Stade Pierre-Mauroy", "Campus de la Cité scientifique", "LaM (musée d'art moderne)", "Centre commercial V2"],
    local: [
      "Villeneuve-d'Ascq est la commune la plus proche de l'aéroport parmi les grandes villes de la métropole : une douzaine de minutes suffisent hors pointe depuis le centre. Les jours de match ou de concert au Stade Pierre-Mauroy, les abords du stade sont fermés ou très chargés : convenez d'un point de prise en charge un peu à l'écart.",
      "Étudiants et enseignants de la Cité scientifique, visiteurs du LaM ou du lac du Héron, familles du quartier de l'Hôtel de ville ou de Pont-de-Bois : le chauffeur vient à l'adresse exacte, y compris tôt le matin quand le métro ne circule pas encore.",
    ],
    routes: R([8.7, 12], [10.87, 16], [196.09, 119], [129.57, 103]),
  },
  {
    slug: "marcq-en-baroeul", name: "Marcq-en-Barœul", inName: "à Marcq-en-Barœul", fromName: "de Marcq-en-Barœul", query: "Marcq-en-Barœul",
    intro: [
      "Votre chauffeur privé à Marcq-en-Barœul pour rejoindre les gares de Lille en quelques minutes, l'aéroport de Lesquin ou un rendez-vous professionnel à Paris ou Bruxelles.",
      "Voiture hybride, silencieuse et propre, chauffeur titulaire des cartes VTC et taxi : un service soigné pour vos déplacements personnels comme pour vos invités.",
    ],
    places: ["Hippodrome du Croisé-Laroche", "Grand Boulevard", "Centre-ville", "Zones d'activités"],
    local: [
      "Marcq-en-Barœul, le long du Grand Boulevard, est à une dizaine de minutes de la gare Lille-Europe : c'est le point de départ idéal pour un Eurostar ou un TGV. Pour l'aéroport de Lesquin, il faut traverser Lille par le périphérique : comptez une vingtaine de minutes hors pointe.",
      "Beaucoup de trajets partent ici de sièges d'entreprises et de cabinets : le chauffeur peut accueillir vos clients ou collaborateurs à la gare et les conduire jusqu'à vos bureaux, avec une facture au nom de l'entreprise.",
    ],
    routes: R([15.22, 21], [5.66, 10], [202.61, 128], [123.48, 99]),
  },
  {
    slug: "lambersart", name: "Lambersart", inName: "à Lambersart", fromName: "de Lambersart", query: "Lambersart",
    intro: [
      "Chauffeur privé à Lambersart pour vos départs en voyage ou vos trajets du quotidien : gares de Lille en un quart d'heure, aéroport de Lesquin, Paris et Bruxelles sans changement.",
      "Vous réservez en ligne en une minute, le prix est fixé et le chauffeur est le même du début à la fin.",
    ],
    places: ["Bords de la Deûle", "Canteleu", "Centre-ville", "Proximité de la Citadelle de Lille"],
    local: [
      "Lambersart borde la Citadelle et le bois de Boulogne, à l'ouest de Lille. La gare Lille-Europe est à un quart d'heure environ, l'aéroport de Lesquin à une vingtaine de minutes par le périphérique, davantage aux heures de pointe.",
      "Quartier résidentiel calme, Canteleu, avenue de l'Hippodrome, bords de la Deûle : le chauffeur vient vous chercher devant chez vous, ce qui évite de rejoindre une station de métro avec des valises.",
    ],
    routes: R([15.66, 23], [6.09, 15], [203.05, 129], [130.44, 103]),
  },
  {
    slug: "la-madeleine", name: "La Madeleine", inName: "à La Madeleine", fromName: "de La Madeleine", query: "La Madeleine",
    intro: [
      "VTC à La Madeleine : collée à Lille, la ville est idéale pour rejoindre les gares Lille-Europe et Lille-Flandres en quelques minutes, avec vos bagages, sans chercher de place.",
      "Pour l'aéroport de Lille-Lesquin, Paris ou Bruxelles, votre chauffeur suit l'heure de votre vol ou de votre train et adapte la prise en charge en cas de retard.",
    ],
    places: ["Gare de La Madeleine", "Grand Boulevard", "Centre-ville", "Romarin"],
    local: [
      "La Madeleine touche le centre de Lille : la gare Lille-Europe n'est qu'à quelques minutes en voiture, ce qui en fait l'un des trajets les moins chers vers les gares. Pour l'aéroport, comptez un quart d'heure hors pointe.",
      "Le chauffeur vous prend en charge le long du Grand Boulevard comme dans les rues résidentielles, et peut aussi vous ramener d'un dîner ou d'une sortie à Lille, sans vous soucier du stationnement.",
    ],
    routes: R([12.18, 16], [2.61, 8], [199.14, 122], [126.09, 102]),
  },
  {
    slug: "lesquin", name: "Lesquin", inName: "à Lesquin", fromName: "de Lesquin", query: "Lesquin",
    intro: [
      "Basé à Lesquin, votre chauffeur est à quelques minutes de l'aéroport de Lille-Lesquin : prise en charge rapide pour un départ ou un retour de vol, même tôt le matin ou tard le soir.",
      "Depuis Lesquin, rejoignez aussi les gares de Lille, Paris-Charles-de-Gaulle ou Bruxelles-Zaventem avec un prix fixé avant de partir.",
    ],
    places: ["Aéroport de Lille-Lesquin", "Zone d'activités de Lesquin", "Centre-ville", "Hôtels de l'aéroport"],
    local: [
      "Lesquin, c'est la commune de l'aéroport, et c'est aussi là qu'est installé votre chauffeur : il est à quelques minutes de chez vous ou du terminal. Les trajets courts vers l'aérogare sont au prix de la course minimum en journée.",
      "Pour vos voyages en train, la gare Lille-Europe et la gare Lille Flandres sont à environ un quart d'heure. Les entreprises de la zone d'activités peuvent réserver des trajets réguliers pour leurs visiteurs, avec une facturation regroupée.",
    ],
    routes: R([3.48, 6], [10.87, 16], [191.74, 116], [134.79, 106]),
  },
  {
    slug: "seclin", name: "Seclin", inName: "à Seclin", fromName: "de Seclin", query: "Seclin",
    intro: [
      "Chauffeur privé à Seclin pour l'aéroport de Lille-Lesquin, tout proche, les gares de Lille ou les trajets longue distance vers Paris et Bruxelles.",
      "Rendez-vous médical, déplacement professionnel ou départ en vacances : la course est réservée à l'avance, au prix annoncé.",
    ],
    places: ["Centre hospitalier de Seclin", "Gare de Seclin", "Zones d'activités", "Centre-ville"],
    local: [
      "Au sud de la métropole, Seclin est tout près de l'aéroport de Lesquin et de l'autoroute A1 : c'est un bon point de départ vers Paris et l'aéroport Charles-de-Gaulle, qui se rejoint directement sans traverser Lille.",
      "Le chauffeur vous prend en charge en centre-ville, près de la collégiale Saint-Piat, à l'hôpital ou dans les zones d'activités. Pour les gares de Lille, comptez une vingtaine de minutes hors pointe.",
    ],
    routes: R([9.57, 16], [17.4, 24], [188.7, 112], [141.74, 113]),
  },
  {
    slug: "armentieres", name: "Armentières", inName: "à Armentières", fromName: "d'Armentières", query: "Armentières",
    intro: [
      "VTC à Armentières : votre chauffeur vient vous chercher à domicile pour rejoindre Lille, l'aéroport de Lesquin ou une gare TGV, sans correspondance ni attente sur un quai.",
      "Pour les longues distances, Paris-Charles-de-Gaulle et Bruxelles-Zaventem sont desservis directement, avec un prix fixé à la réservation.",
    ],
    places: ["Gare d'Armentières", "Centre-ville", "Bords de la Lys", "Zones d'activités"],
    local: [
      "Armentières, sur la Lys et tout près de la Belgique, est plus éloignée de l'aéroport que le reste de la métropole : une bonne demi-heure de route, parfois davantage aux heures de pointe. Un trajet réservé à l'avance, avec une heure de prise en charge calculée large, évite tout stress avant un vol.",
      "Pour un train à Lille, le chauffeur vous dépose devant la gare Lille Flandres ou Lille Europe, sans correspondance. Il prend aussi en charge dans les communes voisines, de Houplines à Erquinghem-Lys, à l'adresse exacte.",
    ],
    routes: R([31.31, 36], [28.27, 35], [218.7, 137], [139.57, 112]),
  },
  {
    slug: "wasquehal", name: "Wasquehal", inName: "à Wasquehal", fromName: "de Wasquehal", query: "Wasquehal",
    intro: [
      "Chauffeur privé à Wasquehal, entre Lille et Roubaix : gares de Lille en une dizaine de minutes, aéroport de Lesquin, Paris et Bruxelles.",
      "Vous connaissez le prix avant de réserver, la course est confirmée par e-mail et vous pouvez l'annuler gratuitement jusqu'à 24 heures avant.",
    ],
    places: ["Grand Boulevard", "Centre-ville", "Zones d'activités", "Gare de Croix-Wasquehal"],
    local: [
      "Wasquehal, entre Lille, Marcq-en-Barœul, Croix et Roubaix, est desservie par le Grand Boulevard : la gare Lille-Europe est à un quart d'heure environ, l'aéroport de Lesquin à une vingtaine de minutes hors pointe.",
      "Résidents, entreprises de la zone d'activités ou visiteurs de passage : le chauffeur vient à l'adresse exacte et vous dépose devant le terminal ou la gare, avec un prix fixé avant la réservation.",
    ],
    routes: R([15.66, 22], [6.96, 13], [203.05, 128], [124.35, 100]),
  },
];

export const getVille = (slug: string) => VILLES.find((v) => v.slug === slug);
