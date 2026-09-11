# Security scope — 4.0.0-alpha.4

This package is a local web simulation, not a security-reviewed native agent. No model API, microphone capture, screen capture, filesystem writes, shell commands or MCP execution is implemented.

- Unknown risk is denied; high-impact requests are never executed by this release.
- UI events cannot downgrade the current plan or change its provider list.
- Live requests do not fall back silently to simulation.
- User commands are rendered as text, not HTML.
- Run receipts must match the expected intent, project and run identity.
- Observer failures are isolated; raw errors are not exposed in diagnostics.
- Third-party manifests are metadata, not a sandbox or trust guarantee.
- Provider health probes are bounded, capability discovery cannot exceed the provider definition, stale health becomes unroutable, and raw adapter exceptions are not surfaced.
- Browser-side flags and regexes must never be the authorization boundary for future real tools.

Do not put secrets in browser storage, source, public issues or test fixtures. Do not enable real adapters merely by setting a capability flag. A future trusted host needs scoped credentials, origin validation, explicit side-effect authorization, request/response validation, audit redaction and independent verification. Timeout of an orchestrator cannot guarantee cancellation of an external operation; side effects must be reconciled.

HTTP development serving was blocked by the test environment's browser policy. That policy was not disabled. The UI was checked by network-free rendering of local modules; this does not validate deployment, authentication or cross-origin security.

Use private reporting for sensitive findings. Do not publish secrets or exploit data in a public issue.
