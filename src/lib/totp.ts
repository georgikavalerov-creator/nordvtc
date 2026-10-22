import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { db, dbConfigured } from "./supabase";

// Double authentification (TOTP, RFC 6238) : code à 6 chiffres d'une application (Google Authenticator,
// Mots de passe d'iPhone, 1Password…). Secret stocké en base, accessible au serveur uniquement.
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function b32encode(buf: Buffer) {
  let bits = 0, value = 0, out = "";
  for (const b of buf) { value = (value << 8) | b; bits += 8; while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}
function b32decode(s: string) {
  const clean = s.replace(/=+$/, "").toUpperCase().replace(/\s/g, "");
  let bits = 0, value = 0; const out: number[] = [];
  for (const c of clean) { const i = B32.indexOf(c); if (i < 0) continue; value = (value << 5) | i; bits += 5; if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; } }
  return Buffer.from(out);
}
function hotp(secret: string, counter: number) {
  const msg = Buffer.alloc(8); msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", b32decode(secret)).update(msg).digest();
  const o = h[h.length - 1] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}
/** Étape de temps acceptée (±30 s de dérive), ou -1. */
export function totpStep(secret: string, code: string, at = Date.now()) {
  const c = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(c)) return -1;
  const now = Math.floor(at / 30_000);
  for (const d of [0, -1, 1]) { const g = hotp(secret, now + d); if (timingSafeEqual(Buffer.from(g), Buffer.from(c))) return now + d; }
  return -1;
}
export const newSecret = () => b32encode(randomBytes(20));
export const otpauthUri = (secret: string) => `otpauth://totp/Nord%20VTC:Administration?secret=${secret}&issuer=Nord%20VTC&algorithm=SHA1&digits=6&period=30`;

export type TwoFA = { secret?: string; pending?: string; enabled?: boolean; lastStep?: number; email?: boolean; sms?: boolean; backup?: string[]; emailCode?: { h: string; exp: number; tries: number }; smsAt?: number };
export async function get2fa(): Promise<TwoFA> {
  if (!dbConfigured()) return {};
  const { data } = await db().from("settings").select("value").eq("key", "admin_2fa").maybeSingle();
  return (data?.value as TwoFA) ?? {};
}
export async function set2fa(v: TwoFA) {
  await db().from("settings").upsert({ key: "admin_2fa", value: v, updated_at: new Date().toISOString() });
}
/** Vérifie le code de connexion et empêche sa réutilisation (rejeu). */
export async function check2faLogin(code: string): Promise<boolean> {
  const t = await get2fa();
  if (!t.enabled || !t.secret) return true;
  const step = totpStep(t.secret, code);
  if (step < 0 || (t.lastStep ?? -1) >= step) return false;
  await set2fa({ ...t, lastStep: step });
  return true;
}
