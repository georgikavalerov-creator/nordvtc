import { db, dbConfigured } from "./supabase";

// Estimation des frais du chauffeur par trajet (carburant + péages). Interne : jamais montré aux clients.
export type Costs = { fuelLPer100: number; fuelPricePerL: number };
export const DEFAULT_COSTS: Costs = { fuelLPer100: 7.5, fuelPricePerL: 0.95 }; // Toyota Auris hybride au E85 : à ajuster dans /admin/tarifs

export async function getCosts(): Promise<Costs> {
  if (!dbConfigured()) return DEFAULT_COSTS;
  try {
    const { data } = await db().from("settings").select("value").eq("key", "costs").maybeSingle();
    return { ...DEFAULT_COSTS, ...((data?.value as Partial<Costs>) ?? {}) };
  } catch { return DEFAULT_COSTS; }
}

export const fuelCostEur = (distanceM: number, c: Costs) => Math.round((distanceM / 1000) * (c.fuelLPer100 / 100) * c.fuelPricePerL * 100) / 100;
