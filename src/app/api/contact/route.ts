import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactNotice } from "@/lib/mail";
import { allow, clientIp, allowDurable } from "@/lib/ratelimit";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().max(120).optional(),
  message: z.string().trim().min(5).max(2000),
  website: z.string().max(0).optional(), // champ piège anti-robots : doit rester vide
});


export async function POST(req: Request) {
  if (!(await allowDurable(`contact:${clientIp(req)}`, 5, 10 * 60_000))) {
    return NextResponse.json({ error: "Trop de messages, réessayez plus tard." }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Merci de vérifier les champs du formulaire." }, { status: 400 });
  const d = parsed.data;

  const key = process.env.RESEND_API_KEY;
  const to = process.env.MAIL_NOTIFY_TO;
  if (!key || !to) {
    return NextResponse.json({ error: "Le formulaire n'est pas encore actif. Merci d'appeler ou d'écrire directement." }, { status: 503 });
  }
  try {
    await sendContactNotice(d);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("contact", e);
    return NextResponse.json({ error: "Envoi impossible pour le moment." }, { status: 500 });
  }
}
