# Model Provider Data Policy

Status: Foundation security policy

This policy governs what SEIS may send to external model providers and what
must remain local or blocked.

## Never Send

- API keys, tokens, passwords, cookies, SSH private keys, certificates, `.env`
  values, service-account material, or provisioning files
- private personal data
- customer data
- restricted or leaked third-party code
- private dataset records without approval
- raw security findings containing exploitable secrets

## Approval Required

- sensitive repository data
- unpublished business, product, or infrastructure plans
- private logs or telemetry
- external evaluation of private fixtures
- provider fine-tuning or data upload

## Allowed By Default

- public repository documentation
- public issue or PR metadata
- synthetic examples
- already-public open-source code snippets when license allows use
- redacted validation summaries

## Logging

Provider routing logs must use redacted metadata. They should record task class,
provider id, model profile, privacy mode, approval state, timestamp, and result
status. They must not store secret-bearing prompts or raw private payloads.

## Subagent Privacy Inheritance

Subagents inherit the parent run's data class, privacy mode, provider routing
policy, approval state, and forbidden actions. A subagent cannot loosen a
local-only or metadata-only boundary, cannot promote sensitive context to an
external provider route, and cannot request or store provider credentials.

If a subagent needs broader context, external routing, provider execution,
GitHub write permission, SSH execution, deployment, dataset access, or model
training authority, the run must stop in `approval-needed` or `blocked` state
until a human approval record and rollback/evidence plan exist.
