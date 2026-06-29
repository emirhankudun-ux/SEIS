---
type: context-pack
module: seis-claude
status: reviewed
visibility: public
updated: 2026-06-29
aliases:
  - SEIS Claude Code Context
---

# SEIS Claude Code Context

## Scope

- Repository context for Claude Code-assisted architecture, review, and long-form reasoning tasks.
- Focus on maintainability, security posture, and long-horizon handoff continuity.

## Safety Rules

- Do not claim live model actions from mock/dry-run text.
- Do not paste real credentials or private keys in prompts, outputs, or notes.
- Assume no backend provider calls by default unless evidence exists in repo checks.
- Treat Sub-Agent and SSH-related proposals as bounded and review-gated.

## Starting Position

- Primary docs: `README.md`, `AGENTS.md`, `SEIS_SECOND_BRAIN.md`, `SEIS_OBSIDIAN_VAULT.md`.
- Runtime entry points: `apps/web/desktop.html` and `seis-linux-replica.html?demo=live`.
- Validation anchors: `npm run check:seis-second-brain`, `npm run check:seis-second-brain-browser-smoke`, `npm run check:seis-public-demo-go-no-go -- --run-fast-checks`.

## Behavioral Pattern

- Read current architecture docs first.
- Inspect touched files and preserve user work.
- Keep changes scoped to small PR units.
- Mark uncertain claims as `draft` and include explicit verification commands.

## Useful Working Commands

- `npm run check:seis-second-brain`
- `npm run check:seis-second-brain-readiness-contracts`
- `npm run check:seis-obsidian-safe-import-dry-run`
- `npm run check:seis-second-brain-accessibility-focus-report`
- `npm run check:seis-second-brain-browser-smoke`
- `npm run check:seis-public-demo-go-no-go`

## Handoff Conventions

- Include objective, changed files, observed state, and explicit blockers.
- Record any assumptions before deep edits.
- Keep next safe PR queue updated when uncertainty remains.

## Continuation Phrase

If a large reconstruction starts to exceed context safety or output limits:

`CONTINUE_FROM: [section or file]`
