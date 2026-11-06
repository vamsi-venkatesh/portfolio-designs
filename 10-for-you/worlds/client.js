// World: client — "The Fabricator" (full site). Serves audiences 'client' (a business), 'found' (a founder) and
// 'product' (hiring an AI product builder). The whole website lives on one drafting table:
//   arrival  — the visitor's words head the sheet; ink draws how it would be built; it rises into a paper-and-brass
//              model (brass = parts Vamsi has really built, linked to those products)
//   #work    — the eight products as finished models on the table; each opens #work/<slug>, a full drawing set
//              (problem, constraints, assembly, the drawn flow, revision notes, test stamps, dimensions, parts
//              list, margin notes) while its flow is drafted and raised on the table
//   #principles, #withdrawn, #capabilities, #about, #contact — further sheets, each with its own model
// Only facts from content.mjs. Text via textContent only.
import * as THREE from '../../vendor/three.module.js';

const INK = '#1c3460';
const PAPER_BG = '#ecdcbf';
const RED = '#a8432c';

const PRODUCT_BP = {
  title: 'From an idea to a shipped, trusted product',
  nodes: [
    { id: 'idea', label: 'The problem, written down', shape: 'doc', slug: null, c: 0, r: 1,
      how: 'Start from the problem and the outcome it needs, written down before anything is built.' },
    { id: 'ag', label: 'Agents on one memory', shape: 'rect', slug: 'conxto', c: 1, r: 0,
      how: 'Specialist agents and reviewers working over one persistent memory per account.' },
    { id: 'true', label: 'Every line proven', shape: 'diamond', slug: 'conxto', c: 1, r: 2,
      how: 'Every rewritten line is checked against the original résumé, and anything that claims more is reverted.' },
    { id: 'test', label: 'Hidden tests decide', shape: 'rect', slug: 'vvdex-platform', c: 2, r: 0,
      how: 'Models and agents are given real work in a sealed sandbox, and hidden tests they cannot reach decide.' },
    { id: 'rule', label: 'Runs by written rules', shape: 'circle', slug: 'vvdex-engine', c: 2, r: 2,
      how: 'Every action either runs by itself, waits for your person, or never happens.' },
    { id: 'gate', label: 'A release gate', shape: 'diamond', slug: 'unboundpdf', c: 3, r: 1,
      how: 'On every deploy: a tool audit in three browser engines and a checksum sweep of every served file.' },
    { id: 'seal', label: 'A receipt per run', shape: 'cyl', slug: 'vvdex-platform', c: 4, r: 1,
      how: 'Every run is signed, so anyone can check a receipt.' },
  ],
  edges: [['idea', 'ag'], ['idea', 'true'], ['ag', 'test'], ['true', 'rule'], ['test', 'gate'], ['rule', 'gate'], ['gate', 'seal']],
};

function pickBlueprint(text, audience) {
  const t = (text || '').toLowerCase();
  if (audience === 'product') return 'product';
  if (audience === 'found' || /\bfounder|\bstartup|start-up|co-?found/.test(t)) return 'found';
  if (/event|festival|food ?truck|\bvendor|\bstall|catering|\bfair\b|markets?\b/.test(t)) return 'events';
  if (/restaurant|caf[eé]|kitchen|takeaway|pizza|\bmenu|\bbar\b|deliver|\borders?\b|bistro|imbiss/.test(t)) return 'orders';
  if (/\bshop|store|\bsell|e-?commerce|bakery|online|catalog|produce|wholesale|products?\b/.test(t)) return 'shop';
  if (/\blead|sales|customers?\b|clients?\b|buyers?\b|prospect|marketing|grow/.test(t)) return 'leads';
  return 'automation';
}

// short part names for the non-flagship products (taken from their own "built" lines in content.mjs)
const SHORT_BUILT = {
  farmquick: ['The ordering site', 'Order → register → report', 'Lead Desk'],
  conxfolio: ['37 résumé designs', 'One résumé parser', 'Publish a portfolio'],
  pitchradar: ['Seven agents', 'A deterministic core', 'Contacts, never guessed'],
  'vvdex-trading': ['Hash-chained calls', 'Paper only', 'Thresholds set in advance'],
};
const SHELF_SHAPE = { conxto: 'circle', 'vvdex-engine': 'rect', 'vvdex-platform': 'cyl', unboundpdf: 'doc', farmquick: 'rect', conxfolio: 'doc', pitchradar: 'diamond', 'vvdex-trading': 'cyl' };
const SECTIONS = [
  ['', '01', 'The brief'], ['work', '02', 'Work'], ['principles', '03', 'How I work'], ['withdrawn', '04', 'Claims I withdrew'],
  ['capabilities', '05', 'Capabilities'], ['about', '06', 'About'], ['contact', '07', 'Contact'],
];

const BLUEPRINTS = {
  shop: {
    title: 'An online shop that takes real orders',
    nodes: [
      { id: 'cat', label: 'Your catalogue', shape: 'doc', slug: 'farmquick', c: 0, r: 0,
        how: 'What you sell, with prices and photos, kept in one place that the shop reads from.' },
      { id: 'ord', label: 'Buyers order', shape: 'rect', slug: 'farmquick', c: 1, r: 0,
        how: 'A shop that works on a phone first: browse the catalogue, ask for a bulk quote, place an order.' },
      { id: 'lead', label: 'Finds the next buyer', shape: 'rect', slug: 'farmquick', c: 1, r: 1,
        how: 'An agent that reads open sources each morning and scores possible buyers by rules written down in plain words.' },
      { id: 'ok', label: 'A person confirms', shape: 'circle', slug: 'farmquick', c: 2, r: 0,
        how: 'Nothing moves until you, or someone you choose, confirms the order.' },
      { id: 'rule', label: 'Your rules', shape: 'diamond', slug: 'vvdex-engine', c: 2, r: 1,
        how: 'Said in your own words: what runs by itself, what waits for you, and what never happens.' },
      { id: 'you', label: 'Order reaches you', shape: 'rect', slug: 'farmquick', c: 3, r: 0,
        how: 'Each confirmed order lands with you, ready to prepare, and is recorded.' },
      { id: 'reg', label: 'Buyer register', shape: 'cyl', slug: 'farmquick', c: 3, r: 1,
        how: 'Every order becomes a won buyer in one register, so you can see who came back.' },
      { id: 'rep', label: 'Weekly report', shape: 'doc', slug: 'farmquick', c: 4, r: 0,
        how: 'One page each week: what was ordered, by whom, and what is waiting.' },
    ],
    edges: [['cat', 'ord'], ['lead', 'ord'], ['ord', 'ok'], ['rule', 'ok'], ['ok', 'you'], ['you', 'reg'], ['you', 'rep']],
  },
  orders: {
    title: 'Orders handled, with a person in charge',
    nodes: [
      { id: 'in', label: 'Orders come in', shape: 'rect', slug: 'farmquick', c: 0, r: 0,
        how: 'Guests order from a page that works on a phone; every order arrives in one place.' },
      { id: 'rule', label: 'Your rules', shape: 'diamond', slug: 'vvdex-engine', c: 0, r: 1,
        how: 'Said in your own words: what runs by itself, what waits for you, and what never happens.' },
      { id: 'ok', label: 'A person confirms', shape: 'circle', slug: 'farmquick', c: 1, r: 0,
        how: 'Nothing is accepted or sent until you, or someone you choose, confirms it.' },
      { id: 'kit', label: 'Kitchen list', shape: 'rect', slug: null, c: 2, r: 0,
        how: 'Confirmed orders become one clear list for the kitchen, in the order they are due.' },
      { id: 'chk', label: 'A second check', shape: 'rect', slug: 'vvdex-engine', c: 2, r: 1,
        how: 'An independent reviewer looks at every result before it counts.' },
      { id: 'rep', label: 'Weekly report', shape: 'doc', slug: 'farmquick', c: 3, r: 0,
        how: 'One page each week: what was ordered, what was confirmed, what is waiting.' },
      { id: 'proof', label: 'Proof of every run', shape: 'cyl', slug: 'vvdex-engine', c: 3, r: 1,
        how: 'Every run is sealed as evidence, so you can always see what happened and why.' },
    ],
    edges: [['in', 'ok'], ['rule', 'ok'], ['ok', 'kit'], ['kit', 'rep'], ['rule', 'chk'], ['chk', 'proof'], ['kit', 'chk']],
  },
  events: {
    title: 'The right events, ranked for you',
    nodes: [
      { id: 'src', label: 'Public event sources', shape: 'rect', slug: 'pitchradar', c: 0, r: 0,
        how: 'Listings, organiser pages and deadlines, collected from public sources.' },
      { id: 'said', label: 'What each one said', shape: 'doc', slug: 'pitchradar', c: 1, r: 0,
        how: 'The evidence for every event is kept, so every line in your brief can be checked.' },
      { id: 'con', label: 'Contacts, never guessed', shape: 'circle', slug: 'pitchradar', c: 1, r: 1,
        how: 'Contacts come from what organisers publish, never from a guess.' },
      { id: 'rank', label: 'Ranked by written rules', shape: 'diamond', slug: 'pitchradar', c: 2, r: 0,
        how: 'A score you can read line by line. No model decides the score.' },
      { id: 'dl', label: 'Deadlines and weather', shape: 'rect', slug: 'pitchradar', c: 2, r: 1,
        how: 'Application deadlines and the forecast, checked for every event worth going to.' },
      { id: 'brief', label: 'One brief for you', shape: 'doc', slug: 'pitchradar', c: 3, r: 0,
        how: 'One brief, with the evidence behind every line, so the week is easy to decide.' },
    ],
    edges: [['src', 'said'], ['said', 'rank'], ['rank', 'brief'], ['src', 'con'], ['con', 'dl'], ['dl', 'brief']],
  },
  leads: {
    title: 'New customers, found every morning',
    nodes: [
      { id: 'src', label: 'Open sources, each morning', shape: 'rect', slug: 'farmquick', c: 0, r: 0,
        how: 'An agent reads open sources in your area every morning for people who might buy from you.' },
      { id: 'score', label: 'Scored by written rules', shape: 'diamond', slug: 'farmquick', c: 1, r: 0,
        how: 'Each lead is scored by rules you can read; a model is used only where the rules cannot answer.' },
      { id: 'ok', label: 'A person confirms', shape: 'circle', slug: 'farmquick', c: 2, r: 0,
        how: 'Nothing goes out until you approve it.' },
      { id: 'msg', label: 'Message you approved', shape: 'rect', slug: 'farmquick', c: 3, r: 0,
        how: 'WhatsApp or email is sent only after you say yes.' },
      { id: 'reg', label: 'Lead register', shape: 'cyl', slug: 'farmquick', c: 2, r: 1,
        how: 'Every lead, and what happened to it, in one register.' },
      { id: 'rep', label: 'Weekly report', shape: 'doc', slug: 'farmquick', c: 3, r: 1,
        how: 'One page each week: who was found, who was contacted, who ordered.' },
    ],
    edges: [['src', 'score'], ['score', 'ok'], ['ok', 'msg'], ['ok', 'reg'], ['reg', 'rep'], ['msg', 'rep']],
  },
  automation: {
    title: 'Your work, as a service that runs by your rules',
    nodes: [
      { id: 'para', label: 'Your paragraph', shape: 'doc', slug: 'vvdex-engine', c: 0, r: 1,
        how: 'You describe the work in one paragraph, in your own words.' },
      { id: 'con', label: 'Service contract', shape: 'rect', slug: 'vvdex-engine', c: 1, r: 1,
        how: 'The paragraph becomes a contract: inputs, facts, rules and outcomes.' },
      { id: 'self', label: 'Runs by itself', shape: 'rect', slug: 'vvdex-engine', c: 2, r: 0,
        how: 'The parts you are happy to let run, run on their own.' },
      { id: 'wait', label: 'Waits for you', shape: 'circle', slug: 'vvdex-engine', c: 2, r: 1,
        how: 'The parts that need a person wait for your person.' },
      { id: 'never', label: 'Never happens', shape: 'diamond', slug: 'vvdex-engine', c: 2, r: 2,
        how: 'What you rule out stays ruled out. Incoming content is never treated as an instruction.' },
      { id: 'rev', label: 'Independent reviewer', shape: 'rect', slug: 'vvdex-engine', c: 3, r: 1,
        how: 'A separate reviewer checks every result.' },
      { id: 'seal', label: 'Sealed evidence', shape: 'cyl', slug: 'vvdex-engine', c: 4, r: 1,
        how: 'Every run is sealed, so you can see what ran and why.' },
    ],
    edges: [['para', 'con'], ['con', 'self'], ['con', 'wait'], ['con', 'never'], ['self', 'rev'], ['wait', 'rev'], ['rev', 'seal']],
  },
  found: {
    title: 'A product with agents, rules and proof',
    nodes: [
      { id: 'out', label: 'The outcome you want', shape: 'doc', slug: null, c: 0, r: 1,
        how: 'Start from what should exist for your users, written down as an outcome.' },
      { id: 'ag', label: 'Agents, one memory', shape: 'rect', slug: 'conxto', c: 1, r: 0,
        how: 'Specialist agents and reviewers working over one persistent memory.' },
      { id: 'rule', label: 'Rules from your words', shape: 'diamond', slug: 'vvdex-engine', c: 1, r: 2,
        how: 'What runs by itself, what waits for a person, and what never happens.' },
      { id: 'send', label: 'A person sends', shape: 'circle', slug: 'conxto', c: 2, r: 0,
        how: 'The send stays human: a person approves what reaches a user.' },
      { id: 'test', label: 'Hidden tests decide', shape: 'rect', slug: 'vvdex-platform', c: 2, r: 2,
        how: 'Agents are graded on real work, by tests they cannot reach.' },
      { id: 'proof', label: 'A receipt per run', shape: 'cyl', slug: 'vvdex-platform', c: 3, r: 1,
        how: 'Every run signed, so anyone can check the result.' },
    ],
    edges: [['out', 'ag'], ['out', 'rule'], ['ag', 'send'], ['rule', 'test'], ['send', 'proof'], ['test', 'proof']],
  },
};


