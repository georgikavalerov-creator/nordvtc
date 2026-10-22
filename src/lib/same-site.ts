// Les API internes (prix, adresses, annuaire) ne répondent qu'aux pages du site :
// un script ou un autre site qui les appelle directement est refusé (protection du quota HERE et anti-aspiration).
export function fromOurSite(req: Request): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!origin) return false;
  try { const h = new URL(origin).host; return h === new URL(req.url).host || h === "nordvtc.fr" || h === "www.nordvtc.fr"; } catch { return false; }
}

/** Variante qui journalise l'appel refusé. */
export async function sameSiteOrLog(req: Request): Promise<boolean> {
  if (fromOurSite(req)) return true;
  const { logSecurity } = await import("./security-log");
  await logSecurity("cross_site_api", req, { origin: req.headers.get("origin"), secFetchSite: req.headers.get("sec-fetch-site") });
  return false;
}
