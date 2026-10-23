// Articles du guide. Pour en ajouter un : copier un bloc de POSTS, changer slug/titre/date/contenu.
// Mise en forme : "h" = intertitre, "p" = paragraphe, "ul" = liste. Lien interne : [texte](/chemin).
// Règle : aucune statistique ni horaire inventés ; ce qui change (horaires, tarifs des transports) renvoie à la source officielle.
export type Block = { t: "h" | "p"; v: string } | { t: "ul"; v: string[] };
export type Post = {
  slug: string;
  title: string;
  /** Titre court pour Google (« | Nord VTC » est ajouté), 50 caractères au plus. */
  seoTitle?: string;
  description: string; // 155 caractères au plus (affichée telle quelle par Google)
  date: string; // AAAA-MM-JJ
  updated?: string; // AAAA-MM-JJ, dernière mise à jour du contenu
  tag: string;
  minutes: number;
  body: Block[];
};

export const POSTS: Post[] = [
  {
    slug: "aller-aeroport-lille-lesquin",
    title: "Comment aller à l'aéroport de Lille-Lesquin : les options comparées",
    seoTitle: "Aller à l'aéroport de Lille-Lesquin",
    description:
      "Voiture, navette, taxi ou VTC : comment rejoindre l'aéroport de Lille-Lesquin depuis Lille et la métropole, quand partir et comment éviter le stress.",
    date: "2026-10-20",
    updated: "2026-10-23",
    tag: "Aéroport",
    minutes: 6,
    body: [
      { t: "p", v: "L'aéroport de Lille-Lesquin se trouve à une dizaine de kilomètres au sud-est du centre de Lille, sur les communes de Lesquin et Fretin, juste à côté de l'autoroute A1. Sans circulation, il faut environ un quart d'heure depuis le centre-ville. Aux heures de pointe, ce temps peut facilement doubler : c'est la principale chose à garder en tête pour ne pas rater son vol." },
      { t: "p", v: "Voici les différentes façons d'y aller, avec leurs avantages et leurs limites, et quelques conseils de chauffeur qui fait ce trajet tous les jours." },
      { t: "h", v: "En voiture personnelle" },
      { t: "p", v: "C'est la solution la plus autonome : vous partez quand vous voulez et vous rentrez dans votre propre voiture. Le revers, c'est le stationnement. Les parkings de l'aéroport sont payants et le tarif grimpe vite pour un séjour d'une semaine ou plus. En période de vacances scolaires, les places les plus proches de l'aérogare se remplissent aussi plus vite." },
      { t: "ul", v: [
        "Réservez votre place de parking à l'avance sur le site de l'aéroport quand c'est possible : c'est souvent moins cher qu'au guichet.",
        "Comptez le temps de navette entre certains parkings éloignés et le terminal.",
        "Au retour, la voiture est parfois à dégivrer ou à recharger : prévoyez-le si vous rentrez tard.",
      ] },
      { t: "h", v: "En navette ou en transports en commun" },
      { t: "p", v: "Une navette relie habituellement le centre de Lille, côté Euralille et gares, à l'aéroport. C'est une option économique quand on voyage léger et que l'horaire du vol tombe bien. Elle demande en revanche de rejoindre d'abord le point de départ, avec ses bagages, puis de suivre un horaire fixe." },
      { t: "p", v: "Les horaires et les tarifs changent selon la saison : vérifiez-les toujours sur le site officiel de l'aéroport de Lille et sur celui d'Ilévia, le réseau de transport de la métropole, avant de partir. Pour un vol très tôt le matin ou un retour tard le soir, l'offre est souvent plus limitée." },
      { t: "h", v: "En taxi" },
      { t: "p", v: "Le taxi peut être réservé par téléphone ou pris à la station de l'aéroport à l'arrivée. Le prix est calculé au compteur selon le tarif réglementé : il dépend donc du temps passé dans la circulation. Pour un départ très matinal, pensez à réserver la veille, car les taxis disponibles à 4 h du matin sont plus rares." },
      { t: "h", v: "En VTC réservé à l'avance" },
      { t: "p", v: "Le VTC se réserve obligatoirement à l'avance. C'est justement ce qui en fait une bonne solution pour un vol : l'heure de prise en charge est fixée, le chauffeur est prévu, et le prix est connu avant de partir. Chez Nord VTC, le montant affiché à la réservation ne change plus, même en cas de bouchon sur l'A1." },
      { t: "ul", v: [
        "Prise en charge devant chez vous, à l'hôtel ou au bureau, dépose devant l'aérogare.",
        "Bagages, poussette ou siège enfant : indiquez-les à la réservation, tout est prévu.",
        "Au retour, le chauffeur suit votre numéro de vol et adapte l'heure de prise en charge si l'avion a du retard.",
      ] },
      { t: "h", v: "À quelle heure partir de chez soi ?" },
      { t: "p", v: "Pour un vol en Europe, les compagnies conseillent en général d'être à l'aéroport environ deux heures avant le décollage, parfois davantage pour un vol hors de l'espace Schengen ou en période de forte affluence. Vérifiez toujours la recommandation de votre compagnie sur votre billet ou votre carte d'embarquement." },
      { t: "p", v: "Ajoutez ensuite le temps de trajet réel. Depuis le centre de Lille, un quart d'heure suffit en dehors des pointes. Entre 7 h et 9 h 30, et en fin d'après-midi, l'A1 et le périphérique ralentissent souvent : prévoyez une marge de vingt à trente minutes de plus. Depuis Roubaix, Tourcoing ou Armentières, le trajet est plus long et passe par les mêmes axes chargés." },
      { t: "h", v: "Depuis les villes de la métropole" },
      { t: "p", v: "Le trajet n'est pas le même selon votre point de départ. Depuis Villeneuve-d'Ascq ou Seclin, l'aéroport est tout proche. Depuis Roubaix, Tourcoing, Wasquehal ou Marcq-en-Barœul, il faut traverser une partie de la métropole. Les pages de nos villes donnent un prix de départ et une durée indicative : [Roubaix](/vtc/roubaix), [Tourcoing](/vtc/tourcoing), [Villeneuve-d'Ascq](/vtc/villeneuve-d-ascq), [Marcq-en-Barœul](/vtc/marcq-en-baroeul) ou [toutes les villes](/vtc)." },
      { t: "h", v: "Au retour de voyage" },
      { t: "p", v: "À l'arrivée, le plus pénible est souvent d'attendre un moyen de transport après un vol tardif. Avec un chauffeur réservé, vous n'avez rien à chercher : il connaît votre numéro de vol, suit l'heure réelle d'atterrissage et vous attend à la sortie. Le temps d'attente lié à un retard d'avion n'est pas facturé." },
      { t: "h", v: "Nos conseils pour un départ serein" },
      { t: "ul", v: [
        "Préparez papiers d'identité et carte d'embarquement la veille.",
        "Pesez vos valises à la maison pour éviter les mauvaises surprises au comptoir.",
        "Pour un vol avant 7 h, réservez votre transport au plus tard la veille.",
        "Gardez un peu de marge : mieux vaut un café à l'aéroport qu'une course contre la montre.",
      ] },
      { t: "p", v: "Vous voulez connaître le prix exact depuis votre adresse ? Consultez la page [transfert aéroport Lille-Lesquin](/services/aeroport-lille-lesquin) ou [calculez votre prix](/reservation?from=Lille&to=A%C3%A9roport%20de%20Lille-Lesquin) : il s'affiche avant de réserver." },
    ],
  },
  {
    slug: "gare-lille-flandres-ou-lille-europe",
    title: "Lille Flandres ou Lille Europe : quelle gare pour votre train ?",
    seoTitle: "Lille Flandres ou Lille Europe : quelle gare ?",
    description:
      "Les deux gares de Lille sont proches mais ne desservent pas les mêmes trains. Comment trouver la bonne, combien de temps prévoir et comment y arriver.",
    date: "2026-10-18",
    updated: "2026-10-23",
    tag: "Gares",
    minutes: 5,
    body: [
      { t: "p", v: "Lille a deux grandes gares, Lille Flandres et Lille Europe, séparées par quelques centaines de mètres seulement. Il faut compter cinq à dix minutes à pied pour passer de l'une à l'autre. Elles ne desservent pourtant pas les mêmes trains, et se tromper de gare est une erreur classique, surtout pour les visiteurs ou quand on part tôt le matin." },
      { t: "h", v: "Lille Flandres, la gare du centre" },
      { t: "p", v: "C'est la gare historique, sur la place de la Gare, au bout de la rue Faidherbe qui mène à la Grand-Place. Elle accueille la plupart des TER des Hauts-de-France et une grande partie des TGV vers Paris-Nord. Si vous allez à Paris en TGV, il y a de bonnes chances que votre train parte d'ici, mais ce n'est pas systématique : vérifiez toujours votre billet." },
      { t: "h", v: "Lille Europe, la gare des grandes lignes" },
      { t: "p", v: "Construite pour le TGV et le tunnel sous la Manche, Lille Europe se trouve à côté du centre commercial Euralille. On y prend notamment l'Eurostar vers Londres et Bruxelles, les TGV qui traversent la France sans passer par Paris (vers Lyon, Marseille, Bordeaux, Nantes ou Strasbourg, par exemple) et des TGV vers la gare de l'aéroport Paris-Charles-de-Gaulle. Certains trains vers Paris partent aussi de Lille Europe." },
      { t: "h", v: "Comment savoir laquelle est la vôtre" },
      { t: "ul", v: [
        "Le nom exact de la gare figure sur votre billet et dans l'application de la compagnie : « Lille Flandres » ou « Lille Europe ».",
        "Pour un train international vers Londres, c'est Lille Europe, avec des contrôles de sécurité et de passeport avant l'embarquement.",
        "Pour un TER vers Arras, Douai, Valenciennes ou la côte, c'est le plus souvent Lille Flandres.",
        "En cas de doute le jour même, les panneaux d'affichage des deux gares indiquent aussi les départs de l'autre gare.",
      ] },
      { t: "h", v: "Combien de temps prévoir" },
      { t: "p", v: "Pour un TER ou un TGV, arriver un quart d'heure avant le départ suffit en général, le temps de trouver le quai. Pour l'Eurostar vers Londres, les contrôles se font avant de monter dans le train et ferment avant le départ : présentez-vous nettement plus tôt, à l'heure conseillée sur votre billet." },
      { t: "p", v: "Si vous vous êtes trompé de gare, tout n'est pas perdu : à pied, il faut environ dix minutes en suivant la direction d'Euralille, un peu plus avec des valises. Mieux vaut donc garder une marge de quinze à vingt minutes quand vous n'êtes pas sûr." },
      { t: "h", v: "Rejoindre les gares" },
      { t: "p", v: "Le métro et le tramway desservent les deux gares. C'est pratique en journée et avec peu de bagages. Avec de grosses valises, des enfants ou un train très tôt le matin, une voiture avec chauffeur évite les escaliers, les correspondances et l'attente sur le quai du métro." },
      { t: "p", v: "Aux abords des gares, la circulation est dense et l'arrêt minute est souvent encombré. Un chauffeur habitué connaît les meilleurs points de dépose, au plus près des entrées, et vous indique où le retrouver à votre arrivée." },
      { t: "h", v: "À l'arrivée à Lille" },
      { t: "p", v: "Si vous arrivez en train, donnez votre numéro de train à la réservation : le chauffeur suit l'heure d'arrivée réelle et vous attend, même en cas de retard. Il vous retrouve à un point précis de la gare, convenu à l'avance, pour éviter de se chercher dans la foule." },
      { t: "h", v: "En résumé" },
      { t: "ul", v: [
        "Lille Flandres : TER et une grande partie des TGV vers Paris.",
        "Lille Europe : Eurostar, TGV vers les autres régions et vers l'aéroport Charles-de-Gaulle.",
        "Toujours vérifier le nom de la gare sur le billet.",
        "Prévoir une marge plus large pour l'Eurostar et en cas de doute.",
      ] },
      { t: "p", v: "Nous vous déposons devant la bonne gare, au plus près de l'entrée. Voir les pages [gare Lille Flandres](/services/gare-lille-flandres) et [gare Lille Europe](/services/gare-lille-europe), avec le prix affiché avant de réserver." },
    ],
  },
  {
    slug: "vtc-ou-taxi-quelle-difference",
    title: "VTC ou taxi : quelles différences, que choisir à Lille ?",
    seoTitle: "VTC ou taxi à Lille : quelles différences ?",
    description:
      "Réservation, prix, prise en charge, règles : ce qui distingue un VTC d'un taxi, et dans quels cas préférer l'un ou l'autre pour vos trajets à Lille.",
    date: "2026-10-16",
    updated: "2026-10-23",
    tag: "Conseils",
    minutes: 5,
    body: [
      { t: "p", v: "Taxi et VTC ont l'air de faire le même métier : un chauffeur professionnel vous conduit d'un point à un autre. Pourtant, ils ne répondent pas aux mêmes règles, ne se réservent pas de la même façon et ne fixent pas leur prix de la même manière. Savoir ce qui les distingue aide à choisir le bon service selon la situation." },
      { t: "h", v: "Le taxi : disponible tout de suite, au compteur" },
      { t: "p", v: "Le taxi détient une autorisation de stationnement délivrée par une commune. Il peut être hélé dans la rue, pris à une station ou réservé par téléphone. Son prix est calculé par un compteur, le taximètre, selon un tarif réglementé fixé par la préfecture : il dépend de la distance, mais aussi du temps passé à l'arrêt ou dans les embouteillages." },
      { t: "ul", v: [
        "Point fort : on peut le prendre sans réservation, à une station ou dans la rue.",
        "Point d'attention : le montant final n'est connu qu'à l'arrivée.",
        "Signe distinctif : le lumineux « TAXI » sur le toit et le compteur à bord.",
      ] },
      { t: "h", v: "Le VTC : réservé à l'avance, prix connu" },
      { t: "p", v: "VTC signifie voiture de transport avec chauffeur. La loi impose qu'une course de VTC soit réservée à l'avance : un VTC ne peut pas prendre un client qui le hèle dans la rue, ni attendre des clients sur la voie publique. En échange, le prix est convenu avant la course, soit sous forme de prix total, soit avec un mode de calcul communiqué au client." },
      { t: "ul", v: [
        "Le chauffeur est titulaire d'une carte professionnelle VTC, après un examen et une formation.",
        "Le véhicule est inscrit au registre des VTC et porte une vignette spécifique.",
        "Le prix est fixé à la réservation : pas de compteur qui tourne dans les bouchons.",
      ] },
      { t: "h", v: "VTC indépendant ou application ?" },
      { t: "p", v: "Beaucoup de VTC travaillent via des applications. Le chauffeur y est attribué au hasard, et le prix peut varier selon la demande, l'heure ou la météo. Un chauffeur indépendant qui travaille en direct fonctionne autrement : vous savez qui vous conduit et dans quelle voiture, et le prix ne dépend pas de l'affluence du moment." },
      { t: "h", v: "Que choisir selon votre trajet" },
      { t: "ul", v: [
        "Vous sortez d'un restaurant et voulez rentrer tout de suite : le taxi à la station la plus proche est souvent le plus simple.",
        "Vous avez un avion ou un train à heure fixe : le VTC réservé la veille vous garantit une voiture à l'heure et un prix connu.",
        "Vous voyagez avec des enfants : réservez un véhicule avec siège enfant, ce que permet la réservation à l'avance.",
        "Vous faites un long trajet (Paris, Bruxelles, la côte) : un prix fixé d'avance évite les mauvaises surprises.",
        "Vous organisez un événement ou un mariage : seul un service réservé à l'avance permet de préparer le programme.",
      ] },
      { t: "h", v: "Et pour les trajets pris en charge par l'Assurance maladie ?" },
      { t: "p", v: "Certains transports médicaux peuvent être remboursés lorsqu'ils sont effectués par un taxi conventionné, sur prescription médicale. Ce n'est pas le cas d'une course de VTC classique. Si votre trajet doit être remboursé, renseignez-vous auprès de votre caisse avant de réserver." },
      { t: "h", v: "Le cas de Nord VTC" },
      { t: "p", v: "Le chauffeur de Nord VTC est titulaire à la fois de la carte VTC et de la carte de chauffeur de taxi, mais il travaille ici en VTC : chaque course est réservée à l'avance, le prix s'affiche avant de confirmer et il ne change plus ensuite. Vous payez un acompte en ligne et le reste à bord, avec une facture." },
      { t: "p", v: "Pour comparer, essayez le calculateur : le prix de votre trajet s'affiche en quelques secondes, sans créer de compte. Voir aussi la [grille des tarifs](/tarifs)." },
    ],
  },
  {
    slug: "braderie-de-lille-se-deplacer",
    title: "Braderie de Lille : comment s'y rendre et rentrer sans stress",
    seoTitle: "Braderie de Lille : venir et rentrer sans stress",
    description:
      "La Braderie de Lille, c'est des rues fermées et une foule immense. Où se faire déposer, comment rentrer le soir et nos conseils pour en profiter.",
    date: "2026-10-14",
    updated: "2026-10-23",
    tag: "Événements",
    minutes: 5,
    body: [
      { t: "p", v: "Chaque année, le premier week-end de septembre, la Braderie de Lille transforme le centre-ville en immense marché aux puces à ciel ouvert. Brocanteurs professionnels, particuliers qui vident leur grenier, restaurants qui servent des moules-frites à la chaîne : c'est l'un des plus grands événements de ce type en Europe, et il attire des visiteurs de toute la France, de Belgique et d'ailleurs." },
      { t: "p", v: "C'est une fête formidable, mais aussi un vrai défi pour circuler. Voici comment s'organiser pour l'aller, sur place et surtout pour le retour." },
      { t: "h", v: "Ce qui change dans la ville ce week-end-là" },
      { t: "ul", v: [
        "Une grande partie du centre est fermée à la circulation, souvent dès la veille au soir pour l'installation des exposants.",
        "Le stationnement autour du centre est très difficile, et certains parkings sont saturés tôt le matin.",
        "Les transports en commun sont pris d'assaut ; un service renforcé est généralement mis en place, à vérifier sur le site d'Ilévia.",
        "Les périmètres fermés et les horaires changent selon les années : consultez le plan officiel publié par la ville de Lille.",
      ] },
      { t: "h", v: "Se faire déposer au bon endroit" },
      { t: "p", v: "Aucun véhicule ne peut entrer dans la zone fermée, chauffeur compris. Le bon réflexe est de se faire déposer en bordure du périmètre, à un endroit facile à rejoindre à pied. Un chauffeur qui connaît la ville choisit un point de dépose dégagé, en évitant les axes les plus encombrés." },
      { t: "p", v: "Convenez dès l'aller du point de rendez-vous du retour. Choisissez un lieu simple à trouver, même de nuit et même avec un téléphone presque déchargé : une station de métro, un carrefour connu, l'entrée d'un hôtel." },
      { t: "h", v: "Le retour, le moment le plus compliqué" },
      { t: "p", v: "En fin de soirée, tout le monde veut repartir en même temps. Les stations de taxi sont prises d'assaut et, sur les applications, les prix montent avec la demande quand il reste des voitures disponibles. Réserver son retour à l'avance, à heure fixe et à prix connu, évite cette loterie." },
      { t: "ul", v: [
        "Réservez l'aller et le retour en même temps, si possible plusieurs jours avant.",
        "Gardez un peu de marge sur l'heure du retour : la foule ralentit la marche.",
        "Si vous changez d'avis sur l'heure, prévenez le chauffeur le plus tôt possible.",
      ] },
      { t: "h", v: "Profiter de la Braderie" },
      { t: "ul", v: [
        "Venez tôt le matin pour les meilleures affaires, et l'après-midi pour l'ambiance.",
        "Prévoyez de l'argent liquide : beaucoup de petits exposants n'acceptent pas la carte.",
        "Portez de bonnes chaussures : on marche des kilomètres sans s'en rendre compte.",
        "Gardez vos affaires près de vous, comme dans toute grande foule.",
        "Ne repartez pas sans avoir goûté les moules-frites : les tas de coquilles devant les restaurants font partie de la tradition.",
      ] },
      { t: "h", v: "Venir en groupe" },
      { t: "p", v: "Entre amis ou en famille, partager une voiture avec chauffeur revient souvent moins cher par personne qu'on ne le pense, et personne n'a à conduire au retour. Indiquez le nombre de passagers et de sacs à la réservation pour que tout le monde tienne dans le véhicule." },
      { t: "p", v: "Pour une sortie avec aller et retour réservés, découvrez notre offre [sorties et événements](/services/sorties-evenements), ou [calculez votre prix](/reservation) dès maintenant." },
    ],
  },
  {
    slug: "que-faire-a-lille-un-week-end",
    title: "Un week-end à Lille : 6 idées de visites à ne pas manquer",
    seoTitle: "Un week-end à Lille : 6 visites à ne pas manquer",
    description:
      "Grand-Place, Vieux-Lille, Palais des Beaux-Arts, marché de Wazemmes : un programme simple pour découvrir Lille en deux jours, et comment vous déplacer.",
    date: "2026-10-12",
    updated: "2026-10-23",
    tag: "Visiter Lille",
    minutes: 6,
    body: [
      { t: "p", v: "Lille se découvre très bien en un week-end. Le centre est compact, beaucoup de lieux se rejoignent à pied, et la ville mélange une architecture flamande colorée, de grands musées et une vie de quartier très animée. Voici six étapes pour composer votre programme, et quelques conseils pour vous déplacer." },
      { t: "h", v: "1. La Grand-Place et la Vieille Bourse" },
      { t: "p", v: "Le cœur de la ville, officiellement place du Général-de-Gaulle, est entouré de façades flamandes et dominé par la colonne de la Déesse. Juste à côté, la Vieille Bourse cache une cour intérieure où des bouquinistes vendent livres anciens, cartes postales et gravures. On y croise aussi des joueurs d'échecs en fin de journée. Tout près, la place du Théâtre réunit l'Opéra et la Chambre de commerce, avec son beffroi." },
      { t: "h", v: "2. Le Vieux-Lille" },
      { t: "p", v: "Au nord de la Grand-Place, le Vieux-Lille aligne rues pavées, maisons de briques et boutiques. La rue de la Monnaie mène à l'Hospice Comtesse, ancien hôpital devenu musée, et à la cathédrale Notre-Dame-de-la-Treille, dont la façade moderne surprend. C'est aussi le quartier des estaminets et des pâtisseries : la maison Meert, rue Esquermoise, est célèbre pour ses gaufres fourrées à la vanille." },
      { t: "h", v: "3. Le Palais des Beaux-Arts" },
      { t: "p", v: "Place de la République, le Palais des Beaux-Arts est l'un des plus grands musées de France. On y voit des peintures flamandes et françaises, des sculptures, et une étonnante collection de plans-reliefs, maquettes de villes fortifiées réalisées pour les rois de France. Comptez au moins deux heures pour en faire le tour sans courir." },
      { t: "h", v: "4. Le marché de Wazemmes" },
      { t: "p", v: "Le marché de Wazemmes se tient plusieurs matinées par semaine, mais c'est le dimanche qu'il est le plus grand et le plus animé : fruits et légumes, épices, fromages, fleurs, brocante, avec une ambiance populaire très lilloise. Les halles couvertes permettent de goûter les produits du Nord. Arrivez avant midi, les étals commencent à fermer en début d'après-midi." },
      { t: "h", v: "5. La Citadelle et le bois de Boulogne" },
      { t: "p", v: "Pour une pause au vert, la Citadelle construite par Vauban est entourée d'un grand parc, le bois de Boulogne, idéal pour une balade ou un jogging le long des canaux. Le petit zoo de Lille, à côté, plaît beaucoup aux enfants. Comptez une petite demi-heure à pied depuis la Grand-Place." },
      { t: "h", v: "6. Une escapade dans la métropole" },
      { t: "p", v: "Si vous avez une demi-journée de plus, sortez du centre. À Roubaix, La Piscine, musée d'art installé dans une ancienne piscine Art déco, vaut à elle seule le déplacement. À Villeneuve-d'Ascq, le LaM présente art moderne, art contemporain et art brut dans un parc de sculptures. À Croix, la Villa Cavrois est une maison moderniste spectaculaire des années 1930." },
      { t: "h", v: "Où manger" },
      { t: "p", v: "La cuisine du Nord est généreuse : carbonade flamande, potjevleesch, welsh au cheddar et à la bière, maroilles sous toutes ses formes. Les estaminets du Vieux-Lille et des abords de la Grand-Place en servent dans un décor chaleureux. Pensez à réserver le samedi soir, les bonnes adresses sont vite complètes." },
      { t: "h", v: "Se déplacer pendant le week-end" },
      { t: "ul", v: [
        "À pied : la plupart des visites du centre se font à pied, entre la Grand-Place, le Vieux-Lille et le Palais des Beaux-Arts.",
        "En métro et en tramway : pratiques pour Wazemmes, les gares, Roubaix ou Villeneuve-d'Ascq.",
        "En voiture avec chauffeur : pour arriver avec des bagages, rejoindre un hôtel excentré, aller à La Piscine ou à la Villa Cavrois sans correspondances, ou rentrer tard après le dîner.",
      ] },
      { t: "h", v: "Un exemple de programme" },
      { t: "ul", v: [
        "Samedi matin : Grand-Place, Vieille Bourse et Vieux-Lille.",
        "Samedi après-midi : Palais des Beaux-Arts, puis dîner dans un estaminet.",
        "Dimanche matin : marché de Wazemmes.",
        "Dimanche après-midi : balade à la Citadelle, ou La Piscine à Roubaix.",
      ] },
      { t: "p", v: "Vous arrivez en train ou en avion ? Voyez nos trajets depuis la [gare Lille Flandres](/services/gare-lille-flandres), la [gare Lille Europe](/services/gare-lille-europe) ou l'[aéroport](/services/aeroport-lille-lesquin), avec le prix affiché avant de réserver. Pour plusieurs étapes dans la journée, pensez à la [mise à disposition](/services/mise-a-disposition)." },
    ],
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
export const fmtDate = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
