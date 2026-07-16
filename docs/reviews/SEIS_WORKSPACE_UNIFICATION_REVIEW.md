# SEIS Local Workspace Truth And Recovery Review

Date: 2026-07-14
Goal: `OPS-GOAL-0002`
Status: Review

## Purpose

This review replaces the earlier single-writable-folder claim with an
evidence-bound routing model. The canonical identity is the GitHub repository
slug `emirhankudun-ux/SEIS`; no permanent local folder is canonical.

This Goal records an immutable redacted historical snapshot and a
non-destructive recovery plan. The snapshot grants no current routing
authority. This Goal does not move, copy, restore, stage, delete, initialize,
prune, repair, push, merge, deploy, or rewrite anything.

## Snapshot Metadata

<!-- BEGIN OPS-GOAL-0002 REGISTRY METADATA -->
Goal: `OPS-GOAL-0002`
Dataset: `data/seis-local-workspace-registry.json`
Dataset ID: `seis-local-workspace-registry-2026-07-14`
Record count: `4 records`
Registry digest: `sha256:5ad26241ec18c6f5ca122637b1b7989123ef1f854c52c7f1cfb61daa8bca6bcf`
Captured at: `2026-07-14T07:24:28Z`
Canonical repository: `emirhankudun-ux/SEIS`
Write-eligible at observation: `0`
Dirty aggregate: `158 modified / 865 deleted / 93 untracked / 1116 total`
<!-- END OPS-GOAL-0002 REGISTRY METADATA -->

## Scope And Method

The bounded discovery used read-only filesystem and Git metadata inspection to
classify:

- the shared SEIS Git common root;
- the direct non-Git SEIS intake tree;
- incomplete Git metadata at the workspace root; and
- the task-scoped worktree for this Goal, whose historical Gitlink state was
  not observed.

It stores opaque record IDs rather than local paths. Generic relative candidate
locators are committed only as bounded implementation topology; personal,
absolute, and resolved paths are never persisted or emitted. Discovery code
does not directly open application or user content. Git may internally read
contained working-tree content and status names while computing aggregate
status. External-command and include-capable local Git configuration is
rejected before status inspection; names, content, raw configuration, and raw
Git values are not retained, persisted, or emitted.

## Registry Classification

<!-- BEGIN OPS-GOAL-0002 WORKSPACE TABLE -->
| Opaque ID | Kind | Git state | Worktree state | Routing | Repository | Aggregate changes | Human approval |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| direct-seis-intake | non-git-intake | not-repository | not-applicable | read-only | none | n/a | yes |
| ops2-task-worktree | task-worktree | valid | unverified | blocked | emirhankudun-ux/SEIS | 0 | yes |
| shared-seis-common-root | git-common-root | valid | dirty | recovery-read-only | emirhankudun-ux/SEIS | 1116 | yes |
| workspace-metadata | workspace-root-metadata | incomplete-metadata | not-applicable | blocked | none | n/a | yes |
<!-- END OPS-GOAL-0002 WORKSPACE TABLE -->

## Findings

### Canonical identity

`emirhankudun-ux/SEIS` is the single canonical repository identity. The
previous assertion that a folder named `SEIS/` was the canonical writable root
was disproven by current inspection: that observed surface is non-Git. The
correction does not promote another local folder into permanent authority.

### Recovery-critical common root

`shared-seis-common-root` resolves locally to the Git common root for the
canonical repository. Its aggregate status is 158 modified, 865 deleted, and
93 untracked entries, for 1,116 total. It is therefore recovery-critical and
read-only. This Goal records no dirty filename or content and makes no judgment
about which local changes should be retained.

### Non-Git intake

`direct-seis-intake` contains SEIS-shaped material but is not a Git checkout.
It is read-only intake, cannot establish repository identity, and cannot be
used for commits or shipment claims.

### Incomplete metadata

`workspace-metadata` represents incomplete Git metadata at the shared
workspace root. It is not a valid checkout. Initialization or repair could
hide or overwrite recovery evidence, so the surface remains blocked.

### Task-scoped execution

`ops2-task-worktree` had zero aggregate changes at the Goal-start boundary, but
the historical capture did not include the later-required Git index-mode scan.
The final contract therefore freezes it as unverified, blocked, and
non-writable rather than retroactively claiming Gitlink evidence. A new live
observation must verify identity, branch, containment, index modes, and
cleanliness; it may validly identify zero eligible routes. This worktree is not
a permanent canonical folder.

### Gitlink and submodule boundary

Any gitlink or submodule presence makes the relevant worktree state unverified
and blocks writes. The aggregate parent status is not accepted as proof that
nested repository content is safe.

### Stale worktree metadata

Read-only inspection found stale worktree metadata candidates. This Goal does
not expose their machine paths and does not prune, repair, move, or retire them.

## Snapshot Limitations

- The capture is an immutable bounded snapshot with declared UTC evidence
  times, not a live monitoring claim. Records may have distinct observation
  times inside that boundary.
- The candidate set is deliberately bounded and is not a complete inventory of
  every checkout, archive, backup, or project on the machine.
- Aggregate dirty counts can change after capture; live discovery is a local
  comparison aid and does not silently refresh committed evidence.
- Live discovery emits a timestamped live-observation dataset ID and validates
  the complete observation semantically before stdout; zero eligible routes is
  an allowed fail-closed result.
- Repository identity does not prove that a particular branch is current,
  mergeable, releasable, or safe to write.
- A live-verified clean task worktree does not resolve the recovery-critical
  common root.

## Non-Destructive Recovery Plan

1. Preserve `shared-seis-common-root`, `direct-seis-intake`, and
   `workspace-metadata` as read-only while this review is active.
2. Freeze the public-safe aggregate snapshot and validate it offline.
3. Have the accountable human classify the recovery-critical state locally,
   without publishing filenames or contents.
4. Approve a separate, reversible recovery Goal with explicit retained-state,
   backup, rollback, and validation decisions.
5. Recover only human-selected coherent slices through clean task worktrees and
   focused PRs.
6. Reinspect all affected surfaces before considering any metadata repair,
   pruning, archival, or retirement.

No recovery phase is authorized by this document alone.

## Deferred Dangerous Actions

- Git metadata initialization, repair, or pruning
- staging, restoring, copying, or deleting recovery-critical state
- folder or worktree move, archive, or deletion
- branch deletion or history rewrite
- remote, credential, repository-setting, or branch-protection changes
- GitHub PR or issue mutation
- SSH execution, deployment, or secret rotation

## Human Approval Needed

The accountable human must decide which recovery-critical changes are valuable,
where an approved backup lives, which clean base is authoritative, and whether
stale metadata should be repaired or retired. Each approved action needs a
bounded command plan, rollback, and post-action verification before execution.

## Validation

```bash
npm run check:seis-local-workspace-registry
npm run test:seis-local-workspace-registry
git diff --check
```

Local discovery is separate and read-only:

```bash
npm run inspect:seis-local-workspaces
```

Hosted CI validates only the committed schema, registry, aligned documentation,
and adversarial fixtures. It cannot verify or repair a contributor's current
local workspace.

The JSON Schema is the shared structural and semantic-shape contract. The
generic observation validator enforces cross-field and routing relationships.
The frozen checker then applies snapshot-specific candidate, count, digest,
documentation, and CI assertions to the committed historical dataset.

## Decision

The earlier canonical-local-folder rule is withdrawn. Repository identity is
canonical; local work is routed through a currently verified, clean,
task-scoped worktree. Recovery-critical, non-Git, incomplete, and stale local
surfaces remain preserved until a separate approved recovery action exists.
