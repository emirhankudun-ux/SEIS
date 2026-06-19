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

## Evidence Rule

Every operational UI claim should link to evidence: a source file, generated
report, check output, PR, issue, audit event, or manual review note. If evidence
is absent, the UI must show unknown, planned, blocked, or approval needed.

## First Implementation Shape

Start with JSON fixtures and typed interfaces before live data adapters. The
first app views should consume contract-shaped data, not raw provider payloads.
