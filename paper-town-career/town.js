/* ==========================================================================
   29 · PAPER TOWN — the town (front page).

   One paper-cut landscape, cut from a blank sheet: night on the left over the
   person's own house, day through the middle, dawn at the far end. Every
   project in the record is one building on the one road, in the order the
   record gives them; clicking a building (or its sign) opens its paper card in
   place. The town grows with the record: a name alone is a house in a field,
   eight projects are a whole town. Below the town, the record on paper.
   ========================================================================== */
(() => {
  "use strict";
  const PT = window.PT, R = PT.R;
  const { svgEl, el, sheet, layer, rect, round, circle, hill, cloud, tree, seed, rnd } = PT;
  const REDUCED = PT.REDUCED;
  const params = new URLSearchParams(location.search);
  const svg = document.getElementById("town"), pan = document.getElementById("pan"), inner = document.getElementById("pan-inner");
  const stage = document.getElementById("stage");
  const GROUND = 770, HOME_W = 780, LEFT = 40;

  /* ------------------------------------------------ the hero (h1 = the name) */
  const plaque = document.getElementById("plaque");
  (function hero() {
    const k = [R.isSpecimen ? null : null, R.location].filter(Boolean);
    const kick = document.getElementById("p-kick"), sub = document.getElementById("p-sub"), h1 = document.getElementById("p-name");
    h1.textContent = R.name;
    if (!R.name) h1.hidden = true;
    if (R.location) kick.textContent = R.location; else kick.remove();
    if (R.headline) sub.textContent = R.headline; else sub.remove();
    const acts = document.getElementById("p-acts");
    const add = (label, kind, cls) => { const b = el("button", cls || "", label); b.type = "button"; b.addEventListener("click", () => PT.open(kind)); acts.appendChild(b); };
    if (R.hasAbout) add("About", "about");
    if (R.hasContact) add("Contact", "contact", "primary");
    if (!acts.childNodes.length) acts.remove();
    if (!R.isSpecimen) document.getElementById("p-spec").remove();
    void k;
  })();

  /* ------------------------------------------------------------ the layout */
  const SIGN_CH = 19; // characters per sign line
  function signOf(p) {
    const lines = PT.wrap(R.projectLabel(p), SIGN_CH, p.title ? 5 : 3);
    const line2 = R.projectLine(p);
    const wName = Math.max(...lines.map((l) => l.length)) * 14.2 + 46;
    const wLine = line2 ? line2.length * 8 + 40 : 0;
    const w = Math.max(150, wName, Math.min(wLine, 420));
    const h = 24 + lines.length * 30 + (line2 ? 26 : 0) + 8;
    return { lines, line2, w, h };
  }
  function layout() {
    const signs = R.projects.map(signOf);
    const slots = R.projects.map((p, i) => Math.max(PT.HALF[i % 8] * 2 + 44, signs[i].w + 44));
    let x = LEFT;
    const home = x + HOME_W / 2; x += HOME_W;
    const centers = slots.map((w) => { const c = x + w / 2; x += w; return c; });
    const stageH = stage.clientHeight || innerHeight;
    const minW = Math.max(1900, Math.ceil((1000 * innerWidth) / stageH) + 2);
    const W = Math.max(minW, Math.ceil(x + 300));
    return { W, home, centers, slots, signs, end: x };
  }

  /* ------------------------------------------------------------- the build */
  let T = null;
  function build() {
    const L = layout(), W = L.W;
    svg.replaceChildren(svg.querySelector("defs"));
    svg.setAttribute("viewBox", `0 0 ${W} 1000`);
    svg.style.aspectRatio = `${W} / 1000`;
    seed(2026);
    const plane = (name) => svgEl("g", { class: "tp tp-" + name }, svg);
    const P = { sky: plane("sky"), far: plane("far"), mid: plane("mid"), river: plane("river"), build: plane("build"), road: plane("road"), near: plane("near"), signs: plane("signs"), air: plane("air") };
    const H = { life: [] };

    // sky: night over the house, day in the middle, dawn at the far end
    svgEl("rect", { x: -40, y: -40, width: W + 80, height: 1080, fill: "url(#skyTime)" }, P.sky);
    const nightW = Math.min(1300, W * 0.4);
    for (let k = 0; k < 70; k++) { const sx = rnd() * nightW; svgEl("circle", { cx: sx, cy: rnd() * 440, r: 0.7 + rnd() * 1.6, class: "star", style: `opacity:${(1 - sx / nightW).toFixed(2)}` }, P.sky); }
    sheet(layer(P.sky, 2), circle(Math.min(260, W * 0.12), 170, 40), "#f6e9c6");
    const sun = svgEl("g", { class: "sun" }, P.sky), sx0 = W - 210;
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; sheet(sun, [[sx0 + Math.cos(a) * 64, 250 + Math.sin(a) * 64], [sx0 + Math.cos(a + 0.11) * 90, 250 + Math.sin(a + 0.11) * 90], [sx0 + Math.cos(a + 0.22) * 64, 250 + Math.sin(a + 0.22) * 64]], "#f3b04a", { j: 0.3 }); }
    sheet(sun, circle(sx0, 250, 56), "#f6c65b");
    const nClouds = Math.max(3, Math.round(W / 800));
    const clouds = Array.from({ length: nClouds }, (_, k) => { const s = 0.7 + rnd() * 0.35, cx = nightW * 0.8 + (k / nClouds) * (W - nightW * 0.8), cy = 110 + rnd() * 110; const c = cloud(P.sky, s); c.setAttribute("transform", `translate(${cx.toFixed(0)} ${cy.toFixed(0)})`); return { c, x: cx, y: cy, v: 5 + s * 4 }; });

    // land: far hills, mid hills, the river, the road, the near bank
    const waves = Math.max(3, W / 460);
    sheet(layer(P.far, 3), hill(-40, W + 40, 560, 34, waves), "url(#farTime)", { j: 0.5 });
    sheet(layer(P.mid, 4), hill(-40, W + 40, 664, 20, waves * 0.7), "url(#midTime)", { j: 0.5 });
    const curve = (y0, amp, step) => { let d = `M${W + 60} ${y0}`; for (let x = W + 60; x > -60; x -= step) { const nx = x - step, my = y0 + Math.sin(x / 530) * amp, ny = y0 + Math.sin(nx / 530) * amp; d += ` C${(x - step / 3).toFixed(0)} ${my.toFixed(0)} ${(x - (2 * step) / 3).toFixed(0)} ${ny.toFixed(0)} ${nx.toFixed(0)} ${ny.toFixed(0)}`; } return d; };
    svgEl("path", { d: curve(726, 16, 400), class: "river" }, P.river);
    const roadD = curve(862, 10, 500);
    const road = svgEl("path", { d: roadD, class: "road" }, P.road);
    svgEl("path", { d: roadD, class: "road-mid" }, P.road);
    sheet(layer(P.near, 9), hill(-40, W + 40, 934, 10, waves * 1.3), "url(#nearTime)", { j: 0.5 });

    // home: the person's own house, lit, smoke from the chimney, a mailbox at the gate
    const homeG = svgEl("g", { class: "home", transform: `translate(${L.home} ${GROUND})` }, P.build);
    tree(homeG, -300, 10, 1.1, 1); tree(homeG, -236, 16, 0.8, 0);
    const hs = layer(homeG, 6); const houseParts = svgEl("g", { class: "house" }, hs);
    sheet(houseParts, rect(-130, -176, 260, 176), "#f2d7a6", { j: 0.5 });
    sheet(houseParts, [[-152, -170], [0, -286], [152, -170]], "#a84a32", { j: 0.5 });
    sheet(houseParts, rect(66, -274, 28, 70), "#8b3a2a", { j: 0.3 });
    sheet(houseParts, round(-26, -96, 52, 96, 22), "#6b4526", { j: 0.3 });
    [-94, 50].forEach((wx) => { sheet(houseParts, rect(wx, -140, 44, 40), "#ffe6a8", { j: 0.2 }); svgEl("path", { d: `M${wx + 22} -140 L${wx + 22} -100 M${wx} -120 L${wx + 44} -120`, class: "mullion" }, houseParts); });
    sheet(houseParts, circle(0, -216, 16), "#ffe6a8", { j: 0.2 });
    const fence = layer(homeG, 7); for (let k = 0; k < 7; k++) sheet(fence, [[-236 + k * 26, 20], [-236 + k * 26, -26], [-227 + k * 26, -36], [-218 + k * 26, -26], [-218 + k * 26, 20]], "#fbf6ea", { j: 0.2 });
    sheet(fence, rect(-240, -12, 190, 8), "#efe3c8", { j: 0.2 });
    const smoke = svgEl("g", { class: "smoke" }, homeG);
    const puffs = [0, 1, 2, 3].map(() => { const c = svgEl("g", {}, smoke); sheet(c, circle(0, 0, 14, 11), "#e9e2d2", { j: 0.4 }); return c; });
    let mailbox = null;
    if (R.hasContact) {
      mailbox = svgEl("g", { class: "mailbox", tabindex: 0, role: "button", "aria-label": "Contact" }, homeG);
      const mb = layer(mailbox, 7);
      sheet(mb, rect(196, -70, 8, 90), "#6b4526", { j: 0.2 });
      sheet(mb, round(170, -112, 64, 44, 12), "#d8412f", { j: 0.3 });
      sheet(mb, rect(222, -140, 5, 40), "#3b2b1d", { j: 0.1 }); sheet(mb, rect(222, -140, 22, 13), "#f0b83c", { j: 0.1 });
      const tag = layer(mailbox, 8); sheet(tag, rect(158, -44, 88, 30), "#fbf6ea", { j: 0.3 });
      svgEl("text", { x: 202, y: -23, class: "tag-t", "text-anchor": "middle" }, tag).textContent = "Contact";
    }
    if (R.hasAbout) { houseParts.setAttribute("tabindex", "0"); houseParts.setAttribute("role", "button"); houseParts.setAttribute("aria-label", "About" + (R.name ? " " + R.name : "")); houseParts.classList.add("hot"); }
    H.puffs = puffs;

    // the projects: one building each, a sign over each
    const blds = R.projects.map((p, i) => {
      const cx = L.centers[i];
      const host = svgEl("g", { transform: `translate(${cx.toFixed(1)} ${GROUND})` }, P.build);
      const b = PT.building(host, i, H.life);
      b.g.setAttribute("data-i", i); b.g.classList.add("hot");
      // a sign on a post: the project's name first, its year and role under it
      const s = L.signs[i], top = Math.max(150, GROUND + b.top - 34 - s.h), g = svgEl("g", { class: "district", tabindex: 0, role: "button", "data-i": i, "aria-label": `${R.projectLabel(p)}${s.line2 ? ", " + s.line2 : ""}. Open.` }, P.signs);
      svgEl("path", { d: `M${cx} ${top + s.h - 4} L${cx} ${Math.max(top + s.h + 10, GROUND + b.top + 16)}`, class: "post" }, g);
      const sl = layer(g, 6); sheet(sl, rect(cx - s.w / 2, top, s.w, s.h), "#fbf6ea", { j: 0.4 });
      s.lines.forEach((ln, k) => { svgEl("text", { x: cx, y: top + 34 + k * 30, class: "sign-name", "text-anchor": "middle" }, g).textContent = ln; });
      if (s.line2) svgEl("text", { x: cx, y: top + 34 + (s.lines.length - 1) * 30 + 28, class: "sign-line", "text-anchor": "middle" }, g).textContent = s.line2;
      return { cx, g: b.g, sign: g };
    });

    // the far field: a few trees past the last building, under the sun
    for (let x = L.end + 60, k = 0; x < W - 40; x += 150 + rnd() * 120, k++) tree(P.build, x, GROUND + 6 + (k % 2) * 10, 0.8 + rnd() * 0.4, k);

    // the truck that runs the whole road
    const truck = svgEl("g", { class: "truck" }, P.road);
    const tb = layer(truck, 6);
    [[-18, -44, 9, "#d8412f"], [-4, -47, 10, "#6f9a55"], [10, -44, 9, "#d8412f"]].forEach(([x, y, r, c]) => sheet(tb, circle(x, y, r), c));
    sheet(tb, rect(-30, -40, 70, 30), "#d3a066"); sheet(tb, round(40, -36, 34, 28, 5), "#2f8f4e");
    [-14, 26, 60].forEach((x) => sheet(tb, circle(x, -8, 9), "#2d3038"));

    // the banner plane: the name, towed across the whole sky
    const bannerPlane = svgEl("g", { class: "banner-plane", "aria-hidden": "true" }, P.air);
    let banner = null;
    if (R.name) {
      svgEl("path", { d: "M-40 0 L-120 0", class: "tow" }, bannerPlane);
      const bn = layer(bannerPlane, 4), cloth = svgEl("g", {}, bn);
      const t = svgEl("text", { x: -340, y: 10, class: "banner-t", "text-anchor": "middle" }, bannerPlane);
      t.textContent = R.headline && (R.name.length + R.headline.length) < 64 ? `${R.name} · ${R.headline}` : R.name;
      banner = { t, cloth };
    }
    const bp = layer(bannerPlane, 5); sheet(bp, [[-40, 10], [40, -16], [-10, 30]], "#fffdf6", { j: 0.3 }); sheet(bp, [[-10, 30], [40, -16], [0, 6]], "#e9dfca", { j: 0.2 });

    T = { W, L, P, H, road, truck, bannerPlane, banner, clouds, blds, homeG, houseParts, mailbox };
    sizeBanner();
    placePlaque();
    wire();
    buildIndex();
    return T;
  }
  function sizeBanner() {
    if (!T || !T.banner) return;
    let w = 420;
    try { w = T.banner.t.getComputedTextLength() + 70; } catch (e) { /* not laid out yet */ }
    if (!w || w < 120) w = T.banner.t.textContent.length * 14 + 70;
    const x0 = -120 - w, cx = (x0 - 120) / 2;
    T.banner.t.setAttribute("x", cx.toFixed(1));
    T.banner.cloth.replaceChildren();
    seed(77); sheet(T.banner.cloth, [[x0, -30], [-120, -30], [-120, 30], [x0, 30], [x0 + 20, 0]], "#fbf6ea", { j: 0.5 });
    T.bannerW = w;
  }
  function placePlaque() {
    plaque.style.left = ((T.L.home / T.W) * 100).toFixed(3) + "%";
    plaque.hidden = false;
  }

  /* ------------------------------------------------------ walking the town */
  const scale = () => svg.getBoundingClientRect().width / T.W;
  const toPx = (x) => x * scale();
  const center = (x, smooth) => pan.scrollTo({ left: Math.max(0, toPx(x) - pan.clientWidth / 2), behavior: smooth && !REDUCED ? "smooth" : "auto" });
  let moved = 0;
  function wire() {
    const openP = (i) => { if (moved < 6) PT.open("project", +i); };
    const keyOpen = (fn) => (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } };
    T.blds.forEach(({ g, sign }, i) => {
      [g, sign].forEach((n) => n.addEventListener("click", () => openP(i)));
      sign.addEventListener("keydown", keyOpen(() => PT.open("project", i)));
      const lift = (on) => sign.classList.toggle("up", on);
      [g, sign].forEach((n) => { n.addEventListener("pointerenter", () => lift(true)); n.addEventListener("pointerleave", () => lift(false)); });
    });
    if (R.hasAbout) { T.houseParts.addEventListener("click", () => { if (moved < 6) PT.open("about"); }); T.houseParts.addEventListener("keydown", keyOpen(() => PT.open("about"))); }
    if (T.mailbox) { T.mailbox.addEventListener("click", () => { if (moved < 6) PT.open("contact"); }); T.mailbox.addEventListener("keydown", keyOpen(() => PT.open("contact"))); }
  }
  const index = document.getElementById("index");
  function buildIndex() {
    index.replaceChildren();
    if (!R.projects.length) { index.hidden = true; return; }
    index.hidden = false;
    const add = (label, x, i) => { const b = el("button", null, label); b.type = "button"; b.dataset.x = x; if (i != null) b.dataset.i = i; b.addEventListener("click", () => center(x, true)); index.appendChild(b); };
    add(R.name || "Home", T.L.home);
    R.projects.forEach((p, i) => add(R.projectLabel(p), T.L.centers[i], i));
  }
  function mark() {
    if (!T) return;
    const mid = ((pan.scrollLeft + pan.clientWidth / 2) / svg.getBoundingClientRect().width) * T.W;
    let best = null, d = 1e9;
    index.querySelectorAll("button").forEach((b) => { const dd = Math.abs(+b.dataset.x - mid); if (dd < d) { d = dd; best = b; } });
    index.querySelectorAll("button").forEach((b) => b.classList.toggle("here", b === best));
    document.body.classList.toggle("walkable", pan.scrollWidth > pan.clientWidth + 4);
  }
  pan.addEventListener("scroll", mark, { passive: true });
  let sx = null, sl = 0;
  pan.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse" || e.button !== 0) return; sx = e.clientX; sl = pan.scrollLeft; moved = 0; });
  addEventListener("pointermove", (e) => { if (sx == null) return; moved = Math.abs(e.clientX - sx); if (moved > 4) pan.classList.add("dragging"); pan.scrollLeft = sl - (e.clientX - sx); });
  addEventListener("pointerup", () => { sx = null; pan.classList.remove("dragging"); setTimeout(() => { moved = 0; }, 0); });
  pan.addEventListener("keydown", (e) => { if (e.target !== pan) return; if (e.key === "ArrowRight") pan.scrollBy({ left: 240, behavior: REDUCED ? "auto" : "smooth" }); if (e.key === "ArrowLeft") pan.scrollBy({ left: -240, behavior: REDUCED ? "auto" : "smooth" }); });

  build();
  requestAnimationFrame(() => { center(T.L.home); mark(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { sizeBanner(); mark(); });
  let rw = innerWidth, rh = stage.clientHeight, rt = 0;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (Math.abs(innerWidth - rw) < 2 && Math.abs(stage.clientHeight - rh) < 60) { mark(); return; }
      const frac = pan.scrollLeft / Math.max(1, pan.scrollWidth);
      rw = innerWidth; rh = stage.clientHeight;
      const need = layout().W;
      if (need !== T.W) build();
      pan.scrollLeft = frac * pan.scrollWidth; mark();
    }, 160);
  });

  /* ------------------------------------------------------------ the light
     The pointer (or a tilted phone) is the light: shadows fall away from it,
     and on the night side it is a torch that lights what it touches. */
  const torch = document.getElementById("torch");
  let tx = 0.3, ty = 0.2, lx = tx, ly = ty, held = false;
  addEventListener("pointermove", (e) => { if (e.pointerType === "touch") return; held = true; tx = e.clientX / innerWidth; ty = e.clientY / innerHeight; }, { passive: true });
  addEventListener("deviceorientation", (e) => { if (e.gamma == null) return; held = true; tx = Math.min(1, Math.max(0, 0.5 + e.gamma / 60)); ty = Math.min(1, Math.max(0, 0.3 + (e.beta - 40) / 80)); });
  let lastSet = "", lastT = 0;
  function light(now) {
    lx += (tx - lx) * 0.08; ly += (ty - ly) * 0.08;
    let sx2 = (0.5 - lx) * 2.4, sy2 = 0.35 + (ly < 0.5 ? (0.5 - ly) * 1.6 : 0) - (ly > 0.5 ? (ly - 0.5) * 1.2 : 0);
    // re-blurring every shadow is the expensive part: small steps, at most ~8 a second, none while the light rests
    const qx = Math.round(sx2 * 10) / 10, qy = Math.round(sy2 * 10) / 10, key = qx + "," + qy;
    if (key !== lastSet && now - lastT > 120) { lastT = now; svg.style.setProperty("--lx", qx.toFixed(2)); svg.style.setProperty("--ly", qy.toFixed(2)); lastSet = key; }
    window.TownLight = { x: lx, y: ly };
    const stageR = stage.getBoundingClientRect();
    const wx = (pan.scrollLeft + lx * pan.clientWidth) / scale();
    const night = Math.max(0, Math.min(1, (T.W * 0.34 - wx) / (T.W * 0.25)));
    torch.style.setProperty("--mx", (lx * 100).toFixed(1) + "%");
    torch.style.setProperty("--my", (Math.min(1, (ly * innerHeight - stageR.top) / Math.max(1, stageR.height)) * 100).toFixed(1) + "%");
    torch.style.opacity = held ? (0.2 + night * 0.8).toFixed(2) : "0";
  }
  svg.style.setProperty("--lx", "0"); svg.style.setProperty("--ly", "0.6");

  /* ------------------------------------------------------------- the life */
  let t0 = performance.now(), prev = t0, visible = true;
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(stage);
  function frame(now) {
    const dt = Math.max(0, Math.min(0.05, (now - prev) / 1000)), t = Math.max(0, (now - t0) / 1000); prev = now;
    if (!document.hidden && visible && !PT.isOpen() && T) {
      light(now);
      if (!REDUCED) {
        const sxw = pan.scrollLeft / scale();
        const Lg = window.TownLight || { x: 0.5, y: 0.3 }, ox = (0.5 - Lg.x) * 40, oy = (0.3 - Lg.y) * 16;
        T.P.sky.setAttribute("transform", `translate(${(sxw * 0.5 + ox * 0.3).toFixed(1)} ${(oy * 0.3).toFixed(1)})`);
        T.P.far.setAttribute("transform", `translate(${(sxw * 0.26 + ox * 0.6).toFixed(1)} ${(oy * 0.6).toFixed(1)})`);
        T.P.mid.setAttribute("transform", `translate(${(sxw * 0.08 + ox * 0.85).toFixed(1)} ${(oy * 0.85).toFixed(1)})`);
        const rlen = T.road.getTotalLength(), u = (t / (T.W / 80)) % 2, f = u < 1 ? u : 2 - u;
        const p = T.road.getPointAtLength((1 - f) * rlen);
        T.truck.setAttribute("transform", `translate(${p.x.toFixed(1)} ${(p.y + Math.sin(t * 16) * 0.8).toFixed(1)}) scale(${u < 1 ? 1 : -1} 1)`);
        const span = T.W + (T.bannerW || 400) + 400, bx = -200 + ((t * 70) % span);
        T.bannerPlane.setAttribute("transform", `translate(${bx.toFixed(1)} ${(92 + Math.sin(t * 0.7) * 10).toFixed(1)}) rotate(${(Math.sin(t * 0.7) * 2 - 2).toFixed(1)})`);
        T.clouds.forEach((c) => { c.x += c.v * dt; if (c.x > T.W + 120) c.x = -200; c.c.setAttribute("transform", `translate(${c.x.toFixed(1)} ${c.y.toFixed(1)})`); });
        T.H.puffs.forEach((pf, k) => { const ph = ((t * 0.35 + k / T.H.puffs.length) % 1); pf.setAttribute("transform", `translate(${(80 + ph * 50 + Math.sin(t + k) * 6).toFixed(1)} ${(-280 - ph * 150).toFixed(1)}) scale(${(0.6 + ph * 1.1).toFixed(2)})`); pf.style.opacity = (1 - ph).toFixed(2); });
        T.H.life.forEach((fn) => fn(t, dt));
      }
    }
    requestAnimationFrame(frame);
  }
  if (REDUCED) { // the still: truck on the road, the banner over the house
    const p = T.road.getPointAtLength(T.road.getTotalLength() * 0.8);
    T.truck.setAttribute("transform", `translate(${p.x} ${p.y})`);
    T.bannerPlane.setAttribute("transform", `translate(${Math.min(T.W - 60, T.L.home + (T.bannerW || 400) / 2 + 380)} 96) rotate(-2)`);
    T.H.puffs.forEach((pf, k) => pf.setAttribute("transform", `translate(${86 + k * 12} ${-290 - k * 36}) scale(${0.7 + k * 0.25})`));
  }
  requestAnimationFrame(frame);

  /* ------------------------------------------------------------ the intro
     Once a visit: the town is cut out of a blank sheet with the name on it. */
  const store = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* private mode */ } } };
  const sheetEl = document.getElementById("sheet"), ss = document.getElementById("sheet-svg");
  const wantIntro = !REDUCED && !document.hidden && !params.has("still") && (params.has("intro") || store.get("pt-intro") !== "1");
  function signsIn(now) {
    T.P.signs.querySelectorAll(".district").forEach((g, i) => { g.style.setProperty("--i", i); if (!now) g.classList.add("drop-in"); });
    document.body.classList.remove("intro");
  }
  if (wantIntro) {
    store.set("pt-intro", "1");
    document.body.classList.add("intro");
    document.getElementById("sheet-name").textContent = R.name;
    if (R.headline) document.getElementById("sheet-sub").textContent = R.headline;
    sheetEl.hidden = false;
    const w = stage.clientWidth, h = stage.clientHeight;
    ss.setAttribute("viewBox", `0 0 ${w} ${h}`);
    let d = `M0 ${h * 0.72}`, x = 0;
    while (x < w) { const bw = 30 + ((x * 7919) % 70), bh = h * (0.56 + (((x * 104729) % 100) / 100) * 0.16); d += ` L${x} ${bh} L${x + bw} ${bh}`; x += bw; }
    d += ` L${w} ${h * 0.64}`;
    const guide = svgEl("path", { d, class: "guide" }, ss), total = guide.getTotalLength();
    const done = svgEl("path", { d, class: "done" }, ss);
    const sc = svgEl("g", {}, ss), bladeA = svgEl("path", { d: "M0 0 L46 -10 L48 -4 Z", fill: "#c9ced6" }, sc), bladeB = svgEl("path", { d: "M0 0 L46 10 L48 4 Z", fill: "#aeb4bd" }, sc);
    svgEl("circle", { cx: -14, cy: -10, r: 11, fill: "none", stroke: "#d8412f", "stroke-width": 5 }, sc);
    svgEl("circle", { cx: -14, cy: 10, r: 11, fill: "none", stroke: "#d8412f", "stroke-width": 5 }, sc);
    const pts = []; for (let l = 0; l <= total; l += 5) { const q = guide.getPointAtLength(l); pts.push([q.x, q.y]); }
    let start = null, finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      sheetEl.style.clipPath = "none";
      const a = sheetEl.animate([{ transform: "none" }, { transform: "translateY(-106%) rotate(-5deg)" }], { duration: 850, easing: "cubic-bezier(.6,0,.3,1)", fill: "forwards" });
      a.onfinish = () => { sheetEl.hidden = true; };
      setTimeout(() => signsIn(false), 350);
    };
    const CUT = 2200;
    const cutFrame = (now) => {
      if (finished) return;
      if (start == null) start = now;
      const t = Math.min(1, Math.max(0, (now - start - 450) / CUT)), k = 1 - Math.pow(1 - t, 3);
      const n = Math.max(1, Math.floor(k * (pts.length - 1))), p = pts[n];
      done.setAttribute("stroke-dasharray", `${(k * total).toFixed(1)} 99999`);
      const snip = Math.abs(Math.sin(now / 70)) * 14;
      bladeA.setAttribute("transform", `rotate(${-snip})`); bladeB.setAttribute("transform", `rotate(${snip})`);
      sc.setAttribute("transform", `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(8)`);
      const poly = pts.slice(0, n + 1).map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join(" L");
      sheetEl.style.clipPath = `path(evenodd, "M0 0 H${w} V${h} H0 Z M0 ${h} L${poly} L${p[0].toFixed(1)} ${h} Z")`;
      if (t >= 1) setTimeout(finish, 150); else requestAnimationFrame(cutFrame);
    };
    requestAnimationFrame(cutFrame);
    sheetEl.addEventListener("click", finish);
    addEventListener("keydown", finish, { once: true });
    addEventListener("wheel", finish, { once: true, passive: true });
    addEventListener("touchstart", finish, { once: true, passive: true });
  } else {
    signsIn(true);
  }

  /* ------------------------------------------------------------ the record
     Below the town, the same record on paper, in the standard order. */
  const rec = document.getElementById("record");
  const secs = [];
  const section = (id, title, hand) => { const s = el("section", "r-sec"); s.id = id; s.setAttribute("aria-labelledby", id + "-h"); const h = el("h2", null, title); h.id = id + "-h"; if (hand) s.appendChild(el("p", "r-hand", hand)); s.appendChild(h); secs.push([id, title]); return s; };
  const paras = (t) => String(t).split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean).map((x) => el("p", null, x));
  const body = el("div", "r-body");
  if (R.hasAbout) {
    const s = section("about", "About", "the person in the house");
    const g = el("div", "r-about");
    if (R.about) { const a = el("div", "r-note"); paras(R.about).forEach((n) => a.appendChild(n)); g.appendChild(a); }
    const facts = [["Based in", R.location], ["Availability", R.availability]].filter(([, v]) => v);
    if (facts.length) { const dl = el("dl", "r-facts"); facts.forEach(([k, v]) => dl.append(el("dt", null, k), el("dd", null, v))); g.appendChild(dl); }
    s.appendChild(g); body.appendChild(s);
  }
  if (R.roles.length) {
    const s = section("experience", "Experience", "the roles, in the order given");
    const g = el("ol", "r-roles");
    R.roles.forEach((r, i) => {
      const li = el("li", "r-role"); li.style.setProperty("--r", ((i % 2 ? 1 : -1) * (0.4 + (i % 3) * 0.25)).toFixed(2) + "deg");
      if (r.when) li.appendChild(el("p", "when", r.when));
      li.appendChild(el("h3", null, r.title || r.company));
      const at = [r.title ? r.company : "", r.where].filter(Boolean).join(" · "); if (at) li.appendChild(el("p", "at", at));
      if (r.summary) li.appendChild(el("p", null, r.summary));
      if (r.notes.length) { const u = el("ul"); r.notes.forEach((n) => u.appendChild(el("li", null, n))); li.appendChild(u); }
      g.appendChild(li);
    });
    s.appendChild(g); body.appendChild(s);
  }
  if (R.projects.length) {
    const s = section("projects", "Projects", R.projects.length > 1 ? "every building in the town" : "the building in the town");
    const g = el("ul", "r-projects");
    R.projects.forEach((p, i) => {
      const li = el("li"), b = el("button", "r-proj"); b.type = "button";
      b.appendChild(PT.visual(p, null));
      const line = R.projectLine(p); if (line) b.appendChild(el("span", "r-p-line", line));
      b.appendChild(el("span", "r-p-title", R.projectLabel(p)));
      if (p.outcome && p.title) b.appendChild(el("span", "r-p-out", p.outcome));
      b.addEventListener("click", () => PT.open("project", i));
      li.appendChild(b); g.appendChild(li);
    });
    s.appendChild(g); body.appendChild(s);
  }
  if (R.skills.length) {
    const s = section("skills", "Skills", "pinned to the board");
    const g = el("div", "r-skills");
    R.skills.forEach((sk) => { const d = el("div", "r-skill"); if (sk.group) d.appendChild(el("h3", null, sk.group)); if (sk.items.length) { const u = el("ul", "chips"); sk.items.forEach((x) => u.appendChild(el("li", null, x))); d.appendChild(u); } g.appendChild(d); });
    s.appendChild(g); body.appendChild(s);
  }
  if (R.education.length || R.languages.length) {
    const row = el("div", "r-row");
    if (R.education.length) {
      const s = section("education", "Education", "on the wall");
      R.education.forEach((e) => { const d = el("div", "r-edu"); if (e.when) d.appendChild(el("p", "when", e.when)); d.appendChild(el("h3", null, e.degree || e.school)); if (e.degree && e.school) d.appendChild(el("p", "at", e.school)); if (e.detail) d.appendChild(el("p", null, e.detail)); s.appendChild(d); });
      row.appendChild(s);
    }
    if (R.languages.length) {
      const s = section("languages", "Languages", "spoken here");
      const u = el("ul", "chips"); R.languages.forEach((x) => u.appendChild(el("li", null, x))); s.appendChild(u);
      row.appendChild(s);
    }
    body.appendChild(row);
  }
  if (R.hasContact) {
    const s = section("contact", "Contact", "the mailbox at the gate");
    s.classList.add("r-contact");
    const env = el("div", "r-envelope");
    if (R.availability) env.appendChild(el("p", "r-avail", R.availability));
    const links = el("p", "r-links");
    if (R.email) { const a = el("a", "primary", R.email); a.href = "mailto:" + R.email; links.appendChild(a); }
    if (R.phone) { const a = el("a", "", R.phone); a.href = "tel:" + R.phone.replace(/[^\d+]/g, ""); links.appendChild(a); }
    R.links.forEach((l) => { const a = el("a", "", l.label + " ↗"); a.href = l.href; a.target = "_blank"; a.rel = "noopener"; links.appendChild(a); });
    env.appendChild(links); s.appendChild(env); body.appendChild(s);
  }
  if (secs.length) {
    const nav = el("nav", "r-nav"); nav.setAttribute("aria-label", "On this page");
    secs.forEach(([id, title]) => { const a = el("a", null, title); a.href = "#" + id; nav.appendChild(a); });
    rec.appendChild(nav);
    rec.appendChild(body);
  }
  // the corner: the sections below the town, and the way to the desk
  const corner = document.getElementById("corner");
  const deskLink = corner.querySelector("[data-keep-query]");
  secs.filter(([id]) => ["about", "contact"].includes(id)).forEach(([id, title]) => { const a = el("a", null, title); a.href = "#" + id; corner.insertBefore(a, deskLink); });
  PT.keepQuery();
  PT.grain(document.getElementById("grain"));
  PT.grain(document.getElementById("r-grain"));
})();
