/* ==========================================================================
   29 · PAPER TOWN — the desk (the second view of the same record).

   A paper-cut diorama of a desk under a window. The same record, as things on
   the desk: the name on a hanging tag, every project a sheet of paper, the
   roles a stack of files, the languages a pile of books, the skills pinned to
   a cork board, the education framed on the wall, the contact an envelope.
   Anything the record does not hold is simply not on the desk.

   The desk is laid out by measure, not by a fixed picture: the scene is as
   wide as the screen allows and as tall as its contents need, so a phone gets
   a tall desk and a record of twenty projects gets a longer one.
   ========================================================================== */
(() => {
  "use strict";
  const PT = window.PT, R = PT.R;
  const { svgEl, el, sheet, layer, rect, round, circle, seed, rnd } = PT;
  const REDUCED = PT.REDUCED;
  const svg = document.getElementById("desk"), stage = document.getElementById("stage"), tag = document.getElementById("nametag");
  const tip = document.getElementById("tip");

  /* --------------------------------------------------- the tag (h1 = name) */
  (function nameTag() {
    const h1 = document.getElementById("t-name"), kick = document.getElementById("t-kick"), sub = document.getElementById("t-sub");
    h1.textContent = R.name; if (!R.name) h1.hidden = true;
    if (R.location) kick.textContent = R.location; else kick.remove();
    if (R.headline) sub.textContent = R.headline; else sub.remove();
    if (!R.isSpecimen) document.getElementById("t-spec").remove();
    const acts = document.getElementById("t-acts");
    const add = (label, kind, cls) => { const b = el("button", cls || "", label); b.type = "button"; b.addEventListener("click", () => PT.open(kind)); acts.appendChild(b); };
    if (R.hasAbout) add("About", "about");
    if (R.hasContact) add("Contact", "contact", "primary");
    if (!acts.childNodes.length) acts.remove();
  })();

  /* ------------------------------------------------------------ measuring */
  let W = 1600, FS = 16;
  const measureSvg = svgEl("svg", { width: 0, height: 0, style: "position:absolute;visibility:hidden" }, document.body);
  function textW(s, size, cls) { const t = svgEl("text", { x: 0, y: 0, "font-size": size, class: cls || "" }, measureSvg); t.textContent = s; let w = 0; try { w = t.getComputedTextLength(); } catch (e) { /* not laid out */ } t.remove(); return w || s.length * size * 0.56; }
  function wrapTo(s, width, size, cls, maxLines) {
    const avg = textW("abcdefghijklmnopqrstuvwxyz ABCDEFG", size, cls) / 34;
    let lines = PT.wrap(s, Math.max(6, Math.floor(width / avg)), maxLines);
    // measured, not guessed: a line that still runs over is re-wrapped one character narrower
    let chars = Math.floor(width / avg);
    while (chars > 6 && lines.some((l) => textW(l, size, cls) > width)) { chars--; lines = PT.wrap(s, chars, maxLines); }
    return lines;
  }
  const multiText = (g, lines, x, y, size, lh, cls, anchor = "middle") => lines.map((ln, k) => { const t = svgEl("text", { x, y: y + k * lh, "font-size": size, class: cls, "text-anchor": anchor }, g); t.textContent = ln; return t; });

  /* ---------------------------------------------------------------- build */
  let S = null;
  function build() {
    const vw = innerWidth, vh = innerHeight;
    W = vw >= 1100 ? 1600 : vw >= 640 ? 1000 : 600;
    FS = W === 600 ? 22 : W === 1000 ? 18 : 16;
    const sc = W === 600 ? 0.82 : W === 1000 ? 0.86 : 1;
    const pad = W === 600 ? 24 : W === 1000 ? 40 : 64, gap = W === 600 ? 22 : 34;
    const pxPerU = stage.clientWidth / W;
    seed(1965);
    svg.replaceChildren(svg.querySelector("defs"));
    const root = svgEl("g", { id: "scene" }, svg);
    const plane = (name, k) => { const g = svgEl("g", { class: "plane p-" + name }, root); g.dataset.k = k; return g; };
    const P = { wall: plane("wall", 0.12), window: plane("window", 0.3), wallObj: plane("wallobj", 0.38), desk: plane("desk", 0.55), back: plane("back", 0.72), front: plane("front", 1) };
    const objs = [], life = [];
    const obj = (parent, depth, kind, i, tipText, label) => { const g = layer(parent, depth, "obj"); g.dataset.kind = kind; if (i != null) g.dataset.i = i; if (tipText) g.dataset.tip = tipText; objs.push({ g, kind, i, label }); return g; };

    /* the tag hangs top-left; how tall it came out decides where the wall starts */
    const tagFrac = W === 1600 ? 0.31 : W === 1000 ? 0.5 : 0.9;
    tag.style.left = ((pad / W) * 100).toFixed(2) + "%";
    tag.style.width = (tagFrac * 100).toFixed(2) + "%";
    tag.hidden = false;
    const tagH = (tag.getBoundingClientRect().bottom - stage.getBoundingClientRect().top + 24) / pxPerU;
    const tagRight = pad + tagFrac * W;

    /* ---- the wall: a window always; the cork board and the frame only when the record has them ---- */
    const wallItems = [];
    const ww = W === 600 ? 300 : W === 1000 ? 330 : 410;
    wallItems.push({ kind: "window", w: ww, h: Math.round(ww * 0.8) });
    let corkSlips = [];
    if (R.skills.length) {
      const cw = W === 600 ? 330 : 350, items = [];
      R.skills.forEach((s) => s.items.forEach((x) => items.push(x)));
      if (!items.length) R.skills.forEach((s) => s.group && items.push(s.group));
      const slipFS = FS * 0.95, rows = []; let row = [], rx = 0;
      const maxSlip = cw - 44;
      items.slice(0, 12).forEach((x) => {
        const lines = wrapTo(x, maxSlip - 20, slipFS, "slip-t", 2), w = Math.min(maxSlip, Math.max(...lines.map((l) => textW(l, slipFS, "slip-t"))) + 22), h = lines.length * slipFS * 1.2 + 14;
        if (rx + w > maxSlip && row.length) { rows.push(row); row = []; rx = 0; }
        row.push({ x, lines, w, h }); rx += w + 10;
      });
      if (row.length) rows.push(row);
      const more = items.length - Math.min(12, items.length);
      corkSlips = { rows, more, slipFS };
      const ch = 40 + rows.reduce((a, r) => a + Math.max(...r.map((s) => s.h)) + 12, 0) + (more > 0 ? FS * 1.4 : 0) + 18;
      wallItems.push({ kind: "cork", w: cw, h: Math.max(170, ch) });
    }
    let dipl = null;
    if (R.education.length) {
      const e = R.education[0], dw = W === 600 ? 320 : 300;
      const dl = wrapTo(e.degree || e.school, dw - 70, FS * 1.1, "dip-t", 6), sl = e.degree && e.school ? wrapTo(e.school, dw - 70, FS * 0.9, "dip-s", 2) : [];
      const more = R.education.length - 1;
      dipl = { e, dl, sl, more };
      wallItems.push({ kind: "diploma", w: dw, h: 70 + dl.length * FS * 1.3 + sl.length * FS * 1.1 + (e.when ? FS * 1.4 : 0) + (more ? FS * 1.3 : 0) + 30 });
    }
    // pack the wall in rows: beside the tag while it hangs there, the full width below it
    const rowsW = []; let cur = null;
    const startX = (y) => (y < tagH + 10 ? tagRight + gap : pad);
    let y = 44;
    wallItems.forEach((it) => {
      if (cur) {
        const x = cur.x + gap;
        if (x + it.w <= W - pad) { it.x = x; it.y = y; cur.items.push(it); cur.x = x + it.w; cur.h = Math.max(cur.h, it.h); return; }
        y += cur.h + gap; cur = null;
      }
      let sx = startX(y);
      if (sx + it.w > W - pad) { y = Math.max(y, tagH + 10); sx = pad; }
      cur = { items: [it], x: sx + it.w, h: it.h, sx }; it.x = sx; it.y = y; rowsW.push(cur);
    });
    rowsW.forEach((r) => { const span = r.x - r.sx, free = (W - pad) - r.sx - span; r.items.forEach((it) => { it.x += free / 2; it.y += (r.h - it.h) / 2; }); });
    const wallBottom = Math.max(tagH + 20, ...wallItems.map((it) => it.y + it.h + 36)) + 20;

    // the wall itself, papered in panels
    const wall = layer(P.wall, 0, "wall");
    svgEl("rect", { x: -60, y: -60, width: W + 120, height: 5000, class: "c-wall" }, wall);
    for (let k = 0; k * 236 < W + 60; k++) sheet(wall, rect(-20 + k * 240, -20, 236, wallBottom + 40), k % 2 ? "var(--wall-2)" : "var(--wall)", { j: 0.5 });

    wallItems.forEach((it) => {
      if (it.kind === "window") drawWindow(P, it, life);
      if (it.kind === "cork") {
        const g = obj(P.wallObj, 4, "skills", null, R.skills.map((s) => s.group).filter(Boolean).join(" · ") || "Skills", "Skills");
        sheet(g, rect(it.x, it.y, it.w, it.h), "var(--cork-edge)", { j: 0.6 });
        sheet(g, rect(it.x + 10, it.y + 10, it.w - 20, it.h - 20), "var(--cork)", { j: 0.6 });
        for (let k = 0; k < 40; k++) svgEl("circle", { cx: it.x + 16 + rnd() * (it.w - 32), cy: it.y + 16 + rnd() * (it.h - 32), r: 1.4, class: "cork-dot" }, g);
        let yy = it.y + 30;
        corkSlips.rows.forEach((row, ri) => {
          const rw = row.reduce((a, s) => a + s.w, 0) + (row.length - 1) * 10; let xx = it.x + (it.w - rw) / 2; const rh = Math.max(...row.map((s) => s.h));
          row.forEach((s, si) => {
            const sg = layer(g, 2); const rot = ((ri + si) % 3 - 1) * 1.6;
            sg.setAttribute("transform", `rotate(${rot} ${xx + s.w / 2} ${yy + s.h / 2})`);
            sheet(sg, rect(xx, yy, s.w, s.h), (ri + si) % 3 === 1 ? "#fff3c4" : "var(--card)", { j: 0.3 });
            multiText(sg, s.lines, xx + s.w / 2, yy + corkSlips.slipFS + 3, corkSlips.slipFS, corkSlips.slipFS * 1.2, "slip-t");
            sheet(sg, circle(xx + s.w / 2, yy + 3, 4.5), ["var(--pin-r)", "var(--pin-y)", "var(--pin-b)"][(ri + si) % 3]);
            xx += s.w + 10;
          });
          yy += rh + 12;
        });
        if (corkSlips.more > 0) svgEl("text", { x: it.x + it.w - 22, y: it.y + it.h - 18, "font-size": FS * 1.3, class: "hand-t", "text-anchor": "end" }, g).textContent = "+" + corkSlips.more;
        it.g = g;
      }
      if (it.kind === "diploma") {
        const g = obj(P.wallObj, 5, "education", null, dipl.e.school || dipl.e.degree, "Education");
        sheet(g, rect(it.x, it.y, it.w, it.h), "var(--frame-wood)", { j: 0.5 });
        sheet(g, rect(it.x + 14, it.y + 14, it.w - 28, it.h - 28), "var(--sheet)", { j: 0.4 });
        svgEl("rect", { x: it.x + 24, y: it.y + 24, width: it.w - 48, height: it.h - 48, class: "dip-rule" }, g);
        let yy = it.y + 44 + FS;
        multiText(g, dipl.dl, it.x + it.w / 2, yy, FS * 1.1, FS * 1.3, "dip-t"); yy += dipl.dl.length * FS * 1.3;
        if (dipl.sl.length) { multiText(g, dipl.sl, it.x + it.w / 2, yy, FS * 0.9, FS * 1.1, "dip-s"); yy += dipl.sl.length * FS * 1.1; }
        if (dipl.e.when) { svgEl("text", { x: it.x + it.w / 2, y: yy + FS * 0.6, "font-size": FS * 1.2, class: "hand-t", "text-anchor": "middle" }, g).textContent = dipl.e.when; yy += FS * 1.4; }
        if (dipl.more) svgEl("text", { x: it.x + it.w / 2, y: yy + FS * 0.9, "font-size": FS * 0.85, class: "dip-s", "text-anchor": "middle" }, g).textContent = "+ " + dipl.more + " more";
        sheet(g, circle(it.x + it.w / 2, it.y + it.h - 18, 12), "var(--stamp)", { j: 0.3 });
        it.g = g;
      }
    });

    /* ---- the desk top ---- */
    const deskTop = wallBottom;
    const back = [];
    if (R.roles.length) back.push({ kind: "experience", w: 210 * sc, h: (96 + Math.min(6, R.roles.length) * 14) * sc });
    if (R.languages.length) {
      const bf = FS * 0.92, books = R.languages.map((l) => ({ l, w: Math.min(W - 2 * pad - 20, Math.max(150, textW(l, bf, "book-t") + 44)) }));
      back.push({ kind: "languages", w: Math.max(...books.map((b) => b.w)) + 10, h: books.length * (bf + 18) + 6, books, bf });
    }
    back.push({ kind: "laptop", w: 300 * sc, h: 214 * sc });
    back.push({ kind: "plant", w: 96 * sc, h: 176 * sc });
    back.push({ kind: "lamp", w: 176 * sc, h: 268 * sc });
    back.push({ kind: "mug", w: 78 * sc, h: 96 * sc });
    // stand them in rows on the desk, bottoms on one line per row
    const backRows = []; let row = [], rowW = 0;
    back.forEach((it) => { if (row.length && rowW + gap + it.w > W - 2 * pad) { backRows.push(row); row = []; rowW = 0; } row.push(it); rowW += (row.length > 1 ? gap : 0) + it.w; });
    if (row.length) backRows.push(row);
    let by = deskTop + 40;
    const labelH = FS * 2.2;
    backRows.forEach((r) => {
      const h = Math.max(...r.map((it) => it.h)), span = r.reduce((a, it) => a + it.w, 0) + (r.length - 1) * gap;
      let x = (W - span) / 2; const base = by + h;
      r.forEach((it) => { it.x = x; it.base = base; x += it.w + gap; });
      by = base + labelH + 24;
    });

    /* ---- the front: every project a sheet of paper, then the envelope ---- */
    const minCell = W === 600 ? 250 : W === 1000 ? 210 : 196;
    const cells = R.projects.map((p) => ({ kind: "project", p }));
    if (R.hasContact) cells.push({ kind: "contact" });
    const usable = W - 2 * pad;
    const cols = Math.max(1, Math.min(cells.length || 1, Math.floor((usable + gap) / (minCell + gap))));
    const cellW = Math.min(270, (usable - (cols - 1) * gap) / cols);
    cells.forEach((c) => {
      if (c.kind === "project") {
        c.lines = wrapTo(R.projectLabel(c.p), cellW - 34, FS * 1.05, "paper-t", c.p.title ? 6 : 4);
        c.line2 = c.p.year || "";
        c.h = 92 + c.lines.length * FS * 1.3 + (c.line2 ? FS * 1.5 : 0) + 18;
      } else {
        c.addr = R.email ? wrapTo(R.email, cellW - 40, FS * 0.95, "env-t", 3) : [];
        c.h = Math.max(cellW * 0.66, 70 + c.addr.length * FS * 1.2 + 26);
      }
    });
    let fy = by + 10;
    for (let k = 0; k < cells.length; k += cols) {
      const r = cells.slice(k, k + cols), h = Math.max(...r.map((c) => c.h)), span = r.length * cellW + (r.length - 1) * gap;
      let x = (W - span) / 2;
      r.forEach((c) => { c.x = x; c.y = fy + (h - c.h) * 0.3; c.w = cellW; x += cellW + gap; });
      fy += h + labelH * 0.4 + gap;
    }
    const contentBottom = (cells.length ? fy : by) + 40;
    const H = Math.max(Math.ceil(contentBottom + 90), Math.ceil(W * (vh / vw)));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

    // the desk surface and its front edge
    const desk = layer(P.desk, 7, "desk");
    sheet(desk, [[pad * 0.4, deskTop], [W - pad * 0.4, deskTop], [W + 30, H - 70], [-30, H - 70]], "var(--desk)", { j: 0.7 });
    for (let k = 0; deskTop + 60 + k * 90 < H - 90; k++) svgEl("path", { d: `M${pad} ${deskTop + 60 + k * 90} C${W * 0.3} ${deskTop + 40 + k * 94} ${W * 0.62} ${deskTop + 100 + k * 84} ${W - pad} ${deskTop + 66 + k * 92}`, class: "grain-line" }, desk);
    const lip = layer(P.front, 9, "desk-lip"); sheet(lip, [[-30, H - 76], [W + 30, H - 76], [W + 30, H + 20], [-30, H + 20]], "var(--desk-edge)", { j: 0.6 });

    // name strips under the objects
    const strip = (parent, text, cx, y0, rot) => {
      const c = layer(parent, 10, "label"); const w = textW(text, FS, "card-name") + 30;
      c.setAttribute("transform", `rotate(${rot} ${cx} ${y0})`);
      sheet(c, rect(cx - w / 2, y0, w, FS * 1.75), "var(--card)", { j: 0.35 });
      svgEl("text", { x: cx, y: y0 + FS * 1.25, "font-size": FS, class: "card-name", "text-anchor": "middle" }, c).textContent = text;
      return c;
    };

    let lampObj = null, plantG = null, steam = [];
    back.forEach((it, n) => {
      const cx = it.x + it.w / 2, base = it.base, rot = ((n % 3) - 1) * 1.1;
      if (it.kind === "experience") {
        const g = obj(P.back, 9, "experience", null, [R.roles[0].title, R.roles[0].company].filter(Boolean).join(" · "), "Experience");
        const nS = Math.min(6, R.roles.length);
        for (let k = 0; k < nS; k++) { const yy = base - 14 * sc - k * 14 * sc; sheet(g, [[it.x + 6 + (k % 2) * 4, yy - 12 * sc], [it.x + it.w - 8 - (k % 2) * 3, yy - 14 * sc], [it.x + it.w - 4, yy + 2], [it.x + 4, yy + 3]], k % 2 ? "var(--sheet-2)" : "var(--sheet)", { j: 0.4 }); }
        const top = base - 14 * sc - nS * 14 * sc;
        sheet(g, rect(it.x, top - 76 * sc, it.w, 64 * sc), "var(--folder)", { j: 0.5 });
        sheet(g, rect(it.x + 20 * sc, top - 90 * sc, 70 * sc, 18 * sc), "var(--folder)", { j: 0.3 });
        sheet(g, rect(it.x, top - 16 * sc, it.w, 16 * sc), "var(--folder-2)", { j: 0.3 });
        for (let k = 0; k < Math.min(3, R.roles.length); k++) svgEl("rect", { x: it.x + 22 * sc, y: top - 58 * sc + k * 14 * sc, width: (it.w - 60 * sc) * (1 - k * 0.2), height: 3, class: "ink-line" }, g);
        strip(P.back, "Experience", cx, base + 12, rot);
      }
      if (it.kind === "languages") {
        const g = obj(P.back, 9, "languages", null, R.languages.join(" · "), "Languages");
        const COLS = ["#2f5f86", "#a84a32", "#5f8d4e", "#c8642d", "#6b4f8a", "#8b6b47"];
        it.books.forEach((b, k) => {
          const bh = it.bf + 14, yy = base - (k + 1) * (bh + 4), xx = cx - b.w / 2 + ((k % 2) ? 6 : -6);
          sheet(g, rect(xx, yy, b.w, bh), COLS[k % COLS.length], { j: 0.35 });
          sheet(g, rect(xx + b.w - 12, yy + 2, 6, bh - 4), "rgba(255,255,255,.35)", { j: 0.1 });
          svgEl("text", { x: xx + (b.w - 12) / 2, y: yy + bh / 2 + it.bf * 0.36, "font-size": it.bf, class: "book-t", "text-anchor": "middle" }, g).textContent = b.l;
        });
        strip(P.back, "Languages", cx, base + 12, rot);
      }
      if (it.kind === "laptop") {
        const g = R.hasAbout ? obj(P.back, 9, "about", null, R.headline || R.location || "About", "About") : layer(P.back, 9);
        const bx = it.x, bw = it.w, sh = it.h * 0.86;
        sheet(g, [[bx + 16 * sc, base - 22 * sc], [bx + bw - 16 * sc, base - 22 * sc], [bx + bw + 10 * sc, base + 4], [bx - 10 * sc, base + 4]], "var(--lap-base)");
        sheet(g, rect(bx + 12 * sc, base - 22 * sc - sh, bw - 24 * sc, sh), "var(--lap-bezel)", { j: 0.5 });
        sheet(g, rect(bx + 24 * sc, base - 10 * sc - sh, bw - 48 * sc, sh - 26 * sc), "var(--screen)", { j: 0.4 });
        svgEl("rect", { x: bx + 24 * sc, y: base - 10 * sc - sh, width: bw - 48 * sc, height: 16 * sc, class: "ui-bar" }, g);
        for (let k = 0; k < 5; k++) svgEl("rect", { x: bx + 40 * sc, y: base - sh + 24 * sc + k * 22 * sc, width: (bw - 90 * sc) * [0.9, 0.7, 0.8, 0.5, 0.65][k], height: 5 * sc, rx: 2, class: "ui-line" }, g);
        if (R.hasAbout) strip(P.back, "About", cx, base + 12, rot);
      }
      if (it.kind === "plant") {
        const g = layer(P.back, 9);
        sheet(g, [[it.x + 16 * sc, base - 60 * sc], [it.x + it.w - 16 * sc, base - 60 * sc], [it.x + it.w - 26 * sc, base], [it.x + 26 * sc, base]], "var(--pot)", { j: 0.4 });
        plantG = svgEl("g", { class: "leaves" }, g);
        for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.36, len = (70 + (k % 3) * 22) * sc, bx0 = cx, by0 = base - 58 * sc; const tx = bx0 + Math.cos(a) * len, ty = by0 + Math.sin(a) * len; sheet(plantG, [[bx0 - 3, by0], [bx0 + (tx - bx0) * 0.5 - 12 * sc, by0 + (ty - by0) * 0.5], [tx, ty], [bx0 + (tx - bx0) * 0.5 + 12 * sc, by0 + (ty - by0) * 0.5], [bx0 + 3, by0]], k % 2 ? "var(--greens)" : "var(--greens-2)", { j: 0.4 }); }
        plantG.style.transformOrigin = `${cx}px ${base - 58 * sc}px`;
      }
      if (it.kind === "lamp") {
        const g = layer(P.back, 9, "lamp obj"); g.dataset.kind = "lamp"; objs.push({ g, kind: "lamp" });
        const lx = it.x + it.w * 0.62;
        svgEl("rect", { x: it.x, y: base - it.h, width: it.w, height: it.h, class: "hit" }, g);
        sheet(g, circle(lx, base - 6, 34 * sc, 9 * sc), "var(--lamp-arm)");
        svgEl("path", { d: `M${lx} ${base - 10} L${lx + 34 * sc} ${base - 150 * sc} L${lx - 32 * sc} ${base - 210 * sc}`, class: "lamp-arm" }, g);
        sheet(g, circle(lx + 34 * sc, base - 150 * sc, 10 * sc), "var(--lamp-joint)");
        const shx = lx - 32 * sc, shy = base - 210 * sc;
        sheet(g, [[shx - 88 * sc, shy + 12 * sc], [shx - 6 * sc, shy], [shx - 20 * sc, shy + 58 * sc], [shx - 98 * sc, shy + 52 * sc]], "var(--lamp-shade)", { j: 0.6 });
        const glow = svgEl("path", { d: `M${shx - 98 * sc} ${shy + 54 * sc} L${shx - 20 * sc} ${shy + 60 * sc} L${Math.min(W, shx + 120)} ${base + 180} L${Math.max(0, shx - 520)} ${base + 180} Z`, class: "lamp-light" }, P.back);
        lampObj = { g, glow };
        g.setAttribute("aria-label", "Switch the lamp: day or evening");
      }
      if (it.kind === "mug") {
        const g = layer(P.back, 9);
        sheet(g, round(it.x + 8 * sc, base - 76 * sc, 56 * sc, 76 * sc, 8 * sc), "var(--mug)", { j: 0.4 });
        svgEl("path", { d: `M${it.x + 62 * sc} ${base - 60 * sc} q22 4 18 24 q-4 18 -18 16`, class: "mug-handle" }, g);
        steam = [0, 1, 2].map((k) => svgEl("path", { d: `M${it.x + (22 + k * 14) * sc} ${base - 86 * sc} q-8 -16 0 -30 q8 -14 0 -30`, class: "steam", style: `animation-delay:${k * 0.7}s` }, P.back));
      }
    });

    cells.forEach((c, n) => {
      const rot = ((n * 7) % 5 - 2) * 0.9, cx = c.x + c.w / 2;
      if (c.kind === "project") {
        const p = c.p, st = PT.STYLES[p.idx % PT.STYLES.length];
        const g = obj(P.front, 11, "project", p.idx, p.outcome && p.title ? p.outcome : R.projectLine(p), R.projectLabel(p));
        g.setAttribute("transform", `rotate(${rot} ${cx} ${c.y + c.h / 2})`);
        sheet(g, rect(c.x + 5, c.y + 6, c.w, c.h), "var(--sheet-2)", { j: 0.5 }); // the sheet under it
        sheet(g, rect(c.x, c.y, c.w, c.h), "var(--sheet)", { j: 0.5 });
        sheet(g, rect(c.x + 12, c.y + 12, c.w - 24, 62), st.sky[0], { j: 0.3 });
        sheet(g, [[c.x + 12, c.y + 58], [c.x + c.w * 0.45, c.y + 44], [c.x + c.w - 12, c.y + 54], [c.x + c.w - 12, c.y + 74], [c.x + 12, c.y + 74]], st.ground, { j: 0.4 });
        sheet(g, circle(c.x + c.w - 44, c.y + 40, 20), "#fbf6ea", { j: 0.3 });
        svgEl("text", { x: c.x + c.w - 44, y: c.y + 47, "font-size": 18, class: "ini-t", "text-anchor": "middle" }, g).textContent = R.initials(p.title) || String(p.idx + 1);
        svgEl("text", { x: c.x + 22, y: c.y + 42, "font-size": FS * 1.1, class: "num-t" }, g).textContent = String(p.idx + 1).padStart(2, "0");
        multiText(g, c.lines, c.x + 17, c.y + 92 + FS * 0.9, FS * 1.05, FS * 1.3, "paper-t", "start");
        if (c.line2) svgEl("text", { x: c.x + 17, y: c.y + 92 + c.lines.length * FS * 1.3 + FS * 1.2, "font-size": FS * 1.25, class: "hand-t" }, g).textContent = c.line2;
        svgEl("rect", { x: c.x, y: c.y, width: c.w, height: c.h, class: "hit" }, g);
      } else {
        const g = obj(P.front, 11, "contact", null, R.email || R.phone || "Contact", "Contact");
        g.setAttribute("transform", `rotate(${rot} ${cx} ${c.y + c.h / 2})`);
        sheet(g, rect(c.x + 16, c.y - 18, c.w - 32, 40), "var(--sheet)", { j: 0.4 });
        sheet(g, rect(c.x, c.y, c.w, c.h), "var(--kraft)", { j: 0.5 });
        sheet(g, [[c.x, c.y], [cx, c.y + c.h * 0.5], [c.x + c.w, c.y]], "var(--kraft-2)", { j: 0.5 });
        sheet(g, rect(c.x + c.w - 52, c.y + c.h - 60, 36, 44), "var(--stamp)", { j: 0.3 });
        if (c.addr.length) multiText(g, c.addr, cx, c.y + c.h - 38 - (c.addr.length - 1) * FS * 1.2, FS * 0.95, FS * 1.2, "env-t");
        svgEl("rect", { x: c.x, y: c.y - 18, width: c.w, height: c.h + 18, class: "hit" }, g);
        strip(P.front, "Contact", cx, c.y + c.h + 10, -rot);
      }
    });

    S = { W, H, P, objs, life, lampObj, plantG, steam, planes: [...svg.querySelectorAll(".plane")].map((g) => ({ g, k: +g.dataset.k })) };
    wire();
  }

  function drawWindow(P, it, life) {
    const win = layer(P.window, 3, "window");
    const { x, y, w, h } = it, f = 18;
    sheet(win, rect(x, y, w, h), "var(--frame)", { j: 0.6 });
    const cid = "paneClip";
    const defs = svg.querySelector("defs"); const old = defs.querySelector("#" + cid); if (old) old.remove();
    const cp = svgEl("clipPath", { id: cid }, defs); svgEl("rect", { x: x + f, y: y + f, width: w - 2 * f, height: h - 2 * f }, cp);
    const sky = svgEl("g", { "clip-path": `url(#${cid})` }, win);
    svgEl("rect", { x: x + f, y: y + f, width: w - 2 * f, height: h - 2 * f, fill: "url(#skyGrad)" }, sky);
    for (let k = 0; k < 24; k++) svgEl("circle", { cx: x + f + rnd() * (w - 2 * f), cy: y + f + rnd() * h * 0.45, r: 0.8 + rnd() * 1.5, class: "star" + (k % 3 ? "" : " tw") }, sky);
    sheet(sky, circle(x + w * 0.78, y + h * 0.24, 22), "var(--moon)", { attrs: { class: "moon" } });
    const sun = svgEl("g", { class: "dsun" }, sky); sheet(sun, circle(x + w * 0.24, y + h * 0.26, 26), "var(--sun)");
    const cl = PT.cloud(sky, 0.45, "var(--cloud)"); cl.classList.add("dcloud"); let cx0 = x + w * 0.3;
    cl.setAttribute("transform", `translate(${cx0} ${y + h * 0.3})`);
    life.push((s, dt) => { cx0 += dt * 6; if (cx0 > x + w + 40) cx0 = x - 110; cl.setAttribute("transform", `translate(${cx0.toFixed(1)} ${(y + h * 0.3).toFixed(1)})`); });
    const skyline = (base, hMax, fill) => { const pts = [[x, y + h]]; let xx = x; while (xx < x + w) { const bw = 14 + rnd() * 30, bh = 16 + rnd() * hMax; pts.push([xx, base - bh], [xx + bw, base - bh]); xx += bw; } pts.push([x + w, y + h]); sheet(sky, pts, fill, { j: 0.4 }); };
    skyline(y + h * 0.84, h * 0.22, "var(--city-far)");
    skyline(y + h * 0.95, h * 0.12, "var(--city-near)");
    for (let k = 0; k < 16; k++) svgEl("rect", { x: x + f + rnd() * (w - 2 * f), y: y + h * 0.72 + rnd() * h * 0.2, width: 3, height: 4, class: "lit" }, sky);
    sheet(win, rect(x + w / 2 - 4, y + 6, 8, h - 12), "var(--frame)", { j: 0.3 });
    sheet(win, rect(x + 6, y + h * 0.5 - 4, w - 12, 8), "var(--frame)", { j: 0.3 });
    sheet(layer(P.window, 4), rect(x - 20, y + h - 6, w + 40, 18), "var(--frame-2)", { j: 0.5 });
  }

  /* ------------------------------------------------- pointing and opening */
  function showTip(g) {
    const t = g.dataset.tip; if (!t) { tip.hidden = true; return; }
    const r = g.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    tip.textContent = t; tip.hidden = false;
    const tw = tip.offsetWidth;
    tip.style.left = Math.max(8 + tw / 2, Math.min(sr.width - 8 - tw / 2, r.left - sr.left + r.width / 2)) + "px";
    tip.style.top = (r.bottom - sr.top + 8) + "px";
  }
  function wire() {
    S.objs.forEach(({ g, kind, i, label }) => {
      g.setAttribute("tabindex", "0"); g.setAttribute("role", "button");
      if (kind !== "lamp") g.setAttribute("aria-label", `${label || kind}. Open.`);
      const act = () => { if (kind === "lamp") setDay(!document.body.classList.contains("day")); else PT.open(kind, i); tip.hidden = true; };
      g.addEventListener("pointerenter", () => { g.classList.add("up"); showTip(g); });
      g.addEventListener("pointerleave", () => { g.classList.remove("up"); tip.hidden = true; });
      g.addEventListener("focus", () => { g.classList.add("up"); showTip(g); });
      g.addEventListener("blur", () => { g.classList.remove("up"); tip.hidden = true; });
      g.addEventListener("click", act);
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } });
    });
  }

  /* ------------------------------------------------ the lamp: day / evening */
  const lampBtn = document.getElementById("lamp-btn");
  function setDay(day) {
    document.body.classList.toggle("day", day);
    lampBtn.setAttribute("aria-pressed", String(!day));
    document.getElementById("lamp-state").textContent = day ? "Day" : "Evening";
    try { localStorage.setItem("pt-desk-day", day ? "1" : "0"); } catch (e) { /* per-viewer convenience only */ }
  }
  lampBtn.addEventListener("click", () => setDay(!document.body.classList.contains("day")));
  try { if (localStorage.getItem("pt-desk-day") === "1") setDay(true); } catch (e) { /* ignore */ }

  /* ------------------------------------------------ looking around, life */
  let tx = 0, ty = 0, x = 0, y = 0, lastMove = 0;
  addEventListener("pointermove", (e) => { if (e.pointerType === "touch") return; tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1; lastMove = performance.now(); }, { passive: true });
  let t0 = performance.now(), prev = t0;
  function frame(now) {
    const dt = Math.max(0, Math.min(0.05, (now - prev) / 1000)), s = (now - t0) / 1000; prev = now;
    if (S && !document.hidden && !PT.isOpen()) {
      const idle = now - lastMove > 4000;
      const gx = idle ? Math.sin(now / 5200) * 0.35 : tx, gy = idle ? Math.cos(now / 6100) * 0.2 : ty;
      x += (gx - x) * 0.06; y += (gy - y) * 0.06;
      S.planes.forEach(({ g, k }) => { g.style.transform = `translate(${(-x * 14 * k).toFixed(2)}px, ${(-y * 8 * k).toFixed(2)}px)`; });
      if (S.plantG) S.plantG.style.transform = `rotate(${(Math.sin(s * 0.9) * 1.6).toFixed(2)}deg)`;
      S.life.forEach((f) => f(s, dt));
    }
    requestAnimationFrame(frame);
  }

  build();
  if (!REDUCED) requestAnimationFrame(frame);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => build());
  let rw = innerWidth, rh = innerHeight, rt = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (Math.abs(innerWidth - rw) < 2 && Math.abs(innerHeight - rh) < 80) return; rw = innerWidth; rh = innerHeight; build(); }, 180); });
  PT.keepQuery();
  PT.grain(document.getElementById("grain"));
})();