// ───────────────────────────── small helpers ─────────────────────────────
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeOutBack = (x, s = 1.5) => { x = clamp(x); const c3 = s + 1; return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

// 2D footprint outlines (x,z) for each shape, closed polylines
function outline(shape, w, d) {
  const pts = [];
  if (shape === 'rect') {
    const r = 0.1, hw = w / 2, hd = d / 2, n = 6;
    const corners = [[hw - r, -hd + r, -Math.PI / 2], [hw - r, hd - r, 0], [-hw + r, hd - r, Math.PI / 2], [-hw + r, -hd + r, Math.PI]];
    for (const [cx, cz, a0] of corners) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); }
  } else if (shape === 'diamond') {
    pts.push([0, -d / 2], [w / 2, 0], [0, d / 2], [-w / 2, 0]);
  } else if (shape === 'circle' || shape === 'cyl') {
    const r = Math.min(w, d) / 2 * 1.22, n = 48;
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
  } else if (shape === 'doc') {
    const hw = w / 2, hd = d / 2;
    pts.push([-hw, -hd], [hw, -hd], [hw, hd - 0.08]);
    const n = 20;
    for (let i = 1; i <= n; i++) { const u = i / n; const x = hw - u * w; pts.push([x, hd - 0.08 + Math.sin(u * Math.PI * 2) * 0.09]); }
  }
  return pts;
}
function halfExtent(shape, w, d) {
  if (shape === 'circle' || shape === 'cyl') { const r = Math.min(w, d) / 2 * 1.22; return [r, r]; }
  return [w / 2, d / 2];
}

// Ribbon geometry: flat ink strokes on the paper with an "along" attribute for the drawing reveal.
function ribbonGeometry(strokes, width, y) {
  // strokes: [{pts:[[x,z]...], closed, offset}] ; returns geometry + total length
  const pos = [], along = [], idx = [];
  let total = 0, base = 0;
  for (const s of strokes) {
    const p = s.closed ? [...s.pts, s.pts[0]] : s.pts;
    let acc = s.offset != null ? s.offset : total;
    for (let i = 0; i < p.length - 1; i++) {
      const [x0, z0] = p[i], [x1, z1] = p[i + 1];
      const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz) || 1e-6;
      const ux = dx / L, uz = dz / L, nx = -uz * width / 2, nz = ux * width / 2, e = width / 2;
      const ax = x0 - ux * e, az = z0 - uz * e, bx = x1 + ux * e, bz = z1 + uz * e;
      pos.push(ax + nx, y, az + nz, ax - nx, y, az - nz, bx + nx, y, bz + nz, bx - nx, y, bz - nz);
      along.push(acc, acc, acc + L, acc + L);
      idx.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
      base += 4; acc += L;
    }
    total = Math.max(total, acc);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('along', new THREE.Float32BufferAttribute(along, 1));
  g.setIndex(idx);
  return { geometry: g, length: total };
}
function inkMaterial(color, opacity) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uProg: { value: 0 }, uColor: { value: new THREE.Color(color) }, uHot: { value: new THREE.Color('#ffb347') }, uHeat: { value: 0 }, uOpacity: { value: opacity } },
    vertexShader: 'attribute float along; varying float vA; void main(){ vA = along; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform float uProg; uniform vec3 uColor; uniform vec3 uHot; uniform float uHeat; uniform float uOpacity; varying float vA;' +
      'void main(){ if (vA > uProg) discard; float tip = smoothstep(0.35, 0.0, uProg - vA); vec3 c = mix(uColor, uHot, clamp(uHeat + tip*0.85, 0.0, 1.0));' +
      ' gl_FragColor = vec4(c, uOpacity * (1.0 + uHeat*0.4)); }',
  });
}

function makeShape(pts) {
  const s = new THREE.Shape();
  pts.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z)));
  s.closePath();
  return s;
}

