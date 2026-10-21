import { NextResponse } from "next/server";
import { suggestPlaces } from "@/lib/here";
import { allow, clientIp } from "@/lib/ratelimit";

export async function GET(req: Request) {
  if (!allow(`places:${clientIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 3 || q.length > 120) return NextResponse.json({ items: [] });
  try {
    return NextResponse.json({ items: await suggestPlaces(q) });
  } catch (e) {
    console.error("places", e);
    return NextResponse.json({ error: "Recherche d'adresse indisponible" }, { status: 503 });
  }
}
