import { NextResponse } from "next/server";
import { sameSiteOrLog } from "@/lib/same-site";
import { guard } from "@/lib/security-log";
import { suggestPlaces } from "@/lib/here";
import { signPlace } from "@/lib/place-sign";
import { allow, allowDurable, clientIp } from "@/lib/ratelimit";

export async function GET(req: Request) {
  if (!(await sameSiteOrLog(req))) return NextResponse.json({ items: [] }, { status: 403 });
  if (!(await guard(req, `places-day:${clientIp(req)}`, 400, 86_400_000))) return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  if (!allow(`places:${clientIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 3 || q.length > 120) return NextResponse.json({ items: [] });
  try {
    return NextResponse.json({ items: (await suggestPlaces(q)).map(signPlace) });
  } catch (e) {
    console.error("places", e);
    return NextResponse.json({ error: "Recherche d'adresse indisponible" }, { status: 503 });
  }
}
