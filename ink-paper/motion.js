document.documentElement.classList.add('motion-ready');

function bindReveals(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.reveal').forEach(node=>node.classList.add('is-visible'));
    return;
  }
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
  }),{threshold:.08,rootMargin:'0px 0px -5% 0px'});
  document.querySelectorAll('.reveal:not(.is-visible)').forEach(node=>observer.observe(node));
}

bindReveals();
window.addEventListener('inkpaper:render',bindReveals);

function bindCursorLight(){
  if(!matchMedia('(hover: hover) and (pointer: fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(document.querySelector('.site-cursor-light'))return;
  const light=document.createElement('div');
  light.className='site-cursor-light';
  light.setAttribute('aria-hidden','true');
  document.body.append(light);
  const target={x:innerWidth*.5,y:innerHeight*.5};
  const current={...target};
  let frame=null;
  const render=()=>{
    current.x+=(target.x-current.x)*.24;
    current.y+=(target.y-current.y)*.24;
    light.style.transform=`translate3d(${current.x}px,${current.y}px,0) translate(-50%,-50%)`;
    if(Math.abs(target.x-current.x)+Math.abs(target.y-current.y)>.12)frame=requestAnimationFrame(render);
    else frame=null;
  };
  const wake=()=>{if(frame===null)frame=requestAnimationFrame(render)};
  addEventListener('pointermove',event=>{
    target.x=event.clientX;
    target.y=event.clientY;
    light.classList.add('is-visible');
    light.classList.toggle('is-interactive',Boolean(event.target.closest('a,button,input,textarea,select,[role="button"]')));
    wake();
  },{passive:true});
  addEventListener('pointerout',event=>{if(!event.relatedTarget)light.classList.remove('is-visible')},{passive:true});
  addEventListener('blur',()=>light.classList.remove('is-visible'));
}

bindCursorLight();
