// Appels HERE côté serveur uniquement : la clé ne quitte jamais le serveur.

const KEY = () => {
  const k = process.env.HERE_API_KEY;
  if (!k) throw new Error("HERE_API_KEY manquante");
  return k;
};

export type Place = { label: string; lat: number; lng: number };

export async function suggestPlaces(q: string): Promise<Place[]> {
  const url = new URL("https://discover.search.hereapi.com/v1/discover");
  url.searchParams.set("at", "50.6292,3.0573"); // centre de Lille
  url.searchParams.set("q", q);
  url.searchParams.set("lang", "fr");
  url.searchParams.set("limit", "6");
  url.searchParams.set("in", "countryCode:FRA,BEL");
  url.searchParams.set("apiKey", KEY());
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HERE discover ${res.status}`);
  const data = (await res.json()) as {
    items?: { title: string; address?: { label?: string }; position?: { lat: number; lng: number } }[];
  };
  return (data.items ?? [])
    .filter((i) => i.position)
    .map((i) => ({
      label: i.address?.label && !i.address.label.startsWith(i.title) ? `${i.title}, ${i.address.label}` : (i.address?.label ?? i.title),
      lat: i.position!.lat,
      lng: i.position!.lng,
    }));
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
