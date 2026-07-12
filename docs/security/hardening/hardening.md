# Security Hardening Review: SEIS Local Secret Controls

## Evidence Basis

This review is derived from a scoped control audit at revision `db817330`, not
from a formal Codex Security scan. We inspected the repository's ignore policy,
public environment template, Gitleaks configuration, local wrapper, Guardian
workflow, security policies, public/private boundary, prior baseline, and
project manifest. The evidence inventory and integrity digest are in
[context.md](context.md); the structured analysis is in
[hardening.json](hardening.json).

The configured Guardian scan also completed successfully for the evidence
revision. We should read that result narrowly: the open historical decision in
[issue #129](https://github.com/emirhankudun-ux/SEIS/issues/129) corresponds to
a path-level Gitleaks exception, so the passing workflow is not proof that the
excluded historical content is resolved.

## Constraints

We are preserving a public-safe, local-first, least-privilege profile. This
documentation slice does not inspect values, call providers, install tools,
change workflows, rotate credentials, rewrite history, or close the historical
issue. No latency or memory budget was supplied, so resource effects remain
source-derived or hypothetical rather than measured.

The user's autonomous-development direction selected deterministic local
controls. The selected controls are now implemented and validated in the local
working tree under the same focused Goal slice and committed through `7c230ca5`.
Foundation and Enterprise gates passed on pull request #179; Guardian remains
pending because the pull request is stacked on a non-triggering base. This
portfolio remains a design artifact rather than proof of complete remote
operation.

## Opportunity Portfolio

| Opportunity                                                      | Evidence                                                                                                                                        | Options                                                                             | Recommendation                                                                                  | Proposal                                                                                |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Make secret-boundary enforcement deterministic and locally owned | Ignore-policy drift, unsafe local wrapper behavior, implicit CI authority, fragmented policy, and the open historical exception (`E001`–`E012`) | Option 1: deterministic local controls; Option 2: centralized ecosystem enforcement | Select Option 1 now; retain Option 2 for multi-repository scale or repeated local-control drift | [Deterministic local secret controls](proposals/deterministic-local-secret-controls.md) |

## Recommendation Summary

I recommend Option 1, deterministic local controls, under the current
constraints. We can remove the immediate control drift without adding a new
service or trusted execution plane: one local validator, one non-installing
redacted scanner boundary, explicit read-only CI permissions, integrity-checked
tool acquisition, canonical policy links, and an incident runbook. The approach
is reviewable, reversible, and compatible with the existing repository.

Option 2 becomes preferable if several canonical repositories need the same
policy and evidence contract, or if repeated drift shows that repository-local
ownership is not sustainable. Its stronger central ownership would be useful,
but today it would introduce a new supply-chain and availability dependency
before the local invariant is proven.

Neither option resolves issue #129 automatically. The accountable human must
decide whether the excluded historical material is synthetic, already
invalidated, accepted under a narrow documented exception, or subject to
rotation and coordinated history recovery.

## Next Decisions

- Review the locally implemented selected
  [local deterministic-controls plan](implementation/local-deterministic-controls.md)
  against the final diff, then obtain remote evidence at the committed
  implementation revision.
- Choose an integrity-verifiable Gitleaks distribution mechanism and pin its
  version and digest or reviewed action revision.
- Decide the provider-side and repository-history disposition for issue #129
  without publishing values or weakening the scanner.
- Revisit centralized enforcement only after the local controls supply stable
  evidence across more than one canonical repository.
