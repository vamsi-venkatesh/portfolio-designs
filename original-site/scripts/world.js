/* ═══════════════════════════════════════════════════════════════════════
   WORLD ENGINE — vamsivenkatesh.com
   One continuous particle universe behind the whole page. The scroll is
   the camera. Scenes: IGNITE → NAME → ORBIT (Conxto) → FIELD (Market Lab)
   → VOICE (SEO Lab) → STARLINE (build log) → SINGULARITY (contact).
   Zero dependencies. DPR-aware. Pauses when hidden. Full motion everywhere.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById("world");
  if (!canvas) { document.body.classList.add("world-off"); return; }

  const ctx = canvas.getContext("2d", { alpha: true });
  const MOBILE = Math.min(window.innerWidth, window.innerHeight) < 761;
  const N = MOBILE ? 2000 : 2600;         // particle budget
  const TAU = Math.PI * 2;

  let W = 0, H = 0, DPR = 1;
  let scene = "boot", prevScene = "boot";
  let morph = 1;                            // 0→1 transition progress
  let warp = 0;                             // warp burst energy
  let t0 = performance.now();
  let running = true;
  let introLocked = true;
  const mouse = { x: -9e3, y: -9e3, vx: 0 };

  /* ── particles ──────────────────────────────────────────────────────── */
  const P = new Array(N);
  function rnd(i, k) { return ((Math.sin(i * 127.1 + k * 311.7) * 43758.5453) % 1 + 1) % 1; }
  for (let i = 0; i < N; i++) {
    P[i] = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0,
      s: 0.6 + rnd(i, 1) * 1.7,             // size
      tw: rnd(i, 2),                         // twinkle phase
      hue: rnd(i, 3),                        // 0..1 → blue↔violet↔white
      drift: rnd(i, 4) * TAU,
      free: rnd(i, 5) };                     // how loosely it follows targets
  }

  function size() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layoutScene(scene, 1);                   // recompute targets
  }

  /* ── text sampling: particles form the name ─────────────────────────── */
  let namePts = null;
  let nameDissolved = false;
  function sampleName() {
    const off = document.createElement("canvas");
    const octx = off.getContext("2d");
    const lines = MOBILE ? ["VAMSI", "VENKATESH"] : ["VAMSI VENKATESH"];
    const fs = MOBILE ? 92 : Math.min(150, W * 0.088);
    off.width = 1200; off.height = MOBILE ? 300 : 190;
    octx.fillStyle = "#fff";
    octx.font = `700 ${fs}px 'Space Grotesk', sans-serif`;
    octx.textAlign = "center"; octx.textBaseline = "middle";
    lines.forEach((ln, i) => octx.fillText(ln, off.width / 2, off.height / (lines.length + 1) * (i + 1)));
    const img = octx.getImageData(0, 0, off.width, off.height).data;
    const pts = [];
    const step = MOBILE ? 4 : 3;
    for (let y = 0; y < off.height; y += step)
      for (let x = 0; x < off.width; x += step)
        if (img[(y * off.width + x) * 4 + 3] > 128) pts.push([x / off.width - 0.5, y / off.height - 0.5]);
    namePts = pts;
  }

  /* ── scene target layouts ───────────────────────────────────────────── */
  function layoutScene(name, hard) {
    const cx = W / 2, cy = H / 2;
    for (let i = 0; i < N; i++) {
      const p = P[i], r1 = rnd(i, 7), r2 = rnd(i, 8), r3 = rnd(i, 9);
      switch (name) {
        case "boot": {                       // everything condensed near a spark
          p.tx = cx + (r1 - 0.5) * 10; p.ty = cy * 0.92 + (r2 - 0.5) * 10; break;
        }
        case "name": {                       // assemble the name + halo dust
          if (!nameDissolved && namePts && i < Math.min(N * 0.88, namePts.length) && i % 7 !== 0) {
            const q = namePts[(i * 7) % namePts.length];
            const sw = Math.min(W * 0.92, 1150), sh = MOBILE ? 260 : 170;
            p.tx = cx + q[0] * sw; p.ty = H * (MOBILE ? 0.34 : 0.40) + q[1] * sh;
          } else {                           // ambient dust behind
            p.tx = r1 * W; p.ty = r2 * H;
          }
          break;
        }
        case "orbit": {                      // Conxto: 6 agent moons around a core
          const k = i % 7;
          const side = MOBILE ? cx : W * 0.70;
          if (k === 6) {                     // core cloud
            const a = r1 * TAU, rr = 14 + r2 * 30;
            p.tx = side + Math.cos(a) * rr; p.ty = cy + Math.sin(a) * rr * 0.9;
          } else {                           // moon clusters on elliptical rings
            const ring = 70 + k * (MOBILE ? 22 : 34);
            const a = (k / 6) * TAU + r1 * 0.5 + performance.now() * 0; // base angle; anim in step()
            p.baseA = (k / 6) * TAU + (r1 - 0.5) * 0.45;
            p.ring = ring * (0.94 + r2 * 0.12);
            p.ocx = side; p.ocy = cy;
            p.tx = side + Math.cos(p.baseA) * p.ring; p.ty = cy + Math.sin(p.baseA) * p.ring * 0.6;
          }
          break;
        }
        case "field": {                      // Market Lab: columns of data rising like candles
          const cols = MOBILE ? 14 : 30;
          const c = i % cols;
          const x = (c + 0.5) / cols * W;
          const h = (Math.sin(c * 1.7) * 0.5 + 0.5) * H * 0.34 + H * 0.1;
          p.col = c;
          p.tx = x + (r1 - 0.5) * (W / cols * 0.55);
          p.ty = H * 0.78 - r2 * h;
          break;
        }
        case "voice": {                      // SEO Lab: concentric research loops
          const ring = i % 5;
          const a = r1 * TAU;
          const side = MOBILE ? cx : W * 0.72;
          const rr = 46 + ring * (MOBILE ? 30 : 46) + r2 * 10;
          p.ringN = ring; p.baseA = a; p.ocx = side; p.ocy = cy;
          p.tx = side + Math.cos(a) * rr; p.ty = cy + Math.sin(a) * rr;
          break;
        }
        case "starline": {                   // build log: a river of stars flowing down-right
          const s = r3;
          p.tx = W * 0.12 + s * W * 0.76 + (r1 - 0.5) * 60;
          p.ty = H * 0.2 + s * H * 0.6 + Math.sin(s * 9) * 40 + (r2 - 0.5) * 70;
          break;
        }
        case "singularity": {                // collapse to one bright point
          const a = r1 * TAU, rr = r2 * r2 * 26;
          p.tx = cx + Math.cos(a) * rr; p.ty = H * 0.44 + Math.sin(a) * rr;
          break;
        }
      }
      if (hard) { p.x = p.tx + (r1 - 0.5) * 40; p.y = p.ty + (r2 - 0.5) * 40; }
    }
  }

  /* ── scene switching from scroll ────────────────────────────────────── */
  function setScene(next) {
    if (introLocked && next !== "name" && next !== "boot") return;
    if (next === scene) return;
    prevScene = scene; scene = next; morph = 0; warp = 1;
    layoutScene(next, 0);
  }

  const sections = [...document.querySelectorAll("[data-scene]")];
  function currentScene() {
    const mid = H * 0.5;
    let best = null, bd = 1e9;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      const c = r.top + r.height / 2;
      const d = Math.abs(c - mid);
      if (d < bd) { bd = d; best = s; }
    }
    return best ? best.dataset.scene : "name";
  }

  /* ── render loop ────────────────────────────────────────────────────── */
  function step(now) {
    if (!running) return;
    const t = (now - t0) / 1000;
    morph = Math.min(1, morph + 0.022);
    warp *= 0.94;
    const e = 1 - Math.pow(1 - morph, 3);   // ease-out

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    const isOrbit = scene === "orbit", isVoice = scene === "voice", isField = scene === "field";
    for (let i = 0; i < N; i++) {
      const p = P[i];

      // live per-scene motion on top of layout targets
      let tx = p.tx, ty = p.ty;
      if (isOrbit && p.ring) {
        const a = p.baseA + t * (0.25 + (i % 6) * 0.05);
        tx = p.ocx + Math.cos(a) * p.ring; ty = p.ocy + Math.sin(a) * p.ring * 0.6;
      } else if (isVoice && p.ocx) {
        const pulse = 1 + Math.sin(t * 2.2 - p.ringN * 1.1) * 0.10;
        const rr = (46 + p.ringN * (MOBILE ? 30 : 46)) * pulse;
        const a = p.baseA + t * 0.06;
        tx = p.ocx + Math.cos(a) * rr; ty = p.ocy + Math.sin(a) * rr;
      } else if (isField) {
        ty = p.ty + Math.sin(t * 1.4 + p.col * 0.8) * 16;  // breathing columns
      } else if (scene === "name") {
        tx += Math.sin(t * 0.7 + p.drift) * 2.2; ty += Math.cos(t * 0.6 + p.drift) * 2.2;
      } else if (scene === "singularity") {
        const a = p.drift + t * 0.8;
        tx += Math.cos(a) * 4; ty += Math.sin(a) * 4;
      }

      // spring toward target
      const k = scene === "name" && !nameDissolved ? 0.07 + p.free * 0.10 : 0.028 + p.free * 0.05;
      p.vx += (tx - p.x) * k * e; p.vy += (ty - p.y) * k * e;

      // warp burst — radial streaks on scene change
      if (warp > 0.03) {
        const dx = p.x - W / 2, dy = p.y - H / 2, d = Math.hypot(dx, dy) || 1;
        p.vx += (dx / d) * warp * (2 + p.free * 5);
        p.vy += (dy / d) * warp * (2 + p.free * 5);
      }

      // pointer gravity (repulse)
      const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
      const md2 = mdx * mdx + mdy * mdy;
      if (md2 < 16000) { const f = (1 - md2 / 16000) * 1.6; const md = Math.sqrt(md2) || 1; p.vx += mdx / md * f; p.vy += mdy / md * f; }

      p.vx *= 0.88; p.vy *= 0.88;
      p.x += p.vx; p.y += p.vy;

      // draw — streak when fast, dot when calm
      const sp = Math.hypot(p.vx, p.vy);
      const tw = 0.45 + 0.55 * Math.sin(t * 2 + p.tw * TAU);
      const a = Math.min(0.9, (0.20 + tw * 0.5) * (scene === "boot" ? 1.4 : 1));
      // hue: electric blue → violet → white sparks
      const col = p.hue < 0.72 ? `rgba(96,160,255,${a})` : p.hue < 0.9 ? `rgba(150,140,255,${a * 0.9})` : `rgba(235,242,255,${a})`;
      if (sp > 3.2) {
        ctx.strokeStyle = col; ctx.lineWidth = p.s * 0.8;
        ctx.beginPath(); ctx.moveTo(p.x - p.vx * 2.4, p.y - p.vy * 2.4); ctx.lineTo(p.x, p.y); ctx.stroke();
      } else {
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, TAU); ctx.fill();
      }
    }

    // scene-specific set dressing
    if (isOrbit) {                            // core glow + ring hints
      const side = MOBILE ? W / 2 : W * 0.70;
      const g = ctx.createRadialGradient(side, H / 2, 0, side, H / 2, 90);
      g.addColorStop(0, "rgba(120,175,255,0.35)"); g.addColorStop(1, "rgba(120,175,255,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(side, H / 2, 90, 0, TAU); ctx.fill();
    }
    if (scene === "singularity") {
      const g = ctx.createRadialGradient(W / 2, H * 0.44, 0, W / 2, H * 0.44, 120);
      g.addColorStop(0, "rgba(160,200,255,0.5)"); g.addColorStop(1, "rgba(160,200,255,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, H * 0.44, 120, 0, TAU); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    requestAnimationFrame(step);
  }

  /* ── boot sequence: terminal → ignition → name ──────────────────────── */
  const bootEl = document.getElementById("boot-lines");
  const heroUI = document.getElementById("hero-ui");
  const BOOT = [
    "> waking the builder…",
    "> loading systems: conxto · market-lab · sara · personal-os",
    "> memory substrate: online · agents: 6 · receipts: on",
    "> world ready.",
  ];
  function boot() {
    document.body.classList.add("booting");
    if (!bootEl) {
      setScene("name");
      document.body.classList.add("world-on");
      document.body.classList.remove("booting");
      return;
    }
    let li = 0;
    function typeLine() {
      if (li >= BOOT.length) {
        setTimeout(() => {
          document.body.classList.add("world-on");   // fades boot out, hero UI in (CSS)
          document.body.classList.remove("booting");
          nameDissolved = false;
          setScene("name");
          // The particle name gets the stage first; the crisp hero UI arrives after it forms.
          setTimeout(() => { document.body.classList.add("name-revealed"); }, 2600);
          setTimeout(() => { nameDissolved = true; introLocked = false; warp = 0.55; layoutScene("name", 0); morph = 0; }, 4700);
        }, 180);
        return;
      }
      const ln = document.createElement("div");
      bootEl.appendChild(ln);
      const txt = BOOT[li]; let ci = 0;
      const iv = setInterval(() => {
        ci += 4; ln.textContent = txt.slice(0, ci);
        if (ci >= txt.length) { clearInterval(iv); li++; setTimeout(typeLine, li === BOOT.length ? 120 : 70); }
      }, 8);
    }
    typeLine();
  }

  /* ── wire up ────────────────────────────────────────────────────────── */
  size();
  sampleName();
  layoutScene("boot", 1);
  // wait for the display font so the sampled name uses Space Grotesk
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load("700 100px 'Space Grotesk'")]).then(() => {
      sampleName();
      if (scene === "name" && !nameDissolved) layoutScene("name", 0);
    }).catch(() => {});
  }
  requestAnimationFrame(step);
  boot();
  setTimeout(() => {
    document.body.classList.add("world-on");
    document.body.classList.remove("booting");
    if (scene === "boot") setScene("name");
  }, 3600);
  setTimeout(() => { document.body.classList.add("name-revealed"); introLocked = false; }, 7600);

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { setScene(currentScene()); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", () => { size(); sampleName(); layoutScene(scene, 0); }, { passive: true });
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener("pointerleave", () => { mouse.x = -9e3; mouse.y = -9e3; });
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(step);
  });
})();
