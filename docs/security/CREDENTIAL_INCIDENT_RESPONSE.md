# SEIS Credential Incident Response

Status: active public-safe runbook

## Purpose

Use this runbook when a token, key, password, certificate, private host
credential, signing identity, or other secret may have entered Git, a build
artifact, a log, a prompt, a screenshot, browser storage, or another unapproved
surface. This document coordinates containment and recovery without recording
the secret value.

The repository vulnerability-reporting channel and response targets remain in
the root `SECURITY.md`. This runbook covers credential-specific operational
steps after a report or automated detection.

## Safety Rules

- Do not paste, quote, screenshot, hash for comparison, or otherwise reproduce
  the suspected value in issues, pull requests, chat, documents, or logs.
- Record the path or surface, credential category, provider, affected revision
  or time window, and current state only.
- Treat a plausibly exposed credential as compromised until its authoritative
  owner confirms revocation or invalidation.
- Do not broaden a scanner allowlist, delete evidence, rewrite Git history,
  rotate credentials, alter repository settings, or deploy a fix without the
  required human approval.
- Use a private reporting channel for sensitive incident coordination. A
  public issue may track a redacted owner decision only when it contains no
  values or sensitive infrastructure details.

## Roles

| Role                              | Responsibility                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| Accountable human / incident lead | Classify severity, authorize external mutations, coordinate disclosure, and close the incident   |
| Credential owner                  | Revoke, rotate, narrow scope, and validate the provider-side state                               |
| Repository guardian               | Contain current-tree exposure, preserve path-only evidence, and prepare a reviewable remediation |
| Service or workflow owner         | Disable affected capability, inspect authorized logs, and validate recovery                      |
| Security reviewer                 | Confirm scope, redaction, residual risk, and completion evidence                                 |

An agent may prepare evidence, patches, and a recovery plan. It may not grant
itself authority to rotate a credential, inspect a private value, rewrite
history, or change protected repository settings.

## Detection And Triage

- Create a private incident record with a stable identifier.
- Record the detected surface, path, category, provider, revision or time
  window, discovery source, and who owns the credential.
- Classify whether the value could grant read, write, deploy, publish, billing,
  signing, SSH, database, or administrative authority.
- If reality is uncertain, use the more restrictive status and state exactly
  what evidence is missing.

## Containment

- Pause or disable the affected workflow, adapter, deployment, token consumer,
  or account path when continued use could increase impact.
- Ask the credential owner to revoke, disable, or restrict the credential at
  its authoritative provider. Do not wait for a repository patch when the
  credential can still be used.
- Prevent further copies by removing the value from the current working tree,
  generated output, logs, or artifacts through a focused reviewed change.
- Preserve only path-only and category-only evidence needed for investigation.

## Revocation And Rotation

- The accountable credential owner revokes, disables, or restricts the
  suspected credential at its authoritative provider before repository cleanup
  is treated as recovery.
- A replacement receives the minimum practical scope and lifetime and is stored
  under the [Secret Storage Policy](SECRET_STORAGE.md).
- Rotation, revocation, and provider-side access changes require explicit owner
  authorization. An agent may prepare the plan and evidence but may not perform
  the mutation merely because a scanner reported a candidate.
- Never reactivate the suspected credential as rollback.

## Access Review

Review, without printing values:

- the current tree and relevant Git revisions;
- pull-request comments, workflow logs, summaries, caches, and artifacts;
- release archives, static bundles, package publications, and deployment logs;
- prompts, screenshots, issue text, shared notes, and copied configuration;
- forks, mirrors, clones, or downstream consumers that may retain the material;
- provider audit records for unexplained use, scope, and last activity.

A current-tree scan does not establish history coverage. A passing history scan
does not close content excluded by an allowlist. Record scanner scope and every
exception with the evidence.

## Git History Approval Gate

- Replace the committed or generated value with an environment lookup,
  managed-store reference, or public-safe placeholder.
- Correct the generation, logging, caching, or documentation path that created
  the exposure.
- Add or refine focused detection and regression coverage without copying the
  detected value into a test fixture.
