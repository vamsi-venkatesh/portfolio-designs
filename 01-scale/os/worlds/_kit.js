// Shared plumbing for VV·OS project worlds. No innerHTML anywhere: DOM methods only.
// Each world owns its own look; this file only builds structure + lifecycle.

export function life() {
  const fns = [];
  const L = {
    add(fn) { fns.push(fn); return fn; },
    on(t, ev, f, o) { t.addEventListener(ev, f, o); fns.push(() => t.removeEventListener(ev, f, o)); },
    raf(loop) {
      let id = 0, live = true;
      const tick = (t) => { if (!live) return; id = requestAnimationFrame(tick); loop(t); };
      id = requestAnimationFrame(tick);
      const stop = () => { live = false; cancelAnimationFrame(id); };
      fns.push(stop); return stop;
    },
    timeout(f, ms) { const id = setTimeout(f, ms); fns.push(() => clearTimeout(id)); return id; },
    interval(f, ms) { const id = setInterval(f, ms); fns.push(() => clearInterval(id)); return id; },
    observe(el, cb) { const ro = new ResizeObserver(cb); ro.observe(el); fns.push(() => ro.disconnect()); return ro; },
    dispose() { while (fns.length) { try { fns.pop()(); } catch (e) { /* keep tearing down */ } } },
  };
  return L;
}

// h('div.a.b', {text, attrs, on, style}, ...children)
export function h(sel, props, ...kids) {
  const [tag, ...cls] = sel.split('.');
  const el = document.createElement(tag || 'div');
  if (cls.length) el.className = cls.join(' ');
  if (props && (typeof props === 'string' || props instanceof Node || Array.isArray(props))) { kids.unshift(props); props = null; }
  if (props) {
    if (props.text != null) el.textContent = String(props.text);
    if (props.attrs) for (const k in props.attrs) el.setAttribute(k, props.attrs[k]);
    if (props.on) for (const k in props.on) el.addEventListener(k, props.on[k]);
    if (props.style) for (const k in props.style) el.style.setProperty(k, props.style[k]);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  return el;
}

const SVGNS = 'http://www.w3.org/2000/svg';
export function s(tag, attrs, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
  for (const k of kids.flat()) if (k) el.append(k);
  return el;
}

export function fonts(L, q) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?' + q + '&display=swap';
  document.head.appendChild(link);
  L.add(() => link.remove());
  return link;
}

export function style(L, css) {
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  L.add(() => st.remove());
  return st;
}

export async function sha256(input) {
  const buf = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const d = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const pos = (ctx) => String(ctx.index + 1).padStart(2, '0') + ' / ' + String(ctx.total).padStart(2, '0');

// Controls: back, position, prev/next, open live, source links. Esc → close; [ / ] → prev/next.
export function controls(L, ctx, cls = '') {
  const it = ctx.item;
  const nav = h('nav.kx-nav' + (cls ? '.' + cls : ''), { attrs: { 'aria-label': it.name + ' controls' } });
  const btn = (c, label, fn, title) => h('button.kx-b.' + c, { text: label, attrs: { type: 'button', title: title || label }, on: { click: fn } });
  nav.append(
    btn('kx-back', '← desktop', () => ctx.close(), 'Back to desktop (Esc)'),
    h('span.kx-pos', { text: pos(ctx) }),
    btn('kx-prev', '‹ prev', () => ctx.prev(), 'Previous project'),
    btn('kx-next', 'next ›', () => ctx.next(), 'Next project'),
  );
  if (it.url) nav.append(btn('kx-live', 'Open live ↗', () => ctx.openUrl(it.url, it.name), 'Open ' + it.host + ' in the browser'));
  for (const [label, url] of it.links || []) {
    if (url === it.url) continue;
    nav.append(btn('kx-src', label + ' ↗', () => ctx.openUrl(url, label)));
  }
  L.on(window, 'keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    const typing = /INPUT|TEXTAREA|SELECT/.test(tag) || (e.target && e.target.isContentEditable);
    if (e.key === 'Escape') { if (typing) e.target.blur(); else ctx.close(); }
    else if (!typing && e.key === ']') ctx.next();
    else if (!typing && e.key === '[') ctx.prev();
  });
  return nav;
}

