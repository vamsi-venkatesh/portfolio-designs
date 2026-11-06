/* ==========================================================================
   29 · PAPER TOWN — the kit both views share.

   Two rules, the same two the whole Conxfolio library keeps:
     1. NOTHING IS INVENTED. Every word printed about the person is a value out
        of window.PORTFOLIO_DATA (the shared résumé adapter's contract) or fixed
        design chrome — a section name, the word "Contact", a numeral.
     2. EMPTY PRINTS NOTHING. A missing field removes its value and its label;
        an empty section removes its building, its desk object, its card and
        its entry in every nav.

   This file holds: the record (read once from PORTFOLIO_DATA), the paper craft
   (hand-cut edges, depth layers), the eight building styles a project can be
   drawn as, the project plate, and the paper card that opens in place.
   ========================================================================== */
(() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- record */
  const DATA = (window.PORTFOLIO_DATA && typeof window.PORTFOLIO_DATA === "object") ? window.PORTFOLIO_DATA : {};
  const isSpecimen = window.__CONXFOLIO_GALLERY__ !== false;
  const list = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);
  const str = (...v) => { const x = v.find((y) => typeof y === "string" && y.trim()); return x ? x.trim() : ""; };
  const dedupe = (values) => { const seen = new Set(); return values.filter((v) => { const k = String(v).trim().toLowerCase(); if (!k || seen.has(k)) return false; seen.add(k); return true; }); };
  const safeUrl = (value) => {
    const raw = str(value); if (!raw) return "";
    try { const u = new URL(raw, location.href); return ["http:", "https:"].includes(u.protocol) ? u.href : ""; } catch (e) { return ""; }
  };
  const safeImage = (value) => {
    const raw = str(value); if (!raw) return "";
    if (/^data:image\//i.test(raw)) return raw;
    try { const u = new URL(raw, location.href); return ["http:", "https:", "blob:"].includes(u.protocol) ? u.href : ""; } catch (e) { return ""; }
  };
  const dateRange = (item = {}) => {
    const direct = str(item.dates, item.period, item.date); if (direct) return direct;
    const a = str(item.from, item.start, item.startDate), b = str(item.to, item.end, item.endDate);
    if (a && b) return `${a} — ${b}`; if (a) return `${a} — Present`; return b;
  };
  const included = (item) => !item || item.include !== false;
  const realTitle = (v) => (/^project \d+$/i.test(String(v || "").trim()) ? "" : str(v));
  const realGroup = (v) => { const x = str(v); return /^(capabilities|capability \d+)$/i.test(x) ? "" : x; };

  const profile = (DATA.profile && typeof DATA.profile === "object") ? DATA.profile : {};
  const R0 = {
    name: str(profile.name, DATA.name),
    headline: str(profile.headline, profile.headlineIsRole ? profile.role : "", profile.role, profile.title),
    location: str(profile.location),
    about: str(profile.about, profile.summary, DATA.about, DATA.summary),
    availability: str(profile.availability, profile.status),
    email: str(profile.email),
    phone: str(profile.phone),
  };
  R0.links = list(profile.links).map((l) => ({ label: str(l.label, l.network, l.name), href: safeUrl(str(l.href, l.url)) })).filter((l) => l.label && l.href);
  R0.roles = list(DATA.experience).filter(included).map((r) => ({
    title: str(r.role, r.position, r.title), company: str(r.company, r.organisation, r.organization),
    when: dateRange(r), where: str(r.location), summary: str(r.summary, r.description, r.scope),
    notes: dedupe(list(r.highlights).map((n) => str(n)).filter(Boolean)),
  })).filter((r) => r.title || r.company);
  R0.projects = list(DATA.projects).filter(included).map((p) => ({
    title: realTitle(str(p.title, p.name)), role: str(p.role), year: str(p.year, p.period),
    outcome: str(p.outcome, list(p.outcomes)[0]), summary: str(p.summary, p.description, p.tagline),
    tags: dedupe(list(p.tags || p.skills).map((t) => str(t)).filter(Boolean)).slice(0, 8),
    url: safeUrl(str(p.url, p.link, list(p.links)[0] && (list(p.links)[0].url || list(p.links)[0].href))),
    image: safeImage(str(p.image, p.imageUrl, p.cover, p.thumbnail)),
  })).filter((p) => p.title || p.outcome || p.summary).map((p, i) => Object.assign(p, { idx: i }));
  R0.skills = list(DATA.skills).map((s) => ({ group: realGroup(str(s.group, s.title, s.name)), items: dedupe(list(s.items).map((x) => str(x)).filter(Boolean)) })).filter((s) => s.items.length || s.group);
  R0.education = list(DATA.education).map((e) => ({ degree: str(e.degree, e.qualification, e.title), school: str(e.school, e.institution), when: str(e.period, dateRange(e)), detail: str(e.detail, e.note) })).filter((e) => e.degree || e.school);
  R0.languages = dedupe(list(DATA.languages).map((l) => typeof l === "string" ? str(l) : [str(l.language, l.name), str(l.fluency, l.level)].filter(Boolean).join(" — ")).filter(Boolean));
  R0.hasContact = Boolean(R0.email || R0.phone || R0.links.length);
  R0.hasAbout = Boolean(R0.about || R0.location || R0.availability);
  R0.isSpecimen = isSpecimen;
  R0.initials = (s) => { const w = String(s || "").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean); return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || "").slice(0, 2)).toUpperCase(); };
  R0.projectLabel = (p) => p.title || p.outcome || p.summary;
  R0.projectLine = (p) => [p.year, p.role].filter(Boolean).join(" · ");

  /* ------------------------------------------------------------ paper craft */
  function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  let R = mulberry32(7);
  const rnd = () => R();
  const jit = (j) => (R() - 0.5) * 2 * j;
  const seed = (s) => { R = mulberry32(s); };
  function svgEl(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  // a hand-cut edge: every side walked in short steps, each step off by a hair
  function cut(pts, j = 0.9, step = 11) {
    let d = "";
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      const len = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(len / step));
      const nx = -(by - ay) / (len || 1), ny = (bx - ax) / (len || 1);
      for (let k = 0; k < n; k++) {
        const t = k / n, o = k === 0 ? 0 : jit(j);
        d += (d ? "L" : "M") + (ax + (bx - ax) * t + nx * o).toFixed(1) + " " + (ay + (by - ay) * t + ny * o).toFixed(1);
      }
    }
    return d + "Z";
  }
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  function round(x, y, w, h, r) {
    const p = [];
    [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]].forEach(([cx, cy, a0]) => {
      for (let k = 0; k <= 5; k++) { const a = (a0 + k * 18) * Math.PI / 180; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    });
    return p;
  }
  function circle(cx, cy, rx, ry = rx, n) {
    n = n || Math.max(14, Math.round((rx + ry) * 0.55));
    return Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2, w = 1 + jit(0.02); return [cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]; });
  }
  function hill(x0, x1, y, amp, waves, bottom = 1040) {
    const p = [[x0, bottom]];
    for (let x = x0; x <= x1; x += 24) p.push([x, y + Math.sin((x / Math.max(1, x1 - x0)) * Math.PI * waves + waves) * amp + jit(3)]);
    p.push([x1, bottom]);
    return p;
  }
  const sheet = (g, pts, fill, o = {}) => svgEl("path", Object.assign({ d: cut(pts, o.j != null ? o.j : 0.9), fill }, o.attrs), g);
  function layer(parent, depth, cls) { const g = svgEl("g", { class: "cut" + (cls ? " " + cls : "") }, parent); g.style.setProperty("--sh", depth); return g; }
  function cloud(parent, s = 1, fill = "#fffaf0") {
    const g = layer(parent, 4), c = svgEl("g", {}, g);
    [[0, 0, 44], [40, -18, 52], [88, 0, 40], [44, 12, 46]].forEach(([dx, dy, r]) => sheet(c, circle(dx * s, dy * s, r * s, r * s * 0.8), fill, { j: 0.5 }));
    sheet(c, rect(-40 * s, 0, 170 * s, 30 * s), fill, { j: 0.4 });
    return g;
  }
  function tree(parent, x, y, s = 1, tone = 0) {
    const g = layer(parent, 5);
    sheet(g, rect(x - 5 * s, y - 40 * s, 10 * s, 42 * s), "#6b4526", { j: 0.2 });
    const greens = [["#5f8d4e", "#77a55e"], ["#4f7a52", "#6a9a62"], ["#7a8f4a", "#98ad5c"]][tone % 3];
    sheet(g, circle(x, y - 62 * s, 30 * s, 34 * s), greens[0], { j: 0.5 });
    sheet(g, circle(x - 12 * s, y - 50 * s, 18 * s), greens[1], { j: 0.4 });
    return g;
  }
  function grain(node) {
    if (!node) return;
    try {
      const c = document.createElement("canvas"); c.width = c.height = 160;
      const x = c.getContext("2d"); if (!x) return;
      const img = x.createImageData(160, 160);
      const r = mulberry32(99);
      for (let i = 0; i < img.data.length; i += 4) { const v = 200 + r() * 55; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 24; }
      x.putImageData(img, 0, 0);
      node.style.backgroundImage = `url(${c.toDataURL()})`;
    } catch (e) { /* the grain is decoration */ }
  }
  // text that wraps inside a width, in lines; a word longer than a line is broken
  function wrap(text, maxChars, maxLines) {
    const words = String(text || "").split(/\s+/).filter(Boolean), lines = [];
    let cur = "";
    const push = (w) => { while (w.length > maxChars) { if (cur) { lines.push(cur); cur = ""; } lines.push(w.slice(0, maxChars - 1) + "-"); w = w.slice(maxChars - 1); } return w; };
    words.forEach((w0) => {
      const w = w0.length > maxChars ? push(w0) : w0;
      if (!cur) cur = w; else if ((cur + " " + w).length <= maxChars) cur += " " + w; else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    if (maxLines && lines.length > maxLines) { const kept = lines.slice(0, maxLines); kept[maxLines - 1] = kept[maxLines - 1].replace(/[\s,.;:—-]*$/, "") + "…"; return kept; }
    return lines;
  }

  /* ------------------------------------------------------ building styles
     Every project becomes one of eight buildings, chosen by its place in the
     list (index % 8) — never by its words. Each is drawn around a local origin:
     x = 0 is its middle, y = 0 is the ground, up is negative. `life` collects
     the small motions that keep it working; null draws it still. */
  const beat = (life, f) => { if (life) life.push(f); };
  const STYLES = [
    { name: "harbour", sky: ["#1d2a52", "#4a5f96"], hill: "#3b4d6e", ground: "#55704c" },
    { name: "airfield", sky: ["#8ec7e0", "#d8ecef"], hill: "#b9cfc0", ground: "#8fb07a" },
    { name: "works", sky: ["#bcd9df", "#eef3e6"], hill: "#a9c49a", ground: "#7f9a6a" },
    { name: "square", sky: ["#f2d9b0", "#fbeed6"], hill: "#c9c28e", ground: "#9fae6e" },
    { name: "city", sky: ["#6f8fb8", "#c7d8e6"], hill: "#8aa0a8", ground: "#6f8a70" },
    { name: "workshop", sky: ["#e7d7c2", "#f6ecdc"], hill: "#c4b596", ground: "#96a16c" },
    { name: "hall", sky: ["#b8c3de", "#e8e6f0"], hill: "#8ea486", ground: "#6e8a6a" },
    { name: "farm", sky: ["#f7c98f", "#fbe6c4"], hill: "#cfe0a2", ground: "#8db060" },
  ];
  const B = [];
  // 0 · a lighthouse on a harbour, its beam sweeping, a boat at the pier
  B[0] = (g, life) => {
    const sea = layer(g, 3); sheet(sea, [[-190, -22], [190, -28], [196, 44], [-196, 44]], "#2a3b66", { j: 0.5 });
    for (let k = 0; k < 4; k++) svgEl("path", { d: `M${-160 + k * 90} ${-2 + (k % 2) * 16} q14 -7 28 0 t28 0`, class: "wave" }, sea);
    const beam = svgEl("path", { d: "M-70 -298 L280 -372 L280 -226 Z", class: "beam" }, g);
    const t = layer(g, 6);
    const tw = (y) => 40 - (y / -280) * 14; // tower half-width at height y
    sheet(t, [[-110, -10], [-96, -280], [-44, -280], [-30, -10]], "#f3ead6", { j: 0.4 });
    [-230, -160, -90].forEach((y) => sheet(t, [[-70 - tw(y), y], [-70 + tw(y), y], [-70 + tw(y + 26), y + 26], [-70 - tw(y + 26), y + 26]], "#d8412f", { j: 0.3 }));
    sheet(t, rect(-106, -318, 72, 40), "#2d3038"); sheet(t, rect(-94, -312, 48, 28), "#ffe6a8", { j: 0.2 }); sheet(t, [[-114, -316], [-70, -350], [-26, -316]], "#2d3038", { j: 0.3 });
    const pier = layer(g, 5); sheet(pier, rect(-14, -40, 196, 16), "#6b4526"); for (let k = 0; k < 5; k++) sheet(pier, rect(-4 + k * 44, -24, 10, 60), "#553620", { j: 0.2 });
    const boat = layer(g, 5); sheet(boat, [[40, -42], [140, -42], [122, -18], [58, -18]], "#fbf6ea"); sheet(boat, [[80, -42], [90, -92], [112, -42]], "#f3ead6", { j: 0.3 });
    beat(life, (s) => { beam.setAttribute("transform", `rotate(${(Math.sin(s * 0.5) * 20).toFixed(1)} -70 -298)`); boat.setAttribute("transform", `translate(${(Math.sin(s * 0.3) * 26).toFixed(1)} ${(Math.sin(s * 1.4) * 3).toFixed(1)})`); });
    return { top: -350, half: 190 };
  };
  // 1 · an airfield: a hangar, a windsock, a paper plane going round
  B[1] = (g, life) => {
    const f = layer(g, 5);
    sheet(f, [[-180, -10], [180, -18], [190, 22], [-190, 24]], "#fbf6ea", { j: 0.4 });
    for (let k = 0; k < 5; k++) svgEl("path", { d: `M${-150 + k * 66} ${4 - k * 1.5} l32 -1`, class: "dash" }, f);
    const h = []; for (let k = 0; k <= 12; k++) { const a = Math.PI + (k / 12) * Math.PI; h.push([-60 + Math.cos(a) * 96, -12 + Math.sin(a) * 96]); }
    const hg = layer(g, 6); sheet(hg, h, "#d9d2c3", { j: 0.4 }); sheet(hg, rect(-96, -70, 72, 58), "#8b7d66", { j: 0.3 });
    for (let k = 1; k < 4; k++) svgEl("path", { d: `M${-60 - 96 * Math.cos(k * Math.PI / 4)} ${-12 - 96 * Math.sin(k * Math.PI / 4)} L${-60 - 96 * Math.cos(k * Math.PI / 4) * 0.2} ${-12 - 96 * Math.sin(k * Math.PI / 4) * 0.2}`, class: "rib" }, hg);
    const ws = layer(g, 5); sheet(ws, rect(116, -130, 5, 118), "#6f7682", { j: 0.2 });
    const sock = svgEl("g", {}, ws); sheet(sock, [[120, -128], [170, -122], [170, -106], [120, -102]], "#d8412f", { j: 0.2 }); sheet(sock, rect(138, -125, 10, 20), "#fbf6ea", { j: 0.1 });
    const pl = layer(g, 5); const plane = svgEl("g", {}, pl);
    sheet(plane, [[-30, 6], [30, -10], [-8, 20]], "#fffdf6", { j: 0.2 }); sheet(plane, [[-8, 20], [30, -10], [0, 8]], "#e9dfca", { j: 0.2 });
    plane.setAttribute("transform", "translate(40 -230) rotate(-14)");
    beat(life, (s) => {
      sock.setAttribute("transform", `rotate(${(Math.sin(s * 1.3) * 7).toFixed(1)} 120 -116)`);
      plane.setAttribute("transform", `translate(${(Math.cos(s * 0.8) * 120).toFixed(1)} ${(-228 + Math.sin(s * 0.8) * 34).toFixed(1)}) rotate(${((s * 0.8 * 57.3 + 90) % 360).toFixed(1)})`);
    });
    return { top: -280, half: 190 };
  };
  // 2 · works: saw-tooth roofs, a belt of boxes, a gate lamp, a turning gear
  B[2] = (g, life) => {
    const f = layer(g, 6);
    sheet(f, rect(-165, -250, 330, 250), "#cfd9cf", { j: 0.5 });
    for (let k = 0; k < 4; k++) { const x0 = -165 + k * 82.5; sheet(f, [[x0, -250], [x0 + 40, -300], [x0 + 82.5, -250]], "#8a959a", { j: 0.4 }); }
    sheet(f, rect(-135, -196, 270, 110), "#bfe0ea", { j: 0.3 });
    svgEl("path", { d: "M-125 -104 L125 -104", class: "belt" }, f);
    const boxes = [0, 1, 2].map(() => { const b = svgEl("g", {}, f); sheet(b, rect(-15, -130, 30, 26), "#d3a066", { j: 0.2 }); return b; });
    const lamp = svgEl("circle", { cx: 92, cy: -160, r: 13, class: "gate-lamp" }, f);
    const gear = layer(g, 7); const gg = svgEl("g", {}, gear);
    const pts = []; for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2, r = k % 2 ? 28 : 36; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    sheet(gg, pts, "#c8642d", { j: 0.3 }); sheet(gg, circle(0, 0, 10), "#8b4a22", { j: 0.2 });
    gg.setAttribute("transform", "translate(0 -42)");
    beat(life, (s) => {
      let near = false;
      boxes.forEach((b, k) => { const x = -110 + ((s * 40 + k * 80) % 220); if (Math.abs(x - 92) < 16) near = true; b.setAttribute("transform", `translate(${x.toFixed(1)} 0)`); });
      lamp.classList.toggle("on", near);
      gg.setAttribute("transform", `translate(0 -42) rotate(${((s * 26) % 360).toFixed(1)})`);
    });
    return { top: -300, half: 175 };
  };
  // 3 · a square of timbered houses under a string of flags
  B[3] = (g, life) => {
    const COLS = ["#f2d7a6", "#e7b7a0", "#f4ead2", "#c9d8c0"];
    let x = -160, tallest = 0; const wins = [];
    for (let i = 0; i < 4; i++) {
      const w = 70 + rnd() * 10, h = 140 + rnd() * 60, top = -h, f = layer(g, 6);
      tallest = Math.max(tallest, h + 50);
      sheet(f, rect(x, top, w, h), COLS[i], { j: 0.4 }); sheet(f, [[x - 7, top + 3], [x + w / 2, top - 50], [x + w + 7, top + 3]], i % 2 ? "#a84a32" : "#8b3a2a", { j: 0.4 });
      svgEl("path", { d: `M${x} ${top + h * 0.45} L${x + w} ${top + h * 0.45} M${x + w / 2} ${top} L${x + w / 2} ${-2}`, class: "timber" }, f);
      [0, 1].forEach((c) => wins.push(svgEl("rect", { x: x + 9 + c * (w / 2), y: top + 16, width: w / 2 - 18, height: 24, class: "hwin" }, f)));
      x += w + 4;
    }
    const bunt = svgEl("g", {}, g);
    const line = svgEl("path", { d: "M-160 -190 Q0 -130 160 -196", class: "string" }, bunt);
    const L = line.getTotalLength ? line.getTotalLength() : 330;
    for (let n = 0; n < 11; n++) { let pt; try { pt = line.getPointAtLength((n / 11) * L + 12); } catch (e) { pt = { x: -150 + n * 29, y: -170 }; } sheet(bunt, [[pt.x - 8, pt.y], [pt.x + 8, pt.y], [pt.x, pt.y + 20]], ["#d8412f", "#f0b83c", "#2c55c4", "#2f8f4e"][n % 4], { j: 0.2 }); }
    beat(life, (s) => {
      bunt.setAttribute("transform", `rotate(${(Math.sin(s * 1.1) * 1.2).toFixed(2)} 0 -190)`);
      if (Math.random() < 0.02) wins[Math.floor(Math.random() * wins.length)].classList.toggle("off");
    });
    return { top: -Math.max(250, tallest), half: 175 };
  };
  // 4 · a city of towers, lit windows, loose pages drifting down
  B[4] = (g, life) => {
    const f = layer(g, 6), wins = []; let x = -165;
    while (x < 150) {
      const w = 46 + rnd() * 36, h = 170 + rnd() * 150;
      sheet(f, rect(x, -h, w, h), rnd() > 0.5 ? "#3f5f86" : "#5d7da0", { j: 0.4 });
      for (let r = 0; r < Math.floor(h / 30) - 1; r++) for (let c = 0; c < Math.floor((w - 6) / 18); c++) if (rnd() > 0.35) wins.push(svgEl("rect", { x: x + 6 + c * 18, y: -h + 12 + r * 30, width: 9, height: 13, class: "cwin" }, f));
      x += w + 5;
    }
    const pages = [0, 1, 2, 3].map((k) => { const p = layer(g, 3); sheet(p, rect(-14, -10, 28, 20), "#fbf6ea", { j: 0.2 }); return { p, k }; });
    pages.forEach(({ p, k }) => p.setAttribute("transform", `translate(${-120 + k * 80} ${-300 + k * 60}) rotate(${k * 12 - 18})`));
    beat(life, (s) => {
      pages.forEach(({ p, k }) => { const ph = ((s + k * 1.7) % 7) / 7; p.setAttribute("transform", `translate(${(-120 + k * 80 + Math.sin(s * 1.3 + k) * 20).toFixed(1)} ${(-340 + ph * 320).toFixed(1)}) rotate(${(Math.sin(s * 1.7 + k) * 25).toFixed(1)})`); p.style.opacity = ph > 0.88 ? ((1 - ph) * 8).toFixed(2) : 1; });
      if (Math.random() < 0.05 && wins.length) wins[Math.floor(Math.random() * wins.length)].classList.toggle("off");
    });
    return { top: -330, half: 175 };
  };
  // 5 · a workshop whose front is one big window: pages ride a belt under a press
  B[5] = (g, life) => {
    const f = layer(g, 6);
    sheet(f, round(-150, -290, 300, 290, 12), "#2d3038", { j: 0.4 });
    sheet(f, rect(-138, -256, 276, 244), "#dcecef", { j: 0.3 });
    [-126, -110, -94].forEach((cx, k) => sheet(f, circle(cx, -273, 5), ["#d8412f", "#f0b83c", "#2f8f4e"][k]));
    svgEl("path", { d: "M-126 -60 L126 -60", class: "belt" }, f);
    const pages = [0, 1, 2].map(() => { const p = svgEl("g", {}, f); sheet(p, rect(-17, -110, 34, 46), "#fffdf6", { j: 0.2 }); sheet(p, rect(-17, -110, 34, 9), "#c8642d", { j: 0.1 }); return p; });
    const press = svgEl("g", {}, f); sheet(press, rect(-30, -200, 60, 66), "#9aa0a8", { j: 0.2 }); sheet(press, rect(-6, -244, 12, 46), "#6f7682", { j: 0.1 });
    const box = layer(g, 7); sheet(box, round(-178, -40, 44, 38, 5), "#f0b83c");
    beat(life, (s) => {
      pages.forEach((p, k) => p.setAttribute("transform", `translate(${(-112 + ((s * 34 + k * 76) % 228)).toFixed(1)} 0)`));
      press.setAttribute("transform", `translate(0 ${(Math.max(0, Math.sin(s * 3)) * 22).toFixed(1)})`);
    });
    return { top: -290, half: 180 };
  };
  // 6 · a hall on a hill: arches, a pediment, a flag that takes the wind
  B[6] = (g, life) => {
    const m = []; for (let x = -210; x <= 210; x += 14) m.push([x, -Math.sin(((x + 210) / 420) * Math.PI) * 80]); m.push([210, 40], [-210, 40]);
    sheet(layer(g, 4), m, "#6e8a6a", { j: 0.5 });
    const f = layer(g, 6);
    sheet(f, rect(-120, -226, 240, 150), "#e8dcc2", { j: 0.4 });
    sheet(f, [[-132, -222], [0, -286], [132, -222]], "#5b6478", { j: 0.4 });
    [-90, -30, 30].forEach((wx) => { const a = [[wx, -96]]; for (let k = 0; k <= 8; k++) { const t = Math.PI + (k / 8) * Math.PI; a.push([wx + 30 + Math.cos(t) * 30 - 0, -150 + Math.sin(t) * 22]); } a.push([wx + 60, -96]); sheet(f, a.map(([x, y]) => [x + 0, y]), "#1f2a44", { j: 0.2 }); });
    sheet(f, circle(0, -244, 12), "#fbf6ea");
    sheet(f, rect(-130, -84, 260, 12), "#d6c7a6", { j: 0.3 });
    const pole = layer(g, 5); sheet(pole, rect(-2, -350, 4, 66), "#6b4526", { j: 0.1 });
    const flag = svgEl("path", { d: "M2 -348 L46 -340 L2 -326 Z", class: "flag" }, pole);
    beat(life, (s) => flag.setAttribute("d", `M2 -348 Q24 ${(-346 + Math.sin(s * 4) * 4).toFixed(1)} ${(44 + Math.sin(s * 3) * 3).toFixed(1)} ${(-338 + Math.sin(s * 5) * 3).toFixed(1)} L2 -326 Z`));
    return { top: -350, half: 210 };
  };
  // 7 · a farm at first light: fields, a house, a barn, a windmill turning
  B[7] = (g, life) => {
    const f = layer(g, 6);
    [[-150, -62, 290, 40, "#c9b36a"], [-120, -14, 290, 44, "#7aa45c"]].forEach(([x, y, w, h, c]) => { sheet(f, [[x, y + h], [x + 24, y], [x + w + 24, y], [x + w, y + h]], c, { j: 0.4 }); for (let k = 1; k < 6; k++) svgEl("path", { d: `M${x + (w * k) / 6} ${y + h} L${x + 24 + (w * k) / 6} ${y}`, class: "furrow" }, f); });
    const b = layer(g, 7);
    sheet(b, rect(-130, -150, 100, 86), "#f3e3c3"); sheet(b, [[-142, -146], [-80, -198], [-18, -146]], "#c8642d", { j: 0.4 }); sheet(b, rect(-70, -118, 28, 24), "#ffd57c", { j: 0.2 });
    sheet(b, rect(-10, -140, 96, 76), "#b8452f"); sheet(b, [[-18, -136], [38, -176], [94, -136]], "#8f3424", { j: 0.4 });
    sheet(b, rect(100, -190, 32, 126), "#d9d2c3", { j: 0.3 }); sheet(b, circle(116, -190, 16, 10), "#b9b2a3");
    const mill = layer(g, 5); sheet(mill, [[-196, -64], [-184, -214], [-172, -214], [-160, -64]], "#efe3c8", { j: 0.3 });
    const blades = svgEl("g", {}, mill);
    for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2, c = Math.cos(a), s2 = Math.sin(a); sheet(blades, [[c * 6 - s2 * 6, s2 * 6 + c * 6], [c * 62 - s2 * 9, s2 * 62 + c * 9], [c * 62 + s2 * 9, s2 * 62 - c * 9], [c * 6 + s2 * 6, s2 * 6 - c * 6]], "#fbf6ea", { j: 0.2 }); }
    sheet(blades, circle(0, 0, 6), "#6b4526");
    blades.setAttribute("transform", "translate(-178 -216)");
    beat(life, (s) => blades.setAttribute("transform", `translate(-178 -216) rotate(${((s * 30) % 360).toFixed(1)})`));
    return { top: -280, half: 215 };
  };
  function building(parent, idx, life) {
    const style = ((idx % B.length) + B.length) % B.length;
    seed(1000 + idx * 17);
    const g = svgEl("g", { class: "bld bld-" + STYLES[style].name }, parent);
    const box = B[style](g, life);
    return Object.assign({ g, style }, box);
  }

  /* ---------------------------------------------------- the project plate
     A project's own picture if it has one; otherwise its building, close up,
     in its own light, with the initials of its title cut into the sun. */
  let plateN = 0;
  function plate(p, life) {
    const style = STYLES[p.idx % STYLES.length], id = "pl" + (++plateN);
    const svg = svgEl("svg", { viewBox: "0 0 640 440", role: "img", "aria-label": (p.title || "Project") + " — illustration", preserveAspectRatio: "xMidYMid slice" });
    const defs = svgEl("defs", {}, svg), gr = svgEl("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    svgEl("stop", { offset: 0, "stop-color": style.sky[0] }, gr); svgEl("stop", { offset: 1, "stop-color": style.sky[1] }, gr);
    svgEl("rect", { x: -10, y: -10, width: 660, height: 460, fill: `url(#${id})` }, svg);
    seed(500 + p.idx * 31);
    const sky = svgEl("g", {}, svg);
    const disc = layer(sky, 4); sheet(disc, circle(528, 104, 62), "#fbf6ea", { j: 0.5 });
    const ini = svgEl("text", { x: 528, y: 124, "text-anchor": "middle", class: "plate-ini" }, disc); ini.textContent = R0.initials(p.title) || String(p.idx + 1);
    const cl = cloud(sky, 0.7); cl.setAttribute("transform", "translate(90 90)");
    sheet(layer(svg, 3), hill(-20, 660, 290, 18, 2.2, 460), style.hill, { j: 0.5 });
    sheet(layer(svg, 4), hill(-20, 660, 360, 8, 3, 460), style.ground, { j: 0.5 });
    svgEl("path", { d: "M-20 410 C160 396 320 418 660 402", class: "road" }, svg);
    const host = svgEl("g", { transform: "translate(318 372) scale(.92)" }, svg);
    building(host, p.idx, life);
    if (life) { let x = 90; beat(life, (s, dt) => { x += dt * 10; if (x > 700) x = -140; cl.setAttribute("transform", `translate(${x.toFixed(1)} 90)`); }); }
    return svg;
  }
  function visual(p, life) {
    const fig = el("figure", "c-plate");
    if (p.image) { const img = el("img"); img.src = p.image; img.alt = p.title ? p.title : ""; img.loading = "lazy"; img.decoding = "async"; img.addEventListener("error", () => { img.replaceWith(plate(p, life)); }, { once: true }); fig.appendChild(img); }
    else fig.appendChild(plate(p, life));
    return fig;
  }

  /* ---------------------------------------------------------- paper cards */
  const para = (text) => String(text).split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean).map((t) => el("p", null, t));
  const ul = (items, cls) => { const u = el("ul", cls); items.forEach((t) => u.appendChild(el("li", null, t))); return u; };
  function head(kicker, title, line) {
    const h = el("header", "c-head");
    if (kicker) h.appendChild(el("p", "c-kicker", kicker));
    const h2 = el("h2", null, title); h2.id = "c-title"; h.appendChild(h2);
    if (line) h.appendChild(el("p", "c-line", line));
    return h;
  }
  function contactLinks(primaryFirst = true) {
    const links = el("p", "c-links");
    if (R0.email) { const a = el("a", primaryFirst ? "primary" : "", R0.email); a.href = "mailto:" + R0.email; links.appendChild(a); }
    if (R0.phone) { const a = el("a", "", R0.phone); a.href = "tel:" + R0.phone.replace(/[^\d+]/g, ""); links.appendChild(a); }
    R0.links.forEach((l) => { const a = el("a", "", l.label + " ↗"); a.href = l.href; a.target = "_blank"; a.rel = "noopener"; links.appendChild(a); });
    return links.childNodes.length ? links : null;
  }
  function roleBlock(r) {
    const d = el("div", "c-role");
    if (r.when) d.appendChild(el("p", "when", r.when));
    d.appendChild(el("h4", null, r.title || r.company));
    const at = [r.title ? r.company : "", r.where].filter(Boolean).join(" · ");
    if (at) d.appendChild(el("p", "at", at));
    if (r.summary) d.appendChild(el("p", null, r.summary));
    if (r.notes.length) d.appendChild(ul(r.notes));
    return d;
  }
  const CARDS = {
    project(i, life) {
      const p = R0.projects[i]; if (!p) return null;
      const f = document.createDocumentFragment();
      const title = p.title || p.outcome || p.summary;
      f.appendChild(head(R0.projectLine(p), title, ""));
      const grid = el("div", "c-grid"), left = el("div"), right = el("div");
      left.appendChild(visual(p, life));
      if (p.outcome && p.title) { right.appendChild(el("h3", null, "Outcome")); right.appendChild(el("p", "c-outcome", p.outcome)); }
      if (p.summary && p.summary !== title) { right.appendChild(el("h3", null, "The work")); para(p.summary).forEach((n) => right.appendChild(n)); }
      if (p.tags.length) { right.appendChild(el("h3", null, "Tools & methods")); right.appendChild(ul(p.tags, "chips")); }
      if (p.url) { const l = el("p", "c-links"), a = el("a", "primary", "Open the project ↗"); a.href = p.url; a.target = "_blank"; a.rel = "noopener"; l.appendChild(a); right.appendChild(l); }
      grid.append(left, right); f.appendChild(grid);
      return f;
    },
    about() {
      if (!R0.hasAbout && !R0.name) return null;
      const f = document.createDocumentFragment();
      f.appendChild(head("About", R0.name || "About", R0.headline));
      const grid = el("div", "c-grid" + (R0.about ? "" : " one"));
      if (R0.about) { const a = el("div"); para(R0.about).forEach((n) => a.appendChild(n)); grid.appendChild(a); }
      const facts = [["Based in", R0.location], ["Availability", R0.availability]].filter(([, v]) => v);
      if (facts.length) { const s = el("div"), dl = el("dl", "facts"); facts.forEach(([k, v]) => dl.append(el("dt", null, k), el("dd", null, v))); s.appendChild(dl); grid.appendChild(s); }
      if (grid.childNodes.length) f.appendChild(grid);
      const c = contactLinks(); if (c) f.appendChild(c);
      return f;
    },
    experience() {
      if (!R0.roles.length) return null;
      const f = document.createDocumentFragment();
      f.appendChild(head("The record", "Experience", ""));
      const g = el("div"); R0.roles.forEach((r) => g.appendChild(roleBlock(r))); f.appendChild(g);
      return f;
    },
    skills() {
      if (!R0.skills.length) return null;
      const f = document.createDocumentFragment();
      f.appendChild(head("Pinned to the board", "Skills", ""));
      const g = el("div", "c-grid " + (R0.skills.length > 1 ? "two" : "one"));
      R0.skills.forEach((s) => { const d = el("section"); if (s.group) d.appendChild(el("h3", null, s.group)); if (s.items.length) d.appendChild(ul(s.items, "chips")); g.appendChild(d); });
      f.appendChild(g);
      return f;
    },
    education() {
      if (!R0.education.length) return null;
      const f = document.createDocumentFragment();
      f.appendChild(head("On the wall", "Education", ""));
      const g = el("div");
      R0.education.forEach((e) => { const d = el("div", "c-role"); if (e.when) d.appendChild(el("p", "when", e.when)); d.appendChild(el("h4", null, e.degree || e.school)); if (e.degree && e.school) d.appendChild(el("p", "at", e.school)); if (e.detail) d.appendChild(el("p", null, e.detail)); g.appendChild(d); });
      f.appendChild(g);
      return f;
    },
    languages() {
      if (!R0.languages.length) return null;
      const f = document.createDocumentFragment();
      f.appendChild(head("On the shelf", "Languages", ""));
      f.appendChild(ul(R0.languages, "chips"));
      return f;
    },
    contact() {
      if (!R0.hasContact) return null;
      const f = document.createDocumentFragment();
      f.appendChild(head("Write", "Contact", R0.availability));
      const facts = [["Email", R0.email], ["Phone", R0.phone], ["Based in", R0.location]].filter(([, v]) => v);
      if (facts.length) { const dl = el("dl", "facts"); facts.forEach(([k, v]) => dl.append(el("dt", null, k), el("dd", null, v))); f.appendChild(dl); }
      const c = contactLinks(); if (c) f.appendChild(c);
      return f;
    },
  };
  const has = (kind, i) => {
    if (kind === "project") return Boolean(R0.projects[i]);
    if (kind === "about") return R0.hasAbout;
    if (kind === "experience") return R0.roles.length > 0;
    if (kind === "skills") return R0.skills.length > 0;
    if (kind === "education") return R0.education.length > 0;
    if (kind === "languages") return R0.languages.length > 0;
    if (kind === "contact") return R0.hasContact;
    return false;
  };

  // the overlay: one paper card at a time, opened in place, closed with ×, Escape or the backdrop
  let cardWrap, body, openKind = null, lastFocus = null, life = [], raf = 0;
  function ensure() {
    if (cardWrap) return;
    cardWrap = el("div", "card-wrap"); cardWrap.id = "card"; cardWrap.hidden = true;
    cardWrap.setAttribute("role", "dialog"); cardWrap.setAttribute("aria-modal", "true"); cardWrap.setAttribute("aria-labelledby", "c-title");
    const back = el("div", "card-back"); back.dataset.close = "";
    const art = el("article", "paper-card");
    const x = el("button", "c-x", "×"); x.type = "button"; x.dataset.close = ""; x.setAttribute("aria-label", "Close");
    body = el("div", "c-body"); art.append(x, body); cardWrap.append(back, art);
    document.body.appendChild(cardWrap);
    cardWrap.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
    addEventListener("keydown", (e) => {
      if (!openKind) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      if (e.key === "Tab") { // keep focus inside the card
        const f = [...cardWrap.querySelectorAll("button, a[href]")].filter((n) => n.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  function open(kind, i) {
    if (!has(kind, i)) return false;
    ensure();
    lastFocus = document.activeElement;
    life = [];
    const frag = CARDS[kind](i, REDUCED ? null : life);
    if (!frag) return false;
    openKind = kind;
    body.replaceChildren(frag);
    cardWrap.querySelector(".paper-card").scrollTop = 0;
    cardWrap.hidden = false;
    document.documentElement.classList.add("card-open");
    requestAnimationFrame(() => cardWrap.classList.add("open"));
    cardWrap.querySelector(".c-x").focus({ preventScroll: true });
    cancelAnimationFrame(raf);
    if (life.length) { const t0 = performance.now(); let prev = t0; const tick = (now) => { if (!openKind) return; const dt = Math.min(0.05, Math.max(0, (now - prev) / 1000)); prev = now; const s = (now - t0) / 1000; life.forEach((f) => f(s, dt)); raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); }
    return true;
  }
  function close() {
    if (!openKind) return;
    openKind = null; cancelAnimationFrame(raf);
    cardWrap.classList.remove("open");
    document.documentElement.classList.remove("card-open");
    setTimeout(() => { if (!openKind) cardWrap.hidden = true; }, REDUCED ? 0 : 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* keep ?data=… (and any other query) when walking between the town and the desk */
  function keepQuery(root = document) {
    const q = location.search;
    if (!q) return;
    root.querySelectorAll("a[data-keep-query]").forEach((a) => { const u = new URL(a.getAttribute("href"), location.href); u.search = q; a.href = u.pathname.split("/").pop() + u.search + u.hash; });
  }

  window.PT = {
    R: R0, REDUCED, STYLES,
    svgEl, el, cut, rect, round, circle, hill, sheet, layer, cloud, tree, grain, wrap, seed, rnd, jit,
    HALF: [190, 190, 175, 175, 175, 180, 210, 215],
    building, plate, visual, open, close, has, keepQuery, isOpen: () => Boolean(openKind),
  };
})();
