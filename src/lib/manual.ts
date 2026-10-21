import { z } from "zod";
import { db, getPricing } from "./supabase";
import { computeQuote } from "./pricing";
import { routeSummary } from "./here";
import type { Driver } from "./driver-auth";

// ---------- Réservation créée à la main (téléphone, SMS, client habituel) ----------
const placeSchema = z.object({ label: z.string().min(3).max(250), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });
const manualSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(200).or(z.literal("")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  passengers: z.coerce.number().int().min(1).max(8),
  luggage: z.coerce.number().int().min(0).max(20),
  flight: z.string().trim().max(30).optional(),
  notes: z.string().trim().max(500).optional(),
  price: z.string().optional(),
  paid: z.string().optional(),
  company: z.string().trim().max(120).optional(),
  billing_address: z.string().trim().max(250).optional(),
  siren: z.string().trim().max(20).optional(),
  goto: z.string().optional(),
});
const eurToCents = (v?: string) => { const n = Number(String(v ?? "").replace(",", ".").trim()); return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0; };

export async function createManual(form: FormData, driver: Driver | null): Promise<{ error: string } | { id: string; goto?: string }> {
  let o, d;
  try { o = placeSchema.parse(JSON.parse(String(form.get("origin")))); d = placeSchema.parse(JSON.parse(String(form.get("dest")))); }
  catch { return { error: "Choisissez les adresses de départ et d'arrivée dans la liste proposée." }; }
  const p = manualSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: "Vérifiez les champs (nom, téléphone, date, heure)." };
  const v = p.data;
  const pickup = new Date(`${v.date}T${v.time}:00${new Intl.DateTimeFormat("en", { timeZone: "Europe/Paris", timeZoneName: "longOffset" }).formatToParts(new Date(`${v.date}T12:00:00Z`)).find((x) => x.type === "timeZoneName")?.value.replace("GMT", "") || "+01:00"}`);
  if (Number.isNaN(pickup.getTime())) return { error: "Date ou heure invalide." };

  let distanceM = 0, durationS = 0, priceCents = eurToCents(v.price);
  try {
    const r = await routeSummary(o, d);
    distanceM = r.distanceM; durationS = r.durationS;
    if (!priceCents) priceCents = computeQuote(r.distanceM, r.durationS, Number(v.time.slice(0, 2)), await getPricing()).priceCents;
  } catch (e) {
    console.error("manual route", e);
    if (!priceCents) return { error: "Calcul du prix impossible : indiquez le prix à la main." };
  }
  const paidCents = Math.min(eurToCents(v.paid), priceCents);
  const { data, error } = await db().from("bookings").insert({
    status: "confirmed", origin_label: o.label, origin_lat: o.lat, origin_lng: o.lng, dest_label: d.label, dest_lat: d.lat, dest_lng: d.lng,
    pickup_at: pickup.toISOString(), passengers: v.passengers, luggage: v.luggage, child_seat: form.get("child_seat") === "on",
    flight: v.flight || null, customer_name: v.name, customer_phone: v.phone, customer_email: v.email, notes: v.notes || null,
    distance_m: distanceM, duration_s: durationS, price_cents: priceCents, charge_cents: paidCents, pay_mode: paidCents >= priceCents ? "full" : "deposit",
    paid_cents: paidCents, paid_at: paidCents ? new Date().toISOString() : null, admin_note: driver ? null : "Créée à la main", driver_id: driver?.id ?? null, driver: driver?.name ?? null,
    billing_company: v.company || null, billing_address: v.billing_address || null, billing_siren: v.siren || null,
  }).select("id").single();
  if (error || !data) { console.error("manual booking", error); return { error: "Enregistrement impossible." }; }
  await db().rpc("issue_order", { bid: data.id });
  return { id: data.id, goto: v.goto };
}
