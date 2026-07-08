# SEIS Plugin Stack

SEIS uses installed and enabled Codex plugins as the operating layer for the
open-source platform. The current audited registry is
`data/installed-codex-plugins-2026-06-15.json`, with the reader-facing
operating model in `docs/platform/installed-plugin-operating-model.md`.

## OpenAI-First Policy

For core SEIS work, prioritize OpenAI/Codex plugin families first:
`openai-curated`, `openai-bundled`, and `openai-primary-runtime`.
`seis-ai-agent@seis-repo` coordinates repo context, migration safety, lane
routing, and SEIS-Agent consolidation. External or non-installed plugin URI
families are fallback paths unless the user explicitly asks for that provider.

Policy records:

- `docs/platform/openai-first-plugin-policy.md`
- `data/openai-plugin-priority-2026-06-05.json`

## Audit Snapshot

| Metric | Value |
|---|---:|
| Audit date | 2026-06-15 |
| Installed and enabled plugins after SEIS consolidation | 186 |
| Not installed plugins after SEIS consolidation | 10 |
| Canonical SEIS plugin | `seis-ai-agent@seis-repo` |
| Legacy SEIS mirror | `seis@personal` compatibility only |

## 2026-06-29 Major Platform Skill Pass

SEIS now has a companion inventory for Google ecosystem and major technology
platform MCP, skill, plugin, and connector coverage:

- `docs/platform/big-tech-mcp-skill-inventory.md`
- `content/development/seis-big-tech-mcp-skill-inventory.json`

The pass installed curated local Codex skills for OpenAI, GitHub, Figma,
Cloudflare, Vercel, Netlify, Render, Linear, Sentry, Microsoft app frameworks,
Jupyter, Notion, PDF/screenshot/speech/transcription, Playwright, and security
review support. Google Workspace MCP coverage remains Gmail, Calendar, Drive,
Docs, Sheets, and Slides. BigQuery appeared as an installable connector
candidate, but user confirmation did not complete. Google Cloud, Firebase,
Gemini, Vertex AI, YouTube, Google Ads, Chat, Tasks, Keep, and Forms remain
planned or approval-gated until specific callable connectors are available and
verified. Apple coverage is through local `Xcode.app`, XcodeBuildMCP, and
Build iOS/macOS skills. After the follow-up install pass, the official Kimi
Code CLI is installed and verified, SEIS has Kimi project-local MCP and Skill
config, Claude Desktop and Claude Code CLI are installed, and Claude Code lists
the SEIS plus XcodeBuildMCP project MCP servers as pending user approval. Kimi
provider login, Kimi marketplace plugin installation, and Claude MCP approval
remain explicit user-owned actions.

Development-focus rules for using these plugin and MCP lanes without overclaiming
authentication or live readiness are maintained in
`docs/platform/mcp-plugin-development-focus.md`.

## Priority Categories

| Category | Primary OpenAI/Codex plugins |
|---|---|
| Design | `build-web-apps@openai-curated`, `browser@openai-bundled`, `chrome@openai-bundled`, `figma@openai-curated`, `canva@openai-curated`, `magicpath@openai-curated`, `wix@openai-curated`, `base44@openai-curated`, `hostinger@openai-curated`, `replit@openai-curated`, `lovable@openai-curated` |
| Developer tools | `github@openai-curated`, `coderabbit@openai-curated`, `circleci@openai-curated`, `cloudflare@openai-curated`, `vercel@openai-curated`, `netlify@openai-curated`, `supabase@openai-curated`, `neon-postgres@openai-curated`, `convex@openai-curated`, `render@openai-curated`, `temporal@openai-curated`, `openai-developers@openai-curated`, `expo@openai-curated`, `build-ios-apps@openai-curated`, `build-macos-apps@openai-curated`, `test-android-apps@openai-curated` |
| Productivity | `google-drive@openai-curated`, `google-calendar@openai-curated`, `gmail@openai-curated`, `slack@openai-curated`, `teams@openai-curated`, `sharepoint@openai-curated`, `outlook-email@openai-curated`, `outlook-calendar@openai-curated`, `notion@openai-curated`, `box@openai-curated`, `documents@openai-primary-runtime`, `spreadsheets@openai-primary-runtime`, `presentations@openai-primary-runtime`, `linear@openai-curated`, `atlassian-rovo@openai-curated`, `asana@openai-curated`, `calendly@openai-curated`, `zoom@openai-curated` |
| Research | `hugging-face@openai-curated`, `life-science-research@openai-curated`, `zotero@openai-curated`, `scite@openai-curated`, `ngs-analysis@openai-curated`, `deepnote@openai-curated`, `quartr@openai-curated`, `factset@openai-curated`, `lseg@openai-curated`, `s-p@openai-curated`, `morningstar@openai-curated`, `moody-s@openai-curated`, `dow-jones-factiva@openai-curated` |
| Security | `codex-security@openai-curated`, `sentry@openai-curated`, `datadog@openai-curated`, `coderabbit@openai-curated`, `jam@openai-curated`, `semrush@openai-curated`, `conductor@openai-curated`, `statsig@openai-curated` |

## Platform Lanes

