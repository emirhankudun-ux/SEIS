# SEIS AGI GitHub Readiness Gates

Status: blocked pending independent evidence.

This is a claim-control and review package. It lets GitHub users inspect the
SEIS Local Demo and its future model plan, but it does not prove AGI, enable a
model runtime, or authorize a public model release.

## Current Boundary

| Capability | Current status |
| --- | --- |
| Local Demo review | Available without provider keys |
| 20B on 16GB+ RAM | Planned quantized evaluation only |
| 70B research lane | Research-gated only |
| 512B and higher lane | Blocked pending independent evidence |
| Model download, inference, training, provider call | Not authorized |
| AGI or 512B public claim | Blocked |

The 20B entry is not a claim that a checkpoint is installed or that every 16GB
machine can run it. A reproducible hardware measurement, license approval,
benchmark logs, security review, and human approval are required first.

## Required Evidence

No AGI, 20B runtime, 512B training, inference, or route claim may change until
the ledger contains independent evaluation, reproducibility, safety, and
human-release evidence. A CI pass, plugin list, provider wrapper, or model
catalog alone is not independent evidence.

The machine-readable records are:

- content/development/seis-agi-github-readiness-gates.json
- content/development/seis-agi-independent-evidence-ledger.json
- content/development/seis-agi-github-fresh-clone-readiness-plan.json

## Local Validation

Run only the local, no-model-download checks:

    npm run check:seis-agi-github-readiness-gates
    npm run check:seis-agi-independent-evidence-ledger
    npm run check:seis-agi-github-fresh-clone-readiness-plan
    npm run check:seis-ai-github-readiness-chain

These checks perform no provider call, model download, inference, training,
cloud provisioning, SSH execution, deployment, push, merge, or release.

GitHub runs the same chain through
.github/workflows/seis-agi-github-readiness.yml with read-only repository
permissions when this package or its controls change.

## Next Evidence Step

Attach a real clean-clone transcript before changing the fresh-clone status.
Keep AGI and 512B claims blocked until independent reviewers provide
reproducible evidence and an authorized human records a release decision.
