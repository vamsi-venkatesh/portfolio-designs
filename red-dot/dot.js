/* The red dot. It is the mark, the cursor, the full stop of my name, and the door into every product:
   wherever it opens, something live is inside. Product facts come from facts.js and content.js. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; };
  const dot = (c = "") => el("i", ("d " + c).trim());
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const narrow = () => innerWidth < 900;
  const root = document.documentElement; root.classList.add("js");

  const S = window.SITE, B = window.BOARD;
  const byCode = Object.fromEntries(B.flights.map((f) => [f.flight, f]));
  const products = S.order.map((c) => byCode[c]);
  const EMBED = { "VV 106": 1, "VV 105": 1, "VV 103": 1, "VV 102": 1, "VV 101": 1, "VV 107": 1, "VV 108": 1 };
  const PRIVATE = { "VV 104": 1 };
  const SIGNIN = { "VV 106": "sign in", "VV 107": "sign in and save" };
  const TALL = { "VV 106": "conxto", "VV 105": "unboundpdf", "VV 103": "farmquick", "VV 102": "lab", "VV 101": "forge", "VV 104": "pitchradar", "VV 107": "conxfolio", "VV 108": "trading" };
  const status = (f) => PRIVATE[f.code] ? ["Private · client work", "ring"]
    : f.status === "RESEARCH" ? ["Research · paper only", "half"]
    : f.status === "BOARDING" ? ["Live · not announced yet", ""] : ["Live", ""];
  const host = (u) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const copy = (f) => S.copy[f.code] || {};
  products.forEach((f) => { f.code = f.flight; f.shots2 = copy(f).shots || []; });
  const LETTER = { C: "VV 106", U: "VV 105", F: "VV 103", L: "VV 102", G: "VV 101", P: "VV 104", X: "VV 107", T: "VV 108" };
  const pad = (n) => String(n).padStart(2, "0");
  // every picture and recording carries the build's media fingerprint, so no cache (Cloudflare's or a browser's) can keep
  // an old copy under the same name; ops/build.py writes the real value into the published file
  const MV = "dev", mv = (u) => u + (u.includes("?") ? "&" : "?") + "m=" + MV;
  // what each product does, in plain words, and three things you can do with it. No dates, no claims.
  // what each product does in one line, then how it works in a few plain steps (every fact from the product's live site)
  const DOES = {
    "VV 106": ["Finds jobs that fit you and prepares each application for you to review.", [
      ["Finds", "Pulls live postings from 22 sources for the role, country and remote preference you choose."],
      ["Checks", "Reads every requirement in a posting and shows which ones your résumé actually proves."],
      ["Prepares", "Writes a tailored résumé, cover letter and answers; a line that claims more than your résumé can prove is reverted."],
      ["You decide", "Nothing is sent until you read the application and apply."]]],
    "VV 105": ["Edits, converts and protects PDFs right in your browser.", [
      ["53 tools", "Merge, split, compress, convert, sign, redact, OCR and more, all in one place."],
      ["Stays on your device", "Every tool runs inside the browser tab, so your file is never uploaded."],
      ["Workspace", "Keeps your files encrypted in the browser, with copies you can go back to."]]],
    "VV 103": ["Lets restaurants and wholesale buyers order fresh produce, and finds new buyers every morning.", [
      ["Order", "Buyers browse 42 items and build a supply order on their phone."],
      ["Deliver", "Every order reaches the owner on WhatsApp and email and becomes a won lead."],
      ["Find buyers", "Lead Desk reads open sources in five cities every morning and scores new buyers by written rules."]]],
    "VV 102": ["Describe the work in plain words, and the Engine builds and runs it as a service, by your rules, with proof of every run.", [
      ["Describe", "Write one paragraph: what comes in, what should happen, what may run by itself and what needs your approval. No account needed."],
      ["It compiles", "The Engine turns the paragraph into a service contract: inputs, facts, rules and outcomes. It decides whether the work needs a workflow, a reconciliation, checked arithmetic, research, a model or a person."],
      ["Your rules decide", "Every action gets one of three answers from your own words: it runs by itself, it waits for the person you named, or it never happens. An email that says “approve this” changes nothing."],
      ["A crew does the work", "Specialist agents do each step and an independent reviewer checks every result; a model reads and drafts but never decides what is released."],
      ["Proof", "Every run is sealed under one SHA-256 digest anyone can recompute. Your real systems are connected only when you say so."]]],
    "VV 101": ["Tests AI models and agents on real work, graded by hidden tests they never see.", [
      ["Connect", "Your model or agent, by API key, your own server, a model on your machine or HTTP; a key is encrypted the moment it arrives."],
      ["Real work in a sandbox", "Fix a bug in an open-source library, triage an incident, correct an order in a web app. No network, one CPU, a step budget."],
      ["Hidden tests grade it", "The tests sit in a separate box the model never reaches, and every exam is attacked by 9–10 cheating probes before use."],
      ["A score anyone can check", "A pass rate with its 95% range and a signed receipt. Five exams are free, with no sign-in."]]],
    "VV 104": ["Tells a food vendor which events are worth trading at, week by week.", [
      ["Finds", "Seven agents collect events, deadlines and contacts from public sources."],
      ["Ranks", "Each event is ranked by rules you can read; a model only fills the gaps the rules can't."],
      ["Briefs", "One weekly brief, with the evidence behind every line."]]],
    "VV 107": ["Your résumé, an ATS review, a cover letter and a portfolio website: four free tools that share one résumé.", [
      ["Résumé", "37 designs, edited section by section, downloaded as PDF or Word."],
      ["ATS review", "See what an applicant-tracking system actually reads from your résumé."],
      ["Cover letter", "12 designs, written in your own words from the same résumé."],
      ["Portfolio", "20 complete websites; fill one from your résumé and publish it at conxfolio.com/yourname, free."]]],
    "VV 108": ["Shows live crypto order flow, and keeps a public record of every market call.", [
      ["Watch", "Live order book and trades for Bitcoin, Ethereum and Solana, straight from the exchanges."],
      ["Record", "Every call is dated and chained to the one before, so none can be changed later."],
      ["Paper only", "Research, with no money involved."]]],
  };

  // what to do first inside each live window: the part that fully works in here
  const ACT = { "VV 106": "Look around Conxto", "VV 105": "Drop a PDF in · it never leaves this tab", "VV 103": "Browse FarmQuick's range",
    "VV 102": "Describe the work and compile it", "VV 101": "Test a model on a real exam", "VV 107": "Try the résumé designs", "VV 108": "Watch the live order flow" };
  const LINKEDIN = "https://www.linkedin.com/in/vamsivenkatesh"; // from the founder's own résumé links
  const cur = $("#cur"), curL = $("#curL");
  const gsap = window.gsap && !REDUCED ? window.gsap : null;

  if (LINKEDIN) { $("#liLink").href = LINKEDIN; $(".li-in").hidden = false; }
  /* ---------- hero: numbers, the clock, the hint ---------- */
  const nEmbed = products.filter((f) => EMBED[f.code]).length, nPriv = products.filter((f) => PRIVATE[f.code]).length;
  const count = $("#count");
  [[products.length, " products"], [nEmbed, " you can use on this page"], [nPriv, " private, built for a client"]].forEach(([n, l], i) => {
    if (i) count.appendChild(el("br")); count.append(el("b", null, String(n)), document.createTextNode(l)); });
  const clock = $("#clock");
  const tick = () => { clock.textContent = "Magdeburg " + new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" }).format(new Date()); };
  tick(); setInterval(tick, 20000);
  $("#hint").textContent = FINE ? "The products are inside the dot" : "Tap the dot";

  /* ---------- the name runs edge to edge ---------- */
  const name = $("#name"), ln2 = $("#ln2");
  const fitName = () => { name.style.fontSize = ""; const hero = name.parentElement, cs = getComputedStyle(hero);
    const avail = hero.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const w = ln2.getBoundingClientRect().width, fs = parseFloat(getComputedStyle(name).fontSize);
    if (w > 0) name.style.fontSize = Math.min(fs * (avail / w) * 0.965, 360) + "px"; }; // a little room: letters swell
  // every letter of the name in its own span (the text stays the same for screen readers)
  [name.querySelector(".in"), ln2].forEach((host) => { const tn = [...host.childNodes].find((n) => n.nodeType === 3 && n.nodeValue.trim()); if (!tn) return;
    const frag = document.createDocumentFragment(); [...tn.nodeValue].forEach((ch) => frag.appendChild(el("span", "ch", ch))); tn.replaceWith(frag); });
  const nameChars = [...name.querySelectorAll(".ch")], heroEl = name.closest(".hero");
  const swell = nameChars.map(() => ({ k: 0, last: -1 }));
  let ptr = null, lastPtr = 0, waveAt = -1, nextWave = 0, heroSeen = true;
  heroEl.addEventListener("pointermove", (e) => { ptr = { x: e.clientX, y: e.clientY }; lastPtr = performance.now(); }, { passive: true });
  heroEl.addEventListener("pointerleave", () => (ptr = null));
  heroEl.addEventListener("touchmove", (e) => { const t = e.touches[0]; ptr = { x: t.clientX, y: t.clientY }; lastPtr = performance.now(); }, { passive: true });
  heroEl.addEventListener("touchend", () => (ptr = null), { passive: true });
  new IntersectionObserver((es) => es.forEach((e) => (heroSeen = e.isIntersecting))).observe(heroEl);
  const liveName = () => {
    if (!heroSeen || REDUCED || !root.classList.contains("done")) return;
    const now = performance.now(); let p = ptr;
    if (!p && now - lastPtr > 3000) { // no one is pointing: a slow wave runs through the name every few seconds
      if (waveAt < 0 && now > nextWave) waveAt = now;
      if (waveAt >= 0) { const k = (now - waveAt) / 2200; if (k > 1) { waveAt = -1; nextWave = now + 6500; }
        else { const r = name.getBoundingClientRect(); p = { x: r.left - 120 + (r.width + 240) * k, y: r.top + r.height * (0.25 + 0.5 * k) }; } }
    }
    if (!p && swell.every((s) => s.k < 0.003)) return;
    const R = parseFloat(getComputedStyle(name).fontSize) * 0.62, rects = nameChars.map((c) => c.getBoundingClientRect());
    nameChars.forEach((c, i) => { const r = rects[i], s = swell[i];
      const target = p ? Math.exp(-((Math.hypot(p.x - (r.left + r.width / 2), (p.y - (r.top + r.height / 2)) * 0.7) / R) ** 2)) : 0;
      s.k += (target - s.k) * 0.16;
      if (Math.abs(s.k - s.last) > 0.003) { s.last = s.k; c.style.fontWeight = Math.round(700 + 100 * s.k); c.style.top = (-0.045 * s.k).toFixed(3) + "em"; } });
  };

  /* ---------- work: the list, and one window that opens into the chosen product ---------- */
  const index = $("#index"), stage = $("#stage"), win = $("#win"), seed = $("#seed"), stageHome = stage.parentElement;
  let cur_i = -1, stageSeen = false, swapping = null, WALL = false, stageST = null, revealST = null, pfST = null;
  const rows = products.map((f, i) => {
    const [st, cls] = status(f), li = el("li"), row = el("button", "row"); row.type = "button";
    row.dataset.peek = f.shots2[0] ? mv("peek/" + f.shots2[0][0].split("/").pop().replace(".jpg", ".webp")) : ""; row.dataset.cur = "Show"; row.setAttribute("aria-controls", "win");
    const t = el("span", "t", f.title); t.appendChild(dot());
    const s = el("span", "st"); s.title = st; s.appendChild(dot(cls));
    row.append(el("span", "n", pad(i + 1)), t, s, el("span", "kd", S.kind[f.code] + " · " + st));
    const c = copy(f), more = el("div", "more"), wrap = el("div"), inn = el("div", "more-in");
    const oc = el("div", "outcome"), fl = el("ul");
    oc.append(el("b", null, "What it does"), el("p", null, DOES[f.code][0]), fl);
    DOES[f.code][1].forEach(([t, d]) => fl.appendChild(el("li", null, t + ": " + d)));
    inn.appendChild(oc);
    const story = el("p", "story", S.story[f.code]); inn.appendChild(story);
    const moreB = el("button", "story-more", "Read the story ↓"); moreB.type = "button"; inn.appendChild(moreB);
    moreB.addEventListener("click", () => { const o = story.classList.toggle("open"); moreB.textContent = o ? "Show less ↑" : "Read the story ↓"; });
    const nums = el("div", "nums");
    (c.numbers || f.numbers || []).slice(0, 2).forEach(([v, l]) => { const d = el("div"); d.append(el("b", null, v), el("span", null, (l === "dated calls" ? "market calls" : l).replace(/\s*·\s*\d{1,2} [A-Z][a-z]{2,8}( \d{4})?$/, ""))); nums.appendChild(d); });
    inn.append(nums);
    if (PRIVATE[f.code]) inn.appendChild(el("p", "note", "Private. It runs for a client, so there is no public link. The screens are from the real product."));
    else {
      const lk = el("div", "links"); f.links.slice(0, 3).forEach(([l, u]) => { const a = el("a", null, l + " ↗"); a.href = u; a.target = "_blank"; a.rel = "noopener"; a.dataset.cur = "Open"; lk.appendChild(a); }); inn.appendChild(lk);
      if (SIGNIN[f.code]) inn.appendChild(el("p", "note", "Here it runs as a guest. To " + SIGNIN[f.code] + ", open the full site."));
    }
    wrap.appendChild(inn); more.appendChild(wrap); li.append(row, more); index.appendChild(li);
    row.addEventListener("click", () => select(i, true));
    return li;
  });

  // the one live window
  const RENDER_W = 1100; // a little narrower than a laptop, so the embedded sites stay readable when scaled
  const fit = () => { const scr = $(".scr", win), fr = $(".site iframe", win); if (!scr || !fr) return;
    const W = scr.clientWidth, H = scr.clientHeight, s = narrow() ? 1 : W / RENDER_W;
    fr.style.width = (narrow() ? W : RENDER_W) + "px"; fr.style.height = H / s + "px"; fr.style.transform = s === 1 ? "none" : `scale(${s})`; };
  // a whole website loading mid-scroll froze the page for 100–200ms: load it once scrolling has settled, and on a
  // phone never inline (a nested scroller under the thumb has no way out), only in the full-screen sheet
  let lastScroll = 0; addEventListener("scroll", () => (lastScroll = performance.now()), { passive: true });
  const whenIdle = (fn) => { const tick = () => (performance.now() - lastScroll > 350 ? fn() : setTimeout(tick, 200)); tick(); };
  const loadSite = () => { if (narrow()) return; whenIdle(loadNow); };
  const loadNow = (tapped) => { const site = $(".site", win); if (!site || site.firstChild || (narrow() && !tapped)) return;
    const fr = el("iframe"); fr.title = site.dataset.title + " (live site)";
    // sandboxed: the product keeps what it needs (scripts, its own storage, forms, downloads, new tabs, dialogs) but can
    // never navigate this page away or reach it; set before src so it applies from the first load
    fr.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals");
    fr.referrerPolicy = "strict-origin-when-cross-origin"; fr.setAttribute("allow", "clipboard-write; fullscreen"); fr.src = site.dataset.src;
    fr.addEventListener("load", () => win.classList.add("loaded"));
    site.appendChild(fr); fit(); };
  // the frame changes size (the phone frame grows when you use it, a window resizes): the site must follow it,
  // or the screenshot underneath shows through the gap, which read as a split screen
  new ResizeObserver(() => fit()).observe(win);
  const fill = (f) => {
    win.replaceChildren(); win.classList.remove("active", "loaded");
    const bar = el("div", "bar");
    if (PRIVATE[f.code]) {
      bar.append(dot("ring"), el("span", "host", f.title + " · private, client work"), el("span", "state", "screens from the real product"));
      const shots = el("div", "shots");
      f.shots2.forEach(([src, cap]) => { const fig = el("figure"), im = el("img"); im.src = mv(src); im.alt = cap; im.width = 2048; im.height = 1280; fig.append(im);
        const w = el("div"); w.append(fig, el("figcaption", null, cap)); shots.appendChild(w); });
      win.append(bar, shots); return;
    }
    const url = f.links[0][1], state = el("span", "state");
    state.append(el("span", "off", "click to use it here"), el("span", "on", "it's yours · move out to give it back"));
    const open = el("a", null, SIGNIN[f.code] ? "Open full site ↗" : "Open ↗"); open.href = url; open.target = "_blank"; open.rel = "noopener"; open.dataset.cur = "Open";
    bar.append(dot(f.status === "RESEARCH" ? "half" : "pulse"), el("span", "host", host(url)), state, open);
    const scr = el("div", "scr"), poster = el("img", "poster"); poster.src = mv((narrow() ? "poster-m/" : "poster/") + TALL[f.code] + ".webp"); poster.alt = "The live page at " + host(url);
    scr.appendChild(poster);
    const site = el("div", "site"); site.dataset.src = url; site.dataset.title = f.title;
    const sh = el("button", "shield"); sh.type = "button"; sh.setAttribute("aria-label", "Use " + f.title + " here"); sh.dataset.cur = "Use it";
    sh.appendChild(el("span", null, ACT[f.code] || "Use " + f.title + " here"));
    sh.addEventListener("click", () => { loadNow(true); if (narrow()) requestAnimationFrame(() => { const r = win.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 10) scrollTo({ top: scrollY + r.top - 70, behavior: "smooth" }); }); win.classList.add("active"); const fr = $(".site iframe", win); if (fr) fr.focus(); cur.classList.add("gone"); });
    const done = el("button", "done", "Done ✕"); done.type = "button"; done.addEventListener("click", (e) => { e.stopPropagation(); win.classList.remove("active"); }); bar.insertBefore(done, open);
    scr.append(site, sh); win.append(bar, scr);
    if (stageSeen) loadSite();
  };
  win.addEventListener("pointerleave", () => win.classList.remove("active"));
  addEventListener("keydown", (e) => { if (e.key === "Escape") win.classList.remove("active"); });

  // a tap outside gives the live site back, except on the stage's own buttons: shrinking the frame there would move
  // the button out from under the finger before the click lands (switching product closes the frame anyway)
  document.addEventListener("pointerdown", (e) => { if (!win.contains(e.target) && !(e.target.closest && e.target.closest(".ws-next, .ws-rail, .ws-back, .ws-use"))) win.classList.remove("active"); }, { passive: true });

  const OPEN = "circle(75% at 50% 50%)", SHUT = "circle(0% at 50% 50%)";
  const placeStage = () => { if (WALL) { if (stage.parentElement !== $("#wsWin")) $("#wsWin").appendChild(stage); fit(); return; }
    const home = narrow() ? $(".more-in", rows[Math.max(cur_i, 0)]) : null;
    if (home && stage.parentElement !== home) home.prepend(stage); else if (!home && stage.parentElement !== stageHome) stageHome.appendChild(stage); fit(); };
  // After a pick, line the page up so the chosen row sits level with the top of the live window and both are
  // fully on screen. Measured from the final layout (other rows collapsed, this one open), not mid-animation.
  const STICK = 76;
  const align = (i) => {
    if (narrow()) { requestAnimationFrame(() => requestAnimationFrame(() => go(rows[i], -70))); return; }
    const y0 = scrollY, top = (e) => e.getBoundingClientRect().top + y0;
    const listTop = top(index) + 1, rowH = rows.map((li) => $(".row", li).offsetHeight + 1);
    const rowTop = listTop + rowH.slice(0, i).reduce((a, b) => a + b, 0);
    const listH = 1 + rowH.reduce((a, b) => a + b, 0) + $(".more-in", rows[i]).offsetHeight;
    const wkTop = top(index.parentElement), stageH = stage.offsetHeight;
    // the last rows need room below them to reach the top; add exactly that much, and no more
    const need = Math.max(0, (rowTop - wkTop) + stageH - listH);
    index.style.paddingBottom = need + "px";
    const maxStick = wkTop + Math.max(listH + need, stageH) - stageH - STICK;
    const y = Math.max(wkTop - STICK, Math.min(rowTop - STICK, maxStick));
    scrollTo({ top: y, behavior: REDUCED ? "auto" : "smooth" });
  };
  function select(i, user) {
    if (i === cur_i) { if (user) align(i); return; }
    const first = cur_i < 0; cur_i = i;
    rows.forEach((li, k) => li.classList.toggle("on", k === i));
    const swap = () => { fill(products[i]); placeStage(); };
    if (!gsap || first || !stageSeen) { swap(); if (!gsap || stageSeen) win.style.clipPath = "none"; }
    else {
      if (swapping) swapping.kill();
      // the window closes into the dot, and opens again on the new product
      swapping = gsap.timeline()
        .to(win, { clipPath: SHUT, duration: 0.42, ease: "power3.in" })
        .set(seed, { opacity: 1, scale: 0.6 }).to(seed, { scale: 1.7, duration: 0.25, ease: "power2.out" })
        .add(swap)
        .to(win, { clipPath: OPEN, duration: 0.85, ease: "expo.out" }, "+=0.02")
        .to(seed, { opacity: 0, scale: 0.5, duration: 0.3 }, "<0.1")
        .set(win, { clipPath: "none" });
    }
    if (user) align(i);
  }
  select(0, false);

  /* ---------- the control room (a second layout, to compare): all eight products on one wall, each a short silent
     recording of the real site (PitchRadar: its real screens, it is private). Pick one and it grows out of the wall
     into a stage in that product's own colours, with the same live window as the list layout. ---------- */
  // [field, accent]: sampled from each product's own screen
  const FIELD = { "VV 106": ["#eef2ea", "#111110"], "VV 105": ["#e4efe9", "#2f7a5f"], "VV 103": ["#0c3b2c", "#cfb679"], "VV 102": ["#0f1111", "#addabb"],
    "VV 101": ["#0b0b0b", "#d37a50"], "VV 104": ["#121b26", "#c0643c"], "VV 107": ["#f3f3f1", "#111110"], "VV 108": ["#101820", "#d0506a"] };
  const DARKF = { "VV 103": 1, "VV 102": 1, "VV 101": 1, "VV 104": 1, "VV 108": 1 };
  const wallEl = $("#wall"), wGrid = $("#wallGrid"), wStage = $("#wallStage"), wsInfo = $("#wsInfo"), wsRail = $("#wsRail");
  let wallI = -1;
  const paint = (node, f) => { node.style.setProperty("--f", FIELD[f.code][0]); node.style.setProperty("--a", FIELD[f.code][1]); node.classList.toggle("dark", !!DARKF[f.code]); };
  const tiles = products.map((f, i) => {
    const [st, cls] = status(f), b = el("button", "tile"); b.type = "button"; b.dataset.cur = "Open"; paint(b, f);
    b.setAttribute("aria-label", `${f.title}, ${S.kind[f.code]}, ${st}. Open it`);
    const scr = el("div", "tl-scr");
    if (PRIVATE[f.code]) { const im = el("img", "tl-pan"); im.src = mv(f.shots2[0][0]); im.alt = ""; im.loading = "lazy"; scr.appendChild(im); }
    else { const v = el("video"); v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.setAttribute("muted", ""); v.preload = "none";
      v.poster = mv("loops/" + TALL[f.code] + ".webp"); v.src = mv("loops/" + TALL[f.code] + ".mp4"); v.setAttribute("aria-hidden", "true"); scr.appendChild(v);
      scr.style.backgroundImage = `url("${mv("loops/" + TALL[f.code] + ".webp")}")`; } // the still frame sits under the video: a screen is never blank
    const cap = el("div", "tl-cap"); cap.append(dot(cls || "pulse"), el("b", null, f.title), el("span", "st", st.split(" · ")[0]));
    b.append(scr, cap); b.addEventListener("click", () => wallOpen(i)); wGrid.appendChild(b);
    return b; });
  // calm wall: one screen plays at a time and the turn moves across the wall every 11.5 s (about one recording), plus the one you
  // point at. Seven decoding at once held the page to 30 fps; two keep it at 60. Only on-page screens take a turn.
  const inView = new Set(); let autoI = 0, hoverI = -1;
  const liveTiles = tiles.map((t, i) => ($("video", t) ? i : -1)).filter((i) => i >= 0);
  setInterval(() => { const cand = liveTiles.filter((i) => inView.has(i)); if (!cand.length) return;
    autoI = cand[(cand.indexOf(autoI) + 1) % cand.length]; syncVideos(); }, 11500);
  tiles.forEach((t, i) => { t.addEventListener("mouseenter", () => { hoverI = i; syncVideos(); }); t.addEventListener("mouseleave", () => { hoverI = -1; syncVideos(); });
    t.addEventListener("focus", () => { hoverI = i; syncVideos(); }); t.addEventListener("blur", () => { hoverI = -1; syncVideos(); }); });
  const syncVideos = () => tiles.forEach((t, i) => { const v = $("video", t); if (!v) return;
    if (!inView.has(autoI)) { const c = liveTiles.find((k) => inView.has(k)); if (c != null) autoI = c; }
    const on = WALL && wallI < 0 && inView.has(i) && !REDUCED && !document.hidden && !$("#work").classList.contains("revealing") && (i === autoI || i === hoverI);
    t.classList.toggle("playing", on);
    if (on && v.paused) v.play().catch(() => {}); else if (!on && !v.paused) v.pause(); });
  const tileIO = new IntersectionObserver((es) => { es.forEach((e) => { const i = tiles.indexOf(e.target); e.isIntersecting ? inView.add(i) : inView.delete(i); }); syncVideos(); }, { rootMargin: "120px 0px" });
  tiles.forEach((t) => tileIO.observe(t));
  document.addEventListener("visibilitychange", syncVideos);
  // the rail: every product, one tap away, without going back to the wall
  const railBtns = products.map((f, i) => { const b = el("button"); b.type = "button"; b.append(el("span", "rn", pad(i + 1)), el("span", "rt", f.title));
    b.setAttribute("aria-label", f.title); b.addEventListener("click", () => wallOpen(i)); wsRail.appendChild(b); return b; });
  const wsNext = el("button", "ws-next"); wsNext.type = "button"; wStage.appendChild(wsNext);
  wsNext.addEventListener("click", () => { wallOpen((wallI + 1) % products.length); go(wallEl, -80); });
  const infoFill = (f, i) => {
    const [st] = status(f), c = copy(f); wsInfo.replaceChildren();
    wsInfo.append(el("p", "ws-n", pad(i + 1) + " · " + S.kind[f.code] + " · " + (PRIVATE[f.code] ? "Private" : st)), el("h3", "ws-name", f.title), el("p", "ws-does", DOES[f.code][0]));
    const how = el("ol", "ws-how"); DOES[f.code][1].forEach(([t, d]) => { const li = el("li"); li.append(el("b", null, t), el("span", null, d)); how.appendChild(li); });
    wsInfo.append(el("p", "ws-howk", "How it works"), how);
    const nums = el("div", "ws-nums");
    (c.numbers || f.numbers || []).slice(0, 2).forEach(([v, l]) => { const d = el("div"); d.append(el("b", null, v), el("span", null, (l === "dated calls" ? "market calls" : l).replace(/\s*·\s*\d{1,2} [A-Z][a-z]{2,8}( \d{4})?$/, ""))); nums.appendChild(d); });
    wsInfo.appendChild(nums);
    const lk = el("div", "ws-links");
    if (PRIVATE[f.code]) wsInfo.append(lk, el("p", "ws-note", "Private. It runs for a client, so there is no public link. The screens are from the real product."));
    else {
      const use = el("button", "ws-use", "Use it here"); use.type = "button"; use.addEventListener("click", () => { const sh = $(".shield", win); if (sh) sh.click(); }); lk.appendChild(use);
      f.links.slice(0, 2).forEach(([l, u]) => { const a = el("a", null, l + " ↗"); a.href = u; a.target = "_blank"; a.rel = "noopener"; a.dataset.cur = "Open"; lk.appendChild(a); });
      wsInfo.appendChild(lk);
      if (SIGNIN[f.code]) wsInfo.appendChild(el("p", "ws-note", "Here it runs as a guest. To " + SIGNIN[f.code] + ", open the full site."));
    }
    { const lk = $(".ws-links", wsInfo), note = $(".ws-note", wsInfo), d = $(".ws-does", wsInfo); if (lk) d.after(lk); if (note && lk) lk.after(note); } // the doors first, then how it works
    wsNext.textContent = "Next: " + products[(i + 1) % products.length].title + " →"; // phones: the rail is hidden, this walks the eight in order
    railBtns.forEach((b, k) => b.classList.toggle("on", k === i));
  };
  // the stage opens from the screen you picked: a clip that grows from that screen's rectangle to the whole stage
  const tileClip = (i) => { const t = tiles[i].getBoundingClientRect(), s = wStage.getBoundingClientRect();
    return `inset(${t.top - s.top}px ${s.right - t.right}px ${s.bottom - t.bottom}px ${t.left - s.left}px round 14px)`; };
  // the stage can be taller than the wall; the pinned section's spacer must learn the new height, or About would slide under it
  const holdHeight = () => { const v = wallI >= 0 ? wStage.offsetHeight + "px" : ""; if (wallEl.style.minHeight === v) return;
    wallEl.style.minHeight = v; if (revealST && window.ScrollTrigger) ScrollTrigger.refresh(); };
  new ResizeObserver(() => requestAnimationFrame(holdHeight)).observe(wStage); // next frame: resizing inside the callback loops the observer
  function wallOpen(i, fromOutside) {
    const f = products[i], first = wallI < 0; wallI = i;
    paint(wStage, f); infoFill(f, i); wStage.setAttribute("aria-label", f.title);
    if (stageST) { stageST.kill(); stageST = null; }
    stageSeen = true; win.style.clipPath = "none";
    if (first) {
      wStage.hidden = false; select(i, false); placeStage(); holdHeight(); wGrid.classList.add("under"); syncVideos();
      // the whole stage on screen: its top under the header (or as high as the page allows)
      const top = wallEl.getBoundingClientRect().top; if (fromOutside || top < 60 || top + wStage.offsetHeight > innerHeight) go(wallEl, -80);
      if (gsap) { gsap.killTweensOf(wStage);
        gsap.fromTo(wStage, { clipPath: tileClip(i) }, { clipPath: "inset(0px 0px 0px 0px round 18px)", duration: 0.8, ease: "expo.inOut", onComplete: () => { wStage.style.clipPath = ""; } });
        gsap.from(wsInfo.children, { opacity: 0, y: 18, duration: 0.6, ease: "power3.out", stagger: 0.05, delay: 0.4 }); }
      $("#wsBack").focus({ preventScroll: true });
    } else select(i, false);
    loadSite();
  }
  function wallClose() {
    if (wallI < 0) return; const i = wallI; win.classList.remove("active");
    const done = () => { wStage.hidden = true; wStage.style.clipPath = ""; wallI = -1; holdHeight(); syncVideos(); tiles[i].focus({ preventScroll: true }); };
    wGrid.classList.remove("under");
    if (!gsap) return done();
    gsap.killTweensOf(wStage);
    gsap.fromTo(wStage, { clipPath: "inset(0px 0px 0px 0px round 18px)" }, { clipPath: tileClip(i), duration: 0.65, ease: "expo.inOut", onComplete: done });
  }
  $("#wsBack").addEventListener("click", wallClose);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && WALL && wallI >= 0 && !win.classList.contains("active")) wallClose(); });
  // the control room is the Work section (the founder's pick, 2026-09-24); the list stays hidden, its rows only
  // carry the selection state the live window uses
  function setMode(v) {
    WALL = v === "wall"; root.classList.toggle("wall-mode", WALL); $(".wk").hidden = WALL; wallEl.hidden = !WALL;
    placeStage(); syncVideos(); if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  setMode("wall");
  // every other way into a product (the hero dots, the tool map, the receipts) opens it in whichever layout is showing
  function showProduct(k) {
    if (WALL && revealST && revealST.progress < 1) scrollTo({ top: revealST.end + 2, behavior: "auto" }); // straight past the reveal
    if (WALL) wallOpen(k, true); else select(k, true); }

  addEventListener("resize", () => { fit(); fitName(); placeStage(); if (window.Airport && Airport.canvas) Airport.resize(); if (arrivals) arrivals.resize(); });

  /* ---------- skills as a receipt rpPrinterEl: pick a skill, a receipt prints line by line with where it runs and what
     it does there; rpPrinting the next one tears the old receipt off onto a rpPileEl. Every line comes from the code audit
     of 2026-09-23 (file evidence in the vault, Daily/2026-09-23). No dates, no claims beyond what is in the code. ---------- */
  // letters: C Conxto, U UnboundPDF, F FarmQuick, L Lab, G Forge, P PitchRadar, X Conxfolio, T Trading
  const RCPT = [
    ["Python", [["L", "96 files · the FastAPI control plane"], ["G", "346 files · the whole engine"], ["T", "about 250 files · the market bots"], ["C", "3 files · a job-board harvester"]]],
    ["TypeScript", [["C", "the whole product · a Fastify API"], ["P", "the server and the app"], ["L", "the services app and its runtime"], ["X", "its API, shared with Conxto"], ["F", "the Cloudflare Worker"], ["G", "the studio extension"]]],
    ["AI agents", [["C", "5 agents on one memory per account"], ["P", "7 agents, each with its own receipts"], ["L", "a crew of 44 specialist agents, a reviewer on every result"], ["F", "Lead Desk, every morning"]]],
    ["AI models", [["C", "Anthropic · Gemini · DeepSeek · Groq · Mistral"], ["G", "Mistral · Groq · Gemini · Ollama · OpenRouter"], ["L", "DeepSeek · Groq"], ["F", "DeepSeek"], ["P", "DeepSeek"], ["T", "Claude, as a reviewer"]]],
    ["Evaluating AI", [["G", "hidden tests in a separate box · 9–10 cheating probes per exam"], ["L", "279 of 327 scenario tests passing"], ["C", "an eval harness with golden sets"], ["P", "golden cases for the ranking"], ["F", "an eval harness for the model calls"]]],
    ["PostgreSQL", [["C", "Drizzle · pgvector · a job queue"], ["X", "through Conxto's API"], ["L", "the control plane's database"], ["P", "Postgres 16"], ["F", "Lead Desk's store"]]],
    ["React & Astro", [["C", "React · Vite · three.js"], ["L", "React Flow graph editor"], ["P", "React 19"], ["G", "the studio extension"], ["F", "the ordering site, in Astro"]]],
    ["WebAssembly", [["U", "Tesseract OCR · libheif · an ONNX model, all in the tab"]]],
    ["OCR & documents", [["U", "Tesseract in the browser · pdf.js · pdf-lib"], ["X", "reads any résumé: pdf.js · Tesseract · mammoth"], ["C", "pdf.js · mammoth"], ["L", "tesseract.js · pypdf"]]],
    ["Docker", [["L", "no-network sandboxes · Compose"], ["G", "11 Dockerfiles · network switched off"], ["P", "the production Compose file"], ["F", "Lead Desk's dashboard and cron"]]],
    ["Linux servers", [["C", "19 systemd units"], ["U", "systemd · Caddy · nginx"], ["F", "self-hosted n8n behind Caddy"], ["L", "systemd services"], ["G", "a Caddy site"], ["P", "Compose · systemd timers"], ["X", "systemd · Caddy"], ["T", "systemd"]]],
    ["Cloudflare", [["F", "a Worker · D1 · Turnstile"], ["L", "built with the Cloudflare Vite plugin"]]],
    ["WebSockets", [["T", "live feeds from Binance and Kraken"]]],
    ["Automation", [["F", "n8n → WhatsApp and email to the owner"], ["P", "n8n flows"], ["L", "31 Activepieces packages"], ["C", "Gmail · Telegram · web push"]]],
    ["Testing", [["P", "620 tests · vitest"], ["U", "471 tests · Playwright"], ["F", "408 tests · node:test"], ["L", "node:test · pytest"], ["G", "pytest"], ["C", "129 test scripts"]]],
    ["Design systems", [["X", "251 design tokens · one design canon"], ["U", "a 59-token theme"], ["C", "a 58-token system"], ["L", "a UI kit with tokens"]]],
    ["MCP servers", [["F", "an MCP server with no dependencies"]]],
    ["Swift", []],
  ];
  const openProduct = (k) => showProduct(k);
  const rp = $("#rp"), rpKeysEl = $("#rpKeys"), rpOutEl = $("#rpOut"), rpPileEl = $("#rpPile"), rpCountEl = $("#rpCount"), rpStatusEl = $("#rpStatus"), rpPrinterEl = $("#rpPrinter");
  const RW = 32; // characters across the rpPaper
  const rpDots = (a, b) => a + " " + ".".repeat(Math.max(2, RW - a.length - b.length - 2)) + " " + b;
  const rpHash = (t) => [...t].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  // built as SVG elements (never a string of HTML: the page runs with no HTML-from-strings at all)
  const rpBarcode = (t) => { const NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 222 34"); svg.setAttribute("preserveAspectRatio", "none");
    let h = rpHash(t), x = 0; while (x < 220) { h = (h * 1103515245 + 12345) >>> 0; const w = 1 + (h >>> 16) % 4, r = document.createElementNS(NS, "rect");
      r.setAttribute("x", x); r.setAttribute("width", w); r.setAttribute("height", 34); svg.appendChild(r); x += w + 1 + ((h >>> 8) % 3); } return svg; };
  let rpPrinting = null, rpPrinted = 0, rpCur = null, rpKeyBtns = [];
  const rpPrint = (i) => {
    const [name, lines] = RCPT[i];
    rpKeyBtns.forEach((b, j) => b.classList.toggle("on", j === i));
    if (rpPrinting) rpPrinting.kill();
    // rpTear the last one off onto the rpPileEl
    if (rpCur) { const old = rpCur; rpCur = null; rpTear(old); }
    const rpPaper = el("div", "rcpt"), inner = el("div", "rc-in");
    const rpRow = (t, cls) => { const r = el("div", "rl" + (cls ? " " + cls : ""), t); inner.appendChild(r); return r; };
    rpRow("VAMSI VENKATESH", "c b"); rpRow("SKILL RECEIPT", "c");
    rpRow("-".repeat(RW), "dim");
    rpRow(rpDots("SKILL", name.toUpperCase()), "b");
    rpRow("-".repeat(RW), "dim");
    if (!lines.length) { rpRow("Not in these eight products."); rpRow("A private macOS agent."); }
    lines.forEach(([L, what]) => { const k = S.order.indexOf(LETTER[L]), f = products[k];
      const r = el("button", "rl item"); r.type = "button"; r.dataset.cur = "Open";
      r.append(el("b", null, f.title), el("span", null, what)); r.addEventListener("click", () => openProduct(k)); inner.appendChild(r); });
    rpRow("-".repeat(RW), "dim");
    const n = lines.length;
    rpRow(rpDots("IN", n === 8 ? "ALL 8 PRODUCTS" : n + " OF 8 PRODUCTS"), "b");
    rpRow(rpDots("CHECKED IN THE CODE", n ? "YES ✓" : "-"));
    const bc = el("div", "rl bc"); bc.appendChild(rpBarcode(name)); inner.appendChild(bc);
    rpRow("thank you for looking", "c dim hand");
    rpPaper.appendChild(inner); rpOutEl.appendChild(rpPaper); rpCur = rpPaper;
    rpPrinted++; rpCountEl.textContent = rpPrinted > 1 ? (rpPrinted - 1) + " printed" : "";
    if (!window.gsap || REDUCED) return;
    // line feed: the rpPaper comes rpOutEl in small jerks while the rpPrinterEl hums
    const h = rpPaper.offsetHeight, steps = Math.max(8, Math.round(h / 22));
    rpStatusEl.textContent = "PRINTING";
    rpPrinting = gsap.timeline({ onComplete: () => { rpStatusEl.textContent = "READY"; rpPrinterEl.classList.remove("busy"); } })
      .call(() => rpPrinterEl.classList.add("busy"))
      .fromTo(rpPaper, { y: -h }, { y: 0, duration: steps * 0.075, ease: `steps(${steps})` })
      .from(inner.children, { opacity: 0, duration: 0.01, stagger: (steps * 0.075) / inner.children.length }, 0);
  };
  const rpTear = (old) => {
    if (!window.gsap || REDUCED) { old.remove(); return; }
    if (!rpPileEl.offsetParent) { old.remove(); return; } // no pile on small screens: the old receipt just goes
    const from = old.getBoundingClientRect(), to = rpPileEl.getBoundingClientRect();
    const fly = old.cloneNode(true); fly.classList.add("flying"); document.body.appendChild(fly);
    Object.assign(fly.style, { left: from.left + "px", top: from.top + "px", width: from.width + "px" });
    old.remove();
    const rot = (Math.random() - 0.5) * 22;
    gsap.to(fly, { x: to.left + to.width / 2 - from.left - from.width / 2, y: to.top + 30 - from.top, rotation: rot, scale: 0.42, duration: 0.7, ease: "power3.inOut",
      onComplete: () => { fly.remove(); const mini = el("i", "rp-mini"); mini.style.transform = `rotate(${rot}deg) translate(${(Math.random() - 0.5) * 16}px, ${rpPileEl.children.length * -3}px)`;
        rpPileEl.appendChild(mini); while (rpPileEl.querySelectorAll(".rp-mini").length > 7) rpPileEl.querySelector(".rp-mini").remove(); } });
  };
  rpKeyBtns = RCPT.map(([name, lines], i) => { const b = el("button", "rp-key"); b.type = "button";
    b.append(el("span", null, name), el("small", null, lines.length ? lines.length + " of 8" : "private"));
    b.addEventListener("click", () => { rpManual = true; rpPrint(i); }); rpKeysEl.appendChild(b); return b; });
    // phone: show that the key row scrolls: edge fades, a counted hint, and one gentle nudge the first time it is seen
  const rpScroll = rpKeysEl.parentElement, rpSwipe = $("#rpSwipe");
  $("#rpSwipeN").textContent = RCPT.length;
  const rpEdges = () => { const m = rpKeysEl.scrollWidth - rpKeysEl.clientWidth; rpScroll.classList.toggle("at-start", rpKeysEl.scrollLeft < 40); rpScroll.classList.toggle("at-end", rpKeysEl.scrollLeft > m - 40); };
  rpKeysEl.addEventListener("scroll", () => { rpEdges(); if (rpKeysEl.scrollLeft > 60) rpSwipe.classList.add("gone"); }, { passive: true });
  requestAnimationFrame(rpEdges); setTimeout(rpEdges, 500); addEventListener("resize", rpEdges);
  let rpNudged = false;
  new IntersectionObserver((es) => es.forEach((e) => { rpEdges(); if (!e.isIntersecting || rpNudged || REDUCED || rpKeysEl.scrollWidth <= rpKeysEl.clientWidth) return; rpNudged = true;
    setTimeout(() => { rpKeysEl.scrollTo({ left: 90, behavior: "smooth" }); setTimeout(() => rpKeysEl.scrollTo({ left: 0, behavior: "smooth" }), 650); }, 700); }), { threshold: 0.6 }).observe(rpKeysEl);
const rpListEl = $("#rpList"); RCPT.forEach(([n]) => { const o = el("option"); o.value = n; rpListEl.appendChild(o); });
  $("#rpType").addEventListener("submit", (e) => { e.preventDefault(); const q = $("#rpIn").value.trim().toLowerCase(); if (!q) return;
    const alias = { postgres: "postgresql", ts: "typescript", js: "typescript", py: "python", wasm: "webassembly", llm: "ai models", tests: "testing", docker: "docker", ocr: "ocr & documents" };
    const want = alias[q] || q; const i = RCPT.findIndex(([n]) => n.toLowerCase().startsWith(want) || n.toLowerCase().includes(want));
    if (i < 0) { rpStatusEl.textContent = "NOT FOUND"; setTimeout(() => (rpStatusEl.textContent = "READY"), 1400); return; }
    rpManual = true; rpPrint(i); $("#rpIn").value = ""; });
  // the first time it comes on screen it prints one on its own, so the idea explains itself
  let rpManual = false, rpSeen = false;
  new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !rpSeen) { rpSeen = true; setTimeout(() => { if (!rpManual) rpPrint(0); }, 500); } }), { threshold: 0.35 }).observe(rp);

  /* ---------- what I built to build with: a small live map. Four tools feed one workbench (me and my agents),
     and the workbench ships the eight products; red dots flow down the lines. My own words stay on each tool. ---------- */
  const TOOLS = [
    ["The Vault", "A written memory of every decision, so nothing starts from zero.", "A wiki second brain of every decision, state and rule across all my work. Any model, and any new thread, bootstraps from it in four reads instead of a blank chat."],
    ["Project Brain", "A checked map of the code, its tests and what really ran.", "Validated code graphs, tests and runtime evidence for six products, joined to the vault. Write-back is evidence-gated: a claimed fix needs the tests it ran."],
    ["MNEMA and RAG memory", "Memory for my agents, so they remember what they learned.", "Tenant-scoped agent memory with hybrid retrieval, so my agents recall what was learned instead of re-deriving it every run."],
    ["The VVDex Engine", "Describe the work; it compiles and runs the service by your rules.", "One paragraph compiles into a service contract: what runs by itself, what waits for the person you named, what never happens. A crew of specialist agents does the work, a reviewer checks every result, and every run is sealed."],
  ];
  const sysEl = $("#sys"), sysSvg = $("#sysLines"), sysCore = $("#sysCore"), SVGNS = "http://www.w3.org/2000/svg";
  // the hint says what actually works here: wide screens show a tool in this box, narrow ones open the card itself
  const scX = $("#scX"), SCX = scX.textContent.replace(/ Point at one.*$/, "");
  const sysHint = () => { scX.textContent = SCX + " " + (narrow() ? (FINE ? "Click" : "Tap") + " a tool above to see what it does." : (FINE ? "Point at" : "Tap") + " one to see what it does."); };
  // each tool's full sentence waits in the workbench box, stacked in one cell (see .sc-stack)
  const scItems = [$("#scStack .sc"), ...TOOLS.map(([t, , d]) => { const it = el("div", "sc"); it.append(el("b", null, t), el("span", null, d)); $("#scStack").appendChild(it); return it; })];
  // on narrow screens the workbench box sits below all four cards, so there a tapped card opens its own sentence (.st-d)
  const toolEls = TOOLS.map(([t, pl, d], i) => { const b = el("button", "sys-tool"); b.type = "button";
    b.append(el("span", "st-n", pad(i + 1)), el("b", null, t), el("span", "st-p", pl), el("span", "st-d", d)); $("#sysTools").appendChild(b); return b; });
  const prodEls = products.map((f, k) => { const b = el("button", "sys-prod"); b.type = "button"; b.dataset.cur = "Open";
    b.append(dot(status(f)[1] || ""), f.title);
    b.addEventListener("click", () => showProduct(k)); $("#sysProds").appendChild(b); return b; });
  let sysLinks = [], sysOn = false, sysTool = -1, sysProd = -1;
  const drawSys = () => {
    if (!sysEl.offsetWidth) return;
    sysSvg.setAttribute("viewBox", `0 0 ${sysEl.offsetWidth} ${sysEl.offsetHeight}`); sysSvg.replaceChildren(); sysLinks = [];
    // layout boxes, not screen rects: a card mid-reveal (or lifted on hover) is transformed, and the lines must meet its resting place
    const R = (e) => { let l = 0, t = 0; for (let n = e; n && n !== sysEl; n = n.offsetParent) { l += n.offsetLeft; t += n.offsetTop; }
      const w = e.offsetWidth, h = e.offsetHeight; return { l, r: l + w, t, b: t + h, cx: l + w / 2, cy: t + h / 2 }; };
    const f = (n) => n.toFixed(1), core = R(sysCore), spine = narrow();
    const link = (d, kind, i) => { const p = document.createElementNS(SVGNS, "path"); p.setAttribute("d", d); p.setAttribute("class", "sys-l"); sysSvg.appendChild(p);
      const dots = [0, 0.5].map((off) => { const c = document.createElementNS(SVGNS, "circle"); c.setAttribute("r", kind === "t" ? 4 : 3); c.setAttribute("class", "sys-dot"); c.setAttribute("opacity", 0); sysSvg.appendChild(c); return { c, off }; });
      sysLinks.push({ p, len: p.getTotalLength(), kind, i, dots }); };
    if (spine) { // one line down the left gutter: each tool joins it, it runs into the workbench, then drops into the products
      const gx = 11, r = 9, cy = core.cy;
      toolEls.forEach((t, i) => { const c = R(t);
        link(`M${f(c.l)} ${f(c.cy)} H${gx + r} Q${gx} ${f(c.cy)} ${gx} ${f(c.cy + r)} V${f(cy - r)} Q${gx} ${f(cy)} ${gx + r} ${f(cy)} H${f(core.l)}`, "t", i); });
      const pr = R($("#sysProds")), x = core.l + 30;
      link(`M${f(x)} ${f(core.b)} V${f(pr.t)}`, "p", -1);
    } else { // four tools fan into the workbench, the workbench fans out to the products
      const curve = (x1, y1, x2, y2) => { const my = (y1 + y2) / 2; return `M${f(x1)} ${f(y1)} C ${f(x1)} ${f(my)}, ${f(x2)} ${f(my)}, ${f(x2)} ${f(y2)}`; };
      toolEls.forEach((t, i) => { const c = R(t); link(curve(c.cx, c.b, core.cx, core.t), "t", i); });
      const ps = prodEls.map(R), oneRow = ps.every((c) => Math.abs(c.t - ps[0].t) < 4);
      if (oneRow) ps.forEach((c, i) => link(curve(core.cx, core.b, c.cx, c.t), "p", i));
      else link(curve(core.cx, core.b, core.cx, R($("#sysProds")).t), "p", -1); // when the products wrap, one line, so none crosses a chip
    }
    sysHint(); sysMark();
  };
  const sysMark = () => {
    toolEls.forEach((t, i) => t.classList.toggle("on", i === sysTool)); prodEls.forEach((t, i) => t.classList.toggle("on", i === sysProd));
    sysEl.classList.toggle("focus", sysTool >= 0);
    sysLinks.forEach((L) => L.p.classList.toggle("hot", L.i >= 0 && ((L.kind === "t" && L.i === sysTool) || (L.kind === "p" && L.i === sysProd))));
    scItems.forEach((it, i) => it.classList.toggle("on", i === sysTool + 1));
    toolEls.forEach((t, i) => (narrow() ? t.setAttribute("aria-expanded", String(i === sysTool)) : t.removeAttribute("aria-expanded"))); // only narrow cards open
  };
  // wide: point (or focus) shows a tool in the workbench box. Narrow: a card opens and closes on a click only, so cards never
  // grow under a moving pointer. On touch a tap also fires focus before the click, so "tap again to close" is judged at touch-down.
  toolEls.forEach((t, i) => { let wasOn = false;
    t.addEventListener("mouseenter", () => { if (!narrow()) { sysTool = i; sysMark(); } }); t.addEventListener("focus", () => { if (!narrow()) { sysTool = i; sysMark(); } });
    t.addEventListener("pointerdown", () => { wasOn = sysTool === i; });
    t.addEventListener("click", (e) => { sysTool = narrow() ? (sysTool === i ? -1 : i) : !FINE && e.detail !== 0 && wasOn ? -1 : i; wasOn = false; sysMark(); }); });
  $("#sysTools").addEventListener("mouseleave", () => { if (!narrow()) { sysTool = -1; sysMark(); } });
  prodEls.forEach((t, i) => { t.addEventListener("mouseenter", () => { sysProd = i; sysMark(); }); t.addEventListener("mouseleave", () => { sysProd = -1; sysMark(); }); });
  new ResizeObserver(() => requestAnimationFrame(drawSys)).observe(sysEl);
  new IntersectionObserver((es) => es.forEach((e) => (sysOn = e.isIntersecting))).observe(sysEl);
  const flowSys = () => { if (!sysOn || REDUCED) return; const t = performance.now() / 1000;
    sysLinks.forEach((L) => { const hot = L.i >= 0 && ((L.kind === "t" && L.i === sysTool) || (L.kind === "p" && L.i === sysProd)), sp = hot ? 0.8 : 0.28;
      L.dots.forEach((d) => { const u = (t * sp + d.off + L.i * 0.137) % 1, pt = L.p.getPointAtLength(u * L.len);
        d.c.setAttribute("cx", pt.x.toFixed(1)); d.c.setAttribute("cy", pt.y.toFixed(1)); d.c.setAttribute("opacity", Math.sin(u * Math.PI).toFixed(2)); }); }); };

  /* ---------- the route so far: Bengaluru to Magdeburg as a flight, drawn as you scroll past it ---------- */
  const tripMap = $("#tripMap"), tripSvg = $("#tripSvg"), passes = [...document.querySelectorAll(".pass")];
  let trip = null, tripP = 0;
  const drawTrip = () => {
    const w = tripMap.clientWidth, h = tripMap.clientHeight; if (!w) return;
    tripSvg.setAttribute("viewBox", `0 0 ${w} ${h}`); tripSvg.replaceChildren();
    const mb = tripMap.getBoundingClientRect(), cxOf = (p) => { const r = p.getBoundingClientRect(); return r.left + r.width / 2 - mb.left; };
    const x0 = narrow() ? w * 0.1 : cxOf(passes[0]), x2 = narrow() ? w * 0.9 : cxOf(passes[2]), xm = (x0 + x2) / 2, y0 = h - 36, top = 26, cy = 2 * top - y0;
    const mkp = (cls) => { const p = document.createElementNS(SVGNS, "path"); p.setAttribute("d", `M${x0} ${y0} Q ${xm} ${cy} ${x2} ${y0}`); p.setAttribute("class", cls); tripSvg.appendChild(p); return p; };
    mkp("tr-route"); const done = mkp("tr-done"), len = done.getTotalLength();
    done.style.strokeDasharray = len; done.style.strokeDashoffset = len;
    // the two ends are named under their stops (the plane comes and goes above them); the middle stop is the master's, named in its pass
    const stops = [[x0, y0, "Bengaluru"], [xm, top], [x2, y0, "Magdeburg"]].map(([x, y, n]) => {
      const c = document.createElementNS(SVGNS, "circle"); c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 7); c.setAttribute("class", "tr-stop"); tripSvg.appendChild(c);
      if (n) { const tx = document.createElementNS(SVGNS, "text"); tx.setAttribute("class", "tr-city"); tx.textContent = n;
        tx.setAttribute("x", x); tx.setAttribute("y", y + 28); tx.setAttribute("text-anchor", "middle"); tripSvg.appendChild(tx); }
      return c; });
    // the plane: ink, with a red tail, like the ones over my name
    const plane = document.createElementNS(SVGNS, "g"), inner = document.createElementNS(SVGNS, "g");
    inner.setAttribute("transform", `scale(${narrow() ? 46 : 64})`); plane.appendChild(inner);
    [["M-0.46 -0.12 L0.38 -0.13 Q0.5 -0.125 0.51 -0.088 Q0.5 -0.05 0.4 -0.048 L-0.36 -0.05 Q-0.46 -0.07 -0.5 -0.11 Z", "#111110"], ["M-0.43 -0.12 L-0.5 -0.3 L-0.42 -0.3 L-0.29 -0.125 Z", "#ff3b1f"],
     ["M-0.08 -0.075 L0.12 -0.075 L-0.14 -0.025 Z", "#111110"], ["M-0.42 -0.095 L-0.3 -0.095 L-0.47 -0.07 Z", "#111110"],
     ["M-0.025 -0.04 a0.075 0.022 0 1 0 0.15 0 a0.075 0.022 0 1 0 -0.15 0 Z", "#111110"]].forEach(([d, f]) => { const q = document.createElementNS(SVGNS, "path"); q.setAttribute("d", d); q.setAttribute("fill", f); inner.appendChild(q); });
    const wins = document.createElementNS(SVGNS, "line"); // the row of windows
    [["x1", -0.32], ["y1", -0.102], ["x2", 0.36], ["y2", -0.102], ["stroke", "#ecebe6"], ["stroke-width", 0.013], ["stroke-dasharray", "0.013 0.015"]].forEach(([k, v]) => wins.setAttribute(k, v)); inner.appendChild(wins);
    tripSvg.appendChild(plane);
    trip = { done, len, stops, plane }; setTrip(tripP);
  };
  const setTrip = (p) => { tripP = p; if (!trip) return;
    trip.done.style.strokeDashoffset = (trip.len * (1 - p)).toFixed(1);
    const a = trip.done.getPointAtLength(p * trip.len), b = trip.done.getPointAtLength(Math.min(trip.len - 1, p * trip.len) + 1);
    const ang = Math.atan2(b.y - a.y, b.x - a.x) * 57.3 * (1 - Math.max(0, (p - 0.9) / 0.1)); // it levels out as it touches down
    trip.plane.setAttribute("transform", `translate(${a.x.toFixed(1)} ${(a.y + 2).toFixed(1)}) rotate(${ang.toFixed(1)})`);
    passes.forEach((ps, i) => { const on = p >= +ps.dataset.at - 0.02; ps.classList.toggle("on", on); trip.stops[i].classList.toggle("on", on); });
  };
  new ResizeObserver(() => requestAnimationFrame(drawTrip)).observe(tripMap);

  /* ---------- About, the sentence that proves itself (PROTOTYPE: beats 1 and 2). The statement takes the screen; as
     each claim is read, its proof arrives: "Eight products" brings the eight real screens, "the live ones run on servers
     I administer" checks those sites from the visitor's own browser, right then. Nothing stored, nothing claimed. ---------- */
  const pf = $("#pf"), pfWords = [], pfShotEls = [], pfChips = [];
  let pfPinged = false;
  if (pf) {
    $(".about").classList.add("has-pf");
    const say = $("#pfSay"), words = say.textContent.trim().split(/\s+/); say.textContent = "";
    words.forEach((w, i) => { const last = i === words.length - 1, sp = el("span", "pw", last ? w.replace(/\.$/, "") : w);
      if (last) { sp.appendChild(el("i", "d pf-stop")); sp.setAttribute("aria-label", w); } // the red dot is the full stop
      say.append(sp); if (!last) say.append(" "); pfWords.push(sp); });
    // the eight real screens land in a grid under the words, on the same spots where each one's live check appears next
    products.forEach((f, i) => { const sh = el("div", "pf-shot" + (DARKF[f.code] ? " dark" : "")), im = el("img");
      sh.style.setProperty("--f", FIELD[f.code][0]);
      im.src = mv(PRIVATE[f.code] ? "peek/" + f.shots2[0][0].split("/").pop().replace(".jpg", ".webp") : "loops/" + TALL[f.code] + ".webp"); im.alt = ""; im.loading = "lazy";
      sh.append(im, el("span", null, f.title)); $("#pfShots").appendChild(sh); pfShotEls.push(sh); });
    // the live check: one chip per product
    const live = $("#pfLive"), head = el("p", "pf-lh", "Checked from your browser, right now"), row = el("div", "pf-lrow"), sum = el("p", "pf-sum");
    // UnboundPDF sends "Cross-Origin-Resource-Policy: same-origin" on every address (checked with curl, 2026-09-24): by its
    // own privacy setting no other site can read it, so a browser check from here would always fail. It is not pinged,
    // and its chip says why, instead of wrongly saying it is down.
    const NOPING = { "VV 105": ["refuses outside checks, by design", "by design"] };
    products.forEach((f) => { const c = el("div", "pf-chip"), st = el("span", "pf-st"), lg = el("span", "pf-long"), sh = el("span", "pf-short");
      const note = PRIVATE[f.code] ? ["private, runs for a client", "private"] : NOPING[f.code] || ["waiting", "…"];
      lg.textContent = note[0]; sh.textContent = note[1]; st.append(dot(), lg, sh);
      c.append(el("b", null, f.title), el("span", "pf-dom", PRIVATE[f.code] ? "no public address" : host(f.links[0][1]).split("/")[0]), st);
      if (PRIVATE[f.code] || NOPING[f.code]) c.classList.add("priv"); row.appendChild(c);
      pfChips.push({ c, lg, sh, f, url: PRIVATE[f.code] || NOPING[f.code] ? null : f.links[0][1] }); });
    live.append(head, row, sum);
    // the standard: test counts already on this page (the skill receipts, checked in the code). Exact from the first
    // frame: they rise into place, they never count up (a screenshot mid-count would show a wrong number)
    [["620", "PitchRadar tests"], ["471", "UnboundPDF tests"], ["408", "FarmQuick tests"], ["17", "VVDex exams, each attacked before use"]].forEach(([v, l]) => {
      const n = el("div", "pf-n"), vw = el("span", "pf-nv"); vw.appendChild(el("b", null, v)); n.append(vw, el("small", null, l)); $("#pfNums").appendChild(n); });
    $("#pfCap").textContent = "Live check from your browser: waiting";
    // the proof area is the space under the words; the grid of screens is as large as it allows (two rows of 16:10 + captions)
    const fitShots = () => { const g = $("#pfShots"), proof = $("#pfProof"); proof.style.height = "";
      const top = proof.getBoundingClientRect().top - pf.getBoundingClientRect().top, avail = Math.max(180, pf.clientHeight - top - 70), gap = 10, cap = 30, full = proof.clientWidth; // 70: room for the scroll cue
      proof.style.height = avail + "px";
      const w = Math.max(60, Math.min((full - 3 * gap) / 4, ((avail - gap) / 2 - cap) / 0.625));
      g.style.width = Math.round(4 * w + 3 * gap) + "px"; };
    const fitAll = () => fitShots();
    fitAll(); addEventListener("resize", fitAll); if (document.fonts) document.fonts.ready.then(fitAll); window.__pfFit = fitAll;
  }
  // a real request from this browser to each live site; the time is from asking to the first answer (DNS and TLS
  // included, as a visitor would feel it). No cookies are sent, nothing is read; a site that does not answer says so.
  const pfPing = () => { if (!pf || pfPinged) return; pfPinged = true;
    const todo = pfChips.filter((x) => x.url), res = []; let shown = 0;
    const sumEl = $(".pf-sum"), say = (x, long, short) => { x.lg.textContent = long; x.sh.textContent = short; };
    const show = (x, ms) => { const at = shown++ * 170; setTimeout(() => {
      // a failed request is not proof a site is down (a blocker or a network can stop it too), so it only says what we know
      if (ms == null) { x.c.classList.add("bad"); say(x, "no answer to this browser", "no answer"); }
      else { x.c.classList.add("ok"); say(x, "answered in " + ms + " ms", ms + " ms"); } // the exact time at once: no count-up
      if (res.length === todo.length && shown === todo.length) { const ok = res.filter((r) => r != null);
        sumEl.textContent = ok.length + " of " + todo.length + " live sites answering now" + (ok.length ? " · fastest " + Math.min(...ok) + " ms" : "") + " · measured from your browser";
        $("#pfCap").textContent = "Live check from your browser: " + ok.length + " of " + todo.length + " sites answering" + (ok.length ? " · fastest " + Math.min(...ok) + " ms" : ""); }
    }, at); };
    $("#pfCap").textContent = "Live check from your browser: checking…";
    todo.forEach((x) => { say(x, "checking…", "…"); const t0 = performance.now(), ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 8000);
      fetch(x.url, { mode: "no-cors", cache: "no-store", credentials: "omit", signal: ctl.signal })
        .then(() => { const ms = Math.round(performance.now() - t0); ctl.abort(); res.push(ms); show(x, ms); }) // answered: stop there, the page itself is not needed
        .catch(() => { res.push(null); show(x, null); }).finally(() => clearTimeout(to)); }); };

  /* ---------- scrolling ---------- */
  function go(target, off = -40) { const t = typeof target === "string" ? $(target) : target; if (!t) return;
    // "Work" means the finished wall: the end of the reveal, never its start
    if (t.id === "work" && revealST) { scrollTo({ top: revealST.end + 2, behavior: REDUCED ? "auto" : "smooth" }); return; }
    if (t.id === "about" && pfST) { scrollTo({ top: pfST.end + 2, behavior: REDUCED ? "auto" : "smooth" }); return; } // "About" = the finished statement
    scrollTo({ top: t.getBoundingClientRect().top + scrollY + off, behavior: REDUCED ? "auto" : "smooth" }); }
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); go(a.getAttribute("href")); }));

  /* ---------- the hero full stop: hover it and it opens into the products ---------- */
  const big = $("#bigDot"), lens = $("#lens"), lensL = $("#lensL");
  const peekSrc = (f) => f.shots2[0] ? mv("peek/" + f.shots2[0][0].split("/").pop().replace(".jpg", ".webp")) : "";
  const peeks = products.map((f, k) => [peekSrc(f), f.title, k]).filter((p) => p[0]);
  // light copies, fetched once the page is idle rather than competing with the first paint
  const warm = () => peeks.forEach(([src]) => { const im = new Image(); im.src = src; });
  if (window.requestIdleCallback) requestIdleCallback(warm, { timeout: 2500 }); else setTimeout(warm, 1500);
  let pi = 0, lensTimer = 0, closeT = 0;
  const lensShow = (p) => { lens.style.backgroundImage = `url("${p[0]}")`; lensL.textContent = p[1]; };
  const lensStep = () => { lensShow(peeks[pi % peeks.length]); pi++; };
  const openLens = (only) => { clearTimeout(closeT); clearInterval(lensTimer); big.classList.add("open");
    if (only != null) { lensShow(peeks.find((p) => p[2] === only) || peeks[0]); return; } lensStep(); lensTimer = setInterval(lensStep, 1100); };
  const closeLens = () => { big.classList.remove("open"); clearInterval(lensTimer); closeT = setTimeout(() => { lens.style.backgroundImage = ""; }, 700); };
  big.addEventListener("mouseenter", () => openLens()); big.addEventListener("mouseleave", closeLens);
  big.addEventListener("focus", () => openLens()); big.addEventListener("blur", closeLens);
  big.addEventListener("click", () => { closeLens(); go("#work"); });
  // eight small dots, one per product
  const pdots = $("#pdots");
  products.forEach((f, k) => { const [st, cls] = status(f), b = el("button", cls || null); b.type = "button"; b.setAttribute("aria-label", f.title + " · " + st);
    b.addEventListener("mouseenter", () => { openLens(k); if (window.Airport && Airport.canvas) Airport.takeoff(f.title); }); b.addEventListener("focus", () => openLens(k));
    b.addEventListener("mouseleave", closeLens); b.addEventListener("blur", closeLens);
    b.addEventListener("click", () => { closeLens(); openProduct(k); }); pdots.appendChild(b); });

  /* ---------- cursor: the dot follows you, and says what a click will do ---------- */
  if (FINE) {
    document.querySelectorAll(".c-big").forEach((a) => (a.dataset.cur = "Write"));
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; cur.classList.add("on"); }, { passive: true });
    root.addEventListener("pointerleave", () => cur.classList.remove("on"));
    const loop = () => { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); }; loop();
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest ? e.target.closest("[data-cur], .win.active, #bigDot, .pd-row") : null;
      cur.classList.remove("lab", "peek", "gone"); cur.style.backgroundImage = ""; curL.textContent = "";
      if (!t) return;
      if (t.id === "bigDot" || t.classList.contains("pd-row") || t.classList.contains("win")) { cur.classList.add("gone"); return; }
      const li = t.closest(".index li");
      if (t.dataset.peek) { if (li && li.classList.contains("on")) return; cur.classList.add("peek"); cur.style.backgroundImage = `url("${t.dataset.peek}")`; curL.textContent = "Show it"; return; }
      cur.classList.add("lab"); curL.textContent = t.dataset.cur;
    }, { passive: true });
  }

  let arrivals = null; // declared before the early return below: the static path (motion turned off) needs it too
  const startAirport = () => {
    if (window.Airport && !Airport.canvas) Airport.init($("#airfield"), $(".hero-foot"), products.map((f) => f.title), $("#airfront"));
    // the footer is arrivals: a plane comes in to land under "Write to me"
    if (window.makeAirport && !arrivals) { arrivals = makeAirport(true); arrivals.init($("#arrivals"), $(".c-row"), [""]); }
  };
  if (pf) new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && (!window.gsap || REDUCED)) pfPing(); }), { threshold: 0.4 }).observe(pf);
  const finishStatic = () => { root.classList.add("done", "reduced"); stageSeen = true; win.style.clipPath = "none"; loadSite(); fitName(); startAirport(); setTrip(1); sysEl.classList.add("ready"); };
  if (!gsap) { document.fonts.ready.then(finishStatic); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // native scrolling: a smoothing layer (Lenis) added latency and fought every nested scroller (the live sites,
  // the game, the phone's own momentum), which is what felt laggy or stuck; the browser's own scroll never does
  gsap.to("#railDot", { top: "100%", ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.4 } });

  document.fonts.ready.then(() => {
    fitName(); startAirport();
    // the window opens from the dot the first time you reach the work
    gsap.set(seed, { opacity: 1, scale: 0.6 });
    if (!WALL) stageST = ScrollTrigger.create({ trigger: stage, start: "top 75%", once: true, onEnter: () => {
      stageSeen = true; loadSite();
      gsap.timeline().to(seed, { scale: 2.2, duration: 0.35, ease: "power2.out" })
        .fromTo(win, { clipPath: "circle(1% at 50% 50%)" }, { clipPath: OPEN, duration: 1.1, ease: "expo.inOut" }, 0.15)
        .to(seed, { opacity: 0, scale: 0.5, duration: 0.3 }, 0.4).set(win, { clipPath: "none" });
    } });
    gsap.from(".index li", { opacity: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.05, scrollTrigger: { trigger: ".index", start: "top 88%" } });
    gsap.from(".ab-two > *", { opacity: 0, y: 40, duration: 1.1, ease: "power3.out", stagger: 0.1, clearProps: "transform", scrollTrigger: { trigger: ".about", start: "top 75%" } }); // no leftover transform: the card inside is pinned
    gsap.from(".sk-block", { opacity: 0, y: 50, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: ".sk-block", start: "top 85%" } });
    gsap.from(".sys-tool", { opacity: 0, y: 30, duration: 1, ease: "power3.out", stagger: 0.08, clearProps: "transform,opacity", onComplete: () => sysEl.classList.add("ready"), scrollTrigger: { trigger: ".sys", start: "top 85%" } });
    ScrollTrigger.create({ trigger: "#trip", start: "top 80%", end: "bottom 62%", scrub: 0.6, onUpdate: (self) => setTrip(self.progress) });
    gsap.ticker.add(liveName); gsap.ticker.add(flowSys);

    /* ---------- the dot travels with you: the full stop of my name leaves it on the first scroll and becomes, in
       turn, the light of the screen playing on the wall, the full stop of the About headline, the printer's light,
       the workbench light, the stop at Bengaluru, and the full stop of "Write to me". Native scroll, no pinning:
       the dot is where the scroll puts it. ---------- */
    const tv = el("i", "traveler"); tv.setAttribute("aria-hidden", "true"); document.body.appendChild(tv);
    const ANCH = [() => big, () => $("#wCore"), () => $(".ab-big .d"), () => $("#pf .pf-stop"), () => $(".rp-top .d"),
      () => $(".sys-core > .d"), () => $("#tripSvg .tr-stop"), () => $(".c-big .d")];
    let tvDirty = true, tvHidden = [];
    addEventListener("scroll", () => (tvDirty = true), { passive: true }); addEventListener("resize", () => (tvDirty = true));
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const moveDot = () => {
      if (!tvDirty && !(wallI < 0 && WALL)) return; tvDirty = false;
      const els = ANCH.map((f) => f()), pts = els.map((e) => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2, s: r.width, e } : null; }).filter(Boolean);
      const F = innerHeight * 0.52; let k = -1;
      for (let i = 0; i < pts.length; i++) if (pts[i].y <= F) k = i;
      tvHidden.forEach((e) => e.classList.remove("tv-away")); tvHidden = [];
      if (k < 0 || !root.classList.contains("done")) { tv.style.opacity = 0; return; } // not yet: the dot is still the full stop of my name
      if (revealST && revealST.progress > 0.001 && revealST.progress < 0.999) { tv.style.opacity = 0; big.classList.add("tv-away"); tvHidden.push(big); return; } // it is the flood now
      if (pfST && pfST.progress > 0.001 && pfST.progress < 0.999) { tv.style.opacity = 0; big.classList.add("tv-away"); tvHidden.push(big); return; } // About holds the screen
      const a = pts[k], b = pts[k + 1] || a, t = b === a ? 0 : Math.min(1, Math.max(0, (F - a.y) / (b.y - a.y))), e = ease(t);
      const x = Math.min(innerWidth - 14, Math.max(14, a.x + (b.x - a.x) * e + Math.sin(Math.PI * t) * Math.min(160, innerWidth * 0.18) * (k % 2 ? -1 : 1))), y = a.y + (b.y - a.y) * e, sz = a.s + (b.s - a.s) * e;
      tv.style.opacity = 1; tv.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(sz / 100).toFixed(4)})`;
      // a real dot steps aside only while the traveller is on it (the hero's stays away once it has left the name)
      [[a.e, t < 0.12 || k === 0], [b.e, t > 0.88]].forEach(([n, on]) => { if (on && n) { n.classList.add("tv-away"); tvHidden.push(n); } });
      if (k > 0 || t > 0) { big.classList.add("tv-away"); tvHidden.push(big); }
    };
    if (!REDUCED) gsap.ticker.add(moveDot);

    /* ---------- the wall switches on: the screens come out of the dark one after another, like monitors powering up ---------- */
    /* ---------- the reveal: the products are inside the dot. Work holds on screen for a stretch of scroll (native
       scroll, the page only stands still), the dot grows until the screen is red, the eight are dealt onto the red one
       by one with a counter, then they spread into the wall and the red shrinks back into the dot. ---------- */
    { const work = $("#work"), fl = $("#wFlood"), cnt = $("#wCount"), gridEl = $("#wallGrid");
      const setVh = () => work.style.setProperty("--wvh", innerHeight + "px"); setVh(); ScrollTrigger.addEventListener("refreshInit", setVh);
      let seed = 11; const R = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
      const jit = tiles.map(() => ({ x: (R() - 0.5) * 44, y: (R() - 0.5) * 26, r: (R() - 0.5) * 10 }));
      const home = (t) => { let l = 0, tp = 0; for (let n = t; n && n !== work; n = n.offsetParent) { l += n.offsetLeft; tp += n.offsetTop; } return { x: l + t.offsetWidth / 2, y: tp + t.offsetHeight / 2 }; };
      const dx = (t) => work.offsetWidth / 2 - home(t).x, dy = (t) => innerHeight / 2 - home(t).y;
      const cardS = () => { const t = tiles[0]; return Math.min(narrow() ? 1.9 : 1.5, (innerWidth * (narrow() ? 0.84 : 0.4)) / t.offsetWidth, (innerHeight * 0.52) / t.offsetHeight); };
      const flood = { r: 22 }, paintFlood = () => { fl.style.clipPath = `circle(${flood.r.toFixed(1)}px at 50% 50%)`; };
      const cover = () => Math.hypot(work.offsetWidth / 2, innerHeight / 2) + 40;
      const DEAL0 = 0.15, STEP = 0.052, SPREAD = 0.64; let needRefresh = false;
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(flood, { r: 22 }, { r: cover, duration: 0.2, ease: "power2.in", onUpdate: paintFlood, immediateRender: false }, 0);
      tiles.forEach((t, i) => {
        tl.set(t, { opacity: 1 }, DEAL0 + i * STEP) // solid from its first frame: never a see-through card on the pile
          .fromTo(t, { x: () => dx(t), y: () => dy(t) + innerHeight * 0.4, scale: () => cardS() * 0.72, rotation: jit[i].r * 2.2 },
          { x: () => dx(t) + jit[i].x, y: () => dy(t) + jit[i].y - i * 2, scale: cardS, rotation: jit[i].r, duration: 0.09, ease: "power3.out", immediateRender: false }, DEAL0 + i * STEP)
          .to(t, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.24, ease: "power3.inOut" }, SPREAD + i * 0.009); });
      tl.to(flood, { r: 22, duration: 0.26, ease: "power2.inOut", onUpdate: paintFlood }, SPREAD + 0.03).to({}, { duration: 0.06 });
      const dealt = (time) => Math.max(0, Math.min(tiles.length, Math.floor((time - DEAL0) / STEP) + 1));
      // the hold is plain CSS: the section is sticky inside a taller wrapper (D px of extra scroll). The reveal plays once
      // per visit: when it has finished and the scroll has settled, the wrapper gives back its D px and the scroll moves
      // up by the same D in the same frame, so nothing moves on screen. From then on Work is an ordinary section:
      // no replay on the way back up, no stretch where the page stands still, and an open product is never interrupted.
      const run = $("#wRun"); let D = 0, collapsed = false;
      const sizeRun = () => { if (collapsed) return; D = Math.round(innerHeight * (narrow() ? 1.5 : 1.8)); run.style.height = work.offsetHeight + D + "px"; };
      sizeRun(); new ResizeObserver(() => requestAnimationFrame(sizeRun)).observe(work); ScrollTrigger.addEventListener("refreshInit", sizeRun);
      const collapse = () => { if (collapsed || !revealST || revealST.progress < 1 || scrollY < revealST.end) return;
        collapsed = true; const d = D, y = scrollY; revealST.kill(false, true); revealST = null; tl.kill();
        work.classList.remove("revealing"); gsap.set(tiles, { clearProps: "transform,opacity" }); gridEl.classList.add("landed"); // home, for good
        run.classList.add("collapsed"); run.style.height = ""; scrollTo(0, y - d); ScrollTrigger.refresh(); tvDirty = true; };
      revealST = ScrollTrigger.create({ trigger: run, start: "top top", end: () => "+=" + D,
        scrub: 0.6, animation: tl, invalidateOnRefresh: true, refreshPriority: 1, onLeave: () => whenIdle(collapse),
        onRefresh: () => { if (tl.progress() === 0) gsap.set(tiles, { opacity: 0 }); },
        onUpdate: (st) => { const p = st.progress, running = p > 0.001 && p < 0.999;
          // scrolled back into the reveal with a product open: the stage just goes (no re-measuring mid-scroll; that waits)
          if (running && wallI >= 0) { win.classList.remove("active"); wStage.hidden = true; wStage.style.clipPath = ""; wGrid.classList.remove("under"); wallI = -1; wallEl.style.minHeight = ""; needRefresh = true; }
          if (!running && needRefresh) { needRefresh = false; setTimeout(() => ScrollTrigger.refresh(), 0); }
          if (running !== work.classList.contains("revealing")) { work.classList.toggle("revealing", running); syncVideos(); } } }); // cards are dealt as stills
      // what is on screen follows the animation itself (the scrub trails the scroll a little): the counter names the card
      // that has just landed, its recording plays, and hover comes back only once the eight are really home
      tl.eventCallback("onUpdate", () => { const time = tl.time(), n = time < SPREAD ? dealt(time) : 0, home = tl.progress() >= 0.999;
        cnt.textContent = n ? pad(n) + " / " + pad(tiles.length) + "  ·  " + products[n - 1].title : "";
        cnt.classList.toggle("on", n > 0);
        if (home !== gridEl.classList.contains("landed")) { gridEl.classList.toggle("landed", home); if (home) { gsap.set(tiles, { clearProps: "transform,opacity" }); whenIdle(collapse); } } });
      ScrollTrigger.refresh();
      gsap.set(tiles, { opacity: 0 }); }

    /* ---------- the big headlines rise letter by letter as they come in, and swell under the pointer like my name ---------- */
    const HEADS = [".ab-big", ".c-big"].map((q) => $(q)).filter(Boolean);
    const headChars = HEADS.map((h) => { const out = [];
      [...h.childNodes].forEach((n) => { if (n.nodeType !== 3 || !n.nodeValue.trim()) return; const frag = document.createDocumentFragment();
        // words stay whole (a line may only break between words); a space is its own span, since one of these is a flex box
        n.nodeValue.split(/( )/).forEach((w) => { if (!w) return; if (w === " ") { frag.appendChild(el("span", "hsp", " ")); return; }
          const wd = el("span", "hw"); [...w].forEach((c) => { const sp = el("span", "hc", c); out.push(sp); wd.appendChild(sp); }); frag.appendChild(wd); });
        const line = el("span", "hline"); line.appendChild(frag); n.replaceWith(line); });
      gsap.fromTo(out, { yPercent: 55, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "power2.out", stagger: 0.04, scrollTrigger: { trigger: h, start: "top 92%", end: "top 55%", scrub: 0.5 } });
      return out; });
    if (FINE) { let hp = null; addEventListener("pointermove", (e) => (hp = { x: e.clientX, y: e.clientY }), { passive: true });
      const hs = headChars.map((cs) => cs.map(() => ({ k: 0, last: -1 })));
      gsap.ticker.add(() => { HEADS.forEach((h, j) => { const hr = h.getBoundingClientRect(); if (hr.bottom < 0 || hr.top > innerHeight) return;
        const R = parseFloat(getComputedStyle(h).fontSize) * 0.62;
        headChars[j].forEach((c, i) => { const s = hs[j][i]; let tgt = 0;
          if (hp) { const r = c.getBoundingClientRect(); tgt = Math.exp(-((Math.hypot(hp.x - (r.left + r.width / 2), (hp.y - (r.top + r.height / 2)) * 0.7) / R) ** 2)); }
          s.k += (tgt - s.k) * 0.16; if (Math.abs(s.k - s.last) > 0.003) { s.last = s.k; c.style.fontWeight = Math.round(700 + 100 * s.k); } }); }); }); }

    /* ---------- About takes the screen: the statement holds (sticky, native scroll) while its proofs arrive, one per claim.
       1 "Eight products so far," the eight real screens are dealt in under the words
       2 "and the live ones run on servers I administer." each screen turns into its live check, run from this browser
       3 "I set the standard each one is measured against," the test counts rise, big
       4 "and nothing ships until I have checked it myself." the dot lands as the full stop. Plays once, then gives the
         scroll back. ---------- */
    if (pf) { const run = $("#pfRun"), liveW = $("#pfLive"), fin = $("#pfFinal"), stop = $("#pf .pf-stop"), cap = $("#pfCap");
      const nums = [...document.querySelectorAll(".pf-nv b")], labels = [...document.querySelectorAll(".pf-n small")];
      pf.classList.add("anim");
      let D = 0, collapsed = false;
      const sizeRun = () => { if (collapsed) return; D = Math.round(innerHeight * 3.2); run.style.height = pf.offsetHeight + D + "px"; if (window.__pfFit) window.__pfFit(); };
      sizeRun(); new ResizeObserver(() => requestAnimationFrame(sizeRun)).observe(pf); ScrollTrigger.addEventListener("refreshInit", sizeRun);
      // the starting state is set at once, so nothing flashes bright before the statement begins
      gsap.set(pfWords, { opacity: 0.16 }); gsap.set(pfShotEls, { opacity: 0 }); gsap.set(liveW, { opacity: 0 }); gsap.set(fin, { opacity: 0 });
      gsap.set(nums, { yPercent: 115 }); gsap.set(labels, { opacity: 0 }); gsap.set(stop, { scale: 0 }); gsap.set(cap, { opacity: 0 });
      const B1 = 0.03, B2 = 0.26, B3 = 0.5, B4 = 0.73, tl = gsap.timeline({ paused: true });
      tl.to(pfWords.slice(0, 4), { opacity: 1, duration: 0.04, stagger: 0.016, ease: "none" }, B1)
        .fromTo(pfShotEls, { opacity: 0, y: () => innerHeight * 0.7, x: (i) => ((i % 4) - 1.5) * -90, scale: 0.6, rotation: (i) => [-16, -8, 8, 16][i % 4] * (i < 4 ? 1 : -1) },
          { opacity: 1, y: 0, x: 0, scale: 1, rotation: 0, duration: 0.12, ease: "power3.out", stagger: 0.012 }, B1 + 0.03)
        // 2
        .to(pfWords.slice(4, 13), { opacity: 1, duration: 0.04, stagger: 0.011, ease: "none" }, B2)
        .to(pfShotEls, { opacity: 0, scale: 0.88, y: 14, duration: 0.05, ease: "power2.in", stagger: 0.008 }, B2 + 0.03)
        .set(liveW, { opacity: 1 }, B2 + 0.06).fromTo(".pf-lh, .pf-sum", { opacity: 0 }, { opacity: 1, duration: 0.04 }, B2 + 0.06)
        .fromTo(".pf-chip", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.05, ease: "power2.out", stagger: 0.009 }, B2 + 0.06).call(pfPing, null, B2 + 0.08)
        // 3
        .to(pfWords.slice(13, 22), { opacity: 1, duration: 0.04, stagger: 0.011, ease: "none" }, B3)
        .to(liveW, { opacity: 0, y: -24, duration: 0.05, ease: "power2.in" }, B3 + 0.02).set(fin, { opacity: 1 }, B3 + 0.06)
        .to(nums, { yPercent: 0, duration: 0.09, ease: "power3.out", stagger: 0.03 }, B3 + 0.06)
        .to(labels, { opacity: 1, duration: 0.05, stagger: 0.03 }, B3 + 0.09)
        // 4
        .to(pfWords.slice(22), { opacity: 1, duration: 0.04, stagger: 0.011, ease: "none" }, B4)
        .to(stop, { scale: 1, duration: 0.05, ease: "back.out(3)" }, B4 + 0.11) // the dot lands as the full stop
        .to(cap, { opacity: 1, duration: 0.04 }, B4 + 0.12).to({}, { duration: 0.08 });
      const collapse = () => { if (collapsed || !pfST || pfST.progress < 1 || scrollY < pfST.end) return;
        collapsed = true; const d = D, y = scrollY; pfST.kill(false, true); pfST = null; tl.progress(1); tl.kill(); pfPing();
        pf.classList.add("done"); run.classList.add("collapsed"); run.style.height = ""; scrollTo(0, y - d); ScrollTrigger.refresh(); };
      ScrollTrigger.create({ trigger: run, start: "top 64px", end: "bottom 64px", toggleClass: { targets: root, className: "pf-on" } }); // dark header over the dark stage
      pfST = ScrollTrigger.create({ trigger: run, start: "top top", end: () => "+=" + D, scrub: 0.6, animation: tl, invalidateOnRefresh: true, refreshPriority: 1,
        onLeave: () => whenIdle(collapse), onUpdate: (st) => { if (st.progress >= 0.999) whenIdle(collapse); } });
      ScrollTrigger.refresh(); }

    /* ---------- the scroll cue. Checked hero to footer: three places need a scroll to go on. The first screen ("Scroll"),
       and the two moments that hold the page still while you scroll, the Work reveal and the About statement ("Keep
       scrolling", with the dot showing how far through you are). Everywhere else the page moves as you scroll. ---------- */
    { const cue = $("#scue"), cueT = $("#scueT"), cueDot = $("#scueDot"); let mode = "", heroReady = false, heroRoom = true;
      // the first screen's cue needs clear space under the hero's own words; on a short phone they run past the bottom
      // edge (and would sit under the pill), and that cut-off already says there is more below
      const roomCheck = () => { const W = innerWidth, H = innerHeight, pw = 100, right = W < 700; // where the pill would sit on the first screen
        const L = right ? W - 12 - pw : W / 2 - pw / 2, T = H - 16 - 34 - 6, B = H - 8, boxes = [], rg = document.createRange();
        document.querySelectorAll(".hero-foot .say, .hero-foot .count").forEach((n) => { rg.selectNodeContents(n); boxes.push(...rg.getClientRects()); }); // real text lines
        document.querySelectorAll(".hero-foot .pd-row button").forEach((b) => boxes.push(b.getBoundingClientRect()));
        heroRoom = !boxes.some((x) => x.width && x.right > L && x.left < L + pw && x.bottom + scrollY > T && x.top + scrollY < B); };
      roomCheck(); addEventListener("resize", roomCheck); document.fonts.ready.then(roomCheck);
      const set = (m, p) => { if (m !== mode) { mode = m; cue.classList.toggle("scue-on", !!m); cue.classList.toggle("scue-go", m === "hero"); // own class names: ".hint" is the hero label's
          if (m) cueT.textContent = m === "hero" ? "Scroll" : "Keep scrolling"; if (m === "hero") cueDot.style.top = ""; }
        if (m === "hold") cueDot.style.top = (p * 100).toFixed(1) + "%"; };
      const held = (st) => st && st.progress > 0.002 && st.progress < 0.93;
      gsap.ticker.add(() => {
        if (!root.classList.contains("done")) return set("");
        if (!heroReady) { heroReady = true; setTimeout(() => (heroReady = 2), 1600); } // after the dot's nudge
        if (held(revealST)) return set("hold", revealST.progress);
        if (held(pfST)) return set("hold", pfST.progress);
        set(heroReady === 2 && heroRoom && scrollY < 60 ? "hero" : "");
      }); }

    /* ---------- between sections: the next one opens out of a red circle, the same gesture as the intro ---------- */
    ["#about", "#contact"].forEach((q) => { const sec = $(q); sec.classList.add("iris"); // Work opens out of the dot itself (the reveal)
      ScrollTrigger.create({ trigger: sec, start: "top 100%", end: "top 30%", scrub: 0.4,
        onUpdate: (st) => { const p = st.progress; if (p >= 0.999) { sec.style.clipPath = "none"; sec.classList.add("iris-open"); return; }
          sec.classList.remove("iris-open"); sec.style.clipPath = `circle(${(4 + 146 * p * p).toFixed(2)}% at 50% ${(8 + 12 * p).toFixed(1)}%)`; } }); });

    /* ---------- opening, like a film title: a heartbeat, a red flood, the title card with my name and role,
       then an iris that closes the whole frame into the full stop of my name ---------- */
    const veil = $("#veil"), lines = [...document.querySelectorAll("#name .in")];
    const vt = $("#vt"), vtName = $("#vtName"), vtRole = $("#vtRole"), vtLine = $("#vtLine");
    const r = big.getBoundingClientRect(), px = r.left + r.width / 2, py = r.top + r.height / 2, pr = r.width / 2;
    root.classList.add("intro");
    gsap.set(lines, { yPercent: 110 }); gsap.set([".hero-foot", ".hero-top", ".top"], { opacity: 0 });
    const cx = innerWidth / 2, cy = innerHeight / 2, far = Math.hypot(innerWidth, innerHeight);
    // decode: letters settle out of noise, left to right
    const GLY = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&/·";
    const decode = (node, text, dur, at, t) => { const o = { p: 0 }; node.textContent = "";
      t.to(o, { p: 1, duration: dur, ease: "none", onUpdate: () => { const n = Math.floor(o.p * text.length);
        node.textContent = text.slice(0, n) + [...text.slice(n)].map((ch) => (ch === " " ? " " : GLY[(Math.random() * GLY.length) | 0])).join("").slice(0, Math.min(text.length - n, 6)); } }, at); };
    const nameSplit = new SplitText(vtName, { type: "chars" });
    let ended = false, tl = null;
    // after the intro the dot gives a small nudge (the lens used to open over my name here)
    const nudgeDot = () => { big.classList.add("nudge"); setTimeout(() => big.classList.remove("nudge"), 2700); };
    const end = (skipped) => { if (ended) return; ended = true; if (tl) tl.kill();
      gsap.set(lines, { yPercent: 0 }); gsap.set([".hero-foot", ".hero-top", ".top"], { opacity: 1 });
      $("#htRole").textContent = "AI systems & product engineer";
      root.classList.add("done"); root.classList.remove("intro"); veil.remove();
      ["wheel", "touchstart", "keydown", "pointerdown"].forEach((ev) => removeEventListener(ev, skip)); ScrollTrigger.refresh();
      if (window.Airport) { Airport.ready = true; Airport.resize(); } if (arrivals) arrivals.resize();
      nextWave = performance.now() + 3600; // the first wave through the name waits until the dot has nudged
      if (skipped !== true) setTimeout(nudgeDot, 500); };
    const skip = () => end(true);
    tl = gsap.timeline({ onComplete: end });
    tl.set(veil, { clipPath: `circle(7px at ${cx}px ${cy}px)` })
      // two heartbeats
      .to(veil, { clipPath: `circle(12px at ${cx}px ${cy}px)`, duration: 0.28, ease: "power2.out", yoyo: true, repeat: 3 }, 0.1)
      // the flood, and the letterbox bars close in
      .to(veil, { clipPath: `circle(${far}px at ${cx}px ${cy}px)`, duration: 0.6, ease: "expo.in" }, 1.25)
      .to(".bars", { scaleY: 1, duration: 0.9, ease: "expo.out" }, 1.8)
      // the title card: the name pulls into focus as its letters draw together
      .set(vt, { opacity: 1 }, 1.8)
      .fromTo(nameSplit.chars, { opacity: 0, filter: "blur(16px)", yPercent: 30 }, { opacity: 1, filter: "blur(0px)", yPercent: 0, duration: 1.2, ease: "power3.out", stagger: { each: 0.045, from: "center" } }, 1.85)
      .fromTo(vtName, { letterSpacing: "0.32em" }, { letterSpacing: "-0.045em", duration: 2.0, ease: "expo.out" }, 1.85)
      .fromTo(".vt-k", { opacity: 0, y: -10 }, { opacity: 0.85, y: 0, duration: 0.8, ease: "power2.out" }, 2.2)
      .to(vtLine, { scaleX: 1, duration: 0.9, ease: "expo.inOut" }, 2.45);
    decode(vtRole, "AI SYSTEMS & PRODUCT ENGINEER", 1.0, 2.6, tl);
    // a slow camera push while it holds, then the iris closes into the full stop
    tl.fromTo(vt, { scale: 1 }, { scale: 1.06, duration: 2.6, ease: "none" }, 1.85)
      .to(".bars", { scaleY: 0, duration: 0.6, ease: "power2.in" }, 4.05)
      .to(veil, { clipPath: `circle(${pr}px at ${px}px ${py}px)`, duration: 1.15, ease: "expo.inOut" }, 4.2)
      .to(lines, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.12 }, 5.0)
      .to([".top", ".hero-top", ".hero-foot"], { opacity: 1, duration: 0.9, ease: "power2.out" }, 5.3);
    decode($("#htRole"), "AI systems & product engineer", 0.9, 5.35, tl);
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach((ev) => addEventListener(ev, skip, { passive: true }));
  });
})();
