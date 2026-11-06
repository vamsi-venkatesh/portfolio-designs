// The world: one three.js space you fly through with the scroll. It opens on a black screen where the name
// types itself, then the world switches on around it: the sky lights, the ground draws out from the horizon and
// a vortex of light spins into the first portal. Each product is a station down the corridor: you pass through
// its portal (flash, shockwave, whoosh) and arrive among its real screens, framed as browser windows, with a
// living detail of that product around them. After the last station the world keeps moving behind skills,
// process and contact. Without WebGL the same content renders as a plain, readable page.
import * as THREE from "three";
// the standard open-source stack for scroll-driven WebGL sites:
//   postprocessing (pmndrs) — merged-pass bloom with a mipmap blur, cheap enough for phones
//   lenis (darkroom.engineering) — smooth scroll on top of native scrolling, synced to the render loop
//   detect-gpu (pmndrs) — classifies the visitor's GPU from public benchmarks, so quality is set per device
import { EffectComposer, RenderPass, EffectPass, BloomEffect, SMAAEffect } from "postprocessing";
import Lenis from "lenis";
import { getGPUTier } from "detect-gpu";
import { buildDetail } from "./details.js?v=10";
import * as sound from "./sound.js?v=9";

const S = window.SITE, B = window.BOARD, $ = (s) => document.querySelector(s);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const Q = new URLSearchParams(location.search);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const products = S.order.map((code) => { const f = B.flights.find((x) => x.flight === code); return { ...f, ...(S.copy[code] || {}) }; });
const N = products.length, D = 70;
const stationZ = (k) => -k * D;
const INTRO_Z = stationZ(1) + 14 + 100;
const host = (u) => { const x = new URL(u); return (x.host + x.pathname).replace(/\/$/, ""); };

const gpuTier = Q.has("tier") ? Promise.resolve({ tier: +Q.get("tier") }) : Promise.race([
  getGPUTier({ benchmarksURL: "https://cdn.jsdelivr.net/npm/detect-gpu@5.0.70/dist/benchmarks" }).catch(() => ({ tier: 2 })),
  new Promise((r) => setTimeout(() => r({ tier: 2, timeout: true }), 3000)),
]);

