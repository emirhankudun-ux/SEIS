# Security Hardening Proposal: Deterministic Local Secret Controls

## Decision

Select Option 1, **deterministic repository-local controls**, for the current
SEIS security-boundary implementation. Keep Option 2, **centralized ecosystem
security enforcement**, as a deliberate future alternative if several
canonical repositories need one stable contract or local controls repeatedly
drift.

This selection is an implementation direction, not a remediation claim. The
selected controls have since been implemented and validated in the local
working tree under the same focused Goal slice. They do not yet have a commit
SHA or remote CI evidence, and they do not resolve the historical exception
tracked by issue #129.

## Executive Recommendation

We have two serious options.

**Option 1: Deterministic repository-local controls** keeps the present
repository architecture and makes each important invariant executable: a
value-redacting environment-template check, focused ignore rules, a
non-installing redacted local wrapper, explicit read-only workflow permissions,
integrity-verifiable scanner acquisition, truthful summary states, canonical
storage and incident policies, and negative fixtures. This is the selected
option.

**Option 2: Centralized ecosystem security enforcement** moves policy,
scanner acquisition, exception ownership, validation, and evidence formatting
into a versioned shared package or isolated runner. Its strongest case is
cross-repository consistency. It also creates a new trusted supply-chain and
availability boundary that the current evidence does not yet justify.

I recommend Option 1 because I inspected the repository-local controls at
revision `db817330` and the highest-risk gaps are directly repairable in focused
files. We do not need a new service to stop a local wrapper from installing
tools, require redaction, give CI explicit permissions, or make conditional
scan evidence honest. Option 2 should win later if a stable local contract must
be consumed by several repositories and the ecosystem can own its release,
compatibility, and emergency rollback burden.

## Evidence

The evidence is a scoped control audit, not a formal Codex Security scan. The
complete integrity inventory is in [context.md](../context.md). The following
map defines each identifier used in this proposal.

