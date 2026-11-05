// FarmQuick — "The Market Loop". A track around a produce yard: an order travels to the owner,
// stops at a gate until a person confirms (the visitor is that person), becomes a won lead in the
// register and a line in the weekly report. A working model of the loop, with sample data.
import { life, h, s, fonts, style, controls, reading } from './_kit.js';

const LEAF = '#86C977', SOIL = '#0d0b07', KRAFT = '#d9c7a3';
const CSS = `
.fq{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;background:radial-gradient(120% 80% at 70% -10%,#2b2412 0%,${SOIL} 60%);color:#f3ead8;font-family:"Bricolage Grotesque",sans-serif;-webkit-user-select:text;user-select:text;touch-action:pan-y}
.fq-nav{position:fixed;z-index:6;right:16px;top:16px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;max-width:calc(100vw - 32px);background:#0d0b07d9;padding:6px;border-radius:10px}
.fq-nav .kx-b{font:600 13px "Bricolage Grotesque",sans-serif;background:#f3ead8;color:${SOIL};border:0;border-radius:6px;padding:8px 12px;cursor:pointer;box-shadow:0 3px 0 #a8956c}
.fq-nav .kx-b:hover,.fq-nav .kx-b:focus-visible{background:${LEAF};outline:none}
.fq-nav .kx-b:active{transform:translateY(2px);box-shadow:0 1px 0 #a8956c}
.fq-nav .kx-pos{font:800 15px "Bricolage Grotesque",sans-serif;color:${LEAF};padding:0 6px}
.fq-nav .kx-live{background:${LEAF}}
.fq-wrap{max-width:1300px;margin:0 auto;padding:22px 28px 120px}
.fq-head{display:flex;align-items:baseline;gap:18px;flex-wrap:wrap;padding-right:430px}
.fq-title{font:800 clamp(56px,8vw,120px)/.85 "Bricolage Grotesque",sans-serif;margin:0;letter-spacing:-.04em;font-variation-settings:"wdth" 75}
.fq-title span{color:${LEAF}}
.fq-k{font-size:13px;color:#cbbd9d}
.fq-line{font-size:clamp(17px,1.6vw,21px);line-height:1.4;max-width:720px;margin:12px 0 0;color:#e6dcc7}
.fq-yard{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:26px;margin-top:20px;align-items:start}
.fq-loop{position:relative;width:100%}
.fq-loop svg{width:100%;height:auto;display:block;overflow:visible}
.fq-st text{font:700 15px "Bricolage Grotesque",sans-serif;fill:#f3ead8}
.fq-st .sub{font:400 12px "Bricolage Grotesque",sans-serif;fill:#cbbd9d}
.fq-ctl{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:6px}
.fq-btn{font:700 15px "Bricolage Grotesque",sans-serif;border:0;border-radius:8px;padding:12px 16px;cursor:pointer;background:#f3ead8;color:${SOIL};box-shadow:0 4px 0 #a8956c}
.fq-btn:active{transform:translateY(2px);box-shadow:0 2px 0 #a8956c}
.fq-btn:focus-visible{outline:3px solid ${LEAF};outline-offset:2px}
.fq-btn.go{background:${LEAF};box-shadow:0 4px 0 #4f8a43}
.fq-btn.no{background:#e8826a;box-shadow:0 4px 0 #9a4a37}
.fq-btn[hidden]{display:none}
.fq-msg{font:400 15px/1.4 "Bricolage Grotesque",sans-serif;color:#ffd2a0;min-height:22px}
.fq-honest{font-size:12.5px;color:#cbbd9d;margin:10px 0 0;line-height:1.5}
.fq-papers{display:grid;gap:18px}
.fq-paper{background:${KRAFT};color:#2a2112;padding:16px 18px 18px;border-radius:2px;box-shadow:0 14px 30px #0008;position:relative;transform:rotate(.8deg)}
.fq-paper:nth-child(2){transform:rotate(-1.1deg);background:#efe4c9}
.fq-paper:before{content:"";position:absolute;top:-9px;left:50%;width:70px;height:18px;margin-left:-35px;background:#f3ead8aa;transform:rotate(-3deg)}
.fq-paper h4{margin:0 0 6px;font:800 13px "Bricolage Grotesque",sans-serif;letter-spacing:.12em;text-transform:uppercase}
.fq-paper ol{margin:0;padding-left:20px;font:400 22px/1.25 "Caveat",cursive;min-height:56px}
.fq-paper li{animation:fqw .6s ease both}
.fq-paper .empty{font:400 20px "Caveat",cursive;color:#7a6a4a}
@keyframes fqw{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
.fq-figs{display:flex;gap:26px;margin-top:4px}
.fq-figs b{display:block;font:800 46px/1 "Bricolage Grotesque",sans-serif;color:${LEAF}}
.fq-figs span{font-size:12.5px;color:#cbbd9d}
.fq .kx-read{margin-top:70px;background:#16201a;border:10px solid #3a2c18;border-radius:6px;padding:36px 40px;box-shadow:inset 0 0 80px #0009,0 20px 50px #000a}
.fq .kx-kind{font-size:13px;color:${LEAF};margin:0}
.fq .kx-title{font:800 54px/1 "Bricolage Grotesque",sans-serif;margin:6px 0;font-variation-settings:"wdth" 75}
.fq .kx-lede{font:400 30px/1.15 "Caveat",cursive;color:#f3ead8;margin:0 0 16px}
.fq .kx-sec{display:grid;grid-template-columns:180px 1fr;gap:24px;padding:20px 0;border-top:1px dashed #f3ead833}
.fq .kx-h{font:400 32px/1 "Caveat",cursive;color:${LEAF};margin:0}
.fq .kx-p,.fq .kx-ul li{font-size:17px;line-height:1.55;margin:0 0 8px;color:#ece3cf}
.fq .kx-ul{margin:0;padding-left:20px}
.fq .kx-checks li::marker{content:"✓  ";color:${LEAF}}
.fq .kx-nums{display:flex;gap:40px;flex-wrap:wrap}
.fq .kx-v{display:block;font:800 52px/1 "Bricolage Grotesque",sans-serif;color:#f3ead8}
.fq .kx-l{font:400 22px "Caveat",cursive;color:#cbbd9d}
.fq .kx-links{display:flex;gap:10px;flex-wrap:wrap}
.fq .kx-link{font:700 14px "Bricolage Grotesque",sans-serif;background:#f3ead8;color:${SOIL};border:0;border-radius:6px;padding:9px 13px;cursor:pointer}
.fq .kx-link:hover,.fq .kx-link:focus-visible{background:${LEAF};outline:none}
@media (max-width:900px){
  .fq-nav{position:fixed;top:auto;bottom:10px;left:10px;right:10px;justify-content:space-between;flex-wrap:nowrap}
  .fq-nav .kx-src{display:none}.fq-nav .kx-pos{background:#0d0b07;border-radius:6px;padding:8px 6px}.fq-nav .kx-b{padding:8px 8px;font-size:12px;white-space:nowrap}
  .fq-head{padding-right:0}.fq-wrap{padding:18px 14px 90px}.fq-yard{grid-template-columns:1fr}
  .fq .kx-read{padding:22px 16px;border-width:6px}.fq .kx-sec{grid-template-columns:1fr;gap:6px}
}`;

