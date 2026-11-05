// VV·OS glyphs: luminous line drawings, built with DOM methods.
const NS = 'http://www.w3.org/2000/svg';
let gid = 0;
function s(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function svg(vb = '0 0 52 46') { const e = s('svg', { viewBox: vb, 'aria-hidden': 'true' }); return e; }
function grad(root, id, stops, x2 = '0', y2 = '1') {
  const d = root.querySelector('defs') || s('defs', {}, root);
  const g = s('linearGradient', { id, x1: '0', y1: '0', x2, y2 }, d);
  stops.forEach(([o, c, a = 1]) => s('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, g));
  return `url(#${id})`;
}

export function folder(accent = '#ffd2a0') {
  const e = svg(); const id = 'gf' + (++gid);
  const back = grad(e, id + 'a', [['0', '#1c2c45'], ['1', '#0b1424']]);
  const front = grad(e, id + 'b', [['0', '#2b4266', 0.95], ['1', '#101c31', 0.95]]);
  s('path', { d: 'M4 9a3 3 0 0 1 3-3h12l4 4h22a3 3 0 0 1 3 3v26a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z', fill: back, stroke: '#cfe6ff55', 'stroke-width': '1' }, e);
  s('path', { d: 'M4 17a3 3 0 0 1 3-3h38a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z', fill: front, stroke: '#cfe6ff77', 'stroke-width': '1' }, e);
  s('path', { d: 'M8 16.5h36', stroke: accent, 'stroke-width': '1.2', opacity: '.9' }, e);
  s('circle', { cx: '40', cy: '35', r: '2.2', fill: accent }, e);
  return e;
}
export function world(color = '#ffd2a0') {
  const e = svg(); const id = 'gw' + (++gid);
  const d = s('defs', {}, e); const rg = s('radialGradient', { id, cx: '.38', cy: '.32', r: '.75' }, d);
  s('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': '.95' }, rg); s('stop', { offset: '.28', 'stop-color': color }, rg); s('stop', { offset: '1', 'stop-color': '#04060b' }, rg);
  s('ellipse', { cx: '26', cy: '23', rx: '24', ry: '7.5', fill: 'none', stroke: color, 'stroke-opacity': '.45', 'stroke-width': '1', transform: 'rotate(-14 26 23)' }, e);
  s('circle', { cx: '26', cy: '23', r: '14', fill: `url(#${id})` }, e);
  s('path', { d: 'M4.6 28.4 A24 7.5 -14 0 0 47.4 17.6', fill: 'none', stroke: color, 'stroke-width': '1.3', transform: 'rotate(0)' }, e);
  return e;
}
export function docG(kind = 'txt') {
  const e = svg(); const id = 'gd' + (++gid);
  const f = grad(e, id, [['0', '#e9eef6', 0.96], ['1', '#b9c6d8', 0.9]]);
  s('path', { d: 'M14 3h17l9 9v29a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', fill: f }, e);
  s('path', { d: 'M31 3v7a2 2 0 0 0 2 2h7', fill: '#8fa3bd' }, e);
  const c = kind === 'skill' ? '#3c6fb0' : kind === 'withdrawn' ? '#c0583f' : '#556378';
  for (let i = 0; i < 5; i++) s('rect', { x: '17', y: String(18 + i * 4.5), width: String(i === 4 ? 10 : 18), height: '1.6', rx: '.8', fill: c, opacity: '.75' }, e);
  if (kind === 'skill') s('circle', { cx: '35', cy: '36', r: '3.4', fill: '#ffb46b' }, e);
  if (kind === 'withdrawn') s('path', { d: 'M15 26 L37 22', stroke: '#c0583f', 'stroke-width': '1.6' }, e);
  return e;
}
export function app(name) {
  const e = svg('0 0 40 40'); const id = 'ga' + (++gid);
  const bg = grad(e, id, name === 'camera' ? [['0', '#1d3b38'], ['1', '#06100f']] : name === 'github' ? [['0', '#2a2f3a'], ['1', '#090b10']] : name === 'terminal' ? [['0', '#1a2233'], ['1', '#05070d']] : name === 'browser' ? [['0', '#183457'], ['1', '#071223']] : name === 'playground' ? [['0', '#3b2346'], ['1', '#0d0714']] : name === 'signal' ? [['0', '#4a2c1a'], ['1', '#120a05']] : [['0', '#22344f'], ['1', '#0a1222']]);
  s('rect', { x: '1', y: '1', width: '38', height: '38', rx: '10', fill: bg, stroke: '#cfe6ff40', 'stroke-width': '.8' }, e);
  s('rect', { x: '1.5', y: '1.5', width: '37', height: '18', rx: '9.5', fill: '#ffffff', opacity: '.05' }, e);
  const st = { fill: 'none', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  if (name === 'terminal') { s('path', { d: 'M11 14l6 6-6 6', stroke: '#9fe3b8', ...st }, e); s('path', { d: 'M20 27h9', stroke: '#ffd2a0', ...st }, e); }
  else if (name === 'browser') { s('circle', { cx: '20', cy: '20', r: '10', stroke: '#cfe6ff', ...st }, e); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; s('path', { d: `M${20 + Math.cos(a) * 10} ${20 + Math.sin(a) * 10} L${20 + Math.cos(a + 1.2) * 4.5} ${20 + Math.sin(a + 1.2) * 4.5}`, stroke: '#ffd2a0', ...st, 'stroke-width': '1.1' }, e); } }
  else if (name === 'playground') { s('ellipse', { cx: '20', cy: '20', rx: '12', ry: '5', stroke: '#e3b5ff', ...st, transform: 'rotate(-25 20 20)' }, e); s('ellipse', { cx: '20', cy: '20', rx: '12', ry: '5', stroke: '#ffd2a0', ...st, transform: 'rotate(35 20 20)' }, e); s('circle', { cx: '20', cy: '20', r: '3', fill: '#fff' }, e); }
  else if (name === 'signal') { s('circle', { cx: '13', cy: '27', r: '2.4', fill: '#ffd2a0' }, e); for (let i = 1; i <= 3; i++) s('path', { d: `M13 ${27 - i * 5.5} A${i * 5.5} ${i * 5.5} 0 0 1 ${13 + i * 5.5} 27`, stroke: i === 3 ? '#cfe6ff' : '#ffd2a0', ...st, opacity: String(1.1 - i * 0.22) }, e); }
  else if (name === 'files') { s('path', { d: 'M10 13h7l2 2h11v13H10z', stroke: '#cfe6ff', ...st }, e); s('path', { d: 'M10 18h20', stroke: '#ffd2a0', ...st }, e); }
  else if (name === 'camera') { s('rect', { x: '9', y: '14', width: '22', height: '15', rx: '3', stroke: '#cfe6ff', ...st }, e); s('circle', { cx: '20', cy: '21.5', r: '4.5', stroke: '#ffd2a0', ...st }, e); s('path', { d: 'M15 14l2-3h6l2 3', stroke: '#cfe6ff', ...st }, e); }
  else if (name === 'github') { s('circle', { cx: '20', cy: '20', r: '10', stroke: '#cfe6ff', ...st }, e); s('path', { d: 'M16 30v-4c0-1.5.6-2.4 1.4-2.8-3.4-.4-5.4-1.8-5.4-5.4 0-1.2.4-2.2 1.1-3-.1-.4-.5-1.6.1-3.1 0 0 1-.3 3.2 1.2a10 10 0 0 1 5.4 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.5.2 2.7.1 3.1.7.8 1.1 1.8 1.1 3 0 3.6-2 5-5.4 5.4.8.4 1.4 1.4 1.4 2.8v4', stroke: '#ffd2a0', ...st, 'stroke-width': '1.2' }, e); }
  else if (name === 'search') { s('circle', { cx: '18', cy: '18', r: '6.5', stroke: '#cfe6ff', ...st }, e); s('path', { d: 'M23 23l6 6', stroke: '#ffd2a0', ...st }, e); }
  return e;
}
export function mark() {
  const e = svg('0 0 16 16');
  s('circle', { cx: '8', cy: '8', r: '6.5', fill: 'none', stroke: '#cfe6ff', 'stroke-width': '1' }, e);
  s('path', { d: 'M1 11 L15 5', stroke: '#ffd2a0', 'stroke-width': '1.4' }, e);
  return e;
}
export function glyphFor(node) {
  if (!node) return folder();
  if (node.type === 'file') return docG(/^image\//.test(node.mime) ? 'skill' : 'txt');
  if (node.type === 'enc') { const e = docG('withdrawn'); s('rect', { x: '20', y: '27', width: '12', height: '10', rx: '2', fill: '#ffb46b' }, e); s('path', { d: 'M22.5 27v-3a3.5 3.5 0 0 1 7 0v3', fill: 'none', stroke: '#ffb46b', 'stroke-width': '1.6' }, e); return e; }
  if (node.type === 'dir') return folder(node.name === 'vault' ? '#ffb46b' : node.name === 'you' ? '#e3b5ff' : node.name === 'withdrawn' ? '#ff8a7a' : node.name === 'skills' ? '#9fd0ff' : node.name === 'how-i-work' ? '#9fe3b8' : '#ffd2a0');
  if (node.type === 'world') return world(node.color);
  if (node.type === 'app') return app(node.app === 'browser' ? 'browser' : node.app);
  if (node.type === 'doc') return docG(node.name.endsWith('.skill') ? 'skill' : node.parent && node.parent.name === 'withdrawn' ? 'withdrawn' : 'txt');
  return folder();
}
