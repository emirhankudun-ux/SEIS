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

`seis-ai-agent@seis-repo` is the canonical default user-facing SEIS plugin. It
composes the SEIS governance lane, SEIS Hub, SEIS Cloud, SEIS-Code,
SEIS-Design, SEIS-DATA, SEIS Security, SEIS Research, SEIS Automation, and
SEIS Product as repo-contained lanes.

Historical `personal` identifiers are retained only in a disabled compatibility record. The `seis`,
`seis-cloud`, `seis-code`, `seis-design`, and `seis-data` directories remain
source mirrors for lane development. The repo marketplace publishes one
canonical `seis-ai-agent` card plus 33 optional bounded `seis-repo` bundles,
not one card for every source package. Start with SEIS-Agent, then choose at
most one optional bundle for a single scoped task. Each bundle contains no more
than 15 retained source capabilities, never bulk-installs its members, and
does not grant provider, network, write, deployment, or release access.

The AI Core registry keeps exactly 5000 entries inside the SEIS repository. It
indexes 75 public MIT-licensed app-owned source packages under
`plugins/seis-core`, 300 retained topic packages, and five retained root
modules for a total of 380 public source capabilities. Historical personal
marketplace coverage remains a compatibility audit record, not active source
ownership.
`packages/seis-ai` remains the metadata, contract, permission, and read-only
inspection layer; it does not own the public app source packages. Catalog
presence never claims a working provider, MCP server, external integration, or
public release.

### Public selection guide

The generated guide at
[`docs/roadmap/SEIS_PUBLIC_PLUGIN_SELECTION_GUIDE.md`](../roadmap/SEIS_PUBLIC_PLUGIN_SELECTION_GUIDE.md)
provides six fast starting paths and all 19 curated journeys. The same bounded,
local read-only data is available inside SEIS-Agent through
`seis_public_bundle_guide`. When the user does not already know a journey ID,
`seis_public_bundle_find` accepts one short need statement and returns at most
three deterministic local candidates from generated public metadata.
`seis_public_bundle_recommend` then returns only the first optional bundle for
one chosen journey. These tools are guidance only: they never install a package,
automatically select a continuation bundle, expose the source-term index, or
perform an external action.

Terminal-only users can run the equivalent bounded local discovery command:

```bash
npm run install:seis-ai-agent -- --find "SBOM supply chain"
```

It returns at most three candidates, performs no installation, and emits a
reviewable `--journey` plan for each candidate.

The terminal installer can carry that known journey into a plan without adding
new marketplace cards or searching for a bundle manually:

```bash
npm run install:seis-ai-agent -- --journey security
```

This plan contains `seis-ai-agent@seis-repo` and only the journey's validated
first optional bundle. It does not install anything. Use `--apply` only after
review and explicit human approval; the installer rejects arbitrary bundle IDs,
multiple journeys, bulk selection, and continuation bundles.

## Embedded Specialist Lanes

| Lane | Responsibility |
| --- | --- |
| `seis-security` | Threat modeling, secret-safety review, access control, SSH/VPN hardening, and release risk. |
| `seis-research` | Evidence-led source review, official documentation checks, version context, and decision synthesis. |
| `seis-automation` | Repeatable scripts, CI checks, runbooks, scheduled jobs, and human-approved agent workflows. |
| `seis-product` | Roadmap slices, requirements, acceptance criteria, launch readiness, and product scope. |

The active integration contract is
[`content/development/seis-agent-plugin-integration.json`](../../content/development/seis-agent-plugin-integration.json).
It binds the legacy compatibility aliases and public repository sources into SEIS-Agent, exposes the
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
