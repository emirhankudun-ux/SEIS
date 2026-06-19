# AI App Surfaces

Status: Product foundation

Each LLM-powered surface in SEIS AI App must define purpose, input, context,
tools, approval, output, evidence, audit, and current status.

## Surface Contract

| Field | Requirement |
| --- | --- |
| Purpose | What user problem the AI surface solves. |
| User input | What the user can provide. |
| Allowed context | What the LLM may read. |
| Forbidden context | What must never be used. |
| Allowed tools | Tool classes available by default. |
| Forbidden tools | Tool classes blocked without approval. |
| Required approval | Conditions that require human approval. |
| Output format | Expected answer or artifact shape. |
| Evidence requirement | What must support the output. |
| Audit requirement | What redacted metadata is recorded. |
| Current status | Planned, fixture-backed, alpha, blocked, or implemented. |

## Initial Surfaces

| Surface | Purpose | Default tools | Approval trigger | Current status |
| --- | --- | --- | --- | --- |
| AI chat | General SEIS reasoning and next-action support. | Read-only app and docs context. | Write, push, deploy, SSH, secrets. | Foundation contract. |
| Command palette assistant | Fast command intent routing. | Read-only lookup and planning. | Any privileged action. | Planned. |
| Repository assistant | Explain repo state, files, branches, PRs, and validation. | File and Git read-only tools. | Staging, committing, pushing, PR writes. | Foundation contract. |
| Documentation assistant | Explain and improve docs. | Docs search and read-only evidence. | Replacing source-of-truth docs. | Planned. |
| Roadmap assistant | Explain roadmap and next PR sequence. | Roadmap and review docs. | Changing official roadmap status. | Planned. |
| Goal tracking assistant | Compare goals with evidence. | Goal, roadmap, repo, and validation evidence. | Marking completion or validation. | Foundation contract. |
| Security reviewer | Review security risks and provider data policy. | Read-only code/docs/security evidence. | Secrets, auth, SSH, firewall, policy changes. | Foundation contract. |
| Architecture reviewer | Review boundaries and ADR fit. | Architecture docs and source evidence. | Major architecture decision. | Planned. |
| PR reviewer | Review diffs and PR evidence. | GitHub/read-only diff and checks. | Commenting, closing, merging, pushing. | Planned. |
| Release readiness reviewer | Verify release blockers and evidence. | Read-only checks and release records. | Tagging, deployment, artifact deletion. | Foundation contract. |
| Public readiness reviewer | Verify open-source and public claims. | Governance docs, checks, public metadata. | Visibility or release changes. | Planned. |
| Prompt generator | Draft prompt templates and metadata. | Approved prompt policy and synthetic fixtures. | Publishing prompt versions. | Planned. |
| Model-router inspector | Explain route decisions and blocked reasons. | Router metadata and policy. | Provider setup or credential use. | Planned. |
| Evaluation assistant | Explain eval status and missing coverage. | Eval fixtures and reports. | Running external/private evals. | Planned. |
| Agent task planner | Draft supervised agent tasks. | Agent role contracts and app state. | Starting privileged actions. | Planned. |
| Automation assistant | Suggest automation paths and dry-runs. | Script metadata and check docs. | Live automation, deployment, SSH. | Planned. |
| Knowledge search assistant | Search approved docs and knowledge records. | Approved knowledge/retrieval sources. | Private or restricted retrieval. | Planned. |

## Forbidden Defaults

No AI surface may fabricate repository state, validation, security status,
implementation status, provider connection status, or model training results.
