(() => {
'use strict';
const N = 9; // 8 products + contact
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const slotEls = Array.from(document.querySelectorAll('#slots > .slot'));
const stage = document.getElementById('stage');
const header = document.querySelector('header');
const hint = document.getElementById('hint');

// ---- spectrum (identical in GLSL): t=0 red … t=1 violet ----
const gs = (t, m, s) => Math.exp(-(((t - m) / s) ** 2));
function spec(t) {
  const r = gs(t, .1, .25) + .45 * gs(t, 1.0, .1);
  const g = .95 * gs(t, .45, .16) + .35 * gs(t, .25, .12);
  const b = gs(t, .78, .16);
  const l = (r + g + b) / 3;
  return [l + (r - l) * 1.35, l + (g - l) * 1.35, l + (b - l) * 1.35];
}
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

// ---- layout ----
let L = null;
function layout() {
  const w = innerWidth, h = innerHeight;
  const mobile = w < 900;
  const slots = [];
  let P, R, pageH, poolOff, hb = 0;
  if (!mobile) {
    pageH = Math.max(h, 640);
    P = { x: clamp(w * 0.25, 250, 440), y: pageH * 0.53 };
    R = clamp(Math.min(w, pageH) / 900 * 58, 44, 64);
    const rx = Math.min(w * 0.5, 740, w - 360 - P.x);
    const top = pageH * 0.11, bot = pageH * 0.93;
    const ry = Math.max(P.y - top, bot - P.y) * 1.18;
    for (let i = 0; i < N; i++) {
      const y = top + (bot - top) * i / 8, k = (y - P.y) / ry;
      slots.push({ x: P.x + rx * Math.sqrt(Math.max(0, 1 - k * k)), y });
    }
    poolOff = 150;
  } else {
    hb = header.offsetTop + header.offsetHeight;
    P = { x: clamp(w * 0.11, 36, 60), y: hb + 110 };
    R = 36;
    const row = 112;
    for (let i = 0; i < N; i++) slots.push({ x: P.x + 96 + 14 * Math.sin(i * 0.8 + 0.4), y: P.y + 46 + i * row });
    pageH = slots[8].y + 140;
    poolOff = 100;
  }
  slots.forEach(s => { s.ang = Math.atan2(s.y - P.y, s.x - P.x); });
  stage.style.height = pageH + 'px';
  slots.forEach((s, i) => {
    const el = slotEls[i];
    el.style.left = s.x + 'px'; el.style.top = s.y + 'px';
    el.style.width = Math.min(mobile ? 999 : 330, w - s.x - (mobile ? 14 : 24)) + 'px';
  });
  if (mobile) { hint.style.top = (hb + 18) + 'px'; hint.style.left = header.offsetLeft + 'px'; }
  else { hint.style.top = ''; hint.style.left = ''; }
  L = { P, R, beamY: P.y, slots, mobile, pageH, poolOff };
  computePrism(st ? st.sc : 3.5);
}

function sIndex(a) {
  const S = L.slots;
  if (a <= S[0].ang) return (a - S[0].ang) / (S[1].ang - S[0].ang);
  if (a >= S[8].ang) return 8 + (a - S[8].ang) / (S[8].ang - S[7].ang);
  for (let i = 0; i < 8; i++) if (a < S[i + 1].ang) return i + (a - S[i].ang) / (S[i + 1].ang - S[i].ang);
  return 8;
}
function angAt(s) {
  const S = L.slots;
  if (s <= 0) return S[0].ang + s * (S[1].ang - S[0].ang);
  if (s >= 8) return S[8].ang + (s - 8) * (S[8].ang - S[7].ang);
  const i = Math.floor(s); return S[i].ang + (s - i) * (S[i + 1].ang - S[i].ang);
}

// prism: iq equilateral triangle (local y-up), vertices (-r,-r/√3) (r,-r/√3) (0,2r/√3), r = R*0.866
let rot = 0, entry = { x: 0, y: 0 }, exit = { x: 0, y: 0 }, entryT = 0;
function triVerts() {
  const r = L.R * 0.866 + 3, k = Math.sqrt(3), c = Math.cos(rot), s = Math.sin(rot);
  return [[-r, -r / k], [r, -r / k], [0, 2 * r / k]].map(([x, y]) => {
    const vx = x, vy = -y; return { x: L.P.x + c * vx - s * vy, y: L.P.y + s * vx + c * vy };
  });
}
function rayTri(ox, oy, dx, dy, far) {
  const V = triVerts(); let best = far ? -1e9 : 1e9;
  for (let i = 0; i < 3; i++) {
    const A = V[i], B = V[(i + 1) % 3], ex = B.x - A.x, ey = B.y - A.y;
    const den = dx * ey - dy * ex; if (Math.abs(den) < 1e-9) continue;
    const t = ((A.x - ox) * ey - (A.y - oy) * ex) / den;
    const u = ((A.x - ox) * dy - (A.y - oy) * dx) / den;
    if (u >= 0 && u <= 1) best = far ? Math.max(best, t) : Math.min(best, t);
  }
  return best;
}
function computePrism(sc) {
  const phi = angAt(sc);
  rot = 0.2 * phi - 0.04 + (L.mobile ? -0.18 : 0); // small range: keeps the apex up, never a 'play' arrow
  const tE = rayTri(L.P.x - 4000, L.beamY, 1, 0, false);
  entry = { x: L.P.x - 4000 + tE, y: L.beamY }; entryT = entry.x - L.P.x;
  const tX = rayTri(L.P.x, L.P.y, Math.cos(phi), Math.sin(phi), true);
  exit = { x: L.P.x + Math.cos(phi) * tX, y: L.P.y + Math.sin(phi) * tX };
}

function fanAt(s, sc, sw) {
  const u = (s - sc) / sw + 0.5;
  const win = sstep(-0.05, 0.04, u) * (1 - sstep(0.96, 1.05, u));
  const fr = (((u * 8) % 1) + 1) % 1;
  const bd = 0.3 + 0.3 * sstep(3, 8, sw);
  const band = 1 - bd + bd * Math.cos(Math.PI * (fr - 0.5)) ** 2;
  const energy = clamp(3.0 / sw, 0.72, 1.15);
  const tail = sstep(0.97, 1.03, u) * (1 - sstep(1.06, 1.22, u)) * 0.75;
  return { u, lit: win * band, wall: win * band * energy, tail };
}

let st = null;

// ---- WebGL ----
const canvas = document.getElementById('light');
const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true });
if (!gl) { layout(); slotEls.forEach(e => e.style.setProperty('--lit', 1)); addEventListener('resize', layout); return; }
const VS = 'attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }';
const FS = `
precision highp float;
uniform vec2 uRes; uniform float uScale; uniform float uScroll; uniform vec2 uView;
uniform vec2 uP; uniform float uR; uniform float uRot; uniform float uBeamY;
uniform float uFront; uniform float uEntryT; uniform float uOn;
uniform vec2 uEntry; uniform vec2 uExit;
uniform float uSc; uniform float uSw; uniform float uFanR; uniform float uTime; uniform float uPoolOff;
uniform vec3 uSlot[9]; uniform vec4 uSlotC[9];
float gs(float t,float m,float s){ float x=(t-m)/s; return exp(-x*x); }
vec3 spec(float t){
  float r = gs(t,.1,.25) + .45*gs(t,1.,.1);
  float g = .95*gs(t,.45,.16) + .35*gs(t,.25,.12);
  float b = gs(t,.78,.16);
  vec3 c = vec3(r,g,b); float l=(r+g+b)/3.; return l + (c-l)*1.35;
}
float h1(float x){ return fract(sin(x*127.1)*43758.5453); }
float n1(float x){ float i=floor(x), f=fract(x); return mix(h1(i),h1(i+1.),f*f*(3.-2.*f)); }
float h2(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
float sdTri(vec2 p, float r){
  const float k = 1.7320508;
  p.x = abs(p.x) - r; p.y = p.y + r/k;
  if (p.x + k*p.y > 0.0) p = vec2(p.x - k*p.y, -k*p.x - p.y)/2.0;
  p.x -= clamp(p.x, -2.0*r, 0.0);
  return -length(p)*sign(p.y);
}
vec2 toLocal(vec2 p){ vec2 d=p-uP; float c=cos(uRot), s=sin(uRot); vec2 l=vec2(c*d.x+s*d.y, -s*d.x+c*d.y); l.y=-l.y; return l; }
float triAt(vec2 p){ return sdTri(toLocal(p), uR*0.866) - 3.0; }
float slotIndex(float a){
  float s0 = uSlot[0].z, s1 = uSlot[1].z, s7 = uSlot[7].z, s8 = uSlot[8].z;
  if (a <= s0) return (a - s0)/(s1 - s0);
  if (a >= s8) return 8.0 + (a - s8)/(s8 - s7);
  float s = 8.0;
  for (int i = 0; i < 8; i++) {
    float lo = uSlot[i].z, hi = uSlot[i+1].z;
    if (a >= lo && a < hi) s = float(i) + (a - lo)/(hi - lo);
  }
  return s;
}
float caustic(vec2 q, float t){
  vec2 r = q/30.0;
  r += 0.7*vec2(sin(r.y*1.15 + t*0.7), cos(r.x*0.95 - t*0.55));
  r += 0.35*vec2(sin(r.y*2.1 - t*0.4), cos(r.x*1.9 + t*0.5));
  float c = abs(sin(r.x*1.5) + sin(r.y*1.7));
  return pow(1.0 - clamp(c*0.55,0.,1.), 5.0)*2.2;
}
float segD(vec2 p, vec2 a, vec2 b, out float h){ vec2 pa=p-a, ba=b-a; h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h); }
void main(){
  vec2 vp = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y)/uScale;
  vec2 p = vp + vec2(0.0, uScroll);
  vec2 q = vp/uView;
  float g = length((q - vec2(0.02,-0.05))*vec2(1.0,1.25));
  float A = mix(1.0, 0.85, smoothstep(0.1, 1.15, g));
  A *= 1.0 - 0.05*smoothstep(0.75, 1.05, q.y);
  vec3 W = vec3(0.975, 0.955, 0.925);
  float tri = triAt(p);
  float sh = triAt(p - vec2(16.0, 26.0) * (uR/46.0));
  float shadow = 1.0 - smoothstep(-6.0, 26.0, sh);
  A *= 1.0 - 0.11*shadow;
  vec3 Lc = vec3(0.0);
  // beam
  float perp = p.y - uBeamY;
  float along = p.x - uP.x;
  float bEnd = min(uFront, uEntryT);
  float bm = smoothstep(bEnd + 2.0, bEnd - 2.0, along);
  float core = exp(-pow(perp/1.25,2.0))*1.5 + exp(-pow(perp/5.0,2.0))*0.42 + exp(-abs(perp)/26.0)*0.10;
  core *= 0.94 + 0.06*n1(along*0.02 - uTime*1.3);
  Lc += vec3(1.0, 0.985, 0.95) * core * bm * uOn;
  float fr = exp(-length(vec2(along - uFront, perp))/7.0) * step(uFront, uEntryT-1.0);
  Lc += vec3(1.0)*fr*1.2*uOn;
  // fan
  vec2 v = p - uP; float d = length(v); float a = atan(v.y, v.x);
  float s = slotIndex(a);
  float u = (s - uSc)/uSw + 0.5;
  float win = smoothstep(-0.05, 0.04, u) * (1.0 - smoothstep(0.96, 1.05, u));
  float cb = cos(3.14159265*(fract(u*8.0) - 0.5));
  float bd = 0.3 + 0.3*smoothstep(3.0, 8.0, uSw);
  float band = 1.0 - bd + bd*cb*cb;
  float energy = clamp(3.0/uSw, 0.72, 1.15);
  float fall = 1.0/(1.0 + d/520.0);
  float reach = 1.0 - smoothstep(uFanR - 160.0, uFanR, d);
  float streak = 0.86 + 0.16*n1(a*340.0) + 0.12*(n1(a*60.0 + uTime*0.35) - 0.5);
  float outside = smoothstep(-1.0, 2.5, tri) * smoothstep(uR*0.5, uR*1.1, d);
  float wm = smoothstep(uR*0.9, uR*5.0, d);
  vec3 sc = spec(clamp(u, 0.0, 1.0));
  vec3 fanCol = mix(vec3(1.0, 0.98, 0.94), sc, wm);
  vec3 fan = fanCol * win*band*streak*energy*fall*1.35;
  float gw = smoothstep(-0.4, 0.05, u) * (1.0 - smoothstep(0.95, 1.4, u));
  vec3 glow = mix(vec3(1.0,0.97,0.92), sc, 0.6) * gw * 0.13 * energy * fall;
  float tail = smoothstep(0.97, 1.03, u) * (1.0 - smoothstep(1.06, 1.22, u)) * 0.6;
  vec3 uvl = spec(1.0) * tail * fall;
  float front = step(abs(a), 2.2);
  Lc += (fan + glow + uvl) * outside * reach * uOn * front;
  // pools
  for (int i = 0; i < 9; i++) {
    vec4 c4 = uSlotC[i];
    if (c4.a > 0.003) {
      vec2 qq = p - (uSlot[i].xy + vec2(uPoolOff, 0.0));
      float e = qq.x*qq.x/(175.0*175.0) + qq.y*qq.y/(50.0*50.0);
      float pool = exp(-e*1.7) * (0.45 + 0.55*caustic(qq, uTime*0.8 + float(i)*1.7));
      vec2 dd = p - uSlot[i].xy;
      float spot = exp(-dot(dd,dd)/30.0)*1.6 + exp(-dot(dd,dd)/400.0)*0.35;
      Lc += c4.rgb * c4.a * (pool*0.62 + spot);
    }
  }
  Lc += vec3(1.0,0.97,0.9) * exp(-d/(uR*2.4)) * 0.22 * uOn;
  vec2 dx = p - uExit;
  Lc += vec3(1.0) * (exp(-length(dx)/4.5)*1.4 + exp(-abs(dx.y)/1.1)*exp(-abs(dx.x)/(uR*1.3))*0.35) * uOn * step(uEntryT, uFront + 0.5);
  vec2 de = p - uEntry;
  Lc += vec3(1.0,0.98,0.95) * exp(-length(de)/4.0) * 0.9 * uOn * step(uEntryT, uFront + 0.5);
  float inSh = shadow * smoothstep(-2.0, 2.0, tri);
  vec2 lq = toLocal(p - vec2(16.0, 26.0) * (uR/46.0));
  float cl = caustic(lq*0.9 + vec2(0.0, uTime*2.0), uTime*0.6);
  Lc += spec(fract(lq.x/(uR*1.7) + 0.5)) * cl * inSh * 0.10 * uOn;
  vec3 col = W * (A + Lc);
  // glass
  float body = smoothstep(0.8, -0.8, tri);
  vec2 lp = toLocal(p);
  float hseg; float ds = segD(p, uEntry, uExit, hseg);
  float ib = (exp(-pow(ds/1.6,2.0))*1.1 + exp(-pow(ds/8.0,2.0))*0.3) * uOn * step(uEntryT, uFront + 0.5);
  vec3 ibCol = mix(vec3(1.0,0.99,0.96), spec(hseg), 0.35*hseg);
  // glass: slightly cool body, a thickness band inside the rim, a bright refracted core and edge highlights
  float depth = clamp(-tri/(uR*0.55), 0.0, 1.0);
  vec3 glass = col*0.86 + vec3(0.05, 0.065, 0.075);
  glass = mix(glass, glass*0.93 + vec3(0.0,0.01,0.015), smoothstep(0.0, 0.25, depth)*(1.0-smoothstep(0.25,0.6,depth)));
  glass += spec(clamp(lp.x/(uR*1.6) + 0.5, 0.0, 1.0)) * 0.12 * uOn * smoothstep(-uR, uR, lp.y + lp.x*0.6) * smoothstep(0.05,0.3,depth);
  glass += ibCol * ib;
  // reflected highlight: a soft bright sheet near the top vertex
  glass += vec3(1.0) * 0.16 * smoothstep(uR*0.15, uR*0.75, lp.y) * smoothstep(0.0, 0.2, depth);
  // internal reflection line parallel to the left face
  float il = abs(dot(lp, normalize(vec2(-0.866, 0.5))) - uR*0.18);
  glass += vec3(0.9, 0.95, 1.0) * exp(-il/0.9) * 0.22 * smoothstep(0.1, 0.3, depth);
  col = mix(col, glass, body);
  float rimIn = exp(-abs(tri + 1.4)/0.8);
  float rimOut = exp(-abs(tri - 0.5)/0.9);
  float lightSide = 0.55 + 0.45*clamp(dot(normalize(lp + 1e-4), normalize(vec2(-0.6, 0.8))), 0.0, 1.0);
  col += vec3(0.75) * rimIn * body * lightSide;
  col -= vec3(0.22, 0.21, 0.19) * rimOut * (1.0 - 0.5*lightSide);
  // contact glow under the prism where light leaks through the base
  col += spec(fract(lp.x/(uR*2.0) + 0.5)) * 0.06 * exp(-abs(tri)/6.0) * (1.0 - body) * uOn * smoothstep(0.0, -uR*0.4, lp.y);
  vec3 over = max(col - 0.86, 0.0);
  col = min(col, 0.86) + over/(1.0 + over/0.14);
  col += (h2(floor(vp*uScale)) - 0.5) * 0.014;
  gl_FragColor = vec4(col, 1.0);
}`;
function mk(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
const prog = gl.createProgram();
gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS));
gl.linkProgram(prog); gl.useProgram(prog);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const U = {};
['uRes','uScale','uScroll','uView','uP','uR','uRot','uBeamY','uFront','uEntryT','uOn','uEntry','uExit','uSc','uSw','uFanR','uTime','uPoolOff','uSlot','uSlotC']
  .forEach(n => { U[n] = gl.getUniformLocation(prog, n); });

