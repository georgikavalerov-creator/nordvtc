"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { loadChat, saveChat } from "@/lib/chat-client";

// Bouton de discussion discret : rien ne s'ouvre tout seul, aucun son, aucune bulle publicitaire.
// La fenêtre (et son code) n'est chargée qu'au premier clic. Un point bleu signale seulement une vraie réponse non lue.
const ChatPanel = dynamic(() => import("./ChatPanel"), { ssr: false });

export default function ChatButton() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [unread, setUnread] = useState(false);
  // Bulle déplaçable (doigt ou souris) ; la position est retenue sur l'appareil.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const justDragged = useRef(false);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const SIZE = 50, M = 8;
  const clampPos = (x: number, y: number) => ({ x: Math.min(Math.max(M, x), window.innerWidth - SIZE - M), y: Math.min(Math.max(M + 60, y), window.innerHeight - SIZE - M) });
  useEffect(() => {
    try { const p = JSON.parse(localStorage.getItem("nvtc-chat-pos") || "null"); if (p && typeof p.x === "number") setPos(clampPos(p.x, p.y)); } catch { /* ignoré */ }
    const onResize = () => setPos((p) => (p ? clampPos(p.x, p.y) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Lien « Reprendre la discussion » reçu par e-mail : ?chat=<id>.<clé>
  useEffect(() => {
    const p = new URLSearchParams(location.search).get("chat");
    if (p && /^[0-9a-f-]{36}\.r_[\w-]{20,}$/.test(p)) {
      const [id, token] = [p.slice(0, 36), p.slice(37)];
      const cur = loadChat();
      saveChat({ id, token: cur?.id === id ? cur.token : token, seen: cur?.id === id ? cur.seen : 0 });
      setLoaded(true); setOpen(true);
      history.replaceState(null, "", location.pathname);
    }
  }, []);

  // Une conversation existe : vérification légère des réponses (toutes les 60 s, onglet visible, fenêtre fermée).
  useEffect(() => {
    if (open) return;
    let stop = false;
    const check = async () => {
      const s = loadChat();
      if (!s || document.hidden || stop) return;
      try {
        const r = await fetch(`/api/chat?id=${s.id}&token=${encodeURIComponent(s.token)}&after=${s.seen}`, { cache: "no-store" });
        if (!r.ok) return;
        const d = await r.json();
        setUnread((d.messages as { sender: string }[]).some((m) => m.sender === "admin"));
      } catch { /* hors ligne */ }
    };
    const first = window.setTimeout(check, 2500);
    const t = window.setInterval(check, 60_000);
    return () => { stop = true; window.clearTimeout(first); window.clearInterval(t); };
  }, [open]);

  if (path.startsWith("/admin") || path.startsWith("/chauffeur") || path.startsWith("/doc")) return null;
  const onReservation = path.startsWith("/reservation");
  return (
    <>
      <button
        type="button"
        className={`chat-fab${onReservation && !pos ? " is-raised" : ""}${open ? " is-open" : ""}${pos ? " is-placed" : ""}`}
        style={pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" } : undefined}
        title="Discuter — maintenir pour déplacer"
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          drag.current = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
          if (!d.moved && Math.hypot(dx, dy) < 8) return;
          d.moved = true;
          setPos(clampPos(d.ox + dx, d.oy + dy));
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          if (d?.moved) {
            e.preventDefault();
            justDragged.current = true;
            setPos((p) => { if (p) { try { localStorage.setItem("nvtc-chat-pos", JSON.stringify(p)); } catch { /* ignoré */ } } return p; });
          }
        }}
        onPointerCancel={() => { drag.current = null; }}
        aria-label={open ? "Fermer la discussion" : unread ? "Discussion : nouvelle réponse" : "Une question ? Discuter avec le chauffeur"}
        aria-expanded={open}
        onClick={() => { if (justDragged.current) { justDragged.current = false; return; } setLoaded(true); setOpen((o) => !o); setUnread(false); }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
        )}
        {unread && !open && <span className="chat-dot" aria-hidden="true" />}
      </button>
      {loaded && <ChatPanel open={open} onClose={() => setOpen(false)} raised={onReservation} anchor={pos} />}
    </>
  );
}
