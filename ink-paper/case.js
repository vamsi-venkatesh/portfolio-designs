import { cases as sourceCases } from './case-data.js?v=77';

const additions={
  studio:{
    number:'04',title:'VVDex Studio',status:'Private macOS control plane',kicker:'Human-governed agent operations',
    lead:'A private operating environment where models work inside grounded missions, independent checks, evidence and explicit human authority.',
    image:'/portfolio-designs/ink-paper/assets/studio-ui.png',facts:[['1','unified control plane'],['5','governed mission stages'],['0','silent external writes'],['Private','operational product']],
    flow:[['Ground','Load project intent, current code and reviewed memory.'],['Plan','Compile bounded graph nodes and named success criteria.'],['Execute','Route each worker through approved tools and authority.'],['Check','Challenge the result independently against the mission.'],['Decide','Pause irreversible work for a named human decision.']],
    sections:[['The problem','AI agents can produce quickly, but speed alone does not create trust. Serious product work needs current context, bounded authority, independent evaluation and durable evidence.'],['Command','A person starts with the outcome in plain language. Studio grounds the request in the current project before any worker begins.'],['Graph engineering','The mission becomes named nodes with responsibilities, dependencies, tools, terminal states and success criteria rather than one unbounded conversation.'],['Provider boundary','Claude, Codex, Freebuff, VVDex or a local model can occupy a worker lane. Provider choice changes; the authority contract does not.'],['Harness and evaluation','Clean, exception and failure paths are exercised. A separate checker tests the delivered result instead of accepting the worker’s own claim.'],['Evidence and gates','Actions, outputs, checks and decisions remain reconstructable. External or irreversible writes stop for action-specific human approval.'],['Memory return','Only reviewed outcomes return to durable project knowledge. One mistaken run cannot silently rewrite the operating model.']],
    boundary:['Authority law','Models may reason and execute inside a named mission. They never inherit general permission to write externally, publish, release or make consequential decisions.'],
    stack:['Electron','React','TypeScript','Node.js','Graph runtime','Provider adapters','Evaluation harness','Evidence store'],role:'Product direction, systems architecture, interface, integration and verification',links:[['Agent Services case','../agent-services/']]
  },
  'eval-hub':{
    number:'07',title:'Eval Hub',status:'Live cross-product evaluation',kicker:'Independent evaluation and safety',
    lead:'The layer that turns golden suites, calibrated judging and adversarial probes into release evidence across the product estate.',
    facts:[['κ 0.79','judge vs human labels'],['288','cases · 13 suites'],['3','products evaluated'],['n=28','human calibration set']],
    flow:[['Define','Write product contracts and golden outcomes.'],['Exercise','Run clean, edge and adversarial cases.'],['Compare','Measure against baselines and human labels.'],['Gate','Block a release when deterministic criteria fall below baseline.']],
    sections:[['The product','Eval Hub is separate from the agents it evaluates. Golden suites can fail a release mechanically; advisory LLM judging and nightly safety probes remain visible without silently becoming authority.'],['A judge must earn trust','The LLM judge stays advisory until calibrated against human labels. Cohen’s κ reached 0.79 on the current n=28 calibration set.'],['Defects it found','Evaluation exposed an agent that missed implicit suicidal ideation and candidate ranking influenced by nationality inferred from surnames—unlawful under the German AGG.'],['Estate-wide scope','Conxto is release-gated; StandScout and Agent Services are measured. The shared evaluation layer keeps quality history separate from one product’s own harness.'],['Harness is not Eval Hub','A service harness proves that an authored workflow followed its contract. Eval Hub tracks broader quality and safety baselines across products. Both answer different questions.'],['Evidence over one score','Case outcomes, failure classes, baselines and calibration receipts matter more than one flattering aggregate number.']],
    boundary:['Authority boundary','Deterministic golden gates can block release. LLM judging and safety probes remain advisory until their calibration and operating contract justify expanded authority.'],
    stack:['TypeScript','Fastify','PostgreSQL','systemd','MiniLM','DeepSeek','Claude judges'],role:'Evaluation architecture, golden suites, calibration, safety research and release gates',links:[['Public methodology','https://vvdexops.com/evals']]
  }
};

const cases={...sourceCases,
  'agent-services':{...sourceCases['agent-services'],title:'Agent Services + Studio',lead:'A public library of governed AI services paired with VVDex Studio, the private control plane for graphs, models, tools, harnesses, traces, reviewed memory and human authority.',facts:[['37','governed services'],['2,146','harness cases'],['44','agent records'],['0','public or customer writes']]},
  farmquick:{...sourceCases.farmquick,lead:'A live B2B produce supply platform built on the VJ Agro Farms network, with peeled garlic, exotic vegetable wholesale and human-confirmed ordering.',facts:[['1,000 kg/day','stated peeled-garlic capacity'],['Exotic vegetables','wholesale sourcing'],['n8n','order workflow routing'],['Human','commercial confirmation']]},
  vvdexops:{...sourceCases.vvdexops,lead:'Free, no-login BTC, ETH and SOL market instruments across two venues, plus a separate 15-minute BTC research ledger that publishes committed predictions, outcomes and failures.'},
  ...additions
};
const liveProjects={
  unboundpdf:['Open live project','https://unboundpdf.com/'],
  conxto:['Open live project','https://conxto.com/'],
  'agent-services':['Open public Lab','https://lab.vvdexops.com/agent-services/'],
  farmquick:['Open live project','https://farmquick.in/'],
  vvdexops:['Open live platform','https://vvdexops.com/'],
  'eval-hub':['Open public methodology','https://vvdexops.com/evals'],
  'seo-lab':['Open live product','https://unboundpdf.com/']
};
const order=['unboundpdf','conxto','agent-services','studio','farmquick','vvdexops','eval-hub','conxfolio','seo-lab','sara','mira','ai-operating-system'];
const flagshipOrder=['unboundpdf','conxto','agent-services','conxfolio','farmquick','vvdexops'];
const slug=document.body.dataset.case;
const data=cases[slug];
const app=document.querySelector('#case-app');

