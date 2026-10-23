import { Fragment, Suspense } from "react";
import { prix, PRIX_MINIMUM, TRAJETS } from "@/lib/prix-depart";
import Link from "next/link";
import GoogleReviews from "@/components/GoogleReviews";
import CtaBand from "@/components/CtaBand";
import JsonLd from "@/components/JsonLd";
import { CONTENT } from "@/lib/service-content";
import { SERVICES } from "@/lib/services";
import { FORFAITS } from "@/lib/forfaits";
import { CAR_PICS, SERVICE_PIC, imgThumb, srcSetOf } from "@/lib/images";
import { VILLES } from "@/lib/villes";
import { ALL_FAQ } from "@/lib/faq";
import AppCompare from "@/components/AppCompare";
import ColorIcon, { colorIconFor } from "@/components/ColorIcon";
import MapMount from "@/components/MapMount";
import CineMount from "@/components/CineMount";
import HeroPass from "@/components/HeroPass";
import { RATING, RIDES } from "@/components/RatingBadge";
import HeroBooking from "@/components/HeroBooking";
import Reveal from "@/components/Reveal";
import DriverCard from "@/components/DriverCard";
import PaymentBadges from "@/components/PaymentBadges";
import LiveClock from "@/components/LiveClock";

const STATEMENT = "Un prix fixé avant de partir, jamais revu à la hausse. Un chauffeur qui suit votre vol ou votre train. Une seule personne au volant, de la réservation à l'arrivée.".split(" ");


// Questions affichées sur l'accueil (les autres sont sur /faq). Le balisage FAQ ne reprend que celles-ci,
// comme Google le demande (questions visibles sur la page).
const HOME_FAQ = [
  "Comment réserver un chauffeur ?",
  "Le prix peut-il changer après la réservation ?",
  "Les péages et le carburant sont-ils compris ?",
  "Puis-je annuler gratuitement ?",
  "Mon vol ou mon train a du retard : que se passe-t-il ?",
  "Où le chauffeur m'attend-il à l'aéroport ou à la gare ?",
].map((q) => ALL_FAQ.find((f) => f.q === q)!).filter(Boolean);

// Trajets mis en avant sur l'accueil (la liste complète est sur /services).
const HOME_SERVICES = ["aeroport-lille-lesquin", "gare-lille-flandres", "aeroport-bruxelles-zaventem", "aeroport-roissy-cdg", "lille-paris", "lille-bruxelles", "mariage", "entreprises"];

const TRIPS = [
  { from: "Lille", to: "Lesquin", fromQ: "Lille", toQ: "Aéroport de Lille-Lesquin", label: "Aéroport de Lille-Lesquin", price: `dès ${prix("lesquin")} €`, img: "/img/dest-lesquin.webp", alt: "Terminal de l'aéroport de Lille-Lesquin", pos: "50% 55%" },
  { from: "Lille", to: "Zaventem", fromQ: "Lille", toQ: "Aéroport de Bruxelles-National, Zaventem", label: "Aéroport de Bruxelles", price: `dès ${prix("zaventem")} €`, img: "/img/dest-zaventem.webp", alt: "Tapis roulant de l'aéroport de Bruxelles", pos: "50% 50%" },
  { from: "Lille", to: "Roissy-CDG", fromQ: "Lille", toQ: "Aéroport Paris-Charles-de-Gaulle", label: "Aéroport Paris-Charles-de-Gaulle", price: `dès ${prix("cdg")} €`, img: "/img/dest-cdg.webp", alt: "Avions sur le tarmac de Paris-Charles-de-Gaulle", pos: "45% 60%" },
  { from: "Domicile", to: "Flandres", fromQ: "", toQ: "Gare de Lille-Flandres", label: "Gare de Lille-Flandres", price: `dès ${PRIX_MINIMUM} €`, img: "/img/dest-flandres.webp", alt: "Façade de la gare de Lille-Flandres", pos: "50% 50%" },
  { from: "Lille", to: "Roubaix", fromQ: "Lille", toQ: "Roubaix", label: "Roubaix", price: `dès ${prix("roubaix")} €`, img: "/img/dest-roubaix.webp", alt: "Hôtel de ville de Roubaix", pos: "50% 45%" },
  { from: "Lille", to: "Le Touquet", fromQ: "Lille", toQ: "Le Touquet-Paris-Plage", label: "Le Touquet-Paris-Plage", price: `dès ${prix("touquet")} €`, img: "/img/dest-touquet.webp", alt: "Dunes et plage du Touquet-Paris-Plage", pos: "50% 50%" },
];

