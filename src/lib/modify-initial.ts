import { signPlace } from "@/lib/place-sign";
import type { ModifyInitial } from "@/components/ModifyTrip";

const TZ = "Europe/Paris";
/** Valeurs de départ du formulaire de modification (adresses signées, date et heure à Paris). */
export function modifyInitial(b: {
  origin_label: string; origin_lat: number; origin_lng: number; dest_label: string; dest_lat: number; dest_lng: number;
  pickup_at: string; passengers: number; luggage: number; flight: string | null; child_seat: boolean; pet?: boolean | null; notes: string | null;
}): ModifyInitial {
  const at = new Date(b.pickup_at);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
  const time = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(at).replace(/\s?h\s?/, ":");
  return {
    origin: signPlace({ label: b.origin_label, lat: b.origin_lat, lng: b.origin_lng }),
    dest: signPlace({ label: b.dest_label, lat: b.dest_lat, lng: b.dest_lng }),
    date, time, passengers: b.passengers, luggage: b.luggage, flight: b.flight ?? "",
    childSeat: !!b.child_seat, pet: !!b.pet, notes: b.notes ?? "",
  };
}
