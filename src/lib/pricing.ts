// Tarifs du chauffeur : 25 € de prise en charge + 2,30 €/km, minimum 25 €. Modifiables depuis /admin (table `settings`, clé "pricing").

export type Pricing = {
  baseFare: number; // prise en charge, en euros
  perKm: number; // euros par km
  perMinute: number; // euros par minute
  minimumFare: number; // course minimum, en euros
  nightSurchargePct: number; // majoration de nuit (22h–6h), en %
  nightStartHour: number;
  nightEndHour: number;
  depositPct: number; // part payée en ligne, en %
  minLeadHours: number; // délai minimum avant la prise en charge
  maxDistanceKm: number; // au-delà : devis sur demande
};

export const DEFAULT_PRICING: Pricing = {
  baseFare: 25,
  perKm: 2.3,
  perMinute: 0,
  minimumFare: 25,
  nightSurchargePct: 20,
  nightStartHour: 22,
  nightEndHour: 6,
  depositPct: 30,
  minLeadHours: 2,
  maxDistanceKm: 400,
};

export type Quote = {
  distanceKm: number;
  durationMin: number;
  priceCents: number;
  depositCents: number; // acompte
  fullCents: number; // totalité en ligne
  night: boolean;
};

export function isNight(hour: number, p: Pricing): boolean {
  return p.nightStartHour > p.nightEndHour
    ? hour >= p.nightStartHour || hour < p.nightEndHour
    : hour >= p.nightStartHour && hour < p.nightEndHour;
}

export function computeQuote(
  distanceM: number,
  durationS: number,
  pickupHour: number,
  p: Pricing,
): Quote {
  const km = distanceM / 1000;
  const min = durationS / 60;
  let price = p.baseFare + km * p.perKm + min * p.perMinute;
  price = Math.max(price, p.minimumFare);
  const night = isNight(pickupHour, p);
  if (night) price *= 1 + p.nightSurchargePct / 100;
  const priceCents = Math.round(price) * 100; // arrondi à l'euro
  const depositCents = Math.max(50, Math.round((priceCents * p.depositPct) / 100 / 100) * 100);
  return {
    distanceKm: Math.round(km * 10) / 10,
    durationMin: Math.round(min),
    priceCents,
    depositCents: Math.min(depositCents, priceCents),
    fullCents: priceCents,
    night,
  };
}

export const euro = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    cents / 100,
  );

// Convertit une date/heure saisies à l'heure de Paris en instant UTC.
export function parisToUtc(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const offsetAt = (t: number) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Paris",
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date(t));
    const g = (type: string) => Number(parts.find((x) => x.type === type)!.value);
    const asUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"));
    return asUtc - t;
  };
  let utc = guess - offsetAt(guess);
  utc = guess - offsetAt(utc);
  return new Date(utc);
}
