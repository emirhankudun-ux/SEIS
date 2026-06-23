# SEIS AI Operating Model - Five-Year Program

Status: Foundation contract

## Purpose

This document defines how SEIS should operate its AI Core, Command Center, and
agent system over a five-year horizon. It turns the long-term AI ambition into
a bounded operating model that can be reviewed, validated, and exposed through
Command Center without pretending that SEIS already has production autonomy,
live provider routing, or trained SEIS-owned model weights.

The model borrows the discipline of large technology organizations: explicit
ownership, staged maturity gates, evidence-backed decisions, incident review,
release discipline, and clear separation between research, application logic,
provider capability, and human approval.

## Scope

In scope:

- AI Core operating cadence.
- Agent organization and subagent boundaries.
- Command Center evidence and approval surfaces.
- Model-router, prompt-engine, and agent-runtime coordination.
- Evaluation, release, incident, and research gates.
- Five-year maturity path from fixture-backed contracts to governed platform
  operation.

Out of scope in this foundation pass:

- Live provider calls.
- Provider credential handling changes.
- Autonomous GitHub writes.
- SSH execution.
- Deployments.
- Model training.
- Benchmarks.
- Checkpoints.
- Model cards for nonexistent models.

## Current Status

The current implementation is fixture-backed and documentation-backed.

Evidence:

- `roadmap/seis-ai-core-command-center-5-year-development-program.md`
- `docs/ai/agent-runtime.md`
- `packages/agent-runtime/fixtures/agent-runtime-task-lifecycle.json`
- `packages/shared-types/fixtures/ai-core-command-center-foundation.json`
- `npm run check:agent-runtime-lifecycle`
- `npm run check:ai-core-app-contracts`

This means the operating model is reviewable and visible to local Command
Center fixture surfaces. It does not mean autonomous orchestration is live.

## Non-Claims

- No live autonomous orchestration is implemented.
- No unbounded subagent delegation is enabled.
- No subagent can self-approve permission expansion.
- No external provider call is performed by this operating model.
- No GitHub write action, SSH execution, deployment, payment, infrastructure
  mutation, dataset download, benchmark, training run, checkpoint, or model card
  is created.

## Operating Principles

- Human governance is the final authority.
- Every agent has a bounded role, tool scope, and validation requirement.
- Agents may propose, summarize, and prepare evidence; they do not expand their
  own permissions.
- Privileged actions require approval, audit, rollback notes, and explicit
  evidence.
- Unknown status stays unknown until evidence exists.
- Mock, fixture, local, read-only, provider, deployment, and research states are
  always labeled separately.
- Provider routing is not model ownership.
- Prompt versions are not trained weights.
- Retrieval and memory are not training.
- SEIS Universe remains research-only until data, training, checkpoint, and
  evaluation evidence exists.

## Agent Organization

| Agent | Mission | Primary outputs | Approval boundary |
| --- | --- | --- | --- |
| Orchestrator Agent | Convert user goals into bounded work slices and route them to specialist agents. | Plan, task graph, status summary, escalation list. | Cannot approve privileged actions or expand agent permissions. |
| Product Agent | Maintain user journeys, product scope, and Command Center feature readiness. | Requirements, acceptance criteria, release notes. | Cannot mark features implemented without evidence. |
| Architecture Agent | Maintain module boundaries, ADRs, and contract alignment. | Architecture review, ADR proposal, dependency risk notes. | Major architecture changes need review. |
| AI Systems Agent | Own model-router, prompt-engine, provider modes, local model strategy, and eval links. | AI Core contracts, route policy, prompt version notes, eval requirements. | Provider calls and sensitive routing need approval. |
| Agent Runtime Agent | Own lifecycle states, permissions, delegation limits, and audit metadata. | Agent role contract, run lifecycle, permission matrix. | Cannot allow recursive delegation without configured limits. |
| Security Agent | Review secrets, provider data policy, tool permissions, SSH, and release risk. | Security findings, blocked actions, mitigation plan. | Auth, SSH, secret, deployment, and policy changes need approval. |
| QA and Evaluation Agent | Define validation gates, regression suites, browser evidence, and evidence freshness. | Test plan, eval report, blocked validation notes. | Cannot claim tests passed unless actually run. |
| Documentation Agent | Keep source-of-truth docs, reviews, status, and roadmap aligned. | Docs updates, review records, source links. | Replacing official governance needs approval. |
| Repository Intelligence Agent | Inspect Git, PRs, branches, generated reports, and recovery opportunities. | Repo status, PR rescue notes, branch plan. | Push, merge, branch deletion, and history rewrite need approval. |
| UX and Design System Agent | Keep Command Center calm, accessible, structured, and evidence-first. | UX acceptance notes, interaction map, accessibility risks. | Cannot create fake controls or fake live statuses. |
| DevOps and Release Agent | Own CI, release evidence, deployment readiness, rollback, and incident runbooks. | Release checklist, workflow review, rollback plan. | Deployment, SSH, tags, releases, and infrastructure changes need approval. |
| Research Agent | Maintain SEIS Universe research gates, data provenance, tokenizer research, and model claims. | Research plan, data policy, experiment gate, model-claim audit. | Training, datasets, checkpoints, benchmarks, and model releases need approval. |
| Knowledge Agent | Own source classes, retrieval boundaries, memory policy, and context hygiene. | Knowledge-source classification, retrieval notes, memory boundary review. | External routing, raw archive ingestion, and persistent memory writes need policy approval. |

