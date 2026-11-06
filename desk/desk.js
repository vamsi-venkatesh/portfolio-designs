// The Desk: a paper-cut diorama. Every shape is cut with a slightly wobbly edge, every sheet casts a shadow
// on the sheet behind it, and a grain of real paper sits over everything.
(() => {
  "use strict";
  const D = window.DESK;
  const NS = "http://www.w3.org/2000/svg";
  const W = 1600, H = 1000;

  // seeded randomness, so the cut is the same on every visit
  function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  let R = mulberry32(1965);
  const jit = (j) => (R() - 0.5) * 2 * j;

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // ---------- cutting ----------
  // A polygon cut by hand: each edge is walked in short steps, each step off by a hair.
  function cut(pts, j = 0.9, step = 11) {
    let d = "";
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      const len = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(len / step));
      const nx = -(by - ay) / (len || 1), ny = (bx - ax) / (len || 1);
      for (let k = 0; k < n; k++) {
        const t = k / n, o = k === 0 ? 0 : jit(j);
        const x = ax + (bx - ax) * t + nx * o, y = ay + (by - ay) * t + ny * o;
        d += (d ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
      }
    }
    return d + "Z";
  }
  const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  function roundPts(x, y, w, h, r) { // a rounded rectangle as points
    const p = [], seg = 5;
    [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]].forEach(([cx, cy, a0]) => {
      for (let k = 0; k <= seg; k++) { const a = (a0 + (k / seg) * 90) * Math.PI / 180; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    });
    return p;
  }
  function circPts(cx, cy, rx, ry = rx, n) {
    n = n || Math.max(16, Math.round((rx + ry) * 0.5));
    return Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2; const w = 1 + jit(0.018); return [cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]; });
  }

  // a sheet of paper: one cut shape in one colour, inside a depth group
  const sheet = (g, pts, fill, extra) => el("path", Object.assign({ d: cut(pts, extra && extra.j != null ? extra.j : 0.9), fill }, extra && extra.attrs), g);
  function layer(parent, depth, cls) { const g = el("g", { class: "cut " + (cls || "") }, parent); g.style.setProperty("--sh", depth); return g; }
  function text(g, x, y, s, size, attrs) { const t = el("text", Object.assign({ x, y, "font-size": size }, attrs), g); t.textContent = s; return t; }

  // ---------- the scene ----------
  function build(svg) {
    R = mulberry32(1965);
    const root = el("g", { id: "scene" }, svg);
    // depth planes: each moves at its own rate when you look around (k = how far it travels)
    const plane = (name, k) => { const g = el("g", { class: "plane p-" + name }, root); g.dataset.k = k; return g; };
    const P = { wall: plane("wall", 0.12), window: plane("window", 0.3), wallObj: plane("wallobj", 0.38), desk: plane("desk", 0.55), back: plane("back", 0.72), front: plane("front", 1), tag: plane("tag", 1.25) };

    // the wall
    const wall = layer(P.wall, 0, "wall");
    el("rect", { x: -40, y: -40, width: W + 80, height: H + 80, class: "c-wall" }, wall);
    for (let k = 0; k < 7; k++) sheet(wall, rectPts(-20 + k * 240, -20, 236, 620), k % 2 ? "var(--wall-2)" : "var(--wall)", { j: 0.5 }); // wallpaper panels

    // the window onto Magdeburg
    const win = layer(P.window, 3, "window");
    sheet(win, rectPts(560, 60, 480, 380), "var(--frame)", { j: 0.6 });
    const sky = el("g", { "clip-path": "url(#paneClip)" }, win);
    el("rect", { x: 580, y: 80, width: 440, height: 340, fill: "url(#skyGrad)" }, sky);
    for (let k = 0; k < 26; k++) el("circle", { cx: 590 + R() * 420, cy: 90 + R() * 170, r: 0.8 + R() * 1.6, class: "star" + (k % 3 ? "" : " tw") }, sky);
    sheet(sky, circPts(930, 150, 30), "var(--moon)", { attrs: { class: "moon" } });
    const sun = el("g", { class: "sun" }, sky); sheet(sun, circPts(700, 150, 34), "var(--sun)"); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; sheet(sun, [[700 + Math.cos(a) * 40, 150 + Math.sin(a) * 40], [700 + Math.cos(a + 0.12) * 54, 150 + Math.sin(a + 0.12) * 54], [700 + Math.cos(a + 0.24) * 40, 150 + Math.sin(a + 0.24) * 40]], "var(--sun-ray)", { j: 0.3 }); }
    const skyline = (base, hMax, fill, seed) => { // a row of cut rooftops
      const pts = [[570, 440]]; let x = 570; R = mulberry32(seed);
      while (x < 1030) { const w = 18 + R() * 34, h = 20 + R() * hMax; pts.push([x, base - h], [x + w, base - h]); x += w; }
      pts.push([1030, 440]);
      sheet(sky, pts, fill, { j: 0.4 });
    };
    skyline(400, 60, "var(--city-far)", 7);
    // the cathedral: two towers with spires
    const cat = (cx) => { sheet(sky, [[cx - 14, 420], [cx - 14, 300], [cx, 244], [cx + 14, 300], [cx + 14, 420]], "var(--city-near)", { j: 0.4 }); el("rect", { x: cx - 3, y: 320, width: 6, height: 12, class: "lit" }, sky); };
    cat(730); cat(770);
    sheet(sky, rectPts(700, 350, 100, 70), "var(--city-near)", { j: 0.4 });
    skyline(420, 30, "var(--city-near)", 11);
    for (let k = 0; k < 18; k++) el("rect", { x: 590 + R() * 420, y: 386 + R() * 26, width: 3, height: 4, class: "lit" }, sky);
    // mullions and sill
    sheet(win, rectPts(796, 70, 8, 360), "var(--frame)", { j: 0.3 });
    sheet(win, rectPts(570, 246, 460, 8), "var(--frame)", { j: 0.3 });
    const sill = layer(P.window, 4); sheet(sill, rectPts(540, 432, 520, 20), "var(--frame-2)", { j: 0.5 });

    // the map: PitchRadar, events pinned across a city
    const map = layer(P.wallObj, 4, "obj"); map.dataset.item = "radar";
    sheet(map, [[1150, 120], [1460, 106], [1470, 330], [1158, 342]], "var(--map)");
    el("path", { d: "M1160 240 C1230 220 1270 290 1340 260 S1430 222 1466 240", class: "river" }, map);
    ["M1190 128 L1222 334", "M1290 112 L1316 338", "M1152 184 L1466 168", "M1156 300 L1468 288"].forEach((d) => el("path", { d, class: "road" }, map));
    [[1210, 170], [1330, 200], [1410, 150], [1260, 290]].forEach(([x, y], k) => {
      const pin = layer(map, 2); sheet(pin, circPts(x, y, 9), k === 1 ? "var(--pin-y)" : "var(--pin-r)"); el("path", { d: `M${x} ${y + 8} L${x} ${y + 20}`, class: "pin-leg" }, pin);
    });

    // the desk
    const desk = layer(P.desk, 7, "desk");
    sheet(desk, [[40, 590], [1560, 590], [1600, 940], [0, 940]], "var(--desk)", { j: 0.7 });
    for (let k = 0; k < 4; k++) el("path", { d: `M40 ${640 + k * 70} C500 ${620 + k * 74} 1000 ${690 + k * 60} 1560 ${650 + k * 72}`, class: "grain-line" }, desk);
    const lip = layer(P.front, 9, "desk-lip"); sheet(lip, [[0, 930], [1600, 930], [1600, 1010], [0, 1010]], "var(--desk-edge)", { j: 0.6 });

    // ---- back row, standing on the desk (base y 712): Forge · the Lab on my laptop · FarmQuick · the lamp · the bin ----
    const dome = layer(P.back, 9, "obj"); dome.dataset.item = "forge";
    sheet(dome, [[170, 712], [350, 712], [342, 736], [178, 736]], "var(--wood-dark)");
    sheet(dome, rectPts(216, 600, 88, 112), "var(--sheet)", { j: 0.5 });
    for (let k = 0; k < 6; k++) el("rect", { x: 228, y: 620 + k * 14, width: 64 - (k % 2) * 14, height: 3, class: "ink-line" }, dome);
    el("path", { d: "M186 712 L186 610 Q186 536 260 536 Q334 536 334 610 L334 712 Z", class: "glass" }, dome);
    el("path", { d: "M206 690 L206 616 Q206 566 250 554", class: "glass-shine" }, dome);

    const lap = layer(P.back, 9, "obj"); lap.dataset.item = "lab";
    sheet(lap, [[560, 700], [880, 700], [908, 730], [532, 730]], "var(--lap-base)");
    sheet(lap, rectPts(580, 486, 280, 214), "var(--lap-bezel)", { j: 0.5 });
    sheet(lap, rectPts(594, 500, 252, 184), "var(--screen)", { j: 0.4 });
    el("rect", { x: 594, y: 500, width: 252, height: 18, class: "ui-bar" }, lap);
    // on screen: an agent workflow, with the human gate in yellow
    const nodes = [[630, 590], [690, 560], [690, 620], [760, 590], [818, 590]];
    el("path", { d: "M630 590 L690 560 L760 590 L818 590 M630 590 L690 620 L760 590", class: "flow" }, lap);
    nodes.forEach(([x, y], k) => el("circle", { cx: x, cy: y, r: k === 3 ? 13 : 9, class: k === 3 ? "flow-gate" : "flow-node" }, lap));
    el("rect", { x: 612, y: 650, width: 120, height: 6, rx: 3, class: "ui-line" }, lap);

    const crate = layer(P.back, 9, "obj"); crate.dataset.item = "farm";
    [[1006, 606, 20], [1038, 594, 22], [1078, 604, 20], [1120, 592, 22], [1160, 606, 20], [1192, 596, 18]].forEach(([x, y, r], k) => sheet(crate, circPts(x, y, r), k % 2 ? "var(--tomato)" : "var(--greens)"));
    sheet(crate, rectPts(980, 612, 236, 100), "var(--crate)");
    for (let k = 0; k < 3; k++) el("rect", { x: 980, y: 636 + k * 26, width: 236, height: 4, class: "slat" }, crate);
    text(crate, 1098, 694, "FRESH · B2B", 15, { class: "stencil", "text-anchor": "middle" });

    const lamp = layer(P.back, 9, "lamp obj"); lamp.dataset.item = "lamp";
    el("rect", { x: 1226, y: 462, width: 170, height: 262, class: "hit" }, lamp);
    sheet(lamp, circPts(1330, 712, 34, 9), "var(--lamp-arm)");
    el("path", { d: "M1330 706 L1364 560 L1298 500", class: "lamp-arm" }, lamp);
    sheet(lamp, circPts(1364, 560, 10), "var(--lamp-joint)");
    sheet(lamp, [[1242, 482], [1324, 470], [1310, 528], [1232, 522]], "var(--lamp-shade)", { j: 0.6 });
    const glow = el("path", { d: "M1242 524 L1310 530 L1290 720 L880 720 Z", class: "lamp-light" }, P.back);

    const bin = layer(P.back, 9, "obj"); bin.dataset.item = "bin";
    sheet(bin, [[1432, 610], [1530, 610], [1518, 712], [1444, 712]], "var(--bin)");
    for (let k = 0; k < 6; k++) el("path", { d: `M${1442 + k * 15} 616 L${1452 + k * 12} 708`, class: "mesh" }, bin);
    sheet(bin, circPts(1462, 604, 22, 18), "var(--sheet)"); sheet(bin, circPts(1498, 598, 18, 16), "var(--sheet-2)");

    // ---- front row, lying on the desk: UnboundPDF · Conxto · Conxfolio · Trading ----
    const pdf = layer(P.front, 11, "obj"); pdf.dataset.item = "pdf";
    [0, 1, 2, 3].forEach((k) => sheet(pdf, rectPts(172 + k * 6, 804 - k * 8, 160, 92), "var(--sheet)", { j: 0.5 }));
    sheet(pdf, rectPts(190, 780, 160, 26), "var(--pdf-red)", { j: 0.4 });
    text(pdf, 270, 799, "PDF", 17, { class: "on-red", "text-anchor": "middle" });
    for (let k = 0; k < 3; k++) el("rect", { x: 206, y: 820 + k * 14, width: 110 - (k % 2) * 30, height: 3, class: "ink-line" }, pdf);

    const res = layer(P.front, 11, "obj"); res.dataset.item = "conxto";
    sheet(res, [[540, 784], [692, 776], [700, 888], [548, 896]], "var(--sheet)");
    for (let k = 0; k < 6; k++) el("rect", { x: 560, y: 802 + k * 14, width: 118 - (k === 2 ? 46 : 0), height: 3, class: k === 2 ? "hi-line" : "ink-line", transform: "rotate(-3 620 832)" }, res);
    const pen = layer(res, 3); sheet(pen, [[582, 884], [710, 816], [718, 826], [590, 894]], "var(--pen)", { j: 0.4 }); sheet(pen, [[698, 822], [716, 812], [724, 826], [706, 836]], "var(--pen-cap)", { j: 0.3 });

    const env = layer(P.front, 11, "obj"); env.dataset.item = "folio";
    sheet(env, rectPts(908, 782, 156, 40), "var(--sheet)", { j: 0.4 });
    sheet(env, rectPts(892, 804, 188, 92), "var(--kraft)");
    sheet(env, [[892, 804], [986, 854], [1080, 804]], "var(--kraft-2)", { j: 0.5 });

    const graph = layer(P.front, 11, "obj"); graph.dataset.item = "trading";
    sheet(graph, [[1254, 784], [1426, 792], [1420, 896], [1248, 888]], "var(--graph)");
    for (let k = 0; k < 8; k++) el("path", { d: `M${1266 + k * 20} 792 L${1262 + k * 20} 890`, class: "grid" }, graph);
    for (let k = 0; k < 5; k++) el("path", { d: `M1254 ${802 + k * 20} L1424 ${810 + k * 20}`, class: "grid" }, graph);
    el("path", { d: "M1266 872 L1296 858 L1320 864 L1348 832 L1374 840 L1404 808", class: "chart" }, graph);

    // one of my agents, at work beside the laptop
    const rw = el("g", { class: "robot-walk", id: "robot" }, P.back); const r = layer(rw, 12, "robot obj"); r.dataset.item = "robot"; r.setAttribute("transform", "translate(470 704) scale(0.85)");
    el("rect", { x: -34, y: -70, width: 72, height: 124, class: "hit" }, r); // an easy target, gaps and all
    el("path", { d: "M0 -58 L0 -44", class: "antenna" }, r); sheet(r, circPts(0, -62, 6), "var(--pin-y)");
    sheet(r, roundPts(-24, -44, 48, 34, 6), "var(--robot-head)", { j: 0.4 });
    el("circle", { cx: -9, cy: -28, r: 4.5, class: "eye" }, r); el("circle", { cx: 9, cy: -28, r: 4.5, class: "eye" }, r);
    sheet(r, roundPts(-28, -8, 56, 44, 8), "var(--robot-body)", { j: 0.4 });
    sheet(r, rectPts(-18, 36, 10, 16), "var(--robot-body)", { j: 0.3, attrs: { class: "leg l" } }); sheet(r, rectPts(8, 36, 10, 16), "var(--robot-body)", { j: 0.3, attrs: { class: "leg r" } });
    sheet(r, rectPts(22, -2, 40, 30), "var(--sheet)", { j: 0.4, attrs: { class: "carried" } });

    // name strips: just the name, on a small paper strip; the line comes on hover
    const label = (id, x, y, rot = 0) => {
      const it = D.items[id], c = layer(id === "radar" ? P.wallObj : ["forge", "lab", "farm", "bin"].includes(id) ? P.back : P.front, 14, "label"); c.dataset.item = id; c.dataset.line = it.line;
      c.setAttribute("transform", `rotate(${rot} ${x} ${y})`);
      const w = it.name.length * 9.6 + 34;
      sheet(c, rectPts(x - w / 2, y, w, 30), "var(--card)", { j: 0.35 });
      text(c, x, y + 21, it.name, 16, { class: "card-name", "text-anchor": "middle" });
      if (it.status && it.status !== "live") el("circle", { cx: x + w / 2 - 10, cy: y + 10, r: 3.6, class: "dot-" + it.status }, c);
    };
    label("radar", 1310, 336, 1);
    label("forge", 260, 744, -1.2); label("lab", 720, 744, 0.8); label("farm", 1098, 724, 1); label("bin", 1481, 724, -1);
    label("pdf", 262, 910, -1); label("conxto", 620, 912, 1.2); label("folio", 986, 910, -0.8); label("trading", 1338, 910, 1);

    // the name tag, hanging on a string like a museum plate; it also says how to reach me
    const tag = layer(P.tag, 16, "nametag obj"); tag.dataset.item = "me";
    el("path", { d: "M250 -10 L250 58", class: "thread" }, tag);
    sheet(tag, [[70, 70], [400, 58], [420, 90], [430, 300], [90, 318], [72, 290]], "var(--tag)", { j: 0.5 });
    el("circle", { cx: 250, cy: 76, r: 9, class: "tag-hole" }, tag);
    text(tag, 250, 116, "PORTFOLIO · MAGDEBURG", 13, { class: "tag-kicker", "text-anchor": "middle" });
    text(tag, 250, 162, "Vamsi", 44, { class: "tag-name", "text-anchor": "middle" });
    text(tag, 250, 206, "Venkatesh", 44, { class: "tag-name alt", "text-anchor": "middle" });
    text(tag, 250, 236, D.person.role, 14, { class: "tag-line", "text-anchor": "middle" });
    text(tag, 250, 258, D.person.line, 14, { class: "tag-line it", "text-anchor": "middle" });
    const mail = el("a", { href: "mailto:" + D.person.email, class: "tag-mail" }, tag);
    text(mail, 250, 290, D.person.email, 15, { class: "tag-link", "text-anchor": "middle" });
    tag.setAttribute("transform", "rotate(-2.5 250 60)");
    P.back.appendChild(glow); // the lamp's light falls over everything on the desk behind it
  }

  // paper grain: a small canvas of noise, tiled over the whole diorama
  function grain() {
    const c = document.createElement("canvas"); c.width = c.height = 160;
    const x = c.getContext("2d"), img = x.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) { const v = 200 + Math.random() * 55; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 26; }
    x.putImageData(img, 0, 0);
    document.getElementById("grain").style.backgroundImage = `url(${c.toDataURL()})`;
  }

  build(document.getElementById("desk"));
  document.querySelectorAll("#desk .obj").forEach((g) => {
    const id = g.dataset.item, it = D.items[id];
    g.setAttribute("tabindex", "0"); g.setAttribute("role", "button");
    g.setAttribute("aria-label", it ? `${it.name}: ${it.line}. Open.` : id === "me" ? "About me" : id === "lamp" ? "Switch the lamp: day or night" : "One of my agents");
  });
  grain();
})();
