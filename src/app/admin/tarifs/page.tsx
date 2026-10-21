import type { Metadata } from "next";
import { db, dbConfigured, getPricing } from "@/lib/supabase";
import { euro } from "@/lib/pricing";
import PricingForm from "../PricingForm";
import { createPromo, togglePromo } from "../actions";
import { AdminPage } from "../gate";

export const metadata: Metadata = { title: "Administration · Tarifs", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const pricing = await getPricing();
  const { data: promos } = dbConfigured() ? await db().from("promo_codes").select("*").order("created_at", { ascending: false }) : { data: [] };
  const fmt = (iso: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "short" }).format(new Date(iso));
  return (
    <AdminPage title="Tarifs & promos">
      <div style={{ display: "grid", gap: 40 }}>
<div>
          <h2 style={{ fontSize: "1.4rem" }}>Tarifs et acompte</h2>
          <p className="muted">Modifiez les valeurs ci-dessous : elles s'appliquent immédiatement au calculateur et aux nouvelles réservations.</p>
          {dbConfigured() ? <PricingForm pricing={pricing} /> : <p className="notice">Connectez Supabase pour modifier les tarifs depuis cette page.</p>}
        </div>

        <div>
          <h2 style={{ fontSize: "1.4rem" }}>Codes promo</h2>
          <form action={createPromo} className="form" style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", alignItems: "end" }}>
            <label>Code<input name="code" required placeholder="BIENVENUE10" /></label>
            <label>Type<select name="kind"><option value="percent">Pourcentage (%)</option><option value="amount">Montant (€)</option></select></label>
            <label>Valeur<input name="value" type="number" step="1" min="1" required placeholder="10" /></label>
            <label>Utilisations max (vide = illimité)<input name="max_uses" type="number" min="1" /></label>
            <label>Expire le<input name="expires_at" type="date" /></label>
            <label>Trajet minimum (€)<input name="min_price_eur" type="number" min="0" defaultValue={0} /></label>
            <label className="inline"><input type="checkbox" name="first_booking_only" /> <span>1re réservation seulement</span></label>
            <button className="btn small">Créer / mettre à jour</button>
          </form>
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table>
              <thead><tr><th>Code</th><th>Remise</th><th>Limites</th><th></th></tr></thead>
              <tbody>
                {(promos ?? []).map((c: { code: string; kind: string; value: number; active: boolean; max_uses: number | null; expires_at: string | null; first_booking_only: boolean }) => (
                  <tr key={c.code}>
                    <td><strong>{c.code}</strong> {!c.active && <span className="badge bad">désactivé</span>}</td>
                    <td>{c.kind === "percent" ? `${c.value} %` : euro(c.value)}</td>
                    <td className="muted">{c.max_uses ? `${c.max_uses} max` : "illimité"}{c.expires_at ? ` · jusqu'au ${fmt(c.expires_at)}` : ""}{c.first_booking_only ? " · 1re résa" : ""}</td>
                    <td><form action={togglePromo}><input type="hidden" name="code" value={c.code} /><input type="hidden" name="active" value={c.active ? "0" : "1"} /><button className="btn ghost small">{c.active ? "Désactiver" : "Activer"}</button></form></td>
                  </tr>
                ))}
                {!promos?.length && <tr><td colSpan={4} className="muted">Aucun code.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

              </div>
    </AdminPage>
  );
}
