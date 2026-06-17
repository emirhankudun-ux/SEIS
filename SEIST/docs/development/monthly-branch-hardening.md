# Monthly Branch Hardening

This month the safest sequence is repo first, plugin second.

The SEIS Trusted Marketplace plugin is already installed and connected, but it
should grow on top of a stronger `UIXAppTTR` branch foundation. That keeps the
plugin useful as a control surface instead of turning it into a detached tool
drawer.

## Active Rule

- Branch: `UIXAppTTR`
- Month: `2026-06`
- Mode: repo-first-plugin-second
- Data: `content/development/monthly-branch-hardening.json`
- Validator: `npm run check:monthly-branch-hardening`
- Quality path: `npm run quality` and `npm run automation:aggressive-dev`

## Workstream Order

1. Branch foundation
2. Capability contracts
3. Release and deploy readiness
4. Plugin integration
5. Public plugin readiness only after private workflow stability

## Why This Comes Before More Plugin Work

The plugin should explain and route SEIS work through repo contracts that are
already true. If the branch is unstable, the plugin can only describe ambition.
If the branch is validated, the plugin becomes a useful control panel for data
engineering, development, design, learning, monitoring, productivity, security,
and testing. In this plan, data engineering remains a repo-governed lane before
it becomes a plugin-driven workflow.

## Stop Conditions

Stop and report clearly when:

- unrelated dirty files cannot be isolated
- `UIXAppTTR` is behind `origin/UIXAppTTR`
- publish readiness is blocked
- live deploy target, auth, or rollback path is unclear
- plugin work would require broad connector activation without a concrete task
