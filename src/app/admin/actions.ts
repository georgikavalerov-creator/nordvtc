"use server";
import { pushBookingToIcloud } from "@/lib/icloud-push";
import { deletePasskey, listPasskeys, loginOptions, loginVerify, registrationOptions, registrationVerify } from "@/lib/passkey";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
import { checkPhoto } from "@/lib/photo";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/admin-auth";
import { allow, allowDurable, ipFrom } from "@/lib/ratelimit";
import { db } from "@/lib/supabase";
import { DEFAULT_PRICING } from "@/lib/pricing";
import { sendInvoiceEmail } from "@/lib/mail";
import { sendInvoiceToTiime, sendPendingToTiime } from "@/lib/tiime";
import { after } from "next/server";
import { guard, logSecurity } from "@/lib/security-log";
import { clearPre, markPasswordOk, methods, newBackupCodes, passwordOk, required, sendLoginCode, verifyLoginCode, type Methods } from "@/lib/twofa";
import { get2fa, set2fa, check2faLogin, newSecret, otpauthUri, totpStep } from "@/lib/totp";
import { docPath } from "@/lib/docsign";
import { SITE } from "@/lib/site";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { parseBody } from "@/lib/content";
import { createManual } from "@/lib/manual";
import { processLogo } from "@/lib/logo";
import { hashPassword, newPassword } from "@/lib/driver-auth";
import { decideClaimCore } from "@/lib/claim";
import { adminReply } from "@/lib/chat";

export type LoginState = { error?: string; need2fa?: boolean; methods?: Methods } | undefined;
export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const ip = ipFrom(await headers());
  // Anti force brute : 5 essais / 15 min par adresse IP, et 40 / heure au total (attaques réparties).
  if (!(await guard(undefined, `admin-login:${ip}`, 5, 15 * 60_000, "admin_login_blocked")) || !(await guard(undefined, "admin-login:all", 40, 3_600_000, "admin_login_blocked"))) return { error: "Trop de tentatives. Réessayez plus tard." };
  if (!checkPassword(String(form.get("password") ?? ""))) { await logSecurity("admin_login_fail"); await new Promise((r) => setTimeout(r, 600)); return { error: "Mot de passe incorrect." }; }
  // Double authentification (si activée) : application, e-mail, SMS ou code de secours, à usage unique.
  const m = await methods();
  if (required(m)) {
    await markPasswordOk();
    const code = String(form.get("code") ?? "").trim();
    if (!code) return { error: "Entrez votre code de vérification.", need2fa: true, methods: m };
    if (!(await verifyLoginCode(code))) { await logSecurity("admin_2fa_fail"); await new Promise((r) => setTimeout(r, 600)); return { error: "Code incorrect, expiré ou déjà utilisé.", need2fa: true, methods: m }; }
    await clearPre();
  }
  await logSecurity("admin_login_ok");
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin");
}

const num = (min: number, max: number) => z.coerce.number().min(min).max(max);
const pricingSchema = z.object({
  baseFare: num(0, 500),
  perKm: num(0, 20),
  perMinute: num(0, 20),
  minimumFare: num(0, 500),
  nightSurchargePct: num(0, 200),
  nightStartHour: num(0, 23),
  nightEndHour: num(0, 23),
  depositPct: num(1, 100),
  minLeadHours: num(0, 168),
  maxDistanceKm: num(10, 2000),
});

export async function savePricing(_: { error?: string; ok?: boolean } | undefined, form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const parsed = pricingSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Valeurs invalides : vérifiez les champs." };
  const value = { ...DEFAULT_PRICING, ...parsed.data };
  const { error } = await db().from("settings").upsert({ key: "pricing", value, updated_at: new Date().toISOString() });
  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveCosts(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const p = z.object({ fuelLPer100: z.coerce.number().min(0).max(40), fuelPricePerL: z.coerce.number().min(0).max(5) }).safeParse(Object.fromEntries(form));
  if (!p.success) return;
  await db().from("settings").upsert({ key: "costs", value: p.data, updated_at: new Date().toISOString() });
  revalidatePath("/admin");
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["confirmed", "completed", "cancelled"]),
});

