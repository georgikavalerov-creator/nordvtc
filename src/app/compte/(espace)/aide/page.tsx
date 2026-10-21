import Link from "next/link";
export const metadata = { title: "Aide" };
const Q: [string, string][] = [
  ["Comment modifier ou annuler une réservation ?", "Ouvrez le trajet dans « Mes trajets » puis « Modifier ou annuler ». L'annulation est gratuite jusqu'à 24 h avant la prise en charge : l'acompte est alors remboursé."],
  ["Où trouver mon reçu ?", "Dans le détail de chaque trajet confirmé ou terminé, bouton « Reçu / facture » : imprimez-le ou enregistrez-le en PDF."],
  ["Je ne vois pas une ancienne réservation.", "Connectez-vous avec l'adresse e-mail utilisée lors de la réservation : elle est rattachée automatiquement à votre compte."],
  ["Mon chauffeur est en retard ou j'ai oublié un objet.", "Appelez-nous depuis la page contact : le numéro s'affiche en quelques secondes."],
  ["Comment régler le solde ?", "Le solde se règle à bord (carte ou espèces). Le montant restant figure dans le détail du trajet."],
];
export default function Aide() {
  return (
    <>
      <h1 className="acc-title">Aide</h1>
      {Q.map(([q, a]) => <details key={q} className="faq-item"><summary>{q}</summary><p>{a}</p></details>)}
      <div className="trip-actions" style={{ marginTop: 20 }}>
        <Link className="btn" href="/contact#appel">Appeler ou être rappelé</Link>
        <Link className="btn ghost" href="/contact">Écrire un message</Link>
      </div>
    </>
  );
}
