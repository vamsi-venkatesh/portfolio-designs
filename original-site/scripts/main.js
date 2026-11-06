/* vamsivenkatesh.com — motion engine. Zero dependencies.
   Full cinematic motion is intentional; canvas pauses when the tab is hidden. */

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Agent constellation (hero canvas) ─────────────────────────────────
   Orbiting nodes (the "agents") around a soft center, linked when close.
   Warm gold on graphite, DPR-aware, capped for mobile. */
function constellation() {
  const canvas = document.getElementById("constellation");
  if (!canvas || REDUCED) return;
  const ctx = canvas.getContext("2d");
  let w, h, dpr, nodes = [], raf = null, running = false;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.parentElement.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    const isMobile = w < 760;
    const N = isMobile ? 26 : 52;
    const cx = w * (isMobile ? 0.5 : 0.72), cy = h * 0.42;
    nodes = [];
    for (let i = 0; i < N; i++) {
      const ring = 90 + Math.pow(i / N, 1.4) * Math.min(w, 900) * 0.52;
      nodes.push({
        cx, cy,
        r: ring * (0.55 + ((i * 2654435761) % 1000) / 2200),
        a: ((i * 137.508) % 360) * Math.PI / 180,          // golden-angle spread
        v: (0.00025 + ((i * 40503) % 100) / 480000) * (i % 2 ? 1 : -1),
        s: 1 + ((i * 97) % 10) / 7,
        tw: ((i * 31) % 100) / 100,
      });
    }
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.a += n.v * 16;
      n.x = n.cx + Math.cos(n.a) * n.r;
      n.y = n.cy + Math.sin(n.a) * n.r * 0.62;   // elliptical — depth illusion
    }
    ctx.lineWidth = 0.6;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < 16900) { // 130px
          const o = (1 - Math.sqrt(d2) / 130) * 0.16;
          ctx.strokeStyle = `rgba(91,157,255,${o})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      const tw = 0.5 + 0.5 * Math.sin(t / 900 + n.tw * 6.28);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.s, 0, 6.283);
      ctx.fillStyle = `rgba(147,193,255,${0.25 + tw * 0.45})`;
      ctx.fill();
    }
    if (running) raf = requestAnimationFrame(frame);
  }

  function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

  size(); seed(); start();
  canvas.classList.add("on");
  window.addEventListener("resize", () => { size(); seed(); }, { passive: true });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
}

/* ── Terminal build ticker — types true dated build events ─────────────
   data-lines is author-controlled structured JSON: [{t, m}]. Lines are
   built exclusively with createElement/textContent (no HTML injection). */
function buildLine(entry) {
  const ln = document.createElement("span");
  ln.className = "ln";
  const t = document.createElement("span");
  t.className = "t";
  t.textContent = entry.t;
  const ok = document.createElement("span");
  ok.className = "ok";
  ok.textContent = " ✓";
  ln.append(t, document.createTextNode(" " + entry.m), ok);
  return ln;
}

function ticker() {
  const el = document.getElementById("ticker");
  if (!el) return;
  let lines;
  try { lines = JSON.parse(el.dataset.lines || "[]"); } catch { return; }
  if (!Array.isArray(lines) || !lines.length) return;
  const caret = el.querySelector(".caret");
  if (REDUCED) {
    lines.slice(0, 3).forEach((entry) => el.insertBefore(buildLine(entry), caret));
    return;
  }
  let li = 0;
  function typeLine() {
    if (el.querySelectorAll(".ln").length >= 3) {   // keep 3 visible, rotate
      const first = el.querySelector(".ln");
      if (first) first.remove();
    }
    const entry = lines[li % lines.length];
    const ln = document.createElement("span");
    ln.className = "ln";
    el.insertBefore(ln, caret);
    const plain = entry.t + " " + entry.m;
    let ci = 0;
    const iv = setInterval(() => {
      ci += 2;
      ln.textContent = plain.slice(0, ci);
      if (ci >= plain.length) {
        clearInterval(iv);
        ln.replaceWith(buildLine(entry));           // swap in the styled line
        li++;
        setTimeout(typeLine, 1500);
      }
    }, 14);
  }
  typeLine();
}

/* ── Count-up numbers when they enter the viewport ────────────────────── */
function counters() {
  const els = document.querySelectorAll("[data-count]");
  if (!els.length) return;
  const fmt = (n) => n.toLocaleString("en-US");
  const run = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (REDUCED) { el.textContent = fmt(target); return; }
    const dur = 1400, t0 = performance.now();
    (function tick(now) {
      const t = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    })(t0);
  };
  if (!("IntersectionObserver" in window) || REDUCED) { els.forEach(run); return; }
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
}

/* ── Scroll reveals ───────────────────────────────────────────────────── */
function reveals() {
  const els = document.querySelectorAll(".reveal");
  if (REDUCED || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
  els.forEach((e) => io.observe(e));
}

/* ── Card glow follows the pointer; subtle 3D tilt on desktop ─────────── */
function cardDepth() {
  if (REDUCED || !window.matchMedia("(hover: hover)").matches) return;
  document.querySelectorAll(".sys-card").forEach((card) => {
    card.addEventListener("pointermove", (ev) => {
      const r = card.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
      card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      if (card.hasAttribute("data-tilt") && !card.classList.contains("flagship")) {
        card.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 2.4).toFixed(2)}deg) rotateY(${((px - 0.5) * 2.4).toFixed(2)}deg) translateY(-2px)`;
      }
    }, { passive: true });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

