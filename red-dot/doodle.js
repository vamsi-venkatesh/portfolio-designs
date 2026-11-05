/* The checkpoint, a small hand-drawn world in a sketchbook card. A product rides a conveyor belt past four stations:
   Design (a pencil sketches), Build (gears turn), Run (a server's lights flash) and Check, where a little inspector
   with a magnifier decides. "Not yet": a bug is found, he shakes his head, the box goes back to Build and the bug is
   zapped. Pass: a red-dot stamp, confetti, he jumps, and the box folds into a paper plane that loops the loop and
   flies off past the clouds. Rough.js draws, GSAP moves; static lines "boil" (three seeded copies take turns).
   Runs only while on screen; a still frame for reduced motion. */
(() => {
  "use strict";
  const host = document.getElementById("doodle");
  if (!host || !window.rough) return;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg", INK = "#111110", RED = "#ff3b1f", PAPER = "#f7f5ef", HAND = "'Caveat', 'Comic Sans MS', cursive";
  const W = 600, H = 350, BELT = 250;
  const ST = [{ k: "Design", x: 70 }, { k: "Build", x: 180 }, { k: "Run", x: 288 }, { k: "Check", x: 392 }, { k: "Ship", x: 532 }];
  const NAMES = ["Conxto", "UnboundPDF", "FarmQuick", "Lab", "Forge", "PitchRadar", "Conxfolio", "Trading"];

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "A hand-drawn conveyor belt: each product is designed, built, run and checked, and only then shipped.");
  host.appendChild(svg);
  const rc = rough.svg(svg);
  const mk = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); (parent || svg).appendChild(n); return n; };
  const text = (x, y, s, size, fill, parent, anchor) => { const t = mk("text", { x, y, "font-family": HAND, "font-size": size, fill, "text-anchor": anchor || "middle" }, parent); t.textContent = s; return t; };
  const o = (seed, more) => Object.assign({ seed, roughness: 1.3, bowing: 1.3, stroke: INK, strokeWidth: 1.6 }, more || {});
  // scale or rotate around a local point, set by hand (GSAP's SVG origins assume the global space)
  const about = (el, cx, cy, s, r) => el.setAttribute("transform", `translate(${cx} ${cy}) rotate(${r || 0}) scale(${s == null ? 1 : s}) translate(${-cx} ${-cy})`);

  /* ---------- layer 1: the sky (clouds drift, the sun turns) ---------- */
  const sky = mk("g", {});
  const sun = mk("g", {}, sky);
  sun.appendChild(rc.circle(250, 58, 34, o(21, { stroke: RED, fill: "rgba(255,59,31,.55)", fillStyle: "hachure", hachureGap: 4, strokeWidth: 1.4 })));
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; sun.appendChild(rc.line(250 + Math.cos(a) * 24, 58 + Math.sin(a) * 24, 250 + Math.cos(a) * 34, 58 + Math.sin(a) * 34, o(30 + i, { stroke: RED, strokeWidth: 1.4 }))); }
  const cloud = (seed) => { const g = mk("g", {}, sky);
    g.appendChild(rc.path("M0 22 C -4 8 14 2 22 10 C 26 -2 48 -2 52 10 C 64 6 74 16 68 26 C 70 32 60 36 52 34 L 8 34 C -2 34 -4 26 0 22 Z", o(seed, { fill: PAPER, fillStyle: "solid", strokeWidth: 1.4 }))); return g; };
  const clouds = [cloud(41), cloud(47), cloud(53)];
  const cloudPos = [{ x: 150, y: 70, v: 7 }, { x: 300, y: 96, v: 5 }, { x: 420, y: 34, v: 9 }];

  /* ---------- layer 2: the boiling static drawing (skyline, belt, stations) ---------- */
  const variants = [0, 1, 2].map((v) => {
    const g = mk("g", {}); if (v) g.style.display = "none";
    const s = 11 + v * 7, add = (n) => g.appendChild(n), faint = { stroke: "rgba(17,17,16,.28)", strokeWidth: 1.1 };
    add(rc.rectangle(5, 5, W - 10, H - 10, o(s + 40, { strokeWidth: 1.8, roughness: 1.6 }))); // the card's hand-drawn edge
    // a faint skyline on the horizon, with the cathedral's two spires
    add(rc.path("M14 214 L14 196 L34 196 L34 186 L52 186 L52 204 L70 204 L70 180 L80 172 L90 180 L90 204 L112 204 L112 192 L140 192 L140 214", o(s, faint)));
    add(rc.path("M290 214 L290 190 L296 170 L302 190 L302 200 L312 200 L312 190 L318 170 L324 190 L324 214", o(s + 1, faint)));
    add(rc.path("M420 214 L420 200 L436 200 L436 188 L452 188 L452 214", o(s + 2, faint)));
    // the belt
    add(rc.line(22, BELT, 578, BELT, o(s))); add(rc.line(22, BELT + 22, 578, BELT + 22, o(s + 3)));
    add(rc.arc(22, BELT + 11, 22, 22, Math.PI / 2, Math.PI * 1.5, false, o(s + 4)));
    add(rc.arc(578, BELT + 11, 22, 22, -Math.PI / 2, Math.PI / 2, false, o(s + 5)));
    [125, 234, 340, 462].forEach((x, i) => { add(rc.line(x, BELT + 22, x - 8, BELT + 52, o(s + 6 + i))); add(rc.line(x, BELT + 22, x + 8, BELT + 52, o(s + 50 + i))); });
    add(rc.line(12, BELT + 54, 588, BELT + 54, o(s + 12, { stroke: "rgba(17,17,16,.35)" })));
    // Design: a sheet on an easel
    let x = ST[0].x;
    add(rc.rectangle(x - 30, 128, 50, 62, o(s + 13, { fill: "#fff", fillStyle: "solid" })));
    add(rc.line(x - 22, 190, x - 30, 214, o(s + 14))); add(rc.line(x + 12, 190, x + 20, 214, o(s + 15)));
    // Build: a workbench
    x = ST[1].x;
    add(rc.line(x - 36, 200, x + 36, 200, o(s + 16, { strokeWidth: 2.2 })));
    add(rc.line(x - 30, 200, x - 30, 214, o(s + 17))); add(rc.line(x + 30, 200, x + 30, 214, o(s + 18)));
    // Run: a server rack
    x = ST[2].x;
    add(rc.rectangle(x - 28, 132, 56, 80, o(s + 19, { fill: "#fff", fillStyle: "solid" })));
    [150, 170, 190].forEach((y, i) => add(rc.line(x - 28, y, x + 28, y, o(s + 20 + i))));
    [141, 161, 181, 201].forEach((y, i) => add(rc.line(x - 20, y, x + 4, y, o(s + 23 + i, { strokeWidth: 1 }))));
    // Check: a little booth with a striped roof
    x = ST[3].x;
    add(rc.line(x + 40, 214, x + 40, 118, o(s + 27))); add(rc.line(x + 92, 214, x + 92, 118, o(s + 28)));
    add(rc.polygon([[x + 32, 120], [x + 66, 96], [x + 100, 120]], o(s + 29, { fill: RED, fillStyle: "zigzag", hachureGap: 5 })));
    // Ship: a launch ramp and a flag
    x = ST[4].x;
    add(rc.polygon([[x - 34, 214], [x + 44, 214], [x + 44, 184]], o(s + 30, { fill: "rgba(17,17,16,.12)", fillStyle: "hachure", hachureGap: 5 })));
    add(rc.line(x + 44, 214, x + 44, 128, o(s + 31)));
    return g;
  });
  ST.forEach(({ k, x }) => text(x, BELT + 44, k, 20, INK));
  text(24, 34, "the checkpoint", 26, INK, svg, "start");
  text(24, 54, "every product, every time", 16, "#6b6861", svg, "start");
  const counter = text(W - 24, H - 14, "shipped 0 / 8", 19, RED, svg, "end");

  /* ---------- layer 3: the moving parts ---------- */
  const beltRun = mk("line", { x1: 26, y1: BELT + 4, x2: 574, y2: BELT + 4, stroke: INK, "stroke-width": 1.2, "stroke-dasharray": "3 12", opacity: 0.55 });
  const RX = [60, 160, 260, 360, 460, 540];
  const rollers = RX.map((x, i) => { const g = mk("g", { transform: `translate(${x},${BELT + 11})` });
    g.appendChild(rc.circle(0, 0, 14, o(60 + i, { strokeWidth: 1.2 }))); g.appendChild(rc.line(-6, 0, 6, 0, o(70 + i, { strokeWidth: 1 }))); g.appendChild(rc.line(0, -6, 0, 6, o(80 + i, { strokeWidth: 1 }))); return g; });
  // Design: the sketch and the pencil that draws it
  const sx = ST[0].x;
  const sketch = rc.path(`M${sx - 22} 176 C ${sx - 14} 146, ${sx - 2} 170, ${sx + 4} 150 S ${sx + 12} 170, ${sx + 12} 140`, o(90, { stroke: RED, strokeWidth: 2 }));
  svg.appendChild(sketch);
  const sketchPaths = [...sketch.querySelectorAll("path")], sketchLen = sketchPaths[0].getTotalLength();
  const setSketch = (k) => sketchPaths.forEach((p) => { p.style.strokeDasharray = sketchLen; p.style.strokeDashoffset = sketchLen * (1 - k); });
  setSketch(0);
  const pencil = mk("g", {});
  pencil.appendChild(rc.polygon([[0, 0], [30, -30], [38, -22], [8, 8]], o(91, { fill: "#ffcf5a", fillStyle: "solid" })));
  pencil.appendChild(rc.polygon([[0, 0], [8, 8], [-7, 13]], o(92, { fill: INK, fillStyle: "solid" })));
  const pencilAt = (x, y, r) => pencil.setAttribute("transform", `translate(${x},${y}) rotate(${r || 0})`);
  pencilAt(sx + 20, 132, 0);
  // Build: two gears
  const gear = (r, seed) => { const g = mk("g", {}); g.appendChild(rc.circle(0, 0, r * 2, o(seed, { fill: "#fff", fillStyle: "solid" }))); g.appendChild(rc.circle(0, 0, r * 0.7, o(seed + 1)));
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.appendChild(rc.line(Math.cos(a) * r, Math.sin(a) * r, Math.cos(a) * (r + 7), Math.sin(a) * (r + 7), o(seed + 2 + i, { strokeWidth: 2.4 }))); } return g; };
  const gearA = gear(17, 100), gearB = gear(11, 120), gA = { r: 0 }, gB = { r: 0 };
  const placeGears = () => { gearA.setAttribute("transform", `translate(${ST[1].x - 12},160) rotate(${gA.r})`); gearB.setAttribute("transform", `translate(${ST[1].x + 20},178) rotate(${gB.r})`); };
  placeGears();
  // Run: three lights and a spark
  const leds = [141, 161, 181].map((y) => mk("circle", { cx: ST[2].x + 17, cy: y, r: 3.4, fill: RED, opacity: 0.35 }));
  const bolt = rc.polygon([[ST[2].x + 40, 112], [ST[2].x + 30, 132], [ST[2].x + 40, 132], [ST[2].x + 30, 152]], o(130, { stroke: RED, strokeWidth: 2 }));
  bolt.style.opacity = 0; svg.appendChild(bolt);
  // Ship: a flag that runs up the pole and flaps, and a runway light by the ramp
  const flag = mk("g", {}), flagUp = { k: 0 }; let flagFast = false;
  flag.appendChild(rc.polygon([[0, 0], [34, 9], [0, 18]], o(135, { fill: RED, fillStyle: "solid", stroke: INK, strokeWidth: 1.3 })));
  const padLight = mk("circle", { cx: ST[4].x - 30, cy: 208, r: 4, fill: RED, opacity: 0.3 });
  const placeFlag = (t) => { const top = 128 + (1 - flagUp.k) * 26, wave = 1 + Math.sin(t * (flagFast ? 14 : 4)) * (flagFast ? 0.18 : 0.08);
    flag.setAttribute("transform", `translate(${ST[4].x + 44},${top}) scale(${-wave},1)`); };
  placeFlag(0);
  // Check: the inspector (me), with a magnifier
  const IX = ST[3].x + 66, insp = mk("g", {}), head = mk("g", {}, insp);
  head.appendChild(rc.circle(0, 0, 26, o(140, { fill: "#fff", fillStyle: "solid" })));
  mk("circle", { cx: -4, cy: -2, r: 1.8, fill: INK }, head); mk("circle", { cx: 5, cy: -2, r: 1.8, fill: INK }, head);
  head.appendChild(rc.arc(0, 4, 10, 7, 0, Math.PI, false, o(141, { strokeWidth: 1.4 })));
  insp.appendChild(rc.line(0, 13, 0, 48, o(142))); insp.appendChild(rc.line(0, 48, -9, 72, o(143))); insp.appendChild(rc.line(0, 48, 9, 72, o(144)));
  insp.appendChild(rc.line(0, 24, 14, 38, o(145)));
  const arm = mk("g", {}, insp);
  arm.appendChild(rc.line(0, 24, -26, 36, o(146))); arm.appendChild(rc.circle(-36, 40, 18, o(147, { strokeWidth: 2 })));
  const ip = { y: 0, h: 0, a: 0 };
  const placeInsp = () => { insp.setAttribute("transform", `translate(${IX},${140 + ip.y})`); about(head, 0, 0, 1, ip.h); about(arm, 0, 24, 1, ip.a); };
  placeInsp();
  // the box: its position is set by hand, how it looks by GSAP
  const box = mk("g", {}), boxIn = mk("g", {}, box);
  boxIn.appendChild(rc.rectangle(-46, -30, 92, 30, o(3, { fill: "#fff", fillStyle: "solid" })));
  boxIn.appendChild(rc.line(-46, -30, -34, -40, o(4))); boxIn.appendChild(rc.line(46, -30, 34, -40, o(5)));
  const boxName = text(0, -9, "", 17, INK, boxIn);
  const bug = mk("g", { opacity: 0 }, boxIn);
  bug.appendChild(rc.ellipse(22, -34, 14, 10, o(150, { fill: INK, fillStyle: "solid" })));
  [[16, -40, 12, -45], [16, -28, 12, -23], [28, -40, 32, -45], [28, -28, 32, -23]].forEach(([a, b, c, d], i) => bug.appendChild(rc.line(a, b, c, d, o(151 + i, { strokeWidth: 1 }))));
  const stamp = mk("g", { opacity: 0 }, boxIn);
  stamp.appendChild(rc.circle(40, -34, 22, o(9, { stroke: RED, fill: RED, fillStyle: "solid", roughness: 1 })));
  stamp.appendChild(rc.linearPath([[32, -34], [38, -28], [48, -41]], o(9, { stroke: "#fff", strokeWidth: 2.4, roughness: 0.8 })));
  const nope = text(IX - 8, 106, "not yet!", 24, RED); nope.setAttribute("opacity", 0);
  const zap = text(ST[1].x, 120, "zap!", 26, RED); zap.setAttribute("opacity", 0);
  const confetti = mk("g", {});
  const plane = mk("g", { opacity: 0 });
  plane.appendChild(rc.polygon([[-24, 4], [24, -9], [-6, 13]], o(160, { fill: RED, fillStyle: "hachure", hachureGap: 3.5, fillWeight: 1.2 })));
  plane.appendChild(rc.polygon([[-6, 13], [24, -9], [-2, 22]], o(161, { fill: "#fff", fillStyle: "solid" })));
  const route = mk("path", { fill: "none", stroke: "none" });
  const trail = mk("polyline", { fill: "none", stroke: INK, "stroke-width": 1.4, "stroke-dasharray": "5 6", opacity: 0, "stroke-linecap": "round" });

  const pos = { x: ST[3].x, y: BELT };
  const place = () => box.setAttribute("transform", `translate(${pos.x},${pos.y})`);
  const cloudTick = (dt) => clouds.forEach((c, i) => { const p = cloudPos[i]; p.x += p.v * dt; if (p.x > W + 10) p.x = -80; c.setAttribute("transform", `translate(${p.x},${p.y})`); });
  cloudTick(0);

  if (REDUCED || !window.gsap) { // still frame: the last product, checked
    boxName.textContent = NAMES[7]; stamp.setAttribute("opacity", 1); place(); counter.textContent = "shipped 8 / 8";
    setSketch(1); leds.forEach((l) => l.setAttribute("opacity", 1)); return;
  }
  const { gsap } = window;

  /* ---------- the always-on life: boil, clouds, sun, gears, belt ---------- */
  let bi = 0, drawn = false, live = false, last = performance.now(), boilAcc = 0, beltOff = 0, belting = false;
  gsap.ticker.add(() => {
    if (!live) return;
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    cloudTick(dt); placeFlag(now / 1000);
    sun.setAttribute("transform", `rotate(${(now / 90) % 360} 250 58)`);
    gA.r += dt * (belting ? 140 : 18); gB.r -= dt * (belting ? 210 : 27); placeGears();
    if (belting) { beltOff -= dt * 70; beltRun.setAttribute("stroke-dashoffset", beltOff); rollers.forEach((r, i) => r.setAttribute("transform", `translate(${RX[i]},${BELT + 11}) rotate(${-beltOff * 3})`)); }
    boilAcc += dt; if (drawn && boilAcc > 0.19) { boilAcc = 0; variants[bi].style.display = "none"; bi = (bi + 1) % 3; variants[bi].style.display = ""; }
  });

  /* ---------- one trip down the belt ---------- */
  let checked = 0;
  const burst = () => { // red confetti and a few ink stars
    for (let i = 0; i < 16; i++) {
      const c = i % 4 === 0 ? rc.path("M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8 Z", o(170 + i, { fill: INK, fillStyle: "solid", strokeWidth: 1 }))
        : mk("circle", { r: (2.4 + Math.random() * 2.4).toFixed(1), fill: i % 3 ? RED : INK }, confetti);
      confetti.appendChild(c);
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, v = 60 + Math.random() * 70, st = { x: pos.x + 20, y: pos.y - 40, r: 0 };
      const put = () => c.setAttribute("transform", `translate(${st.x},${st.y}) rotate(${st.r})`);
      gsap.to(st, { x: st.x + Math.cos(a) * v, y: st.y + Math.sin(a) * v, r: Math.random() * 360, duration: 0.9, ease: "power2.out", onUpdate: put,
        onComplete: () => gsap.to(st, { y: st.y + 40, duration: 0.6, ease: "power1.in", onUpdate: put, onComplete: () => c.remove() }) });
      gsap.to(c, { opacity: 0, duration: 0.5, delay: 1.0 });
    }
  };
  const flyOff = () => {
    const x0 = pos.x, y0 = pos.y - 24;
    // up, a loop the loop, then away over the clouds
    const d = `M${x0} ${y0} C ${x0 + 10} ${y0 - 70}, ${x0 - 70} ${y0 - 110}, ${x0 - 70} ${y0 - 160} C ${x0 - 70} ${y0 - 220}, ${x0 + 20} ${y0 - 215}, ${x0 + 10} ${y0 - 165} C ${x0} ${y0 - 120}, ${x0 - 130} ${y0 - 140}, ${x0 - 250} ${y0 - 170} S -60 40, -70 -40`;
    route.setAttribute("d", d); const len = route.getTotalLength();
    trail.setAttribute("points", ""); trail.setAttribute("opacity", 0.45); plane.setAttribute("opacity", 1);
    const pt = { t: 0 };
    gsap.to(pt, { t: 1, duration: 2.8, ease: "power1.inOut", onUpdate: () => {
      const at = pt.t * len, p = route.getPointAtLength(at), q = route.getPointAtLength(Math.min(len, at + 2)), pts = [];
      for (let l = Math.max(0, at - 280); l <= at; l += 6) { const r = route.getPointAtLength(l); pts.push(r.x.toFixed(1) + "," + r.y.toFixed(1)); }
      trail.setAttribute("points", pts.join(" "));
      plane.setAttribute("transform", `translate(${p.x},${p.y}) rotate(${Math.atan2(q.y - p.y, q.x - p.x) * 57.3 + 20})`);
    }, onComplete: () => { plane.setAttribute("opacity", 0); gsap.to(trail, { attr: { opacity: 0 }, duration: 0.5 }); } });
  };
  const trip = (n) => {
    const name = NAMES[n % NAMES.length], fails = n % 3 === 1; // every third product is sent back once: that happens
    const tl = gsap.timeline();
    const move = (x, dur) => tl.call(() => (belting = true)).to(pos, { x, duration: dur || 1.0, ease: "power2.inOut", onUpdate: place }).call(() => (belting = false));
    tl.call(() => { boxName.textContent = name; stamp.setAttribute("opacity", 0); bug.setAttribute("opacity", 0); pos.x = 40; pos.y = BELT; place(); setSketch(0); })
      .fromTo(boxIn, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.6, ease: "bounce.out" });
    // Design: the pencil sketches
    move(ST[0].x, 0.9);
    const pd = { t: 0 };
    tl.to(pd, { t: 1, duration: 0.9, ease: "none", onUpdate: () => {
      setSketch(pd.t); const pp = sketchPaths[0].getPointAtLength(sketchLen * pd.t); pencilAt(pp.x - 1, pp.y - 1, Math.sin(pd.t * 30) * 6);
    } }).call(() => pencilAt(sx + 20, 132, 0));
    // Build: the box rattles on the bench while the gears race
    const build = () => { move(ST[1].x); tl.call(() => (belting = true)).to(pos, { y: BELT - 5, duration: 0.1, yoyo: true, repeat: 5, onUpdate: place }).call(() => (belting = false)); };
    // Run: the lights race and a spark jumps
    const run = () => { move(ST[2].x);
      tl.to(leds, { attr: { opacity: 1 }, duration: 0.08, stagger: { each: 0.08, repeat: 5, yoyo: true } })
        .to(bolt, { opacity: 1, duration: 0.1 }, "<").to(bolt, { opacity: 0, duration: 0.3 }, ">0.3").set(leds, { attr: { opacity: 0.35 } }); };
    // Check: the magnifier goes over it
    const check = () => { move(ST[3].x); tl.to(ip, { a: -16, duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut", onUpdate: placeInsp }); };
    build(); run(); check();
    if (fails) {
      const bg = { s: 0 };
      tl.set(bug, { attr: { opacity: 1 } }).to(bg, { s: 1, duration: 0.35, ease: "back.out(3)", onUpdate: () => about(bug, 22, -34, bg.s) })
        .to(ip, { h: 14, duration: 0.12, yoyo: true, repeat: 5, onUpdate: placeInsp }, "<")
        .to(nope, { attr: { opacity: 1 }, duration: 0.15 }, "<").to({}, { duration: 0.5 })
        // back to Build, in a hop
        .call(() => (belting = true))
        .to(pos, { x: ST[1].x, duration: 1.1, ease: "power2.inOut", onUpdate: place })
        .to(pos, { keyframes: [{ y: BELT - 60, duration: 0.55, ease: "power2.out" }, { y: BELT, duration: 0.55, ease: "power2.in" }], onUpdate: place }, "<")
        .to(nope, { attr: { opacity: 0 }, duration: 0.3 }, "<0.3").call(() => (belting = false))
        .set(zap, { attr: { opacity: 1 } }).fromTo(zap, { scale: 0.4 }, { scale: 1.25, svgOrigin: `${ST[1].x} 114`, duration: 0.3, ease: "back.out(3)" })
        .to(bg, { s: 0, duration: 0.2, onUpdate: () => about(bug, 22, -34, bg.s) }, "<0.1")
        .to(zap, { attr: { opacity: 0 }, duration: 0.3 }, ">0.3");
      run(); check();
    }
    // pass: the red dot and a happy inspector; then on to Ship, where the flag goes up and it flies
    const sp = { s: 2.4 };
    tl.set(stamp, { attr: { opacity: 1 } }).to(sp, { s: 1, duration: 0.4, ease: "back.out(3)", onUpdate: () => about(stamp, 40, -34, sp.s) })
      .to(ip, { y: -16, duration: 0.18, yoyo: true, repeat: 3, ease: "power2.out", onUpdate: placeInsp }, "<")
      .to({}, { duration: 0.3 });
    move(ST[4].x, 0.9);
    tl.to(flagUp, { k: 1, duration: 0.5, ease: "back.out(2)" }).call(() => (flagFast = true))
      .to(padLight, { attr: { opacity: 1 }, duration: 0.08, repeat: 5, yoyo: true }, "<")
      .call(burst)
      .call(() => { checked = Math.min(8, checked + 1); counter.textContent = `shipped ${checked} / 8`; })
      .to({}, { duration: 0.4 })
      .to(boxIn, { opacity: 0, scaleY: 0.2, transformOrigin: "50% 100%", duration: 0.25 })
      .call(flyOff)
      .set(boxIn, { scaleY: 1 })
      .to({}, { duration: 1.6 }).call(() => (flagFast = false)).to(flagUp, { k: 0, duration: 0.6 })
      .to({}, { duration: 1.0 });
    return tl;
  };

  /* ---------- the loop: all eight, then start again ---------- */
  let n = 0, cur = null, started = false;
  const next = () => { if (n > 0 && n % 8 === 0) { checked = 0; counter.textContent = "shipped 0 / 8"; } cur = trip(n++); cur.eventCallback("onComplete", next); if (!live) cur.pause(); };
  const drawIn = () => {
    const paths = [...variants[0].querySelectorAll("path")];
    paths.forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    return gsap.to(paths, { strokeDashoffset: 0, duration: 1.2, ease: "power2.out", stagger: 0.006, onComplete: () => paths.forEach((p) => { p.style.strokeDasharray = ""; p.style.strokeDashoffset = ""; }) });
  };
  gsap.set(boxIn, { opacity: 0 }); pos.x = 40; place();
  new IntersectionObserver((es) => es.forEach((e) => {
    live = e.isIntersecting; last = performance.now();
    if (live && !started) { started = true; drawIn().eventCallback("onComplete", () => { drawn = true; next(); }); }
    if (cur) live ? cur.resume() : cur.pause();
  }), { threshold: 0.2 }).observe(host);
})();
