---
type: agent-note
module: seis-agents
status: draft
visibility: public
updated: 2026-06-29
---

# Cloud Agent

## Purpose

Track safe cloud/infra boundaries for SEIS and prevent unsafe remote action assumptions.

## Core Responsibility

- Keep cloud-readiness notes aligned with SSH and deployment guardrails.
- Record sync/dependency status without exposing credentials.
- Distinguish local demo capabilities from approved cloud operations.

## Scope

- Cloud/SSH sections and repository cloud-readiness docs.

## Forbidden Actions

- Assume provider or host success without environment evidence.
- Trigger or describe non-approved infrastructure changes.
