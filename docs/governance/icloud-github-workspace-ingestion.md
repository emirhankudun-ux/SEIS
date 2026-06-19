# iCloud GitHub Workspace Ingestion

This document defines how the SEIS iCloud Drive `Github` workspace is merged into the active GitHub development repository without turning the repository into a raw file dump.

## Source Inputs

The current ingestion pass combines these inputs:

- Root workspace instructions from `/Users/emirhankudun/Library/Mobile Documents/com~apple~CloudDocs/Github/SEIS/AGENTS.md`.
- The SEIS Supreme operating-system directive and repository governance docs.
- The iCloud Drive `Github` workspace inventory.
- The existing SEIS `AGENTS.md`, branch governance, and focus-mode development process.

## Active GitHub Surface

The active GitHub repository is:

```text
https://github.com/emirhankudun-ux/SEIS.git
```

The active branch is:

```text
main
```

This repository is the clean development surface. The iCloud root folder is a multi-project workspace containing repositories, archives, assets, symlinks, and personal files. It must not be pushed as a single repository.

## Merge Principle

Merge intent before files.

Broad instructions, operating-system language, workspace routing, and repository-governance rules should become traceable documentation. Code, app surfaces, and assets should be imported only after a focused review confirms they belong in SEIS.

## Intake Categories

| Category | Examples | Action |
| --- | --- | --- |
| Governance instructions | `AGENTS.md`, SEIS operating directives | Convert into repo docs and agent instructions. |
| Active SEIS code | `apps`, `scripts`, `docs`, `content`, `reports` | Merge through normal Git review and focused checks. |
| Other Git repositories | `claude-code`, `gemini-cli`, `DeepSeek-Coder`, `Website`, `docs` | Keep as separate repositories unless a specific integration is requested. |
| Archives | `*.zip`, bundled exports, release packages | Do not commit directly. Extract only in a temporary review area when needed. |
| Personal media | photos, PDFs, resumes, portfolio source media | Do not bulk-commit. Route selected public assets through an asset manifest. |
| System files | `.DS_Store`, `__MACOSX`, cache folders | Exclude from Git. |
| Symlink mirrors | `Website 2`, `Website copy`, `UX 2`, `New project copy` | Resolve to real project paths before review. |
| Duplicate SEIS checkouts | `/Users/emirhankudun/Library/Mobile Documents/com~apple~CloudDocs/SEIS`, `SEIST/` | Treat as intake/archive material until individual files are reviewed. |
| Assistant outputs | Qwen, Codex, Claude, Gemini, and other generated output folders | Keep as archive or future-phase material unless promoted through review. |

## Safety Rules

- Start with `git status --short --branch` in the active repository.
- Confirm `origin` and branch before any push.
- Never force-push.
- Never push while remote divergence, missing auth, dirty unrelated files, or unreviewed deletions are present.
- Avoid importing nested `.git` directories.
- Avoid importing files larger than normal GitHub limits unless a deliberate Git LFS plan exists.
- Do not treat old archive material, duplicate checkouts, or raw assistant output as official SEIS direction.
- Treat personal identity documents, private photos, local configs, and secrets as blocked until explicitly approved.
- Prefer one small reversible commit over a broad workspace dump.

## Validation

For documentation-only ingestion:

```bash
git diff --check
npm run check:workspace-routing
npm run automation:publish-readiness
```

For code or asset ingestion, add the narrow project-specific checks that match the changed surface.

## Current Decision

The current pass intentionally imports the operating instructions and workspace routing policy, not the raw archive or every root-level file. This preserves GitHub hygiene while still merging the user's SEIS direction into the active repository.
