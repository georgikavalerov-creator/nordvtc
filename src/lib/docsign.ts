import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export type DocType = "bon" | "note" | "facture";
const dev = randomBytes(24).toString("hex");
const secret = () => process.env.CALLBACK_SECRET || process.env.ADMIN_SESSION_SECRET || dev;
const sig = (t: string, id: string) => createHmac("sha256", secret()).update(`doc:${t}:${id}`).digest("hex").slice(0, 32);

/** Lien signé : donne accès à un document sans connexion (e-mail, chauffeur en contrôle). Impossible à deviner. */
export const docPath = (t: DocType, id: string) => `/doc/${t}/${id}?k=${sig(t, id)}`;
export function verifyDoc(t: string, id: string, k: unknown): boolean {
  if (typeof k !== "string" || !["bon", "note", "facture"].includes(t)) return false;
  const a = Buffer.from(sig(t, id)), b = Buffer.from(k);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Lien de suivi d'une réservation, sans compte : l'identifiant (UUID) + une signature, impossibles à deviner. */
export const trackKey = (id: string) => sig("suivi", id);
export const trackPath = (id: string) => `/reservation/suivi/${id}?k=${trackKey(id)}`;
export function verifyTrack(id: string, k: unknown): boolean {
  if (typeof k !== "string") return false;
  const a = Buffer.from(trackKey(id)), b = Buffer.from(k);
  return a.length === b.length && timingSafeEqual(a, b);
}
