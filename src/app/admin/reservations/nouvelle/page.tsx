import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "../../gate";
import ManualForm from "../../ManualForm";

export const metadata: Metadata = { title: "Administration · Nouvelle réservation", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPage title="Bon de commande" actions={<Link className="btn ghost small" href="/admin/reservations">← Réservations</Link>}>
      <p className="muted" style={{ margin: 0 }}>Pour une course prise hors du site (téléphone, message, client régulier). Elle est créée « confirmée » avec son bon de commande numéroté et toutes les mentions obligatoires, puis ajoutée à vos réservations et à votre agenda.</p>
      <ManualForm mode="bon" stay />
    </AdminPage>
  );
}
