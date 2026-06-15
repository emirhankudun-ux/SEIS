# OpenAI-curated Build Workbench

Date: 2026-06-05

This workbench turns the OpenAI-first policy into an implementation path for
SEIS. It uses OpenAI/Codex plugin families first, then records each durable
outcome back into SEIS.

## Build Principle

Start with `seis-ai-agent@seis-repo` for repo orientation, SEIS lane routing,
and gates. Then route the work through the installed OpenAI/Codex plugin
category that fits the task:

- Design: product UI, browser cockpit, visual assets, prototypes.
- Developer Tools: GitHub, CI, backend, deployment, mobile, desktop, OpenAI APIs.
- Productivity: docs, Drive, Calendar, mail, tasks, team updates.
- Research: model/dataset/reference decisions and source-backed notes.
- Security: scans, code review, incident traces, runtime quality.

## Sprint 1 Objective

Turn SEIS from a repository hub into a usable open-source operating cockpit.

## Build Modules

| Module | Path | OpenAI/Codex route | First deliverable |
|---|---|---|---|
| Web cockpit | `apps/web` | Build Web Apps, Browser, Chrome, Figma, Canva, MagicPath | Browser-first SEIS cockpit with repo, plugin, workspace, data, security, and build status panels. |
| Backend state | `apps/fullstack` | Convex, Supabase, Neon Postgres, Vercel, Netlify, Cloudflare, Render, Temporal | Backend decision record and first state model for plugin registry, repo visibility, and workspace links. |
| Workspace ops | `integrations` | Google Drive, Google Calendar, Gmail, Slack, Teams, Notion, Documents, Spreadsheets, Presentations | Workspace operating layer for docs, backlog, calendar, mail, and team updates. |
| Security quality gate | `docs/security` | Codex Security, Sentry, Datadog, CodeRabbit, Jam | Security and quality gate before source repo deletion, deployment, or automation expansion. |
| Mobile shell | `apps/android` | Expo, Test Android Apps, Build iOS Apps | Expo mobile shell for SEIS status, build review, and plugin health. |
| macOS inspector | `apps/macos` | Build macOS Apps | SwiftUI desktop inspector for local SEIS repo, plugin cache, zip audits, and branch sync. |
| Research memory | `docs/research` | Hugging Face, Zotero, Life Science Research, Scite, Deepnote | Research notebook lane for model, citation, dataset, and technical reference decisions. |

## First Build Order

1. Web cockpit
2. Backend state
3. Workspace ops
4. Security quality gate
5. Mobile shell
6. macOS inspector
7. Research memory

## Web Cockpit First Screen

The first usable screen should be an app surface, not a landing page. It should show:

- SEIS branch status: `main` and `UIXAppTTR` mirrored or not.
- Plugin status: installed count, OpenAI-first policy status, and active lanes.
- Workspace status: Drive operating plan, Sheet backlog, Calendar review.
- Source safety: zip import status, repo visibility audit, deletion gate.
- Build lanes: web, full-stack, mobile, macOS, data, research, security.

## Backend Decision

Use Convex-first for reactive cockpit state unless SQL/reporting becomes the dominant need. Keep Supabase or Neon as the Postgres lane for durable analytics, reporting, and future auth/storage decisions.

## Safety Gates

- No deletion of old repositories before verified SEIS refs and depot snapshots.
- No automatic deploy before security and runtime gates are defined.
- No large binary archive committed directly to Git.
- No external workspace artifact without a corresponding SEIS record.

## Source Of Truth

- Build matrix: `data/openai-curated-build-workbench-2026-06-05.json`
- Plugin policy: `docs/platform/openai-first-plugin-policy.md`
- Plugin stack: `docs/platform/plugin-stack.md`
- Installed registry: `data/installed-codex-plugins-2026-06-15.json`
- Backlog: `roadmap/seis-closed-code-backlog.md`
