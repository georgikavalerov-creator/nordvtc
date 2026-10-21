import Script from "next/script";

// Mesure d'audience sans cookie (Plausible) : active seulement si NEXT_PUBLIC_PLAUSIBLE_DOMAIN est renseigné.
export default function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return <Script defer data-domain={domain} src="https://plausible.io/js/script.tagged-events.js" strategy="afterInteractive" />;
}
