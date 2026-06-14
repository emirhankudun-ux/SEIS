# SEIS-AI Agent

Date: 2026-06-14

SEIS-AI Agent is the combined agent direction for the repo-contained SEIS plugin family. It orchestrates `seis`, `seis-cloud`, `seis-code`, `seis-design`, and `seis-data` as one long-running product system.

## Development Rule

SEIS-AI Agent development stays directly inside the SEIS repository:

- plugin root: `plugins/seis-ai-agent`
- repo marketplace: `.agents/plugins/marketplace.json`
- install id: `seis-ai-agent@seis-repo`
- terminal installer: `scripts/install-seis-ai-agent.mjs`

The website is a future release surface, not the immediate source of truth. Build it only when the agent, install flow, docs, quality gates, and release decision are ready.

## Terminal Install

macOS and Linux:

```bash
npm run install:seis-ai-agent
./install/seis-ai-agent/install.sh
```

Windows PowerShell:

```powershell
.\install\seis-ai-agent\install.ps1
```

Linux uses the same Node-based installer and shell wrapper as macOS.

## Cinematic Website Direction

When SEIS-AI Agent is ready for a public release decision, the website should be cinematic, premium, accessible, responsive, and design-governed. The first version should show real product surfaces: agent cockpit, lane map, terminal install page, architecture story, governance story, and design system showcase.

## Quality Gates

```bash
npm run check:seis-ai-agent
npm run check:seis-repo-marketplace
npm run quality
```
