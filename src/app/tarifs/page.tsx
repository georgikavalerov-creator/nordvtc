import type { Metadata } from "next";
import CtaBand from "@/components/CtaBand";
import Link from "next/link";
import { FORFAITS } from "@/lib/forfaits";
import { DEFAULT_PRICING } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Tarifs chauffeur privé Lille",
  description:
    "Prix indicatifs des transferts aéroport, gares, métropole lilloise et longues distances. Le prix exact est calculé selon vos adresses avant la réservation.",
  alternates: { canonical: "/tarifs" },
};

export default function TarifsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Tarifs</span>
          <h1>Des prix annoncés avant la course</h1>
          <p className="muted prose">
            Les prix ci-dessous sont indicatifs, au départ de Lille centre. Pour connaître le prix exact de votre trajet, utilisez le calculateur : il tient compte de vos adresses réelles.
          </p>
          <Link href="/reservation" className="btn" style={{ marginTop: 10 }}>Calculer mon prix</Link>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ display: "grid", gap: 40 }}>
          {FORFAITS.map((g) => (
            <div key={g.title}>
              <h2 style={{ fontSize: "1.5rem" }}>{g.title}</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Trajet</th>
                      <th>Durée estimée</th>
                      <th>Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((r) => (
                      <tr key={r.route}>
                        <td>
                          {r.route}
                          {r.note && <div className="muted" style={{ fontSize: "0.85rem" }}>{r.note}</div>}
                        </td>
                        <td className="muted">{r.duration ?? "—"}</td>
                        <td className="price">{r.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section alt">
        <div className="wrap grid cols-2" style={{ gap: 48 }}>
          <div>
            <span className="eyebrow">Bon à savoir</span>
            <h2>Comment le prix est fixé</h2>
            <p className="muted">
              Le prix est calculé à partir de l'itinéraire réel entre vos deux adresses. Il est affiché avant la réservation et ne change plus ensuite, quels que soient la circulation ou les détours liés au trafic.
            </p>
            <p className="muted">
              Une majoration de {DEFAULT_PRICING.nightSurchargePct} % s'applique pour les prises en charge entre {DEFAULT_PRICING.nightStartHour} h et {DEFAULT_PRICING.nightEndHour} h.
            </p>
          </div>
          <div>
            <span className="eyebrow">Paiement</span>
            <h2>Acompte puis solde à bord</h2>
            <p className="muted">
              Vous réglez un acompte en ligne, par carte, pour confirmer la réservation. Le solde se règle au chauffeur à bord. Vous pouvez aussi choisir de payer la totalité en ligne.
            </p>
            <p className="muted">Un bon de commande vous est remis à la réservation et une facture numérotée vous est envoyée par e-mail à la fin de la course.</p>
          </div>
        </div>
      </section>
      <CtaBand title="Calculez le prix exact de votre trajet" text="Indiquez départ et arrivée : prix ferme, sans engagement." />
    </>
  );
}
