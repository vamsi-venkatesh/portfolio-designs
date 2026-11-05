// World: motion — "Keyframes."
// The whole website is one animation on a visible timeline. Every scene is a pure function of the playhead time T,
// so the visitor can scrub it, drag a keyframe to re-time a scene, or swap the signature ease and watch the site
// replay with it. Holds are pause points: content there is still, legible and selectable.
// Facts: content.mjs only. Every number shown is an approved string; counters always settle on that exact string.

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@50..150,100..900&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&display=swap';

const PAPER = '#F3EEE3', INK = '#141210', ORANGE = '#F2703A', COBALT = '#2B36E0', MUSTARD = '#F2B32A', RED = '#E8331C', PINK = '#F4B9C4', MINT = '#63D2A3';
const FIELD = {
  'vvdex-platform': [ORANGE, INK], 'conxto': [COBALT, PAPER], 'vvdex-engine': ['#45C987', INK], 'unboundpdf': ['#EFEAE0', INK],
  'farmquick': [MUSTARD, INK], 'conxfolio': [PINK, INK], 'pitchradar': ['#E8452C', PAPER], 'vvdex-trading': ['#0E0D0B', MINT],
};
const PRESETS = [
  ['Signature', [0.76, 0, 0.24, 1]],
  ['Expo out', [0.16, 1, 0.3, 1]],
  ['Back out', [0.34, 1.56, 0.64, 1]],
  ['Material', [0.2, 0, 0, 1]],
  ['Sine', [0.37, 0, 0.63, 1]],
  ['Linear', [0, 0, 1, 1]],
];
const SCENE_IDS = ['arrival', 'work', 'how', 'withdrawn', 'capabilities', 'about', 'contact'];
const SCENE_NAME = { arrival: 'Arrival', work: 'Work', how: 'How I work', withdrawn: 'Claims I withdrew', capabilities: 'Capabilities', about: 'About', contact: 'Contact' };
const SCENE_TL = { arrival: PAPER, work: ORANGE, how: '#6C76FF', withdrawn: RED, capabilities: MUSTARD, about: '#9AA2FF', contact: ORANGE };
const SVGNS = 'http://www.w3.org/2000/svg';

