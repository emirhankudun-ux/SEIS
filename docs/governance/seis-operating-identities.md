# SEIS Operating Identities

Date: 2026-06-14

SEIS is a creative engineering ecosystem, not a single website, app, repository,
or agent. Its primary identities make the ecosystem easier to govern without
splitting the source of truth.

| Identity | Role | Canonical Surface |
|---|---|---|
| SEIS | Ecosystem governance, architecture, docs, quality, and open-source operating model. | Repository root |
| SEIS-Agent | Unified agent orchestration across MCP, skills, plugins, automation, memory, context, cloud, code, design, and data. | `plugins/seis-ai-agent` |
| SEIS-Cloud | SSH-enabled, VPN-ready engineering cloud and public-cloud readiness. | `plugins/seis-cloud` |
| SEIS-Code | Architecture-aware implementation, tests, CI, MCP/plugin code, and automation. | `plugins/seis-code` |
| SEIS-Design | Premium, minimal, cinematic, accessible, responsive design systems and product experience. | `plugins/seis-design` |
| SEIS-Data | Memory, context systems, analytics, reports, knowledge governance, source intake, and provenance. | `plugins/seis-data` |

## Workflow

The default delivery path is:

```text
GitHub -> Codex Cloud -> Branch -> Commit -> Pull Request -> Review -> Merge
```

Local work may happen directly in the checkout, but it must preserve GitHub as
the source of truth and remain ready for branch, commit, pull request, review,
and merge handoff.

## Cloud Boundary

Public cloud is for everyone-facing surfaces. SSH/WireGuard VPN cloud is for
approved workplaces and teams. The SSH/VPN lane must use Ed25519-only SSH,
least privilege, no password login, approved WireGuard peers, release handoff
roots, rollback contacts, and no exposed secrets.

## Memory And Context Boundary

Memory and context systems belong under SEIS-Data and SEIS-Agent. External or
legacy memory repositories should become verified source snapshots,
child-agent manifests, private/archived sources, or explicit retained
exceptions before public launch.

## Validation

```bash
npm run check:seis-operating-identities
npm run check:seis-ai-agent
npm run check:ssh-vpn-cloud-server
npm run quality
```
