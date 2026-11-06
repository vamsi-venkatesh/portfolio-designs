// Sound, generated in the browser (no files): a low ambient hum that opens up while you fly, a whoosh through
// each portal, soft keys while the name types. On by default; browsers only allow audio after the visitor's
// first click, tap or key press, so it starts then. The visitor's choice is remembered on their device.
const KEY = "vv-sound";
let pref = true;
try { const v = localStorage.getItem(KEY); if (v != null) pref = v === "1"; } catch (e) {}

let ctx = null, master = null, hum = null, humFilter = null, noiseBuf = null;
const listeners = new Set();
const emit = () => listeners.forEach((f) => f(state()));
export const state = () => ({ on: pref, running: !!ctx && ctx.state === "running" });
export const onChange = (f) => { listeners.add(f); f(state()); };

function build() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  // noise buffer shared by whoosh, air and keys
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0); let b = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b = 0.97 * b + 0.03 * w; d[i] = b * 3.2; }
  // hum: two detuned low tones and a fifth, through a lowpass that opens with speed
  humFilter = ctx.createBiquadFilter(); humFilter.type = "lowpass"; humFilter.frequency.value = 320; humFilter.Q.value = 0.7;
  hum = ctx.createGain(); hum.gain.value = 0.16; humFilter.connect(hum); hum.connect(master);
  [[55, "sawtooth", 0.05], [55.4, "sawtooth", 0.05], [82.4, "sine", 0.18], [110, "sine", 0.06]].forEach(([f, type, g]) => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; const gg = ctx.createGain(); gg.gain.value = g; o.connect(gg); gg.connect(humFilter); o.start();
  });
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 60; lfo.connect(lg); lg.connect(humFilter.frequency); lfo.start();
  const air = ctx.createBufferSource(); air.buffer = noiseBuf; air.loop = true;
  const af = ctx.createBiquadFilter(); af.type = "bandpass"; af.frequency.value = 900; af.Q.value = 0.4;
  const ag = ctx.createGain(); ag.gain.value = 0.02; air.connect(af); af.connect(ag); ag.connect(master); air.start();
}
function fade(to) { if (!master) return; const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setTargetAtTime(to, t, 0.4); }

function unlock() {
  if (!pref) return;
  if (!ctx) build();
  if (ctx.state !== "running") ctx.resume().then(() => { fade(0.55); emit(); });
  else fade(0.55);
  emit();
}
["pointerdown", "keydown", "touchend"].forEach((ev) => addEventListener(ev, unlock, { passive: true }));

export function toggle() {
  pref = !pref; try { localStorage.setItem(KEY, pref ? "1" : "0"); } catch (e) {}
  if (pref) unlock(); else fade(0);
  emit();
}
const live = () => pref && ctx && ctx.state === "running";
export function speed(w) { if (live()) humFilter.frequency.setTargetAtTime(320 + w * 1600, ctx.currentTime, 0.15); }
export function whoosh(strength = 1) {
  if (!live()) return; const t = ctx.currentTime;
  const s = ctx.createBufferSource(); s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 1.2; f.frequency.setValueAtTime(260, t); f.frequency.exponentialRampToValueAtTime(2600, t + 0.45); f.frequency.exponentialRampToValueAtTime(500, t + 1.1);
  const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.42 * strength, t + 0.35); g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + 1.3);
  const o = ctx.createOscillator(), og = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(90, t + 0.3); o.frequency.exponentialRampToValueAtTime(45, t + 1.1);
  og.gain.setValueAtTime(0, t + 0.28); og.gain.linearRampToValueAtTime(0.22 * strength, t + 0.36); og.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
  o.connect(og); og.connect(master); o.start(t + 0.28); o.stop(t + 1.2);
}
export function key() {
  if (!live()) return; const t = ctx.currentTime;
  const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 2400;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
  s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + 0.05);
}
