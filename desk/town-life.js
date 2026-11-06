// The town comes to life: the intro cuts it out of a blank sheet, then every district keeps working.
(() => {
  "use strict";
  const T = window.Town, H = T.H, pan = document.getElementById("pan");
  const NS = "http://www.w3.org/2000/svg";
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const params = new URLSearchParams(location.search);
  const STILL = params.has("frame");
  const svgEl = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const ease = (x) => 1 - Math.pow(1 - x, 3);

  // ---------- the intro: cut the town out of a blank sheet ----------
  const store = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  const wantIntro = !STILL && !REDUCED && !document.hidden && (params.has("intro") || store.get("town-intro") !== "1");
  const sheet = document.getElementById("sheet"), ss = document.getElementById("sheet-svg");
  function signsIn(now) {
    T.svg.querySelectorAll(".district").forEach((g, i) => { g.style.setProperty("--i", i); if (!now) g.classList.add("drop-in"); });
    document.body.classList.remove("intro");
  }
  if (wantIntro) {
    store.set("town-intro", "1");
    document.body.classList.add("intro");
    sheet.hidden = false;
    const w = innerWidth, h = innerHeight;
    ss.setAttribute("viewBox", `0 0 ${w} ${h}`);
    let d = `M0 ${h * 0.7}`, x = 0;
    while (x < w) { const bw = 30 + ((x * 7919) % 70), bh = h * (0.5 + (((x * 104729) % 100) / 100) * 0.16); d += ` L${x} ${bh} L${x + bw} ${bh}`; x += bw; }
    d += ` L${w} ${h * 0.6}`;
    const guide = svgEl("path", { d, class: "guide" }, ss), total = guide.getTotalLength();
    const done = svgEl("path", { d, class: "done" }, ss);
    const sc = svgEl("g", {}, ss), bladeA = svgEl("path", { d: "M0 0 L46 -10 L48 -4 Z", fill: "#c9ced6" }, sc), bladeB = svgEl("path", { d: "M0 0 L46 10 L48 4 Z", fill: "#aeb4bd" }, sc);
    svgEl("circle", { cx: -14, cy: -10, r: 11, fill: "none", stroke: "#d8412f", "stroke-width": 5 }, sc);
    svgEl("circle", { cx: -14, cy: 10, r: 11, fill: "none", stroke: "#d8412f", "stroke-width": 5 }, sc);
    const pts = [];
    for (let l = 0; l <= total; l += 5) { const q = guide.getPointAtLength(l); pts.push([q.x, q.y]); }
    let start = null, finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      sheet.style.clipPath = "none";
      sheet.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(-105%) rotate(-5deg)", opacity: 1 }], { duration: 850, easing: "cubic-bezier(.6,0,.3,1)", fill: "forwards" }).onfinish = () => { sheet.hidden = true; };
      setTimeout(() => signsIn(false), 350);
    };
    const CUT = 2300;
    function cutFrame(now) {
      if (finished) return;
      if (start == null) start = now;
      const t = Math.min(1, Math.max(0, (now - start - 500) / CUT)), k = ease(t);
      const n = Math.max(1, Math.floor(k * (pts.length - 1))), p = pts[n];
      done.setAttribute("stroke-dasharray", `${(k * total).toFixed(1)} 99999`);
      const snip = Math.abs(Math.sin(now / 70)) * 14;
      bladeA.setAttribute("transform", `rotate(${-snip})`); bladeB.setAttribute("transform", `rotate(${snip})`);
      sc.setAttribute("transform", `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(8)`);
      const poly = pts.slice(0, n + 1).map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join(" L");
      sheet.style.clipPath = `path(evenodd, "M0 0 H${w} V${h} H0 Z M0 ${h} L${poly} L${p[0].toFixed(1)} ${h} Z")`;
      if (t >= 1) setTimeout(finish, 150); else requestAnimationFrame(cutFrame);
    }
    requestAnimationFrame(cutFrame);
    const skip = () => finish();
    sheet.addEventListener("click", skip);
    addEventListener("keydown", skip, { once: true });
  } else if (!STILL) {
    signsIn(true);
  }

  if (STILL || REDUCED) return;

  // ---------- life: every district keeps working ----------
  const road = T.road, rlen = road.getTotalLength();
  const postings = [...document.querySelectorAll(".posting")].map((p, k) => ({ p, k, x: 1790 + k * 60 }));
  const plane = document.querySelector(".folio-plane");
  const scale = () => T.svg.getBoundingClientRect().width / T.WIDTH;
  let prev = performance.now(), t0 = prev, chainClock = 0, shown = 0;
  function frame(now) {
    const dt = Math.max(0, Math.min(0.05, (now - prev) / 1000)), t = Math.max(0, (now - t0) / 1000); prev = now;
    if (!document.hidden) {
      // walking gives depth: the sky and the hills move slower than the town
      const sx = pan.scrollLeft / scale();
      const L = window.TownLight || { x: 0.5, y: 0.3 }, ox = (0.5 - L.x) * 40, oy = (0.3 - L.y) * 16;
      T.P.sky.setAttribute("transform", `translate(${(sx * 0.55 + ox * 0.3).toFixed(1)} ${(oy * 0.3).toFixed(1)})`);
      T.P.far.setAttribute("transform", `translate(${(sx * 0.3 + ox * 0.6).toFixed(1)} ${(oy * 0.6).toFixed(1)})`);
      T.P.mid.setAttribute("transform", `translate(${(sx * 0.1 + ox * 0.85).toFixed(1)} ${(oy * 0.85).toFixed(1)})`);
      // the truck runs the road, farm to harbour and back
      const u = (t / 40) % 2, f = u < 1 ? u : 2 - u;
      const p = road.getPointAtLength(f * rlen);
      T.truck.setAttribute("transform", `translate(${p.x.toFixed(1)} ${(p.y + Math.sin(t * 16) * 0.8).toFixed(1)}) scale(${u < 1 ? -1 : 1} 1)`);
      // my name, towed across the whole town
      const bx = -300 + ((t * 70) % 3900);
      T.bannerPlane.setAttribute("transform", `translate(${bx.toFixed(1)} ${(96 + Math.sin(t * 0.7) * 10).toFixed(1)}) rotate(${(Math.sin(t * 0.7) * 2 - 2).toFixed(1)})`);
      plane.setAttribute("transform", `translate(${(760 + Math.cos(t * 0.8) * 90).toFixed(1)} ${(470 + Math.sin(t * 0.8) * 40).toFixed(1)}) rotate(${(t * 0.8 * 57.3 + 90) % 360})`);
      T.clouds.forEach((c) => { c.x += c.v * dt; if (c.x > 3300) c.x = 1000; c.c.setAttribute("transform", `translate(${c.x.toFixed(1)} ${c.y})`); });
      postings.forEach((q) => { const ph = ((t + q.k * 1.3) % 8) / 8; q.p.style.transform = `translate(${(q.x + Math.sin(t * 1.3 + q.k) * 24).toFixed(1)}px, ${(140 + ph * 560).toFixed(1)}px) rotate(${(Math.sin(t * 1.7 + q.k) * 25).toFixed(1)}deg)`; q.p.style.opacity = ph > 0.9 ? ((1 - ph) * 10).toFixed(2) : 1; });
      H.beam.setAttribute("transform", `rotate(${(Math.sin(t * 0.5) * 22).toFixed(1)} 180 342)`);
      H.sweep.setAttribute("transform", `rotate(${(Math.sin(t * 0.9) * 30).toFixed(1)} 1472 742)`);
      H.boat.setAttribute("transform", `translate(${(Math.sin(t * 0.3) * 30).toFixed(1)} ${(Math.sin(t * 1.4) * 4).toFixed(1)})`);
      chainClock += dt; if (chainClock > 1.1) { chainClock = 0; shown = shown >= 5 ? 1 : shown + 1; H.links.forEach((l, k) => (l.style.opacity = k < shown ? 1 : 0.15)); }
      let near = false;
      H.boxes.forEach((b, k) => { const bxp = 955 + ((t * 40 + k * 84) % 240); if (Math.abs(bxp - 1150) < 16) near = true; b.setAttribute("transform", `translate(${bxp.toFixed(1)} 0)`); });
      H.gateLamp.classList.toggle("on", near);
      H.pages.forEach((pg, k) => pg.setAttribute("transform", `translate(${(2218 + ((t * 36 + k * 80) % 240)).toFixed(1)} 0)`));
      H.press.setAttribute("transform", `translate(0 ${(Math.max(0, Math.sin(t * 3)) * 22).toFixed(1)})`);
      if (Math.random() < 0.04 && H.wins.length) H.wins[Math.floor(Math.random() * H.wins.length)].classList.toggle("off");
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------- About me and Withdrawn: paper cards over the town ----------
  const B = window.BOARD, P0 = window.DESK.person;
  const wrap = document.getElementById("card"), body = document.getElementById("c-body");
  let open = null, last = null;
  const list = (items) => { const ul = el("ul"); items.forEach((x) => ul.appendChild(el("li", null, x))); return ul; };
  function build(id) {
    const f = document.createDocumentFragment(), head = el("header", "c-head"), h = el("h2", null, id === "me" ? P0.name : "Withdrawn"); h.id = "c-title";
    if (id === "me") {
      head.append(el("p", "c-kicker", "About me"), h, el("p", "c-line", P0.role));
      const grid = el("div", "c-grid two"), a = el("section"), b = el("section");
      a.appendChild(el("h3", null, "The facts")); const dl = el("dl", "facts"); B.passenger.forEach(([k, v]) => dl.append(el("dt", null, k), el("dd", null, v))); a.appendChild(dl);
      b.appendChild(el("h3", null, "How I work")); B.crew.forEach(([t, p]) => { const d = el("div", "how"); d.append(el("b", null, t), el("p", null, p)); b.appendChild(d); });
      grid.append(a, b);
      const cta = el("p", "c-links"), m = el("a", "primary", "Write to me · " + P0.email); m.href = "mailto:" + P0.email; cta.appendChild(m);
      f.append(head, grid, cta);
    } else {
      head.append(el("p", "c-kicker", "What my own checks stopped"), h, el("p", "c-line", "Two claims that did not pass. They stay here on purpose."));
      const grid = el("div", "c-grid two");
      ["VV 109", "VV 110"].forEach((code) => {
        const x = B.flights.find((q) => q.flight === code), s = el("section", "sheet-out");
        s.append(el("h3", null, x.title), el("p", null, x.line));
        const nums = el("div", "nums"); x.numbers.forEach(([n, l]) => { const d = el("div"); d.append(el("b", null, n), el("span", null, l)); nums.appendChild(d); });
        s.append(nums, list(x.built)); grid.appendChild(s);
      });
      f.append(head, grid);
    }
    return f;
  }
  function show(id) { last = document.activeElement; open = id; body.replaceChildren(build(id)); wrap.hidden = false; requestAnimationFrame(() => wrap.classList.add("open")); wrap.querySelector(".c-x").focus(); }
  function hide() { if (!open) return; open = null; wrap.classList.remove("open"); setTimeout(() => { if (!open) wrap.hidden = true; }, 300); if (last && last.focus) last.focus(); }
  document.querySelectorAll("[data-card]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); show(a.dataset.card); }));
  wrap.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) hide(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  const hash = location.hash.slice(1);
  if (hash === "me" || hash === "bin") show(hash);
  else if (T.D[hash]) location.replace("w/" + hash + ".html");
})();
