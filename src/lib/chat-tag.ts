import { createHmac, timingSafeEqual } from "node:crypto";

// Repère placé dans l'objet des e-mails de discussion : « #5f3a9c2e-a1b2c3d4 ».
// Les 8 premiers caractères identifient la conversation, la suite est une signature :
// impossible de deviner le repère d'une autre conversation pour y écrire.
export const CHAT_INBOX = process.env.CHAT_INBOX || "chat@nordvtc.fr";

const sig = (id: string) => createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "nordvtc").update(`chat-mail:${id}`).digest("hex").slice(0, 8);

export const chatTag = (threadId: string) => `#${threadId.slice(0, 8)}-${sig(threadId)}`;

/** Extrait le repère d'un objet ou d'un texte : { prefix, sig } ou null. */
export function findTag(s: string) {
  const m = /#([0-9a-f]{8})-([0-9a-f]{8})\b/i.exec(s);
  return m ? { prefix: m[1].toLowerCase(), sig: m[2].toLowerCase() } : null;
}

export function tagMatches(threadId: string, s: string) {
  const a = Buffer.from(sig(threadId)), b = Buffer.from(s);
  return a.length === b.length && timingSafeEqual(a, b);
}
