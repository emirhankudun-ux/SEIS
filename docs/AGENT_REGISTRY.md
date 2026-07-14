# SEIS Agent Registry

SEIS uses supervised, source-backed agent coordination. The registry describes
authority, scoped inventories, and evidence boundaries; it does not create
background workers, grant permissions, or enable live execution.

## Authority

`AGENTS.md` is the highest repository governance authority.

`content/development/seis-agent-registry.json` is the canonical machine-readable agent registry.

`SEIS_AGENT_WORKFORCE.md` remains the human-readable workforce policy.

The registry is the canonical aggregate for machine consumers. It mirrors each
source contract exactly, while each contract remains authoritative for records
inside its own declared scope. Human-readable policy cannot override source
parity, runtime restrictions, or approval requirements. When boundaries differ,
the stricter safety rule applies.

## Sources

| Scope | Count | Authoritative source |
| --- | ---: | --- |
| Detailed lane status records | 14 | `content/development/seis-agent-lane-status.json` `/lanes` |
| Second Brain managed-lane roster | 9 | `content/development/seis-second-brain-system.json` `/managedSubAgentLanes` |
| Second Brain agent-role roster | 13 | `content/development/seis-second-brain-system.json` `/autonomousAgentRoster` |
| Personal executable planning lanes | 5 | `content/development/seis-agent-plugin-integration.json` `/personalPlugins` |
| Broader router lanes | 10 | `content/development/seis-agent-plugin-integration.json` `/lanes` |

These inventories have different scopes. No 9-lane-to-13-agent mapping exists,
and consumers must not infer one. Shared names across inventories do not imply
identity, ownership, assignment, or runtime permission.

The source records are read-only inputs to the aggregate registry. A source
contract owns the records in its declared scope, while `AGENTS.md` remains the
global authority. Any source-parity change must update the owning contract,
regenerate the aggregate when required, and run the registry validator.

## Agency operating overlay

The supervised agency-shaped operating model is documented in
docs/governance/SEIS_AGENCY_OPERATING_MODEL.md. Its machine-readable contract
is content/development/seis-agency-team.json.

The overlay groups the existing role records into five delivery pods and adds a
brief-to-handoff workflow. It does not create runtime workers, grant
permissions, or infer a mapping between the separate managed-lane and
agent-role inventories.

## Permission Defaults

- Read-only inspection is the default for every registry consumer.
- Planning and dry-run output do not grant write, network, credential, or
  private-content access.
- A write-capable action requires an explicit scope, a human approval record,
  and a rollback path before execution.
- Provider calls, MCP sessions, external connectors, SSH, deployment, and
  publication remain disabled unless a separate approved contract enables them.
- No registry record can self-grant permission or promote a reviewer into a
  writer.

## Runtime And Approval Boundary

- Codex is the current single writer; reviewers default to read-only or
  plan-only work.
- The registry grants no permission and enables no autonomous writer or
  background runner.
- Secret access, credential access, provider authentication, provider calls,
  SSH, deployment, GitHub mutation, external connector mutation, and private
  content access remain disabled.
- Destructive, external, remote, publication, and out-of-scope write actions
  require explicit human approval. Agents cannot approve themselves or infer
  approval.
- The registry contains no local app inventory, absolute vault path,
  credential, provider-auth data, prompt body, or private content.

## Handoff Contract

Every role report names the objective, scope, affected files, validation
commands, failed or skipped checks, security notes, blockers, rollback, and
whether the output is planning, read-only evidence, or an approved action.

## Required Handoff

Every non-trivial change package must hand off the following fields:

- Goal ID and accountable role;
- canonical repository and affected paths;
- completed work and maturity/status boundary;
- exact validation commands and results;
- failed or skipped checks;
- security, privacy, accessibility, and performance notes where applicable;
- blockers, human approvals, rollback, remaining gaps, and next decision;
- repository state: clean, dirty, blocked, or not verified.

## Validation

```bash
node --check scripts/check-seis-agent-registry.mjs
node scripts/check-seis-agent-registry.mjs
jq empty content/development/seis-agent-registry.json
git diff --check
```
