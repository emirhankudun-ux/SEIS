# MARIA Native Workspace Evidence v1

## Purpose

This slice gives the Apple-native SEIS foundation a narrow, read-only source of **current Git workspace identity** for one workspace explicitly selected by the host. It is the native counterpart to the Python `GitWorkspaceEvidenceSource`; it is not a second recovery engine and it does not introduce execution authority.

The implementation lives in:

- `SeisPlatformKit.SeisMariaWorkspaceEvidenceSnapshot`;
- `SeisPlatformKit.SeisMariaWorkspaceEvidenceSource`.

The source returns only:

- caller-supplied project identity;
- current symbolic branch;
- current repository object id;
- caller-supplied observation timestamp.

`executionAuthorized` is always `false`.

## Architectural position

The existing recovery presentation remains file-only and read-only. This slice intentionally stops **before** SwiftUI workspace selection or recovery-view integration.

The intended future flow is:

`explicit host selection -> security-scoped access -> SeisMariaWorkspaceEvidenceSource -> visible current-evidence state -> separately governed reconciliation`

The current JSON snapshot importer is not replaced. No native evidence value may be interpreted as permission to resume work, invoke a provider/tool, modify a repository, or grant an account/OS permission.

## Explicit selection boundary

`capture(_:project:observedAt:)` accepts exactly one local file URL supplied by the host. It does not search parent directories, the home directory, sibling repositories, mounted volumes, recent projects, Git remotes, or the network.

The source itself does not acquire or persist a macOS security-scoped bookmark. A future SwiftUI host action must own security-scoped access and pass an already selected URL into this lower-level contract.

## Supported Git identity shape

V1 supports only an ordinary `.git` directory with:

1. symbolic `HEAD` pointing at `refs/heads/...`;
2. the matching ordinary loose ref when present;
3. otherwise an ordinary bounded `packed-refs` file containing exactly one matching branch identity.

Detached HEAD is rejected. A `.git` file used by linked worktrees/submodules is rejected rather than followed. No Git subprocess is launched.

## Filesystem trust and bounds

Before accepting evidence, the source verifies:

- the selected workspace root is an ordinary directory;
- `.git` is an ordinary directory and not a symbolic link;
- every existing intermediate directory in a loose-ref path is an ordinary directory;
- `HEAD`, loose refs, and `packed-refs` are ordinary files and not symbolic links;
- final files are opened with `O_NOFOLLOW` and revalidated with `fstat`;
- `HEAD` and loose-ref payloads are capped at 4 KiB;
- `packed-refs` is capped at 256 KiB;
- data remains within the byte ceiling even if a file changes size after metadata inspection;
- `HEAD` is UTF-8 and loose/packed object-id metadata is ASCII.

The selected workspace is still expected to belong to the trusted SEIS/MARIA host account. These checks reduce path-alias and stale-metadata mistakes; they are not a hostile multi-user filesystem sandbox.

## Branch identity parity

The native branch predicate intentionally mirrors the conservative Python workspace-evidence contract. It rejects traversal/dangerous Git ref patterns including:

- empty or doubled path components;
- single `@`;
- `..` and `@{`;
- ASCII control characters and DEL;
- ASCII space plus Git-reserved `~ ^ : ? * [ \\` characters;
- leading/trailing slash and terminal dot;
- components beginning with `.`;
- a `.lock` suffix on **every** slash-separated component.

Otherwise-valid non-ASCII branch identity is preserved. In particular, symbolic `HEAD` removes only one terminal LF or CRLF metadata ending; it does not call generic Unicode whitespace trimming. A Git-valid branch ending in U+00A0 therefore remains that exact branch.

Loose refs intentionally use different whitespace semantics: leading whitespace before the object id fails closed, while Git-accepted trailing ASCII whitespace/blank lines may follow the id.

Repository revisions must be 40- or 64-character hexadecimal object ids and are normalized to lowercase.

## Observation timestamp parity

MARIA's Python `ContextFact` accepts common ISO observation strings with `Z`, an explicit offset, or no timezone; a timezone-less value is interpreted as UTC. Native evidence preserves the original observation string while validating those same common forms. The native source does not rewrite a timezone-less observation into a different persisted string.

This timestamp is provenance metadata only. It does not make evidence automatically fresh. Freshness policy remains a separate reconciliation concern.

## Coherence

Capture samples symbolic `HEAD` plus its resolved branch revision twice. The two samples must agree on ref identity, exact Unicode branch identity, and object id. A detected branch/revision move during the capture fails closed as `workspaceIdentityChanged` rather than certifying a mixed snapshot.

This is a bounded consistency check, not an atomic Git transaction and not a guarantee that the workspace cannot change immediately after `capture` returns.

## What is deliberately absent

V1 reads or performs none of the following:

- remote/origin URL access;
- Git config or credential-helper access;
- working-tree files, status, diffs, untracked files, history, authors, or commit messages;
- project discovery or repository enumeration;
- writes to `.git` or the workspace;
- background watching or automatic refresh;
- recovery checkpoint reads;
- resume, rollback, provider, MCP, or tool invocation;
- execution/permission tokens.

## Test-first evidence

The feature was specified before its native source existed.

- Test-only checkpoint `66c96190480a35a757e6346c83ad1de49433bb48` produced the intended hosted RED state in `MARIA Swift Recovery` run `34616573879`: the existing app build succeeded, then Swift tests failed to compile because `SeisMariaWorkspaceEvidenceSnapshot`, `SeisMariaWorkspaceEvidenceSource`, and `SeisMariaWorkspaceEvidenceError` did not exist.
- Implementation checkpoint `89a7975ab97fb12c98cab5fe199e0fa445f7576f` then passed `MARIA Swift Recovery` run `34616866965`, including the native shell build, the full Swift package suite, Thread Sanitizer cancellation regression coverage, mutation sensitivity checks, and retained synthetic recovery renders.
- A follow-up timestamp-parity test checkpoint `bac4d10507c590f436e41b98cb942d5978015d02` intentionally went RED in run `34617288781` because the first native validator rejected MARIA's timezone-less ISO observation form. The focused correction preserves the original evidence string while validating its UTC-equivalent form. Current-head CI remains the acceptance source for that correction.

Focused native tests are under:

- `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisMariaWorkspaceEvidenceTests.swift`;
- `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisMariaWorkspaceEvidenceTimestampTests.swift`.

## Rollback

The work is isolated on `feature/maria-native-workspace-evidence-v1`, stacked on the current workspace-evidence correction branch. Rollback means closing the draft PR or reverting its focused commits. Never delete or rewrite a user's repository, `.git` directory, recovery snapshots, or checkpoints to roll back this code.

## Next safe step

Only after this native source is green and reviewed should the macOS recovery presentation gain an explicit **user-selected workspace** action. That follow-up should:

- keep the existing JSON-file mode;
- make workspace source and observation/freshness state visible;
- use security-scoped access at the host/UI boundary;
- test stale/late selection results;
- preserve the rule that evidence and presentation never authorize execution.
