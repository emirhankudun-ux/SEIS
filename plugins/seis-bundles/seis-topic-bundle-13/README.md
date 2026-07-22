# SEIS Topic: Data 02 of 02

Data topic selection bundle with 10 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## What this package is

This is an optional public SEIS Repo selection bundle that groups exactly 10 retained topic source capabilities. It is not a bulk installer and does not claim live provider, deployment, signing, or external write access.

## Components

- `.codex-plugin/plugin.json` defines the public bundle card.
- `.mcp.json` exposes a local read-only bundle MCP server.
- `assets/bundle-profile.json` records the deterministic 10-member map.
- `skills/seis-topic-bundle-13/SKILL.md` documents bounded selection and planning workflows.

## Installation policy

Install `seis-ai-agent@seis-repo` by default. This bundle is optional and never auto-installs each member. The listed source packages remain retained in the public repository so a rollback only reverts this marketplace projection.

## Validate

```bash
npm run check:seis-public-plugin-bundles
npm run check:seis-public-plugin-family
npm run check:seis-repo-marketplace
```
