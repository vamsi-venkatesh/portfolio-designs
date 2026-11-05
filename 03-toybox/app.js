import { World, Body } from './physics.js';

// ---------------------------------------------------------------- content (facts from site.mjs, verbatim)
const PRODUCTS = [
  { slug: 'vvdex-platform', name: 'VVDex Platform', kind: 'AI evaluation platform', status: 'Live', color: '#F2703A',
    one: 'Tests AI models and agents on real work. Hidden tests decide.', numbers: [['17', 'certified exams'], ['417', 'graded attempts, published']] },
  { slug: 'conxto', name: 'Conxto', kind: 'AI job search', status: 'Live', color: '#D8CDBE',
    one: 'Reads live job postings against your résumé and prepares the whole application.', numbers: [['5 + 2', 'agents and reviewers, one memory'], ['10.6 s → 2.7 s', 'app cold start, 15 Oct 2026']] },
  { slug: 'vvdex-engine', name: 'VVDex Engine', kind: 'AI service engine', status: 'Live', color: '#45C987',
    one: 'Describe the work in one paragraph. It compiles a service that runs by your rules.', numbers: [['50', 'compiled service examples'], ['11', 'categories of business work']] },
  { slug: 'unboundpdf', name: 'UnboundPDF', kind: 'Browser PDF suite', status: 'Live', color: '#EFEAE0',
    one: 'Every PDF tool in the browser. Your file never leaves the tab.', numbers: [['54', 'tools'], ['0', 'uploads']] },
  { slug: 'farmquick', name: 'FarmQuick', kind: 'B2B commerce + lead agent', status: 'Live', color: '#86C977',
    one: 'The ordering site a produce business runs on, and the agent that finds its next buyer.', numbers: [['5', 'cities read every morning'], ['408', 'tests on the public engine']] },
  { slug: 'conxfolio', name: 'Conxfolio', kind: 'Career suite', status: 'Live', color: '#EDE4D6',
    one: 'Résumé, ATS review, cover letter and portfolio website, sharing one résumé.', numbers: [['37', 'résumé designs'], ['20', 'portfolio websites']] },
  { slug: 'pitchradar', name: 'PitchRadar', kind: 'Event intelligence · client', status: 'Private', color: '#F49A4B',
    one: 'Finds and ranks the events a mobile food vendor should trade at. Built for a client.', numbers: [['7', 'agents'], ['620', 'tests · 16 Sep 2026']] },
  { slug: 'vvdex-trading', name: 'VVDex Trading', kind: 'Market research', status: 'Research', color: '#63D2A3',
    one: 'Live market microstructure beside a hash-chained record of every dated call. Paper only.', numbers: [['2,028', 'dated calls'], ['0', 'capital']] },
];
const BY = Object.fromEntries(PRODUCTS.map(p => [p.slug, p]));
const workURL = s => `https://vamsi-venkatesh.github.io/portfolio-designs/inside-the-dot/work/${s}/`;

// tiny DOM builder (no innerHTML)
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'style') Object.assign(el.style, v);
    else if (k === 'class') el.className = v;
    else el.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null) el.append(c);
  return el;
}

// ---------------------------------------------------------------- palette
const INK = '#1B2350', MAPLE = '#E4B47A';
const FACES = [
  { face: '#EE5B3B', ink: '#FFF3E2' }, { face: '#F6C445', ink: INK }, { face: '#F6EEDF', ink: '#E2492B' },
  { face: '#7FD3B0', ink: INK }, { face: '#F3A0B5', ink: INK },
];
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------------------------------------------------------------- shapes
const regular = (n, r, rot = 0) => Array.from({ length: n }, (_, i) => { const t = rot + i * TAU / n; return [r * Math.cos(t), r * Math.sin(t)]; });
const rect = (w, hh) => [[-w / 2, -hh / 2], [w / 2, -hh / 2], [w / 2, hh / 2], [-w / 2, hh / 2]];
function capsule(w, hh) {
  const r = hh / 2, c = w / 2 - r, pts = [];
  for (let i = 0; i <= 5; i++) { const t = -Math.PI / 2 + i * Math.PI / 5; pts.push([c + r * Math.cos(t), r * Math.sin(t)]); }
  for (let i = 0; i <= 5; i++) { const t = Math.PI / 2 + i * Math.PI / 5; pts.push([-c + r * Math.cos(t), r * Math.sin(t)]); }
  return pts;
}
function arch(r) { const pts = []; for (let i = 0; i <= 10; i++) { const t = Math.PI + i * Math.PI / 10; pts.push([r * Math.cos(t), r * Math.sin(t)]); } return pts; }
function tri(s) { const hh = s * Math.sqrt(3) / 2; return [[-s / 2, hh / 3], [0, -2 * hh / 3], [s / 2, hh / 3]]; }

// product toy definitions in units of u
const TOYS = {
  'unboundpdf':     u => ({ shape: { type: 'poly', verts: rect(0.7 * u, 1.04 * u) }, mat: 'book', round: 0.06 * u, rest: 0.12, fric: 0.7 }),
  'vvdex-engine':   u => ({ shape: { type: 'poly', verts: regular(12, 0.52 * u, Math.PI / 12) }, mat: 'gear', round: 0.02 * u, rest: 0.25, fric: 0.6 }),
  'farmquick':      u => ({ shape: { type: 'poly', verts: arch(0.64 * u) }, mat: 'felt', round: 0.05 * u, rest: 0.08, fric: 0.9 }),
  'vvdex-trading':  u => ({ shape: { type: 'poly', verts: capsule(1.56 * u, 0.56 * u) }, mat: 'enamel', round: 0.02 * u, rest: 0.25, fric: 0.6 }),
  'vvdex-platform': u => ({ shape: { type: 'poly', verts: regular(6, 0.56 * u, 0) }, mat: 'nut', round: 0.08 * u, rest: 0.25, fric: 0.6 }),
  'conxto':         u => ({ shape: { type: 'circle', r: 0.5 * u }, mat: 'woodball', rest: 0.3, fric: 0.7, density: 1.1 }),
  'conxfolio':      u => ({ shape: { type: 'poly', verts: tri(1.14 * u) }, mat: 'prism', round: 0.09 * u, rest: 0.2, fric: 0.7 }),
  'pitchradar':     u => ({ shape: { type: 'circle', r: 0.42 * u }, mat: 'rubber', rest: 0.6, fric: 0.9, density: 0.55 }),
};

// ---------------------------------------------------------------- DOM
const cvs = document.getElementById('toy');
const ctx = cvs.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const card = document.getElementById('card'), cardBody = document.getElementById('card-body');
const tidyBtn = document.getElementById('tidy'), soundBtn = document.getElementById('sound'), tiltBtn = document.getElementById('tilt');
const hint = document.getElementById('hint');

let W = 0, H = 0, DPR = 1, L = null, world = null, toys = [], bgCanvas = null;
let simT = 0, acc = 0, lastT = 0, tidy = null, puffs = [];
const STEP = 1 / 180;

