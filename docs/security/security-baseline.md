# SEIS Security Baseline

Status: active public-safe evidence record

Source evidence revision: `db81733053c94a28c1d404d76ca37c152f783c07`

Implementation state: implemented and validated in the local working tree;
commit SHA and remote CI evidence pending

Reviewed: 2026-07-13

## Purpose

Record the current secret-storage and public/private controls without exposing
values or claiming broader verification than the evidence supports. This is a
scoped control audit, not a formal Codex Security scan or a repository-wide
vulnerability assessment.

## Current Status

| Area                         | Status                                                           | Evidence                                                                                                                                                          | Limitation                                                                                                                                                               | Next Safe Action                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Root security policy         | Implemented locally                                              | `SECURITY.md`, `docs/SECURITY.md`, canonical navigation links                                                                                                     | Policy presence is not runtime enforcement.                                                                                                                              | Obtain remote foundation evidence for the implementation revision.                                                         |
| Ignore rules                 | Implemented locally                                              | `.gitignore`; `npm run check:security-boundary`; `npm run test:security-boundary`                                                                                 | Remote CI has not executed the implementation working tree.                                                                                                              | Preserve focused secret rules and visible workflow, security-script, lockfile, and security-document paths through review. |
| Environment template         | Implemented locally                                              | `.env.example`; the boundary validator rejects nonempty secret-like fields without printing values.                                                               | No live provider or store was inspected.                                                                                                                                 | Obtain remote negative-fixture evidence at the implementation revision.                                                    |
| Secret storage               | Policy and local contract implemented                            | `docs/security/SECRET_STORAGE.md`, `project.ecosystem.yaml`, boundary validator                                                                                   | No managed store, Keychain item, CI secret, or live provider configuration was verified.                                                                                 | Keep runtime and store claims unavailable until separately verified.                                                       |
| Public/private boundary      | Policy and local contract implemented                            | `docs/PUBLIC_PRIVATE_BOUNDARY.md`; canonical cross-link validation                                                                                                | The validator covers named repository controls, not every possible private data source.                                                                                  | Preserve manual changed-path review and add scoped checks only when evidence supports them.                                |
| Local Gitleaks wrapper       | Hardened and syntax-validated locally                            | `scripts/security/scan-secrets.sh`; `bash -n`; boundary validator and negative fixtures                                                                           | Gitleaks was unavailable locally, so a local repository and history scan was not executed.                                                                               | Use the reviewed external setup, then run the redacted wrapper without granting it install or elevation authority.         |
| Remote Gitleaks              | Previous source revision passed; implementation evidence pending | [SEIS Guardian run 29212479211](https://github.com/emirhankudun-ux/SEIS/actions/runs/29212479211) completed successfully for source evidence revision `db817330`. | The implementation working tree has no commit SHA or remote run yet; `.gitleaks.toml` also excludes a historical generated aggregate path while issue #129 remains open. | Run Guardian CI after commit and preserve the explicit historical limitation.                                              |
| Credential incident response | Implemented and validated locally                                | `docs/security/CREDENTIAL_INCIDENT_RESPONSE.md`; required-heading, owner-gate, exact-path, and cross-link checks                                                  | No live incident, provider-side revocation, or synthetic tabletop was executed.                                                                                          | Run a credential-free tabletop in a separate evidence slice.                                                               |
| Hardening design             | Selected option and implementation plan documented               | `docs/security/hardening/hardening.md`; `hardening.json`; local-controls plan                                                                                     | The hardening set is derived from a scoped control audit, not a formal scan or proof of remote operation.                                                                | Reconcile the portfolio after remote CI and any material source drift.                                                     |

## Known Historical Gitleaks Limitation

The repository's `.gitleaks.toml` contains a path-level allowlist for a legacy
generated source aggregation at
`sources/github-unified-source/_generated/github-code-bundle.txt`.
[GitHub issue #129](https://github.com/emirhankudun-ux/SEIS/issues/129),
**Security: resolve historical Gitleaks findings in generated source bundle**,
remains open as of this review.

The previous pull-request workflow checked out full history, installed the pinned
Gitleaks version, executed the redacted Gitleaks step, and completed
successfully. That is authoritative evidence that the configured scan passed
for source evidence revision `db817330`; it is not remote evidence for the
current implementation working tree and is not evidence that the allowlisted
historical content is synthetic, invalidated, rotated, or removed. Do not close
the issue, weaken or broaden the allowlist, inspect values, rotate credentials,
or rewrite history without the accountable owner's decision.

## Evidence Boundaries

This baseline used:

- repository-relative source inspection at revision `db817330`;
- path-only tracked-file and ignore-rule inspection;
- placeholder classification that did not print environment values;
- shell syntax validation for the local wrapper;
- successful local `check:security-boundary` and `test:security-boundary`
  commands, including value-redacting negative fixtures;
- successful local ecosystem foundation validation and negative tests;
- current GitHub issue and workflow metadata.

It did not use:

- a formal Codex Security scan;
- local Gitleaks execution, because the reviewed tool was unavailable;
- provider calls, credential validation, SSH, deployment, or secret-manager
  access;
- inspection of any detected value or private incident material;
- credential rotation, allowlist mutation, or Git history rewriting.

## Required Evidence For Future Claims

Security claims must record the exact command, exit status, revision, scope,
exceptions, and artifact or check link. Findings remain path-only and
category-only. A check that is skipped, unavailable, cancelled, allowlisted, or
not applicable retains that status instead of being summarized as passed.

## Related Documents

- [Secret Storage Policy](SECRET_STORAGE.md)
- [Credential Incident Response](CREDENTIAL_INCIDENT_RESPONSE.md)
- [Public / Private Boundary](../PUBLIC_PRIVATE_BOUNDARY.md)
- [Focused Security Policy](../SECURITY.md)
- [Security Hardening Review](hardening/hardening.md)
- [Repository Security Policy](../../SECURITY.md)
- [Next PR Queue](../roadmap/NEXT_PR_QUEUE.md)
