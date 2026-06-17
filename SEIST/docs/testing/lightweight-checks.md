# Lightweight Checks

## Local Checks

Use:

```bash
npm run check:foundation
npm run check:release-sync
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

## Deferred Heavy Checks

Run full Lighthouse, bundle analysis, and WebGL profiling only after the production framework and 3D implementation are selected.
