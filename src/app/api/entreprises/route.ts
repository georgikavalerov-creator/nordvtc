import { NextResponse } from "next/server";
import { sameSiteOrLog } from "@/lib/same-site";
import { guard, guardVisitor } from "@/lib/security-log";
import { allow, clientIp, allowVisitor } from "@/lib/ratelimit";

// Suggestions d'entreprises (nom, SIREN ou SIRET) depuis l'annuaire public de l'État :
// recherche-entreprises.api.gouv.fr (données INSEE / RNE, gratuit, sans clé).
export type Company = { name: string; siren: string; siret: string; address: string; city: string; active: boolean };

const nice = (s: string) => s.toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase()).replace(/\b(\d{5})\b/, "$1");

export async function GET(req: Request) {
  if (!(await sameSiteOrLog(req))) return NextResponse.json({ results: [] }, { status: 403 });
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  const digits = q.replace(/\s/g, "");
  if (q.length < 3 && !/^\d{9}$/.test(digits)) return NextResponse.json({ results: [] });
  if (!allowVisitor(req, "ent", 40, 60_000)) return NextResponse.json({ results: [] }, { status: 429 });
  const url = new URL("https://recherche-entreprises.api.gouv.fr/search");
  url.searchParams.set("q", /^\d[\d\s]{8,}$/.test(q) ? digits : q);
  url.searchParams.set("per_page", "6");
  url.searchParams.set("minimal", "true");
  url.searchParams.set("include", "siege,matching_etablissements");
  try {
    // L'annuaire limite le débit (7 requêtes/s) : on retente une fois en cas de refus passager.
    let r = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "nordvtc.fr (contact@nordvtc.fr)" } });
    if (r.status === 429 || r.status >= 500) { await new Promise((ok) => setTimeout(ok, 700)); r = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "nordvtc.fr (contact@nordvtc.fr)" } }); }
    if (!r.ok) return NextResponse.json({ results: [] }, { headers: { "x-upstream": String(r.status), "Cache-Control": "no-store" } });
    const d = (await r.json()) as { results?: { siren: string; nom_complet?: string; nom_raison_sociale?: string; etat_administratif?: string; siege?: { siret?: string; adresse?: string; libelle_commune?: string }; matching_etablissements?: { siret?: string; adresse?: string; libelle_commune?: string }[] }[] };
    const results: Company[] = (d.results ?? []).map((x) => {
      const est = /^\d{14}$/.test(digits) ? x.matching_etablissements?.find((e) => e.siret === digits) ?? x.siege : x.siege;
      return {
        name: (x.nom_raison_sociale || x.nom_complet || "").trim(),
        siren: x.siren,
        siret: est?.siret ?? "",
        address: nice(est?.adresse ?? ""),
        city: nice(est?.libelle_commune ?? ""),
        active: x.etat_administratif !== "C",
      };
    }).filter((c) => c.name && c.siren);
    return NextResponse.json({ results }, { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch (e) {
    return NextResponse.json({ results: [] }, { headers: { "x-upstream": `err:${(e as Error).message.slice(0, 60)}`, "Cache-Control": "no-store" } });
  }
}
