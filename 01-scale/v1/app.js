'use strict';
// Powers of Ten — one unbroken zoom from a cursor to a deep field. Canvas 2D, every level drawn in code.
// ───────────────────────── content (from portfolio-inside/src/content/site.mjs) ─────────────────────────
const WORK=[
 ['vvdex-platform','VVDex Platform','AI evaluation platform','Tests AI models and agents on real work. Hidden tests decide.','#F2703A'],
 ['conxto','Conxto','AI job search','Reads live job postings against your résumé and prepares the whole application.','#D8CDBE'],
 ['vvdex-engine','VVDex Engine','AI service engine','Describe the work in one paragraph. It compiles a service that runs by your rules.','#45C987'],
 ['unboundpdf','UnboundPDF','Browser PDF suite','Every PDF tool in the browser. Your file never leaves the tab.','#EFEAE0'],
 ['farmquick','FarmQuick','B2B commerce + lead agent','The ordering site a produce business runs on, and the agent that finds its next buyer.','#86C977'],
 ['conxfolio','Conxfolio','Career suite','Résumé, ATS review, cover letter and portfolio website, sharing one résumé.','#EDE4D6'],
 ['pitchradar','PitchRadar','Event intelligence · client','Finds and ranks the events a mobile food vendor should trade at. Built for a client.','#F49A4B'],
 ['vvdex-trading','VVDex Trading','Market research','Live market microstructure beside a hash-chained record of every dated call. Paper only.','#63D2A3'],
];
const workURL=s=>`https://vamsivenkatesh.com/work/${s}/`;

// ───────────────────────── utils ─────────────────────────
const clamp=(x,a,b)=>x<a?a:x>b?b:x, lerp=(a,b,t)=>a+(b-a)*t;
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const win=(z,a,b,c,d)=>sstep(a,b,z)*(1-sstep(c,d,z));
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function gauss(R){let u=0;while(!u)u=R();return Math.sqrt(-2*Math.log(u))*Math.cos(6.2832*R())}
function hash3(x,y,z){let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(z,1274126177))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296}
function vnoise(x,y,z){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf);
 return lerp(lerp(lerp(hash3(xi,yi,zi),hash3(xi+1,yi,zi),u),lerp(hash3(xi,yi+1,zi),hash3(xi+1,yi+1,zi),u),v),lerp(lerp(hash3(xi,yi,zi+1),hash3(xi+1,yi,zi+1),u),lerp(hash3(xi,yi+1,zi+1),hash3(xi+1,yi+1,zi+1),u),v),w)}
function fbm(x,y,z,o){let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){s+=a*vnoise(x*f,y*f,z*f);n+=a;a*=.5;f*=2.03}return s/n}
const V={add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
 cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm:a=>{const l=Math.hypot(...a);return[a[0]/l,a[1]/l,a[2]/l]}};
const mkCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h||w;return c};
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
function sprite(r,g,b,size=64,soft=2.2){const c=mkCanvas(size),x=c.getContext('2d'),gr=x.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
 for(let i=0;i<=8;i++){const t=i/8;gr.addColorStop(t,`rgba(${r},${g},${b},${Math.pow(1-t,soft)})`)}x.fillStyle=gr;x.fillRect(0,0,size,size);return c}

// ───────────────────────── world constants (metres, y down, origin = the cursor) ─────────────────────────
const G=8.05, RE=6.371e6, AU=1.496e11;
const EC={x:0,y:G+RE}, SUN={x:AU,y:G+RE};
const SW=1440, SH=900, PP=0.30/1440;   // the laptop screen: 1440 px across 30 cm
let CUR, NAMEX;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduced)document.documentElement.classList.add('rm');

const cv=document.getElementById('c'), ctx=cv.getContext('2d');
let W=0,H=0,DPR=1,MIN=1,ASP=1;
const cam={x:0,y:0,k:1,z:-3,ox:0,oy:0};
const X=x=>(x-cam.x)*cam.k+cam.ox, Y=y=>(y-cam.y)*cam.k+cam.oy;

// ───────────────────────── stops ─────────────────────────
const STOPS=[
 {z:-3.0,c:'a cursor, mid-thought'},
 {w:0.044,c:'a name on a line of code'},
 {z:-0.55,c:'a screen, late at night'},
 {z:0.22,c:'a desk in a quiet room'},
 {z:1.08,c:'one lit window'},
 {z:2.35,c:'a street by the Elbe'},
 {z:3.3,c:'Magdeburg, at night'},
 {z:5.35,c:'the curve of the Earth'},
 {z:7.3,c:'Earth, the night side'},
 {z:8.8,c:'Earth and the Moon'},
 {w:4.6e11,c:'the inner planets'},
 {z:13.05,c:'the Sun and its planets'},
 {z:15.6,c:'the Sun, becoming a star'},
 {z:17.0,c:'the stars next door: the work'},
 {z:19.1,c:'the Orion Arm'},
 {w:1.45e21,c:'the Milky Way'},
 {z:22.95,c:'our neighbour galaxies'},
 {z:24.45,c:'a deep field of galaxies'},
];
const S_WORK=13, S_END=STOPS.length-1;
let SZ=[], CK=[];
function zOf(s){s=clamp(s,0,S_END);const i=Math.min(Math.floor(s),S_END-1),f=s-i;const e=f-0.72*Math.sin(6.2832*f)/6.2832;return lerp(SZ[i],SZ[i+1],e)}
function sOfZ(z){let lo=0,hi=S_END;for(let i=0;i<40;i++){const m=(lo+hi)/2;if(zOf(m)<z)lo=m;else hi=m}return(lo+hi)/2}
let GAL={x:AU-2e20,y:-2e20}, LGC={x:0,y:0};
function buildStops(){
 SZ=STOPS.map(o=>o.w?Math.log10(o.w/ASP):o.z);
 const nameMid=-(CUR.cx-NAMEX)/2*PP, scx=(SW/2-CUR.cx)*PP, scy=(SH/2-CUR.cy)*PP;
 CK=[[-3,0,0],[-2.3,0,0],[SZ[1],nameMid,0],[SZ[2],scx,scy],[SZ[3],scx*.4,.06],[SZ[4],0,-.45],[SZ[5],0,-48],[SZ[6],0,-260],[SZ[7],0,-2.6e4],
  [SZ[8],0,EC.y],[SZ[9],-1.45e8,EC.y+1.0e8],[SZ[10],(ASP>1.2?.5:.62)*AU,EC.y],[SZ[11],AU,EC.y],[18.6,AU,EC.y],[SZ[15],GAL.x,GAL.y],[SZ[16],LGC.x,LGC.y],[40,LGC.x,LGC.y]];
}
function camAt(z){let i=0;while(i<CK.length-2&&z>CK[i+1][0])i++;const a=CK[i],b=CK[i+1];
 if(z<=a[0])return[a[1],a[2]];const f=clamp((10**z-10**a[0])/(10**b[0]-10**a[0]),0,1);return[a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f]}

// ───────────────────────── 1 · the screen bitmap ─────────────────────────
let scr, scrC, mask;
function buildScreen(){
 scr=mkCanvas(SW,SH);const g=scr.getContext('2d');
 g.fillStyle='#0a0d13';g.fillRect(0,0,SW,SH);
 g.fillStyle='#0e121a';g.fillRect(0,0,SW,34);
 ['#ff6159','#ffbd2e','#28c941'].forEach((c,i)=>{g.fillStyle=c;g.globalAlpha=.6;g.beginPath();g.arc(20+i*20,17,6,0,7);g.fill()});g.globalAlpha=1;
 g.font='13px "IBM Plex Mono"';g.fillStyle='#7d8394';g.textAlign='center';g.fillText('vamsi.ts — work',SW/2,22);g.textAlign='left';
 g.fillStyle='#080a0f';g.fillRect(0,34,236,SH-60);
 g.fillStyle='#596072';g.font='11px "IBM Plex Mono"';g.fillText('EXPLORER',18,60);
 const tree=['▾ work','   vvdex-platform/','   conxto/','   vvdex-engine/','   unboundpdf/','   farmquick/','   conxfolio/','   pitchradar/','   vvdex-trading/','   vamsi.ts'];
 g.font='13px "IBM Plex Mono"';
 tree.forEach((t,i)=>{const y=92+i*24;if(i===9){g.fillStyle='#141a26';g.fillRect(0,y-16,236,23);g.fillStyle='#ffd9a0'}else g.fillStyle=i?'#8b92a3':'#aab0be';g.fillText(t,16,y)});
 g.fillStyle='#0c1017';g.fillRect(236,34,SW-236,34);g.fillStyle='#0a0d13';g.fillRect(236,34,150,34);g.fillStyle='#ffb867';g.fillRect(236,34,150,2);
 g.fillStyle='#e7e2d6';g.fillText('vamsi.ts',262,56);g.fillStyle='#596072';g.fillText('×',360,56);
 const C={c:'#5f6676',k:'#d79bf0',v:'#e9e4d8',p:'#8fb8d6',s:'#f2c46d'};
 const L=[
  [['c','// Vamsi Venkatesh · AI product engineer · Magdeburg, Germany']],[['c','//']],
  [['c','// I design, build and run AI products end to end:']],
  [['c','// the product, the agents, the servers and the tests that prove it works.']],[],
  [['k','const '],['v','work'],['p',' = [']],
  [['p','  '],['s','"VVDex Platform"'],['p',', '],['s','"Conxto"'],['p',', '],['s','"VVDex Engine"'],['p',', '],['s','"UnboundPDF"'],['p',',']],
  [['p','  '],['s','"FarmQuick"'],['p',', '],['s','"Conxfolio"'],['p',', '],['s','"PitchRadar"'],['p',', '],['s','"VVDex Trading"'],['p',',']],
  [['p','];']],[],
  [['k','const '],['v','contact'],['p',' = '],['s','"vamsi@vamsivenkatesh.com"'],['p',';']],[],
  [['k','const '],['v','author'],['p',' = '],['s','"Vamsi Venkatesh']],
 ];
 const x0=304,top=104,lh=28;g.font='16px "IBM Plex Mono"';
 const last=L.length-1;
 g.fillStyle='#111621';g.fillRect(236,top+last*lh-20,SW-236,lh);
 L.forEach((line,i)=>{const y=top+i*lh;g.fillStyle=i===last?'#c9cfdb':'#3c4352';g.textAlign='right';g.fillText(String(i+1),x0-26,y);g.textAlign='left';
  let x=x0;line.forEach(([t,s])=>{if(i===last&&s.startsWith('"Vamsi'))NAMEX=x;g.fillStyle=C[t];g.fillText(s,x,y);x+=g.measureText(s).width});
  if(i===last)CUR={x:Math.round(x+1),y:y-15,w:2,h:20};
  let mx=SW-96;line.forEach(([t,s])=>{g.fillStyle=C[t];g.globalAlpha=.35;g.fillRect(mx,74+i*4,s.length*.9,2);mx+=s.length*.9});g.globalAlpha=1;
 });
 CUR.cx=CUR.x+1;CUR.cy=CUR.y+CUR.h/2;
 g.fillStyle='#0e121a';g.fillRect(0,SH-26,SW,26);g.font='12px "IBM Plex Mono"';g.fillStyle='#6b7282';
 g.fillText('⎇ main   ✓ 0 problems',14,SH-9);g.textAlign='right';g.fillText(`Ln ${L.length}, Col 32   UTF-8   TypeScript`,SW-16,SH-9);g.textAlign='left';
 scrC=mkCanvas(SW,SH);const h=scrC.getContext('2d');h.drawImage(scr,0,0);h.fillStyle='#fff1d8';h.fillRect(CUR.x,CUR.y,CUR.w,CUR.h);
 // subpixel mask: one screen pixel = a 30×30 tile holding three capsules, R G B
 const m=mkCanvas(30),q=m.getContext('2d');q.fillStyle='#000';q.fillRect(0,0,30,30);
 [[255,58,48],[70,255,96],[78,120,255]].forEach(([r,gg,b],i)=>{const cx=5+i*10;const gr=q.createLinearGradient(cx-4,0,cx+4,0);
  gr.addColorStop(0,`rgba(${r},${gg},${b},0)`);gr.addColorStop(.25,`rgb(${r},${gg},${b})`);gr.addColorStop(.75,`rgb(${r},${gg},${b})`);gr.addColorStop(1,`rgba(${r},${gg},${b},0)`);
  q.fillStyle=gr;q.beginPath();q.roundRect(cx-4,2,8,25,4);q.fill()});
 mask=ctx.createPattern(m,'repeat');
}

