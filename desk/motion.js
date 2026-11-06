// The desk comes alive: depth as you look around, an agent at work, the lamp as day and night,
// objects that lift when you point at them and unfold into a paper card when you click.
(() => {
  "use strict";
  const D = window.DESK, B = window.BOARD;
  const $ = (s, r = document) => r.querySelector(s);
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const FLIGHT = { forge: "VV 101", lab: "VV 102", farm: "VV 103", radar: "VV 104", pdf: "VV 105", conxto: "VV 106", folio: "VV 107", trading: "VV 108" };
  const flight = (code) => B.flights.find((f) => f.flight === code);

  // ---------- looking around: each plane drifts by its own depth ----------
  const planes = [...document.querySelectorAll("#desk .plane")].map((g) => ({ g, k: +g.dataset.k }));
  let tx = 0, ty = 0, x = 0, y = 0, lastMove = 0;
  addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1; lastMove = performance.now();
  }, { passive: true });

  // ---------- my agent: walks between the exam and the laptop, carrying a page ----------
  const walker = $("#robot"), legs = [...document.querySelectorAll("#robot .leg")];
  const path = [{ at: 30, hold: 1800 }, { at: -70, hold: 2600 }]; // offsets from where it stands
  let leg = 0, rx = 30, target = 0, holdUntil = 0, facing = 1;

  function frame(now) {
    if (!REDUCED) {
      const idle = now - lastMove > 4000;
      const gx = idle ? Math.sin(now / 5200) * 0.35 : tx, gy = idle ? Math.cos(now / 6100) * 0.2 : ty;
      x += (gx - x) * 0.06; y += (gy - y) * 0.06;
      planes.forEach(({ g, k }) => { g.style.transform = `translate(${(-x * 16 * k).toFixed(2)}px, ${(-y * 9 * k).toFixed(2)}px)`; });

      const goal = path[target].at;
      if (now > holdUntil) {
        const d = goal - rx;
        if (Math.abs(d) < 0.6) { holdUntil = now + path[target].hold; target = (target + 1) % path.length; }
        else {
          rx += Math.sign(d) * 0.55; facing = Math.sign(d);
          leg += 0.22;
        }
      }
      const walking = now > holdUntil;
      walker.style.transform = `translate(${rx.toFixed(1)}px, ${walking ? (-Math.abs(Math.sin(leg)) * 3).toFixed(1) : 0}px)`;
      legs.forEach((l, i) => { l.style.transform = walking ? `translateY(${(Math.sin(leg + i * Math.PI) * 3).toFixed(1)}px)` : ""; });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------- the lamp: day and night ----------
  const lampBtn = $("#lamp-btn");
  function setDay(day) {
    document.body.classList.toggle("day", day);
    lampBtn.setAttribute("aria-pressed", String(!day));
    $("#lamp-state").textContent = day ? "Day" : "Evening";
    try { localStorage.setItem("desk-day", day ? "1" : "0"); } catch (e) {}
  }
  lampBtn.addEventListener("click", () => setDay(!document.body.classList.contains("day")));
  try { if (localStorage.getItem("desk-day") === "1") setDay(true); } catch (e) {}

  // ---------- pointing at things: they lift, and say their one line ----------
  const tip = $("#tip");
  function showTip(id) {
    const lab = document.querySelector(`#desk .label[data-item="${id}"]`);
    if (!lab) { tip.hidden = true; return; }
    const r = lab.getBoundingClientRect();
    tip.textContent = lab.dataset.line;
    tip.hidden = false;
    tip.style.left = r.left + r.width / 2 + "px";
    tip.style.top = r.bottom + 6 + "px";
  }
  document.querySelectorAll("#desk .obj, #desk .label").forEach((g) => {
    const id = g.dataset.item;
    const lift = (on) => document.querySelectorAll(`#desk [data-item="${id}"]`).forEach((n) => n.classList.toggle("up", on));
    g.addEventListener("pointerenter", () => { lift(true); showTip(id); });
    g.addEventListener("pointerleave", () => { lift(false); tip.hidden = true; });
    g.addEventListener("focus", () => { lift(true); showTip(id); });
    g.addEventListener("blur", () => { lift(false); tip.hidden = true; });
    g.addEventListener("click", () => act(id));
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(id); } });
  });

  // the email on the name tag is a plain link: it writes to me, it does not also open the card
  const mailLink = document.querySelector("#desk .tag-mail");
  if (mailLink) ["click", "keydown"].forEach((t) => mailLink.addEventListener(t, (e) => e.stopPropagation()));

  // products with a world of their own: the desk zooms into the object, and the world opens
  const WORLDS = {
    forge: { href: "w/forge.html", color: "#1f2a44" }, lab: { href: "w/lab.html", color: "#dfe7df" },
    farm: { href: "w/farm.html", color: "#f6dcb6" }, radar: { href: "w/radar.html", color: "#bfe0ea" },
    pdf: { href: "w/pdf.html", color: "#efe2cc" }, conxto: { href: "w/conxto.html", color: "#3d5a80" },
    folio: { href: "w/folio.html", color: "#f4ecdc" }, trading: { href: "w/trading.html", color: "#101a33" },
  };
  function enter(id) {
    const w = WORLDS[id], obj = document.querySelector(`#desk .obj[data-item="${id}"]`);
    if (REDUCED || !obj) { location.href = w.href; return; }
    const r = obj.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const scene = $("#desk");
    scene.style.transformOrigin = `${cx}px ${cy}px`;
    scene.animate([{ transform: "scale(1)" }, { transform: "scale(3.2)" }], { duration: 700, easing: "cubic-bezier(.6,0,.4,1)", fill: "forwards" });
    const veil = el("div", "veil"); veil.style.background = w.color;
    veil.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
    document.body.appendChild(veil);
    veil.animate([{ clipPath: `circle(0px at ${cx}px ${cy}px)` }, { clipPath: `circle(${Math.hypot(innerWidth, innerHeight)}px at ${cx}px ${cy}px)` }], { duration: 650, delay: 250, easing: "cubic-bezier(.6,0,.4,1)", fill: "forwards" })
      .onfinish = () => { location.href = w.href; };
  }
  // coming back from a world: undo the zoom
  addEventListener("pageshow", () => { $("#desk").getAnimations().forEach((a) => a.cancel()); document.querySelectorAll(".veil").forEach((v) => v.remove()); });

  function act(id) {
    if (id === "lamp") return setDay(!document.body.classList.contains("day"));
    if (id === "robot") return say("I do the hands. He checks it, and he signs it.");
    if (WORLDS[id]) return enter(id);
    open(id);
  }

  // the agent talks back
  const bubble = $("#bubble");
  let sayT = 0;
  function say(text) {
    const r = walker.getBoundingClientRect();
    bubble.textContent = text;
    bubble.hidden = false;
    bubble.style.left = r.left + r.width / 2 + "px";
    bubble.style.top = r.top - 10 + "px";
    clearTimeout(sayT); sayT = setTimeout(() => (bubble.hidden = true), 3200);
  }

  // ---------- the paper card ----------
  const wrap = $("#card"), body = $("#c-body");
  let openId = null, lastFocus = null, pushed = false;

  function viewer(shots, title) {
    const box = el("figure", "shots");
    const img = el("img"); img.decoding = "async";
    const cap = el("figcaption");
    const ctl = el("div", "shot-ctl");
    const prev = el("button", "shot-btn", "‹"), next = el("button", "shot-btn", "›"), n = el("span", "shot-n");
    prev.type = next.type = "button"; prev.setAttribute("aria-label", "Previous screen"); next.setAttribute("aria-label", "Next screen");
    ctl.append(prev, n, next);
    box.append(img, cap, ctl);
    let k = 0;
    const show = (i) => {
      k = (i + shots.length) % shots.length;
      img.src = "shots/" + shots[k][0].split("/").pop(); img.alt = title + ": " + shots[k][1];
      cap.textContent = shots[k][1]; n.textContent = `${k + 1} / ${shots.length}`;
      new Image().src = "shots/" + shots[(k + 1) % shots.length][0].split("/").pop();
    };
    prev.addEventListener("click", () => show(k - 1)); next.addEventListener("click", () => show(k + 1));
    box.step = (d) => show(k + d);
    if (shots.length < 2) ctl.hidden = true;
    show(0);
    return box;
  }
  const list = (items, cls) => { const ul = el("ul", cls); items.forEach((t) => ul.appendChild(el("li", null, t))); return ul; };

  function productCard(id) {
    const f = flight(FLIGHT[id]);
    const frag = document.createDocumentFragment();
    const head = el("header", "c-head");
    head.append(el("p", "c-kicker", f.status === "LIVE" ? "Live" : f.status === "BOARDING" ? "Live, not announced yet" : "Research · paper only"), el("h2", null, f.title));
    head.querySelector("h2").id = "c-title";
    head.appendChild(el("p", "c-line", f.line));
    const grid = el("div", "c-grid");
    const left = el("div", "c-left"); left.appendChild(viewer(f.shots, f.title));
    const right = el("div", "c-right");
    right.append(el("h3", null, "The plan"), el("p", null, f.plan), el("h3", null, "What I built"), list(f.built));
    if (f.checks) { right.append(el("h3", null, "Checks it passed"), list(f.checks, "checks")); }
    const links = el("p", "c-links");
    f.links.forEach(([label, href], i) => { const a = el("a", i ? "" : "primary", label + " ↗"); a.href = href; a.target = "_blank"; a.rel = "noopener"; links.appendChild(a); });
    right.appendChild(links);
    grid.append(left, right);
    frag.append(head, grid);
    return frag;
  }

  function binCard() {
    const frag = document.createDocumentFragment();
    const head = el("header", "c-head");
    const h = el("h2", null, "Withdrawn"); h.id = "c-title";
    head.append(el("p", "c-kicker", "From the bin"), h, el("p", "c-line", "Two claims my own checks stopped. They stay here, uncrumpled, on purpose."));
    frag.appendChild(head);
    const grid = el("div", "c-grid two");
    ["VV 109", "VV 110"].forEach((code) => {
      const f = flight(code), s = el("section", "sheet-out");
      s.append(el("h3", null, f.title), el("p", null, f.line));
      const nums = el("div", "nums");
      f.numbers.forEach(([n, l]) => { const d = el("div"); d.append(el("b", null, n), el("span", null, l)); nums.appendChild(d); });
      s.append(nums, list(f.built));
      grid.appendChild(s);
    });
    frag.appendChild(grid);
    return frag;
  }

  function meCard() {
    const frag = document.createDocumentFragment();
    const head = el("header", "c-head");
    const h = el("h2", null, D.person.name); h.id = "c-title";
    head.append(el("p", "c-kicker", "About me"), h, el("p", "c-line", D.person.role));
    const grid = el("div", "c-grid two");
    const facts = el("section"); facts.appendChild(el("h3", null, "The facts"));
    const dl = el("dl", "facts"); B.passenger.forEach(([k, v]) => dl.append(el("dt", null, k), el("dd", null, v))); facts.appendChild(dl);
    const how = el("section"); how.appendChild(el("h3", null, "How I work"));
    B.crew.forEach(([t, p]) => { const d = el("div", "how"); d.append(el("b", null, t), el("p", null, p)); how.appendChild(d); });
    grid.append(facts, how);
    const cta = el("p", "c-links");
    const a = el("a", "primary", "Write to me · " + D.person.email); a.href = "mailto:" + D.person.email; cta.appendChild(a);
    frag.append(head, grid, cta);
    return frag;
  }

  function open(id) {
    lastFocus = document.activeElement;
    openId = id;
    body.replaceChildren(id === "bin" ? binCard() : id === "me" ? meCard() : productCard(id));
    wrap.hidden = false;
    requestAnimationFrame(() => wrap.classList.add("open"));
    if (!pushed) { history.pushState({ card: id }, "", "#" + id); pushed = true; }
    $(".c-x", wrap).focus({ preventScroll: true });
    tip.hidden = true;
  }
  function close(fromHistory) {
    if (!openId) return;
    openId = null;
    wrap.classList.remove("open");
    setTimeout(() => { if (!openId) wrap.hidden = true; }, REDUCED ? 0 : 320);
    if (pushed && !fromHistory) { pushed = false; history.back(); } else pushed = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  wrap.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(false); });
  addEventListener("popstate", () => { if (openId) close(true); });
  addEventListener("keydown", (e) => {
    if (!openId) return;
    if (e.key === "Escape") close(false);
    const v = $(".shots", body);
    if (v && (e.key === "ArrowRight" || e.key === "ArrowLeft")) v.step(e.key === "ArrowRight" ? 1 : -1);
  });
  // a shared link opens straight onto its card
  const start = location.hash.slice(1);
  if (start && WORLDS[start]) location.replace(WORLDS[start].href); // old card links go to the product's world
  else if (start === "bin" || start === "me") { history.replaceState(null, "", location.pathname); open(start); }
})();
