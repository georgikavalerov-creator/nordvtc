// Scène « route lumineuse » dessinée hors du fil principal (OffscreenCanvas dans un Worker).
// Même rendu que src/lib/cineScene.ts, mais le navigateur n'a plus à transmettre chaque image depuis
// le fil principal : la page reste fluide et réactive pendant l'animation.
// Messages reçus : init, resize, pointer, progress (mode défilement), visible.
"use strict";
let canvas = null, ctx = null, mode = "auto", xmin = 0.4, small = false, reduce = false;
let W = 0, H = 0, dpr = 1, cssW = 0, cssH = 0, visible = true, parts = [], routes = [], mx = 0.5, my = 0.5, scrollS = 0;
let timer = 0, raf = 0, last = 0;
const t0 = performance.now();
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const hasRaf = typeof self.requestAnimationFrame === "function";

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const ease = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const inout = (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
const bez = (p, t) => {
  const a = 1 - t;
  return [
    a * a * a * p[0][0] + 3 * a * a * t * p[1][0] + 3 * a * t * t * p[2][0] + t * t * t * p[3][0],
    a * a * a * p[0][1] + 3 * a * a * t * p[1][1] + 3 * a * t * t * p[2][1] + t * t * t * p[3][1],
  ];
};

function build() {
  W = Math.max(1, Math.round(cssW * dpr));
  H = Math.max(1, Math.round(cssH * dpr));
  canvas.width = W; canvas.height = H;
  const portrait = cssW < cssH * 0.9;
  const map = portrait ? (p) => [0.08 + 0.84 * p[0], 0.06 + 0.46 * p[1]] : (p) => [xmin + (0.96 - xmin) * p[0], 0.10 + 0.78 * p[1]];
  const defs = [
    [[0.04, 0.9], [0.2, 1.0], [0.34, 0.3], [0.96, 0.16]],
    [[0.04, 0.9], [0.25, 0.7], [0.55, 1.05], [0.98, 0.78]],
    [[0.04, 0.9], [0.0, 0.45], [0.3, 0.05], [0.62, 0.02]],
  ];
  routes = defs.map((d) => {
    const c = d.map(map), pts = [], n = 240;
    for (let i = 0; i <= n; i++) {
      const t = i / n, p = bez(c, t), q = bez(c, Math.min(1, t + 0.004)), q0 = bez(c, Math.max(0, t - 0.004));
      const dx = (q[0] - q0[0]) * W, dy = (q[1] - q0[1]) * H, l = Math.hypot(dx, dy) || 1;
      pts.push({ x: p[0] * W, y: p[1] * H, nx: -dy / l, ny: dx / l, tx: dx / l, ty: dy / l });
    }
    return pts;
  });
  const N = small || cssW < 700 ? 190 : 1100;
  parts = [];
  for (let i = 0; i < N; i++) {
    const rr = Math.random() < 0.62 ? 0 : Math.random() < 0.5 ? 1 : 2;
    parts.push({ r: rr, u: Math.random(), off: gauss() * (rr === 0 ? 9 : 6), sx: Math.random(), sy: Math.random(), vx: (Math.random() - 0.5) * 0.012, vy: (Math.random() - 0.5) * 0.012, ph: Math.random() * 6.28, sz: 0.6 + Math.random() * 1.5 });
  }
}

function progress(now) {
  if (mode === "scroll") {
    const s = scrollS;
    return { s, build: ease(s / 0.28), head: inout((s - 0.18) / 0.74), arrive: clamp((s - 0.9) / 0.1, 0, 1) };
  }
  const t = (now - t0) / 1000;
  return { s: 0, build: ease(t / 3.2), head: ((t * 0.09) % 1.15), arrive: 0 };
}

function draw(now) {
  const p = progress(now), time = (now - t0) / 1000;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.globalCompositeOperation = "lighter";
  const px = (mx - 0.5) * 14 * dpr, py = (my - 0.5) * 10 * dpr;
  const main = routes[0], hi = clamp(Math.floor(clamp(p.head, 0, 1) * (main.length - 1)), 0, main.length - 1);
  const headU = clamp(p.head, 0, 1);

  for (let r = 0; r < routes.length; r++) {
    const pts = routes[r], end = r === 0 ? hi : pts.length - 1;
    ctx.beginPath();
    for (let i = 0; i <= end; i++) { const q = pts[i]; i ? ctx.lineTo(q.x + px, q.y + py) : ctx.moveTo(q.x + px, q.y + py); }
    ctx.lineWidth = (r === 0 ? 7 : 4) * dpr; ctx.strokeStyle = "rgba(90,130,255," + (0.05 * p.build) + ")"; ctx.stroke();
    ctx.lineWidth = (r === 0 ? 1.4 : 0.8) * dpr; ctx.strokeStyle = "rgba(150,185,255," + ((r === 0 ? 0.42 : 0.16) * p.build) + ")"; ctx.stroke();
  }

  let lastHot = null;
  for (let i = 0; i < parts.length; i++) {
    const a = parts[i], pts = routes[a.r];
    const f = ease(p.build * 1.35 - (1 - a.u) * 0.35);
    const sx = ((a.sx + a.vx * time) % 1 + 1) % 1 * W, sy = ((a.sy + a.vy * time) % 1 + 1) % 1 * H;
    const q = pts[Math.floor(a.u * (pts.length - 1))];
    const spread = 1 + (1 - f) * 2.5;
    const x = sx + (q.x + q.nx * a.off * dpr * spread - sx) * f + px * (0.4 + a.sz * 0.2);
    const y = sy + (q.y + q.ny * a.off * dpr * spread - sy) * f + py * (0.4 + a.sz * 0.2);
    let al = 0.16 + 0.14 * Math.sin(time * 1.4 + a.ph), hot = false;
    if (a.r === 0 && f > 0.5) {
      const d = headU - a.u;
      if (d >= 0) { al = Math.max(0.3, 1 - d * 1.3); hot = true; }
      else al = 0.28;
    } else if (f > 0.5) al = 0.2;
    if (hot !== lastHot) { ctx.fillStyle = hot ? "rgb(185,210,255)" : "rgb(130,160,235)"; lastHot = hot; }
    ctx.globalAlpha = al;
    const s = a.sz * dpr;
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalAlpha = 1;

  if (p.build > 0.35) {
    const h = main[hi], k = clamp((p.build - 0.35) / 0.4, 0, 1);
    const cone = ctx.createLinearGradient(h.x + px, h.y + py, h.x + px + h.tx * 120 * dpr, h.y + py + h.ty * 120 * dpr);
    cone.addColorStop(0, "rgba(190,215,255," + 0.35 * k + ")"); cone.addColorStop(1, "rgba(190,215,255,0)");
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(h.x + px + h.nx * 3 * dpr, h.y + py + h.ny * 3 * dpr);
    ctx.lineTo(h.x + px + h.tx * 120 * dpr + h.nx * 34 * dpr, h.y + py + h.ty * 120 * dpr + h.ny * 34 * dpr);
    ctx.lineTo(h.x + px + h.tx * 120 * dpr - h.nx * 34 * dpr, h.y + py + h.ty * 120 * dpr - h.ny * 34 * dpr);
    ctx.lineTo(h.x + px - h.nx * 3 * dpr, h.y + py - h.ny * 3 * dpr);
    ctx.closePath(); ctx.fill();
    const rg = ctx.createRadialGradient(h.x + px, h.y + py, 0, h.x + px, h.y + py, 46 * dpr);
    rg.addColorStop(0, "rgba(220,235,255," + 0.95 * k + ")"); rg.addColorStop(0.25, "rgba(120,165,255," + 0.45 * k + ")"); rg.addColorStop(1, "rgba(70,110,255,0)");
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(h.x + px, h.y + py, 46 * dpr, 0, 6.283); ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.font = (10 * dpr) + "px " + MONO;
  try { ctx.letterSpacing = (2 * dpr) + "px"; } catch (e) { /* ancien navigateur */ }
  const node = (pt, label, strong, dx, dy, pulse) => {
    const rad = (4 + (pulse ? 10 * ((time * 0.7) % 1) : 0)) * dpr;
    ctx.strokeStyle = "rgba(170,200,255," + (strong ? 0.8 : 0.35) * p.build * (pulse ? 1 - ((time * 0.7) % 1) * 0.8 : 1) + ")";
    ctx.lineWidth = 1 * dpr; ctx.beginPath(); ctx.arc(pt.x + px, pt.y + py, rad, 0, 6.283); ctx.stroke();
    ctx.fillStyle = "rgba(220,232,255," + (strong ? 0.95 : 0.4) * p.build + ")";
    ctx.beginPath(); ctx.arc(pt.x + px, pt.y + py, 2.2 * dpr, 0, 6.283); ctx.fill();
    ctx.fillStyle = "rgba(180,200,245," + (strong ? 0.85 : 0.42) * p.build + ")";
    ctx.textAlign = dx < 0 ? "right" : "left";
    ctx.fillText(label, pt.x + px + dx * dpr, pt.y + py + dy * dpr);
  };
  const m = routes[0], e0 = m[m.length - 1], s0 = m[0];
  node(s0, "LILLE", true, 12, 4, true);
  node(e0, mode === "scroll" ? "AÉROPORT · LESQUIN" : "LESQUIN", true, -14, -12, p.arrive > 0.2 || mode === "auto");
  node(routes[1][routes[1].length - 1], "PARIS", false, -12, 18, false);
  node(routes[2][routes[2].length - 1], "BRUXELLES", false, 12, 4, false);
}

function frame(now) {
  raf = 0; timer = 0;
  if (!visible || !ctx) return;
  // Petits écrans : 24 images/s (batterie, réactivité). Ordinateur : pleine cadence.
  if (small && now - last < 41) return schedule();
  last = now;
  draw(now);
  if (!reduce) schedule();
}
function schedule() {
  if (raf || timer) return;
  if (hasRaf) raf = self.requestAnimationFrame(frame);
  else timer = setTimeout(() => frame(performance.now()), 16);
}
function stop() {
  if (raf && hasRaf) self.cancelAnimationFrame(raf);
  if (timer) clearTimeout(timer);
  raf = 0; timer = 0;
}

self.onmessage = (e) => {
  const d = e.data || {};
  if (d.type === "init") {
    canvas = d.canvas; ctx = canvas.getContext("2d");
    mode = d.mode || "auto"; xmin = d.xmin || 0.4; small = !!d.small; reduce = !!d.reduce;
    cssW = d.w; cssH = d.h; dpr = d.dpr; scrollS = d.s || 0;
    build(); schedule();
  } else if (!ctx) {
    return;
  } else if (d.type === "resize") {
    cssW = d.w; cssH = d.h; dpr = d.dpr; small = !!d.small; build(); schedule();
  } else if (d.type === "pointer") {
    mx = d.mx; my = d.my;
  } else if (d.type === "progress") {
    scrollS = d.s; if (reduce) schedule();
  } else if (d.type === "visible") {
    visible = !!d.v; if (visible) schedule(); else stop();
  }
};
