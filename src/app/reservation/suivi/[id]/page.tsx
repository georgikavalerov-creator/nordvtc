import type { Metadata } from "next";
import { Route } from "@/components/TripCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import AutoRefresh from "@/components/AutoRefresh";
import CancelTrip from "@/components/CancelTrip";
import { cancelPolicy, fmtDate, STATUS } from "@/lib/account";
import { docPath, trackPath, verifyTrack } from "@/lib/docsign";
import { euro } from "@/lib/pricing";
import { db, dbConfigured } from "@/lib/supabase";
import { getSiteSettings } from "@/lib/content";
import { cancelByLink, claimByLink, modifyByLink } from "./actions";
import ModifyTrip from "@/components/ModifyTrip";
import { canModify } from "@/lib/modify";
import { modifyInitial } from "@/lib/modify-initial";
import ClaimCancel from "@/components/ClaimCancel";
import { claimOpen, latestClaim } from "@/lib/claim";

export const metadata: Metadata = { title: "Suivi de ma réservation", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ k?: string }> };

// Suivi d'une réservation SANS compte : accessible uniquement avec le lien signé (reçu par e-mail ou affiché après le paiement).
export default async function Suivi({ params, searchParams }: Props) {
  const { id } = await params;
  const { k } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id) || !verifyTrack(id, k) || !dbConfigured()) notFound();
  const { data: b } = await db()
    .from("bookings")
    .select("id,group_id,is_return,status,origin_label,origin_lat,origin_lng,dest_label,dest_lat,dest_lng,notes,pickup_at,passengers,luggage,flight,child_seat,pet,price_cents,paid_cents,customer_name")
    .eq("id", id)
    .maybeSingle();
  if (!b || b.status === "expired") notFound();
  const { data: sibs } = b.group_id
    ? await db().from("bookings").select("id,is_return,pickup_at,status").eq("group_id", b.group_id).neq("id", b.id).neq("status", "expired")
    : { data: null };
  const st = STATUS[b.status] ?? { label: b.status, cls: "" };
  const rest = Math.max(0, b.price_cents - b.paid_cents);
  const pending = b.status === "pending_payment";
  const pol = cancelPolicy(b.pickup_at, b.paid_cents, b.price_cents);
  const claim = await latestClaim(b.id);
  const editable = await canModify(b.status, b.pickup_at);
  const phone = (await getSiteSettings()).driverPhone || process.env.DRIVER_PHONE || "";
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 680 }}>
        <span className="eyebrow">{b.is_return ? "Ma réservation · retour" : "Ma réservation"}</span>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.6rem)" }}>Bonjour {b.customer_name.split(" ")[0]}</h1>
        {pending && (
          <>
            <AutoRefresh />
            <p className="notice" role="status">Votre paiement est en cours de validation : cette page se met à jour toute seule.</p>
          </>
        )}
        <article className="trip-card">
          <header>
            <strong>{fmtDate(b.pickup_at)}</strong>
            <span className={`pill ${st.cls}`}>{st.label}</span>
          </header>
          <Route from={b.origin_label} to={b.dest_label} />
          <p className="muted" style={{ margin: "0 0 8px" }}>
            {b.passengers} passager{b.passengers > 1 ? "s" : ""} · {b.luggage} bagage{b.luggage > 1 ? "s" : ""}
            {b.child_seat ? " · siège enfant" : ""}{b.pet ? " · animal de compagnie" : ""}{b.flight ? ` · ${b.flight}` : ""}
          </p>
          <p className="trip-price">
            <strong>{euro(b.price_cents)}</strong> <span className="muted">· Réf. {b.id.slice(0, 8).toUpperCase()}</span>
          </p>
          <p className="muted" style={{ margin: 0 }}>
            Réglé en ligne : {euro(b.paid_cents)}{b.status === "confirmed" && rest > 0 ? ` · reste ${euro(rest)} à régler à bord` : ""}
          </p>
        </article>
        {sibs?.map((x) => (
          <p key={x.id} className="notice" style={{ marginTop: 10 }}>
            {x.is_return ? "Trajet retour" : "Trajet aller"} : {fmtDate(x.pickup_at)} · <Link href={trackPath(x.id)}>voir le suivi</Link>
          </p>
        ))}
        <div className="btn-row">
          {["confirmed", "completed"].includes(b.status) && (
            <Link href={docPath("bon", b.id)} className="btn">Bon de commande</Link>
          )}
          {editable ? <ModifyTrip initial={modifyInitial(b)} action={modifyByLink.bind(null, b.id, k as string)} label="Modifier mon trajet" />
            : <Link href="/contact" className="btn ghost">Modifier mon trajet</Link>}
          {b.status === "confirmed" && pol.canCancel && (
            <CancelTrip
              id={b.id}
              refundLabel={pol.refundCents > 0 ? euro(pol.refundCents) : null}
              keptLabel={pol.keptCents > 0 ? euro(pol.keptCents) : null}
              full
              action={cancelByLink.bind(null, b.id, k as string)}
            />
          )}
        </div>
        {(claimOpen(b.status, b.pickup_at) || claim?.status === "pending") && (
          <ClaimCancel action={claimByLink.bind(null, b.id, k as string)} status={claim?.status ?? null} />
        )}
        {b.status === "cancelled" && <p className="notice" role="status" style={{ marginTop: 14 }}>Cette réservation est annulée. Un e-mail de confirmation vous a été envoyé.</p>}
        <p className="muted" style={{ marginTop: 18, fontSize: ".9rem" }}>
          Conservez ce lien : il vous permet de retrouver votre réservation sans compte.
          {phone ? ` Une question ? Appelez le ${phone} ou répondez à l'e-mail de confirmation.` : " Une question ? Répondez à l'e-mail de confirmation."}
        </p>
      </div>
    </section>
  );
}
