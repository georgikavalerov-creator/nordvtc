"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [["/chauffeur", "Accueil"], ["/chauffeur/nouvelle", "Nouveau bon / course"], ["/chauffeur/courses", "Mes courses"], ["/chauffeur/profil", "Mon profil"]] as const;
export default function DriverNav() {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Espace chauffeur">
      {ITEMS.map(([href, label]) => {
        const on = href === "/chauffeur" ? path === href : path.startsWith(href);
        return <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>{label}</Link>;
      })}
    </nav>
  );
}
