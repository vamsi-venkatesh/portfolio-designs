// The cinematic scroll: intro, then each product as its own full-screen scene whose real screens move with
// the scroll, then skills, how I work, contact. Vanilla JS; every scene reads one progress value (0..1).
(() => {
  "use strict";
  const S = window.SITE, B = window.BOARD, $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  // ---------- intro ----------
  $("#role").textContent = S.role; $("#city").textContent = S.city;
  const name = $("#name");
  S.name.split(" ").forEach((w, wi) => { const span = el("span", "word"); [...w].forEach((ch, i) => { const c = el("span", "ch", ch); c.style.setProperty("--i", wi * 6 + i); span.appendChild(c); }); name.appendChild(span); });
  $("#lede").textContent = S.intro;
  const products = S.order.map((code) => B.flights.find((f) => f.flight === code));
  // a slow ribbon of every product's first screen under the intro
  const strip = $("#strip");
  for (let k = 0; k < 2; k++) products.forEach((f) => { const im = el("img"); im.src = f.shots[0][0]; im.alt = ""; im.loading = "eager"; strip.appendChild(im); });

  // ---------- one scene per product ----------
  const STATUS = { LIVE: "Live", BOARDING: "Live · launching soon", RESEARCH: "Research" };
  const work = $("#work");
  const scenes = products.map((f, idx) => {
    const sec = el("section", "scene"); sec.id = f.flight.replace(" ", "").toLowerCase();
    sec.style.setProperty("--accent", S.accent[f.flight]);
    const pin = el("div", "pin");
    const text = el("div", "s-text");
    text.append(el("p", "s-num", String(idx + 1).padStart(2, "0") + " / " + String(products.length).padStart(2, "0")), el("p", "s-kind", S.kind[f.flight]));
    const h = el("h2", "s-name", f.title); text.appendChild(h);
    text.appendChild(el("p", "s-line", f.line));
    const ul = el("ul", "s-built"); f.built.slice(0, 3).forEach((b) => ul.appendChild(el("li", null, b))); text.appendChild(ul);
    const foot = el("div", "s-foot");
    const nums = el("div", "s-nums"); f.numbers.forEach(([n, l]) => { const d = el("div"); d.append(el("b", null, n), el("span", null, l)); nums.appendChild(d); });
    const live = el("a", "s-live"); live.href = f.links[0][1]; live.target = "_blank"; live.rel = "noopener";
    live.append(el("span", "dot"), el("span", null, (f.status === "RESEARCH" ? "Open " : "Open ") + f.links[0][0]), el("span", "arr", "↗"));
    foot.append(nums, live);
    text.appendChild(foot);
    text.appendChild(el("p", "s-state", STATUS[f.status]));
    // the screens: a main one and up to two more, stacked in depth
    const stage = el("div", "s-stage");
    const shots = f.shots.slice(0, 3).map(([src, cap], k) => {
      const fig = el("figure", "shot s" + k); const im = el("img"); im.src = src; im.alt = f.title + ": " + cap; im.loading = idx < 2 ? "eager" : "lazy"; im.decoding = "async";
      fig.append(im); stage.appendChild(fig); return fig;
    });
    stage.appendChild(el("p", "s-cap", f.shots[0][1]));
    pin.append(text, stage); sec.appendChild(pin); work.appendChild(sec);
    return { sec, text, shots, h };
  });

  // ---------- skills, process, facts, contact ----------
  S.skills.forEach(([h, items]) => { const c = el("div", "sk"); c.appendChild(el("h3", null, h)); const ul = el("ul"); items.forEach((x) => ul.appendChild(el("li", null, x))); c.appendChild(ul); $("#sk-grid").appendChild(c); });
  S.process.forEach(([h, p], i) => { const li = el("li", "step"); li.append(el("span", "st-n", String(i + 1).padStart(2, "0")), el("h3", null, h), el("p", null, p)); $("#steps").appendChild(li); });
  S.facts.forEach(([k, v]) => { const d = el("div"); d.append(el("dt", null, k), el("dd", null, v)); $("#facts").appendChild(d); });
  const mail = $("#mail"); mail.href = "mailto:" + S.email; mail.textContent = S.email;

  // ---------- motion ----------
  const meter = $("#meter"), intro = $("#intro");
  function progressOf(sec) { const r = sec.getBoundingClientRect(), span = r.height - innerHeight; return clamp(-r.top / Math.max(1, span)); }
  function onScroll() {
    const doc = document.documentElement;
    meter.style.transform = `scaleX(${(doc.scrollTop / (doc.scrollHeight - innerHeight)).toFixed(4)})`;
    // the intro slips back as you leave it
    const ip = clamp(-intro.getBoundingClientRect().top / innerHeight);
    intro.style.setProperty("--p", ip.toFixed(3));
    if (REDUCED) return;
    scenes.forEach((S2) => {
      const r = S2.sec.getBoundingClientRect();
      if (r.bottom < -50 || r.top > innerHeight + 50) return;
      const p = progressOf(S2.sec);
      // enter (0 → .25), hold, leave (.8 → 1)
      const inn = ease(clamp(p / 0.25)), out = clamp((p - 0.8) / 0.2);
      S2.text.style.opacity = (inn * (1 - out)).toFixed(3);
      S2.text.style.transform = `translateY(${((1 - inn) * 60 - out * 60).toFixed(1)}px)`;
      const [a, b, c] = S2.shots;
      if (a) a.style.transform = `translate3d(0, ${((1 - inn) * 120 - out * 80).toFixed(1)}px, 0) scale(${(0.86 + 0.14 * inn - out * 0.06).toFixed(3)}) rotate(${((1 - inn) * -3).toFixed(2)}deg)`;
      if (a) a.style.opacity = (inn * (1 - out * 0.8)).toFixed(3);
      const b2 = ease(clamp((p - 0.18) / 0.3)), c2 = ease(clamp((p - 0.34) / 0.3));
      if (b) { b.style.transform = `translate3d(${((1 - b2) * 160).toFixed(1)}px, ${((1 - b2) * 60 - out * 40).toFixed(1)}px, 0) rotate(${(3 - b2 * 1).toFixed(2)}deg)`; b.style.opacity = (b2 * (1 - out)).toFixed(3); }
      if (c) { c.style.transform = `translate3d(${((1 - c2) * -140).toFixed(1)}px, ${((1 - c2) * 90 - out * 30).toFixed(1)}px, 0) rotate(${(-4 + c2 * 1.5).toFixed(2)}deg)`; c.style.opacity = (c2 * (1 - out)).toFixed(3); }
      S2.sec.style.setProperty("--glow", (inn * (1 - out)).toFixed(3));
    });
  }
  addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  // skills and steps rise in
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.2 });
  document.querySelectorAll(".sk, .step, .facts div, .contact h2, .mail, .skills h2, .process h2").forEach((n, i) => { n.classList.add("rise"); n.style.setProperty("--d", (i % 5) * 80 + "ms"); io.observe(n); });
  requestAnimationFrame(() => document.body.classList.add("ready"));
})();