// ───────────────────────── 2 · city data ─────────────────────────
const LITC=['#ffcf8a','#ffd9a6','#ffc070','#ffe2b8','#f8b46a','#9fc4ff','#ffd0a0','#c8e0ff'];
let NEAR=[], MID=[], FAR=[], LAMPS=[], OURS;
function buildCity(){
 const R=rng(11);
 const mkB=(x0,x1,floors,fh,col,ww,wh,sill,roof,ours)=>{const axes=[];const n=Math.max(2,Math.floor((x1-x0)/3.4));for(let a=0;a<n;a++)axes.push(x0+(x1-x0)*(a+.5)/n);
  const lit=[],flick=[];for(let f=0;f<floors;f++){lit.push(axes.map(()=>R()<.24?LITC[(R()*LITC.length)|0]:null));flick.push(axes.map(()=>R()<.05))}
  return{x0,x1,floors,fh,col,ww,wh,sill,roof,axes,lit,flick,ours,top:G-floors*fh,shop:R()<.5}};
 OURS=mkB(-9.2,9.2,5,3.6,'#24232a',2.4,1.8,.55,3.4,true);OURS.axes=[-7.2,-3.6,0,3.6,7.2];
 OURS.lit=[[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null]];
 OURS.flick=OURS.lit.map(r=>r.map(c=>c==='#9fc4ff'));
 NEAR=[OURS];
 const cols=['#211f26','#252223','#1e2129','#272221','#1c1e25','#22242a','#2a2422'];
 for(const dir of[-1,1]){let x=dir<0?-9.2:9.2;while(Math.abs(x)<760){const w=13+R()*12,fl=4+((R()*3)|0),fh=3.3+R()*.5;const a=dir<0?x-w:x,b=dir<0?x:x+w;
   NEAR.push(mkB(a,b,fl,fh,cols[(R()*cols.length)|0],1.3,2.0,.8,R()*3.5,false));x+=dir*(w+(R()<.08?7:0))}}
 for(let x=-3600;x<3600;){const w=18+R()*55,h=12+R()*(R()<.2?34:18);const L=[];const n=Math.min(46,(w*h/70)|0);for(let i=0;i<n;i++)L.push(x+R()*w,G-1-R()*(h-2),R());MID.push({x0:x,x1:x+w,top:G-h,L});x+=w+R()*8}
 for(let x=-9500;x<9500;){const w=15+R()*80,h=6+R()*(R()<.12?40:20);const L=[];const n=Math.min(14,(w*h/160)|0);for(let i=0;i<n;i++)L.push(x+R()*w,G-1-R()*(h-2),R());FAR.push({x0:x,x1:x+w,top:G-h,L});x+=w+R()*20}
 for(let x=-735;x<=760;x+=30)LAMPS.push(x);
}

// ───────────────────────── 3 · Earth night side, Moon ─────────────────────────
let EARTH, MOONT, LIMB=[];
function buildEarth(){
 const N=1536;EARTH=mkCanvas(N);const g=EARTH.getContext('2d');
 const lat=52.13*Math.PI/180,lon=11.62*Math.PI/180;
 const m=[Math.cos(lat)*Math.cos(lon),Math.cos(lat)*Math.sin(lon),Math.sin(lat)];
 const e1=V.norm([-Math.sin(lon),Math.cos(lon),0]), e2=V.mul(m,-1), v=V.cross(e2,e1);
 const sun=V.norm(V.add(V.mul(v,-.78),V.mul(e1,.62)));
 const land=p=>fbm(p[0]*1.6+11,p[1]*1.6+3,p[2]*1.6+7,5);
 const L=420,sm=mkCanvas(L),sg=sm.getContext('2d'),id=sg.createImageData(L,L),d=id.data;
 for(let py=0;py<L;py++)for(let px=0;px<L;px++){const u=(px+.5)/L*2-1,w=(py+.5)/L*2-1,r2=u*u+w*w;if(r2>1)continue;const q=Math.sqrt(1-r2);
  const p=[u*e1[0]+w*e2[0]+q*v[0],u*e1[1]+w*e2[1]+q*v[1],u*e1[2]+w*e2[2]+q*v[2]];
  const ln=land(p),isL=sstep(.5,.53,ln),dd=V.dot(p,sun),day=sstep(-.04,.16,dd);
  const cl=sstep(.5,.75,fbm(p[0]*3.2+40,p[1]*3.2,p[2]*3.2,4));
  let r=lerp(3,10,isL),gg=lerp(6,11,isL),b=15;
  const dr=lerp(18,92,isL),dg=lerp(52,98,isL),db=lerp(118,70,isL);
  r=lerp(r,dr+cl*170,day);gg=lerp(gg,dg+cl*160,day);b=lerp(b,db+cl*130,day);
  const tw=Math.exp(-1*((dd-.02)/.07)**2)*.5;r+=tw*130;gg+=tw*55;b+=tw*30;
  const ld=.5+.5*q;const i=(py*L+px)*4;d[i]=r*ld;d[i+1]=gg*ld;d[i+2]=b*ld;d[i+3]=255}
 sg.putImageData(id,0,0);
 g.save();g.beginPath();g.arc(N/2,N/2,N/2,0,7);g.clip();g.drawImage(sm,0,0,N,N);
 const R=rng(5);g.globalCompositeOperation='lighter';
 for(let i=0;i<140000;i++){const zz=R()*2-1,t=R()*6.2832,rr=Math.sqrt(1-zz*zz);const p=[rr*Math.cos(t),rr*Math.sin(t),zz];
  if(V.dot(p,v)<0)continue;const dd=V.dot(p,sun);if(dd>-.02)continue;const ln=land(p);if(ln<.515)continue;
  const cl=fbm(p[0]*9+70,p[1]*9,p[2]*9,3);const coast=Math.exp(-1*((ln-.53)/.02)**2);const pr=sstep(.45,.7,cl)*.9+coast*.35;if(R()>pr)continue;
  const sx=(V.dot(p,e1)+1)/2*N,sy=(V.dot(p,e2)+1)/2*N;const br=.25+R()*.6*(cl>.62?1.4:1),s=1+R()*1.4;
  g.fillStyle=`rgba(${R()<.15?'255,236,200':'255,178,96'},${Math.min(1,br)})`;g.fillRect(sx-s/2,sy-s/2,s,s)}
 for(let i=0;i<400;i++){const zz=R()*2-1,t=R()*6.2832,rr=Math.sqrt(1-zz*zz);const p=[rr*Math.cos(t),rr*Math.sin(t),zz];if(V.dot(p,v)<.15||V.dot(p,sun)>-.08||land(p)<.53||fbm(p[0]*9+70,p[1]*9,p[2]*9,3)<.6)continue;
  const sx=(V.dot(p,e1)+1)/2*N,sy=(V.dot(p,e2)+1)/2*N,rr2=6+R()*12,gr=g.createRadialGradient(sx,sy,0,sx,sy,rr2);gr.addColorStop(0,'rgba(255,190,110,.5)');gr.addColorStop(1,'rgba(255,150,70,0)');g.fillStyle=gr;g.fillRect(sx-rr2,sy-rr2,rr2*2,rr2*2)}
 g.restore();
 const Rl=rng(9);for(let i=0;i<90;i++){const x=(Rl()*2-1)*2.2e6;if(Math.abs(x)<2.5e4)continue;LIMB.push([x,Rl()*Rl(),(Rl()*2-1)*6e4])}
 LIMB.push([1.3e5,.9,0],[-1.3e5,.6,0],[2.1e5,.7,0],[-3.5e5,.8,0],[4.6e5,.75,0]);
 MOONT=mkCanvas(256);const mg=MOONT.getContext('2d'),mid=mg.createImageData(256,256),md=mid.data;const ms=V.norm([.72,-.1,-.68]);
 for(let py=0;py<256;py++)for(let px=0;px<256;px++){const u=(px+.5)/128-1,w=(py+.5)/128-1,r2=u*u+w*w;if(r2>1)continue;const q=Math.sqrt(1-r2),p=[u,w,q];
  const al=.62-.28*sstep(.45,.6,fbm(u*2+5,w*2,q*2,4))+.12*(fbm(u*14,w*14,q*14,3)-.5);
  const lit=Math.max(0,V.dot(p,ms))*1.1+.035;const c=al*lit*255;const i=(py*256+px)*4;md[i]=c;md[i+1]=c*.98;md[i+2]=c*.94;md[i+3]=255}
 mg.putImageData(mid,0,0);
}

