/* Idea garden — every click plants a seed that grows into a unique plant. Canvas 2D, no dependencies. */
(() => {
'use strict';

// ── real content (site.mjs, products array — names, kinds, one-liners, colours) ─────────────────────────────
const PRODUCTS = [
  { slug: 'vvdex-platform', name: 'VVDex Platform', kind: 'AI evaluation platform', status: 'Live', color: '#F2703A', one: 'Tests AI models and agents on real work. Hidden tests decide.' },
  { slug: 'conxto', name: 'Conxto', kind: 'AI job search', status: 'Live', color: '#D8CDBE', one: 'Reads live job postings against your résumé and prepares the whole application.' },
  { slug: 'vvdex-engine', name: 'VVDex Engine', kind: 'AI service engine', status: 'Live', color: '#45C987', one: 'Describe the work in one paragraph. It compiles a service that runs by your rules.' },
  { slug: 'unboundpdf', name: 'UnboundPDF', kind: 'Browser PDF suite', status: 'Live', color: '#EFEAE0', one: 'Every PDF tool in the browser. Your file never leaves the tab.' },
  { slug: 'farmquick', name: 'FarmQuick', kind: 'B2B commerce + lead agent', status: 'Live', color: '#86C977', one: 'The ordering site a produce business runs on, and the agent that finds its next buyer.' },
  { slug: 'conxfolio', name: 'Conxfolio', kind: 'Career suite', status: 'Live', color: '#EDE4D6', one: 'Résumé, ATS review, cover letter and portfolio website, sharing one résumé.' },
  { slug: 'pitchradar', name: 'PitchRadar', kind: 'Event intelligence · client', status: 'Private', color: '#F49A4B', one: 'Finds and ranks the events a mobile food vendor should trade at. Built for a client.' },
  { slug: 'vvdex-trading', name: 'VVDex Trading', kind: 'Market research', status: 'Research', color: '#63D2A3', one: 'Live market microstructure beside a hash-chained record of every dated call. Paper only.' },
];
// blossom colour per product tree (a warm cousin of the product colour that still reads against leaves)
// crown character per product tree: tall & narrow, round, wide & spreading
const CROWNS = [
  { h: 1.05, spread: 0.5, pull: 0.14 }, { h: 0.95, spread: 0.68, pull: 0.05 }, { h: 1.2, spread: 0.32, pull: 0.26 }, { h: 1.0, spread: 0.55, pull: 0.12 },
  { h: 1.12, spread: 0.36, pull: 0.22 }, { h: 0.92, spread: 0.72, pull: 0.04 }, { h: 1.0, spread: 0.46, pull: 0.16 }, { h: 1.15, spread: 0.6, pull: 0.1 },
];
const TREE_BLOOM = ['#F2703A', '#F3D9C4', '#FFE27A', '#FFFFFF', '#F7A8B8', '#FFF1DC', '#F49A4B', '#C9A7EE'];

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH = matchMedia('(hover: none)').matches;

// ── utilities ────────────────────────────────────────────────────────────────────────────────────────────
const TAU = Math.PI * 2, UP = -Math.PI / 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = p => 1 - (1 - p) * (1 - p) * (1 - p);
const easeBack = p => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hexRgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const HAZE = hexRgb('#E6ECE2');
function tone(hex, haze, light = 0, alpha = 1) { // mix toward haze (distance) and toward warm white / deep green (light)
  let [r, g, b] = hexRgb(hex);
  if (light > 0) { r = lerp(r, 255, light); g = lerp(g, 252, light); b = lerp(b, 235, light); }
  else if (light < 0) { r = lerp(r, 30, -light); g = lerp(g, 45, -light); b = lerp(b, 25, -light); }
  r = lerp(r, HAZE[0], haze); g = lerp(g, HAZE[1], haze); b = lerp(b, HAZE[2], haze);
  return alpha < 1 ? `rgba(${r | 0},${g | 0},${b | 0},${alpha})` : `rgb(${r | 0},${g | 0},${b | 0})`;
}

const FLOWERS = ['#F27A5E', '#F6A04D', '#F5C84C', '#F4A3B4', '#E0607E', '#B49AE0', '#7C98E6', '#FFF6E3', '#FFFFFF', '#D0508F', '#FF8C69', '#9FCBEA'];
const GREENS = ['#5F9447', '#77A852', '#8DBA5E', '#4C7F44', '#A3C46A', '#6E8B3D', '#86B25A'];
const BARK = ['#6B5444', '#7A5F4B', '#5E4A3C'];

// ── canvas + layout ──────────────────────────────────────────────────────────────────────────────────────
const cv = document.getElementById('garden');
const ctx = cv.getContext('2d');
const bg = document.createElement('canvas'), bgx = bg.getContext('2d');
let W = 0, H = 0, DPR = 1, U = 1, GY0 = 0, GY1 = 0, MOBILE = false;
const Q = Math.min(window.devicePixelRatio || 1, 2); // sprite resolution

function layout() {
  W = innerWidth; H = innerHeight; MOBILE = W < 700;
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  bg.width = cv.width; bg.height = cv.height;
  GY0 = H * (MOBILE ? 0.57 : 0.64);
  GY1 = H * 0.985;
  U = clamp(H / 900, 0.72, 1.25) * (MOBILE ? 0.88 : 1);
  paintBackground();
}
const baseY = d => lerp(GY0 + 4, GY1, d);
const depthScale = d => 0.62 + 0.55 * d;

function paintBackground() {
  const g = bgx; g.setTransform(DPR, 0, 0, DPR, 0, 0);
  const sky = g.createLinearGradient(0, 0, 0, GY0);
  sky.addColorStop(0, '#B9D7EA'); sky.addColorStop(0.38, '#E3EEEC'); sky.addColorStop(0.72, '#FBEBD5'); sky.addColorStop(1, '#F8D3B0');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const sx = W * (MOBILE ? 0.84 : 0.8), sy = H * (MOBILE ? 0.36 : 0.22);
  const sun = g.createRadialGradient(sx, sy, 0, sx, sy, Math.max(W, H) * 0.7);
  sun.addColorStop(0, 'rgba(255,252,236,1)'); sun.addColorStop(0.05, 'rgba(255,247,222,.95)');
  sun.addColorStop(0.2, 'rgba(255,236,200,.45)'); sun.addColorStop(0.55, 'rgba(255,228,190,.08)'); sun.addColorStop(1, 'rgba(255,228,190,0)');
  g.fillStyle = sun; g.fillRect(0, 0, W, H);
  const cr = mulberry(7);
  for (let i = 0; i < 6; i++) {
    const cx = cr() * W, cy = H * (0.08 + cr() * 0.3), w = W * (0.12 + cr() * 0.16);
    for (let k = 0; k < 7; k++) {
      const px = cx + (k - 3) * w * 0.14 + cr() * 12, py = cy + Math.sin(k) * 6, r = w * (0.08 + cr() * 0.07);
      const gr = g.createRadialGradient(px, py, 0, px, py, r * 1.6);
      gr.addColorStop(0, 'rgba(255,255,250,.42)'); gr.addColorStop(1, 'rgba(255,255,250,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(px, py, r * 1.6, 0, TAU); g.fill();
    }
  }
  const hill = (base, amp, f, ph, col) => {
    g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) {
      const y = base - amp * (0.55 * Math.sin(x * f + ph) + 0.3 * Math.sin(x * f * 2.3 + ph * 1.7) + 0.15 * Math.sin(x * f * 5.1 + ph));
      g.lineTo(x, y);
    }
    g.lineTo(W, H); g.closePath(); g.fillStyle = col; g.fill();
  };
  hill(GY0 - H * 0.07, H * 0.05, 0.0032, 1.2, '#CFDCD0');
  hill(GY0 - H * 0.025, H * 0.035, 0.0051, 4.1, '#BBD2AE');
  const mg = g.createLinearGradient(0, GY0 - 10, 0, H);
  mg.addColorStop(0, '#B4D196'); mg.addColorStop(0.35, '#97BF74'); mg.addColorStop(1, '#6A9852');
  g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W + 8; x += 8) g.lineTo(x, GY0 - 6 + 5 * Math.sin(x * 0.006 + 2) + 3 * Math.sin(x * 0.019));
  g.lineTo(W, H); g.closePath(); g.fillStyle = mg; g.fill();
  const mist = g.createLinearGradient(0, GY0 - H * 0.06, 0, GY0 + H * 0.08);
  mist.addColorStop(0, 'rgba(255,246,230,0)'); mist.addColorStop(0.5, 'rgba(255,246,230,.55)'); mist.addColorStop(1, 'rgba(255,246,230,0)');
  g.fillStyle = mist; g.fillRect(0, GY0 - H * 0.06, W, H * 0.14);
  const wash = g.createRadialGradient(sx, GY0, 0, sx, GY0, W * 0.6);
  wash.addColorStop(0, 'rgba(255,240,200,.35)'); wash.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = wash; g.fillRect(0, GY0 - 20, W, H);
  const tr = mulberry(11);
  g.lineCap = 'round';
  for (let i = 0; i < W * 0.9; i++) {
    const d = tr(), x = tr() * W, y = baseY(d) + 2, h = (3 + tr() * 7) * depthScale(d) * U;
    g.strokeStyle = tone(GREENS[(tr() * GREENS.length) | 0], (1 - d) * 0.45, tr() < 0.3 ? 0.25 : -0.1, 0.55);
    g.lineWidth = 1.1 * depthScale(d);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (tr() - 0.4) * h * 0.5, y - h); g.stroke();
  }
}

