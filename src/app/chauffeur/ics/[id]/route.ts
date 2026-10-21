import { currentDriver } from "@/lib/driver-auth";
import { db } from "@/lib/supabase";
import { calendar, type CalBooking } from "@/lib/ics";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const d = await currentDriver();
  if (!d) return new Response("Non autorisé", { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Introuvable", { status: 404 });
  const { data } = await db().from("bookings").select("*").eq("id", id).eq("driver_id", d.id).maybeSingle();
  if (!data) return new Response("Introuvable", { status: 404 });
  return new Response(calendar([data as CalBooking], `Courses · ${d.name}`), {
    headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `inline; filename="course-${id.slice(0, 8)}.ics"`, "cache-control": "no-store" },
  });
}
