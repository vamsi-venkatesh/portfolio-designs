/* The Checkpoint, a tiny paper-cut game. On the page it is a small taped card; "Step inside" grows its frame into a
   big window. Each product has its own world (a dusk city, a paper valley, a sunrise farm, a robot lab, a night
   forge, a fairground, a paper-flight studio, a night harbour), and in each one the same five stations: Design,
   Build, Run, Check, Ship. At every station you do the thing (or press "Do it for me"). Dot, a red-dot mascot,
   rides the box. Things can be poked: the sun or moon, the clouds, the inspector, Dot.
   The look is cut paper: flat colours, hand-cut edges, a shadow under every layer, a paper grain.
   Product facts come from the code audit of 2026-09-23. */
(() => {
  "use strict";
  const card = document.getElementById("doodle");
  if (!card || !window.gsap) return;
  const { gsap } = window;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";

  /* ---------- the cut-paper kit ---------- */
  const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let R = mulberry32(2026);
  const rnd = () => R(), jit = (j) => (R() - 0.5) * 2 * j;
  const E = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const cut = (pts, j = 0.9, step = 11) => { let d = "";
    for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length], len = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(len / step)), nx = -(by - ay) / (len || 1), ny = (bx - ax) / (len || 1);
      for (let k = 0; k < n; k++) { const t = k / n, o = k === 0 ? 0 : jit(j); d += (d ? "L" : "M") + (ax + (bx - ax) * t + nx * o).toFixed(1) + " " + (ay + (by - ay) * t + ny * o).toFixed(1); } }
    return d + "Z"; };
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const circle = (cx, cy, rx, ry = rx) => { const n = Math.max(14, Math.round((rx + ry) * 0.5)); return Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }); };
  const arc = (cx, cy, r, a0, a1, n = 18) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * (k / n); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  const hill = (x0, x1, y, amp, waves, bottom = 1200) => { const p = [[x0, bottom]]; for (let x = x0; x <= x1; x += 30) p.push([x, y + Math.sin((x / (x1 - x0)) * Math.PI * waves + waves) * amp + jit(3)]); p.push([x1, bottom]); return p; };
  const sheet = (g, pts, fill, j = 0.9) => E("path", { d: cut(pts, j), fill }, g);
  const layer = (parent, depth) => { const g = E("g", { class: "cut" }, parent); g.style.setProperty("--sh", depth); return g; };
  const text = (g, x, y, s, size, fill, weight, anchor, font) => { const t = E("text", { x, y, "font-size": size, fill, "font-weight": weight || 600, "text-anchor": anchor || "middle", "font-family": font || "'Funnel Display', sans-serif" }, g); t.textContent = s; return t; };
  const at = (el, x, y, r, s) => el.setAttribute("transform", `translate(${x} ${y})${r ? ` rotate(${r})` : ""}${s != null ? ` scale(${s})` : ""}`);
  const INK = "#2b2622", CREAM = "#fbf4e4", RED = "#ff3b1f";

  /* ---------- the travellers and their worlds ---------- */
  const T = [
    { n: "Conxto", th: "city", img: "peek/conxto-a.webp", stack: ["React", "Fastify", "PostgreSQL", "5 agents"], run: "19 systemd units · Caddy", test: 129, testL: "test scripts" },
    { n: "UnboundPDF", th: "paper", img: "peek/unboundpdf-a.webp", stack: ["WebAssembly", "OCR", "pdf-lib", "AES"], run: "systemd · Caddy · nginx", test: 471, testL: "tests" },
    { n: "FarmQuick", th: "farm", img: "peek/farmquick-a.webp", stack: ["Astro", "Worker", "D1", "n8n"], run: "Docker Compose · Caddy", test: 408, testL: "tests" },
    { n: "Agent Service Lab", th: "lab", img: "peek/lab-a.webp", stack: ["React Flow", "Node.js", "FastAPI", "pgvector"], run: "Docker sandboxes · systemd", test: 2900, testL: "evaluation cases" },
    { n: "VVDex Forge", th: "forge", img: "peek/forge-a.webp", stack: ["Python", "Graders", "Playwright", "Docker"], run: "network-off sandboxes", test: 0, testL: "exams certified first" },
    { n: "PitchRadar", th: "fair", img: "peek/pitchradar-a.webp", stack: ["React 19", "TypeScript", "Postgres", "7 agents"], run: "Compose · Caddy · systemd", test: 620, testL: "tests" },
    { n: "Conxfolio", th: "folio", img: "peek/conxfolio-a.webp", stack: ["HTML & CSS", "251 tokens", "pdf.js", "Fastify"], run: "systemd · Caddy", test: 0, testL: "stress-audited designs" },
    { n: "VVDex Trading", th: "harbour", img: "peek/trading-a.webp", stack: ["Python", "WebSockets", "SQLite", "Redis"], run: "systemd · Caddy", test: 0, testL: "calls hash-chained" },
  ];
  // one palette per world; ship = how it leaves
  const TH = {
    city: { title: "Dusk city", sky: ["#34406f", "#b884a4", "#f6c79a"], night: 0.5, far: ["#8a88ad", "#6f6f98"], mid: ["#7e8fb0", "#5e6e92"], near: ["#56688c", "#3f4f70"], road: "#d8b98c", wall: "#e9dccb", roof: "#c55a4a", a: ["#f3b04a", "#8fc3e6", "#f2a7a0", "#9ed7b8", "#c9b8ff"], ship: "plane" },
    paper: { title: "Paper valley", sky: ["#8fd3cc", "#d4efe9", "#fbf3df"], night: 0, far: ["#f3eee3", "#e5dccb"], mid: ["#fffaf0", "#efe6d4"], near: ["#e9e0cd", "#d8ccb4"], road: "#e8d8b5", wall: "#ffffff", roof: "#3e8a86", a: ["#ffb3a3", "#8fd3cc", "#f6c65b", "#c9e6ff", "#d9c7ff"], ship: "plane" },
    farm: { title: "Sunrise farm", sky: ["#f49a6c", "#fbcf95", "#fff0cf"], night: 0, far: ["#b8cf86", "#9fbf6f"], mid: ["#8fbd5e", "#6fa149"], near: ["#5f9241", "#467a30"], road: "#dcb77e", wall: "#f2e2c4", roof: "#c0392b", a: ["#f3b04a", "#9ed7b8", "#f2a7a0", "#8fc3e6", "#f7d27a"], ship: "truck" },
    lab: { title: "Robot lab", sky: ["#241c4a", "#5a4a9c", "#c6b7ef"], night: 0.8, far: ["#6d5fa8", "#574a92"], mid: ["#5b4f95", "#43397a"], near: ["#3e346f", "#2c2455"], road: "#b9a9d8", wall: "#e4e0f5", roof: "#2fb5a7", a: ["#7ef0d8", "#c9b8ff", "#ffd36b", "#8fc3e6", "#ff9fc4"], ship: "rocket" },
    forge: { title: "Night forge", sky: ["#0f1530", "#2a2f5c", "#6c4c6e"], night: 1, far: ["#3a3d64", "#2c2f50"], mid: ["#34365a", "#262846"], near: ["#26283f", "#1a1b2e"], road: "#8e7a68", wall: "#d8cdb8", roof: "#d2552e", a: ["#ff9a4a", "#ffd36b", "#e87a5a", "#b9c7ff", "#f2a7a0"], ship: "plane" },
    fair: { title: "The fairground", sky: ["#5bb6e6", "#b6e3f5", "#fff0c8"], night: 0, far: ["#a7d59a", "#8cc47e"], mid: ["#86c26f", "#67a651"], near: ["#56943f", "#3f7a2c"], road: "#e8c790", wall: "#fff3dc", roof: "#e8423a", a: ["#ff6b6b", "#ffd23f", "#4ecdc4", "#ff9ff3", "#54a0ff"], ship: "truck" },
    folio: { title: "Paper flight", sky: ["#f2dfcf", "#f7ece0", "#fffaf2"], night: 0, far: ["#efe1cf", "#e5d3bd"], mid: ["#f6ead9", "#eadbc5"], near: ["#e6d5bc", "#d6c3a6"], road: "#eadbc2", wall: "#fffdf8", roof: "#ff3b1f", a: ["#ff3b1f", "#f3b04a", "#f2a7a0", "#ffd9c7", "#e8dcc2"], ship: "plane" },
    harbour: { title: "Night harbour", sky: ["#0b1330", "#1b2a58", "#3d5190"], night: 1, far: ["#2a3a6e", "#213060"], mid: ["#243462", "#1a2750"], near: ["#1c2a52", "#131e3c"], road: "#7c8aa8", wall: "#dfe3ee", roof: "#3fbf8f", a: ["#3fbf8f", "#ff5a5a", "#ffd36b", "#8fc3e6", "#c9b8ff"], ship: "boat" },
  };

  /* ---------- the stage ---------- */
  const H = 1000, GROUND = 760, BELT = 700, W = 6600;
  const S = [{ k: "Design", x: 900, act: "Paint it" }, { k: "Build", x: 2100, act: "Drop a block" }, { k: "Run", x: 3300, act: "Power on" }, { k: "Check", x: 4500, act: "Scan it" }, { k: "Ship", x: 5700, act: "Launch" }];
  const [d0, b0, r0, c0, s0] = S.map((s) => s.x);
  const inner = document.createElement("div"); inner.className = "d-in pw"; card.appendChild(inner);
  const svg = E("svg", { class: "pw-svg", preserveAspectRatio: "xMidYMid slice", "aria-hidden": "true" }); inner.appendChild(svg);
  const grain = document.createElement("div"); grain.className = "pw-grain"; inner.appendChild(grain);
  (() => { const c = document.createElement("canvas"); c.width = c.height = 160; const x = c.getContext("2d"), img = x.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) { const v = 180 + Math.random() * 75; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 30; }
    x.putImageData(img, 0, 0); grain.style.backgroundImage = `url(${c.toDataURL()})`; })();
  inner.insertAdjacentHTML("beforeend", `
    <div class="pw-start"><p class="pw-kicker" id="pwWorld">a tiny game</p><p class="pw-title">Send a product through the checkpoint</p><button type="button" class="pw-go">▶ Step inside</button></div>
    <div class="pw-hud">
      <div class="pw-top"><span class="pw-step" id="pwStep"></span><div class="pw-dots" id="pwDots"></div><button type="button" class="pw-x" aria-label="Close">×</button></div>
      <div class="pw-pick" id="pwPick"><p>Choose a traveller</p><div class="pw-chips" id="pwChips"></div><small>each one has its own world</small></div>
      <p class="pw-hint" id="pwHint"></p>
      <div class="pw-bar"><button type="button" class="pw-act" id="pwAct"></button><button type="button" class="pw-next" id="pwNext">Next →</button></div>
    </div>`);
  const $ = (s) => inner.querySelector(s);
  const hint = $("#pwHint"), actB = $("#pwAct"), nextB = $("#pwNext"), stepT = $("#pwStep"), dotsEl = $("#pwDots"), pick = $("#pwPick"), worldT = $("#pwWorld");
  const dotEls = S.map((s) => { const d = document.createElement("span"); d.textContent = s.k; dotsEl.appendChild(d); return d; });

  /* ---------- building a world ---------- */
  let V = {}, th = null, thKey = "";
  function build(key) {
    thKey = key; th = TH[key]; V = { orbSpin: 0 };
    R = mulberry32(key.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7));
    svg.replaceChildren();
    const defs = E("defs", {}, svg);
    const grad = (id, stops) => { const g = E("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs); stops.forEach(([o, c]) => E("stop", { offset: o, "stop-color": c }, g)); };
    grad("pwSky", [[0, th.sky[0]], [0.6, th.sky[1]], [1, th.sky[2]]]); grad("pwFar", [[0, th.far[0]], [1, th.far[1]]]); grad("pwMid", [[0, th.mid[0]], [1, th.mid[1]]]); grad("pwNear", [[0, th.near[0]], [1, th.near[1]]]);
    const glow = E("radialGradient", { id: "pwGlow" }, defs); E("stop", { offset: 0, "stop-color": "#ffd9a0", "stop-opacity": 0.9 }, glow); E("stop", { offset: 1, "stop-color": "#ffb060", "stop-opacity": 0 }, glow);
    const plane = (name) => E("g", { class: "pl pl-" + name }, svg);
    const L = V.L = { sky: plane("sky"), far: plane("far"), mid: plane("mid"), build: plane("build"), belt: plane("belt"), fx: plane("fx"), near: plane("near"), air: plane("air") };
    const night = th.night;

    /* sky: stars at night, a sun or a moon with a face, clouds */
    E("rect", { x: -800, y: -900, width: W + 1600, height: 2800, fill: "url(#pwSky)" }, L.sky);
    if (night > 0.3) for (let k = 0; k < 110; k++) E("circle", { cx: -400 + rnd() * (W + 800), cy: -300 + rnd() * 700, r: (1 + rnd() * 2.2).toFixed(1), fill: "#fff6dc", class: "pw-star", style: `animation-delay:${(rnd() * 3).toFixed(2)}s` }, L.sky);
    const orb = V.orb = layer(L.sky, 2); orb.classList.add("pw-poke");
    if (night > 0.6) { sheet(orb, circle(0, 0, 64), "#f6e9c6"); sheet(orb, circle(24, -26, 12), "#e6d6ae", 0.3); sheet(orb, circle(-30, 30, 9), "#e6d6ae", 0.3); }
    else { for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; sheet(orb, [[Math.cos(a) * 72, Math.sin(a) * 72], [Math.cos(a + 0.12) * 106, Math.sin(a + 0.12) * 106], [Math.cos(a + 0.24) * 72, Math.sin(a + 0.24) * 72]], "#f3b04a", 0.3); } sheet(orb, circle(0, 0, 64), "#f6c65b"); }
    E("ellipse", { cx: -20, cy: -8, rx: 6, ry: 8, fill: INK }, orb); V.eyeR = E("ellipse", { cx: 20, cy: -8, rx: 6, ry: 8, fill: INK }, orb);
    E("path", { d: "M-20 18 Q 0 34 20 18", fill: "none", stroke: INK, "stroke-width": 5, "stroke-linecap": "round" }, orb);
    E("circle", { cx: -36, cy: 12, r: 8, fill: "rgba(255,90,90,.45)" }, orb); E("circle", { cx: 36, cy: 12, r: 8, fill: "rgba(255,90,90,.45)" }, orb);
    orb.addEventListener("click", (e) => { e.stopPropagation(); gsap.fromTo(V, { orbSpin: 0 }, { orbSpin: 360, duration: 0.9, ease: "back.inOut(1.4)" }); wink(); });
    const cloudCol = night > 0.6 ? "#4c5784" : night > 0.3 ? "#ecd8ea" : "#fffaf0";
    V.clouds = [[300, 170, 1], [1500, 120, 0.8], [2600, 200, 1.1], [3700, 130, 0.9], [4800, 180, 1], [5900, 120, 0.85]].map(([x, y, s]) => {
      const g = layer(L.sky, 2); g.classList.add("pw-poke"); [[0, 30, 44], [40, 10, 52], [86, 26, 40], [50, 40, 60]].forEach(([cx, cy, r]) => sheet(g, circle(cx * s, cy * s, r * s, r * s * 0.72), cloudCol, 0.5));
      const c = { g, x, y, s, v: 8 + s * 6, lastX: x }; g.addEventListener("click", (e) => { e.stopPropagation(); rain(c); }); return c; });

    /* land */
    sheet(layer(L.far, 2), hill(-800, W + 800, 520, 40, 9), "url(#pwFar)", 0.5);
    const back = layer(L.far, 2);
    sheet(layer(L.mid, 3), hill(-800, W + 800, 640, 24, 6), "url(#pwMid)", 0.5);
    const mid = layer(L.mid, 3);
    BACK[key](back, mid, night);
    const road = layer(L.mid, 3); sheet(road, [[-800, GROUND - 6], [W + 800, GROUND - 14], [W + 800, GROUND + 70], [-800, GROUND + 74]], th.road, 0.5);
    sheet(layer(L.near, 6), hill(-800, W + 800, 880, 12, 11), "url(#pwNear)", 0.5);
    // foreground: tufts, flowers, little rocks, for depth
    const fore = layer(L.near, 7);
    for (let x = -600; x < W + 600; x += 90 + rnd() * 120) {
      const k = rnd();
      if (k < 0.5) sheet(fore, [[x, 900], [x + 10, 850], [x + 16, 900], [x + 26, 860], [x + 32, 900]], th.near[0], 0.4);
      else if (k < 0.75) sheet(fore, circle(x, 882, 18, 12), night > 0.6 ? "#3b3f5c" : "#b8ad98", 0.5);
      else { sheet(fore, rect(x, 860, 4, 40), th.near[1], 0.2); sheet(fore, circle(x + 2, 856, 10), th.a[(rnd() * 5) | 0], 0.4); }
    }

    /* the gate */
    const gate = layer(L.build, 5);
    sheet(gate, rect(80, 380, 34, 380), th.roof, 0.4); sheet(gate, rect(480, 380, 34, 380), th.roof, 0.4);
    sheet(gate, rect(40, 300, 514, 120), RED, 0.6); sheet(gate, rect(58, 316, 478, 88), CREAM, 0.5);
    text(gate, 297, 368, "The Checkpoint", 54, INK, 700); text(gate, 297, 397, th.title, 24, "#8a7a68", 600, "middle", "'Caveat', cursive");
    E("path", { d: "M114 440 Q 297 520 480 440", fill: "none", stroke: INK, "stroke-width": 2 }, gate);
    for (let i = 0; i < 7; i++) { const t = 0.12 + i * 0.125, x = 114 + 366 * t, y = 440 + 160 * t * (1 - t); sheet(gate, [[x - 14, y], [x + 14, y], [x, y + 30]], th.a[i % 5], 0.3); }
    const flag = layer(L.build, 5); sheet(flag, rect(0, 0, 6, 150), "#343a45", 0.2); V.flagCloth = layer(flag, 1); sheet(V.flagCloth, [[6, 4], [70, 18], [6, 40]], RED, 0.4); at(flag, 540, 150);
    S.forEach((s, i) => { const g = layer(L.build, 4); sheet(g, rect(s.x - 470, 560, 8, 200), "#6b4526", 0.3);
      sheet(g, rect(s.x - 540, 500, 150, 70), th.a[i % 5], 0.6); text(g, s.x - 465, 548, s.k, 34, INK, 700); });

    /* Design */
    const easel = layer(L.build, 5);
    sheet(easel, [[d0 - 230, GROUND], [d0 - 160, 250], [d0 - 146, 250], [d0 - 214, GROUND]], "#8a5a2b", 0.3);
    sheet(easel, [[d0 + 230, GROUND], [d0 + 160, 250], [d0 + 146, 250], [d0 + 214, GROUND]], "#8a5a2b", 0.3);
    sheet(easel, rect(d0 - 280, 230, 560, 350), "#fffdf6", 0.6);
    V.shot = E("image", { x: d0 - 266, y: 244, width: 532, height: 322, preserveAspectRatio: "xMidYMid slice", opacity: 0 }, easel);
    V.wire = E("g", {}, easel);
    V.wires = [[14, 14, 504, 34], [14, 62, 300, 150], [330, 62, 188, 70], [330, 146, 188, 66], [14, 226, 240, 82], [270, 226, 248, 82]].map(([x, y, w, h]) =>
      E("rect", { x: d0 - 266 + x, y: 244 + y, width: w, height: h, rx: 6, fill: "none", stroke: RED, "stroke-width": 3, "stroke-dasharray": 900, "stroke-dashoffset": 900 }, V.wire));
    const pots = layer(L.build, 5); th.a.slice(0, 4).forEach((c, i) => { sheet(pots, rect(d0 + 290 + i * 62, GROUND - 60, 50, 60), c, 0.4); sheet(pots, rect(d0 + 286 + i * 62, GROUND - 66, 58, 12), "#343a45", 0.3); });
    V.pencil = layer(L.fx, 6); sheet(V.pencil, [[0, 0], [100, -100], [124, -76], [24, 24]], "#f3b04a", 0.3); sheet(V.pencil, [[0, 0], [24, 24], [-20, 36]], INK, 0.2); at(V.pencil, d0 + 250, 250);

    /* Build */
    const shop = layer(L.build, 5), win = night > 0.4 ? "#ffe6a8" : "#bfe0ea";
    sheet(shop, rect(b0 - 330, 360, 250, 400), th.wall, 0.5); sheet(shop, rect(b0 - 330, 360, 250, 22), "rgba(255,255,255,.35)", 0.3); sheet(shop, [[b0 - 350, 370], [b0 - 205, 290], [b0 - 60, 370]], th.roof, 0.4);
    sheet(shop, rect(b0 - 290, 430, 70, 70), win, 0.3); sheet(shop, rect(b0 - 190, 430, 70, 70), win, 0.3);
    const gearShape = (r, n = 18) => { const p = []; for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2, rr = k % 2 ? r : r + 14; p.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return p; };
    V.gears = [[b0 - 250, 620, 42, th.a[0]], [b0 - 160, 660, 28, th.a[2]]].map(([x, y, r, c], i) => { const g = layer(L.build, 6); sheet(g, gearShape(r), c, 0.3); sheet(g, circle(0, 0, r * 0.35), "#343a45", 0.2); return { g, x, y, dir: i ? -1 : 1, r }; });
    const crane = layer(L.build, 6);
    sheet(crane, rect(b0 + 180, 150, 22, GROUND - 150), "#f3b04a", 0.3); sheet(crane, rect(b0 - 120, 140, 340, 20), "#f3b04a", 0.3);
    for (let k = 0; k < 8; k++) E("path", { d: `M${b0 + 180} ${190 + k * 70} l22 35`, stroke: INK, "stroke-width": 2 }, crane);
    V.hook = layer(L.fx, 6); V.hook.setAttribute("opacity", 0); E("line", { x1: 0, y1: -600, x2: 0, y2: 0, stroke: INK, "stroke-width": 3 }, V.hook); sheet(V.hook, [[-14, 0], [14, 0], [8, 22], [-8, 22]], "#343a45", 0.2);

    /* Run */
    const hut = layer(L.build, 5); V.leds = [];
    sheet(hut, rect(r0 - 340, 300, 620, 460), th.wall, 0.5); sheet(hut, [[r0 - 370, 310], [r0 - 30, 210], [r0 + 310, 310]], th.roof, 0.5);
    for (let k = 0; k < 4; k++) { const x = r0 - 300 + k * 140; sheet(hut, rect(x, 360, 110, 370), "#343a45", 0.3);
      for (let r = 0; r < 7; r++) { sheet(hut, rect(x + 10, 380 + r * 48, 60, 8), "#59606d", 0.1); [0, 1].forEach((dd) => V.leds.push(E("circle", { cx: x + 84 + dd * 14, cy: 384 + r * 48, r: 5, fill: "#4a4f58", class: "pw-led" }, hut))); } }
    const lever = layer(L.build, 6); sheet(lever, rect(r0 + 330, 560, 90, 110), "#343a45", 0.3); V.leverArm = layer(lever, 2); sheet(V.leverArm, rect(-6, -110, 12, 110), "#9aa3ad", 0.2); sheet(V.leverArm, circle(0, -114, 18), RED, 0.3); at(V.leverArm, r0 + 375, 600, -40);
    const liveBox = layer(L.build, 6); sheet(liveBox, rect(r0 - 170, 190, 300, 60), "#343a45", 0.3);
    V.liveT = text(liveBox, r0 - 20, 230, "OFFLINE", 28, "#8d949e", 700, "middle", "'Geist Mono', monospace");
    V.runT = text(L.build, r0 - 20, 286, "", 22, night > 0.5 ? "#f4ead2" : INK, 600, "middle", "'Geist Mono', monospace");

    /* Check */
    const arch = layer(L.build, 6);
    sheet(arch, rect(c0 - 170, 330, 60, 430), "#e6e1d6", 0.4); sheet(arch, rect(c0 + 110, 330, 60, 430), "#e6e1d6", 0.4); sheet(arch, rect(c0 - 190, 290, 380, 60), "#2d3a5c", 0.4);
    for (let k = 0; k < 6; k++) { sheet(arch, rect(c0 - 170, 360 + k * 66, 60, 26), RED, 0.2); sheet(arch, rect(c0 + 110, 360 + k * 66, 60, 26), RED, 0.2); }
    V.archLamp = E("circle", { cx: c0, cy: 320, r: 16, fill: "#3fd07a", stroke: INK, "stroke-width": 2 }, L.build);
    const scr = layer(L.build, 6); sheet(scr, rect(c0 + 240, 230, 330, 250), "#343a45", 0.4); sheet(scr, rect(c0 + 255, 245, 300, 220), "#10212e", 0.3); sheet(scr, rect(c0 + 395, 480, 20, 280), "#343a45", 0.2);
    V.scrT = text(scr, c0 + 405, 285, "X-RAY", 28, "#8fd0ff", 700, "middle", "'Geist Mono', monospace");
    V.scrRows = [0, 1, 2, 3].map((k) => text(scr, c0 + 275, 330 + k * 36, "", 22, "#cfe8ff", 500, "start", "'Geist Mono', monospace"));
    V.counter = text(L.build, c0 - 360, 470, "", 96, night > 0.5 ? "#fbf4e4" : INK, 800);
    V.counterL = text(L.build, c0 - 360, 512, "", 28, night > 0.5 ? "#e8dcc2" : "rgba(43,38,34,.75)", 600, "middle", "'Caveat', cursive");
    const insp = V.insp = layer(L.build, 6); insp.classList.add("pw-poke"); V.head = E("g", {}, insp);
    sheet(insp, rect(-36, 40, 72, 120), "#3e8a86", 0.4); sheet(insp, rect(-30, 160, 22, 90), "#2d3a5c", 0.3); sheet(insp, rect(8, 160, 22, 90), "#2d3a5c", 0.3);
    sheet(V.head, circle(0, 0, 36), "#f6d2b0", 0.4); sheet(V.head, rect(-40, -44, 80, 20), "#2d3a5c", 0.3);
    E("circle", { cx: -12, cy: -2, r: 4, fill: INK }, V.head); E("circle", { cx: 12, cy: -2, r: 4, fill: INK }, V.head);
    E("path", { d: "M-12 14 Q 0 24 12 14", fill: "none", stroke: INK, "stroke-width": 3, "stroke-linecap": "round" }, V.head);
    V.arm = E("g", {}, insp); sheet(V.arm, rect(-120, 50, 90, 16), "#3e8a86", 0.3); sheet(V.arm, circle(-140, 50, 26), "rgba(143,195,230,.55)", 0.3);
    at(insp, c0 + 230, 510);
    insp.addEventListener("click", (e) => { e.stopPropagation(); say(c0 + 230, 420, ["hello!", "all clear?", "show me the tests", "nothing ships unchecked"][(Math.random() * 4) | 0]); jumpInsp(); });

    /* Ship: runway, road, launch pad or pier */
    SHIP[th.ship].build();

    /* the loop home */
    V.loopG = E("g", { opacity: 0 }, L.air);
    V.loopPath = E("path", { d: `M${s0 + 700} 560 C ${s0 + 900} 300, ${s0 + 700} 120, ${s0 + 300} 160`, fill: "none", stroke: RED, "stroke-width": 6, "stroke-linecap": "round", "stroke-dasharray": "14 14" }, V.loopG);
    sheet(V.loopG, [[s0 + 300, 140], [s0 + 250, 162], [s0 + 304, 184]], RED, 0.2);
    text(V.loopG, s0 + 560, 120, "Improve, and around again", 40, night > 0.5 ? "#ffb3a3" : "#c4260f", 600, "middle", "'Caveat', cursive");

    /* the belt */
    const belt = layer(L.belt, 5);
    sheet(belt, rect(560, BELT, s0 - 800, 34), "#3b3f47", 0.4);
    for (let x = 620; x < s0 - 260; x += 180) { sheet(belt, [[x, BELT + 34], [x + 10, BELT + 34], [x - 10, GROUND + 10], [x - 20, GROUND + 10]], "#4b4f57", 0.2); sheet(belt, [[x, BELT + 34], [x + 10, BELT + 34], [x + 30, GROUND + 10], [x + 20, GROUND + 10]], "#4b4f57", 0.2); }
    V.beltDash = E("line", { x1: 570, y1: BELT + 17, x2: s0 - 250, y2: BELT + 17, stroke: "#f3b04a", "stroke-width": 4, "stroke-dasharray": "16 24" }, L.belt);

    /* the traveller: a box, its stack, Dot riding on top */
    V.box = E("g", {}, L.fx);
    E("ellipse", { cx: 0, cy: 6, rx: 120, ry: 12, fill: "rgba(0,0,0,.18)" }, V.box);
    const body = layer(V.box, 6); sheet(body, rect(-110, -96, 220, 96), "#e3b574", 0.6); sheet(body, rect(-110, -96, 220, 16), "#c9955a", 0.3);
    V.boxName = text(body, 0, -36, "", 34, INK, 700);
    V.blocks = E("g", {}, V.box);
    V.bug = E("g", { opacity: 0 }, V.box);
    const bb = layer(V.bug, 3); sheet(bb, circle(0, 0, 26, 20), RED, 0.3); sheet(bb, circle(-20, 0, 12), INK, 0.2);
    [-12, 0, 12].forEach((dx) => { E("line", { x1: dx, y1: -16, x2: dx - 8, y2: -30, stroke: INK, "stroke-width": 3 }, V.bug); E("line", { x1: dx, y1: 16, x2: dx - 8, y2: 30, stroke: INK, "stroke-width": 3 }, V.bug); });
    E("circle", { cx: 6, cy: -6, r: 4, fill: INK }, V.bug); E("circle", { cx: 12, cy: 7, r: 4, fill: INK }, V.bug);
    E("circle", { cx: 0, cy: 0, r: 64, fill: "transparent", style: "cursor:pointer" }, V.bug).addEventListener("click", (e) => { e.stopPropagation(); squash(); });
    V.stamp = E("g", { opacity: 0 }, V.box); V.stampIn = layer(V.stamp, 3); sheet(V.stampIn, circle(0, 0, 36), RED, 0.3); E("path", { d: "M-16 0 l12 12 l20 -26", fill: "none", stroke: "#fff", "stroke-width": 6, "stroke-linecap": "round" }, V.stampIn); at(V.stamp, 100, -110);
    // Dot, the mascot
    V.dot = E("g", { class: "pw-poke" }, V.box); V.dotIn = E("g", {}, V.dot);
    const db = layer(V.dotIn, 3); sheet(db, circle(0, 0, 34), RED, 0.4); sheet(db, circle(-12, -14, 9), "rgba(255,255,255,.35)", 0.2);
    V.dotEyes = E("g", {}, V.dotIn);
    [-12, 12].forEach((x) => { E("ellipse", { cx: x, cy: -2, rx: 9, ry: 11, fill: "#fff" }, V.dotEyes); E("circle", { cx: x + 2, cy: 0, r: 5, fill: INK }, V.dotEyes); });
    V.dotMouth = E("path", { d: "M-8 16 Q 0 22 8 16", fill: "none", stroke: "#fff", "stroke-width": 3, "stroke-linecap": "round" }, V.dotIn);
    V.dot.addEventListener("click", (e) => { e.stopPropagation(); dotHop(); say(boxX, BELT + dotY() - 50, ["hi!", "wheee", "am I shipped yet?", "checked ✓", "boop"][(Math.random() * 5) | 0]); });
    V.confetti = E("g", {}, L.air);
    V.say = E("g", {}, L.air);
  }

  /* ---------- each world's backdrop ---------- */
  const BACK = {
    city(g, m) { for (let x = -300; x < W + 300; x += 150 + rnd() * 80) { const h = 180 + rnd() * 260, w = 90 + rnd() * 70; sheet(g, rect(x, 560 - h, w, h + 40), rnd() < 0.5 ? "#6f6e9c" : "#5f6a92", 0.4);
        for (let yy = 560 - h + 20; yy < 540; yy += 34) for (let xx = x + 14; xx < x + w - 20; xx += 26) if (rnd() < 0.6) sheet(g, rect(xx, yy, 12, 16), rnd() < 0.7 ? "#ffe6a8" : "#8fa3c8", 0.1); }
      const board = layer(m, 4); sheet(board, rect(660, 470, 180, 150), "#9b6b3e", 0.4); sheet(board, rect(672, 482, 156, 126), "#e7c793", 0.3);
      for (let k = 0; k < 6; k++) { const x = 682 + (k % 3) * 50, y = 492 + ((k / 3) | 0) * 58; sheet(board, rect(x, y, 40, 48), ["#fff", "#ffe8b0", "#d6ecff"][k % 3], 0.3); E("circle", { cx: x + 20, cy: y + 4, r: 4, fill: RED }, board); } },
    paper(g, m) { for (let k = 0; k < 7; k++) { const x = -200 + k * 1050 + rnd() * 200, w = 360 + rnd() * 160, h = 300 + rnd() * 120;
        sheet(g, rect(x, 560 - h, w, h + 60), "#fffdf6", 0.5); sheet(g, [[x + w - 70, 560 - h], [x + w, 560 - h + 70], [x + w - 70, 560 - h + 70]], "#e8dcc2", 0.3);
        for (let r = 0; r < 6; r++) sheet(g, rect(x + 30, 560 - h + 40 + r * 36, w * (0.5 + rnd() * 0.35), 8), "#d9cfbd", 0.1); }
      const lock = layer(m, 4); E("path", { d: "M2900 470 v-60 a70 70 0 0 1 140 0 v60", fill: "none", stroke: "#3e8a86", "stroke-width": 26 }, lock); sheet(lock, rect(2860, 460, 220, 170), "#3e8a86", 0.5); sheet(lock, circle(2970, 530, 18), "#1f4d4a", 0.3); sheet(lock, rect(2962, 540, 16, 44), "#1f4d4a", 0.2); },
    farm(g, m) { for (let k = 0; k < 18; k++) E("path", { d: `M${-300 + k * 420} 600 q 200 -30 400 0`, fill: "none", stroke: "rgba(70,110,40,.35)", "stroke-width": 8 }, g);
      [[700, 520], [3900, 500]].forEach(([x, y]) => { sheet(g, rect(x, y - 150, 200, 170), "#c0392b", 0.4); sheet(g, [[x - 20, y - 146], [x + 100, y - 230], [x + 220, y - 146]], "#8e2a1f", 0.4); sheet(g, rect(x + 70, y - 70, 60, 90), "#f2e2c4", 0.3);
        E("path", { d: `M${x + 70} ${y - 70} l60 90 M${x + 130} ${y - 70} l-60 90`, stroke: "#c0392b", "stroke-width": 5 }, g); sheet(g, rect(x + 230, y - 220, 70, 240), "#d9d2c3", 0.4); sheet(g, circle(x + 265, y - 220, 35, 26), "#8a959a", 0.3); });
      V.mill = { x: 2600, y: 330 }; sheet(g, [[2570, 580], [2590, 340], [2610, 340], [2630, 580]], "#e8dcc2", 0.3); V.blades = layer(g, 1);
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; sheet(V.blades, [[0, 0], [Math.cos(a) * 110 - Math.sin(a) * 16, Math.sin(a) * 110 + Math.cos(a) * 16], [Math.cos(a) * 110, Math.sin(a) * 110]], "#fff8e8", 0.3); }
      for (let k = 0; k < 20; k++) { const x = rnd() * W; sheet(m, rect(x - 4, 560, 8, 60), "#6b4526", 0.2); sheet(m, circle(x, 540, 36 + rnd() * 16), rnd() < 0.5 ? "#5f9241" : "#7fb24f", 0.6); } },
    lab(g, m) { for (let k = 0; k < 6; k++) { const x = 300 + k * 1100 + rnd() * 200, r = 110 + rnd() * 60; sheet(g, arc(x, 560, r, Math.PI, Math.PI * 2).concat([[x + r, 600], [x - r, 600]]), "#8878c8", 0.4);
        for (let w = 0; w < 4; w++) sheet(g, circle(x - r * 0.5 + w * r * 0.34, 560 - r * 0.45, 9), "#ffe6a8", 0.1); sheet(g, rect(x - 3, 560 - r - 90, 6, 90), "#c6b7ef", 0.2); E("circle", { cx: x, cy: 560 - r - 94, r: 8, fill: "#7ef0d8", class: "pw-blink" }, g); }
      const dish = layer(m, 4); sheet(dish, arc(1500, 520, 90, Math.PI * 0.85, Math.PI * 1.85), "#e4e0f5", 0.4); sheet(dish, rect(1490, 520, 20, 110), "#9a90c8", 0.3); },
    forge(g, m) { const hall = layer(g, 2); sheet(hall, rect(600, 360, 520, 200), "#d8cdb8", 0.4); sheet(hall, [[570, 364], [860, 250], [1150, 364]], "#b9ab93", 0.4); for (let k = 0; k < 6; k++) sheet(hall, rect(630 + k * 84, 380, 26, 170), "#efe6d2", 0.2);
      for (let k = 0; k < 4; k++) { const x = 1800 + k * 1300; sheet(g, rect(x, 420, 140, 150), "#4b4460", 0.4); sheet(g, rect(x + 50, 330, 40, 100), "#4b4460", 0.3); E("circle", { cx: x + 70, cy: 490, r: 120, fill: "url(#pwGlow)" }, g); sheet(g, rect(x + 30, 460, 80, 70), "#ff9a4a", 0.3); }
      const anvil = layer(m, 4); sheet(anvil, [[2900, 560], [3080, 560], [3050, 600], [2930, 600]], "#3b3f52", 0.3); sheet(anvil, rect(2960, 600, 60, 40), "#3b3f52", 0.2); },
    fair(g, m) { V.wheel = { x: 3000, y: 330 }; sheet(g, [[2900, 600], [3000, 330], [3100, 600]], "#d9d2c3", 0.3); V.wheelG = E("g", {}, g);
      E("circle", { cx: 0, cy: 0, r: 190, fill: "none", stroke: "#e8e2d4", "stroke-width": 10 }, V.wheelG); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5; E("line", { x1: 0, y1: 0, x2: Math.cos(a) * 190, y2: Math.sin(a) * 190, stroke: "#e8e2d4", "stroke-width": 4 }, V.wheelG); }
      V.cabins = Array.from({ length: 10 }, (_, k) => { const c = layer(g, 1); sheet(c, rect(-24, 0, 48, 36), ["#ff6b6b", "#ffd23f", "#4ecdc4", "#ff9ff3", "#54a0ff"][k % 5], 0.3); return { c, k }; });
      for (let k = 0; k < 6; k++) { const x = 400 + k * 1050, t = layer(m, 4); for (let s = 0; s < 6; s++) sheet(t, [[x + s * 30, 600], [x + 90, 470], [x + s * 30 + 30, 600]], s % 2 ? "#fff3dc" : "#e8423a", 0.3); sheet(t, circle(x + 90, 464, 8), "#ffd23f", 0.2); }
      for (let k = 0; k < 14; k++) { const x = rnd() * W, c = ["#ff6b6b", "#ffd23f", "#4ecdc4", "#ff9ff3", "#54a0ff"][k % 5]; E("line", { x1: x, y1: 330, x2: x + 8, y2: 400, stroke: INK, "stroke-width": 1.5 }, m); sheet(m, circle(x, 310, 22, 28), c, 0.4); } },
    folio(g, m) { for (let k = 0; k < 7; k++) { const x = -200 + k * 1000 + rnd() * 200, top = 300 + rnd() * 80; sheet(g, [[x, 580], [x + 220, top], [x + 460, 580]], "#f1e3d0", 0.4); sheet(g, [[x + 220, top + 20], [x + 460, 580], [x + 220, 580]], "#e4d2ba", 0.4); }
      for (let n = 0; n < 3; n++) { const x0 = 400 + n * 2100; E("path", { d: `M${x0} 380 Q ${x0 + 300} 430 ${x0 + 600} 380`, fill: "none", stroke: INK, "stroke-width": 2 }, m);
        for (let k = 0; k < 4; k++) { const x = x0 + 60 + k * 130, y = 392 + Math.sin((k + 0.5) / 4 * Math.PI) * 38, p = layer(m, 3); sheet(p, rect(x, y, 80, 104), "#fffdf8", 0.4); for (let r = 0; r < 5; r++) sheet(p, rect(x + 10, y + 14 + r * 16, 60 * (r ? 0.8 : 0.5), 5), r ? "#d9cfbd" : RED, 0.1); sheet(p, rect(x + 34, y - 10, 10, 20), "#c8642d", 0.1); } } },
    harbour(g, m) { for (let x = -300; x < W + 300; x += 70) { const up = rnd() < 0.55, h = 60 + rnd() * 200, y = 560 - h - rnd() * 60; E("line", { x1: x + 20, y1: y - 30, x2: x + 20, y2: y + h + 20, stroke: up ? "#3fbf8f" : "#ff5a5a", "stroke-width": 3 }, g); sheet(g, rect(x + 6, y, 28, h), up ? "#3fbf8f" : "#ff5a5a", 0.3); }
      sheet(m, [[-800, 600], [W + 800, 600], [W + 800, GROUND - 10], [-800, GROUND - 10]], "#1f3470", 0.4);
      for (let k = 0; k < 40; k++) E("path", { d: `M${(rnd() * W).toFixed(0)} ${(620 + rnd() * 110).toFixed(0)} q14 -8 28 0 t28 0`, fill: "none", stroke: "rgba(160,190,240,.35)", "stroke-width": 3 }, m);
      const lh = layer(m, 4); sheet(lh, [[1500, 600], [1520, 360], [1580, 360], [1600, 600]], "#dfe3ee", 0.3); for (let k = 0; k < 3; k++) sheet(lh, rect(1512 + k * 3, 420 + k * 60, 76 - k * 6, 22), "#ff5a5a", 0.2); sheet(lh, rect(1510, 330, 80, 34), "#ffe6a8", 0.2);
      V.beam = E("path", { d: "M1550 346 L2300 250 L2300 440 Z", fill: "rgba(255,236,170,.18)" }, m);
      for (let k = 0; k < 5; k++) { const b = layer(m, 3), x = 400 + k * 1300; sheet(b, [[x, 640], [x + 120, 640], [x + 100, 664], [x + 20, 664]], "#fbf6ea", 0.3); sheet(b, [[x + 50, 640], [x + 60, 580], [x + 90, 640]], "#e8dcc2", 0.3); } },
  };

  /* ---------- how each world ships ---------- */
  function tower() { const x = s0 + 380, g = layer(V.L.build, 5); sheet(g, rect(x, 330, 70, 430), "#e6e1d6", 0.4); sheet(g, [[x - 50, 330], [x + 120, 330], [x + 90, 250], [x - 20, 250]], th.roof, 0.4); sheet(g, rect(x - 8, 262, 86, 40), th.night > 0.4 ? "#ffe6a8" : "#bfe0ea", 0.3); E("circle", { cx: x + 35, cy: 236, r: 12, fill: RED, class: "pw-beacon" }, V.L.build); }
  const SHIP = {
    plane: { build() { const rw = layer(V.L.belt, 4); sheet(rw, [[s0 - 300, GROUND - 4], [W + 400, GROUND - 10], [W + 400, GROUND + 42], [s0 - 300, GROUND + 46]], "#4b4f57", 0.4);
        V.rwl = []; for (let x = s0 - 280; x < W + 300; x += 70) V.rwl.push(E("circle", { cx: x, cy: GROUND + 20, r: 6, fill: "#6b4b40" }, V.L.belt)); tower();
        V.veh = layer(V.L.air, 6); sheet(V.veh, [[-130, 20], [140, -44], [-36, 60]], "#fffdf6", 0.3); sheet(V.veh, [[-36, 60], [140, -44], [-12, 110]], "#e8dcc2", 0.3); sheet(V.veh, [[-130, 20], [-36, 60], [-80, 30]], RED, 0.2); V.veh.setAttribute("opacity", 0); },
      go: (t) => { const lift = Math.max(0, t - 0.35) / 0.65; return [s0 + t * 1100, BELT - 70 - lift * lift * 620, -20 * Math.min(1, lift * 2)]; } },
    truck: { build() { V.rwl = []; for (let x = s0 - 280; x < W + 300; x += 90) V.rwl.push(E("rect", { x, y: GROUND + 16, width: 40, height: 6, fill: "#fff4d6" }, V.L.belt));
        const fair = thKey === "fair", g = V.veh = layer(V.L.air, 6); sheet(g, rect(-150, -120, 190, 110), fair ? "#ffd23f" : "#f2e2c4", 0.4); sheet(g, rect(40, -90, 80, 80), fair ? "#e8423a" : "#c0392b", 0.4); sheet(g, rect(56, -80, 46, 30), "#bfe0ea", 0.3);
        if (fair) { sheet(g, rect(-130, -100, 120, 40), "#343a45", 0.2); for (let k = 0; k < 6; k++) sheet(g, rect(-150 + k * 32, -134, 32, 16), k % 2 ? "#fff" : RED, 0.1); }
        else for (let k = 0; k < 3; k++) sheet(g, circle(-110 + k * 50, -126, 22), ["#7fb24f", "#e8423a", "#f3b04a"][k], 0.4);
        [-100, 70].forEach((x) => { sheet(g, circle(x, -8, 24), INK, 0.3); sheet(g, circle(x, -8, 10), "#9aa3ad", 0.2); }); V.veh.setAttribute("opacity", 0); },
      go: (t) => [s0 + t * t * 1500, BELT + 58 + Math.sin(t * 40) * 3, 0] },
    rocket: { build() { const pad = layer(V.L.belt, 4); sheet(pad, rect(s0 - 120, GROUND - 20, 240, 40), "#6d6a8a", 0.4); sheet(pad, rect(s0 + 150, 250, 26, GROUND - 250), "#b9a9d8", 0.3); for (let k = 0; k < 6; k++) E("path", { d: `M${s0 + 150} ${280 + k * 70} l26 30`, stroke: INK, "stroke-width": 2 }, pad); V.rwl = [];
        tower(); const g = V.veh = layer(V.L.air, 6); sheet(g, [[0, -260], [50, -170], [50, 0], [-50, 0], [-50, -170]], "#f4f1ff", 0.3); sheet(g, circle(0, -150, 22), "#8fc3e6", 0.2); sheet(g, [[-50, -60], [-90, 10], [-50, 0]], RED, 0.2); sheet(g, [[50, -60], [90, 10], [50, 0]], RED, 0.2);
        V.flame = layer(g, 1); sheet(V.flame, [[-30, 0], [0, 110], [30, 0]], "#ffb347", 0.3); sheet(V.flame, [[-16, 0], [0, 70], [16, 0]], "#fff1a8", 0.2); V.veh.setAttribute("opacity", 0); },
      go: (t) => [s0, BELT - 20 - t * t * 1500, 0] },
    boat: { build() { const pier = layer(V.L.belt, 4); sheet(pier, [[s0 - 300, GROUND - 4], [W + 400, GROUND - 10], [W + 400, GROUND + 80], [s0 - 300, GROUND + 80]], "#1f3470", 0.4);
        for (let x = s0 - 280; x < W + 300; x += 60) E("path", { d: `M${x} ${GROUND + 30} q14 -8 28 0 t28 0`, fill: "none", stroke: "rgba(160,190,240,.5)", "stroke-width": 3 }, pier); V.rwl = []; tower();
        const g = V.veh = layer(V.L.air, 6); sheet(g, [[-160, -10], [160, -10], [120, 40], [-120, 40]], "#fbf6ea", 0.4); sheet(g, rect(-8, -250, 10, 240), "#8a5a2b", 0.2); sheet(g, [[6, -240], [150, -30], [6, -30]], "#fffdf6", 0.4); sheet(g, [[-10, -200], [-120, -30], [-10, -30]], "#3fbf8f", 0.4); V.veh.setAttribute("opacity", 0); },
      go: (t) => [s0 + t * 1300, BELT + 70 + Math.sin(t * 12) * 6, Math.sin(t * 10) * 4] },
  };

  /* ---------- camera + state ---------- */
  let ti = 0, aspect = 1.5, cam = { x: 380, zoom: 1.12 }, stage = -1, done = [], busy = false, open = false, boxX = 520, moving = null, bugWalk = false, live = false;
  const measure = () => { const r = inner.getBoundingClientRect(); aspect = r.width / Math.max(1, r.height); };
  const view = () => { const vh = H * cam.zoom * (aspect < 1 ? 1.35 : 1), vw = vh * aspect, y0 = 530 - vh * 0.55;
    svg.setAttribute("viewBox", `${(cam.x - vw / 2).toFixed(1)} ${y0.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
    V.L.sky.setAttribute("transform", `translate(${(cam.x * 0.6).toFixed(1)} 0)`); V.L.far.setAttribute("transform", `translate(${(cam.x * 0.3).toFixed(1)} 0)`); V.L.near.setAttribute("transform", `translate(${(-cam.x * 0.12).toFixed(1)} 0)`); };
  const dotY = () => -96 - V.blocks.children.length * 58 - 36;
  const placeBox = () => { at(V.box, boxX, BELT); at(V.dot, 0, dotY()); V.beltDash.setAttribute("stroke-dashoffset", (-boxX * 0.8).toFixed(1)); };
  function setTraveller(i) {
    ti = i; const t = T[i];
    build(t.th); // a fresh world each time: every state starts clean
    worldT.textContent = "a tiny game · " + th.title.toLowerCase();
    V.boxName.textContent = t.n.length > 11 ? t.n.split(" ").pop() : t.n;
    V.shot.setAttribute("href", t.img);
    V.scrRows.forEach((r, k) => { r.textContent = t.stack[k] + "  ✓"; r.setAttribute("opacity", 0); });
    done = [false, false, false, false, false]; boxX = 520; bugWalk = false; placeBox(); view();
  }
  const ui = () => {
    dotEls.forEach((d, i) => { d.classList.toggle("on", i === stage); d.classList.toggle("done", !!done[i]); });
    pick.classList.toggle("show", stage < 0);
    if (stage < 0) { stepT.textContent = th.title; hint.textContent = "Pick a product. Each one has its own world."; actB.hidden = true; nextB.textContent = "Start →"; return; }
    const s = S[stage]; stepT.textContent = `${stage + 1} / 5 · ${s.k}`;
    actB.hidden = done[stage]; actB.textContent = stage === 3 && bugWalk ? "Squash it" : stage === 4 ? { plane: "Take off", truck: "Hit the road", rocket: "Lift off", boat: "Set sail" }[th.ship] : s.act;
    nextB.textContent = stage === 4 ? (done[4] ? "Send another ↻" : "Launch for me →") : done[stage] ? "Next station →" : "Do it for me →";
    hint.textContent = stage === 3 && bugWalk ? "Bug! Click it to squash it." : done[stage] ? ["Designed.", "Built.", "Live, on servers I run.", "Checked. Nothing ships until it is.", "Shipped. And around again."][stage]
      : ["Paint the design onto the canvas.", "Drop the stack onto it, block by block.", "Pull the lever: power it on.", "Scan it. If anything turns up, squash it.", "Send it on its way."][stage];
  };
  function go(i) {
    if (busy && !moving) return;
    if (moving) moving.kill();
    stage = i; ui(); busy = true;
    const tx = i < 0 ? 380 : S[i].x;
    const tl = moving = gsap.timeline({ onComplete: () => { busy = false; moving = null; ui(); } });
    tl.to(cam, { x: tx + (i === 3 ? 60 : 0), zoom: 1, duration: REDUCED ? 0 : 1.3, ease: "power2.inOut", onUpdate: view }, 0);
    if (i >= 0) tl.to({ v: boxX }, { v: tx, duration: REDUCED ? 0 : 1.3, ease: "power2.inOut", onUpdate() { boxX = this.targets()[0].v; placeBox(); } }, 0)
      .fromTo(V.dotIn, { rotation: -10 }, { rotation: 10, duration: 0.25, yoyo: true, repeat: 4, transformOrigin: "50% 100%", onComplete: () => gsap.set(V.dotIn, { rotation: 0 }) }, 0.1);
  }

  /* ---------- the five actions ---------- */
  const A = [
    () => gsap.timeline()
      .to(V.wires, { attr: { "stroke-dashoffset": 0 }, duration: 0.9, stagger: 0.1, ease: "power1.inOut" })
      .to({ t: 0 }, { t: 1, duration: 1.2, ease: "none", onUpdate() { const t = this.targets()[0].t; at(V.pencil, d0 - 240 + 480 * t, 280 + 260 * Math.abs(Math.sin(t * 9)), -8); } }, 0)
      .to(V.shot, { attr: { opacity: 1 }, duration: 0.8 }, ">-0.2").to(V.wire, { attr: { opacity: 0 }, duration: 0.5 }, "<0.3")
      .call(() => { at(V.pencil, d0 + 250, 250); cheer(); }),
    () => { const t = T[ti], k = V.blocks.children.length; if (k >= 4) return gsap.timeline().to({}, { duration: 0.01 });
      const g = layer(V.blocks, 3), w = 200 - k * 22; sheet(g, rect(-w / 2, -150 - k * 58, w, 54), th.a[(k + 1) % 5], 0.4); text(g, 0, -113 - k * 58, t.stack[k], 26, INK, 700);
      placeBox();
      return gsap.timeline().set(V.hook, { attr: { opacity: 1 } })
        .fromTo(g, { y: -420 }, { y: 0, duration: 0.55, ease: "bounce.out" })
        .call(() => gsap.fromTo(V.dotIn, { y: 0 }, { y: -30, duration: 0.18, yoyo: true, repeat: 1 }))
        .fromTo(V.hook, { attr: { transform: `translate(${boxX} ${BELT - 520 - k * 58})` } }, { attr: { transform: `translate(${boxX} ${BELT - 700})` }, duration: 0.4 }, 0.1); },
    () => gsap.timeline().to({ a: -40 }, { a: 40, duration: 0.35, ease: "back.out(3)", onUpdate() { at(V.leverArm, r0 + 375, 600, this.targets()[0].a); } })
      .add(() => V.leds.forEach((l, k) => setTimeout(() => l.setAttribute("fill", ["#3fd07a", "#f3b04a", "#8fc3e6"][k % 3]), k * 22)))
      .to({}, { duration: 0.6 }).call(() => { V.liveT.textContent = "● LIVE"; V.liveT.setAttribute("fill", "#3fd07a"); V.runT.textContent = T[ti].run; cheer(); }),
    () => gsap.timeline().call(() => V.archLamp.setAttribute("fill", "#f3b04a"))
      .to(V.scrRows, { attr: { opacity: 1 }, duration: 0.2, stagger: 0.25 })
      .call(() => { V.scrT.textContent = "BUG FOUND"; V.scrT.setAttribute("fill", RED); V.archLamp.setAttribute("fill", RED); V.bug.setAttribute("opacity", 1); bugWalk = true; scared(); }),
    () => { const ship = SHIP[th.ship];
      return gsap.timeline()
        .to(V.rwl, { attr: { fill: th.ship === "truck" ? "#ffd23f" : RED }, duration: 0.05, stagger: 0.03 })
        .call(() => { V.box.setAttribute("opacity", 0); V.veh.setAttribute("opacity", 1); const [x, y, r] = ship.go(0); at(V.veh, x, y, r); })
        .to({ t: 0 }, { t: 1, duration: 2.3, ease: "power2.in", onUpdate() { const t = this.targets()[0].t, [x, y, r] = ship.go(t); at(V.veh, x, y, r);
          if (th.ship === "rocket") { if (Math.random() < 0.6) smoke(x, y + 60); } else { cam.x = S[4].x + t * 500; view(); if (th.ship === "truck" && Math.random() < 0.3) smoke(x - 150, y - 10); } } }, 0.2)
        .call(burst)
        .set(V.loopG, { attr: { opacity: 1 } }).fromTo(V.loopPath, { attr: { "stroke-dashoffset": 600 } }, { attr: { "stroke-dashoffset": 0 }, duration: 1.2 }); },
  ];
  const squash = () => { if (!bugWalk) return; bugWalk = false; busy = true; actB.hidden = true; hint.textContent = "Squashed! Counting the tests…"; const t = T[ti];
    const bx = +(V.bug.getAttribute("transform") || "translate(60 0)").match(/translate\(([-\d.]+)/)[1], splat = text(V.box, bx, -150, "splat!", 44, RED, 800, "middle", "'Caveat', cursive");
    gsap.timeline().to(V.bug, { attr: { opacity: 0 }, duration: 0.2 }).to(splat, { attr: { opacity: 0 }, duration: 0.4, delay: 0.5 }).call(() => splat.remove())
      .call(() => { V.scrT.textContent = "ALL CLEAR"; V.scrT.setAttribute("fill", "#3fd07a"); V.archLamp.setAttribute("fill", "#3fd07a"); jumpInsp(); cheer(); }, null, 0.2)
      .to({ v: 0 }, { v: t.test || 1, duration: 1.1, ease: "power2.out", onUpdate() { V.counter.textContent = t.test ? Math.round(this.targets()[0].v).toLocaleString("en") : "✓"; } }, 0.2)
      .call(() => { V.counterL.textContent = t.testL; V.stamp.setAttribute("opacity", 1);
        const sp = { s: 2.2 }; gsap.to(sp, { s: 1, duration: 0.4, ease: "back.out(3)", onUpdate: () => V.stampIn.setAttribute("transform", `scale(${sp.s})`) }); done[3] = true; busy = false; ui(); }); };

  /* ---------- playful bits ---------- */
  const jumpInsp = () => gsap.to({ j: 0 }, { j: 1, duration: 0.8, onUpdate() { at(V.insp, c0 + 230, 510 - Math.abs(Math.sin(this.targets()[0].j * Math.PI * 2)) * 30); } });
  const dotHop = () => gsap.fromTo(V.dotIn, { y: 0 }, { y: -60, duration: 0.25, ease: "power2.out", yoyo: true, repeat: 1 });
  const cheer = () => { dotHop(); const m = V.dotMouth; m.setAttribute("d", "M-10 12 Q 0 26 10 12"); setTimeout(() => m.setAttribute("d", "M-8 16 Q 0 22 8 16"), 1400); };
  const scared = () => { V.dotMouth.setAttribute("d", "M-7 18 Q 0 12 7 18"); gsap.fromTo(V.dotIn, { x: -4 }, { x: 4, duration: 0.05, repeat: 11, yoyo: true, onComplete: () => gsap.set(V.dotIn, { x: 0 }) }); };
  const wink = () => gsap.fromTo(V.eyeR, { attr: { ry: 8 } }, { attr: { ry: 1 }, duration: 0.12, yoyo: true, repeat: 1 });
  function say(px, py, words) {
    V.say.replaceChildren(); const g = E("g", {}, V.say), w = Math.max(90, words.length * 17 + 30);
    sheet(g, [[px - w / 2, py - 50], [px + w / 2, py - 50], [px + w / 2, py], [px + 12, py], [px, py + 20], [px - 6, py], [px - w / 2, py]], "#fffdf6", 0.5);
    text(g, px, py - 14, words, 32, INK, 700, "middle", "'Caveat', cursive");
    gsap.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.2 }); gsap.to(g, { opacity: 0, duration: 0.4, delay: 1.6 });
  }
  function rain(c) { for (let i = 0; i < 14; i++) { const x = c.lastX + (20 + Math.random() * 110) * c.s, d = E("path", { d: `M${x.toFixed(0)} ${c.y + 70} q5 12 0 18 q-5 -6 0 -18`, fill: "#6fb6e6" }, V.L.sky);
      gsap.to(d, { attr: { transform: `translate(0 ${(260 + Math.random() * 160).toFixed(0)})` }, opacity: 0, duration: 0.8 + Math.random() * 0.5, delay: i * 0.05, ease: "power1.in", onComplete: () => d.remove() }); } }
  function smoke(x, y) { const p = E("circle", { cx: x + (Math.random() - 0.5) * 30, cy: y + 30, r: 14 + Math.random() * 14, fill: "rgba(255,255,255,.7)" }, V.L.fx);
    gsap.to(p, { attr: { r: 44 }, opacity: 0, duration: 0.9, onComplete: () => p.remove() }); }
  function burst() { for (let i = 0; i < 30; i++) { const c = E("rect", { width: 16, height: 10, fill: th.a[i % 5] }, V.confetti), a = Math.random() * Math.PI * 2, v = 160 + Math.random() * 260;
    const st = { x: cam.x, y: 360, r: 0 }; gsap.to(st, { x: st.x + Math.cos(a) * v, y: st.y + Math.sin(a) * v * 0.6 + 200, r: 720 * Math.random(), duration: 1.6, ease: "power2.out", onUpdate: () => c.setAttribute("transform", `translate(${st.x} ${st.y}) rotate(${st.r})`), onComplete: () => c.remove() }); } }

  const finish = () => { busy = false; if (stage === 1) cheer(); done[stage] = true; ui(); };
  const act = () => {
    if (busy || stage < 0 || done[stage]) return;
    if (stage === 3 && bugWalk) return squash();
    busy = true; const tl = A[stage]();
    tl.eventCallback("onComplete", () => { busy = false; if ((stage === 1 && V.blocks.children.length < 4) || stage === 3) return ui(); finish(); });
  };
  const next = () => {
    if (busy && !moving) return;
    if (stage < 0) return go(0);
    if (!done[stage]) {
      if (stage === 3 && bugWalk) return squash();
      busy = true; const tl = A[stage]();
      tl.eventCallback("onComplete", () => { busy = false; if (stage === 1 && V.blocks.children.length < 4) return next(); if (stage === 3) { ui(); return setTimeout(squash, 700); } finish(); });
      return;
    }
    if (stage === 4) { setTraveller((ti + 1) % T.length); return go(-1); }
    go(stage + 1);
  };
  actB.addEventListener("click", act); nextB.addEventListener("click", next);
  T.forEach((t, i) => { const b = document.createElement("button"); b.type = "button"; b.textContent = t.n; b.addEventListener("click", () => { if (moving) moving.kill(); busy = false; moving = null; setTraveller(i); go(0); }); $("#pwChips").appendChild(b); });

  /* ---------- ambient life ---------- */
  let blinkAt = 0;
  gsap.ticker.add(() => {
    if (!live) return;
    const t = performance.now() / 1000;
    V.clouds.forEach((c) => { c.lastX = ((c.x + t * c.v) % (W + 900)) - 450; at(c.g, c.lastX, c.y); });
    at(V.orb, 4700, 150, V.orbSpin);
    V.gears.forEach((g) => at(g.g, g.x, g.y, g.dir * t * 40 * (60 / g.r)));
    V.flagCloth.setAttribute("transform", `skewY(${(Math.sin(t * 3) * 7).toFixed(1)})`);
    V.head.setAttribute("transform", `rotate(${(Math.sin(t * 1.4) * 5).toFixed(1)})`);
    V.arm.setAttribute("transform", `rotate(${(Math.sin(t * 2.2) * 8).toFixed(1)} -30 58)`);
    if (V.blades) at(V.blades, V.mill.x, V.mill.y, t * 30);
    if (V.wheelG) { at(V.wheelG, V.wheel.x, V.wheel.y, t * 8); V.cabins.forEach(({ c, k }) => { const a = (t * 8 + k * 36) * Math.PI / 180; at(c, V.wheel.x + Math.cos(a) * 190, V.wheel.y + Math.sin(a) * 190); }); }
    if (V.beam) V.beam.setAttribute("transform", `rotate(${(Math.sin(t * 0.8) * 22).toFixed(1)} 1550 346)`);
    if (bugWalk) at(V.bug, 60 + Math.sin(t * 2.2) * 50, -120 + Math.cos(t * 3.1) * 20, Math.sin(t * 6) * 20);
    if (t > blinkAt) { blinkAt = t + 2.5 + Math.random() * 2.5; const e = V.dotEyes; gsap.fromTo({ s: 1 }, { s: 1 }, { s: 0.1, duration: 0.08, yoyo: true, repeat: 1, onUpdate() { e.setAttribute("transform", `translate(0 -2) scale(1 ${this.targets()[0].s}) translate(0 2)`); } }); }
  });
  new IntersectionObserver((es) => es.forEach((e) => (live = e.isIntersecting || open))).observe(card);

  /* ---------- the card: it flips through the worlds while it waits ---------- */
  let lastScrollP = 0; addEventListener("scroll", () => (lastScrollP = performance.now()), { passive: true });
  // rebuilding a world costs a few frames: only while the page is still, never mid-scroll
  const peekNext = () => { if (open || !live || REDUCED || performance.now() - lastScrollP < 1500) return; gsap.to(svg, { opacity: 0, duration: 0.3, onComplete: () => { if (open) return gsap.set(svg, { opacity: 1 }); setTraveller((ti + 1) % T.length); cam = { x: 380, zoom: 1.12 }; view(); gsap.to(svg, { opacity: 1, duration: 0.4 }); } }); };
  setInterval(peekNext, 5000);
  svg.addEventListener("click", () => { if (!open) openIt(); });

  /* ---------- the frame: from the card to a big window and back ---------- */
  const shade = document.createElement("div"); shade.className = "pw-shade"; document.body.appendChild(shade);
  const holder = document.createElement("div"); holder.className = "pw-holder"; card.appendChild(holder);
  const targetRect = () => { const m = innerWidth < 700 ? 0 : 40, w = Math.min(innerWidth - m * 2, 1280), h = innerWidth < 700 ? innerHeight : Math.min(innerHeight - m * 2, w / 1.6);
    return { left: (innerWidth - w) / 2, top: (innerHeight - h) / 2, width: w, height: h }; };
  function openIt() {
    if (open) return; open = true; live = true; gsap.killTweensOf(svg); gsap.set(svg, { opacity: 1 });
    const r = inner.getBoundingClientRect(), tr = targetRect();
    document.body.appendChild(inner); inner.classList.add("pw-big");
    Object.assign(inner.style, { position: "fixed", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", zIndex: 95 });
    shade.classList.add("on"); document.documentElement.classList.add("pw-lock");
    gsap.to(inner, { left: tr.left, top: tr.top, width: tr.width, height: tr.height, duration: REDUCED ? 0 : 0.7, ease: "expo.inOut", onUpdate: () => { measure(); view(); },
      onComplete: () => { measure(); stage = -1; setTraveller(ti); go(-1); nextB.focus(); } });
  }
  function closeIt() {
    if (!open) return;
    const r = holder.getBoundingClientRect();
    if (moving) moving.kill(); moving = null; busy = false;
    gsap.to(inner, { left: r.left, top: r.top, width: r.width, height: r.height, duration: REDUCED ? 0 : 0.6, ease: "expo.inOut", onUpdate: () => { measure(); view(); },
      onComplete: () => { inner.classList.remove("pw-big"); inner.removeAttribute("style"); card.insertBefore(inner, holder); open = false; stage = -1; cam = { x: 380, zoom: 1.12 }; setTraveller(ti); measure(); view(); } });
    shade.classList.remove("on"); document.documentElement.classList.remove("pw-lock");
  }
  $(".pw-go").addEventListener("click", (e) => { e.stopPropagation(); openIt(); }); $(".pw-x").addEventListener("click", closeIt); shade.addEventListener("click", closeIt);
  addEventListener("keydown", (e) => { if (!open) return; if (e.key === "Escape") closeIt(); if (e.key === "ArrowRight") next(); });
  addEventListener("resize", () => { if (open) { const tr = targetRect(); Object.assign(inner.style, { left: tr.left + "px", top: tr.top + "px", width: tr.width + "px", height: tr.height + "px" }); } measure(); view(); });

  setTraveller(0); measure(); view();
})();
