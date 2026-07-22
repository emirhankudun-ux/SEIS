# SEIS Topic Plugins

The SEIS repository retains 300 objective-derived topic source packages and exposes them through 27 bounded optional cards in the `seis-repo` marketplace.

These packages are public, MIT-licensed, available to everyone, and implemented as local read-only demo lanes. The canonical SEIS-Agent remains the default orchestration install; each topic source maps to exactly one optional bundle and is not a separate card.

## Source of truth

- Objective taxonomy: `content/development/seis-topic-plugin-objective.json`
- Generator: `scripts/create-seis-topic-plugin-family.mjs`
- Marketplace: `.agents/plugins/marketplace.json`
- Runtime: `plugins/seis-topics/runtime/topic-plugin-runtime.mjs`

## Families

- Artificial Intelligence: 35 packages
- Software Engineering: 44 packages
- Cloud Computing: 25 packages
- Cybersecurity: 21 packages
- Data: 20 packages
- Design: 21 packages
- Creative Production: 17 packages
- Graphics: 13 packages
- Desktop: 11 packages
- Automation: 17 packages
- Knowledge: 25 packages
- Project Management: 17 packages
- SEIS: 13 packages
- PANTECHNOEPISTEMONOESIS: 6 packages
- ELENI-NEFERI: 15 packages

## Safety boundary

Topic packages do not grant provider, cloud, GitHub write, SSH, deployment, connector, secret, or destructive-action access. Their MCP servers report bounded local repository evidence only.

## Validate

```bash
npm run check:seis-topic-plugin-family
```
