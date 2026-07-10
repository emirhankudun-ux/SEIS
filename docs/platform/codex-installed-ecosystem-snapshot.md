# Codex Installed Ecosystem Snapshot

This document binds the user-supplied Codex plugin manager screenshots from
2026-07-08 into SEIS as a governed inventory surface.

Source of truth:

```text
content/development/codex-installed-ecosystem-snapshot.json
```

Observed counts from the screenshots:

| Surface | Count | SEIS interpretation |
| --- | ---: | --- |
| Extensions | 177 | Capability context, not blanket live activation |
| Apps | 56 | Installed app/connector surfaces visible in Codex |
| MCP servers | 3 | Context Sync, Node Repl, and Seis visible as enabled |
| Skills | 72 | Task-scoped skill lanes visible in Codex |

## SEIS Binding

The snapshot is surfaced inside:

- SEIS Desktop AI Plugin Center.
- SEIS Linux Replica MCP Workbench.
- Browser-local export packets for review.
- `npm run check:codex-installed-ecosystem-snapshot`.
- scripts/check-codex-installed-ecosystem-snapshot.mjs
- apps/web/desktop.js
- apps/web/seis-linux-replica.html

## Operating Boundary

This snapshot is review-only. It does not authenticate connectors, trust remote
MCP servers, install plugins, call AI providers, execute SSH, deploy, spend
money, mutate GitHub, or prove every visible item is available for a specific
task.

Use the visible ecosystem as a routing map:

- Pick the smallest relevant plugin, MCP, app, or skill family.
- Keep Codex as the primary writer unless a human-approved writer handoff exists.
- Treat external connector reads/writes as approval-gated.
- Keep secrets, tokens, cookies, private keys, and private workspace state out
  of repo docs and browser exports.
- Prefer local manifests, dry runs, review packets, and focused validation
  before live activation.

## Validation

```bash
npm run check:codex-installed-ecosystem-snapshot
```
