import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Réservation enregistrée",
  robots: { index: false, follow: false },
};

export default function MerciPage() {
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 680, textAlign: "center" }}>
        <span className="eyebrow">Merci</span>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>Votre paiement est reçu</h1>
        <p className="muted">
          Votre réservation sera confirmée dans quelques instants : vous recevrez un e-mail avec le détail du trajet. Pensez à vérifier vos courriers indésirables.
        </p>
        <p className="muted">Une question ou une modification ? Répondez à l'e-mail de confirmation ou passez par la page contact. Retrouvez aussi vos trajets dans <Link href="/compte">votre espace personnel</Link> (connexion avec Google, Apple ou votre e-mail).</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
          <Link href="/compte" className="btn">Voir ma réservation</Link>
          <Link href="/contact" className="btn ghost">Nous contacter</Link>
        </div>
      </div>
    </section>
  );
}
