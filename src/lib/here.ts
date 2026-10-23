// Appels HERE côté serveur uniquement : la clé ne quitte jamais le serveur.

const KEY = () => {
  const k = process.env.HERE_API_KEY;
  if (!k) throw new Error("HERE_API_KEY manquante");
  return k;
};

export type Place = { label: string; lat: number; lng: number };

// Requêtes que HERE comprend mal (« Aéroport de Lille-Lesquin » renvoie un parking) : on interroge le bon lieu.
const ALIASES: [RegExp, string][] = [[/^a[ée]roport( de)? lille[\s-]*(lesquin)?(,.*)?$/i, "Aéroport de Lille"], [/^a[ée]roport( de)? lesquin$/i, "Aéroport de Lille"]];

export async function suggestPlaces(q: string): Promise<Place[]> {
  q = ALIASES.find(([re]) => re.test(q.trim()))?.[1] ?? q;
  const url = new URL("https://discover.search.hereapi.com/v1/discover");
  url.searchParams.set("at", "50.6292,3.0573"); // centre de Lille
  url.searchParams.set("q", q);
  url.searchParams.set("lang", "fr");
  url.searchParams.set("limit", "6");
  url.searchParams.set("in", "countryCode:FRA,BEL,NLD,LUX"); // Pays-Bas : Schiphol, Amsterdam
  url.searchParams.set("apiKey", KEY());
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HERE discover ${res.status}`);
  const data = (await res.json()) as {
    items?: { title: string; address?: { label?: string }; position?: { lat: number; lng: number } }[];
  };
  const seen = new Set<string>();
  return (data.items ?? [])
    .filter((i) => i.position)
    .map((i) => {
      const addr = i.address?.label;
      // « 10 Rue Pierre Mauroy (Rue de Paris) » + « 10 Rue Pierre Mauroy, 59800 Lille » : l'adresse suffit,
      // sinon le libellé répétait la rue deux fois. Le nom d'un lieu (gare, aéroport…) reste devant l'adresse.
      // Titre sans les précisions entre parenthèses : « 10 Rue Pierre Mauroy (Rue de Paris), 59800 Lille, France »
      // devient « 10 Rue Pierre Mauroy, 59800 Lille, France », identique à l'adresse.
      const base = i.title.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
      const firstPart = base.split(",")[0].trim();
      const label = !addr ? i.title
        : addr.startsWith(i.title) || addr.startsWith(base) || base.startsWith(addr) || (firstPart.length > 3 && addr.startsWith(firstPart)) ? addr
        : `${i.title}, ${addr}`;
      return { label, lat: i.position!.lat, lng: i.position!.lng };
    })
    .filter((p) => {
      // Même adresse renvoyée deux fois (doublon HERE) : une seule ligne dans la liste.
      const key = `${p.label}|${p.lat.toFixed(4)}|${p.lng.toFixed(4)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export async function routeSummary(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<{ distanceM: number; durationS: number }> {
  const url = new URL("https://router.hereapi.com/v8/routes");
  url.searchParams.set("transportMode", "car");
  url.searchParams.set("origin", `${from.lat},${from.lng}`);
  url.searchParams.set("destination", `${to.lat},${to.lng}`);
  url.searchParams.set("return", "summary");
  url.searchParams.set("apiKey", KEY());
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HERE routing ${res.status}`);
  const data = (await res.json()) as {
    routes?: { sections: { summary: { length: number; duration: number } }[] }[];
  };
  const sections = data.routes?.[0]?.sections;
  if (!sections?.length) throw new Error("Aucun itinéraire trouvé");
  return {
    distanceM: sections.reduce((s, x) => s + x.summary.length, 0),
    durationS: sections.reduce((s, x) => s + x.summary.duration, 0),
  };
}

/** Estimation des péages (€) de l'itinéraire, ou null si le service ne les fournit pas. Voiture, tarif le plus bas par péage. */
export async function tollCostEur(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<number | null> {
  try {
    const url = new URL("https://router.hereapi.com/v8/routes");
    url.searchParams.set("transportMode", "car");
    url.searchParams.set("origin", `${from.lat},${from.lng}`);
    url.searchParams.set("destination", `${to.lat},${to.lng}`);
    url.searchParams.set("return", "summary,tolls");
    url.searchParams.set("currency", "EUR");
    url.searchParams.set("apiKey", KEY());
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) { console.error("here tolls", res.status); return null; }
    type Fare = { price?: { value?: number; currency?: string; convertedPrice?: { value?: number; currency?: string } } };
    const data = (await res.json()) as { routes?: { sections: { tolls?: { fares?: Fare[] }[] }[] }[] };
    let total = 0;
    for (const s of data.routes?.[0]?.sections ?? []) {
      for (const t of s.tolls ?? []) {
        const vals = (t.fares ?? [])
          .map((f) => (f.price?.convertedPrice?.currency === "EUR" ? f.price.convertedPrice.value : f.price?.currency === "EUR" ? f.price.value : undefined))
          .filter((v): v is number => typeof v === "number");
        if (vals.length) total += Math.min(...vals);
      }
    }
    return Math.round(total * 100) / 100;
  } catch (e) { console.error("here tolls", e); return null; }
}
