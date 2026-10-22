import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { handleInboundChatEmail } from "@/lib/chat-inbound";
import { logSecurity } from "@/lib/security-log";

// Appelé uniquement par le gestionnaire e-mail du Worker (custom-worker.ts), dans le même processus.
// Protégé par le secret de session admin : inaccessible depuis l'extérieur.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  const key = req.headers.get("x-inbound-key") ?? "";
  if (!secret || key.length !== secret.length || !timingSafeEqual(Buffer.from(key), Buffer.from(secret))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const raw = await req.arrayBuffer();
  if (raw.byteLength > 10 * 1024 * 1024) return NextResponse.json({ error: "E-mail trop volumineux." }, { status: 413 });
  try {
    const r = await handleInboundChatEmail(raw, req.headers.get("x-mail-from") ?? "");
    if ("error" in r) {
      console.warn("chat inbound refusé:", r.error);
      if (r.error !== "auto") await logSecurity("mail_rejected", req, { from: req.headers.get("x-mail-from"), reason: r.error });
      return NextResponse.json(r, { status: r.error === "auto" ? 202 : 422 });
    }
    return NextResponse.json(r);
  } catch (e) {
    console.error("chat inbound", e);
    return NextResponse.json({ error: "Erreur de traitement." }, { status: 500 });
  }
}
