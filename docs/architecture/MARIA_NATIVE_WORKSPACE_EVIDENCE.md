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
- `HEAD` and `packed-refs` are decoded as UTF-8 because Git ref names may contain valid non-ASCII identity; loose ref payloads remain ASCII because they contain only an object id;
- every accepted object id is still independently restricted to 40 or 64 ASCII hexadecimal characters.

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

The same identity preservation applies after Git packs a loose branch ref. `packed-refs` contains both an ASCII object id and the ref name; decoding the entire file as ASCII would make a valid Unicode branch disappear from the evidence layer after ordinary ref packing. Both Python and native sources therefore decode bounded `packed-refs` metadata as UTF-8 and still validate the object-id token separately as ASCII hexadecimal data.

Packed-ref record parsing is also deliberately narrower than a language's generic “line” API. Git accepts Unicode scalars such as U+2028 inside ref names, while Python `str.splitlines()` and Foundation newline character sets treat that scalar as a line boundary. The evidence sources therefore split packed metadata only on literal ASCII LF and remove an optional preceding CR. Unicode line-separator scalars remain part of the exact branch identity instead of being reinterpreted as record delimiters.

Packed-ref **name matching is scalar-exact**. Git stores ref identity as exact bytes/scalars, so NFC/NFD spellings such as `café` and `cafe\u0301` are distinct packed refs. Swift `String ==` intentionally treats canonically equivalent spellings as equal for normal user-facing text; that behavior is not appropriate for Git identity. The native source therefore compares packed-ref names through Unicode-scalar equality and never normalizes the branch before lookup. An exact decomposed ref round-trips unchanged, while a canonically equivalent but scalar-distinct packed entry is treated as a missing branch rather than silently certifying another ref.

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
- A follow-up timestamp-parity test checkpoint `bac4d10507c590f436e41b98cb942d5978015d02` intentionally went RED in run `34617288781` because the first native validator rejected MARIA's timezone-less ISO observation form. The focused correction preserves the original evidence string while validating its UTC-equivalent form.
- Packed-ref Unicode parity was specified before implementation at `56a85af0260be3b4895035c637b8d868c71e8322`. `MARIA Learning Fabric` run `34619800000` failed because Python attempted to decode the packed ref name with ASCII, and `MARIA Swift Recovery` run `34619799936` failed its single new native test with `invalidMetadataEncoding`. The existing native shell still built successfully in that RED run. The minimal correction changed only packed-ref decoding to UTF-8 in each implementation; loose object-id decoding and object-id validation remained unchanged.
- The deeper Git-valid separator case was specified at `d0ccaba703487ef661afe714b0ebc1b366e20abd`. `MARIA Learning Fabric` run `34620777492` failed because Python `str.splitlines()` divided U+2028 inside the branch name and reported malformed packed metadata. `MARIA Swift Recovery` run `34620777540` likewise built the native shell successfully, then failed exactly one new Swift test with `malformedPackedRefs`. The focused correction at `f7ce60a4000a008ac17bfc09e9f1defa529c3b4e` splits records only on ASCII LF/CRLF metadata delimiters.
- Scalar-exact packed-ref identity was specified at `6b93e8d0980cbe38d0c82148608e67797e2e4fd7`. `MARIA Learning Fabric` run `34622625567` stayed green because Python already used scalar-exact equality. `MARIA Swift Recovery` run `34622625551` built `SeisAppleNativeShell`, then failed exactly the new native expectation: Swift returned the decomposed `feature/cafe\u0301` snapshot even though `packed-refs` contained only the canonically equivalent precomposed `feature/café` name. The minimal source correction at `68706f90968ce3dc15da4cdc8111c0f70fcec854` replaced user-facing `String ==` with the existing Unicode-scalar comparator for packed-ref lookup; run `34622912546` returned green. Follow-up positive controls at `370e3b2e3ecc8c7e90ddfba90312956c5d9098d1` verify that an exact decomposed packed ref still round-trips without normalization; final native run `34623251315`, Learning run `34623251399`, and Foundation run `34623251418` all passed.

Focused native tests are under:

- `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisMariaWorkspaceEvidenceTests.swift`;
- `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisMariaWorkspaceEvidenceTimestampTests.swift`;
- `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisMariaWorkspaceEvidencePackedRefUnicodeTests.swift`.

The Python counterpart is covered by `test/maria-workspace-packed-ref-unicode.test.py` in addition to the existing current-workspace evidence contracts.

## Rollback

The work is isolated on `feature/maria-native-workspace-evidence-v1`, with packed-ref Unicode parity maintained in focused stacked follow-ups. Rollback means closing the relevant draft PR or reverting its focused commits. Never delete or rewrite a user's repository, `.git` directory, recovery snapshots, or checkpoints to roll back this code.

## Next safe step

Only after this native source and its stacked parity corrections are green and reviewed should the macOS recovery presentation gain an explicit **user-selected workspace** action. That follow-up should:

- keep the existing JSON-file mode;
- make workspace source and observation/freshness state visible;
- use security-scoped access at the host/UI boundary;
- test stale/late selection results;
- preserve the rule that evidence and presentation never authorize execution.
