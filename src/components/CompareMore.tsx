"use client";
import { useState } from "react";

/** Téléphone : bouton qui affiche les lignes masquées du comparatif (sur ordinateur, tout est visible). */
export default function CompareMore({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      className="cmp-more-btn"
      aria-expanded={open}
      onClick={(e) => {
        setOpen((o) => !o);
        e.currentTarget.closest(".compare")?.classList.toggle("cmp-all");
      }}
    >
      {open ? "Masquer le détail" : `Voir les ${count} autres points`}
    </button>
  );
}
