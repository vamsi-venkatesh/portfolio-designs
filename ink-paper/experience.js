const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=value=>Math.min(1,Math.max(0,value));
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t)};

function bindProofAperture(){
  const section=document.querySelector('[data-proof-aperture]');
  const stage=section?.querySelector('.proof-aperture-sticky');
  if(!section||!stage||reduce)return;
  const mobile=matchMedia('(max-width: 760px)').matches;
  const introNode=section.querySelector('.proof-aperture-intro');
  const seamNode=section.querySelector('.proof-aperture-seam');
  const mediaNode=section.querySelector('.proof-aperture-media');
  const xrayNode=section.querySelector('.proof-xray');
  const storyNode=section.querySelector('.proof-aperture-story');
  if(mobile)section.classList.add('is-mobile-motion');
  let pending=false;
  let visible=true;
  const setXrayProgress=(product,system,proof,resolve=0)=>{
    if(!xrayNode)return;
    xrayNode.style.setProperty('--xray-product',product.toFixed(3));
    xrayNode.style.setProperty('--xray-system',system.toFixed(3));
    xrayNode.style.setProperty('--xray-proof',proof.toFixed(3));
    xrayNode.style.setProperty('--xray-resolve',resolve.toFixed(3));
    xrayNode.style.setProperty('--route-line-clip',`${((1-system)*100).toFixed(2)}%`);
    xrayNode.style.setProperty('--route-dot-y',`${(3+system*94).toFixed(2)}%`);
    xrayNode.querySelectorAll('.proof-line-route span').forEach((node,index)=>{
      const nodeProgress=smooth((system-index*.19)/.27);
      node.style.setProperty('--route-node',nodeProgress.toFixed(3));
    });
    const evidenceReady=proof>.22;
    xrayNode.classList.toggle('is-evidence-ready',evidenceReady);
    xrayNode.querySelector('.proof-tool-reel')?.classList.toggle('is-running',evidenceReady&&!document.hidden);
  };
  const update=()=>{
    pending=false;
    if(mobile){
      const reveal=(node,start=.91,span=.4)=>{
        if(!node)return 1;
        return smooth((innerHeight*start-node.getBoundingClientRect().top)/(innerHeight*span));
      };
      const introProgress=reveal(introNode,.96,.32);
      const seamProgress=reveal(seamNode,.94,.3);
      const mediaProgress=reveal(xrayNode||mediaNode,.92,.42);
      const storyProgress=reveal(storyNode,.9,.42);
      const productProgress=smooth(mediaProgress/.34);
      const systemProgress=smooth((mediaProgress-.31)/.3);
      const proofProgress=smooth((mediaProgress-.62)/.28);
      if(introNode){
        introNode.style.opacity=introProgress.toFixed(3);
        introNode.style.transform=`translateY(${((1-introProgress)*18).toFixed(1)}px)`;
      }
      if(seamNode){
        seamNode.style.opacity=seamProgress.toFixed(3);
        seamNode.style.transform=`translateY(${((1-seamProgress)*12).toFixed(1)}px)`;
        const line=seamNode.querySelector('i');
        if(line)line.style.transform=`scaleX(${seamProgress.toFixed(3)})`;
      }
      if(xrayNode){
        setXrayProgress(productProgress,systemProgress,proofProgress,proofProgress);
      }else if(mediaNode){
        mediaNode.style.opacity=mediaProgress.toFixed(3);
        mediaNode.style.transform=`translateY(${((1-mediaProgress)*28).toFixed(1)}px) scale(${(.955+mediaProgress*.045).toFixed(4)})`;
      }
      if(storyNode){
        storyNode.style.opacity=storyProgress.toFixed(3);
        storyNode.style.transform=`translateY(${((1-storyProgress)*24).toFixed(1)}px)`;
      }
      return;
    }
    const rect=section.getBoundingClientRect();
    const distance=Math.max(1,rect.height-innerHeight);
    const progress=clamp(-rect.top/distance);
    const intro=1-smooth((progress-.03)/.2);
    const open=smooth((progress-.14)/.22);
    const system=smooth((progress-.38)/.18);
    const proof=smooth((progress-.59)/.17);
    const resolve=smooth((progress-.75)/.11);
    const seam=Math.max(0,1-smooth((progress-.5)/.16));
    const exit=1-smooth((progress-.86)/.12);
    const viewportHeight=innerHeight;
    const startLeft=innerWidth*.035;
    const endLeft=innerWidth*.032;
    const startTop=viewportHeight*.22;
    const endTop=viewportHeight*.085;
    const startWidth=innerWidth*.93;
    const endWidth=Math.min(innerWidth*.59,920);
    const startHeight=viewportHeight*.57;
    const endHeight=viewportHeight*.76;
    const lerp=(a,b,t)=>a+(b-a)*t;
    stage.style.setProperty('--aperture-intro',intro.toFixed(3));
    stage.style.setProperty('--aperture-intro-y',`${Math.round((1-intro)*-28)}px`);
    stage.style.setProperty('--aperture-open',open.toFixed(3));
    stage.style.setProperty('--aperture-stage-opacity',exit.toFixed(3));
    stage.style.setProperty('--aperture-media-opacity',open.toFixed(3));
    stage.style.setProperty('--aperture-clip',`${((1-open)*49.2).toFixed(2)}%`);
    stage.style.setProperty('--aperture-seam',seam.toFixed(3));
    stage.style.setProperty('--aperture-story',resolve.toFixed(3));
    stage.style.setProperty('--aperture-story-opacity',resolve.toFixed(3));
    stage.style.setProperty('--aperture-story-y',`${Math.round((1-resolve)*26)}px`);
    stage.style.setProperty('--aperture-media-left',`${lerp(startLeft,endLeft,resolve).toFixed(1)}px`);
    stage.style.setProperty('--aperture-media-top',`${lerp(startTop,endTop,resolve).toFixed(1)}px`);
    stage.style.setProperty('--aperture-media-width',`${lerp(startWidth,endWidth,resolve).toFixed(1)}px`);
    stage.style.setProperty('--aperture-media-height',`${lerp(startHeight,endHeight,resolve).toFixed(1)}px`);
    if(xrayNode){
      setXrayProgress(open,system,proof,resolve);
    }
  };
  const requestUpdate=()=>{if(!pending){pending=true;requestAnimationFrame(update)}};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)requestUpdate()},{rootMargin:'100px 0px'});
  observer.observe(section);
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  addEventListener('hashchange',requestUpdate);
  setTimeout(requestUpdate,140);
  update();
}

