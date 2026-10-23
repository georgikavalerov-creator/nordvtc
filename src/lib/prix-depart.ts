// Prix « à partir de » affichés sur le site, calculés avec la même formule que le calculateur
// (prise en charge + prix au km, course minimum, tarif de jour) à partir des distances routières réelles.
// Distances et durées relevées le 23/10/2026 avec le calcul du site (HERE), départ depuis le centre de la commune.
// Si les tarifs changent dans l'admin, mettre à jour DEFAULT_PRICING (src/lib/pricing.ts) pour que ces prix suivent.
import { DEFAULT_PRICING } from "./pricing";

/** Prix de jour arrondi à l'euro pour une distance donnée, comme computeQuote. */
export function prixDes(km: number, p = DEFAULT_PRICING): number {
  return Math.round(Math.max(p.baseFare + km * p.perKm, p.minimumFare));
}

/** Durée lisible : « ~15 min », « ~1 h 45 ». Arrondie à 5 minutes. */
export function dureeTexte(min: number): string {
  const m = Math.max(5, Math.round(min / 5) * 5);
  if (m < 60) return `~${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `~${h} h ${String(r).padStart(2, "0")}` : `~${h} h`;
}

// Trajets de référence depuis Lille centre (ou Lesquin pour Beauvais) : distance en km, durée en minutes.
export const TRAJETS = {
  lesquin: { km: 10.2, min: 15 }, // Lille → Aéroport de Lille-Lesquin
  cdg: { km: 197, min: 121 }, // Lille → Paris-Charles-de-Gaulle
  zaventem: { km: 129.6, min: 104 }, // Lille → Bruxelles-Zaventem
  charleroi: { km: 118.3, min: 84 }, // Lille → Bruxelles-Sud Charleroi
  schiphol: { km: 286.3, min: 195 }, // Lille → Amsterdam-Schiphol
  beauvais: { km: 189.1, min: 116 }, // Lesquin → Paris-Beauvais
  roubaix: { km: 12.1, min: 18 },
  tourcoing: { km: 13.6, min: 21 },
  villeneuve: { km: 9.3, min: 13 },
  lens: { km: 37.8, min: 39 },
  dunkerque: { km: 78.6, min: 61 },
  touquet: { km: 177.3, min: 118 }, // Lille → Le Touquet-Paris-Plage
} as const;

export type TrajetKey = keyof typeof TRAJETS;
export const prix = (k: TrajetKey) => prixDes(TRAJETS[k].km);
export const duree = (k: TrajetKey) => dureeTexte(TRAJETS[k].min);
/** Course minimum (trajet court vers une gare, par exemple). */
export const PRIX_MINIMUM = DEFAULT_PRICING.minimumFare;
