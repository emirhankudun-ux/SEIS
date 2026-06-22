# SEIS Agent Lane Status

Agent lanes are source-controlled operating capabilities. They are not decorative prompts. Each lane must declare skill source, manifest source, autonomy level, tool boundary, safety boundary, and validation duty.

## Required safety rules

| Rule | Requirement |
| --- | --- |
| Observable | The user must be able to see what changed and what remains unverified. |
| Controllable | The agent must preserve human control over destructive or sensitive actions. |
| Least privilege | The agent must use the minimum effective toolset. |
| Secret-safe | The agent must not expose secrets, credentials, tokens, or private keys. |
| Evidence-bound | The agent must not claim completion without validation evidence. |

## Active lanes

| Lane | Role |
| --- | --- |
| SEIS God Mode Developer | Cross-layer development across product, app, AI, security, and governance. |
| SEIS Focus Mode | Attention control and compact operating mode. |
| SEIS Master Prompt Governance | Long-term operating rules and architecture mission. |
| SEIS Security Review | Security posture, secret-safety, and rollback evidence. |
| SEIS GitHub Workflow | Branch, commit, CI, PR, release, and repository hygiene. |

## Canonical contract

```text
content/development/seis-agent-lane-status.json
```

## Quality gate

```bash
npm run check:seis-agent-lane-status
```
