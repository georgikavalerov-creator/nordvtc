import type { Metadata } from "next";
import Link from "next/link";
import AutoRefresh from "@/components/AutoRefresh";
import { db, dbConfigured } from "@/lib/supabase";
import { AdminPage } from "../gate";
import { closeChat } from "../actions";
import ReplyForm from "./ReplyForm";
import ChatTicks, { statusLabel } from "@/components/ChatTicks";

export const metadata: Metadata = { title: "Administration · Messages", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Thread = { id: string; created_at: string; last_visitor_at: string; last_admin_at: string | null; admin_seen_at: string | null; visitor_seen_at: string; visitor_name: string | null; visitor_email: string | null; page: string | null; closed: boolean };
type Msg = { id: number; created_at: string; sender: "visitor" | "admin"; body: string };
const fmt = (iso: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const unread = (t: Thread) => !t.admin_seen_at || new Date(t.last_visitor_at) > new Date(t.admin_seen_at);

export default async function Messages({ searchParams }: { searchParams: Promise<{ t?: string; tout?: string }> }) {
  const { t: sel, tout } = await searchParams;
  let threads: Thread[] = [];
  let msgs: Msg[] = [];
  let cur: Thread | undefined;
  if (dbConfigured()) {
    // Confidentialité : discussions effacées 1 an après le dernier message.
    await db().from("chat_threads").delete().lt("last_visitor_at", new Date(Date.now() - 365 * 86_400_000).toISOString());
    let q = db().from("chat_threads").select("*").order("last_visitor_at", { ascending: false }).limit(60);
    if (!tout) q = q.eq("closed", false);
    threads = ((await q).data as Thread[]) ?? [];
    if (sel && /^[0-9a-f-]{36}$/.test(sel)) {
      cur = threads.find((x) => x.id === sel) ?? ((await db().from("chat_threads").select("*").eq("id", sel).maybeSingle()).data as Thread | undefined);
      if (cur) {
        msgs = ((await db().from("chat_messages").select("id,created_at,sender,body").eq("thread_id", sel).order("id")).data as Msg[]) ?? [];
        await db().from("chat_threads").update({ admin_seen_at: new Date().toISOString() }).eq("id", sel);
      }
    }
  }
  const visitorHere = cur && Date.now() - new Date(cur.visitor_seen_at).getTime() < 60_000;
  return (
    <AdminPage title="Messages du site">
      <AutoRefresh every={6000} max={600} />
      <div className="adm-chat">
        <aside className="adm-threads">
          <p className="muted" style={{ margin: "0 0 8px", fontSize: ".85rem" }}>
            {tout ? <Link href="/admin/messages">Masquer les conversations closes</Link> : <Link href="/admin/messages?tout=1">Voir aussi les conversations closes</Link>}
          </p>
          {threads.length === 0 && <p className="muted">Aucune conversation pour le moment.</p>}
          {threads.map((t) => (
            <Link key={t.id} href={`/admin/messages?t=${t.id}${tout ? "&tout=1" : ""}`} className={`adm-thread${t.id === sel ? " on" : ""}${unread(t) ? " new" : ""}`}>
              <strong>{t.visitor_name || "Visiteur"}{unread(t) && <span className="adm-badge">nouveau</span>}</strong>
              <span className="muted">{fmt(t.last_visitor_at)}{t.visitor_email ? " · e-mail ✓" : ""}{t.closed ? " · close" : ""}</span>
            </Link>
          ))}
        </aside>
        <div className="adm-conv">
          {!cur ? (
            <p className="muted">Choisissez une conversation. Vous recevez un e-mail à chaque nouveau message (au plus un toutes les 10 minutes par conversation).</p>
          ) : (
            <>
              <div className="adm-conv-head">
                <div>
                  <strong>{cur.visitor_name || "Visiteur anonyme"}</strong>
                  <span className="muted"> · {visitorHere ? "🟢 sur le site" : "hors ligne"}{cur.visitor_email ? ` · ${cur.visitor_email}` : " · pas d'e-mail laissé"}{cur.page ? ` · page ${cur.page}` : ""}</span>
                </div>
                <form action={closeChat}>
                  <input type="hidden" name="thread" value={cur.id} />
                  {cur.closed && <input type="hidden" name="reopen" value="1" />}
                  <button className="btn ghost small">{cur.closed ? "Rouvrir" : "Clore"}</button>
                </form>
              </div>
              <div className="adm-msgs">
                {msgs.map((m) => {
                  const st = new Date(cur!.visitor_seen_at) >= new Date(m.created_at) ? "read" : "sent";
                  const last = m === [...msgs].reverse().find((x) => x.sender === "admin");
                  return (
                    <div key={m.id} className={`chat-msg ${m.sender === "admin" ? "from-me" : "from-them"}`}>
                      <p>{m.body}</p>
                      <time>{fmt(m.created_at)}{m.sender === "admin" && <ChatTicks status={st} />}</time>
                      {last && <span className={`chat-status is-${st}`}>{statusLabel(st, st === "read" ? cur!.visitor_seen_at : null)}</span>}
                    </div>
                  );
                })}
              </div>
              <ReplyForm thread={cur.id} />
              <p className="muted" style={{ fontSize: ".8rem", margin: 0 }}>
                {visitorHere ? "Le visiteur voit votre réponse en direct." : cur.visitor_email ? "Le visiteur n'est plus sur le site : il recevra votre réponse par e-mail." : "Le visiteur n'est plus sur le site et n'a pas laissé d'e-mail : il verra la réponse s'il revient."}
              </p>
            </>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
