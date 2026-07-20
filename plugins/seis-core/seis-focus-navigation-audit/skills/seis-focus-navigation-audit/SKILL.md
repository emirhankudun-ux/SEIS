---
name: seis-focus-navigation-audit
description: Audit bounded local UI source for static keyboard, focus, semantic-control, and reduced-motion evidence without launching a browser.
---

# SEIS Focus Navigation Audit

Use this skill when a SEIS UI needs a deterministic, local read-only review of
static keyboard, focus, ARIA, semantic-control, and reduced-motion evidence.

## Safety boundary

- Reads only bounded local HTML, JavaScript, and CSS source.
- Never starts a browser, drives a screen reader, edits source, or calls a network service.
- Reports relative paths and marker names only; it never returns source excerpts.
- A ready result is static evidence, not WCAG certification or a release approval.

## Commands

    node scripts/seis-focus-navigation-audit-mcp-server.mjs --status
    node scripts/seis-focus-navigation-audit-mcp-server.mjs --audit --path /path/to/local/ui-source
    node scripts/seis-focus-navigation-audit-mcp-server.mjs --evidence

The MCP tools are `seis_focus_navigation_audit_status`,
`seis_focus_navigation_audit`, and `seis_focus_navigation_evidence`.

## Findings and handoff

- Resolve positive `tabindex` and non-native interactive roles without a
  focusable target before considering a UI handoff.
- Treat missing `:focus-visible`, semantic controls, or reduced-motion source
  evidence as an incomplete static review.
- Follow with manual keyboard, focus-order, focus-obscuration, screen-reader,
  mobile viewport, and reduced-motion review before release.

## Goal linkage

Use within `SEIS-GOAL-021` and `SEIS-BL-028`. This complements
`seis-a11y-regression`, which audits JSON declarations rather than actual UI
source files.
