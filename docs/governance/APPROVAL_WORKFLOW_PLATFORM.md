# SEIS Approval And Workflow Platform

Date: 2026-06-19

The SEIS workflow layer coordinates task queues, review queues, approval gates,
recurring checks, dry-runs, repository scans, documentation audits, validation
workflows, release dry-runs, and public-readiness checks.

## Core Rule

Automation must be safe by default. Dangerous actions require explicit human
approval, recorded evidence, and a rollback or recovery plan.

## Workflow Queues

| Queue | Purpose | Examples |
| --- | --- | --- |
| Task Queue | Planned implementation or documentation work. | Backlog items, architecture docs, scanner tasks. |
| Review Queue | Human review items before merge or public claims. | Governance alignment, security review, PR rescue review. |
| Approval Queue | Dangerous or external actions blocked until approved. | Push, merge, SSH, deployment, repository settings, file deletion. |
| Validation Queue | Safe checks and dry-runs to run locally or in CI. | `npm run seis:check`, link check, secret path scan. |
| Release Queue | Version, changelog, artifact, rollback, and publish review. | Release dry-run and post-release follow-up. |
| Evidence Queue | Required evidence missing from current status. | GitHub PR state, branch protection, code scanning, Actions status. |

## Approval Request Record

Every approval-gated action should define:

- Action.
- Reason.
- Scope.
- Risk level.
- Target paths/systems.
- Required credentials or access.
- Expected output.
- Rollback/recovery plan.
- Evidence to capture.
- Expiration or review window.

## Risk Matrix

| Risk | Allowed without approval | Requires approval |
| --- | --- | --- |
| Low | Read docs, inspect Git status, update docs. | None by default. |
| Medium | Run local non-destructive validation, generate reports. | If expensive, slow, or broad. |
| High | None by default. | Dependency install, external API read, file deletion, CI/security gate changes. |
| Critical | None. | Push, merge, force-push, deployment, SSH, repo settings, secret rotation, release tags, model training. |

## Automation Modes

| Mode | Behavior |
| --- | --- |
| Manual | Human updates docs and evidence. |
| Dry-run | Automation reports planned changes without applying them. |
| Local scan | Read-only scanner emits status/findings. |
| CI check | Non-destructive validation gates PRs. |
| Approved live read | External systems are queried after approval. |
| Approved live write | Dangerous and rare; requires explicit approval and rollback plan. |

## Emergency Stop

SEIS should support an emergency stop state that disables:

- Push/merge helpers.
- Deployment/release helpers.
- SSH/cloud operations.
- Secret or repository-setting operations.
- Agent/tool actions above low risk.

The emergency stop state should be visible in Command Center and recorded in
the evidence locker.

## Non-LLM Enforcement

Approval gates must be enforced by platform rules, not by LLM judgment. An LLM
may draft an approval request or summarize risk, but the platform must still
check risk level, required approval, and allowed action state deterministically.

## First Implementation Milestone

Add a static approval ledger and queue schema, then render it in Command Center:

- Pending approvals.
- Blocked dangerous actions.
- Evidence needed.
- Dry-runs available.
- Last validation result.
- Stale data warnings.
