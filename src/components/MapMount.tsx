"use client";
import { useEffect } from "react";
import { mountMap } from "@/lib/mapScene";

// Carte animée de la métropole lilloise (trajet A → B au défilement).
export default function MapMount({ target }: { target: string }) {
  useEffect(() => {
    const el = document.getElementById(target);
    return el ? mountMap(el) : undefined;
  }, [target]);
  return null;
}
