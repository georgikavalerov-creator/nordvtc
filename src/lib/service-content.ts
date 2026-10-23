// Contenu éditorial détaillé de chaque page de trajet (SEO local).
// Règle : aucune statistique inventée. Les distances et durées sont des ordres de grandeur ;
// les prix réels sont toujours calculés en direct par le calculateur.

import type { Faq } from "./services";
import { prix } from "./prix-depart";

export type Section = { title: string; body: string[] };
export type Fact = { label: string; value: string };

export type ServiceContent = {
  metaTitle: string;
  metaDescription: string;
  summary: string; // texte de la carte sur l'accueil
  tags: string[]; // 3 puces sur la carte
  sections: Section[];
  facts: Fact[];
  moreFaq: Faq[];
};

export const CONTENT: Record<string, ServiceContent> = {
  "aeroport-bruxelles-zaventem": {
    metaTitle: "VTC Lille aéroport Bruxelles-Zaventem : prix fixé",
    metaDescription: "Chauffeur privé de Lille à l'aéroport de Bruxelles-Zaventem : trajet direct jusqu'au terminal, suivi de vol, prix fixé avant la course.",
    summary: "De Lille à Brussels Airport sans train ni correspondance : prise en charge à domicile, dépose au terminal, et au retour un chauffeur qui suit votre vol. Prix fixé avant le départ.",
    tags: ["Direct jusqu'au terminal", "Suivi de vol", "Prix fixé d'avance"],
    sections: [
      { title: "Pourquoi partir de Zaventem", body: ["Brussels Airport dessert de nombreuses destinations long-courrier et européennes. Depuis Lille, la voiture avec chauffeur est le moyen le plus simple de s'y rendre avec des bagages : pas de changement à Bruxelles-Midi, pas de navette."] },
      { title: "Au retour", body: ["Indiquez votre numéro de vol à la réservation. Le chauffeur suit l'heure réelle d'atterrissage et vous attend en salle d'arrivée ; l'attente liée au retard du vol ne vous est pas facturée."] },
    ],
    facts: [
      { label: "Distance depuis Lille", value: "environ 130 km" },
      { label: "Durée habituelle", value: "1 h 30 à 1 h 45" },
      { label: "Prix", value: `dès ${prix("zaventem")} € depuis Lille, fixé avant de confirmer` },
      { label: "Paiement", value: "acompte en ligne, solde à bord" },
    ],
    moreFaq: [
      { q: "Le prix change-t-il s'il y a des bouchons sur le ring de Bruxelles ?", a: "Non : le prix est fixé à la réservation et ne bouge plus, quelle que soit la circulation." },
    ],
  },
  "lille-cote-opale": {
    metaTitle: "VTC Lille Le Touquet, Côte d'Opale : prix fixé",
    metaDescription: "Chauffeur privé de Lille au Touquet-Paris-Plage, à Boulogne, Wimereux ou Calais : trajet direct, bagages compris, prix annoncé avant la course.",
    summary: "Le Touquet, Wimereux, Boulogne ou Calais : un trajet direct depuis Lille avec vos bagages, jusqu'à votre hôtel ou votre location. Prix fixé avant le départ, retour à la date de votre choix.",
    tags: ["Le Touquet, Boulogne, Calais", "Aller-retour", "Prix fixé d'avance"],
    sections: [
      { title: "Un week-end à la mer sans voiture", body: ["Pas besoin de prendre votre voiture ni de chercher à vous garer : votre chauffeur vous dépose devant votre hôtel ou votre location et revient vous chercher le jour du retour."] },
      { title: "Ferry et Eurotunnel à Calais", body: ["Pour une traversée vers l'Angleterre, indiquez le terminal et l'heure de départ : le trajet est prévu avec une marge adaptée aux contrôles."] },
    ],
    facts: [
      { label: "Distance Lille - Le Touquet", value: "environ 175 km" },
      { label: "Durée habituelle", value: "1 h 45 à 2 h" },
      { label: "Prix", value: `dès ${prix("touquet")} € depuis Lille, fixé avant de confirmer` },
      { label: "Paiement", value: "acompte en ligne, solde à bord" },
    ],
    moreFaq: [
      { q: "Peut-on s'arrêter en route ?", a: "Oui, une courte pause est possible sur un long trajet ; pour un arrêt à une adresse précise, indiquez-le dans les précisions de la réservation." },
    ],
  },
  "aeroport-lille-lesquin": {
    metaTitle: "VTC aéroport Lille-Lesquin : prix fixé",
    metaDescription:
      "Transfert VTC vers l'aéroport de Lille-Lesquin depuis Lille et la métropole : chauffeur ponctuel, suivi de vol, prix affiché avant de confirmer.",
    summary:
      "Départ ou arrivée à Lille-Lesquin : un chauffeur privé vous prend en charge à votre adresse, suit l'heure de votre vol et vous annonce le prix avant la course. Valises, siège enfant et départs très tôt le matin sont pris en compte à la réservation.",
    tags: ["Suivi de vol", "Prix fixé d'avance", "Départs tôt ou tard"],
    sections: [
      {
        title: "Un chauffeur VTC pour l'aéroport de Lille-Lesquin",
        body: [
          "L'aéroport de Lille-Lesquin se trouve à une dizaine de kilomètres du centre de Lille, au sud-est de la métropole. Le trajet est court, mais il demande de l'organisation : stationnement payant, navettes aux horaires fixes, valises à porter. Avec un chauffeur privé, vous êtes pris en charge devant chez vous et déposé au plus près de l'aérogare.",
          "Vous réservez en ligne en quelques instants : vous saisissez l'adresse de départ, la date et l'heure, et le prix de la course s'affiche avant toute confirmation. Il n'y a pas de compteur et pas de mauvaise surprise à l'arrivée.",
        ],
      },
      {
        title: "Départ : à quelle heure partir de chez vous ?",
        body: [
          "Pour un vol au départ de Lesquin, la plupart des voyageurs prévoient d'être à l'aéroport environ deux heures avant le décollage, parfois davantage en période de vacances. Indiquez l'heure de votre vol et celle à laquelle vous souhaitez arriver : votre chauffeur calcule l'heure de prise en charge en tenant compte de la circulation habituelle sur la rocade et l'A1.",
          "Vous avez un vol très tôt le matin ou un retour tard le soir ? Les trajets de nuit sont possibles sur réservation. Le tarif éventuel de nuit est affiché dans le calculateur avant de payer l'acompte.",
        ],
      },
      {
        title: "Arrivée : être attendu à votre atterrissage",
        body: [
          "Pour un retour à Lesquin, renseignez votre numéro de vol dans le formulaire. Le chauffeur suit l'heure d'arrivée réelle : si l'avion a du retard, la prise en charge s'adapte sans frais de votre côté. Un message vous confirme le point de rendez-vous avant l'atterrissage, pour que vous sachiez où le retrouver dès la sortie des bagages.",
        ],
      },
      {
        title: "Depuis et vers toute la métropole lilloise",
        body: [
          "La prise en charge se fait à l'adresse de votre choix : Lille (Vieux-Lille, Euralille, Wazemmes, Vauban), Villeneuve-d'Ascq, Marcq-en-Barœul, Lambersart, Roubaix, Tourcoing, Wasquehal, Mons-en-Barœul ou Seclin. Le prix dépend de l'itinéraire réel entre votre adresse et l'aéroport, et s'affiche dès que vous saisissez vos adresses.",
        ],
      },
      {
        title: "VTC ou taxi pour aller à l'aéroport ?",
        body: [
          "Un taxi peut être hélé dans la rue et facture au compteur. Un VTC se réserve à l'avance et annonce le prix avant la course : vous savez ce que vous allez payer, et le chauffeur vous attend à l'heure convenue. Pour un vol à ne pas manquer, la réservation anticipée est la solution la plus rassurante.",
        ],
      },
    ],
    facts: [
      { label: "Distance depuis le centre de Lille", value: "environ 10 km" },
      { label: "Durée habituelle", value: "environ 20 minutes hors circulation dense" },
      { label: "Prise en charge", value: "à l'adresse de votre choix" },
      { label: "Prix", value: "annoncé avant de confirmer" },
      { label: "Paiement", value: "acompte en ligne, solde à bord" },
    ],
    moreFaq: [
      {
        q: "Où le chauffeur m'attend-il à l'aéroport ?",
        a: "Le point de rendez-vous vous est communiqué avant votre arrivée. Le chauffeur suit votre vol et reste joignable pour vous retrouver facilement à la sortie.",
      },
      {
        q: "Prenez-vous les départs très tôt le matin ou de nuit ?",
        a: "Oui, sur réservation. Si une majoration de nuit s'applique, elle est incluse dans le prix affiché avant que vous confirmiez.",
      },
      {
        q: "Puis-je emmener plusieurs valises ?",
        a: "Indiquez le nombre de passagers et de bagages dans le formulaire. Le coffre est adapté à un usage de transfert aéroport ; pour un chargement volumineux, précisez-le dans le champ de précisions.",
      },
      {
        q: "Comment payer ?",
        a: "Vous réglez un acompte en ligne par carte pour confirmer la réservation, puis le solde à bord à la fin de la course.",
      },
    ],
  },

  "gare-lille-flandres": {
    metaTitle: "VTC gare de Lille-Flandres : chauffeur privé",
    metaDescription:
      "Chauffeur VTC pour la gare de Lille-Flandres : prise en charge à domicile ou à l'hôtel, ponctualité pour votre TER ou TGV, prix annoncé d'avance.",
    summary:
      "Pour attraper votre TER ou TGV ou rentrer chez vous à l'arrivée : un chauffeur vous récupère à votre adresse ou devant la gare de Lille-Flandres, avec un prix connu d'avance. Idéal avec des valises, un enfant ou un train tôt le matin.",
    tags: ["TER et TGV", "Prise en charge à domicile", "Prix annoncé"],
    sections: [
      {
        title: "Rejoindre ou quitter la gare de Lille-Flandres sans stress",
        body: [
          "La gare de Lille-Flandres, au cœur de la ville, dessert les TER des Hauts-de-France et de nombreux TGV. Ses abords sont souvent chargés : circulation dense, arrêts limités, stationnement coûteux. Un chauffeur privé connaît les accès et vous dépose ou vous récupère au plus près des quais.",
        ],
      },
      {
        title: "Pour qui ?",
        body: [
          "Ce service convient aux voyageurs chargés de bagages, aux familles avec enfants, aux personnes qui prennent un premier train très tôt, ou à celles qui rentrent tard et préfèrent éviter les transports de nuit. Il est aussi pratique pour les professionnels qui enchaînent un rendez-vous et un train.",
        ],
      },
      {
        title: "Comment ça se passe",
        body: [
          "Vous indiquez votre adresse (domicile, hôtel, bureau) et l'heure de votre train. Le chauffeur prévoit une marge confortable pour la circulation et pour accéder au quai. À l'arrivée, indiquez le numéro de votre train : la prise en charge s'adapte si le train a du retard.",
          "Le prix est calculé en ligne d'après l'itinéraire réel et affiché avant la confirmation. Vous payez un acompte pour valider, puis le solde à bord.",
        ],
      },
      {
        title: "Vers Lille-Europe, Lesquin ou une autre ville",
        body: [
          "Depuis la gare de Lille-Flandres, vous pouvez enchaîner vers la gare de Lille-Europe pour un Eurostar, vers l'aéroport de Lille-Lesquin, ou vers une destination plus lointaine comme Paris ou Bruxelles. Consultez les pages dédiées pour chaque trajet.",
        ],
      },
    ],
    facts: [
      { label: "Quartier", value: "centre de Lille, à deux pas de la gare Lille-Europe" },
      { label: "Prise en charge", value: "domicile, hôtel, bureau ou parvis de la gare" },
      { label: "Train en retard", value: "prise en charge adaptée si vous indiquez le numéro de train" },
      { label: "Prix", value: "annoncé avant de confirmer" },
      { label: "Paiement", value: "acompte en ligne, solde à bord" },
    ],
    moreFaq: [
      {
        q: "Combien de temps avant mon train dois-je partir ?",
        a: "Prévoyez d'arriver sur le quai avec une marge confortable, en particulier avec des bagages. Indiquez l'heure de votre train : le chauffeur planifie le départ en tenant compte de la circulation du moment.",
      },
      {
        q: "Mon train a du retard, que se passe-t-il ?",
        a: "Communiquez le numéro de votre train à la réservation. Le chauffeur adapte l'heure de prise en charge à l'arrivée réelle.",
      },
      {
        q: "Où êtes-vous récupéré à l'arrivée ?",
        a: "Le rendez-vous vous est confirmé avant votre arrivée, pour que vous retrouviez facilement le chauffeur malgré l'affluence de la gare.",
      },
      {
        q: "Un enfant peut-il voyager avec un siège adapté ?",
        a: "Oui, un siège enfant ou un rehausseur peut être prévu : cochez l'option dans le formulaire de réservation.",
      },
    ],
  },

  "gare-lille-europe": {
    metaTitle: "VTC gare de Lille-Europe : Eurostar et TGV",
    metaDescription:
      "Chauffeur privé pour la gare de Lille-Europe : trajet vers l'Eurostar, le TGV et l'aéroport, prise en charge à l'heure, prix annoncé avant de réserver.",
    summary:
      "Eurostar vers Londres, TGV vers Paris ou Roissy : un chauffeur vous dépose à la gare de Lille-Europe avec une marge adaptée aux contrôles, ou vous attend à votre arrivée. Prix affiché à l'avance, prise en charge à l'adresse de votre choix.",
    tags: ["Eurostar et TGV", "Marge pour les contrôles", "Prix annoncé"],
    sections: [
      {
        title: "Un transfert fiable vers la gare de Lille-Europe",
        body: [
          "La gare de Lille-Europe, au pied d'Euralille, est la porte d'entrée vers Londres, Bruxelles, Paris et l'aéroport de Roissy-Charles-de-Gaulle. Pour un train international, mieux vaut ne pas jouer avec l'heure : un chauffeur privé vous dépose à l'heure convenue, valises comprises.",
        ],
      },
      {
        title: "Eurostar : anticipez les contrôles",
        body: [
          "Pour un Eurostar, des formalités de sécurité et de frontière sont nécessaires avant l'embarquement. La compagnie indique sur votre billet l'heure à laquelle vous devez vous présenter : donnez-la à votre chauffeur, qui calcule le départ pour que vous arriviez avec la marge requise.",
        ],
      },
      {
        title: "TGV et correspondances",
        body: [
          "Pour un TGV, la prise en charge s'organise de la même manière. À l'arrivée, indiquez le numéro de votre train : le chauffeur suit l'heure réelle et vous retrouve à la sortie, quel que soit le retard. Vous rentrez directement chez vous, à Lille ou dans la métropole.",
        ],
      },
      {
        title: "Depuis toute la métropole",
        body: [
          "La prise en charge se fait à votre domicile, à votre hôtel ou à votre bureau, à Lille comme à Villeneuve-d'Ascq, Marcq-en-Barœul, Roubaix ou Tourcoing. Le tarif tient compte de l'itinéraire réel et s'affiche avant la confirmation.",
        ],
      },
    ],
    facts: [
      { label: "Quartier", value: "Euralille, au cœur de Lille" },
      { label: "Trains concernés", value: "Eurostar, TGV et trains internationaux" },
      { label: "Marge", value: "calée sur l'heure de présentation indiquée sur votre billet" },
      { label: "Prix", value: "annoncé avant de confirmer" },
      { label: "Paiement", value: "acompte en ligne, solde à bord" },
    ],
    moreFaq: [
      {
        q: "À quelle heure dois-je partir pour un Eurostar ?",
        a: "Reportez-vous à l'heure de présentation indiquée sur votre billet et communiquez-la au chauffeur : il calcule l'heure de départ en conséquence.",
      },
      {
        q: "Pouvez-vous me conduire de Lille-Europe à Lille-Flandres ?",
        a: "Oui. Les deux gares sont proches, et le trajet se réserve comme n'importe quelle course.",
      },
      {
        q: "Et si mon train arrive avec du retard ?",
        a: "Indiquez le numéro de train dans le formulaire : le chauffeur adapte la prise en charge à l'arrivée réelle.",
      },
      {
        q: "Puis-je réserver pour un groupe ?",
        a: "Oui, précisez le nombre de passagers et de bagages dans le formulaire. Pour un groupe important, contactez-nous.",
      },
    ],
  },

  "lille-paris": {
    metaTitle: "VTC Lille Paris : chauffeur privé longue distance",
    metaDescription:
      "Trajet Lille-Paris en chauffeur privé : porte-à-porte confortable, prix fixé avant le départ, horaires à la carte, réservation en ligne et acompte sécurisé.",
    summary:
      "Un trajet Lille-Paris en voiture avec chauffeur, de porte à porte : vous partez à l'heure qui vous arrange, vous travaillez ou vous vous reposez, et le prix est connu avant le départ. Aller simple ou aller-retour dans la journée.",
    tags: ["Porte-à-porte", "Prix fixé d'avance", "Aller-retour possible"],
    sections: [
      {
        title: "Lille-Paris en chauffeur privé : le porte-à-porte",
        body: [
          "Entre Lille et Paris, il y a environ 225 kilomètres, soit à peu près 2 h 30 de route selon la circulation. En voiture avec chauffeur, vous évitez le stress de la conduite et des périphériques : vous êtes pris en charge à l'adresse de votre choix et déposé à l'adresse exacte à Paris ou en Île-de-France.",
        ],
      },
      {
        title: "Pourquoi choisir un VTC plutôt que le train ?",
        body: [
          "Le train est rapide de gare à gare, mais il suppose de rejoindre la gare, puis de traverser Paris. Le VTC convient mieux si votre adresse est éloignée d'une gare, si vous voyagez à plusieurs (le prix se partage), avec beaucoup de bagages, ou en dehors des horaires des trains. C'est aussi un moyen de travailler au calme ou de rattraper du sommeil.",
        ],
      },
      {
        title: "Horaires et organisation",
        body: [
          "Vous choisissez l'heure de départ. Pour un rendez-vous à Paris, indiquez l'heure à laquelle vous devez être arrivé : le chauffeur prévoit une marge pour les ralentissements habituels, notamment aux abords de Paris le matin et en fin de journée. Pour un aller-retour dans la journée, précisez l'heure du retour.",
        ],
      },
      {
        title: "Un prix fixé avant le départ",
        body: [
          "Le calculateur affiche le prix à partir de l'itinéraire réel entre vos deux adresses. Vous payez un acompte en ligne pour confirmer, puis le solde à bord. Consultez aussi la grille de tarifs indicatifs pour vous faire une idée avant de saisir vos adresses.",
        ],
      },
    ],
    facts: [
      { label: "Distance", value: "environ 225 km" },
      { label: "Durée habituelle", value: "environ 2 h 30 selon la circulation" },
      { label: "Prise en charge", value: "à votre adresse, à Lille ou dans la métropole" },
      { label: "Prix", value: "fixé avant de confirmer" },
      { label: "Paiement", value: "acompte en ligne, solde à bord" },
    ],
    moreFaq: [
      {
        q: "Peut-on faire un aller-retour dans la journée ?",
        a: "Oui. Indiquez les deux horaires : le chauffeur peut vous attendre à Paris ou revenir vous chercher, selon ce que nous convenons ensemble.",
      },
      {
        q: "Combien de passagers peuvent voyager ?",
        a: "Jusqu'à 4 passagers dans le véhicule, avec leurs bagages. Précisez le nombre dans le formulaire, et contactez-nous si vous êtes plus nombreux.",
      },
      {
        q: "Puis-je faire un arrêt en route ?",
        a: "Oui, une pause est possible. Signalez-la dans le champ de précisions ; un arrêt long peut modifier le prix, qui vous est confirmé avant la course.",
      },
      {
        q: "Où êtes-vous déposé à Paris ?",
        a: "À l'adresse que vous indiquez : domicile, hôtel, bureau, gare ou aéroport. Il n'y a pas de point de dépose imposé.",
      },
    ],
  },

  "lille-bruxelles": {
    metaTitle: "VTC Lille Bruxelles : transfert privé à prix fixé",
    metaDescription:
      "Chauffeur privé de Lille à Bruxelles, à la gare du Midi, à Zaventem ou Charleroi : trajet direct, prix annoncé avant la course, réservation en ligne.",
    summary:
      "De Lille à Bruxelles, à la gare du Midi ou aux aéroports de Zaventem et de Charleroi : un trajet direct en voiture avec chauffeur, sans correspondance, et un prix fixé avant le départ. Réservation en ligne, horaires à la carte.",
    tags: ["Bruxelles, Zaventem, Charleroi", "Trajet direct", "Prix fixé d'avance"],
    sections: [
      {
        title: "Un trajet direct entre Lille et Bruxelles",
        body: [
          "Environ 110 kilomètres séparent Lille du centre de Bruxelles, soit un peu plus d'une heure de route hors circulation dense. En chauffeur privé, vous allez de l'adresse de départ à l'adresse d'arrivée sans changer de train ni chercher de taxi à l'arrivée.",
        ],
      },
      {
        title: "Aéroports de Zaventem et de Charleroi",
        body: [
          "De nombreux voyageurs partent de Brussels Airport (Zaventem) ou de Brussels South Charleroi, souvent pour des vols à tarif réduit. Un chauffeur privé vous y conduit directement depuis Lille et suit l'heure de votre vol pour la prise en charge au retour. Indiquez l'aéroport et le terminal dans le formulaire.",
        ],
      },
      {
        title: "Pour les rendez-vous professionnels et les visites",
        body: [
          "Pour une journée à Bruxelles, un séjour touristique ou un rendez-vous dans le quartier européen, vous choisissez l'heure et l'adresse précises. Pour un aller-retour dans la journée, indiquez l'heure du retour et, si nécessaire, la durée d'attente.",
        ],
      },
      {
        title: "Frontière et formalités",
        body: [
          "Le passage de la frontière franco-belge se fait sans contrôle systématique, mais pensez à emporter votre pièce d'identité ou votre passeport en cours de validité, comme pour tout déplacement à l'étranger. Le prix annoncé comprend le trajet ; il vous est confirmé avant la course.",
        ],
      },
    ],
    facts: [
      { label: "Distance Lille - Bruxelles centre", value: "environ 110 km" },
      { label: "Durée habituelle", value: "un peu plus d'une heure hors circulation dense" },
      { label: "Destinations", value: "gare du Midi, centre, Zaventem, Charleroi" },
      { label: "Prix", value: "fixé avant de confirmer" },
      { label: "Paiement", value: "acompte en ligne, solde à bord" },
    ],
    moreFaq: [
      {
        q: "Allez-vous aussi jusqu'à l'aéroport de Zaventem ?",
        a: "Oui, ainsi qu'à l'aéroport de Charleroi. Saisissez l'aéroport comme adresse d'arrivée dans le formulaire pour obtenir le prix.",
      },
      {
        q: "Faut-il un document d'identité ?",
        a: "Oui, emportez votre carte d'identité ou votre passeport en cours de validité, comme pour tout voyage vers la Belgique.",
      },
      {
        q: "Puis-je faire un aller-retour dans la journée ?",
        a: "Oui. Indiquez l'heure de retour et la durée d'attente souhaitée à Bruxelles : le prix tient compte de l'ensemble.",
      },
      {
        q: "Le prix change-t-il selon l'heure ?",
        a: "Le prix dépend principalement de l'itinéraire. Une majoration de nuit peut s'appliquer ; elle est affichée dans le calculateur avant que vous confirmiez.",
      },
    ],
  },

  "aeroport-roissy-cdg": {
    metaTitle: "VTC Lille aéroport Roissy-CDG : transfert direct",
    metaDescription:
      "Transfert privé de Lille à l'aéroport Paris-Charles-de-Gaulle : chauffeur ponctuel, suivi de vol, prix fixé d'avance, bagages et siège enfant acceptés.",
    summary:
      "Un trajet direct de Lille à l'aéroport Paris-Charles-de-Gaulle, sans correspondance ni transport en commun : chauffeur ponctuel, suivi de votre vol, terminal précisé à la réservation et prix connu avant de partir. Idéal avec bagages ou en famille.",
    tags: ["Direct jusqu'au terminal", "Suivi de vol", "Prix fixé d'avance"],
    sections: [
      {
        title: "Lille - Roissy-CDG en direct, sans correspondance",
        body: [
          "L'aéroport Paris-Charles-de-Gaulle est à environ 200 kilomètres de Lille, soit à peu près 2 h de route sans trafic dense. Avec un chauffeur privé, vous évitez le train, le RER et les correspondances avec vos valises : vous partez de votre adresse et vous êtes déposé devant votre terminal.",
        ],
      },
      {
        title: "Anticiper votre heure de départ",
        body: [
          "Pour un vol long-courrier, prévoyez d'arriver à l'aéroport avec une marge supérieure à celle d'un vol court. Indiquez l'heure de votre vol et votre terminal : le chauffeur planifie le départ de Lille en tenant compte du trafic habituel sur l'A1 et aux abords de Roissy.",
        ],
      },
      {
        title: "Au retour : un chauffeur vous attend",
        body: [
          "Pour un retour à Lille, indiquez votre numéro de vol. Le chauffeur suit l'heure d'atterrissage et vous attend à la sortie, même si l'avion a du retard. Vous évitez la file des taxis et le trajet en train, et vous rentrez directement à votre adresse.",
        ],
      },
      {
        title: "Paris-Orly, Beauvais et gares parisiennes",
        body: [
          "D'autres trajets vers la région parisienne sont possibles : aéroports de Paris-Orly et de Paris-Beauvais, gares parisiennes, adresses en Île-de-France. Saisissez l'adresse souhaitée dans le formulaire pour connaître le prix.",
        ],
      },
    ],
    facts: [
      { label: "Distance", value: "environ 200 km" },
      { label: "Durée habituelle", value: "environ 2 h hors trafic dense" },
      { label: "Dépose", value: "devant votre terminal" },
      { label: "Prix", value: "fixé avant de confirmer" },
      { label: "Paiement", value: "acompte en ligne, solde à bord" },
    ],
    moreFaq: [
      {
        q: "Comment préciser mon terminal ?",
        a: "Indiquez votre terminal (1, 2 ou 3) dans le champ de précisions lors de la réservation. Votre numéro de vol nous permet aussi de le vérifier.",
      },
      {
        q: "Combien de bagages puis-je emporter ?",
        a: "Précisez le nombre de passagers et de valises dans le formulaire. Pour de gros volumes, mentionnez-le dans les précisions afin que nous confirmions la faisabilité.",
      },
      {
        q: "Un départ de nuit est-il possible pour un vol matinal ?",
        a: "Oui, sur réservation. Une majoration de nuit peut s'appliquer ; elle est incluse dans le prix affiché avant que vous confirmiez.",
      },
      {
        q: "Puis-je partager le trajet avec d'autres voyageurs ?",
        a: "Oui, jusqu'à 4 passagers dans le même véhicule : le prix est celui de la course, quel que soit le nombre de passagers.",
      },
    ],
  },

  mariage: {
    metaTitle: "Chauffeur de mariage à Lille",
    metaDescription:
      "Chauffeur privé pour votre mariage à Lille et dans le Nord : mariés, famille et invités conduits à l'heure, trajet cérémonie-réception organisé sur devis.",
    summary:
      "Le jour de votre mariage, un chauffeur ponctuel conduit les mariés et leurs proches entre la mairie, l'église et la salle de réception. Le programme est préparé avec vous à l'avance et le devis est établi sur mesure.",
    tags: ["Sur devis", "Mairie, église, réception", "Ponctualité"],
    sections: [
      {
        title: "Un chauffeur pour le plus beau jour",
        body: [
          "Un mariage se déroule sur un emploi du temps serré : préparatifs, mairie, cérémonie religieuse, photos, réception. Un chauffeur privé réservé à l'avance vous évite le stress du stationnement et des retards, et laisse les mariés profiter de chaque moment.",
        ],
      },
      {
        title: "Un programme préparé avec vous",
        body: [
          "Avant le jour J, nous échangeons sur les lieux, les horaires et le nombre de personnes à transporter : les mariés, les témoins, les parents. Nous calculons les temps de trajet entre la mairie, le lieu de culte, le lieu des photos et la salle de réception, et nous prévoyons les attentes nécessaires.",
        ],
      },
      {
        title: "Lille, la métropole et les environs",
        body: [
          "Nous intervenons pour des mariages à Lille et dans la métropole lilloise, ainsi que dans les communes voisines des Hauts-de-France. Les châteaux et domaines de la région sont accessibles : indiquez l'adresse exacte, y compris l'accès éventuel par des petites routes.",
        ],
      },
      {
        title: "Devis personnalisé",
        body: [
          "Le tarif dépend de la durée de mise à disposition, de la distance parcourue et des attentes. Décrivez votre projet via le formulaire de contact : vous recevez une proposition claire. Les éventuelles décorations du véhicule se discutent à la demande.",
        ],
      },
    ],
    facts: [
      { label: "Format", value: "mise à disposition sur la durée de la cérémonie" },
      { label: "Zone", value: "Lille, métropole lilloise et Hauts-de-France" },
      { label: "Réservation", value: "sur devis, à l'avance" },
      { label: "Contact", value: "formulaire en ligne" },
    ],
    moreFaq: [
      {
        q: "Combien de temps à l'avance faut-il réserver ?",
        a: "Le plus tôt possible : les week-ends de printemps et d'été se remplissent vite. Écrivez-nous dès que la date et les lieux sont fixés.",
      },
      {
        q: "Combien de personnes pouvez-vous transporter ?",
        a: "Le véhicule accueille jusqu'à 4 passagers. Si vous avez besoin de transporter plus de personnes, indiquez-le dans votre demande pour que nous envisagions la meilleure organisation.",
      },
      {
        q: "Pouvez-vous attendre pendant la cérémonie ?",
        a: "Oui, l'attente fait partie de la mise à disposition. Nous la prévoyons dans le devis, pour que le planning de la journée reste fluide.",
      },
      {
        q: "Peut-on décorer la voiture ?",
        a: "Précisez vos souhaits dans la demande de devis : nous vous répondons sur ce qui est possible.",
      },
    ],
  },

  "mise-a-disposition": {
    metaTitle: "Chauffeur à disposition à Lille, à l'heure",
    metaDescription:
      "Chauffeur privé mis à disposition à Lille, à l'heure ou à la journée : rendez-vous multiples, shopping, visites, déplacements pros. Devis sur mesure.",
    summary:
      "Un chauffeur et une voiture à votre disposition pour plusieurs heures ou une journée : rendez-vous enchaînés, shopping, visite de la région, déplacements professionnels. Vous gardez la main sur le programme, nous nous occupons de la route.",
    tags: ["À l'heure ou à la journée", "Plusieurs arrêts", "Sur devis"],
    sections: [
      {
        title: "Un chauffeur à vos côtés, selon votre emploi du temps",
        body: [
          "La mise à disposition est adaptée quand vous avez plusieurs arrêts à enchaîner : le chauffeur reste avec vous, vous attend entre deux rendez-vous et vous conduit à l'étape suivante. Vous n'avez ni stationnement à chercher, ni itinéraire à suivre.",
        ],
      },
      {
        title: "Pour quels besoins ?",
        body: [
          "Journée de rendez-vous professionnels, visites de sites, courses et shopping, accompagnement pour une journée médicale, visite de Lille et des Hauts-de-France pour des proches venus de loin, déplacements d'un hôte ou d'un invité de marque. Le format se règle à la durée prévue.",
        ],
      },
      {
        title: "Comment ça marche",
        body: [
          "Dites-nous la date, l'heure de début, la durée envisagée, les lieux à rejoindre et le nombre de personnes. Nous vous envoyons un devis clair. Le jour J, le chauffeur est à l'heure à l'adresse convenue, et le programme peut être ajusté en cours de route dans la limite de la durée prévue.",
        ],
      },
      {
        title: "Au-delà de la métropole lilloise",
        body: [
          "La mise à disposition peut aussi inclure des trajets plus longs, vers la côte d'Opale, Paris ou Bruxelles. Précisez-le dans votre demande pour que le devis intègre la distance.",
        ],
      },
    ],
    facts: [
      { label: "Format", value: "à l'heure ou à la journée" },
      { label: "Zone", value: "Lille, métropole, Hauts-de-France et au-delà" },
      { label: "Réservation", value: "sur devis" },
      { label: "Contact", value: "formulaire en ligne" },
    ],
    moreFaq: [
      {
        q: "Quelle est la durée minimum ?",
        a: "Elle se fixe selon votre besoin lors du devis. Précisez les horaires souhaités dans votre demande.",
      },
      {
        q: "Puis-je modifier le programme en cours de journée ?",
        a: "Oui, dans la limite de la durée réservée : le chauffeur s'adapte à vos changements d'adresse ou d'horaire.",
      },
      {
        q: "Le chauffeur peut-il m'attendre ?",
        a: "Oui, l'attente fait partie du service et se prévoit dans le devis.",
      },
      {
        q: "Comment est calculé le prix ?",
        a: "Selon la durée, les distances et les éventuelles attentes. Le devis vous est transmis avant toute confirmation.",
      },
    ],
  },

  "sorties-evenements": {
    metaTitle: "VTC sorties et spectacles à Lille : retour assuré",
    metaDescription:
      "Chauffeur privé pour vos sorties à Lille : concerts, théâtre, matchs, restaurants, soirées. Aller et retour réservés, prix annoncé, rentrez sans stress.",
    summary:
      "Concert à Lille Grand Palais, match au stade, soirée ou restaurant : un chauffeur vous dépose, vous récupère à la fin et vous ramène chez vous, sans chercher une place ni un taxi à la sortie. Aller et retour réservés, prix annoncé.",
    tags: ["Aller-retour", "Retour assuré", "Prix annoncé"],
    sections: [
      {
        title: "Profitez de votre soirée, on s'occupe du retour",
        body: [
          "À la sortie d'un concert ou d'un match, les taxis sont rares et les transports en commun bondés. En réservant à l'avance, vous savez que votre chauffeur sera là à l'heure convenue pour vous ramener, sans file d'attente ni attente sous la pluie.",
        ],
      },
      {
        title: "Pour quels lieux ?",
        body: [
          "Salles de concert et de spectacle de Lille et de la métropole, stades, théâtres, opéra, restaurants, soirées privées, bars et événements d'entreprise. Indiquez l'adresse du lieu et l'heure de fin prévue : le chauffeur se cale sur votre programme.",
        ],
      },
      {
        title: "Un trajet sans stress pour tous",
        body: [
          "Réserver un chauffeur, c'est aussi la solution pour sortir sans conduire : chacun peut profiter de la soirée, sans désigner un conducteur. Le prix est annoncé à l'avance, ce qui facilite le partage entre amis ou collègues.",
        ],
      },
      {
        title: "Anniversaires, enterrements de vie, soirées de gala",
        body: [
          "Pour les occasions particulières, un devis sur mesure est possible, avec des arrêts multiples et une attente prévue. Décrivez votre soirée dans le formulaire et nous vous proposons un trajet adapté.",
        ],
      },
    ],
    facts: [
      { label: "Format", value: "aller seul, retour seul ou aller-retour" },
      { label: "Zone", value: "Lille et métropole lilloise" },
      { label: "Réservation", value: "sur demande, à l'avance" },
      { label: "Prix", value: "annoncé avant de confirmer" },
    ],
    moreFaq: [
      {
        q: "Puis-je réserver uniquement le retour ?",
        a: "Oui. Indiquez le lieu de la sortie et l'heure de fin prévue ; nous prévoyons une marge au cas où l'événement se prolonge.",
      },
      {
        q: "Que se passe-t-il si le concert dure plus longtemps ?",
        a: "Prévenez-nous : le chauffeur adapte l'heure. Pour un événement à horaires variables, nous convenons ensemble d'une marge.",
      },
      {
        q: "Peut-on faire plusieurs arrêts dans la soirée ?",
        a: "Oui, par exemple restaurant puis concert puis retour. Décrivez le programme dans votre demande pour obtenir un devis adapté.",
      },
      {
        q: "Combien de personnes peuvent voyager ?",
        a: "Jusqu'à 4 passagers dans le véhicule. Pour un groupe plus important, contactez-nous pour organiser plusieurs trajets.",
      },
    ],
  },

  entreprises: {
    metaTitle: "VTC pour entreprises à Lille",
    metaDescription:
      "VTC pour entreprises à Lille : trajets collaborateurs, accueil clients, gares et aéroports, facturation regroupée, interlocuteur unique.",
    summary:
      "Pour vos collaborateurs, vos clients et vos invités : trajets professionnels réservés à l'avance, accueil gare ou aéroport, facturation regroupée sur demande et un seul interlocuteur, sans centre d'appel. Tarif à convenir pour les trajets réguliers.",
    tags: ["Interlocuteur unique", "Facturation regroupée", "Trajets réguliers"],
    sections: [
      {
        title: "Un partenaire de confiance pour vos déplacements",
        body: [
          "Les déplacements professionnels demandent de la fiabilité : un chauffeur ponctuel, une facture claire, un contact direct en cas de changement. Nous travaillons avec des entreprises, des associations et des structures sociales de la métropole lilloise.",
        ],
      },
      {
        title: "Accueil de clients, d'intervenants et d'invités",
        body: [
          "Un intervenant arrive en gare de Lille-Europe, un client en vol à Lesquin, un directeur doit rejoindre Paris : un chauffeur les attend à l'heure, avec un panneau si vous le souhaitez, et les conduit à votre adresse. Vous donnez une bonne image de votre organisation dès l'accueil.",
        ],
      },
      {
        title: "Organisation et facturation",
        body: [
          "Les réservations peuvent être faites par vos collaborateurs ou par votre secrétariat. La facturation peut être regroupée selon un accord préalable, avec les justificatifs que votre comptabilité attend. Pour des trajets réguliers, nous convenons ensemble d'un tarif adapté.",
        ],
      },
      {
        title: "Institutions et structures d'accompagnement",
        body: [
          "Nous intervenons aussi pour les structures médico-sociales et les institutions : transport de personnes accompagnées, rendez-vous réguliers, trajets programmés. Contactez-nous pour définir les modalités adaptées : horaires, lieux, facturation.",
        ],
      },
    ],
    facts: [
      { label: "Interlocuteur", value: "direct, sans centre d'appel" },
      { label: "Facturation", value: "regroupée sur demande" },
      { label: "Trajets", value: "ponctuels ou réguliers" },
      { label: "Zone", value: "métropole lilloise, Hauts-de-France, Paris, Bruxelles" },
      { label: "Contact", value: "formulaire en ligne" },
    ],
    moreFaq: [
      {
        q: "Pouvez-vous fournir des justificatifs pour la comptabilité ?",
        a: "Oui, une facture est émise pour chaque course ou regroupée selon l'accord convenu avec votre entreprise.",
      },
      {
        q: "Pouvez-vous accueillir un invité avec un panneau ?",
        a: "Oui, sur demande, pour un accueil en gare ou à l'aéroport. Indiquez le nom à inscrire dans votre message.",
      },
      {
        q: "Les trajets réguliers bénéficient-ils d'un tarif ?",
        a: "Pour des trajets répétés, nous convenons d'un tarif ensemble. Décrivez la fréquence et les itinéraires dans votre demande.",
      },
      {
        q: "Peut-on avoir un véhicule plus grand ?",
        a: "Pour plus de 4 passagers, contactez-nous : nous étudions la meilleure organisation pour votre groupe.",
      },
    ],
  },
};
