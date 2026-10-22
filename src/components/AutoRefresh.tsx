"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Recharge les données de la page toutes les quelques secondes (ex. confirmation de paiement en cours), puis s'arrête.
export default function AutoRefresh({ every = 4000, max = 15 }: { every?: number; max?: number }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      if (++n > max) return clearInterval(t);
      router.refresh();
    }, every);
    return () => clearInterval(t);
  }, [router, every, max]);
  return null;
}
