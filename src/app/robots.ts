import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/chauffeur", "/doc/", "/compte", "/auth/", "/api/", "/reservation/merci"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
