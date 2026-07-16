# Workspace Routing

Date: 2026-07-14
Goal: `OPS-GOAL-0002`

This policy routes SEIS work by verified repository identity and worktree
health. A familiar folder name is not proof that a directory is a Git checkout,
and no permanent local folder is the SEIS source of truth.

## Canonical Identity

- Canonical repository identity: `emirhankudun-ux/SEIS`
- Protected default branch: `main`
- Local execution unit: a clean, task-scoped worktree on a review branch
- Immutable historical evidence: `data/seis-local-workspace-registry.json`
- Schema: `data/seis-local-workspace-registry.schema.json`

The repository identity is canonical. Local paths are observations that can
become stale, dirty, detached, broken, or non-Git. The committed registry has
no current routing authority.

## Historical Snapshot Decision

The 2026-07-14 bounded snapshot records these safety facts:

| Registry record | Observed role | Write posture |
| --- | --- | --- |
| `direct-seis-intake` | Non-Git intake tree; it does not establish repository identity. | Read-only; never use as a commit or shipment surface. |
| `shared-seis-common-root` | Git common root for `emirhankudun-ux/SEIS`; recovery-critical because it has 158 modified, 865 deleted, and 93 untracked entries (1,116 total). | Read-only until a separately approved recovery plan reconciles its user-owned state. |
| `ops2-task-worktree` | Task-scoped worktree whose aggregate status was zero at the Goal-start boundary, but whose Gitlink state was not observed. | Unverified and blocked; the historical snapshot grants no write authority and does not make the folder canonical. |
| `workspace-metadata` | Incomplete Git metadata; not a valid checkout. | Blocked; do not initialize or repair in place during normal routing. |

These opaque record IDs are stable public references; path resolution remains
local-only. The counts are aggregate evidence only. The registry intentionally
excludes local paths, dirty filenames, file contents, Git configuration,
credential-bearing URLs, external symlink targets, and personal media metadata.
Live state may legitimately produce zero eligible routes.

## Operating Rule

Before editing, verify that the selected surface:

1. is a valid Git worktree;
2. resolves to `emirhankudun-ux/SEIS` through a public-safe remote identity;
3. is clean before task-owned changes begin;
4. uses a scoped non-default branch;
5. belongs to the current Goal and affected-path boundary; and
6. is not classified as read-only, recovery-critical, broken, or non-Git.

Any gitlink or submodule presence is treated as unverified and blocks writes.

If any condition is false or unknown, stop the write path and continue only
with public-safe, read-only inspection. Never infer writability from a path
name, an old document, or a `.git` marker alone.

## Discovery Boundary

The local discovery command is intentionally read-only. It creates a
timestamped `seis-local-workspace-live-observation-<UTC>` dataset ID, validates
the complete observation semantically, and only then prints the redacted JSON
to stdout. It may return zero eligible routes. It must not modify the frozen
snapshot, worktree metadata, branches, files, remotes, or GitHub state.

The implementation commits only generic relative candidate locators as bounded
topology. Personal or absolute paths, resolved paths, and symlink targets are
never persisted or emitted. Discovery code does not directly open application
or user content. Git may internally read contained working-tree content and
status names while computing aggregate status. External-command and
include-capable local Git configuration is rejected before status inspection;
names, content, raw configuration, and raw Git values are not retained,
persisted, or emitted.

```bash
npm run inspect:seis-local-workspaces
npm run check:seis-local-workspace-registry
npm run test:seis-local-workspace-registry
```

The JSON Schema is the shared structural and semantic-shape contract. The
generic observation validator enforces cross-field and routing relationships;
the frozen checker adds snapshot-specific candidate, count, digest,
documentation, and CI assertions. Static CI validates only these committed
artifacts and adversarial fixtures. It does not enumerate a contributor's
machine or treat live local discovery as reproducible CI evidence.

## Human Approval Needed

Explicit approval and a rollback plan are required before:

- repairing, pruning, moving, or retiring worktree metadata;
- staging, restoring, copying, or deleting recovery-critical local changes;
- initializing Git in a non-Git intake tree or the incomplete workspace root;
- archiving or deleting a SEIS-like folder;
- changing remotes, branch protection, credentials, or repository settings; or
- pushing, merging, closing, reopening, or otherwise mutating GitHub state.

## Shipment Claim Contract

A remote shipment claim requires current evidence for the exact task-scoped
worktree, review branch, upstream, commit, hosted checks, and GitHub object. A
valid local folder or clean check alone is not shipment evidence. The 2026-07-14
workspace snapshot performs no shipment and grants no mutation authority.
