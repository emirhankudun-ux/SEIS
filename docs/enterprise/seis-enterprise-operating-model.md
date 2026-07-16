# SEIS Enterprise Operating Model

This operating model defines how SEIS should grow without becoming chaotic, unsafe, or difficult to review.

## Operating thesis

SEIS should compete upward by being unusually coherent for an open-source creative engineering ecosystem.

That means:

- strong product identity
- clear architecture
- conservative trust boundaries
- reviewable automation
- honest readiness states
- local-first demos
- evidence-gated claims

## Roles

### Maintainer

Owns final decisions, release timing, security boundaries, and public claims.

### Architecture reviewer

Checks whether new work fits the product model, platform strategy, and long-term maintainability.

### Security reviewer

Checks secrets, provider keys, SSH, deployment, private data, and risky automation.

### Product reviewer

Checks whether the work makes SEIS easier to understand, run, and explain.

### Validation reviewer

Checks whether claims have scripts, manifests, evidence, or clear manual review paths.

## Change classes

| Class | Examples | Requirement |
| --- | --- | --- |
| Small | docs, wording, small checks | normal PR review |
| Medium | new route, new package, new manifest | review packet recommended |
| Large | platform architecture, cloud, SSH, AI routing | review packet required |
| High risk | credentials, deployment, private data, autonomous writes | explicit maintainer approval required |

## Enterprise review loop

1. Define the claim.
2. Add or update evidence.
3. Add validation if possible.
4. Document limitations.
5. Review security boundaries.
6. Mark the next decision.

## Decision labels

Use these labels in docs and PRs:

- `draft-review`
- `ready-for-doc-review`
- `ready-for-local-validation`
- `blocked-by-evidence-gap`
- `blocked-by-security-review`
- `approved-for-demo-only`
- `approved-for-release-candidate`

## Enterprise rule

SEIS should never hide uncertainty. Credibility comes from making proof, gaps, and next actions visible.
