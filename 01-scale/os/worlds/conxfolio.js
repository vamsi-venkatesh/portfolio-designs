// Conxfolio — "The Light Table". One source line sits in the middle of a light table; four prints
// fan out around it (résumé, ATS read, letter, portfolio). Edit the line once and watch it flow
// into all four. A working model of "four tools share one résumé", not the product's templates.
import { life, h, s, fonts, style, controls, reading } from './_kit.js';

const CR = '#EDE4D6';
const CSS = `
.cf{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;background:#0a0908;color:${CR};font-family:"Hanken Grotesk",sans-serif;-webkit-user-select:text;user-select:text;touch-action:pan-y}
.cf-nav{position:fixed;z-index:6;left:18px;top:16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;max-width:calc(100vw - 36px)}
.cf-nav .kx-b{font:500 13px "Hanken Grotesk",sans-serif;background:none;border:0;color:${CR};cursor:pointer;padding:6px 0;opacity:.75}
.cf-nav .kx-b:hover,.cf-nav .kx-b:focus-visible{opacity:1;outline:none;text-decoration:underline;text-underline-offset:4px}
.cf-nav .kx-pos{font:400 18px "Gloock",serif}
.cf-nav .kx-live{opacity:1;border:1px solid ${CR};border-radius:99px;padding:6px 14px}
.cf-table{position:relative;min-height:100%;display:grid;grid-template-columns:1fr minmax(300px,380px) 1fr;grid-template-rows:auto auto auto;gap:26px 34px;padding:70px 40px 50px;max-width:1400px;margin:0 auto;box-sizing:border-box}
.cf-table:before{content:"";position:absolute;inset:40px 20px 20px;border-radius:30px;background:radial-gradient(50% 50% at 50% 55%,#f6efe31c,#f6efe306 60%,transparent 80%);pointer-events:none}
.cf-lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.cf-lines path{fill:none;stroke:${CR};stroke-opacity:.18;stroke-width:1}
.cf-lines circle{fill:#ffd2a0}
.cf-hd{grid-column:1/-1;text-align:center;position:relative}
.cf-title{font:400 clamp(52px,7vw,104px)/.9 "Gloock",serif;margin:0;letter-spacing:-.02em}
.cf-line{font-size:16px;line-height:1.5;color:#cfc4b2;margin:10px auto 0;max-width:640px}
.cf-src{grid-column:2;grid-row:2/4;align-self:center;position:relative;z-index:2;background:#14120f;border:1px solid ${CR}44;border-radius:18px;padding:20px;box-shadow:0 0 0 8px #0a0908,0 0 80px #ffd2a018}
.cf-src h4{margin:0 0 10px;font:600 11px "Hanken Grotesk",sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#ffd2a0}
.cf-src label{display:block;font-size:12px;color:#a99d8a;margin:10px 0 4px}
.cf-src input{width:100%;box-sizing:border-box;font:500 16px "Hanken Grotesk",sans-serif;background:#0a0908;color:${CR};border:1px solid ${CR}33;border-radius:10px;padding:11px 12px;outline:none}
.cf-src input:focus{border-color:#ffd2a0}
.cf-src p{font-size:12px;line-height:1.55;color:#a99d8a;margin:12px 0 0}
.cf-figs{display:flex;gap:18px;margin-top:14px;border-top:1px solid ${CR}22;padding-top:12px}
.cf-figs b{display:block;font:400 34px "Gloock",serif}
.cf-figs span{font-size:12px;color:#a99d8a}
.cf-print{position:relative;z-index:1;border-radius:4px;padding:16px 18px;min-height:190px;box-shadow:0 20px 40px #000a;animation:cfout .9s cubic-bezier(.2,.9,.25,1.1) both;overflow:hidden}
.cf-print .cap{position:absolute;right:10px;top:8px;font:600 10px "Hanken Grotesk",sans-serif;letter-spacing:.16em;text-transform:uppercase;opacity:.55}
.cf-print.flash{animation:cfflash .5s ease}
@keyframes cfflash{0%{box-shadow:0 0 0 2px #ffd2a0,0 20px 40px #000a}100%{box-shadow:0 20px 40px #000a}}
.cf-p1{grid-column:1;grid-row:2;background:#f6f1e8;color:#1c1a17;--fx:120%;--fy:60%;transform:rotate(-2deg)}
.cf-p2{grid-column:3;grid-row:2;background:#111;color:#c8f0c8;font-family:"IBM Plex Mono",monospace;--fx:-120%;--fy:60%;transform:rotate(1.5deg)}
.cf-p3{grid-column:1;grid-row:3;background:#efe6d4;color:#2a2318;--fx:120%;--fy:-60%;transform:rotate(1.2deg)}
.cf-p4{grid-column:3;grid-row:3;background:#1b2a3a;color:#eef4fb;--fx:-120%;--fy:-60%;transform:rotate(-1.4deg)}
@keyframes cfout{from{translate:var(--fx) var(--fy);scale:.3;opacity:0}to{translate:0 0;scale:1;opacity:1}}
.cf-p1 .nm{font:400 24px "Gloock",serif;margin:0}.cf-p1 .rl{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6b6457;margin:2px 0 10px;border-bottom:1px solid #1c1a1733;padding-bottom:8px}
.cf-p1 ul{margin:0;padding-left:16px;font-size:13px;line-height:1.5}.cf-p1 li.hot{background:#ffd2a066}
.cf-p2 div{font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-word}
.cf-p3 p{font:400 14px/1.55 "Gloock",serif;margin:0 0 8px}.cf-p3 .hot{background:#ffd2a066}
.cf-p4 .nm{font:400 30px/1 "Gloock",serif;margin:16px 0 4px}.cf-p4 small{font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.65}
.cf-p4 .card{margin-top:12px;border:1px solid #eef4fb33;border-radius:8px;padding:10px;font-size:13px;line-height:1.45}
.cf-p4 .bar{position:absolute;left:0;right:0;top:0;height:22px;background:#0f1a26;display:flex;gap:5px;align-items:center;padding-left:9px}
.cf-p4 .bar i{width:7px;height:7px;border-radius:50%;background:#eef4fb44}
.cf .kx-read{max-width:980px;margin:40px auto 0;padding:0 40px 120px}
.cf .kx-head{text-align:center;padding:40px 0 20px}
.cf .kx-kind{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#a99d8a;margin:0}
.cf .kx-title{font:400 64px "Gloock",serif;margin:8px 0}
.cf .kx-lede{font-size:19px;color:#cfc4b2;margin:0}
.cf .kx-sec{display:grid;grid-template-columns:1fr 2.4fr;gap:30px;padding:26px 0;border-top:1px solid ${CR}22}
.cf .kx-h{font:400 26px "Gloock",serif;margin:0}
.cf .kx-p,.cf .kx-ul li{font-size:16px;line-height:1.65;color:#e2d8c8;margin:0 0 8px}
.cf .kx-ul{margin:0;padding-left:18px}
.cf .kx-nums{display:flex;gap:40px}
.cf .kx-v{display:block;font:400 56px/1 "Gloock",serif}
.cf .kx-l{color:#a99d8a;font-size:14px}
.cf .kx-links{display:flex;gap:10px}
.cf .kx-link{font:500 14px "Hanken Grotesk",sans-serif;background:${CR};color:#0a0908;border:0;border-radius:99px;padding:10px 16px;cursor:pointer}
.cf .kx-link:focus-visible{outline:2px solid #ffd2a0;outline-offset:2px}
@media (max-width:980px){
  .cf-table{grid-template-columns:1fr;grid-template-rows:none;padding:64px 16px 30px;gap:18px}
  .cf-hd,.cf-src,.cf-p1,.cf-p2,.cf-p3,.cf-p4{grid-column:1;grid-row:auto}.cf-lines{display:none}
  .cf-p1{order:1}.cf-src{order:2}.cf-p2{order:3}.cf-p3{order:4}.cf-p4{order:5}
  .cf .kx-read{padding:0 16px 100px}.cf .kx-sec{grid-template-columns:1fr;gap:8px}
  .cf-nav{gap:10px}.cf-nav .kx-src{display:none}
}`;

