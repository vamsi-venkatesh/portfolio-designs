// Viewer: opens a file the visitor brought in. Read by their browser only; never uploaded.
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' kB' : (b / 1048576).toFixed(1) + ' MB';

export default {
  async mount(body, api, node) {
    const wrap = el('div', 'viewer'); body.appendChild(wrap);
    const bar = el('div', 'vbar'); const info = el('span', null, fmt(node.size) + ' · ' + (node.mime || 'unknown type')); const sha = el('span', 'sha', 'sha-256 …'); const proof = el('span', 'ok', 'read here · 0 bytes uploaded');
    bar.append(info, sha, proof); const stage = el('div', 'vstage'); wrap.append(bar, stage);
    api.setTitle(node.title, node.path);
    const m = node.mime;
    if (/^image\//.test(m)) { const i = el('img'); i.src = node.url; i.alt = node.title; stage.appendChild(i); }
    else if (/^video\//.test(m)) { const v = el('video'); v.src = node.url; v.controls = true; v.playsInline = true; stage.appendChild(v); }
    else if (/^audio\//.test(m)) { const a = el('audio'); a.src = node.url; a.controls = true; stage.appendChild(a); }
    else if (m === 'application/pdf') { const f = el('iframe'); f.src = node.url; f.title = node.title; stage.appendChild(f); }
    else if (/^text\/|json|javascript|xml|csv|markdown/.test(m) || /\.(md|txt|js|ts|py|json|csv|html|css|yml|yaml)$/i.test(node.name)) {
      const pre = el('pre'); pre.textContent = node.file.size > 2e6 ? 'This file is ' + fmt(node.file.size) + '. Showing the first 2 MB.\n\n' : ''; stage.appendChild(pre);
      pre.textContent += await node.file.slice(0, 2e6).text();
    } else { const p = el('p', 'none', 'This machine can’t display ' + (m || 'this type') + ' files, but it read the file and fingerprinted it.'); stage.appendChild(p); }
    // fingerprint, locally
    const before = performance.getEntriesByType('resource').length;
    const buf = await node.file.arrayBuffer();
    const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))].map((b) => b.toString(16).padStart(2, '0')).join('');
    sha.textContent = 'sha-256 ' + h.slice(0, 20) + '…'; sha.title = h;
    const after = performance.getEntriesByType('resource').length;
    proof.textContent = 'read here · ' + (after - before) + ' network requests while reading';
    return { unmount() { wrap.remove(); } };
  },
};
