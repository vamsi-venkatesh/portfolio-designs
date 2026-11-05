// UnboundPDF — "The Sealed Tab". A glass ring is the browser tab; a page settles inside it and
// distant servers reach for it and stop at the edge. Drop a real file: it is read here, hashed here,
// and a meter built from the browser's own resource log shows what left the tab while it happened.
import { life, h, fonts, style, sha256, controls, reading } from './_kit.js';

const CSS = `
.ub{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;background:#05070b;color:#efeae0;font-family:"DM Mono",Menlo,monospace;-webkit-user-select:text;user-select:text;touch-action:pan-y}
.ub-stage{position:relative;height:100%;min-height:640px;display:grid;place-items:center;overflow:hidden}
.ub-stage canvas{position:absolute;inset:0;width:100%;height:100%}
.ub-ring{position:relative;z-index:2;width:min(64vh,78vw);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;text-align:center;cursor:pointer;
  background:radial-gradient(circle at 50% 40%,#efeae00d,#efeae003 60%,transparent 70%);transition:background .3s}
.ub-ring:hover,.ub-ring.over{background:radial-gradient(circle at 50% 40%,#efeae01f,#efeae006 60%,transparent 70%)}
.ub-ring:focus-within{outline:none}
.ub-in{display:flex;flex-direction:column;align-items:center;gap:10px;padding:16%;max-width:100%}
.ub-sheet{width:62px;height:80px;background:#efeae0;clip-path:polygon(0 0,74% 0,100% 22%,100% 100%,0 100%);position:relative;animation:ubdrop 1.6s cubic-bezier(.2,.8,.2,1) both;box-shadow:0 10px 30px #0008}
.ub-sheet:after{content:"";position:absolute;right:0;top:0;width:26%;height:22%;background:#bdb5a6}
.ub-sheet i{position:absolute;left:10px;right:14px;height:2px;background:#05070b44}
@keyframes ubdrop{from{transform:translateY(-46vh) rotate(-14deg);opacity:0}to{transform:none;opacity:1}}
.ub-big{font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-weight:500;font-size:clamp(28px,4.2vh,44px);line-height:1.02;margin:0}
.ub-small{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#bdb5a6;margin:0;line-height:1.6}
.ub-pick{font:inherit;font-size:12px;letter-spacing:.1em;text-transform:uppercase;background:#efeae0;color:#05070b;border:0;border-radius:99px;padding:10px 18px;cursor:pointer}
.ub-pick:focus-visible{outline:2px solid #cfe6ff;outline-offset:3px}
.ub-file{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.ub-res{display:grid;gap:4px;width:100%;font-size:11.5px;text-align:left}
.ub-res div{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid #efeae022;padding:4px 0}
.ub-res span{color:#bdb5a6}.ub-res b{font-weight:400;word-break:break-all;text-align:right}
.ub-meter{position:absolute;z-index:3;right:28px;top:50%;transform:translateY(-50%);width:210px;border-left:1px solid #efeae044;padding-left:16px}
.ub-meter h4{margin:0 0 4px;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:#bdb5a6;font-weight:400}
.ub-meter .n{font-family:"Cormorant Garamond",serif;font-size:76px;line-height:1;color:#efeae0}
.ub-meter p{font-size:11px;line-height:1.6;color:#bdb5a6;margin:6px 0 0}
.ub-meter .ok{color:#9fe0b0}.ub-meter .warn{color:#ffd2a0}
.ub-left{position:absolute;z-index:3;left:28px;top:50%;transform:translateY(-50%);max-width:300px}
.ub-left h2{font-family:"Cormorant Garamond",serif;font-weight:500;font-size:clamp(46px,5.6vw,84px);line-height:.9;margin:0 0 16px}
.ub-left h2 em{display:block;font-weight:400}
.ub-left p{font-size:12px;line-height:1.7;color:#d6cfc2;margin:0 0 12px}
.ub-figs{display:flex;gap:22px;margin-top:14px}
.ub-figs b{display:block;font-family:"Cormorant Garamond",serif;font-size:44px;font-weight:500;line-height:1}
.ub-figs span{font-size:10.5px;color:#bdb5a6;letter-spacing:.08em}
.ub-nav{position:fixed;z-index:6;top:14px;left:50%;transform:translateX(-50%);display:flex;gap:4px;align-items:center;padding:5px;border:1px solid #efeae033;border-radius:99px;background:#05070bcc;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);max-width:calc(100vw - 20px);flex-wrap:wrap;justify-content:center}
.ub-nav .kx-b{font:inherit;font-size:11.5px;background:transparent;color:#efeae0;border:0;border-radius:99px;padding:7px 12px;cursor:pointer}
.ub-nav .kx-b:hover,.ub-nav .kx-b:focus-visible{background:#efeae0;color:#05070b;outline:none}
.ub-nav .kx-pos{font-family:"Cormorant Garamond",serif;font-style:italic;font-size:18px;padding:0 8px}
.ub-nav .kx-live{background:#efeae0;color:#05070b}
.ub-page{background:#efeae0;color:#1b1a17;position:relative;z-index:2}
.ub .kx-read{max-width:760px;margin:0 auto;padding:90px 28px 120px}
.ub .kx-kind{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#6e675b;margin:0}
.ub .kx-title{font-family:"Cormorant Garamond",serif;font-weight:500;font-size:clamp(54px,8vw,96px);line-height:.95;margin:10px 0 12px}
.ub .kx-lede{font-family:"Cormorant Garamond",serif;font-style:italic;font-size:26px;line-height:1.25;margin:0 0 30px}
.ub .kx-sec{padding:28px 0;border-top:1px solid #1b1a1722}
.ub .kx-h{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#6e675b;margin:0 0 14px;font-weight:400}
.ub .kx-p,.ub .kx-ul li{font-family:"Cormorant Garamond",serif;font-size:21px;line-height:1.5;margin:0 0 10px}
.ub .kx-summary .kx-p:first-letter{font-size:74px;float:left;line-height:.8;padding:6px 8px 0 0}
.ub .kx-ul{padding-left:20px;margin:0}
.ub .kx-bt{font-family:"Cormorant Garamond",serif;font-weight:600;font-size:24px;margin:0 0 4px}
.ub .kx-block,.ub .kx-dec,.ub .kx-eval{margin:0 0 22px}
.ub .kx-steps{list-style:none;margin:0;padding:0;counter-reset:a}
.ub .kx-step{display:grid;grid-template-columns:44px 1fr;column-gap:10px;margin-bottom:14px}
.ub .kx-sn{grid-row:span 2;font-size:12px;color:#6e675b;padding-top:8px}
.ub .kx-trade{color:#4d483f}
.ub .kx-d{font-size:11px;letter-spacing:.12em;color:#6e675b}
.ub .kx-nums{display:grid;grid-template-columns:1fr 1fr;gap:20px 28px}
.ub .kx-v{display:block;font-family:"Cormorant Garamond",serif;font-size:62px;font-weight:500;line-height:1}
.ub .kx-l{display:block;font-family:"Cormorant Garamond",serif;font-size:17px;line-height:1.35}
.ub .kx-stack{padding:0;margin:0;list-style:none;columns:2;column-gap:28px}
.ub .kx-stack li{font-size:12px;line-height:1.5;margin-bottom:6px;break-inside:avoid}
.ub .kx-links{display:flex;flex-direction:column;gap:2px}
.ub .kx-link{font-family:"Cormorant Garamond",serif;font-size:21px;text-align:left;background:none;border:0;border-bottom:1px solid #1b1a1733;padding:8px 0;color:#1b1a17;cursor:pointer}
.ub .kx-link:hover,.ub .kx-link:focus-visible{color:#8a4a12;outline:none}
@media (max-width:900px){
  .ub-stage{height:auto;min-height:0;display:flex;flex-direction:column;gap:22px;padding:84px 16px 40px}
  .ub-left,.ub-meter{position:relative;left:auto;right:auto;top:auto;transform:none;max-width:none;width:100%}
  .ub-meter{border-left:0;border-top:1px solid #efeae044;padding:14px 0 0}
  .ub-ring{width:min(92vw,420px);order:-1}.ub-in{padding:14%}.ub-nav{top:auto;bottom:10px;left:8px;right:8px;transform:none;flex-wrap:nowrap;justify-content:space-between;max-width:none}.ub-nav .kx-src{display:none}.ub-nav .kx-b{padding:7px 7px;font-size:10.5px;white-space:nowrap}.ub-nav .kx-pos{font-size:15px;padding:0 2px;white-space:nowrap}
  .ub .kx-read{padding:60px 18px 100px}.ub .kx-nums{grid-template-columns:1fr}.ub .kx-stack{columns:1}
}`;