- Review allowlists narrowly. Do not suppress an entire path when a precise,
  reviewed synthetic-fixture rule can express the intended exception.
- If historical removal is necessary, prepare a separate owner-approved plan
  covering backup, protected branches, tags, forks, contributor recovery,
  force-push impact, and post-rewrite validation.

No history rewrite, force-push, tag change, mirror update, or allowlist change
begins without explicit owner authorization and a reviewed recovery plan.

## Recovery Validation

- Provision a replacement with the minimum scopes and lifetime required.
- Store it according to the [Secret Storage Policy](SECRET_STORAGE.md).
- Validate the intended capability through a bounded, non-logging check.
- Confirm the old credential is invalid and cannot be restored by reverting a
  repository change.
- Run the approved redacted scanner and relevant repository checks, then record
  commands, exit status, scope, exceptions, and evidence links.
- Re-enable paused automation or services only after the incident lead approves
  the recovery evidence.

## Notification

- Notify affected owners and users according to impact, legal requirements,
  provider policy, and the root security policy.
- Public disclosure occurs only after containment and mitigation are available.
- Public records contain the incident category, affected release or revision,
  impact summary, remediation, and prevention work—not the credential value or
  sensitive infrastructure details.

## Post-Incident Review

The post-incident review records cause, control gap, timeline, impact, recovery,
failed or skipped checks, residual risk, and the next preventive action. It
does not reproduce the credential, private provider activity, or sensitive
infrastructure identifiers.

## Evidence And Closure

Closure requires evidence that:

- the original credential is revoked or otherwise invalid;
- the replacement, if any, is stored and scoped correctly;
- the current tree, relevant history, logs, artifacts, and downstream copies
  have explicit dispositions;
- detection and prevention controls cover the exposure path;
- skipped or unavailable checks remain recorded;
- follow-up goals own residual risk;
- the incident lead and security reviewer approve closure.

## Decision Matrix

| Exposure surface                   | Immediate action                                                           | Additional requirement                                                             |
| ---------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Current uncommitted file           | Stop propagation, remove the value, revoke if it may have left the machine | Confirm the file remains ignored and run a redacted working-tree check             |
| Committed current tree             | Revoke first, remove through a focused patch                               | Inspect relevant history and downstream copies                                     |
| Git history                        | Revoke first and preserve path-only evidence                               | Owner decision for narrow acceptance or coordinated history rewrite                |
| CI log, cache, or artifact         | Revoke and restrict access or retention                                    | Remove the artifact through the platform's supported process and inspect consumers |
| Published package or release       | Revoke and halt further distribution                                       | Issue a corrected artifact and coordinate disclosure or deprecation                |
| Prompt, issue, chat, or screenshot | Revoke and use the platform's private removal process                      | Review participants and retained copies without reproducing the value              |
| Unknown scope                      | Revoke and assume broader exposure                                         | Continue investigation until each major surface has a disposition                  |

## Known Issue 129 Limitation

[GitHub issue #129](https://github.com/emirhankudun-ux/SEIS/issues/129)
tracks a historical generated aggregate path that is currently excluded by a
path-level Gitleaks allowlist. The issue remains open. A successful scan while
that exception exists is conditional evidence: it does not prove the excluded
historical content is resolved.

Do not inspect or publish detected values, broaden the allowlist, close the
issue, rotate credentials, or rewrite history without the accountable owner's
decision. The approved disposition must record whether the material is
synthetic, already invalidated, accepted with a narrow exception, or subject to
credential rotation and coordinated history recovery.

## Recovery And Rollback Boundary

A compromised credential is never restored as a rollback. If a remediation
causes a service regression, revert only the application or configuration
change while keeping the compromised credential disabled. Provision a new
least-privilege credential or keep the capability unavailable until a safe
replacement is validated.

## Related Policies

- [Focused Security Policy](../SECURITY.md)
- [Public / Private Boundary](../PUBLIC_PRIVATE_BOUNDARY.md)
- [Secret Storage Policy](SECRET_STORAGE.md)
- [Security Baseline](security-baseline.md)
