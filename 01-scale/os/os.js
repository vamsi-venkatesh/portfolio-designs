// VV·OS 2126 — the machine. Boot, wallpaper, windows, dock, search, worlds, routing, sound.
import { content, root, resolve, walk, addVisitorFile } from './fs.js';
import * as G from './glyphs.js';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH = matchMedia('(pointer: coarse)').matches;
const PHONE = () => innerWidth <= 760;
const HEX = '0123456789abcdef';

const APPS = {
  files: { title: 'Files', w: 900, h: 560, glyph: 'files', load: () => import('./apps/files.js') },
  reader: { title: 'Reader', w: 640, h: 600, glyph: 'files', load: () => import('./apps/reader.js') },
  browser: { title: 'Browser', w: 1040, h: 660, glyph: 'browser', load: () => import('./apps/browser.js') },
  terminal: { title: 'Terminal', w: 720, h: 460, glyph: 'terminal', load: () => import('./apps/terminal.js') },
  playground: { title: 'Playground', w: 880, h: 600, glyph: 'playground', load: () => import('./apps/playground.js') },
  signal: { title: 'Signal', w: 520, h: 600, glyph: 'signal', load: () => import('./apps/signal.js') },
  viewer: { title: 'Viewer', w: 820, h: 600, glyph: 'files', load: () => import('./apps/viewer.js') },
  camera: { title: 'Camera', w: 760, h: 560, glyph: 'camera', load: () => import('./apps/camera.js') },
  github: { title: 'GitHub', w: 640, h: 640, glyph: 'github', load: () => import('./apps/github.js') },
};
const DOCK = ['files', 'browser', 'terminal', 'playground', 'signal'];