/* ================= DOM ================= */
const STATUS = { LIVE: "Live", BOARDING: "Live · launching soon", RESEARCH: "Research · paper only" };
const panels = products.map((f, idx) => {
  const p = el("article", "panel"); p.style.setProperty("--c", S.accent[f.flight]);
  let k = 0; const ln = (n) => { n.classList.add("ln"); n.style.setProperty("--k", k++); p.appendChild(n); return n; };
  const top = el("p", "p-top"); top.append(el("b", null, String(idx + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0")), el("span", null, S.kind[f.flight])); ln(top);
  ln(el("h2", "p-name", f.title));
  ln(el("p", "p-line", f.line));
  const ul = el("ul", "p-built"); f.built.slice(0, 3).forEach((b) => ul.appendChild(el("li", null, b))); ln(ul);
  const foot = el("div", "p-foot");
  const nums = el("div", "p-nums"); f.numbers.forEach(([n, l]) => { const d = el("div"); d.append(el("b", null, n), el("span", null, l)); nums.appendChild(d); });
  const a = el("a", "p-live"); a.href = f.links[0][1]; a.target = "_blank"; a.rel = "noopener";
  a.append(el("span", "dot"), el("span", null, "Open " + f.links[0][0]), el("span", "arr", "↗"));
  foot.append(nums, a); ln(foot);
  ln(el("p", "p-state", STATUS[f.status]));
  const fig = el("figure", "p-shot"); const im = el("img"); im.alt = f.title + ": " + f.shots[0][1]; im.loading = "lazy"; im.dataset.src = f.shots[0][0]; fig.append(im, el("figcaption", null, f.shots[0][1])); p.appendChild(fig);
  $("#panels").appendChild(p); return p;
});
const stationBtns = products.map((f, i) => {
  const b = el("button"); b.type = "button"; b.style.setProperty("--c", S.accent[f.flight]); b.setAttribute("aria-label", "Go to " + f.title);
  b.append(el("span", null, f.title), el("i")); b.addEventListener("click", () => goto(i + 1, true)); $("#stations").appendChild(b); return b;
});
const SKC = ["#8a7bff", "#5b8cff", "#38c6d9", "#7fe0b0"];
S.skills.forEach(([h, items], i) => {
  const c = el("div", "sk"); c.style.setProperty("--c", SKC[i]);
  c.append(el("p", "sk-n", String(i + 1).padStart(2, "0")), el("h3", null, h));
  const ul = el("ul"); items.forEach((x) => ul.appendChild(el("li", null, x))); c.appendChild(ul);
  c.addEventListener("pointermove", (e) => { const r = c.getBoundingClientRect(); c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px"); });
  $("#sk-grid").appendChild(c);
});
const steps = S.process.map(([h, p], i) => { const li = el("li", "step"); li.append(el("span", "st-n", String(i + 1).padStart(2, "0")), el("h3", null, h), el("p", null, p)); $("#steps").appendChild(li); return li; });
S.facts.forEach(([k, v]) => { const d = el("div"); d.append(el("dt", null, k), el("dd", null, v)); $("#facts").appendChild(d); });
const mail = $("#mail"); mail.href = "mailto:" + S.email; mail.textContent = S.email;
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
document.querySelectorAll(".sk, .skills h2, .facts div, .contact h2, .mail").forEach((n, i) => { n.classList.add("rise"); n.style.setProperty("--d", (i % 4) * 90 + "ms"); io.observe(n); });

// sound toggle
const sndBtn = $("#snd");
sound.onChange((s) => { sndBtn.classList.toggle("on", s.on); sndBtn.classList.toggle("live", s.running && s.on); sndBtn.querySelector("span").textContent = s.on ? "Sound on" : "Sound off"; sndBtn.setAttribute("aria-pressed", String(s.on)); });
sndBtn.addEventListener("click", (e) => { e.stopPropagation(); sound.toggle(); });

/* ================= intro: the name types itself ================= */
const nameA = $("#nameA"), nameB = $("#nameB"), roleEl = $("#role"), caret = $("#caret"), loadEl = $("#load"), loadPct = $("#loadpct");
$("#lede").textContent = S.intro;
let typingDone = false, skipTyping = false;
async function type(target, text, ms) {
  for (let i = 0; i < text.length; i++) {
    if (skipTyping) { target.textContent = text; return; }
    target.textContent = text.slice(0, i + 1); if (text[i] !== " ") sound.key(); await wait(ms * (0.6 + Math.random() * 0.8));
  }
}
async function typeIntro() {
  if (REDUCED || Q.has("f")) { nameA.textContent = S.name[0]; nameB.textContent = S.name[1]; roleEl.textContent = S.role; caret.remove(); typingDone = true; return; }
  await wait(600);
  await type(nameA, S.name[0], 95); nameB.after(caret); await wait(skipTyping ? 0 : 140);
  await type(nameB, S.name[1], 85); await wait(skipTyping ? 0 : 360);
  roleEl.after(caret); caret.classList.add("small");
  await type(roleEl, S.role, 24);
  typingDone = true;
  setTimeout(() => caret.classList.add("gone"), 1400);
}

/* ================= scroll → flight f (0 intro, 1..N stations, N+1 exit) ================= */
const world = $("#world");
const segVh = () => (innerWidth < 900 ? 120 : 140);
function sizeWorld() { world.style.height = (N + 1) * segVh() + 100 + "vh"; measure(); }
let SPAN = 1, PR_TOP = 0, PR_H = 1;
function measure() { SPAN = Math.max(1, world.offsetHeight - innerHeight); const pr = document.getElementById("process"); PR_TOP = pr.getBoundingClientRect().top + scrollY; PR_H = pr.offsetHeight; }
const worldSpan = () => SPAN;
let fTarget = 0, fs = 0;
function readScroll() { fTarget = clamp(scrollY / Math.max(1, worldSpan())) * (N + 1); if (fTarget > 0.03) skipTyping = true; }
function goto(f, smoothScroll) { const y = (f / (N + 1)) * worldSpan() + 2; if (window.__lenis) window.__lenis.scrollTo(y, { immediate: !smoothScroll || REDUCED, duration: 1.8 }); else scrollTo({ top: y, behavior: smoothScroll && !REDUCED ? "smooth" : "auto" }); }
addEventListener("scroll", readScroll, { passive: true });
addEventListener("load", () => { measure(); readScroll(); });
new ResizeObserver(() => measure()).observe(document.body);
addEventListener("pointerdown", () => (skipTyping = true), { passive: true });

/* ================= WebGL, or the plain page ================= */
let renderer = null;
if (!Q.has("nogl")) {
  try { renderer = new THREE.WebGLRenderer({ canvas: $("#gl"), antialias: false, powerPreference: "high-performance" }); if (!renderer.getContext()) renderer = null; }
  catch (e) { renderer = null; }
}
if (!renderer) {
  document.body.classList.add("no-gl", "ready", "booted");
  document.querySelectorAll(".p-shot img").forEach((im) => (im.src = im.dataset.src));
  typeIntro();
} else gpuTier.then((g) => (g.tier === 0 ? plainOnly(g) : startWorld(g)));
function plainOnly(g) { document.body.classList.add("no-gl", "ready", "booted"); document.querySelectorAll(".p-shot img").forEach((im) => (im.src = im.dataset.src)); window.__gpu = g; typeIntro(); }

function startWorld(gpu) {
  const TALL = () => innerWidth / innerHeight < 0.9;
  const MOBILE = innerWidth < 900 || matchMedia("(pointer: coarse)").matches;
  // Every device gets the same world and the same effects. The GPU tier only sets what the visitor can't see:
  // render resolution, the bloom's internal resolution, texture size, and particle count (fewer, larger
  // particles on weaker GPUs so the density looks the same).
  const T = clamp(gpu.tier || 2, 1, 3);
  const Q_ = { 3: { dpr: MOBILE ? 2 : 1.25, bloom: 0.4, tex: 1600, part: 0.8 }, 2: { dpr: MOBILE ? 1.5 : 1.25, bloom: 0.4, tex: 1600, part: 0.7 }, 1: { dpr: 1, bloom: 0.3, tex: 1200, part: 0.45 } }[T];
  window.__gpu = gpu;
  let DPR = Math.min(devicePixelRatio, Q_.dpr);
  const PSIZE = Math.sqrt(1 / Q_.part);
  renderer.setPixelRatio(DPR);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(new THREE.Color("#07070c"), 0.012);
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 500);
  const COLORS = [new THREE.Color("#7a6bff"), ...products.map((f) => new THREE.Color(S.accent[f.flight])), new THREE.Color("#7fe0b0")];
  const accent = new THREE.Color().copy(COLORS[0]);
  const TO_LIN = "gl_FragColor.rgb = pow(max(gl_FragColor.rgb, 0.), vec3(2.2));";   // these shaders are authored in display space
  let boot = REDUCED || Q.has("f") ? 1 : 0;

  /* ---- sky ---- */
  const skyU = { uTime: { value: 0 }, uA: { value: new THREE.Color() }, uB: { value: new THREE.Color() }, uAspect: { value: 1 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uProg: { value: 0 }, uBoot: { value: boot } };
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: skyU, depthWrite: false, depthTest: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }",
    fragmentShader: `
      varying vec2 vUv; uniform float uTime, uAspect, uProg, uBoot; uniform vec3 uA, uB; uniform vec2 uMouse;
      float h(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.-2.*f);
        return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x), mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x), f.y),
                   mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x), mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x), f.y), f.z); }
      float fbm(vec3 p){ float a = .5, s = 0.; for(int i=0;i<4;i++){ s += a*n3(p); p = p*2.03 + 7.1; a *= .5; } return s; }
      void main(){
        vec2 p = vec2((vUv.x - .5) * uAspect, vUv.y - .5);
        float t = uTime * .04 + uProg * .35;
        vec3 q = vec3(p * 1.5, t);
        float w = fbm(q + vec3(fbm(q + vec3(0., 0., 3.1)) * 1.4, 0., 0.) + .04);
        float curtain = smoothstep(.36, .92, w) * smoothstep(-.55, .35, p.y + .15 * sin(p.x * 2. + t * 3.));
        vec3 base = mix(vec3(.02, .02, .035), uB * .25, smoothstep(-.6, .5, p.y));
        vec3 col = base + uA * curtain * .85 + mix(uA, vec3(1.), .3) * pow(curtain, 3.) * .4;
        col += mix(uA, vec3(1.), .4) * exp(-pow((p.y + .02) * 9., 2.)) * .3;                         // horizon light
        col += uA * (1. - smoothstep(0., .55, distance(vUv, uMouse))) * .07;
        col *= 1. - .5 * dot(p * vec2(.8, 1.1), p * vec2(.8, 1.1));
        float st = step(.9975, h(vec3(floor(vUv * vec2(uAspect, 1.) * 420.), 3.))) * (.5 + .5 * sin(uTime * 2. + vUv.x * 90.));
        col += vec3(st) * .6 * smoothstep(-.1, .3, p.y);                                              // far stars
        gl_FragColor = vec4(col * uBoot, 1.); ${TO_LIN}
      }`,
  }));
  sky.frustumCulled = false; sky.renderOrder = -10; scene.add(sky);

  /* ---- dust ---- */
  const DUST = Math.round(6000 * Q_.part), Z0 = 80, Z1 = stationZ(N) - 120;
  const dustU = { uTime: { value: 0 }, uA: { value: accent }, uPx: { value: DPR }, uBoot: { value: boot } };
  {
    const pos = new Float32Array(DUST * 3), r = new Float32Array(DUST);
    for (let i = 0; i < DUST; i++) { pos[i * 3] = (Math.random() - 0.5) * 90; pos[i * 3 + 1] = (Math.random() - 0.5) * 50; pos[i * 3 + 2] = Z1 + Math.random() * (Z0 - Z1); r[i] = Math.random(); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("rnd", new THREE.BufferAttribute(r, 1));
    const dust = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float rnd; uniform float uTime, uPx; varying float vA; varying float vR;
        void main(){ vec3 p = position; p.y += sin(uTime * .3 + rnd * 40.) * .4; p.x += cos(uTime * .2 + rnd * 30.) * .3;
          vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
          float d = -mv.z; gl_PointSize = (1.2 + rnd * 2.6) * uPx * ${PSIZE.toFixed(3)} * (38. / d);
          vA = smoothstep(120., 20., d) * smoothstep(.5, 3., d) * (.35 + .65 * (.5 + .5 * sin(uTime * (1. + rnd * 2.) + rnd * 60.))); vR = rnd; }`,
      fragmentShader: `uniform vec3 uA; uniform float uBoot; varying float vA; varying float vR;
        void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .0, d); vec3 c = mix(vec3(1.), uA, vR * .8) * (1. + step(.93, vR) * 1.5);
          gl_FragColor = vec4(c, a * vA * uBoot); }`,
    }));
    dust.frustumCulled = false; scene.add(dust);
  }

  /* ---- speed streaks ---- */
  const STREAKS = Math.round(360 * Q_.part);
  const streakMat = new THREE.LineBasicMaterial({ color: new THREE.Color(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  {
    const pos = new Float32Array(STREAKS * 6);
    for (let i = 0; i < STREAKS; i++) { const a = Math.random() * Math.PI * 2, r = 5 + Math.random() * 22, z = Z1 + Math.random() * (Z0 - Z1), len = 4 + Math.random() * 10, x = Math.cos(a) * r * 1.6, y = Math.sin(a) * r * 0.8; pos.set([x, y, z, x, y, z + len], i * 6); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const s = new THREE.LineSegments(g, streakMat); s.frustumCulled = false; scene.add(s);
  }

  /* ---- ground: a fine grid that draws itself out from the horizon ---- */
  const gridU = { uA: { value: accent }, uCam: { value: new THREE.Vector3() }, uReveal: { value: boot } };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(320, Z0 - Z1 + 260), new THREE.ShaderMaterial({
    uniforms: gridU, transparent: true, depthWrite: false,
    vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
    fragmentShader: `varying vec3 vW; uniform vec3 uA, uCam; uniform float uReveal;
      float line(float x, float s, float w){ float g = abs(fract(x / s - .5) - .5) / (fwidth(x / s) * w); return 1. - min(g, 1.); }
      void main(){ float minor = max(line(vW.x, 1.5, 1.), line(vW.z, 1.5, 1.)), major = max(line(vW.x, 7.5, 1.4), line(vW.z, 7.5, 1.4));
        float d = distance(vW.xz, uCam.xz), edge = (1. - uReveal) * 160.;
        float reveal = uReveal > .999 ? 1. : smoothstep(edge - 6., edge + 6., d);
        float a = (minor * .055 + major * .17) * smoothstep(120., 6., d) * reveal;
        float front = uReveal > .999 ? 0. : exp(-pow((d - edge) / 3., 2.));
        a += smoothstep(80., 0., d) * .03 * reveal;
        gl_FragColor = vec4(mix(uA, vec3(1.), .2 + front * .6), a + front * .5); ${TO_LIN} }`,
  }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -8, (Z0 + Z1) / 2); scene.add(floor);

  /* ---- the intro world: a vortex of light spiralling into the first portal, a core glowing beyond it ---- */
  const RING1 = stationZ(1) + 32, VN = Math.round(11000 * Q_.part);
  const vortexU = { uTime: { value: 0 }, uOpacity: { value: 0 }, uA: { value: new THREE.Color("#7a6bff") }, uB: { value: new THREE.Color("#5b8cff") }, uPx: { value: DPR }, uR: { value: 11 } };
  {
    const g = new THREE.BufferGeometry(), p = new Float32Array(VN * 3), a = new Float32Array(VN * 3);
    for (let i = 0; i < VN; i++) { a[i * 3] = Math.random(); a[i * 3 + 1] = Math.random() * Math.PI * 2; a[i * 3 + 2] = Math.random(); }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("aSeed", new THREE.BufferAttribute(a, 3));
    const m = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: vortexU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec3 aSeed; uniform float uTime, uPx, uR; varying float vA; varying float vT;
        void main(){ float life = fract(aSeed.x - uTime * .045 * (.6 + aSeed.z));
          float r = mix(.08, 3.4, pow(life, 1.4)) * uR;
          float arm = floor(aSeed.z * 3.) * 2.094;
          float ang = aSeed.y * .35 + arm + log(r + 1.) * 2.3 - uTime * (.35 + 2.2 / (r + .6));
          float spread = (aSeed.z - .5) * r * .22;
          vec3 pos = vec3(cos(ang) * (r + spread), sin(ang) * (r + spread) * .82, -pow(1. - life, 3.) * 34.);
          vec4 mv = modelViewMatrix * vec4(pos, 1.); gl_Position = projectionMatrix * mv;
          gl_PointSize = (1. + aSeed.z * 2.8) * uPx * ${PSIZE.toFixed(3)} * (46. / max(2., -mv.z));
          vA = smoothstep(0., .08, life) * smoothstep(1., .75, life); vT = 1. - life; }`,
      fragmentShader: `uniform vec3 uA, uB; uniform float uOpacity; varying float vA; varying float vT;
        void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d);
          vec3 c = mix(uB, mix(uA, vec3(1.), .6), vT) * (1.2 + vT * 2.5);
          gl_FragColor = vec4(c, a * a * vA * uOpacity); }`,
    }));
    m.frustumCulled = false; m.position.z = RING1; scene.add(m);
  }
  const radial = (stops) => { const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"); const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); stops.forEach(([o, a]) => r.addColorStop(o, `rgba(255,255,255,${a})`)); g.fillStyle = r; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); };
  const glowTex = radial([[0, 0.9], [0.4, 0.28], [1, 0]]);
  const core = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: radial([[0, 1], [0.25, 0.35], [1, 0]]), color: new THREE.Color("#9fb0ff").multiplyScalar(2.5), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  core.position.z = RING1 - 20; scene.add(core);

  /* ---- screens as browser windows ---- */
  const TW = Q_.tex, BAR = Math.round(TW * 0.04), IH = Math.round(TW / 1.6), TH = BAR + IH, ASPECT = TW / TH;
  const ANISO = renderer.capabilities.getMaxAnisotropy();
  const imgCache = new Map();
  const loadImg = (src) => { if (!imgCache.has(src)) imgCache.set(src, new Promise((res) => { const im = new Image(); im.decoding = "async"; im.onload = () => res(im); im.onerror = () => res(null); im.src = src; })); return imgCache.get(src); };
  function windowTexture(img, url, tint) {
    const c = document.createElement("canvas"); c.width = TW; c.height = TH; const g = c.getContext("2d"), k = TW / 1280, R = 20 * k;
    g.save(); g.beginPath(); g.roundRect(0, 0, TW, TH, R); g.clip();
    g.fillStyle = "#15151b"; g.fillRect(0, 0, TW, BAR);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc((28 + i * 22) * k, BAR / 2, 6.5 * k, 0, 7); g.fill(); });
    g.fillStyle = "#24242c"; g.beginPath(); g.roundRect(TW / 2 - 260 * k, BAR * 0.22, 520 * k, BAR * 0.56, 8 * k); g.fill();
    g.fillStyle = tint; g.beginPath(); g.arc(TW / 2 - 236 * k, BAR / 2, 4 * k, 0, 7); g.fill();
    g.fillStyle = "#c2c2cc"; g.font = `500 ${17 * k}px Geist, system-ui, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(url, TW / 2 + 6 * k, BAR / 2 + 1);
    if (img) { g.imageSmoothingQuality = "high"; const s = TW / img.width, sh = Math.min(img.height, IH / s); g.drawImage(img, 0, 0, img.width, sh, 0, BAR, TW, sh * s); }
    g.restore();
    g.strokeStyle = "rgba(255,255,255,.2)"; g.lineWidth = 2 * k; g.beginPath(); g.roundRect(k, k, TW - 2 * k, TH - 2 * k, R); g.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; return t;
  }
  function thumbTexture(img) {
    const c = document.createElement("canvas"); c.width = 512; c.height = 320; const g = c.getContext("2d");
    g.beginPath(); g.roundRect(0, 0, 512, 320, 10); g.clip(); if (img) { g.imageSmoothingQuality = "high"; g.drawImage(img, 0, 0, img.width, Math.min(img.height, img.width / 1.6), 0, 0, 512, 320); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; return t;
  }
  function wordTexture(text) {
    const c = document.createElement("canvas"); c.width = 2048; c.height = 360; const g = c.getContext("2d");
    g.font = "400 300px 'Instrument Serif', Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 2.5; g.strokeText(text, 1024, 190);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  const BLANK = new THREE.DataTexture(new Uint8Array([30, 30, 36, 255]), 1, 1); BLANK.colorSpace = THREE.SRGBColorSpace; BLANK.needsUpdate = true;
  /* ---- stations ---- */
  const LAYOUT = {
    wide: [{ x: 3.8, y: 0, z: 0, w: 8.6, ry: -0.2, rx: 0.02 }, { x: 7.8, y: 3.3, z: -6, w: 6, ry: -0.34, rx: 0.04 }, { x: 3.4, y: -3.1, z: 2, w: 3.9, ry: -0.1, rx: -0.03 }],
    tall: [{ x: 0, y: -3.0, z: 0, w: 4.9, ry: -0.08, rx: 0.02 }, { x: 1.7, y: -1.2, z: -4, w: 3.6, ry: -0.25, rx: 0.03 }, { x: -1.5, y: -4.5, z: 2, w: 2.6, ry: 0.12, rx: -0.03 }],
  };
  const stations = [], clickable = [];
  products.forEach((f, i) => {
    const k = i + 1, col = new THREE.Color(S.accent[f.flight]), grp = new THREE.Group(); grp.position.z = stationZ(k); scene.add(grp);
    const ringZ = stationZ(k) + 32, hot = col.clone().multiplyScalar(2.6);
    const mk = (tube, op) => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, tube, 10, 200), new THREE.MeshBasicMaterial({ color: hot, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.z = ringZ; scene.add(m); return m; };
    const ring = mk(0.012, 1), ring2 = mk(0.045, 0.16), shock = mk(0.02, 0);
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: glowTex, color: col, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })); halo.position.z = ringZ; scene.add(halo);
    const word = new THREE.Mesh(new THREE.PlaneGeometry(64, 11.25), new THREE.MeshBasicMaterial({ map: BLANK, transparent: true, opacity: 0, depthWrite: false, color: col.clone().lerp(new THREE.Color("#fff"), 0.5) }));
    word.position.set(-4, 5, -34); grp.add(word);
    const shots = f.shots.slice(0, 3).map((sh, j) => {
      const mat = new THREE.MeshBasicMaterial({ map: BLANK, transparent: true, opacity: 0 });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1 / ASPECT), mat);
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, (1.5 / ASPECT) * 1.3), new THREE.MeshBasicMaterial({ map: glowTex, color: col, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      glow.position.z = -0.05; m.add(glow); grp.add(m);
      if (j === 0) { m.userData.href = f.links[0][1]; clickable.push(m); }
      return { m, mat, glow, src: sh[0], phase: Math.random() * 6 };
    });
    const detail = Q.has("nodetail") ? null : buildDetail(f.flight, S.accent[f.flight], DPR); if (detail) grp.add(detail.root);
    stations.push({ k, grp, col, ring, ring2, shock, shockT: 9, halo, ringZ, word, shots, f, detail, state: 0, R: 11 });
  });

  // the cloud of work you fly through in the intro: every product's screens, small, scattered
  const cloud = [];
  {
    let seed = 7; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    products.forEach((f, i) => {
      for (let n = 0; n < 2; n++) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1 / 1.6), new THREE.MeshBasicMaterial({ map: BLANK, transparent: true, opacity: 0 }));
        const side = (i + n) % 2 ? 1 : -1;
        m.userData = { base: new THREE.Vector3(side * (6 + r() * 9), (r() - 0.4) * 9, INTRO_Z - 26 - r() * 70), w: 2.4 + r() * 2.4, ry: -side * (0.3 + r() * 0.3), phase: r() * 6, src: f.shots[n % f.shots.length][0] };
        scene.add(m); cloud.push(m);
      }
    });
  }

  function layout() {
    const tall = TALL(), L = tall ? LAYOUT.tall : LAYOUT.wide;
    stations.forEach((s) => {
      s.shots.forEach((sh, j) => { sh.m.scale.setScalar(L[j].w); sh.base = L[j]; });
      s.R = tall ? 5.2 : 11; [s.ring, s.ring2, s.halo].forEach((m) => m.scale.setScalar(s.R));
      s.word.position.x = tall ? 0 : -4;
      if (s.detail) { s.detail.root.position.set(tall ? -5.5 : 0, tall ? -4.5 : 0, 0); s.detail.root.scale.setScalar(tall ? 0.62 : 1); }
    });
    vortexU.uR.value = tall ? 5.2 : 11;
    cloud.forEach((m) => { const u = m.userData; u.x = tall ? Math.sign(u.base.x) * (3.2 + Math.abs(u.base.x) * 0.2) : u.base.x; u.y0 = tall ? u.base.y - 3 : u.base.y; m.position.set(u.x, u.y0, u.base.z); m.scale.setScalar(u.w * (tall ? 0.7 : 1)); m.rotation.y = u.ry; });
  }

  // textures: stations near the camera are loaded, far ones released so GPU memory stays bounded
  const worker = typeof OffscreenCanvas !== "undefined" && window.Worker ? new Worker("texworker.js?v=14") : null, waiting = new Map(); let wid = 0;
  if (worker) worker.onmessage = (e) => { const cb = waiting.get(e.data.id); waiting.delete(e.data.id); if (cb) cb(e.data); };
  // resolves to a function that returns the finished texture (cheap: the drawing already happened)
  function buildWindow(src, url, tint) {
    if (!worker) return loadImg(src).then((img) => () => windowTexture(img, url, tint));
    return new Promise((res) => { const id = ++wid; waiting.set(id, (d) => {
      if (!d.bmp) { loadImg(src).then((img) => res(() => windowTexture(img, url, tint))); return; }
      res(() => { const t = new THREE.Texture(d.bmp); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; t.needsUpdate = true; return t; });
    }); worker.postMessage({ id, src: new URL(src, location.href).href, url, tint, TW, BAR, IH }); });
  }
  let pending = 0, done = 0; const jobs = [], jobT = []; window.__jobT = jobT;
  const track = (p) => { pending++; return p.then((v) => { done++; return v; }); };
  async function loadStation(s) {
    if (s.state) return; s.state = 1;
    const url = host(s.f.links[0][1]), tint = "#" + s.col.getHexString();
    // images decode off the main thread; each texture is then built and uploaded in its own frame, so arriving
    // at a station never stalls the flight
    await Promise.all(s.shots.map(async (sh) => {
      const make = await track(buildWindow(sh.src, url, tint));
      await new Promise((res) => jobs.push(() => { if (s.state === 1) { const t = make(); renderer.initTexture(t); sh.mat.map = t; sh.ready = true; } res(); }));
    }));
    if (s.state !== 1) return;
    if (!s.word.ready) await new Promise((res) => jobs.push(() => { const t = wordTexture(s.f.title); renderer.initTexture(t); s.word.material.map = t; s.word.ready = true; res(); }));
    s.state = 2;
  }
  function unloadStation(s) {
    if (s.state === 0) return; s.state = 0;
    s.shots.forEach((sh) => { if (sh.ready) { sh.ready = false; const t = sh.mat.map; sh.mat.map = BLANK; t.dispose(); } });
  }
  cloud.forEach((m) => track(loadImg(m.userData.src)).then((img) => { const t = thumbTexture(img); renderer.initTexture(t); m.material.map = t; m.userData.ready = true; }));

  /* ---- post: bloom on anything brighter than white (rings, vortex, details), never on the screens ---- */
  const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType });
  composer.addPass(new RenderPass(scene, camera));
  const bloomFx = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 1.0, luminanceSmoothing: 0.05, intensity: 1.15, radius: 0.72, resolutionScale: Q_.bloom });
  composer.addPass(new EffectPass(camera, bloomFx, new SMAAEffect()));
  const bloom = { get enabled() { return true; } };

  /* ---- input ---- */
  const mouse = new THREE.Vector2(0, 0), mouseS = new THREE.Vector2(0, 0), ray = new THREE.Raycaster();
  let hovering = null;
  addEventListener("pointermove", (e) => { mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); skyU.uMouse.value.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight); });
  renderer.domElement.addEventListener("click", () => { if (hovering) open(hovering.userData.href, "_blank", "noopener"); });

  function resize() {
    renderer.setPixelRatio(DPR); renderer.setSize(innerWidth, innerHeight, false); composer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    skyU.uAspect.value = innerWidth / innerHeight; sizeWorld(); readScroll(); layout();
  }
  addEventListener("resize", resize); resize();

  /* ---- camera path: hold at each station for the first third of its segment, then fly ---- */
  function camAt(f, tall, out) {
    const key = (k) => (k <= 0 ? [tall ? 0 : -21, 1.2, INTRO_Z] : k > N ? [0, 7, stationZ(N) - 46] : [tall ? 0 : 0.2, 0, stationZ(k) + (tall ? 15 : 14)]);
    const i = Math.floor(clamp(f, 0, N + 1 - 1e-6)), fr = f - i, e = fr - (Math.sin(fr * Math.PI * 2) / (Math.PI * 2)) * 0.78, a = key(i), b = key(i + 1);
    out.set(a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e + Math.sin(e * Math.PI) * 1.2, a[2] + (b[2] - a[2]) * e);
  }

  /* ---- frame ---- */
  const camPos = new THREE.Vector3(), prevPos = new THREE.Vector3(0, 1.2, INTRO_Z), look = new THREE.Vector3();
  const flash = $("#flash"), veil = $("#veil"), meter = $("#meter"), stNav = $("#stations"), cover = $("#cover"), intro = $("#intro");
  const prPin = $("#process"), prFill = $("#pr-fill"), prDot = $("#pr-dot"), trackEl = $("#steps");
  let tier = 0; const plainPage = () => { document.body.classList.add("no-gl", "booted"); document.querySelectorAll(".p-shot img").forEach((im) => (im.src = im.dataset.src)); renderer.setAnimationLoop(null); renderer.dispose(); if (lenis) lenis.destroy(); window.__lenis = null; measure(); };
  let lastNavOff = null, docH = 1, TRACK_X = 0; const measure2 = () => { docH = document.documentElement.scrollHeight; TRACK_X = Math.max(0, trackEl.scrollWidth - innerWidth + 40); }; addEventListener("resize", measure2); addEventListener("load", measure2); setTimeout(measure2, 500);
  let warp = 0, active = -1, last = performance.now(), t0 = last, prevCamZ = INTRO_Z + 46, arrive = 9, slow = 0, bootStart = -1, frames = 0;
  const dark = new THREE.Color("#1a2040"); let lastHex = "";
  const styleCache = new WeakMap();
  const set = (node, prop, val) => { let c = styleCache.get(node); if (!c) styleCache.set(node, (c = {})); if (c[prop] !== val) { c[prop] = val; node.style[prop] = val; } };

  const PROF = Q.has("perf"); window.__slow = [];
  const lenis = REDUCED ? null : new Lenis({ autoRaf: false, lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 }); window.__lenis = lenis;
  function frame(now) {
    if (lenis) lenis.raf(now);
    const T0 = performance.now(), mk = {};
    const raw = (now - last) / 1000, dt = Math.min(0.05, raw); last = now; const t = (now - t0) / 1000; frames++;
    // adaptive quality: if the device can't keep up, drop bloom, then resolution
    if (t > 1.5 && !document.hidden && !Q.has("hq") && raw < 5) { if (raw > 0.034) slow += raw; else slow = Math.max(0, slow - raw * 0.5); }
    if (slow > 1.5) { slow = 0; tier++;
      if (DPR > 1.01) { DPR = Math.max(1, DPR - 0.25); resize(); }
      else if (bloomFx.resolution.scale > 0.21) { bloomFx.resolution.scale = Math.max(0.2, bloomFx.resolution.scale - 0.1); }
      else if (DPR > 0.76) { DPR = 0.75; resize(); }
      else { plainPage(); return; } }

    // boot: the world switches on once the name has typed and the first screens are in
    if (bootStart < 0 && typingDone && (done >= pending || t > 8)) { bootStart = t; document.body.classList.add("booted"); }
    if (bootStart >= 0 && boot < 1) boot = clamp((t - bootStart) / 2.6);
    const be = easeOut(boot);
    if (boot < 1) { loadEl.classList.toggle("on", bootStart < 0 && typingDone); loadPct.textContent = Math.round((done / Math.max(1, pending)) * 100) + "%"; }
    set(cover, "opacity", (1 - smooth(0, 0.55, boot)).toFixed(3)); set(cover, "visibility", boot >= 1 ? "hidden" : "visible");

    fs += (fTarget - fs) * (REDUCED ? 1 : 1 - Math.pow(1e-7, dt));
    if (Math.abs(fTarget - fs) < 1e-4) fs = fTarget;
    const tall = TALL();
    camAt(fs, tall, camPos);
    camPos.z += (1 - be) * 46; camPos.y += (1 - be) * 3;
    mouseS.lerp(mouse, 1 - Math.pow(0.02, dt));
    const v = camPos.distanceTo(prevPos) / Math.max(dt, 1e-3); prevPos.copy(camPos);
    warp += (clamp(v / 90) * (boot >= 1 ? 1 : 0) - warp) * 0.12;
    arrive += dt;
    const roll = REDUCED ? 0 : 0.03 * Math.exp(-3 * arrive) * Math.sin(arrive * 9);
    camera.position.set(camPos.x + mouseS.x * 0.6, camPos.y + mouseS.y * 0.35 - Math.exp(-4 * arrive) * 0.35 * Math.sin(arrive * 6), camPos.z);
    const lk = 0.4 + 0.6 * (1 - smooth(0, 0.85, fs)); look.set(camPos.x * lk, camPos.y * 0.6 - (tall ? 0.6 : 0), camPos.z - 20); camera.lookAt(look); camera.rotateZ(roll);
    camera.fov = 45 + (REDUCED ? 0 : warp * 16); camera.updateProjectionMatrix();

    const ci = clamp(fs, 0, N + 1), c0 = Math.floor(ci), c1 = Math.min(N + 1, c0 + 1), cm = smooth(0.35, 0.95, ci - c0);
    accent.copy(COLORS[c0]).lerp(COLORS[c1], cm);
    skyU.uA.value.copy(accent); skyU.uB.value.copy(accent).lerp(dark, 0.6);
    skyU.uTime.value = t; skyU.uProg.value = fs; skyU.uBoot.value = 0.12 + 0.88 * be;
    dustU.uTime.value = t; dustU.uBoot.value = be;
    gridU.uCam.value.copy(camera.position); gridU.uReveal.value = be;
    streakMat.color.copy(accent).multiplyScalar(1.6); streakMat.opacity = warp * 0.8;
    if ((frames & 3) === 0) sound.speed(warp);
    const hex = "#" + accent.getHexString(); if (hex !== lastHex) { lastHex = hex; flash.style.setProperty("--accent", hex); meter.parentElement.style.setProperty("--accent", hex); }

    const introWorld = 1 - smooth(0.35, 0.8, fs);
    vortexU.uTime.value = t; vortexU.uOpacity.value = be * introWorld;
    core.material.opacity = be * introWorld * 0.9; core.scale.setScalar((tall ? 9 : 18) * (1 + 0.06 * Math.sin(t * 1.3)));

    mk.a = performance.now();
    stations.forEach((s) => { const d = Math.abs(s.k - fs); if (d < 2.3) loadStation(s); else if (d > 3.6) unloadStation(s); });
    if (jobs.length) { const j0 = performance.now(); jobs.shift()(); jobT.push(Math.round(performance.now() - j0)); }

    mk.b = performance.now();
    let flashA = 0;
    stations.forEach((s) => {
      const z = camera.position.z, d = z - s.ringZ;
      if (boot >= 1 && (prevCamZ - s.ringZ) * d < 0) { s.shockT = 0; arrive = 0; sound.whoosh(clamp(warp * 1.5 + 0.4, 0.4, 1)); }
      flashA = Math.max(flashA, Math.exp(-(d / 4) * (d / 4)) * 0.5 * be);
      s.shockT += dt; const u = clamp(s.shockT / 1.3);
      s.shock.scale.setScalar(s.R * (1 + u * 2.4)); s.shock.material.opacity = s.shockT < 1.3 ? Math.pow(1 - u, 2) : 0;
      s.ring.rotation.z = t * 0.15 + s.k; s.ring2.rotation.z = -t * 0.1;
      const near = clamp(1 - Math.abs(fs - s.k) / 1.2);
      s.ring.material.opacity = (0.18 + 0.82 * near) * be;
      s.ring2.scale.setScalar(s.R * (1 + Math.exp(-(d / 10) * (d / 10)) * 0.08)); s.ring2.material.opacity = 0.16 * be;
      s.halo.material.opacity = 0.12 * be;
      const show = smooth(0, 1, 1 - Math.abs(fs - s.k) / 0.9);
      s.shots.forEach((sh, j) => {
        const b = sh.base; if (!b) return;
        const lag = clamp(show * 1.4 - j * 0.18);
        sh.mat.opacity = sh.ready ? lag : 0;
        sh.glow.material.opacity = lag * (j === 0 ? 0.55 : 0.3) * (hovering === sh.m ? 1.7 : 1);
        const fl = REDUCED ? 0 : Math.sin(t * 0.7 + sh.phase) * 0.12, sx = tall ? 0.5 : 1;
        sh.m.position.set(b.x + (1 - lag) * (j === 1 ? 6 : j === 2 ? -3 : 2) * sx, b.y + fl + (1 - lag) * -2.5, b.z - (1 - lag) * 14);
        sh.m.rotation.set(b.rx + mouseS.y * 0.04, b.ry + mouseS.x * 0.06 + (1 - lag) * -0.5, (1 - lag) * 0.08);
      });
      s.word.material.opacity = s.word.ready ? 0.11 * show : 0;
      const dshow = smooth(0, 1, 1 - Math.abs(fs - s.k) / 1.25);
      if (s.detail) { s.detail.root.visible = dshow > 0.001; if (s.detail.root.visible) s.detail.update(t, dt, dshow); }
    });
    prevCamZ = camera.position.z;
    cloud.forEach((m) => { const u = m.userData, dz = camera.position.z - m.position.z; m.material.opacity = m.userData.ready ? smooth(120, 50, dz) * smooth(-2, 10, dz) * 0.95 * be * (tall ? smooth(0.05, 0.3, fs) : 1) : 0; m.position.y = u.y0 + Math.sin(t * 0.5 + u.phase) * 0.3; m.rotation.z = Math.sin(t * 0.3 + u.phase) * 0.03; });
    set(flash, "opacity", REDUCED ? "0" : flashA.toFixed(2)); set(flash, "visibility", flashA > 0.005 && !REDUCED ? "visible" : "hidden");

    mk.c = performance.now();
    ray.setFromCamera(mouse, camera); const hit = ray.intersectObjects(clickable, false)[0];
    hovering = hit && hit.object.material.opacity > 0.6 ? hit.object : null; renderer.domElement.style.cursor = hovering ? "pointer" : "";

    // DOM
    const introA = 1 - smooth(0.02, 0.28, fs);
    set(intro, "opacity", introA.toFixed(3)); set(intro, "transform", `translateY(${(-(1 - introA) * 60).toFixed(1)}px) scale(${(1 + (1 - introA) * 0.06).toFixed(3)})`);
    set(intro, "visibility", introA < 0.01 ? "hidden" : "visible");
    let cur = -1; for (let k = 1; k <= N; k++) if (fs > k - 0.12 && fs < k + 0.42) cur = k - 1;
    if (cur !== active) { panels.forEach((p, i) => p.classList.toggle("on", i === cur)); stationBtns.forEach((b, i) => b.classList.toggle("on", i === cur)); active = cur; }
    const navOff = fs < 0.5 || fs > N + 0.6; if (navOff !== lastNavOff) { lastNavOff = navOff; stNav.classList.toggle("off", navOff); }
    
    set(meter, "transform", `scaleX(${(scrollY / Math.max(1, docH - innerHeight)).toFixed(4)})`);
    set(veil, "opacity", (clamp((scrollY - SPAN) / (innerHeight * 0.8)) * 0.55).toFixed(3));
    const prTop = PR_TOP - scrollY, pp = clamp(-prTop / Math.max(1, PR_H - innerHeight)), pr = { top: prTop };
    set(trackEl, "transform", `translateX(${(-pp * TRACK_X).toFixed(1)}px)`);
    set(prFill, "transform", `scaleX(${pp.toFixed(4)})`); set(prDot, "left", (pp * 100).toFixed(2) + "%");
    if (pr.top < innerHeight * 1.5 && pr.top > -PR_H) steps.forEach((s, i) => { const on = pp >= i / steps.length - 0.02 || (pr.top < innerHeight * 0.5 && i === 0); if (s._lit !== on) { s._lit = on; s.classList.toggle("lit", on); } });

    mk.d = performance.now();
    composer.render(dt);
    if (PROF) { const T1 = performance.now(); if (T1 - T0 > 40 || dt > 0.08) window.__slow.push({ fs: +fs.toFixed(2), dt: Math.round(dt * 1000), pre: Math.round(mk.a - T0), load: Math.round(mk.b - mk.a), stations: Math.round(mk.c - mk.b), dom: Math.round(mk.d - mk.c), render: Math.round(T1 - mk.d) }); }
    requestAnimationFrame(frame);
  }

  Promise.all([document.fonts.load("300px 'Instrument Serif'"), document.fonts.load("500 17px Geist")]).catch(() => {}).finally(() => {
    readScroll(); fs = fTarget;
    loadStation(stations[0]); loadStation(stations[1]);
    if (Q.has("f")) { goto(parseFloat(Q.get("f")), false); readScroll(); fs = fTarget; }
    // compile every shader now, behind the black intro, so no product stalls the flight the first time it appears
    const warm = renderer.compileAsync && renderer.extensions.has("KHR_parallel_shader_compile") ? renderer.compileAsync(scene, camera) : Promise.resolve(renderer.compile(scene, camera));
    warm.catch(() => {}).then(() => { window.__warm = true; });
    requestAnimationFrame(frame);
    requestAnimationFrame(() => document.body.classList.add("ready"));
    typeIntro();
  });
  window.__goto = (f) => { goto(f, false); readScroll(); fs = fTarget; };
  window.__state = () => ({ boot, fs, done, pending, gpuTier: T, bloomScale: +bloomFx.resolution.scale.toFixed(2), dpr: DPR, tex: TW, particles: DUST + VN });
}
