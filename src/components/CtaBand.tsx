import Link from "next/link";

// Bandeau d'appel à l'action réutilisable en bas de page : une action principale, une action secondaire.
export default function CtaBand({ title = "Votre prix en 30 secondes, sans compte à créer.", text = "Entrez votre trajet : le prix ferme s'affiche, vous décidez ensuite.", from, to }: { title?: string; text?: string; from?: string; to?: string }) {
  const q = from || to ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) })}` : "";
  return (
    <section className="section">
      <div className="wrap">
        <div className="cta-band" data-fx="" suppressHydrationWarning>
          <h2>{title}</h2>
          <p>{text}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 10 }}>
            <Link href={`/reservation${q}`} className="btn btn-arrow">Voir mon prix maintenant</Link>
            <Link href="/contact#appel" className="btn ghost-light">Être rappelé gratuitement</Link>
          </div>
          <ul className="cta-points" aria-label="Nos engagements">
            <li>Prix ferme affiché d'avance</li>
            <li>Annulation gratuite 24 h avant</li>
            <li>Eau, chargeur et Wi-Fi à bord</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
