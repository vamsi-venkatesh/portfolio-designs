// One small living detail per product, placed in its station so each place feels like that product:
// Conxto a stream of job postings passing a checker, UnboundPDF drifting pages, FarmQuick a supply map,
// the Lab an agent graph with work flowing through it, Forge a sealed exam box being scanned, PitchRadar a
// radar sweep, Conxfolio paper planes, Trading a live price line with candles. All colours are HDR (above 1)
// where they should glow, so the bloom pass picks them up.
import * as THREE from "three";

let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const ADD = THREE.AdditiveBlending;
const hdr = (c, k) => new THREE.Color(c).multiplyScalar(k);

function pointsMat(color, size, px, boost = 2.2) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0 }, uSize: { value: size }, uPx: { value: px }, uBoost: { value: boost } },
    transparent: true, depthWrite: false, blending: ADD,
    vertexShader: `attribute float aScale; uniform float uSize, uPx;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * aScale * uPx * (30. / max(1., -mv.z)); }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity, uBoost;
      void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d); a *= a; gl_FragColor = vec4(uColor * uBoost * (.6 + .9 * smoothstep(.22, 0., d)), a * uOpacity); }`,
  });
}
function points(n, color, size, px, boost) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const sc = new Float32Array(n).fill(1); g.setAttribute("aScale", new THREE.BufferAttribute(sc, 1));
  const p = new THREE.Points(g, pointsMat(color, size, px, boost)); p.frustumCulled = false; return p;
}
const lineMat = (color, k = 1.8) => new THREE.LineBasicMaterial({ color: hdr(color, k), transparent: true, opacity: 0, blending: ADD, depthWrite: false });
function canvasTex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

/* ---- Conxto: postings stream through a checker; checked ones light up ---- */
function conxto(col, px) {
  const root = new THREE.Group(), N = 150, SCAN = -12;
  const tex = canvasTex(256, 150, (g, w, h) => {
    g.fillStyle = "rgba(255,255,255,.07)"; g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 4;
    g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 16); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,.85)"; g.fillRect(24, 28, 130, 14); g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(24, 58, 190, 9); g.fillRect(24, 78, 150, 9);
    g.beginPath(); g.arc(214, 112, 12, 0, 7); g.fill();
  });
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: ADD, depthWrite: false, opacity: 0 });
  const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.5, 0.88), mat, N); mesh.frustumCulled = false; root.add(mesh);
  const cards = Array.from({ length: N }, () => ({ x: 3 + rnd() * 19, y: -6 + rnd() * 13, z: -95 + rnd() * 105, v: 5 + rnd() * 6 }));
  const gate = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(26, 15)), lineMat(col, 2.4)); gate.position.set(8, 0.5, SCAN); root.add(gate);
  const gateFill = new THREE.Mesh(new THREE.PlaneGeometry(26, 15), new THREE.MeshBasicMaterial({ color: hdr(col, 0.5), transparent: true, opacity: 0, blending: ADD, depthWrite: false, side: THREE.DoubleSide })); gateFill.position.copy(gate.position); root.add(gateFill);
  const m4 = new THREE.Matrix4(), c = new THREE.Color(), dim = new THREE.Color(0.28, 0.3, 0.36), lit = hdr(col, 2.6);
  return { root, update(t, dt, show) {
    mat.opacity = show * 0.9; gate.material.opacity = show * 0.7; gateFill.material.opacity = show * (0.05 + 0.03 * Math.sin(t * 3));
    cards.forEach((k, i) => {
      k.z += k.v * dt; if (k.z > 14) { k.z = -95; k.x = 3 + rnd() * 19; }
      m4.makeTranslation(k.x, k.y + Math.sin(t + i) * 0.15, k.z); mesh.setMatrixAt(i, m4);
      c.copy(dim).lerp(lit, THREE.MathUtils.smoothstep(k.z, SCAN - 0.5, SCAN + 1.5)); mesh.setColorAt(i, c);
    });
    mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
  } };
}

