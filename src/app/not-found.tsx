import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap center">
        <span className="eyebrow">Erreur 404</span>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>Cette page n'existe pas</h1>
        <p className="muted">Le lien est peut-être erroné. Revenez à l'accueil ou réservez votre trajet.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn">Accueil</Link>
          <Link href="/reservation" className="btn ghost">Réserver</Link>
        </div>
      </div>
    </section>
  );
}
