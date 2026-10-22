import { isAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Export du journal de sécurité (CSV lisible dans Excel / Numbers, ou texte brut avec ?format=txt).
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Non autorisé", { status: 401 });
  const u = new URL(req.url);
  const days = Math.min(365, Math.max(1, Number(u.searchParams.get("jours")) || 30));
  const ip = u.searchParams.get("ip");
  let q = db().from("security_events").select("*").gte("at", new Date(Date.now() - days * 86_400_000).toISOString()).order("at", { ascending: false }).limit(20000);
  if (ip) q = q.eq("ip", ip);
  const { data } = await q;
  const rows = data ?? [];
  const cols = ["at", "severity", "kind", "ip", "country", "city", "asn", "as_org", "method", "path", "referer", "user_agent", "ray", "detail"];
  const txt = u.searchParams.get("format") === "txt";
  const cell = (v: unknown) => { const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); return txt ? s : `"${s.replace(/"/g, '""')}"`; };
  const body = txt
    ? rows.map((r) => cols.map((c) => `${c}=${cell(r[c])}`).join(" | ")).join("\n")
    : "﻿" + [cols.join(";"), ...rows.map((r) => cols.map((c) => cell(r[c])).join(";"))].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "Content-Type": txt ? "text/plain; charset=utf-8" : "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="journal-securite-nordvtc-${stamp}.${txt ? "txt" : "csv"}"`,
      "Cache-Control": "no-store",
    },
  });
}
