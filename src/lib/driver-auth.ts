import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db, dbConfigured } from "./supabase";

export type Driver = {
  id: string; active: boolean; name: string; email: string; phone: string | null; company: string | null; legal_form: string | null;
  siret: string | null; address: string | null; registre: string | null; carte_vtc: string | null; vehicule: string | null;
  plaque: string | null; insurer: string | null; vat_note: string | null; logo?: string | null;
};

const COOKIE = "lt_driver";
const TTL_S = 60 * 60 * 24 * 14; // 14 jours
const secret = () => {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 24) throw new Error("ADMIN_SESSION_SECRET manquant ou trop court");
  return s;
};
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");
const eq = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(pw, salt, 64).toString("hex")}`;
}
export function verifyPassword(pw: string, stored: string): boolean {
  const [alg, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  return eq(scryptSync(pw, salt, 64).toString("hex"), hash);
}
export const newPassword = () => randomBytes(9).toString("base64url"); // 12 caractères

export async function startDriverSession(id: string) {
  const exp = Math.floor(Date.now() / 1000) + TTL_S;
  (await cookies()).set(COOKIE, `${id}.${exp}.${sign(`driver:${id}:${exp}`)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/chauffeur", maxAge: TTL_S,
  });
}
export async function endDriverSession() { (await cookies()).delete({ name: COOKIE, path: "/chauffeur" }); }

export async function currentDriver(): Promise<Driver | null> {
  if (!dbConfigured()) return null;
  try {
    const v = (await cookies()).get(COOKIE)?.value;
    if (!v) return null;
    const [id, exp, sig] = v.split(".");
    if (!id || !exp || !sig || Number(exp) < Date.now() / 1000 || !eq(sig, sign(`driver:${id}:${exp}`))) return null;
    const { data } = await db().from("drivers").select("*").eq("id", id).eq("active", true).maybeSingle();
    return (data as Driver) ?? null;
  } catch { return null; }
}

// Jeton du lien d'abonnement agenda de ce chauffeur.
export const driverAgendaToken = (id: string) => createHmac("sha256", secret()).update(`agenda-driver:${id}`).digest("hex").slice(0, 40);
