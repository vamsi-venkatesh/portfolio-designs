/* ═══════════════════════════════════════════════════════════════════════
   THE LIVING MACHINE — world engine v5 (full spectacle)
   The estate is one organism. A river of memory-light runs the length of
   the hall and every system is a working mechanism it feeds: an orrery of
   seven agents, a graph that compiles itself as you approach, a balance
   that weighs real outcomes, a breathing field of candles, a vortex where
   demand condenses into product, a hall of time, and a door you finally
   walk through. One camera, no cuts. Palette stays the studio's own:
   moonlight, warm lamplight, moss — pushed to full brightness, never hue.
   Contracts kept from v4: data-scene keys, [data-jump] active sync,
   data-room on <html>, --vel, window.__world, booting/world-on/name-revealed.
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
else { try { init(); } catch (e) { console.warn("[world] init failed:", e); bail(); } }

function init() {
  const MOBILE = Math.min(window.innerWidth, window.innerHeight) < 761;
  const FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const CORES = navigator.hardwareConcurrency || 4;

  /* ── quality tiers (adaptive; degrade before dropping frames) ───────── */
  const Q = {
    dpr: Math.min(window.devicePixelRatio || 1, MOBILE ? 1.75 : 1.5),
    motes: MOBILE ? 420 : 900,
    veil: MOBILE ? 3200 : 9000,
    candles: MOBILE ? 320 : 880,
    vortex: MOBILE ? 700 : 1500,
    packets: MOBILE ? 70 : 130,
    bloom: true,
    chroma: !MOBILE,
  };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(1); // we manage DPR through render-target sizes
  renderer.setClearColor(0x0a0b0d, 1);
  renderer.autoClear = true;

  const scene3 = new THREE.Scene();
  scene3.fog = new THREE.FogExp2(0x0a0b0d, MOBILE ? 0.010 : 0.0122);
  const camera = new THREE.PerspectiveCamera(MOBILE ? 56 : 48, 1, 0.1, 420);
  const CAMERA_START = MOBILE ? 38 : 26;
  const STEP = 92;
  const roomZ = (k) => -k * STEP;
  const SIDE = MOBILE ? 12.5 : 10.5;
  const EX_SCALE = MOBILE ? 1.16 : 1;

  /* ── colors ─────────────────────────────────────────────────────────── */
  const C_MOON = new THREE.Color(0xafc2d2);
  const C_PALE = new THREE.Color(0xd9e2ea);
  const C_WARM = new THREE.Color(0xe8e2d5);
  const C_MOSS = new THREE.Color(0x9fb88f);

  /* ── shared textures / helpers ──────────────────────────────────────── */
  function softTex(warm) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    const tint = warm ? "232,226,213" : "175,194,210";
    grad.addColorStop(0, `rgba(${tint},0.95)`);
    grad.addColorStop(0.35, `rgba(${tint},0.28)`);
    grad.addColorStop(1, `rgba(${tint},0)`);
    g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  const warmTex = softTex(true), coolTex = softTex(false);
  // round sprite for point clouds — untextured Points render as hard squares
  // and the bloom pass turns those into glowing bricks
  function dotTex() {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.35)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  const pointTex = dotTex();
  const mkGlow = (tex, size, opacity) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
    s.scale.setScalar(size);
    return s;
  };
  const lineMat = (opacity, color = 0xafc2d2) => new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
  const circleGeo = (r, n = 96, tiltX = 0) => {
    const pts = [];
    for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * Math.sin(tiltX), Math.sin(a) * r * Math.cos(tiltX))); }
    return new THREE.BufferGeometry().setFromPoints(pts);
  };
  function vGradTex(rgb, aTop, aBottom) {
    const c = document.createElement("canvas"); c.width = 4; c.height = 256;
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, `rgba(${rgb},${aTop})`);
    grad.addColorStop(1, `rgba(${rgb},${aBottom})`);
    g.fillStyle = grad; g.fillRect(0, 0, 4, 256);
    return new THREE.CanvasTexture(c);
  }
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  /* ── floor sheen + faint reflection band ────────────────────────────── */
  {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 780),
      new THREE.MeshBasicMaterial({ map: vGradTex("175,194,210", 0.07, 0), transparent: true, depthWrite: false })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -7.5, -300);
    scene3.add(floor);
  }

  /* ── dust motes ─────────────────────────────────────────────────────── */
  let motes;
  {
    const N = Q.motes;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 96;
      pos[i * 3 + 1] = -7 + Math.random() * 24;
      pos[i * 3 + 2] = 34 - Math.random() * 720;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ map: pointTex, color: 0xd9e2ea, size: 0.16, transparent: true, opacity: 0.55, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending });
    motes = new THREE.Points(g, m);
    motes.userData.base = pos.slice();
    scene3.add(motes);
  }

  /* ── THE SPINE — the river of memory running the whole hall ─────────── */
  const spineCurve = new THREE.CatmullRomCurve3(
    [0, 1, 2, 3, 4, 5, 6, 7].map((k) => new THREE.Vector3(
      [0, 6.5, 4.5, -6.5, 0, 6.5, -3, 0][k], -5.6, roomZ(k) - 6
    )), false, "catmullrom", 0.4
  );
  {
    const pts = spineCurve.getPoints(560);
    const spine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(0.16, 0xd9e2ea));
    scene3.add(spine);
    const spineGlow = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(0.05, 0xafc2d2));
    spineGlow.scale.set(1.002, 1.02, 1.0005);
    scene3.add(spineGlow);
  }
  let spinePackets;
  {
    const N = Q.packets;
    const pos = new Float32Array(N * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ map: pointTex, color: 0xe8e2d5, size: 0.62, transparent: true, opacity: 0.9, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending });
    spinePackets = new THREE.Points(g, m);
    spinePackets.userData = { N, t: new Float32Array(N), v: new Float32Array(N) };
    for (let i = 0; i < N; i++) { spinePackets.userData.t[i] = Math.random(); spinePackets.userData.v[i] = 0.006 + Math.random() * 0.012; }
    scene3.add(spinePackets);
  }

  /* ── THE VEIL — dust that parts on arrival ──────────────────────────── */
  let veil, veilDone = false;
  {
    const N = Q.veil;
    const pos = new Float32Array(N * 3), dir = new Float32Array(N * 3), dly = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const x = (Math.random() - 0.5) * 64, y = -7 + Math.random() * 22, z = 18 - Math.random() * 34;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      const l = Math.hypot(x, y - 3) || 1;
      dir[i * 3] = (x / l) * (5 + hash(i) * 9);
      dir[i * 3 + 1] = ((y - 3) / l) * (4 + hash(i + 1) * 7);
      dir[i * 3 + 2] = -14 - hash(i + 2) * 22;
      dly[i] = hash(i + 3) * 0.55;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ map: pointTex, color: 0xd9e2ea, size: 0.13, transparent: true, opacity: 0.8, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending });
    veil = new THREE.Points(g, m);
    veil.userData = { N, base: pos.slice(), dir, dly, t: 0 };
    scene3.add(veil);
  }

  /* ── rooms ──────────────────────────────────────────────────────────── */
  const exhibits = [];
  function room(k, key, builder) {
    const gp = new THREE.Group();
    gp.position.z = roomZ(k);
    builder(gp);
    if (MOBILE && key !== "name" && key !== "singularity") gp.scale.setScalar(EX_SCALE);
    scene3.add(gp);
    exhibits.push({ group: gp, key, z: roomZ(k) });
    return gp;
  }

  // 00 · THRESHOLD — the lit horizon you arrive over
  room(0, "name", (gp) => {
    const bar = new THREE.Mesh(
      new THREE.PlaneGeometry(38, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xe8e2d5, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    bar.position.set(0, -5.2, -14);
    gp.add(bar);
    const halo = mkGlow(warmTex, MOBILE ? 40 : 32, 0.34); halo.position.set(0, -5.6, -15); gp.add(halo);
    // colossal quiet rings overhead — the machine is above you from the first breath
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Line(circleGeo(26 + i * 9), lineMat(0.085 - i * 0.02));
      ring.rotation.x = Math.PI / 2.25;
      ring.position.set(0, 16, -30);
      gp.add(ring);
      gp.userData["oring" + i] = ring;
    }
    gp.userData.bar = bar; gp.userData.halo = halo;
  });

  // 01 · ORRERY — seven agent-moons feed one shared memory core
  room(1, "orbit", (gp) => {
    const core = mkGlow(warmTex, MOBILE ? 15 : 11.5, 0.75); core.position.set(SIDE + 3, 0.5, -2); gp.add(core);
    const corePulse = mkGlow(warmTex, 4, 0.0); corePulse.position.copy(core.position); gp.add(corePulse);
    const moons = new THREE.Group(); moons.position.copy(core.position);
    const trailPts = [];
    for (let i = 0; i < 7; i++) {
      const r = 4.4 + i * 1.45;
      const ring = new THREE.Line(circleGeo(r), lineMat(MOBILE ? 0.22 : 0.19));
      ring.rotation.x = 0.42;
      moons.add(ring);
      const moon = mkGlow(coolTex, MOBILE ? 2.1 : 1.7, 0.95);
      moon.userData = { r, a: (i / 7) * Math.PI * 2, v: 0.05 + i * 0.011, i };
      moons.add(moon);
      // trail — 26 fading points behind each moon
      const T = 26;
      const tp = new Float32Array(T * 3);
      const tg = new THREE.BufferGeometry();
      tg.setAttribute("position", new THREE.BufferAttribute(tp, 3));
      const trail = new THREE.Line(tg, lineMat(0.30));
      trail.userData = { pts: [], T, moon };
      moons.add(trail);
      trailPts.push(trail);
    }
    gp.add(moons);
    gp.userData = { core, corePulse, moons, trails: trailPts, drops: [], dropT: 0 };
  });

  // 02 · THE COMPILER — a service graph that assembles as you approach
  room(2, "agentlab", (gp) => {
    const graph = new THREE.Group(); graph.position.set(MOBILE ? 1 : 7, 0.2, -2);
    const targets = [
      [-12, 0, 0], [-7, 5, 0], [-7, -4, 0], [-1, 2, 0], [4, 6, 0], [4, -4, 0], [10, 2, 0], [11, -6, 0]
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const scatter = targets.map((p, i) => p.clone().add(new THREE.Vector3(
      (hash(i * 7 + 1) - 0.5) * 30, (hash(i * 7 + 2) - 0.5) * 22, (hash(i * 7 + 3) - 0.5) * 26 - 8
    )));
    const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [5, 7], [6, 7]];
    const edgeLines = edges.map(([a, b]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([targets[a], targets[b]]);
      const line = new THREE.Line(geo, lineMat(0.0));
      line.userData = { a, b };
      graph.add(line);
      return line;
    });
    const nodes = targets.map((p, i) => {
      const isGate = i === 5;
      const node = mkGlow(isGate ? warmTex : coolTex, i === 3 ? 3.1 : 1.9, isGate ? 0.9 : 0.8);
      node.position.copy(scatter[i]);
      node.userData = { i, isGate };
      graph.add(node);
      return node;
    });
    const boundary = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 18), new THREE.MeshBasicMaterial({ color: 0x9fb88f, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    boundary.position.set(7.5, 0, 0); graph.add(boundary);
    const gateFlash = mkGlow(coolTex, 7, 0.0); gateFlash.position.copy(targets[5]); graph.add(gateFlash);
    graph.scale.setScalar(1.28);
    gp.add(graph);
    gp.userData = { graph, nodes, edgeLines, targets, scatter, assembly: 0, approved: false, gateFlash };
  });

  // 03 · THE BALANCE — outcomes fall as drops of light and are weighed
  room(3, "gate", (gp) => {
    const scales = new THREE.Group(); scales.position.set(-SIDE - 3.5, -0.8, -4); scales.scale.setScalar(0.82);
    const beamGroup = new THREE.Group();
    const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-7, 1, 0), new THREE.Vector3(7, 1, 0)]), lineMat(0.7));
    beamGroup.add(beam);
    [-1, 1].forEach((side) => {
      const stem = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(side * 5, 1, 0), new THREE.Vector3(side * 5, -3, 0)]), lineMat(0.5));
      const pan = new THREE.Line(circleGeo(2.4), lineMat(0.6)); pan.rotation.x = Math.PI / 2; pan.position.set(side * 5, -3, 0);
      const panGlow = mkGlow(side < 0 ? warmTex : coolTex, 4.2, 0.26); panGlow.position.set(side * 5, -3, 0);
      beamGroup.add(stem, pan, panGlow);
      if (side < 0) gp.userData = { ...(gp.userData || {}), panWarm: panGlow }; else gp.userData = { ...(gp.userData || {}), panCool: panGlow };
    });
    scales.add(beamGroup);
    const core = mkGlow(coolTex, 8, 0.5); core.position.set(0, 1, 0); scales.add(core);
    gp.add(scales);
    const drops = [];
    for (let i = 0; i < 7; i++) {
      const d = mkGlow(hash(i) > 0.35 ? coolTex : warmTex, 1.1, 0.0);
      scales.add(d);
      drops.push({ s: d, t: hash(i * 3) * 2.4, side: hash(i) > 0.35 ? 1 : -1 });
    }
    gp.userData = { ...(gp.userData || {}), scales, beamGroup, drops };
  });

  // 04 · THE FIELD — a breathing crop of candle-light
  room(4, "field", (gp) => {
    const N = Q.candles;
    const geo = new THREE.BoxGeometry(0.09, 1, 0.09);
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false });
    const field = new THREE.InstancedMesh(geo, mat, N);
    const dummy = new THREE.Object3D();
    const H = new Float32Array(N), PH = new Float32Array(N);
    const color = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const gx = (hash(i * 5 + 1) - 0.5) * 56;
      const gz = (hash(i * 5 + 2) - 0.5) * 20 - 12;
      const h = 1.1 + Math.pow(hash(i * 5 + 3), 1.8) * 3.9;
      H[i] = h; PH[i] = hash(i * 5 + 4) * Math.PI * 2;
      dummy.position.set(gx, -7.5 + h / 2, gz);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      field.setMatrixAt(i, dummy.matrix);
      color.copy(hash(i * 5 + 5) > 0.5 ? C_MOON : C_WARM).multiplyScalar(0.35 + hash(i) * 0.3);
      field.setColorAt(i, color);
    }
    field.instanceMatrix.needsUpdate = true;
    if (field.instanceColor) field.instanceColor.needsUpdate = true;
    gp.add(field);
    const mist = mkGlow(coolTex, MOBILE ? 36 : 30, 0.22); mist.position.set(0, -2, -4); gp.add(mist);
    gp.userData = { field, H, PH, N, dummy };
  });

  // 05 · THE CONDENSER — demand spirals in, product light emerges
  room(5, "voice", (gp) => {
    const hub = new THREE.Group(); hub.position.set(SIDE, 0.5, 0);
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Line(circleGeo(3.4 + i * 1.35), lineMat(0.42 - i * 0.09));
      ring.rotation.x = Math.PI / 2;
      hub.add(ring);
    }
    const heart = mkGlow(warmTex, MOBILE ? 9 : 7.5, 0.6); hub.add(heart);
    // vortex particles
    const N = Q.vortex;
    const pos = new Float32Array(N * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ map: pointTex, color: 0xafc2d2, size: 0.14, transparent: true, opacity: 0.75, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const vortex = new THREE.Points(g, m);
    const P = [];
    for (let i = 0; i < N; i++) P.push({ a: hash(i) * Math.PI * 2, r: 4 + hash(i + 1) * 13, y: (hash(i + 2) - 0.5) * 9, v: 0.25 + hash(i + 3) * 0.5 });
    vortex.userData = { P, N };
    hub.add(vortex);
    // emission rings — product pulses outward
    const bursts = [];
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Line(circleGeo(1), lineMat(0.0, 0xe8e2d5));
      b.rotation.x = Math.PI / 2;
      hub.add(b);
      bursts.push({ line: b, t: i * 1.4 });
    }
    gp.add(hub);
    gp.userData = { hub, heart, vortex, bursts };
  });

  // 06 · THE HALL OF TIME — plaques ignite as you pass
  room(6, "starline", (gp) => {
    const coneTex = vGradTex("175,194,210", 0.55, 0);
    const plaques = [];
    for (let i = 0; i < 5; i++) {
      const side = i % 2 ? -1 : 1;
      const px = side * (7 + i * 1.1), pz = -i * 7 - 2;
      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(3.4, 2.1),
        new THREE.MeshBasicMaterial({ color: 0xafc2d2, transparent: true, opacity: 0.02, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      plaque.position.set(px, 0.6, pz);
      plaque.rotation.y = side * -0.5;
      gp.add(plaque);
      const edge = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.03), plaque.material.clone());
      edge.material.opacity = 0.0;
      edge.position.copy(plaque.position); edge.position.y += 1.08; edge.rotation.copy(plaque.rotation);
      gp.add(edge);
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(2.0, 6.4, 24, 1, true),
        new THREE.MeshBasicMaterial({ map: coneTex, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
      );
      cone.position.set(px, 3.6, pz);
      gp.add(cone);
      const lamp = mkGlow(coolTex, 5, 0.0);
      lamp.position.set(px, 1.9, pz);
      gp.add(lamp);
      plaques.push({ plaque, edge, cone, lamp, worldZ: roomZ(6) + pz, lit: 0 });
    }
    gp.userData = { plaques };
  });

  // 07 · THE DOOR — warm light you leave through
  room(7, "singularity", (gp) => {
    const dc = document.createElement("canvas"); dc.width = 64; dc.height = 256;
    const dg = dc.getContext("2d");
    const dgrad = dg.createLinearGradient(0, 0, 0, 256);
    dgrad.addColorStop(0, "rgba(232,226,213,0)");
    dgrad.addColorStop(0.4, "rgba(232,226,213,0.06)");
    dgrad.addColorStop(0.75, "rgba(232,226,213,0.42)");
    dgrad.addColorStop(1, "rgba(232,226,213,0.95)");
    dg.fillStyle = dgrad; dg.fillRect(0, 0, 64, 256);
    const doorTex = new THREE.CanvasTexture(dc);
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(5.8, 13.4),
      new THREE.MeshBasicMaterial({ map: doorTex, transparent: true, opacity: 0.44, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    door.position.set(0, -3.2, -20);
    gp.add(door);
    [-1, 1].forEach((side) => {
      const jamb = new THREE.Mesh(
        new THREE.PlaneGeometry(0.16, 13.6),
        new THREE.MeshBasicMaterial({ map: doorTex, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      jamb.position.set(side * 3.0, -3.2, -20);
      gp.add(jamb);
    });
    const doorGlow = mkGlow(warmTex, 30, 0.5); doorGlow.position.set(0, -5, -20.5); gp.add(doorGlow);
    // dust streaming INTO the door
    const N = 500;
    const pos = new Float32Array(N * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const stream = new THREE.Points(g, new THREE.PointsMaterial({ map: pointTex, color: 0xe8e2d5, size: 0.12, transparent: true, opacity: 0.0, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    const P = [];
    for (let i = 0; i < N; i++) P.push({ a: hash(i) * Math.PI * 2, r: 3 + hash(i + 1) * 16, z: 8 - hash(i + 2) * 24, v: 0.3 + hash(i + 3) * 0.7 });
    stream.userData = { P, N };
    gp.add(stream);
    gp.userData = { door, doorGlow, stream };
  });

  /* ── THE NAME — the visitor's first breath: dust becomes the name ───── */
  let nameCloud = null;
  function buildNameParticles() {
    if (MOBILE) return; // the mobile name wraps to two lines — DOM carries it there
    const el = document.querySelector(".world-name");
    if (!el) return;
    const c = document.createElement("canvas");
    c.width = 1600; c.height = 320;
    const g = c.getContext("2d");
    g.font = "600 190px 'Space Grotesk', 'IBM Plex Sans', sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "#fff";
    g.fillText("Vamsi Venkatesh", 800, 168);
    const data = g.getImageData(0, 0, c.width, c.height).data;
    const step = MOBILE ? 4 : 3;
    const pts = [];
    for (let y = 0; y < c.height; y += step) {
      for (let x = 0; x < c.width; x += step) {
        if (data[(y * c.width + x) * 4 + 3] > 120) pts.push([x, y]);
      }
    }
    const N = pts.length;
    const pos = new Float32Array(N * 3), tgt = new Float32Array(N * 3), sct = new Float32Array(N * 3), dly = new Float32Array(N);
    // scale from the sampled bounds, not measureText — canvas font metrics can
    // come from the fallback face and skew the projection by 30-40%
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of pts) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    const cxPx = (minX + maxX) / 2, cyPx = (minY + maxY) / 2;
    const textW = Math.max(1, maxX - minX);
    for (let i = 0; i < N; i++) {
      tgt[i * 3] = pts[i][0] - cxPx;
      tgt[i * 3 + 1] = -(pts[i][1] - cyPx);
      tgt[i * 3 + 2] = 0;
      const a = hash(i) * Math.PI * 2, b = hash(i + 1) * Math.PI, r = 14 + hash(i + 2) * 26;
      sct[i * 3] = Math.cos(a) * Math.sin(b) * r * 1.6;
      sct[i * 3 + 1] = (Math.cos(b) * r) * 0.7 - 6;
      sct[i * 3 + 2] = Math.sin(a) * Math.sin(b) * r * 0.8;
      dly[i] = hash(i + 4) * 0.85;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ map: pointTex, color: 0xffffff, size: MOBILE ? 0.17 : 0.15, transparent: true, opacity: 0.98, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    scene3.add(points);
    nameCloud = { points, N, tgt, sct, dly, textW, center: new THREE.Vector3(), scale: 1, aT: 0, hit: new THREE.Vector3(), hasHit: false };
    placeName();
    document.body.classList.add("name-3d");
  }
  function placeName() {
    if (!nameCloud) return;
    const el = document.querySelector(".world-name");
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dist = 20;
    const vh = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const vw = vh * (window.innerWidth / window.innerHeight);
    const ndcX = (r.left + r.width / 2) / window.innerWidth * 2 - 1;
    const ndcY = -(((r.top + r.height / 2) / window.innerHeight) * 2 - 1);
    nameCloud.center.set(ndcX * vw / 2, ndcY * vh / 2, CAMERA_START - dist);
    nameCloud.scale = ((r.width / window.innerWidth) * vw) / nameCloud.textW;
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { try { buildNameParticles(); } catch (e) { console.warn("[world] name particles:", e); } });
  } else { try { buildNameParticles(); } catch (e) {} }

  /* ── LIGHT-GATES — a ring you pass through at every room boundary ───── */
  const gates = [];
  {
    const ringGeo = new THREE.TorusGeometry(10.5, 0.04, 8, 96);
    for (let k = 0; k < 7; k++) {
      const gz = -(k + 0.5) * STEP + CAMERA_START * 0; // boundary between rooms
      const mat = new THREE.MeshBasicMaterial({ color: 0xd9e2ea, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false });
      const ring = new THREE.Mesh(ringGeo, mat);
      ring.position.set(0, 0.5, -(k + 0.5) * STEP - 6);
      scene3.add(ring);
      const glow = mkGlow(coolTex, 5, 0.0);
      glow.position.copy(ring.position);
      scene3.add(glow);
      gates.push({ ring, glow });
    }
  }

  /* ── INTRO FLIGHT — race down the hall, land at the threshold ───────── */
  let streaks;
  {
    const N = 240;
    const pos = new Float32Array(N * 2 * 3);
    for (let i = 0; i < N; i++) {
      const x = (Math.random() - 0.5) * 56, y = -6 + Math.random() * 20, z = CAMERA_START + 160 - Math.random() * 520;
      const len = 2.5 + Math.random() * 5;
      pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = z;
      pos[i * 6 + 3] = x; pos[i * 6 + 4] = y; pos[i * 6 + 5] = z + len;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    streaks = new THREE.LineSegments(g, lineMat(0.4, 0xd9e2ea));
    scene3.add(streaks);
  }

  /* ── FOREGROUND — soft light passing close to the lens.
     Depth in FRONT of you is what makes a hall a place, not a backdrop. ── */
  {
    const fg = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const s = mkGlow(i % 3 ? coolTex : warmTex, 9 + hash(i) * 11, 0.05 + hash(i + 1) * 0.05);
      s.position.set(
        (hash(i + 2) > 0.5 ? 1 : -1) * (3.5 + hash(i + 3) * 5.5),
        -2 + hash(i + 4) * 6,
        20 - i * 46 - hash(i + 5) * 22
      );
      fg.add(s);
    }
    scene3.add(fg);
  }

  /* ── PANELS IN THE HALL — the content stands in the world.
     Each section's card is signage you approach, face, and walk past. ──── */
  const PANEL_Z_IN = MOBILE ? 400 : 640;   // how deep a panel starts
  const PANEL_Z_OUT = MOBILE ? 280 : 470;  // how far it sweeps past the lens
  const panels = [];
  const heroUI = document.querySelector(".hero-ui");

  /* ── camera rail — one continuous dolly with weave and banking ──────── */
  const railCurve = new THREE.CatmullRomCurve3(
    [0, 1, 2, 3, 4, 5, 6, 7].map((k) => new THREE.Vector3(
      [0, 3.2, 2.6, -3.4, 0.6, 3.2, -1.4, 0][k],
      [0.6, 0.9, 0.7, 0.9, 1.4, 0.8, 0.7, 0.2][k] + (MOBILE ? 1.2 : 0),
      CAMERA_START - k * STEP
    )), false, "catmullrom", 0.35
  );
  const FOCUS_X = [0, SIDE * 0.55, MOBILE ? 3 : 6.5, -SIDE * 0.5, 0, SIDE * 0.55, 0, 0];

  /* ── scroll → progress (native scroll, world lerps behind the hand) ─── */
  const ORDER = ["name", "orbit", "agentlab", "gate", "field", "voice", "starline", "singularity"];
  let centers = [];
  function measure() {
    centers = ORDER.map((name) => {
      const el = document.querySelector(`[data-scene="${name}"]`);
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY + r.height / 2;
    });
  }
  function progressFromScroll() {
    const mid = window.scrollY + window.innerHeight / 2;
    if (mid <= centers[0]) return 0;
    for (let i = 0; i < centers.length - 1; i++) {
      if (mid < centers[i + 1]) return i + (mid - centers[i]) / (centers[i + 1] - centers[i]);
    }
    return ORDER.length - 1;
  }
  ORDER.forEach((key, idx) => {
    if (idx === 0) return;
    const sec = document.querySelector(`[data-scene="${key}"]`);
    if (!sec) return;
    const el = sec.querySelector(".scene-card") || sec.querySelector(".container");
    if (!el) return;
    const side = el.classList.contains("right") ? 1 : (key === "singularity" ? 0 : -1);
    el.style.willChange = "transform, opacity";
    panels.push({ el, side, idx, resting: true });
  });

  /* ── entrance ───────────────────────────────────────────────────────── */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  let introLocked = true;
  let opened = 0;
  document.body.classList.add("booting");
  setTimeout(() => { document.body.classList.add("world-on"); document.body.classList.remove("booting"); }, 850);
  setTimeout(() => { document.body.classList.add("name-revealed"); }, 1750);
  setTimeout(() => { introLocked = false; }, 2400);
  setTimeout(() => { document.body.classList.add("world-on", "name-revealed"); document.body.classList.remove("booting"); introLocked = false; }, 5000);

  /* ── picking ────────────────────────────────────────────────────────── */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const ptr = { x: 0, y: 0, cx: 0, cy: 0, live: false };
  let doorPush = 0, doorPushV = 0;
  function pickExhibit(cx, cy) {
    ndc.x = (cx / window.innerWidth) * 2 - 1;
    ndc.y = -(cy / window.innerHeight) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    ray.far = 220;
    for (const ex of exhibits) {
      const hits = ray.intersectObjects(ex.group.children, true);
      if (hits.length) return ex;
    }
    return null;
  }
  if (FINE) {
    window.addEventListener("pointermove", (e) => {
      ptr.live = true;
      ptr.x = e.clientX / window.innerWidth - 0.5;
      ptr.y = e.clientY / window.innerHeight - 0.5;
      const ex = pickExhibit(e.clientX, e.clientY);
      document.body.classList.toggle("cursor-near", !!ex && ex.key === "singularity");
    }, { passive: true });
    canvas.style.pointerEvents = "auto";
    canvas.addEventListener("click", (e) => {
      const ex = pickExhibit(e.clientX, e.clientY);
      if (!ex || introLocked) return;
      if (ex.key === "singularity" && activeKey === "singularity") {
        const doorMesh = exhibits[7].group.userData.door;
        ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
        ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
        ray.setFromCamera(ndc, camera);
        if (!ray.intersectObject(doorMesh, false).length) return;
        // walk THROUGH the door — a breath of light, then the contact stands alone
        doorPushV = 1;
        document.body.classList.add("door-pass");
        setTimeout(() => document.body.classList.remove("door-pass"), 1500);
        return;
      }
      const el = document.querySelector(`[data-scene="${ex.key}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ── post pipeline: scene → brightpass/blur bloom → composite grade ─── */
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  function fsQuad(mat) { const s = new THREE.Scene(); s.add(new THREE.Mesh(quadGeo, mat)); return s; }
  const rtOpts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true };
  let rtScene, rtA, rtB;
  function makeTargets() {
    const w = Math.max(2, Math.floor(window.innerWidth * Q.dpr));
    const h = Math.max(2, Math.floor(window.innerHeight * Q.dpr));
    rtScene?.dispose(); rtA?.dispose(); rtB?.dispose();
    rtScene = new THREE.WebGLRenderTarget(w, h, rtOpts);
    rtA = new THREE.WebGLRenderTarget(w >> 2, h >> 2, { ...rtOpts, depthBuffer: false });
    rtB = new THREE.WebGLRenderTarget(w >> 2, h >> 2, { ...rtOpts, depthBuffer: false });
  }
  const brightMat = new THREE.ShaderMaterial({
    uniforms: { tIn: { value: null } },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.);}",
    fragmentShader: `varying vec2 vUv; uniform sampler2D tIn;
      void main(){ vec3 c = texture2D(tIn, vUv).rgb;
        float l = dot(c, vec3(0.299,0.587,0.114));
        gl_FragColor = vec4(c * smoothstep(0.52, 0.95, l), 1.0); }`,
    depthWrite: false, depthTest: false,
  });
  const blurMat = new THREE.ShaderMaterial({
    uniforms: { tIn: { value: null }, uDir: { value: new THREE.Vector2(1, 0) }, uRes: { value: new THREE.Vector2(1, 1) } },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.);}",
    fragmentShader: `varying vec2 vUv; uniform sampler2D tIn; uniform vec2 uDir; uniform vec2 uRes;
      void main(){
        vec2 px = uDir / uRes;
        vec3 c = texture2D(tIn, vUv).rgb * 0.227;
        c += (texture2D(tIn, vUv + px*1.384).rgb + texture2D(tIn, vUv - px*1.384).rgb) * 0.316;
        c += (texture2D(tIn, vUv + px*3.230).rgb + texture2D(tIn, vUv - px*3.230).rgb) * 0.070;
        gl_FragColor = vec4(c, 1.0); }`,
    depthWrite: false, depthTest: false,
  });
  const compMat = new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: null }, tBloom: { value: null },
      uTime: { value: 0 }, uTint: { value: new THREE.Color(1, 1, 1) },
      uBloom: { value: 0.95 }, uChroma: { value: Q.chroma ? 1.0 : 0.0 }, uVig: { value: 0.32 },
    },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.);}",
    fragmentShader: `varying vec2 vUv; uniform sampler2D tScene; uniform sampler2D tBloom;
      uniform float uTime; uniform vec3 uTint; uniform float uBloom; uniform float uChroma; uniform float uVig;
      float grain(vec2 uv){ return fract(sin(dot(uv*vec2(1234.5,987.3)+uTime*61.7, vec2(12.9898,78.233)))*43758.5453); }
      void main(){
        vec2 d = vUv - 0.5;
        float r2 = dot(d,d);
        vec3 col;
        if (uChroma > 0.5) {
          float ab = 0.0013 * r2 * 4.0;
          col.r = texture2D(tScene, vUv + d*ab).r;
          col.g = texture2D(tScene, vUv).g;
          col.b = texture2D(tScene, vUv - d*ab).b;
        } else { col = texture2D(tScene, vUv).rgb; }
        col += texture2D(tBloom, vUv).rgb * uBloom;
        col = mix(col, col * uTint, 0.30);
        col *= 1.0 - uVig * smoothstep(0.18, 0.62, r2);
        col += (grain(vUv) - 0.5) * 0.028;
        gl_FragColor = vec4(col, 1.0); }`,
    depthWrite: false, depthTest: false,
  });
  const brightScene = fsQuad(brightMat), blurScene = fsQuad(blurMat), compScene = fsQuad(compMat);
  makeTargets();

  const ROOM_TINT = [
    new THREE.Color(0.96, 0.99, 1.06),  // name — cool arrival
    new THREE.Color(1.05, 1.01, 0.95),  // orbit — warm work
    new THREE.Color(0.97, 1.03, 0.99),  // agentlab — moss-cool
    new THREE.Color(0.98, 1.0, 1.04),   // gate — impartial cold
    new THREE.Color(0.99, 1.0, 1.03),   // field
    new THREE.Color(1.06, 1.0, 0.94),   // voice — condensing warm
    new THREE.Color(1.0, 1.0, 1.0),     // starline
    new THREE.Color(1.08, 1.02, 0.93),  // singularity — the warm door
  ];

  /* ── sizing ─────────────────────────────────────────────────────────── */
  function size() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    makeTargets();
    measure();
  }
  size();
  window.addEventListener("resize", size, { passive: true });

  /* ── the walk ───────────────────────────────────────────────────────── */
  let running = true, smP = 0, lastP = 0, activeKey = "";
  const clock = new THREE.Clock();
  const tintNow = new THREE.Color(1, 1, 1);
  // adaptive quality: degrade gracefully before dropping frames
  let emaDt = 16, slow = 0;

  const V3a = new THREE.Vector3(), V3b = new THREE.Vector3();

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta ? 0.016 : 0.016, 0.05); // fixed feel; clock.getDelta consumed below
    emaDt = emaDt * 0.95 + (performance.now() - (frame._last || performance.now())) * 0.05;
    frame._last = performance.now();
    if (emaDt > 21) { if (++slow > 90) { degrade(); slow = 0; } } else if (slow > 0) slow--;

    opened += ((document.body.classList.contains("world-on") ? 1 : 0) - opened) * 0.03;
    const raw = introLocked ? 0 : progressFromScroll();
    smP += (raw - smP) * 0.11;
    // door walk-through push
    doorPush += ((doorPushV > 0 ? 0.42 : 0) - doorPush) * 0.06;
    if (doorPushV > 0) { doorPushV -= 0.012; if (doorPushV <= 0) doorPushV = 0; }
    const p = Math.min(smP + doorPush, ORDER.length - 1 + 0.48);
    const vel = Math.abs(smP - lastP); lastP = smP;
    document.documentElement.style.setProperty("--vel", Math.min(vel * 40, 1).toFixed(3));

    // rail camera: position from spline, look ahead with per-room focus
    const u = Math.max(0, Math.min(1, p / (ORDER.length - 1)));
    railCurve.getPoint(u, V3a);
    ptr.cx += (ptr.x - ptr.cx) * 0.035; ptr.cy += (ptr.y - ptr.cy) * 0.035;
    camera.position.set(
      V3a.x + ptr.cx * (MOBILE ? 1.3 : 2.6) + Math.sin(t * 0.4) * 0.24,
      V3a.y + Math.sin(t * 0.55) * 0.16 - ptr.cy * (MOBILE ? 0.7 : 1.7),
      V3a.z
    );
    // intro flight — race down the hall, land at the threshold
    const flight = introLocked ? 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - 0.45) / 1.85)), 3) : 1;
    if (flight < 0.9995) {
      camera.position.z += (1 - flight) * 170;
      camera.fov = (MOBILE ? 56 : 48) + (1 - flight) * 16;
      camera.updateProjectionMatrix();
    } else if (camera.fov !== (MOBILE ? 56 : 48)) {
      camera.fov = MOBILE ? 56 : 48;
      camera.updateProjectionMatrix();
    }
    if (streaks) {
      streaks.material.opacity = 0.42 * (1 - flight);
      streaks.visible = flight < 0.999;
    }

    const k = Math.round(smP);
    const ki = Math.max(0, Math.min(ORDER.length - 1, k));
    const uAhead = Math.max(0, Math.min(1, (p + 0.32) / (ORDER.length - 1)));
    railCurve.getPoint(uAhead, V3b);
    const fx = FOCUS_X[ki] * (MOBILE ? 0.8 : 0.62);
    camera.lookAt(
      V3b.x * 0.4 + fx,
      (MOBILE ? 0.85 : 0.2) - ptr.cy * (MOBILE ? 0.9 : 2.2),
      V3b.z - (MOBILE ? 30 : 22)
    );
    // gentle banking into the weave
    camera.rotation.z += (V3b.x - V3a.x) * -0.006;

    const nextActive = ORDER[ki];
    if (nextActive !== activeKey) {
      activeKey = nextActive;
      document.documentElement.dataset.room = activeKey;
      document.querySelectorAll("[data-jump]").forEach((button) => {
        button.classList.toggle("active", button.dataset.jump === activeKey);
      });
    }
    tintNow.lerp(ROOM_TINT[ki], 0.04);
    compMat.uniforms.uTint.value.copy(tintNow);
    compMat.uniforms.uTime.value = t;

    /* — panels stand in the hall: depth cue only, reading always wins.
       Driven by the section's OWN viewport position (raw, instant): no lag,
       no blur, no heavy fade, rotation ≤ 4deg. — */
    const vh2 = window.innerHeight / 2;
    for (const pn of panels) {
      const sec = pn.el.closest("section") || pn.el;
      const r = sec.getBoundingClientRect();
      const rel = -(r.top + r.height / 2 - vh2) / (r.height * 0.9); // -1 below → 0 centered → 1 above
      if (rel < -1.2 || rel > 1.2) {
        if (!pn.resting) { pn.el.style.transform = ""; pn.el.style.opacity = ""; pn.resting = true; }
        continue;
      }
      pn.resting = false;
      const a = Math.max(-1, Math.min(1, rel));
      const tz = a < 0 ? a * (MOBILE ? 150 : 260) : a * (MOBILE ? 90 : 150);
      const op = 1 - Math.abs(a) * 0.28;
      const ry = pn.side === 0 ? 0 : a * -4 * pn.side;
      pn.el.style.transform = `perspective(1400px) translate3d(0px, 0px, ${tz.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
      pn.el.style.opacity = op.toFixed(3);
    }
    // the hero recedes gently as you step in — from raw scroll, never laggy
    if (heroUI) {
      const hz = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
      if (hz > 0.002) {
        heroUI.style.transform = `perspective(1400px) translate3d(0px, ${(-hz * 18).toFixed(1)}px, ${(hz * (MOBILE ? 180 : 300)).toFixed(1)}px)`;
        heroUI.style.opacity = Math.max(0, 1 - hz * 1.15).toFixed(3);
      } else {
        heroUI.style.transform = "";
        heroUI.style.opacity = "";
      }
    }

    /* — the name breathes, flows around your hand, disperses as you walk — */
    if (nameCloud && nameCloud.points.visible) {
      if (document.body.classList.contains("name-revealed")) nameCloud.aT += 0.016;
      const dis = Math.max(0, Math.min(1, (smP - 0.18) / 0.4));
      if (dis >= 1) { nameCloud.points.visible = false; }
      else {
        // pointer → name plane
        nameCloud.hasHit = false;
        if (FINE && ptr.live && nameCloud.aT > 1.6) {
          ndc.x = ptr.x * 2; ndc.y = -ptr.y * 2;
          ray.setFromCamera(ndc, camera);
          const dz = nameCloud.center.z - ray.ray.origin.z;
          if (Math.abs(ray.ray.direction.z) > 1e-4) {
            const s = dz / ray.ray.direction.z;
            if (s > 0) { nameCloud.hit.copy(ray.ray.origin).addScaledVector(ray.ray.direction, s); nameCloud.hasHit = true; }
          }
        }
        const arr = nameCloud.points.geometry.attributes.position.array;
        const { N, tgt, sct, dly, center, scale, hit, hasHit } = nameCloud;
        const R = 2.4, R2 = R * R;
        for (let i = 0; i < N; i++) {
          const gg = Math.max(0, Math.min(1, (nameCloud.aT - dly[i]) / 1.15));
          const e = gg * gg * (3 - 2 * gg);
          let px = (sct[i * 3] + center.x) + (center.x + tgt[i * 3] * scale - (sct[i * 3] + center.x)) * e;
          let py = (sct[i * 3 + 1] + center.y) + (center.y + tgt[i * 3 + 1] * scale - (sct[i * 3 + 1] + center.y)) * e;
          let pz = (sct[i * 3 + 2] + center.z) + (center.z - (sct[i * 3 + 2] + center.z)) * e;
          py += Math.sin(t * 1.3 + i * 0.7) * 0.016;
          px += Math.sin(t * 0.9 + i * 1.3) * 0.012;
          if (hasHit) {
            const dx = px - hit.x, dy = py - hit.y, d2 = dx * dx + dy * dy;
            if (d2 < R2 && d2 > 1e-6) {
              const d = Math.sqrt(d2), f = (1 - d / R) * 1.7;
              px += (dx / d) * f; py += (dy / d) * f;
            }
          }
          if (dis > 0) {
            px += (px - center.x) * dis * 2.2;
            py += (py - center.y) * dis * 1.4 + dis * dis * 4;
            pz += dis * 34;
          }
          arr[i * 3] = px; arr[i * 3 + 1] = py; arr[i * 3 + 2] = pz;
        }
        nameCloud.points.material.opacity = 0.98 * (1 - dis) * Math.min(1, flight * 1.4);
        nameCloud.points.geometry.attributes.position.needsUpdate = true;
      }
      if (smP < 0.18) nameCloud.points.visible = true;
    }

    /* — light-gates flare as you pass through them — */
    for (const gt of gates) {
      const d = Math.abs(camera.position.z - gt.ring.position.z);
      const a = Math.max(0, 1 - d / 13);
      gt.ring.material.opacity = 0.045 + a * 0.5;
      gt.ring.scale.setScalar(1 + a * 0.12);
      gt.glow.material.opacity = a * 0.3;
      gt.ring.rotation.z = t * 0.05;
    }

    /* — the veil parts — */
    if (!veilDone && veil) {
      const vd = veil.userData;
      if (!introLocked || flight > 0.96) vd.t += 0.011;
      const arr = veil.geometry.attributes.position.array;
      let allGone = vd.t > 2.2;
      for (let i = 0; i < vd.N; i++) {
        const lt = Math.max(0, Math.min(1, (vd.t - vd.dly[i]) / 1.3));
        const e = lt * lt * (3 - 2 * lt);
        arr[i * 3] = vd.base[i * 3] + vd.dir[i * 3] * e;
        arr[i * 3 + 1] = vd.base[i * 3 + 1] + vd.dir[i * 3 + 1] * e;
        arr[i * 3 + 2] = vd.base[i * 3 + 2] + vd.dir[i * 3 + 2] * e;
      }
      veil.material.opacity = 0.8 * (1 - Math.min(1, vd.t / 2.1));
      veil.geometry.attributes.position.needsUpdate = true;
      if (allGone) { veil.visible = false; veilDone = true; }
    }

    /* — threshold horizon — */
    {
      const gp = exhibits[0].group;
      const past = Math.max(0, 1 - smP * 2.8);
      if (gp.userData.bar) { gp.userData.bar.scale.x = 0.02 + opened * 0.98; gp.userData.bar.material.opacity = (0.3 + opened * 0.6) * past; }
      if (gp.userData.halo) gp.userData.halo.material.opacity = 0.34 * past;
      for (let i = 0; i < 3; i++) { const r = gp.userData["oring" + i]; if (r) r.rotation.z = t * (0.008 + i * 0.004); }
    }

    /* — spine packets flow forever — */
    {
      const sp = spinePackets.userData;
      const arr = spinePackets.geometry.attributes.position.array;
      for (let i = 0; i < sp.N; i++) {
        sp.t[i] += sp.v[i] * 0.14;
        if (sp.t[i] > 1) sp.t[i] -= 1;
        spineCurve.getPoint(sp.t[i], V3b);
        arr[i * 3] = V3b.x; arr[i * 3 + 1] = V3b.y + Math.sin(t * 2 + i) * 0.14; arr[i * 3 + 2] = V3b.z;
      }
      spinePackets.geometry.attributes.position.needsUpdate = true;
    }

    /* — orrery: seven agents, memory drops to the core — */
    {
      const ud = exhibits[1].group.userData;
      const active = activeKey === "orbit" ? 1 : 0;
      ud.moons.scale.setScalar(1.35 * (1 + active * (MOBILE ? 0.12 : 0.06)));
      ud.moons.children.forEach((ch) => {
        if (ch.isSprite && ch.userData.r) {
          ch.userData.a += ch.userData.v * 0.016;
          ch.position.set(Math.cos(ch.userData.a) * ch.userData.r, Math.sin(ch.userData.a) * ch.userData.r * 0.42, Math.sin(ch.userData.a) * ch.userData.r * 0.3);
        }
      });
      // trails
      for (const trail of ud.trails) {
        const m = trail.userData.moon;
        trail.userData.pts.unshift(m.position.clone());
        if (trail.userData.pts.length > trail.userData.T) trail.userData.pts.pop();
        const arr = trail.geometry.attributes.position.array;
        for (let i = 0; i < trail.userData.T; i++) {
          const q = trail.userData.pts[Math.min(i, trail.userData.pts.length - 1)];
          arr[i * 3] = q.x; arr[i * 3 + 1] = q.y; arr[i * 3 + 2] = q.z;
        }
        trail.geometry.attributes.position.needsUpdate = true;
        trail.material.opacity = 0.10 + active * 0.16;
      }
      // memory drops: moon → core
      ud.dropT += 0.016;
      if (ud.dropT > 1.1 && ud.drops.length < 4) {
        ud.dropT = 0;
        const mi = Math.floor(hash(t * 13.7) * 7);
        const moon = ud.moons.children.filter((c) => c.isSprite && c.userData.r)[mi];
        if (moon) {
          const d = mkGlow(coolTex, 1.0, 0.9);
          d.position.copy(moon.position).add(ud.moons.position);
          exhibits[1].group.add(d);
          ud.drops.push({ s: d, from: d.position.clone(), t: 0 });
        }
      }
      ud.drops = ud.drops.filter((dr) => {
        dr.t += 0.02;
        const e = dr.t * dr.t * (3 - 2 * dr.t);
        dr.s.position.lerpVectors(dr.from, ud.core.position, e);
        dr.s.material.opacity = 0.9 * (1 - dr.t * 0.6);
        if (dr.t >= 1) {
          exhibits[1].group.remove(dr.s);
          ud.corePulse.material.opacity = 0.5;
          return false;
        }
        return true;
      });
      ud.corePulse.material.opacity *= 0.94;
      ud.corePulse.scale.setScalar(4 + (0.5 - ud.corePulse.material.opacity) * 14);
    }

    /* — the compiler assembles as you approach — */
    {
      const ud = exhibits[2].group.userData;
      const near = Math.max(0, 1 - Math.abs(smP - 2) / 1.0);
      ud.assembly += (near - ud.assembly) * 0.05;
      const a = ud.assembly, e = a * a * (3 - 2 * a);
      ud.nodes.forEach((n, i) => {
        n.position.lerpVectors(ud.scatter[i], ud.targets[i], e);
        const pulse = 1 + Math.sin(t * 0.9 + i) * 0.08 * e;
        n.scale.setScalar((i === 3 ? 3.1 : 1.9) * pulse * (0.4 + 0.6 * e));
        if (n.userData.isGate && e < 0.98) n.material.opacity = 0.5 + Math.sin(t * 5) * 0.35; // amber breath — waiting on the human
        else n.material.opacity = 0.8;
      });
      ud.edgeLines.forEach((ln) => {
        const arr = ln.geometry.attributes.position.array;
        const A = ud.nodes[ln.userData.a].position, B = ud.nodes[ln.userData.b].position;
        arr[0] = A.x; arr[1] = A.y; arr[2] = A.z; arr[3] = B.x; arr[4] = B.y; arr[5] = B.z;
        ln.geometry.attributes.position.needsUpdate = true;
        ln.material.opacity = 0.42 * e;
      });
      if (e > 0.985 && !ud.approved) { ud.approved = true; ud.gateFlash.material.opacity = 0.85; }
      if (e < 0.5) ud.approved = false;
      ud.gateFlash.material.opacity *= 0.95;
      ud.gateFlash.scale.setScalar(7 + (0.85 - ud.gateFlash.material.opacity) * 10);
      ud.graph.rotation.z = Math.sin(t * 0.22) * 0.018;
    }

    /* — the balance weighs — */
    {
      const ud = exhibits[3].group.userData;
      ud.beamGroup.rotation.z = Math.sin(t * 0.45) * 0.035;
      for (const dr of ud.drops) {
        dr.t += 0.012;
        if (dr.t > 1.15) { dr.t = 0; dr.side = hash(t * 7 + dr.side) > 0.35 ? 1 : -1; }
        const fall = Math.min(1, dr.t);
        const e = fall * fall;
        dr.s.position.set(dr.side * 5, 3.6 - e * 6.6, 0);
        dr.s.material.opacity = dr.t < 1 ? 0.7 * (1 - e * 0.4) : 0;
        if (dr.t >= 1 && dr.t < 1.02) {
          (dr.side > 0 ? ud.panCool : ud.panWarm).material.opacity = 0.55;
        }
      }
      ud.panCool.material.opacity = Math.max(0.26, ud.panCool.material.opacity * 0.97);
      ud.panWarm.material.opacity = Math.max(0.26, ud.panWarm.material.opacity * 0.97);
    }

    /* — the field breathes — */
    {
      const ud = exhibits[4].group.userData;
      if (activeKey === "field" || Math.abs(smP - 4) < 1.4) {
        const dummy = ud.dummy;
        for (let i = 0; i < ud.N; i += 1) {
          ud.field.getMatrixAt(i, dummy.matrix);
          dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
          const h = ud.H[i] * (1 + Math.sin(t * 0.8 + ud.PH[i]) * 0.10);
          dummy.position.y = -7.5 + h / 2;
          dummy.scale.y = h;
          dummy.updateMatrix();
          ud.field.setMatrixAt(i, dummy.matrix);
        }
        ud.field.instanceMatrix.needsUpdate = true;
      }
    }

    /* — the condenser: demand in, product out — */
    {
      const ud = exhibits[5].group.userData;
      const varr = ud.vortex.geometry.attributes.position.array;
      for (let i = 0; i < ud.vortex.userData.N; i++) {
        const P = ud.vortex.userData.P[i];
        P.a += P.v * 0.02 * (18 / (P.r + 2));
        P.r -= P.v * 0.016;
        P.y *= 0.999;
        if (P.r < 0.6) { P.r = 4 + hash(i + t) * 13; P.y = (hash(i + t + 1) - 0.5) * 9; }
        varr[i * 3] = Math.cos(P.a) * P.r;
        varr[i * 3 + 1] = P.y + Math.sin(P.a * 2) * 0.4;
        varr[i * 3 + 2] = Math.sin(P.a) * P.r;
      }
      ud.vortex.geometry.attributes.position.needsUpdate = true;
      for (const b of ud.bursts) {
        b.t += 0.011;
        if (b.t > 1.4) b.t = 0;
        const e = Math.min(1, b.t);
        b.line.scale.setScalar(1 + e * 9);
        b.line.material.opacity = 0.5 * (1 - e) * (activeKey === "voice" ? 1 : 0.45);
      }
      ud.heart.material.opacity = 0.5 + Math.sin(t * 0.9) * 0.12;
      ud.hub.rotation.y = t * 0.03;
    }

    /* — the hall ignites plaque by plaque — */
    {
      const ud = exhibits[6].group.userData;
      const camZ = camera.position.z;
      for (const pl of ud.plaques) {
        const target = camZ < pl.worldZ + 46 ? 1 : 0;
        pl.lit += (target - pl.lit) * 0.04;
        pl.edge.material.opacity = 0.5 * pl.lit;
        pl.plaque.material.opacity = 0.02 + 0.05 * pl.lit;
        pl.cone.material.opacity = 0.13 * pl.lit;
        pl.lamp.material.opacity = 0.16 * pl.lit;
      }
    }

    /* — the door pulls — */
    {
      const ud = exhibits[7].group.userData;
      const near = Math.max(0, 1 - Math.abs(smP - 7) / 1.2);
      ud.doorGlow.material.opacity = 0.4 + near * 0.35 + doorPush * 0.8;
      ud.stream.material.opacity = near * 0.6;
      if (near > 0.02) {
        const sarr = ud.stream.geometry.attributes.position.array;
        for (let i = 0; i < ud.stream.userData.N; i++) {
          const P = ud.stream.userData.P[i];
          P.r -= P.v * 0.05; P.z += P.v * 0.16;
          if (P.r < 0.4 || P.z > -19) { P.r = 3 + hash(i + t) * 16; P.z = 8 - hash(i + t + 2) * 24; }
          sarr[i * 3] = Math.cos(P.a) * P.r;
          sarr[i * 3 + 1] = -3.2 + Math.sin(P.a) * P.r * 0.5;
          sarr[i * 3 + 2] = P.z;
          P.a += 0.004;
        }
        ud.stream.geometry.attributes.position.needsUpdate = true;
      }
    }

    /* — motes drift — */
    {
      const arr = motes.geometry.attributes.position.array, base = motes.userData.base;
      for (let i = 0; i < Q.motes; i++) {
        arr[i * 3] = base[i * 3] + Math.sin(t * 0.12 + i) * 1.2;
        arr[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.09 + i * 2.1) * 0.9;
      }
      motes.geometry.attributes.position.needsUpdate = true;
    }

    /* — render: scene → bloom → composite — */
    if (Q.bloom) {
      renderer.setRenderTarget(rtScene);
      renderer.render(scene3, camera);
      brightMat.uniforms.tIn.value = rtScene.texture;
      renderer.setRenderTarget(rtA);
      renderer.render(brightScene, postCam);
      blurMat.uniforms.tIn.value = rtA.texture;
      blurMat.uniforms.uDir.value.set(1, 0);
      blurMat.uniforms.uRes.value.set(rtA.width, rtA.height);
      renderer.setRenderTarget(rtB);
      renderer.render(blurScene, postCam);
      blurMat.uniforms.tIn.value = rtB.texture;
      blurMat.uniforms.uDir.value.set(0, 1);
      renderer.setRenderTarget(rtA);
      renderer.render(blurScene, postCam);
      compMat.uniforms.tScene.value = rtScene.texture;
      compMat.uniforms.tBloom.value = rtA.texture;
      renderer.setRenderTarget(null);
      renderer.render(compScene, postCam);
    } else {
      renderer.setRenderTarget(null);
      renderer.render(scene3, camera);
    }
  }

  function degrade() {
    if (Q.dpr > 1.4) { Q.dpr = 1.4; makeTargets(); return; }
    if (Q.chroma) { Q.chroma = false; compMat.uniforms.uChroma.value = 0; return; }
    if (Q.dpr > 1.0) { Q.dpr = 1.0; makeTargets(); return; }
    if (Q.bloom) { Q.bloom = false; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setSize(window.innerWidth, window.innerHeight); }
  }

  requestAnimationFrame(frame);
  window.__world = { camera, get p() { return smP; } };
  canvas.classList.add("on");

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) { clock.start(); requestAnimationFrame(frame); }
  });
}
