// Entry: a deep link (#/world/…, #/app/…, #/desk) goes straight into the machine; otherwise the intro plays first.
if (/[?&]embed/.test(location.search)) document.documentElement.classList.add('embed');
const direct = /^#\/(world|app)\//.test(location.hash) || location.hash === '#/desk';
const skip = document.getElementById('skip');
async function machine(fast) {
  for (const id of ['gl', 'id', 'snd', 'hint', 'opened', 'skip', 'kb', 'outside', 'enter']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
  const { bootOS } = await import('./os.js');
  if (location.hash === '#/desk') history.replaceState(null, '', '#/');
  bootOS({ fast });
}
if (direct) machine(true);
else {
  skip.classList.add('on');
  skip.addEventListener('click', () => { location.hash = '#/desk'; location.reload(); });
  import('./breach.js');
}
