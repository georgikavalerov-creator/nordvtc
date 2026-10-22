import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: "11mb" }, inlineCss: true }, // envoi du logo et des justificatifs (10 Mo max)
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
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self)" },
          // Politique de sécurité légère : sans restreindre les scripts (Stripe, Turnstile, Plausible), elle bloque les plugins, le détournement de <base> et l'intégration du site par d'autres domaines.
          { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; upgrade-insecure-requests" },
        ],
      },
    ];
  },
};

export default nextConfig;
