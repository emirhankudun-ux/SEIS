# SEIS Goal Review Cadence

Date: 2026-06-19

This document defines the non-LLM review cadence for SEIS Goal Tracking OS. It
does not claim that any daily, weekly, or monthly review has been performed.
Reviews are marked performed only when current evidence proves the review
actually happened.

The structured cadence registry is
[`../../content/development/seis-goal-review-cadence.json`](../../content/development/seis-goal-review-cadence.json).

## Cadence Records

| Cadence | Record | Status | Purpose |
| --- | --- | --- | --- |
| Daily | `SEIS-REVIEW-001` | planned | Record what changed, what is blocked, what needs validation, and the next safe action. |
| Weekly | `SEIS-REVIEW-002` | planned | Review active goals, milestone progress, next PR queue, blockers, completed work, and priorities. |
| Monthly | `SEIS-REVIEW-003` | planned | Review long-term direction, roadmap phases, architecture, AI Core, Command Center, public readiness, release readiness, and SEIS Universe direction. |

## Completion Rules

- Do not mark a review `performed` without current-period evidence.
- Do not backfill a review just to make status look complete.
- Do not treat a template as a performed review.
- Any status change caused by a review needs supporting evidence.
- Blockers must remain visible even when the review itself is completed.

## Evidence Requirements

Each performed review needs at least one of:

- A dated review note for the actual period.
- A progress-review update tied to observed repository state.
- Validation output for changed structured records.
- A new evidence record when the review proves a claim.

## Templates

- [`daily-review-template.md`](daily-review-template.md)
- [`weekly-priorities-template.md`](weekly-priorities-template.md)
- [`monthly-review-template.md`](monthly-review-template.md)

## Validation

The cadence registry is validated by:

```bash
npm run check:goal-tracking
```

The generated Command Center view model and static page must keep planned review
cadence visible without claiming fake completion.
