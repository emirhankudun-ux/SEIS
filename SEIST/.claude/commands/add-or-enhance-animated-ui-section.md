---
name: add-or-enhance-animated-ui-section
description: Workflow command scaffold for add-or-enhance-animated-ui-section in UIX-Apps.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-enhance-animated-ui-section

Use this workflow when working on **add-or-enhance-animated-ui-section** in `UIX-Apps`.

## Goal

Adds a new interactive or animated UI section (e.g. skills orbit, testimonials, loader, marquee, navigation dots) or significantly enhances an existing one. Typically involves coordinated changes to markup, CSS, and JavaScript animation logic.

## Common Files

- `index.html`
- `style.css`
- `three-scene.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Update or add new section markup in index.html
- Add or modify corresponding styles and keyframes in style.css
- Implement or extend animation logic in three-scene.js (or relevant JS file)
- Integrate with motion/accessibility systems (e.g. prefers-reduced-motion, IntersectionObserver, ScrollTrigger)

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.