# SEIS Roadmap

This is the canonical roadmap entry point for SEIS. It keeps the five-year
direction visible while making the current work small, evidence-backed, and
reversible.

## Status Vocabulary

Use `planned`, `in-progress`, `review`, `stable`, `research`, `blocked`,
`deprecated`, or `removed`. A research or prototype item is never presented as
production capability.

## Execution Order

| Stage | Focus                                                  | Exit evidence                                                                           |
| ----- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 0     | Repository stabilization and public/private boundaries | Worktree audit, secret/public-readiness checks, and rollback notes                      |
| 1     | Governance foundation                                  | Canonical docs, structured goal records, and a passing governance validator             |
| 2     | Security and repository hygiene                        | Secret, dependency, license, generated-file, and link checks                            |
| 3     | Registry foundation                                    | MCP, agent, tool, skill, provider, model, prompt, and task records with status and risk |
| 4     | AI Core foundation                                     | Explainable routing, demo/live separation, evaluation, and approval gates               |
| 5     | Apple-native foundation                                | Reusable Swift models, tokens, tests, and macOS Command Center boundaries               |
| 6     | Product and design system                              | Information architecture, icon language, accessibility, motion, and platform adaptation |
| 7     | DevOps and release engineering                         | CI, release checks, observability, and rollback evidence                                |

## Current Milestone

The requested `SEIS-GOAL-001` milestone is represented by
`content/development/seis-governance-foundation-execution.json` under canonical
Goal Tracking OS id `SEIS-GOAL-003`. The requested id is retained only as
compatibility metadata because the historical registry already assigns
`SEIS-GOAL-001` to AI Core.

Current scope:

- preserve the owner-provided Enterprise v4.0 constitution and link focused
  canonical governance documents;
- expose one source of truth for architecture, roadmap, MCP, agents, and
  public/private boundaries;
- validate the documentation and execution record without adding dependencies;
- preserve the existing web demo, Swift package, user changes, and archive
  immutability rules.

The current PR queue and detailed backlog remain in
`docs/roadmap/NEXT_PR_QUEUE.md` and `docs/roadmap/MASTER_BACKLOG.md`.

## Five-Year Direction

1. Establish a safe, readable public engineering foundation.
2. Grow the Apple-first Swift package and macOS Command Center architecture.
3. Add provider-neutral AI Core, model routing, and supervised agent workflows.
4. Expand SEIS Brain, MCP/tool governance, and local-first knowledge surfaces.
5. Extend to iPadOS, iOS, and research-only visionOS surfaces after shared
   contracts and validation are healthy.

## Roadmap Rules

- Every milestone has a measurable exit check and a rollback path.
- The web layer remains a no-key public showcase; it is not the long-term
  architectural center.
- Live AI, SSH, deploy, remote mutation, and write-capable MCP operations stay
  approval-gated and evidence-bound.
- Supplied archives remain immutable inputs; manifests and provenance records
  are used until current content is available and reviewed.
- A dirty worktree is reported as dirty, never described as release-ready.
