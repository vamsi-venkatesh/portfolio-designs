// The paper town: every product is a district of one landscape, joined by one road and one river.
// Time of day runs across it: dawn over the farm on the right, night over the harbour on the left.
(() => {
  "use strict";
  const W = window.World;
  const { svgEl, sheet, layer, rect, round, circle, hill, seed, rnd, robot, label } = W;
  const svg = document.getElementById("town");
  const WIDTH = 3200;
  seed(2026);

  const plane = (name) => svgEl("g", { class: "tp tp-" + name }, svg);
  const P = { sky: plane("sky"), far: plane("far"), mid: plane("mid"), river: plane("river"), build: plane("build"), road: plane("road"), near: plane("near"), signs: plane("signs"), air: plane("air") };

  // ---------- sky: night on the left, day in the middle, dawn on the right ----------
  svgEl("rect", { x: -20, y: -20, width: WIDTH + 40, height: 1040, fill: "url(#skyTime)" }, P.sky);
  for (let k = 0; k < 70; k++) { const x = rnd() * 1100; svgEl("circle", { cx: x, cy: rnd() * 420, r: 0.7 + rnd() * 1.6, class: "star", style: `opacity:${(1 - x / 1100).toFixed(2)}` }, P.sky); }
  sheet(P.sky, circle(330, 150, 42), "#f6e9c6");
  const sun = svgEl("g", { class: "sun" }, P.sky);
  for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; sheet(sun, [[3000 + Math.cos(a) * 64, 250 + Math.sin(a) * 64], [3000 + Math.cos(a + 0.11) * 90, 250 + Math.sin(a + 0.11) * 90], [3000 + Math.cos(a + 0.22) * 64, 250 + Math.sin(a + 0.22) * 64]], "#f3b04a", { j: 0.3 }); }
  sheet(sun, circle(3000, 250, 56), "#f6c65b");
  const clouds = [[1300, 120, 0.9], [1900, 170, 0.8], [2500, 110, 1], [2750, 200, 0.7]].map(([x, y, s]) => { const c = W.cloud(P.sky, s); c.setAttribute("transform", `translate(${x} ${y})`); return { c, x, y, v: 5 + s * 4 }; });

  // ---------- land ----------
  sheet(layer(P.far, 3), hill(-40, WIDTH + 40, 560, 34, 7), "url(#farTime)", { j: 0.5 });
  sheet(layer(P.mid, 4), hill(-40, WIDTH + 40, 660, 22, 5), "url(#midTime)", { j: 0.5 });
  // the sea, left of the harbour
  const sea = layer(P.river, 5);
  sheet(sea, [[-40, 640], [470, 650], [520, 1040], [-40, 1040]], "#1f2c50", { j: 0.5 });
  for (let k = 0; k < 6; k++) svgEl("path", { d: `M${20 + k * 70} ${700 + (k % 3) * 40} q16 -8 32 0 t32 0`, class: "wave" }, sea);
  // the river: from the farm hills down through the town to the sea
  svgEl("path", { d: "M3150 640 C2900 700 2700 690 2500 720 S2100 760 1800 735 S1300 700 1000 725 S620 760 470 720", class: "river" }, P.river);
  // the road: one road through every district
  const roadD = "M3200 860 C2900 850 2700 875 2400 860 S1900 845 1600 862 S1100 880 800 862 S560 850 470 860";
  const road = svgEl("path", { d: roadD, class: "road" }, P.road);
  svgEl("path", { d: roadD, class: "road-mid" }, P.road);
  sheet(layer(P.near, 9), hill(-40, WIDTH + 40, 930, 10, 9), "url(#nearTime)", { j: 0.5 });

  // ---------- the districts ----------
  const D = {}, H = { wins: [] };
  // Trading: the harbour at night
  {
    const g = layer(P.build, 6);
    sheet(g, [[130, 640], [150, 360], [210, 360], [230, 640]], "#f3ead6", { j: 0.4 });
    [420, 500, 580].forEach((y) => sheet(g, [[146 - (y - 360) * 0.03, y], [214 + (y - 360) * 0.03, y], [215 + (y - 360) * 0.032, y + 28], [145 - (y - 360) * 0.032, y + 28]], "#d8412f", { j: 0.3 }));
    sheet(g, rect(142, 322, 76, 40), "#2d3038"); sheet(g, rect(154, 328, 52, 28), "#ffe6a8", { j: 0.2 }); sheet(g, [[134, 324], [180, 290], [226, 324]], "#2d3038", { j: 0.3 });
    H.beam = svgEl("path", { d: "M180 342 L700 250 L700 430 Z", class: "beam" }, P.build);
    sheet(g, rect(260, 690, 220, 20), "#6b4526"); for (let k = 0; k < 5; k++) sheet(g, rect(270 + k * 46, 710, 12, 80), "#553620", { j: 0.2 });
    H.links = Array.from({ length: 5 }, (_, k) => svgEl("ellipse", { cx: 300 + k * 34, cy: 682, rx: 16, ry: 8, class: "clink" }, g));
    const boat = H.boat = layer(P.build, 5); sheet(boat, [[40, 760], [150, 760], [130, 784], [60, 784]], "#fbf6ea"); sheet(boat, [[85, 760], [95, 712], [118, 760]], "#f3ead6", { j: 0.3 });
    D.trading = [300, 560];
  }
  // Conxfolio: the airfield
  {
    const g = layer(P.build, 6);
    sheet(g, [[560, 760], [860, 752], [872, 790], [550, 800]], "#fbf6ea", { j: 0.4 });
    for (let k = 0; k < 5; k++) svgEl("path", { d: `M${580 + k * 58} ${779 - k * 1.5} l30 -1`, class: "dash" }, g);
    const hangar = []; for (let k = 0; k <= 12; k++) { const a = Math.PI + (k / 12) * Math.PI; hangar.push([640 + Math.cos(a) * 80, 700 + Math.sin(a) * 80]); }
    sheet(g, hangar, "#d9d2c3", { j: 0.4 }); sheet(g, rect(610, 650, 60, 50), "#8b7d66", { j: 0.3 });
    sheet(g, rect(820, 610, 5, 100), "#6f7682", { j: 0.2 }); sheet(g, [[824, 612], [870, 618], [870, 632], [824, 636]], "#d8412f", { j: 0.2 });
    const pl = layer(P.air, 5); pl.setAttribute("class", "cut folio-plane");
    sheet(pl, [[-30, 6], [30, -10], [-8, 20]], "#fffdf6", { j: 0.2 });
    D.folio = [720, 560];
  }
  // Agent Service Lab: the factory
  {
    const g = layer(P.build, 6);
    sheet(g, rect(900, 500, 330, 260), "#cfd9cf", { j: 0.5 });
    for (let k = 0; k < 4; k++) sheet(g, [[900 + k * 82.5, 500], [940 + k * 82.5, 450], [982 + k * 82.5, 500]], "#8a959a", { j: 0.4 });
    sheet(g, rect(930, 560, 270, 110), "#bfe0ea", { j: 0.3 });
    svgEl("path", { d: "M940 650 L1190 650", class: "belt" }, g);
    H.boxes = [960, 1040, 1120].map((x) => { const b = svgEl("g", {}, g); sheet(b, rect(-15, 624, 30, 26), "#d3a066", { j: 0.2 }); return b; });
    H.gateLamp = svgEl("circle", { cx: 1150, cy: 600, r: 14, class: "gate-lamp" }, g);
    const gear = svgEl("g", { class: "a-spin", style: "--dur:14s" }, P.build);
    const pts = []; for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2, r = k % 2 ? 30 : 38; pts.push([1065 + Math.cos(a) * r, 715 + Math.sin(a) * r]); }
    sheet(gear, pts, "#c8642d", { j: 0.3 });
    D.lab = [1065, 350];
  }
  // PitchRadar: the town square
  {
    const COLS = ["#f2d7a6", "#e7b7a0", "#f4ead2", "#c9d8c0", "#f2c28a"];
    let x = 1270;
    for (let i = 0; i < 5; i++) {
      const w = 76 + rnd() * 16, h = 150 + rnd() * 60, top = 700 - h, g = layer(P.build, 6);
      sheet(g, rect(x, top, w, h + 60), COLS[i], { j: 0.4 }); sheet(g, [[x - 8, top + 3], [x + w / 2, top - 56], [x + w + 8, top + 3]], i % 2 ? "#a84a32" : "#8b3a2a", { j: 0.4 });
      svgEl("path", { d: `M${x} ${top + h * 0.45} L${x + w} ${top + h * 0.45} M${x + w / 2} ${top} L${x + w / 2} ${top + h + 60}`, class: "timber" }, g);
      sheet(g, rect(x + 10, top + 16, w / 2 - 18, 26), "#fff3c4", { j: 0.2 }); sheet(g, rect(x + w / 2 + 8, top + 16, w / 2 - 18, 26), "#fff3c4", { j: 0.2 });
      x += w + 4;
    }
    const bunt = svgEl("path", { d: "M1270 540 Q1480 600 1700 530", class: "string" }, P.build);
    const bl = bunt.getTotalLength();
    for (let n = 0; n < 12; n++) { const pt = bunt.getPointAtLength((n / 12) * bl + 10); sheet(P.build, [[pt.x - 9, pt.y], [pt.x + 9, pt.y], [pt.x, pt.y + 22]], ["#d8412f", "#f0b83c", "#2c55c4", "#2f8f4e"][n % 4], { j: 0.2 }); }
    const truck = layer(P.road, 8);
    sheet(truck, round(1410, 770, 170, 76, 12), "#f0b83c"); sheet(truck, rect(1430, 786, 90, 34), "#3b2b1d", { j: 0.2 });
    for (let k = 0; k < 5; k++) sheet(truck, rect(1420 + k * 30, 770, 15, 12), k % 2 ? "#fbf6ea" : "#d8412f", { j: 0.2 });
    [1440, 1550].forEach((wx) => sheet(truck, circle(wx, 848, 15), "#2d3038"));
    sheet(truck, rect(1470, 740, 5, 32), "#6f7682", { j: 0.1 });
    H.sweep = svgEl("path", { d: "M1472 742 L1640 640 A200 200 0 0 0 1580 590 Z", class: "sweep" }, P.road);
    D.radar = [1480, 400];
  }
  // Conxto: the city of postings
  {
    const g = layer(P.build, 6); let x = 1760;
    while (x < 2140) {
      const w = 50 + rnd() * 40, h = 200 + rnd() * 220;
      sheet(g, rect(x, 760 - h, w, h), rnd() > 0.5 ? "#3f5f86" : "#5d7da0", { j: 0.4 });
      for (let r = 0; r < Math.floor(h / 30) - 1; r++) for (let c = 0; c < Math.floor(w / 20); c++) if (rnd() > 0.35) H.wins.push(svgEl("rect", { x: x + 6 + c * 20, y: 770 - h + r * 30, width: 10, height: 14, class: "cwin" }, g));
      x += w + 6;
    }
    for (let k = 0; k < 6; k++) { const pg = layer(P.air, 3); pg.setAttribute("class", "cut posting"); pg.style.setProperty("--d", (k * 1.1).toFixed(1) + "s"); pg.style.setProperty("--x", (1780 + k * 62) + "px"); sheet(pg, rect(-16, -12, 32, 24), "#fbf6ea", { j: 0.2 }); }
    D.conxto = [1950, 150];
  }
  // UnboundPDF: the workshop whose front is a browser window
  {
    const g = layer(P.build, 6);
    sheet(g, round(2180, 470, 300, 290, 12), "#2d3038", { j: 0.4 });
    sheet(g, rect(2192, 506, 276, 242), "#dcecef", { j: 0.3 });
    [2204, 2220, 2236].forEach((cx, k) => sheet(g, circle(cx, 488, 5), ["#d8412f", "#f0b83c", "#2f8f4e"][k]));
    svgEl("path", { d: "M2204 700 L2456 700", class: "belt" }, g);
    H.pages = [2230, 2300, 2370].map((px) => { const p = svgEl("g", {}, g); sheet(p, rect(-18, 648, 36, 48), "#fffdf6", { j: 0.2 }); sheet(p, rect(-18, 648, 36, 10), "#d3402e", { j: 0.1 }); return p; });
    H.press = svgEl("g", {}, g);
    sheet(H.press, rect(2280, 560, 60, 70), "#9aa0a8", { j: 0.2 });
    sheet(g, round(2158, 690, 40, 34, 5), "#f0b83c");
    D.pdf = [2330, 380];
  }
  // Forge: the exam hall on the hill
  {
    sheet(layer(P.mid, 5), hill(2480, 2880, 610, 60, 1, 1040).map(([x, y], i, a) => i === 0 || i === a.length - 1 ? [x, y] : [x, y - Math.sin(((x - 2480) / 400) * Math.PI) * 90]), "#6e8a6a", { j: 0.5 });
    const g = layer(P.build, 6);
    sheet(g, rect(2560, 450, 240, 150), "#e8dcc2", { j: 0.4 });
    sheet(g, [[2548, 454], [2680, 390], [2812, 454]], "#5b6478", { j: 0.4 });
    [2590, 2650, 2710].forEach((wx) => { const a = [[wx, 560]]; for (let k = 0; k <= 8; k++) { const t = Math.PI + (k / 8) * Math.PI; a.push([wx + 18 + Math.cos(t) * 18, 500 + Math.sin(t) * 18]); } a.push([wx + 36, 560]); sheet(g, a, "#1f2a44", { j: 0.2 }); });
    svgEl("path", { d: "M2640 390 Q2680 330 2720 390", class: "dome" }, g);
    sheet(g, circle(2680, 425, 14), "#fbf6ea");
    D.forge = [2680, 250];
  }
  // FarmQuick: the farm at dawn
  {
    const g = layer(P.build, 6);
    [[2890, 700, 260, 40, "#c9b36a"], [2930, 752, 250, 44, "#7aa45c"]].forEach(([x, y, w, h, c]) => { sheet(g, [[x, y + h], [x + 24, y], [x + w + 24, y], [x + w, y + h]], c, { j: 0.4 }); for (let k = 1; k < 6; k++) svgEl("path", { d: `M${x + (w * k) / 6} ${y + h} L${x + 24 + (w * k) / 6} ${y}`, class: "furrow" }, g); });
    sheet(g, rect(2920, 600, 110, 90), "#f3e3c3"); sheet(g, [[2908, 604], [2975, 548], [3042, 604]], "#c8642d", { j: 0.4 }); sheet(g, rect(2986, 640, 30, 26), "#ffd57c", { j: 0.2 });
    sheet(g, rect(3050, 610, 100, 80), "#b8452f"); sheet(g, [[3042, 614], [3100, 572], [3158, 614]], "#8f3424", { j: 0.4 });
    sheet(g, rect(3160, 560, 34, 130), "#d9d2c3", { j: 0.3 });
    D.farm = [3040, 440];
  }

  // the truck that runs the whole road: farm to city and back
  const truck = svgEl("g", { class: "truck" }, P.road);
  const tb = layer(truck, 6);
  [[-18, -44, 9, "#d8412f"], [-4, -47, 10, "#6f9a55"], [10, -44, 9, "#d8412f"]].forEach(([x, y, r, c]) => sheet(tb, circle(x, y, r), c));
  sheet(tb, rect(-30, -40, 70, 30), "#d3a066"); sheet(tb, round(40, -36, 34, 28, 5), "#2f8f4e");
  [-14, 26, 60].forEach((x) => sheet(tb, circle(x, -8, 9), "#2d3038"));

  // the banner plane: my name, towed across the sky
  const bannerPlane = svgEl("g", { class: "banner-plane" }, P.air);
  svgEl("path", { d: "M-40 0 L-120 0", class: "tow" }, bannerPlane);
  const bn = layer(bannerPlane, 4);
  sheet(bn, [[-560, -30], [-120, -30], [-120, 30], [-560, 30], [-540, 0]], "#fbf6ea", { j: 0.5 });
  svgEl("text", { x: -340, y: 10, class: "banner-t", "text-anchor": "middle" }, bannerPlane).textContent = "Vamsi Venkatesh · AI systems & product engineer";
  const bp = layer(bannerPlane, 5); sheet(bp, [[-40, 10], [40, -16], [-10, 30]], "#fffdf6", { j: 0.3 }); sheet(bp, [[-10, 30], [40, -16], [0, 6]], "#e9dfca", { j: 0.2 });

  // ---------- district signs: every district says its name ----------
  const items = window.DESK.items;
  const sign = (id, x, y) => {
    const it = items[id], g = svgEl("g", { class: "district", tabindex: 0, role: "link", "aria-label": `${it.name}: ${it.line}. Enter.`, "data-id": id }, P.signs);
    svgEl("path", { d: `M${x} ${y + 64} L${x} ${y + 150}`, class: "post" }, g);
    const w = Math.max(it.name.length * 14 + 40, it.line.length * 7.4 + 30);
    const s = layer(g, 6); sheet(s, rect(x - w / 2, y, w, 66), "#fbf6ea", { j: 0.4 });
    svgEl("text", { x, y: y + 30, class: "sign-name", "text-anchor": "middle" }, g).textContent = it.name;
    svgEl("text", { x, y: y + 52, class: "sign-line", "text-anchor": "middle" }, g).textContent = it.line;
    return g;
  };
  Object.entries(D).forEach(([id, [x, y]]) => sign(id, x, y));

  window.Town = { svg, WIDTH, road, truck, bannerPlane, D, H, P, clouds };
})();
