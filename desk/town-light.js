// The light you hold. The pointer (or tilting a phone) is the light: every paper shadow falls away from it,
// the back layers slide against the town, and on the night side it is a torch that lights what it touches.
(() => {
  "use strict";
  const T = window.Town, svg = T.svg, pan = document.getElementById("pan");
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const torch = document.getElementById("torch");
  const params = new URLSearchParams(location.search);

  // target light position in the viewport, 0..1; the rendered light eases toward it
  let tx = 0.7, ty = 0.15, lx = tx, ly = ty, last = 0, have = false;
  addEventListener("pointermove", (e) => { if (e.pointerType === "touch") return; tx = e.clientX / innerWidth; ty = e.clientY / innerHeight; last = performance.now(); have = true; }, { passive: true });
  addEventListener("deviceorientation", (e) => {
    if (e.gamma == null) return;
    tx = Math.min(1, Math.max(0, 0.5 + e.gamma / 60)); ty = Math.min(1, Math.max(0, 0.3 + (e.beta - 40) / 80)); last = performance.now(); have = true;
  });
  // stills: ?light=x,y pins the light for approval frames
  if (params.has("light")) { const [a, b] = params.get("light").split(",").map(Number); tx = lx = a; ty = ly = b; have = true; last = 1e15; }

  const scale = () => svg.getBoundingClientRect().width / T.WIDTH;
  const beam = T.H.beam, lampWins = T.H.wins;
  let lastSet = "", lastT = 0;
  function frame(now) {
    if (!document.hidden) {
      lx += (tx - lx) * 0.08; ly += (ty - ly) * 0.08;
      // shadows fall away from the light; the light is always a little above the paper
      let sx = (0.5 - lx) * 2.4, sy = 0.35 + (ly < 0.5 ? (0.5 - ly) * 1.6 : 0) - (ly > 0.5 ? (ly - 0.5) * 1.2 : 0);
      // Re-blurring every shadow in the town is the expensive part, so shadows move in small steps,
      // at most ~8 times a second, and not at all while the light rests (measured: 18 fps → see Daily).
      const qx = Math.round(sx * 10) / 10, qy = Math.round(sy * 10) / 10, key = qx + "," + qy;
      if (key !== lastSet && now - lastT > 120) { lastT = now; sx = qx; sy = qy; svg.style.setProperty("--lx", sx.toFixed(2)); svg.style.setProperty("--ly", sy.toFixed(2)); lastSet = key; }
      // depth: the back layers slide against the town as the light moves (town-life reads this). A 3D tilt of the
      // whole diorama was tried and dropped: it halved the frame rate for a few degrees of lean.
      window.TownLight = { x: lx, y: ly };
      // where the light is in the town, and how dark it is there
      const wx = (pan.scrollLeft + lx * innerWidth) / scale();
      const night = Math.max(0, Math.min(1, (1300 - wx) / 900));
      torch.style.setProperty("--mx", (lx * 100).toFixed(1) + "%");
      torch.style.setProperty("--my", (ly * 100).toFixed(1) + "%");
      torch.style.opacity = (0.25 + night * 0.75).toFixed(2);
      // the torch wakes what it touches: the lighthouse lamp and nearby windows
      beam.classList.toggle("lit", Math.abs(wx - 180) < 260 && night > 0.3);
      if (have && Math.random() < 0.3 && lampWins.length) {
        const wy = ly * 1000;
        lampWins.forEach((w) => { if (Math.random() < 0.08) { const bx = +w.getAttribute("x"), by = +w.getAttribute("y"); if (Math.hypot(bx - wx, by - wy) < 160) w.classList.remove("off"); } });
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
