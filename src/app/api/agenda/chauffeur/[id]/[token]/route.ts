import { timingSafeEqual } from "node:crypto";
import { driverAgendaToken } from "@/lib/driver-auth";
import { db, dbConfigured } from "@/lib/supabase";
import { calendar, type CalBooking } from "@/lib/ics";

export const dynamic = "force-dynamic";

// Abonnement calendrier privé d'un chauffeur : ses seules courses.
export async function GET(_: Request, { params }: { params: Promise<{ id: string; token: string }> }) {
  const { id, token } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id) || !dbConfigured()) return new Response("Introuvable", { status: 404 });
  let want = "";
  try { want = driverAgendaToken(id); } catch { return new Response("Introuvable", { status: 404 }); }
  const got = token.replace(/\.ics$/, "");
  if (got.length !== want.length || !timingSafeEqual(Buffer.from(got), Buffer.from(want))) return new Response("Introuvable", { status: 404 });
  const { data: drv } = await db().from("drivers").select("name,active").eq("id", id).maybeSingle();
  if (!drv?.active) return new Response("Introuvable", { status: 404 });
  const since = new Date(Date.now() - 45 * 86_400_000).toISOString();
  const { data } = await db().from("bookings").select("*").eq("driver_id", id).in("status", ["confirmed", "completed", "cancelled"]).gte("pickup_at", since).order("pickup_at").limit(1000);
  return new Response(calendar((data ?? []) as CalBooking[], `Courses · ${drv.name}`), {
    headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "private, max-age=300", "x-robots-tag": "noindex" },
  });
}
