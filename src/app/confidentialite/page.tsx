import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import { getSiteSettings } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de Nord VTC : données collectées, durée de conservation et vos droits.",
  alternates: { canonical: "/confidentialite" },
};

export const revalidate = 300;

export default async function Confidentialite() {
  const email = (await getSiteSettings()).email || SITE.email;
  return (
    <LegalShell title="Politique de confidentialité">
      <p className="muted">Modèle de départ à faire relire et valider avant la mise en ligne. Mise à jour : octobre 2026.</p>

      <h2>Responsable du traitement</h2>
      <p>
        {SITE.legal.owner}, {SITE.legal.form}, SIRET {SITE.legal.siret}.{" "}
        {email ? <>Contact : {email}.</> : "Contact : voir la page contact."}
      </p>

      <h2>Données collectées</h2>
      <p>
        Lors d'une réservation : nom, téléphone, e-mail, adresses de départ et d'arrivée, date et heure, nombre de passagers et de bagages, numéro de vol ou de train, précisions éventuelles. Lors d'un message via le formulaire de contact : nom, e-mail, téléphone (facultatif) et contenu du message. Lors d'une demande d'appel ou de rappel : nom, numéro de mobile, besoin éventuel, et le numéro est vérifié par un code envoyé par SMS. Si vous créez un espace personnel : adresse e-mail, nom, identifiant fourni par Google ou Apple si vous choisissez ce mode de connexion, adresses enregistrées, préférences de trajet, avis laissés sur vos trajets et historique de réservations. Adresse IP : utilisée de façon éphémère contre les abus et conservée sous forme d'empreinte non réversible avec les demandes de rappel.
      </p>

      <h2>Finalités et bases légales</h2>
      <ul>
        <li>Exécuter la réservation et la course (exécution du contrat).</li>
        <li>Envoyer la confirmation et assurer le suivi (exécution du contrat).</li>
        <li>Répondre à vos demandes de contact (intérêt légitime).</li>
        <li>Respecter nos obligations comptables et légales (obligation légale).</li>
        <li>Créer et gérer votre espace personnel (exécution du contrat) ; vous rappeler après votre demande (consentement donné en cochant la case du formulaire).</li>
        <li>Prévenir la fraude et les faux numéros, limiter les envois automatisés (intérêt légitime).</li>
        <li>Vous envoyer nos offres et actualités, uniquement si vous avez coché la case dédiée dans votre profil (consentement, retirable à tout moment).</li>
      </ul>

      <h2>Destinataires et sous-traitants</h2>
      <p>
        Vos données sont traitées par des prestataires strictement nécessaires au service : Stripe (paiement et remboursement), Supabase (base de données et authentification), Resend (envoi d'e-mails), Twilio (envoi du code SMS de vérification), Cloudflare Turnstile (protection anti-robots, si activée), Google et Apple (uniquement si vous choisissez de vous connecter avec votre compte), HERE (recherche d'adresses et calcul d'itinéraire) et l'hébergeur du site. Certains de ces prestataires sont situés hors de l'Union européenne (notamment aux États-Unis) ; les transferts sont encadrés par les clauses contractuelles types de la Commission européenne ou le Data Privacy Framework. Les numéros de carte bancaire sont saisis chez Stripe et ne sont jamais enregistrés sur ce site.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Les données de réservation sont conservées pendant la durée nécessaire à la prestation, puis archivées au plus tard 3 ans pour la gestion commerciale. Les pièces comptables sont conservées 10 ans. Les messages de contact et les demandes de rappel sont conservés 3 ans maximum. Les données de votre espace personnel sont conservées tant que le compte existe ; vous pouvez le supprimer à tout moment depuis « Sécurité et confidentialité » (les réservations passées sont alors conservées sans lien avec votre compte, pour les obligations comptables).
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition, de limitation et de portabilité. Pour les exercer, écrivez via la <a href="/contact">page contact</a>. Depuis votre espace personnel, vous pouvez télécharger vos données et supprimer votre compte. Vous pouvez aussi saisir la CNIL (cnil.fr).
      </p>

      <h2>Cookies</h2>
      <p>
        Ce site n'utilise pas de cookie publicitaire. Si la mesure d'audience est activée, elle repose sur Plausible Analytics, sans cookie ni donnée personnelle (statistiques agrégées uniquement). Seuls des cookies strictement nécessaires sont déposés : session de connexion à l'espace personnel, accès à l'espace d'administration et, le cas échéant, contrôle anti-robots. Ils ne nécessitent pas de consentement. Le navigateur conserve aussi temporairement (stockage de session) le brouillon de votre réservation ; il disparaît à la fermeture de l'onglet.
      </p>
    </LegalShell>
  );
}
