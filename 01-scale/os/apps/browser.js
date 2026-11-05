// Lens: a browser inside the machine. The products load live — the real sites, not pictures —
// wherever their own security headers allow it (checked 2026-11-01 with curl).
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const VV = ['https://vamsivenkatesh.com', 'https://www.vamsivenkatesh.com'];
const LOCAL = ['http://localhost:4425', 'http://127.0.0.1:4425'];
const FRAME = {
  'conxto.com': [...VV, ...LOCAL], 'unboundpdf.com': [...VV, ...LOCAL], 'lab.vvdexops.com': [...VV, ...LOCAL], 'trading.vvdexops.com': [...VV, ...LOCAL],
  'vvdexops.com': VV, 'farmquick.in': '*', 'conxfolio.com': '*',
  // the open web that agrees to be shown inside another page (checked 2026-11-01)
  'en.wikipedia.org': '*', 'de.wikipedia.org': '*', 'en.m.wikipedia.org': '*', 'openstreetmap.org': '*', 'youtube-nocookie.com': '*', 'archive.org': '*',
};
const SEARCH = (q) => 'https://en.wikipedia.org/w/index.php?search=' + encodeURIComponent(q);
const WEB = [
  ['Wikipedia · Magdeburg', 'https://en.wikipedia.org/wiki/Magdeburg', 'the city this machine stands in', '#cfe6ff'],
  ['Map · Magdeburg', 'https://www.openstreetmap.org/export/embed.html?bbox=11.58%2C52.10%2C11.68%2C52.16&layer=mapnik&marker=52.13%2C11.63', 'OpenStreetMap, live', '#9fe3b8'],
  ['Internet Archive', 'https://archive.org/', 'the web’s memory', '#ffd2a0'],
];
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };
const canFrame = (u) => { const r = FRAME[hostOf(u)]; return !!r && (r === '*' || r.includes(location.origin)); };
const START = 'vv://start';

