# 29 · Paper Town — career portfolio template

One paper-cut world, two views of the same record, both rendered only from `window.PORTFOLIO_DATA`.

- `index.html` — **the town** (front page). The person's own house at the night end with the name hung over it as a plate (the page's only `h1`). After it comes one building per project on the one road and river, and dawn at the far end. Clicking a building or its sign opens that project's paper card in place. Below the town, the record on paper, in this order: About, Experience, Projects, Skills, Education, Languages, Contact.
- `desk.html` — **the desk**. The same record as things on a desk. The name tag is the `h1`. Each project is a sheet of paper, the roles are a stack of files, the languages a pile of books, the skills slips on a cork board and the education a frame on the wall. The laptop opens About and the envelope opens Contact. The lamp switches day and evening.

The two views link to each other and keep the query string (`?data=sparse` survives the trip).

## Contract
Load order on both pages:
1. inline `?data=sparse` switch, which sets the sparse specimen (the same object as `../specimen-sparse.js`)
2. `portfolio-data.js`, the rich specimen (`window.CONXFOLIO_RESUME = window.CONXFOLIO_RESUME || {…}`)
3. `../shared-resume-adapter.js` with `data-conxfolio-target="PORTFOLIO_DATA"`
4. `kit.js`, then `town.js` or `desk.js`, which read only `window.PORTFOLIO_DATA`

`../_flex-laws.css` is linked last in the head. "Example portfolio" is printed unless `window.__CONXFOLIO_GALLERY__ === false`.

- **Nothing invented.** Every word about the person comes from the data. The only other text is design chrome: section names, "Contact", numerals, and hand notes such as "pinned to the board".
- **Empty prints nothing.** A missing field removes its label. A missing section removes its building or desk object, its card, its section and its nav entry. With sparse data you get a house in a field and a desk with a window, laptop, plant, lamp and mug.
- **One page.** There are no case or inside pages. Every project opens as a paper card overlay. It is closed with ×, Escape or the backdrop, and focus is kept inside it while open.
- **Project visual.** `project.image` is used if present (http/https/data/blob). Otherwise the plate is a paper-cut scene: the project's building, drawn close up and animated, with the title's initials cut into the sun.
  - The building style is `index % 8`: harbour lighthouse, airfield, works, square of houses, city towers, workshop, hall on a hill, farm with windmill.
  - These are generic motifs taken from the source worlds. None of the source's product content or screenshots is used.
- **Layout by measure.**
  - The town's width grows with the number of projects. Each slot is as wide as its building or its sign, whichever is wider. Signs wrap titles over up to 5 lines and never overlap.
  - The desk is laid out for the screen width (1600, 1000 or 600 units) and is as tall as its contents. Wall items pack beside and below the measured name tag. Paper text is wrapped by measured width.
- **Motion.** In the town: the intro cut (once per session), the torch light and shadows that follow the pointer, parallax, a truck, a banner plane, clouds and building life. On the desk: parallax, steam, a plant and a window cloud. With `prefers-reduced-motion` all of these are off and a still frame is set.
- **Fonts.** Self-hosted in `fonts/`: Fraunces upright and italic variable, and Caveat variable (latin and latin-ext, OFL files included). No runtime CDN.

## Files
`index.html`, `desk.html`, `portfolio-data.js`, `kit.js` (record, paper craft, buildings, plates, cards), `town.js`, `desk.js`, `paper.css` (fonts, tokens, card, shared paper-world styles), `town.css`, `desk.css`, `fonts/`, `_qa/`.

## QA
Serve the workshop root with `python3 -m http.server 4463`, then run `PW=<path to playwright> node _qa/qa.js`.

The script checks both pages with rich, sparse and a stress record, at 1440, 760 and 390 wide. It writes screenshots and `qa-results.json` to `_qa/`. The stress record has a 63-character name, a 14-project list and an unbroken 52-character skill.

Measured 2026-09-27, 18 runs: 0 console or page errors, 0 failed requests, 0 horizontal overflow, exactly one `h1` equal to the name, 0 sign overlaps and 0 sign-text overflow. A project card opened and closed (Escape and ×) in every run with projects; sparse has no projects, so that check does not apply there.

Known and accepted:
- The desk paper-overflow check reports 1 at `desk-rich-390`. It is a false positive: the check compares all book titles against the first book's outline, and each title sits inside its own book.
- On the stress record at 390 px, the tall name plate covers the top of the house in the town. The plate hangs in front by design, and nothing is cut off.
