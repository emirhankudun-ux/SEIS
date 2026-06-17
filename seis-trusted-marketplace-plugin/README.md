> [!IMPORTANT]
> **This repository has moved to [SEIS](https://github.com/Emirhan-Kudun/SEIS).**
> Files live under [`sources/seis-trusted-marketplace-plugin/`](https://github.com/Emirhan-Kudun/SEIS/tree/main/sources/seis-trusted-marketplace-plugin) and full branch history is preserved under the `sources/seis-trusted-marketplace-plugin/*` branches in SEIS. This repository is legacy; all development happens in SEIS.

# SEIS Trusted Marketplace

SEIS Trusted Marketplace is a private personal Codex plugin repository for
designer-friendly governance of trusted plugins, MCP servers, GitHub Marketplace
sources, Copilot resources, model channels, and SEIS repo workflows.

It is built for eight capability lanes:

- Data Engineering
- Development
- Design
- Learning
- Monitoring
- Productivity
- Security
- Testing

The source of truth for those lanes is `assets/capability-map.json`.

## Repository Binding

This plugin is bound to the SEIS UIX-Apps working branch:

- plugin source repo: `https://github.com/emirhankudun-ux/seis-trusted-marketplace-plugin.git`
- plugin local source: `/Users/emirhan/plugins/seis-trusted-marketplace`
- product repo: `https://github.com/emirhankudun-ux/UIX-Apps.git`
- product branch: `UIXAppTTR`
- product local workspace: `/Users/emirhan/Library/Mobile Documents/com~apple~CloudDocs/Github/_SEIS_WORKSPACE/UIX-Apps-origin-clean`
- connection asset: `assets/seis-repo-connection.json`
- product repo contract: `content/development/seis-trusted-marketplace-plugin.json`

## What It Does

- reviews trusted sources before activation
- maps each request to a capability lane
- explains value in designer-friendly language
- keeps live installs behind target, auth, approval, and rollback gates
- avoids deprecated GitHub App-based Copilot Extensions for new work
- routes new integrations toward MCP or plugin packaging where possible
- separates local plugin readiness, GitHub branch publication, and live deploy
  readiness

## Private Personal Mode

This is the active mode.

```bash
codex plugin add seis-trusted-marketplace@personal
```

The personal marketplace example lives in
`examples/personal-marketplace.example.json`. The active local personal
marketplace file is `/Users/emirhan/.agents/plugins/marketplace.json`.

## Public Publish-Ready Mode

The repository includes public-release structure, but it should remain private
until private paths, screenshots, support policy, and release notes are reviewed.

See:

- `docs/publication-readiness.md`
- `docs/marketplace-setup.md`
- `screenshots/README.md`

## Validate

```bash
npm run doctor
npm run doctor:strict
npm run bridge:snapshot
npm run bridge:snapshot:check
npm run ecosystem:bundle
npm run ecosystem:bundle:check
npm run validate
python3 /Users/emirhan/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py /Users/emirhan/plugins/seis-trusted-marketplace
```

`npm run doctor` prints a lightweight readiness report for manifest parity,
private/personal mode, `UIXAppTTR` binding, GitHub workflow presence,
safe-install docs, and the eight capability lanes.

`npm run doctor:strict` uses the same report but exits non-zero when a check or
capability lane needs attention. CI and `npm run check` use this strict mode.

`npm run bridge:snapshot` writes `assets/bridge-health-snapshot.json`, a stable
evidence file that the UIXAppTTR product repo can validate without depending on
terminal-only doctor output.

`npm run bridge:snapshot:check` verifies that the tracked snapshot is current
without rewriting it. CI uses this mode so stale evidence fails loudly.
The snapshot also records the required bridge checks and eight capability lane
IDs so the UIXAppTTR product repo can validate the exact contract, not only the
summary counts.

`npm run ecosystem:bundle` reads the UIXAppTTR plugin download-readiness
inventory and writes `assets/requested-ecosystem-bundle.json`. The bundle keeps
the submitted plugins curated, lane-routed, and blocked from live activation
until target, auth, approval, and rollback are explicit.

For machine-readable output, use:

```bash
npm --silent run doctor:json
npm run doctor:strict
npm run bridge:snapshot
npm run bridge:snapshot:check
npm run ecosystem:bundle
npm run ecosystem:bundle:check
```

The matching UIXAppTTR repo-side contract is protected by:

```bash
npm run check:seis-trusted-marketplace-plugin
```

Run that command from the UIX-Apps product repository, not from this plugin
repository.
