import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AutoRefresh from "@/components/AutoRefresh";
import { fmtDate, STATUS } from "@/lib/account";
import { docPath, verifyTrack } from "@/lib/docsign";
import { euro } from "@/lib/pricing";
import { db, dbConfigured } from "@/lib/supabase";
import { getSiteSettings } from "@/lib/content";

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
    .select("id,status,origin_label,dest_label,pickup_at,passengers,luggage,flight,child_seat,price_cents,paid_cents,customer_name")
    .eq("id", id)
    .maybeSingle();
  if (!b || b.status === "expired") notFound();
  const st = STATUS[b.status] ?? { label: b.status, cls: "" };
  const rest = Math.max(0, b.price_cents - b.paid_cents);
  const pending = b.status === "pending_payment";
  const phone = (await getSiteSettings()).driverPhone || process.env.DRIVER_PHONE || "";
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 680 }}>
        <span className="eyebrow">Ma réservation</span>
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
          <p className="trip-route"><span>{b.origin_label}</span><span aria-hidden="true">↓</span><span>{b.dest_label}</span></p>
          <p className="muted" style={{ margin: "0 0 8px" }}>
            {b.passengers} passager{b.passengers > 1 ? "s" : ""} · {b.luggage} bagage{b.luggage > 1 ? "s" : ""}
            {b.child_seat ? " · siège enfant" : ""}{b.flight ? ` · vol/train ${b.flight}` : ""}
          </p>
          <p className="trip-price">
            <strong>{euro(b.price_cents)}</strong> <span className="muted">· Réf. {b.id.slice(0, 8).toUpperCase()}</span>
          </p>
          <p className="muted" style={{ margin: 0 }}>
            Réglé en ligne : {euro(b.paid_cents)}{b.status === "confirmed" && rest > 0 ? ` · reste ${euro(rest)} à régler à bord` : ""}
          </p>
        </article>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
          {["confirmed", "completed"].includes(b.status) && (
            <Link href={docPath("bon", b.id)} className="btn">Bon de commande</Link>
          )}
          <Link href="/contact" className="btn ghost">Modifier ou annuler</Link>
        </div>
        <p className="muted" style={{ marginTop: 18, fontSize: ".9rem" }}>
          Conservez ce lien : il vous permet de retrouver votre réservation sans compte.
          {phone ? ` Une question ? Appelez le ${phone} ou répondez à l'e-mail de confirmation.` : " Une question ? Répondez à l'e-mail de confirmation."}
        </p>
      </div>
    </section>
  );
}
