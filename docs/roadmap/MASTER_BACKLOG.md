# SEIS Master Backlog

Date: 2026-06-22

| ID | Priority | Lane | Work | Acceptance evidence |
| --- | --- | --- | --- | --- |
| `SEIS-BL-001` | P0 | Goal Tracking OS | Keep structured goal, evidence, and execution records valid. | `npm run check:goal-tracking` passes. |
| `SEIS-BL-002` | P0 | Repository hygiene | Resolve pre-existing tracked deletions outside this slice. | `git status --short` no longer shows unexplained deletions. |
| `SEIS-BL-003` | P1 | Command Center | Add generated/static Goal Tracking view model. | Static/generated view reads JSON records without LLM. |
| `SEIS-BL-004` | P1 | Repository intelligence | Define read-only scanner outputs for missing docs, risky files, validation gaps, and readiness blockers. | Scanner plan and fixture output exist. |
| `SEIS-BL-005` | P1 | Security | Add deeper security baseline without printing secrets. | Path-only scan and validation notes are documented. |
| `SEIS-BL-006` | P1 | GitHub governance | Inspect open/closed PRs after approval. | PR rescue review records current state. |
| `SEIS-BL-007` | P1 | Public readiness | Run public-readiness dry run after worktree recovery. | Public readiness decision is evidence-backed. |
| `SEIS-BL-008` | P1 | Release readiness | Run release-readiness dry run without deployment. | Release blockers and rollback plan are documented. |
| `SEIS-BL-009` | P2 | AI Core | Define model router, prompt engine, agent runtime, and evaluation boundaries. | Docs avoid model ownership overclaims. |
| `SEIS-BL-010` | P2 | SSH / cloud | Document SSH workspace policy before remote commands. | SSH docs require approval and no private key exposure. |

## Deferred Dangerous Work

- Push to `main`.
- Merge, force-push, branch deletion, or history rewrite.
- File deletion or cleanup of tracked deletions.
- Deployment, release/tag creation, repo visibility changes, or settings changes.
- SSH commands, secret rotation, model training, benchmarks, or dataset downloads.
