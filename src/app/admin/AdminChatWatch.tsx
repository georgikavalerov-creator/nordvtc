"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type U = { count: number; messages: number; latest: null | { id: string; name: string; body: string; at: string } };

// Administration : vérifie les nouveaux messages du chat toutes les 15 s (onglet visible) et affiche
// un badge sur « Messages », le nombre dans le titre de l'onglet et une petite fenêtre avec le dernier message.
export default function AdminChatWatch({ initial }: { initial: U }) {
  const path = usePathname();
  const [u, setU] = useState<U>(initial);
  const [hidden, setHidden] = useState<string | null>(null);
  const base = useRef<string>("");

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      if (document.hidden || stop) return;
      try { const r = await fetch("/api/admin/chat-unread", { cache: "no-store" }); if (r.ok) setU(await r.json()); } catch { /* hors ligne */ }
    };
    const t = window.setInterval(tick, 15_000);
    const onVis = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { stop = true; window.clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  // Nombre de messages non lus dans le titre de l'onglet : « (3) Administration… »
  useEffect(() => {
    if (!base.current) base.current = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = u.messages > 0 ? `(${u.messages}) ${base.current}` : base.current;
  }, [u.messages, path]);

  // Badge sur l'onglet « Messages » du menu
  useEffect(() => {
    const a = document.querySelector<HTMLAnchorElement>('.adm-nav a[href="/admin/messages"]');
    if (!a) return;
    let b = a.querySelector<HTMLSpanElement>(".adm-count");
    if (u.messages > 0) {
      if (!b) { b = document.createElement("span"); b.className = "adm-count"; a.appendChild(b); }
      b.textContent = String(u.messages);
    } else b?.remove();
  }, [u.messages, path]);

  const key = u.latest ? `${u.latest.id}:${u.latest.at}` : "";
  const onThread = u.latest && path.startsWith("/admin/messages");
  if (!u.latest || u.messages === 0 || hidden === key || onThread) return null;
  return (
    <div className="adm-toast" role="status">
      <Link href={`/admin/messages?t=${u.latest.id}`} className="adm-toast-body" onClick={() => setHidden(key)}>
        <span className="adm-toast-count">{u.messages}</span>
        <span>
          <strong>{u.messages > 1 ? `${u.messages} messages non lus` : "Nouveau message"} · {u.latest.name}</strong>
          <em>{u.latest.body.slice(0, 110)}</em>
        </span>
      </Link>
      <button type="button" className="adm-toast-x" aria-label="Masquer" onClick={() => setHidden(key)}>×</button>
    </div>
  );
}