// ---------------------------------------------------------------- layout
function computeLayout() {
  const mobile = W < 760;
  const floorH = mobile ? 58 : 70;
  const floorY = H - floorH;
  let block, u;
  if (mobile) { block = clamp((W - 24) / 9.7, 28, 50); u = clamp(W / 6.3, 50, 74); }
  else { block = clamp(Math.min((W - 60) / 13.8, H / 9.4), 44, 98); u = clamp(block * 1.3, 64, 132); }
  const gap = Math.max(2, Math.round(block * 0.045));
  const pyrW = 9 * block + 8 * gap;
  const cx = W / 2;
  const thick = mobile ? 16 : 22;
  const shelves = [];
  const s1y = Math.round(mobile ? H * 0.405 : Math.max(H * 0.56, 2 * block + 230));
  if (mobile) shelves.push({ x0: 8, x1: W - 8, y: s1y, t: thick });
  else shelves.push({ x0: Math.max(24, cx - pyrW / 2 - u * 1.7), x1: Math.min(W - 24, cx + pyrW / 2 + u * 1.7), y: s1y, t: thick });
  if (mobile) shelves.push({ x0: 8, x1: W - 8, y: Math.round(s1y + (floorY - s1y) * 0.52), t: thick });
  return { mobile, floorH, floorY, block, u, gap, pyrW, cx, shelves };
}

function buildSpecs() {
  const { mobile, floorY, block, u, gap, pyrW, cx, shelves } = L;
  const specs = [];
  const s1 = shelves[0];
  const left = cx - pyrW / 2;
  const word2 = 'VENKATESH', word1 = 'VAMSI';
  for (let i = 0; i < 9; i++) {
    specs.push({ key: 'L2' + i, kind: 'letter', ch: word2[i], fi: FACES[(i + 1) % 5], shape: { type: 'poly', verts: rect(block, block) },
      round: block * 0.16, x: left + block / 2 + i * (block + gap), bottom: s1.y, rest: 0.16, fric: 0.75, delay: 0.12 + i * 0.075, layer: 0 });
  }
  const l1 = left + (block + gap) / 2;
  for (let i = 0; i < 5; i++) {
    specs.push({ key: 'L1' + i, kind: 'letter', ch: word1[i], fi: FACES[(i * 2 + 3) % 5], shape: { type: 'poly', verts: rect(block, block) },
      round: block * 0.16, x: l1 + block / 2 + i * (block + gap), bottom: s1.y - block, rest: 0.16, fric: 0.75, delay: 0.95 + i * 0.08, layer: 1 });
  }
  const toy = (slug, x, bottom, delay, layer = 0) => {
    const d = TOYS[slug](u);
    specs.push({ key: slug, kind: 'product', slug, ...d, x, bottom, delay, layer });
  };
  const btnW = mobile ? Math.min(2.15 * u, 150) : 2.2 * u;
  const button = (x, bottom, delay) => {
    const hh = mobile ? 0.82 * u : 0.8 * u;
    specs.push({ key: 'contact', kind: 'contact', shape: { type: 'poly', verts: capsule(btnW, hh) }, mat: 'button', round: 0.02 * u, rest: 0.3, fric: 0.7, x, bottom, delay, layer: 0 });
  };
  const widthOf = slug => { const b = new Body({ shape: TOYS[slug](u).shape }); return b.maxX - b.minX; };
  const pack = (items, x0, x1) => {
    const total = items.reduce((a, it) => a + it.w, 0);
    const g = (x1 - x0 - total) / (items.length + 1);
    let x = x0 + g; const xs = [];
    for (const it of items) { xs.push(x + it.w / 2); x += it.w + g; }
    return xs;
  };
  if (!mobile) {
    toy('pitchradar', s1.x0 + u * 0.72, s1.y, 1.55, 0);
    toy('conxfolio', s1.x1 - u * 0.78, s1.y, 1.75, 0);
    const row = ['unboundpdf', 'vvdex-engine', 'farmquick', 'vvdex-trading', 'conxto', 'contact'].map(slug => ({ slug, w: slug === 'contact' ? btnW : widthOf(slug) }));
    const xs = pack(row, 30, W - 30);
    const delays = [1.35, 1.5, 1.65, 1.45, 1.8, 2.15];
    row.forEach((it, i) => { if (it.slug === 'contact') button(xs[i], floorY, delays[i]); else toy(it.slug, xs[i], floorY, delays[i]); });
  } else {
    const s2 = shelves[1];
    const row2 = ['unboundpdf', 'vvdex-engine', 'farmquick', 'conxfolio', 'pitchradar'].map(slug => ({ slug, w: widthOf(slug) }));
    const xs2 = pack(row2, s2.x0, s2.x1);
    row2.forEach((it, i) => toy(it.slug, xs2[i], s2.y, 1.35 + i * 0.1));
    const row3 = [{ w: widthOf('vvdex-trading') }, { w: widthOf('conxto') }, { w: btnW }];
    const xs3 = pack(row3, 8, W - 8);
    toy('vvdex-trading', xs3[0], floorY, 1.5);
    toy('conxto', xs3[1], floorY, 1.7);
    button(xs3[2], floorY, 2.1);
  }
  // the hexagon nut sits on the capsule
  const cap = specs.find(s => s.key === 'vvdex-trading');
  const capBody = new Body({ shape: cap.shape });
  toy('vvdex-platform', cap.x + u * 0.12, cap.bottom - (capBody.maxY - capBody.minY), cap.delay + 0.42, 1);
  return specs;
}

function makeStatics(w) {
  const add = (x0, y0, x1, y1, extra = {}) => { const b = new Body({ isStatic: true, shape: { type: 'poly', verts: rect(x1 - x0, y1 - y0) }, x: (x0 + x1) / 2, y: (y0 + y1) / 2, friction: 0.8 }); Object.assign(b, extra); return w.add(b); };
  add(-600, L.floorY, W + 600, L.floorY + 1200);           // floor
  add(-1200, -4000, 0, H + 1200);                           // left wall
  add(W, -4000, W + 1200, H + 1200);                        // right wall
  add(-600, -1400, W + 600, 0, { ceiling: true });          // ceiling (only for things already inside)
  for (const s of L.shelves) add(s.x0, s.y, s.x1, s.y + s.t, { surface: s.y });
}
// while a toy drops in, it passes in front of everything that rests higher up than its own place
function introFilter(A, B) {
  return !(passes(A, B) || passes(B, A));
}
function passes(a, o) {
  if (!a.introPass) return false;
  if (o.isStatic) return o.surface != null && o.surface < a.introPass - 2;
  if (!o.spec) return false;
  // pass through toys that rest higher up, except the ones that rest on top of this toy
  return o.spec.bottom < a.introPass - 2 && Math.abs(o.spec.bottom - a.spec.top) > 3;
}

