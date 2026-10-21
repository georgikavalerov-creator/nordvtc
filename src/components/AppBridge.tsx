"use client";
import { useEffect } from "react";

// Dans l'application iOS : retour haptique léger sur les boutons et onglets (plugin natif Haptics de Capacitor).
// Sur le site web, ce composant ne fait rien.
export default function AppBridge() {
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; Plugins?: { Haptics?: { impact: (o: { style: string }) => void } } } }).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    const tap = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.(".btn, .mbar a, .chip, button")) cap.Plugins?.Haptics?.impact({ style: "LIGHT" });
    };
    document.addEventListener("pointerdown", tap, { passive: true });
    return () => document.removeEventListener("pointerdown", tap);
  }, []);
  return null;
}
