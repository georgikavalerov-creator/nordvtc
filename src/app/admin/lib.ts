import { euro } from "@/lib/pricing";
export { euro };
export type Booking = {
  id: string; status: string; origin_label: string; dest_label: string; pickup_at: string;
  passengers: number; luggage: number; child_seat: boolean; pet?: boolean; flight: string | null;
  customer_name: string; customer_phone: string; customer_email: string; notes: string | null;
  price_cents: number; paid_cents: number; refunded_cents: number | null;
  admin_note: string | null; driver: string | null; created_at: string; stripe_payment_intent: string | null;
};
export const STATUS: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: "Paiement en attente", cls: "warn" },
  confirmed: { label: "Confirmée", cls: "ok" },
  completed: { label: "Terminée", cls: "" },
  cancelled: { label: "Annulée", cls: "bad" },
  expired: { label: "Expirée", cls: "bad" },
};
export const fmtDT = (iso: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
export const fmtD = (iso: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "medium" }).format(new Date(iso));
// "AAAA-MM-JJ" en heure de Paris
export const ymd = (d: Date | string) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(new Date(d));
export const net = (b: Booking) => (b.paid_cents ?? 0) - (b.refunded_cents ?? 0);
