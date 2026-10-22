import { NextResponse } from "next/server";
import { z } from "zod";
import { allowDurable, clientIp } from "@/lib/ratelimit";
import { checkOtp, dailyCapOk, normalizePhone, otpConfigured } from "@/lib/callback";
import { saveLeadAndReveal } from "@/lib/lead";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string(),
  need: z.string().trim().max(300).optional(),
  code: z.string().regex(/^\d{4,8}$/),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
  if (!otpConfigured()) return fail("Non disponible.", 404);
  const p = schema.safeParse(await req.json().catch(() => null));
  const phone = p.success ? normalizePhone(p.data.phone) : null;
  if (!p.success || !phone) return fail("Code invalide.");
  if (!(await allowDurable(`cbv:${ip}`, 8, 10 * 60_000)) || !(await allowDurable(`cbv:${phone}`, 5, 10 * 60_000))) {
    return fail("Trop d'essais. Réessayez dans quelques minutes.", 429);
  }
  if (!(await checkOtp(phone, p.data.code))) return fail("Code incorrect ou expiré.", 422);
  if (!dailyCapOk(300)) return fail("Service momentanément saturé.", 503);
  const number = await saveLeadAndReveal({ name: p.data.name, phone, need: p.data.need, ip, verified: true });
  return NextResponse.json({ step: "done", number });
}