export async function setStatus(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const parsed = statusSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  if (parsed.data.status === "completed") {
    // Fin de course : émission atomique de la facture numérotée sans rupture + envoi au client.
    const method = ["card", "cash", "none"].includes(String(form.get("method"))) ? String(form.get("method")) : "none";
    const { data: num } = await db().rpc("issue_invoice", { bid: parsed.data.id, method });
    if (num) {
      const { data: b } = await db().from("bookings").select("customer_name,customer_email").eq("id", parsed.data.id).single();
      if (b) await sendInvoiceEmail({ name: b.customer_name, email: b.customer_email, number: num as string, url: `${SITE.url}${docPath("facture", parsed.data.id)}` }).catch((e) => console.error("invoice mail", e));
      const bid = parsed.data.id;
      after(async () => { await sendInvoiceToTiime(bid).catch((e) => console.error("tiime", e)); });
    }
  } else {
    await db().from("bookings").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  }
  await pushBookingToIcloud(parsed.data.id);
  revalidatePath("/admin", "layout");
}

const promoSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,24}$/),
  kind: z.enum(["percent", "amount"]),
  value: z.coerce.number().min(1).max(100000),
  max_uses: z.coerce.number().int().min(1).optional().or(z.literal("").transform(() => undefined)),
  expires_at: z.string().optional(),
  min_price_eur: z.coerce.number().min(0).default(0),
});
export async function createPromo(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const p = promoSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return;
  const d = p.data;
  const value = d.kind === "percent" ? Math.min(100, Math.round(d.value)) : Math.round(d.value * 100); // € → centimes
  await db().from("promo_codes").upsert({
    code: d.code, kind: d.kind, value, max_uses: d.max_uses ?? null,
    expires_at: d.expires_at ? new Date(d.expires_at + "T23:59:59+02:00").toISOString() : null,
    min_price_cents: Math.round(d.min_price_eur * 100),
    first_booking_only: form.get("first_booking_only") === "on", active: true,
  });
  revalidatePath("/admin");
}
export async function togglePromo(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const code = String(form.get("code") ?? "");
  await db().from("promo_codes").update({ active: form.get("active") === "1" }).eq("code", code);
  revalidatePath("/admin");
}

const wipe = () => revalidatePath("/admin", "layout");

// ---------- Réservations : note interne, chauffeur, remboursement ----------
export async function saveBookingMeta(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return;
  await db().from("bookings").update({
    admin_note: String(form.get("admin_note") ?? "").slice(0, 1000) || null,
    ...(form.has("driver") ? { driver: String(form.get("driver") ?? "").slice(0, 80) || null } : {}),
  }).eq("id", id.data);
  await pushBookingToIcloud(id.data);
  wipe();
}

export async function refundBooking(_: { error?: string; ok?: string } | undefined, form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = z.string().uuid().safeParse(form.get("id"));
  const eur = Number(String(form.get("amount") ?? "").replace(",", "."));
  if (!id.success || !(eur > 0)) return { error: "Montant invalide." };
  const { data: b } = await db().from("bookings").select("paid_cents,refunded_cents,stripe_payment_intent,status").eq("id", id.data).single();
  if (!b) return { error: "Réservation introuvable." };
  const cents = Math.round(eur * 100);
  const left = (b.paid_cents ?? 0) - (b.refunded_cents ?? 0);
  if (cents > left) return { error: `Maximum remboursable : ${(left / 100).toFixed(2)} €.` };
  if (!stripeConfigured() || !b.stripe_payment_intent) return { error: "Remboursement automatique indisponible pour cette réservation (paiement hors Stripe ?)." };
  try {
    await getStripe().refunds.create({ payment_intent: b.stripe_payment_intent, amount: cents, metadata: { booking_id: id.data } }, { idempotencyKey: `admin-refund-${id.data}-${b.refunded_cents}-${cents}` });
  } catch (e) {
    console.error("admin refund", e);
    return { error: "Stripe a refusé le remboursement." };
  }
  await db().from("bookings").update({ refunded_cents: (b.refunded_cents ?? 0) + cents, ...(form.get("cancel") === "on" ? { status: "cancelled", cancelled_at: new Date().toISOString() } : {}) }).eq("id", id.data);
  await pushBookingToIcloud(id.data);
  wipe();
  return { ok: `${(cents / 100).toFixed(2)} € remboursés.` };
}

