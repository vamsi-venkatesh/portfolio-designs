// Signal: write to Vamsi. Transmit opens your own mail app with it filled in; nothing is sent from this page.
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const INTENTS = [['hire', 'Hiring for an AI role'], ['build', 'A product to build'], ['hello', 'Just saying hello']];

export default {
  mount(body, api, arg) {
    const P = api.content.person;
    const s = el('div', 'sig'); body.appendChild(s);
    const h = el('h2', null, 'Send a signal.');
    const to = el('p', 'to'); to.append(document.createTextNode('to '), el('b', null, P.name), document.createTextNode(' · ' + P.email + ' · ' + P.availability));
    const who = el('div', 'who'); let intent = (arg && arg.intent) || 'hire';
    const btns = INTENTS.map(([k, label]) => { const b = el('button', null, label); b.setAttribute('aria-pressed', String(k === intent)); b.addEventListener('click', () => { intent = k; btns.forEach((x, i) => x.setAttribute('aria-pressed', String(INTENTS[i][0] === k))); }); who.appendChild(b); return b; });
    const name = el('input'); name.placeholder = 'Your name'; name.setAttribute('aria-label', 'Your name'); name.autocomplete = 'name';
    const msg = el('textarea'); msg.placeholder = 'What would you like to build, or ask?'; msg.setAttribute('aria-label', 'Message');
    const row = el('div', 'row'); const tx = el('button', 'btn warm', 'transmit ↗'); const cp = el('button', 'btn', 'copy address');
    const li = el('button', 'btn', 'LinkedIn ↗'); const gh = el('button', 'btn', 'GitHub ↗');
    row.append(tx, cp, li, gh);
    const note = el('p', 'note', 'Transmit opens your own mail app with this filled in. Nothing is sent from this page, and nothing you type here is stored.');
    s.append(h, to, who, name, msg, row, note);
    if (arg && arg.note) msg.value = arg.note + '\n\n';
    api.setTitle('Signal', 'to ' + P.email);

    cp.addEventListener('click', async () => { try { await navigator.clipboard.writeText(P.email); cp.textContent = 'copied ✓'; } catch (e) { cp.textContent = P.email; } setTimeout(() => { cp.textContent = 'copy address'; }, 2200); });
    li.addEventListener('click', () => window.open(P.linkedin, '_blank', 'noopener'));
    gh.addEventListener('click', () => window.open(P.github, '_blank', 'noopener'));
    tx.addEventListener('click', () => {
      const label = INTENTS.find((x) => x[0] === intent)[1];
      const subject = label + (name.value.trim() ? ' · from ' + name.value.trim() : '');
      const bodyTxt = (msg.value.trim() || '') + '\n\n— sent from VV·OS 2126 (vamsivenkatesh.com)';
      // the message leaves as a beam, then your mail app opens
      if (!api.reduced) {
        const r = msg.getBoundingClientRect(); const b = el('i', 'beam'); const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2, x1 = innerWidth - 30, y1 = 18;
        Object.assign(b.style, { left: x0 + 'px', top: y0 + 'px', width: Math.hypot(x1 - x0, y1 - y0) + 'px', transform: `rotate(${Math.atan2(y1 - y0, x1 - x0)}rad) scaleX(0)` });
        document.body.appendChild(b);
        b.animate([{ transform: `rotate(${Math.atan2(y1 - y0, x1 - x0)}rad) scaleX(0)`, opacity: 1 }, { transform: `rotate(${Math.atan2(y1 - y0, x1 - x0)}rad) scaleX(1)`, opacity: 1, offset: 0.6 }, { transform: `rotate(${Math.atan2(y1 - y0, x1 - x0)}rad) scaleX(1)`, opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = () => b.remove();
        msg.animate([{ opacity: 1, filter: 'none' }, { opacity: 0.2, filter: 'blur(3px) brightness(2)' }, { opacity: 1, filter: 'none' }], { duration: 900 });
      }
      api.play('open');
      setTimeout(() => { location.href = 'mailto:' + P.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyTxt); }, api.reduced ? 0 : 650);
      note.textContent = 'Your mail app should be open now with the signal ready to send. If it isn’t, write to ' + P.email + '.';
    });
    return { unmount() { s.remove(); }, onArg(a) { if (a && a.intent) btns[INTENTS.findIndex((x) => x[0] === a.intent)].click(); if (a && a.note) msg.value = a.note + '\n\n'; } };
  },
};
