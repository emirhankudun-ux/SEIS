# SEIS Second Brain

## Purpose

SEIS Second Brain is the project memory surface for preserving architectural intent,
operational decisions, and product context across agents and contributors.

It is not a feature dump. It is the repository-memory layer that should prevent
repeated context loss.

## Why SEIS needs a second brain

- to avoid repeated rediscovery of prior design/architecture decisions
- to preserve public-safe onboarding context
- to make agent handoffs deterministic and reviewable
- to distinguish demo status from real implementation status
- to keep GitHub as the source of truth while local/private notes stay out of GitHub

## What it stores

- product and architecture decisions
- design system and UX principles
- AI provider and model-router boundaries
- prompt-engine and agent-runtime contracts
- local-AI/Ollama usage rules
- installed AI/tool registry updates
- SSH/cloud readiness notes
- PR safety and governance reminders
- failure ledger entries and lessons learned
- roadmap and phase progression

## What it must never store

- private keys
- API tokens
- raw secrets or credentials
- personal private notes
- machine-specific private host credentials
- sensitive personal data

## Obsidian vault structure

The second brain is implemented in:

- `seis-brain/README.md`
- `seis-brain/vault/00_Index/SEIS Home.md`
- `seis-brain/vault/00_Index/SEIS Map.md`
- domain folders `01_Product` through `13_Public_Private_Boundaries`

Notes should be plain Markdown with internal links using `[[...]]`.

## Public / private boundary

- Public notes: architecture, roadmap, demos, governance, and reusable prompts.
- Local-private notes: real infrastructure values, private hosts, private keys, and any
  sensitive operational detail.

Keep private notes out of committed paths. This repository currently uses ignore
rules for private/local-only areas.

## AI agent context packs

Context packs should include a short set of stable facts:

- what is implemented
- what is demo-only
- what is planned
- what currently blocks public-readiness
- how to continue safely

Treat generated context as draft until reviewed.

## Decision ledger

- `13.1` and `13.2` style notes should record:
  - ADR title
  - rationale
  - alternatives considered
  - trade-offs
  - rollback expectations
- Decision records should be linked to checklists and scripts where possible.

## Failure ledger

Failure entries should include:

- what failed
- first observed date
- owning file/path
- root-cause summary
- fix plan
- review status

## Roadmap memory

Roadmap memory should map:

- current phase work
- next safe PRs
- known evidence gaps
- blockers that require approval

## SEIS Search integration

When search surfaces are implemented, the index should prioritize:

- `seis-brain/vault` metadata
- public doc index files
- architecture and AI safety records

## Future app integration

If runtime app surfaces are added, add safe read-only panels for:

- Brain overview
- Obsidian index status
- Decision ledger preview
- Public/private boundary warning cards

## Verification checklist

1. `SEIS_SECOND_BRAIN.md` exists and is linked from docs indexes.
2. `seis-brain/README.md` exists.
3. `seis-brain/vault/00_Index/SEIS Home.md` exists and points to core notes.
4. `seis-brain/vault/00_Index/SEIS Map.md` exists.
5. No secrets detected in top-level brain paths.

## Next steps

- Keep the folder updated when new agent or product domains are introduced.
- Ensure decision records are reviewed before becoming source-of-truth.
- If local/private notes are created, move them to non-committed local areas.