// ── plant model ──────────────────────────────────────────────────────────────────────────────────────────
// Every plant is built up front as timed primitives in local coords (base at 0,0, y up = negative).
class Build {
  constructor() { this.segs = []; this.leaves = []; this.blooms = []; this.blobs = []; this.x0 = -4; this.x1 = 4; this.y0 = -4; this.y1 = 4; this.end = 0; }
  ext(x, y, r, t) { if (x - r < this.x0) this.x0 = x - r; if (x + r > this.x1) this.x1 = x + r; if (y - r < this.y0) this.y0 = y - r; if (y + r > this.y1) this.y1 = y + r; if (t > this.end) this.end = t; }
  seg(x0, y0, x1, y1, w0, w1, t0, t1, col) { this.segs.push({ x0, y0, x1, y1, w: (w0 + w1) / 2, t0, t1, col }); this.ext(x1, y1, w0, t1); }
  leaf(x, y, a, len, wid, t0, dur, col) { this.leaves.push({ x, y, a, len, wid, t0, dur, col }); this.ext(x + Math.cos(a) * len, y + Math.sin(a) * len, wid * 1.6, t0 + dur); }
  blob(x, y, r, t0, dur, dark, lit) { this.blobs.push({ x, y, r, t0, dur, dark, lit }); this.ext(x, y, r * 1.15, t0 + dur); }
  bloom(o) { this.blooms.push(o); this.ext(o.x, o.y, o.r * 1.9, o.t0 + o.dur); }
}

function stem(b, rnd, h, n, w0, w1, t0, speed, col, a0, drift, onJoint) {
  let x = 0, y = 0, a = a0, t = t0;
  const len = h / n;
  for (let i = 0; i < n; i++) {
    a += (rnd() - 0.5) * drift; a = lerp(a, UP, 0.12);
    const nx = x + Math.cos(a) * len, ny = y + Math.sin(a) * len, dur = len / speed;
    b.seg(x, y, nx, ny, lerp(w0, w1, i / n), lerp(w0, w1, (i + 1) / n), t, t + dur, col);
    t += dur; x = nx; y = ny;
    if (onJoint) onJoint(i, x, y, a, t);
  }
  return { x, y, a, t };
}

const pick = (rnd, arr) => arr[(rnd() * arr.length) | 0];

