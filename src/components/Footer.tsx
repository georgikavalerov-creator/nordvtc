import Link from "next/link";
import { CookieLink } from "./CookieNotice";
import Logo from "@/components/Logo";
import PaymentBadges from "@/components/PaymentBadges";
import { SITE } from "@/lib/site";
import { CREDITS } from "@/lib/images";
import { SERVICES } from "@/lib/services";
import { ThemeSwitch } from "@/components/ThemeToggle";
import FooterOpen from "@/components/FooterOpen";

const INFOS: [string, string][] = [
  ["/tarifs", "Tarifs"],
  ["/vtc", "Villes desservies"],
  ["/faq", "Questions fréquentes"],
  ["/guide", "Guide"],
  ["/contact", "Contact"],
];
const LEGAL: [string, string][] = [
  ["/cgv", "CGV"],
  ["/mentions-legales", "Mentions légales"],
  ["/confidentialite", "Confidentialité"],
  ["/credits-photos", "Crédits photos"],
];

// Pied de page compact : sur mobile, les listes se replient (un toucher pour les ouvrir).
export default function Footer() {
  return (
    <footer className="site-footer ft">
      <FooterOpen />
      <div className="wrap ft-top">
        <div className="ft-brand">
          <strong><Logo size={34} variant="light" />{SITE.name}</strong>
          <p>Chauffeur privé (VTC) à Lille et dans la métropole : aéroports, gares, Paris, Bruxelles, sur réservation.</p>
          <p className="ft-contact"><Link href="/reservation">Réserver</Link> · <Link href="/contact#appel">Être rappelé</Link> · <a href="mailto:contact@nordvtc.fr">contact@nordvtc.fr</a></p>
        </div>
        <details className="ft-col">
          <summary>Trajets</summary>
          <ul className="ft-trips">
            {SERVICES.map((s) => (
              <li key={s.slug}><Link href={`/services/${s.slug}`}>{s.label}</Link></li>
            ))}
          </ul>
        </details>
        <details className="ft-col">
          <summary>Informations</summary>
          <ul>
            {INFOS.map(([h, l]) => <li key={h}><Link href={h}>{l}</Link></li>)}
          </ul>
        </details>
      </div>
      <div className="wrap ft-bottom">
        <PaymentBadges dark />
        <ThemeSwitch />
      </div>
      <div className="wrap ft-legal">
        <span>© {new Date().getFullYear()} {SITE.name} — {SITE.legal.form}, SIRET {SITE.legal.siret}</span>
        <span className="ft-legal-links">{LEGAL.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}<CookieLink /></span>
        <small>{CREDITS}</small>
      </div>
    </footer>
  );
}
