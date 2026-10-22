"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { currentUser, authClient } from "@/lib/auth";
import { db, dbConfigured } from "@/lib/supabase";
import { normalizePhone } from "@/lib/callback";
import { submitClaimCore } from "@/lib/claim";
import { cancelBookingCore } from "@/lib/cancel";
import { checkPhoto } from "@/lib/photo";
import { headers } from "next/headers";
import { deletePasskey, loginOptions, loginVerify, registrationOptions, registrationVerify } from "@/lib/passkey";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
import { ipFrom } from "@/lib/ratelimit";
import { guard } from "@/lib/security-log";

async function me() {
  const u = await currentUser();
  if (!u || !dbConfigured()) throw new Error("non autorisé");
  return u;
}

export async function saveProfile(_: unknown, f: FormData): Promise<{ ok?: boolean; error?: string }> {
  const u = await me();
  const p = z.object({
    full_name: z.string().trim().max(80),
    phone: z.string().trim().max(25),
    country: z.string().length(2).default("FR"),
    default_passengers: z.coerce.number().int().min(1).max(4),
  }).safeParse(Object.fromEntries(f));
  if (!p.success) return { error: "Vérifiez les champs." };
  let phone: string | null = null;
  if (p.data.phone) {
    phone = normalizePhone(p.data.phone, p.data.country);
    if (!phone) return { error: "Numéro de mobile invalide pour le pays choisi." };
  }
  const { error } = await db().from("profiles").upsert({
    user_id: u.id, full_name: p.data.full_name || null, phone,
    default_passengers: p.data.default_passengers,
    default_child_seat: f.get("default_child_seat") === "on",
    marketing_opt_in: f.get("marketing_opt_in") === "on",
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/compte", "layout");
  return { ok: true };
}

export async function savePlace(input: { kind: "home" | "work" | "other"; label: string; address: string; lat: number; lng: number }) {
  const u = await me();
  const p = z.object({
    kind: z.enum(["home", "work", "other"]), label: z.string().trim().min(1).max(40),
    address: z.string().trim().min(3).max(300), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180),
  }).parse(input);
  if (p.kind !== "other") await db().from("saved_places").delete().eq("user_id", u.id).eq("kind", p.kind); // un seul domicile / travail
  else {
    const { count } = await db().from("saved_places").select("id", { count: "exact", head: true }).eq("user_id", u.id);
    if ((count ?? 0) >= 12) return { error: "12 adresses maximum." };
  }
  await db().from("saved_places").insert({ user_id: u.id, ...p });
  revalidatePath("/compte/adresses");
  return {};
}

export async function deletePlace(id: string) {
  const u = await me();
  await db().from("saved_places").delete().eq("id", id).eq("user_id", u.id);
  revalidatePath("/compte/adresses");
}

export async function rateTrip(bookingId: string, stars: number, comment: string) {
  const u = await me();
  const s = z.number().int().min(1).max(5).parse(stars);
  const { data: b } = await db().from("bookings").select("id,status,user_id,customer_email").eq("id", bookingId).maybeSingle();
  const mine = b && (b.user_id === u.id || (u.email_confirmed_at && b.customer_email?.toLowerCase() === (u.email ?? "").toLowerCase()));
  if (!mine || b.status !== "completed") return { error: "Avis impossible." };
  await db().from("trip_ratings").upsert({ booking_id: bookingId, user_id: u.id, stars: s, comment: comment.slice(0, 500) || null });
  revalidatePath(`/compte/trajets/${bookingId}`);
  return {};
}

export async function deleteAccount(f: FormData) {
  const u = await me();
  if (f.get("confirm") !== "SUPPRIMER") return;
  await db().from("bookings").update({ user_id: null }).eq("user_id", u.id); // les réservations restent pour la comptabilité
  await db().auth.admin.deleteUser(u.id);
  await (await authClient()).auth.signOut();
  redirect("/?compte=supprime");
}

/** Annulation en un clic depuis l'espace client (le compte doit être propriétaire de la réservation). */
export async function cancelBooking(bookingId: string): Promise<{ ok?: boolean; error?: string; refunded?: number }> {
  const u = await me();
  if (!/^[0-9a-f-]{36}$/.test(bookingId)) return { error: "Réservation introuvable." };
  const { data: b } = await db().from("bookings").select("id,user_id,customer_email").eq("id", bookingId).maybeSingle();
  const mine = b && (b.user_id === u.id || (u.email_confirmed_at && b.customer_email?.toLowerCase() === (u.email ?? "").toLowerCase()));
  if (!b || !mine) return { error: "Réservation introuvable." };
  const r = await cancelBookingCore(bookingId, u.id);
  if (r.ok) revalidatePath("/compte", "layout");
  return r;
}

/** Demande d'annulation sans frais sur justificatif depuis l'espace client. */
export async function claimMine(bookingId: string, _: { ok?: boolean; error?: string } | undefined, form: FormData): Promise<{ ok?: boolean; error?: string }> {
  const u = await me();
  if (!/^[0-9a-f-]{36}$/.test(bookingId)) return { error: "Réservation introuvable." };
  const { data: b } = await db().from("bookings").select("id,user_id,customer_email").eq("id", bookingId).maybeSingle();
  const mine = b && (b.user_id === u.id || (u.email_confirmed_at && b.customer_email?.toLowerCase() === (u.email ?? "").toLowerCase()));
  if (!b || !mine) return { error: "Réservation introuvable." };
  const r = await submitClaimCore(bookingId, form);
  if (r.ok) revalidatePath("/compte", "layout");
  return r;
}

/** Photo de profil : petite image JPEG/PNG/WebP déjà recadrée par le navigateur (null = retirer la photo). */
export async function saveAvatar(dataUrl: string | null): Promise<{ ok?: boolean; error?: string }> {
  const u = await me();
  let avatar: string | null = null;
  if (dataUrl) {
    if (!checkPhoto(dataUrl)) return { error: "Image non prise en charge ou trop lourde." };
    avatar = dataUrl;
  }
  const { error } = await db().from("profiles").upsert({ user_id: u.id, avatar, updated_at: new Date().toISOString() });
  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/compte", "layout");
  return { ok: true };
}

/** Retire des trajets de l'espace client (passés, annulés ou non payés). Ils restent conservés pour la comptabilité. */
export async function hideTrips(ids: string[]): Promise<{ ok?: boolean; error?: string; count?: number }> {
  const u = await me();
  const list = ids.filter((id) => /^[0-9a-f-]{36}$/.test(id)).slice(0, 500);
  if (!list.length) return { error: "Aucun trajet sélectionné." };
  const email = (u.email ?? "").toLowerCase();
  const { data } = await db().from("bookings").select("id,user_id,customer_email,status,pickup_at").in("id", list);
  const now = Date.now();
  const allowed = (data ?? []).filter((b) => {
    const mine = b.user_id === u.id || (u.email_confirmed_at && b.customer_email?.toLowerCase() === email);
    const removable = b.status === "cancelled" || b.status === "completed" || b.status === "pending_payment" || new Date(b.pickup_at).getTime() < now;
    return mine && removable;
  }).map((b) => b.id);
  if (!allowed.length) return { error: "Un trajet à venir doit d'abord être annulé." };
  const { error } = await db().from("bookings").update({ user_hidden_at: new Date().toISOString() }).in("id", allowed);
  if (error) return { error: "Suppression impossible." };
  revalidatePath("/compte", "layout");
  return { ok: true, count: allowed.length };
}

// ---------- Face ID / clé d'accès (espace client) ----------
export async function clientPkRegOptions() {
  const u = await me();
  return registrationOptions(`user:${u.id}`, u.email ?? u.id, u.email ?? "Client Nord VTC");
}
export async function clientPkRegVerify(resp: RegistrationResponseJSON, name: string) {
  const u = await me();
  const r = await registrationVerify(`user:${u.id}`, resp, name);
  revalidatePath("/compte", "layout");
  return r;
}
export async function clientPkDelete(id: string) {
  const u = await me();
  await deletePasskey(`user:${u.id}`, id);
  revalidatePath("/compte", "layout");
  return { ok: true };
}
export async function clientPkLoginOptions() {
  const ip = ipFrom(await headers());
  if (!(await guard(undefined, `user-pk:${ip}`, 40, 15 * 60_000))) throw new Error("Trop de tentatives. Réessayez plus tard.");
  return loginOptions("user");
}
/** Connexion par Face ID : la clé est vérifiée, puis une session Supabase est ouverte pour ce compte. */
export async function clientPkLogin(resp: AuthenticationResponseJSON): Promise<{ ok?: boolean; error?: string }> {
  const owner = await loginVerify("user", resp).catch(() => null);
  const uid = owner?.startsWith("user:") ? owner.slice(5) : null;
  if (!uid) return { error: "Face ID non reconnu pour cet appareil. Connectez-vous autrement, puis activez Face ID dans Sécurité." };
  try {
    const { data: got } = await db().auth.admin.getUserById(uid);
    const email = got.user?.email;
    if (!email) return { error: "Compte introuvable." };
    const { data: link, error } = await db().auth.admin.generateLink({ type: "magiclink", email });
    if (error || !link.properties?.hashed_token) return { error: "Connexion impossible pour le moment." };
    const { error: e2 } = await (await authClient()).auth.verifyOtp({ type: "magiclink", token_hash: link.properties.hashed_token });
    if (e2) return { error: "Connexion impossible pour le moment." };
    return { ok: true };
  } catch { return { error: "Connexion impossible pour le moment." }; }
}
