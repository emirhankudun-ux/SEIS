---
type: context-pack
module: obsidian-bridge
status: planned-gated-public-safe
priority: high
visibility: public
owner: SEIS
allowed_destinations:
  - Codex
  - Public GitHub
forbidden_destinations:
  - private vault import
  - automatic home-directory scan
  - live provider prompt with private notes
---

# SEIS Obsidian Context

## Purpose

SEIS Brain is Obsidian-compatible, but this repo-owned vault is not a private
Obsidian vault import. It is a public-safe Markdown layer for agents and
contributors.

## Current Rule

Private Obsidian import remains planned-gated. A future import must be
explicitly user-selected, dry-run first, provenance-reviewed, no-secret
filtered, and approved before any GitHub publication.

## Source Records

- `docs/product/seis-second-brain.md`
- `docs/product/seis-obsidian-bridge-safe-import.md`
- `content/development/seis-second-brain-system.json`
- `content/development/seis-obsidian-bridge-safe-import-contract.json`
- `seis-brain/vault/13_Public_Private_Boundaries/Public Safe Boundary.md`

## Allowed Actions

- Create public-safe Markdown notes.
- Add frontmatter, internal links, and context-pack summaries.
- Link to repo-owned JSON contracts and docs.
- Run local validators.

## Forbidden Actions

- Import private note bodies.
- Scan the home directory for vaults.
- Copy `.obsidian` workspace state.
- Store absolute private vault paths.
- Send private note content to AI providers.
- Publish imported material to GitHub without explicit approval.

## Verification Commands

```bash
npm run check:seis-second-brain
npm run check:seis-second-brain-readiness-contracts
npm run check:seis-brain-context-packs
```

## Handoff Output

When working on Obsidian compatibility, report whether the work is public-safe
docs/metadata, a planned import contract, or a private-vault action requiring
explicit user approval.
