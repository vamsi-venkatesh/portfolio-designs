// World: loom — "The Loom." For the AI engineer.
// Orchestration you can see: agents are shuttles carrying coloured weft across an immense loom of light. Where threads
// cross they weave the cloth of a product. A reviewer thread runs across the pass and pulls out any thread that claims
// more than it can prove. Every product is a tapestry on the loom; every section of the site is a place along it.
// Facts: ONLY ctx (content.mjs). Agent names on the shuttles are the names in the approved copy.
import * as THREE from '../../vendor/three.module.js';

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Hanken+Grotesk:wght@400;500;600&display=swap';
const PLACES = ['home', 'work', 'principles', 'withdrawn', 'capabilities', 'about', 'contact'];
const PX = { home: 0, work: 26, principles: 50, withdrawn: 72, capabilities: 94, about: 116, contact: 136 };
const LABEL = { home: 'Arrival', work: 'Tapestries', principles: 'How I work', withdrawn: 'Withdrawn', capabilities: 'Pattern book', about: 'About', contact: 'Contact' };
const ORDER = ['conxto', 'vvdex-engine', 'vvdex-platform', 'pitchradar', 'farmquick', 'unboundpdf', 'conxfolio', 'vvdex-trading'];
// weave structure + motif per product are decorative; agents/reviewers are only named where the approved copy names them
const LOOM = {
  'conxto':         { pat: 1, motif: 1, agents: ['strategist', 'identity', 'market', 'application', 'operations'], rev: 2, revLabel: 'two reviewer roles', pull: 'Anything that claims more is reverted.' },
  'vvdex-engine':   { pat: 2, motif: 4, agents: [null, null, null], rev: 1, revLabel: 'independent reviewer', pull: 'An independent reviewer on every result.' },
  'vvdex-platform': { pat: 5, motif: 2, agents: [null] },
  'pitchradar':     { pat: 6, motif: 6, agents: ['discovery', 'extraction', 'qualification', 'contacts', 'deadlines', 'weather', 'reporting'] },
  'farmquick':      { pat: 4, motif: 3, agents: ['Lead Desk'] },
  'unboundpdf':     { pat: 0, motif: 0, agents: [null] },
  'conxfolio':      { pat: 3, motif: 5, agents: [null] },
  'vvdex-trading':  { pat: 7, motif: 7, agents: [null] },
};
const CW = 0.04, CH = 0.034, FOV = 34, TH = Math.tan(FOV * Math.PI / 360);
const Y_TOP = 5.3, Y_BOT = -4.5;
const INK = [0.075, 0.085, 0.17];

