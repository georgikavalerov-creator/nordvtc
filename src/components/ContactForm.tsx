"use client";

import { useState } from "react";
import { BusyLabel } from "./Loader";

export default function ContactForm({ initialSubject = "" }: { initialSubject?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("sending");
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          email: f.get("email"),
          phone: f.get("phone") || undefined,
          subject: f.get("subject") || undefined,
          message: f.get("message"),
          website: f.get("website") || "",
        }),
      });
      const data = await res.json();
      if (res.ok) return setState("done");
      setError(data.error ?? "Une erreur est survenue.");
    } catch {
      setError("Connexion impossible. Réessayez dans un instant.");
    }
    setState("idle");
  }

  if (state === "done") {
    return <p className="notice">Merci, votre message est bien parti. Nous vous répondons rapidement.</p>;
  }
  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="row">
        <label>
          Nom et prénom
          <input name="name" required autoComplete="name" />
        </label>
        <label>
          Téléphone (facultatif)
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
      </div>
      <label>
        E-mail
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Sujet
        <input name="subject" defaultValue={initialSubject} maxLength={120} />
      </label>
      <label>
        Votre message
        <textarea name="message" rows={5} required maxLength={2000} />
      </label>
      {/* Champ piège : invisible pour les humains */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label>
          Ne pas remplir
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="btn" type="submit" disabled={state === "sending"}>
        <BusyLabel busy={state === "sending"} busyText="Envoi…">Envoyer</BusyLabel>
      </button>
    </form>
  );
}
