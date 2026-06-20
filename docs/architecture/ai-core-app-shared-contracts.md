# AI Core And App Shared Contracts

Status: Foundation contract map

SEIS AI Core and the SEIS App / Command Center must evolve together. They share
concepts, state names, evidence links, approval gates, and audit events.

## Shared Objects

| Object | AI Core meaning | App meaning |
| --- | --- | --- |
| `modelRoute` | Selected provider/local route and privacy mode. | Route card, status, and blocked reason. |
| `promptVersion` | Reviewed prompt asset and behavior version. | Prompt detail view and regression status. |
| `agentTask` | Supervised agent run request. | Task center row and timeline. |
| `approvalRequest` | Gate before privileged action. | Approval center item and decision state. |
| `evaluationResult` | Prompt, route, agent, or model test result. | Evidence and quality signal. |
| `auditEvent` | Redacted action or decision record. | Evidence locker entry. |
| `repositoryFinding` | Repo scan or PR review finding. | Repository center signal. |
| `documentationStatus` | Docs freshness and source-of-truth status. | Documentation hub signal. |
| `securityFinding` | Security issue or policy block. | Security center signal. |
| `roadmapItem` | Planned AI/app/system work. | Roadmap center item. |
| `moduleMaturity` | Planned, draft, alpha, beta, stable, blocked. | UI badge and filtering state. |
| `llmExecutionMode` | Local, provider, offline, disabled, metadata-only, or research-only mode. | Visible AI mode and routing constraint. |
| `aiSurface` | A named LLM-powered surface with context/tool/approval rules. | App module or assistant view. |
| `repositoryIntelligence` | Structured repo, PR, docs, validation, and maturity evidence. | Evidence-backed status cards and assistant context. |
| `goalTrackingState` | Goal progress, blockers, validation, and completion evidence. | Goal center and assistant status. |

## State Vocabulary

Use these states consistently across AI Core and app views:

- `ready`
- `draft`
- `planned`
- `blocked`
- `approval-needed`
- `degraded`
- `unknown`
- `running`
- `failed`
- `validated`

## LLM Execution Modes

Use these modes consistently:

- `local-only`
- `local-preferred`
- `external-provider-allowed`
- `external-provider-redacted`
- `metadata-only`
- `offline`
- `disabled`
- `research-only`

## Evidence Rule

Every operational UI claim should link to evidence: a source file, generated
report, check output, PR, issue, audit event, or manual review note. If evidence
is absent, the UI must show unknown, planned, blocked, or approval needed.

## Repository Intelligence Rule

Repository intelligence must distinguish official docs, review reports, archive
material, mock data, scan-generated data, live data, planned data, and unknown
status. Archive or mock material must not be treated as official source of truth.

## Schema And Fixture Evidence

The first shared contract implementation is fixture-backed:

- `packages/shared-types/schemas/ai-core-app-contract.schema.json`
- `packages/shared-types/fixtures/ai-core-command-center-foundation.json`
- `packages/model-router/fixtures/model-router-route-contracts.json`
- `packages/agent-runtime/fixtures/agent-runtime-task-lifecycle.json`
- `npm run check:ai-core-app-contracts`

The schema and fixture cover `modelRoute`, `promptVersion`, `agentTask`,
`approvalRequest`, `evaluationResult`, `auditEvent`, `repositoryFinding`,
`documentationStatus`, `securityFinding`, `roadmapItem`, `moduleMaturity`,
`llmExecutionMode`, `aiSurface`, `repositoryIntelligence`, and
`goalTrackingState`.

The shared fixture now includes model-router contract evidence for local-only,
metadata-only, and approval-needed provider routes. Provider-backed routes remain
approval-needed and do not imply live provider readiness.

It also includes agent-runtime lifecycle evidence for validated,
approval-needed, and blocked task states. Approval-needed and blocked task
records do not imply autonomous execution, provider access, SSH execution, or
GitHub write authority.

The fixture is intentionally local and metadata-only. It does not enable live
provider routing, expose provider secrets, store raw prompts, perform GitHub
write actions, execute SSH commands, or claim model training.

## First Implementation Shape

Start with JSON fixtures and typed interfaces before live data adapters. The
first app views should consume contract-shaped data, not raw provider payloads.