function bindUnboundToolReel(){
  const reel=document.querySelector('.proof-tool-reel');
  if(!reel)return;
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)reel.classList.remove('is-running');
    else dispatchEvent(new Event('scroll'));
  });
}

function bindProofReel(){
  const stops=[...document.querySelectorAll('[data-proof-stop]')];
  const visuals=[...document.querySelectorAll('[data-proof]')];
  if(!stops.length||!visuals.length)return;
  const current=document.querySelector('[data-proof-current]');
  const reel=document.querySelector('.proof-reel');
  const grid=document.querySelector('.proof-reel-grid');
  const mobile=matchMedia('(max-width: 760px)').matches;
  if(mobile&&reduce)return;
  reel?.classList.add('is-scrubbed');
  if(mobile)reel?.classList.add('is-mobile-scrubbed');
  let pending=false;
  let visible=true;
  let activeIndex=-1;
  const update=()=>{
    pending=false;
    const anchor=innerHeight*(mobile?.61:.55);
    const range=innerHeight*(mobile?.46:.55);
    let base=0;
    let mix=0;
    for(let index=1;index<stops.length;index+=1){
      const nextTop=stops[index].getBoundingClientRect().top;
      if(nextTop<=anchor-range/2){base=index;continue}
      if(nextTop<anchor+range/2){
        base=index-1;
        mix=smooth((anchor+range/2-nextTop)/range);
      }
      break;
    }
    const selected=Math.min(stops.length-1,base+(mix>=.64?1:0));
    if(selected!==activeIndex){
      activeIndex=selected;
      stops.forEach((node,index)=>node.classList.toggle('is-active',index===selected));
      visuals.forEach((node,index)=>{if(index!==selected)node.classList.remove('is-sequencing')});
      if(current)current.textContent=String(selected+2).padStart(2,'0');
    }
    const gridRect=grid?.getBoundingClientRect();
    const stageVisible=Boolean(gridRect&&gridRect.top<innerHeight&&gridRect.bottom>0);
    const selectedVisual=visuals[selected];
    const apertureStage=document.querySelector('[data-proof-aperture] .proof-aperture-sticky');
    const apertureCleared=mobile||!apertureStage||Number.parseFloat(getComputedStyle(apertureStage).opacity)<=.08;
    const firstProjectReady=selected>0||(apertureCleared&&stops[0].getBoundingClientRect().top<=innerHeight*(mobile?.82:.78));
    if(stageVisible&&firstProjectReady&&selectedVisual&&!selectedVisual.classList.contains('is-sequencing')){
      selectedVisual.classList.add('is-sequencing');
    }
    const weightFor=index=>{
      const fadeOutStart=mobile?.2:.24;
      const fadeOutSpan=mobile?.28:.24;
      const fadeInStart=.52;
      const fadeInSpan=mobile?.28:.24;
      let weight=index===base?1-smooth((mix-fadeOutStart)/fadeOutSpan):0;
      if(index===base+1)weight=smooth((mix-fadeInStart)/fadeInSpan);
      if(reduce)weight=index===selected?1:0;
      return clamp(weight);
    };
    if(mobile)stops.forEach((node,index)=>{
      const weight=weightFor(index);
      node.style.opacity=(.18+weight*.82).toFixed(3);
      node.style.transform=`translateY(${((1-weight)*18).toFixed(1)}px)`;
    });
    visuals.forEach((node,index)=>{
      const eased=weightFor(index);
      const startScale=mobile?.95:.972;
      node.style.opacity=eased.toFixed(3);
      node.style.transform=`scale(${(startScale+eased*(1-startScale)).toFixed(4)}) translateY(${((1-eased)*(mobile?10:14)).toFixed(1)}px)`;
      node.style.filter=`blur(${((1-eased)*(mobile?2.5:7)).toFixed(2)}px)`;
      node.style.zIndex=String(eased>.001?2:1);
      node.style.pointerEvents=index===selected?'auto':'none';
    });
  };
  const requestUpdate=()=>{if(!pending){pending=true;requestAnimationFrame(update)}};
  const observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(!visible)visuals.forEach(node=>node.classList.remove('is-sequencing'));
    if(visible)requestUpdate();
  },{rootMargin:'120px 0px'});
  observer.observe(grid);
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  addEventListener('hashchange',requestUpdate);
  setTimeout(requestUpdate,140);
  update();
}

