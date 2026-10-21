import { timingSafeEqual } from "node:crypto";
import { db, dbConfigured } from "@/lib/supabase";
import { agendaToken, calendar, type CalBooking } from "@/lib/ics";

export const dynamic = "force-dynamic";

// Abonnement calendrier privé (iPhone, Android, Outlook…) : toutes les courses confirmées, mises à jour automatiquement.
export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const want = agendaToken();
  const got = (await params).token.replace(/\.ics$/, "");
  const ok = want.length > 0 && got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want));
  if (!ok || !dbConfigured()) return new Response("Introuvable", { status: 404 });
  const since = new Date(Date.now() - 45 * 86_400_000).toISOString();
  const { data } = await db().from("bookings").select("*").in("status", ["confirmed", "completed", "cancelled"]).gte("pickup_at", since).order("pickup_at").limit(1000);
  return new Response(calendar((data ?? []) as CalBooking[]), {
    headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "private, max-age=300", "x-robots-tag": "noindex" },
  });
}
