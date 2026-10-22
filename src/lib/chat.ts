import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { after } from "next/server";
import { db } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import { sendChatNotice, sendChatReplyNotice } from "@/lib/mail";

// Discussion en direct sans compte : le visiteur reçoit un identifiant + un jeton secret (gardés dans son navigateur).
// Seule l'empreinte du jeton est stockée. Le chauffeur répond depuis l'administration (/admin/messages).

export type ChatMsg = { id: number; created_at: string; sender: "visitor" | "admin"; body: string };

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
export const ipHash = (ip: string) => sha(`chat:${ip}:${process.env.ADMIN_SESSION_SECRET ?? ""}`).slice(0, 32);
export const cleanBody = (s: unknown) => String(s ?? "").replace(/\r\n/g, "\n").trim().slice(0, 1500);
const okEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 200;

// Clé de reprise (lien envoyé par e-mail) : permet de rouvrir la discussion depuis un autre appareil.
export const resumeKey = (id: string) => "r_" + createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "nordvtc").update(`chat:${id}`).digest("base64url").slice(0, 32);

export async function threadFor(id: unknown, token: unknown) {
  if (typeof id !== "string" || typeof token !== "string" || !/^[0-9a-f-]{36}$/.test(id) || token.length < 20) return null;
  const { data } = await db().from("chat_threads").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  if (token.startsWith("r_")) { const k = resumeKey(id); return token.length === k.length && timingSafeEqual(Buffer.from(token), Buffer.from(k)) ? data : null; }
  const a = Buffer.from(sha(token)), b = Buffer.from(data.token_hash as string);
  return a.length === b.length && timingSafeEqual(a, b) ? data : null;
}

export async function startThread(opts: { message: string; name?: string; email?: string; page?: string; ip: string }) {
  const ih = ipHash(opts.ip);
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await db().from("chat_threads").select("id", { count: "exact", head: true }).eq("ip_hash", ih).gte("created_at", since);
  if ((count ?? 0) >= 5) return { error: "Trop de conversations ouvertes : réessayez plus tard ou écrivez à contact@nordvtc.fr." };
  const token = randomBytes(24).toString("base64url");
  const email = opts.email?.trim().toLowerCase() || "";
  const { data, error } = await db().from("chat_threads").insert({
    token_hash: sha(token), visitor_name: opts.name?.trim().slice(0, 80) || null, visitor_email: email && okEmail(email) ? email : null,
    page: opts.page?.slice(0, 200) || null, ip_hash: ih,
  }).select("*").single();
  if (error || !data) { console.error("chat start", error); return { error: "Impossible d'ouvrir la discussion pour le moment." }; }
  await addVisitorMessage(data, opts.message);
  return { id: data.id as string, token };
}

type Thread = { id: string; notified_at: string | null; last_admin_at: string | null; visitor_name: string | null; visitor_email: string | null; page: string | null };

export async function addVisitorMessage(t: Thread, body: string) {
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await db().from("chat_messages").select("id", { count: "exact", head: true }).eq("thread_id", t.id).eq("sender", "visitor").gte("created_at", since);
  if ((count ?? 0) >= 8) return { error: "Patientez quelques secondes avant d'envoyer un autre message." };
  const { data, error } = await db().from("chat_messages").insert({ thread_id: t.id, sender: "visitor", body }).select("*").single();
  if (error || !data) return { error: "Message non envoyé, réessayez." };
  const now = new Date().toISOString();
  // Réponse immédiate au visiteur : la mise à jour de la conversation et l'e-mail au chauffeur partent après.
  after(async () => {
    await db().from("chat_threads").update({ last_visitor_at: now, visitor_seen_at: now, closed: false, notified_at: now }).eq("id", t.id);
    await sendChatNotice({ threadId: t.id, name: t.visitor_name, email: t.visitor_email, page: t.page, body, url: `${SITE.url}/admin/messages?t=${t.id}` }).catch((e) => console.error("chat mail", e));
  });
  return { message: data as ChatMsg };
}

export async function messagesAfter(threadId: string, after: number) {
  const { data } = await db().from("chat_messages").select("id,created_at,sender,body").eq("thread_id", threadId).gt("id", after).order("id").limit(200);
  return (data as ChatMsg[]) ?? [];
}

/** Réponse du chauffeur ; prévient le visiteur par e-mail s'il a laissé son adresse et n'est plus sur le site. */
export async function adminReply(threadId: string, body: string) {
  const { data: t } = await db().from("chat_threads").select("*").eq("id", threadId).maybeSingle();
  if (!t) return { error: "Conversation introuvable." };
  const { error } = await db().from("chat_messages").insert({ thread_id: threadId, sender: "admin", body });
  if (error) return { error: "Réponse non envoyée." };
  const now = new Date().toISOString();
  await db().from("chat_threads").update({ last_admin_at: now, admin_seen_at: now }).eq("id", threadId);
  const away = Date.now() - new Date(t.visitor_seen_at).getTime() > 90_000;
  if (away && t.visitor_email) after(async () => {
    await sendChatReplyNotice({ threadId, email: t.visitor_email, name: t.visitor_name, body, url: `${SITE.url}/?chat=${threadId}.${resumeKey(threadId)}` }).catch((e) => console.error("chat reply mail", e));
  });
  return { ok: true };
}

export const validEmail = okEmail;
