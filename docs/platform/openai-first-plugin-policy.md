# OpenAI-First Plugin Policy

Date: 2026-06-05

SEIS should use OpenAI/Codex plugin families first for core work. The primary families are:

- `openai-curated`
- `openai-bundled`
- `openai-primary-runtime`
- `seis@personal` for local SEIS coordination

External or non-installed plugin URI families are fallback paths unless the OpenAI/Codex route cannot satisfy the request or the user explicitly asks for a specific provider.

This policy is about installed Codex/plugin routing for repository work. It is
not a model-provider lock-in rule for SEIS AI Core. Live model routing remains
provider-neutral, no-key by default, and governed by `SECURITY.md` plus the
SEIS AI Core contracts under `docs/ai/`.

## Why This Fits SEIS

SEIS is a closed-code command center for repository consolidation, plugin coordination, full-stack/product work, and governance. OpenAI/Codex plugins are the best default layer because they are already installed, audited in SEIS, visible through the Codex runtime, and easier to keep aligned with repo governance.

## Priority Categories

| Category | Primary OpenAI/Codex plugins | SEIS use |
|---|---|---|
| Design | `build-web-apps@openai-curated`, `browser@openai-bundled`, `chrome@openai-bundled`, `figma@openai-curated`, `canva@openai-curated`, `magicpath@openai-curated`, `wix@openai-curated`, `base44@openai-curated`, `hostinger@openai-curated`, `replit@openai-curated`, `lovable@openai-curated` | UI, frontend, product design, browser inspection, visual assets, prototypes. |
| Developer tools | `github@openai-curated`, `coderabbit@openai-curated`, `circleci@openai-curated`, `cloudflare@openai-curated`, `vercel@openai-curated`, `netlify@openai-curated`, `supabase@openai-curated`, `neon-postgres@openai-curated`, `convex@openai-curated`, `render@openai-curated`, `temporal@openai-curated`, `openai-developers@openai-curated`, `expo@openai-curated`, `build-ios-apps@openai-curated`, `build-macos-apps@openai-curated`, `test-android-apps@openai-curated` | Repo, CI, deployment, backend, database, OpenAI API, mobile, desktop. |
| Productivity | `google-drive@openai-curated`, `google-calendar@openai-curated`, `gmail@openai-curated`, `slack@openai-curated`, `teams@openai-curated`, `sharepoint@openai-curated`, `outlook-email@openai-curated`, `outlook-calendar@openai-curated`, `notion@openai-curated`, `box@openai-curated`, `documents@openai-primary-runtime`, `spreadsheets@openai-primary-runtime`, `presentations@openai-primary-runtime`, `linear@openai-curated`, `atlassian-rovo@openai-curated`, `asana@openai-curated`, `calendly@openai-curated`, `zoom@openai-curated` | Docs, meetings, mail, collaboration, task management, operating cadence. |
| Research | `hugging-face@openai-curated`, `life-science-research@openai-curated`, `zotero@openai-curated`, `scite@openai-curated`, `ngs-analysis@openai-curated`, `deepnote@openai-curated`, `quartr@openai-curated`, `factset@openai-curated`, `lseg@openai-curated`, `s-p@openai-curated`, `morningstar@openai-curated`, `moody-s@openai-curated`, `dow-jones-factiva@openai-curated` | Technical, scientific, market, financial, and reference research. |
| Security | `codex-security@openai-curated`, `sentry@openai-curated`, `datadog@openai-curated`, `coderabbit@openai-curated`, `jam@openai-curated`, `semrush@openai-curated`, `conductor@openai-curated`, `statsig@openai-curated` | Security scans, code review, runtime debugging, observability, SEO/quality signals. |

## Operating Rule

1. Start with the SEIS plugin for repo orientation and safety gates.
2. Select the OpenAI/Codex category plugin that matches the work.
3. Use external or non-installed plugin URI families only as explicit fallback.
4. Write durable outputs back to SEIS docs, data files, or integration manifests.
5. Keep `data/openai-plugin-priority-2026-06-05.json` and `data/installed-codex-plugins-2026-06-05.json` aligned after plugin changes.
