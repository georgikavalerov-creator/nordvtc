"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Menu de l'administration, rangé par usage (colonne à gauche sur ordinateur, bande défilante sur téléphone).
const GROUPS = [
  ["Activité", [["/admin", "Tableau de bord"], ["/admin/reservations", "Réservations"], ["/admin/calendrier", "Calendrier"], ["/admin/messages", "Messages"]]],
  ["Documents", [["/admin/reservations/nouvelle", "+ Bon de commande"], ["/admin/documents", "Documents"], ["/admin/import", "Importer des courses"]]],
  ["Gestion", [["/admin/chauffeurs", "Chauffeurs"], ["/admin/clients", "Clients"], ["/admin/tarifs", "Tarifs & promos"], ["/admin/guide", "Guide"]]],
  ["Compte", [["/admin/securite", "Sécurité"], ["/admin/reglages", "Réglages"]]],
] as const;

export default function AdminNav() {
  const path = usePathname();
  const isOn = (href: string) => href === "/admin" ? path === href : href === "/admin/reservations" ? path.startsWith(href) && !path.startsWith("/admin/reservations/nouvelle") : path.startsWith(href);
  return (
    <nav className="adm-nav adm-side" aria-label="Administration">
      {GROUPS.map(([title, items]) => (
        <div key={title} className="adm-group">
          <span className="adm-group-t">{title}</span>
          {items.map(([href, label]) => {
            const on = isOn(href);
            return <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>{label}</Link>;
          })}
        </div>
      ))}
    </nav>
  );
}
