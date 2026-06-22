---
name: refine-or-optimize-animation-performance
description: Workflow command scaffold for refine-or-optimize-animation-performance in UIX-Apps.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /refine-or-optimize-animation-performance

Use this workflow when working on **refine-or-optimize-animation-performance** in `UIX-Apps`.

## Goal

Refactors or optimizes animation and interaction performance, often in response to code review or UX findings. Focuses on reducing layout thrashing, improving animation smoothness, and enhancing accessibility.

## Common Files

- `style.css`
- `three-scene.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Identify performance bottlenecks or animation issues in JS and CSS
- Update style.css to optimize transitions, will-change usage, or motion gating
- Refactor animation logic in three-scene.js for efficiency (e.g. caching, sharing objects, guarding calculations)
- Test changes under various motion/accessibility settings

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.