function bindProjectTransitions(){
  document.querySelectorAll('[data-project-link]').forEach(link=>link.addEventListener('click',event=>{
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||reduce)return;
    const slug=link.dataset.projectLink;
    const visual=document.querySelector(`[data-proof="${slug}"] img, [data-proof-aperture-media="${slug}"] img`);
    if(visual)visual.style.viewTransitionName='project-visual';
    sessionStorage.setItem('inkpaper-project-transition',slug);
    if('startViewTransition' in document)return;
    event.preventDefault();
    const layer=document.createElement('div');
    layer.className='page-transition';
    document.body.append(layer);
    requestAnimationFrame(()=>layer.classList.add('is-leaving'));
    setTimeout(()=>location.href=link.href,510);
  }));
  const currentCase=document.body.dataset.case;
  if(currentCase&&sessionStorage.getItem('inkpaper-project-transition')===currentCase){
    const proof=document.querySelector('.case-proof img');
    if(proof)proof.style.viewTransitionName='project-visual';
    sessionStorage.removeItem('inkpaper-project-transition');
  }
}

function bindCaseProgress(){
  const bar=document.querySelector('.case-progress span');
  const caseRoot=document.querySelector('.case');
  if(!bar||!caseRoot)return;
  let pending=false;
  const update=()=>{
    pending=false;
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    bar.style.transform=`scaleX(${Math.min(1,Math.max(0,scrollY/max))})`;
  };
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update)}},{passive:true});
  update();

  const sections=[...document.querySelectorAll('[data-case-section]')];
  if(sections.length>2){
    const nav=document.createElement('nav');
    nav.className='case-chapter-nav';
    nav.setAttribute('aria-label','Case study progress');
    sections.forEach((section,index)=>{
      section.id=section.id||`chapter-${index+1}`;
      const link=document.createElement('a');
      link.href=`#${section.id}`;
      link.title=section.dataset.caseSection;
      link.setAttribute('aria-label',section.dataset.caseSection);
      if(index===0)link.classList.add('is-active');
      nav.append(link);
    });
    document.body.append(nav);
    const links=[...nav.children];
    const observer=new IntersectionObserver(entries=>{
      const entry=entries.filter(item=>item.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!entry)return;
      const index=sections.indexOf(entry.target);
      links.forEach((link,i)=>link.classList.toggle('is-active',i===index));
    },{rootMargin:'-20% 0px -55%',threshold:[.05,.2,.5]});
    sections.forEach(section=>observer.observe(section));
  }
}

