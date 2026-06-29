# SEIS Obsidian Vault

## Purpose
Describe how SEIS stores public-safe memory in Obsidian-compatible markdown.

## Folder structure
- `seis-brain/README.md`
- `seis-brain/vault/`

## Note naming rules
- Title case file names.
- Stable prefixes by domain folder (e.g. `01_Product/SEIS Vision.md`).
- Keep names stable for backlinks.

## Frontmatter rules
Use frontmatter for stable notes:

```yaml
---
type: architecture
module: seis-ai-core
status: reviewed
visibility: public
updated: 2026-06-29
---
```

## Backlink rules
Use Obsidian style `[[note]]` links for important relationships.

## Public-safe notes
Only commit public-safe content. No secrets, private hostnames, credentials, or raw private dumps.

## Local-only notes
Any private notes must stay outside git or in explicitly ignored local directories.

## Context packs
Context packs are short AI handoff summaries under `12_Context_Packs`.

## ADR notes
Architecture and workflow decisions are tracked in `09_Decisions`.

## Logs and lessons
Store learning notes under `10_Logs`.

## How to open in Obsidian
Open the `seis-brain` folder and follow `seis-brain/README.md`.

## Plugin policy
No plugins required. Core usage must work with plain Obsidian markdown.

## Maintenance rules
- Update indexes when a new note is added.
- Keep link map healthy; remove broken links.
- Preserve ordering by section.

## Example note

```md
# SEIS Vision

- summary
- state: draft
- next actions
```