const SPECIES = {
  tree(b, rnd, s, hz, o = {}) {
    const H0 = s * (o.height || (150 + rnd() * 70)), maxD = o.maxD || 5, speed = H0 * (o.speed || 0.55);
    const bark = tone(pick(rnd, BARK), hz), barkLit = tone('#8C6E55', hz);
    const g1 = pick(rnd, GREENS), g2 = pick(rnd, GREENS);
    const bloomCol = o.bloom || pick(rnd, FLOWERS), bloomChance = o.bloomChance ?? 0.55;
    const spread = o.spread || (0.42 + rnd() * 0.2), pull = o.pull ?? 0.14;
    const br = (x, y, a, len, w, d, t) => {
      const bend = (rnd() - 0.5) * 0.3;
      const xm = x + Math.cos(a) * len * 0.5, ym = y + Math.sin(a) * len * 0.5, a2 = a + bend;
      const x1 = xm + Math.cos(a2) * len * 0.5, y1 = ym + Math.sin(a2) * len * 0.5, dur = len / speed;
      b.seg(x, y, xm, ym, w, w * 0.86, t, t + dur / 2, d < 2 ? bark : barkLit);
      b.seg(xm, ym, x1, y1, w * 0.86, w * 0.72, t + dur / 2, t + dur, d < 2 ? bark : barkLit);
      const te = t + dur;
      if (d >= maxD - 2 && d < maxD) {
        for (let k = 0; k < 2; k++) { const side = k ? 1 : -1; b.leaf(xm, ym, a2 + side * (0.8 + rnd() * 0.5), s * (9 + rnd() * 6), s * (3.6 + rnd()), te - dur * 0.3, 0.45, tone(rnd() < 0.5 ? g1 : g2, hz, rnd() * 0.25)); }
      }
      if (d >= maxD) {
        const r = H0 * (0.075 + rnd() * 0.04);
        b.blob(x1, y1 - r * 0.2, r, te - 0.1, 0.6, tone(g1, hz, -0.18, 0.92), tone(g2, hz, 0.12, 0.92));
        const nl = 4 + (rnd() * 4 | 0);
        for (let k = 0; k < nl; k++) {
          const la = a2 + (rnd() - 0.5) * 2.6;
          b.leaf(x1 + Math.cos(la) * r * 0.5, y1 - r * 0.2 + Math.sin(la) * r * 0.5, la, s * (10 + rnd() * 8), s * (4 + rnd() * 1.5), te + rnd() * 0.25, 0.5, tone(rnd() < 0.5 ? g1 : g2, hz, Math.cos(la) > 0 ? 0.28 : -0.05));
        }
        if (rnd() < bloomChance) {
          const nb = 1 + (rnd() * 3 | 0);
          for (let k = 0; k < nb; k++) {
            const ba = rnd() * TAU, bd = r * (0.2 + rnd() * 0.75);
            b.bloom({ type: 'star', x: x1 + Math.cos(ba) * bd, y: y1 - r * 0.25 + Math.sin(ba) * bd * 0.8, r: s * (4.2 + rnd() * 2.2), rot: rnd() * TAU, n: 5, col: tone(bloomCol, hz), col2: tone('#F6C44A', hz), t0: te + 0.25 + rnd() * 0.5, dur: 0.75 });
          }
        }
        return;
      }
      const n = d === 0 ? 2 : (rnd() < 0.32 ? 3 : 2);
      for (let k = 0; k < n; k++) {
        let ca = a2 + (k - (n - 1) / 2) * spread * (0.75 + rnd() * 0.5) * (d === 0 ? 1.15 : 1) + (rnd() - 0.5) * 0.18;
        ca = lerp(ca, UP, pull);
        br(x1, y1, ca, len * (0.7 + rnd() * 0.14), w * 0.68, d + 1, te + rnd() * 0.06);
      }
    };
    const tl = H0 * 0.3, tw = H0 * (o.trunk || 0.05);
    br(0, 0, UP + (rnd() - 0.5) * 0.12, tl, tw, 0, o.t0 || 0);
  },

  sapling(b, rnd, s, hz) { SPECIES.tree(b, rnd, s, hz, { height: 105 + rnd() * 70, maxD: 5, speed: 0.75, bloomChance: 0.7 }); },
  shrub(b, rnd, s, hz) { SPECIES.tree(b, rnd, s, hz, { height: 60 + rnd() * 35, maxD: 4, speed: 0.9, spread: 0.75, bloomChance: 0.85, trunk: 0.06 }); },

  wildflower(b, rnd, s, hz) {
    const h = s * (55 + rnd() * 75), g = tone(pick(rnd, GREENS), hz), col = pick(rnd, FLOWERS);
    const heads = [];
    const tip = stem(b, rnd, h, 6, s * 2.2, s * 1.1, 0, h / 1.0, g, UP + (rnd() - 0.5) * 0.5, 0.3, (i, x, y, a, t) => {
      if (i < 3 && rnd() < 0.7) { const side = i % 2 ? 1 : -1; b.leaf(x, y, a + side * (0.9 + rnd() * 0.4), s * (10 + rnd() * 8), s * (3 + rnd() * 1.5), t, 0.45, tone(pick(rnd, GREENS), hz, 0.1)); }
      if (i === 3 && rnd() < 0.45) heads.push({ x, y, a, t });
    });
    const disc = (x, y, t, r) => b.bloom({ type: 'disc', x, y, r, rot: rnd() * TAU, n: 5 + (rnd() * 8 | 0), col: tone(col, hz), col2: tone(rnd() < 0.5 ? '#F6C44A' : '#8A5A2B', hz), sq: 0.62 + rnd() * 0.3, t0: t, dur: 0.9 });
    disc(tip.x, tip.y, tip.t, s * (7 + rnd() * 6));
    for (const hd of heads) {
      const side = rnd() < 0.5 ? -1 : 1; let x = hd.x, y = hd.y, a = hd.a + side * 0.6, t = hd.t;
      for (let k = 0; k < 3; k++) { a = lerp(a, UP, 0.25); const nx = x + Math.cos(a) * h * 0.11, ny = y + Math.sin(a) * h * 0.11; b.seg(x, y, nx, ny, s * 1.2, s * 0.9, t, t + 0.12, g); x = nx; y = ny; t += 0.12; }
      disc(x, y, t, s * (5 + rnd() * 3));
    }
  },

  sunflower(b, rnd, s, hz) {
    const h = s * (110 + rnd() * 60), g = tone('#5E8F3F', hz);
    const tip = stem(b, rnd, h, 7, s * 3.4, s * 2.2, 0, h / 1.3, g, UP + (rnd() - 0.5) * 0.2, 0.18, (i, x, y, a, t) => {
      if (i > 0 && i < 6) { const side = i % 2 ? 1 : -1; b.leaf(x, y, a + side * (1.0 + rnd() * 0.3), s * (16 + rnd() * 8), s * (7 + rnd() * 2), t, 0.5, tone('#6FA34C', hz, side > 0 ? 0.15 : -0.05)); }
    });
    b.bloom({ type: 'disc', x: tip.x, y: tip.y, r: s * (15 + rnd() * 6), rot: rnd() * TAU, n: 18 + (rnd() * 6 | 0), col: tone(rnd() < 0.8 ? '#F7C531' : '#F49A3C', hz), col2: tone('#6B4424', hz), sq: 0.9, center: 0.42, t0: tip.t, dur: 1.0 });
  },

  bells(b, rnd, s, hz) {
    const h = s * (85 + rnd() * 65), g = tone(pick(rnd, GREENS), hz), col = pick(rnd, ['#B49AE0', '#E0607E', '#7C98E6', '#F4A3B4', '#D0508F', '#FFF6E3']);
    const n = 9;
    stem(b, rnd, h, n, s * 2, s * 0.9, 0, h / 1.2, g, UP + (rnd() - 0.5) * 0.35, 0.22, (i, x, y, a, t) => {
      if (i < 2) { b.leaf(x, y, a + (i ? 1 : -1) * 1.1, s * 14, s * 4, t, 0.45, tone(pick(rnd, GREENS), hz, 0.08)); }
      if (i >= 3) {
        const k = (i - 3) / (n - 3), r = s * (6.5 - k * 4);
        for (const side of [-1, 1]) b.bloom({ type: 'bell', x: x + side * s * 2.5, y, r, side, col: tone(col, hz, side > 0 ? 0.15 : 0), col2: tone(col, hz, -0.25), t0: t + 0.05, dur: 0.6 });
      }
    });
  },

  umbel(b, rnd, s, hz) {
    const h = s * (70 + rnd() * 60), g = tone(pick(rnd, GREENS), hz), ball = rnd() < 0.45;
    const col = ball ? pick(rnd, ['#B49AE0', '#D0508F', '#9C7FE0']) : pick(rnd, ['#FFFFFF', '#FFF6E3', '#FBE7C6']);
    const tip = stem(b, rnd, h, 5, s * 1.8, s * 1.1, 0, h / 1.0, g, UP + (rnd() - 0.5) * 0.4, 0.25, (i, x, y, a, t) => {
      if (i === 0) for (const side of [-1, 1]) b.leaf(x, y, a + side * 0.5, s * 20, s * 3, t, 0.5, tone(pick(rnd, GREENS), hz, 0.05));
    });
    const rays = ball ? 22 : 15, R = s * (ball ? 9 : 13);
    for (let k = 0; k < rays; k++) {
      const a = ball ? (k / rays) * TAU + rnd() * 0.2 : UP + (k / (rays - 1) - 0.5) * 2.3, l = R * (ball ? 1 : 0.8 + rnd() * 0.3);
      const ex = tip.x + Math.cos(a) * l, ey = tip.y + Math.sin(a) * l * (ball ? 1 : 0.7);
      b.seg(tip.x, tip.y, ex, ey, s * 0.7, s * 0.5, tip.t, tip.t + 0.25, ball ? tone(col, hz, -0.2) : g);
      b.bloom({ type: 'dots', x: ex, y: ey, r: s * (ball ? 2.4 : 3), n: ball ? 3 : 5, col: tone(col, hz, rnd() * 0.15), col2: tone(col, hz, -0.15), t0: tip.t + 0.22 + rnd() * 0.2, dur: 0.5 });
    }
  },

  tulip(b, rnd, s, hz) {
    const h = s * (50 + rnd() * 40), g = tone('#6A9E4B', hz), col = pick(rnd, ['#E8504A', '#F27A5E', '#F4A3B4', '#F5C84C', '#E0607E', '#FF8C69', '#FFF6E3']);
    for (const side of [-1, 1]) b.leaf(0, 0, UP + side * (0.3 + rnd() * 0.25), h * (0.45 + rnd() * 0.2), s * 5, 0.05, 0.6, tone('#76AA55', hz, side > 0 ? 0.12 : -0.05));
    const tip = stem(b, rnd, h, 4, s * 2.4, s * 1.8, 0, h / 0.9, g, UP + (rnd() - 0.5) * 0.25, 0.12);
    b.bloom({ type: 'cup', x: tip.x, y: tip.y, a: tip.a, r: s * (8 + rnd() * 3), col: tone(col, hz), col2: tone(col, hz, -0.22), t0: tip.t, dur: 0.85 });
  },

  grass(b, rnd, s, hz) {
    const n = 6 + (rnd() * 6 | 0), base = pick(rnd, ['#86B25A', '#A3C46A', '#77A852', '#B6C46A']);
    for (let k = 0; k < n; k++) {
      let x = (rnd() - 0.5) * s * 10, y = 0, a = UP + (rnd() - 0.5) * 0.9, t = rnd() * 0.25;
      const len = s * (28 + rnd() * 50), bend = (a < UP ? -1 : 1) * (0.06 + rnd() * 0.12), col = tone(base, hz, rnd() * 0.3 - 0.1);
      for (let i = 0; i < 4; i++) { a += bend; const nx = x + Math.cos(a) * len / 4, ny = y + Math.sin(a) * len / 4; b.seg(x, y, nx, ny, s * (2.6 - i * 0.55), s * (2.05 - i * 0.5), t, t + 0.12, col); x = nx; y = ny; t += 0.12; }
      if (rnd() < 0.25) for (let i = 0; i < 4; i++) b.bloom({ type: 'dots', x: x + Math.cos(a) * i * s * 2.5, y: y + Math.sin(a) * i * s * 2.5, r: s * 1.8, n: 1, col: tone('#E8D9A0', hz), col2: tone('#C9B57A', hz), t0: t + i * 0.05, dur: 0.4 });
    }
  },
};
const MEADOW = [['wildflower', 26], ['tulip', 12], ['bells', 12], ['umbel', 12], ['grass', 12], ['sunflower', 7], ['shrub', 9], ['sapling', 10]];
const MEADOW_TOTAL = MEADOW.reduce((a, m) => a + m[1], 0);
function randomKind(r0 = Math.random) { let r = r0() * MEADOW_TOTAL; for (const [k, w] of MEADOW) { if ((r -= w) <= 0) return k; } return 'wildflower'; }

