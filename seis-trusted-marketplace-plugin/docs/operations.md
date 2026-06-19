# Operations

Use this page when maintaining the private personal plugin repo.

## Health Report

```bash
npm run doctor
npm run doctor:strict
npm run bridge:snapshot
npm run bridge:snapshot:check
npm run ecosystem:bundle
npm run ecosystem:bundle:check
```

The doctor command reads the existing plugin manifests, connection asset,
capability map, README, skill, and Git metadata. It does not call external
services, install dependencies, or write files.

Use `npm run doctor` when you want a readable readiness report. Use
`npm run doctor:strict` in CI or release checks when a failing doctor result
must stop the run.

The bridge snapshot command writes `assets/bridge-health-snapshot.json`. It is
deterministic and intentionally omits timestamps and local Git status so normal
checks do not create noisy diffs.

The check variant compares the generated snapshot to the tracked file without
rewriting it. Use it in CI and before publishing so stale bridge evidence blocks
the release path.

The snapshot policy lists the required bridge check IDs and capability lane IDs.
Keep those IDs stable unless the UIXAppTTR repo contract is updated in the same
bounded pass.

The ecosystem bundle command mirrors the UIXAppTTR submitted plugin inventory
into this personal plugin repo and adds the local personal plugin entries the
user requested in chat. The check variant fails when that generated bundle is
stale.

Use JSON output when another script needs to consume the report:

```bash
npm --silent run doctor:json
```

## What Doctor Checks

- manifest parity between `.codex-plugin/plugin.json` and root `plugin.json`
- private personal mode
- `UIXAppTTR` product repo binding
- GitHub Actions validation workflow
- safe install/update/remove documentation
- readiness of the eight capability lanes

## Operating Rhythm

1. Edit the plugin source.
2. Run `npm run validate`.
3. Run `npm run doctor:strict`.
4. Run `npm run bridge:snapshot`.
5. Run `npm run bridge:snapshot:check`.
6. Run `npm run ecosystem:bundle`.
7. Run `npm run ecosystem:bundle:check`.
8. Reinstall with `codex plugin add seis-trusted-marketplace@personal`.
9. Update the `UIXAppTTR` repo contract only when the bridge shape changes.
