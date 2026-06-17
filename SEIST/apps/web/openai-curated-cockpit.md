# SEIS Web Cockpit Build Contract

Date: 2026-06-05

The web cockpit is the first build module for the OpenAI-curated SEIS workflow. It should be an app-first operational interface, not a marketing page.

## OpenAI/Codex Route

- Build: `build-web-apps@openai-curated`
- Inspect: `browser@openai-bundled`, `chrome@openai-bundled`
- Design assets: `figma@openai-curated`, `canva@openai-curated`, `magicpath@openai-curated`
- Publish readiness: `github@openai-curated`, `vercel@openai-curated`, `netlify@openai-curated`, `cloudflare@openai-curated`
- Review/security: `coderabbit@openai-curated`, `codex-security@openai-curated`, `sentry@openai-curated`, `datadog@openai-curated`

## First Screen Panels

| Panel | Data source | Purpose |
|---|---|---|
| Branch status | GitHub refs: `main`, `UIXAppTTR` | Show whether the visible and default branches are mirrored. |
| Plugin status | `data/installed-codex-plugins-2026-06-05.json` | Show installed count, missing count, OpenAI-first status, and active lanes. |
| Build workbench | `data/openai-curated-build-workbench-2026-06-05.json` | Show module order and current sprint state. |
| Workspace ops | `integrations/google-workspace.json` | Link Drive plan, Sheet backlog, Calendar review, and plugin operating model. |
| Source safety | zip inventory and repo visibility data | Show deletion gate, zip import status, and invisible repo notes. |
| Security gate | `docs/platform/openai-first-plugin-policy.md` plus future `docs/security` files | Show whether security/review/deploy gates are ready. |

## Interaction Rules

- Keep controls dense and operational.
- Prefer direct status tables and lane navigation over hero/marketing layout.
- Do not show destructive actions until migration and deletion gates are verified.
- Keep cards shallow; do not nest cards inside cards.
- Use icons for repeated actions once implementation starts.

## Implementation Shape

Recommended first shell:

- Vite or Next.js app under `apps/web`.
- Shared status types in `packages/core`.
- Shared compact UI primitives in `packages/ui`.
- JSON-backed static prototype first, live APIs later.

## First Code Milestone

Create a static cockpit that reads local SEIS JSON records at build time and renders:

1. Top status bar: branch sync, installed plugin count, governance status.
2. Left navigation: Repository, Plugins, Workspace, Build, Security, Research.
3. Main grid: branch status, plugin lanes, workbench modules, workspace links.
4. Footer status: closed-code, no-deploy, no-delete-before-verified gates.
