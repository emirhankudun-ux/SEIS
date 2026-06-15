# SEIS-Agent

Date: 2026-06-15

SEIS-Agent is the combined agent direction for the repo-contained SEIS plugin
family. Its stable package id is `seis-ai-agent`; its operating identity is
`SEIS-Agent`.

It orchestrates `seis`, `seis-cloud`, `seis-code`, `seis-design`, and
`seis-data` as one long-running ecosystem system across AI, memory, context,
MCP, skills, plugins, automation, cloud, code, design, and data.

## Development Rule

SEIS-Agent development stays directly inside the SEIS repository:

- plugin root: `plugins/seis-ai-agent`
- repo marketplace: `.agents/plugins/marketplace.json`
- install id: `seis-ai-agent@seis-repo`
- terminal installer: `scripts/install-seis-ai-agent.mjs`

## Consolidation Rule

`seis-ai-agent@seis-repo` is the canonical user-facing SEIS plugin. It composes
the SEIS governance plugin plus SEIS Cloud, SEIS-Code, SEIS-Design, and
SEIS-DATA as repo-contained lanes.

The old `personal` marketplace is a compatibility mirror only. The `seis`,
`seis-cloud`, `seis-code`, `seis-design`, and `seis-data` directories remain
source mirrors for lane development, but the repo marketplace publishes only the
single `seis-ai-agent` plugin card.

Use the single-agent install for normal work:

```bash
npm run install:seis-ai-agent
```

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

When SEIS-Agent is ready for a public release decision, the website should be
cinematic, premium, accessible, responsive, and design-governed. The first
version should show real product surfaces: agent cockpit, lane map, terminal
install page, architecture story, governance story, memory/context system, and
design system showcase.

## Quality Gates

```bash
npm run check:seis-ai-agent
npm run check:seis-operating-identities
npm run check:seis-repo-marketplace
npm run quality
```