function bodyFromSpec(s) {
  const b = new Body({ shape: s.shape, density: s.density ?? 1, friction: s.fric, restitution: s.rest });
  b.x = s.x; b.y = s.bottom - b.maxY - 0.3; b.a = 0; b.updateWorld();
  b.spec = s;
  s.top = s.bottom - (b.maxY - b.minY);
  return b;
}

// settle the intended layout headlessly so the "tidy" targets are true resting poses
function settle(specs) {
  const w = new World();
  w.gy = L.g;
  makeStatics(w);
  const bodies = specs.map(s => { const b = bodyFromSpec(s); b.entered = true; return w.add(b); });
  for (let i = 0; i < 600; i++) w.step(STEP);
  const t = {};
  bodies.forEach(b => { t[b.spec.key] = { x: b.x, y: b.y, a: b.a, drift: Math.hypot(b.x - b.spec.x, b.y - (b.spec.bottom - b.maxY)) }; });
  return t;
}

// ---------------------------------------------------------------- scene
function build() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth; H = window.innerHeight;
  cvs.width = Math.round(W * DPR); cvs.height = Math.round(H * DPR);
  L = computeLayout();
  L.g = H * 2.9;
  document.documentElement.style.setProperty('--floor-h', L.floorH + 'px');
  const specs = buildSpecs();
  const targets = settle(specs);
  world = new World();
  world.gy = L.g;
  world.onImpact = onImpact;
  world.filter = introFilter;
  makeStatics(world);
  toys = specs.map((s, i) => {
    const b = bodyFromSpec(s);
    b.target = targets[s.key];
    b.z = i;
    world.add(b);
    return b;
  });
  bgCanvas = paintBackground();
  buildSprites();
}

function startIntro() {
  for (const b of toys) {
    b.active = false; b.entered = false; b.released = false; b.introPass = b.spec.bottom;
    b.y = -b.boundR - 30 - Math.random() * 80 - (b.spec.layer ? 60 : 0);
    b.x = b.target.x; b.a = b.target.a; b.vx = b.vy = b.w = 0;
    b.updateWorld();
  }
  simT = 0;
}

function placeAtTargets() {
  for (const b of toys) {
    b.x = b.target.x; b.y = b.target.y; b.a = b.target.a; b.vx = b.vy = b.w = 0;
    b.introPass = 0; b.homeUntil = 0; b.active = true; b.released = true; b.entered = true; b.sleeping = true; b.sleepT = 0; b.updateWorld();
  }
}

// ---------------------------------------------------------------- drawing helpers
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round(r + (t - r) * p); g = Math.round(g + (t - g) * p); b = Math.round(b + (t - b) * p);
  return `rgb(${r},${g},${b})`;
}
function roundPoly(c, v, r) {
  const n = v.length;
  c.beginPath();
  c.moveTo((v[n - 1][0] + v[0][0]) / 2, (v[n - 1][1] + v[0][1]) / 2);
  for (let i = 0; i < n; i++) {
    const p = v[i], q = v[(i + 1) % n], o = v[(i - 1 + n) % n];
    const lq = Math.hypot(q[0] - p[0], q[1] - p[1]), lo = Math.hypot(o[0] - p[0], o[1] - p[1]);
    c.arcTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, Math.min(r, lq * 0.42, lo * 0.42));
  }
  c.closePath();
}
function insetPoly(v, d) {
  const n = v.length, out = [];
  const norm = (a, b) => { let nx = b[1] - a[1], ny = -(b[0] - a[0]); const l = Math.hypot(nx, ny); nx /= l; ny /= l; if (nx * (a[0] + b[0]) + ny * (a[1] + b[1]) < 0) { nx = -nx; ny = -ny; } return [nx, ny]; };
  for (let i = 0; i < n; i++) {
    const n1 = norm(v[(i - 1 + n) % n], v[i]), n2 = norm(v[i], v[(i + 1) % n]);
    const k = d / (1 + n1[0] * n2[0] + n1[1] * n2[1]);
    out.push([v[i][0] - (n1[0] + n2[0]) * k, v[i][1] - (n1[1] + n2[1]) * k]);
  }
  return out;
}
function bodyPath(c, b, r) {
  if (b.type === 'circle') { c.beginPath(); c.arc(0, 0, b.r, 0, TAU); return; }
  roundPoly(c, b.lv, r ?? b.spec.round ?? 4);
}
function fitText(c, text, maxW, size, weight = 800, family = '"Bricolage Grotesque"') {
  let s = size;
  for (;;) { c.font = `${weight} ${s}px ${family}`; if (c.measureText(text).width <= maxW || s <= 7) break; s -= 0.5; }
  return s;
}
function grain(c, x0, y0, w, hh, color, count, wav = 1) {
  c.strokeStyle = color; c.lineWidth = 1;
  for (let i = 0; i < count; i++) {
    const y = y0 + (i + 0.5) * hh / count + (Math.random() - 0.5) * hh / count * 0.6;
    c.beginPath(); c.moveTo(x0, y);
    for (let x = x0; x <= x0 + w + 8; x += 8) c.lineTo(x, y + Math.sin(x * 0.045 + i) * 1.4 * wav + Math.sin(x * 0.011 + i * 3) * 2.5 * wav);
    c.globalAlpha = 0.35 + Math.random() * 0.5; c.stroke();
  }
  c.globalAlpha = 1;
}
function speckle(c, x0, y0, w, hh, alpha, n) {
  for (let i = 0; i < n; i++) {
    c.fillStyle = Math.random() < 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    c.fillRect(x0 + Math.random() * w, y0 + Math.random() * hh, 1, 1);
  }
}
function label(g, text, x, y, maxW, size, weight = 800, color = INK) {
  g.fillStyle = color; fitText(g, text, maxW, size, weight); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y);
}

