# SEIS Rollback

Status: active operating policy

## Required Record

Every meaningful change identifies affected paths, reversible unit, state or
data impact, disable path, verification after rollback, and owner approval
needed for remote actions.

## Repository Changes

Prefer a focused revert commit. Do not use destructive resets or broad restores
that could remove owner work. Re-run the direct checker and adjacent tests
after rollback.

## Runtime Changes

Feature flags, provider/MCP disablement, prior configuration, and credential
rotation plans must be documented before live activation. Remote rollback
requires the same target identity and approval boundaries as deployment.

## Documentation-Only Changes

Governance and schema slices have no production migration. Revert the focused
commit, then restore the previous documented source of truth and checker
expectations together.
