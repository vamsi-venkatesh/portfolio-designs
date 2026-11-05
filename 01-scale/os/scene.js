// Breach — scene construction: the room at dusk, its source layer, and the lattice.
import * as THREE from '../../vendor/three.module.js';

export const K = 300; // lattice units per room metre (portal scale)

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------------------------------------------------------------- dusk view */
export function drawDusk(mode) {
  const W = 2048, H = 1152;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const R = rng(7);
  const line = mode === 'line';
  const HZ = 0.705 * H;
  if (!line) {
    const sky = g.createLinearGradient(0, 0, 0, HZ);
    sky.addColorStop(0, '#0a1529'); sky.addColorStop(0.32, '#16304f'); sky.addColorStop(0.58, '#3d5c78');
    sky.addColorStop(0.80, '#8b8a7c'); sky.addColorStop(0.92, '#d59a6a'); sky.addColorStop(1, '#f4b77d');
    g.fillStyle = sky; g.fillRect(0, 0, W, HZ + 2);
    // afterglow bloom on the horizon, left of the cathedral
    const glow = g.createRadialGradient(W * 0.36, HZ, 10, W * 0.36, HZ, W * 0.5);
    glow.addColorStop(0, 'rgba(255,196,140,0.55)'); glow.addColorStop(1, 'rgba(255,196,140,0)');
    g.fillStyle = glow; g.fillRect(0, 0, W, HZ);
    for (let i = 0; i < 70; i++) { const y = R() * HZ * 0.45; g.fillStyle = `rgba(230,238,255,${0.25 + R() * 0.6 * (1 - y / (HZ * 0.45))})`; g.fillRect(R() * W, y, 1.6, 1.6); }
    // thin cloud bands
    for (let i = 0; i < 9; i++) { const y = HZ * (0.42 + R() * 0.4), x = R() * W, w = 300 + R() * 700; const cg = g.createLinearGradient(x, 0, x + w, 0); cg.addColorStop(0, 'rgba(255,190,150,0)'); cg.addColorStop(0.5, `rgba(255,${170 + R() * 40 | 0},140,${0.08 + R() * 0.1})`); cg.addColorStop(1, 'rgba(255,190,150,0)'); g.fillStyle = cg; g.fillRect(x, y, w, 3 + R() * 5); }
  } else {
    g.fillStyle = '#060c18'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(150,200,255,0.10)'; g.lineWidth = 1;
    for (let x = 0; x < W; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 0; y < H; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.strokeStyle = 'rgba(200,228,255,0.55)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, HZ); g.lineTo(W, HZ); g.stroke();
  }
  const ink = line ? null : '#121722';
  const stroke = () => { g.strokeStyle = 'rgba(205,232,255,0.9)'; g.lineWidth = 2.2; g.stroke(); };
  // distant city
  const blocks = [];
  let x = 0; while (x < W) { const w = 18 + R() * 60, h = 14 + R() * 46 * (R() < 0.15 ? 2.2 : 1); blocks.push([x, w, h]); x += w; }
  for (const [bx, bw, bh] of blocks) {
    if (bx > 1060 && bx < 1560) continue;
    if (line) { g.beginPath(); g.rect(bx, HZ - bh, bw, bh); g.strokeStyle = 'rgba(160,205,255,0.35)'; g.lineWidth = 1.2; g.stroke(); continue; }
    g.fillStyle = ink; g.fillRect(bx, HZ - bh, bw + 1, bh + 2);
    for (let wy = HZ - bh + 5; wy < HZ - 4; wy += 7) for (let wx = bx + 3; wx < bx + bw - 3; wx += 6)
      if (R() < 0.18) { g.fillStyle = R() < 0.8 ? `rgba(255,${190 + R() * 40 | 0},120,${0.6 + R() * 0.4})` : 'rgba(210,230,255,0.8)'; g.fillRect(wx, wy, 2.2, 2.6); }
  }
  // cathedral (Magdeburger Dom: long Gothic nave, twin west towers with octagonal tops and spires)
  const cx0 = 1120, base = HZ + 2;
  const path = (pts) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  const stone = (y0, y1) => { const s = g.createLinearGradient(0, y1, 0, y0); s.addColorStop(0, '#c49064'); s.addColorStop(0.45, '#7a5d48'); s.addColorStop(1, '#262a33'); return s; };
  // nave + choir
  path([[cx0 + 120, base], [cx0 + 120, base - 92], [cx0 + 260, base - 132], [cx0 + 470, base - 132], [cx0 + 520, base - 100], [cx0 + 520, base]]);
  if (line) stroke(); else { g.fillStyle = stone(base - 140, base); g.fill(); }
  const tower = (tx) => {
    const tw = 62, sq = base - 250, oc = sq - 92, tip = oc - 205;
    path([[tx, base], [tx, sq], [tx + tw, sq], [tx + tw, base]]); if (line) stroke(); else { g.fillStyle = stone(tip, base); g.fill(); }
    path([[tx + 7, sq], [tx + 7, oc], [tx + tw - 7, oc], [tx + tw - 7, sq]]); if (line) stroke(); else { g.fillStyle = stone(tip, base); g.fill(); }
    path([[tx + 5, oc], [tx + tw / 2, tip], [tx + tw - 5, oc]]); if (line) stroke(); else { const s = g.createLinearGradient(0, tip, 0, oc); s.addColorStop(0, '#1d222b'); s.addColorStop(1, '#4a3f38'); g.fillStyle = s; g.fill(); }
    g.beginPath(); g.moveTo(tx + tw / 2, tip); g.lineTo(tx + tw / 2, tip - 16); g.moveTo(tx + tw / 2 - 5, tip - 10); g.lineTo(tx + tw / 2 + 5, tip - 10);
    g.strokeStyle = line ? 'rgba(205,232,255,0.9)' : '#2a2d33'; g.lineWidth = 2; g.stroke();
    for (const px of [tx + 3, tx + tw - 3]) { path([[px - 4, sq], [px, sq - 26], [px + 4, sq]]); if (line) stroke(); else { g.fillStyle = '#5a4a3e'; g.fill(); } }
    // lancets
    for (let r = 0; r < 3; r++) for (const lx of [tx + 16, tx + tw - 22]) {
      const ly = base - 60 - r * 62; g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx, ly - 22); g.quadraticCurveTo(lx + 3, ly - 30, lx + 6, ly - 22); g.lineTo(lx + 6, ly); g.closePath();
      if (line) { g.strokeStyle = 'rgba(205,232,255,0.6)'; g.lineWidth = 1.2; g.stroke(); } else { g.fillStyle = r === 0 ? 'rgba(255,200,130,0.75)' : 'rgba(40,36,40,0.9)'; g.fill(); }
    }
    for (let k = 0; k < 2; k++) { const lx = tx + 14 + k * 26, ly = oc + 70; g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx, ly - 30); g.quadraticCurveTo(lx + 4, ly - 40, lx + 8, ly - 30); g.lineTo(lx + 8, ly); g.closePath(); if (line) { g.strokeStyle = 'rgba(205,232,255,0.6)'; g.lineWidth = 1.2; g.stroke(); } else { g.fillStyle = 'rgba(28,26,30,0.95)'; g.fill(); } }
  };
  tower(cx0); tower(cx0 + 96);
  path([[cx0 + 60, base], [cx0 + 60, base - 170], [cx0 + 78, base - 205], [cx0 + 96, base - 170], [cx0 + 96, base]]); if (line) stroke(); else { g.fillStyle = stone(base - 210, base); g.fill(); }
  if (!line) { g.beginPath(); g.arc(cx0 + 78, base - 140, 11, 0, Math.PI * 2); g.fillStyle = 'rgba(255,205,140,0.7)'; g.fill(); }
  // floodlight wash
  if (!line) { const fl = g.createRadialGradient(cx0 + 90, base + 40, 10, cx0 + 90, base + 40, 360); fl.addColorStop(0, 'rgba(255,190,120,0.35)'); fl.addColorStop(1, 'rgba(255,190,120,0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = fl; g.fillRect(cx0 - 300, base - 420, 900, 470); g.globalCompositeOperation = 'source-over'; }
  // trees on the bank
  if (!line) { g.fillStyle = '#0d1219'; for (let tx = 0; tx < W; tx += 9) { const th = 8 + R() * 16; g.beginPath(); g.ellipse(tx, base + 4, 10 + R() * 8, th, 0, 0, Math.PI * 2); g.fill(); } g.fillRect(0, base, W, 10); }
  // river Elbe
  const RY = base + 10;
  if (!line) {
    const rv = g.createLinearGradient(0, RY, 0, H);
    rv.addColorStop(0, '#9a7258'); rv.addColorStop(0.18, '#4b4c55'); rv.addColorStop(0.6, '#1a2334'); rv.addColorStop(1, '#0b111d');
    g.fillStyle = rv; g.fillRect(0, RY, W, H - RY);
    for (let i = 0; i < 260; i++) { const y = RY + Math.pow(R(), 1.6) * (H - RY), w = 20 + R() * 160; g.fillStyle = `rgba(255,220,180,${0.04 + R() * 0.08})`; g.fillRect(R() * W, y, w, 1.4); }
    // reflections of floodlit towers and city lights
    for (let i = 0; i < 40; i++) { const y = RY + 4 + i * 6; const w = 150 - i * 2.4; if (w < 4) break; g.fillStyle = `rgba(255,190,120,${0.22 * (1 - i / 40)})`; g.fillRect(cx0 + 90 - w / 2 + (R() - 0.5) * 18, y, w, 2.4); }
    for (let i = 0; i < 90; i++) { const lx = R() * W; if (lx > 1060 && lx < 1600) continue; for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(255,200,130,${0.18 * (1 - k / 6)})`; g.fillRect(lx + (R() - 0.5) * 4, RY + 4 + k * 7 + R() * 3, 2 + R() * 3, 1.5); } }
  } else {
    g.strokeStyle = 'rgba(150,200,255,0.4)'; g.lineWidth = 1.2;
    for (let i = 0; i < 9; i++) { const y = RY + 12 + i * i * 4; g.beginPath(); g.moveTo(0, y); for (let xx = 0; xx <= W; xx += 32) g.lineTo(xx, y + Math.sin(xx * 0.01 + i) * 2); g.stroke(); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

function woodTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d'); const R = rng(3);
  g.fillStyle = '#5a3a24'; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 260; i++) {
    const y = R() * 512, a = 0.03 + R() * 0.09, dark = R() < 0.55;
    g.strokeStyle = dark ? `rgba(30,16,8,${a})` : `rgba(160,110,70,${a})`; g.lineWidth = 0.6 + R() * 2.4;
    g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 6 + Math.sin(x * 0.03 + i * 2) * 1.5); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); return t;
}

/* ---------------------------------------------------------------- shaders */
const NOISE = `
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}`;

export function portalMaterial(tLat, src) {
  return new THREE.ShaderMaterial({
    uniforms: { tLat: { value: tLat }, uFlat: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uWake: { value: 0 }, uTime: { value: 0 }, uSrc: { value: src ? 1 : 0 } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vWp;
      void main(){ vUv=uv; vec4 wp=modelMatrix*vec4(position,1.); vN=normalize(mat3(modelMatrix)*normal); vWp=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: `uniform sampler2D tLat; uniform vec2 uRes; uniform float uWake,uTime,uSrc,uFlat; varying vec2 vUv; varying vec3 vN; varying vec3 vWp;
      ${NOISE}
      void main(){
        vec2 e=vUv-.5; vec2 suv=gl_FragCoord.xy/uRes;
        float rim=smoothstep(.40,.5,max(abs(e.x),abs(e.y)*1.0));
        vec2 refr = e*0.018*rim + (vec2(vn(vUv*7.+uTime*.15),vn(vUv*7.-uTime*.13))-.5)*0.0025;
        vec3 lat = texture2D(tLat, mix(suv, vUv, uFlat)+refr*(1.-uFlat*.8)).rgb*mix(1.,1.35,uFlat);
        float r = length(e*vec2(1.5,1.0));
        float w = clamp(uWake,0.,1.);
        float rise = smoothstep(-0.25, 0.25, (1.0 - vUv.y) - 1.0 + w*1.6);
        float lift = mix(0.035, 1.0, smoothstep(0.,1.,w)*mix(rise,1.,w*w));
        vec3 col = lat*lift*mix(1.0,1.25,uSrc);
        vec3 vV=normalize(cameraPosition-vWp); float fres = pow(1.-max(dot(normalize(vN),vV),0.),4.);
        // glass: dark body tint, lamp reflection streak (upper left), soft fresnel
        col = col*vec3(0.92,0.97,1.0) + vec3(0.010,0.013,0.02);
        float streak = exp(-pow((e.x+e.y*0.55+0.30)*9.,2.))*smoothstep(.5,.0,abs(e.y))*0.03*(0.15+0.85*w)*(1.-uSrc);
        col += vec3(1.0,0.78,0.52)*streak + vec3(0.5,0.6,0.75)*fres*0.25;
        col += vec3(0.75,0.88,1.0)*0.05*exp(-pow(((1.0-vUv.y)-1.0+w*1.6)*9.,2.))*(1.-w)*smoothstep(0.,.1,w);
        col += vec3(0.6,0.8,1.0)*rim*0.05*w;
        gl_FragColor=vec4(col,1.);
      }`
  });
}

/* ---------------------------------------------------------------- room */
export function buildRoom(tLat) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05060a);
  const S = (m) => { m.userData.src = true; m.castShadow = true; m.receiveShadow = true; return m; };
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const wallMat = std({ color: 0x9c8a76, roughness: 0.93 });
  const frameMat = std({ color: 0xd8d1c4, roughness: 0.55 });
  const box = (w, h, d, mat, x, y, z, parent = scene) => { const m = S(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)); m.position.set(x, y, z); parent.add(m); return m; };
  const ZW = -2.25, WT = 0.32, ZC = ZW - WT / 2;
  const wx0 = -1.05, wx1 = 0.95, wy0 = 1.0, wy1 = 2.6;
  box(3.0, 3.6, WT, wallMat, wx0 - 1.5, 1.8, ZC); box(3.0, 3.6, WT, wallMat, wx1 + 1.5, 1.8, ZC);
  box(wx1 - wx0, wy0, WT, wallMat, (wx0 + wx1) / 2, wy0 / 2, ZC); box(wx1 - wx0, 3.6 - wy1, WT, wallMat, (wx0 + wx1) / 2, (3.6 + wy1) / 2, ZC);
  box(wx1 - wx0 + 0.12, 0.04, 0.40, frameMat, (wx0 + wx1) / 2, wy0 + 0.02, ZW - 0.12);
  const FZ = ZW - WT + 0.06, fb = 0.055;
  box(fb, wy1 - wy0, 0.06, frameMat, wx0 + fb / 2, (wy0 + wy1) / 2, FZ); box(fb, wy1 - wy0, 0.06, frameMat, wx1 - fb / 2, (wy0 + wy1) / 2, FZ);
  box(wx1 - wx0, fb, 0.06, frameMat, (wx0 + wx1) / 2, wy1 - fb / 2, FZ); box(wx1 - wx0, fb, 0.06, frameMat, (wx0 + wx1) / 2, wy0 + fb / 2 + 0.04, FZ);
  box(0.05, wy1 - wy0, 0.06, frameMat, -0.05, (wy0 + wy1) / 2, FZ); box(wx1 - wx0, 0.045, 0.06, frameMat, (wx0 + wx1) / 2, 2.12, FZ);
  // side walls + floor + ceiling
  const side = S(new THREE.Mesh(new THREE.PlaneGeometry(4, 3.6), wallMat)); side.rotation.y = Math.PI / 2; side.position.set(-1.95, 1.8, -0.3); scene.add(side);
  const side2 = S(new THREE.Mesh(new THREE.PlaneGeometry(4, 3.6), wallMat)); side2.rotation.y = -Math.PI / 2; side2.position.set(1.95, 1.8, -0.3); scene.add(side2);
  const floor = S(new THREE.Mesh(new THREE.PlaneGeometry(4, 4), std({ color: 0x2a1f18, roughness: 0.7 }))); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -0.3); scene.add(floor);
  // outside
  const dusk = drawDusk('fill');
  const outside = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 2.7), new THREE.MeshBasicMaterial({ map: dusk, color: new THREE.Color(1.15, 1.15, 1.15) }));
  outside.position.set(-0.05, 1.95, -3.45); scene.add(outside);
  // back wall + ceiling (the intro camera turns round inside the room)
  box(3.9, 3.6, 0.1, wallMat, 0, 1.8, 1.72); box(0.9, 2.05, 0.03, std({ color: 0x3b2a1e, roughness: 0.6 }), 1.1, 1.03, 1.66);
  const ceil = S(new THREE.Mesh(new THREE.PlaneGeometry(4, 4), std({ color: 0x7d6f60, roughness: 0.95 }))); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.6, -0.3); scene.add(ceil);
  // ---- outside: the building at night, Magdeburg. Our window is the one cut into the facade.
  const extU = { uTime: { value: 0 } };
  const facade = new THREE.Mesh(new THREE.PlaneGeometry(34, 30), new THREE.ShaderMaterial({ uniforms: extU,
    vertexShader: 'varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader: `varying vec3 vW; uniform float uTime;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
      void main(){
        vec2 p=vW.xy;
        if(p.x>-1.05&&p.x<0.95&&p.y>1.0&&p.y<2.6) discard;
        float cx=p.x+0.05+1.5; vec2 cell=vec2(floor(cx/3.),floor(p.y/3.6)); vec2 f=vec2(mod(cx,3.)-1.5,mod(p.y,3.6));
        float street=exp(-(p.y+14.4)*.16);
        vec3 col=vec3(.028,.031,.04)+vec3(.09,.065,.04)*street+ (n(p*6.)-.5)*.018 + (n(p*.7)-.5)*.02;
        // stone courses + cornice at each floor
        col*=.92+.08*smoothstep(.0,.02,abs(fract(p.y/.45)-.5));
        float ledge=smoothstep(.06,.0,abs(f.y-.94)); col+=vec3(.03,.027,.024)*ledge*(1.+street);
        bool win=abs(f.x)<1.0&&f.y>1.0&&f.y<2.6; bool top=p.y>14.4; bool low=p.y<-14.4+3.6;
        if(top){ col=vec3(.03,.035,.045); }
        else if(win){
          float r=h(cell+3.7); vec2 q=vec2(f.x,f.y-1.8);
          vec3 w=vec3(.012,.016,.025);
          if(r<.30) w=mix(vec3(1.,.62,.32),vec3(1.,.82,.55),h(cell+1.))*(.55+.5*h(cell+9.))*(.75+.25*smoothstep(.8,0.,length(q*vec2(.9,1.2))));
          else if(r<.38) w=vec3(.35,.55,.95)*(.4+.25*sin(uTime*(.7+h(cell)*2.)+h(cell)*9.)*h(cell+4.));
          if(r<.30&&h(cell+5.)<.5) w*=mix(.35,1.,smoothstep(.0,.5,abs(f.x)-.25)); // curtains
          float mull=step(abs(f.x),.025)+step(abs(f.y-2.12),.02); w=mix(w,vec3(.05),clamp(mull,0.,1.));
          float fr=step(.94,abs(f.x))+step(f.y,1.05)+step(2.55,f.y); w=mix(w,vec3(.11,.1,.09),clamp(fr,0.,1.));
          col=w;
        }
        // our window's own frame glows faintly warm from inside
        float d=max(abs(p.x+0.05)-1.0,max(1.0-p.y,p.y-2.6)); col+=vec3(1.,.7,.4)*.22*exp(-max(d,0.)*5.)*step(p.y,4.);
        gl_FragColor=vec4(col,1.);
      }` }));
  facade.position.set(-0.05, 0.6, ZW - WT - 0.003); facade.rotation.y = Math.PI; scene.add(facade);
  // sky behind the camera when we stand outside, and the street below
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(400, 220), new THREE.ShaderMaterial({ depthWrite: false,
    vertexShader: 'varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec2 vU; float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      void main(){ vec3 c=mix(vec3(.10,.09,.12),vec3(.012,.02,.045),smoothstep(.30,.75,vU.y)); vec2 g=floor(vU*vec2(900.,500.)); float s=step(.9985,h(g))*smoothstep(.45,.8,vU.y); gl_FragColor=vec4(c+s*.8,1.); }` }));
  sky.position.set(0, 20, 60); sky.rotation.y = Math.PI; scene.add(sky);
  const street = new THREE.Mesh(new THREE.PlaneGeometry(120, 80), new THREE.ShaderMaterial({
    vertexShader: 'varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader: `varying vec3 vW; void main(){ vec3 c=vec3(.02,.022,.03); for(int i=0;i<5;i++){ vec2 l=vec2(-16.+float(i)*8.,-9.); float d=length(vW.xz-l); c+=vec3(1.,.66,.36)*.5/(1.+d*d*.6); } c+=vec3(1.,.7,.4)*.08*exp(-abs(vW.z+3.)*.6); gl_FragColor=vec4(c,1.); }` }));
  street.rotation.x = -Math.PI / 2; street.position.set(0, -14.4, -30); scene.add(street);
  // snow, outside only
  const SN = 1400, sp = new Float32Array(SN * 3); for (let i = 0; i < SN; i++) { sp[i * 3] = (Math.random() - 0.5) * 26; sp[i * 3 + 1] = Math.random() * 30 - 15; sp[i * 3 + 2] = -2.8 - Math.random() * 16; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const snow = new THREE.Points(sg, new THREE.ShaderMaterial({ uniforms: extU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uTime; varying float vA; void main(){ vec3 p=position; p.y=mod(p.y-uTime*(.55+fract(p.x*7.3)*.5)+15.,30.)-15.; p.x+=sin(uTime*.6+p.y*.7+p.z)*.25; vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=clamp(40./-mv.z,1.,6.); vA=smoothstep(30.,4.,-mv.z); }`,
    fragmentShader: 'varying float vA; void main(){ float d=length(gl_PointCoord-.5); gl_FragColor=vec4(vec3(.9,.93,1.)*smoothstep(.5,.0,d)*.55*vA,1.); }' }));
  snow.frustumCulled = false; scene.add(snow);
  // desk
  const wood = std({ map: woodTexture(), roughness: 0.48, color: 0xffffff });
  const desk = new THREE.Group(); scene.add(desk);
  box(2.2, 0.035, 0.82, wood, 0, 0.7325, -1.84, desk);
  box(2.1, 0.09, 0.03, std({ color: 0x3a2618, roughness: 0.6 }), 0, 0.67, -1.45, desk);
  for (const lx of [-1.03, 1.03]) box(0.05, 0.7, 0.05, std({ color: 0x2b1c12, roughness: 0.6 }), lx, 0.35, -1.48, desk);
  const TOP = 0.75;
  // the slab (2126 computer)
  const slab = new THREE.Group(); slab.position.set(0.12, TOP, -1.78); scene.add(slab);
  const metal = std({ color: 0x1a1b20, metalness: 0.75, roughness: 0.32 });
  box(0.30, 0.012, 0.075, metal, 0, 0.006, 0.01, slab);
  const tilt = new THREE.Group(); tilt.position.set(0, 0.012, 0); tilt.rotation.x = -0.17; slab.add(tilt);
  const SW = 0.46, SH = 0.30, SD = 0.016;
  const body = box(SW, SH, SD, std({ color: 0x07080b, metalness: 0.3, roughness: 0.26 }), 0, SH / 2, 0, tilt);
  const pm = portalMaterial(tLat, false);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(SW - 0.012, SH - 0.012), pm); face.position.set(0, SH / 2, SD / 2 + 0.0006); tilt.add(face);
  // intro overlay on the glass: a cursor of light with visible subpixels, and the typed name
  const IW = 0.26, IH = 0.065; const ic = document.createElement('canvas'); ic.width = 4096; ic.height = 1024;
  const itex = new THREE.CanvasTexture(ic); itex.colorSpace = THREE.SRGBColorSpace; itex.anisotropy = 8;
  const introMat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { tText: { value: itex }, uCur: { value: new THREE.Vector4(0, 0, 0, 0) }, uBlink: { value: 1 }, uA: { value: 1 }, uCell: { value: new THREE.Vector2(0.00025 / IW, 0.00025 / IH) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tText; uniform vec4 uCur; uniform float uBlink,uA; uniform vec2 uCell; varying vec2 vUv;
      void main(){
        vec3 txt=texture2D(tText,vUv).rgb*vec3(1.0,0.93,0.84)*1.25;
        vec2 c=vUv/uCell; vec2 f=fract(c); vec2 fw=fwidth(c);
        float inCur=step(uCur.x,vUv.x)*step(vUv.x,uCur.z)*step(uCur.y,vUv.y)*step(vUv.y,uCur.w);
        float k=floor(f.x*3.); vec3 sub=k<1.?vec3(1.,.08,.05):(k<2.?vec3(.08,1.,.12):vec3(.12,.25,1.));
        float gapx=smoothstep(0.,.06,f.x)*smoothstep(1.,.94,f.x); float gapy=smoothstep(0.,.10,f.y)*smoothstep(1.,.90,f.y);
        float stripe=smoothstep(0.,.05,fract(f.x*3.))*smoothstep(1.,.95,fract(f.x*3.));
        vec3 px=sub*1.25*gapx*gapy*stripe;
        float far=smoothstep(.12,.45,max(fw.x,fw.y));
        vec3 cur=mix(px*0.9,vec3(1.0,0.95,0.88)*2.2,far)*inCur*uBlink;
        gl_FragColor=vec4((txt+cur)*uA,1.);
      }` });
  const intro = new THREE.Mesh(new THREE.PlaneGeometry(IW, IH), introMat); intro.renderOrder = 6;
  intro.position.set(-0.07, SH / 2 + 0.035, SD / 2 + 0.0012); tilt.add(intro);
  // lamp
  const lamp = new THREE.Group(); lamp.position.set(-0.80, TOP, -1.98); scene.add(lamp);
  const lampMat = std({ color: 0x1c1d22, metalness: 0.6, roughness: 0.35 });
  const lb = S(new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.022, 48), lampMat)); lb.position.y = 0.011; lamp.add(lb);
  const post = S(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.56, 16), lampMat)); post.position.y = 0.29; lamp.add(post);
  const shadePos = new THREE.Vector3(-0.47, TOP + 0.50, -1.80);
  const joint = new THREE.Vector3(-0.80, TOP + 0.57, -1.98);
  const armV = shadePos.clone().sub(joint); const arm = S(new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, armV.length(), 12), lampMat));
  arm.position.copy(joint).add(armV.clone().multiplyScalar(0.5)); arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), armV.clone().normalize()); scene.add(arm);
  const shadeAim = new THREE.Vector3(-0.30, TOP, -1.62);
  const shade = new THREE.Group(); shade.position.copy(shadePos); shade.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), shadeAim.clone().sub(shadePos).normalize()); scene.add(shade);
  const sh = S(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.10, 0.13, 48, 1, true), std({ color: 0x1c1d22, metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide }))); sh.castShadow = false; sh.position.y = -0.03; shade.add(sh);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.097, 0.128, 48, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.45, 0.7), side: THREE.BackSide })); inner.position.y = -0.03; shade.add(inner);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.026, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(9, 6.2, 3.6) })); bulb.position.y = -0.06; shade.add(bulb);
  const spot = new THREE.SpotLight(0xffb978, 5.5, 0, 0.78, 0.65, 2); spot.position.copy(shadePos); spot.target.position.copy(shadeAim);
  spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0004; spot.shadow.radius = 4; spot.shadow.camera.near = 0.05; spot.shadow.camera.far = 4;
  scene.add(spot, spot.target);
  const glowL = new THREE.PointLight(0xffa766, 1.1, 0, 1.6); glowL.position.copy(shadePos).add(new THREE.Vector3(0.02, 0.08, 0.06)); scene.add(glowL);
  // beam
  const beamLen = shadePos.distanceTo(shadeAim) * 0.97;
  const beamDir = shadeAim.clone().sub(shadePos).normalize();
  const beamMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    uniforms: { uTime: { value: 0 }, uA: { value: shadePos.clone().addScaledVector(beamDir, 0.04) }, uD: { value: beamDir }, uLen: { value: beamLen }, uTop: { value: TOP } },
    vertexShader: `varying vec3 vW; void main(){ vec4 wp=modelMatrix*vec4(position,1.); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: `uniform float uTime,uLen,uTop; uniform vec3 uA,uD; varying vec3 vW;
      void main(){ vec3 ro=cameraPosition, rd=normalize(vW-cameraPosition);
        // closest approach between the view ray and the beam axis
        vec3 w0=ro-uA; float b=dot(rd,uD), d=dot(rd,w0), e=dot(uD,w0); float den=max(1.-b*b,1e-4);
        float tr=(b*e-d)/den, ta=(e-b*d)/den; ta=clamp(ta,0.,uLen);
        vec3 pr=ro+rd*max(tr,0.), pa=uA+uD*ta; float dist=length(pr-pa);
        float rad=0.03+0.36*ta/uLen; float k=clamp(1.-dist/rad,0.,1.);
        float along=smoothstep(0.,.12,ta/uLen)*(1.-smoothstep(.7,1.,ta/uLen));
        float above=smoothstep(uTop,uTop+0.06,pr.y);
        float a=k*k*along*above*0.11*(0.95+0.05*sin(uTime*1.3));
        gl_FragColor=vec4(vec3(1.0,0.72,0.45)*a,1.); }` });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.46, beamLen, 48, 1, true), beamMat);
  beam.position.copy(shadePos).add(shadeAim.clone().sub(shadePos).normalize().multiplyScalar(beamLen / 2 - 0.02)); beam.quaternion.copy(shade.quaternion); scene.add(beam);
  // dust motes inside the beam
  const N = 340, dp = new Float32Array(N * 3), ds = new Float32Array(N); const R = rng(11);
  const dir = shadeAim.clone().sub(shadePos).normalize();
  const perpA = new THREE.Vector3(1, 0, 0).cross(dir).normalize(), perpB = dir.clone().cross(perpA).normalize();
  for (let i = 0; i < N; i++) { const t = 0.08 + R() * 0.95; const rad = (0.04 + t * 0.36) * Math.sqrt(R()) * 1.25, an = R() * 6.283; const p = shadePos.clone().addScaledVector(dir, t * beamLen).addScaledVector(perpA, Math.cos(an) * rad).addScaledVector(perpB, Math.sin(an) * rad); dp.set([p.x, p.y, p.z], i * 3); ds[i] = R(); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); dg.setAttribute('aS', new THREE.BufferAttribute(ds, 1));
  const dustMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uA: { value: shadePos }, uD: { value: dir }, uLen: { value: beamLen }, uPx: { value: 1 } },
    vertexShader: `attribute float aS; uniform float uTime,uLen,uPx; uniform vec3 uA,uD; varying float vB;
      void main(){ vec3 p=position; float t=uTime*0.05; p+=vec3(sin(t*2.+aS*40.),sin(t*1.3+aS*17.)*0.6-0.25*fract(t*0.2+aS),cos(t*1.7+aS*23.))*0.035;
        vec3 r=p-uA; float along=dot(r,uD); float d=length(r-along*uD); float rad=0.05+along/uLen*0.40; vB=smoothstep(rad,rad*0.45,d)*smoothstep(0.02,0.15,along/uLen)*(0.5+0.5*sin(uTime*(0.8+aS*2.)+aS*30.));
        vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=uPx*(1.2+aS*1.8)*(1.6/-mv.z); }`,
    fragmentShader: `varying float vB; void main(){ vec2 c=gl_PointCoord-.5; float a=smoothstep(.5,.0,length(c)); gl_FragColor=vec4(vec3(1.,.82,.6)*a*vB*1.6,1.); }` });
  scene.add(new THREE.Points(dg, dustMat));
  // mug
  const mug = new THREE.Group(); mug.position.set(0.64, TOP, -1.56); scene.add(mug);
  const ceramic = std({ color: 0xe6dccb, roughness: 0.32 });
  const mb = S(new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.039, 0.096, 48), ceramic)); mb.position.y = 0.048; mug.add(mb);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.038, 40), std({ color: 0x24140b, roughness: 0.3 })); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.0965; mug.add(coffee);
  const handle = S(new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.0065, 12, 32), ceramic)); handle.position.set(0.046, 0.05, 0); mug.add(handle);
  const steamMats = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uTime: { value: 0 }, uSeed: { value: i * 3.7 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform float uTime,uSeed; varying vec2 vUv; ${NOISE}
        void main(){ float y=vUv.y; float sway=(fbm(vec2(y*2.2-uTime*0.35,uSeed))-.5)*0.9*y; float x=vUv.x-.5-sway;
          float wisp=exp(-x*x/(0.003+0.02*y)); float n=fbm(vec2(vUv.x*5.+uSeed,y*4.-uTime*0.8));
          float a=wisp*smoothstep(.35,.75,n)*smoothstep(0.,.18,y)*(1.-smoothstep(.45,1.,y))*0.32; gl_FragColor=vec4(vec3(1.,.93,.84)*a,1.); }` });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.30), m); p.position.set((i - 1) * 0.01, 0.1 + 0.15, 0); p.rotation.y = i * 1.0; mug.add(p); steamMats.push(m);
  }
  // books + pencil
  const books = new THREE.Group(); books.position.set(-0.36, TOP, -1.62); books.rotation.y = 0.22; scene.add(books);
  box(0.23, 0.028, 0.30, std({ color: 0x5a2a1f, roughness: 0.75 }), 0, 0.014, 0, books);
  box(0.22, 0.02, 0.29, std({ color: 0xd9ccb2, roughness: 0.9 }), 0.004, 0.012, 0, books);
  box(0.19, 0.022, 0.25, std({ color: 0x23334a, roughness: 0.7 }), 0.01, 0.039, 0.01, books).rotation.y = -0.12;
  const pencil = S(new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.17, 6), std({ color: 0xc9902d, roughness: 0.5 }))); pencil.rotation.z = Math.PI / 2; pencil.rotation.y = 0.5; pencil.position.set(0.40, TOP + 0.004, -1.48); scene.add(pencil);
  // lights
  scene.add(new THREE.HemisphereLight(0x6d86ad, 0x3a2a1c, 0.75));
  const dl = new THREE.DirectionalLight(0x8fa8d0, 0.55); dl.position.set(0.3, 2.6, -3.6); dl.target.position.set(0, 0.6, -1.4); scene.add(dl, dl.target);
  const fill = new THREE.PointLight(0xffc89a, 0.9, 0, 1.2); fill.position.set(-1.2, 2.0, 0.6); scene.add(fill);
  const slabGlow = new THREE.PointLight(0x9cc4ff, 0, 1.4, 2); slabGlow.position.set(0.12, TOP + 0.17, -1.66); scene.add(slabGlow);
  scene.updateMatrixWorld(true);
  return { extU, scene, intro, introMat, introCanvas: ic, introTex: itex, introSize: [IW, IH], face, pm, beamMat, dustMat, steamMats, slabGlow, slab, tilt, mug, lamp, shadePos, outside,
    anchors: { slab: face, mug, shadePos, cathedral: new THREE.Vector3(0.40, 1.78, -2.5), window: new THREE.Vector3(-0.86, 1.88, -2.42), elbe: new THREE.Vector3(-0.66, 1.18, -2.45), desk: new THREE.Vector3(-0.98, TOP + 0.01, -1.45), books },
    dims: { SW, SH, wx0, wx1, wy0, wy1, TOP } };
}

