# Ink & Paper local build log

## v42 — 2026-08-22 — Black + chrome Proof Engine

- Preserved approved v30 snapshot: `../../snapshots/ink-paper-v30-approved-2026-08-22.tgz`
- Snapshot SHA-256: `3b98bbfbe27139c52f97201da7cfdfff42632faebb57b8abbf52f32f15b2f8de`
- Added meaningful hero system trace and living Three.js chrome field.
- Replaced repeated landing cards with a four-stop desktop Proof Reel plus mobile evidence cards.
- Added project-media case handoff, case progress and chapter navigation.
- Added distinct scrollytelling systems for UnboundPDF, Conxto, Agent Services + Studio and Conxfolio.
- Verified 17 local routes, critical assets, desktop/mobile layout, all four reel states, case transition, hover, keyboard focus, reduced motion, runtime logs and scroll behavior.
- Local QA snapshot: FCP/LCP 264 ms, CLS 0; 181-frame scroll median 16.7 ms and p95 18.4 ms.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=42`
- Deployment: none; production untouched.

## v45 — 2026-08-22 — Intro operating motion

- Preserved v42 snapshot: `../../snapshots/ink-paper-v42-approved-2026-08-22.tgz`
- Snapshot SHA-256: `dc3924f5ad9eebc484327f63c89c382e563d78c643522fc955f5ab482eb5454e`
- Replaced the looping SVG process diagram with a reference-led Three.js chrome-light choreography.
- Added synchronized Ground, Architect, Evaluate and Ship typographic states.
- Removed hero paths, nodes, packets and tiny technical diagram labels.
- Verified desktop/mobile composition, zero overflow, reduced motion, runtime logs and frame spacing.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=45`
- Deployment: none; production untouched.

## v46 — 2026-08-22 — FarmQuick + VVDexOps selected work

- Expanded the pinned homepage Proof Reel from four to six systems without changing the approved black-and-chrome brand or intro.
- Added FarmQuick as project 05 with its real product capture, D1-first order boundary, human commercial confirmation, live project link and dedicated case link.
- Added VVDexOps as project 06 with its real public board, dated 22 July 2026 research snapshot, paper-only boundary, live platform link and dedicated case link.
- Generated and inspected one layout reference for each added state; the references guided hierarchy only and are not shipped assets.
- Verified both scroll-activated desktop states at 1440×900, both stacked mobile states at 390×844, six matching story/visual nodes, 01/06 counter behavior, zero horizontal overflow and a clean fresh navigation run.
- Verified the homepage, both dedicated case routes and both screenshot assets return local HTTP 200. Each case exposes its correct live destination and remains a dedicated URL.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=46`
- Deployment: none; production untouched.

## v47 — 2026-08-22 — UnboundPDF Proof Aperture

- Preserved the approved v46 source at `../../snapshots/ink-paper-v46-approved-2026-08-22.tgz` (SHA-256 `ff8b67fdd6803bb9b4b9a3b30e993f8c8979c14030d53678d447a75c4ede9b7a`).
- Built one benchmark instead of restyling the whole catalogue: the hero's final Ship state now hands the page into a scroll-scrubbed chrome seam that opens into the real UnboundPDF product surface.
- The resolved 60/40 scene explains the product, 32-tool / zero-upload proof, Select → Work locally → Download path, explicit local-file boundary, live destination and dedicated case action.
- Removed the repeated UnboundPDF stage/story from the following reel. Project 02 now begins with Conxto, and projects 02–06 otherwise keep their v46 content and behavior.
- Used two generated composition studies only as references; the served experience uses the real `/assets/unboundpdf.png` product capture rather than a generated background.
- Served QA covered the opening, mid-reveal, resolved proof and Conxto handoff at 1440×900; the static mobile story and project-02 continuity at 390×844; and shorter-desktop bounds at 1280×720. No horizontal overflow was present.
- Verified the dedicated UnboundPDF case navigation and browser return, a clean fresh runtime warning/error pass, JavaScript syntax, five matching reel stories/visuals, zero duplicate UnboundPDF reel nodes, 17 shared stylesheet references and local HTTP 200 for the landing, cases, archive, scripts and primary proof assets.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=47`
- Deployment: none; production untouched.

## v51 — 2026-08-22 — Proof Reel pacing and final-state repair

- Preserved the approved v47 source at `../../snapshots/ink-paper-v47-approved-2026-08-22.tgz` (SHA-256 `db0b5ed635eeff238349a8459ee28b9c4028e521d2bb0b8a97f8d1f1c5f0d81c`).
- Fixed the desktop reel's two root causes: short `78vh` story tracks made the next project activate after a small wheel movement, and the last `702px` VVDexOps track was shorter than the `776px` sticky stage, so the frame released before the final project could settle.
- Replaced observer-triggered, time-based project swaps with a scroll-scrubbed crossfade. Each desktop story now owns `118vh`; VVDexOps owns `150vh` plus a `65vh` closing hold. The aperture now spans `245vh` and fades as one complete frame onto a prepared Conxto scene.
- Served visual QA passed at 1440×900 and 1280×720: controlled intermediate crossfade, full Conxto handoff, complete Agent Services, Conxfolio, FarmQuick and VVDexOps states, and a long fully pinned VVDexOps closing hold. At 390×844 the static stacked layout remains intact, all five stories are present, VVDexOps is complete, its 1440×1000 source image is loaded, and horizontal overflow is zero.
- JavaScript syntax, fresh runtime warnings/errors and local HTTP checks passed for the landing, shared CSS/JS and VVDexOps proof asset.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=51`
- Deployment: none; production untouched.

## v54 — 2026-08-22 — Mobile scroll cinema

- Preserved the accepted v51 source at `../../snapshots/ink-paper-v51-approved-2026-08-22.tgz` (SHA-256 `d5f1c555611c989cccb889d91d595e271b50030427c450d2ac193c1908503f22`).
- Fixed the mobile root cause: `bindProofReel()` returned below 761px while mobile CSS hid `.proof-stage`, so phones could only render static duplicate screenshots and never enter the scroll transition system.
- Mobile now has its own touch-scroll sequence. UnboundPDF's media and explanation reveal progressively; projects 02–06 share a compact sticky evidence frame whose real product visuals crossfade, scale and settle according to scroll position while the next explanation rises beneath it.
- Added long mobile dwell tracks and a dedicated final hold so VVDexOps resolves completely before the reel releases. Reduced-motion keeps the existing static stacked evidence cards.
- Served visual QA passed at 390×844, 360×740 and 320×568, including a real gesture-driven Conxto → Agent Services transition, full intermediate and completed states, full VVDexOps plus its closing hold, loaded proof images and zero horizontal overflow. Desktop 1440×900 retained v51's `245vh` aperture and `118vh`/`150vh` story pacing. Runtime logs were empty, JavaScript syntax passed and landing/CSS/JS returned local HTTP 200.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=54`
- Deployment: none; production untouched.

