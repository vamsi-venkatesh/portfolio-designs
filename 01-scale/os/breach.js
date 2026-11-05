// Breach — first slice. A cursor on dark glass; a desk at dusk in Magdeburg; a seam in the room; the room's source; the fall into the lattice.
import * as THREE from '../../vendor/three.module.js';
import { K, buildRoom, buildSource, buildLattice } from './scene.js';
import { bootOS } from './os.js';

const qs = new URLSearchParams(location.search);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches || qs.has('still');
const CAPTURE = qs.has('capture');
const TOUCH = matchMedia('(pointer: coarse)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, TOUCH ? 1.5 : 2);
const $ = (id) => document.getElementById(id);
const canvas = $('gl');

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: CAPTURE }); }
catch (e) { $('err').style.display = 'block'; throw e; }
renderer.setPixelRatio(DPR);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const SAMPLES = TOUCH ? 2 : 4;
const mkRT = (ms) => new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: ms ? SAMPLES : 0, depthBuffer: !!ms });
const rtLat = mkRT(true), rtRoom = mkRT(true), rtSrc = mkRT(true), rtComp = mkRT(false);
const rtBright = mkRT(false), rtA = mkRT(false), rtB = mkRT(false);

await Promise.race([Promise.all([document.fonts.load('italic 26px "Instrument Serif"'), document.fonts.load('300 11px "Martian Mono"')]), new Promise((r) => setTimeout(r, 2500))]);

const room = buildRoom(rtLat.texture);
const src = buildSource(room, rtLat.texture);
const lat = buildLattice();
// the screen shows the machine you are about to enter: the VV·OS desktop, as a real monitor would
const deskTex = new THREE.TextureLoader().load('./desk-screen.jpg'); deskTex.colorSpace = THREE.SRGBColorSpace; deskTex.anisotropy = 8;
for (const m of [room.pm, src.pm]) { m.uniforms.tLat.value = deskTex; m.uniforms.uFlat.value = 1; }

const cam = new THREE.PerspectiveCamera(36, 1, 0.01, 40);
const latCam = new THREE.PerspectiveCamera(36, 1, 0.5, 9000);
const NAV = { T: { active: false }, hasRoute: () => false, step() {}, activate() {}, chambers() {}, ITEMS: [] };
// when you fall through the glass, the machine boots
const OSB = { started: false, halted: false };
function goOS() {
  if (OSB.started) return; OSB.started = true;
  const on = $('snd').getAttribute('aria-pressed') === 'true';
  for (const id of ['id', 'snd', 'hint', 'opened', 'skip', 'kb', 'outside', 'enter']) $(id).style.display = 'none';
  bootOS({ sound: on });
  setTimeout(() => { OSB.halted = true; try { audio.ctx && audio.ctx.close(); } catch (e) {} canvas.style.display = 'none'; renderer.dispose(); renderer.forceContextLoss(); }, 1800);
}

/* ---------------------------------------------------------------- post */
const fsScene = new THREE.Scene(), fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const fsMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); fsMesh.frustumCulled = false; fsScene.add(fsMesh);
const VS = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
const pass = (mat, target) => { fsMesh.material = mat; renderer.setRenderTarget(target); renderer.render(fsScene, fsCam); };