export default function Home() {
  const sample = [FORFAITS[0].rows[0], FORFAITS[0].rows[2], FORFAITS[0].rows[1]];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: HOME_FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <Reveal />
      {/* Sous le haut de page, chaque bloc a sa propre limite <Suspense> : React rend la page interactive
          par petits morceaux au lieu d'une seule longue tâche qui bloque le téléphone. Aucun changement visible. */}
      <section className="hero cine cine-root" id="cine-hero" data-mode="auto" data-xmin="0.52" data-fx="hero" suppressHydrationWarning>
        <canvas className="cine-canvas" aria-hidden="true" />
        <div className="cine-grid" aria-hidden="true" />
        <div className="cine-frame" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="wrap">
          <div>
            <span className="cine-label"><b>01</b> <span>Chauffeur privé · Lille<LiveClock /></span></span>
            <h1>
              {/* Mots-clés lus par Google et les lecteurs d'écran, sans changer l'accroche visible. */}
              <span className="sr-only">Chauffeur VTC à Lille et aéroport de Lesquin : </span>
              <span className="ln">Le prix ne bouge pas.</span>
              <span className="ln ln2">Le chauffeur non plus.</span>
            </h1>
            <p className="lead">
              Pas de tarif qui grimpe aux heures de pointe, pas de course annulée au dernier moment. Vous voyez le prix avant de confirmer, et c'est le même chauffeur, dans sa propre voiture, qui vous attend : aéroports, gares, Paris, Bruxelles.
            </p>
            <HeroBooking />
            <p className="hero-note">
              <Link href="/tarifs">Voir la grille de tarifs</Link>
            </p>
          </div>
          <aside className="hero-dests" aria-label="Trajets les plus demandés">
            <p className="hd-title">Trajets les plus demandés</p>
            <HeroPass trips={TRIPS} />
            <ul className="hd-cards">
              {TRIPS.map((t) => (
                <li key={t.to}>
                  <Link href={`/reservation?${new URLSearchParams({ from: t.fromQ, to: t.toQ }).toString()}`}>
                    <span className="hd-img">
                      {/* Vraie image (et non fond CSS) : décodée en arrière-plan, n'empêche pas le premier affichage du texte. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgThumb(t.img)} alt={t.alt} width={152} height={92} loading="lazy" decoding="async" fetchPriority="low" style={{ objectPosition: t.pos }} />
                      <span className="hd-stamp">{t.price.replace("dès ", "")}<small>dès</small></span>
                    </span>
                    <span className="hd-txt"><b>{t.label}</b><small>{t.price}</small></span>
                    <span className="hd-go" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
        <div className="cine-stats">
          <div><small>Prix</small><b>Figé</b></div>
          <div><small>Annulation</small><b>Gratuite 24 h</b></div>
          <div className="cs-rate"><small>Note · applis VTC</small><b>{RATING}<span>/5</span> <i aria-hidden="true">★</i></b></div>
          <div className="cs-rate"><small>Courses · applis VTC</small><b>{RIDES}+</b></div>
        </div>
      </section>

      <Suspense>
      <section className="story cine-root" id="cine-story" data-mode="scroll" aria-label="Du clic à la portière">
        <div className="story-inner">
          <canvas className="cine-canvas" aria-hidden="true" />
          <canvas className="map2d" aria-hidden="true" />
          <div className="cine-grid" aria-hidden="true" />
          <div className="cine-frame" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="story-copy">
            <div className="chap on">
              <span className="cine-label"><b>01</b> Réservation</span>
              <h2>Une minute, un prix.</h2>
              <p>Départ, arrivée, date : le prix ferme s'affiche tout de suite, sans compte à créer.</p>
              <div className="chap-stat"><b data-count="1">1</b><em>min</em><small>pour réserver</small></div>
            </div>
            <div className="chap">
              <span className="cine-label"><b>02</b> Prix figé</span>
              <h2>Le prix ne bouge plus.</h2>
              <p>Annoncé avant que vous confirmiez, jamais revu à la hausse : ni heure de pointe, ni détour, ni embouteillage.</p>
              <div className="chap-stat"><em>dès</em><b data-count={prix("lesquin")}>{prix("lesquin")}</b><em>€</em><small>Lille → Lesquin</small></div>
            </div>
            <div className="chap">
              <span className="cine-label"><b>03</b> Votre chauffeur</span>
              <h2>Le même, du début à la fin.</h2>
              <p>Une seule personne au volant, cartes VTC et taxi, voiture connue à l'avance. Je suis votre vol ou votre train.</p>
              <div className="chap-stat"><b data-count="1">1</b><small>chauffeur · zéro intermédiaire</small></div>
            </div>
            <div className="chap">
              <span className="cine-label"><b>04</b> Arrivée</span>
              <h2>À l'heure, devant la porte.</h2>
              <p>En salle d'arrivée ou devant chez vous. Le solde se règle à bord, la facture est fournie.</p>
              <div className="chap-stat"><b data-count={TRAJETS.lesquin.min}>{TRAJETS.lesquin.min}</b><em>min</em><small>Lille centre → Lesquin</small></div>
              <Link href="/reservation" className="btn btn-arrow">Voir mon prix</Link>
            </div>
          </div>
          <div className="story-hud" aria-hidden="true"><span className="story-num">01 / 04</span><div className="story-bar"><i /><u style={{ left: "25%" }} /><u style={{ left: "50%" }} /><u style={{ left: "75%" }} /></div><span className="story-scroll"><b>Faites défiler</b><em>↓</em></span></div>
          <div className="story-hint" aria-hidden="true"><span className="mouse"><i /></span>Faites défiler : le trajet se poursuit</div>
        </div>
      </section>
      </Suspense>

      <CineMount target="cine-hero" />
      <CineMount target="cine-story" near />
      <MapMount target="cine-story" near />


      <Suspense>
      <section className="section vehicle cv" data-fx="" suppressHydrationWarning>
        <div className="wrap">
          <div className="vehicle-grid">
            <div className="vehicle-copy">
              <span className="eyebrow">Votre véhicule</span>
              <h2>Une seule voiture, la mienne, toujours soignée</h2>
              <p className="muted">Vous savez à l'avance dans quel véhicule vous montez : une Toyota Auris hybride, propre et silencieuse, avec écran CarPlay. Indiquez passagers et bagages à la réservation, tout est prévu avant votre arrivée.</p>
              <ul className="checks">
                <li>Toyota Auris hybride, silencieuse et confortable</li>
                <li>Siège enfant et grands bagages : dites-le, c'est prévu</li>
                <li>Chauffeur titulaire des cartes VTC et taxi</li>
                <li>Écran Apple CarPlay / Android Auto, chargeur, eau et Wi-Fi à bord</li>
              </ul>
              <Link href="/reservation" className="btn btn-arrow" style={{ marginTop: 14 }}>Réserver mon trajet</Link>
            </div>
            <div className="gallery4">
              {CAR_PICS.map((ph, i) => (
                <figure key={ph.src} className={i === 0 ? "g-main" : ""}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ph.src} srcSet={srcSetOf(ph.src)} sizes="(max-width: 760px) 92vw, 50vw" alt={ph.alt} loading="lazy" width={1400} height={790} style={{ objectPosition: ph.pos }} />
                </figure>
              ))}
            </div>
          </div>
          <p className="muted" style={{ fontSize: "0.8rem", marginTop: 12 }}>Photos extérieures d'illustration d'une Toyota Auris identique ; l'habitacle est celui du véhicule.</p>
        </div>
      </section>
      </Suspense>


      <Suspense>
      <AppCompare />
      </Suspense>

      <Suspense>
      <section className="section alt cv">
        <div className="wrap">
          <div className="section-head" data-fx="" suppressHydrationWarning>
            <span className="eyebrow">Nos trajets</span>
            <h2>Où voulez-vous aller ?</h2>
          </div>
          <div className="grid cols-3 fx-stagger" data-fx="" suppressHydrationWarning>
            {SERVICES.filter((s) => HOME_SERVICES.includes(s.slug)).map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="card svc">
                <div className="thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={SERVICE_PIC[s.slug].src} srcSet={srcSetOf(SERVICE_PIC[s.slug].src)} sizes="(max-width: 760px) 130px, 420px" alt={SERVICE_PIC[s.slug].alt} loading="lazy" width={1000} height={666} style={{ objectPosition: SERVICE_PIC[s.slug].pos }} />
                  <span className="chip chip-color no-invert"><ColorIcon name={colorIconFor(s.slug, s.category)} /></span>
                </div>
                <div className="body">
                  <span className="tag">{s.category}</span>
                  <h3>{s.label}</h3>
                  <p>{CONTENT[s.slug].summary}</p>
                  <span className="more">Découvrir ce trajet →</span>
                </div>
              </Link>
            ))}
          </div>
          <p className="center" style={{ marginTop: 28 }}><Link href="/services" className="more">Tous les trajets et services →</Link></p>
        </div>
      </section>
      </Suspense>


      <Suspense>
      <section className="section cv">
        <div className="wrap">
          <div className="section-head" data-fx="" suppressHydrationWarning>
            <span className="eyebrow">Tarifs indicatifs</span>
            <h2>Un prix annoncé, pas une estimation</h2>
            <p className="muted">Le tarif est calculé selon vos adresses réelles et figé à la réservation : il ne change plus, quoi qu'il arrive sur la route.</p>
          </div>
          <div className="grid cols-3 fx-stagger" data-fx="" suppressHydrationWarning>
            {sample.map((r, i) => (
              <div key={r.route} className={i === 1 ? "pricing pop" : "pricing"}>
                {i === 1 && <span className="flag">Le plus demandé</span>}
                <h3>{r.route}</h3>
                <div className="amount">{r.price}</div>
                <p>Acompte en ligne, solde à bord</p>
                <Link href={`/reservation?${new URLSearchParams({ from: TRIPS[i].fromQ, to: TRIPS[i].toQ }).toString()}`} className={i === 1 ? "btn" : "btn ghost"} style={{ marginTop: 10 }}>Réserver ce trajet</Link>
              </div>
            ))}
          </div>
          <p className="center" style={{ marginTop: 28 }}><Link href="/tarifs" className="more">Toute la grille de prix →</Link></p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}><PaymentBadges /></div>
        </div>
      </section>
      </Suspense>

      <Suspense>
      <section className="statement" data-fx="sticky" suppressHydrationWarning>
        <div className="statement-inner">
          {/* Mots rendus côté serveur (et non découpés après coup par un script) : évite l'erreur d'hydratation React #418. */}
          <p className="big-words" style={{ "--n": STATEMENT.length } as React.CSSProperties}>
            {STATEMENT.map((w, i) => (
              <Fragment key={i}>
                <span className="w" style={{ "--i": i } as React.CSSProperties}>{w}</span>{" "}
              </Fragment>
            ))}
          </p>
        </div>
      </section>
      </Suspense>

      <Suspense>
      <DriverCard />

      <section className="section zones cv">
        <div className="wrap">
          <span className="eyebrow">Zones d'intervention</span>
          <h2>Lille et sa métropole, mais aussi Paris, Bruxelles et le littoral</h2>
          <p className="muted prose">
            Lille, Roubaix, Tourcoing, Villeneuve-d'Ascq, La Madeleine, Lambersart, Lesquin, Seclin, Armentières et toute la métropole européenne de Lille. Au-delà : Lens, Arras, Valenciennes, Dunkerque, Le Touquet, ainsi que Paris, Bruxelles et les aéroports voisins.
          </p>
          <p className="chips" style={{ marginTop: 14 }}>
            {VILLES.map((v) => (
              <Link key={v.slug} href={`/vtc/${v.slug}`} className="chip">VTC {v.name}</Link>
            ))}
            <Link href="/vtc" className="chip">Toutes les villes →</Link>
          </p>
        </div>
      </section>
      </Suspense>

      <Suspense>
      <section className="section alt cv">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <span className="eyebrow">Vos questions</span>
          <h2>Questions fréquentes</h2>
          <p className="muted">Les questions qu'on nous pose le plus souvent.</p>
          <div className="faq faq-home">
            <div className="faq-list">
              {HOME_FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p className="muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <p className="muted" style={{ marginTop: 18 }}><Link href="/faq">Les {ALL_FAQ.length} questions fréquentes</Link> · <Link href="/contact">Nous écrire</Link></p>
        </div>
      </section>
      </Suspense>

      <Suspense>
      <GoogleReviews />
      <CtaBand />
      </Suspense>
    </>
  );
}
