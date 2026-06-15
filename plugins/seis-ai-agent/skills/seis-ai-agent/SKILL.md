---
name: seis-ai-agent
description: Use SEIS-Agent as the combined SEIS orchestration layer across SEIS, SEIS-Cloud, SEIS-Code, SEIS-Design, and SEIS-Data.
---

# SEIS-Agent

Use this skill when the user wants the combined SEIS agent system rather than one
isolated lane. Keep development directly inside the SEIS repository.

SEIS-Agent is the primary operator for SEIS, SEIS-Cloud, SEIS-Code,
SEIS-Design, and SEIS-Data. Treat the specialist plugins as repo-contained lanes
behind the unified agent unless the user explicitly asks to install or debug a
standalone lane card.

## Canonical Context

- Canonical repository: `emirhankudun-ux/SEIS`
- Canonical branch: `main`
- Repo marketplace: `.agents/plugins/marketplace.json`
- Install id: `seis-ai-agent@seis-repo`
- Default install mode: one visible SEIS-Agent plugin
- Composed plugins: `seis`, `seis-cloud`, `seis-code`, `seis-design`, `seis-data`
- Operating identity: `SEIS-Agent`
- Optional standalone lane install: `npm run install:seis-ai-agent -- --with-lanes`
- Legacy personal marketplace: compatibility mirror only

## Unified Workflow

1. Inspect repo safety first: `git status --short`, `git branch --show-current`, and `git remote -v`.
2. Classify the request into the smallest useful lane:
   - SEIS for governance, repository consolidation, architecture, docs, migration safety, and GitHub readiness.
   - SEIS-Cloud for cloud deployment readiness, public cloud, team/workplace VPN cloud, server targets, preflight, secrets hygiene, and rollback.
   - SEIS-Code for implementation, refactors, tests, CI, MCP/plugin engineering, Apple-first packages, and repo automation.
   - SEIS-Design for product design, UI/UX, design systems, accessibility, calm motion, visual QA, and frontend experience planning.
   - SEIS-Data for data architecture, analytics, generated reports, knowledge registries, memory/RAG planning, provenance, and safe data handling.
3. Prefer existing repo scripts, manifests, generated records, and docs over new parallel structures.
4. Keep repository deletion, cloud apply/deploy commands, secret-bearing operations, and destructive plugin changes behind explicit confirmation.
5. Make the smallest durable repo change that improves architecture, maintainability, reliability, documentation, or developer experience.
6. Validate with scoped checks first; scale to `npm run quality` when the blast radius touches shared governance, generated reports, plugin contracts, or public repo readiness.
7. Report only actual tools, sources, validation, risks, and remaining gates.

## Consolidation Rules

- Use `seis-ai-agent@seis-repo` as the canonical install and user-facing plugin.
- Do not install the old `personal` SEIS plugin family unless maintaining a legacy mirror.
- Do not install standalone `seis`, `seis-cloud`, `seis-code`, `seis-design`, or `seis-data` cards by default; use `--with-lanes` only for focused plugin debugging or marketplace QA.
- Keep specialist source packages in `plugins/` so their skills, MCP servers, lane profiles, and validation contracts stay testable inside the repo.
- If duplicate plugin cards are already installed, prefer removing the legacy `personal` duplicates first and keeping SEIS-Agent as the active surface.

## Validation

```bash
npm run check:seis-ai-agent
npm run check:seis-specialist-plugins
npm run check:seis-operating-identities
npm run quality
```