const compMat = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: {
  tRoom: { value: rtRoom.texture }, tSrc: { value: rtSrc.texture }, tLat: { value: rtLat.texture },
  uRes: { value: new THREE.Vector2() }, uDpr: { value: DPR }, uTime: { value: 0 },
  uO: { value: new THREE.Vector2() }, uD: { value: new THREE.Vector2(1, 0) }, uSeam: { value: 0 }, uSeamHalf: { value: 0 }, uGlint: { value: -9999 }, uHover: { value: 0 },
  uSA: { value: 0 }, uSB: { value: 0 }, uW: { value: 0 }, uOpen: { value: 0 }, uX: { value: 0 }, uLat: { value: 0 }, uRipple: { value: 0 } },
  fragmentShader: `uniform sampler2D tRoom,tSrc,tLat; uniform vec2 uRes,uO,uD; uniform float uDpr,uTime,uSeam,uSeamHalf,uGlint,uHover,uSA,uSB,uW,uOpen,uX,uLat,uRipple; varying vec2 vUv;
    vec2 toUv(vec2 px){ return vec2(px.x, uRes.y/uDpr-px.y)*uDpr/uRes; }
    vec3 lum3(vec3 c){ return vec3(dot(c,vec3(.299,.587,.114))); }
    vec3 roomAt(vec2 px){ return min(texture2D(tRoom,toUv(px)).rgb,vec3(24.)); }
    void main(){
      vec2 px=vec2(vUv.x,1.-vUv.y)*uRes/uDpr; vec2 N=vec2(-uD.y,uD.x); vec2 rel=px-uO; float s=dot(rel,uD), n=dot(rel,N);
      float len=max(uSB-uSA,1e-3); float x=(s-uSA)/len; float lens=(x>0.&&x<1.)?pow(sin(3.14159*x),.8):0.;
      float seamMask=uSeam*smoothstep(uSeamHalf,uSeamHalf-60.,abs(s));
      vec2 mis=(uD*1.6+N*0.7)*step(0.,n)*seamMask*(1.+uHover);
      vec3 room=roomAt(px+mis);
      vec3 srcC=min(texture2D(tSrc,vUv).rgb,vec3(24.));
      vec3 col=room;
      float a=uW*lens;                       // upper flap: folded back over the film
      float al=uW*lens*mix(0.16,1.0,uOpen);   // lower edge: a torn lip
      if(a>0.5){
        if(n<0.){
          float m=-n; float R=clamp(a*0.10+2.,2.,14.);
          if(m<a){
            float e=a-m; float sh=1.-0.72*exp(-e/(9.+a*0.22));
            col=srcC*sh+vec3(0.55,0.78,1.)*exp(-e/2.)*0.25;
          } else if(m<2.*a){
            float mm=2.*a-m; vec3 back=roomAt(uO+uD*s-N*mm);
            back=mix(lum3(back),back,.35)*0.40+vec3(0.10,0.104,0.112);
            float fk=(m-a)/R; float curl=exp(-fk*0.9);
            float spec=exp(-pow((fk-0.7)*1.5,2.));
            col=back*(0.62+0.55*curl)+vec3(1.,.95,.88)*spec*0.42;
            col*=1.-0.35*smoothstep(0.35,0.,fk);
            col+=vec3(1.,.96,.9)*exp(-pow((2.*a-m)/1.1,2.))*0.55;
          } else {
            float e=m-2.*a; col=room*(1.-0.55*exp(-e/(5.+a*0.08)));
          }
        } else {
          if(n<al){ col=srcC*(1.-0.6*exp(-(al-n)/7.)); }
          else { float e=n-al; col=room*(1.-0.4*exp(-e/4.)); col+=vec3(1.,.93,.82)*exp(-e*e/1.2)*0.4; }
        }
      }
      float lineW=0.55+0.6*uHover; float ln=exp(-n*n/(lineW*lineW))*seamMask*(1.-smoothstep(0.,3.,a));
      float gl=exp(-pow((s-uGlint)/70.,2.));
      col+=ln*vec3(1.,.9,.76)*(0.35+0.5*uHover+2.2*gl);
      col+=exp(-n*n/36.)*seamMask*gl*vec3(1.,.85,.65)*0.05;
      col=mix(col,srcC,uX);
      if(uLat>0.){
        vec2 c=vUv-.5; c.x*=uRes.x/uRes.y; float r=length(c);
        float w=sin(r*28.-uTime*6.)*exp(-r*2.5)*uRipple; vec2 off=normalize(c+1e-4)*w*0.008;
        vec3 L=min(vec3(texture2D(tLat,vUv+off*1.15).r,texture2D(tLat,vUv+off).g,texture2D(tLat,vUv+off*0.85).b),vec3(24.));
        L+=vec3(0.6,0.8,1.)*uRipple*0.04*exp(-r*3.);
        col=mix(col,L,uLat);
      }
      gl_FragColor=vec4(col,1.);
    }` });
const brightMat = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { t: { value: rtComp.texture } },
  fragmentShader: `uniform sampler2D t; varying vec2 vUv; void main(){ vec3 c=texture2D(t,vUv).rgb; float l=max(max(c.r,c.g),c.b); float k=smoothstep(.75,2.2,l); gl_FragColor=vec4(c*k,1.); }` });
const blurMat = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { t: { value: null }, uDir: { value: new THREE.Vector2() } },
  fragmentShader: `uniform sampler2D t; uniform vec2 uDir; varying vec2 vUv; void main(){ vec3 s=texture2D(t,vUv).rgb*0.227; s+=(texture2D(t,vUv+uDir*1.385).rgb+texture2D(t,vUv-uDir*1.385).rgb)*0.316; s+=(texture2D(t,vUv+uDir*3.23).rgb+texture2D(t,vUv-uDir*3.23).rgb)*0.07; gl_FragColor=vec4(s,1.); }` });
const finalMat = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { t: { value: rtComp.texture }, tB: { value: rtA.texture }, uRes: { value: new THREE.Vector2() }, uTime: { value: 0 }, uFade: { value: 0 }, uExp: { value: 1.05 }, uCA: { value: 0.0012 }, uBloom: { value: 0.7 } },
  fragmentShader: `uniform sampler2D t,tB; uniform vec2 uRes; uniform float uTime,uFade,uExp,uCA,uBloom; varying vec2 vUv;
    vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.); }
    float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
    void main(){ vec2 c=vUv-.5; vec3 col=vec3(texture2D(t,vUv-c*uCA).r,texture2D(t,vUv).g,texture2D(t,vUv+c*uCA).b);
      col+=texture2D(tB,vUv).rgb*uBloom; col*=uExp; col=aces(col);
      float v=smoothstep(1.05,.25,length(c*vec2(1.,.82))); col*=mix(.62,1.,v);
      col=pow(col,vec3(1./2.2)); col+=(h(vUv*uRes+fract(uTime*7.)*91.)-.5)*0.028; col*=uFade; gl_FragColor=vec4(col,1.); }` });

