// @ts-nocheck
// Carte 2D animée de la métropole lilloise : trajet A → B piloté par le défilement.
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const KX = Math.cos((50.63 * Math.PI) / 180);
const W = (lon, lat) => [(lon - 3.1) * KX, -(lat - 50.62)]; // monde : degrés (x vers l'est, y vers le sud)

// Lissage Catmull-Rom d'une polyligne [lon, lat].
function smooth(pts, n = 8) {
  const P = pts.map((p) => W(p[0], p[1])), out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(i - 1, 0)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(i + 2, P.length - 1)];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((a) => 0.5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3)));
    }
  }
  out.push(P[P.length - 1]);
  return out;
}

// Itinéraire réel Gare Lille-Flandres → terminal de l'aéroport de Lille-Lesquin (OpenStreetMap / OSRM).
const ROUTE = [[3.07021,50.63701],[3.07213,50.63794],[3.07451,50.639],[3.07584,50.63956],[3.07775,50.6376],[3.07714,50.63742],[3.07702,50.63735],[3.07653,50.63669],[3.07611,50.63601],[3.07869,50.63539],[3.07899,50.63528],[3.0791,50.63518],[3.07988,50.63551],[3.08008,50.63553],[3.08025,50.63551],[3.08045,50.6354],[3.0809,50.63503],[3.08126,50.63468],[3.08151,50.63449],[3.0819,50.63409],[3.08222,50.63371],[3.08239,50.63343],[3.08249,50.63313],[3.08253,50.63281],[3.08249,50.63234],[3.08206,50.63047],[3.08204,50.63011],[3.0821,50.62968],[3.08287,50.62772],[3.08407,50.6255],[3.08437,50.62476],[3.08443,50.62444],[3.08444,50.6242],[3.08442,50.62398],[3.08435,50.62373],[3.08422,50.62344],[3.08402,50.62312],[3.0837,50.62277],[3.0822,50.62135],[3.08209,50.62118],[3.08136,50.62048],[3.08116,50.62024],[3.08093,50.61987],[3.08081,50.61962],[3.0807,50.61924],[3.08067,50.61894],[3.08067,50.61862],[3.08082,50.61806],[3.08109,50.61752],[3.08145,50.61711],[3.08192,50.61671],[3.08507,50.61465],[3.08696,50.61322],[3.08785,50.61259],[3.0947,50.6081],[3.09525,50.6078],[3.09708,50.60663],[3.09952,50.60512],[3.10022,50.60464],[3.10111,50.60389],[3.10178,50.60317],[3.10238,50.60232],[3.10291,50.60131],[3.10318,50.60051],[3.10332,50.59981],[3.10337,50.59922],[3.10335,50.59844],[3.10317,50.59753],[3.10298,50.59691],[3.10259,50.59615],[3.10232,50.59578],[3.10199,50.59541],[3.10038,50.59402],[3.09983,50.5935],[3.09919,50.59278],[3.09838,50.5916],[3.0978,50.59085],[3.09224,50.58515],[3.09192,50.58496],[3.09091,50.58401],[3.08967,50.58295],[3.08948,50.58291],[3.08928,50.58293],[3.08907,50.58302],[3.08887,50.58322],[3.08862,50.58328],[3.08836,50.58322],[3.08826,50.58316],[3.0882,50.58304],[3.08823,50.58292],[3.0884,50.5828],[3.08858,50.58277],[3.08901,50.58275],[3.09003,50.58244],[3.09062,50.5822],[3.09144,50.58197],[3.09288,50.58171],[3.09439,50.58161],[3.09505,50.58152],[3.09551,50.5814],[3.09571,50.58125],[3.09574,50.5812],[3.09573,50.58111],[3.09564,50.58091],[3.09491,50.58003],[3.09476,50.57967],[3.09473,50.57932],[3.09676,50.57348],[3.09682,50.57323],[3.0968,50.57298],[3.0967,50.57275],[3.09616,50.57199],[3.09584,50.57163],[3.09566,50.57148],[3.09564,50.57139],[3.09568,50.57132],[3.09589,50.57119],[3.09596,50.57109],[3.09647,50.56965],[3.09659,50.56954],[3.09675,50.56972],[3.0971,50.56977],[3.09674,50.57074],[3.09663,50.57073]].map((p) => W(p[0], p[1]));

