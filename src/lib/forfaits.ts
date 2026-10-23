// Grille de prix INDICATIFS affichée sur /tarifs, calculée avec la formule du site (voir src/lib/prix-depart.ts)
// depuis Lille centre. Le prix réel d'une réservation est toujours calculé par le calculateur à partir de l'itinéraire.
import { prix, duree, PRIX_MINIMUM, type TrajetKey } from "./prix-depart";

const des = (k: TrajetKey) => `dès ${prix(k)} €`;

export type Forfait = { route: string; note?: string; duration?: string; price: string };
export type ForfaitGroup = { title: string; rows: Forfait[] };

export const FORFAITS: ForfaitGroup[] = [
  {
    title: "Aéroports",
    rows: [
      { route: "Lille centre → Aéroport de Lille-Lesquin", note: "Suivi du vol", duration: duree("lesquin"), price: des("lesquin") },
      { route: "Lille → Paris Charles-de-Gaulle", duration: duree("cdg"), price: des("cdg") },
      { route: "Lille → Bruxelles-Zaventem", duration: duree("zaventem"), price: des("zaventem") },
      { route: "Lille → Bruxelles-Sud Charleroi", duration: duree("charleroi"), price: des("charleroi") },
      { route: "Lille → Amsterdam Schiphol", duration: duree("schiphol"), price: des("schiphol") },
      { route: "Lesquin → Paris-Beauvais", duration: duree("beauvais"), price: des("beauvais") },
    ],
  },
  {
    title: "Gares",
    rows: [
      { route: "Domicile → Gare Lille-Flandres", note: "Prise en charge à votre adresse", duration: "Selon zone", price: `dès ${PRIX_MINIMUM} €` },
      { route: "Domicile → Gare Lille-Europe", note: "Eurostar et TGV", duration: "Selon zone", price: `dès ${PRIX_MINIMUM} €` },
    ],
  },
  {
    title: "Métropole lilloise",
    rows: [
      { route: "Lille centre → Roubaix", duration: duree("roubaix"), price: des("roubaix") },
      { route: "Lille centre → Tourcoing", duration: duree("tourcoing"), price: des("tourcoing") },
      { route: "Lille centre → Villeneuve-d'Ascq", duration: duree("villeneuve"), price: des("villeneuve") },
    ],
  },
  {
    title: "Longue distance",
    rows: [
      { route: "Lille → Lens", duration: duree("lens"), price: des("lens") },
      { route: "Lille → Dunkerque", duration: duree("dunkerque"), price: des("dunkerque") },
      { route: "Lille → Le Touquet-Paris-Plage", duration: duree("touquet"), price: des("touquet") },
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
