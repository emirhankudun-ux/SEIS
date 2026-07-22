# SEIS-Agent

`SEIS-Agent` is the default public SEIS plugin. It replaces the former screen
of numbered topic cards with ten general plugins that people can understand
quickly.

Each general plugin selects exactly three internal capability packages. Those
30 packages preserve 375 app/topic source capabilities (plus five embedded
SEIS-Agent root modules) without becoming separate marketplace cards or direct
installation targets. Every internal package contains at most 15 capabilities.

## Visible marketplace surface

| General plugin | Best for |
| --- | --- |
| SEIS-Agent | AI, agents, models, routing, context, and retrieval |
| SEIS Automation & Delivery | workflows, planning, and delivery |
| SEIS Cloud & DevOps | infrastructure, DevOps, reliability, and DevSecOps |
| SEIS Security & Governance | security, compliance, permissions, and risk |
| SEIS Data & Knowledge | data, analytics, search, memory, and knowledge |
| SEIS Design & Creative | design systems, UX, accessibility, frontend, and creative work |
| SEIS Eleni & Visual | Eleni-Neferi, identity, graphics, rendering, and media |
| SEIS Research & Ecosystem | research, desktop, platform, and Pantechnoesis work |
| SEIS Engineering Foundations | architecture, frontend, systems, and development foundations |
| SEIS Engineering Delivery | backend, testing, tooling, release, and delivery work |

The marketplace keeps these ten names unique. It does not show `Topic … 01`,
`Topic … 02`, or duplicate source cards.

## Select one plugin for one scoped task

The default is a plan for SEIS-Agent and does not install anything:

```bash
npm run install:seis-ai-agent
```

Find up to three local task-matched options, without network access or
installation:

```bash
npm run install:seis-ai-agent -- --find "frontend accessibility design"
```

Review one chosen general plugin:

```bash
npm run install:seis-ai-agent -- --general-plugin design-creative
```

Only after human review may an operator use `--apply` for that one selected
plugin. Internal package IDs are deliberately rejected as install targets.

The read-only MCP tools are:

- `seis_general_plugin_guide`
- `seis_general_plugin_find`
- `seis_general_plugin_recommend`

Legacy `seis_public_bundle_*` tool names remain compatibility aliases, but
they return the general-plugin model and do not revive legacy bundle cards.

## Automation and release boundary

SEIS Auto Mode plans and builds only in the current foreground invocation. It
uses supervised roles, recorded validation, and explicit handoff; it never
claims a persistent background agent. Publication, tags, releases, deployment,
credential use, and external writes remain human-approved.

This structural distribution release is versioned `0.4.0+codex.20260722`.
Future changes to the visible card count or the 30-package topology require a
recorded version increase and release notes.

## Validation

```bash
npm run check:seis-public-plugin-family
npm run check:seis-unified-plugin-suite
npm run check:seis-public-plugin-release-policy
npm run check:seis-ai-agent
```
