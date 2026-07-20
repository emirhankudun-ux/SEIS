# SEIS Trusted Marketplace Intake

This is the designer-friendly intake layer for turning trusted GitHub, MCP,
Copilot, model, and partner surfaces into a governed SEIS marketplace.

It does not install tools, publish paid listings, or write to external services.
It creates a calm review surface first: what the source is, why it is useful,
how trustworthy it appears, and what must be true before engineering activates
it live.

## Why This Exists

SEIS can benefit from trusted weekly or monthly ecosystem updates without
turning the workspace into a noisy extension drawer. The marketplace intake
keeps discovery separate from activation:

1. Curate the source as a marketplace card.
2. Check trust, publisher, purpose, and visual/product fit.
3. Match it to an existing SEIS capability family.
4. Run the local quality command.
5. Activate live only after target, auth, approval, and rollback are clear.

## Current Channels

- GitHub MCP Registry: preferred channel for AI tool integrations and official
  service connectors.
- GitHub Marketplace Actions: good for small reusable repository automation.
- GitHub Marketplace Apps: candidate only after real productization, support,
  permissions, and publisher requirements are understood.
- GitHub Models: useful as a model/provider reference catalog, not a SEIS
  listing target.
- Awesome GitHub Copilot: useful for packaging reusable agents, instructions,
  skills, hooks, and workflow prompts.
- GitHub App-based Copilot Extensions: do not build new SEIS work here; GitHub
  has moved the server-side path toward MCP.

## Designer Workflow

You do not need to code to curate this layer.

- Pick the card or source family that looks valuable.
- Decide whether it fits the SEIS visual/product direction.
- Mark the intended family: design, hosting, repository quality, docs, AI, or
  commerce.
- Keep live installs blocked until there is a concrete target and rollback
  path.
- Ask automation to run `npm run check:trusted-marketplace-intake`.

## Engineering Contract

- Data: `content/development/trusted-marketplace-intake.json`
- Validator: `npm run check:trusted-marketplace-intake`
- Public SEIS Repo plugin: `seis-trusted-marketplace@seis-repo`
- Public source: `plugins/seis-core/seis-trusted-marketplace`
- Related catalog: `content/development/plugin-capability-catalog.json`
- Related activation doc: `docs/development/aggressive-capability-activation.md`

## Publication Path

The safe path is staged:

1. Local marketplace view.
2. Plugin-ready SEIS package.
3. MCP-ready integration.
4. Public GitHub Marketplace Action or App only when there is a separate public
   repository or a real GitHub App surface.

This keeps marketplace growth visible and ambitious while protecting the repo
from credential leaks, unclear permissions, and premature publishing.
