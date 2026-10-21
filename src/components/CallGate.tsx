"use client";
import { track } from "@/lib/track";

import { useEffect, useRef, useState } from "react";

declare global { interface Window { turnstile?: { render: (el: HTMLElement, o: Record<string, unknown>) => void } } }
const SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY;

// Formulaire « Être rappelé / Appeler » : le numéro n'apparaît qu'après formulaire valide (+ code SMS si activé).
export default function CallGate() {
  const [step, setStep] = useState<"form" | "code" | "done">("form");
  const [token, setToken] = useState("");
  const [otp, setOtp] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("FR");
  const [countries, setCountries] = useState<{ code: string; dial: string; label: string; flag: string }[]>([]);
  const [e164, setE164] = useState("");
  const [need, setNeed] = useState("");
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState("");
  const [number, setNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const captcha = useRef("");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/callback/init", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      setToken(d.token); setOtp(!!d.otp); setCountries(d.countries ?? []);
      let c = d.country as string;
      if (c === "FR") { // la langue du navigateur affine le choix quand la géolocalisation ne dit rien
        const m = (navigator.language || "").split("-")[1]?.toUpperCase();
        if (m && (d.countries ?? []).some((x: { code: string }) => x.code === m)) c = m;
      }
      setCountry(c);
    }).catch(() => {});
    try { const n = sessionStorage.getItem("nvtc-num"); if (n) { setNumber(n); setStep("done"); } } catch {}
    if (SITEKEY) {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"; s.async = true;
      s.onload = () => box.current && window.turnstile?.render(box.current, { sitekey: SITEKEY, callback: (t: string) => (captcha.current = t) });
      document.head.appendChild(s);
    }
  }, []);

  async function post(url: string, body: unknown) {
    setBusy(true); setError("");
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Une erreur est survenue."); return null; }
      return d;
    } catch { setError("Connexion impossible. Réessayez."); return null; }
    finally { setBusy(false); }
  }
  function finish(n: string) {
    setNumber(n); setStep("done"); track("Numéro débloqué");
    try { sessionStorage.setItem("nvtc-num", n); } catch {}
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const d = await post("/api/callback/start", { name, phone, country, need: need || undefined, consent, token, captcha: captcha.current, website: (e.currentTarget as HTMLFormElement).website.value });
    if (!d) return;
    if (d.step === "code") { setE164(d.phone); setStep("code"); } else finish(d.number);
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault();
    const d = await post("/api/callback/verify", { name, phone: e164, need: need || undefined, code });
    if (d) finish(d.number);
  }

  if (step === "done") {
    const tel = number.replace(/\s/g, "");
    return (
      <div className="callgate done" id="appel">
        <p className="cg-ok">Merci {name || ""} 👋</p>
        {tel ? (
          <>
            <p className="muted">Voici mon numéro. Vous pouvez m'appeler maintenant ; si je suis en course, je vous rappelle rapidement.</p>
            <a className="btn cg-tel" href={`tel:${tel}`}>Appeler {number}</a>
          </>
        ) : (
          <p className="muted">Votre demande est bien enregistrée : je vous rappelle rapidement.</p>
        )}
      </div>
    );
  }
  return (
    <div className="callgate" id="appel">
      <h2 style={{ fontSize: "1.4rem" }}>Appeler ou être rappelé</h2>
      <p className="muted">Laissez-moi vos coordonnées : mon numéro s'affiche aussitôt{otp ? " après un code reçu par SMS" : ""}, et je vous rappelle si je suis en course.</p>
      {step === "form" ? (
        <form className="form" onSubmit={submit}>
          <label>Prénom et nom<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} autoComplete="name" /></label>
          <label>Votre mobile
            <span className="cg-phone">
              <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Pays et indicatif">
                {(countries.length ? countries : [{ code: "FR", dial: "+33", label: "France", flag: "🇫🇷" }]).map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.label} ({c.dial})</option>
                ))}
              </select>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel" inputMode="tel" autoComplete="tel-national" placeholder={country === "FR" ? "06 12 34 56 78" : "Votre numéro"} />
            </span>
          </label>
          <label>Votre besoin (facultatif)<input value={need} onChange={(e) => setNeed(e.target.value)} maxLength={300} placeholder="Ex. aéroport de Lesquin vendredi 6h" /></label>
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}><label>Ne pas remplir<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <label className="cg-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required /><span>J'accepte d'être recontacté à ce numéro pour ma demande (<a href="/confidentialite">confidentialité</a>).</span></label>
          {SITEKEY && <div ref={box} />}
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn" type="submit" disabled={busy || !token}>{busy ? "Vérification…" : otp ? "Recevoir mon code" : "Afficher le numéro"}</button>
        </form>
      ) : (
        <form className="form" onSubmit={verify}>
          <p>Un code vient d'être envoyé au {e164}.</p>
          <label>Code reçu par SMS<input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required inputMode="numeric" autoComplete="one-time-code" maxLength={8} /></label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn" type="submit" disabled={busy || code.length < 4}>{busy ? "Vérification…" : "Afficher le numéro"}</button>
          <button type="button" className="linklike" onClick={() => { setStep("form"); setCode(""); setError(""); }}>Modifier mon numéro</button>
        </form>
      )}
    </div>
  );
}
