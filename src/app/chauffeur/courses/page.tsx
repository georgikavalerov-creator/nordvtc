import type { Metadata } from "next";
import { db } from "@/lib/supabase";
import { docPath } from "@/lib/docsign";
import CalButtons from "../../admin/CalButtons";
import { DriverPage } from "../gate";
import { cancelDriverBooking } from "../actions";
import { STATUS, euro, fmtDT, type Booking } from "../../admin/lib";

export const metadata: Metadata = { title: "Mes courses", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ ouvrir?: string }> }) {
  const open = (await searchParams).ouvrir;
  return (
    <DriverPage title="Mes courses">
      {async (d) => {
        const { data } = await db().from("bookings").select("*").eq("driver_id", d.id).neq("status", "expired").order("pickup_at", { ascending: false }).limit(200);
        const rows = (data as Booking[]) ?? [];
        return (
          <div style={{ display: "grid", gap: 12 }}>
            {rows.length === 0 && <p className="muted">Aucune course pour le moment.</p>}
            {rows.map((b) => {
              const st = STATUS[b.status] ?? { label: b.status, cls: "" };
              return (
                <details key={b.id} className="adm-box" open={open === b.id}>
                  <summary style={{ cursor: "pointer", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <strong>{fmtDT(b.pickup_at)}</strong><span className={`badge ${st.cls}`}>{st.label}</span>
                    <span>{b.customer_name}</span><span className="muted">{b.origin_label.split(",")[0]} → {b.dest_label.split(",")[0]}</span>
                    <span style={{ marginLeft: "auto" }}>{euro(b.price_cents)}</span>
                  </summary>
                  <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                    <p style={{ margin: 0 }}><a href={`tel:${b.customer_phone}`}>{b.customer_phone}</a>{b.customer_email && <> · <a href={`mailto:${b.customer_email}`}>{b.customer_email}</a></>}</p>
                    <p className="muted" style={{ margin: 0 }}>{b.origin_label} → {b.dest_label} · {b.passengers} pers. · {b.luggage} bag.{b.flight ? ` · ${b.flight}` : ""}{b.notes ? ` · « ${b.notes} »` : ""}</p>
                    {b.status === "confirmed" && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <a className="btn ghost small" href={docPath("bon", b.id)} target="_blank" rel="noopener">Bon de commande</a>
                        <CalButtons b={b as never} base="/chauffeur/ics" />
                        <form action={cancelDriverBooking}><input type="hidden" name="id" value={b.id} /><button className="btn ghost small">Annuler la course</button></form>
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        );
      }}
    </DriverPage>
  );
}
