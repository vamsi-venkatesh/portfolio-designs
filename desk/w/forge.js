// Forge's world: an exam hall at night. The agent sits its exam inside a glass box; the lid comes down and is
// sealed before it starts. The answer key sits chained in a safe outside the box. A proctor walks the floor.
(() => {
  "use strict";
  const W = window.World;
  const { svgEl, sheet, layer, rect, round, circle, scene, seed, rnd, robot, label } = W;
  const svg = document.getElementById("scene");
  seed(101);
  const { P, tick } = scene(svg, [["wall", 0.05], ["window", 0.12], ["room", 0.3], ["box", 0.55], ["floor", 0.8], ["fore", 1.1]]);

  // the hall
  svgEl("rect", { x: -60, y: -60, width: 1720, height: 1120, fill: "#1f2a44" }, P.wall);
  for (let k = 0; k < 9; k++) sheet(P.wall, rect(-20 + k * 190, -20, 186, 800), k % 2 ? "#223050" : "#1f2a44", { j: 0.4 });
  // a tall arched window with the night in it
  const win = layer(P.window, 4);
  const arch = [[1170, 330]]; for (let k = 0; k <= 12; k++) { const a = Math.PI + (k / 12) * Math.PI; arch.push([1310 + Math.cos(a) * 140, 170 + Math.sin(a) * 140]); } arch.push([1450, 330]);
  sheet(win, arch.concat([[1450, 340]]).concat([[1170, 340]]), "#d9cba8", { j: 0.5 });
  const pane = arch.map(([x, y]) => [1310 + (x - 1310) * 0.88, 180 + (y - 180) * 0.9]);
  sheet(win, pane, "#101a33", { j: 0.4 });
  for (let k = 0; k < 16; k++) svgEl("circle", { cx: 1200 + rnd() * 220, cy: 80 + rnd() * 230, r: 0.8 + rnd() * 1.5, class: "star" + (k % 3 ? "" : " tw") }, win);
  sheet(win, circle(1370, 140, 22), "#f6e9c6");
  sheet(win, rect(1306, 40, 8, 300), "#d9cba8", { j: 0.3 });
  // the clock
  const clock = layer(P.room, 5);
  sheet(clock, circle(960, 190, 56), "#f3ead6"); sheet(clock, circle(960, 190, 48), "#fbf6ea", { j: 0.3 });
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; svgEl("path", { d: `M${960 + Math.cos(a) * 40} ${190 + Math.sin(a) * 40} L${960 + Math.cos(a) * 46} ${190 + Math.sin(a) * 46}`, class: "tickmark" }, clock); }
  const hourH = svgEl("path", { d: "M960 190 L960 164", class: "hand h" }, clock), minH = svgEl("path", { d: "M960 190 L960 152", class: "hand m" }, clock);

  // the floor
  sheet(layer(P.floor, 7), [[-60, 800], [1660, 800], [1660, 1060], [-60, 1060]], "#5a3c24");
  for (let k = 0; k < 12; k++) svgEl("path", { d: `M${-40 + k * 150} 800 L${-200 + k * 170} 1000`, class: "board" }, P.floor);

  // the exam, inside the box
  const box = P.box;
  const desk = layer(box, 5);
  sheet(desk, rect(740, 650, 320, 22), "#8b5a31"); sheet(desk, rect(760, 672, 16, 128), "#6b4526"); sheet(desk, rect(1024, 672, 16, 128), "#6b4526");
  sheet(desk, [[820, 648], [960, 640], [966, 650], [826, 656]], "#fbf6ea", { j: 0.3 });
  const agent = robot(box, 900, 640, 0.95, { hold: null });
  const pencil = svgEl("g", {}, agent.arm); sheet(layer(pencil, 2), [[20, -6], [58, 10], [54, 16], [16, 0]], "#f0b83c", { j: 0.2 });
  const lampBox = layer(box, 4);
  svgEl("path", { d: "M1040 648 L1040 560 L1000 530", class: "lamp-arm" }, lampBox); sheet(lampBox, [[960, 510], [1020, 504], [1016, 540], [966, 544]], "#c8642d", { j: 0.4 });
  const cone = svgEl("path", { d: "M966 544 L1016 540 L1060 648 L880 648 Z", class: "cone" }, box);
  // the glass box and its lid
  svgEl("rect", { x: 700, y: 380, width: 400, height: 420, class: "glass" }, box);
  svgEl("path", { d: "M720 420 L720 760 M740 400 L800 400", class: "glass-shine" }, box);
  const lid = svgEl("g", { class: "lid" }, box);
  sheet(layer(lid, 6), rect(688, 360, 424, 24), "#c9d6de", { j: 0.3 });
  const seal = svgEl("g", { class: "seal" }, box);
  sheet(layer(seal, 4), circle(1100, 396, 30), "#b3261e"); svgEl("text", { x: 1100, y: 402, class: "seal-t", "text-anchor": "middle" }, seal).textContent = "SEALED";
  const lock = svgEl("g", { class: "lock" }, box);
  svgEl("path", { d: "M1082 470 L1082 454 Q1082 436 1100 436 Q1118 436 1118 454 L1118 470", class: "shackle" }, lock);
  sheet(layer(lock, 3), round(1070, 468, 60, 46, 7), "#f0b83c"); sheet(lock, circle(1100, 490, 6), "#3b2b1d");
  label(P.room, 600, 470, "the box is shut", 32, "end");
  label(P.room, 600, 506, "before the exam starts", 32, "end");
  svgEl("path", { d: "M610 480 C650 480 670 450 690 420", class: "arrow" }, P.room);

  // the answer key: outside the box, in a safe, in chains
  const safe = layer(P.floor, 8);
  sheet(safe, round(1210, 560, 250, 240, 10), "#4a5264"); sheet(safe, round(1226, 576, 218, 208, 8), "#5b6478", { j: 0.4 });
  const dial = svgEl("g", { class: "a-spin" }, safe); dial.style.setProperty("--dur", "9s");
  sheet(dial, circle(1335, 660, 34), "#c9ced6"); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; svgEl("path", { d: `M${1335 + Math.cos(a) * 20} ${660 + Math.sin(a) * 20} L${1335 + Math.cos(a) * 30} ${660 + Math.sin(a) * 30}`, class: "tickmark" }, dial); }
  svgEl("text", { x: 1335, y: 750, class: "safe-t", "text-anchor": "middle" }, safe).textContent = "ANSWER KEY";
  for (let k = 0; k < 9; k++) svgEl("ellipse", { cx: 1215 + k * 30, cy: 600 + k * 20, rx: 14, ry: 8, class: "link", transform: `rotate(34 ${1215 + k * 30} ${600 + k * 20})` }, safe);

  // the proctor, walking the floor with a lamp
  const proctor = robot(P.fore, 300, 900, 0.8, { hold: "lamp", body: "#b39ddb" });

  const t0 = performance.now();
  tick((t) => {
    const m = (t * 6) % 360, h = (t * 0.5) % 360;
    minH.setAttribute("transform", `rotate(${m} 960 190)`); hourH.setAttribute("transform", `rotate(${h + 120} 960 190)`);
    pencil.setAttribute("transform", `translate(${Math.sin(t * 6) * 6} ${Math.abs(Math.sin(t * 12)) * 3})`);
    cone.style.opacity = (0.75 + Math.sin(t * 7) * 0.05 + (Math.random() < 0.01 ? -0.3 : 0)).toFixed(2);
    const px = 300 + Math.sin(t * 0.35) * 170;
    proctor.g.setAttribute("transform", `translate(${px.toFixed(1)} ${(900 - Math.abs(Math.sin(t * 5)) * 3).toFixed(1)}) scale(${Math.cos(t * 0.35) >= 0 ? 0.8 : -0.8} 0.8)`);
  });

  W.page("VV 101", "forge");
})();
