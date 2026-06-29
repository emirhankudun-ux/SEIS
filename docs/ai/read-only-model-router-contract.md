# Read-Only Model Router Contract

## Purpose

Define a provider-neutral, read-only model-router contract that can explain
future SEIS AI routing decisions without sending prompts, validating
credentials, calling providers, or silently switching models.

Source contract:
`content/development/seis-read-only-model-router-contract.json`

## Current Status

Status: planned read-only contract.

This is not a runtime gateway. It does not execute model calls, validate API
keys, download models, run benchmarks, route 20B/70B/150B/512B models, or
enable provider traffic.

## Provider States

The router contract keeps these states distinct:

- Local Demo
- Available
- Missing Key
- Disabled
- Rate Limited
- Error
- Unknown

Missing Key is not Error. Disabled providers are never selected. Local-only
mode never falls back to a cloud provider.

## Read-Only Decision Shape

The read-only router may describe:

- task type
- capability label
- privacy mode
- provider status fixture
- selected provider candidate
- selected model candidate
- blocked reasons
- fallback policy

Every decision must preserve decision integrity:

- read-only only
- execution performed is always false
- no prompt body in the decision
- no credential material in the decision
- redacted decision logs only
- provider state must be named
- selected provider must be explicit
- fallback must be explicit
- blocked reasons are required when a route is ineligible
- private Obsidian content is not routable

## Review Artifact

Current PR #54 review can generate a provider-neutral read-only model-router
decision artifact:

```bash
npm run report:seis-read-only-model-router-decision
npm run check:seis-read-only-model-router-decision
```

This writes
`reports/seis-public-demo/read-only-model-router-decision-latest.json` and
`reports/seis-public-demo/read-only-model-router-decision-latest.md`. The
artifact records installed AI profile fixtures, managed sub-agent lanes,
autonomous agent roster coverage, provider states, explicit fallback policy,
blocked reasons, and required approvals.

It is not a runtime gateway. It keeps `executionPerformed: false`, does not
validate credentials, does not store prompt bodies, does not expose browser
secrets, does not call providers, does not route private Obsidian content, does
not use silent fallback, and does not approve live routing.

The read-only router must not receive:

- API keys
- private prompts
- private Obsidian vault contents
- SSH credentials
- cookies
- service accounts
- unredacted provider errors

## Route-Blocked Model Classes

The following remain blocked planning targets, not available SEIS models:

- 20B planned-not-validated
- 70B research-roadmap
- 150B frontier-program-plan-only
- 300B+ not-scoped
- 512B apex-program-plan-only
- highest-available-future not-scoped

## Evidence Before Live Routing

Live routing requires all of the following before implementation:

- backend-only provider mediation
- server-only provider registry
- typed environment validation
- no-key startup fixture
- local-only fallback fixture
- rate-limit fixture
- invalid credential fixture
- redacted routing decision log
- client bundle secret exposure check
- safety eval evidence
- human approval

## Validation

```bash
npm run report:seis-read-only-model-router-decision
npm run check:seis-read-only-model-router-decision
npm run check:seis-second-brain-readiness-contracts
```

Related gate:

```bash
npm run check:seis-model-scaling-hardware-profile
```
