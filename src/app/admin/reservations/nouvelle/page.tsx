import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "../../gate";
import ManualForm from "../../ManualForm";

export const metadata: Metadata = { title: "Administration · Nouvelle réservation", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPage title="Nouvelle réservation" actions={<Link className="btn ghost small" href="/admin/reservations">← Réservations</Link>}>
      <p className="muted" style={{ margin: 0 }}>Pour une course prise par téléphone ou message. Elle est créée « confirmée », avec bon de commande ; après création, ajoutez-la à votre agenda en un geste.</p>
      <ManualForm />
    </AdminPage>
  );
}
