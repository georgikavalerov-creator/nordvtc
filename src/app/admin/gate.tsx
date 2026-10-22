import { getAdminPhoto } from "@/lib/admin-photo";
import type { ReactNode } from "react";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { logout } from "./actions";
import LoginForm from "./LoginForm";
import AdminNav from "./AdminNav";
import AdminChatWatch from "./AdminChatWatch";
import { adminUnread } from "@/lib/chat-unread";

// Cadre commun des pages d'administration : vérifie la session, affiche le menu.
// Usage : return <AdminPage title="…">…</AdminPage> ; si non connecté, la page de connexion s'affiche à la place.
export async function AdminPage({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  if (!adminConfigured()) {
    return (
      <section className="section"><div className="wrap prose"><h1>Administration</h1>
        <p className="notice">L'administration n'est pas activée : renseignez ADMIN_PASSWORD et ADMIN_SESSION_SECRET (24 caractères minimum) dans les variables d'environnement.</p>
      </div></section>
    );
  }
  if (!(await isAdmin())) {
    return <section className="section"><div className="wrap"><h1>Administration</h1><LoginForm /></div></section>;
  }
  const photo = await getAdminPhoto().catch(() => null);
  return (
    <section className="section adm">
      <div className="wrap" style={{ display: "grid", gap: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/admin/reglages#photo" className="acc-avatar adm-avatar" title="Ma photo" aria-label="Ma photo">{photo ? <img src={photo} alt="" width={44} height={44} /> : "G"}</a>
            <h1 style={{ fontSize: "1.8rem", margin: 0 }}>{title}</h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {actions}
            <form action={logout}><button className="btn ghost small">Se déconnecter</button></form>
          </div>
        </div>
        <AdminNav />
        <AdminChatWatch initial={await adminUnread().catch(() => ({ count: 0, messages: 0, latest: null }))} />
        {children}
      </div>
    </section>
  );
}
