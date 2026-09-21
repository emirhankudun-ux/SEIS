# Alpha.10 — local provider response budgets

Date: 2026-09-13. PR #226, branch `maria-seis-v4-platform`.
Baseline: `5308647bf4850a794354d10d8c6bd69f5c6a0f04`.
Scope: existing OpenAI-compatible and native Ollama local HTTP adapters.

## Defect and acceptance boundary

The shared local-provider request helper previously bounded request lifetime but
called `response.json()` without a raw-body byte ceiling. A local service could
therefore return a very large JSON body before adapter validation rejected it.
That contradicted the existing RAM/resource-governance direction and left a
straightforward local denial-of-service surface.

The helper now enforces a raw response budget for real Fetch streams. Both local
adapters default to **4 MiB** and accept an explicit positive integer budget up
to a hard **16 MiB** ceiling. The limit applies to discovery, health and model
responses because all three use the same request helper.

## Contract

- A numeric `Content-Length` above the configured budget fails before body read.
- Chunked/unknown-length bodies are counted as UTF-8 bytes while reading; the
  transport is aborted and the reader is cancelled once the limit is crossed.
- Oversize rejection never waits for an uncooperative `reader.cancel()` hook.
- The exact boundary is accepted; one byte over is rejected.
- Byte accounting is based on bytes, not JavaScript character count.
- Invalid adapter budgets fail at construction.
- Malformed/throwing body parsers stay redacted as `<label> response invalid`.
- Existing timeout and external cancellation remain active through body read.
- Transport-only verification is unchanged: a bounded model response is not an
  externally verified action and does not prove semantic correctness.

The real Fetch streaming path is the security boundary. Trusted injected fetch
implementations used by tests/hosts may expose only `text()` or `json()`; those
compatibility fallbacks cannot always reject before the trusted implementation
has materialized its result. This does not widen permissions or make arbitrary
third-party fetch implementations safe.

## Memory and performance truth boundary

The 4 MiB limit is a raw-body admission ceiling, **not** a 4 MiB process-RSS or
peak-allocation guarantee. The implementation retains received byte chunks and
creates a contiguous byte buffer plus decoded JSON text before parsing, so
transient allocations can exceed the raw-body size. The purpose is bounded
input, not zero-copy JSON parsing. No native Mac RAM, GPU, model-weight or swap
measurement is claimed by this change.

A smaller custom budget may reject otherwise valid long model outputs. Raising
it trades memory exposure for payload capacity but cannot exceed 16 MiB without
a reviewed code change and new evidence. No automatic retry, truncation, cloud
fallback or partial JSON acceptance is added.

## Test-first evidence

A new focused suite was first run against unchanged production code. Oversize
responses were either accepted or normalized only after unrestricted parsing,
and constructor budget validation was absent. After implementation, the suite
covered both adapters for declared length, chunked overflow, UTF-8 byte counting,
exact-boundary acceptance and invalid configuration, plus a real loopback HTTP
chunked-abort case. A later regression proved that awaiting a hostile
`reader.cancel()` could delay oversize rejection; cancellation is now fired
best-effort without blocking the caller.

Verification commands for this checkpoint:

```sh
node --test tests/local-provider-response-budget.test.mjs tests/local-provider-deadlines.test.mjs
npm test
npm run mcp:check
npm run recovery:check
npm run local-model:check
```

Hosted CI and any browser/native acceptance must be recorded from the exact
published head rather than inherited from this local checkpoint. Real Ollama
or LM Studio inference remains a separate authorized acceptance gate.

## Rollback / next handoff

Rollback is a focused revert of the shared response reader, adapter constructor
options, tests and docs; there is no persistent data migration. The pre-existing
PR merge conflict is not resolved here. The next safe work remains integration
reconciliation plus trusted real-model acceptance, without dropping these
resource limits.