let scale = Math.min(devicePixelRatio || 1, 1.5);
function resize() {
  layout();
  canvas.width = Math.round(innerWidth * scale); canvas.height = Math.round(innerHeight * scale);
  gl.viewport(0, 0, canvas.width, canvas.height);
}

// ---- state ----
st = { sc: -0.6, sw: 2.3, scT: 3.5, swT: 2.3, on: 0, front: -3000, fanR: 0, vsc: 0, vsw: 0 };
const lit = new Float32Array(N), shown = new Float32Array(N);
let wide = false, hoverSlot = -1, pointerSc = null, lastInput = 0, tapUntil = 0, autoWideUntil = 0;
const found = new Array(8).fill(false); let celebrated = false, introDone = false;
const t0 = performance.now();
const INTRO_END = 4.6;
const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const easeOut = x => 1 - Math.pow(1 - x, 3);

function intro(t) {
  const startT = -L.P.x - 40;
  st.on = t < 0.25 ? 0 : t < 0.29 ? 0.7 : t < 0.33 ? 0.12 : t < 0.38 ? 0.85 : t < 0.42 ? 0.5 : Math.min(1, 0.85 + (t - 0.42));
  st.front = startT + (entryT - startT) * easeOut(clamp((t - 0.25) / 0.45, 0, 1));
  st.fanR = 2600 * Math.pow(clamp((t - 0.68) / 0.8, 0, 1), 1.6);
  if (t < 1.0) { st.sc = -0.6; st.sw = 2.3; }
  else if (t < 2.6) { st.sc = -0.6 + 8.9 * ease((t - 1.0) / 1.6); st.sw = 2.3; }
  else { const k = ease(clamp((t - 2.6) / 0.7, 0, 1)); st.sc = 8.3 + (3.5 - 8.3) * k; st.sw = 2.3 + (8.4 - 2.3) * k; }
}

