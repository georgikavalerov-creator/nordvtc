"use client";
import { useEffect } from "react";

// Sur ordinateur, les listes du pied de page sont toujours dépliées ; sur mobile elles restent repliées.
export default function FooterOpen() {
  useEffect(() => {
    const sync = () => document.querySelectorAll<HTMLDetailsElement>(".ft-col").forEach((d) => { if (window.innerWidth > 900) d.open = true; });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  return null;
}
