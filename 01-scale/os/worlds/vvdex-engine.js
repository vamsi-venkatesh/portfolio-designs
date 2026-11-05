// VVDex Engine — "The Sorting Foundry". A paragraph goes in at the top; every sentence drops into
// one of three chutes: runs by itself, waits for a person, never happens. A toy compiler with
// readable keyword rules (shown on screen), then the result is sealed under one SHA-256 digest.
import { life, h, fonts, style, sha256, controls, reading } from './_kit.js';

const G = '#45C987';
const CSS = `
.en{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;color:#dff5e8;font-family:"JetBrains Mono",Menlo,monospace;-webkit-user-select:text;user-select:text;touch-action:pan-y;
  background:radial-gradient(#45c98714 1px,transparent 1.4px) 0 0/22px 22px,#030806}
.en-nav{position:fixed;z-index:6;top:0;bottom:0;left:0;width:64px;display:flex;flex-direction:column;align-items:stretch;gap:2px;padding:12px 6px;background:#030806ee;border-right:1px solid ${G}33}
.en-nav .kx-b{font:inherit;font-size:10px;background:transparent;color:${G};border:1px solid ${G}44;padding:9px 2px;cursor:pointer;line-height:1.2;word-break:break-word}
.en-nav .kx-b:hover,.en-nav .kx-b:focus-visible{background:${G};color:#030806;outline:none}
.en-nav .kx-pos{font:800 13px "Syne",sans-serif;color:#dff5e8;text-align:center;padding:10px 0;writing-mode:vertical-rl;transform:rotate(180deg);margin:6px auto}
.en-nav .kx-live{background:${G};color:#030806;margin-top:auto}
.en-main{position:relative;z-index:1;margin-left:64px;padding:34px 40px 60px}
.en-rain{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}
.en-top{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:40px;align-items:start}
.en-k{font-size:11px;letter-spacing:.26em;text-transform:uppercase;color:${G}}
.en-title{font:800 clamp(56px,7.4vw,118px)/.86 "Syne",sans-serif;margin:12px 0 16px;letter-spacing:-.03em}
.en-title span{color:${G}}
.en-line{font-size:14px;line-height:1.7;color:#c4e3d1;max-width:520px;margin:0}
.en-figs{display:flex;gap:28px;margin-top:22px;flex-wrap:wrap}
.en-figs b{display:block;font:800 40px "Syne",sans-serif;color:${G};line-height:1}
.en-figs span{font-size:11px;color:#9cc4ad}
.en-desk{border:1px solid ${G}55;background:#04110bcc}
.en-desk header{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid ${G}33;font-size:11px;color:#9cc4ad;letter-spacing:.12em;text-transform:uppercase}
.en-ta{display:block;width:100%;min-height:170px;resize:vertical;background:transparent;color:#effff5;border:0;padding:14px;font:13px/1.65 "JetBrains Mono",monospace;outline:none;box-sizing:border-box}
.en-ta:focus{background:#45c9870a}
.en-go{font:800 15px "Syne",sans-serif;background:${G};color:#030806;border:0;padding:10px 18px;cursor:pointer;letter-spacing:.02em}
.en-go:focus-visible{outline:2px solid #ffd2a0;outline-offset:2px}
.en-rules{font-size:11px;line-height:1.7;color:#9cc4ad;padding:10px 14px;border-top:1px solid ${G}33;margin:0}
.en-rules b{color:#effff5;font-weight:400}
.en-note{font-size:11px;color:#9cc4ad;margin:10px 0 0;line-height:1.6}
.en-chutes{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:36px;border:1px solid ${G}55;position:relative}
.en-chute{min-height:300px;padding:0 0 14px;border-right:1px solid ${G}33;position:relative;overflow:hidden}
.en-chute:last-child{border-right:0}
.en-chute h4{margin:0;padding:14px;font:800 20px/1 "Syne",sans-serif;border-bottom:1px solid ${G}33;display:flex;justify-content:space-between;align-items:baseline}
.en-chute h4{position:relative;z-index:2;background:#04110b}
.en-chute h4 small{font:400 11px "JetBrains Mono",monospace;color:#9cc4ad}
.en-chute.run h4{color:${G}}.en-chute.wait h4{color:#ffd2a0}.en-chute.never h4{color:#ff7a6b}
.en-chute.never{background:repeating-linear-gradient(135deg,#ff7a6b08 0 8px,transparent 8px 16px)}
.en-chip{margin:10px 12px 0;padding:10px 12px;font-size:12px;line-height:1.5;border-left:3px solid currentColor;background:#ffffff08;animation:enfall .7s cubic-bezier(.3,1.4,.5,1) both}
.en-chip small{display:block;font-size:10px;opacity:.75;margin-top:4px}
.en-chute.run .en-chip{color:#c9f5dc}.en-chute.wait .en-chip{color:#ffe6c7}.en-chute.never .en-chip{color:#ffd0ca;text-decoration:line-through;text-decoration-color:#ff7a6b88}
@keyframes enfall{from{transform:translateY(-220px) rotate(-3deg);opacity:0}60%{opacity:1}to{transform:none}}
.en-seal{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:14px;border:1px solid ${G}55;border-top:0;font-size:12px;background:#04110b}
.en-seal b{font-weight:400;color:${G};word-break:break-all}
.en-ghost{position:absolute;left:0;right:0;top:46px;bottom:0;pointer-events:none}
.en .kx-read{margin:60px 0 0;counter-reset:sec;max-width:1100px}
.en .kx-head{padding-bottom:18px;border-bottom:2px solid ${G}}
.en .kx-kind{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:${G};margin:0}
.en .kx-title{font:800 clamp(40px,5vw,72px)/.95 "Syne",sans-serif;margin:8px 0;letter-spacing:-.02em}
.en .kx-lede{font-size:15px;line-height:1.6;color:#c4e3d1;margin:0}
.en .kx-sec{counter-increment:sec;display:grid;grid-template-columns:220px 1fr;gap:28px;padding:26px 0;border-bottom:1px dashed ${G}33}
.en .kx-h{font:800 22px "Syne",sans-serif;margin:0;color:#effff5}
.en .kx-h:before{content:"§ " counter(sec,decimal-leading-zero) "  ";color:${G};font:400 12px "JetBrains Mono",monospace;display:block;margin-bottom:4px}
.en .kx-p,.en .kx-ul li{font-size:13.5px;line-height:1.75;margin:0 0 8px;color:#d3ecdd}
.en .kx-ul{margin:0;padding-left:0;list-style:none}.en .kx-ul li:before{content:"→ ";color:${G}}
.en .kx-blocks,.en .kx-decs,.en .kx-evals{display:grid;gap:18px}
.en .kx-bt{font:700 16px "Syne",sans-serif;margin:0 0 6px;color:#effff5}
.en .kx-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.en .kx-sn{font-size:11px;color:${G}}
.en .kx-trade{color:#9cc4ad}
.en .kx-d{font-size:11px;color:${G}}
.en .kx-nums{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.en .kx-v{display:block;font:800 42px/1 "Syne",sans-serif;color:${G}}
.en .kx-l{display:block;font-size:12px;color:#c4e3d1;margin-top:4px}
.en .kx-stack{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:6px}
.en .kx-stack li{font-size:11.5px;padding:4px 8px;border:1px solid ${G}44}
.en .kx-links{display:flex;flex-wrap:wrap;gap:8px}
.en .kx-link{font:inherit;font-size:12px;background:transparent;color:${G};border:1px solid ${G};padding:8px 12px;cursor:pointer}
.en .kx-link:hover,.en .kx-link:focus-visible{background:${G};color:#030806;outline:none}
@media (max-width:860px){
  .en-nav{top:auto;bottom:0;right:0;width:auto;height:auto;flex-direction:row;padding:6px;border-right:0;border-top:1px solid ${G}33}
  .en-nav .kx-pos{writing-mode:horizontal-tb;transform:none;margin:0 4px;padding:8px 2px}.en-nav .kx-live{margin:0 0 0 auto}.en-nav .kx-src{display:none}
  .en-nav .kx-b{padding:8px 7px;font-size:10.5px}
  .en-main{margin-left:0;padding:22px 16px 90px}.en-top{grid-template-columns:1fr;gap:22px}
  .en-chutes{grid-template-columns:1fr}.en-title{font-size:58px}.en-figs{gap:18px}.en-figs b{font-size:28px}.en-k{letter-spacing:.14em;font-size:10px}.en-chute{min-height:0;border-right:0;border-bottom:1px solid ${G}33}
  .en .kx-sec{grid-template-columns:1fr;gap:10px}.en .kx-steps,.en .kx-nums{grid-template-columns:1fr}
}`;

