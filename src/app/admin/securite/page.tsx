import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "../gate";
import { db, dbConfigured } from "@/lib/supabase";
import TwoFactor, { TwoFactorChannels } from "../TwoFactor";
import { otpConfigured } from "@/lib/callback";
import { get2fa } from "@/lib/totp";
import { getSiteSettings } from "@/lib/content";
import FaceIdManager from "@/components/FaceIdManager";
import { adminPkDelete, adminPkList, adminPkRegOptions, adminPkRegVerify } from "../actions";

export const metadata: Metadata = { title: "Administration · Sécurité", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Ev = { id: number; at: string; kind: string; severity: string; ip: string | null; country: string | null; city: string | null; asn: number | null; as_org: string | null; user_agent: string | null; method: string | null; path: string | null; ray: string | null; detail: Record<string, unknown> | null };
const LABEL: Record<string, string> = {
  admin_login_ok: "Connexion admin réussie", admin_login_fail: "Mot de passe admin erroné", admin_login_blocked: "Force brute admin bloquée", admin_2fa_fail: "Code 2FA admin erroné",
  driver_login_ok: "Connexion chauffeur", driver_login_fail: "Mot de passe chauffeur erroné", driver_login_blocked: "Force brute chauffeur bloquée",
  rate_limited: "Trop de requêtes (bloqué)", cross_site_api: "Appel externe d'une API (bloqué)", price_tamper: "Tentative de fausser le prix", doc_bad_link: "Lien de document falsifié", mail_rejected: "E-mail refusé (chat)", otp_fail: "Code SMS erroné",
};
const fmt = (iso: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(iso));
const flag = (c: string | null) => (c && /^[A-Z]{2}$/.test(c) ? String.fromCodePoint(...[...c].map((x) => 0x1f1e6 + x.charCodeAt(0) - 65)) : "");

export default async function Securite({ searchParams }: { searchParams: Promise<{ ip?: string; type?: string; tout?: string }> }) {
  const { ip, type, tout } = await searchParams;
  let events: Ev[] = [];
  let top: { ip: string; n: number; country: string | null; as_org: string | null; worst: string }[] = [];
  if (dbConfigured()) {
    let q = db().from("security_events").select("*").order("at", { ascending: false }).limit(300);
    if (ip) q = q.eq("ip", ip);
    if (type) q = q.eq("kind", type);
    if (!tout && !ip && !type) q = q.neq("severity", "info");
    events = ((await q).data as Ev[]) ?? [];
    const { data: week } = await db().from("security_events").select("ip,country,as_org,severity").neq("severity", "info").gte("at", new Date(Date.now() - 7 * 86_400_000).toISOString()).limit(5000);
    const m = new Map<string, { ip: string; n: number; country: string | null; as_org: string | null; worst: string }>();
    for (const r of week ?? []) {
      const k = r.ip as string; if (!k) continue;
      const x = m.get(k) ?? { ip: k, n: 0, country: r.country as string, as_org: r.as_org as string, worst: "warn" };
      x.n++; if (r.severity === "high") x.worst = "high"; m.set(k, x);
    }
    top = [...m.values()].sort((a, b) => b.n - a.n).slice(0, 10);
  }
  const high = events.filter((e) => e.severity === "high").length;
  const [tfa, v] = await Promise.all([get2fa().catch(() => ({} as Awaited<ReturnType<typeof get2fa>>)), getSiteSettings()]);
  return (
    <AdminPage title="Sécurité">
      <div id="protection" className="adm-protect">
        <h2 className="adm-h">Protection de votre accès</h2>
        <FaceIdManager scope="admin" list={await adminPkList().catch(() => [])} getOptions={adminPkRegOptions} save={adminPkRegVerify} remove={adminPkDelete} />
        <div className="adm-duo">
          <TwoFactor enabled={!!tfa.enabled} />
          <TwoFactorChannels email={!!tfa.email} sms={!!tfa.sms} smsAvailable={otpConfigured()} phone={(v.driverPhone || process.env.DRIVER_PHONE || "").trim()} backup={(tfa.backup ?? []).length} />
        </div>
        <p className="muted adm-note">Le mot de passe de l&apos;administration se change dans les variables d&apos;environnement (ADMIN_PASSWORD) de votre hébergeur. Changer ADMIN_SESSION_SECRET déconnecte toutes les sessions.</p>
      </div>
      <h2 className="adm-h">Journal des alertes</h2>
      <div className="adm-box sec-intro">
        <p>Chaque tentative suspecte est enregistrée : adresse IP, pays et ville, réseau / fournisseur d&apos;accès (ASN), navigateur, page visée et <b>Ray ID</b> Cloudflare. En cas d&apos;attaque, téléchargez le journal et joignez-le à votre plainte (pharos.interieur.gouv.fr ou commissariat) ou transmettez-le à Cloudflare. Conservation : 12 mois.</p>
        <div className="sec-actions">
          <a className="btn small" href={`/admin/api/security-log?jours=90${ip ? `&ip=${encodeURIComponent(ip)}` : ""}`}>Télécharger (Excel, 90 jours)</a>
          <a className="btn small ghost" href={`/admin/api/security-log?jours=365&format=txt${ip ? `&ip=${encodeURIComponent(ip)}` : ""}`}>Fichier texte (12 mois)</a>
          {tout || ip || type ? <Link className="btn small ghost" href="/admin/securite">Alertes seulement</Link> : <Link className="btn small ghost" href="/admin/securite?tout=1">Tout voir (connexions comprises)</Link>}
        </div>
      </div>
      {top.length > 0 && (
        <div className="adm-box">
          <strong>Adresses les plus actives (7 jours)</strong>
          <table className="sec-table"><thead><tr><th>IP</th><th>Pays</th><th>Réseau</th><th>Alertes</th><th /></tr></thead>
            <tbody>{top.map((t) => (
              <tr key={t.ip} className={t.worst === "high" ? "is-high" : ""}><td><code>{t.ip}</code></td><td>{flag(t.country)} {t.country}</td><td>{t.as_org ?? "—"}</td><td>{t.n}</td>
                <td><Link href={`/admin/securite?ip=${encodeURIComponent(t.ip)}`}>Détail</Link> · <a href={`https://ipinfo.io/${encodeURIComponent(t.ip)}`} target="_blank" rel="noreferrer">Infos IP</a></td></tr>
            ))}</tbody></table>
        </div>
      )}
      <div className="adm-box">
        <strong>{ip ? `Événements de ${ip}` : "Derniers événements"}{high ? ` · ${high} critique(s)` : ""}</strong>
        {events.length === 0 ? <p className="muted">Rien à signaler.</p> : (
          <div className="sec-scroll"><table className="sec-table">
            <thead><tr><th>Date</th><th>Événement</th><th>IP</th><th>Pays</th><th>Réseau</th><th>Page</th><th>Navigateur</th><th>Ray ID</th></tr></thead>
            <tbody>{events.map((e) => (
              <tr key={e.id} className={`is-${e.severity}`}>
                <td>{fmt(e.at)}</td>
                <td><Link href={`/admin/securite?type=${e.kind}`}>{LABEL[e.kind] ?? e.kind}</Link>{e.detail?.email ? <small> · {String(e.detail.email)}</small> : null}</td>
                <td>{e.ip ? <Link href={`/admin/securite?ip=${encodeURIComponent(e.ip)}`}><code>{e.ip}</code></Link> : "—"}</td>
                <td>{flag(e.country)} {e.country}{e.city ? ` · ${e.city}` : ""}</td>
                <td>{e.as_org ? `${e.as_org}${e.asn ? ` (AS${e.asn})` : ""}` : "—"}</td>
                <td><small>{e.method ? `${e.method} ` : ""}{e.path}</small></td>
                <td><small title={e.user_agent ?? ""}>{(e.user_agent ?? "").slice(0, 60)}</small></td>
                <td><small><code>{e.ray ?? ""}</code></small></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </AdminPage>
  );
}
