/* ═══════════════════════════════════════════════════════════════════════
   THE CONTROL ROOM — deck instrumentation
   Boot, clock, typed role, reveals, count-ups, station consoles (2D),
   and the terminal. Every figure drawn here is a dated snapshot from the
   page itself — the consoles visualize, they never invent.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  // When the corridor engine is alive it plays a scripted arrival and OWNS the
  // hero's reveal timing (deck3d.js). Without it — reduced motion, no WebGL —
  // the hero reveals the ordinary way and nothing below changes.
  const DECK = !!document.getElementById("deck") && !REDUCED;

  /* ── Boot sequence (all content is static, author-written) ──────────── */
  const boot = $("#boot");
  const bootLines = [
    ["dim", "vvdex estate — operations deck", ""],
    ["", "link            ", "OK   vamsivenkatesh.com"],
    ["", "stations        ", "8    conxto · agent lab · eval hub · market · seo lab · +3"],
    ["", "evidence        ", "MOUNTED  dated production snapshots"],
    ["", "policy          verified numbers or a dash — never fabricate", ""],
    ["ok", "READY", ""],
  ];
  function runBoot() {
    if (!boot) return;
    if (REDUCED || sessionStorage.getItem("ops-booted")) { boot.classList.add("done"); return; }
    const pre = boot.querySelector("pre");
    let i = 0;
    const step = () => {
      if (i < bootLines.length) {
        const [cls, head, okPart] = bootLines[i++];
        const div = document.createElement("div");
        if (cls) div.className = cls;
        div.appendChild(document.createTextNode(head));
        if (okPart) {
          const ok = document.createElement("span");
          ok.className = "ok";
          ok.textContent = okPart;
          div.appendChild(ok);
        }
        pre.insertBefore(div, pre.lastElementChild);
        setTimeout(step, 190 + Math.random() * 130);
      } else {
        setTimeout(() => { boot.classList.add("done"); sessionStorage.setItem("ops-booted", "1"); }, 1150);
      }
    };
    setTimeout(step, 180);
    setTimeout(() => boot.classList.add("done"), 5200);
  }
  runBoot();

  /* ── Clock (Berlin + UTC) ───────────────────────────────────────────── */
  const clockEl = $("[data-clock]");
  function tickClock() {
    if (!clockEl) return;
    const now = new Date();
    const ber = now.toLocaleTimeString("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" });
    const utc = now.toLocaleTimeString("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });
    clockEl.textContent = innerWidth < 761 ? `DE ${ber}` : `MAGDEBURG ${ber} · UTC ${utc}`;
  }
  tickClock(); setInterval(tickClock, 20000);

  /* ── Typed role line ────────────────────────────────────────────────── */
  const role = $("[data-role-type]");
  if (role) {
    const full = role.dataset.roleType;
    if (REDUCED) { role.textContent = full; }
    else {
      const txt = document.createTextNode("");
      const cur = document.createElement("span");
      cur.className = "cursor";
      role.textContent = "";
      role.appendChild(txt); role.appendChild(cur);
      let started = false;
      const type = () => {
        if (started) return;
        started = true;
        let i = 0;
        const t = setInterval(() => {
          i++;
          txt.nodeValue = full.slice(0, i);
          if (i >= full.length) { clearInterval(t); setTimeout(() => cur.remove(), 2600); }
        }, 34);
      };
      // during the arrival the line types as the light reaches it — never
      // finished and waiting behind a dark screen
      if (DECK && !role.classList.contains("in")) {
        const mo = new MutationObserver(() => {
          if (role.classList.contains("in")) { mo.disconnect(); type(); }
        });
        mo.observe(role, { attributes: true, attributeFilter: ["class"] });
        setTimeout(() => { mo.disconnect(); type(); }, 8000);
      } else type();
    }
  }

  /* ── Reveals + count-ups ────────────────────────────────────────────── */
  function decode(el) {
    if (!el || REDUCED || el.dataset.decoded) return;
    el.dataset.decoded = "1";
    const orig = el.textContent;
    const CH = "\u2596\u2597\u2598\u259a#/\\|=+*<>_";
    let f = 0; const total = 13;
    const iv = setInterval(() => {
      f++;
      const n = Math.floor(orig.length * (f / total));
      el.textContent = orig.slice(0, n) + orig.slice(n).replace(/[^\s]/g, () => CH[(Math.random() * CH.length) | 0]);
      if (f >= total) { el.textContent = orig; clearInterval(iv); }
    }, 38);
  }
  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("in");
      $$("[data-count]", e.target).forEach(countUp);
      if (e.target.classList.contains("station-head")) decode($(".station-title", e.target));
      io.unobserve(e.target);
    }
  }, { threshold: 0.12 });
  const heroReveals = $$(".hero .reveal");
  $$(".reveal").forEach((el) => { if (DECK && el.closest(".hero")) return; io.observe(el); });
  if (DECK) {
    // the copy is the page and the light is decoration: if the engine never
    // came up (WebGL bail) or dies mid-arrival, the hero still arrives
    setTimeout(() => {
      if (!document.body.classList.contains("deck-on")) heroReveals.forEach((el) => io.observe(el));
    }, 600);
    setTimeout(() => heroReveals.forEach((el) => el.classList.add("in")), 8000);
  }
  function countUp(el) {
    if (el.dataset.counted || REDUCED) { return; }
    el.dataset.counted = "1";
    const final = el.textContent;
    const m = final.match(/[\d,.]+/);
    if (!m) return;
    const num = parseFloat(m[0].replace(/,/g, ""));
    if (!isFinite(num)) return;
    const t0 = performance.now(), dur = 900;
    const fmt = (v) => final.replace(/[\d,.]+/, () => {
      if (m[0].includes(",")) return Math.round(v).toLocaleString("en-US");
      if (m[0].includes(".")) return v.toFixed(m[0].split(".")[1].length);
      return String(Math.round(v));
    });
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(num * e);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = final;
    };
    requestAnimationFrame(tick);
  }

  /* ── Nav state ──────────────────────────────────────────────────────── */
  const nav = $(".ops-nav");
  addEventListener("scroll", () => nav && nav.classList.toggle("scrolled", scrollY > 8), { passive: true });

  /* ═══ STATION CONSOLES — 2D instrumentation ═══════════════════════════ */
  const SIG = "#A9C4AD", IVY = "#E9E4D6", AMBER = "#D9A85C", INK3 = "#847F73", INK4 = "#57534A";
  const consoles = [];
  function mkConsole(canvas, draw) {
    const ctx = canvas.getContext("2d");
    const c = { canvas, ctx, draw, on: false, t: Math.random() * 10 };
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      const d = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * d); canvas.height = Math.round(r.height * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      c.w = r.width; c.h = r.height;
    };
    fit(); addEventListener("resize", fit, { passive: true });
    new IntersectionObserver((es) => { c.on = es[0].isIntersecting; }, { threshold: 0.05 }).observe(canvas);
    consoles.push(c);
    return c;
  }
  function frameLabel(c, txt) {
    const { ctx } = c;
    ctx.globalCompositeOperation = "source-over";
    ctx.font = "9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = INK4; ctx.textAlign = "left";
    ctx.fillText(txt.toUpperCase(), 12, c.h - 10);
  }
  function grid(c) {
    const { ctx, w, h } = c;
    // phosphor persistence: fade the last frame instead of clearing it —
    // everything that moves leaves a real CRT trail
    ctx.globalCompositeOperation = "source-over";
    if (!c.faded) { ctx.clearRect(0, 0, w, h); c.faded = true; }
    ctx.fillStyle = "rgba(10, 11, 11, 0.26)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(233,228,214,0.045)"; ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 26) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 26) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    // slow scan sweep
    const sx = ((c.t * 26) % (w + 140)) - 70;
    const gr = ctx.createLinearGradient(sx - 50, 0, sx + 50, 0);
    gr.addColorStop(0, "rgba(233,228,214,0)"); gr.addColorStop(0.5, "rgba(233,228,214,0.028)"); gr.addColorStop(1, "rgba(233,228,214,0)");
    ctx.fillStyle = gr; ctx.fillRect(sx - 50, 0, 100, h);
    ctx.globalCompositeOperation = "source-over";
  }
  const glow = (ctx, color, blur) => { ctx.shadowColor = color; ctx.shadowBlur = blur; };
  const noGlow = (ctx) => { ctx.shadowBlur = 0; };

  /* 01 · CONXTO — seven agents around one shared memory */
  const conxtoViz = $("[data-viz='conxto']");
  if (conxtoViz) mkConsole(conxtoViz, (c) => {
    const { ctx, w, h, t } = c;
    grid(c);
    const cx = w / 2, cy = h / 2 - 6, R = Math.min(w, h) * 0.31;
    const AGENTS = ["ID", "OPS", "MKT", "APP", "STR", "REC", "CRT"];
    glow(ctx, SIG, 22);
    ctx.fillStyle = SIG; ctx.beginPath(); ctx.arc(cx, cy, 7 + Math.sin(t * 2) * 1.2, 0, 7); ctx.fill();
    noGlow(ctx);
    ctx.font = "9px 'IBM Plex Mono', monospace"; ctx.fillStyle = INK3; ctx.textAlign = "center";
    ctx.fillText("SHARED MEMORY", cx, cy + 24);
    AGENTS.forEach((nm, i) => {
      const a = (i / 7) * Math.PI * 2 - Math.PI / 2 + t * 0.1;
      const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R * 0.86;
      ctx.strokeStyle = "rgba(233,228,214,0.14)"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      const pp = (t * 0.35 + i / 7) % 1;
      const px = cx + (x - cx) * pp, py = cy + (y - cy) * pp;
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(169,196,173,0.85)"; ctx.beginPath(); ctx.arc(px, py, 1.6, 0, 7); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      glow(ctx, SIG, 10);
      ctx.fillStyle = "#141513"; ctx.strokeStyle = "rgba(233,228,214,0.5)";
      ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill(); ctx.stroke();
      noGlow(ctx);
      ctx.fillStyle = "#C9C5BA"; ctx.fillText(nm, x, y + 3);
    });
    frameLabel(c, "7 specialist agents · one per-user memory · approval-gated");
  });

  /* 02 · AGENT LAB — governed workflow with a human gate */
  const labViz = $("[data-viz='lab']");
  if (labViz) mkConsole(labViz, (c) => {
    const { ctx, w, h, t } = c;
    grid(c);
    const y0 = h * 0.44, xs = [0.09, 0.26, 0.44, 0.62, 0.8, 0.93].map((f) => f * w);
    const yBranch = h * 0.72;
    const NODES = [["BRIEF"], ["MATCH"], ["EXECUTE"], ["GATE", true], ["VERIFY"], ["EVIDENCE"]];
    ctx.strokeStyle = "rgba(233,228,214,0.26)";
    ctx.beginPath(); ctx.moveTo(xs[0], y0); ctx.lineTo(xs[5], y0); ctx.stroke();
    ctx.strokeStyle = "rgba(217,168,92,0.35)"; ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(xs[2], y0); ctx.quadraticCurveTo((xs[2] + xs[4]) / 2, yBranch + 14, xs[4], y0 + 4); ctx.stroke();
    ctx.setLineDash([]);
    const cyc = (t * 0.22) % 1;
    let px;
    const gateAt = 0.58, gateHold = 0.16;
    if (cyc < gateAt) px = xs[0] + (xs[3] - xs[0]) * (cyc / gateAt);
    else if (cyc < gateAt + gateHold) px = xs[3];
    else px = xs[3] + (xs[5] - xs[3]) * ((cyc - gateAt - gateHold) / (1 - gateAt - gateHold));
    const holding = cyc >= gateAt && cyc < gateAt + gateHold;
    ctx.globalCompositeOperation = "lighter";
    glow(ctx, holding ? AMBER : SIG, 12);
    ctx.fillStyle = holding ? AMBER : SIG;
    ctx.beginPath(); ctx.arc(px, y0, 3, 0, 7); ctx.fill();
    noGlow(ctx);
    ctx.globalCompositeOperation = "source-over";
    NODES.forEach(([nm, amber], i) => {
      const x = xs[i];
      const isGate = !!amber;
      const pulse = isGate && holding ? 1 + Math.sin(t * 9) * 0.14 : 1;
      glow(ctx, isGate ? AMBER : SIG, isGate ? 14 : 8);
      ctx.fillStyle = "#141513";
      ctx.strokeStyle = isGate ? "rgba(217,168,92,0.75)" : "rgba(233,228,214,0.45)";
      ctx.lineWidth = isGate ? 1.5 : 1;
      if (isGate) {
        const s = 12 * pulse;
        ctx.beginPath(); ctx.moveTo(x, y0 - s); ctx.lineTo(x + s, y0); ctx.lineTo(x, y0 + s); ctx.lineTo(x - s, y0); ctx.closePath(); ctx.fill(); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(x, y0, 9, 0, 7); ctx.fill(); ctx.stroke();
      }
      noGlow(ctx); ctx.lineWidth = 1;
      ctx.font = "9px 'IBM Plex Mono', monospace"; ctx.textAlign = "center";
      ctx.fillStyle = isGate ? AMBER : "#C9C5BA";
      ctx.fillText(nm, x, y0 - 20);
    });
    ctx.fillStyle = INK4; ctx.font = "9px 'IBM Plex Mono', monospace"; ctx.textAlign = "center";
    ctx.fillText("EXCEPTION PATH", (xs[2] + xs[4]) / 2, yBranch + 30);
    frameLabel(c, "human gate: nothing irreversible passes without approval");
  });

  /* 03 · EVAL HUB — κ gauge + case bar */
  const evalViz = $("[data-viz='eval']");
  if (evalViz) mkConsole(evalViz, (c) => {
    const { ctx, w, h, t } = c;
    grid(c);
    const cx = w * 0.32, cy = h * 0.58, R = Math.min(w, h) * 0.3;
    ctx.lineWidth = 8; ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(237,234,226,0.09)";
    ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 2 * Math.PI); ctx.stroke();
    const kap = 0.79 * Math.min(1, Math.max(0, (t - 0.4) / 1.4));
    glow(ctx, IVY, 12);
    ctx.strokeStyle = IVY;
    ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, Math.PI + Math.PI * kap); ctx.stroke();
    noGlow(ctx); ctx.lineWidth = 1;
    ctx.font = "600 26px 'Space Grotesk', sans-serif"; ctx.fillStyle = "#EDEAE2"; ctx.textAlign = "center";
    ctx.fillText("κ " + kap.toFixed(2), cx, cy - 8);
    ctx.font = "9px 'IBM Plex Mono', monospace"; ctx.fillStyle = INK3;
    ctx.fillText("JUDGE VS HUMAN LABELS", cx, cy + 12);
    const bx = w * 0.6, bw = w * 0.32, by = h * 0.3;
    ctx.fillStyle = INK3; ctx.textAlign = "left"; ctx.font = "9px 'IBM Plex Mono', monospace";
    ctx.fillText("288 CASES · 13 SUITES", bx, by - 10);
    ctx.fillStyle = "rgba(237,234,226,0.09)"; ctx.fillRect(bx, by, bw, 8);
    glow(ctx, IVY, 7);
    ctx.fillStyle = IVY; ctx.fillRect(bx, by, bw * Math.min(1, (t - 0.2) / 1.2), 8);
    noGlow(ctx);
    ctx.fillStyle = INK3;
    ctx.fillText("NIGHTLY SAFETY PROBES", bx, by + 36);
    for (let i = 0; i < 14; i++) {
      const on = ((t * 0.6 + i * 0.37) % 1) > 0.25;
      ctx.fillStyle = on ? (i === 4 || i === 9 ? AMBER : SIG) : "rgba(237,234,226,0.12)";
      ctx.fillRect(bx + i * (bw / 14), by + 44, bw / 14 - 3, 5);
    }
    ctx.fillStyle = INK4;
    ctx.fillText("CAUGHT REAL DEFECTS IN PRODUCTION", bx, by + 70);
    frameLabel(c, "gates block a deploy below baseline — judge advisory until trusted");
  });

  /* 04 · MARKET — depth columns + a living price line (ambient, labeled) */
  const mktViz = $("[data-viz='market']");
  if (mktViz) mkConsole(mktViz, (c) => {
    const { ctx, w, h, t } = c;
    grid(c);
    const n = 46, bw = w / n;
    for (let i = 0; i < n; i++) {
      const v = Math.abs(Math.sin(i * 1.7 + t * 0.8)) * 0.5 + Math.abs(Math.sin(i * 0.61 - t * 0.5)) * 0.5;
      const bh = v * h * 0.46 + 6;
      const up = Math.sin(i * 2.3 + Math.floor(t * 0.5)) > 0;
      ctx.fillStyle = up ? "rgba(169,196,173,0.34)" : "rgba(217,168,92,0.26)";
      ctx.fillRect(i * bw + 1.5, h * 0.8 - bh, bw - 3, bh);
    }
    ctx.strokeStyle = "rgba(237,234,226,0.14)";
    ctx.beginPath(); ctx.moveTo(0, h * 0.8); ctx.lineTo(w, h * 0.8); ctx.stroke();
    // the price line rides above the depth — drawn hot so it leaves a trail
    ctx.globalCompositeOperation = "lighter";
    glow(ctx, IVY, 9);
    ctx.strokeStyle = "rgba(237,232,220,0.8)"; ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 5) {
      const y = h * 0.42
        - Math.sin(x * 0.021 + t * 0.7) * h * 0.07
        - Math.sin(x * 0.006 - t * 0.32) * h * 0.11
        - Math.sin(x * 0.047 + t * 1.4) * h * 0.02;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    noGlow(ctx); ctx.lineWidth = 1;
    ctx.globalCompositeOperation = "source-over";
    frameLabel(c, "ambient stream — the real figures are the dated readouts below");
  });

  /* 05 · SEO LAB — demand funnels into shipped products */
  const seoViz = $("[data-viz='seo']");
  if (seoViz) mkConsole(seoViz, (c) => {
    const { ctx, w, h, t } = c;
    grid(c);
    const x0 = w * 0.07, fx = w * 0.56, fy = h * 0.5;
    // funnel guides
    ctx.strokeStyle = "rgba(237,234,226,0.2)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, fy - h * 0.33); ctx.lineTo(fx, fy - 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0, fy + h * 0.33); ctx.lineTo(fx, fy + 12); ctx.stroke();
    // demand condenses through the funnel (trail-lit)
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 44; i++) {
      const pT = (t * 0.11 + i * 0.0227 + (i % 7) * 0.083) % 1;
      const x = x0 + pT * (fx - x0);
      const yA = Math.sin(i * 2.399) * (1 - pT) * h * 0.3;
      ctx.fillStyle = `rgba(169,196,173,${0.14 + pT * 0.5})`;
      ctx.beginPath(); ctx.arc(x, fy + yA, 1.1 + pT * 1.3, 0, 7); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    // distribution beams to the two shipped products
    const plates = [["UNBOUNDPDF", "32 TOOLS · LIVE", h * 0.3], ["RESUME STUDIO", "FREE · NO-LOGIN · LIVE", h * 0.66]];
    ctx.strokeStyle = "rgba(237,234,226,0.24)";
    for (const [, , py] of plates) {
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + 22, py + 16); ctx.stroke();
    }
    glow(ctx, IVY, 7);
    ctx.fillStyle = "rgba(237,232,220,0.9)"; ctx.beginPath(); ctx.arc(fx, fy, 3.2, 0, 7); ctx.fill();
    noGlow(ctx);
    // product plates — crisp panels, sage LED, engraved labels
    const pw = w * 0.34, ph = 34;
    for (const [nm, sub, py] of plates) {
      ctx.fillStyle = "#141513";
      ctx.strokeStyle = "rgba(237,232,220,0.4)";
      ctx.fillRect(fx + 24, py, pw, ph); ctx.strokeRect(fx + 24, py, pw, ph);
      ctx.fillStyle = "rgba(169,196,173,0.95)";
      const blink = 0.55 + Math.sin(t * 2 + py) * 0.35;
      ctx.globalAlpha = blink;
      ctx.beginPath(); ctx.arc(fx + 38, py + ph / 2, 3, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.font = "10px 'IBM Plex Mono', monospace"; ctx.textAlign = "left";
      ctx.fillStyle = "#EDEAE2"; ctx.fillText(nm, fx + 50, py + 14);
      ctx.fillStyle = INK3; ctx.fillText(sub, fx + 50, py + 26);
    }
    ctx.font = "9px 'IBM Plex Mono', monospace"; ctx.fillStyle = INK3;
    ctx.fillText("SEARCH DEMAND", x0, fy - h * 0.36);
    ctx.fillText("SHIPPED", fx + 24, h * 0.22);
    frameLabel(c, "find demand → prove winnable → ship the useful product");
  });

  /* console loop — 30fps is plenty for instruments */
  let last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (now - last < 33) return;
    last = now;
    for (const c of consoles) {
      if (!c.on) continue;
      c.t += 0.033;
      c.boot = Math.min(1, (c.boot || 0) + 0.02);
      c.draw(c);
      if (c.boot < 1) {
        const g = c.ctx;
        g.globalCompositeOperation = "source-over";
        const x = c.w * (c.boot * c.boot * (3 - 2 * c.boot));
        g.fillStyle = "#0B0C0B"; g.fillRect(x, 0, c.w - x, c.h);
        g.fillStyle = "rgba(233,228,214,0.8)"; g.fillRect(x, 0, 2, c.h);
      }
      if (REDUCED) { c.on = false; c.boot = 1; }
    }
  }
  requestAnimationFrame(loop);

  /* ═══ THE SPINE — one machine, one conduit down the page ═══════════ */
  (() => {
    if (innerWidth < 1200 || REDUCED) return;
    const spine = document.createElement("div");
    spine.className = "spine";
    spine.setAttribute("aria-hidden", "true");
    const pk = document.createElement("i"); pk.className = "pk"; spine.appendChild(pk);
    const secs = $$("main > section:not(.hallway)");
    const nodes = [];
    document.body.appendChild(spine);
    const layout = () => {
      const dh = document.documentElement.scrollHeight;
      nodes.forEach((n) => n.el.remove());
      nodes.length = 0;
      for (const sec of secs) {
        const nd = document.createElement("i"); nd.className = "nd";
        const y = (sec.offsetTop + sec.offsetHeight / 2) / dh;
        nd.style.top = (y * 100).toFixed(2) + "%";
        spine.appendChild(nd);
        nodes.push({ el: nd, sec });
      }
    };
    layout();
    addEventListener("resize", layout, { passive: true });
    const step = () => {
      const dh = document.documentElement.scrollHeight - innerHeight;
      const pr = Math.min(1, scrollY / Math.max(1, dh));
      pk.style.top = (pr * 100).toFixed(2) + "%";
      const mid = scrollY + innerHeight / 2;
      for (const n of nodes) {
        const on = mid >= n.sec.offsetTop && mid < n.sec.offsetTop + n.sec.offsetHeight;
        n.el.classList.toggle("act", on);
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  })();

  /* ═══ THE TERMINAL ═════════════════════════════════════════════════ */
  const term = $(".term"), tIn = $(".term-bar input"), tOut = $(".term-out");
  const print = (cls, txt) => {
    if (!tOut) return;
    const d = document.createElement("div");
    d.className = "li " + cls;
    d.textContent = txt;
    tOut.appendChild(d);
    tOut.scrollTop = tOut.scrollHeight;
    term.classList.add("open");
  };
  const CMDS = {
    help: () => print("sys", "commands: summary · systems · stack · contact · log · open <conxto|lab|market|pdf|resume> · clear — anything else goes to the AI agent (DeepSeek-backed, nothing retained)."),
    summary: () => print("sys", "Vamsi Venkatesh — AI Product Builder, Magdeburg. Ships governed agent systems end-to-end: Conxto (career OS, 25k+ live postings), a 37-service Agent Lab with human gates + sealed evidence, an independent Eval Hub (κ 0.79), live market microstructure, and public tools. Rule: verified numbers or a dash."),
    systems: () => print("sys", "01 CONXTO live · 02 AGENT LAB live (37 contracts) · 03 EVAL HUB live (κ 0.79) · 04 MARKET live, paper-only research · 05 SEO LAB live (UnboundPDF 32 tools) · 06 FARMQUICK live client · 07 SARA active R&D · 08 MIRA in dev."),
    stack: () => print("sys", "TS/Node/Fastify · Python/pandas · Postgres/pgvector/Timescale · Claude API + Agent SDK, DeepSeek · Playwright/CDP · MLX LoRA · Linux VPS/systemd/Caddy/Cloudflare."),
    contact: () => print("sys", "vamsi@vamsivenkatesh.com — open to AI/data/agent-engineering roles. Werkstudent · internship · junior AI engineer."),
    log: () => { const el = $("#log"); if (el) el.scrollIntoView({ behavior: "smooth" }); print("dim", "→ change log"); },
    clear: () => { if (tOut) tOut.replaceChildren(); term.classList.remove("open"); },
  };
  const OPEN = {
    conxto: "https://conxto.com", lab: "https://lab.vvdexops.com/agent-services/",
    market: "https://vvdexops.com/", pdf: "https://unboundpdf.com/", resume: "https://conxfolio.com/",
  };
  async function runCmd(raw) {
    const q = (raw || "").trim(); if (!q) return;
    print("you", q);
    const [cmd, arg] = q.toLowerCase().split(/\s+/);
    if (CMDS[cmd] && !arg) return CMDS[cmd]();
    if (cmd === "open" && OPEN[arg]) { print("dim", "→ " + OPEN[arg]); window.open(OPEN[arg], "_blank", "noopener"); return; }
    print("dim", "querying the agent…");
    try {
      const r = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: q }) });
      const d = await r.json().catch(() => ({}));
      tOut.lastElementChild.remove();
      print("sys", r.ok && d.answer ? d.answer : "Agent unavailable — the receipts are on this page. Try `summary` or `systems`.");
    } catch {
      tOut.lastElementChild.remove();
      print("sys", "No link to the agent right now. Try `summary`, `systems`, `stack` or `contact`.");
    }
  }
  if (tIn) {
    tIn.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { const v = tIn.value; tIn.value = ""; runCmd(v); }
      if (e.key === "Escape") { tIn.blur(); term.classList.remove("open"); }
    });
    addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== tIn && !/input|textarea/i.test(document.activeElement.tagName)) {
        e.preventDefault(); tIn.focus();
      }
    });
    $$(".term-hints button").forEach((b) => b.addEventListener("click", () => runCmd(b.dataset.cmd || b.textContent)));
    const tx = $("[data-term-x]");
    if (tx) tx.addEventListener("click", () => { tOut.replaceChildren(); term.classList.remove("open"); });
    $$("[data-open-term]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); tIn.focus(); }));
  }
})();
