// VVDex Trading — "The Engraved Ledger". A bond certificate from 2126: guilloché rosette, every
// dated call chained to the last by SHA-256. Edit a past row and every later link breaks.
import { life, h, fonts, style, sha256, controls, reading, short } from './_kit.js';

const CSS = `
.tr{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;background:#03070a;color:#d7efe4;font-family:"Azeret Mono",Menlo,monospace;
  -webkit-user-select:text;user-select:text;touch-action:pan-y;scroll-behavior:smooth}
.tr canvas.tr-ros{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;opacity:.9}
.tr-wrap{position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:96px 28px 120px}
.tr-cert{border:1px solid #63d2a355;outline:1px solid #63d2a322;outline-offset:6px;padding:40px 44px;background:radial-gradient(120% 90% at 50% 0%,#0a1a14ee,#03070aee);position:relative}
.tr-cert:before,.tr-cert:after{content:"";position:absolute;width:26px;height:26px;border:1px solid #63d2a3;}
.tr-cert:before{left:-8px;top:-8px;border-right:0;border-bottom:0}.tr-cert:after{right:-8px;bottom:-8px;border-left:0;border-top:0}
.tr-eyebrow{font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#63d2a3}
.tr-name{font-family:"Bodoni Moda",Didot,serif;font-weight:400;font-size:clamp(48px,8vw,112px);line-height:.92;margin:14px 0 10px;letter-spacing:-.01em;color:#f0fff8}
.tr-name i{color:#63d2a3}
.tr-line{font-family:"Bodoni Moda",serif;font-style:italic;font-size:clamp(18px,2.1vw,26px);max-width:760px;color:#cfe6dc;margin:0}
.tr-figs{display:flex;gap:48px;flex-wrap:wrap;margin-top:34px;border-top:1px solid #63d2a333;padding-top:22px}
.tr-fig b{display:block;font-family:"Bodoni Moda",serif;font-weight:500;font-size:clamp(40px,5vw,64px);color:#63d2a3;line-height:1}
.tr-fig span{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#9fc4b4}
.tr-paper{display:inline-block;margin-top:20px;font-size:11px;letter-spacing:.24em;padding:6px 10px;border:1px solid #ffd2a0;color:#ffd2a0;transform:rotate(-2deg)}
.tr-ledger{margin-top:64px}
.tr-lh{display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap;margin-bottom:18px}
.tr-lh h3{font-family:"Bodoni Moda",serif;font-weight:400;font-size:clamp(28px,3.4vw,44px);margin:0;color:#f0fff8}
.tr-note{font-size:12px;line-height:1.6;color:#9fc4b4;max-width:560px;margin:6px 0 0}
.tr-status{font-size:12px;letter-spacing:.14em;text-transform:uppercase;padding:10px 14px;border:1px solid #63d2a3;color:#63d2a3;min-width:230px;text-align:center}
.tr-status.bad{border-color:#ff6b5a;color:#ff8b7c;background:#2a0b08}
.tr-rows{list-style:none;margin:0;padding:0}
.tr-row{display:grid;grid-template-columns:44px 72px 1fr 1fr;gap:14px;align-items:center;padding:12px 0;position:relative;border-bottom:1px dashed #63d2a322;transition:background .4s}
.tr-row:before{content:"";position:absolute;left:21px;top:-14px;height:16px;border-left:2px solid #63d2a3;transition:border-color .3s}
.tr-row:first-child:before{display:none}
.tr-row.bad{background:linear-gradient(90deg,#3a0d0866,transparent)}
.tr-row.bad:before{border-left:2px dashed #ff6b5a}
.tr-row.src{background:linear-gradient(90deg,#ffd2a022,transparent)}
.tr-n{width:44px;height:44px;border-radius:50%;border:1px solid #63d2a3;display:grid;place-items:center;font-size:12px;color:#63d2a3;background:#03070a}
.tr-row.bad .tr-n{border-color:#ff6b5a;color:#ff8b7c}
.tr-day{font-size:11px;color:#9fc4b4;letter-spacing:.1em}
.tr-in{width:100%;background:transparent;border:0;border-bottom:1px solid #63d2a344;color:#f0fff8;font:inherit;font-size:13px;padding:6px 2px;outline:none}
.tr-in:focus{border-bottom-color:#ffd2a0;background:#ffd2a00d}
.tr-hash{font-size:11px;line-height:1.55;color:#9fc4b4;word-break:break-all}
.tr-hash b{color:#63d2a3;font-weight:400}
.tr-row.bad .tr-hash b{color:#ff8b7c;text-decoration:line-through}
.tr-hash .now{color:#ffd2a0;display:block}
.tr-act{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}
.tr-btn,.tr .kx-b,.tr .kx-link{font:inherit;font-size:12px;letter-spacing:.08em;background:transparent;color:#63d2a3;border:1px solid #63d2a3;padding:9px 14px;cursor:pointer}
.tr-btn:hover,.tr .kx-b:hover,.tr .kx-link:hover,.tr-btn:focus-visible,.tr .kx-b:focus-visible,.tr .kx-link:focus-visible{background:#63d2a3;color:#03070a;outline:none}
.tr-nav{position:fixed;z-index:5;left:0;right:0;top:0;display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:12px 18px;background:linear-gradient(#03070af2,#03070acc 70%,transparent)}
.tr-nav .kx-pos{font-family:"Bodoni Moda",serif;font-size:20px;color:#f0fff8;margin:0 6px}
.tr-nav .kx-live{margin-left:auto;background:#63d2a3;color:#03070a}
.tr .kx-read{margin-top:80px;column-gap:56px}
.tr .kx-head{border-top:3px double #63d2a366;padding-top:26px}
.tr .kx-kind{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#63d2a3;margin:0}
.tr .kx-title{font-family:"Bodoni Moda",serif;font-weight:400;font-size:40px;margin:8px 0}
.tr .kx-lede{font-family:"Bodoni Moda",serif;font-style:italic;font-size:20px;color:#cfe6dc;margin:0 0 20px}
.tr .kx-sec{display:grid;grid-template-columns:200px 1fr;gap:24px;padding:26px 0;border-top:1px solid #63d2a322}
.tr .kx-h{font-family:"Bodoni Moda",serif;font-weight:400;font-style:italic;font-size:22px;color:#63d2a3;margin:0}
.tr .kx-p,.tr .kx-ul li{font-size:14px;line-height:1.75;color:#d7efe4;margin:0 0 8px}
.tr .kx-ul{margin:0;padding-left:18px}
.tr .kx-nums{display:flex;flex-wrap:wrap;gap:34px}
.tr .kx-v{display:block;font-family:"Bodoni Moda",serif;font-weight:500;font-size:44px;color:#f0fff8}
.tr .kx-l{font-size:12px;color:#9fc4b4}
.tr .kx-wd{border:1px solid #ffd2a055;padding:20px}
.tr .kx-wd .kx-v{color:#ffd2a0}
.tr .kx-bt{font-family:"Bodoni Moda",serif;font-weight:500;font-size:20px;margin:0 0 8px;color:#f0fff8}
.tr .kx-links{display:flex;gap:10px;flex-wrap:wrap}
@media (max-width:720px){
  .tr-wrap{padding:76px 16px 90px}.tr-cert{padding:26px 20px}
  .tr-row{grid-template-columns:36px 1fr;gap:8px 12px}.tr-n{width:36px;height:36px}.tr-row:before{left:17px}
  .tr-day{grid-column:2}.tr-in,.tr-hash{grid-column:1/-1}
  .tr .kx-sec{grid-template-columns:1fr;gap:10px}.tr-nav{padding:10px 12px;gap:6px}.tr-nav .kx-src{display:none}
  .tr-nav .kx-live{margin-left:0}.tr-nav{gap:4px;flex-wrap:nowrap}.tr-nav .kx-b{font-size:10px;padding:7px 6px;letter-spacing:0;white-space:nowrap}.tr-nav .kx-pos{font-size:14px;margin:0 2px;white-space:nowrap}.tr-eyebrow{letter-spacing:.16em;font-size:10px}
}`;