const VERBS = /^(built|led|wrote|designed|shipped|ran|made|created|launched|managed|improved|reduced|grew|tested|taught)\b/i;

export default {
  async mount(root, ctx) {
    const L = life();
    fonts(L, 'family=Gloock&family=Hanken+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400');
    style(L, CSS);
    const it = ctx.item;
    const nameIn = h('input', { attrs: { 'aria-label': 'Name', value: 'Alex Example' } }); nameIn.value = 'Alex Example';
    const lineIn = h('input', { attrs: { 'aria-label': 'One résumé line', 'data-qa': 'line' } }); lineIn.value = 'Shipped a booking app used by a local clinic';
    const p1 = h('div.cf-print.cf-p1'), p2 = h('div.cf-print.cf-p2'), p3 = h('div.cf-print.cf-p3'), p4 = h('div.cf-print.cf-p4');
    const lines = s('svg', { class: 'cf-lines', 'aria-hidden': 'true' });
    function render(flash) {
      const nm = nameIn.value.trim() || 'Your name', ln = lineIn.value.trim() || 'Your line';
      const lc = ln.charAt(0).toLowerCase() + ln.slice(1);
      p1.replaceChildren(h('span.cap', { text: 'résumé' }), h('p.nm', { text: nm }), h('p.rl', { text: 'Product engineer' }),
        h('ul', h('li.hot', { text: ln }), h('li', { text: 'Sample line two, unchanged' }), h('li', { text: 'Sample line three, unchanged' })));
      const nums = ln.match(/\d[\d,.%]*/g) || [], verb = ln.match(VERBS), words = ln.split(/\s+/).filter(Boolean).length;
      p2.replaceChildren(h('span.cap', { text: 'how it reads' }), h('div', { text:
        'NAME        ' + nm + '\nLINE 1      ' + ln + '\nWORDS       ' + words + (words > 22 ? '  (long)' : '') +
        '\nACTION VERB ' + (verb ? verb[0].toLowerCase() : 'none at the start') + '\nNUMBERS     ' + (nums.length ? nums.join(', ') : 'none') }));
      p3.replaceChildren(h('span.cap', { text: 'letter' }), h('p', { text: 'Dear hiring team,' }),
        h('p', 'In my last role I ', h('span.hot', { text: lc.replace(/\.$/, '') }), '. I would like to bring the same care to your team.'),
        h('p', { text: 'Kind regards, ' + nm }));
      p4.replaceChildren(h('div.bar', h('i'), h('i'), h('i')), h('span.cap', { text: 'portfolio' }), h('p.nm', { text: nm }), h('small', { text: 'Selected work' }),
        h('div.card', { text: ln }));
      if (flash) for (const p of [p1, p2, p3, p4]) { p.classList.remove('flash'); void p.offsetWidth; p.classList.add('flash'); }
      pulse = performance.now();
    }
    let pulse = 0;
    L.on(lineIn, 'input', () => render(true)); L.on(nameIn, 'input', () => render(true));
    const src = h('div.cf-src',
      h('h4', { text: 'The one résumé' }),
      h('label', { text: 'Name', attrs: {} }), nameIn,
      h('label', { text: 'One line, edited once' }), lineIn,
      h('p', { text: 'A working model of the idea, not the product: one source feeds four views. The "how it reads" panel uses three plain checks (words, a leading action verb, numbers), not the product\'s parser. Sample text only.' }),
      h('div.cf-figs', it.numbers.map(([v, l]) => h('div', h('b', { text: v }), h('span', { text: l })))));
    const table = h('section.cf-table', lines,
      h('div.cf-hd', h('h2.cf-title', { text: 'Conxfolio' }), h('p.cf-line', { text: it.line + ' ' + it.kind + ' · ' + it.status + ' · ' + it.host })),
      p1, src, p2, p3, p4);
    [p1, p2, p3, p4].forEach((p, i) => { p.style.animationDelay = (0.25 + i * 0.12) + 's'; if (ctx.reduced) p.style.animation = 'none'; });
    const box = h('div.cf', controls(L, ctx, 'cf-nav'), table, reading(ctx));
    root.append(box);
    render(false);

    // threads from the source to each print, with a bead that runs out on every edit
    const paths = [p1, p2, p3, p4].map(() => { const p = s('path'); lines.append(p); return p; });
    const beads = [0, 1, 2, 3].map(() => { const c = s('circle', { r: '4', opacity: '0' }); lines.append(c); return c; });
    let geo = null;
    const measure = () => {
      if (getComputedStyle(lines).display === 'none') { geo = null; return; }
      const tr = table.getBoundingClientRect(), sr = src.getBoundingClientRect();
      const sx = sr.left - tr.left + sr.width / 2, sy = sr.top - tr.top + sr.height / 2;
      geo = [p1, p2, p3, p4].map((p, i) => {
        const r = p.getBoundingClientRect(), tx = r.left - tr.left + r.width / 2, ty = r.top - tr.top + r.height / 2;
        const d = `M${sx} ${sy} C ${(sx + tx) / 2} ${sy}, ${(sx + tx) / 2} ${ty}, ${tx} ${ty}`; paths[i].setAttribute('d', d); return paths[i];
      });
    };
    L.observe(table, measure); L.timeout(measure, 1300);
    L.raf((t) => {
      if (!geo) return;
      const e = (t - pulse) / 900;
      geo.forEach((p, i) => {
        if (e < 0 || e > 1 || ctx.reduced) { beads[i].setAttribute('opacity', '0'); return; }
        const len = p.getTotalLength(), pt = p.getPointAtLength(len * e);
        beads[i].setAttribute('cx', pt.x); beads[i].setAttribute('cy', pt.y); beads[i].setAttribute('opacity', String(1 - e * 0.6));
      });
    });
    return () => { L.dispose(); root.replaceChildren(); };
  },
};
