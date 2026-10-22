import { NextResponse } from "next/server";
import { sameSiteOrLog } from "@/lib/same-site";
import { guard, guardVisitor } from "@/lib/security-log";
import { allow, clientIp, allowVisitor } from "@/lib/ratelimit";
import { dbConfigured, db } from "@/lib/supabase";
import { addVisitorMessage, cleanBody, messagesAfter, startThread, threadFor, validEmail } from "@/lib/chat";

export const dynamic = "force-dynamic";
const H = { "Cache-Control": "no-store" };
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status, headers: H });

// GET ?id&token&after : nouveaux messages (le widget n'interroge que lorsqu'il est ouvert).
export async function GET(req: Request) {
  if (!dbConfigured()) return bad("Indisponible", 503);
  const u = new URL(req.url);
  if (!allowVisitor(req, "chat-poll", 120, 60_000)) return bad("Trop de requêtes", 429);
  const t = await threadFor(u.searchParams.get("id"), u.searchParams.get("token"));
  if (!t) return bad("Discussion introuvable", 404);
  const after = Math.max(0, Number(u.searchParams.get("after")) || 0);
  const [messages] = await Promise.all([
    messagesAfter(t.id, after),
    u.searchParams.get("seen") === "1" ? db().from("chat_threads").update({ visitor_seen_at: new Date().toISOString() }).eq("id", t.id) : null,
  ]);
  return NextResponse.json({ messages, hasEmail: !!t.visitor_email, adminSeenAt: t.admin_seen_at ?? null }, { headers: H });
}

// POST { action: "start" | "send" | "email", … }
export async function POST(req: Request) {
  if (!(await sameSiteOrLog(req))) return bad("Non autorisé", 403);
  if (!dbConfigured()) return bad("Indisponible", 503);
  const ip = clientIp(req);
  if (!allowVisitor(req, "chat", 20, 60_000)) return bad("Trop de messages, patientez un instant.", 429);
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return bad("Requête invalide");
  if (typeof b.website === "string" && b.website) return NextResponse.json({ ok: true }, { headers: H }); // piège à robots
  if (b.action === "start") {
    const message = cleanBody(b.message);
    if (!message) return bad("Écrivez votre message.");
    const r = await startThread({ message, name: typeof b.name === "string" ? b.name : "", email: typeof b.email === "string" ? b.email : "", page: typeof b.page === "string" ? b.page : "", ip });
    return "error" in r ? bad(r.error as string, 429) : NextResponse.json(r, { headers: H });
  }
  const t = await threadFor(b.id, b.token);
  if (!t) return bad("Discussion introuvable", 404);
  if (b.action === "send") {
    const message = cleanBody(b.message);
    if (!message) return bad("Écrivez votre message.");
    const r = await addVisitorMessage(t, message);
    return "error" in r ? bad(r.error as string, 429) : NextResponse.json(r, { headers: H });
  }
  if (b.action === "email") {
    const email = String(b.email ?? "").trim().toLowerCase();
    if (!validEmail(email)) return bad("Adresse e-mail invalide.");
    await db().from("chat_threads").update({ visitor_email: email, ...(typeof b.name === "string" && b.name.trim() ? { visitor_name: b.name.trim().slice(0, 80) } : {}) }).eq("id", t.id);
    return NextResponse.json({ ok: true }, { headers: H });
  }
  return bad("Action inconnue");
}
