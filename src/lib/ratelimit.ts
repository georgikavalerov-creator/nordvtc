import { db, dbConfigured } from "./supabase";

// Deux niveaux de limitation :
// - allow() : en mémoire, instantané, pour les requêtes fréquentes (suggestions d'adresses, devis, actualisation du chat) ;
// - allowDurable() : en base, partagé entre toutes les instances du site, pour les actions sensibles
//   (connexions, SMS, formulaires, réservations) : impossible à contourner en multipliant les requêtes.
const hits = new Map<string, number[]>();

export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return true;
}

export async function allowDurable(key: string, max: number, windowMs: number): Promise<boolean> {
  if (!allow(`m:${key}`, max, windowMs)) return false; // premier filtre local, gratuit
  if (!dbConfigured()) return true;
  try {
    const { data, error } = await db().rpc("rate_hit", { p_key: key.slice(0, 200), p_max: max, p_window_s: Math.round(windowMs / 1000) });
    if (error) { console.error("rate_hit", error.message); return true; } // en cas de panne, on ne bloque pas les clients
    return data !== false;
  } catch { return true; }
}

/** Adresse IP réelle du visiteur : fournie par Cloudflare (non falsifiable), sinon repli. */
export function ipFrom(h: Headers): string {
  return h.get("cf-connecting-ip")?.trim() || h.get("x-real-ip")?.trim() || h.get("x-forwarded-for")?.split(",").pop()?.trim() || "inconnu";
}

export function clientIp(req: Request): string {
  return ipFrom(req.headers);
}

// Visiteurs derrière un VPN, le Relais privé iCloud ou un opérateur mobile (CGNAT) : des centaines de personnes
// partagent alors la même IP. On limite donc chaque visiteur (IP + navigateur), et l'IP entière seulement avec une marge large.
export const SHARED_IP_FACTOR = 6;
const fnv = (s: string) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); };
export function visitorKey(req: Request): string {
  const h = req.headers;
  return `${ipFrom(h)}~${fnv(`${h.get("user-agent") ?? ""}|${h.get("accept-language") ?? ""}|${h.get("sec-ch-ua-platform") ?? ""}`)}`;
}
export function allowVisitor(req: Request, name: string, max: number, windowMs: number): boolean {
  return allow(`${name}:${visitorKey(req)}`, max, windowMs) && allow(`${name}:ip:${clientIp(req)}`, max * SHARED_IP_FACTOR, windowMs);
}
