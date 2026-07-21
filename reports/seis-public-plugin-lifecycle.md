# SEIS Public Plugin Lifecycle

- Generated: 2026-07-12
- Status: active-local-proof-public-release-gated
- Public audience: everyone
- Orchestrator: seis-ai-agent@seis-repo
- Current channel: internal-review-local-proof

## Release Phases

| phase | status | owner lane | exit rule |
| --- | --- | --- | --- |
| repo-contract | active | seis-governance | All public plugin manifests, marketplace entries, source mirrors, and SEIS AI lane links validate in the repo. |
| canonical-alias-resolution | active-non-destructive-canonicalization | seis-governance | SEIS AI and the installer report one canonical public SEIS-Agent install while preserving legacy personal plugins as read-only compatibility aliases. |
| single-public-install | active-single-public-plugin | seis-ai-agent | All SEIS source modules share one versioned suite file, and SEIS-Agent is the only public install target; module folders do not create standalone public installs. |
| installed-cache | active-local-proof | seis-automation | The single public SEIS-Agent plugin exists in the local Codex cache, its MCP server initializes, lists tools, and answers representative lane calls. |
| clean-artifact-stage | repo-local-artifact-staged | seis-automation | A disposable local artifact stage contains the canonical suite and every public app package from the repo marketplace without forbidden release artifacts. This does not prove an independent installation. |
| fresh-task-reload | human-triggered-next-proof | seis-product | A newly started task can use the public SEIS plugin family without relying on this thread's pre-install tool surface. |
| independent-runner-evidence | awaiting-independent-clean-runner-evidence | seis-automation | A strict recorded-evidence check proves the single SEIS-Agent public plugin installed from an independent public source, exposed every embedded module, passed MCP smoke, and was visible through SEIS AI in a fresh task. Human approval still remains required. |
| public-preview | approval-gated | seis-security | Security, provenance, clean-artifact staging, independent installation, validation, rollback, and human release approval are recorded before public preview claims. |
| stable | planned | seis-governance | Stable is only claimed after repeatable install/runtime evidence exists outside this local machine. |

## Public Plugin Matrix

| plugin | role | version | channel | support tier | MCP servers |
| --- | --- | --- | --- | --- | --- |
| seis-ai-agent | orchestrator | 0.3.0+codex.20260712 | internal-review-local-proof | orchestrator-critical | seis-ai-agent |

## Migrated Root Repository Cards

| plugin | role | version | channel | support tier | MCP servers |
| --- | --- | --- | --- | --- | --- |
| seis | governance | 0.3.0+codex.20260712 | internal-review-local-proof | root-lane-direct-card | seis |
| seis-cloud | cloud | 0.3.0+codex.20260712 | internal-review-local-proof | root-lane-direct-card | seis-cloud |
| seis-code | code | 0.3.0+codex.20260712 | internal-review-local-proof | root-lane-direct-card | seis-code |
| seis-design | design | 0.3.0+codex.20260712 | internal-review-local-proof | root-lane-direct-card | seis-design |
| seis-data | data | 0.3.0+codex.20260712 | internal-review-local-proof | root-lane-direct-card | seis-data |

## Embedded Source Modules

| module | role | status | version | canonical install |
| --- | --- | --- | --- | --- |
| seis-ai-agent | orchestrator | public-plugin | 0.3.0+codex.20260712 | seis-ai-agent@seis-repo |
| seis | governance | public-marketplace-and-embedded-source-module | 0.3.0+codex.20260712 | seis-ai-agent@seis-repo |
| seis-cloud | cloud | public-marketplace-and-embedded-source-module | 0.3.0+codex.20260712 | seis-ai-agent@seis-repo |
| seis-code | code | public-marketplace-and-embedded-source-module | 0.3.0+codex.20260712 | seis-ai-agent@seis-repo |
| seis-design | design | public-marketplace-and-embedded-source-module | 0.3.0+codex.20260712 | seis-ai-agent@seis-repo |
| seis-data | data | public-marketplace-and-embedded-source-module | 0.3.0+codex.20260712 | seis-ai-agent@seis-repo |
| seis-security | security | embedded-source-module | 0.3.0+codex.20260712 | seis-ai-agent@seis-repo |
| seis-research | research | embedded-source-module | 0.3.0+codex.20260712 | seis-ai-agent@seis-repo |
| seis-automation | automation | embedded-source-module | 0.3.0+codex.20260712 | seis-ai-agent@seis-repo |
| seis-product | product | embedded-source-module | 0.3.0+codex.20260712 | seis-ai-agent@seis-repo |

## Canonical Alias Resolution

- Canonical marketplace: seis-repo
- Effective public plugins: 1
- Embedded source modules: 10
- Preserved legacy aliases: 5
- Personal marketplace mutation: no

## Single Public Install

- Suite file: plugins/seis-ai-agent/assets/unified-suite.json
- Release version: 0.3.0+codex.20260712
- Component count: 10
- Default install mode: single-public-plugin
- Source module install mode: source-module-only

## Public SEIS Repo Marketplace

- Marketplace: seis-repo
- Total entries: 379
- Canonical orchestrator entries: 1
- Migrated root package entries: 5
- App package entries: 73
- Objective-derived topic entries: 300

## Independent Runner Evidence

- Intake contract status: active-evidence-intake-contract
- Current evidence status: pending-independent-clean-runner-or-public-install
- Strict release gate: npm run check:seis-public-plugin-independent-runner-evidence:recorded

## Public Preview Gates

- npm run check:seis-public-plugin-family
- npm run check:seis-public-plugin-fresh-task-proof
- npm run check:seis-public-plugin-fresh-task-reload-evidence
- npm run check:seis-public-plugin-security-provenance-review
- npm run check:seis-public-plugin-external-install-proof
- npm run check:seis-plugin-canonicalization
- npm run check:seis-unified-plugin-suite
- npm run check:seis-public-plugin-independent-runner-evidence-contract
- npm run check:seis-public-plugin-independent-runner-evidence:recorded
- npm run check:seis-public-plugin-install-smoke:mcp
- npm run check:seis-agent-plugin-integration
- npm run check:seis-ai-agent
- npm run check:seis-repo-marketplace
- fresh task reload proof
- security and provenance review
- independent clean-runner or public installation proof
- human approval

## Approval Boundary

Without explicit human approval, SEIS public plugin work must not push, merge,
tag, release, deploy, publish marketplace listings, run live SSH, use provider
credentials, or claim live cloud/provider connectivity.

## Quality Gates

```bash
npm run check:seis-public-plugin-lifecycle
npm run check:seis-public-plugin-family
npm run check:seis-public-plugin-fresh-task-proof
npm run check:seis-public-plugin-fresh-task-reload-evidence
npm run check:seis-public-plugin-security-provenance-review
npm run check:seis-public-plugin-external-install-proof
npm run check:seis-plugin-canonicalization
npm run check:seis-unified-plugin-suite
npm run check:seis-public-plugin-independent-runner-evidence-contract
npm run check:seis-public-plugin-independent-runner-evidence
npm run check:seis-public-plugin-install-smoke:mcp
npm run check:seis-agent-plugin-integration
npm run check:seis-ai-agent
npm run check:seis-specialist-plugins
npm run check:seis-personal-plugin-marketplace-migration
npm run check:seis-repo-marketplace
```
