// VV·OS file system: one tree built from the approved copy. Files, Terminal and Search all read it.
import * as C from '../../10-for-you/content.mjs';
export const content = C;

const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const dir = (name, children, extra = {}) => ({ type: 'dir', name, children, ...extra });
const doc = (name, d, extra = {}) => ({ type: 'doc', name, doc: d, ...extra });

const byName = Object.fromEntries(C.work.map((w) => [w.name, w]));

const work = dir('work', C.work.map((w) => ({ type: 'world', name: w.slug, slug: w.slug, title: w.name, color: w.color, sub: w.kind, status: w.status, item: w })), { title: 'Projects', glyph: 'work' });

const skills = dir('skills', C.capabilities.map(([group, list]) => dir(slug(group), list.map(([skill, uses]) => doc(slug(skill).slice(0, 38) + '.skill', {
  kicker: group, title: skill, uses: uses.filter((u) => byName[u]).map((u) => byName[u].slug),
}, { title: skill })), { title: group })), { title: 'Skills', glyph: 'skills' });

const about = dir('about', [
  doc('vamsi.txt', { kicker: 'about', title: C.person.name, lede: C.person.lede, facts: C.about.facts.map(([k, v]) => [k || ' ', v]) }, { title: 'About Vamsi' }),
  doc('looking-for.txt', { kicker: 'looking for', title: C.person.availability, paras: [C.person.wants], list: C.person.roles }, { title: 'What I am looking for' }),
  { type: 'app', name: 'contact.signal', app: 'signal', title: 'Send a signal' },
], { title: 'About me', glyph: 'about' });

const principles = dir('how-i-work', C.principles.map((p, i) => doc(String(i + 1).padStart(2, '0') + '-' + slug(p.k).slice(0, 30) + '.txt', { kicker: 'how I work · ' + (i + 1) + ' / ' + C.principles.length, title: p.k, paras: [p.v] }, { title: p.k })), { title: 'How I work', glyph: 'principles' });

const withdrawn = dir('withdrawn', C.withdrawn.map((w) => doc(slug(w.title).slice(0, 34) + '.txt', { kicker: 'a claim I withdrew', title: w.title, paras: [w.what], numbers: w.numbers, links: w.link ? [w.link] : [] }, { title: w.title })), { title: 'Claims I withdrew', glyph: 'withdrawn' });

const apps = dir('apps', [
  { type: 'app', name: 'files', app: 'files', title: 'Files' },
  { type: 'app', name: 'lens', app: 'browser', title: 'Lens · browser' },
  { type: 'app', name: 'terminal', app: 'terminal', title: 'Terminal' },
  { type: 'app', name: 'playground', app: 'playground', title: 'Playground' },
  { type: 'app', name: 'signal', app: 'signal', title: 'Signal' },
  { type: 'app', name: 'camera', app: 'camera', title: 'Camera' },
  { type: 'app', name: 'github', app: 'github', title: 'GitHub' },
], { title: 'Apps', glyph: 'apps' });

// the vault: a sealed file the terminal can crack (see vault.js; only ciphertext ships)
const vault = dir('vault', [
  doc('README.txt', { kicker: 'vault', title: 'Locked.', paras: ['One file in here is sealed with AES-256-GCM. The key comes from a 4-digit PIN.', 'Hint: the PIN is where this machine stands. Its latitude, without the dot.', 'In the terminal: crack the PIN with `crack`, or guess it, then `decrypt locked.enc <pin>`. Cracking your own way in is allowed here. It’s the only door on this machine that’s locked.'] }, { title: 'README' }),
  { type: 'enc', name: 'locked.enc', title: 'locked.enc' },
], { title: 'Vault', glyph: 'vault' });

// your things: files you drop in, your GitHub. Read by your browser only; never uploaded.
export const you = dir('you', [], { title: 'Your files', glyph: 'you' });

export const root = dir('~', [work, skills, about, principles, withdrawn, you, vault, apps], { title: 'vamsi' });

// parent links + paths
(function link(n, parent, path) {
  n.parent = parent; n.path = path;
  if (n.children) for (const c of n.children) link(c, n, path === '~' ? '~/' + c.name : path + '/' + c.name);
})(root, null, '~');

export function resolve(path, cwd = root) {
  if (!path || path === '~') return root;
  let n = path.startsWith('~') ? root : cwd;
  const parts = path.replace(/^~\/?/, '').split('/').filter(Boolean);
  for (const p of parts) {
    if (p === '.') continue;
    if (p === '..') { n = n.parent || n; continue; }
    if (!n.children) return null;
    const lower = p.toLowerCase();
    n = n.children.find((c) => c.name.toLowerCase() === lower) || n.children.find((c) => c.name.toLowerCase().startsWith(lower) && lower.length >= 3);
    if (!n) return null;
  }
  return n;
}

export function walk(fn, n = root) { fn(n); if (n.children) for (const c of n.children) walk(fn, c); }

// plain-text rendering of a doc, for `cat` and for byte sizes
export function docText(d) {
  const out = [];
  if (d.kicker) out.push('# ' + d.kicker);
  out.push(d.title);
  if (d.lede) out.push('', d.lede);
  if (d.paras) for (const p of d.paras) out.push('', p);
  if (d.list) out.push('', ...d.list.map((x) => '· ' + x));
  if (d.facts) out.push('', ...d.facts.map(([k, v]) => (k.trim() ? k + ': ' : '  ') + v));
  if (d.numbers) out.push('', ...d.numbers.map(([v, l]) => v + '  ' + l));
  if (d.uses) out.push('', 'used in: ' + d.uses.map((s) => C.work.find((w) => w.slug === s).name).join(', '));
  if (d.links) out.push('', ...d.links.map(([l, u]) => l + '  ' + u));
  return out.join('\n');
}
export function worldText(w) { return [w.name + ' · ' + w.kind + ' · ' + w.status, '', w.line, '', ...w.numbers.map(([v, l]) => v + '  ' + l), '', ...w.links.map(([l, u]) => l + '  ' + u)].join('\n'); }
export const bytes = (s) => new TextEncoder().encode(s).length;
export function sizeOf(n) {
  if (n.type === 'doc') return bytes(docText(n.doc));
  if (n.type === 'file') return n.size;
  if (n.type === 'world') return bytes(JSON.stringify(n.item)) + (C.cases[n.slug] ? bytes(JSON.stringify(C.cases[n.slug])) : 0);
  if (n.children) return n.children.reduce((a, c) => a + sizeOf(c), 0);
  return 0;
}
export const fmtSize = (b) => b < 1024 ? b + ' B' : (b / 1024).toFixed(1) + ' kB';

let uid = 0;
export function adopt(parent, node) { node.parent = parent; node.path = parent.path + '/' + node.name; if (node.children) node.children.forEach((c) => adopt(node, c)); parent.children.push(node); return node; }
export function addVisitorFile(file) {
  let name = file.name.replace(/[\/]/g, '_'); if (you.children.some((c) => c.name === name)) name = (++uid) + '-' + name;
  return adopt(you, { type: 'file', name, title: file.name, file, url: URL.createObjectURL(file), size: file.size, mime: file.type || '' });
}
