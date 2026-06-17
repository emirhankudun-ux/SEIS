# Web Lane

The Web lane contains two browser surfaces:

- `index.html`, `style.css`, and `script.js` power the public portfolio/site
  surface checked by `npm run seis:check`.
- `seis-cockpit.html`, `styles.css`, and `app.js` power the SEIS cockpit/release
  shell checked by `npm run check:workspace` and copied into `release/web/`.

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
