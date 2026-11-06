// Walking the town: drag, scroll or the index to move along it; a sign takes you into that district's world.
// ?frame=1|2|3 freezes the intro at one of its three moments (used for approval stills).
(() => {
  "use strict";
  const T = window.Town, pan = document.getElementById("pan");
  const NS = "http://www.w3.org/2000/svg";
  const ORDER = ["trading", "folio", "lab", "radar", "conxto", "pdf", "forge", "farm"];
  const NAMES = window.DESK.items;
  const toPx = (x) => (x / T.WIDTH) * T.svg.getBoundingClientRect().width;
  const center = (x, smooth) => pan.scrollTo({ left: toPx(x) - pan.clientWidth / 2, behavior: smooth ? "smooth" : "auto" });
  const svgEl = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };

  // the index: every district by name, always one tap away
  const index = document.getElementById("index");
  ORDER.forEach((id) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = NAMES[id].name; b.dataset.id = id;
    b.addEventListener("click", () => center(T.D[id][0], true));
    index.appendChild(b);
  });
  const mark = () => {
    const mid = ((pan.scrollLeft + pan.clientWidth / 2) / T.svg.getBoundingClientRect().width) * T.WIDTH;
    let best = null, d = 1e9;
    ORDER.forEach((id) => { const dd = Math.abs(T.D[id][0] - mid); if (dd < d) { d = dd; best = id; } });
    index.querySelectorAll("button").forEach((b) => b.classList.toggle("here", b.dataset.id === best));
  };
  pan.addEventListener("scroll", mark, { passive: true });

  // drag and wheel both walk sideways
  let sx = null, sl = 0, moved = 0;
  pan.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") return; sx = e.clientX; sl = pan.scrollLeft; moved = 0; pan.classList.add("dragging"); });
  addEventListener("pointermove", (e) => { if (sx == null) return; moved = Math.abs(e.clientX - sx); pan.scrollLeft = sl - (e.clientX - sx); });
  addEventListener("pointerup", () => { sx = null; pan.classList.remove("dragging"); });
  pan.addEventListener("wheel", (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { pan.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
  pan.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") pan.scrollBy({ left: 240, behavior: "smooth" }); if (e.key === "ArrowLeft") pan.scrollBy({ left: -240, behavior: "smooth" }); });

  // signs lead into the worlds
  T.svg.querySelectorAll(".district").forEach((g) => {
    const go = () => { location.href = "w/" + g.dataset.id + ".html"; };
    g.addEventListener("click", () => { if (moved < 6) go(); });
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });

  // the still: truck on the road, the banner in the sky over the square
  const at = T.road.getPointAtLength(T.road.getTotalLength() * 0.42);
  T.truck.setAttribute("transform", `translate(${at.x} ${at.y}) scale(-1 1)`);
  T.bannerPlane.setAttribute("transform", "translate(1760 92) rotate(-2)");
  document.querySelector(".folio-plane").setAttribute("transform", "translate(760 470) rotate(-18)");
  document.querySelectorAll(".posting").forEach((p, k) => p.style.transform = `translate(${1790 + k * 60}px, ${200 + ((k * 137) % 240)}px) rotate(${(k % 2 ? 1 : -1) * (10 + k * 4)}deg)`);

  requestAnimationFrame(() => { center(1480); mark(); });

  // the sheet the town is cut from
  const frame = +(new URLSearchParams(location.search).get("frame") || 3);
  const sheet = document.getElementById("sheet"), ss = document.getElementById("sheet-svg");
  if (frame >= 3) { sheet.hidden = true; return; }
  const w = innerWidth, h = innerHeight;
  ss.setAttribute("viewBox", `0 0 ${w} ${h}`);
  let d = `M0 ${h * 0.7}`, x = 0;
  while (x < w) { const bw = 30 + ((x * 7919) % 70), bh = h * (0.5 + (((x * 104729) % 100) / 100) * 0.16); d += ` L${x} ${bh} L${x + bw} ${bh}`; x += bw; }
  const guide = svgEl("path", { d, class: "guide" }, ss);
  const cutAt = frame === 2 ? 0.52 : 0.06, total = guide.getTotalLength();
  svgEl("path", { d, class: "done", "stroke-dasharray": `${total * cutAt} 99999` }, ss);
  const p = guide.getPointAtLength(total * cutAt);
  const sc = svgEl("g", { transform: `translate(${p.x} ${p.y}) rotate(8)` }, ss); // the scissors
  svgEl("path", { d: "M0 0 L46 -10 L48 -4 Z", fill: "#c9ced6" }, sc);
  svgEl("path", { d: "M0 0 L46 10 L48 4 Z", fill: "#aeb4bd" }, sc);
  svgEl("circle", { cx: -14, cy: -10, r: 11, fill: "none", stroke: "#d8412f", "stroke-width": 5 }, sc);
  svgEl("circle", { cx: -14, cy: 10, r: 11, fill: "none", stroke: "#d8412f", "stroke-width": 5 }, sc);
  if (frame === 2) {
    // the paper comes away only under the cut line, up to where the scissors are: the town shows where it has been cut out
    const pts = []; for (let l = 0; l <= total * cutAt; l += 4) { const q = guide.getPointAtLength(l); pts.push(`${q.x.toFixed(1)} ${q.y.toFixed(1)}`); }
    sheet.style.clipPath = `path(evenodd, "M0 0 H${w} V${h} H0 Z M0 ${h} L${pts.join(" L")} L${p.x.toFixed(1)} ${h} Z")`;
  }
})();
