import Link from "next/link";
import { RATING, RIDES } from "@/components/RatingBadge";
import Icon from "@/components/Icon";
import { SITE } from "@/lib/site";

// Présentation du chauffeur : informations réelles et vérifiables (pas d'avis inventés).
export default function DriverCard() {
  const siret = SITE.legal.siret.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, "$1 $2 $3 $4");
  return (
    <section className="section ink driver" data-fx="" suppressHydrationWarning>
      <div className="wrap driver-grid">
        <div className="driver-id">
          <div className="avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/chauffeur-avatar-manga.webp" alt="Portrait illustré, style manga, de Georgi, votre chauffeur" width={400} height={400} loading="lazy" />
          </div>
          <div>
            <span className="eyebrow">Votre chauffeur</span>
            <h2>Georgi : le même chauffeur du début à la fin</h2>
            <p className="muted">
              Indépendant depuis 2021 et installé à Lesquin, à quelques minutes de l'aéroport. Pas de plateforme entre nous : vous réservez auprès de la personne qui conduit, vous pouvez lui écrire ou l'appeler, et le prix reste celui annoncé.
            </p>
            <div className="driver-stats">
              <div><b>{RIDES}+</b><span>courses réalisées sur les applications VTC</span></div>
              <div><b>{RATING}<small>/5</small> <i aria-hidden="true">★</i></b><span>note moyenne des passagers sur les applications VTC</span></div>
            </div>
            <div className="lang">
              <Icon name="globe" size={18} /> Français · English · Български
            </div>
          </div>
        </div>
        <div className="creds">
          <div className="cred"><Icon name="badge" size={22} /><span><strong>Carte professionnelle VTC</strong><small>Chauffeur en règle, véhicule assuré pour le transport de personnes</small></span></div>
          <div className="cred"><Icon name="shield" size={22} /><span><strong>Carte taxi (CCPCT)</strong><small>Double qualification transport de personnes</small></span></div>
          <div className="cred"><Icon name="receipt" size={22} /><span><strong>Entreprise immatriculée</strong><small>SIRET {siret}</small></span></div>
          <div className="cred"><Icon name="check" size={22} /><span><strong>Prix fixé à la réservation</strong><small>Eau, chargeurs et siège enfant sur demande</small></span></div>
          <Link href="/contact" className="btn ghost-light">Poser une question</Link>
        </div>
      </div>
    </section>
  );
}