const CALLS = [
  'Sample call A · direction up · threshold declared before',
  'Sample call B · direction down · threshold declared before',
  'Sample call C · no call: below declared threshold',
  'Sample call D · direction up · threshold declared before',
  'Sample call E · direction down · threshold declared before',
  'Sample call F · direction up · threshold declared before',
  'Sample call G · no call: below declared threshold',
  'Sample call H · direction down · threshold declared before',
];
const GENESIS = '0'.repeat(64);
const rowText = (i, prev, text) => prev + '|' + (i + 1) + '|day ' + (i + 1) + '|' + text;

export default {
  async mount(root, ctx) {
    const L = life();
    fonts(L, 'family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Azeret+Mono:wght@300;400');
    style(L, CSS);
    const it = ctx.item;
    const box = h('div.tr');
    const cv = h('canvas.tr-ros', { attrs: { 'aria-hidden': 'true' } });
    const status = h('div.tr-status', { text: 'computing chain…', attrs: { role: 'status', 'aria-live': 'polite' } });
    const rows = h('ol.tr-rows');
    const [nv, nl] = it.numbers[0], [cv0, cl] = it.numbers[1];
    const wrap = h('div.tr-wrap',
      h('section.tr-cert',
        h('div.tr-eyebrow', { text: it.kind + ' · ' + it.status + ' · ' + it.host }),
        h('h2.tr-name', 'VVDex ', h('i', { text: 'Trading' })),
        h('p.tr-line', { text: it.line }),
        h('div.tr-figs', h('div.tr-fig', h('b', { text: nv }), h('span', { text: nl })), h('div.tr-fig', h('b', { text: cv0 }), h('span', { text: cl }))),
        h('div.tr-paper', { text: 'PAPER ONLY · NO CAPITAL' })),
      h('section.tr-ledger',
        h('div.tr-lh',
          h('div', h('h3', { text: 'Rewrite history. Watch it break.' }),
            h('p.tr-note', { text: 'A working model of the idea, not the record: eight sample rows chained with real SHA-256 in this tab. Each row is hashed together with the hash before it, so editing any past call changes every link after it and no longer matches the hashes already published. The real record holds ' + nv + ' ' + nl + '.' })),
          status),
        rows,
        h('div.tr-act',
          h('button.tr-btn', { text: 'Tamper with day 3', attrs: { type: 'button', 'data-qa': 'tamper' }, on: { click: () => { inputs[2].value = 'Sample call C · direction up · (rewritten after the fact)'; recompute(2); } } }),
          h('button.tr-btn', { text: 'Restore the record', attrs: { type: 'button', 'data-qa': 'restore' }, on: { click: () => { inputs.forEach((x, i) => { x.value = CALLS[i]; }); recompute(-1); } } }))),
      reading(ctx, { withdrawn: [0], labels: { problem: 'The problem', plan: 'The plan', built: 'What exists', checks: 'Rules it keeps' } }));
    box.append(cv, controls(L, ctx, 'tr-nav'), wrap);
    root.append(box);

    // --- the chain
    const sealed = []; let prev = GENESIS;
    for (let i = 0; i < CALLS.length; i++) { const hx = await sha256(rowText(i, prev, CALLS[i])); sealed.push({ prev, hash: hx }); prev = hx; }
    const inputs = [], hashEls = [], rowEls = [];
    CALLS.forEach((c, i) => {
      const inp = h('input.tr-in', { attrs: { value: c, 'aria-label': 'Call on day ' + (i + 1), spellcheck: 'false' } });
      inp.value = c;
      const hs = h('div.tr-hash');
      const r = h('li.tr-row', h('div.tr-n', { text: String(i + 1).padStart(2, '0') }), h('div.tr-day', { text: 'DAY ' + (i + 1) }), inp, hs);
      L.on(inp, 'input', () => recompute(i));
      inputs.push(inp); hashEls.push(hs); rowEls.push(r); rows.append(r);
    });
    let seq = 0;
    async function recompute(src) {
      const my = ++seq; let p = GENESIS, broken = 0, first = -1; const res = [];
      for (let i = 0; i < CALLS.length; i++) { const hx = await sha256(rowText(i, p, inputs[i].value)); res.push(hx); p = hx; }
      if (my !== seq) return;
      res.forEach((hx, i) => {
        const bad = hx !== sealed[i].hash; if (bad) { broken++; if (first < 0) first = i; }
        rowEls[i].classList.toggle('bad', bad); rowEls[i].classList.toggle('src', i === src && bad);
        hashEls[i].replaceChildren(h('span', 'sealed ', h('b', { text: short(sealed[i].hash, 16) })));
        if (bad) hashEls[i].append(h('span.now', { text: 'now    ' + short(hx, 16) }));
      });
      status.classList.toggle('bad', broken > 0);
      status.textContent = broken ? broken + ' of 8 links broken from day ' + (first + 1) : 'chain intact · 8 of 8 links verify';
    }
    await recompute(-1);

    // --- guilloché rosette (engraving), arrival draws it in, then it breathes
    const g = cv.getContext('2d'); let W = 0, H = 0, dpr = 1;
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; };
    size(); L.on(window, 'resize', size);
    const t0 = performance.now();
    const draw = (t) => {
      const e = Math.min(1, (t - t0) / 1800), k = 1 - Math.pow(1 - e, 3), T = ctx.reduced ? 0 : (t - t0) / 1000;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const cx = W * (W < 720 ? 0.5 : 0.78), cy = H * 0.42, R = Math.min(W, H) * (W < 720 ? 0.46 : 0.42);
      const fade = Math.max(0.18, 1 - box.scrollTop / (H * 1.2));
      for (let ring = 0; ring < 3; ring++) {
        g.beginPath(); const n = 900, lobes = 18 + ring * 6, rr = R * (1 - ring * 0.22);
        for (let i = 0; i <= n * k; i++) {
          const a = (i / n) * Math.PI * 2;
          const r = rr * (0.78 + 0.12 * Math.sin(lobes * a + T * 0.25 * (ring % 2 ? 1 : -1)) + 0.06 * Math.sin((lobes + 1) * 3 * a - T * 0.2));
          const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
          i ? g.lineTo(x, y) : g.moveTo(x, y);
        }
        g.strokeStyle = `rgba(99,210,163,${(0.34 - ring * 0.08) * fade})`; g.lineWidth = 0.8; g.stroke();
      }
      if (ctx.reduced && e >= 1) stop();
    };
    const stop = L.raf(draw);
    return () => { L.dispose(); root.replaceChildren(); };
  },
};
