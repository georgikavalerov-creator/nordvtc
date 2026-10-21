import type { Metadata } from "next";
import { DriverPage } from "../gate";
import ManualForm from "../../admin/ManualForm";
import { createDriverBooking } from "../actions";

export const metadata: Metadata = { title: "Nouveau bon de commande", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <DriverPage title="Nouveau bon de commande">
      {() => (
        <>
          <p className="muted" style={{ margin: 0 }}>Renseignez le client et le trajet : le bon de commande est généré avec vos mentions légales, prêt à imprimer ou à enregistrer en PDF. La course est ajoutée à « Mes courses », d'où vous l'envoyez à votre agenda.</p>
          <ManualForm mode="bon" action={createDriverBooking as never} />
        </>
      )}
    </DriverPage>
  );
}
