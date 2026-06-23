# Agent Runtime

Status: Foundation contract recovered from PR #44

The agent runtime coordinates human-supervised SEIS agents. It defines roles,
inputs, allowed actions, forbidden actions, approvals, validation, and audit
events.

## Runtime Principles

- Human approval controls privileged operations.
- Agents may recommend but do not silently approve their own expansion.
- Tool output and repository content are untrusted input.
- Missing credentials or access produce a blocked state.
- Destructive operations require explicit approval and rollback plan.
- Every run records safe metadata and validation evidence.

## Agent Roles

| Role | Responsibility | Approval-sensitive actions |
| --- | --- | --- |
| Architect Agent | Architecture fit, boundaries, ADRs, component maps. | Major architecture decisions. |
| Security Agent | Threat model, secret safety, permission review. | Auth, SSH, firewall, secret, or policy changes. |
| Documentation Agent | Source-of-truth docs and review records. | Replacing official docs. |
| Repository Agent | Branch, diff, PR, CI, and cleanup planning. | Push, merge, branch deletion, history rewrite. |
| Command Center Operator | App state, evidence links, UI workflow planning. | Live actions from UI. |
| AI Systems Agent | Router, prompts, evals, memory, local-model strategy. | Provider calls, datasets, fine-tunes, training. |

## Run Contract

Each run should include:

- `runId`
- `agentId`
- `task`
- `inputs`
- `allowedActions`
- `forbiddenActions`
- `approvalState`
- `toolCalls`
- `outputs`
- `validation`
- `auditEvents`
- `status`

## Bounded Subagent Model

SEIS may use subagents for focused exploration, implementation, validation, or
review, but subagents are not unlimited autonomous workers. Each delegated run
must inherit the parent task's privacy, security, and approval boundaries.

Each bounded subagent run should define:

- `parentRunId`
- `delegationDepth`
- `maxDelegationDepth`
- `childAgentLimit`
- `spawnPolicy`
- `requiresHandoff`
- `stepBudget`
- `timeBudgetMinutes`
- `costBudgetMode`
- `contextBudgetMode`
- `escalationPath`

Foundation fixtures keep `maxDelegationDepth` at `0` or `1`. Higher depth,
write-capable delegation, provider routing, GitHub writes, SSH execution,
deployment, dataset access, or model research execution require separate human
approval, validation, and rollback evidence.

The five-year operating model is documented in
`docs/ai/seis-ai-operating-model-5-year.md`. It defines the agent organization,
operating cadence, maturity path, Command Center integration, metrics, and
non-claims for SEIS AI operation.

## Forbidden Defaults

Agents must not:

- expose secrets
- push to main
- merge without approval
- deploy without approval
- run destructive commands without approval
- train models or download datasets without approval
- claim validation that was not performed

## First Implementation Shape

The first runtime should be a small typed state machine with fixture-backed
agents and approval states. Full autonomous orchestration is out of scope for
the foundation pass.

## Fixture Evidence Boundary

This recovery branch includes the local agent-runtime task lifecycle fixture
pack under `packages/agent-runtime/`:

- `schemas/agent-runtime-task-lifecycle.schema.json`
- `fixtures/agent-runtime-task-lifecycle.json`
- `npm run check:agent-runtime-lifecycle`

It covers:

- a validated documentation review task with no privileged operation
- a validated five-year AI operating model review with bounded subagent rules
- an approval-needed external-provider-routing task that performs no provider
  call
- a blocked SSH/deployment review task that performs no command execution

This recovery document does not imply autonomous orchestration, production
agent readiness, GitHub write permission, SSH execution, external provider
execution, model training, benchmark performance, checkpoint publication, or
model-card readiness.
