// World: fold — "The Fold".
// Software, a hundred years on, is made like origami: everything starts as one flat sheet and folds itself, crease by
// crease, into a precise structure. Every form here is ONE sheet folded by real hinged rotations about its creases
// (worlds/fold/models.js). Open a form and it unfolds flat; the flat sheet is the case, typeset on paper with its own
// crease pattern as the structure. Every fact comes from content.mjs; nothing is invented.
import * as THREE from '../../vendor/three.module.js';
import { FORMS, ease } from './fold/models.js';

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..600&family=Spectral:ital,wght@0,300;0,400;0,500;1,300;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap';
const GROUND = '#e8e1d2';
const IVORY = '#f8f3e8';
const INDIGO = '#242a64';
const GOLD = '#b88d3a';

const ORDER = {
  software: ['unboundpdf', 'vvdex-engine', 'pitchradar', 'vvdex-platform', 'farmquick', 'conxto', 'conxfolio', 'vvdex-trading'],
  default: ['vvdex-platform', 'conxto', 'vvdex-engine', 'unboundpdf', 'pitchradar', 'farmquick', 'conxfolio', 'vvdex-trading'],
};
const FORM_OF = { 'vvdex-platform': 'box', conxto: 'crane', 'vvdex-engine': 'miura', unboundpdf: 'accordion', farmquick: 'tray', conxfolio: 'envelope', pitchradar: 'fan', 'vvdex-trading': 'chain' };
// the form, and why this crease pattern for this product (paraphrase of approved copy only)
const FORM_NOTE = {
  vv: ['one strip, three folds', 'A single strip, folded three times into the monogram.'],
  box: ['a sealed box', 'Each attempt runs in a closed box; the hidden tests grade from a separate one.'],
  crane: ['a crane', 'It carries the application. With Copilot you send it; Autopilot flies only inside rules you set.'],
  miura: ['a Miura-ori tessellation', 'One motion drives every crease: one paragraph compiled into a whole running service.'],
  accordion: ['an accordion of pages', 'Every page stays on the one sheet: 54 tools in the tab, 0 uploads.'],
  tray: ['a hexagonal crate', 'A crate for produce: the ordering site buyers use, and the agent that finds the next buyer.'],
  envelope: ['an envelope', 'Résumé, letter and portfolio, folded from one shared résumé.'],
  fan: ['a radial fan', 'Pleats that turn to listen: public event sources, ranked by rules you can read.'],
  chain: ['a chain of triangles', 'Each triangle hinged to the last, the way every dated call is hash-chained to the one before.'],
  tents: ['three place cards', 'Three sheets, each folded once.'],
  flattened: ['a sheet folded wrong, flattened back', 'The creases stay visible. So do the numbers.'],
  grid: ['a pleated index', 'Every skill, crossed with the products that use it.'],
  screen: ['a standing screen', 'Where I am, what I studied, what I am looking for.'],
  plane: ['a paper plane', 'Write, and it flies.'],
};
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi'];

