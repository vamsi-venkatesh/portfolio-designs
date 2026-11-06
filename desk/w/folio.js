// Conxfolio's world, in its own brand, the Paper Flight: a résumé goes down the paper airfield
// through Fold, Check, Sign and Launch, and takes off. Designs hang on the line; other planes loop overhead.
(() => {
  "use strict";
  const W = window.World;
  const { svgEl, sheet, layer, rect, round, circle, scene, seed, rnd, robot, label, along } = W;
  const svg = document.getElementById("scene");
  seed(107);
  const { P, tick } = scene(svg, [["sky", 0.04], ["line", 0.2], ["air", 0.3], ["field", 0.6], ["run", 0.75], ["fore", 1.1]]);

  svgEl("rect", { x: -60, y: -60, width: 1720, height: 1120, fill: "#f4ecdc" }, P.sky);
  // pencil clouds
  [[760, 120], [1180, 70], [1480, 170]].forEach(([x, y]) => svgEl("path", { d: `M${x} ${y} q20 -34 50 -10 q24 -30 56 0 q34 -8 30 22 q10 24 -22 26 l-100 0 q-34 -2 -14 -38z`, class: "pencil" }, P.sky));

  // the clothesline, with designs pegged on it
  const lineP = "M620 150 Q1080 230 1560 140";
  svgEl("path", { d: lineP, class: "rope" }, P.line);
  const rope = svgEl("path", { d: lineP, fill: "none" }, P.line), rl = rope.getTotalLength();
  [["#fbf6ea", "#d8412f"], ["#fdf1e0", "#2c55c4"], ["#fbf6ea", "#1d1b18"], ["#f3e8d8", "#2f8f4e"]].forEach(([paper, ink], k) => {
    const pt = rope.getPointAtLength(((k + 0.6) / 4.4) * rl);
    const g = svgEl("g", { class: "a-sway", style: `--dur:${2.6 + k * 0.3}s;--amp:3deg;transform-box:view-box;transform-origin:${pt.x}px ${pt.y}px` }, P.line);
    const s = layer(g, 4); sheet(s, rect(pt.x - 50, pt.y, 100, 132), paper, { j: 0.4 });
    sheet(s, rect(pt.x - 38, pt.y + 14, 42, 8), ink, { j: 0.2 });
    for (let l = 0; l < 6; l++) svgEl("rect", { x: pt.x - 38, y: pt.y + 34 + l * 14, width: 76 - (l % 3) * 16, height: 3, class: "ink" }, s);
    sheet(g, rect(pt.x - 6, pt.y - 14, 12, 26), "#d9a45b", { j: 0.2 });
  });

  // the field and the runway
  sheet(layer(P.field, 5), [[-60, 640], [1660, 610], [1660, 1060], [-60, 1060]], "#e6dcc6");
  const run = layer(P.run, 7);
  sheet(run, [[560, 740], [1660, 700], [1660, 840], [560, 820]], "#fbf6ea", { j: 0.5 });
  for (let k = 0; k < 12; k++) svgEl("path", { d: `M${600 + k * 90} ${778 - k * 3.3} l46 -1.5`, class: "dash" }, run);
  // the four stations: Fold · Check · Sign · Launch
  const ST = [[700, "Fold"], [920, "Check"], [1140, "Sign"], [1360, "Launch"]];
  ST.forEach(([x, word]) => {
    const g = layer(P.run, 8);
    sheet(g, rect(x - 4, 660, 8, 90), "#8b5a31", { j: 0.2 });
    sheet(g, [[x - 60, 640], [x + 60, 636], [x + 72, 656], [x + 60, 676], [x - 60, 680]], "#fbf6ea", { j: 0.4 });
    svgEl("text", { x: x - 2, y: 667, class: "verb", "text-anchor": "middle" }, g).textContent = word;
  });
  const windsock = svgEl("g", {}, P.field);
  sheet(windsock, rect(1510, 470, 6, 170), "#6f7682", { j: 0.2 });
  const sock = svgEl("g", { class: "a-sway", style: "--dur:1.4s;--amp:10deg;transform-box:view-box;transform-origin:1516px 486px" }, windsock);
  [0, 1, 2].forEach((k) => sheet(sock, [[1516 + k * 30, 472 + k * 3], [1546 + k * 30, 475 + k * 3], [1546 + k * 30, 497 - k * 3], [1516 + k * 30, 500 - k * 3]], k % 2 ? "#fbf6ea" : "#d8412f", { j: 0.2 }));

  // the hero: a sheet that becomes a plane
  const sheetG = svgEl("g", {}, P.run);
  const flat = layer(sheetG, 4); sheet(flat, rect(-34, -88, 68, 88), "#fffdf6", { j: 0.3 }); for (let l = 0; l < 5; l++) svgEl("rect", { x: -24, y: -76 + l * 13, width: 48 - (l % 2) * 14, height: 3, class: "ink" }, flat);
  const plane = svgEl("g", {}, P.run);
  const pl = layer(plane, 5); sheet(pl, [[-44, 6], [44, -14], [-12, 28]], "#fffdf6", { j: 0.3 }); sheet(pl, [[-12, 28], [44, -14], [0, 8]], "#e9dfca", { j: 0.2 });
  const checked = svgEl("g", { class: "red-stamp" }, P.run);
  sheet(layer(checked, 2), round(870, 560, 110, 40, 6), "none", { attrs: { class: "stamp-box" } });
  svgEl("text", { x: 925, y: 588, class: "stamp-t", "text-anchor": "middle" }, checked).textContent = "CHECKED";
  const sig = svgEl("path", { d: "M1100 590 c10 -20 18 20 28 0 s16 -24 24 0 s14 20 24 -6 s12 -10 30 -4", class: "sig", pathLength: 1 }, P.run);
  robot(P.run, 1210, 740, 0.7, { hold: "stamp", body: "#e7b7a0" });
  const takeoff = along(svgEl("path", { d: "M1360 740 C1460 730 1530 620 1720 300", fill: "none" }, P.run));

  // other planes looping overhead, each with a dotted trail
  const loops = [0, 1].map((k) => {
    const p = svgEl("path", { d: k ? "M600 420 C800 250 1000 520 1200 340 S1500 260 1700 380" : "M-80 300 C200 180 420 420 700 260 S1000 120 1300 200", fill: "none" }, P.air);
    svgEl("path", { d: p.getAttribute("d"), class: "trail" }, P.air);
    const g = svgEl("g", {}, P.air); const b = layer(g, 3); sheet(b, [[-26, 4], [26, -8], [-8, 16]], "#fffdf6", { j: 0.2 });
    return { a: along(p), g, off: k * 0.5 };
  });

  label(P.fore, 1330, 960, "four free tools that know each other", 30);

  const CYC = 10;
  tick((t) => {
    const c = t % CYC;
    let x = 700, y = 740, ang = 0, folded = 0, lift = null;
    if (c < 2) { folded = Math.min(1, c / 1.6); }
    else if (c < 3.4) { folded = 1; x = 700 + ((c - 2) / 1.4) * 220; }
    else if (c < 4.6) { folded = 1; x = 920 + ((c - 3.4) / 1.2) * 220; }
    else if (c < 6) { folded = 1; x = 1140 + ((c - 4.6) / 1.4) * 220; }
    else if (c < 9) { folded = 1; lift = takeoff.at((c - 6) / 3); }
    else { folded = 0; x = 700; }
    if (lift) { x = lift.x; y = lift.y; ang = lift.ang; }
    sheetG.setAttribute("transform", `translate(700 740) scale(${(1 - folded).toFixed(2)} 1)`);
    sheetG.style.opacity = folded < 1 ? 1 : 0;
    plane.setAttribute("transform", `translate(${x.toFixed(1)} ${(y - 26).toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${folded.toFixed(2)})`);
    checked.style.opacity = c > 3.3 && c < 9.5 ? 1 : 0;
    checked.style.transform = c > 3.3 && c < 3.5 ? "scale(1.4)" : "none";
    sig.style.strokeDashoffset = c < 4.4 ? 1 : c < 5.4 ? (1 - (c - 4.4)).toFixed(2) : 0;
    loops.forEach((l) => { const p = l.a.at(((t / 14) + l.off) % 1); l.g.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.ang.toFixed(1)})`); });
  });

  W.page("VV 107", "folio");
})();
