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
- [ ] Confirm hosted tests fail because `maria_runtime` implementation is absent.

### Task 2 — Runtime contracts

- [ ] Implement context engine.
- [ ] Implement capability/tool registry and health states.
- [ ] Implement permission engine.
- [ ] Implement model registry/router.
- [ ] Implement prompt cache v2.
- [ ] Implement safe command policy.

### Task 3 — Product entry point and verification

- [ ] Add thin `apps/maria-desktop/maria.py` launcher.
- [ ] Add runtime checker and architecture documentation.
- [ ] Add read-only GitHub Actions workflow.
- [ ] Confirm focused checks on hosted CI.