// ── plants ───────────────────────────────────────────────────────────────────────────────────────────────
const plants = [];
class Plant {
  constructor(kind, xf, depth, seed, born, opts = {}) {
    this.kind = kind; this.xf = xf; this.depth = depth; this.seed = seed; this.born = born; this.opts = opts;
    this.product = opts.product ?? -1; this.alpha = 1; this.dying = false; this.age = -1;
    this.bend = 0; this.bendV = 0; this.phase = Math.random() * TAU;
    this.flex = { tree: 0.45, sapling: 0.7, shrub: 0.6, sunflower: 0.9, grass: 1.6, umbel: 1.2, bells: 1.15, tulip: 1.1, wildflower: 1.35 }[kind] || 1;
    this.build();
  }
  build() {
    const rnd = mulberry(this.seed), b = new Build(), hz = (1 - this.depth) * 0.42, s = depthScale(this.depth) * U * (this.opts.scale || 1);
    SPECIES[this.kind](b, rnd, s, hz, this.opts.tree);
    this.b = b; this.total = b.end + 0.1; this.sprite = null;
    this.hasBlooms = b.blooms.some(o => o.type !== 'dots');
  }
  get x() { return this.xf * W; }
  get y() { return baseY(this.depth); }
  bake() {
    const b = this.b, w = Math.ceil((b.x1 - b.x0) * Q) + 2, h = Math.ceil((b.y1 - b.y0) * Q) + 2;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.setTransform(Q, 0, 0, Q, -b.x0 * Q + 1, -b.y0 * Q + 1);
    drawPlant(g, this, 1e9); this.sprite = c;
  }
}

