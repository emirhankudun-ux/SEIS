# Lightweight Checks

## Local Checks

Use:

```bash
npm run check:foundation
npm run check:release-sync
npm run check:plugin-interface-roadmap
npm run check:seis-code
npm run check:video-hero-showcase
npm run check:mythic-gacha
npm run check:data-schema-registry
npm run quality
```

These checks avoid production builds and broad indexing.

## Browser Smoke Test

Serve statically only when visual verification is needed:

```bash
python3 -m http.server 4174 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4174/apps/web/index.html
```

Expected:

- no console errors
- hero canvas renders
- low-motion toggle works
- artwork grid renders 20 curated assets
- navigation anchors move to sections
- locale routes render after `npm run check:release-sync`
- service worker is present in the static package

For the plugin interface suite, expected:

- `#plugin-interfaces` is reachable from primary navigation
- all five lane tabs select a different detail state
- evidence links render for each selected lane
- the five-year horizon shows 2026, 2027, 2028, 2029, and 2030
- the year controls switch the development program without page errors
- the program rows switch the active plugin lane
- mobile layout has no horizontal overflow

For SEIS Code, expected:

- `/apps/web/seis-code.html` loads the browser IDE shell
- the eight top menus open and trigger real local actions
- all five activity views switch panels
- the editor uses Monaco when the CDN is available and textarea fallback when it is not
- terminal commands operate on the browser virtual file system only
- `claude` enters a clearly labeled Local Demo REPL, not a live Anthropic session
- files, command history, extensions, and session state persist through IndexedDB

For Video Hero showcase pages, expected:

- all four themes load with a video or CSS fallback
- pause, mute, fullscreen, CTA scroll, and next-theme links respond
- reduced-motion users get the still fallback behavior
- manifest provenance remains visible in `apps/web/showcase/video-heroes.json`

Latest evidence is recorded in `docs/reviews/VIDEO_HERO_SHOWCASE_QA.md`. The
current browser smoke used no-install Chrome DevTools because the in-app Browser
could read and screenshot the routes but timed out on low-level click dispatch.

For Mythic Gacha, the lightweight check validates the no-key draw route,
IndexedDB hooks, local atlas, and SEIS Code `/workspace/MythicArchive` export
bridge. Browser QA still needs to cover draw, filter, favorite, export, reset,
and refresh-persistence interactions.

## Deferred Heavy Checks

Run full Lighthouse, bundle analysis, and WebGL profiling only after the production framework and 3D implementation are selected.
