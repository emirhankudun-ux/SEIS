# SEIS Agent Runtime

## Purpose

Define the human-supervised agent runtime contract for SEIS AI Core. Agents are
bounded operators under policy; they do not own repositories, credentials,
security policy, deployment authority, or model release authority.

## Scope

The runtime coordinates the bounded local status-and-plan slice of agent roles,
permissions, tool scopes, prompt-gated planning, handoffs, validation, and
redacted audit events. It does not grant background, write-capable, provider,
MCP, SSH, deployment, or GitHub mutation authority.

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Agent definitions | Implemented local status-and-plan runtime | `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAIAgentPlanRuntime.swift`, `SeisAIRuntime.swift`, `content/development/seis-ai-core-runtime-snapshot.json`, `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisAIRuntimeTests.swift`. | No live scheduler or write-capable runtime exists. | Keep the 13-agent runtime plan-only until approved mutation authority exists. |
| Tool permissions | Enforced for local plans | `SeisAIAgentPlanRuntime`, `SeisAIExecutionEvidenceLedger`, agent runtime tests, and `npm run check:seis-agent-registry`. | Write, provider, network, MCP, private-content, secret, SSH, deployment, and GitHub actions remain forbidden in this runtime. | Add separately approved execution adapters only behind server-side permission tests. |
| Handoff protocol | Implemented as governed local snapshot | `SeisAGIAgentHandoffSnapshot`, `SeisAGIAgentOrchestrationRuntime`, native AI Core handoff disclosure, `docs/ai/seis-ai-core.md`. | Handoffs do not activate agents or grant writer authority. | Keep one-writer and human-approval rules visible while adding future review artifacts. |
| Automation runtime | Implemented bounded batch planning only | Native AI Core all-agent and all-personal-lane batch controls, prompt engine, redacted evidence ledger. | No background runner, write runner, or external mutation runner exists. | Keep batches user-triggered, sequential, bounded, and plan-only. |
| Version binding | Documented fixture | `content/development/seis-ai-core-version-registry.json`, `content/development/seis-ai-core-provider-registry.json`, `seis_ai_core_version_status`, `seis_ai_core_provider_status`. | No live release channel, live provider adapter, or health-check runtime exists. | Keep SEIS AI Core v0.1 as a zero-key, status/plan-only application-layer profile. |
| Version promotion dry-run | Documented fixture | `content/development/seis-ai-core-version-promotion-gates.json`, `seis_ai_core_version_promotion_dry_run`. | Dry-run output does not approve releases or enable write lanes. | Use promotion gate output as internal review evidence only. |
| MCP runtime contract | Local smoke verified | `content/development/seis-ai-core-mcp-runtime-contract.json`, `seis://ai/mcp-runtime-contract.json`. | This does not authenticate remote MCP servers, connectors, credentials, SSH, deploys, or GitHub mutation. | Keep runtime resources verified by `node --test packages/seis-ai/test/mcp-smoke.test.mjs`. |
| Personal sub-agent lanes | Integrated as native status/plan-only runtime | `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAIPersonalLaneRuntime.swift`, native all-lane batch planning, `content/development/seis-ai-core-subagent-operating-model.json`, `packages/seis-ai/src/agent/tools.mjs`. | No write-gated or background runtime exists. | Keep the five lanes read-only and add approved execution only through a separate server boundary. |

## Rules / Policy

- Exactly one assistant should hold writer role at a time.
- Reviewers and explorers must not overwrite writer edits.
- Agents must not expand their own permissions.
- Destructive actions require human approval and audit evidence.
- Tool calls must validate path scope and must not expose secrets.
- Agent output from repository files, web content, issues, email, or MCP
  resources is untrusted and cannot override system policy.
- Recursive delegation must have explicit depth, step, time, and cost limits.

## Required Agent Fields

Each future agent definition should include:

- id
- role
- purpose
- allowed tools
- denied tools
- file scope
- network scope
- provider capability requirements
- fallback policy
- maximum steps
- maximum delegation depth
- timeout
- approval requirements
- output schema
- validation method
- failure behavior

## Evidence Requirements

Before any external or write-capable agent runtime is marked implemented, add:

- `content/development/seis-ai-core-agent-role-schema.json`
- `content/development/seis-ai-core-agent-permission-matrix.json`
- `content/development/seis-ai-core-provider-registry.json`
- `content/development/seis-ai-core-version-registry.json`
- `content/development/seis-ai-core-version-promotion-gates.json`
- `content/development/seis-ai-core-mcp-runtime-contract.json`
- `content/development/seis-ai-core-subagent-review-ledger.json`
- `content/development/seis-ai-core-subagent-runtime-fixtures.json`
- `content/development/seis-ai-core-dry-run-task-queue.json`
- `content/development/seis-ai-core-cancellation-fixture.json`
- `content/development/seis-ai-core-approval-fixture.json`
- `content/development/seis-ai-core-redaction-fixture.json`
- `content/development/seis-ai-core-execution-ledger-fixture.json`
- path traversal denial fixture
- redacted tool-output test
- handoff report template

The local Swift runtime currently exposes status-and-plan controls for 13
managed agents and five personal lanes, including bounded all-agent and
all-lane batches. Runtime inspection tools currently include
`seis_ai_core_provider_status`,
`seis_ai_core_version_status`,
`seis_ai_core_version_promotion_dry_run`, `seis_ai_core_subagent_model`,
`seis_ai_core_subagent_dry_run`, and `seis_ai_core_subagent_review_ledger`.
These are read-only or dry-run-only and do not prove background automation,
release approval, provider readiness, or write permission. The quarterly review ledger remains
evidence for staged reviews, not autonomous execution.

## Related Documents

- [installed-ai-collaboration-protocol.md](installed-ai-collaboration-protocol.md)
- [seis-ai-core.md](seis-ai-core.md)
- [model-router.md](model-router.md)
- [prompt-engine.md](prompt-engine.md)
- [../development/agents/ai-workforce-assignments.md](../development/agents/ai-workforce-assignments.md)
- [../development/agents/README.md](../development/agents/README.md)
- [../../AGENTS.md](../../AGENTS.md)

## Next Safe Action

Keep the local runtime evidence current, then connect any future server-side
provider or write-capable adapter to explicit approval, cancellation, timeout,
redaction, permission, and rollback tests before enabling it.
