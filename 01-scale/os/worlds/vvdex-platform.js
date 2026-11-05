// VVDex Platform — "The Containment Hall". An industrial test chamber: an agent works inside a
// sealed box (no network, one CPU, a step budget), and the result leaves as a signed receipt.
// The receipt is really signed in this tab (Ed25519, or ECDSA P-256 where the browser lacks it).
import { life, h, s, fonts, style, controls, reading } from './_kit.js';

const O = '#F2703A';
const CSS = `
.pf{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;background:#0b0907;color:#efe4d8;font-family:"IBM Plex Mono",Menlo,monospace;-webkit-user-select:text;user-select:text;touch-action:pan-y}
.pf:before{content:"";position:fixed;inset:0;pointer-events:none;background:repeating-linear-gradient(90deg,#ffffff05 0 1px,transparent 1px 80px),repeating-linear-gradient(0deg,#ffffff05 0 1px,transparent 1px 80px)}
.pf-nav{position:fixed;z-index:6;left:0;right:0;bottom:0;display:flex;gap:0;align-items:stretch;flex-wrap:wrap;background:${O};color:#140a04}
.pf-nav .kx-b{font:600 12px "IBM Plex Mono",monospace;letter-spacing:.06em;text-transform:uppercase;background:transparent;color:#140a04;border:0;border-right:1px solid #140a0444;padding:13px 16px;cursor:pointer}
.pf-nav .kx-b:hover,.pf-nav .kx-b:focus-visible{background:#140a04;color:${O};outline:none}
.pf-nav .kx-pos{font:800 20px "Big Shoulders Display",sans-serif;padding:8px 16px;border-right:1px solid #140a0444;display:flex;align-items:center}
.pf-nav .kx-live{margin-left:auto;border-left:1px solid #140a0444;background:#140a04;color:${O}}
.pf-nav .kx-live:hover{background:#efe4d8;color:#140a04}
.pf-top{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);min-height:100%;}
.pf-hall{position:relative;border-right:1px solid ${O}55;padding:28px 32px 90px;display:flex;flex-direction:column}
.pf-k{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:${O}}
.pf-title{font:800 clamp(64px,9.5vw,150px)/.82 "Big Shoulders Display",sans-serif;text-transform:uppercase;margin:14px 0 0;letter-spacing:-.01em}
.pf-title span{display:block;color:transparent;-webkit-text-stroke:1.5px ${O}}
.pf-line{font-size:14px;line-height:1.7;max-width:560px;color:#d9cbbb;margin:18px 0 0}
.pf-box{position:relative;flex:1;min-height:300px;margin-top:22px;border:1px solid ${O}66}
.pf-box canvas{position:absolute;inset:0;width:100%;height:100%}
.pf-gauges{position:absolute;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid ${O}66;background:#0b0907e6}
.pf-g{padding:10px 14px;border-right:1px solid ${O}33}
.pf-g:last-child{border-right:0}
.pf-g small{display:block;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#a8988a}
.pf-g b{font:700 26px "Big Shoulders Display",sans-serif;color:${O}}
.pf-g b.ok{color:#efe4d8}
.pf-cap{position:absolute;left:14px;top:12px;font-size:11px;letter-spacing:.14em;color:#a8988a;text-transform:uppercase}
.pf-side{padding:28px 32px 90px;display:flex;flex-direction:column;gap:18px}
.pf-figs{display:flex;gap:0;border:1px solid ${O}55}
.pf-figs div{flex:1;padding:12px 14px;border-right:1px solid ${O}33}
.pf-figs div:last-child{border-right:0}
.pf-figs b{display:block;font:800 44px/1 "Big Shoulders Display",sans-serif;color:${O}}
.pf-figs span{font-size:11px;color:#bba996}
.pf-rc{background:#f3ece0;color:#1a120c;padding:22px 22px 18px;position:relative;box-shadow:0 30px 60px #0008;
  -webkit-mask:radial-gradient(circle 6px at 50% 0,#0000 98%,#000) 0 0/14px 100% repeat-x;mask:radial-gradient(circle 6px at 50% 0,#0000 98%,#000) 0 0/14px 100% repeat-x;padding-top:26px}
.pf-rc h4{font:800 22px "Big Shoulders Display",sans-serif;text-transform:uppercase;margin:0 0 2px;letter-spacing:.02em}
.pf-rc .pf-sm{font-size:10.5px;color:#6d5d50;line-height:1.5;margin:0 0 12px}
.pf-f{display:grid;grid-template-columns:120px 1fr;align-items:center;border-top:1px dashed #1a120c33;font-size:12.5px}
.pf-f label{color:#6d5d50;padding:6px 0}
.pf-f input{font:inherit;border:0;background:transparent;color:#1a120c;padding:6px 4px;width:100%;outline:none}
.pf-f input:focus{background:#F2703A22}
.pf-sig{font-size:10.5px;word-break:break-all;color:#6d5d50;border-top:2px solid #1a120c;margin-top:8px;padding-top:8px}
.pf-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.pf-btn{font:600 12px "IBM Plex Mono",monospace;text-transform:uppercase;letter-spacing:.05em;border:1.5px solid #1a120c;background:transparent;color:#1a120c;padding:9px 12px;cursor:pointer}
.pf-btn:hover,.pf-btn:focus-visible{background:#1a120c;color:#f3ece0;outline:none}
.pf-btn.hot{background:${O};border-color:${O};color:#140a04}
.pf-ver{font:800 26px "Big Shoulders Display",sans-serif;text-transform:uppercase;padding:10px 12px;margin-top:12px;border:2px solid #1a120c;display:flex;justify-content:space-between;gap:8px;align-items:center}
.pf-ver small{font:400 11px "IBM Plex Mono",monospace;text-transform:none;text-align:right}
.pf-ver.good{background:#1a120c;color:#9fe0b0}.pf-ver.bad{background:#b3261e;color:#fff;border-color:#b3261e}
.pf-stamp{position:absolute;right:16px;top:20px;font:800 18px "Big Shoulders Display",sans-serif;color:#b3261e;border:2px solid #b3261e;padding:2px 8px;transform:rotate(8deg);opacity:.85}
.pf .kx-read{max-width:1240px;margin:0 auto;padding:40px 32px 120px;display:grid;grid-template-columns:repeat(12,1fr);gap:0 24px}
.pf .kx-head{grid-column:1/-1;border-top:6px solid ${O};padding-top:20px;margin-bottom:10px}
.pf .kx-kind{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${O};margin:0}
.pf .kx-title{font:800 clamp(48px,7vw,96px)/.9 "Big Shoulders Display",sans-serif;text-transform:uppercase;margin:10px 0}
.pf .kx-lede{font-size:16px;line-height:1.6;max-width:760px;color:#d9cbbb;margin:0}
.pf .kx-sec{grid-column:1/-1;display:grid;grid-template-columns:3fr 9fr;gap:24px;border-top:1px solid ${O}44;padding:24px 0}
.pf .kx-h{font:800 28px/1 "Big Shoulders Display",sans-serif;text-transform:uppercase;color:${O};margin:0;position:sticky;top:12px;align-self:start}
.pf .kx-p,.pf .kx-ul li{font-size:13.5px;line-height:1.75;color:#e6d9cb;margin:0 0 8px}
.pf .kx-ul{margin:0;padding-left:18px}
.pf .kx-nums{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));border:1px solid ${O}44}
.pf .kx-num{padding:14px;border-right:1px solid ${O}22}
.pf .kx-v{display:block;font:800 46px/1 "Big Shoulders Display",sans-serif;color:${O}}
.pf .kx-l{display:block;font-size:12px;color:#d9cbbb;margin-top:6px}
.pf .kx-d{font-size:10.5px;color:#a8988a;letter-spacing:.1em}
.pf .kx-blocks,.pf .kx-decs,.pf .kx-evals{display:grid;gap:14px}
.pf .kx-block,.pf .kx-dec,.pf .kx-eval{border-left:3px solid ${O};padding:4px 0 4px 16px}
.pf .kx-bt{font:700 22px "Big Shoulders Display",sans-serif;margin:0 0 6px;text-transform:uppercase;letter-spacing:.01em}
.pf .kx-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.pf .kx-step{border:1px solid ${O}44;padding:12px}
.pf .kx-sn{font:800 30px "Big Shoulders Display",sans-serif;color:${O}}
.pf .kx-trade{color:#bba996}
.pf .kx-stack{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:6px}
.pf .kx-stack li{font-size:12px;border:1px solid #efe4d833;padding:4px 8px}
.pf .kx-links{display:flex;flex-wrap:wrap;gap:8px}
.pf .kx-link{font:600 12px "IBM Plex Mono",monospace;background:transparent;color:${O};border:1px solid ${O};padding:8px 12px;cursor:pointer;text-align:left}
.pf .kx-link:hover,.pf .kx-link:focus-visible{background:${O};color:#140a04;outline:none}
.pf .kx-wd{border:2px solid #b3261e;padding:16px}
@media (max-width:860px){
  .pf-top{grid-template-columns:1fr}.pf-hall{border-right:0;padding:20px 16px 10px}.pf-side{padding:10px 16px 100px}
  .pf-box{min-height:260px;flex:none;height:300px}.pf-f{grid-template-columns:96px 1fr}
  .pf .kx-read{padding:30px 16px 120px}.pf .kx-sec{grid-template-columns:1fr;gap:10px}.pf .kx-h{position:static}
  .pf .kx-steps{grid-template-columns:1fr}.pf-nav .kx-src{display:none}.pf-nav .kx-b{padding:12px 10px;font-size:11px}.pf-nav .kx-pos{padding:8px 10px;font-size:17px}
}`;

