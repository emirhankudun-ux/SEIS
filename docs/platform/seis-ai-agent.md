# SEIS-Agent

Date: 2026-06-19

SEIS-Agent is the combined agent direction for the repo-contained SEIS plugin
family. Its stable package id is `seis-ai-agent`; its operating identity is
`SEIS-Agent`.

It orchestrates `seis-governance`, `seis`, `seis-cloud`, `seis-code`,
`seis-design`, `seis-data`, `seis-security`, `seis-research`,
`seis-automation`, and `seis-product` as one long-running ecosystem system
across AI, memory, context, MCP, skills, plugins, automation, cloud, code,
design, data, security, research, and product.

## Development Rule

SEIS-Agent development stays directly inside the SEIS repository:

- plugin root: `plugins/seis-ai-agent`
- repo marketplace: `.agents/plugins/marketplace.json`
- install id: `seis-ai-agent@seis-repo`
- terminal installer: `scripts/install-seis-ai-agent.mjs`
- AI Core registry: `content/development/seis-ai-core-plugin-registry.json`

## Consolidation Rule

`seis-ai-agent@seis-repo` is the canonical user-facing SEIS plugin. It composes
the SEIS governance lane, SEIS Hub, SEIS Cloud, SEIS-Code, SEIS-Design,
SEIS-DATA, SEIS Security, SEIS Research, SEIS Automation, and SEIS Product as
repo-contained lanes.

The old `personal` marketplace is a compatibility mirror only. The `seis`,
`seis-cloud`, `seis-code`, `seis-design`, and `seis-data` directories remain
source mirrors for lane development, but the repo marketplace publishes only the
single `seis-ai-agent` plugin card.

The AI Core registry keeps exactly 5000 entries inside the SEIS repository. It
indexes 50 personal source packages owned by the SEIS Command Center under
`plugins/seis-core` and separates them from plan-only catalog slots.
`packages/seis-ai` remains the metadata, contract, permission, and read-only
inspection layer; it does not own the personal source packages. Catalog
presence never claims a working provider, MCP server, external integration, or
public release.

## Embedded Specialist Lanes

| Lane | Responsibility |
| --- | --- |
| `seis-security` | Threat modeling, secret-safety review, access control, SSH/VPN hardening, and release risk. |
| `seis-research` | Evidence-led source review, official documentation checks, version context, and decision synthesis. |
| `seis-automation` | Repeatable scripts, CI checks, runbooks, scheduled jobs, and human-approved agent workflows. |
| `seis-product` | Roadmap slices, requirements, acceptance criteria, launch readiness, and product scope. |

The active integration contract is
[`content/development/seis-agent-plugin-integration.json`](../../content/development/seis-agent-plugin-integration.json).
It binds the installed personal plugin family into SEIS-Agent, exposes the
`seis_plugin_integration` tool in the SEIS AI runtime, and connects the demo app
God Mode ecosystem lanes to the same source of truth.

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
npm run quality:governance
npm run check:seis-agent-plugin-integration
```

## Cloud Access and Migration Quality

Before handoff to team/private cloud operations, run the cloud access gate and migration audit:

```bash
npm run check:cloud-access-policy
npm run cloud:migration:audit:ci
npm run cloud:migration:audit -- --strict
```

Use the local-to-cloud playbooks when converting legacy SSH-centric paths:

- `docs/deployment/local-to-cloud-ssh-playbook.md`
- `docs/deployment/server-target-selection.md`
- `docs/deployment/server-upload-runbook.md`
