// Protection du numéro de téléphone : il n'est jamais présent dans le HTML ni dans le JavaScript du site.
// Il n'est renvoyé que par /api/callback/verify, après un formulaire valide + un code reçu par SMS.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/mobile";

const devSecret = randomBytes(24).toString("hex");
const secret = () => process.env.CALLBACK_SECRET || process.env.ADMIN_SESSION_SECRET || devSecret;

const sign = (p: string) => createHmac("sha256", secret()).update(p).digest("hex");

/** Jeton horodaté : prouve que le formulaire a été affiché il y a X secondes (anti-robots trop rapides). */
export function makeFormToken(): string {
  const ts = String(Date.now());
  return `${ts}.${sign(ts)}`;
}
export function checkFormToken(tok: unknown, minAgeMs = 4000, maxAgeMs = 2 * 3_600_000): boolean {
  if (typeof tok !== "string") return false;
  const [ts, sig] = tok.split(".");
  if (!ts || !sig) return false;
  const good = Buffer.from(sign(ts));
  const given = Buffer.from(sig);
  if (good.length !== given.length || !timingSafeEqual(good, given)) return false;
  const age = Date.now() - Number(ts);
  return age >= minAgeMs && age <= maxAgeMs;
}

export type Country = { code: CountryCode; dial: string; label: string; flag: string };
/** France et pays voisins (+ proches). */
export const COUNTRIES: Country[] = [
  { code: "FR", dial: "+33", label: "France", flag: "🇫🇷" },
  { code: "BE", dial: "+32", label: "Belgique", flag: "🇧🇪" },
  { code: "LU", dial: "+352", label: "Luxembourg", flag: "🇱🇺" },
  { code: "DE", dial: "+49", label: "Allemagne", flag: "🇩🇪" },
  { code: "CH", dial: "+41", label: "Suisse", flag: "🇨🇭" },
  { code: "IT", dial: "+39", label: "Italie", flag: "🇮🇹" },
  { code: "ES", dial: "+34", label: "Espagne", flag: "🇪🇸" },
  { code: "AD", dial: "+376", label: "Andorre", flag: "🇦🇩" },
  { code: "MC", dial: "+377", label: "Monaco", flag: "🇲🇨" },
  { code: "GB", dial: "+44", label: "Royaume-Uni", flag: "🇬🇧" },
  { code: "NL", dial: "+31", label: "Pays-Bas", flag: "🇳🇱" },
  { code: "PT", dial: "+351", label: "Portugal", flag: "🇵🇹" },
];
const ALLOWED = new Set<string>(COUNTRIES.map((c) => c.code));
export const guessCountry = (req: Request): CountryCode => {
  const c = (req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "").toUpperCase();
  return (ALLOWED.has(c) ? c : "FR") as CountryCode;
};

/** Normalise en E.164 (vrai contrôle par pays) et refuse les numéros bidon évidents. */
export function normalizePhone(raw: string, country: string = "FR"): string | null {
  const def = (ALLOWED.has(country) ? country : "FR") as CountryCode;
  const n = parsePhoneNumberFromString(raw.trim(), def);
  if (!n || !n.isValid() || !n.country || !ALLOWED.has(n.country)) return null;
  const t = n.getType();
  if (t && t !== "MOBILE" && t !== "FIXED_LINE_OR_MOBILE") return null;
  const nat = n.nationalNumber;
  if (/(\d)\1{5,}/.test(nat)) return null;
  if (/(?:0123456|1234567|2345678|3456789|9876543|8765432)/.test(nat)) return null;
  return n.number;
}

export function otpConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SID);
}

async function twilio(path: string, body: Record<string, string>) {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const res = await fetch(`https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SID}/${path}`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });
  const data = (await res.json().catch(() => ({}))) as { status?: string; code?: number; message?: string };
  if (!res.ok) console.error(`twilio:${path}:${res.status}`, JSON.stringify({ code: data.code, message: data.message }));
  return { ok: res.ok, data };
}
export async function sendOtp(phone: string) {
  return (await twilio("Verifications", { To: phone, Channel: "sms", Locale: "fr" })).ok;
}
export async function checkOtp(phone: string, code: string) {
  const r = await twilio("VerificationCheck", { To: phone, Code: code });
  return r.ok && r.data.status === "approved";
}

/** Cloudflare Turnstile (anti-robots invisible), actif seulement si les clés sont renseignées. */
export function turnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET && process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY);
}
export async function checkTurnstile(token: unknown, _ip?: string): Promise<boolean> {
  if (!turnstileConfigured()) return true;
  if (typeof token !== "string" || !token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    // Pas d'IP transmise : avec un VPN ou le Relais privé iCloud, l'IP change entre le navigateur et le serveur et ferait échouer la vérification.
    body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET!, response: token }),
  });
  const d = (await res.json().catch(() => ({}))) as { success?: boolean };
  return d.success === true;
}

/** Plafond global de révélations par jour (limite les dégâts en cas d'attaque distribuée). */
let day = "", count = 0;
export function dailyCapOk(max = 150): boolean {
  const d = new Date().toISOString().slice(0, 10);
  if (d !== day) { day = d; count = 0; }
  if (count >= max) return false;
  count++;
  return true;
}