function petal(g, cx, cy, a, len, wid, sq) {
  const ca = Math.cos(a), sa = Math.sin(a);
  const px = (u, v) => cx + u * ca - v * sa, py = (u, v) => cy + (u * sa + v * ca) * sq;
  g.moveTo(px(0, 0), py(0, 0));
  g.quadraticCurveTo(px(len * 0.5, wid * 1.25), py(len * 0.5, wid * 1.25), px(len, 0), py(len, 0));
  g.quadraticCurveTo(px(len * 0.5, -wid * 1.25), py(len * 0.5, -wid * 1.25), px(0, 0), py(0, 0));
}

function drawPlant(g, P, t) {
  const b = P.b;
  g.lineCap = 'round';
  for (const s of b.segs) {
    if (t <= s.t0) continue;
    const p = t >= s.t1 ? 1 : easeOut((t - s.t0) / (s.t1 - s.t0));
    g.strokeStyle = s.col; g.lineWidth = s.w;
    g.beginPath(); g.moveTo(s.x0, s.y0); g.lineTo(lerp(s.x0, s.x1, p), lerp(s.y0, s.y1, p)); g.stroke();
  }
  for (const o of b.blobs) {
    if (t <= o.t0) continue;
    const r = o.r * (t >= o.t0 + o.dur ? 1 : Math.max(0, easeBack((t - o.t0) / o.dur)));
    g.fillStyle = o.dark; g.beginPath(); g.arc(o.x - r * 0.12, o.y + r * 0.14, r, 0, TAU); g.fill();
    g.fillStyle = o.lit; g.beginPath(); g.arc(o.x + r * 0.16, o.y - r * 0.16, r * 0.74, 0, TAU); g.fill();
  }
  for (const l of b.leaves) {
    if (t <= l.t0) continue;
    const k = t >= l.t0 + l.dur ? 1 : easeBack((t - l.t0) / l.dur);
    g.fillStyle = l.col; g.beginPath(); petal(g, l.x, l.y, l.a, l.len * k, l.wid * k * 0.55, 1); g.fill();
  }
  for (const o of b.blooms) {
    if (t <= o.t0) continue;
    drawBloom(g, o, t >= o.t0 + o.dur ? 1 : (t - o.t0) / o.dur);
  }
}

function drawBloom(g, o, p) {
  const bud = Math.min(1, p / 0.3), open = p < 0.25 ? 0 : easeBack((p - 0.25) / 0.75);
  switch (o.type) {
    case 'disc': {
      if (open <= 0) { g.fillStyle = o.col2; g.beginPath(); g.arc(o.x, o.y, o.r * 0.3 * bud, 0, TAU); g.fill(); return; }
      g.fillStyle = o.col; g.beginPath();
      for (let i = 0; i < o.n; i++) petal(g, o.x, o.y, o.rot + i * TAU / o.n + (1 - open) * 0.6, o.r * open, o.r * (o.n > 12 ? 0.16 : 0.3) * open, o.sq);
      g.fill();
      const c = o.center || 0.3;
      g.fillStyle = o.col2; g.beginPath(); g.ellipse(o.x, o.y, o.r * c, o.r * c * o.sq, 0, 0, TAU); g.fill();
      break;
    }
    case 'star': {
      if (open <= 0) { g.fillStyle = o.col; g.beginPath(); g.arc(o.x, o.y, o.r * 0.35 * bud, 0, TAU); g.fill(); return; }
      g.fillStyle = o.col; g.beginPath();
      for (let i = 0; i < o.n; i++) petal(g, o.x, o.y, o.rot + i * TAU / o.n, o.r * open, o.r * 0.5 * open, 1);
      g.fill();
      g.fillStyle = o.col2; g.beginPath(); g.arc(o.x, o.y, o.r * 0.22, 0, TAU); g.fill();
      break;
    }
    case 'bell': {
      const k = Math.max(bud * 0.45, open), a = Math.PI / 2 - o.side * 0.7;
      g.fillStyle = o.col2; g.beginPath(); petal(g, o.x, o.y, a + o.side * 0.25, o.r * 1.4 * k, o.r * 0.42 * k, 1); g.fill();
      g.fillStyle = o.col; g.beginPath(); petal(g, o.x, o.y, a, o.r * 1.5 * k, o.r * 0.5 * k, 1); g.fill();
      break;
    }
    case 'cup': {
      const k = Math.max(bud * 0.6, open), sp = 0.15 + 0.35 * Math.min(open, 1.1);
      g.fillStyle = o.col2; g.beginPath();
      petal(g, o.x, o.y, o.a - sp, o.r * 1.6 * k, o.r * 0.5 * k, 1); petal(g, o.x, o.y, o.a + sp, o.r * 1.6 * k, o.r * 0.5 * k, 1); g.fill();
      g.fillStyle = o.col; g.beginPath(); petal(g, o.x, o.y, o.a, o.r * 1.75 * k, o.r * 0.55 * k, 1); g.fill();
      break;
    }
    case 'dots': {
      const k = Math.max(0.01, Math.max(bud, open));
      g.fillStyle = o.col; g.beginPath();
      for (let i = 0; i < o.n; i++) { const a = i * 2.4, d = o.n > 1 ? o.r * 0.9 : 0, cx = o.x + Math.cos(a) * d, cy = o.y + Math.sin(a) * d; g.moveTo(cx + o.r * k, cy); g.arc(cx, cy, o.r * k, 0, TAU); }
      g.fill();
      break;
    }
  }
}

