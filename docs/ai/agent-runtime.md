# SEIS Agent Runtime

## Purpose

Define the human-supervised agent runtime contract for SEIS AI Core. Agents are
bounded operators under policy; they do not own repositories, credentials,
security policy, deployment authority, or model release authority.

## Scope

The runtime will coordinate agent roles, permissions, tool scopes, handoffs,
validation, cancellation, and audit events. This document does not implement
runtime orchestration.

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Agent definitions | Documented fixture, not implemented runtime orchestration | `AGENTS.md` names the multi-assistant model; `docs/development/agents/ai-workforce-assignments.md`; `content/development/seis-ai-core-agent-role-schema.json`. | No live scheduler or write-capable runtime exists. | Keep role schema plan-only until runtime tests exist. |
| Tool permissions | Documented fixture | `content/development/seis-ai-core-agent-permission-matrix.json`. | No live permission registry enforcement exists. | Keep write-gated and external-gated levels planned until approval fixtures are wired to execution. |
| Handoff protocol | Documented | `AGENTS.md` and this document. | No handoff artifact schema. | Add a reviewer handoff template later. |
| Automation runtime | Dry-run fixture only | `scripts/ai-launcher.cjs`, `content/development/seis-ai-core-subagent-review-ledger.json`, `content/development/seis-ai-core-subagent-runtime-fixtures.json`, `content/development/seis-ai-core-dry-run-task-queue.json`, `content/development/seis-ai-core-cancellation-fixture.json`, `content/development/seis-ai-core-approval-fixture.json`, `content/development/seis-ai-core-redaction-fixture.json`, `content/development/seis-ai-core-execution-ledger-fixture.json`. | No background runner, write runner, or external mutation runner exists. | Keep automation dry-run until cancellation, approval, redaction, ledger, and validation behavior is executable and tested. |
| Version binding | Documented fixture | `content/development/seis-ai-core-version-registry.json`, `content/development/seis-ai-core-provider-registry.json`, `seis_ai_core_version_status`, `seis_ai_core_provider_status`. | No live release channel, live provider adapter, or health-check runtime exists. | Keep SEIS AI Core v0.1 as a zero-key, status/plan-only application-layer profile. |
| Version promotion dry-run | Documented fixture | `content/development/seis-ai-core-version-promotion-gates.json`, `seis_ai_core_version_promotion_dry_run`. | Dry-run output does not approve releases or enable write lanes. | Use promotion gate output as internal review evidence only. |
| MCP runtime contract | Local smoke verified | `content/development/seis-ai-core-mcp-runtime-contract.json`, `seis://ai/mcp-runtime-contract.json`. | This does not authenticate remote MCP servers, connectors, credentials, SSH, deploys, or GitHub mutation. | Keep runtime resources verified by `node --test packages/seis-ai/test/mcp-smoke.test.mjs`. |
| Personal sub-agent lanes | Integrated as status/plan-only | `content/development/seis-ai-core-subagent-operating-model.json`, `content/development/seis-ai-core-subagent-review-ledger.json`, `content/development/seis-ai-core-subagent-runtime-fixtures.json`, `content/development/seis-sub-agent-5-year-plan.json`, `content/development/seis-agent-lane-status.json`, `content/development/seis-ai-core-agent-permission-matrix.json`, `docs/ai/seis-ai-core.md`, `packages/seis-ai/src/agent/tools.mjs` | No write-gated or background runtime exists. | Promote the permission matrix fixture into executable enforcement tests before enabling autonomous write actions. |

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

Before the agent runtime is marked implemented, add:

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

Runtime inspection tools currently include `seis_ai_core_provider_status`,
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

Connect the documented fixtures to executable dry-run tests before enabling any
background or write-capable automation.
