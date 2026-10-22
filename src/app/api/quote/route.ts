import { NextResponse } from "next/server";
import { sameSiteOrLog } from "@/lib/same-site";
import { guard } from "@/lib/security-log";
import { z } from "zod";
import { routeSummary } from "@/lib/here";
import { computeQuote } from "@/lib/pricing";
import { getPricing } from "@/lib/supabase";
import { allow, clientIp, allowDurable } from "@/lib/ratelimit";
import { applyDiscount, validatePromo } from "@/lib/promo";
import { currentUser } from "@/lib/auth";

const point = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });
const schema = z.object({
  origin: point,
  dest: point,
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  returnTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  returnOrigin: point.optional(),
  returnDest: point.optional(),
  promo: z.string().max(40).optional(),
  email: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  if (!(await sameSiteOrLog(req))) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  if (!(await guard(req, `quote-day:${clientIp(req)}`, 300, 86_400_000))) return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  if (!allow(`quote:${clientIp(req)}`, 40, 60_000)) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const { origin, dest, time, returnTime, returnOrigin, returnDest, promo, email } = parsed.data;
  try {
    const [pricing, route] = await Promise.all([getPricing(), routeSummary(origin, dest)]);
    if (route.distanceM / 1000 > pricing.maxDistanceKm) {
      return NextResponse.json(
        { error: "Trajet très long : contactez-nous pour un devis personnalisé." },
        { status: 422 },
      );
    }
    const hour = time ? Number(time.slice(0, 2)) : 12;
    let quote = computeQuote(route.distanceM, route.durationS, hour, pricing);
    let promoOut: { code: string; discountCents: number; label: string } | { error: string } | undefined;
    if (promo?.trim()) {
      if (!(await guard(req, `promo:${clientIp(req)}`, 15, 10 * 60_000))) return NextResponse.json({ error: "Trop d'essais de code, réessayez plus tard." }, { status: 429 });
      const user = await currentUser();
      const r = await validatePromo(promo, quote.priceCents, { userId: user?.id, email: email ?? user?.email });
      if (r.ok) { promoOut = { code: r.code, discountCents: r.discountCents, label: r.label }; quote = { ...applyDiscount(quote, r.discountCents, pricing) }; }
      else promoOut = { error: r.error };
    }
    // Retour : même trajet en sens inverse, ou adresses choisies par le client.
    const back = returnTime && returnOrigin && returnDest ? await routeSummary(returnOrigin, returnDest) : route;
    if (returnTime && back.distanceM / 1000 > pricing.maxDistanceKm) return NextResponse.json({ error: "Retour très long : contactez-nous pour un devis personnalisé." }, { status: 422 });
    const returnQuote = returnTime ? computeQuote(back.distanceM, back.durationS, Number(returnTime.slice(0, 2)), pricing) : undefined;
    return NextResponse.json({ quote, returnQuote, promo: promoOut, depositPct: pricing.depositPct, minLeadHours: pricing.minLeadHours });
  } catch (e) {
    console.error("quote", e);
    return NextResponse.json({ error: "Calcul du prix indisponible pour le moment" }, { status: 503 });
  }
}
