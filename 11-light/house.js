// House of Light — sample (room 1 → walk → room 2).
// One building where light is the material. Each room has its own frame: the wall that receives the
// light is z = 0 (facing +z) and the room extends towards +z. Glass lives in that frame; a GPU pass
// traces every vertex of the glass (exact Snell) onto that wall; every surface is shaded in the frame.
// Room 1: one computed pane writes the name (hold it, shake it). Room 2: a column of 55 computed glass
// pages (54 real UnboundPDF tools + "0 uploads.") descends through a slot of sun.

import * as THREE from '../vendor/three.module.js';

const qs = new URLSearchParams(location.search);
const FILM = qs.has('film');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches && !FILM;
const coarse = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
const canvas = document.getElementById('scene');
try { if (!canvas.getContext('webgl2')) throw 0; } catch { document.documentElement.classList.add('nogl'); throw new Error('no WebGL2'); }

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: FILM });
renderer.setPixelRatio(FILM ? 1 : Math.min(devicePixelRatio, coarse ? 2 : 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = +(qs.get('exp') || 1.05);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ---------- data ----------
async function slopesTex(path, VW, VH) {
  const r = await fetch(path); if (!r.ok) throw new Error('missing ' + path);
  const f = new Float32Array(await r.arrayBuffer());
  const h = new Uint16Array(f.length);
  for (let i = 0; i < f.length; i++) h[i] = THREE.DataUtils.toHalfFloat(f[i]);
  const t = new THREE.DataTexture(h, VW, VH, THREE.RGFormat, THREE.HalfFloatType);
  t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true;
  return t;
}
const meta1 = await (await fetch('glass/name.json')).json();
const tools = await (await fetch('glass/gallery/tools.json')).json();
const heroMeta = await (await fetch('glass/gallery/hero.json')).json();
const tileMeta = await (await fetch('glass/gallery/p00.json')).json();
const flat = () => { const t = new THREE.DataTexture(new Uint16Array(4), 1, 1, THREE.RGFormat, THREE.HalfFloatType); t.needsUpdate = true; return t; };
const [nameSlopes, heroSlopes, ...tileSlopes] = await Promise.all([
  slopesTex('glass/name.slopes.bin', meta1.VW, meta1.VH),
  slopesTex('glass/gallery/hero.slopes.bin', heroMeta.VW, heroMeta.VH),
  ...tools.map((t) => slopesTex(`glass/gallery/${t.id}.slopes.bin`, tileMeta.VW, tileMeta.VH).catch(flat)),
]);
const SUN1 = new THREE.Vector3(...meta1.sun).normalize();
const SUN2 = new THREE.Vector3(...heroMeta.sun).normalize();

// ---------- shared GLSL ----------
const COMMON = /* glsl */`
  float box(vec2 p, vec2 c, vec2 h, float soft) { vec2 d = abs(p - c) - h; return 1.0 - smoothstep(-soft, soft, max(d.x, d.y)); }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
  // board-formed concrete: 1.8 x 0.9 m panels, six tie holes each, slight panel-to-panel tone
  vec3 concrete(vec2 uv, vec3 base, float holes) {
    vec2 panel = vec2(1.8, 0.9);
    vec2 q = uv / panel, f = fract(q), id = floor(q);
    float e = min(min(f.x, 1.0 - f.x) * panel.x, min(f.y, 1.0 - f.y) * panel.y);
    float seam = mix(0.84, 1.0, smoothstep(0.0, 0.004, e));
    vec2 hc = (fract(f * vec2(3.0, 2.0)) - 0.5) * panel / vec2(3.0, 2.0);
    float hole = (1.0 - smoothstep(0.011, 0.015, length(hc))) * holes;
    float tone = 0.93 + 0.07 * hash(id) + 0.05 * (vnoise(uv * 3.0) - 0.5) + 0.035 * (vnoise(uv * 37.0) - 0.5);
    return base * tone * mix(1.0, seam, holes) * (1.0 - 0.55 * hole);
  }`;

// ---------- caustic pass (one mesh per pane per colour) ----------
const causticVert = /* glsl */`
  uniform sampler2D uSlope;
  uniform float uAmp, uN, uCell, uRipple, uLiquid, uTime;
  uniform vec2 uGrid;
  uniform vec3 uSun, uGC;
  uniform mat3 uRot;
  uniform vec4 uRect, uClip;
  varying vec2 vLens; varying vec2 vWall; varying float vFlux;
  const vec2 WK[7] = vec2[7](vec2(61.0, 23.0), vec2(-37.0, 71.0), vec2(83.0, -41.0), vec2(-58.0, -49.0), vec2(19.0, 96.0), vec2(104.0, 37.0), vec2(-91.0, 12.0));
  const float WW[7] = float[7](2.1, 2.6, 3.0, 2.4, 2.9, 3.3, 2.2);
  const float WP[7] = float[7](0.3, 1.9, 4.2, 2.7, 5.1, 0.8, 3.6);
  vec2 liquid(vec2 p, float t) { vec2 g = vec2(0.0); for (int i = 0; i < 7; i++) g += normalize(WK[i]) * cos(dot(WK[i], p) - WW[i] * t + WP[i]); return g * 0.38; }
  vec2 ripple(vec2 p) {
    vec2 k1 = vec2(231.0, 97.0), k2 = vec2(-143.0, 201.0), k3 = vec2(57.0, -263.0);
    return 0.55 * (normalize(k1) * cos(dot(k1, p) + 1.3) + normalize(k2) * cos(dot(k2, p) + 4.1) + normalize(k3) * cos(dot(k3, p) + 2.2));
  }
  void main() {
    vec2 cell = position.xy;
    vec2 uv = (cell + 0.5) / (uGrid + 1.0);
    vec2 lens = vec2((cell.x - 0.5 * uGrid.x) * uCell, (0.5 * uGrid.y - cell.y) * uCell);
    vec2 g = texture2D(uSlope, uv).xy * uAmp + uRipple * ripple(lens) + uLiquid * liquid(lens, uTime);
    vec3 N = normalize(vec3(-g.x, -g.y, 1.0));
    vec3 sL = transpose(uRot) * uSun;
    vec3 vin = refract(sL, vec3(0.0, 0.0, 1.0), 1.0 / uN);
    vec3 vout = uRot * refract(vin, N, uN);
    vec3 P = uGC + uRot * vec3(lens, 0.0);
    vec2 hit = P.xy + (-P.z / min(vout.z, -1e-4)) * vout.xy;
    vec2 cd = abs(P.xy - uClip.xy) - uClip.zw;
    if (dot(vout, vout) < 0.5 || max(cd.x, cd.y) > 0.0) hit = vec2(1e4);   // TIR, or outside the sunbeam
    vLens = lens; vWall = hit; vFlux = abs(sL.z) / abs(uSun.z);
    gl_Position = vec4((hit - uRect.xy) / uRect.zw * 2.0 - 1.0, 0.0, 1.0);
  }`;
const causticFrag = /* glsl */`
  uniform vec3 uColor;
  uniform float uGain;
  varying vec2 vLens; varying vec2 vWall; varying float vFlux;
  void main() {
    vec2 a = dFdx(vLens), b = dFdy(vLens), c = dFdx(vWall), d = dFdy(vWall);
    float ratio = abs(a.x * b.y - a.y * b.x) / max(abs(c.x * d.y - c.y * d.x), 1e-14);
    gl_FragColor = vec4(uColor * uGain * min(ratio * vFlux, 80.0), 1.0);
  }`;
function photonGeometry(W, H) {
  const vw = W + 1, vh = H + 1, pos = new Float32Array(vw * vh * 3);
  for (let i = 0; i < vh; i++) for (let j = 0; j < vw; j++) { const p = (i * vw + j) * 3; pos[p] = j; pos[p + 1] = i; }
  const idx = new Uint32Array(W * H * 6); let k = 0;
  for (let i = 0; i < H; i++) for (let j = 0; j < W; j++) {
    const a = i * vw + j, b = a + 1, c = a + vw + 1, d = a + vw;
    idx[k++] = a; idx[k++] = b; idx[k++] = c; idx[k++] = a; idx[k++] = c; idx[k++] = d;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1));
  return g;
}
const geo512 = photonGeometry(coarse ? 256 : 512, coarse ? 128 : 256);
const geo128 = photonGeometry(coarse ? 64 : 128, coarse ? 32 : 64);
const disp = 1.6;
const CH = coarse ? [[0, new THREE.Vector3(1, 1, 1)]] : [[-0.0025 * disp, new THREE.Vector3(1, 0, 0)], [0, new THREE.Vector3(0, 1, 0)], [0.0056 * disp, new THREE.Vector3(0, 0, 1)]];

const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); blank.needsUpdate = true;
// ---------- a room ----------
function makeRoom(o) {
  const group = new THREE.Group();
  group.position.copy(o.position || new THREE.Vector3()); group.rotation.y = o.rotY || 0;
  const rt = new THREE.WebGLRenderTarget(o.rt[0], o.rt[1], { type: THREE.HalfFloatType, depthBuffer: false,
    minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: true });
  const cscene = new THREE.Scene();
  const U = {   // shared by everything in the room
    uCaustic: { value: rt.texture }, uRect: { value: new THREE.Vector4(...o.rect) }, uSun: { value: o.sun.clone() },
    uSunCol: { value: new THREE.Color(1.0, 0.77, 0.5) }, uSkyCol: { value: new THREE.Color(0.8, 0.86, 1.0) },
    uSunE: { value: o.sunE }, uSkyE: { value: o.skyE }, uGlow: { value: 0.05 }, uHaze: { value: o.haze },
    uSteps: { value: coarse ? 18 : 28 }, uBeamMin: { value: o.beamMin }, uBeamMax: { value: o.beamMax },
    uCamLocal: { value: new THREE.Vector3() }, uImg: { value: new THREE.Vector2(...o.img) },
    uSlotZ: { value: o.slotZ }, uUseRot: { value: o.useRot ? 1 : 0 },
    uGC: { value: new THREE.Vector3() }, uRot: { value: new THREE.Matrix3() }, uGlassH: { value: new THREE.Vector2(...(o.glassH || [0.7, 0.35])) },
    uSlotC: { value: new THREE.Vector2(...(o.slotC || [0, 0])) }, uSlotH: { value: new THREE.Vector2(...(o.slotH || [0, 0])) },
    uPageA: { value: new THREE.Vector4(0, -99, 0, 0) }, uPageB: { value: new THREE.Vector4(0, -99, 0, 0) },
    uDoor: { value: new THREE.Vector4(...(o.door || [0, 0, 0, 0])) },
    uTime: { value: 0 }, uLiquid: { value: 0 }, uRipple: { value: 0.0008 },
    uWinMask: { value: o.mask || blank }, uWinRect: { value: new THREE.Vector4(...(o.maskRect || [0, 0, 1, 1])) }, uMaskOn: { value: o.mask ? 1 : 0 },
  };
  const panes = [];   // caustic slots: each {uniforms (per-pane), meshes}
  for (let s = 0; s < o.slots; s++) {
    const PU = { uSlope: { value: null }, uAmp: { value: 1 }, uGain: { value: 1 }, uGC: { value: new THREE.Vector3() }, uRot: { value: new THREE.Matrix3() },
      uClip: { value: new THREE.Vector4(0, 0, 99, 99) }, uGrid: { value: new THREE.Vector2(o.grid[0], o.grid[1]) }, uCell: { value: o.cell } };
    for (const [dn, col] of CH) {
      const m = new THREE.ShaderMaterial({
        uniforms: { ...PU, uN: { value: 1.517 + dn }, uColor: { value: col }, uSun: U.uSun, uRect: U.uRect, uLiquid: U.uLiquid, uTime: U.uTime, uRipple: U.uRipple },
        vertexShader: causticVert, fragmentShader: causticFrag, side: THREE.DoubleSide,
        blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
        depthTest: false, depthWrite: false, transparent: true, toneMapped: false,
      });
      const mesh = new THREE.Mesh(geo512, m); mesh.frustumCulled = false; cscene.add(mesh);
    }
    panes.push(PU);
  }
  const tiles = [];   // small panes: one white pass each
  for (let s = 0; s < (o.tiles || 0); s++) {
    const TU = { uSlope: { value: null }, uAmp: { value: 1 }, uGain: { value: 0 }, uGC: { value: new THREE.Vector3() }, uRot: { value: new THREE.Matrix3() },
      uClip: { value: new THREE.Vector4(0, 0, 99, 99) }, uGrid: { value: new THREE.Vector2(coarse ? 64 : 128, coarse ? 32 : 64) }, uCell: { value: o.tileW / (coarse ? 64 : 128) } };
    const m = new THREE.ShaderMaterial({
      uniforms: { ...TU, uN: { value: 1.517 }, uColor: { value: new THREE.Vector3(1, 1, 1) }, uSun: U.uSun, uRect: U.uRect, uLiquid: U.uLiquid, uTime: U.uTime, uRipple: U.uRipple },
      vertexShader: causticVert, fragmentShader: causticFrag, side: THREE.DoubleSide,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
      depthTest: false, depthWrite: false, transparent: true, toneMapped: false,
    });
    const mesh = new THREE.Mesh(geo128, m); mesh.frustumCulled = false; cscene.add(mesh);
    tiles.push(TU);
  }
  const vert = /* glsl */`
    uniform mat4 uLocal;
    varying vec3 vLocal; varying vec3 vN;
    void main() {
      vLocal = (uLocal * vec4(position, 1.0)).xyz; vN = normalize(mat3(uLocal) * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;
  const frag = COMMON + /* glsl */`
    uniform sampler2D uCaustic;
    uniform vec4 uRect, uPageA, uPageB, uDoor;
    uniform vec3 uSun, uSunCol, uSkyCol, uAlbedo, uCamLocal, uGC, uBeamMin, uBeamMax;
    uniform vec2 uImg, uGlassH, uSlotC, uSlotH;
    uniform mat3 uRot;
    uniform float uSunE, uSkyE, uGlow, uHaze, uSlotZ, uUseRot, uReceive, uFloor, uHoles;
    uniform int uSteps;
    uniform sampler2D uWinMask;
    uniform vec4 uWinRect;
    uniform float uMaskOn, uCutout;
    varying vec3 vLocal; varying vec3 vN;
    float winMask(vec2 q) { vec2 uv = (q - uWinRect.xy) / uWinRect.zw;
      if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 0.0; return texture2D(uWinMask, uv).r; }
    vec2 toSlot(vec3 X) { return X.xy + uSun.xy * ((X.z - uSlotZ) / -uSun.z); }
    float aperture(vec3 X, float soft) {          // is X on a sun ray that passes the room's opening?
      if (uMaskOn > 0.5) return winMask(toSlot(X));
      if (uUseRot > 0.5) {
        vec3 nG = uRot[2];
        vec3 Q = X + uSun * (dot(uGC - X, nG) / dot(uSun, nG));
        return box((transpose(uRot) * (Q - uGC)).xy, vec2(0.0), uGlassH, soft);
      }
      return box(toSlot(X), uSlotC, uSlotH, soft);
    }
    vec3 causticLod(vec2 xy, float lod) {
      vec2 uv = (xy - uRect.xy) / uRect.zw;
      if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return vec3(0.0);
      return textureLod(uCaustic, uv, lod).rgb;
    }
    vec3 causticAt(vec2 xy) {
      vec2 uv = (xy - uRect.xy) / uRect.zw;
      if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return vec3(0.0);
      vec2 px = 0.6 / vec2(textureSize(uCaustic, 0));
      vec3 c = texture2D(uCaustic, uv + px).rgb + texture2D(uCaustic, uv - px).rgb + texture2D(uCaustic, uv + vec2(px.x, -px.y)).rgb + texture2D(uCaustic, uv + vec2(-px.x, px.y)).rgb;
      float edge = smoothstep(0.0, 0.03, uv.x) * smoothstep(0.0, 0.03, 1.0 - uv.x) * smoothstep(0.0, 0.03, uv.y) * smoothstep(0.0, 0.03, 1.0 - uv.y);
      float lod = log2(max(1.0, float(textureSize(uCaustic, 0).x) / 192.0));
      return (c * 0.25 + (textureLod(uCaustic, uv, lod).rgb * 0.55 + textureLod(uCaustic, uv, lod + 1.6).rgb * 0.45) * uGlow) * edge;
    }
    // sunlight that reaches the wall without passing through glass (the slot minus the pages)
    float direct(vec3 X) {
      if (uUseRot > 0.5 || uMaskOn > 0.5) return 0.0;
      vec2 Q = toSlot(X);
      float a = box(Q, uPageA.xy, uPageA.zw, 0.002), b = box(Q, uPageB.xy, uPageB.zw, 0.002);
      return box(Q, uSlotC, uSlotH, 0.012) * (1.0 - a) * (1.0 - b);
    }
    vec3 haze(vec3 P) {
      vec3 O = uCamLocal, R = P - O; float L = length(R); R /= L;
      vec3 inv = 1.0 / R, t0 = (uBeamMin - O) * inv, t1 = (uBeamMax - O) * inv, lo = min(t0, t1), hi = max(t0, t1);
      float a = max(max(lo.x, lo.y), max(lo.z, 0.0)), b = min(min(hi.x, hi.y), min(hi.z, L));
      if (b <= a) return vec3(0.0);
      float dt = (b - a) / float(uSteps), j = hash(gl_FragCoord.xy + 0.37), acc = 0.0;
      for (int i = 0; i < 40; i++) {
        if (i >= uSteps) break;
        vec3 X = O + R * (a + (float(i) + j) * dt);
        float d = 0.0;
        if (X.z > uSlotZ) d = aperture(X, 0.02) * smoothstep(uBeamMax.z, uBeamMax.z - 2.0, X.z);
        else if (X.z > 0.0) {
          vec2 Pw = X.xy + uSun.xy * (X.z / -uSun.z);
          d = mix(dot(causticLod(Pw, 1.0), vec3(0.3333)) + direct(vec3(Pw, 0.0)), aperture(X, 0.02), clamp(X.z / uSlotZ, 0.0, 1.0));
        }
        acc += d * smoothstep(0.5, 2.2, length(X - O));
      }
      return uSunCol * uSunE * uHaze * acc * dt;
    }
    void main() {
      vec3 P = vLocal, N = normalize(vN);
      if (uCutout > 0.5 && winMask(P.xy) > 0.5) discard;
      vec2 uv = abs(N.z) > 0.5 ? P.xy : (abs(N.x) > 0.5 ? P.zy : P.xz);
      vec3 alb = concrete(uv, uAlbedo, uHoles);
      float ao = (1.0 - 0.4 * exp(-P.y / 0.45) * (1.0 - abs(N.y))) * (1.0 - 0.45 * exp(-P.z / 0.55) * abs(N.y));
      vec3 sky = uSkyCol * uSkyE * (0.78 + 0.22 * N.y + 0.12 * N.x) * ao;
      vec3 sun = vec3(0.0);
      if (uReceive > 0.5) sun = uSunCol * uSunE * (-uSun.z) * (direct(P) + 0.92 * causticAt(P.xy));
      float d2 = dot(P - vec3(uImg, 0.0), P - vec3(uImg, 0.0));
      vec3 bounce = uSunCol * uSunE * 0.05 * exp(-d2 / 3.0);
      // warm light spilling out of the next room through the doorway (room 1 only)
      vec3 spill = vec3(0.0);
      if (uDoor.z > 0.001) { vec2 dd = (P.xz - uDoor.xy) / uDoor.zw; spill = uSunCol * uSunE * 0.22 * exp(-dot(dd, dd)); }
      vec3 col = alb * (sky + sun + bounce + spill);
      if (uFloor > 0.5) {
        vec3 V = normalize(P - uCamLocal), Rr = reflect(V, vec3(0.0, 1.0, 0.0));
        if (Rr.z < -1e-3) {
          vec3 H = P + Rr * (P.z / -Rr.z);
          float fres = 0.04 + 0.96 * pow(1.0 - clamp(-V.y, 0.0, 1.0), 5.0);
          col += uSunCol * uSunE * (-uSun.z) * (0.92 * causticLod(H.xy, 3.0) + direct(H) * 0.8) * fres * 0.6;
        }
      }
      col += haze(P);
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      gl_FragColor.rgb += (hash(gl_FragCoord.xy * 1.37) - 0.5) / 255.0;
    }`;
  const surfaces = [];
  function surface(geometry, setup, opts = {}) {
    const m = new THREE.ShaderMaterial({ uniforms: { ...U, uLocal: { value: new THREE.Matrix4() },
      uAlbedo: { value: opts.albedo || new THREE.Color(0.7, 0.68, 0.65) }, uReceive: { value: opts.receive ? 1 : 0 },
      uFloor: { value: opts.floor ? 1 : 0 }, uHoles: { value: opts.floor ? 0 : 1 }, uCutout: { value: opts.cutout ? 1 : 0 } }, vertexShader: vert, fragmentShader: frag });
    const mesh = new THREE.Mesh(geometry, m); setup(mesh); mesh.updateMatrix();
    m.uniforms.uLocal.value.copy(mesh.matrix);
    group.add(mesh); surfaces.push(mesh);
    return mesh;
  }
  return { group, rt, cscene, U, panes, tiles, surface };
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111110);
{ // soft reflections for the glass
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(14, 7, 14), new THREE.MeshBasicMaterial({ color: 0xa8a39b, side: THREE.BackSide })));
  const top = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.1, 1.05, 0.98) }));
  top.position.y = 3.4; top.rotation.x = Math.PI / 2; env.add(top);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, 0.035).texture; pm.dispose();
}
const glassMat = (thick) => new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transmission: 1, thickness: thick, ior: 1.517,
  attenuationColor: new THREE.Color(0.72, 0.92, 0.85), attenuationDistance: 0.3, envMapIntensity: 0.8 });

// ---------- room 1: the name ----------
const G1 = new THREE.Vector3(0.9, 1.95, meta1.D);     // pane back-face centre
const IMG1 = [G1.x + meta1.offset[0], G1.y + meta1.offset[1]];
const R1 = makeRoom({ rt: [1536, 896], rect: [IMG1[0] - 1.2, IMG1[1] - 0.7, 2.4, 1.4], sun: SUN1, sunE: 1.35, skyE: 0.5, haze: 0.15,
  beamMin: new THREE.Vector3(-1.6, 0.9, 0), beamMax: new THREE.Vector3(4.2, 3.9, 5.6), img: IMG1, slotZ: meta1.D, useRot: true,
  glassH: [meta1.Lx / 2, meta1.Ly / 2], slots: 1, grid: [coarse ? 256 : 512, coarse ? 128 : 256], cell: meta1.Lx / (coarse ? 256 : 512),
  door: [-3.2, 3.3, 1.6, 1.3] });
R1.panes[0].uSlope.value = nameSlopes;
const concrete1 = new THREE.Color(0.74, 0.72, 0.69);
R1.surface(new THREE.PlaneGeometry(10.2, 6), (m) => m.position.set(1.9, 3, 0), { receive: true, albedo: concrete1 });
R1.surface(new THREE.PlaneGeometry(10.2, 10), (m) => { m.rotation.x = -Math.PI / 2; m.position.set(1.9, 0, 5); }, { floor: true, albedo: new THREE.Color(0.5, 0.48, 0.45) });
R1.surface(new THREE.PlaneGeometry(10.2, 10), (m) => { m.rotation.x = Math.PI / 2; m.position.set(1.9, 5.2, 5); }, { albedo: concrete1 });
// the left wall with a deep doorway into room 2 (x = -3.2, 30 cm thick)
for (const [z0, z1, y0, y1] of [[0, 2.65, 0, 5.2], [3.95, 10, 0, 5.2], [2.65, 3.95, 2.75, 5.2]])
  R1.surface(new THREE.BoxGeometry(0.3, y1 - y0, z1 - z0), (m) => m.position.set(-3.35, (y0 + y1) / 2, (z0 + z1) / 2), { albedo: concrete1 });
const pane1 = new THREE.Mesh(new THREE.BoxGeometry(meta1.Lx, meta1.Ly, 0.045), glassMat(0.045));
pane1.position.set(G1.x, G1.y, G1.z + 0.0225);
R1.group.add(pane1);
scene.add(R1.group);

// ---------- room 2: the window gallery (local frame; through the doorway, left of room 1) ----------
// One wall is pierced by 55 windows (the product + its 54 tools); each pane is computed so the sun through it
// writes its word on the opposite wall. Everything is visible at once.
const D2 = heroMeta.D, OFF2 = heroMeta.offset;
const TW = tileMeta.Lx, TH = tileMeta.Ly, MAG = tileMeta.mag;
const HERO = { x: -0.35, y: 2.79 }; HERO.wx = HERO.x - OFF2[0]; HERO.wy = HERO.y - OFF2[1];
const TILES = tools.map((t, i) => {
  const x = -2.75 + 0.6 * t.col, y = 2.15 - 0.32 * t.row;
  return { i, x, y, wx: x - OFF2[0], wy: y - OFF2[1], delay: 0.05 + 0.75 * (t.col / 8) + 0.04 * t.row };
});
const MASK_RECT = [-3.2, 0, 6.4, 6.4];
const maskCanvas = document.createElement('canvas'); maskCanvas.width = maskCanvas.height = 1024;
{ const g = maskCanvas.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 1024, 1024); g.fillStyle = '#fff';
  const r = (cx, cy, w, h) => g.fillRect((cx - w / 2 - MASK_RECT[0]) / MASK_RECT[2] * 1024, (1 - (cy + h / 2 - MASK_RECT[1]) / MASK_RECT[3]) * 1024, w / MASK_RECT[2] * 1024, h / MASK_RECT[3] * 1024);
  r(HERO.wx, HERO.wy, heroMeta.Lx, heroMeta.Ly); TILES.forEach((t) => r(t.wx, t.wy, TW, TH)); }
const maskTex = new THREE.CanvasTexture(maskCanvas); maskTex.minFilter = maskTex.magFilter = THREE.NearestFilter;
const R2 = makeRoom({ position: new THREE.Vector3(-6.7, 0, 1.8), rt: [2048, 1024],
  rect: [-3.15, 0.3, 5.6, 3.0], sun: SUN2, sunE: 1.6, skyE: 0.4, haze: 0.085,
  beamMin: new THREE.Vector3(-3.2, 0.2, 0), beamMax: new THREE.Vector3(3.2, 6.4, D2 + 0.01), img: [-0.35, 2.0], slotZ: D2, useRot: false,
  slots: 1, grid: [coarse ? 256 : 512, coarse ? 128 : 256], cell: heroMeta.Lx / (coarse ? 256 : 512),
  tiles: TILES.length, tileW: TW, mask: maskTex, maskRect: MASK_RECT });
R2.panes[0].uSlope.value = heroSlopes;
const concrete2 = new THREE.Color(0.7, 0.68, 0.65);
R2.surface(new THREE.PlaneGeometry(6.4, 6.5), (m) => m.position.set(0, 3.25, 0), { receive: true, albedo: concrete2 });
R2.surface(new THREE.PlaneGeometry(6.4, 6.5), (m) => { m.rotation.y = Math.PI; m.position.set(0, 3.25, D2); }, { albedo: concrete2, cutout: true });
R2.surface(new THREE.PlaneGeometry(6.4, D2), (m) => { m.rotation.x = -Math.PI / 2; m.position.set(0, 0, D2 / 2); }, { floor: true, albedo: new THREE.Color(0.46, 0.44, 0.41) });
R2.surface(new THREE.PlaneGeometry(6.4, D2), (m) => { m.rotation.x = Math.PI / 2; m.position.set(0, 6.5, D2 / 2); }, { albedo: concrete2 });
R2.surface(new THREE.PlaneGeometry(D2, 6.5), (m) => { m.rotation.y = Math.PI / 2; m.position.set(-3.2, 3.25, D2 / 2); }, { albedo: concrete2 });
const sky2 = new THREE.Mesh(new THREE.PlaneGeometry(9, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.2, 1.7) }));
sky2.rotation.y = Math.PI; sky2.position.set(0, 3.5, D2 + 0.9); R2.group.add(sky2);
const winGlass = glassMat(0.02);
const heroGlass = new THREE.Mesh(new THREE.BoxGeometry(heroMeta.Lx, heroMeta.Ly, 0.02), winGlass);
heroGlass.position.set(HERO.wx, HERO.wy, D2 + 0.01); R2.group.add(heroGlass);
TILES.forEach((t) => { const m = new THREE.Mesh(new THREE.BoxGeometry(TW, TH, 0.02), winGlass); m.position.set(t.wx, t.wy, D2 + 0.01); R2.group.add(m); });
scene.add(R2.group);
const REDACT = tools.findIndex((t) => t.slug === 'redact-pdf');

// ---------- camera path: room 1 → through the doorway → room 2 ----------
const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 80);
const KEYS = [
  { p: [-0.55, 1.2, 4.6], l: [0.15, 1.5, 0.6], f: 34 },
  { p: [-1.25, 1.36, 4.15], l: [-3.4, 1.42, 3.3], f: 40 },
  { p: [-3.3, 1.5, 3.3], l: [-6.2, 1.62, 3.25], f: 44 },
  { p: [-4.3, 1.55, 3.45], l: [-9.5, 2.4, 3.2], f: 50 },
  { p: [-7.05, 1.42, 4.9], l: [-7.05, 1.3, 1.8], f: 60 },
].map((k) => ({ p: new THREE.Vector3(...k.p), l: new THREE.Vector3(...k.l), f: k.f }));
const curP = new THREE.CatmullRomCurve3(KEYS.map((k) => k.p), false, 'centripetal');
const curL = new THREE.CatmullRomCurve3(KEYS.map((k) => k.l), false, 'centripetal');
const look = new THREE.Vector3();
function placeCamera(u, t) {
  u = Math.min(1, Math.max(0, u));
  curP.getPointAt(u, camera.position); curL.getPointAt(u, look);
  const seg = u * (KEYS.length - 1), i = Math.min(KEYS.length - 2, Math.floor(seg)), f = seg - i;
  camera.fov = KEYS[i].f + (KEYS[i + 1].f - KEYS[i].f) * f;
  camera.position.x += Math.sin(t * 0.09) * 0.02; camera.position.y += Math.sin(t * 0.13) * 0.012;
  camera.lookAt(look); camera.updateProjectionMatrix();
}
function resize() {
  const w = FILM ? +(qs.get('w') || 1920) : innerWidth, h = FILM ? +(qs.get('h') || 1080) : innerHeight;
  renderer.setSize(w, h, !FILM); if (FILM) { canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; }
  camera.aspect = w / h;
}
addEventListener('resize', resize); resize();

// ---------- state → scene ----------
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const smooth = (a, b, t) => ease(clamp01((t - a) / (b - a)));
const S = { time: 0, amp: 0, liquid: 0, yaw: 0, pitch: 0, walk: 0, sun1: 1.35, heroGain: 0, reveal: 0, hover: -1, caption: [0, 0, 0] };
const tmpE = new THREE.Euler(), tmpM = new THREE.Matrix4();
const euler = new THREE.Euler(), inv = new THREE.Matrix4(), id3 = new THREE.Matrix3();
const caps = [...document.querySelectorAll('.caption')];
const counter = document.getElementById('counter');

function apply() {
  // room 1: hold the pane
  euler.set(THREE.MathUtils.degToRad(S.pitch), THREE.MathUtils.degToRad(S.yaw), 0, 'YXZ');
  pane1.quaternion.setFromEuler(euler); pane1.updateMatrix();
  const rot = new THREE.Matrix3().setFromMatrix4(pane1.matrix);
  const gc = new THREE.Vector3(0, 0, -0.0225).applyMatrix3(rot).add(pane1.position);
  R1.panes[0].uRot.value.copy(rot); R1.panes[0].uGC.value.copy(gc); R1.panes[0].uAmp.value = S.amp;
  R1.U.uRot.value.copy(rot); R1.U.uGC.value.copy(gc);
  R1.U.uLiquid.value = reduceMotion ? 0 : S.liquid; R1.U.uTime.value = S.time; R1.U.uSunE.value = S.sun1;
  // room 2: the product and its 54 windows; light arrives in a sweep, the hovered word comes forward
  R2.panes[0].uGC.value.set(HERO.wx, HERO.wy, D2); R2.panes[0].uGain.value = S.heroGain * (S.hover < 0 ? 1 : 0.6);
  TILES.forEach((w, i) => {
    const T = R2.tiles[i];
    T.uSlope.value = tileSlopes[i]; T.uGC.value.set(w.wx, w.wy, D2);
    const a = THREE.MathUtils.degToRad(0.35) * Math.sin(S.time * 0.55 + i * 1.7);
    tmpE.set(a * 0.7, a, 0); T.uRot.value.setFromMatrix4(tmpM.makeRotationFromEuler(tmpE));
    T.uGain.value = clamp01((S.reveal - w.delay) / 0.25) * (S.hover < 0 ? 1 : (S.hover === i ? 2.0 : 0.42));
  });
  R2.U.uTime.value = S.time;
  // cameras in each room's frame
  placeCamera(S.walk, S.time);
  for (const R of [R1, R2]) { R.group.updateMatrixWorld(); inv.copy(R.group.matrixWorld).invert(); R.U.uCamLocal.value.copy(camera.position).applyMatrix4(inv); }
  // captions
  caps.forEach((el, i) => { const o = S.caption[i]; el.style.opacity = o.toFixed(3); el.style.transform = `translateY(${((1 - o) * 8).toFixed(1)}px)`; el.classList.toggle('on', o > 0.5); });
  if (counter) {
    const h = S.hover >= 0 ? tools[S.hover] : null;
    const html = h ? `<b>${h.name}</b> · ${h.category}<br>${h.desc}` : 'Every PDF tool in the browser. The file never leaves the tab.<br><span style="opacity:.65">Hover a tool to read it · click to open it</span>';
    if (counter.dataset.k !== String(S.hover)) { counter.innerHTML = html; counter.dataset.k = String(S.hover); }
  }
}
function render() {
  for (const R of [R1, R2]) {
    renderer.setRenderTarget(R.rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(R.cscene, camera);
  }
  renderer.setRenderTarget(null); renderer.setClearColor(0x111110, 1); renderer.render(scene, camera);
}

// ---------- film timeline (16 s) ----------
const FILM_LEN = 15.5;
function filmAt(t) {
  S.time = t;
  S.amp = smooth(0.3, 2.6, t);
  S.liquid = 0.02 * Math.exp(-Math.max(0, t - 0.2) / 1.0);
  S.caption[0] = smooth(2.4, 3.2, t) * (1 - smooth(4.6, 5.3, t));
  // the light leaves: the name dissolves into dancing light and room 1's sun fades; the doorway glows
  S.liquid = Math.max(S.liquid, 0.014 * smooth(4.3, 5.1, t));
  S.sun1 = 1.35 * (1 - 0.82 * smooth(4.8, 6.6, t));
  S.walk = smooth(5.2, 10.2, t);
  // the gallery: the sun reaches the windows in a sweep while we stand in the corridor, then we turn to the wall
  S.heroGain = smooth(7.4, 8.0, t);
  S.reveal = clamp01((t - 7.9) / 1.1) * 1.05;
  S.caption[1] = smooth(10.0, 10.8, t);
  S.hover = (t > 12.0 && t < 14.6) ? REDACT : -1;
  const cur = document.getElementById('cursor');
  if (cur) {
    const show = t > 11.4 && t < 15.0;
    cur.style.display = show ? 'block' : 'none';
    if (show) {
      const w = TILES[REDACT], v = new THREE.Vector3(w.x + 0.05, w.y - 0.03, 0).applyMatrix4(R2.group.matrixWorld).project(camera);
      const k = smooth(11.4, 12.0, t), sx = (v.x * 0.5 + 0.5) * innerWidth, sy = (-v.y * 0.5 + 0.5) * innerHeight;
      cur.style.left = (sx + (1 - k) * 160) + 'px'; cur.style.top = (sy + (1 - k) * 90) + 'px'; cur.style.opacity = String(smooth(11.4, 11.7, t) * (1 - smooth(14.7, 15.0, t)));
    }
  }
}
if (FILM) {
  document.documentElement.style.overflow = 'hidden';
  window.__render = (t) => { filmAt(t); apply(); render(); return true; };
  window.__filmLength = FILM_LEN; window.__ready = true;
  window.__render(+(qs.get('t') || 0));
} else {
  // live: scroll walks the house; pointer holds the pane in room 1
  const tgt = { yaw: 0, pitch: 0 };
  let energy = 0, lx = null, ly = null, lt = 0;
  addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (lx !== null) { const sp = Math.hypot(e.clientX - lx, e.clientY - ly) / Math.max(1, now - lt); if (sp > 0.9) energy = Math.min(0.016, energy + (sp - 0.9) * 0.0007); }
    lx = e.clientX; ly = e.clientY; lt = now;
    if (e.pointerType === 'mouse') { tgt.yaw = (e.clientX / innerWidth - 0.5) * 16; tgt.pitch = -(e.clientY / innerHeight - 0.5) * 10; }
  });
  addEventListener('pointerdown', () => { energy = Math.min(0.016, energy + 0.009); });
  // hover a word to read it, click it to open the tool
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), invR2 = new THREE.Matrix4();
  let qNow = 0;
  const pick = (cx, cy) => {
    ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
    invR2.copy(R2.group.matrixWorld).invert();
    const o = ray.ray.origin.clone().applyMatrix4(invR2), d = ray.ray.direction.clone().transformDirection(invR2);
    if (d.z >= -1e-4) return -1;
    const k = -o.z / d.z, X = o.x + d.x * k, Y = o.y + d.y * k;
    return TILES.findIndex((w) => Math.abs(X - w.x) < TW * MAG / 2 && Math.abs(Y - w.y) < TH * MAG / 2);
  };
  addEventListener('pointermove', (e) => { if (qNow > 1.9) { S.hover = pick(e.clientX, e.clientY); canvas.style.cursor = S.hover >= 0 ? 'pointer' : ''; } });
  addEventListener('click', (e) => { if (qNow > 1.9 && e.target === canvas) { const i = pick(e.clientX, e.clientY); if (i >= 0) window.open(tools[i].url, '_blank', 'noopener'); } });
  const t0 = performance.now(); let last = t0, q = 0;
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = (now - t0) / 1000;
    S.time = t;
    const max = document.documentElement.scrollHeight - innerHeight;
    const goal = max > 0 ? (scrollY / max) * 3 : 0;          // 0..1 room 1, 1..2 the walk, 2..3 the pages
    q += (goal - q) * Math.min(1, dt * 4);
    S.amp = reduceMotion ? 1 : smooth(0.3, 2.6, t);
    energy *= Math.exp(-dt);
    S.liquid = Math.max(0.02 * Math.exp(-Math.max(0, t - 0.2) / 1.0), energy);
    const leave = clamp01((q - 0.55) / 0.45);
    S.liquid = Math.max(S.liquid, 0.014 * leave);
    S.sun1 = 1.35 * (1 - 0.82 * leave);
    S.yaw += (tgt.yaw * (1 - leave) - S.yaw) * Math.min(1, dt * 5);
    S.pitch += (tgt.pitch * (1 - leave) - S.pitch) * Math.min(1, dt * 5);
    S.walk = ease(clamp01(q - 1));
    S.heroGain = clamp01((q - 1.45) * 3);
    S.reveal = clamp01((q - 1.55) * 2.2) * 1.05;
    S.caption[0] = smooth(2.4, 3.2, t) * (1 - clamp01(q / 0.5));
    S.caption[1] = clamp01((q - 1.85) / 0.3);
    qNow = q;
    apply(); render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  window.__ready = true;
}
