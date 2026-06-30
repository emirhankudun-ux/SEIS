# Cloud Access Policy

SEIS separates public cloud from team VPN cloud.

## Public Cloud

Public cloud is for everyone. It hosts product, documentation, site, release,
and preview surfaces that are intended to be visible without private network
membership.

Use public cloud providers for public-facing delivery:

- GitHub Pages
- Cloudflare Pages
- Vercel
- Netlify
- Firebase Hosting
- Azure Static Web Apps
- AWS Amplify
- Hostinger/static hosting
- Apache shared hosting

Public cloud must not require VPN access for normal visitors.

Check the public cloud surface without changing GitHub settings:

```bash
npm run cloud:public:readiness -- --repo OWNER/REPO
```

Use strict mode when a handoff should fail unless the public URL is reachable:

```bash
npm run cloud:public:readiness:strict -- --repo OWNER/REPO
```

### GitHub Pages Actions Contract

GitHub Pages must use GitHub Actions as the build and deployment source. The
repository Pages API should report `build_type` as `workflow` before SEIS claims
that the public cloud lane is ready.

The deploy workflow lives at `.github/workflows/pages.yml` and must keep:

- `contents: read`, `pages: write`, and `id-token: write` permissions
- `workflow_dispatch` for manual reruns
- a main-branch-only deploy job for the protected `github-pages` environment
- `npm run build:static`
- `npm run check:static-build`
- `npm run check:seis-second-brain-browser-smoke` with GitHub-hosted Chrome
- pinned `actions/configure-pages`, `actions/upload-pages-artifact`, and
  `actions/deploy-pages`

The browser smoke step is part of the deploy artifact gate. If Chrome is not
available in a local environment, report that limitation explicitly instead of
claiming rendered Second Brain evidence.

Manual dispatches from PR branches may be used for build artifact and browser
smoke evidence, but the publish step remains reserved for `main`.

## Team VPN Cloud

VPN cloud is for workplaces and teams. It is the private operating surface for
engineering work, Codex remote hosts, handoff flows, and operational workspaces.

Use team VPN cloud when access should be limited to approved people:

- Google Compute Engine VM with WireGuard
- existing Linux SSH/VPS hosts with WireGuard
- Node/VPS hosts
- Docker static hosts used as internal workspaces
- Generic SFTP or private server targets

Team VPN cloud requires:

- approved workplace or team peer membership
- per-peer WireGuard public keys
- per-peer `/32` VPN addresses
- scoped workplace/team source ranges
- explicit rollback owner
- no committed private keys or client configs

## Decision Rule

If the audience is everyone, use public cloud. If the audience is a workplace or
team, use team VPN cloud.
