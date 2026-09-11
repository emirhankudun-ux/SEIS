# Security scope — 4.0.0-alpha.9

This package is still an engineering alpha, not a security-reviewed native agent. The browser remains simulation-first. A narrow read-only MCP subprocess and a narrow local recovery probe are real host checks; they do not enable arbitrary OS control.

## Current enforced boundaries

- Unknown risk is denied; high-impact requests are not silently executed.
- Live requests never fall back silently to simulation.
- UI observers cannot mutate authorization or provider selection.
- Live receipts must preserve provider, run, project and intent identity and carry explicit verification evidence.
- MCP tool discovery is not authorization; host authorization defaults to deny.
- MCP malformed results, unsupported lifecycle/version states and stale discovery replies fail closed.
- Child MCP processes use shell-disabled bounded stdio transport and do not inherit the parent's general environment.
- Persistent execution-journal records redact secret-shaped keys before storage.
- Corrupt persistent audit history fails closed instead of silently resetting.
- Live execution refuses to start if its required audit-start record cannot be persisted.
- A verified live result whose terminal audit record cannot be committed is exposed as `unverified` and requires reconciliation.
- Interrupted runs are detected but never automatically resumed (`resumeAllowed: false`).

## Important limits

The persistent journal is not proof that an interrupted external side effect did or did not happen. Adapter-specific reconciliation and idempotency are required before resumable consequential work can be safe. The host file store is not a sandbox and does not provide multi-process locking, full directory trust validation, disk encryption or OS identity attestation.

Do not place secrets in browser storage, source, public issues, test fixtures or execution evidence. Browser flags, model output, regex matching, plugin manifests and provider health must never become authorization by themselves.

Real local-model inference, third-party MCP interoperability, microphone/screen capture, general filesystem writes, shell/computer control, native macOS permissions, Unreal/Blender control and production deployment each require separate permission, audit, cancellation, reconciliation and verification gates before they can be called working.

Use private reporting for sensitive findings. Do not publish secrets or exploit data in a public issue.
