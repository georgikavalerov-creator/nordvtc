// @ts-nocheck — point d'entrée du Worker : le site (OpenNext) + la réception d'e-mails.
// Cloudflare Email Routing envoie ici les e-mails reçus sur chat@nordvtc.fr (règle « Envoyer vers un Worker »).
// Ils sont transmis, sans sortir du Worker, à la route /api/chat/inbound qui les publie dans la discussion.
import { default as handler } from "./.open-next/worker.js";

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,

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
