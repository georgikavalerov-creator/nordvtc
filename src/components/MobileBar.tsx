"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const I = {
  home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  trips: '<circle cx="6" cy="6" r="1.4"/><circle cx="12" cy="6" r="1.4"/><circle cx="18" cy="6" r="1.4"/><circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/><circle cx="6" cy="18" r="1.4"/><circle cx="12" cy="18" r="1.4"/><circle cx="18" cy="18" r="1.4"/>',
  book: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4M9 15l2 2 4-4"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.600 3.600-5.500 7-5.500s6.200 1.900 7 5.500"/>',
};
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: t.icon }} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