// ---------- maths ----------
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, k) => a + (b - a) * k;
const pad2 = (n) => String(n).padStart(2, '0');
const easeIO = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
function bez(x1, y1, x2, y2) {
  if (x1 === y1 && x2 === y2) return (x) => clamp(x);
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t, sy = (t) => ((ay * t + by) * t + cy) * t, dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { const e = sx(t) - x; if (Math.abs(e) < 1e-7) break; const d = dx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
    if (!(t >= 0 && t <= 1) || Math.abs(sx(t) - x) > 1e-5) { let a = 0, b = 1; t = x; for (let i = 0; i < 40; i++) { const v = sx(t); if (Math.abs(v - x) < 1e-7) break; if (v < x) a = t; else b = t; t = (a + b) / 2; } }
    return sy(t);
  };
}
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixC = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${Math.round(lerp(A[0], B[0], k))},${Math.round(lerp(A[1], B[1], k))},${Math.round(lerp(A[2], B[2], k))})`; };
// count a number string up to its exact approved value; k>=1 returns the original string untouched
function countStr(str, k) {
  if (k >= 1) return str;
  k = Math.max(0, k);
  const re = /\d[\d,]*(?:\.\d+)?/g;
  const toks = str.match(re) || [];
  const val = (m) => parseFloat(m.replace(/,/g, ''));
  const fmt = (x, m) => { const dec = (m.split('.')[1] || '').length; return x.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: m.includes(',') }); };
  let i = 0;
  const arrow = str.includes('→'), ratio = / \/ | of /.test(str);
  return str.replace(re, (m) => {
    const idx = i++;
    if (arrow && toks.length === 2) return idx === 0 ? m : fmt(lerp(val(toks[0]), val(m), k), m);
    if (ratio && idx > 0) return m;
    return fmt(val(m) * k, m);
  });
}

export default {
  id: 'motion',
  color: PAPER,
  async mount(root, ctx) {
    const { person, work, principles, withdrawn, cases = {}, capabilities = [], about = { facts: [] } } = ctx;
    const reduced = !!ctx.reduced;
    const touch = !!ctx.isTouch;
    const cleanup = [];
    const timers = new Set();
    let alive = true;
    const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); cleanup.push(() => t.removeEventListener(ev, fn, opt)); };
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); return id; };
    const el = (tag, cls, text, parent) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; if (parent) parent.appendChild(n); return n; };
    const sv = (tag, attrs, parent) => { const n = document.createElementNS(SVGNS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
    const btn = (cls, label, parent, aria) => { const b = el('button', cls, label, parent); b.type = 'button'; if (aria) b.setAttribute('aria-label', aria); return b; };
    const ext = (cls, text, href, parent) => { const a = el('a', cls, text, parent); a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a; };

    // ---------- fonts + style ----------
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = FONT_HREF; document.head.appendChild(link);
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    const rootClass = root.className;
    root.classList.add('mvw');
    if (reduced) root.classList.add('is-reduced');

    // ---------- signature ease (the one curve every transition uses) ----------
    let sigPts = PRESETS[0][1].slice();
    let E = bez(...sigPts);
    const sigCss = () => `cubic-bezier(${sigPts.map((v) => +v.toFixed(2)).join(', ')})`;
    root.style.setProperty('--sig', sigCss());

    // ---------- the product order on the reel ----------
    const items = work.slice();
    const N = items.length;
    const idxOf = (slug) => items.findIndex((w) => w.slug === slug);
    const fieldOf = (slug) => FIELD[slug] || [PAPER, INK];

    // ---------- holds (keyframes) ----------
    const holds = [];
    holds.push({ scene: 'arrival', L: 5.6, min: 2.4, max: 10 });
    holds.push({ scene: 'work', sub: 0, L: 2.0, min: 0.6, max: 4 });
    for (let k = 1; k < N; k++) holds.push({ scene: 'work', sub: k, L: 1.1, min: 0.35, max: 3 });
    holds.push({ scene: 'how', L: 2.3, min: 0.6, max: 5 });
    holds.push({ scene: 'withdrawn', L: 2.4, min: 0.6, max: 5 });
    holds.push({ scene: 'capabilities', L: 1.9, min: 0.6, max: 5 });
    holds.push({ scene: 'about', L: 2.0, min: 0.6, max: 5 });
    holds.push({ scene: 'contact', L: 2.4, min: 0.6, max: 5 });
    const firstHold = {}; holds.forEach((h, i) => { if (firstHold[h.scene] == null) firstHold[h.scene] = i; });
    const workFirst = firstHold.work;
    let D = 0;
    const SI = {}; // scene timing
    function relayout() {
      let t = 0; holds.forEach((h) => { h.S = t; h.H = t + h.L; t = h.H; }); D = t + 0.7;
      SCENE_IDS.forEach((id, si) => {
        const f = firstHold[id]; const nx = SCENE_IDS[si + 1];
        SI[id] = { sIn: holds[f].S, hIn: holds[f].H, sOut: nx ? holds[firstHold[nx]].S : Infinity, hOut: nx ? holds[firstHold[nx]].H : Infinity, z: si + 1 };
      });
    }
    relayout();
    const segIdx = (T) => { for (let j = 0; j < holds.length; j++) if (T <= holds[j].H + 1e-6) return j; return holds.length - 1; };
    const holdAt = (T) => holds.findIndex((h) => Math.abs(h.H - T) < 1e-5);

    // ---------- DOM skeleton ----------
    const stage = el('div', 'stage', null, root);
    const defs = sv('svg', { width: 0, height: 0, class: 'defs', 'aria-hidden': 'true' }, root);
    const filt = sv('filter', { id: 'mv-mb', x: '-10%', y: '0%', width: '120%', height: '100%' }, defs);
    const blurNode = sv('feGaussianBlur', { stdDeviation: '0 0' }, filt);
    const cutSvg = sv('svg', { class: 'cutline', 'aria-hidden': 'true' }, root);
    const cutLine = sv('line', { stroke: RED, 'stroke-width': 3, 'stroke-linecap': 'square' }, cutSvg);
    const onion = el('canvas', 'onion', null, root); onion.setAttribute('aria-hidden', 'true');
    const og = onion.getContext('2d');
    const slate = el('div', 'slate', null, root); slate.setAttribute('aria-hidden', 'true');
    const slA = el('span', 'sl-a', 'Keyframes', slate), slB = el('span', 'sl-b', '', slate), slC = el('span', 'sl-c', '', slate);
    if (ctx.text) slC.textContent = `for “${ctx.text}”`;
    const live = el('div', 'sr', null, root); live.setAttribute('aria-live', 'polite');

    // geometry
    let W = 0, H = 0, TB = 88, phone = false;
    const TOP = 84;

    // =====================================================================================
    // SCENE: ARRIVAL — a title sequence. A keyframe diamond opens the floor; the name drops in; a bouncing ball
    // (the first exercise every animator does) rolls the surname up letter by letter and lands as its full stop.
    // =====================================================================================
    const ar = (() => {
      const ly = el('section', 'ly sc-arr', null, stage); ly.setAttribute('aria-label', 'Arrival');
      const slab = el('div', 'ar-slab', null, ly);
      const hair = el('div', 'ar-hair', null, ly);
      const floor = el('div', 'ar-floor', null, ly);
      const dia = el('div', 'ar-dia', null, ly);
      const trail = sv('svg', { class: 'ar-trail', 'aria-hidden': 'true' }, ly);
      const trailPath = sv('path', { fill: 'none', stroke: INK, 'stroke-width': 1, 'stroke-opacity': 0.55 }, trail);
      const trailDots = sv('g', {}, trail);
      const h1 = el('h1', 'ar-name disp', null, ly);
      const l1 = el('span', 'ar-l1', null, h1), l2 = el('span', 'ar-l2', null, h1);
      const L1 = [...person.first].map((c) => el('span', 'lt', c, l1));
      const L2 = [...person.last].map((c) => el('span', 'lt', c, l2));
      const mark = el('span', 'ar-mark', null, l2);
      const ball = el('div', 'ar-ball', null, ly);
      const role = el('p', 'ar-role disp', `${person.role} · ${person.city}`, ly);
      const lede = el('p', 'ar-lede', person.lede, ly);
      const hint = el('p', 'ar-hint', touch ? 'This whole site is one animation. Swipe, or drag the playhead below.' : 'This whole site is one animation. Press ▶, use the arrow keys, or drag the playhead below.', ly);
      let g = {};
      let frames = []; // trail samples
      function layout(shift = 0) {
        const pass2 = shift !== 0;
        ly.style.transform = '';
        const wd = phone ? 74 : 112;
        g.wd = wd;
        h1.style.fontSize = '100px';
        [...L1, ...L2].forEach((s) => { s.style.transform = ''; s.style.fontVariationSettings = `"wdth" ${wd}, "wght" 820`; s.style.opacity = 1; });
        const w2 = l2.getBoundingClientRect().width;
        const avail = phone ? W - 40 : Math.min(W - 200, 1240);
        const extra = phone ? 236 : 190;
        const stageAvail = H - TB - TOP - 20;
        const fsW = (avail / (w2 + 32)) * 100;
        const fsH = (stageAvail - extra) / 1.74;
        const fs = Math.max(34, Math.min(fsW, fsH, 250));
        g.fs = fs;
        h1.style.fontSize = fs + 'px';
        const r1 = l1.getBoundingClientRect(), r2 = l2.getBoundingClientRect();
        const blockW = r2.width + fs * 0.32;
        const x0 = phone ? 20 : Math.round((W - blockW) / 2);
        const blockH = fs * 1.74 + extra;
        const y0 = Math.round(TOP + Math.max(0, (stageAvail - blockH) / 2) - fs * 0.06 + shift);
        h1.style.left = x0 + 'px'; h1.style.top = y0 + 'px';
        const lr = ly.getBoundingClientRect();
        const mr = mark.getBoundingClientRect();
        const base = mr.top - lr.top;
        const lastR = L2[L2.length - 1].getBoundingClientRect();
        const r = fs * 0.095;
        const rr1 = l1.getBoundingClientRect();
        g = { ...g, x0, y0, base, r, w1: r1.width, w2: r2.width, L2x: lastR.right - lr.left, l1top: rr1.top - lr.top, l1h: rr1.height };
        g.px = g.L2x + fs * 0.05 + r; g.py = base - r;
        // ball contacts across the surname; heights shrink like a real bounce
        const left2 = x0;
        g.c = [left2 + g.w2 * 0.08, left2 + g.w2 * 0.39, left2 + g.w2 * 0.68, g.px];
        g.h = [0, fs * 0.92, fs * 0.55, fs * 0.27];
        const dd = [0, Math.sqrt(g.h[1]), Math.sqrt(g.h[2]), Math.sqrt(g.h[3])];
        const tot = dd[1] + dd[2] + dd[3];
        g.U = [0.42];
        g.U[1] = g.U[0] + 0.36 * dd[1] / tot; g.U[2] = g.U[1] + 0.36 * dd[2] / tot; g.U[3] = 0.78;
        g.sx = x0 - fs * 0.9; g.sy = Math.max(TOP - 40, y0 - fs * 0.35);
        // letter reveal times: the ball rolls each letter of the surname up as it passes over it
        g.rev = L2.map((s, i) => {
          const rc = s.getBoundingClientRect(); const cx = rc.left - lr.left + rc.width / 2;
          if (cx <= g.c[0]) return 0.40 + i * 0.012;
          for (let j = 1; j < 4; j++) if (cx <= g.c[j]) { const k = (cx - g.c[j - 1]) / (g.c[j] - g.c[j - 1]); return g.U[j - 1] + k * (g.U[j] - g.U[j - 1]) - 0.015; }
          return g.U[3] - 0.02;
        });
        // floor + slab + hairline
        Object.assign(slab.style, { left: '0px', top: (g.l1top - fs * 0.04) + 'px', width: (x0 + g.w1 + fs * 0.24) + 'px', height: (g.l1h + fs * 0.02) + 'px' });
        Object.assign(hair.style, { left: '0px', top: (base + fs * 0.07) + 'px', width: W + 'px' });
        Object.assign(floor.style, { left: x0 + 'px', top: (base + fs * 0.05) + 'px', width: (W - x0) + 'px', height: Math.max(3, fs * 0.035) + 'px' });
        const ds = Math.max(10, fs * 0.09);
        Object.assign(dia.style, { width: ds + 'px', height: ds + 'px', marginLeft: (-ds / 2) + 'px', marginTop: (-ds / 2) + 'px' });
        g.ds = ds;
        Object.assign(ball.style, { width: 2 * r + 'px', height: 2 * r + 'px', marginLeft: -r + 'px', marginTop: -r + 'px' });
        const ty = y0 + fs * 1.74 + (phone ? 10 : 16);
        Object.assign(role.style, { left: x0 + 'px', top: ty + 'px', fontSize: (phone ? 15 : 19) + 'px' });
        Object.assign(lede.style, { left: x0 + 'px', top: (ty + (phone ? 50 : 36)) + 'px', width: Math.min(phone ? W - 40 : 640, W - x0 - 20) + 'px' });
        const lh = lede.getBoundingClientRect().height;
        Object.assign(hint.style, { left: x0 + 'px', top: (ty + (phone ? 64 : 46) + lh) + 'px', width: Math.min(560, W - x0 - 20) + 'px' });
        trail.setAttribute('width', W); trail.setAttribute('height', H);
        // second pass: centre the composition (slab top to hint bottom) in the stage
        if (!pass2) {
          const top = g.l1top - fs * 0.04, bot = hint.getBoundingClientRect().bottom - lr.top;
          const want = TOP + (H - TB - TOP - (bot - top)) / 2;
          if (Math.abs(want - top) > 3) { layout(want - top); return; }
        }
        buildTrail();
      }
      function ballAt(u) {
        if (u < 0.32) return null;
        let x, y;
        if (u < g.U[0]) { const k = (u - 0.32) / (g.U[0] - 0.32); x = lerp(g.sx, g.c[0], k); y = lerp(g.sy, g.base - g.r, k * k); }
        else if (u < g.U[3]) { let j = 1; while (j < 3 && u > g.U[j]) j++; const k = (u - g.U[j - 1]) / (g.U[j] - g.U[j - 1]); x = lerp(g.c[j - 1], g.c[j], k); y = g.base - g.r - g.h[j] * 4 * k * (1 - k); }
        else { x = g.c[3]; y = g.base - g.r; }
        return { x, y };
      }
      function ballPose(u) {
        const p = ballAt(u); if (!p) return null;
        let sx = 1, sy = 1, rot = 0, st = 0;
        for (let j = 0; j < 4; j++) { const d = Math.abs(u - g.U[j]); const w = j === 3 ? 0.03 : 0.016; if (d < w && (j < 3 || u >= g.U[3] - w)) { const m = 1 - d / w; const amp = j === 3 ? (u < g.U[3] ? 1 : Math.max(0, 1 - (u - g.U[3]) / w)) : 1; sx = 1 + 0.4 * m * amp; sy = 1 - 0.34 * m * amp; } }
        if (sy === 1 && u < g.U[3] - 0.004) { const a = ballAt(u - 0.004), b = ballAt(u + 0.004); if (a && b) { const vx = b.x - a.x, vy = b.y - a.y; const v = Math.hypot(vx, vy) / g.r; st = Math.min(0.42, v * 0.09); rot = Math.atan2(vy, vx); } }
        return { x: p.x, y: sy !== 1 ? g.base - g.r * sy : p.y, sx, sy, st, rot };
      }
      function buildTrail() {
        const L = holds[0].L;
        const du = (1 / 24) / L;
        frames = [];
        for (let u = 0.32; u <= g.U[3] + 1e-9; u += du) { const p = ballAt(u); frames.push({ u, x: p.x, y: p.y }); }
        let d = '';
        const steps = 220; for (let i = 0; i <= steps; i++) { const u = 0.32 + (g.U[3] - 0.32) * i / steps; const p = ballAt(u); d += (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }
        trailPath.setAttribute('d', d);
        trailPath.style.strokeDasharray = trailPath.getTotalLength();
        while (trailDots.firstChild) trailDots.firstChild.remove();
        frames.forEach((f) => sv('circle', { cx: f.x.toFixed(1), cy: f.y.toFixed(1), r: 1.6, fill: INK }, trailDots));
      }
      const fv = (w, wt = 820) => `"wdth" ${w.toFixed(1)}, "wght" ${wt}`;
      function render(T, pIn, pOut) {
        const u = pIn;
        // keyframe diamond pops, the hairline opens out of it, the diamond slides to the start of the floor
        const dp = clamp(u / 0.06), dslide = E(clamp((u - 0.13) / 0.13));
        const dx = lerp(W / 2, g.x0, dslide), dsc = u < 0.06 ? E(dp) * (1 + 0.25 * Math.sin(dp * Math.PI)) : 1;
        dia.style.transform = `translate(${dx}px, ${g.base + g.fs * 0.07}px) rotate(45deg) scale(${dsc})`;
        const hp = E(clamp((u - 0.04) / 0.12));
        hair.style.transform = `scaleX(${hp})`; hair.style.transformOrigin = `${W / 2}px 50%`;
        const fp = E(clamp((u - 0.16) / 0.14));
        floor.style.transform = `scaleX(${fp})`;
        const sp = E(clamp((u - 0.09) / 0.15));
        const sw = parseFloat(slab.style.width) || 1;
        slab.style.transform = `translateX(${(sp - 1) * sw}px)`;
        // first name drops in, width axis landing from condensed to its set width
        L1.forEach((s, i) => {
          const k = clamp((u - 0.17 - i * 0.034) / 0.13), e = E(k);
          s.style.transform = `translateY(${(-(1 - e) * 0.95).toFixed(4)}em)`;
          s.style.opacity = clamp(k * 3);
          s.style.fontVariationSettings = fv(clamp(lerp(50, g.wd, e), 50, 150), Math.round(lerp(300, 820, clamp(e))));
        });
        L2.forEach((s, i) => {
          const k = clamp((u - g.rev[i]) / 0.075), e = E(k);
          s.style.transform = `translateY(${((1 - e) * 1.3).toFixed(4)}em)`;
          s.style.fontVariationSettings = fv(clamp(lerp(150, g.wd, e), 50, 150));
        });
        const b = ballPose(u);
        if (b) {
          ball.style.opacity = 1;
          ball.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rot}rad) scale(${1 + b.st}, ${1 / (1 + b.st)}) rotate(${-b.rot}rad) scale(${b.sx}, ${b.sy})`;
        } else ball.style.opacity = 0;
        // spacing chart: the dotted path the ball has travelled stays as a drawing
        const tp = clamp((u - 0.32) / (g.U[3] - 0.32));
        const len = parseFloat(trailPath.style.strokeDasharray) || 0;
        trailPath.style.strokeDashoffset = (len * (1 - tp)).toFixed(1);
        const shown = frames.filter((f) => f.u <= u).length;
        const dots = trailDots.childNodes;
        for (let i = 0; i < dots.length; i++) dots[i].style.opacity = i < shown ? 0.85 : 0;
        trail.style.opacity = 1 - clamp((u - 0.86) / 0.12) * 0.45;
        const rp = E(clamp((u - 0.8) / 0.12)), lp = E(clamp((u - 0.84) / 0.12)), hp2 = clamp((u - 0.9) / 0.1);
        role.style.transform = `translateY(${(1 - rp) * 18}px)`; role.style.opacity = clamp(rp);
        role.style.fontVariationSettings = fv(clamp(lerp(60, 118, rp), 50, 150), 640);
        lede.style.transform = `translateY(${(1 - lp) * 18}px)`; lede.style.opacity = clamp(lp);
        hint.style.opacity = hp2;
        // exit: the camera pushes into the full stop
        if (pOut > 0) { const k = E(pOut); ly.style.transformOrigin = `${g.px}px ${g.py}px`; ly.style.transform = `scale(${1 + 2.2 * k})`; }
        else ly.style.transform = '';
      }
      function prims(T) {
        const u = clamp(T / holds[0].L);
        const b = T <= holds[0].H ? ballPose(u) : null; const out = [];
        if (b) out.push({ t: 'c', x: b.x, y: b.y, r: g.r, sx: b.sx, sy: b.sy });
        return out;
      }
      const hero = (T) => { const b = ballAt(clamp(T / holds[0].L)); return b; };
      return { id: 'arrival', ly, layout, render, prims, hero, g: () => g };
    })();

    // =====================================================================================
    // SCENE: WORK — a reel of eight title cards. Each card is its own short choreography: the name sets on its
    // width axis, the line and numbers land, and a small diagram of what the product does plays once.
    // =====================================================================================
    const wk = (() => {
      const ly = el('section', 'ly sc-work', null, stage); ly.setAttribute('aria-label', 'Work');
      const strip = el('div', 'reel', null, ly);
      const cards = items.map((w, i) => {
        const [fc, tc] = fieldOf(w.slug);
        const c = el('article', 'card', null, strip);
        c.style.background = fc; c.style.color = tc; c.style.setProperty('--tc', tc); c.style.setProperty('--fc', fc);
        const top = el('div', 'c-top', null, c);
        const meta = el('p', 'c-meta', null, top);
        el('span', 'c-no disp', `${pad2(i + 1)} / ${pad2(N)}`, meta);
        el('span', 'c-kind', `${w.kind} · ${w.status}`, meta);
        const navs = el('div', 'c-navs', null, top);
        const pv = btn('c-nav', null, navs, 'Previous product'), nx = btn('c-nav', null, navs, 'Next product');
        [[pv, 'M12 4 L6 10 L12 16'], [nx, 'M8 4 L14 10 L8 16']].forEach(([b_, d]) => { const s_ = sv('svg', { viewBox: '0 0 20 20', width: 18, height: 18, 'aria-hidden': 'true' }, b_); sv('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'square' }, s_); });
        if (i === 0) pv.disabled = true; if (i === N - 1) nx.disabled = true;
        on(pv, 'click', () => goHold(workFirst + i - 1)); on(nx, 'click', () => goHold(workFirst + i + 1));
        const name = el('h2', 'c-name disp', w.name, c);
        const mid = el('div', 'c-mid', null, c);
        const left = el('div', 'c-left', null, mid);
        const one = el('p', 'c-one', w.one, left);
        const acts = el('div', 'c-acts', null, left);
        const play = btn('c-play', null, acts); play.setAttribute('aria-label', `Play the case: ${w.name}`);
        const tri = sv('svg', { viewBox: '0 0 12 12', width: 12, height: 12, 'aria-hidden': 'true' }, play); sv('path', { d: 'M2 1 L11 6 L2 11 Z', fill: 'currentColor' }, tri);
        el('span', null, 'Play the case', play);
        on(play, 'click', () => go(`#work/${w.slug}`));
        ext('c-link', 'Write-up ↗', `https://vamsi-venkatesh.github.io/portfolio-designs/inside-the-dot/work/${w.slug}/`, acts);
        if (w.url) ext('c-link', `${w.host} ↗`, w.url, acts);
        const right = el('div', 'c-right', null, mid);
        const nums = el('div', 'c-nums', null, right);
        const numEls = (w.numbers || []).slice(0, 2).map(([v, l]) => { const d = el('div', 'c-num', null, nums); const vv = el('span', 'c-v disp', v, d); el('span', 'c-l', l, d); return { vv, v }; });
        const stingSvg = sv('svg', { class: 'c-sting', viewBox: '0 0 120 120', 'aria-hidden': 'true' }, c);
        const sting = buildSting(w.slug, stingSvg, tc);
        return { w, c, name, meta, one, acts, nums, numEls, stingSvg, sting, wd: 100, fs: 100, el: [meta, one, acts, nums, stingSvg] };
      });
      let g = {};
      function layout() {
        const cardTop = TOP, cardH = Math.max(320, H - TB - TOP - (phone ? 10 : 22));
        const cw = phone ? W - 24 : Math.min(1180, W - 240);
        const gap = phone ? 10 : 34;
        g = { cardTop, cardH, cw, gap, step: cw + gap };
        strip.style.top = cardTop + 'px'; strip.style.height = cardH + 'px';
        cards.forEach((cd, i) => {
          Object.assign(cd.c.style, { left: i * g.step + 'px', width: cw + 'px', height: cardH + 'px' });
          const pad = phone ? 18 : 44;
          let fs = phone ? Math.min(64, cw * 0.17) : Math.min(cw * 0.125, cardH * 0.2, 150);
          let wd = fitWdth(cd.w.name, fs, 820, cw - pad * 2, 52, 128);
          while (wd < 0 && fs > 20) { fs *= 0.9; wd = fitWdth(cd.w.name, fs, 820, cw - pad * 2, 52, 128); }
          cd.fs = fs; cd.wd = Math.max(52, wd);
          cd.name.style.fontSize = fs + 'px';
        });
      }
      function reelState(T) {
        const e = new Array(N).fill(0);
        const w0 = holds[workFirst];
        if (T <= w0.H) { const p = clamp((T - w0.S) / w0.L); e[0] = E(clamp((p - 0.5) / 0.5)); return { f: 0, e, k: 0 }; }
        for (let k = 1; k < N; k++) {
          const h = holds[workFirst + k];
          if (T <= h.H) { const q = clamp((T - h.S) / h.L); e[k - 1] = 1 - E(clamp(q / 0.4)); e[k] = E(clamp((q - 0.38) / 0.62)); return { f: k - 1 + E(q), e, k, q }; }
        }
        e[N - 1] = 1; return { f: N - 1, e, k: N - 1 };
      }
      const stripX = (f) => W / 2 - g.cw / 2 - f * g.step;
      let lastX = null;
      function render(T, pIn) {
        const st = reelState(T);
        const x = stripX(st.f);
        // entrance: iris out of the full stop, the camera pulls back from inside the first card
        const ag = ar.g();
        let sc = 1;
        if (pIn < 1) {
          const R = Math.max(ag.r * (1 + 2.2 * E(clamp(pIn))), E(clamp(pIn / 0.55)) * Math.hypot(W, H) * 1.05);
          ly.style.clipPath = `circle(${R.toFixed(1)}px at ${ag.px}px ${ag.py}px)`;
          const cy = g.cardTop + g.cardH / 2;
          const sc0 = Math.max(W / g.cw, (2 * Math.max(cy, H - cy)) / g.cardH) * 1.04;
          sc = lerp(sc0, 1, E(clamp((pIn - 0.32) / 0.68)));
        } else ly.style.clipPath = '';
        strip.style.transformOrigin = `${(W / 2 - x).toFixed(1)}px ${g.cardH / 2}px`;
        strip.style.transform = `translateX(${x.toFixed(2)}px) scale(${sc})`;
        // motion blur, earned: only when the strip actually travels fast between frames
        const disp = lastX == null ? 0 : Math.abs(x - lastX); lastX = x;
        const bl = reduced ? 0 : Math.min(26, disp * 0.42);
        if (bl > 1.2) { blurNode.setAttribute('stdDeviation', `${bl.toFixed(1)} 0`); strip.style.filter = 'url(#mv-mb)'; }
        else strip.style.filter = '';
        cards.forEach((cd, i) => {
          const d = Math.abs(st.f - i);
          if (d > 1.6) { cd.c.style.visibility = 'hidden'; cd.c.inert = true; return; }
          cd.c.style.visibility = '';
          const e = st.e[i]; const ec = clamp(e);
          cd.c.inert = ec < 0.5;
          cd.c.style.transform = `scale(${lerp(1, 0.94, clamp(d))})`;
          const nm = cd.name;
          nm.style.fontVariationSettings = `"wdth" ${clamp(lerp(Math.min(150, cd.wd + 34), cd.wd, e), 50, 150).toFixed(1)}, "wght" ${Math.round(lerp(420, 820, ec))}`;
          nm.style.transform = `translateX(${((1 - e) * (phone ? 18 : 40)).toFixed(2)}px)`;
          cd.el.forEach((n, j) => { const k = E(clamp((ec - j * 0.1) / 0.6)); n.style.opacity = clamp(k); n.style.transform = `translateY(${((1 - k) * 22).toFixed(2)}px)`; });
          cd.numEls.forEach((ne) => { const s = countStr(ne.v, ec >= 0.999 ? 1 : ec); if (ne.vv.textContent !== s) ne.vv.textContent = s; });
          cd.sting(ec);
        });
        g.st = st;
      }
      function prims(T) {
        const st = reelState(T); const out = []; const x = stripX(st.f);
        if (T < holds[workFirst].H || st.q == null) return out;
        for (let i = Math.floor(st.f) - 1; i <= Math.ceil(st.f) + 1; i++) if (i >= 0 && i < N) out.push({ t: 'r', x: x + i * g.step, y: g.cardTop, w: g.cw, h: g.cardH });
        return out;
      }
      function hero(T) { const st = reelState(T); const k = st.k || 0; return { x: stripX(st.f) + k * g.step + g.cw / 2, y: g.cardTop + g.cardH * 0.5 }; }
      const cardRect = (i) => { const r = cards[i].c.getBoundingClientRect(), rr = root.getBoundingClientRect(); return { x: r.left - rr.left, y: r.top - rr.top, w: r.width, h: r.height }; };
      return { id: 'work', ly, layout, render, prims, hero, cards, cardRect, reelState };
    })();

    // =====================================================================================
    // SCENE: HOW I WORK — the eight product colours sweep in as bars and merge into three columns: how they were built.
    // =====================================================================================
    const hw = (() => {
      const ly = el('section', 'ly sc-how', null, stage); ly.setAttribute('aria-label', 'How I work');
      const bars = items.map((w) => { const b = el('div', 'hw-bar', null, ly); b.style.background = fieldOf(w.slug)[0]; return b; });
      const COLS = [[COBALT, PAPER], [PAPER, INK], [MUSTARD, INK]];
      const head = el('h2', 'hw-head disp', 'How I work', ly);
      const cols = principles.map((p, i) => {
        const c = el('div', 'hw-col', null, ly); c.style.color = COLS[i % 3][1];
        const n = el('span', 'hw-n disp', pad2(i + 1), c);
        const k = el('h3', 'hw-k disp', p.k, c);
        const v = el('p', 'hw-v', p.v, c);
        return { c, parts: [n, k, v] };
      });
      let g = {};
      function layout() {
        g.colR = principles.map((_, c) => {
          if (!phone) return { x: (c * W) / 3, y: 0, w: W / 3 + 0.5, h: H };
          const a = (H - TOP - TB) / 3;
          const y0 = c === 0 ? 0 : TOP + a * c, y1 = c === 2 ? H : TOP + a * (c + 1);
          return { x: 0, y: y0, w: W, h: y1 - y0 };
        });
        cols.forEach((cl, c) => {
          const r = g.colR[c];
          const padT = phone ? (c === 0 ? TOP + 2 : 12) : 150, padB = phone ? (c === 2 ? TB + 10 : 10) : TB + 34;
          Object.assign(cl.c.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px', paddingTop: padT + 'px', paddingBottom: padB + 'px' });
        });
        head.style.top = (phone ? -999 : 96) + 'px';
      }
      function pose(T) {
        const s = SI.how; const p = clamp((T - s.sIn) / (s.hIn - s.sIn));
        const bw = (phone ? H : W) / N;
        const m = E(clamp((p - 0.42) / 0.3)), cm = clamp((p - 0.5) / 0.26);
        return {
          p, m, cm, rects: items.map((w, i) => {
            const k = E(clamp((p - i * 0.034) / 0.32));
            const col = Math.floor((i * 3) / N); const cr = g.colR[col];
            let r;
            if (!phone) r = { x: lerp(W + 30 + i * 18, i * bw, k), y: 0, w: bw + 1, h: H };
            else r = { x: 0, y: lerp(H + 30 + i * 18, i * bw, k), w: W, h: bw + 1 };
            return { x: lerp(r.x, cr.x, m), y: lerp(r.y, cr.y, m), w: lerp(r.w, cr.w, m), h: lerp(r.h, cr.h, m), col };
          }),
        };
      }
      function render(T, pIn, pOut) {
        const ps = pose(T);
        ps.rects.forEach((r, i) => {
          const b = bars[i];
          b.style.transform = `translate(${r.x.toFixed(2)}px, ${r.y.toFixed(2)}px)`;
          b.style.width = r.w.toFixed(2) + 'px'; b.style.height = r.h.toFixed(2) + 'px';
          b.style.background = ps.cm > 0 ? mixC(fieldOf(items[i].slug)[0], COLS[r.col][0], E(ps.cm)) : fieldOf(items[i].slug)[0];
        });
        cols.forEach((cl, c) => cl.parts.forEach((n, j) => {
          const k = E(clamp((pIn - 0.62 - c * 0.06 - j * 0.03) / 0.2));
          n.style.opacity = clamp(k); n.style.transform = `translateY(${((1 - k) * 26).toFixed(2)}px)`;
          if (j === 1) n.style.fontVariationSettings = `"wdth" ${clamp(lerp(140, phone ? 92 : 96, k), 50, 150).toFixed(1)}, "wght" 760`;
        }));
        const hk = E(clamp((pIn - 0.62) / 0.3)); head.style.opacity = clamp(hk); head.style.transform = `translateY(${(1 - hk) * 20}px)`;
        if (pOut > 0) { const k = E(pOut); ly.style.transform = `translate(${(k * 26).toFixed(1)}px, ${(k * 14).toFixed(1)}px)`; } else ly.style.transform = '';
      }
      function prims(T) { const ps = pose(T); if (ps.p <= 0 || ps.p >= 1) return []; return ps.rects.map((r) => ({ t: 'r', x: r.x, y: r.y, w: r.w, h: r.h })); }
      function hero(T) { const r = pose(T).rects[0]; return { x: r.x + (phone ? W / 2 : 0), y: r.y + (phone ? 0 : H * 0.55) }; }
      return { id: 'how', ly, layout, render, prims, hero };
    })();

    // =====================================================================================
    // SCENE: CLAIMS I WITHDREW — a splice cuts the reel open; each claim is a take marked no good, numbers intact.
    // =====================================================================================
    const wdn = (() => {
      const ly = el('section', 'ly sc-wd', null, stage); ly.setAttribute('aria-label', 'Claims I withdrew');
      const sc = el('div', 'wd-in scroll', null, ly);
      const head = el('header', 'wd-head', null, sc);
      const ht = el('h2', 'wd-t disp', 'Claims I withdrew', head);
      const hs = el('p', 'wd-s', 'Two takes, cut from the reel. The numbers that cut them stay on the record.', head);
      const takes = el('div', 'wd-takes', null, sc);
      const T_ = withdrawn.map((w, i) => {
        const t = el('article', 'take', null, takes);
        const sl = el('div', 'tk-slate', null, t);
        const slL = el('span', 'tk-sl disp', `Take ${pad2(i + 1)}`, sl);
        const slR = el('span', 'tk-ng disp', 'NG · cut', sl);
        const ti = el('h3', 'tk-title disp', null, t);
        el('span', 'tk-tt', w.title, ti);
        const strike = el('span', 'tk-strike', null, ti);
        const what = el('p', 'tk-what', w.what, t);
        const viz = el('div', 'tk-viz', null, t);
        const nums = el('div', 'tk-nums', null, t);
        const numEls = w.numbers.map(([v, l]) => { const d = el('div', 'tk-num', null, nums); const vv = el('span', 'tk-v disp', v, d); el('span', 'tk-l', l, d); return { vv, v }; });
        const lk = ext('tk-link', `${w.link[0]} ↗`, w.link[1], t);
        const stamp = el('span', 'tk-stamp disp', 'Withdrawn', t);
        let vizU = () => {};
        const meas = parseFloat(w.numbers[0][0]), gate = parseFloat((w.numbers[1] || [])[0]);
        if (w.numbers.length === 2 && meas < 1 && gate < 1 && gate > meas) {
          // a gauge: the measured value climbs and stops short of the gate that was written down first
          const lo = 0.6, hi = 0.76, X = (v) => ((v - lo) / (hi - lo)) * 100;
          const track = el('div', 'gz', null, viz);
          const fill = el('div', 'gz-fill', null, track);
          const gl = el('div', 'gz-gate', null, track); gl.style.left = X(gate) + '%';
          const glb = el('span', 'gz-gl', `gate ${w.numbers[1][0]}`, gl);
          [0.6, 0.65, 0.7, 0.75].forEach((v) => { const tk = el('span', 'gz-tick', v.toFixed(2), track); tk.style.left = X(v) + '%'; });
          const ml = el('span', 'gz-ml', '', track);
          vizU = (k) => { const v = lerp(lo, meas, k); fill.style.width = X(v).toFixed(2) + '%'; ml.style.left = X(v).toFixed(2) + '%'; ml.textContent = k >= 1 ? w.numbers[0][0] : v.toFixed(3); glb.style.opacity = 1; };
        } else {
          // the passes, struck out one by one
          const cnt = Math.min(12, parseInt(w.numbers[0][0], 10) || 0);
          const row = el('div', 'fr-row', null, viz);
          const frs = Array.from({ length: cnt }, () => { const f = el('div', 'fr', null, row); el('span', 'fr-p', 'pass', f); el('span', 'fr-x', null, f); return f; });
          vizU = (k) => frs.forEach((f, j) => { const q = E(clamp((k - j * 0.1) / 0.45)); f.style.setProperty('--x', clamp(q)); f.style.transform = `translateY(${(q * 8).toFixed(2)}px) rotate(${(q * (j % 2 ? 4 : -4)).toFixed(2)}deg)`; });
        }
        return { t, parts: [sl, ti, what, viz, nums, lk], numEls, vizU, stamp, strike, slR };
      });
      let g = {};
      function layout() {
        if (!phone) { g.A = { x: W * 0.64, y: -20 }; g.B = { x: W * 0.36, y: H + 20 }; }
        else { g.A = { x: W * 0.85, y: -20 }; g.B = { x: W * 0.15, y: H + 20 }; }
        const dx = g.B.x - g.A.x, dy = g.B.y - g.A.y, l = Math.hypot(dx, dy);
        g.n = { x: -dy / l, y: dx / l };
        cutSvg.setAttribute('width', W); cutSvg.setAttribute('height', H);
      }
      function pose(T) {
        const s = SI.withdrawn; const p = clamp((T - s.sIn) / (s.hIn - s.sIn));
        const dk = E(clamp(p / 0.28));
        const tip = { x: lerp(g.A.x, g.B.x, dk), y: lerp(g.A.y, g.B.y, dk) };
        const w = E(clamp((p - 0.24) / 0.46)) * (W + H) * 0.8;
        return { p, tip, w };
      }
      function render(T, pIn) {
        const ps = pose(T);
        if (pIn < 1) {
          const { A, B, n } = g; const w = Math.max(0.01, ps.w);
          ly.style.clipPath = `polygon(${A.x + n.x * w}px ${A.y + n.y * w}px, ${B.x + n.x * w}px ${B.y + n.y * w}px, ${B.x - n.x * w}px ${B.y - n.y * w}px, ${A.x - n.x * w}px ${A.y - n.y * w}px)`;
        } else ly.style.clipPath = '';
        const lineOn = pIn > 0 && pIn < 0.78;
        cutSvg.style.display = lineOn ? '' : 'none';
        if (lineOn) { cutLine.setAttribute('x1', g.A.x); cutLine.setAttribute('y1', g.A.y); cutLine.setAttribute('x2', ps.tip.x); cutLine.setAttribute('y2', ps.tip.y); cutSvg.style.opacity = 1 - clamp((pIn - 0.6) / 0.18); }
        const hk = E(clamp((pIn - 0.5) / 0.26));
        ht.style.opacity = clamp(hk); ht.style.transform = `translateY(${(1 - hk) * 24}px)`;
        ht.style.fontVariationSettings = `"wdth" ${clamp(lerp(150, phone ? 70 : 88, hk), 50, 150).toFixed(1)}, "wght" 800`;
        hs.style.opacity = clamp(E(clamp((pIn - 0.58) / 0.24)));
        T_.forEach((tk, i) => {
          tk.parts.forEach((n, j) => { const k = E(clamp((pIn - 0.58 - i * 0.06 - j * 0.025) / 0.22)); n.style.opacity = clamp(k); n.style.transform = `translateY(${((1 - k) * 20).toFixed(2)}px)`; });
          const vk = clamp((pIn - 0.7 - i * 0.04) / 0.2); const ve = vk >= 1 ? 1 : E(vk);
          tk.vizU(ve);
          tk.numEls.forEach((ne) => { const s = countStr(ne.v, vk >= 1 ? 1 : clamp(ve)); if (ne.vv.textContent !== s) ne.vv.textContent = s; });
          const sk = E(clamp((pIn - 0.84 - i * 0.04) / 0.1));
          tk.stamp.style.opacity = clamp(sk * 1.4); tk.stamp.style.transform = `rotate(-8deg) scale(${lerp(1.6, 1, clamp(sk))})`;
          tk.strike.style.transform = `scaleX(${clamp(sk)})`;
          tk.slR.style.opacity = clamp(sk);
        });
      }
      function prims(T) { const ps = pose(T); if (ps.p <= 0 || ps.p >= 1) return []; return [{ t: 'l', x1: g.A.x, y1: g.A.y, x2: ps.tip.x, y2: ps.tip.y }]; }
      function hero(T) { return pose(T).tip; }
      return { id: 'withdrawn', ly, layout, render, prims, hero };
    })();

    // =====================================================================================
    // SCENE: CAPABILITIES — strips splice the reel back together; a kinetic index of skills × products.
    // =====================================================================================
    const cp = (() => {
      const ly = el('section', 'ly sc-cap', null, stage); ly.setAttribute('aria-label', 'Capabilities');
      const NS = 10;
      const strips = Array.from({ length: NS }, (_, i) => { const s = el('div', 'cp-strip', null, ly); s.style.background = i % 3 === 1 ? MUSTARD : PAPER; return s; });
      const sc = el('div', 'cp-in scroll', null, ly);
      const head = el('header', 'cp-head', null, sc);
      const ht = el('h2', 'cp-t disp', 'Capabilities', head);
      const hs = el('p', 'cp-s', 'Skills × products. Point at a product to light every skill it uses; open any product to play its case.', head);
      const filt = el('div', 'cp-filter', null, sc); filt.setAttribute('role', 'group'); filt.setAttribute('aria-label', 'Products');
      const nameToSlug = Object.fromEntries(items.map((w) => [w.name, w.slug]));
      const setHL = (slug) => { if (slug) sc.dataset.hl = slug; else delete sc.dataset.hl; rowsAll.forEach((r) => r.li.classList.toggle('on', !!slug && r.slugs.includes(slug))); };
      items.forEach((w) => {
        const b = btn('cp-pb', null, filt); b.setAttribute('aria-label', `${w.name}: light its skills, click to play its case`);
        const sq = el('i', 'sq', null, b); sq.style.background = fieldOf(w.slug)[0];
        el('span', null, w.name, b);
        on(b, 'pointerenter', () => setHL(w.slug)); on(b, 'pointerleave', () => setHL(null));
        on(b, 'focus', () => setHL(w.slug)); on(b, 'blur', () => setHL(null));
        on(b, 'click', () => go(`#work/${w.slug}`));
      });
      const grid = el('div', 'cp-grid', null, sc);
      const rowsAll = [];
      const groups = capabilities.slice();
      // for a motion visitor the design + quality group leads
      const qi = groups.findIndex((gp) => /design/i.test(gp[0])); if (qi > 0) groups.unshift(groups.splice(qi, 1)[0]);
      const gEls = [];
      groups.forEach(([gname, skills]) => {
        const gb = el('section', 'cp-g', null, grid);
        const gh = el('h3', 'cp-gh disp', gname, gb); gEls.push(gh);
        const ul = el('ul', 'cp-ul', null, gb);
        skills.forEach(([sk, prods]) => {
          const li = el('li', 'cp-row', null, ul);
          el('span', 'cp-sk disp', sk, li);
          const pr = el('span', 'cp-pr', null, li);
          const slugs = prods.map((p) => nameToSlug[p]).filter(Boolean);
          prods.forEach((p) => {
            const s = nameToSlug[p]; if (!s) return;
            const a = btn('cp-p', null, pr); a.setAttribute('aria-label', `${p}: play its case`);
            const sq = el('i', 'sq', null, a); sq.style.background = fieldOf(s)[0];
            el('span', null, p, a);
            on(a, 'pointerenter', () => setHL(s)); on(a, 'pointerleave', () => setHL(null));
            on(a, 'click', () => go(`#work/${s}`));
          });
          rowsAll.push({ li, slugs });
        });
      });
      let g = {};
      function layout() { g.sh = H / NS; }
      function pose(T) {
        const s = SI.capabilities; const p = clamp((T - s.sIn) / (s.hIn - s.sIn));
        return { p, rects: strips.map((_, i) => { const k = E(clamp((p - i * 0.028) / 0.34)); const dir = i % 2 ? 1 : -1; const col = i % 3 === 1; const hk = col ? 1 - E(clamp((p - 0.5 - i * 0.01) / 0.25)) : 1; return { x: (1 - k) * dir * (W + 40), y: i * g.sh, w: W, h: (g.sh + 1) * hk, col }; }) };
      }
      function render(T, pIn) {
        const ps = pose(T);
        ps.rects.forEach((r, i) => { const s = strips[i]; s.style.transform = `translate(${r.x.toFixed(2)}px, ${r.y.toFixed(2)}px)`; s.style.width = W + 'px'; s.style.height = r.h.toFixed(2) + 'px'; });
        ly.style.background = pIn >= 0.62 ? PAPER : 'transparent';
        const hk = E(clamp((pIn - 0.44) / 0.3));
        ht.style.opacity = clamp(hk); ht.style.fontVariationSettings = `"wdth" ${clamp(lerp(150, phone ? 74 : 92, hk), 50, 150).toFixed(1)}, "wght" 800`;
        ht.style.transform = `translateX(${(1 - hk) * -30}px)`;
        hs.style.opacity = clamp(E(clamp((pIn - 0.52) / 0.25))); filt.style.opacity = hs.style.opacity;
        gEls.forEach((gh, i) => { const k = E(clamp((pIn - 0.5 - i * 0.05) / 0.3)); gh.style.opacity = clamp(k); });
        rowsAll.forEach((r, i) => { const k = E(clamp((pIn - 0.48 - i * (0.18 / Math.max(1, rowsAll.length))) / 0.3)); r.li.style.opacity = k >= 1 ? '' : clamp(k); r.li.style.transform = k >= 1 ? '' : `translateX(${((1 - k) * (i % 2 ? 34 : -34)).toFixed(2)}px)`; });
      }
      function prims(T) { const ps = pose(T); if (ps.p <= 0 || ps.p >= 1) return []; return ps.rects.filter((r) => Math.abs(r.x) > 1).map((r) => ({ t: 'r', x: r.x, y: r.y, w: r.w, h: r.h })); }
      function hero(T) { const r = pose(T).rects[0]; return { x: r.x + W, y: r.y + g.sh / 2 }; }
      return { id: 'capabilities', ly, layout, render, prims, hero };
    })();

    // =====================================================================================
    // SCENE: ABOUT — the clapper closes (pivot bottom-left), the camera takes the hit, the facts settle.
    // =====================================================================================
    const ab = (() => {
      const ly = el('section', 'ly sc-ab', null, stage); ly.setAttribute('aria-label', 'About');
      const stripe = el('div', 'ab-stripe', null, ly);
      const sc = el('div', 'ab-in scroll', null, ly);
      const L = el('div', 'ab-l', null, sc), R = el('div', 'ab-r', null, sc);
      const ht = el('h2', 'ab-t disp', 'About', L);
      const nm = el('p', 'ab-name disp', person.name, L);
      const roles = el('ul', 'ab-roles', null, L);
      const roleEls = person.roles.map((r) => el('li', 'disp', r, roles));
      const city = el('p', 'ab-city', person.city, L);
      const av = el('p', 'ab-av disp', person.availability, R);
      const wants = el('p', 'ab-wants', person.wants, R);
      const dl = el('dl', 'ab-facts', null, R);
      const factEls = [];
      about.facts.forEach(([k, v]) => { const dt = el('dt', null, k || ' ', dl); const dd = el('dd', null, v, dl); factEls.push(dt, dd); });
      const parts = [ht, nm, ...roleEls, city, av, wants, ...factEls];
      function pose(T) {
        const s = SI.about; const p = clamp((T - s.sIn) / (s.hIn - s.sIn));
        const k = E(clamp(p / 0.55));
        const ang = -74 * (1 - k);
        let shake = 0; if (p > 0.55 && p < 0.78) { const q = (p - 0.55) / 0.23; shake = 7 * Math.sin(q * Math.PI * 3) * (1 - q); }
        return { p, ang, shake };
      }
      let rwd = 100;
      function layout() {
        const colW = phone ? W - 36 : Math.min(1240, W - 80) * 0.52 - 30;
        const fs = phone ? Math.min(40, W * 0.1) : Math.min(76, colW * 0.12);
        const longest = person.roles.reduce((a, b) => (b.length > a.length ? b : a), '');
        let f = fs, w = fitWdth(longest, f, 760, colW, 56, 112);
        while (w < 0 && f > 18) { f *= 0.92; w = fitWdth(longest, f, 760, colW, 56, 112); }
        rwd = Math.max(56, w); roleEls.forEach((n) => { n.style.fontSize = f + 'px'; });
      }
      function render(T, pIn) {
        const ps = pose(T);
        if (pIn < 1) { ly.style.transformOrigin = `0px ${H}px`; ly.style.transform = `translateY(${ps.shake.toFixed(2)}px) rotate(${ps.ang.toFixed(3)}deg)`; }
        else ly.style.transform = '';
        parts.forEach((n, j) => { const k = E(clamp((pIn - 0.56 - j * (0.17 / parts.length)) / 0.26)); n.style.opacity = clamp(k); n.style.transform = k >= 1 ? '' : `translateY(${((1 - k) * 18).toFixed(2)}px)`; });
        roleEls.forEach((n, j) => { const k = E(clamp((pIn - 0.62 - j * 0.05) / 0.26)); n.style.fontVariationSettings = `"wdth" ${clamp(lerp(150, rwd, k), 50, 150).toFixed(1)}, "wght" 760`; });
      }
      const corners = (ang, shake) => { const a = (ang * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [[0, 0], [W, 0], [W, H], [0, H]].map(([x, y]) => { const dx = x, dy = y - H; return [dx * c - dy * s, H + dx * s + dy * c + shake]; }); };
      function prims(T) { const ps = pose(T); if (ps.p <= 0 || ps.p >= 0.6) return []; return [{ t: 'p', pts: corners(ps.ang, ps.shake) }]; }
      function hero(T) { const ps = pose(T); const c = corners(ps.ang, ps.shake)[1]; return { x: c[0] * 0.5, y: H + (c[1] - H) * 0.5 }; }
      return { id: 'about', ly, layout, render, prims, hero };
    })();

    // =====================================================================================
    // SCENE: CONTACT — the ball comes back, hits the floor, the impact floods the frame, and it lands as a full stop.
    // =====================================================================================
    const ct = (() => {
      const ly = el('section', 'ly sc-ct', null, stage); ly.setAttribute('aria-label', 'Contact');
      const field = el('div', 'ct-field', null, ly);
      const sc = el('div', 'ct-in', null, ly);
      const kick = el('p', 'ct-kick disp', 'Contact', sc);
      const hd = el('h2', 'ct-h disp', null, sc);
      const hdt = el('span', null, 'Write to me', hd); const hm = el('span', 'ar-mark', null, hd);
      const subj = `Hello Vamsi — from ${ctx.org || (ctx.audience === 'motion' ? 'a motion designer' : 'your portfolio')}`;
      const mail = el('a', 'ct-mail disp', person.email, sc); mail.href = `mailto:${person.email}?subject=${encodeURIComponent(subj)}`;
      const row = el('div', 'ct-row', null, sc);
      const m2 = el('a', 'ct-l', 'Email ↗', row); m2.href = mail.href;
      ext('ct-l', 'LinkedIn ↗', person.linkedin, row);
      ext('ct-l', 'GitHub ↗', person.github, row);
      const av = el('p', 'ct-av', `${person.availability}. ${person.city}.`, sc);
      const rp = btn('ct-replay', '↺ Replay from 00:00:00', sc);
      on(rp, 'click', () => { closeIdx(); location.hash = '#arrival'; replayArrival(); });
      const ball = el('div', 'ct-ball', null, ly);
      const parts = [kick, hd, mail, row, av, rp];
      let g = {};
      function layout() {
        const pad = phone ? 20 : Math.max(48, (W - 1100) / 2);
        const fsMax = phone ? 64 : 150;
        sc.style.left = pad + 'px'; sc.style.width = (W - 2 * pad) + 'px';
        let fs = fsMax; let wd = fitWdth('Write to me', fs, 820, W - 2 * pad - fs * 0.3, 55, 125);
        while (wd < 0 && fs > 24) { fs *= 0.9; wd = fitWdth('Write to me', fs, 820, W - 2 * pad - fs * 0.3, 55, 125); }
        hd.style.fontSize = fs + 'px'; g.wd = Math.max(55, wd); hd.style.fontVariationSettings = `"wdth" ${g.wd}, "wght" 820`;
        let mf = phone ? 30 : 64; let mw = fitWdth(person.email, mf, 600, W - 2 * pad, 50, 110);
        while (mw < 0 && mf > 12) { mf *= 0.92; mw = fitWdth(person.email, mf, 600, W - 2 * pad, 50, 110); }
        mail.style.fontSize = mf + 'px'; mail.style.fontVariationSettings = `"wdth" ${Math.max(50, mw)}, "wght" 600`;
        const h = sc.getBoundingClientRect().height;
        sc.style.top = Math.max(TOP + 6, TOP + (H - TB - TOP - h) / 2) + 'px';
        const lr = ly.getBoundingClientRect(), tr = hdt.getBoundingClientRect(), mr = hm.getBoundingClientRect();
        g.r = fs * 0.095; g.fs = fs;
        g.dx = tr.right - lr.left + fs * 0.05 + g.r; g.dy = mr.top - lr.top - g.r;
        g.ix = Math.min(W * 0.72, g.dx + fs * 0.9); g.iy = Math.min(H - TB - 30, g.dy + fs * 1.5);
        Object.assign(ball.style, { width: 2 * g.r + 'px', height: 2 * g.r + 'px', marginLeft: -g.r + 'px', marginTop: -g.r + 'px' });
      }
      function ballAt(p) {
        if (p < 0.3) { const k = p / 0.3; return { x: g.ix, y: lerp(-g.r * 2, g.iy - g.r, k * k), c: 0.3 }; }
        if (p < 0.62) { const k = (p - 0.3) / 0.32; return { x: lerp(g.ix, g.dx, k), y: lerp(g.iy - g.r, g.dy, k) - H * 0.16 * 4 * k * (1 - k) }; }
        return { x: g.dx, y: g.dy };
      }
      function pose(T) {
        const s = SI.contact; const p = clamp((T - s.sIn) / (s.hIn - s.sIn));
        const b = ballAt(p); let sx = 1, sy = 1;
        [[0.3, g.iy - g.r], [0.62, g.dy]].forEach(([pc, yb]) => { const d = Math.abs(p - pc); if (d < 0.03) { const m = 1 - d / 0.03; sx = 1 + 0.42 * m; sy = 1 - 0.36 * m; b.y = yb + g.r * (1 - sy); } });
        return { p, b, sx, sy };
      }
      function render(T, pIn) {
        const ps = pose(T);
        const R = E(clamp((pIn - 0.28) / 0.42)) * Math.hypot(W, H) * 1.1;
        field.style.clipPath = pIn >= 1 ? '' : `circle(${R.toFixed(1)}px at ${g.ix}px ${g.iy}px)`;
        ball.style.transform = `translate(${ps.b.x.toFixed(2)}px, ${ps.b.y.toFixed(2)}px) scale(${ps.sx}, ${ps.sy})`;
        parts.forEach((n, j) => { const k = E(clamp((pIn - 0.5 - j * 0.04) / 0.28)); n.style.opacity = clamp(k); n.style.transform = k >= 1 ? '' : `translateY(${((1 - k) * 22).toFixed(2)}px)`; });
        const hk = E(clamp((pIn - 0.5) / 0.3)); hd.style.fontVariationSettings = `"wdth" ${clamp(lerp(150, g.wd, hk), 50, 150).toFixed(1)}, "wght" 820`;
      }
      function prims(T) { const ps = pose(T); if (ps.p <= 0 || ps.p >= 0.7) return []; return [{ t: 'c', x: ps.b.x, y: ps.b.y, r: g.r, sx: ps.sx, sy: ps.sy }]; }
      function hero(T) { return pose(T).b; }
      return { id: 'contact', ly, layout, render, prims, hero };
    })();

    const SC = { arrival: ar, work: wk, how: hw, withdrawn: wdn, capabilities: cp, about: ab, contact: ct };

    // ---------- the measurement helper for fitting type with the width axis ----------
    const meas = el('span', 'meas disp', null, root); meas.setAttribute('aria-hidden', 'true');
    function measW(text, fs, wd, wt) { meas.textContent = text; meas.style.fontSize = fs + 'px'; meas.style.fontVariationSettings = `"wdth" ${wd}, "wght" ${wt}`; return meas.getBoundingClientRect().width; }
    function fitWdth(text, fs, wt, maxW, lo, hi) {
      if (measW(text, fs, hi, wt) <= maxW) return hi;
      if (measW(text, fs, lo, wt) > maxW) return -1;
      let a = lo, b = hi; for (let i = 0; i < 7; i++) { const m = (a + b) / 2; if (measW(text, fs, m, wt) <= maxW) a = m; else b = m; }
      return Math.floor(a);
    }

    // ---------- stings: one tiny diagram per product, drawn by its card's entrance ----------
    function buildSting(slug, svg, col) {
      const S = (t, a) => sv(t, { fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...a }, svg);
      const draw = (n) => { const L = n.getTotalLength ? n.getTotalLength() : 100; n.style.strokeDasharray = L; return (k) => { n.style.strokeDashoffset = (L * (1 - clamp(k))).toFixed(2); }; };
      const seg = (k, a, b) => E(clamp((k - a) / (b - a)));
      if (slug === 'vvdex-platform') { // sealed box, hidden tests, a check that can be verified
        const box = S('rect', { x: 26, y: 46, width: 68, height: 52 }); const db = draw(box);
        const lid = S('line', { x1: 26, y1: 46, x2: 94, y2: 46 });
        const chk = S('path', { d: 'M44 72 L56 84 L78 60' }); const dc = draw(chk);
        return (k) => { db(seg(k, 0, 0.35)); lid.setAttribute('transform', `rotate(${(-62 * (1 - seg(k, 0.3, 0.6))).toFixed(2)} 26 46)`); lid.style.opacity = clamp(k * 4); dc(seg(k, 0.6, 0.95)); };
      }
      if (slug === 'conxto') { // résumé lines: one claims more, and is reverted
        const ys = [30, 44, 58, 72, 86], Ls = [70, 56, 64, 48, 60];
        const ls = ys.map((y) => S('line', { x1: 20, y1: y, x2: 20, y2: y }));
        const x = S('path', { d: 'M100 52 L108 64 M108 52 L100 64', 'stroke-width': 2 });
        return (k) => ls.forEach((l, i) => {
          let len = Ls[i] * seg(k, i * 0.06, i * 0.06 + 0.3);
          if (i === 2) len = lerp(len, 94, seg(k, 0.36, 0.55)) - (94 - Ls[i]) * seg(k, 0.6, 0.85) * seg(k, 0.36, 0.55);
          l.setAttribute('x2', (20 + len).toFixed(2)); x.style.opacity = (seg(k, 0.5, 0.6) * (1 - seg(k, 0.82, 0.95))).toFixed(3);
        });
      }
      if (slug === 'vvdex-engine') { // a paragraph compiles into a contract
        const ps = [28, 40, 52, 64, 76].map((y, i) => S('line', { x1: 12, y1: y, x2: 12 + [36, 30, 38, 26, 32][i], y2: y }));
        const ar_ = S('path', { d: 'M56 46 L64 54 L56 62' }); const da = draw(ar_);
        const bs = [24, 50, 76].map((y) => S('rect', { x: 74, y, width: 34, height: 18 }));
        return (k) => { ps.forEach((p, i) => { p.style.opacity = seg(k, i * 0.04, i * 0.04 + 0.2); }); da(seg(k, 0.25, 0.4)); bs.forEach((b, i) => { const q = seg(k, 0.4 + i * 0.12, 0.65 + i * 0.12); b.setAttribute('width', (34 * q).toFixed(2)); b.style.opacity = q > 0 ? 1 : 0; }); };
      }
      if (slug === 'unboundpdf') { // the page tries to leave the tab, and stays
        const tab = S('path', { d: 'M10 36 H44 L50 26 H84 L90 36 H110 V106 H10 Z' }); const dt = draw(tab);
        const pg = S('path', { d: 'M44 52 H70 L80 62 V96 H44 Z M70 52 V62 H80' });
        return (k) => { dt(seg(k, 0, 0.35)); const up = seg(k, 0.35, 0.55), back = seg(k, 0.6, 0.9); pg.setAttribute('transform', `translate(0 ${(-14 * up + 14 * back).toFixed(2)})`); pg.style.opacity = seg(k, 0.25, 0.4); };
      }
      if (slug === 'farmquick') { // five cities read every morning, along the sun's arc
        const arc = S('path', { d: 'M14 96 A46 46 0 0 1 106 96' }); const da = draw(arc);
        S('line', { x1: 8, y1: 96, x2: 112, y2: 96, 'stroke-width': 1.4 });
        const dots = [160, 125, 90, 55, 20].map((a) => { const r = (a * Math.PI) / 180; return sv('circle', { cx: (60 + 46 * Math.cos(r)).toFixed(2), cy: (96 - 46 * Math.sin(r)).toFixed(2), r: 0, fill: col }, svg); });
        return (k) => { da(seg(k, 0, 0.4)); dots.forEach((d, i) => d.setAttribute('r', (5 * seg(k, 0.35 + i * 0.1, 0.5 + i * 0.1)).toFixed(2))); };
      }
      if (slug === 'conxfolio') { // one résumé fans into four tools
        const sh = [0, 1, 2, 3].map(() => S('rect', { x: 44, y: 30, width: 32, height: 44, fill: 'none' }));
        return (k) => sh.forEach((s, i) => { const q = seg(k, 0.15 + i * 0.05, 0.7 + i * 0.05); s.setAttribute('transform', `translate(${((i - 1.5) * 22 * q).toFixed(2)} ${(Math.abs(i - 1.5) * 8 * q).toFixed(2)}) rotate(${((i - 1.5) * 9 * q).toFixed(2)} 60 74)`); s.style.opacity = i === 0 ? clamp(k * 5) : q > 0.02 ? 1 : 0; });
      }
      if (slug === 'pitchradar') { // seven agents on the ring, lit by the sweep
        const ring = S('circle', { cx: 60, cy: 60, r: 44 }); const dr = draw(ring);
        const sw = S('line', { x1: 60, y1: 60, x2: 60, y2: 16 });
        const ns = Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2 - Math.PI / 2; return sv('circle', { cx: (60 + 44 * Math.cos(a)).toFixed(2), cy: (60 + 44 * Math.sin(a)).toFixed(2), r: 0, fill: col }, svg); });
        return (k) => { dr(seg(k, 0, 0.3)); const a = seg(k, 0.2, 0.95); sw.setAttribute('transform', `rotate(${(a * 360).toFixed(2)} 60 60)`); sw.style.opacity = k > 0.2 && k < 0.999 ? 1 : 0.35; ns.forEach((n, i) => n.setAttribute('r', (a * 7 > i ? 4.5 : 0).toString())); };
      }
      // vvdex-trading: every call chained to the last
      const links = Array.from({ length: 6 }, () => S('rect', { x: 0, y: 54, width: 26, height: 14, rx: 7 }));
      return (k) => { const q = seg(k, 0.25, 0.9); links.forEach((l, i) => { const x = 6 + i * 20 - 20 * q; l.setAttribute('x', x.toFixed(2)); l.style.opacity = i === 5 ? q : i === 0 ? 1 - q : clamp(k * 3); }); };
    }

    // ---------- the case: a sequence of shots in a world-styled reading surface ----------
    const cs = (() => {
      const box = el('div', 'case', null, root); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'false'); box.hidden = true;
      const field = el('div', 'cs-field', null, root);
      const wipe = el('div', 'cs-wipe', null, root);
      const scroller = el('div', 'cs-scroll scroll', null, box); scroller.tabIndex = -1;
      const chrome = el('div', 'cs-chrome', null, box);
      const crumb = el('p', 'cs-crumb disp', '', chrome);
      const cbtns = el('div', 'cs-btns', null, chrome);
      const bPrev = btn('cs-b', null, cbtns, 'Previous case'), bNext = btn('cs-b', null, cbtns, 'Next case'), bClose = btn('cs-b cs-x', null, cbtns, 'Close case (Esc)');
      const gl = (b, d) => { const s = sv('svg', { viewBox: '0 0 20 20', width: 20, height: 20, 'aria-hidden': 'true' }, b); sv('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'square' }, s); };
      gl(bPrev, 'M12 4 L6 10 L12 16'); gl(bNext, 'M8 4 L14 10 L8 16'); gl(bClose, 'M5 5 L15 15 M15 5 L5 15');
      let body = null, io = null, slug = null, shots = [];
      on(bClose, 'click', () => go('#work'));
      on(bPrev, 'click', () => { const i = idxOf(slug); go(`#work/${items[(i - 1 + N) % N].slug}`); });
      on(bNext, 'click', () => { const i = idxOf(slug); go(`#work/${items[(i + 1) % N].slug}`); });
      on(scroller, 'scroll', () => { dirtyTL = true; });

      function build(sl) {
        if (io) io.disconnect();
        if (body) body.remove();
        slug = sl; const w = items[idxOf(sl)]; const c = cases[sl]; const i = idxOf(sl);
        const [fc, tc] = fieldOf(sl);
        box.style.setProperty('--cf', fc); box.style.setProperty('--ct', tc);
        box.setAttribute('aria-label', `Case: ${w.name}`);
        crumb.textContent = `Case ${pad2(i + 1)}/${pad2(N)} · ${w.name}`;
        body = el('div', 'cs-body', null, scroller);
        shots = [];
        let no = 0;
        const shot = (title, theme) => {
          no++;
          const s = el('section', `shot t-${theme}`, null, body);
          const hd = el('header', 'shot-h', null, s);
          el('span', 'shot-n disp', `Shot ${pad2(no)}`, hd);
          if (title) el('h3', 'shot-t disp', title, hd);
          const cc = el('div', 'shot-c', null, s);
          shots.push({ s, title: title || w.name });
          return cc;
        };
        const kids = (n) => { [...n.children].forEach((ch, j) => ch.style.setProperty('--i', j)); };
        // 01 title
        const t0 = shot(null, 'field');
        const nm = el('h2', 'cs-name disp', w.name, t0);
        const fsN = phone ? Math.min(78, (W - 40) / 4.2) : Math.min(190, (W - 160) / 5);
        nm.style.fontSize = fsN + 'px';
        const wdN = fitWdth(w.name, fsN, 820, (phone ? W - 40 : Math.min(1200, W - 120)), 52, 125);
        nm.style.setProperty('--wd', Math.max(52, wdN));
        el('p', 'cs-meta', [c ? c.category : w.kind, c ? c.period : null, w.status].filter(Boolean).join(' · '), t0);
        el('p', 'cs-lead', c ? c.one_line : w.line, t0);
        if (c) el('p', 'cs-p', c.summary, t0);
        const ln = el('p', 'cs-links0', null, t0);
        ext('cs-a', 'Write-up on vamsivenkatesh.com ↗', `https://vamsi-venkatesh.github.io/portfolio-designs/inside-the-dot/work/${sl}/`, ln);
        if (w.url) ext('cs-a', `${w.host} ↗`, w.url, ln);
        kids(t0);
        if (c) {
          const r = shot('Role', 'paper'); el('p', 'cs-lead', c.role, r); kids(r);
          const pb = shot('Problem', 'ink'); el('p', 'cs-lead', c.problem, pb); kids(pb);
          const co = shot('Constraints', 'paper'); const ol = el('ol', 'cs-ol', null, co); c.constraints.forEach((x) => el('li', null, x, ol)); kids(co); kids(ol);
          const bu = shot('Built', 'field'); const bg = el('div', 'cs-blocks', null, bu); c.built.forEach((b) => { const d = el('div', 'cs-block', null, bg); el('h4', 'disp', b.title, d); el('p', null, b.body, d); }); kids(bg);
          const hw_ = shot('How it works', 'paper'); buildBeats(hw_, c.how_it_works);
          const de = shot('Decisions', 'ink'); c.decisions.forEach((d) => { const x = el('div', 'cs-dec', null, de); el('h4', 'disp', d.decision, x); const p1 = el('p', null, null, x); el('b', null, 'Why. ', p1); p1.appendChild(document.createTextNode(d.why)); const p2 = el('p', null, null, x); el('b', null, 'Trade-off. ', p2); p2.appendChild(document.createTextNode(d.tradeoff)); }); kids(de);
          const ev = shot('Evaluation', 'paper'); const xs = el('div', 'cs-xs', null, ev); c.evaluation.forEach((e) => { const r2 = el('div', 'xs-row', null, xs); el('span', 'xs-d disp', e.date, r2); const b2 = el('div', 'xs-b', null, r2); el('p', 'xs-w', e.what, b2); el('p', 'xs-r', e.result, b2); }); kids(xs);
          const nu = shot('Numbers', 'field'); const ng = el('div', 'cs-nums', null, nu); c.numbers.forEach((n) => { const d = el('div', 'cs-num', null, ng); el('span', 'ctr disp', n.value, d).dataset.v = n.value; el('span', 'cs-nl', n.label, d); el('span', 'cs-nd', n.date, d); }); kids(ng);
          const stv = shot('Stack', 'ink'); const sp = el('p', 'cs-stack disp', null, stv); c.stack.forEach((x, j) => { el('span', null, x, sp); if (j < c.stack.length - 1) el('i', null, ' / ', sp); });
          const lk = shot('Links', 'paper'); const ul = el('ul', 'cs-ul', null, lk); c.links.forEach((l) => ext('cs-big', `${l.label} ↗`, l.url, el('li', null, null, ul))); kids(ul);
          const li = shot('Limits', 'ink'); const ol2 = el('ol', 'cs-ol', null, li); c.limits.forEach((x) => el('li', null, x, ol2)); kids(ol2);
        } else {
          const pb = shot('Problem', 'paper'); el('p', 'cs-lead', w.problem, pb); kids(pb);
          const pl = shot('Plan', 'ink'); el('p', 'cs-lead', w.plan, pl); kids(pl);
          const bu = shot('Built', 'field'); const ol = el('ol', 'cs-ol', null, bu); w.built.forEach((x) => el('li', null, x, ol)); kids(ol);
          const ch = shot('Checks', 'paper'); const ol2 = el('ol', 'cs-ol', null, ch); w.checks.forEach((x) => el('li', null, x, ol2)); kids(ol2);
          const nu = shot('Numbers', 'ink'); const ng = el('div', 'cs-nums', null, nu); (w.stage || w.numbers).forEach(([v, l]) => { const d = el('div', 'cs-num', null, ng); el('span', 'ctr disp', v, d).dataset.v = v; el('span', 'cs-nl', l, d); }); kids(ng);
          const lk = shot('Links', 'paper'); const ul = el('ul', 'cs-ul', null, lk); w.links.forEach(([l, u]) => ext('cs-big', `${l} ↗`, u, el('li', null, null, ul))); ext('cs-big', 'Write-up on vamsivenkatesh.com ↗', `https://vamsi-venkatesh.github.io/portfolio-designs/inside-the-dot/work/${sl}/`, el('li', null, null, ul)); kids(ul);
        }
        // end card: the next case, in its own colour
        const nx = items[(i + 1) % N];
        const end = el('section', 'shot t-next', null, body); end.style.background = fieldOf(nx.slug)[0]; end.style.color = fieldOf(nx.slug)[1];
        const eb = btn('cs-nextb disp', null, end); el('span', 'cs-nk', 'Next case', eb); el('span', 'cs-nn', `${nx.name} →`, eb);
        on(eb, 'click', () => go(`#work/${nx.slug}`));
        shots.push({ s: end, title: 'Next' });
        io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) enterShot(en.target); }), { root: scroller, threshold: 0.12 });
        shots.forEach((s) => io.observe(s.s));
        scroller.scrollTop = 0;
        if (reduced) shots.forEach((s) => enterShot(s.s));
      }
      function buildBeats(cc, beats) {
        const wrap = el('div', 'beats', null, cc);
        const svg = sv('svg', { class: 'beat-path', 'aria-hidden': 'true' }, wrap);
        const path = sv('path', { fill: 'none', stroke: 'currentColor', 'stroke-width': 1.2 }, svg);
        const dot = sv('circle', { r: 6, fill: ORANGE }, svg);
        const ol = el('ol', 'beat-ol', null, wrap);
        const lis = beats.map((b, j) => { const li = el('li', 'beat', null, ol); li.style.setProperty('--i', j); el('span', 'beat-node', null, li); el('h4', 'disp', b.step, li); el('p', null, b.body, li); return li; });
        wrap._play = () => {
          const wr = wrap.getBoundingClientRect();
          const pts = lis.map((li) => { const n = li.querySelector('.beat-node').getBoundingClientRect(); return [n.left + n.width / 2 - wr.left, n.top + n.height / 2 - wr.top]; });
          svg.setAttribute('width', wr.width); svg.setAttribute('height', wr.height);
          let d = `M${pts[0][0]} ${pts[0][1]}`;
          for (let j = 1; j < pts.length; j++) { const [x0, y0] = pts[j - 1], [x1, y1] = pts[j]; const bow = (j % 2 ? 1 : -1) * Math.min(26, (y1 - y0) * 0.35); d += ` C${x0 + bow} ${y0 + (y1 - y0) * 0.3} ${x1 + bow} ${y1 - (y1 - y0) * 0.3} ${x1} ${y1}`; }
          path.setAttribute('d', d);
          const L = path.getTotalLength(); path.style.strokeDasharray = L;
          if (reduced) { path.style.strokeDashoffset = 0; dot.setAttribute('cx', pts[pts.length - 1][0]); dot.setAttribute('cy', pts[pts.length - 1][1]); return; }
          tween(2200, (k) => { const e = E(k); path.style.strokeDashoffset = (L * (1 - e)).toFixed(1); const p = path.getPointAtLength(clamp(e, 0, 1) * L); dot.setAttribute('cx', p.x.toFixed(1)); dot.setAttribute('cy', p.y.toFixed(1)); });
        };
      }
      function enterShot(s) {
        if (s.classList.contains('in')) return;
        s.classList.add('in');
        s.querySelectorAll('.ctr').forEach((n) => { const v = n.dataset.v; if (reduced) { n.textContent = v; return; } tween(1400, (k) => { n.textContent = countStr(v, k >= 1 ? 1 : E(k)); }); });
        const bt = s.querySelector('.beats'); if (bt && bt._play) later(() => bt._play(), reduced ? 0 : 120);
      }
      function replayVisible() {
        shots.forEach(({ s }) => { const r = s.getBoundingClientRect(); if (r.bottom > 0 && r.top < H) { s.classList.remove('in'); void s.offsetWidth; enterShot(s); } });
      }
      return {
        box, field, wipe, scroller, build, shots: () => shots, replayVisible, get slug() { return slug; }, focus: () => scroller.focus({ preventScroll: true }), close: () => { if (io) io.disconnect(); io = null; },
        bClose,
      };
    })();

    // ---------- tweens (time-based UI motion: case open/close, counters, beat path) ----------
    const tweens = [];
    function tween(ms, fn, done) { const t = { t0: performance.now(), d: ms, fn, done }; tweens.push(t); if (reduced || ms <= 0) { fn(1); tweens.splice(tweens.indexOf(t), 1); if (done) done(); } return t; }

    // ---------- the timeline bar ----------
    const bar = el('nav', 'bar', null, root); bar.setAttribute('aria-label', 'Timeline');
    const tp = el('div', 'tp', null, bar);
    const icon = (d) => { const s = sv('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': 'true' }); sv('path', { d, fill: 'currentColor' }, s); return s; };
    const bPrev = btn('tb', null, tp, 'Previous keyframe'); bPrev.appendChild(icon('M3 2h2v12H3zM14 2v12L6 8z'));
    const bPlay = btn('tb tb-play', null, tp, 'Play to the next keyframe (Space)');
    const icPlay = icon('M4 2l10 6-10 6z'), icPause = icon('M3 2h4v12H3zM9 2h4v12H9z'); bPlay.appendChild(icPlay);
    const bNext = btn('tb', null, tp, 'Next keyframe'); bNext.appendChild(icon('M11 2h2v12h-2zM2 2v12l8-6z'));
    const tcBox = el('div', 'tc', null, tp);
    const tcEl = el('span', 'tc-t disp', '00:00:00', tcBox);
    const scnEl = el('span', 'tc-s', 'Arrival', tcBox);
    const trk = el('div', 'trk', null, bar);
    const tl = el('canvas', 'tl', null, trk); tl.tabIndex = 0; tl.setAttribute('role', 'slider'); tl.setAttribute('aria-label', 'Playhead: drag to scrub, drag a diamond to re-time a scene');
    tl.setAttribute('aria-valuemin', '0');
    const tg = tl.getContext('2d');
    const tools = el('div', 'tools', null, bar);
    const bEase = btn('tl-btn', null, tools, 'Signature ease: open the curve editor');
    const easeIcon = sv('svg', { viewBox: '0 0 24 24', width: 22, height: 22, 'aria-hidden': 'true' }, bEase);
    const easeIconPath = sv('path', { fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8 }, easeIcon);
    el('span', 'tl-lab', 'Ease', bEase);
    const bGuides = btn('tl-btn', null, tools, 'Onion skins and motion paths'); bGuides.setAttribute('aria-pressed', 'false');
    const gi = sv('svg', { viewBox: '0 0 24 24', width: 22, height: 22, 'aria-hidden': 'true' }, bGuides);
    [5, 10, 15].forEach((x, i) => sv('circle', { cx: x + 2, cy: 12, r: 5, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-opacity': 0.35 + i * 0.3 }, gi));
    el('span', 'tl-lab', 'Onion', bGuides);
    const bIdx = btn('tl-btn', null, tools, 'Index of scenes and cases'); bIdx.setAttribute('aria-expanded', 'false');
    const ii = sv('svg', { viewBox: '0 0 24 24', width: 22, height: 22, 'aria-hidden': 'true' }, bIdx);
    [7, 12, 17].forEach((y) => { sv('path', { d: `M5 ${y} l2 -2 2 2 -2 2z`, fill: 'currentColor' }, ii); sv('line', { x1: 12, y1: y, x2: 20, y2: y, stroke: 'currentColor', 'stroke-width': 1.6 }, ii); });
    el('span', 'tl-lab', 'Index', bIdx);
    // reduced motion: the timeline is a plain chapter list
    let chapters = null;
    if (reduced) {
      trk.style.display = 'none'; bEase.style.display = 'none'; bGuides.style.display = 'none'; bPlay.style.display = 'none';
      chapters = el('ol', 'chap', null, bar);
      SCENE_IDS.forEach((id) => { const b = btn('chap-b', SCENE_NAME[id], el('li', null, null, chapters)); b.dataset.id = id; on(b, 'click', () => go('#' + id)); });
    }

    // ---------- ease editor ----------
    const ez = el('div', 'pop ease', null, root); ez.hidden = true; ez.setAttribute('role', 'dialog'); ez.setAttribute('aria-label', 'Signature ease');
    el('p', 'pop-h disp', 'Signature ease', ez);
    el('p', 'pop-n', 'Every transition on this site uses this one curve. Drag the handles or pick a preset; the scene replays with it.', ez);
    const ezc = el('canvas', 'ez-c', null, ez); const ezg = ezc.getContext('2d');
    const ezRead = el('p', 'ez-read disp', '', ez);
    const ezPre = el('div', 'ez-pre', null, ez);
    const preBtns = PRESETS.map(([n, pts]) => { const b = btn('ez-p', n, ezPre); on(b, 'click', () => { setEase(pts); replayCurrent(); }); return { b, pts }; });
    const ezPrev = el('div', 'ez-prev', null, ez); const ezDot = el('i', null, null, ezPrev);
    let easeOpen = false;
    // ---------- index ----------
    const ix = el('div', 'pop idx', null, root); ix.hidden = true; ix.setAttribute('role', 'dialog'); ix.setAttribute('aria-label', 'Index');
    el('p', 'pop-h disp', 'Index', ix);
    const ixl = el('ol', 'ix-l', null, ix);
    SCENE_IDS.forEach((id, i) => {
      const li = el('li', null, null, ixl);
      const b = btn('ix-b', null, li); el('span', 'ix-n disp', `SC ${pad2(i + 1)}`, b); el('span', null, SCENE_NAME[id], b);
      on(b, 'click', () => { closeIdx(); go('#' + id); });
      if (id === 'work') { const ul = el('ul', 'ix-w', null, li); items.forEach((w) => { const bb = btn('ix-c', null, el('li', null, null, ul)); const sq = el('i', 'sq', null, bb); sq.style.background = fieldOf(w.slug)[0]; el('span', null, w.name, bb); on(bb, 'click', () => { closeIdx(); go(`#work/${w.slug}`); }); }); }
    });
    const ixC = el('p', 'ix-contact', null, ix);
    const ixm = el('a', null, person.email, ixC); ixm.href = `mailto:${person.email}`;
    function openIdx() { closeEase(); ix.hidden = false; bIdx.setAttribute('aria-expanded', 'true'); placePop(ix, bIdx); ix.querySelector('button').focus(); }
    function closeIdx(focus) { if (ix.hidden) return; ix.hidden = true; bIdx.setAttribute('aria-expanded', 'false'); if (focus) bIdx.focus(); }
    function openEase() { closeIdx(); ez.hidden = false; easeOpen = true; placePop(ez, bEase); sizeEase(); drawEase(); }
    function closeEase(focus) { if (ez.hidden) return; ez.hidden = true; easeOpen = false; if (focus) bEase.focus(); }
    on(bIdx, 'click', () => (ix.hidden ? openIdx() : closeIdx()));
    on(bEase, 'click', () => (ez.hidden ? openEase() : closeEase()));
    let guides = false;
    on(bGuides, 'click', () => { guides = !guides; bGuides.setAttribute('aria-pressed', String(guides)); bGuides.classList.toggle('on', guides); dirty = true; });
    function placePop(p, anchor) {
      const r = anchor.getBoundingClientRect(), rr = root.getBoundingClientRect();
      if (phone) { p.style.left = '10px'; p.style.right = '10px'; p.style.width = 'auto'; }
      else { p.style.right = Math.max(10, rr.right - r.right - 6) + 'px'; p.style.left = 'auto'; }
      p.style.bottom = (TB + 8) + 'px';
    }

    // ---------- time state ----------
    let T = 0, mode = 'idle', rate = 1, target = 0, travel = null, after = null, dirty = true, dirtyTL = true;
    let caseOpen = false, caseAnim = false;
    let lastNow = performance.now();
    function render(T_) {
      SCENE_IDS.forEach((id, si) => {
        const s = SI[id], scn = SC[id];
        const first = si === 0, last = si === SCENE_IDS.length - 1;
        const vis = (first ? T_ >= 0 : T_ > s.sIn + 1e-6) && (last || T_ < s.hOut - 1e-6);
        if (!vis) { if (scn.ly.style.visibility !== 'hidden') { scn.ly.style.visibility = 'hidden'; scn.ly.inert = true; } return; }
        scn.ly.style.visibility = 'visible'; scn.ly.style.zIndex = s.z;
        const pIn = first ? clamp(T_ / holds[0].L) : clamp((T_ - s.sIn) / (s.hIn - s.sIn));
        const pOut = last ? 0 : clamp((T_ - s.sOut) / (s.hOut - s.sOut));
        scn.ly.inert = pIn < 0.5 || pOut > 0.5;
        scn.render(T_, pIn, pOut);
      });
      if (!(T_ > SI.withdrawn.sIn && T_ < SI.withdrawn.hIn)) cutSvg.style.display = 'none';
      const j = segIdx(T_); const h = holds[j];
      slB.textContent = `SC ${pad2(SCENE_IDS.indexOf(h.scene) + 1)} ${SCENE_NAME[h.scene]}${h.scene === 'work' ? ` · ${pad2(h.sub + 1)}/${pad2(N)}` : ''}`;
      tcEl.textContent = tc(T_);
      scnEl.textContent = h.scene === 'work' ? `Work · ${items[h.sub].name}` : SCENE_NAME[h.scene];
      tl.setAttribute('aria-valuenow', T_.toFixed(2)); tl.setAttribute('aria-valuetext', `${tc(T_)}, ${scnEl.textContent}`);
    }
    const tc = (t) => { const f = Math.round(Math.max(0, t) * 24); return `${pad2(Math.floor(f / 1440))}:${pad2(Math.floor(f / 24) % 60)}:${pad2(f % 24)}`; };
    function setPlayIcon(playing) { bPlay.replaceChildren(playing ? icPause : icPlay); bPlay.setAttribute('aria-label', playing ? 'Pause (Space)' : 'Play to the next keyframe (Space)'); }
    function playTo(t, r = 1) { target = t; rate = t >= T ? Math.abs(r) : -Math.abs(r); mode = 'play'; setPlayIcon(true); dirty = true; }
    function arrived() {
      mode = 'idle'; setPlayIcon(false);
      const j = holdAt(T);
      if (j >= 0) {
        const h = holds[j]; live.textContent = h.scene === 'work' ? `Work: ${items[h.sub].name}` : SCENE_NAME[h.scene];
        const want = '#' + h.scene; const cur = location.hash.split('/')[0];
        if (!caseOpen && cur !== want && !(h.scene === 'arrival' && !location.hash)) history.replaceState(null, '', want);
      }
      if (after) { const f = after; after = null; f(); }
      dirtyTL = true;
    }
    function travelTo(b, then) { const dist = Math.abs(b - T); travel = { a: T, b, t: 0, d: clamp(0.45 + dist * 0.045, 0.55, 1.3), then }; mode = 'travel'; setPlayIcon(true); dirty = true; }
    function goHold(j, then) {
      j = Math.max(0, Math.min(holds.length - 1, j)); const h = holds[j];
      after = then || null;
      if (reduced) { T = h.H; dirty = true; render(T); arrived(); return; }
      if (Math.abs(T - h.H) < 1e-6) { arrived(); return; }
      if (T < h.H) { if (T >= h.S - 1e-6) playTo(h.H, 1); else travelTo(h.S, () => playTo(h.H, 1)); }
      else { if (j + 1 < holds.length && T <= holds[j + 1].H + 1e-6) playTo(h.H, 1.6); else travelTo(h.H, null); }
    }
    const nextHold = () => { const j = holds.findIndex((h) => h.H > T + 1e-5); return j < 0 ? holds.length - 1 : j; };
    const prevHold = () => { let j = -1; holds.forEach((h, i) => { if (h.H < T - 1e-5) j = i; }); return Math.max(0, j); };
    function step(dir) {
      let j = dir > 0 ? nextHold() : prevHold();
      if (dir > 0 && mode === 'play' && Math.abs(target - holds[j].H) < 1e-6 && j + 1 < holds.length) j++;
      const h = holds[j]; const cur = holds[segIdx(T)];
      if (h.scene !== cur.scene || (h.scene === 'work' && cur.scene !== 'work')) go('#' + h.scene, j); else goHold(j);
    }
    function replayArrival() { closeCaseNow(); T = 0; render(0); playTo(holds[0].H, 1); }
    function replayCurrent() {
      if (caseOpen) { cs.replayVisible(); return; }
      const j = holdAt(T) >= 0 ? holdAt(T) : segIdx(T); const h = holds[j];
      if (reduced) return; T = h.S; dirty = true; playTo(h.H, 1);
    }

    // ---------- routing ----------
    let pendingHold = null;
    function go(hash, j) { pendingHold = j == null ? null : j; if (location.hash === hash) applyRoute(); else location.hash = hash; }
    function parse() { const h = decodeURIComponent((location.hash || '').replace(/^#\/?/, '')); const [a, b] = h.split('/'); return { scene: SCENE_IDS.includes(a) ? a : 'arrival', slug: a === 'work' && b && idxOf(b) >= 0 ? b : null }; }
    function applyRoute() {
      const r = parse(); closeIdx(); closeEase();
      const ph = pendingHold; pendingHold = null;
      if (r.slug) {
        const i = idxOf(r.slug);
        if (caseOpen) { swapCase(r.slug); return; }
        const j = workFirst + i;
        if (Math.abs(T - holds[j].H) < 1e-6) { openCase(r.slug); return; }
        if (reduced) { T = holds[j].H; render(T); openCase(r.slug); return; }
        goHold(j, () => openCase(r.slug));
        return;
      }
      if (caseOpen) { closeCase(r.scene !== 'work' ? () => goHold(firstHold[r.scene]) : null); return; }
      const cur = holds[segIdx(T)].scene;
      if (r.scene === 'work' && cur === 'work' && ph == null && mode === 'idle') return;
      let tj = firstHold[r.scene];
      if (r.scene === 'work' && T > SI.work.sOut) tj = workFirst + N - 1;
      goHold(ph != null ? ph : tj);
    }
    on(window, 'hashchange', applyRoute);

    // ---------- case open / swap / close ----------
    function openCase(slug) {
      const i = idxOf(slug);
      cs.build(slug); caseOpen = true; caseAnim = true;
      const [fc] = fieldOf(slug);
      const from = wk.cardRect(i);
      const to = { x: 0, y: 0, w: W, h: H - TB };
      cs.field.style.background = fc; cs.field.hidden = false; cs.box.hidden = false; cs.box.style.opacity = 0; cs.scroller.scrollTop = 0;
      const fr = (k) => { const x = lerp(from.x, to.x, k), y = lerp(from.y, to.y, k), w = lerp(from.w, to.w, k), h = lerp(from.h, to.h, k); Object.assign(cs.field.style, { transform: `translate(${x}px, ${y}px)`, width: w + 'px', height: h + 'px' }); };
      fr(0);
      tween(reduced ? 0 : 760, (k) => fr(E(k)), () => {
        cs.box.style.opacity = '';
        tween(reduced ? 0 : 260, (k) => { cs.box.style.opacity = clamp(k); }, () => { cs.box.style.opacity = ''; cs.field.hidden = true; caseAnim = false; cs.focus(); });
      });
      stage.inert = true; dirtyTL = true;
      live.textContent = `Case: ${items[i].name}`;
    }
    function swapCase(slug) {
      if (cs.slug === slug) return;
      const i = idxOf(slug); const [fc] = fieldOf(slug);
      // keep the reel underneath on the same product, so closing lands on its card
      T = holds[workFirst + i].H; mode = 'idle'; dirty = true;
      if (reduced) { cs.build(slug); cs.focus(); dirtyTL = true; return; }
      cs.wipe.style.background = fc; cs.wipe.hidden = false;
      const Wd = W, Hd = H - TB;
      Object.assign(cs.wipe.style, { width: Wd + 'px', height: Hd + 'px' });
      tween(380, (k) => { cs.wipe.style.transform = `translateX(${((E(k) - 1) * Wd).toFixed(1)}px)`; }, () => {
        cs.build(slug); dirtyTL = true;
        tween(420, (k) => { cs.wipe.style.transform = `translateX(${(E(k) * Wd).toFixed(1)}px)`; }, () => { cs.wipe.hidden = true; cs.focus(); });
      });
      live.textContent = `Case: ${items[i].name}`;
    }
    function closeCase(then) {
      if (!caseOpen) { if (then) then(); return; }
      const i = idxOf(cs.slug); const [fc] = fieldOf(cs.slug);
      caseAnim = true;
      const to = wk.cardRect(i); const from = { x: 0, y: 0, w: W, h: H - TB };
      cs.field.style.background = fc; cs.field.hidden = false;
      const fr = (k) => { const x = lerp(from.x, to.x, k), y = lerp(from.y, to.y, k), w = lerp(from.w, to.w, k), h = lerp(from.h, to.h, k); Object.assign(cs.field.style, { transform: `translate(${x}px, ${y}px)`, width: w + 'px', height: h + 'px' }); };
      fr(0); stage.inert = false;
      tween(reduced ? 0 : 160, (k) => { cs.box.style.opacity = 1 - k; }, () => {
        cs.box.hidden = true; cs.box.style.opacity = ''; cs.close(); caseOpen = false; dirtyTL = true;
        tween(reduced ? 0 : 520, (k) => fr(E(k)), () => { cs.field.hidden = true; caseAnim = false; const b = wk.cards[i].c.querySelector('.c-play'); if (b && !then) b.focus({ preventScroll: true }); if (then) then(); });
      });
    }
    function closeCaseNow() { if (!caseOpen) return; cs.box.hidden = true; cs.field.hidden = true; cs.close(); caseOpen = false; stage.inert = false; caseAnim = false; }
    cs.field.hidden = true; cs.wipe.hidden = true;

    // ---------- timeline drawing ----------
    let tlW = 0, tlH = 0, dpr = 1, keyHits = [];
    function sizeTL() { dpr = Math.min(2, devicePixelRatio || 1); const r = tl.getBoundingClientRect(); tlW = Math.max(10, r.width); tlH = Math.max(10, r.height); tl.width = Math.round(tlW * dpr); tl.height = Math.round(tlH * dpr); onion.width = Math.round(W * dpr); onion.height = Math.round(H * dpr); dirtyTL = true; }
    const X0 = 10, X1 = () => tlW - 10;
    const tToX = (t) => X0 + (t / D) * (X1() - X0);
    const xToT = (x) => clamp((x - X0) / (X1() - X0)) * D;
    function curvePath(g, x0, y0, x1, y1) { g.beginPath(); for (let i = 0; i <= 28; i++) { const k = i / 28; const x = lerp(x0, x1, k), y = lerp(y0, y1, E(k)); if (i) g.lineTo(x, y); else g.moveTo(x, y); } }
    function diamond(g, x, y, s, fill, stroke) { g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1.2; g.stroke(); } }
    function drawTL() {
      if (reduced) return;
      const g = tg; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, tlW, tlH);
      g.font = '500 10px "Bricolage Grotesque", sans-serif'; g.textBaseline = 'middle';
      const compact = tlH < 60;
      const yLab = 9, yT = compact ? 6 : 18, yB = compact ? tlH - 18 : tlH - 22, yR = tlH - 9;
      keyHits = [];
      if (caseOpen) {
        const sh = cs.shots(); const sc = cs.scroller; const max = Math.max(1, sc.scrollHeight - sc.clientHeight);
        const pos = sh.map((s) => clamp(s.s.offsetTop / max));
        g.strokeStyle = 'rgba(243,238,227,.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X0, (yT + yB) / 2); g.lineTo(X1(), (yT + yB) / 2); g.stroke();
        const [fc] = fieldOf(cs.slug);
        sh.forEach((s, i) => {
          const x = X0 + pos[i] * (X1() - X0), xn = i + 1 < sh.length ? X0 + pos[i + 1] * (X1() - X0) : X1();
          g.fillStyle = i % 2 ? 'rgba(243,238,227,.07)' : 'rgba(243,238,227,.13)'; g.fillRect(x, yT, Math.max(1, xn - x - 1), yB - yT);
          diamond(g, x, (yT + yB) / 2, 5, i === 0 ? fc : PAPER);
          keyHits.push({ x, shot: i });
          if (!compact && xn - x > 46) { g.fillStyle = 'rgba(243,238,227,.7)'; g.fillText((s.title || '').slice(0, Math.floor((xn - x - 8) / 5.6)), x + 8, yLab); }
        });
        const pk = clamp(sc.scrollTop / max); const px = X0 + pk * (X1() - X0);
        playhead(g, px, compact);
        return;
      }
      // ruler
      g.strokeStyle = 'rgba(243,238,227,.28)'; g.fillStyle = 'rgba(243,238,227,.55)'; g.lineWidth = 1;
      for (let t = 0; t <= D; t += 0.5) { const x = Math.round(tToX(t)) + 0.5; const major = Math.abs(t - Math.round(t)) < 1e-6 && Math.round(t) % 2 === 0; g.beginPath(); g.moveTo(x, yR + (major ? -4 : -1)); g.lineTo(x, yR + 3); g.stroke(); if (major && !compact && t > 0) g.fillText(`${Math.round(t)}s`, x + 3, yR - 1); }
      // scene segments with the ease drawn inside each transition
      holds.forEach((h, j) => {
        const x0 = tToX(h.S), x1 = tToX(h.H);
        const col = h.scene === 'work' && h.sub > 0 ? fieldOf(items[h.sub].slug)[0] : SCENE_TL[h.scene];
        g.fillStyle = col; g.globalAlpha = 0.16; g.fillRect(x0, yT, Math.max(1, x1 - x0), yB - yT); g.globalAlpha = 1;
        g.strokeStyle = col === '#0E0D0B' ? MINT : col; g.lineWidth = 1.5; curvePath(g, x0 + 1, yB - 2, x1 - 1, yT + 2); g.stroke();
        if (!compact && (h.sub == null || h.sub === 0)) { g.fillStyle = 'rgba(243,238,227,.85)'; const lab = SCENE_NAME[h.scene]; const room = (h.scene === 'work' ? tToX(holds[workFirst + N - 1].H) : x1) - x0; if (room > 34) g.fillText(lab.length * 5.7 > room ? lab.slice(0, Math.max(3, Math.floor(room / 5.8))) + '…' : lab, x0 + 3, yLab); }
      });
      holds.forEach((h, j) => { const x = tToX(h.H); diamond(g, x, (yT + yB) / 2, h.sub > 0 ? 4 : 5.5, h.scene === 'work' && h.sub > 0 ? fieldOf(items[h.sub].slug)[0] : PAPER, INK); keyHits.push({ x, j }); });
      playhead(g, tToX(T), compact);
    }
    function playhead(g, x, compact) {
      g.strokeStyle = ORANGE; g.lineWidth = 2; g.beginPath(); g.moveTo(x, compact ? 2 : 13); g.lineTo(x, tlH - 2); g.stroke();
      g.fillStyle = ORANGE; g.beginPath(); const y = compact ? 2 : 11; g.moveTo(x - 6, y - 8); g.lineTo(x + 6, y - 8); g.lineTo(x + 6, y - 2); g.lineTo(x, y + 3); g.lineTo(x - 6, y - 2); g.closePath(); if (!compact) g.fill();
    }
    function drawEaseIcon() {
      let d = ''; for (let i = 0; i <= 16; i++) { const k = i / 16; d += `${i ? 'L' : 'M'}${(3 + 18 * k).toFixed(1)} ${(20 - 16 * E(k)).toFixed(1)}`; } easeIconPath.setAttribute('d', d);
    }
    // ---------- onion skins + motion paths ----------
    function primsAt(t) {
      if (t < 0) return [];
      const out = [];
      SCENE_IDS.forEach((id, si) => { const s = SI[id]; const first = si === 0, last = si === SCENE_IDS.length - 1; if ((first ? t >= 0 : t > s.sIn) && (last || t < s.hOut)) out.push(...SC[id].prims(t)); });
      return out;
    }
    function drawPrim(g, p) {
      g.beginPath();
      if (p.t === 'c') { g.ellipse(p.x, p.y, p.r * (p.sx || 1), p.r * (p.sy || 1), 0, 0, Math.PI * 2); }
      else if (p.t === 'r') g.rect(p.x, p.y, p.w, p.h);
      else if (p.t === 'l') { g.moveTo(p.x1, p.y1); g.lineTo(p.x2, p.y2); }
      else if (p.t === 'p') { p.pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }
      g.stroke();
    }
    let onionDrawn = false;
    function drawOnion() {
      const show = !reduced && !caseOpen && (guides || mode === 'scrub' || mode === 'travel');
      if (!show) { if (onionDrawn) { og.setTransform(1, 0, 0, 1, 0, 0); og.clearRect(0, 0, onion.width, onion.height); onionDrawn = false; } return; }
      const g = og; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); onionDrawn = true;
      const n = 4, dt = 1 / 12;
      for (let k = n; k >= 1; k--) {
        const a = 0.6 * (1 - (k - 1) / n);
        g.lineWidth = 1.4;
        g.strokeStyle = `rgba(43,54,224,${a})`; primsAt(T - k * dt).forEach((p) => drawPrim(g, p));
        g.strokeStyle = `rgba(232,51,28,${a})`; primsAt(T + k * dt).forEach((p) => drawPrim(g, p));
      }
      // the motion path of the current segment's hero, with spacing dots every frame at 24 fps
      const j = segIdx(T); const h = holds[j]; const scn = SC[h.scene];
      if (!scn.hero) return;
      const pts = []; for (let t = h.S; t <= h.H + 1e-6; t += 1 / 24) { const p = scn.hero(Math.min(t, h.H)); if (p) pts.push(p); }
      if (pts.length < 2) return;
      g.strokeStyle = 'rgba(20,18,16,.75)'; g.lineWidth = 1; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.stroke();
      g.strokeStyle = 'rgba(243,238,227,.8)'; g.lineWidth = 3; g.globalCompositeOperation = 'destination-over'; g.stroke(); g.globalCompositeOperation = 'source-over';
      pts.forEach((p) => { g.fillStyle = INK; g.beginPath(); g.arc(p.x, p.y, 2, 0, Math.PI * 2); g.fill(); });
      diamond(g, pts[0].x, pts[0].y, 5, PAPER, INK); diamond(g, pts[pts.length - 1].x, pts[pts.length - 1].y, 5, ORANGE, INK);
    }
    // ---------- ease editor canvas ----------
    let ezS = 220, ezPad = 34;
    function sizeEase() { ezS = phone ? Math.min(220, W - 120) : 220; ezc.style.width = ezS + 'px'; ezc.style.height = ezS + 'px'; ezc.width = ezS * dpr; ezc.height = ezS * dpr; }
    const ezX = (v) => ezPad + v * (ezS - 2 * ezPad), ezY = (v) => ezS - ezPad - v * (ezS - 2 * ezPad) * 0.62 - (ezS - 2 * ezPad) * 0.19;
    const ezInv = (x, y) => [clamp((x - ezPad) / (ezS - 2 * ezPad)), (ezS - ezPad - (ezS - 2 * ezPad) * 0.19 - y) / ((ezS - 2 * ezPad) * 0.62)];
    function drawEase() {
      const g = ezg; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, ezS, ezS);
      g.fillStyle = PAPER; g.fillRect(0, 0, ezS, ezS);
      g.strokeStyle = 'rgba(20,18,16,.12)'; g.lineWidth = 1;
      for (let i = 0; i <= 4; i++) { const v = i / 4; g.beginPath(); g.moveTo(ezX(v), ezY(-0.3)); g.lineTo(ezX(v), ezY(1.3)); g.stroke(); g.beginPath(); g.moveTo(ezX(0), ezY(v)); g.lineTo(ezX(1), ezY(v)); g.stroke(); }
      const [a, b, c, d] = sigPts;
      g.strokeStyle = 'rgba(20,18,16,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(ezX(0), ezY(0)); g.lineTo(ezX(a), ezY(b)); g.moveTo(ezX(1), ezY(1)); g.lineTo(ezX(c), ezY(d)); g.stroke();
      g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(ezX(0), ezY(0)); g.bezierCurveTo(ezX(a), ezY(b), ezX(c), ezY(d), ezX(1), ezY(1)); g.stroke();
      // spacing: where each 1/24 s frame lands on the curve
      for (let i = 0; i <= 24; i++) { const k = i / 24; g.fillStyle = ORANGE; g.beginPath(); g.arc(ezX(1) + 14, ezY(E(k)), 2, 0, Math.PI * 2); g.fill(); }
      [[a, b], [c, d]].forEach(([x, y]) => { g.fillStyle = ORANGE; g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.arc(ezX(x), ezY(y), 7, 0, Math.PI * 2); g.fill(); g.stroke(); });
      diamond(g, ezX(0), ezY(0), 5, INK); diamond(g, ezX(1), ezY(1), 5, INK);
      ezRead.textContent = sigCss();
      preBtns.forEach(({ b, pts }) => b.classList.toggle('on', pts.every((v, i) => Math.abs(v - sigPts[i]) < 0.005)));
    }
    let ezDrag = -1;
    on(ezc, 'pointerdown', (e) => { const r = ezc.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; const [a, b, c, d] = sigPts; const d1 = Math.hypot(x - ezX(a), y - ezY(b)), d2 = Math.hypot(x - ezX(c), y - ezY(d)); ezDrag = d1 < d2 ? 0 : 1; ezc.setPointerCapture(e.pointerId); moveEz(x, y); });
    on(ezc, 'pointermove', (e) => { if (ezDrag < 0) return; const r = ezc.getBoundingClientRect(); moveEz(e.clientX - r.left, e.clientY - r.top); });
    on(ezc, 'pointerup', () => { if (ezDrag >= 0) { ezDrag = -1; replayCurrent(); } });
    function moveEz(x, y) { const [u, v] = ezInv(x, y); const p = sigPts.slice(); p[ezDrag * 2] = clamp(u); p[ezDrag * 2 + 1] = clamp(v, -0.5, 1.5); setEase(p); }
    function setEase(p) { sigPts = p.map((v) => Math.round(v * 100) / 100); E = bez(...sigPts); root.style.setProperty('--sig', sigCss()); dirty = true; dirtyTL = true; drawEaseIcon(); if (easeOpen) drawEase(); }

    // ---------- timeline pointer: scrub the playhead, drag a keyframe ----------
    let drag = null;
    on(tl, 'pointerdown', (e) => {
      if (reduced) return;
      const r = tl.getBoundingClientRect(); const x = e.clientX - r.left;
      tl.setPointerCapture(e.pointerId); closeIdx(); closeEase();
      if (caseOpen) { drag = { kind: 'case' }; scrubCase(x); return; }
      const hit = keyHits.filter((k) => k.j != null).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0];
      if (hit && Math.abs(hit.x - x) < (touch ? 12 : 8) && e.clientY - r.top > tlH * 0.25) { drag = { kind: 'key', j: hit.j }; T = holds[hit.j].H; mode = 'idle'; dirty = true; tl.style.cursor = 'ew-resize'; return; }
      drag = { kind: 'scrub', last: T }; mode = 'scrub'; T = xToT(x); dirty = true;
    });
    on(tl, 'pointermove', (e) => {
      const r = tl.getBoundingClientRect(); const x = e.clientX - r.left;
      if (!drag) { if (!caseOpen && !reduced) { const near = keyHits.some((k) => k.j != null && Math.abs(k.x - x) < 8) && e.clientY - r.top > tlH * 0.25; tl.style.cursor = near ? 'ew-resize' : 'pointer'; } return; }
      if (drag.kind === 'case') { scrubCase(x); return; }
      if (drag.kind === 'key') { const h = holds[drag.j]; const t = xToT(x); h.L = clamp(t - h.S, h.min, h.max); relayout(); relayoutAll(false); T = h.H; dirty = true; dirtyTL = true; return; }
      drag.last = T; T = xToT(x); dirty = true;
    });
    const endDrag = () => {
      if (!drag) return; const d = drag; drag = null; tl.style.cursor = '';
      if (d.kind === 'key') { const h = holds[d.j]; T = h.S; playTo(h.H, 1); return; }
      if (d.kind === 'scrub') {
        const hj = holdAt(T); if (hj >= 0) { mode = 'idle'; arrived(); return; }
        const j = segIdx(T); const h = holds[j]; const p = (T - h.S) / h.L;
        const dir = T - d.last;
        if (p >= 0.5 || dir > 0.02) playTo(h.H, 1); else playTo(j > 0 ? holds[j - 1].H : h.H, 1);
      }
    };
    on(tl, 'pointerup', endDrag); on(tl, 'pointercancel', endDrag);
    function scrubCase(x) { const sc = cs.scroller; const k = clamp((x - X0) / (X1() - X0)); sc.scrollTop = k * (sc.scrollHeight - sc.clientHeight); dirtyTL = true; }
    on(tl, 'click', (e) => { if (!caseOpen) return; const r = tl.getBoundingClientRect(); const x = e.clientX - r.left; const hit = keyHits.filter((k) => k.shot != null).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0]; if (hit && Math.abs(hit.x - x) < 10) cs.shots()[hit.shot].s.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); });
    on(tl, 'keydown', (e) => {
      if (caseOpen) { const sc = cs.scroller; if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { sc.scrollBy({ top: sc.clientHeight * 0.8, behavior: 'smooth' }); e.preventDefault(); e.stopPropagation(); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { sc.scrollBy({ top: -sc.clientHeight * 0.8, behavior: 'smooth' }); e.preventDefault(); e.stopPropagation(); } return; }
      if (e.shiftKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { mode = 'idle'; T = clamp(T + (e.key === 'ArrowRight' ? 1 : -1) / 24, 0, D); dirty = true; e.preventDefault(); e.stopPropagation(); }
    });

    // ---------- transport + keys ----------
    on(bPrev, 'click', () => (caseOpen ? cs.scroller.scrollBy({ top: -cs.scroller.clientHeight * 0.8, behavior: 'smooth' }) : step(-1)));
    on(bNext, 'click', () => (caseOpen ? cs.scroller.scrollBy({ top: cs.scroller.clientHeight * 0.8, behavior: 'smooth' }) : step(1)));
    on(bPlay, 'click', togglePlay);
    function togglePlay() { if (caseOpen) return; if (mode === 'play' || mode === 'travel') { mode = 'idle'; travel = null; after = null; setPlayIcon(false); dirty = true; return; } step(1); }
    on(window, 'keydown', (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target && e.target.tagName) || '';
      if (e.key === 'Escape') {
        if (!ix.hidden) { closeIdx(true); return; } if (!ez.hidden) { closeEase(true); return; }
        if (caseOpen) { go('#work'); return; }
        return;
      }
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (caseOpen) {
        if (e.key === 'ArrowLeft') { cs.box.querySelector('.cs-b').click(); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { cs.box.querySelectorAll('.cs-b')[1].click(); e.preventDefault(); }
        return;
      }
      if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'A') { togglePlay(); e.preventDefault(); }
      else if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key) && !inScrollable(e.target, 1)) { step(1); e.preventDefault(); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key) && !inScrollable(e.target, -1)) { step(-1); e.preventDefault(); }
      else if (e.key === 'Home') { go('#arrival'); e.preventDefault(); }
      else if (e.key === 'End') { go('#contact'); e.preventDefault(); }
    });
    function inScrollable(t, dir) {
      let n = t && t.nodeType === 1 ? t : null;
      while (n && n !== root) { if (n.classList && n.classList.contains('scroll')) { const can = dir > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 2 : n.scrollTop > 1; if (can && n.scrollHeight > n.clientHeight + 2) return true; } n = n.parentElement; }
      return false;
    }
    // wheel = step to the next keyframe, unless a reading surface can still scroll that way
    let wheelAcc = 0, wheelLock = 0, lastWheel = 0;
    on(stage, 'wheel', (e) => {
      if (caseOpen) return;
      const dir = Math.sign(e.deltaY || e.deltaX); if (!dir) return;
      if (inScrollable(e.target, dir)) { wheelAcc = 0; return; }
      const now = performance.now();
      if (now - lastWheel > 260) wheelAcc = 0; lastWheel = now;
      if (now < wheelLock || mode !== 'idle') { wheelLock = Math.max(wheelLock, now + 160); return; }
      wheelAcc += e.deltaY || e.deltaX;
      if (Math.abs(wheelAcc) > 48) { wheelAcc = 0; wheelLock = now + 500; step(dir); }
    }, { passive: true });
    // touch swipe on the stage (reading surfaces keep their native scroll)
    let sw = null;
    on(stage, 'pointerdown', (e) => { if (e.pointerType !== 'touch') return; sw = { x: e.clientX, y: e.clientY, t: e.target, at: performance.now() }; });
    on(stage, 'pointerup', (e) => {
      if (!sw || e.pointerType !== 'touch') return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y; const s = sw; sw = null;
      if (performance.now() - s.at > 900) return;
      if (Math.abs(dy) > 56 && Math.abs(dy) > Math.abs(dx) * 1.2) { const dir = dy < 0 ? 1 : -1; if (inScrollable(s.t, dir)) return; step(dir); }
      else if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1);
    });
    on(stage, 'pointercancel', () => { sw = null; });
    on(document, 'pointerdown', (e) => { if (!ix.hidden && !ix.contains(e.target) && !bIdx.contains(e.target)) closeIdx(); if (!ez.hidden && !ez.contains(e.target) && !bEase.contains(e.target)) closeEase(); });

    // ---------- layout ----------
    function relayoutAll(full = true) {
      if (full) {
        W = root.clientWidth || innerWidth; H = root.clientHeight || innerHeight; phone = W < 760;
        root.classList.toggle('is-phone', phone);
        TB = bar.getBoundingClientRect().height || 88;
        root.style.setProperty('--tb', TB + 'px');
        onion.style.width = W + 'px'; onion.style.height = H + 'px';
        Object.values(SC).forEach((s) => s.layout());
        sizeTL(); if (easeOpen) { sizeEase(); placePop(ez, bEase); }
        if (!ix.hidden) placePop(ix, bIdx);
      } else { ar.layout(); }
      dirty = true; dirtyTL = true;
    }
    let rsT = 0;
    on(window, 'resize', () => { clearTimeout(rsT); timers.delete(rsT); rsT = later(() => relayoutAll(true), 90); });

    // ---------- main loop ----------
    let raf = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - lastNow) / 1000); lastNow = now;
      if (mode === 'play') {
        T += dt * rate;
        if ((rate > 0 && T >= target) || (rate < 0 && T <= target)) { T = target; render(T); arrived(); }
        dirty = true;
      } else if (mode === 'travel' && travel) {
        travel.t += dt; const k = clamp(travel.t / travel.d); T = lerp(travel.a, travel.b, easeIO(k));
        if (k >= 1) { T = travel.b; const f = travel.then; travel = null; if (f) { mode = 'idle'; f(); } else { render(T); arrived(); } }
        dirty = true;
      }
      for (let i = tweens.length - 1; i >= 0; i--) { const tw = tweens[i]; const k = clamp((now - tw.t0) / tw.d); tw.fn(k); if (k >= 1) { tweens.splice(i, 1); if (tw.done) tw.done(); } }
      if (dirty) { render(T); dirtyTL = true; drawOnion(); dirty = false; }
      if (dirtyTL) { drawTL(); dirtyTL = false; }
      if (easeOpen) { const k = ((now / 1000) % 1.6) / 1.2; ezDot.style.transform = `translateX(${(E(clamp(k)) * 100).toFixed(2)}%)`; }
    }

    // ---------- go ----------
    // the @font-face rules only exist once the stylesheet has loaded; fonts.load() before that resolves empty
    const cssReady = new Promise((r) => { if (link.sheet) r(); link.onload = r; link.onerror = r; });
    const fontsReady = cssReady.then(() => Promise.all([document.fonts.load('820 100px "Anybody"'), document.fonts.load('400 16px "Bricolage Grotesque"'), document.fonts.load('600 16px "Bricolage Grotesque"')])).catch(() => {});
    await Promise.race([fontsReady, new Promise((r) => later(r, 2500))]);
    if (!alive) return () => {};
    relayoutAll(true);
    drawEaseIcon();
    const r0 = parse();
    if (r0.slug) {
      const j = workFirst + idxOf(r0.slug); T = holds[j].H; render(T); arrived(); openCase(r0.slug);
    } else if (r0.scene !== 'arrival' && location.hash) {
      const j = firstHold[r0.scene];
      if (reduced) { T = holds[j].H; } else { T = holds[j].S; playTo(holds[j].H, 1); }
    } else if (reduced) { T = holds[0].H; }
    else { T = 0; later(() => { if (mode === 'idle' && T === 0) playTo(holds[0].H, 1); }, 180); }
    dirty = true; render(T);
    raf = requestAnimationFrame(frame);
    // fonts can finish late: re-measure once they do
    let fontsLate = false; fontsReady.then(() => { fontsLate = true; });
    if (!fontsLate) fontsReady.then(() => { if (alive) relayoutAll(true); });
    const onFonts = () => { if (alive) relayoutAll(true); };
    if (document.fonts && document.fonts.addEventListener) { document.fonts.addEventListener('loadingdone', onFonts); cleanup.push(() => document.fonts.removeEventListener('loadingdone', onFonts)); }
    root.__mvqa = { goHold: (j) => goHold(j), holds, get T() { return T; }, set T(v) { T = v; mode = 'idle'; dirty = true; }, setEase: (p) => { setEase(p); }, replay: () => replayCurrent() };

    // ---------- unmount ----------
    return function unmount() {
      alive = false;
      cancelAnimationFrame(raf);
      timers.forEach((id) => clearTimeout(id)); timers.clear();
      tweens.length = 0;
      cleanup.forEach((f) => f()); cleanup.length = 0;
      cs.close();
      delete root.__mvqa;
      root.style.removeProperty('--sig'); root.style.removeProperty('--tb');
      while (root.firstChild) root.firstChild.remove();
      link.remove(); style.remove();
      root.className = rootClass;
    };
  },
};

