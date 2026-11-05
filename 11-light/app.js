// Hold it to the light — sample.
// A pane of clear glass in a morning room. Its back surface was computed (tools/solve.mjs) so that
// sunlight refracted through it lands on the wall as words. Every frame, every ray is traced through
// that surface on the GPU (exact Snell's law) and the light is splatted onto the wall: nothing here
// is a painted picture of the words. Moving the sun bends the writing for real; scrolling reshapes
// the glass (its surface is blended between solved shapes) and the light follows.

import * as THREE from '../vendor/three.module.js';

const qs = new URLSearchParams(location.search);
const FILM = qs.has('film');
const DEBUG = qs.has('debug');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches && !FILM;
const coarse = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;

const STATES = ['name', 'unboundpdf', 'write'];

// ---------- scene constants (metres) ----------
const GLASS = { x: 0.9, y: 1.95, T: 0.045 };          // pane centre; back face at z = D
const ROOM = { wallW: 14, wallH: 6, floorD: 12 };

function webglOK() {
  try { const c = document.createElement('canvas'); return !!c.getContext('webgl2'); } catch { return false; }
}
if (!webglOK()) { document.documentElement.classList.add('nogl'); throw new Error('no WebGL2'); }

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: FILM });
renderer.setPixelRatio(FILM ? 1 : Math.min(devicePixelRatio, coarse ? 2 : 1.75));
renderer.toneMapping = { agx: THREE.AgXToneMapping, neutral: THREE.NeutralToneMapping, aces: THREE.ACESFilmicToneMapping }[qs.get('tm') || 'aces'];
renderer.toneMappingExposure = +(qs.get('exp') || 1.0);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ---------- load the solved glass ----------
async function loadState(id) {
  const meta = await (await fetch(`glass/${id}.json`)).json();
  const buf = await (await fetch(`glass/${id}.slopes.bin`)).arrayBuffer();
  const f = new Float32Array(buf);
  const half = new Uint16Array(f.length);
  for (let i = 0; i < f.length; i++) half[i] = THREE.DataUtils.toHalfFloat(f[i]);
  const slopes = new THREE.DataTexture(half, meta.VW, meta.VH, THREE.RGFormat, THREE.HalfFloatType);
  slopes.minFilter = slopes.magFilter = THREE.LinearFilter;
  slopes.needsUpdate = true;
  // visual normal map for the glass (rows flipped: texture v=0 is the bottom of the pane)
  const nm = new Uint16Array(meta.VW * meta.VH * 4);
  const H1 = THREE.DataUtils.toHalfFloat(1);
  for (let i = 0; i < meta.VH; i++) for (let j = 0; j < meta.VW; j++) {
    const src = (i * meta.VW + j) * 2, dst = ((meta.VH - 1 - i) * meta.VW + j) * 4;
    const gx = f[src], gy = f[src + 1], l = Math.hypot(gx, gy, 1);
    nm[dst] = THREE.DataUtils.toHalfFloat(-gx / l * 0.5 + 0.5);
    nm[dst + 1] = THREE.DataUtils.toHalfFloat(-gy / l * 0.5 + 0.5);
    nm[dst + 2] = THREE.DataUtils.toHalfFloat(1 / l * 0.5 + 0.5);
    nm[dst + 3] = H1;
  }
  const normal = new THREE.DataTexture(nm, meta.VW, meta.VH, THREE.RGBAFormat, THREE.HalfFloatType);
  normal.minFilter = THREE.LinearMipmapLinearFilter; normal.magFilter = THREE.LinearFilter;
  normal.generateMipmaps = true; normal.anisotropy = 8; normal.needsUpdate = true;
  return { id, meta, slopes, normal };
}
const loaded = await Promise.all(STATES.map(loadState));
const M = loaded[0].meta;
const SUN0 = new THREE.Vector3(...M.sun).normalize();
const OFFSET = new THREE.Vector2(...M.offset);
const IMG = new THREE.Vector2(GLASS.x + OFFSET.x, GLASS.y + OFFSET.y);   // centre of the writing on the wall

// ---------- caustic pass: trace the glass on the GPU ----------
const RECT = { x: IMG.x - 1.2, y: IMG.y - 0.7, w: 2.4, h: 1.4 };        // wall area the light can reach
const rtScale = coarse ? 0.66 : 1;
const causticRT = new THREE.WebGLRenderTarget(Math.round(1536 * rtScale), Math.round(896 * rtScale), {
  type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: false,
  minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: true,
});