const fmt = (n) => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(2) + ' MB';

export default {
  async mount(root, ctx) {
    const L = life();
    fonts(L, 'family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Mono:wght@400');
    style(L, CSS);
    const it = ctx.item;
    const cv = h('canvas', { attrs: { 'aria-hidden': 'true' } });
    const file = h('input.ub-file', { attrs: { type: 'file', 'data-qa': 'file', 'aria-label': 'Choose a file to read inside this tab' } });
    const sheet = h('div.ub-sheet', [14, 24, 34, 44, 54].map((y) => h('i', { style: { top: y + 'px' } })));
    const inner = h('div.ub-in', sheet,
      h('p.ub-big', { text: 'Drop a file into the tab.' }),
      h('p.ub-small', { text: 'It is read here. Nothing is uploaded.' }),
      h('button.ub-pick', { text: 'Choose a file', attrs: { type: 'button' }, on: { click: (e) => { e.stopPropagation(); file.click(); } } }));
    const ring = h('div.ub-ring', { attrs: { role: 'region', 'aria-label': 'Drop zone: the browser tab' } }, inner, file);
    const mN = h('div.n', { text: '–' }), mP = h('p', { text: 'Waiting for a file. The count comes from this tab\'s own resource log, read before and after.' });
    const meter = h('aside.ub-meter', { attrs: { 'aria-live': 'polite' } }, h('h4', { text: 'Requests while your file was read' }), mN, mP);
    const [n0, n1] = it.stage;
    const left = h('div.ub-left',
      h('h2', 'Unbound', h('em', { text: 'PDF' })),
      h('p', { text: it.line }),
      h('p', { text: 'A working model of the idea, not the product: this demo reads, hashes and counts pages with the browser\'s own APIs. The real tools do the editing.' }),
      h('div.ub-figs', [n0, n1, it.stage[2]].map(([v, l]) => h('div', h('b', { text: v }), h('span', { text: l })))));
    const stage = h('section.ub-stage', cv, left, ring, meter);
    const box = h('div.ub', stage, h('div.ub-page', reading(ctx)), controls(L, ctx, 'ub-nav'));
    root.append(box);

    // --- reading a file locally
    let pulse = 0;
    async function take(f) {
      if (!f) return;
      const before = performance.getEntriesByType('resource').length;
      inner.replaceChildren(h('p.ub-small', { text: 'reading inside the tab…' }));
      const buf = await f.arrayBuffer();
      const hex = await sha256(buf);
      let pages = null;
      const head = new Uint8Array(buf, 0, Math.min(5, buf.byteLength));
      const isPdf = String.fromCharCode(...head) === '%PDF-';
      if (isPdf) {
        const txt = new TextDecoder('latin1').decode(buf);
        pages = (txt.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length;
      }
      await new Promise((r) => setTimeout(r, 350)); // let the resource log settle
      const after = performance.getEntriesByType('resource').slice(before);
      const bytes = after.reduce((a, e) => a + (e.transferSize || 0), 0);
      inner.replaceChildren(
        h('p.ub-big', { text: f.name.length > 28 ? f.name.slice(0, 25) + '…' : f.name }),
        h('div.ub-res',
          h('div', h('span', { text: 'size' }), h('b', { text: fmt(f.size) })),
          h('div', h('span', { text: 'type' }), h('b', { text: isPdf ? 'PDF' : (f.type || 'unknown') })),
          isPdf ? h('div', h('span', { text: 'pages' }), h('b', { text: pages ? String(pages) : '0 found by a plain scan (compressed object streams hide them)' })) : null,
          h('div', h('span', { text: 'sha-256' }), h('b', { text: hex }))),
        h('button.ub-pick', { text: 'Another file', attrs: { type: 'button' }, on: { click: (e) => { e.stopPropagation(); file.value = ''; file.click(); } } }));
      mN.textContent = String(after.length);
      mN.className = 'n ' + (after.length ? 'warn' : 'ok');
      mP.textContent = after.length
        ? after.length + ' request(s), ' + fmt(bytes) + ', all by this page itself: ' + [...new Set(after.map((e) => new URL(e.name).host))].join(', ') + '. Your file was not among them: there is no upload code here.'
        : '0 requests and 0 bytes left this tab between picking the file and showing its hash. Check it yourself in the Network panel.';
      pulse = performance.now();
    }
    L.on(file, 'change', () => take(file.files[0]));
    L.on(ring, 'click', (e) => { if (e.target === ring || e.target === inner) file.click(); });
    L.on(ring, 'dragover', (e) => { e.preventDefault(); ring.classList.add('over'); });
    L.on(ring, 'dragleave', () => ring.classList.remove('over'));
    L.on(ring, 'drop', (e) => { e.preventDefault(); ring.classList.remove('over'); take(e.dataTransfer.files[0]); });
    // stop a file dropped elsewhere from navigating the OS away
    const stopNav = (e) => { if (e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files')) e.preventDefault(); };
    L.on(window, 'dragover', stopNav); L.on(window, 'drop', stopNav);

    // --- the ring and the servers that cannot reach it
    const g = cv.getContext('2d'); let W = 0, H = 0, dpr = 1, nodes = [];
    const size = () => {
      const r = stage.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
      nodes = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2 + 0.3 * Math.sin(i * 7); const d = 0.55 + 0.4 * ((i * 37) % 10) / 10; return { a, d, ph: i * 0.7 }; });
    };
    L.observe(stage, size); size();
    const t0 = performance.now();
    L.raf((t) => {
      const T = (t - t0) / 1000, k = Math.min(1, T / 1.6);
      const rr = ring.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      const cx = rr.left - sr.left + rr.width / 2, cy = rr.top - sr.top + rr.height / 2, R = rr.width / 2;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const far = Math.max(W, H) * 0.75;
      for (const n of nodes) {
        const x = cx + Math.cos(n.a) * (R + n.d * far * 0.6), y = cy + Math.sin(n.a) * (R + n.d * far * 0.6);
        const reach = ctx.reduced ? 0.6 : 0.5 + 0.5 * Math.sin(T * 0.8 + n.ph);
        const ex = cx + Math.cos(n.a) * (R + 6), ey = cy + Math.sin(n.a) * (R + 6);
        const px = x + (ex - x) * reach, py = y + (ey - y) * reach;
        g.strokeStyle = 'rgba(207,230,255,.18)'; g.setLineDash([2, 6]); g.beginPath(); g.moveTo(x, y); g.lineTo(px, py); g.stroke(); g.setLineDash([]);
        g.fillStyle = 'rgba(207,230,255,.45)'; g.fillRect(x - 2, y - 2, 4, 4);
        if (reach > 0.97) { g.strokeStyle = 'rgba(255,120,100,.6)'; g.beginPath(); g.arc(ex, ey, 6, 0, 7); g.stroke(); }
      }
      // the ring seals itself on arrival
      g.lineWidth = 1.2; g.strokeStyle = '#efeae0';
      g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - Math.pow(1 - k, 3))); g.stroke();
      g.lineWidth = 1; g.strokeStyle = 'rgba(239,234,224,.18)'; g.beginPath(); g.arc(cx, cy, R + 10, 0, 7); g.stroke();
      if (pulse) { const p = (t - pulse) / 1400; if (p < 1) { g.strokeStyle = `rgba(159,224,176,${1 - p})`; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R * (1 - 0.1 * p), 0, 7); g.stroke(); } }
    });
    return () => { L.dispose(); root.replaceChildren(); };
  },
};
