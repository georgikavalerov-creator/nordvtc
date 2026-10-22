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
      <p className="muted">Version du 22 octobre 2026.</p>

      <h2>Responsable du traitement</h2>
      <p>
        {SITE.legal.owner}, {SITE.legal.form}, SIRET {SITE.legal.siret}.{" "}
        {email ? <>Contact : <a href={`mailto:${email}`}>{email}</a>.</> : <>Contact : voir la <a href="/contact">page contact</a>.</>}
      </p>

      <h2>Données collectées</h2>
      <ul>
        <li><strong>Réservation :</strong> nom, téléphone, e-mail, adresses de départ et d'arrivée, date et heure (aller et éventuel retour), nombre de passagers et de bagages, type et numéro de vol ou de train, précisions (siège enfant, bagage volumineux, animal), informations de facturation si vous demandez une facture d'entreprise.</li>
        <li><strong>Paiement :</strong> montant, statut et référence du paiement ou du remboursement. Les données de carte bancaire sont saisies directement chez Stripe et ne sont jamais reçues ni enregistrées par ce site.</li>
        <li><strong>Annulation sur justificatif :</strong> le document que vous déposez pour prouver l'annulation de votre train ou de votre vol (e-mail, SMS ou capture de la compagnie) et votre message éventuel. Nous vous conseillons de masquer les informations sans rapport avec le trajet.</li>
        <li><strong>Discussion en direct :</strong> vos messages et, si vous les indiquez, votre prénom et votre e-mail (pour être prévenu de la réponse). Aucun compte n&apos;est nécessaire : un identifiant aléatoire est gardé dans votre navigateur pour retrouver la conversation.</li>
        <li><strong>Contact :</strong> nom, e-mail, téléphone (facultatif) et contenu du message, via le formulaire ou l'adresse e-mail du site.</li>
        <li><strong>Demande d'appel ou de rappel :</strong> nom, numéro de mobile, besoin éventuel ; le numéro est vérifié par un code envoyé par SMS.</li>
        <li><strong>Espace personnel (facultatif) :</strong> adresse e-mail, nom, identifiant fourni par Google ou Apple si vous choisissez ce mode de connexion, adresses enregistrées, préférences de trajet, avis laissés et historique de réservations.</li>
        <li><strong>Données techniques :</strong> adresse IP, utilisée de façon éphémère contre les abus et conservée sous forme d'empreinte non réversible avec les demandes de rappel.</li>
      </ul>

      <h2>Finalités et bases légales</h2>
      <ul>
        <li>Exécuter la réservation et la course, envoyer la confirmation, le bon de commande et assurer le suivi (exécution du contrat).</li>
        <li>Encaisser, rembourser et traiter les demandes d'annulation, y compris sur justificatif (exécution du contrat).</li>
        <li>Respecter nos obligations comptables, fiscales et réglementaires, notamment la tenue des bons de commande VTC (obligation légale).</li>
        <li>Répondre à vos messages et vous rappeler à votre demande (intérêt légitime ; consentement pour le rappel, donné en cochant la case du formulaire).</li>
        <li>Créer et gérer votre espace personnel (exécution du contrat).</li>
        <li>Prévenir la fraude, les faux numéros et les envois automatisés (intérêt légitime).</li>
        <li>Vous envoyer nos offres, uniquement si vous avez coché la case dédiée dans votre profil (consentement, retirable à tout moment).</li>
      </ul>

      <h2>Qui a accès à vos données</h2>
      <p>
        Vos données sont réservées à l'exploitant et, pour la course qui lui est confiée, au chauffeur qui l'assure (nom, téléphone, e-mail, trajet et précisions utiles). Elles ne sont jamais vendues ni louées.
      </p>
      <p>
        Elles sont traitées par des prestataires strictement nécessaires au service : Stripe (paiement et remboursement), Supabase (base de données, authentification et stockage des justificatifs), Resend (envoi des e-mails), Twilio (code SMS de vérification), Cloudflare (hébergement du site, redirection de l'adresse e-mail de contact et, le cas échéant, protection anti-robots Turnstile), HERE (recherche d'adresses et calcul d'itinéraire), Google et Apple (uniquement si vous choisissez de vous connecter avec votre compte) et, le cas échéant, Plausible (mesure d'audience sans cookie). Certains sont situés ou ont une maison mère hors de l'Union européenne, notamment aux États-Unis ; ces transferts sont encadrés par les clauses contractuelles types de la Commission européenne ou le Data Privacy Framework.
      </p>

      <h2>Durée de conservation</h2>
      <ul>
        <li>Réservations : pendant la prestation, puis 3 ans pour la gestion de la relation client.</li>
        <li>Pièces comptables (paiements, notes, factures) : 10 ans, comme l'exige la loi.</li>
        <li>Justificatifs d'annulation : supprimés automatiquement 1 an après leur dépôt.</li>
        <li>Messages de contact et demandes de rappel : 3 ans maximum.</li>
        <li>Discussions en direct : supprimées automatiquement 1 an après le dernier message.</li>
        <li>Espace personnel : tant que le compte existe. Vous pouvez le supprimer à tout moment depuis « Sécurité et confidentialité » ; vos réservations passées sont alors conservées sans lien avec le compte, pour les obligations comptables.</li>
      </ul>

      <h2>Sécurité</h2>
      <p>
        Le site est servi exclusivement en HTTPS. Les justificatifs sont stockés dans un espace privé, consultable uniquement par l'exploitant au moyen de liens temporaires. Le suivi d'une réservation sans compte n'est accessible qu'avec le lien personnel envoyé par e-mail.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition, de limitation et de portabilité de vos données, ainsi que du droit de retirer votre consentement à tout moment et de définir des directives sur leur sort après votre décès. Pour les exercer, écrivez{email ? <> à <a href={`mailto:${email}`}>{email}</a></> : null} ou via la <a href="/contact">page contact</a> ; nous répondons dans un délai d'un mois. Depuis votre espace personnel, vous pouvez aussi télécharger vos données et supprimer votre compte. Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (<a href="https://www.cnil.fr" rel="noopener noreferrer">cnil.fr</a>).
      </p>

      <h2>Journal de sécurité</h2>
      <p>
        Pour protéger le site contre les attaques (tentatives de connexion frauduleuses, envois automatisés, falsification de liens ou de prix), certains événements techniques sont enregistrés : adresse IP, pays et réseau d&apos;origine, navigateur, page concernée, date et identifiant technique de la requête. Base légale : intérêt légitime (sécurité du service). Durée de conservation : 12 mois maximum, puis suppression automatique. Ces données ne sont utilisées que pour la sécurité et, en cas d&apos;attaque, peuvent être transmises aux autorités compétentes.
      </p>

      <h2 id="cookies">Cookies et stockage local</h2>
      <p>
        Ce site n'utilise aucun cookie publicitaire ni de suivi. Seuls des cookies strictement nécessaires sont déposés : session de connexion à l'espace personnel, accès à l'espace d'administration et, le cas échéant, contrôle anti-robots. Ils ne nécessitent pas de consentement. Si la mesure d'audience est activée, elle repose sur Plausible Analytics, sans cookie ni donnée personnelle (statistiques agrégées). Le navigateur conserve aussi temporairement (stockage de session) le brouillon de votre réservation et votre demande d'appel ; ils disparaissent à la fermeture de l'onglet. Si vous utilisez la discussion, son identifiant est gardé sur votre appareil (stockage local) pour la retrouver. Votre choix d'affichage (jour ou nuit) est mémorisé sur votre appareil.
      </p>
    </LegalShell>
  );
}
