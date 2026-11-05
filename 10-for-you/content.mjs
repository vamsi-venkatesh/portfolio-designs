// Approved public copy, generated 2026-11-01 from portfolio-inside/src/content (site.mjs + cases/*.json). Phone, sources and conflicts removed. Use ONLY these facts.
export const person = {
 "name": "Vamsi Venkatesh",
 "first": "Vamsi",
 "last": "Venkatesh",
 "role": "AI product engineer",
 "city": "Magdeburg, Germany",
 "email": "vamsi@vamsivenkatesh.com",
 "linkedin": "https://www.linkedin.com/in/vamsivenkatesh",
 "github": "https://github.com/vamsi-venkatesh",
 "site": "https://vamsivenkatesh.com",
 "lede": "I design, build and run AI products end to end: the product, the agents, the servers and the tests that prove it works.",
 "roles": [
  "AI engineer",
  "AI product engineer",
  "AI evaluation engineer"
 ],
 "wants": "I am looking for an AI role: AI engineer, AI product engineer or AI evaluation engineer, remote or on-site in Germany, on a team that ships real products. I also build AI products for clients. No visa sponsorship needed.",
 "availability": "Open to AI roles · remote or on-site in Germany"
};
export const work = [
 {
  "slug": "vvdex-platform",
  "name": "VVDex Platform",
  "kind": "AI evaluation platform",
  "status": "Live",
  "url": "https://vvdexops.com/",
  "host": "vvdexops.com",
  "color": "#F2703A",
  "one": "Tests AI models and agents on real work. Hidden tests decide.",
  "line": "Test AI models and agents on real work: a real task in a sealed sandbox, hidden tests decide, and a signed receipt anyone can check.",
  "problem": "AI models get compared on claims and quizzes, not on real work graded where they cannot cheat.",
  "plan": "Give any model or agent real work, keep the grading out of its reach, and hand back a score anyone can check.",
  "built": [
   "Connect a model by API key, your own server, a model on your machine, or an agent over HTTP; a key is encrypted on arrival",
   "A sealed sandbox per attempt (no network, one CPU, a step budget) and hidden tests in a separate grading box",
   "Pass rates with 95% ranges and an Ed25519-signed receipt per run; five exams free, no sign-in"
  ],
  "checks": [
   "Exams attacked before use: 9–10 cheating probes, all must fail",
   "Hidden tests grade in a separate box",
   "Every pass rate with its 95% range",
   "Every run signed: anyone can check a receipt"
  ],
  "numbers": [
   [
    "17",
    "certified exams"
   ],
   [
    "417",
    "graded attempts, published"
   ]
  ],
  "stage": [
   [
    "17",
    "certified exams"
   ],
   [
    "417",
    "graded attempts, published"
   ],
   [
    "550",
    "automated tests"
   ]
  ],
  "links": [
   [
    "vvdexops.com",
    "https://vvdexops.com/"
   ],
   [
    "Proof repository",
    "https://github.com/vamsi-venkatesh/vvdex-forge-proof"
   ]
  ]
 },
 {
  "slug": "conxto",
  "name": "Conxto",
  "kind": "AI job search",
  "status": "Live",
  "url": "https://conxto.com/",
  "host": "conxto.com",
  "color": "#D8CDBE",
  "one": "Reads live job postings against your résumé and prepares the whole application.",
  "line": "Reads live job postings against your résumé, checks every requirement and prepares the whole application. With Copilot you send; Autopilot applies inside rules you set.",
  "problem": "Job seekers apply blind: they can't see which requirements they actually meet, and tailoring every application by hand doesn't scale.",
  "plan": "Make a job search honest and fast: find roles worth applying to, prepare each application from what the résumé proves, and keep the person in charge of how it is sent.",
  "built": [
   "Its own job search engine: boards, feeds and career pages merged per job, from 22 sources",
   "A truthfulness pipeline: every rewritten line is checked against the original résumé, and anything that claims more is reverted",
   "Five specialist agents and two reviewers over one persistent memory per account"
  ],
  "checks": [
   "Every rewritten line checked against the résumé",
   "Anything that claims more is reverted",
   "Copilot: you send every application",
   "Autopilot: applies inside rules you set"
  ],
  "numbers": [
   [
    "5 + 2",
    "agents and reviewers, one memory"
   ],
   [
    "10.6 s → 2.7 s",
    "app cold start, 15 Oct 2026"
   ]
  ],
  "stage": [
   [
    "5 + 2",
    "agents and reviewers, one memory"
   ],
   [
    "1,061,623",
    "job postings collected"
   ],
   [
    "10.6 → 2.7 s",
    "app cold start, after a speed pass"
   ]
  ],
  "links": [
   [
    "conxto.com",
    "https://conxto.com/"
   ],
   [
    "Source on GitHub",
    "https://github.com/vamsi-venkatesh/conxto"
   ]
  ]
 },
 {
  "slug": "vvdex-engine",
  "name": "VVDex Engine",
  "kind": "AI service engine",
  "status": "Live",
  "url": "https://lab.vvdexops.com/",
  "host": "lab.vvdexops.com",
  "color": "#45C987",
  "one": "Describe the work in one paragraph. It compiles a service that runs by your rules.",
  "line": "Describe the work in one paragraph and the Engine compiles it into a running service: what runs by itself, what waits for you, and what never happens.",
  "problem": "Businesses want AI automation they can trust, but most tools make them build the workflow and cannot show what ran, or why.",
  "plan": "Let a business describe the outcome, then design and run the service with a person holding the authority and proof of every run.",
  "built": [
   "A compiler from a plain paragraph to a service contract: inputs, facts, rules and outcomes",
   "An authority model from your own words, and a crew of specialist agents with an independent reviewer on every result",
   "Sealed evidence for every run; connects your real systems only when you say so"
  ],
  "checks": [
   "Every action: runs itself, waits for your person, or never",
   "Incoming content is never an instruction",
   "An independent reviewer on every result",
   "Every run sealed under one SHA-256 digest"
  ],
  "numbers": [
   [
    "50",
    "compiled service examples"
   ],
   [
    "11",
    "categories of business work"
   ]
  ],
  "stage": [
   [
    "50",
    "compiled service examples"
   ],
   [
    "1,429",
    "automated tests"
   ],
   [
    "76 / 76",
    "briefs compiled into a valid process"
   ]
  ],
  "links": [
   [
    "lab.vvdexops.com",
    "https://lab.vvdexops.com/"
   ]
  ]
 },
 {
  "slug": "unboundpdf",
  "name": "UnboundPDF",
  "kind": "Browser PDF suite",
  "status": "Live",
  "url": "https://unboundpdf.com/",
  "host": "unboundpdf.com",
  "color": "#EFEAE0",
  "one": "Every PDF tool in the browser. Your file never leaves the tab.",
  "line": "Every PDF tool in the browser. The file never leaves the tab.",
  "problem": "Most online PDF tools upload your file to someone else's server before they do anything with it.",
  "plan": "Every PDF tool, running in the browser, so the file never has to be uploaded anywhere.",
  "built": [
   "54 tools, all deriving their counts from one registry",
   "A workspace that keeps your files encrypted in your own browser",
   "A release gate on every deploy: a tool audit in three browser engines and a checksum sweep of every served file"
  ],
  "checks": [
   "511 Workspace checks, none failing",
   "A checksum sweep of every served file",
   "Deployed from a clean worktree",
   "The live page re-checked after deploy"
  ],
  "numbers": [
   [
    "54",
    "tools"
   ],
   [
    "0",
    "uploads"
   ]
  ],
  "stage": [
   [
    "54",
    "tools, all in the browser"
   ],
   [
    "0",
    "uploads"
   ],
   [
    "124",
    "benchmark runs, 3 browser engines"
   ]
  ],
  "links": [
   [
    "unboundpdf.com",
    "https://unboundpdf.com/"
   ]
  ]
 },
 {
  "slug": "farmquick",
  "name": "FarmQuick",
  "kind": "B2B commerce + lead agent",
  "status": "Live",
  "url": "https://farmquick.in/",
  "host": "farmquick.in",
  "color": "#86C977",
  "one": "The ordering site a produce business runs on, and the agent that finds its next buyer.",
  "line": "End to end for a B2B produce business: the ordering site buyers use, and Lead Desk, the agent that finds the next buyer every morning.",
  "problem": "A B2B produce business needed a proper ordering channel for its buyers, and a steady way to find the next ones.",
  "plan": "Turn a family produce business into recurring, trackable B2B orders: build the site buyers order from, then the automation that finds the next buyer.",
  "built": [
   "The ordering site on Cloudflare: catalogue, bulk enquiry and orders, mobile first; a person confirms before anything moves",
   "The loop closes: an order reaches the owner, becomes a won lead in the register and a line in the weekly report",
   "Lead Desk reads open sources across five cities, scores leads by written rules and uses a model only when rules cannot answer"
  ],
  "checks": [
   "408 tests on the public engine",
   "A person confirms before anything moves",
   "Owner-gated WhatsApp and email",
   "Leads scored by written rules"
  ],
  "numbers": [
   [
    "5",
    "cities read every morning"
   ],
   [
    "408",
    "tests on the public engine"
   ]
  ],
  "links": [
   [
    "farmquick.in",
    "https://farmquick.in/"
   ],
   [
    "Engine on GitHub",
    "https://github.com/vamsi-venkatesh/buyer-radar"
   ]
  ]
 },
 {
  "slug": "conxfolio",
  "name": "Conxfolio",
  "kind": "Career suite",
  "status": "Live",
  "url": "https://conxfolio.com/",
  "host": "conxfolio.com",
  "color": "#EDE4D6",
  "one": "Résumé, ATS review, cover letter and portfolio website, sharing one résumé.",
  "line": "Your next move, all here: build your résumé, check how it reads, write your letter and show your work.",
  "problem": "Good résumé tools hide the useful parts behind accounts, paywalls and watermarks.",
  "plan": "Four tools that share one résumé, free to start and free to publish.",
  "built": [
   "37 résumé designs (PDF and Word), 12 cover-letter designs and 20 portfolio websites",
   "One résumé parser with nine deterministic specialists, gated on a corpus before every ship",
   "Publish a portfolio at conxfolio.com/yourname, free"
  ],
  "checks": [
   "A parsing corpus gate before every ship",
   "Four tools share one résumé",
   "No account needed to start",
   "Publishing a portfolio is free"
  ],
  "numbers": [
   [
    "37",
    "résumé designs"
   ],
   [
    "20",
    "portfolio websites"
   ]
  ],
  "links": [
   [
    "conxfolio.com",
    "https://conxfolio.com/"
   ]
  ]
 },
 {
  "slug": "pitchradar",
  "name": "PitchRadar",
  "kind": "Event intelligence · client",
  "status": "Private",
  "url": "",
  "host": "private · client",
  "color": "#F49A4B",
  "one": "Finds and ranks the events a mobile food vendor should trade at. Built for a client.",
  "line": "Finds the events a mobile food vendor should trade at, ranks them on rules you can read, and hands the owner one brief with the evidence behind every line. Running for a client.",
  "problem": "A mobile food vendor has to find the right events to trade at, among scattered listings, deadlines and organisers.",
  "plan": "Make a vendor's week decidable: collect the public event sources, keep what each one actually said, rank by written rules, hand over one brief.",
  "built": [
   "Seven agents, each with its own receipts: discovery, extraction, qualification, contacts, deadlines, weather, reporting",
   "A deterministic core; a language model only where the rules cannot answer, and never in the score",
   "Contacts resolved from what German sites are legally obliged to publish, never guessed"
  ],
  "checks": [
   "620 tests in CI on every push",
   "No model in the score",
   "No guessed contacts",
   "Evidence behind every line"
  ],
  "numbers": [
   [
    "7",
    "agents"
   ],
   [
    "620",
    "tests · 16 Sep 2026"
   ]
  ],
  "links": [
   [
    "Engine on GitHub",
    "https://github.com/vamsi-venkatesh/pitchradar"
   ]
  ]
 },
 {
  "slug": "vvdex-trading",
  "name": "VVDex Trading",
  "kind": "Market research",
  "status": "Research",
  "url": "https://trading.vvdexops.com/",
  "host": "trading.vvdexops.com",
  "color": "#63D2A3",
  "one": "Live market microstructure beside a hash-chained record of every dated call. Paper only.",
  "line": "Live market microstructure beside a hash-chained record of every dated call. Paper only.",
  "problem": "Market calls are easy to claim after the fact, and hard to check.",
  "plan": "Publish every dated call into a chained record, so anyone can check the whole history rather than the highlights.",
  "built": [
   "Every call hash-chained to the last",
   "Paper only: no capital, no manual trades, automation or nothing",
   "Every claim gated on the threshold it declared in advance"
  ],
  "checks": [
   "Every call hash-chained to the last",
   "Claims gated on thresholds set in advance",
   "Paper only: no capital",
   "Automation or nothing: no manual trades"
  ],
  "numbers": [
   [
    "2,028",
    "dated calls"
   ],
   [
    "0",
    "capital"
   ]
  ],
  "links": [
   [
    "trading.vvdexops.com",
    "https://trading.vvdexops.com/"
   ]
  ]
 }
];
export const cases = {
 "conxto": {
  "slug": "conxto",
  "name": "Conxto",
  "url": "https://conxto.com/",
  "status": "Live",
  "category": "AI job search · multi-agent product",
  "period": "June 2026 – present",
  "one_line": "Checks live job postings against your résumé and prepares the application, reverting lines it can't prove.",
  "summary": "Conxto reads live job postings against your résumé, checks every requirement line by line, and prepares the whole application: a tailored résumé, a cover letter, screening answers and a draft email. A truthfulness pipeline reverts any rewritten line that claims more than the original résumé proves, and five specialist agents share one persistent memory per account. It is live with two paid plans: Copilot, where the person sends, and Autopilot, which applies inside rules the person sets.",
  "role": "I design, build, deploy and operate Conxto on a server I administer. AI coding agents do much of the implementation; I set the rules, review the output and sign off every release.",
  "problem": "Job seekers apply blind: they cannot see which requirements they actually meet, and tailoring every application by hand does not scale. Letting a language model rewrite a résumé removes the effort but adds a risk, because it can add claims the person never made. And a tool that sends applications for you takes over a decision that belongs to you.",
  "constraints": [
   "Nothing in an application may claim more than the résumé shows or the person has confirmed.",
   "A résumé is personal data. The database sits on an EU server, and some model providers only ever see text with the name and contact details removed.",
   "Employer forms ask for facts only the person knows, such as work authorisation, salary or start date. The system has to ask once and remember, never guess.",
   "One person runs it on one rented server shared with other products, so scoring, posting checks and PDF rendering must fit a small CPU and memory budget."
  ],
  "built": [
   {
    "title": "Job engine",
    "body": "Collects postings from boards, feeds and company career pages, merges duplicates into one record per job, and marks a posting live or dead from evidence. Each person is matched by searching the pool for their roles and places, not by scoring a recency slice."
   },
   {
    "title": "Requirement-by-requirement fit check",
    "body": "Maps each requirement in a posting to the résumé line that proves it (met, partial, missing or unclear), and caps the fit score by how much is proven. The same table drives the verdict on each role: exclude, ask, skip or review."
   },
   {
    "title": "Truthfulness pipeline",
    "body": "Rewrites one bullet at a time and reverts any line that adds a new entity or number the résumé does not support. Letters are written sentence by sentence from evidence, and an independent review step can veto a false statement."
   },
   {
    "title": "Specialist agents on one memory",
    "body": "Five specialist agents (strategist, identity, market, application, operations) and two reviewer roles work from the same per-account memory. A validator corrects any reply that claims a send, a queued task or an account change without a matching receipt."
   },
   {
    "title": "Copilot and Autopilot",
    "body": "Copilot prepares each application and the person sends it. Autopilot applies inside versioned rules the person writes (roles, places, minimum fit, minimum proof, a daily limit), and hands the application to the person when a form needs an answer, a login or a fact it does not have."
   }
  ],
  "how_it_works": [
   {
    "step": "Read the résumé",
    "body": "The résumé is parsed into structured facts; facts it cannot show, such as work authorisation or salary, are asked once and stored as confirmed."
   },
   {
    "step": "Find and rank postings",
    "body": "The job engine keeps one live record per job and searches that pool for the person's roles and places."
   },
   {
    "step": "Check every requirement",
    "body": "Each requirement is matched to the résumé line that proves it, and the fit score is capped by the share proven."
   },
   {
    "step": "Prepare the application",
    "body": "Résumé lines are rewritten one at a time and reverted if they claim more; the letter is built from evidence, and a review crew can hold anything false."
   },
   {
    "step": "Send or hand over",
    "body": "In Copilot the person reviews and sends. In Autopilot the application goes out only if it clears the person's rules, and otherwise waits under 'Needs you'."
   },
   {
    "step": "Track and remember",
    "body": "Each application's stage and outcome is recorded in the tracker, and the agents read the same memory on the next run."
   }
  ],
  "decisions": [
   {
    "decision": "Revert unsupported lines one by one instead of refusing the whole rewrite.",
    "why": "On 2026-09-07 I ran the real model on a posting far from my own résumé. It invented four titles and areas of work. The integrity guard caught them and discarded the entire rewrite, so nothing false shipped, but nothing useful did either. Checking one bullet at a time keeps the true edits and sends only the false ones back.",
    "tradeoff": "The writer is cautious. On a close match it changed 1 of 13 lines and reverted none (ATS 39 to 41), so the visible gain is small. I chose a small true gain over a large unproven one."
   },
   {
    "decision": "The person stays in charge of every send; Autopilot works inside written rules.",
    "why": "An application is the person's own statement to an employer. Copilot prepares it and the person sends it. Autopilot applies only to postings that clear the minimum fit and minimum proof the person set. It starts in review-before-send, needs an explicit confirmation to go automatic, holds the first three emails for an OK, and stops for salary questions, legal attestations and facts the person never confirmed.",
    "tradeoff": "Fewer applications leave than a bulk auto-apply tool would send, and more wait under 'Needs you'. By 2026-10-17 Autopilot had one employer-confirmed submission, and it was my own."
   },
   {
    "decision": "Count an application as sent only when the employer's page confirms it.",
    "why": "A real send on 2026-10-14 showed a verification challenge after the click. I recorded it as unverified, not sent, and made the API refuse a retry unless the person acknowledges the risk of a duplicate. A result counts as confirmed only on positive evidence, such as the employer's success message.",
    "tradeoff": "Reported numbers are lower and the person sees unresolved states. In return a counter that says 'sent' can be trusted. It also meant my first confirmed submission needed a manual check until the verifier learned the employer's success text."
   },
   {
    "decision": "Only the truth check may block an application.",
    "why": "The first version of the review crew held everything. On a dry run over three real applications none would have passed: reviewers approved 1, 0 and 1 of the three, and two were needed. One veto was over a capital letter, some reviewers worked from a clipped posting, and legitimate expansions of terms already on the résumé were rejected. I narrowed it. Identity can veto any claim the résumé does not prove. Critic holds only embarrassing errors such as the wrong company, placeholders or the wrong language. Recruiter advises and never blocks.",
    "tradeoff": "Some applications will go out that a stricter reviewer would have polished. I accept that over a reviewer nobody can satisfy, and keep the one check that must fail closed: does it claim anything false?"
   }
  ],
  "evaluation": [
   {
    "what": "Ran the truthfulness pipeline with the real model on two cases: a posting far from my résumé and a close match.",
    "result": "Far match: the model tried to open the summary with a title I have never held, it was reverted, and the letter fell back to an honest template. Close match: 13 lines considered, 1 changed, 0 reverted, ATS 39 to 41. The 77 build-time assertions (22 more added in tuning) pass. Recorded verdict: truthful and traceable, but timid.",
    "date": "2026-09-07"
   },
   {
    "what": "Capped the fit score by the share of the posting the résumé proves, then re-measured on the same local test deck.",
    "result": "Roles scoring 80 or more with at most two proven requirements fell from 53 to 1. Side effect: roles clearing Autopilot's proof bar fell from 11 to 2 of 421, because the bar had been set on the inflated scale and had to be re-set.",
    "date": "2026-09-11"
   },
   {
    "what": "Benchmarked the fit score against a public labelled résumé–posting set (1,759 test pairs). The labels are weak, so this shows ordering, not accuracy.",
    "result": "AUC, good fit versus no fit: Conxto's score 0.450 (below chance), keyword coverage 0.444, TF-IDF cosine 0.582, a small embedding model 0.661. The blended score I shipped that day (meaning 60%, requirements 40%) reached 0.644: better than chance, still modest.",
    "date": "2026-09-25"
   },
   {
    "what": "Audit of the job engine's sourcing, liveness and matching, then a speed benchmark of the signed-in app on production (real Chromium, 4× CPU throttle, median of 3).",
    "result": "Collection was fine; selection was the problem. About 324,000 postings under 30 days old, across five sources, had been expired only because no search had re-seen them within a few days, and people were matched against a recency slice instead of a search. After switching to liveness by evidence and per-person full-text search, my search query fell from 9.5 s to 104 ms and the live pool rose from 20,986 to 110,457 by midday (the gain is postings the old rule had expired and the new rule revived). Cold start fell from 10.6 s to 2.7 s; a first visit after the cache expires still took about 10.8 s.",
    "date": "2026-10-15"
   },
   {
    "what": "Real sends to employer application forms, recorded by what could be proven.",
    "result": "2026-10-14: a real send ended unverified because the employer page showed a challenge after the click, so it counts as not sent. 2026-10-17: the first confirmed Autopilot submission, my own application on an applicant-tracking form; the employer page showed its success message. The verifier missed it at first, so I confirmed it from the screenshot and then extended the verifier. Enterprise career portals still hand off to the person.",
    "date": "2026-10-17"
   }
  ],
  "numbers": [
   {
    "value": "5 + 2",
    "label": "specialist agents plus reviewer roles on one shared memory per account",
    "date": "2026-10-14"
   },
   {
    "value": "1,061,623",
    "label": "posting rows collected by the job engine, live and expired",
    "date": "2026-10-15"
   },
   {
    "value": "10.6 s → 2.7 s",
    "label": "cold start of the signed-in app on production after the speed pass (median of 3, 4× CPU throttle)",
    "date": "2026-10-15"
   },
   {
    "value": "0.644",
    "label": "AUC of the shipped fit score on 1,759 labelled résumé–posting test pairs (weak labels: ordering, not accuracy)",
    "date": "2026-09-25"
   }
  ],
  "stack": [
   "TypeScript",
   "Node.js 22",
   "Fastify",
   "PostgreSQL 16 with pgvector",
   "Drizzle ORM",
   "React 18",
   "Vite",
   "Tailwind CSS",
   "TanStack Query",
   "Playwright and headless Chromium (PDFs, form filling)",
   "Stripe",
   "Nodemailer and the Gmail API",
   "Caddy and Cloudflare",
   "systemd workers on a rented EU server",
   "Several model providers behind one router",
   "MNEMA, my own agent-memory service"
  ],
  "links": [
   {
    "label": "Conxto (live)",
    "url": "https://conxto.com/"
   },
   {
    "label": "About Conxto",
    "url": "https://conxto.com/about"
   },
   {
    "label": "Privacy: where your text goes",
    "url": "https://conxto.com/privacy"
   },
   {
    "label": "Job search guides",
    "url": "https://conxto.com/guides"
   },
   {
    "label": "On GitHub",
    "url": "https://github.com/vamsi-venkatesh/conxto"
   }
  ],
  "limits": [
   "Not yet proven with outside users, so I make no claim about user numbers or hiring outcomes. The first employer-confirmed Autopilot submission was my own, on 17 Oct 2026.",
   "Tailoring quality is being re-measured after a fix on 27 Oct 2026. A review crew added on 17 Oct is there to catch invented skills; a labelled fabrication test of it is still to come.",
   "Autopilot's reach is narrow. It fills and submits some application-form types and email applications; enterprise career portals, logins and unanswered questions still hand off to the person. On 2026-10-14, 54% of live postings carried no seniority field, so fit is weakest there."
  ]
 },
 "unboundpdf": {
  "slug": "unboundpdf",
  "name": "UnboundPDF",
  "url": "https://unboundpdf.com/",
  "status": "Live",
  "category": "Browser PDF suite",
  "period": "July 2026 to present",
  "one_line": "Edit, merge, OCR and sign PDFs without uploading them: 54 tools that run in your browser tab.",
  "summary": "UnboundPDF is a free website with 54 PDF and image tools: merge, compress, edit text, OCR, redact, sign, convert and more. Every tool runs inside the visitor's browser tab, so documents are never uploaded and no account is needed. I built it to make a privacy claim checkable instead of trusted: a strict browser security policy, a published test anyone can repeat, and release gates that run before engine and asset changes ship.",
  "role": "I set the product direction and quality bars, direct AI coding agents that write and test the code, use separate agents as independent checkers, review every release on the live site, approve each deploy, and operate the server and CDN setup it runs on.",
  "problem": "Most online PDF tools upload your file to someone else's server before they do anything with it. Contracts, IDs and bank statements are exactly the files people hesitate to send. A tool that never receives the file removes that question, but then editing, OCR and redaction have to work on the visitor's own device, and the privacy claim has to be something a stranger can check.",
  "constraints": [
   "Nothing may leave the device: no upload endpoint, no third-party scripts or hosts, no file contents in logs or analytics.",
   "All work happens in a browser tab on whatever laptop or phone the visitor owns, so memory and speed are not mine to control.",
   "Free to use: no account, no watermark and no usage cap on any tool.",
   "Every public claim must be checkable: counts come from code, and sizes and timings carry their date and browser."
  ],
  "built": [
   {
    "title": "54 tools in the browser tab",
    "body": "Merge, split, compress, convert, redact, sign, OCR, repair and compare, plus image tools and a legal pack. They run on open-source engines (pdf.js, pdf-lib, Tesseract.js, ONNX Runtime) inside the page."
   },
   {
    "title": "An editor that keeps the document's fonts",
    "body": "Click a paragraph and retype it; the text is written back in the font the PDF already carries and the lines below move to make room. Scans become editable after on-device OCR, and the editor says when it had to substitute a font."
   },
   {
    "title": "A Workspace with a Document Passport",
    "body": "Run tools in any order on one file: each run makes a named copy and records its SHA-256, and a verifier recomputes the whole chain. Documents stay in the browser's own storage, encrypted with AES-GCM, and can be deleted at any time."
   },
   {
    "title": "A German version",
    "body": "14 German pages and German tool screens, a Portal Ready workflow that fits photos, HEIC files and PDFs under an upload portal's size limit, and German ID patterns with check-digit validation in Redact PDF. Redact PDF also has a bank-statement mode for the Jobcenter, and PDF Form Doctor explains why a form only opens in Adobe Reader."
   },
   {
    "title": "A release gate and a checked deploy",
    "body": "Any change to engine or asset code must pass one command first: every tool audited in three desktop and two phone browser engines, full-site page sweeps, offline, registry and claims checks. Each deploy is a backup, a copy from a clean worktree, a checksum sweep and a walk of the live site."
   }
  ],
  "how_it_works": [
   {
    "step": "Drop the file",
    "body": "The browser reads the file into the tab. There is no upload endpoint, and the page's security policy only lets it connect to its own address."
   },
   {
    "step": "Check the device",
    "body": "Before a long job, a shared runtime compares the document with the device and shows what it found. Progress is a phase and a counter, never an invented percentage."
   },
   {
    "step": "Work in the tab",
    "body": "pdf.js reads and renders, pdf-lib writes, and Tesseract and ONNX Runtime run as WebAssembly where a tool needs them. A Stop button ends the run and leaves the original file untouched."
   },
   {
    "step": "Verify the output",
    "body": "Redact PDF re-reads the finished file to confirm the text is gone. Guided workflows check the produced bytes before showing a receipt, and the Workspace records size, page count and SHA-256 for every step."
   },
   {
    "step": "Download or keep",
    "body": "The result downloads from the same tab. In the Workspace, documents stay in the browser's own storage, encrypted, and can be deleted at any time."
   },
   {
    "step": "Check the claim yourself",
    "body": "The Privacy Lab walks anyone through the Network panel check and publishes dated results. The Document Passport is self-issued, so it proves the steps are intact and in order, not who ran them."
   }
  ],
  "decisions": [
   {
    "decision": "No upload path at all, and a security policy that enforces it.",
    "why": "A privacy page is a promise; a browser policy is a mechanism. The site has no document-upload endpoint, its Content-Security-Policy only lets the page connect back to its own address, and no form posts anywhere. It is also the one thing upload-based tools cannot easily copy.",
    "tradeoff": "Speed and memory depend on the visitor's device and browser. The same 119 MB scan compressed to 34% of its size in Chromium, 39% in Firefox and 57% in WebKit, and OCR of a 100-page scan took 94 seconds in Chromium but 19.7 minutes in Firefox. So the site publishes no single 'compress by X%' figure."
   },
   {
    "decision": "Serve OCR and the cutout model from the site itself, with no analytics.",
    "why": "The only network traffic should be the site's own program code. That keeps the Network-panel check simple and lets the security policy block every other host. The Tesseract engine and the portrait-cutout model are vendored, fonts are self-hosted, and the privacy page states there are no analytics, tracking pixels or advertising cookies.",
    "tradeoff": "The first OCR run downloads about 14 MB (English) and the first background removal about 38 MB, once, from the site. With no analytics I cannot see what people do inside a tool; the host keeps only standard access logs, never file contents."
   },
   {
    "decision": "Never degrade a document silently: flattening and keeping the original are explicit choices.",
    "why": "An audit of the live editor on 2026-08-24 rated it 6/10. By default it embedded the unedited original inside the output while the result said the original text was removed, and some saves could turn a page into a lower-quality image without asking. Now the editor shows whether a page is native text or OCR, reports font reuse or substitution, keeps scan image bytes sharp by default, asks before any destructive rebuild, and makes the recoverable original opt-in.",
    "tradeoff": "More choices and disclosure for the user, and old pixels in a scan are only permanently removed if the user picks the explicit 144 DPI rebuild."
   },
   {
    "decision": "Publish only what was measured, and derive every count from one registry.",
    "why": "Hand-kept numbers rotted: the hub once said Convert 6 while the registry said 7, and an early memory estimator (55x the input size) came from one measurement and failed on a ten-fold range of inputs. So counts are computed from the tool registry, the public capability file refuses to build if it contradicts the shipping code, and sizes are written as observed completions, never as limits.",
    "tradeoff": "The homepage says '50+ tools' (rounded down by code) instead of 54, a first-party worker that failed its own benchmark ships switched off instead of being advertised, and there is no 'handles any size' claim."
   }
  ],
  "evaluation": [
   {
    "what": "Three checks that a file never leaves the tab: a Network-panel run on a PDF with an embedded image, an offline test in the release gate (server switched off, browser offline, two real PDFs merged), and a scan of every cache entry for a 48-byte sample of each input.",
    "result": "0 requests of any kind while Extract Images processed the PDF (2026-07-23, Chromium). The offline merge completes and its output reopens; that test is part of every full gate run. No input bytes were found in any cache entry. Only Merge PDF is probed offline; the other 53 tools are recorded as cached but not verified offline.",
    "date": "2026-08-21"
   },
   {
    "what": "A pass/fail benchmark against fourteen written requirements: a 12-document corpus (300- and 1,000-page documents, scans, encrypted and damaged files) driven through the real interface in Chromium, Firefox and WebKit, with every output re-opened in poppler, an independent PDF reader.",
    "result": "124 runs: each completed or was refused cleanly with a named reason, none modified its input, and 79 of 79 output files re-opened in poppler. Nine of the fourteen requirements passed. The five that did not are published on the same page: first-party workers (fail), pre-crash detection (unproven), the benefit of low-memory mode (unmeasurable), page responsiveness (partial, desktop only) and output checking by every tool (partial).",
    "date": "2026-08-15"
   },
   {
    "what": "The ship gate: a tool audit for every registered tool in Chromium, Firefox, WebKit and two phone engines, full-site page sweeps at desktop and phone width, plus offline, round-trip, registry-drift and claims checks. It runs in full for engine and asset changes; copy-only changes go through faster sweeps.",
    "result": "Latest release (v211, 2026-10-06): the full gate finished green (212 sections in its log). The tool audit passes 52 of 54 on each engine run; the other two need a fixture file missing from the build machine, which the record names as a documented allowance, not a pass. Earlier gates caught real defects before deploy: four stacked mode cards pushing the page below the fold on a 390 px phone (v210) and an input silently dropped when handed to a tool during engine load (2026-08-28).",
    "date": "2026-10-06"
   },
   {
    "what": "Deploy proof for each release: backup, copy from a clean worktree without deleting anything, checksum sweep of the served files against the build, key URLs re-fetched through the CDN, and a live browser walk with the network log open.",
    "result": "v206, the German release: the checksum sweep found 0 differences across 607 files, 16 key URLs returned 200 on the new version only, and the served bytes of the key pages and scripts matched the build. A live walk in Chromium (desktop) and WebKit (phone) recorded 0 page or console errors and no off-origin or non-GET requests.",
    "date": "2026-10-05"
   },
   {
    "what": "A regression test that must fail on the old code. Remove Background froze the browser tab because the model ran on the page's main thread; the cause was measured first, not assumed.",
    "result": "Longest freeze before the fix: 19,794 ms in Firefox and 1,109 ms in Chromium. The model run now stays off the main thread. The new test (maximum stall 1,000 ms) fails on the old engine at 19,265 ms and passes on the fix. On the live site the longest freeze is now 211 ms in Firefox, 57 ms in Chromium and 53 ms in WebKit. The model run itself is not faster, about 19 to 20 seconds in Firefox.",
    "date": "2026-10-06"
   },
   {
    "what": "Testing PDF Form Doctor against four real public German forms after the synthetic fixtures had passed.",
    "result": "Two of the four forms crashed the tool because they use AES-128 encryption, which the AES-256 synthetic fixtures did not cover. Fixed; the new fixtures fail on the old engine, the suite passes 208 of 208, and on the live site the child-benefit form is now diagnosed with 0 errors. None of the four was a pure dynamic-XFA form, so that filler stays off.",
    "date": "2026-10-06"
   }
  ],
  "numbers": [
   {
    "value": "54",
    "label": "PDF and image tools in the live registry; the tools index, press kit and capability file are generated from it",
    "date": "2026-10-29"
   },
   {
    "value": "0",
    "label": "requests of any kind recorded while Extract Images processed a PDF, in the Network-panel check anyone can repeat",
    "date": "2026-07-23"
   },
   {
    "value": "124",
    "label": "benchmark runs across Chromium, Firefox and WebKit; none crashed or hung, and 79 of 79 output files re-opened in an independent PDF reader",
    "date": "2026-08-15"
   },
   {
    "value": "511",
    "label": "checks in the Workspace test suite, none failing (471 at the 2026-08-27 release)",
    "date": "2026-10-05"
   }
  ],
  "stack": [
   "Vanilla JavaScript (no front-end framework), static pages generated by Node.js scripts",
   "pdf.js 3.11.174 and @cantoo/pdf-lib 2.5.3",
   "Tesseract.js 5.1.1 (WebAssembly OCR, vendored)",
   "ONNX Runtime Web 1.27.0 (WebAssembly) with the MODNet portrait-matting model",
   "libheif (WebAssembly) for HEIC",
   "Paged.js, docx-preview, mammoth.js, marked, JSZip (conversion and preview)",
   "Vendor Web Workers (pdf.js, Tesseract.js, ONNX Runtime Web)",
   "Service worker for the app shell and engines",
   "Web Crypto (AES-GCM) and IndexedDB for Workspace storage",
   "Content-Security-Policy, Cross-Origin-Opener-Policy and Cross-Origin-Resource-Policy headers",
   "Playwright (Chromium, Firefox, WebKit) and poppler for the release gate",
   "Caddy on a Linux server behind Cloudflare"
  ],
  "links": [
   {
    "label": "UnboundPDF",
    "url": "https://unboundpdf.com/"
   },
   {
    "label": "Privacy Lab: check the no-upload claim yourself",
    "url": "https://unboundpdf.com/guides/pdf-privacy-lab/"
   },
   {
    "label": "How large PDFs run in the browser, with the benchmark tables",
    "url": "https://unboundpdf.com/guides/how-unboundpdf-handles-large-pdfs/"
   },
   {
    "label": "Capability record (machine-readable)",
    "url": "https://unboundpdf.com/capabilities.json"
   },
   {
    "label": "Changelog with dated measurements",
    "url": "https://unboundpdf.com/changelog/"
   },
   {
    "label": "Trust and verification",
    "url": "https://unboundpdf.com/trust/"
   },
   {
    "label": "German version",
    "url": "https://unboundpdf.com/de/"
   },
   {
    "label": "Selected public source on GitHub (three tools, limited Workspace demo)",
    "url": "https://github.com/vamsi-venkatesh/unboundpdf"
   }
  ],
  "limits": [
   "Performance is measured on desktop engines on one machine (Apple M4, 16 GB). Phones were checked by hand on older builds, and nothing is measured on mid-range laptops, Windows or Linux. Published sizes are things I watched finish, not limits.",
   "Output fidelity has edges. The editor reuses the document's embedded fonts when it can and says so when it must substitute one, OCR edits are approximate, and signing places drawn or typed signature images, not certificate signatures.",
   "The German version is new: 14 pages and tool screens, reviewed by an AI model but not yet by a native speaker. The Jobcenter bank-statement mode has only been tested on synthetic statements."
  ]
 },
 "vvdex-engine": {
  "slug": "vvdex-engine",
  "name": "VVDex Engine",
  "url": "https://lab.vvdexops.com/",
  "status": "Live",
  "category": "AI service engine",
  "period": "From September 2026",
  "one_line": "Turn one paragraph of business work into an AI service that runs by your rules and leaves proof of every run.",
  "summary": "VVDex Engine turns a plain-language description of a business task, such as handling supplier invoices, into a working service. For every action it decides, in code and from the business owner's own words, whether the action runs by itself, waits for a named person or never happens. A crew of AI agents does the steps, a reviewer from a different model family checks each result, and every run is sealed under one SHA-256 digest that a public checker recomputes from the receipts alone.",
  "role": "I design, build, deploy and operate the Engine on a server I administer, using AI coding agents for much of the implementation and reviewing and signing off every release myself.",
  "problem": "Businesses want to hand routine work to AI, but most automation tools make them design the workflow themselves, and few can show afterwards what ran and why. Trust is the harder problem: a system that reads incoming email can be given orders by that email, and a model that decides can be talked into the wrong decision. The Engine starts from the other end: the owner describes the outcome, and the limits are fixed in code before anything runs.",
  "constraints": [
   "Hostile input. Incoming emails, forms and web pages can contain instructions aimed at the model, so they are treated as data and never as commands.",
   "No consequential action on a model's word. The owner's rules, run by code, decide whether something runs by itself, waits for a named person or never happens, and a fact the service cannot establish lets nothing through.",
   "Checkable afterwards. Someone who was not there has to be able to see what ran, what was decided and why.",
   "Early access, one person, one server. Demos reach no outside system, model use is capped per event (12 agent runs, 12 reviews, 240 seconds), and a business's own systems are connected by hand with the owner."
  ],
  "built": [
   {
    "title": "The compiler",
    "body": "A model reads the paragraph into typed facts, rules and actions, and every rule must quote the owner's words. Code checks each rule against those sentences, asks when the words are silent, and compiles the result into a contract and an authority graph."
   },
   {
    "title": "Authority and release",
    "body": "Each action runs by itself, waits for a named person, or never happens, and a 'never' rule is checked on the action's real arguments. Approving issues a signed single-use grant for exactly the approved writes; each native write runs once and its outcome is checked with the vendor."
   },
   {
    "title": "A crew with an independent reviewer",
    "body": "Code routes each step to a specialist agent role, and a reviewer from a different model family checks every result, with one revision allowed. Before a write that moves money, grants access, operates equipment or deletes data, three reviewers vote and two must pass."
   },
   {
    "title": "Sealed evidence",
    "body": "Each fact, decision, review and approval is a receipt, and all receipts are sealed under one SHA-256 digest. The public proof page shows a real sealed run, re-checks its seal and lets you change one receipt to watch the check fail."
   },
   {
    "title": "Catalogue and console",
    "body": "50 service examples, compiled from briefs derived from the earlier Agent Service Lab, come with their rules, scenario tests and demo runs you can try without an account. The console adds triggers (email, signed webhook, schedule, public form), approvals, roles, a hash-chained audit log and an MCP server with no approve tool."
   }
  ],
  "how_it_works": [
   {
    "step": "Describe",
    "body": "The owner writes the work in plain words: what arrives, what should happen and what needs a person's approval."
   },
   {
    "step": "Compile",
    "body": "A model reads the paragraph into a typed process, code checks every rule against the owner's own sentences and asks where they are silent, and generated test cases run on the compiled result (20 to 60 seconds)."
   },
   {
    "step": "Set the limits",
    "body": "Each action gets one of three answers (runs by itself, waits for a named person, or never happens), and the service runs in shadow on real events, deciding and recording but releasing nothing, before it can go live."
   },
   {
    "step": "Run",
    "body": "Secrets are stripped from what arrives, facts are read with quotes, records are looked up, numbers are computed by code and the rules decide, while specialist agents do the steps and an independent reviewer checks every result."
   },
   {
    "step": "Approve and release",
    "body": "What the rules leave to a person waits for the named approver, who sees each output with its sources and can edit or drop a write, and approval issues a signed single-use grant so each native write runs once and its outcome is checked with the vendor."
   },
   {
    "step": "Seal",
    "body": "Every fact, decision, review and approval is sealed under one SHA-256 digest, so changing one receipt breaks the seal."
   }
  ],
  "decisions": [
   {
    "decision": "Code decides what is released. Models read, draft and check.",
    "why": "A model that reads email can be steered by it. So the owner's rules are compiled into conditions that code evaluates: a stricter rule wins, an unknown fact never releases anything, and a 'never' rule on an action's real arguments cannot be overridden by an approval. Models read text, draft, and must quote what they rely on.",
    "tradeoff": "More things stop for a person. A fact only a model can judge may stay undecided, and the compiler asks or refuses instead of guessing, so 42 of the 50 examples still list open decisions."
   },
   {
    "decision": "Compile the contract and test it, instead of trusting one reading.",
    "why": "The first compiler used keyword rules and no model. On one real access-control prompt it took 6 ms and understood none of the requirements (0 of 7). The current one has a model read the whole description, code validate it against the owner's sentences, and generated test cases run on the compiled result. An incomplete service cannot go live, and there is no silent fallback.",
    "tradeoff": "Compiling costs model calls and time: 6 calls and 22 seconds on that prompt, 20 to 60 seconds in general. With no model, the compile returns an error rather than a degraded guess."
   },
   {
    "decision": "A different model family checks the work, and an independent meaning check checks the compiler itself.",
    "why": "A refund check written by one model counted 25 days instead of 20; review inside the same model family had not caught it, and a second family did. Later, a brief I wrote to test the compiler showed '16 of 16 requirements mapped' and passing tests while the scoring numbers were missing from the contract, because every check took its expectation from the reading it was checking. I ordered an audit of the whole engine and added a meaning review that counts a loss only when it quotes the owner's lost words.",
    "tradeoff": "Every result costs a second model call and some time. The new check made the catalogue look worse first: services marked complete fell from 38 to 5. Reviewers can also be wrong: one rejected a correct research result because it saw only part of the sources. That was fixed the same day."
   },
   {
    "decision": "A write happens once, or it stops.",
    "why": "Retries are how automations pay twice or send twice. Each approved write carries a signed single-use grant bound to the exact payload, native writes are checked with the vendor before any retry, and an unclear outcome stops for a person to reconcile.",
    "tradeoff": "Some failures wait for a person instead of fixing themselves. Writes through the connector bridge cannot be read back the same way, so they are at-most-once: only failures that provably never sent are retried, and a request that was already sent cannot be recalled."
   }
  ],
  "evaluation": [
   {
    "what": "Compile reliability on 76 recorded plain-language briefs, each read by the live model and kept as a recording.",
    "result": "All 76 produced a valid reading: 64 on the first attempt, 7 on the second, 3 on the third, 1 on the fifth and 1 on the sixth. Retries are recorded, not hidden. A valid reading is not a complete service: the catalogue figures show how many still have open decisions.",
    "date": "2026-09-25"
   },
   {
    "what": "Audit of the compiler after a brief of mine showed '16 of 16 requirements mapped' and passing tests, yet the lead-scoring numbers were missing from the contract.",
    "result": "Cause: every check took its expectation from the reading it was checking. The fix was an independent meaning review by a model from another family. When it went live, services marked complete fell from 38 to 5, because most had been losing meaning.",
    "date": "2026-09-25"
   },
   {
    "what": "Real-model runs of the reviewers on agent work.",
    "result": "A reviewer caught an invented price and start date in a draft, and the revision removed them. A reviewer from the second model family flagged a day count of 25 instead of 20 in a refund check written by the first family's model, which review inside the first family had missed; the revision fixed it and all three reviewers then passed it.",
    "date": "2026-09-25"
   },
   {
    "what": "Prompt injection: a real model given instructions hidden in the incoming text.",
    "result": "The model refused them, and the deterministic checks named the field that carried them. The same kind of check runs before every decision; the public sample run records 'no injection signals'.",
    "date": "2026-09-22"
   },
   {
    "what": "A ticket-triage step measured on 68 public insurance-support tickets, with examples taken only from the training split.",
    "result": "Category names alone: 70.6% right (48 of 68). With the owner's one-line definitions: 77.9%. With definitions and 20 labelled past tickets: 80.9% (55 of 68). A generic ticket-triage playbook lowered accuracy by 3 to 4 points, so the Engine makes no claim that it helps. 3 of the remaining errors contradict the dataset's own definitions. 68 tickets is a small sample.",
    "date": "2026-09-27"
   },
   {
    "what": "The public sealed run, re-checked today with the public checker.",
    "result": "The run's 15 receipts recompute to the stated SHA-256 digest. A copy with one word changed in one receipt fails the check.",
    "date": "2026-10-29"
   }
  ],
  "numbers": [
   {
    "value": "50",
    "label": "compiled service examples, in 11 categories of business work",
    "date": "2026-10-29"
   },
   {
    "value": "1,429",
    "label": "automated tests passing in the last deployed release (4 skipped)",
    "date": "2026-10-05"
   },
   {
    "value": "76 / 76",
    "label": "recorded briefs read into a valid process, 64 on the first attempt",
    "date": "2026-09-25"
   },
   {
    "value": "255 / 309",
    "label": "catalogue scenario tests passing; none confirmed failing, 54 disputed or incomplete",
    "date": "2026-10-29"
   }
  ],
  "stack": [
   "Python, FastAPI, uvicorn",
   "PostgreSQL",
   "Node.js (separate connector-bridge process)",
   "Plain JavaScript front end, no framework",
   "Native connectors: Gmail, Zendesk, signed webhooks, HubSpot",
   "Two model families: one reads, drafts and judges; a different one reviews",
   "AES-256-GCM for stored connection secrets, SHA-256 for seals and API-key hashes, HMAC for signed webhooks and grants",
   "MCP server (JSON-RPC over HTTP)",
   "Approval channels: Telegram, email, webhook",
   "Linux, systemd, Caddy, Cloudflare",
   "pytest and Node tests"
  ],
  "links": [
   {
    "label": "VVDex Engine (live, early access)",
    "url": "https://lab.vvdexops.com/"
   },
   {
    "label": "Proof: re-check a sealed run",
    "url": "https://lab.vvdexops.com/proof"
   },
   {
    "label": "How the agents work",
    "url": "https://lab.vvdexops.com/agents"
   },
   {
    "label": "The 50 compiled examples and their tests",
    "url": "https://lab.vvdexops.com/services"
   }
  ],
  "limits": [
   "Early access. Demos reach no outside system: each write runs once in a sandbox back office. Running a service on a business's own accounts is set up by hand with the owner, not self-serve, and the Engine's code is private.",
   "The 50 examples are compiled, not 50 connected automations. Eight are complete; 42 still list decisions their owner would have to answer before they could go live.",
   "Scenario tests are written from each brief, so they cannot catch a requirement the compile missed, and the measured samples are small. A fact a model has to judge can stay undecided, and then the action waits for a person."
  ]
 },
 "vvdex-platform": {
  "slug": "vvdex-platform",
  "name": "VVDex Platform",
  "url": "https://vvdexops.com/",
  "status": "Live",
  "category": "AI evaluation platform",
  "period": "Aug 2026–present",
  "one_line": "Test AI models and agents on real work. Hidden tests decide, and every run gets a receipt anyone can check.",
  "summary": "VVDex Platform is a public website that tests AI models and agents on real work: fixing a bug in an open-source library, triaging an incident from server logs, correcting an order in a web app. The model works in a sealed sandbox, hidden tests it never sees decide the result, and every run returns a signed receipt anyone can check. It has been live since 24 September 2026 with 17 certified exams; five are free, with no sign-in.",
  "role": "I decide what gets built and what counts as proof, direct AI coding agents that write the code, review their work and sign off every release, and I deploy and run it myself on a server I administer.",
  "problem": "Public benchmarks are published, so models can learn them, and a score rarely comes with the evidence behind it. Choosing a model or an agent for real work needs tasks that look like the job, grading it cannot game, and numbers that come with proof. An agent that can reach its own answer key proves nothing, so the grading has to sit where the agent cannot look.",
  "constraints": [
   "One person and one server. The web app, queue, runner and sandboxes run on a single six-core machine that also hosts my other sites. In a load test, throughput stopped rising at about 12 test suites a minute, so CPU was the ceiling.",
   "Exams can be spent. An exam is only worth something while its hidden tests and reference fix stay unseen. A visitor's own endpoint receives the full task, and exams rebuilt from public bug fixes may already be in a model's training data.",
   "Other people's keys and my money. Visitors bring their own API keys, so I store them encrypted and never log them. The one free model is paid for by me, so it covers one exam, two attempts a run, and stops when the day's capacity is used.",
   "Some coding agents run on the host, not in a container. I can audit their containment after each run, but I cannot enforce it."
  ],
  "built": [
   {
    "title": "A sealed sandbox and a separate grading box",
    "body": "Every command an agent runs starts a fresh container with no network, one CPU and 512 MB of memory. The hidden tests and the reference fix sit in a separate grading box the agent can never reach, and code, not an AI judge, decides the grade."
   },
   {
    "title": "An exam factory that attacks its own exams",
    "body": "Forge, the exam engine behind the platform, lets an exam into use only after six checks, including a reference fix that passes, an untouched task that fails and nine or ten cheating probes that must all fail. 17 exams in 8 families are offered, from open-source bug fixes to incident triage, SQL and a browser task."
   },
   {
    "title": "Connect any model or agent",
    "body": "A model can come from a provider's API with the visitor's own key, any compatible inference server, a laptop through a small connector, or an agent over HTTP, and keys are encrypted with AES-256-GCM on arrival. A check before each exam separates a broken connection from a failed model."
   },
   {
    "title": "Signed receipts and statistics with ranges",
    "body": "Each result is hashed with SHA-256 and the run is signed with Ed25519 over canonical JSON (RFC 8785), so a public page can check any receipt and one changed grade fails the check. Every pass rate shows its 95% Wilson range, and a provider outage is an endpoint error, never a wrong answer."
   },
   {
    "title": "Queue, replays, reports and developer tools",
    "body": "A Postgres job queue with a fair share per workspace runs many attempts at once behind a small sandbox gate, and every attempt keeps its full conversation for replay and for a printable report. There is a REST API, a Python SDK and CLI, a GitHub Action and an MCP server."
   }
  ],
  "how_it_works": [
   {
    "step": "Connect",
    "body": "You connect a model or agent through a provider API key, your own server, a connector on your machine or an agent over HTTP, and the key is encrypted the moment it arrives."
   },
   {
    "step": "Check",
    "body": "Before an exam, the platform checks that the model answers, can use the exam's tools and passes a dry run, so a broken endpoint is not mistaken for a weak model."
   },
   {
    "step": "Work",
    "body": "Up to 10 attempts per model run in sealed sandboxes with no network, one CPU and a step budget, and the model can use only the exam's tools."
   },
   {
    "step": "Grade",
    "body": "Each submission goes to a separate grading box where hidden tests run, and the outcome is a certified pass, a failure, an attempt to reach what it may not see, an endpoint error, or withheld."
   },
   {
    "step": "Seal",
    "body": "Every result is hashed with SHA-256, the run is signed with Ed25519, and the full evidence of each attempt is kept with its digest."
   },
   {
    "step": "Read and verify",
    "body": "You get a pass rate with its 95% range, a replay of each attempt and a report, and anyone can paste the receipt into the public checker, where one changed grade makes it fail."
   }
  ],
  "decisions": [
   {
    "decision": "A pass counts only when containment is verified.",
    "why": "I ordered an audit when one agent lane kept passing while the others failed. It showed that all 6 successes in 232 recorded attempts came from that lane. The lane kept its full toolset on the host, and on one exam it read the hidden tests and the reference solution. Every guard I had sat inside the channel my harness controls, so an agent acting outside it was invisible. Now each lane is classified from the command actually launched, and the agent's own session logs are audited after every run. A breached pass is withdrawn. An unproven one is withheld, and never turned into a model failure.",
    "tradeoff": "It cost me the six passes. It left 128 of the 232 earlier attempts unusable as evidence (13 invalid, 115 unverified), and that lane stays uncertifiable on my setup. Every new agent lane now starts as uncontained until it proves otherwise."
   },
   {
    "decision": "Keep most exams private: five are self-serve, twelve run on request.",
    "why": "A self-serve run sends the full task and every tool result to whatever endpoint the visitor connects. Letting strangers run a private exam would give it away, and a published test is a test models can memorise. So the hidden tests, graders and reference answers are never published. Public proof is limited to receipts, digests and reports.",
    "tradeoff": "Self-serve stays small: five exams and three runs a day. Anyone who wants the private exams has to ask, and I run those evaluations and send a reviewed report myself."
   },
   {
    "decision": "Drop generated \"Fresh Exams\" and serve the certified Forge exams instead.",
    "why": "I first planned exams that generate new questions from a seed on every run, so a stranger's endpoint could never memorise them. On 24 September I had nine such suites run on a real model for $0.05 in total. Seven scored 30 out of 30, so they could not separate strong models. I had them removed from the API, app, site, SDK, MCP server and GitHub Action that day, and had the certified Forge exam engine brought in as it was.",
    "tradeoff": "A feature that had just been built was thrown away; its code stays behind an off switch. Forge exams are heavier because a sandbox starts for each command, so CPU became the limit and the platform needed a sandbox gate and a fair queue."
   },
   {
    "decision": "Fix the receipt format at the root instead of patching the checker.",
    "why": "On launch day a genuine receipt from my own run failed the platform's own checker. I ordered a byte-for-byte trace instead of a quick patch. Version 1 hashed Python's JSON text, and the browser rewrote the file, turning 1.0 into 1. No value had changed. Version 2 uses RFC 8785 canonical JSON, with one implementation shared by the sealer, the server's checker and the SDK. The browser now saves and sends the exact bytes.",
    "tradeoff": "The format changed hours after launch. Old version 1 receipts need a restoration step to keep verifying against the signed digest, and the new format came with a tamper test suite I now have to maintain."
   }
  ],
  "evaluation": [
   {
    "what": "The flagship published campaign",
    "result": "5 exams, 3 agents and models, 10 attempts each: 150 attempts, 148 graded, 93 certified passes, 55 failures, and 2 lane errors kept out of every denominator. Each rate is published with its 95% range. Two of the five exams have since been retired from future use; their sealed results stay as history.",
    "date": "2026-09-02"
   },
   {
    "what": "Re-examining every earlier result after the containment audit",
    "result": "All 232 earlier attempts were re-classified from stored evidence: 104 verified, 13 invalid, 115 unverified. All 6 passes were withdrawn. Before the fixes, the other lanes had passed 0 of 175 attempts while the breaching lane passed 6 of 6. After them, a clean 20-attempt campaign had every attempt verified as contained, and the honest lanes passed 6 of 16 countable attempts (4 were lost to provider limits). The breaching lane was run again under the fixed harness, breached again, and was withdrawn again. The jump came from two fixes: containment checks, and a bug that resent only the last exchange to the model.",
    "date": "2026-09-01"
   },
   {
    "what": "Re-proving every exam on the production server's own sandbox images",
    "result": "The grader-controls stage and the attack suite were re-run for all 18 exams then on the server: 36 of 36 passed. Every control landed on its known verdict, every cheating probe was blocked, and the reference fix still passed afterwards. After the sandboxes were hardened (non-root, all Linux capabilities dropped), 17 of 17 offered exams were re-proven identical to their certification.",
    "date": "2026-09-24"
   },
   {
    "what": "Tamper tests on the signed receipt, after a genuine receipt failed its own checker",
    "result": "Before: the failure above, on launch day. After the version 2 fix, a real run's receipt verified as authentic on the public check page, through the API and with an offline command-line checker. Changing the score, passed count, model, cost, tokens, timestamp or the result itself made it fail. Re-formatting the JSON (pretty, compact, reordered keys) did not. The suite had 478 passing tests that day.",
    "date": "2026-09-24"
   },
   {
    "what": "Load test on the production server, with the real sandboxes and graders and a stand-in model that answered after 20 seconds",
    "result": "Before: the old setting would have needed about 9 minutes for 24 attempts. After adding a sandbox gate (4 slots) and a fair queue, 24 attempts at once finished in 71 seconds and 48 in 102 seconds, never with more than four sandboxes running. Another site on the same server kept answering: its slowest request took 0.28 seconds at 24 attempts and 0.58 at 48.",
    "date": "2026-09-24"
   }
  ],
  "numbers": [
   {
    "value": "17",
    "label": "certified exams offered in the app, in 8 families (5 free with no sign-in, 12 on request)",
    "date": "2026-10-29"
   },
   {
    "value": "417",
    "label": "graded attempts in the 10 primary campaigns (15 are published), covering 21 models and agents",
    "date": "2026-10-29"
   },
   {
    "value": "550",
    "label": "automated tests passing at the last recorded release",
    "date": "2026-09-25"
   },
   {
    "value": "6 of 232",
    "label": "earlier attempts were passes, and all 6 were withdrawn after an audit found one agent lane could read the answer key",
    "date": "2026-09-01"
   }
  ],
  "stack": [
   "Python",
   "FastAPI",
   "PostgreSQL (job queue on row locks)",
   "Preact (no build step)",
   "Docker (sealed sandboxes)",
   "Caddy and Cloudflare (origin accepts only Cloudflare; Turnstile on free runs)",
   "systemd services on a Linux server",
   "Ed25519, SHA-256, RFC 8785 canonical JSON, AES-256-GCM",
   "Playwright (browser checks)",
   "Electron and TypeScript desktop Studio, where exams are built and certified"
  ],
  "links": [
   {
    "label": "Live site",
    "url": "https://vvdexops.com/"
   },
   {
    "label": "How grading works",
    "url": "https://vvdexops.com/how"
   },
   {
    "label": "How it's built",
    "url": "https://vvdexops.com/built"
   },
   {
    "label": "What we tested",
    "url": "https://vvdexops.com/results"
   },
   {
    "label": "What was withdrawn, and why",
    "url": "https://vvdexops.com/integrity/"
   },
   {
    "label": "Watch a recorded run",
    "url": "https://vvdexops.com/replay"
   },
   {
    "label": "Check a receipt",
    "url": "https://vvdexops.com/check-receipt"
   },
   {
    "label": "Public proof repository (receipts and reports, not the exams)",
    "url": "https://github.com/vamsi-venkatesh/vvdex-forge-proof"
   }
  ],
  "limits": [
   "Seventeen exams are not enough to rank models in general. Published tables are per campaign, at 10 attempts per model per exam, each rate with its 95% range, and campaigns are never averaged together. Eight of the 17 exams are rebuilt from public bug fixes, so a model may have seen the upstream fix in training; the site says so.",
   "It is early: there is no pricing or billing yet, and outside use has only just begun. Live end-to-end runs so far have covered three model providers; the other connection types were tested against stand-ins that follow each provider's documented rules.",
   "The sandboxes run on the same single server as my other products. They are locked down (no network, non-root, all Linux capabilities dropped), but a separate runner machine for strangers' agents is planned and not built. Coding agents that run on the host are audited after each run rather than boxed in."
  ]
 }
};
export const principles = [
 {
  "k": "I own the whole stack.",
  "v": "Built, deployed and debugged in production. The live products run on servers I administer, behind deploy gates I wrote: full test suites, checksum sweeps, rendered-frame checks, rollback roots."
 },
 {
  "k": "I hold the standard.",
  "v": "I built the evaluation instrument my agents are measured with, and every claim on my sites is gated on a threshold declared in advance and checked on the served artefact, never on the source file."
 },
 {
  "k": "I ship with a team of agents, and I sign every release.",
  "v": "Multi-agent pipelines are how I ship faster than one pair of hands. I plan the work, review every output, and sign off before anything reaches a user. The send stays human."
 }
];
export const withdrawn = [
 {
  "title": "The 70% claim",
  "what": "A directional-accuracy claim was only allowed to stand if it cleared a threshold written down before the measurement. It measured 0.683 against a declared gate of 0.7178, so I withdrew it. The dated record that measured it stays public.",
  "numbers": [
   [
    "0.683",
    "measured"
   ],
   [
    "0.7178",
    "gate set in advance"
   ]
  ],
  "link": [
   "The record",
   "https://trading.vvdexops.com/"
  ]
 },
 {
  "title": "An exam lane I could not certify",
  "what": "A pass on the platform survives only on verified containment. I found that one lane's agent could read the gold answers, the hidden tests and its own transcripts, so I withdrew all six of its historical passes and marked the lane not certifiable.",
  "numbers": [
   [
    "6",
    "passes withdrawn"
   ],
   [
    "0",
    "kept"
   ]
  ],
  "link": [
   "How grading works",
   "https://vvdexops.com/evals"
  ]
 }
];
export const capabilities = [
 [
  "AI & agents",
  [
   [
    "LLM features across several model providers",
    [
     "Conxto",
     "VVDex Engine",
     "FarmQuick",
     "PitchRadar"
    ]
   ],
   [
    "Multi-agent workflows and tool use",
    [
     "Conxto",
     "VVDex Engine",
     "PitchRadar",
     "FarmQuick"
    ]
   ],
   [
    "Rules first: a model only where rules can't answer",
    [
     "PitchRadar",
     "FarmQuick",
     "Conxfolio"
    ]
   ],
   [
    "Long-term memory per user",
    [
     "Conxto"
    ]
   ],
   [
    "Evaluating AI systems",
    [
     "VVDex Platform",
     "VVDex Engine",
     "PitchRadar"
    ]
   ],
   [
    "Reading documents: résumé parsing and OCR",
    [
     "Conxfolio",
     "UnboundPDF",
     "Conxto"
    ]
   ]
  ]
 ],
 [
  "Product engineering",
  [
   [
    "TypeScript and Node.js",
    [
     "Conxto",
     "Conxfolio",
     "PitchRadar"
    ]
   ],
   [
    "React, Astro and Vite front ends",
    [
     "Conxto",
     "FarmQuick",
     "PitchRadar"
    ]
   ],
   [
    "Python services",
    [
     "VVDex Engine",
     "VVDex Platform"
    ]
   ],
   [
    "Apps that run entirely in the browser: WebAssembly and workers",
    [
     "UnboundPDF"
    ]
   ],
   [
    "Live market data over WebSockets",
    [
     "VVDex Trading"
    ]
   ],
   [
    "Integrations: Gmail, WhatsApp, Telegram, email",
    [
     "Conxto",
     "FarmQuick"
    ]
   ]
  ]
 ],
 [
  "Data & infrastructure",
  [
   [
    "PostgreSQL and Cloudflare D1",
    [
     "Conxto",
     "Conxfolio",
     "VVDex Engine",
     "PitchRadar",
     "FarmQuick"
    ]
   ],
   [
    "Linux servers, Docker, Caddy",
    [
     "Conxto",
     "UnboundPDF",
     "VVDex Engine",
     "VVDex Platform",
     "Conxfolio",
     "VVDex Trading",
     "PitchRadar"
    ]
   ],
   [
    "Cloudflare Workers and Pages",
    [
     "FarmQuick"
    ]
   ],
   [
    "Sandboxed runs in locked-down containers",
    [
     "VVDex Platform"
    ]
   ],
   [
    "Tamper-evident records: hashes and sealed receipts",
    [
     "VVDex Trading",
     "VVDex Platform",
     "VVDex Engine",
     "UnboundPDF",
     "PitchRadar"
    ]
   ],
   [
    "Privacy and security: encryption in the browser, SSRF guards",
    [
     "UnboundPDF",
     "PitchRadar"
    ]
   ]
  ]
 ],
 [
  "Quality & design",
  [
   [
    "Large automated test suites",
    [
     "UnboundPDF",
     "PitchRadar",
     "FarmQuick"
    ]
   ],
   [
    "Release gates and checksum sweeps",
    [
     "UnboundPDF",
     "Conxfolio",
     "VVDex Engine"
    ]
   ],
   [
    "Interface and interaction design",
    [
     "Conxto",
     "UnboundPDF",
     "FarmQuick",
     "VVDex Engine",
     "VVDex Platform",
     "PitchRadar",
     "Conxfolio",
     "VVDex Trading"
    ]
   ],
   [
    "Design systems",
    [
     "Conxfolio"
    ]
   ],
   [
    "SEO content at scale",
    [
     "Conxfolio",
     "UnboundPDF"
    ]
   ],
   [
    "Writing product copy",
    [
     "Conxto",
     "UnboundPDF",
     "FarmQuick",
     "VVDex Engine",
     "VVDex Platform",
     "PitchRadar",
     "Conxfolio",
     "VVDex Trading"
    ]
   ]
  ]
 ]
];
export const about = {
 "facts": [
  [
   "Based in",
   "Magdeburg, Germany"
  ],
  [
   "Work",
   "Remote, or on-site in Germany. German residence permit, no sponsorship needed."
  ],
  [
   "Education",
   "M.Sc. Data Science, in progress — University of Europe for Applied Sciences"
  ],
  [
   "",
   "B.E. Electronics & Communication — PESIT, Bengaluru"
  ],
  [
   "Languages",
   "English, fluent · German A1, learning A2"
  ]
 ]
};
