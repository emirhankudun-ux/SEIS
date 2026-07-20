# SEIS Core public repository plugin release train

Status: active public repository preview; current label `0.000000013` and
strict package semver `0.0.13`.

## Scope

This release train belongs to the 62 app-owned, public MIT-licensed plugin
packages in `plugins/seis-core/`. That directory is the canonical application
source boundary inside the public SEIS repository. The ten public source modules directly
under `plugins/` and the public `seis-ai-agent@seis-repo` suite remain on their
own review and marketplace lifecycle.

## Gradual version contract

The human-facing ladder is monotonic and deliberately gradual:

```text
0.000000001 -> 0.00000001 -> 0.000000011 -> ... -> 0.999999999
    -> 1.0000 -> 1.0001 -> ... -> 44.9999 -> 45.0000
```

The current release `0.000000013` maps to strict semver `0.0.13`. During the
micro stage, each approved large-code change advances one decimal unit. After
the first major step, each approved large-code change advances the four-digit
revision by one. An annual update advances the major by exactly one and resets
the revision to `0000`. No command can bulk-promote directly to `45.0000`.

`plugin.json` and `plugin-profile.json` retain strict semver for plugin tooling;
profiles also carry the human-facing release label and release evidence.

## Commands

Preview/apply a measured large-code promotion:

```bash
node scripts/create-seis-core-plugin-change-evidence.mjs
npm run promote:seis-core-plugin-release:dry-run
npm run promote:seis-core-plugin-release -- --evidence content/development/seis-core-plugin-change-evidence.json
```

Preview/apply the next annual +1 (use `--year 2027` for an explicit year):

```bash
npm run promote:seis-core-plugin-annual-release:dry-run
npm run promote:seis-core-plugin-annual-release -- --year 2027
```

Validate every boundary:

```bash
npm run check:seis-core-plugin-release
npm run check:seis-core-plugin-release-policy
npm run check:seis-core-plugin-release-readiness
npm run check:seis-core-plugin-sources
npm run check:seis-ai-core-plugin-registry
npm run check:seis-core-plugin-matrix
```

The promoter updates all 62 manifests and profiles together, regenerates the
app inventory, AI Core projection, app catalog, release-readiness artifact, and
integration metadata. A large-code apply requires a change-evidence artifact
whose base commit matches `HEAD` and whose measured code delta is at least 500
lines. It never mutates personal marketplace state or live external services.

## Local runtime

`plugins/seis-core/runtime/plugin-contract.mjs` enforces relative entrypoints,
strict release metadata, and empty write/network/secret permission arrays.
`plugins/seis-core/scripts/run-plugin-matrix.mjs` invokes only `--status` in
bounded child processes and records the result in
`content/development/seis-core-plugin-matrix.json`.

## Canonical records

- policy/history: `content/development/seis-core-plugin-release-train.json`
- app inventory: `apps/seis-core/data/seis-core-plugin-sources.json`
- AI Core projection: `content/development/seis-ai-core-plugin-registry.json`
- runtime matrix: `content/development/seis-core-plugin-matrix.json`
- release readiness: `apps/seis-core/data/seis-core-plugin-release-readiness.json`
- change evidence generator: `scripts/create-seis-core-plugin-change-evidence.mjs`
- promoter: `scripts/promote-seis-core-plugin-release.mjs`
- checker: `scripts/check-seis-core-plugin-release.mjs`

## Rollback

Revert the focused release promotion commit and regenerate the app inventory,
registry, integration manifest, and runtime matrix. The release promotion is
metadata-only and does not require a data migration.
