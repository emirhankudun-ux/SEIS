# SEIS Platform OS Architecture

Date: 2026-06-19

SEIS Platform OS is the non-LLM operating layer for the SEIS ecosystem. It
coordinates product surfaces, repository intelligence, workflows, governance,
security, documentation, readiness, evidence, and design-system status.

## Architecture Principle

The platform must provide trustworthy state without depending on an LLM.
LLMs can summarize and recommend, but core status, approval gates, and safety
boundaries must come from deterministic data, explicit policies, and recorded
evidence.

## Bounded Modules

| Module | Responsibility | First source |
| --- | --- | --- |
| Command Center Shell | Navigation, module layout, search, status surfaces, settings. | `apps/web/` plus future app shell plan |
| Repository Intelligence | Scan repo shape, docs, risky files, validation gaps, stale records. | Local filesystem and Git metadata |
| Documentation Hub | Separate official docs, reviews, archives, handoffs, and generated reports. | `docs/INDEX.md` |
| Roadmap Center | Track backlog, next PR queue, blockers, and readiness sequence. | `docs/roadmap/` |
| Architecture Center | Track component maps, decisions, module maturity, and implementation evidence. | `docs/architecture/` |
| Security Center | Track findings, sensitive-file checks, approval gates, and exposure blockers. | `docs/security/SECURITY_BASELINE.md` |
| Approval Center | Record blocked dangerous actions and human approval requirements. | `docs/governance/APPROVAL_WORKFLOW_PLATFORM.md` |
| Evidence Locker | Store validation output, review evidence, release evidence, and status snapshots. | `docs/reviews/`, `reports/` |
| Release Center | Run dry-runs and maintain version/changelog/release-readiness evidence. | `docs/readiness/RELEASE_PUBLIC_READINESS_SYSTEM.md` |
| Workflow Engine | Task queues, review queues, recurring checks, and safe dry-runs. | `docs/governance/APPROVAL_WORKFLOW_PLATFORM.md` |
| Design System | Tokens, component states, accessibility, keyboard, localization readiness. | `docs/design-system/SEIS_DESIGN_SYSTEM_FOUNDATION.md` |
| Workspace Center | Local, GitHub, Codespaces, SSH/cloud, backup, sync, and recovery policies. | Future workspace policy docs |

## Data Modes

| Mode | Input | Trust level | Use |
| --- | --- | --- | --- |
| Manual docs | Maintainer-edited Markdown | Human-reviewed | Current foundation status and roadmap |
| Scan outputs | Local deterministic scripts | Reproducible | Repo health, missing docs, risky files, links, validation |
| Fixture data | Mock JSON | Demo only | UI development and design review |
| Live integrations | GitHub/CI/cloud/SSH APIs | Approval-gated | Current PR, Actions, workspace, release state |
| LLM summaries | Model output over evidence | Advisory only | Summaries, drafts, classifications, recommendations |

## Core Data Records

Initial records should be representable as Markdown tables, then promoted to
JSON when app implementation needs stronger contracts:

- `RepositoryStatus`
- `BranchStatus`
- `PullRequestRecord`
- `RecoveryCandidate`
- `DocumentationRecord`
- `RoadmapItem`
- `ArchitectureDecision`
- `SecurityFinding`
- `ValidationRun`
- `ReleaseReadinessRecord`
- `PublicReadinessRecord`
- `WorkflowTask`
- `ApprovalRequest`
- `EvidenceRecord`
- `ModuleHealth`
- `ToolRegistryEntry`
- `WorkspaceProfile`
- `DesignSystemState`

## Module Health States

Use explicit states:

- `healthy`
- `warning`
- `blocked`
- `unknown`
- `stale`
- `approval_needed`
- `not_configured`
- `not_applicable`

Do not infer healthy status from silence. Unknown data must render as unknown.

## Action Risk Levels

| Risk | Examples | Default behavior |
| --- | --- | --- |
| Low | Read docs, scan local tracked files, render fixture data. | Allowed locally |
| Medium | Regenerate reports, run validation, update docs. | Allowed when scoped and reversible |
| High | Delete files, alter CI, install dependencies, query external APIs. | Approval required |
| Critical | Push/merge, deploy, SSH, secrets, repo settings, releases, model training. | Explicit approval and rollback plan required |

## Implementation Sequence

1. Stabilize docs and validation blockers.
2. Define deterministic scanner outputs.
3. Build static/manual Command Center views.
4. Add scan-generated local status.
5. Add approval queue and evidence locker.
6. Add public/release readiness dry-runs.
7. Add optional live integrations behind approval gates.
8. Add optional LLM summaries only after evidence contracts exist.

## Non-LLM Acceptance Criteria

The Platform OS foundation is credible when a maintainer can open Command
Center with no LLM configured and still understand:

- Current repo health.
- Missing docs and validation gaps.
- Security/public/release blockers.
- Next PR queue.
- Approval-required actions.
- Evidence behind each status.
- Module maturity and stale data.