/* ── Nav border on scroll ─────────────────────────────────────────────── */
function navState() {
  const nav = document.getElementById("nav") || document.querySelector(".nav");
  if (!nav) return;
  const on = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  on();
  window.addEventListener("scroll", on, { passive: true });
}


/* ── Decode effect — the role line scrambles into place ───────────────── */
function decodeText() {
  const el = document.querySelector(".role-line");
  if (!el || REDUCED) return;
  const finalText = el.textContent;
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\|=+*";
  let frame = 0;
  const total = 46;
  el.textContent = "";
  const iv = setInterval(() => {
    frame++;
    const settled = Math.floor((frame / total) * finalText.length);
    let out = "";
    for (let i = 0; i < finalText.length; i++) {
      const ch = finalText[i];
      if (i < settled || ch === " " || ch === "·") out += ch;
      else out += CHARS[(Math.random() * CHARS.length) | 0];
    }
    el.textContent = out;
    if (frame >= total) { clearInterval(iv); el.textContent = finalText; }
  }, 34);
}

/* ── Hero mouse parallax — canvas + heading drift on cursor ───────────── */
function heroParallax() {
  if (REDUCED || !window.matchMedia("(hover: hover)").matches) return;
  const hero = document.querySelector(".hero");
  const canvas = document.getElementById("constellation");
  const h1 = document.querySelector(".hero h1");
  if (!hero || !canvas) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  function tick() {
    cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
    canvas.style.transform = `translate3d(${cx * 26}px, ${cy * 18}px, 0)`;
    if (h1) h1.style.transform = `translate3d(${cx * -7}px, ${cy * -5}px, 0)`;
    if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(tick);
    else raf = null;
  }
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
}

/* ── Magnetic buttons — pull gently toward the cursor ─────────────────── */
function magnetic() {
  if (REDUCED || !window.matchMedia("(hover: hover)").matches) return;
  document.querySelectorAll(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width;
      const dy = (e.clientY - r.top - r.height / 2) / r.height;
      b.style.transform = `translate(${(dx * 7).toFixed(1)}px, ${(dy * 5).toFixed(1)}px)`;
    }, { passive: true });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });
}

