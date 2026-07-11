---
name: seis-second-brain
description: Use the SEIS Second Brain for browser-local knowledge orchestration across installed AI profiles, managed sub-agent lanes, the SEIS plugin readiness matrix, and the approval-gated Obsidian bridge.
---

# SEIS Second Brain

Use this skill when the task needs to connect SEIS knowledge, installed AI
profiles, sub-agent context, plugin skills, browser-local VFS artifacts, or
Obsidian readiness without turning local review context into unapproved
external execution.

## Canonical Context

- Runtime entry: `apps/web/desktop.html`
- Product contract: `content/development/seis-second-brain-system.json`
- Product guide: `docs/product/seis-second-brain.md`
- Agent registry artifact: `reports/seis-public-demo/second-brain-agent-registry-latest.json`
- Browser evidence: `reports/seis-public-demo/second-brain-browser-smoke-evidence-latest.json`
- Local VFS root: `/home/seis/SecondBrain/`
- MCP context resource: `seis://brain/second-brain-system.json`

## Operating Model

1. Inspect the active Second Brain contract, product guide, and current
   worktree before changing behavior.
2. Classify the request as browser-local context, repo-local evidence, planned
   Obsidian import, provider-neutral planning, or approval-gated external work.
3. Keep installed AI profiles and the 13-agent roster as review context unless
   a verified backend capability and explicit approval exist.
4. Route implementation, cloud, design, data, governance, security, research,
   automation, and product work through the matching managed lane.
5. Write only browser-local or repo-local artifacts unless the user explicitly
   approves a specific external action.
6. Validate the changed surface and report what is real, local-demo, planned,
   blocked, or unverified.

## Plugin And Agent Context

The local readiness matrix binds these personal plugin lanes to status/plan
review context:

- `@seis`: governance, architecture, roadmap, and source-of-truth memory
- `@seis-cloud`: cloud readiness, SSH boundaries, rollback, and deployment gates
- `@seis-code`: implementation, validation, MCP/plugin engineering, and QA
- `@seis-design`: product feel, UI/UX evidence, accessibility, and visual QA
- `@seis-data`: knowledge schemas, provenance, memory/RAG planning, and reports

Use the browser-local all-lane review bundle at
`/home/seis/SecondBrain/07-learning/plugin-review-bundle-latest.md` when a
single review packet is useful. It contains no credentials and performs no
plugin, MCP, provider, SSH, deployment, GitHub, or autonomous action.

## Obsidian Boundary

- Treat private vault import as planned and approval-gated.
- Never scan a host home directory or infer an Obsidian vault path.
- Require explicit user selection before any future source intake.
- Keep browser-local dry runs metadata-only by default.
- Do not commit private note bodies, source paths, attachments, secrets, or
  `.obsidian` configuration to the repository.
- Record provenance and human approval before any publication or external sync.

## External-Action Boundary

Do not install plugins, call providers, validate credentials, execute SSH,
deploy, mutate GitHub, publish, or run autonomous writes from this skill unless
the user gives clear approval for the specific target and rollback owner.

## Validation

Use the narrowest relevant checks after a Second Brain change:

```bash
npm run check:seis-second-brain
npm run check:seis-second-brain-browser-smoke
npm run check:seis-second-brain-browser-smoke-evidence
npm run check:seis-second-brain-readiness-contracts
npm run check:seis-public-demo-go-no-go -- --run-fast-checks
git diff --check
```

Report any remaining human approval gates instead of claiming live AI,
Obsidian, GitHub, SSH, deployment, or agent autonomy is ready.
