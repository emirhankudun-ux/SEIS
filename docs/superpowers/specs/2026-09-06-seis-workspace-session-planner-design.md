# SEIS Workspace Session Planner Design

## Goal

Turn a bounded SEIS-owned mission into a deterministic, dependency-safe, timeboxed, human-supervised workspace session without executing tools or writing externally.

## Architecture

A public-safe input contract declares mission, timebox, available capabilities, task dependencies, stages, approvals, evidence, and authority policy. A dependency-free planner validates the graph, derives a stable execution order, groups work into checkpoints, reports blockers, and emits recovery instructions. A read-only CLI and focused checker expose the result.

## Success criteria

- identical input produces identical output;
- dependencies are acyclic and cannot move backward across prepare/build/verify/handoff stages;
- total duration fits the declared timebox;
- missing capabilities and owner-required actions are visible blockers;
- every checkpoint has evidence and recovery information;
- provider execution, external writes, deployment, private data, and automatic execution remain false;
- no task is executed by the planner.
