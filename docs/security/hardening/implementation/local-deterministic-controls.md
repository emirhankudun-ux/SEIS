# Implementation Plan: Deterministic Repository-Local Controls

## Selected Design And Constraints

The selected design is Option 1 from the
[hardening proposal](../proposals/deterministic-local-secret-controls.md):
repository-local, deterministic, least-privilege controls for template,
ignore, scanner, workflow, policy, incident, and evidence invariants.

The implementation must remain no-key and public-safe. It must not print or
store values, install tools, elevate privileges, call providers, connect over
SSH, deploy, rotate credentials, broaden allowlists, rewrite history, or close
issue #129. The historical exception remains a human decision gate.

WP1 through WP5 are present and validated in the local working tree as of
2026-07-13. `check:security-boundary`, `test:security-boundary`, ecosystem
foundation validation and negative tests, shell syntax, foundation, legacy goal
tracking, SEIS audit, formatting, and diff checks passed locally. The
implementation commit is `785c346d`; remote CI evidence remains pending, and
WP6 remains an explicit human decision.

## Source Revision And Drift Check

The proposal is anchored to source revision
`db81733053c94a28c1d404d76ca37c152f783c07` and evidence collection digest
`16a96299ac3736a1d96920187b19203656a1e77e2803323debdabae9985ca743`.
A formal Codex Security scan was not run.

Derived documentation and parallel implementation work created working-tree
drift after the evidence snapshot. Before each executable work package, refresh
and inspect `.gitignore`, `.env.example`, `.gitleaks.toml`, the Guardian and
foundation workflows, the local wrapper, package scripts, and the active Goal.
If drift changes the scanner authority, exception semantics, or public/private
boundary, return to design review instead of silently adapting this plan.

## Affected Components

- `.gitignore`
- `.env.example`
- `.gitleaks.toml` only for validation unless issue #129 receives a separate
  owner-approved decision
- `.github/workflows/security-guardian.yml`
- `.github/workflows/foundation-check.yml`
- `scripts/security/scan-secrets.sh`
- deterministic validator and negative fixtures under `scripts/`
- `package.json` command wiring
- `docs/SECURITY.md`, `docs/PUBLIC_PRIVATE_BOUNDARY.md`, and `docs/security/`
- `goals/active/ECO-GOAL-0002--security-and-local-secret-boundary.yaml`

## Ordered Work Packages

### WP1 — Deterministic Boundary Validator

Implement one no-dependency local validator that checks:

- secret-named `.env.example` entries are public-safe placeholders;
- diagnostics contain variable name, line, and category, never the value;
- required secret and local-data ignore patterns exist;
- workflow, security-script, and security-document paths are not silently
  hidden by broad ignore rules;
- scanner invocations require redaction;
- Guardian workflow permissions are explicit and least privilege;
- security summaries fail closed for finding, cancelled, skipped, unavailable,
  or invalid states;
- canonical policy, incident, hardening, and Goal links resolve.

Add synthetic negative fixtures that use clearly non-secret sentinel categories
rather than credential-shaped material. The tests must assert both exit status
and absence of the input value from output.

### WP2 — Safe Local Scanner Boundary

Refactor the local wrapper so it:

- never downloads, installs, invokes a package manager, or elevates privileges;
- exits with a documented unavailable-tool status and reviewed setup guidance
  when Gitleaks is absent;
- always uses redaction and the repository configuration;
- distinguishes finding, unavailable, invalid configuration, and internal
  failure states;
- points findings to the credential incident runbook;
- never recommends or performs rotation, allowlist expansion, or history
  rewriting.

Preserve shell portability deliberately and keep shell syntax validation in the
test plan.

### WP3 — Guardian Workflow Hardening

Give the workflow explicit `contents: read` permission unless an inspected step
requires less. Acquire Gitleaks through a reviewed commit-pinned action or a
version-and-digest-verified archive. Do not rely on a floating release or an
unverified download.

Keep full-history checkout and redaction. Make summaries reflect every terminal
state and preserve the fact that configured exceptions remain in effect.
Keep dependency auditing semantically separate from secret-scan success unless
the repository explicitly chooses it as a blocking security gate.

### WP4 — Focused Ignore Policy

Replace broad exclusions that hide control paths with focused local-artifact
rules. Explicitly cover environment files, credential files, secret
directories, private local data, SSH and signing material, and machine-local
reports. Preserve tracked public templates, workflows, security scripts,
security documentation, schemas, and approved fixtures.

Before changing ignore rules, list ignored untracked files by path only. Do not
stage newly visible files automatically. Classify each surfaced path before
inclusion or continued exclusion.