// ───────────────────────────── canvas textures ─────────────────────────────
function paperTexture(PW, PD, maxAniso) {
  const W = 2048, H = Math.round(2048 * PD / PW);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const k = W / PW;
  const grd = g.createRadialGradient(W * 0.4, H * 0.35, 50, W * 0.5, H * 0.5, W * 0.75);
  grd.addColorStop(0, '#fbf5e8'); grd.addColorStop(1, '#f0e4cc');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  // paper fibres
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * W, y = rnd() * H, a = rnd() * Math.PI, l = 3 + rnd() * 9;
    g.strokeStyle = rnd() < 0.5 ? 'rgba(150,120,80,0.07)' : 'rgba(255,255,255,0.25)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // grid
  const m = 0.42 * k;
  for (let gx = 0; gx * 0.25 * k < W; gx++) {
    const x = gx * 0.25 * k; if (x < m || x > W - m) continue;
    g.strokeStyle = gx % 4 === 0 ? 'rgba(50,90,160,0.16)' : 'rgba(50,90,160,0.07)'; g.lineWidth = gx % 4 === 0 ? 1.4 : 1;
    g.beginPath(); g.moveTo(x, m); g.lineTo(x, H - m); g.stroke();
  }
  for (let gy = 0; gy * 0.25 * k < H; gy++) {
    const y = gy * 0.25 * k; if (y < m || y > H - m) continue;
    g.strokeStyle = gy % 4 === 0 ? 'rgba(50,90,160,0.16)' : 'rgba(50,90,160,0.07)'; g.lineWidth = gy % 4 === 0 ? 1.4 : 1;
    g.beginPath(); g.moveTo(m, y); g.lineTo(W - m, y); g.stroke();
  }
  // double border frame + registration marks
  g.strokeStyle = 'rgba(28,52,96,0.75)'; g.lineWidth = 4; g.strokeRect(m, m, W - 2 * m, H - 2 * m);
  g.lineWidth = 1.5; g.strokeRect(m + 12, m + 12, W - 2 * m - 24, H - 2 * m - 24);
  g.lineWidth = 2;
  for (const [x, y] of [[m / 2, m / 2], [W - m / 2, m / 2], [m / 2, H - m / 2], [W - m / 2, H - m / 2]]) {
    g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.moveTo(x - 24, y); g.lineTo(x + 24, y); g.moveTo(x, y - 24); g.lineTo(x, y + 24); g.stroke();
  }
  // zone ticks along the frame
  g.fillStyle = 'rgba(28,52,96,0.6)'; g.font = '600 22px "Barlow Condensed", sans-serif'; g.textAlign = 'center';
  const zones = 'ABCDEFGHJK';
  const nz = Math.max(4, Math.round(PW / 2.2));
  for (let i = 0; i < nz; i++) {
    const x = m + (i + 0.5) * (W - 2 * m) / nz; g.fillText(String(i + 1), x, m - 14);
    if (i) { const xx = m + i * (W - 2 * m) / nz; g.fillRect(xx - 1, m - 10, 2, 10); }
  }
  const nzy = Math.max(3, Math.round(PD / 2.2));
  for (let i = 0; i < nzy; i++) { const y = m + (i + 0.5) * (H - 2 * m) / nzy; g.fillText(zones[i % zones.length], m / 2, y + 8); }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso;
  return t;
}
function woodTexture() {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1024;
  const g = cv.getContext('2d');
  g.fillStyle = '#cdae86'; g.fillRect(0, 0, 1024, 1024);
  let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 260; i++) {
    const y = rnd() * 1024, a = 0.02 + rnd() * 0.05;
    g.strokeStyle = rnd() < 0.5 ? `rgba(120,80,40,${a})` : `rgba(255,230,190,${a})`;
    g.lineWidth = 0.6 + rnd() * 2.4; g.beginPath();
    for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 6);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(9, 9);
  return t;
}
function windowCookie() {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512;
  const g = cv.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512);
  g.filter = 'blur(14px)';
  g.fillStyle = '#fff';
  const cols = 3, rows = 3, pad = 60, gap = 22;
  const cw = (512 - pad * 2 - gap * (cols - 1)) / cols, rh = (512 - pad * 2 - gap * (rows - 1)) / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) g.fillRect(pad + i * (cw + gap), pad + j * (rh + gap), cw, rh);
  // a soft fill so mullion shadows are gentle, not black
  g.filter = 'blur(40px)'; g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(pad - 20, pad - 20, 512 - 2 * pad + 40, 512 - 2 * pad + 40);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function glowTexture() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,252,235,1)'); r.addColorStop(0.18, 'rgba(255,214,140,0.85)'); r.addColorStop(0.5, 'rgba(255,170,70,0.22)'); r.addColorStop(1, 'rgba(255,150,50,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ───────────────────────────── styles ─────────────────────────────
const CSS = `
.fab{position:absolute;inset:0;overflow:hidden;background:${PAPER_BG};color:${INK};font-family:'Barlow Condensed',sans-serif;-webkit-font-smoothing:antialiased}
.fab canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab}
.fab canvas.drag{cursor:grabbing}
.fab a{color:inherit}
.fab-head{position:absolute;left:clamp(16px,4vw,56px);right:clamp(16px,4vw,56px);top:92px;z-index:3;pointer-events:none;max-width:1100px;transition:opacity .6s ease,transform .6s ease}
.fab.sheet .fab-head{opacity:0;transform:translateY(-12px);visibility:hidden;transition:opacity .4s ease,transform .4s ease,visibility 0s .4s}
.fab-kick{font-weight:600;font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:rgba(28,52,96,.72);display:flex;align-items:center;gap:10px}
.fab-kick::before{content:'';width:28px;height:1.5px;background:currentColor;display:inline-block}
.fab-quote{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;font-size:clamp(28px,3.5vw,54px);line-height:1.04;margin:.18em 0 0;color:#16294d;letter-spacing:-.005em;max-width:24ch;text-wrap:balance}
.fab-quote span{opacity:0;transition:opacity .35s ease}
.fab-quote span.on{opacity:1}
.fab-sub{font-family:'Instrument Serif',serif;font-size:clamp(17px,1.5vw,22px);line-height:1.3;margin:.55em 0 0;max-width:46ch;opacity:0;transform:translateY(6px);transition:opacity .9s ease,transform .9s ease;color:#24365a}
.fab-sub.on{opacity:1;transform:none}
.fab-sub a{color:#8a5a12;text-decoration:none;border-bottom:1px solid rgba(138,90,18,.45);pointer-events:auto}
.fab-sub a:hover{border-bottom-color:#8a5a12}
.fab-sub .brass,.fab-brass{display:inline-block;width:.8em;height:.55em;background:linear-gradient(135deg,#f0cf86,#b07d2c 55%,#7c5317);vertical-align:.05em;margin-right:.3em;border-radius:1px}
.fab-labels{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;contain:strict}
.fab-label{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;border:0;background:none;padding:4px 7px 5px;margin:0;font:inherit;color:${INK};text-align:center;
  opacity:0;transition:opacity .6s ease,background-color .5s ease,box-shadow .5s ease;white-space:nowrap;will-change:transform}
.fab-label.on{opacity:1}
.fab-label .n{display:block;font-weight:600;font-size:14px;letter-spacing:.09em;text-transform:uppercase;line-height:1.05}
.fab-label .p{display:block;font-family:'Instrument Serif',serif;font-style:italic;font-size:15px;letter-spacing:0;color:#8a5a12;line-height:1.1;margin-top:1px}
.fab-label.struck .n{text-decoration:line-through;text-decoration-color:${RED};text-decoration-thickness:2px}
.fab-label.struck .p{color:${RED}}
.fab-label.up{background:rgba(251,246,235,.9);box-shadow:0 0 0 1px rgba(28,52,96,.35),0 6px 18px -8px rgba(60,40,10,.35)}
.fab-label.dim{opacity:.35}
.fab-label.off,.fab-label.gone{opacity:0!important;pointer-events:none}
.fab-label:hover,.fab-label.hot{background:#fffaf0;box-shadow:0 0 0 1.5px #b07d2c,0 8px 22px -8px rgba(120,80,20,.5)}
.fab-label:focus-visible{outline:2px solid #b07d2c;outline-offset:2px}
.fab.split .fab-head{right:auto;width:min(33vw,500px)}
.fab.split .fab-quote{font-size:clamp(30px,3.1vw,48px)}
.fab.split .fab-sub{font-size:clamp(16px,1.3vw,20px)}
.fab-block{position:absolute;left:clamp(16px,3vw,40px);bottom:clamp(16px,3vh,32px);z-index:3;width:min(400px,calc(100% - 32px));background:rgba(250,244,231,.95);
  border:1.5px solid rgba(28,52,96,.8);box-shadow:inset 0 0 0 3px rgba(250,244,231,.94),inset 0 0 0 4px rgba(28,52,96,.35),0 18px 40px -24px rgba(70,45,10,.45);
  opacity:0;transform:translateY(10px);transition:opacity .9s ease,transform .9s ease,visibility 0s}
.fab-block.on{opacity:1;transform:none}
.fab.sheet .fab-block{opacity:0;visibility:hidden;transform:translateY(16px);transition:opacity .4s ease,transform .4s ease,visibility 0s .4s}
.fab-row{display:grid;grid-template-columns:82px 1fr;border-bottom:1px solid rgba(28,52,96,.28);font-size:13px;line-height:1.25}
.fab-row b{font-weight:600;letter-spacing:.14em;text-transform:uppercase;font-size:11px;padding:7px 10px;border-right:1px solid rgba(28,52,96,.28);color:rgba(28,52,96,.75)}
.fab-row span{padding:6px 10px;font-size:14px;letter-spacing:.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fab-row.sheets span{white-space:normal;line-height:1.5}
.fab-row.sheets a{display:inline-block;text-decoration:none;border-bottom:1px solid rgba(28,52,96,.3);margin-right:9px;white-space:nowrap}
.fab-row.sheets a:hover{color:#8a5a12;border-bottom-color:#8a5a12}
.fab-cta{display:block;padding:12px 12px 10px;font-family:'Instrument Serif',serif;font-size:27px;line-height:1.05;color:#16294d;text-decoration:none;position:relative}
.fab-cta i{font-style:italic}
.fab-cta::after{content:'';position:absolute;left:12px;right:12px;bottom:6px;height:2px;background:linear-gradient(90deg,#b07d2c,#f0cf86 40%,#b07d2c);transform:scaleX(.18);transform-origin:left;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.fab-cta:hover::after,.fab-cta:focus-visible::after{transform:scaleX(1)}
.fab-contacts{display:flex;gap:16px;padding:6px 12px 10px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-weight:500;border-top:1px solid rgba(28,52,96,.28)}
.fab-contacts a{color:${INK};text-decoration:none;opacity:.8}
.fab-contacts a:hover{opacity:1;color:#8a5a12}
.fab-hint{position:absolute;left:50%;bottom:clamp(14px,2.4vh,26px);transform:translateX(-50%);z-index:3;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,52,96,.62);opacity:0;transition:opacity 1s ease;pointer-events:none;white-space:nowrap}
.fab-hint.on{opacity:1}
.fab.sheet .fab-hint{opacity:0}
/* the sheet index: a plan-chest drawer list, always reachable */
.fab-idxbtn{position:absolute;z-index:6;top:88px;right:clamp(12px,2vw,28px);border:1.5px solid rgba(28,52,96,.8);background:rgba(250,244,231,.95);color:${INK};
  font:600 12px/1 'Barlow Condensed',sans-serif;letter-spacing:.2em;text-transform:uppercase;padding:10px 12px 9px;cursor:pointer;box-shadow:inset 0 0 0 2px rgba(250,244,231,.95),inset 0 0 0 3px rgba(28,52,96,.3)}
.fab-idxbtn b{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;font-size:17px;letter-spacing:0;text-transform:none;margin-left:8px;color:#8a5a12;vertical-align:-1px}
.fab-idxbtn:focus-visible,.fab-idx a:focus-visible,.fab-read a:focus-visible,.fab-read button:focus-visible{outline:2px solid #b07d2c;outline-offset:2px}
.fab-idx{position:absolute;z-index:7;top:128px;right:clamp(12px,2vw,28px);width:min(330px,calc(100% - 24px));max-height:calc(100% - 150px);overflow:auto;background:#fbf6ea;
  border:1.5px solid rgba(28,52,96,.85);box-shadow:inset 0 0 0 4px #fbf6ea,inset 0 0 0 5px rgba(28,52,96,.3),0 30px 60px -30px rgba(70,45,10,.55);
  padding:10px 0;opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .25s ease,transform .25s ease,visibility 0s .25s}
.fab-idx.open{opacity:1;visibility:visible;transform:none;transition:opacity .25s ease,transform .25s ease}
.fab-idx a{display:grid;grid-template-columns:34px 1fr;align-items:baseline;padding:7px 16px;text-decoration:none;color:${INK};font-size:16px;letter-spacing:.04em}
.fab-idx a span{font-weight:600;font-size:12px;letter-spacing:.14em;color:rgba(28,52,96,.6)}
.fab-idx a.cur{color:#8a5a12}
.fab-idx a.cur span{color:#8a5a12}
.fab-idx a:hover{background:rgba(176,125,44,.1)}
.fab-idx a.sub{padding:4px 16px 4px 50px;font-family:'Instrument Serif',serif;font-size:17px;letter-spacing:0;grid-template-columns:1fr}
/* the reading surface: a stack of drawing sheets */
.fab-read{position:absolute;z-index:4;top:140px;right:clamp(12px,2vw,28px);bottom:clamp(12px,2.4vh,24px);width:clamp(440px,42vw,640px);overflow:auto;overscroll-behavior:contain;
  scroll-behavior:smooth;opacity:0;visibility:hidden;transform:translateX(30px);transition:opacity .5s ease,transform .6s cubic-bezier(.2,.8,.2,1),visibility 0s .5s;
  scrollbar-width:thin;scrollbar-color:rgba(28,52,96,.4) transparent;padding:0 6px 0 0}
.fab-read:focus{outline:none}
.fab.sheet .fab-read{opacity:1;visibility:visible;transform:none;transition:opacity .5s ease .15s,transform .7s cubic-bezier(.2,.8,.2,1) .1s}
.fab-sh{position:relative;background-color:#fbf6ea;background-image:linear-gradient(rgba(50,90,160,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(50,90,160,.07) 1px,transparent 1px);
  background-size:18px 18px;border:1.5px solid rgba(28,52,96,.8);box-shadow:inset 0 0 0 4px #fbf6ea,inset 0 0 0 5px rgba(28,52,96,.3),0 24px 40px -30px rgba(70,45,10,.5);
  padding:20px 24px 22px;margin:0 0 14px;color:#24365a}
.fab-sh .strip{display:flex;justify-content:space-between;gap:12px;font-weight:600;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,52,96,.65);
  border-bottom:1px solid rgba(28,52,96,.3);padding-bottom:8px;margin:-4px 0 14px}
.fab-sh h2{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(34px,3vw,46px);line-height:1;margin:2px 0 10px;color:#16294d}
.fab-sh h3{font-family:'Instrument Serif',serif;font-weight:400;font-size:26px;line-height:1.1;margin:0 0 8px;color:#16294d}
.fab-sh p{font-family:'Instrument Serif',serif;font-size:19px;line-height:1.38;margin:0 0 12px}
.fab-sh p.lede{font-size:22px;line-height:1.3;color:#16294d}
.fab-sh .meta{font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:rgba(28,52,96,.78);margin:0 0 12px}
.fab-sh .links{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:4px}
.fab-sh .links a{font-family:'Instrument Serif',serif;font-size:19px;color:#8a5a12;text-decoration:none;border-bottom:1px solid rgba(138,90,18,.45)}
.fab-sh .links a:hover{border-bottom-color:#8a5a12}
.fab-sh ol,.fab-sh ul{margin:0;padding:0;list-style:none}
.fab-sh .num li{display:grid;grid-template-columns:34px 1fr;gap:4px;padding:8px 0;border-bottom:1px dashed rgba(28,52,96,.25);font-size:16.5px;line-height:1.35;letter-spacing:.01em}
.fab-sh .num li>b{font-weight:600;font-size:13px;letter-spacing:.1em;color:#8a5a12;padding-top:2px}
.fab-sh .num li strong{display:block;font-family:'Instrument Serif',serif;font-weight:400;font-size:21px;color:#16294d;letter-spacing:0;margin-bottom:2px}
.fab-sh .num li.hot{background:rgba(240,207,134,.25)}
.fab-sh .num li[data-node]{cursor:pointer}
.fab-rev{border:1px solid rgba(28,52,96,.35);padding:12px 14px 4px;margin:0 0 12px;position:relative;background:rgba(255,255,255,.35)}
.fab-rev .tag{position:absolute;top:-1px;right:-1px;border:1px solid rgba(28,52,96,.6);background:#fbf6ea;font-weight:600;font-size:12px;letter-spacing:.16em;padding:4px 8px}
.fab-rev h3{padding-right:70px;font-size:22px}
.fab-rev p{font-size:17px}
.fab-rev p b{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:rgba(28,52,96,.7);margin-right:6px}
.fab-stamp{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:start;padding:12px 0;border-bottom:1px dashed rgba(28,52,96,.25)}
.fab-stamp .st{border:2px solid ${RED};color:${RED};font-weight:600;font-size:12px;letter-spacing:.14em;text-transform:uppercase;padding:6px 8px 5px;transform:rotate(-4deg);
  text-align:center;line-height:1.25;min-width:84px;opacity:.88;margin-top:4px}
.fab-stamp .st i{display:block;font-style:normal;font-size:15px;letter-spacing:.06em}
.fab-stamp p{font-size:17px;margin:0 0 6px}
.fab-stamp p.res{color:#16294d}
.fab-dim{padding:10px 0 12px;border-bottom:1px dashed rgba(28,52,96,.25)}
.fab-dim .v{font-family:'Instrument Serif',serif;font-size:40px;line-height:1;color:#16294d;display:inline-block;position:relative;padding:0 6px 10px}
.fab-dim .v::after{content:'';position:absolute;left:0;right:0;bottom:2px;height:1px;background:${INK}}
.fab-dim .v::before{content:'';position:absolute;left:0;right:0;bottom:-3px;height:11px;border-left:1px solid ${INK};border-right:1px solid ${INK}}
.fab-dim .l{font-size:16px;line-height:1.35;letter-spacing:.01em;margin-top:6px}
.fab-dim .d{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:rgba(28,52,96,.6);margin-top:2px}
.fab-parts{width:100%;border-collapse:collapse;font-size:16px}
.fab-parts td{border-bottom:1px solid rgba(28,52,96,.22);padding:6px 6px 6px 0;vertical-align:top;letter-spacing:.01em}
.fab-parts td:first-child{width:38px;font-weight:600;font-size:12px;letter-spacing:.12em;color:#8a5a12;padding-top:9px}
.fab-margin{border-left:2px solid ${RED};padding:2px 0 2px 14px;margin:0 0 12px}
.fab-margin p{font-style:italic;color:${RED};font-size:18.5px;margin:0}
.fab-margin b{display:block;font-family:'Barlow Condensed',sans-serif;font-style:normal;font-weight:600;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:${RED};opacity:.8;margin-bottom:2px}
.fab-reg a{display:grid;grid-template-columns:40px 1fr auto;gap:8px;align-items:baseline;padding:12px 0;border-bottom:1px solid rgba(28,52,96,.22);text-decoration:none;color:inherit}
.fab-reg a:hover strong{color:#8a5a12}
.fab-reg b{font-weight:600;font-size:13px;letter-spacing:.12em;color:#8a5a12}
.fab-reg strong{font-family:'Instrument Serif',serif;font-weight:400;font-size:25px;color:#16294d;display:block;line-height:1.05}
.fab-reg em{font-style:normal;display:block;font-size:15.5px;line-height:1.3;margin-top:3px}
.fab-reg i{font-style:normal;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:rgba(28,52,96,.65);white-space:nowrap}
.fab-caps h3{margin-top:6px}
.fab-caps li{padding:8px 0;border-bottom:1px dashed rgba(28,52,96,.25);font-size:16.5px;letter-spacing:.01em;line-height:1.35}
.fab-caps li span{display:block;margin-top:2px}
.fab-caps li a{font-family:'Instrument Serif',serif;font-style:italic;font-size:17px;color:#8a5a12;text-decoration:none;border-bottom:1px solid rgba(138,90,18,.35);margin-right:10px;white-space:nowrap}
.fab-facts{width:100%;border-collapse:collapse}
.fab-facts td{border-bottom:1px solid rgba(28,52,96,.22);padding:8px 8px 8px 0;vertical-align:top;font-size:17px;line-height:1.35}
.fab-facts td:first-child{width:110px;font-weight:600;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:rgba(28,52,96,.7);padding-top:11px}
.fab-pn{display:flex;justify-content:space-between;gap:12px;margin:2px 0 18px}
.fab-pn a{flex:1;display:block;border:1.5px solid rgba(28,52,96,.7);background:#fbf6ea;padding:10px 14px;text-decoration:none;color:${INK}}
.fab-pn a:last-child{text-align:right}
.fab-pn a span{display:block;font-weight:600;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,52,96,.6)}
.fab-pn a strong{font-family:'Instrument Serif',serif;font-weight:400;font-size:22px}
.fab-pn a:hover strong{color:#8a5a12}
.fab-bigcta{display:block;font-family:'Instrument Serif',serif;font-style:italic;font-size:clamp(30px,3vw,40px);line-height:1.05;color:#16294d;text-decoration:none;border-bottom:2px solid #b07d2c;padding-bottom:6px;margin:6px 0 16px}
.fab-bigcta:hover{color:#8a5a12}
.fab-expand{display:none}
.fab-panel{position:absolute;z-index:5;top:140px;right:clamp(12px,2vw,28px);bottom:clamp(12px,3vh,28px);width:min(400px,calc(100% - 24px));background:#fbf6ea;
  border:1.5px solid rgba(28,52,96,.85);box-shadow:inset 0 0 0 4px #fbf6ea,inset 0 0 0 5px rgba(28,52,96,.3),0 30px 60px -30px rgba(70,45,10,.55);
  overflow:auto;overscroll-behavior:contain;padding:22px 22px 18px;box-sizing:border-box;transform:translateX(calc(100% + 40px));transition:transform .55s cubic-bezier(.2,.8,.2,1);visibility:hidden}
.fab-panel.open{transform:none;visibility:visible}
.fab-panel h2{font-family:'Instrument Serif',serif;font-weight:400;font-size:34px;line-height:1;margin:6px 0 10px;color:#16294d}
.fab-panel .k{font-weight:600;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,52,96,.7)}
.fab-panel p{font-family:'Instrument Serif',serif;font-size:19px;line-height:1.32;margin:0 0 12px;color:#24365a}
.fab-panel .built{margin-top:16px;padding-top:14px;border-top:1.5px solid #b07d2c}
.fab-panel .built .k{color:#8a5a12}
.fab-panel h3{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;font-size:30px;margin:4px 0 2px;color:#5f3d0c}
.fab-panel .kind{font-size:14px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px;color:rgba(28,52,96,.8)}
.fab-panel ul{margin:0 0 12px;padding:0;list-style:none}
.fab-panel li{font-size:16px;line-height:1.3;padding:6px 0 6px 18px;position:relative;border-bottom:1px dashed rgba(28,52,96,.22);letter-spacing:.01em}
.fab-panel li::before{content:'';position:absolute;left:2px;top:12px;width:8px;height:1.5px;background:#b07d2c}
.fab-panel .links{display:flex;flex-wrap:wrap;gap:6px 18px}
.fab-panel .links a{font-family:'Instrument Serif',serif;font-size:20px;color:#8a5a12;text-decoration:none;border-bottom:1px solid rgba(138,90,18,.45)}
.fab-panel .note{font-size:13px;letter-spacing:.06em;color:rgba(28,52,96,.7);margin-top:14px;line-height:1.35}
.fab-x{position:absolute;top:10px;right:10px;width:36px;height:36px;border:0;background:none;font:400 28px/1 'Instrument Serif',serif;color:${INK};cursor:pointer}
.fab-x:focus-visible{outline:2px solid #b07d2c}
@media (max-width:700px){
  .fab-head{top:134px}
  .fab-kick{font-size:11px}
  .fab-quote{font-size:clamp(24px,7vw,32px)}
  .fab-sub{font-size:15px}
  .fab-label{padding:3px 5px 4px}
  .fab-label .n{font-size:11.5px;letter-spacing:.05em;white-space:normal;max-width:8.6em;margin:0 auto}
  .fab-label .p{font-size:12.5px}
  .fab-label .bi{display:none}
  .fab-label.up .p{display:none}
  .fab-label.up{padding:3px 6px}
  .fab-label.face .n{font-size:10.5px;max-width:8em;letter-spacing:.04em}
  .fab-label.face .p{display:none}
  .fab-block{left:12px;right:12px;bottom:12px;width:auto}
  .fab-block .fab-row.opt{display:none}
  .fab-cta{font-size:23px;padding:10px 12px 9px}
  .fab-contacts{font-size:12px;gap:14px}
  .fab-hint{display:none}
  .fab-idxbtn{top:84px;right:12px;padding:9px 10px 8px}
  .fab-idx{top:122px;right:12px;max-height:calc(100% - 140px)}
  .fab-read{left:8px;right:8px;width:auto;top:52%;bottom:8px;transform:translateY(30px);transition:opacity .5s ease,transform .6s cubic-bezier(.2,.8,.2,1),top .5s cubic-bezier(.2,.8,.2,1),visibility 0s .5s}
  .fab.sheet .fab-read{transition:opacity .5s ease .15s,transform .7s cubic-bezier(.2,.8,.2,1) .1s,top .5s cubic-bezier(.2,.8,.2,1)}
  .fab-read.full{top:128px}
  .fab-expand{display:block;position:sticky;top:0;z-index:2;width:100%;border:1.5px solid rgba(28,52,96,.8);background:#efe4cc;color:${INK};font:600 12px/1 'Barlow Condensed',sans-serif;
    letter-spacing:.2em;text-transform:uppercase;padding:9px 0 8px;margin:0 0 8px;cursor:pointer}
  .fab-sh{padding:16px 16px 18px}
  .fab-sh .strip{font-size:10.5px;letter-spacing:.16em;flex-wrap:wrap;gap:2px 10px}
  .fab-sh h2{font-size:32px}
  .fab-sh p{font-size:17.5px}
  .fab-sh p.lede{font-size:19px}
  .fab-dim .v{font-size:32px}
  .fab-reg strong{font-size:22px}
  .fab-reg a{grid-template-columns:34px 1fr}
  .fab-reg i{grid-column:2}
  .fab-panel{top:auto;left:8px;right:8px;width:auto;bottom:8px;max-height:64%;transform:translateY(calc(100% + 30px))}
  .fab-panel h2{font-size:28px}
}
`;

// ───────────────────────────── the world ─────────────────────────────
export default {
  id: 'client',
  color: PAPER_BG,
  async mount(root, ctx) {
    const cleanups = [];
    const on = (t, ev, fn, opts) => { t.addEventListener(ev, fn, opts); cleanups.push(() => t.removeEventListener(ev, fn, opts)); };
    const work = ctx.work || [];
    const workBy = Object.fromEntries(work.map((w) => [w.slug, w]));
    const nameToSlug = Object.fromEntries(work.map((w) => [w.name, w.slug]));
    const cases = ctx.cases || {};
    const person = ctx.person;
    const reduced = !!ctx.reduced;
    const aud = ctx.audience || 'client';
    const org = (ctx.org || '').trim().slice(0, 60);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap';
    document.head.appendChild(link);
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

    const wrap = el('div', 'fab'); root.appendChild(wrap);
    // focus/scrollIntoView can scroll overflow:hidden boxes; keep the world pinned
    const pin = (ev) => { const t = ev.target; if (t && (t.scrollLeft || t.scrollTop)) { t.scrollLeft = 0; t.scrollTop = 0; } };

    // ── the visitor's words
    const raw = (ctx.text || '').trim().replace(/\s+/g, ' ').slice(0, 160);
    const key = pickBlueprint(raw, aud);
    const arrivalBp = key === 'product' ? PRODUCT_BP : BLUEPRINTS[key];
    const quote = raw ? `“${raw.replace(/[.\s]+$/, '')}.”` : (aud === 'product' ? '“Show me how you build a product.”' : '“Describe what you need built.”');
    const mailSubject = (aud === 'product' ? `AI product engineer role${org ? ' at ' + org : ''}${raw ? ': ' + raw : ''}`
      : aud === 'found' ? `From a founder${org ? ' at ' + org : ''}: ${raw || 'what we are building'}`
        : `Build request: ${raw || 'something I need built'}`).slice(0, 150);
    const mailto = `mailto:${person.email}?subject=${encodeURIComponent(mailSubject)}`;

    const ORDER = (aud === 'client' ? ['farmquick', 'pitchradar', 'vvdex-engine', 'conxto', 'unboundpdf', 'vvdex-platform', 'conxfolio', 'vvdex-trading']
      : aud === 'found' ? ['vvdex-engine', 'conxto', 'vvdex-platform', 'unboundpdf', 'farmquick', 'pitchradar', 'conxfolio', 'vvdex-trading']
        : ['conxto', 'vvdex-engine', 'vvdex-platform', 'unboundpdf', 'farmquick', 'pitchradar', 'conxfolio', 'vvdex-trading']).filter((s) => workBy[s]);
    for (const w of work) if (!ORDER.includes(w.slug)) ORDER.push(w.slug);

    const portrait = root.clientWidth / Math.max(1, root.clientHeight) < 0.85;

    // ───────────── model specs: every section of the site is a model on the table ─────────────
    const chain = (items, P) => items.map((it, i) => {
      const row = Math.floor(i / P), col = row % 2 ? P - 1 - (i % P) : i % P;
      return { ...it, c: col, r: row };
    });
    const chainEdges = (nodes) => nodes.slice(1).map((n, i) => [nodes[i].id, n.id]);
    const cut = (s, n = 30) => { s = s.replace(/[.]$/, ''); if (s.length <= n) return s; const c1 = s.split(/[:;,(]/)[0]; return c1.length <= n ? c1 : s.slice(0, n).replace(/\s+\S*$/, '') + '…'; };

    const aboutLabel = (v) => { let s = v.split(' — ')[0].split(' · ')[0]; if (s.length > 32) { const f = s.split('. ')[0]; if (f.length > 5) s = f; } return cut(s, 32); };
    function specFor(route) {
      const { sec, slug } = route;
      if (sec === '' || sec === 'contact') {
        return {
          key: sec || 'arrival', kind: sec ? 'sheet' : 'arrival',
          nodes: arrivalBp.nodes.map((n) => ({ ...n, brass: !!n.slug, tag: n.slug && workBy[n.slug] ? workBy[n.slug].name : null, tagPre: 'built in ', act: sec ? (n.slug ? 'case' : 'none') : 'part' })),
          edges: arrivalBp.edges,
        };
      }
      if (sec === 'work' && !slug) {
        const nodes = ORDER.map((s, i) => ({ id: s, label: workBy[s].name, tag: workBy[s].kind, shape: SHELF_SHAPE[s] || 'rect', slug: s, brass: true, c: portrait ? Math.floor(i / 3) : i % 4, r: portrait ? i % 3 : Math.floor(i / 4), act: 'case' }));
        return { key: 'work', kind: 'sheet', nodes, edges: [] };
      }
      if (sec === 'work' && slug) {
        const c = cases[slug];
        if (c) {
          const shapes = ['doc', 'rect', 'diamond', 'rect', 'circle', 'cyl', 'rect', 'rect'];
          const nodes = chain(c.how_it_works.map((h, i) => ({ id: 's' + i, label: h.step, tag: `Step ${i + 1}`, tagPre: '', shape: i === c.how_it_works.length - 1 ? 'cyl' : shapes[i], slug, brass: true, act: 'scroll' })), portrait ? 2 : 3);
          return { key: 'case:' + slug, kind: 'sheet', nodes, edges: chainEdges(nodes) };
        }
        const w = workBy[slug], names = SHORT_BUILT[slug] || w.built.map((b) => cut(b));
        const items = w.built.map((b, i) => ({ id: 'b' + i, label: names[i] || cut(b), tag: `Part ${i + 1}`, shape: ['doc', 'rect', 'circle'][i % 3], slug, brass: true, act: 'scroll' }));
        items.push({ id: 'chk', label: 'The checks', tag: `${(w.checks || []).length} written down`, shape: 'diamond', slug, brass: true, act: 'scroll' });
        const nodes = chain(items, portrait ? 2 : 4);
        return { key: 'case:' + slug, kind: 'sheet', nodes, edges: chainEdges(nodes) };
      }
      if (sec === 'principles') {
        const nodes = chain((ctx.principles || []).map((p, i) => ({ id: 'p' + i, label: cut(p.k, 28), tag: `Principle ${i + 1}`, shape: ['rect', 'diamond', 'circle'][i % 3], slug: null, brass: true, act: 'scroll' })), portrait ? 1 : 3);
        return { key: 'principles', kind: 'sheet', nodes, edges: chainEdges(nodes) };
      }
      if (sec === 'withdrawn') {
        const nodes = (ctx.withdrawn || []).map((w, i) => ({ id: 'w' + i, label: w.title, tag: w.numbers.map((n) => `${n[0]} ${n[1]}`).join(' · '), tagPre: '', shape: 'rect', slug: null, brass: false, c: i, r: 0, act: 'scroll' }));
        return { key: 'withdrawn', kind: 'sheet', nodes, edges: [], flat: true, strike: true };
      }
      if (sec === 'capabilities') {
        const nodes = (ctx.capabilities || []).map((g, i) => ({ id: 'g' + i, label: g[0], tag: `${g[1].length} skills`, shape: ['cyl', 'rect', 'circle', 'diamond'][i % 4], slug: null, brass: true, c: portrait ? Math.floor(i / 2) : i, r: portrait ? i % 2 : 0, act: 'scroll' }));
        return { key: 'capabilities', kind: 'sheet', nodes, edges: [] };
      }
      if (sec === 'about') {
        const facts = []; let last = null;
        for (const [k, v] of (ctx.about && ctx.about.facts) || []) { if (k) { last = { k, v: [v] }; facts.push(last); } else if (last) last.v.push(v); }
        const nodes = facts.map((f, i) => ({ id: 'f' + i, label: aboutLabel(f.v[0]), tag: f.k, shape: ['circle', 'rect', 'doc', 'rect'][i % 4], slug: null, brass: true, c: portrait ? Math.floor(i / 2) : i, r: portrait ? i % 2 : 0, act: 'scroll' }));
        return { key: 'about', kind: 'sheet', nodes, edges: chainEdges(nodes) };
      }
      return specFor({ sec: '', slug: null });
    }

    // pure layout (positions, footprints, edge routes) — used to size the sheet before building anything
    function layoutSpec(spec) {
      const cols = Math.max(...spec.nodes.map((n) => n.c)) + 1, rows = Math.max(...spec.nodes.map((n) => n.r)) + 1;
      const SX = portrait ? 2.7 : 2.9, SZ = portrait ? 2.2 : 2.5;
      const NW = portrait ? 1.5 : 1.75, ND = portrait ? 0.85 : 1.0;
      const nodes = spec.nodes.map((n, i) => {
        const x = portrait ? (n.r - (rows - 1) / 2) * SX : (n.c - (cols - 1) / 2) * SX;
        const z = portrait ? (n.c - (cols - 1) / 2) * SZ : (n.r - (rows - 1) / 2) * SZ;
        const w = n.shape === 'diamond' ? NW * 1.05 : NW, d = n.shape === 'diamond' ? ND * 1.15 : ND;
        const H = spec.flat ? 0 : { rect: 0.62, diamond: 0.42, circle: 0.78, cyl: 0.95, doc: 0.36 }[n.shape] * (n.brass ? 1.15 : 1);
        return { ...n, i, x, z, w, d, H, ext: halfExtent(n.shape, w, d), order: n.c * 10 + n.r };
      });
      const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
      [...nodes].sort((a, b) => a.order - b.order).forEach((n, k) => (n.k = k));
      const edges = spec.edges.map(([a, b], j) => {
        const A = byId[a], B = byId[b];
        const prim = portrait ? 'z' : 'x', sec = portrait ? 'x' : 'z';
        const P = (n, dp, ds) => (portrait ? [n.x + ds, n.z + dp] : [n.x + dp, n.z + ds]);
        const ea = portrait ? A.ext[1] : A.ext[0], eb = portrait ? B.ext[1] : B.ext[0];
        let pts;
        if (Math.abs(A[prim] - B[prim]) > 0.01) {
          const s = Math.sign(B[prim] - A[prim]);
          const st = P(A, s * ea, 0), en = P(B, -s * eb, 0);
          if (Math.abs(A[sec] - B[sec]) < 0.01) pts = [st, en];
          else {
            const mid = (A[prim] + s * ea + B[prim] - s * eb) / 2;
            pts = portrait ? [st, [st[0], mid], [en[0], mid], en] : [st, [mid, st[1]], [mid, en[1]], en];
          }
        } else {
          const s = Math.sign(B[sec] - A[sec]);
          const sa = portrait ? A.ext[0] : A.ext[1], sb = portrait ? B.ext[0] : B.ext[1];
          pts = [P(A, 0, s * sa), P(B, 0, -s * sb)];
        }
        let len = 0; for (let i = 0; i < pts.length - 1; i++) len += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
        return { a, b, j, pts, len };
      });
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      for (const n of nodes) { minX = Math.min(minX, n.x - n.w / 2); maxX = Math.max(maxX, n.x + n.w / 2); minZ = Math.min(minZ, n.z - n.d / 2); maxZ = Math.max(maxZ, n.z + n.d / 2); }
      return { spec, nodes, byId, edges, minX, maxX, minZ, maxZ, cols, rows };
    }

    // size one big drawing sheet to fit every model the site can show
    const allRoutes = [{ sec: '' }, { sec: 'work' }, ...ORDER.map((s) => ({ sec: 'work', slug: s })), { sec: 'principles' }, { sec: 'withdrawn' }, { sec: 'capabilities' }, { sec: 'about' }];
    let bx0 = 0, bx1 = 0, bz0 = 0, bz1 = 0;
    for (const r of allRoutes) { const L = layoutSpec(specFor(r)); bx0 = Math.min(bx0, L.minX); bx1 = Math.max(bx1, L.maxX); bz0 = Math.min(bz0, L.minZ); bz1 = Math.max(bz1, L.maxZ); }
    const PW = bx1 - bx0 + (portrait ? 4.0 : 7.0), PD = bz1 - bz0 + (portrait ? 9.0 : 7.5);
    const pcx = (bx0 + bx1) / 2, pcz = (bz0 + bz1) / 2 - (portrait ? 2.2 : 1.6);

    // ───────────── three.js stage ─────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    const dprFor = () => { const d = window.devicePixelRatio || 1; const px = (root.clientWidth || 1) * (root.clientHeight || 1); return Math.min(d, px > 900000 ? 1.6 : 2); };
    renderer.setPixelRatio(dprFor());
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false; // shadows re-render only while something that casts one moves
    wrap.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', 'A paper-and-brass model on a drafting table. Drag to turn it; the parts are listed as buttons.');
    renderer.domElement.setAttribute('role', 'img');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PAPER_BG);
    scene.fog = new THREE.Fog(PAPER_BG, 22, 60);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    const envSphere = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 top = vec3(1.0,0.93,0.80); vec3 bot = vec3(0.42,0.30,0.18); gl_FragColor = vec4(mix(bot, top, smoothstep(-0.3,0.6,h)),1.); }',
    }));
    envScene.add(envSphere);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(7, 5.6, 3.6), side: THREE.DoubleSide }));
    win.position.set(-6, 5, -5); win.lookAt(0, 0, 0); envScene.add(win);
    const envRT = pmrem.fromScene(envScene, 0.035);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.45;
    envSphere.geometry.dispose(); envSphere.material.dispose(); win.geometry.dispose(); win.material.dispose();

    const hemi = new THREE.HemisphereLight('#fff3dd', '#b89668', 0.6); scene.add(hemi);
    const sun = new THREE.SpotLight('#ffcf8f', 5.6, 0, 0.5, 0.75, 0);
    sun.position.set(-18, 16, -11);
    sun.target.position.set(0.5, 0, 0.5);
    scene.add(sun, sun.target);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 8; sun.shadow.camera.far = 70;
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
    const cookie = windowCookie(); sun.map = cookie;

    const disposables = [cookie];
    const wood = woodTexture(); disposables.push(wood);
    const desk = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.78, metalness: 0 }));
    desk.rotation.x = -Math.PI / 2; desk.position.y = -0.03; desk.receiveShadow = true; scene.add(desk);
    const under = new THREE.Mesh(new THREE.BoxGeometry(PW * 0.99, 0.012, PD * 0.99), new THREE.MeshStandardMaterial({ color: '#efe3cb', roughness: 0.95 }));
    under.position.set(pcx + 0.18, -0.022, pcz + 0.14); under.rotation.y = 0.022; under.receiveShadow = true; under.castShadow = true; scene.add(under);
    const ptex = paperTexture(PW, PD, renderer.capabilities.getMaxAnisotropy()); disposables.push(ptex);
    const side = () => new THREE.MeshStandardMaterial({ color: '#efe4cf', roughness: 0.95 });
    const paper = new THREE.Mesh(new THREE.BoxGeometry(PW, 0.014, PD), [side(), side(), new THREE.MeshStandardMaterial({ map: ptex, roughness: 0.92 }), side(), side(), side()]);
    paper.position.set(pcx, -0.007, pcz); paper.receiveShadow = true; scene.add(paper);
    {
      const tri = new THREE.Shape(); const S = portrait ? 2.2 : 2.8;
      tri.moveTo(0, 0); tri.lineTo(S, 0); tri.lineTo(0, S * 0.62); tri.closePath();
      const hole = new THREE.Path(); hole.moveTo(0.32, 0.25); hole.lineTo(S - 0.95, 0.25); hole.lineTo(0.32, S * 0.62 - 0.55); hole.closePath(); tri.holes.push(hole);
      const g = new THREE.ExtrudeGeometry(tri, { depth: 0.035, bevelEnabled: false });
      g.rotateX(-Math.PI / 2);
      const sq = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#c99a45', metalness: 1, roughness: 0.32 }));
      sq.castShadow = true; sq.receiveShadow = true;
      if (portrait) { sq.position.set(pcx + PW / 2 - 0.4, 0.001, bz1 + 1.6); sq.rotation.y = 0.5; }
      else { sq.position.set(bx1 + 1.6, 0.001, bz1 + 1.9); sq.rotation.y = 0.35; }
      scene.add(sq);
    }

    // shared materials / geometries
    const paperMat = new THREE.MeshStandardMaterial({ color: '#f7f0e2', roughness: 0.82, metalness: 0 });
    const edgeMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.85 });
    const brassMat = new THREE.MeshStandardMaterial({ color: '#d4a24c', metalness: 1, roughness: 0.28 });
    const railMat = new THREE.MeshStandardMaterial({ color: '#c99542', metalness: 1, roughness: 0.3 });
    const postGeo = new THREE.CylinderGeometry(0.018, 0.018, 1, 6); postGeo.translate(0, 0.5, 0);
    const beadGeo = new THREE.SphereGeometry(0.055, 14, 10);
    const glow = glowTexture(); disposables.push(glow);
    const penMat = new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    const pens = Array.from({ length: 12 }, () => { const s = new THREE.Sprite(penMat); s.scale.set(0.55, 0.55, 1); s.visible = false; s.renderOrder = 5; scene.add(s); return s; });
    const RAIL_Y = 0.17;

    // ───────────── HTML: arrival headline, title block, index, reading surface, part panel ─────────────
    const head = el('header', 'fab-head');
    const kickText = aud === 'found' ? (org ? `Drawn for ${org}` : 'Drawn for a founder')
      : aud === 'product' ? (org ? `Drawn for ${org}'s product team` : 'Drawn for a product team')
        : raw ? 'Your brief, as you wrote it' : 'Your brief goes here';
    const kick = el('div', 'fab-kick', kickText);
    const q = el('h1', 'fab-quote');
    q.setAttribute('aria-label', quote);
    const chars = [...quote].map((ch) => { const s = el('span', null, ch); s.setAttribute('aria-hidden', 'true'); q.appendChild(s); return s; });
    const sub = el('p', 'fab-sub');
    const used = [...new Set(arrivalBp.nodes.map((n) => n.slug).filter(Boolean))].filter((s) => workBy[s]);
    sub.appendChild(document.createTextNode(aud === 'product' ? 'How I take an idea to a shipped product you can trust. ' : 'How it would be built. '));
    const sw = el('span', 'brass'); sw.setAttribute('aria-hidden', 'true'); sub.appendChild(sw);
    sub.appendChild(document.createTextNode(aud === 'product' ? 'Each brass part is a step I have built for real, in ' : 'Brass parts are ones I have built before, in '));
    used.forEach((s, i) => {
      const a = el('a', null, workBy[s].name); a.href = `#work/${s}`; sub.appendChild(a);
      sub.appendChild(document.createTextNode(i < used.length - 2 ? ', ' : i === used.length - 2 ? ' and ' : '. '));
    });
    if (aud !== 'product') sub.appendChild(document.createTextNode('Your version does not exist yet. '));
    const allW = el('a', null, `All ${work.length} products →`); allW.href = '#work'; sub.appendChild(allW);
    head.append(kick, q, sub); wrap.appendChild(head);

    const labelsLayer = el('div', 'fab-labels'); wrap.appendChild(labelsLayer);
    for (const t of [root, wrap, labelsLayer]) on(t, 'scroll', pin);

    const block = el('section', 'fab-block'); block.setAttribute('aria-label', 'Title block and contact');
    const row = (k, v, opt) => { const r = el('div', 'fab-row' + (opt ? ' opt' : '')); r.append(el('b', null, k), el('span', null, v)); block.appendChild(r); return r; };
    row('Project', arrivalBp.title, true);
    row('For', org || (aud === 'product' ? 'Your product team' : raw ? 'You' : 'Your business'), true);
    row('Drawn by', `${person.name} · ${person.role} · ${person.city.split(',')[0]}`, true);
    const shRow = el('div', 'fab-row sheets opt'); const shSpan = el('span');
    shRow.append(el('b', null, 'Sheets'), shSpan);
    for (const [h, , t] of SECTIONS.slice(1)) { const a = el('a', null, t); a.href = '#' + h; shSpan.appendChild(a); }
    block.appendChild(shRow);
    const cta = el('a', 'fab-cta'); cta.href = mailto;
    cta.appendChild(el('i', null, aud === 'product' ? 'Tell me about the role' : 'Tell me what you need built'));
    cta.appendChild(document.createTextNode(' →'));
    block.appendChild(cta);
    const contacts = el('div', 'fab-contacts');
    const mk = (parent, t, h) => { const a = el('a', null, t); a.href = h; if (!h.startsWith('mailto') && !h.startsWith('#')) { a.target = '_blank'; a.rel = 'noopener'; } parent.appendChild(a); return a; };
    mk(contacts, 'Email', `mailto:${person.email}`); mk(contacts, 'LinkedIn', person.linkedin); mk(contacts, 'GitHub', person.github);
    block.appendChild(contacts);
    wrap.appendChild(block);

    const hint = el('div', 'fab-hint', ctx.isTouch ? 'Drag to turn · tap a part' : 'Drag to turn the model · click a part');
    wrap.appendChild(hint);

    // the sheet index (plan-chest drawer list), always reachable
    const idxBtn = el('button', 'fab-idxbtn'); idxBtn.type = 'button';
    idxBtn.setAttribute('aria-expanded', 'false'); idxBtn.setAttribute('aria-controls', 'fab-idx');
    const idxCur = el('b', null, '01 The brief');
    idxBtn.append(document.createTextNode('Sheets'), idxCur);
    const idx = el('nav', 'fab-idx'); idx.id = 'fab-idx'; idx.setAttribute('aria-label', 'Sheet index');
    const idxLinks = [];
    for (const [h, n, t] of SECTIONS) {
      const a = el('a'); a.href = '#' + h; a.append(el('span', null, n), document.createTextNode(t)); idx.appendChild(a); idxLinks.push([h, null, a]);
      if (h === 'work') for (const s of ORDER) { const b = el('a', 'sub', workBy[s].name); b.href = `#work/${s}`; idx.appendChild(b); idxLinks.push(['work', s, b]); }
    }
    wrap.append(idxBtn, idx);
    const setIdx = (open) => { idx.classList.toggle('open', open); idxBtn.setAttribute('aria-expanded', String(open)); };
    on(idxBtn, 'click', () => setIdx(!idx.classList.contains('open')));
    on(idx, 'click', (ev) => { if (ev.target.closest('a')) setIdx(false); });

    const read = el('main', 'fab-read'); read.tabIndex = -1; read.setAttribute('aria-live', 'polite');
    wrap.appendChild(read);

    const panel = el('aside', 'fab-panel'); panel.setAttribute('aria-live', 'polite'); panel.tabIndex = -1;
    wrap.appendChild(panel);
    let panelNode = null;
    function openPart(n) {
      panel.replaceChildren();
      const x = el('button', 'fab-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); on(x, 'click', closePanel); panel.appendChild(x);
      panel.appendChild(el('div', 'k', `Part ${n.k + 1} of ${model.nodes.length} · ${aud === 'product' ? 'how I build it' : 'how it would work for you'}`));
      panel.appendChild(el('h2', null, n.label));
      panel.appendChild(el('p', null, n.how || ''));
      const w = n.slug && workBy[n.slug];
      if (w) {
        const b = el('div', 'built');
        b.appendChild(el('div', 'k', 'Built before, for real'));
        b.appendChild(el('h3', null, w.name));
        b.appendChild(el('div', 'kind', `${w.kind} · ${w.status}`));
        b.appendChild(el('p', null, w.line));
        const ul = el('ul'); w.built.forEach((t) => ul.appendChild(el('li', null, t))); b.appendChild(ul);
        const links = el('div', 'links');
        mk(links, `Open the ${w.name} drawings →`, `#work/${w.slug}`);
        if (w.url) mk(links, `${w.host} ↗`, w.url);
        b.appendChild(links);
        panel.appendChild(b);
      } else {
        panel.appendChild(el('p', 'note', aud === 'product' ? 'A step in how I work, not a separate product.' : 'Not a separate product of mine: this part would be built new for you, inside the same rules as the brass parts.'));
      }
      if (aud !== 'product') panel.appendChild(el('p', 'note', 'This drawing shows how your version would be built. It does not exist yet.'));
      panel.classList.add('open'); panelNode = n; setHover(n, true);
      panel.focus({ preventScroll: true });
    }
    function closePanel() { panel.classList.remove('open'); panelNode = null; setHover(null, true); }

    // ───────────── reading surface content per section ─────────────
    const sheet = (stripL, stripR) => { const s = el('section', 'fab-sh'); const st = el('div', 'strip'); st.append(el('span', null, stripL), el('span', null, stripR || '')); s.appendChild(st); return s; };
    const linksEl = (pairs) => { const d = el('div', 'links'); for (const [t, u] of pairs) mk(d, t, u); return d; };
    const tagNode = (elm, id) => { elm.dataset.node = id; on(elm, 'pointerenter', () => setHover(model.byId[id] || null)); on(elm, 'pointerleave', () => setHover(null)); return elm; };
    const flagOrNot = (s) => (cases[s] ? 'Full drawing set' : 'Drawing');
    function pnEl(slug) {
      const i = ORDER.indexOf(slug), p = ORDER[(i + ORDER.length - 1) % ORDER.length], n = ORDER[(i + 1) % ORDER.length];
      const d = el('nav', 'fab-pn'); d.setAttribute('aria-label', 'Previous and next product');
      const a1 = el('a'); a1.href = `#work/${p}`; a1.append(el('span', null, '← Previous'), el('strong', null, workBy[p].name));
      const a2 = el('a'); a2.href = `#work/${n}`; a2.append(el('span', null, 'Next →'), el('strong', null, workBy[n].name));
      d.append(a1, a2); return d;
    }
    function dims(list) {
      const frag = el('div');
      for (const n of list) {
        const d = el('div', 'fab-dim'); d.append(el('span', 'v', n.value));
        d.appendChild(el('div', 'l', n.label)); if (n.date) d.appendChild(el('div', 'd', n.date));
        frag.appendChild(d);
      }
      return frag;
    }
    function buildRead(route) {
      read.replaceChildren();
      const exp = el('button', 'fab-expand', 'Open the full sheet ↑'); exp.type = 'button';
      on(exp, 'click', () => { const f = read.classList.toggle('full'); exp.textContent = f ? 'Show the model ↓' : 'Open the full sheet ↑'; setTimeout(() => { if (alive) layoutView(); }, 560); });
      read.appendChild(exp);
      const { sec, slug } = route;
      const secNo = (SECTIONS.find((s) => s[0] === sec) || SECTIONS[0])[1];
      if (sec === 'work' && !slug) {
        const s = sheet(`Sheet ${secNo} · Drawing register`, `${work.length} drawings`);
        s.appendChild(el('h2', null, 'Work'));
        s.appendChild(el('p', 'lede', `${work.length} products, each designed, built and run end to end. Pick a model off the table, or a drawing from the register.`));
        const reg = el('div', 'fab-reg');
        ORDER.forEach((sl, i) => {
          const w = workBy[sl]; const a = el('a'); a.href = `#work/${sl}`;
          const mid = el('span'); mid.append(el('strong', null, w.name), el('em', null, w.one || w.line));
          a.append(el('b', null, String(i + 1).padStart(2, '0')), mid, el('i', null, `${w.status} · ${flagOrNot(sl)}`));
          tagNode(a, sl); reg.appendChild(a);
        });
        s.appendChild(reg); read.appendChild(s);
      } else if (sec === 'work' && slug) {
        const w = workBy[slug], c = cases[slug], no = String(ORDER.indexOf(slug) + 1).padStart(2, '0');
        const t = sheet(`Drawing ${no} of ${String(ORDER.length).padStart(2, '0')}`, c ? c.category : w.kind);
        t.appendChild(el('h2', null, w.name));
        t.appendChild(el('div', 'meta', c ? `${c.status} · ${c.period}` : `${w.kind} · ${w.status}`));
        t.appendChild(el('p', 'lede', c ? c.one_line : w.line));
        if (c) { t.appendChild(el('p', null, c.summary)); const r = el('p'); r.append(el('b', null, 'My role — '), document.createTextNode(c.role)); t.appendChild(r); }
        const ls = (c ? c.links.map((l) => [l.label + ' ↗', l.url]) : (w.links || []).map((l) => [l[0] + ' ↗', l[1]]));
        ls.push(['The full write-up ↗', `${({"vvdex-platform":"https://vvdexops.com/","conxto":"https://conxto.com/","vvdex-engine":"https://lab.vvdexops.com/","unboundpdf":"https://unboundpdf.com/","farmquick":"https://farmquick.in/","conxfolio":"https://conxfolio.com/","pitchradar":"https://github.com/vamsi-venkatesh/pitchradar","vvdex-trading":"https://trading.vvdexops.com/","forecasting":"https://lab.vvdexops.com/forecast/"})[slug]}`]);
        t.appendChild(linksEl(ls));
        read.append(pnEl(slug), t);
        if (c) {
          const A = sheet('A · Problem and constraints', w.name); A.appendChild(el('p', null, c.problem)); A.appendChild(el('h3', null, 'Constraints'));
          const ol = el('ol', 'num'); c.constraints.forEach((x, i) => { const li = el('li'); li.append(el('b', null, `C${i + 1}`), el('span', null, x)); ol.appendChild(li); }); A.appendChild(ol);
          const B = sheet('B · Assembly: what was built', `${c.built.length} parts`);
          const ob = el('ol', 'num'); c.built.forEach((x, i) => { const li = el('li'); const sp = el('span'); sp.append(el('strong', null, x.title), document.createTextNode(x.body)); li.append(el('b', null, String(i + 1).padStart(2, '0')), sp); ob.appendChild(li); }); B.appendChild(ob);
          const C = sheet('C · How it works — drawn on the table', `${c.how_it_works.length} steps`);
          const oc = el('ol', 'num'); c.how_it_works.forEach((x, i) => { const li = el('li'); const sp = el('span'); sp.append(el('strong', null, x.step), document.createTextNode(x.body)); li.append(el('b', null, `S${i + 1}`), sp); tagNode(li, 's' + i); oc.appendChild(li); }); C.appendChild(oc);
          const D = sheet('D · Revision notes: decisions', `${c.decisions.length} revisions`);
          c.decisions.forEach((x, i) => {
            const r = el('div', 'fab-rev'); r.appendChild(el('span', 'tag', `REV ${String.fromCharCode(65 + i)}`)); r.appendChild(el('h3', null, x.decision));
            const p1 = el('p'); p1.append(el('b', null, 'Why'), document.createTextNode(x.why));
            const p2 = el('p'); p2.append(el('b', null, 'Trade-off'), document.createTextNode(x.tradeoff)); r.append(p1, p2); D.appendChild(r);
          });
          const E2 = sheet('E · Test stamps: evaluation', `${c.evaluation.length} runs`);
          c.evaluation.forEach((x) => {
            const st = el('div', 'fab-stamp'); const sp = el('div', 'st'); sp.append(document.createTextNode('Tested'), el('i', null, x.date || ''));
            const tx = el('div'); tx.append(el('p', null, x.what), el('p', 'res', x.result)); st.append(sp, tx); E2.appendChild(st);
          });
          const F = sheet('F · Dimensions: the numbers', 'each dated'); F.appendChild(dims(c.numbers));
          const G = sheet('G · Parts list: stack', `${c.stack.length} items`);
          const tb = el('table', 'fab-parts'); const tbody = el('tbody'); c.stack.forEach((x, i) => { const tr = el('tr'); tr.append(el('td', null, String(i + 1).padStart(2, '0')), el('td', null, x)); tbody.appendChild(tr); }); tb.appendChild(tbody); G.appendChild(tb);
          const Hs = sheet('H · Margin notes: limits', 'read these too');
          c.limits.forEach((x, i) => { const m = el('div', 'fab-margin'); m.append(el('b', null, `Limit ${i + 1}`), el('p', null, x)); Hs.appendChild(m); });
          read.append(A, B, C, D, E2, F, G, Hs);
        } else {
          const A = sheet('A · Problem and plan', w.name); A.appendChild(el('p', null, w.problem)); A.appendChild(el('h3', null, 'The plan')); A.appendChild(el('p', null, w.plan));
          const B = sheet('B · Assembly: what was built', `${w.built.length} parts`);
          const ob = el('ol', 'num'); w.built.forEach((x, i) => { const li = el('li'); li.append(el('b', null, String(i + 1).padStart(2, '0')), el('span', null, x)); tagNode(li, 'b' + i); ob.appendChild(li); }); B.appendChild(ob);
          const E2 = sheet('C · Checks', `${(w.checks || []).length} written down`);
          (w.checks || []).forEach((x) => { const st = el('div', 'fab-stamp'); const sp = el('div', 'st', 'Checked'); const tx = el('div'); tx.appendChild(el('p', 'res', x)); st.append(sp, tx); tagNode(st, 'chk'); E2.appendChild(st); });
          const seen = new Set(), list = [];
          for (const [v, l] of [...(w.numbers || []), ...(w.stage || [])]) { const k2 = v + '|' + l; if (!seen.has(k2) && ![...seen].some((s2) => s2.startsWith(v + '|'))) { seen.add(k2); list.push({ value: v, label: l }); } }
          const F = sheet('D · Dimensions: the numbers', ''); F.appendChild(dims(list));
          read.append(A, B, E2, F);
        }
        read.appendChild(pnEl(slug));
      } else if (sec === 'principles') {
        const s = sheet(`Sheet ${secNo} · How I work`, `${(ctx.principles || []).length} principles`);
        s.appendChild(el('h2', null, 'How I work'));
        const ol = el('ol', 'num');
        (ctx.principles || []).forEach((p, i) => { const li = el('li'); const sp = el('span'); sp.append(el('strong', null, p.k), document.createTextNode(p.v)); li.append(el('b', null, `P${i + 1}`), sp); tagNode(li, 'p' + i); ol.appendChild(li); });
        s.appendChild(ol); read.appendChild(s);
      } else if (sec === 'withdrawn') {
        const s = sheet(`Sheet ${secNo} · Claims I withdrew`, 'struck through, kept on file');
        s.appendChild(el('h2', null, 'Claims I withdrew'));
        s.appendChild(el('p', 'lede', 'A claim stays only if it clears a bar written down before the measurement. These two did not, so they are struck through here, and the records stay public.'));
        read.appendChild(s);
        (ctx.withdrawn || []).forEach((w, i) => {
          const t = sheet(`Withdrawn ${i + 1}`, ''); tagNode(t, 'w' + i);
          t.appendChild(el('h3', null, w.title)); t.appendChild(el('p', null, w.what));
          t.appendChild(dims(w.numbers.map(([v, l]) => ({ value: v, label: l }))));
          if (w.link) t.appendChild(linksEl([[w.link[0] + ' ↗', w.link[1]]]));
          read.appendChild(t);
        });
      } else if (sec === 'capabilities') {
        const s = sheet(`Sheet ${secNo} · Parts index`, 'skills, and where each is used');
        s.appendChild(el('h2', null, 'Capabilities'));
        s.appendChild(el('p', 'lede', 'Every skill on this index is used in a product on the table. Follow a product to its drawings.'));
        read.appendChild(s);
        (ctx.capabilities || []).forEach(([g, skills], i) => {
          const t = sheet(`Group ${String.fromCharCode(65 + i)}`, `${skills.length} skills`); tagNode(t, 'g' + i);
          t.appendChild(el('h3', null, g));
          const ul = el('ul', 'fab-caps');
          for (const [skill, prods] of skills) {
            const li = el('li'); li.appendChild(document.createTextNode(skill)); const sp = el('span');
            for (const p of prods) { const sl = nameToSlug[p]; if (sl) mk(sp, p, `#work/${sl}`); else sp.appendChild(document.createTextNode(p + ' ')); }
            li.appendChild(sp); ul.appendChild(li);
          }
          t.appendChild(ul); read.appendChild(t);
        });
      } else if (sec === 'about') {
        const s = sheet(`Sheet ${secNo} · About`, person.city);
        s.appendChild(el('h2', null, person.name));
        s.appendChild(el('div', 'meta', `${person.role} · ${person.city}`));
        s.appendChild(el('p', 'lede', person.lede));
        const tb = el('table', 'fab-facts'); const tbody = el('tbody'); let fi = -1;
        for (const [k, v] of (ctx.about && ctx.about.facts) || []) { if (k) fi++; const tr = el('tr'); tr.append(el('td', null, k), el('td', null, v)); if (k) tagNode(tr, 'f' + fi); tbody.appendChild(tr); }
        tb.appendChild(tbody); s.appendChild(tb);
        read.appendChild(s);
        const t = sheet('What I am looking for', person.availability);
        t.appendChild(el('p', null, person.wants));
        const ol = el('ol', 'num'); person.roles.forEach((r, i) => { const li = el('li'); li.append(el('b', null, `R${i + 1}`), el('span', null, r)); ol.appendChild(li); }); t.appendChild(ol);
        read.appendChild(t);
      } else if (sec === 'contact') {
        const s = sheet(`Sheet ${secNo} · Contact`, person.availability);
        s.appendChild(el('h2', null, 'Contact'));
        const big = el('a', 'fab-bigcta', aud === 'product' ? 'Tell me about the role →' : 'Tell me what you need built →'); big.href = mailto; s.appendChild(big);
        s.appendChild(el('p', null, aud === 'product' ? person.wants : `${person.lede} ${person.wants.split('. ').slice(-2).join('. ')}`));
        const tb = el('table', 'fab-facts'); const tbody = el('tbody');
        const addRow = (k, t2, h) => { const tr = el('tr'); const td = el('td'); if (h) mk(td, t2, h); else td.textContent = t2; tr.append(el('td', null, k), td); tbody.appendChild(tr); };
        addRow('Email', person.email, `mailto:${person.email}`); addRow('LinkedIn', person.linkedin.replace('https://www.', ''), person.linkedin);
        addRow('GitHub', person.github.replace('https://', ''), person.github); addRow('Based in', person.city);
        tb.appendChild(tbody); s.appendChild(tb);
        s.appendChild(el('p', 'meta', `The model on the table is the drawing of “${raw || arrivalBp.title}” — open any part.`));
        read.appendChild(s);
      }
      read.scrollTop = 0;
    }
    function scrollToNode(id) {
      const t = read.querySelector(`[data-node="${id}"]`); if (!t) return;
      const r0 = read.getBoundingClientRect(), r1 = t.getBoundingClientRect();
      if (portrait && !read.classList.contains('full')) { /* keep the model visible on phones */ }
      read.scrollTo({ top: read.scrollTop + (r1.top - r0.top) - 56, behavior: reduced ? 'auto' : 'smooth' });
      read.querySelectorAll('.hot').forEach((x) => x.classList.remove('hot'));
      t.classList.add('hot'); setTimeout(() => t.classList.remove('hot'), 1600);
    }

    // ───────────── building / retiring models on the table ─────────────
    const inkOf = (strokes, width, color, opacity, y, list) => {
      const { geometry, length } = ribbonGeometry(strokes, width, y);
      const m = inkMaterial(color, opacity);
      const mesh = new THREE.Mesh(geometry, m); mesh.renderOrder = 2; scene.add(mesh);
      const item = { mesh, mat: m, length, strokes, op: opacity }; list.push(item); return item;
    };
    function buildModel(route, delay) {
      const spec = specFor(route); const L = layoutSpec(spec);
      const M = { route, spec, kind: spec.kind, nodes: L.nodes, byId: L.byId, edges: L.edges, ink: [], guides: [], meshes: [], mats: [], geos: [], labels: [], t0: now + delay, retireAt: null };
      M.speed = spec.kind === 'arrival' && !arrivedOnce ? 1 : 1.55;
      const { nodes, edges } = M;
      const cx = (L.minX + L.maxX) / 2, cz = (L.minZ + L.maxZ) / 2;
      M.center = new THREE.Vector3(cx, 0.2, cz);
      const xs = [...new Set(nodes.map((n) => +n.x.toFixed(3)))], zs = [...new Set(nodes.map((n) => +n.z.toFixed(3)))];
      const gx0 = L.minX - 1.2, gx1 = L.maxX + 1.2, gz0 = L.minZ - 1.3, gz1 = L.maxZ + 1.2;
      xs.forEach((x, i) => M.guides.push({ item: inkOf([{ pts: [[x, gz0], [x, gz1]] }], 0.012, '#5d86c4', 0.45, 0.002, M.ink), s: 0.15 + i * 0.07, dur: 0.75 }));
      zs.forEach((z, i) => M.guides.push({ item: inkOf([{ pts: [[gx0, z], [gx1, z]] }], 0.012, '#5d86c4', 0.45, 0.002, M.ink), s: 0.2 + i * 0.07, dur: 0.9 }));
      {
        const dz = L.minZ - (portrait ? 0.55 : 0.6), x0 = L.minX, x1 = L.maxX;
        const strokes = [{ pts: [[x0, dz], [x1, dz]] }, { pts: [[x0, dz - 0.14], [x0, dz + 0.14]] }, { pts: [[x1, dz - 0.14], [x1, dz + 0.14]] },
          { pts: [[x0 + 0.18, dz - 0.07], [x0, dz], [x0 + 0.18, dz + 0.07]] }, { pts: [[x1 - 0.18, dz - 0.07], [x1, dz], [x1 - 0.18, dz + 0.07]] }];
        xs.forEach((x) => strokes.push({ pts: [[x, dz - 0.07], [x, dz + 0.07]] }));
        M.guides.push({ item: inkOf(strokes.map((s) => ({ ...s, offset: 0 })), 0.014, INK, 0.55, 0.004, M.ink), s: 0.5, dur: 0.9, flat: true });
      }
      for (const n of nodes) {
        const pts = outline(n.shape, n.w, n.d).map(([x, z]) => [x + n.x, z + n.z]);
        n.ink = inkOf([{ pts, closed: true }], 0.03, INK, 0.92, 0.004, M.ink);
        if (n.brass) {
          const inner = outline(n.shape, n.w - 0.16, n.d - 0.16).map(([x, z]) => [x + n.x, z + n.z]);
          n.ink2 = inkOf([{ pts: inner, closed: true }], 0.012, '#8a5a12', 0.8, 0.004, M.ink);
        }
        if (spec.strike) {
          const hw = n.w / 2 - 0.12, hd = n.d / 2 - 0.1;
          n.strikeInk = inkOf([{ pts: [[n.x - hw, n.z - hd], [n.x + hw, n.z + hd]] }, { pts: [[n.x + hw, n.z - hd], [n.x - hw, n.z + hd]] }], 0.034, RED, 0.85, 0.006, M.ink);
        }
        if (!spec.flat) {
          const shp = makeShape(outline(n.shape, n.w, n.d));
          const geo = new THREE.ExtrudeGeometry(shp, { depth: 1, bevelEnabled: false, curveSegments: 8 });
          geo.rotateX(-Math.PI / 2);
          const mat = paperMat.clone(); mat.emissive = new THREE.Color('#ff9a2a'); mat.emissiveIntensity = 0;
          const blk = new THREE.Mesh(geo, mat);
          blk.position.set(n.x, 0, n.z); blk.castShadow = true; blk.receiveShadow = true; blk.visible = false;
          blk.userData.node = n;
          const eg = new THREE.EdgesGeometry(geo, 30);
          blk.add(new THREE.LineSegments(eg, edgeMat));
          scene.add(blk); M.meshes.push(blk); M.geos.push(geo, eg); M.mats.push(mat);
          n.block = blk; n.mat = mat;
          if (n.brass) {
            const pg = new THREE.ExtrudeGeometry(makeShape(outline(n.shape, n.w - 0.2, n.d - 0.2)), { depth: 0.035, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.012, bevelSegments: 2, curveSegments: 8 });
            pg.rotateX(-Math.PI / 2);
            const plate = new THREE.Mesh(pg, brassMat); plate.castShadow = true; plate.visible = false;
            plate.position.set(n.x, 0, n.z); plate.userData.node = n; scene.add(plate);
            M.meshes.push(plate); M.geos.push(pg); n.plate = plate;
          }
        }
        // hit target for flat (withdrawn) parts
        if (spec.flat) {
          const hg = new THREE.PlaneGeometry(n.w, n.d); hg.rotateX(-Math.PI / 2);
          const hm = new THREE.MeshBasicMaterial({ visible: false });
          const hit = new THREE.Mesh(hg, hm); hit.position.set(n.x, 0.01, n.z); hit.userData.node = n; scene.add(hit);
          M.meshes.push(hit); M.geos.push(hg); M.mats.push(hm); n.hit = hit;
        }
        n.lift = 0; n.hot = 0; n.rise = 0; n.top = 0;
        const b = el('button', 'fab-label' + (spec.strike ? ' struck' : '')); b.type = 'button';
        b.appendChild(el('span', 'n', n.label));
        if (n.tag) { const pp = el('span', 'p'); if (n.tagPre) pp.appendChild(el('span', 'bi', n.tagPre)); pp.appendChild(document.createTextNode(n.tag)); b.appendChild(pp); }
        b.setAttribute('aria-label', `${n.label}${n.tag ? ', ' + (n.tagPre || '') + n.tag : ''}`);
        labelsLayer.appendChild(b); n.label$ = b; M.labels.push(b);
        on(b, 'click', () => act(n));
        on(b, 'pointerenter', () => setHover(n));
        on(b, 'pointerleave', () => setHover(null));
        on(b, 'focus', () => setHover(n));
        on(b, 'blur', () => setHover(null));
      }
      for (const e of edges) {
        const p = e.pts, n = p.length;
        const [ax, az] = p[n - 2], [bx, bz] = p[n - 1];
        const Ln = Math.hypot(bx - ax, bz - az) || 1, ux = (bx - ax) / Ln, uz = (bz - az) / Ln;
        const arrow = [[bx - ux * 0.2 - uz * 0.1, bz - uz * 0.2 + ux * 0.1], [bx, bz], [bx - ux * 0.2 + uz * 0.1, bz - uz * 0.2 - ux * 0.1]];
        e.ink = inkOf([{ pts: p }, { pts: arrow, offset: e.len }], 0.026, INK, 0.9, 0.004, M.ink);
        if (spec.flat) continue;
        const path = new THREE.CurvePath();
        const pts3 = p.map((q) => new THREE.Vector3(q[0], 0, q[1])); const rr = 0.28;
        let cur = pts3[0].clone();
        for (let i = 1; i < pts3.length; i++) {
          if (i === pts3.length - 1) { path.add(new THREE.LineCurve3(cur, pts3[i].clone())); break; }
          const inDir = pts3[i].clone().sub(pts3[i - 1]).normalize(), outDir = pts3[i + 1].clone().sub(pts3[i]).normalize();
          const r = Math.min(rr, pts3[i].distanceTo(pts3[i - 1]) / 2, pts3[i + 1].distanceTo(pts3[i]) / 2);
          const c0 = pts3[i].clone().addScaledVector(inDir, -r), c1 = pts3[i].clone().addScaledVector(outDir, r);
          if (cur.distanceTo(c0) > 1e-4) path.add(new THREE.LineCurve3(cur, c0));
          path.add(new THREE.QuadraticBezierCurve3(c0, pts3[i].clone(), c1)); cur = c1;
        }
        const tg = new THREE.TubeGeometry(path, Math.max(24, Math.round(e.len * 18)), 0.026, 8, false);
        const mat = railMat.clone(); mat.emissive = new THREE.Color('#ffae3d'); mat.emissiveIntensity = 0;
        const rail = new THREE.Mesh(tg, mat); rail.castShadow = true; rail.visible = false; scene.add(rail);
        M.meshes.push(rail); M.geos.push(tg); M.mats.push(mat);
        e.rail = rail; e.tg = tg; e.mat = mat; e.path = path; e.idxCount = tg.index.count;
        e.posts = p.slice(1, -1).concat([[(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2]]).map((qq) => {
          const m = new THREE.Mesh(postGeo, railMat); m.position.set(qq[0], 0, qq[1]); m.scale.y = 0.001; m.visible = false; m.castShadow = true; scene.add(m); M.meshes.push(m); return m;
        });
        e.beads = [0, 0.5].map((o) => {
          const bm = new THREE.MeshStandardMaterial({ color: '#fff1cf', emissive: new THREE.Color('#ffb84d'), emissiveIntensity: 1.6, roughness: 0.4 });
          const b = new THREE.Mesh(beadGeo, bm); b.visible = false; scene.add(b); M.meshes.push(b); M.mats.push(bm); return { m: b, o };
        });
      }
      M.adj = {}; for (const e of edges) { (M.adj[e.a] ||= { o: [], i: [] }).o.push(e); (M.adj[e.b] ||= { o: [], i: [] }).i.push(e); }
      // timeline
      M.nodeStart = (n) => 0.7 + n.k * (nodes.length > 7 ? 0.17 : 0.22);
      let edgeEnd = Math.max(...nodes.map((n) => M.nodeStart(n) + 0.75));
      for (const e of edges) { e.s = Math.max(M.nodeStart(L.byId[e.a]), M.nodeStart(L.byId[e.b])) + 0.55 + e.j * 0.04; e.dur = 0.35 + e.len * 0.09; edgeEnd = Math.max(edgeEnd, e.s + e.dur); }
      M.E = edgeEnd + (spec.strike ? 0.9 : 0.35);
      // camera framing points
      M.corners0 = []; M.corners1 = [];
      for (const x of [L.minX - 0.15, L.maxX + 0.15]) for (const z of [L.minZ - 0.75, L.maxZ + 0.2]) M.corners0.push(new THREE.Vector3(x, 0, z));
      for (const n of nodes) for (const dx of [-1, 1]) for (const dz of [-1, 1]) { const ex = n.ext[0] * dx, ez = n.ext[1] * dz; M.corners1.push(new THREE.Vector3(n.x + ex, 0, n.z + ez), new THREE.Vector3(n.x + ex, n.H * 1.15 + 0.45, n.z + ez)); }
      return M;
    }
    function disposeModel(M) {
      for (const m of M.meshes) scene.remove(m);
      for (const it of M.ink) { scene.remove(it.mesh); it.mesh.geometry.dispose(); it.mat.dispose(); }
      for (const g of M.geos) g.dispose();
      for (const m of M.mats) m.dispose();
      for (const l of M.labels) l.remove();
    }

    function act(n) {
      if (n.act === 'part') openPart(n);
      else if (n.act === 'case') location.hash = `#work/${n.slug}`;
      else if (n.act === 'scroll') { if (portrait && read.classList.contains('full')) { /* already reading */ } scrollToNode(n.id); }
    }

    // hover: light the whole path through a node
    let hoverNode = null, litNodes = new Set(), litEdges = new Set();
    function setHover(n, force) {
      if (panelNode && !force && n !== panelNode) n = n || panelNode;
      if (!n && panelNode) n = panelNode;
      if (n && model && !model.nodes.includes(n)) n = null;
      hoverNode = n; litNodes = new Set(); litEdges = new Set();
      if (n && model) {
        const walk = (id, dir) => { litNodes.add(id); for (const e of (model.adj[id] || { o: [], i: [] })[dir]) { if (!litEdges.has(e)) { litEdges.add(e); walk(dir === 'o' ? e.b : e.a, dir); } } };
        walk(n.id, 'o'); walk(n.id, 'i');
      }
      if (model) for (const m of model.nodes) { m.label$.classList.toggle('hot', m === n); m.label$.classList.toggle('dim', !!n && !litNodes.has(m.id)); }
      kickRender();
    }

    // ───────────── camera framing ─────────────
    let W = 1, H = 1, panelShift = 0, panelShiftTarget = 0;
    const tmp = new THREE.Vector3();
    const target = new THREE.Vector3();
    function placeCamera(dist, elev, az, tgt) {
      camera.position.set(tgt.x + Math.sin(az) * Math.cos(elev) * dist, tgt.y + Math.sin(elev) * dist, tgt.z + Math.cos(az) * Math.cos(elev) * dist);
      camera.up.set(0, 1, 0); camera.lookAt(tgt); camera.updateMatrixWorld();
    }
    function setOffset(sx, sy) { camera.setViewOffset(W, H, -sx, -sy, W, H); camera.updateProjectionMatrix(); }
    function fits(dist, elev, az, R, pts, tgt) {
      placeCamera(dist, elev, az, tgt);
      for (const c of pts) {
        tmp.copy(c).project(camera);
        const px = (tmp.x + 1) / 2 * W, py = (1 - tmp.y) / 2 * H;
        if (px < R.l || px > W - R.r || py < R.t || py > H - R.b) return false;
      }
      return true;
    }
    function fitDist(elev, azs, R, pts, tgt) {
      // fit, then re-centre the projected model inside R (perspective makes it lopsided), then fit again
      let ox = 0, oy = 0, d = 20;
      for (let pass = 0; pass < 3; pass++) {
        setOffset((R.l - R.r) / 2 + ox, (R.t - R.b) / 2 + oy);
        let lo = 2, hi = 160;
        for (let i = 0; i < 26; i++) { const mid = (lo + hi) / 2; if (azs.every((a) => fits(mid, elev, a, R, pts, tgt))) hi = mid; else lo = mid; }
        d = hi;
        placeCamera(d, elev, azs[Math.floor(azs.length / 2)], tgt);
        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        for (const c of pts) { tmp.copy(c).project(camera); const px = (tmp.x + 1) / 2 * W, py = (1 - tmp.y) / 2 * H; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
        ox += (R.l + (W - R.r)) / 2 - (x0 + x1) / 2; oy += (R.t + (H - R.b)) / 2 - (y0 + y1) / 2;
      }
      return { d, ox, oy };
    }
    let split = false;
    function poseFor(M) {
      const rb = root.getBoundingClientRect();
      const sideM = W < 700 ? 10 : 30;
      let R0, R1, e0, e1, az1, sway;
      if (M.kind === 'arrival') {
        const qb = q.getBoundingClientRect().bottom - rb.top, sb = sub.getBoundingClientRect().bottom - rb.top;
        const bt = block.getBoundingClientRect().top - rb.top;
        R0 = { l: sideM, r: sideM, t: qb + (W < 700 ? 18 : 30), b: 26 };
        if (split) {
          const lc = Math.max(head.getBoundingClientRect().right, block.getBoundingClientRect().right) - rb.left;
          R1 = { l: lc + 16, r: 24, t: 132, b: 44 }; e1 = 0.6; az1 = -0.5; sway = 0.2;
        } else {
          R1 = { l: sideM, r: sideM, t: sb + (W < 700 ? 58 : 70), b: H - bt + 10 };
          e1 = portrait ? 0.74 : 0.62; az1 = portrait ? -0.06 : -0.35; sway = portrait ? 0.1 : 0.18;
        }
        e0 = 1.36;
      } else {
        if (W >= 700) {
          const rr = read.getBoundingClientRect();
          R1 = { l: sideM, r: rb.right - rr.left + 24, t: 140, b: 40 };
        } else {
          const rr = read.getBoundingClientRect();
          R1 = { l: 10, r: 10, t: 150, b: Math.max(60, rb.bottom - rr.top + 10) };
        }
        R0 = R1;
        e0 = 1.12; e1 = M.spec.flat ? 0.85 : (portrait ? 1.08 : 0.62); az1 = M.spec.flat ? 0 : (portrait ? -0.06 : -0.42); sway = M.spec.flat ? 0.06 : 0.16;
      }
      M.R0 = R0; M.R1 = R1; M.e0 = e0; M.e1 = e1; M.az1 = az1; M.sway = sway;
      M.F0 = fitDist(e0, [0], R0, M.corners0, M.center);
      M.F1 = fitDist(e1, [az1 - sway * 0.5, az1, az1 + sway * 0.5], R1, M.corners1, M.center); M.F1.d *= 1.03;
      if (M.kind === 'sheet' && M.spec.flat) { const minD = portrait ? 10 : 11; M.F0.d = Math.max(M.F0.d, minD); M.F1.d = Math.max(M.F1.d, minD); }
    }
    function layoutView() {
      W = root.clientWidth || 1; H = root.clientHeight || 1;
      renderer.setPixelRatio(dprFor());
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      renderer.shadowMap.needsUpdate = true;
      split = W >= 1000 && W / H > 1.15;
      wrap.classList.toggle('split', split);
      if (model) poseFor(model);
      kickRender();
    }

    // ───────────── interaction ─────────────
    let userAz = 0, userEl = 0, userAzT = 0, userElT = 0, zoom = 1, zoomT = 1, lastInteract = -99;
    let dragging = false, downX = 0, downY = 0, lastX = 0, lastY = 0, moved = 0;
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const cvs = renderer.domElement;
    function pick(ev) {
      if (!model) return null;
      const r = cvs.getBoundingClientRect();
      ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(model.meshes.filter((p) => p.userData.node && (p.visible || p === p.userData.node.hit)), false)[0];
      return hit ? hit.object.userData.node : null;
    }
    on(cvs, 'pointerdown', (ev) => { dragging = true; moved = 0; downX = lastX = ev.clientX; downY = lastY = ev.clientY; cvs.setPointerCapture(ev.pointerId); cvs.classList.add('drag'); setIdx(false); });
    on(cvs, 'pointermove', (ev) => {
      if (dragging) {
        const dx = ev.clientX - lastX, dy = ev.clientY - lastY; lastX = ev.clientX; lastY = ev.clientY;
        moved = Math.max(moved, Math.hypot(ev.clientX - downX, ev.clientY - downY));
        userAzT -= dx * 0.006; userElT = clamp(userElT + dy * 0.004, -0.42, 0.6);
        lastInteract = now; kickRender();
      } else if (ev.pointerType === 'mouse') {
        const n = pick(ev); if (n !== hoverNode && !panelNode) setHover(n);
        cvs.style.cursor = n ? 'pointer' : '';
      }
    });
    const up = (ev) => {
      if (!dragging) return; dragging = false; cvs.classList.remove('drag');
      try { cvs.releasePointerCapture(ev.pointerId); } catch (_) { /* already released */ }
      if (moved < 7) { const n = pick(ev); if (n) act(n); else if (panelNode) closePanel(); }
    };
    on(cvs, 'pointerup', up); on(cvs, 'pointercancel', up);
    on(cvs, 'pointerleave', () => { if (!dragging && !panelNode) setHover(null); });
    on(cvs, 'wheel', (ev) => { ev.preventDefault(); zoomT = clamp(zoomT * Math.exp(ev.deltaY * 0.0012), 0.6, 1.35); lastInteract = now; kickRender(); }, { passive: false });
    on(window, 'resize', layoutView);
    on(window, 'keydown', (ev) => {
      if (ev.key !== 'Escape') return;
      if (idx.classList.contains('open')) { setIdx(false); idxBtn.focus(); return; }
      if (panelNode) { closePanel(); return; }
      if (route.sec === 'work' && route.slug) location.hash = '#work';
      else if (route.sec) location.hash = '#';
    });

    // ───────────── routing (hash deep links; back button works) ─────────────
    const parse = () => {
      const h = decodeURIComponent((location.hash || '').replace(/^#\/?/, ''));
      const [sec, slug] = h.split('/');
      if (sec === 'work' && slug && workBy[slug]) return { sec: 'work', slug };
      if (SECTIONS.some((s) => s[0] === sec)) return { sec, slug: null };
      return { sec: '', slug: null };
    };
    const routeKey = (r) => r.sec + '/' + (r.slug || '');
    let route = { sec: null, slug: null }, model = null, retiring = [], arrivedOnce = false;
    function go(r, first) {
      if (routeKey(r) === routeKey(route)) return;
      route = r;
      if (panelNode) closePanel(); setIdx(false);
      const isSheet = !!r.sec;
      wrap.classList.toggle('sheet', isSheet);
      read.classList.remove('full');
      if (isSheet) buildRead(r);
      for (const [h, s, a] of idxLinks) a.classList.toggle('cur', h === r.sec && (s || null) === (r.slug || null));
      const cur = SECTIONS.find((s) => s[0] === r.sec) || SECTIONS[0];
      idxCur.textContent = r.slug ? workBy[r.slug].name : `${cur[1]} ${cur[2]}`;
      if (model) { model.retireAt = now; for (const l of model.labels) l.classList.add('gone'); retiring.push(model); }
      userAzT = 0; userElT = 0; zoomT = 1; hoverNode = null; litNodes = new Set(); litEdges = new Set();
      model = buildModel(r, first ? 0 : 0.35);
      poseFor(model);
      if (!first && isSheet) read.focus({ preventScroll: true });
      if (!first) cam.snap = false;
      kickRender();
    }
    on(window, 'hashchange', () => go(parse()));

    // ───────────── per-frame ─────────────
    const quoteDur = Math.min(1.4, 0.03 * chars.length);
    let now = 0, raf = 0, t0 = performance.now(), needRender = true, alive = true, lastT = performance.now();
    function kickRender() { needRender = true; if (reduced && !raf && alive) raf = requestAnimationFrame(frame); }
    const v3 = new THREE.Vector3();
    const cam = { dist: 20, elev: 1.3, az: 0, ox: 0, oy: 0, tx: 0, ty: 0, tz: 0, snap: true };
    let curTop = 0;

    function updateModel(M, dt, pensUsed) {
      const T = reduced ? 999 : (now - M.t0) * M.speed;
      const ret = M.retireAt != null ? clamp((now - M.retireAt) / 0.55) : 0;
      const fade = 1 - ret;
      let p = pensUsed;
      const placePen = (item, prog) => {
        if (p >= pens.length || prog <= 0 || prog >= item.length || ret > 0) return;
        let acc = 0;
        for (const s of item.strokes) {
          const pts = s.closed ? [...s.pts, s.pts[0]] : s.pts; acc = s.offset != null ? s.offset : acc;
          for (let i = 0; i < pts.length - 1; i++) {
            const Lh = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
            if (prog <= acc + Lh) { const u = (prog - acc) / (Lh || 1); pens[p].position.set(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, 0.03, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u); pens[p].visible = true; p++; return; }
            acc += Lh;
          }
        }
      };
      const setInk = (item, k) => { item.mat.uniforms.uProg.value = k * item.length + (k >= 1 ? 1 : 0); item.mat.uniforms.uOpacity.value = item.op * fade; };
      for (const g of M.guides) { const k = easeInOut((T - g.s) / g.dur); setInk(g.item, k); if (g.flat) placePen(g.item, k * g.item.length); }
      for (const n of M.nodes) {
        const s = M.nodeStart(n), k = easeInOut((T - s) / 0.75);
        setInk(n.ink, k); placePen(n.ink, k * n.ink.length);
        if (n.ink2) setInk(n.ink2, easeInOut((T - s - 0.35) / 0.6));
        if (n.strikeInk) { const ks = easeInOut((T - M.E + 0.7) / 0.5); setInk(n.strikeInk, ks); placePen(n.strikeInk, ks * n.strikeInk.length); }
        if (T > s + 0.45 && ret === 0) n.label$.classList.add('on');
        const gs = M.E + 0.3 + n.k * 0.13, gk = clamp((T - gs) / 1.25);
        const grow = easeOutBack(gk, 1.25) * (1 - easeInOut(ret));
        const heat = gk > 0 && gk < 1 ? Math.sin(gk * Math.PI) : 0;
        n.ink.mat.uniforms.uHeat.value = heat * 0.9;
        const lit = M === model && litNodes.has(n.id), hot = M === model && hoverNode === n;
        const pl = n.lift; n.lift += ((hot ? 0.09 : 0) - n.lift) * Math.min(1, dt * 10);
        if (Math.abs(n.lift - pl) > 1e-4) renderer.shadowMap.needsUpdate = true;
        n.hot += (((hot ? 0.35 : lit ? 0.16 : 0)) - n.hot) * Math.min(1, dt * 8);
        const h = Math.max(0, n.H * grow);
        if (n.block) {
          n.block.visible = h > 0.004;
          n.block.scale.y = Math.max(0.004, h); n.block.position.y = n.lift;
          n.mat.emissiveIntensity = heat * 0.55 + n.hot;
          if (n.plate) { n.plate.visible = gk > 0.15 && h > 0.004; n.plate.position.y = h + n.lift; }
        }
        n.top = h + n.lift + (n.plate ? 0.05 : 0);
        n.rise = M.spec.flat ? (T > M.E ? 1 : 0) : gk;
        if (M.spec.flat) n.top = 0.12;
      }
      for (const e of M.edges) {
        const k = easeInOut((T - e.s) / e.dur);
        setInk(e.ink, k); placePen(e.ink, k * e.len);
        if (!e.rail) continue;
        const rs = M.E + 1.0 + e.j * 0.1, rk = clamp((T - rs) / 0.9) * fade;
        e.rail.visible = rk > 0;
        e.tg.setDrawRange(0, Math.floor(easeInOut(rk) * e.idxCount / 3) * 3);
        const ry = RAIL_Y * smooth(rk * 1.4);
        e.rail.position.y = ry;
        for (const m of e.posts) { m.visible = ry > 0.01; m.scale.y = Math.max(0.001, ry); }
        const lit = M === model && litEdges.has(e);
        e.mat.emissiveIntensity += ((lit ? 0.9 : 0) - e.mat.emissiveIntensity) * Math.min(1, dt * 8);
        const bk = clamp((T - (M.E + 2.0)) / 0.8) * fade;
        for (const b of e.beads) {
          b.m.visible = bk > 0; if (!b.m.visible) continue;
          const speed = lit ? 0.5 : 0.22;
          b.ph = ((b.ph ?? b.o) + dt * speed * (reduced ? 0 : 1) / Math.max(0.6, e.len / 2)) % 1;
          e.path.getPointAt(b.ph, v3); b.m.position.set(v3.x, ry, v3.z);
          b.m.scale.setScalar(bk * (lit ? 1.35 : 1));
          b.m.material.emissiveIntensity = lit ? 3 : 1.4;
        }
      }
      if (T < M.E + 3.5 || (ret > 0 && ret < 1)) renderer.shadowMap.needsUpdate = true;
      M.T = T; M.ret = ret;
      return p;
    }

    function update(dt) {
      // arrival headline: letters write themselves in; sub-line and title block after the rise
      if (model.kind === 'arrival') {
        const T = reduced ? 999 : (now - model.t0) * model.speed;
        const shown = Math.floor(clamp((T - 0.15) / quoteDur) * chars.length);
        for (let i = 0; i < chars.length; i++) if (i < shown && !chars[i].classList.contains('on')) chars[i].classList.add('on');
        if (T > model.E + 1.2) sub.classList.add('on');
        if (T > model.E + 1.6) { block.classList.add('on'); if (!arrivedOnce) { arrivedOnce = true; } }
        if (T > model.E + 2.6) hint.classList.add('on');
      }
      let p = 0;
      for (const M of retiring) p = updateModel(M, dt, p);
      p = updateModel(model, dt, p);
      for (let i = p; i < pens.length; i++) pens[i].visible = false;
      retiring = retiring.filter((M) => { if (M.ret >= 1) { disposeModel(M); return false; } return true; });

      // camera: lean over the sheet while drawing, step back as it rises, then a gentle sway
      const M = model, T = M.T;
      const ck = easeInOut((T - M.E) / 2.4);
      const sway = reduced ? 0 : M.sway * Math.sin((T - M.E - 2.4) * 0.17) * smooth((T - M.E - 2.4) / 3);
      const idle = smooth((now - lastInteract - 2) / 3);
      userAz += (userAzT - userAz) * Math.min(1, dt * 6);
      userEl += (userElT - userEl) * Math.min(1, dt * 6);
      zoom += (zoomT - zoom) * Math.min(1, dt * 6);
      panelShift += (panelShiftTarget - panelShift) * Math.min(1, dt * 5);
      const tElev = M.e0 + (M.e1 - M.e0) * ck, tDist = (M.F0.d + (M.F1.d - M.F0.d) * ck);
      const tAz = M.az1 * ck + sway * idle;
      const tOx = M.F0.ox + (M.F1.ox - M.F0.ox) * ck + (M.R0.l - M.R0.r + (M.R1.l - M.R1.r - M.R0.l + M.R0.r) * ck) / 2;
      const tOy = M.F0.oy + (M.F1.oy - M.F0.oy) * ck + (M.R0.t - M.R0.b + (M.R1.t - M.R1.b - M.R0.t + M.R0.b) * ck) / 2;
      const kk = cam.snap || reduced ? 1 : 1 - Math.exp(-dt * 3.2);
      cam.dist += (tDist - cam.dist) * kk; cam.elev += (tElev - cam.elev) * kk; cam.az += (tAz - cam.az) * kk;
      cam.ox += (tOx - cam.ox) * kk; cam.oy += (tOy - cam.oy) * kk;
      cam.tx += (M.center.x - cam.tx) * kk; cam.ty += (M.center.y - cam.ty) * kk; cam.tz += (M.center.z - cam.tz) * kk;
      target.set(cam.tx, cam.ty, cam.tz);
      placeCamera(cam.dist * zoom, clamp(cam.elev + userEl, 0.22, 1.45), cam.az + userAz, target);
      panelShiftTarget = panelNode && W >= 700 ? -Math.min(W * 0.14, 200) : 0;
      setOffset(cam.ox + panelShift, cam.oy);
      curTop = M.kind === 'arrival' ? M.R0.t + (M.R1.t - M.R0.t) * ck : M.R1.t;

      // labels: projected to each part (flat on paper, then riding on top of the risen block)
      for (const MM of [...retiring, model]) for (const n of MM.nodes) {
        v3.set(n.x, n.top + 0.04, n.z).project(camera);
        const x = (v3.x + 1) / 2 * W, y = (1 - v3.y) / 2 * H;
        const onFace = portrait && MM.kind === 'sheet'; // phones: labels sit on each part's top face, so rows never collide
        const flat = n.rise < 0.5 || onFace;
        const ty = flat ? -0.5 : -1;
        const hx = portrait && !flat ? (n.x < MM.center.x - 0.1 ? -0.78 : n.x > MM.center.x + 0.1 ? -0.22 : -0.5) : -0.5;
        if (n.lwUp !== !flat || !n.lw) { n.lw = n.label$.offsetWidth; n.lh = n.label$.offsetHeight; n.lwUp = !flat; }
        const lx = clamp(x + hx * n.lw, 6, Math.max(6, W - n.lw - 6));
        const ly = y + ty * n.lh + (flat ? 0 : -10);
        n.label$.style.transform = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px)`;
        n.label$.classList.toggle('up', !flat || (onFace && n.rise > 0.5));
        n.label$.classList.toggle('face', onFace);
        n.label$.classList.toggle('off', y < curTop - (portrait && MM.kind === 'sheet' ? 20 : 46) || y > H + 20);
        n.label$.style.zIndex = String(Math.round(1000 - v3.z * 500));
      }
    }

    function frame(tms) {
      raf = 0;
      if (!alive) return;
      const dt = Math.min(0.05, (tms - lastT) / 1000); lastT = tms;
      now = (tms - t0) / 1000;
      update(reduced ? 1 / 30 : dt);
      cam.snap = false;
      renderer.render(scene, camera);
      needRender = false;
      if (!reduced) raf = requestAnimationFrame(frame);
      else {
        const settling = Math.abs(userAzT - userAz) > 1e-4 || Math.abs(userElT - userEl) > 1e-4 || Math.abs(zoomT - zoom) > 1e-4 || Math.abs(panelShiftTarget - panelShift) > 0.3 || retiring.length ||
          model.nodes.some((n) => Math.abs(n.hot - (hoverNode === n ? 0.35 : litNodes.has(n.id) ? 0.16 : 0)) > 0.005);
        if (settling || needRender) raf = requestAnimationFrame(frame);
      }
    }
    const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf && alive) { lastT = performance.now(); raf = requestAnimationFrame(frame); } };
    on(document, 'visibilitychange', onVis);

    try { await Promise.race([document.fonts.load('600 14px "Barlow Condensed"'), new Promise((r) => setTimeout(r, 900))]); } catch (_) { /* fonts optional */ }
    if (!alive) return () => {};
    layoutView();
    t0 = performance.now(); lastT = t0; now = 0;
    const first = parse();
    if (first.sec) { arrivedOnce = true; chars.forEach((c) => c.classList.add('on')); sub.classList.add('on'); block.classList.add('on'); }
    go(first, true);
    // compile every material up front (hidden parts included) so the rise never stalls on a shader compile
    const hidden = []; scene.traverse((o) => { if (!o.visible) { hidden.push(o); o.visible = true; } });
    try { renderer.compile(scene, camera); } catch (_) { /* best effort */ }
    for (const o of hidden) o.visible = false;
    raf = requestAnimationFrame(frame);

    return function unmount() {
      alive = false;
      cancelAnimationFrame(raf); raf = 0;
      for (const c of cleanups) c();
      for (const M of retiring) disposeModel(M);
      if (model) disposeModel(model);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        for (const m of ms) { if (m.map) m.map.dispose(); m.dispose(); }
      });
      for (const t of disposables) t.dispose();
      postGeo.dispose(); beadGeo.dispose(); edgeMat.dispose(); paperMat.dispose(); brassMat.dispose(); railMat.dispose(); penMat.dispose();
      envRT.dispose(); pmrem.dispose();
      renderer.dispose(); renderer.forceContextLoss();
      wrap.remove(); link.remove(); style.remove();
    };
  },
};
