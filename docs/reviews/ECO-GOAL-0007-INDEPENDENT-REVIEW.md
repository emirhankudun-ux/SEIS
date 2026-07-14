# ECO-GOAL-0007 Independent Review

Review date: 2026-07-14
Review state: local implementation review complete; hosted checks pending

## Scope

Three independent, read-only specialist reviews examined the compiler boundary,
artifact integrity, public/private safety, Goal-schema compatibility, contextual
chunk contract, and evidence model. Reviewers did not edit the worktree. Findings
were reproduced locally before they were incorporated.

## Findings incorporated

- Reject generated-output roots and parents that resolve through symlinks, and
  require realpath containment before no-follow, exclusive writes.
- Hash captured stage-zero Git blobs and compile from the captured buffers so a
  source cannot change between policy inspection and compilation.
- Run Git with a bounded environment and reject hostile helper configuration,
  untracked sources, modified sources, non-regular blobs, and symlink parents.
- Treat the configured public-safe scanner as supplemental to repository and
  hosted secret scanning; reject private path markers and unsafe controls without
  printing matched values.
- Verify a closed artifact inventory, every payload hash and size, manifest
  integrity, prompt reconstruction, contextual bounds, and unexpected files.
- Label payload chunks as integrity-only and contextual chunks as the model-use
  surface only after the caller validates its own context budget.
- Reject blank-line padding, repeated-character padding, duplicate semantic
  tuples, weak injection markers, and non-semantic exact-fit material.
- Compare statuses, horizons, and all quality-gate keys with the canonical
  ecosystem Goal schema and validate the prompt pack against its own schema.
- Preserve the initial inventory as immutable parent-commit evidence and keep
  current implementation evidence in the Goal record.

## Reproducible local result

The reviewed compiler contract records:

- normalized Unicode code points: `5,000,000`
- output SHA-256:
  `574af3e6e17b22276550d04da908a28fc5164f6c4ccce44db82772084c53d359`
- source-set SHA-256:
  `17cd996d8ee68c755750f0ad76953da1320978c3d1817a43b06549286d75220f`
- compiler-set SHA-256:
  `7350a2b8dd458ef7f5a77b30b489b7e6f4ed4bd29edb352b1cb5643323dcb92b`
- manifest SHA-256:
  `3c76d239bb1d0cc5de86892dfcd6687d1efd0a9899d7c45aaa598873b7102df3`
- chunk count: `51`
- unique scenario count: `2,626`
- semantic exact-fit directive count: `61`

The committed golden contract is
`prompts/goal-tracking-update-v1/expected-build.json`. The full prompt, manifest,
and chunks remain ignored local build artifacts and are reproducible from tracked
sources.

## Validation reviewed

- exact build, deterministic rebuild, and on-disk verification passed
- eight adversarial test groups passed
- ecosystem Goal schema validation and negative fixtures passed
- legacy Goal Tracking and Master Prompt compatibility checks passed
- foundation, governance, and SEIS Code checks passed
- scoped ESLint, Prettier, Node syntax, and `git diff --check` passed
- AI provider audit reported 21 providers and zero secret findings; its generated
  audit-file refresh was restored because it was outside this Goal's scope

Local `gitleaks` execution was unavailable because the binary is not installed
(`exit 127`). This remains a disclosed skipped check, not a passing security
claim. Hosted Guardian evidence is still required. The parent Goal's hosted
Guardian is known to report a redacted full-history candidate from unrelated open
pull request 154; this Goal must not weaken the scanner, add an allowlist, or hide
that external blocker.

## Review decision

The local implementation is ready for a focused stacked pull request. Goal
completion remains prohibited until the required hosted and human review evidence
exists. The generated corpus is an integrity and retrieval artifact, not a claim
that a single provider request can consume five million characters.
