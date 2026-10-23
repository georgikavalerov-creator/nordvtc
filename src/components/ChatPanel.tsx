"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { forgetChat, loadChat, saveChat } from "@/lib/chat-client";
import IconC from "./IconC";
import ChatTicks, { statusLabel, type ChatStatus } from "./ChatTicks";

type Msg = { id: number; created_at: string; sender: "visitor" | "admin"; body: string; pending?: boolean };
const SUGGEST = ["Quel prix pour l'aéroport de Lesquin ?", "Puis-je réserver pour ce soir ?", "J'ai beaucoup de bagages", "Je voudrais un devis"];
const hhmm = (iso: string) => new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default function ChatPanel({ open, onClose, raised, anchor }: { open: boolean; onClose: () => void; raised: boolean; anchor?: { x: number; y: number } | null }) {
  // Si la bulle a été déplacée, la fenêtre s'ouvre à côté d'elle (au-dessus ou en dessous, côté gauche ou droit).
  const place = (() => {
    if (!anchor || typeof window === "undefined") return undefined;
    const w = window.innerWidth, h = window.innerHeight, mobile = w <= 900;
    const st: React.CSSProperties = {};
    if (anchor.y > h / 2) { st.bottom = h - anchor.y + 10; st.top = "auto"; } else { st.top = anchor.y + 60; st.bottom = "auto"; }
    if (!mobile) { if (anchor.x < w / 2) { st.left = Math.max(12, anchor.x); st.right = "auto"; } else { st.right = Math.max(12, w - anchor.x - 50); st.left = "auto"; } }
    st.maxHeight = Math.max(260, (anchor.y > h / 2 ? anchor.y - 20 : h - anchor.y - 80));
    return st;
  })();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hasEmail, setHasEmail] = useState(false);
  const [askEmail, setAskEmail] = useState(false);
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const [adminSeen, setAdminSeen] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastId = msgs.filter((m) => !m.pending).reduce((a, m) => Math.max(a, m.id), 0);
  const lastMine = [...msgs].reverse().find((m) => m.sender === "visitor");
  const stOf = (m: Msg): ChatStatus => m.pending ? "pending" : adminSeen && new Date(adminSeen) >= new Date(m.created_at) ? "read" : "sent";

  const poll = useCallback(async (after: number) => {
    const s = loadChat();
    if (!s) return;
    try {
      const r = await fetch(`/api/chat?id=${s.id}&token=${encodeURIComponent(s.token)}&after=${after}&seen=1`, { cache: "no-store" });
      if (r.status === 404) { forgetChat(); return; }
      if (!r.ok) return;
      const d = await r.json();
      setHasEmail(!!d.hasEmail);
      setAdminSeen(d.adminSeenAt ?? null);
      if (d.messages.length) {
        setMsgs((m) => { const ids = new Set(m.map((x) => x.id)); const real = m.filter((x) => !x.pending); return [...real, ...d.messages.filter((x: Msg) => !ids.has(x.id))]; });
        saveChat({ ...s, seen: d.messages[d.messages.length - 1].id });
      }
    } catch { /* hors ligne */ }
  }, []);

  // Fenêtre ouverte : nouvelles réponses toutes les 2 s (pause si l'onglet est en arrière-plan).
  useEffect(() => {
    if (!open) return;
    poll(lastId);
    const t = window.setInterval(() => { if (!document.hidden) poll(lastIdRef.current); }, 2000);
    const onVis = () => { if (!document.hidden) poll(lastIdRef.current); };
    document.addEventListener("visibilitychange", onVis);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => { window.clearInterval(t); window.removeEventListener("keydown", onKey); document.removeEventListener("visibilitychange", onVis); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const lastIdRef = useRef(0);
  lastIdRef.current = lastId;

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [msgs.length, open]);

  async function send(body: string) {
    const message = body.trim();
    if (!message || sending) return;
    setSending(true); setErr("");
    const s = loadChat();
    const tmp: Msg = { id: -Date.now(), created_at: new Date().toISOString(), sender: "visitor", body: message, pending: true };
    setMsgs((m) => [...m, tmp]); setText("");
    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s ? { action: "send", id: s.id, token: s.token, message } : { action: "start", message, name, email, page: location.pathname, website: (document.getElementById("chat-hp") as HTMLInputElement | null)?.value || "" }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Message non envoyé."); setMsgs((m) => m.filter((x) => x.id !== tmp.id)); setText(message); return; }
      if (!s && d.id) { saveChat({ id: d.id, token: d.token, seen: 0 }); if (email) setHasEmail(true); else setAskEmail(true); }
      if (d.message) { setMsgs((m) => m.some((x) => x.id === d.message.id) ? m.filter((x) => x.id !== tmp.id) : m.map((x) => (x.id === tmp.id ? d.message : x))); }
      else await poll(lastIdRef.current);
    } catch { setErr("Pas de connexion : réessayez."); setMsgs((m) => m.filter((x) => x.id !== tmp.id)); setText(message); } finally { setSending(false); }
  }

  async function saveEmail() {
    const s = loadChat();
    if (!s) return;
    const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "email", id: s.id, token: s.token, email, name }) });
    const d = await r.json();
    if (!r.ok) { setErr(d.error || "Adresse non enregistrée."); return; }
    setHasEmail(true); setAskEmail(false); setErr("");
  }

  const started = msgs.length > 0;
  return (
    <div className={`chat-panel${open ? " is-open" : ""}${raised ? " is-raised" : ""}`} style={place} role="dialog" aria-label="Discussion avec le chauffeur" aria-hidden={!open}>
      <header className="chat-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/chauffeur-avatar-manga.webp" alt="" width={36} height={36} />
        <div>
          <strong>Georgi, votre chauffeur</strong>
          <span>Je réponds dès que possible, souvent en quelques minutes</span>
        </div>
        <button type="button" className="chat-x" onClick={onClose} aria-label="Fermer">×</button>
      </header>

      <div className="chat-list" ref={listRef} aria-live="polite">
        {!started && (
          <div className="chat-intro">
            <p>Bonjour 👋 Une question sur un trajet, un prix ou votre réservation ? Écrivez-moi ici, sans compte.</p>
            <div className="chat-sugg">
              {SUGGEST.map((s) => <button key={s} type="button" onClick={() => setText(s)}>{s}</button>)}
            </div>
            <p className="chat-small">Réponses immédiates : <Link href="/faq" onClick={onClose}>questions fréquentes</Link>.</p>
          </div>
        )}
        {started && (
          <p className="chat-resume">
            Votre conversation est gardée sur cet appareil : vous la retrouvez ici même après avoir fermé la fenêtre ou quitté le site.{" "}
            <button type="button" className="chat-link" onClick={() => { if (confirm("Commencer une nouvelle conversation ? L'actuelle restera visible pour le chauffeur.")) { forgetChat(); setMsgs([]); setAskEmail(false); setHasEmail(false); } }}>Nouvelle conversation</button>
          </p>
        )}
        {msgs.map((m) => (
          <div key={m.id} className={`chat-msg ${m.sender === "admin" ? "from-them" : "from-me"}${m.pending ? " is-pending" : ""}`}>
            <p>{m.body}</p>
            <time>{hhmm(m.created_at)}{m.sender === "visitor" && <ChatTicks status={stOf(m)} />}</time>
            {m === lastMine && <span className={`chat-status is-${stOf(m)}`} aria-live="polite">{statusLabel(stOf(m), stOf(m) === "read" ? adminSeen : null)}</span>}
          </div>
        ))}
        {askEmail && !hasEmail && (
          <div className="chat-ask">
            <p>Message bien reçu ✔ Pour être prévenu de ma réponse si vous quittez le site, laissez votre e-mail (facultatif) :</p>
            <div className="chat-row">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" aria-label="Votre e-mail" />
              <button type="button" onClick={saveEmail}>OK</button>
            </div>
            <button type="button" className="chat-link" onClick={() => setAskEmail(false)}>Non merci, je reste ici</button>
          </div>
        )}
      </div>

      <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(text); }}>
        {!started && (
          <details className="chat-opt">
            <summary>Être prévenu de la réponse par e-mail (facultatif)</summary>
            <div className="chat-row">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom" aria-label="Prénom" maxLength={80} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" aria-label="E-mail" />
            </div>
          </details>
        )}
        <input id="chat-hp" name="website" tabIndex={-1} autoComplete="off" className="chat-hp" aria-hidden="true" />
        {err && <p className="chat-err" role="alert">{err}</p>}
        <div className="chat-row" data-empty={!text.trim() || undefined}>
          <textarea
            ref={inputRef} rows={1} value={text} maxLength={1500} placeholder="Votre message…" aria-label="Votre message"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
          />
          <button type="submit" disabled={sending || !text.trim()} aria-label="Envoyer">
            <IconC name="send" size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