/* ---------------------------------------------------------------- layout */
let W = 1, H = 1, portrait = false;
const base = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 36 };
const seam = { o: new THREE.Vector2(), d: new THREE.Vector2(1, 0), sMin: 0, sMax: 1, half: 1 };
function layout() {
  W = window.innerWidth; H = window.innerHeight; portrait = W / H < 0.85;
  renderer.setSize(W, H, false);
  const bw = Math.round(W * DPR), bh = Math.round(H * DPR);
  for (const rt of [rtRoom, rtSrc, rtComp]) rt.setSize(bw, bh);
  const ls = Math.min(DPR, TOUCH ? 1.0 : 1.25) / DPR; rtLat.setSize(Math.round(bw * ls), Math.round(bh * ls));
  rtBright.setSize(bw >> 1, bh >> 1); rtA.setSize(bw >> 2, bh >> 2); rtB.setSize(bw >> 2, bh >> 2);
  for (const m of [room.pm, src.pm]) m.uniforms.uRes.value.set(bw, bh);
  compMat.uniforms.uRes.value.set(bw, bh); finalMat.uniforms.uRes.value.set(bw, bh);
  room.dustMat.uniforms.uPx.value = DPR * (portrait ? 0.8 : 1) * bh / 900; lat.nodeMat.uniforms.uPx.value = Math.min(DPR, 1.25) * H / 900;
  const aspect = W / H; cam.aspect = latCam.aspect = aspect;
  if (portrait) { base.fov = 64; base.pos.set(0.10, 1.24, -0.40); base.look.set(0.10, 1.22, -1.85); }
  else { base.fov = aspect > 1.9 ? 34 : 38; base.pos.set(-0.02, 1.27, 0.30); base.look.set(0.02, 1.17, -1.85); }
  cam.fov = base.fov; cam.updateProjectionMatrix();
  // seam passes through the slab, rising gently to the right
  cam.position.copy(base.pos); cam.lookAt(base.look); cam.updateMatrixWorld();
  const c = new THREE.Vector3(); room.face.getWorldPosition(c); c.y += 0.02; c.project(cam);
  seam.o.set((c.x * 0.5 + 0.5) * W, (-c.y * 0.5 + 0.5) * H);
  const ang = portrait ? -0.36 : -0.13; seam.d.set(Math.cos(ang), Math.sin(ang));
  seam.sMin = -seam.o.x / seam.d.x; seam.sMax = (W - seam.o.x) / seam.d.x; seam.half = Math.max(-seam.sMin, seam.sMax) + 40;
  compMat.uniforms.uO.value.copy(seam.o); compMat.uniforms.uD.value.copy(seam.d);
  const hs = seam.sMin + (seam.sMax - seam.sMin) * (portrait ? 0.08 : 0.16), hint = $('hint');
  const hx = seam.o.x + seam.d.x * hs + seam.d.y * 26, hy = seam.o.y + seam.d.y * hs - seam.d.x * 26;
  hint.style.transform = `translate(${hx}px,${hy}px) rotate(${ang}rad) translateY(-50%)`;
}
addEventListener('resize', layout); layout();

/* ---------------------------------------------------------------- audio */
const audio = { ctx: null, on: false, master: null, tear: null, film: null, latG: null };
function initAudio() {
  if (audio.ctx) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  const ctx = new AC(); audio.ctx = ctx; const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination); audio.master = master;
  const noise = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate); const d = noise.getChannelData(0); let last = 0;
  for (let i = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const white = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const w = white.getChannelData(0); for (let i = 0; i < w.length; i++) w[i] = Math.random() * 2 - 1;
  const loop = (buf) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };
  // reverb
  const ir = ctx.createBuffer(2, ctx.sampleRate * 4, ctx.sampleRate); for (let ch = 0; ch < 2; ch++) { const x = ir.getChannelData(ch); for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / x.length, 3.2); }
  const verb = ctx.createConvolver(); verb.buffer = ir; const verbG = ctx.createGain(); verbG.gain.value = 0.5; verb.connect(verbG).connect(master);
  // room tone
  const rt = loop(noise); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; const rg = ctx.createGain(); rg.gain.value = 0.11; rt.connect(lp).connect(rg).connect(master);
  // resonant tear tone (A, E, C#)
  const tearG = ctx.createGain(); tearG.gain.value = 0; tearG.connect(master); tearG.connect(verb);
  for (const [f, g] of [[220, 0.5], [329.63, 0.32], [554.37, 0.16], [880, 0.05]]) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; const og = ctx.createGain(); og.gain.value = g; o.connect(og).connect(tearG); o.start(); }
  audio.tear = tearG;
  const film = loop(white); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 2.5; const fg = ctx.createGain(); fg.gain.value = 0; film.connect(bp).connect(fg).connect(master); audio.film = fg;
  // the lattice: a deep airy space
  const latG = ctx.createGain(); latG.gain.value = 0; latG.connect(master); latG.connect(verb); audio.latG = latG;
  for (const [f, g] of [[55, 0.45], [82.41, 0.3], [110.3, 0.22], [164.8, 0.12], [246.9, 0.05]]) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05 + Math.random() * 0.1; const lg = ctx.createGain(); lg.gain.value = f * 0.004; lfo.connect(lg).connect(o.frequency); lfo.start(); const og = ctx.createGain(); og.gain.value = g; o.connect(og).connect(latG); o.start(); }
  const air = loop(noise); const ahp = ctx.createBiquadFilter(); ahp.type = 'bandpass'; ahp.frequency.value = 900; ahp.Q.value = 0.6; const ag = ctx.createGain(); ag.gain.value = 0.25; air.connect(ahp).connect(ag).connect(latG);
  setSound(true);
}
function setSound(on) {
  audio.on = on; const b = $('snd'); b.setAttribute('aria-pressed', String(on)); b.querySelector('em').textContent = on ? 'sound on' : 'sound off';
  if (audio.ctx) { if (on) audio.ctx.resume(); audio.master.gain.setTargetAtTime(on ? 0.55 : 0, audio.ctx.currentTime, 0.4); }
}
$('snd').addEventListener('pointerdown', (e) => e.stopPropagation());
$('snd').addEventListener('click', (e) => { e.stopPropagation(); if (!audio.ctx) initAudio(); else setSound(!audio.on); });
const aset = (node, v, tc = 0.12) => { if (audio.ctx && node) node.gain.setTargetAtTime(v, audio.ctx.currentTime, tc); };


