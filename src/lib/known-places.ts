// Lieux utilisés dans les liens « Réserver ce trajet » du site, avec leurs coordonnées exactes.
// Un lien pré-rempli (/reservation?from=…&to=…) qui nomme l'un de ces lieux est résolu ici, sans recherche :
// la recherche d'adresse renvoyait parfois une rue homonyme près de Lille (« Le Touquet » à Marquette-lez-Lille,
// « Amsterdam Schiphol » rue d'Amsterdam à Tourcoing). Coordonnées relevées avec HERE le 23/10/2026.
import type { Place } from "./here";

const P = (label: string, lat: number, lng: number, ...names: string[]) => ({ place: { label, lat, lng } as Place, names });

const KNOWN = [
  P("Lille, Hauts-de-France, France", 50.6282, 3.06881, "lille", "lille centre"),
  P("Aéroport de Lille, 59273 Fretin, France", 50.57187, 3.10601, "aeroport de lille-lesquin", "aeroport de lille lesquin", "aeroport lille-lesquin", "aeroport de lille", "lille-lesquin", "lesquin aeroport"),
  P("Gare Lille Flandres, Place de la Gare, 59800 Lille, France", 50.63655, 3.06991, "gare de lille-flandres", "gare lille-flandres", "gare lille flandres", "lille-flandres"),
  P("Gare de Lille Europe, Avenue Le Corbusier, 59800 Lille, France", 50.63909, 3.0754, "gare de lille-europe", "gare lille-europe", "gare lille europe", "lille-europe"),
  P("Aéroport de Paris Charles de Gaulle, 95700 Roissy-en-France, France", 49.00594, 2.54401, "aeroport paris-charles-de-gaulle", "paris charles-de-gaulle", "paris-charles-de-gaulle", "roissy-cdg", "aeroport roissy-charles-de-gaulle"),
  P("Aéroport de Bruxelles, Leopoldlaan, 1930 Zaventem, Belgique", 50.89437, 4.47775, "aeroport de bruxelles-zaventem", "aeroport de bruxelles-national, zaventem", "bruxelles-zaventem", "aeroport de bruxelles", "zaventem"),
  P("Aéroport Charleroi Bruxelles Sud, Rue des Frères Wright 8, 6041 Charleroi, Belgique", 50.4694, 4.46944, "bruxelles-sud charleroi", "aeroport de charleroi", "charleroi aeroport"),
  P("Aéroport d'Amsterdam-Schiphol, 1118 CP Schiphol, Pays-Bas", 52.3091, 4.7634, "amsterdam schiphol", "aeroport d'amsterdam-schiphol", "schiphol"),
  P("Aéroport de Beauvais-Tillé, Route de l'Aéroport, 60000 Tillé, France", 49.4599, 2.10806, "paris-beauvais", "aeroport de paris-beauvais", "aeroport de beauvais"),
  P("Le Touquet-Paris-Plage, Hauts-de-France, France", 50.51938, 1.59409, "le touquet-paris-plage", "le touquet"),
  P("Dunkerque, Hauts-de-France, France", 51.03421, 2.37688, "dunkerque"),
  P("Lens, Hauts-de-France, France", 50.42941, 2.83343, "lens"),
  P("Roubaix, Hauts-de-France, France", 50.69142, 3.17319, "roubaix"),
  P("Tourcoing, Hauts-de-France, France", 50.72236, 3.15946, "tourcoing"),
  P("Villeneuve-d'Ascq, Hauts-de-France, France", 50.6191, 3.13262, "villeneuve-d'ascq"),
  P("Marcq-en-Baroeul, Hauts-de-France, France", 50.674, 3.0942, "marcq-en-baroeul"),
  P("Lambersart, Hauts-de-France, France", 50.64781, 3.02266, "lambersart"),
  P("La Madeleine, Hauts-de-France, France", 50.65506, 3.07373, "la madeleine"),
  P("Lesquin, Hauts-de-France, France", 50.58811, 3.11039, "lesquin"),
  P("Seclin, Hauts-de-France, France", 50.54684, 3.02692, "seclin"),
  P("Armentières, Hauts-de-France, France", 50.68686, 2.88174, "armentieres"),
  P("Wasquehal, Hauts-de-France, France", 50.66948, 3.132, "wasquehal"),
];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").toLowerCase().replace(/\s+/g, " ").trim();
const INDEX = new Map(KNOWN.flatMap((k) => k.names.map((n) => [norm(n), k.place] as const)));

/** Lieu connu correspondant exactement au texte d'un lien, ou null. */
export function knownPlace(text: string): Place | null {
  return INDEX.get(norm(text)) ?? null;
}
