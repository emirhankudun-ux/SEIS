---
type: index
module: seis-brain
status: active-public-safe
priority: high
visibility: public
owner: SEIS
---

# SEIS Brain Index

SEIS Brain is the public-safe Markdown knowledge layer for the SEIS ecosystem.
It gives Codex, Xcode, and future agents a bounded context surface
without importing a private Obsidian vault or exposing credentials.

## Start Here

- [[SEIS Codex Context]]
- [[SEIS Apple Context]]
- [[SEIS SSH Context]]
- [[SEIS Obsidian Context]]
- [[SEIS Demo Context]]
- [[SEIS Public Readiness Context]]
- [[Public Safe Boundary]]

## Source Records

- `content/development/seis-second-brain-system.json`
- `docs/product/seis-second-brain.md`
- `docs/apple/APPLE_PUBLIC_READINESS.md`

## Current Boundary

The repo-owned vault is public-safe only. It may describe architecture,
readiness, context-pack scope, agent duties, and validation commands. It must
not include private note bodies, real credentials, provider keys, SSH private
keys, real host details, or live integration claims.

## Next Actions

- Keep context packs aligned with validators.
- Add one public-safe module note at a time.
- Run `npm run check:seis-brain-context-packs` after changing this vault.
