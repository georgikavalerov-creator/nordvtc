import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { get2fa, set2fa, totpStep } from "./totp";
import { send } from "./mail";
import { layout, p, note } from "./mail-layout";
import { checkOtp, otpConfigured, sendOtp, normalizePhone } from "./callback";
import { getSiteSettings } from "./content";

// Double authentification à plusieurs méthodes : application (TOTP), code par e-mail, code par SMS, codes de secours.
const PRE = "lt_pre";
const key = () => process.env.ADMIN_SESSION_SECRET ?? "";
const hash = (v: string) => createHmac("sha256", key()).update(`2fa:${v}`).digest("hex");
const eq = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export type Methods = { app: boolean; email: boolean; sms: boolean; backup: number };
export async function methods(): Promise<Methods> {
  const t = await get2fa();
  return { app: !!(t.enabled && t.secret), email: !!t.email, sms: !!t.sms && otpConfigured(), backup: (t.backup ?? []).length };
}
export const required = (m: Methods) => m.app || m.email || m.sms;

async function adminPhone() {
  const raw = (await getSiteSettings()).driverPhone || process.env.DRIVER_PHONE || "";
  return normalizePhone(raw, "FR");
}

// Étape intermédiaire (mot de passe validé) : seule autorisation pour se faire envoyer un code.
export async function markPasswordOk() {
  const exp = Math.floor(Date.now() / 1000) + 600;
  (await cookies()).set(PRE, `${exp}.${hash(`pre:${exp}`)}`, { httpOnly: true, secure: true, sameSite: "strict", path: "/admin", maxAge: 600 });
}
export async function passwordOk() {
  const v = (await cookies()).get(PRE)?.value ?? "";
  const [exp, sig] = v.split(".");
  return !!exp && !!sig && Number(exp) > Date.now() / 1000 && eq(sig, hash(`pre:${exp}`));
}
export async function clearPre() { (await cookies()).delete({ name: PRE, path: "/admin" }); }

/** Envoie un code de connexion par e-mail ou SMS (après le mot de passe uniquement). */
export async function sendLoginCode(via: "email" | "sms"): Promise<string> {
  const t = await get2fa();
  if (via === "email") {
    if (!t.email) return "Méthode non activée.";
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    await set2fa({ ...t, emailCode: { h: hash(code), exp: Date.now() + 10 * 60_000, tries: 0 } });
    const to = process.env.MAIL_NOTIFY_TO;
    if (!to) return "Adresse e-mail non configurée.";
    await send(to, `Code de connexion : ${code}`, layout({ audience: "admin", preheader: `Code : ${code} (valable 10 minutes)`, title: `Votre code : ${code}`, body: p("Code de connexion à l'administration Nord VTC, valable 10 minutes.") + note("Vous n'avez pas essayé de vous connecter ? Quelqu'un connaît votre mot de passe : changez-le immédiatement et consultez Administration → Sécurité.", "red") }));
    return "";
  }
  if (!t.sms || !otpConfigured()) return "Méthode non activée.";
  const phone = await adminPhone();
  if (!phone) return "Numéro non configuré.";
  if (!(await sendOtp(phone))) return "SMS non envoyé, réessayez.";
  await set2fa({ ...t, smsAt: Date.now() });
  return "";
}

/** Vérifie un code (application, e-mail, SMS ou code de secours). Usage unique. */
export async function verifyLoginCode(input: string): Promise<boolean> {
  const t = await get2fa();
  const code = input.trim().toUpperCase().replace(/\s/g, "");
  // Code de secours : XXXX-XXXX
  if (/^[A-Z0-9]{4}-?[A-Z0-9]{4}$/.test(code) && !/^\d{6}$/.test(code)) {
    const h = hash(code.replace("-", ""));
    const list = t.backup ?? [];
    const i = list.findIndex((x) => eq(x, h));
    if (i < 0) return false;
    list.splice(i, 1);
    await set2fa({ ...t, backup: list });
    return true;
  }
  if (!/^\d{6}$/.test(code)) return false;
  if (t.enabled && t.secret) {
    const step = totpStep(t.secret, code);
    if (step >= 0 && (t.lastStep ?? -1) < step) { await set2fa({ ...t, lastStep: step }); return true; }
  }
  if (t.email && t.emailCode && t.emailCode.exp > Date.now() && t.emailCode.tries < 5) {
    if (eq(t.emailCode.h, hash(code))) { await set2fa({ ...t, emailCode: undefined }); return true; }
    await set2fa({ ...t, emailCode: { ...t.emailCode, tries: t.emailCode.tries + 1 } });
  }
  if (t.sms && t.smsAt && Date.now() - t.smsAt < 10 * 60_000) {
    const phone = await adminPhone();
    if (phone && (await checkOtp(phone, code))) { await set2fa({ ...t, smsAt: undefined }); return true; }
  }
  return false;
}

/** 10 codes de secours à usage unique (affichés une seule fois, stockés chiffrés). */
export async function newBackupCodes(): Promise<string[]> {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codes = Array.from({ length: 10 }, () => Array.from({ length: 8 }, () => A[randomInt(0, A.length)]).join(""));
  const t = await get2fa();
  await set2fa({ ...t, backup: codes.map((c) => hash(c)) });
  return codes.map((c) => `${c.slice(0, 4)}-${c.slice(4)}`);
}
export const fingerprint = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 8);
