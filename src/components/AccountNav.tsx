"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/compte", label: "Accueil", exact: true },
  { href: "/compte/trajets", label: "Trajets" },
  { href: "/compte/adresses", label: "Adresses" },
  { href: "/compte/profil", label: "Profil" },
  { href: "/compte/securite", label: "Sécurité" },
  { href: "/compte/aide", label: "Aide" },
];
export default function AccountNav() {
  const path = usePathname();
  return (
    <nav className="acc-nav" aria-label="Espace personnel">
      {ITEMS.map((i) => {
        const on = i.exact ? path === i.href : path.startsWith(i.href);
        return <Link key={i.href} href={i.href} aria-current={on ? "page" : undefined} className={on ? "on" : ""}>{i.label}</Link>;
      })}
      <form action="/auth/signout" method="post" className="acc-out">
        <button type="submit">Se déconnecter</button>
      </form>
    </nav>
  );
}
