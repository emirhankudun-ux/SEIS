# Goal Review Cadence

Structured source:

- `content/development/seis-goal-review-cadence.json`

## Purpose

Define the planned daily, weekly, and monthly review controls for the
file-backed Goal Tracking OS.

## Current Status

| Cadence | Status | Evidence | Next Safe Action |
| --- | --- | --- | --- |
| Daily | Planned | `SEIS-REVIEW-001` | Use `daily-review-template.md` only when a real daily review is performed. |
| Weekly | Planned | `SEIS-REVIEW-002` | Use `weekly-priorities-template.md` only when current-week evidence exists. |
| Monthly | Planned | `SEIS-REVIEW-003` | Use `monthly-review-template.md` only when current-month evidence exists. |

## Rules

- Planned review cadence is not proof that a review happened.
- A review can be marked performed only with dated evidence.
- Reviews must keep blockers, validation gaps, and next safe actions visible.
- Reviews must not claim deployment, release, SSH, provider, benchmark, dataset,
  or model-training status without observed evidence.

## Evidence Requirements

Performed reviews require:

- date
- reviewer or responsible role
- changed goals
- blockers
- validation performed
- validation not performed
- next safe action

## Related Documents

- [daily-review-template.md](daily-review-template.md)
- [weekly-priorities-template.md](weekly-priorities-template.md)
- [monthly-review-template.md](monthly-review-template.md)
- [evidence-ledger.md](evidence-ledger.md)

## Next Safe Action

Keep cadence records planned until a real dated review is performed.