/* ---------------------------------------------------------------- state */
const INTRO_END = REDUCED ? 0 : 12.0; const EXT = 7.6; // outside 0–7.6 s, then round the desk
const S = { phase: 'intro', t: 0, speed: 1, seamAt: INTRO_END + (REDUCED ? 0.4 : 0.3), readyAt: INTRO_END + (REDUCED ? 1.0 : 1.9), lastInput: 0,
  sA: 0, sB: 0, w: 0, drag: null, open: null, revealAt: 0, fallAt: 0, latAt: 0, labelsAt: -1, hover: 0, X: 0, latMix: 0, openU: 0 };
const ease = (u) => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const u = clamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const sOf = (x, y) => (x - seam.o.x) * seam.d.x + (y - seam.o.y) * seam.d.y;
const nOf = (x, y) => -(x - seam.o.x) * seam.d.y + (y - seam.o.y) * seam.d.x;
const seamLen = () => seam.sMax - seam.sMin;
const progress = () => (S.sB - S.sA) / seamLen();
const canBreach = () => S.phase === 'intro' && S.t > S.seamAt || S.phase === 'ready';

function startOpen() {
  if (S.open) return; S.phase = 'opening'; S.drag = null; canvas.classList.remove('dragging'); $('hint').classList.remove('on');
  S.open = { t: S.t, sA: S.sA, sB: S.sB, w: S.w }; if (S.labelsAt < 0) S.labelsAt = S.t;
  if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) {}
}
function autoTear() {
  if (!canBreach()) return; S.phase = 'auto'; S.autoAt = S.t; $('hint').classList.remove('on');
  const s0 = seam.sMin + seamLen() * 0.30; S.sA = S.sB = s0; if (S.labelsAt < 0) S.labelsAt = S.t;
}
function reducedBreach() { if (!canBreach()) return; S.phase = 'rm-src'; S.rmAt = S.t; $('hint').classList.remove('on'); S.labelsAt = S.t; }
const skipIntro = () => { if (S.t < INTRO_END) S.speed = 6; };
const breachByKey = () => { gesture(); if (S.t < INTRO_END) return skipIntro(); REDUCED ? reducedBreach() : autoTear(); };
function gesture() { S.lastInput = S.t; if (!audio.ctx && !CAPTURE) initAudio(); }