## v55 — 2026-08-22 — Contact hover contrast repair

- Preserved v54 at `../../snapshots/ink-paper-v54-approved-2026-08-22.tgz` (SHA-256 `88e0a5268ea82c73955e75f23a53453a9cb0153aed86f713639cddd9f848a0e3`).
- Confirmed the white flash came from `.contact>a:hover{background:#e5e8e9;color:#08090a}`, which repainted each full-width Email / Ask row as a bright box beneath the cursor.
- Replaced the fill with a 2.4%-white ink-dark surface, stable light text, a quiet chrome bottom-line reveal and a 5px action-label shift. Keyboard focus uses the same non-flashing treatment; reduced-motion removes the transitions.
- Served desktop cursor QA exercised both rows: background `rgba(255,255,255,.024)`, light text retained, chrome line resolved, no content hiding. Mobile 390×844 remained transparent at rest with zero horizontal overflow. Runtime logs were empty; landing and CSS returned HTTP 200.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=55#contact`
- Deployment: none; production untouched.

## v56 — 2026-08-22 — Product → System → Proof benchmark

- Preserved the accepted v55 source at `../../snapshots/ink-paper-v55-approved-2026-08-22.tgz` (SHA-256 `b2736fb342ca18347b3a48c88c5722d7f69881cf4a0d5276e1fb6272f312dbc6`).
- Refined the black/chrome hero into a quieter editorial composition: one product-engineering statement, one operating-method rail and restrained ambient light. Three generated studies were used only as composition references; no generated product UI is served.
- Rebuilt the UnboundPDF opening as one scroll-controlled Product → System → Proof X-ray using the real product capture, a document plane, local-processing layers, the browser/device boundary and exported result.
- Replaced UnboundPDF's generic case template with a compact dedicated editorial page: real product opening, next-chapter fold, sticky three-chapter system explanation, decisions, privacy boundary and verified delivery proof. The other case routes retain their existing structure.
- Mobile received a dedicated sticky system story rather than a compressed desktop layout; the proof narrative remains readable at 390×844 and 320×568.
- Served QA passed at 1440×900, 390×844 and 320×568. It covered fresh landing load, direct `#work`, all X-ray phases, Conxto handoff, the full VVDexOps final hold, landing → UnboundPDF case, Close, browser Back, mobile case chapters, zero horizontal overflow and empty runtime logs.
- All 17 portfolio routes and the critical image/CSS/JavaScript assets returned local HTTP 200; modified JavaScript syntax, HTML parsing and stylesheet brace balance passed.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=56`
- Scope boundary: this is the approved UnboundPDF benchmark and shared opening system. Projects 02–06 have not yet been individually rebuilt to the same case-study depth. Deployment: none; production untouched.

## v57 — 2026-08-22 — Complete flagship Product → System → Proof portfolio

- Extended the approved v56 benchmark across Conxto, Agent Services + Studio, Conxfolio, FarmQuick and VVDexOps without turning them into five UnboundPDF copies. Five generated desktop studies established composition only; every served product surface remains a real local capture.
- Conxto now connects current jobs, career evidence and user intent through one shared MNEMA memory into seven specialists and a human approval boundary. Agent Services keeps public contract proof and private Studio control on opposite sides of a Contract → Execute → Check → Human Gate authority spine.
- Conxfolio now shows one evidence-bound career source refracting into materially different worlds and founder review. FarmQuick shows its real catalogue beside Request → D1 record → authenticated route → human confirmation. VVDexOps places the real market interface above dated comparative metrics and an append-only ledger that keeps `−0.017` and “No edge yet” visible.
- Added compact dedicated flagship case structures for all five: restrained real-product opening, governing statement, four scroll chapters, product decisions, honest boundary, ownership/stack proof and correct selected-work case numbering. Removed the old generic repetition from these five cases.
- Fixed a direct-`#work`/responsive handoff race found during QA: aperture/reel state no longer waits on a stale intersection flag, and delayed/hash updates resolve the correct scroll state. The overlap could be reproduced at 1440×900 before the patch and was absent afterward.
- Served visual QA covered all five desktop homepage scenes, all five desktop case openings, the FarmQuick desktop chapter transition, the 390×844 mobile reel and FarmQuick case opening/chapter, direct `#work`, UnboundPDF → Conxto handoff, visible VVDexOps case navigation and Close return. Desktop and mobile horizontal overflow remained zero; runtime logs were empty.
- All 17 routes and 10 critical real-image/CSS/JavaScript assets returned local HTTP 200. Thirteen HTML shells parsed, JavaScript syntax passed, stylesheet braces balanced and the old duplicate standard-case flow count is zero.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=57`
- Deployment: none; production untouched.

## v58 — 2026-08-22 — Conxto career-spine visual system

- Preserved v57 before isolating Conxto. Removed its weak orbit/node treatment and rebuilt both the selected-work scene and dedicated case around one linear career spine: live opportunities → real Conxto command center → shared career memory → résumé / ATS diff / application → human approval.
- The real `conxto-ui.png` capture is now the dominant visual evidence. Generated composition studies were reference-only; no generated people or fake product UI are served.
- Added a distinct four-state case sequence — Discover, Remember, Tailor, Approve — with scroll-controlled product dimming, memory illumination, output-plane emergence and a restrained final approval state. The visual thesis is “Evidence changes form. Truth does not.”
- Served visual QA passed at 1440×900 and 390×844 for the homepage and dedicated Conxto case. It covered the settled project composition, Tailor and Approve states, live project/case navigation, Close return and zero horizontal overflow. JavaScript syntax, HTML parsing, CSS brace balance and local asset/route HTTP checks passed.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=58#work`
- Deployment: none; production untouched.

## v59 — 2026-08-22 — Unified minimalist line-system language

