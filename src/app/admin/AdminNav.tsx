"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  ["/admin", "Tableau de bord"],
  ["/admin/reservations", "Réservations"],
  ["/admin/messages", "Messages"],
  ["/admin/calendrier", "Calendrier"],
  ["/admin/documents", "Documents"],
  ["/admin/chauffeurs", "Chauffeurs"],
  ["/admin/guide", "Guide"],
  ["/admin/clients", "Clients"],
  ["/admin/tarifs", "Tarifs & promos"],
  ["/admin/reglages", "Réglages"],
] as const;

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Administration">
      {ITEMS.map(([href, label]) => {
        const on = href === "/admin" ? path === href : path.startsWith(href);
        return <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>{label}</Link>;
      })}
    </nav>
  );
}
