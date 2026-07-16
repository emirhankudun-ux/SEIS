# iCloud GitHub Workspace Ingestion

Date: 2026-07-14
Goal: `OPS-GOAL-0002`

This document defines a public-safe, non-destructive intake boundary for the
multi-project workspace. It does not authorize a bulk merge, workspace repair,
or import of user-owned local changes.

## Repository Identity And Local State

The canonical SEIS repository identity is `emirhankudun-ux/SEIS`. No local
folder is permanently canonical. A local surface may be used only after its
repository identity, worktree health, branch, cleanliness, and Goal scope are
verified.

The 2026-07-14 redacted snapshot establishes that:

- `direct-seis-intake` is a non-Git intake tree and remains read-only;
- `shared-seis-common-root` is the SEIS Git common root, but it is
  recovery-critical and
  read-only with aggregate status counts of 158 modified, 865 deleted, and 93
  untracked entries (1,116 total);
- `workspace-metadata` represents incomplete Git metadata and is not a valid
  checkout;
- `ops2-task-worktree` had zero aggregate changes at the Goal-start boundary,
  but Gitlink state was not observed, so the final contract classifies the
  historical record as unverified, blocked, and non-writable; and
- local worktree paths are routing evidence, not new sources of truth.

These are opaque public record IDs; local path resolution is never persisted.
The immutable, public-safe record is
`data/seis-local-workspace-registry.json`. It is bounded to reviewed candidates
and is not a complete inventory of the user's device. It has no current routing
authority, and a new live observation may validly report zero eligible routes.

## Merge Principle

Merge intent before files.

Governance, architecture, and routing decisions should become traceable
repository records. Code, product surfaces, and assets may be promoted only
after a focused review proves ownership, provenance, public safety, and fit
with a tracked Goal.

## Intake Categories

| Category | Treatment |
| --- | --- |
| Governance instructions | Translate public-safe intent into scoped docs, Goals, ADRs, and validation. |
| Active SEIS code | Review from a verified task worktree and land through a focused branch and PR. |
| Non-Git intake trees | Keep read-only; do not treat folder shape as repository evidence. |
| Dirty common roots | Preserve as recovery-critical; record aggregate counts only and require a recovery plan. |
| Other Git repositories | Keep separate unless canonical ownership and an integration Goal explicitly include them. |
| Archives and backups | Do not bulk import; inspect only after provenance and rollback are approved. |
| Personal or licensed media | Block by default; promote only selected public-safe assets through provenance review. |
| Generated assistant output | Treat as untrusted intake until content, license, and correctness are reviewed. |
| Broken or incomplete Git metadata | Do not repair, prune, or initialize during ordinary intake. |

## Privacy Boundary

Committed workspace evidence may contain only opaque identifiers, public
repository identity, redacted Git state, aggregate dirty counts, and review-safe
actions. Generic relative candidate locators may be committed only as bounded
implementation topology; neither those locators nor their resolved values are
emitted in an observation. Evidence must not contain:

- local, absolute, home, or cloud-storage paths;
- dirty filenames, untracked filenames, or file contents;
- Git configuration or credential-bearing remote URLs;
- secret values, private keys, tokens, or environment contents;
- external symlink targets; or
- personal-media names, metadata, or contents.

## Read-Only Discovery

Local discovery produces a timestamped redacted observation for comparison with
the frozen registry. It validates the observation's semantics before stdout,
may report zero eligible routes, and does not rewrite the committed snapshot.

Discovery code does not directly open application or user content. Git may
internally read contained working-tree content and status names while computing
aggregate status. External-command and include-capable local Git configuration
is rejected before status inspection; personal paths, names, content,
credentials, raw configuration, and raw Git values are not retained, persisted,
or emitted. Any Gitlink or submodule presence is unverified and blocks writes.

```bash
npm run inspect:seis-local-workspaces
npm run check:seis-local-workspace-registry
npm run test:seis-local-workspace-registry
```

The JSON Schema is the shared structural and semantic-shape contract. The
generic validator enforces cross-field and routing relationships, while the
frozen checker adds snapshot-specific candidate, count, digest, documentation,
and CI assertions. CI validates committed artifacts only. Because hosted
runners cannot reproduce the contributor's local workspace, CI must not claim
that the current machine topology was rediscovered or repaired.

## Safety Rules

- Select work by Goal and canonical repository identity, not by folder name.
- Start writes only in a clean, task-scoped worktree on a review branch.
- Accept zero eligible live routes and block every gitlink-bearing or otherwise
  submodule-unverified candidate.
- Preserve unrelated dirty state and never stage it as part of intake.
- Avoid nested-repository, symlink, archive, cache, binary, and generated-file
  expansion unless the Goal explicitly requires it.
- Keep branch protection and the protected default branch intact.
- Record validation, skipped checks, risk, and rollback before GitHub delivery.

## Human Approval Needed

Approval is required before any local recovery action, worktree metadata
repair or pruning, folder move or deletion, recovery-critical state transfer,
repository initialization, remote or credential change, GitHub mutation, SSH
execution, deployment, or secret rotation.

## Current Decision

`OPS-GOAL-0002` records and validates the workspace truth without modifying the
recovery-critical common root, non-Git intake tree, incomplete root metadata,
or stale worktree records. Physical consolidation remains explicitly deferred.
