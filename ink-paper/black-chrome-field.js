import * as THREE from './assets/three.module.js';

const host=document.querySelector('[data-chrome-field]');
const hero=host?.closest('.chrome-hero');
const process=document.querySelector('[data-hero-process]');
const processSteps=[...document.querySelectorAll('[data-process-step]')];
const processCopy=document.querySelector('[data-process-copy]');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
const captions=[
  'Current context before execution.',
  'Bounded agents, tools and memory.',
  'Independent checks against the mission.',
  'Human authority closes the loop.'
];

let activeStep=0;
function setProcessStep(next){
  if(next===activeStep&&process?.dataset.activeStep===String(next))return;
  activeStep=next;
  processSteps.forEach((step,index)=>{
    step.classList.toggle('is-active',index===next);
    step.classList.toggle('is-past',index<next);
    if(index===next)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');
  });
  if(processCopy){
    processCopy.classList.add('is-changing');
    setTimeout(()=>{processCopy.textContent=captions[next];processCopy.classList.remove('is-changing')},180);
  }
  if(process)process.dataset.activeStep=String(next);
}
setProcessStep(0);

if(host&&!reduce){
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});}catch(error){console.warn('Chrome light field fallback active.',error)}
  if(renderer){
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,fine?1.3:1));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    host.append(renderer.domElement);
    const scene=new THREE.Scene();
    const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const restingPointer=new THREE.Vector2(.68,.48);
    const target=restingPointer.clone();
    const current=target.clone();
    const uniforms={uTime:{value:0},uResolution:{value:new THREE.Vector2()},uPointer:{value:current}};
    const material=new THREE.ShaderMaterial({
      uniforms,depthTest:false,depthWrite:false,
      vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.);}`,
      fragmentShader:`
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uPointer;

        float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
        float band(float d,float width){return exp(-pow(d/width,2.));}

        void main(){
          float aspect=max(uResolution.x/max(uResolution.y,1.),.8);
          vec2 p=(vUv-.5)*vec2(aspect,1.);
          float slow=uTime*.18;
          float cursorShift=(uPointer.x-.68)*.018;
          float rayBase=mix(.27,.43,smoothstep(.8,1.4,aspect));
          float rayCenter=rayBase+.018*sin(slow+p.y*1.15)+cursorShift;
          float distanceToRay=p.x-rayCenter;
          float core=band(distanceToRay,.010);
          float inner=band(distanceToRay,.035);
          float halo=band(distanceToRay,.13);
          float verticalFade=mix(.46,1.,smoothstep(-.50,-.10,p.y));
          float light=(core*.18+inner*.22+halo*.14)*verticalFade;
          float sweepCenter=sin(uTime*.23)*aspect*.42;
          float passingLight=band(p.x-sweepCenter,.52)*.14;
          float ambient=(halo*.038+passingLight)*verticalFade;

          float brush=noise(vec2(p.x*3.1+noise(p*1.1)*.2,p.y*11.+slow*.22));
          float micro=noise(vec2(p.x*38.,p.y*620.));
          vec3 black=vec3(.010,.012,.013);
          vec3 graphite=vec3(.075,.083,.088);
          vec3 silver=vec3(.64,.665,.68);
          vec3 chrome=vec3(.94,.955,.96);
          vec3 col=mix(black,graphite,ambient*.55);
          col=mix(col,silver*(.89+brush*.11),clamp(light*.56+passingLight*.78,0.,.40));
          col=mix(col,chrome,clamp(core*.065*verticalFade,0.,.08));
          col+=vec3((brush-.5)*light*.026+(micro-.5)*.011);

          float vignette=1.-smoothstep(.22,1.18,length(p*vec2(.66,1.08)));
          col*=mix(.62,1.04,vignette);
          col*=mix(.87,1.03,smoothstep(-.5,.32,p.x));
          float luma=dot(col,vec3(.2126,.7152,.0722));
          col*=1.-.14*smoothstep(.30,.50,luma);
          gl_FragColor=vec4(col,1.);
        }
      `
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));

    const clock=new THREE.Clock();
    let frame=null,visible=true,lastPaint=0,lastStep=-1;
    const resize=()=>{
      const rect=host.getBoundingClientRect();
      renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);
      uniforms.uResolution.value.set(rect.width,rect.height);
    };
    const render=(now=0)=>{
      frame=null;
      if(!visible||document.hidden)return;
      if(now-lastPaint>(fine?30:42)){
        lastPaint=now;
        current.lerp(target,.055);
        const elapsed=clock.getElapsedTime();
        uniforms.uTime.value=elapsed;
        renderer.render(scene,camera);
        const nextStep=Math.floor((elapsed%12)/3);
        if(nextStep!==lastStep){lastStep=nextStep;setProcessStep(nextStep)}
      }
      frame=requestAnimationFrame(render);
    };
    const wake=()=>{if(frame===null&&visible&&!document.hidden)frame=requestAnimationFrame(render)};

    resize();
    if(fine&&hero){
      hero.addEventListener('pointermove',event=>{
        const rect=host.getBoundingClientRect();
        target.set(THREE.MathUtils.clamp((event.clientX-rect.left)/rect.width,0,1),THREE.MathUtils.clamp(1-(event.clientY-rect.top)/rect.height,0,1));
        wake();
      },{passive:true});
      hero.addEventListener('pointerleave',()=>{target.copy(restingPointer);wake()},{passive:true});
    }
    new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      if(visible)wake();else if(frame!==null){cancelAnimationFrame(frame);frame=null}
    },{threshold:.02}).observe(host);
    addEventListener('resize',()=>{resize();wake()},{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake()});
    wake();
  }
}
