import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { PHOTO_CREDITS, UNSPLASH_CREDIT, OWN_PHOTO_CREDIT, PRESS_CREDITS } from "@/lib/images";

export const metadata: Metadata = {
  title: "Crédits et licences des photos",
  description: "Crédits et licences des photographies du site Nord VTC : auteurs, sources (Wikimedia Commons, Unsplash) et conditions de réutilisation de chaque image.",
  alternates: { canonical: "/credits-photos" },
};

export default function CreditsPhotos() {
  return (
    <LegalShell title="Crédits photos">
      <p>
        Les photographies du site sont issues de Wikimedia Commons (licences libres) et d'Unsplash. Elles sont recadrées et
        compressées. Merci à leurs auteurs.
      </p>
      <ul>
        {PHOTO_CREDITS.map((c) => (
          <li key={c.file}>
            <strong>{c.label}</strong> : « {c.title} », par {c.author},{" "}
            <a href={c.licenseUrl} rel="license noopener">{c.license}</a>,{" "}
            <a href={c.source} rel="noopener">source</a>.
          </li>
        ))}
        {PRESS_CREDITS.map((c) => (
          <li key={c.label}><strong>{c.label}</strong> : © <a href={c.url} rel="noopener">{c.owner}</a>, reproduite avec autorisation.</li>
        ))}
        <li><strong>{OWN_PHOTO_CREDIT.label}</strong> : {OWN_PHOTO_CREDIT.note}</li>
        <li>
          <strong>{UNSPLASH_CREDIT.label}</strong> : photo <a href={UNSPLASH_CREDIT.source} rel="noopener">Unsplash</a>, {UNSPLASH_CREDIT.license}.
        </li>
      </ul>
      <p>Les photos extérieures de la voiture montrent une Toyota Auris identique ; la photo de l'habitacle est celle du véhicule.</p>
    </LegalShell>
  );
}