// ---------------------------------------------------------------- background
function paintBackground() {
  const c = document.createElement('canvas'); c.width = cvs.width; c.height = cvs.height;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  const { floorY, shelves, mobile } = L;
  let gr = g.createLinearGradient(0, 0, 0, floorY);
  gr.addColorStop(0, '#2C4FDB'); gr.addColorStop(1, '#1F3AB0');
  g.fillStyle = gr; g.fillRect(0, 0, W, floorY);
  gr = g.createRadialGradient(W * 0.74, H * 0.1, 0, W * 0.74, H * 0.1, Math.max(W, H) * 0.75);
  gr.addColorStop(0, 'rgba(255,226,170,0.30)'); gr.addColorStop(0.45, 'rgba(255,226,170,0.08)'); gr.addColorStop(1, 'rgba(255,226,170,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, floorY);
  const sp = mobile ? 26 : 34;
  g.fillStyle = 'rgba(246,238,223,0.075)';
  for (let y = sp / 2, row = 0; y < floorY; y += sp, row++) {
    for (let x = (row % 2 ? sp / 2 : 0) + 6; x < W; x += sp) { g.beginPath(); g.arc(x, y, 1.6, 0, TAU); g.fill(); }
  }
  gr = g.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H * 0.45, Math.max(W, H) * 0.85);
  gr.addColorStop(0, 'rgba(10,18,70,0)'); gr.addColorStop(1, 'rgba(10,18,70,0.35)');
  g.fillStyle = gr; g.fillRect(0, 0, W, floorY);
  gr = g.createLinearGradient(0, floorY - 40, 0, floorY);
  gr.addColorStop(0, 'rgba(10,18,70,0)'); gr.addColorStop(1, 'rgba(10,18,70,0.28)');
  g.fillStyle = gr; g.fillRect(0, floorY - 40, W, 40);
  g.fillStyle = '#F2E6D0'; g.fillRect(0, floorY - 7, W, 7);
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(0, floorY - 7, W, 1.5);
  gr = g.createLinearGradient(0, floorY, 0, H);
  gr.addColorStop(0, '#E4AC6C'); gr.addColorStop(1, '#C98A4C');
  g.fillStyle = gr; g.fillRect(0, floorY, W, H - floorY);
  g.save(); g.beginPath(); g.rect(0, floorY, W, H - floorY); g.clip();
  grain(g, 0, floorY + 4, W, H - floorY, 'rgba(140,80,30,0.22)', Math.round((H - floorY) / 5), 1);
  g.fillStyle = 'rgba(120,66,24,0.35)';
  const pl = mobile ? 150 : 230;
  for (let x = 40; x < W; x += pl) g.fillRect(x, floorY + 2, 1.5, H - floorY);
  g.restore();
  g.fillStyle = 'rgba(80,40,10,0.25)'; g.fillRect(0, floorY, W, 2);
  for (const s of shelves) paintShelf(g, s);
  speckle(g, 0, 0, W, H, 0.035, Math.round(W * H / 6));
  return c;
}
function paintShelf(g, s) {
  const { x0, x1, y, t } = s;
  g.save();
  g.shadowColor = 'rgba(8,14,60,0.45)'; g.shadowBlur = 22 * DPR; g.shadowOffsetY = 14 * DPR;
  g.fillStyle = '#1F3AB0'; g.fillRect(x0 + 6, y + 2, x1 - x0 - 12, t - 4);
  g.restore();
  const bw = Math.max(10, t * 0.6), bh = t * 2.6;
  for (const bx of [x0 + (x1 - x0) * 0.12, x1 - (x1 - x0) * 0.12]) {
    g.save(); g.shadowColor = 'rgba(8,14,60,0.4)'; g.shadowBlur = 10 * DPR; g.shadowOffsetY = 6 * DPR;
    g.fillStyle = '#F0E3CB';
    g.beginPath(); g.moveTo(bx - bw / 2, y + t); g.lineTo(bx + bw / 2, y + t); g.lineTo(bx + bw / 2, y + t + bh * 0.25);
    g.quadraticCurveTo(bx + bw / 2, y + t + bh, bx - bw / 2, y + t + bh); g.closePath(); g.fill();
    g.restore();
    g.fillStyle = 'rgba(27,35,80,0.25)'; g.beginPath(); g.arc(bx - bw * 0.1, y + t + bh * 0.55, 1.8, 0, TAU); g.fill();
  }
  const gr = g.createLinearGradient(0, y, 0, y + t);
  gr.addColorStop(0, '#F4CF98'); gr.addColorStop(0.18, '#E9B676'); gr.addColorStop(1, '#C88A4B');
  g.fillStyle = gr;
  g.beginPath(); g.roundRect(x0, y, x1 - x0, t, 3); g.fill();
  g.save(); g.beginPath(); g.roundRect(x0, y, x1 - x0, t, 3); g.clip();
  grain(g, x0, y + 3, x1 - x0, t - 3, 'rgba(130,72,26,0.25)', 4, 0.6);
  g.restore();
  g.fillStyle = 'rgba(255,245,225,0.7)'; g.fillRect(x0 + 2, y, x1 - x0 - 4, 1.5);
}

// ---------------------------------------------------------------- sprites
function spriteCanvas(b, pad) {
  const size = Math.ceil((b.boundR + pad) * 2);
  const c = document.createElement('canvas'); c.width = c.height = Math.ceil(size * DPR);
  const g = c.getContext('2d'); g.scale(DPR, DPR); g.translate(size / 2, size / 2);
  return { c, g, size };
}
function buildSprites() {
  for (const b of toys) {
    const sp = spriteCanvas(b, 3);
    paintToy(sp.g, b);
    b.sprite = sp;
    const blur = Math.max(6, b.boundR * 0.16);
    const sh = spriteCanvas(b, blur * 2.2);
    sh.g.save();
    sh.g.shadowColor = 'rgba(6,12,55,1)'; sh.g.shadowBlur = blur * DPR; sh.g.shadowOffsetX = 5000 * DPR;
    sh.g.translate(-5000, 0); bodyPath(sh.g, b); sh.g.fillStyle = '#000'; sh.g.fill();
    sh.g.restore();
    b.shadow = sh;
  }
}

