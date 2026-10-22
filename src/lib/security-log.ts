import { after } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db, dbConfigured } from "./supabase";
import { allowDurable, ipFrom } from "./ratelimit";

// Journal de sécurité : tout ce qui permet de remonter à un attaquant (adresse IP, pays et ville, réseau / FAI (ASN),
// navigateur, page visée, identifiant de requête Cloudflare « Ray ID » à fournir à Cloudflare ou aux autorités).
// Conservation : 12 mois (purge automatique), base légale : intérêt légitime (sécurité du site).

export type SecKind =
  | "admin_login_ok" | "admin_login_fail" | "admin_login_blocked" | "admin_2fa_fail"
  | "driver_login_ok" | "driver_login_fail" | "driver_login_blocked"
  | "rate_limited" | "cross_site_api" | "price_tamper" | "doc_bad_link" | "mail_rejected" | "otp_fail";

const SEVERITY: Record<SecKind, "info" | "warn" | "high"> = {
  admin_login_ok: "info", driver_login_ok: "info",
  admin_login_fail: "warn", driver_login_fail: "warn", otp_fail: "warn", rate_limited: "warn", cross_site_api: "warn", mail_rejected: "warn",
  admin_login_blocked: "high", driver_login_blocked: "high", admin_2fa_fail: "high", price_tamper: "high", doc_bad_link: "high",
};

type Src = Request | Headers | undefined;

async function describe(src: Src) {
  const h = src instanceof Request ? src.headers : src instanceof Headers ? src : await nextHeaders();
  let cf: Record<string, unknown> = {};
  try { cf = ((await getCloudflareContext({ async: true })).cf ?? {}) as Record<string, unknown>; } catch { /* hors Cloudflare */ }
  const url = src instanceof Request ? new URL(src.url) : null;
  return {
    ip: ipFrom(h),
    country: (h.get("cf-ipcountry") || (cf.country as string) || null),
    city: (cf.city as string) || null,
    asn: typeof cf.asn === "number" ? cf.asn : null,
    as_org: (cf.asOrganization as string) || null,
    user_agent: (h.get("user-agent") || "").slice(0, 400),
    method: src instanceof Request ? src.method : null,
    path: url ? (url.pathname + url.search).slice(0, 300) : (h.get("next-url") || h.get("referer") || "").slice(0, 300),
    referer: (h.get("referer") || "").slice(0, 300) || null,
    ray: h.get("cf-ray"),
  };
}

/** Enregistre un événement de sécurité (après la réponse : n'alourdit pas le site). */
export async function logSecurity(kind: SecKind, src?: Src, detail?: Record<string, unknown>) {
  if (!dbConfigured()) return;
  try {
    const row = { kind, severity: SEVERITY[kind], ...(await describe(src)), detail: detail ?? null };
    console.warn("securite", kind, row.ip, row.country, row.as_org, row.path);
    const write = async () => {
      // Anti-inondation du journal lui-même : 300 lignes / heure / IP au maximum.
      if (!(await allowDurable(`seclog:${row.ip}`, 300, 3_600_000))) return;
      await db().from("security_events").insert(row);
      if (Math.random() < 0.01) await db().from("security_events").delete().lt("at", new Date(Date.now() - 365 * 86_400_000).toISOString());
    };
    try { after(write); } catch { await write(); }
  } catch (e) { console.error("seclog", e); }
}

/** Limite durable + journalisation automatique quand elle bloque. */
export async function guard(src: Src, key: string, max: number, windowMs: number, kind: SecKind = "rate_limited") {
  const ok = await allowDurable(key, max, windowMs);
  if (!ok) await logSecurity(kind, src, { key: key.replace(/:[^:]*$/, ""), max, windowMin: Math.round(windowMs / 60000) });
  return ok;
}
