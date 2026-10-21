import { db, dbConfigured } from "./supabase";
import { euro, type Pricing, type Quote } from "./pricing";

export type PromoOk = { ok: true; code: string; discountCents: number; label: string };
export type PromoResult = PromoOk | { ok: false; error: string };

const MIN_PRICE = 500; // le trajet ne descend jamais sous 5 €
const norm = (c: string) => c.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);

/** Vérifie un code côté serveur (jamais confié au navigateur). */
export async function validatePromo(raw: string, priceCents: number, who: { userId?: string | null; email?: string | null }): Promise<PromoResult> {
  const code = norm(raw);
  if (!code) return { ok: false, error: "Saisissez un code." };
  if (!dbConfigured()) return { ok: false, error: "Codes promo indisponibles pour le moment." };
  const { data: p } = await db().from("promo_codes").select("*").eq("code", code).maybeSingle();
  const bad = (error: string): PromoResult => ({ ok: false, error });
  if (!p || !p.active) return bad("Ce code n'est pas valide.");
  const now = Date.now();
  if (p.starts_at && new Date(p.starts_at).getTime() > now) return bad("Ce code n'est pas encore actif.");
  if (p.expires_at && new Date(p.expires_at).getTime() < now) return bad("Ce code a expiré.");
  if (priceCents < p.min_price_cents) return bad(`Code valable à partir de ${euro(p.min_price_cents)} de trajet.`);

  // Utilisations : réservations payées, ou en cours de paiement depuis moins de 35 min.
  const since = new Date(now - 35 * 60_000).toISOString();
  const live = `status.in.(confirmed,completed),and(status.eq.pending_payment,created_at.gte.${since})`;
  if (p.max_uses != null) {
    const { count } = await db().from("bookings").select("id", { count: "exact", head: true }).eq("promo_code", code).or(live);
    if ((count ?? 0) >= p.max_uses) return bad("Ce code a atteint son nombre maximum d'utilisations.");
  }
  const mail = who.email?.trim().toLowerCase().replace(/[,()%*]/g, "");
  const mine = [who.userId ? `user_id.eq.${who.userId}` : "", mail ? `customer_email.ilike.${mail}` : ""].filter(Boolean).join(",");
  if (mine) {
    const { count } = await db().from("bookings").select("id", { count: "exact", head: true }).eq("promo_code", code).or(live).or(mine);
    if ((count ?? 0) >= p.max_uses_per_customer) return bad("Vous avez déjà utilisé ce code.");
    if (p.first_booking_only) {
      const { count: prev } = await db().from("bookings").select("id", { count: "exact", head: true }).in("status", ["confirmed", "completed"]).or(mine);
      if ((prev ?? 0) > 0) return bad("Ce code est réservé à une première réservation.");
    }
  } else if (p.first_booking_only) {
    return bad("Connectez-vous ou renseignez votre e-mail pour utiliser ce code.");
  }

  let discount = p.kind === "percent" ? Math.round((priceCents * Math.min(p.value, 100)) / 100 / 100) * 100 : p.value;
  discount = Math.max(0, Math.min(discount, priceCents - MIN_PRICE));
  if (discount <= 0) return bad("Ce code ne s'applique pas à ce trajet.");
  return { ok: true, code, discountCents: discount, label: p.kind === "percent" ? `−${p.value} %` : `−${euro(p.value)}` };
}

/** Applique la remise : le prix et l'acompte sont recalculés sur le montant réduit. */
export function applyDiscount(q: Quote, discountCents: number, p: Pricing): Quote {
  const priceCents = q.priceCents - discountCents;
  const dep = Math.max(50, Math.round((priceCents * p.depositPct) / 100 / 100) * 100);
  return { ...q, priceCents, fullCents: priceCents, depositCents: Math.min(dep, priceCents) };
}
