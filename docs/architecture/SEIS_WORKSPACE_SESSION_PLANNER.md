# SEIS Workspace Session Planner

## Purpose

The Workspace Session Planner turns one bounded SEIS-owned mission into a dependency-safe, timeboxed, evidence-aware working session. It plans work; it does not execute tools, mutate repositories, call providers, deploy, or read private data.

## Contract

The input declares:

- mission title and objective;
- total timebox;
- capabilities available in the current environment;
- tasks, stages, durations, dependencies, approvals, and evidence;
- a fail-closed authority policy.

The output derives:

- deterministic execution order;
- stage groups for `prepare`, `build`, `verify`, and `handoff`;
- time allocation and remaining capacity;
- missing-capability and owner-approval blockers;
- one evidence checkpoint and recovery record per stage;
- an explicit no-execution policy.

## Commands

```bash
node --test test/seis-workspace-session-planner.test.mjs
node scripts/check-seis-workspace-session-planner.mjs
node scripts/seis-workspace-session.mjs summary
node scripts/seis-workspace-session.mjs tasks
node scripts/seis-workspace-session.mjs checkpoints
node scripts/seis-workspace-session.mjs recovery
node scripts/seis-workspace-session.mjs blockers
```

Pass another JSON input path as the second argument after the command.

## Safety

A task that requires an unavailable capability or `owner-required` approval remains visible and blocked. The planner never interprets a plan as permission to execute it. Provider calls, external writes, deployment, private-data reads, and automatic execution are forbidden by the contract.
