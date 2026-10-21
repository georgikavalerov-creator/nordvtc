import Icon from "@/components/Icon";

const ITEMS = [
  { icon: "bolt", title: "Rechargez votre téléphone", text: "Câbles de charge à bord (USB-C et Lightning)" },
  { icon: "drop", title: "Une bouteille d'eau", text: "Offerte à chaque passager" },
  { icon: "wifi", title: "Wi-Fi sur demande", text: "Connexion partagée si vous en avez besoin" },
];

// Équipements offerts à bord : à afficher près de la présentation du véhicule.
export default function OnBoard() {
  return (
    <div className="onboard" role="list" aria-label="À bord">
      {ITEMS.map((it) => (
        <div key={it.title} className="onboard-item" role="listitem">
          <span className="trust-ico"><Icon name={it.icon} size={22} /></span>
          <span><strong>{it.title}</strong><small>{it.text}</small></span>
        </div>
      ))}
    </div>
  );
}