if(!data){app.innerHTML='<main class="page-hero"><h1>Case not found.</h1><a href="/portfolio-designs/ink-paper/work/">Return to work →</a></main>';throw new Error(`Unknown case: ${slug}`)}

const normalizedImage=data.image?data.image.replace('../../assets/','/portfolio-designs/ink-paper/assets/'):'';
const navigationOrder=flagshipOrder.includes(slug)?flagshipOrder:order;
const currentIndex=navigationOrder.indexOf(slug);
const nextSlug=navigationOrder[(currentIndex+1)%navigationOrder.length];
const nextData=cases[nextSlug];
const facts=(data.facts||[]).slice(0,4).map(([value,label])=>`<div><dt>${value}</dt><dd>${label}</dd></div>`).join('');
const flow=(data.flow||[]).map(([title,copy],index)=>`<article class="reveal"><span>${String(index+1).padStart(2,'0')}</span><h3>${title}</h3><p>${copy}</p></article>`).join('');
const stories=(data.sections||[]).map(([title,copy],index)=>`<article class="reveal"><span>${String(index+1).padStart(2,'0')}</span><h3>${title}</h3><p>${copy}</p></article>`).join('');
const services=data.services?`<section class="case-services reveal"><p class="case-kicker">Inside the catalogue</p><h2>Twenty-one core service contracts.</h2><div class="service-grid">${data.services.map((service,index)=>`<div><span>${String(index+1).padStart(2,'0')}</span><p>${service}</p></div>`).join('')}</div></section>`:'';
const links=(data.links||[]).map(([label,href])=>`<a href="${href}"${href.startsWith('http')?' target="_blank" rel="noreferrer"':''}>${label} ↗</a>`).join(' · ');
const liveProject=liveProjects[slug];
const liveAction=liveProject?`<a href="${liveProject[1]}" target="_blank" rel="noreferrer">${liveProject[0]} ↗</a>`:`<span class="is-private">${data.status}</span>`;
const firstStory=data.sections?.[0]?.[1]||data.lead;
const systemSteps=(data.flow||[]).map(([title,copy],index)=>`<article class="system-step${index===0?' is-active':''}" data-system-step="${index}"><i aria-hidden="true"></i><span>${String(index+1).padStart(2,'0')}</span><h3>${title}</h3><p>${copy}</p></article>`).join('');
const systemSection=`<section class="case-system reveal" data-case-section="system"><div class="case-system-head"><div><p class="case-kicker">System trace</p><h2>From input to accountable outcome.</h2></div><p>The interface is only the visible layer. Each stage below names what the system does, where evidence is produced and where authority stops.</p></div><div class="case-system-rail" style="--system-count:${Math.min((data.flow||[]).length,6)}">${systemSteps}</div></section>`;
const flagshipStories={
  unboundpdf:{section:'local-engine',status:'Local file → process → export',visual:`<div class="case-line-system case-line-system--unbound"><figure><span>Live browser product</span><img src="/portfolio-designs/ink-paper/assets/unboundpdf.png" alt="UnboundPDF running as a local browser product"></figure><div class="case-line-route"><i></i><span><b>01</b>Local file</span><span><b>02</b>Browser worker</span><span><b>03</b>PDF engine</span><span><b>04</b>Local export</span></div><aside><span>Processing boundary</span><strong>On device</strong><p>Input and output remain inside the browser session.</p><b>✓ Returned to user</b></aside></div>`,chapters:[
    ['Input','Your file enters the browser—not our server.','The product begins with a local file handle. No account is created and the document is not routed through an upload pipeline.','Choose locally'],
    ['Process','Owned engines work inside the device.','PDF parsing, conversion, OCR and deterministic checks run with browser workers and local memory. Capability is engineered, not delegated to an opaque upload service.','Work in memory'],
    ['Evaluate','The product explains what it cannot safely claim.','Repair, password and OCR boundaries stay visible. A difficult document can be refused instead of returning a polished but false result.','Refuse false output'],
    ['Export','The finished file returns to the user.','The output is downloaded directly from the browser session. The system does not need to retain the original or the result.','Return to user']
  ]},
  conxto:{section:'agent-career-os',status:'Find → qualify → tailor → evaluate → act',visual:`<div class="case-line-system case-line-system--conxto"><figure><span>AI career operating system</span><img src="/portfolio-designs/ink-paper/assets/conxto-ui.png" alt="Conxto career operating system"></figure><div class="case-line-route"><i></i><span><b>01</b>Own job API</span><span><b>02</b>Eligibility</span><span><b>03</b>Tailor</span><span><b>04</b>Eval + harness</span></div><aside><span>Five specialist agents</span><strong>Shared memory</strong><p>Review mode · Preference Autopilot</p><b>✓ Eligible jobs only</b></aside></div>`,chapters:[
    ['Find','Owned job infrastructure creates the working market.','Conxto fetches and ranks opportunities through its own API instead of starting from a generic chat prompt.','Owned job API'],
    ['Qualify','Eligibility is checked before application work begins.','Role, location, experience and user preferences determine whether a job should proceed. Ineligible jobs do not enter Autopilot.','Eligibility gate'],
    ['Tailor','The owned résumé engine prepares both application assets.','Résumé and cover letter adapt to the role while claims remain grounded in the user’s real career evidence and shared memory.','Résumé + cover letter'],
    ['Evaluate','Agent work is challenged before it becomes ready.','The specialist output passes through evaluation and harness checks rather than relying only on the producing agent’s confidence.','Eval + harness'],
    ['Act','The user chooses review or a bounded Autopilot mandate.','Review mode keeps the application with the user. Autopilot acts automatically only inside the preferences the user set and only for eligible jobs.','Review or Autopilot']
  ]},
  'agent-services':{section:'governed-execution',status:'Describe → match → graph → prove → govern',visual:`<div class="governance-graph"><figure><span>37 services · public inspection</span><img src="/portfolio-designs/ink-paper/assets/agent-lab-live.png" alt="Agent Services public Lab"></figure><div class="governance-spine"><i></i><span>Match</span><span>Graph</span><span>Harness + eval</span><span>Authority</span></div><figure><span>Studio · private control</span><img src="/portfolio-designs/ink-paper/assets/studio-ui.png" alt="VVDex Studio private control plane"></figure></div>`,chapters:[
    ['Match','Start with the work, not an agent name.','Describe the real outcome and inspect the closest governed service. If no pattern fits, the system produces a blueprint that still requires review and approval.','Closest governed pattern'],
    ['Engineer','The service becomes an explicit operating graph.','Contracts define graph nodes, tools, memory policy, evidence and human gates. Models remain provider-neutral workers inside that structure.','Graph compiled'],
    ['Prove','Execution is challenged before it is trusted.','Harness paths exercise clean, exception and failure cases while evaluation inspects the evidence. The canonical portfolio run covers 2,146 cases without pretending they are customer deployments.','Harness + evaluation'],
    ['Operate','Private execution keeps public proof and customer authority separate.','Studio specializes models, tools, traces and reviewed memory for the customer context. Public Lab exposes the pattern—not credentials, private data or write authority.','Human authority retained']
  ]},
  conxfolio:{section:'free-career-suite',status:'Résumé → letter → ATS → hosted portfolio',visual:`<div class="case-line-system case-line-system--conxfolio case-line-system--conxfolio-suite"><figure><span>20+ portfolio designs</span><img src="/portfolio-designs/ink-paper/assets/conxfolio-gallery.png" alt="Conxfolio portfolio design gallery"></figure><div class="case-line-route"><i></i><span><b>01</b>Résumé · 37</span><span><b>02</b>Cover letter</span><span><b>03</b>ATS checker</span><span><b>04</b>Portfolio · 20+</span></div><aside><span>Open access</span><strong>Free to build</strong><p>No signup · all tools free</p><b>✓ Free portfolio hosting</b></aside></div>`,chapters:[
    ['Résumé','Build or import a résumé and choose from 37 templates.','Focused editing, visible document preview and design choice live in one product instead of sending the user between disconnected tools.','37 templates'],
    ['Cover letter','Turn career evidence into a role-specific letter.','The cover-letter workspace uses the same career material while keeping the output editable and reviewable.','Role-specific letter'],
    ['ATS','Inspect readiness before sending.','The ATS tool explains the score, verified checks and priority fixes so the user sees what needs attention.','Actionable ATS review'],
    ['Portfolio','Choose from more than twenty designs and host the result free.','The portfolio builder converts the completed career material into a shareable public presence without requiring payment or signup to begin.','Create → host free']
  ]},
  farmquick:{section:'durable-order',status:'Request → n8n → human',visual:`<div class="case-line-system case-line-system--farmquick"><figure><span>Live B2B supply product</span><img src="/portfolio-designs/ink-paper/assets/farmquick-live.png" alt="FarmQuick catalogue and order interface"></figure><div class="case-line-route"><i></i><span><b>01</b>Buyer request</span><span><b>02</b>Wholesale brief</span><span><b>03</b>n8n workflow</span><span><b>04</b>Human confirm</span></div><aside><span>Real supply operation</span><strong>Exotic vegetables</strong><p>Wholesale sourcing plus peeled garlic at up to 1,000 kg/day stated capacity.</p><b>No online payment</b></aside></div>`,chapters:[
    ['Request','The product fits how business buyers actually order.','Products, units and quantities sit beside schedule, needed date, delivery area and packing notes. It is not consumer checkout disguised as B2B.','A complete buyer request'],
    ['Prepare','The wholesale brief is complete before automation.','Produce, quantities, schedule, packing and delivery context travel together as one buyer request.','Wholesale brief ready'],
    ['Route','Automation moves information, not authority.','Self-hosted n8n routes the order workflow for normalisation, internal notification and controlled acknowledgement.','n8n workflow routing'],
    ['Confirm','The business makes the commercial promise.','Stock, price, packing and delivery remain human-confirmed. The system supports the operation without fabricating availability.','Human confirmation']
  ]},
  vvdexops:{section:'public-ledger',status:'Instrument → commit → settle → publish',visual:`<div class="case-line-system case-line-system--vvdexops"><figure><span>BTC · ETH · SOL · 2 venues</span><img src="/portfolio-designs/ink-paper/assets/vvdexops-live.png" alt="VVDexOps market microstructure platform"></figure><div class="case-line-route"><i></i><span><b>01</b>Public market data</span><span><b>02</b>Research commit</span><span><b>03</b>Settle outcome</span><span><b>04</b>Publish record</span></div><aside><span>Dated research · 22 Jul 2026</span><strong>69.6%</strong><p>670 committed calls · 69.8% market implied · −0.017 fee-adjusted edge.</p><b>No edge yet</b></aside></div>`,chapters:[
    ['Instruments','The public product is useful without a forecast.','Free, no-login order flow, order book, footprint, tape, CVD, funding, open interest, liquidations and indicators cover BTC, ETH and SOL across two venues.','Free public instruments'],
    ['Research','The forecast system stays a separate surface.','A 15-minute BTC research process consumes market evidence, but private agents and bots do not become a public trading product or advice channel.','Research separated'],
    ['Commit','The prediction is fixed before the outcome.','UP, DOWN or ABSTAIN is committed five minutes into the cycle. It cannot be rewritten during settlement to flatter the model.','Prediction locked'],
    ['Publish','The ledger keeps the uncomfortable result.','Outcomes, fee assumptions, losses and hashes remain public and downloadable. At the dated snapshot, 69.6% did not beat the 69.8% market-implied probability.','No edge yet']
  ]}
};
const flagship=flagshipStories[slug];
const flagshipSection=flagship?`<section class="flagship-story flagship-story--${slug}" data-flagship-story data-case-section="${flagship.section}">
  <div class="flagship-visual flagship-visual--${slug}" data-step="0">${flagship.visual}<div class="engine-status"><span>${flagship.status}</span><b data-engine-status>${flagship.chapters[0][3]}</b></div></div>
  <div class="flagship-chapters">${flagship.chapters.map(([label,title,copy,state],index)=>`<article${index===0?' class="is-active"':''} data-engine-step="${index}" data-engine-label="${state}"><span>${String(index+1).padStart(2,'0')} · ${label}</span><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>
