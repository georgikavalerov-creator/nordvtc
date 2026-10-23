// Compacte la carte de la métropole (tracés OpenStreetMap) pour l'animation de l'accueil.
// Entrée : data/lille-map.source.json (couches de polylignes [x0, y0, dx1, dy1, …], unités 1e-4 degré)
// Sortie : public/lille-map.bin, lu par src/lib/mapScene.ts.
//  1. raccorde les tronçons qui se touchent (35 000 petits morceaux → beaucoup moins de lignes) ;
//  2. retire les points invisibles (Douglas-Peucker, écart < 1 unité ≈ un demi-pixel au zoom maximal) ;
//  3. écrit un binaire : le navigateur le lit sans analyse de texte (JSON), presque instantanément.
// Usage : node scripts/compact-map.mjs
import fs from "node:fs";

const SRC = "data/lille-map.source.json", OUT = "public/lille-map.bin";
// Ordre des couches dans le binaire (doit correspondre à LAYERS dans mapScene.ts).
export const LAYERS = ["min", "ter", "sec", "pri", "trunk", "mw", "ww", "aero", "water"];
const TOL = 1.0; // unités de 1e-4 degré

const src = JSON.parse(fs.readFileSync(SRC, "utf8"));

const toPts = (f) => { const p = [[f[0], f[1]]]; let x = f[0], y = f[1]; for (let i = 2; i < f.length; i += 2) { x += f[i]; y += f[i + 1]; p.push([x, y]); } return p; };
const key = (p) => p[0] + "," + p[1];

// Raccorde les polylignes dont une extrémité touche celle d'une autre (lignes seulement, pas les surfaces).
function chain(lines) {
  const ends = new Map(); // extrémité -> ensemble d'indices
  const add = (k, i) => { if (!ends.has(k)) ends.set(k, new Set()); ends.get(k).add(i); };
  lines.forEach((l, i) => { add(key(l[0]), i); add(key(l[l.length - 1]), i); });
  const used = new Uint8Array(lines.length), out = [];
  const take = (k, except) => { const s = ends.get(k); if (!s) return -1; for (const j of s) if (j !== except && !used[j]) return j; return -1; };
  for (let i = 0; i < lines.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    let cur = lines[i].slice();
    // vers l'avant
    for (;;) {
      const j = take(key(cur[cur.length - 1]), -1); if (j < 0) break; used[j] = 1;
      const l = lines[j]; cur = key(l[0]) === key(cur[cur.length - 1]) ? cur.concat(l.slice(1)) : cur.concat(l.slice(0, -1).reverse());
    }
    // vers l'arrière
    for (;;) {
      const j = take(key(cur[0]), -1); if (j < 0) break; used[j] = 1;
      const l = lines[j]; cur = key(l[l.length - 1]) === key(cur[0]) ? l.slice(0, -1).concat(cur) : l.slice(1).reverse().concat(cur);
    }
    out.push(cur);
  }
  return out;
}

// Douglas-Peucker itératif.
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    let md = -1, mi = -1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len; if (d > md) { md = d; mi = i; } }
    if (md > tol) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

const chunks = []; let before = 0, after = 0, featsBefore = 0, featsAfter = 0;
for (const name of LAYERS) {
  const raw = (src[name] || []).map(toPts);
  featsBefore += raw.length; before += raw.reduce((s, p) => s + p.length, 0);
  let lines = name === "water" ? raw.filter((p) => p.length >= 3) : chain(raw.filter((p) => p.length >= 2));
  lines = lines.map((p) => simplify(p, name === "water" ? TOL * 0.7 : TOL)).filter((p) => p.length >= 2);
  // Découpe si un écart dépasse un entier 16 bits (jamais en pratique, par sécurité).
  const safe = [];
  for (const p of lines) {
    let cur = [p[0]];
    for (let i = 1; i < p.length; i++) {
      const dx = p[i][0] - p[i - 1][0], dy = p[i][1] - p[i - 1][1];
      if (Math.abs(dx) > 32767 || Math.abs(dy) > 32767) { if (cur.length > 1) safe.push(cur); cur = [p[i]]; } else cur.push(p[i]);
    }
    if (cur.length > 1) safe.push(cur);
  }
  featsAfter += safe.length; after += safe.reduce((s, p) => s + p.length, 0);
  // Couche : Uint32 nb de lignes ; ligne : Uint32 nb de points, Int32 x0, Int32 y0, puis Int16 dx, dy.
  let size = 4; for (const p of safe) size += 12 + (p.length - 1) * 4;
  const buf = Buffer.alloc(size); let o = 0;
  buf.writeUInt32LE(safe.length, o); o += 4;
  for (const p of safe) {
    buf.writeUInt32LE(p.length, o); buf.writeInt32LE(p[0][0], o + 4); buf.writeInt32LE(p[0][1], o + 8); o += 12;
    for (let i = 1; i < p.length; i++) { buf.writeInt16LE(p[i][0] - p[i - 1][0], o); buf.writeInt16LE(p[i][1] - p[i - 1][1], o + 2); o += 4; }
  }
  chunks.push(buf);
}
const out = Buffer.concat(chunks);
fs.writeFileSync(OUT, out);
console.log(`Carte : ${featsBefore} tronçons / ${before} points → ${featsAfter} lignes / ${after} points ; ${OUT} = ${(out.length / 1024).toFixed(0)} Ko`);
