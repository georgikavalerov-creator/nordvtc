import type { ReactNode } from "react";
import { currentDriver, type Driver } from "@/lib/driver-auth";
import { dbConfigured } from "@/lib/supabase";
import { logoutDriver } from "./actions";
import { DriverLogin } from "./Forms";
import DriverNav from "./DriverNav";
import FaceIdPrompt from "@/components/FaceIdPrompt";
import { listPasskeys } from "@/lib/passkey";
import { driverPkRegOptions, driverPkRegVerify } from "./actions";

export async function DriverPage({ title, children }: { title: string; children: (d: Driver) => ReactNode }) {
  const d = await currentDriver();
  if (!d) {
    return (
      <section className="section adm"><div className="wrap" style={{ display: "grid", gap: 14 }}>
        <h1 style={{ margin: 0 }}>Espace chauffeur</h1>
        <p className="muted" style={{ margin: 0 }}>Réservé aux chauffeurs partenaires de Nord VTC.</p>
        {!dbConfigured() && <p className="notice">Service momentanément indisponible.</p>}
        <DriverLogin />
      </div></section>
    );
  }
  return (
    <section className="section adm">
      <div className="wrap" style={{ display: "grid", gap: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/chauffeur/profil" className="acc-avatar adm-avatar" title="Ma photo" aria-label="Mon profil">{(d as { photo?: string | null }).photo ? <img src={(d as { photo?: string | null }).photo!} alt="" width={44} height={44} /> : d.name.slice(0, 1).toUpperCase()}</a>
            <h1 style={{ fontSize: "1.8rem", margin: 0 }}>{title}</h1>
          </div>
          <form action={logoutDriver}><button className="btn ghost small">Se déconnecter ({d.name.split(" ")[0]})</button></form>
        </div>
        <FaceIdPrompt count={(await listPasskeys(`driver:${d.id}`).catch(() => [])).length} getOptions={driverPkRegOptions} save={driverPkRegVerify} storeKey={`d-${d.id.slice(0, 8)}`} />
        <DriverNav />
        {children(d)}
      </div>
    </section>
  );
}
