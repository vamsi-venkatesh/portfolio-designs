// Conxto — "The Proof Field". You stand at the centre of the job market: every posting row the engine
// collected is a point of light, flowing in from its sources and settling into one pool. Your résumé is a
// slab of light at the centre. Aim its beam, pull one posting in, watch it unfold into requirements that
// dock against the lines that prove them, then let the agents propose rewrites: the honest ones settle,
// the ones that claim more than the résumé shows shatter and the original line stays.
// A working model of the idea, not the product. Rules are shown on screen and run on your own text.
import * as THREE from '../../../vendor/three.module.js';
import { life, h, fonts, style, controls, reading, clamp } from './_kit.js';

/* ------------------------------------------------------------------ the honest model (same rules as v1) */
const RESUME = 'Built a Python service that parses invoices\nWrote tests for a React app\nRan PostgreSQL backups on a Linux server\nPresented weekly results to the team';
const POSTING = 'Python\nPostgreSQL\nKubernetes\nReact\nTeam leadership';
const STOP = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'to', 'for', 'on', 'in', 'with', 'that', 'by', 'at', 'as', 'is', 'experience', 'years']);
const words = (t) => (t.toLowerCase().match(/[a-z0-9+#.]+/g) || []).map((w) => w.replace(/\.$/, '')).filter((w) => w.length > 1 && !STOP.has(w));
const claims = (t) => { const out = new Set(); (t.match(/\d[\d.,]*/g) || []).forEach((n) => out.add(n)); t.split(/\s+/).forEach((w, i) => { const c = w.replace(/[^A-Za-z0-9+#]/g, ''); if (i > 0 && /^[A-Z]/.test(c)) out.add(c); }); return out; };
const splitLines = (t, n) => t.split('\n').map((x) => x.trim()).filter(Boolean).slice(0, n);
function check(lines, reqs) {
  return reqs.map((req) => {
    const rw = words(req); let best = -1, hit = 0;
    lines.forEach((ln, li) => { const lw = new Set(words(ln)); const k = rw.filter((w) => lw.has(w)).length; if (k > hit) { hit = k; best = li; } });
    const state = !rw.length || hit === 0 ? 'missing' : hit === rw.length ? 'met' : 'partial';
    return { req, state, line: best };
  });
}
function rewrite(line, i) {
  if (i % 2 === 0) {
    const r = line.replace(/^Built/, 'Designed and built').replace(/^Wrote/, 'Wrote and maintained').replace(/^Ran/, 'Ran and checked').replace(/^Presented/, 'Presented and explained');
    return r === line ? line + ', and documented the work' : r;
  }
  const tool = ['Kubernetes', 'AWS', 'Terraform', 'Kafka'][i % 4];
  return 'Led a team of ' + (4 + i) + ' that ' + line.charAt(0).toLowerCase() + line.slice(1) + ' using ' + tool;
}
function judge(lines, cand) {
  const src = lines.join('\n'); const source = claims(src); const lower = src.toLowerCase();
  return [...claims(cand)].filter((c) => !source.has(c) && !lower.includes(c.toLowerCase()));
}

/* ------------------------------------------------------------------ easing */
const E = {
  lin: (t) => t,
  io3: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  io2: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  o3: (t) => 1 - Math.pow(1 - t, 3),
  o5: (t) => 1 - Math.pow(1 - t, 5),
  i3: (t) => t * t * t,
  back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  io5: (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2),
};
const lerp = (a, b, t) => a + (b - a) * t;

/* ------------------------------------------------------------------ palette (linear, HDR where it glows) */
const C = {
  met: new THREE.Color(1.0, 0.9, 0.66), part: new THREE.Color(0.95, 0.55, 0.16),
  miss: new THREE.Color(0.42, 0.52, 0.66), red: new THREE.Color(1.0, 0.16, 0.08), cool: new THREE.Color(0.7, 0.86, 1.0),
};

/* ------------------------------------------------------------------ shaders */
const FIELD_V = `
attribute float aW;
uniform float uTime, uSize, uLive, uBeamOn, uBeamCos, uScale, uIntro, uGain;
uniform vec3 uBeamO, uBeamDir;
varying vec3 vCol; varying float vA;
float hash(float n){ return fract(sin(n) * 43758.5453); }
void main(){
  float k = position.x, ph = position.y, g = position.z;
  float h1 = hash(aW * 91.7 + ph * 13.1), h2 = hash(aW * 17.3 + g * 7.7);
  float gv = (h1 - .5) * 2.; gv = gv * gv * gv + gv * .18;
  vec3 p; float fade = 1.;
  if (k < 22.) {
    float u = fract(ph + uTime * .0035 * (.6 + aW * .8));
    float r = mix(430., 30., pow(u, .85));
    float th = k / 22. * 6.2831853 + (1. - r / 430.) * 2.9 + uTime * .004 + g * (2.2 + r * .028) / r;
    p = vec3(cos(th) * r, gv * (1.2 + r * .012), sin(th) * r);
    fade = smoothstep(0., .08, u) * smoothstep(1., .9, u);
  } else {
    float r = 38. + pow(ph, 1.3) * 392.;
    float arm = floor(hash(aW * 3.1 + 1.7) * 3.);
    bool haze = hash(aW * 5.3 + .3) < .3;
    float gg = g * g * g * .8 + g * .12;
    float th = haze ? g * 3.14159265 : arm * 2.0944 + log(r) * 2.4 + gg * (.5 + r / 700.);
    th += uTime * 1.1 / (r + 20.);
    p = vec3(cos(th) * r, gv * (1.4 + r * .018), sin(th) * r);
    p.y += (h2 - .5) * 2. * (1. - smoothstep(38., 150., r)) * 9.;
  }
  bool live = aW < uLive;
  vec3 col = live ? vec3(1.0, .8, .52) * uGain * (.8 + .35 * sin(uTime * 1.7 + aW * 900.)) : vec3(.3, .4, .58) * .17 * uGain;
  float sz = live ? 1.7 : 1.0;
  vec3 d = normalize(p - uBeamO);
  float inB = smoothstep(uBeamCos, uBeamCos + .006, dot(d, uBeamDir)) * uBeamOn;
  col = mix(col, vec3(.55, .92, 1.25) * (live ? 2.4 : .8), inB);
  sz *= 1. + inB * 1.2;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  float s = uSize * sz * uScale / max(-mv.z, .1);
  float ps = clamp(s, 1., 16.);
  vA = fade * uIntro * clamp(s, 0., 1.) * min(1., 6.25 / (ps * ps));
  gl_PointSize = ps;
  vCol = col;
}`;
const FIELD_F = `
varying vec3 vCol; varying float vA;
void main(){ vec2 c = gl_PointCoord - .5; float d = dot(c, c); float a = smoothstep(.25, .0, d); gl_FragColor = vec4(vCol * a * vA, 1.); }`;

const QUAD_V = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
// tiles, card, rewrite strips: dark glass body, glowing glyphs
const TILE_F = `
uniform sampler2D uTex; uniform vec3 uColor; uniform float uOp, uFill, uGlow, uAspect;
varying vec2 vUv;
void main(){
  float t = texture2D(uTex, vUv).a;
  vec2 q = vec2(min(vUv.x, 1. - vUv.x) * uAspect, min(vUv.y, 1. - vUv.y));
  float e = min(q.x, q.y);
  float rim = smoothstep(.035, .0, e);
  vec3 body = vec3(.012, .016, .026) + uColor * .05 + uColor * uGlow * .5;
  vec3 c = mix(body, uColor * 2.2, clamp(t + rim * .8, 0., 1.));
  float a = max(uFill, max(t, rim)) * uOp;
  gl_FragColor = vec4(c, a);
}`;
const SLAB_F = `
uniform sampler2D uTex; uniform float uTime, uOp, uGhost, uLG[8]; uniform vec3 uLC[8]; uniform float uLY[8], uLH;
varying vec2 vUv;
void main(){
  float t = texture2D(uTex, vUv).a;
  vec2 q = vec2(min(vUv.x, 1. - vUv.x) * 1.565, min(vUv.y, 1. - vUv.y));
  float e = min(q.x, q.y);
  float rim = smoothstep(.012, .0, e) + smoothstep(.09, .0, e) * .12;
  float scan = .5 + .5 * sin(vUv.y * 900.);
  float sweep = smoothstep(.08, .0, abs(fract(uTime * .07) * 1.4 - .2 - vUv.y)) * .25;
  vec3 c = vec3(.03, .022, .014) + vec3(1., .7, .38) * (.035 + sweep * .4) * (.8 + .2 * scan);
  vec3 glow = vec3(0.);
  for (int i = 0; i < 8; i++) { float b = smoothstep(uLH, uLH * .25, abs(vUv.y - uLY[i])); glow += uLC[i] * uLG[i] * b; }
  c += glow * .35;
  vec3 ink = vec3(1., .86, .62) * 1.9 + glow * 1.4;
  c = mix(c, ink, t);
  c += vec3(1., .78, .45) * rim * 2.4;
  float a = clamp(.86 + t + rim, 0., 1.) * uOp;
  if (uGhost > .5) { c = vec3(1., .75, .42) * (rim * 1.4 + t * .25); a = (rim + t * .25) * .5 * uOp; }
  gl_FragColor = vec4(c, a);
}`;
const BEAM_F = `
uniform float uOp, uTime; varying vec2 vUv;
void main(){ float along = vUv.y; float a = pow(max(1. - along, 0.), 1.6) * uOp * (.6 + .4 * sin(along * 60. - uTime * 8.));
  float side = 1. - abs(vUv.x - .5) * 2.; a *= .35 + .65 * side; gl_FragColor = vec4(vec3(.5, .88, 1.2) * a, 1.); }`;
const RIB_F = `
uniform vec3 uColor; uniform float uOp, uTime, uHalf; varying vec2 vUv;
void main(){ float flow = .55 + .45 * sin(vUv.x * 40. - uTime * 6.);
  float edge = 1. - abs(vUv.y - .5) * 2.; float lit = uHalf > .5 ? step(vUv.x, .5) * .9 + .1 : 1.;
  float dash = uHalf > .5 ? step(.45, fract(vUv.x * 14.)) : 1.;
  gl_FragColor = vec4(uColor * 1.8 * flow * pow(edge, 2.) * lit * dash * uOp, 1.); }`;
const GLOW_F = `
uniform vec3 uColor; uniform float uOp; varying vec2 vUv;
void main(){ float d = length(vUv - .5) * 2.; float a = exp(-d * d * 7.) + exp(-d * 3.5) * .25; a *= smoothstep(1., .7, d); gl_FragColor = vec4(uColor * a * uOp, 1.); }`;
const SPRITE_V = `
attribute float aSize; attribute vec3 aCol; uniform float uScale; varying vec3 vCol;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; float s = aSize * uScale / max(-mv.z, .1); if (s < .5) gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = clamp(s, 1., 160.); vCol = aCol; }`;
const SPRITE_F = `
varying vec3 vCol; void main(){ vec2 c = gl_PointCoord - .5; float d = length(c) * 2.; float a = (exp(-d * d * 6.) + exp(-d * 2.5) * .3) * smoothstep(1., .55, d); gl_FragColor = vec4(vCol * a, 1.); }`;

// post: full-screen passes
const PV = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const BRIGHT = `uniform sampler2D t; varying vec2 vUv; void main(){ vec3 c = texture2D(t, vUv).rgb; float l = max(c.r, max(c.g, c.b)); if (!(l >= 0.) || l > 6e4) { c = vec3(0.); l = 0.; } float k = max(l - .7, 0.); k = k * k / (k + .35); gl_FragColor = vec4(c * (k / max(l, 1e-4)), 1.); }`;
const DOWN = `uniform sampler2D t; uniform vec2 hp; varying vec2 vUv; void main(){ vec3 s = texture2D(t, vUv).rgb * 4.;
  s += texture2D(t, vUv - hp).rgb; s += texture2D(t, vUv + hp).rgb; s += texture2D(t, vUv + vec2(hp.x, -hp.y)).rgb; s += texture2D(t, vUv - vec2(hp.x, -hp.y)).rgb; gl_FragColor = vec4(s / 8., 1.); }`;
const UP = `uniform sampler2D t; uniform vec2 hp; varying vec2 vUv; void main(){ vec3 s = vec3(0.);
  s += texture2D(t, vUv + vec2(-hp.x * 2., 0.)).rgb; s += texture2D(t, vUv + vec2(hp.x * 2., 0.)).rgb; s += texture2D(t, vUv + vec2(0., hp.y * 2.)).rgb; s += texture2D(t, vUv + vec2(0., -hp.y * 2.)).rgb;
  s += texture2D(t, vUv + vec2(-hp.x, hp.y)).rgb * 2.; s += texture2D(t, vUv + vec2(hp.x, hp.y)).rgb * 2.; s += texture2D(t, vUv + vec2(hp.x, -hp.y)).rgb * 2.; s += texture2D(t, vUv + vec2(-hp.x, -hp.y)).rgb * 2.;
  gl_FragColor = vec4(s / 12., 1.); }`;
const COMP = `uniform sampler2D tS, tB; uniform float uTime, uBloom, uFade, uDim; uniform vec2 uRes; varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14), 0., 1.); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime) * 43758.5453); }
void main(){ vec2 c = vUv - .5; float r2 = dot(c, c);
  vec3 col = texture2D(tS, vUv).rgb; if (!(col.r + col.g + col.b >= 0.)) col = vec3(0.);
  col += texture2D(tB, vUv).rgb * uBloom;
  col = aces(col * 1.05);
  col *= 1. - r2 * 1.15;
  col = pow(col, vec3(1. / 2.2));
  col += (hash(vUv * uRes) - .5) * .028;
  col *= uFade * (1. - uDim * .55);
  gl_FragColor = vec4(col, 1.); }`;

/* ------------------------------------------------------------------ CSS */
const CSS = `
.c3{position:absolute;inset:0;overflow:hidden;background:#020307;color:#f3e6cf;font-family:"Martian Mono",ui-monospace,monospace;touch-action:none;-webkit-user-select:none;user-select:none}
.c3 canvas.c3-gl{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:crosshair}
.c3-nav{position:absolute;z-index:8;top:0;left:0;right:0;display:flex;align-items:center;gap:20px;padding:14px 22px;flex-wrap:wrap;background:linear-gradient(#020307d0,#02030700)}
.c3-nav .kx-b{font:400 10.5px "Martian Mono",monospace;letter-spacing:.14em;text-transform:uppercase;background:none;border:0;color:#f3e6cfb0;cursor:pointer;padding:6px 0}
.c3-nav .kx-b:hover,.c3-nav .kx-b:focus-visible{color:#ffd9a0;outline:none}
.c3-nav .kx-pos{font:300 10.5px "Martian Mono",monospace;letter-spacing:.2em;color:#ffc77a}
.c3-nav .kx-live{margin-left:auto;color:#020307;background:#ffd59a;padding:7px 12px;border-radius:2px}
.c3-nav .kx-live:hover{background:#fff1d8;color:#020307}
.c3-title{position:absolute;z-index:5;left:28px;top:64px;pointer-events:none;max-width:560px}
.c3-title h2{margin:0;font:italic 400 clamp(64px,8.4vw,132px)/.82 "Instrument Serif",serif;letter-spacing:-.025em;color:#fff1dc;text-shadow:0 0 40px #ffb45a40}
.c3-title p{margin:14px 0 0;font:400 12px/1.65 "Martian Mono",monospace;color:#f3e6cfc8;max-width:440px}
.c3-hook{position:absolute;z-index:5;left:50%;top:27%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;white-space:nowrap}
.c3-hook b{display:block;font:300 clamp(40px,6.6vw,96px)/1 "Martian Mono",monospace;letter-spacing:-.04em;color:#fff3df;font-variant-numeric:tabular-nums;text-shadow:0 0 50px #ffb45a66}
.c3-hook span{display:block;margin-top:14px;font:italic 400 clamp(20px,2.6vw,34px)/1.1 "Instrument Serif",serif;color:#ffd59acc}
.c3-facts{position:absolute;z-index:5;right:24px;top:62px;text-align:right;pointer-events:none;font:300 10px/1.9 "Martian Mono",monospace;letter-spacing:.08em;color:#f3e6cf90}
.c3-facts b{color:#ffd59a;font-weight:400}
.c3-rail{position:absolute;z-index:6;left:28px;right:28px;bottom:22px;display:flex;align-items:flex-end;gap:22px;flex-wrap:wrap}
.c3-steps{display:flex;gap:18px;font:400 10px "Martian Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:#f3e6cf55}
.c3-steps span{transition:color .4s}
.c3-steps span.on{color:#ffd59a}
.c3-steps span.done{color:#f3e6cfa0}
.c3-act{display:flex;gap:8px;margin-left:auto;flex-wrap:wrap}
.c3-btn{font:400 10.5px "Martian Mono",monospace;letter-spacing:.1em;text-transform:uppercase;background:#0a0d14b0;color:#f3e6cf;border:1px solid #f3e6cf40;padding:10px 14px;cursor:pointer;border-radius:2px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.c3-btn:hover,.c3-btn:focus-visible{border-color:#ffd59a;color:#ffe4bd;outline:none}
.c3-btn.pri{background:#ffd59a;color:#020307;border-color:#ffd59a}
.c3-btn.pri:hover{background:#fff1d8;color:#020307}
.c3-btn[disabled]{opacity:.35;pointer-events:none}
.c3-status{position:absolute;z-index:5;left:50%;bottom:118px;transform:translateX(-50%);font:italic 400 22px/1.2 "Instrument Serif",serif;color:#fff1dcd8;white-space:nowrap;pointer-events:none;text-shadow:0 0 18px #000,0 0 4px #000;transition:opacity .5s}
.c3-model{position:absolute;z-index:5;right:24px;bottom:74px;font:300 9.5px "Martian Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:#f3e6cf80;pointer-events:none}
.c3-labels{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}
.c3-lab{position:absolute;left:0;top:0;font:400 9.5px "Martian Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:#f3e6cfb8;white-space:nowrap;transition:opacity .4s;will-change:transform;text-shadow:0 0 8px #000}
.c3-lab.rev{width:300px;white-space:normal;text-transform:none;letter-spacing:.02em;font-size:11px;line-height:1.5;color:#ffd8cf;background:#14040399;border-left:2px solid #ff4a36;padding:7px 10px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.c3-lab.rev b{color:#ff6b55;font-weight:500;letter-spacing:.12em;text-transform:uppercase;font-size:9.5px;display:block}
.c3-lab.score{font:300 30px "Martian Mono",monospace;letter-spacing:-.02em;color:#fff1dc;text-transform:none}
.c3-lab.score small{display:block;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:#f3e6cf90}
.c3-sheet{position:absolute;z-index:9;left:24px;bottom:84px;width:min(760px,calc(100% - 48px));display:none;grid-template-columns:1fr 1fr;gap:16px;padding:18px;background:#05070cf0;border:1px solid #ffd59a40;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-sizing:border-box}
.c3-sheet.on{display:grid}
.c3-sheet h4{margin:0 0 8px;font:400 10px "Martian Mono",monospace;letter-spacing:.16em;text-transform:uppercase;color:#ffd59a}
.c3-sheet textarea{width:100%;box-sizing:border-box;height:150px;resize:vertical;background:#0b0e16;border:1px solid #f3e6cf26;color:#fff1dc;font:400 14px/1.7 "Newsreader",Georgia,serif;padding:8px 10px;outline:none;-webkit-user-select:text;user-select:text}
.c3-sheet textarea:focus{border-color:#ffd59a}
.c3-sheet p{grid-column:1/-1;margin:0;font:300 10.5px/1.7 "Martian Mono",monospace;color:#f3e6cfa8}
.c3-sheet .row{grid-column:1/-1;display:flex;gap:8px;justify-content:flex-end}
.c3-case{position:absolute;inset:0;z-index:10;overflow-y:auto;display:none;background:#020307c8;backdrop-filter:blur(18px) saturate(.8);-webkit-backdrop-filter:blur(18px) saturate(.8);-webkit-user-select:text;user-select:text;touch-action:pan-y}
.c3-case.on{display:block;animation:c3in .6s cubic-bezier(.2,.8,.2,1) both}
@keyframes c3in{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
.c3-case .c3-x{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:14px 28px;background:linear-gradient(#020307,#02030700)}
.c3-case .c3-x span{font:400 10px "Martian Mono",monospace;letter-spacing:.2em;text-transform:uppercase;color:#ffd59a}
.c3 .kx-read{max-width:1180px;margin:0 auto;padding:10px 40px 120px;column-count:2;column-gap:56px;column-rule:1px solid #ffd59a22;color:#efe3cf}
.c3 .kx-head{column-span:all;padding:30px 0 34px;margin-bottom:30px;border-bottom:1px solid #ffd59a40}
.c3 .kx-kind{margin:0;font:400 10px "Martian Mono",monospace;letter-spacing:.2em;text-transform:uppercase;color:#ffd59a}
.c3 .kx-title{margin:10px 0 8px;font:italic 400 clamp(64px,9vw,128px)/.85 "Instrument Serif",serif;color:#fff1dc}
.c3 .kx-lede{margin:0;font:400 22px/1.4 "Newsreader",Georgia,serif;max-width:820px;color:#f3e6cf}
.c3 .kx-sec{margin:0 0 30px}
.c3 .kx-h{margin:0 0 12px;font:400 10px "Martian Mono",monospace;letter-spacing:.22em;text-transform:uppercase;color:#ffb45a;break-after:avoid}
.c3 .kx-p,.c3 .kx-ul li{font:400 16.5px/1.62 "Newsreader",Georgia,serif;margin:0 0 10px;color:#e9dcc6}
.c3 .kx-ul{margin:0;padding-left:18px}
.c3 .kx-bt{margin:0 0 4px;font:italic 400 23px/1.15 "Instrument Serif",serif;color:#fff1dc}
.c3 .kx-block,.c3 .kx-dec,.c3 .kx-eval,.c3 .kx-step,.c3 .kx-num{break-inside:avoid}
.c3 .kx-block,.c3 .kx-dec,.c3 .kx-eval,.c3 .kx-step{margin:0 0 18px}
.c3 .kx-steps{list-style:none;margin:0;padding:0}
.c3 .kx-sn{float:left;margin:4px 12px 0 0;font:300 11px "Martian Mono",monospace;color:#ffb45a}
.c3 .kx-trade{color:#cdbfa8}
.c3 .kx-p em{font-style:normal;font:400 9.5px "Martian Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:#ffb45a}
.c3 .kx-d{font:400 10px "Martian Mono",monospace;letter-spacing:.12em;color:#ffb45a}
.c3 .kx-nums{display:grid;gap:16px}
.c3 .kx-num{border-top:1px solid #ffd59a33;padding-top:8px}
.c3 .kx-v{display:block;font:300 34px/1.1 "Martian Mono",monospace;letter-spacing:-.03em;color:#fff1dc}
.c3 .kx-l{display:block;font:400 15px/1.45 "Newsreader",Georgia,serif;color:#e0d2bb}
.c3 .kx-stack{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:6px}
.c3 .kx-stack li{font:300 10.5px "Martian Mono",monospace;border:1px solid #f3e6cf2a;padding:4px 8px;color:#e9dcc6}
.c3 .kx-links{display:flex;flex-direction:column;align-items:flex-start;gap:8px}
.c3 .kx-link{font:400 16px "Newsreader",Georgia,serif;background:none;border:0;border-bottom:1px solid #ffd59a66;color:#ffe4bd;padding:2px 0;cursor:pointer}
.c3 .kx-link:hover,.c3 .kx-link:focus-visible{color:#fff;border-color:#fff;outline:none}
.c3.dim .c3-title,.c3.dim .c3-rail,.c3.dim .c3-status,.c3.dim .c3-facts,.c3.dim .c3-labels,.c3.dim .c3-model{opacity:0!important;pointer-events:none}
.c3-title,.c3-rail,.c3-status,.c3-facts,.c3-labels,.c3-model{transition:opacity .6s}
@media (max-width:760px){
  .c3-nav{gap:14px;padding:10px 14px}.c3-nav .kx-src,.c3-nav .kx-prev,.c3-nav .kx-next{display:none}.c3-nav .kx-live{padding:6px 9px}
  .c3-title{left:16px;right:16px;top:52px;bottom:auto}.c3-title h2{font-size:54px}.c3-title p{font-size:10px;margin-top:8px;max-width:330px}
  .c3-facts{display:none}.c3-model{right:auto;left:0;width:100%;text-align:center;bottom:112px;font-size:8.5px}
  .c3-rail{left:10px;right:10px;bottom:12px;gap:10px}.c3-steps{display:none}.c3-act{margin-left:0;width:100%;gap:6px}
  .c3-btn{flex:1 1 30%;padding:11px 6px;font-size:9px;text-align:center}
  .c3-status{bottom:130px;font-size:17px;white-space:normal;width:88%;text-align:center}
  .c3-sheet{left:10px;right:10px;width:auto;bottom:120px;grid-template-columns:1fr;padding:14px}.c3-sheet textarea{height:92px}
  .c3 .kx-read{column-count:1;padding:6px 18px 90px}.c3-case .c3-x{padding:12px 16px}
  .c3-lab.rev{width:200px;font-size:10px}.c3-lab.score{font-size:22px}
}`;

/* ------------------------------------------------------------------ canvas text */
function canvasTex(w, hgt, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = hgt;
  const g = cv.getContext('2d'); draw(g, w, hgt);
  const tx = new THREE.CanvasTexture(cv); tx.anisotropy = 4; tx.minFilter = THREE.LinearMipmapLinearFilter;
  tx.userData.redraw = (fn) => { g.clearRect(0, 0, w, hgt); fn(g, w, hgt); tx.needsUpdate = true; };
  return tx;
}
function fit(g, text, maxW, size, fam, weight = 400) {
  let s = size; g.font = `${weight} ${s}px ${fam}`;
  while (g.measureText(text).width > maxW && s > 10) { s -= 2; g.font = `${weight} ${s}px ${fam}`; }
  return s;
}
const MONO = '"Martian Mono", ui-monospace, monospace', SERIF = '"Newsreader", Georgia, serif';

/* ------------------------------------------------------------------ sound (WebAudio, after first gesture) */
function makeSound() {
  const S = { ctx: null, muted: false, m: null, wet: null };
  S.init = () => {
    if (S.ctx) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const a = S.ctx = new AC(); S.m = a.createGain(); S.m.gain.value = S.muted ? 0 : 0.85; S.m.connect(a.destination);
    const len = a.sampleRate * 2.8, ir = a.createBuffer(2, len, a.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    const conv = a.createConvolver(); conv.buffer = ir; S.wet = a.createGain(); S.wet.gain.value = 0.42; S.wet.connect(conv); conv.connect(S.m);
    // the drone: the market breathing
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = 3;
    const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 140; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    const dg = a.createGain(); dg.gain.setValueAtTime(0, a.currentTime); dg.gain.linearRampToValueAtTime(0.055, a.currentTime + 4);
    for (const [f, t] of [[55, 'sawtooth'], [82.6, 'triangle'], [110.3, 'sawtooth'], [164.8, 'sine']]) { const o = a.createOscillator(); o.type = t; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 12; o.connect(lp); o.start(); }
    lp.connect(dg); dg.connect(S.m); dg.connect(S.wet);
    S.hum = a.createGain(); S.hum.gain.value = 0; const ho = a.createOscillator(); ho.frequency.value = 196; const ho2 = a.createOscillator(); ho2.frequency.value = 293.7; ho.connect(S.hum); ho2.connect(S.hum); ho.start(); ho2.start(); S.hum.connect(S.m); S.hum.connect(S.wet);
  };
  const now = () => S.ctx.currentTime;
  S.tone = (f, dur, type = 'sine', vol = 0.1, at = 0, f2 = 0) => {
    if (!S.ctx) return; const a = S.ctx, o = a.createOscillator(), g = a.createGain(), t = now() + at;
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(S.m); g.connect(S.wet); o.start(t); o.stop(t + dur + 0.05);
  };
  S.noise = (dur, type, f, vol, at = 0, f2 = 0, q = 1) => {
    if (!S.ctx) return; const a = S.ctx, n = a.createBufferSource(), b = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const fl = a.createBiquadFilter(), g = a.createGain(), t = now() + at; fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.buffer = b; n.connect(fl); fl.connect(g); g.connect(S.m); g.connect(S.wet); n.start(t);
  };
  S.beam = (v) => { if (S.ctx) S.hum.gain.setTargetAtTime(v * 0.03, now(), 0.15); };
  S.whoosh = () => { S.noise(1.3, 'bandpass', 220, 0.22, 0, 2400, 2.5); S.tone(98, 1.3, 'sine', 0.08, 0, 196); };
  S.unfold = () => { [392, 523.3, 659.3, 784].forEach((f, i) => S.tone(f, 0.7, 'triangle', 0.035, i * 0.05)); };
  S.lock = () => { S.noise(0.06, 'highpass', 4000, 0.12); S.tone(146.8, 0.25, 'square', 0.04); S.tone(880, 0.9, 'sine', 0.08, 0.01); S.tone(1318.5, 1.2, 'sine', 0.04, 0.02); };
  S.half = () => { S.noise(0.05, 'highpass', 2500, 0.06); S.tone(587.3, 0.6, 'triangle', 0.05); S.tone(554.4, 0.6, 'triangle', 0.035, 0.08); };
  S.miss = () => { S.tone(392, 1.4, 'sine', 0.045, 0, 130); S.noise(1.2, 'lowpass', 900, 0.04, 0, 200); };
  S.pulse = () => { S.tone(65.4, 1.4, 'sine', 0.16); S.tone(130.8, 1.0, 'triangle', 0.04); };
  S.send = () => { S.noise(0.5, 'bandpass', 600, 0.06, 0, 3000, 4); };
  S.settle = () => { [523.3, 659.3, 784, 1046.5].forEach((f, i) => S.tone(f, 1.2, 'sine', 0.05, i * 0.07)); };
  S.red = () => { S.tone(233, 0.5, 'sawtooth', 0.035); S.tone(246.9, 0.5, 'sawtooth', 0.035); };
  S.crack = () => { S.noise(0.35, 'highpass', 1400, 0.4); S.noise(0.9, 'bandpass', 3200, 0.12, 0.04, 800, 3); S.tone(82.4, 0.6, 'square', 0.07, 0, 41); [2637, 3136, 2349, 3520].forEach((f, i) => S.tone(f, 0.25, 'sine', 0.02, 0.05 + i * 0.045)); };
  S.restore = () => { S.tone(440, 0.8, 'sine', 0.06); S.tone(659.3, 1.0, 'sine', 0.04, 0.06); };
  S.mute = (v) => { S.muted = v; if (S.ctx) S.m.gain.setTargetAtTime(v ? 0 : 0.85, now(), 0.05); };
  S.close = () => { try { S.ctx && S.ctx.close(); } catch (e) { /* closed */ } S.ctx = null; };
  return S;
}

/* ================================================================== the world */
export default {
  async mount(root, ctx) {
    const L = life();
    fonts(L, 'family=Instrument+Serif:ital@0;1&family=Martian+Mono:wght@300;400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400');
    style(L, CSS);
    const it = ctx.item, REDUCED = !!ctx.reduced;
    const MANUAL = window.__CX_MANUAL === true;
    const TOUCH = !!ctx.isTouch || matchMedia('(pointer: coarse)').matches;
    const D = (s) => (REDUCED ? 0 : s);
    const snd = makeSound();
    let alive = true;
    const fontsReady = Promise.race([Promise.all([document.fonts.load('400 40px "Martian Mono"'), document.fonts.load('400 40px "Newsreader"'), document.fonts.load('italic 400 40px "Instrument Serif"')]), new Promise((r) => setTimeout(r, 1800))]).catch(() => {});

    /* ---------- DOM */
    const box = h('div.c3');
    const canvas = h('canvas.c3-gl', { attrs: { 'aria-label': 'The Proof Field: job postings as points of light around a résumé. Drag to aim the beam, tap the field to read a posting.', role: 'img' } });
    const nav = controls(L, ctx, 'c3-nav');
    const labels = h('div.c3-labels');
    const hookN = h('b', { text: '0' }), hook = h('div.c3-hook', hookN, h('span', { text: 'posting rows collected. One résumé.' }));
    const title = h('div.c3-title', h('h2', { text: 'Conxto' }), h('p', { text: it.line }));
    
    const facts = h('div.c3-facts',
      h('div', h('b', { text: '1,061,623' }), ' posting rows collected · 15 Oct 2026'),
      h('div', h('b', { text: TOUCH ? 'one point ≈ four rows' : 'one point = one row' }), ' · warm = live'),
      h('div', h('b', { text: '5 + 2' }), ' agents and reviewers, one memory'));
    const stepNames = ['read the field', 'check each requirement', 'rewrite', 'revert what it can’t prove'];
    const steps = h('div.c3-steps', stepNames.map((s, i) => h('span', { text: String(i + 1).padStart(2, '0') + ' ' + s })));
    const status = h('div.c3-status', { text: '' });
    const model = h('div.c3-model', { text: 'A working model of the idea, not the product' });
    const bRead = h('button.c3-btn.pri', { text: 'Read a posting', attrs: { type: 'button', 'data-qa': 'read' } });
    const bRw = h('button.c3-btn', { text: 'Ask for rewrites', attrs: { type: 'button', 'data-qa': 'rewrite', disabled: '' } });
    const bEdit = h('button.c3-btn', { text: 'Your lines', attrs: { type: 'button', 'data-qa': 'edit' } });
    const bCase = h('button.c3-btn', { text: 'Case file', attrs: { type: 'button', 'data-qa': 'case' } });
    const bSnd = h('button.c3-btn', { text: 'Sound: on', attrs: { type: 'button', 'aria-pressed': 'false', 'data-qa': 'sound', title: 'Sound starts on your first tap' } });
    const rail = h('div.c3-rail', steps, h('div.c3-act', bRead, bRw, bEdit, bCase, bSnd));
    const taR = h('textarea', { attrs: { 'aria-label': 'Résumé lines, one per line (up to 8)', spellcheck: 'false', 'data-qa': 'resume' } }); taR.value = RESUME;
    const taP = h('textarea', { attrs: { 'aria-label': 'Requirements, one per line (up to 7)', spellcheck: 'false', 'data-qa': 'posting' } }); taP.value = POSTING;
    const bRun = h('button.c3-btn.pri', { text: 'Run it on these lines', attrs: { type: 'button', 'data-qa': 'run' } });
    const bShut = h('button.c3-btn', { text: 'Close', attrs: { type: 'button' } });
    const sheet = h('div.c3-sheet', { attrs: { role: 'dialog', 'aria-label': 'Your résumé and requirement lines' } },
      h('div', h('h4', { text: 'Résumé · one line each' }), taR),
      h('div', h('h4', { text: 'Requirements · one per line' }), taP),
      h('p', { text: 'The rules, exactly: a requirement is met when every one of its words appears in one résumé line, partial when some do, missing when none do. A rewrite is reverted if it adds a number or a named term the résumé does not contain. The candidate rewrites are scripted, honest and inflated in turn, to show both outcomes.' }),
      h('div.row', bShut, bRun));
    const caseX = h('button.c3-btn', { text: 'Back to the field', attrs: { type: 'button', 'data-qa': 'case-close' } });
    const caseEl = h('div.c3-case', { attrs: { role: 'dialog', 'aria-label': 'Conxto case file' } }, h('div.c3-x', h('span', { text: 'Case file · Conxto' }), caseX), reading(ctx));
    if (!ctx.reduced) for (const el of [title, rail, facts]) el.style.opacity = '0';
    box.append(canvas, labels, hook, title, facts, status, model, rail, sheet, caseEl, nav);
    root.append(box);

    /* ---------- renderer + post */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: MANUAL });
    renderer.setClearColor(0x020307, 1);
    const DPR = Math.min(window.devicePixelRatio || 1, TOUCH ? 2 : 1.5);
    renderer.setPixelRatio(DPR);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 3000);
    const disposables = [];
    const keep = (x) => { disposables.push(x); return x; };
    const rtScene = keep(new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: true, samples: 4 }));
    const rtB = [0, 1, 2, 3, 4].map(() => keep(new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: false })));
    const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const fsGeo = keep(new THREE.PlaneGeometry(2, 2));
    const fsMesh = new THREE.Mesh(fsGeo); fsMesh.frustumCulled = false; const fsScene = new THREE.Scene(); fsScene.add(fsMesh);
    const pm = (fs, uni) => keep(new THREE.ShaderMaterial({ vertexShader: PV, fragmentShader: fs, uniforms: uni, depthTest: false, depthWrite: false }));
    const mBright = pm(BRIGHT, { t: { value: null } });
    const mDown = pm(DOWN, { t: { value: null }, hp: { value: new THREE.Vector2() } });
    const mUp = pm(UP, { t: { value: null }, hp: { value: new THREE.Vector2() } });
    const mComp = pm(COMP, { tS: { value: null }, tB: { value: null }, uTime: { value: 0 }, uBloom: { value: 1.15 }, uFade: { value: 0 }, uDim: { value: 0 }, uRes: { value: new THREE.Vector2() } });
    const pass = (mat, target) => { fsMesh.material = mat; renderer.setRenderTarget(target); renderer.render(fsScene, fsCam); };
    let W = 1, H = 1, PORTRAIT = false;

    /* ---------- the field: every posting row a point */
    const N = TOUCH ? 265406 : 1061623;
    const LIVE = 110457 / 1061623; // live pool by midday, 15 Oct 2026
    const fGeo = keep(new THREE.BufferGeometry());
    {
      const pos = new Float32Array(N * 3), w = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const stream = Math.random() < 0.42; const o = i * 3;
        pos[o] = stream ? Math.floor(Math.random() * 22) : 99;
        pos[o + 1] = Math.random();
        const g = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
        pos[o + 2] = stream ? g * 6 : Math.random() * 2 - 1;
        w[i] = Math.random();
      }
      fGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      fGeo.setAttribute('aW', new THREE.BufferAttribute(w, 1));
      fGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 600);
    }
    const fMat = keep(new THREE.ShaderMaterial({
      vertexShader: FIELD_V, fragmentShader: FIELD_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uSize: { value: TOUCH ? 0.4 : 0.26 }, uGain: { value: TOUCH ? 1.7 : 1 }, uLive: { value: LIVE }, uBeamOn: { value: 0 }, uBeamCos: { value: Math.cos(0.05) }, uScale: { value: 400 }, uIntro: { value: 0 }, uBeamO: { value: new THREE.Vector3() }, uBeamDir: { value: new THREE.Vector3(0, 0, -1) } },
    }));
    const field = new THREE.Points(fGeo, fMat); field.frustumCulled = false; field.renderOrder = 0; scene.add(field);

    /* ---------- the rig: everything at the centre */
    const rig = new THREE.Group(); rig.position.y = 40; scene.add(rig);
    const SW = 7.2, SH = 4.6, TW = 3.0, TH = 0.5;
    const quadGeo = keep(new THREE.PlaneGeometry(1, 1));
    const glowMat = (col, op = 1) => keep(new THREE.ShaderMaterial({ vertexShader: QUAD_V, fragmentShader: GLOW_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uColor: { value: col.clone() }, uOp: { value: op } } }));
    // the beacon: from orbit, your résumé is the warm star at the centre
    const beacon = new THREE.Mesh(quadGeo, glowMat(new THREE.Color(1.6, 1.05, 0.55), 1)); beacon.renderOrder = 1; rig.add(beacon);

    // résumé slab
    let resumeLines = splitLines(RESUME, 8), shown = resumeLines.slice(), lineMark = [];
    const slabTex = keep(canvasTex(2048, 1308, () => {}));
    const lineGlow = new Array(8).fill(0), lineCol = Array.from({ length: 8 }, () => new THREE.Vector3(1, 0.8, 0.5)), lineV = new Array(8).fill(-1);
    const slabU = { uTex: { value: slabTex }, uTime: { value: 0 }, uOp: { value: 1 }, uGhost: { value: 0 }, uLG: { value: lineGlow }, uLC: { value: lineCol }, uLY: { value: lineV }, uLH: { value: 0.05 } };
    const slabMat = keep(new THREE.ShaderMaterial({ vertexShader: QUAD_V, fragmentShader: SLAB_F, transparent: true, depthWrite: false, uniforms: slabU }));
    const ghostMat = keep(new THREE.ShaderMaterial({ vertexShader: QUAD_V, fragmentShader: SLAB_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { ...slabU, uGhost: { value: 1 }, uOp: { value: 0.8 } } }));
    const slab = new THREE.Mesh(quadGeo, slabMat); slab.scale.set(SW, SH, 1); slab.renderOrder = 5; rig.add(slab);
    for (const z of [-0.22, -0.44]) { const gm = new THREE.Mesh(quadGeo, ghostMat); gm.position.z = z; gm.renderOrder = 4; slab.add(gm); }
    const spacing = () => Math.min(0.62, (SH - 1.5) / Math.max(resumeLines.length, 1));
    const lineY = (i) => SH / 2 - 1.12 - i * spacing();
    function drawSlab() {
      slabTex.userData.redraw((g, w) => {
        const ppu = w / SW;
        g.fillStyle = '#fff'; g.textBaseline = 'middle';
        g.font = `400 34px ${MONO}`; g.globalAlpha = 0.62; g.fillText('RÉSUMÉ', 70, 92);
        g.textAlign = 'right'; g.fillText(resumeLines.length + ' LINES · WHAT YOU CAN PROVE', w - 70, 92); g.textAlign = 'left';
        g.globalAlpha = 0.25; g.fillRect(70, 140, w - 140, 2); g.globalAlpha = 1;
        resumeLines.forEach((_, i) => {
          const y = (SH / 2 - lineY(i)) * ppu; const txt = shown[i] || '';
          g.globalAlpha = 0.45; g.font = `300 26px ${MONO}`; g.fillText(String(i + 1).padStart(2, '0'), 70, y);
          g.globalAlpha = 1; const s = fit(g, txt, w - 250, Math.round(spacing() * ppu * 0.36), SERIF);
          g.font = `400 ${s}px ${SERIF}`; g.fillText(txt, 150, y);
          const mk = lineMark[i];
          if (mk) { g.font = `400 20px ${MONO}`; g.globalAlpha = 0.75; g.fillText(mk, 150, y + spacing() * ppu * 0.36); g.globalAlpha = 1; }
        });
      });
      for (let i = 0; i < 8; i++) lineV[i] = i < resumeLines.length ? (lineY(i) + SH / 2) / SH : -1;
      slabU.uLH.value = spacing() / SH * 0.55;
    }
    drawSlab(); fontsReady.then(() => { if (alive) drawSlab(); });

    // the beam
    const beamGeo = keep(new THREE.CylinderGeometry(1, 0.02, 1, 48, 1, true)); beamGeo.translate(0, 0.5, 0);
    const beamMat = keep(new THREE.ShaderMaterial({ vertexShader: QUAD_V, fragmentShader: BEAM_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uOp: { value: 0 }, uTime: { value: 0 } } }));
    const beam = new THREE.Mesh(beamGeo, beamMat); beam.renderOrder = 2; rig.add(beam);
    const BEAM_LEN = 260; let beamLen = BEAM_LEN;
    const aim = new THREE.Vector3(-0.8, -0.4, -0.7).normalize(), aimGoal = aim.clone();

    // memory core + agents (5 specialists, 2 reviewers)
    const core = new THREE.Group(); rig.add(core);
    const ringMat = keep(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.1, 0.6), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    const ring1 = new THREE.Mesh(keep(new THREE.TorusGeometry(1.0, 0.012, 6, 180)), ringMat), ring2 = new THREE.Mesh(keep(new THREE.TorusGeometry(0.62, 0.008, 6, 140)), ringMat);
    core.add(ring1, ring2);
    const coreGlow = new THREE.Mesh(quadGeo, glowMat(new THREE.Color(1.4, 0.95, 0.55), 0)); coreGlow.scale.setScalar(2.2); core.add(coreGlow);
    const AG = [['strategist', 1], ['identity', 1], ['market', 1], ['application', 1], ['operations', 1], ['reviewer', 0], ['reviewer', 0]];
    const TR = 64, agN = AG.length * TR;
    const agGeo = keep(new THREE.BufferGeometry());
    const agPos = new Float32Array(agN * 3), agSize = new Float32Array(agN), agCol = new Float32Array(agN * 3);
    agGeo.setAttribute('position', new THREE.BufferAttribute(agPos, 3)); agGeo.setAttribute('aSize', new THREE.BufferAttribute(agSize, 1)); agGeo.setAttribute('aCol', new THREE.BufferAttribute(agCol, 3));
    agGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
    const agMat = keep(new THREE.ShaderMaterial({ vertexShader: SPRITE_V, fragmentShader: SPRITE_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uScale: { value: 400 } } }));
    const agents = new THREE.Points(agGeo, agMat); agents.frustumCulled = false; agents.renderOrder = 9; core.add(agents);
    const agHist = AG.map(() => Array.from({ length: TR }, () => new THREE.Vector3()));
    const agP = AG.map(() => new THREE.Vector3());
    const agLab = AG.map(([n]) => { const e = h('div.c3-lab', { text: n }); e.style.opacity = '0'; labels.append(e); return e; });
    const coreLab = h('div.c3-lab', { style: { 'text-align': 'center' } }, h('div', { text: 'one memory', style: { color: '#ffd59a' } }), h('div', { text: '5 specialists · strategist, identity, market,' }), h('div', { text: 'application, operations · 2 reviewers' })); coreLab.style.opacity = '0'; labels.append(coreLab);
    const AGS = { on: 0, conv: 0 };

    /* ---------- transient things: tiles, ribbons, strips, flashes */
    const live = new Set();
    function dropObj(o) {
      rig.remove(o);
      o.traverse((m) => { if (m.geometry && m.geometry !== quadGeo) m.geometry.dispose(); });
      const mat = o.material || (o.userData && o.userData.mat);
      if (mat) { const tx = mat.uniforms && mat.uniforms.uTex && mat.uniforms.uTex.value; if (tx && tx !== slabTex) tx.dispose(); if (!disposables.includes(mat)) mat.dispose(); }
    }
    function tileMesh(w, hh, draw, color, fill = 0.82) {
      const tx = canvasTex(1024, Math.round(1024 * hh / w), draw);
      const m = new THREE.ShaderMaterial({ vertexShader: QUAD_V, fragmentShader: TILE_F, transparent: true, depthWrite: false, uniforms: { uTex: { value: tx }, uColor: { value: color.clone() }, uOp: { value: 0 }, uFill: { value: fill }, uGlow: { value: 0 }, uAspect: { value: w / hh } } });
      const mesh = new THREE.Mesh(quadGeo, m); mesh.scale.set(w, hh, 1); mesh.renderOrder = 7; mesh.userData.tx = tx; live.add(mesh); rig.add(mesh); return mesh;
    }
    function ribbon(color, half) {
      const m = new THREE.ShaderMaterial({ vertexShader: QUAD_V, fragmentShader: RIB_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uColor: { value: color.clone() }, uOp: { value: 0 }, uTime: { value: 0 }, uHalf: { value: half ? 1 : 0 } } });
      const mesh = new THREE.Mesh(quadGeo, m); mesh.renderOrder = 6; mesh.userData.rib = true; live.add(mesh); rig.add(mesh); return mesh;
    }
    function setRibbon(r, a, b, wdt) { const dx = b.x - a.x, dy = b.y - a.y; r.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); r.scale.set(Math.max(Math.hypot(dx, dy), 0.001), wdt, 1); r.rotation.set(0, 0, Math.atan2(dy, dx)); }
    // comet + trail
    const CT = 46; const cGeo = keep(new THREE.BufferGeometry()); const cPos = new Float32Array(CT * 3), cSize = new Float32Array(CT), cCol = new Float32Array(CT * 3);
    cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3)); cGeo.setAttribute('aSize', new THREE.BufferAttribute(cSize, 1)); cGeo.setAttribute('aCol', new THREE.BufferAttribute(cCol, 3)); cGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 400);
    const comet = new THREE.Points(cGeo, agMat); comet.frustumCulled = false; comet.renderOrder = 8; comet.visible = false; rig.add(comet);
    const cHist = Array.from({ length: CT }, () => new THREE.Vector3());
    const cometAt = (p, sz) => {
      cHist.unshift(cHist.pop().copy(p));
      for (let i = 0; i < CT; i++) { cPos[i * 3] = cHist[i].x; cPos[i * 3 + 1] = cHist[i].y; cPos[i * 3 + 2] = cHist[i].z; const f = 1 - i / CT; cSize[i] = sz * (i === 0 ? 1 : 0.4 * f); cCol[i * 3] = 1.7 * f + 0.2; cCol[i * 3 + 1] = 1.3 * f + 0.15; cCol[i * 3 + 2] = 0.85 * f + 0.25; }
      cGeo.attributes.position.needsUpdate = true; cGeo.attributes.aSize.needsUpdate = true; cGeo.attributes.aCol.needsUpdate = true;
    };
    const flashes = [];
    let clock = 0;
    function burst(p, col, size = 1.6, dur = 0.7) {
      const m = new THREE.Mesh(quadGeo, new THREE.ShaderMaterial({ vertexShader: QUAD_V, fragmentShader: GLOW_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uColor: { value: col.clone() }, uOp: { value: 0 } } }));
      m.position.copy(p); m.position.z += 0.05; m.renderOrder = 10; rig.add(m); live.add(m);
      flashes.push({ m, t0: clock, dur: Math.max(dur, 0.01), size });
    }

    /* ---------- layout per viewport */
    const LY = { card: new THREE.Vector3(), core: new THREE.Vector3() };
    function dockPos(ri, li, k, state) {
      if (PORTRAIT) return new THREE.Vector3(SW / 2 - TW / 2 - (state === 'partial' ? 0.45 : 0), -SH / 2 - 0.85 - ri * 0.7, 0.05);
      const x0 = SW / 2 + 0.35 + TW / 2 + k * (TW + 0.2);
      return new THREE.Vector3(state === 'partial' ? x0 + 0.9 : x0, lineY(li), 0.05);
    }
    const SHOT = {};
    function layout() {
      W = Math.max(1, root.clientWidth); H = Math.max(1, root.clientHeight); PORTRAIT = W / H < 0.9;
      renderer.setSize(W, H, false);
      const pw = Math.round(W * DPR), ph = Math.round(H * DPR);
      rtScene.setSize(pw, ph);
      let bw = Math.round(pw / 2), bh = Math.round(ph / 2);
      rtB.forEach((r) => { r.setSize(Math.max(1, bw), Math.max(1, bh)); bw >>= 1; bh >>= 1; });
      camera.aspect = W / H; camera.fov = PORTRAIT ? 54 : 40; camera.updateProjectionMatrix();
      const sc = ph / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
      fMat.uniforms.uScale.value = sc; agMat.uniforms.uScale.value = sc;
      mComp.uniforms.uRes.value.set(pw, ph);
      LY.card.set(PORTRAIT ? 0 : SW / 2 + 3.0, PORTRAIT ? -SH / 2 - 2.3 : 0.15, 1.2);
      LY.core.set(PORTRAIT ? 0 : -0.4, PORTRAIT ? SH / 2 + 1.9 : SH / 2 + 2.15, -0.8);
      core.position.copy(LY.core); core.scale.setScalar(PORTRAIT ? 0.85 : 1);
      if (PORTRAIT) {
        const d = (SW + 0.9) / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) / camera.aspect;
        SHOT.scan = [new THREE.Vector3(1.0, 1.4, d * 1.02), new THREE.Vector3(-0.2, -1.2, -12)];
        SHOT.dock = [new THREE.Vector3(0, -2.2, d), new THREE.Vector3(0, -2.2, 0)];
        SHOT.rewrite = [new THREE.Vector3(0, 0.3, d * 1.02), new THREE.Vector3(0, 0.3, 0)];
        SHOT.idle = [new THREE.Vector3(0, -0.6, d * 1.05), new THREE.Vector3(0, -0.6, 0)];
      } else {
        SHOT.scan = [new THREE.Vector3(6.4, 2.6, 12.5), new THREE.Vector3(-1.6, 0.2, -14)];
        SHOT.dock = [new THREE.Vector3(2.9, 0.4, 15.6), new THREE.Vector3(2.9, -0.2, 0)];
        SHOT.rewrite = [new THREE.Vector3(1.6, 1.9, 15.8), new THREE.Vector3(1.8, 1.1, 0)];
        SHOT.idle = [new THREE.Vector3(2.6, 0.9, 15.2), new THREE.Vector3(2.2, 0.3, 0)];
      }
    }

    /* ---------- clock + tweens */
    let runTok = 0;
    const tweens = new Set();
    const tween = (dur, fn, ease = E.io3) => new Promise((res) => { if (dur <= 0) { fn(1); res(); return; } tweens.add({ t0: clock, dur, fn, ease, res }); });
    const wait = (s) => tween(D(s), () => {}, E.lin);
    const CANCEL = { cancel: true };
    const guard = (tok) => { if (tok !== runTok || !alive) throw CANCEL; };

    /* ---------- camera choreography */
    const cam = { pos: new THREE.Vector3(0, 330, 560), look: new THREE.Vector3(), shot: 'scan', k: 1.5 };
    const goalPos = new THREE.Vector3(), goalLook = new THREE.Vector3(), L0 = new THREE.Vector3();
    const ptr = { x: 0, y: 0, sx: 0, sy: 0, down: false, moved: 0, last: -99 };
    let introT = REDUCED ? 99 : 0, introFast = 1; const INTRO = 5.4;
    function updateCamera(dt) {
      const [sp, sl] = SHOT[cam.shot] || SHOT.idle;
      goalPos.copy(sp).add(rig.position); goalLook.copy(sl).add(rig.position);
      ptr.sx += (ptr.x - ptr.sx) * (1 - Math.exp(-dt * 3)); ptr.sy += (ptr.y - ptr.sy) * (1 - Math.exp(-dt * 3));
      goalPos.x += ptr.sx * (PORTRAIT ? 0.6 : 1.4); goalPos.y += ptr.sy * 0.7;
      if (!REDUCED) { goalPos.x += Math.sin(clock * 0.13) * 0.35; goalPos.y += Math.sin(clock * 0.17) * 0.2; }
      if (introT < INTRO) {
        // fall from orbit, spiral down through the disc, settle on the résumé
        const u = clamp(introT / INTRO, 0, 1), e = E.io5(u);
        const a = lerp(-1.25, 0, E.io3(u));
        const r = lerp(560, Math.hypot(goalPos.x, goalPos.z), e), y = lerp(330, goalPos.y, Math.pow(e, 0.9));
        const base = Math.atan2(goalPos.x, goalPos.z);
        cam.pos.set(Math.sin(base + a) * r, y, Math.cos(base + a) * r);
        cam.look.lerpVectors(L0.set(0, 0, 0), goalLook, E.io3(clamp((introT - 2.0) / (INTRO - 2.0), 0, 1)));
      } else {
        const k = 1 - Math.exp(-dt * cam.k);
        cam.pos.lerp(goalPos, k); cam.look.lerp(goalLook, k);
      }
      camera.position.copy(cam.pos); camera.lookAt(cam.look);
    }

    /* ---------- HUD helpers */
    const setStatus = (t) => { status.textContent = t; };
    const setStep = (n) => [...steps.children].forEach((s, i) => { s.classList.toggle('on', i === n); s.classList.toggle('done', i < n); });
    const v3 = new THREE.Vector3(), pv = new THREE.Vector3();
    const tracked = [];
    function track(el, getter, dx = 0, dy = 0) { const t = { el, getter, dx, dy }; tracked.push(t); return t; }
    function project(p) { pv.copy(p).applyMatrix4(rig.matrixWorld).project(camera); return [(pv.x * 0.5 + 0.5) * W, (-pv.y * 0.5 + 0.5) * H, pv.z]; }
    let docked = [];

    /* ---------- reset */
    function clearTransient() {
      for (const o of live) dropObj(o);
      live.clear(); flashes.length = 0; docked = [];
      for (const t of tracked.splice(0)) t.el.remove();
      comet.visible = false;
    }
    function resetAll() {
      runTok++; tweens.clear(); clearTransient();
      resumeLines = splitLines(taR.value, 8); if (!resumeLines.length) resumeLines = splitLines(RESUME, 8);
      shown = resumeLines.slice(); lineMark = []; lineGlow.fill(0); drawSlab();
      AGS.on = 0; AGS.conv = 0; ringMat.opacity = 0; coreGlow.material.uniforms.uOp.value = 0; bRw.disabled = true; setStep(-1);
    }

    /* ---------- the sequence */
    let phase = 'intro', idleSince = 0, aimLive = -99;
    async function readPosting(userDir) {
      resetAll(); const tok = runTok; phase = 'read'; bRead.textContent = 'Read another'; idleSince = 1e9;
      try {
        cam.shot = 'scan'; setStep(0);
        setStatus('Reading the field · ' + (TOUCH ? 'about 265,000 points, four rows each' : '1,061,623 points, one per posting row'));
        await tween(D(0.6), (e) => { beamMat.uniforms.uOp.value = Math.max(beamMat.uniforms.uOp.value, e * 0.55); fMat.uniforms.uBeamOn.value = Math.max(fMat.uniforms.uBeamOn.value, e); snd.beam(e); }); guard(tok);
        if (!userDir) { // the machine sweeps when nobody aims
          const a0 = Math.atan2(aim.x, -aim.z);
          await tween(D(1.5), (e) => { const a = a0 + Math.sin(e * Math.PI * 1.25) * 0.55; aimGoal.set(Math.sin(a), -0.4 + Math.sin(e * 5) * 0.06, -Math.cos(a)).normalize(); }, E.io3); guard(tok);
        } else { aimGoal.copy(userDir); aim.copy(userDir); }
        await wait(0.25); guard(tok);
        const src = aim.clone().multiplyScalar(beamLen * 0.97);
        comet.visible = true; cHist.forEach((p) => p.copy(src));
        // anticipation: the chosen posting swells before it moves
        await tween(D(0.55), (e) => cometAt(src, 0.8 + E.back(e) * 2.4), E.o3); guard(tok);
        snd.whoosh(); setStatus('One posting, pulled in');
        const ctrl = src.clone().lerp(LY.card, 0.5).add(new THREE.Vector3(0, 9, 6));
        const q = new THREE.Vector3();
        await tween(D(1.45), (e) => { const u = 1 - e; q.copy(src).multiplyScalar(u * u).addScaledVector(ctrl, 2 * u * e).addScaledVector(LY.card, e * e); cometAt(q, 3.2 - e * 2.7); beamMat.uniforms.uOp.value = 0.55 * (1 - e); fMat.uniforms.uBeamOn.value = 1 - e; snd.beam(1 - e); if (e > 0.45) cam.shot = 'dock'; }, E.io2); guard(tok);
        comet.visible = false;
        // the posting unfolds
        const reqs = splitLines(taP.value, 7).length ? splitLines(taP.value, 7) : splitLines(POSTING, 7);
        const cw = 3.4, rowH = 0.5, ch = 0.78 + reqs.length * rowH;
        const card = tileMesh(cw, ch, (g, w) => {
          const ppu = w / cw; g.fillStyle = '#fff'; g.textBaseline = 'middle';
          g.font = `400 ${Math.round(0.12 * ppu)}px ${MONO}`; g.globalAlpha = 0.7; g.fillText('A POSTING · ' + reqs.length + ' REQUIREMENTS', 0.18 * ppu, 0.32 * ppu); g.globalAlpha = 0.2; g.fillRect(0.18 * ppu, 0.52 * ppu, w - 0.36 * ppu, 2); g.globalAlpha = 1;
          reqs.forEach((r, i) => { const y = (0.78 + i * rowH + rowH / 2) * ppu; const s = fit(g, r, w - 0.5 * ppu, Math.round(0.17 * ppu), MONO, 300); g.font = `300 ${s}px ${MONO}`; g.fillText(r, 0.18 * ppu, y); });
        }, C.cool, 0.9);
        card.position.copy(LY.card); card.scale.set(0.01, 0.01, 1);
        burst(LY.card, new THREE.Color(1.0, 1.1, 1.3), 3.4, 0.8); snd.unfold();
        await tween(D(0.75), (e) => { card.scale.set(cw * Math.max(0.01, E.back(e)), ch * Math.max(0.01, Math.min(1, e * 1.6)), 1); card.material.uniforms.uOp.value = Math.min(1, e * 2); }, E.lin); guard(tok);
        setStatus(reqs.length + ' requirements, each checked against your lines'); setStep(1);
        await wait(0.55); guard(tok);
        // split into requirement tiles
        const res = check(resumeLines, reqs);
        const drawTile = (txt, state) => (g, w, hh) => {
          const ppu = w / TW; g.fillStyle = '#fff'; g.textBaseline = 'middle';
          g.font = `500 ${Math.round(0.1 * ppu)}px ${MONO}`; g.globalAlpha = state ? 1 : 0.5; g.fillText(state ? state.toUpperCase() : 'CHECKING', 0.16 * ppu, hh / 2);
          const cx = 0.16 * ppu + g.measureText('PARTIAL').width + 0.2 * ppu; g.globalAlpha = 1;
          const s = fit(g, txt, w - cx - 0.14 * ppu, Math.round(0.18 * ppu), MONO, 400); g.font = `400 ${s}px ${MONO}`; g.fillText(txt, cx, hh / 2);
        };
        const tiles = res.map((r, i) => {
          const m = tileMesh(TW, TH, drawTile(r.req, ''), C.cool, 0.9);
          m.position.set(card.position.x, card.position.y + ch / 2 - (0.78 + i * rowH + rowH / 2), card.position.z + 0.02);
          m.userData.r = r; m.userData.from = m.position.clone(); return m;
        });
        await tween(D(0.45), (e) => { card.material.uniforms.uOp.value = 1 - e; tiles.forEach((t) => { t.material.uniforms.uOp.value = e; }); }); guard(tok);
        card.visible = false;
        // anticipation: the tiles lift and fan before they dock
        await tween(D(0.6), (e) => tiles.forEach((t, i) => { const a = (i - (tiles.length - 1) / 2); t.position.set(t.userData.from.x + e * 0.5, t.userData.from.y + a * 0.2 * e, t.userData.from.z + e * (1.3 + Math.abs(a) * 0.25)); t.rotation.y = -a * 0.12 * e; }), E.io3); guard(tok);
        // dock, one by one
        const perLine = new Map(); let proven = 0;
        const scoreLab = h('div.c3-lab.score', { text: '0 / ' + res.length }); scoreLab.append(h('small', { text: 'requirements proven' })); labels.append(scoreLab);
        track(scoreLab, () => (PORTRAIT ? v3.set(-SW / 2, -SH / 2 - 0.2, 0) : v3.set(-SW / 2, SH / 2 + 0.15, 0)), 0, PORTRAIT ? 8 : -58);
        for (let i = 0; i < tiles.length; i++) {
          const t = tiles[i], r = t.userData.r; const k = perLine.get(r.line) || 0; if (r.state !== 'missing') perLine.set(r.line, k + 1);
          const from = t.position.clone(); const ry = t.rotation.y;
          const col = r.state === 'met' ? C.met : r.state === 'partial' ? C.part : C.miss;
          t.userData.tx.userData.redraw(drawTile(r.req, r.state));
          const c0 = t.material.uniforms.uColor.value.clone();
          if (r.state === 'missing') {
            // nothing on the résumé proves it: it drifts back into the market
            const away = new THREE.Vector3(4 + Math.random() * 5, -2 - Math.random() * 3, -16 - Math.random() * 10);
            snd.miss();
            tween(D(2.8), (e) => { t.position.lerpVectors(from, away, E.i3(e) * 0.85 + e * 0.15); t.rotation.z = e * 0.9; t.rotation.y = ry + e * 1.4; t.material.uniforms.uColor.value.lerpColors(c0, C.miss, Math.min(1, e * 3)); t.material.uniforms.uOp.value = 1 - E.i3(e); }, E.lin);
            await wait(0.5); guard(tok); continue;
          }
          const to = dockPos(i, r.line, k, r.state);
          const rib = ribbon(col, r.state === 'partial');
          await tween(D(0.62), (e) => { t.position.lerpVectors(from, to, e); t.position.z += Math.sin(e * Math.PI) * 0.6; t.rotation.y = ry * (1 - e); t.rotation.z = (r.state === 'partial' ? -0.06 : 0) * e; t.material.uniforms.uColor.value.lerpColors(c0, col, e); }, E.io3); guard(tok);
          const li = r.line, ly = lineY(li);
          let a, b, contact;
          if (PORTRAIT) { const x = SW / 2 + 0.16 + i * 0.07; a = new THREE.Vector3(x, ly, 0.04); b = new THREE.Vector3(x, to.y + TH / 2, 0.04); contact = new THREE.Vector3(SW / 2, ly, 0.05); }
          else { a = new THREE.Vector3(SW / 2 - 0.05, ly, 0.04); b = new THREE.Vector3(to.x - TW / 2, to.y, 0.04); contact = b.clone(); }
          setRibbon(rib, a, b, PORTRAIT ? 0.045 : 0.07);
          if (r.state === 'met') { proven += 1; snd.lock(); burst(contact, new THREE.Color(1.4, 1.2, 0.9), 2.6, 0.6); }
          else { proven += 0.5; snd.half(); burst(contact, new THREE.Color(1.2, 0.7, 0.3), 1.7, 0.6); }
          scoreLab.firstChild.textContent = proven + ' / ' + res.length;
          lineCol[li].set(col.r, col.g, col.b); const g0 = lineGlow[li];
          tween(D(0.9), (e) => { lineGlow[li] = Math.max(g0, (r.state === 'met' ? 1 : 0.55) * (1 + (1 - e) * 1.5)); t.material.uniforms.uGlow.value = (1 - e) * 1.5; }, E.o3);
          tween(D(0.5), (e) => { rib.material.uniforms.uOp.value = e; });
          docked.push(t, rib);
          await wait(0.3); guard(tok);
        }
        await wait(0.6); guard(tok);
        const met = res.filter((r) => r.state === 'met').length, part = res.filter((r) => r.state === 'partial').length, miss = res.length - met - part;
        setStatus(`${met} met · ${part} partial · ${miss} missing · the fit is capped by what is proven`);
        bRw.disabled = false; phase = 'docked'; idleSince = clock;
        if (!userDir) { await wait(1.4); guard(tok); await rewritePhase(tok); }
      } catch (e) { if (e !== CANCEL) throw e; }
    }

    // a rewrite strip is a sheet of shards, so that it can break
    function strip(text, w, hh, color) {
      const tx = canvasTex(2048, Math.round(2048 * hh / w), (g, cw, ch) => { g.fillStyle = '#fff'; g.textBaseline = 'middle'; const s = fit(g, text, cw - 200, Math.round(ch * 0.44), SERIF); g.font = `400 ${s}px ${SERIF}`; g.fillText(text, 100, ch / 2); });
      const mat = new THREE.ShaderMaterial({ vertexShader: QUAD_V, fragmentShader: TILE_F, transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uTex: { value: tx }, uColor: { value: color.clone() }, uOp: { value: 0 }, uFill: { value: 1 }, uGlow: { value: 0 }, uAspect: { value: w / hh } } });
      const grp = new THREE.Group(); rig.add(grp);
      const cols = 9, rows = 2, pts = [];
      for (let y = 0; y <= rows; y++) for (let x = 0; x <= cols; x++) {
        const jx = x > 0 && x < cols ? (Math.random() - 0.5) * 0.7 / cols : 0, jy = y > 0 && y < rows ? (Math.random() - 0.5) * 0.6 / rows : 0;
        pts.push([x / cols + jx, y / rows + jy]);
      }
      const shards = []; const P = (x, y) => pts[y * (cols + 1) + x];
      const tri = (a, b, c) => {
        const cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3;
        const g = new THREE.BufferGeometry(); const pos = new Float32Array(9), uv = new Float32Array(6);
        [a, b, c].forEach((p, i) => { pos[i * 3] = (p[0] - cx) * w; pos[i * 3 + 1] = (p[1] - cy) * hh; pos[i * 3 + 2] = 0; uv[i * 2] = p[0]; uv[i * 2 + 1] = p[1]; });
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        const m = new THREE.Mesh(g, mat); m.renderOrder = 8; const home = new THREE.Vector3((cx - 0.5) * w, (cy - 0.5) * hh, 0); m.position.copy(home);
        m.userData = { home, vel: new THREE.Vector3((cx - 0.5) * 3.6 + (Math.random() - 0.5) * 1.8, (cy - 0.5) * 2.2 + Math.random() * 1.2, 1.6 + Math.random() * 3), spin: new THREE.Vector3((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 6) };
        grp.add(m); shards.push(m);
      };
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { tri(P(x, y), P(x + 1, y), P(x + 1, y + 1)); tri(P(x, y), P(x + 1, y + 1), P(x, y + 1)); }
      grp.userData = { shards, mat };
      live.add(grp); return grp;
    }

    async function rewritePhase(tokIn) {
      const tok = tokIn || runTok;
      try {
        if (phase !== 'docked') return; phase = 'rewrite'; bRw.disabled = true; idleSince = 1e9;
        cam.shot = 'rewrite'; setStep(2); setStatus('Five specialist agents and two reviewers, on one memory');
        snd.pulse();
        const dOp = docked.map((m) => m.material.uniforms.uOp.value);
        await tween(D(1.1), (e) => { AGS.on = e; ringMat.opacity = e * 0.9; coreGlow.material.uniforms.uOp.value = e * 0.12; docked.forEach((m, j) => { m.material.uniforms.uOp.value = dOp[j] * (1 - e * (PORTRAIT ? 0.96 : 0.78)); }); if (PORTRAIT) for (const t of tracked) if (t.el.classList.contains('score')) t.el.style.opacity = String(1 - e); }, E.o3); guard(tok);
        const lines = resumeLines.slice();
        for (let i = 0; i < lines.length; i++) {
          const cand = rewrite(lines[i], i); const added = judge(lines, cand);
          // the agents converge on the memory, then the proposal leaves the core
          await tween(D(0.5), (e) => { AGS.conv = Math.sin(e * Math.PI); coreGlow.material.uniforms.uOp.value = 0.12 + Math.sin(e * Math.PI) * 0.3; }, E.lin); guard(tok);
          snd.send(); setStatus('Line ' + (i + 1) + ': a rewrite is proposed');
          const s = strip(cand, SW - 0.4, spacing() * 0.86, C.met);
          const from = LY.core.clone(), to = new THREE.Vector3(0, lineY(i), 0.06), over = to.clone().setZ(1.6);
          s.position.copy(from); s.scale.setScalar(0.05);
          await tween(D(0.75), (e) => { s.position.lerpVectors(from, over, e); s.position.x += Math.sin(e * Math.PI) * 1.2; s.scale.setScalar(lerp(0.05, 1, E.o3(e))); s.userData.mat.uniforms.uOp.value = Math.min(1, e * 2); s.rotation.x = (1 - e) * 0.9; }, E.io3); guard(tok);
          await tween(D(0.32), (e) => { s.position.lerpVectors(over, to, e); }, E.back); guard(tok);
          if (!added.length) {
            // honest: it settles into the line
            snd.settle(); burst(new THREE.Vector3(SW / 2 - 0.3, lineY(i), 0.1), new THREE.Color(1.5, 1.2, 0.8), 2.2, 0.7);
            shown[i] = cand; lineMark[i] = 'REWRITTEN · NOTHING NEW CLAIMED'; drawSlab(); lineCol[i].set(1, 0.85, 0.55);
            setStatus('Line ' + (i + 1) + ': kept. It adds no number or name the résumé lacks');
            await tween(D(0.34), (e) => { s.scale.set(1, 1 - e, 1); s.position.z = lerp(0.06, 0.01, e); lineGlow[i] = 1.4 * (1 - e) + 0.5; }, E.i3); guard(tok);
            s.visible = false;
            await wait(0.3); guard(tok);
          } else {
            // inflated: it turns red, cracks, breaks apart, and the original line stays
            setStep(3); snd.red(); setStatus('Line ' + (i + 1) + ': this one claims more than the résumé shows');
            const mu = s.userData.mat.uniforms; const c0 = mu.uColor.value.clone();
            lineCol[i].set(1, 0.2, 0.1);
            await tween(D(0.55), (e) => { mu.uColor.value.lerpColors(c0, C.red, e); mu.uGlow.value = e * 1.5; lineGlow[i] = e * 0.9; s.position.x = Math.sin(e * 46) * 0.035 * e; }, E.o3); guard(tok);
            snd.crack(); burst(to.clone(), new THREE.Color(1.6, 0.35, 0.2), 5, 0.55);
            const shards = s.userData.shards;
            await tween(D(0.16), (e) => shards.forEach((m) => m.scale.setScalar(1 - e * 0.1)), E.o3); guard(tok);
            const why = h('div.c3-lab.rev'); why.append(h('b', { text: 'Reverted · line ' + String(i + 1).padStart(2, '0') }), 'Adds ' + added.map((a) => '“' + a + '”').join(', ') + ', which the résumé does not show. The original line stays.');
            if (PORTRAIT) for (const t of tracked.splice(0)) { if (t.el.classList.contains('rev')) t.el.remove(); else tracked.push(t); }
            labels.append(why);
            track(why, () => (PORTRAIT ? v3.set(-SW / 2 + 0.3, -SH / 2 + 1.25, 0.2) : v3.set(SW / 2 + 0.35, lineY(i), 0.2)), 0, PORTRAIT ? 4 : -22);
            lineMark[i] = 'ORIGINAL KEPT · REWRITE REVERTED'; drawSlab(); snd.restore();
            setStatus('Reverted: adds ' + added.map((a) => '“' + a + '”').join(', ') + '. The original stays');
            tween(D(1.9), (e) => { shards.forEach((m) => { const d = m.userData; m.position.copy(d.home).addScaledVector(d.vel, e * 1.6); m.position.y -= 4.5 * e * e; m.rotation.set(d.spin.x * e, d.spin.y * e, d.spin.z * e); m.scale.setScalar(0.9 * (1 - e * 0.4)); }); mu.uOp.value = 1 - E.i3(e); lineGlow[i] = 0.9 * (1 - e) + 0.35; lineCol[i].set(1, lerp(0.2, 0.92, e), lerp(0.1, 0.8, e)); }, E.o3);
            await wait(1.5); guard(tok);
          }
        }
        await wait(0.4); guard(tok);
        const kept = shown.filter((x, j) => x !== resumeLines[j]).length, rev = resumeLines.length - kept;
        setStatus(`Application prepared · ${kept} lines rewritten, ${rev} reverted to the original`);
        await tween(D(1.0), (e) => { AGS.on = 1 - e * 0.6; }, E.io3); guard(tok);
        phase = 'done'; idleSince = clock; setStep(4);
      } catch (e) { if (e !== CANCEL) throw e; }
    }

    /* ---------- input */
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    function dirFromPointer(cx, cy) {
      const r = canvas.getBoundingClientRect(); ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera); const far = ray.ray.at(160, new THREE.Vector3()); far.sub(rig.position);
      if (far.z > -20) far.z = -20; // aim into the market, never back at the viewer
      return far.normalize();
    }
    const firstGesture = () => { snd.init(); };
    L.on(box, 'pointerdown', firstGesture, { capture: true }); L.on(window, 'keydown', firstGesture);
    L.on(canvas, 'pointerdown', (e) => { ptr.down = true; ptr.moved = 0; ptr.last = clock; if (introT < INTRO) introFast = 3; });
    L.on(canvas, 'pointermove', (e) => {
      const r = canvas.getBoundingClientRect(); ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1; ptr.y = -(((e.clientY - r.top) / r.height) * 2 - 1); ptr.last = clock;
      if (ptr.down) ptr.moved += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
      if ((phase === 'idle' || phase === 'done' || phase === 'docked') && (!TOUCH || ptr.down)) { aimGoal.copy(dirFromPointer(e.clientX, e.clientY)); fMat.uniforms.uBeamOn.value = Math.max(fMat.uniforms.uBeamOn.value, 0.7); beamMat.uniforms.uOp.value = Math.max(beamMat.uniforms.uOp.value, 0.32); aimLive = clock; }
    });
    L.on(window, 'pointerup', (e) => {
      if (!ptr.down) return; ptr.down = false;
      if (e.target === canvas && ptr.moved < 12 && phase !== 'intro') readPosting(dirFromPointer(e.clientX, e.clientY));
    });
    L.on(bRead, 'click', () => readPosting(null));
    L.on(bRw, 'click', () => rewritePhase());
    L.on(bEdit, 'click', () => { sheet.classList.toggle('on'); if (sheet.classList.contains('on')) taR.focus(); });
    L.on(bShut, 'click', () => sheet.classList.remove('on'));
    L.on(bRun, 'click', () => { sheet.classList.remove('on'); readPosting(aim.clone()); });
    const openCase = (on) => { caseEl.classList.toggle('on', on); box.classList.toggle('dim', on); if (on) caseEl.scrollTop = 0; };
    L.on(bCase, 'click', () => openCase(true)); L.on(caseX, 'click', () => openCase(false));
    L.on(window, 'keydown', (e) => { if (e.key === 'Escape' && (caseEl.classList.contains('on') || sheet.classList.contains('on'))) { e.stopImmediatePropagation(); openCase(false); sheet.classList.remove('on'); } }, { capture: true });
    L.on(bSnd, 'click', () => { snd.init(); const m = !snd.muted; snd.mute(m); bSnd.textContent = m ? 'Sound: off' : 'Sound: on'; bSnd.setAttribute('aria-pressed', String(m)); });
    L.on(caseEl, 'pointerdown', (e) => e.stopPropagation());
    L.on(sheet, 'pointerdown', (e) => e.stopPropagation());

    /* ---------- frame */
    layout(); L.observe(root, () => { layout(); });
    const _up = new THREE.Vector3(0, 1, 0);
    let fieldT = 0;
    function frame(dt) {
      dt = Math.min(dt, 1 / 20);
      clock += dt; if (!REDUCED) fieldT += dt;
      if (introT < INTRO) introT += dt * introFast;
      if (!REDUCED) {
        const cnt = Math.round(1061623 * E.o5(clamp((introT - 0.2) / 2.6, 0, 1)));
        hookN.textContent = cnt.toLocaleString('en-US');
        hook.style.opacity = String(clamp((introT - 0.15) * 3, 0, 1) * (1 - clamp((introT - 3.5) * 1.6, 0, 1)));
        hook.style.transform = `translate(-50%,-50%) translateY(${(-introT * 6).toFixed(1)}px)`;
        title.style.opacity = String(clamp((introT - 3.9) * 1.5, 0, 1) * (phase === 'idle' || phase === 'intro' ? 1 : 0));
        if (introT < INTRO + 1) { rail.style.opacity = String(clamp((introT - 4.2) * 2, 0, 1)); facts.style.opacity = String(clamp((introT - 4.4) * 2, 0, 1)); }
      }
      mComp.uniforms.uFade.value = REDUCED ? 1 : clamp(introT * 1.4, 0, 1);
      fMat.uniforms.uIntro.value = REDUCED ? 1 : 0.15 + 0.85 * E.o3(clamp(introT / 1.4, 0, 1));
      if (introT >= INTRO && phase === 'intro') { phase = 'idle'; idleSince = clock; setStatus(TOUCH ? 'Drag to aim. Tap the field to read a posting' : 'Aim with the pointer. Click the field to read a posting'); }
      // autoplay when nobody touches it; loop calmly
      if (!REDUCED && phase === 'idle' && clock - idleSince > (MANUAL ? 0.3 : 1.6) && clock - ptr.last > 1.6) readPosting(null);
      if (!REDUCED && !MANUAL && phase === 'done' && clock - idleSince > 16 && clock - ptr.last > 10) readPosting(null);
      // tweens
      for (const tw of [...tweens]) { if (!tweens.has(tw)) continue; const e = clamp((clock - tw.t0) / tw.dur, 0, 1); tw.fn(tw.ease(e)); if (e >= 1) { tweens.delete(tw); tw.res(); } }
      // beam
      aim.lerp(aimGoal, 1 - Math.exp(-dt * 5)).normalize();
      beamLen = aim.y < -0.05 ? Math.min(BEAM_LEN, (rig.position.y + 2) / -aim.y) : BEAM_LEN;
      beam.quaternion.setFromUnitVectors(_up, aim); beam.scale.set(beamLen * 0.05, beamLen, beamLen * 0.05);
      if (phase !== 'read' && clock - aimLive > 1.2) { beamMat.uniforms.uOp.value *= Math.exp(-dt * 2); fMat.uniforms.uBeamOn.value *= Math.exp(-dt * 2); }
      fMat.uniforms.uBeamDir.value.copy(aim); fMat.uniforms.uBeamO.value.copy(rig.position);
      fMat.uniforms.uTime.value = fieldT + 40; beamMat.uniforms.uTime.value = clock; slabU.uTime.value = clock;
      // the beacon fades as you arrive
      const cd = camera.position.distanceTo(rig.position);
      beacon.scale.setScalar(clamp(cd * 0.06, 1.2, 40)); beacon.material.uniforms.uOp.value = clamp((cd - 30) / 120, 0, 1) * 1.3;
      beacon.quaternion.copy(camera.quaternion); coreGlow.quaternion.copy(camera.quaternion);
      slab.position.y = REDUCED ? 0 : Math.sin(clock * 0.6) * 0.03;
      for (let i = flashes.length - 1; i >= 0; i--) { const f = flashes[i]; const e = clamp((clock - f.t0) / f.dur, 0, 1); f.m.scale.setScalar(f.size * (0.4 + E.o3(e) * 0.9)); f.m.material.uniforms.uOp.value = (1 - e) * 1.6; f.m.quaternion.copy(camera.quaternion); if (e >= 1) { flashes.splice(i, 1); f.m.visible = false; } }
      for (const m of live) if (m.userData.rib) m.material.uniforms.uTime.value = clock;
      // agents: 5 specialists on inner orbits, 2 reviewers wider and counter-rotating; they converge on the memory
      ring1.rotation.set(Math.PI / 2 + Math.sin(clock * 0.3) * 0.25, clock * 0.2, 0); ring2.rotation.set(1.2 + clock * 0.15, clock * 0.4, 0);
      for (let a = 0; a < AG.length; a++) {
        const spec = AG[a][1], rr = (spec ? 1.25 + a * 0.09 : 2.0 + (a - 5) * 0.25) * (1 - AGS.conv * 0.75);
        const sp = (spec ? 1.1 - a * 0.08 : -0.7) * (REDUCED ? 0 : 1), ph = a * 2.399 + clock * sp;
        const tilt = spec ? 0.5 + a * 0.22 : 1.3 + a * 0.4;
        const p = agP[a].set(Math.cos(ph) * rr, Math.sin(ph) * rr * Math.cos(tilt) * 0.6, Math.sin(ph) * rr * Math.sin(tilt));
        const hst = agHist[a]; hst.unshift(hst.pop().copy(p));
        const c = spec ? [1.6, 1.15, 0.65] : [0.8, 1.15, 1.6];
        for (let i = 0; i < TR; i++) {
          const o = a * TR + i, f = 1 - i / TR;
          agPos[o * 3] = hst[i].x; agPos[o * 3 + 1] = hst[i].y; agPos[o * 3 + 2] = hst[i].z;
          agSize[o] = (i === 0 ? (spec ? 0.85 : 0.7) : (spec ? 0.3 : 0.24) * f) * AGS.on;
          agCol[o * 3] = c[0] * f; agCol[o * 3 + 1] = c[1] * f; agCol[o * 3 + 2] = c[2] * f;
        }
      }
      agGeo.attributes.position.needsUpdate = true; agGeo.attributes.aSize.needsUpdate = true; agGeo.attributes.aCol.needsUpdate = true;
      updateCamera(dt);
      rig.updateMatrixWorld(); camera.updateMatrixWorld();
      // labels follow their objects
      const showAg = false;
      for (let a = 0; a < AG.length; a++) { const el = agLab[a]; el.style.opacity = showAg ? '0.85' : '0'; if (showAg) { const [x, y] = project(v3.copy(agP[a]).multiplyScalar(core.scale.x).add(core.position)); el.style.transform = `translate(${Math.round(x + 10)}px,${Math.round(y - 6)}px)`; } }
      coreLab.style.opacity = AGS.on > 0.5 ? '0.9' : '0';
      if (AGS.on > 0.01) { const [x, y] = project(v3.copy(LY.core).add(PORTRAIT ? pv.set(0, 1.55, 0) : pv.set(2.3, 0.35, 0))); coreLab.style.transform = PORTRAIT ? `translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)` : `translate(${Math.round(x)}px,${Math.round(y)}px)`; coreLab.style.lineHeight = '1.7'; coreLab.style.textAlign = PORTRAIT ? 'center' : 'left'; }
      for (const t of tracked) { const [x, y, z] = project(t.getter()); t.el.style.transform = `translate(${Math.round(x + t.dx)}px,${Math.round(y + t.dy)}px)`; t.el.style.visibility = z < 1 ? 'visible' : 'hidden'; }
      // render: scene → bloom (dual filter) → composite
      renderer.setRenderTarget(rtScene); renderer.clear(); renderer.render(scene, camera);
      mBright.uniforms.t.value = rtScene.texture; pass(mBright, rtB[0]);
      for (let i = 1; i < rtB.length; i++) { mDown.uniforms.t.value = rtB[i - 1].texture; mDown.uniforms.hp.value.set(0.5 / rtB[i - 1].width, 0.5 / rtB[i - 1].height); pass(mDown, rtB[i]); }
      for (let i = rtB.length - 1; i > 0; i--) { mUp.uniforms.t.value = rtB[i].texture; mUp.uniforms.hp.value.set(0.5 / rtB[i].width, 0.5 / rtB[i].height); pass(mUp, rtB[i - 1]); }
      mComp.uniforms.tS.value = rtScene.texture; mComp.uniforms.tB.value = rtB[0].texture; mComp.uniforms.uTime.value = clock % 100;
      mComp.uniforms.uDim.value += ((caseEl.classList.contains('on') ? 1 : 0) - mComp.uniforms.uDim.value) * Math.min(1, dt * 4);
      pass(mComp, null);
    }

    if (REDUCED) {
      // calm still: no flight, no drift; the check runs instantly on request
      phase = 'idle'; cam.shot = 'idle'; hook.style.display = 'none';
      setStatus('Still view (reduced motion). Read a posting to run the check');
      cam.pos.copy(SHOT.idle[0]); cam.look.copy(SHOT.idle[1]);
    } else { title.style.opacity = '0'; rail.style.opacity = '0'; facts.style.opacity = '0'; }

    let last = performance.now();
    if (MANUAL) {
      window.__cxStep = (dt) => frame(dt);
      L.add(() => { delete window.__cxStep; });
      frame(1 / 30);
    } else {
      L.raf((t) => { const dt = (t - last) / 1000; last = t; frame(dt > 0 ? dt : 1 / 60); });
    }

    return () => {
      alive = false; runTok++; tweens.clear();
      L.dispose();
      snd.close();
      clearTransient();
      scene.traverse((o) => { if (o.geometry && o.geometry !== quadGeo) o.geometry.dispose(); });
      for (const d of disposables) { try { d.dispose(); } catch (e) { /* gone */ } }
      renderer.dispose(); renderer.forceContextLoss();
      root.replaceChildren();
    };
  },
};
