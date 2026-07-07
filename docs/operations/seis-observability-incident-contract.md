# SEIS Observability Incident Contract

Date: 2026-07-07

## Purpose

This contract turns the SEIS DevOps/SRE lane into a public-safe operating model
for observability, incident response, audit evidence, restore drills, and
infrastructure approval states.

It does not claim live telemetry, production monitoring, provider dashboard
access, SSH execution, cloud mutation, or incident automation.

Machine-readable source:
`content/development/seis-observability-incident-contract.json`

## Readiness Levels

| Level | Meaning | External Mutation |
| --- | --- | --- |
| `local-only` | Local files and deterministic checks only. | none |
| `dry-run` | Simulated command or release path without external changes. | none |
| `pr-ready` | Reviewable feature branch slice with focused local evidence. | feature branch only after dry-run and approval |
| `release-candidate` | Local gates and PR review evidence are ready for release decision. | approval required |
| `production-gated` | Production-like work is blocked behind owner approval and rollback proof. | blocked without explicit approval |
| `incident` | Quality, security, release, provider, or cloud issue is tracked with redacted evidence. | blocked without explicit approval |
| `restore-drill` | Recovery behavior is rehearsed without destructive external action. | none |
| `iac-plan` | Infrastructure-as-code intent is reviewed as a plan only. | none |
| `iac-apply` | Infrastructure mutation is approval-gated and blocked by default. | blocked without explicit approval |

## SLI / SLO Catalog

| Signal | Rule |
| --- | --- |
| Local governance check health | Every PR-ready slice reports the direct checker and adjacent governance checks. |
| Public readiness signal | No public release is claimed while blockers remain open. |
| AI provider route health | Live AI route claims require current-run readiness evidence. |
| SSH/cloud safety health | SSH/cloud actions require approval, dry-run evidence, and rollback notes. |

## Incident Severity

| Severity | Meaning | Response |
| --- | --- | --- |
| `sev0` | Critical security or destructive mutation risk. | Stop, preserve evidence, do not print secrets, request owner approval for mutation. |
| `sev1` | Release-blocking quality, CI, or public-readiness failure. | Block release claim and record failing command. |
| `sev2` | Degraded provider route, rate limit, or partial verification. | Mark the route blocked or rate-limited and use lower-risk fallback. |
| `sev3` | Documentation, handoff, or observability gap. | Track in backlog and attach a checker when practical. |

## Incident States

`detected -> triage -> contained -> mitigated -> resolved -> postmortem -> follow-up`

## Audit Log Fields

Every future incident or observability ledger should include:

- `timestamp`
- `repoId`
- `branch`
- `commit`
- `actorRole`
- `eventType`
- `severity`
- `readinessLevel`
- `evidencePath`
- `redactionStatus`
- `approvalReference`
- `rollbackAction`
- `externalMutationPerformed`
- `secretValueIncluded`

## Quality Gate

```bash
node scripts/check-seis-observability-incident-contract.mjs
```

Adjacent checks:

```bash
npm run check:seis-full-usage-operating-mode
npm run check:seis-command-center-operations-readiness
npm run check:seis-governance-index
```
