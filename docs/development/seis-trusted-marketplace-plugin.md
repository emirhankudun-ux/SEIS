# SEIS Trusted Marketplace Plugin

SEIS Trusted Marketplace is a public, app-owned retained source capability for
reviewing curated GitHub, MCP, model, and marketplace sources before any
external action is approved. It has no direct marketplace card or standalone
install; SEIS Repo discovery resolves through the optional
`seis-application-bundle-06@seis-repo` card.

## Public source boundary

- Source capability: `seis-trusted-marketplace`
- Marketplace: `SEIS Repo` (`seis-repo`)
- Source: `plugins/seis-core/seis-trusted-marketplace`
- Marketplace card: `false`
- Marketplace presentation: retained source through bundle card
- Distribution bundle: `seis-application-bundle-06@seis-repo`
- Audience: everyone
- Repository owner: `SEIS`
- Contract: `content/development/seis-trusted-marketplace-plugin.json`

The plugin validates public repository metadata and curated intake records. It
does not install integrations, authenticate to third parties, call providers,
read credentials, access the network, or write files.

The current marketplace contains 34 cards: 1 canonical SEIS-Agent card and 33
optional bundles (6 application and 27 topic). Those cards cover 380 retained
repository sources (5 root, 75 application, and 300 topic); none of those
source capabilities is restored as a direct card. Installing a bundle also
does not claim that every retained member source is automatically installed.

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
reference. The public repository source above is the current implementation;
application bundle 06 is its only current marketplace discovery surface.
