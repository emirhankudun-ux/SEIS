# MARIA Current Workspace Evidence v1

## Purpose

This slice adds a narrow, read-only source of **current** Git workspace identity for MARIA recovery reconciliation. It exists to answer a bounded question: does the explicitly selected workspace currently point at the branch and repository revision expected by persisted recovery evidence?

It does not discover projects, inspect working-tree contents, run Git, contact remotes, read credentials, resume work or authorize execution.

The source is `maria_runtime.workspace_evidence.GitWorkspaceEvidenceSource`. It produces a `WorkspaceEvidenceSnapshot`, which can emit exactly two verified `ContextFact` records:

- `current_branch`;
- `repository_revision`.

Both facts use source `git-workspace-head`, confidence `1.0`, the caller-supplied project identity and a caller-supplied observation timestamp. `WorkspaceEvidenceSnapshot.execution_authorized` is always `False`.

## Explicit selection boundary

`capture()` accepts one workspace root selected by the host. V1 does not scan parent directories, home directories, sibling repositories or mounted volumes. It reads only bounded metadata under that selected root's ordinary `.git` directory.

Supported Git identity shape:

1. `.git/HEAD` must contain a symbolic `refs/heads/...` reference;
2. the revision is read from the matching loose ref when present;
3. otherwise a bounded `packed-refs` file may supply the exact branch ref.

Detached HEAD is rejected. V1 intentionally rejects linked-worktree/submodule-style `.git` files rather than following a `gitdir:` pointer. Supporting those layouts safely is a separate future contract, not an implicit path-following behavior.

## Filesystem and parsing bounds

The reader is fail-closed and applies the following limits before accepting evidence:

- `.git` must be an ordinary directory, not a symlink;
- `HEAD`, loose refs and `packed-refs` must be ordinary files, not symlinks;
- every existing intermediate directory in a loose-ref path must be an ordinary directory, not a symlink;
- `HEAD` and loose ref payloads are capped at 4 KiB;
- `packed-refs` is capped at 256 KiB;
- final files are opened with `O_NOFOLLOW` where supported and handles are revalidated with `fstat`;
- branch references are restricted to a conservative symbolic `refs/heads/...` form that rejects traversal, empty components, control characters and Git-dangerous patterns;
- repository revisions must be 40- or 64-character hexadecimal object identifiers;
- duplicate matching identities in `packed-refs` are rejected rather than resolved heuristically.

The storage path is still expected to belong to the trusted SEIS/MARIA host account. These checks reduce accidental aliasing and stale-path mistakes; they are not a hostile multi-user filesystem sandbox and cannot eliminate every directory-replacement race by another principal with filesystem authority.

## Freshness semantics

`RecoveryReconciler` now accepts an optional `max_evidence_age_seconds` policy. The default is `None`, which preserves previous behavior for existing callers.

When a positive freshness window is configured:

- the window is bounded to at most 24 hours;
- `reconcile(..., as_of=...)` may use an explicit comparison timestamp for deterministic tests/hosts;
- a verified fact older than the configured window is treated as missing evidence;
- a fact dated after the comparison instant is also treated as missing evidence;
- stale/future facts produce `EVIDENCE_REQUIRED`, not `DRIFT_DETECTED`;
- only fresh verified values participate in drift comparison.

This distinction matters: stale data does not prove that the workspace changed. It proves only that MARIA lacks current evidence.

Complete checkpoints still short-circuit as complete and never gain execution authority. An aligned incomplete checkpoint remains `ALIGNED_REPLAN_REQUIRED`; it must be freshly planned and pass normal routing, permission, MCP/tool and per-attempt authorization before any execution.

## What is deliberately absent

V1 does **not** read or expose:

- remote/origin URLs;
- Git credentials or credential-helper state;
- working-tree files, diffs, untracked files or status;
- commit messages, authors or history;
- repository names inferred from network configuration;
- prompts, model/tool output or checkpoint bodies;
- execution/resume tokens;
- automatic refresh loops or background watchers.

`current_repo` and `active_goal` remain separate verified context inputs. The workspace source does not fabricate either from a local path or Git remote.

## Test-first evidence

The initial specification-only checkpoint was `893b30d14505e9a89b6524d95be9f8c80adfbff9`. Hosted `MARIA Learning Fabric` run `34602804614` failed exactly because `maria_runtime.workspace_evidence` did not yet exist.

After the bounded source and freshness policy were implemented, checkpoint `401d338e9dc05d0314c2a939c45414a478147948` passed `MARIA Learning Fabric` run `34603208137`, including 9 focused workspace/freshness tests and the existing MARIA regression sweep.

A second test-first hardening checkpoint, `f55d7b88479579b77a057b8355a905210a94a5c2`, exposed two concrete gaps in run `34603515976`:

1. an intermediate loose-ref directory symlink could still be followed because final-component `O_NOFOLLOW` does not protect parent path components;
2. non-string snapshot timestamps could leak `AttributeError` from the shared context timestamp parser instead of staying inside `WorkspaceEvidenceError`.

The minimal fix at `a33b04c7c7bb5a2a9ca8efc9d1360fa698f5f5e7` validates the loose-ref parent chain before reading and validates timestamp shape before constructing context evidence. It also retains duplicate packed-ref, final symlink and SHA-256-object-id tests.

Final PR-head CI remains the acceptance source; documentation-only follow-up commits must not be called fully verified until their own triggered checks finish.

## Rollback

The change is isolated on `feature/maria-current-workspace-evidence-v1`. Rollback means reverting or closing this focused draft branch/PR. Do not delete user repositories, `.git` metadata or durable recovery checkpoints to roll back this code.

## Next safe step

After this contract is fully green and reviewed, connect the snapshot to the existing read-only native recovery presentation through an explicit host-selected workspace action. Preserve file-only mode, show source/freshness state visibly, and keep every execution/resume capability outside the presentation contract.