/* ---------------------------------------------------------------- source layer */
function labelCanvas(title, rows) {
  const s = 2, pad = 10;
  const c = document.createElement('canvas'); const g = c.getContext('2d');
  const tf = `italic ${26 * s}px "Instrument Serif", Georgia, serif`, rf = `300 ${11 * s}px "Martian Mono", Menlo, monospace`;
  g.font = tf; let w = g.measureText(title).width; g.font = rf; for (const r of rows) w = Math.max(w, g.measureText(r.join('   ')).width + 8 * s);
  c.width = Math.ceil(w + pad * 2 * s + 30 * s); c.height = Math.ceil((40 + rows.length * 19 + 10) * s);
  const draw = (rowsNow) => {
    g.clearRect(0, 0, c.width, c.height);
    g.font = tf; g.fillStyle = '#eaf3ff'; g.textBaseline = 'alphabetic'; g.fillText(title, pad * s, 30 * s);
    g.fillStyle = 'rgba(190,220,255,0.55)'; g.fillRect(pad * s, 37 * s, c.width - pad * 2 * s, 1 * s);
    g.font = rf;
    rowsNow.forEach((r, i) => { const y = (55 + i * 19) * s; g.fillStyle = 'rgba(176,206,236,0.85)'; g.fillText(r[0], pad * s, y); if (r[1]) { const kw = g.measureText(r[0] + '  ').width; g.fillStyle = '#ffcf9a'; g.fillText(r[1], pad * s + kw, y); } });
  };
  draw(rows);
  return { c, draw, w: c.width / s, h: c.height / s, title };
}

