import type { Metadata } from "next";
import { db, dbConfigured } from "@/lib/supabase";
import { docPath } from "@/lib/docsign";
import { AdminPage } from "../gate";
import ManualForm from "../ManualForm";
import { euro, fmtDT, type Booking } from "../lib";

export const metadata: Metadata = { title: "Administration · Documents", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const rows = dbConfigured() ? (((await db().from("bookings").select("*").in("status", ["confirmed", "completed"]).order("pickup_at", { ascending: false }).limit(40)).data as (Booking & { order_number?: string; invoice_number?: string })[]) ?? []) : [];
  return (
    <AdminPage title="Documents">
      <div>
        <h2 style={{ fontSize: "1.3rem" }}>Nouveau bon de commande</h2>
        <p className="muted">Pour une course prise hors du site. Le bon de commande est généré avec toutes les mentions obligatoires, la course est ajoutée à vos réservations, et la page s'ouvre prête à imprimer ou à enregistrer en PDF.</p>
        <ManualForm mode="bon" />
      </div>
      <div>
        <h2 style={{ fontSize: "1.3rem" }}>Documents des dernières courses</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Course</th><th>Client</th><th>Prix</th><th>Documents</th></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={4} className="muted">Aucune course confirmée.</td></tr>}
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>{fmtDT(b.pickup_at)}<br /><span className="muted">{b.origin_label.split(",")[0]} → {b.dest_label.split(",")[0]}</span></td>
                  <td>{b.customer_name}</td>
                  <td>{euro(b.price_cents)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <a className="btn ghost small" href={docPath("bon", b.id)} target="_blank" rel="noopener">Bon de commande</a>
                      {b.status === "confirmed" && <a className="btn ghost small" href={docPath("note", b.id)} target="_blank" rel="noopener">Note</a>}
                      {b.invoice_number && <a className="btn ghost small" href={docPath("facture", b.id)} target="_blank" rel="noopener">Facture</a>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPage>
  );
}
