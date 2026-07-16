# SEIS Public Plugin Independent Runner Evidence Contract

- Generated: 2026-07-12
- Status: active-evidence-intake-contract
- Decision: not-ready-for-public-preview
- Public release allowed: no
- Evidence record path: `content/development/seis-public-plugin-independent-runner-evidence.json`

## Independence Requirements

- The runner cannot read the original SEIS working tree used to create this proof contract.
- The runner cannot use the pre-existing local Codex plugin cache as installation evidence.
- The runner records the immutable public marketplace or package revision used for installation.
- The runner opens a fresh Codex task after installation before observing the SEIS AI public plugin family bridge.

## Required Plugin Install Ids

| install id | required |
| --- | --- |
| seis-ai-agent@seis-repo | required |

## Required Embedded Source Modules

| module id | requirement |
| --- | --- |
| seis-ai-agent | embedded source module |
| seis | embedded source module |
| seis-cloud | embedded source module |
| seis-code | embedded source module |
| seis-design | embedded source module |
| seis-data | embedded source module |
| seis-security | embedded source module |
| seis-research | embedded source module |
| seis-automation | embedded source module |
| seis-product | embedded source module |

## Required Assertions

- The single expected seis-ai-agent@seis-repo plugin id is installed from the declared public source.
- The installed SEIS-Agent MCP server initializes, lists tools, and completes representative lane calls.
- The observed embedded source-module inventory exactly matches the current SEIS module contract.
- A fresh task opened after installation reports publicPluginCount=1, embeddedModuleCount=current contract count, connected counts, and runtimeConnected=true through SEIS AI.
- The evidence explicitly says publicReleaseAllowed=false; human approval remains a separate gate.

## Redaction Boundary

Allowed metadata:

- sanitized task reference
- operating system family
- CPU architecture
- Node major version
- Codex version
- public marketplace or package revision
- plugin ids and aggregate command counts

Prohibited data:

- API keys, tokens, cookies, passwords, credentials, private keys, .env contents, private filesystem paths, raw command output, or private repository data

## Validation

```bash
npm run check:seis-public-plugin-independent-runner-evidence
npm run check:seis-public-plugin-independent-runner-evidence:recorded
node scripts/check-seis-public-plugin-independent-runner-evidence.mjs --require-recorded --input /safe/sanitized-evidence.json
```

## Decision

NO-GO for public preview. This is an intake contract, not independent runner
evidence. A validated record and explicit human approval are still required.
