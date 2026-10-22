"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/admin-auth";
import { allow } from "@/lib/ratelimit";
import { db } from "@/lib/supabase";
import { DEFAULT_PRICING } from "@/lib/pricing";
import { sendInvoiceEmail } from "@/lib/mail";
import { docPath } from "@/lib/docsign";
import { SITE } from "@/lib/site";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { parseBody } from "@/lib/content";
import { createManual } from "@/lib/manual";
import { processLogo } from "@/lib/logo";
import { hashPassword, newPassword } from "@/lib/driver-auth";
import { decideClaimCore } from "@/lib/claim";
import { adminReply } from "@/lib/chat";

export async function login(_: { error?: string } | undefined, form: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnu";
  if (!allow(`admin-login:${ip}`, 6, 15 * 60_000)) return { error: "Trop de tentatives. Réessayez plus tard." };
  if (!checkPassword(String(form.get("password") ?? ""))) return { error: "Mot de passe incorrect." };
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
    }
  } else {
    await db().from("bookings").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  }
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
    driver: String(form.get("driver") ?? "").slice(0, 80) || null,
  }).eq("id", id.data);
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
});
export async function saveSettings(_: { error?: string; ok?: boolean } | undefined, form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const p = settingsSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: "Vérifiez l'e-mail et l'adresse web du médiateur." };
  const { error } = await db().from("settings").upsert({ key: "site", value: p.data, updated_at: new Date().toISOString() });
  if (error) return { error: "Enregistrement impossible." };
  for (const path of ["/mentions-legales", "/contact", "/confidentialite", "/cgv"]) revalidatePath(path);
  wipe();
  return { ok: true };
}

// ---------- Réservation créée à la main (téléphone, SMS, client habituel) ----------
export async function createManualBooking(_: { error?: string } | undefined, form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const r = await createManual(form, null);
  if ("error" in r) return r;
  wipe();
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
