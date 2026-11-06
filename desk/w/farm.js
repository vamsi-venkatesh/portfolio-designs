// FarmQuick's world: a farm at dawn, the road to the city, a truck of crates on it,
// and the five cities Lead Desk reads every morning, pinging on the horizon.
(() => {
  "use strict";
  const { svgEl, sheet, layer, rect, round, circle, hill, scene, sections, seed, rnd, REDUCED } = window.World;
  const f = window.BOARD.flights.find((x) => x.flight === "VV 103");
  const svg = document.getElementById("scene");
  seed(103);

  const { P, tick } = scene(svg, [["sky", 0.04], ["sun", 0.08], ["clouds", 0.14], ["far", 0.22], ["city", 0.28], ["mid", 0.4], ["fields", 0.58], ["farm", 0.62], ["near", 0.85], ["fore", 1.15]]);

  // ---------- sky ----------
  svgEl("rect", { x: -60, y: -60, width: 1720, height: 1020, fill: "url(#dawn)" }, P.sky);
  const sun = svgEl("g", { class: "sun-rise" }, P.sun);
  const rays = svgEl("g", { class: "rays" }, sun);
  for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; sheet(rays, [[1080 + Math.cos(a) * 70, 250 + Math.sin(a) * 70], [1080 + Math.cos(a + 0.11) * 98, 250 + Math.sin(a + 0.11) * 98], [1080 + Math.cos(a + 0.22) * 70, 250 + Math.sin(a + 0.22) * 70]], "#f3b04a", { j: 0.3 }); }
  sheet(layer(sun, 3), circle(1080, 250, 62), "#f6c65b");
  sheet(sun, circle(1080, 250, 44), "#f9d77d", { j: 0.4 });

  const clouds = [];
  [[260, 170, 1], [760, 110, 0.8], [1380, 190, 1.1]].forEach(([x, y, s]) => {
    const g = layer(P.clouds, 4); const c = svgEl("g", {}, g);
    [[0, 0, 44], [40, -18, 52], [88, 0, 40], [44, 12, 46]].forEach(([dx, dy, r]) => sheet(c, circle(dx * s, dy * s, r * s, r * s * 0.8), "#fffaf0", { j: 0.5 }));
    sheet(c, rect(-40 * s, 0, 170 * s, 30 * s), "#fffaf0", { j: 0.4 });
    clouds.push({ c, x, y, v: 6 + rnd() * 6 });
  });

  // ---------- far hills and the city on the horizon ----------
  sheet(layer(P.far, 3), hill(-60, 1660, 520, 26, 2.2), "#cfe0c2");
  const city = layer(P.city, 4);
  seed(9); let bx = 1130;
  while (bx < 1560) { const w = 20 + rnd() * 30, h = 30 + rnd() * 80; sheet(city, rect(bx, 548 - h, w, h + 40), rnd() > 0.5 ? "#9fb4b8" : "#8aa2a8", { j: 0.4 }); bx += w + 2; }
  for (let k = 0; k < 26; k++) svgEl("rect", { x: 1140 + rnd() * 410, y: 480 + rnd() * 60, width: 3, height: 4, class: "win" }, city);
  // Lead Desk's five cities: a pin each, pinging in turn
  const pins = [[1170, 440], [1255, 404], [1340, 452], [1430, 418], [1510, 460]];
  pins.forEach(([x, y], k) => {
    const g = svgEl("g", {}, P.city);
    svgEl("circle", { cx: x, cy: y, r: 22, class: "ping", style: `animation-delay:${k * 0.55}s` }, g);
    const pin = layer(g, 3); sheet(pin, circle(x, y, 10), k === 2 ? "#f0b83c" : "#d8412f"); svgEl("path", { d: `M${x} ${y + 9} L${x} ${y + 30}`, class: "pin-leg" }, pin);
  });
  svgEl("text", { x: 1340, y: 380, class: "hand-label", "text-anchor": "middle" }, P.city).textContent = "5 cities, every morning";

  // ---------- mid hills, fields, the road ----------
  seed(21);
  sheet(layer(P.mid, 4), hill(-60, 1660, 600, 34, 1.6), "#a9c98e");
  const fields = layer(P.fields, 5);
  sheet(fields, hill(-60, 1660, 650, 18, 1.2), "#8fb872");
  // striped fields, cut and laid across the slope
  [[80, 690, 360, 60, "#c9b36a"], [470, 700, 300, 54, "#7aa45c"], [140, 760, 420, 70, "#6f9a55"], [980, 700, 260, 52, "#c9b36a"]].forEach(([x, y, w, h, c]) => {
    const fg = layer(fields, 2); sheet(fg, [[x, y + h], [x + 30, y], [x + w + 30, y], [x + w, y + h]], c, { j: 0.6 });
    for (let k = 1; k < 6; k++) svgEl("path", { d: `M${x + (w * k) / 6} ${y + h} L${x + 30 + (w * k) / 6} ${y}`, class: "furrow" }, fg);
  });
  const road = svgEl("path", { d: "M300 900 C 420 800, 620 830, 760 760 S 1000 660, 1120 610 S 1260 560, 1340 552", class: "road" }, fields);
  svgEl("path", { d: road.getAttribute("d"), class: "road-mid" }, fields);

  // ---------- the farm ----------
  const farm = layer(P.farm, 7);
  const house = layer(farm, 3);
  sheet(house, rect(170, 600, 150, 110), "#f3e3c3"); sheet(house, [[156, 604], [245, 530], [334, 604]], "#c8642d", { j: 0.6 });
  sheet(house, rect(196, 640, 34, 70), "#8b5a31"); sheet(house, rect(252, 634, 40, 34), "#ffd57c", { j: 0.3 });
  sheet(house, rect(284, 540, 20, 50), "#8b5a31", { j: 0.3 });
  const smoke = svgEl("g", { class: "smoke" }, farm);
  for (let k = 0; k < 4; k++) svgEl("circle", { cx: 294, cy: 530, r: 9 + k * 3, style: `animation-delay:${k * 0.9}s` }, smoke);
  const barn = layer(farm, 3);
  sheet(barn, rect(350, 610, 140, 100), "#b8452f"); sheet(barn, [[340, 614], [420, 560], [500, 614]], "#8f3424", { j: 0.5 });
  sheet(barn, rect(395, 650, 50, 60), "#f3e3c3", { j: 0.4 });
  svgEl("path", { d: "M395 650 L445 710 M445 650 L395 710", class: "barn-x" }, barn);
  const silo = layer(farm, 3); sheet(silo, rect(505, 560, 50, 150), "#d9d2c3"); sheet(silo, circle(530, 560, 25, 20), "#b9b0a0");

  // ---------- the truck ----------
  const truck = svgEl("g", { class: "truck" }, P.fields);
  const body = layer(truck, 6);
  [[-22, -58, 12, "#d8412f"], [-4, -62, 13, "#6f9a55"], [16, -58, 12, "#d8412f"], [34, -60, 11, "#6f9a55"]].forEach(([x, y, r, c]) => sheet(body, circle(x, y, r), c));
  sheet(body, rect(-40, -52, 94, 40), "#d3a066"); svgEl("path", { d: "M-40 -38 L54 -38 M-40 -26 L54 -26", class: "slat" }, body);
  sheet(body, round(54, -48, 44, 36, 6), "#2f8f4e"); sheet(body, rect(72, -42, 20, 14), "#cfe8f0", { j: 0.2 });
  const wheels = [-18, 34, 80].map((x) => { const w = svgEl("g", { transform: `translate(${x} -10)` }, body); sheet(w, circle(0, 0, 12), "#2d3038"); const spoke = svgEl("path", { d: "M-7 0 L7 0 M0 -7 L0 7", class: "spoke" }, w); return spoke; });
  const len = road.getTotalLength();

  // ---------- birds ----------
  const birds = [0, 1, 2].map((k) => { const g = svgEl("g", { class: "bird" }, P.clouds); svgEl("path", { d: "M-14 0 Q-7 -9 0 0 Q7 -9 14 0", class: "wing", style: `animation-delay:${k * 0.13}s` }, g); return { g, x: -100 - k * 50, y: 150 + k * 22 }; });

  // ---------- foreground: crops, a crate, my agent reading the morning's list ----------
  seed(33);
  const near = layer(P.near, 9);
  sheet(near, hill(-60, 1660, 830, 12, 1.4), "#6f9a55");
  for (let k = 0; k < 16; k++) {
    const x = 40 + k * 100 + rnd() * 40, y = 850 + rnd() * 20, g = svgEl("g", { class: "crop", style: `animation-delay:${(k % 5) * 0.4}s; transform-origin:${x}px ${y}px` }, near);
    const c = k % 3 === 0 ? "#d8412f" : "#4f7f3c";
    sheet(g, [[x, y], [x - 16, y - 34], [x - 2, y - 20]], "#4f7f3c", { j: 0.3 }); sheet(g, [[x, y], [x + 16, y - 36], [x + 2, y - 20]], "#5f8f48", { j: 0.3 });
    if (k % 3 === 0) sheet(g, circle(x, y - 30, 8), c);
  }
  const fore = layer(P.fore, 12);
  sheet(fore, hill(-60, 1660, 910, 8, 2.6), "#4f7f3c");
  for (let k = 0; k < 70; k++) { const x = -40 + k * 25 + rnd() * 10; svgEl("path", { d: `M${x} 1000 L${x + 6} ${880 + rnd() * 30} L${x + 12} 1000 Z`, class: "blade" }, fore); }
  const crate = layer(fore, 4);
  [[1210, 862, 16, "#d8412f"], [1236, 856, 17, "#6f9a55"], [1264, 862, 16, "#d8412f"], [1290, 858, 15, "#e0a13a"]].forEach(([x, y, r, c]) => sheet(crate, circle(x, y, r), c));
  sheet(crate, rect(1190, 866, 124, 60), "#d3a066"); svgEl("path", { d: "M1190 886 L1314 886 M1190 906 L1314 906", class: "slat" }, crate);
  const bot = svgEl("g", { class: "bot", transform: "translate(1420 900)" }, P.fore);
  const b = layer(bot, 6);
  svgEl("path", { d: "M0 -84 L0 -70", class: "antenna" }, b); svgEl("circle", { cx: 0, cy: -88, r: 7, class: "blink" }, b);
  sheet(b, round(-26, -70, 52, 38, 7), "#f3e8d2", { j: 0.4 });
  svgEl("circle", { cx: -10, cy: -52, r: 5, class: "eye" }, b); svgEl("circle", { cx: 10, cy: -52, r: 5, class: "eye" }, b);
  sheet(b, round(-30, -30, 60, 46, 8), "#9bb89b", { j: 0.4 });
  sheet(layer(b, 2), rect(-50, -40, 44, 56), "#fbf6ea", { j: 0.3 }); // the morning's list
  for (let k = 0; k < 4; k++) svgEl("rect", { x: -44, y: -30 + k * 10, width: 30 - (k % 2) * 8, height: 3, class: "ink" }, b);

  // ---------- life ----------
  let tt = rnd() * 0.3, pause = 0;
  tick((t, dt) => {
    clouds.forEach((c) => { c.x += c.v * dt; if (c.x > 1760) c.x = -220; c.c.setAttribute("transform", `translate(${c.x.toFixed(1)} ${c.y})`); });
    birds.forEach((bd) => { bd.x += 46 * dt; if (bd.x > 1760) bd.x = -120; bd.g.setAttribute("transform", `translate(${bd.x.toFixed(1)} ${(bd.y + Math.sin(t * 1.4 + bd.y) * 8).toFixed(1)})`); });
    // the truck: farm gate to the city, smaller as it goes, then back to the farm for the next load
    if (pause > 0) pause -= dt; else { tt += dt / 11; if (tt >= 1) { tt = 0; pause = 1.4; } }
    const p = road.getPointAtLength(tt * len), q = road.getPointAtLength(Math.min(len, tt * len + 2));
    const ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI, s = 1 - tt * 0.72;
    truck.setAttribute("transform", `translate(${p.x.toFixed(1)} ${(p.y + Math.sin(t * 18) * 0.8).toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${s.toFixed(3)})`);
    truck.style.opacity = tt > 0.93 ? ((1 - tt) / 0.07).toFixed(2) : tt < 0.03 ? (tt / 0.03).toFixed(2) : 1;
    wheels.forEach((w) => w.setAttribute("transform", `rotate(${((t * 400) % 360).toFixed(0)})`));
    bot.setAttribute("transform", `translate(1420 ${(900 + Math.sin(t * 2) * 2).toFixed(1)})`);
  });
  if (REDUCED) truck.setAttribute("transform", "translate(760 760) scale(.8)");

  // ---------- the paper grain ----------
  const c = document.createElement("canvas"); c.width = c.height = 160;
  const x = c.getContext("2d"), img = x.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) { const v = 200 + Math.random() * 55; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 24; }
  x.putImageData(img, 0, 0);
  document.getElementById("grain").style.backgroundImage = `url(${c.toDataURL()})`;

  sections(document.getElementById("work"), f, { name: "PitchRadar", href: "radar.html" });
})();
