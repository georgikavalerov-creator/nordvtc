import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Permet d'installer le site sur l'écran d'accueil du téléphone, comme une application.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Chauffeur privé à Lille`,
    short_name: SITE.name,
    description: "Réservez votre chauffeur privé à Lille : prix ferme, aéroport, gares, Paris, Bruxelles.",
    lang: "fr",
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Réserver un trajet", url: "/reservation" },
      { name: "Mes trajets", url: "/compte/trajets" },
    ],
  };
}
