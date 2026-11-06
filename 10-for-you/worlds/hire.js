// World: hire — "Proof, in glass". The whole site as a silent optical studio: eight slabs of optical glass, one per
// product, cases engraved pane by pane, and free panes for the other rooms. Facts only from ctx (content.mjs).
import * as THREE from '../../vendor/three.module.js';

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Geist:wght@300..600&display=swap';
const SERIF = '"DM Serif Display", "Didot", serif';
const SANS = '"Geist", "Helvetica Neue", sans-serif';
const INK = '#101b27';
const SLAB_W = 1.3, SLAB_H = 1.8, SLAB_D = 0.3;

const CSS = `
.pg-root{position:absolute;inset:0;overflow:hidden;background:#eef3f8;color:${INK};font-family:${SANS};-webkit-font-smoothing:antialiased;font-synthesis:none}
.pg-root canvas.pg-gl{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;outline:none}
.pg-ui{position:absolute;inset:0;pointer-events:none}
.pg-ui a,.pg-ui button{pointer-events:auto}
.pg-ui a{color:inherit;text-decoration:none}
.pg-ui button{font:inherit;color:inherit}
.pg-ui :focus-visible{outline:2px solid #28507a;outline-offset:3px}
.pg-fade{transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1),visibility 0s}
.pg-off{opacity:0!important;transform:translateY(-6px);pointer-events:none!important;visibility:hidden;transition:opacity .45s cubic-bezier(.2,.7,.2,1),transform .6s cubic-bezier(.2,.7,.2,1),visibility 0s .6s}
.pg-off a,.pg-off button{pointer-events:none!important}
.pg-intro{position:absolute;left:56px;top:96px;width:min(520px,38vw)}
.pg-id{font-size:12.5px;letter-spacing:.02em;color:#4a5869;margin:0 0 18px}
.pg-id b{font-weight:550;color:${INK}}
.pg-h1{font-family:${SERIF};font-weight:400;font-size:clamp(32px,3.3vw,50px);line-height:1.04;letter-spacing:-.008em;margin:0;color:${INK}}
.pg-h1 em{font-style:italic}
.pg-h1 .pg-l2{display:block;margin-top:.1em;color:#28507a}
.pg-wants{font-size:14.5px;line-height:1.6;color:#36434f;margin:22px 0 0;max-width:440px}
.pg-held{margin:22px 0 0;padding:0;list-style:none;max-width:440px}
.pg-held-h{font-family:${SERIF};font-style:italic;font-size:18px;margin:22px 0 6px}
.pg-held li{position:relative;padding:6px 0 6px 22px;font-size:13px;line-height:1.45;border-top:1px solid rgba(16,27,39,.1)}
.pg-held li::before,.pg-p-checks li::before{content:"";position:absolute;left:2px;top:11px;width:8px;height:8px;transform:rotate(45deg);border:1px solid #28507a;background:linear-gradient(135deg,#fff,#cfe2f2)}
.pg-contact{position:absolute;right:56px;top:96px;text-align:right;font-size:13px;line-height:1.85}
.pg-avail{display:block;font-family:${SERIF};font-style:italic;font-size:17px;line-height:1.3;color:#28507a;margin-bottom:8px;max-width:300px;margin-left:auto}
.pg-ul{border-bottom:1px solid rgba(16,27,39,.25);transition:border-color .25s}
.pg-ul:hover,.pg-ul:focus-visible{border-color:${INK}}
.pg-contact a{display:inline-block;line-height:1.35}
.pg-workhead{position:absolute;left:56px;top:96px;width:min(420px,32vw)}
.pg-workhead h2{font-family:${SERIF};font-weight:400;font-size:clamp(34px,3.2vw,48px);line-height:1.04;margin:0 0 14px}
.pg-workhead p{font-size:14px;line-height:1.6;color:#36434f;margin:0 0 18px}
.pg-worklist{list-style:none;margin:0;padding:0;columns:2;column-gap:22px}
.pg-worklist li{break-inside:avoid;padding:5px 0;border-top:1px solid rgba(16,27,39,.1);font-size:13px}
.pg-worklist a{display:block}
.pg-worklist a span{display:block;font-size:11px;color:#5d6a78}
.pg-worklist a:hover b,.pg-worklist a:focus-visible b{text-decoration:underline}
.pg-worklist b{font-weight:550}
.pg-cap{position:absolute;left:0;top:0;transform:translate(-50%,0);text-align:center;width:min(520px,44vw);margin:0}
.pg-cap-name{font-family:${SERIF};font-size:22px;line-height:1.1}
.pg-cap-kind{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5d6a78;margin-left:8px}
.pg-cap-one{display:block;font-size:13px;line-height:1.5;color:#36434f;margin:5px 0 7px}
.pg-cap-open{font-size:13px;font-weight:550;border-bottom:1px solid ${INK};padding-bottom:1px}
.pg-cap-hint{display:block;font-size:11.5px;color:#6a7684;margin-top:8px}
.pg-root.pg-eval .pg-cap-hint{display:none}
.pg-cap-hint i{font-family:${SERIF};font-size:13px}
.pg-index{position:absolute;left:56px;bottom:28px;margin:0;padding:0;list-style:none;font-size:12.5px;line-height:1}
.pg-index-h{font-family:${SERIF};font-style:italic;font-size:15px;color:#4a5869;margin:0 0 8px}
.pg-index li{margin:0}
.pg-index a{display:inline-flex;align-items:center;gap:10px;padding:4px 0;color:#4a5869}
.pg-index a::before{content:"";width:7px;height:7px;transform:rotate(45deg);border:1px solid rgba(40,80,122,.55);transition:background .3s,transform .3s}
.pg-index a:hover,.pg-index a:focus-visible{color:${INK}}
.pg-index a[aria-current="true"]{color:${INK};font-weight:550}
.pg-index a[aria-current="true"]::before{background:#28507a;border-color:#28507a;transform:rotate(45deg) scale(1.15)}
.pg-wd{position:absolute;right:38px;bottom:16px;padding:22px 18px 14px;box-sizing:border-box;width:min(796px,calc(100% - 604px));background:linear-gradient(180deg,rgba(236,241,246,0),rgba(236,241,246,.88) 30%,rgba(236,241,246,.92));-webkit-mask-image:linear-gradient(90deg,transparent,#000 22px,#000 calc(100% - 22px),transparent);mask-image:linear-gradient(90deg,transparent,#000 22px,#000 calc(100% - 22px),transparent);text-align:left;display:grid;grid-template-columns:1fr 1fr;column-gap:30px}
.pg-wd-head{grid-column:1 / -1;display:flex;align-items:baseline;gap:14px;margin-bottom:8px}
.pg-wd h2{font-family:${SERIF};font-weight:400;font-style:italic;font-size:22px;margin:0;line-height:1.15;white-space:nowrap}
.pg-wd-head a{font-size:12px;margin-left:auto;white-space:nowrap}
.pg-wd-item{border-top:1px solid rgba(16,27,39,.16);padding:9px 0 0}
.pg-wd-item h3{font-size:12.5px;font-weight:560;margin:0 0 2px;letter-spacing:.005em}
.pg-wd-nums{display:flex;gap:18px;align-items:baseline;flex-wrap:wrap;margin-bottom:3px}
.pg-wd-nums span{font-size:11.5px;color:#55626f;white-space:nowrap}
.pg-wd-nums b{font-family:${SERIF};font-weight:400;font-size:26px;color:${INK};margin-right:6px}
.pg-wd a.pg-ul{font-size:11.5px}
/* reading surface */
.pg-panel{position:absolute;right:48px;top:92px;max-height:calc(100% - 120px);width:min(500px,38vw);pointer-events:auto;overflow-y:auto;overscroll-behavior:contain;
  background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(250,252,255,.7));-webkit-backdrop-filter:blur(22px) saturate(1.2);backdrop-filter:blur(22px) saturate(1.2);
  border:1px solid rgba(255,255,255,.9);box-shadow:0 30px 80px -40px rgba(30,60,90,.35),inset 0 0 0 1px rgba(16,27,39,.05);border-radius:3px;padding:0 34px 30px;box-sizing:border-box;
  opacity:0;transform:translateX(24px);visibility:hidden;transition:opacity .45s cubic-bezier(.2,.7,.2,1),transform .6s cubic-bezier(.2,.7,.2,1),visibility 0s .6s}
.pg-panel.pg-wide{width:min(580px,42vw)}
.pg-panel.pg-show{opacity:1;transform:none;visibility:visible;transition:opacity .6s .2s cubic-bezier(.2,.7,.2,1),transform .9s .15s cubic-bezier(.2,.7,.2,1),visibility 0s}
.pg-panel:focus{outline:none}
.pg-p-head{margin:0;padding:26px 0 6px}
.pg-railbar{position:sticky;top:0;z-index:2;margin:0 -34px;padding:12px 34px 10px;background:#f6f9fc;border-bottom:1px solid rgba(16,27,39,.08)}
.pg-p-top{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#5a6776}
.pg-p-top span{min-width:0}
.pg-p-acts{display:flex;gap:4px;flex:none}
.pg-x{all:unset;cursor:pointer;white-space:nowrap;flex:none;font-family:${SANS};font-size:11px;font-weight:550;letter-spacing:.14em;text-transform:uppercase;line-height:1;padding:9px 10px;border-radius:999px;color:${INK}}
.pg-x:hover,.pg-x:focus-visible{background:rgba(16,27,39,.07)}
.pg-x.pg-ix{display:none}
.pg-p-name{font-family:${SERIF};font-weight:400;font-size:42px;line-height:1.02;margin:12px 0 0}
.pg-p-bar{height:2px;width:56px;margin:12px 0 0}
.pg-rail{display:flex;gap:5px;align-items:flex-end;margin:0;padding:0;list-style:none;height:30px}
.pg-rail button{all:unset;cursor:pointer;width:9px;height:16px;border:1px solid rgba(40,80,122,.45);border-radius:2px;background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(207,226,242,.6));transition:height .35s cubic-bezier(.2,.7,.2,1),background .3s}
.pg-rail button[aria-current="true"]{height:28px;background:linear-gradient(180deg,#fff,#9fc0de);border-color:#28507a}
.pg-rail button:hover,.pg-rail button:focus-visible{height:24px}
.pg-rail-t{font-family:${SERIF};font-style:italic;font-size:15px;color:#28507a;margin-left:10px;align-self:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pg-p-line{font-size:15px;line-height:1.55;color:#2d3a47;margin:14px 0 0}
.pg-ch{padding:20px 0 6px;border-top:1px solid rgba(16,27,39,.1);margin-top:14px;scroll-margin-top:70px}
.pg-ch:first-of-type{border-top:0;margin-top:0}
.pg-ch-h{display:flex;align-items:baseline;gap:12px;font-family:${SERIF};font-weight:400;font-size:24px;line-height:1.15;margin:0 0 12px}
.pg-ch-h i{font-size:15px;color:#28507a;min-width:26px}
.pg-ch p{font-size:14px;line-height:1.65;color:#2d3a47;margin:0 0 12px}
.pg-ch ul,.pg-ch ol{margin:0 0 12px;padding:0;list-style:none}
.pg-ch li{font-size:13.5px;line-height:1.6;color:#2d3a47;padding:8px 0;border-top:1px solid rgba(16,27,39,.08)}
.pg-ch li:first-child{border-top:0}
.pg-ch h4{font-size:13.5px;font-weight:600;margin:0 0 3px;color:${INK}}
.pg-ch ol li{display:grid;grid-template-columns:30px 1fr;column-gap:6px}
.pg-ch ol li i{font-family:${SERIF};font-size:18px;color:#28507a;line-height:1.2}
.pg-ch .pg-trade{color:#55626f;font-size:13px}
.pg-ch .pg-trade b{font-weight:600;color:#3a4652}
.pg-ev{border:1px solid rgba(40,80,122,.18);background:linear-gradient(135deg,rgba(255,255,255,.7),rgba(220,234,246,.45));padding:12px 14px;margin:0 0 10px;border-radius:2px}
.pg-ev h4{font-size:13.5px}
.pg-ev p{margin:0 0 6px;font-size:13.5px}
.pg-ev time{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#5a6776}
.pg-p-checks{list-style:none;margin:0 0 12px;padding:0}
.pg-p-checks li{position:relative;padding:7px 0 7px 24px!important;display:block!important}
.pg-p-nums{display:grid;grid-template-columns:1fr 1fr;gap:18px 22px;margin:0 0 12px}
.pg-p-nums b{display:block;font-family:${SERIF};font-weight:400;font-size:34px;line-height:1.02}
.pg-p-nums span{display:block;font-size:12px;color:#55626f;margin-top:6px;line-height:1.4}
.pg-p-nums time{display:block;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#7a8592;margin-top:4px}
.pg-stack{display:flex;flex-wrap:wrap;gap:6px 14px;margin:0 0 12px;padding:0;list-style:none}
.pg-stack li{border:0!important;padding:0!important;font-size:13px}
.pg-stack li+li::before{content:"·";margin-right:14px;color:#8a95a2}
.pg-links{display:flex;flex-direction:column;gap:8px;margin:0 0 12px}
.pg-links a{font-size:14px;align-self:flex-start}
.pg-p-wd{background:rgba(181,69,42,.06);border-left:2px solid #b5452a;padding:12px 14px;margin:6px 0 12px}
.pg-p-wd h4{margin:0 0 4px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8e3820;font-weight:560}
.pg-p-wd h5{margin:0 0 6px;font-family:${SERIF};font-size:20px;font-weight:400}
.pg-p-wd p{margin:0 0 8px;font-size:13px;line-height:1.55;color:#3a4652}
.pg-p-nav{display:flex;justify-content:space-between;gap:14px;margin-top:18px;padding-top:12px;border-top:1px solid rgba(16,27,39,.1)}
.pg-p-nav a{font-size:12.5px;color:#4a5869;padding:4px 0}
.pg-p-nav a:hover,.pg-p-nav a:focus-visible{color:${INK};text-decoration:underline}
.pg-sec-lede{font-size:15px;line-height:1.6;color:#2d3a47;margin:14px 0 0}
.pg-item{padding:18px 0 8px;border-top:1px solid rgba(16,27,39,.1);margin-top:12px;transition:background .4s}
.pg-item.pg-act{background:linear-gradient(90deg,rgba(207,226,242,.35),rgba(207,226,242,0))}
.pg-item h3{font-family:${SERIF};font-weight:400;font-size:24px;line-height:1.15;margin:0 0 8px;display:flex;gap:12px;align-items:baseline}
.pg-item h3 i{font-size:15px;color:#28507a;min-width:22px}
.pg-item p{font-size:14px;line-height:1.65;color:#2d3a47;margin:0 0 10px}
.pg-item.pg-annul h3{color:#8e3820}
.pg-skills{list-style:none;margin:0;padding:0}
.pg-skills li{padding:9px 0;border-top:1px solid rgba(16,27,39,.08)}
.pg-skills li:first-child{border-top:0}
.pg-skills b{display:block;font-size:13.5px;font-weight:550;margin-bottom:3px}
.pg-skills span{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:#4a5869}
.pg-skills a{border-bottom:1px solid rgba(40,80,122,.3)}
.pg-skills a:hover,.pg-skills a:focus-visible{color:${INK};border-color:${INK}}
.pg-facts{margin:0 0 6px;display:grid;grid-template-columns:110px 1fr;gap:9px 16px}
.pg-facts dt{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5a6776;padding-top:3px}
.pg-facts dd{margin:0;font-size:14px;line-height:1.5;color:#2d3a47}
.pg-roles{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.pg-roles li{font-family:${SERIF};font-size:22px;line-height:1.25}
.pg-mail{display:inline-block;font-family:${SERIF};font-size:clamp(22px,2.1vw,30px);border-bottom:1px solid ${INK};margin:4px 0 14px;word-break:break-all}
.pg-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.pg-pre .pg-rv{opacity:0;transform:translateY(10px)}
.pg-rv{transition:opacity 1.1s cubic-bezier(.2,.7,.2,1),transform 1.3s cubic-bezier(.2,.7,.2,1)}
.pg-pre .pg-cap,.pg-prehint .pg-cap{opacity:0}
.pg-cap{transition:opacity .8s ease}
/* phone */
.pg-sheet,.pg-bar,.pg-ixsheet{display:none}
.pg-root.pg-phone .pg-intro{left:20px;right:20px;top:84px;width:auto}
.pg-root.pg-phone .pg-id{font-size:11px;margin-bottom:8px}
.pg-root.pg-phone .pg-h1{font-size:clamp(24px,7vw,30px)}
.pg-root.pg-phone .pg-contact,.pg-root.pg-phone .pg-index-wrap,.pg-root.pg-phone .pg-cap,.pg-root.pg-phone .pg-workhead{display:none}
.pg-root.pg-phone .pg-sheet{display:block;position:absolute;left:0;right:0;bottom:0;height:calc(26% + 46px);overflow-y:auto;overscroll-behavior:contain;padding:16px 20px 58px;box-sizing:border-box;pointer-events:auto;background:#e9eff5;
  -webkit-mask-image:linear-gradient(transparent 0,#000 14px,#000 calc(100% - 50px),transparent calc(100% - 44px));mask-image:linear-gradient(transparent 0,#000 14px,#000 calc(100% - 50px),transparent calc(100% - 44px))}
.pg-root.pg-phone .pg-sheet .pg-cap{display:block;position:static;transform:none;text-align:left;width:auto;margin:0 0 12px;opacity:1}
.pg-root.pg-phone .pg-sheet .pg-wants{font-size:13px;line-height:1.55;margin:0 0 12px}
.pg-root.pg-phone .pg-sheet .pg-wd{position:static;display:block;width:auto;padding:0;background:none;-webkit-mask-image:none;mask-image:none;margin:0 0 12px}
.pg-root.pg-phone .pg-sheet .pg-wd-head{display:block}
.pg-root.pg-phone .pg-sheet .pg-held{margin-top:0}
.pg-root.pg-phone .pg-bar{display:flex;z-index:3;position:absolute;left:0;right:0;bottom:0;padding:12px 20px 14px;background:#e9eff5;gap:18px;align-items:center;font-size:12.5px;pointer-events:auto}
.pg-bar button{all:unset;cursor:pointer;font-weight:600;display:inline-flex;gap:8px;align-items:center}
.pg-bar button::before{content:"";width:7px;height:7px;transform:rotate(45deg);border:1px solid #28507a;background:#cfe2f2}
.pg-root.pg-phone .pg-ixsheet{display:block;z-index:6;position:absolute;left:10px;right:10px;bottom:10px;padding:18px 20px;pointer-events:auto;background:rgba(246,249,252,.94);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid #fff;box-shadow:0 30px 80px -30px rgba(30,60,90,.45);border-radius:3px}
.pg-root.pg-phone .pg-ixsheet.pg-off{transform:translateY(20px)}
.pg-ixsheet .pg-index{position:static;font-size:16px}
.pg-ixsheet .pg-index a{padding:9px 0}
.pg-root.pg-phone .pg-panel{left:10px;right:10px;width:auto;top:auto;bottom:52px;height:calc(58% - 42px);max-height:none;padding:0 20px 22px;transform:translateY(30px)}
.pg-root.pg-phone .pg-panel.pg-show{transform:none}
.pg-root.pg-phone .pg-p-head{padding:16px 0 4px}
.pg-root.pg-phone .pg-railbar{margin:0 -20px;padding:10px 20px 8px}
.pg-root.pg-phone .pg-x.pg-ix{display:inline-block}
.pg-root.pg-phone .pg-p-name{font-size:30px;margin-top:8px}
.pg-root.pg-phone .pg-p-nums b{font-size:28px}
.pg-root.pg-phone .pg-facts{grid-template-columns:1fr}
.pg-root.pg-phone .pg-ch{scroll-margin-top:60px}
@media (prefers-reduced-motion: reduce){.pg-fade,.pg-panel,.pg-off,.pg-rv{transition:none!important}}
`;


