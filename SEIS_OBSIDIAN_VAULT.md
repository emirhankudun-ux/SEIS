# SEIS Obsidian Vault

## Purpose

SEIS uses an Obsidian-compatible vault as a public-safe knowledge layer.
All core project context should be discoverable from plain Markdown notes and
internal links.

## Folder structure

- `seis-brain/README.md`
- `seis-brain/vault/`
  - `00_Index`
  - `01_Product`
  - `02_Architecture`
  - `03_Design_System`
  - `04_AI`
  - `05_Agents`
  - `06_GitHub`
  - `07_SSH_Cloud`
  - `08_Prompts`
  - `09_Decisions`
  - `10_Logs`
  - `11_Roadmap`
  - `12_Context_Packs`
  - `13_Public_Private_Boundaries`

## Note naming rules

- Use stable, descriptive Turkish/English titles.
- Use numeric domain folders as above.
- Keep names stable for backlinks and review diffs.

## Frontmatter rules

Use frontmatter for high-value notes:

```yaml
---
type: architecture
module: seis-ai-core
status: draft
visibility: public
updated: 2026-06-29
---
```

## Backlink rules

Use `[[...]]` links for all note-to-note dependencies, including:

- architecture and agents
- model/router constraints
- release readiness gates

## Public-safe notes

- Never commit secrets, credentials, private hostnames, or token values.
- Keep `status` explicit and conservative (`draft`, `reviewed`, `approved`, `deprecated`).

## Local-only notes

Private notes stay outside repository scope. Use local ignore-safe directories when
capturing personal notes, such as:

- `seis-brain/private/`
- `seis-brain/local-only/`

These paths are not committed and excluded from public seed evidence.

## Context packs

`seis-brain/vault/12_Context_Packs` contains compact handoff prompts for agent
lanes. Keep each file short, review-ready, and no secret.

## ADR notes

Decisions are stored under `09_Decisions` with consequences and alternatives.

## Logs and lessons

Operational logs are tracked in:

- `10_Logs/Failed Attempts.md`
- `10_Logs/Weekly Progress.md`
- `10_Logs/Lessons Learned.md`

## How to open in Obsidian

Open the `seis-brain` folder in Obsidian and start from:

- `vault/00_Index/SEIS Home.md`
- `vault/00_Index/SEIS Map.md`

## Plugin policy

No plugin is required. Optional plugins can be used for graphs, kanban, or graph view.

## Maintenance rules

- Update index notes when adding a new concept.
- Keep backlinks synchronized to avoid orphaned notes.
- Keep frontmatter current when status changes.

## Example note

```md
---
type: product
module: seis-product
status: draft
visibility: public
updated: 2026-06-29
---

# SEIS Vision

- summary: ...
- state: draft
- next actions: ...
```