### WP5 — Command, CI, And Evidence Wiring

Add focused package commands for validation and negative tests, then invoke
them from the foundation workflow. Run compatibility checks so the new gate
does not replace existing ecosystem, governance, SSH, or provider-boundary
checks.

Update the active Goal with exact commands, exit codes, implementation
revision, remote run links, failed or skipped checks, risks, and rollback. A
local pass moves evidence to `implemented locally / remote evidence pending`;
only a successful remote run at the implementation revision can satisfy the
remote CI evidence item.

### WP6 — Historical Exception Owner Decision

Keep this work package separate from the deterministic controls. The
accountable human chooses one redacted disposition for issue #129: confirmed
synthetic with a narrow exception, already invalidated with evidence, accepted
residual risk with expiry and owner, or credential rotation plus coordinated
history recovery.

No automation inspects or publishes a value, changes the existing allowlist,
rotates a credential, force-pushes, rewrites history, or closes the issue.

## Compatibility And Migration

Land WP1 through WP5 as focused commits or PR slices while the current redacted
Guardian scan remains active. Preserve existing command names when practical,
and add aliases only when they reduce migration risk. Keep the historical
allowlist unchanged until WP6 has an owner-approved decision.

The repository remains usable without Gitleaks for deterministic policy checks;
the local scan reports unavailable rather than installing a dependency. Remote
CI remains the authoritative configured full-history scan.

## Tactical Protections During Migration

- Keep all existing redaction in the Guardian workflow.
- Keep real environment files and key material ignored.
- Keep the current historical exception visible and linked to issue #129.
- Do not remove root `SECURITY.md` reporting guidance.
- Do not convert unavailable credentials into demo/live ambiguity.
- Do not stage files that become visible after ignore-rule changes without a
  path-only review.

## Tests And Security Validation

- JSON, YAML, shell, Markdown, Mermaid, and link/path syntax checks.
- Negative template fixture with output-redaction assertion.
- Ignore-rule fixtures for required secret classes and visible control paths.
- Wrapper tests for missing tool, finding, invalid config, and internal error.
- Workflow assertions for explicit permissions, integrity verification,
  redaction, full-history checkout, and terminal-state summaries.
- `npm run check:security-boundary`
- `npm run test:security-boundary`
- `npm run check:ecosystem-foundation`
- `npm run test:ecosystem-foundation`
- `npm run check:foundation`
- `npm run seis:check`
- `bash -n scripts/security/scan-secrets.sh`
- `git diff --check`
- Guardian pull-request run at the implementation revision.

Every reported result includes exact command, exit status, revision, scope,
exceptions, and link when remote. Formal Codex Security scan status remains
`not run` unless a separate exhaustive scan is actually completed.

## Performance And Resource Benchmarks

Record local validator wall time and peak resident memory on the repository
before and after integration. Record Guardian job duration for the previous and
candidate revision. No target is invented in advance; investigate any material
increase that affects normal contributor feedback or CI timeout margin.

The validator must process bounded metadata and must not load Git history or
serialize repository file contents. Gitleaks remains the history scanner.

## Rollout And Rollback

Roll out in work-package order and run the focused plus compatibility checks
after each package. Do not merge while required checks are pending or failed.
If a package regresses repository operation, revert that package and preserve
the last-known-good redacted scan path.

Rollback never restores a compromised credential, a non-redacted output path,
an ambient installer, or a misleading success state. If a credential incident
is active, keep the capability disabled until a new least-privilege credential
is validated through the incident runbook.

## Acceptance Criteria

- Public templates fail deterministically on non-placeholder secret fields
  without revealing the input value.
- Required secret classes remain ignored while workflow, script, and security
  policy paths remain visible to Git.
- The local wrapper is redacted, non-installing, non-privileged, and
  side-effect free except for its exit status.
- Guardian CI has explicit least-privilege permissions and
  integrity-verifiable scanner acquisition.
- Security summaries represent every terminal state honestly and preserve
  exception limitations.
- Canonical secret-storage, public/private, incident, hardening, and Goal links
  resolve.
- Local focused and compatibility checks pass with exact evidence.
- Remote Guardian and foundation checks pass at the implementation revision.
- Issue #129 remains open or has an explicit owner-approved redacted
  disposition; automation does not infer closure.

## Open Decisions

- Canonical scanner distribution: reviewed action revision or release archive
  plus digest.
- Exact stable exit-code contract for unavailable tooling and scanner errors.
- Ownership and review cadence for Gitleaks pins and exception expiry.
- Owner disposition and recovery path for issue #129.
- Threshold for promoting proven local controls into a shared ecosystem
  package.
