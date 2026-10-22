// Questions fréquentes : affichées en bas de l'accueil et sur la page /faq (avec données structurées pour Google).
// Les réponses reprennent les règles réelles du site et des CGV : les mettre à jour ensemble.

export type QA = { q: string; a: string };
export type FaqGroup = { id: string; title: string; items: QA[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "reservation",
    title: "Réserver",
    items: [
      { q: "Comment réserver un chauffeur ?", a: "En ligne, en trois minutes : saisissez le départ, l'arrivée, la date et l'heure. Le prix s'affiche immédiatement, puis vous payez un acompte (ou la totalité) par carte, Apple Pay ou Google Pay. La réservation est confirmée par e-mail dans la foulée." },
      { q: "Faut-il créer un compte ?", a: "Non. Vous pouvez réserver sans compte : l'e-mail de confirmation contient un lien personnel pour suivre, annuler ou retrouver votre réservation. Le compte est facultatif et permet d'enregistrer vos adresses et de retrouver tous vos trajets." },
      { q: "Combien de temps à l'avance dois-je réserver ?", a: "Au moins 2 heures avant la prise en charge pour une réservation en ligne, et jusqu'à un an à l'avance. Pour un départ très matinal (vol de 6 h, par exemple), réservez de préférence la veille. Pour une course dans moins de 2 heures, appelez ou demandez à être rappelé." },
      { q: "Puis-je réserver pour une autre personne ?", a: "Oui. Indiquez vos coordonnées pour la confirmation, et précisez le nom et le téléphone du passager dans la case « Ajouter une précision ». Le chauffeur contactera directement le passager si besoin." },
      { q: "Puis-je réserver un aller-retour ?", a: "Oui : cochez « Prévoir aussi le retour » et choisissez la date et l'heure du retour. Par défaut, le retour est le trajet inverse ; vous pouvez aussi indiquer d'autres adresses. Les deux trajets sont payés ensemble mais restent annulables séparément." },
      { q: "Comment modifier ma réservation ?", a: "Répondez à l'e-mail de confirmation ou passez par la page contact en indiquant votre référence. Une modification demandée plus de 24 heures avant est gratuite ; si le trajet change, le prix est recalculé." },
      { q: "Où retrouver ma réservation ?", a: "Dans l'e-mail de confirmation (bouton « Suivre ma réservation »), ou dans votre espace personnel si vous avez un compte avec la même adresse e-mail. Vous y trouvez aussi le bon de commande et la note." },
      { q: "Je n'ai pas reçu l'e-mail de confirmation, que faire ?", a: "Vérifiez vos courriers indésirables. L'e-mail part de reservation@nordvtc.fr dans la minute qui suit le paiement. Si vous ne le trouvez toujours pas, écrivez à contact@nordvtc.fr : nous vous le renvoyons." },
    ],
  },
  {
    id: "prix",
    title: "Prix et paiement",
    items: [
      { q: "Comment le prix est-il calculé ?", a: "Selon la distance réelle de l'itinéraire entre vos deux adresses, avec un prix minimum de 25 €. Une majoration de 20 % s'applique aux prises en charge entre 22 h et 6 h ; elle est déjà incluse dans le prix affiché." },
      { q: "Le prix peut-il changer après la réservation ?", a: "Non. Le prix affiché est ferme : pas de tarif qui grimpe aux heures de pointe, dans les embouteillages ou en cas de détour. Seuls s'ajoutent, après information, un temps d'attente dépassé ou un changement d'adresse demandé par vous." },
      { q: "Les péages et le carburant sont-ils compris ?", a: "Oui, tout est compris dans le prix affiché : trajet, carburant, péages et bagages déclarés." },
      { q: "Quels moyens de paiement acceptez-vous ?", a: "En ligne : carte bancaire (CB, Visa, Mastercard), Apple Pay et Google Pay, via la page sécurisée de Stripe. Aucune donnée bancaire n'est conservée par le site." },
      { q: "Que représente l'acompte ?", a: "L'acompte correspond à 30 % du prix et confirme votre réservation. Le solde se règle au chauffeur à la fin de la course. Vous pouvez aussi payer la totalité en ligne pour n'avoir rien à régler à bord." },
      { q: "Puis-je avoir une facture ?", a: "Oui : la facture vous est envoyée par e-mail après la course, et le bon de commande est disponible dès la réservation depuis votre lien de suivi. Pour une facture au nom de votre entreprise, cochez « Facture au nom d'une entreprise » lors de la réservation (raison sociale, adresse, SIREN). TVA non applicable (micro-entreprise)." },
      { q: "Proposez-vous des tarifs pour les entreprises ou les trajets réguliers ?", a: "Oui : facturation regroupée, interlocuteur unique et tarif adapté aux trajets réguliers. Écrivez-nous depuis la page contact en décrivant vos besoins." },
      { q: "Comment utiliser un code promo ?", a: "Saisissez-le dans le formulaire de réservation avant de payer : la réduction s'affiche aussitôt sur le prix. Un seul code par réservation." },
    ],
  },
  {
    id: "annulation",
    title: "Annulation et remboursement",
    items: [
      { q: "Puis-je annuler gratuitement ?", a: "Oui, jusqu'à 24 heures avant la prise en charge : annulation en un clic depuis le lien de suivi ou votre espace, et remboursement automatique de tout ce que vous avez payé." },
      { q: "Et si j'annule moins de 24 heures avant ?", a: "Une somme égale à l'acompte (30 % du prix) reste due pour la course bloquée. Si vous aviez tout payé en ligne, le reste vous est remboursé automatiquement." },
      { q: "Mon train ou mon vol est annulé, que faire ?", a: "Depuis le lien de suivi (ou votre espace), cliquez sur « Demander l'annulation sans frais » et joignez la preuve de l'annulation (e-mail, SMS ou capture de la compagnie). Après vérification, la totalité de la somme payée vous est remboursée, quel que soit le délai." },
      { q: "Combien de temps prend un remboursement ?", a: "Il est émis immédiatement sur le moyen de paiement utilisé ; selon votre banque, il apparaît sur votre compte sous 5 à 10 jours ouvrés." },
      { q: "Que se passe-t-il si le chauffeur annule ?", a: "Vous êtes prévenu au plus tôt et intégralement remboursé, ou un autre chauffeur vous est proposé avec votre accord." },
    ],
  },
  {
    id: "jour-j",
    title: "Le jour du trajet",
    items: [
      { q: "Où le chauffeur m'attend-il à l'aéroport ou à la gare ?", a: "À l'arrivée d'un vol, en salle d'arrivée ; à une gare, devant la sortie principale ou à l'endroit convenu. Le chauffeur vous appelle ou vous envoie un SMS à votre arrivée : gardez votre téléphone allumé." },
      { q: "Mon vol ou mon train a du retard : que se passe-t-il ?", a: "Rien à faire si vous avez indiqué le numéro de vol ou de train : le chauffeur suit l'horaire réel et adapte la prise en charge, sans frais." },
      { q: "Combien de temps le chauffeur attend-il ?", a: "Gratuitement : 15 minutes à une adresse, 25 minutes après l'atterrissage réel d'un vol, 20 minutes après l'arrivée réelle d'un train. Au-delà, l'attente est facturée 7,50 € par quart d'heure entamé." },
      { q: "Et si je suis en retard ou injoignable ?", a: "Prévenez dès que possible en répondant à l'e-mail ou par téléphone. Sans nouvelles 15 minutes après la fin de l'attente gratuite, la course est considérée comme annulée (conditions d'annulation de moins de 24 h)." },
      { q: "Et si c'est le chauffeur qui est en retard ?", a: "Il vous prévient. S'il arrive avec plus de 20 minutes de retard de son fait, vous pouvez renoncer à la course et être intégralement remboursé." },
      { q: "Comment joindre le chauffeur ?", a: "Le numéro figure dans l'e-mail de confirmation. Vous pouvez aussi répondre à cet e-mail ou utiliser « Appeler ou être rappelé » sur le site." },
    ],
  },
  {
    id: "a-bord",
    title: "À bord",
    items: [
      { q: "Quel est le véhicule ?", a: "Une Toyota Auris hybride, propre et silencieuse, conduite par son propriétaire. Elle accueille jusqu'à 4 passagers." },
      { q: "Combien de bagages puis-je emporter ?", a: "Indiquez le nombre de bagages à la réservation : ils sont transportés sans supplément dans la limite du coffre. Signalez les objets volumineux (poussette, vélo, skis, fauteuil pliable) dans les précisions pour qu'on confirme qu'ils rentrent." },
      { q: "Avez-vous un siège enfant ?", a: "Oui, sur demande : cochez « Siège enfant ou rehausseur » à la réservation et indiquez l'âge de l'enfant dans les précisions. Il est obligatoire pour les enfants de moins de 10 ans." },
      { q: "Les animaux sont-ils acceptés ?", a: "Oui s'ils sont signalés à la réservation : les petits animaux voyagent en sac ou en caisse fermée, les plus grands sur une couverture fournie par vous, après accord. Les chiens guides et d'assistance sont toujours acceptés gratuitement." },
      { q: "Y a-t-il de l'eau, un chargeur, le Wi-Fi ?", a: "Une bouteille d'eau est offerte à chaque passager, des câbles de charge USB-C et Lightning sont à disposition, et une connexion Wi-Fi partagée est possible sur demande." },
      { q: "Peut-on fumer ou vapoter dans la voiture ?", a: "Non, ni fumer ni vapoter. Une pause peut être prévue sur un long trajet : demandez-la au chauffeur." },
      { q: "J'ai oublié un objet dans la voiture, comment le récupérer ?", a: "Écrivez à contact@nordvtc.fr ou répondez à l'e-mail de confirmation : l'objet est conservé et vous est rendu. Si cela demande un déplacement, il est facturé au prix d'une course." },
    ],
  },
  {
    id: "zones",
    title: "Zones et horaires",
    items: [
      { q: "Quelles zones desservez-vous ?", a: "Lille et toute la métropole (Roubaix, Tourcoing, Villeneuve-d'Ascq, Marcq-en-Barœul, Lambersart, La Madeleine, Lesquin, Seclin, Armentières, Wasquehal…), ainsi que les trajets vers Paris, les aéroports de Paris et de Bruxelles, la Belgique et le littoral." },
      { q: "Faites-vous les longues distances ?", a: "Oui : Paris, Charles-de-Gaulle, Bruxelles, Zaventem, Charleroi, Le Touquet… Le prix s'affiche directement en ligne jusqu'à 400 km ; au-delà, demandez un devis." },
      { q: "Travaillez-vous la nuit, le week-end et les jours fériés ?", a: "Oui, 7 jours sur 7, à toute heure, sur réservation. Seule la majoration de nuit (22 h – 6 h) s'applique, sans supplément le dimanche ou les jours fériés." },
      { q: "Proposez-vous la mise à disposition ou les mariages ?", a: "Oui : mise à disposition à l'heure ou à la journée, mariages, soirées et événements, sur devis. Faites votre demande depuis la page du service ou la page contact." },
    ],
  },
  {
    id: "confiance",
    title: "Confiance et sécurité",
    items: [
      { q: "Quelle différence entre un VTC et un taxi ?", a: "Un VTC se réserve obligatoirement à l'avance, avec un prix connu avant la course. Un taxi peut être hélé dans la rue et facture au compteur. Votre chauffeur est titulaire des deux cartes professionnelles, VTC et taxi." },
      { q: "Le chauffeur est-il assuré et déclaré ?", a: "Oui : carte professionnelle VTC, inscription au registre des exploitants VTC, véhicule assuré pour le transport de personnes. Les références figurent dans les mentions légales et sur votre bon de commande." },
      { q: "Mon paiement est-il sécurisé ?", a: "Oui : le paiement se fait sur la page de Stripe, leader du paiement en ligne, avec authentification bancaire si nécessaire. Le site ne voit jamais vos numéros de carte." },
      { q: "Que faites-vous de mes données ?", a: "Elles servent uniquement à réaliser votre course et à vous envoyer la confirmation ; elles ne sont jamais vendues. Le détail est dans la politique de confidentialité." },
      { q: "Et en cas de litige ?", a: "Écrivez-nous d'abord pour trouver une solution. À défaut, vous pouvez saisir gratuitement le médiateur de la consommation indiqué dans les mentions légales." },
    ],
  },
];

export const ALL_FAQ: QA[] = FAQ_GROUPS.flatMap((g) => g.items);