/* ---- UnboundPDF: pages drifting up through the air ---- */
function unbound(col) {
  const root = new THREE.Group(), N = 38;
  const tex = canvasTex(256, 330, (g, w, h) => {
    g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, w, h); g.fillStyle = "#ff5a4e"; g.fillRect(0, 0, w, 18);
    g.fillStyle = "#1c1c22"; g.fillRect(26, 44, 150, 16); g.fillStyle = "#b9b4aa";
    for (let y = 80; y < h - 30; y += 17) g.fillRect(26, y, 40 + ((y * 37) % 170), 7);
  });
  const mats = [];
  const pages = Array.from({ length: N }, () => {
    const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.55), m); mats.push(m);
    p.userData = { x: 2 + rnd() * 18, y: -9 + rnd() * 18, z: -42 + rnd() * 34, rx: rnd() * 6, ry: rnd() * 6, s: 0.4 + rnd() * 0.8, v: 0.4 + rnd() * 0.7 };
    root.add(p); return p;
  });
  return { root, update(t, dt, show) {
    pages.forEach((p) => { const u = p.userData; u.y += u.v * dt; if (u.y > 10) u.y = -10;
      p.position.set(u.x + Math.sin(t * 0.3 + u.rx) * 0.8, u.y, u.z); p.rotation.set(u.rx + t * 0.25 * u.s, u.ry + t * 0.35 * u.s, Math.sin(t * 0.5 + u.ry) * 0.4); });
    mats.forEach((m) => (m.opacity = show * 0.88));
  } };
}

/* ---- FarmQuick: five cities on the ground, leads flowing to the hub ---- */
function farm(col, px) {
  const root = new THREE.Group(), Y = -7.85, hub = new THREE.Vector3(8, Y, -18);
  const cities = [[-6, -8], [-4, -30], [20, -30], [24, -6], [12, -40]].map(([x, z]) => new THREE.Vector3(x, Y, z));
  const curves = cities.map((c) => new THREE.QuadraticBezierCurve3(c, c.clone().lerp(hub, 0.5).setY(Y + 7), hub));
  const lm = lineMat(col, 2.2);
  curves.forEach((cv) => root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(cv.getPoints(48)), lm)));
  const nodes = points(cities.length + 1, col, 1.4, px, 3); const np = nodes.geometry.attributes.position;
  [...cities, hub].forEach((c, i) => np.setXYZ(i, c.x, c.y + 0.1, c.z)); nodes.geometry.attributes.aScale.setX(cities.length, 2.2); root.add(nodes);
  const P = 4, pulses = points(cities.length * P, "#ffffff", 0.9, px, 2.4); root.add(pulses);
  const rings = [...cities, hub].map((c) => { const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.05, 48), new THREE.MeshBasicMaterial({ color: hdr(col, 2), transparent: true, opacity: 0, blending: ADD, depthWrite: false, side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.copy(c); r.position.y += 0.05; root.add(r); return r; });
  const v = new THREE.Vector3();
  return { root, update(t, dt, show) {
    lm.opacity = show * 0.75; nodes.material.uniforms.uOpacity.value = show; pulses.material.uniforms.uOpacity.value = show;
    const pp = pulses.geometry.attributes.position;
    curves.forEach((cv, i) => { for (let j = 0; j < P; j++) { cv.getPoint((t * 0.22 + j / P + i * 0.13) % 1, v); pp.setXYZ(i * P + j, v.x, v.y, v.z); } });
    pp.needsUpdate = true;
    rings.forEach((r, i) => { const u = (t * 0.6 + i * 0.3) % 1; r.scale.setScalar(1 + u * 3); r.material.opacity = show * (1 - u) * 0.8; });
  } };
}

/* ---- Agent Service Lab: layered agent graph with work flowing down it ---- */
function lab(col, px) {
  const root = new THREE.Group(); const g = new THREE.Group(); g.position.set(6, 8, -34); root.add(g);
  const layers = [6, 4, 2, 1], nodes = [];
  layers.forEach((n, li) => { const r = [5.5, 3.8, 2, 0][li]; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + li; nodes.push({ li, p: new THREE.Vector3(Math.cos(a) * r, 5 - li * 3.3, Math.sin(a) * r) }); } });
  const edges = [];
  nodes.forEach((a) => nodes.forEach((b) => { if (b.li === a.li + 1) edges.push([a.p, b.p]); }));
  const eg = new THREE.BufferGeometry().setFromPoints(edges.flat()); const lm = lineMat(col, 1.4); g.add(new THREE.LineSegments(eg, lm));
  const np = points(nodes.length, col, 1.5, px, 3); nodes.forEach((n, i) => { np.geometry.attributes.position.setXYZ(i, n.p.x, n.p.y, n.p.z); np.geometry.attributes.aScale.setX(i, n.li === 3 ? 2.4 : 1); }); g.add(np);
  const pulses = points(edges.length, "#ffffff", 0.8, px, 2.6); g.add(pulses);
  const ph = edges.map(() => rnd()), v = new THREE.Vector3();
  return { root, update(t, dt, show) {
    g.rotation.y = t * 0.12; lm.opacity = show * 0.5; np.material.uniforms.uOpacity.value = show; pulses.material.uniforms.uOpacity.value = show;
    const pp = pulses.geometry.attributes.position; edges.forEach(([a, b], i) => { v.copy(a).lerp(b, (t * 0.5 + ph[i]) % 1); pp.setXYZ(i, v.x, v.y, v.z); }); pp.needsUpdate = true;
  } };
}

