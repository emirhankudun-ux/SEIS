# MARIA × SEIS Architecture — v4 Alpha

## Product boundary
**MARIA** owns interaction, presence, voice/vision UX and result communication.
**SEIS** owns context, policies, routing, orchestration, adapters, observability and verification.

## Execution path
`Intent → Context → Source of Truth → Risk → Permission → Provider Router → Agent Router → Adapter → Observation → Verification → Report`

## Core invariants
- One coherent user-facing intelligence.
- Real execution is never simulated in user-facing claims.
- Provider-specific logic stays behind adapters.
- Least privilege for agents/plugins/tools.
- High-impact actions require approval.
- Current verified runtime state outranks stale memory.
- Builder output is not completion until independently verifiable evidence passes.
- Degraded providers do not collapse the system.

## Source-of-truth priority
1. Current explicit user instruction
2. Current verified runtime/repository state
3. Canonical project governance
4. Latest approved project decisions
5. Persistent project memory
6. Conversation history
7. Model inference

## Plugin contract
Plugins declare identity, semantic version, capabilities and risk. Invalid manifests are rejected before activation. Future signed packages should add publisher identity, checksums and trust policy.

## Provider policy
The router scores providers by capability coverage, availability, priority, privacy policy and locality. Local-first adds preference; it does not blindly force a weaker local model when the task requires unsupported capability.

## Verification
Every meaningful execution returns machine-readable checks and evidence. A feature may only present itself as production-ready after the relevant adapter has reproducible verification.
