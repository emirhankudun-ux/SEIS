# SEIS-Agent Platform Surface

SEIS-Agent is the public SEIS entry point for macOS, Windows, and Linux Codex
workflows. It is intentionally a small user-facing surface: ten general
plugins, not hundreds of source-card installations.

## Distribution contract

- Marketplace: `seis-repo`
- Canonical install: `seis-ai-agent@seis-repo`
- Public general plugin cards: 10
- Hidden internal packages: 30
- Internal package maximum: 15 capabilities
- Source capabilities retained in the repository: 380
- Default user choice: one general plugin per scoped task
- Public publication, tags, deployments, credentials, and external writes:
  human-approved only

The ten general plugins cover AI, automation, cloud/DevOps, security, data,
design, Eleni visual work, research/ecosystem, engineering foundations, and
engineering delivery. The former numbered topic cards are retired from the
marketplace projection.

## Local selection

MCP guidance is local and read-only:

- `seis_general_plugin_guide`
- `seis_general_plugin_find`
- `seis_general_plugin_recommend`

The terminal workflow is plan-only unless a human explicitly adds `--apply`:

```bash
npm run install:seis-ai-agent
npm run install:seis-ai-agent -- --find "backend testing release"
npm run install:seis-ai-agent -- --general-plugin engineering-delivery
```

An internal package can never be selected as a direct install target. The
installer always plans exactly one public general plugin.

## Auto Mode

Auto Mode combines planning and build work in the current foreground task. Its
specialist roles are supervised, use a local validation allowlist, and produce
evidence before handoff. It is not a hidden persistent agent, background
process, deployment system, or autonomous publishing mechanism.

## Quality gates

```bash
npm run check:seis-public-plugin-family
npm run check:seis-unified-plugin-suite
npm run check:seis-public-plugin-release-policy
npm run check:seis-ai-agent
npm run check:seis-public-plugin-install-smoke:mcp
```
