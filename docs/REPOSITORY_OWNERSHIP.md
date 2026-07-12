# Ecosystem Repository Ownership

Status: bootstrap, public-safe, and incomplete

Goal: `ECO-GOAL-0001`

The machine-readable source of truth is
[`data/repository-ownership.yaml`](../data/repository-ownership.yaml). This
document explains the current evidence and does not authorize repository moves,
deletions, bidirectional synchronization, or writes to unverified folders.

## Current repository evidence

| Repository    | Canonical remote                          | Visibility | Default | Local worktree | Manifest                      | Evidence boundary                                                                                                                                 |
| ------------- | ----------------------------------------- | ---------- | ------- | -------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEIS          | `emirhankudun-ux/SEIS`                    | public     | `main`  | valid          | present and locally validated | Clean isolated worktree created from local `origin/main`.                                                                                         |
| Eleni-Neferi  | `emirhankudun-ux/Eleni-Neferi-`           | private    | `main`  | invalid        | missing                       | Remote identity metadata was observed read-only through the authenticated connector; the top-level local candidate has incomplete Git metadata.   |
| Pantechnoesis | `emirhankudun-ux/Pantechnoepistemonoesis` | private    | `main`  | invalid        | missing                       | Remote identity metadata was observed read-only through the authenticated connector; the top-level local candidates have incomplete Git metadata. |

Canonical remote identity, local-worktree validity, manifest readiness, and CI
evidence are separate facts. A dated session observation of a private remote
does not make an invalid local folder writable, prove all repository contents,
or satisfy the manifest gate. CI does not reverify the private remotes.

SEIS is the bootstrap coordinator because it has the current valid worktree and
governance foundation. That limited coordination role does not transfer
ownership of Eleni identity modules or Pantechnoesis AI and knowledge modules
to SEIS. The proposed decision is recorded in
[`ADR-0002`](adr/0002-ecosystem-governance-bootstrap-ownership.md).

## Owned modules

| Module                            | Canonical repository | Decision                   | Sync direction                             |
| --------------------------------- | -------------------- | -------------------------- | ------------------------------------------ |
| `seis-product-platform`           | `seis`               | accepted                   | canonical only                             |
| `ecosystem-governance-bootstrap`  | `seis`               | proposed                   | canonical to consumers only after approval |
| `eleni-identity-platform`         | `eleni-neferi`       | proposed identity boundary | canonical only                             |
| `pantechno-ai-knowledge-platform` | `pantechnoesis`      | proposed identity boundary | canonical only                             |

The product-family ownership boundaries above prevent accidental consolidation;
they do not claim those private repositories are implementation-ready. Their
missing manifests and invalid local candidates keep cross-repository execution
blocked. Shared modules beyond this product-family baseline still require a
complete inventory and an accepted follow-up decision.

## Validation contract

Run:

```bash
npm run check:ecosystem-foundation
npm run test:ecosystem-foundation
```

The check validates the SEIS manifest, ownership registry, and active
`ECO-GOAL-0001` record. It rejects duplicate repository ids, duplicate module
ids, duplicate owned paths, unknown canonical owners, invalid status-directory
mappings, and canonical claims for repositories without dated observed metadata.
The negative test injects duplicate path ownership into a temporary fixture and
requires the validator to reject it.

Passing this check proves only the local SEIS bootstrap files are structurally
consistent. It does not prove that valid Eleni-Neferi or Pantechnoesis
worktrees exist, that their manifests were published, that every shared module
has been inventoried, or that remote GitHub CI accepted the change.

## Current unblock requirements

- Create valid, owner-authorized non-default worktrees for the two private
  canonical repositories without modifying the invalid local folders.
- Add private-accurate `project.ecosystem.yaml` manifests and validate them in
  their canonical repositories.
- Inventory shared modules and consumers across all three valid repositories,
  then accept the final ownership map through review.
- Run the foundation gate in remote CI; local command success is not remote CI
  evidence.

## Rollback

Revert the focused governance commit. No data migration, repository move,
remote mutation, or synchronization is part of this slice.
