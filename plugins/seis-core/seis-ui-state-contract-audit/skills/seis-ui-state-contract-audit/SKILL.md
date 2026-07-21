---
name: seis-ui-state-contract-audit
description: Audit bounded local UI source for explicit static loading, empty, degraded, offline, failure, approval, demo, and live-boundary state evidence.
---

# SEIS UI State Contract Audit

Use this skill when a SEIS UI needs a deterministic local, read-only source
review of its state-model markers.

## Safety boundary

- Reads only bounded local HTML, JavaScript, and CSS source.
- Never starts a browser, executes a UI, calls a provider, edits source, or uses a network service.
- Reports relative paths, line numbers, state IDs, and counts only; it never returns source excerpts.
- `attention` means a static marker is absent. It is not a claim that the runtime failed.

## Commands

    node scripts/seis-ui-state-contract-audit-mcp-server.mjs --status
    node scripts/seis-ui-state-contract-audit-mcp-server.mjs --audit --path /path/to/local/ui-source
    node scripts/seis-ui-state-contract-audit-mcp-server.mjs --evidence

The MCP tools are `seis_ui_state_contract_status`,
`seis_ui_state_contract_audit`, and `seis_ui_state_contract_evidence`.

## Findings and handoff

- Use missing `degraded`, `rate-limited`, provider-failure, or approval markers
  as an implementation/review backlog signal, not a reason to invent a runtime state.
- Preserve a clear demo/live boundary and avoid representing static text as a
  connected provider or deployed product.
- Follow static evidence with manual loading, empty, offline, error-recovery,
  approval, viewport, assistive-technology, and state-transition review.

## Goal linkage

Use within `SEIS-GOAL-021` and `SEIS-BL-038`. This complements
`seis-offline-mode-check`, `seis-a11y-regression`, and
`seis-focus-navigation-audit` without replacing any of them.
