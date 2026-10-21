import type { Metadata } from "next";
import Link from "next/link";
import { db, dbConfigured } from "@/lib/supabase";
import { AdminPage } from "./gate";
import { STATUS, euro, fmtDT, net, ymd, type Booking } from "./lib";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  let rows: Booking[] = [];
  let leads: { id: string; created_at: string; name: string; phone: string; need: string | null; verified: boolean }[] = [];
  if (dbConfigured()) {
    const since = new Date(Date.now() - 400 * 86_400_000).toISOString();
    rows = ((await db().from("bookings").select("*").in("status", ["confirmed", "completed", "pending_payment", "cancelled"]).gte("pickup_at", since).order("pickup_at", { ascending: true }).limit(2000)).data as Booking[]) ?? [];
    leads = ((await db().from("callback_leads").select("*").order("created_at", { ascending: false }).limit(8)).data as typeof leads) ?? [];
  }
  const now = new Date();
  const month = ymd(now).slice(0, 7);
  const today = ymd(now);
  const live = rows.filter((b) => b.status === "confirmed" || b.status === "completed");
  const thisMonth = live.filter((b) => ymd(b.pickup_at).startsWith(month));
  const ca = thisMonth.reduce((n, b) => n + b.price_cents, 0);
  const upcoming = rows.filter((b) => b.status === "confirmed" && new Date(b.pickup_at) >= new Date(now.getTime() - 3 * 3600_000));
  const toClose = rows.filter((b) => b.status === "confirmed" && new Date(b.pickup_at) < new Date(now.getTime() - 3 * 3600_000));
  const todays = upcoming.filter((b) => ymd(b.pickup_at) === today);
  const pending = rows.filter((b) => b.status === "pending_payment" && Date.now() - new Date(b.created_at).getTime() < 3600_000);
  // Évolution sur 6 mois
  const months: { k: string; ca: number; n: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const m = live.filter((b) => ymd(b.pickup_at).startsWith(k));
    months.push({ k, ca: m.reduce((n, b) => n + b.price_cents, 0), n: m.length });
  }
  const max = Math.max(1, ...months.map((m) => m.ca));
  const top = Object.entries(live.reduce<Record<string, number>>((a, b) => ((a[b.dest_label] = (a[b.dest_label] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <AdminPage title="Tableau de bord">
      {!dbConfigured() && <p className="notice">Connectez Supabase pour voir vos données.</p>}
      <div className="adm-kpis">
        <div className="adm-kpi"><b>{todays.length}</b><span>course(s) aujourd'hui</span></div>
        <div className="adm-kpi"><b>{upcoming.length}</b><span>à venir (confirmées)</span></div>
        <div className="adm-kpi"><b>{euro(ca)}</b><span>chiffre d'affaires du mois ({thisMonth.length} courses)</span></div>
        <div className="adm-kpi"><b>{toClose.length}</b><span>à terminer / facturer</span></div>
        <div className="adm-kpi"><b>{pending.length}</b><span>paiement(s) en cours</span></div>
      </div>

      {toClose.length > 0 && (
        <div className="adm-box">
          <strong>À terminer et facturer</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            {toClose.slice(0, 6).map((b) => <li key={b.id}>{fmtDT(b.pickup_at)} · {b.customer_name} · {b.dest_label}</li>)}
          </ul>
          <p style={{ margin: "10px 0 0" }}><Link href="/admin/reservations?statut=confirmed" className="more">Ouvrir les réservations →</Link></p>
        </div>
      )}

      <div className="grid cols-2" style={{ gap: 16, alignItems: "start" }}>
        <div className="adm-box">
          <strong>Prochaines courses</strong>
          {upcoming.length === 0 ? <p className="muted">Aucune course confirmée à venir.</p> : (
            <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              {upcoming.slice(0, 8).map((b) => (
                <li key={b.id} style={{ marginBottom: 6 }}>
                  <strong>{fmtDT(b.pickup_at)}</strong> · {b.customer_name} · <a href={`tel:${b.customer_phone}`}>{b.customer_phone}</a>
                  <br /><span className="muted">{b.origin_label} → {b.dest_label} · {euro(b.price_cents)}{b.flight ? ` · vol ${b.flight}` : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="adm-box">
          <strong>Dernières demandes de rappel</strong>
          {leads.length === 0 ? <p className="muted">Aucune demande.</p> : (
            <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              {leads.map((l) => (
                <li key={l.id} style={{ marginBottom: 4 }}>
                  {l.name} · <a href={`tel:${l.phone}`}>{l.phone}</a>{l.verified ? " ✔" : ""} <span className="muted">· {fmtDT(l.created_at)}</span>
                  {l.need && <div className="muted">{l.need}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid cols-2" style={{ gap: 16, alignItems: "start" }}>
        <div className="adm-box">
          <strong>Chiffre d'affaires sur 6 mois</strong>
          <div style={{ display: "flex", alignItems: "end", gap: 8, height: 130, marginTop: 12 }}>
            {months.map((m) => (
              <div key={m.k} style={{ flex: 1, textAlign: "center", fontSize: ".72rem" }}>
                <div style={{ height: Math.max(3, (m.ca / max) * 100), background: "var(--accent)", borderRadius: 4 }} title={`${euro(m.ca)} · ${m.n} courses`} />
                <div className="muted" style={{ marginTop: 4 }}>{m.k.slice(5)}/{m.k.slice(2, 4)}</div>
                <div>{m.n}</div>
              </div>
            ))}
          </div>
          <small className="muted">Barres = chiffre d'affaires ; chiffre dessous = nombre de courses.</small>
        </div>
        <div className="adm-box">
          <strong>Destinations les plus demandées</strong>
          {top.length === 0 ? <p className="muted">Pas encore de données.</p> : (
            <ol style={{ margin: "8px 0 0", paddingLeft: 18 }}>{top.map(([d, n]) => <li key={d}>{d} <span className="muted">· {n}</span></li>)}</ol>
          )}
          <p className="muted" style={{ fontSize: ".82rem", marginTop: 10 }}>Encaissé net ce mois (hors remboursements) : {euro(thisMonth.reduce((n, b) => n + net(b), 0))}</p>
        </div>
      </div>
    </AdminPage>
  );
}