function photonGeometry(step) {
  const cw = Math.floor(M.W / step), ch = Math.floor(M.H / step);
  const vw = cw + 1, vh = ch + 1;
  const pos = new Float32Array(vw * vh * 3);
  for (let i = 0; i < vh; i++) for (let j = 0; j < vw; j++) {
    const p = (i * vw + j) * 3; pos[p] = j * step; pos[p + 1] = i * step; pos[p + 2] = 0;
  }
  const idx = new Uint32Array(cw * ch * 6);
  let k = 0;
  for (let i = 0; i < ch; i++) for (let j = 0; j < cw; j++) {
    const a = i * vw + j, b = a + 1, c = a + vw + 1, d = a + vw;
    idx[k++] = a; idx[k++] = b; idx[k++] = c; idx[k++] = a; idx[k++] = c; idx[k++] = d;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  return g;
}

const shared = {
  uSlopeA: { value: loaded[0].slopes }, uSlopeB: { value: loaded[1].slopes },
  uMix: { value: 0 }, uAmp: { value: 0 },
  uSun: { value: SUN0.clone() },
  uGrid: { value: new THREE.Vector2(M.W, M.H) },
  uCell: { value: M.Lx / M.W },
  uD: { value: M.D },
  uGC: { value: new THREE.Vector3(GLASS.x, GLASS.y, M.D) },      // centre of the glass back face
  uRot: { value: new THREE.Matrix3() },                            // orientation of the glass (you hold it)
  uRect: { value: new THREE.Vector4(RECT.x, RECT.y, RECT.w, RECT.h) },
  uRipple: { value: +(qs.get('ripple') || 0.0008) },               // glass is never perfect: faint fixed ripple
  uLiquid: { value: 0 },                                           // travelling waves when the glass is disturbed (rad)
  uTime: { value: 0 },
};
const causticVert = /* glsl */`
  uniform sampler2D uSlopeA, uSlopeB;
  uniform float uMix, uAmp, uN, uCell, uRipple, uLiquid, uTime;
  uniform vec2 uGrid;
  uniform vec3 uSun, uGC;
  uniform mat3 uRot;
  uniform vec4 uRect;
  varying vec2 vLens;
  varying vec2 vWall;
  varying float vFlux;
  const vec2 WK[7] = vec2[7](vec2(61.0, 23.0), vec2(-37.0, 71.0), vec2(83.0, -41.0), vec2(-58.0, -49.0), vec2(19.0, 96.0), vec2(104.0, 37.0), vec2(-91.0, 12.0));
  const float WW[7] = float[7](2.1, 2.6, 3.0, 2.4, 2.9, 3.3, 2.2);
  const float WP[7] = float[7](0.3, 1.9, 4.2, 2.7, 5.1, 0.8, 3.6);
  vec2 liquid(vec2 p, float t) {      // slope of a sum of travelling waves, ~unit amplitude
    vec2 g = vec2(0.0);
    for (int i = 0; i < 7; i++) g += normalize(WK[i]) * cos(dot(WK[i], p) - WW[i] * t + WP[i]);
    return g * 0.38;
  }
  vec2 ripple(vec2 p) {
    vec2 k1 = vec2(231.0, 97.0), k2 = vec2(-143.0, 201.0), k3 = vec2(57.0, -263.0), k4 = vec2(301.0, 151.0), k5 = vec2(-89.0, -177.0);
    return 0.42 * (normalize(k1) * cos(dot(k1, p) + 1.3) + normalize(k2) * cos(dot(k2, p) + 4.1) + normalize(k3) * cos(dot(k3, p) + 2.2)
                 + normalize(k4) * cos(dot(k4, p) + 5.7) + normalize(k5) * cos(dot(k5, p) + 0.4));
  }
  void main() {
    vec2 cell = position.xy;                       // vertex indices (j, i), i = 0 at the top
    vec2 uv = (cell + 0.5) / (uGrid + 1.0);
    vec2 lens = vec2((cell.x - 0.5 * uGrid.x) * uCell, (0.5 * uGrid.y - cell.y) * uCell);
    vec2 g = mix(texture2D(uSlopeA, uv).xy, texture2D(uSlopeB, uv).xy, uMix) * uAmp
           + uRipple * ripple(lens) + uLiquid * liquid(lens, uTime);
    vec3 N = normalize(vec3(-g.x, -g.y, 1.0));     // back face, facing the incoming ray (glass frame)
    vec3 sL = transpose(uRot) * uSun;              // the sun as the tilted glass sees it
    vec3 vin = refract(sL, vec3(0.0, 0.0, 1.0), 1.0 / uN);
    vec3 vout = uRot * refract(vin, N, uN);        // back to the room
    vec3 P = uGC + uRot * vec3(lens, 0.0);
    vec2 hit = P.xy + (-P.z / min(vout.z, -1e-4)) * vout.xy;
    if (dot(vout, vout) < 0.5) hit = vec2(1e4);    // total internal reflection: no light
    vLens = lens; vWall = hit;
    vFlux = abs(sL.z) / abs(uSun.z);               // a tilted pane catches a little less sun
    gl_Position = vec4((hit - uRect.xy) / uRect.zw * 2.0 - 1.0, 0.0, 1.0);
  }`;
const causticFrag = /* glsl */`
  uniform vec3 uColor;
  varying vec2 vLens;
  varying vec2 vWall;
  varying float vFlux;
  void main() {
    vec2 a = dFdx(vLens), b = dFdy(vLens), c = dFdx(vWall), d = dFdy(vWall);
    float lensArea = abs(a.x * b.y - a.y * b.x);
    float wallArea = abs(c.x * d.y - c.y * d.x);
    float ratio = lensArea / max(wallArea, 1e-14);   // light density relative to flat glass
    gl_FragColor = vec4(uColor * min(ratio * vFlux, 80.0), 1.0);
  }`;
const causticScene = new THREE.Scene();
const causticCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const photonGeo = photonGeometry(coarse ? 2 : 1);
const disp = +(qs.get('disp') || 1.6);                 // dispersion, x real BK7 so the fringes show
const channels = coarse
  ? [{ n: M.n, color: new THREE.Vector3(1, 1, 1) }]
  : [{ n: M.n - 0.0025 * disp, color: new THREE.Vector3(1, 0, 0) },
     { n: M.n, color: new THREE.Vector3(0, 1, 0) },
     { n: M.n + 0.0056 * disp, color: new THREE.Vector3(0, 0, 1) }];
for (const ch of channels) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...shared, uN: { value: ch.n }, uColor: { value: ch.color } },
    vertexShader: causticVert, fragmentShader: causticFrag,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    depthTest: false, depthWrite: false, transparent: true, toneMapped: false, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(photonGeo, mat);
  mesh.frustumCulled = false;
  causticScene.add(mesh);
}

