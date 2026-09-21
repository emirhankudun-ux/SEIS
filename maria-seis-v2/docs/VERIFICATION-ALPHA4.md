# Verification — 4.0.0-alpha.4

## Fresh evidence

- `npm test`: **71/71 Node tests passed**.
- `python3 tests/browser_smoke.py --offline`: **17/17 Chromium acceptance checks passed**.

## New regression coverage

- provider without adapter remains unroutable;
- successful health/capability probe gates routing;
- discovered capabilities cannot exceed the provider definition;
- provider health expires after a bounded TTL;
- hung probes time out without leaking private adapter errors;
- concurrent probes are deduplicated per provider;
- cancelled probes never mark a provider healthy.

## Boundaries

The supervisor establishes provider readiness evidence only. It does not execute live model/tool calls, and alpha.4 does not enable the orchestrator's live execution path.
