# SEIS Master Backlog

Date: 2026-06-22

| ID | Priority | Lane | Work | Acceptance evidence |
| --- | --- | --- | --- | --- |
| `SEIS-BL-001` | P0 | Goal Tracking OS | Keep structured goal, evidence, and execution records valid. | `npm run check:goal-tracking` passes. |
| `SEIS-BL-002` | P0 | Repository hygiene | Resolve pre-existing tracked deletions outside this slice. | `git status --short` no longer shows unexplained deletions. |
| `SEIS-BL-003` | P1 | Command Center | Maintain generated/static Goal Tracking view model. | `npm run check:goal-command-center-view` passes and the static page reads JSON records without LLM. |
| `SEIS-BL-004` | P1 | Goal Tracking OS | Keep review cadence and progress ledger records synchronized with evidence. | `SEIS-EVID-007` exists and `npm run check:goal-tracking` validates review and ledger panels. |
| `SEIS-BL-005` | P1 | Goal Tracking OS | Keep horizon, project, epic, and subtask hierarchy records synchronized with evidence. | `SEIS-EVID-008` exists and `npm run check:goal-tracking` validates hierarchy panels. |
| `SEIS-BL-006` | P1 | Repository intelligence | Define read-only scanner outputs for missing docs, risky files, validation gaps, and readiness blockers. | Scanner plan and fixture output exist. |
| `SEIS-BL-007` | P1 | Security | Add deeper security baseline without printing secrets. | Path-only scan and validation notes are documented. |
| `SEIS-BL-008` | P1 | GitHub governance | Inspect open/closed PRs after approval. | PR rescue review records current state. |
| `SEIS-BL-009` | P1 | Public readiness | Run public-readiness dry run after worktree recovery. | Public readiness decision is evidence-backed. |
| `SEIS-BL-010` | P1 | Release readiness | Run release-readiness dry run without deployment. | Release blockers and rollback plan are documented. |
| `SEIS-BL-011` | P2 | AI Core | Define model router, prompt engine, agent runtime, and evaluation boundaries. | Docs avoid model ownership overclaims. |
| `SEIS-BL-012` | P2 | SSH / cloud | Document SSH workspace policy before remote commands. | SSH docs require approval and no private key exposure. |
| `SEIS-BL-012` | P0 | Security | Add root `SECURITY.md` and a repeatable redacted provider/credential audit. | Security policy exists and audit output never prints secret values. |
| `SEIS-BL-013` | P1 | `@seis-cloud` | Keep cloud work dry-run until deployment approval. | Existing cloud checks pass without live deployment. |
| `SEIS-BL-014` | P1 | `@seis-code` | Define SEIS Code MVP contract before implementation. | Contract covers Monaco, virtual FS, terminal, persistence, and no-key AI fallback. |
| `SEIS-BL-015` | P1 | `@seis-design` | Add component inventory and visual QA gates. | Design checklist covers tokens, accessibility, reduced motion, and provenance. |
| `SEIS-BL-016` | P1 | `@seis-data` | Add schema registry and freshness policy for JSON records. | JSON records have schema expectations and validation commands. |
| `SEIS-BL-017` | P1 | Command Center | Generate a read-only lane status view from records and docs. | Static view shows lane states without fake live controls. |
| `SEIS-BL-018` | P1 | AI Core | Run provider audit before adding live provider adapters. | Audit distinguishes docs-only, mock, placeholder, and live integrations. |

## Detailed Next Work

| ID | Suggested branch | Suggested PR title | Risk | Approval required | Next safe action |
| --- | --- | --- | --- | --- | --- |
| `SEIS-BL-012` | `security/root-policy-provider-audit` | `security: add SEIS security policy and provider audit` | High | Yes only for secret rotation/history rewrite | Add root `SECURITY.md`, audit docs, and path-only scanner. |
| `SEIS-BL-013` | `seis-cloud/readiness-dry-run` | `docs: add SEIS cloud readiness dry run` | High | Yes for live deploy/SSH | Keep all cloud output dry-run and evidence-backed. |
| `SEIS-BL-014` | `seis-code/mvp-contract` | `docs: define SEIS Code MVP contract` | Medium | Yes for dependency installation | Define the browser-safe IDE and terminal acceptance tests. |
| `SEIS-BL-015` | `seis-design/component-inventory` | `docs: add SEIS design component inventory` | Low | No | Inventory current UI components and reduced-motion behavior. |
| `SEIS-BL-016` | `seis-data/schema-registry` | `docs: add SEIS data schema registry` | Medium | No | Start with `content/development/*.json` and `data/*.json`. |
| `SEIS-BL-017` | `seis/command-center-lane-status` | `feat: add SEIS lane status view` | Medium | No unless adding dependencies | Generate a read-only Command Center view. |
| `SEIS-BL-018` | `ai/provider-audit` | `docs: add AI provider credential audit` | High | Yes for live provider calls | Inspect SDK/env/client exposure without requesting keys. |

## Deferred Dangerous Work

- Push to `main`.
- Merge, force-push, branch deletion, or history rewrite.
- File deletion or cleanup of tracked deletions.
- Deployment, release/tag creation, repo visibility changes, or settings changes.
- SSH commands, secret rotation, model training, benchmarks, or dataset downloads.