const ease = {
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function el(tag, cls, text, attrs) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}

function hexLum(hex) {
  const c = new THREE.Color(hex);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}
function accentFor(hex) {
  // Pale product colours (paper whites) would vanish on glass; deepen them, keep the hue.
  const c = new THREE.Color(hex);
  const hsl = {}; c.getHSL(hsl);
  if (hexLum(hex) > 0.55) c.setHSL(hsl.h, Math.min(0.35, hsl.s + 0.1), 0.42);
  return '#' + c.getHexString();
}

// ---------- etched inner layer (canvas) ----------
function wrapLines(g, text, maxW) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}
function fitFont(g, text, family, weight, size, maxW, style = '') {
  let s = size;
  for (; s > 20; s -= 4) { g.font = `${style} ${weight} ${s}px ${family}`; if (g.measureText(text).width <= maxW) break; }
  return s;
}
function etchedCanvas(item) {
  const W = 900, H = Math.round(900 * SLAB_H / SLAB_W * 0.94 / 0.9);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = INK; g.strokeStyle = INK;
  const M = 78, maxW = W - M * 2;
  // engraved hairline frame
  g.lineWidth = 6; g.beginPath(); g.roundRect(34, 34, W - 68, H - 68, 28); g.stroke();
  // name
  let ns = 150; g.font = `400 ${ns}px ${SERIF}`;
  let lines = wrapLines(g, item.name, maxW);
  while ((lines.length > 2 || lines.some((l) => g.measureText(l).width > maxW)) && ns > 60) { ns -= 6; g.font = `400 ${ns}px ${SERIF}`; lines = wrapLines(g, item.name, maxW); }
  let y = 92 + ns * 0.95;
  for (const l of lines) { g.fillText(l, M - 4, y); y += ns * 0.98; }
  // accent rule in the product colour
  g.fillStyle = accentFor(item.color); g.fillRect(M, y - ns * 0.98 + 44, 170, 12);
  g.fillStyle = INK;
  // numbers, bottom-up
  const nums = (item.numbers || []).slice(0, 2);
  let by = H - 96;
  for (let i = nums.length - 1; i >= 0; i--) {
    const [n, label] = nums[i];
    g.font = `500 40px ${SANS}`;
    let lab = label; while (g.measureText(lab).width > maxW && lab.length > 8) lab = lab.slice(0, -2);
    if (lab !== label) lab = lab.trim() + '…';
    g.fillText(lab, M, by); by -= 54;
    const sz = fitFont(g, n, SERIF, 400, 190, maxW);
    g.font = `400 ${sz}px ${SERIF}`; g.fillText(n, M - 6, by);
    by -= sz * 0.84 + 48;
    if (i > 0) { g.fillRect(M, by + 8, maxW, 5); by -= 40; }
  }
  return cv;
}

