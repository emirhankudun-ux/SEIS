# Branch Policy

## Main-Only Center

`main` is the only long-lived public center branch for SEIS.

Temporary implementation branches are allowed only as short-lived review and
validation surfaces. They should be merged back into `main` and deleted after
the maintainer verifies the final state.

## Rules

- `main` is sacred.
- Keep commits small, reversible, and easy to review.
- Do not force-push `main`.
- Do not delete remote branches from automation.
- Do not keep stale Codex, Claude, or experiment branches as permanent product surfaces.
- Before any branch cleanup, list remote branches, verify merged status, and confirm the exact delete list.
- Website release work stays behind platform gates and should not become the primary development branch.

## Allowed Branch Types

| Type | Lifetime | Purpose |
| --- | --- | --- |
| `codex/*` | short-lived | Codex implementation and validation branch |
| `claude/*` | short-lived | Claude-assisted review or experiment branch |
| `fix/*` | short-lived | Focused bug fix |
| `feature/*` | short-lived | Focused feature with clear acceptance checks |

## Cleanup Gate

Branch cleanup is a separate maintainer action, not a side effect of normal
development.

Required sequence:

1. `git fetch --prune`
2. `git branch -r --merged origin/main`
3. Review every branch name manually.
4. Confirm the exact deletion list.
5. Delete only confirmed remote branches.

See [`main-only-branch-consolidation.md`](./main-only-branch-consolidation.md).