// ───────────────────────── 4 · galaxies ─────────────────────────
function buildGalaxy(S,seed,opt){
 const R=rng(seed),acc=new Float32Array(S*S*3),dust=new Float32Array(S*S);const c0=S/2,Rg=S*.45;
 const arms=opt.arms,pitch=Math.tan(opt.pitch),ph=opt.phase||0;
 const splat=(x,y,r,g,b)=>{const xi=x|0,yi=y|0;if(xi<0||yi<0||xi>=S-1||yi>=S-1)return;const fx=x-xi,fy=y-yi;
  const w0=(1-fx)*(1-fy),w1=fx*(1-fy),w2=(1-fx)*fy,w3=fx*fy,j0=(xi+yi*S)*3,j2=(xi+(yi+1)*S)*3;
  acc[j0]+=r*w0;acc[j0+1]+=g*w0;acc[j0+2]+=b*w0;acc[j0+3]+=r*w1;acc[j0+4]+=g*w1;acc[j0+5]+=b*w1;acc[j2]+=r*w2;acc[j2+1]+=g*w2;acc[j2+2]+=b*w2;acc[j2+3]+=r*w3;acc[j2+4]+=g*w3;acc[j2+5]+=b*w3};
 const pts=[];
 for(let i=0;i<opt.n;i++){let x,y,r,g,b,young=false;
  if(R()<opt.bulge){const rr=Math.abs(gauss(R))*Rg*.11,a=R()*6.2832;x=Math.cos(a)*rr;y=Math.sin(a)*rr*.62;const ba=opt.bar||0;const cx=x*Math.cos(ba)-y*Math.sin(ba),cy=x*Math.sin(ba)+y*Math.cos(ba);x=cx;y=cy;r=1;g=.78;b=.52}
  else{const rr=(-Math.log(1-R()*.985))*Rg*.3+Rg*.04;const arm=(R()*arms)|0;const inArm=R()<.72;
   const th=ph+arm*6.2832/arms+Math.log(rr/(Rg*.08))/pitch+(inArm?gauss(R)*.16:R()*6.2832);x=Math.cos(th)*rr;y=Math.sin(th)*rr;
   young=inArm&&R()<.6;r=young?.62:1;g=young?.76:.88;b=young?1:.74;
   if(inArm&&R()<.012){for(let k=0;k<14;k++)splat(c0+x+gauss(R)*1.4*S/1024,c0+y+gauss(R)*1.4*S/1024,.35,.12,.2)}
   if(inArm&&R()<.5){const th2=th-.11,xi=(c0+Math.cos(th2)*rr)|0,yi=(c0+Math.sin(th2)*rr)|0;if(xi>0&&yi>0&&xi<S&&yi<S)dust[xi+yi*S]+=1}}
  if(R()<opt.sample)pts.push((x)/S,(y)/S,young?1:0);
  const e=opt.e*(.4+R());splat(c0+x,c0+y,r*e,g*e,b*e)}
 const d2=new Float32Array(S*S);const rb=Math.max(1,(S/170)|0);for(let y=rb;y<S-rb;y++)for(let x=rb;x<S-rb;x++){let s=0;for(let j=-rb;j<=rb;j++)for(let i=-rb;i<=rb;i++)s+=dust[x+i+(y+j)*S];d2[x+y*S]=s/((2*rb+1)**2)}
 const c=mkCanvas(S),g=c.getContext('2d'),id=g.createImageData(S,S),d=id.data;const ex=opt.exp;
 for(let i=0;i<S*S;i++){const at=Math.exp(-d2[i]*opt.dk);for(let k=0;k<3;k++){const v=1-Math.exp(-acc[i*3+k]*ex*at);d[i*4+k]=Math.pow(v,.85)*255}d[i*4+3]=255}
 g.putImageData(id,0,0);
 const t2=mkCanvas(S),q=t2.getContext('2d');q.filter=`blur(${Math.max(1,S/90)}px)`;q.drawImage(c,0,0);g.globalCompositeOperation='lighter';g.globalAlpha=.55;g.drawImage(t2,0,0);g.globalAlpha=1;
 const gr=g.createRadialGradient(c0,c0,0,c0,c0,Rg*.22);gr.addColorStop(0,'rgba(255,226,180,.85)');gr.addColorStop(.4,'rgba(255,190,130,.25)');gr.addColorStop(1,'rgba(255,170,110,0)');g.fillStyle=gr;g.fillRect(0,0,S,S);
 // luminance → alpha so it composites over space without a black square
 const id2=g.getImageData(0,0,S,S),e=id2.data;for(let i=0;i<e.length;i+=4){const l=Math.max(e[i],e[i+1],e[i+2]);e[i+3]=Math.min(255,l*1.3);if(l>0){const s=255/l;e[i]=Math.min(255,e[i]*s);e[i+1]=Math.min(255,e[i+1]*s);e[i+2]=Math.min(255,e[i+2]*s)}}
 g.globalCompositeOperation='source-over';g.putImageData(id2,0,0);
 return{c,pts};
}
let MW, M31, M33, GSPR=[], MWPTS=[];
const GSIZE=1.3e21, GROT=-.42, GTILT=.6;
function buildGalaxies(){
 MW=buildGalaxy(1024,21,{arms:2,pitch:.24,phase:.6,bulge:.2,bar:.5,n:420000,e:.32,exp:.9,dk:.7,sample:.006});
 const Rg=.45,rs=.43*Rg,ang=2.35;const st=[Math.cos(ang)*rs,Math.sin(ang)*rs];
 const toW=(u,v)=>{const x=u*GSIZE,y=v*GSIZE*GTILT;return[x*Math.cos(GROT)-y*Math.sin(GROT),x*Math.sin(GROT)+y*Math.cos(GROT)]};
 const sw=toW(st[0],st[1]);GAL={x:SUN.x-sw[0],y:SUN.y-sw[1]};
 for(let i=0;i<MW.pts.length;i+=3){const w=toW(MW.pts[i],MW.pts[i+1]);MWPTS.push(GAL.x+w[0],GAL.y+w[1],MW.pts[i+2])}
 M31=buildGalaxy(512,77,{arms:2,pitch:.2,phase:2,bulge:.3,bar:0,n:160000,e:.55,exp:.9,dk:1.0,sample:0});
 M33=buildGalaxy(256,31,{arms:2,pitch:.35,phase:1,bulge:.08,bar:0,n:40000,e:.35,exp:.9,dk:.5,sample:0});
 LGC={x:GAL.x-0.85e22,y:GAL.y-0.95e22};
 const R=rng(44);for(let i=0;i<28;i++){let c;if(i%4===0){c=mkCanvas(96);const q=c.getContext('2d'),gr=q.createRadialGradient(48,48,0,48,48,44);gr.addColorStop(0,'rgba(255,236,205,1)');gr.addColorStop(.25,'rgba(255,214,170,.45)');gr.addColorStop(1,'rgba(255,200,150,0)');q.fillStyle=gr;q.fillRect(0,0,96,96)}
  else c=buildGalaxy(96,100+i,{arms:2,pitch:.2+R()*.25,phase:R()*6,bulge:.25+R()*.3,bar:R(),n:9000,e:.6,exp:.9,dk:.6,sample:0}).c;
  GSPR.push({c,tilt:.25+R()*.75,rot:R()*6.28})}
}

// ───────────────────────── 5 · stars, deep field, solar ─────────────────────────
let SPR, SLAY=[], DLAY=[], BACK=[], PLAN=[], BELT=[], KUIP=[], PROD=[];
function buildSprites(){SPR={w:sprite(255,250,240),b:sprite(170,200,255),y:sprite(255,214,160),o:sprite(255,170,90),s:sprite(255,184,103,64,1.6)}}
function buildSpace(){
 const R=rng(3);const sc=()=>{const r=R();return r<.5?'w':r<.75?'b':r<.92?'y':'o'};
 for(let d=14.5;d<=21.5;d+=.5){const L=10**(d+.3),a=[];for(let i=0;i<120;i++)a.push((R()*2-1)*L,(R()*2-1)*L,R(),sc(),R()*6.28);SLAY.push({d,a})}
 for(let d=22.5;d<=25.5;d+=.5){const L=10**(d+.3),a=[];const N=d<23.5?170:1500;for(let i=0;i<N;i++){const x=(R()*2-1)*L,y=(R()*2-1)*L;if(Math.hypot(x,y)<4e22)continue;a.push(x,y,(.3+R()*R()*2.4)*3e21,(R()*GSPR.length)|0,R())}DLAY.push({d,a})}
 for(let i=0;i<420;i++)BACK.push(R(),R(),R(),sc(),R()*6.28);
 PLAN=[['Mercury',.387,1.6,'#c9bba8'],['Venus',.723,2.4,'#f2deb5'],['Earth',1,2.5,'#8fc0ff'],['Mars',1.524,2,'#e2866a'],['Jupiter',5.203,4,'#e9cfa8'],['Saturn',9.537,3.6,'#ecd9a4'],['Uranus',19.19,2.8,'#a8e4ec'],['Neptune',30.07,2.8,'#7fa2ff']]
  .map(([n,a,s,c])=>({n,a:a*AU,s,c,th:n==='Earth'?Math.PI:R()*6.28,w:n==='Earth'?0:.03/Math.pow(a,1.5)}));
 for(let i=0;i<900;i++)BELT.push((2.15+R()*1.15)*AU,R()*6.28);for(let i=0;i<1300;i++)KUIP.push((30+R()*20)*AU,R()*6.28);
}
function layoutProducts(){
 const k17=MIN/1e17,wide=ASP>1.2;PROD=WORK.map((w,i)=>{const a=(-157.5+i*45)*Math.PI/180;const rx=(wide?.28:.25)*W,ry=(wide?.31:.33)*H;
  const jx=[.0,.05,-.03,-.03,-.04,.03,-.05,.02][i]*W,jy=[.03,-.02,.04,-.03,.02,-.04,.03,-.02][i]*H;
  let px=Math.cos(a)*rx+jx,py=Math.sin(a)*ry+jy;
  if(!wide){const order=[1,2,0,3,7,4,6,5][i];px=(order%2?.01:-.44)*W;py=(-.39+order*.076)*H;return{x:SUN.x+px/k17,y:SUN.y+py/k17,c:w[4],side:'l'}}
  return{x:SUN.x+px/k17,y:SUN.y+py/k17,c:w[4],side:wide?(px<0?'r':'l'):(px<0?'l':'r')}});
}

// ───────────────────────── HTML: work links + labels ─────────────────────────
const worksEl=document.getElementById('works');
const WEL=WORK.map(w=>{const a=el('a','work');a.href=workURL(w[0]);a.style.setProperty('--c',w[4]);const t=el('span','t');t.append(el('b',null,w[1]),el('i',null,w[2]),el('em',null,w[3]));a.append(t);
 a.addEventListener('focus',()=>{if(!reduced)go(S_WORK)});worksEl.append(a);return a});
