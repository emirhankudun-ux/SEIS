# SEIS Cloud Foundation

## Purpose

Define `@seis-cloud` as a controlled readiness, deployment, and remote
workspace lane. Cloud is an execution and delivery surface, not the source of
truth.

## Scope

This foundation covers:

- static hosting readiness
- server adapter evidence
- deployment credential boundaries
- SSH and remote workspace safety
- dry-run first operations
- approval-gated live actions

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Cloud environment record | Documented | `deploy/cloud-environment.json` | No live verification in this pass. | Keep cloud checks dry-run. |
| Server adapters | Scaffolded | `server/node`, `server/php`, `server/edge`, `server/docker` | Deployment target not selected here. | Validate adapter matrix before deploy. |
| Deployment tokens | Documented only | `.env.example`, `deploy/cloud-environment.json` | No real credentials used or verified. | Configure secrets only in `.env.local` or deployment secret manager. |
| SSH / remote workspaces | Planned | No live SSH action performed. | SSH requires explicit approval. | Add SSH runbook before any connection. |

## Rules / Policy

- No deployment without approval.
- No SSH command execution without approval.
- No private keys in repo, docs, prompts, logs, or browser storage.
- No private hostnames in public docs.
- Cloud provider tokens are server-only.
- Dry-run output must not claim live success.
- GitHub remains source of truth.

## Evidence Requirements

Cloud readiness requires:

- dry-run result
- target provider selection
- rollback note
- secret boundary review
- public exposure checklist
- release evidence checklist

## Related Documents

- [../architecture/seis-platform-lanes.md](../architecture/seis-platform-lanes.md)
- [../security/security-baseline.md](../security/security-baseline.md)
- [../deployment/cloud-environment.md](../deployment/cloud-environment.md)
- [../deployment/publish-gate-contract.md](../deployment/publish-gate-contract.md)

## Next Safe Action

Run existing cloud checks after repository hygiene is clean. Keep live provider,
deployment, SSH, DNS, and repository settings changes blocked until approved.