// ── product trees ────────────────────────────────────────────────────────────────────────────────────────
const tagsEl = document.getElementById('tags');
const productTrees = [];
let tagPointer = '', cardAtTap = -1;
function productSlots() {
  const n = PRODUCTS.length, m0 = MOBILE ? 0.09 : 0.06, m1 = MOBILE ? 0.91 : 0.95;
  return PRODUCTS.map((p, i) => {
    const back = i % 2 === 0;
    // on a phone the tags need four distinct heights so neighbours never collide
    const depth = MOBILE ? [0.05, 0.47, 0.25, 0.7][i % 4] : back ? 0.1 + (i % 4 === 0 ? 0.04 : 0) : 0.5 + (i % 4 === 1 ? 0.06 : 0);
    return { xf: lerp(m0, m1, i / (n - 1)), depth };
  });
}
function plantProducts(born) {
  for (const t of productTrees) { const i = plants.indexOf(t); if (i >= 0) plants.splice(i, 1); }
  productTrees.length = 0;
  const slots = productSlots();
  const hScale = MOBILE ? clamp(H / 760, 0.72, 1.0) : clamp((GY0 - H * 0.16) / 360, 0.8, 1.35);
  PRODUCTS.forEach((p, i) => {
    const sl = slots[i], st = CROWNS[i];
    const tree = new Plant('tree', sl.xf, sl.depth, 1009 + i * 7919, born + i * 0.14, {
      product: i,
      tree: { height: (210 + (i * 37 % 50)) * hScale * st.h, maxD: MOBILE ? 5 : 6, speed: 0.75, bloom: TREE_BLOOM[i], bloomChance: 0.75, spread: st.spread, pull: st.pull, trunk: 0.055 },
    });
    tree.flex = 0.32;
    productTrees.push(tree); insertPlant(tree);
  });
  buildTags();
}
function buildTags() {
  tagsEl.replaceChildren();
  productTrees.forEach((t, i) => {
    const p = PRODUCTS[i];
    const a = document.createElement('a');
    a.className = 'tag'; a.href = `https://vamsi-venkatesh.github.io/portfolio-designs/inside-the-dot/work/${p.slug}/`;
    const stake = document.createElement('i'), label = document.createElement('span'), dot = document.createElement('b');
    dot.style.background = p.color; label.append(dot, document.createTextNode(p.name)); a.append(stake, label);
    a.setAttribute('aria-label', `${p.name}: ${p.one}`);
    a.addEventListener('mouseenter', () => showCard(i, true));
    a.addEventListener('mouseleave', () => hideCardSoon());
    a.addEventListener('focus', () => showCard(i, true));
    a.addEventListener('blur', () => hideCardSoon());
    // touch: the first tap opens the card (which carries the link); a second tap follows the tag's link
    a.addEventListener('pointerdown', e => { tagPointer = e.pointerType; cardAtTap = cardFor; e.stopPropagation(); });
    a.addEventListener('click', e => { if ((TOUCH || tagPointer === 'touch' || tagPointer === 'pen') && cardAtTap !== i) { e.preventDefault(); cardAtTap = i; showCard(i, true); } });
    if (REDUCED) a.classList.add('on');
    tagsEl.appendChild(a); t.tag = a;
  });
  placeTags();
}
function placeTags() {
  productTrees.forEach(t => {
    if (!t.tag) return;
    const w = t.tag.offsetWidth || 100, x = clamp(t.x, w / 2 + 6, W - w / 2 - 6);
    t.tag.style.transform = `translate(${x}px, ${t.y - (MOBILE ? 4 : 8)}px) translate(-50%,0)`;
    t.tag.firstChild.style.transform = `translateX(${t.x - x}px)`;
  });
}

const card = document.getElementById('card');
let cardFor = -1, hideT = 0;
function showCard(i, fromTag) {
  clearTimeout(hideT);
  const p = PRODUCTS[i], t = productTrees[i];
  if (cardFor !== i) {
    card.querySelector('.kind b').style.background = p.color;
    card.querySelector('.kind span').textContent = `${p.kind} · ${p.status}`;
    card.querySelector('h2').textContent = p.name;
    card.querySelector('p').textContent = p.one;
    const a = card.querySelector('a'); a.href = `https://vamsi-venkatesh.github.io/portfolio-designs/inside-the-dot/work/${p.slug}/`; a.setAttribute('aria-label', `Open ${p.name}`);
  }
  cardFor = i;
  productTrees.forEach((pt, k) => pt.tag && pt.tag.classList.toggle('active', k === i));
  const cw = card.offsetWidth || 290, ch = card.offsetHeight || 150;
  let x = t.x - cw / 2, y = t.y + t.b.y0 * 0.55 - ch / 2;
  if (MOBILE || fromTag) y = t.y - ch - 18;
  x = clamp(x, 12, W - cw - 12); y = clamp(y, 12, H - ch - 12);
  card.style.left = x + 'px'; card.style.top = y + 'px';
  card.classList.add('show');
}
function hideCardSoon(ms = 350) { clearTimeout(hideT); hideT = setTimeout(hideCard, ms); }
function hideCard() { card.classList.remove('show'); cardFor = -1; productTrees.forEach(pt => pt.tag && pt.tag.classList.remove('active')); }
card.addEventListener('mouseenter', () => clearTimeout(hideT));
card.addEventListener('mouseleave', () => hideCardSoon());
card.addEventListener('pointerdown', e => e.stopPropagation());

function treeAt(px, py) {
  for (let i = productTrees.length - 1; i >= 0; i--) {
    const t = productTrees[i], b = t.b;
    if (t.age < t.total * 0.5) continue;
    const cx = t.x + (b.x0 + b.x1) / 2, cy = t.y + b.y0 + (b.y1 - b.y0) * 0.36, rx = (b.x1 - b.x0) * 0.42, ry = (b.y1 - b.y0) * 0.36;
    const dx = (px - cx) / rx, dy = (py - cy) / ry;
    if (dx * dx + dy * dy < 1) return i;
  }
  return -1;
}

// ── world ────────────────────────────────────────────────────────────────────────────────────────────────
function insertPlant(p) { let i = plants.length; while (i > 0 && plants[i - 1].depth > p.depth) i--; plants.splice(i, 0, p); }
const seeds = [], petals = [], rings = [], motes = [];
const GN = 96, gust = new Float32Array(GN), gust2 = new Float32Array(GN);
let now = 0;

