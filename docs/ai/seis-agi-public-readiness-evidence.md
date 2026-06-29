# SEIS AGI Public Readiness Evidence

`content/development/seis-agi-public-readiness-evidence.json` is the current
machine-readable public readiness matrix for SEIS AGI and the 512B apex target.
It is exposed to local MCP clients as the read-only resource
`seis://ai/agi-public-readiness-evidence.json`.

Status: `blocked-missing-real-agi-evidence`.

This matrix does not prove AGI. It records the evidence that is still missing
before SEIS can make a public AGI or 512B model claim. GitHub users can inspect
the Local Demo and validators, but they must not treat this repository as a
trained 512B model, routeable 512B inference system, benchmark result, or real
AGI.

## Current Decision

| Decision | Value |
| --- | --- |
| AGI claim allowed | False |
| 512B route eligible today | False |
| Runtime authority granted | False |
| Public ready as AGI | False |
| Public ready as Local Demo | True |

## Evidence Matrix

The matrix mirrors every requirement in
`content/development/seis-agi-evaluation-protocol.json` under
`minimumEvidenceBeforeAnyAgiClaim`. The AGI evaluation protocol is also exposed
as the read-only MCP resource `seis://ai/agi-evaluation-protocol.json`.

All minimum claim evidence is currently missing or not run:

- lower-tier 20B, 70B, 150B, and 300B+ evidence
- independently verified 512B training or inference evidence
- multi-domain, long-horizon, tool-use, autonomy, OOD, and abstract-skill evaluations
- safety, misuse, frontier-threshold, risk-profile, privacy, data-rights, and clean-room reviews
- red-team report, model card, system card, training logs, checkpoint governance
- external review and explicit human approval

## Source-Derived Gates

The public readiness matrix also tracks the protocol's source-derived gates:

| Gate | Status |
| --- | --- |
| Generative AI risk profile gate | Not run |
| Long-task autonomy gate | Not run |
| Frontier safety threshold gate | Not run |
| Abstract generalization gate | Not run |

## Validate

```bash
node scripts/check-seis-agi-public-readiness-evidence.mjs
```

The validator fails if the matrix claims AGI readiness, route eligibility,
runtime authority, accepted claim evidence without protocol backing, missing
human approval gates, or stale counts.