## Bounded Subagent Rules

Subagents are allowed only when the work can be bounded.

Required subagent contract:

- clear role
- clear file or document scope
- clear allowed actions
- clear forbidden actions
- maximum delegation depth
- maximum step budget
- validation expected
- output format
- evidence path
- approval triggers
- cancellation behavior
- failure behavior

Forbidden subagent behavior:

- self-approval
- silent permission expansion
- infinite delegation
- unbounded context collection
- secret access through prompts
- editing unrelated files
- live provider routing without approval
- SSH execution without approval
- deployment without approval
- GitHub write actions without approval
- model training without approved research plan

## Operating Cadence

| Cadence | Purpose | Outputs |
| --- | --- | --- |
| Per task | Keep work bounded and reviewable. | Goal, scope, branch, changed files, validation, risks. |
| Daily | Preserve momentum without hidden autonomy. | Active blockers, validation state, next safe actions. |
| Weekly | Review quality and backlog drift. | Agent run summary, PR queue, evidence gaps, risk register. |
| Monthly | Review platform maturity. | Command Center maturity, AI Core maturity, security baseline, release readiness. |
| Quarterly | Set product and architecture bets. | ADR queue, roadmap corrections, provider/local model strategy updates. |
| Annual | Recalibrate five-year direction. | Program review, model research gate, public/release readiness plan. |

## Five-Year Maturity Path

| Year | Operating focus | Promotion evidence |
| --- | --- | --- |
| Year 1 | Foundation contracts and local fixture surfaces. | Shared schemas, Command Center fixture views, agent lifecycle checks, no-key startup evidence. |
| Year 2 | Controlled local-first AI workflows. | Local repository/docs assistants, privacy modes, prompt regression, approval center MVP. |
| Year 3 | Platform beta workflows. | Repository, PR, security, release, roadmap, and documentation agents with cancellation and audit. |
| Year 4 | SEIS Universe research gate. | Dataset provenance, tokenizer research, nano-model experiment plan, checkpoint governance. |
| Year 5 | Platform-grade governance. | Release evidence, incident readiness, eval trends, provider/local/model boundaries in UI and docs. |

## Command Center Integration

Command Center now exposes this operating model through a read-only,
fixture-backed AI Operating Model panel in `apps/seis-core/index.html`. That
panel is backed by `task-ai-operating-model`, `eval-ai-operating-model`,
`audit-ai-operating-model`, `roadmap-year-1-ai-operating-model`,
`goal-five-year-development`, and the related `goalEvidenceGates` records in
`packages/shared-types/fixtures/ai-core-command-center-foundation.json`.

Command Center should continue exposing this operating model through:

- Agent Center role cards.
- AI Core route and prompt panels.
- Approval Center requests.
- Evidence Locker events.
- Evaluation Lab status.
- Roadmap Center year-by-year tracks.
- Security Center blocked-action summaries.
- Knowledge Center source-class and freshness views.

The UI must show:

- current status
- maturity state
- evidence path
- blocker
- next safe action
- approval requirement

It must not show:

- fake live provider health
- fake training results
- fake deployment state
- fake benchmark numbers
- hidden autonomous authority

The current Command Center panel does not make provider calls, spawn live
agents, execute SSH commands, mutate GitHub, deploy infrastructure, run model
training, run benchmarks, or claim a completed SEIS-owned model.

## Operating Metrics

Track these as metadata before automating them:

- evidence coverage by module
- validation pass/fail/blocked rate
- prompt regression freshness
- route decision audit coverage
- approval-needed action count
- blocked dangerous action count
- stale evidence count
- no-key startup readiness
- local-only mode readiness
- provider status accuracy
- security blocker aging
- accessibility issue aging
- PR lead time
- review rework rate
- incident/postmortem completion
- research claim evidence coverage

Metrics are indicators, not proof of production readiness by themselves.

## Evidence Requirements

Every operating-model claim must link to one of:

- official documentation
- schema or fixture
- validation script
- generated report
- browser QA artifact
- PR review
- human approval record
- audit event
- model research artifact with provenance

Unsupported claims must be labeled planned, unknown, blocked, or research-only.

## Related Documents

- `docs/ai/agent-runtime.md`
- `docs/ai/model-router.md`
- `docs/ai/prompt-engine.md`
- `docs/ai/provider-routing-policy.md`
- `docs/security/model-provider-data-policy.md`
- `docs/evals/evaluation-strategy.md`
- `docs/product/command-center.md`
- `docs/product/agent-task-center.md`
- `roadmap/seis-ai-core-command-center-5-year-development-program.md`

## Next Safe Action

Keep this operating model fixture-backed until the Command Center can show the
agent roles, metrics, approval states, evaluation state, and audit events from
validated local contracts. Live provider routing, SSH, deployment, GitHub write
actions, and model research execution remain separate approval-gated slices.