export default {
  id: 'fold',
  color: GROUND,
  async mount(root, ctx) {
    const { person, work, principles, withdrawn } = ctx;
    const cases = ctx.cases || {};
    const capabilities = ctx.capabilities || [];
    const about = ctx.about || { facts: [] };
    const reduced = !!ctx.reduced;
    const isSoftware = ctx.audience === 'software' || !ctx.audience;
    const org = (ctx.org || '').trim();
    const cleanup = [];
    const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); cleanup.push(() => t.removeEventListener(ev, fn, opt)); };
    const el = (tag, cls, text, parent) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; if (parent) parent.appendChild(n); return n; };
    const SVGNS = 'http://www.w3.org/2000/svg';
    const sv = (tag, attrs, parent) => { const n = document.createElementNS(SVGNS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
    const ext = (a) => { a.target = '_blank'; a.rel = 'noopener'; return a; };

    // ---------- fonts + style ----------
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = FONT_HREF; document.head.appendChild(link);
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    root.classList.add('fw');
    if (reduced) root.classList.add('still');
    const vp = () => ({ W: root.clientWidth || innerWidth, H: root.clientHeight || innerHeight });
    let { W, H } = vp();
    let phone = W < 760;

    // ---------- content model ----------
    const bySlug = Object.fromEntries(work.map((w) => [w.slug, w]));
    const order = (isSoftware ? ORDER.software : ORDER.default).filter((s) => bySlug[s]);
    work.forEach((w) => { if (!order.includes(w.slug)) order.push(w.slug); });
    const nameToSlug = Object.fromEntries(work.map((w) => [w.name, w.slug]));
    const skillsFor = (name) => {
      const r = [];
      capabilities.forEach(([g, skills]) => skills.forEach(([s, prods]) => { if (prods.includes(name)) r.push([g, s]); }));
      return r;
    };
    // test counts, read verbatim from the approved copy
    const testsOf = (w) => {
      const out = [];
      (w.stage || w.numbers || []).forEach(([v, l]) => { if (/test/i.test(l)) out.push([v, l]); });
      (w.checks || []).forEach((c) => { const m = c.match(/^([\d,]+) (.+)$/); if (m && /test|check/i.test(m[2]) && !out.some((o) => o[0] === m[1])) out.push([m[1], m[2]]); });
      return out;
    };

    const stations = [];
    stations.push({ key: 'home', hash: '', form: 'vv', title: person.name });
    order.forEach((slug) => stations.push({ key: 'work', slug, hash: 'work/' + slug, form: FORM_OF[slug] || 'box', title: bySlug[slug].name, w: bySlug[slug], c: cases[slug] }));
    stations.push({ key: 'principles', hash: 'principles', form: 'tents', title: 'How I work' });
    stations.push({ key: 'withdrawn', hash: 'withdrawn', form: 'flattened', title: 'Claims I withdrew' });
    stations.push({ key: 'capabilities', hash: 'capabilities', form: 'grid', title: 'Capabilities' });
    stations.push({ key: 'about', hash: 'about', form: 'screen', title: 'About' });
    stations.push({ key: 'contact', hash: 'contact', form: 'plane', title: 'Contact' });
    const NS = stations.length;
    const workIdx = stations.map((s, i) => (s.key === 'work' ? i : -1)).filter((i) => i >= 0);
    const D = 7.2; // spacing between forms on the long sheet

    // ---------- three ----------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    const DPR = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H);
    renderer.setClearColor(GROUND, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement; canvas.className = 'cv'; canvas.setAttribute('aria-hidden', 'true');
    root.appendChild(canvas);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(GROUND);
    scene.fog = new THREE.Fog(GROUND, 12, 30);
    const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 120);
    const disposables = [];
    const keep = (x) => { disposables.push(x); return x; };

    // paper fibre: one small noise texture, mapped through the folds by flat-sheet coordinates
    const fibre = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
      const img = g.createImageData(256, 256);
      for (let i = 0; i < img.data.length; i += 4) { const n = 243 + Math.random() * 12; img.data[i] = img.data[i + 1] = img.data[i + 2] = n; img.data[i + 3] = 255; }
      g.putImageData(img, 0, 0);
      g.globalAlpha = 0.08; g.strokeStyle = '#7a6a50';
      for (let k = 0; k < 160; k++) { g.beginPath(); const x = Math.random() * 256, y = Math.random() * 256, a = Math.random() * Math.PI; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); g.stroke(); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return keep(t);
    })();
    const groundTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
      g.fillStyle = GROUND; g.fillRect(0, 0, 512, 512);
      g.strokeStyle = 'rgba(60,52,90,0.07)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(512, 512); g.moveTo(512, 0); g.lineTo(0, 512); g.moveTo(256, 0); g.lineTo(256, 512); g.moveTo(0, 256); g.lineTo(512, 256); g.stroke();
      g.setLineDash([10, 8]); g.strokeStyle = 'rgba(168,128,52,0.10)';
      g.beginPath(); g.moveTo(256, 0); g.lineTo(512, 256); g.lineTo(256, 512); g.lineTo(0, 256); g.closePath(); g.stroke();
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(16, 8); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return keep(t);
    })();
    const groundGeo = keep(new THREE.PlaneGeometry(200, 100));
    const groundMat = keep(new THREE.MeshStandardMaterial({ color: '#ffffff', map: groundTex, roughness: 1, metalness: 0 }));
    const ground = new THREE.Mesh(groundGeo, groundMat); ground.rotation.x = -Math.PI / 2; ground.position.set((NS - 1) * D / 2, 0, 0); ground.receiveShadow = true; scene.add(ground);

    const hemi = new THREE.HemisphereLight('#fbf9f4', '#9d9a92', 1.0); scene.add(hemi);
    const key = new THREE.DirectionalLight('#fffaf2', 1.9); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.025;
    Object.assign(key.shadow.camera, { left: -4.4, right: 4.4, top: 4.4, bottom: -4.4, near: 0.5, far: 30 });
    scene.add(key); scene.add(key.target);
    const rim = new THREE.DirectionalLight('#f0c062', 0.9); scene.add(rim); scene.add(rim.target);
    const fill = new THREE.DirectionalLight('#f4f1ff', 0.75); scene.add(fill); scene.add(fill.target);

    const matFront = keep(new THREE.MeshStandardMaterial({ color: IVORY, map: fibre, roughness: 0.88, metalness: 0, side: THREE.FrontSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
    const matBack = keep(new THREE.MeshStandardMaterial({ color: INDIGO, map: fibre, roughness: 0.8, metalness: 0, side: THREE.BackSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
    const matEdge = keep(new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.8 }));
    const matCrease = keep(new THREE.LineBasicMaterial({ color: '#2b2f66', transparent: true, opacity: 0.55 }));
    const plinthMat = keep(new THREE.LineBasicMaterial({ color: '#b39058', transparent: true, opacity: 0.28 }));

    // ---------- forms ----------
    const forms = stations.map((st, i) => {
      const m = FORMS[st.form]();
      const out = m.polys.map((p) => p.map(() => new THREE.Vector3()));
      const triCount = m.polys.reduce((s, p) => s + p.length - 2, 0);
      const edgeCount = m.polys.reduce((s, p) => s + p.length, 0);
      const pos = new Float32Array(triCount * 9), uv = new Float32Array(triCount * 6), epos = new Float32Array(edgeCount * 6);
      let o = 0;
      m.polys.forEach((p) => { for (let k = 1; k < p.length - 1; k++) for (const q of [p[0], p[k], p[k + 1]]) { uv[o++] = q[0] * 0.45; uv[o++] = q[1] * 0.45; } });
      const geo = keep(new THREE.BufferGeometry());
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      const egeo = keep(new THREE.BufferGeometry()); egeo.setAttribute('position', new THREE.BufferAttribute(epos, 3));
      const g = new THREE.Group(); g.position.x = i * D;
      const inner = new THREE.Group(); g.add(inner);
      const front = new THREE.Mesh(geo, matFront), back = new THREE.Mesh(geo, matBack);
      front.castShadow = back.castShadow = true; front.receiveShadow = back.receiveShadow = true;
      front.userData.si = back.userData.si = i;
      const edges = new THREE.LineSegments(egeo, st.form === 'flattened' ? matCrease : matEdge);
      inner.add(front, back, edges);
      scene.add(g);
      // plinth: a faint square sheet outline on the ground under each form
      const pg = keep(new THREE.BufferGeometry().setFromPoints([[-1.7, -1.6], [1.7, -1.6], [1.7, 1.6], [-1.7, 1.6], [-1.7, -1.6]].map(([x, z]) => new THREE.Vector3(x, 0.002, z))));
      const pl = new THREE.Line(pg, plinthMat); g.add(pl);
      // fit + centring from the folded and flat poses
      const bb = (t) => { m.pose(t, {}, out); const mn = new THREE.Vector3(1e9, 1e9, 1e9), mx = new THREE.Vector3(-1e9, -1e9, -1e9); out.forEach((P) => P.forEach((v) => { mn.min(v); mx.max(v); })); return { mn, mx }; };
      const f1 = bb(1), f0 = bb(0);
      const sx = f1.mx.x - f1.mn.x, sz = f1.mx.z - f1.mn.z, sy = f1.mx.y - f1.mn.y;
      const SZ = { vv: [2.9, 3], box: [1.35, 1.35], accordion: [2.2, 1.55], screen: [2.4, 1.75], chain: [2, 2.05], tents: [3.3, 2], plane: [2.7, 2], crane: [2.8, 2], tray: [2.5, 1.2] }[st.form] || [2.5, 1.9];
      const scale = Math.min(SZ[0] / Math.max(sx, sz, 0.01), SZ[1] / Math.max(sy, 0.01), 1.7);
      inner.scale.setScalar(scale);
      return {
        st, m, out, geo, egeo, pos, epos, g, inner, front, back, edges, scale,
        c1: new THREE.Vector3((f1.mn.x + f1.mx.x) / 2, 0, (f1.mn.z + f1.mx.z) / 2),
        c0: new THREE.Vector3((f0.mn.x + f0.mx.x) / 2, 0, (f0.mn.z + f0.mx.z) / 2),
        flat: { w: (f0.mx.x - f0.mn.x) * scale, d: (f0.mx.z - f0.mn.z) * scale },
        t: reduced ? 1 : 0, last: -1, lastB: -1, anim: null, hover: 0, pulse: 0, pulseT0: 0,
      };
    });

    function writeForm(F, breath) {
      const t = F.t;
      if (Math.abs(t - F.last) < 1e-5 && Math.abs(breath - F.lastB) < 1e-5 && !F.pulse) return;
      F.last = t; F.lastB = breath;
      F.m.pose(t, { breath, pulse: F.pulse }, F.out);
      let minY = 1e9; F.out.forEach((P) => P.forEach((v) => { if (v.y < minY) minY = v.y; }));
      const e = ease(t), cx = F.c0.x + (F.c1.x - F.c0.x) * e, cz = F.c0.z + (F.c1.z - F.c0.z) * e;
      let o = 0, q = 0;
      const P3 = F.pos, E3 = F.epos;
      F.out.forEach((P) => {
        for (let k = 1; k < P.length - 1; k++) for (const v of [P[0], P[k], P[k + 1]]) { P3[o++] = v.x - cx; P3[o++] = v.y - minY + 0.004; P3[o++] = v.z - cz; }
        for (let k = 0; k < P.length; k++) { const a = P[k], b = P[(k + 1) % P.length]; E3[q++] = a.x - cx; E3[q++] = a.y - minY + 0.006; E3[q++] = a.z - cz; E3[q++] = b.x - cx; E3[q++] = b.y - minY + 0.006; E3[q++] = b.z - cz; }
      });
      F.geo.attributes.position.needsUpdate = true; F.geo.computeVertexNormals(); F.geo.computeBoundingSphere();
      F.egeo.attributes.position.needsUpdate = true; F.egeo.computeBoundingSphere();
      F.inner.rotation.y = (F.m.yaw || 0) * Math.PI / 180 * e;
    }

    // ---------- DOM ----------
    const ui = el('div', 'ui', null, root);
    const cap = el('section', 'cap', null, ui); cap.setAttribute('aria-live', 'polite');
    const fig = el('div', 'fig', null, ui); fig.setAttribute('aria-hidden', 'true');
    const rail = el('nav', 'rail', null, ui); rail.setAttribute('aria-label', 'The gallery');
    const idxBtn = el('button', 'idxb', null, rail); idxBtn.type = 'button'; idxBtn.setAttribute('aria-haspopup', 'dialog'); idxBtn.setAttribute('aria-expanded', 'false');
    el('span', 'gl', null, idxBtn); el('span', null, 'Index', idxBtn);
    const prevB = el('button', 'arr prv', '‹', rail); prevB.type = 'button'; prevB.setAttribute('aria-label', 'Previous form');
    const track = el('div', 'track', null, rail);
    const nextB = el('button', 'arr nxt', '›', rail); nextB.type = 'button'; nextB.setAttribute('aria-label', 'Next form');
    const marks = stations.map((st, i) => {
      const b = el('button', 'mk', null, track); b.type = 'button';
      b.setAttribute('aria-label', i === 0 ? 'Arrival' : st.title);
      el('i', null, null, b); el('span', 'tip', i === 0 ? 'Arrival' : st.title, b);
      on(b, 'click', () => travel(i));
      return b;
    });
    on(prevB, 'click', () => travel(Math.max(0, cur - 1)));
    on(nextB, 'click', () => travel(Math.min(NS - 1, cur + 1)));

    // index (small, always available)
    const idx = el('div', 'idx', null, ui); idx.setAttribute('role', 'dialog'); idx.setAttribute('aria-label', 'Index'); idx.hidden = true;
    const idxCard = el('div', 'idxc', null, idx);
    el('p', 'idxh', 'Index', idxCard);
    const idxList = el('ol', null, null, idxCard);
    stations.forEach((st, i) => {
      const li = el('li', null, null, idxList);
      const a = el('a', null, null, li); a.href = '#' + st.hash;
      el('span', 'n', ROMAN[i] || String(i + 1), a);
      el('span', 't', i === 0 ? 'Arrival' : st.title, a);
      if (st.key === 'work') el('span', 'k', bySlug[st.slug].kind, a);
      on(a, 'click', (e) => { e.preventDefault(); closeIndex(); if (i === 0) travel(0); else if (openIdx >= 0) stepSheet(i); else openUI(i); });
    });
    const idxClose = el('button', 'idxx', 'Close', idxCard); idxClose.type = 'button';
    on(idxClose, 'click', () => closeIndex());
    on(idx, 'click', (e) => { if (e.target === idx) closeIndex(); });
    on(idxBtn, 'click', () => (idx.hidden ? openIndex() : closeIndex()));
    function openIndex() { idx.hidden = false; idxBtn.setAttribute('aria-expanded', 'true'); const a = idxList.querySelector('a'); a && a.focus(); }
    function closeIndex() { if (idx.hidden) return; idx.hidden = true; idxBtn.setAttribute('aria-expanded', 'false'); }

    // the reading sheet
    const veil = el('div', 'veil', null, ui);
    const sheet = el('div', 'sheet', null, ui); sheet.setAttribute('role', 'dialog'); sheet.hidden = true;
    const paper = el('article', 'paper', null, sheet); paper.tabIndex = -1;
    const tools = el('div', 'tools', null, sheet);
    const closeB = el('button', 'cls', null, tools); closeB.type = 'button'; el('span', 'gl', null, closeB); el('span', null, 'Refold', closeB);
    closeB.setAttribute('aria-label', 'Refold and close');
    on(closeB, 'click', () => closeSheetUI());

    // ---------- captions ----------
    function caption(i) {
      cap.replaceChildren();
      const st = stations[i];
      cap.dataset.k = st.key;
      const [formName, why] = FORM_NOTE[st.form] || ['', ''];
      fig.replaceChildren(); el('span', null, `fig. ${ROMAN[i]} — ${formName}`, fig); el('em', null, why, fig);
      if (st.key === 'home') {
        const nm = el('h1', 'nm', null, cap); nm.setAttribute('aria-label', person.name);
        [person.first, person.last].forEach((word, wi) => {
          const wsp = el('span', 'wd', null, nm); wsp.setAttribute('aria-hidden', 'true');
          [...word].forEach((ch, k) => { const s = el('span', 'lt', ch, wsp); s.style.setProperty('--i', wi * 6 + k); });
        });
        el('p', 'role', `${person.role} · ${person.city}`, cap);
        el('p', 'for', org ? `Folded for ${org}: the stack, the tests and the reasons, one sheet at a time.` : 'For the software engineer: the stack, the tests and the reasons, one sheet at a time.', cap);
        el('p', 'lede', person.lede, cap);
        if (isSoftware) {
          const tl = el('div', 'tests', null, cap);
          el('p', 'th', 'Test suites inside the folds', tl);
          const ul = el('ul', null, null, tl);
          order.forEach((slug) => testsOf(bySlug[slug]).forEach(([v, l]) => {
            const li = el('li', null, null, ul); const a = el('a', null, null, li); a.href = '#work/' + slug;
            el('b', null, v, a); el('span', null, ` ${l} · ${bySlug[slug].name}`, a);
            on(a, 'click', (e) => { e.preventDefault(); openUI(stations.findIndex((s) => s.slug === slug)); });
          }));
        }
        const go = el('p', 'go', null, cap);
        const b = el('button', 'act', null, go); b.type = 'button'; el('span', null, 'Walk the gallery', b); el('i', 'ar', '→', b);
        on(b, 'click', () => travel(1));
        const gh = ext(el('a', 'sub', 'GitHub', go)); gh.href = person.github;
        el('p', 'av', person.availability, cap);
        return;
      }
      if (st.key === 'work') {
        const w = st.w, c = st.c;
        const n = workIdx.indexOf(i) + 1;
        el('p', 'no', `${ROMAN[n - 1]}. of viii`, cap);
        el('h2', 'tt', w.name, cap);
        el('p', 'kd', `${w.kind} · ${w.status}`, cap);
        el('p', 'one', w.one, cap);
        const dl = el('dl', 'facts', null, cap);
        const tests = testsOf(w);
        const nums = (w.stage || w.numbers || []).filter(([v]) => !tests.some((x) => x[0] === v)).slice(0, tests.length ? 1 : 2);
        [...tests, ...nums].slice(0, 3).forEach(([v, l]) => { const d = el('div', null, null, dl); el('dt', null, v, d); el('dd', null, l, d); });
        const mats = c ? c.stack.slice(0, 5) : skillsFor(w.name).filter(([g]) => g !== 'Quality & design').map(([, s]) => s).slice(0, 3);
        if (mats.length) { const p = el('p', 'mat', null, cap); el('span', 'ml', 'Materials ', p); el('span', null, mats.join(' · '), p); }
      } else {
        el('p', 'no', `${ROMAN[i - workIdx.length - 1]}. of v`, cap);
        el('h2', 'tt', st.title, cap);
        const sub = {
          principles: principles.map((p) => p.k).join(' '),
          withdrawn: `${withdrawn.length} claims, withdrawn by me, with the numbers that sank them.`,
          capabilities: `${capabilities.reduce((s, g) => s + g[1].length, 0)} skills in ${capabilities.length} groups, each crossed with the products that use it.`,
          about: `${person.city}. ${person.availability}.`,
          contact: person.email,
        }[st.key];
        el('p', 'one', sub, cap);
      }
      const go = el('p', 'go', null, cap);
      const b = el('button', 'act', null, go); b.type = 'button';
      el('span', null, st.key === 'contact' ? 'Unfold and write' : 'Unfold the sheet', b); el('i', 'ar', '↘', b);
      on(b, 'click', () => openUI(i));
      if (st.key === 'work') { const a = ext(el('a', 'sub', 'Case study', go)); a.href = `https://vamsivenkatesh.com/work/${st.slug}/`; }
      if (st.key === 'contact') { const a = el('a', 'sub', 'Email', go); a.href = mailto(); }
    }
    function mailto() {
      const subj = org ? `AI software engineering, ${org}` : 'AI software engineering role';
      return `mailto:${person.email}?subject=${encodeURIComponent(subj)}`;
    }

    // ---------- crease-pattern diagrams (SVG, from the same flat sheet the 3D form folds from) ----------
    function diagram(si) {
      const F = forms[si], m = F.m;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      m.polys.forEach((p) => p.forEach(([u, v]) => { x0 = Math.min(x0, u); x1 = Math.max(x1, u); y0 = Math.min(y0, -v); y1 = Math.max(y1, -v); }));
      const pd = Math.max(x1 - x0, y1 - y0) * 0.08;
      const svg = sv('svg', { viewBox: `${x0 - pd} ${y0 - pd} ${x1 - x0 + 2 * pd} ${y1 - y0 + 2 * pd}`, class: 'cp', role: 'img', 'aria-label': `Crease pattern of ${(FORM_NOTE[F.st.form] || [''])[0]}` });
      const sw = Math.max(x1 - x0, y1 - y0) / 420;
      const gF = sv('g', { class: 'faces' }, svg);
      m.polys.forEach((p) => sv('polygon', { points: p.map(([u, v]) => `${u},${-v}`).join(' '), 'stroke-width': sw * 1.4 }, gF));
      const gC = sv('g', { class: 'creases' }, svg);
      const sorted = m.creases.slice().sort((a, b) => a.w0 - b.w0);
      sorted.forEach((c, k) => {
        const seg = creaseSeg(m, c);
        if (!seg) return;
        const ln = sv('line', { x1: seg[0][0], y1: -seg[0][1], x2: seg[1][0], y2: -seg[1][1], class: c.type === 'v' ? 'v' : 'm', 'stroke-width': sw * 1.3, 'data-k': k }, gC);
        ln.style.strokeDasharray = c.type === 'v' ? `${sw * 9} ${sw * 6}` : `${sw * 12} ${sw * 4} ${sw * 2} ${sw * 4}`;
        if (m.kind === 'tree' && sorted.length <= 16) {
          const mx = (seg[0][0] + seg[1][0]) / 2, my = -(seg[0][1] + seg[1][1]) / 2;
          sv('circle', { cx: mx, cy: my, r: sw * 9, class: 'nb', 'data-k': k, 'stroke-width': sw * 1.1 }, gC);
          const tx = sv('text', { x: mx, y: my + sw * 3.6, 'font-size': sw * 10.5, class: 'nt', 'data-k': k }, gC); tx.textContent = String(k + 1);
        }
      });
      return svg;
    }
    function creaseSeg(m, c) {
      if (m.kind !== 'tree') return [c.a, c.b];
      const p = m.polys[c.face];
      const dx = c.b[0] - c.a[0], dy = c.b[1] - c.a[1], L = Math.hypot(dx, dy);
      const onLine = (q) => Math.abs((q[0] - c.a[0]) * dy - (q[1] - c.a[1]) * dx) / L < 1e-6;
      const pts = p.filter(onLine);
      return pts.length >= 2 ? [pts[0], pts[1]] : null;
    }

    // ---------- reading sheets ----------
    const H2 = (parent, n, title, note) => {
      const h = el('header', 'sh', null, parent); el('span', 'rn', n, h); const t = el('h3', null, title, h);
      if (note) el('p', 'shn', note, h); return t;
    };
    const section = (cls) => el('section', 'sec ' + (cls || ''), null, paper);
    let foldN = 0;
    const secNo = () => ROMAN[foldN++] + '.';
    function head(si, kicker, title, lineText, meta) {
      const hd = el('header', 'hd', null, paper);
      const fg = el('figure', 'hdf', null, hd);
      fg.appendChild(diagram(si));
      const fc = el('figcaption', null, null, fg);
      const F = forms[si];
      const nC = F.m.creases.length;
      el('span', null, `fig. ${ROMAN[si]} — ${(FORM_NOTE[F.st.form] || [''])[0]}, unfolded: ${nC} crease${nC === 1 ? '' : 's'}`, fc);
      const leg = el('span', 'leg', null, fc); el('i', 'lv', null, leg); el('span', null, 'valley', leg); el('i', 'lm', null, leg); el('span', null, 'mountain', leg);
      const tx = el('div', 'hdt', null, hd);
      if (kicker) el('p', 'kick', kicker, tx);
      const h = el('h2', null, title, tx); h.tabIndex = -1; h.id = 'fw-title';
      if (lineText) el('p', 'line', lineText, tx);
      if (meta) el('p', 'meta', meta, tx);
      sheet.setAttribute('aria-labelledby', 'fw-title');
      return h;
    }
    function buildSheet(si) {
      paper.replaceChildren(); foldN = 0;
      paper.className = 'paper';
      const st = stations[si];
      paper.classList.add('k-' + st.key);
      let h;
      if (st.key === 'work') h = st.c ? flagship(si) : smallCase(si);
      else if (st.key === 'principles') h = principlesSheet(si);
      else if (st.key === 'withdrawn') h = withdrawnSheet(si);
      else if (st.key === 'capabilities') h = capabilitiesSheet(si);
      else if (st.key === 'about') h = aboutSheet(si);
      else h = contactSheet(si);
      footNav(si);
      paper.scrollTop = 0;
      return h;
    }
    function flagship(si) {
      const st = stations[si], w = st.w, c = st.c;
      const h = head(si, c.category, c.name, c.one_line, `${c.status} · ${c.period}`);
      const s0 = section('lead'); el('p', 'sum', c.summary, s0);
      const s1 = section(); H2(s1, secNo(), 'My role'); el('p', null, c.role, s1);
      const s2 = section(); H2(s2, secNo(), 'The problem'); el('p', null, c.problem, s2);
      const s3 = section(); H2(s3, secNo(), 'Constraints', 'What the sheet had to hold.');
      const ul = el('ul', 'cons', null, s3); c.constraints.forEach((x) => el('li', null, x, ul));
      const s4 = section(); H2(s4, secNo(), 'What I built');
      const bl = el('div', 'built', null, s4); c.built.forEach((b) => { const d = el('div', null, null, bl); el('h4', null, b.title, d); el('p', null, b.body, d); });
      const s5 = section('how'); H2(s5, secNo(), 'How it works', 'Read it as folding instructions. Point at a fold to find its crease on the diagram.');
      const ol = el('ol', 'folds', null, s5);
      const nC = forms[si].m.creases.length;
      c.how_it_works.forEach((x, k) => {
        const li = el('li', null, null, ol); li.dataset.k = nC ? k % nC : 0; li.tabIndex = 0;
        const gl = el('span', 'fa', null, li); gl.appendChild(foldArrow(k % 2 === 0));
        const t = el('div', null, null, li); el('span', 'fn', `Fold ${k + 1}`, t); el('h4', null, x.step, t); el('p', null, x.body, t);
      });
      const s6 = section(); H2(s6, secNo(), 'Decisions', 'The position I took, why, and what it cost.');
      c.decisions.forEach((d) => { const b = el('div', 'dec', null, s6); el('h4', null, d.decision, b); el('p', null, d.why, b); const tr = el('p', 'tr', null, b); el('span', 'trl', 'What it cost. ', tr); el('span', null, d.tradeoff, tr); });
      const s7 = section(); H2(s7, secNo(), 'Evaluation', 'How it was checked, dated.');
      c.evaluation.forEach((x) => { const b = el('div', 'ev', null, s7); el('time', null, x.date || '', b); const t = el('div', null, null, b); el('h4', null, x.what, t); el('p', null, x.result, t); });
      const s8 = section(); H2(s8, secNo(), 'Numbers');
      const dl = el('dl', 'nums', null, s8);
      c.numbers.forEach((n) => { const d = el('div', null, null, dl); el('dt', null, n.value, d); const dd = el('dd', null, null, d); el('span', null, n.label, dd); if (n.date) el('time', null, n.date, dd); });
      const s9 = section('mats'); H2(s9, secNo(), 'Materials', 'The stack it is folded from.');
      const ml = el('ul', 'stack', null, s9); c.stack.forEach((x) => el('li', null, x, ml));
      skillLine(s9, w.name);
      const sw = section(); H2(sw, secNo(), 'Honest limits');
      const lm = el('ul', 'lim', null, sw); c.limits.forEach((x) => el('li', null, x, lm));
      withdrawnFor(w.slug).forEach((x) => { const d = el('div', 'wdx', null, sw); el('h4', null, `Withdrawn: ${x.title}`, d); el('p', null, x.what, d); const a = el('a', null, 'All withdrawn claims', d); a.href = '#withdrawn'; });
      const sl = section(); H2(sl, secNo(), 'Check it yourself');
      links(sl, [...c.links.map((l) => [l.label, l.url]), ['Case study on vamsivenkatesh.com', `https://vamsivenkatesh.com/work/${w.slug}/`]]);
      return h;
    }
    function smallCase(si) {
      const st = stations[si], w = st.w;
      const h = head(si, w.kind, w.name, w.line, w.url ? `${w.status} · ${w.host}` : w.status);
      const nums = w.stage || w.numbers || [];
      if (nums.length) { const s = section('lead'); const dl = el('dl', 'nums', null, s); nums.forEach(([v, l]) => { const d = el('div', null, null, dl); el('dt', null, v, d); el('dd', null, l, d); }); }
      const s1 = section(); H2(s1, secNo(), 'The problem'); el('p', null, w.problem, s1);
      const s2 = section(); H2(s2, secNo(), 'The plan'); el('p', null, w.plan, s2);
      const s3 = section('how'); H2(s3, secNo(), 'What I built', 'Folded in this order.');
      const ol = el('ol', 'folds', null, s3); const nC = forms[si].m.creases.length;
      w.built.forEach((x, k) => { const li = el('li', null, null, ol); li.dataset.k = nC ? k % nC : 0; li.tabIndex = 0; const gl = el('span', 'fa', null, li); gl.appendChild(foldArrow(k % 2 === 0)); const t = el('div', null, null, li); el('span', 'fn', `Fold ${k + 1}`, t); el('p', null, x, t); });
      const s4 = section(); H2(s4, secNo(), 'Checks', 'What has to hold, every time.');
      const ul = el('ul', 'checks', null, s4); w.checks.forEach((x) => el('li', null, x, ul));
      const s5 = section('mats'); H2(s5, secNo(), 'Materials', 'Skills from the index that this one uses.');
      skillLine(s5, w.name, true);
      withdrawnFor(w.slug).forEach((x) => {
        const d = section('wd1'); H2(d, secNo(), `Withdrawn: ${x.title}`); el('p', null, x.what, d);
        const dl = el('dl', 'nums', null, d); x.numbers.forEach(([v, l]) => { const q = el('div', null, null, dl); el('dt', null, v, q); el('dd', null, l, q); });
        const a = el('a', 'more', 'All withdrawn claims', d); a.href = '#withdrawn';
      });
      const sl = section(); H2(sl, secNo(), 'Check it yourself');
      links(sl, [...(w.links || []), ['Case study on vamsivenkatesh.com', `https://vamsivenkatesh.com/work/${w.slug}/`]]);
      return h;
    }
    function withdrawnFor(slug) { return withdrawn.filter((x) => (slug === 'vvdex-trading' && /70%/.test(x.title)) || (slug === 'vvdex-platform' && /exam lane/i.test(x.title))); }
    function skillLine(parent, name, full) {
      const sk = skillsFor(name); if (!sk.length) return;
      const p = el('div', 'skl', null, parent);
      if (!full) el('p', 'skh', 'In the capability index', p);
      const ul = el('ul', null, null, p);
      sk.forEach(([g, s]) => { const li = el('li', null, null, ul); const a = el('a', null, s, li); a.href = '#capabilities'; el('span', null, ` ${g}`, li); });
    }
    function links(parent, arr) {
      const ul = el('ul', 'lk', null, parent);
      arr.forEach(([t, u]) => { const li = el('li', null, null, ul); const a = ext(el('a', null, null, li)); a.href = u; el('span', 'lt', t, a); el('span', 'lu', u.replace(/^https?:\/\//, '').replace(/\/$/, ''), a); });
    }
    function foldArrow(valley) {
      const s = sv('svg', { viewBox: '0 0 40 40', width: 34, height: 34, 'aria-hidden': 'true' });
      sv('line', { x1: 4, y1: 30, x2: 36, y2: 30, class: valley ? 'v' : 'm' }, s);
      sv('path', { d: 'M8 24 C 10 6, 30 6, 32 22', class: 'arc' }, s);
      sv('path', { d: 'M27 19 L32 23 L34 17', class: 'ah' }, s);
      return s;
    }
    function principlesSheet(si) {
      const h = head(si, 'How I work', 'Three sheets, each folded once', 'The rules every form on this table was folded by.');
      principles.forEach((p) => { const s = section('pr'); H2(s, secNo(), p.k); el('p', null, p.v, s); });
      return h;
    }
    function withdrawnSheet(si) {
      const h = head(si, 'Claims I withdrew', 'Folded wrong, flattened back', 'A claim stands only if it clears a threshold set before it was measured. These two did not. The creases stay visible on purpose.');
      withdrawn.forEach((x) => {
        const s = section('wd'); H2(s, secNo(), x.title); el('p', null, x.what, s);
        const dl = el('dl', 'nums big', null, s); x.numbers.forEach(([v, l]) => { const d = el('div', null, null, dl); el('dt', null, v, d); el('dd', null, l, d); });
        links(s, [x.link]);
      });
      return h;
    }
    function capabilitiesSheet(si) {
      const total = capabilities.reduce((s, g) => s + g[1].length, 0);
      const h = head(si, 'Capabilities', 'The crease-pattern index', `${total} skills in ${capabilities.length} groups. A mark where a skill is folded into a product; follow it to the case.`);
      const prodNames = order.map((s) => bySlug[s].name);
      const s = section('capx');
      const tbl = el('table', 'mx', null, s);
      const thead = el('thead', null, null, tbl); const hr = el('tr', null, null, thead); el('th', 'sk', 'Skill', hr);
      prodNames.forEach((n) => { const th = el('th', 'pc', null, hr); const a = el('a', null, n, th); a.href = '#work/' + nameToSlug[n]; th.setAttribute('scope', 'col'); });
      const tb = el('tbody', null, null, tbl);
      capabilities.forEach(([g, skills]) => {
        const gr = el('tr', 'gr', null, tb); const gt = el('th', null, g, gr); gt.colSpan = prodNames.length + 1; gt.setAttribute('scope', 'colgroup');
        skills.forEach(([sk, prods]) => {
          const tr = el('tr', null, null, tb); const th = el('th', 'sk', sk, tr); th.setAttribute('scope', 'row');
          prodNames.forEach((n) => {
            const td = el('td', null, null, tr);
            if (prods.includes(n)) { const a = el('a', 'cm', null, td); a.href = '#work/' + nameToSlug[n]; a.setAttribute('aria-label', `${sk}: ${n}`); a.title = n; }
          });
        });
      });
      const ph = el('div', 'mxp', null, s);
      capabilities.forEach(([g, skills]) => {
        el('h4', null, g, ph);
        const ul = el('ul', null, null, ph);
        skills.forEach(([sk, prods]) => { const li = el('li', null, null, ul); el('span', 'skn', sk, li); const ps = el('span', 'skp', null, li); prods.forEach((n, k) => { if (k) ps.appendChild(document.createTextNode(' · ')); const a = el('a', null, n, ps); a.href = '#work/' + nameToSlug[n]; }); });
      });
      return h;
    }
    function aboutSheet(si) {
      const h = head(si, 'About', person.name, `${person.role} · ${person.city}`);
      const s0 = section('lead'); el('p', 'sum one', person.lede, s0);
      const s1 = section(); H2(s1, secNo(), 'What I am looking for'); el('p', null, person.wants, s1); el('p', 'avl', person.availability, s1);
      const s2 = section(); H2(s2, secNo(), 'Roles');
      const ul = el('ul', 'roles', null, s2); person.roles.forEach((r) => el('li', null, r, ul));
      const s3 = section(); H2(s3, secNo(), 'Facts');
      const dl = el('dl', 'facts2', null, s3);
      about.facts.forEach(([k, v]) => { const d = el('div', null, null, dl); el('dt', null, k, d); el('dd', null, v, d); });
      return h;
    }
    function contactSheet(si) {
      const h = head(si, 'Contact', 'Write, and it flies', person.availability);
      const s = section('ct');
      const big = el('a', 'mail', person.email, s); big.href = mailto();
      el('p', 'mailn', org ? `The subject line is already written: “AI software engineering, ${org}”.` : 'The subject line is already written: “AI software engineering role”.', s);
      links(s, [['LinkedIn', person.linkedin], ['GitHub', person.github], ['vamsivenkatesh.com', person.site]]);
      return h;
    }
    function footNav(si) {
      const nav = el('nav', 'pn', null, paper); nav.setAttribute('aria-label', 'Previous and next');
      const list = stations.map((_, i) => i).filter((i) => i > 0);
      const k = list.indexOf(si);
      const pi = list[(k - 1 + list.length) % list.length], ni = list[(k + 1) % list.length];
      const a = el('a', 'p', null, nav); a.href = '#' + stations[pi].hash; el('span', 'pl', '← refold, then open', a); el('span', 'pt', stations[pi].title, a);
      const b = el('a', 'n', null, nav); b.href = '#' + stations[ni].hash; el('span', 'pl', 'refold, then open →', b); el('span', 'pt', stations[ni].title, b);
    }
    // pointing at a fold step lights its crease on the header diagram
    on(paper, 'pointerover', (e) => { const li = e.target.closest && e.target.closest('.folds li'); lightCrease(li ? li.dataset.k : null); });
    on(paper, 'focusin', (e) => { const li = e.target.closest && e.target.closest('.folds li'); lightCrease(li ? li.dataset.k : null); });
    function lightCrease(k) { paper.querySelectorAll('.cp [data-k]').forEach((n) => n.classList.toggle('lit', k != null && n.getAttribute('data-k') === String(k))); }
    // in-sheet hash links (#work/…, #capabilities, #withdrawn, prev/next)
    on(paper, 'click', (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
      const hsh = a.getAttribute('href').slice(1); const i = stations.findIndex((s) => s.hash === hsh);
      if (i > 0) { e.preventDefault(); stepSheet(i); }
    });

    // ---------- camera ----------
    const cam = { pos: new THREE.Vector3(), tgt: new THREE.Vector3(), ox: 0, oy: 0 };
    let camAnim = null;
    let cur = 0, openIdx = -1, panX = 0, clock = 0;
    function galleryPose(i) {
      const x = i * D + panX;
      if (phone) return { pos: new THREE.Vector3(x + 0.35, 4.6, 11.2), tgt: new THREE.Vector3(x, 0.75, 0), ox: 0, oy: 0.2 };
      const home = i === 0;
      return home ? { pos: new THREE.Vector3(x + 0.5, 6.2, 6.4), tgt: new THREE.Vector3(x + 0.1, 0.2, 0.2), ox: -0.15, oy: 0.0 } : { pos: new THREE.Vector3(x + 0.7, 3.2, 7.3), tgt: new THREE.Vector3(x + 0.1, 0.62, 0), ox: -0.15, oy: 0.03 };
    }
    function overheadPose(i) {
      const F = forms[i], aspect = W / H;
      const need = Math.max(F.flat.d, F.flat.w / aspect) * 1.18;
      const d = Math.max(4, need / (2 * Math.tan(15 * Math.PI / 180)));
      return { pos: new THREE.Vector3(i * D, d, 0.6), tgt: new THREE.Vector3(i * D, 0, 0), ox: 0, oy: 0 };
    }
    function setCam(p) { cam.pos.copy(p.pos); cam.tgt.copy(p.tgt); cam.ox = p.ox; cam.oy = p.oy; }
    function camTo(p, dur, done, lift) {
      const from = { pos: cam.pos.clone(), tgt: cam.tgt.clone(), ox: cam.ox, oy: cam.oy };
      if (reduced || dur <= 0) { setCam(p); camAnim = null; done && done(); return; }
      camAnim = { t0: clock, dur, from, to: p, done, lift: lift || 0 };
    }
    function foldTo(F, to, dur, delay = 0) {
      if (reduced || dur <= 0) { F.t = to; F.anim = null; return; }
      F.anim = { t0: clock + delay, dur, from: F.t, to };
    }

    // ---------- state ----------
    let ownPush = 0, pendingAfterClose = null, openToken = 0;
    const later = [];
    const wait = (ms, fn) => { const id = setTimeout(fn, ms); later.push(id); return id; };

    function travel(i) {
      i = Math.max(0, Math.min(NS - 1, i));
      if (openIdx >= 0) { closeSheetUI(() => travel(i)); return; }
      const d = Math.abs(i - cur);
      cur = i; panX = 0;
      marks.forEach((m, k) => { m.classList.toggle('on', k === i); if (k === i) m.setAttribute('aria-current', 'true'); else m.removeAttribute('aria-current'); });
      cap.classList.add('out'); fig.classList.add('out');
      wait(reduced ? 0 : 260, () => { caption(i); cap.classList.remove('out'); fig.classList.remove('out'); });
      camTo(galleryPose(i), Math.min(2.4, 1.0 + d * 0.22));
      forms.forEach((F, k) => { if (Math.abs(k - i) <= 2 && F.t < 1 && (!F.anim || F.anim.to !== 1)) foldTo(F, 1, 1.6, 0.2 + Math.abs(k - i) * 0.25); });
      if (stations[i].form === 'flattened') forms[i].pulseT0 = clock + 0.9;
    }

    function openUI(i) {
      if (i <= 0) return;
      ownPush++;
      if (location.hash.slice(1) === stations[i].hash) applyHash(); else location.hash = stations[i].hash;
    }
    function closeSheetUI(after) {
      if (openIdx < 0) { after && after(); return; }
      if (ownPush > 0) { ownPush--; pendingAfterClose = after || null; history.back(); return; }
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
      doClose(after);
    }
    function stepSheet(i) {
      if (i === openIdx) return;
      try { history.replaceState(null, '', '#' + stations[i].hash); } catch (e) { /* ignore */ }
      doOpen(i);
    }

    function hideSheet(dur) {
      if (sheet.hidden) return;
      sheet.classList.remove('in'); veil.classList.remove('in');
      wait(reduced ? 0 : dur, () => { if (!sheet.classList.contains('in')) sheet.hidden = true; });
    }
    function showSheet(i) {
      const h = buildSheet(i);
      sheet.hidden = false;
      paper.scrollTop = 0;
      // reveal the paper exactly where the flat 3D sheet lies, then let it open out to the full page
      const r = projectFlat(i), P = paper.getBoundingClientRect(), rr = root.getBoundingClientRect();
      const ins = [Math.max(0, r.top + rr.top - P.top), Math.max(0, P.right - (r.right + rr.left)), Math.max(0, P.bottom - (r.bottom + rr.top)), Math.max(0, r.left + rr.left - P.left)];
      if (!reduced && paper.animate) {
        paper.animate([{ clipPath: `inset(${ins[0]}px ${ins[1]}px ${ins[2]}px ${ins[3]}px)` }, { clipPath: 'inset(0px 0px 0px 0px)' }], { duration: 780, easing: 'cubic-bezier(.2,.75,.15,1)' });
      }
      sheet.classList.add('in'); veil.classList.add('in');
      h && h.focus({ preventScroll: true });
    }
    function projectFlat(i) {
      const F = forms[i], x = i * D, hw = F.flat.w / 2, hd = F.flat.d / 2;
      const pts = [[x - hw, -hd], [x + hw, -hd], [x + hw, hd], [x - hw, hd]].map(([a, b]) => new THREE.Vector3(a, 0, b).project(camera));
      const xs = pts.map((p) => (p.x * 0.5 + 0.5) * W), ys = pts.map((p) => (-p.y * 0.5 + 0.5) * H);
      return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
    }

    function doOpen(i) {
      closeIndex();
      const prev = openIdx;
      openIdx = i;
      root.classList.add('reading');
      marks.forEach((m, k) => m.classList.toggle('on', k === i));
      const jump = Math.abs(i - cur);
      cur = i; panX = 0;
      caption(i);
      const token = ++openToken;
      if (prev >= 0) { hideSheet(280); foldTo(forms[prev], 1, 1.1); }
      const F = forms[i];
      if (reduced) { foldTo(F, 0, 0); setCam(overheadPose(i)); updateCamera(); showSheet(i); return; }
      const camDur = prev >= 0 ? Math.min(2.2, 1.0 + jump * 0.15) : (jump ? Math.min(2.4, 1.1 + jump * 0.2) : 1.1);
      camTo(overheadPose(i), camDur, null, 2.5);
      if (F.t < 0.01) F.t = 1; // a form never seen yet is already folded on the table
      foldTo(F, 0, 1.25, camDur * 0.45);
      wait((camDur * 0.45 + 1.15) * 1000, () => { if (token === openToken && openIdx === i) showSheet(i); });
    }
    function doClose(after) {
      if (openIdx < 0) { after && after(); return; }
      const i = openIdx; openIdx = -1; openToken++;
      root.classList.remove('reading');
      hideSheet(320);
      foldTo(forms[i], 1, 1.3, reduced ? 0 : 0.15);
      camTo(galleryPose(i), reduced ? 0 : 1.3, after, 1.5);
      if (!after) wait(30, () => { const b = cap.querySelector('.act'); b && b.focus({ preventScroll: true }); });
    }

    function parseHash() {
      const h = decodeURIComponent((location.hash || '').replace(/^#\/?/, ''));
      if (!h) return 0;
      if (h === 'work') return -2;
      const i = stations.findIndex((s) => s.hash === h);
      return i > 0 ? i : 0;
    }
    function applyHash() {
      const i = parseHash();
      if (i === -2) { if (openIdx >= 0) doClose(() => travel(1)); else travel(1); return; }
      if (i === 0) { const a = pendingAfterClose; pendingAfterClose = null; if (openIdx >= 0) doClose(a); else if (a) a(); return; }
      if (i !== openIdx) doOpen(i);
    }
    on(window, 'hashchange', applyHash);

    // ---------- input ----------
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    let hoverI = -1;
    const pointer = { x: 0.5, y: 0.4, in: false };
    let drag = null;
    function pick(cx, cy) {
      const r = root.getBoundingClientRect();
      ndc.set(((cx - r.left) / W) * 2 - 1, -((cy - r.top) / H) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const objs = []; forms.forEach((F, k) => { if (Math.abs(k - cur) <= 2) objs.push(F.front, F.back); });
      const hit = ray.intersectObjects(objs, false)[0];
      return hit ? hit.object.userData.si : -1;
    }
    on(canvas, 'pointerdown', (e) => {
      if (openIdx >= 0) return;
      drag = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId };
      try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
    });
    on(canvas, 'pointermove', (e) => {
      const r = root.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / W; pointer.y = (e.clientY - r.top) / H; pointer.in = true;
      if (drag) {
        const dx = e.clientX - drag.x; drag.x = e.clientX; drag.moved += Math.abs(dx) + Math.abs(e.clientY - drag.y); drag.y = e.clientY;
        if (drag.moved > 6) { panX -= dx * (phone ? 0.012 : 0.007); panX = Math.max(-D * 0.9, Math.min(D * 0.9, panX)); setCam(galleryPose(cur)); camAnim = null; }
        return;
      }
      if (openIdx < 0 && e.pointerType !== 'touch') { const h = pick(e.clientX, e.clientY); if (h !== hoverI) { hoverI = h; canvas.style.cursor = h >= 0 ? 'pointer' : 'grab'; } }
    });
    const up = (e) => {
      if (!drag) return;
      const d = drag; drag = null;
      try { canvas.releasePointerCapture(d.id); } catch (er) { /* ignore */ }
      if (d.moved <= 6) {
        const h = pick(e.clientX, e.clientY);
        if (h >= 0) { if (h === cur && h > 0) openUI(h); else if (h !== cur) travel(h); else travel(1); }
        return;
      }
      const steps = Math.round(panX / (D * 0.42));
      const target = Math.max(0, Math.min(NS - 1, cur + (Math.abs(panX) > D * 0.18 ? Math.sign(panX) * Math.max(1, Math.abs(steps)) : 0)));
      if (target === cur) { panX = 0; camTo(galleryPose(cur), 0.7); } else travel(target);
    };
    on(canvas, 'pointerup', up); on(canvas, 'pointercancel', up);
    on(canvas, 'pointerleave', () => { pointer.in = false; hoverI = -1; });
    on(window, 'keydown', (e) => {
      if (e.defaultPrevented) return;
      const tag = (e.target && e.target.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.key === 'Escape') { if (!idx.hidden) { closeIndex(); idxBtn.focus({ preventScroll: true }); } else if (openIdx >= 0) closeSheetUI(); return; }
      if (!idx.hidden) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        if (openIdx >= 0) { const list = stations.map((_, i) => i).filter((i) => i > 0); const k = list.indexOf(openIdx); stepSheet(list[(k + dir + list.length) % list.length]); }
        else travel(cur + dir);
        e.preventDefault();
      }
      if (e.key === 'Enter' && openIdx < 0 && (e.target === document.body || e.target === root) && cur > 0) { openUI(cur); e.preventDefault(); }
    });
    let rsz = 0;
    on(window, 'resize', () => {
      cancelAnimationFrame(rsz); rsz = requestAnimationFrame(() => {
        ({ W, H } = vp()); phone = W < 760; root.classList.toggle('ph', phone);
        renderer.setSize(W, H); camera.aspect = W / H;
        if (!camAnim) setCam(openIdx >= 0 ? overheadPose(openIdx) : galleryPose(cur));
      });
    });
    root.classList.toggle('ph', phone);

    // ---------- loop ----------
    const lp = new THREE.Vector2(0.42, 0.35), lpT = new THREE.Vector2();
    const figV = new THREE.Vector3();
    function updateCamera() {
      camera.position.copy(cam.pos); camera.lookAt(cam.tgt);
      camera.setViewOffset(W, H, cam.ox * W, cam.oy * H, W, H);
      camera.updateProjectionMatrix();
    }
    let raf = 0, last = performance.now(), figTick = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now; clock += dt;
      if (camAnim) {
        const p = Math.min(1, (clock - camAnim.t0) / camAnim.dur), e = ease(p), a = camAnim.from, b = camAnim.to;
        cam.pos.lerpVectors(a.pos, b.pos, e);
        // a long move rises a little mid-flight, so it reads as walking along the sheet
        cam.pos.y += Math.sin(Math.PI * e) * (Math.min(1.6, a.pos.distanceTo(b.pos) * 0.08) + camAnim.lift);
        cam.tgt.lerpVectors(a.tgt, b.tgt, e); cam.ox = a.ox + (b.ox - a.ox) * e; cam.oy = a.oy + (b.oy - a.oy) * e;
        if (p >= 1) { const d = camAnim.done; camAnim = null; d && d(); }
      }
      updateCamera();
      // the sun follows your hand; the hard shadows swing with it
      if (!reduced) { lpT.set(pointer.in ? pointer.x : 0.42 + Math.sin(clock * 0.15) * 0.1, pointer.in ? pointer.y : 0.35); lp.lerp(lpT, 0.05); }
      const tx = cam.tgt.x;
      key.position.set(tx - 3.8 + (lp.x - 0.5) * 7, 8.5, 4.2 + (lp.y - 0.5) * 5); key.target.position.set(tx, 0, 0);
      rim.position.set(tx + 2.5, 2.4, -7); rim.target.position.set(tx, 0.5, 0);
      fill.position.set(cam.pos.x + 2, cam.pos.y, cam.pos.z + 2); fill.target.position.set(tx, 0.5, 0);
      forms.forEach((F, k) => {
        const near = Math.abs(k - cur) <= 3;
        F.g.visible = Math.abs(k * D - cam.tgt.x) < 16;
        if (F.anim && clock >= F.anim.t0) {
          const p = Math.min(1, (clock - F.anim.t0) / F.anim.dur); F.t = F.anim.from + (F.anim.to - F.anim.from) * p;
          if (p >= 1) F.anim = null;
        }
        if (F.pulseT0 && !reduced) { const p = (clock - F.pulseT0) / 2.6; F.pulse = p > 0 && p < 1 ? Math.sin(Math.PI * p) ** 2 : 0; if (p >= 1) { F.pulseT0 = 0; F.pulse = 0; F.last = -1; } }
        const hov = !reduced && k === hoverI && openIdx < 0 ? 1 : 0;
        F.hover += (hov - F.hover) * 0.08;
        const breath = reduced || !near || F.t < 0.999 || k === openIdx ? 0 : 0.012 * (0.5 + 0.5 * Math.sin(clock * 0.9 + k * 1.7)) + F.hover * 0.08;
        if (F.g.visible) writeForm(F, breath);
      });
      if (++figTick % 2 === 0 && openIdx < 0) {
        figV.set(cur * D, 0, 1.75).project(camera);
        const fx = (figV.x * 0.5 + 0.5) * W, fy = (-figV.y * 0.5 + 0.5) * H;
        fig.style.transform = `translate(${Math.round(fx)}px, ${Math.round(fy)}px) translate(-50%, 0)`;
      }
      renderer.render(scene, camera);
    }

    // ---------- arrival ----------
    caption(0);
    marks[0].classList.add('on'); marks[0].setAttribute('aria-current', 'true');
    const startHash = parseHash();
    if (reduced) {
      setCam(galleryPose(0));
    } else {
      // open on the strip lying flat, seen from above; pull back as it folds into the monogram
      const g0 = galleryPose(0);
      setCam({ pos: new THREE.Vector3(0.6, 12.5, 2.4), tgt: new THREE.Vector3(0.7, 0, 0.5), ox: g0.ox * 0.5, oy: g0.oy });
      foldTo(forms[0], 1, 2.8, 0.3);
      camTo(g0, 3.6);
      forms.forEach((F, k) => { if (k > 0 && k <= 3) foldTo(F, 1, 1.9, 1.8 + k * 0.35); });
      fig.classList.add('out'); wait(3200, () => { if (cur === 0) fig.classList.remove('out'); });
    }
    if (startHash > 0) doOpen(startHash);
    else if (startHash === -2) travel(1);
    updateCamera();
    raf = requestAnimationFrame(frame);

    return function unmount() {
      cancelAnimationFrame(raf); cancelAnimationFrame(rsz);
      later.forEach(clearTimeout);
      cleanup.forEach((f) => f());
      if (paper.getAnimations) paper.getAnimations().forEach((a) => a.cancel());
      scene.traverse((o) => { if (o.geometry && !disposables.includes(o.geometry)) o.geometry.dispose(); });
      disposables.forEach((d) => d.dispose && d.dispose());
      if (key.shadow.map) key.shadow.map.dispose();
      renderer.dispose(); renderer.forceContextLoss();
      root.replaceChildren();
      root.classList.remove('fw', 'still', 'reading', 'ph');
      link.remove(); style.remove();
    };
  },
};

const CSS = `
.fw { --ivory:#f8f3e8; --ground:#e8e1d2; --ink:#1d2152; --ink2:#3a3e6c; --mut:#686778; --gold:#9a7428; --goldl:#c9a24e;
  background:var(--ground); color:var(--ink); font-family:"Spectral", Georgia, serif; font-weight:300;
  -webkit-font-smoothing:antialiased; user-select:none; }
.fw .cv { position:absolute; inset:0; width:100%; height:100%; display:block; cursor:grab; touch-action:pan-y; }
.fw .ui { position:absolute; inset:0; pointer-events:none; }
.fw .ui > * { pointer-events:auto; }
.fw button { font:inherit; color:inherit; }
.fw a { color:inherit; }
.fw :focus-visible { outline:1.5px solid var(--gold); outline-offset:3px; }

/* caption: a museum label set in a book face, on a soft wash of the table */
.fw .ui::before { content:""; position:absolute; left:0; top:0; bottom:0; width:min(620px, 48vw); background:linear-gradient(90deg, rgba(232,225,210,.92) 0%, rgba(232,225,210,.72) 62%, rgba(232,225,210,0) 100%); pointer-events:none; transition:opacity .5s; }
.fw.reading .ui::before { opacity:0; }
.fw.ph .ui::before { width:auto; left:0; right:0; top:auto; height:62%; background:linear-gradient(0deg, rgba(232,225,210,.95) 0%, rgba(232,225,210,.8) 55%, rgba(232,225,210,0) 100%); }
.fw .cap { position:absolute; left:max(28px, 5.5vw); top:50%; transform:translateY(-46%); width:min(440px, 36vw); transition:opacity .35s, transform .5s cubic-bezier(.2,.7,.2,1); user-select:text; pointer-events:none; }
.fw .cap > * { pointer-events:auto; }
.fw .cap.out { opacity:0; transform:translateY(-44%); }
.fw .cap .nm { margin:0; font:400 clamp(54px, 6.4vw, 98px)/.9 "Playfair Display", serif; letter-spacing:-.018em; color:var(--ink); }
.fw .cap .nm .wd { display:block; white-space:nowrap; }
.fw .cap .nm .wd + .wd { font-style:italic; padding-left:.42em; color:var(--ink2); }
.fw .cap .nm .lt { display:inline-block; transform-origin:50% 100%; animation:fw-flap 1s cubic-bezier(.2,.75,.25,1.05) both; animation-delay:calc(.45s + var(--i) * 55ms); backface-visibility:hidden; }
@keyframes fw-flap { from { transform:perspective(500px) rotateX(-96deg); opacity:0 } 40% { opacity:1 } to { transform:none; opacity:1 } }
.fw.still .cap .nm .lt { animation:none; }
.fw .cap .role { margin:18px 0 0; font:italic 400 19px/1.3 "Playfair Display", serif; color:var(--ink2); }
.fw .cap .for { margin:22px 0 0; font:400 17px/1.45 "Spectral", serif; color:var(--ink); max-width:400px; padding-top:14px; border-top:1px dashed rgba(168,128,47,.55); }
.fw .cap .lede { margin:10px 0 0; font:300 15px/1.55 "Spectral", serif; color:var(--ink2); max-width:400px; }
.fw .cap .tests { margin:16px 0 0; }
.fw .cap .tests .th { margin:0 0 6px; font:italic 400 15px "Playfair Display", serif; color:var(--mut); }
.fw .cap .tests ul { margin:0; padding:0; list-style:none; display:grid; gap:2px; }
.fw .cap .tests a { text-decoration:none; font:400 12px/1.5 "IBM Plex Mono", monospace; color:var(--ink2); }
.fw .cap .tests a b { font-weight:500; color:var(--ink); display:inline-block; min-width:48px; }
.fw .cap .tests a:hover span { color:var(--gold); }
.fw .cap .av { margin:18px 0 0; font:400 11.5px/1.4 "IBM Plex Mono", monospace; color:var(--mut); }
.fw .cap .no { margin:0 0 6px; font:italic 400 18px "Playfair Display", serif; color:var(--gold); }
.fw .cap .tt { margin:0; font:500 clamp(46px, 5vw, 78px)/.95 "Playfair Display", serif; letter-spacing:-.015em; }
.fw .cap .kd { margin:10px 0 0; font:italic 400 19px/1.3 "Playfair Display", serif; color:var(--ink2); }
.fw .cap .one { margin:16px 0 0; font:400 17px/1.5 "Spectral", serif; max-width:410px; }
.fw .cap .facts { margin:18px 0 0; display:grid; border-top:1px dashed rgba(168,128,47,.55); }
.fw .cap .facts div { display:grid; grid-template-columns:auto 1fr; gap:14px; align-items:baseline; padding:7px 0; border-bottom:1px dashed rgba(29,33,82,.14); }
.fw .cap .facts dt { font:500 26px/1 "Playfair Display", serif; font-variant-numeric:lining-nums; min-width:70px; }
.fw .cap .facts dd { margin:0; font:300 14px/1.35 "Spectral", serif; color:var(--ink2); }
.fw .cap .mat { margin:12px 0 0; font:400 11.5px/1.6 "IBM Plex Mono", monospace; color:var(--ink2); }
.fw .cap .mat .ml { font:italic 400 15px "Playfair Display", serif; color:var(--mut); }
.fw .cap .go { margin:24px 0 0; display:flex; align-items:baseline; gap:22px; flex-wrap:wrap; }
.fw .act { background:none; border:0; padding:0 0 4px; cursor:pointer; font:500 21px/1 "Playfair Display", serif; color:var(--ink); border-bottom:1.5px solid var(--ink); display:inline-flex; gap:10px; align-items:baseline; }
.fw .act .ar { font-style:normal; color:var(--gold); transition:transform .3s; }
.fw .act:hover .ar { transform:translate(3px, 2px); }
.fw .sub { font:italic 400 17px "Playfair Display", serif; color:var(--ink2); text-decoration:none; border-bottom:1px dashed var(--goldl); }
.fw .sub:hover { color:var(--gold); }

/* figure label under the form */
.fw .fig { position:absolute; left:0; top:0; width:340px; text-align:center; font:400 11px/1.45 "IBM Plex Mono", monospace; color:var(--mut); pointer-events:none; transition:opacity .4s; }
.fw .fig em { font:italic 400 15px/1.35 "Playfair Display", serif; color:var(--ink2); display:block; margin-top:2px; }
.fw .fig.out, .fw.reading .fig, .fw.reading .cap { opacity:0; pointer-events:none; }
.fw.reading .cap > * { pointer-events:none; }

/* the rail: one crease line along the bottom, a mark per form */
.fw .rail { position:absolute; left:0; right:0; bottom:0; height:64px; display:flex; align-items:center; gap:10px; padding:0 max(18px, 4vw); }
.fw .track { position:relative; flex:1; height:40px; display:flex; justify-content:space-between; align-items:center; }
.fw .track::before { content:""; position:absolute; left:0; right:0; top:50%; height:0; border-top:1px dashed rgba(168,128,47,.7); }
.fw .mk { position:relative; width:22px; height:36px; background:none; border:0; padding:0; cursor:pointer; display:grid; place-items:center; }
.fw .mk i { width:7px; height:7px; background:var(--ground); border:1px solid var(--ink2); transform:rotate(45deg); transition:all .35s cubic-bezier(.2,.7,.2,1); }
.fw .mk:hover i { background:var(--goldl); }
.fw .mk.on i { width:12px; height:12px; background:linear-gradient(135deg, var(--ivory) 50%, var(--ink) 50%); border-color:var(--ink); }
.fw .mk .tip { position:absolute; bottom:34px; left:50%; transform:translate(-50%, 4px); white-space:nowrap; font:italic 400 15px "Playfair Display", serif; color:var(--ink); opacity:0; transition:all .25s; pointer-events:none; background:var(--ivory); padding:2px 8px; box-shadow:0 6px 14px -8px rgba(29,33,82,.5); }
.fw .mk:hover .tip, .fw .mk:focus-visible .tip { opacity:1; transform:translate(-50%, 0); }
.fw .arr { background:none; border:0; width:30px; height:36px; cursor:pointer; font:400 30px/1 "Playfair Display", serif; color:var(--ink); }
.fw .arr:hover { color:var(--gold); }
.fw .idxb { background:none; border:0; cursor:pointer; display:inline-flex; align-items:center; gap:8px; font:italic 400 18px "Playfair Display", serif; color:var(--ink); padding:6px 8px 6px 0; }
.fw .gl { width:14px; height:14px; display:inline-block; flex:none; background:linear-gradient(135deg, transparent 49%, var(--ink) 49% 51%, transparent 51%), linear-gradient(45deg, var(--ivory) 50%, var(--goldl) 50%); border:1px solid var(--ink); }

/* index */
.fw .idx { position:absolute; inset:0; background:rgba(232,225,210,.55); z-index:5; }
.fw .idx[hidden] { display:none; }
.fw .idxc { position:absolute; left:max(18px, 4vw); bottom:74px; width:min(380px, calc(100% - 36px)); max-height:calc(100% - 190px); overflow:auto; background:var(--ivory); padding:20px 22px 16px; box-shadow:0 30px 60px -30px rgba(29,33,82,.55), 0 0 0 1px rgba(168,128,47,.35);
  background-image:linear-gradient(90deg, transparent 49.8%, rgba(29,33,82,.06) 50%, rgba(255,255,255,.7) 50.2%, transparent 51%); animation:fw-card .45s cubic-bezier(.2,.75,.2,1) both; transform-origin:0 100%; }
@keyframes fw-card { from { transform:perspective(900px) rotateY(-70deg); opacity:0 } to { transform:none; opacity:1 } }
.fw .idxh { margin:0 0 10px; font:500 26px "Playfair Display", serif; }
.fw .idxc ol { margin:0; padding:0; list-style:none; }
.fw .idxc li a { display:grid; grid-template-columns:34px 1fr; column-gap:6px; padding:6px 0; text-decoration:none; border-top:1px dashed rgba(29,33,82,.14); }
.fw .idxc li a:hover .t { color:var(--gold); }
.fw .idxc .n { font:italic 400 15px "Playfair Display", serif; color:var(--gold); }
.fw .idxc .t { font:500 19px/1.15 "Playfair Display", serif; }
.fw .idxc .k { grid-column:2; font:300 13px "Spectral", serif; color:var(--mut); }
.fw .idxx { margin-top:12px; background:none; border:0; padding:0; cursor:pointer; font:italic 400 16px "Playfair Display", serif; color:var(--ink2); border-bottom:1px dashed var(--goldl); }

/* the reading sheet */
.fw .veil { position:absolute; inset:0; background:radial-gradient(120% 90% at 50% 40%, rgba(232,225,210,0) 0%, rgba(232,225,210,.55) 70%); opacity:0; transition:opacity .6s; pointer-events:none; }
.fw .veil.in { opacity:1; }
.fw .sheet { position:absolute; inset:76px 0 0 0; z-index:3; pointer-events:none; }
.fw .sheet[hidden] { display:none; }
.fw .paper { position:absolute; left:50%; top:6px; bottom:18px; width:min(1060px, calc(100% - 140px)); transform:translateX(-50%); overflow-y:auto; overscroll-behavior:contain;
  pointer-events:auto; user-select:text; outline:none;
  background-color:var(--ivory);
  background-image:linear-gradient(90deg, rgba(29,33,82,0) 0%, rgba(29,33,82,.022) 33.2%, rgba(255,255,255,.6) 33.35%, rgba(255,255,255,0) 40%, rgba(29,33,82,0) 50%, rgba(29,33,82,.026) 66.55%, rgba(255,255,255,.55) 66.7%, rgba(255,255,255,0) 73%, rgba(29,33,82,.015) 100%);
  background-attachment:local;
  box-shadow:0 0 0 1px rgba(168,128,47,.4), 0 48px 70px -46px rgba(29,33,82,.55), 0 14px 22px -16px rgba(29,33,82,.3);
  scrollbar-width:thin; scrollbar-color:rgba(29,33,82,.25) transparent; }
.fw .paper.k-withdrawn { background-image:
    linear-gradient(90deg, rgba(29,33,82,0) 0%, rgba(29,33,82,.022) 33.2%, rgba(255,255,255,.6) 33.35%, rgba(255,255,255,0) 40%, rgba(29,33,82,0) 50%, rgba(29,33,82,.026) 66.55%, rgba(255,255,255,.55) 66.7%, rgba(255,255,255,0) 73%),
    linear-gradient(33deg, transparent 49.85%, rgba(29,33,82,.13) 50%, rgba(255,255,255,.8) 50.12%, transparent 50.3%),
    linear-gradient(-33deg, transparent 49.85%, rgba(29,33,82,.11) 50%, rgba(255,255,255,.8) 50.12%, transparent 50.3%); }
.fw .tools { position:absolute; right:max(14px, calc(50% - 530px - 70px)); top:8px; display:flex; flex-direction:column; gap:8px; pointer-events:auto; opacity:0; transition:opacity .4s .2s; }
.fw .sheet.in .tools { opacity:1; }
.fw .cls { background:var(--ivory); border:0; cursor:pointer; padding:9px 12px; display:inline-flex; gap:8px; align-items:center; font:italic 500 17px "Playfair Display", serif; color:var(--ink);
  box-shadow:0 0 0 1px rgba(168,128,47,.45), 0 10px 18px -12px rgba(29,33,82,.5); }
.fw .cls:hover { color:var(--gold); }

.fw .hd { display:grid; grid-template-columns:minmax(0, 5fr) minmax(0, 6fr); gap:40px; padding:44px 56px 36px; align-items:center; }
.fw .hdf { margin:0; }
.fw .cp { width:100%; height:auto; max-height:300px; display:block; overflow:visible; }
.fw .cp .faces polygon { fill:rgba(255,255,255,.55); stroke:var(--ink); stroke-linejoin:round; }
.fw .cp line.v { stroke:var(--goldl); }
.fw .cp line.m { stroke:var(--ink2); }
.fw .cp line { stroke-linecap:round; }
.fw .cp line.lit { stroke:#b8432f; }
.fw .cp .nb { fill:var(--ivory); stroke:var(--gold); }
.fw .cp .nb.lit { fill:#b8432f; stroke:#b8432f; }
.fw .cp .nt { fill:var(--ink); text-anchor:middle; font-family:"IBM Plex Mono", monospace; }
.fw .cp .nt.lit { fill:var(--ivory); }
.fw .hdf figcaption { margin-top:12px; font:400 11px/1.5 "IBM Plex Mono", monospace; color:var(--mut); display:flex; flex-wrap:wrap; gap:4px 14px; }
.fw .hdf .leg { display:inline-flex; gap:6px; align-items:center; }
.fw .hdf .leg i { width:22px; height:0; display:inline-block; }
.fw .hdf .leg .lv { border-top:1.5px dashed var(--goldl); }
.fw .hdf .leg .lm { border-top:1.5px dotted var(--ink2); margin-left:6px; }
.fw .hdt .kick { margin:0 0 10px; font:italic 400 19px "Playfair Display", serif; color:var(--gold); }
.fw .hdt h2 { margin:0; font:500 clamp(46px, 5.2vw, 80px)/.95 "Playfair Display", serif; letter-spacing:-.016em; outline:none; }
.fw .hdt .line { margin:18px 0 0; font:400 19px/1.5 "Spectral", serif; }
.fw .hdt .meta { margin:14px 0 0; font:400 11.5px "IBM Plex Mono", monospace; color:var(--mut); }

.fw .sec { position:relative; display:grid; grid-template-columns:200px minmax(0, 1fr); column-gap:44px; padding:34px 56px 36px; }
.fw .sec::before { content:""; position:absolute; left:56px; right:56px; top:0; height:1.5px; background:repeating-linear-gradient(90deg, var(--goldl) 0 9px, transparent 9px 15px); opacity:.85; }
.fw .sec:nth-of-type(even)::before { background:repeating-linear-gradient(90deg, var(--ink2) 0 12px, transparent 12px 16px, var(--ink2) 16px 18px, transparent 18px 22px); opacity:.45; }
.fw .sec > :not(.sh) { grid-column:2; }
.fw .sec.lead > * { grid-column:1 / -1; }
.fw .sh { grid-column:1; grid-row:1 / span 20; align-self:start; position:sticky; top:12px; }
.fw .sh .rn { display:block; font:italic 400 34px/1 "Playfair Display", serif; color:var(--gold); }
.fw .sh h3 { margin:6px 0 0; font:500 24px/1.12 "Playfair Display", serif; }
.fw .sh .shn { margin:8px 0 0; font:italic 300 14px/1.45 "Spectral", serif; color:var(--mut); }
.fw .sec p { margin:0 0 12px; font:300 17.5px/1.62 "Spectral", serif; max-width:68ch; }
.fw .sec .sum { font:400 20px/1.55 "Spectral", serif; max-width:none; columns:2; column-gap:44px; }
.fw .sec .sum.one { columns:1; max-width:46ch; font-size:22px; }
.fw .sec h4 { margin:0 0 6px; font:500 22px/1.2 "Playfair Display", serif; }
.fw .cons { margin:0; padding:0; list-style:none; counter-reset:c; display:grid; gap:12px; }
.fw .cons li { counter-increment:c; display:grid; grid-template-columns:34px 1fr; font:300 17px/1.55 "Spectral", serif; }
.fw .cons li::before { content:counter(c, lower-roman) "."; font:italic 400 19px "Playfair Display", serif; color:var(--gold); }
.fw .built { display:grid; grid-template-columns:1fr 1fr; gap:22px 34px; }
.fw .built p { font-size:16px; margin:0; }
.fw .folds { margin:0; padding:0; list-style:none; display:grid; gap:4px; }
.fw .folds li { display:grid; grid-template-columns:48px 1fr; gap:10px; padding:12px 12px 12px 0; transition:background .25s; outline:none; }
.fw .folds li:hover, .fw .folds li:focus { background:rgba(201,162,78,.12); }
.fw .folds .fn { display:block; font:500 11px "IBM Plex Mono", monospace; color:var(--gold); margin-bottom:3px; }
.fw .folds p { margin:0; font-size:16.5px; }
.fw .fa svg { display:block; }
.fw .fa line.v { stroke:var(--goldl); stroke-width:1.6; stroke-dasharray:4 3; }
.fw .fa line.m { stroke:var(--ink2); stroke-width:1.6; stroke-dasharray:6 2 1.5 2; }
.fw .fa .arc, .fw .fa .ah { fill:none; stroke:var(--ink); stroke-width:1.3; }
.fw .dec { padding:0 0 22px; margin:0 0 22px; border-bottom:1px dashed rgba(29,33,82,.14); }
.fw .dec:last-child { border-bottom:0; margin-bottom:0; }
.fw .dec h4 { font-size:25px; }
.fw .dec .tr { font-style:italic; color:var(--ink2); }
.fw .dec .trl { font:italic 500 18px "Playfair Display", serif; color:var(--gold); }
.fw .ev { display:grid; grid-template-columns:110px 1fr; gap:18px; padding:0 0 18px; margin:0 0 18px; border-bottom:1px dashed rgba(29,33,82,.14); }
.fw .ev:last-child { border-bottom:0; }
.fw .ev time { font:500 12px/1.9 "IBM Plex Mono", monospace; color:var(--gold); }
.fw .ev h4 { font:italic 400 19px/1.35 "Spectral", serif; }
.fw .ev p { font-size:16.5px; margin:0; }
.fw .nums { margin:0; display:grid; }
.fw .nums > div { display:grid; grid-template-columns:minmax(150px, auto) 1fr; gap:26px; align-items:baseline; padding:14px 0; border-bottom:1px dashed rgba(29,33,82,.16); }
.fw .nums dt { font:500 46px/1 "Playfair Display", serif; font-variant-numeric:lining-nums; white-space:nowrap; }
.fw .nums dd { margin:0; font:300 16.5px/1.45 "Spectral", serif; }
.fw .nums dd time { display:block; margin-top:4px; font:400 11.5px "IBM Plex Mono", monospace; color:var(--mut); }
.fw .nums.big dt { font-size:64px; }
.fw .sec.lead .nums { max-width:720px; }
.fw .stack { margin:0; padding:0; list-style:none; columns:2; column-gap:36px; }
.fw .stack li { break-inside:avoid; font:400 13.5px/1.5 "IBM Plex Mono", monospace; padding:6px 0 6px 22px; position:relative; border-bottom:1px dotted rgba(29,33,82,.18); }
.fw .stack li::before { content:""; position:absolute; left:2px; top:12px; width:9px; height:9px; background:linear-gradient(135deg, var(--ivory) 50%, var(--ink) 50%); border:1px solid var(--ink); }
.fw .skl { margin-top:20px; }
.fw .skl .skh { font:italic 400 17px "Playfair Display", serif; color:var(--mut); margin:0 0 8px; }
.fw .skl ul { margin:0; padding:0; list-style:none; display:grid; gap:6px; }
.fw .skl li { font:300 15px/1.4 "Spectral", serif; }
.fw .skl li a { font-weight:400; text-decoration:none; border-bottom:1px dashed var(--goldl); }
.fw .skl li a:hover { color:var(--gold); }
.fw .skl li span { font:italic 400 15px "Playfair Display", serif; color:var(--mut); }
.fw .lim { margin:0; padding:18px 22px; list-style:none; display:grid; gap:12px; border:1.5px dashed rgba(168,128,47,.6); }
.fw .lim li { font:300 16.5px/1.55 "Spectral", serif; }
.fw .wdx { margin-top:18px; padding:16px 20px; background:rgba(29,33,82,.04); }
.fw .wdx h4 { font-size:20px; }
.fw .wdx a, .fw .more { font:italic 400 17px "Playfair Display", serif; border-bottom:1px dashed var(--goldl); text-decoration:none; }
.fw .checks { margin:0; padding:0; list-style:none; display:grid; grid-template-columns:1fr 1fr; gap:10px 28px; }
.fw .checks li { font:300 16.5px/1.45 "Spectral", serif; padding-left:26px; position:relative; }
.fw .checks li::before { content:""; position:absolute; left:0; top:7px; width:11px; height:11px; border:1px solid var(--ink); background:linear-gradient(135deg, transparent 46%, var(--ink) 46% 54%, transparent 54%); }
.fw .lk { margin:0; padding:0; list-style:none; display:grid; gap:2px; }
.fw .lk a { display:flex; justify-content:space-between; gap:20px; align-items:baseline; padding:10px 0; text-decoration:none; border-bottom:1px dashed rgba(29,33,82,.16); }
.fw .lk .lt { font:500 21px "Playfair Display", serif; }
.fw .lk .lu { font:400 11.5px "IBM Plex Mono", monospace; color:var(--mut); text-align:right; overflow-wrap:anywhere; }
.fw .lk a:hover .lt { color:var(--gold); }
.fw .pr p { font-size:20px; line-height:1.6; }
.fw .pr .sh h3 { font-size:30px; }
.fw .roles { margin:0; padding:0; list-style:none; display:flex; flex-wrap:wrap; gap:6px 26px; }
.fw .roles li { font:italic 400 24px "Playfair Display", serif; }
.fw .facts2 { margin:0; }
.fw .facts2 div { display:grid; grid-template-columns:130px 1fr; gap:20px; padding:10px 0; border-bottom:1px dashed rgba(29,33,82,.14); }
.fw .facts2 dt { font:italic 400 18px "Playfair Display", serif; color:var(--gold); }
.fw .facts2 dd { margin:0; font:300 16.5px/1.5 "Spectral", serif; }
.fw .sec p.avl { font:400 12px "IBM Plex Mono", monospace; color:var(--mut); }
.fw .ct .mail { display:inline-block; font:500 clamp(24px, 3.1vw, 44px)/1.15 "Playfair Display", serif; text-decoration:none; border-bottom:2px solid var(--ink); margin-bottom:12px; overflow-wrap:anywhere; letter-spacing:-.01em; }
.fw .ct .mail:hover { color:var(--gold); border-color:var(--gold); }
.fw .ct .mailn { font-style:italic; color:var(--mut); font-size:15.5px; }
.fw .mx { width:100%; border-collapse:collapse; table-layout:fixed; }
.fw .mx thead th.sk { width:34%; }
.fw .mx th, .fw .mx td { border-bottom:1px dashed rgba(29,33,82,.13); }
.fw .mx thead th.pc { height:150px; vertical-align:bottom; padding:0 0 8px; width:58px; }
.fw .mx thead th.pc a { display:inline-block; transform:rotate(-58deg); transform-origin:0 100%; white-space:nowrap; margin-left:26px; font:500 16px "Playfair Display", serif; text-decoration:none; }
.fw .mx thead th.pc a:hover { color:var(--gold); }
.fw .mx thead th.sk { text-align:left; vertical-align:bottom; font:italic 400 15px "Playfair Display", serif; color:var(--mut); padding-bottom:8px; }
.fw .mx tr.gr th { text-align:left; padding:22px 0 6px; font:500 21px "Playfair Display", serif; color:var(--ink); border-bottom:1.5px dashed var(--goldl); }
.fw .mx tbody th.sk { text-align:left; font:300 15px/1.35 "Spectral", serif; padding:8px 16px 8px 0; }
.fw .mx td { text-align:center; padding:4px 0; }
.fw .mx td + td { border-left:1px dotted rgba(29,33,82,.1); }
.fw .mx .cm { display:inline-block; width:15px; height:15px; border:1px solid var(--ink); background:linear-gradient(135deg, var(--ivory) 50%, var(--ink) 50%); transition:transform .2s; vertical-align:middle; }
.fw .mx .cm:hover { transform:rotate(45deg) scale(1.25); background:linear-gradient(135deg, var(--ivory) 50%, var(--gold) 50%); }
.fw .sec.capx { display:block; padding-top:10px; }
.fw .sec.capx::before { display:none; }
.fw .mxp { display:none; }
.fw .pn { display:grid; grid-template-columns:1fr 1fr; gap:20px; padding:30px 56px 44px; margin-top:10px; position:relative; }
.fw .pn::before { content:""; position:absolute; left:56px; right:56px; top:0; height:1.5px; background:repeating-linear-gradient(90deg, var(--goldl) 0 9px, transparent 9px 15px); }
.fw .pn a { text-decoration:none; display:flex; flex-direction:column; gap:4px; }
.fw .pn a.n { text-align:right; }
.fw .pn .pl { font:italic 400 15px "Playfair Display", serif; color:var(--mut); }
.fw .pn .pt { font:500 30px/1.05 "Playfair Display", serif; }
.fw .pn a:hover .pt { color:var(--gold); }

/* phone */
.fw.ph .cap { left:16px; right:16px; width:auto; top:auto; bottom:70px; transform:none; }
.fw.ph .cap.out { transform:translateY(8px); }
.fw.ph .cap .nm { font-size:52px; }
.fw.ph .cap .role { margin-top:10px; font-size:17px; }
.fw.ph .cap .for { margin-top:12px; padding-top:10px; font-size:15px; }
.fw.ph .cap .lede, .fw.ph .cap .tests, .fw.ph .cap .av { display:none; }
.fw.ph .cap .tt { font-size:44px; }
.fw.ph .cap .no { font-size:16px; margin-bottom:2px; }
.fw.ph .cap .kd { margin-top:6px; font-size:17px; }
.fw.ph .cap .one { margin-top:8px; font-size:15px; line-height:1.45; }
.fw.ph .cap .facts { margin-top:10px; }
.fw.ph .cap .facts div { padding:4px 0; }
.fw.ph .cap .facts dt { font-size:21px; min-width:58px; }
.fw.ph .cap .facts dd { font-size:13px; }
.fw.ph .cap .facts div:nth-child(n+3) { display:none; }
.fw.ph .cap .mat { display:none; }
.fw.ph .cap .go { margin-top:14px; }
.fw.ph .fig { display:none; }
.fw.ph .rail { height:58px; padding:0 10px; gap:4px; }
.fw.ph .mk { width:16px; }
.fw.ph .mk .tip { display:none; }
.fw.ph .arr { width:26px; }
.fw.ph .idxb span:last-child { display:none; }
.fw.ph .sheet { inset:70px 0 0 0; }
.fw.ph .paper { width:calc(100% - 16px); top:4px; bottom:8px; }
.fw.ph .tools { right:16px; top:auto; bottom:20px; flex-direction:row; }
.fw.ph .paper { padding-bottom:40px; }
.fw.ph .cls { padding:6px 10px; font-size:15px; }
.fw.ph .hd { grid-template-columns:1fr; gap:18px; padding:26px 20px 18px; }
.fw.ph .cp { max-height:190px; }
.fw.ph .hdt h2 { font-size:44px; }
.fw.ph .hdt .line { font-size:17px; }
.fw.ph .sec { grid-template-columns:1fr; padding:24px 20px 26px; }
.fw.ph .sec::before, .fw.ph .pn::before { left:20px; right:20px; }
.fw.ph .sec > :not(.sh) { grid-column:1; }
.fw.ph .sh { position:static; grid-row:auto; margin-bottom:12px; display:flex; gap:10px; align-items:baseline; flex-wrap:wrap; }
.fw.ph .sh .rn { font-size:24px; display:inline; }
.fw.ph .sh h3 { font-size:24px; margin:0; }
.fw.ph .sh .shn { flex-basis:100%; margin-top:0; }
.fw.ph .sec p { font-size:16.5px; }
.fw.ph .sec .sum { columns:1; font-size:18px; }
.fw.ph .built, .fw.ph .checks { grid-template-columns:1fr; }
.fw.ph .ev { grid-template-columns:1fr; gap:4px; }
.fw.ph .nums > div { grid-template-columns:1fr; gap:4px; }
.fw.ph .nums dt { font-size:38px; white-space:normal; }
.fw.ph .nums.big dt { font-size:50px; }
.fw.ph .stack { columns:1; }
.fw.ph .lk a { flex-direction:column; gap:2px; }
.fw.ph .lk .lu { text-align:left; }
.fw.ph .pn { padding:24px 20px 30px; }
.fw.ph .pn .pt { font-size:22px; }
.fw.ph .mx { display:none; }
.fw.ph .mxp { display:block; }
.fw .mxp h4 { margin:18px 0 6px; font:500 22px "Playfair Display", serif; border-bottom:1.5px dashed var(--goldl); padding-bottom:4px; }
.fw .mxp ul { margin:0; padding:0; list-style:none; }
.fw .mxp li { padding:8px 0; border-bottom:1px dashed rgba(29,33,82,.13); }
.fw .mxp .skn { display:block; font:400 16px/1.35 "Spectral", serif; }
.fw .mxp .skp { display:block; margin-top:2px; font:italic 400 16px "Playfair Display", serif; color:var(--ink2); }
.fw .mxp .skp a { text-decoration:none; border-bottom:1px dashed var(--goldl); }
.fw.ph .facts2 div { grid-template-columns:1fr; gap:2px; }
.fw .cap .nm .wd .lt:first-child { margin-right:-.09em; }
.fw.ph .hdt { order:-1; }
.fw.ph .hdf { display:grid; grid-template-columns:1fr; }
.fw.ph .cp { max-height:130px; }
.fw.ph .hdf figcaption { margin-top:8px; font-size:10px; }
.fw .mxp h4:first-child { margin-top:0; }
.fw.ph .sec.capx { padding-top:0; }
@media (prefers-reduced-motion: reduce) { .fw .cap .nm .lt { animation:none; } .fw .idxc { animation:none; } }
`;
