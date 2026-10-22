import type { Metadata } from "next";
import { db, dbConfigured } from "@/lib/supabase";
import { AdminPage } from "../gate";
import { AdminDriverForm, NewDriverForm, ResetPasswordForm } from "../DriverForms";
import { toggleDriver } from "../actions";
import { fmtD } from "../lib";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Administration · Chauffeurs", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type D = { id: string; name: string; email: string; phone: string | null; active: boolean; company: string | null; legal_form: string | null; siret: string | null; address: string | null; registre: string | null; carte_vtc: string | null; vehicule: string | null; plaque: string | null; insurer: string | null; vat_note: string | null; last_login_at: string | null };

export default async function Page() {
  let drivers: D[] = [];
  const counts = new Map<string, number>();
  if (dbConfigured()) {
    drivers = ((await db().from("drivers").select("id,name,email,phone,active,company,legal_form,siret,address,registre,carte_vtc,vehicule,plaque,insurer,vat_note,last_login_at").order("created_at", { ascending: false })).data as D[]) ?? [];
    const { data } = await db().from("bookings").select("driver_id").not("driver_id", "is", null).neq("status", "expired");
    for (const r of data ?? []) counts.set(r.driver_id, (counts.get(r.driver_id) ?? 0) + 1);
  }
  return (
    <AdminPage title="Chauffeurs externes">
      <p className="muted" style={{ margin: 0 }}>Chaque chauffeur a son espace sur <strong>{SITE.url.replace(/^https?:\/\//, "")}/chauffeur</strong> : il y crée ses réservations, génère ses bons de commande avec <em>ses propres</em> mentions légales et les ajoute à son agenda. Il ne voit que ses courses.</p>
      <NewDriverForm />
      <div style={{ display: "grid", gap: 10 }}>
        {drivers.length === 0 && <p className="muted">Aucun chauffeur pour le moment.</p>}
        {drivers.map((d) => {
          const incomplete = !d.registre || !d.plaque || !d.company;
          return (
            <div key={d.id} className="adm-box" style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", alignItems: "start" }}>
              <div>
                <strong>{d.name}</strong> {!d.active && <span className="badge bad">désactivé</span>}<br />
                <a href={`mailto:${d.email}`}>{d.email}</a>{d.phone && <> · <a href={`tel:${d.phone}`}>{d.phone}</a></>}<br />
                <span className="muted">{counts.get(d.id) ?? 0} course(s) · {d.last_login_at ? `connecté le ${fmtD(d.last_login_at)}` : "jamais connecté"}</span>
                {incomplete && <div className="muted" style={{ fontSize: ".82rem" }}>Profil légal incomplet (société, registre VTC, plaque) : complétez-le ci-dessous ou laissez le chauffeur le faire depuis son espace.</div>}
              </div>
              <ResetPasswordForm id={d.id} />
              <form action={toggleDriver}>
                <input type="hidden" name="id" value={d.id} /><input type="hidden" name="active" value={d.active ? "0" : "1"} />
                <button className="btn ghost small">{d.active ? "Désactiver l'accès" : "Réactiver"}</button>
              </form>
              <div style={{ gridColumn: "1 / -1" }}><AdminDriverForm d={d} /></div>
            </div>
          );
        })}
      </div>
    </AdminPage>
  );
}
