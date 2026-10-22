import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Pages pré-générées servies directement depuis les fichiers du build (sans recalcul à chaque visite) :
// beaucoup moins de CPU, plus d'erreur 1102 au démarrage. Les pages modifiables depuis l'admin
// (guide, mentions légales, confidentialité, contact) sont en rendu direct (force-dynamic).
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