function live(t, dt) {
  let target = 3.5;
  if (L.mobile && t > tapUntil) {
    const mid = scrollY + innerHeight * 0.55, S = L.slots;
    if (mid <= S[0].y) target = 0; else if (mid >= S[8].y) target = 8;
    else for (let i = 0; i < 8; i++) if (mid < S[i + 1].y) { target = i + (mid - S[i].y) / (S[i + 1].y - S[i].y); break; }
  } else if (hoverSlot >= 0) target = hoverSlot;
  else if (pointerSc !== null) target = pointerSc;
  if (!L.mobile && t - lastInput > 7 && hoverSlot < 0) target = 3.5 + 4.2 * Math.sin((t - lastInput - 7) * 0.35);
  const isWide = wide || t < autoWideUntil;
  st.scT = isWide ? 3.5 : clamp(target, -0.4, 8.4);
  st.swT = isWide ? 8.4 : 2.3;
  const k = 30, c = 2 * Math.sqrt(k);
  st.vsc += (k * (st.scT - st.sc) - c * st.vsc) * dt; st.sc += st.vsc * dt;
  st.vsw += (k * 0.6 * (st.swT - st.sw) - c * 0.77 * st.vsw) * dt; st.sw += st.vsw * dt;
  st.on = 1; st.front = entryT + 10; st.fanR = 2600;
}