// ---------- Indisponibilités ----------
export async function addBlock(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const from = String(form.get("from") ?? ""), to = String(form.get("to") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || to < from) return;
  const t0 = String(form.get("t0") ?? "") || "00:00", t1 = String(form.get("t1") ?? "") || "23:59";
  const off = (d: string) => (new Intl.DateTimeFormat("en", { timeZone: "Europe/Paris", timeZoneName: "longOffset" }).formatToParts(new Date(d + "T12:00:00Z")).find((p) => p.type === "timeZoneName")?.value ?? "GMT+01:00").replace("GMT", "") || "+00:00";
  await db().from("blocked_periods").insert({
    start_at: new Date(`${from}T${t0}:00${off(from)}`).toISOString(),
    end_at: new Date(`${to}T${t1}:59${off(to)}`).toISOString(),
    reason: String(form.get("reason") ?? "").slice(0, 120) || null,
  });
  wipe();
}
export async function removeBlock(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = z.string().uuid().safeParse(form.get("id"));
  if (id.success) await db().from("blocked_periods").delete().eq("id", id.data);
  wipe();
}

// ---------- Guide ----------
const postSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]{3,80}$/, "Adresse : lettres minuscules, chiffres et tirets (3 à 80)."),
  title: z.string().trim().min(5).max(140),
  description: z.string().trim().min(30, "Description trop courte (30 caractères minimum pour Google).").max(200),
  tag: z.string().trim().min(2).max(30),
  minutes: z.coerce.number().int().min(1).max(60),
  published_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  body: z.string().trim().min(40, "Texte trop court."),
});
export async function savePost(_: { error?: string; ok?: boolean } | undefined, form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const p = postSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Champs invalides." };
  const { body, ...rest } = p.data;
  const { error } = await db().from("site_posts").upsert({ ...rest, body: parseBody(body), published: form.get("published") === "on", updated_at: new Date().toISOString() });
  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/guide"); revalidatePath(`/guide/${p.data.slug}`); revalidatePath("/sitemap.xml"); wipe();
  return { ok: true };
}
export async function deletePost(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const slug = String(form.get("slug") ?? "");
  await db().from("site_posts").delete().eq("slug", slug);
  revalidatePath("/guide"); revalidatePath(`/guide/${slug}`); revalidatePath("/sitemap.xml"); wipe();
  redirect("/admin/guide");
}

// ---------- Réglages ----------
const settingsSchema = z.object({
  email: z.string().trim().email().or(z.literal("")),
  legalPhone: z.string().trim().max(30),
  driverPhone: z.string().trim().max(30),
  mediatorName: z.string().trim().max(120),
  mediatorUrl: z.string().trim().url().or(z.literal("")),
  mediatorAddress: z.string().trim().max(200),
  carteVtc: z.string().trim().max(40),
  plaque: z.string().trim().max(20),
  vehicule: z.string().trim().max(80),
  tiimeEmail: z.string().trim().email().or(z.literal("")).optional(),
});
export async function saveSettings(_: { error?: string; ok?: boolean } | undefined, form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const p = settingsSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: "Vérifiez les adresses e-mail et l'adresse web du médiateur." };
  const { error } = await db().from("settings").upsert({ key: "site", value: p.data, updated_at: new Date().toISOString() });
  if (error) return { error: "Enregistrement impossible." };
  for (const path of ["/mentions-legales", "/contact", "/confidentialite", "/cgv"]) revalidatePath(path);
  wipe();
  return { ok: true };
}

// ---------- Réservation créée à la main (téléphone, SMS, client habituel) ----------
export async function createManualBooking(_: { error?: string; url?: string; id?: string } | undefined, form: FormData): Promise<{ error?: string; url?: string; id?: string } | undefined> {
  if (!(await isAdmin())) redirect("/admin");
  const r = await createManual(form, null);
  if ("error" in r) return r;
  wipe();
  if (r.goto === "stay") return { url: docPath("bon", r.id), id: r.id };
  if (r.goto === "bon") redirect(docPath("bon", r.id));
  redirect(`/admin/reservations?q=${r.id.slice(0, 8)}&ouvrir=1`);
}

