# @seis/agent-runtime

Status: Fixture-backed contract package

This package will hold the supervised agent runtime contract for SEIS. It is not
a full autonomous orchestration engine in this foundation pass.

## Planned Responsibilities

- define agent roles
- enforce allowed and forbidden actions
- bound subagent delegation depth, child count, handoff, and escalation
- track approval state
- record safe audit events
- expose task state to Command Center
- validate outputs against task contracts

## Current Fixture Evidence

- `schemas/agent-runtime-task-lifecycle.schema.json` defines lifecycle states,
  approval states, bounded delegation policy, execution budget, validation
  evidence, and redacted audit metadata.
- `fixtures/agent-runtime-task-lifecycle.json` covers a validated documentation
  task, a validated five-year AI operating model task, an approval-needed
  provider-routing task, and a blocked SSH/deployment task.
- `npm run check:agent-runtime-lifecycle` validates lifecycle states, approval
  boundaries, bounded subagent rules, execution budgets, forbidden actions,
  safe audit metadata, non-claims, and evidence paths.

The current fixture pack does not execute autonomous agents, expand agent
permissions, approve provider routing, run SSH commands, mutate GitHub state, or
claim production orchestration readiness.

See `docs/ai/agent-runtime.md` and
`docs/ai/seis-ai-operating-model-5-year.md`.
