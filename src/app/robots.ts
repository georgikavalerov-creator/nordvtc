import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Moteurs de recherche et assistants de recherche (Google, Bing, ChatGPT Search, Perplexity…) : autorisés,
// ils amènent des clients. Robots d'entraînement d'IA et aspirateurs de contenu : refusés.
const BLOCKED = [
  "GPTBot", "CCBot", "Google-Extended", "ClaudeBot", "anthropic-ai", "Applebot-Extended", "Bytespider", "meta-externalagent",
  "FacebookBot", "Diffbot", "Omgilibot", "omgili", "ImagesiftBot", "cohere-ai", "cohere-training-data-crawler", "AI2Bot", "Ai2Bot-Dolma",
  "PetalBot", "Timpibot", "VelenPublicWebCrawler", "Webzio-Extended", "YouBot", "Scrapy", "img2dataset", "DataForSeoBot", "MJ12bot", "SemrushBot-BA",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/chauffeur", "/doc/", "/compte", "/auth/", "/api/", "/reservation/merci"] },
      { userAgent: BLOCKED, disallow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
