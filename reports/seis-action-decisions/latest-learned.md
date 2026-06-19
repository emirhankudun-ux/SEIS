# SEIS Action Decision Report

Generated at: 2026-06-19T05:55:31.296Z

## Context
- Scope: /private/tmp/seis-godmode-governance
- Mode: learned
- Policy version: undefined
- Contract: seis-action-decision-kernel

## Summary
- Total: 5
- Blocked: 1
- Requires approval: 3
- Requires explicit approval: 1
- Decision mix: allow=1, gate=2, approval_required=1, deny=1

## Decisions
| id | intent | decision | risk | approval | source | reasons |
| --- | --- | --- | --- | --- | --- | --- |
| action-read | Inspect repository status | allow | low | no | model+policy | read_only_or_low_risk; capabilities: read, status |
| action-write | Update governance note | gate | medium | yes | model+policy | scoped_privileged_action; capabilities: write |
| action-shell | Run deterministic quality check | gate | medium | yes | model+policy | scoped_privileged_action; capabilities: shell |
| action-deploy | Publish candidate package | approval_required | high | yes | model+policy | external_write; capabilities: deploy, network |
| action-secret | Expose [REDACTED_TOKEN] sample | deny | critical | no | model+policy | secret_access_or_secret_like_content; capabilities: secret; model-adjusted from deny -> deny; policy safety floor enforced |
