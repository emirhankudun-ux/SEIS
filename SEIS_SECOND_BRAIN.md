# SEIS Second Brain

## Purpose

SEIS Second Brain is the public-safe, markdown-first memory layer of the SEIS
ecosystem. It preserves project intent, architecture logic, decision history, and
operating constraints so SEIS can retain context across long-term development.

## Why SEIS needs a second brain

- Prevent context loss in handoffs and long-horizon work.
- Preserve module decisions, blockers, and proof-based status for AI agents.
- Keep onboarding fast and consistent for new contributors.
- Keep repository intelligence explicit and traceable.

## What the second brain stores

- Product vision, architecture, design, and roadmap decisions.
- Model-provider and router boundaries.
- Agent roles, task queue concepts, and governance outcomes.
- Demo mode labels and release blockers.
- Onboarding, troubleshooting, and public-readiness evidence notes.
- Safe learning/lessons records.

## What it must never store

- Private keys, tokens, passwords, private hostnames, or real credentials.
- `.env` values and service account files.
- Personal data and unreleased secret business context.
- Raw private note bodies from unpublished vaults.

## Obsidian vault structure

The public-safe vault is `seis-brain/vault`. It is plain Markdown and
Obsidian-compatible with standard internal links (`[[...]]`), and no plugins are
required.

## Public/private boundary

- `seis-brain/vault/*` contains public-safe notes.
- Private/local memory must remain local-only and outside committed paths.

## AI agent context packs

Context packs in `seis-brain/vault/12_Context_Packs` summarize operating rules
for different agent types (Codex, Ollama, Obsidian, SSH, and Cursor).

## Decision and failure ledger

- Decisions are recorded in `seis-brain/vault/09_Decisions`.
- Failure and recovery notes are recorded in `seis-brain/vault/10_Logs`.

## Roadmap memory

Year and phase memory is tracked in `seis-brain/vault/11_Roadmap` and
linked from top-level index notes.

## SEIS Search integration

Searchable indexes favor:

- Public-safe notes under `seis-brain/vault`.
- Document indices in root `docs/*`.
- `SEIS` root status/roadmap evidence files.

Private/local notes are intentionally excluded.

## Future app integration

Future SEIS Brain app work can aggregate:

- latest state markers (`status`, `next actions`, `dependencies`)
- context pack exports
- decision/failure recaps for live review

## Verification checklist

- [x] `seis-brain/README.md` exists.
- [x] Vault index notes exist.
- [x] Architecture, AI, agents, and roadmap note groups exist.
- [x] Decision and context pack files exist.
- [ ] Vault import safety checks run (`npm run report:seis-obsidian-safe-import-dry-run`).
- [x] Public/private boundary is explicitly documented.

## Next steps

- Expand context pack coverage for all agent lanes.
- Add a small vault QA runbook and smoke-check command list.
- Keep seed-note metadata synchronized with `SEIS_OBSIDIAN_VAULT.md`.
