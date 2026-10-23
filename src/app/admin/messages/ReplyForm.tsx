"use client";
import { useActionState, useEffect, useRef } from "react";
import { replyChat } from "../actions";
import { BusyLabel } from "@/components/Loader";

export default function ReplyForm({ thread }: { thread: string }) {
  const [s, act, pending] = useActionState(replyChat, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (s && "ok" in s && s.ok) ref.current?.reset(); }, [s]);
  return (
    <form ref={ref} action={act} className="form adm-reply">
      <input type="hidden" name="thread" value={thread} />
      <textarea name="body" rows={3} required maxLength={1500} placeholder="Votre réponse…" onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit(); }} />
      {s?.error && <p className="error">{s.error}</p>}
      <button className="btn small" disabled={pending}><BusyLabel busy={pending} busyText="Envoi…">Répondre</BusyLabel></button>
    </form>
  );
}
