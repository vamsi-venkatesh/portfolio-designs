// "Dawn" — the world for a visitor who is looking for work (2026-11-01).
// A painterly heightfield landscape at first light, raymarched in one fragment shader (raw WebGL2).
// Hold to walk the path toward the sunrise; two lanterns (Conxto, Conxfolio) bloom as you reach them.
// Copy comes only from ctx (content.mjs). No innerHTML. No network except Google Fonts.

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..600,0..100;1,9..144,300..600,0..100&family=Figtree:wght@400;500;600&display=swap';

// ---------- terrain (identical maths in JS and GLSL) ----------
function hashu(ix, iz) {
  let h = (Math.imul(ix >>> 0, 1597334673) ^ Math.imul(iz >>> 0, 3812015801)) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0; h = Math.imul(h, 2246822519) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0; h = Math.imul(h, 3266489917) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967295;
}
function vn(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hashu(ix, iz), b = hashu(ix + 1, iz), c = hashu(ix, iz + 1), d = hashu(ix + 1, iz + 1);
  return (a + (b - a) * ux) * (1 - uz) + (c + (d - c) * ux) * uz;
}
function fbm(x, z, oct) {
  let s = 0, a = 0.5;
  for (let k = 0; k < oct; k++) {
    s += a * vn(x, z);
    const nx = (0.8 * x - 0.6 * z) * 2.03 + 17.1, nz = (0.6 * x + 0.8 * z) * 2.03 + 9.3;
    x = nx; z = nz; a *= 0.5;
  }
  return s;
}
const pathX = (z) => 6 * Math.sin(z * 0.045) + 2.5 * Math.sin(z * 0.13 + 1.3);
const baseY = (z) => 1.2 * Math.sin(z * 0.06 + 0.5);
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function terrain(x, z, oct) {
  const d = Math.abs(x - pathX(z));
  const meadow = (fbm(x * 0.07, z * 0.07, Math.min(oct, 3)) - 0.47) * 4.0;
  let hills = fbm(x * 0.011 + 3.1, z * 0.011 + 7.7, oct);
  hills = Math.max(hills - 0.3, 0) * 95;
  return baseY(z) + meadow * sstep(0.8, 6, d) + hills * sstep(5, 60, d) - 0.12 * (1 - sstep(0.7, 1.3, d));
}

const VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

const POST = `#version 300 es
precision highp float;
uniform sampler2D S; uniform vec2 R; uniform float T; out vec4 O;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
void main(){
  vec2 inv = 1./R, uv = gl_FragCoord.xy*inv;
  vec3 nw = texture(S, uv + vec2(-1.,-1.)*inv).rgb, ne = texture(S, uv + vec2(1.,-1.)*inv).rgb;
  vec3 sw = texture(S, uv + vec2(-1.,1.)*inv).rgb,  se = texture(S, uv + vec2(1.,1.)*inv).rgb;
  vec3 m = texture(S, uv).rgb; vec3 lw = vec3(.299,.587,.114);
  float a = dot(nw,lw), b = dot(ne,lw), c = dot(sw,lw), d = dot(se,lw), e = dot(m,lw);
  float lo = min(e, min(min(a,b), min(c,d))), hi = max(e, max(max(a,b), max(c,d)));
  vec2 dir = vec2(-((a+b)-(c+d)), (a+c)-(b+d));
  float red = max((a+b+c+d)*(.25/8.), 1./128.);
  float rcp = 1./(min(abs(dir.x), abs(dir.y)) + red);
  dir = clamp(dir*rcp, -8., 8.)*inv;
  vec3 A = .5*(texture(S, uv + dir*(1./3.-.5)).rgb + texture(S, uv + dir*(2./3.-.5)).rgb);
  vec3 B = A*.5 + .25*(texture(S, uv - dir*.5).rgb + texture(S, uv + dir*.5).rgb);
  float lb = dot(B, lw);
  vec3 col = (lb < lo || lb > hi) ? A : B;
  col += (h(gl_FragCoord.xy + fract(T*7.)*vec2(91.,37.)) - .5)*.014;
  O = vec4(col, 1.);
}`;

