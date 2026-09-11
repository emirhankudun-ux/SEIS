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
- branch references are restricted to a conservative symbolic `refs/heads/...` form that rejects traversal, empty components, control characters, ASCII DEL, single `@`, Git-dangerous patterns, and a `.lock` suffix on **every** slash-separated ref component while preserving otherwise-valid non-ASCII branch identities;
- direct `WorkspaceEvidenceSnapshot` construction applies the same branch-identity predicate as filesystem capture, so typed evidence cannot bypass the source boundary;
- repository revisions must be 40- or 64-character hexadecimal object identifiers;
- duplicate matching identities in `packed-refs` are rejected rather than resolved heuristically.

The `.lock` rule is component-scoped rather than whole-branch-only. For example, `release.lock/hotfix` is invalid even though the complete branch string does not end in `.lock`. This mirrors Git's refname contract and prevents the evidence layer from certifying an identity Git itself reserves for lock-file semantics.

Symbolic `HEAD` parsing preserves branch identity exactly. Only one terminal `LF` or `CRLF` metadata line ending is removed; generic Unicode whitespace stripping is forbidden because Git accepts non-ASCII whitespace bytes in refnames. A branch such as `feature/maria-unicode\u00a0` must remain that exact branch, not be silently retargeted to `feature/maria-unicode`. Additional embedded `CR`/`LF` characters fail closed.

Loose ref parsing follows the relevant Git distinction in the opposite direction: trailing ASCII whitespace and blank lines may follow the object id, but leading whitespace before the object id is invalid. The evidence source therefore checks the first decoded ASCII character before trimming trailing metadata. It must not convert a ref payload Git rejects, such as ` 0123...`, into a trusted revision by calling `strip()` first.

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

The branch-identity contract was then specified at `3442d449063e19113980ec4f9b127f53bc606be1`. Hosted `MARIA Learning Fabric` run `34608696251` went red with five expected failures: direct typed snapshots admitted traversal/single-`@`/DEL identities, while filesystem capture admitted single `@` and DEL. The first implementation aligned typed snapshots with `_safe_branch` and rejected those missing cases.

A follow-up regression test intentionally exercised a valid Unicode branch identity. Run `34609148899` showed the first DEL fix was too broad because an ASCII-only upper bound also rejected all non-ASCII branch characters. The follow-up fix narrows that rule to reject characters below ASCII space plus DEL (`0x7f`) while retaining the existing forbidden-character and ref-pattern checks.

A further branch-component regression was specified first at `94f02f3666f5efcf0c772ce01a9890c2cf50523b`. `MARIA Learning Fabric` run `34611023871` failed because `release.lock/hotfix` was accepted: the predicate checked `.lock` only at the end of the complete branch string. The minimal implementation at `eafd6d78568a54da8d342e15950c8f28090628b0` applies the suffix rule to every slash-separated component. Run `34611225451` then passed the six branch-contract tests and the full MARIA regression sweep without narrowing valid Unicode identities.

The exact symbolic-HEAD regression was then specified at `1dc8cb29aa3fa78d6942ba26e56a39001c10e706`. `MARIA Learning Fabric` run `34613956558` failed because Python `str.strip()` removed the trailing `U+00A0` from a Git-valid branch name, after which capture looked up a different ref. The minimal implementation at `cfc92250d747a4e1d795f278b62019b209808ed9` removes only `LF`/`CRLF` metadata endings and rejects extra line breaks.

A separate loose-ref regression was specified at `23f4be21e7df2a05040283c62aaff2af6614e2b5`. `MARIA Learning Fabric` run `34614283105` failed because a ref payload with a leading ASCII space was normalized by `strip()` and accepted even though Git rejects that object-id line. The fix at `0429013522076a8400b305cfe456594e8f22a767` validates the first ASCII character before retaining Git's accepted trailing-whitespace behavior. Current-head CI, not these earlier runs, remains the acceptance source.

## Rollback

The feature remains isolated on `feature/maria-current-workspace-evidence-v1`, with branch-identity corrections kept in focused stacked review commits. Rollback means reverting the relevant focused commits or closing the follow-up PR. Do not delete user repositories, `.git` metadata or durable recovery checkpoints to roll back this code.

## Next safe step

After the workspace-evidence stack is fully green and reviewed, connect the snapshot to the existing read-only native recovery presentation through an explicit host-selected workspace action. Preserve file-only mode, show source/freshness state visibly, and keep every execution/resume capability outside the presentation contract.
