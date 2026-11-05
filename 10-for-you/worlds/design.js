// World: design — "Type as matter", the whole site.
// Every heading is poured gel: a heightfield made from the type, shaded as thick glossy enamel over flat colour
// fields, pushed around by a spring/velocity field and a ripple field (raw WebGL2). Each section is its own
// composition with its own colour field; moving between them drains the gel and pours the next one.
// Real HTML sits exactly over the gel (transparent) so every word stays text, selectable and accessible.

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Fraunces:opsz,wght,SOFT,WONK@144,900,100,1&display=block';

const C = {
  butter: '#F3DB86', blush: '#F3B7AA', tomato: '#E5402A', cobalt: '#2440CC', cherry: '#A3101C', ink: '#2A1610',
  cream: '#F7F1E6', mint: '#BFE0C9', sky: '#C7D8F1', marigold: '#F2C14E', sand: '#EADBC8', coral: '#F5A98F',
  sage: '#CBE4DA', navy: '#13207A', paper: '#FFF6E0',
};
const hex3 = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const MAXID = 15;

// per-product field + gel colour (case rail)
const PROD_THEME = {
  'vvdex-platform': [C.butter, C.tomato], conxto: [C.blush, C.cobalt], 'vvdex-engine': [C.mint, C.tomato],
  unboundpdf: [C.sky, C.tomato], farmquick: [C.marigold, C.cobalt], conxfolio: [C.sand, C.cherry],
  pitchradar: [C.coral, C.cobalt], 'vvdex-trading': [C.sage, C.cherry],
};
const deeper = (g) => (g === C.cobalt ? C.navy : g === C.tomato ? C.cherry : g === C.cherry ? C.ink : g === C.butter ? C.paper : C.cherry);

const CSS = `
.dz{--g:48px;--fg:${C.ink};--gelc:${C.cobalt};--spd:0;position:absolute;inset:0;overflow:hidden;background:${C.butter};color:var(--fg);
  touch-action:none;-webkit-tap-highlight-color:transparent;font-family:'Bricolage Grotesque',Georgia,serif;font-optical-sizing:auto;transition:color .4s}
.dz canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.dz-ui{position:absolute;inset:0;box-sizing:border-box;padding:84px var(--g) 50px;display:flex;flex-direction:column}
.dz-comp{flex:1;min-height:0;display:flex;flex-direction:column;transition:opacity .26s ease,transform .26s ease}
.dz-comp.out{opacity:0;transform:translateY(10px)}
.dz-comp.pre{opacity:0}
.dz-gel{font-family:'Fraunces',Georgia,serif;font-weight:900;line-height:1;letter-spacing:0;white-space:nowrap;color:transparent;
  font-kerning:normal;font-synthesis:none;margin:0}
.dz.nogl .dz-gel,.dz.nogl .dz-p,.dz.nogl .dz-tb,.dz.nogl .dz-sb{color:var(--gelc)}
.dz-gl{display:block}
.dz-p,.dz-tb,.dz-sb{all:unset;box-sizing:border-box;display:block;width:max-content;cursor:pointer;font-family:'Fraunces',Georgia,serif;font-weight:900;
  line-height:1;white-space:nowrap;color:transparent;-webkit-user-select:none;user-select:none}
.dz-p:focus-visible,.dz-tb:focus-visible,.dz-sb:focus-visible,.dz-gel:focus-visible{outline:2px solid var(--fg);outline-offset:.12em;border-radius:.08em}
.dz-gel:focus:not(:focus-visible),.dz [tabindex="-1"]:focus{outline:none}
.dz a.dz-gel{color:transparent;text-decoration:none}
.dz.nogl a.dz-gel{color:var(--gelc)}
.dz a{color:inherit;text-decoration:underline;text-decoration-thickness:1.5px;text-underline-offset:.22em}
.dz a:hover{text-decoration-thickness:3px}
.dz a:focus-visible,.dz-lnk:focus-visible{outline:2px solid var(--fg);outline-offset:3px;border-radius:2px}
.dz-lnk{all:unset;cursor:pointer;text-decoration:underline;text-decoration-thickness:1.5px;text-underline-offset:.22em}
.dz-lnk:hover{text-decoration-thickness:3px}
.dz-flex{font-weight:calc(400 + 300 * var(--spd));font-stretch:calc(100% - 25% * var(--spd))}
.dz-kick{margin:0 0 .9em;font-size:13px;letter-spacing:.06em;text-transform:uppercase;font-weight:calc(620 + 180 * var(--spd));font-stretch:calc(100% - 25% * var(--spd))}
.dz-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
/* index */
.dz-index{position:absolute;left:0;right:0;bottom:0;height:46px;box-sizing:border-box;display:flex;align-items:center;gap:22px;padding:0 var(--g);
  font-size:13.5px;font-weight:600;white-space:nowrap;overflow-x:auto;scrollbar-width:none;touch-action:pan-x;z-index:3}
.dz-index::-webkit-scrollbar{display:none}
.dz-index a{text-decoration:none;opacity:.72;padding:6px 0}
.dz-index a:hover{opacity:1}
.dz-index a[aria-current="page"]{opacity:1;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.3em}
.dz-index .dz-home{font-family:'Fraunces',Georgia,serif;font-weight:900;font-size:15px;opacity:1;margin-right:auto}
/* home */
.dz-name{font-size:var(--fsN);display:flex;gap:.22em}
.dz-name span{display:block}
.dz-mid{flex:1;min-height:0;display:flex;align-items:center;gap:clamp(24px,6vw,120px);padding:calc(var(--fsN)*.3) 0 0}
.dz-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.15em;font-size:var(--fsP);flex:none}
.dz-list li{margin:0;padding:0;display:block;line-height:1}
.dz-info{flex:1;min-width:0;max-width:640px}
.dz-lede{margin:0;font-size:clamp(20px,2.25vw,34px);line-height:1.22;text-wrap:pretty}
.dz-foot{display:flex;align-items:baseline;justify-content:space-between;gap:24px;font-size:15px;line-height:1.35;padding-top:12px;flex:none}
.dz-foot p{margin:0}
.dz-design{max-width:40em}
.dz-hint{opacity:.7;flex:0 1 auto;text-align:right}
/* spread (rail + reader) */
.dz-spread{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,36fr) minmax(0,64fr);gap:var(--gap)}
.dz-rail{min-height:0;display:flex;flex-direction:column;align-items:flex-start;padding-right:8px;overflow:hidden}
.dz-rail .dz-kick{margin-bottom:.8em}
.dz-toc{display:flex;flex-direction:column;gap:.2em;font-size:var(--fsT);margin-top:calc(var(--fsT)*.9)}
.dz-pn{display:flex;flex-wrap:wrap;gap:6px 22px;margin-top:auto;padding-top:16px;font-size:15px}
.dz-reader{min-height:0;overflow:auto;touch-action:pan-y;overscroll-behavior:contain;position:relative;padding:0 18px 40px 0;
  font-size:17.5px;line-height:1.62;scrollbar-width:thin;scrollbar-color:color-mix(in srgb,var(--fg) 30%,transparent) transparent}
.dz-reader:focus-visible{outline:2px solid var(--fg);outline-offset:4px}
.dz-col{max-width:44rem}
.dz-sec{padding:0 0 2.4em;scroll-margin-top:8px}
.dz-h{font-family:'Fraunces',Georgia,serif;font-weight:900;font-size:clamp(24px,2.2vw,32px);line-height:1.05;margin:0 0 .55em;color:var(--gelc)}
.dz-dek{font-size:clamp(21px,1.9vw,27px);line-height:1.3;font-weight:560;margin:0 0 .8em;text-wrap:pretty}
.dz-reader p{margin:0 0 .85em;text-wrap:pretty}
.dz-meta{font-size:13px;letter-spacing:.06em;text-transform:uppercase;font-weight:650;opacity:.8;margin:0 0 1.2em}
.dz-ul{margin:0;padding:0;list-style:none}
.dz-ul li{position:relative;padding:0 0 .7em 1.3em}
.dz-ul li::before{content:'';position:absolute;left:0;top:.62em;width:.5em;height:.5em;border-radius:50%;background:var(--gelc)}
.dz-items{display:grid;gap:1.1em}
.dz-it b{display:block;font-weight:700;font-size:1.02em;margin-bottom:.15em}
.dz-steps{counter-reset:s;margin:0;padding:0;list-style:none;display:grid;gap:1em}
.dz-steps li{counter-increment:s;display:grid;grid-template-columns:2.2em 1fr;gap:.2em .6em}
.dz-steps li::before{content:counter(s);font-family:'Fraunces',Georgia,serif;font-weight:900;font-size:1.6em;line-height:1;color:var(--gelc)}
.dz-steps b{display:block;font-weight:700}
.dz-dec{display:grid;gap:1.5em}
.dz-dec h4{margin:0 0 .35em;font-size:1.08em;line-height:1.35;font-weight:700}
.dz-dec .t{display:block;font-size:.93em;opacity:.85;margin-top:.4em}
.dz-dec .t::before{content:'Trade-off. ';font-weight:700}
.dz-ev{display:grid;gap:1.1em}
.dz-ev time,.dz-nums time{display:block;font-size:13px;opacity:.7;margin-top:.2em}
.dz-nums{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:1.4em 1.6em}
.dz-nums .v{display:block;font-family:'Fraunces',Georgia,serif;font-weight:900;font-size:clamp(34px,3.2vw,46px);line-height:1;color:var(--gelc);margin-bottom:.2em}
.dz-nums .l{font-size:15px;line-height:1.4;display:block}
.dz-stack{display:flex;flex-wrap:wrap;gap:.5em .6em;margin:0;padding:0;list-style:none}
.dz-stack li{border:1.5px solid color-mix(in srgb,var(--fg) 35%,transparent);border-radius:.4em;padding:.15em .55em;font-size:15px;line-height:1.4}
.dz-links{display:flex;flex-direction:column;gap:.45em;margin:0;padding:0;list-style:none}
.dz-end{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;border-top:1.5px solid color-mix(in srgb,var(--fg) 25%,transparent);padding-top:1.2em;margin-top:.6em}
.dz-end button{font-family:'Fraunces',Georgia,serif;font-weight:900;font-size:22px;color:var(--gelc);text-decoration:none}
.dz-end small{display:block;font-family:'Bricolage Grotesque',Georgia,serif;font-weight:600;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--fg);opacity:.7;margin-bottom:.2em}
/* capabilities matrix */
.dz-mx{border-collapse:collapse;width:100%;font-size:15px;line-height:1.3;margin-bottom:.4em}
.dz-mx th,.dz-mx td{padding:.42em .3em;border-bottom:1px solid color-mix(in srgb,var(--fg) 16%,transparent);text-align:center}
.dz-mx th[scope=row]{text-align:left;font-weight:500;padding-left:0;width:42%}
.dz-mx thead th{vertical-align:bottom;height:122px;padding-bottom:.6em;border-bottom:1.5px solid color-mix(in srgb,var(--fg) 40%,transparent)}
.dz-mx thead button{writing-mode:vertical-rl;transform:rotate(180deg);font-family:'Fraunces',Georgia,serif;font-weight:900;font-size:14px;color:var(--fg);text-decoration:none}
.dz-mx thead button:hover{color:var(--gelc)}
.dz-dot{display:inline-block;width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff9 0 18%,transparent 40%),var(--gelc);box-shadow:1px 2px 3px #0003}
.dz-cl{margin:0;padding:0;list-style:none;display:grid;gap:.9em}
.dz-cl b{display:block;font-weight:600}
.dz-chips{display:flex;flex-wrap:wrap;gap:.2em .8em;font-size:14.5px}
/* stage (one composition, no scroll) */
.dz-stage{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;max-width:1180px}
.dz-body{font-size:clamp(17px,1.5vw,22px);line-height:1.45;max-width:38em;margin:1.1em 0 0;text-wrap:pretty}
.dz-steprow{display:flex;align-items:flex-end;gap:.5em;font-size:var(--fsS);padding-top:18px;flex:none}
.dz-steprow .dz-nx{font-size:15px;margin-left:1.2em;padding-bottom:.3em;font-family:'Bricolage Grotesque',Georgia,serif;font-weight:600}
.dz-wnums{display:flex;flex-wrap:wrap;gap:.6em 1.6em;align-items:flex-end;margin:.5em 0 0}
.dz-wn{display:flex;flex-direction:column;gap:.35em}
.dz-wn span{font-size:14px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.dz-wn .dz-gel{font-size:var(--fsW)}
.dz-wt{font-size:clamp(20px,2vw,28px);font-weight:700;margin:1em 0 0;line-height:1.2}
.dz-facts{display:grid;grid-template-columns:max-content 1fr;gap:.5em 1.4em;margin:0;font-size:17px;line-height:1.45}
.dz-facts dt{font-weight:700}
.dz-facts dd{margin:0}
.dz-ct{display:flex;flex-wrap:wrap;gap:.6em 1.6em;margin-top:1.4em;font-size:clamp(16px,1.4vw,20px)}
@media (max-width:1180px){.dz-hint{display:none}}
/* narrow */
.dz--narrow .dz-ui{padding:80px var(--g) 46px}
.dz--narrow .dz-name{flex-direction:column;gap:.04em}
.dz--narrow .dz-mid{flex-direction:column;align-items:stretch;justify-content:flex-start;gap:0;padding-top:calc(var(--fsN)*.2)}
.dz--narrow .dz-info{flex:1 1 auto;min-height:0;max-width:none;padding-bottom:10px}
.dz--narrow .dz-list{order:1;flex-direction:row;flex-wrap:wrap;gap:.2em .55em;padding:calc(var(--fsP)*.35) 0 0}
.dz--narrow .dz-lede{font-size:16px;line-height:1.32}
.dz--narrow .dz-kick{font-size:11px;margin-bottom:.6em}
.dz--narrow .dz-foot{font-size:12.5px;padding-top:10px}
.dz--narrow .dz-spread{display:flex;flex-direction:column;gap:0}
.dz--narrow .dz-rail{flex:none;padding:0 0 14px}
.dz--narrow .dz-reader{flex:1;padding:16px 4px 30px 0;font-size:16.5px;line-height:1.58}
.dz--narrow .dz-pn{display:none}
.dz--narrow .dz-body{font-size:16px;margin-top:.8em}
.dz--narrow .dz-facts{grid-template-columns:1fr;gap:.1em;font-size:15.5px}
.dz--narrow .dz-facts dd{margin-bottom:.6em}
.dz--narrow .dz-index{gap:18px;font-size:13px}
.dz--narrow .dz-index .dz-home{font-size:14px}
.dz--narrow .dz-wt{font-size:18px;margin-top:.7em}
`;