function bindSystemTrace(){
  const rails=[...document.querySelectorAll('.case-system-rail')];
  rails.forEach(rail=>{
    const steps=[...rail.querySelectorAll('.system-step')];
    if(!steps.length||reduce)return;
    let index=0;
    const play=()=>{
      steps.forEach((step,i)=>step.classList.toggle('is-active',i===index));
      index=(index+1)%steps.length;
    };
    const observer=new IntersectionObserver(([entry])=>{
      if(!entry.isIntersecting)return;
      play();
      const timer=setInterval(play,1300);
      setTimeout(()=>clearInterval(timer),1300*steps.length*2);
      observer.disconnect();
    },{threshold:.35});
    observer.observe(rail);
  });
}

function bindFlagshipStory(){
  document.querySelectorAll('[data-flagship-story]').forEach(story=>{
    const visual=story.querySelector('.flagship-visual');
    const status=story.querySelector('[data-engine-status]');
    const chapters=[...story.querySelectorAll('[data-engine-step]')];
    if(!visual||!status||!chapters.length)return;
    const activate=chapter=>{
      visual.dataset.step=chapter.dataset.engineStep;
      status.textContent=chapter.dataset.engineLabel;
      chapters.forEach(node=>node.classList.toggle('is-active',node===chapter));
    };
    if(story.classList.contains('unbound-proof-story')){
      let pending=false;
      const update=()=>{
        pending=false;
        if(document.querySelector('[data-proof-dialog]')?.open)return;
        const anchor=innerHeight*(matchMedia('(max-width: 760px)').matches?.8:.58);
        let selected=chapters[0];
        chapters.forEach(chapter=>{if(chapter.querySelector('h3').getBoundingClientRect().top<=anchor)selected=chapter});
        const explicit=Number.parseInt(story.dataset.proofExplicit||'',10);
        if(Number.isFinite(explicit)&&chapters[explicit])selected=chapters[explicit];
        activate(selected);
        const rect=selected.getBoundingClientRect();
        const focus=smooth((innerHeight*.72-rect.top)/Math.max(innerHeight*.52,rect.height*.62));
        story.style.setProperty('--proof-focus',focus.toFixed(3));
        const frame=visual.querySelector(`[data-proof-frame="${selected.dataset.engineStep}"]`);
        const focusZoom=Number.parseFloat(frame?.style.getPropertyValue('--focus-zoom'))||1;
        story.style.setProperty('--proof-scale',(1+(focusZoom-1)*focus).toFixed(4));
      };
      const requestUpdate=()=>{if(!pending){pending=true;requestAnimationFrame(update)}};
      addEventListener('scroll',requestUpdate,{passive:true});
      addEventListener('resize',requestUpdate,{passive:true});
      update();
      return;
    }
    const observer=new IntersectionObserver(entries=>{
      const entry=entries.filter(item=>item.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(entry)activate(entry.target);
    },{rootMargin:'-28% 0px -28%',threshold:[.12,.4,.7]});
    chapters.forEach(chapter=>observer.observe(chapter));
  });
}

function bindUnboundProofControls(){
  const story=document.querySelector('.unbound-proof-story');
  if(!story)return;
  if(story.dataset.proofControlsBound==='true')return;
  story.dataset.proofControlsBound='true';
  const stage=story.querySelector('.unbound-proof-stage');
  const viewport=story.querySelector('.unbound-proof-viewport');
  const chapters=[...story.querySelectorAll('[data-engine-step]')];
  const count=story.querySelector('[data-proof-count]');
  const previous=story.querySelector('[data-proof-prev]');
  const next=story.querySelector('[data-proof-next]');
  const inspect=story.querySelector('[data-proof-inspect]');
  const dialog=document.querySelector('[data-proof-dialog]');
  const dialogImage=dialog?.querySelector('[data-proof-dialog-image]');
  const dialogCaption=dialog?.querySelector('[data-proof-dialog-caption]');
  let explicitIndex=null;
  const currentIndex=()=>Math.max(0,Math.min(chapters.length-1,Number(stage.dataset.step)||0));
  const navigationIndex=()=>Number.isFinite(explicitIndex)?explicitIndex:currentIndex();
  const sync=()=>{
    const index=currentIndex();
    if(count)count.textContent=String(index+1).padStart(2,'0');
    if(previous)previous.disabled=index===0;
    if(next)next.disabled=index===chapters.length-1;
  };
  const go=index=>{
    const bounded=Math.max(0,Math.min(chapters.length-1,index));
    const chapter=chapters[bounded];
    if(!chapter)return;
    explicitIndex=bounded;
    story.dataset.proofExplicit=String(bounded);
    stage.dataset.step=String(bounded);
    chapters.forEach((node,nodeIndex)=>node.classList.toggle('is-active',nodeIndex===bounded));
    const status=story.querySelector('[data-engine-status]');
    if(status)status.textContent=chapter.dataset.engineLabel;
    sync();
    const mobile=matchMedia('(max-width: 760px)').matches;
    const heading=chapter.querySelector('h3');
    const top=scrollY+heading.getBoundingClientRect().top-innerHeight*(mobile?.72:.54);
    scrollTo({top,behavior:reduce?'auto':'smooth'});
  };
  previous?.addEventListener('click',()=>go(navigationIndex()-1));
  next?.addEventListener('click',()=>go(navigationIndex()+1));
  const releaseExplicit=()=>{explicitIndex=null;delete story.dataset.proofExplicit};
  addEventListener('wheel',releaseExplicit,{passive:true});
  addEventListener('touchstart',releaseExplicit,{passive:true});
  story.addEventListener('pointerdown',event=>{if(!event.target.closest('.unbound-proof-controls'))releaseExplicit()},{passive:true});
  viewport?.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'){event.preventDefault();go(currentIndex()-1)}
    if(event.key==='ArrowRight'){event.preventDefault();go(currentIndex()+1)}
  });
  let startX=0;
  viewport?.addEventListener('pointerdown',event=>{startX=event.clientX},{passive:true});
  viewport?.addEventListener('pointerup',event=>{
    const delta=event.clientX-startX;
    if(Math.abs(delta)<46)return;
    go(currentIndex()+(delta<0?1:-1));
  },{passive:true});
  let dialogReturnIndex=0;
  inspect?.addEventListener('click',()=>{
    const index=navigationIndex();
    dialogReturnIndex=index;
    const frame=story.querySelector(`[data-proof-frame="${index}"]`);
    const image=frame?.querySelector('.unbound-proof-context img');
    if(!image||!dialog||!dialogImage||!dialogCaption)return;
    dialogImage.src=image.src;
    dialogImage.alt=image.alt;
    dialogCaption.textContent=frame.querySelector('figcaption')?.innerText.replace(/\n/g,' — ')||image.alt;
    dialog.showModal();
  });
  const closeDialog=()=>{dialog.close();requestAnimationFrame(()=>go(dialogReturnIndex))};
  dialog?.querySelector('[data-proof-close]')?.addEventListener('click',closeDialog);
  dialog?.addEventListener('click',event=>{if(event.target===dialog)closeDialog()});
  new MutationObserver(sync).observe(stage,{attributes:true,attributeFilter:['data-step']});
  sync();
}