/* ── Cursor spotlight — soft blue halo follows the pointer ────────────── */
function spotlight() {
  if (REDUCED || !window.matchMedia("(hover: hover)").matches) return;
  const s = document.createElement("div");
  s.id = "spotlight";
  s.setAttribute("aria-hidden", "true");
  document.body.appendChild(s);
  let raf = null, x = 0, y = 0;
  window.addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY;
    if (!raf) raf = requestAnimationFrame(() => {
      s.style.transform = `translate(${x - 300}px, ${y - 300}px)`;
      raf = null;
    });
  }, { passive: true });
}

/* ── World HUD: system map, receipts, recruiter mode, in-world Ask ───── */
function worldHud() {
  const sceneByName = new Map([...document.querySelectorAll("[data-scene]")].map((el) => [el.dataset.scene, el]));
  const body = document.body;

  document.querySelectorAll("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = sceneByName.get(button.dataset.jump);
      if (!target) return;
      if (window.__lenis) window.__lenis.scrollTo(target, { offset: 0 }); else target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const receiptText = {
    orbit: "Conxto receipts: 25,000+ live jobs, 5,136 companies, 7 specialist agents, and a live 37-template Résumé Studio.",
    agentlab: "Agent Services receipts: 37 authored base contracts are explorable in the public Lab; customer specialization, authority and operation stay inside the private control plane.",
    gate: "Eval Hub receipts: an independent cross-product layer; golden suites gate Conxto while service-level harness evidence remains distinct and bounded.",
    field: "VVDexOps receipts: free technical charts and paid-grade order flow, plus ≈70% M6E direction accuracy across 1,000+ public hash-linked calls.",
    voice: "SEO Lab receipts: UnboundPDF is live with 32 in-browser tools, no account, no document upload, and no watermark.",
    starline: "Build log receipts: dated launches, audits, and explicit caveats.",
    singularity: "Everything above is verifiable: live products, dated build log, engineering documentation — or interrogate the agent.",
  };
  document.querySelectorAll("[data-scene]").forEach((scene) => {
    const text = receiptText[scene.dataset.scene];
    if (!text || scene.querySelector(".receipt-chip")) return;
    const chip = document.createElement("div");
    chip.className = "receipt-chip";
    chip.textContent = text;
    scene.appendChild(chip);
  });

  const scenes = [...document.querySelectorAll("[data-scene]")];
  function setActiveReceipt() {
    let active = scenes[0];
    let best = Infinity;
    const anchor = window.innerHeight * 0.45;
    scenes.forEach((scene) => {
      const rect = scene.getBoundingClientRect();
      const distance = Math.abs(rect.top - anchor);
      if (rect.bottom > 80 && rect.top < window.innerHeight - 80 && distance < best) {
        best = distance;
        active = scene;
      }
    });
    scenes.forEach((scene) => scene.classList.toggle("receipt-active", scene === active));
  }
  setActiveReceipt();
  window.addEventListener("scroll", setActiveReceipt, { passive: true });
  window.addEventListener("resize", setActiveReceipt, { passive: true });

  /* ── Tour — the site walks you through itself. Any input hands control back. ── */
  const tourBtn = document.querySelector("[data-tour]");
  let touring = false, tourTimer = null;
  function stopTour() {
    if (!touring) return;
    touring = false;
    if (tourTimer) clearTimeout(tourTimer);
    body.classList.remove("receipts-on");
    tourBtn?.setAttribute("aria-pressed", "false");
    if (tourBtn) tourBtn.textContent = "Tour";
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach((ev) => window.removeEventListener(ev, onTourInput, true));
  }
  function onTourInput(e) {
    // only the button's own press is exempt (its click handler toggles); all other input cancels
    if (e.type === "pointerdown" && e.target && e.target.closest && e.target.closest("[data-tour]")) return;
    stopTour();
  }
  function startTour() {
    if (touring) return;
    touring = true;
    body.classList.add("receipts-on");                 // placards show at each stop
    tourBtn?.setAttribute("aria-pressed", "true");
    if (tourBtn) { tourBtn.textContent = "Stop"; tourBtn.blur(); }
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach((ev) => window.addEventListener(ev, onTourInput, true));
    const stops = [...document.querySelectorAll("[data-scene]")];
    let i = 0;
    // begin from the room AFTER wherever the visitor currently is
    const anchor = window.scrollY + window.innerHeight / 2;
    while (i < stops.length - 1 && stops[i].getBoundingClientRect().top + window.scrollY + stops[i].offsetHeight / 2 < anchor + 10) i++;
    function step() {
      if (!touring) return;
      if (i >= stops.length) { stopTour(); return; }
      stops[i].scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveReceipt();
      i++;
      tourTimer = setTimeout(step, 4200);              // travel + a moment with each exhibit
    }
    step();
  }
  tourBtn?.addEventListener("click", () => (touring ? stopTour() : startTour()));

  const recruiterBtn = document.querySelector("[data-toggle-recruiter]");
  const recruiterClose = document.querySelector("[data-close-recruiter]");
  function setRecruiter(on) {
    body.classList.toggle("recruiter-on", on);
    recruiterBtn?.setAttribute("aria-pressed", String(on));
  }
  recruiterBtn?.addEventListener("click", () => setRecruiter(!body.classList.contains("recruiter-on")));
  recruiterClose?.addEventListener("click", () => setRecruiter(false));

  const ask = document.querySelector(".ask-console");
  const askOpen = document.querySelector("[data-open-ask]");
  const askClose = document.querySelector("[data-close-ask]");
  const askForm = document.querySelector(".ask-console__form");
  const askInput = askForm?.querySelector("input");
  const askLog = document.querySelector("[data-ask-log]");
  const askChips = document.querySelector(".ask-console__chips");
  function setAsk(open) {
    ask?.classList.toggle("open", open);
    ask?.setAttribute("aria-hidden", String(!open));
    if (open) setTimeout(() => askInput?.focus(), 80);
  }
  function addAsk(role, text) {
    const bubble = document.createElement("div");
    bubble.className = `ask-bubble ${role}`;
    bubble.textContent = text;
    askLog?.appendChild(bubble);
    bubble.scrollIntoView({ behavior: "smooth", block: "end" });
    return bubble;
  }
  async function submitAsk(text) {
    if (!text) return;
    setAsk(true);
    addAsk("you", text);
    const thinking = addAsk("ai thinking", "Thinking…");
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json().catch(() => ({}));
      thinking.remove();
      addAsk("ai", response.ok && data.answer
        ? data.answer
        : "The agent is unavailable right now. The short version: Vamsi built Conxto, VVDexOps, SEO Lab, FarmQuick and MIRA end-to-end, with receipts on this page.");
    } catch {
      thinking.remove();
      addAsk("ai", "Network hiccup. The proof is still on the page: Conxto is the flagship, VVDexOps is the live market-data and open-research system, and the AI operating memory is the foundation behind the work.");
    }
  }
  askOpen?.addEventListener("click", () => setAsk(true));
  askClose?.addEventListener("click", () => setAsk(false));
  ask?.addEventListener("click", (event) => { if (event.target === ask) setAsk(false); });
  askForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = askInput?.value.trim();
    if (askInput) askInput.value = "";
    submitAsk(text);
  });
  askChips?.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button) submitAsk(button.textContent.trim());
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { setAsk(false); setRecruiter(false); }
  });
}

