# @seis/agent-runtime

Status: Fixture-backed contract package

This package will hold the supervised agent runtime contract for SEIS. It is not
a full autonomous orchestration engine in this foundation pass.

## Planned Responsibilities

- define agent roles
- enforce allowed and forbidden actions
- track approval state
- record safe audit events
- expose task state to Command Center
- validate outputs against task contracts

## Current Fixture Evidence

- `schemas/agent-runtime-task-lifecycle.schema.json` defines lifecycle states,
  approval states, validation evidence, and redacted audit metadata.
- `fixtures/agent-runtime-task-lifecycle.json` covers a validated documentation
  task, an approval-needed provider-routing task, and a blocked SSH/deployment
  task.
- `npm run check:agent-runtime-lifecycle` validates lifecycle states, approval
  boundaries, forbidden actions, safe audit metadata, non-claims, and evidence
  paths.

The current fixture pack does not execute autonomous agents, expand agent
permissions, approve provider routing, run SSH commands, mutate GitHub state, or
claim production orchestration readiness.

See `docs/ai/agent-runtime.md`.
