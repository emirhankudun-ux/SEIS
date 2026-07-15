---
name: seis-agent-contract-validator
description: Validate bounded local JSON agent contracts against the SEIS supervision fields.
---

# SEIS Agent Contract Validator

Use this skill to validate local JSON files whose names or paths identify them
as agent contracts. The validator reports missing safety and handoff metadata.

## Safety boundary

- Read-only; never executes an agent or tool.
- Never changes the contract, grants permissions, or contacts a provider.
- Findings are structural and do not certify an agent as safe.

## Commands

    node scripts/seis-agent-contract-validator-mcp-server.mjs --status
    node scripts/seis-agent-contract-validator-mcp-server.mjs --validate --path /path/to/local/tree

The MCP tools are seis_agent_contract_validator_status and
seis_agent_contract_validate.

## Goal linkage

Use this within SEIS-GOAL-021. Preserve the finding severity and source path
when handing evidence to the supervised agent-governance review.