// ---------- geometry ----------
function slabGeometry() {
  // Rounded box: segments are packed into the rounding band near each edge, then projected onto the radius,
  // with analytic normals so the faces meet without seams.
  const r = 0.075, k = 6, n = 2 * k + 1;
  const dims = [SLAB_W, SLAB_H, SLAB_D];
  const geo = new THREE.BoxGeometry(SLAB_W, SLAB_H, SLAB_D, n, n, n);
  const pos = geo.attributes.position, nor = geo.attributes.normal;
  const v = new THREE.Vector3(), inner = new THREE.Vector3(), d = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const c = [v.x, v.y, v.z];
    for (let a = 0; a < 3; a++) {
      const half = dims[a] / 2; const j = Math.round((c[a] + half) / (dims[a] / n));
      if (j <= k) c[a] = -half + r * (j / k);
      else if (j >= n - k) c[a] = half - r * ((n - j) / k);
      else c[a] = (j - n / 2) / 1 * 0; // the single middle segment collapses onto the flat span
      if (j > k && j < n - k) c[a] = 0;
    }
    // map the middle (flat) span: vertices at j==k / j==n-k already sit at the band edges
    v.set(c[0], c[1], c[2]);
    inner.set(clamp(v.x, -dims[0] / 2 + r, dims[0] / 2 - r), clamp(v.y, -dims[1] / 2 + r, dims[1] / 2 - r), clamp(v.z, -dims[2] / 2 + r, dims[2] / 2 - r));
    d.subVectors(v, inner);
    const L = d.length();
    if (L > 1e-6) { d.multiplyScalar(1 / L); v.copy(inner).addScaledVector(d, r); nor.setXYZ(i, d.x, d.y, d.z); }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true; nor.needsUpdate = true;
  return geo;
}

