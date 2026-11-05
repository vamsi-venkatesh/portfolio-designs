/* The Checkpoint, as a world you scroll into. The section pins; the frame opens from a card to the full screen, then a
   camera travels a colourful hand-drawn world: Design → Build → Run → Check → Ship, with the chosen product riding the
   conveyor as the traveller and each zone showing that product's real facts (code audit of 2026-09-23). At the runway
   it becomes a plane and takes off; an "Improve" arrow loops back to Design, and the frame closes into a card again.
   Everything is tied to scroll, so scrolling back plays it backwards. Rough.js draws, GSAP + ScrollTrigger drive it. */
(() => {
  "use strict";
  const card = document.getElementById("doodle");
  if (!card || !window.rough || !window.gsap || !window.ScrollTrigger) return;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const C = { ink: "#111110", paper: "#f7f5ef", red: "#ff3b1f", yellow: "#ffc93c", mint: "#35c98a", sky: "#6cb8ff", pink: "#ff8fb1", violet: "#9b8cff" };
  const HAND = "'Caveat', 'Comic Sans MS', cursive";
  const H = 1000, GROUND = 780, BELT = 700, ZW = 1600;
  const Z = [{ k: "Design", x: 1200, c: C.yellow }, { k: "Build", x: 2800, c: C.sky }, { k: "Run", x: 4400, c: C.mint }, { k: "Check", x: 6000, c: C.red }, { k: "Ship", x: 7600, c: C.violet }];
  const W = 9800;

  // the travellers: each product's real facts, from the code audit
  const T = [
    { n: "Conxto", img: "peek/conxto-a.webp", stack: ["React", "Fastify", "PostgreSQL", "5 agents"], run: "19 systemd units · Caddy", test: 129, testL: "test scripts, and an eval harness" },
    { n: "UnboundPDF", img: "peek/unboundpdf-a.webp", stack: ["WebAssembly", "Tesseract OCR", "pdf-lib", "AES"], run: "systemd · Caddy · nginx", test: 471, testL: "tests before every release" },
    { n: "FarmQuick", img: "peek/farmquick-a.webp", stack: ["Astro", "Worker", "D1", "n8n"], run: "Docker Compose · Caddy", test: 408, testL: "tests on the public engine" },
    { n: "Agent Service Lab", img: "peek/lab-a.webp", stack: ["React Flow", "Node.js", "FastAPI", "pgvector"], run: "Docker sandboxes · systemd", test: 2900, testL: "evaluation cases" },
    { n: "VVDex Forge", img: "peek/forge-a.webp", stack: ["Python", "Graders", "Playwright", "Docker"], run: "network-off sandboxes · Caddy", test: 0, testL: "every exam certified first" },
    { n: "PitchRadar", img: "peek/pitchradar-a.webp", stack: ["React 19", "TypeScript", "Postgres 16", "7 agents"], run: "Compose · Caddy · systemd", test: 620, testL: "tests on every push" },
    { n: "Conxfolio", img: "peek/conxfolio-a.webp", stack: ["HTML & CSS", "251 tokens", "pdf.js", "Fastify"], run: "systemd · Caddy", test: 0, testL: "a stress audit on every design" },
    { n: "VVDex Trading", img: "peek/trading-a.webp", stack: ["Python", "WebSockets", "SQLite", "Redis"], run: "systemd · Caddy", test: 0, testL: "every call hash-chained" },
  ];
  let ti = 0;

  /* ---------- the frame, the svg, the HUD ---------- */
  const frame = document.createElement("div"); frame.className = "d-in"; card.appendChild(frame);
  frame.insertAdjacentHTML("beforeend", '<div class="w-hud show"><div class="w-pick"><label for="wPick">traveller</label><select id="wPick"></select></div><div class="w-map" aria-hidden="true"></div><button class="w-again" id="wAgain" type="button">send another ↻</button></div>');
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "w-svg"); svg.setAttribute("preserveAspectRatio", "xMidYMid slice"); svg.setAttribute("aria-hidden", "true");
  frame.prepend(svg);
  const rc = rough.svg(svg);
  const mk = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); (parent || svg).appendChild(n); return n; };
  const txt = (x, y, s, size, fill, parent, anchor, weight) => { const t = mk("text", { x, y, "font-family": HAND, "font-size": size, fill, "text-anchor": anchor || "middle", "font-weight": weight || 600 }, parent); t.textContent = s; return t; };
  const o = (seed, more) => Object.assign({ seed, roughness: 1.4, bowing: 1.2, stroke: C.ink, strokeWidth: 2.4 }, more || {});
  const at = (el, x, y, r, s) => el.setAttribute("transform", `translate(${x} ${y})${r ? ` rotate(${r})` : ""}${s != null ? ` scale(${s})` : ""}`);

  // paper and sky
  const defs = mk("defs", {});
  const pat = mk("pattern", { id: "wDots", width: 26, height: 26, patternUnits: "userSpaceOnUse" }, defs); mk("circle", { cx: 2, cy: 2, r: 1.6, fill: "rgba(17,17,16,.12)" }, pat);
  mk("rect", { x: -400, y: -900, width: W + 800, height: 2800, fill: C.paper });
  mk("rect", { x: -400, y: -900, width: W + 800, height: 2800, fill: "url(#wDots)" });
  const sky = mk("g", {});
  const sun = mk("g", {}, sky);
  sun.appendChild(rc.circle(0, 0, 150, o(3, { fill: C.yellow, fillStyle: "hachure", hachureGap: 7, fillWeight: 2.5, stroke: "#e0a100" })));
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; sun.appendChild(rc.line(Math.cos(a) * 92, Math.sin(a) * 92, Math.cos(a) * 128, Math.sin(a) * 128, o(40 + i, { stroke: "#e0a100", strokeWidth: 3 }))); }
  const cloudPath = "M0 44 C -8 16 28 4 44 20 C 52 -4 96 -4 104 20 C 128 12 148 32 136 52 C 140 64 120 72 104 68 L 16 68 C -4 68 -8 52 0 44 Z";
  const clouds = Array.from({ length: 9 }, (_, i) => { const g = mk("g", {}, sky); g.appendChild(rc.path(cloudPath, o(60 + i, { fill: "#fff", fillStyle: "solid", strokeWidth: 2 })));
    return { g, x: 300 + i * 1100 + (i % 3) * 170, y: 90 + (i % 3) * 90, s: 0.9 + (i % 4) * 0.25, v: 6 + (i % 3) * 4 }; });
  const birds = Array.from({ length: 6 }, (_, i) => { const g = mk("g", {}, sky); g.appendChild(rc.path("M0 0 Q 10 -10 20 0 Q 30 -10 40 0", o(80 + i, { strokeWidth: 2.2, fill: "none" }))); return { g, x: 600 + i * 1500, y: 260 + (i % 2) * 60, p: i }; });

  // far skyline with the cathedral, then the ground
  const far = mk("g", { opacity: 0.55 });
  for (let x = -200, i = 0; x < W + 200; i++) { const w = 60 + ((i * 37) % 90), h = 60 + ((i * 53) % 170); far.appendChild(rc.rectangle(x, GROUND - h, w, h, o(100 + i, { fill: [C.sky, C.pink, C.mint, C.yellow][i % 4], fillStyle: "hachure", hachureGap: 12, fillWeight: 1.2, strokeWidth: 1.6, stroke: "rgba(17,17,16,.55)" }))); x += w + 16; }
  [2100, 6900].forEach((cx, j) => { [-40, 40].forEach((d, k) => { far.appendChild(rc.rectangle(cx + d - 22, GROUND - 260, 44, 260, o(300 + j * 4 + k, { fill: "#d9d3c5", fillStyle: "solid", strokeWidth: 1.8 })));
    far.appendChild(rc.polygon([[cx + d - 22, GROUND - 260], [cx + d, GROUND - 360], [cx + d + 22, GROUND - 260]], o(310 + j * 4 + k, { fill: "#d9d3c5", fillStyle: "solid", strokeWidth: 1.8 }))); }); });
  mk("rect", { x: -400, y: GROUND, width: W + 800, height: 1200, fill: "#ebe4d2" });
  mk("g", {}).appendChild(rc.line(-400, GROUND, W + 400, GROUND, o(5, { strokeWidth: 3 })));
  // zone signs
  Z.forEach((z, i) => { const g = mk("g", {}); g.appendChild(rc.line(z.x - 520, GROUND, z.x - 520, GROUND - 170, o(400 + i, { strokeWidth: 4 })));
    g.appendChild(rc.rectangle(z.x - 610, GROUND - 250, 180, 84, o(410 + i, { fill: z.c, fillStyle: "solid", strokeWidth: 3 })));
    txt(z.x - 520, GROUND - 196, z.k, 52, C.ink, g); txt(z.x - 520, GROUND - 262, String(i + 1).padStart(2, "0"), 26, "rgba(17,17,16,.6)", g); });

  /* ---------- zone 0: the entrance ---------- */
  const ent = mk("g", {});
  ent.appendChild(rc.line(260, GROUND, 260, GROUND - 330, o(501, { strokeWidth: 5 }))); ent.appendChild(rc.line(740, GROUND, 740, GROUND - 330, o(502, { strokeWidth: 5 })));
  ent.appendChild(rc.rectangle(200, GROUND - 470, 600, 170, o(503, { fill: C.red, fillStyle: "zigzag", hachureGap: 9, fillWeight: 3, strokeWidth: 3.4 })));
  mk("rect", { x: 230, y: GROUND - 440, width: 540, height: 110, rx: 10, fill: C.paper }, ent);
  txt(500, GROUND - 368, "The Checkpoint", 74, C.ink, ent);
  const travSign = txt(500, GROUND - 336, "", 30, "#c4260f", ent);

  /* ---------- the conveyor, all the way to the runway ---------- */
  const beltG = mk("g", {});
  beltG.appendChild(rc.rectangle(820, BELT, 6760, 36, o(600, { fill: "#2a2a27", fillStyle: "solid", strokeWidth: 2.4 })));
  for (let x = 900; x < 7560; x += 260) { beltG.appendChild(rc.line(x, BELT + 36, x - 20, GROUND, o(610 + x, { strokeWidth: 2.4 }))); beltG.appendChild(rc.line(x, BELT + 36, x + 20, GROUND, o(620 + x, { strokeWidth: 2.4 }))); }
  const beltDash = mk("line", { x1: 830, y1: BELT + 18, x2: 7570, y2: BELT + 18, stroke: C.yellow, "stroke-width": 4, "stroke-dasharray": "18 26", opacity: 0.85 });

  /* ---------- zone 1: Design studio ---------- */
  const dz = Z[0].x, easel = mk("g", {});
  easel.appendChild(rc.line(dz - 250, GROUND, dz - 170, GROUND - 520, o(700, { strokeWidth: 5, stroke: "#8a5a2b" })));
  easel.appendChild(rc.line(dz + 250, GROUND, dz + 170, GROUND - 520, o(701, { strokeWidth: 5, stroke: "#8a5a2b" })));
  easel.appendChild(rc.rectangle(dz - 300, GROUND - 590, 600, 380, o(702, { fill: "#fff", fillStyle: "solid", strokeWidth: 3.2 })));
  const shot = mk("image", { x: dz - 290, y: GROUND - 580, width: 580, height: 360, preserveAspectRatio: "xMidYMid slice", opacity: 0 }, easel);
  const wire = mk("g", {}, easel);
  [[20, 20, 540, 40], [20, 80, 330, 170], [370, 80, 190, 80], [370, 180, 190, 70], [20, 270, 250, 60], [290, 270, 270, 60]].forEach(([x, y, w, h], i) =>
    wire.appendChild(rc.rectangle(dz - 290 + x, GROUND - 580 + y, w, h, o(710 + i, { stroke: C.red, strokeWidth: 2.2 }))));
  const wirePaths = [...wire.querySelectorAll("path")];
  wirePaths.forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.dataset.l = l; });
  const pots = mk("g", {}); [C.red, C.yellow, C.sky, C.mint].forEach((c, i) => { pots.appendChild(rc.rectangle(dz - 620 + i * 64, GROUND + 30, 50, 56, o(720 + i, { fill: c, fillStyle: "solid" }))); });
  const pencil = mk("g", {});
  pencil.appendChild(rc.polygon([[0, 0], [90, -90], [112, -68], [22, 22]], o(730, { fill: C.yellow, fillStyle: "solid", strokeWidth: 2.6 })));
  pencil.appendChild(rc.polygon([[0, 0], [22, 22], [-18, 34]], o(731, { fill: C.ink, fillStyle: "solid" })));

  /* ---------- zone 2: Build workshop ---------- */
  const bz = Z[1].x;
  const gear = (r, seed, fill) => { const g = mk("g", {}); g.appendChild(rc.circle(0, 0, r * 2, o(seed, { fill, fillStyle: "hachure", hachureGap: 8, fillWeight: 2 })));
    g.appendChild(rc.circle(0, 0, r * 0.55, o(seed + 1, { fill: C.paper, fillStyle: "solid" })));
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; g.appendChild(rc.rectangle(Math.cos(a) * (r + 10) - 10, Math.sin(a) * (r + 10) - 10, 20, 20, o(seed + 2 + i, { fill, fillStyle: "solid", strokeWidth: 2 }))); } return g; };
  const gears = [[bz - 330, GROUND - 420, 110, C.sky], [bz - 150, GROUND - 300, 64, C.yellow], [bz + 260, GROUND - 470, 90, C.pink]].map(([x, y, r, c], i) => ({ g: gear(r, 800 + i * 20, c), x, y, dir: i % 2 ? -1 : 1, sp: 110 / r }));
  const crane = mk("g", {});
  crane.appendChild(rc.line(bz + 40, GROUND, bz + 40, GROUND - 640, o(860, { strokeWidth: 6 })));
  crane.appendChild(rc.line(bz - 220, GROUND - 640, bz + 180, GROUND - 640, o(861, { strokeWidth: 6 })));
  crane.appendChild(rc.rectangle(bz + 10, GROUND - 660, 60, 40, o(862, { fill: C.yellow, fillStyle: "solid" })));
  const sparks = mk("g", {});

  /* ---------- zone 3: Run, the server room ---------- */
  const rz = Z[2].x, leds = [];
  for (let k = 0; k < 4; k++) {
    const x = rz - 360 + k * 190, g = mk("g", {});
    g.appendChild(rc.rectangle(x, GROUND - 520, 140, 500, o(900 + k, { fill: "#2a2a27", fillStyle: "solid", strokeWidth: 3 })));
    for (let r = 0; r < 9; r++) { g.appendChild(rc.line(x + 12, GROUND - 480 + r * 52, x + 90, GROUND - 480 + r * 52, o(910 + k * 20 + r, { stroke: "rgba(236,235,230,.35)", strokeWidth: 2 })));
      [0, 1, 2].forEach((d) => leds.push(mk("circle", { cx: x + 104 + d * 11, cy: GROUND - 480 + r * 52, r: 4.2, fill: [C.mint, C.red, C.yellow][(k + r + d) % 3], class: "w-led", style: `animation-delay:${((k * 9 + r * 3 + d) % 11) * 0.13}s` }, g))); }
  }
  const cables = mk("g", {});
  [[C.red, 0], [C.sky, 1], [C.yellow, 2], [C.pink, 3]].forEach(([c, i]) => cables.appendChild(rc.path(`M${rz - 290 + i * 190} ${GROUND - 530} C ${rz - 200 + i * 190} ${GROUND - 700}, ${rz - 20 + i * 150} ${GROUND - 720}, ${rz + 40 + i * 120} ${GROUND - 540}`, o(960 + i, { stroke: c, strokeWidth: 5, fill: "none" }))));
  const screen = mk("g", {});
  screen.appendChild(rc.rectangle(rz + 430, GROUND - 470, 300, 190, o(980, { fill: "#1d2a24", fillStyle: "solid", strokeWidth: 3 })));
  const runT1 = mk("text", { x: rz + 580, y: GROUND - 405, "font-family": "'Geist Mono', monospace", "font-size": 22, fill: C.mint, "text-anchor": "middle" }, screen); runT1.textContent = "● LIVE";
  const runT2 = mk("text", { x: rz + 580, y: GROUND - 360, "font-family": "'Geist Mono', monospace", "font-size": 17, fill: "#cfe9dc", "text-anchor": "middle" }, screen);
  txt(rz + 580, GROUND - 300, "on servers I run", 30, "#cfe9dc", screen);

  /* ---------- zone 4: Check, an airport security arch ---------- */
  const cz = Z[3].x, arch = mk("g", {});
  arch.appendChild(rc.rectangle(cz - 160, GROUND - 440, 60, 440, o(1000, { fill: C.red, fillStyle: "zigzag", hachureGap: 12, fillWeight: 3 })));
  arch.appendChild(rc.rectangle(cz + 100, GROUND - 440, 60, 440, o(1001, { fill: C.red, fillStyle: "zigzag", hachureGap: 12, fillWeight: 3 })));
  arch.appendChild(rc.rectangle(cz - 180, GROUND - 500, 360, 70, o(1002, { fill: C.ink, fillStyle: "solid" })));
  const archLight = mk("circle", { cx: cz, cy: GROUND - 465, r: 14, fill: C.mint }, arch);
  const mon = mk("g", {});
  mon.appendChild(rc.rectangle(cz + 250, GROUND - 560, 330, 240, o(1010, { fill: "#101a22", fillStyle: "solid", strokeWidth: 3 })));
  mon.appendChild(rc.line(cz + 415, GROUND - 320, cz + 415, GROUND, o(1011, { strokeWidth: 4 })));
  const monT = txt(cz + 415, GROUND - 520, "X-RAY", 28, C.sky, mon);
  const monRows = [0, 1, 2, 3].map((i) => { const t = mk("text", { x: cz + 275, y: GROUND - 470 + i * 42, "font-family": "'Geist Mono', monospace", "font-size": 26, fill: "#bfe0ff" }, mon); return t; });
  const counter = txt(cz - 440, GROUND - 420, "0", 110, C.ink, null, "middle", 700);
  const counterL = txt(cz - 440, GROUND - 370, "", 28, "rgba(17,17,16,.7)");
  // the inspector
  const insp = mk("g", {}), head = mk("g", {}, insp);
  head.appendChild(rc.circle(0, 0, 70, o(1020, { fill: "#ffe0bd", fillStyle: "solid" })));
  mk("circle", { cx: -12, cy: -4, r: 4, fill: C.ink }, head); mk("circle", { cx: 12, cy: -4, r: 4, fill: C.ink }, head);
  head.appendChild(rc.arc(0, 10, 28, 20, 0, Math.PI, false, o(1021, { strokeWidth: 2.4 })));
  head.appendChild(rc.rectangle(-40, -46, 80, 18, o(1022, { fill: C.sky, fillStyle: "solid" })));
  insp.appendChild(rc.rectangle(-34, 36, 68, 110, o(1023, { fill: C.sky, fillStyle: "hachure", hachureGap: 7 })));
  insp.appendChild(rc.line(-18, 146, -26, 220, o(1024, { strokeWidth: 3 }))); insp.appendChild(rc.line(18, 146, 26, 220, o(1025, { strokeWidth: 3 })));
  const arm = mk("g", {}, insp); arm.appendChild(rc.line(-30, 60, -90, 20, o(1026, { strokeWidth: 3 })));
  arm.appendChild(rc.circle(-110, 8, 44, o(1027, { strokeWidth: 4, fill: "rgba(108,184,255,.25)", fillStyle: "solid" })));
  at(insp, cz + 320, GROUND - 222);

  /* ---------- zone 5: Ship, the runway ---------- */
  const sz = Z[4].x, rw = mk("g", {});
  rw.appendChild(rc.rectangle(sz - 300, GROUND - 6, 2000, 34, o(1100, { fill: "#3a3a36", fillStyle: "solid", strokeWidth: 2 })));
  const rwLights = []; for (let x = sz - 280; x < sz + 1700; x += 60) rwLights.push(mk("circle", { cx: x, cy: GROUND + 11, r: 5, fill: C.red, class: "w-rl", style: `animation-delay:${((x - sz) / 60 % 10) * 0.08}s` }));
  const tower = mk("g", {});
  tower.appendChild(rc.rectangle(sz + 1250, GROUND - 420, 60, 420, o(1110, { fill: "#d9d3c5", fillStyle: "solid" })));
  tower.appendChild(rc.polygon([[sz + 1200, GROUND - 420], [sz + 1360, GROUND - 420], [sz + 1330, GROUND - 490], [sz + 1230, GROUND - 490]], o(1111, { fill: C.sky, fillStyle: "solid" })));
  const beacon = mk("circle", { cx: sz + 1280, cy: GROUND - 510, r: 12, fill: C.red, class: "w-beacon" });
  const sock = mk("g", {}); sock.appendChild(rc.line(sz + 900, GROUND, sz + 900, GROUND - 200, o(1120, { strokeWidth: 3 })));
  const sockBag = mk("g", {}, sock); sockBag.appendChild(rc.polygon([[0, 0], [90, 12], [90, 34], [0, 46]], o(1121, { fill: C.red, fillStyle: "zigzag", hachureGap: 10 })));
  // Improve: the arrow that loops back to Design
  const loop = mk("g", {});
  const loopPath = rc.path(`M${W - 420} ${GROUND - 120} C ${W - 120} ${GROUND - 360}, ${W - 260} ${GROUND - 660}, ${W - 700} ${GROUND - 600}`, o(1130, { stroke: C.red, strokeWidth: 4, fill: "none" }));
  loop.appendChild(loopPath); loop.appendChild(rc.polygon([[W - 690, GROUND - 630], [W - 740, GROUND - 598], [W - 690, GROUND - 568]], o(1131, { fill: C.red, fillStyle: "solid", stroke: C.red })));
  txt(W - 640, GROUND - 500, "Improve, and around again", 46, "#c4260f", loop);
  const loopPaths = [...loopPath.querySelectorAll("path")]; loopPaths.forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.dataset.l = l; });

  /* ---------- the traveller: a box on the belt, then a plane ---------- */
  const box = mk("g", {}), boxIn = mk("g", {}, box);
  boxIn.appendChild(rc.rectangle(-110, -90, 220, 90, o(1200, { fill: "#fff", fillStyle: "solid", strokeWidth: 3 })));
  boxIn.appendChild(rc.line(-110, -90, -80, -120, o(1201, { strokeWidth: 3 }))); boxIn.appendChild(rc.line(110, -90, 80, -120, o(1202, { strokeWidth: 3 })));
  const boxName = txt(0, -32, "", 40, C.ink, boxIn);
  const blocks = mk("g", {}, box); // the stack, added in Build
  const stamp = mk("g", { opacity: 0 }, box);
  stamp.appendChild(rc.circle(96, -100, 58, o(1210, { fill: C.red, fillStyle: "solid", stroke: C.red })));
  stamp.appendChild(rc.linearPath([[76, -100], [90, -86], [116, -116]], o(1211, { stroke: "#fff", strokeWidth: 5 })));
  const bug = mk("g", { opacity: 0, transform: "translate(170 70)" }, box); bug.appendChild(rc.ellipse(-40, -110, 34, 26, o(1220, { fill: C.ink, fillStyle: "solid" })));
  [[-50, -120, -62, -134], [-50, -100, -62, -86], [-30, -120, -18, -134], [-30, -100, -18, -86]].forEach(([a, b, c, d], i) => bug.appendChild(rc.line(a, b, c, d, o(1221 + i, { strokeWidth: 2 }))));
  const zap = txt(160, -60, "zap!", 64, C.red, box); zap.setAttribute("opacity", 0);
  const plane = mk("g", { opacity: 0 });
  plane.appendChild(rc.polygon([[-150, 20], [160, -50], [-40, 70]], o(1300, { fill: C.red, fillStyle: "hachure", hachureGap: 8, fillWeight: 2.4, strokeWidth: 3 })));
  plane.appendChild(rc.polygon([[-40, 70], [160, -50], [-14, 130]], o(1301, { fill: "#fff", fillStyle: "solid", strokeWidth: 3 })));
  const planeName = txt(0, 190, "", 36, "#c4260f", plane);
  const trail = mk("path", { fill: "none", stroke: C.ink, "stroke-width": 3, "stroke-dasharray": "10 14", opacity: 0.4 });

  /* ---------- HUD ---------- */
  const hud = frame.querySelector(".w-hud"), pick = frame.querySelector("#wPick"), again = frame.querySelector("#wAgain"), map = frame.querySelector(".w-map");
  T.forEach((t, i) => { const op = document.createElement("option"); op.value = i; op.textContent = t.n; pick.appendChild(op); });
  const mapDots = Z.map((z) => { const b = document.createElement("span"); b.textContent = z.k; map.appendChild(b); return b; });
  const setTraveller = (i) => {
    ti = i; const t = T[i]; pick.value = i;
    boxName.textContent = t.n.length > 11 ? t.n.split(" ").pop() : t.n; planeName.textContent = t.n;
    travSign.textContent = "today's traveller: " + t.n;
    shot.setAttribute("href", t.img);
    blocks.replaceChildren();
    t.stack.forEach((s, k) => { const g = mk("g", { opacity: 0 }, blocks), w = 200 - k * 20;
      g.appendChild(rc.rectangle(-w / 2, -150 - k * 56, w, 52, o(1400 + k + i * 10, { fill: [C.sky, C.yellow, C.mint, C.pink][k], fillStyle: "solid", strokeWidth: 2.6 })));
      txt(0, -114 - k * 56, s, 30, C.ink, g); });
    runT2.textContent = t.run;
    counterL.textContent = t.testL;
    const rows = [t.stack[0] + " ✓", t.stack[1] + " ✓", t.stack[2] + " ✓", t.stack[3] + " ✓"];
    monRows.forEach((r, k) => (r.textContent = rows[k]));
    update(lastP, true);
  };
  pick.addEventListener("change", () => setTraveller(+pick.value));

  /* ---------- the camera and everything tied to scroll ---------- */
  let viewW = 1600, viewH = H, y0 = 0, lastP = 0;
  let aspect = 1.5;
  const measure = () => { const r = frame.getBoundingClientRect(); aspect = r.width / Math.max(1, r.height); };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const seg = (v, a, b) => clamp((v - a) / (b - a));
  const ease = (t) => t * t * (3 - 2 * t);
  const update = (p, force) => {
    lastP = p;
    // going in: the camera starts pulled back outside the gate and dives in; at the end it pulls back out again
    const zin = ease(seg(p, 0, 0.12)), zout = ease(seg(p, 0.9, 1));
    const zoom = 1 + 0.75 * (1 - zin) + 0.75 * zout, open = zin * (1 - zout);
    viewH = H * zoom; viewW = viewH * aspect; y0 = (GROUND - 380) - viewH / 2 + (H / 2 - (GROUND - 380)) * (1 / zoom);
    // the camera: centre travels from the entrance to the end of the runway
    const cp = ease(seg(p, 0.1, 0.9)), startC = 500, endC = W - 520;
    const cx = startC + (endC - startC) * cp, camX = cx - viewW / 2;
    svg.setAttribute("viewBox", `${camX.toFixed(1)} ${y0} ${viewW.toFixed(1)} ${viewH}`);
    // parallax: the sky and the far skyline move slower than the ground
    sky.setAttribute("transform", `translate(${(camX * 0.55).toFixed(1)} 0)`);
    far.setAttribute("transform", `translate(${(camX * 0.25).toFixed(1)} 0)`);
    // the traveller rides just ahead of the camera centre, on the belt
    const bx = clamp(cx - viewW * 0.05, 900, sz + 200);
    at(box, bx, BELT);
    beltDash.setAttribute("stroke-dashoffset", (-cx * 0.6).toFixed(1));
    const zp = (i) => seg(bx, Z[i].x - ZW * 0.32, Z[i].x + ZW * 0.32);
    // Design: the wireframe draws, then the real screen floods in; the pencil works across it
    const d = zp(0), draw = seg(d, 0.05, 0.42);
    wirePaths.forEach((p) => (p.style.strokeDashoffset = (+p.dataset.l * (1 - draw)).toFixed(1)));
    shot.setAttribute("opacity", ease(seg(d, 0.42, 0.62)).toFixed(3)); wire.setAttribute("opacity", (1 - ease(seg(d, 0.55, 0.72))).toFixed(3));
    at(pencil, dz - 260 + 520 * draw, GROUND - 560 + 300 * Math.abs(Math.sin(draw * 7)), -10);
    // Build: the stack lands block by block, and stays with the traveller
    const b = zp(1);
    [...blocks.children].forEach((g, k) => { const s = seg(b, 0.12 + k * 0.13, 0.22 + k * 0.13); g.setAttribute("opacity", s > 0 ? 1 : 0);
      g.setAttribute("transform", `translate(0 ${(-(1 - ease(s)) * 260).toFixed(1)})`); });
    // Check: through the arch, the X-ray, a bug found and zapped, the tests count up, then the red dot
    const c = zp(3);
    const inArch = c > 0.3 && c < 0.62;
    archLight.setAttribute("fill", inArch ? (c > 0.42 && c < 0.5 ? C.red : C.yellow) : C.mint);
    bug.setAttribute("opacity", c > 0.4 && c < 0.5 ? 1 : 0);
    zap.setAttribute("opacity", c >= 0.5 && c < 0.56 ? 1 : 0);
    monT.textContent = c > 0.42 && c < 0.5 ? "BUG FOUND" : c >= 0.5 ? "ALL CLEAR" : "X-RAY";
    monT.setAttribute("fill", c > 0.42 && c < 0.5 ? C.red : c >= 0.5 ? C.mint : C.sky);
    monRows.forEach((r, k) => r.setAttribute("opacity", c > 0.32 + k * 0.03 ? 1 : 0.15));
    const t = T[ti], cnt = seg(c, 0.2, 0.62);
    counter.setAttribute("opacity", c > 0.08 ? 1 : 0); counterL.setAttribute("opacity", c > 0.08 ? 1 : 0);
    counter.textContent = t.test ? Math.round(t.test * ease(cnt)).toLocaleString("en") : cnt > 0.5 ? "✓" : "·";
    stamp.setAttribute("opacity", c > 0.72 ? 1 : 0);
    // Ship: the box folds into a plane, taxis and takes off; the Improve arrow draws back to the start
    const s5 = seg(cx, sz - 200, W - 520);
    const flying = s5 > 0.12;
    boxIn.setAttribute("opacity", flying ? 0 : 1); blocks.setAttribute("opacity", flying ? 0 : 1); stamp.setAttribute("opacity", flying ? 0 : c > 0.72 ? 1 : 0);
    plane.setAttribute("opacity", flying ? 1 : 0);
    if (flying) { const f = seg(s5, 0.12, 1), px = bx + f * 1300, lift = Math.max(0, f - 0.25) * 1.33, py = BELT - 60 - ease(lift) * 560;
      at(plane, px, py, -18 * Math.min(1, lift * 3), 0.9);
      trail.setAttribute("d", `M${bx} ${BELT - 60} L${(bx + Math.min(f, 0.25) * 1300).toFixed(0)} ${BELT - 60} Q ${(bx + 0.6 * f * 1300).toFixed(0)} ${(BELT - 60).toFixed(0)} ${px.toFixed(0)} ${py.toFixed(0)}`);
    } else trail.setAttribute("d", "");
    const lp = ease(seg(s5, 0.55, 0.95)); loopPaths.forEach((p) => (p.style.strokeDashoffset = (+p.dataset.l * (1 - lp)).toFixed(1)));
    // HUD
    const zi = Z.reduce((best, z, i) => (Math.abs(z.x - cx) < Math.abs(Z[best].x - cx) ? i : best), 0);
    mapDots.forEach((m, i) => { m.classList.toggle("on", i === zi && cp > 0.04); m.classList.toggle("done", Z[i].x < cx - 300); });
    pick.parentElement.classList.toggle("show", cp < 0.04);
    map.classList.toggle("show", open > 0.5);
    again.classList.toggle("show", s5 > 0.7);
  };

  // ambient life, only while the world is on screen
  let live = false, t0 = performance.now();
  gsap.ticker.add(() => {
    if (!live) return;
    const t = (performance.now() - t0) / 1000;
    clouds.forEach((c) => at(c.g, ((c.x + t * c.v) % (W + 600)) - 300, c.y, 0, c.s));
    birds.forEach((b) => { const x = ((b.x + t * 60) % (W + 600)) - 300; at(b.g, x, b.y + Math.sin(t * 2 + b.p) * 12, 0, 1 + Math.sin(t * 8 + b.p) * 0.12); });
    at(sun, 5200, 170, t * 8);
    gears.forEach((g) => at(g.g, g.x, g.y, g.dir * (t * 40 * g.sp + lastP * 2400 * g.sp)));
    at(arm, 0, 0, Math.sin(t * 2.4) * 14); arm.setAttribute("transform", `rotate(${(Math.sin(t * 2.4) * 14).toFixed(1)} -30 60)`);
    head.setAttribute("transform", `rotate(${(Math.sin(t * 1.3) * 5).toFixed(1)})`);
    sockBag.setAttribute("transform", `translate(${sz + 900} ${GROUND - 196}) skewY(${(Math.sin(t * 3) * 6).toFixed(1)})`);
    if (Math.random() < 0.25 && lastP > 0.2 && lastP < 0.45) { // sparks in the workshop
      const s = mk("circle", { cx: bz + (Math.random() - 0.5) * 300, cy: GROUND - 300 - Math.random() * 200, r: 4 + Math.random() * 4, fill: [C.yellow, C.red, C.pink][(Math.random() * 3) | 0] }, sparks);
      gsap.to(s, { attr: { cy: "+=" + (60 + Math.random() * 80) }, opacity: 0, duration: 0.8, onComplete: () => s.remove() });
    }
  });

  /* ---------- pin it ---------- */
  measure();
  setTraveller(0);
  if (REDUCED) { update(0.62); return; }
  // desktop: hold the whole About row (paragraph, card and the three points) while the camera travels in the card;
  // phone: the column is too tall, so only the card holds, centred
  const row = card.closest(".ab-two"), wide = () => innerWidth >= 900 && row && row.offsetHeight < innerHeight - 100;
  const st = ScrollTrigger.create({
    trigger: wide() ? row : card, pin: wide() ? row : card, start: () => (wide() ? "top 84px" : "center center"), end: () => "+=" + Math.round(innerHeight * (innerWidth < 700 ? 3.2 : 3.6)), scrub: 0.6, anticipatePin: 1,
    onUpdate: (self) => update(self.progress),
    onToggle: (self) => { live = self.isActive || (self.progress > 0 && self.progress < 1); },
  });
  new IntersectionObserver((es) => es.forEach((e) => { live = e.isIntersecting; })).observe(frame);
  addEventListener("resize", () => { measure(); update(lastP, true); });
  again.addEventListener("click", () => { setTraveller((ti + 1) % T.length); const y = st.start + 2; if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.6 }); else scrollTo({ top: y, behavior: "smooth" }); });
  update(0);
})();
