# Security scope — 4.0.0-alpha.10

This package is still an engineering alpha, not a security-reviewed native agent. The browser remains simulation-first. Narrow local MCP, recovery, and OpenAI-compatible reference-transport checks are real host checks; they do not enable arbitrary OS control or prove real model intelligence.

## Current enforced boundaries

- Unknown risk is denied; high-impact requests are not silently executed.
- Live requests never fall back silently to simulation.
- UI observers cannot mutate authorization or provider selection.
- Live receipts must preserve provider, run, project and intent identity and carry explicit evidence.
- Transport verification and external-outcome verification are distinct claims.
- A model response can verify transport/identity without becoming a verified external action or a claim of semantic correctness.
- A locally returned model identifier must exactly match the configured model before the OpenAI-compatible adapter accepts the response.
- MCP tool discovery is not authorization; host authorization defaults to deny.
- MCP malformed results, unsupported lifecycle/version states and stale discovery replies fail closed.
- Child MCP and reference-server processes are shell-disabled and receive a deliberately minimal environment.
- Persistent execution-journal records redact secret-shaped keys before storage.
- Corrupt persistent audit history fails closed instead of silently resetting.
- Live execution refuses to start if its required audit-start record cannot be persisted.
- A verified live result whose terminal audit record cannot be committed is exposed as `unverified` and requires reconciliation.
- Interrupted runs are detected but never automatically resumed (`resumeAllowed: false`).

## Important limits

The OpenAI-compatible reference server is a protocol fixture bound to loopback. It is not a model, does not attest LM Studio/Ollama, and does not validate generated-answer correctness. A real model host still requires explicit discovery, bounded health checks, cancellation, exact model identity, and truthful response evidence.

The persistent journal is not proof that an interrupted external side effect did or did not happen. Adapter-specific reconciliation and idempotency are required before resumable consequential work can be safe. The host file store is not a sandbox and does not provide multi-process locking, full directory trust validation, disk encryption or OS identity attestation.

Do not place secrets in browser storage, source, public issues, test fixtures or execution evidence. Browser flags, model output, regex matching, plugin manifests and provider health must never become authorization by themselves.

Real local-model inference, third-party MCP interoperability, microphone/screen capture, general filesystem writes, shell/computer control, native macOS permissions, Unreal/Blender control and production deployment each require separate permission, audit, cancellation, reconciliation and verification gates before they can be called working.

Use private reporting for sensitive findings. Do not publish secrets or exploit data in a public issue.