// ---------- the room ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfc8bd);

const roomUniforms = {
  uCaustic: { value: causticRT.texture },
  uRect: shared.uRect,
  uSun: shared.uSun,
  uD: shared.uD,
  uGC: shared.uGC,
  uRot: shared.uRot,
  uGlassC: { value: new THREE.Vector2(GLASS.x, GLASS.y) },
  uGlassH: { value: new THREE.Vector2(M.Lx / 2, M.Ly / 2) },
  uWinC: { value: new THREE.Vector2(GLASS.x + 1.32 * 1.45, GLASS.y + 0.6 * 1.45) },  // window far behind, in the sun's path
  uWinH: { value: new THREE.Vector2(+(qs.get('winw') || 1.05), +(qs.get('winh') || 0.62)) },
  uWinZ: { value: 5.9 },
  uWinOn: { value: +(qs.get('win') ?? 0) },
  uSunE: { value: +(qs.get('sun') || 1.35) },
  uSkyE: { value: +(qs.get('sky') || 0.44) },
  uSunCol: { value: new THREE.Color(1.0, 0.77, 0.5) },
  uSkyCol: { value: new THREE.Color(0.8, 0.86, 1.0) },
  uImg: { value: IMG.clone() },
  uGlow: { value: +(qs.get('glow') || 0.05) },
  uHaze: { value: +(qs.get('haze') || 0.15) },
  uSteps: { value: coarse ? 20 : (FILM ? 44 : 32) },
  uBeamMin: { value: new THREE.Vector3(-1.6, 0.9, 0.0) },
  uBeamMax: { value: new THREE.Vector3(4.2, 3.9, 5.6) },
};
const roomVert = /* glsl */`
  varying vec3 vPos;
  void main() { vec4 w = modelMatrix * vec4(position, 1.0); vPos = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const roomFragCommon = /* glsl */`
  uniform sampler2D uCaustic;
  uniform vec4 uRect;
  uniform vec3 uSun, uSunCol, uSkyCol, uAlbedo, uGC;
  uniform mat3 uRot;
  uniform vec2 uGlassC, uGlassH, uWinC, uWinH, uImg;
  uniform float uD, uWinZ, uWinOn, uSunE, uSkyE, uGlow, uHaze;
  uniform int uSteps;
  uniform vec3 uBeamMin, uBeamMax;
  varying vec3 vPos;
  float box(vec2 p, vec2 c, vec2 h, float soft) { vec2 d = abs(p - c) - h; return 1.0 - smoothstep(-soft, soft, max(d.x, d.y)); }
  // is X on a sun ray that passes through the (tilted) pane?
  float glassMask(vec3 X, float soft) {
    vec3 nG = uRot[2];
    vec3 Q = X + uSun * (dot(uGC - X, nG) / dot(uSun, nG));
    vec3 l = transpose(uRot) * (Q - uGC);
    return box(l.xy, vec2(0.0), uGlassH, soft);
  }
  vec3 causticAt(vec2 xy) {
    vec2 uv = (xy - uRect.xy) / uRect.zw;
    if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return vec3(0.0);
    vec2 px = 0.6 / vec2(textureSize(uCaustic, 0));
    vec3 c = texture2D(uCaustic, uv + vec2( px.x,  px.y)).rgb + texture2D(uCaustic, uv + vec2(-px.x,  px.y)).rgb
           + texture2D(uCaustic, uv + vec2( px.x, -px.y)).rgb + texture2D(uCaustic, uv + vec2(-px.x, -px.y)).rgb;
    float edge = smoothstep(0.0, 0.03, uv.x) * smoothstep(0.0, 0.03, 1.0 - uv.x) * smoothstep(0.0, 0.03, uv.y) * smoothstep(0.0, 0.03, 1.0 - uv.y);
    float lod = log2(max(1.0, float(textureSize(uCaustic, 0).x) / 192.0));
    vec3 glow = textureLod(uCaustic, uv, lod).rgb * 0.55 + textureLod(uCaustic, uv, lod + 1.6).rgb * 0.45;
    return (c * 0.25 + glow * uGlow) * edge;
  }
  vec3 causticLod(vec2 xy, float lod) {
    vec2 uv = (xy - uRect.xy) / uRect.zw;
    if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return vec3(0.0);
    return textureLod(uCaustic, uv, lod).rgb;
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
  // light scattered by the air in the beam: uniform sun before the glass, the glass's own light after it
  vec3 haze(vec3 P) {
    vec3 O = cameraPosition, R = P - O; float L = length(R); R /= L;
    vec3 inv = 1.0 / R, t0 = (uBeamMin - O) * inv, t1 = (uBeamMax - O) * inv;
    vec3 lo = min(t0, t1), hi = max(t0, t1);
    float a = max(max(lo.x, lo.y), max(lo.z, 0.0)), b = min(min(hi.x, hi.y), min(hi.z, L));
    if (b <= a) return vec3(0.0);
    float dt = (b - a) / float(uSteps), j = hash(gl_FragCoord.xy + 0.37), acc = 0.0;
    for (int i = 0; i < 48; i++) {
      if (i >= uSteps) break;
      vec3 X = O + R * (a + (float(i) + j) * dt);
      float dens = 0.0;
      float side = dot(X - uGC, uRot[2]);
      if (side > 0.0) {
        dens = glassMask(X, 0.02) * smoothstep(5.6, 3.6, X.z);
      } else if (X.z > 0.0) {
        vec2 Pw = X.xy + uSun.xy * (X.z / -uSun.z);
        float c = dot(causticLod(Pw, 1.0), vec3(0.3333));
        dens = mix(c, glassMask(X, 0.02), clamp(X.z / uD, 0.0, 1.0));
      }
      acc += dens * smoothstep(0.5, 2.2, length(X - O));
    }
    return uSunCol * uSunE * uHaze * acc * dt;
  }
  // soft glow the lit patch throws back into the room (one bounce, cheap)
  vec3 bounce(vec3 P) {
    float d2 = dot(P - vec3(uImg, 0.0), P - vec3(uImg, 0.0));
    return uSunCol * uSunE * 0.045 * exp(-d2 / 3.2);
  }`;
const wallMat = new THREE.ShaderMaterial({
  uniforms: { ...roomUniforms, uAlbedo: { value: new THREE.Color(0.95, 0.92, 0.87) } },
  vertexShader: roomVert,
  fragmentShader: roomFragCommon + /* glsl */`
  void main() {
    vec3 P = vPos;
    float cosI = -uSun.z;
    float inGlass = glassMask(P, 0.006);
    vec2 Qw = P.xy - uSun.xy * (uWinZ / -uSun.z);              // ... and to the window
    float inWin = box(Qw, uWinC, uWinH, 0.03) * uWinOn;
    vec3 sun = uSunCol * uSunE * cosI * (inWin * (1.0 - inGlass) + 0.92 * causticAt(P.xy));
    float ao = 1.0 - 0.42 * exp(-P.y / 0.45);
    float sideways = 0.62 + 0.5 * smoothstep(-4.5, 5.5, P.x);
    float upward = 0.86 + 0.14 * smoothstep(0.2, 4.0, P.y) - 0.12 * smoothstep(3.2, 5.5, P.y);
    vec3 sky = uSkyCol * uSkyE * sideways * upward * ao;
    float grain = 1.0 + 0.035 * (vnoise(P.xy * 55.0) - 0.5) + 0.02 * (vnoise(P.xy * 7.0) - 0.5);
    vec3 col = uAlbedo * grain * (sky + sun + bounce(P)) + haze(P);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    gl_FragColor.rgb += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  }`,
});
const floorMat = new THREE.ShaderMaterial({
  uniforms: { ...roomUniforms, uAlbedo: { value: new THREE.Color(0.78, 0.72, 0.64) } },
  vertexShader: roomVert,
  fragmentShader: roomFragCommon + /* glsl */`
  void main() {
    vec3 P = vPos;
    float ao = 1.0 - 0.45 * exp(-P.z / 0.55);
    float sideways = 0.62 + 0.5 * smoothstep(-4.5, 5.5, P.x);
    vec3 sky = uSkyCol * uSkyE * 0.85 * sideways * ao;
    float grain = 1.0 + 0.05 * (vnoise(P.xz * 3.0) - 0.5) + 0.03 * (vnoise(P.xz * 23.0) - 0.5);
    vec3 col = uAlbedo * grain * (sky + bounce(P) * 1.2) + haze(P);
    vec3 V = normalize(P - cameraPosition), Rr = reflect(V, vec3(0.0, 1.0, 0.0));
    if (Rr.z < -1e-3) {
      vec3 H = P + Rr * (P.z / -Rr.z);
      float fres = 0.03 + 0.97 * pow(1.0 - clamp(-V.y, 0.0, 1.0), 5.0);
      col += uSunCol * uSunE * (-uSun.z) * 0.92 * causticLod(H.xy, 3.2) * fres * 0.55;
    }
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    gl_FragColor.rgb += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  }`,
});
const wall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.wallW, ROOM.wallH), wallMat);
wall.position.set(0, ROOM.wallH / 2, 0);
scene.add(wall);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.wallW, ROOM.floorD), floorMat);
floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, ROOM.floorD / 2);
scene.add(floor);

// environment for the glass reflections: a pale room with one warm window
{
  const env = new THREE.Scene();
  const box = new THREE.Mesh(new THREE.BoxGeometry(14, 7, 14), new THREE.MeshBasicMaterial({ color: 0xc9c4bc, side: THREE.BackSide }));
  box.position.y = 2.5; env.add(box);
  // soft top light only (a hard window here shows up as a blob through the wavy surface)
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.15, 1.1, 1.02) }));
  sky.position.set(0, 5.9, 0); sky.rotation.x = Math.PI / 2; env.add(sky);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(env, 0.035).texture;
  pmrem.dispose();
}

// the pane
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 1, thickness: GLASS.T, ior: M.n,
  attenuationColor: new THREE.Color(0.74, 0.92, 0.86), attenuationDistance: 0.28,
  specularIntensity: 1, envMapIntensity: 0.8, normalMap: loaded[0].normal, normalScale: new THREE.Vector2(1, 1),
});
const glassUniforms = { normalMapB: { value: loaded[1].normal }, uNormalMix: { value: 0 }, uNormalAmp: { value: 0 }, uLiquid: shared.uLiquid, uTime: shared.uTime, uPane: { value: new THREE.Vector2(M.Lx, M.Ly) } };
glassMat.onBeforeCompile = (sh) => {
  Object.assign(sh.uniforms, glassUniforms);
  const chunk = THREE.ShaderChunk.normal_fragment_maps.replace(
    'vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;',
    'vec3 mapN = mix( texture2D( normalMap, vNormalMapUv ).xyz, texture2D( normalMapB, vNormalMapUv ).xyz, uNormalMix ) * 2.0 - 1.0;\n\tmapN.xy *= uNormalAmp;\n\tmapN.xy -= 3.0 * uLiquid * liquidN((vNormalMapUv - 0.5) * uPane, uTime);');
  sh.fragmentShader = `uniform sampler2D normalMapB;\nuniform float uNormalMix, uNormalAmp, uLiquid, uTime;\nuniform vec2 uPane;
  const vec2 WK[7] = vec2[7](vec2(61.0, 23.0), vec2(-37.0, 71.0), vec2(83.0, -41.0), vec2(-58.0, -49.0), vec2(19.0, 96.0), vec2(104.0, 37.0), vec2(-91.0, 12.0));
  const float WW[7] = float[7](2.1, 2.6, 3.0, 2.4, 2.9, 3.3, 2.2);
  const float WP[7] = float[7](0.3, 1.9, 4.2, 2.7, 5.1, 0.8, 3.6);
  vec2 liquidN(vec2 p, float t) { vec2 g = vec2(0.0); for (int i = 0; i < 7; i++) g += normalize(WK[i]) * cos(dot(WK[i], p) - WW[i] * t + WP[i]); return g * 0.38; }
`
    + sh.fragmentShader.replace('#include <normal_fragment_maps>', chunk);
};
const edgeMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, metalness: 0, roughness: 0.06, transmission: 1, thickness: 0.6, ior: M.n,
  attenuationColor: new THREE.Color(0.62, 0.88, 0.8), attenuationDistance: 0.22, envMapIntensity: 1.7,
});
const pane = new THREE.Mesh(new THREE.BoxGeometry(M.Lx, M.Ly, GLASS.T), [edgeMat, edgeMat, edgeMat, edgeMat, glassMat, glassMat]);
pane.position.set(GLASS.x, GLASS.y, M.D + GLASS.T / 2);
scene.add(pane);
const baseGlint = +(qs.get('glint') || 0.025);
const sunLight = new THREE.DirectionalLight(0xfff1dc, baseGlint);
scene.add(sunLight, sunLight.target);

// dust in the beam — only motes inside the sunlight are visible
const motes = (() => {
  const n = coarse ? 60 : 110, pos = new Float32Array(n * 3), seed = new Float32Array(n);
  let r = 7;
  const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const t = rnd();                                      // along the beam: wall (0) -> window (1)
    const z = 0.15 + t * 5.6;
    const base = new THREE.Vector2(IMG.x, IMG.y).addScaledVector(new THREE.Vector2(-SUN0.x, -SUN0.y), z / -SUN0.z);
    pos[i * 3] = base.x + (rnd() - 0.5) * M.Lx * 1.05; pos[i * 3 + 1] = base.y + (rnd() - 0.5) * M.Ly * 1.05; pos[i * 3 + 2] = z;
    seed[i] = rnd();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { ...roomUniforms, uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() } },
    vertexShader: /* glsl */`
      attribute float aSeed; uniform float uTime, uPx, uD; uniform vec3 uSun, uGC; uniform vec2 uGlassH; uniform mat3 uRot;
      varying float vLit;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.11 + aSeed * 40.0) * 0.06;
        p.y += sin(uTime * 0.07 + aSeed * 23.0) * 0.05 - mod(uTime * 0.004 + aSeed, 1.0) * 0.08;
        vec3 nG = uRot[2];
        vec3 Q = p + uSun * (dot(uGC - p, nG) / dot(uSun, nG));
        vec2 d = abs((transpose(uRot) * (Q - uGC)).xy) - uGlassH;
        vLit = (1.0 - smoothstep(-0.03, 0.03, max(d.x, d.y))) * smoothstep(5.6, 3.8, p.z);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uPx * (1.2 + 1.6 * aSeed) * (6.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying float vLit;
      void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vLit * 0.42; if (a < 0.01) discard;
        gl_FragColor = vec4(vec3(1.0, 0.95, 0.86) * a, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(g, m);
  pts.frustumCulled = false;
  scene.add(pts);
  return m;
})();

