# SEIS Public Readiness

## Purpose

Describe what must be true before SEIS can be presented as a GitHub-ready public
contributor product.

## Definition of public readiness

- No secret leakage in docs, scripts, or checked-in artifacts.
- Core demo works in no-key mode.
- Required onboarding and safety docs are present.
- Breakers are explicitly documented.

## Clone and run expectations

1. Clone repository
2. Start local web route from `apps/web`
3. Open documented demo entry routes
4. Verify route/asset checks

## No-key demo requirement

Core SEIS experience should run with `Local Demo` mode and without external API
keys.

## Documentation checklist

- `README.md`
- `AGENTS.md`
- `SEIS_SECOND_BRAIN.md`
- `SEIS_OBSIDIAN_VAULT.md`
- `SEIS_INSTALLED_AI_TOOLS.md`
- `SEIS_SUB_AGENTS.md`
- `SEIS_SSH.md`

## Demo checklist

- Desktop / app routes open
- Search / Code / Design / Cloud / Store surfaces visible where documented
- Demo states labeled `demo/mock/planned/real/disabled`

## Security checklist

- Secrets scan (`KEY`, `TOKEN`, `PRIVATE`, PEM-like markers) before release.
- No real credentials in vault or public docs.

## Obsidian brain checklist

- `seis-brain/README.md` exists
- index notes present
- public/private boundary documented
- context packs exist

## Local AI checklist

- local AI optional documentation exists
- provider claims are explicit and verified

## SSH checklist

- `SEIS-SSH` docs describe approvals, rollout gates, and rollback.
- real credentials omitted from public docs

## GitHub contribution checklist

- governance docs aligned
- issue and PR flow documented
- merge and branch safety respected

## Known blockers

- Missing app/script evidence blocks claiming GO state.
- Any unresolved CI check or proof gap must stay in `docs/roadmap/NEXT_PR_QUEUE.md`.

## Next actions

- Resolve blockers, rerun checks, update evidence.
- Keep the next safe PR queue explicit and current.