// ---------- Comptes chauffeurs externes ----------
type PwResult = { error?: string; ok?: string; password?: string } | undefined;
const driverSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z.string().trim().max(30).optional(),
});
export async function createDriver(_: PwResult, form: FormData): Promise<PwResult> {
  if (!(await isAdmin())) redirect("/admin");
  const p = driverSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: "Nom ou e-mail invalide." };
  const password = newPassword();
  const { error } = await db().from("drivers").insert({ name: p.data.name, email: p.data.email, phone: p.data.phone || null, password_hash: hashPassword(password) });
  if (error) return { error: error.code === "23505" ? "Un compte existe déjà avec cet e-mail." : "Création impossible." };
  wipe();
  return { ok: `Compte créé pour ${p.data.name}.`, password };
}
export async function resetDriverPassword(_: PwResult, form: FormData): Promise<PwResult> {
  if (!(await isAdmin())) redirect("/admin");
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return { error: "Chauffeur introuvable." };
  const password = newPassword();
  const { error } = await db().from("drivers").update({ password_hash: hashPassword(password) }).eq("id", id.data);
  if (error) return { error: "Réinitialisation impossible." };
  return { ok: "Nouveau mot de passe :", password };
}
export async function toggleDriver(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = z.string().uuid().safeParse(form.get("id"));
  if (id.success) await db().from("drivers").update({ active: form.get("active") === "1" }).eq("id", id.data);
  wipe();
}

// ---------- Logo (factures, bons de commande, notes) ----------
type LogoR = { error?: string; ok?: boolean } | undefined;
export async function saveLogo(_: LogoR, form: FormData): Promise<LogoR> {
  if (!(await isAdmin())) redirect("/admin");
  const r = await processLogo(form.get("logo") as File);
  if ("error" in r) return r;
  const { error } = await db().from("settings").upsert({ key: "logo", value: { url: r.url }, updated_at: new Date().toISOString() });
  if (error) return { error: "Enregistrement impossible." };
  wipe();
  return { ok: true };
}
export async function removeLogo(_: LogoR): Promise<LogoR> {
  if (!(await isAdmin())) redirect("/admin");
  await db().from("settings").delete().eq("key", "logo");
  wipe();
  return { ok: true };
}

// ---------- Annulation sur justificatif ----------
export async function decideClaim(_: { error?: string; ok?: string } | undefined, form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = z.string().uuid().safeParse(form.get("claim"));
  if (!id.success) return { error: "Demande introuvable." };
  const r = await decideClaimCore(id.data, form.get("decision") === "accept");
  wipe();
  return r;
}

// ---------- Discussion en direct ----------
export async function replyChat(_: { error?: string; ok?: boolean } | undefined, form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = z.string().uuid().safeParse(form.get("thread"));
  const body = String(form.get("body") ?? "").trim().slice(0, 1500);
  if (!id.success || !body) return { error: "Message vide." };
  const r = await adminReply(id.data, body);
  revalidatePath("/admin/messages");
  return r;
}
export async function closeChat(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = z.string().uuid().safeParse(form.get("thread"));
  if (id.success) await db().from("chat_threads").update({ closed: form.get("reopen") ? false : true }).eq("id", id.data);
  revalidatePath("/admin/messages");
}

// ---------- Tiime : rattrapage des factures déjà émises ----------
export async function tiimeCatchUp(_: { error?: string; ok?: boolean | string } | undefined): Promise<{ error?: string; ok?: boolean | string }> {
  if (!(await isAdmin())) redirect("/admin");
  const r = await sendPendingToTiime(25);
  if (r.failed && !r.sent) return { error: "Envoi impossible : vérifiez l'adresse Tiime dans les réglages." };
  return { ok: `${r.sent} facture(s) envoyée(s) à Tiime${r.left ? `, ${r.left} restante(s) : cliquez à nouveau` : ""}.` };
}

// ---------- Double authentification de l'administration ----------
export async function start2fa(): Promise<{ uri: string; secret: string; qr: string } | { error: string }> {
  if (!(await isAdmin())) redirect("/admin");
  const t = await get2fa();
  if (t.enabled) return { error: "Déjà activée." };
  const secret = newSecret();
  await set2fa({ ...t, pending: secret });
  const uri = otpauthUri(secret);
  const QR = (await import("qrcode")).default;
  const qr = await QR.toString(uri, { type: "svg", margin: 1, width: 200, errorCorrectionLevel: "M" });
  return { uri, secret, qr };
}
export async function confirm2fa(_: { error?: string; ok?: boolean | string } | undefined, form: FormData): Promise<{ error?: string; ok?: boolean | string }> {
  if (!(await isAdmin())) redirect("/admin");
  const t = await get2fa();
  if (!t.pending) return { error: "Recommencez l'activation." };
  const step = totpStep(t.pending, String(form.get("code") ?? ""));
  if (step < 0) return { error: "Code incorrect : vérifiez l'heure de votre téléphone et réessayez." };
  await set2fa({ ...t, secret: t.pending, pending: undefined, enabled: true, lastStep: step });
  revalidatePath("/admin/reglages");
  return { ok: "Double authentification activée ✓ Le code sera demandé à chaque connexion." };
}
export async function disable2fa(_: { error?: string; ok?: boolean | string } | undefined, form: FormData): Promise<{ error?: string; ok?: boolean | string }> {
  if (!(await isAdmin())) redirect("/admin");
  const t = await get2fa();
  if (!t.enabled || !t.secret) return { ok: true };
  if (totpStep(t.secret, String(form.get("code") ?? "")) < 0) return { error: "Code incorrect." };
  await set2fa({ ...t, secret: undefined, enabled: false, pending: undefined, lastStep: undefined });
  revalidatePath("/admin/reglages");
  return { ok: "Double authentification désactivée." };
}