/* ---- Forge: a sealed exam box, scanned ---- */
function forge(col, px) {
  const root = new THREE.Group(); const g = new THREE.Group(); g.position.set(6, 8.5, -36); root.add(g);
  const outer = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(9, 9, 9)), lineMat(col, 2.4)); g.add(outer);
  const inner = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3, 3, 3)), lineMat("#ffffff", 1.6)); g.add(inner);
  const scanTex = canvasTex(64, 64, (c, w, h) => { const r = c.createLinearGradient(0, 0, 0, h); r.addColorStop(0, "rgba(255,255,255,0)"); r.addColorStop(.5, "rgba(255,255,255,1)"); r.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = r; c.fillRect(0, 0, w, h); });
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.6), new THREE.MeshBasicMaterial({ map: scanTex, color: hdr(col, 2.2), transparent: true, opacity: 0, blending: ADD, depthWrite: false, side: THREE.DoubleSide }));
  const scanH = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ color: hdr(col, 1), transparent: true, opacity: 0, blending: ADD, depthWrite: false, side: THREE.DoubleSide }));
  scanH.rotation.x = -Math.PI / 2; g.add(scanH); g.add(scan);
  const dots = points(260, "#ffffff", 0.5, px, 1.6); const dp = dots.geometry.attributes.position;
  for (let i = 0; i < 260; i++) dp.setXYZ(i, (rnd() - 0.5) * 8.4, (rnd() - 0.5) * 8.4, (rnd() - 0.5) * 8.4); g.add(dots);
  return { root, update(t, dt, show) {
    g.rotation.y = t * 0.15; g.rotation.x = Math.sin(t * 0.2) * 0.12; inner.rotation.set(t * 0.5, t * 0.7, 0);
    const y = Math.sin(t * 0.9) * 4.3; scan.position.y = y; scanH.position.y = y;
    outer.material.opacity = show * 0.8; inner.material.opacity = show * 0.7; scan.material.opacity = show * 0.5; scanH.material.opacity = show * 0.06; dots.material.uniforms.uOpacity.value = show * 0.7;
  } };
}

/* ---- PitchRadar: a radar sweep on the ground, events lighting up ---- */
function radar(col) {
  const root = new THREE.Group();
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color(col) } }, transparent: true, depthWrite: false, blending: ADD, side: THREE.DoubleSide,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
    fragmentShader: `varying vec2 vUv; uniform float uTime, uOpacity; uniform vec3 uColor;
      void main(){ vec2 p = (vUv - .5) * 2.; float r = length(p); if (r > 1.) discard;
        float ring = 1. - smoothstep(0., .02, abs(fract(r * 5. + .5) - .5) * .4);
        float ang = atan(p.y, p.x), sw = mod(uTime * 1.1, 6.28318), da = mod(sw - ang + 6.28318, 6.28318);
        float sweep = exp(-da * 2.6) * (1. - r * .35);
        float cr = (1. - smoothstep(0., .005, abs(p.x))) + (1. - smoothstep(0., .005, abs(p.y)));
        float bl = 0.; for (int i = 0; i < 11; i++) { float fi = float(i); vec2 c = vec2(sin(fi * 12.9 + 1.), cos(fi * 7.3 + 2.)) * (.2 + .7 * fract(fi * .37));
          float d = mod(sw - atan(c.y, c.x) + 6.28318, 6.28318); bl += smoothstep(.035, 0., length(p - c)) * (.25 + exp(-d * .7) * 2.); }
        float edge = smoothstep(.95, .985, r) * (1. - smoothstep(.985, 1., r));
        float a = ring * .3 + sweep * .8 + cr * .18 + bl + edge;
        gl_FragColor = vec4(uColor * (1.4 + bl * 2.), a * uOpacity * (1. - r * .3)); }`,
  });
  const disc = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), mat); disc.rotation.x = -Math.PI / 2; disc.position.set(8, -7.85, -18); root.add(disc);
  return { root, update(t, dt, show) { mat.uniforms.uTime.value = t; mat.uniforms.uOpacity.value = show; } };
}

