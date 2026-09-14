# Alpha.10 follow-up — native Ollama adapter readiness

Date: 2026-09-11. Branch: `maria-seis-v4-platform`. PR: #226.

## Goal

Add a bounded native Ollama transport without changing the browser's simulation-first behavior or weakening the existing provider, permission, audit and verification boundaries.

`src/adapters/localOllama.js` implements the host-adapter v2 contract directly against Ollama's native HTTP API:

- model discovery and fresh health checks use `GET /api/tags`;
- model execution uses `POST /api/chat` with `stream: false`;
- the configured model must match an exact `name` or `model` value returned by `/api/tags`;
- the completed chat response must report the exact configured model and `done: true`;
- timeout and external cancellation are bounded, including a pre-aborted signal that prevents the request from starting;
- no secret storage and no browser auto-enable path are added.

## Verification boundary

A valid native Ollama response can become `verifiedTransport` through the existing `HostAdapterManager → LiveRuntimeAdapter → orchestrator → verifyLiveReceipt` path. It remains `verificationScope: model-response-transport`, with `outcomeVerified: false` and `verifiedExternalAction: false`.

Ollama's native chat response does not provide a provider-issued unique response id equivalent to an OpenAI `chatcmpl-*` id. The adapter therefore returns `providerReceiptId: null` instead of inventing an identifier. Evidence is limited to the native transport, exact configured model, returned `created_at`, and completed-response marker.

This verifies transport identity and a completed model response. It does **not** verify factual/semantic correctness and does not prove that any external action occurred.

## Test-first evidence

The initial focused suite was written before `localOllama.js` existed and failed **5/5** because the adapter was missing. After the minimal implementation, those tests passed. A second regression was then added for a pre-aborted signal; it failed because a request could still start, and passed after the request boundary was hardened.

Fresh focused verification after the fix:

- native adapter unit/contract tests plus real loopback HTTP protocol test: **7/7 passed**;
- loopback HTTP is a protocol fixture only; it is not a real Ollama process or an AI model.

## Real-host acceptance command

A trusted host with Ollama running can execute:

```bash
MARIA_OLLAMA_MODEL='<exact-model-id>' npm run ollama:check
```

For a non-default trusted endpoint:

```bash
MARIA_OLLAMA_BASE_URL='http://127.0.0.1:11434' MARIA_OLLAMA_MODEL='<exact-model-id>' npm run ollama:check
```

The check traverses the governed live path and only succeeds when transport verification is true while external-action verification remains false.

## Current acceptance status

The development environment used for this change had no Ollama service listening at `127.0.0.1:11434`; the connection was refused. Therefore this commit does **not** claim verified real Ollama inference. Real-host acceptance remains an explicit environment gate, not a simulated success.