- Founder selected the restrained explanatory language already working in Agent Services and FarmQuick: one framed product surface, one numbered causal line and one quiet proof surface. Rebuilt UnboundPDF, Conxto and Conxfolio to that standard instead of extending the oversized/cinematic and scattered-label treatments.
- UnboundPDF now reads Live browser product → Local file → Browser worker → PDF engine → Local export → Device boundary. Conxto reads Career command center → Discover → Shared memory → Tailor → Human approval → Evidence-bound outputs. Conxfolio reads Canonical career truth → Bind proof → Compose → Differentiate → Founder review → Retained portfolio worlds.
- Their dedicated case visuals now use the same system grammar with restrained state changes: the active line node advances with the chapter while product evidence and the proof boundary remain visible. The products are related by one brand system without becoming identical diagrams.
- Mobile QA exposed and fixed a pre-existing root issue: subsequent project stories reserved only `52px` above their copy while the sticky visual occupied roughly `350px`, hiding titles and explanations behind the stage. Every project now reserves the full mobile stage height before its copy.
- Served visual QA passed at 1440×900 and 390×844 for all three rebuilt selected-work scenes, their dedicated cases, the Agent Services/FarmQuick benchmark continuity, mobile Conxfolio visibility, the full VVDexOps final state, case open/Close return and zero horizontal overflow. JavaScript syntax, HTML/CSS structure, local routes and real image assets passed.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=59#work`
- Deployment: none; production untouched.

## v60 — 2026-08-22 — Conxfolio redundant evidence card removed

- Removed the “Evidence remains attached” source box from the selected-work Conxfolio scene. It repeated the project copy without adding system understanding.
- Rebalanced the scene around the real Conxfolio gallery as the dominant surface and retained only the useful Bind proof → Compose → Differentiate → Founder review line.
- Served desktop 1440×900 and mobile 390×844 checks confirm the box is absent, the product/route composition is balanced and horizontal overflow remains zero.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=60#work`
- Deployment: none; production untouched.

## v61 — 2026-08-22 — UnboundPDF clarity and archive-hover repair

- Replaced developer-facing “0 uploads / enters memory” copy with visitor language: “Stays on your device / Your PDF is processed inside this browser / Downloaded to your device.”
- Reduced the desktop UnboundPDF system width to create a measured 40px gap between the privacy panel and project copy; the prior edges met at the same x-coordinate.
- Removed the full-white hover inversion from the complete-archive row. Pointer QA confirms the row stays ink-dark (`rgb(18,21,23)`) with readable light text.
- Served desktop 1440×900 and mobile 390×844 visual checks passed with zero horizontal overflow.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=61#work`
- Deployment: none; production untouched.

## v62 — 2026-08-24 — UnboundPDF reveal reduction and footer cleanup

- Removed the redundant UnboundPDF privacy-boundary card and duplicate privacy evidence line. The selected-work reveal now uses only the real product surface and the numbered Local file → Browser worker → PDF engine → Local export line.
- Reduced the document/product surface and replaced the ambiguous “0 uploads” metric with “On device / PDF processing.”
- Removed “Local founder-review build” from the main footer, all auxiliary pages and all generated case-study footers. Bumped all 12 case shells to `case.js?v=62` so the public-ready footer is not masked by an older cached script.
- Served QA passed at 1440×900 and 390×844 with zero horizontal overflow. The UnboundPDF case rendered the updated footer, local routes returned HTTP 200 and browser warnings/errors were empty.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=62#work`
- Deployment: none; production untouched.

## v63 — 2026-08-25 — Live-content coverage without a longer landing wall

- Audited the live portfolio against the approved Ink & Paper build. All twelve products were already present; the missing depth was the operating method, complete operator profile, capability matrix, current focus and build chronology.
- Added a concise five-part operating-method chapter after selected work: Vault → Project Brain → Studio → Harness and Eval Hub → reviewed memory. Eval Hub is surfaced as proof infrastructure rather than promoted into a seventh oversized homepage project.
- Added a dedicated About route for education, location, work eligibility, languages, role direction, eight capability groups and explicit operating principles. Kept the homepage About section concise and linked it to the full profile.
- Expanded Now with six active workstreams plus current learning and availability. Expanded the complete archive with the April–August product chronology. Added direct live-product shortcuts to Contact.
- Served visual QA passed at 1440×900 and 390×844 across landing, About, Now and Work. Mobile Method navigation lands correctly, all tested pages have zero document-level horizontal overflow, runtime logs are empty, JavaScript syntax and CSS brace checks pass, and eleven key local routes/assets return HTTP 200.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=63#method`
- Scope boundary: localhost only; production untouched. Case-study screenshot/proof upgrades remain the next phase.

## v64 — 2026-08-25 — UnboundPDF real-product proof sequence

- Replaced the case study's repeated homepage image and abstract `0 uploads` boundary card with four real UnboundPDF Workspace captures: empty promise, a 15-page document loaded, a measured compression result and the document passport.
- Built one restrained sticky evidence stage. Desktop advances the captures beside four chapters; mobile pins the proof above the copy and changes frames only when the matching heading enters the readable area.
- The narrative now moves Start → Ground → Operate → Verify. It exposes the actual 2.1 MB → 1.7 MB result, reopened output, ordered tool steps, input/output hashes and chain hash while explicitly describing the passport as integrity evidence rather than authorship or approval proof.
- Replaced the remaining visitor-facing `0 uploads` fact with `On device / file processing` and retained the existing black/chrome identity, case navigation and product-first structure.
- Served QA passed at 1440×900 and 390×844. All four desktop and mobile states activated, mobile proof/copy timing was corrected, Close returned to selected work, Conxto remained the next case, page-level overflow stayed zero, runtime logs were empty and all 12 case routes returned HTTP 200. JavaScript syntax and CSS brace checks passed.
- Review URL: `http://127.0.0.1:4390/ink-paper/cases/unboundpdf/?v=64`
- Scope boundary: localhost only; no production deployment. These are real dated product captures, not a live embedded product or recorded video.

## v65 — 2026-08-25 — UnboundPDF sharp evidence direction

- Kept the four real 1440×900 product captures, but stopped shrinking each whole interface into the only proof. Every chapter now pairs the full product context with a sharp, art-directed focus crop from the same capture.
- Removed the blur transition entirely. Frames change through a restrained crossfade and translation; the selected crop stays crisp at its authored zoom.
- Added previous/next controls, keyboard arrows, touch swipe and an `Inspect HD` viewer. The viewer opens the currently selected evidence and closes back to the same chapter.
- Added a dedicated mobile composition: subdued full-context image, dominant focus crop, compact controls and matching explanation in the same viewport instead of a large empty scroll gap.
- Served visual and interaction QA passed at 1440×900 and 390×844. All four desktop states render with `filter: none`; the final passport/hash crop is legible; mobile swipe advances to 02/04; selected-frame HD inspection and return work; page-level horizontal overflow is zero; JavaScript syntax, CSS braces, the four proof assets and all 12 case routes pass.
- Review URL: `http://127.0.0.1:4390/ink-paper/cases/unboundpdf/?v=65`
- Scope boundary: localhost only; no production deployment. The evidence remains the original real 1440×900 capture set—quality comes from deliberate framing and near-native inspection, not fabricated upscaling.

