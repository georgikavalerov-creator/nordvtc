// Grille de prix INDICATIFS affichée sur /tarifs. Provisoire : à confirmer par le chauffeur.
// Source de départ : prix publics indicatifs de saiyango.fr (départ Lille centre). Le prix réel d'une
// réservation est toujours calculé par le calculateur à partir de l'itinéraire.

export type Forfait = { route: string; note?: string; duration?: string; price: string };
export type ForfaitGroup = { title: string; rows: Forfait[] };

export const FORFAITS: ForfaitGroup[] = [
  {
    title: "Aéroports",
    rows: [
      { route: "Lille centre → Aéroport de Lille-Lesquin", note: "Suivi du vol", duration: "~20 min", price: "dès 70 €" },
      { route: "Lille → Paris Charles-de-Gaulle", duration: "~2 h 15", price: "dès 451 €" },
      { route: "Lille → Bruxelles-Zaventem", duration: "~1 h 10", price: "dès 242 €" },
      { route: "Lille → Bruxelles-Sud Charleroi", duration: "~1 h 20", price: "dès 284 €" },
      { route: "Lille → Amsterdam Schiphol", duration: "~2 h 45", price: "dès 581 €" },
      { route: "Lesquin → Paris-Beauvais", duration: "~2 h 45", price: "dès 326 €" },
    ],
  },
  {
    title: "Gares",
    rows: [
      { route: "Domicile → Gare Lille-Flandres", note: "Prise en charge à votre adresse", duration: "Selon zone", price: "35 – 80 €" },
      { route: "Domicile → Gare Lille-Europe", note: "Eurostar et TGV", duration: "Selon zone", price: "45 – 100 €" },
    ],
  },
  {
    title: "Métropole lilloise",
    rows: [
      { route: "Lille centre → Roubaix", duration: "~20 min", price: "dès 70 €" },
      { route: "Lille centre → Tourcoing", duration: "~25 min", price: "dès 75 €" },
      { route: "Lille centre → Villeneuve-d'Ascq", duration: "~15 min", price: "dès 65 €" },
    ],
  },
  {
    title: "Longue distance",
    rows: [
      { route: "Lille → Lens (stade Bollaert)", duration: "~40 min", price: "dès 125 €" },
      { route: "Lille → Dunkerque", duration: "~1 h", price: "dès 170 €" },
      { route: "Lille → Le Touquet", duration: "~1 h 20", price: "dès 365 €" },
    ],
  },
  {
    title: "Mise à disposition",
    rows: [
      { route: "Demi-journée", note: "Réunions, événements", duration: "4 h", price: "dès 180 €" },
      { route: "Journée complète", note: "Déplacements professionnels", duration: "8 h", price: "dès 320 €" },
      { route: "Mariage / événement", note: "Sur devis", price: "Sur devis" },
    ],
  },
];
