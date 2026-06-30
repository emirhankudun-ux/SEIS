# SEIS AGI GitHub User Readiness Gates

`content/development/seis-agi-github-user-readiness-gates.json` defines what a
GitHub user may safely trust today. It is exposed to local MCP clients as the
read-only resource `seis://ai/agi-github-user-readiness-gates.json`.
It depends on the AGI evaluation protocol
`content/development/seis-agi-evaluation-protocol.json` and
`seis://ai/agi-evaluation-protocol.json`.

The AI-wide public readiness boundary is
`content/development/seis-ai-public-readiness-program.json`, exposed as
`seis://ai/public-readiness-program.json`.

Fresh-clone readiness is tracked separately in
`content/development/seis-ai-fresh-clone-readiness.json`, exposed as
`seis://ai/fresh-clone-readiness.json`.

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

**Hard requirement:** AGI and 512B claims stay blocked until independent
evidence is collected and approved by human review.

## One-Command AI Readiness Gate

GitHub users and maintainers can run the AI-only public readiness gate with:

```bash
npm run check:seis-ai-public-readiness
```

This command runs the model intake, AI workforce, agent workforce, fresh-clone
readiness, model scaling, 512B apex, AGI evaluation, public readiness, GitHub
user readiness, and independent evidence validators as a single local check.

It does not install models, download checkpoints, train models, call providers,
provision cloud/GPU capacity, execute SSH, push, merge, release, grant AGI
status, or make the 512B route eligible.

## Validate

```bash
npm run check:seis-ai-public-readiness
npm run check:seis-ai-fresh-clone-readiness
node scripts/check-seis-agi-github-user-readiness-gates.mjs
```

The validator fails if this gate pack grants AGI status, 512B route eligibility,
runtime authority, provider-key requirements for the core demo, or public release
approval without evidence.