## v66 — 2026-08-25 — UnboundPDF landing reveal scale correction

- Corrected the first selected-work reveal after the intro. At 1440×900 its outer evidence stage was 518px tall while the shared project stage was 596px; the product surface was constrained to roughly half the stage width.
- Matched the UnboundPDF stage to the shared project-stage height and expanded the product surface while retaining the browser-local processing line. At the verified desktop viewport the UnboundPDF stage is 849.6×776px versus 858.7×776px for the shared stage; its product surface is now 560.7px wide.
- Added an equivalent mobile composition: the UnboundPDF stage is 314×354.5px at 390×844 with a 219.8px-wide product surface and intact processing line.
- Served visual QA passed at 1440×900 and 390×844 with zero horizontal overflow. CSS braces, JavaScript syntax and localhost responses for the landing page, stylesheet and real UnboundPDF image pass.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=66#work`
- Scope boundary: localhost only; production untouched.

## v67 — 2026-08-25 — UnboundPDF tool-first capability reel

- Verified the current live UnboundPDF catalogue rather than carrying forward the stale portfolio number: the live `toolsData` enumerates 43 tools and the public homepage describes the collection as 40+.
- Added a compact capability reel inside the enlarged landing product surface. It leads with `43 browser tools / All run locally` and advances one representative tool at a time: PDF Editor, Compress PDF, OCR PDF, True Redaction, PDF to Word, Compare PDF, PDF/A and Bates Numbering.
- Kept Workspace explicitly secondary: `Plus Workspace / Chain any tool into named copies`. UnboundPDF is presented as the full browser toolkit; Workspace is an additional orchestration layer.
- Updated the landing and UnboundPDF case-study metrics from 32 to 43 and corrected the case opening/outcome copy to the same product-first hierarchy.
- The reel starts only while visible, pauses when the tab is hidden and has a static reduced-motion state. Served QA passed at 1440×900 and 390×844; the sequence advanced PDF Editor → Compress PDF without an empty frame, both pages have zero horizontal overflow, source checks pass and all v67 localhost assets return HTTP 200.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=67#work`
- Scope boundary: localhost only; production untouched.

## v68 — 2026-08-25 — UnboundPDF right-side capability panel

- Corrected the v67 placement after founder clarification. Removed the capability reel from the bottom of the product image and rebuilt it as a dedicated vertical box on the right, matching Conxto's `product → system → evidence/output` composition.
- The UnboundPDF reveal now reads `product image → browser-local processing line → 43-tool capability panel`. Eight representative tools still advance one at a time inside the right panel.
- Workspace remains a small secondary line at the bottom of the panel: `Plus Workspace / Chain tools into named copies`; it is not presented as the main product.
- Served visual QA passed at desktop and 390×844 mobile. Desktop measures a 438px product surface, 106px system line and 174px capability panel inside the shared 755×596 stage. Mobile keeps the same three-part hierarchy with zero horizontal overflow.
- Source checks pass, the panel exists once outside the product figure, all eight tool states remain authored, and v68 localhost assets return HTTP 200.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=68#work`
- Scope boundary: localhost only; production untouched.

## v69 — 2026-08-25 — UnboundPDF sequential capability rows

- Replaced the centered one-tool-at-a-time cycle with the founder-directed Conxto-style row system. Six featured tools occupy permanent horizontal rows inside the right capability panel.
- Rows reveal once from top to bottom with a restrained 120ms stagger and then remain visible. There is no looping centre animation. `43 browser tools` remains the product headline and Workspace remains a small additional footer feature.
- Served desktop QA at 1280×720 confirmed the row sequence progresses from 0 visible through the ordered list and settles with all six rows visible. The final three-part composition is product image → browser-local processing line → capability rows.
- Served mobile QA at 390×844 confirmed the same row hierarchy, all six items visible after the reveal and zero horizontal overflow. CSS braces, row count and localhost HTTP 200 pass.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=69#work`
- Scope boundary: localhost only; production untouched.

## v70 — 2026-08-25 — UnboundPDF causal three-stage reveal

- Re-authored the UnboundPDF landing motion as one scroll-controlled sequence: product box first, browser-local system second, evidence panel third. The stages no longer enter together.
- The system line now draws from top to bottom. A single white light travels with the draw and the four processing nodes reveal progressively as it passes; the light does not loop.
- The evidence panel remains absent until the system completes. Its shell then enters softly before the six featured-tool rows reveal one by one and remain visible.
- Served desktop QA at 1280×720 measured product `0.977` while system and proof remained `0`; mid-system measured `0.415` with a partially clipped line while proof remained `0`; the final state measured a complete line, full panel and six visible rows. The row stagger progresses from zero rows at 120ms to all six settled by 1220ms.
- Served mobile QA at 390×844 confirmed the same product → system → evidence order, all rows settle visible, and horizontal overflow is zero. JavaScript syntax, CSS brace balance and localhost HTTP 200 pass.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=70#work`
- Scope boundary: localhost only; production untouched.

## v71 — 2026-08-25 — Joined four-sided system frame

- Fixed the incomplete outer frame around the UnboundPDF product → system → evidence composition. The stage previously drew only top and bottom rules, leaving the sides visually open.
- Added one continuous four-sided chrome frame above the internal product and evidence cards so the complete three-column system reads as a single enclosed unit without merging its columns.
- Served QA confirmed four 1px solid sides, a 12px desktop / 8px mobile radius, the full 755×596 desktop and 314×354.5 mobile frame, and zero horizontal overflow at 1280×720 and 390×844.
- Review URL: `http://127.0.0.1:4390/ink-paper/?v=71#work`
- Scope boundary: localhost only; production untouched.

## v72 — 2026-08-25 — Remaining-project causal reveal system

- Conxto verified at 1280×720: command center first, route second with a single downward light and four ordered nodes, evidence-bound output panel third. Product-only, partial-line and final-evidence states were measured separately; the joined frame and zero-overflow layout pass.
- Agent Services verified at 1280×720: public Lab first, Contract → Execute → Check → Human gate spine second, private Studio third. Public-only, partial-spine and settled-private states pass inside the joined frame.
- Conxfolio verified at 1280×720: real gallery first, proof-binding route second, founder-review node last. The rejected redundant evidence card remains absent; the final review glow and continuous outer frame pass.
- FarmQuick verified at 1280×720: real catalogue first, D1-first order route second, durable-capture and human-confirmation proof third. Product-only, partial-route and settled-proof states pass.
- VVDexOps verified at 1280×720 after correcting an overlapping legacy full-width rule: public instrument first, Ingest → Commit → Settle route second, dated metrics plus ledger evidence third. Final measured column overlap is zero and the negative-edge truth remains visible.

