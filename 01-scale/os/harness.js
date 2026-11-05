// QA harness for VV·OS worlds and apps. Mirrors the ctx the OS passes in.
import * as content from '../../10-for-you/content.mjs';

const p = new URLSearchParams(location.search);
const stage = document.getElementById('stage');
const log = document.createElement('div'); log.id = 'log'; document.body.appendChild(log);
const say = (s) => { log.textContent = s; };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || p.has('still');
const isTouch = matchMedia('(pointer: coarse)').matches;
const slugs = content.work.map((w) => w.slug);

let unmount = null;
async function mountWorld(slug) {
  if (unmount) { unmount(); unmount = null; stage.replaceChildren(); }
  const i = slugs.indexOf(slug);
  const ctx = {
    ...content, reduced, isTouch,
    item: content.work[i], caseStudy: content.cases[slug] || null, index: i, total: slugs.length,
    openUrl: (url, title) => say('openUrl → ' + url + (title ? ' (' + title + ')' : '')),
    openApp: (name, arg) => say('openApp → ' + name + (arg ? ' ' + arg : '')),
    close: () => say('close → desktop'),
    next: () => mountWorld(slugs[(i + 1) % slugs.length]),
    prev: () => mountWorld(slugs[(i - 1 + slugs.length) % slugs.length]),
  };
  const mod = await import(`./worlds/${slug}.js`);
  unmount = await mod.default.mount(stage, ctx);
  window.__unmount = () => { unmount && unmount(); unmount = null; };
}

if (p.get('world')) mountWorld(p.get('world'));
else if (p.get('app')) {
  stage.classList.add('win');
  const name = p.get('app');
  const mod = await import(`./apps/${name}.js`);
  const ctx = { ...content, reduced, isTouch, openApp: (n, a) => say('openApp → ' + n + ' ' + (a || '')), openUrl: (u) => say('openUrl → ' + u) };
  unmount = await mod.default.mount(stage, ctx);
  window.__unmount = () => { unmount && unmount(); unmount = null; };
}
window.__ready = true;
