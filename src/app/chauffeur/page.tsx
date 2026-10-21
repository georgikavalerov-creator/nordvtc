import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/supabase";
import { driverAgendaToken } from "@/lib/driver-auth";
import { SITE } from "@/lib/site";
import { DriverPage } from "./gate";
import { euro, fmtDT, type Booking } from "../admin/lib";

export const metadata: Metadata = { title: "Espace chauffeur", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <DriverPage title="Espace chauffeur">
      {async (d) => {
        const { data } = await db().from("bookings").select("*").eq("driver_id", d.id).eq("status", "confirmed").gte("pickup_at", new Date(Date.now() - 3 * 3600_000).toISOString()).order("pickup_at").limit(10);
        const next = (data as Booking[]) ?? [];
        const complete = d.registre && d.carte_vtc && d.plaque && d.insurer && d.siret && d.address && d.company;
        const feed = `${SITE.url.replace(/^https?:\/\//, "")}/api/agenda/chauffeur/${d.id}/${driverAgendaToken(d.id)}`;
        return (
          <>
            {!complete && <p className="notice">Avant d'émettre un bon de commande, <Link href="/chauffeur/profil">complétez votre profil</Link> : vos mentions légales (société, SIRET, registre VTC, carte pro, véhicule, assurance) y sont demandées.</p>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn" href="/chauffeur/nouvelle">+ Nouveau bon de commande</Link>
              <Link className="btn ghost" href="/chauffeur/courses">Mes courses</Link>
            </div>
            <div className="adm-box">
              <strong>Prochaines courses</strong>
              {next.length === 0 ? <p className="muted">Aucune course à venir.</p> : (
                <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                  {next.map((b) => (
                    <li key={b.id} style={{ marginBottom: 6 }}>
                      <strong>{fmtDT(b.pickup_at)}</strong> · {b.customer_name} · <a href={`tel:${b.customer_phone}`}>{b.customer_phone}</a><br />
                      <span className="muted">{b.origin_label} → {b.dest_label} · {euro(b.price_cents)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="adm-box">
              <strong>Synchroniser mon agenda</strong>
              <p className="muted" style={{ margin: "6px 0 10px" }}>Vos courses arrivent seules dans votre agenda, avec client, téléphone, adresses, prix et rappels.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a className="btn small" href={`webcal://${feed}`}>S'abonner sur iPhone</a>
                <a className="btn small" href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(`webcal://${feed}`)}`} target="_blank" rel="noopener">S'abonner sur Android (Google Agenda)</a>
              </div>
              <p className="muted" style={{ fontSize: ".82rem", margin: "10px 0 0" }}>Lien privé, ne le partagez pas : <code style={{ wordBreak: "break-all" }}>https://{feed}</code></p>
            </div>
          </>
        );
      }}
    </DriverPage>
  );
}
