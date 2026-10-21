import { isAdmin } from "@/lib/admin-auth";
import { db, dbConfigured } from "@/lib/supabase";
import { calendar, type CalBooking } from "@/lib/ics";

export const dynamic = "force-dynamic";

// Une course au format calendrier : sur iPhone, Safari propose « Ajouter au calendrier » d'un seul geste.
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Non autorisé", { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id) || !dbConfigured()) return new Response("Introuvable", { status: 404 });
  const { data } = await db().from("bookings").select("*").eq("id", id).maybeSingle();
  if (!data) return new Response("Introuvable", { status: 404 });
  return new Response(calendar([data as CalBooking]), {
    headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `inline; filename="course-${id.slice(0, 8)}.ics"`, "cache-control": "no-store" },
  });
}
