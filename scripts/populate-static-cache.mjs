// Prépare les fichiers statiques du Worker avant chaque déploiement (lancé par wrangler, voir "build" dans wrangler.jsonc).
// 1. Copie les pages pré-générées dans le cache en lecture seule d'OpenNext.
// 2. Copie le HTML de ces mêmes pages dans /__prerender/ : custom-worker.ts les sert directement,
//    sans démarrer Next.js, ce qui évite les erreurs 1102 (limite de calcul du Worker) sur les pages vitrines.
import fs from "node:fs";
import path from "node:path";

const src = ".open-next/cache", dst = ".open-next/assets/cdn-cgi/_next_cache";
if (fs.existsSync(src)) { fs.cpSync(src, dst, { recursive: true }); console.log("Cache statique prêt :", dst); }
else console.log("Pas de cache OpenNext à copier (build absent).");

const appDir = ".next/server/app", outDir = ".open-next/assets/__prerender";
const SKIP = /^(admin|api|chauffeur|compte|auth|doc|etats-dev|_not-found|_global-error)(\/|\.html$)/;
if (fs.existsSync(appDir) && fs.existsSync(".open-next/assets")) {
  fs.rmSync(outDir, { recursive: true, force: true });
  let n = 0;
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      const rel = path.relative(appDir, full).split(path.sep).join("/");
      if (e.isDirectory()) { if (!e.name.endsWith(".segments") && !e.name.startsWith("[") && !SKIP.test(rel + "/")) walk(full); continue; }
      if (!e.name.endsWith(".html") || SKIP.test(rel)) continue;
      const target = path.join(outDir, rel);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(full, target);
      n++;
    }
  };
  walk(appDir);
  // Ces copies ne doivent jamais être indexées sous leur adresse technique.
  const headersFile = ".open-next/assets/_headers";
  const rule = "/__prerender/*\n  X-Robots-Tag: noindex, nofollow\n";
  const prev = fs.existsSync(headersFile) ? fs.readFileSync(headersFile, "utf8") : "";
  if (!prev.includes("/__prerender/*")) fs.writeFileSync(headersFile, (prev ? prev.trimEnd() + "\n\n" : "") + rule);
  console.log(`Pages servies sans Next.js : ${n} fichiers HTML dans ${outDir}`);
} else console.log("Pas de pages pré-générées à copier (build absent).");
