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
| SEIS Hub Sub-Agent Lane | Repository governance, plugin coordination, source-of-truth routing, and migration safety planning inside SEIS AI Core. |
| SEIS Cloud Sub-Agent Lane | Cloud readiness, provider-neutral deployment planning, SSH/VPN boundary review, and rollback-safe infrastructure guidance. |
| SEIS-Code Sub-Agent Lane | Architecture-aware implementation planning, tests, CI gates, MCP/plugin code, and repository automation. |
| SEIS-Design Sub-Agent Lane | Product design, UI/UX, design systems, accessibility, motion, and visual QA planning. |
| SEIS-DATA Sub-Agent Lane | Data architecture, analytics, generated reports, schema governance, memory/context, and provenance planning. |
| SEIS Security Sub-Agent Lane | Threat modeling, secret safety, permission risk, SSH/VPN hardening, and release-blocking review. |
| SEIS Research Sub-Agent Lane | Official-source review, standards and version checks, provenance, and evidence-led decisions. |
| SEIS Automation Sub-Agent Lane | Dry-runs, repeatable workflows, CI/runbook planning, rollback, and human-approved automation gates. |
| SEIS Product Sub-Agent Lane | Requirements, roadmap slices, acceptance criteria, launch readiness, and user outcome evidence. |

## SEIS AI Core Lane Tools

The SEIS AI runtime exposes these sub-agent lane tools as read-only status and
plan-only actions:

| Lane | Status tool | Plan tool |
| --- | --- | --- |
| SEIS Hub | `seis_hub_status` | `seis_hub_plan` |
| SEIS Cloud | `seis_cloud_status` | `seis_cloud_plan` |
| SEIS-Code | `seis_code_status` | `seis_code_plan` |
| SEIS-Design | `seis_design_status` | `seis_design_plan` |
| SEIS-DATA | `seis_data_status` | `seis_data_plan` |

These tools do not perform deployment, SSH, credential, GitHub write, or
destructive work. They only expose repo-backed lane posture and safe execution
guidance.

## Canonical contract

```text
content/development/seis-agent-lane-status.json
```

## Quality gate

```bash
npm run check:seis-agent-lane-status
```
