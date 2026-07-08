# SEIS AGI GitHub User Readiness Gates

`content/development/seis-agi-github-user-readiness-gates.json` defines what a
GitHub user may safely trust today. It is exposed to local MCP clients as the
read-only resource `seis://ai/agi-github-user-readiness-gates.json`.
It depends on the AGI evaluation protocol
`content/development/seis-agi-evaluation-protocol.json` and
`seis://ai/agi-evaluation-protocol.json`.

Status: `review-gated-local-demo-ready`.

This is not a release approval and not an AGI claim. The gate pack separates
Local Demo review from real AGI or 512B model use.

## Current Decision

| Decision | Value |
| --- | --- |
| Public ready for Local Demo review | True |
| GitHub ready for everyone | False |
| Public ready as AGI | False |
| 512B route eligible today | False |
| Runtime authority granted | False |

## User Modes

- Local Demo review is allowed without provider keys.
- Validator review is allowed without provider keys.
- Real AGI use is blocked.
- Live provider use is disabled until configured behind backend-only secrets.

## Research Baseline

The gate pack keeps SEIS aligned with public risk and evaluation references:

- NIST AI Risk Management Framework:
  `https://www.nist.gov/itl/ai-risk-management-framework`
- NIST AI 600-1 Generative AI Profile:
  `https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf`
- METR long-task capability measurement:
  `https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/`
- ARC-AGI:
  `https://arcprize.org/arc-agi`

## What Blocks Everyone-Ready Status

- Fresh clone local demo path still needs explicit evidence.
- One-command AI readiness validator needs to be documented and run as a release
  gate.
- Human release approval must be recorded.
- Independent AGI evidence ledger must remain incomplete until external review and
  explicit human approval are recorded.
- Real AGI and 512B claims remain blocked until independent evaluation,
  training/inference, benchmark, safety, and external review evidence exists.

Fresh-clone readiness plan:
`content/development/seis-agi-github-fresh-clone-readiness-plan.json`.

The plan is generated into:

- `reports/seis-model-scaling/seis-agi-github-fresh-clone-readiness-plan.json`
- `reports/seis-model-scaling/seis-agi-github-fresh-clone-readiness-plan.md`
- `docs/ai/seis-agi-github-fresh-clone-readiness-plan.md`

It keeps `githubReadyForEveryone`, `publicReadyAsAgi`,
`routeEligibleToday`, and `agiClaimAllowed` false until clean-clone evidence,
human release approval, and public claim boundaries are accepted.

## Validate

```bash
node scripts/check-seis-agi-github-user-readiness-gates.mjs
npm run report:seis-agi-github-fresh-clone-readiness-plan
npm run check:seis-agi-github-fresh-clone-readiness-plan
npm run check:seis-public-ai-readiness
npm run check:seis-ai-github-readiness-chain
npm run report:seis-ai-github-pr-package
npm run check:seis-ai-github-pr-package
npm run report:seis-ai-pr-staging-dry-run
npm run check:seis-ai-pr-staging-dry-run
```

The validator fails if this gate pack grants AGI status, 512B route eligibility,
runtime authority, provider-key requirements for the core demo, or public release
approval without evidence.
