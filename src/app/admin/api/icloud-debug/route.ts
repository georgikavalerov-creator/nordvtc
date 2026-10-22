import { isAdmin } from "@/lib/admin-auth";
import { icloudDebug } from "@/lib/icloud";

export const dynamic = "force-dynamic";
// Diagnostic temporaire (admin uniquement) : structure des agendas iCloud, sans aucun identifiant.
export async function GET() {
  if (!(await isAdmin())) return new Response("Non autorisé", { status: 401 });
  try { return Response.json(await icloudDebug()); } catch (e) { return Response.json({ error: String((e as Error).message) }); }
}
