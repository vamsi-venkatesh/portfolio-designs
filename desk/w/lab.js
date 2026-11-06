// Agent Service Lab's world: a paper factory floor. Jobs ride the belt past the scout and the verifier,
// stop at the gate where a person stamps them, and end in a receipt.
(() => {
  "use strict";
  const W = window.World;
  const { svgEl, sheet, layer, rect, round, circle, scene, seed, rnd, robot, label } = W;
  const svg = document.getElementById("scene");
  seed(102);
  const { P, tick } = scene(svg, [["wall", 0.05], ["windows", 0.12], ["gears", 0.25], ["line", 0.55], ["floor", 0.75], ["fore", 1.1]]);

  svgEl("rect", { x: -60, y: -60, width: 1720, height: 1120, fill: "#dfe7df" }, P.wall);
  for (let k = 0; k < 9; k++) sheet(P.wall, rect(-20 + k * 190, 520, 186, 300), k % 2 ? "#cfd9cf" : "#d6dfd6", { j: 0.4 });
  // factory windows, saw-tooth roof light
  const wins = layer(P.windows, 4);
  for (let k = 0; k < 4; k++) {
    const x = 680 + k * 220;
    sheet(wins, rect(x, 70, 190, 190), "#6f7682", { j: 0.4 });
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) sheet(wins, rect(x + 10 + c * 88, 80 + r * 88, 82, 82), "#bfe0ea", { j: 0.3 });
  }
  const sign = layer(P.windows, 6); sign.setAttribute("class", "cut a-sway"); sign.style.setProperty("--amp", "2deg");
  svgEl("path", { d: "M900 250 L900 300 M1260 250 L1260 300", class: "thread" }, sign);
  sheet(sign, rect(840, 300, 480, 70), "#fbf6ea");
  svgEl("text", { x: 1080, y: 346, class: "sign-t", "text-anchor": "middle" }, sign).textContent = "50 services · a person at every gate";
  // gears on the wall
  [[140, 560, 70, 12, "22s"], [250, 640, 46, 9, "14s"], [70, 680, 36, 8, "11s"]].forEach(([x, y, r, n, dur], i) => {
    const g = svgEl("g", { class: "a-spin" + (i === 1 ? " rev" : "") }, P.gears); g.style.setProperty("--dur", dur);
    const pts = []; for (let k = 0; k < n * 2; k++) { const a = (k / (n * 2)) * Math.PI * 2, rr = k % 2 ? r : r * 1.2; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    sheet(layer(g, 3), pts, ["#9aa0a8", "#c8642d", "#6f7682"][i], { j: 0.3 }); sheet(g, circle(x, y, r * 0.3), "#dfe7df");
  });

  // the line
  sheet(layer(P.floor, 7), [[-60, 820], [1660, 820], [1660, 1060], [-60, 1060]], "#7a857a");
  const line = layer(P.line, 6);
  sheet(line, rect(40, 720, 1520, 22), "#3b3f47", { j: 0.4 });
  const beltTop = svgEl("path", { d: "M50 722 L1550 722", class: "belt a-march" }, line); beltTop.style.setProperty("--dur", ".9s"); beltTop.style.setProperty("--dash", "-26");
  for (let k = 0; k < 16; k++) sheet(line, rect(70 + k * 96, 742, 12, 80), "#5b6070", { j: 0.2 });
  // stations
  const scout = robot(P.line, 400, 640, 0.85, { hold: "glass" });
  label(P.line, 400, 520, "scout", 30);
  const ver = robot(P.line, 700, 640, 0.85, { hold: null, body: "#9fc2e8" });
  const tickLamp = svgEl("circle", { cx: 700, cy: 520, r: 18, class: "verify-lamp" }, P.line);
  label(P.line, 700, 488, "verifier", 30);
  // the gate: a person, a barrier, a stamp
  const gate = layer(P.line, 7);
  sheet(gate, rect(1050, 560, 18, 160), "#3b2b1d", { j: 0.3 });
  const bar = svgEl("g", {}, gate); sheet(bar, rect(1060, 590, 170, 14), "#d8412f", { j: 0.3 });
  for (let k = 0; k < 4; k++) sheet(bar, rect(1080 + k * 40, 590, 18, 14), "#fbf6ea", { j: 0.2 });
  const person = svgEl("g", { class: "person" }, P.line);
  svgEl("circle", { cx: 1000, cy: 520, r: 22, class: "p-head" }, person);
  svgEl("path", { d: "M1000 542 L1000 620 M1000 620 L984 690 M1000 620 L1016 690 M1000 560 L976 600", class: "p-body" }, person);
  const stampArm = svgEl("g", {}, person);
  svgEl("path", { d: "M1000 560 L1040 590", class: "p-body" }, stampArm);
  sheet(layer(stampArm, 2), rect(1034, 584, 22, 18), "#8b5a31", { j: 0.2 }); sheet(stampArm, rect(1030, 600, 30, 10), "#2f8f4e", { j: 0.2 });
  label(P.line, 1000, 470, "a person decides", 30);
  // the receipt printer
  const printer = layer(P.line, 6);
  sheet(printer, round(1340, 600, 160, 110, 10), "#f3ead6"); sheet(printer, rect(1360, 612, 120, 8), "#3b2b1d", { j: 0.2 });
  const receipt = svgEl("g", {}, P.line);
  const rpaper = sheet(receipt, rect(1372, 540, 96, 76), "#fffdf6", { j: 0.3 });
  for (let k = 0; k < 4; k++) svgEl("rect", { x: 1384, y: 552 + k * 12, width: 70 - (k % 2) * 20, height: 3, class: "ink" }, receipt);
  svgEl("circle", { cx: 1450, cy: 596, r: 9, class: "seal-dot" }, receipt);
  label(P.line, 1420, 520, "sealed receipt", 30);

  // jobs: parcels on the belt
  const jobs = [0, 1, 2, 3, 4].map((k) => {
    const g = svgEl("g", {}, P.line), b = layer(g, 4);
    sheet(b, rect(-34, -56, 68, 56), "#d3a066"); svgEl("path", { d: "M-34 -40 L34 -40 M0 -56 L0 -40", class: "tape" }, b);
    const ok = svgEl("text", { x: 0, y: -12, class: "ok", "text-anchor": "middle" }, g); ok.textContent = "✓";
    return { g, ok, x: -120 - k * 300, held: 0, stamped: false };
  });

  // the floor in front
  const fore = layer(P.fore, 10);
  sheet(fore, [[-60, 930], [1660, 930], [1660, 1060], [-60, 1060]], "#667066");
  for (let k = 0; k < 6; k++) sheet(fore, rect(80 + k * 280, 950, 140, 12), "#f0b83c", { j: 0.2 });

  const GATE = 1150, SPEED = 120;
  let stampDown = 0;
  tick((t, dt) => {
    let blocking = false;
    jobs.forEach((j) => {
      const atGate = !j.stamped && j.x >= GATE - 4 && j.x < GATE + 20;
      if (atGate) { j.held += dt; blocking = true; if (j.held > 0.45 && !stampDown) stampDown = 0.5; if (j.held > 1.1) { j.stamped = true; } }
      else if (!(j.x < GATE && jobs.some((o) => o !== j && o.x > j.x && o.x - j.x < 110))) j.x += SPEED * dt;
      if (j.x > 1640) { j.x = -120; j.held = 0; j.stamped = false; }
      j.ok.style.opacity = j.stamped ? 1 : 0;
      j.g.setAttribute("transform", `translate(${j.x.toFixed(1)} 720)`);
    });
    if (stampDown > 0) stampDown = Math.max(0, stampDown - dt);
    const down = stampDown > 0 ? Math.sin((1 - stampDown / 0.5) * Math.PI) : 0;
    stampArm.setAttribute("transform", `rotate(${(down * 40).toFixed(1)} 1000 560)`);
    const open = jobs.some((j) => j.stamped && j.x > GATE && j.x < GATE + 160);
    bar.setAttribute("transform", `rotate(${open ? -70 : 0} 1066 597)`);
    tickLamp.classList.toggle("on", jobs.some((j) => Math.abs(j.x - 700) < 40));
    scout.arm.setAttribute("transform", `rotate(${Math.sin(t * 2) * 8} 28 -6)`);
    const pr = jobs.find((j) => j.x > 1380 && j.x < 1520);
    receipt.setAttribute("transform", `translate(0 ${pr ? -Math.min(1, (pr.x - 1380) / 90) * 50 : 0})`);
  });

  W.page("VV 102", "lab");
})();
