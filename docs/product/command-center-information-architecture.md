# Command Center Information Architecture

Status: Foundation IA

The information architecture groups SEIS work into operational centers instead
of disconnected dashboard cards.

## Primary Navigation

| Center | Purpose |
| --- | --- |
| Dashboard | High-signal ecosystem state. |
| AI Core | Routes, prompts, agents, evals, memory, and privacy. |
| Repository | Branches, PRs, checks, diffs, and rescue plans. |
| Documentation | Source-of-truth docs, freshness, and gaps. |
| Roadmap | goals, milestones, next PRs, and blockers. |
| Architecture | Component maps, ADRs, and boundaries. |
| Security | Findings, provider data policy, SSH/cloud gates. |
| Approvals | Human decisions required before privileged work. |
| Evidence | Reports, checks, audit events, and provenance. |
| Settings | Profiles, privacy modes, local/cloud configuration. |

## Secondary Views

- model router
- prompt engine
- agent tasks
- tool registry
- evaluation lab
- release readiness
- public readiness
- local/cloud workspace

## Content Rule

Each view should show state, evidence, owner or lane, risk, next action, and
approval state. Avoid decorative density without operational value.
