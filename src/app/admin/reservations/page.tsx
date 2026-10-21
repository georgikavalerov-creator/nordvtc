import type { Metadata } from "next";
import { db, dbConfigured } from "@/lib/supabase";
import { docPath } from "@/lib/docsign";
import { AdminPage } from "../gate";
import { RefundForm } from "../Forms";
import CalButtons from "../CalButtons";
import { saveBookingMeta, setStatus } from "../actions";
import { STATUS, euro, fmtDT, type Booking } from "../lib";

export const metadata: Metadata = { title: "Administration · Réservations", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; statut?: string; periode?: string; ouvrir?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const statut = sp.statut ?? "";
  const periode = sp.periode ?? "";
  let rows: Booking[] = [];
  let err = "";
  if (dbConfigured()) {
    let query = db().from("bookings").select("*").neq("status", "expired").order("pickup_at", { ascending: false }).limit(300);
    if (statut) query = query.eq("status", statut);
    const now = Date.now();
    if (periode === "avenir") query = query.gte("pickup_at", new Date(now - 3 * 3600_000).toISOString()).order("pickup_at", { ascending: true });
    if (periode === "passe") query = query.lt("pickup_at", new Date(now).toISOString());
    const { data, error } = await query;
    if (error) err = "Lecture des réservations impossible.";
    rows = (data as Booking[]) ?? [];
  } else err = "Supabase n'est pas configuré.";
  if (q) rows = rows.filter((b) => [b.customer_name, b.customer_email, b.customer_phone, b.origin_label, b.dest_label, b.id].join(" ").toLowerCase().includes(q));

  return (
    <AdminPage title="Réservations" actions={<><a className="btn small" href="/admin/reservations/nouvelle">+ Nouvelle réservation</a><a className="btn ghost small" href="/admin/export?type=reservations">Exporter (CSV)</a></>}>
      <form className="adm-filters" method="get">
        <label>Recherche<input name="q" defaultValue={sp.q ?? ""} placeholder="Nom, e-mail, téléphone, adresse…" /></label>
        <label>Statut
          <select name="statut" defaultValue={statut}>
            <option value="">Tous</option>
            {Object.entries(STATUS).filter(([k]) => k !== "expired").map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label>Période
          <select name="periode" defaultValue={periode}>
            <option value="">Toutes</option><option value="avenir">À venir</option><option value="passe">Passées</option>
          </select>
        </label>
        <button className="btn small">Filtrer</button>
      </form>
      {err && <p className="error">{err}</p>}
      <p className="muted" style={{ margin: 0 }}>{rows.length} réservation(s)</p>
      <div style={{ display: "grid", gap: 12 }}>
        {rows.length === 0 && <p className="muted">Aucune réservation.</p>}
        {rows.map((b) => {
          const st = STATUS[b.status] ?? { label: b.status, cls: "" };
          const left = Math.max(0, b.price_cents - b.paid_cents);
          const refundable = (b.paid_cents ?? 0) - (b.refunded_cents ?? 0);
          return (
            <details key={b.id} className="adm-box" open={sp.ouvrir === "1" && rows.length === 1}>
              <summary style={{ cursor: "pointer", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <strong>{fmtDT(b.pickup_at)}</strong>
                <span className={`badge ${st.cls}`}>{st.label}</span>
                <span>{b.customer_name}</span>
                <span className="muted">{b.origin_label} → {b.dest_label}</span>
                <span style={{ marginLeft: "auto" }}>{euro(b.price_cents)}</span>
              </summary>
              <div className="grid cols-2" style={{ gap: 18, marginTop: 14, alignItems: "start" }}>
                <div>
                  <p style={{ margin: 0 }}>
                    <a href={`tel:${b.customer_phone}`}>{b.customer_phone}</a> · <a href={`mailto:${b.customer_email}`}>{b.customer_email}</a>
                  </p>
                  <p className="muted" style={{ margin: "6px 0" }}>
                    {b.passengers} pers. · {b.luggage} bag.{b.child_seat ? " · siège enfant" : ""}{b.flight ? ` · vol ${b.flight}` : ""}
                  </p>
                  {b.notes && <p>« {b.notes} »</p>}
                  <p className="muted" style={{ margin: "6px 0" }}>
                    Prix {euro(b.price_cents)} · réglé {euro(b.paid_cents)}{b.refunded_cents ? ` · remboursé ${euro(b.refunded_cents)}` : ""} · reste {euro(left)}
                  </p>
                  <p className="muted" style={{ margin: 0, fontSize: ".8rem" }}>Réf. {b.id.slice(0, 8)}</p>
                  {b.status !== "pending_payment" && <div style={{ marginTop: 10 }}><CalButtons b={b as never} /></div>}
                  {(b.status === "confirmed" || b.status === "completed") && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                      <a className="btn ghost small" href={docPath("bon", b.id)} target="_blank" rel="noopener">Bon de commande</a>
                      {b.status === "confirmed" && <a className="btn ghost small" href={docPath("note", b.id)} target="_blank" rel="noopener">Note provisoire</a>}
                      {b.status === "completed" && <a className="btn ghost small" href={docPath("facture", b.id)} target="_blank" rel="noopener">Facture</a>}
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gap: 14 }}>
                  <form action={saveBookingMeta} className="form" style={{ display: "grid", gap: 6 }}>
                    <input type="hidden" name="id" value={b.id} />
                    <label>Chauffeur<input name="driver" defaultValue={b.driver ?? ""} placeholder="Moi, Rémy, Stéphanie…" /></label>
                    <label>Note interne (invisible du client)<textarea name="admin_note" style={{ minHeight: 60 }} defaultValue={b.admin_note ?? ""} /></label>
                    <button className="btn ghost small">Enregistrer</button>
                  </form>
                  {b.status === "confirmed" && (
                    <div style={{ display: "grid", gap: 8 }}>
                      <form action={setStatus} style={{ display: "grid", gap: 6 }}>
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="status" value="completed" />
                        <select name="method" aria-label="Règlement du solde" defaultValue={left > 0 ? "card" : "none"}>
                          <option value="card">Solde payé par carte</option>
                          <option value="cash">Solde payé en espèces</option>
                          <option value="none">Rien à régler</option>
                        </select>
                        <button className="btn small">Terminer + facture</button>
                      </form>
                      <form action={setStatus}>
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="status" value="cancelled" />
                        <button className="btn ghost small">Annuler (sans remboursement)</button>
                      </form>
                    </div>
                  )}
                  {refundable > 0 && b.status !== "pending_payment" && <RefundForm id={b.id} max={refundable} />}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </AdminPage>
  );
}