const STATIONS = [
  { t: 'Order placed', sub: 'a buyer orders on the site', at: 0.0 },
  { t: 'Owner confirms', sub: 'a person, before anything moves', at: 0.25 },
  { t: 'Won lead', sub: 'into the lead register', at: 0.5 },
  { t: 'Weekly report', sub: 'one line, every week', at: 0.75 },
];

export default {
  async mount(root, ctx) {
    const L = life();
    fonts(L, 'family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=Caveat:wght@400;600');
    style(L, CSS);
    const it = ctx.item;
    const path = s('path', { d: 'M110 70 H490 A90 90 0 0 1 490 250 H110 A90 90 0 0 1 110 70 Z', fill: 'none', stroke: '#f3ead8', 'stroke-width': '30', 'stroke-linejoin': 'round', opacity: '.08' });
    const track = s('path', { d: path.getAttribute('d'), fill: 'none', stroke: LEAF, 'stroke-width': '2.5', 'stroke-dasharray': '8 10' });
    const ties = s('path', { d: path.getAttribute('d'), fill: 'none', stroke: '#f3ead8', 'stroke-width': '14', 'stroke-dasharray': '2 16', opacity: '.25' });
    const gate = s('rect', { x: '-3', y: '-26', width: '6', height: '52', rx: '3', fill: '#e8826a' });
    const gateG = s('g', {}, gate);
    const crate = s('g', {},
      s('rect', { x: '-17', y: '-13', width: '34', height: '26', rx: '3', fill: '#b98a4a', stroke: '#3a2c18', 'stroke-width': '2' }),
      s('path', { d: 'M-17 -4 H17 M-17 5 H17', stroke: '#3a2c18', 'stroke-width': '1.5' }),
      s('circle', { cx: '-8', cy: '-15', r: '6', fill: '#e2553f' }), s('circle', { cx: '2', cy: '-16', r: '6', fill: '#7cc36a' }), s('circle', { cx: '11', cy: '-14', r: '5.5', fill: '#e8a33d' }));
    crate.setAttribute('opacity', '0');
    const stG = s('g');
    const svg = s('svg', { viewBox: '-20 -10 640 360', role: 'img', 'aria-label': 'The FarmQuick loop: order, owner confirms, won lead, weekly report' }, path, ties, track, stG, gateG, crate);
    const total = track.getTotalLength();
    const pt = (f) => track.getPointAtLength(((f % 1) + 1) % 1 * total);
    STATIONS.forEach((st, i) => {
      const p = pt(st.at), above = p.y < 160, tx = Math.min(560, Math.max(40, p.x));
      const dy = above ? -52 : 58, ox = i === 1 ? 64 : i === 3 ? -64 : 0;
      stG.append(s('g', { class: 'fq-st' },
        s('circle', { cx: p.x, cy: p.y, r: '11', fill: SOIL, stroke: LEAF, 'stroke-width': '3' }),
        s('text', { x: tx + ox, y: p.y + dy, 'text-anchor': 'middle' }, document.createTextNode(st.t)),
        s('text', { class: 'sub', x: tx + ox, y: p.y + dy + 17, 'text-anchor': 'middle' }, document.createTextNode(st.sub))));
    });
    const g1 = pt(0.2); gateG.setAttribute('transform', `translate(${g1.x} ${g1.y})`);

    const msg = h('div.fq-msg', { attrs: { role: 'status', 'aria-live': 'polite' }, text: 'An order is waiting to be placed.' });
    const bOrder = h('button.fq-btn', { text: 'Place a sample order', attrs: { type: 'button', 'data-qa': 'order' } });
    const bYes = h('button.fq-btn.go', { text: 'Confirm, as the owner', attrs: { type: 'button', 'data-qa': 'confirm', hidden: '' } });
    const bNo = h('button.fq-btn.no', { text: 'Decline', attrs: { type: 'button', hidden: '' } });
    const leads = h('ol', h('span.empty', { text: 'no leads yet' })), report = h('ol', h('span.empty', { text: 'nothing to report yet' }));
    let n = 0, tween = null, gateOpen = 0;
    const move = (from, to, ms, done) => { tween = { from, to, t0: performance.now(), ms: ctx.reduced ? 1 : ms, done }; };
    const setBtns = (waiting) => { bOrder.hidden = waiting; bYes.hidden = !waiting; bNo.hidden = !waiting; };
    L.on(bOrder, 'click', () => {
      if (tween) return; n++; crate.setAttribute('opacity', '1');
      msg.textContent = 'Order ' + n + ' from Sample buyer ' + String.fromCharCode(64 + ((n - 1) % 26) + 1) + ' is on its way to the owner…';
      bOrder.disabled = true;
      move(0, 0.19, 1300, () => { msg.textContent = 'Stopped at the gate. Nothing moves until a person confirms. You are that person.'; setBtns(true); bYes.focus({ preventScroll: true }); });
    });
    L.on(bYes, 'click', () => {
      setBtns(false); gateOpen = 1; msg.textContent = 'Confirmed by the owner. The order moves on.';
      const buyer = 'Sample buyer ' + String.fromCharCode(64 + ((n - 1) % 26) + 1);
      move(0.19, 0.5, 1500, () => {
        if (leads.querySelector('.empty')) leads.replaceChildren();
        leads.append(h('li', { text: buyer + ' · won · order ' + n }));
        msg.textContent = 'Now a won lead in the register.';
        move(0.5, 0.75, 1300, () => {
          if (report.querySelector('.empty')) report.replaceChildren();
          report.append(h('li', { text: 'Order ' + n + ': ' + buyer + ', confirmed by the owner' }));
          msg.textContent = 'And a line in the weekly report. The loop is closed.';
          move(0.75, 1, 1100, () => { crate.setAttribute('opacity', '0'); gateOpen = 0; bOrder.disabled = false; bOrder.textContent = 'Place another order'; });
        });
      });
    });
    L.on(bNo, 'click', () => { setBtns(false); msg.textContent = 'Declined. Nothing moved, nothing was sent. The order goes back to the buyer.'; move(0.19, 0, 900, () => { crate.setAttribute('opacity', '0'); bOrder.disabled = false; }); });

    const box = h('div.fq',
      controls(L, ctx, 'fq-nav'),
      h('div.fq-wrap',
        h('div.fq-head', h('h2.fq-title', 'Farm', h('span', { text: 'Quick' })), h('span.fq-k', { text: it.kind + ' · ' + it.status + ' · ' + it.host })),
        h('p.fq-line', { text: it.line }),
        h('div.fq-yard',
          h('div.fq-loop', svg,
            h('div.fq-ctl', bOrder, bYes, bNo), msg,
            h('p.fq-honest', { text: 'A working model of the loop, not the product: sample buyers and orders, nothing is sent. On the real site the owner confirms before anything moves, and WhatsApp and email stay owner-gated.' })),
          h('div.fq-papers',
            h('div.fq-paper', h('h4', { text: 'Lead register' }), leads),
            h('div.fq-paper', h('h4', { text: 'Weekly report' }), report),
            h('div.fq-figs', it.numbers.map(([v, l]) => h('div', h('b', { text: v }), h('span', { text: l })))))),
        reading(ctx, { labels: { problem: 'The problem', plan: 'The plan', built: 'What I built', checks: 'Checks' } })));
    root.append(box);

    // arrival: the track draws itself, crates roll once round; then tweens drive the crate
    const t0 = performance.now(); let gateA = 0;
    L.raf((t) => {
      const T = (t - t0) / 1000, k = Math.min(1, T / 1.6);
      track.setAttribute('stroke-dashoffset', String((1 - k) * total * (ctx.reduced ? 0 : 1) - (ctx.reduced ? 0 : T * 12)));
      track.style.opacity = String(0.3 + 0.7 * k);
      if (!tween && T < 2.2 && !ctx.reduced && n === 0) { const p = pt(T / 2.2); crate.setAttribute('opacity', String(Math.sin(Math.PI * T / 2.2))); crate.setAttribute('transform', `translate(${p.x} ${p.y})`); }
      else if (!tween && n === 0) crate.setAttribute('opacity', '0');
      if (tween) {
        const e = Math.min(1, (t - tween.t0) / tween.ms), q = e < .5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
        const p = pt(tween.from + (tween.to - tween.from) * q); crate.setAttribute('transform', `translate(${p.x} ${p.y})`);
        if (e >= 1) { const d = tween.done; tween = null; d && d(); }
      }
      gateA += ((gateOpen ? 1 : 0) - gateA) * 0.15;
      gate.setAttribute('fill', gateOpen ? LEAF : '#e8826a');
      gate.setAttribute('transform', `rotate(${gateA * 80})`);
    });
    return () => { L.dispose(); root.replaceChildren(); };
  },
};
