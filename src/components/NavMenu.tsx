"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

// Menu principal : liens en ligne sur ordinateur, bouton « Menu » + panneau sur mobile.
export default function NavMenu({ items }: { items: readonly Item[] }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("menu-open");
    };
  }, [open]);

  return (
    <>
      <nav className={`nav${open ? " open" : ""}`} id="menu-principal" aria-label="Navigation principale">
        {items.map((n) => (
          <Link prefetch={false} key={n.href} href={n.href}>
            {n.label}
          </Link>
        ))}
        <Link prefetch={false} href="/compte">Mon compte</Link>
        <Link prefetch={false} href="/reservation" className="btn small">
          Réserver
        </Link>
      </nav>
      <button
        type="button"
        className="burger"
        aria-expanded={open}
        aria-controls="menu-principal"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>
      {open && <div className="menu-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
    </>
  );
}
