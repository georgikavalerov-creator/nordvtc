// @ts-nocheck — point d'entrée du Worker : le site (OpenNext) + la réception d'e-mails.
// Cloudflare Email Routing envoie ici les e-mails reçus sur chat@nordvtc.fr (règle « Envoyer vers un Worker »).
// Ils sont transmis, sans sortir du Worker, à la route /api/chat/inbound qui les publie dans la discussion.
import { default as handler } from "./.open-next/worker.js";

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

// En-têtes de sécurité identiques à next.config.ts, pour les pages servies sans Next.js.
const PAGE_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "s-maxage=31536000, stale-while-revalidate=2592000",
  "Vary": "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), payment=(self)",
  "Content-Security-Policy": "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "X-Permitted-Cross-Domain-Policies": "none",
};
// Chemins jamais servis depuis /__prerender (rendu, session ou fichiers gérés par Next.js).
const NOT_PAGE = /^\/(?:_next|api|admin|chauffeur|compte|auth|doc|cdn-cgi|__prerender)(?:\/|$)|\.[a-z0-9]+$/i;

// Page pré-générée au build (HTML copié par scripts/populate-static-cache.mjs), ou null.
async function prerendered(env, url) {
  const p = url.pathname;
  if (url.hostname.startsWith("www.") || NOT_PAGE.test(p) || (p.length > 1 && p.endsWith("/")) || p.includes("..")) return null;
  const file = p === "/" ? "/__prerender/index.html" : `/__prerender${p}.html`;
  try {
    const r = await env.ASSETS.fetch(new Request(new URL(file, url.origin)));
    return r.ok ? r : null;
  } catch { return null; }
}

export default {
  async fetch(request, env, ctx) {
    if ((request.method === "GET" || request.method === "HEAD") && env.ASSETS) {
      const url = new URL(request.url);
      const isRsc = request.headers.get("rsc") === "1" || url.searchParams.has("_rsc");
      if (!isRsc) {
        // Page vitrine : HTML du build, sans démarrer Next.js (les paramètres type utm_* ne changent pas la page).
        const page = await prerendered(env, url);
        if (page) return new Response(request.method === "HEAD" ? null : page.body, { status: 200, headers: PAGE_HEADERS });
      } else if (request.headers.get("next-router-prefetch") === "1" && !(await prerendered(env, url))) {
        // Préchargement d'une page calculée à la demande (réservation avec trajet, guide, contact…) :
        // refusé ici, la page sera chargée au clic. Évite des dizaines de rendus complets par visite.
        return new Response(null, { status: 204, headers: { "Vary": PAGE_HEADERS.Vary, "Cache-Control": "private, no-store" } });
      }
    }
    return handler.fetch(request, env, ctx);
  },

  async email(message, env, ctx) {
    if (message.rawSize > 10 * 1024 * 1024) { message.setReject("E-mail trop volumineux (10 Mo maximum)."); return; }
    const raw = await new Response(message.raw).arrayBuffer();
    const req = new Request("https://nordvtc.fr/api/chat/inbound", {
      method: "POST",
      headers: { "x-inbound-key": env.ADMIN_SESSION_SECRET ?? "", "x-mail-from": message.from, "content-type": "message/rfc822" },
      body: raw,
    });
    let res;
    try { res = await handler.fetch(req, env, ctx); } catch (e) { console.error("email → chat", e); message.setReject("Erreur temporaire, réessayez dans un instant."); return; }
    if (res.status === 200 || res.status === 202) return;
    let why = "Message non publié dans la discussion.";
    try { why = (await res.json()).error || why; } catch {}
    message.setReject(why); // l'expéditeur reçoit un retour d'erreur expliquant pourquoi
  },
};
