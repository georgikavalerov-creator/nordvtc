import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { SITE } from "@/lib/site";
import { DEFAULT_PRICING } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente de Nord VTC : réservation, prix ferme, acompte, annulation, attente, bagages et animaux.",
  alternates: { canonical: "/cgv" },
};

// Règles d'attente et de retard : modifier ici si besoin.
const WAIT = {
  addressMin: 15, // attente gratuite à une adresse
  flightMin: 25, // après l'atterrissage réel
  trainMin: 20, // après l'arrivée réelle du train
  eurPer15: "7,50 €", // par quart d'heure entamé au-delà
  noShowMin: 15, // sans nouvelles du client au-delà de l'attente gratuite
  driverLateMin: 20, // retard du chauffeur ouvrant droit à annulation remboursée
};

export default function CGV() {
  const P = DEFAULT_PRICING;
  return (
    <LegalShell title="Conditions générales de vente">
      <p className="muted">Version du 22 octobre 2026.</p>

      <h2>1. Objet et prestataire</h2>
      <p>
        Les présentes conditions régissent les prestations de transport de personnes avec chauffeur (VTC) réservées sur {SITE.name}, exploité par {SITE.legal.owner}, entreprise individuelle, SIRET {SITE.legal.siret}. Les coordonnées complètes, le numéro d'inscription au registre VTC et l'assurance figurent dans les <a href="/mentions-legales">mentions légales</a>. Toute réservation vaut acceptation des présentes conditions.
      </p>

      <h2>2. Réservation</h2>
      <p>
        Les courses s'effectuent exclusivement sur réservation préalable. La réservation en ligne est possible au moins {P.minLeadHours} heures avant la prise en charge ; pour un délai plus court, contactez-nous. La réservation est confirmée à réception du paiement en ligne ; un e-mail de confirmation et un bon de commande sont alors envoyés. Le client renseigne des informations exactes : adresses, date et heure, nombre de passagers et de bagages, numéro de vol ou de train, et toute précision utile (bagage volumineux, animal, siège enfant).
      </p>
      <p>
        Un trajet retour peut être réservé en même temps que l'aller. L'aller et le retour constituent deux courses distinctes, chacune avec son propre prix ; elles peuvent être annulées ou modifiées séparément.
      </p>

      <h2>3. Prix</h2>
      <p>
        Le prix est calculé à partir de l'itinéraire entre les adresses saisies et affiché avant la confirmation. Il comprend le trajet, le carburant et les péages éventuels. Une majoration de {P.nightSurchargePct} % s'applique aux prises en charge entre {P.nightStartHour} h et {P.nightEndHour} h ; elle est incluse dans le prix affiché. Une fois la réservation confirmée, le prix est ferme : il ne varie ni avec la circulation, ni avec l'heure de pointe, ni avec la demande.
      </p>
      <p>
        Seuls peuvent s'ajouter, après accord ou information préalable du client : le temps d'attente au-delà de l'attente gratuite (article 6), un changement d'adresse, d'arrêt ou d'horaire demandé par le client, et les frais de remise en état en cas de dégradation ou de salissure importante du véhicule (article 9). Les prix sont en euros, TVA non applicable (art. 293 B du CGI).
      </p>

      <h2>4. Paiement</h2>
      <p>
        Le client règle en ligne, par carte bancaire ou portefeuille électronique, soit un acompte ({P.depositPct} % du prix), soit la totalité du prix. Le solde éventuel est réglé au chauffeur à la fin de la course. Les paiements en ligne sont traités par Stripe ; aucune donnée bancaire n'est conservée par {SITE.name}. Un reçu est disponible en ligne ; une note est remise pour toute course d'au moins 25 € et sur simple demande, une facture au nom d'une entreprise sur demande lors de la réservation.
      </p>

      <h2>5. Annulation et modification</h2>
      <p>
        <strong>Par le client, plus de 24 heures avant la prise en charge :</strong> annulation gratuite, en un clic depuis le lien de suivi ou l'espace personnel. La somme payée est remboursée automatiquement sur le moyen de paiement utilisé, sous quelques jours ouvrés. Une modification (horaire, adresse) demandée dans ce délai est gratuite, le prix étant recalculé si le trajet change.
      </p>
      <p>
        <strong>Par le client, moins de 24 heures avant, ou en cas d'absence (article 6) :</strong> une somme égale à l'acompte ({P.depositPct} % du prix) reste acquise au prestataire, en dédommagement de la course bloquée. Si le client a payé la totalité en ligne, le surplus lui est remboursé.
      </p>
      <p>
        <strong>Par le prestataire :</strong> en cas d'empêchement, le prestataire prévient le client au plus tôt et le rembourse intégralement, ou lui propose un autre chauffeur avec son accord.
      </p>
      <p>
        <strong>Vol ou train annulé :</strong> sur justificatif, la course est reportée ou annulée sans frais, quel que soit le délai.
      </p>

      <h2>6. Attente, retards et absence</h2>
      <p>
        <strong>Retard du client.</strong> Le chauffeur attend gratuitement {WAIT.addressMin} minutes à une adresse, {WAIT.flightMin} minutes après l'atterrissage réel d'un vol, et {WAIT.trainMin} minutes après l'arrivée réelle d'un train. Les vols et trains dont le numéro est indiqué sont suivis : un retard du vol ou du train ne coûte rien au client. Au-delà de l'attente gratuite, le temps supplémentaire est facturé {WAIT.eurPer15} par quart d'heure entamé, payable au chauffeur ; le client en est informé dès que possible.
      </p>
      <p>
        <strong>Absence du client.</strong> Si le client ne se présente pas et reste injoignable (téléphone et SMS) {WAIT.noShowMin} minutes après la fin de l'attente gratuite, la course est considérée comme annulée de son fait, aux conditions de l'article 5.
      </p>
      <p>
        <strong>Retard du chauffeur.</strong> Le chauffeur prévient le client de tout retard. Si le chauffeur arrive avec plus de {WAIT.driverLateMin} minutes de retard sur l'heure convenue pour une raison qui lui est imputable, le client peut renoncer à la course et être intégralement remboursé. Le prestataire n'est pas responsable des retards dus à un cas de force majeure ou à des circonstances qu'il ne peut maîtriser (accident, fermeture de route, intempéries, contrôle), mais en informe le client sans délai.
      </p>

      <h2>7. Bagages</h2>
      <p>
        Le nombre de bagages est indiqué à la réservation. Les bagages déclarés sont transportés sans supplément, dans la limite de la capacité du coffre et des places libres. Les objets volumineux ou fragiles (poussette, vélo, skis, instrument, fauteuil roulant pliable) doivent être signalés dans les précisions de la réservation : le prestataire confirme alors qu'ils peuvent être transportés.
      </p>
      <p>
        Si les bagages présentés dépassent nettement ce qui a été déclaré et ne peuvent être chargés en sécurité, le chauffeur peut refuser l'excédent. Le prestataire cherche avec le client une solution (second véhicule ou second trajet, sur devis) ; à défaut, le client peut renoncer à la course, aux conditions de l'article 5. Les bagages restent sous la garde du client ; la responsabilité du prestataire est limitée aux dommages causés par sa faute. Sont refusés les matières dangereuses et objets interdits par la loi.
      </p>

      <h2>8. Animaux</h2>
      <p>
        Les chiens guides d'aveugle et chiens d'assistance sont toujours acceptés, gratuitement, avec leur maître. Les autres animaux de compagnie sont acceptés s'ils sont signalés à la réservation : les petits animaux voyagent dans un sac ou une caisse de transport fermée ; les chiens plus grands, tenus en laisse sur une couverture ou une housse fournie par le client, après accord du prestataire. L'animal reste sous la responsabilité de son maître. Un animal non signalé, dangereux ou dont le transport compromet la sécurité peut être refusé.
      </p>

      <h2>9. À bord</h2>
      <p>
        Le port de la ceinture est obligatoire pour tous les passagers. Les enfants de moins de 10 ans voyagent dans un siège ou un rehausseur adapté à leur âge et à leur poids : le client le demande à la réservation. Il est interdit de fumer ou de vapoter dans le véhicule. Le nombre de passagers ne peut dépasser celui indiqué à la réservation ni le nombre de places du véhicule. Tout comportement mettant en danger le chauffeur, les passagers ou les autres usagers peut entraîner l'interruption de la course, sans remboursement. En cas de dégradation ou de salissure importante du véhicule (par un passager ou un animal), les frais de remise en état sont facturés au client sur justificatif.
      </p>
      <p>
        Les objets oubliés à bord sont conservés et restitués sur demande ; leur retour, s'il nécessite un déplacement, est facturé selon le tarif d'une course.
      </p>

      <h2>10. Droit de rétractation</h2>
      <p>
        Conformément au code de la consommation (article L221-2), le droit de rétractation ne s'applique pas aux contrats de transport de passagers. Les conditions d'annulation de l'article 5 s'appliquent.
      </p>

      <h2>11. Responsabilité et assurance</h2>
      <p>
        Le véhicule et le transport de personnes sont couverts par une assurance responsabilité civile professionnelle (voir les <a href="/mentions-legales">mentions légales</a>). Le prestataire n'est pas responsable des conséquences d'un retard dû à la force majeure, notamment d'un vol ou d'un train manqué ; il recommande au client de prévoir une marge suffisante avant un départ en avion ou en train.
      </p>

      <h2>12. Données personnelles</h2>
      <p>
        Voir la <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>13. Réclamations et litiges</h2>
      <p>
        Toute réclamation est adressée par écrit via la <a href="/contact">page contact</a>. À défaut de solution amiable dans un délai de deux mois, le client consommateur peut recourir gratuitement au médiateur de la consommation indiqué dans les <a href="/mentions-legales">mentions légales</a>. Le droit français est applicable.
      </p>
    </LegalShell>
  );
}
