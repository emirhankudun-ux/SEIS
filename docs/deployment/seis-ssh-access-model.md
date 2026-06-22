# SEIS SSH Access Model

SEIS SSH is cloud-only from the ChatGPT and Codex SSH surface. The picker should
show one operational target:

```text
SEIS-SSH
```

Do not expose local Mac, LAN, direct VPS, or VPN-specific aliases in the picker.
Those routes can exist as infrastructure implementation details, but they are
not the user-facing SEIS SSH entry point.

## Profiles

| Profile | Audience | Transport | VPN | Development system |
| --- | --- | --- | --- | --- |
| `individual-cloud` | Individual users | GitHub Codespaces | No | Cloud workspace |
| `organization-vpn-cloud` | Companies and teams | WireGuard or equivalent VPN cloud | Yes | Private cloud workspace |
| `developer-closed-system` | Developers | Isolated cloud workspace | Yes for sensitive/team work | Closed cloud development system |

## Individual Users

Individual users use normal cloud SSH through `SEIS-SSH`. The default transport
is GitHub Codespaces because it gives a portable remote workspace without
depending on the current Mac, a LAN hostname, or a single direct VPS firewall.

Required proof:

```bash
npm run cloud:ssh:online:strict
```

## Long-Term Roadmap

The long-term cloud-only roadmap lives in:

```text
deploy/seis-ssh-cloud-roadmap.json
deploy/seis-ssh-closed-runtime-contract.json
deploy/seis-ssh-5-year-enterprise-benchmark.json
docs/deployment/seis-ssh-cloud-roadmap.md
docs/deployment/seis-ssh-closed-developer-runtime.md
docs/deployment/seis-ssh-new-device-bootstrap.md
docs/deployment/seis-ssh-5-year-enterprise-blueprint.md
```

The roadmap keeps the current online setup from becoming a short-term local
workaround. It locks the following long-horizon direction:

- one stable `SEIS-SSH` entry point
- normal cloud SSH for individual users
- VPN-controlled cloud SSH for companies and teams
- closed cloud development system for developers
- sanitized closed-runtime handoff without secrets
- no local Mac, LAN, direct VPS, or VPN-specific picker aliases
- new computer bootstrap through the same `SEIS-SSH` alias

## Companies And Teams

Companies and teams must use a VPN-controlled cloud route. WireGuard is the
current modeled path. Team peers must be approved explicitly, use per-peer `/32`
addresses, and must not use broad source ranges such as `0.0.0.0/0`.

The user-facing alias stays `SEIS-SSH`; the VPN layer is an access control
implementation, not another picker entry.

## Developers

Developer work should happen in a closed cloud development system for sensitive
or long-running engineering. That means:

- no dependency on `127.0.0.1`
- no dependency on `.local` LAN hostnames
- no direct public VPS as the default development surface
- remote SEIS repo present under `/workspaces/SEIS`
- remote Codex CLI installed and verified
- secrets, tokens, private keys, and certificates kept out of the repo

This preserves open-source repository visibility while keeping sensitive
development runtime isolated.

## Validation

```bash
npm run check:seis-ssh-access-model
npm run check:seis-ssh-cloud-roadmap
npm run check:seis-ssh-closed-runtime
npm run check:seis-ssh-enterprise-benchmark
npm run cloud:ssh:online:strict
npm run check:ssh-vpn-cloud-server
```

## Enterprise reference (Apple / Big Tech / Large AI)

### Apple-style expectations

- Key-based identity as primary gate (passwordless terminal entry).
- One visible target (`SEIS-SSH`) across picker/terminal surfaces.
- Strictly non-leaky secret handling (no private keys/tokens in repo or reports).
- Fast remote portability between devices (fresh machine should recover by installing alias + checks).

### Google-style expectations

- Controls-as-code (`scripts/*check*`, `deploy/*` JSON contracts, and explicit runbooks).
- Drift detection (`check:seis-ssh-access-model`, `check:ssh-vpn-cloud-server`, etc.).
- Policy precedence over one-off manual scripts.

### Large AI-company expectations

- “Online” must include runtime capability checks (repo present, `codex` present, transport verified), not only TCP reachability.
- Operational telemetry and handoff artifacts are explicit and sanitized.
- Guarded AI tool surface: plugin/tool controls and safe shell wrapper are mandatory.

### SEIS alignment today

- `SEIS-SSH` one alias: `deploy/seis-ssh-access-model.json` and installer enforce this.
- `npm run cloud:ssh:online:strict`: checks cloud-only entrypoint + remote readiness.
- `npm run check:seis-ssh-picker-compatibility`: detects picker-limited transport risk and suggests direct-cloud fallback.
- `server/cloud/ssh-ai-shell/install.sh` hardening: key-only forced match block, daemon isolation options, and protected env/keys ownership.
- The 5-year enterprise benchmark for this model is documented at:
  [seis-ssh-5-year-enterprise-blueprint.md](./seis-ssh-5-year-enterprise-blueprint.md).
- The machine-readable 5-year benchmark is:
  `deploy/seis-ssh-5-year-enterprise-benchmark.json`.