## v75 — 2026-08-25 — Founder-corrected Conxto and Conxfolio product truth

- Replaced the abstract Conxto portfolio story with the actual Career OS: seven specialist agents, shared user memory, owned job API, owned résumé engine, eligibility gate, résumé + cover-letter tailoring, eval + harness, and review or preference-bounded Autopilot.
- Replaced the narrow Conxfolio workshop story with the complete free suite: 37 résumé templates, cover letter, ATS, 20+ portfolio designs, no signup, all tools free and free portfolio hosting.
- Updated both landing scenes and both dedicated case-study sources so the opening, system trace and long-form chapters no longer contradict one another.
- Served desktop and 390×844 mobile QA passed for both projects with zero horizontal overflow. Landing columns and case-study product/route/outcome columns were measured as non-overlapping.
- Review: `http://127.0.0.1:4390/ink-paper/?v=75#work`; cases: `/ink-paper/cases/conxto/?v=75` and `/ink-paper/cases/conxfolio/?v=75`.
- Localhost only; no product code or production surface changed.

## v77 — 2026-08-25 — Remaining flagship product truth

- Rebuilt Agent Services + Studio around the actual public-Lab/private-control-plane relationship: 37 governed services, brief matching, compiled graphs, harness + evaluation, traces, reviewed memory and retained human authority. The dedicated case names the canonical 2,146-case portfolio harness without presenting it as customer deployment count.
- Reframed FarmQuick as the real VJ Agro Farms B2B supply operation. Peeled garlic leads with the stated capacity of up to 1,000 kg/day; orders are stored in D1 before authenticated n8n routing; stock, price, packing and delivery remain human-confirmed. No online payment, WhatsApp completion or Google Sheets completion is claimed.
- Split VVDexOps into its two honest public products: free no-login BTC/ETH/SOL order-flow instruments across two venues, and a separate 15-minute BTC paper-research ledger with commitments, outcomes, losses, hashes and CSV availability. The dated 22 July 2026 conclusion remains `No edge yet`.
- Preserved the approved black/chrome line-system design. Served visual QA passed at 1280×720 and 390×844 on the landing and all three dedicated cases, with zero horizontal overflow, intact three-column case visuals, working close/next navigation and HTTP 200.
- Review: `http://127.0.0.1:4390/ink-paper/?v=77#work`. Localhost only; production untouched.

## v79 — 2026-08-25 — Real evidence journeys for every flagship

- Extended the approved UnboundPDF proof grammar to Conxto, Agent Services + Studio, Conxfolio, FarmQuick and VVDexOps. Every dedicated case now has four product-owned frames, synchronized editorial chapters, previous/next controls, swipe and keyboard navigation, and selected-frame HD inspection.
- Conxto and Conxfolio use the latest locally verified QA captures. The stale public Conxto marketing surface was not presented as current product proof. Agent Services, FarmQuick and VVDexOps use current public captures dated 25 August 2026.
- Kept the existing black/chrome identity and retained each project's separate system explanation after the real evidence sequence.
- Fixed the shared HD inspection race: advancing to frame 2 now opens frame 2 even when the scroll observer changes during the button interaction, and closing restores the selected chapter.
- Served QA passed for all five cases at 1280×720 and 390×844: four loaded source frames per case, correct second-frame HD selection, sticky mobile evidence stage, restored chapter state and zero horizontal overflow.
- Review: `http://127.0.0.1:4390/ink-paper/cases/conxto/?v=79#evidence`. Localhost only; no production or product repository changed.

## v80 — 2026-08-25 — FarmQuick wholesale evidence correction

- Reframed FarmQuick evidence around exotic vegetable wholesale alongside peeled garlic.
- Removed D1 from the visitor-facing FarmQuick case and replaced the technical route with the actual portfolio-level story: a complete wholesale brief enters the n8n workflow, then people confirm price, packing, availability and delivery.
- Served QA at 1280×720 and 390×844 confirmed the new wholesale language, visible n8n chapter, no D1 text, four working evidence frames and zero horizontal overflow.
- Review: `http://127.0.0.1:4390/ink-paper/cases/farmquick/?v=80#evidence`. Localhost only; production untouched.

## v81 — 2026-08-25 — FarmQuick evidence typography

- Increased the FarmQuick landing workflow labels from 7px to 9px and the evidence copy from 5.5–7px to 6.5–9px without enlarging the project stage.
- Increased the corresponding dedicated-case workflow and proof copy, including proportional mobile adjustments.
- Corrected the landing visual and project summary to exotic vegetable wholesale → n8n workflow → human confirmation; D1 is absent from the served FarmQuick portfolio content.
- Served desktop/mobile checks pass with zero horizontal overflow.

## v84 — 2026-08-25 — Launch-polish scroll and flagship evidence gate

- Repaced Selected Work so each project holds for roughly 1,034–1,040px of desktop scroll before a longer fade-through transition. The incoming project does not become visible until the outgoing project has cleared; the final VVDexOps stage receives a longer closing runway.
- Normalized the small interface typography across the landing scenes and dedicated cases while retaining the approved black/chrome Ink & Paper identity.
- Corrected active portfolio facts: UnboundPDF has 43 tools, Conxto has five specialist agents for this portfolio, Conxfolio is a private product preview, and FarmQuick describes exotic vegetable wholesale through n8n without D1 in visitor-facing copy.
- Agent Services Lab, FarmQuick and VVDexOps use four current 1,440px-wide captures from their live public products. Conxfolio uses four captures from its latest verified localhost journey. Sharp stills were retained instead of compressed video so interface proof remains readable and inspectable in HD.
- Served QA passed across all 18 local routes. At 1280×720 and 390×844 the landing, archive, Ask and four requested cases have zero document overflow; intentional evidence crops remain clipped inside their frames. Each case advances to frame 02, opens the selected image in HD and closes back into the case.
- Review: `http://127.0.0.1:4390/ink-paper/?v=84#work`. Localhost only; nothing deployed.

## v87 — 2026-08-26 — Conxto sequencing and governed closing trace

