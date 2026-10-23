"use client";
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase-browser";
import PasswordMeter from "./PasswordMeter";
import FaceIdLogin from "./FaceIdLogin";
import { clientPkLogin, clientPkLoginOptions } from "@/app/compte/(espace)/actions";
import { BusyLabel } from "./Loader";

const G = (<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2 1.4-4.9 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>);
const A = (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.7c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9s-2-.9-3.2-.9c-1.7 0-3.2 1-4.1 2.4-1.7 3-.4 7.500 1.300 9.900.8 1.200 1.800 2.500 3.100 2.500 1.200 0 1.700-.8 3.200-.8s1.900.8 3.200.8c1.300 0 2.200-1.200 3-2.400.9-1.400 1.300-2.700 1.300-2.800-.1 0-2.500-1-2.500-3.800zM14 5.200c.7-.8 1.100-1.900 1-3-1 0-2.200.7-2.900 1.500-.6.700-1.200 1.900-1 3 1.100.1 2.200-.6 2.900-1.500z"/></svg>);

const X = (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L2.8 2h6.4l4.4 5.9L18.9 2zm-1.1 18.1h1.7L7.3 3.8H5.5l12.3 16.3z"/></svg>);
type Social = "google" | "apple" | "x";
const NAMES: Record<Social, string> = { google: "Google", apple: "Apple", x: "X" };

export default function AuthForm({ next = "/compte", failed = false }: { next?: string; failed?: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [mode, setMode] = useState<"magic" | "signup" | "login">("magic");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [leaked, setLeaked] = useState(false);
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(failed ? "La connexion a échoué ou le lien a expiré. Réessayez." : "");
  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const [soon, setSoon] = useState<Social | null>(null);
  // Fournisseurs réellement activés dans Supabase (les autres affichent « bientôt disponible » au lieu d'une page d'erreur).
  const [enabled, setEnabled] = useState<Record<string, boolean> | null>(null);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } }).then((r) => r.ok ? r.json() : null).then((d) => d?.external && setEnabled(d.external)).catch(() => {});
  }, []);
  async function oauth(provider: Social) {
    setError("");
    if (provider === "apple" && !enabled?.apple) { setSoon("apple"); return; }
    if (provider === "x" && !enabled?.x && !enabled?.twitter) { setSoon("x"); return; }
    setSoon(null);
    const p = provider === "x" && !enabled?.x ? "twitter" : provider;
    const { error } = await browserClient().auth.signInWithOAuth({ provider: p, options: { redirectTo: redirectTo() } });
    if (error) setError("Connexion indisponible pour le moment.");
  }
  async function magic(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const { error } = await browserClient().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo(), shouldCreateUser: true } });
    setBusy(false);
    if (error) setError("Impossible d'envoyer le lien. Vérifiez l'adresse e-mail."); else setSent(true);
  }

  async function password(e: React.FormEvent) {
    e.preventDefault(); setError(""); setInfo("");
    const sb = browserClient();
    if (mode === "signup") {
      if ([...pw].length < 10) return setError("Au moins 10 caractères (16 recommandés).");
      if (leaked) return setError("Ce mot de passe a fuité : choisissez-en un autre.");
      setBusy(true);
      const { data, error } = await sb.auth.signUp({ email: email.trim(), password: pw, options: { emailRedirectTo: redirectTo() } });
      setBusy(false);
      if (error) return setError(error.message.includes("registered") ? "Un compte existe déjà avec cet e-mail : connectez-vous." : "Création impossible. Vérifiez vos informations.");
      if (data.session) window.location.href = next; else setSent(true);
    } else {
      setBusy(true);
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pw });
      setBusy(false);
      if (error) return setError("E-mail ou mot de passe incorrect.");
      window.location.href = next;
    }
  }
  async function forgot() {
    if (!email.trim()) return setError("Saisissez d'abord votre e-mail.");
    setError("");
    await browserClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/compte/nouveau-mot-de-passe")}` });
    setInfo("Si un compte existe, un e-mail de réinitialisation vient d'être envoyé.");
  }

  if (sent) return (
    <div className="callgate" role="status">
      <p className="cg-ok">Consultez votre boîte mail ✉️</p>
      <p className="muted">Nous avons envoyé un lien de connexion à <strong>{email}</strong>. Cliquez dessus pour accéder à votre espace (pensez aux courriers indésirables).</p>
      <button type="button" className="linklike" onClick={() => setSent(false)}>Changer d'adresse</button>
    </div>
  );
  return (
    <div className="callgate authbox">
      <FaceIdLogin getOptions={clientPkLoginOptions} verify={clientPkLogin} next={next} orText="ou" />
      <p className="auth-or auth-or-top"><span>Continuer avec</span></p>
      <div className="auth-social auth-icons" role="group" aria-label="Se connecter avec un compte existant">
        <button type="button" className="btn auth-btn google" onClick={() => oauth("google")} aria-label="Continuer avec Google">{G}<span>Google</span></button>
        <button type="button" className="btn auth-btn apple" onClick={() => oauth("apple")} aria-label="Continuer avec Apple">{A}<span>Apple</span></button>
        <button type="button" className="btn auth-btn xbtn" onClick={() => oauth("x")} aria-label="Continuer avec X">{X}<span>X</span></button>
      </div>
      {soon && <p className="notice" role="status" style={{ margin: 0 }}>La connexion avec {NAMES[soon]} sera bientôt disponible. En attendant, utilisez {soon === "google" ? "votre adresse e-mail" : "Google ou votre adresse e-mail"}.</p>}
      <p className="auth-or"><span>ou avec votre adresse e-mail</span></p>
      <div className="acc-tabs" role="tablist" style={{ marginTop: 0 }}>
        {([["magic", "Lien e-mail"], ["signup", "Créer un compte"], ["login", "Connexion"]] as const).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={mode === k} className={`chip${mode === k ? " on" : ""}`} onClick={() => { setMode(k); setError(""); setInfo(""); }}>{l}</button>
        ))}
      </div>
      {mode !== "magic" ? (
        <form className="form" onSubmit={password}>
          <label>Adresse e-mail<input type="email" required autoComplete="username webauthn" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" /></label>
          <label>{mode === "signup" ? "Créez votre mot de passe" : "Mot de passe"}
            <span className="pw-field">
              <input type={show ? "text" : "password"} required value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 10 : undefined} />
              <button type="button" className="linklike" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? "Masquer" : "Afficher"}</button>
            </span>
          </label>
          {mode === "signup" && <PasswordMeter value={pw} onLeaked={setLeaked} />}
          {error && <p className="error" role="alert">{error}</p>}
          {info && <p className="notice" role="status">{info}</p>}
          <button className="btn" type="submit" disabled={busy}><BusyLabel busy={busy} busyText="Patientez…">{mode === "signup" ? "Créer mon compte" : "Me connecter"}</BusyLabel></button>
          {mode === "login" && <button type="button" className="linklike" onClick={forgot}>Mot de passe oublié ?</button>}
        </form>
      ) : (
      <form className="form" onSubmit={magic}>
        <label>Adresse e-mail<input type="email" required autoComplete="username webauthn" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={busy}><BusyLabel busy={busy} busyText="Envoi…">Recevoir mon lien de connexion</BusyLabel></button>
        <p className="muted" style={{ fontSize: ".85rem", margin: 0 }}>Pas de mot de passe à retenir : un lien sécurisé vous est envoyé. Premier passage ? Votre espace est créé automatiquement.</p>
      </form>
      )}
    </div>
  );
}
