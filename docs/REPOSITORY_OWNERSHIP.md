# Ecosystem Repository Ownership

Status: bootstrap, public-safe, and incomplete

Goal: `ECO-GOAL-0001`

The machine-readable source of truth is
[`data/repository-ownership.yaml`](../data/repository-ownership.yaml). This
document explains the current evidence and does not authorize repository moves,
deletions, bidirectional synchronization, or writes to unverified folders.

## Current repository evidence

| Repository    | Canonical remote                          | Visibility | Observed `main`       | Local worktree | Manifest at observed revision | Registry validation                                                |
| ------------- | ----------------------------------------- | ---------- | --------------------- | -------------- | ----------------------------- | ------------------------------------------------------------------ |
| SEIS          | `emirhankudun-ux/SEIS`                    | public     | `38031939`            | valid          | missing                       | `review`; PR 177 has revision-bound passing CI evidence             |
| Eleni-Neferi  | `emirhankudun-ux/Eleni-Neferi-`           | private    | digest-attested       | valid clone    | missing                       | `review`; public-safe attestation records open draft and passing CI |
| Pantechnoesis | `emirhankudun-ux/Pantechnoepistemonoesis` | private    | digest-attested       | valid clone    | missing                       | `review`; public-safe attestation records required/global CI pass   |

The dated observation used the isolated SEIS worktree, fresh valid private
clones, and authenticated remote metadata without recording a machine-specific
path. The public repository keeps its full observed revision; private revision
identifiers are represented only by SHA-256 digests. Canonical remote identity,
local-worktree validity, observed-`main` content, and manifest validation remain
separate facts. The
SEIS manifest is validated on its review branch but is not claimed as present
on the observed `main` revision. Uncommitted manifest work in another worktree
is not evidence that a canonical private repository contains or has validated
a manifest.

Each repository entry therefore records a `manifest_validation` contract:

- `pending`, `review`, `validated`, or `rejected` status plus ordered history;
- repository-relative manifest path, an immutable reviewed revision or
  public-safe digest, and a separate canonical revision reference after merge;
- expected project id, canonical owner, visibility, and `public_repo` value;
- revision-bound public GitHub evidence or a repository-local public-safe
  attestation for private review metadata.

For SEIS, the validator also reads the local manifest and compares its contents
with those expected fields. For external private repositories, the validator
must not read sibling worktrees, copy their manifests, or publish private
commit, PR, or Actions identifiers. `review` records an authenticated
point-in-time observation of an open pull request and successful revision-bound
CI, but the manifest is not yet claimed on canonical `main`. `validated`
additionally requires a merged observation and a revision reference matching
the observed canonical revision. The validator enforces
`pending -> review -> validated|rejected`. A normal merge or squash may create a
canonical revision different from the reviewed PR revision; validation keeps
those references separate and requires an explicit content-match observation.
The deterministic check validates recorded evidence
consistency but does not make network calls or continuously monitor GitHub.

## Current manifest review evidence

