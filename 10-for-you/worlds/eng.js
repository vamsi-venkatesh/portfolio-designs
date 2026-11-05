// World: eng — "The machine, running."
// The eight products as an exploded-view mechanism on one shaft, drawn in hairlines on instrument graphite.
// Every count shown is a real count from content.mjs; the motion is a drawing of those counts, not live telemetry.
import * as THREE from '../../vendor/three.module.js';

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Martian+Mono:wght@300;400;500&family=Schibsted+Grotesk:wght@400;500;600&display=swap';
const BG = '#0a0c0b';

// test suites: exact numbers + wording from content.mjs (each is asserted against the item text at mount)
const SUITES = {
  'vvdex-platform': [{ n: 550, label: 'automated tests', src: '550' }],
  'vvdex-engine':   [{ n: 1429, label: 'automated tests', src: '1,429' }],
  'pitchradar':     [{ n: 620, label: 'tests in CI, every push', src: '620 tests in CI on every push' }],
  'farmquick':      [{ n: 408, label: 'tests on the public engine', src: '408 tests on the public engine' }],
  'unboundpdf':     [{ n: 511, label: 'Workspace checks, none failing', src: '511 Workspace checks, none failing' },
                     { n: 124, label: 'benchmark runs, 3 browser engines', src: '124', ring: true }],
};
const READOUT = { // non-suite subsystems: one approved number each
  'conxto': ['1,061,623', 'job postings collected'],
  'conxfolio': ['37', 'résumé designs'],
  'vvdex-trading': ['2,028', 'dated calls · paper only'],
};
const SYN = {
  test: ['test', 'benchmark', 'corpus gate', 'audit'],
  check: ['check', 'checked', 'checksum', 'verif', 'test'],
  agent: ['agent', 'reviewer', 'crew'],
  privacy: ['never leaves', 'upload', 'encrypted', 'own browser'],
  private: ['never leaves', 'upload', 'encrypted', 'private'],
  seal: ['sealed', 'seal', 'sandbox', 'containment'],
  sealed: ['sealed', 'seal', 'sandbox'],
  proof: ['signed', 'receipt', 'sha-256', 'hash', 'evidence', 'sealed'],
  hash: ['hash', 'sha-256', 'chain', 'digest'],
  human: ['person', 'you send', 'owner', 'waits for you', 'human'],
  model: ['model', 'language model'],
  browser: ['browser', 'tab'],
  rules: ['rule', 'threshold', 'deterministic'],
};