const FRAG = `#version 300 es
precision highp float; precision highp int;
out vec4 O;
uniform vec2 R; uniform float T; uniform float DAY; uniform float MIST;
uniform vec3 C, F, RT, U; uniform float TH;
uniform vec3 SD;
uniform vec4 L[16]; uniform vec4 LC[16];
uniform float STEPS;

uint hu(ivec2 q){ uvec2 p = uvec2(q); uint h = (p.x*1597334673u) ^ (p.y*3812015801u);
  h ^= h>>16; h *= 2246822519u; h ^= h>>13; h *= 3266489917u; h ^= h>>16; return h; }
float hs(vec2 i){ return float(hu(ivec2(i)))/4294967295.0; }
float vn(vec2 x){ vec2 i=floor(x); vec2 f=x-i; vec2 u=f*f*(3.-2.*f);
  float a=hs(i), b=hs(i+vec2(1,0)), c=hs(i+vec2(0,1)), d=hs(i+vec2(1,1));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y); }
float fbm(vec2 x, int oct){ float s=0., a=.5;
  for(int k=0;k<6;k++){ if(k>=oct) break; s+=a*vn(x); x = vec2(.8*x.x-.6*x.y, .6*x.x+.8*x.y)*2.03 + vec2(17.1,9.3); a*=.5; }
  return s; }
float pathX(float z){ return 6.*sin(z*.045)+2.5*sin(z*.13+1.3); }
float baseY(float z){ return 1.2*sin(z*.06+.5); }
float terr(vec2 q, int oct){
  float d = abs(q.x - pathX(q.y));
  float meadow = (fbm(q*.07, min(oct,3)) - .47)*4.;
  float hills = max(fbm(q*.011+vec2(3.1,7.7), oct)-.3, 0.)*95.;
  return baseY(q.y) + meadow*smoothstep(.8,6.,d) + hills*smoothstep(5.,60.,d) - .12*(1.-smoothstep(.7,1.3,d));
}

vec3 sky(vec3 rd, bool disc, bool clouds){
  float y = max(rd.y, 0.);
  vec3 zen = mix(vec3(.04,.07,.18), vec3(.20,.42,.70), DAY);
  vec3 mid = mix(vec3(.12,.22,.40), vec3(.52,.70,.88), DAY);
  vec3 hor = mix(vec3(.86,.46,.30), vec3(1.0,.83,.62), DAY);
  vec3 c = mix(hor, mid, smoothstep(0., .22, y));
  c = mix(c, zen, smoothstep(.18, .9, y));
  float s = max(dot(rd, SD), 0.);
  c += vec3(1.,.55,.25)*pow(s,5.)*(.35+.45*DAY);
  c += vec3(1.,.80,.55)*pow(s,48.)*(.6+.6*DAY);
  // painterly clouds: a band of soft cumulus lit from the sun side
  if (clouds && rd.y > 0.) {
    vec2 cu = rd.xz/(rd.y+.09)*1.3 + vec2(T*.006, 0.);
    float n = fbm(cu*vec2(1.,2.2), 5);
    float m = smoothstep(.54, .78, n) * smoothstep(.0, .06, rd.y) * (1.-smoothstep(.35,.7,rd.y));
    vec3 cc = mix(vec3(.42,.46,.58)*(.55+.6*DAY), vec3(1.,.84,.66)*(.9+.5*DAY), smoothstep(.52,.82,n));
    cc = mix(cc, vec3(1.,.70,.42)*1.6, pow(s,6.)*.8);
    c = mix(c, cc, m*.85);
  }
  if (disc) {
    c += vec3(1.,.9,.7)*6.*smoothstep(.99968, .99982, s);
    vec3 sr = normalize(cross(SD, vec3(0,1,0))); vec3 su = cross(sr, SD);
    float ang = atan(dot(rd, su), dot(rd, sr));
    float ray = fbm(vec2(ang*9., T*.05), 3);
    c += vec3(1.,.78,.5)*smoothstep(.45,.8,ray)*pow(s, 18.)*.32*smoothstep(-.02,.06,SD.y+.03);
  }
  return c;
}

// far ranges at the horizon, painted as flat washes
vec3 ranges(vec3 rd, vec3 c, int ro){
  float az = atan(rd.x, rd.z);
  float s = max(dot(rd, SD), 0.);
  for (int k=0;k<3;k++){
    float fk = float(k);
    float base = .016 - .006*fk, amp = .026 - .006*fk, fr = 2.4 + 3.5*fk;
    float r = base + amp*(fbm(vec2(az*fr + fk*13.1, fk*7.7), ro) - .45)*2.;
    if (rd.y < r) {
      vec3 haze = sky(vec3(rd.x, .02, rd.z), false, false);
      vec3 deep = mix(vec3(.10,.15,.27), vec3(.35,.45,.58), DAY);
      vec3 lc = mix(haze, deep, .22 + .22*fk);
      lc = mix(lc, vec3(1.,.72,.45)*(.8+.6*DAY), pow(s, 10.)*.55*(1.-fk*.25));
      float rim = exp(-(r - rd.y)*900.) * pow(s, 14.) * (.4+DAY);
      c = lc + vec3(1.,.78,.5)*rim*1.6;
    }
  }
  return c;
}

float shadow(vec3 p, vec3 l){
  float r = 1., t = .4 + .5*hs(gl_FragCoord.xy);
  for (int i=0;i<13;i++){
    vec3 q = p + l*t; float h = q.y - terr(q.xz, 3);
    r = min(r, 3.2*h/t); if (r < .01 || t > 160.) break;
    t += clamp(h*.7, .8, 18.);
  }
  return clamp(r, 0., 1.);
}

vec3 shade(vec3 ro, vec3 rd, float th, float s, vec3 sunCol){
  vec3 col;
    vec3 p = ro + rd*th;
    float e = .03 + .004*th;
    int oct = th < 50. ? 5 : 4;
    float hx = terr(p.xz+vec2(e,0), oct) - terr(p.xz-vec2(e,0), oct);
    float hz = terr(p.xz+vec2(0,e), oct) - terr(p.xz-vec2(0,e), oct);
    vec3 n = normalize(vec3(-hx, 2.*e, -hz));
    float d = abs(p.x - pathX(p.z));

    float v = fbm(p.xz*.05, 3);
    vec3 alb = mix(vec3(.20,.42,.14), vec3(.58,.60,.20), smoothstep(.36, .64, v));
    alb = mix(alb, vec3(.62,.50,.30), smoothstep(16., 38., p.y)*.55);
    float fo = smoothstep(.56, .63, fbm(p.xz*.03 + vec2(40., 3.), 3)) * smoothstep(7., 18., d);
    alb = mix(alb, vec3(.09,.19,.11), fo*.9);
    // path: worn earth, slightly ragged edges
    float pm = 1. - smoothstep(.5, .85, d + (vn(p.xz*2.7)-.5)*.3);
    alb = mix(alb, vec3(.80,.67,.48), pm);
    // flowers and seed heads in the near meadow
    vec2 fc = floor(p.xz*3.);
    if (th < 22. && d > 1.1 && hs(fc) < .05) {
      vec2 fp = fract(p.xz*3.) - .5;
      float fl = 1. - smoothstep(.06, .12, length(fp));
      alb = mix(alb, hs(fc+3.) < .5 ? vec3(1.,.93,.70) : vec3(1.,.72,.40), fl);
    }

    float dif = clamp(dot(n, SD)*.9 + .1, 0., 1.);
    float sh = (th < 200. && dot(n, SD) > -.1) ? shadow(p + n*.08, SD) : 1.;
    float li = dif*mix(sh, 1., .22);
    li = mix(li, floor(li*3.+.5)/3., .14);                     // soft paint bands
    vec3 amb = mix(vec3(.08,.12,.24), vec3(.30,.40,.56), DAY) * (.55 + .45*n.y);
    col = alb*(sunCol*li + amb);
    // backlit grass glows where we look toward the sun
    col += alb*vec3(1.,.78,.42)*pow(s, 3.)*.9*DAY*sh*smoothstep(.3,1.,n.y);
    // brush variation
    col *= .92 + .16*vn(p.xz*vec2(.6, 2.4) + n.xz*3.);
    // lantern light pools on the ground
    for (int i=0;i<16;i++){
      if (L[i].w <= .001) continue;
      vec3 dl = p - L[i].xyz; float q = dot(dl,dl);
      if (q < 900.) col += alb*LC[i].rgb*L[i].w*1.8/(1. + q*.55);
    }
    // aerial perspective
    vec3 fogc = ranges(rd, sky(normalize(vec3(rd.x, max(rd.y,.0), rd.z)), false, false), 2);
    float fa = max(1. - exp(-th*(.0042 + .006*(1.-DAY))), smoothstep(240., 520., th));
    col = mix(col, fogc, fa);
  return col;
}

void main(){
  vec2 uv = (gl_FragCoord.xy*2. - R)/R.y;
  vec3 ro = C, rd = normalize(F + uv.x*TH*RT + uv.y*TH*U);
  float s = max(dot(rd, SD), 0.);

  // ---- march the heightfield ----
  float t = .3 + .2*hs(gl_FragCoord.xy+7.), tp = t, th = -1., minr = 1e9, tmin = 0.;
  int maxI = int(STEPS);
  for (int i=0;i<170;i++){
    if (i >= maxI) break;
    vec3 p = ro + rd*t;
    int oct = t < 40. ? 5 : (t < 110. ? 4 : (t < 260. ? 3 : 2));
    float dh = p.y - terr(p.xz, oct);
    if (dh < .002*t) {
      float a = tp, b = t;               // refine
      for (int j=0;j<5;j++){ float m=(a+b)*.5; vec3 q=ro+rd*m; if (q.y - terr(q.xz, oct) < 0.) b=m; else a=m; }
      th = b; break;
    }
    if (t > 4. && dh/t < minr) { minr = dh/t; tmin = t; }
    tp = t;
    t += max(dh*.42, .007*t + .01);
    if (t > 520. || p.y > 120.) break;
  }

  vec3 col;
  vec3 sunCol = mix(vec3(1.,.42,.18), vec3(1.,.84,.64), DAY) * (2.3*DAY + .12);
  if (th > 0.) {
    col = shade(ro, rd, th, s, sunCol);
  } else {
    col = ranges(rd, sky(rd, true, true), 4);
    float cov = 1. - smoothstep(0., 1.6*2.*TH/R.y, minr);
    if (cov > .01 && tmin < 515.) col = mix(col, shade(ro, rd, tmin, s, sunCol), cov*.9);
    th = 600.;
    // birds: a small loose flock drifting across the dawn
    float az = atan(rd.x, rd.z), el = asin(clamp(rd.y,-1.,1.));
    for (int i=0;i<6;i++){
      float fi = float(i);
      float bz = .55 - mod(T*.016 + fi*.021 + (i>2? .05:0.), 1.4);
      float be = .085 + .012*sin(T*.4 + fi*1.7) + fi*.006 + (i>2? -.018 : 0.);
      float sz = .0055;
      vec2 q = vec2(az - bz, el - be)/sz;
      if (abs(q.x) < 1.2 && abs(q.y) < 1.2) {
        float fl = sin(T*7. + fi*2.1);
        float ax = abs(q.x);
        float wing = (ax - ax*ax*.45)*(.35 + .55*fl);
        float dd = abs(q.y - wing);
        float m = (1.-smoothstep(.07, .16, dd)) * (1.-smoothstep(.9, 1.15, ax));
        col = mix(col, vec3(.16,.12,.12)*(.6+.6*DAY), m*.8);
      }
    }
  }

  // ---- valley mist (height fog), lifting as the sun climbs ----
  {
    float mb = -1.2, k = .75;
    float y0 = ro.y - mb;
    float tt = min(th, 280.);
    float ry = rd.y;
    float integ = abs(ry) < 1e-3 ? exp(-k*y0)*tt : exp(-k*y0)*(1. - exp(-k*ry*tt))/(k*ry);
    vec3 pe = ro + rd*min(tt, 120.);
    float mpatch = .55 + .9*fbm(pe.xz*.018 + vec2(T*.012, T*.006), 3);
    float ma = 1. - exp(-MIST*integ*mpatch);
    vec3 mc = mix(vec3(.32,.40,.56), vec3(.96,.90,.80), DAY) + vec3(1.,.74,.45)*pow(s,3.)*(.3+1.2*DAY);
    col = mix(col, mc, clamp(ma, 0., .85));
  }

  // ---- lanterns + waystones (geometry) and their light (glow) ----
  for (int i=0;i<16;i++){
    if (L[i].w <= 0.001) continue;
    vec3 v = L[i].xyz - ro; float zc = dot(v, F);
    if (zc < .4) continue;
    float k = 1./(zc*TH);
    vec2 sp = vec2(dot(v, RT), dot(v, U))*k;
    vec2 dv = uv - sp; float dd = length(dv);
    float dist = length(v);
    bool vis = th > dist - .6;
    vec3 dark = vec3(.10,.07,.06)*(.5+.5*DAY);
    if (vis && zc < 140.) {
      if (LC[i].w < .5) {
        float post = step(abs(dv.x), .03*k) * step(-1.05*k, dv.y) * step(dv.y, -.16*k);
        float roof = step(abs(dv.x), (.22 - (dv.y/k - .18)*.9)*k) * step(.15*k, dv.y) * step(dv.y, .27*k);
        col = mix(col, dark, max(post, roof)*.92);
        float body = step(abs(dv.x), .14*k) * step(abs(dv.y), .15*k);
        col = mix(col, LC[i].rgb*(1.2 + L[i].w*.8), body);
      } else {
        // a waystone: a small cairn of stacked stones with a light resting on top
        vec2 q = dv/k;
        float st = 0.; float sh2 = 0.;
        for (int j=0;j<3;j++){
          float fj = float(j);
          vec2 c = vec2(.02*sin(fj*2.3), -.93 + fj*.31);
          vec2 rr = vec2(.40 - fj*.10, .19 - fj*.03);
          vec2 e = (q - c)/rr;
          float m = 1. - smoothstep(.92, 1.0, dot(e,e));
          if (m > st) { st = m; sh2 = .55 + .45*smoothstep(-.6, .7, -e.x*.5 + e.y); }
        }
        vec3 sc = mix(vec3(.26,.24,.22), vec3(.62,.56,.46), DAY) * sh2;
        col = mix(col, sc, st);
        float orb = 1. - smoothstep(.09*k, .12*k, dd);
        col = mix(col, LC[i].rgb*(1.3 + L[i].w*.7), orb);
      }
    }
    float r = clamp(.16*k, .010, .075) * (1. + .25*L[i].w);
    float atten = exp(-dist*.0025);
    float g = L[i].w*atten*(exp(-dd*dd/(r*r))*1.4 + .32*exp(-dd/(r*3.5)) + .09*exp(-dd/(r*18.)));
    col += LC[i].rgb*g;
  }

  // ---- motes of pollen catching the light near the sun ----
  for (int l=0;l<2;l++){
    float sc = 7. + float(l)*5.;
    vec2 q = uv*sc + vec2(T*.05*(1.+float(l)), -T*.03);
    vec2 ci = floor(q), cf = fract(q) - .5;
    float h = hs(ci + float(l)*31.);
    if (h < .09) {
      vec2 o = vec2(hs(ci+7.), hs(ci+11.)) - .5;
      o += .15*vec2(sin(T*.7+h*40.), cos(T*.5+h*30.));
      float m = 1. - smoothstep(.0, .045, length(cf - o*.7));
      col += vec3(1.,.86,.6)*m*(.15 + .9*pow(s, 2.))*DAY*.8;
    }
  }

  // ---- grade ----
  col = 1. - exp(-col*1.18);
  col = pow(col, vec3(.96, 1., 1.06));
  vec2 vq = gl_FragCoord.xy/R - .5;
  col *= 1. - .32*dot(vq, vq)*1.6;
  O = vec4(col, 1.);
}`;

