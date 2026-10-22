"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";

/** Envoie un événement de mesure une seule fois par onglet (ex. réservation payée). */
export default function TrackOnce({ event, id }: { event: string; id: string }) {
  useEffect(() => {
    const key = `nvtc-tracked-${event}-${id}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch { /* navigation privée */ }
    track(event);
  }, [event, id]);
  return null;
}
