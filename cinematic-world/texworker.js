// Builds each screen's browser-window texture off the main thread: fetch, decode, draw the window chrome and the
// screenshot onto an OffscreenCanvas (pre-flipped for WebGL), and hand back an ImageBitmap. The page only uploads.
self.onmessage = async (e) => {
  const { id, src, url, tint, TW, BAR, IH } = e.data;
  try {
    const img = await createImageBitmap(await (await fetch(src)).blob());
    const TH = BAR + IH, c = new OffscreenCanvas(TW, TH), g = c.getContext("2d"), k = TW / 1280, R = 20 * k;
    g.translate(0, TH); g.scale(1, -1);
    g.save(); g.beginPath(); g.roundRect(0, 0, TW, TH, R); g.clip();
    g.fillStyle = "#15151b"; g.fillRect(0, 0, TW, BAR);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc((28 + i * 22) * k, BAR / 2, 6.5 * k, 0, 7); g.fill(); });
    g.fillStyle = "#24242c"; g.beginPath(); g.roundRect(TW / 2 - 260 * k, BAR * 0.22, 520 * k, BAR * 0.56, 8 * k); g.fill();
    g.fillStyle = tint; g.beginPath(); g.arc(TW / 2 - 236 * k, BAR / 2, 4 * k, 0, 7); g.fill();
    g.fillStyle = "#c2c2cc"; g.font = `500 ${17 * k}px system-ui, -apple-system, "Segoe UI", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(url, TW / 2 + 6 * k, BAR / 2 + 1);
    g.imageSmoothingQuality = "high";
    const s = TW / img.width, sh = Math.min(img.height, IH / s); g.drawImage(img, 0, 0, img.width, sh, 0, BAR, TW, sh * s);
    g.restore();
    g.strokeStyle = "rgba(255,255,255,.2)"; g.lineWidth = 2 * k; g.beginPath(); g.roundRect(k, k, TW - 2 * k, TH - 2 * k, R); g.stroke();
    img.close();
    const bmp = c.transferToImageBitmap();
    self.postMessage({ id, bmp }, [bmp]);
  } catch (err) { self.postMessage({ id, err: String(err) }); }
};
