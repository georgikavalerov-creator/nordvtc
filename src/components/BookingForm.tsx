"use client";

import TimeField from "./TimeField";
import DateField from "./DateField";
import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/track";
import AddressField, { type Place } from "./AddressField";
import IconC from "./IconC";
import CompanyField from "./CompanyField";

type Quote = {
  distanceKm: number;
  durationMin: number;
  priceCents: number;
  depositCents: number;
  fullCents: number;
  night: boolean;
};

const eur = (c: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(c / 100);

const today = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export default function BookingForm({ initialFrom = "", initialTo = "", accountName = "", accountEmail = "", accountPhone = "", defaultPassengers = 1, defaultChildSeat = false, defaultPet = false, savedPlaces = [] }: { initialFrom?: string; initialTo?: string; accountName?: string; accountEmail?: string; accountPhone?: string; defaultPassengers?: number; defaultChildSeat?: boolean; defaultPet?: boolean; savedPlaces?: { id: string; kind: string; label: string; address: string; lat: number; lng: number }[] }) {
  const [origin, setOrigin] = useState<Place | null>(null);
  const [dest, setDest] = useState<Place | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState(defaultPassengers);
  const [luggage, setLuggage] = useState(0);
  const [childSeat, setChildSeat] = useState(defaultChildSeat);
  const [pet, setPet] = useState(defaultPet);
  const [flight, setFlight] = useState("");
  const [transport, setTransport] = useState<"" | "Avion" | "Train" | "Bus">("");
  const [name, setName] = useState(accountName);
  const [phone, setPhone] = useState(accountPhone);
  const [email, setEmail] = useState(accountEmail);
  const [notes, setNotes] = useState("");
  const [payMode, setPayMode] = useState<"deposit" | "full">("deposit");

  const [quote, setQuote] = useState<Quote | null>(null);
  const [returnQuote, setReturnQuote] = useState<Quote | null>(null);
  const [wantReturn, setWantReturn] = useState(false);
  const [retDate, setRetDate] = useState("");
  const [retTime, setRetTime] = useState("");
  // Retour : par défaut le trajet inverse ; le client peut choisir d'autres adresses.
  const [retCustom, setRetCustom] = useState(false);
  const [retFrom, setRetFrom] = useState<Place | null>(null);
  const [retTo, setRetTo] = useState<Place | null>(null);
  const [retKey, setRetKey] = useState(0);
  const [quoteErr, setQuoteErr] = useState("");
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [minLead, setMinLead] = useState(2);
  const [showNotes, setShowNotes] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<{ origin?: string; dest?: string; when?: string; ret?: string; flight?: string }>({});
  const [swapKey, setSwapKey] = useState(0);
  // Textes saisis dans les champs (même sans adresse choisie dans la liste) : l'inversion les échange aussi.
  const [oText, setOText] = useState(""), [dText, setDText] = useState("");
  const [rfText, setRfText] = useState(""), [rtText, setRtText] = useState("");
  const [turns, setTurns] = useState(0), [retTurns, setRetTurns] = useState(0);
  const swapped = useRef(false);
  const [showPromo, setShowPromo] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [company, setCompany] = useState("");
  const [billAddr, setBillAddr] = useState("");
  const [siren, setSiren] = useState("");
  // SIREN (9 chiffres) ou SIRET (14) saisi à la main : on complète la société et l'adresse depuis l'annuaire officiel.
  async function lookupSiren(v: string) {
    const d = v.replace(/\s/g, "");
    if (!/^(\d{9}|\d{14})$/.test(d)) return;
    try {
      const r = await fetch(`/api/entreprises?q=${d}`);
      const c = (await r.json()).results?.[0];
      if (!c) return;
      setCompany((x) => x || c.name);
      setBillAddr((x) => x || c.address);
    } catch { /* hors ligne */ }
  }
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState("");
  const [promoInfo, setPromoInfo] = useState<{ code: string; label: string; discountCents: number } | null>(null);
  const [promoMsg, setPromoMsg] = useState("");
  const restored = useRef(false);

  const cancelled = useMemo(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("annule") === "1",
    [],
  );

  // Reprise : on retrouve la saisie si la page est rechargée ou si le client revient en arrière.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("nvtc-booking");
      if (raw) {
        const d = JSON.parse(raw);
        if (!initialFrom && !initialTo) {
          if (d.origin) setOrigin(d.origin);
          if (d.dest) setDest(d.dest);
        }
        if (d.date && d.date >= today()) setDate(d.date);
        if (d.time) setTime(d.time);
        if (d.wantReturn) { setWantReturn(true); if (d.retDate && d.retDate >= today()) setRetDate(d.retDate); if (d.retTime) setRetTime(d.retTime); }
        if (d.passengers) setPassengers(d.passengers);
        if (typeof d.luggage === "number") setLuggage(d.luggage);
        if (d.flight) setFlight(d.flight);
        if (d.transport === "Avion" || d.transport === "Train" || d.transport === "Bus") setTransport(d.transport);
        if (d.childSeat) setChildSeat(true);
        if (d.pet) setPet(true);
        if (d.name) setName(d.name);
        if (d.phone) setPhone(d.phone);
        if (d.email) setEmail(d.email);
      }
    } catch {}
    restored.current = true;
    setSwapKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    try {
      sessionStorage.setItem(
        "nvtc-booking",
        JSON.stringify({ origin, dest, date, time, wantReturn, retDate, retTime, passengers, luggage, flight, transport, childSeat, pet, name, phone, email }),
      );
    } catch {}
  }, [origin, dest, date, time, wantReturn, retDate, retTime, passengers, luggage, flight, transport, childSeat, pet, name, phone, email]);

  useEffect(() => {
    if (!origin || !dest) {
      setQuote(null);
      setQuoteErr("");
      return;
    }
    let off = false;
    setLoadingQuote(true);
    setQuoteErr("");
    fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: { lat: origin.lat, lng: origin.lng },
        dest: { lat: dest.lat, lng: dest.lng },
        time: time || undefined,
        returnTime: wantReturn && retTime ? retTime : undefined,
        ...(wantReturn && retCustom && retFrom && retTo ? { returnOrigin: { lat: retFrom.lat, lng: retFrom.lng }, returnDest: { lat: retTo.lat, lng: retTo.lng } } : {}),
        promo: promoApplied || undefined,
        email: email || undefined,
      }),
    })
      .then(async (r) => ({ ok: r.ok, data: await r.json() }))
      .then(({ ok, data }) => {
        if (off) return;
        if (ok) {
          setQuote(data.quote);
          setReturnQuote(data.returnQuote ?? null);
          track("Prix affiché");
          if (promoApplied) {
            if (data.promo && "discountCents" in data.promo) { setPromoInfo(data.promo); setPromoMsg(""); }
            else { setPromoInfo(null); setPromoMsg(data.promo?.error ?? "Code non valide."); setPromoApplied(""); }
          } else setPromoInfo(null);
          if (data.minLeadHours) setMinLead(data.minLeadHours);
        } else {
          setQuote(null);
          setQuoteErr(data.error ?? "Calcul impossible");
        }
      })
      .catch(() => !off && setQuoteErr("Calcul impossible pour le moment"))
      .finally(() => !off && setLoadingQuote(false));
    return () => {
      off = true;
    };
  }, [origin, dest, time, retTime, wantReturn, promoApplied, retCustom, retFrom, retTo]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkTrip()) return;
    track("Clic paiement");
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          dest,
          date,
          time,
          passengers,
          luggage,
          childSeat,
          pet,
          flight: flight.trim() ? `${transport} ${flight.trim()}` : undefined,
          name,
          phone,
          email,
          notes: notes || undefined,
          returnTrip: wantReturn ? { date: retDate, time: retTime, ...(retCustom && retFrom && retTo ? { origin: retFrom, dest: retTo } : {}) } : undefined,
          payMode,
          promo: promoInfo?.code,
          billingCompany: showPro ? company || undefined : undefined,
          billingAddress: showPro ? billAddr || undefined : undefined,
          billingSiren: showPro ? siren.replace(/\s/g, "").slice(0, 9) || undefined : undefined,
          accept: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Une erreur est survenue.");
    } catch {
      setError("Connexion impossible. Réessayez dans un instant.");
    }
    setSubmitting(false);
  }

  const withReturn = wantReturn && !!returnQuote;
  const totalPrice = quote ? quote.priceCents + (withReturn ? returnQuote!.priceCents : 0) : 0;
  const totalDeposit = quote ? quote.depositCents + (withReturn ? returnQuote!.depositCents : 0) : 0;
  const totalFull = quote ? quote.fullCents + (withReturn ? returnQuote!.fullCents : 0) : 0;
  const rest = quote ? totalPrice - (payMode === "full" ? totalFull : totalDeposit) : 0;

  function swap() {
    swapped.current = true;
    setOrigin(dest);
    setDest(origin);
    setOText(dest?.label ?? dText);
    setDText(origin?.label ?? oText);
    setTurns((t) => t + 1);
    setSwapKey((k) => k + 1);
    setErrors({});
  }

  // Valide le trajet (adresses, date, heure, retour). Renvoie true si tout est bon, sinon affiche les erreurs et remonte au champ concerné.
  function checkTrip(): boolean {
    setError("");
    const e: typeof errors = {};
    if (!origin) e.origin = "Choisissez l'adresse de départ dans la liste.";
    if (!dest) e.dest = "Choisissez l'adresse d'arrivée dans la liste.";
    if (!date || !time) e.when = !date && !time ? "Indiquez la date et l'heure de prise en charge." : !date ? "Indiquez la date." : "Indiquez l'heure.";
    if (wantReturn) {
      if (!retDate || !retTime) e.ret = "Indiquez la date et l'heure du retour.";
      else if (date && time && `${retDate}T${retTime}` <= `${date}T${time}`) e.ret = "Le retour doit être après l'aller.";
      else if (retCustom && (!retFrom || !retTo)) e.ret = "Choisissez les adresses du retour dans la liste proposée.";
    }
    if (flight.trim() && !transport) e.flight = "Précisez s'il s'agit d'un avion, d'un train ou d'un bus.";
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => {
        const sel = e.origin || e.dest ? ".field-error" : e.when ? ".when-error" : e.ret ? ".ret-error" : ".flight-error";
        formRef.current?.querySelector<HTMLElement>(sel)?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (!e.origin && !e.dest && e.when) formRef.current?.querySelector<HTMLElement>(date ? ".pk-time input" : ".pk-field")?.focus();
        else formRef.current?.querySelector<HTMLInputElement>('input[aria-invalid="true"]')?.focus();
      });
      return false;
    }
    if (!quote) { setError(loadingQuote ? "Un instant : le prix est en cours de calcul." : quoteErr || "Le prix n'est pas encore calculé."); return false; }
    return true;
  }

  const dayChip = (offset: number) => {
    const d = new Date(Date.now() + offset * 86_400_000);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  return (
    <form ref={formRef} className="form ticket bk" onSubmit={submit} aria-label="Réservation d'un trajet">
      {cancelled && <p className="notice">Paiement annulé : votre réservation n'est pas confirmée. Vous pouvez recommencer.</p>}

      <div className="bk-pane">
        <div className="bk-route">
          <AddressField key={`o${swapKey}`} label="Départ" value={origin} onChange={(p) => { setOrigin(p); setErrors((x) => ({ ...x, origin: undefined })); }} initialText={swapped.current ? oText : initialFrom} autoResolve={!swapped.current} onText={setOText} placeholder="Adresse, gare, aéroport…" error={errors.origin} />
          <button type="button" className="bk-swap" onClick={swap} aria-label="Inverser le départ et l'arrivée" title="Inverser">
            <span className="bk-swap-i" style={{ transform: `rotate(${turns * 180}deg)` }}><IconC name="swap" size={20} /></span>
          </button>
          <AddressField key={`d${swapKey}`} label="Arrivée" value={dest} onChange={(p) => { setDest(p); setErrors((x) => ({ ...x, dest: undefined })); }} initialText={swapped.current ? dText : initialTo} autoResolve={!swapped.current} onText={setDText} placeholder="Adresse, gare, aéroport…" error={errors.dest} />
        </div>
        {savedPlaces.length > 0 && (
          <div className="chips" style={{ margin: "-4px 0 12px" }} aria-label="Adresses enregistrées">
            {savedPlaces.map((sp) => (
              <button key={sp.id} type="button" className="chip" onClick={() => {
                const pl = { label: sp.address, lat: sp.lat, lng: sp.lng };
                if (!origin) { setOrigin(pl); setSwapKey((k) => k + 1); } else { setDest(pl); setSwapKey((k) => k + 1); }
                setErrors((x) => ({ ...x, origin: undefined, dest: undefined }));
              }}>{sp.kind === "home" ? "🏠" : sp.kind === "work" ? "💼" : "📍"} {sp.label}</button>
            ))}
          </div>
        )}
    <div className="date-chips" aria-label="Choix rapide de la date">
          {[["Aujourd'hui", 0], ["Demain", 1], ["Après-demain", 2]].map(([l, o]) => (
            <button key={String(l)} type="button" className={`chip${date === dayChip(Number(o)) ? " on" : ""}`} onClick={() => { setDate(dayChip(Number(o))); setErrors((x) => ({ ...x, when: undefined })); }}>{l}</button>
          ))}
        </div>
        <div className="bk-grid bk-4">
          <div className="tf-label">
            Date
            <DateField value={date} min={today()} invalid={!!errors.when && !date} onChange={(v) => { setDate(v); setErrors((x) => ({ ...x, when: undefined })); }} />
          </div>
          <div className="tf-label">
            Heure
            <TimeField value={time} invalid={!!errors.when && !time} onChange={(v) => { setTime(v); setErrors((x) => ({ ...x, when: undefined })); }} />
          </div>
          <label>
            Passagers
            <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))}>
              {[1, 2, 3, 4].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Bagages
            <select value={luggage} onChange={(e) => setLuggage(Number(e.target.value))}>
              {Array.from({ length: 13 }, (_, n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
        {errors.when && <p className="field-error when-error" role="alert">{errors.when}</p>}
        <div className="bk-grid bk-2 bk-opts">
          <div className="tf-label">
            N° de vol, train ou bus <span className="muted">(facultatif)</span>
            <span className="date-chips" role="radiogroup" aria-label="Type de transport">
              {(["Avion", "Train", "Bus"] as const).map((t) => (
                <button key={t} type="button" role="radio" aria-checked={transport === t} className={`chip${transport === t ? " on" : ""}`} onClick={() => { setTransport(transport === t ? "" : t); setErrors((x) => ({ ...x, flight: undefined })); }}><IconC name={t === "Avion" ? "plane" : t === "Train" ? "train" : "bus"} size={16} /> {t}</button>
              ))}
            </span>
            <input value={flight} maxLength={20} aria-label="Numéro de vol, de train ou de bus" aria-invalid={!!errors.flight} onChange={(e) => { setFlight(e.target.value); setErrors((x) => ({ ...x, flight: undefined })); }} placeholder={transport === "Avion" ? "Ex. AF1234" : transport === "Train" ? "Ex. TGV 7123" : transport === "Bus" ? "Ex. FlixBus N802" : "Choisissez avion, train ou bus"} />
            {errors.flight && <p className="field-error flight-error" role="alert">{errors.flight}</p>}
          </div>
          <div className="bk-toggles">
            <label className={`toggle${childSeat ? " on" : ""}`}>
              <input type="checkbox" checked={childSeat} onChange={(e) => setChildSeat(e.target.checked)} />
              <span>Siège enfant ou rehausseur</span>
            </label>
            <label className={`toggle${pet ? " on" : ""}`}>
              <input type="checkbox" checked={pet} onChange={(e) => setPet(e.target.checked)} />
              <span>J&apos;ai un animal de compagnie</span>
            </label>
          </div>
        </div>
        <label className={`toggle${wantReturn ? " on" : ""}`} style={{ marginTop: 6 }}>
          <input type="checkbox" checked={wantReturn} onChange={(e) => { setWantReturn(e.target.checked); if (e.target.checked && !retDate) setRetDate(date); setErrors((x) => ({ ...x, ret: undefined })); }} />
          <span>Prévoir aussi le retour (autre date possible)</span>
        </label>
        {wantReturn && (
          <div className="ret-box">
            {!retCustom ? (
              <div className="ret-sum">
                <span className="ret-k">Trajet du retour</span>
                <span className="ret-v">{dest ? dest.label.split(",")[0] : "Votre arrivée"} <b aria-hidden="true">→</b> {origin ? origin.label.split(",")[0] : "votre départ"}</span>
                <button type="button" className="btn small ghost ret-edit" onClick={() => { setRetCustom(true); setRetFrom(dest); setRetTo(origin); setRfText(dest?.label ?? ""); setRtText(origin?.label ?? ""); setRetKey((k) => k + 1); }}>Changer les adresses du retour</button>
              </div>
            ) : (
              <>
                <div className="ret-head">
                  <span className="ret-k">Adresses du retour</span>
                  <button type="button" className="linklike" onClick={() => { setRetCustom(false); setRetFrom(null); setRetTo(null); setErrors((x) => ({ ...x, ret: undefined })); }}>Revenir au trajet inverse</button>
                </div>
                <div className="bk-route">
                  <AddressField key={`rf${retKey}`} label="Départ du retour" value={retFrom} onChange={(p) => { setRetFrom(p); setErrors((x) => ({ ...x, ret: undefined })); }} initialText={retFrom?.label ?? rfText} autoResolve={false} onText={setRfText} placeholder="Adresse, gare, aéroport…" />
                  <button type="button" className="bk-swap" onClick={() => { const a = retFrom, t = rfText; setRetFrom(retTo); setRetTo(a); setRfText(retTo?.label ?? rtText); setRtText(a?.label ?? t); setRetTurns((n) => n + 1); setRetKey((k) => k + 1); }} aria-label="Inverser les adresses du retour" title="Inverser">
                    <span className="bk-swap-i" style={{ transform: `rotate(${retTurns * 180}deg)` }}><IconC name="swap" size={20} /></span>
                  </button>
                  <AddressField key={`rt${retKey}`} label="Arrivée du retour" value={retTo} onChange={(p) => { setRetTo(p); setErrors((x) => ({ ...x, ret: undefined })); }} initialText={retTo?.label ?? rtText} autoResolve={false} onText={setRtText} placeholder="Adresse, gare, aéroport…" />
                </div>
              </>
            )}
            <div className="bk-grid bk-2" style={{ marginTop: 10 }}>
              <div className="tf-label">
                Date du retour
                <DateField value={retDate} min={date || today()} ariaLabel="Date du retour" invalid={!!errors.ret && !retDate} onChange={(v) => { setRetDate(v); setErrors((x) => ({ ...x, ret: undefined })); }} />
              </div>
              <div className="tf-label">
                Heure du retour
                <TimeField value={retTime} invalid={!!errors.ret && !retTime} onChange={(v) => { setRetTime(v); setErrors((x) => ({ ...x, ret: undefined })); }} />
              </div>
            </div>
          </div>
        )}
        {errors.ret && <p className="field-error ret-error" role="alert">{errors.ret}</p>}
      </div>

      <div className="bk-pane">
        <h2 className="bk-sub">Vos coordonnées</h2>
        <div className="bk-grid bk-2">
          <label>
            Nom et prénom
            <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Téléphone
            <input required type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
        </div>
        <label>
          E-mail (pour la confirmation)
          <input required type="email" inputMode="email" autoCapitalize="none" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {showNotes ? (
          <label>
            Précisions (facultatif)
            <textarea rows={2} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} autoFocus />
          </label>
        ) : (
          <button type="button" className="linklike" onClick={() => setShowNotes(true)}>+ Ajouter une précision (terminal, bagage volumineux, animal…)</button>
        )}
        {quote && (
          <div className="bk-promo">
            {promoInfo ? (
              <p className="promo-ok" role="status">
                <span>🏷️ Code <strong>{promoInfo.code}</strong> appliqué : {promoInfo.label} (−{eur(promoInfo.discountCents)})</span>
                <button type="button" className="linklike" onClick={() => { setPromoApplied(""); setPromoInput(""); setPromoInfo(null); }}>Retirer</button>
              </p>
            ) : showPromo ? (
              <div className="promo-row">
                <input value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="Code promo" maxLength={24} autoCapitalize="characters" aria-label="Code promo" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setPromoMsg(""); setPromoApplied(promoInput.trim()); } }} />
                <button type="button" className="btn small" disabled={!promoInput.trim() || loadingQuote} onClick={() => { setPromoMsg(""); setPromoApplied(promoInput.trim()); }}>Appliquer</button>
              </div>
            ) : (
              <button type="button" className="linklike" onClick={() => setShowPromo(true)}>Vous avez un code promo ?</button>
            )}
            {promoMsg && <p className="error" role="alert">{promoMsg}</p>}
          </div>
        )}
        {quote && (
          <fieldset className="bk-pay">
            <legend>Paiement en ligne</legend>
            <label className="radio-card">
              <input type="radio" name="pay" checked={payMode === "deposit"} onChange={() => setPayMode("deposit")} />
              <span>
                <strong>Acompte {eur(totalDeposit)}</strong>
                <span className="muted">Reste {eur(totalPrice - totalDeposit)} à bord</span>
              </span>
            </label>
            <label className="radio-card">
              <input type="radio" name="pay" checked={payMode === "full"} onChange={() => setPayMode("full")} />
              <span>
                <strong>Total {eur(totalFull)}</strong>
                <span className="muted">Rien à régler à bord</span>
              </span>
            </label>
          </fieldset>
        )}
        <label className="inline">
          <input type="checkbox" checked={showPro} onChange={(e) => setShowPro(e.target.checked)} />
          <span>Facture au nom d'une entreprise</span>
        </label>
        {showPro && (
          <div className="bk-grid bk-2">
            <CompanyField label="Société" value={company} onChange={setCompany} required={showPro}
              onPick={(c) => { setCompany(c.name); setSiren(c.siren.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")); if (c.address) setBillAddr(c.address); }} />
            <label>SIREN ou SIRET<input value={siren} onChange={(e) => setSiren(e.target.value)} onBlur={() => lookupSiren(siren)} inputMode="numeric" maxLength={17} placeholder="Rempli automatiquement" /></label>
            <label style={{ gridColumn: "1 / -1" }}>Adresse de facturation<input value={billAddr} onChange={(e) => setBillAddr(e.target.value)} maxLength={300} required={showPro} autoComplete="street-address" /></label>
          </div>
        )}

      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="bk-bar" aria-live="polite">
        <div className="bk-price">
          {loadingQuote && <span className="skel" aria-label="Calcul du prix en cours"><i /><i /></span>}
          {!loadingQuote && quote && (
            <>
              <strong>{eur(totalPrice)}</strong>
              <small>
                {withReturn
                  ? `Aller ${eur(quote.priceCents)} + retour ${eur(returnQuote!.priceCents)} · ${quote.distanceKm} km`
                  : `${quote.distanceKm} km · ~${quote.durationMin} min${quote.night ? " · nuit incluse" : ""}`}
              </small>
            </>
          )}
          {!loadingQuote && !quote && !quoteErr && <span className="muted">Saisissez départ et arrivée pour voir le prix</span>}
          {quoteErr && <span className="error">{quoteErr}</span>}
        </div>
        <button key="pay" className="btn" type="submit" disabled={submitting}>
          {submitting ? "Redirection…" : quote ? `Payer ${eur(payMode === "full" ? totalFull : totalDeposit)}` : "Voir le prix et payer"}
        </button>
      </div>
      <p className="muted bk-foot" style={{ marginBottom: 4 }}>
        En cliquant sur « Payer », j'accepte les <a href="/cgv" target="_blank" rel="noopener">conditions générales de vente</a>.
      </p>
      <ul className="trust-line"><li>Prix ferme</li><li>Annulation gratuite 24 h avant</li><li>Facture et bon de commande fournis</li></ul>
      <p className="muted bk-foot">
        Paiement sécurisé par Stripe · réservation au moins {minLead} h à l'avance
        {quote && rest > 0 ? ` · reste à bord : ${eur(rest)}` : ""}.
      </p>
    </form>
  );
}
