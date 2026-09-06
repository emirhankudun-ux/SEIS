# SEIS Sovereign Product Track Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a tested sovereign product boundary for SEIS without absorbing sibling systems.

**Architecture:** A canonical JSON record is validated by a dependency-free library, focused checker, CLI, tests, and read-only GitHub Actions workflow.

**Tech Stack:** Node.js ESM, Node test runner, JSON, YAML, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-06-seis-sovereign-product-track-design.md`

### Task 1: Define ownership

- [x] Add the canonical sovereign product track record.
- [x] Narrow `project.ecosystem.yaml` to sovereign runtime ownership.
- [x] Document owned and explicitly unowned domains.

### Task 2: Validate the contract

- [x] Write focused adversarial tests.
- [x] Implement the validator and checker.
- [x] Add a read-only status CLI.

### Task 3: Verify remotely

- [x] Add a SHA-pinned, read-only workflow.
- [ ] Confirm focused workflow and existing repository checks on GitHub.
