# Web Lane

The Web lane contains the static browser product surfaces for the current SEIS
product-experience suite:

- `index.html`, `style.css`, and `script.js` power the public portfolio/site
  surface checked by `npm run seis:check`.
- `seis-cockpit.html`, `styles.css`, and `app.js` power the SEIS cockpit/release
  shell checked by `npm run check:workspace` and copied into `release/web/`.
- `desktop.html`, `desktop.css`, and `desktop.js` power the SEIS Desktop OS
  foundation checked by `npm run check:desktop-os` and
  `npm run check:desktop-os-browser-smoke`. Desktop-created `/home/seis`
  files are mirrored into the SEIS Code IndexedDB workspace under
  `/workspace` for the current browser-local handoff.
- `seis-code.html`, `seis-code.css`, and `seis-code.js` power the browser IDE
  foundation checked by `npm run check:seis-code` and
  `npm run check:product-experience-browser-smoke`.
- `mythic-gacha.html`, `mythic-gacha.css`, and `mythic-gacha.js` power the
  no-key gacha foundation checked by `npm run check:mythic-gacha`.
- `showcase/*.html`, `video-hero.css`, and `video-hero.js` power the cinematic
  Video Hero showcase checked by `npm run check:video-hero-showcase`,
  `npm run check:video-hero-performance-budget`, and
  `npm run check:video-hero-browser-smoke`.

## Initial Direction

- prefer an app-first interface, not a marketing landing page
- use dense, operational layouts for repository, data, plugin, and platform work
- keep shared UI in `packages/ui`
- keep shared product rules in `packages/core`
- build from [`openai-curated-cockpit.md`](./openai-curated-cockpit.md)

## OpenAI/Codex Plugin Stack

- Build Web Apps
- Browser
- Chrome
- Figma
- Canva
- MagicPath
- GitHub
- Vercel
- Netlify
- Cloudflare
- CodeRabbit
- Codex Security
- SEIS plugin

## First Build Tasks

1. Establish a Vite or Next.js app shell.
2. Add the SEIS cockpit first screen from `openai-curated-cockpit.md`.
3. Render plugin registry and workbench JSON from `data/`.
4. Add Drive/Calendar status cards from `integrations/google-workspace.json`.
5. Add repository visibility and source-branch panels.
6. Add data dashboard and security gate entry points.

## First Screen Panels

- branch status
- plugin status
- build workbench
- workspace ops
- source safety
- security gate
