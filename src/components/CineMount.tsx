"use client";
import { useEffect } from "react";
import { mountCine } from "@/lib/cineScene";

// Démarre la scène animée (canvas) d'une section marquée .cine-root.
export default function CineMount({ target }: { target: string }) {
  useEffect(() => {
    const el = document.getElementById(target);
    return el ? mountCine(el) : undefined;
  }, [target]);
  return null;
}
