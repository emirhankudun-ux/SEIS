# SEIS Public Install State

`seis-public-install-state` is a retained application source capability exposed
through the curated `seis-application-bundle-05@seis-repo` card. It makes
marketplace visibility and release evidence explicit without pretending that
all 380 retained source capabilities remain separate marketplace cards.

## Public boundary

- Source: `plugins/seis-core/seis-public-install-state`
- Marketplace: `SEIS Repo` (`seis-repo`)
- Curated card: `seis-application-bundle-05@seis-repo`
- Audience: everyone
- Contract: `content/development/seis-public-install-state.json`
- Goal: `SEIS-GOAL-021`

The plugin reads only fixed public repository contracts. It never installs,
enables, publishes, deploys, pushes, writes files, reads secrets, or accesses
the network.

## State model

1. **Public source available** — 34 curated cards and 380 bounded source
   capabilities are visible in SEIS Repo without being conflated.
2. **Historically artifact validated** — the preserved pre-bundle 381-card
   staging snapshot verified the canonical package and retained source
   capabilities; it is not current 34-card bundle-install proof.
3. **Independently installed** — a sanitized clean-runner or public package
   installation record is required before this can be claimed.
4. **Release approved** — a human owner must separately authorize publication,
   credentialed activation, external writes, or release actions.

`AVAILABLE` is deliberately only a curated-card source-visibility state. It does not
mean installed, authenticated, independently proven, or release-approved.

## Validate

```bash
npm run automation:seis-public-install-state
npm run check:seis-public-install-state
npm run check:seis-core-public-install-state
npm run check:seis-repo-marketplace
```

## Next evidence

The current gate remains independent clean-runner or public package
installation evidence, followed by explicit human approval. This plugin reports
that boundary; it never bypasses it.
