import { isAdmin } from "@/lib/admin-auth";
import { db, dbConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Export CSV (compatible Excel : séparateur « ; », BOM UTF-8). Réservé à l'administrateur connecté.
const cell = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // neutralise les formules dans Excel
  return `"${s.replace(/"/g, '""')}"`;
};
const eur = (c: number | null) => ((c ?? 0) / 100).toFixed(2).replace(".", ",");

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Non autorisé", { status: 401 });
  if (!dbConfigured()) return new Response("Supabase non configuré", { status: 503 });
  const type = new URL(req.url).searchParams.get("type") === "clients" ? "clients" : "reservations";
  const { data } = await db().from("bookings").select("*").neq("status", "expired").order("pickup_at", { ascending: false }).limit(5000);
  const rows = (data ?? []) as Record<string, any>[];
  let lines: string[][];
  if (type === "reservations") {
    lines = [["Date prise en charge", "Statut", "Client", "Téléphone", "E-mail", "Départ", "Arrivée", "Prix", "Réglé", "Remboursé", "Facture", "Chauffeur", "Note interne"]];
    for (const b of rows) lines.push([
      new Date(b.pickup_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" }), b.status, b.customer_name, b.customer_phone, b.customer_email,
      b.origin_label, b.dest_label, eur(b.price_cents), eur(b.paid_cents), eur(b.refunded_cents), b.invoice_number ?? "", b.driver ?? "", b.admin_note ?? "",
    ]);
  } else {
    const m = new Map<string, { name: string; phone: string; email: string; n: number; total: number }>();
    for (const b of rows.filter((r) => r.status === "confirmed" || r.status === "completed")) {
      const k = String(b.customer_email).toLowerCase();
      const c = m.get(k) ?? { name: b.customer_name, phone: b.customer_phone, email: b.customer_email, n: 0, total: 0 };
      c.n++; c.total += (b.paid_cents ?? 0) - (b.refunded_cents ?? 0);
      m.set(k, c);
    }
    lines = [["Nom", "Téléphone", "E-mail", "Courses", "Encaissé"], ...[...m.values()].map((c) => [c.name, c.phone, c.email, String(c.n), eur(c.total)])];
  }
  const csv = "﻿" + lines.map((l) => l.map(cell).join(";")).join("\r\n");
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="nordvtc-${type}-${new Date().toISOString().slice(0, 10)}.csv"`, "cache-control": "no-store" } });
}
