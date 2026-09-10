# MARIA × SEIS Runtime v18 Foundation Implementation Plan

**Goal:** Build a safe modular foundation from the MARIA v17 prototype while preserving SEIS architecture and public-safe repository behavior.

**Tech stack:** Python 3.10+ standard library, unittest, GitHub Actions.

### Task 1 — Red tests

- [x] Define capability resolution behavior.
- [x] Define per-action approval policy.
- [x] Define provenance-aware context precedence.
- [x] Define local-first capability-aware model routing.
- [x] Define full-request prompt cache identity.
- [x] Define safe argv command parsing.
- [x] Confirm hosted tests fail with `ModuleNotFoundError: No module named 'maria_runtime'` while the first implementation was absent.
- [x] Add project-aware continuation tests and confirm hosted failure with `ModuleNotFoundError: No module named 'maria_runtime.projects'` before implementing them.

### Task 2 — Runtime contracts

- [x] Implement context engine.
- [x] Implement capability/tool registry and health states.
- [x] Implement permission engine.
- [x] Implement model registry/router.
- [x] Implement prompt cache v2.
- [x] Implement safe command policy.
- [x] Implement personal Project Registry and Work Modes.
- [x] Implement verified Continuation Resolver.

### Task 3 — Product entry point and verification

- [x] Add thin `apps/maria-desktop/maria.py` launcher.
- [x] Add runtime checker and architecture documentation.
- [x] Add read-only GitHub Actions workflow.
- [ ] Confirm focused checks on hosted CI after the project-aware implementation.
