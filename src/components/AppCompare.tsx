import Icon from "@/components/Icon";

// Comparatif objectif avec les applications de VTC (sans citer de marque) : ce qui change concrètement pour le client.
const ROWS: [string, string, string][] = [
  ["Prix", "Fixé à la réservation, jamais revu à la hausse", "Peut grimper avec la demande, la météo ou l'heure"],
  ["Ponctualité", "Chauffeur sur place avant l'heure convenue", "Chauffeur trouvé au dernier moment, délai variable"],
  ["Votre chauffeur", "Le même, connu à l'avance, joignable directement", "Attribué au hasard, différent à chaque course"],
  ["Annulation", "Une course réservée est assurée", "Annulations de chauffeurs possibles au dernier moment"],
  ["Vol ou train en retard", "Suivi gratuit, 25 min d'attente offertes après l'atterrissage", "Attente souvent facturée après quelques minutes"],
  ["À bord", "Eau offerte, chargeurs USB-C et Lightning, Wi-Fi sur demande", "Variable selon le chauffeur"],
  ["Enfants", "Siège ou rehausseur sur demande à la réservation", "Rarement garanti"],
  ["Bagages", "Déclarés à la réservation, coffre prévu, aide au chargement", "Découverts à l'arrivée du véhicule"],
  ["Service client", "Une vraie personne : chat, téléphone, e-mail", "Assistance automatisée dans l'application"],
  ["Facture", "Facture et bon de commande à votre nom ou au nom de l'entreprise", "Reçu standard"],
];

const PERKS: [string, string][] = [
  ["water", "Bouteille d'eau offerte"],
  ["timer", "À l'heure, toujours"],
  ["plug", "Chargeurs à bord"],
  ["suitcase", "Aide aux bagages"],
  ["baby", "Siège enfant sur demande"],
  ["plane", "Suivi de vol gratuit"],
  ["leaf", "Hybride silencieuse"],
  ["receipt", "Facture fournie"],
];

export default function AppCompare() {
  return (
    <section className="section compare">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Comparez</span>
          <h2>Un chauffeur privé, pas une application</h2>
          <p className="muted" style={{ maxWidth: 680 }}>Le même trajet, deux expériences très différentes. Voici ce que vous gagnez concrètement à réserver directement.</p>
        </div>
        <ul className="perks" aria-label="Inclus dans chaque course">
          {PERKS.map(([i, t]) => (
            <li key={t}><Icon name={i} size={20} />{t}</li>
          ))}
        </ul>
        <div className="cmp" role="table" aria-label="Comparatif Nord VTC et applications de VTC">
          <div className="cmp-row cmp-head" role="row">
            <span role="columnheader" />
            <span role="columnheader" className="cmp-us">Nord VTC</span>
            <span role="columnheader">Applications de VTC</span>
          </div>
          {ROWS.map(([k, us, them]) => (
            <div key={k} className="cmp-row" role="row">
              <span role="rowheader" className="cmp-k">{k}</span>
              <span role="cell" className="cmp-us"><Icon name="check" size={18} /><span>{us}</span></span>
              <span role="cell" className="cmp-them"><Icon name="x" size={16} mono /><span>{them}</span></span>
            </div>
          ))}
        </div>
        <p className="muted" style={{ fontSize: ".8rem", marginTop: 10 }}>Comparaison générale avec le fonctionnement habituel des applications de réservation de VTC ; les conditions varient selon l&apos;application et le moment.</p>
      </div>
    </section>
  );
}
