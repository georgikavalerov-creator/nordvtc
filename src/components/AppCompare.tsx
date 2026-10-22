import Icon from "@/components/Icon";

// Comparatif objectif avec les applications de VTC (sans citer de marque) : ce qui change concrètement pour le client.
const ROWS: [string, string, string, string][] = [
  ["euro", "Prix", "Fixé à la réservation, jamais revu à la hausse", "Peut grimper avec la demande, la météo ou l'heure"],
  ["clock", "Ponctualité", "Chauffeur sur place avant l'heure convenue", "Chauffeur trouvé au dernier moment, délai variable"],
  ["user", "Votre chauffeur", "Le même, connu à l'avance, joignable directement", "Attribué au hasard, différent à chaque course"],
  ["shield", "Annulation", "Une course réservée est assurée", "Annulations de chauffeurs possibles au dernier moment"],
  ["plane", "Vol ou train en retard", "Suivi gratuit, 25 min d'attente offertes après l'atterrissage", "Attente souvent facturée après quelques minutes"],
  ["water", "À bord", "Eau offerte, chargeurs USB-C et Lightning, Wi-Fi sur demande", "Variable selon le chauffeur"],
  ["baby", "Enfants", "Siège ou rehausseur sur demande à la réservation", "Rarement garanti"],
  ["suitcase", "Bagages", "Déclarés à la réservation, coffre prévu, aide au chargement", "Découverts à l'arrivée du véhicule"],
  ["headset", "Service client", "Une vraie personne : chat, téléphone, e-mail", "Assistance automatisée dans l'application"],
  ["receipt", "Facture", "Facture et bon de commande à votre nom ou au nom de l'entreprise", "Reçu standard"],
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
            <span role="columnheader" className="cmp-us"><b>Nord VTC</b><small>Chauffeur privé, réservation directe</small></span>
            <span role="columnheader" className="cmp-them-h"><b>Applications de VTC</b><small>Chauffeur attribué par la plateforme</small></span>
          </div>
          {ROWS.map(([ic, k, us, them]) => (
            <div key={k} className="cmp-row" role="row">
              <span role="rowheader" className="cmp-k"><span className="cmp-ki"><Icon name={ic} size={18} /></span>{k}</span>
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