function paintToy(g, b) {
  const s = b.spec;
  if (s.kind === 'letter') return paintLetter(g, b);
  if (s.kind === 'contact') return paintButton(g, b);
  const p = BY[s.slug], col = p.color, R = b.boundR;
  const w = b.maxX - b.minX, hh = b.maxY - b.minY;
  g.save();
  switch (s.mat) {
    case 'book': {
      bodyPath(g, b); g.fillStyle = col; g.fill(); g.clip();
      g.fillStyle = shade(col, -0.12); g.fillRect(b.minX, b.minY, w * 0.16, hh);
      g.fillStyle = 'rgba(27,35,80,0.10)'; g.fillRect(b.minX + w * 0.16, b.minY, 1.5, hh);
      g.strokeStyle = 'rgba(27,35,80,0.14)'; g.lineWidth = 1;
      for (let i = 1; i < 6; i++) { const x = b.maxX - i * 2.2; g.beginPath(); g.moveTo(x, b.minY + 4); g.lineTo(x, b.maxY - 4); g.stroke(); }
      const f = w * 0.26;
      g.fillStyle = shade(col, -0.16);
      g.beginPath(); g.moveTo(b.maxX - f, b.minY); g.lineTo(b.maxX, b.minY + f); g.lineTo(b.maxX - f, b.minY + f); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(27,35,80,0.25)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(b.maxX - f, b.minY); g.lineTo(b.maxX - f, b.minY + f); g.lineTo(b.maxX, b.minY + f); g.stroke();
      g.fillStyle = '#E2492B';
      g.beginPath(); g.roundRect(b.minX + w * 0.3, b.maxY - hh * 0.2, w * 0.4, hh * 0.1, 3); g.fill();
      label(g, 'PDF', b.minX + w * 0.5, b.maxY - hh * 0.15, w * 0.32, hh * 0.075, 800, '#FFF3E2');
      g.save(); g.translate(b.minX + w * 0.56, b.minY + hh * 0.4); g.rotate(-Math.PI / 2);
      label(g, p.name, 0, 0, hh * 0.6, w * 0.24);
      g.restore();
      break;
    }
    case 'gear': {
      const r0 = R, rIn = r0 * 0.8;
      g.beginPath();
      for (let i = 0; i < 12; i++) {
        const t = Math.PI / 12 + i * TAU / 12, d1 = 0.105, d2 = 0.19;
        [[rIn, t - d2], [r0 * 0.965, t - d1], [r0 * 0.965, t + d1], [rIn, t + d2]].forEach(([rr, a], k) => {
          const x = rr * Math.cos(a), y = rr * Math.sin(a); if (i === 0 && k === 0) g.moveTo(x, y); else g.lineTo(x, y);
        });
        g.arc(0, 0, rIn, t + d2, Math.PI / 12 + (i + 1) * TAU / 12 - d2);
      }
      g.closePath(); g.fillStyle = col; g.fill();
      g.lineWidth = 1.5; g.strokeStyle = shade(col, -0.28); g.stroke();
      g.beginPath(); g.arc(0, 0, rIn * 0.84, 0, TAU); g.fillStyle = shade(col, 0.14); g.fill();
      g.lineWidth = 2; g.strokeStyle = shade(col, -0.18); g.stroke();
      for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + Math.PI / 4; g.beginPath(); g.arc(Math.cos(a) * rIn * 0.62, Math.sin(a) * rIn * 0.62, Math.max(1.5, r0 * 0.045), 0, TAU); g.fillStyle = shade(col, -0.3); g.fill(); }
      g.beginPath(); g.arc(0, -rIn * 0.36, Math.max(2.5, r0 * 0.085), 0, TAU); g.fillStyle = shade(col, -0.45); g.fill();
      label(g, 'VVDex', 0, rIn * 0.08, rIn * 1.15, r0 * 0.26);
      label(g, 'Engine', 0, rIn * 0.38, rIn * 1.0, r0 * 0.2, 700);
      g.restore();
      return;
    }
    case 'felt': {
      bodyPath(g, b); g.fillStyle = col; g.fill(); g.clip();
      speckle(g, b.minX, b.minY, w, hh, 0.12, Math.round(w * hh / 5));
      roundPoly(g, insetPoly(b.lv, Math.max(4, R * 0.09)), b.spec.round * 0.6);
      g.setLineDash([Math.max(3, R * 0.06), Math.max(3, R * 0.05)]); g.lineWidth = Math.max(1.2, R * 0.025);
      g.strokeStyle = 'rgba(255,250,235,0.8)'; g.stroke(); g.setLineDash([]);
      g.beginPath(); g.arc(0, b.minY + hh * 0.42, R * 0.12, 0, TAU); g.fillStyle = '#F6C445'; g.fill();
      label(g, p.name, 0, b.maxY - hh * 0.27, w * 0.62, R * 0.22);
      break;
    }
    case 'enamel': {
      bodyPath(g, b); g.fillStyle = shade(col, -0.2); g.fill();
      roundPoly(g, insetPoly(b.lv, Math.max(3, hh * 0.09)), 3); g.fillStyle = col; g.fill(); g.clip();
      g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(b.minX, b.minY + hh * 0.2, w, hh * 0.09);
      label(g, p.name, 0, hh * 0.07, w * 0.7, hh * 0.32);
      break;
    }
    case 'nut': {
      bodyPath(g, b); g.fillStyle = shade(col, -0.16); g.fill();
      roundPoly(g, insetPoly(b.lv, Math.max(3, R * 0.1)), b.spec.round * 0.7); g.fillStyle = col; g.fill();
      g.beginPath(); g.arc(0, -R * 0.38, R * 0.12, 0, TAU); g.fillStyle = shade(col, -0.42); g.fill();
      label(g, 'VVDex', 0, R * 0.04, R * 1.1, R * 0.3);
      label(g, 'Platform', 0, R * 0.34, R * 1.1, R * 0.23, 700);
      break;
    }
    case 'woodball': {
      bodyPath(g, b); g.fillStyle = col; g.fill(); g.clip();
      g.strokeStyle = 'rgba(120,84,50,0.2)';
      for (let i = 1; i < 9; i++) { g.lineWidth = i % 3 === 0 ? 2 : 1; g.beginPath(); g.ellipse(R * 0.32, R * 0.22, i * R * 0.17, i * R * 0.15, 0.3, 0, TAU); g.stroke(); }
      speckle(g, -R, -R, 2 * R, 2 * R, 0.08, Math.round(R * R));
      g.beginPath(); g.arc(0, 0, R, 0, TAU); g.lineWidth = R * 0.1; g.strokeStyle = 'rgba(120,84,50,0.16)'; g.stroke();
      label(g, p.name, 0, 0, R * 1.4, R * 0.42);
      break;
    }
    case 'prism': {
      bodyPath(g, b); g.fillStyle = col; g.fill(); g.clip();
      grain(g, b.minX, b.minY, w, hh, 'rgba(150,110,60,0.22)', 9, 0.6);
      roundPoly(g, insetPoly(b.lv, Math.max(3, R * 0.1)), b.spec.round * 0.6); g.lineWidth = 1.5; g.strokeStyle = 'rgba(140,100,55,0.35)'; g.stroke();
      label(g, p.name, 0, b.maxY - hh * 0.24, w * 0.5, R * 0.26);
      break;
    }
    case 'rubber': {
      bodyPath(g, b); g.fillStyle = col; g.fill(); g.clip();
      const bh = R * 0.62;
      g.fillStyle = '#F6EEDF'; g.fillRect(-R, -bh / 2, 2 * R, bh);
      g.fillStyle = shade(col, -0.15); g.fillRect(-R, -bh / 2 - 2, 2 * R, 2); g.fillRect(-R, bh / 2, 2 * R, 2);
      label(g, p.name, 0, 1, R * 1.6, bh * 0.6);
      break;
    }
  }
  g.restore();
  g.save(); bodyPath(g, b); g.lineWidth = 1.2; g.strokeStyle = 'rgba(20,20,60,0.22)'; g.stroke(); g.restore();
}

