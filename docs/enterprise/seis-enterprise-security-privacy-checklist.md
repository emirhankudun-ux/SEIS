# SEIS Enterprise Security and Privacy Checklist

Enterprise credibility depends on conservative security language and repeatable review boundaries.

This checklist does not approve production use. It defines what must be checked before stronger claims are allowed.

## Secret safety

Required checks:

- No private keys are committed.
- No provider keys are placed in browser code.
- No raw credentials are stored in docs, prompts, localStorage, or public fixtures.
- Environment variable names may be documented, but values must not be committed.

## Provider and AI routing

Required checks:

- Provider routing is disabled, mock, planned, or backend-gated unless explicitly verified.
- Browser-facing AI surfaces do not expose provider credentials.
- Fallback behavior is documented and not silent.
- Model and agent claims remain bounded by evidence.

## SSH and deployment

Required checks:

- SSH execution requires explicit human approval.
- Public docs do not expose private hostnames, keys, or live credentials.
- Deployment claims map to readiness checks.
- Dry-run plans are separated from live mutation.

## Private data

Required checks:

- Public repo docs do not require private vault access.
- Obsidian or second-brain examples use public-safe seed material only.
- Local demo data is clearly labeled as local, fixture, or mock data.
- No private user data is required for enterprise review.

## GitHub governance

Required checks:

- Large changes go through PR review.
- Review packets exist for high-scope changes.
- Rollback path is documented.
- Branch cleanup is deliberate and non-destructive.

## Claim safety

Blocked language until independently proven:

- production secure
- enterprise certified
- beats named large-company products
- live provider routing enabled
- live deployment ready
- autonomous write access approved

Allowed language:

```text
SEIS is building toward enterprise-grade readiness through evidence-gated open-source review.
```

## Exit criteria

A reviewer can mark this checklist as `ready-for-next-review` only when:

- security boundaries are explicit
- risky capabilities are gated
- validation commands exist
- docs avoid overclaiming
- no secrets or private operational details are present
