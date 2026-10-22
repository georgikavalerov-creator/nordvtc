import { NextResponse } from "next/server";
import { sameSiteOrLog } from "@/lib/same-site";
import { guard } from "@/lib/security-log";
import { z } from "zod";
import { allowDurable, clientIp } from "@/lib/ratelimit";
import { checkFormToken, checkTurnstile, dailyCapOk, normalizePhone, otpConfigured, sendOtp } from "@/lib/callback";
import { saveLeadAndReveal } from "@/lib/lead";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(25),
  country: z.string().length(2).default("FR"),
  need: z.string().trim().max(300).optional(),
  consent: z.literal(true),
  website: z.string().max(0).optional(), // champ piège
  token: z.string(),
  captcha: z.string().optional(),
});

export async function POST(req: Request) {
  if (!(await sameSiteOrLog(req))) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  const ip = clientIp(req);
  const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
  if (!(await guard(req, `cb:${ip}`, 5, 10 * 60_000))) return fail("Trop de tentatives, réessayez dans quelques minutes.", 429);

  const body = await req.json().catch(() => null);
  const p = schema.safeParse(body);
  if (!p.success) return fail("Merci de compléter tous les champs.");
  const d = p.data;
  if (!checkFormToken(d.token)) return fail("Formulaire trop rapide ou expiré. Rechargez la page et réessayez.");
  if (!(await checkTurnstile(d.captcha, ip))) return fail("Vérification anti-robot échouée. Réessayez.");
  if (!/\p{L}{2}/u.test(d.name) || /https?:|www\./i.test(d.name + (d.need ?? ""))) return fail("Nom invalide.");

  const phone = normalizePhone(d.phone, d.country);
  if (!phone) return fail("Numéro de mobile invalide pour le pays choisi.");
  if (!(await guard(req, `cbp:${phone}`, 3, 3_600_000))) return fail("Trop de demandes pour ce numéro. Réessayez plus tard.", 429);

  if (otpConfigured()) {
    if (!dailyCapOk(300) || !(await guard(req, "sms:day", 300, 86_400_000))) return fail("Service momentanément saturé. Utilisez le formulaire de contact.", 503);
    const ok = await sendOtp(phone);
    if (!ok) return fail("Impossible d'envoyer le SMS. Vérifiez le numéro.", 422);
    return NextResponse.json({ step: "code", phone });
  }
  // Sans fournisseur de SMS : contrôles de format, anti-robots et limites seulement.
  if (!dailyCapOk(60) || !(await guard(req, "lead:day", 60, 86_400_000))) return fail("Service momentanément saturé. Utilisez le formulaire de contact.", 503);
  const num = await saveLeadAndReveal({ name: d.name, phone, need: d.need, ip, verified: false });
  return NextResponse.json({ step: "done", number: num });
}
