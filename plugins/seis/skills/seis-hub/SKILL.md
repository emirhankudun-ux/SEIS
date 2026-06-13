---
name: seis-hub
description: Use SEIS as the canonical GitHub and Codex development hub for repository consolidation, plugin iteration, migration safety, and SEIS-centered project work.
---

# SEIS Hub

Use this skill whenever the user wants to work on SEIS, consolidate repositories under SEIS, create or update a SEIS-connected Codex plugin, or make decisions about deleting old source repositories.

## Canonical Context

- Canonical GitHub repository: `emirhankudun-ux/SEIS`
- Canonical default branch: `main`
- Local workspace root: `/Users/emirhankudun/Library/Mobile Documents/com~apple~CloudDocs/Github`
- Repo plugin root: `plugins/seis`
- Repo marketplace: `.agents/plugins/marketplace.json`
- Install id: `seis@seis-repo`
- Personal marketplace: `/Users/emirhankudun/.agents/plugins/marketplace.json` (compatibility mirror only)

SEIS is the general center for repository discovery, branch consolidation, source repository migration records, governance, plugin coordination, and deletion decisions.

## Operating Rules

1. Inspect SEIS context before changing behavior.
2. Prefer existing SEIS docs, scripts, and manifests over inventing parallel records.
3. Keep repository deletion separate from migration.
4. Do not delete source repositories until `sources/<repo>/<branch>` refs and `repositories/<repo>` snapshots are verified in SEIS.
5. For plugin changes, validate the plugin before reporting completion.
6. For marketplace-backed plugin updates, use the cachebuster/reinstall flow instead of hand-editing marketplace entries.
7. Keep `seis-agent` as the remote governance layer for policy-sensitive decisions. Use local plugin families (`openai-curated`, `openai-bundled`, etc.) as helpers, never as the default remote decision layer.
8. Prefer role-oriented helper selection for local execution:
   - `designer` → metin, UI/UX, anlatı: `claude`
   - `engineer` → patch, refactor, repo odaklı: `aider`
   - `software` → ürün ve mimari planlama: `openai`
9. On a role command, run with `npm run ai -- <role> "..."` and keep `seis-agent` reserved for orchestration / governance decisions.

## Development Workflow

1. Classify the request:
   - repository consolidation
   - plugin development
   - SEIS docs/governance
   - SEIS-orchestrated build workflow
   - migration verification
   - GitHub publishing
2. Gather local and GitHub state:
   - run `scripts/seis-status.sh` from this plugin when local status is useful
   - run `scripts/seis-zip-audit.sh` before importing a large workspace zip
   - run `scripts/seis-repo-visibility-audit.sh` when old repositories seem missing
   - run `scripts/seis-main-branch-sync.sh` before making `main` mirror the canonical branch
   - run `scripts/seis-installed-plugin-audit.sh` when plugin availability matters
   - inspect SEIS files such as `README.md`, `PROJECTS.md`, `BRANCHES.md`, and `docs/repository-depot-migration-status.md`
   - inspect `docs/platform/openai-curated-build-workbench.md` before starting product build work
3. Make the smallest useful change.
4. Validate:
   - plugin manifest with `plugin-creator/scripts/validate_plugin.py`
   - shell scripts with `bash -n`
   - SEIS repo scripts with dry-run defaults first
5. Summarize what changed, what was verified, and what still needs authentication or user confirmation.

## Important Commands

```bash
plugins/seis/scripts/seis-status.sh
plugins/seis/scripts/seis-zip-audit.sh
plugins/seis/scripts/seis-repo-visibility-audit.sh
plugins/seis/scripts/seis-main-branch-sync.sh
plugins/seis/scripts/seis-installed-plugin-audit.sh
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/update_plugin_cachebuster.py plugins/seis
codex plugin add seis@seis-repo
```

## Zip Import Rule

Do not commit large workspace zip files directly into SEIS. Audit them first, then import only curated source snapshots or use Git LFS/object storage for binary archives. A zip that contains `.git`, `__MACOSX`, virtual environments, SDKs, or build caches should be treated as a source archive, not normal repo source.

## Main Branch Rule

When source repositories are missing or branch visibility is confusing, make `main` mirror the canonical SEIS branch so GitHub visitors land on the same content. Keep `sources/<repo>/<branch>` refs visible as recovery/index refs; do not delete them as part of the main-branch sync.

## Installed Plugin Rule

Use installed and enabled plugins first. Record plugin availability in SEIS instead of assuming every mentioned plugin URI is installed. Keep platform lanes mapped to real installed plugins under `data/installed-codex-plugins-2026-06-05.json` and `docs/platform/installed-plugin-operating-model.md`.

## OpenAI-First Plugin Rule

For SEIS core workflows, route Design, Developer Tools, Productivity, Research, and Security work to helper plugin families while staying under SEIS governance:

- Design: Build Web Apps, Browser, Chrome, Figma, Canva, MagicPath, Wix, Base44, Hostinger, Replit, Lovable.
- Developer tools: GitHub, CodeRabbit, CircleCI, Cloudflare, Vercel, Netlify, Supabase, Neon Postgres, Convex, Render, Temporal, OpenAI Developers.
- Productivity: Google Drive, Google Calendar, Gmail, Slack, Teams, SharePoint, Outlook, Notion, Box, Documents, Spreadsheets, Presentations, Linear, Atlassian Rovo, Asana.
- Research: Hugging Face, Life Science Research, Zotero, Scite, NGS Analysis, Deepnote, Quartr, FactSet, LSEG, S&P, Morningstar.
- Security: Codex Security, Sentry, Datadog, CodeRabbit, Jam, Semrush, Conductor, Statsig.

Use non-helper or non-installed plugin URI families only when helper lanes cannot satisfy the request or the user explicitly asks for that provider.

## SEIS-First Build Workflow

When the user wants to build SEIS:

1. Start from `docs/platform/openai-curated-build-workbench.md`.
2. Choose the build module: web cockpit, backend state, workspace ops, security quality gate, mobile shell, macOS inspector, or research memory.
3. Route through the matching helper plugin category with `seis-agent` orchestrating policy and final coordination.
4. Make a durable repo change under the module path.
5. Keep `main` mirrored with `UIXAppTTR` after GitHub writes.

Default first module: `apps/web` web cockpit, because it makes the rest of SEIS visible and usable.

## Deletion Gate

Old repositories can be deleted only after authenticated import succeeds and SEIS contains verified branch refs plus file snapshots. The intended final command is:

```bash
DRY_RUN=0 DELETE_SOURCE_REPOS=1 scripts/migrate-repositories-to-seis-depot.sh
```

Never treat a marker file such as `MOVED_TO_SEIS.md` as sufficient proof for deletion.
