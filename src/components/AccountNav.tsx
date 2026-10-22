"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IconC from "./IconC";
import type { CIName } from "./icons-client";

const ITEMS: { href: string; label: string; icon: CIName; exact?: boolean }[] = [
  { href: "/compte", label: "Tableau de bord", icon: "grid", exact: true },
  { href: "/compte/trajets", label: "Mes trajets", icon: "route" },
  { href: "/compte/adresses", label: "Adresses", icon: "pin" },
  { href: "/compte/profil", label: "Profil", icon: "user" },
  { href: "/compte/securite", label: "Sécurité", icon: "shield" },
  { href: "/compte/aide", label: "Aide", icon: "headset" },
];
export default function AccountNav() {
  const path = usePathname();
  return (
    <nav className="acc-nav" aria-label="Espace personnel">
      <div className="acc-nav-list">
        {ITEMS.map((i) => {
          const on = i.exact ? path === i.href : path.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href} aria-current={on ? "page" : undefined} className={on ? "on" : ""}>
              <IconC name={i.icon} size={20} /><span>{i.label}</span>
            </Link>
          );
        })}
      </div>
      <form action="/auth/signout" method="post" className="acc-out">
        <button type="submit">Se déconnecter</button>
      </form>
    </nav>
  );
}
