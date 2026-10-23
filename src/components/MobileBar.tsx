"use client";
import { useEffect } from "react";
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
  const hidden = path.startsWith("/reservation") || path.startsWith("/admin") || path.startsWith("/doc");
  // Le flou du bas est coupé tant que la carte animée (bloc « Du clic à la portière ») est à l'écran :
  // un flou d'arrière-plan posé sur un canvas redessiné à chaque image scintille sur iPhone.
  useEffect(() => {
    const story = document.getElementById("cine-story");
    if (hidden || !story) return;
    const io = new IntersectionObserver(([e]) => document.documentElement.classList.toggle("over-canvas", e.isIntersecting));
    io.observe(story);
    return () => { io.disconnect(); document.documentElement.classList.remove("over-canvas"); };
  }, [hidden, path]);
  if (hidden) return null;
  return (
    <>
    <div className="edge-blur" aria-hidden="true"><i /><i /><i /><i /></div>
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
    </>
  );
}
