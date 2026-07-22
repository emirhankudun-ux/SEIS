---
name: seis-ai-agent
description: Use SEIS-Agent as the canonical public SEIS entry point, with bounded one-bundle-at-a-time guidance across all SEIS lanes.
---

# SEIS-Agent

Use this skill when the user wants the combined SEIS agent system rather than one
isolated lane. Keep development directly inside the SEIS repository.

SEIS-Agent is the primary operator for SEIS, SEIS-Cloud, SEIS-Code,
SEIS-Design, and SEIS-Data. Treat the specialist packages as repo-contained
source mirrors behind the unified agent.

## Canonical Context

- Canonical repository: `emirhankudun-ux/SEIS`
- Canonical branch: `main`
- Repo marketplace: `.agents/plugins/marketplace.json`
- Install id: `seis-ai-agent@seis-repo`
- Default install mode: `seis-ai-agent@seis-repo`, then at most one optional bounded bundle for a scoped task
- Public marketplace: 34 cards (one canonical SEIS-Agent card plus 33 optional bundles), never hundreds of direct source cards
- Public bundle guide: `assets/public-bundle-selection-guide.json`
- Local public bundle finder: `seis_public_bundle_find` accepts one short need statement and returns at most three candidates without installation or external access
- Optional terminal finder: `npm run install:seis-ai-agent -- --find <short-local-need>` returns at most three local candidates without installation
- Optional terminal plan: `npm run install:seis-ai-agent -- --journey <known-journey-id>`; it remains plan-only until a separately confirmed `--apply`
- Unified suite: `assets/unified-suite.json`
- Composed lanes: `seis`, `seis-governance`, `seis-cloud`, `seis-code`, `seis-design`, `seis-data`, `seis-security`, `seis-research`, `seis-automation`, `seis-product`
- App-owned source boundary: `plugins/seis-core` for `apps/seis-core` (75 retained public repository packages)
- App source inventory: `apps/seis-core/data/seis-core-plugin-sources.json`
- App source surface: `repo-source-app` (direct repo use; no direct source-package marketplace cards)
- Topic source boundary: `plugins/seis-topics` (300 retained public repository packages)
- Retained public source capability count: 380 (five root modules, 75 app packages, and 300 topic packages)
- Operating identity: `SEIS-Agent`
- Legacy personal marketplace: compatibility mirror only

## Unified Workflow

1. Inspect repo safety first: `git status --short`, `git branch --show-current`, and `git remote -v`.
2. If the task needs an optional public bundle but no journey ID is known, call `seis_public_bundle_find` with one short need statement, or use `npm run install:seis-ai-agent -- --find <short-local-need>` when only the terminal is available. Each returns at most three local deterministic candidates and does not install anything. Then call `seis_public_bundle_guide` or `seis_public_bundle_recommend`, or choose one terminal result, for one chosen journey; select no more than one matching initial bundle and never bulk-install its members. Use `npm run install:seis-ai-agent -- --journey <known-journey-id>` only to review the bounded plan; require explicit human approval before adding `--apply`.
3. Classify the request into the smallest useful lane:
   - SEIS for governance, repository consolidation, architecture, docs, migration safety, and GitHub readiness.
   - SEIS-Cloud for cloud deployment readiness, public cloud, team/workplace VPN cloud, server targets, preflight, secrets hygiene, and rollback.
   - SEIS-Code for implementation, refactors, tests, CI, MCP/plugin engineering, Apple-first packages, and repo automation.
   - SEIS-Design for product design, UI/UX, design systems, accessibility, calm motion, visual QA, and frontend experience planning.
   - SEIS-Data for data architecture, analytics, generated reports, knowledge registries, memory/RAG planning, provenance, and safe data handling.
4. Prefer existing repo scripts, manifests, generated records, and docs over new parallel structures.
5. Keep repository deletion, cloud apply/deploy commands, secret-bearing operations, and destructive plugin changes behind explicit confirmation.
6. Make the smallest durable repo change that improves architecture, maintainability, reliability, documentation, or developer experience.
7. Validate with scoped checks first; scale to `npm run quality` when the blast radius touches shared governance, generated reports, plugin contracts, or public repo readiness.
8. Report only actual tools, sources, validation, risks, and remaining gates.

## Consolidation Rules

- Use `seis-ai-agent@seis-repo` as the canonical install and user-facing plugin.
- Treat focused lane packages as embedded source modules, never as direct standalone public installs.
- Keep the public marketplace to one canonical card plus reviewed optional bundles of no more than 15 capabilities; use one optional bundle per scoped task.
- Use `seis_public_bundle_find`, `seis_public_bundle_guide`, or `seis_public_bundle_recommend` before expanding the selection surface; finder and guide responses are local read-only decision aids and may not install a package, use a network service, or change a repository.
- Never pass an arbitrary bundle ID to the terminal installer. It accepts exactly one known `--journey`, derives only its first validated optional bundle, and keeps the default target as SEIS-Agent alone.
- Do not remove, disable, replace, or rewrite the old `personal` SEIS plugin family without explicit human approval.
- Keep specialist source mirrors in `plugins/` so their skills, MCP servers, lane profiles, and validation contracts stay testable inside the repo.
- Keep the user's application plugins under `plugins/seis-core`; the Command Center owns their source, catalog, activation plans, and gradual release train.
- Keep `packages/seis-ai` limited to contracts, registry projections, permission policy, and read-only inspection; it must not become the source root for app plugins.
- For every new app plugin, regenerate the app source inventory/catalog and `assets/unified-suite.json` so direct-repo coverage is complete.
- If duplicate plugin cards are already installed, keep them preserved and route new work through the canonical SEIS-Agent suite.

## Validation

```bash
npm run check:seis-ai-agent
npm run check:seis-unified-plugin-suite
npm run check:seis-specialist-plugins
npm run check:seis-operating-identities
npm run quality
```
