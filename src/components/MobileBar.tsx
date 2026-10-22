"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IconC from "./IconC";

const I = { home: "home", trips: "trips", book: "book", user: "user" } as const;
const TABS = [
  { href: "/", label: "Accueil", icon: I.home, match: (p: string) => p === "/" },
  { href: "/services", label: "Trajets", icon: I.trips, match: (p: string) => p.startsWith("/services") || p.startsWith("/tarifs") },
  { href: "/reservation", label: "Réserver", icon: I.book, match: (p: string) => p.startsWith("/reservation") },
  { href: "/compte", label: "Compte", icon: I.user, match: (p: string) => p.startsWith("/compte") || p.startsWith("/contact") },
];

// Barre d'onglets flottante arrondie (mobile et tablette), comme une application.
export default function MobileBar() {
  const path = usePathname();
  if (path.startsWith("/reservation") || path.startsWith("/admin") || path.startsWith("/doc")) return null;
  return (
    <nav className="mbar" aria-label="Navigation rapide">
      {TABS.map((t) => {
        const on = t.match(path);
        return (
          <Link key={t.href} href={t.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
            <IconC name={t.icon} size={24} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
