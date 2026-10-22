import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import { verifyDoc, type DocType } from "@/lib/docsign";
import { db, dbConfigured } from "@/lib/supabase";
import { euro } from "@/lib/pricing";
import { SITE } from "@/lib/site";
import { getSiteSettings } from "@/lib/content";
import { getLogo } from "@/lib/logo";
import { logSecurity } from "@/lib/security-log";

export const metadata: Metadata = { title: "Document", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ type: string; id: string }>; searchParams: Promise<{ k?: string }> };

const dt = (iso: string, withTime = true) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(new Date(iso));
const METHOD: Record<string, string> = { card: "carte bancaire à bord", cash: "espèces à bord", none: "aucun solde à régler" };

export default async function Doc({ params, searchParams }: Props) {
  const { type, id } = await params;
  const { k } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id) || !verifyDoc(type, id, k) || !dbConfigured()) {
    if (k) await logSecurity("doc_bad_link", undefined, { type, id: id.slice(0, 40) });
    notFound();
  }
  const t = type as DocType;
  let { data: b } = await db().from("bookings").select("*").eq("id", id).maybeSingle();
  if (!b) notFound();
  if (t === "bon") {
    if (!["confirmed", "completed"].includes(b.status)) notFound();
    if (!b.order_number) { await db().rpc("issue_order", { bid: id }); b = (await db().from("bookings").select("*").eq("id", id).single()).data!; }
  }
  if (t === "note" && b.status !== "confirmed") notFound();
  if (t === "facture" && !b.invoice_number) notFound();
  const cfg = await getSiteSettings();
  // Course d'un chauffeur externe : l'exploitant est le chauffeur, avec ses propres mentions légales.
  const drv = b.driver_id ? (await db().from("drivers").select("*").eq("id", b.driver_id).maybeSingle()).data : null;
  const L = drv
    ? { owner: drv.name, registeredName: drv.company || drv.name, form: drv.legal_form || "", siret: drv.siret || "", registre: drv.registre || "", insurer: drv.insurer || "", vatNote: drv.vat_note || "", carteVtc: drv.carte_vtc || "", vehicule: drv.vehicule || "", plaque: drv.plaque || "" }
    : { ...SITE.legal, carteVtc: cfg.carteVtc || SITE.legal.carteVtc, vehicule: cfg.vehicule || SITE.legal.vehicule, plaque: cfg.plaque || SITE.legal.plaque };
  const logo = drv ? drv.logo : await getLogo();
  const sellerAddress = drv ? drv.address || "" : SITE.address;
  const email = drv ? drv.email : cfg.email || SITE.email;
  const seller = (
    <div>
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" style={{ maxHeight: 64, maxWidth: 220, objectFit: "contain", display: "block", marginBottom: 10 }} />
      )}
      <strong style={{ fontSize: "1.15rem" }}>{L.registeredName}</strong>{!drv && <> — {SITE.name}</>}<br />
      {L.form}<br />SIRET {L.siret}<br />
      {sellerAddress || "[adresse professionnelle à compléter]"}<br />{drv?.phone && <>{drv.phone}<br /></>}
      {email && <>{email}<br /></>}
      {t === "bon" && <>N° d'inscription au registre des exploitants VTC : <strong>{L.registre}</strong></>}
    </div>
  );
  const pro = !!b.billing_company;
  const rest = Math.max(0, b.price_cents - b.paid_cents);
  const title = t === "bon" ? "Bon de commande — justificatif de réservation préalable" : t === "note" ? "Note de prestation (provisoire)" : "Facture";
  const number = t === "bon" ? b.order_number : t === "facture" ? b.invoice_number : `Réf. ${b.id.slice(0, 8).toUpperCase()}`;

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <div className="no-print" style={{ marginBottom: 16 }}><PrintButton /></div>
        <div className="invoice">
          <header>
            {seller}
            <div style={{ textAlign: "right" }}>
              <strong style={{ fontSize: "1.15rem" }}>{title}</strong><br />
              N° {number}<br />
              {t === "facture" ? <>Émise le {dt(b.invoice_issued_at, false)}</> : <>Réservation passée le {dt(b.created_at)}</>}
            </div>
          </header>

          <p><strong>Client :</strong> {b.billing_company || b.customer_name}{pro && <> (contact : {b.customer_name})</>}<br />
            {b.billing_address && <>{b.billing_address}<br /></>}{pro && b.billing_siren && <>SIREN {b.billing_siren}<br /></>}
            {b.customer_email}{t !== "facture" && <> · {b.customer_phone}</>}</p>

          <table>
            <tbody>
              <tr><td>Date et heure de prise en charge</td><td><strong>{dt(b.pickup_at)}</strong></td></tr>
              <tr><td>Lieu de prise en charge</td><td>{b.origin_label}</td></tr>
              <tr><td>Destination</td><td>{b.dest_label}</td></tr>
              <tr><td>Passagers / bagages</td><td>{b.passengers} / {b.luggage}{b.flight ? ` · ${b.flight}` : ""}</td></tr>
              {(b.child_seat || b.pet) && <tr><td>Options</td><td>{[b.child_seat && "Siège enfant ou rehausseur", b.pet && "Animal de compagnie"].filter(Boolean).join(" · ")}</td></tr>}
              {t === "bon" && <tr><td>Distance estimée</td><td>{(b.distance_m / 1000).toFixed(0)} km · ~{Math.round(b.duration_s / 60)} min</td></tr>}
            </tbody>
          </table>

          {t !== "bon" ? (
            <table>
              <thead><tr><th>Désignation</th><th style={{ textAlign: "right" }}>Montant TTC</th></tr></thead>
              <tbody>
                <tr><td>Transport public routier de personnes (VTC), course du {dt(b.pickup_at, false)}</td><td style={{ textAlign: "right" }}>{euro(b.price_cents + b.discount_cents)}</td></tr>
                {b.discount_cents > 0 && <tr><td>Remise — code {b.promo_code}</td><td style={{ textAlign: "right" }}>−{euro(b.discount_cents)}</td></tr>}
              </tbody>
              <tfoot>
                <tr><td><strong>Total à payer TTC</strong></td><td style={{ textAlign: "right" }}><strong>{euro(b.price_cents)}</strong></td></tr>
                <tr><td>Réglé en ligne ({b.pay_mode === "full" ? "totalité" : "acompte"})</td><td style={{ textAlign: "right" }}>{euro(b.paid_cents)}</td></tr>
                <tr><td>{t === "facture" ? `Solde réglé (${METHOD[b.balance_method ?? "none"]})` : "Reste à régler à bord"}</td><td style={{ textAlign: "right" }}>{euro(rest)}</td></tr>
              </tfoot>
            </table>
          ) : (
            <p><strong>Prix convenu à la réservation :</strong> {euro(b.price_cents)} TTC — payé en ligne : {euro(b.paid_cents)} — reste à bord : {euro(rest)}.</p>
          )}

          {t === "bon" && (
            <table>
              <tbody>
                <tr><td>Conducteur</td><td>{L.owner}· carte professionnelle VTC n° {L.carteVtc}</td></tr>
                <tr><td>Véhicule</td><td>{L.vehicule} · immatriculation <strong>{L.plaque}</strong></td></tr>
                <tr><td>Prix total TTC</td><td><strong>{euro(b.price_cents)}</strong> · {L.vatNote}</td></tr>
                <tr><td>Paiement</td><td>{b.paid_cents > 0 ? `${euro(b.paid_cents)} réglés` : "Aucun règlement à ce jour"} · reste à régler : {euro(rest)} (à bord, carte bancaire ou espèces)</td></tr>
                <tr><td>Assurance</td><td>Responsabilité civile professionnelle : {L.insurer}</td></tr>
              </tbody>
            </table>
          )}
          {t === "bon" && <p className="muted">Ce document atteste d'une réservation préalable effectuée par le client auprès de l'exploitant ci-dessus (art. L3120-2 et R3122-8 du code des transports). À présenter à tout contrôle. Annulation et modification : voir les conditions générales de vente sur {SITE.url.replace(/^https?:\/\//, "")}/cgv. Médiation de la consommation : {cfg.mediatorName ? `${cfg.mediatorName}${cfg.mediatorUrl ? ` (${cfg.mediatorUrl.replace(/^https?:\/\//, "")})` : ""}` : "coordonnées du médiateur dans les mentions légales"}.</p>}
          {t === "bon" && <p style={{ marginTop: 28, display: "flex", justifyContent: "space-between", gap: 24 }}><span>Fait à {sellerAddress.split(",").pop()?.trim().replace(/^\d{5}\s*/, "") || "Lille"}, le {dt(b.created_at, false)}</span><span>Signature du client : ______________</span></p>}
          {t === "note" && <p className="muted">Note remise avant le paiement du solde. Elle ne vaut pas facture : la facture définitive numérotée est émise à la fin de la course et envoyée par e-mail.</p>}
          {t === "facture" && (
            <p className="muted">
              {L.vatNote}. Paiement comptant, sans escompte.
              {pro && <> En cas de retard de paiement : pénalités au taux de 3 fois le taux d'intérêt légal et indemnité forfaitaire de recouvrement de 40 €.</>}
              <br />Date de la prestation : {dt(b.pickup_at, false)}.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
