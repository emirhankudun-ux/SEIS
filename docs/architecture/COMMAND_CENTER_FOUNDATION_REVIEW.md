# SEIS Command Center Foundation Review

Date: 2026-06-19

SEIS Command Center is the central operating interface direction for the SEIS
ecosystem. This review defines what can be claimed now, what is planned, and
what must be proven before implementation expands.

Command Center is a non-LLM product foundation first. It must remain useful in
static/manual, scan-generated, mock, and future live modes even when no LLM
provider is connected. LLMs may summarize evidence, draft recommendations, and
assist review, but they are not required for the core platform to show status,
queues, blockers, approvals, or readiness.

## Current Evidence

| Evidence | Status |
| --- | --- |
| `apps/web/` static surface | Present; not validated in this pass. |
| `content/development/*` records | Present and useful for status, routing, backlog, and readiness data. |
| `docs/deployment/*` readiness docs | Present, but some docs are historical and need current alignment. |
| `reports/*` generated records | Present, with some deleted files in the current worktree. |
| Command Center product shell | Not proven as a complete application in this pass. |

## Command Center Modules

| Module | Current State | Foundation Requirement |
| --- | --- | --- |
| Ecosystem Dashboard | Planned/partial | Must show only evidence-backed repository, validation, and readiness states. |
| Repository Center | Partial | Needs current branch, worktree, PR, and GitHub Actions evidence. |
| Agent Center | Planned/partial | Needs agent roles, permissions, approval gates, and run history. |
| Plugins And Extensions | Partial | Needs installed-plugin evidence, permissions, and trust boundaries. |
| Goal And Roadmap Center | Improved | Backlog and next PR queue now exist under `docs/roadmap/`. |
| Goal Tracking Center | Improved/planned | Goal hierarchy, schema, milestones, review cadence, product view, and review report now exist under `docs/goals/` and `docs/product/`. |
| Documentation Hub | Improved | `docs/INDEX.md` and `docs/STATUS.md` now provide navigation. |
| Architecture Center | Partial | Needs root architecture and component map. |
| Automation Center | Partial | Scripts exist, but deleted validators block readiness claims. |
| Security Center | Improved | Security baseline exists, but deeper scans are deferred. |
| Remote Infrastructure And SSH Center | Planned | Must be approval-gated and never expose private keys. |
| SEIS AI Center | Partial | Needs AI Core architecture docs and provider-neutral routing contract. |
| Evidence Locker | Planned | Needs deterministic evidence records for validation, readiness, review, and approvals. |
| Module Health View | Planned | Needs explicit healthy, warning, blocked, unknown, stale, and approval-needed states. |

## Non-LLM Product Modules

| Module | Required non-LLM behavior |
| --- | --- |
| Dashboard | Render current status, blockers, stale data, and next safe actions from docs and scan outputs. |
| Repository Center | Show Git state, deleted files, missing docs, risky paths, validation gaps, and unmerged local work. |
| PR Recovery Center | Show approved PR rescue evidence when available; otherwise show unknown/approval-needed state. |
| Documentation Hub | Separate official docs from archives and generated reports. |
| Roadmap Center | Render backlog, next PR queue, blocked actions, and acceptance evidence. |
| Goal Tracking Center | Render active goals, milestones, blocked items, evidence links, validation state, and next safe actions. |
| Architecture Center | Track modules, decisions, implementation status, and unknowns. |
| Security Center | Track sensitive-file scans, approval gates, findings, and public exposure blockers. |
| Approval Center | List dangerous actions, required approval, scope, and rollback requirements. |
| Release Center | Show public/release readiness dry-runs, changelog state, artifact state, and blockers. |
| Settings Center | Show environment, integration modes, emergency stop, and feature flags. |

## UX Rules

- No fake controls.
- Unknown states must render as unknown, blocked, or approval needed.
- Approval-required actions must be disabled or routed to a human review queue.
- Loading, empty, error, degraded, and recovery states are required.
- Reduced motion, keyboard navigation, visible focus, and WCAG 2.2 AA intent are
  baseline requirements.

## Alpha Entry Criteria

Command Center Alpha planning is appropriate after:

1. Worktree deletions are resolved or intentionally documented.
2. Foundation checks run to a meaningful result.
3. Current docs distinguish historical `UIXAppTTR` records from active SEIS
   governance.
4. GitHub PR/status evidence is captured with approval.
5. Security and public-readiness blockers are documented.

## Non-Goals

- No production deployment in the foundation pass.
- No fake GitHub, cloud, SSH, or security status.
- No automatic merge, push, branch deletion, or release action.
- No broad dashboard expansion before evidence contracts exist.
- No LLM dependency for core status, safety gates, or readiness decisions.
