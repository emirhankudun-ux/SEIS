# SEIS AI Core

Status: architecture foundation; no live-provider claim

## Responsibilities

AI Core owns provider and model metadata, routing policy, prompt versions,
context assembly, memory boundaries, evaluation, fallbacks, cost/privacy
metadata, tool permissions, and auditable runtime state.

## Runtime States

Use explicit states: `demo`, `local`, `cloud`, `offline`, `unavailable`,
`missing-credentials`, `provider-failure`, `rate-limited`, `restricted`, and
`approval-required`. Demo output must never be presented as a live model call.

## Routing Contract

Routing decisions consider task type, capability, privacy, latency, cost,
context size, local availability, health, user preference, and fallback order.
Decisions must be explainable. Provider and model names belong in registries,
not permanent business-logic branches.

## Prompt and Memory Boundary

Prompt order follows constitution, workspace, role, task, retrieved context,
temporary input, and output contract. Only public-safe summaries, decisions,
and evidence may enter repository memory. Hidden reasoning and private memory
remain outside public artifacts.

## Safety

No frontend keys, secret logging, fake execution, uncontrolled tool writes, or
unapproved remote mutation. Live cloud routes require server-side key
isolation, rate limits, error handling, logs without secrets, and rollback.

Detailed implementation records remain under `docs/ai/`, `packages/seis-ai/`,
and `content/development/`.