function bindUnboundFilm(){
  const film=document.querySelector('[data-unbound-film]');
  if(!film||film.dataset.filmBound==='true')return;
  film.dataset.filmBound='true';
  const deck=film.querySelector('[data-film-deck]');
  const scenes=[...film.querySelectorAll('[data-film-scene]')];
  const tabs=[...film.querySelectorAll('[data-film-go]')];
  const current=film.querySelector('[data-film-current]');
  const status=film.querySelector('[data-film-status]');
  const labels=['Product','Choice','Breadth','Direct route','Workspace','Evidence'];
  const dialog=document.querySelector('[data-film-dialog]');
  const dialogImage=dialog?.querySelector('[data-film-dialog-image]');
  const dialogCaption=dialog?.querySelector('[data-film-dialog-caption]');
  let active=0;
  let releaseTimer=0;

  scenes.forEach((scene,index)=>{
    scene.setAttribute('role','group');
    scene.setAttribute('aria-roledescription','slide');
    scene.setAttribute('aria-label',`${index+1} of ${scenes.length}: ${labels[index]}`);
  });

  const show=(requested,direction=0)=>{
    const next=(requested+scenes.length)%scenes.length;
    if(next===active&&scenes[active].classList.contains('is-active'))return;
    const previous=active;
    const travel=direction||((next>previous)?1:-1);
    clearTimeout(releaseTimer);
    scenes.forEach((scene,index)=>{
      scene.classList.remove('is-active','is-entering-forward','is-entering-back','is-exiting-forward','is-exiting-back');
      scene.setAttribute('aria-hidden','true');
      scene.inert=true;
      if(index!==previous&&index!==next)scene.classList.add(index<next?'is-before':'is-after');
    });
    const outgoing=scenes[previous];
    const incoming=scenes[next];
    if(outgoing&&previous!==next){
      outgoing.classList.add(travel>0?'is-exiting-forward':'is-exiting-back');
      outgoing.classList.remove('is-before','is-after');
    }
    incoming.classList.remove('is-before','is-after');
    incoming.classList.add(travel>0?'is-entering-forward':'is-entering-back');
    incoming.setAttribute('aria-hidden','false');
    incoming.inert=false;
    incoming.offsetWidth;
    requestAnimationFrame(()=>{
      incoming.classList.remove('is-entering-forward','is-entering-back');
      incoming.classList.add('is-active');
    });
    tabs.forEach((tab,index)=>{
      const selected=index===next;
      tab.classList.toggle('is-active',selected);
      tab.setAttribute('aria-current',selected?'true':'false');
      if(selected)tab.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
    });
    if(current)current.textContent=String(next+1).padStart(2,'0');
    if(status)status.textContent=labels[next];
    active=next;
    releaseTimer=window.setTimeout(()=>{
      if(outgoing&&outgoing!==incoming){
        outgoing.classList.remove('is-exiting-forward','is-exiting-back');
        outgoing.classList.add(previous<next?'is-before':'is-after');
      }
    },650);
  };

  tabs.forEach((tab,index)=>tab.addEventListener('click',()=>show(index,index>active?1:-1)));
  film.querySelector('[data-film-prev]')?.addEventListener('click',()=>show(active-1,-1));
  film.querySelector('[data-film-next]')?.addEventListener('click',()=>show(active+1,1));
  deck?.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'){event.preventDefault();show(active-1,-1)}
    if(event.key==='ArrowRight'){event.preventDefault();show(active+1,1)}
  });

  let pointerId=null;
  let startX=0;
  let startY=0;
  deck?.addEventListener('pointerdown',event=>{
    if(event.pointerType==='touch'||event.button!==0||event.target.closest('button,a'))return;
    pointerId=event.pointerId;
    startX=event.clientX;
    startY=event.clientY;
    deck.classList.add('is-dragging');
    deck.setPointerCapture?.(pointerId);
  });
  const finishPointer=event=>{
    if(pointerId!==event.pointerId)return;
    const dx=event.clientX-startX;
    const dy=event.clientY-startY;
    deck?.classList.remove('is-dragging');
    deck?.releasePointerCapture?.(pointerId);
    pointerId=null;
    if(Math.abs(dx)>52&&Math.abs(dx)>Math.abs(dy)*1.15)show(active+(dx<0?1:-1),dx<0?1:-1);
  };
  deck?.addEventListener('pointerup',finishPointer);
  deck?.addEventListener('pointercancel',event=>{
    if(pointerId!==event.pointerId)return;
    deck.classList.remove('is-dragging');
    pointerId=null;
  });

  let touchStartX=0;
  let touchStartY=0;
  let touchCurrentX=0;
  let touchCurrentY=0;
  let touchTracking=false;
  deck?.addEventListener('touchstart',event=>{
    if(event.touches.length!==1||event.target.closest('button,a'))return;
    const touch=event.touches[0];
    touchStartX=touchCurrentX=touch.clientX;
    touchStartY=touchCurrentY=touch.clientY;
    touchTracking=true;
    deck.classList.add('is-dragging');
  },{passive:true});
  deck?.addEventListener('touchmove',event=>{
    if(!touchTracking||event.touches.length!==1)return;
    const touch=event.touches[0];
    touchCurrentX=touch.clientX;
    touchCurrentY=touch.clientY;
    const dx=touchCurrentX-touchStartX;
    const dy=touchCurrentY-touchStartY;
    if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy))event.preventDefault();
  },{passive:false});
  const finishTouch=event=>{
    if(!touchTracking)return;
    const touch=event.changedTouches?.[0];
    if(touch){touchCurrentX=touch.clientX;touchCurrentY=touch.clientY}
    const dx=touchCurrentX-touchStartX;
    const dy=touchCurrentY-touchStartY;
    touchTracking=false;
    deck?.classList.remove('is-dragging');
    if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.1)show(active+(dx<0?1:-1),dx<0?1:-1);
  };
  deck?.addEventListener('touchend',finishTouch,{passive:true});
  deck?.addEventListener('touchcancel',()=>{touchTracking=false;deck.classList.remove('is-dragging')},{passive:true});
  deck?.addEventListener('dragstart',event=>{if(event.target.closest('img'))event.preventDefault()});
  film.querySelectorAll('.unbound-film-window img').forEach(image=>{image.draggable=false});

  let wheelIntent=0;
  let wheelLocked=false;
  let wheelReset=0;
  deck?.addEventListener('wheel',event=>{
    if(event.target.closest('.unbound-film-rail'))return;
    const horizontal=Math.abs(event.deltaX)>Math.abs(event.deltaY)*1.05;
    if(!horizontal)return;
    event.preventDefault();
    if(wheelLocked)return;
    wheelIntent+=event.deltaX;
    clearTimeout(wheelReset);
    wheelReset=window.setTimeout(()=>{wheelIntent=0},140);
    if(Math.abs(wheelIntent)<36)return;
    const direction=wheelIntent>0?1:-1;
    wheelIntent=0;
    wheelLocked=true;
    show(active+direction,direction);
    window.setTimeout(()=>{wheelLocked=false},620);
  },{passive:false});

  film.querySelectorAll('[data-film-inspect]').forEach(button=>button.addEventListener('click',()=>{
    const figure=button.closest('figure');
    const source=figure?.querySelector('.unbound-film-window img');
    if(!source||!dialog||!dialogImage||!dialogCaption)return;
    dialogImage.src=source.src;
    dialogImage.alt=source.alt;
    dialogCaption.textContent=figure.querySelector('figcaption span')?.textContent||source.alt;
    dialog.showModal();
  }));
  const close=()=>dialog?.close();
  dialog?.querySelector('[data-film-close]')?.addEventListener('click',close);
  dialog?.addEventListener('click',event=>{if(event.target===dialog)close()});
  scenes.forEach((scene,index)=>scene.classList.add(index===0?'is-active':'is-after'));
  scenes.forEach((scene,index)=>{scene.setAttribute('aria-hidden',index===0?'false':'true');scene.inert=index!==0});
  tabs.forEach((tab,index)=>{tab.classList.toggle('is-active',index===0);tab.setAttribute('aria-current',index===0?'true':'false')});
}

