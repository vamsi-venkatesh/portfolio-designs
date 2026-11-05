// vvsh — the machine's shell. Everything it prints is computed here, in your browser.
import { walk, docText, worldText, sizeOf, fmtSize } from '../fs.js';
import { VAULT } from '../vault.js';
const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const sha = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('');
const fileText = (n) => n.type === 'doc' ? docText(n.doc) : n.type === 'world' ? worldText(n.item) : '';
const CMDS = ['help', 'ls', 'cd', 'pwd', 'cat', 'open', 'tree', 'find', 'whoami', 'sysinfo', 'projects', 'skills', 'ps', 'kill', 'date', 'echo', 'history', 'clear', 'verify', 'tamper', 'hack', 'sudo', 'hire', 'matrix', 'playground', 'lens', 'signal', 'exit', 'ping', 'crack', 'decrypt', 'xray', 'camera', 'github'];

export default {
  mount(body, api) {
    const { content, root, resolve } = api;
    const wrap = el('div', 'term'); const out = el('div', 'out'); out.setAttribute('role', 'log'); out.setAttribute('aria-live', 'polite');
    const form = el('form', 'in'); const lab = el('label'); const inp = el('input'); inp.setAttribute('aria-label', 'Command'); inp.autocomplete = 'off'; inp.spellcheck = false; inp.autocapitalize = 'off';
    form.append(lab, inp); wrap.append(out, form); body.appendChild(wrap);
    let cwd = root; const hist = []; let hi = 0; let busy = false; let isRoot = false;
    const prompt = () => (isRoot ? 'root@2126 ' : 'visitor@2126 ') + cwd.path + (isRoot ? ' #' : ' $');
    lab.textContent = prompt();

    // ---- output helpers: a line is a list of [text, class, onClick]
    function line(...parts) {
      const d = el('div', 'ln');
      for (const p of parts) {
        const [t, c, fn] = typeof p === 'string' ? [p] : p;
        const s = el('span', c || null, t);
        if (fn) { s.classList.add('lk'); s.tabIndex = 0; s.addEventListener('click', fn); s.addEventListener('keydown', (e) => { if (e.key === 'Enter') fn(); }); }
        d.appendChild(s);
      }
      out.appendChild(d); out.scrollTop = out.scrollHeight; return d;
    }
    const sleep = (ms) => new Promise((r) => setTimeout(r, api.reduced ? 0 : ms));
    const nodeLink = (n, label) => [label || (n.type === 'dir' ? n.name + '/' : n.name), n.type === 'dir' ? 'ic' : n.type === 'world' ? 'p' : n.type === 'app' ? 'ok' : 'w', () => api.openNode(n)];

    const C = {
      help() {
        line(['vvsh · the shell of VV·OS 2126', 'w']);
        for (const [c, d] of [
          ['ls [path]', 'list a folder · ls -l for sizes'], ['cd <path>', 'move · cd .., cd ~/work'], ['cat <file>', 'print a file'], ['open <thing>', 'open a project world, folder, file, app or URL'],
          ['tree', 'the whole machine'], ['find <words>', 'search every file'], ['projects', 'the eight worlds'], ['skills [group]', 'what Vamsi can do, and where'],
          ['crack', 'break the PIN on ~/vault/locked.enc'], ['decrypt <file> <pin>', 'open the vault (real AES-256-GCM)'], ['ping <host>', 'real round trips from your browser'], ['xray', 'see through the machine'],
          ['verify', 'SHA-256 seal every file on this machine'], ['tamper', 'change one byte, watch the seal catch it'], ['hack', 'try to break in'],
          ['whoami', 'what this page can see about you'], ['sysinfo', 'the machine'], ['ps · kill <app>', 'running windows'],
          ['hire', 'send Vamsi a signal'], ['matrix', 'rain the code'], ['clear · history · date · exit', '']]) line(['  ' + c.padEnd(30), 'p'], [d, 'd']);
      },
      ls(args) {
        const long = args.includes('-l'); const p = args.find((a) => !a.startsWith('-'));
        const n = p ? resolve(p, cwd) : cwd; if (!n) return line(['ls: no such path: ' + p, 'bad']);
        if (!n.children) return line(nodeLink(n));
        if (long) n.children.forEach((c) => line([fmtSize(sizeOf(c)).padStart(9) + '  ', 'd'], nodeLink(c), [c.type === 'world' ? '   ' + c.sub : c.title && c.type !== 'app' ? '   ' + c.title : '', 'd']));
        else { const d = line(); n.children.forEach((c) => { const [t, cl, fn] = nodeLink(c); const s = el('span', cl + ' lk', t); s.addEventListener('click', fn); d.append(s, document.createTextNode('   ')); }); }
      },
      cd(args) { const n = resolve(args[0] || '~', cwd); if (!n) return line(['cd: no such folder: ' + args[0], 'bad']); if (!n.children) return line(['cd: not a folder: ' + n.name + ' · try open ' + n.name, 'bad']); cwd = n; },
      pwd() { line(cwd.path); },
      cat(args) {
        const n = args[0] && resolve(args[0], cwd); if (!n) return line(['cat: no such file: ' + (args[0] || ''), 'bad']);
        if (n.children) return line(['cat: ' + n.name + ' is a folder · try ls ' + n.name, 'bad']);
        if (n.type === 'app') return line(['cat: ' + n.name + ' is an app · try open ' + n.name, 'bad']);
        if (n.type === 'enc') { line(['-----BEGIN AES-256-GCM-----', 'd']); for (let i = 0; i < Math.min(VAULT.ct.length, 256); i += 64) line([VAULT.ct.slice(i, i + 64), 'ic']); line(['… ' + b64(VAULT.ct).length + ' bytes sealed · try ', 'd'], ['crack', 'p', () => run('crack')]); return; }
        if (n.type === 'file') { line([n.title + ' · ' + fmtSize(n.size) + ' · your file · ', 'd'], ['open it', 'p', () => api.openNode(n)]); return; }
        fileText(n).split('\n').forEach((l) => line([l, l.startsWith('# ') ? 'p' : '']));
        if (n.type === 'world') line(['→ open ' + n.name + ' to enter its world', 'ic', () => api.openNode(n)]);
      },
      open(args) {
        const q = args.join(' '); if (!q) return line(['open what? try: open conxto · open ~/skills · open lens', 'd']);
        if (/^https?:\/\//.test(q) || /^[a-z0-9-]+\.[a-z]{2,}/i.test(q)) { api.openUrl(/^https?:/.test(q) ? q : 'https://' + q); return line(['opening ' + q + ' in the browser', 'ok']); }
        const app = { lens: 'browser', browser: 'browser', chrome: 'browser', files: 'files', finder: 'files', terminal: 'terminal', playground: 'playground', signal: 'signal', mail: 'signal' }[q.toLowerCase()];
        if (app) { api.openApp(app); return line(['opening ' + q, 'ok']); }
        let n = resolve(q, cwd) || resolve('~/work/' + q) || resolve('~/apps/' + q);
        if (!n) walk((x) => { if (!n && ((x.title || '').toLowerCase() === q.toLowerCase())) n = x; });
        if (!n) return line(['open: nothing called ' + q + ' · try find ' + q, 'bad']);
        api.openNode(n); line(['opening ' + (n.title || n.name), 'ok']);
      },
      tree() {
        const rec = (n, pre) => n.children.forEach((c, i) => { const last = i === n.children.length - 1; line([pre + (last ? '└── ' : '├── '), 'd'], nodeLink(c)); if (c.children) rec(c, pre + (last ? '    ' : '│   ')); });
        line(['~', 'ic']); rec(root, '');
      },
      find(args) {
        const q = args.join(' ').toLowerCase(); if (!q) return line(['find what?', 'd']); let k = 0;
        walk((n) => { if (n === root) return; const hay = ((n.title || '') + ' ' + n.name + ' ' + fileText(n)).toLowerCase(); if (hay.includes(q)) { k++; line(nodeLink(n, n.path), [n.title && n.title !== n.name ? '   ' + n.title : '', 'd']); } });
        line([k + ' match' + (k === 1 ? '' : 'es'), 'd']);
      },
      projects() { content.work.forEach((w, i) => line([String(i + 1).padStart(2, '0') + '  ', 'd'], [w.name.padEnd(16), 'p', () => api.openWorld(w.slug)], [w.kind.padEnd(32), ''], [w.status, w.status === 'Live' ? 'ok' : 'd'])); line(['click a name, or: open <name>', 'd']); },
      skills(args) {
        const q = args.join(' ').toLowerCase();
        content.capabilities.forEach(([g, list]) => {
          if (q && !g.toLowerCase().includes(q)) return; line([g, 'w']);
          list.forEach(([s, uses]) => line(['  · ' + s + '  ', ''], ['→ ' + uses.join(', '), 'd']));
        });
      },
      async whoami() {
        line(['visitor', 'w'], [' · no account, no login, no cookie', 'd']);
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const ua = navigator.userAgentData; const plat = (ua && ua.platform) || navigator.platform || '—';
        for (const [k, v] of [['language', navigator.language], ['timezone', tz], ['screen', screen.width + '×' + screen.height + ' @' + devicePixelRatio + 'x'], ['cores', navigator.hardwareConcurrency || '—'], ['platform', plat], ['touch', api.isTouch ? 'yes' : 'no']]) { await sleep(60); line(['  ' + k.padEnd(10), 'd'], [String(v), 'ic']); }
        line(['read locally by this page to show you. not stored, not sent.', 'd']);
      },
      sysinfo() {
        const live = content.work.filter((w) => w.status === 'Live').length; const sk = content.capabilities.reduce((a, g) => a + g[1].length, 0);
        const art = ['   ╭───────╮ ', '  ╱  ╲    │ ', ' │    ╲   │ ', ' │  ──╲── │ ', '  ╲    ╲ ╱  ', '   ╰─────╯  '];
        const rows = [['os', 'VV·OS 2126'], ['host', 'vamsi.machine'], ['location', 'Magdeburg · 52.13°N 11.63°E'], ['owner', content.person.name + ', ' + content.person.role], ['worlds', content.work.length + ' (' + live + ' live)'], ['skills', String(sk)], ['shell', 'vvsh'], ['uptime', Math.round(api.uptime()) + ' s'], ['windows', String(api.wins().length)]];
        rows.forEach(([k, v], i) => line([(art[i] || '            ') + '  ', 'p'], [k.padEnd(10), 'd'], [v, 'w']));
      },
      ps() { line(['PID  APP          TITLE', 'd']); line(['   1  kernel       VV·OS 2126', '']); api.wins().forEach((w, i) => line([String(i + 2).padStart(4) + '  ' + w.app.padEnd(12) + ' ' + w.title + (w.min ? '  (minimised)' : ''), ''])); },
      kill(args) { const n = { lens: 'browser', chrome: 'browser' }[args[0]] || args[0]; if (!n) return line(['kill what? see ps', 'd']); if (n === 'terminal') return line(['kill: I would rather not kill myself. try exit.', 'd']); const ok = api.closeApp(n); line([ok ? 'killed ' + n : 'kill: no window called ' + n, ok ? 'ok' : 'bad']); },
      date() { const d = new Date(); const m = new Date(d); m.setFullYear(d.getFullYear() + 100); line([m.toISOString().slice(0, 10) + ' ' + d.toTimeString().slice(0, 8), 'w'], ['   machine clock (+100 years)', 'd']); line([d.toISOString().slice(0, 10), ''], ['   yours', 'd']); },
      echo(args) { line(args.join(' ')); },
      history() { hist.forEach((h, i) => line([String(i + 1).padStart(4) + '  ', 'd'], h)); },
      clear() { out.replaceChildren(); },
      async verify() {
        line(['sealing every file on this machine with SHA-256…', 'd']);
        const files = []; walk((n) => { if (n.type === 'doc' || n.type === 'world') files.push(n); });
        const digests = [];
        for (const n of files) { const h = await sha(fileText(n)); digests.push(h); await sleep(28); line([h.slice(0, 16) + '…  ', 'ic'], nodeLink(n, n.path)); }
        const seal = await sha(digests.join(''));
        line(['root seal  ', 'p'], [seal, 'w']); line([files.length + ' files · computed here, in your browser, just now', 'd']);
        line(['change one byte anywhere and that seal changes. try ', 'd'], ['tamper', 'p', () => run('tamper')]);
        C._seal = seal; C._digests = digests; C._files = files;
      },
      async tamper(args) {
        if (!C._seal) { line(['first ', 'd'], ['verify', 'p', () => run('verify')], [' to seal the machine.', 'd']); return; }
        const files = C._files; const i = args[0] ? Math.max(0, files.findIndex((f) => f.path.includes(args[0]))) : (Math.random() * files.length) | 0;
        const f = files[i]; const txt = fileText(f); const at = Math.floor(txt.length / 2); const ch = txt[at] === '7' ? '8' : '7';
        const bad = txt.slice(0, at) + ch + txt.slice(at + 1);
        line(['tampering with ' + f.path + ': byte ' + at + ' “' + txt[at] + '” → “' + ch + '”', 'p']); await sleep(300);
        const h2 = await sha(bad); const d2 = C._digests.slice(); d2[i] = h2; const s2 = await sha(d2.join(''));
        line(['  file  was ', 'd'], [C._digests[i].slice(0, 24) + '…', 'ok']); line(['        now ', 'd'], [h2.slice(0, 24) + '…', 'bad']);
        line(['  seal  was ', 'd'], [C._seal.slice(0, 24) + '…', 'ok']); line(['        now ', 'd'], [s2.slice(0, 24) + '…', 'bad']);
        await sleep(200); line(['CAUGHT. one changed byte broke the seal. ', 'bad'], ['this is how VVDex Trading keeps its 2,028 dated calls honest.', 'd']);
        line(['the real files were not changed. ', 'd'], ['open vvdex-trading', 'p', () => api.openWorld('vvdex-trading')]);
      },
      async hack() {
        line(['initiating breach…', 'p']); await sleep(350);
        const dirs = root.children.filter((c) => c.name !== 'apps');
        for (const d of dirs) { await sleep(260); line(['  probing ' + d.path.padEnd(16), ''], ['open', 'ok'], [d.name === 'withdrawn' ? '   (he keeps his failed claims public)' : '', 'd']); }
        await sleep(300); line(['  probing credentials ', ''], ['none needed', 'ok']);
        await sleep(400); line(['result: nothing to break into. every door on this machine is open.', 'w']);
        line(['the part you can’t fake is the proof. try ', 'd'], ['verify', 'p', () => run('verify')], [' then ', 'd'], ['tamper', 'p', () => run('tamper')]);
      },
      sudo(args) { if (/hire/.test(args.join(' '))) return C.hire(); line(['sudo: there is no root here. nothing on this machine is locked.', 'd']); },
      hire() { line(['opening a signal to ' + content.person.first + '…', 'ok']); api.openApp('signal', { intent: 'hire' }); },
      matrix() { api.matrix(8); line(['the code is raining. it is made of the names of his projects.', 'd']); },
      playground() { api.openApp('playground'); line(['opening the playground: the machine’s rules, unlocked', 'ok']); },
      lens(args) { if (args[0]) return C.open(args); api.openApp('browser'); line(['opening the browser', 'ok']); },
      signal() { api.openApp('signal'); line(['opening Signal', 'ok']); },
      exit() { api.close(); },
      async ping(args) {
        const host = (args[0] || 'conxto.com').replace(/^https?:\/\//, '').split('/')[0]; const times = [];
        line(['PING ' + host + ' from your browser', 'w']);
        for (let i = 0; i < 4; i++) {
          const t0 = performance.now();
          try { await fetch('https://' + host + '/?vvping=' + Date.now(), { mode: 'no-cors', cache: 'no-store' }); const ms = performance.now() - t0; times.push(ms); line(['  reply from ' + host + ': seq=' + (i + 1) + ' time=', ''], [ms.toFixed(1) + ' ms', ms < 120 ? 'ok' : 'p']); }
          catch (e) { line(['  seq=' + (i + 1) + ' no reply (offline, or this page’s security policy blocks that host)', 'bad']); }
          await sleep(350);
        }
        if (times.length) line(['  min/avg/max ' + Math.min(...times).toFixed(1) + ' / ' + (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) + ' / ' + Math.max(...times).toFixed(1) + ' ms · real round trips, right now', 'd']);
        else line(['try one of his: ping conxto.com · ping unboundpdf.com · ping farmquick.in', 'd']);
      },
      async crack() {
        line(['target  ~/vault/locked.enc', 'w']); line(['the PIN’s SHA-256 is stored: ' + VAULT.pinHash.slice(0, 32) + '…', 'd']);
        line(['brute force: trying every PIN 0000–9999, hashing each one here', 'p']);
        const prog = line(['', 'ic']); const t0 = performance.now(); const enc = new TextEncoder();
        for (let n = 0; n < 10000; n++) {
          const pin = String(n).padStart(4, '0');
          const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(pin)))].map((b) => b.toString(16).padStart(2, '0')).join('');
          if (n % 97 === 0 || h === VAULT.pinHash) { prog.firstChild.textContent = '  trying ' + pin + '  ' + h.slice(0, 24) + '…  ' + (n + 1) + ' tries'; out.scrollTop = out.scrollHeight; await new Promise((r) => requestAnimationFrame(r)); }
          if (h === VAULT.pinHash) {
            const s = (performance.now() - t0) / 1000;
            line(['  MATCH  ', 'ok'], [pin, 'w'], ['  after ' + (n + 1) + ' tries in ' + s.toFixed(2) + ' s (' + Math.round((n + 1) / s) + ' hashes/s, in your browser)', 'd']);
            line(['a 4-digit PIN falls in seconds. that’s why real systems don’t rely on one. now: ', 'd'], ['decrypt locked.enc ' + pin, 'p', () => run('decrypt locked.enc ' + pin)]);
            api.play('open'); return;
          }
        }
        line(['no match. the vault file is damaged.', 'bad']);
      },
      async decrypt(args) {
        const f = args[0] && (resolve(args[0], cwd) || resolve('~/vault/' + args[0])); const pin = args[1];
        if (!f || f.type !== 'enc') return line(['decrypt: usage: decrypt locked.enc <pin>  (the file is in ~/vault)', 'bad']);
        if (!pin) return line(['decrypt: which PIN? read ~/vault/README.txt, or run crack', 'bad']);
        line(['deriving the key: PBKDF2-SHA-256, ' + VAULT.iterations.toLocaleString('en') + ' rounds …', 'd']); await sleep(50);
        try {
          const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveKey']);
          const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(VAULT.salt), iterations: VAULT.iterations, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
          const pt = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(VAULT.iv) }, key, b64(VAULT.ct))));
          line(['AES-256-GCM  authentication tag verified · vault open', 'ok']); await sleep(300);
          line(['', '']); line([pt.title, 'w']); for (const p of pt.body) { await sleep(250); line([p, '']); }
          line(['', '']); line(['→ ', 'd'], ['send the signal', 'p', () => api.openApp('signal', { intent: 'hire', note: 'I cracked the vault on VV·OS 2126 (PIN ' + pin + ').' })]);
          isRoot = true; lab.textContent = prompt(); api.matrix(4); api.play('world');
        } catch (e) { line(['wrong PIN · the seal held (AES-GCM refused to decrypt: the authentication tag did not match)', 'bad']); }
      },
      xray() { const r = api.xray(); line([r.on ? 'x-ray on: ' + r.count + ' elements in this machine. move over anything to see what it is made of. xray again to turn it off.' : 'x-ray off.', r.on ? 'ok' : 'd']); },
      camera() { api.openApp('camera'); line(['opening Camera · it stays on your device', 'ok']); },
      github(args) { api.openApp('github', args[0] ? { user: args[0] } : null); line(['opening GitHub' + (args[0] ? ' for ' + args[0] : ''), 'ok']); },
    };
    const ALIAS = { dir: 'ls', ll: 'ls -l', man: 'help', '?': 'help', neofetch: 'sysinfo', whois: 'whoami', chrome: 'lens', browser: 'lens', contact: 'signal', mail: 'signal', play: 'playground', cls: 'clear', ssh: 'hack', nmap: 'hack' };

    async function run(raw) {
      const s = raw.trim(); line([prompt() + ' ', 'p'], [s, 'w']); if (!s) return;
      hist.push(s); hi = hist.length;
      let [cmd, ...args] = s.split(/\s+/); cmd = cmd.toLowerCase();
      if (ALIAS[cmd]) { const a = ALIAS[cmd].split(' '); cmd = a[0]; args = [...a.slice(1), ...args]; }
      const fn = C[cmd];
      if (!fn || cmd.startsWith('_')) {
        const n = resolve(s, cwd) || resolve('~/work/' + cmd);
        if (n) return C.open([s]);
        line(['vvsh: unknown command: ' + cmd + ' · try ', 'bad'], ['help', 'p', () => run('help')]); return;
      }
      busy = true; try { await fn(args); } catch (e) { line(['error: ' + e.message, 'bad']); } busy = false;
      lab.textContent = prompt(); api.setTitle('Terminal', cwd.path);
    }

    function complete() {
      const v = inp.value; const parts = v.split(/\s+/);
      if (parts.length === 1) { const m = CMDS.filter((c) => c.startsWith(parts[0])); if (m.length === 1) inp.value = m[0] + ' '; else if (m.length) line([m.join('   '), 'd']); return; }
      const last = parts.pop(); const slash = last.lastIndexOf('/'); const base = slash >= 0 ? last.slice(0, slash) || '/' : ''; const frag = slash >= 0 ? last.slice(slash + 1) : last;
      const dirN = base ? resolve(base === '/' ? '~' : base, cwd) : cwd; if (!dirN || !dirN.children) return;
      const m = dirN.children.filter((c) => c.name.startsWith(frag));
      if (m.length === 1) { inp.value = [...parts, (slash >= 0 ? last.slice(0, slash + 1) : '') + m[0].name + (m[0].children ? '/' : '')].join(' '); }
      else if (m.length) line([m.map((c) => c.name).join('   '), 'd']);
    }
    form.addEventListener('submit', (e) => { e.preventDefault(); if (busy) return; const v = inp.value; inp.value = ''; run(v); });
    inp.addEventListener('keydown', (e) => {
      api.play('key');
      if (e.key === 'Tab') { e.preventDefault(); complete(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) { hi--; inp.value = hist[hi]; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (hi < hist.length - 1) { hi++; inp.value = hist[hi]; } else { hi = hist.length; inp.value = ''; } }
      else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); C.clear(); }
      else if (e.key === 'c' && e.ctrlKey) { line([prompt() + ' ' + inp.value + '^C', 'd']); inp.value = ''; }
    });
    wrap.addEventListener('pointerup', () => { if (!getSelection().toString()) inp.focus({ preventScroll: true }); });

    line(['VV·OS 2126 · vvsh', 'w'], ['   no account needed. you’re in.', 'd']);
    line(['type ', 'd'], ['help', 'p', () => run('help')], [' · or try ', 'd'], ['ls', 'p', () => run('ls')], [' · ', 'd'], ['projects', 'p', () => run('projects')], [' · ', 'd'], ['hack', 'p', () => run('hack')], [' · ', 'd'], ['verify', 'p', () => run('verify')]);
    line(['one door here is locked: ', 'd'], ['~/vault', 'p', () => run('ls ~/vault')], ['. breaking in is allowed.', 'd']);
    setTimeout(() => inp.focus({ preventScroll: true }), 80);
    api.setTitle('Terminal', cwd.path);
    return { unmount() { wrap.remove(); } };
  },
};