// ---------- camera ----------
const camera = new THREE.PerspectiveCamera(15, 1, 0.1, 60);
const CAM = {
  wide: { pos: new THREE.Vector3(-0.55, 1.2, 4.6), look: new THREE.Vector3(0.15, 1.5, 0.6), fov: 34 },
  tall: { pos: new THREE.Vector3(0.15, 1.05, 5.6), look: new THREE.Vector3(-0.25, 1.6, 0.8), fov: 40 },
};
const OPEN = {   // the film starts here: at the glass, looking through it at the wall
  wide: { pos: new THREE.Vector3(1.85, 2.05, 4.35), look: new THREE.Vector3(0.3, 1.72, 0.0), fov: 36 },
  tall: { pos: new THREE.Vector3(1.3, 1.95, 4.75), look: new THREE.Vector3(0.0, 1.62, 0.0), fov: 44 },
};
if (qs.get('cam')) {
  const v = qs.get('cam').split(',').map(Number);
  CAM.wide = CAM.tall = { pos: new THREE.Vector3(v[0], v[1], v[2]), look: new THREE.Vector3(v[3], v[4], v[5]), fov: v[6] || 15 };
}
let shot = CAM.wide;
function resize() {
  const w = FILM ? +(qs.get('w') || 1920) : innerWidth, h = FILM ? +(qs.get('h') || 1080) : innerHeight;
  renderer.setSize(w, h, !FILM);
  if (FILM) { canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; }
  camera.aspect = w / h;
  shot = camera.aspect < 0.9 ? CAM.tall : CAM.wide;
  camera.fov = shot.fov;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

// ---------- state ----------
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const smooth = (a, b, t) => ease(clamp01((t - a) / (b - a)));
const view = { amp: reduceMotion ? 1 : 0, progress: 0, yaw: 0, pitch: 0, dolly: 0, time: 0, cursor: null, liquid: 0, reveal: reduceMotion ? 1 : 0 };
const captions = [...document.querySelectorAll('.caption')];

sunLight.position.copy(pane.position).addScaledVector(SUN0, -6);
sunLight.target.position.copy(pane.position);
const euler = new THREE.Euler(), lookAt = new THREE.Vector3();
// you hold the glass: tilt it and the light follows (the physics runs in the glass's own frame)
function holdGlass(yawDeg, pitchDeg) {
  euler.set(THREE.MathUtils.degToRad(pitchDeg), THREE.MathUtils.degToRad(yawDeg), 0, 'YXZ');
  pane.quaternion.setFromEuler(euler);
  pane.updateMatrixWorld(true);
  shared.uRot.value.setFromMatrix4(pane.matrixWorld);
  shared.uGC.value.set(0, 0, -GLASS.T / 2).applyMatrix3(shared.uRot.value).add(pane.position);
}
function placeCamera() {
  const e = ease(clamp01(view.reveal));
  const a = camera.aspect < 0.9 ? OPEN.tall : OPEN.wide;
  camera.position.lerpVectors(a.pos, shot.pos, e);
  camera.position.y += Math.sin(Math.PI * e) * 0.14;
  lookAt.lerpVectors(a.look, shot.look, e);
  camera.fov = a.fov + (shot.fov - a.fov) * e;
  camera.updateProjectionMatrix();
  camera.position.lerp(lookAt, view.dolly);
  camera.position.x += Math.sin(view.time * 0.09) * 0.03; camera.position.y += Math.sin(view.time * 0.13) * 0.015;
  camera.lookAt(lookAt);
}

function apply() {
  // glass shape: progress 0..2 across the three solved shapes
  const p = Math.min(STATES.length - 1 - 1e-6, Math.max(0, view.progress));
  const k = Math.floor(p), f = p - k;
  const mix = reduceMotion ? (f < 0.5 ? 0 : 1) : f;
  shared.uSlopeA.value = loaded[k].slopes; shared.uSlopeB.value = loaded[k + 1].slopes;
  shared.uMix.value = mix; shared.uAmp.value = view.amp;
  glassMat.normalMap = loaded[k].normal; glassUniforms.normalMapB.value = loaded[k + 1].normal;
  glassUniforms.uNormalMix.value = mix; glassUniforms.uNormalAmp.value = view.amp * 0.45;
  holdGlass(view.yaw, view.pitch);
  shared.uLiquid.value = reduceMotion ? 0 : view.liquid;
  shared.uTime.value = view.time;
  const lq = shared.uLiquid.value;
  sunLight.intensity = baseGlint + lq * 11.0;
  glassMat.thickness = GLASS.T + lq * 11.0;
  glassMat.attenuationDistance = 0.28 + lq * 40.0;
  // captions: each one owns a window of progress around its state
  captions.forEach((el) => {
    const s = +el.dataset.state;
    let o = 1 - Math.abs(view.progress - s) / 0.42;
    o = clamp01(o) * (s === 0 ? view.captionIn : 1);
    o = ease(clamp01(o));
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translateY(${((1 - o) * 8).toFixed(2)}px)`;
    el.classList.toggle('on', o > 0.5);
  });
  placeCamera();
  motes.uniforms.uTime.value = view.time;
}
view.captionIn = reduceMotion ? 1 : 0;

function render() {
  renderer.setRenderTarget(causticRT);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.render(causticScene, causticCam);
  renderer.setRenderTarget(null);
  renderer.setClearColor(0xe9e5de, 1);
  renderer.render(scene, camera);
}

// ---------- film: deterministic timeline (window.__render(t)) ----------
const FILM_LEN = 17;
const openLiquid = (t) => 0.02 * Math.exp(-Math.max(0, t - 0.4) / 1.25);
function filmAt(t) {
  view.time = t;
  view.reveal = smooth(0.6, 4.9, t);                      // from the glass to the wall
  view.amp = smooth(0.7, 4.3, t);                         // the glass takes its shape
  view.captionIn = smooth(4.4, 5.4, t);
  // the hand: tilt the glass, give it a shake, let go
  const tilt = smooth(6.6, 8.0, t) - smooth(9.7, 10.7, t);
  const wig = (t > 8.25 && t < 9.25) ? Math.sin((t - 8.25) * Math.PI * 2 * 3.2) * (1 - smooth(8.95, 9.25, t)) : 0;
  view.yaw = 8.0 * tilt + 2.2 * wig; view.pitch = -3.6 * tilt;
  const shakeE = t < 8.25 ? 0 : (t < 9.25 ? 0.016 * smooth(8.25, 8.9, t) : 0.016 * Math.exp(-(t - 9.25) / 1.0));
  view.progress = smooth(11.9, 15.1, t);                  // scroll: the glass melts and re-forms
  const surge = 0.013 * Math.sin(Math.PI * clamp01((t - 11.9) / 3.2));
  view.liquid = Math.max(openLiquid(t), shakeE, surge);
  view.dolly = 0.03 * smooth(5.0, 17.0, t);
  view.cursor = (t > 6.2 && t < 10.9)
    ? { x: 0.66 + view.yaw * 0.012, y: 0.42 - view.pitch * 0.02, o: smooth(6.2, 6.6, t) * (1 - smooth(10.5, 10.9, t)) } : null;
  const cur = document.getElementById('cursor');
  if (view.cursor) {
    cur.style.display = 'block'; cur.style.opacity = view.cursor.o;
    cur.style.left = (view.cursor.x * innerWidth) + 'px'; cur.style.top = (view.cursor.y * innerHeight) + 'px';
  } else cur.style.display = 'none';
  document.getElementById('hint').style.opacity = (smooth(5.4, 6.2, t) * (1 - smooth(13.2, 14.0, t))).toFixed(3);
}
if (FILM) {
  document.documentElement.style.scrollSnapType = 'none';
  document.body.style.overflow = 'hidden';
  window.__render = (t) => { filmAt(t); apply(); render(); return true; };
  window.__ready = true;
  window.__filmLength = FILM_LEN;
  window.__render(+(qs.get('t') || 0));
} else {
  // ---------- live ----------
  const target = { yaw: 0, pitch: 0 };
  const vel = { yaw: 0, pitch: 0 };
  let energy = 0, lastX = null, lastY = null, lastT = 0, dragging = false;
  const kick = (amount) => { energy = Math.min(0.016, energy + amount); };
  addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (lastX !== null) {
      const dt = Math.max(1, now - lastT), speed = Math.hypot(e.clientX - lastX, e.clientY - lastY) / dt;   // px per ms
      if (speed > 0.9 && (e.pointerType === 'mouse' || dragging)) kick((speed - 0.9) * 0.0007);
      if (dragging) {
        target.yaw = Math.max(-9, Math.min(9, target.yaw + (e.clientX - lastX) * 0.05));
        target.pitch = Math.max(-6, Math.min(6, target.pitch - (e.clientY - lastY) * 0.03));
      }
    }
    lastX = e.clientX; lastY = e.clientY; lastT = now;
    if (e.pointerType === 'mouse') {
      target.yaw = (e.clientX / innerWidth - 0.5) * 2 * 8.0;
      target.pitch = -(e.clientY / innerHeight - 0.5) * 2 * 5.0;
    }
  });
  addEventListener('pointerdown', (e) => { kick(0.009); if (e.pointerType !== 'mouse') { dragging = true; lastX = e.clientX; lastY = e.clientY; lastT = performance.now(); } });
  addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') { dragging = false; target.yaw = 0; target.pitch = 0; } });
  document.addEventListener('mouseleave', () => { target.yaw = 0; target.pitch = 0; });
  document.getElementById('hint').textContent = coarse ? 'Drag to tilt the glass · scroll for the work' : 'Move to tilt the glass · shake it · scroll for the work';

  const t0 = performance.now();
  let last = t0, frames = 0, fpsT = t0;
  let gFrames = 0, gStart = 0, level = 0;
  const govern = (now) => {
    if (level >= 2) return;
    if (now - t0 < 2000) return;                       // let shaders compile and the opening settle first
    if (!gStart) { gStart = now; gFrames = 0; return; }
    gFrames++;
    if (now - gStart < 1500) return;
    const fps = gFrames / ((now - gStart) / 1000);
    if (fps < 45) {
      level++;
      renderer.setPixelRatio(Math.max(1, renderer.getPixelRatio() * 0.72));
      roomUniforms.uSteps.value = level === 1 ? 26 : 16;
      resize();
      if (DEBUG) console.log('governor: fps', fps.toFixed(1), '-> level', level, 'dpr', renderer.getPixelRatio().toFixed(2));
    } else level = 2;
    gStart = now; gFrames = 0;
  };
  window.__level = () => ({ level, dpr: renderer.getPixelRatio(), steps: roomUniforms.uSteps.value });
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    view.time = t;
    if (!reduceMotion) {
      view.reveal = smooth(0.4, 4.6, t);
      view.amp = smooth(0.5, 4.0, t);
      view.captionIn = smooth(4.0, 5.0, t);
      view.dolly = 0.03 * clamp01(t / 20);
    }
    energy *= Math.exp(-dt / 1.0);
    // critically damped spring towards the pointer
    for (const k of ['yaw', 'pitch']) {
      const w = 5.0, x = view[k] - target[k];
      vel[k] += (-w * w * x - 2 * w * vel[k]) * dt;
      view[k] += vel[k] * dt;
      if (reduceMotion) view[k] = target[k];
    }
    const max = document.documentElement.scrollHeight - innerHeight;
    const goal = max > 0 ? (scrollY / max) * (STATES.length - 1) : 0;
    view.progress += (goal - view.progress) * (reduceMotion ? 1 : Math.min(1, dt * 3.2));
    const frac = view.progress - Math.floor(view.progress + 1e-4);
    const surge = 0.013 * Math.sin(Math.PI * clamp01(frac));
    view.liquid = Math.max(openLiquid(t), energy, surge);
    document.getElementById('hint').style.opacity = (view.captionIn * (1 - clamp01(view.progress * 2))).toFixed(3);
    apply(); render();
    frames++;
    govern(now);
    if (DEBUG && now - fpsT > 1000) { console.log('fps', frames); frames = 0; fpsT = now; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  window.__ready = true;
}
