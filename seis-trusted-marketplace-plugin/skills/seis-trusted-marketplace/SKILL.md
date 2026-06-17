---
name: seis-trusted-marketplace
description: Use when reviewing, curating, or preparing trusted plugins, MCP servers, GitHub Marketplace entries, Copilot customizations, or AI model channels for the SEIS ecosystem.
---

# SEIS Trusted Marketplace

Use this skill to help the user curate trusted marketplace sources without
requiring them to understand code.

This is a private personal plugin repository first, with public/publish-ready
documentation included for later release hardening.

## SEIS Repo Binding

This personal plugin is bound to the SEIS UIX-Apps branch contract:

- Plugin source repo: `https://github.com/emirhankudun-ux/seis-trusted-marketplace-plugin.git`
- Plugin local source: `/Users/emirhan/plugins/seis-trusted-marketplace`
- Local workspace: `/Users/emirhan/Library/Mobile Documents/com~apple~CloudDocs/Github/_SEIS_WORKSPACE/UIX-Apps-origin-clean`
- GitHub remote: `https://github.com/emirhankudun-ux/UIX-Apps.git`
- Branch: `UIXAppTTR`
- Connection asset: `assets/seis-repo-connection.json`
- Capability map: `assets/capability-map.json`
- Repo bridge contract: `content/development/seis-trusted-marketplace-plugin.json`

Before changing marketplace behavior, confirm the repo path and branch, preserve
unrelated dirty files, and report local progress, GitHub publication, and
blockers separately.

Preferred local checks for this bridge are:

```bash
npm run validate
npm run check:workspace
npm run check:trusted-marketplace-intake
npm run check:seis-trusted-marketplace-plugin
npm run check:aggressive-capability-map
npm run check:connector-activation-report
npm run automation:publish-readiness
```

## Capability Lanes

Choose one lane before activating live tools. If the user asks for many things
at once, convert the request into a small governed lane plan instead of calling
every connector.

### Data Engineering

Use for databases, warehouses, spreadsheets, schemas, ETL, data quality, and
analytics source readiness. Prefer read-only sampling, explicit target datasets,
and credentials stored outside the repo.

### Development

Use for repo, branch, script, feature, automation, and refactor work. Confirm
`UIXAppTTR`, preserve unrelated dirty files, and keep each change bounded and
reversible.

### Design

Use for Figma, visual systems, brand, layout, responsive behavior,
accessibility, and motion. Preserve SEIS cinematic minimalism, premium
typography, calm interaction, and accessibility-first UX.

### Learning

Use when the user needs decisions explained in non-coder language. Separate
local plugin state, GitHub branch state, and live deployment state clearly.

### Monitoring

Use for readiness snapshots, logs, health, release blockers, and status checks.
Prefer read-only checks with a clear time window and no sensitive data exposure.

### Productivity

Use for repetitive workflow reduction, summaries, task routing, and reusable
commands. Keep automation reversible and keep a manual fallback visible.

### Security

Use for publisher trust, permissions, secrets, dependency risk, and supply-chain
posture. Keep live activation gated by minimum permissions and rollback paths.

### Testing

Use for validation, CI, plugin packaging, branch contracts, and installation
smoke tests. Prefer `npm run validate` before heavier checks.

## Operating Model

Treat marketplace work as curation before activation:

1. Identify the source channel: Codex plugin, MCP Registry, GitHub Marketplace
   Action, GitHub Marketplace App, GitHub Models, or Copilot customization.
2. Check trust posture: official or verified publisher, clear documentation,
   active maintenance, minimal permissions, and a rollback/removal path.
3. Explain the value in designer-friendly language.
4. Match the source to one capability lane and its activation gates.
5. Keep live installs, writes, deploys, and credentials blocked until the target,
   auth, approval, and rollback owner are explicit.
6. Prefer MCP for new AI tool integrations when the choice is available.

## SEIS Defaults

- Preferred channel: GitHub MCP Registry or local Codex plugin packaging.
- Use GitHub Marketplace Actions only for small reusable repository automation.
- Use GitHub Marketplace Apps only after there is a real app surface, support
  model, and permission review.
- Treat GitHub Models as a reference catalog for model selection, not a SEIS
  listing target.
- Do not build new GitHub App-based Copilot Extensions; route those ideas
  through MCP or plugin packaging.

## User-Facing Style

The user is a graphic designer, so explain decisions as cards, channels,
trust signals, and launch readiness. Avoid assuming coding knowledge.

When a workflow is blocked, say exactly whether the blocker is local plugin
readiness, UIXAppTTR GitHub publication, or live external activation.
