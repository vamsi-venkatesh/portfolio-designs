/* ═══════════════════════════════════════════════════════════════════════
   THE STUDIO — world engine v4 (quiet luxury)
   Not a spectacle: an interior. A dark atelier at night, heavy with fog.
   Scrolling walks you forward through it; each system is a calm exhibit
   of light you approach, pass, and leave behind. Clicking an exhibit
   walks you to it. Slow easings. One warm light per room. Restraint.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from "three";

// Respect the visitor's system preference; the HTML experience remains complete.
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
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  const MOBILE = Math.min(window.innerWidth, window.innerHeight) < 761;
  const FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x0a0b0d, 1);

  const scene3 = new THREE.Scene();
  scene3.fog = new THREE.FogExp2(0x0a0b0d, MOBILE ? 0.0115 : 0.0135);   // the air of the room
  const camera = new THREE.PerspectiveCamera(MOBILE ? 54 : 46, 1, 0.1, 400);
  const CAMERA_START = MOBILE ? 38 : 26;
  const LOOK_AHEAD = MOBILE ? 34 : 24;
  const EXHIBIT_SCALE = MOBILE ? 1.18 : 1;

  /* ── shared soft-light texture ──────────────────────────────────────── */
  function softTex(warm) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    const tint = warm ? "232,226,213" : "175,194,210";
    grad.addColorStop(0, `rgba(${tint},0.85)`);
    grad.addColorStop(0.4, `rgba(${tint},0.20)`);
    grad.addColorStop(1, `rgba(${tint},0)`);
    g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  const warmTex = softTex(true), coolTex = softTex(false);
  const mkGlow = (tex, size, opacity) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
    s.scale.setScalar(size);
    return s;
  };
  const lineMat = (opacity) => new THREE.LineBasicMaterial({ color: 0xafc2d2, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
  const circleGeo = (r, n = 96) => {
    const pts = [];
    for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
    return new THREE.BufferGeometry().setFromPoints(pts);
  };

  /* ── the floor: a faint sheen so the dark has ground ────────────────── */
  {
    const c = document.createElement("canvas"); c.width = 4; c.height = 256;
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "rgba(175,194,210,0.055)");
    grad.addColorStop(1, "rgba(175,194,210,0)");
    g.fillStyle = grad; g.fillRect(0, 0, 4, 256);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 640),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -7.5, -240);
    scene3.add(floor);
  }

  /* ── dust motes — a few hundred, drifting like air in lamplight ─────── */
  const MOTES = MOBILE ? 520 : 520;
  {
    const pos = new Float32Array(MOTES * 3);
    for (let i = 0; i < MOTES; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = -6 + Math.random() * 22;
      pos[i * 3 + 2] = 30 - Math.random() * 560;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: 0xd9e2ea, size: 0.14, transparent: true, opacity: 0.5, sizeAttenuation: true, depthWrite: false });
    const motes = new THREE.Points(g, m);
    motes.userData.base = pos.slice();
    scene3.add(motes);
    scene3.userData.motes = motes;
  }

  /* ── the rooms — one exhibit each, spaced down -Z ───────────────────── */
  const STEP = 92;                                    // meters between rooms
  const roomZ = (k) => -k * STEP;
  const exhibits = [];                                // { group, key, z }
  const SIDE = MOBILE ? 12.5 : 10.5;

  function room(k, key, builder) {
    const gp = new THREE.Group();
    gp.position.z = roomZ(k);
    builder(gp);
    if (MOBILE && key !== "name" && key !== "singularity") gp.scale.setScalar(EXHIBIT_SCALE);
    scene3.add(gp);
    exhibits.push({ group: gp, key, z: roomZ(k) });
    return gp;
  }

  // 00 · THRESHOLD — a thin line of light you arrive through
  room(0, "name", (gp) => {
    const bar = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 0.045),
      new THREE.MeshBasicMaterial({ color: 0xe8e2d5, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    // sits low, a lit horizon under the name — never across the hero text
    bar.position.set(0, -5.2, -14);
    gp.add(bar);
    const halo = mkGlow(warmTex, MOBILE ? 38 : 30, 0.30); halo.position.set(0, -5.6, -15); gp.add(halo);
    gp.userData.bar = bar;
    gp.userData.halo = halo;
  });

  // 01 · ORRERY (Conxto) — six small moons circling a soft core, desk-orrery slow
  room(1, "orbit", (gp) => {
    const core = mkGlow(warmTex, MOBILE ? 14 : 10, 0.58); core.position.set(SIDE, 0.5, 0); gp.add(core);
    const moons = new THREE.Group(); moons.position.copy(core.position);
    for (let i = 0; i < 6; i++) {
      const r = 4.6 + i * 1.55;
      const ring = new THREE.Line(circleGeo(r), lineMat(MOBILE ? 0.2 : 0.17));
      ring.rotation.x = 0.42;
      moons.add(ring);
      const moon = mkGlow(coolTex, MOBILE ? 1.9 : 1.5, 0.9);
      moon.userData = { r, a: (i / 6) * Math.PI * 2, v: 0.05 + i * 0.012 };
      moons.add(moon);
    }
    gp.add(moons);
    gp.userData.moons = moons;
  });

  // 02 · CONSTELLATION (Agent Services) — branching policy, not a row of stages
  room(2, "agentlab", (gp) => {
    const graph = new THREE.Group(); graph.position.set(MOBILE ? 1 : 7, 0.2, -2);
    const points = [
      [-12,0,0],[-7,5,0],[-7,-4,0],[-1,2,0],[4,6,0],[4,-4,0],[10,2,0],[11,-6,0]
    ].map(([x,y,z]) => new THREE.Vector3(x,y,z));
    const edges = [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5],[4,6],[5,6],[5,7],[6,7]];
    for (const [a,b] of edges) {
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([points[a],points[b]]), lineMat(.28));
      graph.add(line);
    }
    points.forEach((point,i) => {
      const node = mkGlow(i === 5 ? warmTex : coolTex, i === 3 ? 2.8 : 1.7, i === 5 ? .76 : .68);
      node.position.copy(point); node.userData.i = i; graph.add(node);
    });
    const boundary = new THREE.Mesh(new THREE.PlaneGeometry(.055,17),new THREE.MeshBasicMaterial({color:0x9fb88f,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false}));
    boundary.position.set(7.5,0,0); graph.add(boundary);
    gp.add(graph); gp.userData.serviceGraph = graph;
  });

  // 03 · SCALES (Eval Hub) — an independent measuring layer
  room(3, "gate", (gp) => {
    const scales = new THREE.Group(); scales.position.set(-SIDE, .4, 0);
    const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-7,1,0),new THREE.Vector3(7,1,0)]),lineMat(.6));
    scales.add(beam);
    [-1,1].forEach((side) => {
      const stem = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(side*5,1,0),new THREE.Vector3(side*5,-3,0)]),lineMat(.42));
      const pan = new THREE.Line(circleGeo(2.4),lineMat(.48)); pan.rotation.x=Math.PI/2; pan.position.set(side*5,-3,0);
      scales.add(stem,pan);
      const panGlow = mkGlow(coolTex,3.6,.22); panGlow.position.set(side*5,-3,0); scales.add(panGlow);
    });
    const core = mkGlow(coolTex,7,.42); core.position.set(0,1,0); scales.add(core);
    gp.add(scales); gp.userData.scales = scales;
  });

  // 04 · REEDS (Market Lab) — a field of thin standing lights, breathing
  room(4, "field", (gp) => {
    const nReeds = MOBILE ? 44 : 44;
    const reeds = new THREE.Group();
    for (let i = 0; i < nReeds; i++) {
      const h = 2.2 + Math.abs(Math.sin(i * 1.7)) * 6.5;
      const reed = new THREE.Mesh(
        new THREE.PlaneGeometry(0.05, h),
        new THREE.MeshBasicMaterial({ color: 0xafc2d2, transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
      );
      reed.position.set((i / (nReeds - 1) - 0.5) * 46, -7.5 + h / 2, (Math.sin(i * 3.1) * 6) - 2);
      reed.userData = { h, i };
      reeds.add(reed);
    }
    gp.add(reeds);
    const mist = mkGlow(coolTex, MOBILE ? 34 : 26, MOBILE ? 0.22 : 0.16); mist.position.set(0, -2, -4); gp.add(mist);
    gp.userData.reeds = reeds;
  });

  // 05 · THE RING (SEO Lab) — one quiet research loop, continuously cycling
  room(5, "voice", (gp) => {
    const rings = new THREE.Group(); rings.position.set(SIDE, 0.5, 0);
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Line(circleGeo(3.4 + i * 1.35), lineMat((MOBILE ? 0.4 : 0.36) - i * 0.085));
      ring.rotation.x = Math.PI / 2;                 // facing you
      rings.add(ring);
    }
    const heart = mkGlow(warmTex, MOBILE ? 8 : 6.5, 0.46); rings.add(heart);
    gp.add(rings);
    gp.userData.rings = rings;
  });

  // 06 · THE HALL (build log) — plaques as framed light, not filled slabs.
  // A flat additive fill reads as a gray glitch-rectangle; keep the fill at a
  // whisper and let the lit top edge + a soft glow carry the shape.
  room(6, "starline", (gp) => {
    for (let i = 0; i < 5; i++) {
      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(3.4, 2.1),
        new THREE.MeshBasicMaterial({ color: 0xafc2d2, transparent: true, opacity: 0.014 + (4 - i) * 0.006, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      const side = i % 2 ? -1 : 1;
      plaque.position.set(side * (7 + i * 1.1), 0.6, -i * 7 - 2);
      plaque.rotation.y = side * -0.5;
      gp.add(plaque);
      const edge = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.02), plaque.material.clone());
      edge.material.opacity = 0.42;
      edge.position.copy(plaque.position); edge.position.y += 1.08; edge.rotation.copy(plaque.rotation);
      gp.add(edge);
      const lamp = mkGlow(coolTex, 4.5, 0.12);
      lamp.position.copy(plaque.position); lamp.position.y += 1.1;
      gp.add(lamp);
    }
  });

  // 07 · THE DOOR (contact) — a tall doorway of warm light at the end.
  // Gradient fill (bright at the floor, fading up) + lit jambs: a flat
  // rectangle here read as a gray monolith behind the closing headline.
  room(7, "singularity", (gp) => {
    const dc = document.createElement("canvas"); dc.width = 64; dc.height = 256;
    const dg = dc.getContext("2d");
    const dgrad = dg.createLinearGradient(0, 0, 0, 256);
    dgrad.addColorStop(0, "rgba(232,226,213,0)");
    dgrad.addColorStop(0.4, "rgba(232,226,213,0.05)");
    dgrad.addColorStop(0.75, "rgba(232,226,213,0.38)");
    dgrad.addColorStop(1, "rgba(232,226,213,0.9)");
    dg.fillStyle = dgrad; dg.fillRect(0, 0, 64, 256);
    const doorTex = new THREE.CanvasTexture(dc);
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 11),
      new THREE.MeshBasicMaterial({ map: doorTex, transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    door.position.set(0, -3.2, -20);
    gp.add(door);
    [-1, 1].forEach((side) => {
      const jamb = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, 11.2),
        new THREE.MeshBasicMaterial({ map: doorTex, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      jamb.position.set(side * 2.28, -3.2, -20);
      gp.add(jamb);
    });
    const doorGlow = mkGlow(warmTex, 26, 0.4); doorGlow.position.set(0, -5, -20.5); gp.add(doorGlow);
    gp.userData.door = door;
  });

  /* ── scroll → walking ───────────────────────────────────────────────── */
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

  // Native scroll only. The world glides, but the page never auto-corrects
  // after the user's hand stops.

  /* ── entrance — a line of light opens the room. No shouting. ────────── */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  let introLocked = true;
  let opened = 0;                                    // 0→1 door-of-light
  document.body.classList.add("booting");
  setTimeout(() => { document.body.classList.add("world-on"); document.body.classList.remove("booting"); }, 900);
  setTimeout(() => { document.body.classList.add("name-revealed"); }, 1900);
  setTimeout(() => { introLocked = false; }, 2600);
  // hard failsafe
  setTimeout(() => { document.body.classList.add("world-on", "name-revealed"); document.body.classList.remove("booting"); introLocked = false; }, 5000);

  /* ── click: step toward what you're looking at ──────────────────────── */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hoverKey = null;
  function pickExhibit(cx, cy) {
    ndc.x = (cx / window.innerWidth) * 2 - 1;
    ndc.y = -(cy / window.innerHeight) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    ray.far = 200;
    for (const ex of exhibits) {
      const hits = ray.intersectObjects(ex.group.children, true);
      if (hits.length) return ex;
    }
    return null;
  }
  if (FINE) {
    window.addEventListener("pointermove", (e) => {
      ptr.x = e.clientX / window.innerWidth - 0.5;
      ptr.y = e.clientY / window.innerHeight - 0.5;
      const ex = pickExhibit(e.clientX, e.clientY);
      hoverKey = ex ? ex.key : null;
      document.body.classList.toggle("cursor-near", !!ex);
    }, { passive: true });
    canvas.style.pointerEvents = "auto";
    canvas.addEventListener("click", (e) => {
      const ex = pickExhibit(e.clientX, e.clientY);
      if (!ex || introLocked) return;
      const el = document.querySelector(`[data-scene="${ex.key}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ── sizing ─────────────────────────────────────────────────────────── */
  function size() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    measure();
  }
  size();
  window.addEventListener("resize", size, { passive: true });

  /* ── the walk ───────────────────────────────────────────────────────── */
  const ptr = { x: 0, y: 0, cx: 0, cy: 0 };
  let running = true, smP = 0, lastP = 0, activeKey = "";
  const clock = new THREE.Clock();

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const t = clock.getElapsedTime();

    opened += ((document.body.classList.contains("world-on") ? 1 : 0) - opened) * 0.03;

    const raw = introLocked ? 0 : progressFromScroll();
    smP += (raw - smP) * 0.105;                       // the world glides just behind your hand
    const vel = Math.abs(smP - lastP); lastP = smP;
    document.documentElement.style.setProperty("--vel", Math.min(vel * 40, 1).toFixed(3));

    // camera: walking forward, gentle sway, slight look-toward-exhibit
    const z = CAMERA_START - smP * STEP;
    ptr.cx += (ptr.x - ptr.cx) * 0.03; ptr.cy += (ptr.y - ptr.cy) * 0.03;
    camera.position.set(
      ptr.cx * (MOBILE ? 1.2 : 2.4) + Math.sin(t * 0.4) * 0.22,
      (MOBILE ? 1.8 : 0.6) + Math.sin(t * 0.55) * 0.14 - ptr.cy * (MOBILE ? 0.6 : 1.6),
      z
    );
    const k = Math.round(smP);
    const focusX = (exhibits[k] && [1,2,5].includes(k)) ? SIDE * 0.5 : (k === 3 ? -SIDE * .45 : 0);
    camera.lookAt(focusX * (MOBILE ? 0.78 : 0.6), (MOBILE ? 0.85 : 0.2) - ptr.cy * (MOBILE ? 0.9 : 2.2), z - LOOK_AHEAD);
    const nextActive = ORDER[Math.max(0, Math.min(ORDER.length - 1, k))];
    if (nextActive !== activeKey) {
      activeKey = nextActive;
      document.documentElement.dataset.room = activeKey;
      document.querySelectorAll("[data-jump]").forEach((button) => {
        button.classList.toggle("active", button.dataset.jump === activeKey);
      });
    }

    // threshold bar opens with the entrance, then dims as you walk past it —
    // otherwise it slices across the next section's text as a bright band
    const bar = exhibits[0].group.userData.bar;
    const halo = exhibits[0].group.userData.halo;
    const pastThreshold = Math.max(0, 1 - smP * 2.8);
    if (bar) { bar.scale.x = 0.02 + opened * 0.98; bar.material.opacity = (0.25 + opened * 0.6) * pastThreshold; }
    if (halo) halo.material.opacity = 0.30 * pastThreshold;

    // orrery — desk-slow
    const moons = exhibits[1].group.userData.moons;
    if (moons) {
      const active = activeKey === "orbit" ? 1 : 0;
      moons.scale.setScalar(1 + active * (MOBILE ? 0.12 : 0.06));
      moons.children.forEach((ch) => {
      if (ch.isSprite && ch.userData.r) {
        ch.userData.a += ch.userData.v * 0.016;
        ch.position.set(Math.cos(ch.userData.a) * ch.userData.r, Math.sin(ch.userData.a) * ch.userData.r * 0.42, Math.sin(ch.userData.a) * ch.userData.r * 0.3);
      }
      if (ch.material) ch.material.opacity = ch.userData.r ? (active ? 0.96 : 0.78) : ch.material.opacity;
      });
    }

    // service constellation — nodes reason together, the authority boundary holds
    const serviceGraph = exhibits[2].group.userData.serviceGraph;
    if (serviceGraph) {
      serviceGraph.rotation.z = Math.sin(t * .22) * .018;
      serviceGraph.children.forEach((child) => {
        if (child.isSprite && Number.isInteger(child.userData.i)) {
          const pulse = 1 + Math.sin(t * .9 + child.userData.i) * .08;
          child.scale.setScalar((child.userData.i === 3 ? 2.8 : 1.7) * pulse);
        }
      });
    }

    const scales = exhibits[3].group.userData.scales;
    if (scales) scales.rotation.z = Math.sin(t * .45) * .025;

    // reeds — breathing light
    const reeds = exhibits[4].group.userData.reeds;
    if (reeds) reeds.children.forEach((r) => {
      const b = 1 + Math.sin(t * 0.7 + r.userData.i * 0.9) * 0.06;
      r.scale.y = b;
      r.material.opacity = (activeKey === "field" ? 0.44 : 0.3) + Math.sin(t * 0.9 + r.userData.i * 1.3) * 0.08;
    });

    // the ring — a slow pulse, like calm breathing
    const rings = exhibits[5].group.userData.rings;
    if (rings) {
      const b = 1 + Math.sin(t * 0.9) * 0.025;
      rings.scale.setScalar(b * (activeKey === "voice" ? (MOBILE ? 1.15 : 1.07) : 1));
      rings.rotation.z = t * 0.03;
    }

    // motes drift
    const motes = scene3.userData.motes;
    if (motes) {
      const arr = motes.geometry.attributes.position.array, base = motes.userData.base;
      for (let i = 0; i < MOTES; i++) {
        arr[i * 3] = base[i * 3] + Math.sin(t * 0.12 + i) * 1.1;
        arr[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.09 + i * 2.1) * 0.8;
      }
      motes.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene3, camera);
  }
  requestAnimationFrame(frame);
  window.__world = { camera, get p() { return smP; } };
  canvas.classList.add("on");

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) { clock.start(); requestAnimationFrame(frame); }
  });
}