- Fixed Conxto's real motion defect: as the first sticky project, its sequence previously started behind the outgoing UnboundPDF aperture. The trigger now waits until that aperture has cleared, so visitors see product → vertical route → evidence in order.
- Added a restrained continuing signal to Conxto after its entrance: a light packet travels down the route and a quiet scan passes through the evidence panel without changing the black/chrome brand.
- Replaced the static five-card method grid with one scroll-driven governed trace. Its line draws through Vault, Project Brain, Studio, Harness + Eval Hub and reviewed memory; the active node and receipt change at five equal scroll stages.
- Rebuilt the operator and contact close as one visual sequence: a scanned operator console, progressive capability rows, a human-channel status line, two clear actions and retained live-product links.
- Served QA passed at 1280×720 and 390×844: all five projects appear with no simultaneous project visuals, VVDexOps retains its final runway, all five method states activate, all 13 landing images load, email/Ask links resolve and document overflow is zero. All 18 portfolio routes return HTTP 200.
- Review: `http://127.0.0.1:4390/ink-paper/?v=87#work`. Localhost only; nothing deployed.

## v88 — 2026-08-26 — Balanced hero light field

- Reduced the hero's occasional over-bright hotspot without removing its moving black/chrome light.
- Compressed the shader's peak silver and chrome contribution, lowered ambient lift and applied a soft luminance ceiling only to the brightest values.
- Reduced the small cursor light's peak opacity so it no longer overexposes the field when both effects cross.
- Visually inspected two bright desktop phases and the mobile hero. The motion, texture and cursor response remain visible; headline and method copy retain contrast.
- JavaScript syntax, CSS brace balance, 18/18 local routes and zero desktop/mobile document overflow pass.
- Review: `http://127.0.0.1:4390/ink-paper/?v=88#top`. Localhost only; nothing deployed.

## v90 — 2026-08-26 — Restore soft hero field; restrain only the Ship edge

- Founder rejected V88 because broad highlight compression changed the soft wash into a harder narrow beam.
- Restored the original shader architecture, ambient field, texture, vignette and broad light movement.
- Isolated the true spike to the narrow `Ship` edge contribution and reduced only that edge, plus a gentle high-luminance ceiling and modest cursor reduction.
- Visually inspected the exact Ship phase, a broad-light phase and the 390×844 mobile hero. The original atmospheric movement is back; the Ship core no longer reaches the former white peak.
- JavaScript syntax and zero desktop/mobile document overflow pass.
- Review: `http://127.0.0.1:4390/ink-paper/?v=90#top`. Localhost only; nothing deployed.

## v91 — 2026-08-26 — Broad smoked-glass hero haze

- V90 was still judged visually unchanged because its underlying light geometry remained a collection of bands. V91 replaces that geometry rather than retuning its brightness.
- Rebuilt the Three.js field from three wide, overlapping glass volumes with slow noise-warped motion. Ground, Architect, Evaluate and Ship now change the volumes' position and direction without introducing a narrow beam or white core.
- Cursor movement bends the atmosphere by moving the volumes; it does not add luminance. The separate site cursor light is suppressed while the hero is hovered, preventing stacked light effects.
- A fixed luminance ceiling keeps the graphite/silver field restrained across all phases and pointer extremes.
- Visually inspected all four phases at 1280×720 and the Architect phase at 390×844. WebGL loads, console logs are clean, desktop and mobile document overflow are zero, the hero cursor layer resolves to zero opacity, JavaScript syntax and CSS brace balance pass, and 20/20 local portfolio routes return HTTP 200.
- Snapshot: `snapshots/ink-paper-v91-glass-haze-2026-08-26.tgz` (SHA-256 `d06a9b70abf64d23bfcb227e582b4819532bf4d1b23cdbbb67fbb85a4934951a`).
- Review: `http://127.0.0.1:4390/ink-paper/?v=91#top`. Localhost only; nothing deployed.

## v92 — 2026-08-26 — Restore the vertical chrome ray

- Founder rejected V91's all-over glass haze and confirmed that the vertical strip ray was the stronger visual direction.
- Restored the directional V90 light architecture across Ground, Architect and Evaluate, including the vertical Ship ray.
- Kept the V91 interaction correction that suppresses the separate site cursor glow over the hero, so the ray never stacks with a second white light.
- Made the Ship core slightly wider and reduced its silver/chrome contribution, preserving the ray's identity while softening its peak.
- Visually inspected the desktop Ground and exact Ship states at 1280×720 plus the mobile Ground state at 390×844. WebGL loads, logs are clean, JavaScript syntax and CSS balance pass, and desktop/mobile overflow is zero.
- Review: `http://127.0.0.1:4390/ink-paper/?v=92#top`. Localhost only; nothing deployed.

## v93 — 2026-08-26 — One vertical ray only

- Removed every phase-dependent expanding wash, diagonal field, meeting glow and circular light shape.
- The hero now uses one vertical chrome ray composed only of a restrained core and close halo. It drifts a few pixels horizontally with a slight natural bend but never expands or changes shape.
- Cursor movement can shift the line only marginally and adds no luminance; the separate cursor light remains suppressed over the hero.
- Added an aspect-aware ray position so the same line remains visible on the right side of both desktop and mobile compositions.
- Visually inspected the first and Ship phases at 1280×720 and the 390×844 mobile hero. WebGL loads, logs are clean, JavaScript syntax passes, cursor opacity over the hero is zero and document overflow is zero.
- Review: `http://127.0.0.1:4390/ink-paper/?v=93#top`. Localhost only; nothing deployed.

## v94 — 2026-08-26 — Low-brightness background passage

- Preserved the single vertical chrome ray from V93.
- Added one wide, low-luminance vertical passage behind it. The background shade travels slowly from side to side but never becomes a circle, expanding bloom or separate graphic.
- The passing field contributes only a small fraction of the ray's light and remains below the existing luminance ceiling.
- Visually compared two desktop motion moments at 1280×720 and inspected the 390×844 mobile hero. WebGL loads, logs are clean and document overflow is zero.
- Review: `http://127.0.0.1:4390/ink-paper/?v=94#top`. Localhost only; nothing deployed.

## v95 — 2026-08-26 — Continuous perceptible light passage

- Replaced V94's barely perceptible oscillation with a complete left-to-right traversal that repeats continuously every 14 seconds.
- Widened the moving shade so visitors feel it across a meaningful portion of the hero rather than seeing a tiny secondary strip.
- Increased only the low-range graphite/silver lift. The passing light remains materially dimmer than the fixed vertical chrome ray and stays under the existing highlight ceiling.
- Visually inspected the sweep entering, crossing the center and reaching the later phase at 1280×720, plus a mid-pass state at 390×844. WebGL loads, logs are clean and document overflow is zero.
- Review: `http://127.0.0.1:4390/ink-paper/?v=95#top`. Localhost only; nothing deployed.

