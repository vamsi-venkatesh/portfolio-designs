// The curious visitor (and the start) gets Scale: experiment 01, which the founder liked (2026-11-01).
export default {
  id: 'scale', color: '#0b0d14',
  async mount(root) {
    const f = document.createElement('iframe');
    f.src = '../01-scale/?embed'; f.title = 'Scale'; f.setAttribute('allow', 'autoplay');
    Object.assign(f.style, { position:'absolute', inset:'0', width:'100%', height:'100%', border:'0', display:'block' });
    root.appendChild(f);
    return () => { f.src = 'about:blank'; f.remove(); };
  },
};
