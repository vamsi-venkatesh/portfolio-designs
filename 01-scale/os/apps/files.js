// Files: walk the machine. Folders open on click; worlds, docs and apps preview on click and open on double-click.
import { sizeOf, fmtSize } from '../fs.js';
import * as G from '../glyphs.js';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const PLACES = [['~/work', 'Projects'], ['~/skills', 'Skills'], ['~/about', 'About me'], ['~/how-i-work', 'How I work'], ['~/withdrawn', 'Claims I withdrew'], ['~/you', 'Your files'], ['~/vault', 'Vault'], ['~/apps', 'Apps']];

export default {
  mount(body, api, arg) {
    const { resolve, content } = api;
    const wrap = el('div', 'files'); body.appendChild(wrap);
    const nav = el('nav'); nav.setAttribute('aria-label', 'Places'); nav.appendChild(el('h5', null, 'places'));
    const navBtns = PLACES.map(([p, label]) => {
      const n = resolve(p); const b = el('button'); b.append(G.glyphFor(n), document.createTextNode(label));
      b.addEventListener('click', () => cd(n)); nav.appendChild(b); return [p, b];
    });
    const main = el('div', 'main'); const crumbs = el('div', 'crumbs'); const grid = el('div', 'grid'); grid.setAttribute('role', 'listbox'); main.append(crumbs, grid);
    const pv = el('aside', 'pv'); pv.setAttribute('aria-live', 'polite');
    wrap.append(nav, main, pv);
    let cwd = resolve((arg && arg.path) || '~/work') || resolve('~/work'); let sel = null;

    function cd(n) { if (!n) return; if (n.type !== 'dir') { n = n.parent; } cwd = n; sel = null; render(); api.play && api.play('tick'); }
    function open(n, origin) { if (n.type === 'dir') return cd(n); api.openNode(n, origin); }

    function render() {
      api.setTitle('Files · ' + (cwd.title || cwd.name), cwd.path);
      navBtns.forEach(([p, b]) => b.classList.toggle('on', cwd.path === p || cwd.path.startsWith(p + '/')));
      crumbs.replaceChildren();
      const chain = []; for (let n = cwd; n; n = n.parent) chain.unshift(n);
      chain.forEach((n, i) => { if (i) crumbs.appendChild(el('span', null, '/')); const b = el('button', null, i ? (n.title || n.name) : 'vamsi'); b.addEventListener('click', () => cd(n)); crumbs.appendChild(b); });
      crumbs.appendChild(el('span', 'ct', cwd.children.length + ' items · ' + fmtSize(sizeOf(cwd))));
      grid.replaceChildren();
      if (!cwd.children.length) grid.appendChild(el('p', 's', cwd.name === 'you' ? 'Nothing here yet. Drop files anywhere on the machine, or use “open from my device”.' : 'Empty.'));
      cwd.children.forEach((n) => {
        const b = el('button', 'ico'); b.setAttribute('role', 'option'); if (sel === n) b.classList.add('sel');
        const g = el('span', 'g'); g.appendChild(G.glyphFor(n));
        const label = n.type === 'world' ? n.title : n.type === 'dir' ? (n.title || n.name) : (n.title && n.type === 'app' ? n.title : n.name);
        b.append(g, el('span', 'l', label));
        if (n.type === 'world') b.appendChild(el('span', 's', n.sub));
        else if (n.type === 'dir') b.appendChild(el('span', 's', n.children.length + ' items'));
        else if (n.type === 'doc' || n.type === 'file') b.appendChild(el('span', 's', fmtSize(sizeOf(n))));
        b.addEventListener('click', () => { if (n.type === 'dir') return cd(n); select(n, b); if (api.isTouch && innerWidth > 760) open(n, b); });
        b.addEventListener('dblclick', () => open(n, b));
        b.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); open(n, b); } });
        grid.appendChild(b);
      });
      preview(sel || cwd);
    }
    function select(n, b) { sel = n; [...grid.children].forEach((c) => c.classList.remove('sel')); b && b.classList.add('sel'); preview(n); if (innerWidth <= 760) wrap.classList.add('show-pv'); }

    function preview(n) {
      pv.replaceChildren();
      const back = el('button', 'btn back', '‹ back'); back.addEventListener('click', () => wrap.classList.remove('show-pv')); pv.appendChild(back);
      const big = el('div', 'big'); big.appendChild(G.glyphFor(n)); pv.appendChild(big);
      const acts = el('div', 'acts'); const btn = (t, cls, fn) => { const b = el('button', 'btn ' + (cls || ''), t); b.addEventListener('click', fn); acts.appendChild(b); return b; };
      if (n.type === 'world') {
        const w = n.item; pv.append(el('h3', null, w.name), el('p', 'k', w.kind + ' · ' + w.status), el('p', null, w.line));
        const nums = el('div', 'nums'); w.numbers.forEach(([v, l]) => { const d = el('div'); d.append(el('b', null, v), el('span', null, l)); nums.appendChild(d); }); pv.appendChild(nums);
        btn('enter world', 'warm', (e) => api.openWorld(w.slug, e.currentTarget));
        if (w.url) btn('open live ↗', '', () => api.openUrl(w.url, w.name));
      } else if (n.type === 'doc') {
        const d = n.doc; pv.append(el('h3', null, d.title), el('p', 'k', d.kicker || ''));
        if (d.uses) { pv.appendChild(el('p', null, 'Used in:')); const ch = el('div', 'chips'); d.uses.forEach((s) => { const w = content.work.find((x) => x.slug === s); const c = el('button', null, w.name); c.addEventListener('click', (e) => api.openWorld(s, e.currentTarget)); ch.appendChild(c); }); pv.appendChild(ch); }
        else { const t = (d.lede || (d.paras && d.paras[0]) || ''); pv.appendChild(el('p', null, t.length > 220 ? t.slice(0, 217) + '…' : t)); }
        btn('open', 'warm', (e) => api.openNode(n, e.currentTarget));
      } else if (n.type === 'app') {
        pv.append(el('h3', null, n.title), el('p', 'k', 'app'));
        btn('open', 'warm', (e) => api.openNode(n, e.currentTarget));
      } else if (n.type === 'file') {
        pv.append(el('h3', null, n.title), el('p', 'k', 'your file · ' + (n.mime || 'file')), el('p', null, 'Read by your browser only. It was never uploaded and it disappears when you close this tab.'));
        btn('open', 'warm', (e) => api.openNode(n, e.currentTarget));
      } else if (n.type === 'enc') {
        pv.append(el('h3', null, 'locked.enc'), el('p', 'k', 'sealed · AES-256-GCM'), el('p', null, 'Locked. Read the README, then break in from the terminal.'));
        btn('open a terminal', 'warm', () => api.openApp('terminal'));
      } else {
        pv.append(el('h3', null, n.title || n.name), el('p', 'k', 'folder'), el('p', null, n.children.length + ' items. ' + (n.name === 'work' ? 'Every project is a world. Click one, then enter it.' : n.name === 'skills' ? 'Each skill names the projects that use it.' : n.name === 'withdrawn' ? 'Claims that failed their own test. Kept public.' : n.name === 'you' ? 'Drop any file onto the machine, or pick some. They open in here and never leave your browser.' : n.name === 'vault' ? 'The only locked door on this machine.' : '')));
        if (n.name === 'you') { const pick = el('input'); pick.type = 'file'; pick.multiple = true; pick.hidden = true; pick.addEventListener('change', () => { api.bringFiles(pick.files); render(); }); pv.appendChild(pick); btn('open from my device', 'warm', () => pick.click()); btn('connect my GitHub', '', () => api.openApp('github')); }
      }
      if (acts.children.length) pv.appendChild(acts);
      const meta = el('div', 'meta'); meta.append(el('div', null, 'path  ' + n.path), el('div', null, 'size  ' + fmtSize(sizeOf(n)))); pv.appendChild(meta);
    }

    function onKey(e) { if (e.key === 'Backspace' && document.activeElement && wrap.contains(document.activeElement) && cwd.parent) { e.preventDefault(); cd(cwd.parent); } }
    wrap.addEventListener('keydown', onKey);
    render();
    return { unmount() { wrap.remove(); }, onArg(a) { if (a && a.path) cd(resolve(a.path)); } };
  },
};
