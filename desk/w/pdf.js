// UnboundPDF's world: a paper workshop that lives inside a browser window. Pages ride a belt through
// the press, the scissors and the stapler; a paper plane tries to leave and bounces off the glass.
(() => {
  "use strict";
  const W = window.World;
  const { svgEl, sheet, layer, rect, round, circle, scene, seed, rnd, robot, label } = W;
  const svg = document.getElementById("scene");
  seed(105);
  const { P, tick } = scene(svg, [["wall", 0.05], ["props", 0.2], ["window", 0.4], ["inside", 0.5], ["bench", 0.9], ["fore", 1.15]]);

  // the workshop wall: pegboard and a shelf of paper
  svgEl("rect", { x: -60, y: -60, width: 1720, height: 1120, fill: "#efe2cc" }, P.wall);
  for (let y = 40; y < 900; y += 36) for (let x = 20 + (y % 72 ? 18 : 0); x < 1600; x += 36) svgEl("circle", { cx: x, cy: y, r: 2.4, class: "peg-hole" }, P.wall);
  const shelf = layer(P.props, 4);
  sheet(shelf, rect(60, 470, 470, 18), "#8b5a31");
  [[80, 380, "#d8412f"], [130, 400, "#fbf6ea"], [170, 370, "#2c55c4"], [220, 395, "#fbf6ea"], [262, 385, "#f0b83c"], [310, 398, "#fbf6ea"]].forEach(([x, y, c]) => sheet(shelf, rect(x, y, 42, 470 - y), c, { j: 0.4 }));
  const tag53 = layer(P.props, 6); tag53.setAttribute("class", "cut a-sway"); tag53.style.setProperty("--amp", "3deg");
  svgEl("path", { d: "M1280 0 L1280 70 M1420 0 L1420 70", class: "thread" }, tag53);
  sheet(tag53, rect(1230, 70, 240, 72), "#fbf6ea");
  svgEl("text", { x: 1350, y: 122, class: "big-num", "text-anchor": "middle" }, tag53).textContent = "53 tools";

  // the browser window, made of paper and glass
  const win = layer(P.window, 7);
  sheet(win, round(640, 170, 880, 660, 16), "#2d3038", { j: 0.6 });
  sheet(win, rect(656, 226, 848, 588), "#dcecef", { j: 0.4 });
  [690, 716, 742].forEach((x, k) => sheet(win, circle(x, 198, 8), ["#d8412f", "#f0b83c", "#2f8f4e"][k]));
  sheet(win, round(780, 184, 520, 28, 12), "#f3ead6", { j: 0.3 });
  svgEl("text", { x: 800, y: 204, class: "url" }, win).textContent = "unboundpdf.com  ·  runs on your device";
  svgEl("path", { d: "M690 260 L760 240 M700 300 L800 262", class: "shine" }, P.inside);

  // inside the window: the belt and the three machines
  const belt = svgEl("path", { d: "M670 720 L1490 720", class: "belt a-march" }, P.inside);
  belt.style.setProperty("--dur", ".8s"); belt.style.setProperty("--dash", "-24");
  svgEl("path", { d: "M670 736 L1490 736", class: "belt-edge" }, P.inside);
  // the press
  const press = layer(P.inside, 5);
  sheet(press, rect(790, 470, 110, 26), "#6f7682"); sheet(press, rect(800, 496, 12, 210), "#6f7682"); sheet(press, rect(878, 496, 12, 210), "#6f7682");
  const piston = svgEl("g", {}, press); sheet(piston, rect(822, 500, 46, 110), "#9aa0a8"); sheet(piston, rect(812, 606, 66, 18), "#d8412f");
  label(P.inside, 845, 455, "compress", 24);
  // the scissors
  const sc = layer(P.inside, 5);
  const bladeA = svgEl("g", {}, sc), bladeB = svgEl("g", {}, sc);
  sheet(bladeA, [[1080, 600], [1160, 560], [1164, 570], [1084, 612]], "#c9ced6", { j: 0.2 }); sheet(bladeA, circle(1066, 620, 16), "#2c55c4");
  sheet(bladeB, [[1080, 612], [1160, 650], [1156, 660], [1076, 622]], "#c9ced6", { j: 0.2 }); sheet(bladeB, circle(1066, 604, 16), "#2c55c4");
  label(P.inside, 1110, 530, "split", 24);
  // the stapler
  const st = layer(P.inside, 5);
  sheet(st, round(1250, 680, 130, 22, 6), "#2f8f4e"); sheet(st, rect(1250, 640, 18, 44), "#2a7a44", { j: 0.2 });
  const stArm = svgEl("g", {}, st); sheet(stArm, round(1250, 630, 136, 24, 8), "#3fa35f");
  label(P.inside, 1315, 600, "merge", 24);

  // pages riding the belt
  const pages = [0, 1, 2, 3].map((k) => { const g = svgEl("g", {}, P.inside); const p = layer(g, 3); sheet(p, rect(-28, -76, 56, 72), "#fffdf6", { j: 0.4 }); sheet(p, rect(-28, -76, 56, 14), "#d3402e", { j: 0.3 }); for (let l = 0; l < 3; l++) svgEl("rect", { x: -18, y: -50 + l * 12, width: 36 - l * 8, height: 3, class: "ink" }, p); return { g, off: k * 0.25 }; });

  // the plane that cannot leave
  const plane = svgEl("g", {}, P.inside);
  const pl = layer(plane, 4); sheet(pl, [[-30, 8], [30, -10], [-8, 22]], "#fffdf6", { j: 0.3 }); sheet(pl, [[-8, 22], [30, -10], [0, 4]], "#e9e1cf", { j: 0.2 });
  const bump = svgEl("g", { class: "bump" }, P.inside);
  for (let k = 0; k < 3; k++) svgEl("path", { d: `M662 ${340 + k * 16} l-14 ${-6 + k * 6}`, class: "bump-line" }, bump);
  label(P.props, 420, 610, "your file never leaves the tab", 30);
  svgEl("path", { d: "M560 620 C600 640 620 600 650 560", class: "arrow" }, P.props);
  const lock = layer(P.window, 9);
  svgEl("path", { d: "M628 700 L628 684 Q628 660 652 660 Q676 660 676 684 L676 700", class: "shackle" }, lock);
  sheet(lock, round(616, 698, 72, 58, 8), "#f0b83c");
  sheet(lock, circle(652, 722, 7), "#3b2b1d");

  robot(P.inside, 1455, 712, 0.55, { hold: "glass" });

  // the bench in front
  sheet(layer(P.bench, 9), [[-40, 860], [1640, 860], [1640, 1040], [-40, 1040]], "#b97b41");
  const fore = layer(P.fore, 11);
  sheet(fore, rect(120, 890, 300, 26), "#f0b83c", { j: 0.3 }); for (let k = 0; k < 14; k++) svgEl("path", { d: `M${130 + k * 20} 890 L${130 + k * 20} ${k % 2 ? 900 : 906}`, class: "ruler" }, fore);
  [[520, "#2c55c4"], [560, "#d8412f"], [600, "#2f8f4e"]].forEach(([x, c], k) => sheet(fore, [[x, 960], [x + 150, 910 - k * 6], [x + 158, 920 - k * 6], [x + 8, 970]], c, { j: 0.2 }));
  sheet(fore, rect(1180, 900, 180, 70), "#fffdf6", { j: 0.4 }); sheet(fore, rect(1190, 890, 180, 70), "#fbf6ea", { j: 0.4 });

  let pt = 0;
  tick((t, dt) => {
    // machines keep their own rhythm
    const pr = Math.max(0, Math.sin(t * 3)); piston.setAttribute("transform", `translate(0 ${(pr * 70).toFixed(1)})`);
    const sa = Math.abs(Math.sin(t * 2.6)) * 12; bladeA.setAttribute("transform", `rotate(${-sa} 1066 612)`); bladeB.setAttribute("transform", `rotate(${sa} 1066 612)`);
    const sd = Math.max(0, Math.sin(t * 2.2 + 1)); stArm.setAttribute("transform", `translate(0 ${(sd * 16).toFixed(1)})`);
    // pages: squashed under the press, nudged at the scissors
    pages.forEach((p) => {
      const u = (t * 0.07 + p.off) % 1, x = 690 + u * 780;
      const sq = Math.abs(x - 845) < 30 ? 1 - pr * 0.45 : 1;
      const wig = Math.abs(x - 1100) < 30 ? Math.sin(t * 20) * 3 : 0;
      p.g.setAttribute("transform", `translate(${x.toFixed(1)} 718) rotate(${wig.toFixed(1)}) scale(1 ${sq.toFixed(2)})`);
    });
    // the plane: glides left, meets the glass, bounces back in
    pt = (pt + dt / 4.2) % 1;
    const bx = pt < 0.55 ? 1150 - (pt / 0.55) * 470 : 680 + ((pt - 0.55) / 0.45) * 470;
    const by = 360 + Math.sin(pt * Math.PI * 2) * 30;
    const face = pt < 0.55 ? 180 : 0;
    plane.setAttribute("transform", `translate(${bx.toFixed(1)} ${by.toFixed(1)}) rotate(${face + Math.sin(t * 4) * 6})`);
    bump.style.opacity = pt > 0.53 && pt < 0.66 ? 1 : 0;
  });

  W.page("VV 105", "pdf");
})();