function sow(px, py, fromSky) {
  const depth = py >= GY0 ? clamp((py - GY0) / (GY1 - GY0), 0, 1) : 0.15 + Math.random() * 0.85;
  if (REDUCED) { const p = addPlant(randomKind(), px / W, depth, -100); p.age = 999; p.bake(); draw(); return; }
  seeds.push({ sx: px, sy: py, tx: px + (fromSky ? (Math.random() - 0.5) * 40 : 0), ty: baseY(depth), depth, t0: now, dur: fromSky ? 1.6 + Math.random() : clamp(0.18 + Math.abs(baseY(depth) - py) / 1400, 0.18, 0.6), sky: !!fromSky, spin: Math.random() * TAU });
}
function addPlant(kind, xf, depth, born) {
  const p = new Plant(kind, xf, depth, (Math.random() * 1e9) | 0, born);
  insertPlant(p);
  const meadow = plants.filter(q => q.product < 0 && !q.dying);
  if (meadow.length > 220) { meadow.sort((a, b) => a.born - b.born); meadow[0].dying = true; }
  updateCount();
  return p;
}
const countEl = document.getElementById('count');
function updateCount() { countEl.textContent = `${plants.filter(q => q.product < 0 && !q.dying).length} growing`; }

// ── input ────────────────────────────────────────────────────────────────────────────────────────────────
const ptr = { x: -9999, y: -9999, down: false, lx: 0, ly: 0, active: false, lt: 0 };
cv.addEventListener('pointerdown', e => {
  if (cardFor >= 0 && TOUCH) hideCard();
  ptr.down = true; ptr.lx = e.clientX; ptr.ly = e.clientY;
  sow(e.clientX, e.clientY);
  try { cv.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
});
addEventListener('pointermove', e => {
  const t = performance.now();
  const dx = e.clientX - ptr.x, dtm = Math.max(8, t - ptr.lt);
  if (ptr.active) { const v = clamp(dx / dtm, -4, 4); const c = clamp((e.clientX / W * GN) | 0, 0, GN - 1); for (let k = -3; k <= 3; k++) { const j = c + k; if (j >= 0 && j < GN) gust[j] += v * 0.018 * (1 - Math.abs(k) / 4); } }
  ptr.x = e.clientX; ptr.y = e.clientY; ptr.lt = t; ptr.active = true;
  if (ptr.down) {
    if (Math.hypot(e.clientX - ptr.lx, e.clientY - ptr.ly) > 30 * U) { ptr.lx = e.clientX; ptr.ly = e.clientY; sow(e.clientX, e.clientY); }
  } else if (e.pointerType === 'mouse' && !(e.target.closest && e.target.closest('.tag,.card'))) {
    const i = treeAt(e.clientX, e.clientY);
    cv.classList.toggle('over-tree', i >= 0);
    if (i >= 0) showCard(i, false);
    else if (cardFor >= 0 && !card.matches(':hover') && !(document.activeElement && document.activeElement.classList.contains('tag'))) hideCardSoon(250);
  }
});
addEventListener('pointerup', () => { ptr.down = false; });
addEventListener('pointercancel', () => { ptr.down = false; });
document.addEventListener('mouseleave', () => { ptr.active = false; ptr.x = -9999; });
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1 || e.key === ' ') return;
  sow(W * (0.05 + Math.random() * 0.9), GY0 - Math.random() * H * 0.4, true);
});
let rT = 0;
addEventListener('resize', () => {
  clearTimeout(rT); rT = setTimeout(() => {
    const was = MOBILE, oldU = U;
    layout();
    if (was !== MOBILE || Math.abs(oldU - U) > 0.08) {
      plantProducts(now - 99);
      for (const p of plants) { if (p.product < 0) p.build(); }
      if (REDUCED) for (const p of plants) { p.age = 999; p.bake(); }
    }
    placeTags(); if (REDUCED) draw();
  }, 120);
});

// ── simulation + draw ────────────────────────────────────────────────────────────────────────────────────
function windAt(x, t) { return 0.022 + 0.026 * Math.sin(t * 0.7 + x * 0.0035) + 0.012 * Math.sin(t * 1.9 + x * 0.011); }

