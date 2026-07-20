# SEIS Objective-Derived Topic Plugin Family

The SEIS repository publishes the objective-derived topic family directly in
the public `seis-repo` marketplace (`SEIS Repo`). The family contains 300
repository-owned MIT packages across 15 categories and is available to
everyone.

## Source of truth

- Objective taxonomy: `content/development/seis-topic-plugin-objective.json`
- Generator: `scripts/create-seis-topic-plugin-family.mjs`
- Runtime: `plugins/seis-topics/runtime/topic-plugin-runtime.mjs`
- Marketplace contract: `content/development/seis-public-plugin-family.json`
- Marketplace file: `.agents/plugins/marketplace.json`

The objective includes category headings as first-class cards. The final
`Cinematic Experience` line is kept as a topic card while its full source text
is preserved in `topic-profile.json`; it is not discarded or turned into a
machine-specific path.

## Distribution

The complete public repository marketplace is:

- 1 canonical `seis-ai-agent@seis-repo` orchestrator
- 5 migrated root cards: `seis`, `seis-cloud`, `seis-code`, `seis-design`, and `seis-data`
- 61 app-owned `plugins/seis-core` packages
- 300 objective-derived `plugins/seis-topics` packages
- 367 marketplace entries total

The canonical default install remains `seis-ai-agent@seis-repo`. Topic cards
are independently discoverable repository packages, not personal plugins and
not embedded specialist-lane cards.

## Package contract

Each topic package contains:

- `.codex-plugin/plugin.json` — public MIT plugin card
- `.mcp.json` — package-local MCP server declaration
- `assets/topic-profile.json` — objective source, category, status, audience,
  license, and permission boundary
- `skills/<topic-id>/SKILL.md` — topic workflow
- `scripts/<topic-id>-mcp-server.mjs` — deterministic entrypoint
- `runtime/topic-plugin-runtime.mjs` — standalone bounded read-only runtime

The runtime supports status and repository-shape report tools. It does not
call providers, use the network, read secrets, or write files. Marketplace
availability is not authentication and does not grant GitHub, cloud, SSH,
deployment, connector, or destructive-action authority.

## Validation

```bash
npm run check:seis-topic-plugin-family
npm run check:seis-topic-plugin-matrix
npm run check:seis-topic-plugin-matrix -- --mcp-smoke
npm run check:seis-public-plugin-family
npm run check:seis-public-plugin-external-install-proof
```

The plugin-creator validator can be run against every generated package with
the repository's temporary PyYAML validation environment when system Python
does not provide PyYAML.
