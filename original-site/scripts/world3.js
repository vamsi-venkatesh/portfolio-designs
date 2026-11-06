/* ═══════════════════════════════════════════════════════════════════════
   WORLD ENGINE v3 — GPU universe (three.js + Lenis)
   60k shader particles with real glow. The scroll continuously SCRUBS one
   camera timeline through the systems: NAME → CONXTO orbit → MARKET field
   → SARA rings → STARLINE → SINGULARITY. All morphing happens in the
   vertex shader; the CPU only updates uniforms.
   Intro contract (unchanged): refresh restarts at the name reveal; scenes
   stay locked until the intro finishes; hero UI arrives after the reveal.
   Fallbacks: reduced-motion or no-WebGL → static page (body.world-off).
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from "three";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("world");

function bail() {
  if (canvas) canvas.remove();
  document.body.classList.add("world-off", "world-on", "name-revealed");
  document.body.classList.remove("booting");
}
if (!canvas || REDUCED) { bail(); }
else {
  try { init(); } catch (e) { bail(); }
}

function init() {
  /* ── renderer ───────────────────────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  const MOBILE = Math.min(window.innerWidth, window.innerHeight) < 761;
  const FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const N = MOBILE ? 16000 : 60000;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene3 = new THREE.Scene();
  scene3.fog = new THREE.FogExp2(0x08090d, 0.0035);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 600);

  /* ── glow sprite texture (fake bloom, zero post-processing cost) ────── */
  function glowTexture(inner) {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255," + inner + ")");
    grad.addColorStop(0.25, "rgba(190,215,255,0.35)");
    grad.addColorStop(0.6, "rgba(120,160,255,0.08)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  /* ── deterministic per-particle randomness ──────────────────────────── */
  const seed = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    seed[i * 4]     = frac(Math.sin(i * 127.1) * 43758.5453);
    seed[i * 4 + 1] = frac(Math.sin(i * 311.7) * 43758.5453);
    seed[i * 4 + 2] = frac(Math.sin(i * 74.7) * 43758.5453);
    seed[i * 4 + 3] = frac(Math.sin(i * 269.5) * 43758.5453);
  }
  function frac(x) { return x - Math.floor(x); }
  const r1 = (i) => seed[i * 4], r2 = (i) => seed[i * 4 + 1], r3 = (i) => seed[i * 4 + 2], r4 = (i) => seed[i * 4 + 3];
  function gauss(i, k) { // cheap gaussian-ish from two seeds
    return (seed[(i * 4 + k) % (N * 4)] + seed[(i * 4 + k + 1) % (N * 4)] - 1);
  }

  /* ── scene formations (baked once into attributes) ──────────────────── */
  const S = [];
  for (let s = 0; s < 6; s++) S.push(new Float32Array(N * 3));
  const SIDE = MOBILE ? 0 : 24;          // push formations opposite the content card

  // 0 · NAME — filled after font load (start as dust so there's never a bad shape)
  function dustInto(arr) {
    for (let i = 0; i < N; i++) {
      const th = r1(i) * Math.PI * 2, ph = Math.acos(2 * r2(i) - 1);
      const rr = 40 + r3(i) * 110;
      arr[i * 3] = Math.sin(ph) * Math.cos(th) * rr * 1.4;
      arr[i * 3 + 1] = Math.cos(ph) * rr * 0.7;
      arr[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * rr - 30;
    }
  }
  dustInto(S[0]);

  function sampleNameInto(arr) {
    const off = document.createElement("canvas");
    const g = off.getContext("2d");
    const lines = MOBILE ? ["VAMSI", "VENKATESH"] : ["VAMSI VENKATESH"];
    off.width = 1400; off.height = MOBILE ? 420 : 200;
    g.fillStyle = "#fff";
    g.font = `700 ${MOBILE ? 150 : 150}px 'Space Grotesk', sans-serif`;
    g.textAlign = "center"; g.textBaseline = "middle";
    lines.forEach((ln, i) => g.fillText(ln, off.width / 2, off.height / (lines.length + 1) * (i + 1)));
    const img = g.getImageData(0, 0, off.width, off.height).data;
    const pts = [];
    for (let y = 0; y < off.height; y += 2)
      for (let x = 0; x < off.width; x += 2)
        if (img[(y * off.width + x) * 4 + 3] > 128) pts.push([x / off.width - 0.5, y / off.height - 0.5]);
    if (!pts.length) return;
    // world scale: name spans most of the view at cam z=95
    const aspect = window.innerWidth / window.innerHeight;
    const visH = 2 * 95 * Math.tan(THREE.MathUtils.degToRad(27.5));
    const visW = visH * aspect;
    const w = Math.min(visW * 0.735, 128);   // registered to the crisp h1 width
    const h = w * (off.height / off.width);
    const used = Math.floor(N * 0.72);
    for (let i = 0; i < N; i++) {
      if (i < used) {
        const q = pts[(i * 13) % pts.length];
        arr[i * 3] = q[0] * w + gauss(i, 0) * 0.35;
        arr[i * 3 + 1] = -q[1] * h + 9.2 + gauss(i, 1) * 0.35;  // registered to the crisp h1 baseline
        arr[i * 3 + 2] = gauss(i, 2) * 1.1;
      } else {           // ambient dust behind the name
        const th = r1(i) * Math.PI * 2;
        arr[i * 3] = Math.cos(th) * (60 + r2(i) * 120);
        arr[i * 3 + 1] = (r3(i) - 0.5) * 90;
        arr[i * 3 + 2] = -20 - r4(i) * 90;
      }
    }
    geom.attributes.aS0.needsUpdate = true;
  }

  // 1 · CONXTO — glowing core + six tilted agent rings
  for (let i = 0; i < N; i++) {
    const k = i % 7;
    let x, y, z;
    if (k === 6) {                        // core
      const th = r1(i) * Math.PI * 2, ph = Math.acos(2 * r2(i) - 1);
      const rr = Math.pow(r3(i), 1.6) * 7;
      x = Math.sin(ph) * Math.cos(th) * rr; y = Math.cos(ph) * rr; z = Math.sin(ph) * Math.sin(th) * rr;
    } else {                              // ring k
      const R = 16 + k * 7.5;
      const a = r1(i) * Math.PI * 2;
      const tilt = (k / 6) * 0.9 - 0.45;  // each ring on its own plane
      const px = Math.cos(a) * R, py = Math.sin(a) * R * 0.42, pz = Math.sin(a) * R * 0.5;
      x = px + gauss(i, 0) * 0.8;
      y = py * Math.cos(tilt) - pz * Math.sin(tilt) + gauss(i, 1) * 0.8;
      z = py * Math.sin(tilt) + pz * Math.cos(tilt) + gauss(i, 2) * 0.8;
    }
    S[1][i * 3] = x + SIDE; S[1][i * 3 + 1] = y; S[1][i * 3 + 2] = z;
  }

  // 2 · MARKET — breathing data columns on a floor grid
  {
    const cols = MOBILE ? 16 : 36;
    for (let i = 0; i < N; i++) {
      const c = i % cols;
      const x = (c / (cols - 1) - 0.5) * 130;
      const height = (Math.sin(c * 1.7) * 0.5 + 0.5) * 34 + 8;
      S[2][i * 3] = x + gauss(i, 0) * 1.6;
      S[2][i * 3 + 1] = -24 + r2(i) * height;
      S[2][i * 3 + 2] = (r3(i) - 0.5) * 60 - 10;
    }
  }

  // 3 · SARA — five concentric voice rings + a bright center
  for (let i = 0; i < N; i++) {
    const k = i % 6;
    if (k === 5) {
      const th = r1(i) * Math.PI * 2, ph = Math.acos(2 * r2(i) - 1);
      const rr = Math.pow(r3(i), 2) * 4;
      S[3][i * 3] = Math.sin(ph) * Math.cos(th) * rr + SIDE;
      S[3][i * 3 + 1] = Math.cos(ph) * rr;
      S[3][i * 3 + 2] = Math.sin(ph) * Math.sin(th) * rr;
    } else {
      const R = 10 + k * 7;
      const a = r1(i) * Math.PI * 2;
      S[3][i * 3] = Math.cos(a) * R + SIDE + gauss(i, 0) * 0.5;
      S[3][i * 3 + 1] = Math.sin(a) * R + gauss(i, 1) * 0.5;
      S[3][i * 3 + 2] = (k - 2) * 1.2 + gauss(i, 2) * 0.6;
    }
  }

  // 4 · STARLINE — a helix river of shipped stars
  for (let i = 0; i < N; i++) {
    const t = r4(i);
    S[4][i * 3] = t * 150 - 75 + gauss(i, 0) * 2.5;
    S[4][i * 3 + 1] = Math.sin(t * 9) * 12 + gauss(i, 1) * 2.5;
    S[4][i * 3 + 2] = Math.cos(t * 7) * 12 + gauss(i, 2) * 2.5 - 8;
  }

  // 5 · SINGULARITY — dense bright core + thin halo
  for (let i = 0; i < N; i++) {
    const th = r1(i) * Math.PI * 2, ph = Math.acos(2 * r2(i) - 1);
    const rr = (i % 9 === 0) ? 18 + r3(i) * 55 : Math.pow(r3(i), 2.2) * 5.5;
    S[5][i * 3] = Math.sin(ph) * Math.cos(th) * rr;
    S[5][i * 3 + 1] = Math.cos(ph) * rr * 0.8;
    S[5][i * 3 + 2] = Math.sin(ph) * Math.sin(th) * rr;
  }

  /* ── geometry + shader ──────────────────────────────────────────────── */
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(S[0].slice(), 3)); // required by three
  for (let s = 0; s < 6; s++) geom.setAttribute("aS" + s, new THREE.BufferAttribute(S[s], 3));
  geom.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));

  const uni = {
    uTime: { value: 0 },
    uP: { value: 0 },          // continuous scene progress 0..5
    uIntro: { value: 0 },      // chaos → name
    uDissolve: { value: 0 },   // name → dust handoff
    uWarp: { value: 0 },       // scroll-speed energy
    uSize: { value: MOBILE ? 1.8 : 2.05 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms: uni,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 aS0, aS1, aS2, aS3, aS4, aS5;
      attribute vec4 aSeed;
      uniform float uTime, uP, uIntro, uDissolve, uWarp, uSize;
      varying float vA; varying vec3 vCol;

      vec3 pick(int i) {
        if (i <= 0) return aS0;
        if (i == 1) return aS1;
        if (i == 2) return aS2;
        if (i == 3) return aS3;
        if (i == 4) return aS4;
        return aS5;
      }
      void main() {
        float fi = floor(uP);
        float fr = smoothstep(0.10, 0.90, fract(uP));
        vec3 a = pick(int(fi));
        vec3 b = pick(int(fi) + 1);
        // per-particle stagger — clouds tear apart and re-form, never slide as one block
        float st = clamp(fr * (1.35 + aSeed.w) - aSeed.w * 0.35, 0.0, 1.0);
        vec3 target = mix(a, b, st);

        // intro: converge out of chaos
        vec3 chaos = normalize(aSeed.xyz - 0.5) * (70.0 + aSeed.w * 120.0);
        vec3 pos = mix(chaos, target, uIntro);

        // dissolve the name back into dust (only near scene 0)
        vec3 dust = normalize(aSeed.xyz - 0.5) * (45.0 + aSeed.w * 110.0);
        float dw = uDissolve * (1.0 - smoothstep(0.0, 0.9, uP));
        pos = mix(pos, dust, dw * (0.55 + aSeed.w * 0.45));

        // alive: gentle organic wobble — damped hard in the name scene so glyphs stay crisp
        float wob = (0.35 + aSeed.w * 0.55) * (0.12 + 0.88 * smoothstep(0.0, 0.8, uP));
        pos += vec3(
          sin(uTime * 0.5 + aSeed.x * 40.0),
          cos(uTime * 0.42 + aSeed.y * 40.0),
          sin(uTime * 0.58 + aSeed.z * 40.0)
        ) * wob;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        float tw = 0.55 + 0.45 * sin(uTime * (1.2 + aSeed.w * 2.2) + aSeed.x * 60.0);
        vA = tw * (0.5 + 0.5 * aSeed.w) * (1.0 + uWarp * 0.9);
        vA *= 1.0 + (1.0 - smoothstep(0.0, 0.8, uP)) * uIntro * (1.0 - uDissolve) * 0.85;
        // color: electric blue / violet / white sparks
        vCol = aSeed.y < 0.70 ? vec3(0.38, 0.63, 1.0)
             : aSeed.y < 0.90 ? vec3(0.62, 0.55, 1.0)
             : vec3(0.93, 0.97, 1.0);
        float size = uSize * (0.42 + aSeed.w * 1.15) * (1.0 + uWarp * 1.6);
        gl_PointSize = size * (240.0 / -mv.z);
      }`,
    fragmentShader: `
      varying float vA; varying vec3 vCol;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c) * 2.0;
        if (d > 1.0) discard;
        float glow = pow(1.0 - d, 3.2) * 0.78;   // tight-ish falloff — letterforms resolve, still luminous
        float core = smoothstep(0.30, 0.0, d) * 1.35; // hot center
        gl_FragColor = vec4(vCol * (glow + core * 1.5), (glow * 0.82 + core) * vA * 0.95);
      }`,
  });
  scene3.add(new THREE.Points(geom, mat));

  // core glow sprites for orbit + singularity (opacity by scene weight)
  const glow = glowTexture(0.9);
  const coreOrbit = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0x78afff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  coreOrbit.position.set(SIDE, 0, 0); coreOrbit.scale.setScalar(34); scene3.add(coreOrbit);
  const coreSing = new THREE.Sprite(coreOrbit.material.clone());
  coreSing.position.set(0, 0, 0); coreSing.scale.setScalar(46); scene3.add(coreSing);

  /* ── camera timeline (one waypoint per scene, scrub-interpolated) ───── */
  const WAY = [
    { p: new THREE.Vector3(0, 0, 95),        l: new THREE.Vector3(0, 2, 0) },        // name
    { p: new THREE.Vector3(SIDE - 6, 10, 74), l: new THREE.Vector3(SIDE, 0, 0) },     // orbit
    { p: new THREE.Vector3(0, 6, 92),         l: new THREE.Vector3(0, -6, 0) },       // field
    { p: new THREE.Vector3(SIDE - 4, 0, 66),  l: new THREE.Vector3(SIDE, 0, 0) },     // voice
    { p: new THREE.Vector3(-30, 14, 96),      l: new THREE.Vector3(0, 0, 0) },        // starline
    { p: new THREE.Vector3(0, 0, 60),         l: new THREE.Vector3(0, 0, 0) },        // singularity
  ];
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
  function smoother(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

  /* ── scroll → continuous progress ───────────────────────────────────── */
  const ORDER = ["name", "orbit", "field", "voice", "starline", "singularity"];
  let centers = [];
  function measure() {
    centers = ORDER.map((name) => {
      const el = document.querySelector(`[data-scene="${name}"]`);
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY + r.height / 2;
    });
  }
  function progressFromScroll(y) {
    const mid = y + window.innerHeight / 2;
    if (mid <= centers[0]) return 0;
    for (let i = 0; i < centers.length - 1; i++) {
      if (mid < centers[i + 1]) return i + (mid - centers[i]) / (centers[i + 1] - centers[i]);
    }
    return 5;
  }

  /* ── smooth scroll (desktop) — Lenis scrubs the world ───────────────── */
  let lenis = null;
  if (window.Lenis && FINE) {
    lenis = new window.Lenis({ duration: 1.35, easing: (t) => 1 - Math.pow(1 - t, 3), smoothWheel: true, autoRaf: false });
    window.__lenis = lenis;
  }

  /* ── intro contract ─────────────────────────────────────────────────── */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  let introLocked = true;
  let introT0 = null;          // when the convergence starts
  let dissolveT0 = null;

  const bootEl = document.getElementById("boot-lines");
  const BOOT = [
    "> waking the builder…",
    "> loading systems: conxto · market-lab · sara · personal-os",
    "> memory substrate: online · agents: 6 · receipts: on",
    "> world ready.",
  ];
  function boot() {
    document.body.classList.add("booting");
    let li = 0;
    function typeLine() {
      if (!bootEl || li >= BOOT.length) {
        setTimeout(() => {
          document.body.classList.add("world-on");
          document.body.classList.remove("booting");
          introT0 = performance.now();                       // particles converge into the name
          setTimeout(() => document.body.classList.add("name-revealed"), 2400);
          setTimeout(() => { dissolveT0 = performance.now(); introLocked = false; }, 5200);
        }, 200);
        return;
      }
      const ln = document.createElement("div");
      bootEl.appendChild(ln);
      const txt = BOOT[li]; let ci = 0;
      const iv = setInterval(() => {
        ci += 4; ln.textContent = txt.slice(0, ci);
        if (ci >= txt.length) { clearInterval(iv); li++; setTimeout(typeLine, li === BOOT.length ? 120 : 70); }
      }, 8);
    }
    typeLine();
  }
  // failsafes — the page must never stay hidden
  setTimeout(() => { if (!document.body.classList.contains("world-on")) { document.body.classList.add("world-on"); document.body.classList.remove("booting"); if (introT0 === null) introT0 = performance.now(); } }, 3800);
  setTimeout(() => { document.body.classList.add("name-revealed"); if (dissolveT0 === null) dissolveT0 = performance.now(); introLocked = false; }, 8200);

  /* ── sizing ─────────────────────────────────────────────────────────── */
  function size() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);  // updateStyle=true — canvas CSS box must equal the viewport
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    measure();
  }
  size();
  window.addEventListener("resize", () => { size(); }, { passive: true });

  // name after the display font is ready (dust until then — never a broken glyph)
  if (document.fonts && document.fonts.load) {
    document.fonts.load("700 150px 'Space Grotesk'").then(() => sampleNameInto(geom.attributes.aS0.array)).catch(() => sampleNameInto(geom.attributes.aS0.array));
    setTimeout(() => sampleNameInto(geom.attributes.aS0.array), 1200); // belt & braces
  } else sampleNameInto(geom.attributes.aS0.array);

  /* ── pointer parallax ───────────────────────────────────────────────── */
  const ptr = { x: 0, y: 0, cx: 0, cy: 0 };
  if (FINE) window.addEventListener("pointermove", (e) => {
    ptr.x = (e.clientX / window.innerWidth - 0.5);
    ptr.y = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  /* ── main loop ──────────────────────────────────────────────────────── */
  let running = true, lastP = 0, smP = 0;
  const clock = new THREE.Clock();
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (lenis) lenis.raf(now);
    const t = clock.getElapsedTime();

    // intro envelopes
    if (introT0 !== null && uni.uIntro.value < 1) {
      const k = Math.min(1, (performance.now() - introT0) / 2100);
      uni.uIntro.value = smoother(k);
    }
    if (dissolveT0 !== null && uni.uDissolve.value < 1) {
      uni.uDissolve.value = Math.min(1, (performance.now() - dissolveT0) / 1700);
    }

    // progress: locked to the name until the intro finishes
    const raw = introLocked ? 0 : progressFromScroll(window.scrollY);
    smP += (raw - smP) * 0.07;                       // world inertia on top of Lenis
    uni.uP.value = smP;
    const vel = Math.abs(smP - lastP); lastP = smP;
    uni.uWarp.value += (Math.min(vel * 26, 1.6) - uni.uWarp.value) * 0.08;
    uni.uTime.value = t;

    // velocity-reactive typography
    document.documentElement.style.setProperty("--vel", (Math.min(vel * 60, 1)).toFixed(3));

    // camera scrub between waypoints + pointer parallax + idle breath
    const i0 = Math.min(4, Math.floor(smP)), f = smoother(Math.min(1, smP - i0));
    camPos.lerpVectors(WAY[i0].p, WAY[i0 + 1].p, f);
    camLook.lerpVectors(WAY[i0].l, WAY[i0 + 1].l, f);
    ptr.cx += (ptr.x - ptr.cx) * 0.04; ptr.cy += (ptr.y - ptr.cy) * 0.04;
    camPos.x += ptr.cx * 7 + Math.sin(t * 0.22) * 0.9;
    camPos.y += -ptr.cy * 5 + Math.cos(t * 0.19) * 0.7;
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    // set-dressing glows track their scenes
    coreOrbit.material.opacity = Math.max(0, 1 - Math.abs(smP - 1) * 1.4) * 0.5;
    coreSing.material.opacity = Math.max(0, 1 - Math.abs(smP - 5) * 1.4) * (0.55 + Math.sin(t * 2) * 0.08);

    renderer.render(scene3, camera);
  }
  requestAnimationFrame(frame);
  window.__world = { uni, camera, S, N };   // debug handle
  canvas.classList.add("on");
  boot();

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) { clock.start(); requestAnimationFrame(frame); }
  });
}
