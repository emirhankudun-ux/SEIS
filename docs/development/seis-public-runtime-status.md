# SEIS Public Runtime Status

`seis-public-runtime-status` is a retained application source capability in the
curated `seis-application-bundle-05@seis-repo` card. It compares the 34 current
curated marketplace cards with bounded local cache records.

## Public boundary

- Source: `plugins/seis-core/seis-public-runtime-status`
- Marketplace: `SEIS Repo` (`seis-repo`)
- Curated card: `seis-application-bundle-05@seis-repo`
- Audience: everyone
- Contract: `content/development/seis-public-runtime-status.json`
- Goal: `SEIS-GOAL-021`

The plugin reads only public marketplace metadata, declared public source
manifests, and cache manifests directly below the `seis-repo` cache root. It
does not inspect other marketplace roots, install, enable, update, publish,
deploy, push, write files, read secrets, or access the network.

## Cache states

- **Current**: a cache manifest version matches the declared public source.
- **Stale**: a cache manifest exists but does not match the declared source
  version.
- **Missing**: no cache directory was observed for a declared public card.
- **Invalid**: a declared cache directory lacks a safe matching manifest.
- **Undeclared**: a cache directory exists without a current public card; only
  its count is reported.

A cache record is not proof that Codex currently enables a package. It also is
not independent installation evidence, authorization, or release approval.
The separate 380-capability source inventory is retained for source access and
is not counted as 380 additional cache-observed marketplace cards.

## Validate

```bash
npm run automation:seis-public-runtime-status
npm run check:seis-public-runtime-status
npm run check:seis-core-public-runtime-status
npm run check:seis-repo-marketplace
```

To inspect the bounded local cache observation directly:

```bash
node plugins/seis-core/seis-public-runtime-status/scripts/seis-public-runtime-status-mcp-server.mjs --runtime
```
