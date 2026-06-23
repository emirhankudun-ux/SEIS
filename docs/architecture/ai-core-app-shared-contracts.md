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
| `toolRegistryEntry` | Tool/plugin permission, risk class, and approval boundary. | Tool registry row and disabled/approval state. |
| `knowledgeSource` | Retrieval source class, privacy mode, freshness, and ingestion boundary. | Knowledge source row and blocked/approved retrieval state. |
| `retrievalQueryAdapter` | Local query adapter that selects approved metadata-only sources and blocks unsafe sources. | Local Retrieval card, no-content lookup boundary, and blocked archive guard. |
| `retrievalFilterControl` | Local-only filter control for narrowing fixture-backed retrieval metadata. | Query, source-class, transcript-state, and reset controls that never call providers. |
| `retrievalEmptyStateTestCase` | Expected empty-state case for local metadata filtering. | Evidence-card and no-content transcript empty-state regression with separate no-result copy. |
| `retrievalResultCard` | Metadata-only evidence result selected from approved/local knowledge sources. | Retrieval Result Cards area with source class, freshness, privacy mode, and evidence link. |
| `noContentSearchTranscript` | Empty or blocked local search transcript that returns no raw content. | No-Content Search Transcripts area with blocked/empty state and safe explanation. |
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
| `goalEvidenceGate` | Required evidence gate that constrains whether a goal can be treated as validated or complete. | Goal and AI Core evidence panel gate card. |
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
- `packages/tool-registry/fixtures/tool-registry-permissions.json`
- `packages/data/fixtures/knowledge-source-classification.json`
- `packages/data/fixtures/local-readonly-retrieval-query-adapter.json`
- `packages/data/fixtures/local-readonly-retrieval-search-transcript.json`
- `npm run check:ai-core-app-contracts`

The schema and fixture cover `modelRoute`, `promptVersion`, `agentTask`,
`toolRegistryEntry`, `knowledgeSource`, `retrievalQueryAdapter`,
`retrievalFilterControl`, `retrievalEmptyStateTestCase`,
`retrievalResultCard`, `noContentSearchTranscript`, `approvalRequest`,
`evaluationResult`, `auditEvent`, `repositoryFinding`, `documentationStatus`,
`securityFinding`, `roadmapItem`, `moduleMaturity`, `llmExecutionMode`,
`aiSurface`, `repositoryIntelligence`, `goalEvidenceGate`, and
`goalTrackingState`.

The shared fixture also links the five-year AI operating model in
`docs/ai/seis-ai-operating-model-5-year.md`. Command Center can show this as an
`agentTask`, `evaluationResult`, `auditEvent`, `roadmapItem`, and
`goalEvidenceGate`, but that is still a fixture-backed operating contract. Goal
evidence gates define which required checks must pass before a goal can be
treated as validated or complete. They do not enable live subagent spawning,
autonomous orchestration, provider routing, GitHub writes, SSH execution,
deployment, model training, checkpoints, benchmarks, or model-card claims.

The shared fixture now includes model-router contract evidence for local-only,
metadata-only, and approval-needed provider routes. Provider-backed routes remain
approval-needed and do not imply live provider readiness.

It also includes agent-runtime lifecycle evidence for validated,
approval-needed, and blocked task states. Approval-needed and blocked task
records do not imply autonomous execution, provider access, SSH execution, or
GitHub write authority.

The agent-runtime evidence now includes bounded delegation policy, execution
budget, and escalation-path metadata for each run. These fields are operating
guardrails for future subagent workflows, not proof that production subagents
are running.

It also includes tool-registry evidence for read-only, local-write,
external-write, and privileged tool classes. Approval-needed and blocked tool
records do not imply plugin installation, GitHub writes, SSH execution,
deployment authority, provider calls, or secret access.

It also includes knowledge-source classification evidence for official docs,
generated reports, local fixture contracts, and blocked assistant archive
material. Blocked archive records do not imply retrieval ingestion, memory
writes, provider routing, source-code copying, autonomous push/merge, active
countermeasures, poisoned data injection, memetic manipulation, autonomous
payments, infrastructure provisioning, fake BCI claims, or fake model ownership.

It also includes the `local-readonly-retrieval-query-adapter` fixture, which
connects the Command Center Local Retrieval panel to approved/local
knowledge-source metadata while keeping discarded assistant archive material
blocked. The adapter returns source metadata and evidence links only; it does
not call providers, expose provider keys, store raw content, create embeddings,
write persistent memory, mutate GitHub, execute SSH, deploy, pay, provision
infrastructure, or claim model training.

It also includes the `local-readonly-retrieval-search-transcript` fixture,
which connects Command Center Retrieval Result Cards and No-Content Search
Transcripts to the same approved/local metadata boundary. Result cards expose
source metadata and evidence links only. No-content transcripts keep
`resultCount` at `0` and represent empty or blocked searches. This is not a
live search engine, retrieval index, embedding system, provider call, secret
lookup, memory write, GitHub write, SSH execution, deployment, payment,
infrastructure mutation, benchmark, or model-training claim.

The same fixture now declares local `retrievalFilterControl` records and
`retrievalEmptyStateTestCase` records for the Command Center filter toolbar.
The empty-state cases keep separate expected messages for Retrieval Result
Cards and No-Content Search Transcripts, matching the two rendered panels.
These controls filter already loaded fixture metadata in the browser only; they
do not perform network requests, create live retrieval, read secrets, write
memory, create embeddings, or escalate to provider routing.

It also includes the `seis-10m-token-feed-budget` fixture, which connects a
10,000,000 token metadata-only budget plan to model-router, knowledge-source,
agent task, evaluation, audit, roadmap, repository-intelligence, goal, and
Command Center projection records. The budget has `tokensExecuted` set to `0`
and does not imply executed ingestion, embeddings, persistent memory writes,
external provider calls, model training, checkpoints, benchmark evidence, or
model ownership.

The fixture is intentionally local and metadata-only. It does not enable live
provider routing, expose provider secrets, store raw prompts, perform GitHub
write actions, execute SSH commands, or claim model training.

## First Implementation Shape

Start with JSON fixtures and typed interfaces before live data adapters. The
first app views should consume contract-shaped data, not raw provider payloads.