function paintLetter(g, b) {
  const s = b.spec, S = b.maxX - b.minX, f = s.fi;
  g.save();
  bodyPath(g, b); g.fillStyle = MAPLE; g.fill(); g.clip();
  grain(g, -S / 2, -S / 2, S, S, 'rgba(150,90,35,0.28)', 7, 0.5);
  g.restore();
  const fr = S * 0.105;
  g.save();
  roundPoly(g, insetPoly(b.lv, fr), S * 0.09);
  g.fillStyle = f.face; g.fill(); g.clip();
  const gr = g.createLinearGradient(0, -S / 2 + fr, 0, -S / 2 + fr + S * 0.14);
  gr.addColorStop(0, 'rgba(40,20,0,0.22)'); gr.addColorStop(1, 'rgba(40,20,0,0)');
  g.fillStyle = gr; g.fillRect(-S / 2, -S / 2, S, S);
  speckle(g, -S / 2, -S / 2, S, S, 0.05, Math.round(S * S / 5));
  const size = S * 0.62;
  g.font = `400 ${size}px "Bagel Fat One"`;
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const m = g.measureText(s.ch);
  const asc = m.actualBoundingBoxAscent || size * 0.7, desc = m.actualBoundingBoxDescent || 0;
  const by = (asc - desc) / 2;
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillText(s.ch, 0, by + S * 0.018);
  g.fillStyle = 'rgba(30,10,0,0.25)'; g.fillText(s.ch, 0, by - S * 0.012);
  g.fillStyle = f.ink; g.fillText(s.ch, 0, by);
  g.restore();
  g.save(); bodyPath(g, b); g.lineWidth = 1.2; g.strokeStyle = 'rgba(90,50,15,0.45)'; g.stroke(); g.restore();
}

function paintButton(g, b) {
  const w = b.maxX - b.minX, hh = b.maxY - b.minY;
  g.save();
  bodyPath(g, b); g.fillStyle = '#D99A1E'; g.fill();
  roundPoly(g, insetPoly(b.lv, Math.max(4, hh * 0.1)).map(([x, y]) => [x, y - hh * 0.035]), 2); g.fillStyle = '#F6C445'; g.fill();
  g.clip();
  g.fillStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); g.ellipse(0, -hh * 0.26, w * 0.36, hh * 0.12, 0, 0, TAU); g.fill();
  g.restore();
  g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const sz = fitText(g, 'Say hello!', w * 0.7, hh * 0.36, 400, '"Bagel Fat One"');
  g.font = `400 ${sz}px "Bagel Fat One"`;
  g.fillText('Say hello!', 0, sz * 0.36 - hh * 0.035);
  g.save(); bodyPath(g, b); g.lineWidth = 1.2; g.strokeStyle = 'rgba(90,50,0,0.4)'; g.stroke(); g.restore();
}

