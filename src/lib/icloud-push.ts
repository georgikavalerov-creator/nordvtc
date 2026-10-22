import { db, dbConfigured } from "./supabase";
import { calendars, icloudAuth, icloudConfigured } from "./icloud";
import { calendarObject, type CalBooking } from "./ics";

// Ajout automatique des courses dans l'agenda iCloud choisi par le chauffeur (Réglages → Calendrier).
// Chaque course devient un événement « <id>.ics » de cet agenda : créé à la confirmation, mis à jour à chaque
// modification, supprimé à l'annulation. Aucune erreur ici ne bloque une réservation.

export type IcloudTarget = { url: string; name: string } | null;

export async function getIcloudTarget(): Promise<IcloudTarget> {
  if (!dbConfigured()) return null;
  const { data } = await db().from("settings").select("value").eq("key", "icloud_target").maybeSingle();
  const v = data?.value as IcloudTarget;
  return v?.url ? v : null;
}

export async function setIcloudTarget(t: IcloudTarget) {
  await db().from("settings").upsert({ key: "icloud_target", value: t ?? {}, updated_at: new Date().toISOString() });
}

export async function listIcloudCalendars(): Promise<{ url: string; name: string }[]> {
  if (!icloudConfigured()) return [];
  return calendars();
}

const eventUrl = (cal: string, id: string) => `${cal.replace(/\/?$/, "/")}nordvtc-${id}.ics`;

async function put(cal: string, b: CalBooking) {
  const r = await fetch(eventUrl(cal, b.id), { method: "PUT", headers: { Authorization: icloudAuth(), "Content-Type": "text/calendar; charset=utf-8" }, body: calendarObject(b), cache: "no-store" });
  if (!r.ok && r.status !== 201 && r.status !== 204) throw new Error(`iCloud PUT ${r.status}`);
}
async function del(cal: string, id: string) {
  const r = await fetch(eventUrl(cal, id), { method: "DELETE", headers: { Authorization: icloudAuth() }, cache: "no-store" });
  if (!r.ok && r.status !== 404 && r.status !== 204) throw new Error(`iCloud DELETE ${r.status}`);
}

/** Met l'agenda iCloud à jour pour une course (création, modification ou suppression). */
export async function pushBookingToIcloud(id: string): Promise<void> {
  try {
    if (!icloudConfigured()) return;
    const target = await getIcloudTarget();
    if (!target) return;
    const { data: b } = await db().from("bookings").select("*").eq("id", id).maybeSingle();
    if (!b) return;
    if (b.status === "confirmed" || b.status === "completed") await put(target.url, b as CalBooking);
    else await del(target.url, id);
  } catch (e) { console.error("icloud push", id, e); }
}

/** Envoie toutes les courses confirmées à venir dans l'agenda choisi. Renvoie le nombre d'événements écrits. */
export async function syncAllToIcloud(): Promise<{ ok: number; failed: number }> {
  const target = await getIcloudTarget();
  if (!target || !icloudConfigured()) return { ok: 0, failed: 0 };
  const since = new Date(Date.now() - 2 * 86_400_000).toISOString();
  const { data } = await db().from("bookings").select("*").in("status", ["confirmed", "completed"]).gte("pickup_at", since).order("pickup_at").limit(150);
  let ok = 0, failed = 0;
  for (const b of (data ?? []) as CalBooking[]) {
    try { await put(target.url, b); ok++; } catch (e) { failed++; console.error("icloud sync", b.id, e); }
  }
  return { ok, failed };
}
