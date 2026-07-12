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

Only SEIS has a valid local worktree and a present project manifest in this
slice. The top-level Eleni-Neferi and Pantechnoesis candidates have incomplete
Git metadata, and both private canonical remotes lack
`project.ecosystem.yaml`. Remote identity verification does not make those
local folders safe to edit or prove their contents and CI.

## Decision

1. SEIS is the proposed bootstrap coordinator for the ecosystem Goal schemas,
   ownership registry, validation, and public-safe navigation artifacts.
2. This coordination role does not give SEIS ownership of Eleni-Neferi identity,
   media, provenance, or rights modules.
3. This coordination role does not give SEIS ownership of Pantechnoesis AI,
   routing, research, MCP, agent, or knowledge modules.
4. Eleni-Neferi and Pantechnoesis remain the canonical owners of their product
   domains by repository identity. Implementation readiness remains blocked
   until each private repository has a valid worktree and validated manifest.
5. Cross-repository sharing must use documented one-way generation, read-only
   mirrors, or versioned packages. Blind bidirectional synchronization is not
   allowed.
6. A complete shared-module inventory and human review are required before this
   decision can be accepted and `ECO-GOAL-0001` can be completed.

## Consequences

- Ecosystem governance can advance in a valid SEIS worktree without claiming
  that private product repositories are locally ready.
- Product identity and security boundaries remain explicit.
- The registry can name canonical product-family owners now, while keeping
  manifest publication and cross-repository inventory visibly blocked.
- SEIS temporarily carries governance bootstrap maintenance until a future
  accepted architecture decision assigns a different canonical coordinator.
- Cross-repository completion requires separate authorized work in both private
  repositories and cannot be proven by this SEIS pull request alone.

## Alternatives Considered

### Make SEIS the owner of every ecosystem module

Rejected because it would create a false source of truth and erase distinct
project identities and private-repository boundaries.

### Leave all non-SEIS ownership unknown

Rejected because session-observed repository identities already establish the safe
product-family boundary. Keeping that boundary unknown would increase the risk
of accidental consolidation.

### Repair or overwrite the invalid local Git metadata

Rejected for this slice because it is destructive, unnecessary for the local
governance artifacts, and lacks explicit authorization and rollback evidence.

### Use bidirectional subtree synchronization

Rejected because it creates competing canonical sources and ambiguous rollback.

## Security and Privacy

Only public-safe repository identity metadata may be recorded in SEIS. Private
repository contents, secrets, credentials, logs, personal memory, and assets are
out of scope. A private repository's manifest must describe its actual private
boundary and must be created in an authorized valid worktree.

## Migration and Rollback

No data or repository migration is authorized. Roll back by reverting the
focused governance commit and restoring the prior documentation links and
ownership registry. Do not delete repositories, rewrite Git metadata, or alter
remote visibility as part of rollback.

## Follow-up

1. Review and accept or revise this ADR.
2. Create valid non-default worktrees for the two private repositories through
   owner-authorized workflows.
3. Add and validate each missing `project.ecosystem.yaml` in its canonical
   repository.
4. Complete the shared-module and consumer inventory across all three valid
   repositories.
5. Run the local validators and obtain reviewed remote CI evidence before Goal
   completion.
