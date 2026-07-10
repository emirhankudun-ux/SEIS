# SEIS Apple Platform Strategy

Status: active long-term direction

## Platform Roles

- macOS is the primary native Command Center.
- iPadOS is the SEIS Brain, review, and creative-planning surface.
- iOS is the status, alert, search, and quick-note companion.
- visionOS is research-only until shared Apple foundations are healthy.
- Web remains the no-key public demo and GitHub showcase.

## Swift Package Direction

Reusable domain models, policies, design tokens, provider metadata, Brain
contracts, security rules, and tests should move into justified Swift packages.
Packages must expose useful interfaces, document ownership and dependencies,
and compile when toolchains are available.

## Native Boundaries

Platform APIs remain isolated from shared models. SwiftUI surfaces preserve
accessibility, reduced motion, performance, privacy, and native interaction.
Metal is used only for measured rendering value.

## Adoption Gate

Do not add symbolic Swift files or copy Apple interfaces. Native expansion
requires a stable contract, tests, documentation, rollback, and evidence that
it improves the product rather than language statistics.