/* ---------------- shaders ---------------- */
const VS = `#version 300 es
out vec2 vUv;
void main(){ vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2)); vUv=p; gl_Position=vec4(p*2.0-1.0,0.0,1.0); }`;

const SIM_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uA, uB;
uniform vec2 uTexel, uRes, uM0, uM1, uMV;
uniform float uPress, uRad, uDt, uK, uC, uMaxD, uGain;
uniform vec4 uImp;
layout(location=0) out vec4 oA;
layout(location=1) out vec4 oB;
float segD(vec2 p, vec2 a, vec2 b){ vec2 ab=b-a; float t=clamp(dot(p-a,ab)/max(dot(ab,ab),1e-4),0.0,1.0); return length(p-a-ab*t); }
void main(){
  vec4 a=texture(uA,vUv);
  vec4 aL=texture(uA,vUv-vec2(uTexel.x,0.0)), aR=texture(uA,vUv+vec2(uTexel.x,0.0));
  vec4 aD=texture(uA,vUv-vec2(0.0,uTexel.y)), aU=texture(uA,vUv+vec2(0.0,uTexel.y));
  vec4 avg=(aL+aR+aD+aU)*0.25;
  vec2 d=mix(a.xy,avg.xy,0.10), v=mix(a.zw,avg.zw,0.30);
  vec2 p=vUv*uRes;
  float dist=segD(p,uM0,uM1);
  float g=exp(-dist*dist/(uRad*uRad));
  v+=uMV*g*uGain;
  v+=(-uK*d-uC*v)*uDt;
  d+=v*uDt;
  float L=length(d); if(L>uMaxD) d*=uMaxD/L;
  oA=vec4(d,v);
  vec4 b=texture(uB,vUv);
  float lap=texture(uB,vUv-vec2(uTexel.x,0.0)).x+texture(uB,vUv+vec2(uTexel.x,0.0)).x+texture(uB,vUv-vec2(0.0,uTexel.y)).x+texture(uB,vUv+vec2(0.0,uTexel.y)).x-4.0*b.x;
  float hv=(b.y+lap*0.42-b.x*0.03)*0.972;
  float h=b.x+hv;
  h-=g*uPress*0.045;
  float ri=length(p-uImp.xy); h+=uImp.w*exp(-(ri*ri)/(uImp.z*uImp.z));
  oB=vec4(clamp(h,-1.5,1.5),hv,0.0,1.0);
}`;

// Height pass: o = (height css px, coverage, id/16, thickness 0..1)
const HEIGHT_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uMask, uA, uB;
uniform vec2 uRes;
uniform float uT, uDrain;
uniform float uFs[16];
uniform float uInfl[16];
uniform float uBorn[16];
uniform vec4 uDrop[24];
uniform vec4 uSel[2];
out vec4 o;
int idOf(vec4 m){ return clamp(int(floor(m.b*255.0/16.0+0.5)),0,15); }
void main(){
  vec2 px=vUv*uRes;
  vec2 d=texture(uA,vUv).xy;
  float rip=texture(uB,vUv).x;
  int id0=idOf(texture(uMask,(px-d)/uRes));
  float born=uBorn[id0];
  float delay=0.02+0.14*vUv.x+0.6*(1.0-vUv.y);
  float t=max(uT-born-delay,0.0);
  float off=0.2*uRes.y*exp(-4.4*t)*cos(7.4*t)-0.14*uRes.y*uDrain*uDrain;
  float wob=sin(px.y*0.045-t*12.0)*6.0*exp(-3.4*t);
  vec2 q=px-d-vec2(wob,off);
  vec4 m=texture(uMask,q/uRes);
  int id=idOf(m);
  // an inflated word swells about its centre and bulges over its neighbours
  for(int k=0;k<2;k++){
    vec4 sl=uSel[k];
    if(sl.w<0.002) continue;
    vec2 q2=sl.xy+(q-sl.xy)/(1.0+0.09*sl.w);
    vec4 m2=texture(uMask,q2/uRes);
    int id2=idOf(m2);
    if(id==int(sl.z) || (id2==int(sl.z) && m2.r>=m.r*0.5)){ m=m2; id=id2; }
  }
  // a word that is re-pouring never drags settled neighbours along with it
  if(id!=id0 && abs(uBorn[id]-born)>0.01) m=vec4(0.0);
  float fs=uFs[id], inf=uInfl[id];
  float crisp=smoothstep(0.05,0.8,t)*(1.0-0.8*uDrain);
  float field=mix(m.g*1.12,m.r,crisp);
  field=max(field,mix(field,m.g*1.2,clamp(inf,0.0,1.4)*0.12));
  float thr=0.5-0.025*inf;
  float fw=max(fwidth(field),1e-4)*0.8;
  float sil=smoothstep(thr-fw,thr+fw,field);
  float e=smoothstep(thr,0.985+0.12*inf,field);
  float bev=sqrt(e*(2.0-e));
  float dome=smoothstep(0.3,1.0+0.15*inf,m.g);
  float grow=(1.0-exp(-5.0*t)*cos(9.0*t))*smoothstep(0.0,0.12,t)*(1.0-smoothstep(0.15,1.0,uDrain));
  float H=fs*0.15*(1.0+0.7*inf)*grow;
  float h=sil*H*bev*(0.5+0.5*dome)*clamp(1.0+1.1*rip,0.3,2.4);
  float thick=sil*bev*(0.35+0.65*dome);
  float a=sil*step(0.01,H);
  float hid=float(id);
  for(int k=0;k<24;k++){
    vec4 dr=uDrop[k];
    if(dr.z<=0.0) continue;
    float dd=length(px-dr.xy);
    float x=clamp(1.0-dd*dd/(dr.z*dr.z),0.0,1.0);
    float hd=dr.z*0.85*sqrt(x);
    if(hd>h){ h=hd; hid=dr.w; thick=0.25+0.5*sqrt(x); }
    a=max(a,clamp((dr.z-dd)*1.6,0.0,1.0));
  }
  o=vec4(h,a,hid/16.0,thick);
}`;