export default {
  id: 'eng',
  color: BG,
  async mount(root, ctx) {
    const { person, work, principles, withdrawn } = ctx;
    const isData = ctx.audience === 'data';
    const reduced = !!ctx.reduced;
    const cleanup = [];
    const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); cleanup.push(() => t.removeEventListener(ev, fn, opt)); };
    const el = (tag, cls, text, parent) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; if (parent) parent.appendChild(n); return n; };
    const fmt = (n) => Math.round(n).toLocaleString('en-US');

    // ---------- fonts + style ----------
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = FONT_HREF; document.head.appendChild(link);
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

    const rootClass = root.className;
    root.classList.add('engw');
    if (isData) root.classList.add('is-data');
    if (reduced) root.classList.add('reduced');
    const vp = () => ({ W: root.clientWidth || innerWidth, H: root.clientHeight || innerHeight });
    let { W, H } = vp();
    let phone = W < 760;

    // ---------- products in shaft order ----------
    const bySlug = Object.fromEntries(work.map(w => [w.slug, w]));
    const ORDER = isData
      ? ['vvdex-trading', 'vvdex-platform', 'vvdex-engine', 'pitchradar', 'farmquick', 'unboundpdf', 'conxto', 'conxfolio']
      : ['vvdex-platform', 'vvdex-engine', 'pitchradar', 'farmquick', 'unboundpdf', 'conxto', 'conxfolio', 'vvdex-trading'];
    const items = ORDER.map(s => bySlug[s]).filter(Boolean);
    const N = items.length;
    const textOf = (w) => [...(w.checks || []), ...(w.built || []), w.one, w.line, w.plan, w.problem,
      ...((w.stage || w.numbers || []).map(p => p.join(' '))), w.kind, w.name];
    // honesty guard: a suite is only drawn if its number + wording appear verbatim in the approved copy
    const suitesFor = (w) => (SUITES[w.slug] || []).filter(s => JSON.stringify(w).includes(s.src)).map(s => ({ ...s }));

    const stages = items.map((w, i) => {
      const suites = suitesFor(w);
      const main = suites[0];
      const R = main ? 0.95 + Math.sqrt(main.n) * 0.03 : (w.slug === 'vvdex-trading' ? 1.2 : w.slug === 'conxto' ? 1.3 : 1.05);
      return { i, w, suites, R, X: 0, blades: [22, 28, 18, 24, 20, 16, 14, 12][i % 8] };
    });
    const tradeIdx = stages.findIndex(s => s.w.slug === 'vvdex-trading');

    function layoutX(gapBase) {
      let x = 0;
      stages.forEach((s, i) => { if (i) x += gapBase + 0.42 * (stages[i - 1].R + s.R); s.X = x; });
      const mid = x / 2; stages.forEach(s => { s.X -= mid; });
    }
    layoutX(phone ? 0.6 : 1.05);

    // ---------- three ----------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    const DPR = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H);
    renderer.setClearColor(0x0d1110, 1);
    const canvas = renderer.domElement; canvas.className = 'cv';
    canvas.setAttribute('aria-hidden', 'true');
    root.appendChild(canvas);
    el('div', 'vig', null, root);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -200, 200);
    camera.position.set(0, 0, 100);
    const group = new THREE.Group(); scene.add(group);

    const S = N + 1; // uniform slot 8 = global (shaft, rail)
    const U = {
      uTime: { value: 0 },
      uDim: { value: new Float32Array(S).fill(1) },
      uRev: { value: new Float32Array(S).fill(reduced ? 1 : 0) },
      uOff: { value: Array.from({ length: S }, () => new THREE.Vector3()) },
      uSpin: { value: new Float32Array(S) },
      uSpd: { value: new Float32Array(S) },
      uHot: { value: new Float32Array(S) },
      uFlash: { value: new Float32Array(S) },
    };
    stages.forEach((s, i) => { U.uSpd.value[i] = (reduced ? 0 : 0.18 + (i % 3) * 0.07) * (i % 2 ? -1 : 1); });

    // ---- line geometry (one draw call for the whole mechanism) ----
    const P = [], A_S = [], A_K = [], A_O = [];
    const seg = (a, b, s, k, o) => { P.push(a[0], a[1], a[2], b[0], b[1], b[2]); A_S.push(s, s); A_K.push(k, k); A_O.push(o, o); };
    const ring = (X, r, s, k, o0, o1, n = 160, dashed = false) => {
      for (let j = 0; j < n; j++) {
        if (dashed && j % 2) continue;
        const a0 = j / n * Math.PI * 2, a1 = (j + 1) / n * Math.PI * 2;
        seg([X, r * Math.cos(a0), r * Math.sin(a0)], [X, r * Math.cos(a1), r * Math.sin(a1)], s, k, o0 + (o1 - o0) * j / n);
      }
    };
    const inputs = []; // signal paths per stage
    stages.forEach((st) => {
      const { i, X, R } = st;
      const hasCells = st.suites.length > 0;
      // machined rim: two rings + ties
      ring(X - 0.07, R, i, 0, 0.0, 0.35); ring(X + 0.07, R, i, 0, 0.05, 0.4);
      for (let j = 0; j < 36; j++) { const a = j / 36 * Math.PI * 2; seg([X - 0.07, R * Math.cos(a), R * Math.sin(a)], [X + 0.07, R * Math.cos(a), R * Math.sin(a)], i, 0, 0.3 + j / 36 * 0.1); }
      // graduation ring
      for (let j = 0; j < 120; j++) {
        const a = j / 120 * Math.PI * 2, L = j % 10 === 0 ? 0.16 : j % 5 === 0 ? 0.1 : 0.05;
        seg([X, (R + 0.05) * Math.cos(a), (R + 0.05) * Math.sin(a)], [X, (R + 0.05 + L) * Math.cos(a), (R + 0.05 + L) * Math.sin(a)], i, 4, 0.3 + j / 120 * 0.3);
      }
      // hub (flashes when a signal arrives)
      ring(X, R * 0.2, i, 6, 0.1, 0.2, 64); ring(X + 0.05, R * 0.27, i, 6, 0.12, 0.22, 64);
      // blades: full rotor on plain stages, a stator band around the cell core on test stages
      const r0 = hasCells ? R * 0.84 : R * 0.27, r1 = hasCells ? R * 0.97 : R * 0.9, sweep = hasCells ? 0.12 : 0.62;
      const nb = hasCells ? st.blades * 3 : st.blades;
      const bx = hasCells ? X : X - 0.1;
      for (let b = 0; b < nb; b++) {
        const a0 = b / nb * Math.PI * 2; const segs = hasCells ? 2 : 9;
        for (let q = 0; q < segs; q++) {
          const t0 = q / segs, t1 = (q + 1) / segs;
          const rA = r0 + (r1 - r0) * t0, rB = r0 + (r1 - r0) * t1;
          const aA = a0 + sweep * t0 * t0, aB = a0 + sweep * t1 * t1;
          seg([bx, rA * Math.cos(aA), rA * Math.sin(aA)], [bx, rB * Math.cos(aB), rB * Math.sin(aB)], i, 1, 0.45 + 0.45 * b / nb);
        }
      }
      if (!hasCells) { ring(X - 0.1, R * 0.9, i, 1, 0.5, 0.8, 120, true); }
      // inputs: three ports behind the stage, routed to the rim, then into the hub
      const angs = [Math.PI * 0.62, Math.PI * 0.92, Math.PI * 1.28];
      st.paths = angs.map((a, q) => {
        const c = Math.cos(a), s2 = Math.sin(a), pr = R + 0.75 + q * 0.12;
        const pts = [[X - 0.85, pr * c, pr * s2], [X - 0.85, (R + 0.25) * c, (R + 0.25) * s2], [X - 0.07, R * c, R * s2], [X, R * 0.2 * c, R * 0.2 * s2]];
        for (let k = 0; k < pts.length - 1; k++) seg(pts[k], pts[k + 1], i, 2, 0.8 + k * 0.05);
        // port: a small square
        const p0 = pts[0], h = 0.06;
        const sq = [[0, -h, -h], [0, h, -h], [0, h, h], [0, -h, h]];
        for (let k = 0; k < 4; k++) { const u = sq[k], v = sq[(k + 1) % 4]; seg([p0[0], p0[1] + u[1], p0[2] + u[2]], [p0[0], p0[1] + v[1], p0[2] + v[2]], i, 2, 0.8); }
        return mkPath(pts.map(p => new THREE.Vector3(...p)), i);
      });
      inputs.push(...st.paths);
    });
    // shaft (slot N) with sleeve
    const x0 = stages[0].X - 1.8, x1 = stages[N - 1].X + 1.8;
    const shaftN = 60;
    for (let j = 0; j < shaftN; j++) {
      const a = x0 + (x1 - x0) * j / shaftN, b = x0 + (x1 - x0) * (j + 1) / shaftN;
      seg([a, 0, 0], [b, 0, 0], N, 3, j / shaftN * 0.6);
      seg([a, 0.06, 0], [b, 0.06, 0], N, 5, j / shaftN * 0.6 + 0.1); seg([a, -0.06, 0], [b, -0.06, 0], N, 5, j / shaftN * 0.6 + 0.1);
    }
    // dimension rail below the mechanism, with an extension line + tick per subsystem
    const Rmax = Math.max(...stages.map(s => s.R));
    const railY = -(Rmax + 0.9);
    seg([x0 + 0.6, railY, 0], [x1 - 0.6, railY, 0], N, 5, 0.3);
    stages.forEach(st => {
      seg([st.X, railY - 0.12, 0], [st.X, railY + 0.12, 0], N, 5, 0.4);
      for (let y = -st.R - 0.3; y > railY + 0.15; y -= 0.16) seg([st.X, y, 0], [st.X, Math.max(y - 0.08, railY + 0.15), 0], N, 5, 0.5);
    });
    const shaftPaths = stages.slice(0, -1).map((st, i) => mkPath([new THREE.Vector3(st.X, 0, 0), new THREE.Vector3(stages[i + 1].X, 0, 0)], i, true));

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    lineGeo.setAttribute('aStage', new THREE.Float32BufferAttribute(A_S, 1));
    lineGeo.setAttribute('aKind', new THREE.Float32BufferAttribute(A_K, 1));
    lineGeo.setAttribute('aOrd', new THREE.Float32BufferAttribute(A_O, 1));
    const lineMat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: LINE_VS.replace(/__S__/g, S), fragmentShader: LINE_FS, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    const lines = new THREE.LineSegments(lineGeo, lineMat); lines.frustumCulled = false; group.add(lines);

    // ---- test cells (one draw call): phyllotaxis discs, lit in order up to the real count ----
    const suites = [];
    stages.forEach(st => st.suites.forEach(su => suites.push(Object.assign(su, { stage: st.i, prog: reduced ? su.n + 26 : 0, start: 0, dur: 0 }))));
    const CP = [], C_S = [], C_U = [], C_I = [];
    suites.forEach((su, k) => {
      const st = stages[su.stage];
      if (su.ring) {
        for (let j = 0; j < su.n; j++) { const a = j / su.n * Math.PI * 2 + Math.PI / 2; const r = st.R + 0.36; CP.push(st.X, r * Math.cos(a), r * Math.sin(a)); C_S.push(su.stage); C_U.push(k); C_I.push(j); }
      } else {
        const rMin = st.R * 0.3, rMax = st.R * 0.8;
        for (let j = 0; j < su.n; j++) {
          const r = Math.sqrt(rMin * rMin + (rMax * rMax - rMin * rMin) * (j + 0.5) / su.n), a = j * 2.399963;
          CP.push(st.X + 0.1, r * Math.cos(a), r * Math.sin(a)); C_S.push(su.stage); C_U.push(k); C_I.push(j);
        }
      }
    });
    const NU = Math.max(1, suites.length);
    const UC = { ...U, uProg: { value: new Float32Array(NU) }, uRing: { value: new Float32Array(NU) }, uSize: { value: 2 * DPR } };
    suites.forEach((su, k) => { UC.uProg.value[k] = su.prog; UC.uRing.value[k] = su.ring ? 1 : 0; });
    const cellGeo = new THREE.BufferGeometry();
    cellGeo.setAttribute('position', new THREE.Float32BufferAttribute(CP, 3));
    cellGeo.setAttribute('aStage', new THREE.Float32BufferAttribute(C_S, 1));
    cellGeo.setAttribute('aSuite', new THREE.Float32BufferAttribute(C_U, 1));
    cellGeo.setAttribute('aIdx', new THREE.Float32BufferAttribute(C_I, 1));
    const cellMat = new THREE.ShaderMaterial({ uniforms: UC, vertexShader: CELL_VS.replace(/__S__/g, S).replace(/__U__/g, NU), fragmentShader: CELL_FS, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    const cells = new THREE.Points(cellGeo, cellMat); cells.frustumCulled = false; group.add(cells);

    // ---- signal pulses (CPU-driven, one draw call) ----
    const NP = reduced ? 0 : 110;
    const pulsePos = new Float32Array(Math.max(NP, 1) * 3), pulseCol = new Float32Array(Math.max(NP, 1) * 3);
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
    pulseGeo.setAttribute('aCol', new THREE.BufferAttribute(pulseCol, 3));
    const pulseMat = new THREE.ShaderMaterial({ uniforms: { uSize: { value: 7 * DPR } }, vertexShader: PULSE_VS, fragmentShader: PULSE_FS, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    const pulses = new THREE.Points(pulseGeo, pulseMat); pulses.frustumCulled = false; group.add(pulses);
    const pool = Array.from({ length: NP }, () => ({ path: null, t: 0, v: 0, delay: Math.random() * 2.5 }));
    const spawn = (p, path) => { p.path = path || inputs[(Math.random() * inputs.length) | 0]; p.t = 0; p.v = (p.path.shaft ? 2.6 : 1.5) * (0.8 + Math.random() * 0.5) / p.path.len; };

    // ---- the hash chain (VVDex Trading): blocks pushed out of the stage forever ----
    const CH = isData ? { n: phone ? 4 : 22, b: phone ? 0.5 : 0.95, s: phone ? 1.0 : 1.75 } : { n: phone ? 6 : 30, b: 0.38, s: 0.82 };
    const chainDir = tradeIdx === 0 ? -1 : 1;
    const tSt = stages[tradeIdx];
    const chainX0 = tSt ? tSt.X + chainDir * (tSt.R + 0.75 + CH.b) : 0;
    const QP = [], Q_K = [];
    const qseg = (a, b, k) => { QP.push(...a, ...b); Q_K.push(k, k); };
    for (let k = 0; k < CH.n; k++) {
      const cx = chainX0 + chainDir * k * CH.s, h = CH.b / 2;
      const v = [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z => [cx + x * h, y * h, z * h])));
      const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
      E.forEach(([a, b]) => qseg(v[a], v[b], k));
      qseg([cx - h * 0.55, -h * 0.55, h], [cx + h * 0.55, h * 0.55, h], k); // seal mark
      // link to the previous (older) block
      qseg([cx + chainDir * h, 0, 0], [cx + chainDir * (CH.s - h), 0, 0], k + 0.5);
    }
    // link from the stage rim to the newest block
    if (tSt) qseg([tSt.X + chainDir * 0.1, 0, 0], [chainX0 - chainDir * CH.b / 2, 0, 0], -0.4);
    const chainGeo = new THREE.BufferGeometry();
    chainGeo.setAttribute('position', new THREE.Float32BufferAttribute(QP, 3));
    chainGeo.setAttribute('aK', new THREE.Float32BufferAttribute(Q_K, 1));
    const UQ = { uPhase: { value: 0 }, uDir: { value: chainDir }, uSp: { value: CH.s }, uN: { value: CH.n }, uDimT: { value: 1 }, uRevT: { value: reduced ? 1 : 0 }, uOffT: { value: new THREE.Vector3() } };
    const chainMat = new THREE.ShaderMaterial({ uniforms: UQ, vertexShader: CHAIN_VS, fragmentShader: CHAIN_FS, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    const chain = new THREE.LineSegments(chainGeo, chainMat); chain.frustumCulled = false;
    if (tSt) group.add(chain);

    // real SHA-256 chain computed in this tab (illustration of the mechanism, not the trading record itself)
    let headHash = '', prevHash = '', blockNo = 0;
    const subtle = globalThis.crypto && crypto.subtle;
    const hex = (buf) => Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
    let hashBusy = false;
    async function nextHash() {
      if (!subtle || hashBusy) return; hashBusy = true;
      try {
        const d = await subtle.digest('SHA-256', new TextEncoder().encode(`${headHash}|call|${blockNo}`));
        prevHash = headHash; headHash = hex(d); blockNo++;
        if (alive) updateChainLabel();
      } catch (e) { /* ignore */ }
      hashBusy = false;
    }

    // ---------- DOM ----------
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'leaders'); svg.setAttribute('aria-hidden', 'true'); root.appendChild(svg);
    const labLayer = el('div', 'labs', null, root);
    const labs = stages.map((st) => {
      const b = el('button', 'lab', null, labLayer); b.type = 'button';
      b.setAttribute('aria-label', `${st.w.name}: open details`);
      const top = el('span', 'lt', null, b);
      const sw = el('span', 'sw', null, top); sw.style.background = st.w.color;
      el('span', 'nm', st.w.name, top);
      el('span', 'kd', st.w.kind, b);
      const ro = [];
      if (st.suites.length) st.suites.forEach(su => { const r = el('span', 'ro', null, b); const v = el('b', null, reduced ? fmt(su.n) : '0', r); el('span', null, ' ' + su.label, r); ro.push({ v, su }); });
      else { const [n, l] = READOUT[st.w.slug] || (st.w.numbers || [])[0] || ['', '']; const r = el('span', 'ro', null, b); const v = el('b', null, reduced ? n : '0', r); el('span', null, ' ' + l, r); ro.push({ v, target: parseInt(n.replace(/[^0-9]/g, ''), 10) || 0, raw: n }); }
      const hit = el('span', 'hit', null, b);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); svg.appendChild(line);
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); dot.setAttribute('r', '2'); svg.appendChild(dot);
      on(b, 'click', () => openStage(st.i));
      on(b, 'pointerenter', () => { labHover = st.i; });
      on(b, 'pointerleave', () => { if (labHover === st.i) labHover = -1; });
      on(b, 'focus', () => { labHover = st.i; });
      on(b, 'blur', () => { if (labHover === st.i) labHover = -1; });
      return { b, ro, hit, line, dot, x: 0, y: 0, ax: 0, ay: 0 };
    });
    const chainLab = el('div', 'chainlab', null, labLayer);
    const chainL1 = el('span', 'c1', null, chainLab), chainL2 = el('span', 'c2', null, chainLab);
    el('span', 'c3', 'sha-256 chain, computed live in this tab', chainLab);
    const hashes = [];
    const blockLabs = Array.from({ length: isData && tSt && !phone ? 6 : 0 }, () => el('span', 'blab', null, labLayer));
    function updateChainLabel() {
      hashes.unshift(headHash); if (hashes.length > 8) hashes.length = 8; if (!headHash) return; chainL1.textContent = `head ${headHash.slice(0, 10)}…${headHash.slice(-4)}`; chainL2.textContent = `prev ${prevHash ? prevHash.slice(0, 10) + '…' + prevHash.slice(-4) : '0000000000…0000'}`; }

    // header + index (the instrument's channel selector)
    const head = el('header', 'hd', null, root);
    el('h1', 'h1', isData ? '2,028 dated calls, each chained to the last. Paper only.' : 'Eight systems I built and run, on servers I administer. Every count here is real.', head);
    const nav = el('nav', 'ix', null, head); nav.setAttribute('aria-label', 'Sections');
    const SECS = [['', 'Machine'], ['work', 'Work'], ['principles', 'How I work'], ['withdrawn', 'Withdrawn'], ['capabilities', 'Capabilities'], ['about', 'About'], ['contact', 'Contact']];
    const navLinks = SECS.map(([h, t], k) => { const a = el('a', null, null, nav); a.href = '#' + h; el('span', 'n', String(k).padStart(2, '0'), a); el('span', null, t, a); a.dataset.sec = h || 'machine'; return a; });

    const legend = el('div', 'legend', null, root);
    const hint = el('p', 'hint', null, legend);
    [['drag', 'orbit'], ['hover', 'isolate'], ['click', 'descend'], ['/', 'probe']].forEach(([k, v]) => { const s = el('span', null, null, hint); el('kbd', null, k, s); el('span', null, ' ' + v, s); });
    const lg = (cls, t) => { const r = el('div', 'lg', null, legend); el('i', cls, null, r); el('span', null, t, r); };
    lg('g', 'a test or check, lit in order up to its real count');
    lg('a', 'a signal entering a subsystem');
    lg('c', 'a block in the dated-call chain');
    el('div', 'lgn', 'Counts come from the approved record. The motion is a drawing of them, not live telemetry.', legend);

    // principle on the arrival plate: systems visitors get the stack, data visitors the standard
    const pr = (isData ? principles.find(p => /standard/i.test(p.k)) : principles.find(p => /whole stack/i.test(p.k))) || principles[0];
    const prin = el('details', 'prin', null, root);
    if (!phone) prin.open = true;
    const sum = el('summary', null, null, prin); el('i', null, null, sum); el('span', null, pr.k, sum);
    el('p', null, pr.v, prin);

    // identity + contact
    const SUBJECT = isData ? 'From your portfolio: markets and data' : 'From your portfolio: AI systems engineering';
    const mailHref = `mailto:${person.email}?subject=${encodeURIComponent(SUBJECT)}`;
    const id = el('footer', 'id', null, root);
    el('div', 'who', person.name, id);
    el('div', 'role', `${person.role} · ${person.city}`, id);
    el('p', 'lede', person.lede, id);
    const ct = el('nav', 'ct', null, id); ct.setAttribute('aria-label', 'Contact');
    const gh = el('a', 'gh', null, ct); gh.href = person.github; gh.target = '_blank'; gh.rel = 'noopener';
    el('span', 'k', 'GitHub', gh); el('span', 'v', person.github.replace(/^https?:\/\//, ''), gh); el('span', 'ar', '↗', gh);
    const row = el('span', 'row2', null, ct);
    const em = el('a', null, person.email, row); em.href = mailHref;
    const li = el('a', null, 'LinkedIn ↗', row); li.href = person.linkedin; li.target = '_blank'; li.rel = 'noopener';
    el('div', 'avail', person.availability, id);

    // command line
    const cmd = el('div', 'cmd', null, root);
    const form = el('form', 'cf', null, cmd); form.setAttribute('role', 'search');
    el('span', 'sl', '/', form);
    const inp = el('input', null, null, form);
    inp.type = 'text'; inp.placeholder = 'probe the machine'; inp.setAttribute('aria-label', 'Probe the subsystems by keyword'); inp.autocomplete = 'off'; inp.spellcheck = false; inp.maxLength = 40;
    el('span', 'kb', phone ? '' : '⌘K', form);
    const res = el('div', 'res', null, cmd); res.setAttribute('aria-live', 'polite');
    const tryRow = el('div', 'try', null, cmd);
    el('span', null, 'try', tryRow);
    ['tests', 'agents', 'privacy', 'sealed', 'hash'].forEach(w => { const b = el('button', null, w, tryRow); b.type = 'button'; on(b, 'click', () => { inp.value = w; runQuery(); }); });

    // reading surface (every section and case renders here; the machine stays the stage beside it)
    const surf = el('section', 'surf', null, root); surf.setAttribute('aria-hidden', 'true');
    const sbar = el('div', 'sbar', null, surf);
    const crumb = el('span', 'crumb', null, sbar);
    const sx = el('a', 'px', '×', sbar); sx.href = '#'; sx.setAttribute('aria-label', 'Back to the machine');
    const sin = el('div', 'sin', null, surf); sin.tabIndex = -1;

    // ---------- interaction state ----------
    let yaw0 = phone ? 0.0 : -0.66, pitch0 = phone ? 0.72 : 0.17;
    let yaw = yaw0, pitch = pitch0, vyaw = 0, vpitch = 0;
    let hover = -1, labHover = -1, open = -1, query = null; // query: Map stage → snippet
    let dragging = false, downX = 0, downY = 0, lastX = 0, lastY = 0, moved = 0, lastInteract = -10;
    const mouse = { x: -1, y: -1, in: false };
    const qBase = new THREE.Quaternion(), qY = new THREE.Quaternion(), qP = new THREE.Quaternion();
    const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), AZ = new THREE.Vector3(0, 0, 1);
    function orient(y, p) {
      qBase.setFromAxisAngle(AZ, phone ? -Math.PI / 2 : 0);
      qY.setFromAxisAngle(AY, y); qP.setFromAxisAngle(AX, p);
      group.quaternion.copy(qP).multiply(qY).multiply(qBase);
      group.updateMatrixWorld(true);
    }

    // view fit
    const view = { cx: 0, cy: 0, zoom: 60, tcx: 0, tcy: 0, tzoom: 60, base: null };
    const tmp = new THREE.Vector3();
    function placePhone() {
      if (!phone) { prin.style.top = ''; cmd.style.bottom = ''; return; }
      const r = root.getBoundingClientRect();
      prin.style.top = (head.getBoundingClientRect().bottom - r.top + 8) + 'px';
      cmd.style.bottom = (id.offsetHeight + 14 + 12) + 'px';
    }
    let obst = [];
    function measureObstacles() {
      const r = root.getBoundingClientRect();
      obst = [head, legend, id, prin, cmd].filter(n => n.offsetParent !== null && getComputedStyle(n).display !== 'none').map(n => {
        const b = n.getBoundingClientRect(); return { l: b.left - r.left, r: b.right - r.left, t: b.top - r.top, b: b.bottom - r.top };
      });
    }
    function region() {
      const r = root.getBoundingClientRect();
      if (phone) {
        const hb = head.getBoundingClientRect().bottom - r.top, pb = prin.getBoundingClientRect().bottom - r.top;
        const ft = Math.min(cmd.getBoundingClientRect().top, id.getBoundingClientRect().top) - r.top;
        return { l: 14, r: W - 150, t: Math.max(hb, pb) + 26, b: ft - 30 };
      }
      return { l: 60, r: W - 60, t: 250, b: H - 255 };
    }
    function fit() {
      orient(yaw0, pitch0);
      let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
      const add = (x, y, z) => { tmp.set(x, y, z).applyMatrix4(group.matrixWorld); mnx = Math.min(mnx, tmp.x); mxx = Math.max(mxx, tmp.x); mny = Math.min(mny, tmp.y); mxy = Math.max(mxy, tmp.y); };
      stages.forEach(st => { for (let j = 0; j < 24; j++) { const a = j / 24 * Math.PI * 2; add(st.X, (st.R + 0.2) * Math.cos(a), (st.R + 0.2) * Math.sin(a)); } });
      if (tSt) for (let k = 0; k < (phone ? (isData ? 3 : 2) : isData ? 6 : 4); k++) add(chainX0 + chainDir * k * CH.s, 0, 0);
      const g = region();
      const z = Math.min((g.r - g.l) / (mxx - mnx), (g.b - g.t) / (mxy - mny));
      const bx = (mnx + mxx) / 2, by = (mny + mxy) / 2;
      const rcx = (g.l + g.r) / 2, rcy = (g.t + g.b) / 2;
      view.base = { zoom: z, cx: bx - (rcx - W / 2) / z, cy: by + (rcy - H / 2) / z };
      if (route.sec === 'machine') { view.tzoom = z; view.tcx = view.base.cx; view.tcy = view.base.cy; }
      orient(yaw, pitch);
    }
    function snapView() { view.zoom = view.tzoom; view.cx = view.tcx; view.cy = view.tcy; }

    // ---------- query ----------
    function runQuery() {
      const q = inp.value.trim().toLowerCase();
      if (!q) { query = null; root.classList.remove('q'); res.textContent = ''; labs.forEach(l => { l.hit.textContent = ''; }); kick(); return; }
      const toks = q.split(/[\s,]+/).filter(Boolean);
      const m = new Map();
      stages.forEach(st => {
        const sents = textOf(st.w);
        for (const tk of toks) {
          const base = tk.replace(/s$/, '');
          const terms = SYN[tk] || SYN[base] || [base];
          for (const s of sents) { const low = s.toLowerCase(); const t = terms.find(t2 => low.includes(t2)); if (t) { m.set(st.i, snippet(s, low.indexOf(t), t.length)); break; } }
          if (m.has(st.i)) break;
        }
      });
      query = m; root.classList.toggle('q', m.size > 0);
      labs.forEach((l, i) => { l.hit.textContent = m.has(i) ? m.get(i) : ''; });
      res.textContent = m.size ? `${m.size} of ${N} subsystems match “${q}” · enter opens ${stages[[...m.keys()][0]].w.name}` : `nothing in the approved text matches “${q}”`;
      kick();
    }
    function snippet(s, at, len) {
      const a = Math.max(0, at - 34), b = Math.min(s.length, at + len + 40);
      return (a > 0 ? '…' : '') + s.slice(a, b).trim() + (b < s.length ? '…' : '');
    }
    on(inp, 'input', runQuery);
    on(form, 'submit', (e) => { e.preventDefault(); if (query && query.size) openStage([...query.keys()][0]); });

    // ---------- routes: #work, #work/<slug>, #principles, #withdrawn, #capabilities, #about, #contact ----------
    const cases = ctx.cases || {}, caps = ctx.capabilities || [], about = ctx.about || { facts: [] };
    const SECNAMES = ['work', 'principles', 'withdrawn', 'capabilities', 'about', 'contact'];
    const idxBySlug = Object.fromEntries(stages.map(s => [s.w.slug, s.i]));
    const idxByName = Object.fromEntries(stages.map(s => [s.w.name, s.i]));
    let route = { sec: 'machine', slug: null }, hl = null, io = null, yawT = yaw0, pitchT = pitch0;
    const ext = (a) => { a.target = '_blank'; a.rel = 'noopener'; return a; };
    const pad = (n) => String(n).padStart(2, '0');
    function parse() {
      const h = decodeURIComponent((location.hash || '').replace(/^#\/?/, ''));
      const [a, b] = h.split('/');
      if (a === 'work' && b && idxBySlug[b] != null) return { sec: 'work', slug: b };
      if (SECNAMES.includes(a)) return { sec: a, slug: null };
      return { sec: 'machine', slug: null };
    }
    function go(h) { if ((location.hash || '').replace(/^#/, '') === h) applyRoute(parse()); else location.hash = h; }
    function openStage(i) { go('work/' + stages[i].w.slug); }
    on(window, 'hashchange', () => applyRoute(parse()));
    // the stage never scrolls: focus or scrollIntoView inside the surface must only move the surface
    on(root, 'scroll', () => { if (root.scrollTop || root.scrollLeft) { root.scrollTop = 0; root.scrollLeft = 0; } });

    // section heading in the instrument's voice: a channel code, then the title
    function sh(parent, code, title, sub) {
      const h = el('div', 'sh', null, parent);
      el('span', 'code', code, h); el('h3', null, title, h);
      if (sub) el('p', 'shs', sub, parent);
      return h;
    }
    function readouts(parent, nums) {
      const r = el('div', 'pn', null, parent);
      nums.forEach(n => { const c = el('div', null, null, r); el('b', null, n.value, c); el('span', null, n.label, c); if (n.date) el('time', null, n.date, c); });
      return r;
    }
    function svgEl(tag, attrs, parent) { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; }
    function switchGlyph() {
      const s = svgEl('svg', { viewBox: '0 0 56 60', width: '56', height: '60', class: 'swg', 'aria-hidden': 'true' });
      svgEl('line', { x1: 0, y1: 30, x2: 16, y2: 30, class: 'w' }, s);
      svgEl('circle', { cx: 16, cy: 30, r: 2.6, class: 'pv' }, s);
      svgEl('line', { x1: 16, y1: 30, x2: 44, y2: 14, class: 'lv' }, s);
      svgEl('circle', { cx: 46, cy: 13, r: 2.6, class: 'on' }, s);
      svgEl('circle', { cx: 46, cy: 47, r: 2.6, class: 'off' }, s);
      svgEl('line', { x1: 49, y1: 13, x2: 56, y2: 13, class: 'lv' }, s);
      svgEl('line', { x1: 49, y1: 47, x2: 56, y2: 47, class: 'dash' }, s);
      return s;
    }
    function linkList(parent, links) {
      const l = el('div', 'ports', null, parent);
      links.forEach(([t, u], k) => { const a = ext(el('a', null, null, l)); a.href = u; el('span', 'pc', 'PORT-' + pad(k + 1), a); el('span', 'pt', t, a); el('span', 'pu', u.replace(/^https?:\/\//, '').replace(/\/$/, ''), a); });
      return l;
    }
    function prevNext(parent, i) {
      const n = el('nav', 'pnx', null, parent); n.setAttribute('aria-label', 'Previous and next subsystem');
      const p = stages[(i - 1 + N) % N], q = stages[(i + 1) % N];
      const a = el('a', 'prev', null, n); a.href = '#work/' + p.w.slug; el('span', 'code', '← stage ' + pad(p.i + 1), a); el('span', null, p.w.name, a);
      const b = el('a', 'next', null, n); b.href = '#work/' + q.w.slug; el('span', 'code', 'stage ' + pad(q.i + 1) + ' →', b); el('span', null, q.w.name, b);
    }
    function withdrawnFor(slug) { return withdrawn.filter(x => (slug === 'vvdex-trading' && /70%/.test(x.title)) || (slug === 'vvdex-platform' && /exam lane/i.test(x.title))); }

    function renderCase(i) {
      const st = stages[i], w = st.w, c = cases[w.slug];
      crumb.textContent = `stage ${pad(i + 1)} / ${pad(N)} · ${w.name}`;
      const hd = el('header', 'ch', null, sin);
      const k = el('div', 'kick', null, hd); const sw = el('i', 'sw', null, k); sw.style.background = w.color;
      el('span', null, c ? `${c.category} · ${c.status} · ${c.period}` : `${w.kind} · ${w.status}`, k);
      const h2 = el('h2', null, w.name, hd); h2.tabIndex = -1;
      el('p', 'pl', c ? c.one_line : w.line, hd);
      if (c) {
        el('p', 'sum', c.summary, sin);
        readouts(sin, c.numbers);
        const r = el('section', null, null, sin); sh(r, '§01', 'My role'); el('p', null, c.role, r);
        const p = el('section', null, null, sin); sh(p, '§02', 'Problem'); el('p', null, c.problem, p);
        const e = el('section', null, null, sin); sh(e, '§03', 'Operating envelope', 'The constraints it has to run inside.');
        const ul = el('ul', 'env', null, e); c.constraints.forEach((t, j) => { const li2 = el('li', null, null, ul); el('span', 'code', 'E-' + pad(j + 1), li2); el('span', null, t, li2); });
        const s = el('section', null, null, sin); sh(s, '§04', 'Signal path', 'How it works, step by step. The stage on the left fires as you read.');
        const ol = el('ol', 'sp', null, s);
        c.how_it_works.forEach((h, j) => { const li2 = el('li', null, null, ol); li2.dataset.k = j; el('i', 'node', null, li2); el('span', 'code', 'T+' + pad(j + 1), li2); el('b', null, h.step, li2); el('p', null, h.body, li2); });
        const b = el('section', null, null, sin); sh(b, '§05', 'Subassemblies', 'What I built.');
        c.built.forEach((x, j) => { const d = el('div', 'sa', null, b); el('span', 'code', 'SA-' + pad(j + 1), d); const t = el('div', null, null, d); el('b', null, x.title, t); el('p', null, x.body, t); });
        const dsec = el('section', null, null, sin); sh(dsec, '§06', 'Switch points', 'Decisions: the position I chose, why, and what it costs.');
        c.decisions.forEach((d, j) => {
          const row = el('div', 'swr', null, dsec); row.appendChild(switchGlyph());
          const t = el('div', 'swt', null, row); el('span', 'code', 'SW-' + pad(j + 1), t); el('b', null, d.decision, t); el('p', 'why', d.why, t);
          const tr = el('p', 'tr', null, t); el('span', 'tag', 'trade-off', tr); el('span', null, d.tradeoff, tr);
        });
        const ev = el('section', null, null, sin); sh(ev, '§07', 'Measurements', 'How it was checked, with dates.');
        c.evaluation.forEach((x, j) => { const d = el('div', 'ms', null, ev); const m = el('div', 'msm', null, d); el('span', 'code', 'M-' + pad(j + 1), m); if (x.date) el('time', null, x.date, m); const t = el('div', null, null, d); el('b', null, x.what, t); el('p', null, x.result, t); });
        const sk = el('section', null, null, sin); sh(sk, '§08', 'Components', 'The stack.');
        const g = el('ul', 'bom', null, sk); c.stack.forEach((x, j) => { const li2 = el('li', null, null, g); el('span', 'code', 'P-' + pad(j + 1), li2); el('span', null, x, li2); });
        const lm = el('section', 'tol', null, sin); sh(lm, '§09', 'Tolerances', 'Limits, stated plainly.');
        c.limits.forEach((x, j) => { const d = el('div', 'tl', null, lm); el('span', 'code', 'TOL-' + pad(j + 1), d); el('p', null, x, d); });
        withdrawnFor(w.slug).forEach(x => { const d = el('section', 'wdx', null, sin); sh(d, '§!', 'Withdrawn · ' + x.title); el('p', null, x.what, d); const a = el('a', 'lk', 'All withdrawn claims', d); a.href = '#withdrawn'; });
        const lk = el('section', null, null, sin); sh(lk, '§10', 'Ports', 'Where to check it yourself.');
        linkList(lk, [...c.links.map(l => [l.label, l.url]), ['Case study', `https://vamsi-venkatesh.github.io/portfolio-designs/inside-the-dot/work/${w.slug}/`]]);
      } else {
        const nums = (w.stage || w.numbers || []).map(([value, label]) => ({ value, label }));
        if (nums.length) readouts(sin, nums);
        const p = el('section', null, null, sin); sh(p, '§01', 'Problem'); el('p', null, w.problem, p);
        const pl = el('section', null, null, sin); sh(pl, '§02', 'Plan'); el('p', null, w.plan, pl);
        const b = el('section', null, null, sin); sh(b, '§03', 'Subassemblies', 'What I built.');
        w.built.forEach((x, j) => { const d = el('div', 'sa', null, b); el('span', 'code', 'SA-' + pad(j + 1), d); el('p', null, x, d); });
        const ck = el('section', null, null, sin); sh(ck, '§04', 'Checks', 'What has to hold on every run.');
        const ul = el('ul', 'ck', null, ck); w.checks.forEach((t, j) => { const li2 = el('li', null, null, ul); const sq = el('i', null, null, li2); sq.style.animationDelay = (0.3 + j * 0.22) + 's'; el('span', null, t, li2); });
        withdrawnFor(w.slug).forEach(x => {
          const d = el('section', 'wdx', null, sin); sh(d, '§!', 'Withdrawn · ' + x.title); el('p', null, x.what, d);
          readouts(d, x.numbers.map(([value, label]) => ({ value, label })));
          const a = el('a', 'lk', 'All withdrawn claims', d); a.href = '#withdrawn';
        });
        const lk = el('section', null, null, sin); sh(lk, '§05', 'Ports', 'Where to check it yourself.');
        linkList(lk, [...(w.links || []), ['Case study', `https://vamsi-venkatesh.github.io/portfolio-designs/inside-the-dot/work/${w.slug}/`]]);
      }
      prevNext(sin, i);
      return h2;
    }

    function renderWork() {
      crumb.textContent = 'Work · parts list';
      const hd = el('header', 'ch', null, sin); el('div', 'kick', 'CH.01 · eight subsystems on one shaft', hd);
      const h2 = el('h2', null, 'Work', hd); h2.tabIndex = -1;
      el('p', 'pl', phone || ctx.isTouch ? 'Every product I built and run, in shaft order. Open one to descend into its stage.' : 'Every product I built and run, in shaft order. Hover a row to isolate its stage; open one to descend into it.', hd);
      const ul = el('ul', 'parts', null, sin);
      stages.forEach(st => {
        const w = st.w, li2 = el('li', null, null, ul), a = el('a', null, null, li2); a.href = '#work/' + w.slug;
        el('span', 'code', pad(st.i + 1), a);
        const t = el('span', 'pm', null, a); const n = el('span', 'pn2', null, t); const sw = el('i', 'sw', null, n); sw.style.background = w.color; el('b', null, w.name, n);
        el('span', 'pk2', `${w.kind} · ${w.status}${cases[w.slug] ? ' · full case' : ''}`, t); el('span', 'po', w.one, t);
        const ro = st.suites.length ? `${fmt(st.suites[0].n)} ${st.suites[0].label}` : (READOUT[w.slug] || (w.numbers || [])[0] || []).join(' ');
        el('span', 'pr', ro, a);
        on(a, 'pointerenter', () => { labHover = st.i; kick(); }); on(a, 'pointerleave', () => { if (labHover === st.i) labHover = -1; kick(); });
        on(a, 'focus', () => { labHover = st.i; kick(); }); on(a, 'blur', () => { if (labHover === st.i) labHover = -1; kick(); });
      });
      return h2;
    }

    function renderPrinciples() {
      crumb.textContent = 'How I work · operating rules';
      const hd = el('header', 'ch', null, sin); el('div', 'kick', 'CH.02 · the rules the machine runs under', hd);
      const h2 = el('h2', null, 'How I work', hd); h2.tabIndex = -1;
      principles.forEach((p, j) => { const d = el('section', 'rule', null, sin); el('span', 'code', 'RULE ' + pad(j + 1), d); el('h4', null, p.k, d); el('p', null, p.v, d); });
      return h2;
    }

    function renderWithdrawn() {
      crumb.textContent = 'Withdrawn · readings that failed their gate';
      const hd = el('header', 'ch', null, sin); el('div', 'kick', 'CH.03 · claims I withdrew', hd);
      const h2 = el('h2', null, 'Claims I withdrew', hd); h2.tabIndex = -1;
      el('p', 'pl', 'A claim stands only if it clears a gate set before the measurement. These two did not.', hd);
      withdrawn.forEach((x, j) => {
        const d = el('section', 'wd2', null, sin); sh(d, 'W-' + pad(j + 1), x.title); el('p', null, x.what, d);
        const vals = x.numbers.map(([v]) => v);
        if (vals.every(v => /^\d*\.\d+$/.test(v))) {
          // a gauge: the measured value against the gate written down in advance
          const [mv, gv] = vals.map(parseFloat), lo = Math.min(mv, gv), hi = Math.max(mv, gv), span = (hi - lo) || 1;
          const a0 = lo - span * 1.2, a1 = hi + span * 1.2, pos = (v) => ((v - a0) / (a1 - a0) * 100).toFixed(2) + '%';
          const gg = el('div', 'gauge', null, d); gg.setAttribute('role', 'img'); gg.setAttribute('aria-label', `${x.numbers[0][1]} ${x.numbers[0][0]}, ${x.numbers[1][1]} ${x.numbers[1][0]}`);
          el('div', 'track', null, gg);
          const pass = el('div', 'pass', null, gg); pass.style.left = pos(gv);
          const gm = el('div', 'gate', null, gg); gm.style.left = pos(gv); if (parseFloat(pos(gv)) > 55) gm.classList.add('l'); el('span', null, `${x.numbers[1][0]} ${x.numbers[1][1]}`, gm);
          const mm = el('div', 'meas', null, gg); mm.style.left = pos(mv); if (parseFloat(pos(mv)) < 45) mm.classList.add('r'); el('span', null, `${x.numbers[0][0]} ${x.numbers[0][1]}`, mm);
        } else {
          const n = parseInt(vals[0], 10) || 0;
          const cells = el('div', 'struck', null, d); cells.setAttribute('aria-hidden', 'true');
          for (let k = 0; k < Math.min(n, 40); k++) { const c = el('i', null, null, cells); c.style.animationDelay = (0.3 + k * 0.12) + 's'; }
        }
        readouts(d, x.numbers.map(([value, label]) => ({ value, label })));
        const a = ext(el('a', 'lk pri', x.link[0] + ' ↗', d)); a.href = x.link[1];
      });
      return h2;
    }

    function renderCapabilities() {
      crumb.textContent = 'Capabilities · bill of materials';
      const hd = el('header', 'ch', null, sin); el('div', 'kick', 'CH.04 · bill of materials', hd);
      const h2 = el('h2', null, 'Capabilities', hd); h2.tabIndex = -1;
      el('p', 'pl', phone || ctx.isTouch ? 'Each part, and the subsystems it is fitted to. Touch a part to light those stages.' : 'Each part, and the subsystems it is fitted to. Hover a part to light those stages.', hd);
      caps.forEach(([group, items], gi) => {
        const L = String.fromCharCode(65 + gi);
        const s = el('section', 'bomg', null, sin); sh(s, 'GROUP ' + L, group);
        const tb = el('ul', 'bomt', null, s);
        items.forEach(([skill, prods], j) => {
          const li2 = el('li', null, null, tb); el('span', 'code', `${L}-${pad(j + 1)}`, li2);
          const t = el('div', null, null, li2); el('span', 'sk', skill, t);
          const ch = el('span', 'chips', null, t);
          const set = new Set(prods.map(p => idxByName[p]).filter(v => v != null));
          prods.forEach(p => { const ix = idxByName[p]; if (ix == null) { el('span', 'chip', p, ch); return; } const a = el('a', 'chip', p, ch); a.href = '#work/' + stages[ix].w.slug; });
          const enter = () => { hl = set; kick(); }, leave = () => { if (hl === set) hl = null; kick(); };
          on(li2, 'pointerenter', enter); on(li2, 'pointerleave', leave); on(li2, 'focusin', enter); on(li2, 'focusout', leave);
        });
      });
      return h2;
    }

    function renderAbout() {
      crumb.textContent = 'About · nameplate';
      const hd = el('header', 'ch', null, sin); el('div', 'kick', 'CH.05 · nameplate', hd);
      const h2 = el('h2', null, 'About', hd); h2.tabIndex = -1;
      const plate = el('div', 'plate', null, sin);
      ['s1', 's2', 's3', 's4'].forEach(c => el('i', 'screw ' + c, null, plate));
      el('div', 'pname', person.name, plate);
      el('div', 'prole', `${person.role} · ${person.city}`, plate);
      const dl = el('dl', null, null, plate);
      about.facts.forEach(([k, v]) => { el('dt', null, k || '', dl); el('dd', null, v, dl); });
      el('dt', null, 'Open to', dl); const dd = el('dd', 'roles', null, dl); person.roles.forEach(r => el('span', null, r, dd));
      el('dt', null, 'Status', dl); el('dd', null, person.availability, dl);
      const w2 = el('section', null, null, sin); sh(w2, '§', 'What I am looking for'); el('p', null, person.wants, w2);
      el('p', 'sum', person.lede, sin);
      return h2;
    }

    function renderContact() {
      crumb.textContent = 'Contact · output ports';
      const hd = el('header', 'ch', null, sin); el('div', 'kick', 'CH.06 · output ports', hd);
      const h2 = el('h2', null, 'Contact', hd); h2.tabIndex = -1;
      el('p', 'pl', person.availability, hd);
      const l = el('div', 'outs', null, sin);
      const port = (code, k, v, href, x) => { const a = el('a', null, null, l); a.href = href; if (x) ext(a); el('span', 'code', code, a); el('b', null, k, a); el('span', 'pu', v, a); el('span', 'ar', x ? '↗' : '→', a); };
      port('OUT-01', 'Email', person.email, mailHref, false);
      port('OUT-02', 'GitHub', person.github.replace(/^https?:\/\//, ''), person.github, true);
      port('OUT-03', 'LinkedIn', person.linkedin.replace(/^https?:\/\/(www\.)?/, ''), person.linkedin, true);
      const w2 = el('section', null, null, sin); sh(w2, '§', 'What I am looking for'); el('p', null, person.wants, w2);
      return h2;
    }

    function surfRegion() {
      const r = root.getBoundingClientRect();
      if (phone) { const hb = nav.getBoundingClientRect().bottom - r.top; return { l: 12, r: W - 12, t: hb + 8, b: H - surf.offsetHeight - 8 }; }
      const sw = surf.offsetWidth || Math.min(700, W * 0.5);
      const hb = nav.getBoundingClientRect().bottom - r.top;
      return { l: 36, r: W - sw - 36, t: hb + 30, b: H - 50 };
    }
    function fitTo(g, y, p) {
      orient(y, p);
      let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
      const add = (x, yy, z) => { tmp.set(x, yy, z).applyMatrix4(group.matrixWorld); mnx = Math.min(mnx, tmp.x); mxx = Math.max(mxx, tmp.x); mny = Math.min(mny, tmp.y); mxy = Math.max(mxy, tmp.y); };
      stages.forEach(st => { for (let j = 0; j < 24; j++) { const a = j / 24 * Math.PI * 2; add(st.X, (st.R + 0.2) * Math.cos(a), (st.R + 0.2) * Math.sin(a)); } });
      const z = Math.max(4, 0.9 * Math.min((g.r - g.l) / (mxx - mnx), (g.b - g.t) / (mxy - mny)));
      const bx = (mnx + mxx) / 2, by = (mny + mxy) / 2, rcx = (g.l + g.r) / 2, rcy = (g.t + g.b) / 2;
      orient(yaw, pitch);
      return { zoom: z, cx: bx - (rcx - W / 2) / z, cy: by + (rcy - H / 2) / z };
    }
    const SECVIEW = { // the machine reacts to where you are
      work: () => [yaw0, pitch0],
      principles: () => phone ? [0.9, 1.0] : [-1.32, 0.2],
      withdrawn: () => [yaw0, pitch0],
      capabilities: () => phone ? [0.4, 0.85] : [-0.42, 0.42],
      about: () => phone ? [-0.5, 0.9] : [-0.95, 0.55],
      contact: () => phone ? [0.2, 0.6] : [-0.2, 0.12],
    };
    function applyView() {
      if (route.sec === 'machine') { yawT = yaw0; pitchT = pitch0; if (view.base) { view.tzoom = view.base.zoom; view.tcx = view.base.cx; view.tcy = view.base.cy; } }
      else if (route.slug) { yawT = yaw0; pitchT = pitch0; focusStage(open); }
      else { const [y, p] = SECVIEW[route.sec](); yawT = y; pitchT = p; const v = fitTo(surfRegion(), y, p); view.tzoom = v.zoom; view.tcx = v.cx; view.tcy = v.cy; }
      if (reduced) { yaw = yawT; pitch = pitchT; orient(yaw, pitch); snapView(); }
    }
    function applyRoute(r) {
      route = r; hl = null; labHover = -1;
      if (io) { io.disconnect(); io = null; }
      navLinks.forEach(a => { if (a.dataset.sec === r.sec) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      const cur = navLinks.find(a => a.dataset.sec === r.sec); if (cur && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = Math.max(0, cur.offsetLeft - nav.clientWidth / 2 + cur.offsetWidth / 2);
      if (r.sec === 'machine') {
        open = -1; root.classList.remove('focus', 'surfon', 'incase');
        surf.classList.remove('on'); surf.setAttribute('aria-hidden', 'true');
        applyView(); kick(); return;
      }
      open = r.slug ? idxBySlug[r.slug] : -1;
      if (r.sec === 'withdrawn') hl = new Set([idxBySlug['vvdex-trading'], idxBySlug['vvdex-platform']].filter(v => v != null));
      sin.replaceChildren(); sin.scrollTop = 0;
      surf.className = 'surf on s-' + r.sec + (r.slug && cases[r.slug] ? ' flag' : '');
      root.classList.toggle('incase', !!r.slug);
      surf.setAttribute('aria-hidden', 'false');
      root.classList.add('focus', 'surfon');
      const R = { work: () => r.slug ? renderCase(open) : renderWork(), principles: renderPrinciples, withdrawn: renderWithdrawn, capabilities: renderCapabilities, about: renderAbout, contact: renderContact };
      const h2 = R[r.sec]();
      // signal path: each step fires the stage as it scrolls into view
      if (r.slug && 'IntersectionObserver' in window) {
        const steps = [...sin.querySelectorAll('.sp li')];
        io = new IntersectionObserver((ents) => {
          ents.forEach(en => {
            if (!en.isIntersecting) return;
            const k = +en.target.dataset.k;
            steps.forEach((s, j) => s.classList.toggle('on', j <= k));
            fire(open, k);
          });
        }, { root: sin, threshold: 0.75 });
        steps.forEach(s => io.observe(s));
      }
      applyView();
      setTimeout(() => { if (alive && h2 && document.contains(h2)) h2.focus({ preventScroll: true }); }, 40);
      kick();
    }
    function fire(i, k) {
      if (i < 0) return;
      U.uFlash.value[i] = 1.6;
      const st = stages[i]; let n = 0;
      for (const p of pool) { if (n >= 8) break; if (p.delay <= 0 && (!p.path || p.path.stage !== i)) { spawn(p, st.paths[(k + n) % st.paths.length]); p.t = -n * 0.06; n++; } }
      kick();
    }
    function focusStage(i) {
      if (i < 0) return;
      const st = stages[i];
      orient(yaw0, pitch0);
      tmp.set(st.X, 0, 0).applyMatrix4(group.matrixWorld);
      orient(yaw, pitch);
      const g = surfRegion();
      const z = Math.min((g.b - g.t) * 0.4 / st.R, (g.r - g.l) * 0.36 / st.R, (view.base ? view.base.zoom : 60) * 3.2);
      view.tzoom = z;
      view.tcx = tmp.x - ((g.l + g.r) / 2 - W / 2) / z;
      view.tcy = tmp.y + ((g.t + g.b) / 2 - H / 2) / z;
    }

    // ---------- pointer ----------
    on(root, 'pointerdown', (e) => {
      if (e.target !== canvas) return;
      dragging = true; downX = lastX = e.clientX; downY = lastY = e.clientY; moved = 0; vyaw = vpitch = 0;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      lastInteract = clock;
    });
    on(root, 'pointermove', (e) => {
      const r = root.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.in = e.target === canvas;
      if (dragging) {
        const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        const dy2 = phone ? 0 : dy;
        yaw += dx * 0.0038; pitch = Math.max(-0.35, Math.min(1.25, pitch + dy2 * 0.0026));
        vyaw = dx * 0.0038; vpitch = dy2 * 0.0026; lastInteract = clock;
      }
      kick();
    });
    const up = (e) => {
      if (!dragging) return; dragging = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      if (moved < 6) {
        const h = pick(mouse.x, mouse.y);
        if (h >= 0) openStage(h);
      }
      kick();
    };
    on(root, 'pointerup', up); on(root, 'pointercancel', up);
    on(root, 'pointerleave', () => { mouse.in = false; kick(); });
    on(window, 'keydown', (e) => {
      const inField = e.target === inp;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !inField && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName)))) {
        e.preventDefault(); inp.focus(); inp.select(); return;
      }
      if (e.key === 'Escape') {
        if (inField && inp.value) { inp.value = ''; runQuery(); } else if (route.sec !== 'machine') go(''); else if (inField || inp.value) { inp.value = ''; runQuery(); inp.blur(); }
      }
    });

    // screen polygons per stage (for picking + labels)
    const poly = stages.map(() => new Float32Array(32));
    const cen = stages.map(() => ({ x: 0, y: 0 }));
    function toScreen(v) { v.applyMatrix4(group.matrixWorld); return { x: (v.x - view.cx) * view.zoom + W / 2, y: -(v.y - view.cy) * view.zoom + H / 2 }; }
    function pick(mx, my) {
      let best = -1, bd = Infinity;
      stages.forEach((st, i) => {
        const pg = poly[i]; let inside = false;
        for (let a = 0, b = 15; a < 16; b = a++) {
          const xa = pg[a * 2], ya = pg[a * 2 + 1], xb = pg[b * 2], yb = pg[b * 2 + 1];
          if ((ya > my) !== (yb > my) && mx < (xb - xa) * (my - ya) / (yb - ya) + xa) inside = !inside;
        }
        if (inside) { const d = Math.hypot(mx - cen[i].x, my - cen[i].y); if (d < bd) { bd = d; best = i; } }
      });
      return best;
    }

    // ---------- timeline ----------
    const ease = (t) => t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3);
    const easeIO = (t) => t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const mid = 0;
    suites.forEach((su) => { su.start = 2.0 + su.stage * 0.18 + (su.ring ? 1.0 : 0); su.dur = 2.2 + su.n / 330; });
    const counters = labs.flatMap((l) => l.ro.filter(r => !r.su).map(r => ({ ...r, start: 2.3, dur: 3.2 })));
    let clock = 0, last = performance.now(), raf = 0, alive = true, chainPhase = 0, chainBlocks = 0, labelsOn = reduced ? 1 : 0;
    const dimCur = new Float32Array(S).fill(1);

    function frame(now) {
      raf = 0;
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!reduced) clock += dt;
      const t = clock;
      U.uTime.value = t;

      // assembly: stages draw on collapsed at the centre, then explode out to their positions with a spin
      for (let i = 0; i < N; i++) {
        if (reduced) { U.uRev.value[i] = 1; U.uOff.value[i].set(0, 0, 0); U.uSpin.value[i] = 0; continue; }
        U.uRev.value[i] = ease((t - 0.15 - i * 0.05) / 1.3);
        const e = easeIO((t - 0.95 - Math.abs(i - (N - 1) / 2) * 0.05) / 1.55);
        U.uOff.value[i].set((mid - stages[i].X) * 0.93 * (1 - e), 0, 0);
        U.uSpin.value[i] = (1 - e) * (i % 2 ? -2.4 : 2.4);
      }
      U.uRev.value[N] = reduced ? 1 : ease(t / 1.1);
      UQ.uRevT.value = reduced ? 1 : ease((t - 2.2) / 0.8);
      if (tSt) UQ.uOffT.value.copy(U.uOff.value[tradeIdx]);

      // test suites: light in order to the real count, then settle
      suites.forEach((su, k) => {
        if (!reduced) su.prog = (su.n + 26) * ease((t - su.start) / su.dur);
        UC.uProg.value[k] = su.prog;
      });
      labs.forEach(l => l.ro.forEach(r => {
        let txt;
        if (r.su) txt = fmt(Math.min(r.su.n, r.su.prog));
        else { if (reduced) return; const p = ease((t - 2.3) / 3.4); txt = p >= 1 ? r.raw : fmt(r.target * p); }
        if (r.v.textContent !== txt) r.v.textContent = txt;
      }));

      // chain: fast while the count climbs, then one block every ~2 s, forever
      if (tSt && !reduced) {
        const ramp = t < 2.3 ? 0 : t < 5.6 ? 7 * (1 - ease((t - 2.3) / 3.3)) + 0.5 : 0.5;
        chainPhase += dt * ramp;
        while (chainPhase >= 1) { chainPhase -= 1; chainBlocks++; nextHash(); }
        UQ.uPhase.value = chainPhase;
      }

      // orbit inertia + idle drift
      if (!dragging && !reduced) {
        yaw += vyaw; pitch = Math.max(-0.35, Math.min(1.25, pitch + vpitch)); vyaw *= 0.93; vpitch *= 0.93;
        if (route.sec === 'machine') { if (t - lastInteract > 4) { const drift = Math.sin(t * 0.11) * 0.05; yaw += ((yaw0 + drift) - yaw) * 0.004; pitch += (pitch0 - pitch) * 0.004; } }
        else if (t - lastInteract > 2.5) { const kk = Math.min(1, dt * 2.2); yaw += (yawT + Math.sin(t * 0.13) * 0.04 - yaw) * kk; pitch += (pitchT - pitch) * kk; }
      }
      orient(yaw, pitch);

      // view
      const k = reduced ? 1 : 1 - Math.pow(0.0015, dt);
      view.zoom += (view.tzoom - view.zoom) * k; view.cx += (view.tcx - view.cx) * k; view.cy += (view.tcy - view.cy) * k;
      camera.zoom = view.zoom; camera.position.set(view.cx, view.cy, 100); camera.updateProjectionMatrix();
      UC.uSize.value = Math.max(phone ? 1.0 : 1.5, Math.min(3.2, view.zoom / 36)) * DPR;

      // screen geometry per stage
      stages.forEach((st, i) => {
        const o = U.uOff.value[i], pg = poly[i];
        let tx = 0, ty = 0, top = 0, topY = Infinity, bot = 0, botY = -Infinity, rgt = 0, rgtX = -Infinity;
        for (let j = 0; j < 16; j++) {
          const a = j / 16 * Math.PI * 2;
          const s = toScreen(tmp.set(st.X + o.x, (st.R + 0.2) * Math.cos(a), (st.R + 0.2) * Math.sin(a)));
          pg[j * 2] = s.x; pg[j * 2 + 1] = s.y; tx += s.x; ty += s.y;
          if (s.y < topY) { topY = s.y; top = j; } if (s.y > botY) { botY = s.y; bot = j; } if (s.x > rgtX) { rgtX = s.x; rgt = j; }
        }
        cen[i].x = tx / 16; cen[i].y = ty / 16;
        st.top = top; st.bot = bot; st.rgt = rgt;
      });

      // hover / focus / query → per-stage brightness
      hover = labHover >= 0 ? labHover : (mouse.in && !dragging ? pick(mouse.x, mouse.y) : -1);
      root.classList.toggle('dragging', dragging && moved > 6);
      canvas.style.cursor = dragging ? 'grabbing' : hover >= 0 ? 'pointer' : 'grab';
      const focus = open >= 0 ? open : hover;
      for (let i = 0; i < N; i++) {
        let target = 1;
        if (focus >= 0) target = i === focus ? 1.5 : 0.16;
        else if (hl && hl.size) target = hl.has(i) ? 1.45 : 0.14;
        else if (query && query.size) target = query.has(i) ? 1.45 : 0.14;
        else if (query) target = 0.35;
        dimCur[i] += (target - dimCur[i]) * (reduced ? 1 : Math.min(1, dt * 9));
        U.uDim.value[i] = dimCur[i];
        U.uHot.value[i] += (((focus === i) || (hl && hl.has(i)) || (query && query.has(i)) ? 1 : 0) - U.uHot.value[i]) * (reduced ? 1 : Math.min(1, dt * 8));
        U.uFlash.value[i] *= Math.pow(0.02, dt);
      }
      U.uDim.value[N] = focus >= 0 || (hl && hl.size) || (query && query.size) ? 0.45 : 1;
      UQ.uDimT.value = tSt ? U.uDim.value[tradeIdx] * (isData ? 1.15 : 1) : 1;

      // pulses
      if (NP) {
        const fade = Math.min(1, Math.max(0, (t - 1.9) / 1.2));
        for (let j = 0; j < NP; j++) {
          const p = pool[j];
          if (p.delay > 0) { p.delay -= dt; pulseCol[j * 3] = pulseCol[j * 3 + 1] = pulseCol[j * 3 + 2] = 0; if (p.delay <= 0) spawn(p); continue; }
          if (!p.path) spawn(p);
          p.t += p.v * dt;
          if (p.t >= 1) {
            const s0 = p.path.stage;
            if (!p.path.shaft) { U.uFlash.value[s0] = Math.min(1.4, U.uFlash.value[s0] + 0.55); if (s0 < N - 1 && Math.random() < 0.55) { spawn(p, shaftPaths[s0]); continue; } }
            spawn(p); continue;
          }
          p.path.at(p.t, tmp);
          const o = U.uOff.value[p.path.stage];
          pulsePos[j * 3] = tmp.x + o.x; pulsePos[j * 3 + 1] = tmp.y; pulsePos[j * 3 + 2] = tmp.z;
          const dd = U.uDim.value[p.path.stage] * fade * Math.sin(Math.PI * Math.min(1, p.t * 1.15));
          if (p.path.shaft) { pulseCol[j * 3] = 0.35 * dd; pulseCol[j * 3 + 1] = 1.0 * dd; pulseCol[j * 3 + 2] = 0.6 * dd; }
          else { pulseCol[j * 3] = 1.0 * dd; pulseCol[j * 3 + 1] = 0.62 * dd; pulseCol[j * 3 + 2] = 0.22 * dd; }
        }
        pulseGeo.attributes.position.needsUpdate = true; pulseGeo.attributes.aCol.needsUpdate = true;
      }

      // labels + leaders
      labelsOn = reduced ? 1 : Math.min(1, Math.max(0, (t - 2.2) / 0.8));
      labLayer.style.opacity = labelsOn; svg.style.opacity = labelsOn;
      const lastR = [-Infinity, -Infinity]; let lastB = -Infinity; const surfW = surf.offsetWidth; const navB = nav.getBoundingClientRect().bottom - root.getBoundingClientRect().top;
      stages.forEach((st, i) => {
        const L = labs[i], o = U.uOff.value[i];
        let ai;
        if (phone) ai = st.rgt; else ai = (i % 2 === 0) ? st.top : st.bot;
        const a = ai / 16 * Math.PI * 2;
        const s = toScreen(tmp.set(st.X + o.x, (st.R + 0.2) * Math.cos(a), (st.R + 0.2) * Math.sin(a)));
        const bw = L.b.offsetWidth, bh = L.b.offsetHeight;
        let lx, ly, ex, ey;
        if (phone) { lx = s.x + 24; ly = Math.max(s.y - bh / 2, lastB + 3); lastB = ly + bh; ex = lx - 3; ey = ly + bh / 2; L.b.style.maxWidth = Math.max(110, W - lx - 10) + 'px'; }
        else if (i % 2 === 0) { lx = s.x - bw / 2; ly = s.y - 30 - bh; ex = s.x; ey = ly + bh + 4; }
        else { lx = s.x - bw / 2; ly = s.y + 30; ex = s.x; ey = ly - 4; }
        const inSurf = route.sec !== 'machine';
        if (!phone && !inSurf && lx < lastR[i % 2] + 10) lx = lastR[i % 2] + 10;
        lx = Math.max(8, Math.min((inSurf && !phone ? W - surfW : W) - bw - 8, lx));
        if (!phone) lastR[i % 2] = lx + bw;
        if (!phone && route.sec === 'machine') for (const o of obst) {
          if (lx > o.r + 10 || lx + bw < o.l - 10) continue;
          if (i % 2 === 0 && o.b < H / 2) { if (ly < o.b + 10) { ly = o.b + 10; ey = ly + bh + 4; } }
          else if (i % 2 === 1 && o.t > H / 2) { if (ly + bh > o.t - 10) { ly = o.t - bh - 10; ey = ly - 4; } }
        }
        if (inSurf && !phone && ly < navB + 10) { ly = navB + 10; ey = i % 2 === 0 ? ly + bh + 4 : ly - 4; }
        L.b.style.transform = `translate3d(${lx.toFixed(1)}px,${ly.toFixed(1)}px,0)`;
        const lit = (open === i || hover === i || (hl && hl.has(i)) || (query && query.has(i)));
        const dimmed = (open >= 0 || hover >= 0) ? !(open === i || hover === i) : (hl && hl.size) ? !hl.has(i) : (query && query.size ? !query.has(i) : false);
        L.b.classList.toggle('lit', !!lit); L.b.classList.toggle('dim', !!dimmed);
        L.line.setAttribute('x1', s.x.toFixed(1)); L.line.setAttribute('y1', s.y.toFixed(1));
        L.line.setAttribute('x2', ex.toFixed(1)); L.line.setAttribute('y2', ey.toFixed(1));
        L.dot.setAttribute('cx', s.x.toFixed(1)); L.dot.setAttribute('cy', s.y.toFixed(1));
        L.line.setAttribute('class', lit ? 'lit' : dimmed ? 'dim' : '');
        L.dot.setAttribute('class', lit ? 'lit' : dimmed ? 'dim' : '');
      });
      if (tSt) {
        const o = U.uOff.value[tradeIdx];
        const s = toScreen(tmp.set(chainX0 + chainDir * chainPhase * CH.s + o.x, CH.b / 2, 0));
        const bw = chainLab.offsetWidth;
        const bh = chainLab.offsetHeight;
        let lx = s.x - 6, ly = s.y - CH.b * view.zoom - bh - 6;
        if (isData && !phone) { const q = toScreen(tmp.set(chainX0 + chainDir * 2.5 * CH.s + o.x, -CH.b / 2, 0)); lx = q.x - bw / 2; ly = q.y + 50; }
        if (phone) { lx = s.x + 20; ly = s.y - 10; }
        chainLab.style.transform = `translate3d(${Math.max(8, Math.min(W - bw - 8, lx)).toFixed(1)}px,${ly.toFixed(1)}px,0)`;
        blockLabs.forEach((bl, k) => {
          const q = toScreen(tmp.set(chainX0 + chainDir * (k + chainPhase) * CH.s + o.x, -CH.b / 2, 0));
          const h = hashes[k];
          const txt = h ? h.slice(0, 8) : '';
          if (bl.textContent !== txt) bl.textContent = txt;
          const fadeK = Math.min(1, k + chainPhase) * Math.max(0, 1 - (k + chainPhase) / 6.5);
          bl.classList.toggle('h', k === 0);
          bl.style.transform = `translate3d(${(q.x - 30).toFixed(1)}px,${(q.y + 8).toFixed(1)}px,0)`;
          bl.style.opacity = (UQ.uRevT.value > 0.5 && route.sec === 'machine' ? fadeK : 0) * (U.uDim.value[tradeIdx] > 0.5 ? 1 : 0.2);
        });
        chainLab.style.opacity = headHash && UQ.uRevT.value > 0.5 && (route.sec === 'machine' || open === tradeIdx || (hl && hl.has(tradeIdx))) ? (U.uDim.value[tradeIdx] > 0.5 ? 1 : 0.2) : 0;
      }

      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && alive) raf = requestAnimationFrame(frame); }

    // ---------- resize ----------
    function onResize() {
      ({ W, H } = vp());
      const wasPhone = phone; phone = W < 760;
      if (wasPhone !== phone) { yaw0 = phone ? 0 : -0.66; pitch0 = phone ? 0.72 : 0.17; yaw = yaw0; pitch = pitch0; prin.open = !phone; layoutX(phone ? 0.6 : 1.05); }
      renderer.setSize(W, H);
      camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2;
      root.classList.toggle('phone', phone);
      placePhone();
      measureObstacles();
      fit();
      applyView();
      snapView();
      kick();
    }
    root.classList.toggle('phone', phone);
    on(window, 'resize', onResize);
    on(prin, 'toggle', () => { if (phone) { fit(); if (open < 0) snapView(); kick(); } });
    placePhone(); measureObstacles(); fit(); snapView();
    applyRoute(parse()); snapView();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (alive) onResize(); });
    const relayT = setTimeout(() => { if (alive) onResize(); }, 600); cleanup.push(() => clearTimeout(relayT));
    if (reduced) {
      // still version: assembled, counters final, a static chain head
      if (subtle) { for (let k = 0; k < 3; k++) await nextHash(); }
    } else nextHash();
    raf = requestAnimationFrame(frame);

    // ---------- unmount ----------
    return function unmount() {
      alive = false;
      if (io) { io.disconnect(); io = null; }
      if (raf) cancelAnimationFrame(raf); raf = 0;
      cleanup.forEach(f => f()); cleanup.length = 0;
      [lineGeo, cellGeo, pulseGeo, chainGeo].forEach(g => g.dispose());
      [lineMat, cellMat, pulseMat, chainMat].forEach(m => m.dispose());
      renderer.dispose(); renderer.forceContextLoss();
      link.remove(); style.remove();
      root.className = rootClass;
      root.replaceChildren();
    };

    // ---------- helpers ----------
    function mkPath(pts, stage, shaft = false) {
      const segs = []; let len = 0;
      for (let k = 0; k < pts.length - 1; k++) { const l = pts[k].distanceTo(pts[k + 1]); segs.push([pts[k], pts[k + 1], len, l]); len += l; }
      return {
        stage, shaft, len,
        at(t, out) {
          const d = t * len;
          for (const [a, b, s0, l] of segs) if (d <= s0 + l) return out.copy(a).lerp(b, (d - s0) / l);
          return out.copy(pts[pts.length - 1]);
        },
      };
    }
  },
};

// ---------------- shaders ----------------
const LINE_VS = `
attribute float aStage; attribute float aKind; attribute float aOrd;
uniform float uTime; uniform float uDim[__S__]; uniform float uRev[__S__]; uniform vec3 uOff[__S__];
uniform float uSpin[__S__]; uniform float uSpd[__S__]; uniform float uHot[__S__]; uniform float uFlash[__S__];
varying vec3 vCol;
void main(){
  int s = int(aStage + 0.5); int k = int(aKind + 0.5);
  vec3 p = position;
  float ang = uSpin[s];
  if (k == 1) ang += uTime * uSpd[s];
  if (s < __S__ - 1) { float c = cos(ang), sn = sin(ang); p.yz = vec2(c * p.y - sn * p.z, sn * p.y + c * p.z); }
  p += uOff[s];
  float rev = smoothstep(aOrd - 0.06, aOrd, uRev[s]);
  vec3 col;
  if (k == 0) col = vec3(.30,.40,.35);
  else if (k == 1) col = vec3(.17,.26,.21);
  else if (k == 2) col = mix(vec3(.40,.25,.08), vec3(1.,.66,.28), uHot[s]);
  else if (k == 3) col = vec3(.34,.50,.42);
  else if (k == 4) col = vec3(.30,.40,.34);
  else if (k == 5) col = vec3(.12,.16,.14);
  else col = vec3(.34,.52,.43) + vec3(.25,.9,.5) * uFlash[s];
  vCol = col * rev * uDim[s];
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const LINE_FS = `varying vec3 vCol; void main(){ gl_FragColor = vec4(vCol, 1.0); }`;

const CELL_VS = `
attribute float aStage; attribute float aSuite; attribute float aIdx;
uniform float uDim[__S__]; uniform float uRev[__S__]; uniform vec3 uOff[__S__]; uniform float uSpin[__S__];
uniform float uProg[__U__]; uniform float uRing[__U__]; uniform float uSize;
varying vec3 vCol;
void main(){
  int s = int(aStage + 0.5); int u = int(aSuite + 0.5);
  vec3 p = position;
  float c = cos(uSpin[s]), sn = sin(uSpin[s]);
  p.yz = vec2(c * p.y - sn * p.z, sn * p.y + c * p.z);
  p += uOff[s];
  float pr = uProg[u];
  float lit = step(aIdx + 0.5, pr);
  float head = lit * (1.0 - smoothstep(0.0, 22.0, pr - aIdx));
  vec3 off = vec3(.075,.095,.085);
  vec3 onc = uRing[u] > 0.5 ? vec3(1.0,.68,.30) : vec3(.42,1.0,.64);
  vCol = (mix(off, onc * .78, lit) + head * vec3(.55,.55,.45)) * uDim[s] * smoothstep(.6, 1., uRev[s]);
  gl_PointSize = uSize * (1.0 + head * 0.9);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const CELL_FS = `varying vec3 vCol; void main(){ vec2 q = abs(gl_PointCoord - .5); if (max(q.x, q.y) > .42) discard; gl_FragColor = vec4(vCol, 1.0); }`;

const PULSE_VS = `
attribute vec3 aCol; uniform float uSize; varying vec3 vCol;
void main(){ vCol = aCol; gl_PointSize = uSize; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const PULSE_FS = `varying vec3 vCol; void main(){ float d = length(gl_PointCoord - .5) * 2.; float a = exp(-d * d * 5.) + .9 * exp(-d * d * 60.); gl_FragColor = vec4(vCol * a, 1.0); }`;

const CHAIN_VS = `
attribute float aK; uniform float uPhase; uniform float uDir; uniform float uSp; uniform float uN; uniform float uDimT; uniform float uRevT; uniform vec3 uOffT;
varying vec3 vCol;
void main(){
  vec3 p = position;
  float e = aK + uPhase;
  if (aK >= 0.0) p.x += uDir * uPhase * uSp;
  p += uOffT;
  float a = aK < 0.0 ? 1.0 : smoothstep(0.0, 1.0, e) * (1.0 - smoothstep(uN * 0.35, uN - 1.0, e));
  float head = aK < 0.0 ? 0.0 : 1.0 - smoothstep(0.0, 1.6, e);
  vCol = (vec3(.26,.62,.46) + head * vec3(.4,.5,.3)) * a * uDimT * uRevT;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const CHAIN_FS = `varying vec3 vCol; void main(){ gl_FragColor = vec4(vCol, 1.0); }`;

// ---------------- styles ----------------
const CSS = `
.engw { --bg:${BG}; --ink:#dfe7e1; --mut:#8a978f; --dim:#56625b; --ph:#8affb9; --am:#ffb65c; --hair:rgba(170,200,182,.16);
  background: radial-gradient(120% 95% at 52% 46%, #121715 0%, #0b0e0d 52%, #060707 100%); color:var(--ink);
  font-family:"Schibsted Grotesk", ui-sans-serif, sans-serif; -webkit-font-smoothing:antialiased; user-select:none; }
.engw .vig { position:absolute; inset:0; pointer-events:none;
  background: radial-gradient(115% 95% at 50% 46%, rgba(0,0,0,0) 35%, rgba(3,4,4,.55) 80%, rgba(2,3,3,.8) 100%); }
.engw .vig::before { content:""; position:absolute; inset:0; pointer-events:none;
  background-image: linear-gradient(rgba(140,190,160,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(140,190,160,.035) 1px, transparent 1px);
  background-size: 48px 48px; -webkit-mask-image: radial-gradient(80% 70% at 50% 50%, #000 30%, transparent 80%); mask-image: radial-gradient(80% 70% at 50% 50%, #000 30%, transparent 80%); }
.engw .cv { position:absolute; inset:0; width:100%; height:100%; display:block; touch-action:none; cursor:grab; }
.engw .leaders { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; overflow:visible; }
.engw .leaders line { stroke:rgba(170,210,186,.32); stroke-width:1; transition:stroke .25s, opacity .25s; }
.engw .leaders circle { fill:rgba(170,210,186,.7); }
.engw .leaders .lit { stroke:var(--ph); fill:var(--ph); }
.engw .leaders .dim { opacity:.18; }
.engw .labs { position:absolute; inset:0; pointer-events:none; }
.engw .lab { position:absolute; left:0; top:0; pointer-events:auto; display:flex; flex-direction:column; gap:3px; align-items:flex-start;
  background:rgba(9,11,10,.55); border:0; border-left:1px solid var(--hair); padding:5px 9px 6px; color:var(--ink); text-align:left; cursor:pointer;
  font:inherit; max-width:340px; transition:opacity .25s, border-color .25s, background .25s; will-change:transform; }
.engw .lab:focus-visible { outline:1px solid var(--ph); outline-offset:2px; }
.engw .lab.lit { border-left-color:var(--ph); background:rgba(9,14,11,.82); }
.engw .lab.dim { opacity:.28; }
.engw .lab .lt { display:flex; align-items:center; gap:7px; }
.engw .lab .sw { width:6px; height:6px; flex:none; }
.engw .lab .nm { font-weight:500; font-size:13.5px; letter-spacing:-.005em; white-space:nowrap; }
.engw .lab .kd { font:300 10px/1.2 "Martian Mono", ui-monospace, monospace; color:var(--mut); letter-spacing:.01em; white-space:nowrap; }
.engw .lab .ro { font:400 10.5px/1.3 "Martian Mono", ui-monospace, monospace; color:var(--mut); white-space:nowrap; }
.engw .lab .ro b { color:var(--ph); font-weight:500; font-variant-numeric:tabular-nums; }
.engw .lab .hit { font:400 10.5px/1.35 "Schibsted Grotesk", sans-serif; color:var(--am); max-width:220px; white-space:normal; }
.engw .lab .hit:empty { display:none; }
.engw .chainlab { position:absolute; left:0; top:0; display:flex; flex-direction:column; gap:2px; font:400 10px/1.3 "Martian Mono", ui-monospace, monospace;
  color:var(--mut); white-space:nowrap; transition:opacity .3s; pointer-events:none; }
.engw .chainlab .c1 { color:var(--ph); }
.engw .chainlab .c3 { color:var(--dim); font-size:9px; }
.engw.is-data:not(.phone) .chainlab .c1, .engw.is-data:not(.phone) .chainlab .c2 { display:none; }
.engw.is-data .chainlab { align-items:center; }
.engw .blab.h { color:var(--ph); }
.engw.is-data .chainlab .c3 { font-size:9.5px; }
.engw .blab { position:absolute; left:0; top:0; width:60px; font-size:10px !important; text-align:center; font:300 9.5px "Martian Mono", ui-monospace, monospace; color:#5f8a73; pointer-events:none; }
.engw .hd { position:absolute; left:40px; top:92px; max-width:min(680px, calc(50vw - 64px)); pointer-events:none; z-index:2; }
.engw .h1 { transition:opacity .4s; margin:0; font-weight:500; font-size:21px; line-height:1.18; letter-spacing:-.015em; color:var(--ink); }
.engw .hint { margin:10px 0 0; display:flex; gap:14px; flex-wrap:wrap; font:300 10.5px "Martian Mono", ui-monospace, monospace; color:var(--mut); }
.engw kbd { font:400 10px "Martian Mono", ui-monospace, monospace; color:var(--ink); border:1px solid var(--hair); padding:1px 5px; }
.engw .legend { position:absolute; right:40px; top:92px; width:250px; display:flex; flex-direction:column; gap:7px; font:300 10.5px/1.35 "Martian Mono", ui-monospace, monospace; color:var(--mut); pointer-events:none; }
.engw .legend .lg { display:flex; gap:10px; align-items:center; }
.engw .legend i { width:7px; height:7px; flex:none; }
.engw .legend i.g { background:var(--ph); }
.engw .legend i.a { background:var(--am); border-radius:50%; box-shadow:0 0 8px var(--am); }
.engw .legend i.c { border:1px solid var(--ph); width:6px; height:6px; }
.engw .legend .lgn { margin-top:3px; padding-top:8px; border-top:1px solid var(--hair); color:var(--dim); }
.engw .prin { position:absolute; right:40px; bottom:34px; width:330px; }
.engw .prin summary { list-style:none; display:flex; gap:10px; align-items:center; font-weight:500; font-size:17px; letter-spacing:-.01em; cursor:pointer; }
.engw .prin summary::-webkit-details-marker { display:none; }
.engw .prin summary i { width:8px; height:8px; background:var(--ph); box-shadow:0 0 12px rgba(138,255,185,.6); flex:none; }
.engw .prin p { margin:8px 0 0 18px; font-size:13px; line-height:1.5; color:#a7b4ac; }
.engw .id { position:absolute; left:40px; bottom:34px; width:min(400px, 32vw); }
.engw .who { font-weight:600; font-size:30px; letter-spacing:-.025em; line-height:1; }
.engw .role { margin-top:7px; font:300 10.5px "Martian Mono", ui-monospace, monospace; color:var(--mut); }
.engw .lede { margin:10px 0 12px; font-size:13px; line-height:1.5; color:#a7b4ac; }
.engw .ct { display:flex; flex-direction:column; gap:8px; }
.engw .ct a { color:var(--ink); text-decoration:none; }
.engw .gh { display:inline-flex; align-items:baseline; gap:10px; align-self:flex-start; padding:7px 12px 7px 0; border-bottom:1px solid var(--ph); }
.engw .gh .k { font-weight:600; font-size:15px; }
.engw .gh .v { font:400 11.5px "Martian Mono", ui-monospace, monospace; color:var(--ph); }
.engw .gh .ar { color:var(--ph); }
.engw .gh:hover .v, .engw .gh:focus-visible .v { text-decoration:underline; }
.engw .row2 { display:flex; gap:18px; font:400 11px "Martian Mono", ui-monospace, monospace; }
.engw .row2 a { color:#b9c5be; border-bottom:1px solid var(--hair); padding-bottom:1px; }
.engw .row2 a:hover { color:var(--ph); }
.engw .avail { margin-top:10px; font:300 10px "Martian Mono", ui-monospace, monospace; color:var(--dim); }
.engw .cmd { position:absolute; left:50%; bottom:34px; transform:translateX(-50%); width:min(380px, 30vw); }
.engw .cf { display:flex; align-items:center; gap:10px; height:42px; padding:0 12px; border:1px solid var(--hair); background:rgba(8,10,9,.7); }
.engw .cf:focus-within { border-color:rgba(138,255,185,.55); box-shadow:0 0 0 3px rgba(138,255,185,.07); }
.engw .cf .sl { font:500 14px "Martian Mono", monospace; color:var(--ph); }
.engw .cf input { flex:1; min-width:0; background:transparent; border:0; outline:none; color:var(--ink); font:400 13px "Martian Mono", ui-monospace, monospace; user-select:text; }
.engw .cf input::placeholder { color:var(--dim); }
.engw .cf .kb { font:300 10px "Martian Mono", monospace; color:var(--dim); }
.engw .res { min-height:15px; margin-top:7px; font:300 10.5px/1.4 "Martian Mono", ui-monospace, monospace; color:var(--am); }
.engw .try { display:flex; gap:12px; align-items:baseline; font:300 10.5px "Martian Mono", ui-monospace, monospace; color:var(--dim); }
.engw .try button { background:none; border:0; padding:0; color:var(--mut); font:inherit; cursor:pointer; border-bottom:1px dotted var(--dim); }
.engw .try button:hover, .engw .try button:focus-visible { color:var(--ph); border-bottom-color:var(--ph); outline:none; }
.engw .ix { display:flex; flex-wrap:wrap; gap:4px 14px; margin-top:12px; pointer-events:auto; }
.engw .ix a { display:inline-flex; gap:6px; align-items:baseline; font:400 11px "Martian Mono", ui-monospace, monospace; color:var(--mut); text-decoration:none; padding:3px 0; border-bottom:1px solid transparent; }
.engw .ix a .n { color:var(--dim); font-size:9.5px; }
.engw .ix a:hover, .engw .ix a:focus-visible { color:var(--ink); border-bottom-color:var(--hair); outline:none; }
.engw .ix a[aria-current] { color:var(--ph); border-bottom-color:var(--ph); }
.engw .ix a[aria-current] .n { color:var(--ph); }
.engw .legend .hint { margin:0 0 6px; }
.engw .surf { position:absolute; right:0; top:84px; bottom:0; width:min(700px, 50vw); box-sizing:border-box; display:flex; flex-direction:column;
  background:#080a09; border-left:1px solid var(--hair);
  transform:translateX(102%); transition:transform .55s cubic-bezier(.2,.8,.2,1); user-select:text; }
.engw .surf.on { transform:none; }
.engw .surf::before { content:""; position:absolute; left:-1px; top:0; width:1px; height:64px; background:var(--ph); box-shadow:0 0 10px rgba(138,255,185,.6); }
.engw .sbar { flex:none; display:flex; align-items:center; gap:12px; height:48px; padding:0 22px 0 40px; border-bottom:1px solid var(--hair); }
.engw .crumb { flex:1; min-width:0; font:300 10.5px "Martian Mono", ui-monospace, monospace; color:var(--mut); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.engw .px { display:inline-flex; align-items:center; justify-content:center; background:none; border:1px solid var(--hair); color:var(--ink); width:30px; height:30px; font-size:17px; line-height:1; cursor:pointer; text-decoration:none; box-sizing:border-box; }
.engw .px:hover, .engw .px:focus-visible { border-color:var(--ph); color:var(--ph); outline:none; }
.engw .sin { flex:1; overflow-y:auto; overscroll-behavior:contain; padding:30px 44px 70px 40px; scrollbar-width:thin; scrollbar-color:#2a332e transparent; outline:none; }
.engw .sin .code { font:400 10px "Martian Mono", ui-monospace, monospace; color:var(--dim); letter-spacing:.04em; white-space:nowrap; }
.engw .ch { margin-bottom:22px; }
.engw .kick { display:flex; gap:10px; align-items:center; font:300 10.5px "Martian Mono", ui-monospace, monospace; color:var(--mut); }
.engw .kick .sw { width:8px; height:8px; flex:none; }
.engw .sin h2 { margin:14px 0 10px; font-weight:600; font-size:clamp(30px, 3.4vw, 46px); letter-spacing:-.035em; line-height:1; outline:none; }
.engw .sin .pl { margin:0; font-size:16px; line-height:1.45; color:#c9d4cd; max-width:56ch; }
.engw .sin .sum { margin:0 0 22px; font-size:14px; line-height:1.6; color:#aebbb3; max-width:62ch; }
.engw .sin section { margin:0 0 30px; }
.engw .sin section > p { margin:0; font-size:14px; line-height:1.62; color:#b5c1ba; max-width:62ch; }
.engw .sh { display:flex; align-items:baseline; gap:12px; margin:0 0 10px; padding-top:12px; border-top:1px solid var(--hair); }
.engw .sh h3 { margin:0; font-weight:500; font-size:17px; letter-spacing:-.01em; color:var(--ink); }
.engw .sh .code { color:var(--ph); }
.engw .shs { margin:-4px 0 14px !important; font:300 10.5px/1.5 "Martian Mono", ui-monospace, monospace !important; color:var(--dim) !important; }
.engw .pn { display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:1px; background:var(--hair); border:1px solid var(--hair); margin:0 0 28px; }
.engw .pn > div { background:#0a0c0b; padding:12px 14px; display:flex; flex-direction:column; gap:5px; }
.engw .pn b { font:500 19px "Martian Mono", ui-monospace, monospace; color:var(--ph); letter-spacing:-.03em; }
.engw .pn span { font-size:11.5px; line-height:1.35; color:var(--mut); }
.engw .pn time { font:300 9.5px "Martian Mono", ui-monospace, monospace; color:var(--dim); margin-top:auto; }
.engw .env, .engw .ck, .engw .bom, .engw .bomt, .engw .parts { margin:0; padding:0; list-style:none; }
.engw .env li { display:grid; grid-template-columns:52px 1fr; gap:10px; padding:9px 0; border-bottom:1px dashed rgba(170,200,182,.1); font-size:13.5px; line-height:1.55; color:#bcc8c1; }
.engw .sp { position:relative; list-style:none; margin:0; padding:0 0 0 34px; }
.engw .sp::before { content:""; position:absolute; left:6px; top:6px; bottom:6px; width:1px; background:linear-gradient(var(--hair), rgba(170,200,182,.3), var(--hair)); }
.engw .sp::after { content:""; position:absolute; left:3px; top:0; width:7px; height:7px; border-radius:50%; background:var(--am); box-shadow:0 0 12px var(--am); animation:engRun 3.4s linear infinite; }
@keyframes engRun { 0% { top:0; opacity:0; } 8% { opacity:1; } 92% { opacity:1; } 100% { top:calc(100% - 7px); opacity:0; } }
.engw .sp li { position:relative; padding:4px 0 18px; }
.engw .sp .node { position:absolute; left:-32px; top:7px; width:9px; height:9px; box-sizing:border-box; border:1px solid var(--dim); background:var(--bg); transition:background .3s, border-color .3s, box-shadow .3s; }
.engw .sp li.on .node { background:var(--ph); border-color:var(--ph); box-shadow:0 0 10px rgba(138,255,185,.7); }
.engw .sp li .code { display:block; margin-bottom:3px; }
.engw .sp b { font-weight:500; font-size:15px; color:#cfd9d3; transition:color .3s; }
.engw .sp li.on b { color:var(--ph); }
.engw .sp p { margin:4px 0 0; font-size:13.5px; line-height:1.55; color:#aab7af; max-width:58ch; }
.engw .sa { display:grid; grid-template-columns:52px 1fr; gap:10px; padding:11px 0; border-bottom:1px solid rgba(170,200,182,.08); }
.engw .sa b { font-weight:500; font-size:14.5px; color:var(--ink); }
.engw .sa p { margin:4px 0 0; font-size:13.5px; line-height:1.55; color:#aab7af; }
.engw .swr { display:grid; grid-template-columns:62px 1fr; gap:12px; padding:14px 0; border-bottom:1px solid rgba(170,200,182,.08); }
.engw .swg { overflow:visible; margin-top:4px; }
.engw .swg line { stroke:rgba(170,210,186,.45); stroke-width:1.2; }
.engw .swg .lv { stroke:var(--ph); }
.engw .swg .dash { stroke:var(--am); stroke-dasharray:2 3; }
.engw .swg .pv { fill:var(--ink); } .engw .swg .on { fill:var(--ph); } .engw .swg .off { fill:none; stroke:var(--am); stroke-width:1.2; }
.engw .swt .code { display:block; margin-bottom:4px; color:var(--ph); }
.engw .swt b { display:block; font-weight:500; font-size:15px; line-height:1.4; color:var(--ink); }
.engw .swt .why { margin:8px 0 0; font-size:13.5px; line-height:1.58; color:#aab7af; }
.engw .swt .tr { margin:10px 0 0; padding-left:12px; border-left:1px dashed var(--am); font-size:13px; line-height:1.55; color:#c9b89c; }
.engw .swt .tag { display:block; font:400 9.5px "Martian Mono", ui-monospace, monospace; color:var(--am); text-transform:uppercase; letter-spacing:.1em; margin-bottom:3px; }
.engw .ms { display:grid; grid-template-columns:96px 1fr; gap:12px; padding:12px 0; border-bottom:1px solid rgba(170,200,182,.08); }
.engw .msm { display:flex; flex-direction:column; gap:4px; }
.engw .msm time { font:300 10px "Martian Mono", ui-monospace, monospace; color:var(--mut); }
.engw .ms b { font-weight:500; font-size:14px; line-height:1.45; color:var(--ink); }
.engw .ms p { margin:5px 0 0; font-size:13.5px; line-height:1.55; color:#aab7af; }
.engw .bom { display:grid; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:1px; background:var(--hair); border:1px solid var(--hair); }
.engw .bom li { background:#0a0c0b; padding:9px 11px; display:flex; flex-direction:column; gap:3px; font-size:12.5px; line-height:1.4; color:#c2cdc6; }
.engw .tl { position:relative; display:grid; grid-template-columns:62px 1fr; gap:10px; padding:11px 0 11px 0; border-bottom:1px dashed rgba(255,182,92,.18); }
.engw .tl .code { color:var(--am); }
.engw .tl p { margin:0; font-size:13.5px; line-height:1.58; color:#c4b9a6; }
.engw .tl::before { content:""; position:absolute; left:0; top:28px; width:44px; height:5px; border-left:1px solid var(--am); border-right:1px solid var(--am); background:linear-gradient(90deg, transparent 30%, rgba(255,182,92,.5) 30% 70%, transparent 70%) center/100% 1px no-repeat; }
.engw .wdx { padding:14px 16px; border:1px solid rgba(255,182,92,.25); background:rgba(255,182,92,.03); }
.engw .wdx .sh { border-top:0; padding-top:0; } .engw .wdx .sh .code { color:var(--am); }
.engw .wdx .pn { margin:14px 0 10px; } .engw .wdx .pn b { color:var(--am); }
.engw .ports { display:flex; flex-direction:column; }
.engw .ports a { display:grid; grid-template-columns:72px 1fr; gap:2px 12px; padding:10px 0; border-bottom:1px solid rgba(170,200,182,.08); text-decoration:none; }
.engw .ports .pc { grid-row:span 2; font:400 10px "Martian Mono", ui-monospace, monospace; color:var(--dim); padding-top:3px; }
.engw .ports .pt { font-size:14px; color:var(--ink); }
.engw .ports .pu { font:300 10.5px "Martian Mono", ui-monospace, monospace; color:var(--ph); overflow-wrap:anywhere; }
.engw .ports a:hover .pt, .engw .ports a:focus-visible .pt { color:var(--ph); }
.engw .pnx { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--hair); border:1px solid var(--hair); margin-top:34px; }
.engw .pnx a { background:#0a0c0b; padding:14px 16px; display:flex; flex-direction:column; gap:4px; text-decoration:none; color:var(--ink); font-weight:500; font-size:15px; }
.engw .pnx a.next { text-align:right; align-items:flex-end; }
.engw .pnx a:hover, .engw .pnx a:focus-visible { background:#0d1311; color:var(--ph); outline:none; }
.engw .ck li { display:flex; gap:10px; align-items:baseline; padding:6px 0; font-size:14px; line-height:1.45; color:#c2cdc6; }
.engw .ck i { width:7px; height:7px; flex:none; background:#1b221e; transform:translateY(-1px); animation:engLit .3s forwards; }
@keyframes engLit { to { background:var(--ph); box-shadow:0 0 8px rgba(138,255,185,.6); } }
.engw .parts li a { display:grid; grid-template-columns:34px 1fr auto; gap:14px; align-items:baseline; padding:14px 0; border-bottom:1px solid rgba(170,200,182,.1); text-decoration:none; color:var(--ink); }
.engw .parts li a:hover, .engw .parts li a:focus-visible { background:linear-gradient(90deg, rgba(138,255,185,.05), transparent); outline:none; }
.engw .parts .pm { display:flex; flex-direction:column; gap:4px; min-width:0; }
.engw .parts .pn2 { display:flex; gap:9px; align-items:center; } .engw .parts .pn2 b { font-weight:500; font-size:17px; } .engw .parts .sw { width:7px; height:7px; }
.engw .parts .pk2 { font:300 10px "Martian Mono", ui-monospace, monospace; color:var(--mut); }
.engw .parts .po { font-size:13px; line-height:1.45; color:#a7b4ac; }
.engw .parts .pr { font:400 10.5px "Martian Mono", ui-monospace, monospace; color:var(--ph); text-align:right; max-width:150px; }
.engw .rule { padding:18px 0 22px; border-top:1px solid var(--hair); }
.engw .rule .code { color:var(--ph); }
.engw .rule h4 { margin:8px 0 10px; font-weight:500; font-size:clamp(21px, 2vw, 27px); letter-spacing:-.02em; line-height:1.15; color:var(--ink); }
.engw .rule p { margin:0; font-size:15px; line-height:1.62; color:#b5c1ba; max-width:58ch; }
.engw .wd2 { margin-bottom:38px !important; }
.engw .wd2 .sh .code { color:var(--am); }
.engw .gauge { position:relative; height:74px; margin:20px 0 6px; }
.engw .gauge .track { position:absolute; left:0; right:0; top:36px; height:1px; background:rgba(170,200,182,.35); }
.engw .gauge .track::before { content:""; position:absolute; inset:-4px 0 auto 0; height:9px; background:repeating-linear-gradient(90deg, rgba(170,200,182,.35) 0 1px, transparent 1px 10%); }
.engw .gauge .pass { position:absolute; right:0; top:33px; height:7px; background:rgba(138,255,185,.12); border-left:1px solid var(--ph); }
.engw .gauge .gate, .engw .gauge .meas { position:absolute; top:0; bottom:0; width:0; }
.engw .gauge .gate { border-left:1px solid var(--ph); }
.engw .gauge .meas { border-left:2px solid var(--am); top:14px; }
.engw .gauge span { position:absolute; white-space:nowrap; font:400 10.5px "Martian Mono", ui-monospace, monospace; }
.engw .gauge .gate span { left:6px; top:-2px; color:var(--ph); }
.engw .gauge .meas span { right:6px; bottom:-2px; color:var(--am); }
.engw .gauge .gate.l span { left:auto; right:6px; } .engw .gauge .meas.r span { right:auto; left:6px; }
.engw .struck { display:flex; gap:6px; margin:18px 0 6px; }
.engw .struck i { position:relative; width:18px; height:18px; border:1px solid var(--am); background:rgba(255,182,92,.12); }
.engw .struck i::after { content:""; position:absolute; left:-3px; right:-3px; top:50%; height:1px; background:var(--am); transform:rotate(-45deg) scaleX(0); animation:engStrike .35s forwards; animation-delay:inherit; }
@keyframes engStrike { to { transform:rotate(-45deg) scaleX(1); } }
.engw .bomg { margin-bottom:26px !important; }
.engw .bomt li { display:grid; grid-template-columns:50px 1fr; gap:10px; padding:10px 6px 10px 0; border-bottom:1px solid rgba(170,200,182,.08); transition:background .2s; }
.engw .bomt li:hover, .engw .bomt li:focus-within { background:linear-gradient(90deg, rgba(138,255,185,.06), transparent); }
.engw .bomt .sk { display:block; font-size:14px; line-height:1.4; color:var(--ink); margin-bottom:6px; }
.engw .chips { display:flex; flex-wrap:wrap; gap:5px 6px; }
.engw .chip { font:400 10px "Martian Mono", ui-monospace, monospace; color:var(--mut); border:1px solid var(--hair); padding:2px 6px; text-decoration:none; }
.engw a.chip:hover, .engw a.chip:focus-visible { color:var(--ph); border-color:var(--ph); outline:none; }
.engw .plate { position:relative; padding:26px 28px 22px; margin-bottom:30px; border:1px solid rgba(170,200,182,.3); background:linear-gradient(160deg, rgba(170,200,182,.05), rgba(170,200,182,.01)); }
.engw .plate::before { content:""; position:absolute; inset:5px; border:1px solid rgba(170,200,182,.1); pointer-events:none; }
.engw .plate .screw { position:absolute; width:7px; height:7px; border-radius:50%; border:1px solid rgba(170,200,182,.4); }
.engw .plate .screw::after { content:""; position:absolute; left:1px; right:1px; top:2.5px; height:1px; background:rgba(170,200,182,.5); transform:rotate(35deg); }
.engw .plate .s1 { left:12px; top:12px; } .engw .plate .s2 { right:12px; top:12px; } .engw .plate .s3 { left:12px; bottom:12px; } .engw .plate .s4 { right:12px; bottom:12px; }
.engw .pname { font-weight:600; font-size:28px; letter-spacing:-.025em; }
.engw .prole { margin-top:6px; font:300 10.5px "Martian Mono", ui-monospace, monospace; color:var(--mut); }
.engw .plate dl { display:grid; grid-template-columns:110px 1fr; gap:9px 16px; margin:20px 0 0; }
.engw .plate dt { font:400 10px "Martian Mono", ui-monospace, monospace; color:var(--dim); text-transform:uppercase; letter-spacing:.08em; padding-top:3px; }
.engw .plate dd { margin:0; font-size:14px; line-height:1.5; color:#c7d2cb; }
.engw .plate .roles { display:flex; flex-wrap:wrap; gap:6px; }
.engw .plate .roles span { font:400 10.5px "Martian Mono", ui-monospace, monospace; color:var(--ph); border:1px solid rgba(138,255,185,.35); padding:2px 7px; }
.engw .outs { display:flex; flex-direction:column; margin:8px 0 32px; border-top:1px solid var(--hair); }
.engw .outs a { display:grid; grid-template-columns:64px 110px 1fr 20px; gap:12px; align-items:baseline; padding:20px 0; border-bottom:1px solid var(--hair); text-decoration:none; color:var(--ink); }
.engw .outs b { font-weight:500; font-size:22px; letter-spacing:-.015em; }
.engw .outs .pu { font:400 12px "Martian Mono", ui-monospace, monospace; color:var(--ph); overflow-wrap:anywhere; }
.engw .outs .ar { color:var(--ph); }
.engw .outs a:hover, .engw .outs a:focus-visible { background:linear-gradient(90deg, rgba(138,255,185,.06), transparent); outline:none; }
.engw .lk { display:inline-block; margin-top:12px; font:400 11.5px "Martian Mono", ui-monospace, monospace; color:var(--ink); text-decoration:none; border-bottom:1px solid var(--hair); padding-bottom:2px; }
.engw .lk.pri { color:var(--ph); border-bottom-color:var(--ph); }
.engw .lk:hover { color:var(--ph); }
.engw.reduced .sp::after, .engw.reduced .ck i, .engw.reduced .struck i::after { animation:none; }
.engw.reduced .ck i { background:var(--ph); } .engw.reduced .struck i::after { transform:rotate(-45deg); }
@media (prefers-reduced-motion: reduce) { .engw .sp::after { animation:none; display:none; } }
@media (max-width:1180px) { .engw .legend { display:none; } }
@media (max-height:960px) { .engw:not(.phone) .lede { display:none; } }
.engw .hd, .engw .legend, .engw .id, .engw .cmd, .engw .prin { transition:opacity .4s; }
.engw.focus .hd .h1, .engw.focus .legend, .engw.focus .id, .engw.focus .cmd, .engw.focus .prin { opacity:0; pointer-events:none; }
.engw.focus .lab:not(.lit) { opacity:0; pointer-events:none; }
.engw.incase .lab, .engw.incase .leaders line, .engw.incase .leaders circle, .engw.incase .chainlab, .engw.incase .blab { opacity:0 !important; pointer-events:none; }
.engw.dragging .lab:not(.lit) { opacity:.35; }
.engw.focus .leaders line:not(.lit), .engw.focus .leaders circle:not(.lit) { opacity:0; }
.engw.phone .hd { left:16px; right:16px; top:86px; max-width:none; }
.engw.phone .h1 { font-size:15.5px; line-height:1.25; }
.engw.phone .hint { gap:10px; margin-top:7px; }
.engw.phone .prin { left:16px; right:16px; width:auto; top:auto; bottom:auto; }
.engw.phone .prin summary { font-size:14px; }
.engw.phone .prin p { font-size:12px; margin-left:18px; }
.engw.phone .id { left:16px; right:16px; width:auto; bottom:14px; }
.engw.phone .who { font-size:20px; }
.engw.phone .lede, .engw.phone .avail { display:none; }
.engw.phone .role { margin-top:4px; }
.engw.phone .ct { flex-direction:row; flex-wrap:wrap; align-items:baseline; gap:6px 14px; margin-top:8px; }
.engw.phone .gh { padding:4px 0; }
.engw.phone .gh .k { font-size:13px; } .engw.phone .gh .v { font-size:10.5px; }
.engw.phone .row2 { gap:14px; font-size:10.5px; }
.engw.phone .cmd { left:16px; right:16px; width:auto; transform:none; bottom:auto; }
.engw.phone .cf { height:38px; }
.engw.phone .try { display:none; }
.engw.phone .res { min-height:0; }
.engw.phone .lab { padding:3px 7px; gap:0 8px; background:rgba(9,11,10,.6); flex-direction:row; flex-wrap:wrap; align-items:baseline; }
.engw.phone .lab .lt { flex:none; }
.engw.phone .lab .ro { flex:1 1 0; min-width:0; }
.engw.phone .lab .hit { flex-basis:100%; }
.engw.phone .lab .ro { overflow:hidden; text-overflow:ellipsis; max-width:100%; }
.engw.phone .lab .ro + .ro { display:none; }
.engw.phone .lab .nm { font-size:12px; }
.engw.phone .lab .kd { display:none; }
.engw.phone .lab .ro { font-size:9.5px; white-space:nowrap; }
.engw.phone .lab .hit { font-size:10px; max-width:100%; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.engw.phone .lab .hit:empty { display:none; }
.engw.phone.q .lab.dim { display:none; }
.engw.phone.q .leaders .dim { opacity:0; }
.engw.phone .res { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.engw.phone .chainlab { font-size:9px; }
.engw.phone .chainlab { display:none; }
.engw.phone .ix { flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; margin:8px -16px 0; padding:0 16px; gap:14px; }
.engw.phone .ix a { flex:none; }
.engw.phone.focus .hd .h1 { display:none; }
.engw.phone.focus .ix { margin-top:0; }
.engw.phone .surf { top:auto; left:0; right:0; bottom:0; width:auto; height:63%; border-left:0; border-top:1px solid var(--hair); transform:translateY(102%); }
.engw.phone .surf.on { transform:none; }
.engw.phone .surf::before { left:0; top:-1px; width:64px; height:1px; }
.engw.phone .sbar { height:44px; padding:0 12px 0 18px; }
.engw.phone .sin { padding:20px 18px 60px; }
.engw.phone .sin h2 { font-size:30px; }
.engw.phone .sin .pl { font-size:14.5px; }
.engw.phone .env li, .engw.phone .sa, .engw.phone .tl { grid-template-columns:44px 1fr; }
.engw.phone .swr { grid-template-columns:44px 1fr; } .engw.phone .swg { width:44px; }
.engw.phone .ms { grid-template-columns:1fr; gap:4px; } .engw.phone .msm { flex-direction:row; gap:10px; }
.engw.phone .pnx a { font-size:13px; padding:12px; }
.engw.phone .parts li a { grid-template-columns:24px 1fr; } .engw.phone .parts .pr { grid-column:2; text-align:left; max-width:none; }
.engw.phone .plate { padding:22px 18px 18px; } .engw.phone .plate dl { grid-template-columns:1fr; gap:2px; } .engw.phone .plate dd { margin-bottom:8px; }
.engw.phone .outs a { grid-template-columns:1fr 18px; gap:2px 10px; padding:14px 0; } .engw.phone .outs .code { grid-column:1; } .engw.phone .outs b { grid-column:1; font-size:19px; } .engw.phone .outs .pu { grid-column:1; } .engw.phone .outs .ar { grid-column:2; grid-row:1 / span 3; align-self:center; }
.engw.phone .bomt li { grid-template-columns:40px 1fr; }
`;