const ptr = { x: -1e4, y: -1e4, nx: 0, ny: 0, down: false, sx: 0, sy: 0, st: 0, moved: false, lastS: 0, vel: 0 };
canvas.addEventListener('pointerdown', (e) => {
  if (NAV.T.active) { gesture(); NAV.pointerDown(e); return; }
  gesture(); ptr.down = true; ptr.sx = e.clientX; ptr.sy = e.clientY; ptr.st = S.t; ptr.moved = false;
  if (S.t < INTRO_END) { skipIntro(); ptr.down = false; return; }
  if (REDUCED || !canBreach()) return;
  try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  const s = sOf(e.clientX, e.clientY); S.drag = { s0: s, tip: s, n: nOf(e.clientX, e.clientY) };
  if (S.sB - S.sA < 2) { S.sA = s - 10; S.sB = s + 10; }
  S.phase = 'drag'; canvas.classList.add('dragging'); ptr.lastS = s; $('hint').classList.remove('on');
});
addEventListener('pointermove', (e) => {
  if (NAV.T.active) NAV.pointerMove(e);
  ptr.x = e.clientX; ptr.y = e.clientY; ptr.nx = e.clientX / W * 2 - 1; ptr.ny = e.clientY / H * 2 - 1;
  if (ptr.down && Math.hypot(e.clientX - ptr.sx, e.clientY - ptr.sy) > 8) ptr.moved = true;
  if (S.phase === 'drag' && S.drag) { const s = sOf(e.clientX, e.clientY); S.drag.tip = s; S.drag.n = nOf(e.clientX, e.clientY); ptr.vel = Math.abs(s - ptr.lastS); ptr.lastS = s; if (S.labelsAt < 0) S.labelsAt = S.t; }
});
const up = (e) => {
  if (NAV.T.active) { NAV.pointerUp(e); ptr.down = false; return; }
  if (!ptr.down) return; ptr.down = false;
  const tap = !ptr.moved && S.t - ptr.st < 0.5;
  if (REDUCED) { if (tap) reducedBreach(); return; }
  if (S.phase === 'drag') {
    canvas.classList.remove('dragging');
    if (tap) { S.drag = null; S.phase = 'ready'; autoTear(); return; }
    if (progress() > 0.30) startOpen(); else { S.drag = null; S.phase = 'ready'; }
  }
};
addEventListener('pointerup', up); addEventListener('pointercancel', up);
addEventListener('keydown', (e) => {
  if (NAV.T.active || OSB.started) return;
  if (S.t < INTRO_END) { gesture(); skipIntro(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && canBreach()) { e.preventDefault(); breachByKey(); }
});
$('kb').addEventListener('click', breachByKey); $('enter').addEventListener('click', (e) => { e.stopPropagation(); breachByKey(); }); $('enter').addEventListener('pointerdown', (e) => e.stopPropagation());
let tilt = null; addEventListener('deviceorientation', (e) => { if (e.beta != null) tilt = { x: clamp01((e.gamma + 30) / 60) * 2 - 1, y: clamp01((e.beta - 20) / 60) * 2 - 1 }; });

/* ---------------------------------------------------------------- portal camera mapping */
const faceInv = new THREE.Matrix4().copy(room.face.matrixWorld).invert();
const tmpM = new THREE.Matrix4(), tmpS = new THREE.Vector3();
function mapLatCam() { tmpM.multiplyMatrices(faceInv, cam.matrixWorld); tmpM.decompose(latCam.position, latCam.quaternion, tmpS); latCam.position.multiplyScalar(K); latCam.fov = cam.fov; latCam.updateProjectionMatrix(); }
const faceQ = new THREE.Quaternion(); room.face.getWorldQuaternion(faceQ);
const faceP = new THREE.Vector3(); room.face.getWorldPosition(faceP);
const faceN = new THREE.Vector3(0, 0, 1).applyQuaternion(faceQ);
const fall = { p0: new THREE.Vector3(), q0: new THREE.Quaternion(), fov0: 36 };
const lattice = { vel: 0, base: new THREE.Quaternion(), pos: new THREE.Vector3(), look: new THREE.Vector2() };

/* ---------------------------------------------------------------- intro: cursor + typed name on the glass */
const NAME = 'Vamsi Venkatesh', ROLE = 'AI PRODUCT ENGINEER · MAGDEBURG';
const ig = room.introCanvas.getContext('2d'); const [IW, IH] = room.introSize;
const F1 = 'italic 400px "Instrument Serif", Georgia, serif', F2 = '300 84px "Martian Mono", Menlo, monospace';
const X1 = 240, Y1 = 524, X2 = 252, Y2 = 768;
let typed = [-1, -1];
function drawIntro(n1, n2) {
  if (typed[0] === n1 && typed[1] === n2) return; typed = [n1, n2];
  const c = room.introCanvas; ig.clearRect(0, 0, c.width, c.height); ig.fillStyle = '#fff';
  ig.font = F1; ig.letterSpacing = '0px'; ig.fillText(NAME.slice(0, n1), X1, Y1);
  ig.font = F2; ig.letterSpacing = '18px'; ig.fillStyle = 'rgba(205,215,230,0.85)'; ig.fillText(ROLE.slice(0, n2), X2, Y2);
  room.introTex.needsUpdate = true;
  // cursor rectangle in uv (y up)
  let x0, y0, y1;
  if (n2 <= 0) { ig.font = F1; ig.letterSpacing = '0px'; x0 = X1 + ig.measureText(NAME.slice(0, n1)).width + 32; y0 = 184; y1 = 544; }
  else { ig.font = F2; ig.letterSpacing = '18px'; x0 = X2 + ig.measureText(ROLE.slice(0, n2)).width + 12; y0 = 692; y1 = 784; }
  room.introMat.uniforms.uCur.value.set(x0 / c.width, 1 - y1 / c.height, (x0 + (n2 <= 0 ? 34 : 18)) / c.width, 1 - y0 / c.height);
}
const curWorld = new THREE.Vector3(), focus = new THREE.Vector3(), introQB = new THREE.Quaternion();
function cursorWorld(out) {
  const u = room.introMat.uniforms.uCur.value; out.set(((u.x + u.z) / 2 - 0.5) * IW, ((u.y + u.w) / 2 - 0.5) * IH, 0);
  return room.intro.localToWorld(out);
}
drawIntro(0, 0); room.scene.updateMatrixWorld(true); cursorWorld(focus);

/* ---------------------------------------------------------------- labels */
const camRight = new THREE.Vector3(), camUp = new THREE.Vector3(), tmpV = new THREE.Vector3(), tmpA = new THREE.Vector3();
const PHONE_SCR = { 'slab · 2126': [0.53, 0.50], 'Magdeburger Dom': [0.035, 0.13] };
function placeLabels(alpha) {
  camRight.set(1, 0, 0).applyQuaternion(cam.quaternion); camUp.set(0, 1, 0).applyQuaternion(cam.quaternion);
  const perPx = (p) => 2 * p.distanceTo(cam.position) * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) / H;
  const scale = portrait ? 0.72 : (W < 1200 ? 0.85 : 1);
  src.labels.forEach((L, i) => {
    const title = L.L.title;
    const a = alpha * clamp01((S.t - S.labelsAt - 0.25 - i * 0.16) / 0.7) * (portrait && !PHONE_SCR[title] ? 0 : 1);
    L.m.visible = L.ln.visible = L.dot.visible = a > 0.001; if (!L.m.visible) return;
    tmpA.copy(L.anchor).project(cam); const az = tmpA.z, ax = (tmpA.x * 0.5 + 0.5) * W;
    const wpx = L.px * scale;
    let sx, sy;
    if (portrait) { sx = PHONE_SCR[title][0] * W; sy = PHONE_SCR[title][1] * H; }
    else { tmpV.copy(L.posD).project(cam); sx = (tmpV.x * 0.5 + 0.5) * W; sy = (-tmpV.y * 0.5 + 0.5) * H; }
    sx = Math.min(Math.max(sx, 14), W - 14 - wpx);
    const P = tmpV.set(sx / W * 2 - 1, -(sy / H * 2 - 1), az).unproject(cam).clone();
    const k = perPx(P);
    L.m.scale.set(wpx * k, L.py * scale * k, 1); L.m.quaternion.copy(cam.quaternion);
    L.m.position.copy(P).addScaledVector(camRight, wpx * k * 0.5).addScaledVector(camUp, -L.py * scale * k * 0.18);
    const end = ax > sx + wpx * 0.5 ? P.clone().addScaledVector(camRight, wpx * k) : P;
    const at = L.ln.geometry.attributes.position; at.setXYZ(1, end.x, end.y, end.z); at.needsUpdate = true;
    L.m.material.opacity = a; L.ln.material.opacity = a * 0.6; L.dot.material.opacity = a; L.dot.quaternion.copy(cam.quaternion); L.dot.scale.setScalar(perPx(L.anchor) * 2.6);
  });
  const da = alpha * clamp01((S.t - S.labelsAt - 0.9) / 0.8) * (portrait ? 0.7 : 1);
  src.dimMat.opacity = da * 0.8;
  src.dimObjs.forEach((D) => { const k = perPx(D.pos) * scale; D.m.scale.set(D.px * k, D.py * k, 1); D.m.quaternion.copy(cam.quaternion); D.m.position.copy(D.pos); D.m.material.opacity = da; });
}
let lastMug = 0;
function liveLabels() {
  if (S.t - lastMug < 0.6) return; lastMug = S.t;
  const L = src.labels.find((l) => l.live === 'mug'); if (!L) return;
  const temp = (61.4 - (S.t - Math.max(S.labelsAt, 0)) * 0.013 + Math.sin(S.t * 3) * 0.04).toFixed(1);
  const steam = (0.31 + Math.sin(S.t * 1.7) * 0.02).toFixed(2);
  L.L.draw([['temp', temp + ' °C'], ['steam', steam + ' g/min'], ['fill', '68 %']]); L.tex.needsUpdate = true;
}