const SHADE_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uH, uB;
uniform vec2 uRes, uRpx, uBTex;
uniform float uDpr, uSplit, uLod, uAxis;
uniform vec3 uCol[16];
uniform float uInfl[16];
uniform vec3 uTop, uBot, uTintTop, uTintBot;
out vec4 o;
float side(vec2 p, float w){ return uAxis<0.5 ? smoothstep(uSplit-w,uSplit+w,p.y) : 1.0-smoothstep(uSplit-w,uSplit+w,p.x); }
vec3 bg(vec2 p){
  vec3 c=mix(uBot,uTop,side(p,0.7));
  vec2 g=mod(p,28.0)-14.0;
  float dt=1.0-smoothstep(0.9,1.9,length(g));
  float lum=dot(c,vec3(0.3,0.59,0.11));
  return lum<0.4 ? c+dt*0.045 : c*(1.0-dt*0.075);
}
float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
void main(){
  vec4 c=texture(uH,vUv);
  float hl=texture(uH,vUv-vec2(uRpx.x,0.0)).r, hr=texture(uH,vUv+vec2(uRpx.x,0.0)).r;
  float hd=texture(uH,vUv-vec2(0.0,uRpx.y)).r, hu=texture(uH,vUv+vec2(0.0,uRpx.y)).r;
  vec2 grad=vec2(hr-hl,hu-hd)*0.5*uDpr;
  vec3 n=normalize(vec3(-grad,1.0));
  float bl=texture(uB,vUv-vec2(uBTex.x,0.0)).x, br=texture(uB,vUv+vec2(uBTex.x,0.0)).x;
  float bd=texture(uB,vUv-vec2(0.0,uBTex.y)).x, bu=texture(uB,vUv+vec2(0.0,uBTex.y)).x;
  vec2 rg=vec2(br-bl,bu-bd);
  vec2 p=vUv*uRes;
  vec2 so=vec2(-10.0,14.0);
  float s1=textureLod(uH,(p+so)/uRes,uLod+1.2).g;
  float s2=textureLod(uH,(p+so*0.3)/uRes,uLod).g;
  float shadow=clamp(s1*0.42+s2*0.38,0.0,0.8);
  vec3 tint=mix(uTintBot,uTintTop,side(p,24.0));
  vec3 B=bg(p+rg*16.0);
  B*=mix(vec3(1.0),tint,shadow);
  B+=dot(rg,vec2(-0.55,0.8))*0.9;
  int id=clamp(int(c.b*16.0+0.5),0,15);
  vec3 base=uCol[id];
  float th=clamp(c.a,0.0,1.0);
  vec3 refr=bg(p+n.xy*(12.0+30.0*th));
  vec3 trans=refr*base*1.55;
  vec3 deep=base*base*0.9;
  float inf=clamp(uInfl[id],0.0,1.3);
  vec3 body=mix(base*1.08,deep,smoothstep(0.2,1.0,th)*0.55*(1.0-0.6*inf));
  vec3 L=normalize(vec3(-0.45,0.6,0.66));
  float dif=clamp(dot(n,L),0.0,1.0);
  vec3 gel=mix(trans,body,0.5+0.45*th);
  gel*=(0.74+0.36*dif)*(1.0+0.1*inf);
  gel+=base*vec3(1.0,0.9,0.85)*0.22*(1.0-dif)*(1.0-th);
  vec3 Hh=normalize(L+vec3(0.0,0.0,1.0));
  float sp=pow(max(dot(n,Hh),0.0),110.0-20.0*inf)*(1.35+0.3*inf);
  vec3 r=reflect(vec3(0.0,0.0,-1.0),n);
  float box=smoothstep(0.17,0.10,abs(r.x+0.36))*smoothstep(0.13,0.06,abs(r.y-0.46));
  float box2=smoothstep(0.30,0.18,abs(r.x-0.48))*smoothstep(0.08,0.03,abs(r.y+0.30))*0.35;
  float fres=pow(1.0-clamp(n.z,0.0,1.0),2.2);
  gel+=vec3(1.0,0.98,0.95)*(sp+box*0.85+box2);
  gel=mix(gel,mix(base,vec3(1.0),0.55),fres*0.32);
  vec3 col=mix(B,gel,c.g);
  col+=(hash(p+fract(uDpr))-0.5)/200.0;
  o=vec4(col,1.0);
}`;

/* ---------------- world ---------------- */
export default {
  id: 'design',
  color: C.butter,
  async mount(root, ctx) {
    const { person, work, principles, withdrawn } = ctx;
    const cases = ctx.cases || {};
    const capabilities = ctx.capabilities || [];
    const about = ctx.about || { facts: [] };
    const reduced = !!ctx.reduced;
    const off = [];
    const timers = new Set();
    const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); off.push(() => t.removeEventListener(ev, fn, opt)); };
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    const bySlug = Object.fromEntries(work.map((w) => [w.slug, w]));
    const byName = Object.fromEntries(work.map((w) => [w.name, w]));

    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = FONT_URL;
    document.head.appendChild(link);
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const el = (tag, cls, text, attrs) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    };
    const ext = (text, href) => el('a', null, text, { href, target: '_blank', rel: 'noopener' });

    /* ---- shell DOM ---- */
    const wrap = el('div', 'dz');
    const canvas = el('canvas', null, null, { 'aria-hidden': 'true' });
    const ui = el('main', 'dz-ui');
    const index = el('nav', 'dz-index', null, { 'aria-label': 'Site index' });
    const IDX = [['#', person.name, 'home'], ['#work', 'Work', 'work'], ['#how', 'How I work', 'how'], ['#withdrawn', 'Claims I withdrew', 'withdrawn'],
      ['#capabilities', 'Capabilities', 'capabilities'], ['#about', 'About', 'about'], ['#contact', 'Contact', 'contact']];
    const idxLinks = IDX.map(([h, t, k], i) => {
      const a = el('a', i === 0 ? 'dz-home' : null, t, { href: h });
      a.dataset.k = k;
      index.appendChild(a);
      return a;
    });
    wrap.append(canvas, ui, index);
    root.appendChild(wrap);

    /* ---- fonts ---- */
    const cssReady = new Promise((r) => { link.onload = r; link.onerror = r; });
    const fontsReady = cssReady.then(() => Promise.all([
      document.fonts.load('900 100px "Fraunces"', 'VamsiVenkatesh0123456789'),
      document.fonts.load('400 20px "Bricolage Grotesque"', 'design'),
      document.fonts.load('700 20px "Bricolage Grotesque"', 'design'),
    ])).catch(() => {});
    await Promise.race([fontsReady, new Promise((r) => setTimeout(r, 3000))]);

    const meas = document.createElement('canvas').getContext('2d');
    const mw = (text, fs) => { meas.font = `900 ${fs}px Fraunces`; return meas.measureText(text).width; };
    const wrapLines = (text, fs, maxW) => {
      const words = text.split(' '); const lines = []; let cur = '';
      for (const w of words) { const t = cur ? cur + ' ' + w : w; if (cur && mw(t, fs) > maxW) { lines.push(cur); cur = w; } else cur = t; }
      if (cur) lines.push(cur);
      return lines;
    };
    let W = 0, H = 0, narrow = false, G = 48;
    const measure = () => {
      W = root.clientWidth; H = root.clientHeight;
      narrow = W < 760 || W / H < 0.82;
      wrap.classList.toggle('dz--narrow', narrow);
      G = narrow ? 18 : Math.max(28, Math.min(W * 0.05, 80));
      wrap.style.setProperty('--g', G + 'px');
      wrap.style.setProperty('--gap', Math.round(Math.max(28, W * 0.045)) + 'px');
    };
    measure();

    /* ---- routes ---- */
    const parse = (h) => {
      const s = (h || '').replace(/^#\/?/, '');
      const [a, b] = s.split('/');
      if (a === 'work' && b && bySlug[b]) return { k: 'case', slug: b };
      if (a === 'how') return { k: 'how', step: Math.min(principles.length, Math.max(1, +b || 1)) };
      if (a === 'withdrawn') return { k: 'withdrawn', step: Math.min(withdrawn.length, Math.max(1, +b || 1)) };
      if (a === 'capabilities' || a === 'about' || a === 'contact') return { k: a };
      if (a === 'work') return { k: 'home', work: true };
      return { k: 'home' };
    };
    const keyOf = (r) => r.k + (r.slug ? '/' + r.slug : '') + (r.step ? '/' + r.step : '') + (r.work ? '+w' : '');
    const go = (hash) => {
      if (location.hash === hash || (hash === '#' && !location.hash)) render(parse(hash));
      else location.hash = hash;
    };
    const subject = encodeURIComponent('Hello Vamsi, from ' + (ctx.org ? ctx.org : 'a designer'));
    const mailto = 'mailto:' + person.email + '?subject=' + subject;

    /* ---- shared state used by compositions ---- */
    const fsArr = new Float32Array(16), infl = new Float32Array(16), inflV = new Float32Array(16), inflT = new Float32Array(16);
    const born = new Float32Array(16).fill(-100);
    const baseCol = new Array(16).fill(C.cobalt);
    const centers = new Array(16).fill(null);
    let comp = null, curKey = '', tSec = reduced ? 1000 : 0, drain = 0, drainT0 = -1, split = 0, axis = 0;
    let dragDist = 0;

    /* ---- compositions ---- */
    // Each builder returns { el, theme, gels:[[node,id,colour]], fit(), split(), focus, onShow?, onKey? }
    let idCounter = 0;
    const gid = () => Math.min(MAXID, ++idCounter);
    const theme = (a, b, fg, gelc, sel) => ({ a, b, fg, gelc, sel });

    const buildHome = (r) => {
      idCounter = 0;
      const c = el('div', 'dz-comp');
      const h1 = el('h1', 'dz-name dz-gel', null, { 'aria-label': person.name });
      const n1 = el('span', null, person.first), n2 = el('span', null, person.last);
      h1.append(n1, n2);
      const mid = el('div', 'dz-mid');
      const list = el('ul', 'dz-list', null, { 'aria-label': 'Work: eight products' });
      const info = el('section', 'dz-info');
      info.append(el('p', 'dz-kick', 'Poured for a designer'), el('p', 'dz-lede dz-flex', person.lede));
      const gels = [[n1, gid(), C.tomato], [n2, gid(), C.tomato]];
      const btns = work.map((w) => {
        const li = el('li');
        const b = el('button', 'dz-p', w.name, { type: 'button', 'aria-label': w.name + ': open the case' });
        const id = gid();
        b.addEventListener('click', () => { if (dragDist > 12) return; inflT[id] = 1; go('#work/' + w.slug); });
        b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') inflT[id] = 0.4; });
        b.addEventListener('pointerleave', () => { inflT[id] = 0; });
        b.addEventListener('focus', () => { inflT[id] = 0.4; });
        b.addEventListener('blur', () => { inflT[id] = 0; });
        li.appendChild(b); list.appendChild(li);
        gels.push([b, id, C.cobalt]);
        return b;
      });
      mid.append(list, info);
      const foot = el('div', 'dz-foot');
      foot.append(el('p', 'dz-design dz-flex', 'Eight products, designed, built and run end to end. Interface and interaction design is part of every one of them.'),
        el('p', 'dz-hint', ctx.isTouch ? 'Drag through the type. Tap a name to open its case.' : 'Push the type with your cursor. Click a name to open its case.'));
      c.append(h1, mid, foot);
      return {
        el: c, gels, theme: theme(C.butter, C.blush, C.ink, C.cobalt, C.cherry), focus: r.work ? btns[0] : h1, axis: 0,
        fit() {
          const wv = mw(person.first, 100), wk = mw(person.last, 100);
          const widest = Math.max(...work.map((w) => mw(w.name, 100)));
          let fsN, fsP;
          if (narrow) { fsN = Math.min((W - 2 * G) / wk * 98, H * 0.115); fsP = Math.min(30, (W - 2 * G) / widest * 90); }
          else { fsN = Math.min((W - 2 * G) / (wv + wk + 22) * 98.5, (H - 84) * 0.22); fsP = Math.min((H - 84 - fsN * 1.3 - 120) / (8 * 1.17), (W * 0.46) / widest * 100, 84); }
          const fits = () => {
            if (c.scrollHeight > c.clientHeight + 1) return false;
            const lb = list.getBoundingClientRect(), fb = foot.getBoundingClientRect(), nb = h1.getBoundingClientRect();
            if (lb.bottom > fb.top + 1 || lb.top < nb.bottom + fsP * 0.25) return false;
            if (narrow && info.getBoundingClientRect().height < Math.min(110, H * 0.16)) return false;
            return true;
          };
          for (let k = 0; k < 24; k++) {
            c.style.setProperty('--fsN', fsN.toFixed(2) + 'px'); c.style.setProperty('--fsP', fsP.toFixed(2) + 'px');
            if (fits()) break;
            fsP *= 0.95; if (narrow && k % 3 === 2) fsN *= 0.97;
          }
        },
        split() {
          const rr = root.getBoundingClientRect();
          const nb = h1.getBoundingClientRect().bottom - rr.top, lt = list.getBoundingClientRect().top - rr.top, it = info.getBoundingClientRect().top - rr.top;
          const fsP = parseFloat(getComputedStyle(list).fontSize);
          return narrow ? lt - fsP * 0.15 : (nb + Math.min(lt, it)) / 2;
        },
      };
    };

    // rail + reader spread, shared by cases, capabilities and about
    const spread = ({ kick, title, gelc, sections, tail, extraRail }) => {
      const c = el('div', 'dz-comp');
      const sp = el('div', 'dz-spread');
      const rail = el('aside', 'dz-rail');
      const reader = el('article', 'dz-reader', null, { tabindex: '0', 'aria-label': title });
      const col = el('div', 'dz-col');
      reader.appendChild(col);
      if (kick) rail.appendChild(el('p', 'dz-kick', kick));
      const h = el('h1', 'dz-gel dz-ttl', title, { tabindex: '-1' });
      rail.appendChild(h);
      const gels = [[h, gid(), gelc]];
      const secEls = sections.map((s, i) => {
        const sec = el('section', 'dz-sec', null, { 'aria-label': s.label, tabindex: '-1' });
        if (s.heading !== false) sec.appendChild(el('h2', 'dz-h', s.heading || s.label));
        s.fill(sec);
        col.appendChild(sec);
        return sec;
      });
      if (tail) col.appendChild(tail);
      let tocBtns = [], curId = 0, curIdx = -1;
      const cur = el('p', 'dz-gel dz-cur', sections[0].label, { 'aria-hidden': 'true' });
      if (!narrow) {
        const toc = el('nav', 'dz-toc', null, { 'aria-label': 'Sections' });
        tocBtns = sections.map((s, i) => {
          const b = el('button', 'dz-tb', s.label, { type: 'button' });
          const id = gid();
          b.addEventListener('click', () => { if (dragDist > 12) return; reader.scrollTo({ top: secEls[i].offsetTop - 4, behavior: reduced ? 'auto' : 'smooth' }); secEls[i].focus({ preventScroll: true }); });
          toc.appendChild(b); gels.push([b, id, gelc]);
          return { b, id };
        });
        rail.appendChild(toc);
      } else {
        curId = gid();
        rail.appendChild(cur);
        gels.push([cur, curId, gelc]);
      }
      if (extraRail) rail.appendChild(extraRail);
      sp.append(rail, reader);
      c.appendChild(sp);
      const fitCur = () => {
        const fsT = parseFloat(c.style.getPropertyValue('--fsC')) || 28;
        cur.style.fontSize = Math.min(fsT, (W - 2 * G) / mw(cur.textContent, 100) * 100).toFixed(2) + 'px';
      };
      const track = () => {
        const y = reader.scrollTop + reader.clientHeight * 0.28;
        let i = 0;
        secEls.forEach((s, k) => { if (s.offsetTop <= y) i = k; });
        if (reader.scrollTop > 0 && reader.scrollTop + reader.clientHeight >= reader.scrollHeight - 4) i = secEls.length - 1;
        if (i === curIdx) return;
        curIdx = i;
        if (!narrow) tocBtns.forEach((t, k) => { inflT[t.id] = k === i ? 0.55 : 0; if (k === i) t.b.setAttribute('aria-current', 'location'); else t.b.removeAttribute('aria-current'); });
        else if (cur.textContent !== sections[i].label) { cur.textContent = sections[i].label; fitCur(); repour(curId); }
      };
      reader.addEventListener('scroll', track, { passive: true });
      return {
        el: c, gels, reader, axis: narrow ? 0 : 1, focus: h,
        fit() {
          const rw = narrow ? W - 2 * G : rail.getBoundingClientRect().width - 8;
          const avail = H - 84 - 50;
          let fsH = Math.min(narrow ? 46 : 104, rw / mw(title, 100) * 100);
          if (narrow) { h.style.fontSize = fsH.toFixed(2) + 'px'; c.style.setProperty('--fsC', Math.min(28, fsH * 0.62) + 'px'); fitCur(); return; }
          const widest = Math.max(...sections.map((s) => mw(s.label, 100)));
          let fsT = Math.min(44, rw / widest * 100, (avail - fsH * 1.5 - 90) / (sections.length * 1.2 + 0.9));
          fsH = Math.min(fsH, fsT * 2.4);
          h.style.fontSize = fsH.toFixed(2) + 'px';
          c.style.setProperty('--fsT', fsT.toFixed(2) + 'px');
          for (let k = 0; k < 12 && rail.scrollHeight > rail.clientHeight + 1; k++) { fsT *= 0.94; c.style.setProperty('--fsT', fsT.toFixed(2) + 'px'); }
        },
        split() {
          const rr = root.getBoundingClientRect(), rb = rail.getBoundingClientRect(), rd = reader.getBoundingClientRect();
          return narrow ? rb.bottom - rr.top : (rb.right + rd.left) / 2 - rr.left;
        },
        onShow: () => { curIdx = -1; track(); },
      };
    };

    const buildCase = (r) => {
      idCounter = 0;
      const w = bySlug[r.slug], k = cases[r.slug];
      const [field, gelc] = PROD_THEME[r.slug] || [C.butter, C.cobalt];
      const sections = [];
      const P = (sec, t) => sec.appendChild(el('p', null, t));
      const UL = (sec, arr) => { const u = el('ul', 'dz-ul'); arr.forEach((t) => u.appendChild(el('li', null, t))); sec.appendChild(u); };
      const NUMS = (sec, arr) => {
        const g = el('div', 'dz-nums');
        arr.forEach((n) => { const d = el('div'); d.append(el('span', 'v', n.value), el('span', 'l', n.label)); if (n.date) d.appendChild(el('time', null, n.date)); g.appendChild(d); });
        sec.appendChild(g);
      };
      const LINKS = (sec, arr) => { const u = el('ul', 'dz-links'); arr.forEach(([t, u2]) => { const li = el('li'); li.appendChild(ext(t + ' ↗', u2)); u.appendChild(li); }); sec.appendChild(u); };
      const caseLink = ['Full case study on vamsivenkatesh.com', `https://vamsi-venkatesh.github.io/portfolio-designs/inside-the-dot/work/${w.slug}/`];
      if (k) {
        sections.push({ label: 'Summary', heading: false, fill: (s) => {
          s.appendChild(el('p', 'dz-meta', [k.category, k.status, k.period].filter(Boolean).join(' · ')));
          s.appendChild(el('p', 'dz-dek', k.one_line)); P(s, k.summary); P(s, k.role);
        } });
        sections.push({ label: 'Problem', fill: (s) => P(s, k.problem) });
        sections.push({ label: 'Constraints', fill: (s) => UL(s, k.constraints) });
        sections.push({ label: 'Built', heading: 'What I built', fill: (s) => {
          const g = el('div', 'dz-items');
          k.built.forEach((b) => { const d = el('div', 'dz-it'); d.append(el('b', null, b.title), el('span', null, b.body)); g.appendChild(d); });
          s.appendChild(g);
        } });
        sections.push({ label: 'How it works', fill: (s) => {
          const o = el('ol', 'dz-steps');
          k.how_it_works.forEach((x) => { const li = el('li'); const d = el('div'); d.append(el('b', null, x.step), el('span', null, x.body)); li.appendChild(d); o.appendChild(li); });
          s.appendChild(o);
        } });
        sections.push({ label: 'Decisions', fill: (s) => {
          const g = el('div', 'dz-dec');
          k.decisions.forEach((x) => { const d = el('div'); d.append(el('h4', null, x.decision), el('span', null, x.why)); if (x.tradeoff) d.appendChild(el('span', 't', x.tradeoff)); g.appendChild(d); });
          s.appendChild(g);
        } });
        sections.push({ label: 'Evaluation', fill: (s) => {
          const g = el('div', 'dz-ev');
          k.evaluation.forEach((x) => { const d = el('div', 'dz-it'); d.append(el('b', null, x.what), el('span', null, x.result)); if (x.date) d.appendChild(el('time', null, x.date)); g.appendChild(d); });
          s.appendChild(g);
        } });
        sections.push({ label: 'Numbers', fill: (s) => NUMS(s, k.numbers) });
        sections.push({ label: 'Stack', fill: (s) => { const u = el('ul', 'dz-stack'); k.stack.forEach((t) => u.appendChild(el('li', null, t))); s.appendChild(u); } });
        sections.push({ label: 'Links', fill: (s) => LINKS(s, [...k.links.map((l) => [l.label, l.url]), caseLink]) });
        sections.push({ label: 'Limits', fill: (s) => UL(s, k.limits) });
      } else {
        sections.push({ label: 'Overview', heading: false, fill: (s) => {
          s.appendChild(el('p', 'dz-meta', [w.kind, w.status].join(' · ')));
          s.appendChild(el('p', 'dz-dek', w.one)); P(s, w.line);
        } });
        sections.push({ label: 'Problem', fill: (s) => P(s, w.problem) });
        sections.push({ label: 'Plan', fill: (s) => P(s, w.plan) });
        sections.push({ label: 'Built', heading: 'What I built', fill: (s) => UL(s, w.built) });
        sections.push({ label: 'Checks', fill: (s) => UL(s, w.checks) });
        sections.push({ label: 'Numbers', fill: (s) => NUMS(s, (w.stage || w.numbers).map(([value, label]) => ({ value, label }))) });
        sections.push({ label: 'Links', fill: (s) => LINKS(s, [...(w.links || (w.url ? [[w.host, w.url]] : [])), caseLink]) });
      }
      const i = work.indexOf(w), prev = work[(i + work.length - 1) % work.length], next = work[(i + 1) % work.length];
      const tail = el('div', 'dz-end');
      const mk = (lbl, x) => { const b = el('button', 'dz-lnk'); b.type = 'button'; b.append(el('small', null, lbl), document.createTextNode(x.name)); b.addEventListener('click', () => go('#work/' + x.slug)); return b; };
      tail.append(mk('Previous case', prev), mk('Next case', next));
      const pn = el('div', 'dz-pn');
      const pb = el('button', 'dz-lnk', '← ' + prev.name, { type: 'button' }), nb = el('button', 'dz-lnk', next.name + ' →', { type: 'button' });
      pb.addEventListener('click', () => go('#work/' + prev.slug)); nb.addEventListener('click', () => go('#work/' + next.slug));
      const allb = el('button', 'dz-lnk', 'All work', { type: 'button' }); allb.addEventListener('click', () => go('#work'));
      pn.append(pb, nb, allb);
      const s = spread({ kick: 'Case ' + (i + 1) + ' of ' + work.length + (k ? ' · in depth' : ''), title: w.name, gelc, sections, tail, extraRail: pn });
      s.theme = theme(field, C.cream, C.ink, gelc, deeper(gelc));
      s.onKey = (e) => { if (e.key === 'ArrowLeft') go('#work/' + prev.slug); else if (e.key === 'ArrowRight') go('#work/' + next.slug); else return false; return true; };
      return s;
    };

    const buildCaps = () => {
      idCounter = 0;
      // a designer sees the design group first
      const groups = [...capabilities].sort((a, b) => (/design/i.test(b[0]) ? 1 : 0) - (/design/i.test(a[0]) ? 1 : 0));
      const sections = groups.map(([gname, skills]) => ({
        label: gname,
        fill: (sec) => {
          if (!narrow) {
            const t = el('table', 'dz-mx');
            const th = el('thead'); const tr = el('tr');
            tr.appendChild(el('th', null, null, { scope: 'col' })).appendChild(el('span', 'dz-sr', 'Skill'));
            work.forEach((w) => { const c2 = el('th', null, null, { scope: 'col' }); const b = el('button', 'dz-lnk', w.name, { type: 'button', title: 'Open the ' + w.name + ' case' }); b.addEventListener('click', () => go('#work/' + w.slug)); c2.appendChild(b); tr.appendChild(c2); });
            th.appendChild(tr); t.appendChild(th);
            const tb = el('tbody');
            skills.forEach(([skill, prods]) => {
              const row = el('tr');
              const h = el('th', null, skill, { scope: 'row' });
              h.appendChild(el('span', 'dz-sr', ': ' + prods.join(', ')));
              row.appendChild(h);
              work.forEach((w) => { const td = el('td', null, null, { 'aria-hidden': 'true' }); if (prods.includes(w.name)) td.appendChild(el('span', 'dz-dot')); row.appendChild(td); });
              tb.appendChild(row);
            });
            t.appendChild(tb); sec.appendChild(t);
          } else {
            const u = el('ul', 'dz-cl');
            skills.forEach(([skill, prods]) => {
              const li = el('li'); li.appendChild(el('b', null, skill));
              const ch = el('div', 'dz-chips');
              prods.forEach((p) => { const w = byName[p]; if (!w) return; const b = el('button', 'dz-lnk', p, { type: 'button' }); b.addEventListener('click', () => go('#work/' + w.slug)); ch.appendChild(b); });
              li.appendChild(ch); u.appendChild(li);
            });
            sec.appendChild(u);
          }
        },
      }));
      const s = spread({ kick: 'Skills × products · open a product for its case', title: 'Capabilities', gelc: C.cobalt, sections });
      s.theme = theme(C.mint, C.cream, C.ink, C.cobalt, C.navy);
      return s;
    };

    const buildAbout = () => {
      idCounter = 0;
      const sections = [
        { label: 'Looking for', heading: 'What I am looking for', fill: (sec) => {
          sec.appendChild(el('p', 'dz-meta', person.availability));
          sec.appendChild(el('p', 'dz-dek', person.wants));
        } },
        { label: 'Roles', heading: 'Roles', fill: (sec) => { const u = el('ul', 'dz-ul'); person.roles.forEach((x) => u.appendChild(el('li', null, x))); sec.appendChild(u); } },
        { label: 'Facts', heading: 'The facts', fill: (sec) => {
          const dl = el('dl', 'dz-facts');
          let last = '';
          about.facts.forEach(([kk, v]) => { const label = kk || last; last = label; const dt = el('dt', null, kk || null); if (!kk) dt.appendChild(el('span', 'dz-sr', label)); dl.append(dt, el('dd', null, v)); });
          sec.appendChild(dl);
          const ct = el('p', 'dz-ct');
          ct.append(el('a', null, person.email, { href: mailto }), ext('LinkedIn ↗', person.linkedin), ext('GitHub ↗', person.github));
          sec.appendChild(ct);
        } },
      ];
      const s = spread({ kick: person.role + ' · ' + person.city, title: 'About', gelc: C.tomato, sections });
      s.theme = theme(C.sky, C.cream, C.ink, C.tomato, C.cherry);
      return s;
    };

    // a stage: one poured composition, no scrolling; its parts pour in turn
    const stageRow = (count, cur, hashBase, gelc, stepGels, nextLabel, nextHash) => {
      const row = el('div', 'dz-steprow', null, { role: 'group', 'aria-label': 'Parts' });
      for (let k = 1; k <= count; k++) {
        const b = el('button', 'dz-sb', String(k), { type: 'button', 'aria-label': 'Part ' + k + ' of ' + count });
        if (k === cur) b.setAttribute('aria-current', 'step');
        const id = gid();
        b.addEventListener('click', () => { if (dragDist > 12) return; go(hashBase + '/' + k); });
        row.appendChild(b); stepGels.push([b, id, gelc]);
        if (k === cur) inflT[id] = 0.7;
      }
      const nx = el('button', 'dz-lnk dz-nx', nextLabel, { type: 'button' });
      nx.addEventListener('click', () => go(nextHash));
      row.appendChild(nx);
      return row;
    };

    const buildHow = (r) => {
      idCounter = 0;
      const p = principles[r.step - 1];
      const c = el('div', 'dz-comp');
      const st = el('div', 'dz-stage');
      const kick = el('p', 'dz-kick', 'How I work · ' + r.step + ' of ' + principles.length);
      const big = el('h1', 'dz-gel', null, { 'aria-label': p.k, tabindex: '-1' });
      const body = el('p', 'dz-body', p.v);
      const bid = gid();
      st.append(kick, big, body);
      const last = r.step === principles.length;
      const stepGels = [];
      const row = stageRow(principles.length, r.step, '#how', C.butter, stepGels, last ? 'Next: claims I withdrew →' : 'Next principle →', last ? '#withdrawn' : '#how/' + (r.step + 1));
      c.append(st, row);
      const gels = [];
      return {
        el: c, gels, theme: theme(C.cobalt, C.cobalt, C.paper, C.butter, C.tomato), focus: big, axis: 0,
        fit() {
          const maxW = Math.min(W - 2 * G, 1180);
          let fs = narrow ? 56 : Math.min(104, H * 0.115);
          c.style.setProperty('--fsS', (narrow ? 34 : 54) + 'px');
          for (let k = 0; k < 18; k++) {
            big.replaceChildren(...wrapLines(p.k, fs, maxW).map((ln) => el('span', 'dz-gl', ln, { 'aria-hidden': 'true' })));
            big.style.fontSize = fs + 'px';
            if (c.scrollHeight <= c.clientHeight + 10) break;
            fs *= 0.93;
          }
          gels.length = 0;
          big.querySelectorAll('.dz-gl').forEach((s) => gels.push([s, bid, C.butter]));
          gels.push(...stepGels);
        },
        split: () => -1,
        onKey: (e) => { if (e.key === 'ArrowRight' && !last) go('#how/' + (r.step + 1)); else if (e.key === 'ArrowLeft' && r.step > 1) go('#how/' + (r.step - 1)); else return false; return true; },
      };
    };

    const buildWithdrawn = (r) => {
      idCounter = 0;
      const wd = withdrawn[r.step - 1];
      const c = el('div', 'dz-comp');
      const st = el('div', 'dz-stage');
      const kick = el('p', 'dz-kick', 'Claims I withdrew · ' + r.step + ' of ' + withdrawn.length);
      const nums = el('div', 'dz-wnums');
      const gels = [];
      wd.numbers.forEach(([v, l]) => {
        const box = el('div', 'dz-wn');
        const g = el('p', 'dz-gel', v);
        box.append(g, el('span', null, l));
        nums.appendChild(box);
        gels.push([g, gid(), C.tomato]);
      });
      const t = el('h1', 'dz-wt', wd.title, { tabindex: '-1' });
      const body = el('p', 'dz-body', wd.what);
      const lk = el('p', 'dz-body'); lk.appendChild(ext(wd.link[0] + ' ↗', wd.link[1]));
      st.append(kick, nums, t, body, lk);
      const last = r.step === withdrawn.length;
      const row = stageRow(withdrawn.length, r.step, '#withdrawn', C.tomato, gels, last ? 'Next: capabilities →' : 'Next claim →', last ? '#capabilities' : '#withdrawn/' + (r.step + 1));
      c.append(st, row);
      return {
        el: c, gels, theme: theme(C.ink, C.ink, C.paper, C.tomato, C.butter), focus: t, axis: 0,
        fit() {
          let fs = narrow ? 64 : Math.min(150, H * 0.17);
          c.style.setProperty('--fsS', (narrow ? 34 : 54) + 'px');
          for (let k = 0; k < 18; k++) {
            c.style.setProperty('--fsW', fs + 'px');
            if (c.scrollHeight <= c.clientHeight + 10 && nums.scrollWidth <= nums.clientWidth + 1) break;
            fs *= 0.92;
          }
        },
        split: () => -1,
        onKey: (e) => { if (e.key === 'ArrowRight' && !last) go('#withdrawn/' + (r.step + 1)); else if (e.key === 'ArrowLeft' && r.step > 1) go('#withdrawn/' + (r.step - 1)); else return false; return true; },
      };
    };

    const buildContact = () => {
      idCounter = 0;
      const c = el('div', 'dz-comp');
      const st = el('div', 'dz-stage');
      const kick = el('p', 'dz-kick', person.availability);
      const t = el('h1', 'dz-gel', 'Write to me', { tabindex: '-1' });
      const mail = el('a', 'dz-gel', person.email, { href: mailto, 'aria-label': 'Email ' + person.email });
      mail.style.display = 'block'; mail.style.textDecoration = 'none'; mail.style.width = 'max-content';
      const body = el('p', 'dz-body', person.wants);
      const ct = el('p', 'dz-ct');
      ct.append(el('a', null, 'Email ' + person.first, { href: mailto }), ext('LinkedIn ↗', person.linkedin), ext('GitHub ↗', person.github), el('span', null, person.city));
      st.append(kick, t, mail, body, ct);
      c.appendChild(st);
      const gels = [[t, gid(), C.butter], [mail, gid(), C.butter]];
      return {
        el: c, gels, theme: theme(C.tomato, C.tomato, C.ink, C.butter, C.paper), focus: t, axis: 0,
        fit() {
          const maxW = W - 2 * G;
          let fsT = Math.min(narrow ? 64 : 150, maxW / mw('Write to me', 100) * 100, H * 0.16);
          let fsM = Math.min(narrow ? 44 : 84, maxW / mw(person.email, 100) * 98);
          for (let k = 0; k < 18; k++) {
            t.style.fontSize = fsT + 'px'; mail.style.fontSize = fsM + 'px'; mail.style.marginTop = (fsM * 0.25) + 'px';
            if (c.scrollHeight <= c.clientHeight + 10) break;
            fsT *= 0.93; fsM *= 0.95;
          }
        },
        split: () => -1,
      };
    };

    const build = (r) => r.k === 'case' ? buildCase(r) : r.k === 'how' ? buildHow(r) : r.k === 'withdrawn' ? buildWithdrawn(r)
      : r.k === 'capabilities' ? buildCaps() : r.k === 'about' ? buildAbout() : r.k === 'contact' ? buildContact() : buildHome(r);

    /* ---- GL ---- */
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
    const hasFloat = gl && (gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
    const useGL = !!(gl && hasFloat);
    let raf = 0, alive = true;
    if (!useGL) wrap.classList.add('nogl');

    const T = { a: hex3(C.butter), b: hex3(C.blush), sel: hex3(C.cherry) };
    const TT = { a: hex3(C.butter), b: hex3(C.blush), sel: hex3(C.cherry) };
    const tintOf = (c3) => c3.map((v) => 0.38 + 0.42 * v);

    let dpr = 1, RW = 0, RH = 0, GW = 0, GH = 0;
    let maskTex = null, hTex = null, hFbo = null, vao = null;
    const sim = [{}, {}]; let cur = 0;
    const maskCanvas = document.createElement('canvas');
    const pick = document.createElement('canvas');
    const pickCtx = pick.getContext('2d', { willReadFrequently: true });
    let pickData = null; const pickScale = 0.25;
    const texs = new Set(), fbos = new Set(), progs = [];
    let P_SIM, P_H, P_SH;

    const compile = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const mkTex = (w, h, internal, fmt, type, filter, mip) => {
      const t = gl.createTexture(); texs.add(t);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, fmt, type, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const freeTex = (t) => { if (t) { gl.deleteTexture(t); texs.delete(t); } };
    const freeFbo = (f) => { if (f) { gl.deleteFramebuffer(f); fbos.delete(f); } };
    const mkFbo = (...ts) => {
      const f = gl.createFramebuffer(); fbos.add(f);
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      ts.forEach((t, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0));
      gl.drawBuffers(ts.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      if (!ok) throw new Error('fbo incomplete');
      return f;
    };
    if (useGL) {
      const vs = compile(gl.VERTEX_SHADER, VS);
      const program = (fs) => {
        const p = gl.createProgram(); const f = compile(gl.FRAGMENT_SHADER, fs);
        gl.attachShader(p, vs); gl.attachShader(p, f); gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        gl.deleteShader(f);
        const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, ''); u[name] = gl.getUniformLocation(p, name); }
        progs.push(p);
        return { p, u };
      };
      P_SIM = program(SIM_FS); P_H = program(HEIGHT_FS); P_SH = program(SHADE_FS);
      gl.deleteShader(vs);
      vao = gl.createVertexArray();
    }

    const buildTargets = () => {
      if (!useGL) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      RW = Math.max(2, Math.round(W * dpr)); RH = Math.max(2, Math.round(H * dpr));
      canvas.width = RW; canvas.height = RH;
      freeTex(hTex); freeFbo(hFbo);
      hTex = mkTex(RW, RH, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR, true);
      hFbo = mkFbo(hTex);
      const cell = Math.max(5, Math.max(W, H) / 230);
      GW = Math.max(8, Math.round(W / cell)); GH = Math.max(8, Math.round(H / cell));
      for (const s of sim) {
        freeTex(s.a); freeTex(s.b); freeFbo(s.f);
        s.a = mkTex(GW, GH, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR, false);
        s.b = mkTex(GW, GH, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR, false);
        s.f = mkFbo(s.a, s.b);
        gl.bindFramebuffer(gl.FRAMEBUFFER, s.f);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const drawMask = () => {
      if (!comp) return;
      const rr = root.getBoundingClientRect();
      fsArr.fill(0); centers.fill(null);
      const items = [];
      for (const [node, id, colr] of comp.gels) {
        if (!node.isConnected) continue;
        const r = node.getBoundingClientRect();
        if (r.width < 1 || r.bottom < rr.top || r.top > rr.bottom) continue;
        const fs = parseFloat(getComputedStyle(node).fontSize);
        items.push({ text: node.textContent, fs, r, id });
        baseCol[id] = colr;
        if (!centers[id]) { fsArr[id] = fs; centers[id] = [r.left - rr.left + r.width / 2, H - (r.top - rr.top + r.height / 2), 0, r.width, fs]; }
      }
      const sp = comp.split();
      axis = comp.axis || 0;
      split = sp < 0 ? -1e5 : axis === 0 ? H - sp : sp;
      if (!useGL) return;
      maskCanvas.width = RW; maskCanvas.height = RH;
      const m = maskCanvas.getContext('2d');
      m.fillStyle = '#000'; m.fillRect(0, 0, RW, RH);
      const sx = RW / W, sy = RH / H;
      const idc = document.createElement('canvas'); idc.width = RW; idc.height = RH;
      const ic = idc.getContext('2d');
      ic.fillStyle = '#000'; ic.fillRect(0, 0, RW, RH); ic.lineJoin = 'round';
      m.globalCompositeOperation = 'lighter';
      for (const it of items) {
        m.font = `900 ${it.fs * sx}px Fraunces`;
        const mt = m.measureText(it.text);
        const A = mt.fontBoundingBoxAscent, D = mt.fontBoundingBoxDescent;
        const x = (it.r.left - rr.left) * sx;
        const base = (it.r.top - rr.top) * sy + (it.fs * sy - (A + D)) / 2 + A;
        m.filter = `blur(${(it.fs * 0.03 * sx).toFixed(2)}px)`;
        m.fillStyle = '#f00'; m.fillText(it.text, x, base);
        m.filter = `blur(${(it.fs * 0.1 * sx).toFixed(2)}px)`;
        m.fillStyle = '#0f0'; m.fillText(it.text, x, base);
        const cc = `rgb(0,0,${it.id * 16})`;
        ic.font = `900 ${it.fs * sx}px Fraunces`;
        ic.fillStyle = cc; ic.strokeStyle = cc; ic.lineWidth = it.fs * 0.26 * sx;
        ic.strokeText(it.text, x, base); ic.fillText(it.text, x, base);
      }
      m.filter = 'none';
      m.drawImage(idc, 0, 0);
      idc.width = idc.height = 0;
      if (!maskTex) maskTex = mkTex(RW, RH, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR, false);
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      pick.width = Math.max(1, Math.round(W * pickScale)); pick.height = Math.max(1, Math.round(H * pickScale));
      pickCtx.drawImage(maskCanvas, 0, 0, pick.width, pick.height);
      pickData = pickCtx.getImageData(0, 0, pick.width, pick.height).data;
      maskCanvas.width = maskCanvas.height = 1;
    };
    const materialAt = (x, yUp) => {
      if (!pickData) return 0;
      const px = Math.floor(x * pickScale), py = Math.floor((H - yUp) * pickScale);
      if (px < 0 || py < 0 || px >= pick.width || py >= pick.height) return 0;
      const i = (py * pick.width + px) * 4;
      if (pickData[i] < 100) return 0;
      return Math.min(MAXID, Math.round(pickData[i + 2] / 16));
    };
    function repour(id) { if (!reduced) { born[id] = tSec; born[0] = tSec; } drawMask(); if (reduced) draw(); }

    /* ---- navigation ---- */
    const applyTheme = (th, instant) => {
      TT.a = hex3(th.a); TT.b = hex3(th.b); TT.sel = hex3(th.sel);
      if (instant) { T.a = TT.a.slice(); T.b = TT.b.slice(); T.sel = TT.sel.slice(); }
      wrap.style.setProperty('--fg', th.fg);
      wrap.style.setProperty('--gelc', th.gelc);
      wrap.style.background = th.a;
    };
    const updateIndex = (r) => {
      const k = r.k === 'case' ? 'work' : r.k === 'home' ? (r.work ? 'work' : 'home') : r.k;
      idxLinks.forEach((a) => { if (a.dataset.k === k && k !== 'home') a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    };
    const swap = (r, instant) => {
      inflT.fill(0); infl.fill(0); inflV.fill(0);
      comp = build(r);
      comp.el.classList.add('pre');
      ui.replaceChildren(comp.el);
      comp.fit();
      applyTheme(comp.theme, instant);
      born.fill(reduced ? -100 : tSec);
      drain = 0; drainT0 = -1;
      drawMask();
      comp.onShow && comp.onShow();
      updateIndex(r);
      requestAnimationFrame(() => comp && comp.el.classList.remove('pre'));
      if (!instant && comp.focus) comp.focus.focus({ preventScroll: true });
      if (reduced) draw();
    };
    let swapT = 0;
    function render(r, first) {
      const key = keyOf(r);
      if (key === curKey) return;
      curKey = key;
      if (first || reduced || !comp) { swap(r, !!first); return; }
      comp.el.classList.add('out');
      drainT0 = performance.now();
      clearTimeout(swapT); timers.delete(swapT);
      swapT = later(() => swap(r, false), 330);
    }

    /* ---- pointer ---- */
    let mx = -1e4, my = -1e4, pmx = -1e4, pmy = -1e4, hover = false, down = false;
    let vx = 0, vy = 0, spd = 0, spdCss = -1, downX = 0, downY = 0, lastSplash = 0;
    let impulse = null, sx0 = -1e4, sy0 = -1e4;
    const toLocal = (e) => { const r = root.getBoundingClientRect(); return [e.clientX - r.left, H - (e.clientY - r.top)]; };
    on(root, 'pointermove', (e) => {
      const [x, y] = toLocal(e);
      if (pmx < -1e3) { pmx = x; pmy = y; }
      mx = x; my = y;
      hover = e.pointerType === 'mouse' || down;
      if (down) dragDist = Math.max(dragDist, Math.hypot(x - downX, y - downY));
    });
    on(root, 'pointerdown', (e) => {
      const [x, y] = toLocal(e);
      down = true; hover = true; mx = pmx = sx0 = x; my = pmy = sy0 = y; downX = x; downY = y; dragDist = 0;
      if (!reduced) impulse = [x, y, 30, -0.55];
    });
    on(root, 'pointerup', (e) => { down = false; if (e.pointerType !== 'mouse') hover = false; });
    on(root, 'pointercancel', () => { down = false; hover = false; });
    on(root, 'pointerleave', () => { down = false; hover = false; });
    on(window, 'hashchange', () => render(parse(location.hash)));
    on(document, 'keydown', (e) => {
      if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const tag = (e.target && e.target.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.key === 'Escape') { const r = parse(location.hash); if (r.k === 'case') go('#work'); else if (r.k !== 'home') go('#'); return; }
      if (comp && comp.onKey && comp.onKey(e)) e.preventDefault();
    });
    on(index, 'click', (e) => {
      const a = e.target.closest('a'); if (!a) return;
      e.preventDefault(); go(a.getAttribute('href'));
    });

    /* ---- drops ---- */
    const drops = [];
    const dropArr = new Float32Array(96);
    const selArr = new Float32Array(8);
    const spawnDrops = (x, y, dvx, dvy, id) => {
      const n = 2 + (Math.random() * 3 | 0);
      for (let k = 0; k < n; k++) {
        if (drops.length >= 24) drops.shift();
        const a = Math.random() * Math.PI * 2, s = 40 + Math.random() * 220;
        drops.push({ x, y, vx: dvx * (0.35 + Math.random() * 0.4) + Math.cos(a) * s, vy: dvy * (0.35 + Math.random() * 0.4) + Math.sin(a) * s,
          r0: (narrow ? 3 : 4) + Math.random() * (narrow ? 6 : 9), life: 0, id });
      }
    };

    /* ---- passes ---- */
    const texUnit = (u, loc, t) => { gl.activeTexture(gl.TEXTURE0 + u); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(loc, u); };
    const simStep = (dt, force) => {
      const s0 = sim[cur], s1 = sim[1 - cur];
      gl.bindFramebuffer(gl.FRAMEBUFFER, s1.f);
      gl.viewport(0, 0, GW, GH);
      gl.useProgram(P_SIM.p);
      const u = P_SIM.u;
      texUnit(0, u.uA, s0.a); texUnit(1, u.uB, s0.b);
      gl.uniform2f(u.uTexel, 1 / GW, 1 / GH);
      gl.uniform2f(u.uRes, W, H);
      gl.uniform2f(u.uM0, force && sx0 > -1e3 ? sx0 : mx, force && sx0 > -1e3 ? sy0 : my);
      gl.uniform2f(u.uM1, mx, my);
      gl.uniform2f(u.uMV, force && hover ? vx : 0, force && hover ? vy : 0);
      gl.uniform1f(u.uPress, hover ? (down ? 1 : 0.35) : 0);
      gl.uniform1f(u.uRad, narrow ? 40 : 52);
      gl.uniform1f(u.uDt, dt);
      gl.uniform1f(u.uK, 26); gl.uniform1f(u.uC, 3.6);
      gl.uniform1f(u.uMaxD, narrow ? 70 : 120);
      gl.uniform1f(u.uGain, 0.16);
      const imp = force && impulse ? impulse : [0, 0, 1, 0];
      gl.uniform4f(u.uImp, imp[0], imp[1], imp[2], imp[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      cur = 1 - cur;
    };
    const colArr = new Float32Array(48);
    const draw = () => {
      if (!useGL || !maskTex) return;
      gl.bindVertexArray(vao);
      gl.bindFramebuffer(gl.FRAMEBUFFER, hFbo);
      gl.viewport(0, 0, RW, RH);
      gl.useProgram(P_H.p);
      let u = P_H.u;
      texUnit(0, u.uMask, maskTex); texUnit(1, u.uA, sim[cur].a); texUnit(2, u.uB, sim[cur].b);
      gl.uniform2f(u.uRes, W, H);
      gl.uniform1f(u.uT, tSec);
      gl.uniform1f(u.uDrain, drain);
      gl.uniform1fv(u.uFs, fsArr);
      gl.uniform1fv(u.uInfl, infl);
      gl.uniform1fv(u.uBorn, born);
      dropArr.fill(0);
      drops.forEach((d, k) => {
        const g = Math.min(1, d.life / 0.07) * (d.life > 2.2 ? Math.max(0, 1 - (d.life - 2.2) / 1.3) : 1);
        const r = g < 0.04 ? 0 : d.r0 * (0.35 + 0.65 * g);
        dropArr[k * 4] = d.x; dropArr[k * 4 + 1] = d.y; dropArr[k * 4 + 2] = r; dropArr[k * 4 + 3] = d.id;
      });
      gl.uniform4fv(u.uDrop, dropArr);
      // the two most inflated words get the swell (capped so a word never reaches its neighbour)
      selArr.fill(0);
      const order = [];
      for (let i = 1; i < 16; i++) if (infl[i] > 0.002 && centers[i]) order.push(i);
      order.sort((a, b) => infl[b] - infl[a]);
      order.slice(0, 2).forEach((id, j) => {
        const c = centers[id];
        const sw = Math.min(0.09, (0.16 * c[4]) / Math.max(1, c[3])) / 0.09;
        selArr[j * 4] = c[0]; selArr[j * 4 + 1] = c[1]; selArr[j * 4 + 2] = id; selArr[j * 4 + 3] = infl[id] * sw;
      });
      gl.uniform4fv(u.uSel, selArr);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, hTex);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, RW, RH);
      gl.useProgram(P_SH.p);
      u = P_SH.u;
      texUnit(0, u.uH, hTex); texUnit(1, u.uB, sim[cur].b);
      gl.uniform2f(u.uRes, W, H);
      gl.uniform2f(u.uRpx, 1 / RW, 1 / RH);
      gl.uniform2f(u.uBTex, 1 / GW, 1 / GH);
      gl.uniform1f(u.uDpr, dpr);
      gl.uniform1f(u.uLod, Math.log2(dpr) + 2.6);
      gl.uniform1f(u.uSplit, split);
      gl.uniform1f(u.uAxis, axis);
      for (let i = 0; i < 16; i++) {
        const b = hex3(baseCol[i]);
        const k = Math.min(1, Math.max(0, infl[i]));
        for (let j = 0; j < 3; j++) colArr[i * 3 + j] = b[j] + (T.sel[j] - b[j]) * k;
      }
      gl.uniform3fv(u.uCol, colArr);
      gl.uniform1fv(u.uInfl, infl);
      gl.uniform3fv(u.uTop, T.a);
      gl.uniform3fv(u.uBot, T.b);
      gl.uniform3fv(u.uTintTop, tintOf(T.a));
      gl.uniform3fv(u.uTintBot, tintOf(T.b));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    /* ---- resize ---- */
    let rsT = 0;
    const rebuild = () => {
      const wasNarrow = narrow;
      measure(); buildTargets();
      if (narrow !== wasNarrow) { curKey = ''; render(parse(location.hash), true); }
      else if (comp) { comp.fit(); drawMask(); comp.onShow && comp.onShow(); }
      if (reduced) draw();
    };
    on(window, 'resize', () => { clearTimeout(rsT); timers.delete(rsT); rsT = later(rebuild, 140); });
    on(document.fonts, 'loadingdone', () => { if (alive && comp) { comp.fit(); drawMask(); if (reduced) draw(); } });

    buildTargets();
    render(parse(location.hash), true);

    if (useGL && reduced) {
      draw();
    } else if (useGL) {
      let last = performance.now(), acc = 0;
      const t0 = last;
      const frame = (now) => {
        if (!alive) return;
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        tSec = (now - t0) / 1000;
        if (drainT0 >= 0) drain = Math.min(1, (now - drainT0) / 330);
        for (const k of ['a', 'b', 'sel']) for (let j = 0; j < 3; j++) T[k][j] += (TT[k][j] - T[k][j]) * Math.min(1, dt * 7);
        if (pmx < -1e3) { pmx = mx; pmy = my; }
        const ivx = (mx - pmx) / Math.max(dt, 1e-3), ivy = (my - pmy) / Math.max(dt, 1e-3);
        vx += (ivx - vx) * 0.6; vy += (ivy - vy) * 0.6;
        const sp = hover ? Math.hypot(ivx, ivy) : 0;
        spd += (Math.min(1, sp / 2200) - spd) * (sp / 2200 > spd ? 0.25 : 0.04);
        if (Math.abs(spd - spdCss) > 0.01) { spdCss = spd; wrap.style.setProperty('--spd', spd.toFixed(3)); }
        if (hover && sp > 1400 && now - lastSplash > 45) {
          const id = materialAt(mx, my);
          if (id > 0) { spawnDrops(mx, my, ivx, ivy, id); lastSplash = now; impulse = [mx, my, 34, -0.7]; }
        }
        for (let i = drops.length - 1; i >= 0; i--) {
          const d = drops[i];
          d.life += dt;
          const damp = Math.exp(-4.2 * dt);
          d.vx *= damp; d.vy = d.vy * damp - 70 * dt;
          d.x += d.vx * dt; d.y += d.vy * dt;
          if (d.life > 3.5 || drain > 0.5) drops.splice(i, 1);
        }
        for (let i = 0; i < 16; i++) {
          inflV[i] += ((inflT[i] - infl[i]) * 170 - inflV[i] * 11) * dt;
          infl[i] += inflV[i] * dt;
        }
        acc += dt;
        let first = true, n = 0;
        while (acc >= 1 / 60 && n < 4) { simStep(1 / 60, first); first = false; acc -= 1 / 60; n++; }
        if (n > 0) { impulse = null; sx0 = mx; sy0 = my; }
        pmx = mx; pmy = my;
        draw();
      };
      raf = requestAnimationFrame(frame);
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      timers.forEach((t) => clearTimeout(t)); timers.clear();
      off.forEach((f) => f()); off.length = 0;
      comp = null;
      wrap.remove(); link.remove(); style.remove();
      if (useGL) {
        try {
          texs.forEach((t) => gl.deleteTexture(t)); texs.clear();
          fbos.forEach((f) => gl.deleteFramebuffer(f)); fbos.clear();
          progs.forEach((p) => gl.deleteProgram(p));
          gl.deleteVertexArray(vao);
          const lose = gl.getExtension('WEBGL_lose_context');
          if (lose) lose.loseContext();
        } catch (e) { /* context already gone */ }
      }
      canvas.width = canvas.height = 1;
      pickData = null;
    };
  },
};
