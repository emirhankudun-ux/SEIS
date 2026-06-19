# SEIS Non-LLM Platform Mission

Date: 2026-06-19

SEIS is not only an LLM project, model-router project, agent shell, or AI chat
surface. SEIS must also become a deterministic product, platform, and operating
interface that remains useful when no LLM provider is connected.

The non-LLM mission is to build the SEIS Command Center and SEIS Platform OS:
the central operating layer for repository governance, documentation workflows,
security, automation, evidence, release readiness, design systems, and
ecosystem control.

Goal Tracking OS is the long-term progress layer inside this mission. It tracks
vision, strategic themes, goals, milestones, blockers, validation evidence, and
next safe actions without requiring an LLM connection.

## Product Rule

SEIS must work in these modes:

| Mode | Description | LLM required |
| --- | --- | --- |
| Static/manual mode | Maintainers update status, docs, backlog, evidence, and approval records by hand. | No |
| Scan-generated mode | Local scripts scan repository files, links, status, validation, and risk signals. | No |
| Mock/demo mode | UI uses deterministic fixture data for product design and offline development. | No |
| Future live mode | Approved integrations read GitHub, CI, SSH/cloud, release, and validation state. | No for core UI; approval required for integrations |
| LLM-enhanced mode | LLMs summarize, classify, draft, and recommend from existing evidence. | Optional |

LLMs may enhance SEIS, but they must not be the only foundation. The platform
itself must provide structure, state, evidence, and safe workflows.

## Non-LLM Platform Scope

SEIS Platform OS should unify:

- Repositories, branches, pull requests, closed PR recovery, and local unmerged
  work.
- Documentation, roadmap, architecture decisions, security reviews, and
  validation records.
- Release readiness, public readiness, evidence records, and module health.
- Long-term goals, milestones, blockers, validation, and progress reviews.
- Automation tasks, workflow queues, approval queues, and dry-run results.
- Plugin/tool registry, SSH/cloud workspace status, design system status, and
  contributor workflows.

## Command Center Application

The Command Center application should be clean, premium, fast, minimal, and
trustworthy. Quality references are Apple, Linear, Raycast, GitHub, Vercel, and
Notion; SEIS should not copy them.

Primary modules:

- Dashboard.
- Repository Center.
- PR Recovery Center.
- Documentation Hub.
- Roadmap Center.
- Architecture Center.
- Security Center.
- Agent/Task Center.
- Approval Center.
- Release Center.
- Settings Center.
- Evidence Locker.
- Module Health View.

## Deterministic Systems First

Before advanced AI features, SEIS needs deterministic foundations:

1. Command Center product architecture.
2. Repository intelligence plan.
3. Documentation hub.
4. Roadmap center.
5. Security center.
6. Approval center.
7. Evidence locker.
8. Release readiness system.
9. Design system foundation.
10. Workflow/automation queue.
11. Local/cloud workspace policy.
12. Public readiness workflow.

## Non-Goals

- Do not reduce SEIS to a chatbot.
- Do not treat SEIS as only an LLM wrapper.
- Do not overclaim AI capability.
- Do not require an LLM for repository status, security posture, readiness
  state, or approval safety.
- Do not show fake controls or fabricated system health.

## Success Criteria

The non-LLM platform foundation is ready when:

- Command Center can render useful status from static docs and scan outputs.
- Repository intelligence can find missing docs, risky files, stale records, and
  validation gaps without an LLM.
- Workflows and approvals are enforceable by platform logic, not model judgment.
- Public and release readiness have evidence checklists and blocked states.
- Design system tokens and UI states support calm, accessible operation.
- LLM integrations are optional enhancement lanes with clear permission gates.