const CSS = `
.mvw{ --sig: cubic-bezier(.76,0,.24,1); --paper:${PAPER}; --ink:${INK}; --or:${ORANGE}; --co:${COBALT}; --mu:${MUSTARD}; --red:${RED};
  background:${PAPER}; color:${INK}; font-family:'Bricolage Grotesque', 'Iowan Old Style', Georgia, serif; font-optical-sizing:auto;
  -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; -webkit-tap-highlight-color:transparent; }
.mvw *{ box-sizing:border-box; }
.mvw .disp{ font-family:'Anybody', 'Arial Narrow', sans-serif; }
.mvw .sr{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
.mvw .meas{ position:absolute; left:-9999px; top:-9999px; white-space:nowrap; visibility:hidden; line-height:1; }
.mvw .defs{ position:absolute; }
.mvw .stage{ position:absolute; inset:0; overflow:hidden; touch-action:none; }
.mvw .ly{ position:absolute; inset:0; overflow:hidden; visibility:hidden; will-change:transform; }
.mvw .scroll{ overflow-y:auto; overscroll-behavior:contain; touch-action:pan-y; scrollbar-width:thin; }
.mvw a{ color:inherit; }
.mvw button{ font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer; }
.mvw :focus-visible{ outline:2px solid var(--or); outline-offset:3px; }
.mvw .onion{ position:absolute; left:0; top:0; z-index:20; pointer-events:none; }
.mvw .cutline{ position:absolute; left:0; top:0; z-index:15; pointer-events:none; }
.mvw .slate{ position:absolute; left:24px; top:22px; z-index:22; display:flex; flex-direction:column; gap:2px; pointer-events:none; color:${INK};
  font:600 11px/1.25 'Anybody', sans-serif; font-variation-settings:"wdth" 70, "wght" 640; letter-spacing:.06em; text-transform:uppercase; mix-blend-mode:difference; color:#fff; max-width:200px; }
.mvw .slate .sl-a{ font-variation-settings:"wdth" 130, "wght" 820; letter-spacing:.02em; }
.mvw .slate .sl-c{ text-transform:none; letter-spacing:0; opacity:.8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
@media (max-width:1080px){ .mvw .slate{ display:none; } }

/* arrival */
.mvw .sc-arr{ background:${PAPER}; }
.mvw .ar-slab{ position:absolute; background:${COBALT}; }
.mvw .ar-hair{ position:absolute; height:1px; background:${INK}; opacity:.55; }
.mvw .ar-floor{ position:absolute; background:${MUSTARD}; transform-origin:0 50%; }
.mvw .ar-dia{ position:absolute; left:0; top:0; background:${INK}; }
.mvw .ar-trail{ position:absolute; left:0; top:0; pointer-events:none; }
.mvw .ar-name{ position:absolute; margin:0; line-height:.87; font-weight:820; letter-spacing:-.01em; white-space:nowrap; }
.mvw .ar-l1, .mvw .ar-l2{ display:block; white-space:nowrap; }
.mvw .ar-l1{ color:${PAPER}; }
.mvw .ar-l2{ overflow:hidden; padding-top:.14em; margin-top:-.14em; padding-right:.3em; }
.mvw .lt{ display:inline-block; will-change:transform; }
.mvw .ar-mark{ display:inline-block; width:0; height:0; }
.mvw .ar-ball{ position:absolute; left:0; top:0; border-radius:50%; background:${ORANGE}; will-change:transform; }
.mvw .ar-role{ position:absolute; margin:0; font-weight:640; letter-spacing:.01em; white-space:nowrap; }
.mvw .ar-lede{ position:absolute; margin:0; font-size:clamp(16px, 1.45vw, 21px); line-height:1.45; font-variation-settings:"opsz" 24; max-width:640px; }
.mvw .ar-hint{ position:absolute; margin:0; font-size:13px; line-height:1.4; color:rgba(20,18,16,.62); }
.mvw.is-phone .ar-lede{ font-size:15.5px; }
.mvw.is-phone .ar-role{ white-space:normal; right:20px; line-height:1.2; }

/* work reel */
.mvw .sc-work{ background:#24201C; }
.mvw .reel{ position:absolute; left:0; will-change:transform; }
.mvw .card{ position:absolute; top:0; overflow:hidden; display:flex; flex-direction:column; padding:30px 44px 36px; transform-origin:50% 50%; }
.mvw.is-phone .card{ padding:16px 18px 18px; }
.mvw .c-top{ display:flex; justify-content:space-between; align-items:center; gap:12px; }
.mvw .c-meta{ margin:0; display:flex; gap:14px; align-items:baseline; font-size:14px; flex-wrap:wrap; }
.mvw .c-no{ font-variation-settings:"wdth" 120, "wght" 700; font-size:14px; letter-spacing:.04em; }
.mvw .c-kind{ opacity:.82; }
.mvw .c-navs{ display:flex; gap:6px; }
.mvw .c-nav{ width:38px; height:38px; border:1.5px solid currentColor; font-size:22px; line-height:1; display:grid; place-items:center; transition:background 160ms var(--sig), color 160ms var(--sig); }
.mvw .c-nav:hover:not(:disabled){ background:var(--tc); color:var(--fc); }
.mvw .c-nav:disabled{ opacity:.25; cursor:default; }
.mvw .c-name{ margin:auto 0 0; padding-top:12px; line-height:.9; letter-spacing:-.015em; white-space:nowrap; will-change:transform; }
.mvw .c-mid{ display:grid; grid-template-columns: minmax(0,1.25fr) minmax(0,1fr); gap:40px; margin-top:22px; align-items:end; }
.mvw.is-phone .c-mid{ grid-template-columns:1fr; gap:14px; margin-top:12px; }
.mvw .c-one{ margin:0 0 22px; font-size:clamp(17px, 1.6vw, 23px); line-height:1.35; max-width:34ch; font-variation-settings:"opsz" 28; }
.mvw.is-phone .c-one{ font-size:16px; margin-bottom:14px; }
.mvw .c-acts{ display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; }
.mvw .c-play{ display:inline-flex; align-items:center; gap:10px; padding:13px 18px; background:var(--tc); color:var(--fc); font-weight:600; font-size:15px; transition:transform 180ms var(--sig); }
.mvw .c-play:hover{ transform:translateX(4px); }
.mvw .c-link{ font-size:14px; text-decoration:underline; text-underline-offset:3px; text-decoration-thickness:1px; }
.mvw .c-right{ display:flex; align-items:end; justify-content:space-between; gap:20px; }
.mvw .c-nums{ display:flex; flex-direction:column; gap:14px; }
.mvw.is-phone .c-nums{ flex-direction:row; gap:22px; }
.mvw .c-num{ display:flex; flex-direction:column; }
.mvw .c-v{ font-size:clamp(34px, 4vw, 60px); line-height:1; font-variation-settings:"wdth" 104, "wght" 760; font-variant-numeric:tabular-nums; white-space:nowrap; }
.mvw.is-phone .c-v{ font-size:28px; }
.mvw .c-l{ font-size:13px; opacity:.82; margin-top:4px; }
.mvw .c-sting{ position:absolute; right:44px; top:96px; width:min(34%, 42vh, 300px); height:auto; }
.mvw.is-phone .c-sting{ right:16px; top:66px; width:min(30vw, 22vh); }

/* how */
.mvw .sc-how{ background:transparent; }
.mvw .hw-bar{ position:absolute; left:0; top:0; will-change:transform; }
.mvw .hw-head{ position:absolute; left:40px; margin:0; font-size:15px; color:${PAPER}; font-variation-settings:"wdth" 130, "wght" 760; letter-spacing:.08em; text-transform:uppercase; }
.mvw .hw-col{ position:absolute; display:flex; flex-direction:column; justify-content:flex-end; padding-left:40px; padding-right:40px; }
.mvw .hw-n{ font-size:clamp(60px, 9vw, 140px); line-height:.8; font-variation-settings:"wdth" 60, "wght" 300; margin-bottom:auto; }
.mvw .hw-k{ margin:0 0 14px; font-size:clamp(26px, 2.6vw, 40px); line-height:1.02; }
.mvw .hw-v{ margin:0; font-size:clamp(15px, 1.15vw, 18px); line-height:1.5; max-width:40ch; }
.mvw.is-phone .hw-col{ padding-left:20px; padding-right:20px; justify-content:center; }
.mvw.is-phone .hw-n{ position:absolute; right:16px; top:auto; bottom:10px; font-size:54px; opacity:.5; margin:0; }
.mvw.is-phone .hw-k{ font-size:20px; margin-bottom:6px; padding-right:40px; }
.mvw.is-phone .hw-v{ font-size:13.5px; line-height:1.42; padding-right:44px; }

/* withdrawn */
.mvw .sc-wd{ background:${INK}; color:${PAPER}; }
.mvw .wd-in{ position:absolute; inset:0; padding:96px max(40px, calc((100% - 1240px)/2)) 0; }
.mvw .wd-in::after{ content:''; display:block; height:var(--tb, 110px); }
.mvw .wd-head{ display:flex; align-items:flex-end; justify-content:space-between; gap:24px; flex-wrap:wrap; margin-bottom:30px; }
.mvw .wd-t{ margin:0; font-size:clamp(40px, 6.4vw, 104px); line-height:.9; }
.mvw .wd-s{ margin:0; max-width:38ch; font-size:16px; line-height:1.45; opacity:.8; }
.mvw .wd-takes{ display:grid; grid-template-columns:1fr 1fr; gap:28px; }
.mvw .take{ position:relative; border:1.5px solid rgba(243,238,227,.85); padding:0 26px 24px; }
.mvw .tk-slate{ display:flex; justify-content:space-between; margin:0 -26px 20px; padding:10px 26px; background:repeating-linear-gradient(-45deg, ${PAPER} 0 14px, ${INK} 14px 28px); color:${INK}; }
.mvw .tk-sl, .mvw .tk-ng{ background:${PAPER}; padding:2px 8px; font-size:13px; font-variation-settings:"wdth" 120, "wght" 760; letter-spacing:.06em; text-transform:uppercase; }
.mvw .tk-ng{ background:${RED}; color:${PAPER}; }
.mvw .tk-title{ position:relative; display:inline-block; margin:0 0 12px; font-size:clamp(24px, 2.3vw, 34px); line-height:1.05; font-variation-settings:"wdth" 92, "wght" 760; }
.mvw .tk-strike{ position:absolute; left:-4px; right:-4px; top:56%; height:2px; background:${RED}; transform-origin:0 50%; transform:scaleX(0); }
.mvw .tk-what{ margin:0 0 18px; font-size:16px; line-height:1.5; opacity:.9; }
.mvw .tk-viz{ margin:6px 0 16px; min-height:64px; }
.mvw .gz{ position:relative; height:34px; margin:34px 0 26px; border-bottom:1.5px solid rgba(243,238,227,.6); }
.mvw .gz-fill{ position:absolute; left:0; bottom:0; height:22px; background:${PAPER}; }
.mvw .gz-gate{ position:absolute; top:-30px; bottom:-8px; width:0; border-left:2px dashed ${RED}; }
.mvw .gz-gl{ position:absolute; left:6px; top:-2px; white-space:nowrap; color:${RED}; font-size:13px; font-weight:600; }
.mvw .gz-tick{ position:absolute; bottom:-22px; transform:translateX(-50%); font-size:11px; opacity:.6; font-variant-numeric:tabular-nums; }
.mvw .gz-ml{ position:absolute; bottom:26px; transform:translateX(-50%); font-size:13px; font-weight:600; white-space:nowrap; font-variant-numeric:tabular-nums; }
.mvw .fr-row{ display:flex; gap:10px; flex-wrap:wrap; }
.mvw .fr{ --x:0; position:relative; width:52px; height:40px; border:1.5px solid ${PAPER}; display:grid; place-items:center; font-size:12px; overflow:hidden; }
.mvw .fr-p{ opacity:calc(1 - var(--x) * .6); }
.mvw .fr-x{ position:absolute; left:-10%; top:50%; width:120%; height:2.5px; background:${RED}; transform:rotate(-38deg) scaleX(var(--x)); }
.mvw .tk-nums{ display:flex; gap:34px; margin-bottom:14px; }
.mvw .tk-num{ display:flex; flex-direction:column; }
.mvw .tk-v{ font-size:clamp(34px, 3.6vw, 54px); line-height:1; font-variation-settings:"wdth" 100, "wght" 760; font-variant-numeric:tabular-nums; }
.mvw .tk-l{ font-size:13px; opacity:.75; margin-top:4px; }
.mvw .tk-link{ font-size:15px; text-decoration:underline; text-underline-offset:3px; }
.mvw .tk-stamp{ position:absolute; right:22px; bottom:22px; color:${RED}; border:2.5px solid ${RED}; padding:4px 10px; font-size:18px; letter-spacing:.08em; text-transform:uppercase; font-variation-settings:"wdth" 120, "wght" 820; pointer-events:none; }
.mvw.is-phone .wd-in{ padding:86px 16px 0; }
.mvw.is-phone .wd-takes{ grid-template-columns:1fr; gap:18px; }
.mvw.is-phone .take{ padding:0 16px 18px; }
.mvw.is-phone .tk-slate{ margin:0 -16px 14px; padding:8px 16px; }
.mvw.is-phone .tk-what{ font-size:15px; }
.mvw.is-phone .tk-stamp{ font-size:14px; right:14px; bottom:16px; }

/* capabilities */
.mvw .sc-cap{ background:transparent; }
.mvw .cp-strip{ position:absolute; left:0; top:0; will-change:transform; }
.mvw .cp-in{ position:absolute; inset:0; padding:96px max(40px, calc((100% - 1280px)/2)) 0; }
.mvw .cp-in::after{ content:''; display:block; height:var(--tb, 110px); }
.mvw .cp-head{ display:flex; justify-content:space-between; align-items:flex-end; gap:24px; flex-wrap:wrap; margin-bottom:18px; }
.mvw .cp-t{ margin:0; font-size:clamp(40px, 6vw, 96px); line-height:.9; }
.mvw .cp-s{ margin:0; max-width:40ch; font-size:15px; line-height:1.45; opacity:.8; }
.mvw .cp-filter{ display:flex; flex-wrap:wrap; gap:6px 18px; padding:12px 0 16px; border-top:1.5px solid ${INK}; border-bottom:1px solid rgba(20,18,16,.25); margin-bottom:22px; }
.mvw .cp-pb{ display:inline-flex; align-items:center; gap:7px; font-size:14px; font-weight:560; padding:4px 0; }
.mvw .cp-pb:hover span, .mvw .cp-pb:focus-visible span{ text-decoration:underline; text-underline-offset:3px; }
.mvw .sq{ display:inline-block; width:11px; height:11px; flex:none; box-shadow:inset 0 0 0 1px rgba(20,18,16,.35); }
.mvw .cp-grid{ display:grid; grid-template-columns:1fr 1fr; gap:26px 48px; }
.mvw .cp-gh{ margin:0 0 8px; font-size:14px; letter-spacing:.08em; text-transform:uppercase; font-variation-settings:"wdth" 125, "wght" 760; }
.mvw .cp-ul{ list-style:none; margin:0; padding:0; }
.mvw .cp-row{ display:grid; grid-template-columns:minmax(0,1fr) auto; gap:4px 16px; padding:8px 0; border-top:1px solid rgba(20,18,16,.16); transition:opacity 320ms var(--sig); }
.mvw .cp-sk{ font-size:17px; line-height:1.2; font-variation-settings:"wdth" 92, "wght" 560; transition:font-variation-settings 460ms var(--sig), letter-spacing 460ms var(--sig); }
.mvw .cp-pr{ display:flex; flex-wrap:wrap; gap:3px 10px; justify-content:flex-end; max-width:300px; }
.mvw .cp-p{ display:inline-flex; align-items:center; gap:5px; font-size:12px; opacity:.75; }
.mvw .cp-p:hover{ opacity:1; text-decoration:underline; }
.mvw .cp-in[data-hl] .cp-row:not(.on){ opacity:.22; }
.mvw .cp-row.on .cp-sk{ font-variation-settings:"wdth" 128, "wght" 760; }
.mvw.is-phone .cp-in{ padding:86px 16px 0; }
.mvw.is-phone .cp-grid{ grid-template-columns:1fr; }
.mvw.is-phone .cp-row{ grid-template-columns:1fr; }
.mvw.is-phone .cp-pr{ justify-content:flex-start; max-width:none; }
.mvw.is-phone .cp-sk{ font-size:16px; }

/* about */
.mvw .sc-ab{ background:${COBALT}; color:${PAPER}; }
.mvw .ab-stripe{ position:absolute; left:0; right:0; top:0; height:22px; background:repeating-linear-gradient(-45deg, ${PAPER} 0 18px, ${COBALT} 18px 36px); opacity:.9; }
.mvw .ab-in{ position:absolute; inset:0; padding:104px max(40px, calc((100% - 1240px)/2)) 0; display:grid; grid-template-columns: minmax(0,1.1fr) minmax(0,1fr); gap:56px; align-content:start; }
.mvw .ab-in::after{ content:''; display:block; height:var(--tb, 110px); grid-column:1/-1; }
.mvw .ab-t{ margin:0 0 6px; font-size:15px; letter-spacing:.08em; text-transform:uppercase; font-variation-settings:"wdth" 125, "wght" 760; }
.mvw .ab-name{ margin:0 0 24px; font-size:20px; font-variation-settings:"wdth" 100, "wght" 560; opacity:.85; }
.mvw .ab-roles{ list-style:none; margin:0 0 22px; padding:0; }
.mvw .ab-roles li{ font-size:clamp(34px, 4.6vw, 76px); line-height:.98; letter-spacing:-.01em; }
.mvw .ab-city{ margin:0; font-size:18px; }
.mvw .ab-av{ margin:0 0 18px; font-size:clamp(22px, 2vw, 30px); line-height:1.1; font-variation-settings:"wdth" 96, "wght" 700; }
.mvw .ab-wants{ margin:0 0 28px; font-size:17px; line-height:1.55; max-width:52ch; }
.mvw .ab-facts{ display:grid; grid-template-columns:auto 1fr; gap:10px 22px; margin:0; padding-top:18px; border-top:1.5px solid rgba(243,238,227,.7); font-size:15px; line-height:1.45; }
.mvw .ab-facts dt{ font-weight:640; opacity:.75; }
.mvw .ab-facts dd{ margin:0; }
.mvw.is-phone .ab-in{ grid-template-columns:1fr; gap:10px; padding:88px 18px 0; }
.mvw.is-phone .ab-roles li{ font-size:34px; }
.mvw.is-phone .ab-wants{ font-size:15.5px; }

/* contact */
.mvw .sc-ct{ background:transparent; }
.mvw .ct-field{ position:absolute; inset:0; background:${ORANGE}; }
.mvw .ct-in{ position:absolute; color:${INK}; }
.mvw .ct-kick{ margin:0 0 6px; font-size:15px; letter-spacing:.08em; text-transform:uppercase; font-variation-settings:"wdth" 125, "wght" 760; }
.mvw .ct-h{ margin:0; line-height:.95; white-space:nowrap; }
.mvw .ct-mail{ display:inline-block; margin:18px 0 22px; line-height:1.05; text-decoration:underline; text-decoration-thickness:.05em; text-underline-offset:.12em; white-space:nowrap; }
.mvw .ct-row{ display:flex; flex-wrap:wrap; gap:10px; margin-bottom:22px; }
.mvw .ct-l{ display:inline-block; padding:12px 18px; border:1.5px solid ${INK}; font-weight:600; font-size:15px; text-decoration:none; transition:background 160ms var(--sig), color 160ms var(--sig); }
.mvw .ct-l:hover{ background:${INK}; color:${ORANGE}; }
.mvw .ct-av{ margin:0 0 16px; font-size:16px; }
.mvw .ct-replay{ font-size:14px; text-decoration:underline; text-underline-offset:3px; }
.mvw .ct-ball{ position:absolute; left:0; top:0; border-radius:50%; background:${INK}; will-change:transform; }

/* case */
.mvw .case{ position:absolute; left:0; right:0; top:0; bottom:var(--tb, 88px); z-index:30; background:var(--cf); }
.mvw .cs-field, .mvw .cs-wipe{ position:absolute; left:0; top:0; z-index:29; pointer-events:none; }
.mvw .cs-wipe{ z-index:33; }
.mvw .cs-scroll{ position:absolute; left:0; right:0; bottom:0; top:132px; outline:none; border-top:1.5px solid var(--ct); }
.mvw .cs-chrome{ position:absolute; left:0; right:0; top:80px; z-index:2; display:flex; justify-content:space-between; align-items:center; padding:0 22px 0 40px; pointer-events:none; }
.mvw .cs-crumb{ margin:0; font-size:12px; letter-spacing:.08em; text-transform:uppercase; font-variation-settings:"wdth" 120, "wght" 700; color:var(--ct); pointer-events:auto; }
.mvw .cs-btns{ display:flex; gap:6px; pointer-events:auto; }
.mvw .cs-b{ width:42px; height:42px; display:grid; place-items:center; background:${INK}; color:${PAPER}; font-size:20px; line-height:1; transition:background 160ms var(--sig); }
.mvw .cs-b:hover{ background:${ORANGE}; color:${INK}; }
.mvw.is-phone .cs-chrome{ top:78px; padding:0 10px 0 14px; }
.mvw.is-phone .cs-scroll{ top:126px; }
.mvw.is-phone .cs-crumb{ font-size:10.5px; }
.mvw .shot{ position:relative; padding:56px max(40px, calc((100% - 1160px)/2)) 90px; }
.mvw .shot.t-field{ background:var(--cf); color:var(--ct); }
.mvw .shot.t-paper{ background:${PAPER}; color:${INK}; }
.mvw .shot.t-ink{ background:${INK}; color:${PAPER}; }
.mvw .shot + .shot{ padding-top:84px; }
.mvw .shot-h{ display:flex; align-items:baseline; gap:18px; margin-bottom:26px; flex-wrap:wrap; }
.mvw .shot-n{ font-size:12px; letter-spacing:.1em; text-transform:uppercase; font-variation-settings:"wdth" 120, "wght" 700; opacity:.7; }
.mvw .shot-t{ margin:0; font-size:clamp(42px, 6.4vw, 104px); line-height:.9; letter-spacing:-.01em; font-variation-settings:"wdth" 150, "wght" 260; transition:font-variation-settings 1100ms var(--sig); }
.mvw .shot.in .shot-t{ font-variation-settings:"wdth" 96, "wght" 800; }
.mvw .shot-c > *, .mvw .cs-blocks > *, .mvw .cs-ol > *, .mvw .cs-xs > *, .mvw .cs-nums > *, .mvw .cs-ul > *, .mvw .beat{ opacity:0; transform:translateY(26px); transition:opacity 700ms var(--sig), transform 900ms var(--sig); transition-delay:calc(var(--i, 0) * 70ms + 120ms); }
.mvw .shot.in .shot-c > *, .mvw .shot.in .cs-blocks > *, .mvw .shot.in .cs-ol > *, .mvw .shot.in .cs-xs > *, .mvw .shot.in .cs-nums > *, .mvw .shot.in .cs-ul > *, .mvw .shot.in .beat{ opacity:1; transform:none; }
.mvw .cs-name{ margin:0 0 18px; line-height:.88; white-space:nowrap; font-variation-settings:"wdth" 150, "wght" 300; transition:font-variation-settings 1200ms var(--sig), opacity 700ms var(--sig), transform 900ms var(--sig); }
.mvw .shot.in .cs-name{ font-variation-settings:"wdth" var(--wd, 100), "wght" 820; }
.mvw .cs-meta{ margin:0 0 26px; font-size:15px; opacity:.85; }
.mvw .cs-lead{ margin:0 0 22px; font-size:clamp(20px, 2vw, 30px); line-height:1.3; max-width:36ch; font-variation-settings:"opsz" 36; font-weight:500; }
.mvw .cs-p{ margin:0 0 24px; font-size:18px; line-height:1.6; max-width:64ch; }
.mvw .cs-links0{ display:flex; gap:18px; flex-wrap:wrap; margin:0; }
.mvw .cs-a{ font-size:15px; text-decoration:underline; text-underline-offset:3px; }
.mvw .cs-ol{ margin:0; padding:0; list-style:none; counter-reset:c; max-width:880px; }
.mvw .cs-ol li{ counter-increment:c; position:relative; padding:16px 0 16px 64px; border-top:1px solid currentColor; font-size:18px; line-height:1.55; }
.mvw .cs-ol li::before{ content:counter(c, decimal-leading-zero); position:absolute; left:0; top:12px; font-family:'Anybody', sans-serif; font-variation-settings:"wdth" 70, "wght" 700; font-size:28px; line-height:1; }
.mvw .cs-blocks{ display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:30px 40px; }
.mvw .cs-block{ border-top:2px solid currentColor; padding-top:14px; }
.mvw .cs-block h4, .mvw .cs-dec h4, .mvw .beat h4{ margin:0 0 8px; font-size:22px; line-height:1.15; font-variation-settings:"wdth" 92, "wght" 740; }
.mvw .cs-block p, .mvw .beat p{ margin:0; font-size:16px; line-height:1.55; }
.mvw .beats{ position:relative; max-width:860px; }
.mvw .beat-path{ position:absolute; left:0; top:0; pointer-events:none; overflow:visible; }
.mvw .beat-ol{ list-style:none; margin:0; padding:0; }
.mvw .beat{ position:relative; padding:0 0 34px 74px; }
.mvw .beat-node{ position:absolute; left:10px; top:6px; width:14px; height:14px; transform:rotate(45deg); background:currentColor; }
.mvw .cs-dec{ max-width:860px; padding:22px 0 26px; border-top:1.5px solid currentColor; }
.mvw .cs-dec p{ margin:0 0 10px; font-size:17px; line-height:1.6; }
.mvw .cs-dec b{ font-weight:700; }
.mvw .cs-xs{ max-width:1000px; }
.mvw .xs-row{ display:grid; grid-template-columns:150px 1fr; gap:24px; padding:18px 0; border-top:1px solid currentColor; }
.mvw .xs-d{ font-size:18px; font-variation-settings:"wdth" 80, "wght" 700; font-variant-numeric:tabular-nums; }
.mvw .xs-w{ margin:0 0 8px; font-weight:600; font-size:17px; line-height:1.5; }
.mvw .xs-r{ margin:0; font-size:16px; line-height:1.6; }
.mvw .cs-nums{ display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:40px 56px; max-width:1100px; }
.mvw .cs-num{ display:flex; flex-direction:column; border-top:2px solid currentColor; padding-top:12px; }
.mvw .ctr{ font-size:clamp(34px, 4.4vw, 68px); line-height:1; font-variation-settings:"wdth" 96, "wght" 780; font-variant-numeric:tabular-nums; white-space:nowrap; }
.mvw .cs-nl{ margin-top:10px; font-size:15px; line-height:1.45; }
.mvw .cs-nd{ margin-top:6px; font-size:13px; opacity:.7; }
.mvw .cs-stack{ margin:0; font-size:clamp(22px, 2.4vw, 36px); line-height:1.3; font-variation-settings:"wdth" 88, "wght" 560; max-width:1100px; }
.mvw .cs-stack i{ font-style:normal; opacity:.4; }
.mvw .cs-ul{ list-style:none; margin:0; padding:0; max-width:900px; }
.mvw .cs-big{ display:block; padding:14px 0; border-top:1px solid currentColor; font-size:clamp(20px, 2vw, 28px); text-decoration:none; font-weight:500; transition:padding-left 260ms var(--sig); }
.mvw .cs-big:hover{ padding-left:14px; }
.mvw .shot.t-next{ padding:90px max(40px, calc((100% - 1160px)/2)) 110px; }
.mvw .cs-nextb{ display:flex; flex-direction:column; align-items:flex-start; text-align:left; }
.mvw .cs-nk{ font-size:13px; letter-spacing:.1em; text-transform:uppercase; font-variation-settings:"wdth" 120, "wght" 700; }
.mvw .cs-nn{ font-size:clamp(44px, 7vw, 120px); line-height:.95; font-variation-settings:"wdth" 110, "wght" 820; transition:font-variation-settings 500ms var(--sig); }
.mvw .cs-nextb:hover .cs-nn{ font-variation-settings:"wdth" 140, "wght" 820; }
.mvw.is-phone .shot{ padding:30px 18px 60px; }
.mvw.is-phone .shot + .shot{ padding-top:60px; }
.mvw.is-phone .shot.t-next{ padding:60px 18px 80px; }
.mvw.is-phone .cs-p, .mvw.is-phone .cs-ol li, .mvw.is-phone .cs-dec p{ font-size:16px; }
.mvw.is-phone .cs-ol li{ padding-left:46px; }
.mvw.is-phone .cs-ol li::before{ font-size:22px; }
.mvw.is-phone .xs-row{ grid-template-columns:1fr; gap:6px; }
.mvw.is-phone .beat{ padding-left:52px; }
.mvw.is-phone .cs-blocks, .mvw.is-phone .cs-nums{ grid-template-columns:1fr; }

/* the timeline bar */
.mvw .bar{ position:absolute; left:0; right:0; bottom:0; z-index:40; height:88px; background:${INK}; color:${PAPER}; display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:stretch;
  padding-bottom:env(safe-area-inset-bottom); border-top:1px solid rgba(243,238,227,.14); }
.mvw .tp{ display:flex; align-items:center; gap:4px; padding:0 14px 0 14px; }
.mvw .tb{ width:38px; height:38px; display:grid; place-items:center; color:${PAPER}; transition:background 140ms var(--sig), color 140ms var(--sig); }
.mvw .tb:hover{ background:rgba(243,238,227,.12); }
.mvw .tb-play{ background:${ORANGE}; color:${INK}; width:44px; height:44px; }
.mvw .tb-play:hover{ background:${PAPER}; }
.mvw .tc{ display:flex; flex-direction:column; justify-content:center; margin-left:12px; min-width:150px; }
.mvw .tc-t{ font-size:22px; line-height:1; font-variation-settings:"wdth" 80, "wght" 600; font-variant-numeric:tabular-nums; letter-spacing:.02em; }
.mvw .tc-s{ font-size:12px; opacity:.7; margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:170px; }
.mvw .trk{ position:relative; min-width:0; }
.mvw .tl{ position:absolute; inset:0; width:100%; height:100%; display:block; cursor:pointer; touch-action:none; outline:none; }
.mvw .tl:focus-visible{ box-shadow:inset 0 0 0 2px ${ORANGE}; }
.mvw .tools{ display:flex; align-items:center; gap:2px; padding:0 12px; }
.mvw .tl-btn{ display:flex; flex-direction:column; align-items:center; gap:3px; padding:8px 9px; color:${PAPER}; opacity:.85; transition:opacity 140ms var(--sig), background 140ms var(--sig); }
.mvw .tl-btn:hover, .mvw .tl-btn.on, .mvw .tl-btn[aria-expanded="true"]{ opacity:1; background:rgba(243,238,227,.1); }
.mvw .tl-btn.on{ color:${ORANGE}; }
.mvw .tl-lab{ font-size:10.5px; letter-spacing:.06em; text-transform:uppercase; }
.mvw.is-phone .bar{ height:auto; grid-template-columns:auto 1fr auto; grid-template-rows:48px 40px; }
.mvw.is-phone .tp{ grid-column:1 / 3; grid-row:1; padding:0 6px; }
.mvw.is-phone .tools{ grid-column:3; grid-row:1; padding:0 4px; }
.mvw.is-phone .trk{ grid-column:1 / -1; grid-row:2; }
.mvw.is-phone .tb{ width:36px; height:36px; }
.mvw.is-phone .tb-play{ width:40px; height:40px; }
.mvw.is-phone .tc{ min-width:0; margin-left:8px; }
.mvw.is-phone .tc-t{ font-size:17px; }
.mvw.is-phone .tc-s{ font-size:11px; max-width:120px; }
.mvw.is-phone .tl-btn{ padding:5px 6px; }
.mvw.is-phone .tl-lab{ font-size:9px; }
.mvw.is-reduced .bar{ grid-template-columns:auto 1fr auto; }
.mvw .chap{ list-style:none; margin:0; padding:0 8px; display:flex; align-items:center; gap:2px; overflow-x:auto; }
.mvw .chap-b{ padding:8px 10px; font-size:13px; white-space:nowrap; }
.mvw .chap-b:hover{ background:rgba(243,238,227,.12); }
.mvw.is-phone.is-reduced .chap{ grid-column:1 / -1; grid-row:2; }

/* popovers */
.mvw .pop{ position:absolute; z-index:50; background:${PAPER}; color:${INK}; padding:18px 18px 16px; width:300px; box-shadow:0 0 0 1.5px ${INK}, 10px 10px 0 ${INK}; max-height:calc(100% - 200px); overflow-y:auto; }
.mvw .pop-h{ margin:0 0 6px; font-size:14px; letter-spacing:.08em; text-transform:uppercase; font-variation-settings:"wdth" 125, "wght" 780; }
.mvw .pop-n{ margin:0 0 12px; font-size:13px; line-height:1.45; opacity:.8; }
.mvw .ez-c{ display:block; margin:0 auto; touch-action:none; cursor:grab; }
.mvw .ez-read{ margin:8px 0 10px; text-align:center; font-size:13px; font-variation-settings:"wdth" 80, "wght" 600; font-variant-numeric:tabular-nums; }
.mvw .ez-pre{ display:flex; flex-wrap:wrap; gap:6px; }
.mvw .ez-p{ padding:6px 9px; font-size:12.5px; box-shadow:inset 0 0 0 1px rgba(20,18,16,.45); }
.mvw .ez-p.on, .mvw .ez-p:hover{ background:${INK}; color:${PAPER}; }
.mvw .ez-prev{ position:relative; height:16px; margin-top:12px; border-bottom:1px solid rgba(20,18,16,.3); }
.mvw .ez-prev i{ position:absolute; left:0; top:2px; width:calc(100% - 12px); height:12px; }
.mvw .ez-prev i::before{ content:''; position:absolute; left:0; top:0; width:12px; height:12px; border-radius:50%; background:${ORANGE}; }
.mvw .ix-l{ list-style:none; margin:0; padding:0; }
.mvw .ix-b{ display:flex; gap:12px; align-items:baseline; width:100%; text-align:left; padding:7px 4px; font-size:16px; font-weight:560; border-top:1px solid rgba(20,18,16,.15); }
.mvw .ix-b:hover, .mvw .ix-c:hover{ background:${INK}; color:${PAPER}; }
.mvw .ix-n{ font-size:11px; letter-spacing:.06em; font-variation-settings:"wdth" 110, "wght" 700; opacity:.6; width:40px; }
.mvw .ix-w{ list-style:none; margin:0 0 6px; padding:0 0 0 52px; }
.mvw .ix-c{ display:flex; gap:8px; align-items:center; width:100%; text-align:left; padding:4px; font-size:14px; }
.mvw .ix-contact{ margin:10px 0 0; padding-top:10px; border-top:1.5px solid ${INK}; font-size:14px; }

@media (prefers-reduced-motion: reduce){ .mvw *{ transition:none !important; } }
.mvw.is-reduced *{ transition:none !important; }
`;
