# SEIS God Mode Run State

Status: Guarded development mode

This document records the operating state for God Mode work. It is intentionally
short: the purpose is to keep broad development from becoming untraceable.

## Current State

- `pending-validation`
- Date: 2026-06-19
- Mode: God Mode Developer
- Repo posture: guarded but restored; the previous broad tracked deletion set
  was treated as unsafe and removed from the active package boundary.
- Commit posture: create reviewable packages that keep Command Center, AI model
  registry, and governance evidence visible.
- Push posture: push only after the focused package validates locally and does
  not reintroduce broad deletion or generated-report churn.

## Required States

| State | Meaning |
| --- | --- |
| Source-controlled artifacts | Contracts, docs, scripts, registry artifacts, and package gates exist with local validation output. |
| Runtime surfaces | Command Center panels and demo surfaces have visible, testable evidence. |
| Telemetry contracts | Web/native shared contracts retain telemetry events and checker output. |
| Validation commands | Core validation commands and focused package gates pass locally. |
| Commit boundary | Commit package boundary is reviewed before staging. |
| Push and CI | Push and CI evidence are captured before completion claims. |
| Protected user work | Unrelated user or agent work remains protected until explicit staging approval. |
| Eval critic advisory | SEIS-owned eval critic aggregate verdict remains attached to release-risk evidence. |

## Quality Gate

```bash
npm run check:seis-god-mode-run-state
```

## Active Slice

Re-establish the God Mode governance lane as a small, reviewable package:

- root architecture document
- God Mode developer policy
- God Mode run-state handoff
- dedicated lightweight check
- changelog entry

## Dirty Tree Policy

When `git status` shows broad unrelated deletions or generated report churn:

- do not revert user work automatically
- do not stage the entire tree
- do not mix unrelated deletions with a governance or feature commit
- document the risk in the run-state handoff
- ask for an explicit repo-state decision before destructive cleanup

## Next Decision

Before a publish or merge handoff, decide whether any future broad deletion set is:

- intentional cleanup to keep
- accidental local or iCloud state to restore
- generated output that should be regenerated
- unrelated work that needs a separate commit package
