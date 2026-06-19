# SEIS Action Decision Report

Generated at: 2026-06-19T07:24:17.765Z

## Context
- Scope: /Users/emirhankudun/Library/Mobile Documents/com~apple~CloudDocs/Github/SEIS
- Mode: deterministic
- Policy version: seis-action-decision-v0
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
| action-read | Inspect repository status | allow | low | no | deterministic | read_only_or_low_risk; capabilities: read, status |
| action-write | Update governance note | gate | medium | yes | deterministic | scoped_privileged_action; capabilities: write |
| action-shell | Run deterministic quality check | gate | medium | yes | deterministic | scoped_privileged_action; capabilities: shell |
| action-deploy | Publish candidate package | approval_required | high | yes | deterministic | external_write; capabilities: deploy, network |
| action-secret | Expose [REDACTED_TOKEN] sample | deny | critical | no | deterministic | secret_access_or_secret_like_content; capabilities: secret |


## Agent Router Advisory
- action-read: seis-governance via seis_plugin_integration; gate=npm run check:seis-specialist-plugins
- action-write: seis-research via seis_plugin_integration; gate=npm run check:seis-ai-agent
- action-shell: seis-governance via seis_plugin_integration; gate=npm run check:seis-specialist-plugins
- action-deploy: seis-cloud via seis_plugin_integration; gate=npm run check:cloud-access-policy
- action-secret: seis-security via seis_plugin_integration; gate=npm run check:seis-ai-agent


## Eval Critic Advisory
- Model: seis-eval-critic-seed-v0
- Decision: pass
- Safety floor: pass
- Reasons: evidence and sources present; validation evidence present
