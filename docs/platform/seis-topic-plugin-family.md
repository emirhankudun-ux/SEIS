# SEIS Objective-Derived Topic Plugin Family

The SEIS repository retains the objective-derived topic family as 300
repository-owned MIT source packages across 15 categories. The public
`seis-repo` marketplace exposes them through 27 bounded topic bundle cards,
available to everyone without presenting 300 separate cards.

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

The current curated public repository marketplace is:

- 1 canonical `seis-ai-agent@seis-repo` orchestrator
- 6 application bundle cards covering 75 app-owned `plugins/seis-core` sources
- 27 topic bundle cards covering 300 objective-derived `plugins/seis-topics` sources
- 34 marketplace cards total
- 380 retained source capabilities total: 5 root + 75 application + 300 topic

The canonical default install remains `seis-ai-agent@seis-repo`. Each topic
source maps to exactly one topic bundle and remains independently identifiable
inside that bundle. It is not a personal plugin or a direct marketplace card.

## Package contract

Each topic package contains:

- `.codex-plugin/plugin.json` — retained MIT source-package identity
- `.mcp.json` — package-local MCP server declaration
- `assets/topic-profile.json` — objective source, category, status, audience,
  license, and permission boundary
- `skills/<topic-id>/SKILL.md` — topic workflow
- `scripts/<topic-id>-mcp-server.mjs` — deterministic entrypoint
- `runtime/topic-plugin-runtime.mjs` — standalone bounded read-only runtime

The runtime supports status and repository-shape report tools. A source-level
`publicMarketplace` marker means discoverable through the curated marketplace;
it does not make the source a separate card. The runtime does not
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
