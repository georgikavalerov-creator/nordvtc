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
  const copied = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      const rel = path.relative(appDir, full).split(path.sep).join("/");
      if (e.isDirectory()) { if (!e.name.endsWith(".segments") && !e.name.startsWith("[") && !SKIP.test(rel + "/")) walk(full); continue; }
      if (!e.name.endsWith(".html") || SKIP.test(rel)) continue;
      const target = path.join(outDir, rel);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(full, target);
      copied.push(target);
      n++;
    }
  };
  walk(appDir);
  // CSS critique : les règles utilisées par chaque page sont mises dans la page, la feuille complète
  // se charge ensuite sans bloquer l'affichage. Le premier affichage arrive bien plus tôt sur mobile.
  // En cas de problème, les pages restent telles quelles (la feuille complète suffit).
  try {
    const { default: Beasties } = await import("beasties");
    const b = new Beasties({
      path: ".open-next/assets", publicPath: "/", preload: "swap", pruneSource: false,
      inlineFonts: true, preloadFonts: false, compress: true, logLevel: "warn",
      // Règles qui dépendent d'un état ajouté au chargement (thème, animations, menus) : toujours gardées.
      allowRules: [/data-theme/, /\.fx-on/, /nav-ready/, /in-app/, /is-started/, /in-view/, /\.on\b/, /\[open\]/, /rv-in/, /\.rv\b/, /data-busy/, /has-glider/, /\.glider/, /nav-open|menu-open|is-open/],
    });
    // Police principale (Figtree, alphabet latin) déclarée dans la page : elle se charge dès le début,
    // sans attendre la feuille complète (sinon le texte changerait de police tardivement).
    const fontFace = (() => {
      try {
        const dir = ".open-next/assets/_next/static/chunks";
        for (const n of fs.readdirSync(dir)) {
          if (!n.endsWith(".css")) continue;
          const css = fs.readFileSync(path.join(dir, n), "utf8");
          const m = css.match(/@font-face\{[^}]*figtree-latin-wght-normal[^}]*\}/);
          if (m) return m[0].replace(/url\(\.\.\/media\//g, "url(/_next/static/media/");
        }
      } catch { /* sans police déclarée : la feuille complète s'en charge */ }
      return "";
    })();
    let done = 0;
    for (const f of copied) {
      try {
        let html = await b.process(fs.readFileSync(f, "utf8"));
        if (fontFace) html = html.replace("<style>", "<style>" + fontFace);
        fs.writeFileSync(f, html); done++;
      }
      catch (e) { console.log("CSS critique ignoré pour", f, String(e).slice(0, 120)); }
    }
    console.log(`CSS critique : ${done}/${copied.length} pages`);
  } catch (e) { console.log("CSS critique indisponible :", String(e).slice(0, 160)); }
  // Ces copies ne doivent jamais être indexées sous leur adresse technique.
  const headersFile = ".open-next/assets/_headers";
  const rule = "/__prerender/*\n  X-Robots-Tag: noindex, nofollow\n";
  const prev = fs.existsSync(headersFile) ? fs.readFileSync(headersFile, "utf8") : "";
  if (!prev.includes("/__prerender/*")) fs.writeFileSync(headersFile, (prev ? prev.trimEnd() + "\n\n" : "") + rule);
  console.log(`Pages servies sans Next.js : ${n} fichiers HTML dans ${outDir}`);
} else console.log("Pas de pages pré-générées à copier (build absent).");
