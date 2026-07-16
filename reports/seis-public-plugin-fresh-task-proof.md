# SEIS Public Plugin Fresh Task Proof

- Generated: 2026-07-12
- Status: pending-fresh-task-reload-proof
- Decision: not-ready-for-public-preview
- Public release allowed: no

## Local Proof Already Available

- repoContract: `npm run check:seis-public-plugin-family`
- lifecycleContract: `npm run check:seis-public-plugin-lifecycle`
- runtimeIntegration: `npm run check:seis-agent-plugin-integration`
- installedCacheAndMcp: `npm run check:seis-public-plugin-install-smoke:local:mcp`
- cleanArtifactStaging: `npm run check:seis-public-plugin-external-install-proof`
- canonicalization: `npm run check:seis-plugin-canonicalization`
- unifiedSuite: `npm run check:seis-unified-plugin-suite`
- independentRunnerEvidenceIntake: `npm run check:seis-public-plugin-independent-runner-evidence`
- seisAiPackage: `npm test --prefix packages/seis-ai`
- freshTaskReloadEvidence: `npm run check:seis-public-plugin-fresh-task-reload-evidence`
- securityProvenanceReview: `npm run check:seis-public-plugin-security-provenance-review`

## Fresh Task Reload Protocol

Trigger: Open a new Codex task after the public plugin family is installed in the local Codex plugin cache.

Required commands:

```bash
npm run check:seis-public-plugin-install-smoke:local:mcp
npm run check:seis-plugin-canonicalization
npm run check:seis-unified-plugin-suite
npm run check:seis-agent-plugin-integration
npm test --prefix packages/seis-ai
```

Required runtime observations:

- SEIS AI exposes seis_public_plugin_family in the tool loop.
- The SEIS MCP server lists 35 tools, 3 prompts, and 31 resources.
- seis_public_plugin_family returns publicPluginCount=1, embeddedModuleCount=10, effectivePluginCount=1, legacyAliasCount=5, connectedPluginCount=1, connectedModuleCount=10, runtimeConnected=true, and the single public suite default install.
- The installed SEIS-Agent MCP server initializes, lists required tools, and answers representative embedded-lane calls.

## Fresh Task Reload Evidence

- Evidence status: recorded-local-fresh-task-evidence
- Task/thread id recorded: yes
- Command output recorded: yes
- MCP inventory recorded: yes
- SEIS AI bridge recorded: yes
- Evidence contract: `content/development/seis-public-plugin-fresh-task-reload-evidence.json`
- Evidence report: `reports/seis-public-plugin-fresh-task-reload-evidence.md`

## Security Provenance Review

- Review status: repo-local-security-provenance-reviewed
- Secret findings: 0
- Blocking findings: 0
- Hygiene findings: 0
- Review contract: `content/development/seis-public-plugin-security-provenance-review.json`
- Review report: `reports/seis-public-plugin-security-provenance-review.md`

## Required Evidence To Close Gate

| evidence | status | requirement | source |
| --- | --- | --- | --- |
| fresh-task-id | recorded | Record the new Codex task/thread identifier used for reload proof. | content/development/seis-public-plugin-fresh-task-reload-evidence.json |
| fresh-task-start-time | recorded | Record the fresh task start time after local plugin cache installation. | content/development/seis-public-plugin-fresh-task-reload-evidence.json |
| fresh-task-install-smoke-output | recorded | Attach or summarize the passing local installed-cache MCP smoke output from the fresh task. | reports/seis-public-plugin-fresh-task-reload-evidence.md |
| fresh-task-seis-ai-output | recorded | Attach or summarize the SEIS AI public-family status output from the fresh task. | content/development/seis-public-plugin-fresh-task-reload-evidence.json |
| fresh-task-mcp-inventory | recorded | Record the fresh task MCP inventory showing the public plugin family and SEIS AI bridge. | reports/seis-public-plugin-fresh-task-reload-evidence.md |

## Public Plugin Coverage

| plugin | install id | role | connected to SEIS AI |
| --- | --- | --- | --- |
| seis-ai-agent | seis-ai-agent@seis-repo | orchestrator | yes |

## Embedded Source Module Coverage

| module | canonical install | connected to SEIS AI |
| --- | --- | --- |
| seis-ai-agent | seis-ai-agent@seis-repo | yes |
| seis | seis-ai-agent@seis-repo | yes |
| seis-cloud | seis-ai-agent@seis-repo | yes |
| seis-code | seis-ai-agent@seis-repo | yes |
| seis-design | seis-ai-agent@seis-repo | yes |
| seis-data | seis-ai-agent@seis-repo | yes |
| seis-security | seis-ai-agent@seis-repo | yes |
| seis-research | seis-ai-agent@seis-repo | yes |
| seis-automation | seis-ai-agent@seis-repo | yes |
| seis-product | seis-ai-agent@seis-repo | yes |

## Current Blockers

- External clean-runner or public package installation proof has not been recorded.
- Human approval for public preview, release, publish, push, merge, tag, deploy, SSH, or live provider access has not been recorded.

## Quality Gates

```bash
npm run check:seis-public-plugin-fresh-task-proof
npm run check:seis-public-plugin-fresh-task-reload-evidence
npm run check:seis-public-plugin-security-provenance-review
npm run check:seis-public-plugin-external-install-proof
npm run check:seis-plugin-canonicalization
npm run check:seis-unified-plugin-suite
npm run check:seis-public-plugin-independent-runner-evidence-contract
npm run check:seis-public-plugin-independent-runner-evidence
npm run check:seis-public-plugin-install-smoke:local:mcp
npm run check:seis-agent-plugin-integration
npm test --prefix packages/seis-ai
```

## Decision

NO-GO for public preview until the required fresh-task evidence, security and
provenance review, and human approval are recorded.
