// PitchRadar — "The Night Radar". An amber sweep over a dark field; placeholder events surface as
// blips, and their distance from the centre IS their rank. Move a rule's weight and the field
// re-orders. The score is a sum you can read on screen: no model in the score.
import { life, h, fonts, style, controls, reading, clamp } from './_kit.js';

const A = '#F49A4B';
const CSS = `
.pr{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;background:#07080a;color:#f6e3cf;font-family:"Share Tech Mono",Menlo,monospace;-webkit-user-select:text;user-select:text;touch-action:pan-y}
.pr-nav{position:fixed;z-index:6;left:50%;bottom:14px;transform:translateX(-50%);display:flex;align-items:center;gap:0;border:1px solid ${A}88;background:#07080af0;clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%);padding:0 10px;max-width:calc(100vw - 16px)}
.pr-nav .kx-b{font:600 13px "Chakra Petch",sans-serif;letter-spacing:.06em;text-transform:uppercase;background:none;border:0;color:${A};padding:11px 12px;cursor:pointer;white-space:nowrap}
.pr-nav .kx-b:hover,.pr-nav .kx-b:focus-visible{background:${A};color:#07080a;outline:none}
.pr-nav .kx-pos{font:700 15px "Chakra Petch",sans-serif;color:#f6e3cf;padding:0 10px;white-space:nowrap}
.pr-top{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:20px;min-height:100%;padding:28px 34px 80px;box-sizing:border-box;align-items:center}
.pr-scope{position:relative;aspect-ratio:1;width:min(100%,82vh);margin:0 auto}
.pr-scope canvas{position:absolute;inset:0;width:100%;height:100%}
.pr-k{font:600 12px "Chakra Petch",sans-serif;letter-spacing:.24em;text-transform:uppercase;color:${A}}
.pr-title{font:700 clamp(54px,6.4vw,96px)/.9 "Chakra Petch",sans-serif;margin:8px 0 10px;text-transform:uppercase;letter-spacing:-.01em}
.pr-title span{color:${A}}
.pr-line{font-size:14px;line-height:1.6;color:#e0cbb4;margin:0 0 6px;max-width:560px}
.pr-priv{display:inline-block;font:600 11px "Chakra Petch",sans-serif;letter-spacing:.16em;text-transform:uppercase;border:1px dashed ${A};color:${A};padding:4px 8px;margin:6px 0 14px}
.pr-rules{display:grid;gap:8px;margin:8px 0 12px}
.pr-rule{display:grid;grid-template-columns:150px 1fr 54px;gap:12px;align-items:center;font-size:12.5px}
.pr-rule input{width:100%;accent-color:${A}}
.pr-rule output{color:${A};text-align:right}
.pr-list{list-style:none;margin:0;padding:0;position:relative}
.pr-ev{display:grid;grid-template-columns:28px 1fr auto;gap:10px;align-items:center;padding:7px 10px;border-bottom:1px solid ${A}22;font-size:13px;transition:transform .55s cubic-bezier(.3,1.3,.5,1),background .3s;background:#07080a}
.pr-ev b{font:700 16px "Chakra Petch",sans-serif;color:${A}}
.pr-ev small{display:block;color:#a8937c;font-size:11px}
.pr-ev .sc{font:700 15px "Chakra Petch",sans-serif}
.pr-ev.top{background:linear-gradient(90deg,#f49a4b22,transparent)}
.pr-formula{font-size:11.5px;color:#a8937c;line-height:1.6;margin:10px 0 0}
.pr-figs{display:flex;gap:26px;margin-top:12px}
.pr-figs b{display:block;font:700 40px/1 "Chakra Petch",sans-serif;color:${A}}
.pr-figs span{font-size:11.5px;color:#a8937c}
.pr .kx-read{max-width:1160px;margin:0 auto;padding:20px 34px 120px;display:grid;grid-template-columns:1fr 1fr;gap:0 40px}
.pr .kx-head{grid-column:1/-1;border-top:1px solid ${A};padding-top:22px;margin-bottom:10px}
.pr .kx-kind{font:600 12px "Chakra Petch",sans-serif;letter-spacing:.2em;text-transform:uppercase;color:${A};margin:0}
.pr .kx-title{font:700 52px "Chakra Petch",sans-serif;text-transform:uppercase;margin:6px 0}
.pr .kx-lede{font-size:15px;line-height:1.6;color:#e0cbb4;margin:0}
.pr .kx-sec{padding:20px 0;border-top:1px dashed ${A}33}
.pr .kx-h{font:700 15px "Chakra Petch",sans-serif;letter-spacing:.2em;text-transform:uppercase;color:${A};margin:0 0 10px}
.pr .kx-h:before{content:"◉ "}
.pr .kx-p,.pr .kx-ul li{font-size:14px;line-height:1.7;margin:0 0 8px;color:#ecd8c2}
.pr .kx-ul{margin:0;padding-left:18px}
.pr .kx-nums{display:flex;gap:30px}
.pr .kx-v{display:block;font:700 46px/1 "Chakra Petch",sans-serif;color:#f6e3cf}
.pr .kx-l{font-size:12px;color:#a8937c}
.pr .kx-link{font:600 13px "Chakra Petch",sans-serif;text-transform:uppercase;letter-spacing:.06em;background:none;border:1px solid ${A};color:${A};padding:9px 12px;cursor:pointer}
.pr .kx-link:hover,.pr .kx-link:focus-visible{background:${A};color:#07080a;outline:none}
@media (max-width:900px){
  .pr-top{grid-template-columns:1fr;padding:18px 14px 30px}.pr-scope{width:min(100%,420px)}
  .pr-rule{grid-template-columns:110px 1fr 44px;font-size:12px}
  .pr .kx-read{grid-template-columns:1fr;padding:10px 14px 110px}
  .pr-nav{left:8px;right:8px;transform:none;justify-content:space-between;padding:0 6px}.pr-nav .kx-src{display:none}.pr-nav .kx-b{padding:10px 6px;font-size:11.5px}
}`;

