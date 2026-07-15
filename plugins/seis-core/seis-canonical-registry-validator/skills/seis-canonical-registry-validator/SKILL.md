---
name: seis-canonical-registry-validator
description: Check bounded JSON registry projections for stable IDs, ownership, status values, and duplicate records under SEIS governance.
---

# SEIS Canonical Registry Validator

Use this skill when a SEIS registry, plugin inventory, agent inventory, provider list, or generated projection may have drifted.

## Procedure

1. Locate the canonical registry source and read its owner and architecture documentation.
2. Run `node scripts/seis-canonical-registry-validator-mcp-server.mjs --status`.
3. Run `node scripts/seis-canonical-registry-validator-mcp-server.mjs --validate --path <workspace>`.
4. Treat generated views as projections until source-of-truth evidence is identified.
5. Record conflicts as a blocker or follow-up goal rather than overwriting a registry.

## Scope and guardrails

- Inspect JSON files in bounded paths containing `registry`, `registries`, or `catalog`.
- JSON-only bounded inspection; YAML, databases, and remote registries require native validators.
- No registry edits, generated-file rewrites, dependency execution, network, secrets, or external writes.
- `approved-local-readonly` and `functional-local-demo` describe this plugin's local scope only.

## MCP

- `seis_registry_validator_status`
- `seis_registry_validate`

## Handoff

Report registry files, records, unique IDs, duplicate IDs, owner gaps, unknown statuses, exact command, and source-of-truth limitations.
