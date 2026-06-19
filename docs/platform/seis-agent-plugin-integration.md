# SEIS-Agent Plugin Integration

SEIS-Agent plugin integration keeps the public install surface narrow while preserving focused personal plugin lanes inside the canonical agent package.

## Canonical Manifest

The source of truth is:

```text
content/development/seis-agent-plugin-integration.json
```

The primary install id is `seis-ai-agent@seis-repo`. Specialist SEIS plugin surfaces are embedded lanes, not competing primary installs.

## Runtime Tool

The runtime integration tool is `seis_plugin_integration`.

This tool is exposed through the SEIS AI tool loop and MCP server so automation can inspect plugin lane posture before making routing, readiness, or connector claims.

## Embedded Personal Plugins

The current personal SEIS plugin lanes are:

| Plugin | Role |
| --- | --- |
| `seis@personal` | Core SEIS governance and hub lane. |
| `seis-cloud@personal` | Cloud and deployment operations lane. |
| `seis-code@personal` | Code automation and implementation lane. |
| `seis-design@personal` | Design systems and product experience lane. |
| `seis-data@personal` | Data, analytics, and reporting lane. |

## Embedded Specialist Skills

The 2026-06-19 specialist expansion adds repo-contained skills inside
`plugins/seis-ai-agent/skills` without creating standalone marketplace cards:

| Skill | Role |
| --- | --- |
| `seis-security` | Threat modeling, secret-safety review, access control, SSH/VPN hardening, and release risk. |
| `seis-research` | Evidence-led source review, official documentation checks, version context, and decision synthesis. |
| `seis-automation` | Repeatable scripts, CI checks, runbooks, scheduled jobs, and human-approved agent workflows. |
| `seis-product` | Roadmap slices, requirements, acceptance criteria, launch readiness, and product scope. |

## Operating Rules

- Treat `seis-ai-agent@seis-repo` as the single user-facing SEIS-Agent install.
- Keep `seis@personal`, `seis-cloud@personal`, `seis-code@personal`, `seis-design@personal`, and `seis-data@personal` as embedded capability lanes.
- Keep `seis-security`, `seis-research`, `seis-automation`, and `seis-product` embedded under SEIS-Agent rather than publishing standalone cards.
- Do not claim connector authentication readiness from plugin inventory alone.
- Validate the integration with `npm run check:seis-agent-plugin-integration`.
- Keep Command Center and demo surfaces aligned with the manifest before release or handoff claims.

## Quality Gate

```bash
npm run check:seis-agent-plugin-integration
```
