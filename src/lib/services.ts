// Pages de trajets (SEO local). Chaque page a son texte propre et un calculateur de prix intégré.
// Le contenu est volontairement sobre : n'affirme aucun chiffre qui ne soit calculé en direct.

export type Faq = { q: string; a: string };

export type Service = {
  slug: string;
  kind: "route" | "theme"; // route : calculateur + réservation ; theme : demande de devis
  category: "Aéroports" | "Gares" | "Longue distance" | "Événements & pro";
  label: string; // libellé court (menus)
  h1: string;
  metaTitle: string;
  metaDescription: string;
  from: string;
  to: string;
  intro: string[];
  points: string[];
  faq: Faq[];
};

export const SERVICES: Service[] = [
  {
    slug: "aeroport-lille-lesquin",
    kind: "route",
    category: "Aéroports",
    label: "Aéroport de Lille-Lesquin",
    h1: "Transfert privé vers l'aéroport de Lille-Lesquin",
    metaTitle: "Transfert aéroport Lille-Lesquin — chauffeur privé",
    metaDescription:
      "Chauffeur privé pour l'aéroport de Lille-Lesquin : réservation en ligne, prix calculé avant la course, suivi de votre heure de départ ou d'arrivée.",
    from: "Lille",
    to: "Aéroport de Lille-Lesquin",
    intro: [
      "Partir ou arriver à Lesquin sans chercher une place ni surveiller l'heure : vous réservez, votre chauffeur est à l'heure convenue, et le prix est connu avant la course.",
      "Pour un départ, indiquez l'heure de votre vol : nous prévoyons le trajet pour que vous arriviez à l'aéroport avec la marge qui vous convient. Pour une arrivée, indiquez votre numéro de vol afin que le chauffeur vous attende.",
    ],
    points: [
      "Prise en charge à votre adresse, à Lille ou dans la métropole",
      "Prix calculé en ligne selon le trajet réel, avant de confirmer",
      "Numéro de vol pris en compte pour les arrivées",
      "Siège enfant ou rehausseur sur demande",
    ],
    faq: [
      {
        q: "Combien de temps avant mon vol dois-je partir ?",
        a: "Cela dépend de votre compagnie et du terminal, mais la plupart des voyageurs prévoient d'arriver à l'aéroport environ deux heures avant un vol. Indiquez l'heure souhaitée d'arrivée : le calculateur affiche la durée du trajet.",
      },
      {
        q: "Que se passe-t-il si mon vol a du retard ?",
        a: "Communiquez votre numéro de vol à la réservation et prévenez-nous en cas de changement : nous adaptons la prise en charge.",
      },
      {
        q: "Puis-je réserver à la dernière minute ?",
        a: "La réservation en ligne demande un délai minimum, indiqué dans le formulaire. Au-delà, contactez-nous directement.",
      },
    ],
  },
  {
    slug: "gare-lille-flandres",
    kind: "route",
    category: "Gares",
    label: "Gare de Lille-Flandres",
    h1: "Chauffeur privé pour la gare de Lille-Flandres",
    metaTitle: "Chauffeur privé gare Lille-Flandres — réservation en ligne",
    metaDescription:
      "Rejoignez ou quittez la gare de Lille-Flandres en chauffeur privé : prise en charge à l'heure, prix connu à l'avance, réservation en ligne avec acompte.",
    from: "Lille",
    to: "Gare Lille-Flandres",
    intro: [
      "Lille-Flandres est la gare du centre-ville : idéale pour rejoindre les trains vers Paris, Bruxelles, Amiens ou la côte. Nous venons vous chercher à votre adresse et vous déposons au bon accès.",
      "À l'arrivée, indiquez votre numéro de train : votre chauffeur suit l'horaire et vous attend. Bagages volumineux, voyage en famille ou rendez-vous professionnel : vous précisez vos besoins dans le formulaire.",
    ],
    points: [
      "Dépose ou prise en charge devant la gare, selon les accès autorisés",
      "Numéro de train indiqué à la réservation",
      "Prix annoncé avant de payer l'acompte",
      "Reste à régler à bord, ou totalité en ligne si vous préférez",
    ],
    faq: [
      {
        q: "Où le chauffeur me retrouve-t-il à la gare ?",
        a: "Nous convenons du point de rendez-vous par message avant la course, selon l'accès autorisé le jour même.",
      },
      {
        q: "Est-ce plus cher le soir ?",
        a: "Une majoration de nuit s'applique entre 22 h et 6 h. Elle est incluse dans le prix affiché par le calculateur.",
      },
      {
        q: "Puis-je payer à bord ?",
        a: "Vous réglez un acompte en ligne pour confirmer la réservation, puis le solde au chauffeur à bord.",
      },
    ],
  },
  {
    slug: "gare-lille-europe",
    kind: "route",
    category: "Gares",
    label: "Gare de Lille-Europe",
    h1: "Chauffeur privé pour la gare de Lille-Europe",
    metaTitle: "Chauffeur privé gare Lille-Europe — Eurostar, TGV",
    metaDescription:
      "Transfert en chauffeur privé vers la gare de Lille-Europe : trajet réservé à l'avance, prix calculé en ligne, prise en charge à l'adresse de votre choix.",
    from: "Lille",
    to: "Gare Lille-Europe",
    intro: [
      "Lille-Europe dessert les liaisons internationales et les TGV. Pour ne pas rater un départ, réservez un trajet calé sur l'heure de votre train, avec une prise en charge à votre domicile, votre hôtel ou votre bureau.",
      "À l'arrivée, votre chauffeur suit l'horaire de votre train et vous attend. Vous gardez la main sur le déroulé : adresse, bagages, nombre de passagers.",
    ],
    points: [
      "Prise en charge à l'adresse de votre choix",
      "Calcul du prix selon l'itinéraire réel",
      "Idéal pour les correspondances à horaire serré",
      "Facture disponible sur demande",
    ],
    faq: [
      {
        q: "Je prends un train international : combien de temps prévoir ?",
        a: "Les formalités éventuelles dépendent de votre voyage. Prévoyez une marge confortable et indiquez-nous l'heure à laquelle vous souhaitez être sur place.",
      },
      {
        q: "Peut-on voyager à plusieurs ?",
        a: "Oui, précisez le nombre de passagers et de bagages dans le formulaire.",
      },
      {
        q: "Puis-je obtenir une facture ?",
        a: "Oui, demandez-la à la réservation ou après la course.",
      },
    ],
  },
  {
    slug: "lille-paris",
    kind: "route",
    category: "Longue distance",
    label: "Lille ↔ Paris",
    h1: "Chauffeur privé Lille ↔ Paris",
    metaTitle: "Chauffeur privé Lille Paris — trajet direct, prix calculé",
    metaDescription:
      "Trajet privé Lille–Paris sans correspondance : prise en charge à votre adresse, prix calculé selon l'itinéraire, réservation en ligne avec acompte.",
    from: "Lille",
    to: "Paris",
    intro: [
      "Un trajet direct de porte à porte entre Lille et Paris, sans changer de transport ni porter vos bagages : vous choisissez l'adresse de départ et d'arrivée, nous calculons le prix à partir de l'itinéraire réel.",
      "Utile pour un rendez-vous, un vol à rejoindre ou un retour tardif, quand les horaires de train ne conviennent pas.",
    ],
    points: [
      "De votre adresse à l'adresse de destination, sans correspondance",
      "Prix calculé avant la course, selon la distance et la durée",
      "Majoration de nuit indiquée à l'avance si elle s'applique",
      "Retour possible : réservez un second trajet",
    ],
    faq: [
      {
        q: "Le prix peut-il changer pendant le trajet ?",
        a: "Non : le prix affiché à la réservation est celui que vous payez, sauf modification de l'itinéraire demandée par vous.",
      },
      {
        q: "Puis-je faire un aller-retour dans la journée ?",
        a: "Oui, contactez-nous pour organiser l'attente ou le retour.",
      },
      {
        q: "Les péages sont-ils compris ?",
        a: "Précisez-le avec nous à la réservation : nous vous indiquons ce qui est inclus avant toute confirmation.",
      },
    ],
  },
  {
    slug: "lille-bruxelles",
    kind: "route",
    category: "Longue distance",
    label: "Lille ↔ Bruxelles",
    h1: "Chauffeur privé Lille ↔ Bruxelles",
    metaTitle: "Chauffeur privé Lille Bruxelles — trajet transfrontalier",
    metaDescription:
      "Trajet privé entre Lille et Bruxelles : prise en charge à l'adresse de votre choix, prix calculé en ligne selon l'itinéraire, acompte pour confirmer.",
    from: "Lille",
    to: "Bruxelles",
    intro: [
      "Entre Lille et Bruxelles, un chauffeur vous emmène à l'adresse de votre choix : centre-ville, quartier européen ou aéroport. Vous indiquez le point de départ et d'arrivée, le calculateur affiche la distance, la durée et le prix.",
      "Pour un rendez-vous professionnel ou une arrivée à l'aéroport de Bruxelles, vous gardez une heure d'arrivée fiable, sans dépendre des horaires de train.",
    ],
    points: [
      "Trajet transfrontalier de porte à porte",
      "Prix annoncé à l'avance",
      "Adresse de destination en Belgique acceptée dans le formulaire",
      "Siège enfant sur demande",
    ],
    faq: [
      {
        q: "Faut-il prévoir un document particulier ?",
        a: "Pensez à emporter une pièce d'identité en cours de validité pour chaque passager.",
      },
      {
        q: "Peut-on aller à l'aéroport de Bruxelles ?",
        a: "Oui, saisissez l'aéroport comme adresse d'arrivée dans le formulaire.",
      },
      {
        q: "Puis-je réserver pour un groupe ?",
        a: "Indiquez le nombre de passagers dans le formulaire ; au-delà de la capacité du véhicule, contactez-nous.",
      },
    ],
  },
  {
    slug: "aeroport-roissy-cdg",
    kind: "route",
    category: "Aéroports",
    label: "Aéroport Paris-Charles-de-Gaulle",
    h1: "Transfert privé Lille ↔ aéroport Roissy-Charles-de-Gaulle",
    metaTitle: "Transfert Lille Roissy CDG — chauffeur privé",
    metaDescription:
      "Rejoignez l'aéroport de Roissy-Charles-de-Gaulle depuis Lille en chauffeur privé : trajet direct, prix calculé en ligne, réservation avec acompte.",
    from: "Lille",
    to: "Aéroport Paris-Charles de Gaulle",
    intro: [
      "Pour un vol long-courrier ou un horaire matinal, un trajet direct de chez vous jusqu'au terminal évite les correspondances et les bagages à porter. Vous indiquez votre terminal et l'heure de votre vol, nous prévoyons le départ.",
      "Au retour, partagez votre numéro de vol : votre chauffeur suit l'horaire d'arrivée et vous attend pour vous ramener à Lille.",
    ],
    points: [
      "Départ de Lille ou de la métropole, retour à votre adresse",
      "Terminal et numéro de vol renseignés à la réservation",
      "Prix annoncé à l'avance selon l'itinéraire",
      "Idéal pour les vols très tôt ou très tard",
    ],
    faq: [
      {
        q: "Comment choisir mon heure de départ ?",
        a: "Visez une arrivée confortable avant votre vol et tenez compte de la circulation en Île-de-France. Le calculateur donne une durée de trajet indicative.",
      },
      {
        q: "Et si mon vol arrive en retard ?",
        a: "Indiquez votre numéro de vol : nous suivons l'horaire réel et adaptons la prise en charge.",
      },
      {
        q: "Puis-je ajouter un arrêt ?",
        a: "Contactez-nous avant la réservation pour organiser un arrêt intermédiaire.",
      },
    ],
  },
  {
    slug: "mariage",
    kind: "theme",
    category: "Événements & pro",
    label: "Chauffeur mariage",
    h1: "Chauffeur privé pour votre mariage à Lille et dans le Nord",
    metaTitle: "Chauffeur mariage Lille et Nord — mise à disposition",
    metaDescription:
      "Un chauffeur à votre disposition le jour de votre mariage : trajet des mariés, navettes pour les invités, horaires respectés. Devis personnalisé.",
    from: "",
    to: "",
    intro: [
      "Le jour du mariage, chaque horaire compte : la mairie, la cérémonie, les photos, la salle. Un chauffeur à votre disposition sur une plage horaire définie à l'avance vous évite de gérer les trajets.",
      "Nous construisons le programme avec vous : lieu de départ, étapes, navettes pour les proches, durée de mise à disposition. Le devis est établi selon ce programme.",
    ],
    points: [
      "Mise à disposition sur une plage horaire convenue",
      "Navettes pour les invités sur demande",
      "Programme préparé avec vous avant le jour J",
      "Devis personnalisé, sans engagement",
    ],
    faq: [
      {
        q: "Comment obtenir un devis ?",
        a: "Écrivez-nous avec la date, les lieux et les horaires prévus : nous vous répondons avec une proposition adaptée.",
      },
      {
        q: "Peut-on prévoir des trajets pour les invités ?",
        a: "Oui, selon le nombre de personnes et la capacité du véhicule. Précisez-le dans votre demande.",
      },
      {
        q: "À quelle date faut-il réserver ?",
        a: "Le plus tôt possible, car les week-ends d'été partent vite.",
      },
    ],
  },
  {
    slug: "mise-a-disposition",
    kind: "theme",
    category: "Événements & pro",
    label: "Mise à disposition",
    h1: "Chauffeur à disposition à Lille, à l'heure ou à la journée",
    metaTitle: "Chauffeur à disposition Lille — demi-journée ou journée",
    metaDescription:
      "Un chauffeur privé pour plusieurs rendez-vous ou un programme chargé : mise à disposition à la demi-journée ou à la journée à Lille et dans la région.",
    from: "",
    to: "",
    intro: [
      "Plusieurs rendez-vous dans la même journée, des allers-retours, une visite ou un salon : la mise à disposition vous garde un chauffeur et un véhicule pour toute la durée prévue, sans reprendre un trajet à chaque étape.",
      "Deux formules de base, à la demi-journée ou à la journée. Pour un programme particulier, nous établissons un devis sur mesure.",
    ],
    points: [
      "Formules demi-journée et journée",
      "Arrêts multiples dans le programme",
      "Idéal pour les déplacements professionnels et les événements",
      "Devis rapide selon votre programme",
    ],
    faq: [
      {
        q: "Que comprend la mise à disposition ?",
        a: "Le chauffeur et le véhicule pendant la durée convenue, pour les trajets prévus à votre programme.",
      },
      {
        q: "Et si je dépasse la durée prévue ?",
        a: "Prévenez-nous : nous ajustons selon les disponibilités et le tarif horaire convenu à la réservation.",
      },
      {
        q: "Peut-on sortir de la métropole lilloise ?",
        a: "Oui, indiquez votre programme et nous établissons un devis adapté.",
      },
    ],
  },
  {
    slug: "sorties-evenements",
    kind: "theme",
    category: "Événements & pro",
    label: "Sorties et spectacles",
    h1: "Chauffeur pour vos sorties, concerts et matchs à Lille",
    metaTitle: "VTC sorties et spectacles Lille — Pierre-Mauroy, Zénith",
    metaDescription:
      "Rentrez sans stress après un concert, un match ou une soirée : réservation à l'avance d'un chauffeur privé à la sortie des salles et stades de la métropole lilloise.",
    from: "",
    to: "",
    intro: [
      "À la sortie d'un concert ou d'un match, les parkings sont saturés et les applications montent en prix. Réserver à l'avance un chauffeur qui vous attend à un point convenu vous évite l'attente.",
      "Indiquez la salle, l'horaire de fin prévu et le nombre de personnes : nous organisons le retour.",
    ],
    points: [
      "Retour réservé à l'avance, au point de rendez-vous convenu",
      "Prix annoncé avant l'événement",
      "Aller et retour possibles",
      "Pratique pour les groupes",
    ],
    faq: [
      {
        q: "Où le chauffeur m'attend-il ?",
        a: "Nous définissons ensemble un point de rendez-vous accessible aux abords du lieu, selon les restrictions de circulation du soir même.",
      },
      {
        q: "Et si l'événement se termine plus tard que prévu ?",
        a: "Prévenez-nous : l'heure de prise en charge s'adapte, dans les limites convenues à la réservation.",
      },
      {
        q: "Puis-je réserver pour un groupe ?",
        a: "Oui, indiquez le nombre de personnes pour que nous vérifiions la capacité.",
      },
    ],
  },
  {
    slug: "entreprises",
    kind: "theme",
    category: "Événements & pro",
    label: "Entreprises",
    h1: "Chauffeur privé pour les entreprises à Lille",
    metaTitle: "VTC entreprise Lille — compte pro et facturation mensuelle",
    metaDescription:
      "Déplacements professionnels à Lille : réservation par vos équipes ou votre secrétariat, facturation regroupée sur demande, interlocuteur direct.",
    from: "",
    to: "",
    intro: [
      "Pour vos collaborateurs, vos clients ou vos invités, un interlocuteur unique et des trajets réservés à l'avance simplifient la gestion des déplacements.",
      "Nous pouvons mettre en place une facturation regroupée et une réservation déléguée à votre secrétariat. Parlez-nous de vos besoins : fréquence, trajets habituels, justificatifs attendus.",
    ],
    points: [
      "Interlocuteur direct, sans centre d'appel",
      "Facturation regroupée sur demande",
      "Réservation par vos équipes ou votre secrétariat",
      "Trajets réguliers : tarif à convenir ensemble",
    ],
    faq: [
      {
        q: "Peut-on avoir une facture mensuelle ?",
        a: "C'est possible sur demande, selon un accord préalable avec votre entreprise.",
      },
      {
        q: "Qui peut réserver ?",
        a: "Vos collaborateurs ou votre secrétariat, selon l'organisation que nous mettons en place ensemble.",
      },
      {
        q: "Intervenez-vous pour les institutions et structures sociales ?",
        a: "Oui, contactez-nous pour définir les modalités adaptées à votre structure.",
      },
    ],
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
