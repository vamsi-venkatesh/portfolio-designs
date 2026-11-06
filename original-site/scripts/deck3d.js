/* ═══════════════════════════════════════════════════════════════════════
   THE CONTROL ROOM — the hall itself (three.js)
   Not a hero backdrop: the whole page happens inside a server corridor.
   Scroll walks the camera down the hall between two rack walls; light
   streams travel the spine; each station's zone glows awake as you reach
   it. The DOM is the glass you read through.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from "three";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("deck");
if (canvas && !REDUCED) { try { init(); document.body.classList.add("deck-on"); } catch (e) { console.warn("[deck]", e); canvas.remove(); } }
else if (canvas) canvas.remove();

function init() {
  const MOBILE = Math.min(innerWidth, innerHeight) < 761;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, MOBILE ? 1.75 : 1.5));
  renderer.setClearColor(0x0a0b0b, 1);

  /* ── POST — a real bloom pipeline in core three.js.
     scene → bright-pass → separable gaussian blur (quarter res) →
     composite with vignette. This is the difference between "glowing"
     and "opacity turned up". ─────────────────────────────────────────── */
  const post = (() => {
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(quadGeo);
    const quadScene = new THREE.Scene();
    quadScene.add(quad);
    const VS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
    const brightMat = new THREE.ShaderMaterial({
      uniforms: { tSrc: { value: null }, uThresh: { value: 0.2 } },
      vertexShader: VS,
      fragmentShader: `varying vec2 vUv; uniform sampler2D tSrc; uniform float uThresh;
        void main(){
          vec3 c = texture2D(tSrc, vUv).rgb;
          float l = dot(c, vec3(0.299, 0.587, 0.114));
          gl_FragColor = vec4(c * smoothstep(uThresh, uThresh + 0.38, l), 1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    const blurMat = new THREE.ShaderMaterial({
      uniforms: { tSrc: { value: null }, uDir: { value: new THREE.Vector2(1, 0) }, uTexel: { value: new THREE.Vector2() } },
      vertexShader: VS,
      fragmentShader: `varying vec2 vUv; uniform sampler2D tSrc; uniform vec2 uDir; uniform vec2 uTexel;
        void main(){
          vec2 o = uDir * uTexel;
          vec3 a = texture2D(tSrc, vUv).rgb * 0.227027;
          a += (texture2D(tSrc, vUv + o * 1.3846).rgb + texture2D(tSrc, vUv - o * 1.3846).rgb) * 0.3162162;
          a += (texture2D(tSrc, vUv + o * 3.2308).rgb + texture2D(tSrc, vUv - o * 3.2308).rgb) * 0.0702703;
          gl_FragColor = vec4(a, 1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    const compMat = new THREE.ShaderMaterial({
      uniforms: { tScene: { value: null }, tBloom: { value: null }, uBloom: { value: 1.45 } },
      vertexShader: VS,
      fragmentShader: `varying vec2 vUv; uniform sampler2D tScene; uniform sampler2D tBloom; uniform float uBloom;
        void main(){
          vec3 c = texture2D(tScene, vUv).rgb + texture2D(tBloom, vUv).rgb * uBloom;
          // gentle filmic lift + vignette
          c = c / (1.0 + c * 0.18);
          float d = distance(vUv, vec2(0.5, 0.46));
          c *= 1.0 - smoothstep(0.55, 0.95, d) * 0.42;
          gl_FragColor = vec4(c, 1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    let rtScene, rtA, rtB;
    const mk = (w2, h2) => new THREE.WebGLRenderTarget(w2, h2, { depthBuffer: false });
    const api = {
      resize(w2, h2) {
        const pr = renderer.getPixelRatio();
        const W = Math.max(2, Math.round(w2 * pr)), H = Math.max(2, Math.round(h2 * pr));
        if (rtScene) { rtScene.dispose(); rtA.dispose(); rtB.dispose(); }
        rtScene = new THREE.WebGLRenderTarget(W, H);
        const BW = Math.max(2, W >> 2), BH = Math.max(2, H >> 2);
        rtA = mk(BW, BH); rtB = mk(BW, BH);
        blurMat.uniforms.uTexel.value.set(1 / BW, 1 / BH);
      },
      render(sc, cam) {
        renderer.setRenderTarget(rtScene);
        renderer.render(sc, cam);
        quad.material = brightMat;
        brightMat.uniforms.tSrc.value = rtScene.texture;
        renderer.setRenderTarget(rtA);
        renderer.render(quadScene, quadCam);
        quad.material = blurMat;
        for (let i = 0; i < 2; i++) {
          blurMat.uniforms.tSrc.value = rtA.texture;
          blurMat.uniforms.uDir.value.set(1, 0);
          renderer.setRenderTarget(rtB);
          renderer.render(quadScene, quadCam);
          blurMat.uniforms.tSrc.value = rtB.texture;
          blurMat.uniforms.uDir.value.set(0, 1);
          renderer.setRenderTarget(rtA);
          renderer.render(quadScene, quadCam);
        }
        quad.material = compMat;
        compMat.uniforms.tScene.value = rtScene.texture;
        compMat.uniforms.tBloom.value = rtA.texture;
        renderer.setRenderTarget(null);
        renderer.render(quadScene, quadCam);
      },
    };
    return api;
  })();

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0b0b, MOBILE ? 0.013 : 0.016);
  const camera = new THREE.PerspectiveCamera(MOBILE ? 58 : 54, 1, 0.1, 260);

  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  /* the corridor: two rack walls of glowing tiles, receding down -Z */
  const LEN = 430;                       // corridor length in world units
  const SIDE_X = MOBILE ? 6.5 : 15;
  const COLS = MOBILE ? 34 : 60;         // tiles along the corridor per wall
  const ROWS = MOBILE ? 5 : 7;
  const N = COLS * ROWS * 2;
  const tile = new THREE.PlaneGeometry(3.6, 1.5);
  const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  const wall = new THREE.InstancedMesh(tile, mat, N);
  const dummy = new THREE.Object3D();
  const colr = new THREE.Color();
  const phase = new Float32Array(N), kind = new Float32Array(N), tz = new Float32Array(N);
  let idx = 0;
  for (let side = -1; side <= 1; side += 2) {
    for (let cI = 0; cI < COLS; cI++) {
      for (let r = 0; r < ROWS; r++, idx++) {
        const z = 30 - (cI / (COLS - 1)) * (LEN + 60);
        const y = (r - ROWS / 2) * 1.9 + 2.4;
        dummy.position.set(side * SIDE_X, y, z);
        dummy.rotation.set(0, -side * Math.PI / 2, 0);
        dummy.updateMatrix();
        wall.setMatrixAt(idx, dummy.matrix);
        phase[idx] = hash(idx) * 10;
        kind[idx] = hash(idx + 999);
        tz[idx] = z;
        wall.setColorAt(idx, colr.setHex(0xece7da).multiplyScalar(0.05));
      }
    }
  }
  wall.instanceColor.needsUpdate = true;
  wall.frustumCulled = false;
  scene.add(wall);

  /* overhead conduit — a spine of light running the whole corridor */
  let spineLine;
  {
    const pts = [];
    for (let i = 0; i <= 80; i++) pts.push(new THREE.Vector3(0, 7.4, 34 - (i / 80) * (LEN + 70)));
    spineLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0xa9c4ad, transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    scene.add(spineLine);
  }

  /* packets travelling the spine both directions */
  const PN = MOBILE ? 90 : 160;
  const ppos = new Float32Array(PN * 3), pseed = new Float32Array(PN);
  for (let i = 0; i < PN; i++) {
    ppos[i * 3] = (hash(i) - 0.5) * 1.2;
    ppos[i * 3 + 1] = 7.4 + (hash(i + 1) - 0.5) * 0.8;
    ppos[i * 3 + 2] = 34 - hash(i + 2) * (LEN + 70);
    pseed[i] = 0.5 + hash(i + 3);
  }
  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute("position", new THREE.BufferAttribute(ppos, 3));
  const ptex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(179,204,183,1)"); gr.addColorStop(0.5, "rgba(179,204,183,0.25)"); gr.addColorStop(1, "rgba(179,204,183,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const packets = new THREE.Points(pgeo, new THREE.PointsMaterial({ map: ptex, size: 0.5, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
  packets.frustumCulled = false;
  scene.add(packets);

  // soft light sprites — fixtures and pools are made of these
  const softTex = (tint) => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, `rgba(${tint},0.95)`);
    gr.addColorStop(0.38, `rgba(${tint},0.22)`);
    gr.addColorStop(1, `rgba(${tint},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  };
  const warmTex = softTex("217,168,92"), coolTex = softTex("237,232,220");
  const mkGlow = (tex, size, opacity) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.scale.setScalar(size);
    return sp;
  };

  /* floor sheen down the whole hall */
  {
    const c = document.createElement("canvas"); c.width = 4; c.height = 128;
    const g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, "rgba(233,228,214,0.06)"); gr.addColorStop(1, "rgba(233,228,214,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 4, 128);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(70, LEN + 140), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -5.2, -LEN / 2);
    scene.add(floor);
  }

  /* dust in the hall */
  {
    const DN = MOBILE ? 300 : 520;
    const dpos = new Float32Array(DN * 3);
    for (let i = 0; i < DN; i++) {
      dpos[i * 3] = (hash(i + 50) - 0.5) * 26;
      dpos[i * 3 + 1] = -4 + hash(i + 51) * 12;
      dpos[i * 3 + 2] = 34 - hash(i + 52) * (LEN + 70);
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
    const dust = new THREE.Points(dg, new THREE.PointsMaterial({ map: ptex, size: 0.16, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
    dust.frustumCulled = false;
    scene.add(dust);
  }

  /* ── THE LANDING — two lights, each with a job.
     The name is the lamp: the operator's light is emitted BY the name and
     spreads outward from it, radially. Nothing falls from the ceiling.
     One distant glow far down the hall where the first door waits:
     that is where you're going. Everything else stays dark and calm. ── */
  let landing = null;
  {
    const grp = new THREE.Group();

    // the operator's light — a layered RADIAL halo sitting exactly on the
    // name. No cone, no beam, no fixture overhead: the source is the text
    // itself, so every layer is a camera-facing sprite centred on the name
    // and flattened vertically, reading as a glow around a line of type
    // rather than a ball of light hanging in the air.
    // A broader falloff than softTex: the plateau is what lets one sprite
    // light a whole block of copy without a hot nucleus.
    const haloTex = (tint) => {
      const c = document.createElement("canvas"); c.width = c.height = 256;
      const g = c.getContext("2d");
      const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, `rgba(${tint},0.92)`);
      gr.addColorStop(0.18, `rgba(${tint},0.62)`);
      gr.addColorStop(0.42, `rgba(${tint},0.26)`);
      gr.addColorStop(0.72, `rgba(${tint},0.07)`);
      gr.addColorStop(1, `rgba(${tint},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(c);
    };
    // the core needs an even flatter plateau than the reach layers: peaked in
    // the middle it reads as a sun behind the word instead of the word itself
    // glowing, and the bloom pass only makes that worse.
    const coreTex = (() => {
      const c = document.createElement("canvas"); c.width = c.height = 256;
      const g = c.getContext("2d");
      const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, "rgba(240,236,226,0.5)");
      gr.addColorStop(0.34, "rgba(240,236,226,0.4)");
      gr.addColorStop(0.66, "rgba(240,236,226,0.14)");
      gr.addColorStop(1, "rgba(240,236,226,0)");
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      // …and it must not lie ON the glyphs. The core is flattened onto the
      // name's LINE, so the middle band of this texture is exactly the band
      // the type occupies: carve it out. The light then reads as an aura
      // hugging the word from above and below, and the ivory glyph edges keep
      // their contrast against the dark instead of dissolving into a wash.
      const band = g.createLinearGradient(0, 62, 0, 194);
      band.addColorStop(0, "rgba(0,0,0,0)");
      band.addColorStop(0.28, "rgba(0,0,0,0.62)");
      band.addColorStop(0.5, "rgba(0,0,0,0.82)");
      band.addColorStop(0.72, "rgba(0,0,0,0.62)");
      band.addColorStop(1, "rgba(0,0,0,0)");
      g.globalCompositeOperation = "destination-out";
      g.fillStyle = band; g.fillRect(0, 0, 256, 256);
      g.globalCompositeOperation = "source-over";
      return new THREE.CanvasTexture(c);
    })();
    // the reach layer covers the WHOLE intro screen at rest, so its falloff is
    // a long flat shoulder rather than a peak: a room-fill, not a lamp. A
    // peaked gradient stretched to full-frame is a bright blob with black
    // corners; this one is only slightly warmer at the name.
    const wideTex = (() => {
      const c = document.createElement("canvas"); c.width = c.height = 256;
      const g = c.getContext("2d");
      const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, "rgba(237,232,220,0.72)");
      gr.addColorStop(0.30, "rgba(237,232,220,0.58)");
      gr.addColorStop(0.58, "rgba(237,232,220,0.42)");
      gr.addColorStop(0.80, "rgba(237,232,220,0.27)");
      gr.addColorStop(0.93, "rgba(237,232,220,0.11)");
      gr.addColorStop(1, "rgba(237,232,220,0)");
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(c);
    })();
    const warmHalo = haloTex("222,178,108");
    const mkHalo = (tex) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      sp.scale.set(1, 1, 1);
      return sp;
    };
    const haloWide = mkHalo(wideTex);     // the ambient reach over the WHOLE intro screen
    const haloRim = mkHalo(warmHalo);     // a faint warm rim just outside the core
    const haloCore = mkHalo(coreTex);     // the ivory heart, lying along the name
    grp.add(haloWide, haloRim, haloCore);

    // the way — a warm glow far down the hall, at the first door. On portrait
    // the far door sits near the vanishing point, which is where the hero copy
    // lives: a big sprite there is a stain on the words, so it stays small —
    // a lamp at the end of the hall, not a wash over the text.
    const wayGlow = mkGlow(warmTex, MOBILE ? 8 : 10.5, 0.8);
    // flattened: a pool lying on the floor, not a ball hanging in the air
    wayGlow.scale.y *= 0.45;
    wayGlow.material.fog = false;
    const wayPool = new THREE.Mesh(
      new THREE.CircleGeometry(MOBILE ? 2.6 : 4.2, 40),
      new THREE.MeshBasicMaterial({ color: 0xd9a85c, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    wayPool.rotation.x = -Math.PI / 2;
    grp.add(wayGlow, wayPool);

    // the air of the landing — slow luminous motes drifting down through the
    // whole frame, gathering where the name's halo reaches. One Points, all motion in
    // the shader: the air costs nothing per frame.
    const MN = MOBILE ? 340 : 900;
    const mpos = new Float32Array(MN * 3);
    const msize = new Float32Array(MN), mspeed = new Float32Array(MN);
    const mphase = new Float32Array(MN), mwarm = new Float32Array(MN);
    for (let i = 0; i < MN; i++) {
      // roughly half the motes are seeded near the light, the rest fill the room
      const inLight = i % 2 === 0;
      const a = hash(i + 11) * Math.PI * 2, rr = Math.sqrt(hash(i + 12));
      mpos[i * 3] = inLight ? Math.cos(a) * rr * 11 : (hash(i + 13) - 0.5) * 46;
      mpos[i * 3 + 1] = 0;                                   // y comes from the shader
      mpos[i * 3 + 2] = inLight ? 12 - hash(i + 14) * 22 : 26 - hash(i + 15) * 74;
      msize[i] = 0.22 + Math.pow(hash(i + 16), 2.4) * 1.05;  // many small, a few bright
      mspeed[i] = 0.16 + hash(i + 17) * 0.5;                 // calm fall, never a shower
      mphase[i] = hash(i + 18);
      mwarm[i] = hash(i + 19) < 0.08 ? 1 : 0;                // a few amber grains
    }
    const mg = new THREE.BufferGeometry();
    mg.setAttribute("position", new THREE.BufferAttribute(mpos, 3));
    mg.setAttribute("aSize", new THREE.BufferAttribute(msize, 1));
    mg.setAttribute("aSpeed", new THREE.BufferAttribute(mspeed, 1));
    mg.setAttribute("aPhase", new THREE.BufferAttribute(mphase, 1));
    mg.setAttribute("aWarm", new THREE.BufferAttribute(mwarm, 1));
    const moteMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uFade: { value: 0 },
        uPx: { value: renderer.getPixelRatio() },
        uCenter: { value: new THREE.Vector2(0, 12) }, uRadius: { value: 12 },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSize; attribute float aSpeed; attribute float aPhase; attribute float aWarm;
        uniform float uTime, uPx, uFade, uRadius; uniform vec2 uCenter;
        varying float vA; varying vec3 vC;
        void main() {
          float span = 30.0;
          float y = 13.0 - mod(uTime * aSpeed + aPhase * span, span);
          float x = position.x + sin(uTime * 0.06 + aPhase * 31.4) * 1.7;
          float z = position.z + sin(uTime * 0.045 + aPhase * 17.0) * 1.2;
          vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
          float depth = max(1.0, -mv.z);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uPx * (150.0 / depth);
          // a mote catches the light when the halo's radius reaches it
          float lit = 1.0 - smoothstep(0.55, 1.3, length(vec2(x, z) - uCenter) / uRadius);
          float edge = smoothstep(-6.0, 1.0, y) * (1.0 - smoothstep(9.0, 13.0, y));
          vA = uFade * edge * (0.2 + lit * 0.85) * (0.55 + aSize * 0.5)
             * (1.0 - smoothstep(30.0, 95.0, depth));
          vC = mix(vec3(0.925, 0.906, 0.855), vec3(0.851, 0.659, 0.361), aWarm);
        }`,
      fragmentShader: `
        varying float vA; varying vec3 vC;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.02, d);
          gl_FragColor = vec4(vC, a * a * vA);
        }`,
    });
    const motes = new THREE.Points(mg, moteMat);
    motes.frustumCulled = false;
    grp.add(motes);

    scene.add(grp);
    landing = { grp, haloWide, haloRim, haloCore, wayGlow, wayPool, motes, moteMat,
      nx: -6, ny: 2, zc: 12, ndcX: 0, ndcY: 0 };
    // measure the hero block and size the halo to it. Position is NOT set
    // here: the camera is pitched down and breathing, so a naive projection
    // would drop the glow below the text. fit() stores the name's SCREEN
    // position and place() converts it through the live camera each frame —
    // the light is emitted by the name, so it must sit on the name always.
    landing.fit = () => {
      const el = document.querySelector(".hero h1");
      if (!el) return;
      const block = document.querySelector(".hero .container") || el;
      const r = el.getBoundingClientRect(), rb = block.getBoundingClientRect();
      const dist = 18;
      const vh = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const vw = vh * camera.aspect;
      landing.ndcX = ((r.left + r.width * 0.42) / innerWidth) * 2 - 1;
      landing.ndcY = -(((r.top + r.height * 0.5) / innerHeight) * 2 - 1);
      landing.zc = 30 - dist;
      // the light must be at least as wide as the text, and generous with it
      const blockW = (rb.width / innerWidth) * vw;
      const R = Math.min(vw * 0.7, Math.max(blockW * 0.7, vw * 0.4));
      // a sprite of scale S carries its light out to radius S/2, so the
      // widths below are diameters. Vertical flattening keeps the halo a
      // glow around a LINE of text, never a sphere.
      const dR = R * 1.3, dC = R * 1.5;
      // THE REACH LAYER IS THE ROOM, NOT THE NAME. Its rest size is the whole
      // viewport as projected onto the halo plane: the name sits off-centre,
      // so we measure from the name out to the FAR corner in each axis and
      // over-size by FS so the gradient's shoulder — not its dying tail —
      // lands in the corners. Nothing here is measured from the hero block.
      const cx = landing.ndcX * vw * 0.5, cy = landing.ndcY * vh * 0.5;
      const halfW = vw * 0.5 + Math.abs(cx), halfH = vh * 0.5 + Math.abs(cy);
      // the gradient is radial in TEXTURE space, so a flattened sprite leaves
      // the corners outside the disc no matter how wide it is: the reach layer
      // must be a CIRCLE of the corner distance, over-sized by FS so the
      // corner lands on the shoulder (r≈0.8) rather than on the vanishing tail.
      const FS = 1.25;
      const wD = Math.hypot(halfW, halfH) * 2 * FS;
      const wW = wD, wH = wD;
      landing.haloWide.scale.set(wW, wH, 1);
      landing.haloRim.scale.set(dR, dR * 0.5, 1);
      landing.haloCore.scale.set(dC, dC * 0.3, 1);
      // the air is lit to the frame's edge too — every mote in view catches
      // some light at rest, the ones by the name catch more
      const moteR = Math.max(R, Math.hypot(halfW, halfH) * 1.15);
      landing.moteMat.uniforms.uRadius.value = moteR;
      // the fitted sizes, kept so the arrival can play the light out of the
      // name without ever re-measuring the DOM mid-flight
      landing.wideW = wW; landing.wideH = wH;
      landing.rimW = dR; landing.rimH = dR * 0.5;
      landing.coreW = dC; landing.coreH = dC * 0.3;
      landing.moteR = moteR;
      landing.place();
    };
    // put every layer of the halo exactly where the name is on screen
    const _ray = new THREE.Vector3();
    landing.place = () => {
      camera.updateMatrixWorld();
      _ray.set(landing.ndcX, landing.ndcY, 0.5).unproject(camera).sub(camera.position);
      const dz = landing.zc - camera.position.z;
      if (Math.abs(_ray.z) < 1e-5) return;
      const k = dz / _ray.z;
      landing.nx = camera.position.x + _ray.x * k;
      landing.ny = camera.position.y + _ray.y * k;
      landing.haloWide.position.set(landing.nx, landing.ny, landing.zc);
      landing.haloRim.position.set(landing.nx, landing.ny, landing.zc);
      landing.haloCore.position.set(landing.nx, landing.ny, landing.zc);
      // the air is lit from the NAME outward — same centre as the halo
      landing.moteMat.uniforms.uCenter.value.set(landing.nx, landing.zc);
    };
    landing.fit();
    // the first fit happens before the webfonts settle, and the hero moves
    // when they land — remeasure once they are in, or the halo spends the
    // whole arrival sitting a line below the name it is supposed to be
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => landing.fit()).catch(() => {});
  }

  /* ── END WALL — the hall closes the way it opened: the living panel
     wall waits at the far end, facing you as you arrive at the channel. ── */
  let endWall, ewMat;
  {
    const HCOLS = MOBILE ? 16 : 26, HROWS = MOBILE ? 7 : 9;
    const n = HCOLS * HROWS;
    const tileE = new THREE.PlaneGeometry(2.35, 1.28);
    ewMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    endWall = new THREE.InstancedMesh(tileE, ewMat, n);
    const dmy = new THREE.Object3D();
    const WR = 46, EZ = 30 - LEN - 26;
    let hi = 0;
    for (let r = 0; r < HROWS; r++) {
      for (let cI = 0; cI < HCOLS; cI++, hi++) {
        const a = ((cI / (HCOLS - 1)) - 0.5) * (MOBILE ? 1.15 : 1.5);
        dmy.position.set(Math.sin(a) * WR, (r - HROWS / 2) * 1.65 + 2.2, EZ - (WR - Math.cos(a) * WR) * -1);
        dmy.position.z = EZ + (WR - Math.cos(a) * WR);
        dmy.lookAt(0, dmy.position.y, EZ + WR + 2);
        dmy.updateMatrix();
        endWall.setMatrixAt(hi, dmy.matrix);
        endWall.setColorAt(hi, new THREE.Color(0xece7da).multiplyScalar(0.08));
      }
    }
    endWall.frustumCulled = false;
    endWall.visible = false;
    scene.add(endWall);
    endWall.userData = { n };
  }

  /* ── BULKHEADS — doors between bays. Each section boundary is a real
     doorway: an opaque bulkhead with a glowing aperture whose leaves
     slide open as you approach, from either direction. ──────────────── */
  // aperture half-width. Portrait is a narrow lens, so this is derived, not
  // guessed: the frame's half-width at distance d is d·tan(fov/2)·aspect.
  // At 390×844 that is d·tan(29°)·0.462 = d·0.2561. The door reads its most
  // dramatic at the moment it starts to part — roughly 12 world units out —
  // where a half-frame is 3.07. Filling ~78% of the frame width there gives
  // APW ≈ 0.78 · 3.07 ≈ 2.4, i.e. a real doorway inside the corridor walls
  // rather than an opening wider than the lens can hold.
  const APW = MOBILE ? 2.4 : 5.4;
  // and its head: a doorway, ~1 : 2 of its width once the floor is at -5.2
  const APH_TOP = MOBILE ? 4.4 : 6.2, FLOOR_Y = -5.2, CEIL_Y = 9.4;
  const WALL_HALF = SIDE_X + 6;
  const bulkheads = [];
  const bhWallMat = new THREE.MeshBasicMaterial({ color: 0x0d0e0d, transparent: true, opacity: 0.96 });
  const bhLeafMat = new THREE.MeshBasicMaterial({ color: 0x101110, transparent: true, opacity: 0.97 });
  function mkStrip(w, h, hex, op) {
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
  }
  // door faces: the station's name and emblem, engraved in its own hue.
  // One canvas per door; each leaf shows its half, so the emblem parts
  // down the seam as the door opens.
  function doorFace(meta) {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 1024;
    const g = c.getContext("2d");
    g.fillStyle = "#101110"; g.fillRect(0, 0, 1024, 1024);
    // brushed panel lines
    g.strokeStyle = "rgba(233,228,214,0.05)";
    for (let y = 0; y < 1024; y += 34) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
    const hue = meta.hue;
    g.strokeStyle = hue; g.fillStyle = hue;
    g.shadowColor = hue; g.shadowBlur = 16; g.lineWidth = 5;
    const cx = 512, cy = 400;
    if (meta.motif === "orbit") {
      g.beginPath(); g.arc(cx, cy, 18, 0, 7); g.fill();
      g.beginPath(); g.arc(cx, cy, 120, 0, 7); g.stroke();
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
        g.beginPath(); g.arc(cx + Math.cos(a) * 120, cy + Math.sin(a) * 120, 11, 0, 7); g.fill();
      }
    } else if (meta.motif === "gate") {
      g.beginPath(); g.moveTo(cx, cy - 110); g.lineTo(cx + 110, cy); g.lineTo(cx, cy + 110); g.lineTo(cx - 110, cy); g.closePath(); g.stroke();
      g.beginPath(); g.moveTo(cx - 240, cy); g.lineTo(cx - 110, cy); g.stroke();
      g.beginPath(); g.moveTo(cx + 110, cy); g.lineTo(cx + 240, cy); g.stroke();
      g.beginPath(); g.arc(cx, cy, 14, 0, 7); g.fill();
    } else if (meta.motif === "gauge") {
      g.beginPath(); g.arc(cx, cy + 40, 130, Math.PI, 2 * Math.PI); g.stroke();
      g.lineWidth = 9;
      g.beginPath(); g.arc(cx, cy + 40, 130, Math.PI, Math.PI + Math.PI * 0.79); g.stroke();
      g.lineWidth = 5;
      g.beginPath(); g.arc(cx, cy + 40, 10, 0, 7); g.fill();
    } else if (meta.motif === "bars") {
      for (let i = 0; i < 7; i++) {
        const bh = 40 + Math.abs(Math.sin(i * 2.1)) * 130;
        g.fillRect(cx - 150 + i * 44, cy + 100 - bh, 26, bh);
      }
    } else if (meta.motif === "funnel") {
      for (let i = 0; i < 16; i++) {
        const pT = i / 15;
        g.beginPath(); g.arc(cx - 180 + pT * 260, cy - 90 + Math.sin(i * 37.7) * (1 - pT) * 90 + pT * 90, 7 + pT * 5, 0, 7); g.fill();
      }
      g.strokeRect(cx + 110, cy + 60, 110, 70);
    } else { // racks
      for (let i = 0; i < 3; i++) {
        g.strokeRect(cx - 160, cy - 90 + i * 74, 320, 50);
        g.beginPath(); g.arc(cx + 130, cy - 65 + i * 74, 8, 0, 7); g.fill();
      }
    }
    // name
    g.shadowBlur = 18;
    g.textAlign = "center";
    g.font = "500 44px 'IBM Plex Mono', monospace";
    g.fillStyle = "rgba(237,234,226,0.85)";
    g.fillText(meta.num, cx, 640);
    g.font = "600 74px 'IBM Plex Mono', monospace";
    g.fillStyle = hue;
    g.fillText(meta.label, cx, 736);
    g.shadowBlur = 0;
    g.font = "26px 'IBM Plex Mono', monospace";
    g.fillStyle = "rgba(132,127,115,0.9)";
    g.fillText("— SCROLL TO OPEN —", cx, 812);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function mkBulkhead(z, meta) {
    const gp = new THREE.Group();
    gp.position.z = z;
    // side fills (corridor wall → aperture edge)
    const sideW = WALL_HALF - APW;
    for (const sd of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(sideW, CEIL_Y - FLOOR_Y), bhWallMat);
      m.position.set(sd * (APW + sideW / 2), (CEIL_Y + FLOOR_Y) / 2, 0);
      gp.add(m);
    }
    // lintel above the aperture
    const lin = new THREE.Mesh(new THREE.PlaneGeometry(APW * 2, CEIL_Y - APH_TOP), bhWallMat);
    lin.position.set(0, (CEIL_Y + APH_TOP) / 2, 0);
    gp.add(lin);
    // aperture frame light
    const hueHex = meta ? meta.hex : 0x86e3a4;
    const frameL = mkStrip(MOBILE ? 0.14 : 0.09, APH_TOP - FLOOR_Y, hueHex, MOBILE ? 0.55 : 0.4);
    frameL.position.set(-APW, (APH_TOP + FLOOR_Y) / 2, 0.05);
    const frameR = frameL.clone(); frameR.position.x = APW;
    const frameT = mkStrip(APW * 2, 0.09, hueHex, 0.5);
    frameT.position.set(0, APH_TOP, 0.05);
    gp.add(frameL, frameR, frameT);
    // door leaves — each carries its half of the station's face
    const leafW = APW + 0.1;
    let matL = bhLeafMat, matR = bhLeafMat;
    if (meta) {
      const tex = doorFace(meta);
      const texL = tex.clone(); texL.repeat.set(0.5, 1); texL.offset.set(0, 0); texL.needsUpdate = true;
      const texR = tex.clone(); texR.repeat.set(0.5, 1); texR.offset.set(0.5, 0); texR.needsUpdate = true;
      matL = new THREE.MeshBasicMaterial({ map: texL, transparent: true, opacity: MOBILE ? 1 : 0.97 });
      matR = new THREE.MeshBasicMaterial({ map: texR, transparent: true, opacity: MOBILE ? 1 : 0.97 });
    }
    const leafL = new THREE.Mesh(new THREE.PlaneGeometry(leafW, APH_TOP - FLOOR_Y), matL);
    leafL.position.set(-leafW / 2, (APH_TOP + FLOOR_Y) / 2, -0.06);
    const leafR = new THREE.Mesh(new THREE.PlaneGeometry(leafW, APH_TOP - FLOOR_Y), matR);
    leafR.position.set(leafW / 2, (APH_TOP + FLOOR_Y) / 2, -0.06);
    const seamL = mkStrip(0.07, APH_TOP - FLOOR_Y, hueHex, 0.55);
    seamL.position.set(leafW / 2 - 0.05, 0, 0.02); leafL.add(seamL);
    const seamR = seamL.clone(); seamR.position.x = -leafW / 2 + 0.05; leafR.add(seamR);
    gp.add(leafL, leafR);
    // the spill: light floods through while the door is parting
    const spill = mkStrip(APW * 1.7, APH_TOP - FLOOR_Y, meta ? meta.hex : 0xece7da, 0);
    spill.position.set(0, (APH_TOP + FLOOR_Y) / 2, 0.12);
    gp.add(spill);
    scene.add(gp);
    const rec = { gp, z, leafL, leafR, spill, frames: [frameL, frameR, frameT], seams: [seamL, seamR], leafW, open: 0 };
    bulkheads.push(rec);
    return rec;
  }
  // boundaries from the real page sections, in corridor space
  function placeBulkheads() {
    for (const b of bulkheads) scene.remove(b.gp);
    bulkheads.length = 0;
    const secs = Array.from(document.querySelectorAll("main > section"));
    const doc = document.documentElement;
    const span = Math.max(1, doc.scrollHeight - innerHeight);
    // doors exist ONLY where a hallway meets its room — content lives
    // inside rooms, hallways are pure travel
    const METAS = {
      "conxto":         { num: "STATION 01", label: "CONXTO",         motif: "orbit",  hue: "#A9C4AD", hex: 0xa9c4ad },
      "agent-services": { num: "STATION 02", label: "AGENT SERVICES", motif: "gate",   hue: "#D9A85C", hex: 0xd9a85c },
      "evalhub":        { num: "STATION 03", label: "EVAL HUB",       motif: "gauge",  hue: "#EDE8DC", hex: 0xede8dc },
      "marketlab":      { num: "STATION 04", label: "MARKET",         motif: "bars",   hue: "#9DB8A2", hex: 0x9db8a2 },
      "seo-lab":        { num: "STATION 05", label: "SEO LAB",        motif: "funnel", hue: "#C2C4A0", hex: 0xc2c4a0 },
      "more":           { num: "AUXILIARY",  label: "RACKS 06-08",    motif: "racks",  hue: "#C9C4B6", hex: 0xc9c4b6 },
    };
    for (const room of document.querySelectorAll("main > section.station.gated")) {
      // growth spans 60% of the measured pin travel — the remaining 40%
      // holds the content still at full size so it can be read
      const tv = room.querySelector(".travel");
      const travel = tv ? tv.offsetHeight || innerHeight : innerHeight;
      const approach = Math.max(320, Math.round(travel * 0.62));
      // the door sits inside the approach: you pass through it while the
      // content is still growing, and arrive at reading size beyond it
      const sy = Math.max(0, room.offsetTop + approach * 0.62);
      const bh = mkBulkhead(30 - (sy / span) * LEN - 4, METAS[room.id] || null);
      bh.alwaysNear = bulkheads.length === 1;   // the first door shows from the landing
      bh.room = room;
      bh.secTop = room.offsetTop;
      bh.approach = approach;
      bh.sy = sy;   // scroll anchor — z is re-derived live each frame
    }
  }
  // room metrics must never be stale: the page height changes as fonts,
  // svh units and the canvas settle, so re-read whenever it does.
  function refreshRooms() {
    for (const b of bulkheads) {
      if (!b.room) continue;
      const tv = b.room.querySelector(".travel");
      const travel = tv ? tv.offsetHeight || innerHeight : innerHeight;
      b.secTop = b.room.offsetTop;
      b.approach = Math.max(320, Math.round(travel * 0.62));
      const stg = b.room.querySelector(".stage");
      b.stageTop = stg ? parseFloat(getComputedStyle(stg).top) || 0 : 0;
      b.sy = b.secTop + b.approach * 0.8;
    }
  }
  placeBulkheads();
  refreshRooms();
  let lastSpan = document.documentElement.scrollHeight;
  addEventListener("resize", () => setTimeout(() => { placeBulkheads(); refreshRooms(); }, 250), { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshRooms);

  /* sizing + parallax + scroll walk */
  const ptr = { x: 0, y: 0, cx: 0, cy: 0 };
  // Portrait walks dead-centre. Touch scrolling fires pointermove too, and on a
  // narrow lens that lateral push (±1.7 world units, with the aim point swung
  // ±2.5 further) shoves the centred door half out of frame. On mobile the
  // pointer never reaches the camera: ptr stays 0 and the rig aims straight
  // down the corridor. Desktop is untouched.
  if (!MOBILE) addEventListener("pointermove", (e) => {
    ptr.x = e.clientX / innerWidth - 0.5;
    ptr.y = e.clientY / innerHeight - 0.5;
  }, { passive: true });
  function size() {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    post.resize(innerWidth, innerHeight);
    if (landing) landing.fit();
  }
  size();
  addEventListener("resize", size, { passive: true });

  /* ── THE ARRIVAL — a four-beat wake-up played once, on the deck's own
     clock, the moment the boot overlay lifts.
       0 DARK      the hall is off; only the boot's afterglow
       1 IGNITION  the name itself ignites — a soft radial glow strikes on it
       2 SPREAD    the glow blooms radially OUT of the name, igniting the air
       3 ONLINE    corridor, way-light and instruments come up
     Every value below is a MULTIPLIER on the steady-state expression, and
     all of them are exactly 1 (or the fitted size) at arr.done — so the last
     frame of the arrival is bit-for-bit the frame the page has always had. ── */
  const bootEl = document.getElementById("boot");
  document.body.classList.add("arriving");
  const H1 = document.querySelector(".hero h1");
  const HROLE = document.querySelector(".hero .role");
  const HSUB = document.querySelector(".hero .hero-sub");
  const HKICK = document.querySelector(".hero .hero-kicker");
  const HCTA = document.querySelector(".hero .hero-ctas");
  const B0 = 0.35, B1 = 0.6, B2 = 1.2, B3 = 0.8;          // beat lengths, seconds
  const T1 = B0, T2 = T1 + B1, T3 = T2 + B2, T4 = T3 + B3;
  const sm = (u) => { const c = u < 0 ? 0 : u > 1 ? 1 : u; return c * c * (3 - 2 * c); };
  // a lamp striking is a written rhythm, not noise: a fixed piecewise
  // envelope, identical on every load, eased inside each segment so the
  // stutter snaps instead of ramping.
  const FU = [0, 0.15, 0.25, 0.4, 0.5, 0.62, 1];
  const FV = [0, 0.75, 0.15, 0.95, 0.3, 1, 1];
  function flick(u) {
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    let i = 1;
    while (i < FU.length - 1 && u > FU[i]) i++;
    const k = (u - FU[i - 1]) / (FU[i] - FU[i - 1]);
    return FV[i - 1] + (FV[i] - FV[i - 1]) * (k * k * (3 - 2 * k));
  }
  // how far above resting brightness the ignition flash goes. It is paid back
  // inside SPREAD, so every arrival factor is still exactly 1 at arr.done.
  const CORE_PEAK = 1.7;
  const arr = { t: -1, done: false, h1: 0, core: 0, name: 0, sp: 0, mote: 0, way: 0, corr: 0.12 };
  const reveal = (el) => { if (el && !el.classList.contains("in")) el.classList.add("in"); };
  function arrStep() {
    const t = arr.t;
    if (t < T1) return;                                   // ── 0 · DARK
    if (t < T2) {                                         // ── 1 · IGNITION
      const f = flick((t - T1) / B1);
      // the strike overshoots its resting brightness — but only for the flash.
      // CORE_PEAK is spent again during SPREAD, so the core lands on exactly 1.
      arr.core = f * (1 + (CORE_PEAK - 1) * f); arr.name = f;
      if (H1) {
        // the name is lit by the same lamp, on the same envelope — it is not
        // a caption fading in next to the light, it IS the light
        if (arr.h1 === 0) { arr.h1 = 1; H1.style.transform = "none"; }
        H1.style.opacity = f.toFixed(3);
      }
      return;
    }
    if (t < T3) {                                         // ── 2 · SPREAD
      const u = (t - T2) / B2;
      if (arr.h1 !== 2) {                                 // hand the name back to CSS
        arr.h1 = 2;
        if (H1) { H1.style.opacity = ""; H1.style.transform = ""; reveal(H1); }
      }
      // the energy LEAVES the name as the light travels: the core eases down
      // out of its flash while the reach opens. 1 + (peak-1)*1 at u=0 matches
      // the last ignition frame; it is exactly 1 by the end of the beat.
      arr.core = 1 + (CORE_PEAK - 1) * (1 - sm(Math.min(1, u / 0.55)));
      arr.name = 1;
      arr.sp = sm(u);
      arr.mote = arr.sp;
      if (u >= 0.3) reveal(HROLE);
      if (u >= 0.6) reveal(HSUB);
      return;
    }
    arr.core = 1; arr.name = 1; arr.sp = 1; arr.mote = 1; // ── 3 · ONLINE
    const e = sm((t - T3) / B3);
    arr.way = e;
    arr.corr = 0.12 + 0.88 * e;
    reveal(HKICK); reveal(HCTA);
    if (t >= T4) {
      arr.way = 1; arr.corr = 1; arr.done = true;
      if (landing) landing.fit();                         // exact fitted sizes back
      document.body.classList.remove("arriving");
    }
  }

  let running = true, smZ = 30, smP = 0;
  // breathing of the walk. Portrait keeps the lateral component near zero —
  // the hall must never appear to slide sideways past a centred door.
  const SWAY_X = MOBILE ? 0.05 : 0.3;
  const SWAY_Y = MOBILE ? 0.06 : 0.12;
  const SWAY_Z = MOBILE ? 0.9 : 1.7;
  const clock = new THREE.Clock();
  let tPrev = 0;
  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    const t = clock.getElapsedTime();
    const dt = Math.min(0.05, Math.max(0, t - tPrev));
    tPrev = t;

    // the arrival runs off the boot overlay, polled — never an event, so a
    // missed listener can never leave the page dark
    if (!arr.done) {
      if (arr.t < 0) { if (!bootEl || bootEl.classList.contains("done")) arr.t = 0; }
      else arr.t += dt;
      if (arr.t >= 0) arrStep();
    }

    // scroll → walking the corridor (raw progress, gentle world lerp)
    const doc = document.documentElement;
    const p = Math.min(1, scrollY / Math.max(1, doc.scrollHeight - innerHeight));
    smP += (p - smP) * 0.09;
    const targetZ = 30 - smP * LEN;
    smZ += (targetZ - smZ) * 0.12;

    ptr.cx += (ptr.x - ptr.cx) * 0.045;
    ptr.cy += (ptr.y - ptr.cy) * 0.045;
    const landDolly = Math.min(1, Math.max(0, (smZ - 16) / 12));
    camera.position.set(ptr.cx * 3.4 + Math.sin(t * 0.4) * SWAY_X,
      1.5 + landDolly * 0.6 - ptr.cy * 1.7 + Math.sin(t * 0.6) * SWAY_Y,
      smZ + Math.sin(t * 0.14) * SWAY_Z * landDolly);
    camera.lookAt(ptr.cx * 5, (1.6 - landDolly * 0.9) - ptr.cy * 2.4, smZ - 22);

    // tiles: ambient flicker + a wake-zone around the camera
    const camZ = camera.position.z;
    for (let i = 0; i < N; i++) {
      const dz = Math.abs(tz[i] - (camZ - 14));      // zone just ahead of you
      const near = Math.max(0, 1 - dz / 26);
      const base = (MOBILE ? 0.05 : 0.03) + hash(i + 5) * 0.028 + near * (MOBILE ? 0.14 : 0.1);
      // a slow wave of light travels the hall — no sparkle
      const fl = Math.max(0, Math.sin(t * 0.45 + tz[i] * 0.055 + phase[i] * 0.45));
      const burst = fl * ((MOBILE ? 0.22 : 0.16) + near * 0.26);
      wall.setColorAt(i, colr.setHex(kind[i] > 0.95 ? 0xd9a85c : 0xece7da).multiplyScalar(base + burst * 0.24));
    }
    wall.instanceColor.needsUpdate = true;

    // the landing is pure wall — the corridor (racks, doors, conduit)
    // only materializes once you walk in, and it recedes again as you
    // arrive at the end wall
    const END_Z = 30 - LEN;
    let cfIn = Math.min(1, Math.max(0, (26 - camZ) / 12));
    const cfOut = Math.min(1, Math.max(0, (camZ - (END_Z + 2)) / 14));
    let cf = cfIn * cfOut;
    cf = cf * cf * (3 - 2 * cf);
    cf *= arr.corr;      // the hall is the last thing to come online

    // end wall: waits in the dark, wakes as you arrive
    if (endWall) {
      const ef = Math.min(1, Math.max(0, ((END_Z + 22) - camZ) / 16));
      endWall.visible = ef > 0.01;
      if (endWall.visible) {
        ewMat.opacity = 0.85 * ef;
        for (let i = 0; i < endWall.userData.n; i++) {
          const base = 0.05 + hash(i + 205) * 0.05;
          const fl = Math.max(0, Math.sin(t * 0.32 + (i % 26) * 0.24 + hash(i + 477) * 5));
          const burst = fl * 0.34;
          endWall.setColorAt(i, colr.setHex(hash(i + 1999) > 0.94 ? 0xd9a85c : 0xece7da).multiplyScalar(base + burst * 0.26));
        }
        endWall.instanceColor.needsUpdate = true;
      }
    }
    mat.opacity = 0.85 * cf;
    wall.visible = cf > 0.01;
    if (spineLine) spineLine.material.opacity = 0.34 * cf;
    packets.material.opacity = 0.85 * cf;
    packets.visible = cf > 0.01;
    bhWallMat.opacity = 0.96 * cf;
    bhLeafMat.opacity = 0.97 * cf;


    // the landing: the operator's light breathes; the way-light waits
    if (landing) {
      const fadeL = Math.min(1, Math.max(0, (camZ - 15) / 13));
      landing.grp.visible = fadeL > 0.01;
      if (landing.grp.visible) {
        // the halo rides the NAME, not the room. During the arrival the hero
        // block is still settling under the `arriving` CSS — a one-shot fit
        // would leave the light a line below the text for the whole animation
        // — so we remeasure each frame until it lands, then only re-place
        // against the camera's breathing.
        if (arr.done) landing.place(); else landing.fit();
        const br = 0.8 + Math.sin(t * 0.4) * 0.12;
        // the arrival plays the light OUT OF the name: the core strikes on
        // the text first, then the bloom travels radially outward until each
        // layer stands at its fitted size. Every factor is 1 at arr.done, so
        // the last arrival frame equals the resting frame exactly.
        if (!arr.done) {
          const k = 0.72 + 0.28 * arr.sp;                 // core/rim barely grow
          const w = 0.16 + 0.84 * arr.sp;                 // the bloom travels out
          landing.haloCore.scale.set(landing.coreW * k, landing.coreH * k, 1);
          landing.haloRim.scale.set(landing.rimW * k, landing.rimH * k, 1);
          landing.haloWide.scale.set(landing.wideW * w, landing.wideH * w, 1);
          // the motes ignite as the expanding radius reaches them
          landing.moteMat.uniforms.uRadius.value = landing.moteR * (0.15 + 0.85 * arr.sp);
        }
        // three detuned breaths — a halo that lives, never a pulsing lamp.
        // Core and rim sit ON the name, so they are kept low: the type must
        // out-contrast its own glow in every frame. The reach layer covers the
        // whole frame now, so its alpha drops with the area it gained —
        // roughly the same quantity of light, spread over the room.
        landing.haloCore.material.opacity = 0.19 * br * fadeL * arr.core;
        landing.haloRim.material.opacity = 0.105 * (0.82 + Math.sin(t * 0.31 + 1.2) * 0.11) * fadeL * arr.name;
        landing.haloWide.material.opacity = 0.20 * (0.86 + Math.sin(t * 0.23 + 2.4) * 0.09) * fadeL * arr.sp;
        // the way-light stands at the first door, wherever the layout put it
        const b0 = bulkheads.length ? bulkheads[0] : null;
        if (b0) {
          const wz = b0.z + 3;
          const wb = 0.5 + Math.sin(t * 0.55 + 2) * 0.12;
          // it lies on the FLOOR at the far door — a lit pool down the hall,
          // never a stain hanging over the operator's name
          landing.wayGlow.position.set(0, MOBILE ? -4.3 : -4.2, wz);
          landing.wayGlow.material.opacity = (0.55 + wb * 0.35) * fadeL * (MOBILE ? 0.6 : 0.72) * arr.way;
          landing.wayPool.position.set(0, -5.15, wz + 1.5);
          landing.wayPool.material.opacity = (0.18 + wb * 0.12) * fadeL * arr.way;
        }
        // the air: motes keep falling in the shader, we only hand them the clock
        landing.moteMat.uniforms.uTime.value = t;
        landing.moteMat.uniforms.uFade.value = fadeL * arr.mote;
      }
    }




    // bulkhead doors: locked to their own room's approach, so the door and
    // the growing content are always in step (page height can change freely)
    const docH = document.documentElement.scrollHeight;
    if (docH !== lastSpan) { lastSpan = docH; refreshRooms(); }
    const spanNow = Math.max(1, docH - innerHeight);
    for (const b of bulkheads) {
      let q = 1, qRaw = 1;
      if (b.approach) {
        qRaw = (scrollY - b.secTop) / b.approach;
        q = Math.min(1.6, Math.max(0, qRaw));
        b.z = 30 - (b.sy / spanNow) * LEN - 4;
        b.gp.position.z = b.z;
      }
      b.gp.visible = cf > 0.02 && (!b.approach || (qRaw > -0.7 && qRaw < 1.1) || (b.alwaysNear && qRaw < 1.1));
      const d = Math.abs(camZ - b.z);
      // opens through the middle of the walk; you pass it at ~0.85
      const target = b.approach ? Math.min(1, Math.max(0, (q - 0.22) / 0.46)) : 0;
      b.open += (target - b.open) * 0.12;
      const e = b.open * b.open * (3 - 2 * b.open);
      b.leafL.position.x = -b.leafW / 2 - e * (b.leafW + 0.3);
      b.leafR.position.x = b.leafW / 2 + e * (b.leafW + 0.3);
      // dissolve the door as it reaches the lens — no giant fragments
      // gone once you are through it
      const passFade = b.approach ? Math.min(1, Math.max(0, (1.02 - q) / 0.16)) : Math.min(1, Math.max(0, (d - 1.2) / 6.5));
      // pinned approach: sticky holds the content vertically still in the
      // doorway; we drive only its growth from runway progress. No slide.
      if (b.room) {
        const el = b.roomEl || (b.roomEl = b.room.querySelector(".container"));
        if (el) {
          if (q >= 0.999) {
            if (!b.settled) { el.style.transform = "none"; el.style.opacity = "1"; el.style.clipPath = "none"; b.settled = true; }
          } else {
            b.settled = false;
            const e2 = q * q * (3 - 2 * q);
            const sc = 0.12 + 0.88 * e2;
            // sit the shrunken content INSIDE the doorway: its centre is held
            // at the aperture's centre and eases to its layout home as it grows
            const H = el.offsetHeight;                       // layout height, unscaled
            const home = (b.stageTop || 0) + H / 2;          // centre when settled
            const aperture = innerHeight * 0.52;             // the door's middle
            const dy = (1 - e2) * (aperture - home);
            el.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;
            // nothing exists until the door actually parts — and what you
            // see arrives through the widening gap between the leaves
            el.style.opacity = Math.max(0, Math.min(1, (b.open - 0.05) / 0.42)).toFixed(3);
            const gap = Math.min(1, b.open * 1.25);
            el.style.clipPath = gap >= 0.99 ? "none" : `inset(-20% ${(50 - gap * 50).toFixed(2)}% -20% ${(50 - gap * 50).toFixed(2)}%)`;
          }
        }
      }
      const fo = ((MOBILE ? 0.3 : 0.2) + e * 0.42) * cf * passFade;
      for (const f of b.frames) f.material.opacity = fo;
      const leafOp = (MOBILE ? 1 : 0.97) * cf * passFade;
      if (b.leafL.material !== bhLeafMat) { b.leafL.material.opacity = leafOp; b.leafR.material.opacity = leafOp; }
      for (const sm of b.seams) sm.material.opacity = 0.55 * cf * passFade;
      // brightest mid-opening, gone once you're through
      b.spill.material.opacity = Math.sin(Math.min(1, b.open) * Math.PI) * 0.22 * cf * passFade;
      b.spill.scale.x = 0.4 + e * 1.1;
    }

    // packets flow along the spine
    const pArr = pgeo.attributes.position.array;
    for (let i = 0; i < PN; i++) {
      pArr[i * 3 + 2] -= 0.12 * pseed[i] * (i % 2 ? 1 : -1);
      if (pArr[i * 3 + 2] < -LEN - 40) pArr[i * 3 + 2] = 34;
      if (pArr[i * 3 + 2] > 36) pArr[i * 3 + 2] = -LEN - 38;
    }
    pgeo.attributes.position.needsUpdate = true;

    post.render(scene, camera);
  }
  requestAnimationFrame(frame);
  window.__deck = { get cam(){return camera.position.z;}, get doors(){return bulkheads.map(b=>({z:+b.z.toFixed(1), open:+b.open.toFixed(2), vis:b.gp.visible, id:b.room?b.room.id:null}));} };
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) { clock.start(); tPrev = 0; requestAnimationFrame(frame); }
  });
}