/* ---------------------------------------------------------------- loop */
let frames = 0, fpsT = performance.now() / 1000;
window.__breach = { fps: 0, phase: () => S.phase, S, seam, room, INTRO_END };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const baseQ = new THREE.Quaternion(); const lookM = new THREE.Matrix4();
const ORBIT_C = new THREE.Vector3(0.12, 1.02, -1.78), EXT_L0 = new THREE.Vector3(-0.05, 0.4, -2.6), tmpLook = new THREE.Vector3();
const EXT_CURVE = new THREE.CatmullRomCurve3([V3(-0.05, -11.5, -21), V3(-0.05, -9.2, -17.6), V3(0.15, -3.2, -10.5), V3(0.42, 1.75, -5.2), V3(0.45, 1.62, -2.42)]);
function tick(dtReal) {
  const now = performance.now() / 1000; frames++; if (now - fpsT > 1) { window.__breach.fps = frames / (now - fpsT); frames = 0; fpsT = now; }
  if (S.t >= INTRO_END) S.speed = 1;
  const dt = dtReal * S.speed; S.t += dt; const t = S.t;
  const U = compMat.uniforms;
  // ---- intro timing
  const fadeIn = REDUCED ? clamp01(t / 0.9) : smooth(0.05, 0.9, t);
  const wake = REDUCED ? 1 : ease(clamp01((t - 7.0) / 3.0));
  room.extU.uTime.value = t; $('outside').classList.toggle('on', !REDUCED && t > 0.5 && t < 4.3); $('enter').classList.toggle('on', S.phase === 'ready');
  room.pm.uniforms.uWake.value = wake; src.pm.uniforms.uWake.value = 1; room.slabGlow.intensity = 0.35 * wake;
  const seamDraw = REDUCED ? 1 : ease(clamp01((t - S.seamAt) / 1.6));
  U.uSeam.value = Math.min(1, seamDraw * 4) * (S.phase === 'falling' || S.phase === 'lattice' ? 0 : 1);
  U.uSeamHalf.value = 30 + seamDraw * seam.half;
  if (S.phase === 'intro' && t > S.readyAt) S.phase = 'ready';
  if (S.phase === 'ready' && !S.hintUsed) { $('hint').classList.add('on'); S.hintUsed = true; S.lastInput = Math.max(S.lastInput, t); }
  if (t > INTRO_END - 0.6) $('id').classList.add('on');
  if (t > 0.8) $('snd').classList.add('on');
  if (S.phase === 'ready' && t - Math.max(S.lastInput, S.readyAt) > 12) REDUCED ? reducedBreach() : autoTear();
  U.uGlint.value = (S.phase === 'ready' || S.phase === 'intro') && t > S.seamAt ? seam.sMin - 200 + ((t - S.seamAt) % 3.8) / 3.8 * (seamLen() + 400) : -1e5;
  const near = !TOUCH && S.phase === 'ready' ? Math.exp(-Math.pow(nOf(ptr.x, ptr.y) / 45, 2)) : 0;
  S.hover += (near - S.hover) * Math.min(1, dt * 6); U.uHover.value = S.hover;
  // ---- typing on the glass
  if (!REDUCED) {
    const n1 = Math.round(clamp01((t - 8.4) / 1.3) * NAME.length), n2 = Math.round(clamp01((t - 9.95) / 1.0) * ROLE.length);
    drawIntro(n1, n2);
    const typing = (t > 8.35 && t < 9.75) || (t > 9.9 && t < 11.0);
    room.introMat.uniforms.uBlink.value = typing ? 1 : (Math.floor(t / 0.53) % 2 === 0 ? 1 : 0.0) * (t > INTRO_END + 1 ? 0 : 1);
    room.introMat.uniforms.uA.value = t < INTRO_END ? 1 : (S.phase === 'falling' || S.phase === 'lattice' ? Math.max(0, 0.55 - (t - S.fallAt) * 0.8) : 1 - 0.45 * smooth(INTRO_END, INTRO_END + 2, t));
  } else { drawIntro(NAME.length, ROLE.length); room.introMat.uniforms.uBlink.value = 0; room.introMat.uniforms.uA.value = 0.55; }
  // ---- tear dynamics
  const L = seamLen(), W0 = 0.11 * Math.min(W, H) + 18;
  if (S.phase === 'drag' && S.drag) {
    const tA = Math.min(S.drag.s0, S.drag.tip) - 10, tB = Math.max(S.drag.s0, S.drag.tip) + 10; const pr = progress();
    const k = Math.min(1, dt * 14 * (1 - 0.55 * clamp01(pr / 0.5)));
    S.sA += (tA - S.sA) * k; S.sB += (tB - S.sB) * k;
    const pull = Math.min(Math.abs(S.drag.n), 120) * 0.22;
    const Wt = W0 * (1 - Math.exp(-(S.sB - S.sA) / (0.22 * L))) + pull;
    S.w += (Wt - S.w) * Math.min(1, dt * 10);
    if (pr > 0.62) startOpen();
    aset(audio.tear, 0.05 + 0.25 * clamp01(pr / 0.6)); aset(audio.film, Math.min(0.05, ptr.vel * 0.004), 0.05); ptr.vel *= 0.8;
  } else if (S.phase === 'auto') {
    const u = clamp01((t - S.autoAt) / 1.25); const e = ease(u); const s0 = seam.sMin + L * 0.30;
    S.sA = s0 - 10 - L * 0.08 * e; S.sB = s0 + 10 + L * 0.42 * e;
    S.w = W0 * (1 - Math.exp(-(S.sB - S.sA) / (0.22 * L)));
    aset(audio.tear, 0.05 + 0.25 * e);
    if (u >= 1) startOpen();
  } else if (S.phase === 'ready') {
    const m = (S.sA + S.sB) / 2; const k = Math.min(1, dt * 7); S.sA += (m - S.sA) * k; S.sB += (m - S.sB) * k; S.w += (0 - S.w) * k;
    aset(audio.tear, 0, 0.25); aset(audio.film, 0, 0.1);
  }
  if (S.phase === 'opening') {
    const u = clamp01((t - S.open.t) / 1.45); const e = ease(u); const diag = Math.hypot(W, H);
    S.sA = S.open.sA + (seam.sMin - 2.2 * diag - S.open.sA) * e; S.sB = S.open.sB + (seam.sMax + 2.2 * diag - S.open.sB) * e;
    S.w = S.open.w + (1.6 * diag - S.open.w) * Math.pow(e, 1.25); S.openU = e;
    aset(audio.tear, 0.3 * (1 - u) + 0.08, 0.3); aset(audio.film, 0, 0.1);
    if (u >= 1) { S.phase = 'reveal'; S.revealAt = t; }
  }
  if (S.phase === 'reveal' && t - S.revealAt > 1.9) { S.phase = 'falling'; S.fallAt = t; fall.p0.copy(cam.position); fall.q0.copy(cam.quaternion); fall.fov0 = cam.fov; aset(audio.tear, 0, 1.2); aset(audio.latG, 0.5, 1.2); }
  U.uSA.value = S.sA; U.uSB.value = S.sB; U.uW.value = S.w; U.uOpen.value = S.openU;
  if (REDUCED) {
    if (S.phase === 'rm-src') { S.X = clamp01((t - S.rmAt) / 1.2); if (t - S.rmAt > 3.4) { S.phase = 'rm-lat'; S.rmLat = t; } }
    if (S.phase === 'rm-lat') { S.latMix = clamp01((t - S.rmLat) / 1.6); if (S.latMix >= 1 && !S.saidIt) { S.saidIt = true; goOS(); } }
    U.uX.value = S.X;
  }
  // ---- camera
  cam.near = t < EXT ? 0.05 : 0.01; cam.far = t < INTRO_END ? 200 : 40;
  if (S.phase !== 'falling' && S.phase !== 'lattice') {
    lookM.lookAt(base.pos, base.look, V3(0, 1, 0)); baseQ.setFromRotationMatrix(lookM);
    if (t < INTRO_END) {
      // one continuous move: the street at night -> up the facade -> in through our window -> round the desk to the chair
      if (t < EXT) {
        const sl = t < 3.6 ? 0.22 * (t / 3.6) : 0.22 + 0.78 * ease(clamp01((t - 3.6) / (EXT - 3.6)));
        cam.position.copy(EXT_CURVE.getPoint(sl));
        tmpLook.copy(EXT_L0).lerp(ORBIT_C, smooth(3.9, 6.4, t)); cam.lookAt(tmpLook);
      } else {
        const e = ease(clamp01((t - EXT) / (INTRO_END - EXT)));
        const v0 = base.pos.clone().sub(ORBIT_C); const r1 = Math.hypot(v0.x, v0.z); const a0 = Math.atan2(v0.x, v0.z);
        const a = a0 + Math.PI * (1 - e), r = 0.62 + (r1 - 0.62) * smooth(0, 1, e);
        cam.position.set(ORBIT_C.x + Math.sin(a) * r, 1.55 + (base.pos.y - 1.55) * e, ORBIT_C.z + Math.cos(a) * r);
        if (e >= 1) cam.position.copy(base.pos);
        tmpLook.copy(ORBIT_C).lerp(base.look, smooth(0.55, 1, e)); cam.lookAt(tmpLook);
      }
    } else {
      const b = REDUCED ? 0 : smooth(INTRO_END, INTRO_END + 2.5, t);
      cam.position.copy(base.pos);
      cam.position.x += b * (Math.sin((t - INTRO_END) * 0.21) * 0.012 + (TOUCH ? 0 : ptr.nx * 0.025));
      cam.position.y += b * (Math.sin((t - INTRO_END) * 0.33) * 0.006 - (TOUCH ? 0 : ptr.ny * 0.012));
      cam.lookAt(base.look);
    }
    cam.fov = base.fov; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    mapLatCam();
  } else if (S.phase === 'falling') {
    const u = clamp01((t - S.fallAt) / 2.7);
    const e = u * u * (2 - u) * 0.62 + ease(u) * 0.38;
    const P1 = faceP.clone().addScaledVector(faceN, 0.85), P2 = faceP.clone().addScaledVector(faceN, -0.004);
    const a = fall.p0.clone().lerp(P1, e), b = P1.clone().lerp(P2, e); cam.position.copy(a.lerp(b, e));
    cam.quaternion.copy(fall.q0).slerp(faceQ, ease(clamp01(u * 1.25)));
    cam.fov = fall.fov0 + (50 - fall.fov0) * ease(u); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    mapLatCam();
    const zLocal = cam.position.clone().sub(faceP).dot(faceN);
    if (zLocal < 0.012 || u >= 1) { S.phase = 'lattice'; S.latAt = t; lattice.pos.copy(latCam.position); lattice.base.copy(latCam.quaternion); document.body.classList.add('deep'); const eu = new THREE.Euler().setFromQuaternion(latCam.quaternion, 'YXZ'); NAV.activate(latCam.position.x, latCam.position.y, latCam.position.z, eu.y, eu.x, -300); }
  }
  if (S.phase === 'lattice') {
    const lt = t - S.latAt;
    U.uLat.value = 0; U.uRipple.value = 0;
    if (lt > 0.35) goOS();
  } else if (REDUCED && S.latMix > 0) {
    if (!NAV.T.active) NAV.activate(0, 20, -260, 0.12, 0.06, 0);
    NAV.step(dt, t, 0); latCam.fov = 52; latCam.updateProjectionMatrix();
    U.uLat.value = 0; U.uRipple.value = 0;
  }
  latCam.updateMatrixWorld();
  lat.sky.position.copy(latCam.position);
  lat.moteMat.uniforms.uCam.value.set(latCam.position.x, latCam.position.y, Math.min(latCam.position.z, 0));
  // ---- the lattice is alive: the rose turns, chambers breathe and spin
  latCam.updateMatrixWorld(); NAV.chambers(dt, t);
  // ---- uniforms + labels
  lat.uniforms.uTime.value = t; lat.uniforms.uGain.value = 1.0;
  room.pm.uniforms.uTime.value = src.pm.uniforms.uTime.value = t;
  room.beamMat.uniforms.uTime.value = t; room.dustMat.uniforms.uTime.value = t; room.steamMats.forEach((m) => m.uniforms.uTime.value = t);
  room.mug.children.forEach((c) => { if (c.material && c.material.uniforms && c.material.uniforms.uSeed) c.lookAt(cam.position.x, c.getWorldPosition(tmpV).y, cam.position.z); });
  const labelAlpha = S.labelsAt < 0 ? 0 : (S.phase === 'falling' ? clamp01(1 - (t - S.fallAt) / 0.6) : S.phase === 'lattice' ? 0 : 1);
  placeLabels(labelAlpha); if (S.labelsAt >= 0) liveLabels();
  src.rayMat.opacity = 0.55 * (S.labelsAt < 0 ? 0 : 1);
  U.uTime.value = t;
  // ---- render
  const inLat = false; // the old lattice is gone: inside the glass is the desktop
  if (!inLat) {
    renderer.setRenderTarget(rtRoom); renderer.render(room.scene, cam);
    if (S.w > 0.5 || S.X > 0 || (S.phase !== 'ready' && S.phase !== 'intro')) { renderer.setRenderTarget(rtSrc); renderer.render(src.scene, cam); }
  }
  pass(compMat, rtComp);
  brightMat.uniforms.t.value = rtComp.texture; pass(brightMat, rtBright);
  const bw = rtA.width, bh = rtA.height;
  blurMat.uniforms.t.value = rtBright.texture; blurMat.uniforms.uDir.value.set(1.5 / bw, 0); pass(blurMat, rtA);
  blurMat.uniforms.t.value = rtA.texture; blurMat.uniforms.uDir.value.set(0, 1.5 / bh); pass(blurMat, rtB);
  blurMat.uniforms.t.value = rtB.texture; blurMat.uniforms.uDir.value.set(3.5 / bw, 0); pass(blurMat, rtA);
  blurMat.uniforms.t.value = rtA.texture; blurMat.uniforms.uDir.value.set(0, 3.5 / bh); pass(blurMat, rtB);
  finalMat.uniforms.tB.value = rtB.texture; finalMat.uniforms.uTime.value = t; finalMat.uniforms.uFade.value = fadeIn;
  finalMat.uniforms.uBloom.value = inLat ? 0.95 : 0.7;
  pass(finalMat, null);
}
function say() {
  const o = $('opened'); o.textContent = 'It opened for you.';
  const sm = document.createElement('small'); sm.textContent = TOUCH ? 'swipe to travel \u00b7 tap a chamber' : 'scroll to travel \u00b7 click a chamber'; o.appendChild(sm);
  requestAnimationFrame(() => o.classList.add('on'));
}
if (false) {
  S.t = INTRO_END + 0.1; S.phase = 'lattice'; S.latAt = S.t - 3; S.saidIt = true; S.hintUsed = true;
  document.body.classList.add('deep'); $('id').classList.add('on');
  NAV.activate(0, 0, -200, 0, 0, 0); latCam.fov = 56;
}
window.__breach.NAV = NAV; window.__breach.latCam = latCam;
window.__breach.chamberScreen = () => { const v = new THREE.Vector3(); return lat.chambers.map((c, i) => { v.copy(c.pos).project(latCam); return { i, title: NAV.ITEMS[i].title, x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight, z: v.z, d: c.pos.distanceTo(latCam.position) }; }).filter((o) => o.z < 1 && o.x > 40 && o.x < innerWidth - 40 && o.y > 80 && o.y < innerHeight - 80).sort((a, b) => a.d - b.d); };
if (CAPTURE) {
  window.__step = (n = 1) => { for (let i = 0; i < n; i++) tick(1 / 30); };
} else {
  let prev = performance.now() / 1000;
  const loop = () => { if (OSB.halted) return; requestAnimationFrame(loop); const now = performance.now() / 1000; const dt = Math.min(0.05, now - prev); prev = now; tick(dt); };
  requestAnimationFrame(loop);
}