/* ── Native scroll: the world carries motion, the page never corrects it ─ */
function mobileSceneSnap() {
  document.documentElement.classList.remove("scene-snap");
}

/* ── Agent-service proof graph: one control model, five readable lenses ─ */
function serviceGraph() {
  const graph = document.querySelector("[data-service-graph]");
  if (!graph) return;
  const explanation = graph.querySelector("[data-graph-explanation]");
  const copy = {
    graph: ["Graph engineering", "compiles the contract into explicit branches, authority gates and terminal outcomes."],
    harness: ["Harness", "runs clean, exception and failure cases against the service without granting it wider authority."],
    evaluation: ["Service evaluation", "judges whether this contract and customer overlay meet their release criteria."],
    evidence: ["Trace and evidence", "preserve what entered, what was decided, what ran and why the result can be trusted."],
    memory: ["Reviewed memory", "returns only verified outcomes and approved lessons to the next controlled version."],
  };
  function select(layer, button) {
    graph.dataset.layer = layer;
    graph.querySelectorAll("[data-graph-layer]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    const [title, detail] = copy[layer];
    if (explanation) explanation.innerHTML = `<strong>${title}</strong> ${detail}`;
  }
  graph.querySelectorAll("[data-graph-layer]").forEach((button) => {
    button.addEventListener("click", () => select(button.dataset.graphLayer, button));
  });
  const first = graph.querySelector("[data-graph-layer]");
  select("graph", first);
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) graph.classList.add("is-live");
}

