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
npm run check:seis-second-brain
npm run check:seis-second-brain-browser-smoke
npm run check:seis-second-brain-readiness-contracts
```

The readiness contract validates ARIA/focus markers statically. The browser
smoke validates the working app surface, mobile control count, zero cramped
targets, and VFS persistence.

## Release Boundary

This QA record is necessary but not sufficient for public release. A
screen-reader transcript review and human approval remain required before any
public demo release or GitHub Pages publication.