const stillList=document.getElementById('stillList');WORK.forEach(w=>{const li=el('li'),a=el('a');a.href=workURL(w[0]);a.append(el('b',null,w[1]),el('span',null,w[3]));li.append(a);stillList.append(li)});
document.querySelectorAll('#contact a').forEach(a=>a.addEventListener('focus',()=>{if(!reduced)go(S_END)}));
const LBL=[];function lbl(t,fn){const e=el('div','lbl',t);document.body.append(e);LBL.push({e,fn})}

// ───────────────────────── drawing helpers ─────────────────────────
const rect=(x0,y0,x1,y1,f)=>{if(f)ctx.fillStyle=f;ctx.fillRect(X(x0),Y(y0),(x1-x0)*cam.k,(y1-y0)*cam.k)};
function glow(spr,x,y,r,a){if(a<=.003||r<.5)return;if(x<-r||y<-r||x>W+r||y>H+r)return;ctx.globalAlpha=Math.min(1,a);ctx.drawImage(spr,x-r,y-r,r*2,r*2)}
function rgrad(x,y,r,stops){if(!(r>0))return;const g=ctx.createRadialGradient(x,y,0,x,y,r);stops.forEach(([t,c])=>g.addColorStop(t,c));ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r)}
let T=0;

// ── 1 · the screen, down to its subpixels ──
function drawScreen(){
 const k=cam.k,ppx=PP*k,sx0=-CUR.cx*PP,sy0=-CUR.cy*PP;
 const u0=clamp(Math.floor((-cam.ox/k+cam.x-sx0)/PP),0,SW),u1=clamp(Math.ceil(((W-cam.ox)/k+cam.x-sx0)/PP),0,SW);
 const v0=clamp(Math.floor((-cam.oy/k+cam.y-sy0)/PP),0,SH),v1=clamp(Math.ceil(((H-cam.oy)/k+cam.y-sy0)/PP),0,SH);
 if(u1<=u0||v1<=v0)return;
 const dx=X(sx0+u0*PP),dy=Y(sy0+v0*PP),dw=(u1-u0)*ppx,dh=(v1-v0)*ppx;
 const ph=(T%1.06)/1.06,blink=sstep(0,.04,ph)*(1-sstep(.5,.54,ph));
 ctx.imageSmoothingEnabled=ppx<2.2;
 ctx.drawImage(scr,u0,v0,u1-u0,v1-v0,dx,dy,dw,dh);
 if(blink>0&&ppx>.2){ctx.globalAlpha=blink;const cx0=CUR.x-1,cy0=CUR.y-1;ctx.drawImage(scrC,cx0,cy0,CUR.w+2,CUR.h+2,X(sx0+cx0*PP),Y(sy0+cy0*PP),(CUR.w+2)*ppx,(CUR.h+2)*ppx);ctx.globalAlpha=1}
 if(ppx>5){mask.setTransform(new DOMMatrix([ppx/30,0,0,ppx/30,X(sx0),Y(sy0)]));ctx.globalCompositeOperation='multiply';ctx.globalAlpha=sstep(5,26,ppx);ctx.fillStyle=mask;ctx.fillRect(dx,dy,dw,dh);ctx.globalAlpha=1}
 ctx.imageSmoothingEnabled=true;
 ctx.globalCompositeOperation='lighter';
 if(ppx>2.2){ctx.globalAlpha=.32*sstep(2.2,30,ppx)*(1-.55*sstep(60,160,ppx));ctx.drawImage(blink>.5?scrC:scr,u0,v0,u1-u0,v1-v0,dx,dy,dw,dh);ctx.globalAlpha=1}
 if(cam.z<1&&blink>0){const r=Math.min(MIN*.42,Math.max(30,CUR.h*ppx*1.5)),f=(1-sstep(-.3,.9,cam.z))*(1-.6*sstep(-2.6,-3,cam.z));rgrad(X(0),Y(0),r,[[0,`rgba(255,226,180,${.34*blink*f})`],[.35,`rgba(255,190,120,${.1*blink*f})`],[1,'rgba(255,170,90,0)']])}
 ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
}

