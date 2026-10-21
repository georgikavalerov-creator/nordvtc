"use client";
import { useState } from "react";
import { track } from "@/lib/track";

// Le client choisit ses étoiles ici, puis Google s'ouvre sur le formulaire d'avis de la fiche.
// (Google n'autorise pas la publication automatique d'un avis depuis un site tiers : le client doit valider chez Google.)
export default function ReviewPrompt({ url, compact = false }: { url: string; compact?: boolean }) {
  const [n, setN] = useState(0);
  return (
    <div className={`rv-prompt${compact ? " compact" : ""}`}>
      <p><strong>Vous avez voyagé avec nous ?</strong> Donnez votre avis, il apparaîtra sur notre fiche Google.</p>
      <div className="stars" role="radiogroup" aria-label="Votre note">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" role="radio" aria-checked={n === i} aria-label={`${i} étoile${i > 1 ? "s" : ""}`} className={i <= n ? "on" : ""} onClick={() => setN(i)}>★</button>
        ))}
      </div>
      <a className={`btn small${n ? "" : " disabled"}`} href={n ? url : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!n} onClick={() => track("Avis Google", { note: n })}>
        Publier sur Google
      </a>
    </div>
  );
}