/** Envoi d'un code de connexion (e-mail ou SMS) : seulement après un mot de passe correct. */
export async function sendCode(via: "email" | "sms"): Promise<{ ok?: string; error?: string }> {
  if (!(await passwordOk())) return { error: "Saisissez d'abord votre mot de passe." };
  if (!(await guard(undefined, `2fa-send:${via}`, 4, 10 * 60_000))) return { error: "Trop d'envois, patientez quelques minutes." };
  const err = await sendLoginCode(via);
  return err ? { error: err } : { ok: via === "email" ? "Code envoyé par e-mail." : "Code envoyé par SMS." };
}
export async function set2faChannel(via: "email" | "sms", on: boolean): Promise<{ ok?: string; error?: string }> {
  if (!(await isAdmin())) redirect("/admin");
  const t = await get2fa();
  await set2fa({ ...t, [via]: on });
  revalidatePath("/admin/reglages");
  return { ok: on ? "Activé ✓" : "Désactivé" };
}
export async function makeBackupCodes(): Promise<string[]> {
  if (!(await isAdmin())) redirect("/admin");
  return newBackupCodes();
}

/** Photo de l'administrateur (data URL recadrée par le navigateur ; null = retirer). */
export async function saveAdminPhoto(dataUrl: string | null): Promise<{ ok?: boolean; error?: string }> {
  if (!(await isAdmin())) return { error: "Session expirée, reconnectez-vous." };
  if (dataUrl && !checkPhoto(dataUrl)) return { error: "Image non prise en charge ou trop lourde." };
  const { error } = dataUrl
    ? await db().from("settings").upsert({ key: "admin_photo", value: { src: dataUrl }, updated_at: new Date().toISOString() })
    : await db().from("settings").delete().eq("key", "admin_photo");
  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

// ---------- Face ID / clé d'accès (administration) ----------
export async function adminPkRegOptions() {
  if (!(await isAdmin())) throw new Error("non autorisé");
  return registrationOptions("admin", "admin@nordvtc.fr", "Administration Nord VTC");
}
export async function adminPkRegVerify(resp: RegistrationResponseJSON, name: string) {
  if (!(await isAdmin())) return { error: "Session expirée, reconnectez-vous." };
  const r = await registrationVerify("admin", resp, name);
  revalidatePath("/admin/reglages");
  return r;
}
export async function adminPkList() {
  if (!(await isAdmin())) return [];
  return listPasskeys("admin");
}
export async function adminPkDelete(id: string) {
  if (!(await isAdmin())) return { error: "Session expirée." };
  await deletePasskey("admin", id);
  revalidatePath("/admin/reglages");
  return { ok: true };
}
export async function adminPkLoginOptions() {
  const ip = ipFrom(await headers());
  if (!(await guard(undefined, `admin-pk:${ip}`, 40, 15 * 60_000, "admin_login_blocked"))) throw new Error("Trop de tentatives. Réessayez plus tard.");
  return loginOptions("admin");
}
export async function adminPkLogin(resp: AuthenticationResponseJSON): Promise<{ ok?: boolean; error?: string }> {
  const owner = await loginVerify("admin", resp).catch(() => null);
  if (owner !== "admin") { await logSecurity("admin_login_fail", undefined, { method: "face-id" }); return { error: "Face ID non reconnu pour cet appareil. Utilisez votre mot de passe." }; }
  await logSecurity("admin_login_ok", undefined, { method: "face-id" });
  await startSession();
  return { ok: true };
}

// ---------- Agenda iCloud : choix de l'agenda qui reçoit les courses ----------
export async function saveIcloudTarget(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const { listIcloudCalendars, setIcloudTarget, syncAllToIcloud } = await import("@/lib/icloud-push");
  const url = String(form.get("cal") ?? "");
  let n = 0;
  if (!url) await setIcloudTarget(null);
  else {
    const cal = (await listIcloudCalendars().catch(() => [])).find((c) => c.url === url);
    if (!cal) redirect("/admin/calendrier?ical=introuvable#agenda");
    await setIcloudTarget(cal);
    n = (await syncAllToIcloud()).ok;
  }
  revalidatePath("/admin/calendrier");
  redirect(`/admin/calendrier?ical=${url ? `ok&n=${n}` : "off"}#agenda`);
}
export async function syncIcloudNow() {
  if (!(await isAdmin())) redirect("/admin");
  const { syncAllToIcloud } = await import("@/lib/icloud-push");
  const r = await syncAllToIcloud();
  redirect(`/admin/calendrier?ical=ok&n=${r.ok}${r.failed ? `&e=${r.failed}` : ""}#agenda`);
}

// ---------- Agenda iCloud : agenda lu + bon de commande en un clic ----------
export async function saveIcloudSource(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const { listIcloudCalendars, setIcloudSource } = await import("@/lib/icloud-push");
  const url = String(form.get("cal") ?? "");
  const cal = url ? (await listIcloudCalendars().catch(() => [])).find((c) => c.url === url) ?? null : null;
  await setIcloudSource(cal);
  revalidatePath("/admin/calendrier");
  redirect(`/admin/calendrier${form.get("m") ? `?m=${String(form.get("m")).slice(0, 7)}` : ""}#agenda-courses`);
}

/** Lit une course notée dans l'agenda (IA) et crée directement le bon de commande. */
export async function quickBon(ref: string, date: string): Promise<{ url?: string; id?: string; error?: string }> {
  if (!(await isAdmin())) return { error: "Non autorisé." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !ref.startsWith("ical:")) return { error: "Événement invalide." };
  const [{ icloudEventsBetween }, { getIcloudSource }, { pairUp, courseText }, { coursesFromText, withPlaces }, { createManual }] = await Promise.all([
    import("@/lib/icloud"), import("@/lib/icloud-push"), import("@/lib/pair-events"), import("@/lib/ai-extract"), import("@/lib/manual"),
  ]);
  const day = new Date(`${date}T12:00:00Z`);
  const events = (await icloudEventsBetween(new Date(day.getTime() - 36 * 3600_000), new Date(day.getTime() + 36 * 3600_000), (await getIcloudSource())?.url)).filter((e) => e.date === date);
  const course = pairUp(events).find((c) => c.ref === ref);
  if (!course) return { error: "Événement introuvable dans l'agenda." };
  const e = course.dep;
  let c;
  try {
    const list = (await coursesFromText(courseText(course))).slice(0, 1);
    const base = list[0] ?? { name: "", phone: "", email: "", date: "", time: "", from: "", to: "", passengers: 1, luggage: 0, price: null, flight: "", notes: "", company: "" };
    base.date = e.date; if (!e.allDay) base.time = e.time;
    if (e.location) base.from = e.location.slice(0, 250);
    if (course.arr?.location) base.to = course.arr.location.slice(0, 250);
    [c] = await withPlaces([base]);
  } catch (err) { console.error("quick bon ia", err); return { error: "Lecture de l'événement impossible : utilisez « Importer des courses »." }; }
  if (!c.origin || !c.dest) return { error: "Adresses non trouvées dans l'événement : complétez-le dans « Importer des courses »." };
  if (!c.time) return { error: "Heure manquante : complétez-la dans « Importer des courses »." };
  const f = new FormData();
  f.set("origin", JSON.stringify(c.origin)); f.set("dest", JSON.stringify(c.dest));
  f.set("name", (c.name || e.title || "Client").slice(0, 100).padEnd(2, "."));
  f.set("phone", c.phone && c.phone.replace(/\D/g, "").length >= 6 ? c.phone : "Non communiqué");
  f.set("email", c.email && /@/.test(c.email) ? c.email : "");
  f.set("date", c.date); f.set("time", c.time);
  f.set("passengers", String(Math.min(8, Math.max(1, c.passengers || 1)))); f.set("luggage", String(Math.min(20, Math.max(0, c.luggage || 0))));
  if (c.flight) f.set("flight", c.flight.slice(0, 30));
  if (c.notes) f.set("notes", c.notes.slice(0, 500));
  if (c.price) f.set("price", String(c.price));
  if (c.company) f.set("company", c.company.slice(0, 120));
  f.set("source_ref", ref); f.set("goto", "stay");
  const r = await createManual(f, null);
  if ("error" in r) return { error: r.error };
  wipe();
  return { url: docPath("bon", r.id), id: r.id };
}

// ---------- Chauffeur affiché sur le bon de commande ----------
/** Met un chauffeur (ou moi-même) sur une course : ses coordonnées et mentions légales apparaissent sur le bon. */
export async function assignDriver(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return;
  const pick = String(form.get("driver_id") ?? "");
  let driver: { id: string; name: string } | null = null;
  if (/^[0-9a-f-]{36}$/.test(pick)) driver = (await db().from("drivers").select("id,name").eq("id", pick).maybeSingle()).data;
  await db().from("bookings").update({ driver_id: driver?.id ?? null, driver: driver?.name ?? null }).eq("id", id.data);
  await pushBookingToIcloud(id.data);
  wipe();
}

/** Coordonnées et mentions légales d'un chauffeur, saisies depuis l'administration. */
export async function adminSaveDriver(_: { ok?: boolean; error?: string } | undefined, form: FormData): Promise<{ ok?: boolean; error?: string }> {
  if (!(await isAdmin())) redirect("/admin");
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return { error: "Chauffeur introuvable." };
  const s = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max) || null;
  const siret = s("siret", 20)?.replace(/\s/g, "") ?? null;
  if (siret && !/^\d{14}$/.test(siret)) return { error: "SIRET : 14 chiffres." };
  const registre = s("registre", 20)?.toUpperCase() ?? null;
  if (registre && !/^EVTC\d{9}$/.test(registre)) return { error: "N° de registre : « EVTC » suivi de 9 chiffres." };
  const name = s("name", 100);
  if (!name || name.length < 2) return { error: "Nom obligatoire." };
  const { error } = await db().from("drivers").update({
    name, phone: s("phone", 30), company: s("company", 120), legal_form: s("legal_form", 120), siret, address: s("address", 250),
    registre, carte_vtc: s("carte_vtc", 40), vehicule: s("vehicule", 80), plaque: s("plaque", 15)?.toUpperCase() ?? null, insurer: s("insurer", 250), vat_note: s("vat_note", 200),
  }).eq("id", id.data);
  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/admin/chauffeurs");
  return { ok: true };
}

