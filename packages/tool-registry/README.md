# @seis/tool-registry

Status: Fixture-backed contract package

This package will describe SEIS tools, plugins, MCP surfaces, permissions, risk
classes, and approval requirements.

## Planned Responsibilities

- register tools and plugins
- classify tool risk
- expose permission metadata
- support approval gates
- record validation and audit metadata

Tool output must be treated as untrusted until validated.

## Current Fixture Evidence

- `schemas/tool-registry-permissions.schema.json` defines risk classes,
  permission states, approval state, validation evidence, and audit metadata.
- `fixtures/tool-registry-permissions.json` covers read-only repository
  inspection, scoped local edits, approval-needed GitHub publishing, and blocked
  SSH/deployment execution.
- `npm run check:tool-registry-permissions` validates risk boundaries,
  approval requirements, forbidden actions, safe audit metadata, non-claims, and
  evidence paths.

The current fixture pack does not execute tools, install plugins, push to
GitHub, mutate PRs, run SSH commands, deploy services, call providers, expose
secrets, or grant browser clients privileged execution authority.

See `docs/ai/tool-use-policy.md`.
