// Camera: see yourself the way the machine sees you. Stays on your device; nothing is recorded or sent.
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const RAMP = ' .·:-=+*#%@';

export default {
  mount(body, api) {
    const wrap = el('div', 'cam'); body.appendChild(wrap);
    const cv = el('canvas'); const ui = el('div', 'camui');
    const modes = [['glyph', 'glyphs'], ['xray', 'x-ray'], ['plain', 'mirror']]; let mode = 'glyph';
    const mb = modes.map(([k, l]) => { const b = el('button', 'btn' + (k === mode ? ' warm' : ''), l); b.addEventListener('click', () => { mode = k; mb.forEach((x, i) => x.classList.toggle('warm', modes[i][0] === k)); }); ui.appendChild(b); return b; });
    const snap = el('button', 'btn', 'capture'); ui.appendChild(snap);
    const note = el('p', 'camnote', 'Your camera stays on this device. Nothing is recorded or sent.');
    const start = el('div', 'camstart'); const sb = el('button', 'btn warm', 'turn on my camera'); start.append(el('p', null, 'This machine can look back at you.'), sb, note.cloneNode(true));
    wrap.append(cv, ui, note, start);
    api.setTitle('Camera', 'local only');
    const v = el('video'); v.muted = true; v.playsInline = true;
    const small = document.createElement('canvas'); const sx = small.getContext('2d', { willReadFrequently: true });
    let stream = null, raf = 0, fr = 0;
    sb.addEventListener('click', async () => {
      try { stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false }); }
      catch (e) { start.replaceChildren(el('p', null, 'No camera, or permission was declined. That’s fine; nothing else here needs it.')); return; }
      v.srcObject = stream; await v.play(); start.remove(); loop();
    });
    function loop() {
      raf = requestAnimationFrame(loop); if (mode === 'glyph' && (fr++ & 1)) return;
      const W = wrap.clientWidth, H = wrap.clientHeight; if (cv.width !== W) { cv.width = W; cv.height = H; }
      const c = cv.getContext('2d'); c.fillStyle = '#03050a'; c.fillRect(0, 0, W, H);
      if (!v.videoWidth) return;
      const ar = v.videoWidth / v.videoHeight; let dw = W, dh = W / ar; if (dh < H) { dh = H; dw = H * ar; }
      if (mode === 'plain') { c.save(); c.translate(W, 0); c.scale(-1, 1); c.drawImage(v, (W - dw) / 2, (H - dh) / 2, dw, dh); c.restore(); return; }
      const cell = mode === 'glyph' ? (W > 600 ? 12 : 9) : 4; const cols = Math.ceil(W / cell), rows = Math.ceil(H / cell);
      small.width = cols; small.height = rows; sx.save(); sx.translate(cols, 0); sx.scale(-1, 1);
      sx.drawImage(v, (cols - dw / cell) / 2, (rows - dh / cell) / 2, dw / cell, dh / cell); sx.restore();
      const px = sx.getImageData(0, 0, cols, rows).data;
      if (mode === 'glyph') {
        c.font = '300 ' + (cell + 2) + 'px "Martian Mono", monospace'; c.textBaseline = 'top';
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4; const l = (px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11) / 255;
          const ch = RAMP[Math.min(RAMP.length - 1, (l * RAMP.length) | 0)]; if (ch === ' ') continue;
          c.fillStyle = l > 0.75 ? '#ffd2a0' : 'rgba(159,208,255,' + (0.35 + l * 0.65).toFixed(2) + ')'; c.fillText(ch, x * cell, y * cell);
        }
      } else {
        const img = c.createImageData(cols, rows); const o = img.data;
        for (let y = 1; y < rows - 1; y++) for (let x = 1; x < cols - 1; x++) {
          const L = (k) => px[k] * 0.3 + px[k + 1] * 0.59 + px[k + 2] * 0.11; const i = (y * cols + x) * 4;
          const g = Math.abs(L(i + 4) - L(i - 4)) + Math.abs(L(i + cols * 4) - L(i - cols * 4)); const e = Math.min(255, g * 2.2);
          o[i] = e * 0.62; o[i + 1] = e * 0.9; o[i + 2] = e; o[i + 3] = 255;
        }
        small.getContext('2d').putImageData(img, 0, 0); c.imageSmoothingEnabled = true; c.drawImage(small, 0, 0, cols * cell, rows * cell);
      }
    }
    snap.addEventListener('click', () => { const a = document.createElement('a'); a.download = 'vvos-2126-you.png'; a.href = cv.toDataURL('image/png'); a.click(); });
    return { unmount() { cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach((t) => t.stop()); v.srcObject = null; wrap.remove(); } };
  },
};
