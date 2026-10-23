import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Titre, description et canonical toujours dans le <head> du HTML, pour tous les visiteurs et robots
  // (sinon Googlebot les recevait en fin de page sur les pages dynamiques comme le Guide).
  htmlLimitedBots: /.*/,
  env: { BUILD_DATE: new Date().toISOString().slice(0, 10) }, // date du déploiement (sitemap)
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: "11mb" } }, // envoi du logo et des justificatifs (10 Mo max)
  async redirects() {
    const host = process.env.SITE_HOST; // ex. nordvtc.fr
    return host ? [{ source: "/:path*", has: [{ type: "host" as const, value: `www.${host}` }], destination: `https://${host}/:path*`, permanent: true }] : [];
  },
  async headers() {
    return [
      { source: "/img/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self)" },
          // Politique de sécurité légère : sans restreindre les scripts (Stripe, Turnstile, Plausible), elle bloque les plugins, le détournement de <base> et l'intégration du site par d'autres domaines.
          { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
        ],
      },
    ];
  },
};

export default nextConfig;
