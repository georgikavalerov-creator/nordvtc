// Accusés de lecture : une coche = distribué, deux coches = lu. Utilisable côté serveur et client.
export type ChatStatus = "pending" | "sent" | "read";

export default function ChatTicks({ status }: { status: ChatStatus }) {
  if (status === "pending") {
    return (
      <svg className="chat-tick is-pending" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.8V8l2.2 1.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className={`chat-tick is-${status}`} width="18" height="12" viewBox="0 0 22 14" aria-hidden="true" focusable="false">
      <path d="M1.5 7.5l4 4L13.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {status === "read" && <path d="M9.5 11.5L20.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

export const statusLabel = (s: ChatStatus, readAt?: string | null) =>
  s === "pending" ? "Envoi…" : s === "sent" ? "Distribué" : `Lu${readAt ? ` à ${new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).format(new Date(readAt))}` : ""}`;
