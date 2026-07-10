# SEIS Governance Foundation Audit

Date: 2026-07-10
Goal: `SEIS-GOAL-003` (requested milestone label: `SEIS-GOAL-001`)
Branch: `architecture/seis-governance-v1`

## Repository Health

The owner checkout contains unrelated in-progress changes. This goal therefore
uses an isolated worktree at the same starting commit so the PR can contain
only intentional governance files. Existing Node tests, goal records, public
policies, ownership, issue/PR templates, branch guidance, and CI are retained.

## Duplicate and Contradictory Content

| Finding                                                                                          | Risk                                                                 | Resolution                                                                                                                                   |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Enterprise v4.0 is intentionally comprehensive while focused governance also lives under `docs/` | Competing authority and drift                                        | Preserve Enterprise v4.0 as highest authority; focused documents expand operations and may not supersede it                                  |
| The earlier execution objective requested a compact root constitution                            | Direct conflict with the owner's newer full-constitution instruction | Apply the newer owner instruction and record the exception rather than silently shrinking the constitution                                   |
| Root and `docs/` architecture/roadmap files could compete                                        | Two apparent sources of truth                                        | Root files are compatibility pointers to canonical `docs/` files                                                                             |
| Named canonical documents did not all exist                                                      | Broken navigation and incomplete ownership                           | Add all 15 focused entry documents and validator coverage                                                                                    |
| Historical registry already uses `SEIS-GOAL-001` for AI Core                                     | Goal identity collision                                              | Use namespaced execution id `SEIS-EXEC-001`, map to canonical Goal Tracking OS id `SEIS-GOAL-003`, and retain the requested label separately |
| Existing checks froze old root-document and PR-template wording                                  | Governance changes could break adjacent validation                   | Update check ownership to canonical documents and evidence-based PR headings                                                                 |

## Public and Security Risks

Canonical docs must exclude machine paths, credentials, private hosts, private
memory, and unlicensed archive content. MCP, AI, SSH, deploy, package-runner,
and external writes remain approval-gated. Supplied Kimi/Stitch archives remain
immutable external references and are not copied into this PR.

## Immediate Blockers

No local implementation blocker is known. Merge still requires owner review and
actual GitHub checks. Unrelated owner-checkout changes remain outside this goal.

## First Safe PR Scope

Include Enterprise v4.0, canonical governance entry points, root compatibility
pointers, execution schema/record, validator, docs index, contribution/PR/branch
guidance, CI wiring, MIT package-license metadata, and narrowly updated governance
checks.

Exclude app/web/Swift/provider/runtime code, MCP activation, SSH/deploy actions,
dependency graph changes, generated UI, raw archives/assets, and unrelated
formatting.

## Validation and Rollback

Run the commands in the focused execution record. Roll back with one focused
revert commit; this documentation and validation slice has no data migration or live
runtime effect.