const hex2 = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
const lumOf = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c) => `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eo = (t) => 1 - Math.pow(1 - t, 3);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (s) => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : (s || ''); };

export default {
  id: 'loom',
  color: '#11152a',
  async mount(root, ctx) {
    const { person, work, principles, withdrawn } = ctx;
    const cases = ctx.cases || {};
    const caps = ctx.capabilities || [];
    const about = ctx.about || { facts: [] };
    const reduced = !!ctx.reduced;
    const touch = !!ctx.isTouch;
    let alive = true;
    const cleanup = [];
    const timers = new Set();
    const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); cleanup.push(() => t.removeEventListener(ev, fn, opt)); };
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); return id; };
    const el = (tag, cls, text, parent) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; if (parent) parent.appendChild(n); return n; };
    const ext = (href, text, parent, cls) => { const a = el('a', cls || null, text, parent); a.href = href; if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; } return a; };

    // ---------------- fonts + style ----------------
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = FONT_HREF; document.head.appendChild(link);
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    const rootClass = root.className;
    root.classList.add('lmw');

    // ---------------- products ----------------
    const bySlug = Object.fromEntries(work.map((w) => [w.slug, w]));
    const items = [...ORDER.filter((s) => bySlug[s]), ...work.map((w) => w.slug).filter((s) => !ORDER.includes(s))].map((s) => bySlug[s]);
    const nameToSlug = Object.fromEntries(work.map((w) => [w.name, w.slug]));
    const dyeOf = (w) => { const c = hex2(w.color); return lumOf(c) > 0.62 ? '#86663a' : css(mixc(c, [0.1, 0.08, 0.1], 0.38)); };

    let W = root.clientWidth || innerWidth, H = root.clientHeight || innerHeight;
    let phone = W < 760;

    // ---------------- three ----------------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    const DPR = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement; canvas.className = 'lm-cv'; canvas.setAttribute('aria-hidden', 'true');
    root.appendChild(canvas);
    el('div', 'lm-vig', null, root);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 300);
    const disposables = [];
    const own = (x) => { disposables.push(x); return x; };

    const UT = { value: 0 };
    const UDPR = { value: DPR };

    // ---- warp threads: the immense loom (one front layer, one deep layer) ----
    const IMP = Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, -99, 0));
    let impK = 0;
    function warpLayer(x0, x1, sp, z, seg, col, amp, alpha) {
      const n = Math.floor((x1 - x0) / sp);
      const pos = new Float32Array(n * seg * 2 * 3), seed = new Float32Array(n * seg * 2);
      let v = 0;
      for (let i = 0; i < n; i++) {
        const x = x0 + i * sp + (Math.sin(i * 12.9898) * 0.5) * sp * 0.25, sd = Math.abs((Math.sin(i * 78.233) * 43758.5453) % 1);
        for (let k = 0; k < seg; k++) {
          pos[v * 3] = x; pos[v * 3 + 1] = k / seg; pos[v * 3 + 2] = z; seed[v++] = sd;
          pos[v * 3] = x; pos[v * 3 + 1] = (k + 1) / seg; pos[v * 3 + 2] = z; seed[v++] = sd;
        }
      }
      const g = own(new THREE.BufferGeometry());
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
      const m = own(new THREE.ShaderMaterial({
        uniforms: { uTime: UT, uImp: { value: IMP }, uCol: { value: new THREE.Vector3(...col) }, uAmp: { value: amp }, uAlpha: { value: alpha }, uYT: { value: Y_TOP }, uYB: { value: Y_BOT } },
        vertexShader: WARP_VS, fragmentShader: WARP_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      const L = new THREE.LineSegments(g, m); L.frustumCulled = false; scene.add(L);
      return m;
    }
    warpLayer(-18, 156, 0.085, -0.05, 26, [1.0, 0.83, 0.6], 1, 1);
    warpLayer(-30, 170, 0.31, -7, 10, [0.55, 0.62, 0.95], 0.4, 0.7);

    // ---- cloth (procedural woven fabric) ----
    const planeGeo = own(new THREE.PlaneGeometry(1, 1, 36, 52));
    const blankTex = own(new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat)); blankTex.needsUpdate = true;
    const cloths = [];
    function makeCloth(o) {
      const u = {
        uTime: UT, uSize: { value: new THREE.Vector2(o.w, o.h) }, uCells: { value: new THREE.Vector2(o.w / (o.cw || CW), o.h / (o.ch || CH)) },
        uA: { value: new THREE.Vector3(...o.A) }, uB: { value: new THREE.Vector3(...o.B) }, uC: { value: new THREE.Vector3(...(o.C || o.B)) },
        uWarp: { value: new THREE.Vector3(...o.warp) }, uMode: { value: o.mode || 0 }, uPat: { value: o.pat || 0 }, uMotif: { value: o.motif || 0 },
        uFell: { value: reduced ? (o.fellRest ?? 0.94) : 0 }, uDim: { value: 1 }, uGlow: { value: 0 }, uPtr: { value: new THREE.Vector3(0, 0, 0) },
        uTex: { value: o.tex || blankTex }, uTexN: { value: new THREE.Vector2(o.texN ? o.texN[0] : 1, o.texN ? o.texN[1] : 1) },
        uHoles: { value: new THREE.Vector4(...(o.holes || [-1, -1, -1, -1])) }, uHi: { value: new THREE.Vector3(-9, -9, 0) }, uBand: { value: -1 },
        uFellGlow: { value: 1 }, uWave: { value: reduced ? 0 : 1 },
      };
      const mat = own(new THREE.ShaderMaterial({ uniforms: u, vertexShader: CLOTH_VS, fragmentShader: CLOTH_FS }));
      const mesh = new THREE.Mesh(planeGeo, mat); mesh.frustumCulled = false; scene.add(mesh);
      const c = {
        ...o, cw: o.cw || CW, ch: o.ch || CH, u, mesh, x: o.x, xT: o.x, baseX: o.x, y: o.y, z: 0, zT: 0, w: o.w, wT: o.w, h: o.h, hT: o.h,
        fell: reduced ? (o.fellRest ?? 0.94) : 0, tw: null, weaving: false, dim: 1, dimT: 1, glow: 0, glowT: 0, ptr: 0, ptrU: 0, ptrV: 0,
        sh: [], revs: [], woven: reduced, vis: false,
      };
      (o.agents || [null]).forEach((name, k, arr) => {
        const n = arr.length, pad = 0.03, span = (1 - 2 * pad) / n;
        c.sh.push({ u0: pad + k * span + 0.004, u1: pad + (k + 1) * span - 0.004, ph: Math.random() * 2, spd: 0.3, name, col: o.shCols ? o.shCols[k % o.shCols.length] : o.shCol, k });
      });
      for (let r = 0; r < (o.rev || 0); r++) c.revs.push({ ph: r * 0.7 + Math.random() });
      if (o.pull) c.pull = { t: -1, next: o.pullFirst ?? 4, every: o.pullEvery ?? 9, text: o.pull, cap: null };
      cloths.push(c);
      return c;
    }
    function weave(c, a, b, dur, delay = 0) {
      if (reduced) { c.fell = b; c.tw = null; c.woven = true; return; }
      c.tw = { a, b, dur, t0: time + delay }; c.woven = true;
    }
    function setTex(c, tex) { const old = c.u.uTex.value; c.u.uTex.value = tex; if (old && old !== blankTex) old.dispose(); }

    // text woven as jacquard: a canvas the shader samples once per warp×weft crossing
    function textTex(lines, cellsX, cellsY, opt) {
      const cw = Math.max(64, Math.round(cellsX * 4)), ch = Math.max(64, Math.round(cellsY * 4));
      const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      const g = cv.getContext('2d');
      g.fillStyle = '#000'; g.fillRect(0, 0, cw, ch); g.fillStyle = '#fff';
      const fam = '"Cormorant Garamond", Georgia, serif';
      const sizes = opt.sizes || lines.map(() => 1);
      let base = 100;
      if (opt.track) g.letterSpacing = opt.track;
      const widest = Math.max(...lines.map((l, i) => { g.font = `${opt.weight || 700} ${base * sizes[i]}px ${fam}`; return g.measureText(l).width; }));
      base = base * (cw * opt.fitW) / widest;
      const gap = opt.gap ?? 0.1;
      const totalH = sizes.reduce((s, k) => s + k * base * 0.86, 0) + (lines.length - 1) * base * gap;
      const maxH = ch * opt.fitH;
      if (totalH > maxH) base *= maxH / totalH;
      const lh = sizes.map((k) => k * base * 0.86);
      const tot = lh.reduce((a, b) => a + b, 0) + (lines.length - 1) * base * gap;
      let y = (1 - opt.cy) * ch - tot / 2;
      g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      lines.forEach((l, i) => { g.font = `${opt.weight || 700} ${base * sizes[i]}px ${fam}`; y += lh[i]; g.fillText(l, cw / 2, y - lh[i] * 0.06); y += base * gap; });
      (opt.bands || []).forEach(([v, picks]) => { const yy = (1 - v) * ch; g.fillRect(cw * 0.06, yy, cw * 0.88, picks * 4); });
      const t = new THREE.CanvasTexture(cv); t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
      return t;
    }

    // ---- the places ----
    const GOLD = [0.97, 0.76, 0.43];
    const home = makeCloth({
      key: 'home', x: PX.home, y: 0.95, w: 10.6, h: 4.4, cw: 0.0165, ch: 0.0142, mode: 1, A: [0.98, 0.79, 0.47], B: [0.05, 0.075, 0.17], warp: [0.13, 0.14, 0.21],
      fellRest: 0.9, agents: [null, null, null, null, null, null], shCols: items.slice(0, 6).map((w) => mixc(hex2(w.color), [1, 0.9, 0.7], 0.25)),
      rev: 1, pull: 'Anything that claims more is reverted.', pullFirst: 3.6, pullEvery: 10,
    });
    const banners = items.map((w, i) => {
      const L = LOOM[w.slug] || { pat: i % 8, motif: i % 8, agents: [null] };
      const c0 = hex2(w.color); const light = lumOf(c0) > 0.62;
      const A = light ? mixc(c0, [1, 0.95, 0.86], 0.15) : mixc(c0, [1, 1, 1], 0.06);
      const B = mixc(c0, INK, light ? 0.72 : 0.6);
      return makeCloth({
        key: w.slug, slug: w.slug, i, x: 0, y: 0, w: 1.4, h: 4.8, mode: 0, pat: L.pat, motif: L.motif, A, B, warp: mixc(c0, [0.16, 0.14, 0.2], 0.72),
        agents: L.agents, shCols: L.agents.map((_, k) => mixc(c0, k % 2 ? [1, 0.84, 0.55] : [1, 1, 1], 0.18 + 0.1 * (k % 3))), rev: L.rev || 0,
        pull: L.pull, pullFirst: 2.2, pullEvery: 8, fellRest: 0.93 - (i % 3) * 0.015, banner: true, color: w.color,
      });
    });
    const prOrder = principles.length === 3 ? [2, 0, 1] : principles.map((_, i) => i);
    const stPrin = makeCloth({ key: 'principles', x: PX.principles, y: 0.25, w: 5.0, h: 6.0, mode: 3, A: [0.88, 0.68, 0.4], B: [0.66, 0.34, 0.27], C: [0.34, 0.41, 0.66], warp: [0.16, 0.14, 0.19], fellRest: 0.975, agents: [null, null, null], shCols: [[1, 0.85, 0.55], [1, 0.62, 0.5], [0.7, 0.78, 1]] });
    const stWith = makeCloth({ key: 'withdrawn', x: PX.withdrawn, y: 0.25, w: 5.0, h: 6.0, mode: 0, pat: 1, motif: 0, A: [0.74, 0.69, 0.6], B: [0.2, 0.2, 0.27], warp: [0.27, 0.24, 0.26], fellRest: 0.965, holes: [0.62, 0.7, 0.3, 0.37], agents: [null], shCol: [1, 0.9, 0.75] });
    // capability matrix: skills (rows) × products (columns), the draft the cloth is woven from
    const skills = []; caps.forEach(([g, list]) => list.forEach(([s, prods]) => skills.push({ g, s, prods })));
    const MX = items.length, MY = Math.max(1, skills.length);
    const mData = new Uint8Array(MX * MY * 4);
    skills.forEach((sk, r) => items.forEach((w, cI) => {
      if (!sk.prods.includes(w.name)) return;
      const c0 = hex2(w.color), row = MY - 1 - r, o = (row * MX + cI) * 4;
      const cc = lumOf(c0) > 0.62 ? mixc(c0, [1, 0.86, 0.6], 0.2) : c0;
      mData[o] = cc[0] * 255; mData[o + 1] = cc[1] * 255; mData[o + 2] = cc[2] * 255; mData[o + 3] = 255;
    }));
    const mTex = new THREE.DataTexture(mData, MX, MY, THREE.RGBAFormat); mTex.minFilter = mTex.magFilter = THREE.NearestFilter; mTex.needsUpdate = true;
    const stCaps = makeCloth({ key: 'capabilities', x: PX.capabilities, y: 0.25, w: 5.0, h: 6.0, mode: 2, A: GOLD, B: [0.09, 0.1, 0.21], warp: [0.19, 0.18, 0.25], tex: mTex, texN: [MX, MY], fellRest: 0.985, agents: [null, null], shCols: [[1, 0.85, 0.6], [0.75, 0.85, 1]] });
    const stAbout = makeCloth({ key: 'about', x: PX.about, y: 0.6, w: 5.6, h: 3.4, cw: 0.0165, ch: 0.0142, mode: 1, A: [0.1, 0.11, 0.24], B: [0.88, 0.82, 0.7], warp: [0.76, 0.7, 0.58], fellRest: 0.985, agents: [null], shCol: [1, 0.9, 0.7] });
    const stContact = makeCloth({ key: 'contact', x: PX.contact - 1.0, y: 0.5, w: 3.6, h: 4.4, mode: 0, pat: 3, motif: 1, A: [0.86, 0.65, 0.37], B: [0.2, 0.13, 0.11], warp: [0.24, 0.18, 0.16], fellRest: 0.86, agents: [null], shCol: [1, 0.86, 0.55] });
    const stations = { principles: stPrin, withdrawn: stWith, capabilities: stCaps, about: stAbout, contact: stContact };

    // ---- dynamic geometry: shuttles (points) + threads in flight (ribbons) ----
    const PT_MAX = 160;
    const ptPos = new Float32Array(PT_MAX * 3), ptCol = new Float32Array(PT_MAX * 3), ptSize = new Float32Array(PT_MAX), ptA = new Float32Array(PT_MAX);
    const ptGeo = own(new THREE.BufferGeometry());
    ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3).setUsage(THREE.DynamicDrawUsage));
    ptGeo.setAttribute('color', new THREE.BufferAttribute(ptCol, 3).setUsage(THREE.DynamicDrawUsage));
    ptGeo.setAttribute('aSize', new THREE.BufferAttribute(ptSize, 1).setUsage(THREE.DynamicDrawUsage));
    ptGeo.setAttribute('aA', new THREE.BufferAttribute(ptA, 1).setUsage(THREE.DynamicDrawUsage));
    const ptMat = own(new THREE.ShaderMaterial({ uniforms: { uDpr: UDPR }, vertexShader: PT_VS, fragmentShader: PT_FS, vertexColors: true, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
    const points = new THREE.Points(ptGeo, ptMat); points.frustumCulled = false; points.renderOrder = 5; scene.add(points);
    let ptN = 0;
    const pt = (x, y, z, col, size, a) => { if (ptN >= PT_MAX) return; const i = ptN++; ptPos[i * 3] = x; ptPos[i * 3 + 1] = y; ptPos[i * 3 + 2] = z; ptCol[i * 3] = col[0]; ptCol[i * 3 + 1] = col[1]; ptCol[i * 3 + 2] = col[2]; ptSize[i] = size; ptA[i] = a; };

    const RB_MAX = 14000;
    const rbPos = new Float32Array(RB_MAX * 3), rbCol = new Float32Array(RB_MAX * 4), rbSide = new Float32Array(RB_MAX), rbIdx = new Uint16Array(RB_MAX * 3);
    const rbGeo = own(new THREE.BufferGeometry());
    rbGeo.setAttribute('position', new THREE.BufferAttribute(rbPos, 3).setUsage(THREE.DynamicDrawUsage));
    rbGeo.setAttribute('aCol', new THREE.BufferAttribute(rbCol, 4).setUsage(THREE.DynamicDrawUsage));
    rbGeo.setAttribute('aSide', new THREE.BufferAttribute(rbSide, 1).setUsage(THREE.DynamicDrawUsage));
    rbGeo.setIndex(new THREE.BufferAttribute(rbIdx, 1).setUsage(THREE.DynamicDrawUsage));
    const rbMat = own(new THREE.ShaderMaterial({ vertexShader: RB_VS, fragmentShader: RB_FS, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    const ribbons = new THREE.Mesh(rbGeo, rbMat); ribbons.frustumCulled = false; ribbons.renderOrder = 4; scene.add(ribbons);
    let rbV = 0, rbI = 0;
    const P = new Float32Array(3 * 256);
    // ribbon over the first n points in P; alpha a0→a1 along it; taper softens both ends
    function ribbon(n, w, col, a0, a1, taper = 0) {
      if (n < 2 || rbV + n * 2 > RB_MAX) return;
      for (let i = 0; i < n; i++) {
        const ia = Math.max(0, i - 1) * 3, ib = Math.min(n - 1, i + 1) * 3;
        let tx = P[ib] - P[ia], ty = P[ib + 1] - P[ia + 1]; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
        const t = i / (n - 1); let a = a0 + (a1 - a0) * t; if (taper) a *= Math.min(1, t * taper, (1 - t) * taper);
        for (let s = -1; s <= 1; s += 2) {
          const v = rbV++;
          rbPos[v * 3] = P[i * 3] - ty * w * 0.5 * s; rbPos[v * 3 + 1] = P[i * 3 + 1] + tx * w * 0.5 * s; rbPos[v * 3 + 2] = P[i * 3 + 2];
          rbCol[v * 4] = col[0]; rbCol[v * 4 + 1] = col[1]; rbCol[v * 4 + 2] = col[2]; rbCol[v * 4 + 3] = a; rbSide[v] = s;
        }
        if (i > 0) { const v0 = rbV - 4; rbIdx[rbI++] = v0; rbIdx[rbI++] = v0 + 1; rbIdx[rbI++] = v0 + 2; rbIdx[rbI++] = v0 + 1; rbIdx[rbI++] = v0 + 3; rbIdx[rbI++] = v0 + 2; }
      }
    }
    const setP = (i, x, y, z) => { P[i * 3] = x; P[i * 3 + 1] = y; P[i * 3 + 2] = z; };

    // ---- contact: the loose thread (verlet rope you can pull) ----
    const RN = 22, RSEG = 0.12;
    const rope = { p: [], o: [], grab: false, gx: 0, gy: 0, hinted: false };
    function ropeAnchor() { return [stContact.x + stContact.w / 2 + 0.03, stContact.y - stContact.h / 2 + stContact.fell * stContact.h - 0.05, 0.06]; }
    function ropeReset() {
      const a = ropeAnchor(); rope.p = []; rope.o = [];
      for (let i = 0; i < RN; i++) { const x = a[0] + Math.min(i, 6) * RSEG * 0.8, y = a[1] - Math.max(0, i - 6) * RSEG * 0.95; rope.p.push([x, y, 0.06]); rope.o.push([x, y, 0.06]); }
    }
    ropeReset();

    // ---------------- DOM: overlays ----------------
    el('h1', 'lm-sr', `${person.name}, ${person.role}`, root);
    // arrival
    const ovHome = el('section', 'lm-ov lm-home', null, root); ovHome.setAttribute('aria-label', 'Arrival');
    el('p', 'lm-sig', `${person.role} · ${person.city}`, ovHome);
    const lead = principles[2] || principles[0];
    el('h2', 'lm-lead', lead ? lead.k : person.lede, ovHome);
    el('p', 'lm-lede', person.lede, ovHome);
    const goRow = el('div', 'lm-gorow', null, ovHome);
    const goWork = el('button', 'lm-tl', 'Walk to the tapestries', goRow); goWork.type = 'button';
    const goContact = el('button', 'lm-tl lm-tl2', 'Pick up the thread', goRow); goContact.type = 'button';
    const hint = el('p', 'lm-hint', touch ? 'Swipe to walk the loom · tap a cloth to open it' : 'Sweep the cursor across the loose threads · drag, or use ← →, to walk the loom', ovHome);
    // gallery
    const ovWork = el('section', 'lm-ov lm-work', null, root); ovWork.setAttribute('aria-label', 'Work: eight tapestries');
    const gh = el('div', 'lm-ghead', null, ovWork);
    el('h2', null, 'Eight tapestries', gh);
    el('p', null, 'One for each product. Open one and its whole case unrolls.', gh);
    const gone = el('p', 'lm-gone', '', ovWork);
    const glabs = banners.map((c) => {
      const w = bySlug[c.slug];
      const b = el('button', 'lm-glab', null, ovWork); b.type = 'button';
      el('b', null, w.name, b); el('i', null, phone ? w.status : `${w.kind} · ${w.status}`, b);
      b.setAttribute('aria-label', `${w.name}, ${w.kind}, ${w.status}. Open the case.`);
      on(b, 'click', () => go({ place: 'work', slug: c.slug }));
      on(b, 'mouseenter', () => setHover(c)); on(b, 'mouseleave', () => setHover(null));
      on(b, 'focus', () => setHover(c)); on(b, 'blur', () => setHover(null));
      return b;
    });
    // case-only: agent labels under the open tapestry
    const ovCase = el('div', 'lm-ov lm-case', null, root); ovCase.setAttribute('aria-hidden', 'true');
    let agLabs = [];
    // station extras: hole labels (withdrawn), rope hint (contact)
    const ovSt = el('div', 'lm-ov lm-stx', null, root); ovSt.setAttribute('aria-hidden', 'true');
    const holeLabs = withdrawn.slice(0, 2).map((w) => el('span', 'lm-hl', `${w.title} — cut out`, ovSt));
    const ropeHint = el('span', 'lm-rh', touch ? 'pull the loose thread' : 'grab the loose thread', ovSt);
    // reading surface
    const ovRead = el('section', 'lm-ov lm-read', null, root);
    const sheet = el('div', 'lm-sheet', null, ovRead);
    el('span', 'lm-selv l', null, sheet); el('span', 'lm-selv r', null, sheet);
    el('span', 'lm-fellbar', null, ovRead);
    const scroller = el('div', 'lm-scroll', null, sheet); scroller.tabIndex = 0;
    // captions for the reviewer pull
    cloths.forEach((c) => { if (c.pull) c.pull.cap = el('p', 'lm-cap', c.pull.text, root); });
    // selvedge index (always available)
    const nav = el('nav', 'lm-nav', null, root); nav.setAttribute('aria-label', 'Places on the loom');
    const prevB = el('button', 'lm-arr', '‹', nav); prevB.type = 'button'; prevB.setAttribute('aria-label', 'Walk back along the loom');
    const track = el('div', 'lm-track', null, nav);
    const shut = el('span', 'lm-shut', null, track);
    const knots = PLACES.map((p) => { const b = el('button', 'lm-knot', null, track); b.type = 'button'; el('span', null, LABEL[p], b); b.setAttribute('aria-label', LABEL[p]); on(b, 'click', () => go({ place: p })); return b; });
    const nextB = el('button', 'lm-arr', '›', nav); nextB.type = 'button'; nextB.setAttribute('aria-label', 'Walk on along the loom');
    const navCur = el('span', 'lm-navcur', '', nav);
    on(prevB, 'click', () => step(-1)); on(nextB, 'click', () => step(1));
    on(goWork, 'click', () => go({ place: 'work' })); on(goContact, 'click', () => go({ place: 'contact' }));

    // ---------------- layout (world positions + framing) ----------------
    function labText() { glabs.forEach((b, i) => { b.lastChild.textContent = phone ? items[i].status : `${items[i].kind} · ${items[i].status}`; }); }
    function layout() {
      phone = W < 760;
      root.classList.toggle('is-phone', phone);
      if (phone) {
        banners.forEach((c, i) => { const col = i % 4, row = Math.floor(i / 4); c.baseX = PX.work + (col - 1.5) * 1.15; c.y = row ? -1.7 : 1.5; c.base = { w: 0.95, h: 2.2 }; });
        Object.assign(home, { w: 4.6, h: 4.3, wT: 4.6, x: 0, y: 0.95 });
      } else {
        banners.forEach((c, i) => { c.baseX = PX.work + (i - 3.5) * 1.92; c.y = 0.1; c.base = { w: 1.4, h: 4.8 }; });
        Object.assign(home, { w: 10.6, h: 4.4, wT: 10.6, x: 0, y: 0.95 });
      }
      banners.forEach((c) => { c.h = c.hT = c.base.h; if (!route || route.slug !== c.slug) c.w = c.wT = c.base.w; c.x = c.xT = c.baseX + pushOf(c); });
      labText();
    }
    function pushOf(c) {
      if (!route || !route.slug) return 0;
      const sel = banners.find((b) => b.slug === route.slug); if (!sel || sel === c) return 0;
      if (phone) { const sameRow = Math.abs(sel.y - c.y) < 0.1; return sameRow ? Math.sign(c.baseX - sel.baseX) * 0.75 : 0; }
      return Math.sign(c.i - sel.i) * (c.i > sel.i ? 2.3 : 1.25);
    }
    let homeTexPhone = null;
    function buildHomeTex() {
      if (homeTexPhone === phone) return; homeTexPhone = phone;
      const lines = phone ? [person.first, person.last] : [person.name];
      setTex(home, textTex(lines, home.w / home.cw, home.h / home.ch, { fitW: phone ? 0.8 : 0.86, fitH: phone ? 0.62 : 0.5, cy: phone ? 0.47 : 0.45, gap: 0.12, bands: [[0.12, 1.4], [0.105, 0.5], [0.81, 1.4], [0.825, 0.5]] }));
    }
    let aboutBuilt = false;
    function buildAboutTex() {
      if (aboutBuilt) return; aboutBuilt = true;
      setTex(stAbout, textTex([person.name, person.city], stAbout.w / stAbout.cw, stAbout.h / stAbout.ch, { sizes: [1, 0.46], fitW: 0.8, fitH: 0.56, cy: 0.52, gap: 0.3, weight: 700, bands: [[0.16, 1.2], [0.86, 1.2]] }));
    }

    // screen rect (px) + world rect → camera
    function framing(r) {
      const top = phone ? 80 : 92;
      if (r.place === 'home') {
        return phone ? { c: [home.x, home.y, home.w + 0.3, home.h + 0.3], s: [10, top, W - 20, H * 0.5 - top] }
          : { c: [home.x, home.y, home.w + 0.9, home.h + 0.5], s: [W * 0.05, top + 18, W * 0.9, H * 0.6 - top - 18] };
      }
      if (r.place === 'work' && r.slug) {
        const b = banners.find((c) => c.slug === r.slug);
        const ow = b.base.w * (phone ? 2.0 : 1.85);
        return phone ? { c: [b.baseX, b.y, ow + 0.3, b.base.h + 0.25], s: [0, top, W, H * 0.31 - top] }
          : { c: [b.baseX, b.y - 0.15, ow + 0.6, b.base.h + 0.9], s: [32, top, W * 0.41 - 32, H - top - 118] };
      }
      if (r.place === 'work') {
        return phone ? { c: [PX.work, -0.2, 4.75, 7.0], s: [10, 150, W - 20, H - 150 - 150] }
          : { c: [PX.work, 0.1, 16.2, 5.3], s: [40, 156, W - 80, H - 156 - 170] };
      }
      const st = stations[r.place];
      let cx = st.x, w = st.w + 0.7, h = st.h + 0.6, cy = st.y;
      if (r.place === 'contact') { cx = st.x + 1.15; w = st.w + 2.7; }
      if (phone) { const hh = r.place === 'about' ? h : (r.place === 'contact' ? 3.6 : 2.7); return { c: [cx, cy + (r.place === 'contact' ? 0.4 : 0), w, hh], s: [10, top, W - 20, H * 0.3 - top] }; }
      return { c: [cx, cy, w, h], s: [32, top, W * 0.47 - 32, H - top - 92] };
    }
    function camFor(fr) {
      const [cx, cy, w, h] = fr.c, [sx, sy, sw, sh] = fr.s;
      const s = Math.max(w / sw, h / sh);
      const z = (s * H) / (2 * TH);
      return { x: cx - (sx + sw / 2 - W / 2) * s, y: cy + (sy + sh / 2 - H / 2) * s, z };
    }
    const cam = { x: 0, y: 1, z: 16, f: null, t: null, t0: 0, dur: 0, arc: 0, px: 0, py: 0 };
    let dragX = 0, dragging = false;
    function setCam(r, instant) {
      const t = camFor(framing(r));
      if (instant || reduced) { Object.assign(cam, { x: t.x, y: t.y, z: t.z, t: null }); dragX = 0; return 0; }
      const fx = cam.x + dragX; dragX = 0;
      const d = Math.abs(t.x - fx);
      const dur = 1.05 + Math.min(1.25, d / 70) + (Math.abs(t.z - cam.z) > 4 ? 0.2 : 0);
      cam.f = { x: fx, y: cam.y, z: cam.z }; cam.t = t; cam.t0 = time; cam.dur = dur; cam.arc = Math.min(9, d * 0.1);
      cam.x = fx;
      return dur;
    }

    // ---------------- reading surfaces ----------------
    let sheetFor = '';
    function sec(parent, title, sub) {
      const s = el('section', 'lm-sec', null, parent);
      el('span', 'lm-band', null, s);
      const h = el('h3', 'lm-h', title, s);
      if (sub) el('span', 'lm-hsub', sub, h);
      return s;
    }
    function tags(parent, nums) {
      const box = el('div', 'lm-tags', null, parent);
      nums.forEach((n, i) => {
        const v = Array.isArray(n) ? n[0] : n.value, l = Array.isArray(n) ? n[1] : n.label, d = Array.isArray(n) ? '' : n.date;
        const t = el('div', 'lm-tag', null, box); t.style.setProperty('--rot', `${(i % 2 ? 0.7 : -0.6)}deg`);
        el('b', String(v).length > 9 ? 'long' : null, v, t); el('span', null, l, t); if (d) el('i', null, fmtDate(d), t);
      });
    }
    function caseHeader(f, w, kick, title, one) {
      const hd = el('header', 'lm-chead', null, f);
      el('p', 'lm-kick', kick, hd);
      el('h2', 'lm-title', title, hd).tabIndex = -1;
      el('p', 'lm-one', one, hd);
      const L = LOOM[w.slug];
      if (L && L.agents.some(Boolean)) {
        const names = L.agents.filter(Boolean);
        el('p', 'lm-woven', `${names.length === 1 ? 'Shuttle' : 'Shuttles'} on this tapestry: ${names.join(' · ')}${L.rev ? ` — and ${L.revLabel}` : ''}`, hd);
      } else if (L && L.rev) el('p', 'lm-woven', `On this tapestry: a crew of specialist agents and an ${L.revLabel}`, hd);
      const lk = el('p', 'lm-golinks', null, hd);
      if (w.url) ext(w.url, `Open ${w.host} ↗`, lk);
      ext(`${({"vvdex-platform":"https://vvdexops.com/","conxto":"https://conxto.com/","vvdex-engine":"https://lab.vvdexops.com/","unboundpdf":"https://unboundpdf.com/","farmquick":"https://farmquick.in/","conxfolio":"https://conxfolio.com/","pitchradar":"https://github.com/vamsi-venkatesh/pitchradar","vvdex-trading":"https://trading.vvdexops.com/","forecasting":"https://lab.vvdexops.com/forecast/"})[w.slug]}`, 'Full case on vamsivenkatesh.com ↗', lk);
      return hd;
    }
    function pager(f, slug) {
      const i = items.findIndex((w) => w.slug === slug);
      const pg = el('nav', 'lm-pager', null, f); pg.setAttribute('aria-label', 'Other tapestries');
      const pv = items[(i - 1 + items.length) % items.length], nx = items[(i + 1) % items.length];
      const a = el('button', null, `‹ ${pv.name}`, pg); a.type = 'button'; on(a, 'click', () => go({ place: 'work', slug: pv.slug }));
      const m = el('button', 'lm-all', 'All tapestries', pg); m.type = 'button'; on(m, 'click', () => go({ place: 'work' }));
      const b = el('button', null, `${nx.name} ›`, pg); b.type = 'button'; on(b, 'click', () => go({ place: 'work', slug: nx.slug }));
    }
    function buildCase(slug) {
      const w = bySlug[slug], c = cases[slug];
      const f = document.createDocumentFragment();
      if (c) {
        caseHeader(f, w, `${c.category} · ${c.period}`, c.name, c.one_line);
        let s = sec(f, 'In short'); el('p', 'lm-p lm-big', c.summary, s);
        s = sec(f, 'My role'); el('p', 'lm-role', c.role, s);
        s = sec(f, 'The problem'); el('p', 'lm-p', c.problem, s);
        s = sec(f, 'Constraints', 'the tension on the warp'); const cl = el('ul', 'lm-cons', null, s); (c.constraints || []).forEach((t) => el('li', null, t, cl));
        s = sec(f, 'What I built'); (c.built || []).forEach((b) => { const it = el('div', 'lm-it', null, s); el('h4', null, b.title, it); el('p', 'lm-p', b.body, it); });
        s = sec(f, 'How it works', 'the weave, pass by pass');
        const ol = el('ol', 'lm-weave', null, s); (c.how_it_works || []).forEach((h, k) => { const li = el('li', k % 2 ? 'under' : 'over', null, ol); el('span', 'lm-pick', String(k + 1), li); el('h4', null, h.step, li); el('p', 'lm-p', h.body, li); });
        s = sec(f, 'Decisions'); (c.decisions || []).forEach((d) => { const it = el('div', 'lm-dec', null, s); el('h4', null, d.decision, it); const p1 = el('p', 'lm-p', null, it); el('b', null, 'Why. ', p1); p1.appendChild(document.createTextNode(d.why)); const p2 = el('p', 'lm-p lm-trade', null, it); el('b', null, 'Trade-off. ', p2); p2.appendChild(document.createTextNode(d.tradeoff)); });
        s = sec(f, 'How I tested it'); (c.evaluation || []).forEach((e) => { const it = el('div', 'lm-ev', null, s); el('time', null, fmtDate(e.date), it); el('h4', null, e.what, it); el('p', 'lm-p', e.result, it); });
        s = sec(f, 'Numbers', 'woven labels, each with its date'); tags(s, c.numbers || []);
        s = sec(f, 'Stack'); const st = el('p', 'lm-stack', null, s); (c.stack || []).forEach((t, k) => { if (k) el('span', 'lm-dot', ' · ', st); el('span', null, t, st); });
        s = sec(f, 'Links'); const ll = el('div', 'lm-links', null, s); (c.links || []).forEach((l) => ext(l.url, `${l.label} ↗`, ll));
        s = sec(f, 'Limits', 'where it frays'); (c.limits || []).forEach((t) => el('p', 'lm-fray', t, s));
      } else {
        caseHeader(f, w, `${w.kind} · ${w.status}`, w.name, w.line);
        let s = sec(f, 'The problem'); el('p', 'lm-p lm-big', w.problem, s);
        s = sec(f, 'The plan'); el('p', 'lm-p', w.plan, s);
        s = sec(f, 'What I built'); const bl = el('ul', 'lm-cons', null, s); (w.built || []).forEach((t) => el('li', null, t, bl));
        s = sec(f, 'How it is checked'); const ck = el('ol', 'lm-weave lm-weave-s', null, s); (w.checks || []).forEach((t, k) => { const li = el('li', k % 2 ? 'under' : 'over', null, ck); el('span', 'lm-pick', String(k + 1), li); el('p', 'lm-p', t, li); });
        s = sec(f, 'Numbers'); tags(s, w.stage || w.numbers || []);
        s = sec(f, 'Links'); const ll = el('div', 'lm-links', null, s); (w.links || []).forEach(([t, u]) => ext(u, `${t} ↗`, ll));
      }
      pager(f, slug);
      return { f, acc: w.color, dye: dyeOf(w) };
    }
    function buildStation(p) {
      const f = document.createDocumentFragment();
      const hd = el('header', 'lm-chead', null, f);
      if (p === 'principles') {
        el('p', 'lm-kick', 'Three threads through all of it', hd); el('h2', 'lm-title', 'How I work', hd).tabIndex = -1;
        prOrder.forEach((pi, k) => {
          const pr = principles[pi]; if (!pr) return;
          const s = el('section', 'lm-pr', null, f); s.tabIndex = 0;
          el('span', 'lm-band', null, s); el('h3', 'lm-prk', pr.k, s); el('p', 'lm-p', pr.v, s);
          const hi = () => { stPrin.u.uBand.value = 2 - k; }, lo = () => { stPrin.u.uBand.value = -1; };
          on(s, 'mouseenter', hi); on(s, 'mouseleave', lo); on(s, 'focus', hi); on(s, 'blur', lo);
        });
        return { f, acc: '#e8b86a', dye: '#86663a' };
      }
      if (p === 'withdrawn') {
        el('p', 'lm-kick', 'Threads I cut out myself', hd); el('h2', 'lm-title', 'Claims I withdrew', hd).tabIndex = -1;
        withdrawn.forEach((w) => {
          const s = el('section', 'lm-wd', null, f); el('span', 'lm-band', null, s);
          el('h3', 'lm-prk', w.title, s); el('p', 'lm-p', w.what, s);
          const nums = w.numbers || [];
          const vals = nums.map((n) => parseFloat(String(n[0]).replace(/,/g, '')));
          if (nums.length === 2 && vals.every((v) => v > 0 && v < 1)) {
            const lo = Math.floor((Math.min(...vals) - 0.03) * 100) / 100, hi = Math.ceil((Math.max(...vals) + 0.02) * 100) / 100;
            const g = el('div', 'lm-gauge', null, s); el('span', 'lm-gline', null, g);
            const cut = el('span', 'lm-gcut', null, g); cut.style.left = `${((vals[0] - lo) / (hi - lo)) * 100}%`; cut.style.width = `${((vals[1] - vals[0]) / (hi - lo)) * 100}%`;
            nums.forEach((n, k) => { const m = el('span', k ? 'lm-gmark gate' : 'lm-gmark meas', null, g); m.style.left = `${((vals[k] - lo) / (hi - lo)) * 100}%`; el('b', null, n[0], m); el('i', null, n[1], m); });
          } else if (nums.length && Number.isInteger(vals[0]) && vals[0] > 0 && vals[0] <= 12) {
            const g = el('div', 'lm-cuts', null, s);
            const row = el('span', 'lm-cutrow', null, g); for (let k = 0; k < vals[0]; k++) el('span', 'lm-cutt', null, row);
            nums.forEach((n) => { const m = el('span', 'lm-cutn', null, g); el('b', null, n[0], m); el('i', null, n[1], m); });
          } else tags(s, nums);
          if (w.link) ext(w.link[1], `${w.link[0]} ↗`, el('p', 'lm-links', null, s));
        });
        return { f, acc: '#d6cfc0', dye: '#7a5a3a' };
      }
      if (p === 'capabilities') {
        el('p', 'lm-kick', 'Every skill, and the tapestries woven with it', hd); el('h2', 'lm-title', 'Pattern book', hd).tabIndex = -1;
        el('p', 'lm-p lm-note', 'Read it like a weaving draft: a filled square means the skill is in that product. Choose one to open the case.', hd);
        // desktop: the draft grid
        const grid = el('div', 'lm-draft', null, f); grid.setAttribute('role', 'table'); grid.setAttribute('aria-label', 'Skills by product');
        const hr = el('div', 'lm-drow lm-dhead', null, grid); hr.setAttribute('role', 'row');
        el('span', 'lm-dsk', '', hr).setAttribute('role', 'columnheader');
        items.forEach((w) => { const h = el('span', 'lm-dcol', null, hr); h.setAttribute('role', 'columnheader'); el('span', null, w.name, h); });
        let r = 0;
        caps.forEach(([g, list]) => {
          const gr = el('div', 'lm-dgroup', g, grid); gr.setAttribute('role', 'row');
          list.forEach(([s, prods]) => {
            const row = el('div', 'lm-drow', null, grid); row.setAttribute('role', 'row');
            el('span', 'lm-dsk', s, row).setAttribute('role', 'rowheader');
            const rr = r++;
            items.forEach((w, ci) => {
              const used = prods.includes(w.name);
              const cell = el(used ? 'button' : 'span', used ? 'lm-dc on' : 'lm-dc', null, row); cell.setAttribute('role', 'cell');
              if (used) {
                cell.type = 'button'; cell.style.setProperty('--sw', w.color); cell.setAttribute('aria-label', `${s}: ${w.name}. Open the case.`); cell.title = `${w.name}`;
                on(cell, 'click', () => go({ place: 'work', slug: w.slug }));
                const hi = () => { stCaps.u.uHi.value.set(ci, MY - 1 - rr, 1); }, lo = () => { stCaps.u.uHi.value.set(-9, -9, 0); };
                on(cell, 'mouseenter', hi); on(cell, 'mouseleave', lo); on(cell, 'focus', hi); on(cell, 'blur', lo);
              }
            });
          });
        });
        // phone: the same draft as a list
        const lst = el('div', 'lm-plist', null, f);
        caps.forEach(([g, list]) => {
          const s = el('section', 'lm-sec', null, lst); el('span', 'lm-band', null, s); el('h3', 'lm-h', g, s);
          list.forEach(([sk, prods]) => {
            const it = el('div', 'lm-pli', null, s); el('h4', null, sk, it);
            const pp = el('p', 'lm-plinks', null, it);
            prods.forEach((nm, k) => { const slug = nameToSlug[nm]; if (k) el('span', 'lm-dot', ' · ', pp); if (!slug) { el('span', null, nm, pp); return; } const b = el('button', null, nm, pp); b.type = 'button'; b.style.setProperty('--sw', bySlug[slug].color); on(b, 'click', () => go({ place: 'work', slug })); });
          });
        });
        return { f, acc: '#e8b86a', dye: '#86663a' };
      }
      if (p === 'about') {
        el('p', 'lm-kick', 'The maker’s label', hd); el('h2', 'lm-title', person.name, hd).tabIndex = -1;
        el('p', 'lm-one', `${(person.roles || []).join(' · ')}`, hd);
        let s = sec(f, 'What I am looking for'); el('p', 'lm-p lm-big', person.wants, s);
        el('p', 'lm-avail', person.availability, s);
        s = sec(f, 'The facts');
        const dl = el('dl', 'lm-facts', null, s);
        (about.facts || []).forEach(([k, v]) => { el('dt', null, k, dl); el('dd', null, v, dl); });
        return { f, acc: '#e8b86a', dye: '#86663a' };
      }
      // contact
      el('p', 'lm-kick', 'The loose end', hd); el('h2', 'lm-title', 'Pick up the thread', hd).tabIndex = -1;
      el('p', 'lm-one', person.availability, hd);
      const subj = `${ctx.audience === 'ai' ? 'AI engineer role' : 'Hello'}${ctx.org ? ` at ${ctx.org}` : ''}`;
      const s = el('section', 'lm-contact', null, f);
      el('span', 'lm-band', null, s);
      const m = ext(`mailto:${person.email}?subject=${encodeURIComponent(subj)}`, person.email, s, 'lm-mail');
      m.setAttribute('aria-label', `Email ${person.email}, subject: ${subj}`);
      el('p', 'lm-msub', `Subject is set: “${subj}”`, s);
      const ll = el('div', 'lm-links', null, s);
      ext(person.linkedin, 'LinkedIn ↗', ll); ext(person.github, 'GitHub ↗', ll); ext(person.site, 'vamsivenkatesh.com ↗', ll);
      el('p', 'lm-p lm-note', person.wants, s);
      return { f, acc: '#e8b86a', dye: '#86663a' };
    }
    function fillSheet(key, built, delay) {
      sheetFor = key;
      scroller.replaceChildren(); scroller.scrollTop = 0;
      scroller.appendChild(built.f);
      sheet.style.setProperty('--acc', built.acc); sheet.style.setProperty('--dye', built.dye);
      ovRead.classList.remove('unroll'); void ovRead.offsetWidth;
      ovRead.style.setProperty('--ud', `${reduced ? 0 : delay}s`);
      [...scroller.children].forEach((ch, i) => ch.style.setProperty('--sd', `${reduced ? 0 : delay + 0.35 + Math.min(i, 8) * 0.07}s`));
      if (!reduced) ovRead.classList.add('unroll');
    }

    // ---------------- agent labels for the open tapestry ----------------
    function buildAgentLabels(c) {
      agLabs.forEach((n) => n.remove()); agLabs = [];
      if (!c) return;
      const L = LOOM[c.slug]; if (!L) return;
      c.sh.forEach((s) => { if (!s.name) return; const n = el('span', 'lm-ag', s.name, ovCase); n.style.color = css(mixc(s.col, [1, 1, 1], 0.2)); n._s = s; agLabs.push(n); });
      if (L.rev) { const n = el('span', 'lm-ag lm-agr', L.revLabel, ovCase); n._rev = true; agLabs.push(n); }
    }

    // ---------------- router ----------------
    let route = null, st = 'home', hoverC = null, workWoven = false, applyTok = 0;
    function parse() {
      const h = decodeURIComponent((location.hash || '').replace(/^#\/?/, ''));
      const [a, b] = h.split('/');
      if (a === 'work' && b && bySlug[b]) return { place: 'work', slug: b };
      if (PLACES.includes(a)) return { place: a };
      return { place: 'home' };
    }
    function go(r) {
      const h = r.slug ? `#work/${r.slug}` : `#${r.place}`;
      if (location.hash === h) apply(parse()); else location.hash = h;
    }
    function apply(r, first) {
      route = r; applyTok++;
      st = r.place === 'home' ? 'home' : r.place === 'work' ? (r.slug ? 'case' : 'work') : 'station';
      const travel = setCam(r, first);
      root.style.setProperty('--ovd', `${reduced || first ? 0 : Math.max(0, travel * 0.55)}s`);
      root.dataset.st = st;
      root.classList.toggle('is-case', st === 'case');
      // tapestries
      banners.forEach((c) => {
        const sel = r.slug === c.slug;
        c.dimT = st === 'case' && !sel ? 0.13 : 1;
        c.wT = sel ? c.base.w * (phone ? 2.0 : 1.85) : c.base.w;
        c.zT = sel ? 0.55 : 0;
        c.xT = c.baseX + pushOf(c);
        if (reduced) { c.w = c.wT; c.z = c.zT; c.dim = c.dimT; c.x = c.xT; }
      });
      if ((st === 'work' || st === 'case') && !workWoven) { workWoven = true; banners.forEach((c, i) => { if (st === 'case' && c.slug === r.slug) return; weave(c, 0, c.fellRest, 2.6 + (i % 3) * 0.4, travel * 0.45 + i * 0.16); }); }
      if (st === 'case') { const c = banners.find((b) => b.slug === r.slug); weave(c, 0.5, 0.965, 4.5, travel * 0.5); if (c.pull) c.pull.next = time + travel + 3.2; buildAgentLabels(c); } else buildAgentLabels(null);
      if (st === 'station') { const c = stations[r.place]; if (!c.woven) weave(c, 0.15, c.fellRest, 2.8, travel * 0.5); if (r.place === 'about') buildAboutTex(); }
      // reading surface
      const key = st === 'case' ? `case:${r.slug}` : st === 'station' ? r.place : '';
      if (key && key !== sheetFor) fillSheet(key, st === 'case' ? buildCase(r.slug) : buildStation(r.place), first ? 0.15 : travel * 0.5);
      if (!key) sheetFor = '';
      if (key && !first) { const tok = applyTok; later(() => { if (tok !== applyTok) return; const h = scroller.querySelector('.lm-title'); if (h && document.activeElement && root.contains(document.activeElement)) h.focus({ preventScroll: true }); }, (travel + 0.2) * 1000); }
      // index
      const pi = PLACES.indexOf(r.place);
      knots.forEach((k, i) => { k.classList.toggle('on', i === pi); if (i === pi) k.setAttribute('aria-current', 'location'); else k.removeAttribute('aria-current'); });
      navCur.textContent = st === 'case' ? `${LABEL.work} · ${bySlug[r.slug].name}` : LABEL[r.place];
      placeShuttle();
      prevB.disabled = st !== 'case' && pi === 0; nextB.disabled = st !== 'case' && pi === PLACES.length - 1;
      setHover(null);
      dirty = true;
    }
    function placeShuttle() {
      const k = knots[PLACES.indexOf(route.place)]; if (!k) return;
      shut.style.transform = `translateX(${k.offsetLeft + k.offsetWidth / 2 - 15}px)`;
    }
    function step(d) {
      if (st === 'case') { const i = items.findIndex((w) => w.slug === route.slug); const n = items[(i + d + items.length) % items.length]; go({ place: 'work', slug: n.slug }); return; }
      const i = PLACES.indexOf(route.place), j = clamp(i + d, 0, PLACES.length - 1);
      if (j !== i) go({ place: PLACES[j] });
    }
    function setHover(c) {
      hoverC = c;
      banners.forEach((b) => { b.glowT = b === c ? 1 : 0; });
      glabs.forEach((g, i) => g.classList.toggle('hot', banners[i] === c));
      gone.textContent = c ? bySlug[c.slug].one : (touch ? 'Tap a tapestry to open its case.' : 'Hover a tapestry to read its thread; click to open its case.');
      canvas.style.cursor = c ? 'pointer' : '';
    }

    // ---------------- input ----------------
    const v3 = new THREE.Vector3(), v3b = new THREE.Vector3();
    function worldAt(px, py, zPlane = 0) {
      v3.set((px / W) * 2 - 1, -(py / H) * 2 + 1, 0.5).unproject(camera);
      v3.sub(camera.position).normalize();
      const t = (zPlane - camera.position.z) / v3.z;
      return [camera.position.x + v3.x * t, camera.position.y + v3.y * t];
    }
    function project(x, y, z) { v3b.set(x, y, z).project(camera); return [(v3b.x + 1) / 2 * W, (1 - v3b.y) / 2 * H, v3b.z]; }
    function clothAt(x, y, list) {
      for (const c of list) { if (Math.abs(x - c.x) <= c.w / 2 && y >= c.y - c.h / 2 && y <= c.y + c.h / 2) return c; }
      return null;
    }
    const ptr = { x: 0, y: 0, nx: 0, ny: 0, down: false, sx: 0, sy: 0, moved: 0, wx: 0, wy: 0, lastImp: 0, has: false, ts: 0 };
    let lastStr = null, firstTouch = false;
    function strum(wx, wy, speed) {
      if (reduced) return;
      const idx = Math.floor(wx / 0.17);
      if (lastStr !== null && idx !== lastStr && time - ptr.lastImp > 0.03) {
        const c = clothAt(wx, wy, cloths);
        if (!c || (wy - (c.y - c.h / 2)) / c.h > c.fell) {
          IMP[impK % 8].set(wx, wy, time, clamp(speed * 0.0016, 0.25, 1.15) * (wx > ptr.wx ? 1 : -1)); impK++; ptr.lastImp = time;
          if (!firstTouch) { firstTouch = true; hint.classList.add('gone'); }
        }
      }
      lastStr = idx;
    }
    on(canvas, 'pointerdown', (e) => {
      ptr.down = true; ptr.sx = e.clientX; ptr.sy = e.clientY; ptr.moved = 0;
      const [wx, wy] = worldAt(e.clientX, e.clientY);
      if (route.place === 'contact' && !reduced) {
        const tail = rope.p[RN - 1]; if (Math.hypot(wx - tail[0], wy - tail[1]) < 0.55 + cam.z * 0.012) { rope.grab = true; rope.gx = wx; rope.gy = wy; rope.hinted = true; }
      }
      try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
    });
    on(canvas, 'pointermove', (e) => {
      const px = e.clientX, py = e.clientY;
      const sp = Math.hypot(px - ptr.x, py - ptr.y) / Math.max(1, e.timeStamp - (ptr.ts || e.timeStamp - 16)) * 16;
      ptr.ts = e.timeStamp; ptr.x = px; ptr.y = py; ptr.has = true;
      ptr.nx = px / W * 2 - 1; ptr.ny = py / H * 2 - 1;
      const [wx, wy] = worldAt(px, py);
      if (rope.grab) { rope.gx = wx; rope.gy = wy; }
      else {
        if (ptr.down) {
          const dx = px - ptr.sx; ptr.moved = Math.max(ptr.moved, Math.hypot(dx, py - ptr.sy));
          if (ptr.moved > 8 && Math.abs(dx) > Math.abs(py - ptr.sy) * 0.8) { dragging = true; dragX = -dx * (2 * cam.z * TH / H) * 0.85; }
        }
        strum(wx, wy, sp * 3);
      }
      ptr.wx = wx; ptr.wy = wy;
      // light on the cloth under the pointer
      const c = clothAt(wx, wy, cloths);
      if (c) { c.ptr = 1; c.ptrU = (wx - (c.x - c.w / 2)) / c.w; c.ptrV = (wy - (c.y - c.h / 2)) / c.h; }
      if (!touch && (st === 'work' || st === 'case')) { const b = clothAt(wx, wy, banners); if (b !== hoverC && !ptr.down) setHover(b); }
      dirty = true;
    });
    const endPtr = (e) => {
      if (!ptr.down) return; ptr.down = false;
      if (rope.grab) { rope.grab = false; return; }
      const dx = e.clientX - ptr.sx;
      if (dragging) {
        dragging = false;
        if (Math.abs(dx) > Math.max(56, W * 0.07)) step(dx < 0 ? 1 : -1);
        return;
      }
      if (ptr.moved < 8 && e.type === 'pointerup') click(e.clientX, e.clientY);
    };
    on(canvas, 'pointerup', endPtr); on(canvas, 'pointercancel', endPtr);
    on(canvas, 'pointerleave', () => { if (!ptr.down) { lastStr = null; if (st === 'work') setHover(null); } });
    function click(px, py) {
      const [wx, wy] = worldAt(px, py);
      if (st === 'work' || st === 'case') { const b = clothAt(wx, wy, banners); if (b && b.slug !== route.slug) { go({ place: 'work', slug: b.slug }); return; } }
      if (st === 'home' && clothAt(wx, wy, [home])) go({ place: 'work' });
    }
    let wAcc = 0, wCool = 0;
    on(root, 'wheel', (e) => {
      if (e.target.closest && e.target.closest('.lm-scroll')) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      wAcc = wAcc * 0.9 + d;
      if (Math.abs(wAcc) > 110 && performance.now() / 1000 > wCool) { step(wAcc > 0 ? 1 : -1); wAcc = 0; wCool = performance.now() / 1000 + 1.3; }
    }, { passive: true });
    on(window, 'keydown', (e) => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
      else if (e.key === 'Escape') { if (st === 'case') go({ place: 'work' }); else if (st !== 'home') go({ place: 'home' }); }
    });
    on(window, 'hashchange', () => apply(parse()));
    function onResize() {
      W = root.clientWidth || innerWidth; H = root.clientHeight || innerHeight;
      renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix();
      const wasPhone = phone; layout(); if (wasPhone !== phone) buildHomeTex();
      if (route) { const t = camFor(framing(route)); if (cam.t) cam.t = t; else Object.assign(cam, t); }
      placeShuttle(); positionHome(); dirty = true;
    }
    on(window, 'resize', onResize);
    function positionHome() { ovHome.style.top = `${Math.round(phone ? H * 0.5 : H * 0.615)}px`; }

    // ---------------- frame ----------------
    let raf = 0, time = 0, last = performance.now() / 1000, dirty = true, fpsN = 0, fpsT = 0;
    const SHUT_IDLE = 0.32, SHUT_WEAVE = 2.7;
    const REV = [0.86, 0.92, 1.0], CORAL = [1.0, 0.43, 0.34];
    function frame(nowMs) {
      raf = requestAnimationFrame(frame);
      const now = nowMs / 1000; const dt = Math.min(0.05, Math.max(0, now - last)); last = now;
      if (!reduced) time += dt;
      fpsN++; fpsT += dt;
      UT.value = time;
      // camera
      let cx = cam.x, cy = cam.y, cz = cam.z;
      if (cam.t) {
        const k = clamp((time - cam.t0) / cam.dur), e = eio(k);
        cx = cam.f.x + (cam.t.x - cam.f.x) * e; cy = cam.f.y + (cam.t.y - cam.f.y) * e; cz = cam.f.z + (cam.t.z - cam.f.z) * e + Math.sin(Math.PI * k) * cam.arc;
        if (k >= 1) { Object.assign(cam, { x: cam.t.x, y: cam.t.y, z: cam.t.z, t: null }); cx = cam.x; cy = cam.y; cz = cam.z; }
        dirty = true;
      }
      if (!dragging && Math.abs(dragX) > 1e-4) { dragX *= Math.exp(-dt * 7); dirty = true; }
      const par = (!touch && !reduced && ptr.has) ? 1 : 0;
      cam.px += ((ptr.nx * 0.22 * par) - cam.px) * (1 - Math.exp(-dt * 2));
      cam.py += ((-ptr.ny * 0.14 * par) - cam.py) * (1 - Math.exp(-dt * 2));
      camera.position.set(cx + dragX + cam.px, cy + cam.py, cz);
      camera.lookAt(cx + dragX + cam.px * 0.35, cy + cam.py * 0.35, 0);
      camera.updateMatrixWorld();
      const viewX = cx + dragX, halfW = cz * TH * (W / H) + 1.5;

      ptN = 0; rbV = 0; rbI = 0;
      const kk = reduced ? 1 : 1 - Math.exp(-dt * 4.5);
      for (const c of cloths) {
        c.w += (c.wT - c.w) * kk; c.x += (c.xT - c.x) * kk; c.z += (c.zT - c.z) * kk; c.dim += (c.dimT - c.dim) * kk; c.glow += (c.glowT - c.glow) * kk; c.ptr *= Math.exp(-dt * 2.2);
        if (c.tw) {
          if (c.pull && c.pull.t >= 0) c.tw.t0 += dt; // the fell waits while the reviewer works
          const p = clamp((time - c.tw.t0) / c.tw.dur); c.fell = c.tw.a + (c.tw.b - c.tw.a) * eio(p); c.weaving = p > 0 && p < 1; if (p >= 1) c.tw = null;
        } else c.weaving = false;
        c.mesh.position.set(c.x, c.y, c.z + 0.12);
        const u = c.u; u.uSize.value.set(c.w, c.h); u.uCells.value.set(c.w / c.cw, c.h / c.ch); u.uFell.value = c.fell; u.uDim.value = c.dim; u.uGlow.value = c.glow;
        u.uPtr.value.set(c.ptrU, c.ptrV, reduced ? 0 : c.ptr);
        c.vis = Math.abs(c.x - viewX) < halfW + c.w / 2;
        if (!c.vis || c.fell < 0.004) { if (c.pull) c.pull.cap.style.opacity = '0'; continue; }
        const X0 = c.x - c.w / 2, Yf = c.y - c.h / 2 + c.fell * c.h, Z = c.z + 0.17;
        const sz = phone ? 15 : 19, big = (st === 'case' && route.slug === c.slug) ? 1.35 : (c === home ? 1.2 : 1);
        // shuttles: each agent weaves its own region (discontinuous weft, as in tapestry)
        for (const s of c.sh) {
          s.spd += ((c.weaving ? SHUT_WEAVE : SHUT_IDLE) - s.spd) * (1 - Math.exp(-dt * 3));
          s.ph = (s.ph + dt * s.spd) % 2;
          const fwd = s.ph < 1, q = fwd ? s.ph : 2 - s.ph, qq = reduced ? 0.5 : eio(q) * 0.85 + q * 0.15;
          const uu = s.u0 + (s.u1 - s.u0) * qq, x = X0 + uu * c.w;
          pt(x, Yf + 0.004, Z + 0.02, s.col, sz * big, c.dim);
          const u0 = fwd ? s.u0 : s.u1, n = 12;
          for (let i = 0; i < n; i++) { const t = i / (n - 1), xx = X0 + (u0 + (uu - u0) * t) * c.w; setP(i, xx, Yf + 0.006, Z + (i % 2 ? 0.01 : -0.005)); }
          ribbon(n, CH * (big > 1 ? 1.25 : 1.05), s.col, 0.08 * c.dim, 0.95 * c.dim);
        }
        // reviewer threads run across the whole pass, just above the fell
        c.revs.forEach((rv, r) => {
          rv.ph = (rv.ph + dt * (reduced ? 0 : 0.17 + r * 0.05)) % 2;
          const yy = Yf + (r + 1) * Math.max(0.045, c.h * 0.011), n = 20;
          for (let i = 0; i < n; i++) setP(i, X0 + (0.01 + 0.98 * i / (n - 1)) * c.w, yy, Z + 0.01);
          ribbon(n, CH * 0.55, REV, 0.26 * c.dim, 0.26 * c.dim, 6);
          const q = rv.ph < 1 ? rv.ph : 2 - rv.ph;
          pt(X0 + (0.02 + 0.96 * eio(q)) * c.w, yy, Z + 0.03, REV, sz * 0.8 * big, 0.85 * c.dim);
        });
        if (c.pull) runPull(c, dt, X0, Yf, Z);
      }
      // beams of the loom
      for (const yb of (phone ? [] : [Y_TOP, Y_BOT])) { setP(0, viewX - halfW - 4, yb, -0.06); setP(1, viewX + halfW + 4, yb, -0.06); ribbon(2, 0.05, [0.62, 0.46, 0.3], 0.32, 0.32); }
      // withdrawn: cut ends hanging where threads were pulled
      if (stWith.vis && stWith.fell > 0.75) {
        const hs = stWith.u.uHoles.value, X0 = stWith.x - stWith.w / 2, Yb = stWith.y - stWith.h / 2;
        [[hs.x, hs.y], [hs.z, hs.w]].forEach(([a, b], hI) => {
          for (let j = 0; j < 3; j++) {
            const v = a + (b - a) * (j + 0.5) / 3, y0 = Yb + v * stWith.h;
            for (const side of [-1, 1]) {
              const x0 = side < 0 ? X0 + 0.02 : X0 + stWith.w - 0.02, len = 0.35 + 0.18 * ((j + hI) % 3), n = 10;
              for (let i = 0; i < n; i++) { const t = i / (n - 1); const sw = Math.sin(time * 1.3 + j * 2 + hI + side) * 0.05 * t; setP(i, x0 + side * (t * len * 0.75 + sw), y0 - t * t * len * 0.9, 0.05 + t * 0.05); }
              ribbon(n, CH * 0.9, [0.85, 0.78, 0.68], 0.85, 0.05);
            }
          }
          const lab = holeLabs[hI];
          if (lab) { const onW = st === 'station' && route.place === 'withdrawn'; lab.style.opacity = onW ? '1' : '0'; if (onW) { const [sx, sy] = project(stWith.x, Yb + ((a + b) / 2) * stWith.h, 0.05); lab.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`; } }
        });
      }
      // contact: the loose thread
      if (stContact.vis) runRope(dt);
      // overlays that follow the loom
      if (st === 'work' || (st === 'case' && cam.t)) {
        banners.forEach((c, i) => {
          const [sx, sy] = project(c.x, c.y - c.h / 2, c.z);
          const pitch = phone ? 1.15 : 1.92; const [sx2] = project(c.x + pitch, c.y - c.h / 2, 0);
          const wpx = Math.min(phone ? 92 : 168, Math.abs(sx2 - sx) - 4);
          glabs[i].style.width = `${phone ? 66 : Math.max(60, wpx)}px`;
          glabs[i].style.transform = `translate(${sx}px, ${sy + 8}px) translateX(-50%)`;
        });
      }
      if (st === 'case' && !phone) {
        const c = banners.find((b) => b.slug === route.slug);
        agLabs.forEach((n) => {
          if (n._s) { const s = n._s; const [sx, sy] = project(c.x + ((s.u0 + s.u1) / 2 - 0.5) * c.w, c.y - c.h / 2, c.z); n.style.transform = `translate(${sx}px, ${sy + 10}px) translateX(-50%)`; }
          else { const Yf = c.y - c.h / 2 + c.fell * c.h; const [sx, sy] = project(c.x + c.w / 2, Yf + 0.06, c.z); n.style.transform = `translate(${sx + 12}px, ${sy}px) translateY(-50%)`; }
        });
      }
      ptGeo.setDrawRange(0, ptN);
      ptGeo.attributes.position.needsUpdate = true; ptGeo.attributes.color.needsUpdate = true; ptGeo.attributes.aSize.needsUpdate = true; ptGeo.attributes.aA.needsUpdate = true;
      rbGeo.setDrawRange(0, rbI);
      rbGeo.attributes.position.needsUpdate = true; rbGeo.attributes.aCol.needsUpdate = true; rbGeo.attributes.aSide.needsUpdate = true; rbGeo.index.needsUpdate = true;
      if (!reduced || dirty) { renderer.render(scene, camera); dirty = false; }
    }

    // the reviewer pull: a thread that claims too much is laid, caught, and drawn out of the cloth
    function runPull(c, dt, X0, Yf, Z) {
      const Pp = c.pull, cap = Pp.cap;
      const show = c === home ? st === 'home' : (st === 'case' && route.slug === c.slug);
      if (reduced || !show) { cap.style.opacity = '0'; if (Pp.t >= 0) { Pp.t = -1; Pp.next = time + 3; } return; }
      if (Pp.t < 0) { if (time > Pp.next && c.fell > 0.3 && !cam.t) { Pp.t = 0; Pp.y = Yf + 0.012; Pp.hu = 0.38 + Math.random() * 0.24; } else { cap.style.opacity = '0'; return; } }
      Pp.t += dt;
      const t = Pp.t, sc = c.h / 4.8, L = X0 + 0.015 * c.w, R = X0 + 0.985 * c.w, hx = X0 + Pp.hu * c.w, y = Pp.y;
      const n = 30;
      if (t < 0.75) {
        const e = eo(t / 0.75);
        for (let i = 0; i < n; i++) { const xx = L + (R - L) * e * (i / (n - 1)); setP(i, xx, y + Math.sin(xx * 31) * 0.006, Z + 0.03 + Math.abs(Math.sin(xx * 23)) * 0.03); }
        ribbon(n, CH * 1.35, CORAL, 0.95, 0.95);
        pt(L + (R - L) * e, y, Z + 0.05, CORAL, 20, 1);
        cap.style.opacity = '0';
      } else if (t < 1.75) {
        const e = eio((t - 0.75) / 1.0), fl = 0.75 + 0.25 * Math.sin(t * 22);
        for (let i = 0; i < n; i++) { const xx = L + (R - L) * (i / (n - 1)); setP(i, xx, y + Math.sin(xx * 31) * 0.006, Z + 0.03 + Math.abs(Math.sin(xx * 23)) * 0.03); }
        ribbon(n, CH * 1.35, CORAL, 0.95 * fl, 0.95 * fl);
        pt(L + (hx - L) * e, y + 0.03, Z + 0.06, REV, 24, 1);
      } else {
        const k = eio(clamp((t - 1.75) / 1.6)), fade = 1 - clamp((t - 3.5) / 0.9);
        const lift = Math.max(0, t - 3.35) * 0.9;
        const Hx = hx + 0.45 * k * sc, Hy = y + (0.42 * k + lift * 0.5) * sc, Hz = Z + 2.4 * k;
        const lx = L + (hx - L) * Math.pow(k, 1.15), rx = R - (R - hx) * Math.pow(k, 1.15);
        for (const side of [-1, 1]) {
          const ex = side < 0 ? lx : rx; let m = 0;
          const nA = 8; for (let i = 0; i < nA; i++) setP(m++, ex + (hx - ex) * (i / (nA - 1)), y, Z + 0.03);
          const nB = 16, cxp = hx + side * 0.12 * sc, cyp = y + 0.55 * k * sc + lift * 0.4, czp = Z + 0.5 * k;
          for (let i = 1; i <= nB; i++) { const q = i / nB, a = (1 - q) * (1 - q), b = 2 * (1 - q) * q, d = q * q; setP(m++, a * hx + b * cxp + d * Hx, a * y + b * cyp + d * Hy, a * Z + b * czp + d * Hz); }
          ribbon(m, CH * 1.3, CORAL, 0.9 * fade, 0.9 * fade);
        }
        pt(Hx, Hy, Hz + 0.02, REV, 26, fade);
        const [sx, sy] = project(Hx, Hy, Hz);
        cap.style.transform = `translate(${sx + 24}px, ${sy}px) translateY(-50%)`;
        cap.style.opacity = String(clamp((t - 1.9) / 0.4) * fade);
        if (t > 4.5) { Pp.t = -1; Pp.next = time + Pp.every; cap.style.opacity = '0'; }
      }
    }
    function runRope(dt) {
      const a = ropeAnchor();
      const steps = 2, g = -2.6, h = Math.min(dt, 0.033) / steps;
      for (let sI = 0; sI < steps; sI++) {
        for (let i = 1; i < RN; i++) {
          const p = rope.p[i], o = rope.o[i];
          const vx = (p[0] - o[0]) * 0.986, vy = (p[1] - o[1]) * 0.986;
          o[0] = p[0]; o[1] = p[1];
          const wind = 0.9 + (reduced ? 0 : Math.sin(time * 0.9 + i * 0.25) * 0.35 + Math.sin(time * 2.3 + i * 0.6) * 0.12);
          p[0] += vx + wind * h * h; p[1] += vy + g * h * h;
        }
        rope.p[0][0] = a[0]; rope.p[0][1] = a[1];
        if (rope.grab) { const tl = rope.p[RN - 1]; tl[0] = rope.gx; tl[1] = rope.gy; }
        for (let it = 0; it < 14; it++) {
          for (let i = 0; i < RN - 1; i++) {
            const p = rope.p[i], q = rope.p[i + 1];
            const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1e-6, df = (d - RSEG) / d;
            const pinA = i === 0, pinB = rope.grab && i + 1 === RN - 1;
            if (pinA && pinB) continue;
            if (pinA) { q[0] -= dx * df; q[1] -= dy * df; } else if (pinB) { p[0] += dx * df; p[1] += dy * df; }
            else { p[0] += dx * df * 0.5; p[1] += dy * df * 0.5; q[0] -= dx * df * 0.5; q[1] -= dy * df * 0.5; }
          }
          rope.p[0][0] = a[0]; rope.p[0][1] = a[1];
        }
      }
      for (let i = 0; i < RN; i++) setP(i, rope.p[i][0], rope.p[i][1], 0.2);
      ribbon(RN, 0.045, [1.0, 0.8, 0.48], 0.95, 0.95);
      const tl = rope.p[RN - 1];
      pt(tl[0], tl[1], 0.1, [1, 0.88, 0.6], (phone ? 20 : 26) * (rope.grab ? 1.3 : 1), 1);
      ropeHint.style.opacity = '0';
      if (st === 'station' && route.place === 'contact') {
        const [sx, sy] = project(tl[0], tl[1], 0.1);
        ropeHint.style.transform = `translate(${sx + 16}px, ${sy + 6}px)`;
        ropeHint.style.opacity = rope.hinted || cam.t ? '0' : '1';
      }
    }

    // ---------------- start ----------------
    layout(); positionHome();
    const r0 = parse();
    // the arrival weave begins once the name's font is ready (never waits more than 1.2 s)
    const fontReady = Promise.race([
      document.fonts ? Promise.all([document.fonts.load('700 100px "Cormorant Garamond"'), document.fonts.load('400 16px "Hanken Grotesk"')]) : Promise.resolve(),
      new Promise((res) => later(res, 1200)),
    ]).catch(() => {});
    buildHomeTex(); // fallback face first, replaced below
    apply(r0, true);
    raf = requestAnimationFrame(frame);
    fontReady.then(() => {
      if (!alive) return;
      homeTexPhone = null; buildHomeTex(); if (aboutBuilt) { aboutBuilt = false; buildAboutTex(); }
      if (r0.place === 'home') weave(home, 0, home.fellRest, 2.5, 0.05); else weave(home, home.fellRest, home.fellRest, 0.01);
      placeShuttle(); dirty = true;
    });

    // QA helper: measured fps (headless verification only)
    root.__lmFps = () => { const f = fpsN / Math.max(1e-3, fpsT); fpsN = 0; fpsT = 0; return f; };

    // ---------------- unmount ----------------
    return function unmount() {
      alive = false;
      cancelAnimationFrame(raf); raf = 0;
      timers.forEach((id) => clearTimeout(id)); timers.clear();
      cleanup.forEach((f) => f()); cleanup.length = 0;
      cloths.forEach((c) => { const t = c.u.uTex.value; if (t && t !== blankTex && t !== mTex) t.dispose(); });
      mTex.dispose();
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose(); renderer.forceContextLoss();
      link.remove(); style.remove();
      delete root.__lmFps;
      root.removeAttribute('data-st'); root.style.removeProperty('--ovd');
      root.className = rootClass;
      root.replaceChildren();
    };
  },
};

// ---------------- shaders ----------------
const WARP_VS = `
attribute float aSeed;
uniform float uTime, uAmp, uAlpha, uYT, uYB; uniform vec4 uImp[8];
varying float vA;
void main(){
  vec3 p = position; float s = position.y; p.y = mix(uYB, uYT, s); float glow = 0.0;
  float env = sin(3.14159 * s);
  p.x += sin(uTime * 0.45 + aSeed * 6.283 + p.y * 0.35) * 0.012 * env * uAmp;
  for (int k = 0; k < 8; k++) {
    vec4 im = uImp[k]; float tt = uTime - im.z;
    if (tt > 0.0 && tt < 3.5) {
      float dx = p.x - im.x; float e = exp(-abs(dx) * 1.7);
      float w = sin(tt * 17.0 - abs(dx) * 6.0) * exp(-tt * 1.5);
      float ey = exp(-pow((p.y - im.y) * 0.24, 2.0));
      p.x += im.w * e * w * ey * 0.13 * uAmp; p.z += im.w * e * w * ey * 0.22 * uAmp; glow += abs(im.w) * e * ey * exp(-tt * 1.2);
    }
  }
  float pulse = exp(-pow((fract(aSeed * 13.17 + uTime * 0.028) - (1.0 - s)) * 9.0, 2.0)) * step(0.95, fract(aSeed * 91.7));
  vA = ((0.075 + 0.05 * fract(aSeed * 37.3)) * smoothstep(0.0, 0.03, s) * smoothstep(1.0, 0.97, s) + pulse * 0.16 + glow * 0.5) * uAlpha;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const WARP_FS = `
uniform vec3 uCol; varying float vA;
void main(){ gl_FragColor = vec4(uCol, vA); }`;

const CLOTH_VS = `
uniform vec2 uSize; uniform float uTime; uniform float uWave; uniform vec3 uPtr;
varying vec2 vUv; varying float vLit; varying vec3 vPos;
float zf(vec2 p){ return (sin(p.x * 0.8 + uTime * 0.55) * 0.05 + sin(p.y * 1.1 - uTime * 0.42 + p.x * 0.35) * 0.04) * uWave; }
void main(){
  vUv = uv;
  vec2 p = (uv - 0.5) * uSize;
  float z = zf(p);
  vec2 d = (uv - uPtr.xy) * uSize; z -= exp(-dot(d, d) * 2.5) * uPtr.z * 0.08;
  float e = 0.05;
  float zx = zf(p + vec2(e, 0.0)) - zf(p - vec2(e, 0.0));
  float zy = zf(p + vec2(0.0, e)) - zf(p - vec2(0.0, e));
  vec3 n = normalize(vec3(-zx / (2.0 * e), -zy / (2.0 * e), 1.0));
  vLit = 0.42 + 0.66 * max(0.0, dot(n, normalize(vec3(-0.35, 0.5, 0.8))));
  vec4 wp = modelMatrix * vec4(p, z, 1.0); vPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const CLOTH_FS = `
precision highp float;
uniform vec2 uSize, uCells, uTexN; uniform vec3 uA, uB, uC, uWarp, uPtr, uHi;
uniform float uMode, uPat, uMotif, uFell, uTime, uDim, uGlow, uBand, uFellGlow;
uniform sampler2D uTex; uniform vec4 uHoles;
varying vec2 vUv; varying float vLit; varying vec3 vPos;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float structure(vec2 id, float pat){
  float i = id.x, j = id.y;
  if (pat < 0.5) return mod(i + j, 2.0);
  if (pat < 1.5) return step(mod(i + j, 4.0), 1.5);
  if (pat < 2.5) { float dir = mod(floor(i / 6.0), 2.0) < 1.0 ? 1.0 : -1.0; return step(mod(i * dir + j + 600.0, 4.0), 1.5); }
  if (pat < 3.5) return step(0.5, mod(i * 2.0 + j, 5.0));
  if (pat < 4.5) return mod(floor(i / 2.0) + floor(j / 2.0), 2.0);
  if (pat < 5.5) { float a = abs(mod(i, 12.0) - 6.0), b = abs(mod(j, 12.0) - 6.0); return step(mod(a + b, 4.0), 1.5); }
  if (pat < 6.5) return step(mod(i + 2.0 * j, 6.0), 2.5);
  return step(0.5, mod(i - j + 600.0, 3.0));
}
float motif(vec2 id, float m){
  float i = id.x, j = id.y;
  if (m < 0.5) return step(0.5, fract(j / 18.0)) * step(0.2, fract(j / 6.0)) + step(0.9, fract(j / 18.0));
  if (m < 1.5) { float a = abs(mod(i, 20.0) - 10.0); return step(0.5, fract((a + j) / 14.0)); }
  if (m < 2.5) { float a = abs(mod(i, 18.0) - 9.0) / 9.0, b = abs(mod(j, 24.0) - 12.0) / 12.0; float r = a + b; return step(r, 0.95) * step(0.45, r) + step(r, 0.18); }
  if (m < 3.5) return mod(floor(i / 6.0) + floor(j / 8.0), 2.0);
  if (m < 4.5) return step(0.55, fract((i + j * 0.7) / 13.0));
  if (m < 5.5) { float c = mod(floor(i / 3.0) + floor(j / 3.0), 2.0); float big = mod(floor(i / 9.0) + floor(j / 12.0), 2.0); return big > 0.5 ? c : 1.0 - step(0.5, fract(j / 12.0)); }
  if (m < 6.5) { float a = abs(mod(j, 28.0) - 14.0); return step(abs(mod(i, 16.0) - 8.0), a * 0.6) * step(1.0, a); }
  return step(0.5, fract(j / 7.0)) * step(0.6, fract(i / 10.0)) + step(0.92, fract(j / 21.0));
}
void main(){
  if (vUv.y > uFell) discard;
  vec2 cell = vUv * uCells; vec2 id = floor(cell); vec2 f = fract(cell); float fw0 = max(fwidth(cell.x), fwidth(cell.y)); float lod0 = smoothstep(0.22, 0.6, fw0);
  float pat = uPat; vec3 weft; float glossy = 0.0;
  if (uMode < 0.5) { float mt = motif(id, uMotif); weft = mix(uB, uA, clamp(mt, 0.0, 1.0)); }
  else if (uMode < 1.5) { float t = texture2D(uTex, (id + 0.5) / uCells).r; float tf = texture2D(uTex, vUv).r; float mt = mix(step(0.5, t), smoothstep(0.32, 0.68, tf), lod0); weft = mix(uB, uA, mt); pat = mt > 0.5 ? 3.0 : 1.0; glossy = mt; }
  else if (uMode < 2.5) {
    vec2 mg = vec2(0.08, 0.045); vec2 q = (vUv - mg) / (1.0 - 2.0 * mg);
    weft = uB; pat = 1.0;
    if (q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0) {
      vec2 g = q * uTexN; vec2 gi = floor(g); vec2 gf = fract(g);
      vec4 tc = texture2D(uTex, (gi + 0.5) / uTexN);
      float inside = step(0.1, gf.x) * step(gf.x, 0.9) * step(0.14, gf.y) * step(gf.y, 0.86);
      float hr = 1.0 - step(0.5, abs(gi.y - uHi.y)), hc = 1.0 - step(0.5, abs(gi.x - uHi.x)), hl = max(hr, hc) * uHi.z;
      if (tc.a > 0.5 && inside > 0.5) { weft = tc.rgb * (0.95 + 0.6 * hl); pat = 3.0; glossy = 1.0; }
      else weft = uB * (1.0 + 1.6 * hl) + vec3(0.05, 0.04, 0.02) * hl;
    }
  } else {
    float b = clamp(floor(vUv.y * 3.0), 0.0, 2.0);
    weft = b < 0.5 ? uC : (b < 1.5 ? uB : uA); pat = b < 0.5 ? 5.0 : (b < 1.5 ? 2.0 : 3.0); glossy = b > 1.5 ? 1.0 : 0.0;
    float onb = (1.0 - step(0.5, abs(b - uBand))) * step(-0.5, uBand); weft *= 1.0 + 0.5 * onb;
    if (uBand > -0.5 && onb < 0.5) weft *= 0.55;
    float fy = fract(vUv.y * 3.0); if ((fy < 0.02 && b > 0.5) || fy > 0.98) weft = vec3(0.12, 0.11, 0.18);
  }
  float px = f.x * 2.0 - 1.0, py = f.y * 2.0 - 1.0;
  float ppf = sqrt(max(0.0, 1.0 - px * px)), wpf = sqrt(max(0.0, 1.0 - py * py));
  float fw = max(fwidth(cell.x), fwidth(cell.y));
  float lod = smoothstep(0.3, 0.72, fw);
  // holes: picks pulled out, bare warp left standing
  float fr = (hash(vec2(id.x, 7.0)) - 0.5) * 0.01;
  if ((vUv.y > uHoles.x + fr && vUv.y < uHoles.y - fr) || (vUv.y > uHoles.z + fr && vUv.y < uHoles.w - fr)) {
    if (mod(id.x, 2.0) > 0.5 || abs(px) > 0.55 + lod * 0.4) discard;
    gl_FragColor = vec4(uWarp * 1.7 * (0.5 + 0.6 * ppf) * uDim * vLit, 1.0); return;
  }
  float over = structure(id, pat);
  float sheen = 0.5 + 0.5 * sin((vPos.x * 0.55 + vPos.y * 0.3) - uTime * 0.35);
  vec3 c; float spec;
  if (over > 0.5) { c = weft * (0.36 + 0.74 * wpf); spec = pow(wpf, 9.0) * (0.32 + 0.45 * glossy); }
  else { c = uWarp * (0.36 + 0.74 * ppf); spec = pow(ppf, 9.0) * 0.22; }
  float gap = over > 0.5 ? smoothstep(0.0, 0.16, 1.0 - abs(py)) : smoothstep(0.0, 0.16, 1.0 - abs(px));
  c *= mix(0.5, 1.0, gap);
  c += spec * (0.4 + 0.9 * sheen) * mix(vec3(1.0, 0.94, 0.84), weft, 0.35);
  float cov = pat > 2.5 && pat < 3.5 ? 0.8 : 0.5;
  vec3 avg = mix(uWarp, weft, cov) * 0.74 + (0.06 + 0.16 * sheen) * weft * (0.4 + 0.5 * glossy);
  c = mix(c, avg, lod);
  c *= vLit * 1.12;
  vec2 dp = (vUv - uPtr.xy) * uSize; c *= 1.0 + uPtr.z * 0.6 * exp(-dot(dp, dp) * 0.8);
  float df = (uFell - vUv.y) * uSize.y;
  c += vec3(1.0, 0.72, 0.38) * exp(-df * 9.0) * 0.45 * uFellGlow;
  float edge = smoothstep(0.0, 0.012, vUv.x) * smoothstep(0.0, 0.012, 1.0 - vUv.x) * smoothstep(0.0, 0.008, vUv.y);
  c *= mix(0.45, 1.0, edge);
  c = c * uDim + weft * uGlow * 0.16;
  gl_FragColor = vec4(c, 1.0);
}`;

const PT_VS = `
attribute float aSize; attribute float aA; uniform float uDpr;
varying vec3 vC; varying float vA;
void main(){ vC = color; vA = aA; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uDpr; }`;
const PT_FS = `
varying vec3 vC; varying float vA;
void main(){
  vec2 q = gl_PointCoord * 2.0 - 1.0; q.y *= 3.2;
  float d = dot(q, q); float core = exp(-d * 5.0); float halo = exp(-length(q) * 2.4) * 0.45;
  float a = (core + halo) * vA; if (a < 0.004) discard;
  gl_FragColor = vec4(mix(vC, vec3(1.0), core * 0.55) * (0.9 + core), a);
}`;
const RB_VS = `
attribute vec4 aCol; attribute float aSide; varying vec4 vC; varying float vS;
void main(){ vC = aCol; vS = aSide; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }`;
const RB_FS = `
varying vec4 vC; varying float vS;
void main(){ float k = 1.0 - vS * vS; float core = k * k * k; float a = (core * 0.95 + k * 0.3) * vC.a; gl_FragColor = vec4(vC.rgb * (0.75 + core * 0.8), a); }`;

// ---------------- style ----------------
const CSS = `
.lmw { --gold:#f0c987; --silk:#efe6d2; --mut:#b3aa98; background: radial-gradient(125% 95% at 50% 30%, #1b2346 0%, #0f1329 44%, #07080f 100%);
  color:var(--silk); font-family:"Hanken Grotesk", ui-sans-serif, sans-serif; -webkit-font-smoothing:antialiased; }
.lmw * { box-sizing:border-box; }
.lmw .lm-cv { position:absolute; inset:0; width:100%; height:100%; display:block; touch-action:none; }
.lmw .lm-vig { position:absolute; inset:0; pointer-events:none; background: radial-gradient(120% 95% at 50% 42%, rgba(0,0,0,0) 52%, rgba(3,3,9,.62) 100%); }
.lmw .lm-sr { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; margin:0; }
.lmw button { font:inherit; color:inherit; }
.lmw :focus-visible { outline:1.5px solid var(--gold); outline-offset:3px; }
.lmw .lm-ov { position:absolute; opacity:0; visibility:hidden; transition:opacity .4s ease, visibility 0s linear .4s; }
.lmw[data-st=home] .lm-home, .lmw[data-st=work] .lm-work, .lmw[data-st=case] .lm-read, .lmw[data-st=station] .lm-read,
.lmw[data-st=case] .lm-case, .lmw[data-st=station] .lm-stx { opacity:1; visibility:visible; transition:opacity .55s ease var(--ovd,0s), visibility 0s; }
.lmw .lm-case, .lmw .lm-stx { inset:0; pointer-events:none; }
/* arrival */
.lmw .lm-home { left:50%; transform:translateX(-50%); width:min(1040px, calc(100% - 32px)); text-align:center; }
.lmw .lm-sig { margin:0 0 10px; font:italic 500 19px/1.3 "Cormorant Garamond", serif; color:#d9c39b; letter-spacing:.01em; }
.lmw .lm-lead { margin:0 0 12px; font:500 clamp(28px, 2.75vw, 42px)/1.06 "Cormorant Garamond", serif; color:#fbf3e2; letter-spacing:-.005em; text-wrap:balance; }
.lmw .lm-lede { margin:0 auto 16px; max-width:600px; font-size:15.5px; line-height:1.55; color:#b9b1a2; text-wrap:balance; }
.lmw .lm-gorow { display:flex; gap:30px; justify-content:center; flex-wrap:wrap; }
.lmw .lm-tl { background:none; border:0; cursor:pointer; padding:2px 0 5px; font:500 22px/1.2 "Cormorant Garamond", serif; color:var(--gold);
  background-image:linear-gradient(90deg, rgba(240,201,135,.0), rgba(240,201,135,.9) 18%, rgba(240,201,135,.9) 82%, rgba(240,201,135,0)); background-size:100% 1px; background-repeat:no-repeat; background-position:0 100%; transition:color .2s, letter-spacing .3s; }
.lmw .lm-tl::after { content:' →'; }
.lmw .lm-tl:hover { color:#fff1d3; letter-spacing:.01em; }
.lmw .lm-tl2 { color:#d8cdb8; }
.lmw .lm-hint { margin:22px 0 0; font:italic 400 16px "Cormorant Garamond", serif; color:#9a95ab; transition:opacity .8s; }
.lmw .lm-hint.gone { opacity:0; }
/* gallery */
.lmw .lm-work { inset:0; pointer-events:none; }
.lmw .lm-ghead { position:absolute; left:44px; top:84px; pointer-events:none; }
.lmw .lm-ghead h2 { margin:0; font:500 44px/1 "Cormorant Garamond", serif; color:#fbf3e2; }
.lmw .lm-ghead p { margin:6px 0 0; font:italic 400 18px "Cormorant Garamond", serif; color:#b4ab99; }
.lmw .lm-gone { position:absolute; left:50%; bottom:86px; transform:translateX(-50%); width:min(720px, calc(100% - 40px)); margin:0; text-align:center;
  font:italic 400 20px/1.3 "Cormorant Garamond", serif; color:#e9dcc0; min-height:26px; }
.lmw .lm-glab { position:absolute; left:0; top:0; pointer-events:auto; background:none; border:0; padding:4px 2px 6px; cursor:pointer; text-align:center; color:var(--silk); will-change:transform; }
.lmw .lm-glab b { display:block; font:600 19px/1.05 "Cormorant Garamond", serif; transition:color .2s; }
.lmw .lm-glab i { display:block; margin-top:4px; font:italic 400 14px/1.15 "Cormorant Garamond", serif; color:#9d9583; }
.lmw .lm-glab.hot b, .lmw .lm-glab:hover b { color:var(--gold); }
/* case extras */
.lmw .lm-ag { position:absolute; left:0; top:0; font:500 11px/1 "Hanken Grotesk", sans-serif; letter-spacing:.04em; writing-mode:vertical-rl; white-space:nowrap; opacity:.9; will-change:transform; }
.lmw .lm-agr { writing-mode:horizontal-tb; font:italic 500 15px "Cormorant Garamond", serif; color:#dfe6ff !important; letter-spacing:0; }
.lmw .lm-hl { position:absolute; left:0; top:0; padding:3px 12px; font:italic 600 21px "Cormorant Garamond", serif; color:#fff3dd; white-space:nowrap; opacity:0; transition:opacity .4s;
  background:radial-gradient(closest-side, rgba(8,9,20,.85), rgba(8,9,20,0)); text-shadow:0 1px 3px #000; }
.lmw .lm-rh { position:absolute; left:0; top:0; font:italic 500 17px "Cormorant Garamond", serif; color:#f5d9a6; white-space:nowrap; opacity:0; transition:opacity .5s; }
.lmw .lm-cap { position:absolute; left:0; top:0; margin:0; pointer-events:none; opacity:0; font:italic 500 19px/1.2 "Cormorant Garamond", serif; color:#ffd9c9;
  text-shadow:0 0 18px rgba(255,120,90,.45), 0 1px 2px rgba(0,0,0,.6); white-space:nowrap; z-index:3; }
/* reading surface: a length of linen that unrolls */
.lmw .lm-read { right:40px; top:92px; bottom:92px; width:min(660px, calc(50vw - 56px)); z-index:2; }
.lmw.is-case .lm-read { width:min(740px, calc(58vw - 60px)); }
.lmw .lm-sheet { --acc:#e8b86a; --dye:#86663a; position:absolute; inset:0; color:#1f1c27; border-radius:1px;
  background-color:#e6dcc6;
  background-image: radial-gradient(130% 80% at 25% 0%, rgba(255,251,238,.6), rgba(255,251,238,0) 62%),
    repeating-linear-gradient(0deg, rgba(92,64,26,.06) 0 1px, rgba(0,0,0,0) 1px 3px),
    repeating-linear-gradient(90deg, rgba(92,64,26,.05) 0 1px, rgba(0,0,0,0) 1px 3px),
    linear-gradient(180deg, #ebe2cf 0%, #ddd0b5 100%);
  box-shadow: 0 40px 90px rgba(0,0,0,.6), 0 0 60px rgba(255,190,110,.06); }
.lmw .lm-sheet::before { content:''; position:absolute; left:8px; right:8px; top:-15px; height:15px; pointer-events:none;
  background:repeating-linear-gradient(90deg, rgba(232,221,198,.8) 0 1px, rgba(0,0,0,0) 1px 4px); -webkit-mask-image:linear-gradient(to top,#000,rgba(0,0,0,0)); mask-image:linear-gradient(to top,#000,rgba(0,0,0,0)); }
.lmw .lm-sheet::after { content:''; position:absolute; left:8px; right:8px; bottom:-12px; height:12px; pointer-events:none;
  background:repeating-linear-gradient(90deg, rgba(221,208,181,.75) 0 1px, rgba(0,0,0,0) 1px 4px); -webkit-mask-image:linear-gradient(to bottom,#000,rgba(0,0,0,0)); mask-image:linear-gradient(to bottom,#000,rgba(0,0,0,0)); }
.lmw .lm-selv { position:absolute; top:0; bottom:0; width:6px; z-index:1; pointer-events:none; opacity:.6;
  background:repeating-linear-gradient(180deg, var(--dye) 0 2px, rgba(0,0,0,0) 2px 4px); }
.lmw .lm-selv.l { left:0; } .lmw .lm-selv.r { right:0; }
.lmw .lm-fellbar { position:absolute; left:-10px; right:-10px; top:0; height:3px; opacity:0; pointer-events:none; z-index:3;
  background:linear-gradient(90deg, rgba(255,213,154,0), #ffd59a 12%, #fff4dc 50%, #ffd59a 88%, rgba(255,213,154,0)); box-shadow:0 0 22px 5px rgba(255,196,120,.5); }
@keyframes lmUnroll { from { clip-path:inset(-20px -2px 100% -2px); } to { clip-path:inset(-20px -2px -14px -2px); } }
@keyframes lmFell { 0% { top:0; opacity:1; } 88% { opacity:1; } 100% { top:100%; opacity:0; } }
@keyframes lmIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
.lmw .lm-read.unroll .lm-sheet { animation:lmUnroll 1.1s cubic-bezier(.33,.6,.16,1) var(--ud,0s) both; }
.lmw .lm-read.unroll .lm-fellbar { animation:lmFell 1.1s cubic-bezier(.33,.6,.16,1) var(--ud,0s) both; }
.lmw .lm-read.unroll .lm-scroll > * { animation:lmIn .7s ease var(--sd,0s) both; }
.lmw .lm-scroll { position:absolute; inset:0; overflow-y:auto; overscroll-behavior:contain; padding:46px 54px 60px; touch-action:pan-y;
  scrollbar-width:thin; scrollbar-color:rgba(70,48,20,.4) rgba(0,0,0,0); outline:none; }
.lmw .lm-chead { margin-bottom:6px; }
.lmw .lm-kick { margin:0 0 6px; font:italic 500 18px/1.3 "Cormorant Garamond", serif; color:var(--dye); }
.lmw .lm-title { margin:0; font:600 clamp(40px, 4.2vw, 62px)/.95 "Cormorant Garamond", serif; color:#16131d; letter-spacing:-.012em; outline:none; }
.lmw .lm-one { margin:14px 0 0; font:500 23px/1.22 "Cormorant Garamond", serif; color:#2b2632; text-wrap:pretty; }
.lmw .lm-woven { margin:14px 0 0; padding-left:14px; font-size:13.5px; line-height:1.5; color:#4d4552; border-left:2px solid var(--acc); }
.lmw .lm-golinks { margin:16px 0 0; display:flex; flex-wrap:wrap; gap:6px 22px; }
.lmw .lm-sheet a { color:#2a1f12; text-decoration:none; background-image:linear-gradient(var(--dye), var(--dye)); background-size:100% 1px; background-repeat:no-repeat; background-position:0 100%; padding-bottom:1px; transition:color .2s, background-size .3s; }
.lmw .lm-sheet a:hover { color:var(--dye); }
.lmw .lm-golinks a { font:600 14.5px "Hanken Grotesk", sans-serif; }
.lmw .lm-band { display:block; height:9px; margin:38px 0 14px; opacity:.85;
  background-image:repeating-linear-gradient(90deg, rgba(20,14,8,.22) 0 1px, rgba(0,0,0,0) 1px 3px), repeating-linear-gradient(135deg, rgba(255,255,255,.18) 0 2px, rgba(0,0,0,0) 2px 5px), linear-gradient(var(--dye), var(--dye)); }
.lmw .lm-sec > .lm-band { width:72px; height:7px; margin:40px 0 10px; }
.lmw .lm-h { margin:0 0 12px; font:italic 500 30px/1.05 "Cormorant Garamond", serif; color:#1b1720; }
.lmw .lm-hsub { margin-left:12px; font:italic 400 17px "Cormorant Garamond", serif; color:#7b6f68; }
.lmw .lm-p { margin:0 0 10px; font-size:15.5px; line-height:1.62; color:#2c2832; text-wrap:pretty; }
.lmw .lm-big { font-size:17px; line-height:1.6; color:#221e28; }
.lmw .lm-role { margin:0; font:italic 500 22px/1.38 "Cormorant Garamond", serif; color:#231d25; }
.lmw .lm-cons { margin:0; padding:0; list-style:none; }
.lmw .lm-cons li { position:relative; padding:9px 0 9px 34px; font-size:15.5px; line-height:1.55; color:#2c2832; border-top:1px dashed rgba(40,30,20,.22); }
.lmw .lm-cons li:first-child { border-top:0; }
.lmw .lm-cons li::before { content:''; position:absolute; left:0; top:20px; width:22px; height:2px; background:var(--dye); }
.lmw .lm-cons li::after { content:''; position:absolute; left:19px; top:17px; width:7px; height:7px; border-radius:50%; background:var(--dye); }
.lmw .lm-it, .lmw .lm-dec, .lmw .lm-ev { padding:14px 0 6px; border-top:1px dashed rgba(40,30,20,.24); }
.lmw .lm-sec > .lm-it:first-of-type, .lmw .lm-sec > .lm-dec:first-of-type, .lmw .lm-sec > .lm-ev:first-of-type { border-top:0; padding-top:2px; }
.lmw .lm-it h4, .lmw .lm-ev h4 { margin:0 0 5px; font:600 16px/1.35 "Hanken Grotesk", sans-serif; color:#18151d; }
.lmw .lm-dec h4 { margin:0 0 8px; font:600 22px/1.2 "Cormorant Garamond", serif; color:#18151d; }
.lmw .lm-dec b { font-weight:600; color:#18151d; }
.lmw .lm-trade { color:#4a4250; }
.lmw .lm-ev time { display:block; margin-bottom:3px; font:italic 500 16px "Cormorant Garamond", serif; color:var(--dye); }
/* the weave: each step is a pick, the thread passes over, then under */
.lmw .lm-weave { list-style:none; margin:0; padding:0; position:relative; }
.lmw .lm-weave li { position:relative; padding:4px 0 14px 66px; min-height:56px; }
.lmw .lm-weave li::before { content:''; position:absolute; left:22px; top:0; bottom:0; width:3px; background:var(--dye); border-radius:2px; z-index:1; }
.lmw .lm-weave li::after { content:''; position:absolute; left:8px; top:14px; width:31px; height:9px; border-radius:2px; background:#c9b997;
  background-image:repeating-linear-gradient(90deg, rgba(60,40,15,.25) 0 1px, rgba(0,0,0,0) 1px 3px); box-shadow:0 1px 0 rgba(255,255,255,.4) inset, 0 1px 2px rgba(0,0,0,.18); z-index:2; }
.lmw .lm-weave li.over::after { z-index:0; }
.lmw .lm-weave li.over::before { box-shadow:0 0 0 2px #e6dcc6; z-index:1; }
.lmw .lm-pick { position:absolute; left:46px; top:4px; transform:translateX(-50%); font:600 17px/1 "Cormorant Garamond", serif; color:var(--dye); }
.lmw .lm-weave h4 { margin:0 0 4px; font:600 20px/1.2 "Cormorant Garamond", serif; color:#18151d; }
.lmw .lm-weave-s li { min-height:40px; padding-bottom:6px; }
.lmw .lm-weave-s li .lm-p { padding-top:4px; }
/* numbers as woven labels on a thread */
.lmw .lm-tags { display:grid; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:26px 18px; padding-top:14px; }
.lmw .lm-tag { position:relative; padding:18px 16px 14px; background:rgba(255,253,246,.52); transform:rotate(var(--rot,0deg));
  outline:1px dashed rgba(60,40,20,.35); outline-offset:-6px; box-shadow:0 6px 14px rgba(60,40,10,.12); }
.lmw .lm-tag::before { content:''; position:absolute; left:50%; top:-14px; width:1px; height:20px; background:var(--dye); }
.lmw .lm-tag::after { content:''; position:absolute; left:calc(50% - 3px); top:3px; width:6px; height:6px; border-radius:50%; background:#d9ccb0; box-shadow:inset 0 1px 1px rgba(0,0,0,.3); }
.lmw .lm-tag b { display:block; font:600 34px/1 "Cormorant Garamond", serif; color:#16131d; font-variant-numeric:lining-nums; }
.lmw .lm-tag b.long { font-size:27px; white-space:nowrap; }
.lmw .lm-tag span { display:block; margin-top:6px; font-size:13px; line-height:1.4; color:#3b3540; }
.lmw .lm-tag i { display:block; margin-top:6px; font:italic 500 14px "Cormorant Garamond", serif; color:var(--dye); }
.lmw .lm-stack { margin:0; font:500 19px/1.55 "Cormorant Garamond", serif; color:#2a2530; }
.lmw .lm-dot { color:var(--dye); }
.lmw .lm-links { display:flex; flex-direction:column; align-items:flex-start; gap:8px; margin:0; }
.lmw .lm-links a { font:500 19px/1.3 "Cormorant Garamond", serif; }
.lmw .lm-fray { position:relative; margin:0 0 12px; padding-left:20px; font-size:15px; line-height:1.6; color:#3a3340;
  background:repeating-linear-gradient(180deg, var(--dye) 0 3px, rgba(0,0,0,0) 3px 6px) 0 0/2px 100% no-repeat; }
.lmw .lm-pager { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:44px; padding-top:18px; border-top:1px solid rgba(40,30,20,.3); }
.lmw .lm-pager button { background:none; border:0; cursor:pointer; padding:6px 0; font:500 19px "Cormorant Garamond", serif; color:#2a1f12; }
.lmw .lm-pager button:hover { color:var(--dye); }
.lmw .lm-pager .lm-all { font-style:italic; color:#6b5e55; }
/* stations */
.lmw .lm-pr, .lmw .lm-wd { outline:none; }
.lmw .lm-pr > .lm-band, .lmw .lm-wd > .lm-band, .lmw .lm-contact > .lm-band { width:72px; height:7px; margin:40px 0 12px; }
.lmw .lm-prk { margin:0 0 10px; font:600 30px/1.08 "Cormorant Garamond", serif; color:#17141c; }
.lmw .lm-pr:hover .lm-prk, .lmw .lm-pr:focus .lm-prk { color:var(--dye); }
.lmw .lm-gauge { position:relative; height:104px; margin:22px 0 10px; }
.lmw .lm-gline { position:absolute; left:0; right:0; top:52px; height:2px; background:#5a4a3a; opacity:.45; }
.lmw .lm-gcut { position:absolute; top:48px; height:10px; background:repeating-linear-gradient(90deg, rgba(180,70,50,.75) 0 2px, rgba(0,0,0,0) 2px 5px); }
.lmw .lm-gmark { position:absolute; top:0; transform:translateX(-50%); text-align:center; white-space:nowrap; }
.lmw .lm-gmark b { display:block; font:600 26px/1 "Cormorant Garamond", serif; color:#16131d; }
.lmw .lm-gmark i { display:block; font:italic 500 14px "Cormorant Garamond", serif; color:#5b4f4a; }
.lmw .lm-gmark.meas { top:64px; } .lmw .lm-gmark.meas::before { content:''; position:absolute; left:50%; top:-12px; width:2px; height:12px; background:#b34a35; }
.lmw .lm-gmark.gate::after { content:''; position:absolute; left:50%; top:48px; width:10px; height:10px; margin-left:-5px; border-radius:50%; background:#16131d; }
.lmw .lm-cuts { display:flex; align-items:center; gap:26px; flex-wrap:wrap; margin:18px 0 10px; }
.lmw .lm-cutrow { display:flex; gap:9px; }
.lmw .lm-cutt { position:relative; width:3px; height:48px; background:linear-gradient(180deg, #5a4a3a 0 40%, rgba(0,0,0,0) 40% 60%, #5a4a3a 60%); opacity:.75; border-radius:2px; }
.lmw .lm-cutn b { display:block; font:600 34px/1 "Cormorant Garamond", serif; color:#16131d; }
.lmw .lm-cutn i { font:italic 500 15px "Cormorant Garamond", serif; color:#5b4f4a; }
.lmw .lm-note { margin-top:12px; color:#4e4652; font-size:14.5px; }
.lmw .lm-draft { margin-top:18px; }
.lmw .lm-drow { display:grid; grid-template-columns:1fr repeat(8, 30px); align-items:center; min-height:30px; }
.lmw .lm-dhead { align-items:end; height:120px; }
.lmw .lm-dcol { position:relative; height:120px; }
.lmw .lm-dcol span { position:absolute; left:50%; bottom:6px; transform-origin:0 50%; transform:rotate(-58deg); white-space:nowrap; font:italic 500 15px "Cormorant Garamond", serif; color:#3a3036; }
.lmw .lm-dgroup { margin:20px 0 4px; font:italic 600 21px "Cormorant Garamond", serif; color:var(--dye); border-bottom:1px solid rgba(40,30,20,.25); padding-bottom:4px; }
.lmw .lm-dsk { padding-right:14px; font-size:13.5px; line-height:1.3; color:#2c2832; }
.lmw .lm-dc { justify-self:center; width:20px; height:20px; position:relative; }
.lmw span.lm-dc::after { content:''; position:absolute; left:9px; top:9px; width:2px; height:2px; border-radius:50%; background:rgba(40,30,20,.3); }
.lmw button.lm-dc { border:0; padding:0; cursor:pointer; background-color:var(--sw); filter:saturate(1.1) brightness(.92);
  background-image:repeating-linear-gradient(45deg, rgba(0,0,0,.22) 0 1px, rgba(0,0,0,0) 1px 3px), repeating-linear-gradient(-45deg, rgba(255,255,255,.18) 0 1px, rgba(0,0,0,0) 1px 4px);
  box-shadow:0 0 0 1px rgba(40,30,20,.35); transition:transform .15s; }
.lmw button.lm-dc:hover, .lmw button.lm-dc:focus-visible { transform:scale(1.25); }
.lmw .lm-plist { display:none; }
.lmw .lm-pli { padding:8px 0; border-top:1px dashed rgba(40,30,20,.22); }
.lmw .lm-pli h4 { margin:0 0 3px; font:600 14.5px/1.35 "Hanken Grotesk", sans-serif; color:#1b1720; }
.lmw .lm-plinks { margin:0; font:500 17px/1.4 "Cormorant Garamond", serif; }
.lmw .lm-plinks button { background:none; border:0; padding:0; cursor:pointer; color:#2a1f12; border-bottom:2px solid var(--sw); }
.lmw .lm-avail { margin:6px 0 0; font:italic 600 19px "Cormorant Garamond", serif; color:var(--dye); }
.lmw .lm-facts { margin:0; display:grid; grid-template-columns:120px 1fr; }
.lmw .lm-facts dt { padding:10px 12px 10px 0; font:italic 500 17px "Cormorant Garamond", serif; color:var(--dye); border-top:1px dashed rgba(40,30,20,.22); }
.lmw .lm-facts dd { margin:0; padding:10px 0; font-size:15px; line-height:1.5; color:#2c2832; border-top:1px dashed rgba(40,30,20,.22); }
.lmw .lm-mail { display:inline-block; margin:6px 0 6px; font:600 clamp(26px, 2.6vw, 36px)/1.15 "Cormorant Garamond", serif !important; word-break:break-all; }
.lmw .lm-msub { margin:4px 0 22px; font:italic 500 16px "Cormorant Garamond", serif; color:#6b5e55; }
/* selvedge index */
.lmw .lm-nav { position:absolute; left:50%; bottom:16px; transform:translateX(-50%); display:flex; align-items:center; gap:6px; z-index:4; }
.lmw .lm-arr { width:38px; height:38px; background:none; border:0; cursor:pointer; font:400 30px/1 "Cormorant Garamond", serif; color:#e7cf9f; transition:opacity .2s, color .2s; }
.lmw .lm-arr:hover { color:#fff1d0; }
.lmw .lm-arr:disabled { opacity:.25; cursor:default; }
.lmw .lm-track { position:relative; display:flex; }
.lmw .lm-track::before { content:''; position:absolute; left:6px; right:6px; top:13px; height:1px;
  background:linear-gradient(90deg, rgba(232,190,120,0), rgba(232,190,120,.75) 10%, rgba(232,190,120,.75) 90%, rgba(232,190,120,0)); }
.lmw .lm-knot { position:relative; width:94px; height:46px; background:none; border:0; cursor:pointer; padding:24px 0 0; color:#a49c8b; font:italic 500 15px/1 "Cormorant Garamond", serif; white-space:nowrap; transition:color .25s; }
.lmw .lm-knot::before { content:''; position:absolute; left:50%; top:9px; width:9px; height:9px; margin-left:-4.5px; border-radius:50%; background:#1c1f35; box-shadow:0 0 0 1px rgba(232,190,120,.8); transition:background .25s, box-shadow .25s; }
.lmw .lm-knot:hover { color:#efe2c4; }
.lmw .lm-knot.on { color:#fbe8c2; }
.lmw .lm-knot.on::before { background:#f4cd85; box-shadow:0 0 0 1px #f4cd85, 0 0 14px 4px rgba(244,205,133,.55); }
.lmw .lm-shut { position:absolute; left:0; top:10px; width:30px; height:7px; border-radius:50%; pointer-events:none; z-index:1;
  background:radial-gradient(closest-side, #fff7e6, rgba(255,214,150,.85) 45%, rgba(255,190,110,0)); transition:transform .9s cubic-bezier(.6,0,.2,1); }
.lmw .lm-navcur { display:none; }
/* phone */
.lmw.is-phone .lm-sig { font-size:16px; margin-bottom:8px; }
.lmw.is-phone .lm-lead { font-size:27px; }
.lmw.is-phone .lm-lede { font-size:14px; line-height:1.5; margin-bottom:12px; }
.lmw.is-phone .lm-tl { font-size:20px; }
.lmw.is-phone .lm-gorow { gap:8px 22px; }
.lmw.is-phone .lm-hint { display:none; }
.lmw.is-phone .lm-ag { display:none; }
.lmw.is-phone .lm-ghead { left:18px; top:80px; }
.lmw.is-phone .lm-ghead h2 { font-size:32px; }
.lmw.is-phone .lm-ghead p { font-size:16px; max-width:300px; }
.lmw.is-phone .lm-gone { bottom:96px; font-size:17px; }
.lmw.is-phone .lm-glab b { font-size:11.5px; line-height:1.05; letter-spacing:-.01em; }
.lmw.is-phone .lm-glab i { font-size:12px; margin-top:2px; }
.lmw.is-phone .lm-read, .lmw.is-phone.is-case .lm-read { left:10px; right:10px; width:auto; top:30.5%; bottom:78px; }
.lmw.is-phone .lm-scroll { padding:28px 22px 44px; }
.lmw.is-phone .lm-title { font-size:40px; }
.lmw.is-phone .lm-one { font-size:20px; }
.lmw.is-phone .lm-h { font-size:26px; }
.lmw.is-phone .lm-hsub { display:block; margin:2px 0 0; font-size:15px; }
.lmw.is-phone .lm-p { font-size:15px; }
.lmw.is-phone .lm-weave li { padding-left:56px; }
.lmw.is-phone .lm-tags { grid-template-columns:1fr 1fr; gap:22px 12px; }
.lmw.is-phone .lm-tag { padding:16px 10px 12px; }
.lmw.is-phone .lm-tag b { font-size:26px; }
.lmw.is-phone .lm-draft { display:none; }
.lmw.is-phone .lm-plist { display:block; }
.lmw.is-phone .lm-facts { grid-template-columns:96px 1fr; }
.lmw.is-phone .lm-pager button { font-size:16px; }
.lmw.is-phone .lm-nav { bottom:8px; gap:0; justify-content:center; }
.lmw.is-phone .lm-knot { width:34px; height:40px; }
.lmw.is-phone .lm-knot span { display:none; }
.lmw.is-phone .lm-navcur { display:block; position:absolute; left:50%; bottom:40px; transform:translateX(-50%); white-space:nowrap; font:italic 500 15px "Cormorant Garamond", serif; color:#f3dfb6; pointer-events:none; }
.lmw.is-phone .lm-cap { font-size:16px; }
.lmw.is-phone .lm-hl { display:none; }
@media (prefers-reduced-motion: reduce) { .lmw .lm-shut { transition:none; } .lmw .lm-ov { transition:none !important; } }
`;