## v96 — 2026-08-26 — Remove the disappearing-light interval

- Fixed the V95 startup/loop defect: its left-to-right traversal began and ended outside the hero, producing short intervals with no moving background light.
- Replaced the off-canvas traversal with a slow sine-eased back-and-forth path that begins visibly at the center, remains inside the hero at both extremes and repeats without a jump.
- Preserved the V95 passage width, low brightness and fixed vertical chrome line.
- Visually inspected the immediate-open state and motion extreme at 1280×720 plus the immediate-open state at 390×844. WebGL loads, logs are clean and document overflow is zero.
- Review: `http://127.0.0.1:4390/ink-paper/?v=96#top`. Localhost only; nothing deployed.

## v97 — 2026-08-26 — One purposeful narrative spine

- Turned the hero ray from a decorative light into the portfolio's continuous operating spine.
- During the UnboundPDF opening, the ray now descends into the horizontal `Ship / Proof 01` seam, marks the intersection and shifts toward the real Product → System → Proof route as that route draws.
- Every later project stage receives a short entry stroke aligned to its actual system column. The entry moves to the correct route position for Conxto, Agent Services + Studio, Conxfolio, FarmQuick and VVDexOps instead of using one generic coordinate.
- Re-authored the governed Method SVG so the same spine enters from the top centre, travels cleanly along the frame edge to Intent, then continues through Project Brain, Studio, Harness + Eval Hub and reviewed memory. The path avoids crossing the receipt or node copy.
- Added one signal packet through the operator section and a final vertical-to-horizontal handoff into the `Human channel open` contact terminus.
- Preserved the V96 black/chrome hero, low-brightness background passage, project layouts, content and case routes.
- Served visual QA at 1280×720 covered hero, ray/seam intersection, Unbound route takeover, later project route alignment, Method entry, operator packet and contact terminus. At 390×844 it covered hero, Unbound/Conxto handoff, mobile Method trace and contact terminus. WebGL loads, console logs are clean and document overflow is zero at both sizes.
- Review: `http://127.0.0.1:4390/ink-paper/?v=97#top`. Localhost only; nothing deployed.

## v98 — 2026-08-26 — Revert the rejected narrative spine

- Founder rejected V97 because its added handoff read as a small vertical line entering the composition rather than a premium continuation.
- Removed the complete V97 narrative layer: the UnboundPDF handoff line and label, project-stage entry strokes, altered Method entry path, operator packet and contact terminus.
- Restored the exact V96 markup, motion logic and black/chrome CSS; the only differences from the archived V96 files are V98 cache-busting URLs.
- Served visual QA at 1280×720 and 390×844 confirms the clean V96 hero composition is restored. JavaScript syntax, CSS balance and all 14 primary portfolio routes pass.
- Review: `http://127.0.0.1:4390/ink-paper/?v=98#top`. Localhost only; nothing deployed.

## v101 — 2026-08-26 — UnboundPDF gold-standard proof cinema

- Preserved the approved V98 black/chrome landing and upgraded only the dedicated UnboundPDF case-study benchmark.
- Replaced the low-resolution hero capture and decorative document plane with a real 1,440×900 UnboundPDF workspace capture presented as the primary graphic.
- Rebuilt the evidence chapter as `One document · Four visible states`: Start, Ground, Operate and Verify use real product captures, clean directional wipes and a continuous scroll-controlled move from full context toward the relevant evidence.
- Removed the floating duplicate magnifier. The actual interface remains unobstructed, and `Inspect HD` opens the selected original-resolution frame.
- Added a readable four-state evidence rail and retained keyboard, button and touch-swipe control.
- Fixed two underlying evidence-control races: explicit Previous/Next selection is no longer overwritten during smooth scrolling, and HD inspection now opens the currently visible frame.
- Served visual QA covered desktop hero, proof introduction, all evidence states, controlled camera movement, decisions, delivery and navigation at 1440×900; mobile hero, proof stage, swipe, next/previous and HD inspection at 390×844. Both sizes have zero horizontal overflow, all six images load and browser logs are clean.
- JavaScript syntax, CSS balance and 14/14 primary portfolio routes pass. Review: `http://127.0.0.1:4390/ink-paper/cases/unboundpdf/?v=101`. Localhost only; nothing deployed.

## v103 — 2026-08-26 — Present the complete UnboundPDF product

- Corrected the Workspace-only case-study framing. UnboundPDF now opens as the complete 43-tool browser product, with Workspace positioned as the additional multi-step mode.
- Rebuilt the proof sequence as five distinct chapters: public homepage, the two ways to work, the searchable tools catalogue, one direct tool and the Workspace receipt.
- Added four current 1,440×900 public-product captures from `unboundpdf.com`; retained the existing Document Passport capture only for the final Workspace evidence.
- Fixed duplicate proof-control binding discovered during served QA, so one arrow press advances exactly one chapter and the fifth chapter is reachable.
- Served visual QA covered all five states at 1,440×900 and 390×844, selected-frame HD viewing, final-state button locking and zero horizontal overflow. JavaScript syntax, CSS balance, image dimensions and 14/14 primary routes pass.
- Review: `http://127.0.0.1:4390/ink-paper/cases/unboundpdf/?v=103`. Localhost only; nothing deployed.

## v106 — 2026-08-26 — 2K UnboundPDF evidence and Workspace toolbox

- Replaced every 1,440×900 UnboundPDF case capture with a current 2,151×1,350 product capture, removing the high-DPI upscaling that softened interface text.
- Added the real Workspace toolbox as its own proof chapter before the Document Passport. The sequence is now Home → Two ways → All tools → One tool → Workspace tools → Evidence.
- Reduced broad screenshot enlargement and reserved a controlled, source-safe focus move for the Workspace toolbox and Passport frames.
- Made explicit evidence selection persist until genuine scroll/touch intent, so delayed HD inspection always opens the frame currently selected rather than the previous scroll-derived frame.
- Served QA covered all six chapters at 1,280×720 and 390×844, delayed final-frame HD inspection, 2K natural image dimensions, zero horizontal overflow, JavaScript syntax, CSS balance and 14/14 primary routes.
- Review: `http://127.0.0.1:4390/ink-paper/cases/unboundpdf/?v=106`. Localhost only; nothing deployed.

## v112 — 2026-08-26 — Native UnboundPDF signature and readable product cinema

