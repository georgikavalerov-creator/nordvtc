"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type Trip = { from: string; to: string; label: string; price: string; img: string; alt: string; pos?: string; fromQ?: string; toQ?: string };

// Timbre dentelé : la valeur affichée est le prix annoncé du trajet.
function perforated(w: number, h: number, r = 3.2) {
  const nx = Math.round(w / (r * 2)), ny = Math.round(h / (r * 2));
  const sx = w / nx, sy = h / ny;
  let d = `M0 0`;
  for (let i = 0; i < nx; i++) d += ` a${sx / 2} ${r} 0 0 0 ${sx} 0`;
  for (let i = 0; i < ny; i++) d += ` a${r} ${sy / 2} 0 0 0 0 ${sy}`;
  for (let i = 0; i < nx; i++) d += ` a${sx / 2} ${r} 0 0 0 ${-sx} 0`;
  for (let i = 0; i < ny; i++) d += ` a${r} ${sy / 2} 0 0 0 0 ${-sy}`;
  return d + " Z";
}
const STAMP = perforated(54, 66);

function Stamp({ price, city }: { price: string; city: string }) {
  const n = price.match(/\d+/)?.[0] ?? "";
  return (
    <div className="pass-stamp" aria-hidden="true">
      <svg viewBox="-4 -4 62 74" width="62" height="74">
        <path d={STAMP} fill="#fff" />
        <rect x="5" y="5" width="44" height="56" rx="1.5" fill="#1f5bff" />
        <path d="M9 52 L45 52" stroke="#fff" strokeOpacity=".5" strokeWidth=".8" />
        <text x="27" y="17" textAnchor="middle" fontSize="6" fontWeight="800" letterSpacing="1.4" fill="#fff">NORD VTC</text>
        <text x="27" y="42" textAnchor="middle" fontSize="23" fontWeight="800" fill="#fff">{n}</text>
        <text x="27" y="49.500" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff" letterSpacing="1">EUROS</text>
        <text x="27" y="58" textAnchor="middle" fontSize="4.500" fontWeight="700" fill="#fff" fillOpacity=".8" letterSpacing="1">{city.toUpperCase().slice(0, 14)}</text>
      </svg>
      <svg className="pass-postmark" viewBox="0 0 90 90" width="84" height="84">
        <defs><path id="pm" d="M45 45 m-31 0 a31 31 0 1 1 62 0 a31 31 0 1 1 -62 0" /></defs>
        <circle cx="45" cy="45" r="38" fill="none" stroke="#fff" strokeWidth="1.600" />
        <circle cx="45" cy="45" r="23" fill="none" stroke="#fff" strokeWidth="1" />
        <text fontSize="8.500" fontWeight="800" letterSpacing="2.600" fill="#fff"><textPath href="#pm" startOffset="2">LILLE · HAUTS-DE-FRANCE ·</textPath></text>
        <text x="45" y="43" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">VTC</text>
        <text x="45" y="54" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">2026</text>
      </svg>
    </div>
  );
}

// Chaque carte se pose avec son propre angle et son propre décalage, comme jetée sur une table.
const ROT = [-1.6, 2.1, -2.7, 1.2, -2.1, 2.8, -0.9];
const DX = [0, 10, -12, 6, -8, 12, -4];
const DY = [0, -6, 4, -3, 6, -5, 2];
const at = (a: number[], k: number) => a[((k % a.length) + a.length) % a.length];

export default function TripPass({ trips }: { trips: Trip[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const reduced = useRef(false);
  const touch = useRef<number | null>(null);
  const n = trips.length;

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      if (!reduced.current && !document.hidden) { setDir("next"); setI((v) => (v + 1) % n); }
    }, 5200);
    return () => clearInterval(id);
  }, [paused, n]);

  const t = trips[i];
  const go = (d: number) => {
    setDir(d < 0 ? "prev" : "next");
    setI((v) => (v + d + n) % n);
  };
  const jump = (k: number) => {
    setDir(k < i ? "prev" : "next");
    setI(k);
  };

  return (
    <div
      className={`pass-wrap${paused ? " paused" : ""}`}
      style={{ "--r1": `${at(ROT, i + 3) * 1.5}deg`, "--r2": `${at(ROT, i + 5) * -1.3}deg`, "--x1": `${at(DX, i + 2)}px`, "--x2": `${at(DX, i + 4)}px` } as React.CSSProperties}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setPaused(true); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setPaused(false); }}
      onFocus={(e) => { if (e.target.matches?.(":focus-visible")) setPaused(true); }}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
      }}
      role="group"
      aria-roledescription="carrousel"
      aria-label="Exemples de trajets"
    >
      <div className={`pass has-photo dir-${dir}`} key={i} style={{ "--rot": `${at(ROT, i)}deg`, "--dx": `${at(DX, i)}px`, "--dy": `${at(DY, i)}px` } as React.CSSProperties}>
        <div className="pass-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.img} alt={t.alt} width={900} height={600} style={{ objectPosition: t.pos ?? "50% 50%" }} fetchPriority={i === 0 ? "high" : "auto"} />
          <span className="pass-tag">{t.label}</span>
          <Stamp price={t.price} city={t.to} />
        </div>
        <div className="pass-top">
          <div className="pass-route">
            <span>{t.from}</span>
            <svg viewBox="0 0 120 22" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 11 H104" stroke="#000" strokeWidth="2" strokeDasharray="5 5" fill="none" />
              <path d="M100 4 L116 11 L100 18 Z" fill="#000" />
            </svg>
            <span>{t.to}</span>
          </div>
          <p className="pass-note">Chauffeur à l'heure, prix annoncé d'avance.</p>
        </div>
        <div className="pass-tear" />
        <div className="pass-bot">
          <div>
            <small>Prix annoncé</small>
            <span className="price">{t.price}</span>
          </div>
          <Link href={`/reservation?${new URLSearchParams({ from: t.fromQ ?? t.from, to: t.toQ ?? t.to }).toString()}`} className="btn small">Réserver</Link>
        </div>
      </div>
      <div className="pass-ctrl">
        <button type="button" onClick={() => go(-1)} aria-label="Trajet précédent">‹</button>
        <div className="dots">
          {trips.map((x, k) => (
            <button type="button" key={k} className={k === i ? "dot on" : "dot"} onClick={() => jump(k)} aria-label={`${x.from} vers ${x.to}`} aria-current={k === i} />
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label="Trajet suivant">›</button>
      </div>
      <div className="preload" aria-hidden="true">
        {trips.map((x) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={x.img} src={x.img} alt="" width={1} height={1} loading="lazy" />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{`${t.from} vers ${t.to}, ${t.price}`}</p>
    </div>
  );
}
