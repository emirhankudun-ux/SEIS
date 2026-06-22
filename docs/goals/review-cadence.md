# Goal Review Cadence

Structured source:

- `content/development/seis-goal-review-cadence.json`

## Purpose

Define the planned daily, weekly, and monthly review controls for the
file-backed Goal Tracking OS, plus any dated reviews that have actually been
performed with evidence.

## Current Status

| Cadence | Status | Evidence | Next Safe Action |
| --- | --- | --- | --- |
| Daily | Planned | `SEIS-REVIEW-001` | Use `daily-review-template.md` only when a real daily review is performed. |
| Weekly | Planned | `SEIS-REVIEW-002` | Use `weekly-priorities-template.md` only when current-week evidence exists. |
| Monthly | Planned | `SEIS-REVIEW-003` | Use `monthly-review-template.md` only when current-month evidence exists. |
| Current objective review | Performed | `SEIS-REVIEW-004`, `SEIS-EVID-014` | Keep this review scoped to the dated evidence and do not generalize it into release/public readiness. |

## Rules

- Planned review cadence is not proof that a review happened.
- A review can be marked performed only with `performed_at`, evidence IDs, and
  a review summary.
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

Keep future cadence records planned until a real dated review is performed and
recorded with evidence.
