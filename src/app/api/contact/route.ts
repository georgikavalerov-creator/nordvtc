import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { allow, clientIp } from "@/lib/ratelimit";
import { SITE } from "@/lib/site";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().max(120).optional(),
  message: z.string().trim().min(5).max(2000),
  website: z.string().max(0).optional(), // champ piège anti-robots : doit rester vide
});

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  if (!allow(`contact:${clientIp(req)}`, 5, 10 * 60_000)) {
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
    await new Resend(key).emails.send({
      from: process.env.MAIL_FROM ?? `${SITE.name} <onboarding@resend.dev>`,
      to,
      replyTo: d.email,
      subject: `Contact — ${d.subject || "demande"} (${d.name})`,
      html: `<p><strong>${esc(d.name)}</strong> — ${esc(d.email)}${d.phone ? ` — ${esc(d.phone)}` : ""}</p>
             <p><strong>Sujet</strong> ${esc(d.subject || "—")}</p>
             <p>${esc(d.message).replace(/\n/g, "<br>")}</p>`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("contact", e);
    return NextResponse.json({ error: "Envoi impossible pour le moment." }, { status: 500 });
  }
}