- Removed the dedicated UnboundPDF screenshot carousel and its zoomed raster presentation. The case hero now uses a crisp native HTML/CSS product signature that explains the two working modes, the 43-tool breadth and the browser-local boundary without pretending a screenshot is a graphic.
- Rebuilt the product proof as six large, full-width scenes: homepage, two ways to work, tools catalogue, direct PDF Editor, Workspace toolbox and Document Passport. Each scene preserves its real 2,151×1,350 interface capture, has its own editorial caption and opens the original-resolution asset on request.
- Eliminated image-scale animation. Scenes use restrained clip and opacity entrances so interface text remains stable and readable instead of becoming softer during motion.
- Added a dedicated mobile composition for the two-way choice: the real One tool and Workspace cards are presented as two focused stacked views rather than a reduced desktop screenshot. Other mobile scenes use bounded source-safe crops, including the Workspace toolbox and Passport.
- Served visual QA at 1,280×720 and 390×844 covered the native hero signature, all six scenes, the desktop and mobile two-mode treatments, Workspace and Passport, original-resolution open/close and zero horizontal overflow. All six images load at 2,151×1,350; JavaScript syntax, CSS balance and 14/14 primary routes pass.
- Review: `http://127.0.0.1:4390/ink-paper/cases/unboundpdf/?v=112`. Localhost only; nothing deployed.

## v113 — 2026-08-26 — Compact swipeable UnboundPDF evidence deck

- Kept all six verified product chapters but replaced the long vertical scene wall with one bounded black/chrome evidence deck. The case now needs one product stage instead of six repeated long-scroll chapters.
- Made the interaction explicit rather than relying on carousel convention: a persistent animated `Swipe / drag` cue, `01 / 06` counter, six named chapter tabs, Previous/Next controls and a plain-language instruction remain visible around the stage.
- Added directional chapter motion without scaling the interface captures. Touch and pointer dragging, keyboard arrow keys, named-tab selection and wrapping Previous/Next navigation all drive the same state model.
- Preserved the six current 2,151×1,350 images and original-resolution viewer. The mobile Choice chapter retains focused stacked One tool and Workspace views inside the same fixed evidence box.
- Served QA at 1,280×720 and 390×844 covered button navigation, a real drag gesture, keyboard navigation, direct Evidence selection, 06→01 wrapping, active/hidden slide state and the correct 2,151×1,350 Passport original. Both sizes have zero horizontal overflow; JavaScript syntax, CSS balance and 14/14 primary routes pass.
- Review: `http://127.0.0.1:4390/ink-paper/cases/unboundpdf/?v=113`. Localhost only; nothing deployed.

## v114 — 2026-08-26 — Compact UnboundPDF narrative and one-screen deck

- Reduced the UnboundPDF outcome block from a large statement wall to a 226px desktop chapter: the main line now renders at 35.8px on the 1,280px reference viewport and 29px on mobile, with tighter padding and supporting-copy spacing.
- Reduced the evidence introduction to a 159px desktop block. Its headline now renders at 46px desktop and 32px mobile, with less space before the interactive proof.
- Rebuilt the swipe scene as a one-screen composition rather than a tall card: chapter explanation sits on the left and the complete source image sits on the right at desktop. The evidence deck measures 616px high and fits completely between y=92 and y=708 in a 1,280×720 viewport.
- Mobile retains the focused crop treatment but the complete deck, including guidance, chapters, image, caption and controls, fits between y=92 and y=832 in a 390×844 viewport.
- Served visual QA covered the compact outcome/introduction, complete desktop/mobile deck geometry and a real mobile swipe after the layout change. Both sizes have zero horizontal overflow; JavaScript syntax, CSS balance and 14/14 primary routes pass.
- Review: `http://127.0.0.1:4390/ink-paper/cases/unboundpdf/?v=114`. Localhost only; nothing deployed.

## v115 — 2026-08-26 — Real image-surface swipe fix

- Fixed the interaction source rather than changing the controls: browser-native image dragging could intercept a mouse or finger gesture begun directly on the product screenshot before the deck received its release event.
- Disabled native dragging and selection on every evidence image. Mouse and pen retain pointer capture; touch now has a dedicated start/move/end path that prevents default behavior only after movement is clearly horizontal, preserving normal vertical page scrolling.
- Served desktop QA dragged directly across the product image from x=1100 to x=600 and advanced Product 01 → Choice 02. Served 390×844 QA dragged directly across the mobile image from x=335 to x=55 and also advanced 01 → 02 with zero overflow.
- JavaScript syntax, CSS balance and 14/14 primary routes pass. Review: `http://127.0.0.1:4390/ink-paper/cases/unboundpdf/?v=115`. Localhost only; nothing deployed.

## v116 — 2026-08-26 — Horizontal trackpad swipe support

- Identified the remaining input mismatch: macOS two-finger trackpad swipes arrive as horizontal wheel deltas, not pointer or touch events. V115 therefore fixed direct drag and finger handling but did not respond to this third input class.
- Added accumulated horizontal-wheel intent with a direction threshold and transition lock. The handler ignores vertical-dominant movement and the mobile chapter rail, preventing accidental chapter changes or trapped page scrolling.
- Served verification sent a horizontal trackpad gesture (`scrollX: 240`) over the screenshot and advanced Product 01 → Choice 02. A vertical gesture (`scrollY: 180`) over the same coordinates moved the document from y=1105 to y=1285 while the chapter remained 02.
- JavaScript syntax, CSS balance and 14/14 primary routes pass. Review: `http://127.0.0.1:4390/ink-paper/cases/unboundpdf/?v=116`. Localhost only; nothing deployed.

## v117 — 2026-08-26 — Connected UnboundPDF closing receipt

- Replaced the generic large-card ending with one connected black/chrome operating receipt while preserving every decision, limitation, ownership fact, stack item, link and status.
- Decisions now share a compact three-column rail with one slow chrome proof-line pass. The Honest boundary is the rail's immediate footer rather than a separate rounded box.
- Proof and ownership is a four-column ledger connected directly beneath the boundary. Desktop decision, boundary and ownership blocks measure 311px, 64px and 294px with effectively zero gap between them.
- Reduced the final case navigation to a 94px two-way handoff. Mobile uses three decision rows, a compact boundary row, four ledger rows and an 84px two-column Close/Next control rather than stacked large cards.
- Served visual QA at 1,280×720 and 390×844 covered the complete ending and navigation. Both sizes have zero horizontal overflow; JavaScript syntax, CSS balance and 14/14 primary routes pass.
- Review: `http://127.0.0.1:4390/ink-paper/cases/unboundpdf/?v=117`. Localhost only; nothing deployed.
