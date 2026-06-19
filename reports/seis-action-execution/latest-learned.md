# SEIS Action Execution Plan

Generated: 2026-06-19T07:15:42.273Z
Contract: seis-action-execution-lane (0.1.0)
Mode: learned
Run Mode: dry-run

| id | intent | decision | risk | execution | approval | status | reasons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| action-read | Inspect repo status | allow | low | dry-run | false | ready-for-review | read_only_or_low_risk ; capabilities: read, status |
| action-write | Draft governance note | gate | medium | dry-run | true | awaiting-approval | scoped_privileged_action ; capabilities: write |
| action-gate | Run deterministic checks | gate | medium | dry-run | true | awaiting-approval | scoped_privileged_action ; capabilities: shell |
| action-deploy | Publish candidate | approval_required | high | dry-run | true | awaiting-approval | external_write ; capabilities: deploy, network |
| action-secret | Expose [REDACTED_SECRET] sample | deny | critical | dry-run | false | blocked | secret_access_or_secret_like_content ; capabilities: secret ; model-adjusted from deny -> deny |

Summary: total=5, blocked=1, awaitingApproval=3, ready=1

## Eval Critic Advisory
- Model: seis-eval-critic-seed-v0
- Decision: pass
- Safety floor: pass
- Reasons: evidence and sources present; validation evidence present

## Agent Router Advisory
- action-read: seis-cloud via seis_plugin_integration; gate=npm run check:cloud-access-policy
- action-write: seis-governance via seis_plugin_integration; gate=npm run check:seis-specialist-plugins
- action-gate: seis-cloud via seis_plugin_integration; gate=npm run check:cloud-access-policy
- action-deploy: seis-cloud via seis_plugin_integration; gate=npm run check:cloud-access-policy
- action-secret: seis-cloud via seis_plugin_integration; gate=npm run check:cloud-access-policy
