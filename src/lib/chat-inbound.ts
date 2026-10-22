import PostalMime from "postal-mime";
import { db } from "@/lib/supabase";
import { addVisitorMessage, adminReply, cleanBody } from "@/lib/chat";
import { findTag, tagMatches } from "@/lib/chat-tag";

// Réponse par e-mail à une discussion du site.
// Cloudflare Email Routing transmet les e-mails reçus sur chat@nordvtc.fr au Worker (custom-worker.ts),
// qui les passe ici. On retrouve la conversation grâce au repère signé de l'objet, puis on vérifie l'expéditeur :
// le chauffeur (MAIL_NOTIFY_TO) → réponse du chauffeur ; l'e-mail laissé par le visiteur → message du visiteur.

const QUOTE_INTRO = /^(le|on)\s.+/i;
const WROTE = /(a écrit|wrote|schreef|escribió|ha scritto)\s*:?\s*$/i;

/** Garde uniquement le nouveau texte : coupe la partie citée, la signature et « Envoyé de mon iPhone ». */
export function stripReply(text: string) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (/^>/.test(l)) break;
    if (/^-{2,}\s*(original message|message d'origine|forwarded|message transféré)/i.test(l)) break;
    if (/^_{6,}$/.test(l)) break;
    if (/^(de|from)\s*:\s*.+@/i.test(l)) break;
    if (/^--\s?$/.test(lines[i])) break; // séparateur de signature standard
    if (QUOTE_INTRO.test(l) && (WROTE.test(l) || WROTE.test(`${l} ${lines[i + 1]?.trim() ?? ""}`) || WROTE.test(`${l} ${lines[i + 1]?.trim() ?? ""} ${lines[i + 2]?.trim() ?? ""}`))) break;
    out.push(lines[i]);
  }
  return out.join("\n").trim()
    .replace(/\n\s*(envoyé de mon|sent from my|envoyé depuis|get outlook for)[^\n]*$/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const htmlToText = (h: string) => h
  .replace(/<blockquote[\s\S]*$/i, "") // Gmail / Apple Mail : la citation commence ici
  .replace(/<div class="gmail_quote[\s\S]*$/i, "")
  .replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div)>/gi, "\n").replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');

/** Vérifie la signature DKIM indiquée par Cloudflare pour le domaine de l'expéditeur (si l'en-tête est présent). */
function dkimOk(headers: { key: string; value: string }[], sender: string) {
  const domain = sender.split("@")[1] ?? "";
  const res = headers.filter((h) => /^(arc-)?authentication-results$/i.test(h.key) && /cloudflare/i.test(h.value)).map((h) => h.value);
  if (!res.length) return true; // pas d'information : on s'appuie sur le repère signé + l'adresse
  return res.some((v) => new RegExp(`dkim=pass[^;]*header\\.(d|i)=@?${domain.replace(/\./g, "\\.")}`, "i").test(v));
}

export async function handleInboundChatEmail(raw: ArrayBuffer | string, envelopeFrom: string): Promise<{ ok: true; as: "admin" | "visitor" } | { error: string }> {
  const mail = await PostalMime.parse(raw);
  const h = mail.headers ?? [];
  const auto = h.find((x) => x.key === "auto-submitted")?.value;
  if ((auto && !/^no$/i.test(auto)) || /bulk|junk|list/i.test(h.find((x) => x.key === "precedence")?.value ?? "")) return { error: "auto" };

  const sender = (mail.from?.address || envelopeFrom || "").trim().toLowerCase();
  const tag = findTag(mail.subject ?? "") ?? findTag(mail.text ?? "") ?? findTag(mail.html ?? "");
  if (!tag) return { error: "Réponse non reconnue : gardez l'objet d'origine (avec le repère #…) quand vous répondez." };

  const lo = `${tag.prefix}-0000-0000-0000-000000000000`, hi = `${tag.prefix}-ffff-ffff-ffff-ffffffffffff`;
  const { data: threads } = await db().from("chat_threads").select("*").gte("id", lo).lte("id", hi).limit(5);
  const t = (threads ?? []).find((x) => tagMatches(x.id as string, tag.sig));
  if (!t) return { error: "Conversation introuvable ou repère invalide." };

  const admin = (process.env.MAIL_NOTIFY_TO ?? "").trim().toLowerCase();
  const visitor = (t.visitor_email as string | null)?.toLowerCase() ?? "";
  const as = sender && sender === admin ? "admin" : sender && sender === visitor ? "visitor" : null;
  if (!as) return { error: "Cette adresse n'est pas autorisée à répondre à cette conversation." };
  if (!dkimOk(h, sender)) return { error: "E-mail non authentifié (DKIM) : réponse ignorée." };

  const text = mail.text?.trim() ? mail.text : htmlToText(mail.html ?? "");
  const body = cleanBody(stripReply(text));
  if (!body) return { error: "Message vide : écrivez votre réponse au-dessus du message d'origine." };

  if (as === "admin") {
    const r = await adminReply(t.id as string, body);
    return "error" in r && r.error ? { error: r.error } : { ok: true, as };
  }
  const r = await addVisitorMessage(t as Parameters<typeof addVisitorMessage>[0], body);
  return "error" in r && r.error ? { error: r.error } : { ok: true, as };
}
