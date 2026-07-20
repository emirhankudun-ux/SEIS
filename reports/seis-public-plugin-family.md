# SEIS Public Plugin Family

- Generated: 2026-07-12
- Mode: public_seis_agent_with_migrated_root_app_and_topic_repository_plugins
- Marketplace: seis-repo
- Public audience: everyone
- SEIS AI orchestrator: seis-ai-agent@seis-repo

## Public Distribution

- Canonical install: seis-ai-agent@seis-repo
- Public plugin count: 372
- Canonical default installs: 1
- Migrated root repository cards: 5
- Mode: single-public-plugin
- Unified suite: plugins/seis-ai-agent/assets/unified-suite.json
- Standalone lanes: source-module-only

## Canonical Public Plugin

| plugin | role | source | category | install policy | auth policy | runtime state | SEIS AI |
| --- | --- | --- | --- | --- | --- | --- | --- |
| seis-ai-agent | orchestrator | ./plugins/seis-ai-agent | Developer | AVAILABLE | ON_INSTALL | local_demo_or_auth_gated | connected |

## Migrated SEIS Root Repository Packages

| plugin | role | source | category | direct public install | SEIS AI |
| --- | --- | --- | --- | --- | --- |
| seis | governance | ./plugins/seis | Developer | seis@seis-repo | connected |
| seis-cloud | cloud | ./plugins/seis-cloud | Developer | seis-cloud@seis-repo | connected |
| seis-code | code | ./plugins/seis-code | Developer | seis-code@seis-repo | connected |
| seis-design | design | ./plugins/seis-design | Design | seis-design@seis-repo | connected |
| seis-data | data | ./plugins/seis-data | Data | seis-data@seis-repo | connected |

These cards replace the historical personal-marketplace visibility for the five root packages. SEIS-Agent remains the one canonical default install.

## Public SEIS Core Repository Packages

- Marketplace entries: 66
- Source root: plugins/seis-core
- Audience: everyone
- License: MIT
- Runtime: local demo or auth-gated; live external capabilities remain approval-gated.

## Embedded Modules

| module | role | source | SEIS AI | direct public install |
| --- | --- | --- | --- | --- |
| seis-ai-agent | orchestrator | ./plugins/seis-ai-agent | connected | yes |
| seis | governance | ./plugins/seis | connected | yes |
| seis-cloud | cloud | ./plugins/seis-cloud | connected | yes |
| seis-code | code | ./plugins/seis-code | connected | yes |
| seis-design | design | ./plugins/seis-design | connected | yes |
| seis-data | data | ./plugins/seis-data | connected | yes |
| seis-security | security | ./plugins/seis-security | connected | no |
| seis-research | research | ./plugins/seis-research | connected | no |
| seis-automation | automation | ./plugins/seis-automation | connected | no |
| seis-product | product | ./plugins/seis-product | connected | no |

## SEIS AI Connection

- Orchestrator: seis-ai-agent@seis-repo
- MCP server: plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs
- Embedded skills: plugins/seis-ai-agent/skills
- Embedded lane profiles: plugins/seis-ai-agent/assets/lanes
- Objective-derived topic source root: plugins/seis-topics
- Objective-derived topic packages: 300
- Topic packages are separate public repository cards; the canonical default install remains SEIS-Agent.

## Objective-Derived Topic Packages

- Marketplace entries: 300
- Source root: plugins/seis-topics
- Objective source: content/development/seis-topic-plugin-objective.json
- Audience: everyone
- License: MIT
- Runtime: local read-only demo; no provider, network, secret, or write access.
- Package family check: npm run check:seis-topic-plugin-family

## Security Model

- No API keys, tokens, cookies, SSH private keys, or `.env` values are required for core plugin install.
- Public plugin availability does not grant cloud deployment, SSH, GitHub write, connector, private dataset, or destructive-action authority.
- OAuth/account login and live external integrations remain explicit user actions.
- Mock, disabled, planned, and connected states must stay labeled in product and docs surfaces.

## Long-Horizon Rules

- Keep SEIS-Agent as the canonical orchestration layer for cross-lane work.
- Keep the five historical SEIS root packages under plugins/seis available as direct public seis-repo cards while preserving their embedded SEIS-Agent lane connections.
- Keep specialist source modules other than the migrated root cards embedded in SEIS-Agent unless an explicit public distribution decision adds them to the repo marketplace.
- Keep every app-owned package under plugins/seis-core available as a public MIT package in the seis-repo marketplace.
- Keep every objective-derived package under plugins/seis-topics available as a public MIT package in the seis-repo marketplace.
- Require every future plugins/seis-* manifest to enter the unified suite before it can be used through SEIS AI.
- Validate manifests, MCP tools, marketplace entries, and SEIS-AI lane wiring before claiming public readiness.
- Record mock, disabled, planned, and connected states honestly.
- Do not treat marketplace availability as authenticated runtime access.

## Validate

```bash
npm run check:seis-public-plugin-family
npm run check:seis-specialist-plugins
npm run check:seis-ai-agent
npm run check:seis-plugin-bundle -- --no-local
npm run check:seis-personal-plugin-marketplace-migration
npm run check:seis-topic-plugin-family
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-ai-agent
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-cloud
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-code
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-design
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-data
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-security
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-research
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-automation
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-product
```
