// Reader: one document, and the source it is made of (flip with "source").
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

function sourceView(obj) {
  // a coloured JSON view, built from spans (no HTML strings)
  const pre = el('div', 'src'); const json = JSON.stringify(obj, null, 2);
  let i = 0;
  for (const m of json.matchAll(/("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?)/g)) {
    if (m.index > i) pre.appendChild(document.createTextNode(json.slice(i, m.index)));
    if (m[1]) { pre.appendChild(el('span', m[2] ? 'kq' : 'sq', m[1])); if (m[2]) pre.appendChild(document.createTextNode(m[2])); }
    else pre.appendChild(el('span', 'nq', m[3]));
    i = m.index + m[0].length;
  }
  pre.appendChild(document.createTextNode(json.slice(i)));
  return pre;
}

export default {
  mount(body, api, node) {
    const { content } = api;
    const r = el('article', 'reader'); body.appendChild(r);
    let src = false;
    const head = el('div'); head.style.display = 'flex'; head.style.justifyContent = 'space-between'; head.style.alignItems = 'center'; head.style.gap = '12px';
    const flip = el('button', 'btn wbtn', 'source </>'); flip.setAttribute('aria-pressed', 'false');
    const d = node.doc;
    function render() {
      r.replaceChildren(); head.replaceChildren(el('p', 'k', src ? 'source · ' + node.path : (d.kicker || 'document')), flip); r.appendChild(head);
      if (src) { r.appendChild(sourceView({ path: node.path, ...d })); return; }
      r.appendChild(el('h2', null, d.title));
      if (d.lede) r.appendChild(el('p', 'lede', d.lede));
      if (d.paras) d.paras.forEach((p) => r.appendChild(el('p', null, p)));
      if (d.list) { const ul = el('ul'); d.list.forEach((x) => ul.appendChild(el('li', null, x))); r.appendChild(ul); }
      if (d.facts) { const dl = el('dl'); d.facts.forEach(([k, v]) => dl.append(el('dt', null, k), el('dd', null, v))); r.appendChild(dl); }
      if (d.numbers) { const n = el('div', 'nums'); d.numbers.forEach(([v, l]) => { const x = el('div'); x.append(el('b', null, v), el('span', null, l)); n.appendChild(x); }); r.appendChild(n); }
      if (d.uses) {
        r.appendChild(el('p', null, 'This skill is used in these projects. Each one is a world you can enter:'));
        const ch = el('div', 'chips'); d.uses.forEach((s) => { const w = content.work.find((x) => x.slug === s); const b = el('button', null, w.name + ' →'); b.addEventListener('click', (e) => api.openWorld(s, e.currentTarget)); ch.appendChild(b); }); r.appendChild(ch);
      }
      if (d.links && d.links.length) { const l = el('div', 'links'); d.links.forEach(([t, u]) => { const b = el('button', 'btn', t + ' ↗'); b.addEventListener('click', () => api.openUrl(u, t)); l.appendChild(b); }); r.appendChild(l); }
      if (node.path === '~/about/vamsi.txt' || node.path === '~/about/looking-for.txt') { const l = el('div', 'links'); const b = el('button', 'btn warm', 'send a signal'); b.addEventListener('click', () => api.openApp('signal')); const w = el('button', 'btn', 'see the work'); w.addEventListener('click', () => api.openApp('files', { path: '~/work' })); l.append(b, w); r.appendChild(l); }
    }
    flip.addEventListener('click', () => { src = !src; flip.setAttribute('aria-pressed', String(src)); r.classList.remove('flip'); void r.offsetWidth; r.classList.add('flip'); setTimeout(render, 240); });
    api.setTitle(d.title, node.path);
    render();
    return { unmount() { r.remove(); } };
  },
};
