# SEIS Enterprise Reviewer Demo Script

This script gives reviewers a clear, time-boxed way to inspect SEIS without private context, live credentials, SSH access, provider keys, or deployment access.

## Review promise

A serious reviewer should be able to answer four questions quickly:

1. What is SEIS?
2. What runs locally today?
3. What is planned or disabled?
4. What evidence supports the enterprise direction?

## Ten-minute path

### Minute 0-1: repository identity

Read the top of `README.md` and identify the product category.

Expected result:

- SEIS presents itself as an AI-native creative engineering ecosystem.
- SEIS does not require provider keys for the core local demo.
- High-risk capabilities are labeled, gated, or planned.

### Minute 1-3: runnable route check

Start from the documented local demo route in `README.md`.

Expected result:

- The reviewer can identify the primary browser demo entry points.
- Local demo mode is visible.
- Planned, mock, disabled, and live states are not mixed together.

### Minute 3-5: architecture and governance check

Open the architecture and governance docs.

Expected result:

- Architecture is layered rather than random.
- The master prompt and governance docs define operating rules.
- Security and review boundaries are visible.

### Minute 5-7: enterprise readiness check

Open:

```text
data/enterprise/seis-enterprise-readiness-gates.json
docs/enterprise/seis-enterprise-competitive-readiness.md
docs/enterprise/seis-enterprise-moat-scorecard.md
```

Expected result:

- Competitive claims are evidence-gated.
- The product has a moat thesis.
- Readiness is treated as a checklist, not a slogan.

### Minute 7-9: validation check

Run:

```bash
python3 scripts/check-seis-enterprise-readiness.py
python3 scripts/check-seis-enterprise-claims.py
```

Expected result:

- Enterprise readiness docs exist.
- Readiness gates have evidence paths.
- Claims are not allowed to overstate current proof.

### Minute 9-10: decision

Reviewer marks one of these outcomes:

- `ready-for-doc-review`
- `needs-claim-tightening`
- `needs-validation-depth`
- `needs-product-demo-proof`
- `blocked-by-security-or-trust-gap`

## Reviewer red flags

Stop and request changes if:

- SEIS claims to beat a named large-company product without evidence.
- Live provider, SSH, deployment, or private-data behavior is implied without validation.
- Docs confuse planned capability with current capability.
- Enterprise language becomes promotional instead of evidence-based.

## Reviewer green flags

SEIS is moving in the right direction when:

- claims have evidence paths
- limitations are visible
- local checks are documented
- unsafe capabilities are gated
- product identity is clear
- contribution and rollback paths are understandable
