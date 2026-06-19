# SEIS Command Center

Status: Coordination placeholder

The current implementation evidence for Command Center is `apps/seis-core`.
This folder records the future app-facing documentation surface so the product
and AI Core contracts can evolve without pretending a separate implementation
already exists.

## Current Rule

- Use `apps/seis-core` for the current local-first shell.
- Use `docs/product/*` for product contracts.
- Use `docs/architecture/ai-core-app-shared-contracts.md` for shared AI/app
  contracts.
- Do not add fake controls or live provider status.
