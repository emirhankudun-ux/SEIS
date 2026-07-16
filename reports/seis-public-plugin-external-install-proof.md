# SEIS Public Plugin External Install Proof

- Generated: 2026-07-12
- Status: repo-local-clean-artifact-staged-external-proof-pending
- Decision: not-ready-for-public-preview
- Public release allowed: no

## Repo-Local Clean Artifact Staging

- Mode: temporary-local-clean-artifact-staging
- Expected public plugins: 1
- Staged public plugins: 1
- Embedded source modules: 10
- Staged manifests: 1
- Staged MCP entry scripts: 1
- Staged files: 35
- Excluded source metadata files: 0
- Disallowed source artifacts: 0
- Forbidden files in stage: 0
- Temporary stage removed: yes
- External network used: no
- Existing Codex cache used: no

| plugin | source files | staged files | excluded metadata | MCP entry scripts | stage |
| --- | --- | --- | --- | --- | --- |
| seis-ai-agent | 34 | 34 | 0 | 1 | pass |

## Excluded Source Metadata

| path | reason |
| --- | --- |
| none | none |

## Disallowed Source Artifacts

| path | reason |
| --- | --- |
| none | none |

## Single Public Install

- Suite file: plugins/seis-ai-agent/assets/unified-suite.json
- Suite status: active-single-public-plugin
- Release version: 0.3.0+codex.20260712
- Canonical install: seis-ai-agent@seis-repo
- Default install mode: single-public-plugin
- Components: 10
- Public plugin count: 1
- Embedded module count: 10

## Independent Clean-Runner Evidence Still Required

Repo-local staging validates artifact structure only. It is not an independent
installation or public release proof.

- Evidence intake contract: `content/development/seis-public-plugin-independent-runner-evidence-contract.json`
- Evidence record: `content/development/seis-public-plugin-independent-runner-evidence.json`
- Evidence status: pending-independent-clean-runner-or-public-install
- Evidence recorded: no
- Evidence valid: no



- A clean runner or machine that cannot read the original working tree or existing Codex plugin cache.
- The public SEIS marketplace source or published package revision used for the install, including its immutable revision identifier.
- Installation evidence for the single seis-ai-agent@seis-repo plugin and its embedded module inventory from that runner.
- MCP initialization, tools/list, and representative tool-call evidence from the independent runner.
- A newly opened Codex task after the independent installation, with the SEIS AI public-plugin-family bridge visible.
- Sanitized runner metadata: operating system, Node major version, Codex version, and command exit summaries only.

## Current Blockers

- Independent clean-runner or public package installation proof has not been recorded.
- Human approval for public preview, release, publish, push, merge, tag, deploy, live SSH, or provider credentials has not been recorded.

## Quality Gates

```bash
npm run check:seis-public-plugin-external-install-proof
npm run check:seis-public-plugin-independent-runner-evidence-contract
npm run check:seis-public-plugin-independent-runner-evidence
npm run check:seis-public-plugin-independent-runner-evidence:recorded
npm run check:seis-unified-plugin-suite
npm run check:seis-public-plugin-security-provenance-review
npm run check:seis-public-plugin-install-smoke:local:mcp
npm run check:seis-agent-plugin-integration
```

## Decision

NO-GO for public preview. The artifact stage is local evidence only; an
independent clean runner or public installation and human approval remain
required.