// Seamless studio sweep: floor at y=0 curving up into a back wall.
function cycloramaGeometry() {
  const segX = 1, segL = 90, width = 60;
  const pts = []; // profile (z, y)
  const zFront = 14, zCurve = -5, R = 4.5, wallH = 22;
  const nFloor = 30, nCurve = 30, nWall = 30;
  for (let i = 0; i <= nFloor; i++) pts.push([zFront + (zCurve - zFront) * (i / nFloor), 0]);
  for (let i = 1; i <= nCurve; i++) { const a = (i / nCurve) * Math.PI / 2; pts.push([zCurve - Math.sin(a) * R, R - Math.cos(a) * R]); }
  for (let i = 1; i <= nWall; i++) pts.push([zCurve - R, R + (wallH - R) * (i / nWall)]);
  const pos = []; const idx = [];
  for (let i = 0; i < pts.length; i++) { pos.push(-width / 2, pts[i][1], pts[i][0], width / 2, pts[i][1], pts[i][0]); }
  for (let i = 0; i < pts.length - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  void segX; void segL;
  return geo;
}

const N_MAX = 12;
const floorVert = `
varying vec3 vW;
void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`;
const floorFrag = `
uniform vec4 uA[${N_MAX}]; uniform vec4 uB[${N_MAX}]; uniform float uT; uniform vec3 uFloor; uniform vec3 uWall; uniform vec3 uSky; uniform vec3 uWarm;
varying vec3 vW;
float caus(vec2 p, float t){
  // a light web: two warped ridge fields multiplied, sharpened
  vec2 w = p + 0.6 * vec2(sin(p.y * 1.3 + t), cos(p.x * 1.1 - t * 0.8));
  float a = 1.0 - abs(sin(w.x * 1.6 + sin(w.y * 1.2 + t * 0.7)));
  float b = 1.0 - abs(sin(w.y * 1.9 + sin(w.x * 1.4 - t * 0.6)));
  float c = 1.0 - abs(sin((w.x - w.y) * 1.3 + t * 0.5));
  return pow(max(a, b) * 0.8 + c * 0.25, 7.0);
}
void main(){
  float y = vW.y;
  vec3 col = mix(uFloor, uWall, smoothstep(0.0, 4.2, y));
  col = mix(col, uSky, smoothstep(3.5, 13.0, y));
  // soft light pool on the floor + faint falloff toward the edges
  float pool = exp(-dot(vW.xz - vec2(0.0, 0.8), vW.xz - vec2(0.0, 0.8)) * 0.018);
  col = mix(col * 0.965, col, pool);
  col += uWarm * 0.06 * exp(-dot(vW.xz - vec2(0.5, 1.5), vW.xz - vec2(0.5, 1.5)) * 0.06) * (1.0 - smoothstep(0.0, 1.0, y));
  float shade = 0.0; vec3 light = vec3(0.0);
  float onFloor = 1.0 - smoothstep(0.2, 2.2, y);
  for (int k = 0; k < ${N_MAX}; k++) {
    vec4 a = uA[k]; vec4 b = uB[k];
    if (b.w <= 0.001) continue;
    vec2 X = a.zw; vec2 P = vec2(-X.y, X.x);
    float h = b.z; float blur = 0.22 + h * 0.18;
    // soft pale shadow under the slab
    vec2 q = vW.xz - a.xy;
    vec2 e = vec2(dot(q, X) / (${(SLAB_W / 2).toFixed(3)} + blur), dot(q, P) / (0.32 + blur));
    float r = length(e);
    float m = 1.0 - smoothstep(0.35, 1.05, r);
    shade += m * 0.2 * b.w;
    // the caustic: a slab of glass focuses light into a bright outline of itself, with a slow web inside
    vec2 q2 = vW.xz - (a.xy + b.xy);
    vec2 lp = vec2(dot(q2, X), dot(q2, P));
    vec2 hb = vec2(${(SLAB_W * 0.42).toFixed(3)}, 0.26 + h * 0.12);
    vec2 dq = abs(lp) - hb + 0.14;
    float sd = length(max(dq, 0.0)) + min(max(dq.x, dq.y), 0.0) - 0.14;
    if (sd > 0.35) continue;
    float edgeW = 0.04 + h * 0.025;
    float edge = exp(-(sd * sd) / (edgeW * edgeW));
    float inside = 1.0 - smoothstep(-0.02, 0.03, sd);
    vec2 cp = lp * 5.0 + float(k) * 3.7;
    float t = uT * 0.3 + float(k) * 1.7;
    float cg = caus(cp, t);
    float cr = caus(cp * 1.006 + vec2(0.02, 0.01), t);
    vec3 web = vec3(cr, cg, mix(cg, cr, 0.4)) * inside;
    float fr = (sd - 0.02) / (0.09 + h * 0.03);
    vec3 spec = clamp(vec3(1.0 - abs(fr - 0.2) * 2.6, 1.0 - abs(fr - 0.5) * 2.6, 1.0 - abs(fr - 0.8) * 2.6), 0.0, 1.0);
    spec *= step(0.0, fr) * step(fr, 1.0) * smoothstep(-0.2, 0.6, dot(normalize(lp + 1e-4), vec2(0.0, 1.0)));
    light += (web * 0.7 + vec3(1.0, 0.985, 0.95) * (edge * 0.32 + inside * 0.1) + spec * 0.3) * b.w;
  }
  col *= 1.0 - shade * onFloor;
  col += light * onFloor;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

function buildEnvironment(renderer) {
  const scene = new THREE.Scene();
  const disp = [];
  const skyGeo = new THREE.SphereGeometry(60, 48, 24);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `varying vec3 vP; void main(){ float h = vP.y;
      vec3 top = vec3(1.25,1.28,1.32); vec3 hor = vec3(0.80,0.87,0.95); vec3 bot = vec3(0.62,0.65,0.70);
      vec3 c = h > 0.0 ? mix(hor, top, pow(h, 0.6)) : mix(hor, bot, pow(-h, 0.5));
      gl_FragColor = vec4(c, 1.0); }`,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat)); disp.push(skyGeo, skyMat);
  const box = (w, h, color, pos, look) => {
    const g = new THREE.PlaneGeometry(w, h); const m = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(g, m); mesh.position.set(...pos); mesh.lookAt(...look); scene.add(mesh); disp.push(g, m);
  };
  const hot = new THREE.Color().setRGB(7, 7, 7.2);
  const warm = new THREE.Color().setRGB(6, 5.4, 4.6);
  box(18, 6, hot, [0, 22, 2], [0, 0, 0]);          // overhead softbox
  box(3, 22, warm, [-20, 6, 6], [0, 2, 0]);        // left strip
  box(3, 22, hot, [20, 6, -2], [0, 2, 0]);         // right strip
  box(26, 8, new THREE.Color().setRGB(3, 3.2, 3.5), [0, 8, -24], [0, 4, 0]); // back sweep glow
  const black = new THREE.Color(0x05070a);
  box(10, 26, black, [-24, 4, -8], [0, 4, 0]);     // black flags give the glass its edges
  box(10, 26, black, [24, 4, 10], [0, 4, 0]);
  box(30, 4, new THREE.Color(0x11161c), [0, -3, 24], [0, 2, 0]);
  box(16, 12, new THREE.Color().setRGB(2.6, 2.7, 2.9), [-9, 9, 22], [0, 2, 0]);   // big diffuser behind the viewer
  box(1.2, 16, new THREE.Color().setRGB(9, 9, 9.3), [-6.5, 5, 18], [0, 3, 0]);    // two thin strips: the streaks that slide over the faces
  box(1.2, 16, new THREE.Color().setRGB(8, 7.6, 7), [7.5, 5, 17], [0, 3, 0]);
  box(6, 14, new THREE.Color(0x0a0d12), [10, 6, 22], [0, 2, 0]);                 // dark flag behind the viewer
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(scene, 0.015);
  pmrem.dispose();
  for (const d of disp) d.dispose();
  return rt;
}


// A generic engraved pane: kicker, title, a big numeral/number, a few lines, and optional cracks + annulment.
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];
const CANVAS_W = 900, CANVAS_H = Math.round(900 * SLAB_H / SLAB_W * 0.94 / 0.9);
function plateCanvas(spec, cv) {
  cv = cv || document.createElement('canvas');
  cv.width = CANVAS_W; cv.height = CANVAS_H;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, CANVAS_W, CANVAS_H);
  let W = CANVAS_W, H = CANVAS_H;
  if (spec.landscape) { g.save(); g.translate(CANVAS_W, 0); g.rotate(Math.PI / 2); W = CANVAS_H; H = CANVAS_W; }
  const M = 78, maxW = W - M * 2;
  g.fillStyle = INK; g.strokeStyle = INK;
  g.lineWidth = 6; g.beginPath(); g.roundRect(34, 34, W - 68, H - 68, 28); g.stroke();
  let y = 132;
  if (spec.kicker) {
    g.font = `500 34px ${SANS}`; if ('letterSpacing' in g) g.letterSpacing = '5px';
    let k = spec.kicker.toUpperCase(); while (g.measureText(k).width > maxW && k.length > 4) k = k.slice(0, -2);
    g.fillStyle = spec.kickerColor || INK; g.fillText(k, M, y); g.fillStyle = INK;
    if ('letterSpacing' in g) g.letterSpacing = '0px';
    y += 30;
  }
  const titleLines = [];
  if (spec.title) {
    let ts = spec.titleSize || 120; g.font = `400 ${ts}px ${SERIF}`;
    let lines = wrapLines(g, spec.title, maxW);
    const maxL = spec.titleLines || 3;
    while ((lines.length > maxL || lines.some((l) => g.measureText(l).width > maxW)) && ts > 44) { ts -= 6; g.font = `400 ${ts}px ${SERIF}`; lines = wrapLines(g, spec.title, maxW); }
    y += ts * 0.92;
    for (const l of lines) { g.fillText(l, M - 3, y); titleLines.push([y, g.measureText(l).width, ts]); y += ts * 1.0; }
    if (spec.accent) { g.fillStyle = spec.accent; g.fillRect(M, y - ts + 40, 170, 12); g.fillStyle = INK; y += 40; }
  }
  if (spec.lines) {
    y += 30;
    g.font = `400 ${spec.lineSize || 38}px ${SANS}`;
    for (const t of spec.lines) {
      for (const l of wrapLines(g, t, maxW)) { if (y > H - (spec.big ? 380 : 140)) break; g.fillText(l, M, y); y += (spec.lineSize || 38) * 1.32; }
      y += 10;
    }
  }
  if (spec.nums) {
    // two engraved numbers, bottom-up
    let by = H - 96;
    for (let i = spec.nums.length - 1; i >= 0; i--) {
      const [n, label] = spec.nums[i];
      g.font = `500 40px ${SANS}`;
      let lab = label; while (g.measureText(lab).width > maxW && lab.length > 8) lab = lab.slice(0, -2);
      if (lab !== label) lab = lab.trim() + '…';
      g.fillText(lab, M, by); by -= 54;
      const sz = fitFont(g, n, SERIF, 400, spec.numSize || 190, maxW);
      g.font = `400 ${sz}px ${SERIF}`; g.fillText(n, M - 6, by);
      by -= sz * 0.84 + 48;
      if (i > 0) { g.fillRect(M, by + 8, maxW, 5); by -= 40; }
    }
  } else if (spec.big) {
    const sz = fitFont(g, spec.big, SERIF, 400, spec.bigSize || 300, maxW);
    g.font = `400 ${sz}px ${SERIF}`; g.fillText(spec.big, M - 8, H - (spec.foot ? 150 : 110));
  }
  if (spec.foot) { g.font = `500 34px ${SANS}`; g.fillText(spec.foot, M, H - 84); }
  if (spec.annul && titleLines.length) {
    // the claim is struck through, in red, and stays legible underneath
    g.strokeStyle = '#b5452a'; g.lineWidth = 9; g.lineCap = 'round';
    for (const [ly, lw, ts] of titleLines) { g.beginPath(); g.moveTo(M - 14, ly - ts * 0.3); g.lineTo(M + lw + 14, ly - ts * 0.36); g.stroke(); }
    g.strokeStyle = INK;
  }
  if (spec.cracked) {
    // a fracture engraved through the pane: a seeded branching line from an impact point
    let seed = spec.cracked * 9301 + 49297;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const ox = W * (0.55 + rnd() * 0.25), oy = H * (0.32 + rnd() * 0.2);
    g.strokeStyle = 'rgba(16,27,39,0.85)'; g.lineCap = 'round';
    const branch = (x, yy, ang, len, wdt, depth) => {
      let px = x, py = yy;
      const steps = 6 + Math.floor(rnd() * 5);
      g.lineWidth = wdt; g.beginPath(); g.moveTo(px, py);
      for (let s = 0; s < steps; s++) {
        ang += (rnd() - 0.5) * 0.7; const d = len / steps;
        px += Math.cos(ang) * d; py += Math.sin(ang) * d; g.lineTo(px, py);
        if (depth < 2 && rnd() < 0.22) { g.stroke(); branch(px, py, ang + (rnd() < 0.5 ? -0.8 : 0.8), len * 0.45, wdt * 0.7, depth + 1); g.lineWidth = wdt; g.beginPath(); g.moveTo(px, py); }
      }
      g.stroke();
    };
    for (let r = 0; r < 7; r++) branch(ox, oy, r / 7 * Math.PI * 2 + rnd() * 0.5, 260 + rnd() * 420, 4, 0);
    g.lineWidth = 3; g.beginPath(); g.arc(ox, oy, 26, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = INK;
  }
  if (spec.landscape) g.restore();
  return cv;
}

const SECTIONS = [['arrival', 'Arrival'], ['work', 'Work'], ['how', 'How I work'], ['withdrawn', 'Claims I withdrew'], ['capabilities', 'Capabilities'], ['about', 'About'], ['contact', 'Contact']];
const N_PLATE = 4;

export default {
  id: 'hire',
  color: '#eef3f8',
  async mount(root, ctx) {
    const listeners = [];
    const on = (t, type, fn, opts) => { t.addEventListener(type, fn, opts); listeners.push([t, type, fn, opts]); };
    let raf = 0; let alive = true; const timers = [];

    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = FONT_HREF; document.head.appendChild(link);
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

    const reduced = !!ctx.reduced;
    const audience = ctx.audience === 'eval' ? 'eval' : 'hire';
    const isEval = audience === 'eval';
    const wrap = el('div', 'pg-root' + (isEval ? ' pg-eval' : '') + (reduced ? '' : ' pg-pre pg-prehint')); root.appendChild(wrap);
    const org = (ctx.org || '').trim().slice(0, 48);
    const P = ctx.person;

    // ---------- order: the lead product sits at the centre of the deck ----------
    const bySlug = Object.fromEntries(ctx.work.map((w) => [w.slug, w]));
    const byName = Object.fromEntries(ctx.work.map((w) => [w.name, w]));
    const pref = isEval
      ? ['vvdex-platform', 'vvdex-trading', 'vvdex-engine', 'conxto', 'unboundpdf', 'pitchradar', 'farmquick', 'conxfolio']
      : ['conxto', 'vvdex-platform', 'vvdex-engine', 'farmquick', 'pitchradar', 'unboundpdf', 'vvdex-trading', 'conxfolio'];
    const ranked = [...pref.filter((s) => bySlug[s]).map((s) => bySlug[s]), ...ctx.work.filter((w) => !pref.includes(w.slug))].slice(0, 8);
    const N = ranked.length;
    const order = new Array(N); const centre = Math.floor((N - 1) / 2);
    ranked.forEach((w, r) => { const off = r === 0 ? 0 : (r % 2 ? Math.ceil(r / 2) : -r / 2); order[clamp(centre + off, 0, N - 1)] = w; });
    for (let i = 0, j = 0; i < N; i++) if (!order[i]) { while (order.includes(ranked[j])) j++; order[i] = ranked[j]; }
    const idxOf = Object.fromEntries(order.map((w, i) => [w.slug, i]));
    const withdrawnBySlug = { 'vvdex-trading': ctx.withdrawn[0], 'vvdex-platform': ctx.withdrawn[1] };
    const mailSubject = (isEval ? 'AI evaluation role' : 'AI role') + (org ? ` at ${org}` : '') + ' — from your portfolio';
    const mailHref = `mailto:${P.email}?subject=${encodeURIComponent(mailSubject)}`;

    const mkA = (href, text, ext, cls) => { const a = el('a', cls || null, text, { href }); if (ext) { a.target = '_blank'; a.rel = 'noopener'; } return a; };

    // ---------- HTML layer ----------
    const ui = el('div', 'pg-ui'); wrap.appendChild(ui);

    // arrival
    const intro = el('div', 'pg-intro pg-fade'); ui.appendChild(intro);
    const idLine = el('p', 'pg-id'); idLine.append(el('b', null, P.name), document.createTextNode(` · ${P.role} · ${P.city}`)); intro.appendChild(idLine);
    const h1 = el('h1', 'pg-h1'); const q = el('span'); q.style.display = 'block';
    if (isEval) {
      q.append(document.createTextNode('Hiring for AI evaluation'));
      if (org) { q.append(document.createTextNode(' at ')); q.append(el('em', null, org)); }
      q.append(document.createTextNode('?'));
      h1.append(q, el('span', 'pg-l2', 'I’m open to AI evaluation roles.'));
    } else {
      q.append(document.createTextNode(org ? 'Hiring at ' : 'Hiring for AI?'));
      if (org) { q.append(el('em', null, org)); q.append(document.createTextNode('?')); }
      h1.append(q, el('span', 'pg-l2', 'I’m open to AI roles.'));
    }
    intro.appendChild(h1);
    const wantsEl = el('p', 'pg-wants', P.wants); intro.appendChild(wantsEl);
    let heldEl = null;
    if (isEval && bySlug['vvdex-platform']) {
      heldEl = el('div', 'pg-heldwrap');
      heldEl.appendChild(el('p', 'pg-held-h', 'What every pass rate on VVDex Platform is held to'));
      const ul = el('ul', 'pg-held'); for (const c of bySlug['vvdex-platform'].checks) ul.appendChild(el('li', null, c)); heldEl.appendChild(ul);
      intro.appendChild(heldEl);
    }

    const contact = el('div', 'pg-contact pg-fade'); ui.appendChild(contact);
    contact.appendChild(el('span', 'pg-avail', P.availability));
    [mkA(mailHref, P.email, 0, 'pg-ul'), mkA(P.linkedin, 'LinkedIn', 1, 'pg-ul'), mkA(P.github, 'GitHub', 1, 'pg-ul')].forEach((a, i) => { if (i) contact.appendChild(el('br')); contact.appendChild(a); });

    // work heading (route #work)
    const workHead = el('div', 'pg-workhead pg-fade pg-off'); ui.appendChild(workHead);
    workHead.appendChild(el('h2', null, 'Work'));
    workHead.appendChild(el('p', null, 'Eight products, each a slab of glass with its name and numbers etched inside. Turn the deck, or open one for its full case.'));
    const workList = el('ul', 'pg-worklist'); workHead.appendChild(workList);
    for (const w of ranked) { const li = el('li'); const a = el('a', null, null, { href: `#work/${w.slug}` }); a.append(el('b', null, w.name), el('span', null, w.kind)); li.appendChild(a); workList.appendChild(li); }

    // withdrawn teaser (eval arrival)
    let wdBlock = null;
    if (isEval && ctx.withdrawn.length) {
      wdBlock = el('section', 'pg-wd pg-fade', null, { 'aria-label': 'Claims I withdrew myself' }); ui.appendChild(wdBlock);
      const head = el('div', 'pg-wd-head'); wdBlock.appendChild(head);
      head.append(el('h2', null, 'Claims I withdrew myself'), mkA('#withdrawn', 'Why they came down →', 0, 'pg-ul'));
      for (const w of ctx.withdrawn) {
        const it = el('div', 'pg-wd-item'); it.appendChild(el('h3', null, w.title));
        const nums = el('div', 'pg-wd-nums');
        for (const [n, l] of w.numbers) { const s = el('span'); s.append(el('b', null, n), document.createTextNode(l)); nums.appendChild(s); }
        it.appendChild(nums);
        if (w.link) it.appendChild(mkA(w.link[1], w.link[0] + ' ↗', 1, 'pg-ul'));
        wdBlock.appendChild(it);
      }
    }

    // caption under the deck: the slab in focus
    const cap = el('p', 'pg-cap pg-fade'); ui.appendChild(cap);
    const capName = el('span', 'pg-cap-name'); const capKind = el('span', 'pg-cap-kind'); const capOne = el('span', 'pg-cap-one');
    const capOpen = el('a', 'pg-cap-open', 'Open the case →', { href: '#work' });
    const capHint = el('span', 'pg-cap-hint'); capHint.append(el('i', null, 'Eight products, in glass. '), document.createTextNode(ctx.isTouch ? 'Swipe to turn the deck · tap a slab' : 'Drag to turn the deck · click a slab'));
    const capTop = el('span'); capTop.append(capName, capKind);
    cap.append(capTop, capOne, capOpen, capHint);
    let capFor = -1;
    function setCaption(i) {
      if (i === capFor || !order[i]) return; capFor = i;
      const w = order[i]; capName.textContent = w.name; capKind.textContent = w.kind; capOne.textContent = w.one; capOpen.href = `#work/${w.slug}`;
      capOpen.setAttribute('aria-label', `Open the case for ${w.name}`);
    }

    // the index
    const mkIndex = () => {
      const nav = el('nav', null, null, { 'aria-label': 'Index' });
      nav.appendChild(el('p', 'pg-index-h', 'Index'));
      const ul = el('ul', 'pg-index'); nav.appendChild(ul);
      for (const [k, label] of SECTIONS) { const li = el('li'); li.appendChild(el('a', null, label, { href: '#' + k, 'data-r': k })); ul.appendChild(li); }
      return nav;
    };
    const indexNav = mkIndex(); indexNav.className = 'pg-index-wrap pg-fade';
    const ixStyle = indexNav; ixStyle.style.position = 'absolute'; ixStyle.style.left = '56px'; ixStyle.style.bottom = '28px';
    indexNav.querySelector('.pg-index').style.position = 'static';
    ui.appendChild(indexNav);

    // phone: sheet under the deck, bottom bar, index sheet
    const sheet = el('div', 'pg-sheet pg-fade', null, { 'aria-label': 'Introduction' }); ui.appendChild(sheet);
    const bar = el('div', 'pg-bar'); ui.appendChild(bar);
    const ixBtn = el('button', null, 'Index', { type: 'button', 'aria-expanded': 'false' });
    bar.append(ixBtn, mkA(mailHref, 'Email', 0, 'pg-ul'), mkA(P.linkedin, 'LinkedIn', 1, 'pg-ul'), mkA(P.github, 'GitHub', 1, 'pg-ul'));
    const ixSheet = el('div', 'pg-ixsheet pg-fade pg-off'); ixSheet.appendChild(mkIndex()); ui.appendChild(ixSheet);
    const toggleIx = (open) => { ixSheet.classList.toggle('pg-off', !open); ixBtn.setAttribute('aria-expanded', String(open)); };
    on(ixBtn, 'click', () => toggleIx(ixSheet.classList.contains('pg-off')));
    on(ixSheet, 'click', (e) => { if (e.target.closest('a')) toggleIx(false); });

    // reading surface
    const panel = el('aside', 'pg-panel', null, { 'aria-hidden': 'true', tabindex: '-1' }); ui.appendChild(panel);

    // staged reveal of the type while the deck rises
    const rv = [idLine, q, h1.lastChild, wantsEl, ...(heldEl ? [heldEl] : []), ...contact.children, ...(wdBlock ? wdBlock.children : []), indexNav];
    rv.forEach((n, i) => { n.classList.add('pg-rv'); n.style.transitionDelay = (0.25 + Math.min(i, 9) * 0.09) + 's'; });

    // fonts for the etched layer
    try {
      await Promise.race([
        Promise.all([document.fonts.load(`400 120px ${SERIF}`), document.fonts.load(`italic 400 40px ${SERIF}`), document.fonts.load(`500 40px ${SANS}`), document.fonts.load(`400 38px ${SANS}`)]),
        new Promise((r) => setTimeout(r, 2600)),
      ]);
    } catch (e) { /* fall back to local faces */ }
    if (!alive) return () => {};

    // ---------- three ----------
    const canvas = el('canvas', 'pg-gl', null, { tabindex: '0', 'aria-label': 'Eight glass slabs, one per product. Arrow keys turn the deck, Enter opens a case.' });
    wrap.insertBefore(canvas, ui);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const envRT = buildEnvironment(renderer);
    scene.environment = envRT.texture;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);
    const disposables = [];

    const cyc = cycloramaGeometry();
    const floorUniforms = {
      uA: { value: Array.from({ length: N_MAX }, () => new THREE.Vector4()) },
      uB: { value: Array.from({ length: N_MAX }, () => new THREE.Vector4()) },
      uT: { value: 0 },
      uFloor: { value: new THREE.Color('#d8e1ea') }, uWall: { value: new THREE.Color('#f1f5f9') },
      uSky: { value: new THREE.Color('#dbe9f6') }, uWarm: { value: new THREE.Color('#fff1dc') },
    };
    const cycMat = new THREE.ShaderMaterial({ uniforms: floorUniforms, vertexShader: floorVert, fragmentShader: floorFrag });
    scene.add(new THREE.Mesh(cyc, cycMat)); disposables.push(cyc, cycMat);

    const slabGeo = slabGeometry(); disposables.push(slabGeo);
    const textGeo = new THREE.PlaneGeometry(SLAB_W * 0.9, SLAB_W * 0.9 * (CANVAS_H / CANVAS_W)); disposables.push(textGeo);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const mkTex = (cv) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, maxAniso); return t; };

    function makeSlab(tintHex, userData) {
      const group = new THREE.Group(); group.rotation.order = 'YXZ';
      const tint = new THREE.Color('#ffffff').lerp(new THREE.Color(tintHex), 0.16);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 1, thickness: 1.5, ior: 1.5,
        dispersion: 0, attenuationColor: tint, attenuationDistance: 2.4,
        specularIntensity: 1, envMapIntensity: 1.15, clearcoat: 0.4, clearcoatRoughness: 0.05,
      });
      mat.onBeforeCompile = (sh) => {
        // thick glass goes dark and green-blue where you look through its edges
        sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>',
          'float pgE = pow(1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0), 2.2);\n' +
          'outgoingLight *= mix(vec3(1.0), vec3(0.30, 0.42, 0.46), pgE * 0.9);\n#include <opaque_fragment>');
      };
      const slab = new THREE.Mesh(slabGeo, mat); Object.assign(slab.userData, userData); group.add(slab);
      const tmat = new THREE.MeshBasicMaterial({ transparent: false, alphaTest: 0.02, alphaToCoverage: true, side: THREE.DoubleSide });
      const uEtch = { value: 1 };
      tmat.onBeforeCompile = (sh) => {
        sh.uniforms.uEtch = uEtch;
        sh.fragmentShader = 'uniform float uEtch;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb = mix(vec3(0.80, 0.86, 0.92), diffuseColor.rgb, uEtch);');
      };
      const text = new THREE.Mesh(textGeo, tmat); text.position.z = 0.02; group.add(text);
      scene.add(group);
      disposables.push(mat, tmat);
      return {
        group, slab, text, tmat, uEtch, etch: 1, sc: 1, tsc: 1,
        p: new THREE.Vector3(0, -3, 0), v: new THREE.Vector3(), r: new THREE.Vector3(), rv: new THREE.Vector3(),
        tp: new THREE.Vector3(), tr: new THREE.Vector3(), tilt: new THREE.Vector2(), tiltT: new THREE.Vector2(),
      };
    }
    const cards = order.map((w, i) => {
      const c = makeSlab(w.color, { i });
      c.i = i; c.w = w; c.tex = mkTex(etchedCanvas(w)); c.tmat.map = c.tex; disposables.push(c.tex);
      return c;
    });
    // the case pane: one canvas re-engraved per chapter, lent to whichever slab is open
    const chapterCv = document.createElement('canvas'); const chapterTex = mkTex(plateCanvas({ title: ' ' }, chapterCv)); disposables.push(chapterTex);
    // four free panes for the other rooms
    const plates = Array.from({ length: N_PLATE }, (_, j) => {
      const c = makeSlab('#cfe2f2', { plate: j });
      c.j = j; c.cv = document.createElement('canvas'); c.tex = null; c.on = false; c.group.visible = false; c.p.set(-2, -4, 0);
      return c;
    });

    // ---------- state ----------
    const st = {
      s: centre, sv: 0, sTarget: centre, dragging: false, open: -1, hover: -1, hoverPlate: -1,
      route: 'arrival', chapter: 0, chapters: [], activeItem: -1,
      t0: performance.now(), last: performance.now(), time: 0, phone: false, w: 1, h: 1,
      deckX: 0, deckY: 1.55, pr: 0, openY: 2.6,
    };
    const introDur = 2.6;
    if (reduced) st.t0 -= 10000;

    function screenToWorldY(sy, z) {
      const ndcY = 1 - 2 * sy / st.h;
      const r = new THREE.Ray(); r.origin.setFromMatrixPosition(camera.matrixWorld);
      r.direction.set(0, ndcY, 0.5).unproject(camera).sub(r.origin).normalize();
      const tt = (z - r.origin.z) / r.direction.z;
      return r.origin.y + r.direction.y * tt;
    }

    function layout() {
      const w = root.clientWidth || innerWidth, h = root.clientHeight || innerHeight;
      st.w = w; st.h = h;
      const phone = w < 720;
      st.phone = phone;
      wrap.classList.toggle('pg-phone', phone);
      // phone: the long copy moves into a small scrolling sheet under the deck
      if (phone) { sheet.append(cap, wantsEl); if (heldEl) sheet.append(heldEl); if (wdBlock) sheet.append(wdBlock); }
      else { intro.append(wantsEl); if (heldEl) intro.append(heldEl); ui.insertBefore(cap, panel); if (wdBlock) ui.insertBefore(wdBlock, cap); }
      if (!st.pr) st.pr = Math.min(devicePixelRatio || 1, phone ? 2 : 1.5);
      renderer.setPixelRatio(st.pr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      if (phone) {
        camera.fov = 38;
        camera.clearViewOffset();
        const top = intro.getBoundingClientRect().bottom - root.getBoundingClientRect().top + 14;
        const bottom = h * 0.74 - 46 - 26;
        const avail = Math.max(150, bottom - top);
        const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const dist = clamp((SLAB_H * 1.18) * h / (2 * tanH * avail), 7, 14);
        camera.position.set(0, 1.5 + dist * 0.05, dist);
        camera.lookAt(0, 1.5, 0);
        camera.updateProjectionMatrix(); camera.updateMatrixWorld();
        st.deckX = 0; st.deckY = screenToWorldY((top + bottom) / 2, 0);
        st.openY = screenToWorldY((80 + h * 0.42) / 2, -0.9);
      } else {
        camera.fov = 30;
        camera.position.set(0, 2.1, 9.0);
        camera.lookAt(0, 1.45, 0);
        const shift = Math.min(0.17, Math.max(0.08, (w - 900) / 4000 + 0.12));
        camera.setViewOffset(w, h, -shift * w, -0.015 * h, w, h);
        st.deckX = 0; st.deckY = isEval ? 1.74 : 1.62;
      }
      camera.updateProjectionMatrix(); camera.updateMatrixWorld();
      if (!phone) {
        const hp = new THREE.Vector3(st.deckX, st.deckY - SLAB_H / 2 - 0.22, 0.6).project(camera);
        cap.style.left = ((hp.x + 1) / 2 * w) + 'px'; cap.style.top = ((1 - hp.y) / 2 * h) + 'px';
      } else { cap.style.left = ''; cap.style.top = ''; }
    }

    // ---------- poses ----------
    function fanPose(c, k, t, outP, outR) {
      const riseT = reduced ? 1 : clamp((t - 0.15 - c.i * 0.07) / 1.5, 0, 1);
      const rise = -3.4 * (1 - ease.outCubic(riseT));
      const spread = reduced ? 1 : ease.inOutCubic(clamp((t - 0.75) / 1.55, 0, 1));
      const kk = k * spread;
      const ak = Math.abs(kk);
      const focus = Math.max(0, 1 - ak);
      if (!st.phone) {
        const th = 0.4 * kk / (1 + 0.3 * ak);
        const R = 3.5;
        outP.set(st.deckX + R * Math.sin(th), st.deckY + rise - (1 - Math.cos(th)) * 1.3 + focus * 0.1, R * Math.cos(th) - R + focus * 0.45 - ak * 0.3 - (1 - spread) * c.i * 0.25);
        outR.set(0, th * 0.62, -th * 0.2);
      } else {
        const sg = Math.sign(kk); const off = Math.pow(ak, 0.75);
        outP.set(st.deckX, st.deckY + rise - sg * off * 0.2, -off * 0.62 + focus * 0.25 - (1 - spread) * c.i * 0.12);
        outR.set(sg * off * 0.07, 0, -kk * 0.025);
      }
      if (!reduced) {
        outP.y += Math.sin(st.time * 0.7 + c.i * 1.3) * 0.025 * spread;
        outR.y += Math.sin(st.time * 0.45 + c.i) * 0.02 * spread;
      }
    }
    function openPose(c, outP, outR) {
      if (c.i === st.open) {
        const turn = (st.chapter % 2 ? -0.09 : 0.09) + st.chapter * 0.015;
        if (!st.phone) { outP.set(-2.05, 1.66, 1.5); outR.set(0, 0.36 + turn - Math.PI * 2, -0.02); }
        else { outP.set(0, st.openY, -0.9); outR.set(0.04, 0.24 + turn - Math.PI * 2, 0); }
      } else pilePose(c, c.i - st.open, outP, outR);
    }
    function pilePose(c, ki, outP, outR) {
      if (!st.phone) { outP.set(-1.2 + ki * 0.17, 1.42 - Math.abs(ki) * 0.03, -2.6 - Math.abs(ki) * 0.2); outR.set(0, 0.46 + ki * 0.05, -ki * 0.035); }
      else { outP.set(0.3 + ki * 0.06, st.openY - 0.1, -3.6 - Math.abs(ki) * 0.15); outR.set(0, 0.4 + ki * 0.05, -ki * 0.03); }
    }
    // where the free panes stand in each room
    function platePose(pl, outP, outR) {
      const j = pl.j, r = st.route, ph = st.phone, y0 = ph ? st.openY : 1.62, z0 = ph ? -0.9 : 0.4;
      const idle = reduced ? 0 : Math.sin(st.time * 0.6 + j * 1.7) * 0.03;
      let s = 1;
      if (r === 'how' && j < 3) {
        s = ph ? 0.7 : 0.9;
        outP.set(ph ? (j - 1) * 1.0 : -3.6 + j * 1.27, y0 + idle + (ph ? 0 : (j - 1) * -0.06), z0 + (ph ? 0 : -Math.abs(j - 1) * 0.15));
        outR.set(0, ph ? (1 - j) * 0.12 : 0.22 - j * 0.04, 0);
      } else if (r === 'withdrawn' && j < 2) {
        s = ph ? 0.88 : 1.04;
        outP.set(ph ? (j ? 0.64 : -0.64) : (j ? -1.55 : -3.3), y0 + idle + (j ? -0.05 : 0.05), z0 + (j ? 0.2 : 0));
        outR.set(0.02, ph ? (j ? -0.14 : 0.14) : (j ? -0.02 : 0.3), j ? -0.05 : 0.06);
      } else if (r === 'capabilities' && j < 4) {
        s = ph ? 0.56 : 0.8;
        const cx = j % 2, cy = Math.floor(j / 2);
        if (ph) outP.set(-1.14 + j * 0.76, y0 + idle, z0);
        else outP.set(-3.15 + cx * 1.25, 2.38 - cy * 1.62 + idle, z0 - cx * 0.1);
        outR.set(ph ? 0 : (cy ? 0.05 : -0.05), ph ? (1.5 - j) * 0.1 : 0.24 - cx * 0.06, 0);
      } else if (r === 'about' && j === 0) {
        s = ph ? 1.2 : 1.3;
        outP.set(ph ? 0 : -2.45, y0 + idle, z0 + (ph ? 0 : 0.4)); outR.set(0, ph ? 0.1 : 0.24, 0);
      } else if (r === 'contact' && j === 0) {
        s = ph ? 1.2 : 1.3;
        outP.set(ph ? 0 : -2.35, y0 + idle, z0 + (ph ? 0 : 0.5)); outR.set(0, ph ? 0.12 : 0.3, 0);
      } else return false;
      pl.tsc = s;
      return true;
    }

    // ---------- reading surfaces ----------
    const P_ = (t, cls) => el('p', cls || null, t);
    function panelHead(kicker, title, accent, closeTo) {
      const head = el('div', 'pg-p-head');
      const top = el('div', 'pg-p-top'); top.appendChild(el('span', null, kicker));
      const acts = el('div', 'pg-p-acts');
      const ix = el('button', 'pg-x pg-ix', 'Index', { type: 'button' }); ix.addEventListener('click', () => toggleIx(true));
      const x = el('a', 'pg-x', 'Close ✕', { href: '#' + closeTo, 'aria-label': closeTo === 'work' ? 'Close and return to the deck' : 'Close and return to the arrival' });
      acts.append(ix, x); top.appendChild(acts); head.appendChild(top);
      head.appendChild(el('h2', 'pg-p-name', title));
      if (accent) { const bar = el('div', 'pg-p-bar'); bar.style.background = accent; head.appendChild(bar); }
      return head;
    }
    const roman = (i) => ROMAN[i] || String(i + 1);

    function chaptersFor(w) {
      const c = ctx.cases && ctx.cases[w.slug];
      const wd = withdrawnBySlug[w.slug];
      const wdBox = () => {
        if (!wd) return null;
        const box = el('div', 'pg-p-wd'); box.append(el('h4', null, 'A claim I withdrew myself'), el('h5', null, wd.title), P_(wd.what));
        const nn = el('div', 'pg-wd-nums'); for (const [n, l] of wd.numbers) { const s = el('span'); s.append(el('b', null, n), document.createTextNode(l)); nn.appendChild(s); } box.appendChild(nn);
        if (wd.link) box.appendChild(mkA(wd.link[1], wd.link[0] + ' ↗', 1, 'pg-ul'));
        return box;
      };
      const ulOf = (arr) => { const ul = el('ul'); for (const t of arr) ul.appendChild(el('li', null, t)); return ul; };
      const checks = (arr) => { const ul = el('ul', 'pg-p-checks'); for (const t of arr) ul.appendChild(el('li', null, t)); return ul; };
      const numsOf = (arr) => {
        const d = el('div', 'pg-p-nums');
        for (const n of arr) { const x = el('div'); x.append(el('b', null, n.value), el('span', null, n.label)); if (n.date) x.appendChild(el('time', null, n.date, { datetime: n.date })); d.appendChild(x); }
        return d;
      };
      const linksOf = (arr) => { const d = el('div', 'pg-links'); for (const l of arr) d.appendChild(mkA(l.url, l.label + ' ↗', 1, 'pg-ul')); return d; };
      const caseLink = { label: 'The case on vamsivenkatesh.com', url: `${({"vvdex-platform":"https://vvdexops.com/","conxto":"https://conxto.com/","vvdex-engine":"https://lab.vvdexops.com/","unboundpdf":"https://unboundpdf.com/","farmquick":"https://farmquick.in/","conxfolio":"https://conxfolio.com/","pitchradar":"https://github.com/vamsi-venkatesh/pitchradar","vvdex-trading":"https://trading.vvdexops.com/","forecasting":"https://lab.vvdexops.com/forecast/"})[w.slug]}` };
      const defs = {};
      if (c) {
        defs.summary = ['Summary', () => { const f = document.createDocumentFragment(); f.append(P_(c.summary)); if (c.period) f.append(P_(`${c.category} · ${c.status} · ${c.period}`, 'pg-trade')); return f; }];
        defs.role = ['My role', () => P_(c.role)];
        defs.problem = ['The problem', () => P_(c.problem)];
        defs.constraints = ['Constraints', () => ulOf(c.constraints)];
        defs.built = ['What I built', () => { const ul = el('ul'); for (const b of c.built) { const li = el('li'); li.append(el('h4', null, b.title), document.createTextNode(b.body)); ul.appendChild(li); } return ul; }];
        defs.how = ['How it works', () => { const ol = el('ol'); c.how_it_works.forEach((s, i) => { const li = el('li'); const d = el('div'); d.append(el('h4', null, s.step), document.createTextNode(s.body)); li.append(el('i', null, String(i + 1)), d); ol.appendChild(li); }); return ol; }];
        defs.decisions = ['Decisions', () => { const ul = el('ul'); for (const d of c.decisions) { const li = el('li'); li.append(el('h4', null, d.decision), P_(d.why)); if (d.tradeoff) { const t = P_('', 'pg-trade'); t.append(el('b', null, 'Trade-off: '), document.createTextNode(d.tradeoff)); li.appendChild(t); } ul.appendChild(li); } return ul; }];
        defs.evaluation = [isEval ? 'How it was evaluated' : 'Evaluation', () => {
          const f = document.createDocumentFragment();
          for (const e of c.evaluation) { const b = el('div', 'pg-ev'); if (e.date) b.appendChild(el('time', null, e.date, { datetime: e.date })); b.append(el('h4', null, e.what), P_(e.result)); f.appendChild(b); }
          const box = wdBox(); if (box) f.appendChild(box);
          return f;
        }];
        defs.numbers = ['Numbers', () => numsOf(c.numbers)];
        defs.stack = ['Stack', () => { const ul = el('ul', 'pg-stack'); for (const s of c.stack) ul.appendChild(el('li', null, s)); return ul; }];
        defs.limits = ['Limits, said plainly', () => ulOf(c.limits)];
        defs.links = ['Links', () => linksOf([...c.links, caseLink])];
        const ord = isEval
          ? ['summary', 'evaluation', 'numbers', 'decisions', 'limits', 'how', 'built', 'problem', 'constraints', 'role', 'stack', 'links']
          : ['summary', 'role', 'problem', 'constraints', 'built', 'how', 'decisions', 'evaluation', 'numbers', 'stack', 'limits', 'links'];
        return ord.filter((k) => defs[k]).map((k) => ({ key: k, title: defs[k][0], body: defs[k][1] }));
      }
      defs.summary = ['Summary', () => { const f = document.createDocumentFragment(); f.append(P_(w.line), P_(`${w.kind} · ${w.status}` + (w.url ? ` · ${w.host}` : ''), 'pg-trade')); return f; }];
      defs.problem = ['The problem', () => P_(w.problem)];
      defs.plan = ['The plan', () => P_(w.plan)];
      defs.built = ['What I built', () => ulOf(w.built)];
      defs.checks = ['What it is checked against', () => checks(w.checks)];
      const seen = new Set(); const nums = [];
      for (const [v, l] of [...(w.numbers || []), ...(w.stage || [])]) { if (seen.has(v)) continue; seen.add(v); nums.push({ value: v, label: l }); }
      defs.numbers = ['Numbers', () => numsOf(nums)];
      if (wd) defs.withdrawn = ['A claim I withdrew', () => wdBox()];
      defs.links = ['Links', () => linksOf([...(w.url ? [{ label: w.host, url: w.url }] : []), caseLink])];
      const ord = isEval ? ['summary', 'checks', 'numbers', 'withdrawn', 'problem', 'plan', 'built', 'links'] : ['summary', 'problem', 'plan', 'built', 'checks', 'numbers', 'withdrawn', 'links'];
      return ord.filter((k) => defs[k]).map((k) => ({ key: k, title: defs[k][0], body: defs[k][1] }));
    }

    let railBtns = [], railT = null, chapterEls = [];
    function buildCase(i) {
      const w = order[i];
      const c = ctx.cases && ctx.cases[w.slug];
      panel.replaceChildren(); panel.classList.add('pg-wide');
      const head = panelHead(`${w.kind} · ${w.status}`, w.name, accentFor(w.color), 'work');
      head.appendChild(P_(c ? c.one_line : w.one, 'pg-p-line'));
      const chs = chaptersFor(w); st.chapters = chs;
      const rail = el('div', 'pg-rail', null, { role: 'tablist', 'aria-label': 'Chapters' });
      railBtns = chs.map((ch, k) => {
        const b = el('button', null, null, { type: 'button', 'aria-label': `${roman(k)}. ${ch.title}`, title: ch.title });
        b.addEventListener('click', () => { const t = chapterEls[k]; if (t) panel.scrollTo({ top: t.offsetTop - (st.phone ? 54 : 64), behavior: reduced ? 'auto' : 'smooth' }); });
        rail.appendChild(b); return b;
      });
      railT = el('span', 'pg-rail-t'); rail.appendChild(railT);
      panel.appendChild(head);
      const railbar = el('div', 'pg-railbar'); railbar.appendChild(rail); panel.appendChild(railbar);
      chapterEls = chs.map((ch, k) => {
        const sec = el('section', 'pg-ch', null, { 'aria-label': ch.title });
        const h = el('h3', 'pg-ch-h'); h.append(el('i', null, roman(k)), document.createTextNode(ch.title)); sec.appendChild(h);
        const body = ch.body(); if (body) sec.appendChild(body);
        panel.appendChild(sec); return sec;
      });
      const nav = el('div', 'pg-p-nav');
      const prev = order[(i - 1 + N) % N], next = order[(i + 1) % N];
      nav.append(mkA(`#work/${prev.slug}`, '← ' + prev.name), mkA(`#work/${next.slug}`, next.name + ' →'));
      panel.appendChild(nav);
      panel.scrollTop = 0;
      setChapter(0, true);
    }
    function setChapter(k, force) {
      if (!force && k === st.chapter) return;
      st.chapter = k;
      railBtns.forEach((b, n) => b.setAttribute('aria-current', String(n === k)));
      if (railT && st.chapters[k]) railT.textContent = `${roman(k)} · ${st.chapters[k].title}`;
      if (st.open >= 0 && st.chapters[k]) {
        const w = order[st.open];
        plateCanvas({ kicker: w.name, title: st.chapters[k].title, titleSize: 128, accent: accentFor(w.color), big: roman(k), bigSize: 300, foot: `${k + 1} of ${st.chapters.length}` }, chapterCv);
        chapterTex.needsUpdate = true;
      }
    }

    // rooms other than the work
    let itemEls = [];
    function room(kicker, title, lede) {
      panel.replaceChildren(); panel.classList.remove('pg-wide');
      const head = panelHead(kicker, title, null, 'arrival');
      if (lede) head.appendChild(P_(lede, 'pg-sec-lede'));
      panel.appendChild(head); panel.scrollTop = 0;
      itemEls = [];
    }
    const item = (plateIdx, numeral, title, cls) => {
      const d = el('section', 'pg-item' + (cls ? ' ' + cls : '')); if (plateIdx != null) d.dataset.plate = String(plateIdx);
      const h = el('h3'); if (numeral) h.appendChild(el('i', null, numeral)); h.appendChild(document.createTextNode(title)); d.appendChild(h);
      panel.appendChild(d); if (plateIdx != null) itemEls[plateIdx] = d; return d;
    };
    const productLink = (name) => { const w = byName[name]; return w ? mkA(`#work/${w.slug}`, name) : el('span', null, name); };

    function engrave(pl, spec) {
      plateCanvas(spec, pl.cv);
      if (pl.tex) pl.tex.dispose();
      pl.tex = mkTex(pl.cv); pl.tmat.map = pl.tex; pl.tmat.needsUpdate = true;
      const land = !!spec.landscape; pl.slab.rotation.z = land ? Math.PI / 2 : 0; pl.text.rotation.z = land ? Math.PI / 2 : 0;
    }

    function buildRoom(r) {
      if (r === 'how') {
        room('How I work', 'Three things I hold to', null);
        ctx.principles.forEach((p, j) => {
          const d = item(j, roman(j), p.k); d.appendChild(P_(p.v));
          if (j < N_PLATE) engrave(plates[j], { kicker: 'How I work', title: p.k, titleSize: 118, titleLines: 4, big: roman(j), bigSize: 260 });
        });
      } else if (r === 'withdrawn') {
        room('Claims I withdrew', 'Claims I withdrew myself', 'Each claim was allowed to stand only if it cleared a bar set before the measurement. These two did not, so I took them down. The records that measured them stay public.');
        ctx.withdrawn.forEach((w, j) => {
          const d = item(j, roman(j), w.title, 'pg-annul');
          d.appendChild(P_(w.what));
          const nn = el('div', 'pg-p-nums'); for (const [n, l] of w.numbers) { const x = el('div'); x.append(el('b', null, n), el('span', null, l)); nn.appendChild(x); } d.appendChild(nn);
          if (w.link) d.appendChild(mkA(w.link[1], w.link[0] + ' ↗', 1, 'pg-ul'));
          if (j < N_PLATE) engrave(plates[j], { kicker: 'Withdrawn', kickerColor: '#b5452a', title: w.title, titleSize: 112, annul: true, cracked: j + 3, nums: w.numbers.slice(0, 2), numSize: 170 });
        });
        if (bySlug['vvdex-platform']) {
          const d = el('section', 'pg-item'); d.appendChild(P_('The audit behind the second withdrawal, and what changed in grading because of it, is in the case.'));
          d.appendChild(mkA('#work/vvdex-platform', 'Read the VVDex Platform case →', 0, 'pg-ul')); panel.appendChild(d);
        }
      } else if (r === 'capabilities') {
        room('Capabilities', 'What I build with', 'Each skill links to the products that use it.');
        ctx.capabilities.forEach(([g, skills], j) => {
          const d = item(j, roman(j), g);
          const ul = el('ul', 'pg-skills');
          for (const [skill, prods] of skills) {
            const li = el('li'); li.appendChild(el('b', null, skill));
            const sp = el('span'); for (const p of prods) sp.appendChild(productLink(p)); li.appendChild(sp); ul.appendChild(li);
          }
          d.appendChild(ul);
          if (j < N_PLATE) engrave(plates[j], { kicker: 'Capabilities', title: g, titleSize: 124, big: String(skills.length), bigSize: 280, foot: skills.length === 1 ? 'skill' : 'skills' });
        });
      } else if (r === 'about') {
        room('About', P.name, null);
        const d0 = item(0, null, P.role);
        const dl = el('dl', 'pg-facts');
        let lastK = '';
        for (const [k, v] of ctx.about.facts) { dl.append(el('dt', null, k || (lastK ? '' : '')), el('dd', null, v)); if (k) lastK = k; }
        d0.appendChild(dl);
        const d1 = item(null, null, 'What I’m looking for'); d1.append(P_(P.wants), P_(P.availability, 'pg-trade'));
        const d2 = item(null, null, 'Roles I’m open to'); const ul = el('ul', 'pg-roles'); for (const ro of P.roles) ul.appendChild(el('li', null, ro)); d2.appendChild(ul);
        const facts = ctx.about.facts.filter(([k]) => k).slice(0, 3).map(([k, v]) => `${k}: ${v}`);
        engrave(plates[0], { landscape: true, kicker: P.city, title: P.name, titleSize: 150, titleLines: 2, lines: [P.role, ...facts], lineSize: 36 });
      } else if (r === 'contact') {
        room('Contact', 'Write to me', P.availability);
        const d = item(0, null, 'Email');
        d.appendChild(mkA(mailHref, P.email, 0, 'pg-mail'));
        d.appendChild(P_(`The subject line is filled in for you: “${mailSubject}”.`, 'pg-trade'));
        const d2 = item(null, null, 'Elsewhere'); const lk = el('div', 'pg-links'); lk.append(mkA(P.linkedin, 'LinkedIn ↗', 1, 'pg-ul'), mkA(P.github, 'GitHub ↗', 1, 'pg-ul'), mkA(P.site, 'vamsivenkatesh.com ↗', 1, 'pg-ul')); d2.appendChild(lk);
        engrave(plates[0], { landscape: true, kicker: 'Write to me', title: P.email, titleSize: 96, titleLines: 1, lines: [P.linkedin.replace(/^https:\/\/(www\.)?/, ''), P.github.replace(/^https:\/\//, '')], lineSize: 40, foot: P.availability });
      }
      setActiveItem(0);
    }
    function setActiveItem(j) {
      st.activeItem = j;
      itemEls.forEach((d, n) => d && d.classList.toggle('pg-act', n === j));
    }

    // ---------- routing (location.hash, so the back button works) ----------
    function parseHash() {
      const h = decodeURIComponent((location.hash || '').replace(/^#\/?/, ''));
      if (h.startsWith('work/')) { const slug = h.slice(5); if (slug in idxOf) return { r: 'case', slug }; return { r: 'work' }; }
      if (SECTIONS.some(([k]) => k === h)) return { r: h };
      return { r: 'arrival' };
    }
    function show(n, vis) { n.classList.toggle('pg-off', !vis); }
    function applyRoute() {
      const { r, slug } = parseHash();
      const prevOpen = st.open;
      toggleIx(false);
      // the slab that was lent the chapter pane gets its own engraving back
      if (prevOpen >= 0 && !(r === 'case' && idxOf[slug] === prevOpen)) { cards[prevOpen].tmat.map = cards[prevOpen].tex; cards[prevOpen].tmat.needsUpdate = true; }
      if (r === 'case') {
        const i = idxOf[slug];
        if (st.open !== i) {
          const c = cards[i]; c.r.y = ((c.r.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); if (c.r.y > Math.PI) c.r.y -= Math.PI * 2;
          st.open = i; st.sTarget = i; st.chapter = 0;
          buildCase(i);
          c.tmat.map = chapterTex; c.tmat.needsUpdate = true;
        }
      } else {
        if (prevOpen >= 0) { cards[prevOpen].r.y += Math.PI * 2; st.s = st.sTarget = prevOpen; st.sv = 0; }
        st.open = -1;
      }
      const room = !['arrival', 'work', 'case'].includes(r);
      if (room && st.route !== r) {
        // panes sink and rise again with their new engraving
        plates.forEach((pl) => { pl.p.y = Math.min(pl.p.y, -2.5); pl.v.set(0, 0, 0); });
        buildRoom(r);
      }
      st.route = r;
      const deck = r === 'arrival' || r === 'work';
      show(intro, r === 'arrival'); show(contact, r === 'arrival');
      if (wdBlock) show(wdBlock, r === 'arrival');
      show(workHead, r === 'work'); show(cap, deck); show(indexNav, deck || !st.phone);
      show(sheet, deck);
      panel.classList.toggle('pg-show', !deck); panel.setAttribute('aria-hidden', String(deck));
      for (const a of ui.querySelectorAll('.pg-index a')) a.setAttribute('aria-current', String(a.dataset.r === (r === 'case' ? 'work' : r)));
      if (!deck && document.activeElement && !panel.contains(document.activeElement)) panel.focus({ preventScroll: true });
    }
    on(window, 'hashchange', applyRoute);
    const go = (hash) => { if (location.hash !== '#' + hash) location.hash = hash; else applyRoute(); };

    on(panel, 'scroll', () => {
      const top = panel.scrollTop + (st.route === 'case' ? (st.phone ? 70 : 90) : (st.phone ? 130 : 170));
      if (st.route === 'case') {
        let k = 0; chapterEls.forEach((s, n) => { if (s.offsetTop <= top) k = n; });
        if (panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 4) k = chapterEls.length - 1;
        setChapter(k);
      } else {
        let k = 0; itemEls.forEach((s, n) => { if (s && s.offsetTop <= top) k = n; });
        if (k !== st.activeItem) setActiveItem(k);
      }
    }, { passive: true });

    // ---------- input ----------
    const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
    const targets = [...cards.map((c) => c.slab), ...plates.map((p) => p.slab)];
    function pick(ev) {
      const r = canvas.getBoundingClientRect();
      ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      for (const h of ray.intersectObjects(targets, false)) { const u = h.object.userData; if (u.plate != null ? plates[u.plate].on : true) return h; }
      return null;
    }
    const deckMode = () => st.route === 'arrival' || st.route === 'work';
    const drag = { id: null, x0: 0, y0: 0, s0: 0, moved: 0, hist: [] };
    const pxPerCard = () => (st.phone ? 70 : 190);
    on(canvas, 'pointerdown', (e) => {
      if (drag.id !== null) return;
      drag.id = e.pointerId; drag.x0 = e.clientX; drag.y0 = e.clientY; drag.s0 = st.s; drag.moved = 0; drag.hist = [[performance.now(), st.s]];
      try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    });
    on(canvas, 'pointermove', (e) => {
      if (drag.id === e.pointerId) {
        const d = st.phone ? (e.clientY - drag.y0) : (e.clientX - drag.x0);
        drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0));
        if (drag.moved > 6 && deckMode()) {
          st.dragging = true;
          let s = drag.s0 - d / pxPerCard();
          if (s < 0) s = -Math.pow(-s, 0.7) * 0.6; if (s > N - 1) s = N - 1 + Math.pow(s - (N - 1), 0.7) * 0.6;
          st.s = s; st.sTarget = s; st.sv = 0;
          drag.hist.push([performance.now(), s]); if (drag.hist.length > 6) drag.hist.shift();
        }
      }
      if (!st.dragging) {
        const hit = pick(e);
        const u = hit ? hit.object.userData : {};
        st.hover = hit && u.i != null ? u.i : -1; st.hoverPlate = hit && u.plate != null ? u.plate : -1;
        canvas.style.cursor = hit ? 'pointer' : (deckMode() ? 'grab' : 'default');
        if (hit) {
          const c = u.i != null ? cards[u.i] : plates[u.plate]; const lp = c.group.worldToLocal(hit.point.clone());
          c.tiltT.set(clamp(lp.x / (SLAB_W / 2), -1, 1), clamp(lp.y / (SLAB_H / 2), -1, 1));
        }
      }
    });
    const endDrag = (e) => {
      if (drag.id !== e.pointerId) return;
      drag.id = null;
      if (st.dragging) {
        st.dragging = false;
        const h = drag.hist; const a = h[0], b = h[h.length - 1];
        const dt = (b[0] - a[0]) / 1000; const vel = dt > 0.008 ? (b[1] - a[1]) / dt : 0;
        st.sv = clamp(vel, -14, 14);
        st.sTarget = clamp(Math.round(st.s + st.sv * 0.22), 0, N - 1);
        return;
      }
      if (e.type === 'pointercancel') return;
      const hit = pick(e);
      if (hit) {
        const u = hit.object.userData;
        if (u.plate != null) {
          const t = itemEls[u.plate]; if (t) { panel.scrollTo({ top: t.offsetTop - (st.phone ? 110 : 140), behavior: reduced ? 'auto' : 'smooth' }); setActiveItem(u.plate); }
        } else if (st.route === 'case' && st.open === u.i) go('work');
        else if (st.route === 'arrival' || st.route === 'work' || st.route === 'case') go('work/' + order[u.i].slug);
        else go('work');
      } else if (st.route === 'case') go('work');
    };
    on(canvas, 'pointerup', endDrag); on(canvas, 'pointercancel', endDrag);
    on(canvas, 'pointerleave', () => { if (!st.dragging) { st.hover = -1; st.hoverPlate = -1; } });
    let wheelTimer = 0;
    on(canvas, 'wheel', (e) => {
      if (!deckMode()) return;
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      st.sTarget = clamp(st.sTarget + d / 260, -0.4, N - 0.6);
      clearTimeout(wheelTimer); wheelTimer = setTimeout(() => { st.sTarget = clamp(Math.round(st.sTarget), 0, N - 1); }, 160);
      timers.push(wheelTimer);
    }, { passive: false });
    on(window, 'keydown', (e) => {
      if (!alive) return;
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (e.key === 'Escape') {
        if (!ixSheet.classList.contains('pg-off')) { toggleIx(false); return; }
        if (st.route === 'case') go('work'); else if (st.route !== 'arrival') go('arrival');
        return;
      }
      if (/INPUT|TEXTAREA/.test(tag)) return;
      if (st.route === 'case') {
        if (e.key === 'ArrowLeft') go('work/' + order[(st.open - 1 + N) % N].slug);
        else if (e.key === 'ArrowRight') go('work/' + order[(st.open + 1) % N].slug);
        return;
      }
      if (!deckMode()) return;
      const prevK = st.phone ? 'ArrowUp' : 'ArrowLeft', nextK = st.phone ? 'ArrowDown' : 'ArrowRight';
      if (e.key === 'ArrowLeft' || e.key === prevK) st.sTarget = clamp(Math.round(st.sTarget) - 1, 0, N - 1);
      else if (e.key === 'ArrowRight' || e.key === nextK) st.sTarget = clamp(Math.round(st.sTarget) + 1, 0, N - 1);
      else if (e.key === 'Enter' && document.activeElement === canvas) go('work/' + order[clamp(Math.round(st.s), 0, N - 1)].slug);
    });
    const ro = new ResizeObserver(() => layout()); ro.observe(root);
    layout();
    applyRoute();

    // ---------- frame ----------
    const tmpP = new THREE.Vector3(), tmpR = new THREE.Vector3(), xAxis = new THREE.Vector3(), Lh = new THREE.Vector2(0.18, 0.62);
    for (const c of cards) { fanPose(c, c.i - st.s, reduced ? 99 : 0, c.p, c.r); }
    function spring(c, ks, z, dt) {
      const cd = 2 * z * Math.sqrt(ks);
      c.v.addScaledVector(tmpP.copy(c.tp).sub(c.p).multiplyScalar(ks).addScaledVector(c.v, -cd), dt); c.p.addScaledVector(c.v, dt);
      c.rv.addScaledVector(tmpR.copy(c.tr).sub(c.r).multiplyScalar(ks).addScaledVector(c.rv, -cd), dt); c.r.addScaledVector(c.rv, dt);
    }
    function footprint(c, slot) {
      xAxis.set(1, 0, 0).applyQuaternion(c.group.quaternion);
      const hgt = Math.max(0.01, c.p.y - SLAB_H / 2 * c.sc);
      const xl = Math.hypot(xAxis.x, xAxis.z) || 1;
      const visible = c.group.visible ? clamp((c.p.y + 0.5) / 1.8, 0, 1) * Math.min(1, c.sc) : 0;
      floorUniforms.uA.value[slot].set(c.p.x + Lh.x * 0.3, c.p.z + 0.15, xAxis.x / xl, xAxis.z / xl);
      floorUniforms.uB.value[slot].set(Lh.x * (0.4 + hgt * 0.5), Lh.y * (0.5 + hgt * 0.9), hgt, visible);
    }
    const perf = { n: 0, acc: 0 };
    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - st.last) / 1000); st.last = now;
      const t = (now - st.t0) / 1000;
      if (!reduced) st.time += dt;
      if (!st.dragging) {
        const k = 38, cdamp = 2 * 0.86 * Math.sqrt(k);
        st.sv += (k * (st.sTarget - st.s) - cdamp * st.sv) * dt; st.s += st.sv * dt;
      }
      if (deckMode()) setCaption(clamp(Math.round(st.s), 0, N - 1));
      const r = st.route, inCase = r === 'case', inRoom = !deckMode() && !inCase;
      for (const c of cards) {
        const k = c.i - st.s;
        if (inCase) openPose(c, c.tp, c.tr);
        else if (inRoom) { const ki = c.i - centre; if (st.phone) { c.tp.set(ki * 0.1, -4.5, -3.6); c.tr.set(0, 0.3, 0); } else { c.tp.set(0.9 + ki * 0.14, 1.4, -3.6 - Math.abs(ki) * 0.15); c.tr.set(0, 0.5 + ki * 0.04, -ki * 0.03); } }
        else fanPose(c, k, t, c.tp, c.tr);
        const hov = st.hover === c.i && !st.dragging;
        if (!hov) c.tiltT.set(0, 0);
        c.tilt.lerp(c.tiltT, 1 - Math.exp(-dt * 8));
        c.tr.y += c.tilt.x * 0.2; c.tr.x -= c.tilt.y * 0.16;
        const isOpen = inCase && c.i === st.open;
        if (hov && !isOpen) c.tp.z += 0.14;
        spring(c, isOpen ? 34 : (inCase || inRoom ? 30 : 70), isOpen ? 0.78 : 0.84, dt);
        const etchMin = st.phone ? 0 : 0.3;
        let etchT;
        if (inCase) etchT = isOpen ? 1 : (st.phone ? 0 : 0.2);
        else if (inRoom) etchT = st.phone ? 0 : 0.12;
        else etchT = etchMin + (1 - etchMin) * Math.max(0, 1 - Math.abs(k) * (st.phone ? 1.4 : 0.85));
        if (hov) etchT += 0.35;
        c.etch += (Math.min(1, etchT) - c.etch) * (1 - Math.exp(-dt * 6)); c.uEtch.value = c.etch; c.text.visible = c.etch > 0.04;
        const disp = c.etch > 0.75 ? 0.6 : 0;
        if (c.slab.material.dispersion !== disp) c.slab.material.dispersion = disp;
        c.group.position.copy(c.p); c.group.rotation.set(c.r.x, c.r.y, c.r.z);
        c.group.updateMatrixWorld();
        footprint(c, c.i);
      }
      for (const pl of plates) {
        const act = inRoom && platePose(pl, pl.tp, pl.tr);
        pl.on = act;
        if (!act) { pl.tp.set(pl.p.x, -4.5, pl.p.z); pl.tr.set(0, 0, 0); }
        else {
          // a pane in reading focus steps forward; the others wait
          const focus = pl.j === st.activeItem || pl.j === st.hoverPlate;
          if (focus) pl.tp.z += 0.25;
          if (pl.j === st.hoverPlate) { pl.tr.y += pl.tilt.x * 0.2; pl.tr.x -= pl.tilt.y * 0.16; }
        }
        if (pl.j !== st.hoverPlate) pl.tiltT.set(0, 0);
        pl.tilt.lerp(pl.tiltT, 1 - Math.exp(-dt * 8));
        if (act && !pl.group.visible) { pl.group.visible = true; pl.p.set(pl.tp.x, -2.8, pl.tp.z); pl.v.set(0, 0, 0); pl.r.copy(pl.tr); pl.r.y -= 0.6; }
        spring(pl, 30, 0.8 - pl.j * 0.04, dt);
        pl.sc += (pl.tsc - pl.sc) * (1 - Math.exp(-dt * 7));
        if (!act && pl.p.y < -2.3) pl.group.visible = false;
        const etT = act ? (pl.j === st.activeItem || pl.j === st.hoverPlate || st.route === 'about' || st.route === 'contact' ? 1 : 0.55) : 0;
        pl.etch += (etT - pl.etch) * (1 - Math.exp(-dt * 6)); pl.uEtch.value = pl.etch; pl.text.visible = pl.etch > 0.04 && !!pl.tex;
        const disp = pl.etch > 0.9 ? 0.6 : 0; if (pl.slab.material.dispersion !== disp) pl.slab.material.dispersion = disp;
        pl.group.position.copy(pl.p); pl.group.rotation.set(pl.r.x, pl.r.y, pl.r.z); pl.group.scale.setScalar(pl.sc);
        pl.group.updateMatrixWorld();
        footprint(pl, N + pl.j);
      }
      floorUniforms.uT.value = reduced ? 3.0 : st.time;
      perf.n++; perf.acc += dt;
      if (perf.acc >= 1.2) {
        const f = perf.n / perf.acc; perf.n = 0; perf.acc = 0;
        if (t > introDur && f < 52 && st.pr > 1) { st.pr = Math.max(1, st.pr - 0.25); renderer.setPixelRatio(st.pr); renderer.setSize(st.w, st.h, false); }
      }
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(frame);
    if (!reduced) {
      requestAnimationFrame(() => requestAnimationFrame(() => { if (alive) wrap.classList.remove('pg-pre'); }));
      timers.push(setTimeout(() => wrap.classList.remove('pg-prehint'), introDur * 1000));
    }

    return function unmount() {
      alive = false;
      cancelAnimationFrame(raf);
      for (const tm of timers) clearTimeout(tm);
      ro.disconnect();
      for (const [tg, type, fn, opts] of listeners) tg.removeEventListener(type, fn, opts);
      for (const d of disposables) d.dispose();
      for (const pl of plates) if (pl.tex) pl.tex.dispose();
      envRT.dispose();
      renderer.dispose(); renderer.forceContextLoss();
      wrap.remove(); link.remove(); style.remove();
      root.replaceChildren();
    };
  },
};