function bindOperatingTrace(){
  const section=document.querySelector('[data-method-trace]');
  const path=section?.querySelector('[data-method-path]');
  const packet=section?.querySelector('[data-method-packet]');
  const steps=[...section?.querySelectorAll('[data-method-step]')||[]];
  const current=section?.querySelector('[data-method-current]');
  const status=section?.querySelector('[data-method-status]');
  if(!section||!path||!packet||!steps.length)return;
  const statuses=[
    'Product law loaded before execution.',
    'Current code and runtime truth resolved.',
    'Tools operate inside named authority.',
    'Independent checks challenge the result.',
    'Only reviewed outcomes return to memory.'
  ];
  const length=path.getTotalLength();
  path.style.strokeDasharray=String(length);
  let activeIndex=-1;
  let pending=false;
  const render=(progress,index)=>{
    path.style.strokeDashoffset=String(length*(1-progress));
    const point=path.getPointAtLength(length*progress);
    packet.setAttribute('cx',point.x.toFixed(2));
    packet.setAttribute('cy',point.y.toFixed(2));
    section.style.setProperty('--method-progress',progress.toFixed(3));
    section.style.setProperty('--method-packet-y',`${(12+progress*78).toFixed(2)}%`);
    steps.forEach((step,stepIndex)=>{
      step.classList.toggle('is-active',stepIndex===index);
      step.classList.toggle('is-passed',stepIndex<index);
    });
    if(index!==activeIndex){
      activeIndex=index;
      const label=steps[index].querySelector('span')?.textContent||'';
      if(current)current.textContent=label;
      if(status)status.textContent=statuses[index];
    }
  };
  const update=()=>{
    pending=false;
    if(reduce){render(1,steps.length-1);return}
    const rect=section.getBoundingClientRect();
    const distance=Math.max(1,section.offsetHeight-innerHeight);
    const rawProgress=clamp(-rect.top/distance);
    const progress=smooth(rawProgress);
    const index=Math.min(steps.length-1,Math.floor(rawProgress*steps.length));
    render(progress,index);
  };
  const requestUpdate=()=>{if(!pending){pending=true;requestAnimationFrame(update)}};
  const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)requestUpdate()},{rootMargin:'120px 0px'});
  observer.observe(section);
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  update();
}

function bindClosingSequence(){
  const sections=[document.querySelector('[data-operator-bridge]'),document.querySelector('[data-contact-terminal]')].filter(Boolean);
  if(!sections.length)return;
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting)entry.target.classList.add('is-in-view');
  }),{rootMargin:'-12% 0px -12%',threshold:.18});
  sections.forEach(section=>observer.observe(section));
}

export function initExperience(){
  if(document.documentElement.dataset.experienceBound==='true')return;
  document.documentElement.dataset.experienceBound='true';
  bindProofAperture();
  bindUnboundToolReel();
  bindProofReel();
  bindProjectTransitions();
  bindCaseProgress();
  bindSystemTrace();
  bindFlagshipStory();
  bindUnboundProofControls();
  bindUnboundFilm();
  bindOperatingTrace();
  bindClosingSequence();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initExperience,{once:true});
else initExperience();
