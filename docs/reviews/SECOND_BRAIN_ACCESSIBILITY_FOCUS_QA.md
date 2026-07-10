# Second Brain Accessibility Focus QA

Date: 2026-06-24

## Purpose

Define the accessibility and focus-management acceptance contract for the SEIS
Second Brain app before public demo review.

Source contract:
`content/development/seis-second-brain-accessibility-focus-qa.json`

## Current QA Contract

| Area | Required behavior |
| --- | --- |
| Toolbar | Native buttons remain keyboard focusable. |
| Vault note list | `role="listbox"`, active descendant, option buttons, and `aria-selected`. |
| Knowledge graph | `role="listbox"`, active descendant, node option buttons, accessible labels, and `aria-controls`. |
| Inspector | Focusable `tabindex="0"` region with label and `aria-live="polite"`. |
| Focus styling | Existing global `:focus-visible` styling applies to buttons and `tabindex` targets. |
| Mobile | Dedicated smoke keeps mobile no-overflow, 10+ controls, and zero cramped targets. |
| Claim boundary | Screen-reader text must not claim private Obsidian import, live provider access, SSH, deployment, push, merge, or public readiness. |

Static markers: role=listbox, role=option, aria-selected, aria-controls,
aria-live polite, focus-visible, and zero cramped or overlapping controls.

## WCAG / Focus Evidence Required

Before public demo approval, the review must capture:

- WCAG 2.2 visible focus indicator evidence.
- Keyboard-only path without pointer input.
- No keyboard trap across windows, toolbar, listbox, graph, inspector, tables,
  and recent activity cards.
- Logical focus order that matches visual reading order.
- Focus targets that are not obscured by sticky bars or overlapping windows.
- Reduced-motion review for graph state.
- Screen-reader transcript that preserves mock, planned, disabled, and
  Local Demo labels without claiming private Obsidian import or live AI access.

## Manual Review Path

1. Open `desktop.html`.
2. Open SEIS Second Brain.
3. Tab through toolbar actions.
4. Tab through the Markdown vault note list.
5. Select each note and confirm the inspector updates.
6. Tab to graph nodes and select each node.
7. Confirm the inspector can receive visible focus.
8. Continue through Installed AI, managed sub-agent, agent roster, GitHub gate,
   and recent activity sections.
9. Repeat on a narrow mobile viewport and confirm no horizontal overflow.

## Automated Evidence

```bash
npm run report:seis-second-brain-accessibility-focus-report
npm run check:seis-second-brain-accessibility-focus-report
npm run check:seis-second-brain
npm run check:seis-second-brain-browser-smoke
npm run check:seis-second-brain-readiness-contracts
```

`npm run report:seis-second-brain-accessibility-focus-report` writes
`reports/seis-public-demo/second-brain-accessibility-focus-latest.json` and
`reports/seis-public-demo/second-brain-accessibility-focus-latest.md`. This
artifact validates repo-static ARIA/focus markers and the browser-smoke mobile
target audit contract, but it intentionally keeps manual keyboard transcript,
screen-reader transcript, reduced-motion review note, and human accessibility
review approval blocked until a human review records them.

The readiness contract validates ARIA/focus markers statically. The browser
smoke validates the working app surface, mobile control count, zero cramped
targets, and VFS persistence.

The automated smoke is not enough for public release by itself. Required manual
evidence still includes a current browser smoke result, manual keyboard
transcript, screen-reader transcript, mobile viewport target audit,
reduced-motion review note, and human accessibility review approval.

## Release Boundary

This QA record is necessary but not sufficient for public release. A
screen-reader transcript review and human approval remain required before any
public demo release or GitHub Pages publication.
