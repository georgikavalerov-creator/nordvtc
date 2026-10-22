import Script from "next/script";

// Mesure d'audience sans cookie (Plausible). Domaine : variable NEXT_PUBLIC_PLAUSIBLE_DOMAIN, sinon PLAUSIBLE_DOMAIN ci-dessous.
// Mettre "" pour désactiver.
const PLAUSIBLE_DOMAIN = "nordvtc.fr";

export default function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <>
      {/* File d'attente : les événements envoyés avant le chargement du script ne sont pas perdus. */}
      <Script id="plausible-queue" strategy="afterInteractive">{`window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}`}</Script>
      <Script defer data-domain={domain} src="https://plausible.io/js/script.js" strategy="lazyOnload" />
    </>
  );
}
