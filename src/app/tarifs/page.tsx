import type { Metadata } from "next";
import { Crumb } from "@/components/JsonLd";
import CtaBand from "@/components/CtaBand";
import Link from "next/link";
import Icon from "@/components/Icon";
import RatingBadge from "@/components/RatingBadge";
import { FORFAITS } from "@/lib/forfaits";
import { DEFAULT_PRICING } from "@/lib/pricing";
import { imgThumb } from "@/lib/images";
import { prix, duree } from "@/lib/prix-depart";

export const metadata: Metadata = {
  title: "Tarifs chauffeur privé Lille",
  description:
    "Prix indicatifs des transferts aéroport, gares, métropole lilloise et longues distances. Le prix exact est calculé selon vos adresses avant la réservation.",
  alternates: { canonical: "/tarifs" },
};

const GROUP_ICON: Record<string, string> = { "Aéroports": "plane", "Gares": "train", "Métropole lilloise": "pin", "Longue distance": "route", "Mise à disposition": "clock" };
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const TOP = [
  { label: "Aéroport de Lille-Lesquin", sub: `Depuis Lille centre · ${duree("lesquin")}`, price: String(prix("lesquin")), img: "/img/dest-lesquin.webp", pos: "50% 55%", from: "Lille", to: "Aéroport de Lille-Lesquin" },
  { label: "Aéroport de Bruxelles", sub: `Zaventem · ${duree("zaventem")}`, price: String(prix("zaventem")), img: "/img/dest-zaventem.webp", pos: "50% 50%", from: "Lille", to: "Aéroport de Bruxelles-National, Zaventem" },
  { label: "Paris-Charles-de-Gaulle", sub: `Roissy · ${duree("cdg")}`, price: String(prix("cdg")), img: "/img/dest-cdg.webp", pos: "45% 60%", from: "Lille", to: "Aéroport Paris-Charles-de-Gaulle" },
];
/** Lien de réservation pré-rempli à partir d'un libellé « A → B ». */
function bookHref(route: string) {
  const [a, b] = route.split("→").map((s) => s.trim());
  if (!b) return "/reservation";
  const clean = (s: string) => s.replace(/^Domicile$/i, "").replace(/ centre$/i, "").replace(/\s*\(.*\)$/, "");
  const q = new URLSearchParams();
  if (clean(a)) q.set("from", clean(a));
  q.set("to", clean(b));
  return `/reservation?${q}`;
}

