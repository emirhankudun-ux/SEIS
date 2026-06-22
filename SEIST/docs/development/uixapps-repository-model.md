# UIXApps Repository Model

UIXApps now uses `UIXAppTTR` as the single active local development branch. Older feature branch work is treated as completed history inside `UIXAppTTR`, not as a separate long-lived branch surface.

## Repository Identity

- Repository name: `UIXApps`
- Active branch: `UIXAppTTR`
- Local branch policy: single active development branch
- Branch consolidation status: completed
- Server upload status: blocked until domain, host, path, checksum, and rollback target are confirmed

## Consolidated Branches

| Branch | Status | Action |
| --- | --- | --- |
| `feature/multilingual-cinematic-foundation` | Already ancestor of `UIXAppTTR` | Deleted after verification |
| `codex/premium-local-foundation` | Not present as a local branch or remote in this workspace | Represented only as `premium-local-foundation-agent` |

## Operating Rule

All future product, web, mobile, polyglot, release, and governance work should land in `UIXAppTTR`. Feature ideas become sub-agent workstreams, docs, manifests, contracts, or small commits inside this branch instead of new long-lived branches.

`codex/premium-local-foundation` follows the same rule: it must act as an alt-agent lane inside `UIXAppTTR`, and any recovered code from that historical branch must be ported into `UIXAppTTR` rather than revived as a separate branch.

## Completion Standard

A branch or workstream counts as completed only when:

- Its code or contract exists in `UIXAppTTR`.
- Its documentation or manifest is traceable.
- The lightweight checks pass.
- Release package and handoff files are regenerated when the web or deploy surface changes.
- Rollback remains available before any server upload.

## Guardrail

Local branch checks expect only `UIXAppTTR`. If another branch appears, it should be inspected, merged or absorbed into `UIXAppTTR`, and then removed after verification.
