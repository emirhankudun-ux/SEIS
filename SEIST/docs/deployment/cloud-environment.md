# SEIS Cloud Environment

This workspace keeps cloud deployment provider-neutral until a target is
confirmed.

## Contract

- Cloud manifest: `deploy/cloud-environment.json`
- Connector registry: `content/development/connector-capability-registry.json`
- Validator: `npm run check:cloud-environment`
- Activation report: `npm run automation:server-cloud-report`
- Connector activation report: `npm run automation:connector-activation-report`

## Operating Model

The cloud environment is designed for full-efficiency, low-machine-pressure
development:

- local checks before remote actions
- no committed secrets
- provider selection before deployment
- rollback path before upload
- quiet observability instead of dashboard overload

## Candidate Providers

- GitHub Pages
- Cloudflare Pages
- Vercel static
- Netlify static
- Docker Node static
- Azure Static Web Apps
- AWS Amplify static hosting
- Firebase Hosting

## Required Before Server Upload

1. Select one provider.
2. Set `SEIS_SITE_URL`.
3. Store only that provider's required secret in the provider secret store.
4. Run `npm run check:cloud-environment`.
5. Run `npm run automation:server-cloud-report`.
6. Run `npm run automation:publish-readiness`.
7. Push or deploy only intended files.

Provider secrets are declared in `deploy/cloud-environment.json` for GitHub
Pages, Cloudflare Pages, Vercel, Netlify, Azure Static Web Apps, AWS Amplify,
and Firebase Hosting. Keep the values outside Git.

## Connector Rule

Connectors and MCP servers are not used as decoration. Each one must directly
support repository quality, cloud deployment, observability, release handoff, or
durable workflow automation.

Each connector entry must also declare a `blockedWithout` list so the automation
can report exactly which missing condition keeps that connector inactive.

The connector activation report evaluates those gates locally and writes
`reports/connector-activation-report.json` plus
`reports/connector-activation-report.md` without invoking the connector itself.
