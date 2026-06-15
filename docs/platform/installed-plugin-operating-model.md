# SEIS Installed Plugin Operating Model

Date: 2026-06-05

Google Drive companion document: https://docs.google.com/document/d/10A-Ld9TBu6HSsB0W1dJ3p6Y14Hqr3VMLeMgYJ89mX64

SEIS uses installed and enabled Codex plugins first. Mentioned plugin URIs are
not treated as active unless they appear as installed and enabled in
`data/installed-codex-plugins-2026-06-15.json`.

## Summary

- Installed and enabled plugins after SEIS consolidation audit: 186
- Not installed plugins after SEIS consolidation audit: 10
- Canonical SEIS plugin: `seis-ai-agent@seis-repo`
- Legacy SEIS mirror: `seis@personal` compatibility only
- Duplicate SEIS lane cards: not installed by default
- Canonical repository: `emirhankudun-ux/SEIS`
- Primary plugin policy: OpenAI-first

## OpenAI-First Rule

For core SEIS work, use OpenAI/Codex plugin families first: `openai-curated`, `openai-bundled`, and `openai-primary-runtime`. Use external or non-installed plugin URI families only when the OpenAI/Codex route cannot satisfy the request or the user explicitly asks for that provider.

Policy records:

- `docs/platform/openai-first-plugin-policy.md`
- `data/openai-plugin-priority-2026-06-05.json`

## Priority Categories

| Category | Primary OpenAI/Codex route |
|---|---|
| Design | Build Web Apps, Browser, Chrome, Figma, Canva, MagicPath, Wix, Base44, Hostinger, Replit, Lovable. |
| Developer tools | GitHub, CodeRabbit, CircleCI, Cloudflare, Vercel, Netlify, Supabase, Neon Postgres, Convex, Render, Temporal, OpenAI Developers, Expo, Build iOS Apps, Build macOS Apps, Test Android Apps. |
| Productivity | Google Drive, Google Calendar, Gmail, Slack, Teams, SharePoint, Outlook, Notion, Box, Documents, Spreadsheets, Presentations, Linear, Atlassian Rovo, Asana, Calendly, Zoom. |
| Research | Hugging Face, Life Science Research, Zotero, Scite, NGS Analysis, Deepnote, Quartr, FactSet, LSEG, S&P, Morningstar, Moody's, Dow Jones Factiva. |
| Security | Codex Security, Sentry, Datadog, CodeRabbit, Jam, Semrush, Conductor, Statsig. |

## Platform Lanes

