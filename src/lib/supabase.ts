import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_PRICING, type Pricing } from "./pricing";

let client: SupabaseClient | null = null;

// Client serveur (clé service_role) : ne jamais l'utiliser dans un composant client.
export function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase non configuré (URL ou clé manquante)");
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export function dbConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function getPricing(): Promise<Pricing> {
  if (!dbConfigured()) return DEFAULT_PRICING;
  try {
    const { data } = await db().from("settings").select("value").eq("key", "pricing").maybeSingle();
    return { ...DEFAULT_PRICING, ...((data?.value as Partial<Pricing>) ?? {}) };
  } catch {
    return DEFAULT_PRICING;
  }
}
