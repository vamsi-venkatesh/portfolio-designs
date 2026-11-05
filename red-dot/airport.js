/* The airport behind my name, carried over from the Departures version and redrawn in this site's ink and red.
   The rule under my name is the runway: its lights are red dots, planes named after my products take off along
   it and climb out through the letters, leaving a short contrail. A faint skyline with Magdeburg's cathedral and a
   control tower sits on the same line. Two 2D canvases, one behind the name and one in front of it (the planes
   that take off); it only animates while the hero is on screen. */
(() => {
  "use strict";
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const INK = "17,17,16", BONE = "236,235,230", RED = "255,59,31";
  function rng(seed) { let s = seed >>> 0; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296; }

  const make = (night) => ({
    night,
    init(canvas, runwayEl, names, front) {
      this.canvas = canvas; this.ctx = canvas.getContext("2d"); this.runwayEl = runwayEl; this.names = names;
      this.fcanvas = front || null; this.fctx = front ? front.getContext("2d") : null;
      this.planes = []; this.skyPlanes = []; this.trails = []; this.visible = true; this.running = false; this.t0 = performance.now();
      this.nextAmbient = 0; this.nextSky = 0; this.idx = 0;
      this.resize();
      new ResizeObserver(() => { this.resize(); if (!this.running) this.frame(performance.now()); }).observe(canvas);
      new IntersectionObserver((es) => { this.visible = es[0].isIntersecting; this.kick(); }, { threshold: 0 }).observe(canvas);
      document.addEventListener("visibilitychange", () => this.kick());
      this.frame(this.t0); this.kick();
    },
    resize() {
      const r = this.canvas.getBoundingClientRect();
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.W = Math.max(1, r.width); this.H = Math.max(1, r.height);
      this.canvas.width = Math.round(this.W * this.dpr); this.canvas.height = Math.round(this.H * this.dpr);
      if (this.fcanvas) { this.fcanvas.width = this.canvas.width; this.fcanvas.height = this.canvas.height; }
      // the runway is the rule under my name
      const rr = this.runwayEl.getBoundingClientRect();
      this.runway = this.night ? this.H - 30 : Math.min(this.H - 8, Math.max(this.H * 0.5, rr.top - r.top));
      this.narrow = this.W < 700;
      const R = rng(1965), blocks = [];
      let x = -10;
      while (x < this.W + 10) { const w = 10 + R() * 30, h = 4 + R() * (this.night ? 34 : Math.min(this.H, this.W) * 0.06); blocks.push({ x, w, h }); x += w + R() * 5; }
      this.blocks = blocks; this.spireX = this.W * 0.33; this.towerX = this.W * 0.9;
    },
    kick() { if (this.visible && !document.hidden && !this.running) { this.running = true; requestAnimationFrame((t) => this.loop(t)); } },
    loop(t) {
      if (!this.visible || document.hidden) { this.running = false; return; }
      this.frame(t);
      if (REDUCED) { this.running = false; return; }
      requestAnimationFrame((n) => this.loop(n));
    },
    // send one product down the runway
    takeoff(name) {
      if (REDUCED) return;
      if (this.night) return this.land(name);
      if (this.planes.length > 1) this.planes.shift();
      const s = this.narrow ? 0.6 : 1;
      const p = { name: name || this.names[this.idx++ % this.names.length], x: this.W * 0.03, v: 30 * s, a: 70 * s, climb: 0, ang: 0, alpha: 0, last: 0, trail: [] };
      this.planes.push(p); this.trails.push(p.trail);
      this.nextAmbient = performance.now() + 11000;
      this.kick();
    },
    frame(now) {
      const { ctx, W, H, dpr } = this, t = (now - this.t0) / 1000, y = this.runway;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // skyline and the cathedral, faint ink on the paper
      if (this.fctx) { this.fctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.fctx.clearRect(0, 0, W, H); }
      ctx.fillStyle = this.night ? `rgba(${BONE},.045)` : `rgba(${INK},.06)`;
      for (const b of this.blocks) ctx.fillRect(b.x, y - b.h, b.w, b.h);
      this.cathedral(this.spireX, y);
      this.tower(this.towerX, y, t);
      this.runwayLights(y, t);
      if (!REDUCED) {
        if (!this.nextAmbient) this.nextAmbient = now + 4200;
        if (now > this.nextAmbient && !this.planes.length && (this.ready || this.night)) this.takeoff();
        this.sky(now, t);
      }
      // the planes that take off fly in front of the name, on the front canvas when there is one
      const back = this.ctx; if (this.fctx) this.ctx = this.fctx;
      this.contrails(now);
      this.planes = this.planes.filter((p) => this.plane(p, now, t));
      this.ctx = back;
    },
    // a short contrail from the tail: a bone line with a faint ink edge, so it reads on the letters and on the paper.
    // One path per trail with a gradient along it (old end clear, new end strong), so no joints show.
    contrails(now) {
      const { ctx } = this, LIFE = 2600;
      this.trails = this.trails.filter((tr) => { while (tr.length && now - tr[0].t > LIFE) tr.shift(); return tr.length > 0 || this.planes.some((p) => p.trail === tr); });
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (const tr of this.trails) {
        if (tr.length < 2) continue;
        const a = tr[0], b = tr[tr.length - 1], ka = Math.max(0, 1 - (now - a.t) / LIFE), kb = Math.max(0, 1 - (now - b.t) / LIFE);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); for (let i = 1; i < tr.length; i++) ctx.lineTo(tr[i].x, tr[i].y);
        for (const [rgb, al, w] of [[INK, 0.1, 6], [BONE, 0.92, 2.6]]) {
          const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          g.addColorStop(0, `rgba(${rgb},${(al * ka * ka).toFixed(3)})`); g.addColorStop(1, `rgba(${rgb},${(al * kb).toFixed(3)})`);
          ctx.strokeStyle = g; ctx.lineWidth = w; ctx.stroke();
        }
      }
    },
    cathedral(x, base) {
      const { ctx } = this, s = Math.min(this.H, this.W, 700) / 300 * (this.night ? 0.45 : 1);
      ctx.fillStyle = this.night ? `rgba(${BONE},.06)` : `rgba(${INK},.08)`;
      ctx.fillRect(x - 30 * s, base - 26 * s, 60 * s, 26 * s);
      for (const dx of [-16, 16]) {
        ctx.fillRect(x + dx * s - 7 * s, base - 62 * s, 14 * s, 62 * s);
        ctx.beginPath(); ctx.moveTo(x + dx * s - 7 * s, base - 62 * s); ctx.lineTo(x + dx * s, base - 96 * s); ctx.lineTo(x + dx * s + 7 * s, base - 62 * s); ctx.fill();
      }
    },
    tower(x, base, t) {
      const { ctx } = this, s = Math.min(this.H, this.W, 700) / 300 * (this.night ? 0.45 : 1);
      ctx.fillStyle = this.night ? `rgba(${BONE},.08)` : `rgba(${INK},.1)`;
      ctx.fillRect(x - 5 * s, base - 70 * s, 10 * s, 70 * s);
      ctx.beginPath(); ctx.moveTo(x - 16 * s, base - 70 * s); ctx.lineTo(x + 16 * s, base - 70 * s); ctx.lineTo(x + 12 * s, base - 84 * s); ctx.lineTo(x - 12 * s, base - 84 * s); ctx.fill();
      ctx.fillRect(x - 10 * s, base - 90 * s, 20 * s, 6 * s);
      // the beacon is a red dot
      const on = (t * 1.1) % 1 < 0.5, bx = x, by = base - 94 * s;
      ctx.fillStyle = `rgba(${RED},${on ? 0.95 : 0.25})`; ctx.beginPath(); ctx.arc(bx, by, 3.2, 0, 6.283); ctx.fill();
      if (on) { const g = ctx.createRadialGradient(bx, by, 0, bx, by, 14); g.addColorStop(0, `rgba(${RED},.35)`); g.addColorStop(1, `rgba(${RED},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, 14, 0, 6.283); ctx.fill(); }
    },
    runwayLights(y, t) {
      const { ctx, W } = this, step = this.narrow ? 16 : 22;
      for (let x = W * 0.03; x < W * 0.97; x += step) {
        const tw = 0.45 + 0.35 * Math.sin(t * 2.4 + x * 0.05);
        ctx.fillStyle = `rgba(${RED},${tw})`; ctx.beginPath(); ctx.arc(x, y - 4, 1.6, 0, 6.283); ctx.fill();
      }
      // the "rabbit": approach lights running toward the threshold
      const n = 6, x0 = W * 0.03, lead = Math.floor((t * 9) % (n + 5));
      for (let i = 0; i < n; i++) {
        const xx = W * 0.005 + i * (x0 / n);
        if (i === lead) { const g = ctx.createRadialGradient(xx, y - 4, 0, xx, y - 4, 10); g.addColorStop(0, `rgba(${RED},.9)`); g.addColorStop(1, `rgba(${RED},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(xx, y - 4, 10, 0, 6.283); ctx.fill(); }
      }
    },
    // distant planes crossing high in the empty sky above the name
    sky(now, t) {
      const { W, H } = this;
      if (!this.nextSky) this.nextSky = now + 2500;
      if (now > this.nextSky && this.skyPlanes.length < 2) {
        const L = this.narrow ? 22 : 30 + Math.random() * 10;
        this.skyPlanes.push({ x: -L, y: H * (0.16 + Math.random() * 0.12), vx: 38 + Math.random() * 24, vy: -1.5 - Math.random() * 2, L, alpha: 0, last: 0, far: true });
        this.nextSky = now + 9000 + Math.random() * 7000;
      }
      this.skyPlanes = this.skyPlanes.filter((p) => {
        const dt = Math.min(0.05, (now - (p.last || now)) / 1000); p.last = now;
        p.x += p.vx * dt; p.y += p.vy * dt; p.alpha = Math.min(this.night ? 0.35 : 0.5, p.alpha + dt);
        this.draw(p, p.x, p.y, Math.atan2(p.vy, p.vx), p.L, t);
        return p.x - p.L < W + 40;
      });
    },
    land(name) {
      if (this.planes.length) return;
      const L = this.narrow ? 72 : 132;
      this.planes.push({ name: name || this.names[0], x: -L, h: this.narrow ? 44 : 60, v: this.narrow ? 150 : 230, alpha: 0, last: 0, landing: true, roll: 0, climb: 0 });
      this.nextAmbient = performance.now() + 12500; this.kick();
    },
    plane(p, now, t) {
      if (p.landing) return this.arrive(p, now, t);
      const { W, H } = this, dt = Math.min(0.05, (now - (p.last || now)) / 1000); p.last = now;
      const L = this.narrow ? 70 : Math.min(150, Math.max(90, H * 0.14));
      p.alpha = Math.min(1, p.alpha + dt * 2.5);
      p.v += p.a * dt; p.x += p.v * dt;
      if (p.x > W * (this.narrow ? 0.34 : 0.28)) { p.ang = Math.max(this.narrow ? -0.22 : -0.3, p.ang - dt * 0.3); p.climb += -Math.sin(p.ang) * p.v * dt; }
      if (p.x - L > W + 40 || this.runway - p.climb < -L) return false;
      const y = this.runway - 6 - p.climb;
      if (p.climb > 1 && p.trail && (!p.trail.length || now - p.trail[p.trail.length - 1].t > 30)) p.trail.push({ x: p.x - 0.48 * L * Math.cos(p.ang) + 0.09 * L * Math.sin(p.ang), y: y - 0.48 * L * Math.sin(p.ang) - 0.09 * L * Math.cos(p.ang), t: now });
      this.draw(p, p.x, y, p.ang, L, t);
      return true;
    },
    // an arrival: a shallow approach from the left, touchdown on the runway, then a roll-out to a stop
    arrive(p, now, t) {
      const { W } = this, dt = Math.min(0.05, (now - (p.last || now)) / 1000); p.last = now;
      const L = this.narrow ? 72 : 132;
      const td = W * (this.narrow ? 0.45 : 0.42); // touchdown point
      p.alpha = Math.min(1, p.alpha + dt * 1.5);
      if (p.x < td) { // approach: height falls away as it nears the touchdown point
        p.x += p.v * dt; const k = Math.max(0, (td - p.x) / (td + L)); p.climb = p.h * Math.pow(k, 1.25);
        p.ang = 0.05 + 0.1 * k;
      } else { // roll-out
        p.climb = 0; p.ang = Math.max(0, p.ang - dt * 0.3); p.v = Math.max(0, p.v - (this.narrow ? 70 : 110) * dt); p.x += p.v * dt;
        if (p.v === 0) { p.roll += dt; p.lights = Math.max(0, 1 - p.roll); if (p.roll > 1.4) p.alpha = Math.max(0, 1 - (p.roll - 1.4)); if (p.roll > 2.4) return false; }
      }
      this.draw(p, p.x, this.runway - 6 - p.climb, p.ang, L, t);
      return true;
    },
    // one plane at (x, y) = main gear, nose to the right: an ink body with a red tail, like the dot
    draw(p, x, y, ang, L, t) {
      const { ctx } = this;
      if (this.night && p.landing && (p.lights == null || p.lights > 0)) { // landing light ahead of the nose
        ctx.save(); ctx.globalAlpha = p.alpha * (p.lights == null ? 1 : p.lights); ctx.translate(x, y); ctx.rotate(ang);
        const bg = ctx.createRadialGradient(L * 0.55, -L * 0.07, 0, L * 0.55, -L * 0.07, L * 1.1);
        bg.addColorStop(0, "rgba(255,244,220,.45)"); bg.addColorStop(1, "rgba(255,244,220,0)");
        ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(L * 0.5, -L * 0.08); ctx.lineTo(L * 1.7, -L * 0.3); ctx.lineTo(L * 1.7, L * 0.25); ctx.closePath(); ctx.fill(); ctx.restore();
      }
      ctx.save(); ctx.globalAlpha = p.alpha; ctx.translate(x, y); ctx.rotate(ang); ctx.scale(L, L);
      const BODY = this.night ? `rgb(${BONE})` : `rgb(${INK})`;
      ctx.fillStyle = BODY;
      ctx.beginPath();
      ctx.moveTo(-0.46, -0.12); ctx.lineTo(0.38, -0.13); ctx.quadraticCurveTo(0.5, -0.125, 0.51, -0.088);
      ctx.quadraticCurveTo(0.5, -0.05, 0.4, -0.048); ctx.lineTo(-0.36, -0.05); ctx.quadraticCurveTo(-0.46, -0.07, -0.5, -0.11); ctx.closePath(); ctx.fill();
      const cut = this.fctx && ctx === this.fctx; // in front of the name: a paper-cut edge, so the plane reads on the black letters
      if (cut) { ctx.strokeStyle = `rgb(${BONE})`; ctx.lineWidth = 2.4 / L; ctx.lineJoin = "round"; ctx.stroke(); }
      ctx.fillStyle = `rgb(${RED})`;
      ctx.beginPath(); ctx.moveTo(-0.43, -0.12); ctx.lineTo(-0.5, -0.3); ctx.lineTo(-0.42, -0.3); ctx.lineTo(-0.29, -0.125); ctx.closePath(); ctx.fill();
      ctx.fillStyle = BODY;
      ctx.beginPath(); ctx.moveTo(-0.42, -0.095); ctx.lineTo(-0.3, -0.095); ctx.lineTo(-0.47, -0.07); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-0.08, -0.075); ctx.lineTo(0.12, -0.075); ctx.lineTo(-0.14, -0.025); ctx.closePath(); ctx.fill(); if (cut) ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0.05, -0.04, 0.075, 0.022, 0, 0, 6.283); ctx.fill();
      if (!p.far && (p.landing || p.climb < L * 0.3)) { ctx.fillRect(0.3, -0.05, 0.008, 0.05); ctx.fillRect(-0.04, -0.05, 0.01, 0.05); }
      ctx.fillStyle = this.night ? "rgba(255,210,150,.9)" : "rgba(236,235,230,.85)";
      for (let wx = -0.32; wx < 0.36; wx += 0.028) ctx.fillRect(wx, -0.108, 0.012, 0.012);
      ctx.restore();
      // the beacon on top blinks red
      if ((t * 1.1) % 1 < 0.5) {
        const bx = x + (-0.05 * L) * Math.cos(ang) - (-0.135 * L) * Math.sin(ang), by = y + (-0.05 * L) * Math.sin(ang) + (-0.135 * L) * Math.cos(ang);
        ctx.globalAlpha = p.alpha; ctx.fillStyle = `rgb(${RED})`; ctx.beginPath(); ctx.arc(bx, by, p.far ? 1.6 : 2.6, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
      }
      if (p.name && !p.far && !(this.narrow && !this.night) && (p.landing || p.climb < L * 0.9)) { // the product's name rides with it off the runway
        ctx.globalAlpha = p.landing ? p.alpha * Math.max(0, 1 - p.climb / 22) : p.alpha * Math.max(0, 1 - p.climb / (L * (this.fctx ? 0.35 : 0.9)));
        ctx.font = `500 ${this.narrow ? 10 : 12}px 'Geist Mono', monospace`;
        ctx.fillStyle = this.night ? `rgb(${RED})` : "#c4260f"; ctx.fillText(p.name.toUpperCase(), x - L * 0.45, y - L * 0.38);
        ctx.globalAlpha = 1;
      }
    },
  });
  window.Airport = make(false);
  window.makeAirport = make;
})();
