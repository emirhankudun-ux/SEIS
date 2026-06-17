# SEIS Project Registry

SEIS is the canonical GitHub center and general repository for all `emirhankudun-ux` project work.

This registry tracks every repository that belongs under the SEIS umbrella. Source repositories stay online until their expected branch history is verified under namespaced SEIS refs and their default-branch files are verified under `repositories/<repo>`.

## Canonical Repository

| Field | Value |
|---|---|
| Canonical repository | [`emirhankudun-ux/SEIS`](https://github.com/emirhankudun-ux/SEIS) |
| Default branch | `UIXAppTTR` |
| Central manifest | [`data/github-repository-consolidation.json`](./data/github-repository-consolidation.json) |
| Migration audit | [`docs/github-branch-migration-audit.md`](./docs/github-branch-migration-audit.md) |
| Branch migration script | [`scripts/migrate-github-branches-to-seis.sh`](./scripts/migrate-github-branches-to-seis.sh) |
| Repository depot script | [`scripts/migrate-repositories-to-seis-depot.sh`](./scripts/migrate-repositories-to-seis-depot.sh) |

## Repository Registry

| Repository | Role | Default branch | SEIS namespace | Status |
|---|---|---|---|---|
| [`SEIS`](https://github.com/emirhankudun-ux/SEIS) | Canonical hub and general repository | `UIXAppTTR` | root | active canonical center |
| [`UIX-Apps`](https://github.com/emirhankudun-ux/UIX-Apps) | Source repository | `UIXAppTTR` | `sources/UIX-Apps/*`, `repositories/UIX-Apps` | marked for SEIS consolidation |
| [`emirhan-kudun-portfolio`](https://github.com/emirhankudun-ux/emirhan-kudun-portfolio) | Source repository | `codex/seis-ux-cinematic-premium-foundation` | `sources/emirhan-kudun-portfolio/*`, `repositories/emirhan-kudun-portfolio` | marked for SEIS consolidation |
| [`github-unified-source`](https://github.com/emirhankudun-ux/github-unified-source) | Source repository | `main` | `sources/github-unified-source/*`, `repositories/github-unified-source` | marked for SEIS consolidation |
| [`seis-trusted-marketplace-plugin`](https://github.com/emirhankudun-ux/seis-trusted-marketplace-plugin) | Source repository | `main` | `sources/seis-trusted-marketplace-plugin/*`, `repositories/seis-trusted-marketplace-plugin` | marked for SEIS consolidation |
| [`gemini-cli`](https://github.com/emirhankudun-ux/gemini-cli) | Source repository | `main` | `sources/gemini-cli/*`, `repositories/gemini-cli` | marked for SEIS consolidation |
| [`DeepSeek-Coder`](https://github.com/emirhankudun-ux/DeepSeek-Coder) | Source repository | `main` | `sources/DeepSeek-Coder/*`, `repositories/DeepSeek-Coder` | marked for SEIS consolidation |
| [`claude-code`](https://github.com/emirhankudun-ux/claude-code) | Source repository | `main` | `sources/claude-code/*`, `repositories/claude-code` | marked for SEIS consolidation |
| [`docs`](https://github.com/emirhankudun-ux/docs) | Source repository | `main` | `sources/docs/*`, `repositories/docs` | marked for SEIS consolidation |
| [`awesome-deepseek-agent`](https://github.com/emirhankudun-ux/awesome-deepseek-agent) | Source repository | `main` | `sources/awesome-deepseek-agent/*`, `repositories/awesome-deepseek-agent` | marked for SEIS consolidation |

## Operating Rules

- New planning and governance starts in SEIS.
- Source repository changes should reference SEIS when possible.
- Each source repository keeps `MOVED_TO_SEIS.md` as its visible GitHub marker.
- Do not delete a source repository until its expected `sources/<repo>/<branch>` refs are present and its `repositories/<repo>` snapshot is verified in SEIS.
- Deletion is separate from consolidation and requires explicit `DRY_RUN=0 DELETE_SOURCE_REPOS=1` in the depot migration runner.

## Current Branch State

SEIS currently carries these central branches:

- `UIXAppTTR`
- `main`
- `codex/seis-ux-cinematic-premium-foundation`
- `codex/requested-plugin-governance-20260602`
- `claude/3d-animated-portfolio-POXSm`
- `claude/claude-md-docs-A72cU`
- `claude/ecstatic-darwin-fuoHJ`
- `claude/github-branch-repo-dev-SFUpD`
- `seis/server-cloud-activation-20260602`
- `seis/server-cloud-activation-20260602-2`

Last updated: 2026-06-05
