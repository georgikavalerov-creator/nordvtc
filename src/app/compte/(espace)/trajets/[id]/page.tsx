import { writeReviewUrl } from "@/lib/google-reviews";
import Link from "next/link";
import { notFound } from "next/navigation";
import RateTrip from "@/components/RateTrip";
import CancelTrip from "@/components/CancelTrip";
import ClaimCancel from "@/components/ClaimCancel";
import { claimOpen, latestClaim } from "@/lib/claim";
import { claimMine } from "@/app/compte/(espace)/actions";
import { rebookHref } from "@/components/TripCard";
import { cancelPolicy, fmtDate, requireUser, STATUS, userBooking } from "@/lib/account";
import { db } from "@/lib/supabase";
import { docPath } from "@/lib/docsign";
import { euro } from "@/lib/pricing";

export const metadata = { title: "Détail du trajet" };
type Props = { params: Promise<{ id: string }> };

export default async function Detail({ params }: Props) {
  const { id } = await params;
  const user = await requireUser(`/compte/trajets/${id}`);
  const b = await userBooking(user, id);
  const claim = b ? await latestClaim(b.id) : null;
  if (!b) notFound();
  const st = STATUS[b.status] ?? { label: b.status, cls: "" };
  const pol = cancelPolicy(b.pickup_at, b.paid_cents, b.price_cents);
  const rest = Math.max(0, b.price_cents - b.paid_cents);
  const { data: rating } = await db().from("trip_ratings").select("stars,comment").eq("booking_id", b.id).maybeSingle();
  const steps = [
    { l: "Réservation enregistrée", d: fmtDate(b.created_at), on: true },
    { l: "Paiement reçu", d: b.paid_at ? fmtDate(b.paid_at) : "", on: b.paid_cents > 0 },
    { l: "Course", d: fmtDate(b.pickup_at), on: b.status === "completed" || b.status === "confirmed" },
    { l: "Terminée", d: "", on: b.status === "completed" },
  ];
  const help = (s: string) => `/contact?sujet=${encodeURIComponent(`${s} — réservation ${b.id.slice(0, 8)}`)}`;
  return (
    <>
      <p><Link href="/compte/trajets" className="linklike">← Mes trajets</Link></p>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <h1 className="acc-title" style={{ margin: 0 }}>{fmtDate(b.pickup_at)}</h1>
        <span className={`pill ${st.cls}`}>{st.label}</span>
      </div>
      <div className="trip-card">
        <p className="trip-route"><span>{b.origin_label}</span><span aria-hidden="true">↓</span><span>{b.dest_label}</span></p>
        <p className="muted trip-meta">{(b.distance_m / 1000).toFixed(0)} km · environ {Math.round(b.duration_s / 60)} min · {b.passengers} passager{b.passengers > 1 ? "s" : ""} · {b.luggage} bagage{b.luggage > 1 ? "s" : ""}{b.child_seat ? " · siège enfant" : ""}{b.flight ? ` · ${b.flight}` : ""}</p>
        {b.notes && <p className="muted trip-meta">Note : {b.notes}</p>}
      </div>

      {b.status !== "cancelled" && (
        <ol className="timeline">
          {steps.map((s) => <li key={s.l} className={s.on ? "on" : ""}><strong>{s.l}</strong>{s.d && <span className="muted"> · {s.d}</span>}</li>)}
        </ol>
      )}

      <h2 className="acc-h">Paiement</h2>
      <dl className="pay-list">
        {b.discount_cents > 0 && <div><dt>Prix initial</dt><dd>{euro(b.price_cents + b.discount_cents)}</dd></div>}
        {b.discount_cents > 0 && <div><dt>Code {b.promo_code}</dt><dd>−{euro(b.discount_cents)}</dd></div>}
        <div><dt>Prix du trajet</dt><dd>{euro(b.price_cents)}</dd></div>
        {b.status === "cancelled" && b.refunded_cents > 0 && <div><dt>Remboursé</dt><dd>{euro(b.refunded_cents)}</dd></div>}
        <div><dt>Réglé en ligne ({b.pay_mode === "full" ? "total" : "acompte"})</dt><dd>{euro(b.paid_cents)}</dd></div>
        {b.status === "confirmed" && <div><dt>Reste à régler à bord</dt><dd><strong>{euro(rest)}</strong></dd></div>}
      </dl>
      <div className="trip-actions">
        {(b.status === "confirmed" || b.status === "completed") && <Link className="btn small" href={docPath("bon", b.id)}>Bon de commande</Link>}
        {b.status === "confirmed" && <Link className="btn small ghost" href={docPath("note", b.id)}>Note provisoire</Link>}
        {b.status === "completed" && <Link className="btn small" href={docPath("facture", b.id)}>Facture</Link>}
        <Link className="btn small ghost" href={rebookHref(b)}>Réserver à nouveau</Link>
        {b.status === "confirmed" && pol.canCancel && <CancelTrip id={b.id} refundLabel={pol.refundCents > 0 ? euro(pol.refundCents) : null} keptLabel={pol.keptCents > 0 ? euro(pol.keptCents) : null} />}
        {b.status === "confirmed" && <Link className="btn small ghost" href={help("Modification")}>Modifier</Link>}
        <Link className="btn small ghost" href={help("Aide")}>Besoin d'aide</Link>
      </div>
      {(claimOpen(b.status, b.pickup_at) || claim?.status === "pending") && <ClaimCancel action={claimMine.bind(null, b.id)} status={claim?.status ?? null} />}

      {b.status === "completed" && (
        <>
          <h2 className="acc-h">Comment s'est passé votre trajet ?</h2>
          <RateTrip id={b.id} initial={rating?.stars ?? 0} initialComment={rating?.comment ?? ""} googleUrl={writeReviewUrl()} />
        </>
      )}
    </>
  );
}
