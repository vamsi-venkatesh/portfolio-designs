/* THE YARD — walk into the farm. Flat 2D projection every frame: no CSS 3D, nothing re-rasterises. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const track = $('[data-track]'), arrows = $$('[data-arrow]'), trailBtns = $$('[data-go]'), trailFill = $('[data-trail-fill]');
  const road = $('[data-road]'), fields = $('[data-fields]'), gsvg = $('[data-ground]'), hills = $('[data-hills]');
  const Z0 = -760, STOPS = [-760, 1330, 2900, 4470, 6040, 7610, 9180, 10750, 12320, 13890, 15460], DEPTH = 15460, K = 1.0;
  const CAM_H = 150;                 // camera height above the ground, world units
  const NEAR = 40, FAR = 5200;
  let vw = 0, vh = 0, cx = 0, hy = 0, F = 1, z = 0, target = 0, raf = 0, descending = true, narrow = false, camY = 0, XS = 1, lastNarrow = null;

  /* the road's centre line, x as a function of depth (gentle bends) */
  const roadX = zz => 40 * Math.sin(zz / 520) + 70 * Math.sin(zz / 1300 + 1);
  const FIELDS = []; for (let zz = 200; zz < 17000; zz += 1500) { FIELDS.push([-2800, zz, -520, zz + 1100]); FIELDS.push([520, zz + 700, 2800, zz + 1900]); }

  const bbs = $$('.bb').map(el => ({ el, x: +el.style.getPropertyValue('--x'), z: +el.style.getPropertyValue('--z'), w: +el.style.getPropertyValue('--w'), x0: +el.style.getPropertyValue('--x'), z0: +el.style.getPropertyValue('--z'), w0: +el.style.getPropertyValue('--w') }));
  const byName = n => bbs.find(b => b.el.dataset.bb === n);
  /* ---------- the phone is its own layout, not a squeezed desktop ----------
     each building stands centred on the road ahead of its stop, at the distance that fits it
     in three quarters of the screen; its helpers stand at its feet; roadside props are removed;
     as you walk on, the building slides aside instead of coming through you. */
  const HELPERS = { hall: ['clerk', 'carriers', 'wall'], mill: ['millbot'], postoffice: ['postbot'], workshop: ['wsign'], vault: ['vaultbot'], toolwall: ['toolbot'], tower: [], barn: ['barnbot', 'cart2'], scaffold: ['hammer'], desk: ['deskbotL', 'deskbotR'] };
  const KEEP = new Set(['arch', 'house', 'tree', 'crew0', 'crew1', 'crew2']);
  function phoneLayout(on) {
    for (const b of bbs) { b.x = b.x0; b.z = b.z0; b.w = b.w0; b.el.classList.remove('gone'); b.slide = 0; }
    if (!on) return;
    const mains = $$('[data-main]').map(el => bbs.find(b => b.el === el));
    const used = new Set();
    for (const m of mains) {
      const i = +m.el.dataset.main, name = m.el.dataset.bb;
      if (name === 'arch') { m.z = 820; used.add(m); continue; }
      const hUnits = (m.hr || 1) * m.w0;
      const D = Math.max(900, Math.round(m.w0 * 2.05), Math.round(hUnits * 1.95));   // fits 3/4 of the width and stays whole above the card
      m.x = 0; m.z = STOPS[i] + D; m.D = D; m.slide = 1; used.add(m);
      (HELPERS[name] || []).forEach((hn, k) => {
        const h = byName(hn); if (!h) return;
        const side = k % 2 ? 1 : -1;
        h.x = side * (m.w0 * .5 + 70); h.z = m.z - 90 - k * 30; h.slide = 1; h.D = D; used.add(h);
        if (hn === 'wall') { h.x = -(m.w0 * .5 + 120); h.z = m.z + 120; }
        if (hn === 'cart2') { h.x = m.w0 * .5 + 140; h.z = m.z + 160; }
        if (hn === 'wsign') { h.el.classList.add('gone'); }
        if (hn === 'carriers') { h.x = -(m.w0 * .5 + 60); h.z = m.z - 120; }
      });
    }
    for (const b of bbs) {
      if (used.has(b)) continue;
      const n = b.el.dataset.bb;
      if (KEEP.has(n)) { if (n === 'house') { b.x = -760; } if (n === 'tree') { b.x = -560; } if (n.startsWith('crew')) { const i = +n.slice(4); b.z = 640 + i * 40; b.x = [-300, 330, -190][i]; } continue; }
      if (n.startsWith('ftree')) { b.x = Math.sign(b.x0) * Math.max(1100, Math.abs(b.x0)); continue; }
      b.el.classList.add('gone');                          // fences, hay, carts, signposts: not on the phone road
    }
  }
  bbs.forEach(b => { b.el.style.zIndex = String(Math.round(20000 - b.z)); });

  function layout() {
    vw = innerWidth; vh = innerHeight; narrow = vw < 900;
    cx = vw / 2; hy = vh * (narrow ? .37 : .42);
    F = narrow ? vw * 1.6 : vh * 1.05;                  // focal length in px·unit
    XS = 1;                                             // no squeeze: the phone has its own layout
    if (narrow !== lastNarrow) { phoneLayout(narrow); lastNarrow = narrow; }
    gsvg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
    track.style.height = ((DEPTH - Z0) / K + vh) + 'px';
  }
  const proj = (x, zz) => { const d = zz - (z + camY); if (d < NEAR) return null; const s = F / d; return { sx: cx + x * XS * s, sy: hy + CAM_H * s, s }; };

  function drawGround() {
    const cam = z + camY;
    let L = [], R = [];
    for (let zz = cam + NEAR + 4; zz < cam + FAR; zz += zz - cam < 400 ? 24 : 90) {
      const c = narrow ? 0 : roadX(zz), hw = 150 * (narrow ? 1.15 : 1);
      const l = proj(c - hw, zz), r = proj(c + hw, zz);
      if (!l) continue;
      L.push(`${l.sx.toFixed(1)} ${l.sy.toFixed(1)}`); R.push(`${r.sx.toFixed(1)} ${r.sy.toFixed(1)}`);
    }
    if (L.length) road.setAttribute('d', `M${L.join(' L')} L${R.reverse().join(' L')} Z`);
    let f = '';
    FIELDS.forEach(([x0, z0, x1, z1]) => {
      const zz0 = Math.max(z0, cam + NEAR + 4), zz1 = Math.min(z1, cam + FAR);
      if (zz1 <= zz0) return;
      const a = proj(x0, zz0), b = proj(x1, zz0), c = proj(x1, zz1), d = proj(x0, zz1);
      if (!a || !c) return;
      f += `<polygon points="${a.sx.toFixed(0)},${a.sy.toFixed(0)} ${b.sx.toFixed(0)},${b.sy.toFixed(0)} ${c.sx.toFixed(0)},${c.sy.toFixed(0)} ${d.sx.toFixed(0)},${d.sy.toFixed(0)}" fill="url(#hatch2)" stroke="#221f1c" stroke-width="2" stroke-opacity=".12"/>`;
    });
    fields.innerHTML = f;
  }
  /* each billboard's natural height, measured once so scale() can anchor it at its feet */
  function measure() { bbs.forEach(b => { b.el.style.transform = 'none'; b.el.style.width = b.w + 'px'; b.hr = b.el.offsetHeight / b.w; }); }
  function placeFast() {
    const cam = z + camY;
    for (const b of bbs) {
      if (b.el.classList.contains('gone')) { b.el.style.visibility = 'hidden'; continue; }
      const d = b.z - cam;
      if (d < NEAR) { b.el.style.visibility = 'hidden'; continue; }
      const s = F / d, wpx = b.w * s;
      if (wpx > vw * 4) { b.el.style.visibility = 'hidden'; continue; }
      b.el.style.visibility = '';
      /* on the phone a building you have reached slides off to the side as you walk on, never through you */
      let x = b.x, fadeNear = 320;
      if (narrow && b.slide) { const D = b.D || 900, p = Math.max(0, Math.min(1, 1 - (d - 160) / (D * .85))); const side = b.x < 0 ? -1 : (b.x > 0 ? 1 : -1); x = b.x + side * p * 1100; fadeNear = 420; }
      const near = d < fadeNear ? Math.max(0, (d - NEAR) / (fadeNear - NEAR)) : 1;
      b.el.style.opacity = (b.fade == null ? near : near * b.fade).toFixed(3);
      b.el.style.width = wpx.toFixed(2) + 'px';
      b.el.style.transform = `translate3d(${(cx + x * s - wpx / 2).toFixed(2)}px, ${(hy + CAM_H * s - b.hr * wpx).toFixed(2)}px, 0)`;
    }
    drawGround();
    if (hills) hills.style.transform = `translateX(${(-cam * .012).toFixed(1)}px)`;
    trailFill.style.width = ((z - Z0) / (DEPTH - Z0) * 100) + '%';
    const at = STOPS.reduce((a, s, i) => (z + 600 >= s ? i : a), 0);
    trailBtns.forEach((b, i) => b.classList.toggle('on', i === at));
    /* you have ARRIVED when you stand at the stop; only then the building's tag comes out */
    const here = !descending && z > STOPS[at] - 160 && z < STOPS[at] + 380;
    $$('[data-words],[data-card]').forEach(el => el.classList.toggle('in', here && +el.dataset.stop === at));
    pinCard(at, here);
    if (here && at !== lastAt) { lastAt = at; arriveAt(at); } else if (!here) lastAt = -1;
    arrows[0].disabled = z <= Z0 + 2; arrows[1].disabled = z >= DEPTH - 2;
  }
  /* the card hangs off its building on a thread, so the two read as one thing */
  const mains = {}; $$('[data-main]').forEach(el => { mains[+el.dataset.main] = bbs.find(b => b.el === el); });
  const thread = $('[data-thread]'), tpath = $('[data-thread-path]'), tpin = $('[data-thread-pin]');
  let lastAt = -1;
  function pinCard(at, here) {
    const card = $(`[data-card][data-stop="${at}"]`), m = mains[at];
    if (!card || !m || narrow) { thread && thread.classList.remove('on'); return; }
    const d = m.z - (z + camY); if (d < NEAR) return;
    const s = F / d, wpx = m.w * s, sx = cx + m.x * s, top = hy + CAM_H * s - m.hr * wpx;
    const cw = card.offsetWidth || 420, ch = card.offsetHeight || 400;
    const left = m.x < 0;                                  // building on the left → card to its right
    let cxp = left ? sx + wpx / 2 + 36 : sx - wpx / 2 - 36 - cw;
    cxp = Math.max(16, Math.min(vw - cw - 16, cxp));
    let cy = Math.max(64, Math.min(vh - ch - 90, top + 10));
    card.style.left = cxp + 'px'; card.style.right = 'auto'; card.style.top = cy + 'px';
    /* thread from the building's sign to the card's near edge */
    const px = sx, py = top + m.hr * wpx * .28;
    const ex = left ? cxp : cxp + cw, ey = cy + 40;
    tpath.setAttribute('d', `M${px} ${py} Q${(px + ex) / 2} ${py - 30} ${ex} ${ey}`);
    tpin.setAttribute('cx', px); tpin.setAttribute('cy', py);
    thread.classList.toggle('on', here);
  }

  function onScroll() { if (descending) return; target = Math.min(DEPTH, Math.max(Z0, Z0 + scrollY * K)); if (!raf) raf = requestAnimationFrame(tick); }
  function tick() {
    raf = 0;
    const d = target - z;
    if (Math.abs(d) < .3 || reduce) { z = target; placeFast(); return; }
    z += d * .12; placeFast(); raf = requestAnimationFrame(tick);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { layout(); measure(); placeFast(); onScroll(); });

  const atStop = () => STOPS.reduce((acc, s, i) => (z + 600 >= s ? i : acc), 0);
  const goStop = i => scrollTo({ top: (Math.min(DEPTH, STOPS[i]) - Z0) / K, behavior: reduce ? 'auto' : 'smooth' });
  arrows.forEach(a => a.addEventListener('click', () => {
    const dir = +a.dataset.arrow, at = atStop();
    const next = Math.min(STOPS.length - 1, Math.max(0, at + dir));
    if (next === at) scrollBy({ top: dir * 500 / K, behavior: reduce ? 'auto' : 'smooth' }); else goStop(next);
  }));
  trailBtns.forEach((b, i) => { if (!b.disabled) b.addEventListener('click', () => goStop(i)); });
  addEventListener('keydown', e => {
    if (descending) { finishDescent(); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); arrows[1].click(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); arrows[0].click(); }
  });

  /* ---------- arrival: standing on the road outside, walk in through the gate ---------- */
  const crew = $$('[data-crew]').map(b => { const bb = bbs.find(o => o.el === b); return { wrap: b, use: b.querySelector('use'), g: b.querySelector('.art > g'), bb, xm: bb.x, zm: bb.z, xs: [-70, 30, 100][+b.dataset.crew], zs: bb.z - 520 }; });
  let descentDone = false, walkRaf = 0, waved = false;
  const DESCENT_MS = 5200, START_Z = -1500;
  function descent() {
    document.body.classList.add('descending');
    z = Z0; camY = START_Z - Z0;
    crew.forEach(c => c.use.classList.add('idle'));
    placeFast();
    setTimeout(() => { if (!descentDone) $('[data-skip]').classList.add('show'); }, 900);
    const t0 = performance.now();
    const step = now => {
      if (descentDone) return;
      const t = Math.min(1, (now - t0) / DESCENT_MS);
      const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      camY = (START_Z - Z0) * (1 - e);
      /* as you come up the road, they see you and wave */
      if (t > .38 && !waved) { waved = true; crew.forEach((c, i) => setTimeout(() => { c.use.classList.add('wave'); setTimeout(() => c.use.classList.remove('wave'), 1900 + i * 300); }, i * 220)); }
      placeFast();
      if (t < 1) walkRaf = requestAnimationFrame(step); else finishDescent();
    };
    walkRaf = requestAnimationFrame(step);
  }
  function finishDescent() {
    if (descentDone) return; descentDone = true; descending = false;
    cancelAnimationFrame(walkRaf);
    camY = 0;
    document.body.classList.remove('descending');
    $('[data-skip]').classList.remove('show');
    landing(); placeFast();
  }
  function landing() {
    const sign = $('[data-sign]');
    crew.forEach((c, i) => { c.use.classList.add('idle'); if (!waved) { waved = true; setTimeout(() => { c.use.classList.add('wave'); setTimeout(() => c.use.classList.remove('wave'), 1600); }, i * 200); } });
    if (reduce) { sign.classList.add('swing'); return; }
    setTimeout(() => { sign.classList.add('drop'); sign.addEventListener('animationend', () => { sign.classList.remove('drop'); sign.classList.add('swing'); }, { once: true }); }, 200);
  }
  $('[data-skip]').addEventListener('click', finishDescent);
  ['wheel', 'touchstart', 'pointerdown'].forEach(ev => addEventListener(ev, () => { if (descending) finishDescent(); }, { passive: true }));

  if (!reduce) setInterval(() => {
    if (descending || z > 600) return;
    const c = crew[Math.floor(Math.random() * crew.length)];
    c.use.classList.add('lookup'); setTimeout(() => c.use.classList.remove('lookup'), 1100);
  }, 4200);
  if (!reduce) setInterval(() => {
    const eyes = $$('#bot .eye');
    eyes.forEach(e => { e.dataset.r = e.getAttribute('r'); e.setAttribute('r', '0.6'); });
    setTimeout(() => eyes.forEach(e => e.setAttribute('r', e.dataset.r || '4.6')), 110);
  }, 3100);

  /* ---------- bots with a job: shuttles walk a stretch and back, carrying ---------- */
  const shuttles = $$('[data-shuttle]').map(el => { const [a, b, p] = el.dataset.shuttle.split(',').map(Number); const bb = bbs.find(o => o.el === el); return { bb, a, b, p, use: el.querySelector('use') }; });
  function shuttle(now) {
    for (const s of shuttles) {
      if (narrow || Math.abs(s.bb.z - (z + camY)) > 2600 || descending) continue;
      const t = (now % s.p) / s.p, e = t < .5 ? t * 2 : 2 - t * 2;
      s.bb.x = s.a + (s.b - s.a) * e; s.bb.fade = e > .96 ? 0 : 1;
      s.use.classList.add('carry');
    }
  }
  /* ---------- what happens when you arrive somewhere ---------- */
  const ACTS = {
    0: () => crew.forEach((c, i) => setTimeout(() => { c.use.classList.add('wave'); setTimeout(() => c.use.classList.remove('wave'), 1800); }, i * 200)),
    2: () => { const s = $('[data-act="sheet"]'); if (s) { s.classList.remove('go'); void s.getBBox(); s.classList.add('go'); } },
    3: () => { const l = $('[data-act="letter"]'); if (l) { l.classList.remove('go'); void l.getBBox(); l.classList.add('go'); } },
    4: () => runMachine(),
    5: () => { const b = $('[data-bb="vaultbot"] use'); if (b) { b.classList.add('lookup'); setTimeout(() => b.classList.remove('lookup'), 1500); } },
    6: () => { const b = $('[data-bb="toolbot"] use'); if (b) { b.classList.add('point'); setTimeout(() => { b.classList.remove('point'); b.classList.add('lookup'); setTimeout(() => b.classList.remove('lookup'), 1400); }, 1800); } },
    10: () => { $$('.greeter use').forEach((b, i) => setTimeout(() => { b.classList.add('wave'); setTimeout(() => b.classList.remove('wave'), 1900); }, i * 250)); const bk = $('[data-act="book"]'); if (bk) { bk.classList.remove('go'); void bk.getBBox(); bk.classList.add('go'); } },
  };
  function arriveAt(i) { if (reduce) return; const f = ACTS[i]; if (f) setTimeout(f, 250); }
  /* idle life: someone somewhere always does something small */
  if (!reduce) setInterval(() => {
    if (descending) return;
    const near = bbs.filter(b => b.el.querySelector('use.bot') && Math.abs(b.z - z) < 2600 && !b.el.querySelector('use.carry, use.work'));
    if (!near.length) return;
    const b = near[Math.floor(Math.random() * near.length)].el.querySelector('use.bot');
    const move = Math.random() < .5 ? 'lookup' : 'shrug';
    b.classList.add(move); setTimeout(() => b.classList.remove(move), 1100);
  }, 2600);

  /* ---------- the carriers: across the yard and in through the sealed door ---------- */
  const carriers = bbs.find(b => b.el.hasAttribute('data-carriers'));
  const CPATH = { x0: -1000, x1: -520, z0: 2390, z1: 2450 };
  let cu = 0, last = 0;
  function carry(now) {
    if (!last) last = now;
    const dt = Math.min(50, now - last); last = now;
    if (carriers && !narrow && Math.abs(CPATH.z0 - z) < 2200 && !reduce && !descending) {
      cu += dt / 5600; if (cu >= 1.2) cu = 0;
      const t = Math.min(1, cu), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const fade = t > .92 ? (1 - t) / .08 : (t < .06 ? t / .06 : 1);
      carriers.x = CPATH.x0 + (CPATH.x1 - CPATH.x0) * e; carriers.z = CPATH.z0 + (CPATH.z1 - CPATH.z0) * e;
      carriers.fade = fade;
    }
    shuttle(now);
    requestAnimationFrame(carry);
  }
  requestAnimationFrame(carry);
  $$('[data-bb="clerk"] use, [data-bb="hammer"] use').forEach(c => c.classList.add('idle'));

  /* ---------- the machine at the workshop: the real cycle, scoped to its own drawing ---------- */
  let machineBusy = false;
  async function runMachine() {
    const m = $('[data-bb="workshop"] svg.machine'); if (!m || machineBusy) return;
    const q = s => m.querySelector(s), qa = s => Array.from(m.querySelectorAll(s));
    const brief = q('[data-brief]'), mark = q('[data-stampmark]'), pass = q('[data-passmark]'), tag = q('[data-brief-tag]');
    const lever = q('[data-lever]'), stamp = q('[data-stamp]'), human = q('[data-human]'), bell = q('[data-bell]'), ring = q('[data-ring]');
    const lamp = q('[data-lamp]'), needle = q('[data-needle]'), yes = q('[data-yes]'), agents = qa('.agent'), puffs = q('[data-puffs]');
    if (!brief) return;
    machineBusy = true;
    agents.forEach(a => a.classList.add('on'));
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const at = (x, y, rot = 0) => { brief.setAttribute('transform', `translate(${x} ${y}) rotate(${rot})`); if (tag) tag.setAttribute('transform', `translate(${x} ${y + 62})`); };
    const glide = (x0, y0, x1, y1, ms, r0 = 0, r1 = 0, arc = 0) => new Promise(res => {
      const t0 = performance.now();
      const step = now => { const u = Math.min(1, (now - t0) / ms), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        at(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e - Math.sin(e * Math.PI) * arc, r0 + (r1 - r0) * e); u < 1 ? requestAnimationFrame(step) : res(); };
      requestAnimationFrame(step);
    });
    const puff = (x, y) => { if (!puffs) return; const g = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); g.setAttribute('cx', x); g.setAttribute('cy', y); g.setAttribute('r', 7); g.setAttribute('fill', '#b7714a'); g.setAttribute('opacity', '.2'); puffs.appendChild(g); const t0 = performance.now(); const step = now => { const u = Math.min(1, (now - t0) / 1000); g.setAttribute('r', 7 + u * 30); g.setAttribute('cy', y - u * 42); g.setAttribute('opacity', (0.2 * (1 - u) * (1 - u)).toFixed(3)); u < 1 ? requestAnimationFrame(step) : g.remove(); }; requestAnimationFrame(step); };
    lever.classList.add('down'); await wait(170); lever.classList.remove('down');
    brief.setAttribute('opacity', '1'); mark.setAttribute('opacity', '0'); pass.setAttribute('opacity', '0');
    if (tag) { const tt = tag.querySelector('text'); if (tt) tt.textContent = 'A BRIEF'; tag.setAttribute('opacity', '1'); }
    at(300, 84, -8); await glide(300, 84, 300, 296, 540, -8, 5); puff(300, 300); await glide(300, 296, 300, 382, 360, 5, 0);
    let lx = 300, ly = 382, lr = 0;
    for (const [i, x, y, r, ms] of [[0, 424, 380, 0, 460], [1, 596, 376, 7, 560], [2, 768, 384, -5, 560]]) {
      agents[i] && agents[i].classList.add('busy'); await glide(lx, ly, x, y, ms, lr, r); lx = x; ly = y; lr = r; await wait(900); agents[i] && agents[i].classList.remove('busy');
    }
    await glide(768, 384, 944, 382, 520, -5, 0);
    lamp.classList.add('hot'); needle.classList.add('kick'); stamp.classList.add('slam'); await wait(170);
    m.classList.add('shake'); setTimeout(() => m.classList.remove('shake'), 340); puff(944, 392); puff(986, 400);
    mark.setAttribute('opacity', '1'); agents.forEach((a, i) => setTimeout(() => { a.classList.add('flinch'); setTimeout(() => a.classList.remove('flinch'), 460); }, i * 70));
    stamp.classList.remove('slam'); await wait(1400);
    m.classList.add('recycling');
    await glide(944, 382, 986, 200, 560, 0, -18, 34); await glide(986, 200, 700, 74, 780, -18, 10, 46); await glide(700, 74, 356, 96, 760, 10, -6, 34); await glide(356, 96, 300, 296, 520, -6, 4, 0);
    m.classList.remove('recycling'); lamp.classList.remove('hot'); needle.classList.remove('kick'); mark.setAttribute('opacity', '0');
    await glide(300, 296, 300, 382, 300, 4, 0);
    agents.forEach(a => a.classList.add('busy')); await glide(300, 382, 596, 376, 720, 0, 6); await glide(596, 376, 768, 384, 480, 6, -4); agents.forEach(a => a.classList.remove('busy'));
    await glide(768, 384, 944, 382, 560, -4, 0); stamp.classList.add('slam'); await wait(160); stamp.classList.remove('slam'); puff(944, 392);
    pass.setAttribute('opacity', '1');
    human.classList.add('sip'); await wait(440); human.classList.remove('sip');
    await glide(944, 382, 1120, 372, 660); human.classList.add('look'); await wait(820); human.classList.remove('look');
    human.classList.add('nod'); yes.classList.add('on'); yes.setAttribute('opacity', '1'); await wait(680); human.classList.remove('nod'); await wait(600);
    await glide(1120, 372, 1272, 414, 560, 0, 8); await glide(1272, 414, 1318, 542, 520, 8, 16, 22);
    bell.classList.add('ring'); ring.setAttribute('opacity', '1'); agents.forEach((a, i) => setTimeout(() => { a.classList.add('cheer'); setTimeout(() => a.classList.remove('cheer'), 760); }, i * 90));
    await wait(380); ring.setAttribute('opacity', '0'); bell.classList.remove('ring'); yes.classList.remove('on'); yes.setAttribute('opacity', '0'); puff(1318, 548);
    brief.setAttribute('opacity', '0'); if (tag) tag.setAttribute('opacity', '0'); pass.setAttribute('opacity', '0');
    machineBusy = false;
    /* keep the line running while you stand here */
    setTimeout(() => { const at = STOPS.reduce((a, s, i) => (z + 600 >= s ? i : a), 0); if (at === 4 && Math.abs(z - STOPS[4]) < 400) runMachine(); }, 2200);
  }

  layout(); measure(); lastNarrow = null; layout(); placeFast();
  scrollTo(0, 0); z = Z0; target = Z0;
  /* arriving from the front page at a named stop: skip the walk-in and stand there */
  const hashStop = (location.hash.match(/^#stop-(\d+)$/) || [])[1];
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => {
    measure();
    if (hashStop != null && STOPS[+hashStop] != null) { finishDescent(); scrollTo(0, (STOPS[+hashStop] - Z0) / K); z = STOPS[+hashStop]; target = z; placeFast(); }
    else reduce ? finishDescent() : descent();
  });
  /* frame-time probe for the proof */
  const frames = []; let lastF = 0;
  (function fp(now) { if (lastF) frames.push(now - lastF); lastF = now; if (frames.length > 2000) frames.shift(); requestAnimationFrame(fp); })(performance.now());
  window.__yard = { get z() { return z; }, get descending() { return descending; }, STOPS, DEPTH, finishDescent, frames };
})();