| Evidence      | Finding or document                                                                                                | What it establishes                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `E001`        | Repository ignore policy — `.gitignore`                                                                            | Broad rules can hide future workflow, security-script, and security-document files from ordinary untracked-file inspection.                    |
| `E002`        | Public-safe environment template — `.env.example`                                                                  | A placeholder template exists, but no deterministic check owns the placeholder-only invariant.                                                 |
| `E003`        | Gitleaks policy and exceptions — `.gitleaks.toml`                                                                  | Default rules and focused synthetic exceptions coexist with a path-level historical exception.                                                 |
| `E004`        | Guardian security workflow — `.github/workflows/security-guardian.yml`                                             | Remote scanning is redacted, but permissions and scanner archive integrity are not explicit at the evidence revision.                          |
| `E005`        | Local secret-scan wrapper — `scripts/security/scan-secrets.sh`                                                     | The wrapper can install or elevate, does not request scan redaction, and suggests destructive history cleanup without an approval workflow.    |
| `E006`–`E010` | Security policies, boundary, baseline, and project manifest                                                        | Strong intent exists, but the storage lifecycle, incident process, and executable owner are fragmented or incomplete at the evidence revision. |
| `E011`        | Historical Gitleaks owner decision — [issue #129](https://github.com/emirhankudun-ux/SEIS/issues/129)              | The disposition of excluded historical content remains an open accountable-human decision.                                                     |
| `E012`        | Guardian scan for `db817330` — [run 29212479211](https://github.com/emirhankudun-ux/SEIS/actions/runs/29212479211) | The configured scan completed successfully, with configured exceptions still in effect.                                                        |

The observed facts are the file behaviors and current remote states above. We
infer one structural condition from them: no single executable boundary owns
the complete path from public template and ignored local storage through local
and remote scanning, exception disclosure, and credential-incident recovery.
That inference is narrower than a vulnerability claim. It explains why one
layer can look healthy while another remains unsafe or ambiguous.

## Current Design And Failure Mode

The current design relies on several controls that operate independently.
`.env.example` and `.gitignore` establish conventions. The local wrapper owns a
separate operational path and can change the workstation to acquire its tool.
The Guardian workflow owns remote full-history scanning but has its own
download and status semantics. Policy intent is split across repository and
documentation surfaces. Finally, the historical exception is configured in
Gitleaks while its owner decision is tracked elsewhere.

That separation is not inherently wrong; local enforcement is often the most
reliable design for a repository. The failure mode appears because the
boundaries are not mutually validated. A new control file can be ignored. A
local scan can be less redacted than CI. A successful remote scan can be
summarized without carrying its exception into the claim. A contributor can
discover a suspected credential without one precise, safe handoff for
revocation, recovery, and history decisions.

What gives me pause is not the number of files. It is the mismatch in authority:
the least supervised path—the local wrapper—has the most ability to install or
elevate, while the most consequential path—the historical exception—cannot be
resolved by automation and is not encoded as a completion blocker in the scan
result itself.

## Desired Invariants

- Every secret-named field in a public environment template is classified by a
  deterministic check that reports only the variable name, line, and category.
- Every local scan is redacted, non-installing, non-privileged, and free of
  provider, deployment, credential, or history-rewrite mutations.
- Every remote scan has explicit least-privilege permissions and an
  integrity-verifiable scanner distribution.
- Every scanner status distinguishes success, finding, cancelled, skipped,
  unavailable, and conditional success with exceptions.
- Every allowlist entry is narrow, documented, reviewable, and reflected in
  claims made from the scan result.
- Every suspected credential exposure enters one path-only incident process;
  only the accountable owner can authorize rotation, revocation, or history
  recovery.
- Every control can be rolled back independently without restoring a
  compromised credential or suppressing evidence.

## Constraints And Non-Goals

The design must remain public-safe, no-key, least privilege, and compatible with
the existing repository. It must not require a live provider, managed secret
store, deployment, SSH connection, or network call for local policy validation.
No performance or memory budget was supplied, so we will measure rather than
assert those effects.

This proposal does not inspect excluded historical content, decide whether it
is synthetic, rotate any credential, broaden an allowlist, rewrite Git history,
change a protected branch, or claim that the successful Guardian run proves
universal absence of secrets. It also does not make a central security service
a prerequisite for the local fix.

## Before Architecture

The [before diagram](../diagrams/deterministic-local-secret-controls-before.mmd)
shows control ownership at the same level used for both alternatives. The
important edges are the ambient local installation path, workflow-owned
scanner acquisition, and the separation between a historical exception and
its human decision. The policies influence the system by convention rather
than by one validated handoff.

## Options

### Option 1: Deterministic Repository-Local Controls

The attractive part of Option 1 is that we preserve familiar repository
workflows while making them harder to misinterpret or bypass. A small local
validator can own path rules, placeholder classification, canonical document
links, scanner redaction, workflow permissions, and summary-state semantics.
It must never print a candidate value: it can classify only names, lines,
patterns, and control presence. The local wrapper becomes a thin caller that
fails with setup guidance when the reviewed scanner is missing instead of
installing software or requesting elevation.

Remote scanning remains where full-history work belongs. The workflow uses
explicit read-only repository permissions, obtains Gitleaks through a reviewed
commit-pinned action or a version-and-digest-verified archive, and preserves
redaction. The result carries its scope and exception status into the summary.
If the scanner is cancelled, skipped, unavailable, or finds a candidate, the
summary cannot say that all checks succeeded.

This design does not eliminate every security risk. A repository-local
validator can drift if future repositories copy it manually, and Gitleaks
cannot prove absence outside its scope. More importantly, deterministic local
controls cannot decide issue #129. They can ensure the open exception remains
visible and prevents an overbroad completion claim while the owner makes that
decision.

The [Option 1 after diagram](../diagrams/deterministic-local-secret-controls-local-deterministic-controls-after.mmd)
shows the changed authority: local validation and scanning flow through
side-effect-free controls, remote scanning uses the same policy boundary, and
the historical exception ends at a human approval gate instead of an
autonomous mutation.

| Change                 | Before                                          | After                                                    | Security consequence                                 | Cost                                                            |
| ---------------------- | ----------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------- |
| Local tool acquisition | Wrapper may install or elevate                  | Wrapper fails safely with reviewed setup guidance        | Removes ambient installation and privilege authority | One explicit setup step for contributors                        |
| Output handling        | Local invocation does not require redaction     | Every scan invocation requires redaction                 | Reduces accidental value disclosure                  | Slightly less diagnostic detail; path/category evidence remains |
| Policy enforcement     | Conventions and documents are independent       | One deterministic validator checks their contract        | Detects drift before merge                           | Validator and fixtures require maintenance                      |
| Workflow authority     | Implicit default permissions                    | Explicit read-only permissions                           | Narrows CI authority                                 | A future write job needs a reviewed permission expansion        |
| Scanner acquisition    | Versioned archive without recorded digest check | Reviewed action revision or version plus digest          | Reduces substitution and supply-chain ambiguity      | Pin updates require deliberate maintenance                      |
| Status semantics       | Non-failure states can read as success          | Every terminal state is explicit                         | Prevents false assurance                             | More precise summary logic and tests                            |
| Historical exception   | Passing scan and open decision are separate     | Exception status is carried into evidence and completion | Preserves owner gate and residual-risk visibility    | Goal cannot be completed until disposition is explicit          |

Because Option 1 adds no service hop or persistent process, its performance and
memory mechanisms are modest: bounded metadata checks run locally, while the
existing full-history scan remains in CI. Reliability improves in missing-tool
and cancelled-job states because failure becomes deterministic. Rollback is
straightforward if work packages stay focused, although we must never roll back
by restoring unsafe redaction behavior or a compromised credential.

### Option 2: Centralized Ecosystem Security Enforcement

Option 2 makes the strongest case when we look beyond one repository. We would
publish a versioned security control package or operate an isolated runner that
owns policy parsing, scanner acquisition, exception schemas, status semantics,
and redacted evidence. Each canonical repository would pin that control rather
than copy its validator and workflow logic. A central exception register could
make owner, rationale, scope, expiry, and review status consistent across SEIS,
Eleni-Neferi, Pantechnoesis, and future projects without centralizing their
credential material.

The security gain is consistency, not magical detection. The central component
becomes highly trusted. If its release channel, runner credentials, or policy
update path is compromised, every consumer can inherit the error. A hosted
service also creates availability, queue, authentication, retention, and
observability questions. A reusable pinned action is lighter, but still needs
release ownership and a compatibility policy. We must therefore threat-model
the delivery form before claiming that centralization is stronger in practice.

What gives me pause today is operational asymmetry. The current evidence shows
focused repository-local defects, not repeated failures across several
consumers. Building central enforcement now would make a new platform component
critical before we have proven the contract locally. Its performance overhead
may be small for a packaged action or larger for a remote runner, but neither is
measured. Its reliability cost is clearer: a bad release or outage can block
every repository. Migration also requires dual enforcement until local and
central results agree.

The [Option 2 after diagram](../diagrams/deterministic-local-secret-controls-central-enforcement-after.mmd)
shows policy and enforcement moving into a shared trusted component. The
diagram deliberately keeps credentials out of that component; it centralizes
rules and evidence, not secret values.

| Change              | Before                                             | After                                           | Security consequence                     | Cost                                                        |
| ------------------- | -------------------------------------------------- | ----------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| Control ownership   | Repository conventions and scripts                 | Versioned shared package or isolated runner     | Reduces copy-and-drift risk              | Creates a high-trust supply-chain boundary                  |
| Policy distribution | Local document and configuration changes           | Pinned central policy bundle                    | Makes versions and consumers explicit    | Requires release, compatibility, and deprecation governance |
| Scanner execution   | Repository workflow owns acquisition               | Shared runner or action owns acquisition        | One integrity policy for consumers       | Adds setup, download, or service availability dependency    |
| Exceptions          | Repository-local configuration and issue           | Central schema with repository-specific entries | Improves expiry and owner visibility     | Central owner must preserve project-specific context        |
| Evidence            | Workflow-specific summaries                        | Common redacted evidence contract               | Improves portfolio comparison            | Retention and access policy need ownership                  |
| Failure containment | One repository is affected by a bad control change | Shared release can affect every consumer        | Consistency rises but blast radius grows | Requires pinned rollback and last-known-good operation      |

Option 2 is reversible only if consumers retain a known-good local or pinned
version path. A central runner that fails open is unacceptable; one that fails
closed without a recovery plan can halt every repository. I would be comfortable
advancing this option after Option 1 supplies stable fixtures, at least two
canonical repositories demonstrate identical needs, and an owner accepts the
release and incident burden.

## Comparison

The table summarizes direction, but the mechanisms above should drive the
decision. No composite score is used.

| Dimension   | Option 1: Local deterministic controls                                       | Option 2: Central enforcement                                                         |
| ----------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Security    | High-confidence improvement to inspected paths; historical exception remains | Potentially stronger cross-repository consistency; new central trust and blast radius |
| Performance | Likely neutral; bounded metadata checks plus existing CI scan                | Unknown to modest regression from package setup or a runner hop                       |
| Memory      | Likely neutral; no retained process state                                    | Unknown until action versus service delivery is chosen                                |
| Reliability | Safer missing-tool and status behavior; failures remain repository-scoped    | Shared updates improve parity but can block every consumer                            |
| Operability | One local command, policies, fixtures, and normal CI maintenance             | Package/service ownership, compatibility, observability, and release recovery         |
| Migration   | Focused, independently revertible work packages                              | Dual enforcement and consumer-by-consumer migration required                          |

## Recommendation

I recommend Option 1 under the current constraints. We can directly address the
observed behavior with the smallest new authority and validate each invariant
using synthetic, value-free negative fixtures. It is proportionate to the
evidence and keeps the repository usable offline and without credentials.

We should change the recommendation if local controls repeatedly diverge across
canonical repositories, if a shared compliance contract becomes a release
requirement, or if a reviewed isolated runner materially reduces supply-chain
risk without introducing unacceptable availability or retention concerns. At
that point, Option 1's tests and evidence contract become the migration oracle
for Option 2 rather than discarded work.

## Evidence Coverage And Residual Risk

| Evidence                                               | Option 1 effect               | Option 2 effect                          | Tactical work still required                                       |
| ------------------------------------------------------ | ----------------------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| `E001` — Repository ignore policy                      | Addresses                     | Addresses                                | Yes: focused ignore rules and regression fixture                   |
| `E002` — Public-safe environment template              | Addresses                     | Addresses                                | Yes: value-redacting placeholder validator                         |
| `E003` — Gitleaks policy and exceptions                | Mitigates                     | Mitigates                                | Yes: owner disposition for historical exception remains separate   |
| `E004` — Guardian security workflow                    | Addresses                     | Addresses                                | Yes: permissions, integrity, and status semantics                  |
| `E005` — Local secret-scan wrapper                     | Addresses                     | Addresses during migration               | Yes: remove installation/elevation authority and require redaction |
| `E006`–`E010` — Policies, boundary, baseline, manifest | Addresses                     | Addresses                                | Canonical links and executable parity must remain tested           |
| `E011` — Historical Gitleaks owner decision            | Mitigates only                | Mitigates only                           | Accountable human must decide the disposition                      |
| `E012` — Successful configured scan                    | Preserves with narrower claim | Preserves under shared evidence contract | Remote scan must run again at the implementation revision          |

Residual risk remains explicit. A scanner can miss novel encodings or surfaces
outside its scope. A redacted result still needs secure retention. A committed
value may persist in clones, artifacts, or provider audit history after a source
patch. The selected design reduces recurrence and false assurance; it does not
replace revocation, downstream investigation, or the owner decision for known
exceptions.

## Migration And Rollout

We should introduce Option 1 in independently reviewable packages while the
current redacted remote scan remains active. First add the deterministic
validator and negative fixtures. Next make the local wrapper side-effect free.
Then harden workflow permissions, acquisition integrity, and status semantics.
Finally tighten ignore rules and wire the new check into the foundation gate.

During migration, the historical allowlist remains unchanged and visibly
linked to issue #129. A finding does not trigger automated rotation or history
cleanup; it triggers the credential incident runbook. Each package must be
revertible without weakening redaction or hiding the open decision. The
selected ordered plan is in
[implementation/local-deterministic-controls.md](../implementation/local-deterministic-controls.md).

## Validation Plan

- Parse every JSON, YAML, and Markdown artifact with repository-appropriate
  tools and run link/path checks.
- Prove the environment validator rejects a non-placeholder secret field while
  emitting only variable name, line, and category.
- Prove required control paths are not silently ignored and unrelated local
  artifacts remain excluded.
- Run the local wrapper with the scanner absent and confirm it performs no
  installation or elevation and returns a documented nonzero status.
- Run value-free synthetic scanner fixtures and confirm redaction in local and
  CI output.
- Exercise success, finding, cancelled, skipped, and unavailable workflow
  states in logic-level tests.
- Verify the scanner acquisition against a reviewed action revision or expected
  digest before execution.
- Run the ecosystem foundation, security-boundary, legacy governance, and diff
  checks after each package.
- Run Guardian CI at the implementation revision and record the exact run URL,
  scope, and exception state.
- Conduct a credential-free incident tabletop covering containment, owner
  authorization, recovery, and the rule that a compromised credential is never
  restored as rollback.

No benchmark result is claimed here. Implementation should record local
validator wall time and remote job duration before and after; a material
regression requires investigation rather than an invented threshold.

## Implementation Work Packages

- `WP1` — Deterministic boundary validator and value-free negative fixtures.
- `WP2` — Non-installing, non-privileged, redacted local scanner wrapper.
- `WP3` — Explicit read-only workflow permissions, integrity-verifiable scanner
  acquisition, and truthful terminal-state summaries.
- `WP4` — Focused ignore rules that protect secrets without hiding security
  controls.
- `WP5` — Canonical command wiring, remote evidence, and security-baseline
  reconciliation.
- `WP6` — Separate accountable-human decision for issue #129; no autonomous
  mutation is included.

## Open Questions

- Should canonical Gitleaks acquisition use a commit-pinned reviewed action or
  a version-and-digest-verified release archive?
- Which exit codes should distinguish unavailable tooling, findings, invalid
  policy, and internal scanner failure across local and CI paths?
- What exact owner-approved disposition will close or narrow issue #129?
- When should stable local fixtures graduate into a shared ecosystem package?
- Which maintainer owns periodic exception expiry and scanner pin review?
