// Articles du guide. Pour en ajouter un : copier un bloc de POSTS, changer slug/titre/date/contenu.
// Mise en forme : "h" = intertitre, "p" = paragraphe, "ul" = liste. Lien interne : [texte](/chemin).
export type Block = { t: "h" | "p"; v: string } | { t: "ul"; v: string[] };
export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // AAAA-MM-JJ
  tag: string;
  minutes: number;
  body: Block[];
};

export const POSTS: Post[] = [
  {
    slug: "aller-aeroport-lille-lesquin",
    title: "Comment aller à l'aéroport de Lille-Lesquin : les options comparées",
    description:
      "Voiture, VTC, taxi, transports en commun : comment rejoindre l'aéroport de Lille-Lesquin depuis Lille, Roubaix, Tourcoing ou Villeneuve-d'Ascq, avec nos conseils pour ne pas rater votre vol.",
    date: "2026-10-20",
    tag: "Aéroport",
    minutes: 4,
    body: [
      { t: "p", v: "L'aéroport de Lille-Lesquin se trouve à une dizaine de kilomètres du centre de Lille, juste à côté de l'autoroute A1. Selon l'heure, comptez environ 15 minutes depuis la gare de Lille Flandres, davantage aux heures de pointe." },
      { t: "h", v: "Les options pour y aller" },
      { t: "ul", v: [
        "Voiture personnelle : pratique, mais le stationnement longue durée a un coût et les places se remplissent en haute saison.",
        "Taxi ou VTC : porte-à-porte, sans stationnement à gérer. Avec un VTC réservé à l'avance, le prix est connu avant le départ.",
        "Transports en commun : possibles selon votre point de départ et l'horaire du vol, mais avec bagages ou départ très matinal, les correspondances sont moins confortables. Vérifiez les horaires à jour sur le site de l'aéroport et d'Ilévia.",
      ] },
      { t: "h", v: "Quand partir ?" },
      { t: "p", v: "Pour un vol en Europe, présentez-vous à l'aéroport environ 2 heures avant le décollage. Ajoutez une marge si vous partez aux heures de pointe : l'A1 et le périphérique peuvent ralentir fortement en début de matinée et en fin d'après-midi." },
      { t: "h", v: "À l'arrivée" },
      { t: "p", v: "Pour un retour de voyage, un chauffeur réservé à l'avance suit votre numéro de vol : en cas de retard, il adapte l'heure de prise en charge et vous attend à la sortie." },
      { t: "p", v: "Vous voulez connaître le prix ? Consultez la page [transfert aéroport Lille-Lesquin](/services/aeroport-lille-lesquin) : le tarif s'affiche avant de réserver." },
    ],
  },
  {
    slug: "gare-lille-flandres-ou-lille-europe",
    title: "Lille Flandres ou Lille Europe : quelle gare pour votre train ?",
    description:
      "Les deux gares de Lille sont à quelques minutes à pied l'une de l'autre, mais ne desservent pas les mêmes trains. Comment ne pas vous tromper et gagner du temps avec vos bagages.",
    date: "2026-10-18",
    tag: "Gares",
    minutes: 3,
    body: [
      { t: "p", v: "Lille compte deux gares principales, très proches l'une de l'autre (environ 5 à 10 minutes à pied). Se tromper de gare est pourtant une erreur fréquente, surtout avec des valises." },
      { t: "h", v: "Lille Flandres" },
      { t: "p", v: "Gare historique du centre-ville : elle dessert notamment les TER des Hauts-de-France et de nombreux trains vers Paris et les villes de la région." },
      { t: "h", v: "Lille Europe" },
      { t: "p", v: "Gare tournée vers l'international, à côté du centre commercial Euralille : on y prend notamment les trains vers Bruxelles, Londres et plusieurs destinations en France et en Europe." },
      { t: "h", v: "Le bon réflexe" },
      { t: "ul", v: [
        "Regardez sur votre billet le nom exact de la gare de départ avant de partir.",
        "Prévoyez 15 à 20 minutes d'avance de plus si vous devez changer de gare.",
        "Pour un train international, vérifiez l'heure de présentation conseillée par la compagnie.",
      ] },
      { t: "p", v: "Nos chauffeurs vous déposent devant la bonne gare, au plus près de l'entrée. Voir les pages [Lille Flandres](/services/gare-lille-flandres) et [Lille Europe](/services/gare-lille-europe)." },
    ],
  },
  {
    slug: "vtc-ou-taxi-quelle-difference",
    title: "VTC ou taxi : quelles différences, que choisir à Lille ?",
    description:
      "Réservation, prix, prise en charge : ce qui distingue un VTC d'un taxi, et dans quels cas préférer l'un ou l'autre pour vos trajets à Lille.",
    date: "2026-10-16",
    tag: "Conseils",
    minutes: 3,
    body: [
      { t: "p", v: "Taxi et VTC transportent des passagers avec un chauffeur, mais les règles ne sont pas les mêmes." },
      { t: "h", v: "Le taxi" },
      { t: "ul", v: [
        "Peut être hélé dans la rue ou pris à une station.",
        "Tarif réglementé, calculé au compteur.",
        "Idéal pour un déplacement immédiat, sans réservation.",
      ] },
      { t: "h", v: "Le VTC (voiture de transport avec chauffeur)" },
      { t: "ul", v: [
        "Se réserve toujours à l'avance : un VTC ne peut pas être hélé dans la rue.",
        "Le prix est généralement annoncé avant la course, sans surprise au compteur.",
        "Idéal pour un trajet planifié : aéroport, gare, rendez-vous, soirée.",
      ] },
      { t: "h", v: "Lequel choisir ?" },
      { t: "p", v: "Pour un départ à heure fixe (avion, train), la réservation à l'avance avec prix connu est rassurante. Pour se déplacer à l'improviste, le taxi reste plus simple." },
      { t: "p", v: "Chez Nord VTC, le prix s'affiche avant la réservation : essayez le calculateur sur la page [Tarifs](/tarifs)." },
    ],
  },
  {
    slug: "braderie-de-lille-se-deplacer",
    title: "Braderie de Lille : comment s'y rendre et rentrer sans stress",
    description:
      "La Braderie de Lille attire des centaines de milliers de visiteurs chaque année. Circulation, stationnement, retour tard le soir : nos conseils pour vous déplacer.",
    date: "2026-10-14",
    tag: "Événements",
    minutes: 3,
    body: [
      { t: "p", v: "Chaque année, le premier week-end de septembre, la Braderie de Lille transforme le centre-ville en marché géant. C'est un rendez-vous incontournable de la métropole, mais aussi un casse-tête pour circuler." },
      { t: "h", v: "À savoir avant d'y aller" },
      { t: "ul", v: [
        "De nombreuses rues du centre sont fermées à la circulation : renseignez-vous sur le plan officiel de la ville.",
        "Le stationnement à proximité est vite saturé. Mieux vaut se faire déposer à l'écart des zones fermées.",
        "Le retour tard le soir ou en pleine nuit est le moment le plus compliqué : réservez-le à l'avance.",
      ] },
      { t: "h", v: "Se faire déposer, c'est plus simple" },
      { t: "p", v: "Avec un chauffeur, vous évitez de chercher une place et vous rentrez sans conduire après la soirée. Convenez d'un point de rendez-vous accessible pour le retour, en dehors du périmètre fermé." },
      { t: "p", v: "Pour une sortie en groupe, découvrez notre offre [sorties et événements](/services/sorties-evenements)." },
    ],
  },
  {
    slug: "que-faire-a-lille-un-week-end",
    title: "Un week-end à Lille : 6 idées de visites à ne pas manquer",
    description:
      "Grand-Place, Vieux-Lille, musées, marché de Wazemmes : un programme simple pour découvrir Lille en un week-end, avec des conseils pour vous déplacer.",
    date: "2026-10-12",
    tag: "Visiter Lille",
    minutes: 4,
    body: [
      { t: "p", v: "Lille se visite très bien en deux jours : le centre est compact et la plupart des lieux se rejoignent à pied ou en métro." },
      { t: "h", v: "À voir" },
      { t: "ul", v: [
        "La Grand-Place et la Vieille Bourse, au cœur de la ville.",
        "Le Vieux-Lille : rues pavées, boutiques et façades flamandes.",
        "Le Palais des Beaux-Arts, l'un des grands musées de France.",
        "Le marché de Wazemmes, le dimanche matin, très animé.",
        "La Citadelle et le bois de Boulogne pour une balade au vert.",
        "Une étape gourmande : estaminets, gaufres, maroilles et bières du Nord.",
      ] },
      { t: "h", v: "Se déplacer" },
      { t: "p", v: "Le métro et le tramway relient bien le centre. Pour arriver avec des bagages, rejoindre un hôtel un peu excentré ou une sortie tardive, un chauffeur est plus confortable." },
      { t: "p", v: "Vous arrivez en train ou en avion ? Voyez nos trajets depuis la [gare](/services/gare-lille-flandres) ou l'[aéroport](/services/aeroport-lille-lesquin), prix affiché à l'avance." },
    ],
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
export const fmtDate = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
