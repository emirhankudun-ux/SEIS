# ADR-0002: Ecosystem Governance Bootstrap Ownership

## Status

Proposed

## Context

`ECO-GOAL-0001` needs one coordination surface while preserving singular
product ownership across SEIS, Eleni-Neferi, and Pantechnoesis.

Read-only repository identity evidence observed in the authenticated session
currently establishes:

- public `emirhankudun-ux/SEIS`, default branch `main`;
- private `emirhankudun-ux/Eleni-Neferi-`, default branch `main`;
- private `emirhankudun-ux/Pantechnoepistemonoesis`, default branch `main`.

An isolated SEIS worktree and valid fresh private clones now confirm all three
canonical repositories without storing machine-specific paths. Each repository
has an authenticated point-in-time manifest review observation with a matching
review/CI head and passing required checks. The SEIS evidence is public; private
commit, PR, and Actions identifiers are reduced to SHA-256 digests and a
public-safe attestation. None of the observed canonical `main` revisions
contains `project.ecosystem.yaml`, so all three records remain in `review`.

External validation cannot safely depend on sibling filesystem access. Private
manifests must remain in their canonical repositories, while this public-safe
registry records only expected identity/visibility metadata, public SEIS
evidence, and a metadata-only private attestation.

## Decision

1. SEIS is the proposed bootstrap coordinator for the ecosystem Goal schemas,
   ownership registry, validation, and public-safe navigation artifacts.
2. This coordination role does not give SEIS ownership of Eleni-Neferi identity,
   media, provenance, or rights modules.
3. This coordination role does not give SEIS ownership of Pantechnoesis AI,
   routing, research, MCP, agent, or knowledge modules.
4. Eleni-Neferi and Pantechnoesis remain the canonical owners of their product
   domains by repository identity. Their manifest revisions have public-safe
   attested review evidence, but canonical readiness remains blocked until
   review, merge, and a refreshed observed `main` revision.
5. Cross-repository sharing must use documented one-way generation, read-only
   mirrors, or versioned packages. Blind bidirectional synchronization is not
   allowed.
6. The proposed inventory uses exact, non-overlapping module paths for Eleni
   identity and brain, native core, public experience, and Oracle routing; and
   for Pantechnoesis 9Router, agent governance, engineering labs, and MCP
   governance.
7. Consumer mappings are structured contracts with repository, optional path,
   observed/planned state, one-way distribution mode, compatibility, and
   typed evidence. Public consumers require repository-bound GitHub artifacts
   plus distribution-bound attestations; private consumers require
   schema-bound public-safe attestations and revision digests.
8. The separately paired Greek identity repository remains a pending decision.
   Authenticated lookup did not find the requested canonical target; an
   ambiguous private candidate remains redacted and unassigned. A pairing record
   or candidate existence is not identity proof and must not be converted into
   invented ownership.
9. Human architecture review is required before this decision can be accepted
   and `ECO-GOAL-0001` can be completed.

## Consequences

- Ecosystem governance can advance in a valid SEIS worktree without claiming
  that the private repositories' manifests are published or validated.
- Product identity and security boundaries remain explicit.
- The registry can name canonical product-family owners and a proposed audited
  module inventory while keeping all three open manifest changes visibly in
  review.
- External manifest validation is portable: public evidence or a checked
  public-safe attestation replaces sibling-worktree paths, and no private
  manifest or operational identifier is copied into SEIS.
- Planned consumers no longer imply that distribution or compatibility was
  observed.
- SEIS temporarily carries governance bootstrap maintenance until a future
  accepted architecture decision assigns a different canonical coordinator.
- Cross-repository completion requires separate authorized work in both private
  repositories and cannot be proven by this SEIS pull request alone.

## Alternatives Considered

### Make SEIS the owner of every ecosystem module

Rejected because it would create a false source of truth and erase distinct
project identities and private-repository boundaries.

### Leave all non-SEIS ownership unknown

Rejected because the fresh-clone and authenticated remote observations already
establish the safe product-family boundary. Keeping that boundary unknown would
increase the risk of accidental consolidation.

### Trust sibling worktrees as external manifest evidence

Rejected because it is machine-specific, bypasses canonical repository review,
and could copy private repository content into the public coordinator.

### Use bidirectional subtree synchronization

Rejected because it creates competing canonical sources and ambiguous rollback.

## Security and Privacy

Only public-safe repository identity metadata, expected manifest fields,
SHA-256 revision digests, and a metadata-only attestation may be recorded in
SEIS for private repositories. Private revisions, PR numbers, Actions run
identifiers, manifests, contents, secrets, credentials, logs, personal memory,
and assets are out of scope. A private repository's manifest must describe its
actual private boundary and remain in that repository.

## Migration and Rollback

No data or repository migration is authorized. Roll back by reverting the
focused governance commit and restoring the prior documentation links and
ownership registry. Do not delete repositories, rewrite Git metadata, or alter
remote visibility as part of rollback.

## Follow-up

1. Review and accept or revise this ADR.
2. Complete review and merge of SEIS PR 177 and the two private draft PRs.
3. Refresh each observed canonical `main` revision and promote manifest status
   from `review` to `validated` only when the revision matches.
4. Review the proposed module inventory and structured consumer mappings.
5. Obtain explicit human confirmation of the exact Greek target or defer Greek
   publication; inspect any selected candidate before extending the registry.
6. Run the local validators and obtain reviewed remote CI evidence before Goal
   completion.