const CSS = `
.dawn{position:absolute;inset:0;overflow:hidden;background:#1d2a45;color:#fff8ec;font-family:'Figtree',system-ui,sans-serif;
  -webkit-user-select:none;user-select:none;touch-action:none;-webkit-tap-highlight-color:transparent;cursor:default}
.dawn canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.dawn button{font:inherit;color:inherit}
.dawn a{color:inherit;text-decoration:underline;text-decoration-color:rgba(214,128,40,.65);text-decoration-thickness:1.5px;text-underline-offset:4px}
.dawn a:hover{text-decoration-color:#d6801f}
.dawn :focus-visible{outline:2px solid #e8952e;outline-offset:3px;border-radius:6px}
.dawn-head{position:absolute;left:0;right:0;top:clamp(104px,17vh,190px);text-align:center;padding:0 22px;pointer-events:none;opacity:0}
.dawn-head h1{margin:0;font-family:'Fraunces',Georgia,serif;font-variation-settings:"SOFT" 100,"opsz" 144;font-weight:330;
  font-size:clamp(40px,6.2vw,96px);line-height:1.02;letter-spacing:-.022em;color:#fffaf1;text-wrap:balance;
  text-shadow:0 2px 40px rgba(70,30,0,.38),0 1px 3px rgba(70,30,0,.18)}
.dawn-head h1 em{display:block;font-style:italic;font-weight:300;color:#ffe3b4}
.dawn-head p{text-wrap:balance;margin:22px auto 0;max-width:34em;font-size:clamp(15px,1.25vw,18px);line-height:1.5;color:rgba(255,246,232,.95);
  text-shadow:0 1px 18px rgba(40,20,0,.6),0 0 2px rgba(60,30,0,.45)}

/* vellum: the one material for everything you read here */
.vellum{color:#2b1d10;-webkit-user-select:text;user-select:text;touch-action:pan-y;box-sizing:border-box;
  background:linear-gradient(170deg,rgba(255,250,239,.95),rgba(255,239,212,.90));
  box-shadow:0 40px 90px -30px rgba(110,50,0,.55),0 0 0 1px rgba(255,255,255,.55) inset,0 0 60px -10px rgba(255,190,110,.5);
  -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.vellum .eyebrow{margin:0 0 6px;font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:15px;color:#9a5a1c}
.vellum h2{margin:0;font-family:'Fraunces',Georgia,serif;font-variation-settings:"SOFT" 100,"opsz" 96;font-weight:420;
  font-size:clamp(34px,3.2vw,50px);line-height:1.02;letter-spacing:-.02em;color:#24170b;text-wrap:balance}
.vellum h3{margin:30px 0 10px;font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:400;font-size:21px;color:#8c4f14}
.vellum h4{margin:0 0 4px;font-family:'Fraunces',Georgia,serif;font-weight:500;font-size:18px;color:#24170b;font-variation-settings:"SOFT" 100}
.vellum p{margin:0 0 12px;font-size:16px;line-height:1.6;color:#33241a}
.vellum .kind{margin:8px 0 0;font-size:14px;color:#7a5b3c}
.vellum .lede{margin:16px 0 0;font-family:'Fraunces',Georgia,serif;font-size:21px;line-height:1.4;color:#2b1d10;font-style:italic;font-weight:350}
.vellum ul.dots{margin:0;padding:0;list-style:none}
.vellum ul.dots li{position:relative;padding:0 0 0 22px;margin:0 0 9px;font-size:15.5px;line-height:1.5;color:#3a2a1c}
.vellum ul.dots li::before{content:"";position:absolute;left:3px;top:.55em;width:8px;height:8px;border-radius:50%;
  background:radial-gradient(circle,#ffd27a 0,#f2a33a 55%,rgba(242,163,58,0) 72%);box-shadow:0 0 10px 2px rgba(255,180,80,.55)}
.vellum .nums{font-family:'Fraunces',Georgia,serif;font-size:17px;line-height:1.5;color:#3a2a1c}
.vellum .nums b,.vellum .fig b{font-weight:500;font-size:1.3em;color:#1f140a;font-variation-settings:"SOFT" 100,"opsz" 72}
.vellum .acts{margin:18px 0 0;display:flex;flex-wrap:wrap;align-items:center;gap:8px 22px}
.vellum .acts a,.vellum .go{font-weight:600;font-size:15px;color:#7a3f08}
.vellum .go{background:none;border:0;padding:0;cursor:pointer;text-decoration:underline;text-decoration-color:rgba(214,128,40,.65);
  text-decoration-thickness:1.5px;text-underline-offset:4px}
.vellum .go.big{font-family:'Fraunces',Georgia,serif;font-size:19px;font-weight:500;font-style:italic}

/* the card that rises when you reach a place */
.dawn-card{position:absolute;top:50%;width:min(400px,34vw);max-height:calc(100% - 220px);overflow:auto;padding:28px 30px 26px;border-radius:28px;
  opacity:0;pointer-events:none;will-change:transform,opacity;scrollbar-width:thin}
.dawn-card.l{left:max(28px,5vw)} .dawn-card.r{right:max(28px,5vw)}
.dawn-card.c{left:50%;width:min(640px,calc(100% - 48px));text-align:center;background:none;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none;color:#fffaf1;overflow:visible;-webkit-user-select:text;user-select:text}
.dawn-card.c{isolation:isolate}
.dawn-card.c::before{content:"";position:absolute;inset:-70px -60px;z-index:-1;background:radial-gradient(closest-side,rgba(70,34,8,.42),rgba(70,34,8,0));pointer-events:none}
.dawn-card.c h2{margin:0;font-family:'Fraunces',Georgia,serif;font-variation-settings:"SOFT" 100,"opsz" 144;color:#fffaf1;font-weight:320;font-size:clamp(32px,4.2vw,60px);line-height:1.08;letter-spacing:-.02em;text-wrap:balance;text-shadow:0 2px 40px rgba(90,40,0,.45)}
.dawn-card.c h2 em{font-style:italic;color:#ffe3b4}
.dawn-card.c p{font-size:16.5px;line-height:1.55;color:rgba(255,248,236,.95);text-shadow:0 1px 16px rgba(60,25,0,.6);max-width:34em;margin:16px auto 0}
.dawn-card.c .contact{margin:22px 0 0;display:flex;justify-content:center;flex-wrap:wrap;gap:8px 26px;font-family:'Fraunces',Georgia,serif;font-size:20px}
.dawn-card.c .contact a{text-decoration-color:rgba(255,214,150,.8)}

/* the reading sheet */
.dawn-sheet{position:absolute;top:84px;right:24px;bottom:24px;width:min(680px,50vw);border-radius:28px;overflow:hidden;display:flex;flex-direction:column;
  opacity:0;transform:translateX(36px);pointer-events:none;transition:opacity .45s ease,transform .6s cubic-bezier(.2,.8,.2,1);z-index:6;visibility:hidden}
.dawn-sheet.open{opacity:1;transform:none;pointer-events:auto;visibility:visible}
.dawn-sheet .bar{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 22px 12px 18px;
  border-bottom:1px solid rgba(140,80,20,.14)}
.dawn-sheet .bar button{white-space:nowrap;flex:none;background:none;border:0;cursor:pointer;font-weight:600;font-size:14.5px;color:#7a3f08;padding:6px 6px}
.dawn-sheet .bar .where{flex:1;min-width:0;text-align:right;font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:15px;color:#9a5a1c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dawn-sheet .read{flex:1;overflow:auto;padding:30px 40px 40px;overscroll-behavior:contain;scrollbar-width:thin;outline:none}
.case-steps{position:relative;margin:4px 0 0;padding:0 0 0 30px;list-style:none}
.case-steps::before{content:"";position:absolute;left:9px;top:8px;bottom:8px;width:2px;border-radius:2px;
  background:repeating-linear-gradient(180deg,rgba(176,110,40,.55) 0 6px,transparent 6px 11px)}
.case-steps li{position:relative;margin:0 0 16px}
.case-steps li::before{content:"";position:absolute;left:-26px;top:5px;width:12px;height:12px;border-radius:50%;
  background:radial-gradient(circle,#fff1c9 0,#f5b04c 60%,#d9822a 100%);box-shadow:0 0 12px 3px rgba(255,180,80,.55)}
.case-steps li p{margin:0}
.dec{margin:0 0 18px;padding:16px 18px;border-radius:18px;background:rgba(255,255,255,.45);box-shadow:0 0 0 1px rgba(170,110,40,.14) inset}
.dec p{margin:6px 0 0;font-size:15px}
.dec .t{font-style:italic;color:#6b4a2c}
.fig{margin:0 0 14px;font-family:'Fraunces',Georgia,serif;font-size:16.5px;line-height:1.45;color:#3a2a1c}
.fig small{display:block;font-family:'Figtree',system-ui,sans-serif;font-size:12.5px;color:#8a6a4a;margin-top:2px}
.ev{margin:0 0 16px}
.ev p{margin:4px 0 0;font-size:15px}
.ev small{font-size:12.5px;color:#8a6a4a}
.stack{font-size:15px;line-height:1.75;color:#4a3420}
.nav2{margin:34px 0 0;padding:22px 0 0;border-top:1px solid rgba(140,80,20,.16);display:flex;justify-content:space-between;gap:16px}
.nav2 .go{max-width:48%;text-align:left}
.nav2 .go:last-child{text-align:right;margin-left:auto}
.skill{margin:0 0 12px}
.skill p{margin:0;font-size:15.5px}
.skill .used{font-size:14px;color:#7a5b3c}
.skill .used .go{font-size:14px;font-weight:600}
.facts{margin:0;display:grid;grid-template-columns:max-content 1fr;gap:8px 18px}
.facts dt{font-family:'Fraunces',Georgia,serif;font-style:italic;color:#8c4f14;font-size:15.5px}
.facts dd{margin:0;font-size:15.5px;line-height:1.5}

/* labels over places ahead */
.dawn .dawn-tag{position:absolute;left:0;top:0;pointer-events:auto;background:none;border:0;padding:4px 6px;margin:0;cursor:pointer;
  color:#fff6e6;font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:15px;white-space:nowrap;
  text-shadow:0 1px 10px rgba(30,15,0,.8),0 0 2px rgba(30,15,0,.55);opacity:0;will-change:transform}

/* footer: map, path, sound */
.dawn-foot{position:absolute;left:0;right:0;bottom:0;height:130px;pointer-events:none;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.dawn-hint{position:absolute;left:50%;bottom:112px;transform:translateX(-50%);display:flex;align-items:center;gap:12px;white-space:nowrap;
  font-size:14.5px;color:rgba(255,248,236,.92);text-shadow:0 1px 12px rgba(40,20,0,.6);transition:opacity .8s}
.dawn-hint i{display:block;width:16px;height:16px;border-radius:50%;border:1.5px solid rgba(255,230,190,.9);position:relative}
.dawn-hint i::after{content:"";position:absolute;inset:3px;border-radius:50%;background:#ffd89a;animation:dawnPulse 1.8s ease-in-out infinite}
@keyframes dawnPulse{0%,100%{transform:scale(.5);opacity:.5}50%{transform:scale(1);opacity:1}}
.dawn-trail{position:absolute;left:50%;bottom:30px;transform:translateX(-50%);width:min(620px,calc(100% - 260px));height:40px;pointer-events:auto}
.dawn-trail .rail{position:absolute;left:0;right:0;top:12px;height:1.5px;background:rgba(255,240,215,.35);border-radius:2px}
.dawn-trail .fill{position:absolute;left:0;top:12px;height:1.5px;background:linear-gradient(90deg,rgba(255,220,160,.6),#ffd38a);border-radius:2px;box-shadow:0 0 10px rgba(255,200,120,.8)}
.dawn-trail .stop{position:absolute;top:2px;width:22px;height:22px;transform:translateX(-50%);background:none;border:0;padding:0;cursor:pointer;display:grid;place-items:center}
.dawn-trail .stop span{width:8px;height:8px;border-radius:50%;background:#1d2a45;border:1.5px solid #ffe0ae;transition:transform .3s}
.dawn-trail .stop.ws span{border-radius:2px;transform:rotate(45deg)}
.dawn-trail .stop.lit span{background:#ffd27a;box-shadow:0 0 12px 3px rgba(255,190,90,.75)}
.dawn-trail .stop.here span{transform:scale(1.5)}
.dawn-trail .stop.ws.here span{transform:rotate(45deg) scale(1.5)}
.dawn-trail .cap{position:absolute;left:0;right:0;top:-6px;transform:translateY(-100%);text-align:center;font-family:'Fraunces',Georgia,serif;font-style:italic;
  font-size:15px;color:#fff6e6;text-shadow:0 1px 10px rgba(30,15,0,.8);white-space:nowrap;pointer-events:none}
.dawn-fbtn{position:absolute;bottom:30px;pointer-events:auto;background:none;border:0;cursor:pointer;padding:6px 6px;
  color:rgba(255,246,230,.92);font:500 13.5px/1 'Figtree',system-ui,sans-serif;display:flex;align-items:center;gap:8px;text-shadow:0 1px 10px rgba(40,20,0,.7)}
.dawn-fbtn svg{width:22px;height:16px;overflow:visible}
.dawn-fbtn path{fill:none;stroke:#ffe0ae;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.dawn-map-btn{left:22px} .dawn-sound{right:20px}

/* the map */
.dawn-map{position:absolute;left:50%;top:50%;width:min(760px,calc(100% - 32px));max-height:calc(100% - 120px);transform:translate(-50%,-46%);opacity:0;pointer-events:none;
  border-radius:28px;overflow:auto;padding:26px 30px 28px;transition:opacity .35s ease,transform .5s cubic-bezier(.2,.8,.2,1);z-index:8;visibility:hidden}
.dawn-map.open{opacity:1;transform:translate(-50%,-50%);pointer-events:auto;visibility:visible}
.dawn-map .top{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.dawn-map .top button{background:none;border:0;cursor:pointer;font-weight:600;font-size:14.5px;color:#7a3f08}
.dawn-map svg.chart{display:block;width:100%;height:auto;margin:14px 0 6px}
.dawn-map .cols{display:grid;grid-template-columns:repeat(3,1fr);gap:4px 26px;margin-top:10px}
.dawn-map .cols h4{margin:14px 0 6px;font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:400;font-size:15px;color:#9a5a1c}
.dawn-map .cols button{display:block;background:none;border:0;padding:5px 0;cursor:pointer;text-align:left;font-size:15.5px;color:#2b1d10}
.dawn-map .cols button:hover{color:#9a4f0c}
.dawn-map .cols button small{display:block;color:#8a6a4a;font-size:12.5px}

/* still version */
.dawn-still{position:absolute;inset:0;overflow:auto;touch-action:pan-y;padding:110px 24px 60px;box-sizing:border-box;-webkit-user-select:text;user-select:text}
.dawn-still .dawn-head{position:relative;top:auto;opacity:1;padding:0}
.dawn-still .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:20px;max-width:1000px;margin:18px auto 0}
.dawn .dawn-still .dawn-card{position:relative;left:auto;right:auto;top:auto;bottom:auto;width:auto;max-height:none;opacity:1;pointer-events:auto;transform:none;margin:0}
.dawn-still .group{max-width:1000px;margin:44px auto 0;font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:400;font-size:22px;color:#fff6e6;text-shadow:0 1px 12px rgba(40,20,0,.6)}
.dawn-still .sec{max-width:1000px;margin:24px auto 0;border-radius:28px;padding:30px 34px}
.dawn .dawn-still .dawn-card.c{margin:56px auto 20px}
.dawn.still-mode .dawn-sheet,.dawn.still-mode .dawn-map{transition:none}

@media (max-width:700px){
  .dawn-head{top:96px}
  .dawn-head h1{font-size:clamp(34px,9.6vw,50px)}
  .dawn-head p{margin-top:16px;font-size:15px}
  .dawn-card,.dawn-card.l,.dawn-card.r{left:12px;right:12px;width:auto;top:auto;bottom:112px;max-height:31vh;padding:18px 20px 16px;border-radius:22px}
  .dawn-card h2{font-size:30px}
  .dawn-card.ws{max-height:40vh}
  .dawn-card.ws ul.dots li{margin-bottom:4px;font-size:15px}
  .dawn-card .lede{font-size:17px;margin-top:8px}
  .dawn-card .nums{display:none}
  .dawn-card .acts{margin-top:10px}
  .dawn-card.c{left:16px;right:16px;width:auto;bottom:auto;top:50%;max-height:none}
  .dawn-card.c h2{font-size:32px}
  .dawn-sheet{top:84px;left:0;right:0;bottom:0;width:auto;border-radius:24px 24px 0 0;transform:translateY(40px)}
  .dawn-sheet .read{padding:22px 20px 40px}
  .dawn-sheet .bar{padding:10px 14px 8px 10px}
  .vellum h3{margin-top:24px;font-size:19px}
  .dawn-trail{left:66px;right:58px;width:auto;transform:none}
  .dawn-trail .stop{width:18px}
  .dawn-trail .stop span{width:7px;height:7px}
  .dawn-map-btn{left:8px} .dawn-sound{right:6px}
  .dawn-fbtn span{display:none}
  .dawn-hint{bottom:112px;font-size:14px}
  .dawn-map{left:12px;right:12px;top:84px;bottom:76px;width:auto;max-height:none;padding:20px 18px 22px;transform:translateY(14px)}
  .dawn-map.open{transform:none}
  .dawn-map .cols{grid-template-columns:1fr 1fr}
  .dawn-map .cols > div:nth-child(3){grid-column:1/-1}
  .facts{grid-template-columns:1fr;gap:2px 0}
  .facts dd{margin-bottom:8px}
  .dawn-still{padding:100px 14px 40px}
  .dawn-still .sec{padding:22px 20px}
  .dawn .dawn-still .dawn-card{padding:20px 20px 18px}
  .dawn .dawn-still .dawn-card .nums{display:block}
}
@media (min-width:701px){ .dawn.reading .dawn-trail{transform:translateX(calc(-50% - 25vw))} .dawn.reading .dawn-sound{right:auto;left:110px} .dawn-trail{transition:transform .6s cubic-bezier(.2,.8,.2,1)} }
`;

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const link = (href, text, ext) => { const a = el('a', null, text); a.href = href; if (ext) { a.target = '_blank'; a.rel = 'noopener'; } return a; };
const caseUrl = (slug) => `https://vamsi-venkatesh.github.io/portfolio-designs/inside-the-dot/work/${slug}/`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (d) => { const m = String(d || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : (d || ''); };
const svgNS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs) => { const n = document.createElementNS(svgNS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

export default {
  id: 'seek',
  color: '#e3a97c',
  async mount(root, ctx) {
    const { person, work, principles, withdrawn, capabilities, about, cases, reduced } = ctx;
    const bySlug = Object.fromEntries(work.map((w) => [w.slug, w]));
    const byName = Object.fromEntries(work.map((w) => [w.name, w]));
    const FOR_YOU = ['conxto', 'conxfolio'];
    const ORDER = ['conxto', 'conxfolio', 'vvdex-platform', 'vvdex-engine', 'unboundpdf', 'farmquick', 'pitchradar', 'vvdex-trading'].filter((s) => bySlug[s]);
    work.forEach((w) => { if (!ORDER.includes(w.slug)) ORDER.push(w.slug); });

    const cleanups = [];
    const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); cleanups.push(() => t.removeEventListener(ev, fn, opt)); };

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet'; fontLink.href = FONT_HREF; document.head.appendChild(fontLink);
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    const wrap = el('div', 'dawn'); root.appendChild(wrap);
    if (reduced) wrap.classList.add('still-mode');
    const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden', 'true'); wrap.appendChild(canvas);
    // the stage never scrolls (focus or scrollIntoView could nudge an overflow:hidden box); only reading surfaces do
    const pin = (n) => () => { if (n.scrollLeft || n.scrollTop) { n.scrollLeft = 0; n.scrollTop = 0; } };
    on(wrap, 'scroll', pin(wrap)); on(root, 'scroll', pin(root));

    // ---------- places along the path ----------
    const SPACING = 28;
    const STOPS = [];
    ORDER.forEach((slug, i) => {
      const w = bySlug[slug];
      STOPS.push({ id: `work/${slug}`, kind: 'work', slug, name: w.name, w, z: 30 + i * SPACING, side: i % 2 ? -1.25 : 1.25, type: 0 });
    });
    const SECTIONS = [['principles', 'How I work'], ['withdrawn', 'Claims I withdrew'], ['capabilities', 'Capabilities'], ['about', 'About'], ['contact', 'Say hello']];
    SECTIONS.forEach(([id, name], i) => {
      STOPS.push({ id, kind: 'section', name, z: 30 + (ORDER.length + i) * SPACING + 2, side: i % 2 ? 1.35 : -1.35, type: 1 });
    });
    STOPS.forEach((s) => { s.x = pathX(s.z) + s.side; s.y = terrain(s.x, s.z, 5) + 1.1; s.view = s.z - 8; s.near = 0; });
    const contactStop = STOPS[STOPS.length - 1];
    contactStop.view = contactStop.z - 9;
    const END = contactStop.view;
    const stopById = Object.fromEntries(STOPS.map((s) => [s.id, s]));
    const LANT_RGB = [1.0, 0.72, 0.40], STONE_RGB = [1.0, 0.86, 0.66];

    // ---------- writing helpers ----------
    const numsOf = (w) => { const seen = new Set(); return (w.stage || []).concat(w.numbers || []).filter((n) => { if (seen.has(n[1])) return false; seen.add(n[1]); return true; }); };
    function prose(nums) {
      const p = el('p', 'nums');
      nums.forEach(([n, label], i) => { if (i) p.append(i === nums.length - 1 ? ', and ' : ', '); p.appendChild(el('b', null, n)); p.append(' ' + label); });
      p.append('.'); return p;
    }
    const go = (text, fn, cls) => { const b = el('button', `go${cls ? ' ' + cls : ''}`, text); b.type = 'button'; on(b, 'click', (e) => { e.stopPropagation(); fn(); }); return b; };
    const h3 = (t) => el('h3', null, t);
    const dots = (items) => { const ul = el('ul', 'dots'); items.forEach((t) => ul.appendChild(el('li', null, t))); return ul; };

    // ---------- a full case, in vellum ----------
    function caseView(slug) {
      const w = bySlug[slug], c = cases && cases[slug];
      const f = document.createDocumentFragment();
      f.appendChild(el('p', 'eyebrow', [FOR_YOU.includes(slug) ? 'Built for you' : null, c ? c.category : w.kind, c ? c.period : null].filter(Boolean).join(' · ')));
      f.appendChild(el('h2', null, w.name));
      f.appendChild(el('p', 'kind', `${c ? c.status : w.status}${w.url ? ' · ' + w.host : ''}`));
      f.appendChild(el('p', 'lede', c ? c.one_line : w.line));
      const acts = el('div', 'acts');
      if (w.url) acts.appendChild(link(w.url, `Open ${w.host} ↗`, true));
      acts.appendChild(link(caseUrl(slug), 'Full case on vamsivenkatesh.com →'));
      f.appendChild(acts);
      if (c) {
        f.appendChild(h3('In short')); f.appendChild(el('p', null, c.summary));
        f.appendChild(h3('My part')); f.appendChild(el('p', null, c.role));
        f.appendChild(h3('The problem')); f.appendChild(el('p', null, c.problem));
        if (c.constraints && c.constraints.length) { f.appendChild(h3('What it had to respect')); f.appendChild(dots(c.constraints)); }
        f.appendChild(h3('What I built'));
        c.built.forEach((b) => { const d = el('div', 'ev'); d.appendChild(el('h4', null, b.title)); d.appendChild(el('p', null, b.body)); f.appendChild(d); });
        f.appendChild(h3('How it works'));
        const ol = el('ol', 'case-steps');
        c.how_it_works.forEach((s) => { const li = el('li'); li.appendChild(el('h4', null, s.step)); li.appendChild(el('p', null, s.body)); ol.appendChild(li); });
        f.appendChild(ol);
        f.appendChild(h3('Decisions, and what they cost'));
        c.decisions.forEach((d) => {
          const box = el('div', 'dec'); box.appendChild(el('h4', null, d.decision));
          box.appendChild(el('p', null, d.why)); if (d.tradeoff) box.appendChild(el('p', 't', d.tradeoff)); f.appendChild(box);
        });
        f.appendChild(h3('How I checked it'));
        c.evaluation.forEach((e) => { const d = el('div', 'ev'); d.appendChild(el('h4', null, e.what)); d.appendChild(el('p', null, e.result)); if (e.date) d.appendChild(el('small', null, fmtDate(e.date))); f.appendChild(d); });
        f.appendChild(h3('Numbers'));
        c.numbers.forEach((n) => { const p = el('p', 'fig'); p.appendChild(el('b', null, n.value)); p.append(' ' + n.label); if (n.date) p.appendChild(el('small', null, fmtDate(n.date))); f.appendChild(p); });
        f.appendChild(h3('Built with')); f.appendChild(el('p', 'stack', c.stack.join(' · ')));
        f.appendChild(h3('Limits, honestly')); f.appendChild(dots(c.limits));
        f.appendChild(h3('Links'));
        const ls = el('ul', 'dots'); c.links.forEach((l) => { const li = el('li'); li.appendChild(link(l.url, l.label, true)); ls.appendChild(li); }); f.appendChild(ls);
      } else {
        f.appendChild(h3('The problem')); f.appendChild(el('p', null, w.problem));
        f.appendChild(h3('The plan')); f.appendChild(el('p', null, w.plan));
        f.appendChild(h3('What I built')); f.appendChild(dots(w.built));
        f.appendChild(h3('How it is checked')); f.appendChild(dots(w.checks));
        f.appendChild(h3('Numbers'));
        numsOf(w).forEach(([v, l]) => { const p = el('p', 'fig'); p.appendChild(el('b', null, v)); p.append(' ' + l); f.appendChild(p); });
        f.appendChild(h3('Links'));
        const ls = el('ul', 'dots');
        if (w.url) { const li = el('li'); li.appendChild(link(w.url, `${w.name} (${w.status.toLowerCase()})`, true)); ls.appendChild(li); }
        else ls.appendChild(el('li', null, `${w.host}: no public link.`));
        const li2 = el('li'); li2.appendChild(link(caseUrl(slug), 'Full case on vamsivenkatesh.com')); ls.appendChild(li2);
        f.appendChild(ls);
      }
      const i = ORDER.indexOf(slug);
      const nav = el('div', 'nav2');
      if (i > 0) nav.appendChild(go(`← ${bySlug[ORDER[i - 1]].name}`, () => visit(stopById[`work/${ORDER[i - 1]}`], { open: true, replace: true })));
      if (i < ORDER.length - 1) nav.appendChild(go(`${bySlug[ORDER[i + 1]].name} →`, () => visit(stopById[`work/${ORDER[i + 1]}`], { open: true, replace: true })));
      else nav.appendChild(go('How I work →', () => visit(stopById.principles, { open: true, replace: true })));
      f.appendChild(nav);
      return f;
    }

    // ---------- the waystone sections ----------
    function sectionView(id) {
      const f = document.createDocumentFragment();
      if (id === 'principles') {
        f.appendChild(el('p', 'eyebrow', 'A waystone')); f.appendChild(el('h2', null, 'How I work'));
        principles.forEach((p) => { f.appendChild(h3(p.k)); f.appendChild(el('p', null, p.v)); });
      } else if (id === 'withdrawn') {
        f.appendChild(el('p', 'eyebrow', 'A waystone')); f.appendChild(el('h2', null, 'Claims I withdrew'));
        withdrawn.forEach((x) => {
          f.appendChild(h3(x.title)); f.appendChild(el('p', null, x.what));
          f.appendChild(prose(x.numbers));
          if (x.link) { const a = el('div', 'acts'); a.appendChild(link(x.link[1], `${x.link[0]} ↗`, true)); f.appendChild(a); }
        });
      } else if (id === 'capabilities') {
        f.appendChild(el('p', 'eyebrow', 'A waystone')); f.appendChild(el('h2', null, 'Capabilities'));
        f.appendChild(el('p', 'kind', 'Each one names the products where it is in use. Follow a name to its case.'));
        capabilities.forEach(([group, skills]) => {
          f.appendChild(h3(group));
          skills.forEach(([skill, prods]) => {
            const d = el('div', 'skill'); d.appendChild(el('p', null, skill));
            const u = el('p', 'used'); u.append('In ');
            prods.forEach((name, j) => {
              if (j) u.append(j === prods.length - 1 ? ' and ' : ', ');
              const w = byName[name];
              if (w) u.appendChild(go(name, () => visit(stopById[`work/${w.slug}`], { open: true, replace: true }))); else u.append(name);
            });
            d.appendChild(u); f.appendChild(d);
          });
        });
      } else if (id === 'about') {
        f.appendChild(el('p', 'eyebrow', 'A waystone')); f.appendChild(el('h2', null, person.name));
        f.appendChild(el('p', 'kind', `${person.role} · ${person.city}`));
        f.appendChild(el('p', 'lede', person.lede));
        f.appendChild(h3('What I am looking for')); f.appendChild(el('p', null, person.wants));
        f.appendChild(el('p', 'kind', `${person.availability}. Roles: ${person.roles.join(', ')}.`));
        f.appendChild(h3('The facts'));
        const dl = el('dl', 'facts');
        about.facts.forEach(([k, v]) => { dl.appendChild(el('dt', null, k || '')); dl.appendChild(el('dd', null, v)); });
        f.appendChild(dl);
        const a = el('div', 'acts'); a.appendChild(go('Say hello →', () => { closeSheet(false); visit(contactStop, { push: true }); })); f.appendChild(a);
      }
      return f;
    }

    const mailSubject = encodeURIComponent('Hello Vamsi, from someone looking for work');
    function contactBlock() {
      const e = el('section', 'dawn-card c'); e.setAttribute('aria-label', 'Contact'); e.dataset.ui = '1';
      const h = el('h2'); h.append('Whatever you are walking toward, '); h.appendChild(el('em', null, 'I hope the morning is kind.'));
      e.appendChild(h);
      e.appendChild(el('p', null, `I'm ${person.name}, ${person.role} in ${person.city}. I'm looking too: ${person.availability.replace(/^Open/, 'open')}.`));
      const c = el('div', 'contact');
      c.appendChild(link(`mailto:${person.email}?subject=${mailSubject}`, person.email));
      c.appendChild(link(person.linkedin, 'LinkedIn', true));
      c.appendChild(link(person.github, 'GitHub', true));
      e.appendChild(c);
      return e;
    }

    // ---------- the card that rises at each place ----------
    function card(stop) {
      if (stop.id === 'contact') return contactBlock();
      const side = stop.side > 0 ? 'l' : 'r';
      const k = el('section', `dawn-card vellum ${side}${stop.kind === 'section' ? ' ws' : ''}`); k.dataset.ui = '1'; k.setAttribute('aria-label', stop.name);
      if (stop.kind === 'work') {
        const w = stop.w;
        k.appendChild(el('p', 'eyebrow', FOR_YOU.includes(w.slug) ? 'A lantern · built for you' : 'A lantern'));
        k.appendChild(el('h2', null, w.name));
        k.appendChild(el('p', 'kind', `${w.kind} · ${w.status}`));
        k.appendChild(el('p', 'lede', w.one));
        k.appendChild(prose(numsOf(w).slice(0, 2)));
        const a = el('div', 'acts');
        a.appendChild(go('Read the case', () => visit(stop, { open: true }), 'big'));
        if (w.url) a.appendChild(link(w.url, `${w.host} ↗`, true));
        k.appendChild(a);
      } else {
        k.appendChild(el('p', 'eyebrow', 'A waystone'));
        k.appendChild(el('h2', null, stop.name));
        const teaser = stop.id === 'principles' ? principles.map((p) => p.k)
          : stop.id === 'withdrawn' ? withdrawn.map((x) => x.title)
            : stop.id === 'capabilities' ? capabilities.map((g) => g[0])
              : [person.city, person.availability];
        k.appendChild(dots(teaser));
        const a = el('div', 'acts'); a.appendChild(go('Read', () => visit(stop, { open: true }), 'big')); k.appendChild(a);
      }
      return k;
    }

    // ---------- GL ----------
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    let prog = null, post = null, buf = null, tex = null, fbo = null, U = {}, PU = {};
    if (gl) {
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); return s; };
      const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG), ps = sh(gl.FRAGMENT_SHADER, POST);
      prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.bindAttribLocation(prog, 0, 'p'); gl.linkProgram(prog);
      post = gl.createProgram(); gl.attachShader(post, vs); gl.attachShader(post, ps); gl.bindAttribLocation(post, 0, 'p'); gl.linkProgram(post);
      gl.deleteShader(vs); gl.deleteShader(fs); gl.deleteShader(ps);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) console.warn(gl.getProgramInfoLog(prog));
      PU = { S: gl.getUniformLocation(post, 'S'), R: gl.getUniformLocation(post, 'R'), T: gl.getUniformLocation(post, 'T') };
      tex = gl.createTexture(); fbo = gl.createFramebuffer();
      buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      for (const n of ['R', 'T', 'DAY', 'MIST', 'C', 'F', 'RT', 'U', 'TH', 'SD', 'L', 'LC', 'STEPS']) U[n] = gl.getUniformLocation(prog, n);
    }

    const SUN_AZ = 0.10;
    const sunDir = (e) => [Math.sin(SUN_AZ) * Math.cos(e), Math.sin(e), Math.cos(SUN_AZ) * Math.cos(e)];

    // ---------- state ----------
    let W = 0, vel = 0, holding = false, dragY = null, dragMode = false, autoTarget = null, autoSpeed = 9;
    let time = 0, last = performance.now(), raf = 0, everWalked = false;
    let budget = ctx.isTouch ? 6e5 : 1.0e6, calmFor = 0, holdUpUntil = 0, frames = 0, ftAcc = 0;
    let camYaw = null, yawOff = 0, nearMax = 0, nearStop = null, sheetFor = null, sheetPushed = false, mapOpen = false;
    const cam = { p: [0, 0, 0], f: [0, 0, 1], r: [1, 0, 0], u: [0, 1, 0], th: 0.42 };
    const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const isPhone = () => wrap.clientWidth <= 700;

    function updateCamera(t) {
      const bob = Math.sin(W * 1.9) * 0.035 * Math.min(1, Math.abs(vel) / 4);
      const p = [pathX(W), baseY(W) + 1.65 + bob, W];
      const a = 16; const tgt = [pathX(W + a), baseY(W + a) + 1.65, W + a];
      let yaw = Math.atan2(tgt[0] - p[0], tgt[2] - p[2]);
      yaw = yaw * 0.7 + SUN_AZ * 0.3 + (reduced ? 0 : Math.sin(t * 0.13) * 0.012);
      const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
      const th = aspect >= 1 ? 0.42 : Math.min(0.46 / aspect * 0.55, 0.9);
      // reading on a wide screen: turn so the place you are reading about sits in the open left side
      let want = 0;
      if (isPhone() && !sheetFor && nearStop && nearMax > 0.05) {
        const az = Math.atan2(nearStop.x - p[0], nearStop.z - p[2]);
        want = (az - yaw) * 0.85 * nearMax;
      }
      if (sheetFor && !isPhone() && Math.abs(W - sheetFor.view) < 3) {
        const az = Math.atan2(sheetFor.x - p[0], sheetFor.z - p[2]);
        const sx = ((0.25 * wrap.clientWidth) - wrap.clientWidth / 2) / (wrap.clientHeight / 2);
        want = (az - Math.atan(sx * th)) - yaw;
      }
      yawOff += (want - yawOff) * (reduced ? 1 : 0.05);
      yaw += yawOff;
      camYaw = camYaw == null || reduced ? yaw : camYaw + (yaw - camYaw) * 0.08;
            const pitch = -0.035 - 0.2 * nearMax + (reduced ? 0 : Math.sin(t * 0.21) * 0.004);
      const f = norm([Math.sin(camYaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(camYaw) * Math.cos(pitch)]);
      const r = norm(cross([0, 1, 0], f));
      cam.p = p; cam.f = f; cam.r = r; cam.u = cross(f, r); cam.th = th;
    }
    function project(x, y, z) {
      const v = [x - cam.p[0], y - cam.p[1], z - cam.p[2]];
      const zc = dot(v, cam.f); if (zc < 0.3) return null;
      const k = 1 / (zc * cam.th);
      const h = wrap.clientHeight, w = wrap.clientWidth;
      return { x: w / 2 + dot(v, cam.r) * k * h / 2, y: h / 2 - dot(v, cam.u) * k * h / 2, dist: Math.hypot(v[0], v[1], v[2]) };
    }
    function occluded(x, y, z) {
      for (let i = 1; i < 22; i++) {
        const t = i / 22; const px = cam.p[0] + (x - cam.p[0]) * t, py = cam.p[1] + (y - cam.p[1]) * t, pz = cam.p[2] + (z - cam.p[2]) * t;
        if (py < terrain(px, pz, 3) - 0.2) return true;
      }
      return false;
    }
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth, h = wrap.clientHeight;
      const sc = Math.min(dpr, Math.sqrt((reduced ? 2.4e6 : budget) / Math.max(1, w * h)));
      canvas.width = Math.max(2, Math.round(w * sc)); canvas.height = Math.max(2, Math.round(h * sc));
      if (gl) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }
    const Larr = new Float32Array(64), LCarr = new Float32Array(64);
    function draw(t, day, mist) {
      if (!gl) return;
      nearStop = null; let nm = 0;
      STOPS.forEach((s) => { if (s.id !== 'contact' && s.near > nm) { nm = s.near; nearStop = s; } });
      nearMax += ((isPhone() && !sheetFor ? nm : 0) - nearMax) * (reduced ? 1 : 0.06);
      updateCamera(t);
      Larr.fill(0); LCarr.fill(0);
      STOPS.forEach((s, i) => {
        if (i >= 16) return;
        const reading = sheetFor === s ? 0.8 : 0;
        Larr.set([s.x, s.y, s.z, (0.95 + 1.15 * s.near + reading) * (0.65 + 0.35 * (1 - day * 0.3))], i * 4);
        LCarr.set([...(s.type ? STONE_RGB : LANT_RGB), s.type], i * 4);
      });
      gl.useProgram(prog); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.uniform2f(U.R, canvas.width, canvas.height);
      gl.uniform1f(U.T, t); gl.uniform1f(U.DAY, day); gl.uniform1f(U.MIST, mist);
      gl.uniform3fv(U.C, cam.p); gl.uniform3fv(U.F, cam.f); gl.uniform3fv(U.RT, cam.r); gl.uniform3fv(U.U, cam.u);
      gl.uniform1f(U.TH, cam.th);
      gl.uniform3fv(U.SD, norm(sunDir(-0.035 + 0.11 * day)));
      gl.uniform4fv(U.L, Larr); gl.uniform4fv(U.LC, LCarr);
      gl.uniform1f(U.STEPS, 120);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.useProgram(post);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(PU.S, 0); gl.uniform2f(PU.R, canvas.width, canvas.height); gl.uniform1f(PU.T, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // ---------- DOM: headline, sheet, map, footer ----------
    const head = el('header', 'dawn-head');
    { const h1 = el('h1'); h1.append('Looking for work?'); h1.appendChild(el('em', null, 'Two of these were built for you.')); head.appendChild(h1);
      head.appendChild(el('p', null, reduced ? 'Every light on this path is something I built. Two of them are for you.'
        : `${ctx.isTouch ? 'Hold your thumb anywhere' : 'Press and hold anywhere'} to walk toward the sunrise. Every light on the path is something I built.`)); }

    const sheet = el('aside', 'dawn-sheet vellum'); sheet.dataset.ui = '1'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'false');
    const sbar = el('div', 'bar'); const sback = el('button', null, '← Back to the path'); sback.type = 'button';
    const swhere = el('span', 'where'); sbar.append(sback, swhere);
    const sread = el('div', 'read'); sread.tabIndex = -1; sheet.append(sbar, sread);
    on(sback, 'click', (e) => { e.stopPropagation(); closeSheet(true); });

    const map = el('div', 'dawn-map vellum'); map.dataset.ui = '1'; map.setAttribute('role', 'dialog'); map.setAttribute('aria-label', 'Map of the path');
    let youDot = null, mapX = null, mapY = null;
    {
      const top = el('div', 'top'); top.appendChild(el('h2', null, 'The path'));
      const x = el('button', null, 'Close'); x.type = 'button'; on(x, 'click', (e) => { e.stopPropagation(); toggleMap(false); }); top.appendChild(x);
      map.appendChild(top);
      map.appendChild(el('p', 'kind', 'Every place on the walk, seen from above, with the sunrise to the right. Choose one and the path takes you there.'));
      const Wv = 760, Hv = 96, zMax = END + 6;
      mapX = (z) => 20 + (z / zMax) * (Wv - 60); mapY = (x) => Hv / 2 + x * 3.2;
      const svg = sv('svg', { class: 'chart', viewBox: `0 0 ${Wv} ${Hv}`, 'aria-hidden': 'true' });
      let d = ''; for (let z = 0; z <= zMax; z += 3) d += `${z ? 'L' : 'M'}${mapX(z).toFixed(1)} ${mapY(pathX(z)).toFixed(1)}`;
      svg.appendChild(sv('path', { d, fill: 'none', stroke: 'rgba(176,110,40,.6)', 'stroke-width': '2', 'stroke-dasharray': '5 5', 'stroke-linecap': 'round' }));
      svg.appendChild(sv('circle', { cx: Wv - 22, cy: Hv / 2, r: 11, fill: 'rgba(255,200,110,.55)' }));
      STOPS.forEach((s) => {
        const cx = mapX(s.z), cy = mapY(s.x);
        svg.appendChild(s.type ? sv('rect', { x: cx - 4.5, y: cy - 4.5, width: 9, height: 9, rx: 2, fill: '#fff4dc', stroke: '#b06e28', 'stroke-width': 1.5, transform: `rotate(45 ${cx} ${cy})` })
          : sv('circle', { cx, cy, r: 5, fill: '#ffd27a', stroke: '#b06e28', 'stroke-width': 1.5 }));
      });
      youDot = sv('circle', { cx: mapX(0), cy: mapY(pathX(0)), r: 7, fill: '#e8952e', stroke: '#fff', 'stroke-width': 2 });
      svg.appendChild(youDot); map.appendChild(svg);
      const cols = el('div', 'cols');
      const col = (title, list) => { const c = el('div'); c.appendChild(el('h4', null, title)); list.forEach((s) => {
        const b = el('button'); b.type = 'button'; b.append(s.name); if (s.kind === 'work') b.appendChild(el('small', null, s.w.kind));
        on(b, 'click', (e) => { e.stopPropagation(); toggleMap(false); visit(s, { open: s.id !== 'contact', push: true }); });
        c.appendChild(b); }); cols.appendChild(c); };
      col('Built for you', STOPS.filter((s) => s.kind === 'work' && FOR_YOU.includes(s.slug)));
      col('More of my work', STOPS.filter((s) => s.kind === 'work' && !FOR_YOU.includes(s.slug)));
      col('Waystones', STOPS.filter((s) => s.kind === 'section'));
      map.appendChild(cols);
    }

    const foot = el('div', 'dawn-foot');
    const hint = el('div', 'dawn-hint'); hint.appendChild(el('i')); hint.appendChild(el('span', null, ctx.isTouch ? 'Hold to walk' : 'Hold to walk  ·  or ↑ / W  ·  M for the map'));
    const trail = el('nav', 'dawn-trail'); trail.setAttribute('aria-label', 'Places on the path'); trail.dataset.ui = '1';
    trail.appendChild(el('div', 'rail')); const fill = el('div', 'fill'); trail.appendChild(fill);
    const cap = el('div', 'cap'); trail.appendChild(cap);
    const stopBtns = STOPS.map((s) => {
      const b = el('button', `stop${s.type ? ' ws' : ''}`); b.type = 'button'; b.appendChild(el('span'));
      b.style.left = `${(s.view / END) * 100}%`; b.setAttribute('aria-label', `Walk to ${s.name}`); b.title = s.name;
      on(b, 'click', (e) => { e.stopPropagation(); visit(s, { open: false }); });
      trail.appendChild(b); return b;
    });
    const mapBtn = el('button', 'dawn-fbtn dawn-map-btn'); mapBtn.type = 'button'; mapBtn.dataset.ui = '1'; mapBtn.setAttribute('aria-label', 'Open the map of the path');
    { const s = sv('svg', { viewBox: '0 0 22 16' }); s.appendChild(sv('path', { d: 'M1 3 L7 1 L15 4 L21 2 L21 13 L15 15 L7 12 L1 14 Z M7 1 L7 12 M15 4 L15 15' })); mapBtn.append(s, el('span', null, 'Map')); }
    on(mapBtn, 'click', (e) => { e.stopPropagation(); toggleMap(); });
    const soundBtn = el('button', 'dawn-fbtn dawn-sound'); soundBtn.type = 'button'; soundBtn.dataset.ui = '1';
    const wave = sv('path', {}); { const s = sv('svg', { viewBox: '0 0 22 14' }); s.appendChild(wave); soundBtn.append(s); }
    const soundLabel = el('span', null, 'Sound off'); soundBtn.appendChild(soundLabel);
    const setWave = (o) => wave.setAttribute('d', o ? 'M1 7 Q4 1 7 7 T13 7 T19 7 L21 7' : 'M1 7 L21 7');
    setWave(false); soundBtn.setAttribute('aria-pressed', 'false'); soundBtn.setAttribute('aria-label', 'Play ambient sound');
    foot.append(hint, trail, mapBtn, soundBtn);

    function toggleMap(force) {
      mapOpen = force == null ? !mapOpen : force;
      map.classList.toggle('open', mapOpen);
      map.setAttribute('aria-hidden', String(!mapOpen));
      if (mapOpen) {
        if (youDot) { youDot.setAttribute('cx', mapX(W).toFixed(1)); youDot.setAttribute('cy', mapY(pathX(W)).toFixed(1)); }
        const b = map.querySelector('.cols button'); if (b) b.focus({ preventScroll: true });
      } else if (document.activeElement && map.contains(document.activeElement)) mapBtn.focus({ preventScroll: true });
    }
    map.setAttribute('aria-hidden', 'true');

    function openSheet(stop) {
      sheetFor = stop; sread.replaceChildren(stop.kind === 'work' ? caseView(stop.slug) : sectionView(stop.id));
      swhere.textContent = stop.kind === 'work' ? `Lantern ${ORDER.indexOf(stop.slug) + 1} of ${ORDER.length} · ${stop.w.kind}` : 'A waystone';
      sheet.setAttribute('aria-label', stop.name);
      sheet.classList.add('open'); wrap.classList.add('reading'); sread.scrollTop = 0;
      sread.focus({ preventScroll: true });
      if (reduced) paintStill();
    }
    function closeSheet(viaUser) {
      if (!sheetFor) return;
      sheetFor = null; sheet.classList.remove('open'); wrap.classList.remove('reading');
      if (viaUser) {
        if (sheetPushed) { sheetPushed = false; history.back(); return; }
        history.replaceState(history.state, '', location.pathname + location.search);
        lastHash = '';
      }
      if (reduced) paintStill();
    }
    // go to a place: glide there, optionally open its reading sheet.
    // History: deliberate jumps push an entry (so Back returns); hops inside the sheet replace it.
    function visit(stop, { open = false, push = false, replace = false, instant = false } = {}) {
      if (!stop) return;
      everWalked = true;
      const d = Math.abs(stop.view - W);
      if (instant || reduced) { W = stop.view; vel = 0; autoTarget = null; }
      else { autoTarget = stop.view; autoSpeed = Math.min(80, 9 + d * 0.9); }
      const hash = `#${stop.id}`;
      if (open && stop.id !== 'contact') {
        if (replace && sheetFor) history.replaceState(history.state, '', hash);
        else if (location.hash !== hash) { history.replaceState({ w: W }, ''); history.pushState({ w: stop.view }, '', hash); sheetPushed = true; }
        lastHash = stop.id;
        openSheet(stop);
      } else {
        if (sheetFor) closeSheet(false);
        if (push && location.hash !== hash) { history.replaceState({ w: W }, ''); history.pushState({ w: stop.view }, '', hash); sheetPushed = false; lastHash = stop.id; }
      }
    }
    let lastHash = null;
    function applyHash(initial) {
      const h = decodeURIComponent((location.hash || '').replace(/^#/, ''));
      if (h === lastHash && !initial) return; lastHash = h;
      const stop = stopById[h];
      sheetPushed = false;
      if (stop) {
        if (stop.id === 'contact') { if (sheetFor) closeSheet(false); visit(stop, { instant: initial }); }
        else { visit(stop, { instant: initial }); openSheet(stop); }
      } else {
        if (sheetFor) closeSheet(false);
        const st = history.state;
        if (st && typeof st.w === 'number' && !initial) {
          if (reduced) W = st.w; else { autoTarget = st.w; autoSpeed = Math.min(80, 9 + Math.abs(st.w - W) * 0.9); }
        }
      }
    }
    on(window, 'popstate', () => applyHash(false));
    on(window, 'hashchange', () => applyHash(false));

    let paintStill = () => {};
    // ================= STILL VERSION (reduced motion) =================
    if (reduced) {
      const still = el('div', 'dawn-still'); still.dataset.ui = '1';
      still.appendChild(head);
      const grp = (t) => still.appendChild(el('h3', 'group', t));
      const gridOf = (stops) => { const g = el('div', 'grid'); stops.forEach((s) => g.appendChild(card(s))); still.appendChild(g); };
      grp('Built for you'); gridOf(STOPS.filter((s) => s.kind === 'work' && FOR_YOU.includes(s.slug)));
      grp('More of my work'); gridOf(STOPS.filter((s) => s.kind === 'work' && !FOR_YOU.includes(s.slug)));
      ['principles', 'withdrawn', 'capabilities', 'about'].forEach((id) => { const s = el('section', 'sec vellum'); s.id = `dawn-${id}`; s.appendChild(sectionView(id)); still.appendChild(s); });
      still.appendChild(contactBlock());
      wrap.append(still, sheet, map, foot);
      trail.style.display = 'none'; hint.style.display = 'none'; soundBtn.style.display = 'none';
      W = 6;
      paintStill = () => { draw(14, 0.9, 0.022); };
      resize(); applyHash(true); paintStill();
      on(window, 'resize', () => { resize(); paintStill(); });
      on(window, 'keydown', (e) => { if (e.key === 'Escape') { if (mapOpen) toggleMap(false); else closeSheet(true); } });
      return () => {
        cleanups.forEach((f) => f());
        if (gl) { gl.deleteBuffer(buf); gl.deleteProgram(prog); gl.deleteProgram(post); gl.deleteTexture(tex); gl.deleteFramebuffer(fbo); const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); }
        fontLink.remove(); style.remove(); root.replaceChildren();
      };
    }

    // ================= WALKING VERSION =================
    wrap.appendChild(head);
    const tagLayer = el('div'); tagLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none'; wrap.appendChild(tagLayer);
    STOPS.forEach((s) => {
      s.card = card(s); wrap.appendChild(s.card);
      const t = el('button', 'dawn-tag', s.name); t.type = 'button'; t.dataset.ui = '1'; t.setAttribute('aria-label', `Walk to ${s.name}`); t.tabIndex = -1;
      on(t, 'click', (e) => { e.stopPropagation(); visit(s); });
      tagLayer.appendChild(t); s.tag = t; s.occ = false;
    });
    wrap.append(foot, sheet, map);

    // ---------- sound (only after a click on the toggle) ----------
    let ac = null, master = null, soundOn = false, birdTimer = 0; const nodes = [];
    function chirp() {
      if (!ac || !soundOn) return;
      const n = 2 + Math.floor(Math.random() * 3); let t0 = ac.currentTime + 0.05;
      for (let i = 0; i < n; i++) {
        const o = ac.createOscillator(), g = ac.createGain(); const f0 = 2600 + Math.random() * 1400; o.type = 'sine';
        o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f0 * 1.45, t0 + 0.07);
        g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.035, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0005, t0 + 0.11);
        o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 0.13); t0 += 0.13 + Math.random() * 0.08;
      }
      birdTimer = setTimeout(chirp, 2500 + Math.random() * 5000);
    }
    function startAudio() {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ac = new AC(); master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
      const len = ac.sampleRate * 3, nb = ac.createBuffer(1, len, ac.sampleRate), d = nb.getChannelData(0);
      let lv = 0; for (let i = 0; i < len; i++) { lv = (lv + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = lv * 3.2; }
      const src = ac.createBufferSource(); src.buffer = nb; src.loop = true;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520;
      const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 260; lfo.connect(lg); lg.connect(lp.frequency);
      const wg = ac.createGain(); wg.gain.value = 0.32; src.connect(lp); lp.connect(wg); wg.connect(master); src.start(); lfo.start(); nodes.push(src, lfo);
      const pg = ac.createGain(); pg.gain.value = 0.05; const pf = ac.createBiquadFilter(); pf.type = 'lowpass'; pf.frequency.value = 900; pf.connect(pg); pg.connect(master);
      [146.83, 220.0, 277.18, 329.63, 440.0].forEach((fr, i) => {
        const o = ac.createOscillator(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = fr; o.detune.value = (i - 2) * 3;
        const g = ac.createGain(); g.gain.value = 0.16 / (1 + i * 0.4);
        const tl = ac.createOscillator(), tg = ac.createGain(); tl.frequency.value = 0.05 + i * 0.023; tg.gain.value = 0.06; tl.connect(tg); tg.connect(g.gain);
        o.connect(g); g.connect(pf); o.start(); tl.start(); nodes.push(o, tl);
      });
    }
    on(soundBtn, 'click', (e) => {
      e.stopPropagation();
      if (!ac) startAudio(); if (!ac) return;
      soundOn = !soundOn; ac.resume();
      master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(soundOn ? 0.55 : 0, ac.currentTime, 0.6);
      clearTimeout(birdTimer); if (soundOn) birdTimer = setTimeout(chirp, 1200);
      soundLabel.textContent = soundOn ? 'Sound on' : 'Sound off'; setWave(soundOn);
      soundBtn.setAttribute('aria-pressed', String(soundOn)); soundBtn.setAttribute('aria-label', soundOn ? 'Mute ambient sound' : 'Play ambient sound');
    });

    // ---------- input ----------
    const isUI = (t) => t && t.closest && t.closest('[data-ui]');
    on(wrap, 'pointerdown', (e) => {
      if (isUI(e.target)) return;
      if (mapOpen) { toggleMap(false); return; }
      if (sheetFor) { closeSheet(true); return; }
      holding = true; autoTarget = null; dragY = e.clientY; dragMode = false; everWalked = true;
      try { wrap.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    });
    on(wrap, 'pointermove', (e) => {
      if (!holding || dragY == null) return;
      const dy = e.clientY - dragY;
      if (!dragMode && Math.abs(dy) > 10) dragMode = true;
      if (dragMode) { W = Math.min(END, Math.max(0, W - dy * 0.05)); vel = -dy * 1.25; dragY = e.clientY; }
    });
    const release = () => { holding = false; dragY = null; dragMode = false; };
    on(wrap, 'pointerup', release); on(wrap, 'pointercancel', release); on(window, 'blur', release);
    const keys = new Set();
    on(window, 'keydown', (e) => {
      const k = e.key;
      if (k === 'Escape') { if (mapOpen) toggleMap(false); else if (sheetFor) closeSheet(true); return; }
      if ((k === 'm' || k === 'M') && !e.metaKey && !e.ctrlKey && !e.altKey) { toggleMap(); return; }
      if (sheetFor || mapOpen) return;
      if (['ArrowUp', 'w', 'W', ' ', 'ArrowDown', 's', 'S'].includes(k)) {
        if (k === ' ' && document.activeElement && document.activeElement !== document.body && isUI(document.activeElement)) return;
        e.preventDefault(); keys.add(k.toLowerCase()); autoTarget = null; everWalked = true;
      }
    });
    on(window, 'keyup', (e) => keys.delete(e.key.toLowerCase()));
    on(window, 'resize', resize);
    resize();
    applyHash(true);

    // ---------- loop ----------
    const lerp = (a, b, k) => a + (b - a) * k;
    const cache = new WeakMap();
    const setStyle = (node, key, val) => { let p = cache.get(node); if (!p) { p = {}; cache.set(node, p); } if (p[key] !== val) { node.style[key] = val; p[key] = val; } };
    let occTick = 0;

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;

      frames++; ftAcc += dt;
      if (frames >= 30) {
        const avg = ftAcc / frames; frames = 0; ftAcc = 0;
        if (avg > 0.0185 && budget > 3e5) { budget = Math.max(3e5, budget * (avg > 0.026 ? 0.66 : 0.8)); resize(); holdUpUntil = time + 8; calmFor = 0; }
        else if (avg < 0.0175) { calmFor++; if (calmFor > 4 && time > holdUpUntil && budget < 2.2e6) { budget = Math.min(2.2e6, budget * 1.15); resize(); calmFor = 0; } }
      }

      const fwdKey = keys.has('arrowup') || keys.has('w') || keys.has(' ');
      const backKey = keys.has('arrowdown') || keys.has('s');
      let target = 0;
      if (holding && !dragMode) target = 9;
      if (fwdKey) target = 9; if (backKey) target = -7;
      if (autoTarget != null) {
        const d = autoTarget - W; target = Math.sign(d) * Math.min(autoSpeed, Math.abs(d) * 1.5 + 0.6);
        if (Math.abs(d) < 0.08) { autoTarget = null; target = 0; }
      }
      if (!dragMode) {
        vel = lerp(vel, target, 1 - Math.exp(-dt * (target ? 2.2 : 2.8)));
        if (!holding && !fwdKey && !backKey && autoTarget == null) {
          for (const s of STOPS) if (Math.abs(W - s.view) < 6 && Math.abs(vel) < 3) vel = lerp(vel, (s.view - W) * 1.2, 1 - Math.exp(-dt * 3));
        }
        W += vel * dt;
      } else vel *= 0.85;
      if (W < 0) { W = 0; vel = Math.max(0, vel); } if (W > END) { W = END; vel = Math.min(0, vel); }

      const rise = sstep(0, 3.2, time);
      const prog = W / END;
      const day = Math.min(1, 0.04 + 0.6 * rise + 0.36 * prog);
      const mist = 0.075 * (1 - 0.62 * rise) * (1 - 0.6 * prog) + 0.006;
      STOPS.forEach((s) => { s.near = sstep(s.z - 24, s.z - 11, W) * (1 - sstep(s.z - 1, s.z + 4, W)); });
      contactStop.near = sstep(contactStop.z - 18, contactStop.z - 6, W);
      draw(time, day, mist);

      // ---- DOM ----
      const headA = sstep(0.9, 2.4, time) * (1 - sstep(1.0, 9, W)) * (sheetFor ? 0 : 1);
      setStyle(head, 'opacity', headA.toFixed(3));
      setStyle(head, 'transform', `translateY(${(-W * 2).toFixed(1)}px)`);
      setStyle(hint, 'opacity', (sstep(2.2, 3.4, time) * (everWalked ? 0 : 1)).toFixed(2));
      let here = null, nextS = null;
      const mob = isPhone();
      STOPS.forEach((s) => {
        const a = sheetFor || mapOpen ? 0 : s.near;
        setStyle(s.card, 'opacity', a.toFixed(3));
        const ty = ((1 - a) * 40).toFixed(1);
        setStyle(s.card, 'transform', s.id === 'contact' ? (mob ? `translateY(calc(-50% + ${ty}px))` : `translate(-50%, calc(-50% + ${ty}px))`) : (mob ? `translateY(${ty}px)` : `translateY(calc(-50% + ${ty}px))`));
        setStyle(s.card, 'pointerEvents', a > 0.5 ? 'auto' : 'none');
        setStyle(s.card, 'visibility', a > 0.01 ? 'visible' : 'hidden');
        if (Math.abs(W - s.view) < 5) here = s;
        if (!nextS && s.view > W + 2) nextS = s;
        const pr = project(s.x, s.y + 0.9, s.z);
        if ((occTick % 8) === 0) s.occ = pr ? occluded(s.x, s.y, s.z) : true;
        const show = pr && !s.occ && !sheetFor && !mapOpen && pr.dist > 13 && pr.dist < 120 && pr.x > 20 && pr.x < wrap.clientWidth - 20
          && pr.y > 84 && pr.y < wrap.clientHeight - 140 && headA < 0.3 && time > 3;
        setStyle(s.tag, 'opacity', show ? Math.min(1, (120 - pr.dist) / 30).toFixed(2) : '0');
        setStyle(s.tag, 'pointerEvents', show ? 'auto' : 'none');
        s.tag._pr = show ? pr : null;
        if (pr) setStyle(s.tag, 'transform', `translate(calc(${pr.x.toFixed(0)}px - 50%), ${(pr.y - 30).toFixed(0)}px)`);
      });
      const shown = STOPS.filter((s) => s.tag.style.opacity !== '0' && s.tag._pr).sort((a, b) => a.tag._pr.dist - b.tag._pr.dist);
      const kept = [];
      shown.forEach((s) => { const p = s.tag._pr; const clash = kept.some((q) => Math.abs(q.x - p.x) < 110 && Math.abs(q.y - p.y) < 26);
        if (clash) { setStyle(s.tag, 'opacity', '0'); setStyle(s.tag, 'pointerEvents', 'none'); } else kept.push(p); });
      occTick++;
      setStyle(fill, 'width', `${(prog * 100).toFixed(2)}%`);
      STOPS.forEach((s, i) => { const b = stopBtns[i]; b.classList.toggle('lit', W >= s.view - 1.5); b.classList.toggle('here', s === here); });
      const capText = here ? here.name : (nextS ? `Next: ${nextS.name}` : '');
      if (cap.textContent !== capText) cap.textContent = capText;
      if (mapOpen && youDot) { youDot.setAttribute('cx', mapX(W).toFixed(1)); youDot.setAttribute('cy', mapY(pathX(W)).toFixed(1)); }
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(birdTimer);
      cleanups.forEach((f) => f());
      nodes.forEach((n) => { try { n.stop(); } catch (_) { /* stopped */ } });
      if (ac) { try { ac.close(); } catch (_) { /* ignore */ } }
      if (gl) { gl.deleteBuffer(buf); gl.deleteProgram(prog); gl.deleteProgram(post); gl.deleteTexture(tex); gl.deleteFramebuffer(fbo); const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); }
      fontLink.remove(); style.remove(); root.replaceChildren();
    };
  },
};