/* ── How I build: one operating loop, explained through its live map ── */
function buildLoop() {
  const maps = document.querySelectorAll("[data-build-loop]");
  if (!maps.length) return;
  const copy = {
    vault: ["VVDex Vault", "preserves project intent, decisions, constraints and the temporal story across models."],
    brain: ["Project Brain", "grounds that intent in current code graphs, Git history, tests, runtime evidence and active work boundaries."],
    studio: ["VVDex Studio", "is the private control plane where models, service contracts, tools and human authority are governed."],
    graph: ["Graph engineering", "turns a service contract into executable branches, gates, retries and terminal outcomes."],
    harness: ["Harness", "runs clean, exception and failure cases so a convincing answer cannot substitute for a working path."],
    evaluation: ["Service evaluation", "judges whether the specific contract and customer overlay meet their release criteria."],
    evidence: ["Trace and evidence", "preserve what entered, what ran, what was decided and what supports the final result."],
    reviewed: ["Reviewed learning", "returns only verified outcomes and approved corrections to future versions—never a silent policy rewrite."],
    mnema: ["MNEMA", "provides tenant-scoped runtime recall, procedures and outcome learning to agents inside products."],
    public: ["Agent Services Lab", "is the safe public window: 37 base contracts and deterministic proof with no customer systems connected."],
    evalhub: ["Eval Hub", "independently tracks wider quality and safety baselines across products; it does not operate the service."],
  };
  maps.forEach((map) => {
    const output = map.querySelector("[data-build-explanation]");
    map.querySelectorAll("[data-build-node]").forEach((button) => {
      button.addEventListener("click", () => {
        map.querySelectorAll("[data-build-node]").forEach((item) => item.classList.toggle("active", item === button));
        const [title, detail] = copy[button.dataset.buildNode];
        if (output) output.innerHTML = `<strong>${title}</strong> ${detail}`;
      });
    });
  });
}

/* ── Custom cursor — dot + trailing ring; ring opens near interactives ── */
function cursorDot() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const dot = document.createElement("div"); dot.id = "cursor-dot"; dot.style.transform = "translate(-100px,-100px)";
  const ring = document.createElement("div"); ring.id = "cursor-ring"; ring.style.transform = "translate(-100px,-100px)";
  document.body.append(dot, ring);
  let x = -100, y = -100, rx = -100, ry = -100, raf = null;
  function loop() {
    rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    if (Math.abs(x - rx) > 0.2 || Math.abs(y - ry) > 0.2) raf = requestAnimationFrame(loop);
    else raf = null;
  }
  window.addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY;
    dot.style.transform = `translate(${x}px, ${y}px)`;
    const on = e.target.closest && e.target.closest("a, button, input, select, [data-cursor]");
    document.body.classList.toggle("cursor-active", !!on);
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
}

/* ── Init ─────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  constellation();
  ticker();
  counters();
  reveals();
  cardDepth();
  navState();
  heroParallax();
  magnetic();
  spotlight();
  worldHud();
  cursorDot();
  mobileSceneSnap();
  serviceGraph();
  buildLoop();
});
