// Copie les pages pré-générées dans les fichiers statiques du Worker (cache en lecture seule d'OpenNext).
// Lancé automatiquement par wrangler avant chaque déploiement (voir "build" dans wrangler.jsonc).
import fs from "node:fs";
const src = ".open-next/cache", dst = ".open-next/assets/cdn-cgi/_next_cache";
if (fs.existsSync(src)) { fs.cpSync(src, dst, { recursive: true }); console.log("Cache statique prêt :", dst); }
else console.log("Pas de cache OpenNext à copier (build absent).");
