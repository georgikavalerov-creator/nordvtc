import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { SITE } from "@/lib/site";
import { DEFAULT_PRICING } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente de Nord VTC : réservation, prix fixé, acompte, annulation et paiement.",
  alternates: { canonical: "/cgv" },
};

export default function CGV() {
  return (
    <LegalShell title="Conditions générales de vente">
      <p className="muted">Modèle de départ à faire relire et valider avant la mise en ligne.</p>

      <h2>1. Objet</h2>
      <p>
        Les présentes conditions régissent les réservations de transport de personnes avec chauffeur effectuées sur {SITE.name} (exploité par {SITE.legal.owner}, SIRET {SITE.legal.siret}).
      </p>

      <h2>2. Réservation et prix</h2>
      <p>
        Le prix est calculé à partir de l'itinéraire entre les adresses saisies et affiché avant la confirmation. Il est ferme une fois la réservation confirmée, sauf modification des adresses, de l'horaire ou du nombre de passagers demandée par le client. La réservation en ligne est possible au moins {DEFAULT_PRICING.minLeadHours} heures avant la prise en charge.
      </p>

      <h2>3. Paiement</h2>
      <p>
        Le client règle en ligne, par carte bancaire, soit un acompte, soit la totalité du prix, au moment de la réservation. Le solde éventuel est réglé au chauffeur à la fin de la course. Les prix sont indiqués en euros toutes taxes comprises (TVA non applicable, art. 293 B du CGI). Un reçu est disponible dans l'espace personnel ; une note ou facture est remise sur demande, et systématiquement pour toute prestation d'au moins 25 € TTC. Les paiements en ligne sont traités par Stripe.
      </p>

      <h2>4. Annulation et modification</h2>
      <p>
        Annulation ou modification gratuite jusqu'à 24 heures avant la prise en charge : l'acompte est remboursé. Moins de 24 heures avant, ou en cas d'absence du client, l'acompte reste acquis au prestataire. Si le prestataire annule, le client est intégralement remboursé. L'annulation peut être faite en un clic depuis l'espace personnel ; en cas d'annulation plus de 24 heures à l'avance, le remboursement est émis automatiquement sur le moyen de paiement utilisé, sous quelques jours ouvrés.
      </p>

      <h2>4 bis. Codes promotionnels</h2>
      <p>
        Un code promotionnel s'applique au prix du trajet pour la réservation en cours, dans les limites indiquées lors de sa saisie (validité, montant minimum, nombre d'utilisations). Il n'est ni cumulable avec un autre code, ni échangeable, ni remboursable en espèces. En cas d'annulation remboursée, seul le montant réellement payé est remboursé.
      </p>
      <h2>5. Retards et attente</h2>
      <p>
        Pour un transfert aéroport ou gare, le chauffeur adapte la prise en charge à l'horaire réel du vol ou du train. Un temps d'attente raisonnable est inclus ; au-delà, un supplément peut être appliqué, annoncé avant la course.
      </p>

      <h2>6. Obligations du client</h2>
      <p>
        Le client fournit des informations exactes (adresses, horaire, nombre de passagers et de bagages). Le respect des règles de sécurité à bord (ceinture, siège enfant adapté) est obligatoire. Tout comportement mettant en danger le chauffeur ou les passagers peut entraîner l'interruption de la course.
      </p>

      <h2>7. Droit de rétractation</h2>
      <p>
        Conformément à l'article L221-28 du code de la consommation, le droit de rétractation ne s'applique pas aux prestations de transport de personnes fournies à une date déterminée.
      </p>

      <h2>8. Responsabilité</h2>
      <p>
        Le véhicule est assuré pour le transport de personnes. Le prestataire ne saurait être tenu responsable des retards dus à des circonstances exceptionnelles (accident, intempéries, fermeture de voie).
      </p>

      <h2>9. Données personnelles</h2>
      <p>
        Voir la <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>10. Litiges</h2>
      <p>
        En cas de litige, le client peut contacter le prestataire pour une solution amiable, puis recourir au médiateur de la consommation indiqué dans les <a href="/mentions-legales">mentions légales</a>. Le droit français est applicable.
      </p>
    </LegalShell>
  );
}