| Lane | Primary installed plugins | Purpose |
|---|---|---|
| Repository and governance | `seis-ai-agent@seis-repo`, `github@openai-curated`, `coderabbit@openai-curated`, `circleci@openai-curated`, `codex-security@openai-curated`, `superpowers@openai-curated`, `plugin-eval@openai-curated` | Keep SEIS as the single source of truth, review changes, run governance, and protect deletion gates. |
| Android and iOS mobile | `expo@openai-curated`, `test-android-apps@openai-curated`, `build-ios-apps@openai-curated` | Build, test, and organize mobile app work under SEIS. |
| Web and design | `build-web-apps@openai-curated`, `browser@openai-bundled`, `chrome@openai-bundled`, `figma@openai-curated`, `canva@openai-curated`, `magicpath@openai-curated`, `wix@openai-curated`, `base44@openai-curated`, `hostinger@openai-curated`, `replit@openai-curated`, `lovable@openai-curated` | Build web apps, inspect local UI, coordinate design assets, and prototype sites/apps. |
| macOS desktop | `build-macos-apps@openai-curated` | Build and validate macOS app work. |
| Full-stack, backend, deploy | `convex@openai-curated`, `supabase@openai-curated`, `neon-postgres@openai-curated`, `vercel@openai-curated`, `netlify@openai-curated`, `cloudflare@openai-curated`, `render@openai-curated`, `temporal@openai-curated`, `quicknode@openai-curated`, `yepcode@openai-curated` | Run backend, database, API, deployment, workflow, and programmable automation infrastructure. |
| Data analytics and visualization | `build-web-data-visualization@openai-curated`, `deepnote@openai-curated`, `spreadsheets@openai-primary-runtime`, `motherduck@openai-curated`, `metabase@openai-curated`, `mixpanel@openai-curated`, `mixpanel-headless@openai-curated`, `thoughtspot@openai-curated`, `posthog@openai-curated`, `cube@openai-curated`, `coupler-io@openai-curated`, `alation@openai-curated`, `omni-analytics@openai-curated`, `daloopa@openai-curated` | Analyze SEIS data, build dashboards, create reporting artifacts, and connect business intelligence sources. |
| Workspace and communications | `google-drive@openai-curated`, `google-calendar@openai-curated`, `gmail@openai-curated`, `slack@openai-curated`, `teams@openai-curated`, `sharepoint@openai-curated`, `outlook-email@openai-curated`, `outlook-calendar@openai-curated`, `notion@openai-curated`, `box@openai-curated`, `documents@openai-primary-runtime`, `presentations@openai-primary-runtime`, `linear@openai-curated`, `atlassian-rovo@openai-curated`, `asana@openai-curated`, `calendly@openai-curated`, `zoom@openai-curated`, `egnyte@openai-curated`, `readwise@openai-curated`, `mem@openai-curated`, `granola@openai-curated`, `fireflies@openai-curated`, `otter-ai@openai-curated`, `circleback@openai-curated`, `superhuman@openai-curated`, `streak@openai-curated` | Keep planning, documents, meetings, tasks, mail, and collaboration connected to SEIS. |
| Observability, quality, security | `sentry@openai-curated`, `datadog@openai-curated`, `codex-security@openai-curated`, `coderabbit@openai-curated`, `jam@openai-curated`, `semrush@openai-curated`, `conductor@openai-curated`, `statsig@openai-curated`, `brand24@openai-curated`, `similarweb@openai-curated` | Inspect runtime issues, quality signals, SEO, analytics, security posture, and brand visibility. |
| AI, media, research | `hugging-face@openai-curated`, `life-science-research@openai-curated`, `zotero@openai-curated`, `remotion@openai-curated`, `game-studio@openai-curated`, `fal@openai-curated`, `heygen@openai-curated`, `hyperframes@openai-curated`, `nvidia@openai-curated`, `shutterstock@openai-curated`, `cloudinary@openai-curated`, `latex@openai-bundled`, `biorender@openai-curated`, `picsart@openai-curated`, `scite@openai-curated`, `ngs-analysis@openai-curated` | Coordinate AI, research, video, media, scientific/reference workflows, and generated assets. |
| Business, GTM, finance, and operations | `airtable@openai-curated`, `hubspot@openai-curated`, `apollo@openai-curated`, `clay@openai-curated`, `common-room@openai-curated`, `zoominfo@openai-curated`, `close@openai-curated`, `outreach@openai-curated`, `pipedrive@openai-curated`, `shopify@openai-curated`, `stripe@openai-curated`, `quickbooks@openai-curated`, `brex@openai-curated`, `carta-crm@openai-curated`, `docusign@openai-curated`, `signnow@openai-curated`, `intercom@openai-curated`, `help-scout@openai-curated`, `factset@openai-curated`, `lseg@openai-curated`, `s-p@openai-curated`, `quartr@openai-curated`, `morningstar@openai-curated`, `moody-s@openai-curated`, `dow-jones-factiva@openai-curated`, `pitchbook@openai-curated`, `cb-insights@openai-curated`, `alpaca@openai-curated`, `binance@openai-curated` | Manage business records, GTM context, commerce, payments, finance data, public/private market research, and operations. |

## Install Pass

The 2026-06-05 install pass installed every plugin that the local Codex listing exposed as available but not installed. The 36 successful installs are recorded in `data/plugin-install-pass-2026-06-05.json`.

The 2026-06-15 consolidation audit records the active post-merge state in
`data/installed-codex-plugins-2026-06-15.json`: `seis-ai-agent@seis-repo` is
installed and enabled; `seis`, `seis-cloud`, `seis-code`, `seis-design`, and
`seis-data` are not installed in either the `personal` or `seis-repo`
marketplaces.

## Operating Rules

1. Start SEIS work with `seis-ai-agent@seis-repo` for repo orientation, lane routing, and safety gates.
2. Use the OpenAI/Codex category plugin before falling back to generic shell, external plugin URI families, or manual steps.
3. Write durable outcomes back to SEIS docs, data files, or integration manifests.
4. Keep Google Drive, Calendar, Sheets, Docs, and external tools linked from `integrations/google-workspace.json`.
5. Do not delete old repositories or branch refs based only on plugin availability. Deletion still requires verified import evidence.

## Refresh Command

Run this from the local machine when plugin availability changes:

```bash
WORKDIR=/tmp/seis-installed-plugin-audit /Users/emirhankudun/plugins/seis/scripts/seis-installed-plugin-audit.sh
```

Then update `data/installed-codex-plugins-YYYY-MM-DD.json` and this document if the lane map changes.
