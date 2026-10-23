// @ts-nocheck
// Scène « route lumineuse » façon site cinéma : des particules se rassemblent en trajet, un point lumineux le parcourt.
// Deux modes : "auto" (boucle, accueil) et "scroll" (pilotée par le défilement dans une section épinglée).
export function mountCine(root) {
  const canvas = root.querySelector("canvas.cine-canvas");
  if (!canvas) return function () {};
  const ctx = canvas.getContext("2d");
  const mode = root.dataset.mode || "auto";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const chaps = Array.prototype.slice.call(root.querySelectorAll(".chap"));
  const bar = root.querySelector(".story-bar i");
  const num = root.querySelector(".story-num");
  const xmin = parseFloat(root.dataset.xmin || "0.40");
  const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  let W = 0, H = 0, dpr = 1, visible = true, raf = 0, parts = [], routes = [], mx = 0.5, my = 0.5;
  const t0 = performance.now();
  let chap = -1, chapStart = 0;

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
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, coarse || window.innerWidth < 700 ? 1.5 : 2); // mobile : 1,5× (deux fois moins de pixels que 2×, libellés toujours nets)
    W = Math.max(1, Math.round(r.width * dpr));
    H = Math.max(1, Math.round(r.height * dpr));
    canvas.width = W; canvas.height = H;
    // Lueur d'ambiance en fond CSS (peinte une seule fois par le navigateur, au lieu de chaque image)
    canvas.style.background = "radial-gradient(circle " + Math.round(Math.max(r.width, r.height) * 0.6) + "px at 72% 40%, rgba(70,110,255,.20), rgba(70,110,255,0))";
    const portrait = r.width < r.height * 0.9;
    // coordonnées normalisées → zone utile (à droite du texte sur grand écran, en haut sur mobile)
    const map = portrait ? (p) => [0.08 + 0.84 * p[0], 0.06 + 0.46 * p[1]] : (p) => [xmin + (0.96 - xmin) * p[0], 0.10 + 0.78 * p[1]];
    const defs = [
      [[0.04, 0.9], [0.2, 1.0], [0.34, 0.3], [0.96, 0.16]],   // Lille → aéroport
      [[0.04, 0.9], [0.25, 0.7], [0.55, 1.05], [0.98, 0.78]], // vers Paris
      [[0.04, 0.9], [0.0, 0.45], [0.3, 0.05], [0.62, 0.02]],  // vers Bruxelles
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
    const N = coarse || r.width < 700 ? 190 : 1100; // moins de particules sur mobile : animation fluide sans saturer le processeur
    parts = [];
    for (let i = 0; i < N; i++) {
      const rr = Math.random() < 0.62 ? 0 : Math.random() < 0.5 ? 1 : 2;
      parts.push({ r: rr, u: Math.random(), off: gauss() * (rr === 0 ? 9 : 6), sx: Math.random(), sy: Math.random(), vx: (Math.random() - 0.5) * 0.012, vy: (Math.random() - 0.5) * 0.012, ph: Math.random() * 6.28, sz: 0.6 + Math.random() * 1.5 });
    }
  }

  function progress(now) {
    if (mode === "scroll") {
      const b = root.getBoundingClientRect(), vh = window.innerHeight;
      // Mobile : l'animation démarre dès que le bloc occupe la moitié de l'écran (pas une fois tout en haut).
      const lead = window.innerWidth < 900 ? vh * 0.5 : 0;
      const s = clamp((lead - b.top) / Math.max(b.height - vh + lead, 1), 0, 1);
      return { s, build: ease(s / 0.28), head: inout((s - 0.18) / 0.74), arrive: clamp((s - 0.9) / 0.1, 0, 1) };
    }
    const t = (now - t0) / 1000;
    return { s: 0, build: ease(t / 3.2), head: ((t * 0.09) % 1.15), arrive: 0 };
  }

  function setChapter(i, now) {
    if (i === chap) return;
    chap = i; chapStart = now;
    chaps.forEach((c, k) => c.classList.toggle("on", k === i));
    if (num) num.textContent = "0" + (i + 1) + " / 0" + chaps.length;
  }

  function draw(now) {
    const p = progress(now), time = (now - t0) / 1000;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    const px = (mx - 0.5) * 14 * dpr, py = (my - 0.5) * 10 * dpr;
    const main = routes[0], hi = clamp(Math.floor(clamp(p.head, 0, 1) * (main.length - 1)), 0, main.length - 1);
    const headU = clamp(p.head, 0, 1);


    // traits fins des routes
    for (let r = 0; r < routes.length; r++) {
      const pts = routes[r], end = r === 0 ? hi : pts.length - 1;
      ctx.beginPath();
      for (let i = 0; i <= end; i++) { const q = pts[i]; i ? ctx.lineTo(q.x + px, q.y + py) : ctx.moveTo(q.x + px, q.y + py); }
      ctx.lineWidth = (r === 0 ? 7 : 4) * dpr; ctx.strokeStyle = "rgba(90,130,255," + (0.05 * p.build) + ")"; ctx.stroke();
      ctx.lineWidth = (r === 0 ? 1.4 : 0.8) * dpr; ctx.strokeStyle = "rgba(150,185,255," + ((r === 0 ? 0.42 : 0.16) * p.build) + ")"; ctx.stroke();
    }

    // particules
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

    // point lumineux + faisceau
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

    // repères : départ, arrivée, destinations secondaires
    ctx.globalCompositeOperation = "source-over";
    ctx.font = (10 * dpr) + "px " + MONO;
    try { ctx.letterSpacing = (2 * dpr) + "px"; } catch (e) {}
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

    // chapitres + compteurs (mode scroll)
    if (mode === "scroll") {
      const i = clamp(Math.floor(p.s * chaps.length * 0.9999), 0, chaps.length - 1);
      setChapter(i, now);
      if (bar) bar.style.transform = `scaleX(${p.s.toFixed(4)})`;
      const c = chaps[i];
      if (c) c.querySelectorAll("[data-count]").forEach((el) => {
        const tgt = parseFloat(el.dataset.count), v = tgt * ease((now - chapStart) / 900);
        el.textContent = String(Math.round(v));
      });
    }
  }

  let last = 0;
  function frame(now) {
    raf = 0;
    if (!visible) return;
    // Téléphones : 24 images/s suffisent et soulagent le processeur (batterie, réactivité).
    if (coarse && now - last < 41) { raf = requestAnimationFrame(frame); return; }
    last = now;
    draw(now);
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }

  build();
  if (reduce) { chaps.forEach((c) => c.style.transition = "none"); }
  kick();
  const ro = new ResizeObserver(() => { build(); kick(); });
  ro.observe(canvas);
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) kick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; } }, { rootMargin: "0px" });
  io.observe(root);
  const onMove = (e) => { const b = root.getBoundingClientRect(); mx = clamp((e.clientX - b.left) / b.width, 0, 1); my = clamp((e.clientY - b.top) / b.height, 0, 1); };
  const onScroll = () => { if (reduce) kick(); };
  if (!coarse) root.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  return function () { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); root.removeEventListener("pointermove", onMove); window.removeEventListener("scroll", onScroll); };
}
