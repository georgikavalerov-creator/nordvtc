import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { SITE } from "@/lib/site";
import PhoneShield from "@/components/PhoneShield";
import { getSiteSettings } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de Nord VTC, chauffeur privé à Lille : éditeur, hébergeur, assurance et médiation.",
  alternates: { canonical: "/mentions-legales" },
};

export default async function MentionsLegales() {
  const L = SITE.legal;
  const cfg = await getSiteSettings();
  const email = cfg.email || SITE.email;
  const phone = cfg.legalPhone || SITE.legalPhone;
  return (
    <LegalShell title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        {SITE.name} est exploité par {L.owner}, {L.form}, immatriculé sous le nom {L.registeredName}.
        <br />
        SIRET : {L.siret}
        <br />
        {L.vatNote}
        <br />
        Adresse : {SITE.address}
        <br />
        Téléphone : <PhoneShield rev={phone.split("").reverse().join("")} /><br />
        {email ? <>E-mail : {email}</> : <>E-mail : [à compléter]</>}
      </p>
      <p>Directeur de la publication : {L.owner}.</p>

      <h2>Crédits photographiques</h2>
      <p>
        Les photos viennent de Wikimedia Commons et d'Unsplash, recadrées. Auteur, licence et source de chaque image :{" "}
        <a href="/credits-photos">page des crédits photos</a>.
      </p>
      <p>Les photos extérieures de la voiture montrent une Toyota Auris identique ; la photo de l'habitacle est celle du véhicule.</p>

      <h2>Activité réglementée</h2>
      <p>
        Transport public routier de personnes avec chauffeur (VTC). Titulaire de la carte professionnelle de conducteur de VTC, délivrée par la préfecture. Inscription au registre des exploitants de VTC (ministère chargé des transports) : n° {L.registre}. Assurance responsabilité civile professionnelle : {L.insurer}, valable en France. Les courses s'effectuent exclusivement sur réservation préalable.
      </p>

      <h2>Hébergement</h2>
      <p>Hébergeur : {L.host}.</p>

      <h2>Médiation de la consommation</h2>
      <p>
        Conformément au code de la consommation, tout consommateur peut recourir gratuitement à un médiateur de la consommation. Médiateur : {cfg.mediatorName ? <>{cfg.mediatorName}{cfg.mediatorAddress ? `, ${cfg.mediatorAddress}` : ""}{cfg.mediatorUrl ? <> — <a href={cfg.mediatorUrl} rel="noopener noreferrer">{cfg.mediatorUrl.replace(/^https?:\/\//, "")}</a></> : null}</> : "[nom et coordonnées du médiateur à compléter]"}.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>Les textes, la structure et les éléments graphiques de ce site sont protégés. Toute reproduction sans autorisation est interdite.</p>

      <h2>Données personnelles</h2>
      <p>
        Voir la <a href="/confidentialite">politique de confidentialité</a>.
      </p>
    </LegalShell>
  );
}
