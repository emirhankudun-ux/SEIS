# SEIS Store Demo

`apps/web/seis-store.html` is a standalone browser-local SEIS Store demo.

## Purpose

The Store is part of the required SEIS product ecosystem. This page turns the Store from planned scope into a real local artifact without pretending to perform package installation, GitHub mutation, SSH, deployment, or provider calls.

## Working interactions

- Search the catalog.
- Filter by category: app, agent, plugin, theme, tool.
- Filter by state: real, mock, planned.
- Filter installed entries.
- Install/update catalog items.
- Enable/disable catalog items.
- Install the featured set.
- Reset local store state.
- Persist install/enable state in `localStorage` only.

## Catalog coverage

- Apps: SEIS AI Core, SEIS Code IDE, SEIS Design Studio, SEIS Search, SEIS Store, SEIS Music.
- Agents: Architect Agent, Security Agent.
- Theme: Graphite Cinema Theme.
- Plugin: GitHub Governance Plugin.
- Tools: Ollama Local Toolkit, Demo Readiness Tool.

## State semantics

- `real`: a local browser artifact or fully working local demo behavior exists.
- `mock`: a demo-safe concept or UI exists, but no external live mutation is claimed.
- `planned`: required ecosystem capability remains future implementation work.

## Safety boundary

- No API keys are required.
- No SSH is executed.
- No GitHub mutation is performed.
- No deployment is triggered.
- No AI provider call is performed.
- No package manager install is performed.
- No branch protection is changed.
- No private keys, tokens, passwords, cookies, service accounts, or `.env` values are read or stored.

## Validation

Run:

```bash
node scripts/check-seis-store-demo.mjs
```

The validator checks the standalone page, required controls, category/state labels, localStorage boundary, catalog coverage, and safety wording.
