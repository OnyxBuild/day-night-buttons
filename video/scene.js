// Version canvas du bouton jour / nuit, pour la fenêtre "jeu" de video-maker (update() + draw() sur #display).
// Mêmes formes et mêmes couleurs que le composant React ; Entrée = clic sur le bouton.
const cv = document.getElementById("display"), g = cv.getContext("2d");
const PX = 40, PY = 100, PW = 880, PH = 440, K = PW / 420;            // le bouton dans le canvas 960 x 640, K = pixels par unité du SVG (420 x 210)

// ---------- état ----------
let tick = 0, target = 0, prog = 0;                                   // prog : 0 = jour, 1 = nuit
const DUR = 1.6, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
addEventListener("keydown", (e) => { if (e.code === "Enter") target = 1 - target; });
function update() {
  tick++;
  prog = clamp(prog + (target ? 1 : -1) / (DUR * 60), 0, 1);
}

// ---------- couleurs ----------
const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
const DAY = { skyTop: "#2b7fd6", skyMid: "#6fb8f0", skyBot: "#cfe9f7", far: "#8fb0c9", main: "#6f8798", shade: "#4f6677", snow: "#ffffff", hill: "#4d7a55", pine: "#1f4a3a", lakeTop: "#5aa5c7", lakeBot: "#2d6f93", cloud: "#ffffff", glint: "#fff1bd", haze: "#ffffff", pageA: "#dff1fb", pageB: "#a9d3ee", shimmer: "#ffffff" };
const NIGHT = { skyTop: "#04061a", skyMid: "#0d1738", skyBot: "#27386a", far: "#1b2745", main: "#16203a", shade: "#0a1123", snow: "#a9bbe0", hill: "#0d1828", pine: "#040913", lakeTop: "#0c1a38", lakeBot: "#050b1b", cloud: "#3a4770", glint: "#dce8ff", haze: "#6d84c4", pageA: "#0e1630", pageB: "#03050d", shimmer: "#9db6ff" };
function palette(e) {
  const o = {};
  for (const k in DAY) { const a = hex(DAY[k]), b = hex(NIGHT[k]); o[k] = "rgb(" + a.map((v, i) => Math.round(v + (b[i] - v) * e)).join(",") + ")"; }
  return o;
}