/** Retire un événement de la liste des courses (il reste dans l'agenda iPhone). */
export async function ignoreAgendaEvent(ref: string): Promise<{ ok?: boolean; error?: string }> {
  if (!(await isAdmin())) return { error: "Non autorisé." };
  if (!ref.startsWith("ical:")) return { error: "Événement invalide." };
  const { ignoreRef } = await import("@/lib/icloud-push");
  await ignoreRef(ref.slice(0, 200));
  revalidatePath("/admin/calendrier");
  return { ok: true };
}

/** Supprime l'événement de l'agenda iPhone lui-même. */
export async function deleteAgendaEvent(ref: string, date: string): Promise<{ ok?: boolean; error?: string }> {
  if (!(await isAdmin())) return { error: "Non autorisé." };
  if (!ref.startsWith("ical:") || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Événement invalide." };
  const [{ icloudEventsBetween, deleteIcloudEvent }, { getIcloudSource }] = await Promise.all([import("@/lib/icloud"), import("@/lib/icloud-push")]);
  const day = new Date(`${date}T12:00:00Z`);
  const ev = (await icloudEventsBetween(new Date(day.getTime() - 36 * 3600_000), new Date(day.getTime() + 36 * 3600_000), (await getIcloudSource())?.url)).find((e) => e.ref === ref);
  if (!ev?.href) return { error: "Événement introuvable (déjà supprimé ?)." };
  try { await deleteIcloudEvent(ev.href); }
  catch (e) {
    const m = (e as Error).message;
    return { error: m === "READONLY" ? "Cet agenda est en lecture seule (agenda partagé) : utilisez « Ignorer »." : m === "AUTH" ? "iCloud refuse la connexion." : "Suppression impossible pour le moment." };
  }
  revalidatePath("/admin/calendrier");
  return { ok: true };
}
