"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const EXCUSES = [
  "Le GPS a confondu Lille-Flandres et Lille-Europe. Encore.",
  "Cette page a pris la mauvaise sortie au rond-point.",
  "Même notre chauffeur, qui connaît la métropole par cœur, ne trouve pas cette adresse.",
  "Cette page est partie à la Braderie et ne revient qu'en septembre.",
  "Recalcul de l'itinéraire… toujours rien. Elle a dû prendre un taxi.",
  "Embouteillage sur le Grand Boulevard : la page n'est jamais arrivée.",
];

/** Page 404 : la voiture fait un tour, klaxonne au clic et propose de faire demi-tour. */
export default function NotFoundFun() {
  const [i, setI] = useState(0);
  const [honk, setHonk] = useState(0);
  useEffect(() => {
    setI(Math.floor(Math.random() * EXCUSES.length));
    const t = window.setInterval(() => setI((x) => (x + 1) % EXCUSES.length), 4200);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section className="section nf">
      <div className="wrap nf-wrap">
        <span className="eyebrow">Erreur 404 · itinéraire introuvable</span>

        <div className="nf-digits" aria-hidden="true">
          <span>4</span>
          <span className="nf-wheel">
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="10" />
              <circle cx="50" cy="50" r="12" fill="currentColor" />
              {[0, 72, 144, 216, 288].map((a) => (
                <line key={a} x1="50" y1="50" x2="50" y2="12" stroke="currentColor" strokeWidth="6" strokeLinecap="round" transform={`rotate(${a} 50 50)`} />
              ))}
            </svg>
          </span>
          <span>4</span>
        </div>

        <h1 className="nf-title">Oups, on s&apos;est perdus en route&nbsp;!</h1>
        <p className="nf-excuse" aria-live="polite" key={i}>{EXCUSES[i]}</p>

        <div className="nf-road" aria-hidden="true">
          <button
            type="button"
            className={`nf-car${honk ? " honk" : ""}`}
            onClick={() => setHonk((h) => h + 1)}
            onAnimationEnd={(e) => { if (e.animationName === "nfHonk") setHonk(0); }}
            tabIndex={-1}
            title="Klaxonner"
          >
            {honk > 0 && <span className="nf-bubble">Tut tut&nbsp;!</span>}
            <svg viewBox="0 0 120 52" width="120" height="52">
              <path d="M8 36 Q8 26 18 24 L34 22 L46 10 Q50 6 58 6 L82 6 Q90 6 96 12 L106 22 Q114 24 114 32 L114 38 Q114 40 112 40 L8 40 Z" fill="var(--c-blue, #1f5bff)" />
              <path d="M50 12 L58 9 L80 9 L88 13 L96 22 L46 22 Z" fill="#cfe0ff" opacity=".85" />
              <rect x="70" y="10" width="3" height="12" fill="var(--c-blue, #1f5bff)" />
              <circle cx="108" cy="30" r="3" fill="#fff6c2" />
              <circle cx="30" cy="40" r="9" fill="#111" /><circle cx="30" cy="40" r="4" fill="#bbb" />
              <circle cx="90" cy="40" r="9" fill="#111" /><circle cx="90" cy="40" r="4" fill="#bbb" />
            </svg>
          </button>
          <span className="nf-lane" />
        </div>
        <p className="muted nf-hint">Psst… cliquez sur la voiture.</p>

        <div className="nf-actions">
          <Link href="/" className="btn">↩ Faire demi-tour</Link>
          <Link href="/reservation" className="btn ghost">Réserver un vrai trajet</Link>
        </div>
        <p className="muted nf-links">
          Ou filez directement vers : <Link href="/services/aeroport-lille-lesquin">l&apos;aéroport de Lille-Lesquin</Link> ·{" "}
          <Link href="/services/gare-lille-europe">la gare Lille-Europe</Link> · <Link href="/tarifs">les tarifs</Link> ·{" "}
          <Link href="/vtc">les villes desservies</Link>
        </p>
      </div>
    </section>
  );
}