/* ---- Conxfolio: paper planes looping through the air ---- */
function folio(col) {
  const root = new THREE.Group();
  const geo = new THREE.BufferGeometry();
  const nose = [0, 0, 1], l = [-0.6, 0.05, -0.6], c = [0, 0, -0.35], r = [0.6, 0.05, -0.6], k = [0, -0.28, -0.5];
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([...nose, ...l, ...c, ...nose, ...c, ...r, ...nose, ...c, ...k]), 3));
  const mats = [], planes = Array.from({ length: 16 }, (_, i) => {
    const m = new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? new THREE.Color(col) : new THREE.Color("#f3eee6"), transparent: true, opacity: 0, side: THREE.DoubleSide }); mats.push(m);
    const p = new THREE.Mesh(geo, m); p.userData = { R: 5 + rnd() * 8, h: -4 + rnd() * 9, sp: 0.25 + rnd() * 0.3, a: rnd() * 6, s: 0.8 + rnd() * 0.9 }; p.scale.setScalar(p.userData.s); root.add(p); return p;
  });
  const center = new THREE.Vector3(8, 0.5, -16), a = new THREE.Vector3(), b = new THREE.Vector3();
  const at = (u, ang, out) => out.set(center.x + Math.cos(ang) * u.R, center.y + u.h + Math.sin(ang * 2) * 1.4, center.z + Math.sin(ang) * u.R * 0.7);
  return { root, update(t, dt, show) {
    planes.forEach((p) => { const u = p.userData, ang = u.a + t * u.sp; at(u, ang, a); at(u, ang + 0.05, b); p.position.copy(a); p.lookAt(b); p.rotateZ(Math.sin(ang * 2) * 0.5); });
    mats.forEach((m) => (m.opacity = show * 0.95));
  } };
}

/* ---- Trading: a price line drawing itself, with candles ---- */
function trading(col, px) {
  const root = new THREE.Group(), N = 260, pts = []; let y = 0;
  for (let i = 0; i < N; i++) { y += (rnd() - 0.48) * 0.55; y *= 0.985; pts.push(new THREE.Vector3(-4 + (i / N) * 30, -5.2 + y * 0.8, -9)); }
  const lg = new THREE.BufferGeometry().setFromPoints(pts); const lm = lineMat(col, 2.6); const line = new THREE.Line(lg, lm); root.add(line);
  const head = points(1, "#ffffff", 3, px, 3); root.add(head);
  const CN = Math.floor(N / 4), cm = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, blending: ADD, depthWrite: false });
  const candles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 1, 0.16), cm, CN); candles.frustumCulled = false; root.add(candles);
  const up = hdr("#3fd08a", 1.6), dn = hdr("#ff5a4e", 1.6), m4 = new THREE.Matrix4();
  for (let i = 0; i < CN; i++) { const a = pts[i * 4], b = pts[Math.min(N - 1, i * 4 + 3)]; candles.setColorAt(i, b.y >= a.y ? up : dn); }
  return { root, update(t, dt, show) {
    const cyc = (t * 34) % (N + 90), n = Math.min(N, Math.floor(cyc)); lg.setDrawRange(0, Math.max(2, n));
    const hp = pts[Math.max(0, n - 1)]; head.geometry.attributes.position.setXYZ(0, hp.x, hp.y, hp.z); head.geometry.attributes.position.needsUpdate = true;
    for (let i = 0; i < CN; i++) { const a = pts[i * 4], b = pts[Math.min(N - 1, i * 4 + 3)], vis = i * 4 + 3 < n ? 1 : 0;
      const h = Math.max(0.25, Math.abs(b.y - a.y) * 3); m4.makeScale(1, h * vis + 1e-4, 1).setPosition(a.x, (a.y + b.y) / 2 - 1.6, a.z - 1.5); candles.setMatrixAt(i, m4); }
    candles.instanceMatrix.needsUpdate = true;
    lm.opacity = show; head.material.uniforms.uOpacity.value = show; cm.opacity = show * 0.55;
  } };
}

const BUILD = { "VV 106": conxto, "VV 105": unbound, "VV 103": farm, "VV 102": lab, "VV 101": forge, "VV 104": radar, "VV 107": folio, "VV 108": trading };
export function buildDetail(code, color, px) { const f = BUILD[code]; return f ? f(color, px) : null; }