// ---------------------------------------------------------------- frame rendering
const GLOSS = { letter: 0.22, enamel: 0.42, nut: 0.42, gear: 0.35, rubber: 0.3, button: 0.45, woodball: 0.18, prism: 0.12, felt: 0.05, book: 0.1 };
function worldPath(c, b) {
  if (b.type === 'circle') { c.beginPath(); c.arc(b.x, b.y, b.r, 0, TAU); return; }
  const v = []; for (let i = 0; i < b.lv.length; i++) v.push([b.wv[2 * i], b.wv[2 * i + 1]]);
  roundPoly(c, v, b.spec.round ?? 4);
}
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(bgCanvas, 0, 0);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const vis = toys.filter(b => b.active);
  for (const b of vis) {
    const sh = b.shadow, off = 4 + b.boundR * 0.09;
    ctx.save(); ctx.globalAlpha = 0.34; ctx.translate(b.x + off * 0.25, b.y + off); ctx.rotate(b.a);
    ctx.drawImage(sh.c, -sh.size / 2, -sh.size / 2, sh.size, sh.size); ctx.restore();
  }
  vis.sort((a, b) => (a.dragged ? 1 : 0) - (b.dragged ? 1 : 0) || a.z - b.z);
  for (const b of vis) {
    const sp = b.sprite;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); if (b.dragged) ctx.scale(1.035, 1.035);
    ctx.drawImage(sp.c, -sp.size / 2, -sp.size / 2, sp.size, sp.size);
    ctx.restore();
    ctx.save(); worldPath(ctx, b); ctx.clip();
    const R = b.boundR;
    let gr = ctx.createLinearGradient(0, b.y - R, 0, b.y + R);
    gr.addColorStop(0, 'rgba(255,248,230,0.20)'); gr.addColorStop(0.5, 'rgba(255,248,230,0)'); gr.addColorStop(1, 'rgba(10,15,60,0.22)');
    ctx.fillStyle = gr; ctx.fillRect(b.x - R, b.y - R, 2 * R, 2 * R);
    const gl = GLOSS[b.spec.kind === 'letter' ? 'letter' : b.spec.mat] || 0.1;
    gr = ctx.createRadialGradient(b.x - R * 0.35, b.y - R * 0.45, 0, b.x - R * 0.35, b.y - R * 0.45, R * 0.75);
    gr.addColorStop(0, `rgba(255,255,255,${gl})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gr; ctx.fillRect(b.x - R, b.y - R, 2 * R, 2 * R);
    ctx.restore();
  }
  for (const p of puffs) {
    ctx.globalAlpha = Math.max(0, p.life) * 0.7;
    ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- loop
function tick(now) {
  requestAnimationFrame(tick);
  if (!lastT) lastT = now;
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  if (tidy) stepTidy(dt);
  else {
    acc += dt;
    while (acc >= STEP) {
      simT += STEP;
      for (const b of toys) if (!b.released && simT >= b.spec.delay) {
        b.active = true; b.released = true; b.vy = 250; b.homeUntil = simT + 3.4;
      }
      // the intro drop is real physics, with a gentle hand guiding each toy to its place
      for (const b of toys) {
        if (!b.homeUntil) continue;
        if (simT > b.homeUntil || b.dragged) { b.homeUntil = 0; continue; }
        if (b.sleeping) continue;
        const t = b.target;
        let da = t.a - b.a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
        b.vx += ((t.x - b.x) * 60 - b.vx * 9) * STEP;
        b.w += (da * 70 - b.w * 10) * STEP;
      }
      world.step(STEP);
      for (const b of toys) if (b.introPass && (b.sleeping || b.dragged)) b.introPass = 0;
      acc -= STEP;
    }
  }
  for (const p of puffs) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 30 * dt; p.vx *= 0.94; p.r += dt * 10; p.life -= dt * 1.8; }
  puffs = puffs.filter(p => p.life > 0);
  render();
}

// ---------------------------------------------------------------- tidy (spring back)
function startTidy() {
  closeCard();
  for (const j of [...world.joints]) world.removeJoint(j);
  pointers.clear(); cvs.classList.remove('grabbing');
  const order = toys.slice().sort((a, b) => a.spec.layer - b.spec.layer || a.target.x - b.target.x);
  tidy = { t: 0, items: order.map((b, i) => {
    if (!b.active) { b.active = true; b.released = true; b.x = b.target.x; b.y = -b.boundR - 40; b.a = b.target.a; }
    let ta = b.target.a; while (ta - b.a > Math.PI) ta -= TAU; while (ta - b.a < -Math.PI) ta += TAU;
    return { b, delay: i * 0.025, ta, vx: 0, vy: 0, va: 0 };
  }) };
}
function stepTidy(dt) {
  tidy.t += dt;
  let done = true;
  const k = 170, c = 15;
  for (const it of tidy.items) {
    const b = it.b;
    if (tidy.t < it.delay) { done = false; continue; }
    const t = b.target;
    for (let s = 0; s < 4; s++) {
      const q = dt / 4;
      it.vx += (k * (t.x - b.x) - c * it.vx) * q; it.vy += (k * (t.y - b.y) - c * it.vy) * q; it.va += (k * (it.ta - b.a) - c * it.va) * q;
      b.x += it.vx * q; b.y += it.vy * q; b.a += it.va * q;
    }
    b.updateWorld();
    if (Math.abs(t.x - b.x) + Math.abs(t.y - b.y) > 0.4 || Math.abs(it.vx) + Math.abs(it.vy) > 4 || Math.abs(it.ta - b.a) > 0.003) done = false;
  }
  if (done || tidy.t > 3) { placeAtTargets(); tidy = null; acc = 0; }
}

// ---------------------------------------------------------------- pointer play
const pointers = new Map();
let lastTap = { id: null, t: 0 };
let zc = 100;
function pick(x, y) {
  let best = null;
  for (const b of toys) if (b.active && b.contains(x, y) && (!best || b.z > best.z)) best = b;
  return best;
}
cvs.addEventListener('pointerdown', e => {
  const x = e.clientX, y = e.clientY;
  let b = pick(x, y);
  // a double-click whose first click booped the toy away still counts
  if (!b && lastTap.id && performance.now() - lastTap.t < 420 && Math.hypot(x - lastTap.x, y - lastTap.y) < 50) {
    b = toys.find(t => t.id === lastTap.id); lastTap.id = null; if (b) { e.preventDefault(); openFor(b); return; }
  }
  if (!b) { closeCard(); return; }
  e.preventDefault();
  ensureAudio(false);
  b.z = ++zc;
  if (reduce) { openFor(b); return; }
  if (tidy) return;
  try { cvs.setPointerCapture(e.pointerId); } catch (_) {}
  const j = world.addJoint(b, x, y);
  pointers.set(e.pointerId, { j, b, x0: x, y0: y, t0: performance.now(), moved: 0 });
  cvs.classList.add('grabbing');
  dismissHint();
});
cvs.addEventListener('pointermove', e => {
  const p = pointers.get(e.pointerId);
  if (p) {
    p.j.tx = e.clientX; p.j.ty = e.clientY;
    p.moved = Math.max(p.moved, Math.hypot(e.clientX - p.x0, e.clientY - p.y0));
  } else if (e.pointerType === 'mouse') {
    cvs.classList.toggle('grab', !!pick(e.clientX, e.clientY));
  }
});
function endPointer(e) {
  const p = pointers.get(e.pointerId); if (!p) return;
  pointers.delete(e.pointerId);
  world.removeJoint(p.j);
  if (!pointers.size) cvs.classList.remove('grabbing');
  const now = performance.now();
  if (p.moved < 7 && now - p.t0 < 350) {
    const b = p.b;
    if (b.spec.kind === 'contact') { b.wake(); b.vy -= 380; b.w += (Math.random() - 0.5) * 2; openFor(b); lastTap.id = null; return; }
    if (lastTap.id === b.id && now - lastTap.t < 420) { openFor(b); lastTap.id = null; return; }
    lastTap = { id: b.id, t: now, x: e.clientX, y: e.clientY };
    b.wake(); b.vy -= 300 + Math.random() * 120; b.w += (Math.random() - 0.5) * 3;   // boop: a little hop
    blip(b, 0.5);
  }
}
cvs.addEventListener('pointerup', endPointer);
cvs.addEventListener('pointercancel', endPointer);

// keys tilt the room
const keys = new Set();
function applyGravity() {
  let gx = 0, gy = 1;
  if (keys.has('ArrowLeft')) gx -= 0.85;
  if (keys.has('ArrowRight')) gx += 0.85;
  if (keys.has('ArrowUp')) gy = -1;
  if (keys.has('ArrowDown')) gy = 1.6;
  if (gx && gy === 1) gy = 0.55;
  setGravity(gx, gy);
}
function setGravity(x, y) {
  if (!world) return;
  const nx = x * L.g, ny = y * L.g;
  if (Math.abs(nx - world.gx) + Math.abs(ny - world.gy) > 1) { world.gx = nx; world.gy = ny; world.wakeAll(); }
}
addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeCard(); return; }
  if (reduce || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 't' || e.key === 'T') { startTidy(); return; }
  if (e.key.startsWith('Arrow') && !card.contains(document.activeElement)) {
    e.preventDefault();
    if (!keys.has(e.key)) { keys.add(e.key); applyGravity(); dismissHint(); }
  }
});
addEventListener('keyup', e => { if (keys.delete(e.key)) applyGravity(); });
addEventListener('blur', () => { keys.clear(); applyGravity(); });

// phone tilt
let tiltOn = false;
const tg = { x: 0, y: 1 };
function onOrient(e) {
  if (e.beta == null) return;
  const x = Math.sin((e.gamma || 0) * Math.PI / 180), y = Math.sin(e.beta * Math.PI / 180);
  const ang = ((screen.orientation && screen.orientation.angle) ?? window.orientation ?? 0) * Math.PI / 180;
  const rx = x * Math.cos(ang) + y * Math.sin(ang), ry = -x * Math.sin(ang) + y * Math.cos(ang);
  tg.x += (rx - tg.x) * 0.25; tg.y += (ry - tg.y) * 0.25;
  let gx = tg.x, gy = tg.y; const m = Math.hypot(gx, gy);
  if (m < 0.35) gy += 0.35 - m;
  setGravity(gx * 1.1, gy * 1.1);
}
if ('DeviceOrientationEvent' in window && matchMedia('(pointer: coarse)').matches && !reduce) {
  tiltBtn.hidden = false;
  tiltBtn.addEventListener('click', async () => {
    if (tiltOn) { tiltOn = false; removeEventListener('deviceorientation', onOrient); setGravity(0, 1); tiltBtn.setAttribute('aria-pressed', 'false'); return; }
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') return;
      }
      tiltOn = true; addEventListener('deviceorientation', onOrient); tiltBtn.setAttribute('aria-pressed', 'true');
    } catch (_) { /* not allowed: keep normal gravity */ }
  });
}

// ---------------------------------------------------------------- sound (off until asked)
let actx = null, soundOn = false, lastSnd = 0;
function ensureAudio(create) {
  if (!actx && create) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx && actx.state === 'suspended') actx.resume();
}
soundBtn.addEventListener('click', () => {
  soundOn = !soundOn; if (soundOn) ensureAudio(true);
  soundBtn.setAttribute('aria-pressed', String(soundOn));
  document.getElementById('sound-lbl').textContent = soundOn ? 'Sound on' : 'Sound off';
  soundBtn.querySelector('.on').setAttribute('opacity', soundOn ? '1' : '0');
  soundBtn.querySelector('.off').setAttribute('opacity', soundOn ? '0' : '1');
  if (soundOn) blip(toys[0], 0.6);
});
function blip(b, vol) {
  if (!soundOn || !actx || !b || !b.spec) return;
  const now = actx.currentTime;
  if (now - lastSnd < 0.022) return; lastSnd = now;
  const mat = b.spec.kind === 'letter' ? 'wood' : b.spec.mat;
  const base = mat === 'rubber' ? 170 : mat === 'felt' ? 140 : mat === 'book' ? 260 : ['enamel', 'nut', 'gear', 'button'].includes(mat) ? 760 : 520;
  const f = base * clamp(60 / b.boundR, 0.55, 1.8);
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = mat === 'rubber' ? 'sine' : 'triangle';
  o.frequency.setValueAtTime(f, now); o.frequency.exponentialRampToValueAtTime(f * (mat === 'rubber' ? 0.6 : 0.82), now + 0.09);
  const v = 0.22 * vol;
  g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(v, now + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, now + (mat === 'felt' ? 0.05 : 0.14));
  o.connect(g).connect(actx.destination); o.start(now); o.stop(now + 0.18);
  const len = Math.floor(actx.sampleRate * 0.02), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  const n = actx.createBufferSource(), bp = actx.createBiquadFilter(), ng = actx.createGain();
  n.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = f * 3; bp.Q.value = 2; ng.gain.value = v * 0.8;
  n.connect(bp).connect(ng).connect(actx.destination); n.start(now);
}
function onImpact(A, B, speed, c) {
  const b = A.isStatic ? B : A;
  if (speed > 700 && puffs.length < 80) {
    const n = Math.min(7, Math.floor(speed / 300));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI;
      puffs.push({ x: c.px, y: c.py, vx: Math.cos(a) * (60 + Math.random() * 120) * (Math.random() < 0.5 ? -1 : 1), vy: -Math.random() * 90 - 20,
        r: 1.5 + Math.random() * 2.5, life: 0.6 + Math.random() * 0.4, c: Math.random() < 0.5 ? 'rgba(255,240,215,1)' : 'rgba(246,196,69,1)' });
    }
  }
  blip(b, clamp((speed - 260) / 1800, 0.08, 1));
}

// ---------------------------------------------------------------- cards
function openFor(b) {
  const s = b.spec;
  if (s.kind === 'letter') { if (!reduce) { b.wake(); b.vy -= 420; b.w += (Math.random() < 0.5 ? -1 : 1) * 5; } return; }
  cardBody.replaceChildren();
  if (s.kind === 'contact') {
    cardBody.append(
      h('div', { class: 'kicker' }, h('span', { class: 'dot', style: { background: '#F6C445' } }), 'Contact'),
      h('h2', { id: 'card-title' }, 'Say hello'),
      h('p', {}, 'Open to AI roles · remote or on-site in Germany.'),
      h('div', { class: 'clinks' },
        h('a', { href: 'mailto:vamsi@vamsivenkatesh.com' }, 'vamsi@vamsivenkatesh.com', h('span', { 'aria-hidden': 'true' }, '→')),
        h('a', { href: 'https://www.linkedin.com/in/vamsivenkatesh', rel: 'me' }, 'LinkedIn', h('span', { 'aria-hidden': 'true' }, '↗')),
        h('a', { href: 'https://github.com/vamsi-venkatesh', rel: 'me' }, 'GitHub', h('span', { 'aria-hidden': 'true' }, '↗'))));
  } else {
    const p = BY[s.slug];
    cardBody.append(
      h('div', { class: 'kicker' }, h('span', { class: 'dot', style: { background: p.color } }), `${p.kind} · ${p.status}`),
      h('h2', { id: 'card-title' }, p.name),
      h('p', {}, p.one),
      h('dl', { class: 'nums' }, p.numbers.map(([n, l]) => h('div', {}, h('dt', {}, n), h('dd', {}, l)))),
      h('a', { class: 'go', href: workURL(p.slug) }, 'See the work ', h('span', { 'aria-hidden': 'true' }, '→')));
  }
  card.hidden = false;
  const cw = card.offsetWidth, ch = card.offsetHeight;
  let x = b.x + b.boundR + 18, ox = '0%';
  if (x + cw > W - 16) { x = b.x - b.boundR - 18 - cw; ox = '100%'; }
  if (x < 16) x = clamp(b.x - cw / 2, 16, W - cw - 16);
  const y = clamp(b.y - ch / 2, 16, H - L.floorH - ch - 10);
  card.style.left = x + 'px'; card.style.top = y + 'px';
  card.style.setProperty('--ox', ox); card.style.setProperty('--oy', '50%');
  card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
  dismissHint();
}
function closeCard() { card.hidden = true; }
document.getElementById('card-x').addEventListener('click', closeCard);
tidyBtn.addEventListener('click', () => { if (!reduce) startTidy(); });
if (reduce) {
  tidyBtn.hidden = true;
  hint.textContent = 'Click a toy to open it';
  document.getElementById('mhint').textContent = 'Tap a toy to open it.';
} else if (!tiltBtn.hidden) {
  document.getElementById('mhint').textContent = 'Drag, fling and stack. Double-tap a toy to open it. Tilt the phone (top-right button) to move gravity.';
}

// accessible list of the work (keyboard focus opens the matching toy's card)
const list = document.getElementById('work-list');
list.append(...PRODUCTS.map(p => h('li', {}, h('a', { class: 'sr-focus', href: workURL(p.slug), 'data-slug': p.slug }, `${p.name}: ${p.one}`))));
list.addEventListener('focusin', e => { const a = e.target.closest('a'); if (!a) return; const b = toys.find(t => t.spec.slug === a.dataset.slug); if (b) openFor(b); });

let hintGone = false;
function dismissHint() {
  if (hintGone) return; hintGone = true;
  setTimeout(() => { hint.style.opacity = '0.5'; }, 2500);
}

// ---------------------------------------------------------------- boot
let rt = null;
addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    if (window.innerWidth === W && window.innerHeight === H) return;
    closeCard(); tidy = null; pointers.clear(); build(); placeAtTargets(); if (reduce) render();
  }, 180);
});

async function boot() {
  try {
    await Promise.race([
      Promise.all([document.fonts.load('400 60px "Bagel Fat One"'), document.fonts.load('800 20px "Bricolage Grotesque"')]),
      new Promise(r => setTimeout(r, 1200)),
    ]);
  } catch (_) { /* fall back to system fonts */ }
  build();
  if (reduce) { placeAtTargets(); render(); }
  else { startIntro(); requestAnimationFrame(tick); }
  document.fonts.ready.then(() => { if (toys.length) { buildSprites(); if (reduce) render(); } });
  window.__toy = { world: () => world, toys: () => toys, L: () => L, tidy: startTidy };
}
boot();