export async function bootOS({ fast = false, sound = false } = {}) {
  if (window.__os) return window.__os;
  const os = el('div'); os.id = 'os'; document.body.appendChild(os);
  const T0 = performance.now();

  /* ================================================================ sound */
  const snd = { on: sound, ctx: null, g: null };
  function sInit() { if (snd.ctx) return; try { snd.ctx = new AudioContext(); snd.g = snd.ctx.createGain(); snd.g.gain.value = 0.06; snd.g.connect(snd.ctx.destination); } catch (e) { snd.ctx = null; } }
  function play(kind) {
    if (!snd.on) return; sInit(); if (!snd.ctx) return;
    const c = snd.ctx, t = c.currentTime;
    const tone = (f0, f1, d, type = 'sine', v = 1, at = 0) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t + at); o.frequency.exponentialRampToValueAtTime(f1, t + at + d); g.gain.setValueAtTime(0, t + at); g.gain.linearRampToValueAtTime(v, t + at + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + at + d); o.connect(g); g.connect(snd.g); o.start(t + at); o.stop(t + at + d + 0.02); };
    if (kind === 'open') { tone(520, 700, 0.18, 'sine', 0.7); tone(780, 1040, 0.22, 'sine', 0.45, 0.06); }
    else if (kind === 'close') tone(700, 380, 0.2, 'sine', 0.55);
    else if (kind === 'tick') tone(1800, 1400, 0.03, 'triangle', 0.25);
    else if (kind === 'world') { tone(160, 90, 1.1, 'sine', 0.9); tone(640, 1280, 0.7, 'sine', 0.25, 0.1); }
    else if (kind === 'boot') { tone(90, 180, 1.6, 'sine', 0.8); tone(360, 720, 1.2, 'triangle', 0.15, 0.4); }
    else if (kind === 'key') tone(2400 + Math.random() * 600, 1800, 0.02, 'square', 0.04);
  }

  /* ================================================================ wallpaper (raw WebGL2) */
  const wall = el('canvas'); wall.id = 'wall'; wall.setAttribute('aria-hidden', 'true'); os.appendChild(wall);
  const rain = el('canvas'); rain.id = 'rain'; rain.setAttribute('aria-hidden', 'true'); os.appendChild(rain);
  const W = { gl: wall.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' }), mx: innerWidth * 0.5, my: innerHeight * 0.4, sx: 0, sy: 0, pulse: [0, 0, -99], boot: fast ? 0 : 0.35, paused: false, scale: TOUCH ? 0.5 : 0.62 };
  if (W.gl) {
    const gl = W.gl;
    const vs = `#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
    const fs = `#version 300 es
precision highp float;uniform vec2 R;uniform float T,B;uniform vec2 M;uniform vec3 P;out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*R)/R.y; vec2 m=(M-.5*R)/R.y; float t=T;
  vec3 col=vec3(.010,.016,.030);
  float hz=-.16;
  // the machine's sky: light filaments drifting, bent by the cursor
  vec2 d=p-m; float lens=exp(-dot(d,d)*7.);
  vec2 q=p*1.45+d*lens*.18; q+=.28*vec2(fbm(q*1.2+t*.025),fbm(q*1.2-t*.02+5.3));
  float f=fbm(q*2.1+vec2(t*.018,-t*.01));
  float r=pow(1.-abs(f*2.-1.),16.);
  float r2=pow(1.-abs(fbm(q*3.7-t*.015+9.)*2.-1.),16.);
  vec3 tint=mix(vec3(.42,.64,1.),vec3(1.,.74,.47),smoothstep(.35,.75,fbm(q*.6+2.)));
  float sky=smoothstep(hz-.01,hz+.35,p.y);
  col+=tint*(r*.5+r2*.4)*(.38+1.4*lens)*sky;
  col+=vec3(.05,.08,.16)*fbm(p*2.+t*.01)*sky;
  // horizon: a long warm line of light, Magdeburg's river under the glass
  float hy=abs(p.y-hz);
  col+=vec3(1.,.72,.44)*exp(-hy*90.)*.55+vec3(.4,.6,1.)*exp(-hy*9.)*.10;
  // floor: a perspective grid of data lanes with pulses running home
  if(p.y<hz){
    float z=hz-p.y; vec2 g=vec2(p.x/z*.55,1./z*.9); g.y+=t*.35;
    vec2 gw=fwidth(g); vec2 a=abs(fract(g)-.5)/max(gw,1e-4);
    float ln=1.-min(min(a.x,a.y),1.);
    float lane=floor(g.x); float run=fract(g.y*.09-t*.12+h(vec2(lane,3.)));
    float pulse=smoothstep(.97,1.,run)*(1.-min(a.x,1.));
    float fade=smoothstep(0.,.06,z)*exp(-z*1.6);
    col+=vec3(.36,.56,.95)*ln*.30*fade+vec3(1.,.78,.5)*pulse*1.4*fade;
    col+=vec3(.2,.32,.6)*lens*.14*fade;
  }
  // a ring when something opens
  float pr=t-P.z; vec2 pp=(P.xy-.5*R)/R.y;
  if(pr>0.&&pr<2.){ float rr=length(p-pp); col+=vec3(1.,.82,.6)*exp(-pow((rr-pr*.75)*26.,2.))*exp(-pr*2.2)*.9; }
  // vignette + grain + boot light
  vec2 uv=gl_FragCoord.xy/R; col*=.55+.45*pow(16.*uv.x*uv.y*(1.-uv.x)*(1.-uv.y),.22);
  col+=(h(gl_FragCoord.xy+fract(t)*91.)-.5)*.018;
  col=mix(col,vec3(1.,.95,.88),B);
  o=vec4(pow(max(col,0.),vec3(.92)),1.);
}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(pr)); W.gl = null; }
    else {
      gl.useProgram(pr);
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      W.u = { R: gl.getUniformLocation(pr, 'R'), T: gl.getUniformLocation(pr, 'T'), B: gl.getUniformLocation(pr, 'B'), M: gl.getUniformLocation(pr, 'M'), P: gl.getUniformLocation(pr, 'P') };
    }
  }
  function sizeWall() { const s = W.scale * Math.min(devicePixelRatio, 2); wall.width = Math.round(innerWidth * s); wall.height = Math.round(innerHeight * s); W.s = s; rain.width = innerWidth; rain.height = innerHeight; }
  sizeWall(); addEventListener('resize', sizeWall);
  const tNow = () => (performance.now() - T0) / 1000;
  function pulseAt(x, y) { W.pulse = [x * W.s, (innerHeight - y) * W.s, tNow()]; }
  addEventListener('pointermove', (e) => { W.mx = e.clientX; W.my = e.clientY; }, { passive: true });

  // the code rain (terminal: `matrix`)
  const R = { on: false, until: 0, cols: [] };
  function matrix(sec = 8) { R.on = true; R.until = tNow() + sec; rain.classList.add('on'); R.cols = Array.from({ length: Math.ceil(innerWidth / 14) }, () => Math.random() * -60); }
  function drawRain() {
    const c = rain.getContext('2d'); c.fillStyle = 'rgba(4,6,11,.12)'; c.fillRect(0, 0, rain.width, rain.height);
    c.font = '300 12px "Martian Mono", monospace';
    const src = 'VAMSIVENKATESH·2126·MAGDEBURG·52.13N·11.63E·' + content.work.map((w) => w.name.toUpperCase()).join('·');
    R.cols.forEach((y, i) => { const ch = src[(i * 7 + Math.floor(y)) % src.length]; c.fillStyle = Math.random() < 0.04 ? '#ffd2a0' : '#9fd0ff'; c.fillText(ch, i * 14, y * 16); R.cols[i] = y > rain.height / 16 + Math.random() * 30 ? 0 : y + 0.6; });
    if (tNow() > R.until) { R.on = false; rain.classList.remove('on'); setTimeout(() => rain.getContext('2d').clearRect(0, 0, rain.width, rain.height), 900); }
  }

  /* ================================================================ top bar */
  const bar = el('header'); bar.id = 'bar';
  const mk = el('div', 'mark'); mk.appendChild(G.mark()); const mt = el('span', null, 'VV·OS '); const yr = el('b', null, '2126'); mt.appendChild(yr); mk.appendChild(mt);
  const active = el('span', 'active', ''); const sp = el('span', 'sp');
  const loc = el('span', 'chip hide-s'); const li = el('i'); loc.append(li, document.createTextNode('machine · Magdeburg 52.13°N 11.63°E'));
  const fpsChip = el('span', 'chip hide-s', '— fps');
  const findB = el('button', 'chip', TOUCH ? 'search' : 'search  ⌘K'); findB.setAttribute('aria-label', 'Search this machine');
  const sndB = el('button', 'chip snd'); sndB.setAttribute('aria-label', 'Sound'); sndB.setAttribute('aria-pressed', String(snd.on));
  const sb = el('b'); sb.append(el('i'), el('i'), el('i')); const st = el('span', 'hide-s', snd.on ? 'sound on' : 'sound off'); sndB.append(sb, st);
  const clock = el('span', 'chip clock');
  bar.append(mk, active, sp, loc, fpsChip, findB, sndB, clock); os.appendChild(bar);
  sndB.addEventListener('click', () => { snd.on = !snd.on; sndB.setAttribute('aria-pressed', String(snd.on)); st.textContent = snd.on ? 'sound on' : 'sound off'; if (snd.on) { sInit(); snd.ctx && snd.ctx.resume(); play('tick'); } });
  const fmtClock = () => { const d = new Date(); clock.textContent = '2126 · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  fmtClock(); setInterval(fmtClock, 15000);

  /* ================================================================ desktop icons */
  const desk = el('nav'); desk.id = 'desk'; desk.setAttribute('aria-label', 'Desktop');
  const dn = (p) => resolve(p);
  const DESK = [
    { node: dn('~/work'), label: 'Projects' }, { node: dn('~/skills'), label: 'Skills' }, { node: dn('~/about'), label: 'About me' },
    { node: dn('~/how-i-work'), label: 'How I work' }, { node: dn('~/withdrawn'), label: 'Claims I withdrew' },
    { node: dn('~/you'), label: 'Your files' }, { node: dn('~/vault'), label: 'Vault' },
    { node: dn('~/apps/terminal'), label: 'Terminal' }, { node: dn('~/apps/lens'), label: 'Browser' }, { node: dn('~/apps/camera'), label: 'Camera' }, { node: dn('~/apps/github'), label: 'GitHub' }, { node: dn('~/apps/playground'), label: 'Playground' }, { node: dn('~/apps/signal'), label: 'Signal' },
  ];
  DESK.forEach((d, i) => {
    const b = el('button', 'ico'); b.style.transitionDelay = (fast ? 0 : 120 + i * 45) + 'ms';
    const g = el('span', 'g'); g.appendChild(G.glyphFor(d.node)); const l = el('span', 'l', d.label);
    b.append(g, l); b.setAttribute('aria-label', 'Open ' + d.label);
    b.addEventListener('pointerenter', () => scramble(l, d.label));
    b.addEventListener('click', (e) => { openNode(d.node, b); });
    desk.appendChild(b);
  });
  os.appendChild(desk);

  /* ================================================================ widgets */
  const wid = el('aside'); wid.id = 'widgets';
  const mon = el('section', 'wdg mon'); const mh = el('h4'); mh.append(document.createTextNode('this machine'), el('span', null, 'live'));
  const dl = el('dl'); const M = {};
  for (const [k, lab] of [['fps', 'frame rate'], ['ms', 'frame time'], ['mem', 'memory'], ['req', 'requests'], ['up', 'uptime'], ['win', 'windows'], ['tz', 'your clock']]) { const dt = el('dt', null, lab); const dd = el('dd', null, '—'); dl.append(dt, dd); M[k] = dd; }
  const spark = el('canvas'); mon.append(mh, dl, spark);
  const own = el('section', 'wdg'); const oh = el('h4'); oh.append(document.createTextNode('owner'), el('span', null, content.person.availability.split('·')[0].trim().toLowerCase()));
  const who = el('div', 'who', content.person.name); who.appendChild(el('em', null, content.person.role + ' · ' + content.person.city.split(',')[0]));
  const orow = el('div', 'row'); const b1 = el('button', 'btn warm', 'send a signal'); const b2 = el('button', 'btn', 'about');
  b1.addEventListener('click', () => openApp('signal', null, b1)); b2.addEventListener('click', () => openNode(dn('~/about/vamsi.txt'), b2));
  orow.append(b1, b2); own.append(oh, who, orow);
  wid.append(mon, own); os.appendChild(wid);

  const whisper = el('div'); whisper.id = 'whisper'; whisper.textContent = 'This machine is open. Touch anything.';
  whisper.appendChild(el('small', null, TOUCH ? 'tap a folder · search finds everything' : '/ search · ` terminal · drag the windows')); os.appendChild(whisper);

  /* ================================================================ dock */
  const dock = el('nav'); dock.id = 'dock'; dock.setAttribute('aria-label', 'Dock');
  const dockBtn = {};
  DOCK.forEach((name, i) => {
    if (i === 3) dock.appendChild(el('i', 'sep'));
    const b = el('button', 'dk'); b.appendChild(G.app(APPS[name].glyph)); const tip = el('span', 'tip', APPS[name].title); b.appendChild(tip); b.setAttribute('aria-label', APPS[name].title);
    b.addEventListener('click', () => dockClick(name, b)); dock.appendChild(b); dockBtn[name] = b;
  });
  dock.appendChild(el('i', 'sep'));
  const sB = el('button', 'dk'); sB.appendChild(G.app('search')); sB.appendChild(el('span', 'tip', 'Search')); sB.setAttribute('aria-label', 'Search'); sB.addEventListener('click', () => palette(true)); dock.appendChild(sB);
  os.appendChild(dock);

  /* ================================================================ windows */
  const layer = el('div'); layer.id = 'wins'; os.appendChild(layer);
  const wins = new Map(); let zTop = 10, cascade = 0;
  function focusWin(w) {
    if (!w) return; for (const o of wins.values()) o.el.classList.remove('focus');
    w.el.style.zIndex = String(++zTop); w.el.classList.add('focus'); active.textContent = w.title; W.focus = w;
  }
  function topWin() { let best = null; for (const w of wins.values()) if (!w.min && (!best || +w.el.style.zIndex > +best.el.style.zIndex)) best = w; return best; }
  function setRunning() { for (const n of DOCK) dockBtn[n].classList.toggle('run', [...wins.values()].some((w) => w.app === n)); }

  async function openApp(name, arg, origin) {
    const def = APPS[name]; if (!def) return null;
    const key = name === 'reader' || name === 'viewer' ? name + ':' + (arg && arg.path) : name;
    if (wins.has(key)) { const w = wins.get(key); if (w.min) restore(w); focusWin(w); if (w.inst.onArg && arg) w.inst.onArg(arg); return w; }
    gestureSound(); play('open');
    const w = { key, app: name, title: def.title, min: false };
    const win = el('section', 'win enter'); win.setAttribute('role', 'dialog'); win.setAttribute('aria-label', def.title);
    const hb = el('header', 'wbar'); const dots = el('span', 'wdots');
    const bx = el('button', 'x'); bx.setAttribute('aria-label', 'Close'); const bm = el('button', 'm'); bm.setAttribute('aria-label', 'Minimise'); const bf = el('button', 'f'); bf.setAttribute('aria-label', 'Maximise');
    dots.append(bx, bm, bf); const tt = el('h3', 'wtitle', def.title); const pth = el('span', 'wpath', '');
    hb.append(dots, tt, pth); const body = el('div', 'wbody'); const grip = el('i', 'wgrip');
    win.append(hb, body, grip); layer.appendChild(win);
    // geometry: cascade inside the free area
    const vw = innerWidth, vh = innerHeight;
    const ww = Math.min(def.w, vw - 60), wh = Math.min(def.h, vh - 150);
    const x0 = clamp(vw / 2 - ww / 2 + (cascade % 5 - 2) * 34, 12, vw - ww - 12), y0 = clamp(56 + (vh - 150 - wh) / 2 + (cascade % 5 - 2) * 26, 40, vh - wh - 96);
    cascade++;
    Object.assign(win.style, { left: x0 + 'px', top: y0 + 'px', width: ww + 'px', height: wh + 'px' });
    // fly from the thing you touched
    if (origin && origin.getBoundingClientRect && !PHONE()) {
      const r = origin.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      win.style.setProperty('--from', `translate(${cx - (x0 + ww / 2)}px, ${cy - (y0 + wh / 2)}px) scale(.18)`);
      traceLine(cx, cy, x0 + ww / 2, y0 + 19); pulseAt(cx, cy);
    }
    setTimeout(() => win.classList.remove('enter'), 600);
    Object.assign(w, { el: win, body, tt, pth });
    wins.set(key, w); focusWin(w); setRunning();
    win.addEventListener('pointerdown', () => focusWin(w));
    bx.addEventListener('click', (e) => { e.stopPropagation(); closeWin(w); });
    bm.addEventListener('click', (e) => { e.stopPropagation(); minimise(w); });
    bf.addEventListener('click', (e) => { e.stopPropagation(); win.classList.toggle('max'); });
    hb.addEventListener('dblclick', (e) => { if (e.target.closest('button')) return; win.classList.toggle('max'); });
    dragify(w, hb, grip);
    const api = appApi(w);
    try {
      const mod = await def.load();
      let inst = await mod.default.mount(body, api, arg);
      if (typeof inst === 'function') inst = { unmount: inst };
      w.inst = inst || { unmount() {} };
      if (w.inst.title) setTitle(w, w.inst.title);
    } catch (err) {
      console.error(err); w.inst = { unmount() {} };
      const m = el('div', 'reader'); m.append(el('p', 'k', 'not ready'), el('h2', null, def.title + ' is still being built.')); body.appendChild(m);
    }
    route.replace(name === 'reader' || name === 'viewer' ? null : '#/app/' + name);
    return w;
  }
  function setTitle(w, t, path) { w.title = t; w.tt.textContent = t; w.el.setAttribute('aria-label', t); if (path != null) w.pth.textContent = path; if (W.focus === w) active.textContent = t; }
  function closeWin(w) {
    if (!wins.has(w.key)) return; play('close');
    try { w.inst && w.inst.unmount && w.inst.unmount(); } catch (e) { console.error(e); }
    wins.delete(w.key); w.el.classList.add('leave'); setTimeout(() => w.el.remove(), 300); setRunning();
    const t = topWin(); if (t) focusWin(t); else { active.textContent = ''; W.focus = null; route.replace('#/'); }
  }
  function minimise(w) { w.min = true; w.el.classList.add('min'); setTimeout(() => { if (w.min) w.el.style.display = 'none'; }, 300); const t = topWin(); if (t) focusWin(t); else active.textContent = ''; }
  function restore(w) { w.min = false; w.el.style.display = ''; w.el.classList.remove('min'); w.el.classList.add('enter'); setTimeout(() => w.el.classList.remove('enter'), 600); focusWin(w); }
  function dockClick(name, b) {
    const w = wins.get(name);
    if (!w) return openApp(name, null, b);
    if (w.min) return restore(w);
    if (W.focus === w) return minimise(w);
    focusWin(w);
  }
  function dragify(w, handle, grip) {
    let d = null;
    handle.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || PHONE() || w.el.classList.contains('max')) return;
      d = { x: e.clientX, y: e.clientY, l: w.el.offsetLeft, t: w.el.offsetTop, mode: 'move' }; handle.setPointerCapture(e.pointerId);
    });
    grip.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (PHONE()) return; d = { x: e.clientX, y: e.clientY, w: w.el.offsetWidth, h: w.el.offsetHeight, mode: 'size' }; grip.setPointerCapture(e.pointerId); focusWin(w); });
    const mv = (e) => {
      if (!d) return;
      if (d.mode === 'move') { w.el.style.left = clamp(d.l + e.clientX - d.x, -w.el.offsetWidth + 120, innerWidth - 120) + 'px'; w.el.style.top = clamp(d.t + e.clientY - d.y, 34, innerHeight - 60) + 'px'; }
      else { w.el.style.width = Math.max(300, d.w + e.clientX - d.x) + 'px'; w.el.style.height = Math.max(200, d.h + e.clientY - d.y) + 'px'; }
    };
    const upd = () => { d = null; };
    handle.addEventListener('pointermove', mv); grip.addEventListener('pointermove', mv);
    handle.addEventListener('pointerup', upd); grip.addEventListener('pointerup', upd); handle.addEventListener('pointercancel', upd); grip.addEventListener('pointercancel', upd);
  }
  function traceLine(x0, y0, x1, y1) {
    if (REDUCED) return; const t = el('i', 'trace'); const dx = x1 - x0, dy = y1 - y0;
    Object.assign(t.style, { left: x0 + 'px', top: y0 + 'px', width: Math.hypot(dx, dy) + 'px', transform: `rotate(${Math.atan2(dy, dx)}rad)` });
    os.appendChild(t); setTimeout(() => t.remove(), 700);
  }
  function scramble(node, final, ms = 420) {
    if (REDUCED || node.dataset.scr) return; node.dataset.scr = '1'; node.classList.add('scr');
    const start = performance.now();
    const step = () => {
      const u = (performance.now() - start) / ms; const n = Math.floor(u * final.length);
      node.textContent = final.slice(0, n) + Array.from(final.slice(n), (c) => c === ' ' ? ' ' : HEX[(Math.random() * 16) | 0]).join('');
      if (u < 1) requestAnimationFrame(step); else { node.textContent = final; node.classList.remove('scr'); delete node.dataset.scr; }
    };
    step();
  }
  function gestureSound() { if (snd.on) { sInit(); snd.ctx && snd.ctx.state === 'suspended' && snd.ctx.resume(); } }

  /* ================================================================ nodes, urls, worlds */
  function openNode(node, origin) {
    if (!node) return;
    if (node.type === 'dir') return openApp('files', { path: node.path }, origin);
    if (node.type === 'world') return openWorld(node.slug, origin);
    if (node.type === 'doc') return openApp('reader', node, origin);
    if (node.type === 'app') return openApp(node.app, null, origin);
    if (node.type === 'file') return openApp('viewer', node, origin);
    if (node.type === 'enc') { const t = openApp('terminal', null, origin); return t; }
  }
  function openUrl(url, title) { return openApp('browser', { url, title }); }

  const worldLayer = el('div'); worldLayer.id = 'world'; document.body.appendChild(worldLayer);
  const WS = { slug: null, unmount: null, pushed: false, token: 0 };
  function openWorld(slug, origin) {
    if (origin && origin.getBoundingClientRect) { const r = origin.getBoundingClientRect(); os.style.transformOrigin = (r.left + r.width / 2) + 'px ' + (r.top + r.height / 2) + 'px'; pulseAt(r.left + r.width / 2, r.top + r.height / 2); }
    WS.pushed = true; location.hash = '#/world/' + slug;
  }
  async function showWorld(slug) {
    const i = content.work.findIndex((w) => w.slug === slug); if (i < 0) return route.replace('#/');
    if (WS.slug === slug) return;
    const tok = ++WS.token;
    if (WS.unmount) { try { WS.unmount(); } catch (e) { console.error(e); } WS.unmount = null; }
    worldLayer.replaceChildren(); WS.slug = slug;
    gestureSound(); play('world'); palette(false);
    os.classList.add('diving'); W.paused = true;
    worldLayer.classList.remove('on'); void worldLayer.offsetWidth; worldLayer.classList.add('on');
    const ctx = {
      ...content, reduced: REDUCED, isTouch: TOUCH,
      item: content.work[i], caseStudy: content.cases[slug] || null, index: i, total: content.work.length,
      openUrl: (u, t) => { closeWorld(); setTimeout(() => openUrl(u, t), 450); },
      openApp: (n, a) => { closeWorld(); setTimeout(() => openApp(n, a), 450); },
      close: () => closeWorld(),
      next: () => location.replace('#/world/' + content.work[(i + 1) % content.work.length].slug),
      prev: () => location.replace('#/world/' + content.work[(i - 1 + content.work.length) % content.work.length].slug),
    };
    try {
      const mod = await import(`./worlds/${slug}.js`);
      if (tok !== WS.token) return;
      const u = await mod.default.mount(worldLayer, ctx);
      if (tok !== WS.token) { u && u(); return; }
      WS.unmount = u;
    } catch (err) {
      console.error(err);
      const f = el('div', 'blocked'); const d = el('div'); d.append(el('h3', null, content.work[i].name), el('p', null, 'This world is still being built.'));
      const bk = el('button', 'btn', 'back to the desktop'); bk.addEventListener('click', () => closeWorld()); d.appendChild(bk); f.appendChild(d); worldLayer.appendChild(f);
    }
  }
  function closeWorld() {
    if (!WS.slug) return;
    if (WS.pushed) { WS.pushed = false; history.back(); } else { route.replace('#/'); hideWorld(); }
  }
  function hideWorld() {
    if (!WS.slug) return; WS.token++;
    if (WS.unmount) { try { WS.unmount(); } catch (e) { console.error(e); } WS.unmount = null; }
    WS.slug = null; worldLayer.classList.remove('on'); worldLayer.replaceChildren();
    os.classList.remove('diving'); W.paused = false; play('close');
  }

  /* ================================================================ routing */
  const route = {
    replace(h) { if (h == null) return; if (location.hash !== h) history.replaceState(null, '', h); },
    async go() {
      const h = location.hash;
      const m = h.match(/^#\/world\/([a-z0-9-]+)/); if (m) return showWorld(m[1]);
      hideWorld();
      const a = h.match(/^#\/app\/([a-z]+)/); if (a && APPS[a[1]] && !wins.has(a[1])) openApp(a[1]);
    },
  };
  addEventListener('hashchange', () => route.go());

  /* ================================================================ palette */
  const pal = el('div'); pal.id = 'pal'; const box = el('div', 'box'); const inp = el('input'); inp.placeholder = 'Search this machine · projects, skills, files, commands'; inp.setAttribute('aria-label', 'Search this machine');
  const ul = el('ul'); ul.setAttribute('role', 'listbox'); const ft = el('div', 'ft', '↑ ↓ choose · enter open · esc close'); box.append(inp, ul, ft); pal.appendChild(box); os.appendChild(pal);
  const ITEMS = [];
  walk((n) => {
    if (n === root || n.name === 'apps') return;
    const kind = n.type === 'world' ? 'world · ' + n.item.kind : n.type === 'dir' ? 'folder · ' + n.path : n.type === 'doc' ? (n.name.endsWith('.skill') ? 'skill · ' + n.doc.kicker : n.path) : 'app';
    ITEMS.push({ label: n.title || n.name, kind, node: n, hay: ((n.title || '') + ' ' + n.name + ' ' + kind + ' ' + (n.item ? n.item.line : '') + ' ' + (n.doc ? (n.doc.uses || []).join(' ') : '')).toLowerCase() });
  });
  for (const [label, kind, fn] of [['Open a terminal', 'command · `', () => openApp('terminal')], ['Send a signal to Vamsi', 'command · contact', () => openApp('signal')], ['Toggle sound', 'command', () => sndB.click()], ['Rain the code', 'command · matrix', () => matrix(8)], ['Close every window', 'command', () => [...wins.values()].forEach(closeWin)]])
    ITEMS.push({ label, kind, fn, hay: (label + ' ' + kind).toLowerCase() });
  let sel = 0, shown = [];
  function renderPal() {
    const q = inp.value.trim().toLowerCase(); const toks = q.split(/\s+/).filter(Boolean);
    shown = (toks.length ? ITEMS.filter((it) => toks.every((t) => it.hay.includes(t))) : ITEMS.filter((it) => it.node && (it.node.type === 'world' || it.node.type === 'dir') || it.fn)).slice(0, 40);
    sel = clamp(sel, 0, Math.max(0, shown.length - 1)); ul.replaceChildren();
    shown.forEach((it, i) => {
      const li = el('li'); li.setAttribute('role', 'option'); if (i === sel) { li.classList.add('on'); li.setAttribute('aria-selected', 'true'); }
      li.appendChild(it.node ? G.glyphFor(it.node) : G.app('terminal')); li.append(el('b', null, it.label), el('span', null, it.kind));
      li.addEventListener('click', () => runItem(it)); li.addEventListener('pointerenter', () => { sel = i; [...ul.children].forEach((c, j) => c.classList.toggle('on', j === i)); });
      ul.appendChild(li);
    });
    if (!shown.length) ul.appendChild(el('li', null, 'Nothing here by that name. Try “conxto”, “eval”, “hash”.'));
  }
  function runItem(it) { palette(false); if (it.fn) it.fn(); else openNode(it.node); }
  function palette(on) { if (on === pal.classList.contains('on')) return; pal.classList.toggle('on', on); if (on) { inp.value = ''; sel = 0; renderPal(); setTimeout(() => inp.focus(), 30); play('tick'); } }
  inp.addEventListener('input', () => { sel = 0; renderPal(); });
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, shown.length - 1); renderPal(); e.preventDefault(); ul.children[sel] && ul.children[sel].scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); renderPal(); e.preventDefault(); ul.children[sel] && ul.children[sel].scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'Enter' && shown[sel]) runItem(shown[sel]);
    else if (e.key === 'Escape') palette(false);
  });
  pal.addEventListener('pointerdown', (e) => { if (e.target === pal) palette(false); });
  findB.addEventListener('click', () => palette(true));
  addEventListener('keydown', (e) => {
    if (WS.slug) return;
    const typing = /INPUT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette(!pal.classList.contains('on')); return; }
    if (typing) return;
    if (e.key === '/') { e.preventDefault(); palette(true); }
    else if (e.key === '`') { e.preventDefault(); const w = wins.get('terminal'); w && W.focus === w ? closeWin(w) : openApp('terminal'); }
    else if (e.key === 'Escape') palette(false);
  });

  /* ================================================================ your files: drop anything onto the machine */
  const dropHint = el('div'); dropHint.id = 'drop'; dropHint.textContent = 'Drop it in. It stays in your browser.'; os.appendChild(dropHint);
  let dragN = 0;
  addEventListener('dragenter', (e) => { if (WS.slug || !e.dataTransfer || ![...e.dataTransfer.types].includes('Files')) return; dragN++; dropHint.classList.add('on'); });
  addEventListener('dragleave', () => { dragN = Math.max(0, dragN - 1); if (!dragN) dropHint.classList.remove('on'); });
  addEventListener('dragover', (e) => { if (!WS.slug && e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
  addEventListener('drop', (e) => {
    dragN = 0; dropHint.classList.remove('on'); if (WS.slug || !e.dataTransfer || !e.dataTransfer.files.length) return; e.preventDefault();
    const nodes = [...e.dataTransfer.files].slice(0, 20).map(addVisitorFile); pulseAt(e.clientX, e.clientY);
    const fw = wins.get('files'); if (fw) { fw.inst.onArg({ path: '~/you' }); focusWin(fw); } else openApp('files', { path: '~/you' });
    if (nodes.length === 1) setTimeout(() => openNode(nodes[0]), 300);
  });
  function bringFiles(list) { const nodes = [...list].slice(0, 20).map(addVisitorFile); const fw = wins.get('files'); if (fw) fw.inst.onArg({ path: '~/you' }); if (nodes.length === 1) openNode(nodes[0]); return nodes; }

  /* ================================================================ app api */
  function appApi(w) {
    return {
      content, root, resolve, reduced: REDUCED, isTouch: TOUCH,
      openNode, openApp, openWorld, openUrl, matrix, palette: () => palette(true),
      setTitle: (t, p) => setTitle(w, t, p), close: () => closeWin(w), play,
      wins: () => [...wins.values()].map((x) => ({ app: x.app, title: x.title, min: x.min })), uptime: tNow,
      bringFiles, xray: (on) => xray(on),
      closeApp: (name) => { const x = wins.get(name); if (x) { closeWin(x); return true; } return false; },
    };
  }

  /* ================================================================ x-ray: see through the machine (terminal: xray) */
  const xtip = el('div'); xtip.id = 'xtip'; os.appendChild(xtip); let xon = false;
  function xmove(e) { const t = e.target; if (!(t instanceof Element) || t === xtip) return; const r = t.getBoundingClientRect(); xtip.textContent = t.tagName.toLowerCase() + (t.id ? '#' + t.id : '') + (typeof t.className === 'string' && t.className ? '.' + t.className.trim().split(/\s+/).join('.') : '') + '  ' + Math.round(r.width) + '×' + Math.round(r.height); xtip.style.left = Math.min(e.clientX + 14, innerWidth - 260) + 'px'; xtip.style.top = e.clientY + 16 + 'px'; }
  function xray(on) { xon = on == null ? !xon : on; os.classList.toggle('xray', xon); if (xon) addEventListener('pointermove', xmove); else removeEventListener('pointermove', xmove); return { on: xon, count: os.querySelectorAll('*').length }; }

  /* ================================================================ loop: wallpaper + monitor */
  const frames = []; let last = performance.now(), acc = 0, cnt = 0;
  const sctx = spark.getContext('2d');
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = now - last; last = now; frames.push(dt); if (frames.length > 90) frames.shift();
    acc += dt; cnt++;
    if (acc > 500) {
      const fps = Math.round(cnt * 1000 / acc); acc = 0; cnt = 0;
      fpsChip.textContent = fps + ' fps'; M.fps.textContent = fps + ' fps';
      M.ms.textContent = (frames.reduce((a, b) => a + b, 0) / frames.length).toFixed(1) + ' ms';
      M.mem.textContent = performance.memory ? (performance.memory.usedJSHeapSize / 1048576).toFixed(1) + ' MB' : 'not exposed';
      M.req.textContent = String(performance.getEntriesByType('resource').length);
      const up = tNow(); M.up.textContent = Math.floor(up / 60) + 'm ' + String(Math.floor(up % 60)).padStart(2, '0') + 's';
      M.win.textContent = String(wins.size + (WS.slug ? 1 : 0));
      M.tz.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + (Intl.DateTimeFormat().resolvedOptions().timeZone || '').split('/').pop().replace('_', ' ');
      const cw = spark.clientWidth * 2, ch = spark.clientHeight * 2; if (spark.width !== cw) { spark.width = cw; spark.height = ch; }
      sctx.clearRect(0, 0, cw, ch); sctx.beginPath();
      frames.forEach((f, i) => { const x = i / 89 * cw, y = ch - clamp(f / 33, 0, 1) * ch; i ? sctx.lineTo(x, y) : sctx.moveTo(x, y); });
      sctx.strokeStyle = '#ffd2a0'; sctx.lineWidth = 2; sctx.stroke();
    }
    if (W.paused) return;
    W.sx += (W.mx - W.sx) * 0.06; W.sy += (W.my - W.sy) * 0.06;
    if (!TOUCH && !REDUCED) { const px = W.sx / innerWidth - 0.5, py = W.sy / innerHeight - 0.5; desk.style.translate = (-px * 10).toFixed(2) + 'px ' + (-py * 6).toFixed(2) + 'px'; wid.style.translate = (-px * 16).toFixed(2) + 'px ' + (-py * 9).toFixed(2) + 'px'; }
    if (W.boot > 0) W.boot = Math.max(0, W.boot - dt / 1000 / 1.4);
    if (W.gl && W.u) {
      const gl = W.gl; gl.viewport(0, 0, wall.width, wall.height);
      gl.uniform2f(W.u.R, wall.width, wall.height); gl.uniform1f(W.u.T, REDUCED ? 20 : tNow()); gl.uniform1f(W.u.B, W.boot * W.boot);
      gl.uniform2f(W.u.M, W.sx * W.s, (innerHeight - W.sy) * W.s); gl.uniform3f(W.u.P, W.pulse[0], W.pulse[1], W.pulse[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (R.on) drawRain();
  }
  requestAnimationFrame(loop);

  /* ================================================================ boot */
  const skills = content.capabilities.reduce((a, g) => a + g[1].length, 0);
  requestAnimationFrame(() => os.classList.add('on'));
  if (!fast) {
    play('boot');
    const boot = el('div'); boot.id = 'boot'; const pre = el('pre'); boot.appendChild(pre); os.appendChild(boot);
    const L = [
      [['vv-2126 · handshake ......... ', ''], ['accepted', 'ok']],
      [['clock skew .................. ', ''], ['+100 years', 'w']],
      [['credentials ................. ', ''], ['none required', 'ok']],
      [['mounting ~/work ............. ', ''], [content.work.length + ' worlds', 'w']],
      [['mounting ~/skills ........... ', ''], [skills + ' skills', 'w']],
      [['mounting ~/withdrawn ........ ', ''], [content.withdrawn.length + ' claims, kept public', 'w']],
      [['door ........................ ', ''], ['open', 'ok']],
      [['welcome, visitor.', 'p']],
    ];
    for (const line of L) {
      const row = el('div'); pre.appendChild(row);
      for (const [txt, cls] of line) { const sp = el('span', cls || null); row.appendChild(sp); for (let i = 0; i < txt.length; i += 3) { sp.textContent = txt.slice(0, i + 3); await new Promise((r) => setTimeout(r, REDUCED ? 0 : 6)); } }
      await new Promise((r) => setTimeout(r, REDUCED ? 0 : 110));
    }
    await new Promise((r) => setTimeout(r, 500));
    boot.classList.add('off'); setTimeout(() => boot.remove(), 1000);
  }
  os.classList.add('ready');
  if (!fast) { setTimeout(() => whisper.classList.add('on'), 900); }
  const hush = () => { whisper.classList.remove('on'); removeEventListener('pointerdown', hush); };
  setTimeout(() => addEventListener('pointerdown', hush), 900); setTimeout(hush, 14000);

  window.__os = { openApp, openWorld, openNode, openUrl, closeWin, wins, palette, route, matrix, showWorld, el: os };
  route.go();
  return window.__os;
}
