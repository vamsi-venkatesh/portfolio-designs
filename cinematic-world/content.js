// What the page says. Product facts come from facts.js (the live site's wording) with the lines below written
// for this page; skills only name tools the repos actually use. Screens are fresh 2x captures (hd/, 2026-09-23)
// of the public product pages; PitchRadar's come from its public GitHub README.
window.SITE = {
  name: ["Vamsi", "Venkatesh"],
  role: "AI systems & product engineer · Magdeburg, Germany",
  intro: "I design and build AI products end to end: the idea, the system behind it, the interface people use, and the servers it runs on. Here are eight of them.",
  email: "vamsi@vamsivenkatesh.com",
  order: ["VV 106", "VV 105", "VV 103", "VV 102", "VV 101", "VV 104", "VV 107", "VV 108"],
  accent: { "VV 101": "#8a7bff", "VV 102": "#3fd08a", "VV 103": "#7bc96f", "VV 104": "#ff9a3d", "VV 105": "#ff5a4e", "VV 106": "#5b8cff", "VV 107": "#ff6f61", "VV 108": "#38c6d9" },
  kind: { "VV 101": "AI evaluation platform", "VV 102": "Agent automation", "VV 103": "B2B commerce + lead agent", "VV 104": "Event intelligence · client", "VV 105": "Browser PDF suite", "VV 106": "AI job search", "VV 107": "Career suite", "VV 108": "Market research" },
  // per product: the line, three facts, two numbers, and the screens (main first)
  copy: {
    "VV 106": {
      line: "Reads live job postings against your résumé, checks every requirement and prepares the whole application: the tailored résumé, the letter and the answers.",
      built: ["Its own job search engine: boards, feeds and career pages merged per job, from 22 sources", "A truthfulness pipeline: every rewritten line is checked against the original résumé, and anything that claims more is reverted", "Five agents sharing one persistent memory per account"],
      shots: [["hd/conxto-a.jpg", "Copilot: live postings, checked against your résumé."], ["hd/conxto-b.jpg", "Each requirement next to the line that proves it."], ["hd/conxto-c.jpg", "The package: résumé, letter and answers."]],
    },
    "VV 105": {
      shots: [["hd/unboundpdf-a.jpg", "The home page. Nothing is uploaded."], ["hd/unboundpdf-b.jpg", "All 53 tools, from one registry."], ["hd/unboundpdf-c.jpg", "The Workspace: chain the tools on one file."]],
    },
    "VV 103": {
      built: ["The ordering site on Cloudflare: catalogue, bulk enquiry and orders, mobile first", "The loop closes: an order reaches the owner, becomes a won lead in the register and a line in the weekly report", "Lead Desk reads open sources across five cities and scores leads by written rules, calling a model only when rules cannot answer"],
      numbers: [["5", "cities every morning"], ["42", "catalogue items"]],
      shots: [["hd/farmquick-a.jpg", "The ordering site, for wholesale and restaurant buyers."], ["hd/farmquick-b.jpg", "Build a supply order."], ["hd/farmquick-c.jpg", "The range, product by product."]],
    },
    "VV 102": {
      line: "Fifty agent services you can run in the browser: each a typed workflow that runs on your own input and ends in a sealed receipt.",
      built: ["50 services across 11 operating areas, each an executable graph of scouts, verifiers and a policy decision", "A command box that compiles a new service from a brief", "2,900 deterministic evaluation cases compiled from the service contracts"],
      shots: [["hd/lab-a.jpg", "AI services you can run and inspect."], ["hd/lab-b.jpg", "Product AI: ask your data a question, get an answer it can prove."], ["hd/lab-c.jpg", "Process AI: reconcile two systems without letting AI guess."]],
    },
    "VV 101": {
      shots: [["hd/forge-a.jpg", "Know what your AI can actually do."], ["hd/forge-b.jpg", "Annotation quality, across five formats."], ["hd/forge-c.jpg", "Capabilities compared per exam, never as one score."]],
    },
    "VV 104": {
      shots: [["hd/pitchradar-a.jpg", "The command centre: the week's openings."], ["hd/pitchradar-b.jpg", "Every event ranked, with its evidence."], ["hd/pitchradar-c.jpg", "A 12-week booking plan."]],
    },
    "VV 107": {
      shots: [["hd/conxfolio-a.jpg", "One résumé, checked."], ["hd/conxfolio-b.jpg", "Portfolio designs, each its own world."], ["hd/conxfolio-c.jpg", "Every résumé design."]],
    },
    "VV 108": {
      shots: [["hd/trading-a.jpg", "The market, order by order."], ["hd/trading-b.jpg", "Order flow across venues."], ["hd/trading-c.jpg", "Every call the engine made."]],
    },
  },
  skills: [
    ["AI & agents", ["LLM apps with Anthropic, OpenAI and DeepSeek models", "Multi-agent workflows and tool use", "Retrieval and long-term agent memory", "Evaluation suites for AI systems"]],
    ["Product engineering", ["TypeScript, Node.js, Fastify", "React and Astro front ends", "Python services", "Native macOS with Swift"]],
    ["Data & infrastructure", ["PostgreSQL and Cloudflare D1", "Linux servers, Docker, Caddy", "Cloudflare Workers and Pages", "n8n automations, WhatsApp and email delivery"]],
    ["Design", ["Interface and interaction design", "Design systems", "Motion, WebGL and 3D for the web", "Writing product copy"]],
  ],
  process: [
    ["Understand", "Start from a real problem and the person who has it. Talk to them, read the data, find the one thing that matters."],
    ["Design", "Shape the product and the system together: the screens, the data, where AI helps and where it shouldn't."],
    ["Build", "Write it end to end, using AI coding agents as part of my toolkit to move fast without losing quality."],
    ["Launch", "Put it on real servers, in front of real users, and watch how it's actually used."],
    ["Improve", "Keep a written record of every decision, and make the next version better than the last."],
  ],
  facts: [["Education", "M.Sc. Data Science (in progress), University of Europe for Applied Sciences · B.E. Electronics & Communication, PESIT Bengaluru"], ["Based in", "Magdeburg, Germany · German residence permit, no sponsorship needed"], ["Languages", "English fluent · German A1, learning A2"]],
};
