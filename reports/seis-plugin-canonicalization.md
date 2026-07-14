# SEIS Plugin Canonicalization

- Generated: 2026-07-12
- Status: active-non-destructive-canonicalization
- Canonical marketplace: seis-repo
- Canonical orchestrator: seis-ai-agent@seis-repo
- Effective public plugin count: 1
- Embedded module count: 10
- Legacy aliases combined: 5
- Public release allowed: no

## Alias Resolution

| legacy install id | canonical install id | embedded module | lane | canonical version | license | user plugin |
| --- | --- | --- | --- | --- | --- | --- |
| seis@personal | seis-ai-agent@seis-repo | seis | seis | 0.3.0+codex.20260712 | MIT | preserved |
| seis-cloud@personal | seis-ai-agent@seis-repo | seis-cloud | seis-cloud | 0.3.0+codex.20260712 | MIT | preserved |
| seis-code@personal | seis-ai-agent@seis-repo | seis-code | seis-code | 0.3.0+codex.20260712 | MIT | preserved |
| seis-design@personal | seis-ai-agent@seis-repo | seis-design | seis-design | 0.3.0+codex.20260712 | MIT | preserved |
| seis-data@personal | seis-ai-agent@seis-repo | seis-data | seis-data | 0.3.0+codex.20260712 | MIT | preserved |

## Runtime Behavior

- Status: SEIS AI reports one public SEIS-Agent installation, its embedded modules, and personal duplicates as legacy aliases rather than additional active lanes.
- Install: The SEIS installer targets only seis-ai-agent@seis-repo and never adds or removes @personal duplicates.
- MCP: SEIS AI lane routing uses embedded modules through the one public SEIS-Agent plugin; legacy aliases remain compatibility evidence only.

## Safety Boundary

No personal marketplace entry or user plugin directory is deleted, disabled, or
rewritten by this contract. Those actions require explicit human approval.

## Quality Gates

```bash
npm run check:seis-plugin-canonicalization
npm run check:seis-agent-plugin-integration
npm run check:seis-public-plugin-family
npm run check:seis-public-plugin-install-smoke:local:mcp
npm run check:seis-ai-agent
```

## Decision

The duplicate identities are combined logically through canonical resolution.
Personal copies remain compatibility aliases until a human chooses a separate,
reviewed cleanup action.
