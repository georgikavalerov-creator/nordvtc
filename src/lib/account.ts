import { DEFAULT_PRICING } from "./pricing";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { currentUser } from "./auth";
import { db, dbConfigured } from "./supabase";

export async function requireUser(next = "/compte"): Promise<User> {
  const u = await currentUser();
  if (!u) redirect(`/compte/connexion?next=${encodeURIComponent(next)}`);
  return u;
}

export type Booking = {
  id: string; status: string; created_at: string; origin_label: string; dest_label: string; pickup_at: string;
  passengers: number; luggage: number; flight: string | null; child_seat: boolean; notes: string | null;
  price_cents: number; paid_cents: number; charge_cents: number; pay_mode: string; distance_m: number; duration_s: number;
  customer_name: string; customer_email: string; customer_phone: string; paid_at: string | null;
  promo_code: string | null; discount_cents: number; refunded_cents: number;
};
const COLS = "id,status,created_at,origin_label,dest_label,pickup_at,passengers,luggage,flight,child_seat,notes,price_cents,paid_cents,charge_cents,pay_mode,distance_m,duration_s,customer_name,customer_email,customer_phone,paid_at,promo_code,discount_cents,refunded_cents";
const clean = (s: string) => s.replace(/[,()%*]/g, "");

/** Réservations du compte + anciennes réservations faites avec la même adresse e-mail vérifiée. */
export async function userBookings(user: User): Promise<Booking[]> {
  if (!dbConfigured()) return [];
  const filters = [`user_id.eq.${user.id}`];
  const email = (user.email ?? "").toLowerCase();
  if (email && user.email_confirmed_at) filters.push(`customer_email.ilike.${clean(email)}`);
  const { data } = await db().from("bookings").select(COLS).or(filters.join(",")).neq("status", "expired").order("pickup_at", { ascending: false });
  const list = (data as Booking[]) ?? [];
  if (list.length && email && user.email_confirmed_at) {
    await db().from("bookings").update({ user_id: user.id }).is("user_id", null).ilike("customer_email", clean(email));
  }
  return list;
}

export async function userBooking(user: User, id: string): Promise<Booking | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  return (await userBookings(user)).find((b) => b.id === id) ?? null;
}

export type Profile = { full_name: string | null; phone: string | null; default_passengers: number; default_child_seat: boolean; marketing_opt_in: boolean };
export async function getProfile(userId: string): Promise<Profile> {
  const empty = { full_name: null, phone: null, default_passengers: 1, default_child_seat: false, marketing_opt_in: false };
  if (!dbConfigured()) return empty;
  const { data } = await db().from("profiles").select("full_name,phone,default_passengers,default_child_seat,marketing_opt_in").eq("user_id", userId).maybeSingle();
  return (data as Profile) ?? empty;
}

export type SavedPlace = { id: string; kind: "home" | "work" | "other"; label: string; address: string; lat: number; lng: number };
export async function getPlaces(userId: string): Promise<SavedPlace[]> {
  if (!dbConfigured()) return [];
  const { data } = await db().from("saved_places").select("id,kind,label,address,lat,lng").eq("user_id", userId).order("created_at");
  return (data as SavedPlace[]) ?? [];
}

export const STATUS: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: "Paiement en attente", cls: "warn" },
  confirmed: { label: "Confirmée", cls: "ok" },
  completed: { label: "Terminée", cls: "" },
  cancelled: { label: "Annulée", cls: "bad" },
};
export const fmtDate = (iso: string, long = true) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", ...(long ? { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "2-digit", year: "numeric" }) }).format(new Date(iso));

/** Règle d'annulation (identique aux CGV) : gratuite jusqu'à 24 h avant la prise en charge. */
// CGV art. 5 : plus de 24 h avant, tout est remboursé ; moins de 24 h avant, seule une somme égale à l'acompte est conservée.
export function cancelPolicy(pickupAt: string, paidCents: number, priceCents?: number, now = Date.now()) {
  const hours = (new Date(pickupAt).getTime() - now) / 3_600_000;
  const refundable = hours >= 24;
  const deposit = priceCents ? Math.max(50, Math.round((priceCents * DEFAULT_PRICING.depositPct) / 100 / 100) * 100) : paidCents;
  const keptCents = refundable ? 0 : Math.min(paidCents, deposit);
  return { canCancel: hours > 0, refundable, refundCents: paidCents - keptCents, keptCents };
}