</section>`:'';

const evidenceSequences={
  conxto:{status:'Verified product journey · local QA evidence',frames:[
    ['/portfolio-designs/ink-paper/assets/conxto-proof-01-command.png','01 · Command','One place to direct the career loop','Command centre with current matches, applications and an explicit question instead of a guessed answer','1.55','50%','28%'],
    ['/portfolio-designs/ink-paper/assets/conxto-proof-02-discover.png','02 · Qualify','Fit, eligibility and assumptions stay visible','Discover analysis showing job fit, résumé readiness, source freshness and assumptions before tailoring','1.65','67%','34%'],
    ['/portfolio-designs/ink-paper/assets/conxto-proof-03-application.png','03 · Prepare','Unknown requirements remain unknown','Application state recording an unverified language requirement and confirming that nothing was sent','1.7','52%','29%'],
    ['/portfolio-designs/ink-paper/assets/conxto-proof-04-package.png','04 · Review','The complete package stops for review','Résumé, cover letter, screening answers and dry-run receipt remain blocked until required review is complete','1.75','70%','26%']
  ],chapters:[
    ['Command','The user directs one connected career system.','Matches, applications, résumé evidence and the next useful action share one operating surface. When a required fact is missing, Conxto asks instead of silently inventing it.','User context retained'],
    ['Qualify','A job is inspected before application work begins.','Fit, ATS readiness, posting freshness, eligibility evidence and assumptions are visible together. The user can reject the role before an agent spends time tailoring it.','Eligibility before tailoring'],
    ['Prepare','Uncertainty is recorded, not polished away.','The application timeline shows what Conxto completed, what remains unknown and whether anything was sent. An unverifiable language requirement stays explicitly unverified.','Nothing silently sent'],
    ['Review','The package exposes every consequential part.','Résumé, cover letter, screening answers and the dry-run receipt can be inspected before action. Missing answers and unread assets keep submission blocked.','Review before action']
  ]},
  'agent-services':{status:'Public product evidence · captured 25 Aug 2026',frames:[
    ['/portfolio-designs/ink-paper/assets/agent-proof-01-public-lab.jpg','01 · Public Lab','37 governed services · 2,146 harness cases','Public showcase exposing the operating loop, receipts, evaluation and retained human authority','1.7','52%','45%'],
    ['/portfolio-designs/ink-paper/assets/agent-proof-02-service-atlas.jpg','02 · Atlas','Every governed pattern remains inspectable','The complete service atlas lets a visitor browse operational areas and open a full workflow','1.65','44%','38%'],
    ['/portfolio-designs/ink-paper/assets/agent-proof-03-service-contract.jpg','03 · Contract','One real service becomes concrete','Document Operations exposes its outcome, stages, boundary and private-control-plane relationship','1.65','48%','48%'],
    ['/portfolio-designs/ink-paper/assets/agent-proof-04-graph-evidence.jpg','04 · Evidence','Receipts can be opened—not merely claimed','The public Evidence view reveals source-bound proof while customer data and authority remain private','1.7','50%','48%']
  ],chapters:[
    ['Inspect','The public Lab makes governance visible before access is requested.','Service count, harness evidence, the operating loop and zero-public-write boundary appear on the first screen. Public proof does not imply a connected customer system.','Public proof visible'],
    ['Choose','The visitor can inspect all thirty-seven patterns.','The atlas is not a featured shortlist. Operational areas, outcomes and workflow entrances remain visible so a real brief can be matched to an authored system.','37 patterns inspectable'],
    ['Open','A service contract explains what the agent actually does.','Document Operations names the incoming work, the verified record, the exception boundary and the controlled private execution surface.','Contract before provider'],
    ['Prove','Evidence is a product surface of its own.','The service exposes receipt-linked source, trace and evaluation proof without exposing customer credentials, tenant data or operational memory.','Evidence opened']
  ]},
  conxfolio:{status:'Verified local product evidence · August 2026',frames:[
    ['/portfolio-designs/ink-paper/assets/conxfolio-proof-01-resume.png','01 · Résumé','Thirty-seven authored résumé systems','The design library shows category, provenance-labelled examples and complete document previews','1.5','23%','48%'],
    ['/portfolio-designs/ink-paper/assets/conxfolio-proof-02-cover.png','02 · Letter','Job, evidence, writing and export stay connected','The cover-letter workspace keeps role context, career evidence and the live document in one flow','1.6','58%','48%'],
    ['/portfolio-designs/ink-paper/assets/conxfolio-proof-03-ats.png','03 · ATS','A score becomes an actionable report','Deterministic readiness dimensions, priority fixes and verified checks explain what needs work','1.65','60%','36%'],
    ['/portfolio-designs/ink-paper/assets/conxfolio-proof-04-portfolio.png','04 · Portfolio','Career evidence becomes a hosted presence','The portfolio studio connects content editing, design choice, desktop/mobile preview and publishing','1.65','67%','42%']
  ],chapters:[
    ['Résumé','The suite begins with real document choice.','Thirty-seven résumé designs are grouped by purpose and shown with complete previews. Examples are labelled so fictional demonstration content cannot be mistaken for user evidence.','37 résumé designs'],
    ['Letter','The cover letter uses the same career evidence.','Job context, evidence, writing, design and export form one visible workflow while the live letter stays beside the editing surface.','Evidence stays connected'],
    ['ATS','The report explains the score instead of worshipping it.','Readiness dimensions, direct fixes and verified checks make the result actionable. The product states that this is not an employer prediction.','Actionable ATS report'],
    ['Portfolio','The finished career material becomes a public presence.','Content and design remain editable beside the live portfolio. The suite can carry the result from résumé evidence to a shareable hosted site.','Build → preview → publish']
  ]},
  farmquick:{status:'Live product evidence · captured 25 Aug 2026',frames:[
    ['/portfolio-designs/ink-paper/assets/farm-proof-01-live-supply.jpg','01 · Supply','A real operation appears before software','The live product leads with the VJ Agro Farms legacy, commercial buyers and produce prepared for business','1.55','38%','48%'],
    ['/portfolio-designs/ink-paper/assets/farm-proof-02-peeled-garlic.jpg','02 · Flagship','Peeled garlic · up to 1,000 kg/day stated','Dedicated machinery, commercial packing and requirement-led supply are explained beside the produce range','1.65','29%','55%'],
    ['/portfolio-designs/ink-paper/assets/farm-proof-03-produce-catalogue.jpg','03 · Wholesale','Exotic vegetable wholesale, quote-confirmed','The exotic vegetable wholesale catalogue shows sourcing depth while avoiding invented live-stock promises','1.65','48%','62%'],
    ['/portfolio-designs/ink-paper/assets/farm-proof-04-order-brief.jpg','04 · Order','No payment · a complete buyer brief','Buyers choose produce and quantities, then FarmQuick confirms price, packing, availability and delivery','1.65','58%','48%']
  ],chapters:[
    ['Supply','The website represents an operating wholesale business.','Commercial buyers, exotic vegetable wholesale, sourcing history and produce capability appear before the order software. FarmQuick is not presented as a speculative grocery app.','Wholesale business first'],
    ['Flagship','The core product has a specific operating claim.','Peeled garlic is prepared and packed against a confirmed requirement with stated capacity up to 1,000 kg/day. Pack format and schedule are agreed before supply.','Peeled-garlic operation'],
    ['Catalogue','Product breadth does not become fake availability.','The catalogue makes the sourcing range visible while stating that current availability is confirmed with the quote.','Quote-confirmed availability'],
    ['Order','n8n routes the brief; people make the promise.','The buyer selects produce, quantities, schedule and delivery context without paying online. n8n routes the workflow, and FarmQuick confirms price, packing, availability and delivery.','n8n routed · human confirmed']
  ]},
  vvdexops:{status:'Live public evidence · captured 25 Aug 2026',frames:[
    ['/portfolio-designs/ink-paper/assets/ops-proof-01-live-board.jpg','01 · Board','Order flow, free and without an account','The public board combines chart, volume profile, footprint, order book and tape across BTC, ETH and SOL','1.55','56%','54%'],
    ['/portfolio-designs/ink-paper/assets/ops-proof-02-instruments.jpg','02 · Instruments','Freshness is disclosed on the instrument itself','The separate instrument page shows market structure and warns when the published snapshot is stale','1.6','53%','48%'],
    ['/portfolio-designs/ink-paper/assets/ops-proof-03-public-ledger.jpg','03 · Ledger','Every call remains visible—including losses','The downloadable ledger publishes accuracy, market-implied probability, fee-adjusted edge and a failed preregistered gate','1.6','52%','36%'],
    ['/portfolio-designs/ink-paper/assets/ops-proof-04-research-record.jpg','04 · Research','A paper hypothesis is scored in public','The separate research page keeps the live call, market price, hash chain and negative edge together','1.65','62%','42%']
  ],chapters:[
    ['Board','The public product is useful without a forecast.','Order flow, charting, volume profile, footprint, order book and trade tape are available across three assets without login or payment.','Free public instruments'],
    ['Freshness','A stale snapshot is labelled as stale.','The instruments surface exposes data age instead of letting an old number masquerade as current market truth.','Freshness disclosed'],
    ['Ledger','The losing result remains downloadable.','Committed calls, settled outcomes, market-implied probability, fee assumptions and the failed preregistered gate remain visible together.','Failures included'],
    ['Research','The hypothesis stays separate from trading authority.','The 15-minute BTC system is a scored paper-research record. Private agents and bots do not become advice, signals or a public execution product.','Paper research only']
  ]}
};
const evidence=evidenceSequences[slug];
const evidenceSection=evidence?`<section id="evidence" class="unbound-proof-story product-evidence-story flagship-story" data-flagship-story data-case-section="product-evidence">
  <div class="flagship-visual unbound-proof-stage" data-step="0">
    <div class="unbound-proof-viewport" tabindex="0" aria-label="${data.title} product evidence. Swipe or use the arrow controls to change frame.">
      ${evidence.frames.map(([src,label,caption,alt,zoom,x,y],index)=>`<figure class="unbound-proof-frame" data-proof-frame="${index}" style="--detail-zoom:${zoom};--detail-x:${x};--detail-y:${y}"><div class="unbound-proof-context"><img src="${src}" alt="${alt}" loading="${index===0?'eager':'lazy'}" decoding="async"${index===0?' fetchpriority="high"':''}></div><div class="unbound-proof-detail" aria-hidden="true"><img src="${src}" alt="" loading="${index===0?'eager':'lazy'}" decoding="async"><span>${caption}</span></div><figcaption><span>${label}</span><b>${caption}</b></figcaption></figure>`).join('')}
    </div>
    <div class="unbound-proof-controls" aria-label="Evidence controls"><button type="button" data-proof-prev aria-label="Previous evidence">←</button><span><b data-proof-count>01</b> / 04</span><button type="button" data-proof-next aria-label="Next evidence">→</button><button type="button" data-proof-inspect>Inspect HD ↗</button></div>
    <div class="unbound-proof-index" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="engine-status"><span>${evidence.status}</span><b data-engine-status>${evidence.chapters[0][3]}</b></div>
  </div>
  <div class="flagship-chapters">${evidence.chapters.map(([label,title,copy,state],index)=>`<article${index===0?' class="is-active"':''} data-engine-step="${index}" data-engine-label="${state}"><span>${String(index+1).padStart(2,'0')} · ${label}</span><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>
</section>`:'';
const evidenceDialog=evidence?`<dialog class="unbound-proof-dialog" data-proof-dialog aria-label="Full-resolution ${data.title} evidence"><button type="button" data-proof-close>Close ×</button><figure><img data-proof-dialog-image src="${evidence.frames[0][0]}" alt="${evidence.frames[0][3]}" loading="lazy" decoding="async"><figcaption data-proof-dialog-caption>${evidence.frames[0][1]} — ${evidence.frames[0][2]}</figcaption></figure></dialog>`:'';

const unboundCase=`
  <main class="case case--unboundpdf case--editorial">
    <section class="case-shell case-hero unbound-case-hero" data-case-section="overview">
      <div class="unbound-case-copy">
        <p class="case-kicker">UnboundPDF · Case 01</p>
        <p class="unbound-case-status">Live public utility</p>
        <h1>UnboundPDF</h1>
        <p class="unbound-case-dek">Private document systems, made usable.</p>
        <p>Forty-three PDF tools run inside the browser. Workspace is an additional layer for chaining them into named copies. Files stay on the device; no account, upload or watermark.</p>
        <dl><div><dt>43</dt><dd>browser tools</dd></div><div><dt>On device</dt><dd>file processing</dd></div></dl>
        <div class="case-live">${liveAction}</div>
      </div>
      <div class="unbound-case-media" data-project-hero="unboundpdf">
        <div class="unbound-product-signature" data-unbound-signature aria-label="UnboundPDF product system: one local document, two ways to work, one local output">
          <header><span>Local document system</span><b>Nothing uploaded</b></header>
          <div class="unbound-signature-canvas">
            <div class="signature-file"><span>01 · Input</span><i></i><strong>Your PDF</strong><small>read in this browser</small></div>
            <div class="signature-route" aria-hidden="true"><i></i><b></b></div>
            <div class="signature-modes">
              <article><span>02A · One tool</span><strong>One job.<br>One result.</strong><small>Choose · process · download</small></article>
              <article><span>02B · Workspace</span><strong>One file.<br>Many tools.</strong><small>Copies · chain · passport</small></article>
            </div>
            <div class="signature-output"><span>03 · Output</span><strong>Returned to you</strong><small>no account · no watermark</small></div>
          </div>
          <footer><span>43 browser tools</span><i></i><b>File boundary stays local</b></footer>
        </div>
      </div>
    </section>

    <section class="case-editorial-statement reveal" data-case-section="outcome">
      <p class="case-kicker">The outcome</p>
      <p>Most PDF tools treat privacy as a feature.<br><em>We built it into the system.</em></p>
      <span>A complete browser toolkit, plus a Workspace for chaining tools, without surrendering the document.</span>
    </section>

    <section class="unbound-product-film" data-unbound-film data-case-section="proof">
      <header class="unbound-film-intro"><p class="case-kicker">Current product · six real states</p><h2>The interface is the evidence.<br><em>Move through the product.</em></h2><p>Swipe, drag or use the controls to inspect the complete toolkit without turning the case study into a long screenshot wall.</p></header>
      <div class="unbound-film-deck" data-film-deck tabindex="0" role="region" aria-roledescription="carousel" aria-label="Six UnboundPDF product states">
        <header class="unbound-film-deckbar">
          <div class="unbound-film-gesture" aria-hidden="true"><i></i><span>Swipe / drag</span></div>
          <div class="unbound-film-count" aria-live="polite"><strong data-film-current>01</strong><span>/ 06</span></div>
        </header>
        <nav class="unbound-film-rail" aria-label="Choose a product state">
          <button type="button" data-film-go="0"><span>01</span>Product</button>
          <button type="button" data-film-go="1"><span>02</span>Choice</button>
          <button type="button" data-film-go="2"><span>03</span>Breadth</button>
          <button type="button" data-film-go="3"><span>04</span>Direct</button>
          <button type="button" data-film-go="4"><span>05</span>Workspace</button>
          <button type="button" data-film-go="5"><span>06</span>Evidence</button>
        </nav>
        <div class="unbound-film-scenes">
        <article class="unbound-film-scene" data-film-scene>
          <header><span>01 · Product</span><h3>The complete toolkit comes first.</h3><p>Forty-three PDF and image tools. No account, no watermark and local browser processing.</p></header>
          <figure><div class="unbound-film-window unbound-film-window--home"><img src="/portfolio-designs/ink-paper/assets/unbound-evidence-home-hd.png" alt="UnboundPDF complete browser-local PDF toolkit homepage"></div><figcaption><span>Current public homepage</span><button type="button" data-film-inspect>View original ↗</button></figcaption></figure>
        </article>
        <article class="unbound-film-scene" data-film-scene>
          <header><span>02 · Choice</span><h3>One tool, or the whole job.</h3><p>A direct tool keeps a single task short. Workspace keeps a multi-step document connected.</p></header>
          <figure><div class="unbound-film-window unbound-film-window--choice"><img src="/portfolio-designs/ink-paper/assets/unbound-evidence-two-ways-hd.png" alt="UnboundPDF explaining One tool and Workspace as two ways to work"></div><div class="unbound-choice-mobile" aria-hidden="true"><div><span>One tool</span></div><div><span>Workspace</span></div></div><figcaption><span>Two real operating modes</span><button type="button" data-film-inspect>View original ↗</button></figcaption></figure>
        </article>
        <article class="unbound-film-scene" data-film-scene>
          <header><span>03 · Breadth</span><h3>Every capability stays visible.</h3><p>Organize, convert, edit, optimize, security, images and legal work remain searchable in one index.</p></header>
          <figure><div class="unbound-film-window unbound-film-window--tools"><img src="/portfolio-designs/ink-paper/assets/unbound-evidence-tools-hd.png" alt="UnboundPDF full index of 43 PDF and image tools"></div><figcaption><span>43 tools · seven categories</span><button type="button" data-film-inspect>View original ↗</button></figcaption></figure>
        </article>
        <article class="unbound-film-scene" data-film-scene>
          <header><span>04 · Direct route</span><h3>One job opens as one focused tool.</h3><p>The PDF Editor has its own local file entrance, capability boundary and result path.</p></header>
          <figure><div class="unbound-film-window unbound-film-window--direct"><img src="/portfolio-designs/ink-paper/assets/unbound-evidence-single-tool-hd.png" alt="UnboundPDF PDF Editor direct single-tool page"></div><figcaption><span>Pick · process locally · download</span><button type="button" data-film-inspect>View original ↗</button></figcaption></figure>
        </article>
        <article class="unbound-film-scene" data-film-scene>
          <header><span>05 · Workspace</span><h3>The toolbox stays beside the document.</h3><p>Edit, organize, convert, secure and optimize tools remain available while every run creates a new copy.</p></header>
          <figure><div class="unbound-film-window unbound-film-window--workspace"><img src="/portfolio-designs/ink-paper/assets/unbound-evidence-workspace-tools-hd.png" alt="UnboundPDF Workspace with the Edit toolbox open beside the active document"></div><figcaption><span>Original preserved · copies remain inspectable</span><button type="button" data-film-inspect>View original ↗</button></figcaption></figure>
        </article>
        <article class="unbound-film-scene" data-film-scene>
          <header><span>06 · Evidence</span><h3>The receipt remains attached.</h3><p>The Document Passport records the local chain and verifies whether candidate bytes appear in it.</p></header>
          <figure><div class="unbound-film-window unbound-film-window--passport"><img src="/portfolio-designs/ink-paper/assets/unbound-evidence-passport-hd.png" alt="UnboundPDF Workspace Document Passport over the active document and open tool panel"></div><figcaption><span>Integrity evidence · not authorship theatre</span><button type="button" data-film-inspect>View original ↗</button></figcaption></figure>
        </article>
        </div>
        <footer class="unbound-film-controls">
          <p><span data-film-status>Product</span><small>Swipe the frame or choose a chapter above</small></p>
          <div><button type="button" data-film-prev aria-label="Previous product state">← Previous</button><button type="button" data-film-next aria-label="Next product state">Next →</button></div>
        </footer>
      </div>
    </section>

    <dialog class="unbound-proof-dialog unbound-film-dialog" data-film-dialog aria-label="Full-resolution UnboundPDF evidence"><button type="button" data-film-close>Close ×</button><figure><img data-film-dialog-image src="/portfolio-designs/ink-paper/assets/unbound-evidence-home-hd.png" alt="UnboundPDF complete browser-local PDF toolkit homepage"><figcaption data-film-dialog-caption>Current public homepage</figcaption></figure></dialog>

    <section class="case-decisions" data-case-section="decisions">
      <header><p class="case-kicker">Decisions and boundaries</p><h2>Useful before impressive.</h2></header>
      <div>
        <article><span>01</span><h3>Privacy is architecture.</h3><p>Local processing is the default operating boundary, not a claim added to the marketing layer.</p></article>
        <article><span>02</span><h3>Capability stays honest.</h3><p>Repair, password and OCR limitations remain visible. The product does not imply that every difficult PDF is equivalent.</p></article>
        <article><span>03</span><h3>The engines are owned.</h3><p>Browser-side parsing, OCR, conversion paths and export checks make the utility useful without delegating the document to an opaque service.</p></article>
      </div>
    </section>

    <aside class="case-boundary case-boundary--editorial reveal" data-case-section="boundary"><span>${data.boundary?.[0]||'Honest boundary'}</span><p>${data.boundary?.[1]||'The product is live and inspectable. Difficult documents still have explicit limits.'}</p></aside>

    <section class="case-delivery case-delivery--editorial" data-case-section="delivery"><p class="case-kicker">Proof and ownership</p><h2>Role, stack and current status.</h2><div class="delivery-grid"><article><span>Role</span><h3>What I owned</h3><p>${data.role}</p></article><article><span>Stack</span><h3>${(data.stack||[]).slice(0,4).join(' · ')}</h3><p>${(data.stack||[]).join(' · ')}</p></article><article><span>Links</span><h3>Inspect the shipped product</h3><p>${links}</p></article><article><span>Status</span><h3>${data.status}</h3><p>Search discovery and difficult-document coverage remain active work; product scope is never substituted for outcome proof.</p></article></div></section>
    <nav class="case-nav"><a data-close-case href="/portfolio-designs/ink-paper/#work"><span>Back to selected work</span><strong>Close case ←</strong></a><a href="/portfolio-designs/ink-paper/cases/${nextSlug}/"><span>Next case · 02</span><strong>${nextData.title} →</strong></a></nav>
  </main>`;

const flagshipCaseMeta={
  conxto:{statement:'Most career AI stops after generating text.',emphasis:'Conxto operates the complete job-search loop.',note:'Five specialists share memory, find and qualify jobs, tailor the application, pass evaluation and act through review or eligibility-gated Autopilot.'},
  'agent-services':{statement:'A model can perform the work.',emphasis:'The service graph retains authority.',note:'Thirty-seven public patterns explain the work; Studio privately specializes graphs, models, tools, harnesses, traces and reviewed memory.'},
  conxfolio:{statement:'Career creation is usually split across paid tools.',emphasis:'Conxfolio makes the complete suite free.',note:'Résumé, cover letter, ATS and 20+ portfolio designs lead to free hosting without signup friction.'},
  farmquick:{statement:'Automation is allowed to fail.',emphasis:'The order is not.',note:'A real VJ Agro supply operation stores the request first, then people confirm stock, price, packing and delivery.'},
  vvdexops:{statement:'Useful instruments do not need a trading promise.',emphasis:'The research still keeps every loss visible.',note:'The free market-data product and the separate paper-research ledger remain clearly divided.'}
};
const flagshipMeta=flagshipCaseMeta[slug];
const flagshipMedia=slug==='agent-services'
  ?`<div class="feature-case-media feature-case-media--paired" data-project-hero="${slug}"><img src="/portfolio-designs/ink-paper/assets/agent-lab-live.png" alt="Agent Services public Lab"><i></i><img src="/portfolio-designs/ink-paper/assets/studio-ui.png" alt="VVDex Studio control plane"></div>`
  :flagshipMeta?`<div class="feature-case-media feature-case-media--${slug}" data-project-hero="${slug}"><img src="${normalizedImage}" alt="${data.title} actual product interface"><i></i></div>`:'';
const flagshipDecisions=flagship?flagship.chapters.slice(0,3).map(([label,title,copy],index)=>`<article><span>${String(index+1).padStart(2,'0')} · ${label}</span><h3>${title}</h3><p>${copy}</p></article>`).join(''):'';
const flagshipCase=flagshipMeta?`
  <main class="case case--feature case--feature-${slug}">
    <section class="case-shell feature-case-hero" data-case-section="overview">
      <div class="feature-case-copy"><p class="case-kicker">${data.title} · Case ${String(currentIndex+1).padStart(2,'0')}</p><p class="feature-case-status">${data.status}</p><h1>${data.title}</h1><p class="feature-case-dek">${data.lead}</p><dl>${(data.facts||[]).slice(0,2).map(([value,label])=>`<div><dt>${value}</dt><dd>${label}</dd></div>`).join('')}</dl><div class="case-live">${liveAction}</div></div>
      ${flagshipMedia}
    </section>
    <section class="case-editorial-statement feature-case-statement reveal" data-case-section="outcome"><p class="case-kicker">The governing idea</p><p>${flagshipMeta.statement}<br><em>${flagshipMeta.emphasis}</em></p><span>${flagshipMeta.note}</span></section>
    ${evidenceSection}
    ${evidenceDialog}
    ${flagshipSection}
    <section class="case-decisions feature-case-decisions" data-case-section="decisions"><header><p class="case-kicker">Product decisions</p><h2>The system beneath the screen.</h2></header><div>${flagshipDecisions}</div></section>
    <aside class="case-boundary case-boundary--editorial reveal" data-case-section="boundary"><span>${data.boundary?.[0]||'Honest boundary'}</span><p>${data.boundary?.[1]||'The current limitation remains visible because proof includes what is not complete.'}</p></aside>
    <section class="case-delivery case-delivery--editorial" data-case-section="delivery"><p class="case-kicker">Proof and ownership</p><h2>Role, stack and current status.</h2><div class="delivery-grid"><article><span>Role</span><h3>What I owned</h3><p>${data.role}</p></article><article><span>Stack</span><h3>${(data.stack||[]).slice(0,4).join(' · ')}</h3><p>${(data.stack||[]).join(' · ')}</p></article><article><span>Links</span><h3>${liveProject?'Inspect the shipped product':'Private product surface'}</h3><p>${links||'Private system; public access is not offered.'}</p></article><article><span>Status</span><h3>${data.status}</h3><p>The operating boundary above remains part of the evidence.</p></article></div></section>
    <nav class="case-nav"><a data-close-case href="/portfolio-designs/ink-paper/#work"><span>Back to selected work</span><strong>Close case ←</strong></a><a href="/portfolio-designs/ink-paper/cases/${nextSlug}/"><span>Next case · ${String(((currentIndex+1)%navigationOrder.length)+1).padStart(2,'0')}</span><strong>${nextData.title} →</strong></a></nav>
  </main>`:'';

const standardCase=`
  <main class="case case--${slug}">
    <section class="case-shell case-hero" data-case-section="overview">
      <div class="case-tags"><span>${data.status}</span><span>${data.kicker}</span></div>
      <div class="case-title"><h1>${data.title}</h1><p>${data.lead}</p></div>
      <div class="case-live">${liveAction}</div>
      <dl class="case-facts">${facts}</dl>
    </section>
    <section class="case-intro reveal" data-case-section="product"><p class="case-kicker">The product</p><p>${firstStory}</p></section>
    ${normalizedImage?`<figure class="case-proof reveal" data-case-section="proof"><img src="${normalizedImage}" alt="${data.title} actual product evidence"><figcaption><span>Actual product evidence</span><span>${data.status}</span></figcaption></figure>`:''}
    ${systemSection}
    ${flagshipSection}
    <section class="case-flow" data-case-section="operation"><p class="case-kicker">How it works</p><h2>A clear operating path.</h2><div class="flow-grid">${flow}</div></section>
    <section class="case-story" data-case-section="depth"><p class="case-kicker">Case study</p><h2>What exists beneath the interface.</h2><div class="story-grid">${stories}</div></section>
    <aside class="case-boundary reveal"><span>${data.boundary?.[0]||'Honest boundary'}</span><p>${data.boundary?.[1]||'The current limitation remains visible because proof includes what is not complete.'}</p></aside>
    ${services}
    <section class="case-delivery"><p class="case-kicker">Delivery</p><h2>Role, stack and status.</h2><div class="delivery-grid"><article><span>Role</span><h3>What I owned</h3><p>${data.role}</p></article><article><span>Stack</span><h3>${(data.stack||[]).slice(0,4).join(' · ')}</h3><p>${(data.stack||[]).join(' · ')}</p></article><article><span>Links</span><h3>Inspect the work</h3><p>${links||'Private system; public access is not offered.'}</p></article><article><span>Status</span><h3>${data.status}</h3><p>The operating boundary above remains part of the case.</p></article></div></section>
    <nav class="case-nav"><a data-close-case href="/portfolio-designs/ink-paper/#work"><span>Back to selected work</span><strong>Close case ←</strong></a><a href="/portfolio-designs/ink-paper/cases/${nextSlug}/"><span>Next case · ${String(((currentIndex+1)%navigationOrder.length)+1).padStart(2,'0')}</span><strong>${nextData.title} →</strong></a></nav>
  </main>`;

app.innerHTML=`
  <div class="case-progress" aria-hidden="true"><span></span></div>
  <header class="case-top"><a href="/portfolio-designs/ink-paper/#work">← Back</a><span>${data.title} · Case ${String(currentIndex+1).padStart(2,'0')}</span><a data-close-case href="/portfolio-designs/ink-paper/#work">Close ×</a></header>
  ${slug==='unboundpdf'?unboundCase:(flagshipCase||standardCase)}
  <footer><span>© 2026 Vamsi Venkatesh</span><nav><a href="/portfolio-designs/ink-paper/">Home</a><a href="/portfolio-designs/ink-paper/work/">Archive</a></nav></footer>`;

document.title=`${data.title} — Case Study · Vamsi Venkatesh`;
document.querySelectorAll('[data-close-case]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();window.location.replace(link.href)}));
window.dispatchEvent(new Event('inkpaper:render'));
import('/portfolio-designs/ink-paper/experience.js?v=116').then(module=>module.initExperience?.());
