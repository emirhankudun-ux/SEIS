# SEIS Language v0.1

Status: Foundation behavior layer

SEIS Language v0.1 is a controlled application-layer behavior package. It is
not a foundation model, checkpoint, adapter, LoRA, or benchmarked model release.

## Scope

SEIS Language v0.1 may include:

- assistant behavior rules
- task classification labels
- model routing policies
- prompt version conventions
- review rubrics
- documentation standards
- safety rules
- Command Center state vocabulary
- evaluation expectations

## Core Vocabulary

| Term | Meaning |
| --- | --- |
| `modelRoute` | A policy-reviewed path from task to model profile. |
| `promptVersion` | A reviewed prompt asset version. |
| `agentTask` | A supervised unit of agent work. |
| `approvalRequest` | A user-controlled gate for privileged action. |
| `auditEvent` | A redacted record of action, decision, or validation. |
| `evidenceLink` | A pointer to docs, reports, checks, or source files. |
| `degradedMode` | A known limited state with safe fallback behavior. |
| `moduleMaturity` | Planned, draft, alpha, beta, stable, deprecated, or blocked. |

## Versioning Rule

Changes to SEIS Language must explain what behavior changed, what tests or
review were run, and what capability claims remain unsupported.
