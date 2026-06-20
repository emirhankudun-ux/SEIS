# SEIS Long-Term Goals

Date: 2026-06-19

This document tracks long-term goals across SEIS. It is not a completion claim.
Goals remain planned, active, blocked, in-review, validated, completed,
deferred, archived, or deprecated based on evidence.

## Goal Hierarchy

1. SEIS Vision.
2. Strategic Themes.
3. Long-Term Goals.
4. Roadmap Phases.
5. Milestones.
6. Epics.
7. Tasks.
8. Subtasks.
9. Validation Steps.
10. Evidence Records.
11. Follow-Up Actions.

## Goal Registry

| Goal ID | Title | Category | Priority | Status | Target phase | Evidence | Next safe action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SEIS-GOAL-001` | Build SEIS Command Center as the central operating interface. | SEIS App / Command Center | P1 high | planned | Platform foundation | [`../architecture/COMMAND_CENTER_FOUNDATION_REVIEW.md`](../architecture/COMMAND_CENTER_FOUNDATION_REVIEW.md), [`command-center-view-model.md`](command-center-view-model.md) | Render the generated Goal Tracking view model in Command Center. |
| `SEIS-GOAL-002` | Establish SEIS Goal Tracking OS. | Goal Tracking OS | P1 high | active | Goal foundation | [`goal-tracking-system.md`](goal-tracking-system.md), [`evidence-ledger.md`](evidence-ledger.md), [`execution-board.md`](execution-board.md), [`review-cadence.md`](review-cadence.md), [`planning-horizons.md`](planning-horizons.md), [`progress-ledger.md`](progress-ledger.md), [`command-center-view-model.md`](command-center-view-model.md) | Keep goal, evidence, execution, review cadence, planning horizon, progress ledger, and view registries validated, then render them in Command Center. |
| `SEIS-GOAL-003` | Build deterministic Repository Intelligence. | Repository Intelligence | P1 high | planned | Scanner foundation | [`../architecture/REPOSITORY_INTELLIGENCE_SYSTEM.md`](../architecture/REPOSITORY_INTELLIGENCE_SYSTEM.md) | Implement read-only scanner outputs after current repo hygiene blockers are resolved. |
| `SEIS-GOAL-004` | Maintain official documentation and source-of-truth navigation. | Documentation System | P1 high | active | Foundation | [`../INDEX.md`](../INDEX.md) | Keep docs index, status, backlog, and PR queue current. |
| `SEIS-GOAL-005` | Enforce security and governance through platform rules. | Security and Governance | P1 high | active | Foundation | [`../security/SECURITY_BASELINE.md`](../security/SECURITY_BASELINE.md) | Add deeper local-only security checks and approval ledger. |
| `SEIS-GOAL-006` | Stabilize GitHub workflow and PR rescue. | GitHub Workflow | P0 critical | blocked | Recovery | [`../governance/GITHUB_GOVERNANCE_REVIEW.md`](../governance/GITHUB_GOVERNANCE_REVIEW.md) | Resolve local deletion set, then inspect GitHub PRs after approval. |
| `SEIS-GOAL-007` | Prepare public repository readiness. | Public Readiness | P1 high | blocked | Readiness | [`../readiness/RELEASE_PUBLIC_READINESS_SYSTEM.md`](../readiness/RELEASE_PUBLIC_READINESS_SYSTEM.md) | Complete repo hygiene and validation recovery first. |
| `SEIS-GOAL-008` | Prepare release readiness without unsafe deployment. | Release Readiness | P1 high | blocked | Readiness | [`../readiness/RELEASE_PUBLIC_READINESS_SYSTEM.md`](../readiness/RELEASE_PUBLIC_READINESS_SYSTEM.md) | Define changelog/artifact policy and run dry-runs after validation recovery. |
| `SEIS-GOAL-009` | Build SEIS design system foundation. | Design System | P1 high | planned | UI foundation | [`../design-system/SEIS_DESIGN_SYSTEM_FOUNDATION.md`](../design-system/SEIS_DESIGN_SYSTEM_FOUNDATION.md) | Create fixture-driven component/state demo. |
| `SEIS-GOAL-010` | Define agent runtime permission model. | Agent Runtime | P1 high | planned | AI Core foundation | [`../ai/AI_CORE_FOUNDATION_REVIEW.md`](../ai/AI_CORE_FOUNDATION_REVIEW.md) | Add agent runtime specification before privileged actions. |
| `SEIS-GOAL-011` | Create safe automation queues and approval workflows. | Automation Queue | P1 high | planned | Workflow foundation | [`../governance/APPROVAL_WORKFLOW_PLATFORM.md`](../governance/APPROVAL_WORKFLOW_PLATFORM.md) | Add static approval ledger and queue schema. |
| `SEIS-GOAL-012` | Define provider-neutral model router. | Model Router | P1 high | planned | AI Core foundation | [`../ai/AI_CORE_FOUNDATION_REVIEW.md`](../ai/AI_CORE_FOUNDATION_REVIEW.md) | Add model-router provider interface and routing policy docs. |
| `SEIS-GOAL-013` | Define prompt engine and versioning. | Prompt Engine | P1 high | planned | AI Core foundation | [`../ai/AI_CORE_FOUNDATION_REVIEW.md`](../ai/AI_CORE_FOUNDATION_REVIEW.md) | Add prompt format/versioning and template rules. |
| `SEIS-GOAL-014` | Define evaluation lab for prompts, routing, agents, and model claims. | Evaluation Lab | P2 medium | planned | Evaluation foundation | [`../ai/AI_CORE_FOUNDATION_REVIEW.md`](../ai/AI_CORE_FOUNDATION_REVIEW.md) | Add evaluation smoke plan after validation scripts are recovered. |
| `SEIS-GOAL-015` | Build provenance-aware knowledge system. | Knowledge Graph | P2 medium | planned | Knowledge foundation | evidence unavailable | Define knowledge records and archive separation rules. |
| `SEIS-GOAL-016` | Define SSH/cloud workspace policy. | SSH / Cloud Workspace | P2 medium | planned | Workspace foundation | [`../architecture/SEIS_PLATFORM_OS_ARCHITECTURE.md`](../architecture/SEIS_PLATFORM_OS_ARCHITECTURE.md) | Add workspace policy doc; do not run SSH. |
| `SEIS-GOAL-017` | Establish SEIS Universe research direction without overclaiming. | SEIS Universe Research | P2 medium | planned | Research foundation | [`../ai/AI_CORE_FOUNDATION_REVIEW.md`](../ai/AI_CORE_FOUNDATION_REVIEW.md) | Add model baseline and research roadmap docs later. |
| `SEIS-GOAL-018` | Keep portfolio and creative systems aligned with SEIS product direction. | Portfolio / Creative Systems | P3 low | planned | Creative platform | evidence unavailable | Classify creative/portfolio surfaces after repo hygiene recovery. |
| `SEIS-GOAL-019` | Maintain long-term product vision and review cadence. | Long-Term Product Vision | P1 high | active | Foundation | [`seis-vision.md`](seis-vision.md), [`review-cadence.md`](review-cadence.md), [`planning-horizons.md`](planning-horizons.md), [`progress-ledger.md`](progress-ledger.md), [`daily-review-template.md`](daily-review-template.md), [`../reviews/GOAL_TRACKING_WEEKLY_REVIEW_2026-W25.md`](../reviews/GOAL_TRACKING_WEEKLY_REVIEW_2026-W25.md) | Keep cadence, planning horizon, and progress ledger records visible; monthly review remains planned until current-period evidence exists. |
| `SEIS-GOAL-020` | Define SEIS AI Core as an application layer without overclaiming model ownership. | SEIS AI Core | P1 high | planned | AI Core foundation | [`../ai/AI_CORE_FOUNDATION_REVIEW.md`](../ai/AI_CORE_FOUNDATION_REVIEW.md) | Add AI Core contracts for router, prompt engine, runtime, memory, evals, and audit. |

## Category Status Matrix

| Category | Current status | Next milestone | Known blockers | Evidence |
| --- | --- | --- | --- | --- |
| SEIS AI Core | planned | Provider-neutral docs | Deleted package/validation files | [`../ai/AI_CORE_FOUNDATION_REVIEW.md`](../ai/AI_CORE_FOUNDATION_REVIEW.md) |
| SEIS App / Command Center | planned/partial | Render generated goal view | Complete app not proven | [`../architecture/COMMAND_CENTER_FOUNDATION_REVIEW.md`](../architecture/COMMAND_CENTER_FOUNDATION_REVIEW.md), [`command-center-view-model.md`](command-center-view-model.md) |
| Goal Tracking OS | active | Evidence-backed view model | No app implementation yet | [`goal-tracking-system.md`](goal-tracking-system.md), [`evidence-ledger.md`](evidence-ledger.md), [`execution-board.md`](execution-board.md), [`command-center-view-model.md`](command-center-view-model.md) |
| Repository Intelligence | planned | Read-only scanner report | Missing validation scripts | [`../architecture/REPOSITORY_INTELLIGENCE_SYSTEM.md`](../architecture/REPOSITORY_INTELLIGENCE_SYSTEM.md) |
| Documentation System | active | Keep docs index current | Missing root docs and deleted governance docs | [`../INDEX.md`](../INDEX.md) |
| Security and Governance | active | Approval ledger | GitHub status unknown | [`../security/SECURITY_BASELINE.md`](../security/SECURITY_BASELINE.md) |
| GitHub Workflow | blocked | PR rescue audit | External approval and dirty worktree | [`../governance/GITHUB_GOVERNANCE_REVIEW.md`](../governance/GITHUB_GOVERNANCE_REVIEW.md) |
| Public Readiness | blocked | Public readiness dry-run | Repo hygiene and validation failures | [`../readiness/RELEASE_PUBLIC_READINESS_SYSTEM.md`](../readiness/RELEASE_PUBLIC_READINESS_SYSTEM.md) |
| Release Readiness | blocked | Release dry-run | Changelog/artifact policy missing | [`../readiness/RELEASE_PUBLIC_READINESS_SYSTEM.md`](../readiness/RELEASE_PUBLIC_READINESS_SYSTEM.md) |
| Design System | planned | Fixture demo | No component demo yet | [`../design-system/SEIS_DESIGN_SYSTEM_FOUNDATION.md`](../design-system/SEIS_DESIGN_SYSTEM_FOUNDATION.md) |
| Agent Runtime | planned | Permission model | Not specified yet | [`../ai/AI_CORE_FOUNDATION_REVIEW.md`](../ai/AI_CORE_FOUNDATION_REVIEW.md) |
| Automation Queue | planned | Static approval ledger | No queue schema implementation | [`../governance/APPROVAL_WORKFLOW_PLATFORM.md`](../governance/APPROVAL_WORKFLOW_PLATFORM.md) |
| Model Router | planned | Provider interface docs | No router contract docs yet | [`../ai/AI_CORE_FOUNDATION_REVIEW.md`](../ai/AI_CORE_FOUNDATION_REVIEW.md) |
| Prompt Engine | planned | Versioning docs | No prompt-engine docs yet | [`../ai/AI_CORE_FOUNDATION_REVIEW.md`](../ai/AI_CORE_FOUNDATION_REVIEW.md) |
| Evaluation Lab | planned | Smoke plan | Validation blockers | evidence unavailable |
| Knowledge Graph | planned | Knowledge record model | Not designed yet | evidence unavailable |
| SSH / Cloud Workspace | planned | Workspace policy | SSH approval required | [`../architecture/SEIS_PLATFORM_OS_ARCHITECTURE.md`](../architecture/SEIS_PLATFORM_OS_ARCHITECTURE.md) |
| SEIS Universe Research | planned | Baseline docs | No training/eval evidence | [`../ai/AI_CORE_FOUNDATION_REVIEW.md`](../ai/AI_CORE_FOUNDATION_REVIEW.md) |
| Portfolio / Creative Systems | planned | Surface classification | Repo hygiene blockers | evidence unavailable |
| Long-Term Product Vision | active | Cadence reviews | Reviews must be performed before marking complete | [`seis-vision.md`](seis-vision.md) |
