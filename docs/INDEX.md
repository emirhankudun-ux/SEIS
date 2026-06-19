# SEIS Documentation Index

This index is the current navigation spine for SEIS documentation. It separates
source-of-truth policy, current status, roadmap planning, review evidence, and
historical material so future work can start from a known surface instead of a
broad file search.

## Start Here

| Document | Purpose | Status |
| --- | --- | --- |
| [../AGENTS.md](../AGENTS.md) | AI operating instructions for this repository. | Active |
| [../README.md](../README.md) | Public-facing repository overview. | Active, needs periodic status refresh |
| [../SECURITY.md](../SECURITY.md) | Vulnerability reporting and security rules. | Active |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Contribution rules and PR expectations. | Active |
| [STATUS.md](STATUS.md) | Current repository condition and readiness matrix. | Active |
| [goals/seis-vision.md](goals/seis-vision.md) | Long-term SEIS vision and strategic themes. | Active |
| [goals/long-term-goals.md](goals/long-term-goals.md) | Evidence-aware long-term goal registry. | Active |

## Foundation Planning

| Document | Purpose | Status |
| --- | --- | --- |
| [roadmap/MASTER_BACKLOG.md](roadmap/MASTER_BACKLOG.md) | Consolidated backlog across security, docs, architecture, AI Core, Command Center, GitHub governance, public readiness, and release readiness. | Active |
| [roadmap/NEXT_PR_QUEUE.md](roadmap/NEXT_PR_QUEUE.md) | Ordered next PR queue, including blocked dangerous actions that need approval. | Active |
| [reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md](reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md) | Full foundation review from the current inspection pass. | Active |
| [product/SEIS_NON_LLM_PLATFORM_MISSION.md](product/SEIS_NON_LLM_PLATFORM_MISSION.md) | Non-LLM Command Center and Platform OS mission. | Active |
| [reviews/GOAL_TRACKING_REVIEW.md](reviews/GOAL_TRACKING_REVIEW.md) | Goal Tracking OS foundation review. | Active |

## Goal Tracking OS

| Document | Purpose | Status |
| --- | --- | --- |
| [goals/seis-vision.md](goals/seis-vision.md) | SEIS vision, strategic themes, and guardrails. | Active |
| [goals/long-term-goals.md](goals/long-term-goals.md) | Goal hierarchy, goal registry, and category status matrix. | Active |
| [goals/goal-tracking-system.md](goals/goal-tracking-system.md) | Goal Tracking OS mission, concepts, status rules, and cadence. | Active |
| [goals/goal-schema.md](goals/goal-schema.md) | Lightweight goal object and allowed status/priority/risk values. | Active |
| [goals/milestone-map.md](goals/milestone-map.md) | Roadmap phases, milestones, epics, validation steps, and follow-ups. | Active |
| [goals/progress-review.md](goals/progress-review.md) | Current Goal Tracking OS progress review. | Active |
| [goals/weekly-priorities-template.md](goals/weekly-priorities-template.md) | Weekly review template; use only for real weekly reviews. | Template |
| [goals/monthly-review-template.md](goals/monthly-review-template.md) | Monthly review template; use only for real monthly reviews. | Template |

## Architecture And Product Direction

| Area | Current Documents |
| --- | --- |
| Command Center foundation | [architecture/COMMAND_CENTER_FOUNDATION_REVIEW.md](architecture/COMMAND_CENTER_FOUNDATION_REVIEW.md) |
| Goal Tracking Center | [product/goal-tracking-center.md](product/goal-tracking-center.md) |
| Command Center goals view | [product/command-center-goals-view.md](product/command-center-goals-view.md) |
| Platform OS architecture | [architecture/SEIS_PLATFORM_OS_ARCHITECTURE.md](architecture/SEIS_PLATFORM_OS_ARCHITECTURE.md) |
| Repository intelligence | [architecture/REPOSITORY_INTELLIGENCE_SYSTEM.md](architecture/REPOSITORY_INTELLIGENCE_SYSTEM.md) |
| Web and mobile foundation | [architecture/web-mobile-foundation.md](architecture/web-mobile-foundation.md) |
| 3D decision record | [decisions/3d-rendering-approach.md](decisions/3d-rendering-approach.md) |
| SEIS evolution model | [strategy/seis-evolution-model.md](strategy/seis-evolution-model.md) |
| Mobile path | [mobile/mobile-experience-plan.md](mobile/mobile-experience-plan.md) |
| Server adapters | [server/server-adapter-matrix.md](server/server-adapter-matrix.md) |
| AI Core foundation | [ai/AI_CORE_FOUNDATION_REVIEW.md](ai/AI_CORE_FOUNDATION_REVIEW.md) |

## Governance And Operations

| Area | Current Documents |
| --- | --- |
| Development process | [governance/development-process.md](governance/development-process.md) |
| iCloud workspace ingestion | [governance/icloud-github-workspace-ingestion.md](governance/icloud-github-workspace-ingestion.md) |
| Low-pressure mode | [governance/full-efficiency-low-pressure-mode.md](governance/full-efficiency-low-pressure-mode.md) |
| GitHub governance review | [governance/GITHUB_GOVERNANCE_REVIEW.md](governance/GITHUB_GOVERNANCE_REVIEW.md) |
| Approval and workflow platform | [governance/APPROVAL_WORKFLOW_PLATFORM.md](governance/APPROVAL_WORKFLOW_PLATFORM.md) |
| Security baseline | [security/SECURITY_BASELINE.md](security/SECURITY_BASELINE.md) |
| Design system foundation | [design-system/SEIS_DESIGN_SYSTEM_FOUNDATION.md](design-system/SEIS_DESIGN_SYSTEM_FOUNDATION.md) |
| Release and public readiness | [readiness/RELEASE_PUBLIC_READINESS_SYSTEM.md](readiness/RELEASE_PUBLIC_READINESS_SYSTEM.md) |
| GitHub remote configuration | [deployment/github-remote-configuration.md](deployment/github-remote-configuration.md) |
| Publish gate | [deployment/publish-gate-contract.md](deployment/publish-gate-contract.md) |
| Lightweight checks | [testing/lightweight-checks.md](testing/lightweight-checks.md) |

## Evidence Records

| Record | Purpose |
| --- | --- |
| [repository-visibility-and-main-sync.md](repository-visibility-and-main-sync.md) | Historical repository visibility and branch sync evidence. |
| [github-branch-migration-audit.md](github-branch-migration-audit.md) | Historical branch migration findings and blocked operations. |
| [repository-depot-migration-status.md](repository-depot-migration-status.md) | Repository depot migration status. |
| [reports/cleanup-candidates-2026-05-24.md](reports/cleanup-candidates-2026-05-24.md) | Historical cleanup candidate report. |
| [reports/zip-analysis-2026-05-24.md](reports/zip-analysis-2026-05-24.md) | Historical zip analysis. |

## Navigation Rule

When a document conflicts with observed repository state, update
[STATUS.md](STATUS.md) or the relevant review document first. Do not rewrite
older evidence records unless the older record itself is wrong; prefer adding a
new dated record that explains what changed.
