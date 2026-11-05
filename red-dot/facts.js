// The board. Adding work = one entry here. Status is one of LIVE, BOARDING, RESEARCH, CANCELLED.
// Numbers carry their own date; the page derives every count from this list.
window.BOARD = {
  person: {
    name: "Vamsi Venkatesh",
    role: "AI systems & product engineer",
    city: "Magdeburg",
    tz: "Europe/Berlin",
    email: "vamsi@vamsivenkatesh.com",
    lede: "I take a problem and ship a working product. Built, deployed and debugged in production, on servers I administer. My agents do the hands; nothing ships until I have checked it myself.",
  },

  // The board's LED ticker.
  ticker: [
    "VV 109 CANCELLED · THE CLAIM FAILED THE TEST I SET BEFORE MEASURING",
    "VV 110 CANCELLED · THE AGENT COULD SEE THE ANSWER KEY · 6 PASSES WITHDRAWN",
    "NOTHING DEPARTS UNTIL IT PASSES MY CHECKS",
    "VV 107 CONXFOLIO NOW BOARDING",
  ],

  // Rotating message on the top flap line (max 22 characters each).
  messages: [
    "VAMSI VENKATESH",
    "AI SYSTEMS ENGINEER",
    "SHIP. CHECK. SIGN.",
    "OPEN TO ROLES + CLIENTS",
  ],

  flights: [
    {
      flight: "VV 101",
      checks: ["Exams attacked before use: 9–10 cheating probes, all must fail", "Hidden tests grade in a separate box", "Every pass rate with its 95% range", "Every run signed: anyone can check a receipt"],
      shots: [["hd/forge-a.jpg", "Test AI models and agents on real work."], ["hd/forge-b.jpg", "From your model to a result anyone can check."], ["hd/forge-c.jpg", "What we tested: 148 graded attempts, all published."]],
      title: "VVDex Platform",
      line: "Test AI models and agents on real work: a real task in a sealed sandbox, hidden tests decide, and a signed receipt anyone can check.",
      numbers: [["17", "certified exams"], ["148", "graded attempts, published"]],
      plan: "Give any model or agent real work, keep the grading out of its reach, and hand back a score anyone can check.",
      built: [
        "Connect a model by API key, your own server, a model on your machine, or an agent over HTTP; a key is encrypted on arrival",
        "A sealed sandbox per attempt (no network, one CPU, a step budget) and hidden tests in a separate grading box",
        "Pass rates with 95% ranges and an Ed25519-signed receipt per run; five exams free, no sign-in",
      ],
      links: [["vvdexops.com", "https://vvdexops.com/"], ["proof repo", "https://github.com/vamsi-venkatesh/vvdex-forge-proof"]],
    },
    {
      flight: "VV 102",
      checks: ["Every action: runs itself, waits for your person, or never", "Incoming content is never an instruction", "An independent reviewer on every result", "Every run sealed under one SHA-256 digest"],
      shots: [["hd/lab-a.jpg", "Describe the work. VVDex runs it, by your rules."], ["hd/lab-b.jpg", "Your rules draw the line."], ["hd/lab-c.jpg", "Every run leaves proof."]],
      title: "VVDex Engine",
      line: "Describe the work in one paragraph and the Engine compiles it into a running service: what runs by itself, what waits for you, and what never happens.",
      numbers: [["50", "compiled service examples"], ["11", "categories of business work"]],
      plan: "Let a business describe the outcome, then design and run the service with a person holding the authority and proof of every run.",
      built: [
        "A compiler from a plain paragraph to a service contract: inputs, facts, rules and outcomes",
        "An authority model from your own words, and a crew of specialist agents with an independent reviewer on every result",
        "Sealed evidence for every run; connects your real systems only when you say so",
      ],
      links: [["lab.vvdexops.com", "https://lab.vvdexops.com/"]],
    },
    {
      flight: "VV 103",
      checks: ["408 tests on the public engine", "A person confirms before anything moves", "Owner-gated WhatsApp and email", "Leads scored by written rules"],
      shots: [["shots/farmquick-20260915-a.jpg", "The ordering site, for wholesale and restaurant buyers."], ["shots/farmquick-20260915-b.jpg", "Build a supply order. No payment online."], ["shots/farmquick-20260915-c.jpg", "The range, product by product."], ["shots/farmquick-d.jpg", "Lead Desk: every morning's run across five cities."], ["shots/farmquick-e.jpg", "Market prices for the catalogue, read daily."]], what: "Ordering site and a buyer-finding agent for a produce business", dest: "FARMQUICK", gate: "FARMQUICK.IN", status: "LIVE",
      title: "FarmQuick",
      line: "End to end for a B2B produce business: the ordering site buyers use, and Lead Desk, the agent that finds the next buyer every morning.",
      numbers: [["5", "cities every morning"], ["1", "human decides"]],
      plan: "Turn a family produce business into recurring, trackable B2B orders: build the site buyers order from, then the automation that finds the next buyer.",
      built: [
        "The ordering site on Cloudflare: catalogue, bulk enquiry and orders, mobile first; a person confirms before anything moves",
        "The loop closes: an order reaches the owner, becomes a won lead in the register and a line in the weekly report",
        "Lead Desk reads open sources across five cities, scores leads by written rules and uses a model only when rules cannot answer",
      ],
      links: [["farmquick.in", "https://farmquick.in/"], ["engine on GitHub", "https://github.com/vamsi-venkatesh/buyer-radar"]],
    },
    {
      flight: "VV 104",
      checks: ["620 tests in CI on every push", "No model in the score", "No guessed contacts", "Evidence behind every line"],
      shots: [["shots/pitchradar-20260916-a.jpg", "The command centre: the week's openings, ranked."], ["shots/pitchradar-20260916-b.jpg", "Every event with its evidence: what was found, where, and what is missing."], ["shots/pitchradar-20260916-c.jpg", "The week's decision brief, the register and the evidence sheets."]], what: "Finds and ranks events for a food vendor. Client work", dest: "PITCHRADAR", gate: "GITHUB/PITCHRADAR", status: "LIVE",
      title: "PitchRadar",
      line: "Finds the events a mobile food vendor should trade at, ranks them on rules you can read, and hands the owner one brief with the evidence behind every line. Running for a client.",
      numbers: [["7", "agents"], ["620", "tests · 16 Sep 2026"]],
      plan: "Make a vendor's week decidable: collect the public event sources, keep what each one actually said, rank by written rules, hand over one brief.",
      built: [
        "Seven agents, each with its own receipts: discovery, extraction, qualification, contacts, deadlines, weather, reporting",
        "A deterministic core; a language model only where the rules cannot answer, and never in the score",
        "Contacts resolved from what German sites are legally obliged to publish, never guessed",
      ],
      links: [["engine on GitHub", "https://github.com/vamsi-venkatesh/pitchradar"]],
    },
    {
      flight: "VV 105",
      checks: ["471 tests", "430-file checksum sweep", "Deployed from a clean worktree", "The live page re-checked after deploy"],
      shots: [["shots/unboundpdf.jpg", "The home page. Nothing is uploaded, ever."], ["shots/unboundpdf-b.jpg", "All 53 tools, counted from the one registry the site derives from."], ["shots/unboundpdf-d.jpg", "The Workspace: chain the tools on one file; every step records the sha256 of the bytes going in and out."], ["shots/unboundpdf-c.jpg", "One of them: comparing two PDFs, in the browser."]], what: "53 PDF tools. Your file never leaves the browser", dest: "UNBOUNDPDF", gate: "UNBOUNDPDF.COM", status: "LIVE",
      title: "UnboundPDF",
      line: "Every PDF tool in the browser. The file never leaves the tab.",
      numbers: [["53", "tools"], ["0", "uploads"]],
      plan: "Every PDF tool, running in the browser, so the file never has to be uploaded anywhere.",
      built: [
        "53 tools, all deriving their counts from one registry",
        "A workspace that keeps your files encrypted in your own browser",
        "A 471-test suite and a 430-file checksum sweep against every deploy",
      ],
      links: [["unboundpdf.com", "https://unboundpdf.com/"]],
    },
    {
      flight: "VV 106",
      checks: ["Every rewritten line checked against the résumé", "Anything that claims more is reverted", "Nothing sent without approval", "Agents propose, a person approves"],
      shots: [["shots/conxto-20260915-a.jpg", "Copilot: live postings, checked against your résumé."], ["shots/conxto-20260915-b.jpg", "Each requirement next to the line that proves it."], ["shots/conxto-20260915-c.jpg", "The package: résumé, letter and answers, ready to review."], ["shots/conxto-20260915-d.jpg", "Autopilot: your rules in plain words, versioned."]], what: "Job search that checks every line against your résumé", dest: "CONXTO", gate: "CONXTO.COM", status: "LIVE",
      title: "Conxto",
      line: "Reads live job postings against your résumé, checks every requirement and prepares the whole application. Nothing is sent without your approval.",
      numbers: [["81,615", "live postings · 15 Sep 2026"], ["5", "agents"]],
      plan: "Make a job search honest and fast: find roles worth applying to, prepare each application from what the résumé proves, keep the person in charge of every send.",
      built: [
        "Its own job search engine: boards, feeds and career pages merged per job, from 22 sources",
        "A truthfulness pipeline: every rewritten line is checked against the original résumé, and anything that claims more is reverted",
        "Five agents over one persistent memory per account; agents propose, a person approves",
      ],
      links: [["conxto.com", "https://conxto.com/"], ["on GitHub", "https://github.com/vamsi-venkatesh/conxto"]],
    },
    {
      flight: "VV 107",
      checks: ["A parsing corpus gate before every ship", "Four tools share one résumé", "No account needed to start", "Publishing a portfolio is free"],
      shots: [["shots/conxfolio.jpg", "One résumé, folded. Four free tools that know each other."], ["shots/conxfolio-b.jpg", "Portfolio worlds, each with its own art direction."], ["shots/conxfolio-c.jpg", "The résumé builder itself."]], what: "Free résumé, letter and portfolio suite", dest: "CONXFOLIO", gate: "CONXFOLIO.COM", status: "BOARDING",
      title: "Conxfolio",
      line: "Your next move, all here: build your résumé, check how it reads, write your letter and show your work.",
      numbers: [["37", "résumé designs"], ["20", "portfolio websites"]],
      plan: "Four tools that share one résumé, free to start and free to publish.",
      built: [
        "37 résumé designs (PDF and Word), 12 cover-letter designs and 20 portfolio websites",
        "One résumé parser with nine deterministic specialists, gated on a corpus before every ship",
        "Publish a portfolio at conxfolio.com/yourname, free",
      ],
      links: [["conxfolio.com", "https://conxfolio.com/"]],
    },
    {
      flight: "VV 108",
      checks: ["Every call hash-chained to the last", "Claims gated on thresholds set in advance", "Paper only: no capital", "Automation or nothing: no manual trades"],
      shots: [["shots/trading.jpg", "The market, order by order."], ["shots/trading-b.jpg", "Live flow across venues: depth, CVD, funding and forced liquidations."]], what: "Every market call dated and hash-chained. Paper only", dest: "TRADING", gate: "TRADING.VVDEXOPS.COM", status: "RESEARCH",
      title: "VVDex Trading",
      line: "Live market microstructure beside a hash-chained record of every dated call. Paper only.",
      numbers: [["2,028", "dated calls"], ["0", "capital"]],
      plan: "Publish every dated call into a chained record, so anyone can check the whole history rather than the highlights.",
      built: [
        "Every call hash-chained to the last",
        "Paper only: no capital, no manual trades, automation or nothing",
        "Every claim gated on the threshold it declared in advance",
      ],
      links: [["trading.vvdexops.com", "https://trading.vvdexops.com/"]],
    },
    {
      flight: "VV 109", what: "Failed the test I set before measuring: 0.683 vs 0.7178", dest: "ACCURACY CLAIM", gate: "TRADING.VVDEXOPS.COM", status: "CANCELLED",
      title: "The 70% claim",
      line: "Cancelled by my own test. The claim failed the gate I declared before measuring, so it was withdrawn.",
      numbers: [["0.683", "measured"], ["0.7178", "gate set in advance"]],
      plan: "A directional-accuracy claim was only allowed to stand if it cleared a threshold written down before the measurement.",
      built: [
        "Measured 0.683 against a declared gate of 0.7178",
        "The claim was withdrawn; the dated record that measured it stays public",
      ],
      links: [["the record", "https://trading.vvdexops.com/"]],
    },
    {
      flight: "VV 110", what: "The agent could see the answer key. 6 passes withdrawn", dest: "UNSEALED EXAM", gate: "VVDEXOPS.COM", status: "CANCELLED",
      title: "An exam lane I could not certify",
      line: "Six passing results withdrawn. The agent under test could reach the answer key, so its passes proved nothing.",
      numbers: [["6", "passes withdrawn"], ["0", "kept"]],
      plan: "A pass in Forge survives only on verified containment: proof the agent could not see the gold answers or hidden tests.",
      built: [
        "Found that one lane's agent CLI could read the gold answers, hidden tests and its own transcripts",
        "Withdrew all six historical passes and marked the lane not certifiable",
      ],
      links: [["how Forge grades", "https://vvdexops.com/evals"]],
    },
  ],

  // Security check: each bag goes through the scanner; the monitor shows what is really packed inside.
  // Kinds follow real X-ray colouring: metal (blue), inorganic (green), organic (orange); alarm = red.
  security: [
    {
      flight: "VV 105", dest: "UNBOUNDPDF", bag: "#2b3a55",
      items: [["471 tests", "metal"], ["430-file checksum sweep", "inorganic"], ["clean-worktree deploy", "metal"], ["live page re-checked", "organic"]],
      verdict: "CLEARED", note: "Ships only when the suite is green and every served file matches its checksum.",
    },
    {
      flight: "VV 102", dest: "AGENT SERVICE LAB", bag: "#34452f",
      items: [["2,900 evaluation cases", "metal"], ["human gate per service", "organic"], ["18 deploy gates", "inorganic"], ["sealed receipt per run", "metal"]],
      verdict: "CLEARED", note: "A release clears every gate before a visitor can run it.",
    },
    {
      flight: "VV 109", dest: "M6E 70% CLAIM", bag: "#5a2a26",
      items: [["claim: 70% accuracy", "alarm"], ["measured 0.683", "organic"], ["gate set first: 0.7178", "inorganic"], ["the dated record", "metal"]],
      verdict: "PULLED", note: "The claim failed the gate declared before measuring. Withdrawn; the record stays public.",
    },
    {
      flight: "VV 104", dest: "PITCHRADAR", bag: "#4a3a22",
      items: [["620 tests in CI", "metal"], ["no model in the score", "organic"], ["no guessed contacts", "inorganic"], ["evidence on every line", "metal"]],
      verdict: "CLEARED", note: "A deterministic core; a model only where the rules cannot answer.",
    },
  ],

  // The last row on the board: the visitor's own flight.
  contact: {
    flight: "VV 000", dest: "YOUR PROJECT", status: "BOARDING", title: "Your project",
    what: "Open to AI engineer roles and client work. Tap to write to me",
    open: ["AI engineer roles: agent systems, evaluation, production AI", "Client work: an agent service, an automation, a product built end to end", "Magdeburg, Germany · remote or on site"],
  },

  crew: [
    ["I own the whole stack.", "Five products live on servers I administer, behind deploy gates I wrote: full test suites, checksum sweeps, rendered-frame checks, rollback roots."],
    ["I hold the standard.", "I built the evaluation instrument my agents are measured with. Every claim is gated on a threshold declared in advance and checked on the served artefact. Verified numbers or a dash."],
    ["I sign every release.", "Multi-agent pipelines are how I ship faster than one pair of hands. I plan the work, review every output, and the send stays human."],
  ],

  ground: [
    ["The Vault", "A wiki second brain of every decision, state and rule. Any model bootstraps from it in four reads."],
    ["Project Brain", "Code graphs, tests and runtime evidence for six products. A claimed fix needs the tests it ran."],
    ["MNEMA", "Tenant-scoped agent memory with hybrid retrieval, so agents recall instead of re-deriving."],
  ],

  passenger: [
    ["Education", "M.Sc. Data Science (in progress), University of Europe for Applied Sciences · B.E. Electronics & Communication, PESIT Bengaluru"],
    ["Right to work", "Magdeburg, Germany · German student residence permit, no sponsorship needed"],
    ["Languages", "English fluent · German A1, learning A2"],
  ],
};
