# Component Quality Gate

Status: Foundation policy

Command Center components must be useful, accessible, and evidence-backed.

## Requirements

- semantic structure
- keyboard navigation
- visible focus
- readable contrast
- reduced-motion support where motion exists
- loading, empty, error, blocked, degraded, and unknown states
- no fake controls
- clear evidence links for operational claims
- stable responsive layout

## Review Questions

- Does the component show a real state or a clearly labeled planned state?
- Does it expose any secret or private data?
- Can it be used by keyboard and screen readers?
- Does it show the next safe action?
- Is privileged action approval-gated?

## Promotion

A component should not move from prototype to active module until it has a
contract, state model, accessibility review, and validation path.
