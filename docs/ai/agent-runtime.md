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
| Agent definitions | Documented assignment layer, planned runtime schema | `AGENTS.md` names the multi-assistant model; `docs/development/agents/ai-workforce-assignments.md` defines specialist ownership. | No typed runtime schema. | Define a small role schema. |
| Tool permissions | Planned | Security boundaries are documented. | No permission registry. | Add read/write/destructive action categories. |
| Handoff protocol | Documented | `AGENTS.md` and this document. | No handoff artifact schema. | Add a reviewer handoff template later. |
| Automation runtime | Planned | `scripts/ai-launcher.cjs` exists, but no bounded runtime contract is implemented. | No tests for recursion, cancellation, or tool limits. | Keep automation dry-run until contracts exist. |

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

- role schema
- tool permission matrix
- dry-run task queue fixture
- cancellation fixture
- destructive-action approval fixture
- path traversal denial fixture
- redacted tool-output test
- handoff report template

## Related Documents

- [seis-ai-core.md](seis-ai-core.md)
- [model-router.md](model-router.md)
- [prompt-engine.md](prompt-engine.md)
- [../development/agents/ai-workforce-assignments.md](../development/agents/ai-workforce-assignments.md)
- [../development/agents/README.md](../development/agents/README.md)
- [../../AGENTS.md](../../AGENTS.md)

## Next Safe Action

Define a minimal agent role schema and permission matrix before enabling any
background or write-capable automation.