- SEIS
  [revision `f772b6f364e49d438113b2d51f2e20027ae9f6b4`](https://github.com/emirhankudun-ux/SEIS/commit/f772b6f364e49d438113b2d51f2e20027ae9f6b4):
  [PR 177](https://github.com/emirhankudun-ux/SEIS/pull/177) and
  [Foundation Check](https://github.com/emirhankudun-ux/SEIS/actions/runs/29212479194).
  The manifest-introducing revision is an observed ancestor of the current PR
  head, the manifest path is unchanged there, and the cited check ran
  successfully on that current head.
- Eleni-Neferi and Pantechnoesis private review state is recorded in the
  [public-safe attestation](../data/evidence/ECO-GOAL-0001-private-manifest-review.yaml).
  It confirms open drafts, matching review/CI heads, and passing required
  checks without publishing private commit identifiers, PR numbers, Actions
  run identifiers, contents, or logs. The optional Pantechnoesis paired-Greek
  check was skipped; the required/global check passed, and the skip does not
  verify the paired repository.

SEIS is the bootstrap coordinator because it has the current valid worktree and
governance foundation. That limited coordination role does not transfer
ownership of Eleni identity modules or Pantechnoesis AI and knowledge modules
to SEIS. The proposed decision is recorded in
[`ADR-0002`](adr/0002-ecosystem-governance-bootstrap-ownership.md).

## Proposed owned-module inventory

| Module                           | Canonical repository | Paths summary                                           | Decision |
| -------------------------------- | -------------------- | ------------------------------------------------------- | -------- |
| `seis-product-platform`          | `seis`               | `apps`, `packages`                                      | accepted |
| `ecosystem-governance-bootstrap` | `seis`               | constitution, manifest, registry, ownership docs, Goals | proposed |
| `eleni-identity-and-brain`       | `eleni-neferi`       | identity docs, brain docs/data, `neferi-brain`          | proposed |
| `eleni-native-core`              | `eleni-neferi`       | Swift package, sources, tests, native architecture docs | proposed |
| `eleni-public-experience`        | `eleni-neferi`       | web app, design/visual data and docs                    | proposed |
| `eleni-oracle-routing`           | `eleni-neferi`       | AI router source, AI data, AI docs                      | proposed |
| `pantech-9router`                | `pantechnoesis`      | router source, AI content/docs, 9Router docs            | proposed |
| `pantech-agent-governance`       | `pantechnoesis`      | agent content and operating docs                        | proposed |
| `pantech-engineering-labs`       | `pantechnoesis`      | executable labs and engineering content/docs            | proposed |
| `pantech-mcp-governance`         | `pantechnoesis`      | MCP registry and exact MCP governance records           | proposed |

Every recorded path is exact and non-overlapping within its canonical
repository. The inventory is still proposed: it establishes an audited review
surface but does not make the private manifests validated or ADR-0002 accepted.

## Consumer mappings

Consumers are structured records rather than repository id strings. A mapping
records the consumer repository, optional repository-relative consumer path,
observed or planned status, one-way distribution mode, compatibility state,
and typed evidence. Observed public consumers require an exact revision-bound
commit artifact in the recorded consumer repository plus a schema-bound
distribution attestation. Pull-request, CI-run, and release URLs remain
unsupported until their revision relationships have explicit contracts.
Observed private consumers may use only a schema-bound public-safe
attestation under `data/evidence/`. Both forms must match the module, consumer
repository and path, distribution mode, compatibility state, and revision;
private revisions use only SHA-256 digests.
Unknown repositories, duplicate consumer repositories, absolute paths, and
paths that escape a repository are rejected. Case-folded path collisions are
also rejected for the ecosystem's common case-insensitive macOS worktrees. The
two governance consumers are currently `planned`, `manual-adoption`, and
`not-validated`; no distribution is claimed.

The Pantechnoesis governance inventory also references a separately paired
Greek identity repository. Authenticated read-only lookup did not find the
requested canonical target. A private ambiguous candidate exists, but its
identity alignment is unverified and its identifier is intentionally withheld
from this public registry. The
[public-safe target attestation](../data/evidence/ECO-GOAL-0001-greek-repository-target-attestation.yaml)
therefore keeps this as a human-approval decision; no repository, module,
remote, or synchronization ownership is invented for the ambiguous candidate.

## Validation contract

Run:

```bash
npm run check:ecosystem-foundation
npm run test:ecosystem-foundation
```

The check validates the SEIS manifest, ownership registry, and blocked
`ECO-GOAL-0001` record. It rejects duplicate repository or module ids,
duplicate or overlapping owned paths, false external manifest validation,
missing or cross-repository manifest evidence, illegal or skipped manifest
lifecycle transitions, expected identity/visibility mismatches, malformed
GitHub repository identities, unknown or duplicate consumers, unbound consumer
evidence, case-folded ownership collisions, unsafe consumer paths, invalid
status-directory mappings, and canonical claims without dated observation
metadata. Secret-pattern checks also include every manifest or consumer
attestation referenced by the registry, including comments ignored by YAML.

Passing this check proves the local SEIS registry is structurally consistent
and that its recorded public evidence or private attestation fields agree. The
authenticated observations were also checked live on the recorded date, but
the deterministic validator does not query GitHub. Neither result proves the
open pull requests were later approved or merged, that the manifests are
present on canonical `main`,
that planned consumers received an artifact, that the Greek paired repository
was verified, or that human review accepted the proposed ownership decision.

The [completion audit and human decision packet](reviews/ECO_GOAL_0001_COMPLETION_AUDIT.md)
maps every Goal requirement, acceptance criterion, Definition of Done item,
quality gate, dependency, and blocker to evidence or an exact remaining action.
Its machine-readable source is validated with the ownership foundation and
records `blocked`; the audit does not authorize merge, retarget, publication,
or Goal promotion.

## Current unblock requirements

- Complete review and merge of all three manifest pull requests through each
  repository's policy, then refresh observed `main` revisions and promote the
  manifest records from `review` to `validated`.
- Review the proposed shared-module paths and structured consumer mappings,
  then accept or revise ADR-0002.
- Obtain explicit human confirmation of the exact Greek target or a decision to
  defer Greek publication. Inspect any selected candidate under least privilege
  before adding identity, visibility, module, remote, or consumer claims.
- Preserve the successful pull-request CI evidence while completing the private
  manifests and ownership review; CI success does not prove those missing
  cross-repository artifacts.

## Rollback

Revert the focused governance commit. No data migration, repository move,
remote mutation, or synchronization is part of this slice.
