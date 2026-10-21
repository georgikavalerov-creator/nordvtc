import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import Icon from "@/components/Icon";
import { currentUser } from "@/lib/auth";
import { getPlaces, getProfile } from "@/lib/account";
import PaymentBadges from "@/components/PaymentBadges";

export const metadata: Metadata = {
  title: "Réserver un chauffeur privé à Lille",
  description:
    "Calculez le prix de votre trajet en direct et réservez votre chauffeur privé à Lille avec un acompte sécurisé en ligne.",
  alternates: { canonical: "/reservation" },
};

type Props = { searchParams: Promise<{ from?: string; to?: string }> };

export default async function ReservationPage({ searchParams }: Props) {
  const { from = "", to = "" } = await searchParams;
  const user = await currentUser();
  const [places, prof] = user ? await Promise.all([getPlaces(user.id), getProfile(user.id)]) : [[], null];
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Réservation</span>
          <h1>Réservez votre trajet</h1>
          <p className="muted prose hide-sm">Le prix s'affiche dès que vous choisissez vos adresses. Vous payez un acompte pour confirmer, le solde se règle à bord.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap booking-layout">
          <div>
            <BookingForm initialFrom={from.slice(0, 120)} initialTo={to.slice(0, 120)} accountName={prof?.full_name ?? (user?.user_metadata?.full_name as string) ?? ""} accountEmail={user?.email ?? ""} accountPhone={prof?.phone ?? ""} defaultPassengers={prof?.default_passengers ?? 1} defaultChildSeat={prof?.default_child_seat ?? false} savedPlaces={places} />
          </div>
          <aside className="reassure">
            <h2>Réservez l'esprit tranquille</h2>
            <ul>
              <li><Icon name="euro" size={20} /><span><strong>Prix ferme</strong>Le montant affiché est le prix total de la course, sans supplément caché.</span></li>
              <li><Icon name="lock" size={20} /><span><strong>Acompte sécurisé</strong>Paiement par carte sur la page sécurisée de Stripe. Aucune donnée bancaire ne transite par ce site.</span></li>
              <li><Icon name="undo" size={20} /><span><strong>Annulation gratuite</strong>Jusqu'à 24 h avant la prise en charge, l'acompte est remboursé.</span></li>
              <li><Icon name="mail" size={20} /><span><strong>Confirmation immédiate</strong>Récapitulatif envoyé par e-mail dès le paiement.</span></li>
              <li><Icon name="plane" size={20} /><span><strong>Vol ou train suivi</strong>L'heure de prise en charge s'adapte au retard.</span></li>
            </ul>
            <PaymentBadges />
            <p className="reassure-phone">Une question ? <a href="/contact#appel">Appeler ou être rappelé</a></p>
          </aside>
        </div>
      </section>
    </>
  );
}
