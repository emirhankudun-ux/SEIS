# SEIS UI State Contract Audit

`seis-ui-state-contract-audit` is a public `SEIS Repo` package for bounded,
read-only static source inspection. It reports whether local UI source exposes
markers for loading, ready, empty, degraded, offline, unavailable,
rate-limited, validation-failed, provider-failed, approval-required, demo, and
live-boundary states.

## Why it is separate

| Existing package | Boundary | This package adds |
| --- | --- | --- |
| `seis-offline-mode-check` | Local-first/offline posture evidence | Cross-state source markers, including degraded and approval boundaries. |
| `seis-a11y-regression` | Declared JSON accessibility metadata | HTML/JS/CSS UI-state marker evidence. |
| `seis-focus-navigation-audit` | Keyboard, focus, semantic-control, ARIA, and motion evidence | Loading/error/degraded/demo/live state-model evidence. |

## Non-goals

- Running a browser or a UI.
- Calling a provider or inspecting network traffic.
- Declaring a missing marker to be a runtime failure.
- Certifying state transitions, accessibility compliance, public release, or
  production readiness.

## Review rule

An `attention` result is valid, useful static evidence: it records that a
declared state marker is missing. It must be resolved through a scoped product
decision or explicitly retained as a known gap; it must never be rewritten as
proof of a live failure.

## Validation

    npm run check:seis-ui-state-contract-audit
    npm run check:seis-core-ui-state-contract-audit

The committed evidence record is
`content/development/seis-ui-state-contract-audit.json`.