const CITIES = [
  ["LILLE", 3.0573, 50.6292, 1, 900, 0.05], ["ROUBAIX", 3.1746, 50.6927, 0.8, 300, 0.028], ["TOURCOING", 3.1612, 50.7239, 0.75, 260, 0.025],
  ["VILLENEUVE-D'ASCQ", 3.145, 50.623, 0.7, 280, 0.03], ["MARCQ", 3.08, 50.677, 0.5, 120, 0.02], ["ARMENTIÈRES", 2.881, 50.686, 0.6, 160, 0.02],
  ["SECLIN", 3.029, 50.549, 0.5, 110, 0.016], ["TOURNAI", 3.388, 50.606, 0.7, 170, 0.02], ["COURTRAI", 3.265, 50.828, 0.7, 170, 0.02],
  ["ORCHIES", 3.24, 50.472, 0.5, 90, 0.014], ["LENS", 2.833, 50.429, 0.6, 150, 0.02], ["MOUSCRON", 3.213, 50.745, 0.5, 100, 0.015],
  ["DOUAI", 3.08, 50.37, 0.6, 150, 0.02], ["HAUBOURDIN", 2.989, 50.609, 0.35, 90, 0.012], ["LOMME", 3.0, 50.643, 0.35, 90, 0.012],
];
function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

const DARK = { waterF: "rgba(60,110,255,.12)", minor: "rgba(140,170,255,.09)", ter: "rgba(140,170,255,.16)", sec: "rgba(150,180,255,.26)", pri: "rgba(165,190,255,.36)", halo: "rgba(70,110,255,.22)", dots: "rgba(150,180,255,.32)", canal: "rgba(80,140,255,.28)", main: "rgba(130,160,255,.2)", mwG: "rgba(120,160,255,.14)", mw: "rgba(170,195,255,.42)", rw: "rgba(190,210,255,.45)", lab: [190, 208, 255], edge: "rgba(150,175,235,.55)", dash: "rgba(160,190,255,.35)", rGlow: "rgba(120,165,255,.35)", rLine: "#cfe0ff", rShadow: "#6f98ff", trail: "255,255,255", carDot: "#fff", pinA: "#7aa2ff", pinB: "#ffffff", pinBg: "rgba(10,16,34,.82)", pinBd: "rgba(140,170,255,.4)", pinTx: "#e8efff", pinDot: "#05070d", price: "#f3f7ff", priceTx: "#0a1022", ring: "120,165,255" };
const LIGHT = { waterF: "rgba(31,91,255,.12)", minor: "rgba(11,20,48,.1)", ter: "rgba(11,20,48,.16)", sec: "rgba(11,20,48,.25)", pri: "rgba(11,20,48,.36)", halo: "rgba(31,91,255,.13)", dots: "rgba(31,70,170,.36)", canal: "rgba(31,91,255,.3)", main: "rgba(11,20,48,.16)", mwG: "rgba(31,91,255,.05)", mw: "rgba(31,91,255,.34)", rw: "rgba(11,20,48,.5)", lab: [11, 20, 48], edge: "rgba(11,20,48,.5)", dash: "rgba(11,20,48,.32)", rGlow: "rgba(31,91,255,.25)", rLine: "#1f5bff", rShadow: "rgba(31,91,255,.6)", trail: "11,20,48", carDot: "#0b1430", pinA: "#1f5bff", pinB: "#0b1430", pinBg: "rgba(255,255,255,.94)", pinBd: "rgba(31,91,255,.4)", pinTx: "#0b1430", pinDot: "#fff", price: "#0b1430", priceTx: "#ffffff", ring: "31,91,255" };
function isDark() { const t = document.documentElement.dataset.theme; return t === "dark" || (t !== "light" && matchMedia("(prefers-color-scheme: dark)").matches); }

