# SEIS Action Execution Run

Generated: 2026-06-19T06:11:42.420Z
Contract: seis-action-execution-lane (0.1.0)
Run Mode: dry-run
Source Plan: reports/seis-action-execution/latest.json

Total: 5 | Executed: 0 | Skipped: 5 | Failed: 0 | Blocked: 1

| id | intent | decision | status | outcome | exitCode | reason |
| --- | --- | --- | --- | --- | --- | --- |
| action-read | Inspect repo status | allow | ready-for-review | not-run |  | dry-run mode |
| action-write | Draft governance note | gate | awaiting-approval | not-run |  | dry-run mode |
| action-gate | Run deterministic checks | gate | awaiting-approval | not-run |  | dry-run mode |
| action-deploy | Publish candidate | approval_required | awaiting-approval | not-run |  | dry-run mode |
| action-secret | Expose [REDACTED_SECRET] sample | deny | blocked | not-run |  | policy blocked |

## Eval Critic Advisory
- Model: seis-eval-critic-seed-v0
- Decision: pass
- Safety floor: pass
- Reasons: evidence and sources present; validation evidence present
