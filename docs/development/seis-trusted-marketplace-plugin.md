# SEIS Trusted Marketplace Plugin

SEIS Trusted Marketplace is a public, app-owned SEIS Repo plugin for reviewing
curated GitHub, MCP, model, and marketplace sources before any external action
is approved.

## Public source boundary

- Plugin: `seis-trusted-marketplace@seis-repo`
- Marketplace: `SEIS Repo` (`seis-repo`)
- Source: `plugins/seis-core/seis-trusted-marketplace`
- Audience: everyone
- Repository owner: `SEIS`
- Contract: `content/development/seis-trusted-marketplace-plugin.json`

The plugin validates public repository metadata and curated intake records. It
does not install integrations, authenticate to third parties, call providers,
read credentials, access the network, or write files.

## Capability lanes

The intake keeps source decisions organized across eight lanes:

- data engineering
- development
- design
- learning
- monitoring
- productivity
- security
- testing

## Activation boundary

Marketplace curation is not activation. Every external source remains blocked
until its target, authorization, scope, approval, and rollback path are
explicit. Local validation and public source visibility do not claim an active
connector, provider, deployment, or marketplace publication.

## Validation

```bash
npm run check:trusted-marketplace-intake
npm run check:seis-trusted-marketplace-plugin
npm run check:seis-core-trusted-marketplace
npm run check:seis-repo-marketplace
```

The prior standalone source directory is retained only as a non-active history
reference. The public SEIS Repo package above is the current implementation and
only distribution surface for this capability.
