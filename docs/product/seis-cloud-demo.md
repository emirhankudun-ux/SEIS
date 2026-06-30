# SEIS Cloud Browser-Local Demo

`apps/web/seis-cloud.html` is a standalone SEIS Cloud control panel demo for the public OS runway.

## What works

- Browser-local cloud control UI with responsive layout.
- State filters for `connected`, `mock`, `disabled`, `planned`, and `unknown` cloud surfaces.
- Local readiness sweep, deployment dry-run, profile save, log append, and safe env example interactions.
- `localStorage` persistence under `seis.cloud.control.v1`.
- Clear Cloud/SSH security boundary with no live SSH, no deployment, no provider calls, and no credential handling.

## Honest state model

- `connected`: only the browser-local demo shell and local state are connected.
- `mock`: GitHub, CI, storage, observability, backups, and logs are representative demo data.
- `disabled`: SSH and remote command execution are intentionally inactive.
- `planned`: deployment, Codespaces, and VPN/Tailscale lanes are future work.
- `unknown`: provider health is unknown because this static page does not query providers.

## Security boundary

The demo does not execute shell commands, create SSH connections, deploy infrastructure, contact cloud providers, fetch GitHub data, or read secrets. Live cloud work must be implemented behind approved backend/server boundaries with explicit human approval, host verification, rollback evidence, and no browser-exposed private keys.

## Validation

Run the focused validator:

```bash
node scripts/check-seis-cloud-demo.mjs
```

The validator checks that the page contains the required state labels, interaction hooks, localStorage key, security copy, and no obvious live-network or remote-execution code paths.
