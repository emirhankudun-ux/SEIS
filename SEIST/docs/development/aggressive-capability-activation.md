# SEIS Aggressive Capability Activation

SEIS can move quickly without activating every external surface blindly. The
aggressive mode is a registry-first operating model: apps, skills, connectors,
MCP servers, cloud providers, and server upload lanes are connected as contracts
first, then used live only when the mission, auth, target, and rollback path are
clear.

## Active Contract

- Map: `content/development/aggressive-capability-map.json`
- Plugin catalog: `content/development/plugin-capability-catalog.json`
- Trusted marketplace intake: `content/development/trusted-marketplace-intake.json`
- Local Codex plugin bridge: `content/development/seis-trusted-marketplace-plugin.json`
- Validator: `npm run check:aggressive-capability-map`
- Workspace automation: `seis-agresif-kod-gelistirme-ve-yayin`

## Lanes

- GitHub shipment: rebase-safe publication to `UIXAppTTR`.
- Cloud environment: provider-neutral deployment planning for GitHub Pages,
  Cloudflare Pages, Vercel, Netlify, Docker static, Azure Static Web Apps,
  AWS Amplify static, Firebase Hosting, and server handoff.
- Design and browser quality: local UI validation, Figma handoff, responsive
  review, and motion checks.
- Connector and MCP governance: use visible tools through mission routing, not
  blanket OAuth calls.
- Polyglot language presence: many small language contracts without dependency
  bloat.

## Plugin, MCP, and Skill Hub

Requests to use all plugins, MCP servers, connectors, and skills are interpreted
as activation-hub work. SEIS should expose every available capability through a
registry, then activate only the smallest relevant set for the current task.

The safe routing order is:

1. Identify the task intent.
2. Match the repo surface and capability family.
3. Confirm auth, target, approval, and rollback path.
4. Run the local quality gate.
5. Use the live connector, MCP tool, plugin, or skill only if it is still needed.

This keeps powerful surfaces available without turning the workspace into a
blanket OAuth, broad-scan, or remote-write session.

## Trusted Marketplace Intake

Marketplace work starts as curation, not live installation. The intake file
tracks GitHub Marketplace Actions, GitHub Marketplace Apps, GitHub MCP Registry,
GitHub Models, Awesome GitHub Copilot, and retired Copilot Extension paths as
separate channels.

The preferred SEIS path is the GitHub MCP Registry for AI tool integrations,
because it keeps integrations portable across compatible agent hosts. GitHub
Marketplace Actions and Apps remain publication candidates only after the
feature has a separate public action repository or a real GitHub App surface.

The personal Codex plugin bridge lives in
`content/development/seis-trusted-marketplace-plugin.json`. It binds the local
`seis-trusted-marketplace` plugin to the `UIXAppTTR` branch, the personal
marketplace file, and the repo quality gates so the designer-facing plugin card
and source-governed marketplace records move together.

Designer-facing review lives in
`docs/development/trusted-marketplace-intake.md`; the lightweight quality gate
is:

```bash
npm run check:trusted-marketplace-intake
npm run check:seis-trusted-marketplace-plugin
```

## Catalog Families

The plugin catalog groups the requested ecosystem into governed families:

- builder and hosting
- design, media, and creative production
- product analytics and observability
- repository, DevOps, quality, and security
- data, database, AI, and infrastructure
- go-to-market, sales, market intelligence, and SEO
- collaboration, knowledge, and document workflows
- app platform, commerce, mobile, and SDK development
- specialized research and utilities

This allows SEIS to improve the branch using the user's full plugin universe as
architecture input while keeping live use proportional to the mission.

## Live Readiness Matrix

The map separates ready surfaces from gated surfaces:

- ready: GitHub CLI publication after clean preflight.
- ready when target is known: Browser and local UI validation.
- target required: Figma design handoff.
- candidate: Playwright, Output.ai workflows, Semgrep, Aikido, SonarQube.
- auth and approval gated: cloud hosting, Notion, Linear, Google Drive, Slack,
  and other write-capable connectors.
- registry ready: plugin, MCP, and skill routers, which select capabilities by
  mission family before live use.

## Server Rule

Live server upload stays blocked until a concrete provider or server target is
selected and secrets are stored outside the repository. Until then, the safe
command is:

```bash
npm run server-upload:dry-run
```

## Why This Shape

This keeps the repo aggressive in capability growth while preserving source
clarity, rollback safety, and humane low-pressure execution.
