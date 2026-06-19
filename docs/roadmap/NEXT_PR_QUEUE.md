# SEIS Next PR Queue

Date: 2026-06-19

This queue converts the master backlog into reviewable PR slices. Each PR should
stay small, avoid unrelated cleanup, and list exact validation performed.

## PR 1: Foundation Recovery And Status

| Field | Value |
| --- | --- |
| Suggested branch | `seis/foundation-recovery-status` |
| Type | Docs and repository hygiene |
| Priority | P0 |
| Goal | Resolve pre-existing deletions or record intentional removals, then make foundation checks runnable. |
| Include | Use `docs/reviews/REPOSITORY_HYGIENE_DELETION_REVIEW.md` to review deleted governance docs, deleted scripts, deleted package files, and missing root source-of-truth docs. |
| Exclude | Push, merge, branch deletion, generated archives, nested repo import. |
| Validation | `git status --short`, `npm run check:foundation`, `npm run seis:check` when scripts are restored or replaced. |
| Approval needed | File deletion, if any deleted files are intentionally removed instead of restored. |

## PR 2: Governance Source Of Truth Alignment

| Field | Value |
| --- | --- |
| Suggested branch | `seis/governance-source-of-truth` |
| Type | Governance docs |
| Priority | P0 |
| Goal | Align active governance docs with current SEIS/main direction and keep historical `UIXAppTTR` records clearly labeled. |
| Include | `ARCHITECTURE.md`, `ROADMAP.md`, `CHANGELOG.md`, active branch policy, open-source governance, docs index updates. |
| Exclude | Runtime code changes. |
| Validation | `npm run check:foundation`, markdown link/path review. |
| Approval needed | None for documentation-only changes unless files are deleted. |

## PR 3: GitHub PR Rescue Audit

| Field | Value |
| --- | --- |
| Suggested branch | `seis/github-pr-rescue-audit` |
| Type | Review and governance |
| Priority | P1 |
| Goal | Inspect open and closed PRs, classify recoverable work, and record a clean rescue plan. |
| Include | Open PR list, closed PR table, duplicate/risky/unrecoverable classification, replacement PR recommendations. |
| Exclude | Reopening, closing, merging, or pushing PRs. |
| Validation | Local report review plus GitHub API/CLI evidence after approval. |
| Approval needed | External GitHub API/CLI connection. |

## PR 4: Security Baseline And Public Readiness

| Field | Value |
| --- | --- |
| Suggested branch | `seis/security-public-readiness` |
| Type | Security docs and safe scans |
| Priority | P1 |
| Goal | Create a deeper security/public-readiness baseline without exposing secret values. |
| Include | Secret-pattern scan by path only, dependency/license scan plan, hardcoded local path cleanup plan, artifact cleanup plan, public-readiness dry run. |
| Exclude | Secret rotation, repo visibility change, external production scans. |
| Validation | Path-only sensitive-file scan, `git diff --check`, available local checks. |
| Approval needed | Secret rotation, public visibility changes, external scanners, destructive cleanup. |

## PR 5: Command Center And AI Core Architecture Foundation

| Field | Value |
| --- | --- |
| Suggested branch | `seis/command-center-ai-core-foundation` |
| Type | Architecture docs |
| Priority | P1 |
| Goal | Define current vs planned Command Center and AI Core surfaces from repo evidence. |
| Include | Command Center module map, model-router concept, agent-runtime concept, prompt-engine concept, evidence and non-goals. |
| Exclude | Model provider API calls, real secrets, model training, unreviewed UI expansion. |
| Validation | Docs review, no-secret scan by path, `npm run check:foundation` if available. |
| Approval needed | External API calls, dependency installation, model training. |

## PR 6: Non-LLM Platform OS Foundation

| Field | Value |
| --- | --- |
| Suggested branch | `seis/non-llm-platform-os-foundation` |
| Type | Product, architecture, governance, design-system docs |
| Priority | P1 |
| Goal | Make SEIS Command Center and Platform OS explicit as useful without any LLM connection. |
| Include | Non-LLM product mission, Platform OS architecture, repository intelligence plan, approval/workflow platform, design system foundation, release/public readiness system. |
| Exclude | UI implementation, live GitHub API calls, SSH, deployment, dependency installation, LLM provider calls. |
| Validation | `git diff --check`, `npm run seis:check`, docs review; record known foundation check failures separately. |
| Approval needed | None for docs-only work; approval required for live integrations or external scans. |

## PR 7: Goal Tracking OS Foundation

| Field | Value |
| --- | --- |
| Suggested branch | `seis/goal-tracking-os-foundation` |
| Type | Goal, roadmap, product, and review docs |
| Priority | P1 |
| Goal | Make SEIS Goal Tracking OS explicit as the long-term progress and execution layer. |
| Include | `docs/goals/*`, structured goal records, structured evidence records, structured execution records, structured review cadence records, structured planning horizon records, generated Command Center view model, generated static Goal Tracking Center page, local goal validators, static page generator, Goal Tracking Center product docs, Command Center goals view, goal review report, backlog and index updates. |
| Exclude | Routed/live Command Center application shell, fake reviews, fake completion, GitHub API calls, SSH, deployment, model-provider calls. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `npm run check:goal-command-center-static`, `git diff --check`, `npm run seis:check`, `npm run check:foundation` with known blocker notes. |
| Approval needed | None for local documentation, fixture, validator, or generated static page work; approval required for live integrations or destructive cleanup. |

## PR 8: Release Readiness Dry Run

| Field | Value |
| --- | --- |
| Suggested branch | `seis/release-readiness-dry-run` |
| Type | Release governance |
| Priority | P1 |
| Goal | Verify release artifacts and deployment blockers without deploying. |
| Include | Release artifact inventory, rollback plan, deploy target checklist, dry-run output. |
| Exclude | Deployment, tag creation, artifact deletion. |
| Validation | `npm run check:release-sync`, `npm run publish:preflight`, dry-run commands only. |
| Approval needed | Deployment, release/tag creation, file deletion. |

## Human Approval Needed

- External GitHub PR inspection.
- Any push or PR creation if the policy requires explicit confirmation.
- Merging, force-push, branch deletion, or history rewrite.
- File deletion, including `.DS_Store`, release zips, or nested repository copies.
- Dependency installation.
- SSH, deployment, release/tag creation, repository settings changes, secret rotation, public visibility changes, model training, benchmarks, or dataset downloads.
