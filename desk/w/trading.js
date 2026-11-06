// VVDex Trading's world: a harbour at night. Every dated call is forged as a link and hooked to the last one,
// so the chain on the pier grows link by link. The lighthouse keeps turning; the boats stay paper.
(() => {
  "use strict";
  const W = window.World;
  const { svgEl, sheet, layer, rect, round, circle, scene, seed, rnd, robot, label } = W;
  const svg = document.getElementById("scene");
  seed(108);
  const { P, tick } = scene(svg, [["sky", 0.04], ["far", 0.12], ["light", 0.25], ["sea1", 0.35], ["boat", 0.45], ["sea2", 0.55], ["pier", 0.8], ["fore", 1.1]]);

  svgEl("rect", { x: -60, y: -60, width: 1720, height: 1120, fill: "url(#night)" }, P.sky);
  for (let k = 0; k < 60; k++) svgEl("circle", { cx: rnd() * 1600, cy: rnd() * 420, r: 0.7 + rnd() * 1.6, class: "star" + (k % 4 ? "" : " tw") }, P.sky);
  sheet(P.sky, circle(1000, 150, 44), "#f6e9c6");
  // far shore
  const shore = layer(P.far, 3); let x = -40;
  while (x < 1640) { const w = 40 + rnd() * 60, h = 20 + rnd() * 50; sheet(shore, rect(x, 520 - h, w, h + 20), "#1b2440", { j: 0.4 }); if (rnd() > 0.5) svgEl("rect", { x: x + w / 2, y: 520 - h + 8, width: 3, height: 4, class: "lit" }, shore); x += w; }

  // the lighthouse and its beam
  const lh = layer(P.light, 6);
  sheet(lh, [[1360, 560], [1380, 250], [1440, 250], [1460, 560]], "#f3ead6", { j: 0.5 });
  [300, 380, 460].forEach((y) => sheet(lh, [[1378 - (y - 250) * 0.06, y], [1442 + (y - 250) * 0.06, y], [1444 + (y - 250) * 0.065, y + 34], [1376 - (y - 250) * 0.065, y + 34]], "#d8412f", { j: 0.3 }));
  sheet(lh, rect(1372, 210, 76, 44), "#2d3038"); sheet(lh, rect(1384, 216, 52, 32), "#ffe6a8", { j: 0.2 }); sheet(lh, [[1364, 212], [1410, 178], [1456, 212]], "#2d3038", { j: 0.3 });
  const beam = svgEl("path", { d: "M1410 232 L2200 150 L2200 320 Z", class: "beam" }, P.light);

  // the sea, in cut layers that roll
  const waves = [[P.sea1, 540, "#27365e", 22], [P.sea2, 640, "#1f2c50", 30]].map(([pl, y, c, a]) => {
    const g = layer(pl, 4), pts = [[-200, 1060]];
    for (let wx = -200; wx <= 1900; wx += 30) pts.push([wx, y + Math.sin(wx / 60) * a * 0.3]);
    pts.push([1900, 1060]); sheet(g, pts, c, { j: 0.5 });
    return { g, a };
  });
  svgEl("path", { d: "M900 560 Q1000 600 1100 560", class: "moonpath" }, P.sea1);
  // a paper boat
  const boat = svgEl("g", {}, P.boat);
  const b = layer(boat, 4); sheet(b, [[-60, 0], [60, 0], [40, 26], [-40, 26]], "#fbf6ea", { j: 0.3 }); sheet(b, [[-10, 0], [0, -54], [26, 0]], "#f3ead6", { j: 0.3 });
  const buoy = svgEl("g", {}, P.sea2); sheet(layer(buoy, 3), round(-18, -40, 36, 50, 10), "#d8412f"); svgEl("text", { x: 0, y: -8, class: "buoy-t", "text-anchor": "middle" }, buoy).textContent = "paper";

  // the pier, the anvil and the chain
  const pier = layer(P.pier, 8);
  sheet(pier, rect(-60, 760, 1720, 60), "#6b4526");
  for (let k = 0; k < 18; k++) sheet(pier, rect(20 + k * 96, 820, 22, 200), "#553620", { j: 0.2 });
  for (let k = 0; k < 18; k++) svgEl("path", { d: `M${-40 + k * 96} 762 L${-40 + k * 96} 818`, class: "plank" }, pier);
  const anvil = layer(P.pier, 9);
  sheet(anvil, [[640, 700], [780, 700], [800, 680], [620, 680]], "#3b3f47"); sheet(anvil, rect(670, 700, 80, 60), "#2d3038");
  const smith = robot(P.pier, 580, 760, 0.95, { hold: "hammer", body: "#9aa0a8" });
  const sparks = Array.from({ length: 14 }, () => svgEl("circle", { r: 2.5, class: "spark" }, P.pier));
  let sparkT = -1;
  const chain = svgEl("g", {}, P.pier);
  const MAX = 11, links = [];
  for (let k = 0; k < MAX; k++) {
    const cx = 830 + k * 58, cy = 736;
    const l = svgEl("ellipse", { cx, cy, rx: 30, ry: 14, class: "clink" + (k % 2 ? " side" : ""), transform: k % 2 ? `rotate(0 ${cx} ${cy})` : "" }, chain);
    const d = svgEl("circle", { cx, cy: cy - 22, r: 3, class: "rivet" }, chain); // a rivet, not a made-up call number
    links.push([l, d]);
  }
  label(P.fore, 1180, 900, "every call hooked to the last", 32);
  label(P.fore, 1180, 940, "2,028 so far · paper only", 28);

  let shown = 0, strikeClock = 0;
  tick((t, dt) => {
    waves.forEach((w, k) => w.g.setAttribute("transform", `translate(${(Math.sin(t * 0.5 + k) * 30 - (t * (12 + k * 8)) % 60).toFixed(1)} ${(Math.sin(t * 0.9 + k) * 4).toFixed(1)})`));
    beam.setAttribute("transform", `rotate(${(Math.sin(t * 0.4) * 60 + 180 + ((t * 20) % 360)).toFixed(1)} 1410 232)`);
    boat.setAttribute("transform", `translate(${(300 + (t * 20) % 1300).toFixed(1)} ${(600 + Math.sin(t * 1.4) * 8).toFixed(1)}) rotate(${(Math.sin(t * 1.2) * 5).toFixed(1)})`);
    buoy.setAttribute("transform", `translate(1150 ${(690 + Math.sin(t * 1.8) * 6).toFixed(1)}) rotate(${(Math.sin(t * 1.5) * 8).toFixed(1)})`);
    // the smith strikes every 1.4 s; each strike adds a link, sparks fly
    strikeClock += dt;
    const ph = strikeClock / 1.4;
    const swing = ph < 0.7 ? -40 * (ph / 0.7) : -40 + 80 * ((ph - 0.7) / 0.3);
    smith.arm.setAttribute("transform", `rotate(${Math.min(20, swing).toFixed(1)} 26 -8)`);
    if (strikeClock >= 1.4) {
      strikeClock = 0; sparkT = 0;
      shown = shown >= MAX ? 0 : shown + 1;
      links.forEach(([l, d], k) => { const on = k < shown; l.style.opacity = on ? 1 : 0; d.style.opacity = on ? 1 : 0; });
    }
    if (sparkT >= 0) {
      sparkT += dt;
      sparks.forEach((s, k) => { const a = -Math.PI * (0.1 + (k / sparks.length) * 0.8), r = sparkT * (180 + k * 12); s.setAttribute("cx", (710 + Math.cos(a) * r).toFixed(1)); s.setAttribute("cy", (680 + Math.sin(a) * r + sparkT * sparkT * 400).toFixed(1)); s.style.opacity = Math.max(0, 1 - sparkT * 2.2).toFixed(2); });
      if (sparkT > 0.6) sparkT = -1;
    }
  });
  links.forEach(([l, d]) => { l.style.opacity = 0; d.style.opacity = 0; });

  W.page("VV 108", "trading");
})();