const slotU = new Float32Array(N * 3), slotC = new Float32Array(N * 4);
function updateLit(dt, instant) {
  for (let i = 0; i < N; i++) {
    const S = L.slots[i], f = fanAt(i, st.sc, st.sw);
    const d = Math.hypot(S.x - L.P.x, S.y - L.P.y);
    const reach = 1 - sstep(st.fanR - 160, st.fanR, d);
    let v = f.lit, col = spec(clamp(f.u, 0, 1));
    if (i === 8 && f.tail > v) { v = f.tail; col = spec(1); }
    v *= reach * st.on;
    lit[i] = v;
    shown[i] = instant ? v : shown[i] + (v - shown[i]) * Math.min(1, dt * 10);
    const sv = clamp(shown[i], 0, 1);
    slotEls[i].style.setProperty('--lit', sv.toFixed(3));
    const NEU = [0.80, 0.76, 0.71];
    const cc = col.map((x, j) => Math.round(clamp((x * 0.85 + 0.15) * sv + NEU[j] * (1 - sv), 0, 1) * 255));
    slotEls[i].style.setProperty('--c', cc.join(','));
    slotU.set([S.x, S.y, S.ang], i * 3);
    slotC.set([col[0], col[1], col[2], v], i * 4);
  }
}

function draw(t) {
  computePrism(st.sc);
  gl.uniform2f(U.uRes, canvas.width, canvas.height);
  gl.uniform1f(U.uScale, canvas.width / innerWidth);
  gl.uniform1f(U.uScroll, scrollY);
  gl.uniform2f(U.uView, innerWidth, innerHeight);
  gl.uniform2f(U.uP, L.P.x, L.P.y); gl.uniform1f(U.uR, L.R); gl.uniform1f(U.uRot, rot);
  gl.uniform1f(U.uBeamY, L.beamY); gl.uniform1f(U.uFront, st.front); gl.uniform1f(U.uEntryT, entryT);
  gl.uniform1f(U.uOn, st.on); gl.uniform2f(U.uEntry, entry.x, entry.y); gl.uniform2f(U.uExit, exit.x, exit.y);
  gl.uniform1f(U.uSc, st.sc); gl.uniform1f(U.uSw, st.sw); gl.uniform1f(U.uFanR, st.fanR);
  gl.uniform1f(U.uTime, t); gl.uniform1f(U.uPoolOff, L.poolOff);
  gl.uniform3fv(U.uSlot, slotU); gl.uniform4fv(U.uSlotC, slotC);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// ---- input ----
const now = () => (performance.now() - t0) / 1000;
function aimAt(px, py) { pointerSc = sIndex(Math.atan2(py - L.P.y, px - L.P.x)); }
addEventListener('pointermove', e => { lastInput = now(); if (e.pointerType === 'mouse' || !L.mobile) aimAt(e.clientX, e.clientY + scrollY); }, { passive: true });
let holdTimer = 0;
addEventListener('pointerdown', e => {
  lastInput = now();
  if (e.target.closest && e.target.closest('a')) return;
  if (L.mobile) { aimAt(e.clientX, e.clientY + scrollY); tapUntil = lastInput + 4; holdTimer = setTimeout(() => { wide = true; }, 280); }
  else wide = true;
});
const release = () => { clearTimeout(holdTimer); wide = false; };
addEventListener('pointerup', release); addEventListener('pointercancel', release);
addEventListener('scroll', () => { if (L.mobile) tapUntil = 0; clearTimeout(holdTimer); }, { passive: true });
slotEls.forEach((el, i) => {
  el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hoverSlot = i; });
  el.addEventListener('pointerleave', () => { if (hoverSlot === i) hoverSlot = -1; });
  el.addEventListener('focusin', () => { hoverSlot = i; tapUntil = 1e9; lastInput = now(); });
  el.addEventListener('focusout', () => { if (hoverSlot === i) hoverSlot = -1; tapUntil = 0; });
});
addEventListener('keydown', e => {
  if (e.key === ' ' && !(e.target.closest && e.target.closest('a'))) { wide = true; lastInput = now(); e.preventDefault(); }
});
addEventListener('keyup', e => { if (e.key === ' ') wide = false; });