// The full content, as semantic DOM. Each world styles .kx-* its own way.
export function reading(ctx, opts = {}) {
  const cs = ctx.caseStudy, it = ctx.item;
  const lab = Object.assign({
    summary: 'Summary', role: 'My role', problem: 'Problem', plan: 'Plan', constraints: 'Constraints', built: 'What I built',
    how: 'How it works', decisions: 'Decisions', evaluation: 'Evaluation', numbers: 'Numbers', checks: 'Checks',
    stack: 'Stack', links: 'Links', limits: 'Limits', withdrawn: 'Withdrawn',
  }, opts.labels || {});
  const art = h('article.kx-read');
  const sec = (key, ...kids) => { const sc = h('section.kx-sec.kx-' + key, h('h3.kx-h', { text: lab[key] }), ...kids); art.append(sc); return sc; };
  const linkBtn = (label, url) => h('button.kx-link', { text: label + ' ↗', attrs: { type: 'button' }, on: { click: () => ctx.openUrl(url, label) } });
  const head = h('header.kx-head',
    h('p.kx-kind', { text: (cs ? cs.category : it.kind) + ' · ' + it.status + (cs && cs.period ? ' · ' + cs.period : '') }),
    h('h2.kx-title', { text: it.name }),
    h('p.kx-lede', { text: cs ? cs.one_line : it.line }));
  art.append(head);
  const nums = cs ? cs.numbers.map((n) => [n.value, n.label, n.date])
    : (() => { const seen = new Set(), out = []; for (const [v, l] of [...(it.numbers || []), ...(it.stage || [])]) { const k = v + '|' + l; if (seen.has(v)) continue; seen.add(v); seen.add(k); out.push([v, l, '']); } return out; })();
  const numEl = h('div.kx-nums', nums.map(([v, l, d]) => h('div.kx-num', h('b.kx-v', { text: v }), h('span.kx-l', { text: l }), d ? h('time.kx-d', { text: d }) : null)));
  if (cs) {
    sec('summary', h('p.kx-p', { text: cs.summary }));
    sec('numbers', numEl);
    sec('role', h('p.kx-p', { text: cs.role }));
    sec('problem', h('p.kx-p', { text: cs.problem }));
    sec('constraints', h('ul.kx-ul', cs.constraints.map((c) => h('li', { text: c }))));
    sec('built', h('div.kx-blocks', cs.built.map((b) => h('div.kx-block', h('h4.kx-bt', { text: b.title }), h('p.kx-p', { text: b.body })))));
    sec('how', h('ol.kx-steps', cs.how_it_works.map((st, i) => h('li.kx-step', h('span.kx-sn', { text: String(i + 1).padStart(2, '0') }), h('h4.kx-bt', { text: st.step }), h('p.kx-p', { text: st.body })))));
    sec('decisions', h('div.kx-decs', cs.decisions.map((d) => h('div.kx-dec', h('h4.kx-bt', { text: d.decision }), h('p.kx-p', h('em', { text: 'Why. ' }), d.why), h('p.kx-p.kx-trade', h('em', { text: 'Trade-off. ' }), d.tradeoff)))));
    sec('evaluation', h('div.kx-evals', cs.evaluation.map((e) => h('div.kx-eval', h('time.kx-d', { text: e.date }), h('h4.kx-bt', { text: e.what }), h('p.kx-p', { text: e.result })))));
    sec('limits', h('ul.kx-ul.kx-lim', cs.limits.map((c) => h('li', { text: c }))));
    sec('stack', h('ul.kx-stack', cs.stack.map((c) => h('li', { text: c }))));
    sec('links', h('div.kx-links', cs.links.map((l) => linkBtn(l.label, l.url))));
  } else {
    sec('problem', h('p.kx-p', { text: it.problem }));
    sec('plan', h('p.kx-p', { text: it.plan }));
    sec('built', h('ul.kx-ul', it.built.map((c) => h('li', { text: c }))));
    sec('numbers', numEl);
    sec('checks', h('ul.kx-ul.kx-checks', it.checks.map((c) => h('li', { text: c }))));
    if (it.links && it.links.length) sec('links', h('div.kx-links', it.links.map(([l, u]) => linkBtn(l, u))));
  }
  for (const wi of opts.withdrawn || []) {
    const w = ctx.withdrawn[wi]; if (!w) continue;
    sec('withdrawn', h('div.kx-block.kx-wd', h('h4.kx-bt', { text: w.title }), h('p.kx-p', { text: w.what }),
      h('div.kx-nums', w.numbers.map(([v, l]) => h('div.kx-num', h('b.kx-v', { text: v }), h('span.kx-l', { text: l })))),
      w.link ? linkBtn(w.link[0], w.link[1]) : null));
  }
  return art;
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const short = (hex, n = 10) => hex.slice(0, n) + '…' + hex.slice(-4);