// ── 2 · the room behind our window ──
function drawRoom(){
 const k=cam.k,sx0=-CUR.cx*PP,sy0=-CUR.cy*PP,sx1=sx0+SW*PP,sy1=sy0+SH*PP,hy=sy1+.017;
 if(X(1.2)<0||X(-1.2)>W||Y(.3)<0||Y(-1.5)>H)return;
 ctx.save();ctx.beginPath();ctx.rect(X(-1.2),Y(-1.5),2.4*k,1.8*k);ctx.clip();
 rect(-1.2,-1.5,1.2,hy-.035,'#1a1c26');
 ctx.globalCompositeOperation='lighter';
 rgrad(X(-.56),Y(-.28),1.6*k,[[0,'rgba(255,168,90,.62)'],[.35,'rgba(255,150,80,.24)'],[1,'rgba(255,140,70,0)']]);
 rgrad(X((sx0+sx1)/2),Y((sy0+sy1)/2),1.0*k,[[0,'rgba(110,140,230,.26)'],[.4,'rgba(90,120,210,.08)'],[1,'rgba(80,100,200,0)']]);
 ctx.globalCompositeOperation='source-over';
 // a framed print of a spiral galaxy (it comes back, for real, at 10^21 m)
 if(k*.3>6){rect(-.86,-.95,-.5,-.55,'#0b0c10');rect(-.845,-.935,-.515,-.565,'#d9d1c1');rect(-.82,-.91,-.54,-.59,'#05060b');
  if(MW){ctx.save();ctx.beginPath();ctx.rect(X(-.82),Y(-.91),.28*k,.32*k);ctx.clip();ctx.globalCompositeOperation='lighter';const s=.3*k;ctx.translate(X(-.68),Y(-.75));ctx.rotate(GROT);ctx.scale(1,.75);ctx.globalAlpha=.85;ctx.drawImage(MW.c,-s/2,-s/2,s,s);ctx.restore();ctx.globalAlpha=1}}
 rect(.42,-.62,1.05,-.6,'#1c1712');[[.46,.07,'#3a2c2a'],[.535,.12,'#24324a'],[.6,.1,'#4a3a22'],[.665,.09,'#2a3a30'],[.74,.13,'#3b2630']].forEach(([x,h,c])=>rect(x,-.62-h*1.6,x+.055,-.62,c));
 rect(-1.2,hy-.035,1.2,hy+.03,'#2a2019');
 ctx.globalCompositeOperation='lighter';ctx.save();ctx.translate(X(-.5),Y(hy));ctx.scale(1,.18);rgrad(0,0,.6*k,[[0,'rgba(255,170,90,.45)'],[1,'rgba(255,150,70,0)']]);ctx.restore();
 ctx.save();ctx.translate(X((sx0+sx1)/2),Y(hy));ctx.scale(1,.2);rgrad(0,0,.5*k,[[0,'rgba(120,150,230,.30)'],[1,'rgba(90,120,210,0)']]);ctx.restore();ctx.globalCompositeOperation='source-over';
 rect(-1.2,hy+.03,1.2,hy+.058,'#18120e');rect(-1.2,hy+.03,1.2,hy+.033,'#4a382a');
 rect(-1.2,hy+.058,1.2,.3,'#06070a');
 rect(-.42,hy-.05,-.2,hy-.02,'#3b2a24');rect(-.40,hy-.075,-.22,hy-.05,'#22304a');rect(-.43,hy-.095,-.24,hy-.075,'#4b3b22');
 rect(-.16,hy-.004,-.02,hy+.006,'#d9d1c1');
 ctx.strokeStyle='#15161b';ctx.lineWidth=Math.max(1,.012*k);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(X(-.68),Y(hy-.02));ctx.lineTo(X(-.74),Y(-.42));ctx.lineTo(X(-.55),Y(-.3));ctx.stroke();
 rect(-.74,hy-.03,-.62,hy-.01,'#15161b');
 ctx.fillStyle='#1d1d22';ctx.beginPath();ctx.moveTo(X(-.6),Y(-.36));ctx.lineTo(X(-.48),Y(-.33));ctx.lineTo(X(-.52),Y(-.24));ctx.lineTo(X(-.63),Y(-.27));ctx.closePath();ctx.fill();
 ctx.globalCompositeOperation='lighter';rgrad(X(-.56),Y(-.255),.12*k,[[0,'rgba(255,220,170,.9)'],[.3,'rgba(255,180,100,.35)'],[1,'rgba(255,160,80,0)']]);ctx.globalCompositeOperation='source-over';
 ctx.fillStyle='#16181e';ctx.beginPath();ctx.roundRect(X(sx0-.008),Y(sy0-.008),(sx1-sx0+.016)*k,(sy1-sy0+.025)*k,.01*k);ctx.fill();
 ctx.fillStyle='#262a33';ctx.beginPath();ctx.moveTo(X(sx0-.014),Y(hy));ctx.lineTo(X(sx1+.014),Y(hy));ctx.lineTo(X(sx1+.024),Y(hy+.016));ctx.lineTo(X(sx0-.024),Y(hy+.016));ctx.closePath();ctx.fill();
 rect(sx0-.014,hy,sx1+.014,hy+.002,'#5a6070');
 const mx=.31;rect(mx-.04,hy-.08,mx+.04,hy+.012,'#d6cfc2');rect(mx-.04,hy-.08,mx-.02,hy+.012,'#aab3cc');rect(mx+.025,hy-.08,mx+.04,hy+.012,'#b8ab98');
 ctx.strokeStyle='#cfc6b8';ctx.lineWidth=Math.max(1,.009*k);ctx.beginPath();ctx.arc(X(mx+.045),Y(hy-.035),.022*k,-1.3,1.3);ctx.stroke();
 if(k*.1>8){ctx.lineWidth=.008*k;for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(255,255,255,${.08-.018*i})`;ctx.beginPath();const ph=T*.6+i*2.1;
  for(let j=0;j<=20;j++){const t=j/20;const x=mx-.015+i*.015+Math.sin(ph+t*5)*.012*t+Math.sin(T*.9+i)*.006,y=hy-.085-t*.2;j?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y))}ctx.stroke()}}
 rect(.72,hy-.12,.86,hy+.01,'#2b2622');ctx.fillStyle='#0d1a13';for(let i=0;i<9;i++){const a=-1.9+i*.42+Math.sin(T*.5+i)*.02;ctx.save();ctx.translate(X(.79),Y(hy-.12));ctx.rotate(a+1.57);ctx.beginPath();ctx.ellipse(.16*k,0,.17*k,.035*k,0,0,7);ctx.fill();ctx.restore()}
 const cg=ctx.createLinearGradient(X(-1.2),0,X(-.85),0);cg.addColorStop(0,'rgba(230,215,190,.28)');cg.addColorStop(1,'rgba(230,215,190,0)');ctx.fillStyle=cg;ctx.fillRect(X(-1.2),Y(-1.5),.35*k,1.8*k);
 if(cam.z>.3){ctx.globalAlpha=sstep(.3,1,cam.z);const rg=ctx.createLinearGradient(X(-1.2),Y(-1.5),X(1.2),Y(.3));rg.addColorStop(0,'rgba(140,170,220,.10)');rg.addColorStop(.35,'rgba(140,170,220,.02)');rg.addColorStop(.42,'rgba(200,220,255,.09)');rg.addColorStop(.5,'rgba(140,170,220,0)');rg.addColorStop(1,'rgba(140,170,220,.04)');ctx.fillStyle=rg;ctx.fillRect(X(-1.2),Y(-1.5),2.4*k,1.8*k);ctx.globalAlpha=1}
 ctx.restore();
}

// ── 3 · a building, with level of detail ──
function drawBuilding(b){
 const k=cam.k,L=X(b.x0),R=X(b.x1),T0=Y(b.top-b.roof),B=Y(G);
 if(R<-2||L>W+2||B<-2||T0>H+2)return;
 const wpx=b.ww*k,tp=Y(b.top);
 ctx.fillStyle=b.col;ctx.fillRect(L,tp,R-L,B-tp);
 if(b.roof>.3){ctx.fillStyle='#17181e';ctx.beginPath();ctx.moveTo(L,tp);ctx.lineTo(L+(R-L)*.06,T0);ctx.lineTo(R-(R-L)*.06,T0);ctx.lineTo(R,tp);ctx.fill();
  if(wpx>6){ctx.fillStyle='#22232a';for(let i=1;i<b.axes.length;i+=2){const x=b.axes[i];ctx.fillRect(X(x-.6),Y(b.top-b.roof*.75),1.2*k,b.roof*.75*k)}}}
 if(B-tp>30){const g=ctx.createLinearGradient(0,B,0,tp);g.addColorStop(0,'rgba(255,170,90,.20)');g.addColorStop(.45,'rgba(255,160,80,.05)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(L,tp,R-L,B-tp)}
 if(.2*k>.8){ctx.fillStyle='rgba(255,235,210,.07)';for(let f=1;f<=b.floors;f++)ctx.fillRect(L,Y(G-f*b.fh)-.12*k,R-L,Math.max(1,.22*k))}
 if(wpx>1.2){ctx.fillStyle=b.shop?'#2c2116':'#101219';ctx.fillRect(L+.08*(R-L),Y(G-3),(R-L)*.84,2.6*k);if(b.shop){ctx.fillStyle='rgba(255,190,120,.10)';ctx.fillRect(L+.08*(R-L),Y(G-3),(R-L)*.84,2.6*k)}}
 for(let f=1;f<b.floors;f++){const fy=G-f*b.fh;for(let a=0;a<b.axes.length;a++){
  if(b.ours&&f===2&&a===2)continue;
  const x=b.axes[a],c=b.lit[f][a];const x0=X(x-b.ww/2),y0=Y(fy-b.sill-b.wh),w=b.ww*k,h=b.wh*k;
  if(x0>W||x0+w<0)continue;
  if(wpx<1.4){if(c){ctx.fillStyle=c;ctx.globalAlpha=.85*ctx.globalAlpha;ctx.fillRect(x0,y0,Math.max(1,w),Math.max(1,h));ctx.globalAlpha=GA}continue}
  if(c){let col=c;if(b.flick[f][a]){const fl=.55+.45*Math.sin(T*7+a*3)*Math.sin(T*2.3+f);col=`rgba(150,190,255,${.55+.4*fl})`}
   if(wpx>10){const g=ctx.createLinearGradient(0,y0,0,y0+h);g.addColorStop(0,col);g.addColorStop(1,'#6a4424');ctx.fillStyle=g}else ctx.fillStyle=col;ctx.fillRect(x0,y0,w,h);
   if(wpx>14&&(a+f)%3===0){ctx.fillStyle='rgba(60,30,20,.35)';ctx.fillRect(x0,y0,w*.22,h);ctx.fillRect(x0+w*.78,y0,w*.22,h)}
   if(wpx>4){ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,180,100,.06)';ctx.fillRect(x0-w*.25,y0-h*.15,w*1.5,h*1.3);ctx.globalCompositeOperation='source-over'}}
  else{ctx.fillStyle='#0d1322';ctx.fillRect(x0,y0,w,h);if(wpx>10){ctx.fillStyle='rgba(120,150,210,.07)';ctx.fillRect(x0,y0,w,h*.4)}}
  if(wpx>16){ctx.strokeStyle='rgba(225,215,195,.55)';ctx.lineWidth=Math.max(1,.05*k);ctx.strokeRect(x0,y0,w,h);if(!b.ours){ctx.beginPath();ctx.moveTo(x0+w/2,y0);ctx.lineTo(x0+w/2,y0+h);ctx.moveTo(x0,y0+h*.32);ctx.lineTo(x0+w,y0+h*.32);ctx.stroke()}
   ctx.fillStyle='rgba(225,215,195,.18)';ctx.fillRect(x0-.1*k,y0+h,w+.2*k,.08*k);
   if(b.ours){ctx.fillStyle='rgba(230,220,200,.10)';ctx.beginPath();ctx.moveTo(x0-.15*k,y0-.12*k);ctx.lineTo(x0+w/2,y0-.5*k);ctx.lineTo(x0+w+.15*k,y0-.12*k);ctx.closePath();ctx.fill()}}
 }}
}
let GA=1;
function drawOurWindowFrame(){
 const k=cam.k;ctx.globalCompositeOperation='lighter';ctx.save();ctx.translate(X(0),Y(-.6));ctx.scale(1.25,1);rgrad(0,0,Math.max(5,3.4*k),[[0,'rgba(255,190,120,.42)'],[.45,'rgba(255,170,100,.14)'],[1,'rgba(255,160,90,0)']]);ctx.restore();ctx.globalCompositeOperation='source-over';if(1.2*k<4){ctx.fillStyle='#ffd9a6';ctx.fillRect(X(-1.2),Y(-1.5),Math.max(1,2.4*k),Math.max(1,1.8*k));return}const x0=X(-1.2),y0=Y(-1.5),w=2.4*k,h=1.8*k;
 ctx.fillStyle='#0a0b10';ctx.fillRect(x0,y0,w,.05*k);ctx.fillRect(x0,y0,.05*k,h);
 ctx.strokeStyle='#d8cfbd';ctx.lineWidth=Math.max(1,.07*k);ctx.strokeRect(x0,y0,w,h);
 ctx.fillStyle='#b9b0a0';ctx.fillRect(X(-1.32),Y(.3),2.64*k,.07*k);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(X(-1.32),Y(.37),2.64*k,.05*k);
 ctx.fillStyle='rgba(230,220,200,.12)';ctx.beginPath();ctx.moveTo(X(-1.4),Y(-1.6));ctx.lineTo(X(0),Y(-2.05));ctx.lineTo(X(1.4),Y(-1.6));ctx.closePath();ctx.fill();
 ctx.fillStyle='rgba(230,220,200,.18)';ctx.fillRect(X(-1.45),Y(-1.62),2.9*k,.06*k);
}
function church(cx,towers,h,w,gap){const k=cam.k;if(h*k<1.5)return;
 const g=ctx.createLinearGradient(0,Y(G),0,Y(G-h));g.addColorStop(0,'rgb(236,190,128)');g.addColorStop(.6,'rgb(170,128,88)');g.addColorStop(1,'rgb(120,96,80)');ctx.fillStyle=g;
 const xs=towers===2?[cx-gap,cx+gap]:[cx];
 if(towers===2){ctx.fillRect(X(cx-gap),Y(G-h*.42),2*gap*k,h*.42*k);ctx.beginPath();ctx.moveTo(X(cx-gap),Y(G-h*.42));ctx.lineTo(X(cx),Y(G-h*.55));ctx.lineTo(X(cx+gap),Y(G-h*.42));ctx.fill()}
 xs.forEach(x=>{ctx.fillRect(X(x-w/2),Y(G-h*.7),w*k,h*.7*k);ctx.fillRect(X(x-w*.4),Y(G-h*.78),w*.8*k,h*.08*k);ctx.beginPath();ctx.moveTo(X(x-w*.38),Y(G-h*.78));ctx.lineTo(X(x),Y(G-h));ctx.lineTo(X(x+w*.38),Y(G-h*.78));ctx.fill();
  if(w*k>4){ctx.fillStyle='rgba(40,25,20,.55)';for(let j=0;j<3;j++)ctx.fillRect(X(x-w*.12),Y(G-h*(.26+j*.16)),w*.24*k,h*.09*k);ctx.fillStyle=g}});
 if(towers===2&&gap*k>6){ctx.fillStyle='rgba(255,210,150,.5)';ctx.beginPath();ctx.arc(X(cx),Y(G-h*.32),gap*.38*k,0,7);ctx.fill()}
 ctx.globalCompositeOperation='lighter';rgrad(X(cx),Y(G-h*.4),h*.9*k,[[0,'rgba(255,190,120,.16)'],[1,'rgba(255,170,90,0)']]);ctx.globalCompositeOperation='source-over';
}
function drawCity(a){
 const k=cam.k;GA=a;ctx.globalAlpha=a;
 const row=(arr,col,lc,lw)=>{for(const b of arr){const L=X(b.x0),R=X(b.x1);if(R<0||L>W)continue;ctx.fillStyle=col;const t=Y(b.top);ctx.fillRect(L,t,Math.max(R-L,.6),Y(G)-t)}
  ctx.globalCompositeOperation='lighter';ctx.fillStyle=lc;const s=Math.max(.9,lw*k);for(const b of arr){const L=X(b.x0),R=X(b.x1);if(R<0||L>W)continue;for(let i=0;i<b.L.length;i+=3){if(b.L[i+2]>.55)ctx.fillRect(X(b.L[i])-s/2,Y(b.L[i+1])-s/2,s,s)}}ctx.globalCompositeOperation='source-over'};
 if(cam.z>1.9){row(FAR,'#0d1120','rgba(255,190,120,.75)',1.1);church(-150,1,62,9,0);row(MID,'#131726','rgba(255,196,130,.8)',1.2);church(95,2,99,11,11)}
 for(const b of NEAR)drawBuilding(b);
 drawOurWindowFrame();
 ctx.globalAlpha=1;GA=1;
}
function drawStreet(a){
 const k=cam.k;ctx.globalAlpha=a;const WL=G+2.5;
 rect(-1e4,G,1e4,G+1.6,'#14131a');rect(-1e4,G+1.6,1e4,WL,'#1d1b1f');if(.06*k>.5)rect(-1e4,G+1.6,1e4,G+1.66,'#3a3530');
 const g=ctx.createLinearGradient(0,Y(WL),0,Y(WL+70));g.addColorStop(0,'#0a1222');g.addColorStop(1,'#04060c');ctx.fillStyle=g;ctx.fillRect(0,Y(WL),W,Math.max(1,70*k));
 if(Y(WL+70)<H){ctx.fillStyle='#04060b';ctx.fillRect(0,Y(WL+70),W,H)}
 ctx.globalCompositeOperation='lighter';
 for(const x of LAMPS){const sx=X(x);if(sx<-300||sx>W+300)continue;
  if(6*k>3){ctx.globalCompositeOperation='source-over';ctx.fillStyle='#0b0b0e';ctx.fillRect(sx-.06*k,Y(G-5.6),.12*k,5.6*k);ctx.globalCompositeOperation='lighter';
   ctx.save();ctx.translate(sx,Y(G));ctx.scale(1,1.5);rgrad(0,0,5.5*k,[[0,'rgba(255,170,90,.22)'],[1,'rgba(255,150,70,0)']]);ctx.restore()}
  rgrad(sx,Y(G-5.8),Math.max(3,1.6*k),[[0,'rgba(255,214,160,.95)'],[.2,'rgba(255,180,100,.4)'],[1,'rgba(255,160,80,0)']]);
  const ry=Y(WL+(WL-(G-5.8))*.6),rh=Math.max(4,9*k);const sh=.6+.4*Math.sin(T*1.7+x);const rg=ctx.createLinearGradient(0,ry-rh,0,ry+rh);rg.addColorStop(0,'rgba(255,170,90,0)');rg.addColorStop(.5,`rgba(255,170,90,${.32*sh})`);rg.addColorStop(1,'rgba(255,170,90,0)');ctx.fillStyle=rg;ctx.fillRect(sx-Math.max(1,.5*k),ry-rh,Math.max(2,1*k),rh*2)}
 if(k>.12){for(const b of NEAR){const L=X(b.x0),R=X(b.x1);if(R<0||L>W)continue;for(let f=1;f<b.floors;f++)for(let i=0;i<b.axes.length;i++){const c=b.lit[f][i];if(!c)continue;const x=X(b.axes[i]+Math.sin(T*1.3+f*3+i)*.25),ry=Y(WL+(f*b.fh)*.5);ctx.fillStyle='rgba(255,190,120,.06)';ctx.fillRect(x-b.ww*k*.2,ry,b.ww*k*.4,Math.max(1,.5*k))}}}
 if(cam.z>1.8){const rg=ctx.createLinearGradient(0,Y(WL),0,Y(WL+50));rg.addColorStop(0,'rgba(236,190,128,.25)');rg.addColorStop(1,'rgba(236,190,128,0)');ctx.fillStyle=rg;for(const dx of[-11,11])ctx.fillRect(X(95+dx-4+Math.sin(T+dx)*.6),Y(WL),8*k,50*k)}
 ctx.globalCompositeOperation='source-over';
 if(k>.18){const tx=((T*7.5)%1500)-750;const x0=X(tx),y0=Y(G-3.3),w=30*k,h=3.0*k;if(x0<W&&x0+w>0){
  ctx.fillStyle='#d9d6cf';ctx.beginPath();ctx.roundRect(x0,y0,w,h,.6*k);ctx.fill();ctx.fillStyle='#b8342e';ctx.fillRect(x0,y0+h*.78,w,h*.1);
  ctx.fillStyle='#ffd9a0';for(let i=0;i<9;i++)ctx.fillRect(x0+(1.2+i*3.1)*k,y0+.55*k,2.2*k,1.2*k);
  ctx.strokeStyle='#222';ctx.lineWidth=Math.max(1,.06*k);ctx.beginPath();ctx.moveTo(x0+10*k,y0);ctx.lineTo(x0+12*k,y0-1.4*k);ctx.lineTo(x0+14*k,y0);ctx.stroke();
  ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,210,150,.15)';ctx.fillRect(x0,Y(WL)+2,w,Math.max(2,2.5*k));ctx.globalCompositeOperation='source-over'}}
 ctx.globalAlpha=1;
}

// ── 4 · Earth: sky / atmosphere, ground, limb lights, night-side disc ──
const ATM=[[0,'rgba(80,130,230,.95)'],[.05,'rgba(52,96,200,.75)'],[.18,'rgba(26,52,128,.45)'],[.45,'rgba(12,24,64,.18)'],[1,'rgba(4,8,24,0)']];
function drawEarth(){
 const k=cam.k,z=cam.z,Rpx=RE*k,TA=1.2e5;
 if(z<5.6){
  const hy=Y(G),f=sstep(3.9,5.4,z);
  {const Ta=Math.min(3.5e3*k,1.25*H);const g=ctx.createLinearGradient(0,hy,0,hy-Ta);g.addColorStop(0,`rgba(70,48,46,${1-f})`);g.addColorStop(.1,`rgba(34,32,56,${1-f})`);g.addColorStop(.45,`rgba(14,18,40,${1-f})`);g.addColorStop(1,'rgba(4,6,16,0)');ctx.fillStyle=g;const top=Math.max(hy-Ta,-10);ctx.fillRect(0,top,W,hy-top);
   if(hy-Ta>0){ctx.fillStyle=`rgba(4,6,16,${1-f})`}}
  if(f>0){const Ta=TA*k;const g=ctx.createLinearGradient(0,hy,0,hy-Ta);ATM.forEach(([t,c])=>g.addColorStop(t,c));ctx.globalAlpha=f;ctx.fillStyle=g;const top=Math.max(hy-Ta,-10);ctx.fillRect(0,top,W,hy-top);ctx.globalAlpha=1}
  ctx.globalCompositeOperation='lighter';ctx.save();ctx.translate(X(0),hy);ctx.scale(1,.38);rgrad(0,0,Math.min(1.6e4*k,1.3*W),[[0,`rgba(255,150,70,${.5*sstep(2.4,3.6,z)+.1})`],[.12,'rgba(255,140,60,.22)'],[.4,'rgba(255,130,60,.07)'],[1,'rgba(255,120,50,0)']]);ctx.restore();ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='#05070b';ctx.beginPath();ctx.moveTo(-5,H+5);for(let i=0;i<=48;i++){const sx=-5+(W+10)*i/48,x=(sx-cam.ox)/k+cam.x;const sag=x*x/(RE+Math.sqrt(Math.max(0,RE*RE-x*x)));ctx.lineTo(sx,Y(G+sag))}ctx.lineTo(W+5,H+5);ctx.fill();
 }else{
  const cx=X(EC.x),cy=Y(EC.y),outer=Rpx+TA*k*(1+sstep(6.5,8.5,z)*3);
  const g=ctx.createRadialGradient(cx,cy,Rpx,cx,cy,outer);ATM.forEach(([t,c])=>g.addColorStop(t,c));ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,outer,0,7);ctx.fill();
  ctx.fillStyle='#05070b';ctx.beginPath();ctx.arc(cx,cy,Rpx,0,7);ctx.fill();
  const ta=sstep(5.9,6.6,z);if(ta>0&&EARTH){ctx.globalAlpha=ta;ctx.drawImage(EARTH,cx-Rpx,cy-Rpx,Rpx*2,Rpx*2);ctx.globalAlpha=1}
  ctx.globalCompositeOperation='lighter';ctx.save();ctx.beginPath();ctx.arc(cx,cy,Rpx*1.02,0,7);ctx.clip();const lg=ctx.createLinearGradient(cx+Rpx*.55,0,cx+Rpx*1.02,0);lg.addColorStop(0,'rgba(120,170,255,0)');lg.addColorStop(1,`rgba(140,190,255,${.35*sstep(5.8,6.8,z)})`);ctx.fillStyle=lg;ctx.fillRect(cx,cy-Rpx*1.1,Rpx*1.1,Rpx*2.2);ctx.restore();
  if(z>8.2)glow(SPR.b,cx,cy,Math.max(10,Rpx*3),.45*sstep(8.2,9.4,z)*(1-sstep(12.6,13.4,z)));
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
 }
 const la=win(z,4.1,4.7,6.2,6.8);if(la>0){ctx.globalCompositeOperation='lighter';for(const[x,b,dz]of LIMB){const sag=x*x/(RE+Math.sqrt(RE*RE-x*x));const sx=X(x),sy=Y(G+sag+Math.abs(dz)*.2);if(sx<-20||sx>W+20)continue;glow(SPR.s,sx,sy,4+b*14,la*(.3+b*.6))}
  glow(SPR.s,X(0),Y(G),24,la*.95);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}
 const ma=win(z,5.3,6,9.2,10);if(ma>0){ctx.globalCompositeOperation='lighter';const p=.75+.25*Math.sin(T*2.2);glow(SPR.s,X(0),Y(G),9+6*p,ma*.9);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}
}
const MOON={x:EC.x-3.84e8*.82,y:EC.y+3.84e8*.62*.57};
function drawMoon(){const k=cam.k,r=Math.max(1.4,1.737e6*k),a=win(cam.z,8,8.4,11,11.8);if(a<=0||!MOONT)return;
 const oa=a*win(cam.z,8.2,8.6,9.8,10.6);if(oa>0){ctx.strokeStyle=`rgba(200,210,235,${.16*oa})`;ctx.lineWidth=1;ctx.setLineDash([2,5]);ctx.beginPath();ctx.ellipse(X(EC.x),Y(EC.y),3.84e8*k,3.84e8*k*.62,0,0,7);ctx.stroke();ctx.setLineDash([])}
 ctx.globalAlpha=a;ctx.drawImage(MOONT,X(MOON.x)-r,Y(MOON.y)-r,2*r,2*r);ctx.globalCompositeOperation='lighter';glow(SPR.w,X(MOON.x)+r*.4,Y(MOON.y),Math.max(6,r*3),a*.25);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}

// ── 5 · the solar system ──
function drawSolar(){
 const z=cam.z,k=cam.k,a=win(z,9.6,10.4,15.4,16.6);if(a<=0)return;const sx=X(SUN.x),sy=Y(SUN.y),tilt=.44;
 ctx.lineWidth=1;
 for(const p of PLAN){const rx=p.a*k;if(rx<2||rx>4e4)continue;const oa=a*(1-sstep(5e3,2e4,rx))*sstep(2,14,rx);if(oa<=0)continue;
  ctx.strokeStyle=p.n==='Earth'?`rgba(143,192,255,${.45*oa})`:`rgba(220,210,190,${.17*oa})`;ctx.beginPath();ctx.ellipse(sx,sy,rx,rx*tilt,0,0,7);ctx.stroke()}
 ctx.globalCompositeOperation='lighter';
 ctx.fillStyle=`rgba(200,190,170,${.5*a})`;for(let i=0;i<BELT.length;i+=2){const r=BELT[i],t=BELT[i+1]+T*.01/Math.pow(r/AU,1.5);const x=sx+Math.cos(t)*r*k,y=sy+Math.sin(t)*r*k*tilt;if(x>0&&x<W&&y>0&&y<H)ctx.fillRect(x,y,1,1)}
 ctx.fillStyle=`rgba(170,190,220,${.35*a})`;for(let i=0;i<KUIP.length;i+=2){const r=KUIP[i],t=KUIP[i+1];const x=sx+Math.cos(t)*r*k,y=sy+Math.sin(t)*r*k*tilt;if(x>0&&x<W&&y>0&&y<H)ctx.fillRect(x,y,1,1)}
 for(const p of PLAN){if(p.n==='Earth'){p.sx=X(EC.x);p.sy=Y(EC.y);continue}const t=p.th+T*p.w;const x=sx+Math.cos(t)*p.a*k,y=sy+Math.sin(t)*p.a*k*tilt;p.sx=x;p.sy=y;glow(SPR.w,x,y,p.s*3.2,a*.8);ctx.globalAlpha=a;ctx.fillStyle=p.c;ctx.fillRect(x-p.s/2,y-p.s/2,p.s,p.s)}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function drawSun(){const z=cam.z,k=cam.k,a=sstep(9.4,10.2,z);if(a<=0)return;const sx=X(SUN.x),sy=Y(SUN.y),r=6.96e8*k;
 if(sx<-3000||sx>W+3000||sy<-3000||sy>H+3000)return;
 ctx.globalCompositeOperation='lighter';const big=Math.max(r*14,60)*(1-sstep(14,17,z)*.75)*(1-sstep(17.5,19,z)*.6);
 glow(SPR.y,sx,sy,big,a*.55);glow(SPR.w,sx,sy,Math.max(r*3,10),a*.95);
 if(z>13.6){ctx.globalAlpha=a*.5*sstep(13.6,14.4,z);ctx.strokeStyle='#ffd9a0';ctx.lineWidth=1;const L=big*.55;ctx.beginPath();ctx.moveTo(sx-L,sy);ctx.lineTo(sx+L,sy);ctx.moveTo(sx,sy-L);ctx.lineTo(sx,sy+L);ctx.stroke()}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}

// ── 6 · stars (multi-scale layers keep density constant while zooming) ──
function drawStarLayers(){
 const z=cam.z,ga=win(z,13.6,14.8,21.4,22.4);if(ga<=0)return;ctx.globalCompositeOperation='lighter';
 for(const L of SLAY){const ratio=z-(L.d+.3);const la=ga*win(ratio,-2.2,-1.4,-.15,.45);if(la<=0)continue;
  for(let i=0;i<L.a.length;i+=5){const x=X(SUN.x+L.a[i]),y=Y(SUN.y+L.a[i+1]);if(x<-10||y<-10||x>W+10||y>H+10)continue;const m=L.a[i+2],tw=.75+.25*Math.sin(T*2+L.a[i+4]*7);
   glow(SPR[L.a[i+3]],x,y,1.5+m*m*7,la*tw*(.35+m*.65));if(m>.82){ctx.globalAlpha=la*tw;ctx.fillStyle='#fff';ctx.fillRect(x-.6,y-.6,1.2,1.2)}}}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
function drawBackStars(){const z=cam.z,a=Math.max(.32*win(z,1.5,2.6,4.6,5.4),.85*win(z,5.0,6.2,21,22.5));if(a<=0)return;ctx.globalCompositeOperation='lighter';
 for(let i=0;i<BACK.length;i+=5){const m=BACK[i+2],tw=.6+.4*Math.sin(T*1.6+BACK[i+4]*9);glow(SPR[BACK[i+3]],BACK[i]*W,BACK[i+1]*H,1.2+m*m*4,a*tw*(.25+.6*m))}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
function drawProducts(){const z=cam.z,a=win(z,15.2,16.2,18.0,18.9);if(a<=0)return;ctx.globalCompositeOperation='lighter';
 PROD.forEach((p,i)=>{const x=X(p.x),y=Y(p.y);p.sx=x;p.sy=y;const hv=p.hover?1.5:1,tw=.85+.15*Math.sin(T*1.8+i*1.7);
  const r=parseInt(p.c.slice(1,3),16),g=parseInt(p.c.slice(3,5),16),b=parseInt(p.c.slice(5,7),16);
  rgrad(x,y,34*hv,[[0,`rgba(${r},${g},${b},${.6*a*tw})`],[.25,`rgba(${r},${g},${b},${.16*a})`],[1,`rgba(${r},${g},${b},0)`]]);
  glow(SPR.w,x,y,7*hv,a);ctx.globalAlpha=a*.55*tw;ctx.strokeStyle=p.c;ctx.lineWidth=1;const L=(22+6*Math.sin(T+i))*hv;ctx.beginPath();ctx.moveTo(x-L,y);ctx.lineTo(x+L,y);ctx.moveTo(x,y-L*.8);ctx.lineTo(x,y+L*.8);ctx.stroke();ctx.globalAlpha=1});
 ctx.globalCompositeOperation='source-over'}

// ── 7 · Milky Way, Local Group, deep field ──
function drawGal(tex,gx,gy,size,rot,tilt,a){const s=size*cam.k;if(a<=0||s<1)return;const x=X(gx),y=Y(gy);if(x+s<0||x-s>W||y+s<0||y-s>H)return;
 ctx.save();ctx.globalAlpha=Math.min(1,a);ctx.translate(x,y);ctx.rotate(rot);ctx.scale(1,tilt);ctx.drawImage(tex,-s/2,-s/2,s,s);ctx.restore();ctx.globalAlpha=1}
function drawMilkyWay(){const z=cam.z,a=sstep(18.6,20.2,z);if(a<=0||!MW)return;
 ctx.globalCompositeOperation='lighter';drawGal(MW.c,GAL.x,GAL.y,GSIZE,GROT,GTILT,a*(z<20.5?.7:1));
 const pa=win(z,19.6,20.4,22.3,23.2);if(pa>0){for(let i=0;i<MWPTS.length;i+=3){const x=X(MWPTS[i]),y=Y(MWPTS[i+1]);if(x<0||y<0||x>W||y>H)continue;ctx.globalAlpha=pa*(.6+.3*Math.sin(T*2+i));ctx.fillStyle=MWPTS[i+2]?'#cfe0ff':'#ffe6c4';ctx.fillRect(x,y,1.2,1.2)}ctx.globalAlpha=1}
 const sa=win(z,18.5,19.3,21.6,22.3);if(sa>0){const x=X(SUN.x),y=Y(SUN.y),p=.5+.5*Math.sin(T*2.4);ctx.globalCompositeOperation='source-over';ctx.strokeStyle=`rgba(255,184,103,${sa*.8})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,9+p*5,0,7);ctx.stroke();ctx.globalCompositeOperation='lighter';glow(SPR.s,x,y,10,sa)}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