const SAMPLE = 'When a supplier invoice arrives by email, read the supplier and the amount. If the supplier is already known and the amount is under 500 euros, file it in the books. If the amount is 500 euros or more, wait for the owner to approve before paying. Never pay a supplier whose bank details changed in the same email. Every Friday, send the owner a summary of what was filed.';
const NEVER = /\b(never|do not|don't|must not|under no)\b/i;
const WAIT = /\b(approv\w*|wait for|ask|confirm\w*|review\w*|sign off|check with)\b/i;
const ACT = /\b(read|file|send|record|sort|tag|log|save|update|reply|notify|summari[sz]e|copy|forward|archive|create|pay|book)\b/i;

function compile(text) {
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
  return sentences.map((sn) => {
    let m;
    if ((m = sn.match(NEVER))) return { s: sn, lane: 'never', why: 'matched "' + m[0] + '"' };
    if ((m = sn.match(WAIT))) return { s: sn, lane: 'wait', why: 'matched "' + m[0] + '"' };
    if ((m = sn.match(ACT))) return { s: sn, lane: 'run', why: 'action "' + m[0] + '", no limit stated' };
    return { s: sn, lane: 'wait', why: 'no rule matched: an unknown never runs by itself' };
  });
}

export default {
  async mount(root, ctx) {
    const L = life();
    fonts(L, 'family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500');
    style(L, CSS);
    const it = ctx.item;
    const ta = h('textarea.en-ta', { attrs: { 'aria-label': 'Describe the work in one paragraph', spellcheck: 'false' } }); ta.value = SAMPLE;
    const lanes = { run: null, wait: null, never: null }, counts = {};
    const chute = (key, title) => { counts[key] = h('small', { text: '0' }); lanes[key] = h('div.en-list'); return h('div.en-chute.' + key, h('h4', h('span', { text: title }), counts[key]), lanes[key]); };
    const sealD = h('b', { text: '—' });
    const sealEl = h('div.en-seal', h('span', { text: 'seal · sha-256 of the compiled result' }), sealD);
    async function run() {
      const res = compile(ta.value);
      for (const k in lanes) { lanes[k].replaceChildren(); counts[k].textContent = '0'; }
      const c = { run: 0, wait: 0, never: 0 };
      res.forEach((r, i) => {
        const chip = h('div.en-chip', { style: { 'animation-delay': (ctx.reduced ? 0 : i * 0.16) + 's' } }, r.s, h('small', { text: r.why }));
        if (ctx.reduced) chip.style.animation = 'none';
        lanes[r.lane].append(chip); c[r.lane]++;
      });
      for (const k in c) counts[k].textContent = String(c[k]);
      const d = await sha256(JSON.stringify(res.map((r) => [r.lane, r.s])));
      sealD.textContent = d;
    }
    const [a, b] = it.stage;
    const rain = h('canvas.en-rain', { attrs: { 'aria-hidden': 'true' } });
    const box = h('div.en', rain,
      controls(L, ctx, 'en-nav'),
      h('main.en-main',
        h('div.en-top',
          h('div',
            h('div.en-k', { text: it.kind + ' · ' + it.status + ' · ' + it.host }),
            h('h2.en-title', 'VVDex', h('br'), h('span', { text: 'Engine' })),
            h('p.en-line', { text: it.line }),
            h('div.en-figs', it.stage.map(([v, l]) => h('div', h('b', { text: v }), h('span', { text: l }))))),
          h('div.en-desk',
            h('header', h('span', { text: 'one paragraph in' }), h('button.en-go', { text: 'Compile →', attrs: { type: 'button', 'data-qa': 'compile' }, on: { click: run } })),
            ta,
            h('p.en-rules', 'Toy rules, read top to bottom: ', h('b', { text: 'never / do not / must not' }), ' → never happens · ',
              h('b', { text: 'approve / wait for / ask / confirm / review' }), ' → waits for a person · ',
              h('b', { text: 'an action verb' }), ' → runs by itself · ', h('b', { text: 'nothing matched' }), ' → waits.'))),
        h('p.en-note', { text: 'A toy model of the idea, not the product. The real Engine has a model read the paragraph into typed rules that must quote the owner\'s words, and code checks each rule; this demo uses the keyword rules above, in your browser.' }),
        h('div.en-chutes', chute('run', 'Runs by itself'), chute('wait', 'Waits for you'), chute('never', 'Never happens')),
        sealEl,
        reading(ctx)));
    root.append(box);
    L.timeout(run, ctx.reduced ? 0 : 900);
    void a; void b;
    // arrival: the paragraph's own letters rain down and split into three streams
    if (!ctx.reduced) {
      const g = rain.getContext('2d'); let W = 0, H = 0, dpr = 1; const drops = [];
      const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; rain.width = W * dpr; rain.height = H * dpr; };
      size(); L.on(window, 'resize', size);
      const chars = SAMPLE.replace(/\s+/g, ''); let ci = 0; const t0 = performance.now();
      const COL = ['69,201,135', '255,210,160', '255,122,107'];
      L.raf((t) => {
        const T = (t - t0) / 1000, rate = T < 2.6 ? 7 : 0.6, left = W > 860 ? 64 : 0;
        for (let k = 0; k < rate; k++) if (Math.random() < rate - k) {
          const lane = Math.random() < 0.55 ? 0 : Math.random() < 0.7 ? 1 : 2;
          drops.push({ x: left + Math.random() * (W - left), y: -20 - Math.random() * 60, v: 3 + Math.random() * 4, lane, c: chars[ci++ % chars.length] });
        }
        g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
        g.font = '13px "JetBrains Mono",monospace';
        const fade = Math.max(0.12, 1 - box.scrollTop / 600);
        for (let i = drops.length - 1; i >= 0; i--) {
          const d = drops[i]; d.y += d.v; const tx = left + (W - left) * (0.2 + 0.3 * d.lane), k2 = Math.min(1, Math.max(0, d.y / H));
          d.x += (tx - d.x) * 0.012 * (1 + k2 * 6);
          if (d.y > H + 20) { drops.splice(i, 1); continue; }
          g.fillStyle = `rgba(${COL[d.lane]},${(0.18 + 0.3 * k2) * fade})`; g.fillText(d.c, d.x, d.y);
        }
      });
    }
    return () => { L.dispose(); root.replaceChildren(); };
  },
};
