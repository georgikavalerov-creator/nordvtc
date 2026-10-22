import Link from "next/link";

/** Page 404 sobre : on explique et on propose les bons chemins. */
export default function NotFoundFun() {
  return (
    <section className="section nf2">
      <div className="wrap nf2-wrap">
        <span className="eyebrow">Erreur 404</span>
        <h1>Cette page n&apos;existe pas ou a été déplacée</h1>
        <p className="muted">Le lien est peut-être ancien ou incomplet. Voici les pages les plus utiles :</p>
        <div className="nf2-links">
          <Link href="/reservation" className="btn">Réserver un trajet</Link>
          <Link href="/" className="btn ghost">Accueil</Link>
        </div>
        <ul className="nf2-list">
          <li><Link href="/tarifs">Tarifs</Link></li>
          <li><Link href="/services">Trajets : aéroports, gares, longue distance</Link></li>
          <li><Link href="/vtc">Villes desservies</Link></li>
          <li><Link href="/faq">Questions fréquentes</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </div>
    </section>
  );
}