const M31P=()=>({x:GAL.x-1.7e22,y:GAL.y-1.7e22});
function drawLocal(){const z=cam.z,a=sstep(21.6,22.5,z);if(a<=0||!M31)return;ctx.globalCompositeOperation='lighter';const m=M31P();
 drawGal(M31.c,m.x,m.y,3.2e21,.7,.32,a);drawGal(M33.c,GAL.x-1.15e22,GAL.y-2.45e22,.9e21,-.4,.7,a*.8);
 drawGal(SPR.b,GAL.x+1.4e21,GAL.y+1.1e21,.25e21,0,.7,a*.6);drawGal(SPR.b,GAL.x+1.9e21,GAL.y+.6e21,.14e21,0,.8,a*.5);
 ctx.globalCompositeOperation='source-over'}
function drawDeep(){const z=cam.z,ga=sstep(22.4,23.4,z);if(ga<=0||!GSPR.length)return;const k=cam.k;ctx.globalCompositeOperation='lighter';
 for(const L of DLAY){const ratio=z-(L.d+.3);const la=ga*win(ratio,-2.4,-1.5,-.1,.5);if(la<=0)continue;
  for(let i=0;i<L.a.length;i+=5){const x=X(LGC.x+L.a[i]),y=Y(LGC.y+L.a[i+1]);const s=Math.max(1.6,L.a[i+2]*k);if(x<-s||y<-s||x>W+s||y>H+s)continue;const v=L.a[i+4];if(s<4){ctx.globalAlpha=la*(.35+.65*v);ctx.fillStyle=v>.7?'#fff2dc':v>.35?'#dfe6ff':'#ffd2b0';const d=s<2.2?1.2:1.8;ctx.fillRect(x-d/2,y-d/2,d,d);if(s>2.4){ctx.globalAlpha*=.35;ctx.fillRect(x-d,y-d/4,d*2,d/2)}continue}const sp=GSPR[L.a[i+3]];
   ctx.save();ctx.globalAlpha=la*(.45+.55*L.a[i+4]);ctx.translate(x,y);ctx.rotate(sp.rot);ctx.scale(1,sp.tilt);ctx.drawImage(sp.c,-s,-s,2*s,2*s);ctx.restore()}}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}