// Placeholders only. No real events, places, organisers or numbers from any client.
const EVENTS = [
  { id: 'A', foot: 0.9, dist: 0.7, dead: 0.2, fee: 0.8 },
  { id: 'B', foot: 0.6, dist: 0.2, dead: 0.5, fee: 0.3 },
  { id: 'C', foot: 0.4, dist: 0.1, dead: 0.9, fee: 0.1 },
  { id: 'D', foot: 0.8, dist: 0.9, dead: 0.6, fee: 0.5 },
  { id: 'E', foot: 0.3, dist: 0.4, dead: 0.3, fee: 0.2 },
  { id: 'F', foot: 0.7, dist: 0.5, dead: 0.8, fee: 0.9 },
  { id: 'G', foot: 0.5, dist: 0.3, dead: 0.1, fee: 0.4 },
];
const RULES = [
  { k: 'foot', name: 'expected crowd', sign: 1, w: 3 },
  { k: 'dist', name: 'travel distance', sign: -1, w: 2 },
  { k: 'dead', name: 'deadline soon', sign: 1, w: 1 },
  { k: 'fee', name: 'pitch fee', sign: -1, w: 2 },
];

export default {
  async mount(root, ctx) {
    const L = life();
    fonts(L, 'family=Chakra+Petch:wght@600;700&family=Share+Tech+Mono');
    style(L, CSS);
    const it = ctx.item;
    const cv = h('canvas', { attrs: { 'aria-hidden': 'true' } });
    const list = h('ol.pr-list', { attrs: { 'aria-live': 'polite' } });
    const items = {}; EVENTS.forEach((e) => { items[e.id] = h('li.pr-ev'); list.append(items[e.id]); });
    const formula = h('p.pr-formula');
    let ranked = [];
    const score = (e) => RULES.reduce((a, r) => a + r.sign * r.w * e[r.k], 0);
    function rank() {
      const first = {}; for (const id in items) first[id] = items[id].getBoundingClientRect().top;
      ranked = EVENTS.map((e) => ({ e, s: score(e) })).sort((a, b) => b.s - a.s || a.e.id.localeCompare(b.e.id));
      ranked.forEach(({ e, s }, i) => {
        const li = items[e.id];
        li.replaceChildren(h('b', { text: String(i + 1) }),
          h('div', 'Event ' + e.id + ' (placeholder)', h('small', { text: RULES.map((r) => r.name.split(' ')[0] + ' ' + e[r.k].toFixed(1)).join(' · ') })),
          h('span.sc', { text: s.toFixed(2) }));
        li.classList.toggle('top', i === 0); list.append(li);
      });
      if (!ctx.reduced) for (const id in items) { const dy = first[id] - items[id].getBoundingClientRect().top; if (dy) { items[id].style.transition = 'none'; items[id].style.transform = `translateY(${dy}px)`; void items[id].offsetWidth; items[id].style.transition = ''; items[id].style.transform = ''; } }
      formula.textContent = 'score = ' + RULES.map((r) => (r.sign > 0 ? '+' : '−') + r.w + '×' + r.name.split(' ')[0]).join(' ') + '. Features run 0 to 1. Nothing else enters the score: no model, no hidden term.';
    }
    const rules = h('div.pr-rules', RULES.map((r, i) => {
      const out = h('output', { text: (r.sign > 0 ? '+' : '−') + r.w });
      const inp = h('input', { attrs: { type: 'range', min: '0', max: '5', step: '1', value: String(r.w), 'aria-label': 'Weight for ' + r.name, 'data-qa': 'w' + i } });
      inp.value = String(r.w);
      L.on(inp, 'input', () => { r.w = Number(inp.value); out.textContent = (r.sign > 0 ? '+' : '−') + r.w; rank(); });
      return h('label.pr-rule', h('span', { text: r.name + (r.sign > 0 ? ' (+)' : ' (−)') }), inp, out);
    }));
    const box = h('div.pr',
      h('section.pr-top',
        h('div.pr-scope', cv),
        h('div',
          h('div.pr-k', { text: it.kind + ' · ' + it.status }),
          h('h2.pr-title', 'Pitch', h('span', { text: 'Radar' })),
          h('p.pr-line', { text: it.line }),
          h('div.pr-priv', { text: 'Private · client · no live link' }),
          h('p.pr-line', { text: 'A working model of ranking on readable rules. Events A to G and their numbers are placeholders, not real events. Move a weight:' }),
          rules, list, formula,
          h('div.pr-figs', it.numbers.map(([v, l]) => h('div', h('b', { text: v }), h('span', { text: l })))))),
      reading(ctx, { labels: { problem: 'Problem', plan: 'Plan', built: 'Built', checks: 'Checks' } }),
      controls(L, ctx, 'pr-nav'));
    root.append(box);
    rank();

    // --- the scope
    const g = cv.getContext('2d'); let W = 0, dpr = 1;
    const size = () => { const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; cv.width = W * dpr; cv.height = W * dpr; };
    L.observe(cv, size); size();
    const ang = {}; EVENTS.forEach((e, i) => { ang[e.id] = i * 2.39996; });
    const pos = {}; const lit = {};
    const t0 = performance.now(); let last = t0;
    L.raf((t) => {
      const T = (t - t0) / 1000, dt = Math.min(0.05, (t - last) / 1000); last = t;
      const R = W / 2 - 4, c = W / 2, sweep = ctx.reduced ? -Math.PI / 2 : T * 1.4 - Math.PI / 2;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, W);
      const open = clamp(T / 1.2, 0, 1);
      g.strokeStyle = 'rgba(244,154,75,.25)'; g.lineWidth = 1;
      for (let i = 1; i <= 4; i++) { g.beginPath(); g.arc(c, c, R * i / 4 * open, 0, 7); g.stroke(); }
      g.beginPath(); g.moveTo(c - R, c); g.lineTo(c + R, c); g.moveTo(c, c - R); g.lineTo(c, c + R); g.stroke();
      g.fillStyle = 'rgba(244,154,75,.55)'; g.font = '10px "Share Tech Mono",monospace';
      g.fillText('rank 1', c + 6, c + 16); g.fillText('rank 7', c + 6, c - R + 14);
      // sweep wedge
      if (!ctx.reduced) {
        for (let i = 0; i < 30; i++) {
          g.fillStyle = `rgba(244,154,75,${0.16 * (1 - i / 30)})`;
          g.beginPath(); g.moveTo(c, c); g.arc(c, c, R * open, sweep - (i + 1) * 0.025, sweep - i * 0.025); g.closePath(); g.fill();
        }
      }
      ranked.forEach(({ e }, i) => {
        const tr = 0.14 + 0.8 * (i / (EVENTS.length - 1));
        const p = pos[e.id] || (pos[e.id] = { r: tr });
        p.r += (tr - p.r) * Math.min(1, dt * 5);
        const a = ang[e.id], x = c + Math.cos(a) * R * p.r * open, y = c + Math.sin(a) * R * p.r * open;
        let da = ((sweep - a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (da < 0.08) lit[e.id] = 1; lit[e.id] = Math.max(ctx.reduced ? 1 : 0.25, (lit[e.id] || 0) - dt * 0.6);
        const L1 = lit[e.id];
        g.fillStyle = `rgba(255,${i === 0 ? 210 : 170},${i === 0 ? 150 : 100},${L1})`;
        g.beginPath(); g.arc(x, y, i === 0 ? 7 : 5, 0, 7); g.fill();
        if (i === 0) { g.strokeStyle = `rgba(255,210,160,${0.5 + 0.5 * Math.sin(T * 4)})`; g.beginPath(); g.arc(x, y, 13, 0, 7); g.stroke(); }
        g.fillStyle = `rgba(246,227,207,${0.4 + 0.6 * L1})`; g.font = '12px "Share Tech Mono",monospace'; g.fillText(e.id, x + 10, y + 4);
      });
    });
    return () => { L.dispose(); root.replaceChildren(); };
  },
};
