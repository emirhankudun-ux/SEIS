# SEIS Application: Developer Engineering 01 of 03

Developer Engineering application selection bundle with 14 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## What this package is

This is an optional public SEIS Repo selection bundle that groups exactly 14 retained application source capabilities. It is not a bulk installer and does not claim live provider, deployment, signing, or external write access.

## Components

- `.codex-plugin/plugin.json` defines the public bundle card.
- `.mcp.json` exposes a local read-only bundle MCP server.
- `assets/bundle-profile.json` records the deterministic 14-member map.
- `skills/seis-application-bundle-04/SKILL.md` documents bounded selection and planning workflows.

## Installation policy

Install `seis-ai-agent@seis-repo` by default. This bundle is optional and never auto-installs each member. The listed source packages remain retained in the public repository so a rollback only reverts this marketplace projection.

## Validate

```bash
npm run check:seis-public-plugin-bundles
npm run check:seis-public-plugin-family
npm run check:seis-repo-marketplace
```