export default {
  mount(body, api, arg) {
    const { content } = api;
    const root = el('div', 'lens'); body.appendChild(root);
    const tabsBar = el('div', 'tabs'); tabsBar.setAttribute('role', 'tablist');
    const tools = el('div', 'tools');
    const bBack = el('button', null, '‹'); bBack.setAttribute('aria-label', 'Back');
    const bFwd = el('button', null, '›'); bFwd.setAttribute('aria-label', 'Forward');
    const bRe = el('button', null, '↻'); bRe.setAttribute('aria-label', 'Reload');
    const form = el('form'); const addr = el('input'); addr.setAttribute('aria-label', 'Search or type an address'); addr.placeholder = 'Search the web or type an address'; addr.spellcheck = false; form.appendChild(addr);
    const lock = el('span', 'lock', ''); const prof = el('button', 'prof', 'G'); prof.title = 'Guest'; prof.setAttribute('aria-label', 'Profile: guest');
    prof.addEventListener('click', () => go(cur, 'vv://you'));
    const bExt = el('button', null, '↗'); bExt.setAttribute('aria-label', 'Open in a new tab'); bExt.title = 'Open in a new tab';
    tools.append(bBack, bFwd, bRe, form, lock, bExt, prof);
    const views = el('div', 'view'); const prog = el('i', 'prog'); const lstat = el('span', 'lstat'); views.append(prog, lstat);
    root.append(tabsBar, tools, views);
    const tabs = []; let cur = null;

    function newTab(url, title) {
      const t = { hist: [], idx: -1, title: title || '', pane: el('div') };
      Object.assign(t.pane.style, { position: 'absolute', inset: '0' }); views.appendChild(t.pane);
      tabs.push(t); select(t); go(t, url || START, title); return t;
    }
    function select(t) {
      cur = t; tabs.forEach((x) => { x.pane.style.display = x === t ? '' : 'none'; }); renderTabs(); syncBar();
    }
    function closeTab(t) {
      const i = tabs.indexOf(t); tabs.splice(i, 1); t.pane.remove();
      if (!tabs.length) return newTab(START);
      if (cur === t) select(tabs[Math.max(0, i - 1)]); else renderTabs();
    }
    function renderTabs() {
      tabsBar.replaceChildren();
      tabs.forEach((t) => {
        const b = el('div', 'tab' + (t === cur ? ' on' : '')); b.setAttribute('role', 'tab'); b.tabIndex = 0;
        b.append(el('span', null, t.title || 'New tab')); const x = el('i', null, '×'); x.setAttribute('aria-label', 'Close tab');
        x.addEventListener('click', (e) => { e.stopPropagation(); closeTab(t); }); b.appendChild(x);
        b.addEventListener('click', () => select(t)); tabsBar.appendChild(b);
      });
      const add = el('button', 'add', '+'); add.setAttribute('aria-label', 'New tab'); add.addEventListener('click', () => newTab(START)); tabsBar.appendChild(add);
      if (cur) api.setTitle(cur.title || 'New tab', cur.hist[cur.idx] || '');
    }
    function syncBar() {
      if (!cur) return; const u = cur.hist[cur.idx] || START;
      addr.value = u; lock.textContent = u.startsWith('https://') ? 'https ✓' : u.startsWith('vv://') ? 'local' : '';
      bBack.disabled = cur.idx <= 0; bFwd.disabled = cur.idx >= cur.hist.length - 1; bExt.style.visibility = u.startsWith('http') ? '' : 'hidden';
      views.classList.toggle('int', !u.startsWith('http') || !canFrame(u));
    }
    function go(t, url, title, push = true) {
      if (push) { t.hist = t.hist.slice(0, t.idx + 1); t.hist.push(url); t.idx = t.hist.length - 1; }
      t.pane.replaceChildren(); lstat.classList.remove('on');
      if (url.startsWith('vv://')) { renderInternal(t, url); }
      else if (canFrame(url)) {
        const h = hostOf(url); t.title = title || productName(h) || h;
        const f = document.createElement('iframe'); f.title = t.title; f.src = url; f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        f.setAttribute('allow', 'clipboard-write'); const t0 = performance.now();
        prog.style.transition = 'none'; prog.style.width = '0'; void prog.offsetWidth; prog.style.transition = 'width 2.5s cubic-bezier(.1,.7,.2,1)'; prog.style.width = '78%';
        f.addEventListener('load', () => {
          const ms = Math.round(performance.now() - t0); prog.style.transition = 'width .25s'; prog.style.width = '100%'; setTimeout(() => { prog.style.width = '0'; }, 400);
          if (t === cur) { lstat.textContent = 'live · ' + h + ' · loaded in ' + ms + ' ms'; lstat.classList.add('on'); setTimeout(() => lstat.classList.remove('on'), 4200); }
        });
        t.pane.appendChild(f);
      } else { const h = hostOf(url); t.title = title || productName(h) || h; renderBlocked(t, url); }
      if (t === cur) { renderTabs(); syncBar(); }
    }
    function productName(h) { const w = content.work.find((x) => x.url && hostOf(x.url) === h); return w ? w.name : h.includes('wikipedia') ? 'Wikipedia' : h.includes('openstreetmap') ? 'Map' : h === 'archive.org' ? 'Internet Archive' : ''; }
    function renderInternal(t, url) {
      if (url === 'vv://you') {
        t.title = 'You'; const s = el('div', 'start'); const h = el('h2'); h.append(document.createTextNode('You’re a '), el('em', null, 'guest.'));
        s.append(h, el('p', 's', 'This machine never asks for your passwords.'),
          el('p', 'gp', 'Your accounts stay in your own browser. A site you sign in to inside another site would be a trap, so real sites refuse it, and this machine respects that.'),
          el('p', 'gp', 'What you can bring in safely: your files (drop them anywhere, they never leave your browser), your camera (it stays on your device), and your public GitHub (username only).'));
        const row = el('div', 'tiles');
        for (const [lab, sub, fn] of [['Your files', 'drop or pick from your device', () => api.openApp('files', { path: '~/you' })], ['Camera', 'see yourself as the machine does', () => api.openApp('camera')], ['GitHub', 'your public profile and repos', () => api.openApp('github')]]) { const b = el('button', 'tile'); b.append(el('b', null, lab), el('em', null, sub)); b.addEventListener('click', fn); row.appendChild(b); }
        s.appendChild(row); t.pane.appendChild(s); return;
      }
      t.title = 'Start';
      const s = el('div', 'start'); const h = el('h2'); h.append(document.createTextNode('The web, '), el('em', null, 'from inside.'));
      const sf = el('form', 'sbox'); const si = el('input'); si.placeholder = 'Search the web from 2126'; si.setAttribute('aria-label', 'Search the web'); const sg = el('button', 'btn', 'Google ↗'); sg.type = 'button'; sg.title = 'Opens in a new tab';
      sg.addEventListener('click', () => window.open('https://www.google.com/search?q=' + encodeURIComponent(si.value), '_blank', 'noopener'));
      sf.append(si, sg); sf.addEventListener('submit', (e) => { e.preventDefault(); if (si.value.trim()) go(t, SEARCH(si.value.trim())); });
      const web = el('div', 'tiles'); WEB.forEach(([n, u, d, c]) => { const b = el('button', 'tile'); b.style.setProperty('--c', c); b.append(el('b', null, n), el('em', null, d)); b.addEventListener('click', () => go(t, u, n)); web.appendChild(b); });
      s.append(sf, web, el('p', 's2', 'His work: the real sites, running inside this machine.'));
      const tiles = el('div', 'tiles');
      content.work.forEach((w) => {
        const b = el('button', 'tile'); b.style.setProperty('--c', w.color);
        const live = w.url && canFrame(w.url);
        b.append(el('b', null, w.name), el('span', null, (w.host || 'private') + ' · ' + w.status.toLowerCase() + (w.url ? (live ? ' · opens live here' : ' · opens in a new tab here') : '')), el('em', null, w.one));
        b.addEventListener('click', () => { if (w.url) go(t, w.url, w.name); else api.openWorld(w.slug, b); });
        tiles.appendChild(b);
      });
      s.appendChild(tiles); t.pane.appendChild(s);
    }
    function renderBlocked(t, url) {
      const h = hostOf(url); const box = el('div', 'blocked'); const d = el('div');
      const knows = !!FRAME[h];
      d.append(el('h3', null, knows ? h + ' opens live on vamsivenkatesh.com.' : h + ' won’t open inside another page.'),
        el('p', null, knows ? 'Its own security headers only let it load inside this machine when the machine runs at vamsivenkatesh.com. Here it opens in a new tab.' : 'The site’s own security headers refuse to be shown inside another site. That’s the right call for it, so it opens in a new tab.'));
      const b = el('button', 'btn warm', 'open ' + h + ' in a new tab ↗'); b.addEventListener('click', () => window.open(url, '_blank', 'noopener')); d.appendChild(b);
      box.appendChild(d); t.pane.appendChild(box);
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault(); let u = addr.value.trim(); if (!u) return;
      if (/^vv:\/\/work\/([a-z0-9-]+)/.test(u)) return api.openWorld(u.split('/').pop());
      if (!/^(https?|vv):\/\//.test(u)) u = (/\s/.test(u) || !/\.[a-z]{2,}(\/|$)/i.test(u)) ? SEARCH(u) : 'https://' + u;
      go(cur, u); addr.blur();
    });
    bBack.addEventListener('click', () => { if (cur.idx > 0) { cur.idx--; go(cur, cur.hist[cur.idx], null, false); } });
    bFwd.addEventListener('click', () => { if (cur.idx < cur.hist.length - 1) { cur.idx++; go(cur, cur.hist[cur.idx], null, false); } });
    bRe.addEventListener('click', () => go(cur, cur.hist[cur.idx], cur.title, false));
    bExt.addEventListener('click', () => { const u = cur.hist[cur.idx]; if (u && u.startsWith('http')) window.open(u, '_blank', 'noopener'); });

    function onArg(a) {
      if (!a || !a.url) return;
      const ex = tabs.find((t) => t.hist[t.idx] === a.url); if (ex) return select(ex);
      if (cur && cur.hist[cur.idx] === START && cur.hist.length === 1) return go(cur, a.url, a.title);
      newTab(a.url, a.title);
    }
    newTab(START);
    if (arg && arg.url) onArg(arg);
    return { unmount() { root.remove(); }, onArg };
  },
};
