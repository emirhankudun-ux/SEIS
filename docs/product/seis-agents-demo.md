# SEIS Agents Browser-Local Demo

`apps/web/seis-agents.html` is a standalone SEIS Agents workforce demo for the public OS runway.

## What works

- Browser-local agent registry with 18 supervised SEIS agent roles.
- Filters for Architecture, Code, Design, Research, Security, DevOps, Docs, QA, Cloud, and Automation lanes.
- Agent cards expose purpose, allowed actions, forbidden actions, required input markers, expected output markers, and failure behavior.
- Local assignment creation, mock handoff packet, human approval request, local policy audit simulation, and reset interactions.
- `localStorage` persistence under `seis.agents.demo.v1`.
- Responsive layout, visible focus states, and `prefers-reduced-motion` support.

## Honest state model

- `local-demo`: real browser-local UI state and activity stream.
- `mock`: representative agent role data, handoff, and activity entries.
- `approval-needed`: destructive, live, remote, or credential-bearing actions require human approval.
- `planned`: live tools and real runtime execution are future backend-isolated work.
- `blocked`: unsafe agent behavior must stop instead of expanding permissions.

## Security boundary

The demo does not execute tools, edit repository files, call providers, run shell commands, contact GitHub, open SSH connections, approve its own actions, or access secrets. Live agent runtime work must be backend-isolated, permission-scoped, auditable, and human-review gated.

## Validation

Run the focused validator:

```bash
node scripts/check-seis-agents-demo.mjs
```

The validator checks required role names, lane filters, allowed/forbidden/failure behavior markers, localStorage, state labels, documentation coverage, and absence of obvious network or remote-execution code paths.
