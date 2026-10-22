import type { Metadata } from "next";
import Link from "next/link";
import { db, dbConfigured } from "@/lib/supabase";
import { AdminPage } from "../gate";
import { addBlock, removeBlock, saveIcloudTarget, syncIcloudNow } from "../actions";
import { getIcloudTarget, listIcloudCalendars } from "@/lib/icloud-push";
import { icloudConfigured } from "@/lib/icloud";
import { fmtDT, ymd, type Booking } from "../lib";
import { agendaToken } from "@/lib/ics";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Administration · Calendrier", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Block = { id: string; start_at: string; end_at: string; reason: string | null };
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export default async function Page({ searchParams }: { searchParams: Promise<{ m?: string; ical?: string; n?: string; e?: string }> }) {
  const sp = await searchParams;
  const base = /^\d{4}-\d{2}$/.test(sp.m ?? "") ? sp.m! : ymd(new Date()).slice(0, 7);
  const [Y, M] = base.split("-").map(Number);
  const first = new Date(Y, M - 1, 1);
  const startOffset = (first.getDay() + 6) % 7; // semaine commençant le lundi
  const days = new Date(Y, M, 0).getDate();
  const gridStart = new Date(Y, M - 1, 1 - startOffset);
  const cells = Math.ceil((startOffset + days) / 7) * 7;
  const from = new Date(gridStart.getTime() - 86_400_000).toISOString();
  const to = new Date(gridStart.getTime() + (cells + 1) * 86_400_000).toISOString();

  let bookings: Booking[] = [];
  let blocks: Block[] = [];
  if (dbConfigured()) {
    bookings = ((await db().from("bookings").select("*").in("status", ["confirmed", "completed"]).gte("pickup_at", from).lte("pickup_at", to).order("pickup_at")).data as Booking[]) ?? [];
    blocks = ((await db().from("blocked_periods").select("*").gte("end_at", new Date(Date.now() - 7 * 86_400_000).toISOString()).order("start_at")).data as Block[]) ?? [];
  }
  const prev = new Date(Y, M - 2, 1), next = new Date(Y, M, 1);
  const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const today = ymd(new Date());
  const blockedOn = (day: string) => blocks.some((b) => ymd(b.start_at) <= day && ymd(b.end_at) >= day);

  const icloudOn = icloudConfigured();
  const [target, cals] = await Promise.all([
    getIcloudTarget().catch(() => null),
    icloudOn ? listIcloudCalendars().catch(() => null) : Promise.resolve([]),
  ]);
  const tok = agendaToken();
  const host = SITE.url.replace(/^https?:\/\//, "");
  const feed = `${host}/api/agenda/${tok}`;
  return (
    <AdminPage title="Calendrier">
      <div className="adm-box adm-sync">
        <strong>Vos courses dans l&apos;agenda de votre téléphone</strong>
        <p className="muted" style={{ margin: "6px 0 10px" }}>Un seul geste : toutes vos courses confirmées apparaissent dans votre agenda et se mettent à jour toutes seules (annulations comprises), avec client, téléphone, adresses, prix et rappels 1 h et 15 min avant.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a className="btn small" href={`webcal://${feed}`}> S'abonner sur iPhone (Calendrier iOS)</a>
          <a className="btn small" href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(`webcal://${feed}`)}`} target="_blank" rel="noopener">S'abonner sur Android (Google Agenda)</a>
        </div>
        <p className="muted" style={{ fontSize: ".82rem", margin: "10px 0 0" }}>
          Lien privé, à ne pas partager : <code style={{ wordBreak: "break-all" }}>https://{feed}</code><br />
          Les courses en attente de paiement n'y figurent pas. iPhone : actualisation en quelques minutes à 1 h ; Google Agenda : jusqu'à 12 h (utilisez « Google Agenda » sur une course pour l'ajouter tout de suite).
        </p>
        {!tok && <p className="notice">Renseignez ADMIN_SESSION_SECRET pour activer le lien.</p>}
      </div>
      <div className="adm-box adm-ical" id="agenda">
        <strong>Ajouter les courses dans un agenda précis de mon iPhone</strong>
        <p className="muted" style={{ margin: "6px 0 10px" }}>Choisissez l&apos;agenda iCloud (Travail, Personnel, VTC…) : chaque course confirmée y est ajoutée toute seule, mise à jour si elle change et retirée si elle est annulée.</p>
        {sp.ical === "ok" && <p className="notice" role="status">Agenda enregistré : {sp.n ?? 0} course(s) envoyée(s){sp.e ? `, ${sp.e} en échec` : ""}.</p>}
        {sp.ical === "off" && <p className="notice" role="status">Ajout automatique désactivé.</p>}
        {!icloudOn ? (
          <p className="muted" style={{ margin: 0 }}>Connexion iCloud non configurée : ajoutez ICLOUD_APPLE_ID et ICLOUD_APP_PASSWORD (mot de passe d&apos;application Apple) dans les variables de Cloudflare.</p>
        ) : cals === null ? (
          <p className="error" style={{ margin: 0 }}>iCloud refuse la connexion : vérifiez l&apos;identifiant Apple et le mot de passe d&apos;application.</p>
        ) : (
          <div className="adm-ical-row">
            <form action={saveIcloudTarget} className="adm-ical-form">
              <select name="cal" defaultValue={target?.url ?? ""} aria-label="Agenda iCloud">
                <option value="">Aucun (ne rien ajouter)</option>
                {cals.map((c) => <option key={c.url} value={c.url}>{c.name}</option>)}
              </select>
              <button className="btn small">Enregistrer</button>
            </form>
            {target && <form action={syncIcloudNow}><button className="btn small ghost">Tout renvoyer maintenant</button></form>}
          </div>
        )}
        {target && <p className="muted" style={{ fontSize: ".82rem", margin: "10px 0 0" }}>Agenda actuel : <strong>{target.name}</strong>. L&apos;abonnement ci-dessus reste possible en plus, mais évitez les deux à la fois pour ne pas voir les courses en double.</p>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
        <Link className="btn ghost small" href={`/admin/calendrier?m=${key(prev)}`}>← {MONTHS[prev.getMonth()]}</Link>
        <strong style={{ fontSize: "1.2rem", textTransform: "capitalize" }}>{MONTHS[M - 1]} {Y}</strong>
        <Link className="btn ghost small" href={`/admin/calendrier?m=${key(next)}`}>{MONTHS[next.getMonth()]} →</Link>
      </div>
      <div className="adm-cal">
        {["lun", "mar", "mer", "jeu", "ven", "sam", "dim"].map((d) => <div className="h" key={d}>{d}</div>)}
        {Array.from({ length: cells }, (_, i) => {
          const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
          const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const list = bookings.filter((b) => ymd(b.pickup_at) === day);
          return (
            <div key={day} className={`d${d.getMonth() !== M - 1 ? " off" : ""}${blockedOn(day) ? " blk" : ""}${day === today ? " today" : ""}`}>
              <b>{d.getDate()}</b>
              {list.slice(0, 3).map((b) => (
                <i key={b.id} className={b.status === "completed" ? "done" : "ok"} title={`${b.customer_name} · ${b.origin_label} → ${b.dest_label}`}>
                  {fmtDT(b.pickup_at).slice(-5)} {b.customer_name.split(" ")[0]}
                </i>
              ))}
              {list.length > 3 && <i>+{list.length - 3}</i>}
            </div>
          );
        })}
      </div>
      <small className="muted">Vert = confirmée · gris = terminée · hachuré = indisponible (aucune réservation en ligne possible).</small>

      <div className="adm-box">
        <strong>Bloquer des dates (congés, maintenance, jours complets)</strong>
        <form action={addBlock} className="form" style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", alignItems: "end", marginTop: 10 }}>
          <label>Du<input type="date" name="from" required /></label>
          <label>à (inclus)<input type="date" name="to" required /></label>
          <label>Heure début<input type="time" name="t0" defaultValue="00:00" /></label>
          <label>Heure fin<input type="time" name="t1" defaultValue="23:59" /></label>
          <label>Motif<input name="reason" placeholder="Congés" /></label>
          <button className="btn small">Bloquer</button>
        </form>
        {blocks.length > 0 && (
          <ul style={{ margin: "14px 0 0", paddingLeft: 0, listStyle: "none", display: "grid", gap: 6 }}>
            {blocks.map((b) => (
              <li key={b.id} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span>{fmtDT(b.start_at)} → {fmtDT(b.end_at)}</span>
                {b.reason && <span className="muted">· {b.reason}</span>}
                <form action={removeBlock}><input type="hidden" name="id" value={b.id} /><button className="btn ghost small">Retirer</button></form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminPage>
  );
}