export default function TarifsPage() {
  return (
    <>
      <Crumb name="Tarifs" path="/tarifs" />
      <section className="page-hero tf-hero">
        <div className="wrap tf-hero-grid">
          <div>
            <span className="eyebrow">Tarifs</span>
            <h1>Des prix annoncés avant la course</h1>
            <p className="muted prose">Prix indicatifs au départ de Lille centre. Le prix exact de votre trajet s&apos;affiche dès que vous saisissez vos adresses, et il ne change plus ensuite.</p>
            <div className="tf-actions">
              <Link href="/reservation" className="btn">Calculer mon prix</Link>
              <Link href="/contact#appel" className="btn ghost">Être rappelé</Link>
            </div>
            <ul className="tf-points">
              <li><Icon name="lock" size={18} /> Prix ferme, sans majoration de trafic</li>
              <li><Icon name="receipt" size={18} /> Acompte en ligne, solde à bord</li>
              <li><Icon name="undo" size={18} /> Annulation gratuite jusqu&apos;à 24 h</li>
            </ul>
          </div>
          <RatingBadge className="tf-rating" />
        </div>
      </section>

      <section className="section tf-top-sec">
        <div className="wrap">
          <div className="tf-head">
            <h2>Les trajets les plus demandés</h2>
            <p className="muted">Au départ de Lille centre, prix tout compris pour le véhicule.</p>
          </div>
          <div className="tf-top">
            {TOP.map((t) => (
              <Link key={t.label} href={`/reservation?${new URLSearchParams({ from: t.from, to: t.to })}`} className="tf-card">
                <span className="tf-card-img" style={{ backgroundImage: `url(${imgThumb(t.img)})`, backgroundPosition: t.pos }} role="img" aria-label={t.label} />
                <span className="tf-card-body">
                  <strong>{t.label}</strong>
                  <small>{t.sub}</small>
                  <span className="tf-card-price"><em>dès</em> {t.price} €</span>
                  <span className="tf-card-go">Réserver ce trajet →</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <nav className="tf-nav" aria-label="Catégories de tarifs">
        <div className="wrap">
          {FORFAITS.map((g) => <a key={g.title} href={`#${slug(g.title)}`}><Icon name={GROUP_ICON[g.title] ?? "route"} size={16} /> {g.title}</a>)}
        </div>
      </nav>

      <section className="section tf-list-sec">
        <div className="wrap tf-groups">
          {FORFAITS.map((g) => (
            <section key={g.title} id={slug(g.title)} className="tf-group" aria-labelledby={`h-${slug(g.title)}`}>
              <header className="tf-group-head">
                <span className="tf-group-ico"><Icon name={GROUP_ICON[g.title] ?? "route"} size={22} /></span>
                <h2 id={`h-${slug(g.title)}`}>{g.title}</h2>
                <span className="tf-count">{g.rows.length} trajet{g.rows.length > 1 ? "s" : ""}</span>
              </header>
              <ul className="tf-rows">
                {g.rows.map((r) => (
                  <li key={r.route}>
                    <Link href={r.price === "Sur devis" ? "/contact?sujet=Devis" : bookHref(r.route)} className="tf-row">
                      <span className="tf-route">
                        <strong>{r.route}</strong>
                        {r.note && <small>{r.note}</small>}
                      </span>
                      <span className="tf-dur">{r.duration ? <><Icon name="clock" size={14} /> {r.duration}</> : "—"}</span>
                      <span className="tf-price">{r.price}</span>
                      <span className="tf-go" aria-hidden="true">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="muted tf-foot">Prix de jour, véhicule entier (jusqu&apos;à 4 passagers). Majoration de {DEFAULT_PRICING.nightSurchargePct} % entre {DEFAULT_PRICING.nightStartHour} h et {DEFAULT_PRICING.nightEndHour} h. Le prix exact dépend de vos adresses.</p>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="tf-head">
            <span className="eyebrow">Bon à savoir</span>
            <h2>Comment le prix est fixé</h2>
          </div>
          <div className="tf-know">
            <div><span className="tf-know-ico"><Icon name="route" size={24} /></span><h3>Calculé sur l&apos;itinéraire réel</h3><p className="muted">Le prix part de l&apos;itinéraire entre vos deux adresses. Il est affiché avant la réservation et ne bouge plus, même en cas de bouchons ou de détour.</p></div>
            <div><span className="tf-know-ico"><Icon name="clock" size={24} /></span><h3>Nuit : +{DEFAULT_PRICING.nightSurchargePct} %</h3><p className="muted">Pour une prise en charge entre {DEFAULT_PRICING.nightStartHour} h et {DEFAULT_PRICING.nightEndHour} h. La majoration est déjà incluse dans le prix affiché.</p></div>
            <div><span className="tf-know-ico"><Icon name="euro" size={24} /></span><h3>Acompte, puis solde à bord</h3><p className="muted">Un acompte par carte confirme la course ; le solde se règle à bord. Vous pouvez aussi tout régler en ligne.</p></div>
            <div><span className="tf-know-ico"><Icon name="receipt" size={24} /></span><h3>Bon de commande et facture</h3><p className="muted">Bon de commande dès la réservation, facture numérotée envoyée par e-mail à la fin de la course, au nom de votre entreprise si besoin.</p></div>
          </div>
        </div>
      </section>
      <CtaBand title="Calculez le prix exact de votre trajet" text="Indiquez départ et arrivée : prix ferme, sans engagement." />
    </>
  );
}
