// World kit: every product gets its own paper-cut world. This file holds the shared craft
// (cut paper, depth planes, the drop-in, the pointer parallax) and builds the work sections from the facts.
(() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  // a rolling hill line from x0 to x1 around height y, closed down to the bottom
  function hill(x0, x1, y, amp, waves, bottom = 1000) {
    const p = [[x0, bottom]];
    for (let x = x0; x <= x1; x += 24) p.push([x, y + Math.sin((x / (x1 - x0)) * Math.PI * waves + waves) * amp + jit(3)]);
    p.push([x1, bottom]);
    return p;
  }
  const sheet = (g, pts, fill, o = {}) => svgEl("path", Object.assign({ d: cut(pts, o.j != null ? o.j : 0.9), fill }, o.attrs), g);
  function layer(parent, depth, cls) { const g = svgEl("g", { class: "cut " + (cls || "") }, parent); g.style.setProperty("--sh", depth); return g; }

  // ---------- the scene: depth planes that drop in, then drift with the pointer ----------
  function scene(svg, planes) {
    const P = {};
    planes.forEach(([name, k], i) => {
      const g = svgEl("g", { class: "plane" }, svg);
      const inner = svgEl("g", { class: "drop" }, g);
      inner.style.setProperty("--i", i);
      g.dataset.k = k;
      P[name] = inner;
    });
    const list = [...svg.querySelectorAll(".plane")].map((g) => ({ g, k: +g.dataset.k }));
    let tx = 0, ty = 0, x = 0, y = 0, last = 0;
    addEventListener("pointermove", (e) => { if (e.pointerType === "touch") return; tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1; last = performance.now(); }, { passive: true });
    const ticks = [];
    let t0 = performance.now(), prev = t0;
    function frame(now) {
      const dt = Math.max(0, Math.min(0.05, (now - prev) / 1000)); prev = now; // the first frame can be timed before the scene started
      if (!REDUCED) {
        const idle = now - last > 4000;
        const gx = idle ? Math.sin(now / 5200) * 0.3 : tx, gy = idle ? Math.cos(now / 6100) * 0.18 : ty;
        x += (gx - x) * 0.06; y += (gy - y) * 0.06;
        list.forEach(({ g, k }) => (g.style.transform = `translate(${(-x * 18 * k).toFixed(2)}px, ${(-y * 10 * k).toFixed(2)}px)`));
        const vis = svg.getBoundingClientRect().bottom > 0;
        if (vis && !document.hidden) ticks.forEach((f) => f(Math.max(0, (now - t0) / 1000), dt));
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return { P, tick: (f) => ticks.push(f) };
  }

  // ---------- the work, below the scene ----------
  function sections(host, f, next) {
    const shots = el("section", "w-sec w-shots reveal");
    shots.appendChild(el("h2", null, "The screens"));
    const line = el("div", "line"), row = el("div", "prints");
    shots.append(line, row);
    (f.shots || []).forEach(([src, cap], i) => {
      const p = el("figure", "print");
      p.style.setProperty("--r", ((i % 2 ? 1 : -1) * (1 + (i % 3) * 0.7)).toFixed(1) + "deg");
      p.style.setProperty("--d", i * 90 + "ms");
      const img = el("img"); img.src = "../" + src; img.alt = f.title + ": " + cap; img.loading = "lazy"; img.decoding = "async";
      p.append(el("span", "peg"), img, el("figcaption", null, cap));
      p.tabIndex = 0; p.setAttribute("role", "button");
      const openIt = () => lightbox(f, i);
      p.addEventListener("click", openIt); p.addEventListener("keydown", (e) => { if (e.key === "Enter") openIt(); });
      row.appendChild(p);
    });

    const story = el("section", "w-sec w-story reveal");
    const plan = el("div", "note n1"); plan.append(el("h2", null, "The plan"), el("p", null, f.plan));
    const built = el("div", "note n2"); built.appendChild(el("h2", null, "What I built"));
    const ul = el("ul"); f.built.forEach((b) => ul.appendChild(el("li", null, b))); built.appendChild(ul);
    story.append(plan, built);

    const checks = el("section", "w-sec w-checks reveal");
    if (f.checks) {
      checks.appendChild(el("h2", null, "Checks it passed before it shipped"));
      const t = el("div", "tickets");
      f.checks.forEach((c, i) => { const k = el("div", "ticket"); k.style.setProperty("--d", 200 + i * 160 + "ms"); k.append(el("span", "stamp", "✓"), el("p", null, c)); t.appendChild(k); });
      checks.appendChild(t);
    }

    const end = el("section", "w-sec w-end reveal");
    const links = el("p", "w-links");
    f.links.forEach(([label, href], i) => { const a = el("a", i ? "" : "primary", label + " ↗"); a.href = href; a.target = "_blank"; a.rel = "noopener"; links.appendChild(a); });
    end.appendChild(links);
    const nav = el("p", "w-nav");
    const back = el("a", null, "← Back to the town"); back.href = "../";
    nav.appendChild(back);
    if (next) { const n = el("a", "next", "Next world: " + next.name + " →"); n.href = next.href; nav.appendChild(n); }
    end.appendChild(nav);
    host.append(shots, story, checks, end);

    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
    host.querySelectorAll(".reveal").forEach((n) => io.observe(n));
  }

  function lightbox(f, i) {
    const box = el("div", "lb"); box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
    const img = el("img"), cap = el("p");
    const close = el("button", "lb-x", "×"); close.type = "button"; close.setAttribute("aria-label", "Close");
    const prev = el("button", "lb-b l", "‹"), nxt = el("button", "lb-b r", "›"); prev.type = nxt.type = "button";
    box.append(img, cap, close, prev, nxt);
    let k = i;
    const show = () => { img.src = "../" + f.shots[k][0]; img.alt = f.title + ": " + f.shots[k][1]; cap.textContent = f.shots[k][1]; };
    const step = (d) => { k = (k + d + f.shots.length) % f.shots.length; show(); };
    const done = () => { box.remove(); removeEventListener("keydown", key); };
    const key = (e) => { if (e.key === "Escape") done(); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    close.onclick = done; prev.onclick = () => step(-1); nxt.onclick = () => step(1);
    box.addEventListener("click", (e) => { if (e.target === box) done(); });
    addEventListener("keydown", key);
    show(); document.body.appendChild(box); close.focus();
  }

  // ---------- shared cast and props ----------
  // One of my agents. hold: "list" | "lamp" | "glass" | "stamp" | "hammer" | null. Returns { g, arm } so a world can move the arm.
  function robot(parent, x, y, s = 1, o = {}) {
    const g = svgEl("g", { transform: `translate(${x} ${y}) scale(${s})` }, parent);
    const b = layer(g, 5);
    svgEl("path", { d: "M0 -84 L0 -70", class: "k-antenna" }, b); svgEl("circle", { cx: 0, cy: -88, r: 7, class: "a-blink" }, b);
    sheet(b, round(-26, -70, 52, 38, 7), o.head || "#f3e8d2", { j: 0.4 });
    svgEl("circle", { cx: -10, cy: -52, r: 5, class: "k-eye" }, b); svgEl("circle", { cx: 10, cy: -52, r: 5, class: "k-eye" }, b);
    sheet(b, round(-30, -30, 60, 46, 8), o.body || "#9bb89b", { j: 0.4 });
    sheet(b, rect(-20, 16, 12, 18), o.body || "#9bb89b", { j: 0.3 }); sheet(b, rect(8, 16, 12, 18), o.body || "#9bb89b", { j: 0.3 });
    const arm = svgEl("g", { class: "arm" }, g);
    const a = layer(arm, 3);
    if (o.hold === "list") { sheet(a, rect(-54, -40, 44, 56), "#fbf6ea", { j: 0.3 }); for (let k = 0; k < 4; k++) svgEl("rect", { x: -48, y: -30 + k * 10, width: 30 - (k % 2) * 8, height: 3, class: "k-ink" }, a); }
    if (o.hold === "lamp") { svgEl("path", { d: "M30 -10 L52 -10 L52 6", class: "k-line" }, a); sheet(a, round(40, 6, 24, 30, 5), "#ffd57c", { j: 0.3 }); svgEl("circle", { cx: 52, cy: 21, r: 30, class: "k-glow" }, a); }
    if (o.hold === "glass") { svgEl("path", { d: "M28 -6 L50 -22", class: "k-handle" }, a); svgEl("circle", { cx: 60, cy: -30, r: 16, class: "k-lens" }, a); }
    if (o.hold === "stamp") { sheet(a, rect(28, -26, 16, 22), "#8b5a31", { j: 0.2 }); sheet(a, rect(22, -6, 28, 12), "#d8412f", { j: 0.2 }); }
    if (o.hold === "hammer") { svgEl("path", { d: "M26 -8 L58 -40", class: "k-handle" }, a); sheet(a, [[48, -52], [70, -30], [62, -22], [40, -44]], "#6f7682", { j: 0.2 }); }
    return { g, arm };
  }
  function cloud(parent, s = 1, fill = "#fffaf0") {
    const g = layer(parent, 4), c = svgEl("g", {}, g);
    [[0, 0, 44], [40, -18, 52], [88, 0, 40], [44, 12, 46]].forEach(([dx, dy, r]) => sheet(c, circle(dx * s, dy * s, r * s, r * s * 0.8), fill, { j: 0.5 }));
    sheet(c, rect(-40 * s, 0, 170 * s, 30 * s), fill, { j: 0.4 });
    return c;
  }
  // follow a path: at(t) gives the point and the heading at fraction t
  function along(path) {
    const len = path.getTotalLength();
    return { len, at(t) { t = Math.max(0, Math.min(1, t)); const p = path.getPointAtLength(t * len), q = path.getPointAtLength(Math.min(len, t * len + 2)); return { x: p.x, y: p.y, ang: Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI }; } };
  }
  function grain() {
    const c = document.createElement("canvas"); c.width = c.height = 160;
    const x = c.getContext("2d"), img = x.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) { const v = 200 + Math.random() * 55; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 24; }
    x.putImageData(img, 0, 0);
    const g = document.getElementById("grain"); if (g) g.style.backgroundImage = `url(${c.toDataURL()})`;
  }
  const NEXT = { forge: ["Agent Service Lab", "lab"], lab: ["FarmQuick", "farm"], farm: ["PitchRadar", "radar"], radar: ["UnboundPDF", "pdf"], pdf: ["Conxto", "conxto"], conxto: ["Conxfolio", "folio"], folio: ["VVDex Trading", "trading"], trading: ["VVDex Forge", "forge"] };
  function page(code, id) {
    grain();
    const f = window.BOARD.flights.find((x) => x.flight === code);
    const [name, next] = NEXT[id];
    sections(document.getElementById("work"), f, { name, href: next + ".html" });
    return f;
  }
  function label(parent, x, y, text, size = 26, anchor = "middle") { const t = svgEl("text", { x, y, class: "k-hand", "text-anchor": anchor }, parent); t.style.fontSize = size + "px"; t.textContent = text; return t; }

  window.World = { svgEl, el, cut, rect, round, circle, hill, sheet, layer, scene, sections, seed, rnd, jit, REDUCED, robot, cloud, along, grain, page, label };
})();