export function buildSource(room, tLat) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x050a14);
  const fillMat = new THREE.ShaderMaterial({ polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
    vertexShader: `varying vec3 vW; varying vec3 vN; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `varying vec3 vW; varying vec3 vN; float grid(vec3 p, vec3 n, float s){ vec3 a=abs(n); vec2 q = a.x>a.y&&a.x>a.z ? p.yz : (a.y>a.z ? p.xz : p.xy); vec2 f=abs(fract(q/s+.5)-.5)*s; vec2 fw=fwidth(q); vec2 l=1.-smoothstep(vec2(0.),fw*1.2,f); return max(l.x,l.y); }
      void main(){ float g1=grid(vW,vN,0.1), g2=grid(vW,vN,0.5); float sh=0.5+0.5*dot(vN,normalize(vec3(-.3,.6,.7)));
        vec3 base=vec3(0.020,0.036,0.068)*(0.7+0.5*sh); vec3 col=base+vec3(0.18,0.30,0.48)*(g1*0.10+g2*0.22); gl_FragColor=vec4(col,1.); }` });
  const edgeMat = new THREE.LineBasicMaterial({ color: new THREE.Color(0.62, 0.84, 1.15), transparent: true, opacity: 0.95 });
  room.scene.traverse((o) => {
    if (!o.isMesh || !o.userData.src) return;
    const f = new THREE.Mesh(o.geometry, fillMat); f.matrixAutoUpdate = false; f.matrix.copy(o.matrixWorld); scene.add(f);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 28), edgeMat); e.matrixAutoUpdate = false; e.matrix.copy(o.matrixWorld); scene.add(e);
  });
  // outside as a drawing
  const out = new THREE.Mesh(room.outside.geometry, new THREE.MeshBasicMaterial({ map: drawDusk('line'), color: new THREE.Color(1.1, 1.1, 1.1) })); out.matrixAutoUpdate = false; out.matrix.copy(room.outside.matrixWorld); scene.add(out);
  // portal face, brighter
  const pm = portalMaterial(tLat, true);
  const face = new THREE.Mesh(room.face.geometry, pm); face.matrixAutoUpdate = false; face.matrix.copy(room.face.matrixWorld); scene.add(face);
  // lamp beam as a measured cone outline + light ray lines
  const rays = []; const sp = room.shadePos, aim = new THREE.Vector3(-0.30, room.dims.TOP, -1.62);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; const off = new THREE.Vector3(Math.cos(a) * 0.30, 0, Math.sin(a) * 0.22); rays.push(sp.x, sp.y, sp.z, aim.x + off.x, aim.y + 0.001, aim.z + off.z); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(rays, 3));
  const rayMat = new THREE.LineDashedMaterial({ color: new THREE.Color(1.3, 0.85, 0.45), dashSize: 0.012, gapSize: 0.01, transparent: true, opacity: 0.55 });
  const rl = new THREE.LineSegments(rg, rayMat); rl.computeLineDistances(); scene.add(rl);
  // labels
  const labels = [];
  const lineMat = () => new THREE.LineBasicMaterial({ color: new THREE.Color(0.75, 0.88, 1.1), transparent: true, opacity: 0 });
  const addLabel = (anchor, offset, title, rows, live, opt = {}) => {
    const L = labelCanvas(title, rows); const tex = new THREE.CanvasTexture(L.c); tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); m.renderOrder = 10;
    const pos = anchor.clone().add(offset);
    const lg = new THREE.BufferGeometry().setFromPoints([anchor, pos]); const ln = new THREE.Line(lg, lineMat()); ln.renderOrder = 9; ln.material.depthTest = false;
    const dot = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.15, 0.7), transparent: true, opacity: 0, depthTest: false })); dot.renderOrder = 11; dot.position.copy(anchor);
    scene.add(m, ln, dot);
    labels.push({ m, ln, dot, pos, posD: pos.clone(), posP: opt.pOff ? anchor.clone().add(opt.pOff) : pos.clone(), phone: !!opt.phone, anchor, L, tex, live, px: L.w, py: L.h });
  };
  const { dims } = room;
  const wp = new THREE.Vector3(); room.face.getWorldPosition(wp);
  addLabel(wp.clone().add(new THREE.Vector3(0.18, 0.11, 0.01)), new THREE.Vector3(0.20, 0.20, 0.05), 'slab · 2126', [['glass', '16 mm, dark'], ['state', 'awake'], ['inside', 'light, computing']], null, { phone: true, pOff: new THREE.Vector3(-0.30, 0.135, 0.05) });
  const mp = room.mug.position.clone().add(new THREE.Vector3(0, 0.1, 0));
  addLabel(mp, new THREE.Vector3(0.10, 0.20, 0.0), 'mug · stoneware', [['temp', '61.4 °C'], ['steam', '0.31 g/min'], ['fill', '68 %']], 'mug');
  addLabel(room.shadePos.clone().add(new THREE.Vector3(0.0, 0.03, 0)), new THREE.Vector3(-0.10, 0.27, 0.05), 'lamp', [['colour', '2700 K'], ['output', '806 lm · 62 %']]);
  addLabel(room.anchors.window, new THREE.Vector3(0.06, -0.04, 0.25), 'window · west', [['at', '52.13° N  11.63° E'], ['city', 'Magdeburg, DE'], ['view', 'Elbe, the Dom, dusk']]);
  addLabel(room.anchors.cathedral, new THREE.Vector3(0.20, 0.02, 0.2), 'Magdeburger Dom', [['form', 'Gothic, twin spires'], ['lit', 'floodlit']], null, { phone: true, pOff: new THREE.Vector3(-0.10, -0.20, 0.2) });
  // dimension lines (slab width, window width)
  const dimMat = new THREE.LineBasicMaterial({ color: new THREE.Color(1.25, 0.9, 0.55), transparent: true, opacity: 0, depthTest: false });
  const dimObjs = [];
  const addDim = (a, b, up, text) => {
    const pts = [a.clone().add(up), b.clone().add(up), a.clone(), a.clone().add(up.clone().multiplyScalar(1.4)), b.clone(), b.clone().add(up.clone().multiplyScalar(1.4))];
    const g = new THREE.BufferGeometry().setFromPoints(pts); const l = new THREE.LineSegments(g, dimMat); l.renderOrder = 9; scene.add(l);
    const L = labelCanvas(text, []); const tex = new THREE.CanvasTexture(L.c); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthTest: false })); m.renderOrder = 10; scene.add(m);
    dimObjs.push({ l, m, pos: a.clone().add(b).multiplyScalar(0.5).add(up.clone().multiplyScalar(1.6)), px: L.w * 0.62, py: L.h * 0.62 });
  };
  const fq = new THREE.Quaternion(); room.face.getWorldQuaternion(fq);
  const fx = new THREE.Vector3(1, 0, 0).applyQuaternion(fq), fy = new THREE.Vector3(0, 1, 0).applyQuaternion(fq);
  addDim(wp.clone().addScaledVector(fx, -dims.SW / 2).addScaledVector(fy, -dims.SH / 2 - 0.004), wp.clone().addScaledVector(fx, dims.SW / 2).addScaledVector(fy, -dims.SH / 2 - 0.004), fy.clone().multiplyScalar(-0.03), '460 mm');
  addDim(new THREE.Vector3(dims.wx0, dims.wy1, -2.36), new THREE.Vector3(dims.wx1, dims.wy1, -2.36), new THREE.Vector3(0, 0.05, 0), '2000 mm');
  scene.updateMatrixWorld(true);
  return { scene, pm, labels, dimObjs, dimMat, rayMat, edgeMat };
}

/* ---------------------------------------------------------------- lattice */
export function buildLattice() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x010207);
  const R = rng(21);
  const pos = [], aT = [], aSeed = [], aB = [];
  const S = 80;
  const NAVE_X = 150, NAVE_Y0 = -200, NAVE_Y1 = 250, NAVE_Z = -2300;
  const CH = []; for (let i = 0; i < 12; i++) { const side = i % 2 ? 1 : -1; CH.push([side * 340, 70, -(560 + i * 150)]); }
  const chapel = (x, y, z) => CH.some((c) => Math.hypot(x - c[0], z - c[2]) < 120 && Math.abs(y - c[1]) < 170);
  const nave = (x, y, z) => chapel(x, y, z) || Math.abs(x) < NAVE_X + 20 && y > NAVE_Y0 - 20 && y < NAVE_Y1 + 20 && z > NAVE_Z;
  const push = (a, b, t0, t1, seed, br) => { pos.push(a[0], a[1], a[2], b[0], b[1], b[2]); aT.push(t0, t1); aSeed.push(seed, seed); aB.push(br, br); };
  const hseed = (n) => Math.abs((Math.sin(n * 12.9898) * 43758.5453) % 1);
  const NX = 12, NY0 = -6, NY1 = 8, NZ = 34;
  for (let i = -NX; i <= NX; i++) for (let j = NY0; j <= NY1; j++) for (let k = 0; k < NZ; k++) {
    const x = (i + 0.5) * S, y = (j + 0.5) * S, z = -(k * S + 40);
    const pa = [x, y, z];
    const tryEdge = (b, p, axis, lineId) => { const m = [(pa[0] + b[0]) / 2, (pa[1] + b[1]) / 2, (pa[2] + b[2]) / 2]; if (nave(m[0], m[1], m[2])) return; if (R() > p) return;
      const t0 = axis === 0 ? pa[0] : axis === 1 ? pa[1] : axis === 2 ? -pa[2] : 0; const t1 = axis === 0 ? b[0] : axis === 1 ? b[1] : axis === 2 ? -b[2] : S * 1.41;
      push(pa, b, t0, t1, hseed(lineId), 0.25 + R() * 0.5); };
    const ri = ((i % 3) + 3) % 3 === 0, rj = ((j % 4) + 4) % 4 === 0;
    if (i < NX) tryEdge([x + S, y, z], rj && k % 2 === 0 ? 0.8 : 0, 0, j * 1000 + k + 0.1);
    if (j < NY1) tryEdge([x, y + S, z], ri && k % 2 === 0 ? 0.92 : 0, 1, i * 1000 + k + 0.2);
    if (k < NZ - 1) tryEdge([x, y, z - S], ri && rj ? 0.95 : 0, 2, i * 1000 + j + 0.3);
    if (i < NX && j < NY1 && R() < 0.0) tryEdge([x + S, y + S, z], 1, 3, i * 7 + j * 13 + k * 17 + 0.4);
  }
  // the nave: pillars, ribbed pointed vaults, rails. Pulses on these are shared per side, so one pulse
  // running down a top rail branches at every bay: down the pillar and up the arch at the same instant.
  const VZ = 29, RAIL = [0.21, 0.21];
  const PH = NAVE_Y1 - (NAVE_Y0 - 400);
  for (let k = 0; k < VZ; k++) {
    const z = -(k * 80 + 40), d0 = -z;
    for (let si = 0; si < 2; si++) {
      const sx = si ? 1 : -1;
      push([sx * NAVE_X, NAVE_Y1, z], [sx * NAVE_X, NAVE_Y0 - 400, z], d0, d0 + PH, RAIL[si], 4.0);
      const span = NAVE_X * 2, rad = span * 0.8, steps = 18, cx = -sx * (rad - NAVE_X), ang1 = Math.acos((rad - NAVE_X) / rad);
      let prev = null, t = 0;
      for (let q = 0; q <= steps; q++) {
        const ang = ang1 * q / steps; const p = [cx + sx * rad * Math.cos(ang), NAVE_Y1 + rad * Math.sin(ang), z];
        if (prev) { const L = Math.hypot(p[0] - prev[0], p[1] - prev[1]); push(prev, p, d0 + t, d0 + t + L, RAIL[si], k % 2 === 0 ? 3.4 : 2.2); t += L; }
        prev = p;
      }
      if (k < VZ - 1) push([sx * NAVE_X, NAVE_Y1, z], [sx * NAVE_X, NAVE_Y1, z - 80], d0, d0 + 80, RAIL[si], 2.6);
    }
  }
  for (const fx of [-90, -30, 30, 90]) push([fx, NAVE_Y0, -40], [fx, NAVE_Y0, NAVE_Z], 40, -NAVE_Z, 0.43 + Math.abs(fx) * 0.0013 + (fx > 0 ? 0.05 : 0), 2.6);
  // rose window of light closing the nave
  { const rc = [0, 330, -2560], RR = 300; let prev = null, tt = 0;
    for (let q = 0; q <= 96; q++) { const a = q / 96 * Math.PI * 2; const p = [rc[0] + Math.sin(a) * RR, rc[1] + Math.cos(a) * RR, rc[2]]; if (prev) { const L = Math.hypot(p[0] - prev[0], p[1] - prev[1]); push(prev, p, tt, tt + L, 0.83, 3.0); tt += L; } prev = p; }
    prev = null; tt = 0; for (let q = 0; q <= 48; q++) { const a = q / 48 * Math.PI * 2; const p = [rc[0] + Math.sin(a) * 110, rc[1] + Math.cos(a) * 110, rc[2]]; if (prev) { const L = Math.hypot(p[0] - prev[0], p[1] - prev[1]); push(prev, p, tt, tt + L, 0.91, 2.6); tt += L; } prev = p; }
    for (let q = 0; q < 12; q++) { const a = q / 12 * Math.PI * 2; push([rc[0] + Math.sin(a) * 110, rc[1] + Math.cos(a) * 110, rc[2]], [rc[0] + Math.sin(a) * RR, rc[1] + Math.cos(a) * RR, rc[2]], 0, RR - 110, 0.29 + q * 0.001, 2.4); } }
  const ridge = NAVE_Y1 + Math.sqrt(Math.pow(NAVE_X * 1.6, 2) - Math.pow(NAVE_X * 0.6, 2));
  push([0, ridge, -40], [0, ridge, NAVE_Z], 40, -NAVE_Z, 0.67, 2.6);
  // superstructure: giant beams far away
  for (let i = -4; i <= 4; i++) for (let k = 0; k < 9; k++) {
    if (Math.abs(i) < 1) continue;
    const x = i * 420, z = -(k * 420 + 300);
    push([x, -1600, z], [x, 1800, z], -1600, 1800, hseed(i * 31 + k * 7 + 0.9), 0.9);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aT', new THREE.Float32BufferAttribute(aT, 1));
  g.setAttribute('aSeed', new THREE.Float32BufferAttribute(aSeed, 1)); g.setAttribute('aB', new THREE.Float32BufferAttribute(aB, 1));
  const uniforms = { uTime: { value: 0 }, uFade: { value: 650 }, uGain: { value: 1 }, uCam: { value: new THREE.Vector3(0, 0, 9999) } };
  const mat = new THREE.ShaderMaterial({ uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aT,aSeed,aB; uniform vec3 uCam; varying float vT,vSeed,vB,vD,vZ,vNear; void main(){ vT=aT; vSeed=aSeed; vB=aB; vZ=-position.z; vNear=exp(-length(position-uCam)/170.); vec4 mv=modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform float uTime,uFade,uGain; varying float vT,vSeed,vB,vD,vZ,vNear;
      float train(float t, float x, float sp, float per, float off, float tail){ float q=mod(t*sp - x + off, per); return exp(-q/tail)*0.7 + exp(-q/(tail*0.09))*2.0; }
      void main(){
        float s=vSeed; float nave=step(2.,vB);
        float dir=nave>0.5?1.:(fract(s*3.71)>.5?1.:-1.);
        float x=dir*vT;
        float sp=mix(90.+240.*fract(s*7.13), 300., nave);
        float per=mix(420.+800.*fract(s*11.17), 560., nave);
        float pulse=train(uTime,x,sp,per,s*5000.,mix(70.,110.,nave));
        pulse+=train(uTime,x,sp*0.61,per*1.37,s*9137.+211.,60.)*mix(step(0.35,fract(s*13.7)),0.8,nave);
        pulse*=mix(step(0.25,fract(s*5.31)),1.,nave);
        float wf=mod(uTime*380.,4600.)-200.; float wave=exp(-pow((vZ-wf)/110.,2.));
        float fade=exp(-max(vD-60.,0.)/(uFade*mix(1.,2.2,nave)))*smoothstep(4.,60.,vD); float pf=exp(-max(vD-60.,0.)/(uFade*1.8))*smoothstep(4.,60.,vD);
        vec3 base=vec3(0.36,0.58,1.0)*(0.026+0.065*vB)*mix(1.,1.8,nave)*(1.+wave*3.5);
        vec3 hot=mix(vec3(1.0,0.74,0.46),vec3(0.85,0.95,1.0),fract(s*2.9+nave*0.3))*pulse*1.7;
        gl_FragColor=vec4((base*fade*(1.+vNear*2.2)+hot*pf*(1.+vNear*1.8)+vec3(0.5,0.75,1.)*wave*0.12*pf*nave)*uGain,1.);
      }` });
  scene.add(new THREE.LineSegments(g, mat));
  // nodes
  const np = [], ns = [];
  for (let n = 0; n < 1400; n++) { const i = (Math.floor(R() * 2 * NX / 3) - Math.floor(NX / 3)) * 3, j = (Math.floor(R() * 4) - 1) * 4, k = Math.floor(R() * NZ / 2) * 2; const x = (i + 0.5) * S, y = (j + 0.5) * S, z = -(k * S + 30); if (nave(x, y, z)) continue; np.push(x, y, z); ns.push(R()); }
  const ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.Float32BufferAttribute(np, 3)); ng.setAttribute('aS', new THREE.Float32BufferAttribute(ns, 1));
  const nodeMat = new THREE.ShaderMaterial({ uniforms: { uTime: uniforms.uTime, uFade: uniforms.uFade, uGain: uniforms.uGain, uPx: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aS; uniform float uPx,uFade,uTime; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); float d=-mv.z; vA=exp(-max(d-60.,0.)/uFade)*smoothstep(4.,60.,d)*(0.5+0.5*sin(uTime*0.7+aS*40.)); gl_Position=projectionMatrix*mv; gl_PointSize=clamp(uPx*900./d,1.,7.*uPx); }`,
    fragmentShader: `uniform float uGain; varying float vA; void main(){ float r=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,r); gl_FragColor=vec4(vec3(0.75,0.88,1.)*a*a*vA*0.9*uGain,1.); }` });
  scene.add(new THREE.Points(ng, nodeMat));
  // twelve sealed chambers in side chapels along the nave; facets open when visited
  const chambers = [];
  const oct = new THREE.OctahedronGeometry(46, 0); const op = oct.attributes.position;
  const fp = [], fn = [];
  for (let f = 0; f < op.count; f += 3) {
    const A = new THREE.Vector3().fromBufferAttribute(op, f), B = new THREE.Vector3().fromBufferAttribute(op, f + 1), C = new THREE.Vector3().fromBufferAttribute(op, f + 2);
    const nrm = A.clone().add(B).add(C).normalize();
    for (const [P, Q] of [[A, B], [B, C], [C, A]]) { fp.push(P.x, P.y, P.z, Q.x, Q.y, Q.z); fn.push(nrm.x, nrm.y, nrm.z, nrm.x, nrm.y, nrm.z); }
  }
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3)); fg.setAttribute('aN', new THREE.Float32BufferAttribute(fn, 3));
  const one = new THREE.BufferGeometry(); one.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
  CH.forEach((c, i) => {
    const g = new THREE.Group(); g.position.set(c[0], c[1], c[2]); scene.add(g);
    const u = { uTime: uniforms.uTime, uOpen: { value: 0 }, uNear: { value: 0 }, uSeed: { value: i * 1.37 }, uPx: null };
    const m = new THREE.ShaderMaterial({ uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec3 aN; uniform float uOpen; varying float vY; void main(){ vY=position.y; vec3 p=position*(1.+uOpen*0.25)+aN*uOpen*38.; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
      fragmentShader: `uniform float uTime,uOpen,uNear,uSeed; varying float vY; void main(){ float b=0.5+0.5*sin(uTime*1.1+uSeed*4.+vY*0.05); gl_FragColor=vec4(vec3(1.0,0.76,0.48)*(0.30+0.18*b)*(1.+uNear*1.4+uOpen*1.6),1.); }` });
    const lines = new THREE.LineSegments(fg, m); g.add(lines);
    const gu = { uTime: uniforms.uTime, uOpen: u.uOpen, uNear: u.uNear, uSeed: u.uSeed, uPx: nodeMat.uniforms.uPx };
    const gm = new THREE.ShaderMaterial({ uniforms: gu, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `uniform float uPx,uTime,uSeed,uOpen,uNear; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); float b=0.5+0.5*sin(uTime*1.2+uSeed*9.); vA=(0.45+0.75*b*b)*(1.+uNear*0.6+uOpen*0.7); gl_Position=projectionMatrix*mv; gl_PointSize=uPx*clamp(46000.*(1.+uOpen*0.25)/-mv.z,8.,260.); }`,
      fragmentShader: `varying float vA; void main(){ float r=length(gl_PointCoord-.5)*2.; float core=exp(-r*r*18.); float halo=exp(-r*r*4.)*0.35; gl_FragColor=vec4(vec3(1.0,0.72,0.42)*(core*1.6+halo)*vA*(1.-smoothstep(.8,1.,r)),1.); }` });
    const glow = new THREE.Points(one, gm); glow.frustumCulled = false; g.add(glow);
    chambers.push({ g, lines, u, pos: new THREE.Vector3(c[0], c[1], c[2]), open: 0, near: 0 });
  });
  // motes of light drifting toward the viewer
  const MN = 1800, mp = new Float32Array(MN * 3), ms = new Float32Array(MN);
  for (let i = 0; i < MN; i++) { mp[i * 3] = R() * 2 - 1; mp[i * 3 + 1] = R() * 2 - 1; mp[i * 3 + 2] = R(); ms[i] = R(); }
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3)); mg.setAttribute('aS', new THREE.BufferAttribute(ms, 1));
  const moteMat = new THREE.ShaderMaterial({ uniforms: { uTime: uniforms.uTime, uPx: nodeMat.uniforms.uPx, uCam: { value: new THREE.Vector3() } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aS; uniform float uTime,uPx; uniform vec3 uCam; varying float vA; varying float vW;
      void main(){ float L=1300.; float zz=mod(position.z*L+uTime*(14.+aS*34.),L);
        vec3 p=vec3(uCam.x+position.x*520.+sin(uTime*0.3+aS*30.)*14., uCam.y+position.y*340.+40.+cos(uTime*0.23+aS*17.)*10., uCam.z-L+zz+30.);
        p.z=min(p.z,-12.);
        vec4 mv=modelViewMatrix*vec4(p,1.); float d=-mv.z; vA=smoothstep(0.,260.,zz)*smoothstep(L,L-220.,zz)*smoothstep(8.,60.,d)*(0.55+0.45*sin(uTime*2.+aS*50.)); vW=aS;
        gl_Position=projectionMatrix*mv; gl_PointSize=uPx*clamp(2600./d,1.2,9.); }`,
    fragmentShader: `varying float vA; varying float vW; void main(){ float r=length(gl_PointCoord-.5)*2.; float a=exp(-r*r*5.)*(1.-smoothstep(.8,1.,r)); vec3 c=mix(vec3(0.7,0.85,1.),vec3(1.,0.8,0.55),step(0.7,vW)); gl_FragColor=vec4(c*a*vA*0.9,1.); }` });
  const motes = new THREE.Points(mg, moteMat); motes.frustumCulled = false; scene.add(motes);
  // sky / haze
  const sky = new THREE.Mesh(new THREE.SphereGeometry(7000, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
    vertexShader: `varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vD; void main(){ float f=max(-vD.z,0.); vec3 c=vec3(0.0015,0.0025,0.006)+vec3(0.006,0.013,0.028)*pow(f,7.)+vec3(0.06,0.04,0.02)*pow(f,24.)*0.6; c*=0.85+0.15*smoothstep(-.6,.4,vD.y); gl_FragColor=vec4(c,1.); }` }));
  sky.frustumCulled = false; sky.renderOrder = -1; scene.add(sky);
  return { scene, uniforms, nodeMat, sky, chambers, moteMat, NAVE: { x: NAVE_X, z0: -40, z1: NAVE_Z } };
}
