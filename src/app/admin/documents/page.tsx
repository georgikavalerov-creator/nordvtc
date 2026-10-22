import type { Metadata } from "next";
import Link from "next/link";
import { db, dbConfigured } from "@/lib/supabase";
import { docPath } from "@/lib/docsign";
import { AdminPage } from "../gate";
import { euro, fmtDT, type Booking } from "../lib";

export const metadata: Metadata = { title: "Administration · Documents", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Row = Booking & { order_number?: string | null; invoice_number?: string | null; billing_company?: string | null };
type Props = { searchParams: Promise<{ q?: string; type?: string; mois?: string }> };

const clean = (s: string) => s.replace(/[,()%*]/g, "").trim().slice(0, 60);

// Bibliothèque des documents : bons de commande, notes provisoires et factures, avec recherche et filtres.
// (La création d'une course hors site se fait dans « + Bon de commande ».)
export default async function Page({ searchParams }: Props) {
  const { q = "", type = "tous", mois = "" } = await searchParams;
  let rows: Row[] = [];
  if (dbConfigured()) {
    let req = db().from("bookings").select("*").in("status", ["confirmed", "completed"]).order("pickup_at", { ascending: false }).limit(200);
    const t = clean(q);
    if (t) req = req.or(`customer_name.ilike.%${t}%,customer_email.ilike.%${t}%,customer_phone.ilike.%${t}%,order_number.ilike.%${t}%,invoice_number.ilike.%${t}%,billing_company.ilike.%${t}%`);
    if (/^\d{4}-\d{2}$/.test(mois)) {
      const [y, m] = mois.split("-").map(Number);
      req = req.gte("pickup_at", new Date(Date.UTC(y, m - 1, 1)).toISOString()).lt("pickup_at", new Date(Date.UTC(y, m, 1)).toISOString());
    }
    if (type === "factures") req = req.not("invoice_number", "is", null);
    if (type === "a-facturer") req = req.eq("status", "confirmed");
    rows = ((await req).data as Row[]) ?? [];
  }
  const invoiced = rows.filter((b) => b.invoice_number);
  const total = invoiced.reduce((n, b) => n + b.price_cents, 0);
  const months = Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - i, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; });
  const label = (k: string) => new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(`${k}-01T12:00:00`));

  return (
    <AdminPage title="Documents" actions={<Link className="btn small" href="/admin/reservations/nouvelle">+ Bon de commande</Link>}>
      <p className="muted" style={{ margin: 0 }}>Tous les bons de commande, notes provisoires et factures de vos courses. Pour une course prise hors du site, utilisez « + Bon de commande ».</p>
      <form className="adm-filters adm-box" method="get">
        <label>Recherche<input name="q" defaultValue={q} placeholder="Client, société, n° de bon ou de facture" /></label>
        <label>Documents
          <select name="type" defaultValue={type}>
            <option value="tous">Tous</option>
            <option value="factures">Factures émises</option>
            <option value="a-facturer">À facturer (course non terminée)</option>
          </select>
        </label>
        <label>Mois
          <select name="mois" defaultValue={mois}>
            <option value="">Tous les mois</option>
            {months.map((k) => <option key={k} value={k}>{label(k)}</option>)}
          </select>
        </label>
        <button className="btn small">Filtrer</button>
      </form>
      <div className="adm-kpis">
        <div className="adm-kpi"><b>{rows.length}</b><span>course(s) avec bon de commande</span></div>
        <div className="adm-kpi"><b>{invoiced.length}</b><span>facture(s) émise(s)</span></div>
        <div className="adm-kpi"><b>{euro(total)}</b><span>total facturé (sélection)</span></div>
      </div>
      <div className="table-wrap adm-box adm-table">
        <table>
          <thead><tr><th>Course</th><th>Client</th><th>N°</th><th>Prix</th><th>Documents</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="muted">Aucun document pour cette recherche.</td></tr>}
            {rows.map((b) => (
              <tr key={b.id}>
                <td>{fmtDT(b.pickup_at)}<br /><span className="muted">{b.origin_label.split(",")[0]} → {b.dest_label.split(",")[0]}</span></td>
                <td>{b.customer_name}{b.billing_company && <><br /><span className="muted">{b.billing_company}</span></>}</td>
                <td><span className="muted">{b.order_number ?? "—"}</span>{b.invoice_number && <><br /><strong>{b.invoice_number}</strong></>}</td>
                <td>{euro(b.price_cents)}</td>
                <td>
                  <div className="adm-actions">
                    <a className="btn ghost small" href={docPath("bon", b.id)} target="_blank" rel="noopener">Bon</a>
                    {b.status === "confirmed" && <a className="btn ghost small" href={docPath("note", b.id)} target="_blank" rel="noopener">Note</a>}
                    {b.invoice_number && <a className="btn ghost small" href={docPath("facture", b.id)} target="_blank" rel="noopener">Facture</a>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
