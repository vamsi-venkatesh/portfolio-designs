// Sunlight through water — a real-time height-field pool over the real HTML page.
// WebGL2 only, no libraries. See NOTES.md for the pipeline.

const canvas = document.getElementById('pool');
const main = document.querySelector('main');
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' });
if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
  // fallback: the page stays as plain stone + visible HTML ink
  root.classList.add('nogl');
  throw new Error('pool: WebGL2 float targets unavailable, showing the still page');
}
gl.getExtension('OES_texture_float_linear');

// ---------------------------------------------------------------- shaders
const VS_FULL = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.,1.); }`;

const FS_STEP = `#version 300 es
precision highp float;
uniform sampler2D uState; uniform vec2 uTexel; uniform float uAspect;
uniform vec4 uDrops[16]; uniform int uCount;
in vec2 vUv; out vec4 o;
float H(vec2 uv){ return texture(uState, uv).r; }
void main(){
  vec4 s = texture(uState, vUv);
  for (int i=0;i<16;i++){
    if (i>=uCount) break;
    vec4 d = uDrops[i];
    float dist = length((vUv-d.xy)*vec2(uAspect,1.))/d.z;
    if (dist<1.) s.r += (cos(dist*3.14159265)*.5+.5)*d.w;
  }
  float avg = (H(vUv+vec2(uTexel.x,0.))+H(vUv-vec2(uTexel.x,0.))+H(vUv+vec2(0.,uTexel.y))+H(vUv-vec2(0.,uTexel.y)))*.25;
  s.g += (avg - s.r)*2.;
  s.g *= .990;
  s.r += s.g;
  s.r *= .999;
  o = s;
}`;

// simplex noise (Ashima / Stefan Gustavson, MIT)
const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const FS_NORMAL = `#version 300 es
precision highp float;
uniform sampler2D uState; uniform vec2 uTexel; uniform float uAspect, uTime, uAmb, uSimAmp;
in vec2 vUv; out vec4 o;
${NOISE}
float amb(vec2 p){
  float t = uTime;
  return uAmb*( snoise(vec3(p*7.0 + vec2(t*.045, t*.028), t*.22))*.62
              + snoise(vec3(p*15.0 - vec2(t*.07,-t*.035), t*.36+10.))*.26
              + sin(dot(p, vec2(23., 9.)) - t*1.1)*.05 );
}
float Ht(vec2 uv){ vec2 p = vec2(uv.x*uAspect, uv.y); return texture(uState, uv).r*uSimAmp + amb(p); }
void main(){
  vec2 ex = vec2(uTexel.x,0.), ey = vec2(0.,uTexel.y);
  float h = Ht(vUv);
  float dx = (Ht(vUv+ex)-Ht(vUv-ex))/(2.*uTexel.x*uAspect);
  float dz = (Ht(vUv+ey)-Ht(vUv-ey))/(2.*uTexel.y);
  o = vec4(h, -dx, -dz, 1.);
}`;

const VS_CAUSTIC = `#version 300 es
in vec2 aPos;
uniform sampler2D uNormal; uniform float uAspect, uDepth; uniform vec3 uLight;
out vec2 vOld; out vec2 vNew;
void main(){
  vec4 info = textureLod(uNormal, aPos, 0.);
  vec3 N = normalize(vec3(info.g, 1., info.b));
  vec3 r  = refract(uLight, N, .75);
  vec3 r0 = refract(uLight, vec3(0.,1.,0.), .75);
  vec2 base = vec2(aPos.x*uAspect, aPos.y);
  vec2 hit  = base + r.xz *((uDepth+info.r)/-r.y);
  vec2 hit0 = base + r0.xz*(uDepth/-r0.y);
  vec2 p = hit - (hit0-base);
  vOld = base; vNew = p;
  gl_Position = vec4(vec2(p.x/uAspect, p.y)*2.-1., 0., 1.);
}`;
const FS_CAUSTIC = `#version 300 es
precision highp float;
in vec2 vOld; in vec2 vNew; out vec4 o;
void main(){
  float oldA = length(dFdx(vOld))*length(dFdy(vOld));
  float newA = length(dFdx(vNew))*length(dFdy(vNew));
  o = vec4(min(oldA/max(newA,1e-9), 14.), 0., 0., 1.);
}`;

const FS_COMPOSITE = `#version 300 es
precision highp float;
uniform sampler2D uNormal, uCaustic, uFloor;
uniform vec2 uView, uDoc; uniform float uScroll, uDepthPx; uniform vec3 uLight;
uniform float uFade;
in vec2 vUv; out vec4 o;
void main(){
  vec4 info = texture(uNormal, vUv);
  vec3 N = normalize(vec3(info.g, 1., info.b));
  vec3 r = refract(vec3(0.,-1.,0.), N, .75);
  vec2 off = vec2(r.x, -r.z)/(-r.y)*uDepthPx;               // css px, y down
  vec2 px = vec2(vUv.x, 1.-vUv.y)*uView;                      // css px from top-left
  vec2 fpx = px + off;
  vec3 floorC = texture(uFloor, clamp((fpx+vec2(0.,uScroll))/uDoc, 0., 1.)).rgb;

  vec2 cuv = vec2(fpx.x/uView.x, 1.-fpx.y/uView.y);
  vec2 disp = vec2(off.x, -off.y)/uView*.12 + vec2(.7)/uView;
  float cr = texture(uCaustic, cuv + disp).r;
  float cg = texture(uCaustic, cuv).r;
  float cb = texture(uCaustic, cuv - disp).r;
  vec3 caus = vec3(cr,cg,cb);

  // sunlight: soft ambient sky + caustic sun, warm
  vec3 sun = vec3(1.0, .965, .86);
  vec3 light = vec3(.74,.78,.80) + sun*caus*.52;
  vec3 trans = vec3(.50, .90, .93);                           // shallow turquoise absorption
  vec3 col = floorC*trans*light;

  // warm sun haze from top-left, slightly deeper water toward the bottom-right
  vec2 q = vUv - vec2(.18,.92);
  col *= 1. + .10*exp(-dot(q,q)*2.2);
  vec2 v = vUv-.5; col *= 1. - .18*dot(v,v);

  // sky fresnel + sun glints on the surface
  vec3 S = normalize(-uLight);
  vec3 Hh = normalize(vec3(0.,1.,0.) + S);
  float nh = max(dot(N,Hh),0.);
  float glint = pow(nh, 1400.)*7. + pow(nh, 160.)*.16;
  col += vec3(.80,.95,1.)*.035 + vec3(1.,.99,.95)*glint;

  // gentle filmic shoulder so caustic peaks bloom to white instead of clipping flat
  col = 1. - exp(-col*1.85);
  col = mix(vec3(.945,.91,.84), col, uFade);
  o = vec4(col, 1.);
}`;

// ---------------------------------------------------------------- gl helpers
function sh(type, src) {
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
function prog(vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, 'aPos'); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace('[0]', '')] = gl.getUniformLocation(p, a.name); }
  return { p, u };
}
function tex(w, h, filter, internal = gl.RGBA16F, type = gl.HALF_FLOAT) {
  const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, gl.RGBA, type, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}
function target(w, h, filter) {
  const t = tex(w, h, filter); const f = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, f);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
  gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
  return { t, f, w, h };
}

const P = {
  step: prog(VS_FULL, FS_STEP), normal: prog(VS_FULL, FS_NORMAL),
  caustic: prog(VS_CAUSTIC, FS_CAUSTIC), comp: prog(VS_FULL, FS_COMPOSITE),
};
const quad = gl.createVertexArray(); gl.bindVertexArray(quad);
const qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

let mesh = null, meshCount = 0;
function buildMesh(nx, ny) {
  const v = new Float32Array((nx + 1) * (ny + 1) * 2); let k = 0;
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { v[k++] = -.06 + 1.12 * i / nx; v[k++] = -.06 + 1.12 * j / ny; }
  const idx = new Uint32Array(nx * ny * 6); k = 0;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
    idx[k++] = a; idx[k++] = b; idx[k++] = c; idx[k++] = b; idx[k++] = d; idx[k++] = c;
  }
  if (mesh) gl.deleteVertexArray(mesh);
  mesh = gl.createVertexArray(); gl.bindVertexArray(mesh);
  const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  meshCount = idx.length;
  gl.bindVertexArray(null);
}

// ---------------------------------------------------------------- state
let W = 0, Hh = 0, dpr = 1, aspect = 1, simW = 0, simH = 0;
let A, B, NRM, CAU;
const floorTex = gl.createTexture();
let docW = 1, docH = 1;
const DEPTH = 0.075; // pool depth, in viewport heights

function sizeAll() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; Hh = window.innerHeight; aspect = W / Hh;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(Hh * dpr);
  const res = W < 700 ? 200 : 300;                 // sim cells along the longer side
  if (aspect >= 1) { simW = res; simH = Math.round(res / aspect); } else { simH = res; simW = Math.round(res * aspect); }
  [A, B, NRM, CAU].forEach(t => t && (gl.deleteTexture(t.t), gl.deleteFramebuffer(t.f)));
  A = target(simW, simH, gl.NEAREST); B = target(simW, simH, gl.NEAREST);
  NRM = target(simW, simH, gl.LINEAR);
  const cw = Math.min(1600, Math.round(W * Math.min(dpr, 1.5) * .8));
  CAU = target(cw, Math.round(cw / aspect), gl.LINEAR);
  buildMesh(simW, simH);
}

// ---------------------------------------------------------------- the floor (painted from the real DOM layout)
const fc = document.createElement('canvas'); const fx = fc.getContext('2d');
let glyphs = [], plaques = [], dots = [], links = [], hovered = null, fdpr = 1;

function rnd(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function layout() {
  const sx = window.scrollX, sy = window.scrollY;
  docW = root.clientWidth; docH = Math.max(root.scrollHeight, window.innerHeight);
  glyphs = []; const range = document.createRange();
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  const fontCache = new Map();
  let n;
  while ((n = walker.nextNode())) {
    const el = n.parentElement; const cs = getComputedStyle(el);
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if (!fontCache.has(font)) { fx.font = font; const m = fx.measureText('Hg'); fontCache.set(font, [m.fontBoundingBoxAscent, m.fontBoundingBoxDescent]); }
    const [asc, desc] = fontCache.get(font);
    const color = cs.getPropertyValue('--inlay').trim() || '#0B4A5E';
    const owner = el.closest('.plaque, footer a');
    const d = n.data;
    for (let i = 0; i < d.length; i++) {
      const ch = d[i]; if (/\s/.test(ch)) continue;
      range.setStart(n, i); range.setEnd(n, i + 1);
      const r = range.getBoundingClientRect(); if (!r.width && !r.height) continue;
      glyphs.push({ ch, x: r.left + sx, y: r.top + sy + (r.height - (asc + desc)) / 2 + asc, font, color, owner });
    }
  }
  plaques = [...main.querySelectorAll('.plaque')].map(el => { const r = el.getBoundingClientRect(); return { el, x: r.left + sx, y: r.top + sy, w: r.width, h: r.height }; });
  dots = [...main.querySelectorAll('.dot')].map(el => { const r = el.getBoundingClientRect(); return { el, c: el.style.getPropertyValue('--c'), x: r.left + sx, y: r.top + sy, w: r.width, h: r.height, owner: el.closest('.plaque') }; });
  links = [...main.querySelectorAll('footer a')].map(el => ({ el, rects: [...el.getClientRects()].map(r => ({ x: r.left + sx, y: r.top + sy, w: r.width, h: r.height })) }));
}

function rr(x, y, w, h, r) { fx.beginPath(); fx.roundRect(x, y, w, h, r); }
let grain = null;
function makeGrain() {
  const g = document.createElement('canvas'); g.width = g.height = 256; const c = g.getContext('2d');
  const im = c.createImageData(256, 256);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 90; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  c.putImageData(im, 0, 0); grain = fx.createPattern(g, 'repeat');
}

function paintFloor() {
  const maxTex = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), 8192);
  fdpr = Math.min(dpr, maxTex / docH, maxTex / docW);
  fc.width = Math.round(docW * fdpr); fc.height = Math.round(docH * fdpr);
  fx.setTransform(fdpr, 0, 0, fdpr, 0, 0);
  // stone tiles
  fx.fillStyle = '#F1E8D6'; fx.fillRect(0, 0, docW, docH);
  const T = docW < 620 ? 40 : 52;
  for (let j = 0, y = 0; y < docH; j++, y += T) for (let i = 0, x = 0; x < docW; i++, x += T) {
    const k = rnd(i * 91 + j * 7); const l = 90 + k * 5.5;
    fx.fillStyle = `hsl(${38 + rnd(i + j * 13) * 6} ${38 + k * 10}% ${l - 2}%)`;
    fx.fillRect(x + .75, y + .75, T - 1.5, T - 1.5);
  }
  fx.globalAlpha = .07; fx.globalCompositeOperation = 'multiply'; fx.fillStyle = grain; fx.fillRect(0, 0, docW, docH);
  fx.globalAlpha = 1; fx.globalCompositeOperation = 'source-over';
  // plaques
  for (const p of plaques) {
    const hot = hovered === p.el;
    fx.fillStyle = 'rgba(70,52,30,.08)'; rr(p.x + 1, p.y + 3, p.w, p.h, 7); fx.fill();
    fx.fillStyle = hot ? '#FFFBF2' : '#FAF4E8'; rr(p.x, p.y, p.w, p.h, 7); fx.fill();
    fx.lineWidth = hot ? 2.2 : 1.2; fx.strokeStyle = hot ? '#E2683F' : 'rgba(11,74,94,.28)';
    rr(p.x + 5, p.y + 5, p.w - 10, p.h - 10, 4); fx.stroke();
  }
  // brand-colour mosaic tiles
  for (const d of dots) {
    fx.fillStyle = 'rgba(11,74,94,.35)'; fx.fillRect(d.x - 1, d.y - 1, d.w + 2, d.h + 2);
    fx.fillStyle = d.c; fx.fillRect(d.x, d.y, d.w, d.h);
  }
  // inlaid letters: a pale lip above, the ink below
  fx.textBaseline = 'alphabetic'; fx.textAlign = 'left';
  let last = '';
  for (const g of glyphs) {
    if (g.font !== last) { fx.font = g.font; last = g.font; }
    fx.fillStyle = 'rgba(255,252,244,.75)'; fx.fillText(g.ch, g.x - .4, g.y - .8);
  }
  for (const g of glyphs) {
    if (g.font !== last) { fx.font = g.font; last = g.font; }
    const hot = g.owner && g.owner === hovered;
    fx.fillStyle = hot && g.color === '#0B4A5E' ? '#B9472A' : g.color; fx.fillText(g.ch, g.x, g.y);
  }
  for (const l of links) for (const r of l.rects) {
    fx.fillStyle = hovered === l.el ? '#E2683F' : 'rgba(11,74,94,.55)';
    fx.fillRect(r.x, r.y + r.h - 3, r.w, hovered === l.el ? 2.2 : 1.3);
  }
  gl.bindTexture(gl.TEXTURE_2D, floorTex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, fc);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

// ---------------------------------------------------------------- drops
const queue = [];
function drop(u, v, radius, strength) { if (queue.length < 16) queue.push([u, v, radius, strength]); }
function dropAtClient(x, y, radius, strength) { drop(x / W, 1 - y / Hh, radius, strength); }

// ---------------------------------------------------------------- frame
const LIGHT = (() => { const v = [-0.22, -1, -0.3]; const l = Math.hypot(...v); return v.map(x => x / l); })();
let time = 0, fade = reduce ? 1 : 0, fadeStart = 0;

function simulate(steps) {
  gl.disable(gl.BLEND); gl.bindVertexArray(quad); gl.viewport(0, 0, simW, simH);
  const s = P.step; gl.useProgram(s.p);
  gl.uniform2f(s.u.uTexel, 1 / simW, 1 / simH); gl.uniform1f(s.u.uAspect, aspect); gl.uniform1i(s.u.uState, 0);
  for (let i = 0; i < steps; i++) {
    const n = i === 0 ? queue.length : 0;
    if (n) gl.uniform4fv(s.u.uDrops, new Float32Array(queue.flat().concat(new Array((16 - n) * 4).fill(0))));
    gl.uniform1i(s.u.uCount, n);
    gl.bindFramebuffer(gl.FRAMEBUFFER, B.f); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    [A, B] = [B, A];
  }
  queue.length = 0;
}

function render() {
  // normals (+ ambient breeze)
  gl.disable(gl.BLEND); gl.bindVertexArray(quad); gl.viewport(0, 0, simW, simH);
  let p = P.normal; gl.useProgram(p.p); gl.bindFramebuffer(gl.FRAMEBUFFER, NRM.f);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.t); gl.uniform1i(p.u.uState, 0);
  gl.uniform2f(p.u.uTexel, 1 / simW, 1 / simH); gl.uniform1f(p.u.uAspect, aspect);
  gl.uniform1f(p.u.uTime, time); gl.uniform1f(p.u.uAmb, 0.0019); gl.uniform1f(p.u.uSimAmp, 0.4);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  // caustics
  gl.bindFramebuffer(gl.FRAMEBUFFER, CAU.f); gl.viewport(0, 0, CAU.w, CAU.h);
  gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
  p = P.caustic; gl.useProgram(p.p); gl.bindVertexArray(mesh);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, NRM.t); gl.uniform1i(p.u.uNormal, 0);
  gl.uniform1f(p.u.uAspect, aspect); gl.uniform1f(p.u.uDepth, DEPTH * 5.5 * Math.min(1, W / Hh)); gl.uniform3fv(p.u.uLight, LIGHT);
  gl.drawElements(gl.TRIANGLES, meshCount, gl.UNSIGNED_INT, 0);
  gl.disable(gl.BLEND);
  // composite
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); gl.bindVertexArray(quad);
  p = P.comp; gl.useProgram(p.p);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, NRM.t); gl.uniform1i(p.u.uNormal, 0);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, CAU.t); gl.uniform1i(p.u.uCaustic, 1);
  gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, floorTex); gl.uniform1i(p.u.uFloor, 2);
  gl.uniform2f(p.u.uView, W, Hh); gl.uniform2f(p.u.uDoc, docW, docH);
  gl.uniform1f(p.u.uScroll, window.scrollY); gl.uniform1f(p.u.uDepthPx, DEPTH * Math.min(W, Hh));
  gl.uniform3fv(p.u.uLight, LIGHT); gl.uniform1f(p.u.uFade, fade);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// a still pool is never perfectly still: seed faint ripples so the caustic net is crisp from frame one
function seed() { for (let i = 0; i < 16; i++) drop(Math.random(), Math.random(), .02 + Math.random() * .03, (Math.random() - .5) * .03); }
let last = 0, nextAmbient = 0, started = 0;
const intro = reduce ? [] : [[0.5, .70, .80, .055, .055], [1.3, .30, .70, .045, .05], [2.2, .55, .35, .04, .04]];
function loop(now) {
  now /= 1000; if (!started) { started = now; last = now; nextAmbient = now + 3; }
  const dt = Math.min(now - last, 1 / 20); last = now; time += dt;
  const t = now - started;
  fade = Math.min(1, t / 1.1); fade = fade * fade * (3 - 2 * fade);
  while (intro.length && intro[0][0] <= t) { const [, u, v, r, s] = intro.shift(); drop(u, v, r, s); }
  if (now > nextAmbient) { drop(Math.random(), Math.random(), .012 + Math.random() * .02, (Math.random() < .5 ? 1 : -1) * (.012 + Math.random() * .02)); nextAmbient = now + 1 + Math.random() * 1.6; }
  simulate(2); render();
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------- input
let lastPt = null;
window.addEventListener('pointermove', e => {
  if (reduce) return;
  const pt = [e.clientX, e.clientY, performance.now()];
  if (lastPt) {
    const dx = pt[0] - lastPt[0], dy = pt[1] - lastPt[1], d = Math.hypot(dx, dy);
    if (d > 4) {
      const sp = Math.min(d / Math.max(pt[2] - lastPt[2], 8), 3);
      const strength = (e.buttons ? .016 : .007) * (.35 + sp * .5);
      const steps = Math.min(3, Math.ceil(d / 24));
      for (let i = 1; i <= steps; i++) dropAtClient(lastPt[0] + dx * i / steps, lastPt[1] + dy * i / steps, e.buttons ? .016 : .011, strength / steps * 1.6);
      lastPt = pt;
    }
  } else lastPt = pt;
}, { passive: true });
window.addEventListener('pointerleave', () => { lastPt = null; });
window.addEventListener('pointerdown', e => { if (!reduce) dropAtClient(e.clientX, e.clientY, .026, .045); }, { passive: true });

function setHover(el) {
  if (hovered === el) return; hovered = el; paintFloor();
  if (el && !reduce) {
    const r = el.getBoundingClientRect();
    dropAtClient(r.left + r.width / 2, r.top + r.height / 2, .028, .025);
  }
  if (reduce) render();
}
main.querySelectorAll('.plaque, footer a').forEach(el => {
  el.addEventListener('pointerenter', () => setHover(el));
  el.addEventListener('pointerleave', () => setHover(null));
  el.addEventListener('focus', () => setHover(el));
  el.addEventListener('blur', () => setHover(null));
});

if (reduce) window.addEventListener('scroll', () => render(), { passive: true });
let rz = 0;
window.addEventListener('resize', () => {
  clearTimeout(rz);
  rz = setTimeout(() => {
    const prevW = W; sizeAll(); layout(); paintFloor(); if (reduce) { time = 14.2; render(); }
    if (Math.abs(prevW - W) > 40) for (let i = 0; i < 4; i++) drop(Math.random(), Math.random(), .02, .02);
  }, 120);
});

// ---------------------------------------------------------------- boot
(async () => {
  try { await Promise.all([document.fonts.load('300 100px Fraunces'), document.fonts.load('italic 300 100px Fraunces'), document.fonts.load('500 24px Fraunces'), document.fonts.load('400 24px Fraunces'), document.fonts.load('italic 400 16px Fraunces'), document.fonts.load('500 15px "Instrument Sans"'), document.fonts.load('600 13px "Instrument Sans"'), document.fonts.load('400 15px "Instrument Sans"')]); } catch (_) { /* fall back to whatever loaded */ }
  await document.fonts.ready;
  sizeAll(); makeGrain(); layout(); paintFloor();
  if (reduce) { time = 14.2; fade = 1; render(); }
  else { seed(); render(); requestAnimationFrame(loop); }
  root.classList.add('gl');
  canvas.style.opacity = '1';
  if (reduce) { canvas.style.transition = 'none'; main.querySelectorAll('*').forEach(e => e.style.transition = 'none'); }
})();
