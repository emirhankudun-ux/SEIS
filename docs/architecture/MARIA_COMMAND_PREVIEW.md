# MARIA Legacy Command Preview v1

## Status and purpose

Experimental, offline, preview-only input adapter for the existing MARIA runtime
foundation. This is not a voice assistant, an execution dispatcher, an approval
service, or a replacement for the Apple-native shell.

The user-supplied Tasarımcı Dayı Jarvis guides and `jarvis_claude.py` were reviewed
as behavior references. Their `TOKEN|argument` vocabulary describes nine useful
intents, but the supplied prototype takes the first model-output line, accepts
fuzzy command prefixes, and immediately calls action functions. MARIA instead
parses untrusted output into a bounded preview without invoking those functions.
The uploaded third-party source and guides are not copied into this repository.

This follows [MARIA Runtime v18](MARIA_RUNTIME_V18.md): prototypes inform behavior;
small replaceable modules and the existing permission policy own implementation.

## Integration and dependency direction

```text
explicit stdin input / future adapter-supplied model output
    -> command_preview.preview_legacy_command
    -> immutable LegacyCommandPreview
    -> existing PermissionEngine (approval requirements only)
    -> redacted JSON in apps/maria-desktop/maria.py
```

`packages/maria-runtime/python/maria_runtime/command_preview.py` depends only on
Python's standard library and the existing `permissions.py`. It does not register
an available tool, discover models, acquire credentials, or import audio SDKs.
The package-level exports and existing status/context/doctor behavior are unchanged.

## Input contract

Accept exactly one `TOKEN|argument` record. The token must be an exact, uppercase
ASCII spelling from this table; no aliases, prefix matching, case folding, Unicode
normalization, code-fence extraction, or JSON repair is performed.

| Token | Preview classification | Argument |
| --- | --- | --- |
| `ARA` | external | required |
| `APP` | external | required |
| `YT` | external | required |
| `NOT` | modify | required |
| `SAAT` | read | empty |
| `KILIT` | privacy-sensitive | empty |
| `KLASOR` | modify | required |
| `YAZI` | modify | required |
| `KONUS` | read | required |

The complete wire input is limited to 4096 UTF-8 bytes, including an optional
single terminal LF or CRLF. Additional record endings, bare CR, ASCII/C1 controls,
U+2028/U+2029, invalid UTF-8, lone surrogates, missing delimiters, and unknown tokens
are rejected. Required arguments cannot be whitespace-only. No-argument tokens
reject even a space after the delimiter.

Argument case, spacing, Unicode scalar spelling and subsequent literal pipes are
preserved. This preserves received text; it cannot recover case or words already
changed by an upstream speech recognizer. A pipe inside an argument is data, not
a second command. Direct dataclass construction and `dataclasses.replace` apply
the same field validation; the constructor does not accept an authorization flag.

## Authority and target boundary

Every preview has `execution_authorized == False`, including `SAAT` and `KONUS`.
`requires_approval` is an advisory result from the existing `PermissionEngine`,
always consulted with `approved=False` and a fixed token-based target. Its
`allowed` field is deliberately not exported as preview execution authority.

An `APP` name is not a verified application or URL. A `KLASOR` argument is not a
validated path. `YAZI` does not authorize a model call, a file write, or opening a
document. These are conservative intent classifications, not complete effect
plans. A future host must resolve the actual target, discover the capability,
classify every actual effect, and obtain approval at the real execution boundary.
Neither model text nor this preview can supply that approval.

## Privacy and output

Ordinary `repr` and `to_dict()` omit argument content. The CLI defaults to that
redacted representation. `to_dict(include_argument=True)` and `--show-argument`
are explicit disclosure operations; non-boolean Python disclosure options are
rejected. Error messages contain fixed diagnostic codes, never rejected input.

This is output minimization, not encryption or a sandbox against hostile Python
code. Argument text remains in memory and accessible through `.argument`; generic
serialization such as `dataclasses.asdict` is not a redacting API. A future UI must
render disclosed text as untrusted text, not HTML or executable instructions.

## Usage

From a repository checkout containing this PR, with Python 3.12 or newer:

```sh
printf '%s\n' 'APP|youtube' | python3 apps/maria-desktop/maria.py --preview-command
printf '%s\n' 'NOT|Sample design note' | python3 apps/maria-desktop/maria.py --preview-command --show-argument
```

The first command reports a redacted external-intent preview requiring approval;
it does not open YouTube. The second only prints the sample note; it does not save
it. Do not paste private content into shell examples/history. Supply private input
through an appropriately protected stdin source instead.

The CLI reads at most 4097 bytes to detect overflow. It requires EOF on stdin; it
is not a streaming or timeout-managed microphone transport. Valid preview exits
0. Invalid input exits 2 with a fixed JSON error on stderr and no stdout payload.
CLI usage errors use argparse's usage output. `--show-argument` requires preview;
preview cannot be combined with status, doctor, context, or permission actions.

## Verification

```sh
python3 test/maria-command-preview.test.py
python3 test/maria-runtime-v18.test.py
python3 -m compileall -q apps/maria-desktop packages/maria-runtime/python
python3 scripts/check-maria-runtime-v18.py
```

The existing MARIA foundation workflow runs these checks on Ubuntu and macOS with
Python 3.12. This is Python runtime validation, not a SwiftUI build or hardware
voice test. No dependency installation or model download was added to that job.

Test-only head `4b61ec6b4b01a41b0dd3404e79763fba04ff8f13` failed in workflow
`34629312153` on both platforms: the existing nine foundation tests passed, while
the new module and launcher option were absent. This was a missing-feature RED
state, not evidence that the new behavior already existed. Implementation head
`5a8c2e0ccfdaf5fcbe553e6778908d9ff79a7d9c` passed workflow `34629863207`, including
21 new unit/CLI tests, the baseline tests, compilation, and the foundation checker.
Later final-head checks are recorded in the PR, not inferred from earlier runs.

Separate local selected-source tests used the exact Git-blob-verified permission
module. Sixteen unit tests passed; seven compiled behavioral mutations were
caught (fuzzy tokens, first-line truncation, character/byte confusion, argument
trimming, implicit disclosure, execution escalation, and truthy disclosure).
Unchanged corrected source passed again. This local harness is not a full checkout
and does not replace hosted launcher/integration checks.

## Remaining gaps and rollback

No microphone capture, wake word, speech synthesis, provider call, app launch,
file write, HTTP control server, background worker, VPS, or approved executor was
added. The supplied Jarvis prototype itself remains unchanged and should not be
mistaken for this guarded MARIA path. There is no live voice integration yet.

This work starts independently from main `b465e60d2627ce1919c03f06c28b80104ee5bd65`
on `feature/maria-command-preview-v1`; it does not extend or rewrite the #239
workspace-evidence stack or the parallel platform branch. Joint integration with
those branches still requires review and fresh tests.

Rollback is to close this draft PR or revert only its focused commits. Do not
modify user data, Git metadata, original uploads, accounts, or permissions.
The next bounded step is a host-owned preview presentation with source identity
and stale-result rejection, before any separate voice or execution adapter.
