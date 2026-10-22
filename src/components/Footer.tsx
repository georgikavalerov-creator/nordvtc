import Link from "next/link";
import Logo from "@/components/Logo";
import PaymentBadges from "@/components/PaymentBadges";
import { SITE } from "@/lib/site";
import { CREDITS } from "@/lib/images";
import { SERVICES } from "@/lib/services";
import { ThemeSwitch } from "@/components/ThemeToggle";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap cols">
        <div>
          <strong style={{ fontSize: "1.2rem", color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}><Logo size={40} variant="light" />{SITE.name}</strong>
          <p style={{ marginTop: 8 }}>
            Chauffeur privé (VTC) à Lille. Transferts aéroports et gares, trajets longue distance, sur réservation.
          </p>
          <p><Link href="/contact#appel">Appeler ou être rappelé</Link></p>
        </div>
        <div>
          <strong style={{ color: "var(--text)" }}>Trajets</strong>
          <ul style={{ marginTop: 8 }}>
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`}>{s.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <strong style={{ color: "var(--text)" }}>Informations</strong>
          <ul style={{ marginTop: 8 }}>
            <li><Link href="/tarifs">Tarifs</Link></li>
            <li><Link href="/vtc">Villes desservies</Link></li>
            <li><Link href="/guide">Guide</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/cgv">Conditions générales de vente</Link></li>
            <li><Link href="/mentions-legales">Mentions légales</Link></li>
            <li><Link href="/confidentialite">Confidentialité</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap" style={{ marginTop: 28 }}>
        <PaymentBadges dark />
      </div>
      <div className="wrap" style={{ marginTop: 18 }}>
        <ThemeSwitch />
      </div>
      <div className="wrap footer-legal" style={{ marginTop: 18 }}>
        © {new Date().getFullYear()} {SITE.name} — {SITE.legal.form}, SIRET {SITE.legal.siret}
        <br />
        <small style={{ opacity: 0.7 }}>{CREDITS} <Link href="/credits-photos" style={{ textDecoration: "underline" }}>Crédits</Link></small>
      </div>
    </footer>
  );
}
