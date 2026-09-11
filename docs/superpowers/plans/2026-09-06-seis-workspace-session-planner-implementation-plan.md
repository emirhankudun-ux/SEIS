# SEIS Workspace Session Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a tested deterministic session planner for bounded SEIS workspace work.

**Architecture:** Canonical JSON input feeds a dependency-free ESM validator and planner. A read-only CLI, checker, portable schema, documentation, tests, and CI complete the vertical slice.

**Tech Stack:** Node.js 24, ESM, JSON, JSON Schema, Node test runner, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-06-seis-workspace-session-planner-design.md`

## Global Constraints

- No provider execution, external write, deployment, private-data read, source import, or automatic task execution.
- Tasks use `prepare`, `build`, `verify`, and `handoff` stages only.
- Output is deterministic and human approval remains authoritative.

---

### Task 1: Contract and red tests

- [x] Add the public-safe session fixture.
- [x] Add tests for deterministic planning, ordering, blockers, cycles, timeboxes, stages, evidence, and authority boundaries.
- [x] Run the hosted tests and confirm `ERR_MODULE_NOT_FOUND` for the absent planner module.

### Task 2: Planner implementation

- [x] Add the portable input schema.
- [x] Implement validation, graph ordering, checkpoints, blockers, recovery, and summary.
- [x] Add the read-only CLI and real-fixture checker.

### Task 3: Documentation and verification

- [x] Add architecture documentation and SHA-pinned read-only CI.
- [x] Confirm the focused workflow, SEIS System Gates, and Foundation Check on GitHub.
