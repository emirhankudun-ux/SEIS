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

## Command Center operational-state boundary

The Command Center plugin panel now presents four static, no-key boundary cards.
They make the product contract legible without pretending that a provider,
network request, activation, or recovery action occurred.

| Visible boundary | Meaning in the current local demo | Must not be confused with |
| --- | --- | --- |
| Degraded | A bounded local artifact cannot load and the surface remains browsable in reduced static posture. | A provider failure or automated recovery. |
| Rate limited | No provider request is made; a future rate-limit result needs its own explicit outcome. | A catalog filter result or authentication state. |
| Provider failed | No provider call is attempted on this surface. | A demo response, a network check, or a live incident. |
| Approval required | Repository writes, releases, credential use, external activation, and provider calls stay behind human approval. | A button that can silently perform the action. |

The panel is a labelled section with a polite announcement region, `h3` section
heading, `h4` card headings, and textual `Review` / `Current` cues so status is
not color-only. It adds no interactive control, provider request, storage
write, or catalog-filter coupling. The source evidence is intentionally narrow:
browser keyboard order, screen-reader announcement behavior, contrast, and
responsive rendering still require manual review.

## Validation

    npm run check:seis-ui-state-contract-audit
    npm run check:seis-core-ui-state-contract-audit

The committed evidence record is
`content/development/seis-ui-state-contract-audit.json`.
