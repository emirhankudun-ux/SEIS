# SEIS Trusted Marketplace Plugin

SEIS Trusted Marketplace is the local personal Codex plugin that connects the
designer-facing marketplace workflow to the UIX-Apps `UIXAppTTR` branch.

The plugin is not a public marketplace listing by itself. It is a safe local
bridge: Codex can open the plugin, read the repo connection asset, and route
trusted GitHub, MCP, Copilot, model, and marketplace sources through the same
repo governance that protects this branch.

The plugin source repository is `seis-trusted-marketplace-plugin`. It is private
personal by default, but structured with public/publish-ready documentation,
license, changelog, screenshots folder, marketplace setup notes, and GitHub
Actions validation.

## Active Bridge

- Plugin: `seis-trusted-marketplace`
- Display name: `SEIS Trusted Marketplace`
- Plugin source repository:
  `https://github.com/emirhankudun-ux/seis-trusted-marketplace-plugin.git`
- Source path: `/Users/emirhan/plugins/seis-trusted-marketplace`
- Personal marketplace: `/Users/emirhan/.agents/plugins/marketplace.json`
- Repo branch: `UIXAppTTR`
- GitHub remote: `https://github.com/emirhankudun-ux/UIX-Apps.git`
- Repo contract: `content/development/seis-trusted-marketplace-plugin.json`
- Plugin connection asset: `assets/seis-repo-connection.json`
- Plugin capability asset: `assets/capability-map.json`
- Plugin bridge health snapshot: `assets/bridge-health-snapshot.json`
- Plugin requested ecosystem bundle: `assets/requested-ecosystem-bundle.json`

## Capability Lanes

The plugin routes work through eight lanes before live activation:

- data engineering
- development
- design
- learning
- monitoring
- productivity
- security
- testing

The bridge health snapshot must keep these five checks stable:

- manifest parity
- private/personal mode
- UIXAppTTR binding
- GitHub workflow presence
- safe install documentation

## Operating Rule

Use the plugin for curation and readiness. Use the repo validator for evidence.
Live installs, external writes, paid listings, and GitHub publication still need
an explicit target, auth state, approval, and rollback path.

Local plugin readiness, `UIXAppTTR` GitHub publication, and live external
activation must be reported separately.

## Three Readiness States

- Local plugin readiness means the personal plugin files, manifests, capability
  lanes, safe install docs, and bridge snapshot validate on this machine.
- GitHub branch publication means committed UIXAppTTR or plugin repo changes
  have been pushed to their GitHub remotes after clean readiness checks.
- Live marketplace activation means an install, external connector action,
  public listing, paid service, or remote write has been explicitly approved
  with target, auth state, and rollback path. This plugin does not treat local
  readiness or GitHub publication as live activation.

## Quality Gate

```bash
npm run doctor
npm run doctor:strict
npm run bridge:snapshot
npm run bridge:snapshot:check
npm run ecosystem:bundle
npm run ecosystem:bundle:check
npm run check:seis-trusted-marketplace-plugin
```

This validator keeps the local plugin metadata, repo contract, marketplace
intake, and documentation aligned enough for a designer-friendly workflow
without making remote CI depend on a personal machine path.

Run `npm run doctor` from the plugin source repository. Run
`npm run check:seis-trusted-marketplace-plugin` from the UIX-Apps product
repository.
