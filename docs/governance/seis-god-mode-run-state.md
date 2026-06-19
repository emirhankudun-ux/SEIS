# SEIS God Mode Run State

Status: Guarded development mode

This document records the operating state for God Mode work. It is intentionally
short: the purpose is to keep broad development from becoming untraceable.

## Current State

- Date: 2026-06-19
- Mode: God Mode Developer
- Repo posture: guarded, because the working tree contains broad tracked
  deletions outside the current slice.
- Commit posture: do not create a broad commit that mixes this slice with
  unrelated deletions.
- Push posture: no push should happen until the deletion set is reviewed and
  intentionally accepted or separated.

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

Before a publish or merge handoff, decide whether the broad deletion set is:

- intentional cleanup to keep
- accidental local or iCloud state to restore
- generated output that should be regenerated
- unrelated work that needs a separate commit package