| Lane | Installed plugins |
|---|---|
| Repository and governance | `seis-ai-agent@seis-repo`, `github@openai-curated`, `coderabbit@openai-curated`, `circleci@openai-curated`, `codex-security@openai-curated`, `superpowers@openai-curated`, `plugin-eval@openai-curated` |
| Android and iOS mobile | `expo@openai-curated`, `test-android-apps@openai-curated`, `build-ios-apps@openai-curated` |
| Web and design | `build-web-apps@openai-curated`, `browser@openai-bundled`, `chrome@openai-bundled`, `figma@openai-curated`, `canva@openai-curated`, `magicpath@openai-curated`, `wix@openai-curated`, `base44@openai-curated`, `hostinger@openai-curated`, `replit@openai-curated`, `lovable@openai-curated` |
| macOS desktop | `build-macos-apps@openai-curated` |
| Full-stack, backend, deploy | `convex@openai-curated`, `supabase@openai-curated`, `neon-postgres@openai-curated`, `vercel@openai-curated`, `netlify@openai-curated`, `cloudflare@openai-curated`, `render@openai-curated`, `temporal@openai-curated`, `quicknode@openai-curated`, `yepcode@openai-curated` |
| Data analytics and visualization | `build-web-data-visualization@openai-curated`, `deepnote@openai-curated`, `spreadsheets@openai-primary-runtime`, `motherduck@openai-curated`, `metabase@openai-curated`, `mixpanel@openai-curated`, `mixpanel-headless@openai-curated`, `thoughtspot@openai-curated`, `posthog@openai-curated`, `cube@openai-curated`, `coupler-io@openai-curated`, `alation@openai-curated`, `omni-analytics@openai-curated`, `daloopa@openai-curated` |
| Workspace and communications | `google-drive@openai-curated`, `google-calendar@openai-curated`, `gmail@openai-curated`, `slack@openai-curated`, `teams@openai-curated`, `sharepoint@openai-curated`, `outlook-email@openai-curated`, `outlook-calendar@openai-curated`, `notion@openai-curated`, `box@openai-curated`, `documents@openai-primary-runtime`, `presentations@openai-primary-runtime`, `linear@openai-curated`, `atlassian-rovo@openai-curated`, `asana@openai-curated`, `calendly@openai-curated`, `zoom@openai-curated`, `egnyte@openai-curated`, `readwise@openai-curated`, `mem@openai-curated`, `granola@openai-curated`, `fireflies@openai-curated`, `otter-ai@openai-curated`, `circleback@openai-curated`, `superhuman@openai-curated`, `streak@openai-curated` |
| Observability, quality, security | `sentry@openai-curated`, `datadog@openai-curated`, `codex-security@openai-curated`, `coderabbit@openai-curated`, `jam@openai-curated`, `semrush@openai-curated`, `conductor@openai-curated`, `statsig@openai-curated`, `brand24@openai-curated`, `similarweb@openai-curated` |
| AI, media, research | `hugging-face@openai-curated`, `life-science-research@openai-curated`, `zotero@openai-curated`, `remotion@openai-curated`, `game-studio@openai-curated`, `fal@openai-curated`, `heygen@openai-curated`, `hyperframes@openai-curated`, `nvidia@openai-curated`, `shutterstock@openai-curated`, `cloudinary@openai-curated`, `latex@openai-bundled`, `biorender@openai-curated`, `picsart@openai-curated`, `scite@openai-curated`, `ngs-analysis@openai-curated` |
| Business, GTM, finance, and operations | `airtable@openai-curated`, `hubspot@openai-curated`, `apollo@openai-curated`, `clay@openai-curated`, `common-room@openai-curated`, `zoominfo@openai-curated`, `close@openai-curated`, `outreach@openai-curated`, `pipedrive@openai-curated`, `shopify@openai-curated`, `stripe@openai-curated`, `quickbooks@openai-curated`, `brex@openai-curated`, `carta-crm@openai-curated`, `docusign@openai-curated`, `signnow@openai-curated`, `factset@openai-curated`, `lseg@openai-curated`, `s-p@openai-curated`, `quartr@openai-curated`, `morningstar@openai-curated`, `moody-s@openai-curated`, `dow-jones-factiva@openai-curated`, `pitchbook@openai-curated`, `cb-insights@openai-curated`, `alpaca@openai-curated`, `binance@openai-curated` |

## Google Workspace Links

- Operating plan: https://docs.google.com/document/d/1EvyhGA4ulJHsEB2DCzZAYxDrUv1X6dGj0PFa0splrps
- Platform backlog: https://docs.google.com/spreadsheets/d/1sxnxOz9ZRzwZAz2FmHt_3YzAhQjKL2sQbYR1uWdGsaQ
- Installed plugin operating model: https://docs.google.com/document/d/10A-Ld9TBu6HSsB0W1dJ3p6Y14Hqr3VMLeMgYJ89mX64

## Rules

- Use OpenAI/Codex plugin families first for core SEIS work.
- Use installed and enabled plugins before any non-installed or externally mentioned URI family.
- Keep SEIS repo docs as source of truth after external tool actions.
- Do not treat a mentioned plugin URI as installed unless it appears in the audited registry.
- Keep Google Workspace artifacts mirrored in `integrations/google-workspace.json`.
- Avoid deleting old repositories or refs from plugin workflows unless SEIS import gates pass.
