# SEIS Command Center Operations Readiness

Operations readiness is the Command Center decision surface for release, CI, security, rollback, and handoff evidence.

## Current State

`review-before-release`

This state is intentional until local quality, source boundary, push evidence, external CI or explicit no-CI handoff evidence, and rollback proof are visible.

## Required Areas

| Area | Rule |
| --- | --- |
| Release | Work package, changelog, source scope, and handoff evidence must be visible. |
| CI | External checks, code scanning, or explicit no-CI handoff evidence must be recorded. |
| Security | No-secret policy, permission review, dependency posture, and least-privilege constraints must be visible. |
| Rollback | Reversible commit scope and generated report rollback must be explicit. |
| Handoff | Commit, push, next command, risk, and rollback evidence must be available to the operator. |

## Command Center Surface

The readiness panel renders on the Dashboard in `apps/seis-core`. It exposes summary cards, an ordered readiness queue, a decision summary, and an action that routes operators to the Automation/Handoff surface.

## Canonical Contract

```text
content/development/seis-command-center-operations-readiness.json
```

## Quality Gate

```bash
npm run check:seis-command-center-operations-readiness
```
