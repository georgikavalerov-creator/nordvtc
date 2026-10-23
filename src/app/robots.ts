import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Moteurs de recherche et assistants IA (Google, Bing, ChatGPT, Claude, Perplexity…) : autorisés, ils amènent
// des clients ; choix confirmé par Georgi le 23/10/2026 (ne pas bloquer les robots des IA).
// Seuls les aspirateurs de contenu et revendeurs de données, qui n'apportent aucun client, sont refusés.
const BLOCKED = [
  "Bytespider", "Diffbot", "Omgilibot", "omgili", "ImagesiftBot", "PetalBot", "Timpibot", "VelenPublicWebCrawler",
  "Webzio-Extended", "Scrapy", "img2dataset", "DataForSeoBot", "MJ12bot", "SemrushBot-BA",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/chauffeur", "/doc/", "/compte", "/auth/", "/api/", "/reservation/merci", "/etats-dev"] },
      { userAgent: BLOCKED, disallow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
