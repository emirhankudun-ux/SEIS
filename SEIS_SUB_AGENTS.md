# SEIS Sub-Agent System

## Purpose

SEIS uses bounded, supervised sub-agent coordination. Each assistant works
inside an explicit task scope, permission boundary, approval contract, and
validation requirement.

## Authority

`AGENTS.md` is the highest repository governance authority.

`content/development/seis-agent-registry.json` is the canonical machine-readable agent registry.

`SEIS_AGENT_WORKFORCE.md` remains the human-readable workforce policy.

The registry aggregates source-backed inventories for machines. The workforce
policy explains supervised collaboration for humans. Neither grants execution
authority, and neither may weaken global governance or a stricter source
boundary.

## Scoped Inventories

| Inventory | Count | Source |
| --- | ---: | --- |
| Detailed lane status records | 14 | `content/development/seis-agent-lane-status.json` |
| Second Brain managed lanes | 9 | `content/development/seis-second-brain-system.json` |
| Second Brain agent roles | 13 | `content/development/seis-second-brain-system.json` |
| Personal executable planning lanes | 5 | `content/development/seis-agent-plugin-integration.json` |
| Router lanes | 10 | `content/development/seis-agent-plugin-integration.json` |

The 9 managed lanes and 13 agent roles are separate Second Brain inventories.
No 9-lane-to-13-agent mapping exists or may be inferred. Personal planning
lanes and router lanes are also separate scopes, even when names overlap.

## Supervision Model

- The human objective defines the writable scope and required result.
- Codex is the single writer; reviewers and helpers are read-only or plan-only.
- No assistant expands its own scope, permissions, tools, or approval status.
- No autonomous repository-wide write, background runner, provider call, SSH,
  deployment, publication, or external mutation is enabled by the registry.
- Every non-trivial task reports validation evidence, uncertainty, risk, and
  blockers.

## Allowed Actions

- inspect public-safe files inside the assigned scope
- produce source-backed status, plans, reviews, and handoffs
- edit only explicitly approved paths as the designated single writer
- run deterministic local validation that stays inside the approved boundary

## Forbidden Actions

- expose secrets, credentials, provider authentication, prompt bodies, or
  private content
- infer relationships that the source contracts do not define
- force push, discard user work, delete unrelated files, or rewrite history
- execute remote, destructive, deployment, publication, or authenticated
  connector actions without explicit human approval
- claim live or production capability without direct evidence

## Output And Handoff Contract

Each report includes the objective, scope, inspected and changed files, result,
validation commands and evidence, skipped or failed checks, security notes,
risks, blockers, rollback, owner or approver, and next safe step.

## Validation

```bash
node --check scripts/check-seis-agent-registry.mjs
node scripts/check-seis-agent-registry.mjs
jq empty content/development/seis-agent-registry.json
git diff --check
```