// ── film grain + vignette ──
let GRAIN;
function buildFilm(){const c=mkCanvas(220),g=c.getContext('2d'),id=g.createImageData(220,220);for(let i=0;i<id.data.length;i+=4){const v=Math.random()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255}g.putImageData(id,0,0);GRAIN=ctx.createPattern(c,'repeat')}
function film(){ctx.globalCompositeOperation='overlay';ctx.globalAlpha=.09;GRAIN.setTransform(new DOMMatrix([1,0,0,1,(Math.random()*220)|0,(Math.random()*220)|0]));ctx.fillStyle=GRAIN;ctx.fillRect(0,0,W,H);
 ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
 const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.hypot(W,H)*.62);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}

// ───────────────────────── frame ─────────────────────────
let s=0, sT=0;const par={x:0,y:0}, parT={x:0,y:0};
function render(){
 const z=zOf(s);cam.z=z;const c=camAt(z);cam.x=c[0];cam.y=c[1];cam.k=MIN/10**z;cam.ox=W/2+par.x;cam.oy=H/2+par.y;
 ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 ctx.fillStyle='#030409';ctx.fillRect(0,0,W,H);
 if(z>-0.8&&SLAY.length){
  drawDeep();drawLocal();drawMilkyWay();drawStarLayers();drawBackStars();drawSolar();drawSun();drawProducts();
  if(z<11.8&&z>7)drawMoon();
  if(z<13.5&&z>.3)drawEarth();
  if(z<5.4){const ca=1-sstep(4.4,5.3,z);drawCity(ca);drawStreet(ca)}
 }
 if(z<3.4)drawRoom();
 if(z<2.4)drawScreen();
 film();
 ui(z);
}

