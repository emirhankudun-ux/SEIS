# SEIS Focus Navigation Audit

`seis-focus-navigation-audit` is a public `SEIS Repo` plugin that performs a
bounded, local, read-only scan of UI source. It helps keep static evidence for
keyboard navigation, focus styles, semantic controls, ARIA state, and
reduced-motion handling visible without claiming a rendered accessibility pass.

## Why this is separate

`seis-a11y-regression` audits declared JSON accessibility metadata.
`seis-focus-navigation-audit` audits the actual local HTML, JavaScript, and CSS
source selected for review. Neither plugin launches a browser or replaces
manual accessibility QA.

This directly supports `SEIS-GOAL-021` and `SEIS-BL-028`, which requires
keyboard-navigation and focus-management evidence for SEIS Code menus, plugin
tabs, and year controls.

## Commands

```bash
node plugins/seis-core/seis-focus-navigation-audit/scripts/seis-focus-navigation-audit-mcp-server.mjs --status
node plugins/seis-core/seis-focus-navigation-audit/scripts/seis-focus-navigation-audit-mcp-server.mjs --audit --path apps/seis-core
node plugins/seis-core/seis-focus-navigation-audit/scripts/seis-focus-navigation-audit-mcp-server.mjs --evidence
npm run check:seis-focus-navigation-audit
```

The MCP tools are `seis_focus_navigation_audit_status`,
`seis_focus_navigation_audit`, and `seis_focus_navigation_evidence`.

## Static checks

- positive `tabindex` values;
- non-native interactive ARIA roles without a focusable target;
- non-native inline pointer handlers without an inline keyboard equivalent;
- `role="tab"` without `aria-selected`;
- focus-style and reduced-motion markers;
- semantic interactive-control, keyboard-handler, focus-management, and ARIA
  evidence summaries.

The committed evidence record covers the SEIS Command Center and Desktop /
Second Brain source surface. It keeps current static findings visible but does
not start those apps.

## Release boundary

The following evidence remains manual and release-gating:

- keyboard-only browser transcript;
- screen-reader transcript;
- desktop and mobile focus-order review;
- focus-obscuration review;
- reduced-motion visual review;
- human accessibility approval.

The plugin has no write, network, or secret permissions and never enables a
runtime or public release.
