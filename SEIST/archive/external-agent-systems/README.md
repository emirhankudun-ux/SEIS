# External Agent Systems Intake

Date: 2026-06-01

This folder contains a low-power, rollback-safe intake of OpenClaw and Hermes Agent for SEIS agent/plugin research. Nothing here has been installed globally and no downloaded installer has been executed.

## Sources

| System | Official site | Repository | Local path | Snapshot |
| --- | --- | --- | --- | --- |
| OpenClaw | https://openclaw.ai | https://github.com/openclaw/openclaw | `openclaw/` | `bcdc93d651c434cebc9ef460f0b4c6672ee94af5` |
| Hermes Agent | https://hermes-agent.nousresearch.com | https://github.com/NousResearch/hermes-agent | `hermes-agent/` | `ef3a650f05d2e9ce14855af1d0184f3ee93455da` |

Both projects are MIT licensed in their repositories.

## Downloaded artifacts

| Artifact | Path | Purpose | SHA-256 |
| --- | --- | --- | --- |
| OpenClaw macOS app DMG | `apps/OpenClaw-2026.5.28.dmg` | Optional local app review/install candidate | `e11f93f313d8b2fffdce71676722e9d6ae742ff6aa9ce9a8bbc93c98a22c6a28` |
| OpenClaw dependency evidence | `apps/openclaw-2026.5.28-dependency-evidence.zip` | Supply-chain review input | `7d39ecf04a6962f3bca86f3686e38e24aa719bec9d7921f45eb4188859be6dc6` |
| Hermes wheel | `apps/hermes_agent-0.15.2-py3-none-any.whl` | Python package review/install candidate | `1484b0bf66d269c8d90336509b41a9c1041fc7e6124f138df71c248a955cdc3b` |
| Hermes source distribution | `apps/hermes_agent-0.15.2.tar.gz` | Python package source review | `3192f8d5d11b1d368b8a8090d68a7fb0a1e485d991f99ff7ed98b53d93e5ce78` |

## Reference material

| File | Use |
| --- | --- |
| `docs/openclaw-llms.txt` | Compact OpenClaw docs index for LLM-assisted review |
| `docs/openclaw-llms-full.txt` | Full OpenClaw docs archive |
| `docs/hermes-llms.txt` | Compact Hermes docs index for LLM-assisted review |
| `docs/hermes-llms-full.txt` | Full Hermes docs archive |
| `installers/openclaw-install.sh` | OpenClaw installer script for audit only |
| `installers/hermes-install.sh` | Hermes installer script for audit only |
| `metadata/openclaw-latest-release.json` | GitHub latest release metadata |
| `metadata/hermes-latest-release.json` | GitHub latest release metadata |

## SEIS relevance

- OpenClaw is useful as a reference for a multi-channel AI gateway, channel/plugin surfaces, MCP configuration, local companion app patterns, and long-running personal assistant operations.
- Hermes Agent is useful as a reference for self-improving skills, profile isolation, scheduled automations, MCP tool filtering, multi-provider model routing, and subagent delegation.
- The strongest immediate fit is not wholesale adoption. The safer path is to study their plugin/connector models and extract small SEIS-compatible patterns into the existing `google-open-source-copilot` lane surface.

## Safety stance

- Do not execute installer scripts until they have been reviewed.
- Do not run the OpenClaw DMG or Hermes package in the main workspace.
- Prefer isolated profiles, explicit tool allowlists, and no daemon/service installation during first tests.
- Treat external agent memory, automation, shell, browser, and messaging integrations as privileged surfaces.

