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
- [ ] Run the tests and confirm they fail because the planner module is absent.

### Task 2: Planner implementation

- [ ] Add the portable input schema.
- [ ] Implement validation, graph ordering, checkpoints, blockers, recovery, and summary.
- [ ] Add the read-only CLI and real-fixture checker.

### Task 3: Documentation and verification

- [ ] Add architecture documentation and SHA-pinned read-only CI.
- [ ] Run focused and repository checks.
