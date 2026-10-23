import Link from "next/link";
import { NAV, SITE } from "@/lib/site";
import Logo from "@/components/Logo";
import NavMenu from "@/components/NavMenu";
import { ThemeButton } from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link prefetch={false} href="/" className="brand" title="Accueil">
          <Logo size={44} variant="light" />
          <span className="brand-text">
            <span className="brand-name">NORD VTC</span>
            <span className="brand-tag">Chauffeur privé · Lille</span>
          </span>
        </Link>
        <NavMenu items={NAV} />
        <ThemeButton />
      </div>
    </header>
  );
}