function step(dt) {
  for (let i = 0; i < GN; i++) gust2[i] = gust[i] * 0.5 + (i > 0 ? gust[i - 1] : 0) * 0.32 + (i < GN - 1 ? gust[i + 1] : 0) * 0.18;
  const decay = Math.pow(0.35, dt);
  for (let i = 0; i < GN; i++) gust[i] = clamp(gust2[i] * decay, -0.6, 0.6);

  for (let i = seeds.length - 1; i >= 0; i--) {
    const s = seeds[i];
    if (now - s.t0 >= s.dur) {
      seeds.splice(i, 1);
      addPlant(randomKind(), s.tx / W, s.depth, now);
      rings.push({ x: s.tx, y: s.ty, t0: now, s: depthScale(s.depth) });
    }
  }
  for (let i = rings.length - 1; i >= 0; i--) if (now - rings[i].t0 > 0.7) rings.splice(i, 1);

  for (let i = plants.length - 1; i >= 0; i--) {
    const p = plants[i];
    p.age = now - p.born;
    const px = p.x, col = clamp((px / W * GN) | 0, 0, GN - 1);
    let target = -(windAt(px, now + p.phase * 0.15) + gust[col] * 1.6) * p.flex;
    if (ptr.active) {
      const b = p.b, dx = px - ptr.x, py = p.y, top = py + b.y0, dy = ptr.y < top ? top - ptr.y : ptr.y > py ? ptr.y - py : 0;
      const rx = (b.x1 - b.x0) * 0.6 + 40;
      if (Math.abs(dx) < rx && dy < 60) target -= Math.sign(dx) * (1 - Math.abs(dx) / rx) * (1 - dy / 60) * 0.12 * p.flex;
    }
    p.bendV += (target - p.bend) * 26 * dt; p.bendV *= Math.pow(0.04, dt); p.bend += p.bendV * dt;
    if (p.dying) { p.alpha -= dt * 0.8; if (p.alpha <= 0) { plants.splice(i, 1); continue; } }
    if (!p.sprite && p.age > p.total + 0.05) p.bake();
    if (p.sprite && p.hasBlooms && Math.random() < dt * (p.product >= 0 ? 0.5 : 0.05) && petals.length < 160) {
      const o = p.b.blooms[(Math.random() * p.b.blooms.length) | 0];
      if (o.type === 'star' || o.type === 'disc' || o.type === 'cup') petals.push({ x: px + o.x - p.bend * o.y, y: p.y + o.y, vx: 10, vy: -6, r: o.r * 0.45, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 6, col: o.col, life: 0, floor: p.y + 6 + Math.random() * (GY1 - p.y) * 0.4 });
    }
  }
  for (let i = petals.length - 1; i >= 0; i--) {
    const q = petals[i]; q.life += dt;
    const col = clamp((q.x / W * GN) | 0, 0, GN - 1);
    const wx = windAt(q.x, now) * 900 + gust[col] * 1400;
    q.vx += (wx - q.vx) * dt * 1.2; q.vy += (14 - q.vy) * dt * 0.8;
    q.x += (q.vx + Math.sin(now * 3 + q.rot) * 12) * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
    if (q.y > q.floor) { q.y = q.floor; q.vx *= 0.9; q.vr = 0; q.vy = 0; }
    if (q.life > 9 || q.x > W + 30 || q.x < -30) petals.splice(i, 1);
  }
  for (const m of motes) { m.x += (m.vx + windAt(m.x, now) * 300) * dt; m.y += (Math.sin(now * 0.6 + m.p) * 4 - 2) * dt; if (m.x > W + 10) m.x = -10; if (m.y < H * 0.05) m.y = GY0; }
}

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(bg, 0, 0);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  if (!REDUCED) {
    ctx.fillStyle = 'rgba(255,250,225,.75)';
    for (const m of motes) { ctx.globalAlpha = 0.35 + 0.35 * Math.sin(now * 1.3 + m.p); ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }

  for (const p of plants) {
    if (p.age <= 0) continue;
    const x = p.x, y = p.y;
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = 'rgba(40,70,25,.16)';
    const sw = Math.min(60, (p.b.x1 - p.b.x0) * 0.22) * Math.min(1, p.age / 1.2);
    ctx.beginPath(); ctx.ellipse(x - sw * 0.25, y + 1, sw, sw * 0.18, 0, 0, TAU); ctx.fill();
    ctx.setTransform(DPR, 0, -p.bend * DPR, DPR, x * DPR, y * DPR); // skew about the base: x' = x - bend*y
    if (p.sprite) ctx.drawImage(p.sprite, p.b.x0 - 1 / Q, p.b.y0 - 1 / Q, p.sprite.width / Q, p.sprite.height / Q);
    else drawPlant(ctx, p, p.age);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  ctx.globalAlpha = 1;

  for (const r of rings) {
    const k = (now - r.t0) / 0.7, rad = 6 + 26 * easeOut(k) * r.s;
    ctx.strokeStyle = `rgba(255,252,235,${0.8 * (1 - k)})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(r.x, r.y, rad, rad * 0.28, 0, 0, TAU); ctx.stroke();
  }
  for (const s of seeds) {
    const k = clamp((now - s.t0) / s.dur, 0, 1);
    let x, y;
    if (s.sky) { x = lerp(s.sx, s.tx, k) + Math.sin(k * 9 + s.spin) * 14 * (1 - k); y = lerp(s.sy, s.ty, k); }
    else { x = lerp(s.sx, s.tx, k); y = lerp(s.sy, s.ty, k * k) - Math.sin(k * Math.PI) * 10; }
    ctx.fillStyle = 'rgba(255,248,220,.5)'; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = '#7A5A3A'; ctx.beginPath(); ctx.ellipse(x, y, 2.6, 3.8, s.spin + k * 6, 0, TAU); ctx.fill();
    if (s.sky) { ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = UP + (i - 2.5) * 0.35; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); } ctx.stroke(); }
  }
  for (const q of petals) {
    ctx.globalAlpha = q.life > 7 ? Math.max(0, (9 - q.life) / 2) : 1;
    ctx.fillStyle = q.col; ctx.beginPath(); ctx.ellipse(q.x, q.y, q.r, q.r * 0.55 * Math.abs(Math.cos(q.rot)) + 0.6, q.rot * 0.5, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.lineCap = 'round';
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = pass ? 'rgba(96,140,64,.9)' : 'rgba(70,112,50,.85)'; ctx.lineWidth = pass ? 1.6 : 2.2;
    ctx.beginPath();
    for (let x = pass * 3; x < W + 6; x += 7) {
      const h = (12 + 14 * Math.abs(Math.sin(x * 0.37 + pass))) * U;
      const col = clamp((x / W * GN) | 0, 0, GN - 1);
      const lean = (windAt(x, now) + gust[col] * 1.6) * h * 1.6 * (REDUCED ? 0.5 : 1);
      ctx.moveTo(x, H + 2); ctx.quadraticCurveTo(x + lean * 0.3, H - h * 0.5, x + lean, H - h);
    }
    ctx.stroke();
  }
}

let last = 0;
function frame(ts) {
  const t = ts / 1000, dt = Math.min(0.05, last ? t - last : 0.016); last = t;
  now += dt;
  step(dt); draw();
  requestAnimationFrame(frame);
}

// ── start ────────────────────────────────────────────────────────────────────────────────────────────────
layout();
for (let i = 0; i < 36; i++) motes.push({ x: Math.random() * W, y: H * 0.1 + Math.random() * (GY0 - H * 0.1), r: 0.8 + Math.random() * 1.6, vx: 4 + Math.random() * 8, p: Math.random() * TAU });
if (TOUCH) document.getElementById('hint').textContent = MOBILE ? 'Tap to plant · drag to sow' : 'Tap to plant · drag to sow · the eight old trees are my work';

if (REDUCED) {
  plantProducts(-100);
  const rr = mulberry(42);
  for (let i = 0; i < 46; i++) addPlant(randomKind(rr), 0.02 + rr() * 0.96, rr(), -100);
  for (const p of plants) { p.age = 999; p.bake(); }
  draw();
} else {
  plantProducts(0.15);
  // the garden plants itself: a first meadow sprouts straight away, then seeds drift in from the sky
  for (let i = 0; i < 30; i++) addPlant(randomKind(), 0.02 + Math.random() * 0.96, Math.random(), -0.9 + Math.random() * 3.2);
  for (let i = 0; i < 9; i++) setTimeout(() => sow(W * (0.08 + Math.random() * 0.84), -10 - Math.random() * 40, true), 300 + i * 420);
  setInterval(() => {
    if (document.hidden) return;
    if (plants.filter(q => q.product < 0 && !q.dying).length < 70) sow(W * (0.05 + Math.random() * 0.9), -20, true);
  }, 3200);
  setTimeout(() => document.querySelectorAll('.tag').forEach((t, i) => setTimeout(() => t.classList.add('on'), i * 90)), 1900);
  requestAnimationFrame(frame);
}
updateCount();
if (document.fonts) document.fonts.ready.then(placeTags);
})();
