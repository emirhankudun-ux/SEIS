# SEIS Obsidian Vault

## Purpose

SEIS Obsidian Vault is the public-safe, plain Markdown knowledge layer for
human and agent onboarding.

It must remain searchable, reviewable, and plugin-independent.

## Folder structure

- `seis-brain/README.md`
- `seis-brain/vault/00_Index`
- `seis-brain/vault/01_Product`
- `seis-brain/vault/02_Architecture`
- `seis-brain/vault/03_Design_System`
- `seis-brain/vault/04_AI`
- `seis-brain/vault/05_Agents`
- `seis-brain/vault/06_GitHub`
- `seis-brain/vault/07_SSH_Cloud`
- `seis-brain/vault/08_Prompts`
- `seis-brain/vault/09_Decisions`
- `seis-brain/vault/10_Logs`
- `seis-brain/vault/11_Roadmap`
- `seis-brain/vault/12_Context_Packs`
- `seis-brain/vault/13_Public_Private_Boundaries`

## Note naming rules

- Use clear title-case names.
- Use safe characters only (`_`, `-`, spaces, alphanumerics).
- Keep one concept per note.
- Avoid overly long file names.

## Frontmatter rules

Use frontmatter for structured notes, especially:

- `type`
- `module`
- `status` (draft/reviewed/approved/deprecated)
- `visibility` (public/local-only)
- `owner`
- `updated`

Example:

```yaml
---
type: architecture
module: seis-ai-core
status: draft
visibility: public
owner: SEIS
updated: 2026-06-30
---
```

## Backlink rules

- Use `[[Note Name]]` links where they increase navigability.
- Keep one link section in each note (`## Related Notes`).
- Avoid link cycles unless intentionally representing feedback loops.

## Public-safe notes

- architecture
- design system
- security rules
- product principles
- roadmap and milestones
- provider safety summaries

## Local-only notes

- private infrastructure details
- private keys, tokens, credentials
- personal or sensitive operational plans
- machine-specific host metadata

Do not commit local-only content.

## Context packs

Context packs are compact onboarding snippets for specific workflows:

- SEIS AI/agents
- local AI operations
- SSH/cloud safety
- demo run review

## Logs and lessons

Keep recurring notes for:

- failed attempts
- CI failures
- demo packaging history
- blocked items and decisions

## How to open in Obsidian

Open folder path:

`seis-brain/vault`

No plugins are required for the baseline use.

## Plugin policy

- Basic vault usage: no mandatory plugins.
- Optional plugin suggestions are appended in a separate optional section.
- Never make plugins a hard dependency for onboarding.

## Maintenance rules

- Update index notes when adding/removing core notes.
- Keep `SEIS Home` and `SEIS Map` current.
- Validate links during major churn.
- Mark stale notes with `status: deprecated` and add replacement links.

## Example note

```md
---
type: product
module: seis-os
status: reviewed
visibility: public
updated: 2026-06-30
---

# SEIS Product Principles

## Current State
demo

## Related Notes
- [[SEIS Home]]
- [[Premium UI Rules]]
```

## Governance reminder

All vault content is governed by `AGENTS.md`, `SEIS_SECOND_BRAIN.md`, and
`docs/PUBLIC_READINESS.md`.
