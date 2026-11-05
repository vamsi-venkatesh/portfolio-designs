// Playground — "the machine's rules, unlocked". A window where the visitor rewrites the laws
// (gravity, time, light, attraction, colour, air) and plays: drag to pour matter and fling it,
// tap to drop a well, draw walls to build with. Canvas 2D, additive light, no network.
const CSS = `
.pg{position:absolute;inset:0;overflow:hidden;background:#04060b;color:#cfe6ff;font-family:"Fragment Mono",Menlo,monospace;-webkit-user-select:none;user-select:none}
.pg canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:crosshair}
.pg-panel{position:absolute;left:12px;top:12px;width:250px;max-height:calc(100% - 24px);overflow:auto;background:#04060bd9;border:1px solid #cfe6ff2e;border-radius:10px;padding:12px 12px 10px;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-sizing:border-box}
.pg-panel.shut .pg-body{display:none}
.pg-top{display:flex;justify-content:space-between;align-items:center;gap:8px}
.pg-top h3{margin:0;font:700 13px "Unbounded",sans-serif;letter-spacing:.06em;color:#ffd2a0}
.pg-tog{font:inherit;font-size:11px;background:none;border:1px solid #cfe6ff44;color:#cfe6ff;border-radius:6px;padding:3px 7px;cursor:pointer}
.pg-law{display:grid;grid-template-columns:1fr auto;gap:2px 8px;margin-top:10px;font-size:11px}
.pg-law span{color:#8fa6bf;letter-spacing:.04em}
.pg-law output{color:#ffd2a0;font-variant-numeric:tabular-nums}
.pg-law input{grid-column:1/-1;width:100%;margin:0;accent-color:#ffd2a0;height:18px}
.pg-tools{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:12px}
.pg-tools button,.pg-acts button{font:inherit;font-size:11px;background:#cfe6ff10;border:1px solid #cfe6ff2e;color:#cfe6ff;border-radius:6px;padding:7px 4px;cursor:pointer}
.pg-tools button[aria-pressed=true]{background:#ffd2a0;color:#04060b;border-color:#ffd2a0}
.pg-tools button:focus-visible,.pg-acts button:focus-visible,.pg-tog:focus-visible,.pg-law input:focus-visible{outline:2px solid #ffd2a0;outline-offset:1px}
.pg-acts{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:6px}
.pg-hint{font-size:10.5px;line-height:1.5;color:#8fa6bf;margin:10px 0 0}
.pg-hud{position:absolute;right:12px;bottom:10px;font-size:10.5px;color:#8fa6bf;text-align:right;pointer-events:none;line-height:1.5}
.pg-hud b{color:#cfe6ff;font-weight:400}
`;
const LAWS = [
  { k: 'g', name: 'gravity', min: -1.5, max: 1.5, step: 0.05, v: 0.25, f: (x) => (x >= 0 ? '+' : '') + x.toFixed(2) + ' g' },
  { k: 'time', name: 'time scale', min: 0, max: 3, step: 0.05, v: 1, f: (x) => '×' + x.toFixed(2) },
  { k: 'light', name: 'speed of light (trails)', min: 0, max: 0.985, step: 0.005, v: 0.86, f: (x) => (x > 0.9 ? 'slow ' : x < 0.4 ? 'instant ' : '') + Math.round(x * 100) + '%' },
  { k: 'pull', name: 'attraction', min: -2, max: 2, step: 0.05, v: 1, f: (x) => (x >= 0 ? '+' : '') + x.toFixed(2) },
  { k: 'hue', name: 'colour', min: 0, max: 360, step: 1, v: 28, f: (x) => Math.round(x) + '°' },
  { k: 'air', name: 'air', min: 0, max: 0.08, step: 0.001, v: 0.002, f: (x) => x.toFixed(3) },
];
const MAX = 2600;

