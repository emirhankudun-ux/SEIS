# SEIS Release And Public Readiness System

Date: 2026-06-19

SEIS needs a deterministic readiness system for public repository preparation,
release dry-runs, version planning, changelog maintenance, evidence capture, and
post-release follow-up.

## Public Readiness

Public readiness checks should verify:

- README quality and current status honesty.
- License presence and compatibility notes.
- Security policy and private vulnerability reporting.
- Contribution guide and code of conduct.
- PR and issue templates.
- Documentation index and source-of-truth links.
- Archive separation and provenance notes.
- No secret, credential, private-key, or private-data paths.
- No generated dependency folders or nested repos staged by accident.
- Validation commands and known failures documented.

## Release Readiness

Release readiness checks should verify:

- Version or release target.
- Changelog/release notes.
- Validation result summary.
- Artifact inventory.
- Dependency and license review status.
- Security scan status.
- Deployment target and rollback plan.
- Known risks and blockers.
- Post-release follow-up queue.

## Readiness States

| State | Meaning |
| --- | --- |
| `not_started` | No readiness review exists. |
| `in_review` | Evidence is being collected. |
| `blocked` | A blocker prevents readiness. |
| `approval_needed` | Human approval is required before continuing. |
| `ready_for_internal_review` | Evidence is sufficient for internal review. |
| `ready_for_public_preparation` | Public prep can proceed, but release/deploy may still be blocked. |
| `ready_for_release_review` | Release review can proceed. |
| `not_ready` | Readiness claim would be misleading. |

## Evidence Records

Every readiness record should include:

- Date.
- Reviewer or tool.
- Scope.
- Commands run.
- Commands not run.
- Findings.
- Blockers.
- Approval needed.
- Final decision.

## Dry-Run Principle

Dry-runs should never deploy, tag, publish, delete, rotate secrets, or modify
repository settings. They should report:

- What would happen.
- Which approvals are missing.
- Which checks passed or failed.
- Which artifacts would be included.
- Which rollback path would apply.

## Current Foundation Status

As of 2026-06-19:

- Public readiness is blocked by unresolved tracked deletions, validation script
  gaps, and source-of-truth inconsistencies.
- Release readiness is blocked by unresolved validation failures, unclear
  artifact policy, and missing changelog/release policy.
- Deployment and release actions remain approval-gated and were not performed.

## First Implementation Milestone

Add a local readiness report generator that emits:

- `public_readiness_status`
- `release_readiness_status`
- blockers
- approval-needed actions
- validation evidence
- stale data warnings
- recommended next PR
