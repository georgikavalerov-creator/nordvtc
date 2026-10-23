import type { Metadata } from "next";
import RatingBadge from "@/components/RatingBadge";
import BookingForm from "@/components/BookingForm";
import Icon from "@/components/Icon";
import { currentUser } from "@/lib/auth";
import { getPlaces, getProfile } from "@/lib/account";
import { suggestPlaces } from "@/lib/here";
import { signPlace } from "@/lib/place-sign";
import { knownPlace } from "@/lib/known-places";
import PaymentBadges from "@/components/PaymentBadges";

export const metadata: Metadata = {
  title: "Réserver un chauffeur privé à Lille",
  description:
    "Calculez le prix de votre trajet en direct et réservez votre chauffeur privé à Lille avec un acompte sécurisé en ligne.",
  alternates: { canonical: "/reservation" },
};

type Props = { searchParams: Promise<{ from?: string; to?: string; o?: string; d?: string; date?: string; time?: string }> };

export default async function ReservationPage({ searchParams }: Props) {
  const { from = "", to = "", o, d, date, time } = await searchParams;
  // Liens depuis les cartes postales et les trajets proposés : adresses trouvées avant l'affichage.
  const resolve = async (q: string) => {
    const t = q.trim().slice(0, 120);
    if (t.length < 3) return null;
    const known = knownPlace(t); // lieux des liens du site : coordonnées exactes, sans recherche
    if (known) return signPlace(known);
    try {
      const list = await suggestPlaces(t);
      // On évite les parkings (« P4 », « parking ») quand un résultat plus juste existe.
      const r = list.find((x) => !/\bP\d+\b|parking/i.test(x.label)) ?? list[0];
      return r ? signPlace(r) : null;
    } catch { return null; }
  };
  // Adresse déjà choisie dans l'espace client : réutilisée telle quelle si sa signature est valide.
  const unpack = (v?: string) => {
    if (!v) return null;
    const [label, lat, lng, sig] = v.split("|");
    const p = { label: (label ?? "").slice(0, 300), lat: Number(lat), lng: Number(lng) };
    if (!p.label || !Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return null;
    const signed = signPlace(p);
    return sig && signed.sig === sig ? signed : null;
  };
  const [initialOrigin, initialDest] = await Promise.all([unpack(o) ?? resolve(from), unpack(d) ?? resolve(to)]);
  const initialDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
  const initialTime = time && /^\d{2}:\d{2}$/.test(time) ? time : "";
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
            <BookingForm initialFrom={from.slice(0, 120)} initialTo={to.slice(0, 120)} initialOrigin={initialOrigin} initialDest={initialDest} initialDate={initialDate} initialTime={initialTime} accountName={prof?.full_name ?? (user?.user_metadata?.full_name as string) ?? ""} accountEmail={user?.email ?? ""} accountPhone={prof?.phone ?? ""} defaultPassengers={prof?.default_passengers ?? 1} defaultChildSeat={prof?.default_child_seat ?? false} defaultPet={prof?.default_pet ?? false} savedPlaces={places} />
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
            <RatingBadge className="rb-aside" />
            <PaymentBadges />
            <p className="reassure-phone">Une question ? <a href="/contact#appel">Appeler ou être rappelé</a></p>
          </aside>
        </div>
      </section>
    </>
  );
}
