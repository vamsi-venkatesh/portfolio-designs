// PitchRadar's world: a German town square on a festival day. The vendor's food truck sweeps the square with
// its radar; the week's openings pop up over the stalls, ranked 1, 2, 3.
(() => {
  "use strict";
  const W = window.World;
  const { svgEl, sheet, layer, rect, round, circle, scene, seed, rnd, robot, label, cloud } = W;
  const svg = document.getElementById("scene");
  seed(104);
  const { P, tick } = scene(svg, [["sky", 0.04], ["clouds", 0.12], ["houses", 0.3], ["bunting", 0.4], ["stalls", 0.6], ["square", 0.75], ["truck", 0.85], ["fore", 1.1]]);

  svgEl("rect", { x: -60, y: -60, width: 1720, height: 1120, fill: "url(#afternoon)" }, P.sky);
  const clouds = [[700, 120, 0.9], [1250, 80, 0.7]].map(([x, y, s]) => ({ c: cloud(P.clouds, s), x, y }));

  // half-timbered houses along the square
  const COLORS = ["#f2d7a6", "#e7b7a0", "#f4ead2", "#c9d8c0", "#f2c28a", "#e9d2c6", "#d7e2e8"];
  let x = 600;
  let i = 0;
  while (x < 1640) {
    const w = 150 + rnd() * 50, h = 250 + rnd() * 90, top = 560 - h, g = layer(P.houses, 4);
    sheet(g, rect(x, top, w, h + 80), COLORS[i % COLORS.length], { j: 0.5 });
    sheet(g, [[x - 14, top + 4], [x + w / 2, top - 90 - rnd() * 30], [x + w + 14, top + 4]], i % 2 ? "#a84a32" : "#8b3a2a", { j: 0.6 });
    // the timber frame
    svgEl("path", { d: `M${x} ${top + h * 0.45} L${x + w} ${top + h * 0.45} M${x + w / 2} ${top} L${x + w / 2} ${top + h + 80} M${x} ${top} L${x + w / 2} ${top + h * 0.45} L${x + w} ${top}`, class: "beam" }, g);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) sheet(g, rect(x + 18 + c * (w / 2), top + 24 + r * (h * 0.45), w / 2 - 44, 44), "#fff3c4", { j: 0.3 });
    x += w + 6; i++;
  }
  // bunting across the square
  const bunt = svgEl("g", {}, P.bunting);
  const flags = [];
  for (let k = 0; k < 2; k++) {
    const y0 = 260 + k * 60, path = `M600 ${y0} Q1100 ${y0 + 110} 1620 ${y0 - 20}`;
    svgEl("path", { d: path, class: "string" }, bunt);
    const p = svgEl("path", { d: path, fill: "none" }, bunt), len = p.getTotalLength();
    for (let n = 0; n < 16; n++) {
      const pt = p.getPointAtLength((n / 16) * len + 14), g = svgEl("g", { class: "a-sway", style: `--dur:${1.6 + (n % 3) * 0.3}s;--amp:8deg;transform-box:view-box;transform-origin:${pt.x}px ${pt.y}px` }, bunt);
      sheet(g, [[pt.x - 14, pt.y], [pt.x + 14, pt.y], [pt.x, pt.y + 34]], ["#d8412f", "#f0b83c", "#2c55c4", "#2f8f4e"][n % 4], { j: 0.3 });
      flags.push(g);
    }
  }

  // market stalls with striped awnings
  const stalls = [[640, "#d8412f"], [900, "#2c55c4"], [1370, "#2f8f4e"]];
  stalls.forEach(([sx, c]) => {
    const g = layer(P.stalls, 6);
    sheet(g, rect(sx, 640, 180, 90), "#c49262"); sheet(g, rect(sx - 6, 626, 192, 16), "#8b5a31", { j: 0.3 });
    for (let k = 0; k < 6; k++) sheet(g, [[sx - 10 + k * 33, 560], [sx + 23 + k * 33, 560], [sx + 23 + k * 33, 600], [sx - 10 + k * 33, 606]], k % 2 ? "#fbf6ea" : c, { j: 0.3 });
    sheet(g, rect(sx + 4, 600, 10, 30), "#6b4526"); sheet(g, rect(sx + 166, 600, 10, 30), "#6b4526");
    [[sx + 40, "#d8412f"], [sx + 80, "#f0b83c"], [sx + 120, "#6f9a55"]].forEach(([gx, gc]) => sheet(g, circle(gx, 620, 12), gc));
  });
  // the week's openings: ranked pins pop over the stalls, one after another
  const pins = [[1460, 470, 1], [730, 480, 2], [990, 470, 3]].map(([px, py, n], k) => {
    const g = svgEl("g", { class: "pin" }, P.stalls);
    svgEl("circle", { cx: px, cy: py, r: 30, class: "a-ping", style: `animation-delay:${k * 0.8}s` }, g);
    const b = layer(g, 4); sheet(b, circle(px, py, 24), n === 1 ? "#f0b83c" : "#fbf6ea"); svgEl("path", { d: `M${px} ${py + 24} L${px} ${py + 56}`, class: "pin-leg" }, b);
    svgEl("text", { x: px, y: py + 9, class: "rank", "text-anchor": "middle" }, b).textContent = n;
    return { g, px, py, k };
  });
  label(P.fore, 360, 790, "the week's openings,", 32); label(P.fore, 360, 828, "ranked on rules you can read", 32);

  // the square
  sheet(layer(P.square, 7), [[-60, 730], [1660, 730], [1660, 1060], [-60, 1060]], "#c7b8a0");
  for (let r = 0; r < 7; r++) for (let c = 0; c < 26; c++) svgEl("ellipse", { cx: c * 66 + (r % 2 ? 33 : 0), cy: 760 + r * 34, rx: 28, ry: 12, class: "cobble" }, P.square);

  // the vendor's food truck, with its radar
  const truck = layer(P.truck, 8);
  sheet(truck, round(700, 700, 420, 190, 18), "#f0b83c"); sheet(truck, round(1090, 740, 110, 150, 16), "#e0a13a");
  sheet(truck, rect(1110, 756, 70, 50), "#cfe8f0", { j: 0.2 });
  sheet(truck, rect(760, 730, 220, 90), "#3b2b1d", { j: 0.3 }); sheet(truck, rect(772, 742, 196, 66), "#ffe6a8", { j: 0.3 });
  for (let k = 0; k < 7; k++) sheet(truck, [[748 + k * 34, 700], [782 + k * 34, 700], [786 + k * 34, 728], [752 + k * 34, 728]], k % 2 ? "#fbf6ea" : "#d8412f", { j: 0.2 });
  svgEl("text", { x: 870, y: 786, class: "menu", "text-anchor": "middle" }, truck).textContent = "Street food";
  [780, 1100].forEach((wx) => { sheet(truck, circle(wx, 890, 34), "#2d3038"); sheet(truck, circle(wx, 890, 14), "#9aa0a8"); });
  const mast = layer(P.truck, 9); sheet(mast, rect(880, 610, 10, 92), "#6f7682", { j: 0.2 });
  const dish = svgEl("g", {}, P.truck);
  sheet(layer(dish, 3), [[850, 612], [920, 612], [904, 580], [866, 580]], "#c9ced6", { j: 0.3 });
  const sweep = svgEl("path", { d: "M885 600 L1400 380 A560 560 0 0 0 1260 250 Z", class: "sweep" }, P.truck);

  // balloons rising over the square
  const balloons = [[620, "#d8412f"], [1500, "#2c55c4"], [1250, "#f0b83c"]].map(([bx, c], k) => {
    const g = svgEl("g", {}, P.bunting); sheet(layer(g, 3), circle(0, 0, 22, 28), c); svgEl("path", { d: "M0 28 C6 50 -6 70 0 96", class: "thread" }, g);
    return { g, x: bx, y: 900 + k * 260 };
  });

  robot(P.fore, 1330, 900, 0.8, { hold: "list" });
  label(P.fore, 1330, 944, "the week's brief", 26);

  tick((t, dt) => {
    clouds.forEach((c) => { c.x += 8 * dt; if (c.x > 1760) c.x = -200; c.c.setAttribute("transform", `translate(${c.x.toFixed(1)} ${c.y})`); });
    sweep.setAttribute("transform", `rotate(${(Math.sin(t * 0.7) * 38 - 10).toFixed(1)} 885 600)`);
    dish.setAttribute("transform", `rotate(${(Math.sin(t * 0.7) * 16).toFixed(1)} 885 600)`);
    // pins pop in turn: up with a bounce, stay, then settle to let the next one pop
    pins.forEach((p) => {
      const ph = ((t - p.k * 1.3) % 4 + 4) % 4;
      const s = ph < 0.4 ? 0.4 + 0.75 * Math.sin((ph / 0.4) * Math.PI / 2) + 0.15 * Math.sin((ph / 0.4) * Math.PI) : 1;
      const lift = ph < 0.4 ? (1 - ph / 0.4) * 30 : Math.sin(t * 2 + p.k) * 3;
      p.g.setAttribute("transform", `translate(${p.px} ${(p.py - lift).toFixed(1)}) scale(${Math.min(1.15, s).toFixed(2)}) translate(${-p.px} ${-p.py})`);
    });
    balloons.forEach((b, k) => { b.y -= 26 * dt; if (b.y < -120) b.y = 980; b.g.setAttribute("transform", `translate(${(b.x + Math.sin(t + k) * 14).toFixed(1)} ${b.y.toFixed(1)})`); });
  });

  W.page("VV 104", "radar");
})();