// ───────────────────────── UI sync ─────────────────────────
const $=id=>document.getElementById(id);
const powEl=$('pow'),lenEl=$('len'),capEl=$('cap'),ledeEl=$('lede'),hintEl=$('hint'),contactEl=$('contact'),mkEl=$('mk'),rulerEl=$('ruler');
const SUPN=n=>String(n).replace('-','−');
function human(m){if(m<.01)return(m*1e3).toFixed(1)+' mm';if(m<1)return(m*100).toFixed(m<.1?1:0)+' cm';if(m<1e3)return m.toFixed(m<10?1:0)+' m';
 if(m<1e10)return Math.round(m/1e3).toLocaleString('en-US')+' km';const ly=m/9.461e15;if(ly<.05)return(m/AU).toFixed(m/AU<10?1:0)+' AU';
 if(ly<1e6)return(ly<10?ly.toFixed(1):Math.round(ly).toLocaleString('en-US'))+' light-years';if(ly<1e9)return(ly/1e6).toFixed(ly<1e7?1:0)+' million light-years';return(ly/1e9).toFixed(1)+' billion light-years'}
let lastPow=null,lastCap=0;
function ui(z){
 const p=Math.round(z);if(p!==lastPow){powEl.replaceChildren('10',el('sup',null,SUPN(p)),' m');lastPow=p;rulerEl.setAttribute('aria-valuenow',p)}
 lenEl.textContent='≈ '+human(10**z)+' across';
 const ci=Math.min(S_END,Math.floor(s+.35));if(ci!==lastCap){lastCap=ci;capEl.style.opacity=0;setTimeout(()=>{capEl.textContent=STOPS[lastCap].c;capEl.style.opacity=1},180)}
 ledeEl.style.opacity=reduced?1:1-sstep(.75,1.7,s);
 const ca=reduced?0:sstep(23.95,24.35,z);contactEl.style.opacity=ca;contactEl.style.visibility=ca>.02?'visible':'hidden';
 mkEl.style.top=((1-(clamp(z,-3,24)+3)/27)*100)+'%';
 const wa=reduced?0:win(z,16.3,16.85,17.55,18.1);
 WEL.forEach((e,i)=>{const p=PROD[i];if(wa<=.01||p.sx===undefined){e.style.opacity=0;e.style.visibility='hidden';return}
  e.style.visibility='visible';e.style.opacity=wa;e.classList.toggle('r',p.side==='r');const w=e.offsetWidth||230;
  const x=p.side==='r'?p.sx-w-20:p.sx+20;e.style.transform=`translate(${Math.round(clamp(x,8,W-w-(ASP>1.2?72:8)))}px,${Math.round(p.sy-16)}px)`});
 for(const L of LBL){const r=L.fn(z,L.e);if(!r||r[2]<=.01){L.e.style.opacity=0;continue}L.e.style.opacity=Math.min(1,r[2]);L.e.style.transform=`translate(${Math.round(r[0])}px,${Math.round(r[1])}px)`}
}
function setupLabels(){
 const cen=(e,x,y,a)=>[x-(e.offsetWidth||60)/2,y,a];
 lbl('Magdeburger Dom',(z,e)=>cen(e,X(95),Y(G-99)-22,win(z,1.9,2.25,3.1,3.5)));
 lbl('the Elbe',(z,e)=>cen(e,W*.5,Y(G+2.5)+18,win(z,1.9,2.25,3.2,3.6)));
 lbl('Magdeburg',(z,e)=>cen(e,X(0),Y(G)-34,win(z,3.3,3.7,5.9,6.4)));
 lbl('Earth',(z,e)=>cen(e,X(EC.x),Y(EC.y)+Math.max(RE*cam.k,3)+16,win(z,8.3,8.6,10.6,11.2)));
 lbl('Moon',(z,e)=>cen(e,X(MOON.x),Y(MOON.y)+12,win(z,8.3,8.6,9.9,10.4)));
 lbl('Sun',(z,e)=>cen(e,X(SUN.x),Y(SUN.y)+22,win(z,10.4,10.9,15.9,16.5)+win(z,16.5,16.8,17.8,18.4)));
 PLAN.forEach(p=>{if(p.n==='Earth')return;lbl(p.n,(z,e)=>p.sx===undefined?null:cen(e,p.sx,p.sy+9,win(z,10.3,10.8,13.6,14.2)*sstep(25,60,p.a*cam.k)))});
 lbl('the Sun',z=>[X(SUN.x)+18,Y(SUN.y)-7,win(z,18.5,19.2,21.6,22.2)]);
 lbl('the Milky Way',(z,e)=>cen(e,X(GAL.x),Y(GAL.y)+GSIZE*cam.k*.32+10,win(z,21.3,21.8,23.5,24)));
 lbl('Andromeda',(z,e)=>{const m=M31P();return cen(e,X(m.x),Y(m.y)+3.2e21*cam.k*.2+10,win(z,22.2,22.6,23.6,24))});
}

// ───────────────────────── input ─────────────────────────
let introDone=false;
const hideHint=()=>{hintEl.style.opacity=0};
const bump=d=>{sT=clamp(sT+d,0,S_END);introDone=true;hideHint()};
function go(i){i=clamp(i,0,S_END);if(reduced){s=sT=i;render();return}sT=i;introDone=true;hideHint()}
addEventListener('wheel',e=>{e.preventDefault();if(reduced){go(Math.round(s)+(e.deltaY>0?1:-1));return}let d=e.deltaY;if(e.deltaMode===1)d*=16;bump(clamp(d,-120,120)*.0026)},{passive:false});
const ptrs=new Map();let drag=null,pinch0=0;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);drag={x:e.clientX,y:e.clientY,moved:0,s:sT};if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch0=Math.hypot(a[0]-b[0],a[1]-b[1])}});
cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){parT.x=(e.clientX/W-.5)*-14;parT.y=(e.clientY/H-.5)*-10}
 if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,[e.clientX,e.clientY]);
 if(ptrs.size===2){const[a,b]=[...ptrs.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch0>0){bump(-Math.log2(d/pinch0)*1.1);pinch0=d}if(drag)drag.moved=99;return}
 if(drag){const dy=e.clientY-drag.y;drag.moved=Math.max(drag.moved,Math.abs(dy),Math.abs(e.clientX-drag.x));if(drag.moved>6&&!reduced){sT=clamp(drag.s-dy*.0075,0,S_END);introDone=true;hideHint()}}});
cv.addEventListener('pointerup',e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch0=0;if(drag&&drag.moved<=6&&ptrs.size===0)go(e.shiftKey?Math.ceil(sT-1.01):Math.floor(sT+1.01));if(!ptrs.size)drag=null});
cv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);drag=null});
addEventListener('keydown',e=>{const k=e.key;let n=null;if(['ArrowDown','PageDown',' ','ArrowRight'].includes(k))n=Math.floor(sT+1.01);else if(['ArrowUp','PageUp','ArrowLeft'].includes(k))n=Math.ceil(sT-1.01);else if(k==='Home')n=0;else if(k==='End')n=S_END;
 if(n!==null&&!(e.target instanceof HTMLAnchorElement||e.target instanceof HTMLButtonElement)){e.preventDefault();go(n)}});
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go({work:S_WORK,end:S_END,start:0}[b.dataset.go])));
const rulerZ=e=>{const r=rulerEl.getBoundingClientRect();return 24-clamp((e.clientY-r.top)/r.height,0,1)*27};
rulerEl.addEventListener('pointerdown',e=>{rulerEl.setPointerCapture(e.pointerId);go(sOfZ(rulerZ(e)));rulerEl._d=1});
rulerEl.addEventListener('pointermove',e=>{if(rulerEl._d)go(sOfZ(rulerZ(e)))});rulerEl.addEventListener('pointerup',()=>rulerEl._d=0);
function buildRuler(){for(let p=-3;p<=24;p++){const t=el('div','tk'+(p%3===0?' m':''));t.style.top=((24-p)/27*100)+'%';if(p%3===0){const b=el('b');b.append('10',el('sup',null,SUPN(p)));t.append(b)}rulerEl.append(t)}}

// ───────────────────────── boot ─────────────────────────
function resize(){DPR=Math.min(devicePixelRatio||1,1.75);W=innerWidth;H=innerHeight;cv.width=W*DPR|0;cv.height=H*DPR|0;cv.style.width=W+'px';cv.style.height=H+'px';MIN=Math.min(W,H);ASP=W/MIN;
 if(CUR){buildStops();layoutProducts()}if(reduced&&SLAY.length)render()}
addEventListener('resize',resize);
let tPrev=performance.now(),t0=0;
function loop(now){const dt=Math.min(.05,(now-tPrev)/1000);tPrev=now;T+=dt;
 if(!introDone){const it=(now-t0)/1000;sT=.6*sstep(.3,3.4,it);if(it>3.4)introDone=true}
 s+=(sT-s)*(1-Math.exp(-dt*(Math.abs(sT-s)>3?2.2:3.6)));if(Math.abs(sT-s)<1e-4)s=sT;
 par.x+=(parT.x-par.x)*.04;par.y+=(parT.y-par.y)*.04;
 render();requestAnimationFrame(loop)}
(async function(){
 resize();buildSprites();buildRuler();
 try{await Promise.race([Promise.all([document.fonts.load('16px "IBM Plex Mono"'),document.fonts.load('13px "IBM Plex Mono"')]),new Promise(r=>setTimeout(r,2500))])}catch(e){}
 buildScreen();buildCity();buildFilm();buildStops();layoutProducts();
 if(!reduced)render();
 await new Promise(r=>setTimeout(r,20));
 buildEarth();buildGalaxies();buildSpace();buildStops();layoutProducts();setupLabels();
 if(reduced){s=sT=8;render()}else{t0=performance.now();tPrev=t0;requestAnimationFrame(loop)}
})();

if(matchMedia('(pointer:coarse)').matches){hintEl.replaceChildren(el('i',null,'↑'),'\u00a0 swipe up · tap to rise')}
