# SEIS Public Install State

`seis-public-install-state@seis-repo` is a public, app-owned SEIS Repo card
that makes marketplace visibility and release evidence explicit.

## Public boundary

- Source: `plugins/seis-core/seis-public-install-state`
- Marketplace: `SEIS Repo` (`seis-repo`)
- Audience: everyone
- Contract: `content/development/seis-public-install-state.json`
- Goal: `SEIS-GOAL-021`

The plugin reads only fixed public repository contracts. It never installs,
enables, publishes, deploys, pushes, writes files, reads secrets, or accesses
the network.

## State model

1. **Public source available** — a card and bounded source package are visible
   in SEIS Repo.
2. **Locally artifact validated** — a disposable local staging check verified
   package artifacts without using a public marketplace installation.
3. **Independently installed** — a sanitized clean-runner or public package
   installation record is required before this can be claimed.
4. **Release approved** — a human owner must separately authorize publication,
   credentialed activation, external writes, or release actions.

`AVAILABLE` is deliberately only a public-source visibility state. It does not
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
