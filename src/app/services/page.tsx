import type { Metadata } from "next";
import { Crumb } from "@/components/JsonLd";
import Link from "next/link";
import CtaBand from "@/components/CtaBand";
import Icon from "@/components/Icon";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "Nos trajets : aéroports, gares, longue distance",
  description:
    "Transferts vers l'aéroport de Lille-Lesquin et les gares de Lille, trajets vers Paris et Bruxelles, mariages, mise à disposition et déplacements professionnels.",
  alternates: { canonical: "/services" },
};

const ORDER = ["Aéroports", "Gares", "Longue distance", "Événements & pro"] as const;
const THEME: Record<(typeof ORDER)[number], { icon: string; cls: string }> = {
  "Aéroports": { icon: "plane", cls: "c-blue" },
  "Gares": { icon: "train", cls: "c-teal" },
  "Longue distance": { icon: "route", cls: "c-violet" },
  "Événements & pro": { icon: "sparkle", cls: "c-amber" },
};

export default function ServicesPage() {
  return (
    <>
      <Crumb name="Trajets" path="/services" />
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Nos trajets</span>
          <h1>Un chauffeur pour chaque déplacement</h1>
          <p className="muted prose">Choisissez le type de trajet : le calculateur de chaque page vous donne le prix avant de réserver.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap" style={{ display: "grid", gap: 48 }}>
          {ORDER.map((cat) => (
            <div key={cat} className={`svc-group ${THEME[cat].cls}`}>
              <h2 className="svc-h"><span className="svc-ico"><Icon name={THEME[cat].icon} size={20} /></span>{cat}</h2>
              <div className="grid cols-3">
                {SERVICES.filter((s) => s.category === cat).map((s) => (
                  <Link key={s.slug} href={`/services/${s.slug}`} className="card svc-card">
                    <h3>{s.label}</h3>
                    <p className="muted">{s.metaDescription.slice(0, 120).trim()}…</p>
                    <span className="more">Voir la page →</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <CtaBand title="Votre trajet n'est pas dans la liste ?" text="Indiquez vos deux adresses : le prix s'affiche tout de suite, pour n'importe quel trajet." />
    </>
  );
}
