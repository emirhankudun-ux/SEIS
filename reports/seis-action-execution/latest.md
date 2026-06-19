# SEIS Action Execution Plan

Generated: 2026-06-19T05:55:32.322Z
Contract: seis-action-execution-lane (undefined)
Mode: deterministic
Run Mode: dry-run

| id | intent | decision | risk | execution | approval | status | reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| action-read | Inspect repo status | allow | low | dry-run | false | ready-for-review | read_only_or_low_risk ; capabilities: read, status |
| action-write | Draft governance note | gate | medium | dry-run | true | awaiting-approval | scoped_privileged_action ; capabilities: write |
| action-gate | Run deterministic checks | gate | medium | dry-run | true | awaiting-approval | scoped_privileged_action ; capabilities: shell |
| action-deploy | Publish candidate | approval_required | high | dry-run | true | awaiting-approval | external_write ; capabilities: deploy, network |
| action-secret | Expose [REDACTED_SECRET] sample | deny | critical | dry-run | false | blocked | secret_access_or_secret_like_content ; capabilities: secret |

Summary: total=5, blocked=1, awaitingApproval=3, ready=1
