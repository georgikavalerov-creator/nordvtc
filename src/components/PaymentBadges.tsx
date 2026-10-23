import Icon from "@/components/Icon";

// Moyens de paiement acceptés par Stripe Checkout (Apple Pay / Google Pay s'affichent selon l'appareil du client).
// Logos en fichiers SVG (public/img/pay) : mis en cache une fois pour tout le site, au lieu d'être recopiés
// dans chaque page. Mêmes dessins qu'avant. Marques citées pour indiquer les moyens acceptés.
const LOGOS: Record<string, [file: string, w: number, h: number]> = {
  "CB": ["cb", 26, 18], "Visa": ["visa", 28, 18], "Mastercard": ["mastercard", 26, 17], "Apple Pay": ["apple-pay", 30, 18], "Google Pay": ["google-pay", 30, 18],
};

function Logo({ name }: { name: string }) {
  const [f, w, h] = LOGOS[name] ?? LOGOS["Google Pay"];
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/img/pay/${f}.svg`} width={w} height={h} alt="" loading="lazy" decoding="async" />;
}

export default function PaymentBadges({ dark = false }: { dark?: boolean }) {
  return (
    <div className={dark ? "paybadges dark" : "paybadges"}>
      <span className="pay-lock"><Icon name="lock" size={16} /> Paiement sécurisé par Stripe</span>
      <span className="pay-cards">
        {["CB", "Visa", "Mastercard", "Apple Pay", "Google Pay"].map((c) => (
          <span key={c} className="pay-chip"><Logo name={c} /><span>{c}</span></span>
        ))}
      </span>
    </div>
  );
}
