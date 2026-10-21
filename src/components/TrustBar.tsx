import Icon from "@/components/Icon";

const ITEMS = [
  { icon: "badge", title: "Un chauffeur identifié", text: "Cartes VTC et taxi, nom et voiture connus avant" },
  { icon: "lock", title: "Prix figé", text: "Aucun tarif dynamique ni frais surprise" },
  { icon: "undo", title: "Annulation gratuite", text: "Jusqu'à 24 h avant le départ" },
  { icon: "receipt", title: "Facture fournie", text: "Pour particuliers et entreprises" },
];

export default function TrustBar() {
  return (
    <section className="trustbar" aria-label="Nos garanties">
      <div className="wrap trustbar-grid">
        {ITEMS.map((it) => (
          <div key={it.title} className="trust-item">
            <span className="trust-ico"><Icon name={it.icon} size={22} /></span>
            <span>
              <strong>{it.title}</strong>
              <small>{it.text}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
