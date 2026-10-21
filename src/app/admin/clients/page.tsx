import type { Metadata } from "next";
import { db, dbConfigured } from "@/lib/supabase";
import { AdminPage } from "../gate";
import { euro, fmtD, net, type Booking } from "../lib";

export const metadata: Metadata = { title: "Administration · Clients", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().toLowerCase();
  const rows = dbConfigured() ? (((await db().from("bookings").select("*").in("status", ["confirmed", "completed"]).order("pickup_at", { ascending: false }).limit(3000)).data as Booking[]) ?? []) : [];
  const map = new Map<string, { name: string; email: string; phone: string; n: number; total: number; last: string }>();
  for (const b of rows) {
    const k = b.customer_email.toLowerCase();
    const c = map.get(k) ?? { name: b.customer_name, email: b.customer_email, phone: b.customer_phone, n: 0, total: 0, last: b.pickup_at };
    c.n++; c.total += net(b);
    if (b.pickup_at > c.last) c.last = b.pickup_at;
    map.set(k, c);
  }
  let list = [...map.values()].sort((a, b) => b.last.localeCompare(a.last));
  if (q) list = list.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q));
  return (
    <AdminPage title="Clients" actions={<a className="btn ghost small" href="/admin/export?type=clients">Exporter (CSV)</a>}>
      <form className="adm-filters" method="get">
        <label>Recherche<input name="q" defaultValue={q} placeholder="Nom, e-mail, téléphone" /></label>
        <button className="btn small">Chercher</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Client</th><th>Contact</th><th>Courses</th><th>Encaissé</th><th>Dernière</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={5} className="muted">Aucun client.</td></tr>}
            {list.map((c) => (
              <tr key={c.email}>
                <td>{c.name}{c.n > 1 && <> <span className="badge ok">fidèle</span></>}</td>
                <td><a href={`tel:${c.phone}`}>{c.phone}</a><br /><a href={`mailto:${c.email}`}>{c.email}</a></td>
                <td>{c.n}</td><td>{euro(c.total)}</td><td>{fmtD(c.last)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
