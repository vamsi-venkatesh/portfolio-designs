// Conxto's world: a job city at dusk. Postings drift down like leaves; a magnifier checks the résumé line by line,
// ticking what the résumé proves and striking what claims more. The send button waits under glass.
(() => {
  "use strict";
  const W = window.World;
  const { svgEl, sheet, layer, rect, round, circle, scene, seed, rnd, robot, label } = W;
  const svg = document.getElementById("scene");
  seed(106);
  const { P, tick } = scene(svg, [["sky", 0.04], ["far", 0.15], ["city", 0.3], ["falling", 0.45], ["desk", 0.8], ["fore", 1.1]]);

  svgEl("rect", { x: -60, y: -60, width: 1720, height: 1120, fill: "url(#dusk)" }, P.sky);
  // two rows of towers, lit windows switching on
  const lights = [];
  [[P.far, 520, 180, "#5d7da0", 0.5], [P.city, 600, 240, "#3f5f86", 1]].forEach(([pl, base, hMax, col, lit]) => {
    const g = layer(pl, 4); let x = 560;
    while (x < 1640) {
      const w = 60 + rnd() * 70, h = 120 + rnd() * hMax;
      sheet(g, rect(x, base - h, w, h + 400), col, { j: 0.4 });
      if (lit) for (let r = 0; r < Math.floor(h / 34); r++) for (let c = 0; c < Math.floor(w / 24); c++) { const win = svgEl("rect", { x: x + 8 + c * 24, y: base - h + 14 + r * 34, width: 12, height: 16, class: "win" }, g); lights.push(win); }
      x += w + 8;
    }
  });
  const count = layer(P.city, 6); count.setAttribute("class", "cut a-sway"); count.style.setProperty("--amp", "2deg");
  svgEl("path", { d: "M1270 0 L1270 60 M1470 0 L1470 60", class: "thread" }, count);
  sheet(count, rect(1220, 60, 300, 84), "#fbf6ea");
  svgEl("text", { x: 1370, y: 100, class: "big-num", "text-anchor": "middle" }, count).textContent = "81,615";
  svgEl("text", { x: 1370, y: 128, class: "small-t", "text-anchor": "middle" }, count).textContent = "live postings · 15 Sep 2026";

  // postings drifting down
  const posts = Array.from({ length: 9 }, (_, k) => {
    const g = svgEl("g", {}, P.falling), c = layer(g, 4);
    sheet(c, rect(-34, -24, 68, 48), "#fbf6ea", { j: 0.4 });
    sheet(c, circle(-20, -10, 7), ["#d8412f", "#2c55c4", "#2f8f4e", "#f0b83c"][k % 4]);
    for (let l = 0; l < 3; l++) svgEl("rect", { x: -8, y: -14 + l * 10, width: 34 - l * 8, height: 3, class: "ink" }, c);
    return { g, x: 620 + rnd() * 960, y: -80 - rnd() * 900, v: 40 + rnd() * 30, ph: rnd() * 6 };
  });

  // the desk: the résumé on a clipboard, being checked
  sheet(layer(P.desk, 7), [[-60, 780], [1660, 780], [1660, 1060], [-60, 1060]], "#8b5a31");
  const board = layer(P.desk, 8);
  sheet(board, round(720, 380, 360, 500, 14), "#a8744a"); sheet(board, rect(740, 410, 320, 450), "#fffdf6", { j: 0.4 });
  sheet(board, round(860, 364, 80, 36, 8), "#9aa0a8");
  svgEl("text", { x: 764, y: 450, class: "cv-name" }, board).textContent = "Résumé";
  const LINES = [
    ["Worked in a team of 10", true], ["Built an ordering site", true], ["Led a team of 10", false], ["Shipped 3 releases", true], ["Wrote the test suite", true],
  ];
  const marks = LINES.map(([t, ok], k) => {
    const y = 510 + k * 66;
    svgEl("text", { x: 764, y, class: "cv-line" }, board).textContent = t;
    const tickMark = svgEl("path", { d: `M1010 ${y - 10} l10 10 l20 -24`, class: "tick" }, board);
    const strike = svgEl("path", { d: `M760 ${y - 7} L${760 + t.length * 11} ${y - 7}`, class: "strike" }, board);
    const why = ok ? null : svgEl("text", { x: 764, y: y + 24, class: "why" }, board);
    if (why) why.textContent = "claims more than the résumé proves";
    return { y, ok, tickMark, strike, why };
  });
  const lens = svgEl("g", {}, P.desk);
  svgEl("path", { d: "M34 34 L78 78", class: "k-handle" }, lens); svgEl("circle", { cx: 0, cy: 0, r: 46, class: "k-lens big" }, lens);

  // the send button, under glass
  const send = layer(P.desk, 8);
  sheet(send, round(1200, 700, 220, 90, 12), "#3b3f47");
  const btn = svgEl("g", { class: "a-pulse" }, send); sheet(btn, circle(1310, 720, 30, 18), "#d8412f");
  svgEl("path", { d: "M1236 720 Q1236 600 1310 600 Q1384 600 1384 720 Z", class: "dome" }, send);
  label(P.desk, 1310, 590, "nothing is sent without you", 28);
  robot(P.fore, 1500, 930, 0.8, { hold: "list" });
  label(P.desk, 600, 660, "every line checked", 30, "end");
  label(P.desk, 600, 696, "against the original", 30, "end");

  tick((t, dt) => {
    posts.forEach((p) => {
      p.y += p.v * dt; if (p.y > 820) { p.y = -80; p.x = 620 + Math.random() * 960; }
      p.g.setAttribute("transform", `translate(${(p.x + Math.sin(t * 1.2 + p.ph) * 30).toFixed(1)} ${p.y.toFixed(1)}) rotate(${(Math.sin(t * 1.6 + p.ph) * 22).toFixed(1)})`);
    });
    // the lens reads one line every 1.2 s; the whole résumé over again every 9 s
    const cyc = t % 9, k = Math.min(LINES.length - 1, Math.floor(cyc / 1.2)), within = (cyc % 1.2) / 1.2;
    const m = marks[k], lx = 780 + within * 220;
    lens.setAttribute("transform", `translate(${lx.toFixed(1)} ${m.y - 8})`);
    lens.style.opacity = cyc < LINES.length * 1.2 ? 1 : 0;
    marks.forEach((mk, i) => {
      const done = cyc >= (i + 1) * 1.2;
      mk.tickMark.style.opacity = mk.ok && done ? 1 : 0;
      mk.strike.style.opacity = !mk.ok && done ? 1 : 0;
      if (mk.why) mk.why.style.opacity = !mk.ok && done ? 1 : 0;
    });
    if (Math.random() < 0.02) { const w = lights[Math.floor(Math.random() * lights.length)]; w.classList.toggle("off"); }
  });

  W.page("VV 106", "conxto");
})();