// ---------- décor (positions tirées une fois, comme dans le composant) ----------
function mulberry32(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rand = mulberry32(1337), R = (a, b) => a + rand() * (b - a);
const STARS = Array.from({ length: 70 }, () => ({ x: R(4, 416), y: R(3, 100), r: rand() < 0.15 ? R(1, 1.5) : R(0.35, 0.9), dur: R(2, 5), delay: R(0, 5) }));
const SHIMMER = Array.from({ length: 34 }, () => { const y = 136 + Math.pow(rand(), 1.2) * 70; return { x: R(10, 410), y, w: 6 + (y - 132) * 0.22, dur: R(2.5, 6), delay: R(0, 6) }; });
const FLIES = Array.from({ length: 14 }, () => ({ x: R(10, 410), y: R(112, 175), r: R(0.8, 1.4), dx: R(-18, 18), dy: R(-14, 14), fdur: R(4, 8), fdelay: R(0, 6), bdelay: R(0, 3) }));
const GLINTS = [[138, 9, 1.6, .2], [146, 15, 1.8, .9], [156, 22, 2, 1.6], [168, 28, 2.2, .5], [182, 32, 2.2, 1.2], [198, 36, 2.2, 2]];
const PINES = [[16, 130, 1.15], [36, 133, .95], [54, 131, 1.3], [76, 134, .8], [396, 131, 1.25], [378, 134, .9], [412, 134, 1.05], [358, 135, .7]];
const CLOUDS = [
  { d: 70, delay: 30, a: 1, e: [[60, 38, 26, 7], [74, 32, 16, 8], [48, 33, 12, 6]] },
  { d: 95, delay: 70, a: .85, e: [[60, 72, 34, 6], [78, 67, 18, 7]] },
  { d: 55, delay: 10, a: .8, e: [[60, 18, 22, 5], [68, 14, 12, 5]] },
];
const BIRDS = [{ d: 22, delay: 6, y: 40 }, { d: 26, delay: 14, y: 62 }, { d: 30, delay: 2, y: 34 }];
const P = {
  far: new Path2D("M-5 140 L-5 98 L35 78 L66 96 L106 62 L148 94 L188 74 L228 98 L272 58 L322 96 L362 74 L425 104 L425 140Z"),
  main: new Path2D("M-10 140 L84 76 L128 92 L192 20 L216 46 L238 38 L304 102 L342 88 L430 140Z"),
  shade: new Path2D("M192 20 L216 46 L238 38 L304 102 L342 88 L430 140 L215 140 L204 84 L196 56Z"),
  snow1: new Path2D("M192 20 L170 52 L181 47 L189 59 L199 48 L208 58 L216 46 L206 36 Z"),
  snow2: new Path2D("M238 38 L224 60 L232 56 L238 64 L246 54 L252 58 Z"),
  hill: new Path2D("M-5 140 L-5 118 Q50 102 120 118 T250 114 T425 118 L425 140Z"),
  pine: new Path2D("M0 -30 L7 -14 L3.5 -14 L10 -2 L5 -2 L12 8 L-12 8 L-5 -2 L-10 -2 L-3.5 -14 L-7 -14 Z M-1.5 8 h3 v5 h-3 z"),
  cursor: new Path2D("M14 8l36 20-16 4 10 18-8 4-10-18-12 12z"),
};

function drawScene(c, col) {
  c.fillStyle = col.far; c.fill(P.far);
  c.fillStyle = col.main; c.fill(P.main);
  c.globalAlpha = .55; c.fillStyle = col.shade; c.fill(P.shade); c.globalAlpha = 1;
  c.fillStyle = col.snow; c.fill(P.snow1); c.globalAlpha = .9; c.fill(P.snow2); c.globalAlpha = 1;
  c.fillStyle = col.hill; c.fill(P.hill);
  c.fillStyle = col.pine;
  for (const [x, y, s] of PINES) { c.save(); c.translate(x, y); c.scale(s, s); c.fill(P.pine); c.restore(); }
}

const pill = (c, x, y, w, h) => { c.beginPath(); c.roundRect(x, y, w, h, h / 2); };
const radial = (c, x, y, r, stops, x0 = x, y0 = y) => { const gr = c.createRadialGradient(x0, y0, 0, x, y, r); for (const [o, col] of stops) gr.addColorStop(o, col); return gr; };
const tri = (x) => 0.5 - 0.5 * Math.cos(2 * Math.PI * x);              // 0 → 1 → 0 sur une période de 1

const off = document.createElement("canvas"); off.width = PW; off.height = PH;
const oc = off.getContext("2d");

function drawBackdrop(e, col) {
  const bg = g.createRadialGradient(480, 0, 0, 480, 0, 900);
  bg.addColorStop(0, col.pageA); bg.addColorStop(1, col.pageB);
  g.fillStyle = bg; g.fillRect(0, 0, 960, 640);
}

function drawCursor(t) {
  const clicks = (typeof CFG !== "undefined" && CFG.inputs ? CFG.inputs : []).filter((i) => i[0] === "Enter").map((i) => i[1]);
  const home = [1010, 700], spot = [650, 430];
  for (const tc of clicks) {
    if (t < tc - 1.2 || t > tc + 1.6) continue;
    const a = ease(clamp((t - (tc - 1.1)) / 0.95)), b = ease(clamp((t - (tc + 0.55)) / 0.9));
    const k = a - b, x = home[0] + (spot[0] - home[0]) * k, y = home[1] + (spot[1] - home[1]) * k;
    const press = clamp(1 - Math.abs(t - (tc + 0.03)) / 0.14);
    const ring = clamp((t - tc) / 0.6);
    if (ring > 0 && ring < 1) { g.save(); g.strokeStyle = `rgba(255,255,255,${0.7 * (1 - ring)})`; g.lineWidth = 4; g.beginPath(); g.arc(spot[0], spot[1], 12 + ring * 70, 0, 7); g.stroke(); g.restore(); }
    g.save(); g.translate(x - 8, y - 6); g.scale(1.35 - press * 0.18, 1.35 - press * 0.18);
    g.shadowColor = "rgba(0,0,0,.5)"; g.shadowBlur = 10; g.shadowOffsetY = 4;
    g.fillStyle = "#fff"; g.strokeStyle = "#0b0c0f"; g.lineWidth = 3; g.lineJoin = "round";
    g.fill(P.cursor); g.stroke(P.cursor); g.restore();
  }
}

function draw() {
  const t = tick / 60, n = prog, e = ease(n), col = palette(e);
  g.clearRect(0, 0, 960, 640);
  drawBackdrop(e, col);

  // ombre portée + anneau du bouton
  g.save();
  g.shadowColor = `rgba(${20 + 50 * e},${60 + 40 * e},${100 + 155 * e},${0.55 - 0.1 * e})`; g.shadowBlur = 60; g.shadowOffsetY = 28;
  g.fillStyle = "#000"; pill(g, PX, PY, PW, PH); g.fill(); g.restore();
  g.save(); pill(g, PX - 8, PY - 8, PW + 16, PH + 16);
  g.lineWidth = 8; g.strokeStyle = `rgba(${255 - 105 * e},${255 - 80 * e},255,${0.55 - 0.33 * e})`; g.stroke(); g.restore();

  // le paysage, en unités SVG, découpé dans la pilule
  g.save(); pill(g, PX, PY, PW, PH); g.clip();
  g.translate(PX, PY); g.scale(K, K);

  let gr = g.createLinearGradient(0, 0, 0, 210);
  gr.addColorStop(0, col.skyTop); gr.addColorStop(.55, col.skyMid); gr.addColorStop(1, col.skyBot);
  g.fillStyle = gr; g.fillRect(0, 0, 420, 210);

  // étoiles + étoile filante
  const sa = clamp((e - .3) / .7);
  if (sa > 0) {
    g.fillStyle = "#fff";
    for (const s of STARS) { g.globalAlpha = sa * (.25 + .75 * tri((t + s.delay) / (2 * s.dur))); g.beginPath(); g.arc(s.x, s.y, s.r, 0, 7); g.fill(); }
    const u = (((t - 3) % 9) + 9) % 9 / 9;
    if (u < .09) {
      const m = u / .09, o = u < .02 ? u / .02 : 1 - (u - .02) / .07, dx = -120 * m, dy = 60 * m;
      g.globalAlpha = sa * o; g.strokeStyle = "#fff"; g.lineWidth = 1.2; g.lineCap = "round";
      g.beginPath(); g.moveTo(300 + dx, 20 + dy); g.lineTo(330 + dx, 6 + dy); g.stroke();
      g.beginPath(); g.arc(300 + dx, 20 + dy, 1.4, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  }

  // soleil : se couche derrière la montagne
  g.save(); g.translate(-60 * e, 170 * e);
  const pulse = 1 + .12 * tri(t / 5);
  g.save(); g.translate(300, 60); g.scale(pulse, pulse);
  g.fillStyle = radial(g, 0, 0, 62, [[0, "rgba(255,242,176,.95)"], [.4, "rgba(255,211,107,.35)"], [1, "rgba(255,211,107,0)"]]); g.fillRect(-62, -62, 124, 124); g.restore();
  g.save(); g.translate(300, 60); g.rotate(t * 2 * Math.PI / 40);
  g.strokeStyle = "rgba(255,243,184,.55)"; g.lineWidth = 1.4; g.lineCap = "round";
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r2 = i % 2 ? 29 : 37; g.beginPath(); g.moveTo(Math.cos(a) * 21, Math.sin(a) * 21); g.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); g.stroke(); }
  g.restore();
  g.fillStyle = radial(g, 300, 60, 15, [[0, "#fffbe6"], [.35, "#ffe27a"], [1, "#ff9d2e"]]); g.beginPath(); g.arc(300, 60, 15, 0, 7); g.fill();
  g.restore();

  // lune : se lève
  g.save(); g.translate(0, 170 * (1 - e));
  g.fillStyle = radial(g, 118, 52, 56, [[0, "rgba(207,220,255,.7)"], [.45, "rgba(143,168,255,.2)"], [1, "rgba(143,168,255,0)"]]); g.fillRect(62, -4, 112, 112);
  g.fillStyle = radial(g, 118, 52, 17, [[0, "#fff"], [.7, "#e3e9f7"], [1, "#b9c3de"]], 118 - 17 * .24, 52 - 17 * .3); g.beginPath(); g.arc(118, 52, 17, 0, 7); g.fill();
  g.fillStyle = "rgba(154,166,198,.55)";
  for (const [x, y, r] of [[112, 46, 3.6], [124, 58, 4.4], [121, 43, 2], [109, 58, 2.2], [127, 49, 1.4]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  g.restore();

  // nuages
  g.save(); g.filter = `blur(${2 * K}px)`; g.globalAlpha = .92 * (1 - .45 * e); g.fillStyle = col.cloud;
  for (const c of CLOUDS) {
    const x = -160 + 760 * ((((t + c.delay) / c.d) % 1 + 1) % 1);
    g.save(); g.translate(x, 0); g.globalAlpha *= c.a;
    for (const [cx, cy, rx, ry] of c.e) { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill(); }
    g.restore();
  }
  g.restore();

  // brume
  g.save(); g.filter = `blur(${6 * K}px)`; g.globalAlpha = .22; g.fillStyle = col.haze; g.beginPath(); g.ellipse(210, 124, 260, 14, 0, 0, 7); g.fill(); g.restore();

  drawScene(g, col);

  // lac
  gr = g.createLinearGradient(0, 132, 0, 210); gr.addColorStop(0, col.lakeTop); gr.addColorStop(1, col.lakeBot);
  g.fillStyle = gr; g.fillRect(0, 132, 420, 78);

  // reflet de la montagne : image miroir qui s'estompe, ondulée ligne par ligne
  oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalCompositeOperation = "source-over"; oc.clearRect(0, 0, PW, PH);
  oc.save(); oc.scale(K, K); oc.translate(0, 264); oc.scale(1, -1); drawScene(oc, col); oc.restore();
  oc.globalCompositeOperation = "destination-in";
  const mk = oc.createLinearGradient(0, 132 * K, 0, 210 * K); mk.addColorStop(0, "rgba(255,255,255,.9)"); mk.addColorStop(1, "rgba(255,255,255,0)");
  oc.fillStyle = mk; oc.fillRect(0, 132 * K, PW, 78 * K);
  g.save(); g.globalAlpha = .75;
  for (let y = Math.floor(132 * K); y < PH; y += 2) {
    const d = (y - 132 * K) / (78 * K), amp = (1.2 + 4.5 * d) * K / 1.9;
    const dx = Math.sin(y * .11 + t * 1.5) * amp + Math.sin(y * .27 - t * .9) * amp * .5;
    g.drawImage(off, 0, y, PW, 2, dx / K, y / K, PW / K, 2 / K);
  }
  g.restore();

  // reflet de l'astre + scintillements
  g.save(); g.beginPath(); g.rect(0, 132, 420, 78); g.clip();
  g.save(); g.filter = `blur(${2 * K}px)`; g.fillStyle = col.glint;
  for (const [cy, rx, ry, dl] of GLINTS) {
    const s = 0.5 - 0.5 * Math.cos(Math.PI * (t + dl) / 2.6), sx = .65 + .45 * s;
    g.globalAlpha = .55 + .4 * s;
    g.beginPath(); g.ellipse(300 - 180 * e, cy, rx * sx, ry, 0, 0, 7); g.fill();
  }
  g.restore();
  g.strokeStyle = col.shimmer; g.lineWidth = 1; g.lineCap = "round";
  for (const s of SHIMMER) {
    const v = tri((t + s.delay) / s.dur); g.globalAlpha = .5 * v; const w = s.w * (.6 + .4 * v);
    g.beginPath(); g.moveTo(s.x - w, s.y); g.lineTo(s.x + w, s.y); g.stroke();
  }
  g.restore(); g.globalAlpha = 1;

  // oiseaux (jour)
  if (e < 1) {
    g.save(); g.globalAlpha = 1 - e; g.strokeStyle = "#1b2b3a"; g.lineWidth = 1.3; g.lineCap = "round";
    for (const b of BIRDS) {
      const f = (((t + b.delay) / b.d) % 1 + 1) % 1, c = -4 + 6.5 * tri(t);
      g.save(); g.translate(-30 + 510 * f, b.y - 18 * f);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(3, c, 6, 0); g.quadraticCurveTo(9, c, 12, 0); g.stroke(); g.restore();
    }
    g.restore();
  }

  // lucioles (nuit)
  if (sa > 0) {
    g.save(); g.fillStyle = "#e8ff9a"; g.shadowColor = "#d7ff5a"; g.shadowBlur = 3 * K;
    for (const f of FLIES) {
      const m = .5 - .5 * Math.cos(Math.PI * (t + f.fdelay) / f.fdur);
      g.globalAlpha = sa * (.1 + .9 * tri((t + f.bdelay) / 2.4));
      g.beginPath(); g.arc(f.x + f.dx * m, f.y + f.dy * m, f.r, 0, 7); g.fill();
    }
    g.restore();
  }
  g.restore();                                                          // fin du paysage

  // verre : reflet en haut, ombre intérieure, liseré
  g.save(); pill(g, PX, PY, PW, PH); g.clip();
  const gl = g.createLinearGradient(PX + PW * .25, PY - PH * .1, PX + PW * .55, PY + PH * .9);
  gl.addColorStop(0, "rgba(255,255,255,.22)"); gl.addColorStop(.32, "rgba(255,255,255,0)");
  g.fillStyle = gl; g.fillRect(PX, PY, PW, PH);
  g.shadowColor = "rgba(0,0,0,.4)"; g.shadowBlur = 26; g.shadowOffsetY = 10; g.fillStyle = "#000";
  g.beginPath(); g.rect(PX - 80, PY - 80, PW + 160, PH + 160); g.roundRect(PX, PY, PW, PH, PH / 2); g.fill("evenodd");
  g.restore();
  g.save(); pill(g, PX + .5, PY + .5, PW - 1, PH - 1); g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 1.5; g.stroke(); g.restore();

  drawCursor(t);
}
