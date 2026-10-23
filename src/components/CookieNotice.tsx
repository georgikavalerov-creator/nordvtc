"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// Bandeau cookies discret : ce site n'a ni publicité ni pistage, donc aucun consentement n'est exigé (CNIL).
// On informe une seule fois, sans bloquer la page, et chacun peut couper la mesure d'audience anonyme (Plausible).
const KEY = "nvtc-cookies";
const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* navigation privée */ } };

export default function CookieNotice() {
  const [show, setShow] = useState(false);
  const [details, setDetails] = useState(false);
  const [stats, setStats] = useState(true);

  useEffect(() => {
    setStats(read("plausible_ignore") !== "true");
    const open = () => { setDetails(true); setShow(true); };
    window.addEventListener("nvtc:cookies", open); // le lien « Cookies » du pied de page marche partout
    let t = 0;
    // Sur téléphone, le bandeau attend que la personne ait commencé à lire (défilement) pour ne pas cacher le titre
    // et le formulaire du premier écran ; sur ordinateur, il apparaît dans un coin après 2,5 s.
    const mobile = window.matchMedia("(max-width: 900px)").matches;
    const onScroll = () => { if (window.scrollY > 500) { setShow(true); window.removeEventListener("scroll", onScroll); } };
    if (!read(KEY) && !/^\/(admin|chauffeur|reservation|doc)/.test(location.pathname)) { // jamais pendant une réservation
      if (mobile) window.addEventListener("scroll", onScroll, { passive: true });
      else t = window.setTimeout(() => setShow(true), 2500);
    }
    return () => { window.clearTimeout(t); window.removeEventListener("scroll", onScroll); window.removeEventListener("nvtc:cookies", open); };
  }, []);

  const close = () => { write(KEY, new Date().toISOString().slice(0, 10)); setShow(false); setDetails(false); };
  const setAudience = (on: boolean) => { setStats(on); write("plausible_ignore", on ? null : "true"); };

  if (!show) return null;
  return (
    <div className={`ck${details ? " is-open" : ""}`} role="dialog" aria-live="polite" aria-label="Cookies et confidentialité">
      <div className="ck-main">
        <span className="ck-ico" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 48 48"><defs><linearGradient id="ck-g" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f6c27a" /><stop offset="1" stopColor="#d98b3a" /></linearGradient></defs><path d="M24 4a20 20 0 1 0 20 20 7 7 0 0 1-8-7 7 7 0 0 1-7-8 5 5 0 0 1-5-5z" fill="url(#ck-g)" /><circle cx="17" cy="20" r="2.6" fill="#7a4a1d" /><circle cx="26" cy="31" r="2.6" fill="#7a4a1d" /><circle cx="15" cy="31" r="2" fill="#7a4a1d" /><circle cx="33" cy="25" r="2" fill="#7a4a1d" /><circle cx="22" cy="13" r="1.6" fill="#7a4a1d" /></svg>
        </span>
        <p><strong>Pas de pub, pas de pistage.</strong> Seulement l&apos;essentiel pour que le site fonctionne et une mesure d&apos;audience anonyme, sans cookie.</p>
        <div className="ck-btns">
          <button type="button" className="ck-link" onClick={() => setDetails((d) => !d)} aria-expanded={details}>{details ? "Masquer" : "Détails"}</button>
          <button type="button" className="ck-ok" onClick={close}>Parfait</button>
        </div>
      </div>
      {details && (
        <div className="ck-more">
          <div className="ck-row">
            <span><b>Essentiels</b><small>Connexion à votre espace, sécurité anti-robots, réservation en cours, discussion, thème jour/nuit.</small></span>
            <span className="ck-on">Toujours actifs</span>
          </div>
          <label className="ck-row">
            <span><b>Mesure d&apos;audience</b><small>Plausible, sans cookie ni donnée personnelle : nombre de visites, pages vues.</small></span>
            <span className={`ck-switch${stats ? " on" : ""}`}><input type="checkbox" checked={stats} onChange={(e) => setAudience(e.target.checked)} aria-label="Mesure d'audience anonyme" /><i /></span>
          </label>
          <p className="ck-foot">Aucun cookie publicitaire, aucun réseau social, aucune revente. <Link href="/confidentialite#cookies" onClick={close}>Politique de confidentialité</Link></p>
        </div>
      )}
    </div>
  );
}

/** Lien « Cookies » du pied de page : rouvre le bandeau. */
export function CookieLink({ className }: { className?: string }) {
  return <button type="button" className={className ?? "ck-footlink"} onClick={() => window.dispatchEvent(new Event("nvtc:cookies"))}>Cookies</button>;
}
