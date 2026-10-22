"use client";
import { useEffect, useState } from "react";
import TripPass, { type Trip } from "./TripPass";

/** Carrousel « carte postale » des trajets, chargé seulement sur grand écran (pas de photos lourdes sur mobile). */
export default function HeroPass({ trips }: { trips: Trip[] }) {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 901px)");
    const on = () => setWide(m.matches);
    on(); m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return wide ? <div className="hd-pass"><TripPass trips={trips} /></div> : null;
}
