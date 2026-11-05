// Breach — travelling inside the lattice: glide, steer, visit the twelve chambers.
import * as THREE from '../../vendor/three.module.js';
import { work, principles, withdrawn, person } from '../../10-for-you/content.mjs';

export function createNav({ lat, latCam, canvas, TOUCH, REDUCED, getT, onFirstUse }) {
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const ease = (u) => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const ZMAX = -40, ZMIN = -2380, XMAX = 255;
  const ITEMS = [
    ...work.map((w) => ({ slug: w.slug, title: w.name, kind: 'work', line: w.line })),
    { slug: 'how-i-work', title: 'How I work', kind: 'list', items: principles.map((p) => p.k) },
    { slug: 'claims-withdrawn', title: 'Claims I withdrew', kind: 'list', items: withdrawn.map((w) => w.title) },
    { slug: 'about', title: 'About', kind: 'about' },
    { slug: 'contact', title: 'Contact', kind: 'contact' },
  ];
  const CH = lat.chambers;
  const T = { x: 0, y: 0, z: -200, vx: 0, vz: 0, yaw: 0, pitch: 0, fly: null, open: -1, hover: -1, active: false, used: false, keys: new Set(), drag: null };

  /* ---------------- DOM: hover label, panel, map */
  const label = el('div', 'ui chlabel'); label.setAttribute('aria-hidden', 'true'); document.body.appendChild(label);
  const panel = el('aside', 'ui panel'); panel.setAttribute('aria-live', 'polite'); document.body.appendChild(panel);
  const map = el('nav', 'ui map'); map.setAttribute('aria-label', 'Chambers along the nave'); document.body.appendChild(map);
  const track = el('div', 'track'); const you = el('i', 'you'); track.appendChild(you); map.appendChild(track);
  const zf = (z) => (ZMAX - z) / (ZMAX - ZMIN);
  CH.forEach((c, i) => {
    const b = el('button', 'tick'); b.style.left = (zf(c.pos.z) * 100) + '%'; b.classList.add(c.pos.x > 0 ? 'r' : 'l');
    b.setAttribute('aria-label', ITEMS[i].title); b.title = ITEMS[i].title;
    b.addEventListener('click', (e) => { e.stopPropagation(); open(i, true); }); track.appendChild(b);
  });
  for (const n of [label, panel, map]) for (const ev of ['pointerdown', 'touchstart']) n.addEventListener(ev, (e) => e.stopPropagation(), { passive: true });

  function fillPanel(i) {
    const it = ITEMS[i]; panel.replaceChildren();
    const k = el('p', 'kick', `chamber ${String(i + 1).padStart(2, '0')} / 12` + (it.kind === 'work' ? ' · work' : ''));
    const h = el('h2', null, it.title); panel.append(k, h);
    if (it.kind === 'work') panel.append(el('p', 'line', it.line), el('p', 'quiet', 'full world coming next'));
    else if (it.kind === 'list') { const ul = el('ul'); for (const s of it.items) ul.appendChild(el('li', null, s)); panel.appendChild(ul); }
    else if (it.kind === 'about') panel.append(el('p', 'line', person.name), el('p', 'sub', `${person.role} · ${person.city}`));
    else if (it.kind === 'contact') {
      const ul = el('ul', 'links');
      for (const [t, href] of [[person.email, 'mailto:' + person.email], ['LinkedIn', person.linkedin], ['GitHub', person.github]]) {
        const li = el('li'); const a = el('a', null, t); a.href = href; if (!href.startsWith('mailto')) { a.target = '_blank'; a.rel = 'noopener'; } li.appendChild(a); ul.appendChild(li);
      }
      panel.appendChild(ul);
    }
    const nav = el('div', 'pnav');
    const prev = el('button', null, '← prev'), next = el('button', null, 'next →'), close = el('button', 'close', 'close · esc');
    prev.addEventListener('click', () => open((i + 11) % 12, false, true)); next.addEventListener('click', () => open((i + 1) % 12, false, true));
    close.addEventListener('click', () => closeChamber(true));
    nav.append(prev, next, close); panel.appendChild(nav);
  }

  /* ---------------- flights */
  const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  function flyTo(x, z, yaw, pitch, dur, then) {
    T.fly = { t0: getT(), dur: REDUCED ? 0.001 : dur, x0: T.x, z0: T.z, y0: T.yaw, p0: T.pitch, x, z, yaw: T.yaw + wrapA(yaw - T.yaw), pitch, then };
    T.vx = T.vz = 0;
  }
  function chamberView(i) {
    const c = CH[i].pos, side = Math.sign(c.x); const cx = side * 20, cz = c.z + 20;
    const yaw0 = Math.atan2(-(c.x - cx), -(c.z - cz));
    const portrait = innerWidth / innerHeight < 0.85;
    return { x: cx, z: cz, yaw: yaw0 + (portrait ? 0 : -0.26), pitch: portrait ? 0.05 : 0.12 };
  }
  function open(i, push, replace) {
    if (!T.active) return;
    const h = '#chamber/' + ITEMS[i].slug;
    if (push && location.hash !== h) history.pushState({ ch: i }, '', h); else if (replace) history.replaceState({ ch: i }, '', h);
    panel.classList.remove('on'); T.open = -1; use();
    const v = chamberView(i);
    flyTo(v.x, v.z, v.yaw, v.pitch, 1.6, () => { T.open = i; fillPanel(i); panel.classList.add('on'); });
  }
  function closeChamber(push) {
    if (push && location.hash.startsWith('#chamber/')) history.pushState(null, '', location.pathname + location.search);
    panel.classList.remove('on'); T.open = -1;
    flyTo(0, T.fly ? T.fly.z : T.z, 0, 0, 1.2);
  }
  function route() {
    const m = location.hash.match(/^#chamber\/([\w-]+)/);
    if (m) { const i = ITEMS.findIndex((it) => it.slug === m[1]); if (i >= 0 && T.open !== i) open(i, false); }
    else if (T.open >= 0 || (T.fly && T.fly.then)) closeChamber(false);
  }
  addEventListener('popstate', route);

  /* ---------------- input */
  function use() { if (!T.used) { T.used = true; onFirstUse && onFirstUse(); } }
  const impulse = (amt) => { T.vx += -Math.sin(T.yaw) * amt; T.vz += -Math.cos(T.yaw) * amt; };
  addEventListener('wheel', (e) => {
    if (!T.active) return; e.preventDefault(); if (T.fly || T.open >= 0) return;
    let dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1); dy = clamp(dy, -120, 120);
    impulse(dy * 1.2); if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) T.yaw = clamp(T.yaw - e.deltaX * 0.0015, -1.35, 1.35); use();
  }, { passive: false });
  function pick(px, py) {
    let best = -1, bd = 1e9; const v = new THREE.Vector3(); const f = (innerHeight / 2) / Math.tan(THREE.MathUtils.degToRad(latCam.fov / 2));
    CH.forEach((c, i) => {
      v.copy(c.pos).project(latCam); if (v.z > 1 || v.z < -1) return;
      const sx = (v.x * 0.5 + 0.5) * innerWidth, sy = (-v.y * 0.5 + 0.5) * innerHeight; const dist = c.pos.distanceTo(latCam.position);
      const r = Math.max(TOUCH ? 40 : 30, 60 / dist * f); const d = Math.hypot(sx - px, sy - py);
      if (d < r && d < bd && dist < 1900) { bd = d; best = i; }
    });
    return best;
  }
  function pointerDown(e) { T.drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, type: e.pointerType, moved: false, t: getT() }; try { canvas.setPointerCapture(e.pointerId); } catch (err) {} }
  function pointerMove(e) {
    if (!T.active) return;
    if (T.drag) {
      const dx = e.clientX - T.drag.x, dy = e.clientY - T.drag.y; T.drag.x = e.clientX; T.drag.y = e.clientY;
      if (Math.hypot(e.clientX - T.drag.sx, e.clientY - T.drag.sy) > 6) T.drag.moved = true;
      if (T.drag.moved && !T.fly && T.open < 0) {
        T.yaw = clamp(T.yaw + dx * 0.0042, -1.35, 1.35);
        if (T.drag.type === 'touch') impulse(-dy * 2.2); else T.pitch = clamp(T.pitch + dy * 0.0028, -0.42, 0.42);
        use();
      }
    } else if (!TOUCH) T.hover = pick(e.clientX, e.clientY);
  }
  function pointerUp(e) {
    if (!T.drag) return; const d = T.drag; T.drag = null;
    if (!d.moved && getT() - d.t < 0.6) { const i = pick(e.clientX, e.clientY); if (i >= 0) open(i, true); }
  }
  addEventListener('keydown', (e) => {
    if (!T.active) return;
    if (e.key === 'Escape') { if (T.open >= 0 || (T.fly && T.fly.then)) closeChamber(true); else flyTo(0, T.z, 0, 0, 1.0); return; }
    const k = e.key.toLowerCase(); if (['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { T.keys.add(k); e.preventDefault(); use(); }
  });
  addEventListener('keyup', (e) => T.keys.delete(e.key.toLowerCase()));
  addEventListener('blur', () => T.keys.clear());

  /* ---------------- per frame */
  const pv = new THREE.Vector3(), lq = new THREE.Quaternion(), m4 = new THREE.Matrix4(), UP = new THREE.Vector3(0, 1, 0);
  function collide() {
    const k0 = Math.round((-T.z - 40) / 80);
    for (let k = k0 - 1; k <= k0 + 1; k++) {
      if (k < 0 || k > 28) continue; const pz = -(k * 80 + 40);
      const pts = [[150, pz], [-150, pz]]; if (k % 2 === 0) pts.push([280, pz], [-200, pz]);
      for (const [px, qz] of pts) { const dx = T.x - px, dz = T.z - qz, d = Math.hypot(dx, dz); if (d < 28 && d > 1e-3) { T.x = px + dx / d * 28; T.z = qz + dz / d * 28; } }
    }
  }
  function step(dt, t, lt) {
    if (T.fly) {
      const F = T.fly, u = clamp((t - F.t0) / F.dur, 0, 1), e = ease(u);
      T.x = F.x0 + (F.x - F.x0) * e; T.z = F.z0 + (F.z - F.z0) * e; T.yaw = F.y0 + (F.yaw - F.y0) * e; T.pitch = F.p0 + (F.pitch - F.p0) * e;
      if (u >= 1) { T.fly = null; F.then && F.then(); }
    } else if (T.open < 0) {
      const K = T.keys, fwd = (K.has('w') || K.has('arrowup') ? 1 : 0) - (K.has('s') || K.has('arrowdown') ? 1 : 0);
      const str = (K.has('d') ? 1 : 0) - (K.has('a') ? 1 : 0), turn = (K.has('arrowright') ? 1 : 0) - (K.has('arrowleft') ? 1 : 0);
      const hx = -Math.sin(T.yaw), hz = -Math.cos(T.yaw), rx = Math.cos(T.yaw), rz = -Math.sin(T.yaw);
      T.vx += (hx * fwd * 520 + rx * str * 380) * dt; T.vz += (hz * fwd * 520 + rz * str * 380) * dt;
      T.yaw = clamp(T.yaw - turn * 1.1 * dt, -1.35, 1.35);
      const fr = Math.exp(-dt * 1.7); T.vx *= fr; T.vz *= fr;
      const drift = REDUCED ? 0 : 5 * Math.min(1, lt / 3);
      T.x += T.vx * dt; T.z += (T.vz - drift) * dt;
      if (T.z > ZMAX) { T.vz -= (T.z - ZMAX) * 10 * dt; T.z -= (T.z - ZMAX) * Math.min(1, dt * 3); }
      if (T.z < ZMIN) { T.vz += (ZMIN - T.z) * 10 * dt; T.z += (ZMIN - T.z) * Math.min(1, dt * 3); }
      if (Math.abs(T.x) > XMAX) { const o = T.x - Math.sign(T.x) * XMAX; T.vx -= o * 10 * dt; T.x -= o * Math.min(1, dt * 3); }
      collide();
    }
    const fl = REDUCED ? 0 : 1 - Math.exp(-lt * 0.6);
    latCam.position.set(T.x + Math.sin(t * 0.21) * 4 * fl, T.y + Math.sin(t * 0.35) * 7 * fl, T.z);
    latCam.quaternion.setFromEuler(new THREE.Euler(T.pitch + Math.sin(t * 0.17) * 0.012 * fl, T.yaw + Math.sin(t * 0.11) * 0.015 * fl, 0, 'YXZ'));
    you.style.left = (clamp(zf(T.z), 0, 1) * 100) + '%';
  }
  function chambers(dt, t) {
    lat.uniforms.uCam.value.copy(latCam.position);
    let nearest = -1, nd = 1e9;
    CH.forEach((c, i) => {
      const d = c.pos.distanceTo(latCam.position);
      const near = clamp(1 - (d - 160) / 520, 0, 1); c.near += (near - c.near) * Math.min(1, dt * 3); c.u.uNear.value = c.near;
      const op = T.open === i ? 1 : 0; c.open += (op - c.open) * Math.min(1, dt * (op ? 2.2 : 3.5)); c.u.uOpen.value = c.open;
      const spin = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(t * 0.3 + i) * 0.3, i * 0.6 + t * (0.25 + 0.04 * (i % 3)) * (i % 2 ? 1 : -1) * (1 - c.open * 0.8), 0));
      m4.lookAt(latCam.position, c.pos, UP); lq.setFromRotationMatrix(m4);
      c.g.quaternion.copy(spin).slerp(lq, c.near * 0.85);
      c.g.scale.setScalar(0.85 * (1 + 0.08 * Math.sin(t * 1.2 + i * 2.1)));
      if (d < nd) { nd = d; nearest = i; }
    });
    const show = T.open >= 0 || T.fly || !T.active ? -1 : (TOUCH ? (nd < 520 ? nearest : -1) : T.hover);
    if (show >= 0) {
      pv.copy(CH[show].pos).project(latCam);
      if (pv.z < 1) { const f = (innerHeight / 2) / Math.tan(THREE.MathUtils.degToRad(latCam.fov / 2)); const r = 60 / CH[show].pos.distanceTo(latCam.position) * f;
        label.textContent = ITEMS[show].title; const lw = label.offsetWidth || 150; let lx = (pv.x * 0.5 + 0.5) * innerWidth + r + 10; if (lx + lw > innerWidth - 14) lx = (pv.x * 0.5 + 0.5) * innerWidth - r - 10 - lw;
        label.style.transform = `translate(${Math.max(14, lx)}px,${(-pv.y * 0.5 + 0.5) * innerHeight - 10}px)`; label.classList.add('on'); }
      else label.classList.remove('on');
    } else label.classList.remove('on');
    if (T.active) canvas.style.cursor = T.hover >= 0 ? 'pointer' : (T.drag ? 'grabbing' : 'grab');
  }
  function activate(x, y, z, yaw, pitch, vz) { T.active = true; T.x = x; T.y = y; T.z = z; T.yaw = yaw; T.pitch = pitch; T.vx = 0; T.vz = vz; map.classList.add('on'); setTimeout(route, 0); }
  return { T, ITEMS, step, chambers, activate, pointerDown, pointerMove, pointerUp, open, hasRoute: () => location.hash.startsWith('#chamber/') };
}
