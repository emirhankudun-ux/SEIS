# Alpha.10 — local model transport acceptance and verification scopes

Date: 2026-09-11. Branch: `maria-seis-v4-platform`. PR: #226. Parent checkpoint: `7768f272bb7610eca9130330d0439f374fee6761` (alpha.9). Scope: the `maria-seis-v2` package only.

## Goal

Advance the highest-value local-model gate without inventing a real model connection. The package now has a real loopback HTTP acceptance path for its OpenAI-compatible adapter and a stricter verification vocabulary that prevents a provider response from being confused with independently verified semantic correctness or an external side effect.

## Test-first evidence

Before implementation, targeted tests failed because:

- local model receipts had no `transportVerified` field;
- `verifyLiveReceipt` could not represent a verified transport without claiming `verifiedExternalAction`;
- an `outcomeVerified` assertion could pass without a separately verified transport;
- the adapter accepted a completion whose returned model identity differed from the configured model;
- the real local-model process acceptance command did not exist.

After implementation, targeted tests pass and the complete suite is rerun as the final gate.

## Implemented

- `transportVerified` and `verifiedTransport` are distinct from `outcomeVerified` / `verifiedExternalAction`.
- Verification scopes are bounded to `live-transport`, `model-response-transport`, `tool-response-transport`, and `external-outcome`.
- Model responses use `model-response-transport`: identity/transport may verify, but `verifiedExternalAction` remains false.
- MCP responses use `tool-response-transport` unless the trusted host independently checks the tool result; only then is the receipt `external-outcome`.
- Local OpenAI-compatible responses must return the exact configured model ID.
- A separate loopback-only reference server implements only `/v1/models` and `/v1/chat/completions`, with a bounded request body and no shell or general environment inheritance.
- `npm run local-model:check` exercises real HTTP, model discovery, completion transport, exact receipt identity, cancellation, audit recording, and child cleanup through the complete live-adapter stack.

## Truthfulness boundary

The included `maria-openai-reference` server is **not an AI model**. Passing this check proves that the package can speak its OpenAI-compatible protocol contract over a real local HTTP socket and preserve identity/cancellation/audit semantics. It does not prove LM Studio/Ollama availability, model quality, factual correctness, tool use, or production readiness.

A maintained real local model process remains the next acceptance gate.

## Fresh final verification

- `npm test`: **165/165 passed**, zero failed/skipped/cancelled.
- `npm run mcp:check`: **verified**; independent package byte/SHA-256 comparison passed and child closed.
- `npm run recovery:check`: **verified**; one interrupted marker was detected, automatic resume stayed disabled, explicit reconciliation cleared it.
- `npm run local-model:check`: **verified transport**; real loopback HTTP, exact reference model identity, cancellation, audit entry, and child cleanup passed; `verifiedExternalAction` remained **false**.
- Offline Chromium acceptance: **17/17 checks passed** across the existing seven viewport matrix.

These results verify the package's bounded local contracts only. No maintained third-party MCP server or real local AI model process was connected in this checkpoint.