// ---- run ----
resize();
function still() {
  st.on = 1; st.front = entryT + 10; st.fanR = 2600; st.sc = 3.5; st.sw = 8.4;
  computePrism(st.sc); updateLit(0, true); draw(0);
}
let rt = 0;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduced) still(); }, 60); });
const coarse = matchMedia('(pointer: coarse)').matches;
hint.textContent = (L.mobile || coarse)
  ? 'Scroll or tap to steer the light · hold for the full spectrum'
  : 'Move to steer the light · hold click or space for the full spectrum';
if (reduced) {
  still(); hint.textContent = '';
  addEventListener('scroll', () => draw(0), { passive: true });
  return;
}

let last = performance.now(), frames = 0, slow = 0;
function frame(nowMs) {
  const dt = Math.min(0.05, (nowMs - last) / 1000); last = nowMs;
  const t = (nowMs - t0) / 1000;
  if (t < INTRO_END) intro(t);
  else {
    if (!introDone) { introDone = true; hint.classList.add('on'); lastInput = Math.max(lastInput, t); found.fill(false); }
    live(t, dt);
    for (let i = 0; i < 8; i++) if (lit[i] > 0.5) found[i] = true;
    if (!celebrated && found.every(Boolean)) { celebrated = true; autoWideUntil = t + 1.8; }
  }
  updateLit(dt, false);
  draw(t); window.__t = t;
  frames++; if (dt > 0.022) slow++;
  if (frames === 90) { if (slow > 30 && scale > 0.6) { scale *= 0.8; resize(); } frames = 0; slow = 0; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
