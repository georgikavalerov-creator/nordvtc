import { timingSafeEqual } from "node:crypto";
import { db, dbConfigured } from "@/lib/supabase";
import { agendaToken, calendar, type CalBooking } from "@/lib/ics";
import { fromDriverCalendar, getIcloudTarget } from "@/lib/icloud-push";

export const dynamic = "force-dynamic";

// Abonnement calendrier privé (iPhone, Android, Outlook…) : courses confirmées, mises à jour automatiquement.
// Inutile (et vide) quand l'ajout automatique dans l'agenda iCloud est activé.
export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const want = agendaToken();
  const got = (await params).token.replace(/\.ics$/, "");
  const ok = want.length > 0 && got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want));
  if (!ok || !dbConfigured()) return new Response("Introuvable", { status: 404 });
  const since = new Date(Date.now() - 45 * 86_400_000).toISOString();
  // Annulées exclues : un événement absent du flux disparaît de l'iPhone, alors qu'un « annulé » y reste barré.
  const { data } = await db().from("bookings").select("*").in("status", ["confirmed", "completed"]).gte("pickup_at", since).order("pickup_at").limit(1000);
  // Pas de doublon : les courses notées dans l'agenda du chauffeur y sont déjà, et si l'ajout automatique
  // iCloud est actif, les autres y sont écrites directement.
  const pushing = !!(await getIcloudTarget());
  const list = ((data ?? []) as (CalBooking & { source_ref?: string | null })[]).filter((b) => !fromDriverCalendar(b) && !pushing);
  return new Response(calendar(list), {
    headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "private, max-age=300", "x-robots-tag": "noindex" },
  });
}
