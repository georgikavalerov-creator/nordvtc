import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services";
import { getAllPosts } from "@/lib/content";
import { SITE } from "@/lib/site";

// Généré automatiquement à chaque build : nouvelle page de trajet = nouvelle entrée.
export const revalidate = 600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const POSTS = await getAllPosts();
  const now = new Date();
  const fixed = ["", "/services", "/tarifs", "/reservation", "/contact", "/guide", "/cgv", "/mentions-legales", "/confidentialite", "/credits-photos"];
  return [
    ...fixed.map((p) => ({
      url: `${SITE.url}${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : p === "/reservation" ? 0.9 : ["/cgv", "/mentions-legales", "/confidentialite", "/credits-photos"].includes(p) ? 0.2 : 0.6,
    })),
    ...POSTS.map((b) => ({ url: `${SITE.url}/guide/${b.slug}`, lastModified: new Date(b.date), changeFrequency: "yearly" as const, priority: 0.5 })),
    ...SERVICES.map((s) => ({
      url: `${SITE.url}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