export function mountMap(root) {
  const canvas = root.querySelector("canvas.map2d");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let w = 1, h = 1, mob = false, vis = true, raf = 0, px = 0, py = 0, tx = 0, ty = 0;
  const t0 = performance.now();

  // Vrais tracés (OpenStreetMap) : routes, eau, pistes. Chargés une fois, dessinés via Path2D.
  const LAY = {}; let loaded = 0;
  const decode = (arr, closed) => { const p = new Path2D(); for (const f of arr) { let x = f[0], y = f[1]; let q = W(x / 1e4, y / 1e4); p.moveTo(q[0], q[1]); for (let i = 2; i < f.length; i += 2) { x += f[i]; y += f[i + 1]; q = W(x / 1e4, y / 1e4); p.lineTo(q[0], q[1]); } if (closed) p.closePath(); } return p; };
  const ready = (d) => { for (const k of ["min", "ter", "sec", "pri", "trunk", "mw", "ww", "aero"]) LAY[k] = decode(d[k] || [], false); LAY.water = decode(d.water || [], true); loaded = performance.now(); kick(); };
  if (window.__LILLE_MAP) setTimeout(() => ready(window.__LILLE_MAP), 0);
  else fetch(root.getAttribute("data-map") || "/lille-map.json").then((r) => r.json()).then(ready).catch(() => {});
  // Longueur cumulée du trajet.
  const cum = [0];
  for (let i = 1; i < ROUTE.length; i++) cum.push(cum[i - 1] + Math.hypot(ROUTE[i][0] - ROUTE[i - 1][0], ROUTE[i][1] - ROUTE[i - 1][1]));
  const RL = cum[cum.length - 1];
  function at(d) { // point et cap à la distance d
    d = clamp(d, 0, RL); let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
    const t = (d - cum[i - 1]) / Math.max(cum[i] - cum[i - 1], 1e-9), a = ROUTE[i - 1], b = ROUTE[i];
    return { x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t), ang: Math.atan2(b[1] - a[1], b[0] - a[0]), i, t };
  }
  const A = ROUTE[0], B = ROUTE[ROUTE.length - 1];

  function resize() {
    const r = canvas.getBoundingClientRect(); w = Math.max(r.width, 1); h = Math.max(r.height, 1); mob = w < 800;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function progress() { const b = root.getBoundingClientRect(), lead = innerWidth < 900 ? innerHeight * 0.5 : 0; return clamp((lead - b.top) / Math.max(b.height - innerHeight + lead, 1), 0, 1); }

  const coarse = matchMedia("(pointer: coarse)").matches;
  let lastT = 0;
  function draw(now) {
    raf = 0; if (!vis) return;
    // Téléphones : 30 images/s suffisent (fluide, moins de batterie).
    if (coarse && now - lastT < 32) { raf = requestAnimationFrame(draw); return; }
    lastT = now;
    const time = (now - t0) / 1000, s = progress(); root.classList.toggle("is-started", s > 0.03);
    tx += (px - tx) * 0.06; ty += (py - ty) * 0.06;
    const zi = sm(s / 0.42);
    const hv = lerp(mob ? 0.62 : 0.46, mob ? 0.3 : 0.165, zi);            // hauteur visible en degrés
    const sc = h / hv;
    const mid = { x: (A[0] + B[0]) / 2, y: (A[1] + B[1]) / 2 }, metro = { x: W(3.12, 50.645)[0], y: W(3.12, 50.645)[1] };
    const car = at(RL * sm((s - 0.52) / 0.4));
    const follow = sm((s - 0.52) / 0.2) * (1 - sm((s - 0.93) / 0.07));
    const cx = lerp(metro.x, mid.x, zi) + (car.x - mid.x) * 0.5 * follow - tx * 0.004;
    const cy = lerp(metro.y, mid.y, zi) + (car.y - mid.y) * 0.5 * follow - ty * 0.004;
    const ox = mob ? w * 0.5 : w * 0.64, oy = mob ? h * 0.35 : h * 0.5; // mobile : carte plus bas (le haut est sous l'en-tête)
    const X = (p) => (p[0] - cx) * sc + ox, Y = (p) => (p[1] - cy) * sc + oy;
    const lw = lerp(0.8, 1.5, zi), C = isDark() ? DARK : LIGHT;

    ctx.clearRect(0, 0, w, h);
    // Halo de la ville.
    const lc = W(3.0573, 50.6292), g = ctx.createRadialGradient(X(lc), Y(lc), 0, X(lc), Y(lc), 0.16 * sc);
    g.addColorStop(0, C.halo); g.addColorStop(1, "rgba(70,110,255,0)"); ctx.fillStyle = g; { const hr = 0.16 * sc, hx = X(lc), hy = Y(lc); ctx.fillRect(hx - hr, hy - hr, hr * 2, hr * 2); } // seule la zone du halo est peinte (rendu identique)
    if (loaded) {
      const fade = clamp((now - loaded) / 900, 0, 1);
      ctx.save(); ctx.globalAlpha = fade;
      ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * (ox - cx * sc), dpr * (oy - cy * sc)); ctx.lineCap = ctx.lineJoin = "round";
      const k1 = 1 / sc, zz = 0.35 + 0.65 * zi;
      ctx.fillStyle = C.waterF; ctx.fill(LAY.water);
      ctx.strokeStyle = C.canal; ctx.lineWidth = 2.2 * k1 * lw; ctx.stroke(LAY.ww);
      ctx.globalAlpha = fade * clamp((zi - 0.1) / 0.5, 0, 1); ctx.strokeStyle = C.minor; ctx.lineWidth = 0.9 * k1 * lw; ctx.stroke(LAY.min);
      ctx.globalAlpha = fade * (0.45 + 0.55 * zi); ctx.strokeStyle = C.ter; ctx.lineWidth = 1.0 * k1 * lw; ctx.stroke(LAY.ter);
      ctx.globalAlpha = fade; ctx.strokeStyle = C.sec; ctx.lineWidth = 1.3 * k1 * lw; ctx.stroke(LAY.sec);
      ctx.strokeStyle = C.pri; ctx.lineWidth = 1.7 * k1 * lw; ctx.stroke(LAY.pri);
      ctx.strokeStyle = C.mwG; ctx.lineWidth = 6 * k1 * lw; ctx.stroke(LAY.mw); ctx.stroke(LAY.trunk);
      ctx.strokeStyle = C.mw; ctx.lineWidth = 2 * k1 * lw; ctx.stroke(LAY.mw); ctx.lineWidth = 1.8 * k1 * lw; ctx.stroke(LAY.trunk);
      ctx.strokeStyle = C.rw; ctx.lineWidth = 2.4 * k1 * lw; ctx.stroke(LAY.aero);
      ctx.restore();
    }
    // Libellés des villes.
    ctx.font = "500 10px ui-monospace, Menlo, monospace"; ctx.textBaseline = "middle";
    for (const c of CITIES) {
      const p = W(c[1], c[2]), x = X(p), y = Y(p); if (x < 20 || x > w - 20 || y < 20 || y > h - 20) continue;
      const big = c[3] >= 0.7, k = big ? 1 : sm((zi - 0.3) / 0.5); if (k <= 0.02) continue;
      ctx.fillStyle = `rgba(${C.lab[0]},${C.lab[1]},${C.lab[2]},${(big ? 0.78 : 0.55) * k})`; ctx.beginPath(); ctx.arc(x, y, big ? 2.6 : 1.8, 0, 6.283); ctx.fill();
      ctx.letterSpacing = "1.5px"; ctx.fillText(c[0], x + 8, y - 8);
    }
    ctx.letterSpacing = "1.5px"; ctx.fillStyle = C.edge;
    const edge = (txt, lon, lat) => { const p = W(lon, lat), x = clamp(X(p), 30, w - 110), y = clamp(Y(p), 30, h - 30); ctx.fillText(txt, x, y); };
    if (zi < 0.9) { edge("PARIS ↓", 3.0, 50.31); edge("BRUXELLES →", 3.58, 50.6); edge("GAND ↗", 3.26, 50.88); edge("DUNKERQUE ←", 2.62, 50.75); }

    // Trajet A → B.
    const drawP = sm((s - 0.04) / 0.26), dEnd = RL * drawP;
    const route = (to, col, wd, glow) => {
      ctx.beginPath(); let started = false;
      for (let i = 0; i < ROUTE.length; i++) { if (cum[i] > to) { const a = at(to); ctx.lineTo(X([a.x, a.y]), Y([a.x, a.y])); break; } const p = ROUTE[i]; started ? ctx.lineTo(X(p), Y(p)) : (ctx.moveTo(X(p), Y(p)), (started = true)); }
      ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.shadowColor = glow || "transparent"; ctx.shadowBlur = glow ? 14 : 0; ctx.stroke(); ctx.shadowBlur = 0;
    };
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.setLineDash([2, 7]); route(RL, C.dash, 2); ctx.setLineDash([]);
    route(dEnd, C.rGlow, 9 * lw * 0.8);
    route(dEnd, C.rLine, 3.2 * Math.max(lw, 1), C.rShadow);
    // Voiture : traînée lumineuse + point.
    if (s > 0.5) {
      const d = RL * sm((s - 0.52) / 0.4), tr = Math.max(d - RL * 0.35, 0);
      ctx.beginPath(); for (let k = 0; k <= 24; k++) { const a = at(lerp(tr, d, k / 24)); k ? ctx.lineTo(X([a.x, a.y]), Y([a.x, a.y])) : ctx.moveTo(X([a.x, a.y]), Y([a.x, a.y])); }
      const ca = at(tr), cb = at(d), tg = ctx.createLinearGradient(X([ca.x, ca.y]), Y([ca.x, ca.y]), X([cb.x, cb.y]), Y([cb.x, cb.y]));
      tg.addColorStop(0, `rgba(${C.trail},0)`); tg.addColorStop(1, `rgba(${C.trail},.95)`); ctx.strokeStyle = tg; ctx.lineWidth = 5 * Math.max(lw, 1); ctx.stroke();
      const cx2 = X([cb.x, cb.y]), cy2 = Y([cb.x, cb.y]);
      ctx.save(); ctx.translate(cx2, cy2); ctx.rotate(cb.ang);
      const cone = ctx.createRadialGradient(0, 0, 0, 40, 0, 46); cone.addColorStop(0, "rgba(220,235,255,.5)"); cone.addColorStop(1, "rgba(220,235,255,0)");
      ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(46, -17); ctx.lineTo(46, 17); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = C.carDot; ctx.shadowColor = "#8fb0ff"; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(cx2, cy2, 6.5, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = "#1f5bff"; ctx.beginPath(); ctx.arc(cx2, cy2, 3, 0, 6.283); ctx.fill();
    }
    // Épingles A et B.
    const pin = (p, label, k, col, pulse) => {
      if (k <= 0.01) return; const x = X(p), y = Y(p);
      if (pulse) { const r = ((time * 0.8) % 1); ctx.strokeStyle = `rgba(${C.ring},${(1 - r) * 0.55 * k})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 8 + r * 26, 0, 6.283); ctx.stroke(); }
      ctx.fillStyle = col; ctx.globalAlpha = k; ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(x, y, 7, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = C.pinDot; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.283); ctx.fill();
      ctx.font = "600 11px ui-monospace, Menlo, monospace"; ctx.letterSpacing = "1.2px"; ctx.fillStyle = C.pinTx; ctx.textAlign = "left";
      const tw = ctx.measureText(label).width + 18, by = y - 12; let bx = x + 14; if (bx + tw > w - 8) bx = x - 14 - tw;
      ctx.fillStyle = C.pinBg; ctx.strokeStyle = C.pinBd; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(bx, by - 12, tw, 24, 12); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.pinTx; ctx.fillText(label, bx + 9, by); ctx.globalAlpha = 1;
    };
    pin(A, "A · GARE LILLE", sm((s - 0.02) / 0.08), C.pinA, s < 0.52);
    pin(B, "B · AÉROPORT LESQUIN", sm((s - 0.26) / 0.1), C.pinB, s > 0.9 || s < 0.5);
    // Étiquette prix au milieu du trajet.
    { const k = sm((s - 0.34) / 0.12) * (1 - sm((s - 0.6) / 0.1) * 0.0); if (k > 0.01) {
      const m = at(RL * 0.5), y = Y([m.x, m.y]) + (1 - k) * 8, txt = "68 € · PRIX FERME"; ctx.font = "600 11px ui-monospace, Menlo, monospace"; ctx.letterSpacing = "1.2px";
      const tw = ctx.measureText(txt).width + 22; let x = X([m.x, m.y]) + 14; if (x + tw > w - 8) x = X([m.x, m.y]) - 14 - tw; ctx.globalAlpha = k; ctx.fillStyle = C.price; ctx.beginPath(); ctx.roundRect(x, y - 13, tw, 26, 13); ctx.fill();
      ctx.fillStyle = C.priceTx; ctx.textAlign = "left"; ctx.fillText(txt, x + 11, y); ctx.globalAlpha = 1; } }
    // Arrivée : durée.
    { const k = sm((s - 0.92) / 0.07); if (k > 0.01) { const y = Y(B) + 30, txt = "ARRIVÉE · 15 MIN"; ctx.font = "600 11px ui-monospace, Menlo, monospace"; ctx.letterSpacing = "1.2px";
      const tw = ctx.measureText(txt).width + 22; let x = X(B) + 14; if (x + tw > w - 8) x = X(B) - 14 - tw; ctx.globalAlpha = k; ctx.fillStyle = "rgba(31,91,255,.92)"; ctx.beginPath(); ctx.roundRect(x, y - 13, tw, 26, 13); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.fillText(txt, x + 11, y); ctx.globalAlpha = 1; } }
    ctx.letterSpacing = "0px";
    if (!reduced) raf = requestAnimationFrame(draw);
  }
  const kick = () => { if (!raf && vis) raf = requestAnimationFrame(draw); };
  const onMove = (e) => { const r = root.getBoundingClientRect(); px = ((e.clientX - r.left) / r.width - 0.5) * 2; py = ((e.clientY - r.top) / r.height - 0.5) * 2; kick(); };
  const ro = new ResizeObserver(() => { resize(); kick(); }); ro.observe(canvas);
  const io = new IntersectionObserver((e) => { vis = e[0].isIntersecting; if (vis) kick(); }, { rootMargin: "0px" }); io.observe(root);
  addEventListener("pointermove", onMove, { passive: true });
  if (reduced) addEventListener("scroll", kick, { passive: true });
  resize(); kick();
  return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); removeEventListener("pointermove", onMove); removeEventListener("scroll", kick); };
}
