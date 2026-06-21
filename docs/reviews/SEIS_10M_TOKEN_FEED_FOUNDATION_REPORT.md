# SEIS 10,000,000 Token Feed Foundation Report

Date: 2026-06-20
Status: Pre-commit recovery and foundation report
Branch: `seis/ai-core-app-foundation`
Pull request: #41, `docs: define SEIS AI Core and Command Center foundation`

## Repository Condition

The active work is in the clean AI Core foundation branch. The dirty main
checkout is not used for this slice because it contains unrelated pre-existing
deletions. The selected branch already carries the AI Core and Command Center
foundation work and is the correct place for this small follow-up.

This report covers a metadata-only 10,000,000 token feed budget. It does not
claim that tokens were ingested, spent, embedded, routed to a provider, written
to memory, or used for model training.

## Source Of Truth Files Found

| File or folder | Status | Role |
| --- | --- | --- |
| `AGENTS.md` | Found | Repository operating instructions |
| `README.md` | Found | Mission, architecture map, and quality gates |
| `SECURITY.md` | Found | Security and SSH/provider boundary rules |
| `CONTRIBUTING.md` | Found | Contribution and branch rules |
| `LICENSE` | Found | License record |
| `.gitignore` | Found | Ignore and hygiene rules |
| `.github/` | Found | GitHub workflows, templates, and ownership surface |
| `docs/` | Found | Architecture, AI, security, deployment, product, review, and testing records |

Root `ARCHITECTURE.md` and root `ROADMAP.md` are not present; architecture and
roadmap records are maintained under `docs/architecture/` and `roadmap/`.

## Pull Request Status

| PR | State | Result | Recommended action |
| --- | --- | --- | --- |
| #41 `docs: define SEIS AI Core and Command Center foundation` | Open | Useful and directly related | Continue as the target PR for this slice |
| #40 `docs: define specialist AI MCP SSH integration` | Open | Useful but separate | Keep separate; do not mix |
| #37 `ci: stabilize main governance and secret scans` | Open | Useful CI/security lane | Keep separate; do not mix |
| #33 `Codex/sync icloud seis 20260619` | Open | Broad sync lane, higher risk | Do not merge wholesale into this slice |
| #32 `Codex/publish local seis 20260618 163043` | Open | Broad publish lane | Keep separate until reviewed |
| #28 `Update from task 03e00d7b-7588-43dc-b46c-c02de97972b8` | Open | Cloud/SSH adjacent | Keep separate; needs security review |
| #27 `Main-first governance, language-boundary policy, and polyglot capability kernel` | Open | Broad governance lane | Recover only reviewed parts if needed |
| #24 `feat(seis): stabilize swift diagnostics and align language-governance artifacts` | Open | Platform lane | Keep separate |
| #23 `feat: portfolio as app + website - installable PWA + macOS demo` | Open | Product/UI lane | Keep separate |
| #22 `Harden SEIS cloud readiness guards` | Open | Security/cloud lane | Keep separate |
| #20 `Consolidate all open PRs...` | Open | Very broad consolidation | Treat as review input, not direct merge material |
| #19 `Codex/seis platform polyglot kernel` | Open | Duplicate of merged #18 risk | Review before any recovery |
| #16, #10, #9, #8, #7, #6, #5, #2, #1 | Open | Older evolution/publish variants | Likely duplicate or outdated; replace by clean targeted slices |
| #12 `feat: register all 179 installed Codex plugins...` | Open | Plugin inventory lane | Keep separate |
| #11 `Add CLAUDE.md...` | Open | Assistant governance lane | Keep separate |
| #3 `Add portfolio content and UI...` | Open | Portfolio lane | Keep separate |

Closed PRs visible in the current scan are merged, including #39, #38, #36,
#35, #34, #31, #29, #25, #21, #18, #17, and #4. Already merged work should not
be recovered again.

## Closed PR Rescue Plan

- Safe work to recover: none required for this token feed slice.
- Unsafe work to exclude: broad consolidation, cloud/SSH execution, generated
  archives, raw assistant archive material, and any secret-bearing state.
- Duplicates to ignore: older SEIS evolution PR variants already superseded by
  merged or current foundation work.
- PRs to leave closed: all merged PRs from the current closed scan.
- PRs to reopen: none from this slice.
- PRs to replace: older broad evolution/publish PR variants should be replaced
  by small clean PRs only if specific value remains.
- Unrecoverable PRs: none assessed as needed for this slice.

## Folder Classification Table

| Folder | Classification | Reason | Action |
| --- | --- | --- | --- |
| `packages/data/` | Core SEIS material | Knowledge, memory, source classification, and token feed budget contracts | Extend with fixture and validator |
| `packages/model-router/` | Core SEIS material | Provider-neutral route contracts | Add metadata-only feed route |
| `packages/shared-types/` | Core SEIS material | AI Core and Command Center shared contract | Add shared feed records |
| `apps/seis-core/` | Command Center surface | Browser-safe fixture projection | Add feed projection records |
| `docs/ai/` | Official documentation | AI Core, memory, and routing boundaries | Update source-linked docs |
| `docs/evals/` | Official documentation | Evaluation strategy | Add token feed fixture evaluation note |
| `docs/reviews/` | Review records | Recovery and foundation reports | Add this report |
| `roadmap/` | Official roadmap | Five-year AI Core and app program | Add follow-up token feed slice |
| `archive/` and `docs/archive/` | Historical material | Historical references only | Do not ingest raw content |
| `node_modules/` | Generated dependency folder | Local dependency cache | Exclude from commits |
| `SEIST/` | Nested legacy/root snapshot | Separate historical surface inside repo | Do not mix into this slice |

## Security Findings

Categories only:

- Provider-secret boundary must remain server-side or absent.
- Token feed budget must not claim executed ingestion.
- Raw content, secrets, private keys, provider keys, and restricted archive
  material must not be stored in the fixture.
- External provider calls, embeddings, persistent memory writes, and model
  training require separate approval and evidence.
- GitHub write, SSH execution, deployment, and merge actions remain out of
  scope.

## Duplicates And Outdated Material

Older broad PRs and archive-style assistant output are not used as official
direction. The clean path is to add a small, validator-backed token feed budget
contract to the current AI Core foundation branch.

## Files To Keep / Archive / Exclude / Merge Into Official Docs

| Category | Files |
| --- | --- |
| Keep | `packages/data/fixtures/seis-10m-token-feed-budget.json`, `packages/data/schemas/token-feed-budget.schema.json`, `scripts/check-token-feed-budget.mjs` |
| Merge into official docs | `docs/ai/context-memory-boundary.md`, `docs/ai/model-router.md`, `docs/evals/evaluation-strategy.md`, `docs/architecture/ai-core-app-shared-contracts.md`, `roadmap/seis-ai-core-command-center-5-year-development-program.md` |
| Exclude | `node_modules/`, generated dependency folders, secrets, private configs, raw archive dumps |
| Archive | None in this slice |

## Recommended Branch

Use the current branch: `seis/ai-core-app-foundation`.

## Recommended Commit Plan

One small commit is appropriate:

`feat: add SEIS token feed budget contract`

## Final Decision

- Safe to commit: yes, after targeted validation passes.
- Safe to open PR: yes, PR #41 already exists for this branch.
- Safe to merge: no. Merge still requires human review and branch protection.
