# SEIS Testing

Status: active quality policy

## Test Layers

Use direct validators for schemas and governance contracts, unit tests for
logic, integration tests for package boundaries, static web smoke checks for
the no-key demo, Swift package checks for native code, and manual review for
design, accessibility, and external-state claims.

## Required Evidence

Reports name exact commands, results, failures, and skipped checks. A scoped
pass does not imply repository-wide health. Tests must cover the behavior used
to support a completion claim.

## Governance Baseline

The governance foundation runs its direct validator, goal tracking,
Master Prompt compatibility checks, open-source governance, foundation,
direct Node syntax, workspace, web audit, repository tests, and
`git diff --check`. New dependencies are not required.

## Apple and UI

Swift changes use package describe/build/test where applicable. UI changes add
accessibility and fallback checks plus rendered desktop/mobile review when a
surface changes.