const canon = (v) => Array.isArray(v) ? '[' + v.map(canon).join(',') + ']'
  : v && typeof v === 'object' ? '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}' : JSON.stringify(v);
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));

async function makeSigner() {
  try {
    const kp = await crypto.subtle.generateKey({ name: 'Ed25519' }, false, ['sign', 'verify']);
    return { alg: 'Ed25519', sign: (d) => crypto.subtle.sign('Ed25519', kp.privateKey, d), verify: (sig, d) => crypto.subtle.verify('Ed25519', kp.publicKey, sig, d) };
  } catch (e) {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
    const p = { name: 'ECDSA', hash: 'SHA-256' };
    return { alg: 'ECDSA P-256 (this browser has no Ed25519; the platform itself signs with Ed25519)', sign: (d) => crypto.subtle.sign(p, kp.privateKey, d), verify: (sig, d) => crypto.subtle.verify(p, kp.publicKey, sig, d) };
  }
}

export default {
  async mount(root, ctx) {
    const L = life();
    fonts(L, 'family=Big+Shoulders+Display:wght@600;700;800&family=IBM+Plex+Mono:wght@400;600');
    style(L, CSS);
    const it = ctx.item;
    const cv = h('canvas');
    const gNet = h('b', { text: 'NONE' }), gCpu = h('b.ok', { text: '1' }), gStep = h('b.ok', { text: '40' });
    const FIELDS = [['exam', 'sample-exam'], ['model', 'your-model'], ['attempts', '10'], ['passed', '6'], ['score', '0.60'], ['graded_by', 'hidden tests']];
    const inputs = {};
    const rows = FIELDS.map(([k, v]) => { const inp = h('input', { attrs: { value: v, 'aria-label': k, spellcheck: 'false', 'data-qa': 'f-' + k } }); inp.value = v; inputs[k] = inp; return h('div.pf-f', h('label', { text: k }), inp); });
    const sigEl = h('div.pf-sig', { text: 'signing…' });
    const ver = h('div.pf-ver', { attrs: { role: 'status', 'aria-live': 'polite' } }, 'unchecked', h('small', { text: '' }));
    const stamp = h('div.pf-stamp', { text: 'SAMPLE' });
    const read = () => { const o = {}; for (const [k] of FIELDS) o[k] = /^(attempts|passed)$/.test(k) ? Number(inputs[k].value) : inputs[k].value; return o; };
    let signer, sig = null, signedBytes = '';
    const setVer = (cls, big, small) => { ver.className = 'pf-ver ' + cls; ver.replaceChildren(big, h('small', { text: small })); };
    async function sign() { signedBytes = canon(read()); sig = await signer.sign(new TextEncoder().encode(signedBytes)); sigEl.textContent = 'sig · ' + signer.alg.split(' (')[0] + ' · ' + b64(sig); setVer('', 'signed', 'now change any field and verify'); }
    async function verify() {
      const bytes = canon(read()); const ok = await signer.verify(sig, new TextEncoder().encode(bytes));
      if (ok) setVer('good', '✓ authentic', 'the signature matches these exact bytes');
      else setVer('bad', '✕ fails', 'one changed value, and the signature no longer matches');
    }
    const [n1, n2] = it.stage;
    const box = h('div.pf',
      h('div.pf-top',
        h('section.pf-hall',
          h('div.pf-k', { text: it.kind + ' · ' + it.status + ' · ' + it.host }),
          h('h2.pf-title', 'VVDex', h('span', { text: 'Platform' })),
          h('p.pf-line', { text: it.line }),
          h('div.pf-box', cv, h('div.pf-cap', { text: 'sandbox · one attempt · illustration' }),
            h('div.pf-gauges', h('div.pf-g', h('small', { text: 'network' }), gNet), h('div.pf-g', h('small', { text: 'cpu' }), gCpu), h('div.pf-g', h('small', { text: 'steps left' }), gStep)))),
        h('section.pf-side',
          h('div.pf-figs', it.stage.map(([v, l]) => h('div', h('b', { text: v }), h('span', { text: l })))),
          h('div.pf-rc', stamp,
            h('h4', { text: 'Receipt' }),
            h('p.pf-sm', { text: 'A working model of the idea, not a real run: these values are illustrative. The receipt is canonical JSON (keys sorted), signed in this tab with a key generated now. Edit any value, then verify.' }),
            rows, sigEl, ver,
            h('div.pf-acts',
              h('button.pf-btn.hot', { text: 'Verify', attrs: { type: 'button', 'data-qa': 'verify' }, on: { click: verify } }),
              h('button.pf-btn', { text: 'Change the score', attrs: { type: 'button', 'data-qa': 'tamper' }, on: { click: () => { inputs.score.value = '0.90'; inputs.passed.value = '9'; setVer('', 'edited', 'score 0.60 → 0.90, not yet verified'); } } }),
              h('button.pf-btn', { text: 'Re-sign', attrs: { type: 'button', 'data-qa': 'sign' }, on: { click: sign } })))),
      ),
      reading(ctx, { withdrawn: [1] }),
      controls(L, ctx, 'pf-nav'));
    root.append(box);
    signer = await makeSigner();
    await sign();

    // --- the chamber: an agent dot spends its step budget inside walls it cannot cross
    const g = cv.getContext('2d'); let W = 0, H = 0, dpr = 1;
    const size = () => { const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; };
    L.observe(cv, size); size();
    let ag = { x: 0.5, y: 0.45, tx: 0.5, ty: 0.45 }, steps = 40, sparks = [], lastStep = 0, ended = 0, trail = [];
    const t0 = performance.now();
    L.raf((t) => {
      const T = (t - t0) / 1000, close = Math.min(1, T / 1.4), ke = 1 - Math.pow(1 - close, 4);
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const bw = Math.min(W * 0.62, H * 0.95), bh = Math.min(H * 0.56, bw * 0.75), cx = W / 2, cy = H * 0.44;
      const x0 = cx - bw / 2, y0 = cy - bh / 2;
      // bulkheads close in on arrival
      g.fillStyle = '#140d08';
      const gap = (1 - ke) * W * 0.5;
      g.fillRect(0, 0, Math.max(0, x0 - gap), H); g.fillRect(x0 + bw + gap, 0, Math.max(0, W - (x0 + bw + gap)), H);
      g.strokeStyle = O; g.lineWidth = 2; g.strokeRect(x0 - (1 - ke) * 80, y0, bw + (1 - ke) * 160, bh);
      // hatch inside walls
      g.save(); g.beginPath(); g.rect(x0, y0, bw, bh); g.clip(); g.strokeStyle = '#F2703A18'; g.lineWidth = 1;
      for (let i = -bh; i < bw; i += 14) { g.beginPath(); g.moveTo(x0 + i, y0 + bh); g.lineTo(x0 + i + bh, y0); g.stroke(); }
      g.restore();
      // the cut network line
      g.strokeStyle = '#a8988a'; g.setLineDash([4, 5]); g.beginPath(); g.moveTo(x0 + bw, cy); g.lineTo(x0 + bw + Math.min(70, (W - x0 - bw) * 0.7), cy); g.stroke(); g.setLineDash([]);
      const nx = x0 + bw + Math.min(36, (W - x0 - bw) * 0.35);
      g.strokeStyle = '#ff5a45'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(nx - 7, cy - 7); g.lineTo(nx + 7, cy + 7); g.moveTo(nx + 7, cy - 7); g.lineTo(nx - 7, cy + 7); g.stroke();
      // hidden-test box outside, unreachable
      const gx = cx - 46, gy = y0 + bh + 18;
      if (gy + 30 < H - 60) { g.strokeStyle = '#efe4d855'; g.lineWidth = 1; g.strokeRect(gx, gy, 92, 26); g.fillStyle = '#a8988a'; g.font = '10px "IBM Plex Mono",monospace'; g.textAlign = 'center'; g.fillText('hidden tests', cx, gy + 17); }
      if (close >= 1) {
        if (!ctx.reduced && t - lastStep > 160 && !ended) {
          lastStep = t; steps--;
          ag.tx = ag.x + (Math.random() - 0.5) * 0.5; ag.ty = ag.y + (Math.random() - 0.5) * 0.5;
          if (ag.tx < 0.06 || ag.tx > 0.94 || ag.ty < 0.08 || ag.ty > 0.92) { sparks.push({ x: Math.min(0.97, Math.max(0.03, ag.tx)), y: Math.min(0.95, Math.max(0.05, ag.ty)), a: 1 }); }
          ag.tx = Math.min(0.94, Math.max(0.06, ag.tx)); ag.ty = Math.min(0.92, Math.max(0.08, ag.ty));
          if (steps <= 0) { ended = t; }
          gStep.textContent = String(Math.max(0, steps)); gStep.className = steps < 8 ? '' : 'ok';
        }
        if (ended && t - ended > 1800) { ended = 0; steps = 40; trail = []; }
        ag.x += (ag.tx - ag.x) * 0.18; ag.y += (ag.ty - ag.y) * 0.18;
        trail.push([ag.x, ag.y]); if (trail.length > 60) trail.shift();
        g.strokeStyle = '#efe4d855'; g.lineWidth = 1; g.beginPath();
        trail.forEach(([x, y], i) => { const X = x0 + x * bw, Y = y0 + y * bh; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.stroke();
        g.fillStyle = '#efe4d8'; g.beginPath(); g.arc(x0 + ag.x * bw, y0 + ag.y * bh, 5, 0, 7); g.fill();
        sparks = sparks.filter((sp) => (sp.a -= 0.04) > 0);
        for (const sp of sparks) { g.strokeStyle = `rgba(242,112,58,${sp.a})`; g.beginPath(); g.arc(x0 + sp.x * bw, y0 + sp.y * bh, 14 * (1.4 - sp.a), 0, 7); g.stroke(); }
        if (ended) { g.fillStyle = '#F2703A'; g.font = '700 16px "Big Shoulders Display",sans-serif'; g.textAlign = 'center'; g.fillText('STEP BUDGET SPENT · SUBMISSION GOES TO GRADING', cx, y0 - 10); }
      }
    });
    return () => { L.dispose(); root.replaceChildren(); };
  },
};
