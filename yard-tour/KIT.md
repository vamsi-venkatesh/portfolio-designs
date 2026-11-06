# The Yard — art kit (2026-09-03)

Reference: Clash of Clans village view, builder, builder's hut, loading drop. Adapted to our
warm-paper ink world (the accepted Machine style): the shapes and the liveliness are Clash's,
the surface is ours. Nothing here is blue.

## Camera
- Three-quarter view from slightly above (about 30° down). Every building shows its front AND its roof.
- Ground is a tilted plane: paths are flattened ellipses/bands, never straight lines.
- The world is one long horizontal strip, 720 units tall. Ground line y=600. Sky above y=380 is paper.
- Three depth layers with parallax: far 0.3× (hills, sun, fog bands), mid 1× (buildings, bots,
  paths, cards), near 1.5× (fence, grass, dropped tools, fog wisps).

## Forms (Clash rules, our ink)
- Chunky and rounded. Roofs oversized (roof ≥ 1.3× wall width), doors small, walls short.
- Every building sits on a foundation plinth and casts one ellipse shadow to the lower right (ink at 13%).
- Wood is planks with visible nails; stone is rounded blocks; cloth sags. Corners are radiused.
- Props everywhere, all meaning something: crates = work in transit, lantern = live, scaffold =
  building, chain and wax seal = sealed, closed gate = private.

## Characters
- Bots: 2.5 heads tall, big head, small body, big hands. The accepted Machine bot design, plus a
  mustard hard hat and a tool belt. Three colours: green, red, mustard. Eyes glow in the bot's colour.
- The chief (Vamsi): the accepted kiosk human — round face, dark hair, green jumper, red mug.
- Walk cycle: 0.55 s, legs swing ±22° from the hip, body bobs 4 units, arms counter-swing. Carrying
  pose: both arms forward, no arm swing, bob halved.
- Idle: blink every ~2 s, occasional look-up, hammer taps at the scaffold.

## Light and colour
- One sun, top-left. Three tones per colour: light (top faces), mid (fronts), shadow (right sides).
- Palette: paper #f6efe1 · paper2 #efe6d4 · ink #221f1c · red #d9503a · mustard #e6a52e ·
  green #3f8a5f · clay #b7714a · brass gradient. Hills: two paper tones. Hay: mustard. Hedges: green.
- Ink outline 6 units on mid layer, 5 on near, 4 on far. Highlights: white at 30%, a single stroke.
- Fog: radial-gradient ellipses (no blur filters), 3 speeds, thickest between stops, thins at a stop.

## Motion
- Pop-in: scale 0 → 1.08 → 1 in 420 ms with two dust puffs. Buildings pop in order of distance.
- Sign drop: falls on chains, overshoots 6°, settles.
- Smoke: three puffs looping 3.2 s, rising 40 units, fading.
- Flags: skew ±6° at 1.8 s.
- Parallax + fog drift are transform-only (translate3d). No layout animation.
- Reduced motion: end states set directly; the world still pans with scroll.

## Laws carried in
- Placement on a wrapper `<g>`, animation on the child (a CSS transform overrides the attribute).
- WAAPI keyframes are CSS syntax (`translate(10px, 0)`), never SVG's unitless form.
- One owning animation per transform property; never cancel stacks to restore a pose.
- Verify from the RENDERED frame, not the file.
