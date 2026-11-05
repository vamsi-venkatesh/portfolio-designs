// GitHub: bring your public GitHub into this machine. Username only, public data only, no password, no sign-in.
import { you, adopt } from '../fs.js';
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

export default {
  mount(body, api, arg) {
    const wrap = el('div', 'gh'); body.appendChild(wrap);
    const form = el('form', 'ghf'); const inp = el('input'); inp.placeholder = 'your GitHub username'; inp.setAttribute('aria-label', 'GitHub username'); inp.autocapitalize = 'off'; inp.spellcheck = false;
    const go = el('button', 'btn warm', 'connect'); form.append(inp, go);
    const note = el('p', 'note', 'Public data only, from GitHub’s public API. No password, no sign-in, nothing stored by this site.');
    const try1 = el('button', 'btn', 'or see vamsi-venkatesh'); try1.addEventListener('click', () => { inp.value = 'vamsi-venkatesh'; load(); });
    const out = el('div', 'ghout');
    wrap.append(el('h2', null, 'Bring your GitHub inside.'), form, el('div', 'row'), note, out); wrap.children[2].appendChild(try1);
    api.setTitle('GitHub', 'public data');
    let ctl = null;
    async function load() {
      const u = inp.value.trim().replace(/^@/, ''); if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(u)) { out.replaceChildren(el('p', 'bad', 'That isn’t a GitHub username.')); return; }
      ctl && ctl.abort(); ctl = new AbortController(); out.replaceChildren(el('p', 'note', 'connecting to api.github.com …'));
      try {
        const [pr, rr] = await Promise.all([fetch('https://api.github.com/users/' + u, { signal: ctl.signal }), fetch('https://api.github.com/users/' + u + '/repos?sort=updated&per_page=40', { signal: ctl.signal })]);
        if (pr.status === 404) { out.replaceChildren(el('p', 'bad', 'No GitHub user called ' + u + '.')); return; }
        if (!pr.ok) { out.replaceChildren(el('p', 'bad', 'GitHub answered ' + pr.status + (pr.status === 403 ? ' (its hourly limit for visitors without sign-in). Try again later.' : '.'))); return; }
        const p = await pr.json(); const repos = rr.ok ? await rr.json() : [];
        const head = el('div', 'ghhead'); const img = el('img'); img.src = p.avatar_url; img.alt = ''; img.width = 64; img.height = 64;
        const who = el('div'); who.append(el('b', null, p.name || p.login), el('span', null, '@' + p.login + (p.location ? ' · ' + p.location : '')));
        if (p.bio) who.appendChild(el('em', null, p.bio));
        head.append(img, who);
        const stats = el('div', 'ghstats'); for (const [v, l] of [[p.public_repos, 'public repos'], [p.followers, 'followers'], [new Date(p.created_at).getFullYear(), 'on GitHub since']]) { const d = el('div'); d.append(el('b', null, String(v)), el('span', null, l)); stats.appendChild(d); }
        const list = el('ul', 'ghrepos');
        repos.forEach((r) => { const li = el('li'); const a = el('button', null, r.name); a.addEventListener('click', () => window.open(r.html_url, '_blank', 'noopener')); li.append(a, el('span', null, [r.language, '★ ' + r.stargazers_count, 'updated ' + r.updated_at.slice(0, 10)].filter(Boolean).join(' · '))); if (r.description) li.appendChild(el('em', null, r.description)); list.appendChild(li); });
        const add = el('button', 'btn warm', 'put these in my files'); add.addEventListener('click', () => {
          const name = 'github-' + p.login; let d = you.children.find((c) => c.name === name);
          if (!d) { d = adopt(you, { type: 'dir', name, title: 'GitHub · ' + p.login, children: [] }); repos.forEach((r) => adopt(d, { type: 'doc', name: r.name + '.repo', title: r.name, doc: { kicker: 'your repo · ' + (r.language || 'repo'), title: r.name, paras: [r.description || 'No description.'], facts: [['stars', String(r.stargazers_count)], ['forks', String(r.forks_count)], ['updated', r.updated_at.slice(0, 10)]], links: [['Open on GitHub', r.html_url]] } })); }
          api.openApp('files', { path: d.path });
        });
        out.replaceChildren(head, stats, add, list);
      } catch (e) { if (e.name !== 'AbortError') out.replaceChildren(el('p', 'bad', 'Couldn’t reach GitHub from here.')); }
    }
    form.addEventListener('submit', (e) => { e.preventDefault(); load(); });
    if (arg && arg.user) { inp.value = arg.user; load(); }
    return { unmount() { ctl && ctl.abort(); wrap.remove(); }, onArg(a) { if (a && a.user) { inp.value = a.user; load(); } } };
  },
};
