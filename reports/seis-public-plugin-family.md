# SEIS Public Plugin Family

- Generated: 2026-07-12
- Mode: single_public_seis_agent_with_embedded_modules
- Marketplace: seis-repo
- Public audience: everyone
- SEIS AI orchestrator: seis-ai-agent@seis-repo

## Public Distribution

- Canonical install: seis-ai-agent@seis-repo
- Public plugin count: 1
- Mode: single-public-plugin
- Unified suite: plugins/seis-ai-agent/assets/unified-suite.json
- Standalone lanes: source-module-only

## Public Plugin

| plugin | role | source | category | install policy | auth policy | runtime state | SEIS AI |
| --- | --- | --- | --- | --- | --- | --- | --- |
| seis-ai-agent | orchestrator | ./plugins/seis-ai-agent | Developer | AVAILABLE | ON_INSTALL | local_demo_or_auth_gated | connected |

## Embedded Modules

| module | role | source | SEIS AI | direct public install |
| --- | --- | --- | --- | --- |
| seis-ai-agent | orchestrator | ./plugins/seis-ai-agent | connected | no |
| seis | governance | ./plugins/seis | connected | no |
| seis-cloud | cloud | ./plugins/seis-cloud | connected | no |
| seis-code | code | ./plugins/seis-code | connected | no |
| seis-design | design | ./plugins/seis-design | connected | no |
| seis-data | data | ./plugins/seis-data | connected | no |
| seis-security | security | ./plugins/seis-security | connected | no |
| seis-research | research | ./plugins/seis-research | connected | no |
| seis-automation | automation | ./plugins/seis-automation | connected | no |
| seis-product | product | ./plugins/seis-product | connected | no |

## SEIS AI Connection

- Orchestrator: seis-ai-agent@seis-repo
- MCP server: plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs
- Embedded skills: plugins/seis-ai-agent/skills
- Embedded lane profiles: plugins/seis-ai-agent/assets/lanes

## Security Model

- No API keys, tokens, cookies, SSH private keys, or `.env` values are required for core plugin install.
- Public plugin availability does not grant cloud deployment, SSH, GitHub write, connector, private dataset, or destructive-action authority.
- OAuth/account login and live external integrations remain explicit user actions.
- Mock, disabled, planned, and connected states must stay labeled in product and docs surfaces.

## Long-Horizon Rules

- Keep SEIS-Agent as the only public installation and orchestration layer for cross-lane work.
- Keep source modules under plugins/seis-* embedded in SEIS-Agent, not exposed as separate public marketplace plugins.
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
