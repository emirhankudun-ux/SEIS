# Premium Local Foundation Agent

`codex/premium-local-foundation` is no longer treated as an independent Git branch in UIXApps. It is represented as `premium-local-foundation-agent`, a sub-agent lane inside `UIXAppTTR`.

## Rule

- Do not recreate `codex/premium-local-foundation` as a local or remote branch.
- Any recovered code, docs, scripts, or governance ideas from that branch must be ported into `UIXAppTTR`.
- The port must be documented in `content/development/branch-consolidation.json`.
- Lightweight checks must pass before commit.

## Current Workspace Finding

The current iCloud repo has only `UIXAppTTR` as a local branch. A nearby workspace scan did not find `codex/premium-local-foundation` as a local branch. The branch is therefore represented through memory-derived consolidation metadata and this sub-agent contract.

## Allowed Surfaces

- `content/development`
- `docs/development`
- `apps/web`
- `polyglot`
- `scripts`

## Completion Standard

Premium local foundation work counts as complete only when it exists in `UIXAppTTR`, has a traceable doc or manifest entry, and passes the same checks as the rest of the repository.