export default {
  async mount(root, ctx) {
    const off = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    const link = document.createElement('link'); link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Unbounded:wght@700&family=Fragment+Mono&display=swap';
    const st = document.createElement('style'); st.textContent = CSS;
    document.head.append(link, st);
    const prevPos = root.style.position;
    if (getComputedStyle(root).position === 'static') root.style.position = 'relative';

    const law = {}; LAWS.forEach((l) => { law[l.k] = l.v; });
    const box = document.createElement('div'); box.className = 'pg';
    const cv = document.createElement('canvas'); cv.setAttribute('aria-label', 'Playground canvas: drag to pour matter, tap to place a well, or draw walls');
    const panel = document.createElement('div'); panel.className = 'pg-panel';
    const top = document.createElement('div'); top.className = 'pg-top';
    const h3 = document.createElement('h3'); h3.textContent = 'LAWS · editable';
    const tog = document.createElement('button'); tog.className = 'pg-tog'; tog.type = 'button'; tog.textContent = 'hide';
    top.append(h3, tog);
    const body = document.createElement('div'); body.className = 'pg-body';
    const inputs = {};
    for (const l of LAWS) {
      const row = document.createElement('label'); row.className = 'pg-law';
      const sp = document.createElement('span'); sp.textContent = l.name;
      const out = document.createElement('output'); out.textContent = l.f(l.v);
      const inp = document.createElement('input'); inp.type = 'range'; inp.min = l.min; inp.max = l.max; inp.step = l.step; inp.value = l.v; inp.setAttribute('aria-label', l.name);
      on(inp, 'input', () => { law[l.k] = Number(inp.value); out.textContent = l.f(law[l.k]); });
      inputs[l.k] = { inp, out, l };
      row.append(sp, out, inp); body.append(row);
    }
    let tool = 'matter';
    const tools = document.createElement('div'); tools.className = 'pg-tools';
    const toolBtns = {};
    for (const [k, label] of [['matter', 'pour'], ['well', 'well'], ['wall', 'wall']]) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.setAttribute('aria-pressed', String(k === tool));
      on(b, 'click', () => { tool = k; for (const kk in toolBtns) toolBtns[kk].setAttribute('aria-pressed', String(kk === k)); });
      toolBtns[k] = b; tools.append(b);
    }
    const acts = document.createElement('div'); acts.className = 'pg-acts';
    const mk = (label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; on(b, 'click', fn); acts.append(b); return b; };
    const hint = document.createElement('p'); hint.className = 'pg-hint';
    hint.textContent = 'pour: drag to spill matter, faster drag flings it · well: tap to place a pull (attraction < 0 repels) · wall: drag to build. Keys: 1 2 3 tools, R reset laws, C clear.';
    body.append(tools, acts, hint);
    panel.append(top, body);
    const hud = document.createElement('div'); hud.className = 'pg-hud';
    box.append(cv, panel, hud); root.append(box);
    on(tog, 'click', () => { const shut = panel.classList.toggle('shut'); tog.textContent = shut ? 'laws' : 'hide'; });

    // ---- simulation state (typed arrays)
    const px = new Float32Array(MAX), py = new Float32Array(MAX), vx = new Float32Array(MAX), vy = new Float32Array(MAX), hu = new Float32Array(MAX), age = new Float32Array(MAX);
    let n = 0, head = 0;
    let wells = [], walls = [];
    const g2 = cv.getContext('2d', { alpha: false });
    let W = 1, H = 1, dpr = 1;
    const resize = () => {
      const w = Math.max(1, root.clientWidth), hh = Math.max(1, root.clientHeight);
      dpr = Math.min(2, devicePixelRatio || 1); W = w; H = hh;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      g2.setTransform(dpr, 0, 0, dpr, 0, 0); g2.fillStyle = '#04060b'; g2.fillRect(0, 0, W, H);
      if (W < 520 && !panel.classList.contains('shut') && !panel.dataset.touched) { panel.classList.add('shut'); tog.textContent = 'laws'; }
    };
    on(tog, 'click', () => { panel.dataset.touched = '1'; });
    const ro = new ResizeObserver(resize); ro.observe(root); resize();
    const seed = () => { wells = [{ x: W * 0.36, y: H * 0.5, s: 1 }, { x: W * 0.68, y: H * 0.45, s: 1 }]; walls = []; };
    seed();

    const spawn = (x, y, svx, svy, hueOff) => {
      let i; if (n < MAX) i = n++; else { i = head; head = (head + 1) % MAX; }
      px[i] = x; py[i] = y; vx[i] = svx; vy[i] = svy; hu[i] = hueOff; age[i] = 0;
    };
    const resetLaws = () => { for (const k in inputs) { const { inp, out, l } = inputs[k]; inp.value = l.v; law[k] = l.v; out.textContent = l.f(l.v); } };
    const clear = () => { n = 0; head = 0; walls = []; wells = []; g2.fillStyle = '#04060b'; g2.fillRect(0, 0, W, H); };
    mk('reset laws', resetLaws);
    mk('clear', clear);
    mk('capture', () => {
      cv.toBlob((b) => { if (!b) return; const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'vvos-2126-laws.png'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); }, 'image/png');
    });

    // ---- input
    let drag = null, lastInput = -1e9;
    const local = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; };
    on(cv, 'pointerdown', (e) => {
      cv.setPointerCapture(e.pointerId); const p = local(e); lastInput = p.t;
      drag = { x0: p.x, y0: p.y, x: p.x, y: p.y, px: p.x, py: p.y, t: p.t, moved: 0 };
      if (tool === 'well') { wells.push({ x: p.x, y: p.y, s: 1 }); if (wells.length > 6) wells.shift(); drag = null; }
    });
    on(cv, 'pointermove', (e) => {
      if (!drag) return; const p = local(e); lastInput = p.t;
      drag.px = drag.x; drag.py = drag.y; drag.x = p.x; drag.y = p.y; drag.moved += Math.hypot(p.x - drag.px, p.y - drag.py);
      if (tool === 'matter') {
        const dvx = (drag.x - drag.px) * 0.35, dvy = (drag.y - drag.py) * 0.35;
        for (let k = 0; k < 8; k++) spawn(p.x + (Math.random() - 0.5) * 8, p.y + (Math.random() - 0.5) * 8, dvx + (Math.random() - 0.5) * 1.2, dvy + (Math.random() - 0.5) * 1.2, Math.random() * 50);
      }
    });
    const up = () => {
      if (!drag) return;
      if (tool === 'wall' && drag.moved > 12) { walls.push({ x1: drag.x0, y1: drag.y0, x2: drag.x, y2: drag.y }); if (walls.length > 14) walls.shift(); }
      if (tool === 'matter' && drag.moved < 4) for (let k = 0; k < 90; k++) { const a = Math.random() * 6.283, sp = Math.random() * 4; spawn(drag.x, drag.y, Math.cos(a) * sp, Math.sin(a) * sp, Math.random() * 60); }
      drag = null;
    };
    on(cv, 'pointerup', up); on(cv, 'pointercancel', up);
    on(window, 'keydown', (e) => {
      if (/INPUT|TEXTAREA/.test((e.target && e.target.tagName) || '') && e.target.type !== 'range') return;
      if (e.key === '1') toolBtns.matter.click(); else if (e.key === '2') toolBtns.well.click(); else if (e.key === '3') toolBtns.wall.click();
      else if (e.key === 'r' || e.key === 'R') resetLaws(); else if (e.key === 'c' || e.key === 'C') clear();
    });

    // ---- loop
    let raf = 0, last = performance.now(), T = 0, fpsA = 60;
    const BUCKETS = 10;
    const paths = Array.from({ length: BUCKETS }, () => null);
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const realDt = Math.min(0.05, (now - last) / 1000); last = now; fpsA += (1 / Math.max(realDt, 1e-3) - fpsA) * 0.05;
      const dt = realDt * 60 * law.time; T += realDt * law.time;
      // idle life: a comet circles and pours when nobody is playing
      if (!ctx.reduced && now - lastInput > 2500 && n < MAX - 10) {
        const cx = W / 2 + Math.cos(T * 0.6) * W * 0.3, cy = H / 2 + Math.sin(T * 0.9) * H * 0.28;
        const tvx = -Math.sin(T * 0.6) * 2.4, tvy = Math.cos(T * 0.9) * 2.2;
        for (let k = 0; k < 3; k++) spawn(cx, cy, tvx + (Math.random() - 0.5), tvy + (Math.random() - 0.5), (T * 20) % 80);
      }
      if (ctx.reduced && n === 0 && walls.length === 0) { for (let k = 0; k < 400; k++) { const a = Math.random() * 6.283, r = 40 + Math.random() * Math.min(W, H) * 0.35; spawn(W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r, 0, 0, Math.random() * 60); } }
      // integrate
      const G = law.g * 0.12, air = 1 - law.air, pull = law.pull * 60;
      for (let i = 0; i < n; i++) {
        if (age[i] > 1100) { const j = --n; px[i] = px[j]; py[i] = py[j]; vx[i] = vx[j]; vy[i] = vy[j]; hu[i] = hu[j]; age[i] = age[j]; i--; continue; }
        let ax = 0, ay = G;
        for (let w = 0; w < wells.length; w++) {
          const dx = wells[w].x - px[i], dy = wells[w].y - py[i], d2 = dx * dx + dy * dy + 400, inv = pull / (d2 * Math.sqrt(d2)) * 40;
          ax += dx * inv; ay += dy * inv;
        }
        vx[i] = (vx[i] + ax * dt) * Math.pow(air, dt); vy[i] = (vy[i] + ay * dt) * Math.pow(air, dt);
        let nx = px[i] + vx[i] * dt, ny = py[i] + vy[i] * dt;
        for (let w = 0; w < walls.length; w++) {
          const s = walls[w], ex = s.x2 - s.x1, ey = s.y2 - s.y1, len2 = ex * ex + ey * ey || 1;
          let t = ((nx - s.x1) * ex + (ny - s.y1) * ey) / len2; t = t < 0 ? 0 : t > 1 ? 1 : t;
          const cx = s.x1 + ex * t, cy = s.y1 + ey * t, dx = nx - cx, dy = ny - cy, d = Math.hypot(dx, dy);
          if (d < 3) {
            const nxn = d > 1e-4 ? dx / d : -ey / Math.sqrt(len2), nyn = d > 1e-4 ? dy / d : ex / Math.sqrt(len2);
            const dot = vx[i] * nxn + vy[i] * nyn;
            if (dot < 0) { vx[i] -= 1.7 * dot * nxn; vy[i] -= 1.7 * dot * nyn; }
            nx = cx + nxn * 3; ny = cy + nyn * 3;
          }
        }
        if (nx < 0) { nx = 0; vx[i] *= -0.7; } else if (nx > W) { nx = W; vx[i] *= -0.7; }
        if (ny < 0) { ny = 0; vy[i] *= -0.7; } else if (ny > H) { ny = H; vy[i] *= -0.6; vx[i] *= 0.98; }
        px[i] = nx; py[i] = ny; age[i] += dt;
      }
      // draw: light speed = how long light lingers
      g2.globalCompositeOperation = 'source-over';
      g2.fillStyle = `rgba(4,6,11,${(1 - law.light).toFixed(3)})`; g2.fillRect(0, 0, W, H);
      g2.globalCompositeOperation = 'lighter';
      for (let b = 0; b < BUCKETS; b++) paths[b] = new Path2D();
      for (let i = 0; i < n; i++) {
        const sp = Math.min(1, Math.hypot(vx[i], vy[i]) / 8);
        const b = Math.min(BUCKETS - 1, (sp * BUCKETS) | 0);
        paths[b].rect(px[i] - 1, py[i] - 1, 2, 2);
      }
      for (let b = 0; b < BUCKETS; b++) {
        const t = b / (BUCKETS - 1);
        g2.fillStyle = `hsla(${(law.hue + t * 36) % 360},${72 + 20 * t}%,${44 + 26 * t}%,0.6)`;
        g2.fill(paths[b]);
      }
      g2.globalCompositeOperation = 'source-over';
      for (const w of wells) {
        const r = 6 + 2 * Math.sin(now / 300);
        g2.strokeStyle = law.pull >= 0 ? 'rgba(255,210,160,.8)' : 'rgba(207,230,255,.8)'; g2.lineWidth = 1.2;
        g2.beginPath(); g2.arc(w.x, w.y, r, 0, 6.283); g2.stroke();
        g2.beginPath(); g2.arc(w.x, w.y, r + 10 + 4 * Math.sin(now / 500), 0, 6.283); g2.globalAlpha = 0.3; g2.stroke(); g2.globalAlpha = 1;
      }
      g2.strokeStyle = 'rgba(207,230,255,.85)'; g2.lineWidth = 2; g2.lineCap = 'round';
      for (const s of walls) { g2.beginPath(); g2.moveTo(s.x1, s.y1); g2.lineTo(s.x2, s.y2); g2.stroke(); }
      if (drag && tool === 'wall') { g2.setLineDash([4, 6]); g2.beginPath(); g2.moveTo(drag.x0, drag.y0); g2.lineTo(drag.x, drag.y); g2.stroke(); g2.setLineDash([]); }
      if ((now | 0) % 6 === 0) hud.replaceChildren(...['matter ', String(n), ' · wells ', String(wells.length), ' · walls ', String(walls.length), ' · ', String(Math.round(fpsA)), ' fps'].map((s, i) => { if (i % 2) { const b = document.createElement('b'); b.textContent = s; return b; } return document.createTextNode(s); }));
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      while (off.length) { try { off.pop()(); } catch (e) { /* continue */ } }
      box.remove(); st.remove(); link.remove(); root.replaceChildren();
      root.style.position = prevPos;
    };
  },
};
