# SEIS Apple Platform Strategy

Status: active long-term direction

The exact current package inventory, product maturity, platform-role contract,
web boundary, and validation strategy are proposed in
[`architecture/SEIS_APPLE_PLATFORM_MAP.md`](architecture/SEIS_APPLE_PLATFORM_MAP.md)
under [ADR-0003](adr/0003-seis-apple-native-architecture-foundation.md).
Until that ADR is accepted, it is a specification and not implementation or
release authority.

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

Package compatibility does not prove a platform application exists. In
particular, the current iOS 16 SwiftPM declaration is not evidence of a
dedicated iPadOS or iOS app, and the package executable is not evidence of a
signed, notarized, or distributed macOS application.

## Validation Strategy

Portable contract and negative-fixture checks run in Foundation CI. SwiftPM
describe, library build, `SeisAppleNativeShell` executable-product build, and
package tests require a verified Darwin Swift toolchain. Skipped or unavailable
native commands remain explicit gaps rather than passing evidence. Platform
implementation later adds simulator/device, accessibility, performance,
signing, entitlement, privacy, distribution, and rollback gates appropriate to
its maturity.

For the focused Apple-foundation branch, validation also compares the complete
pull-request diff with the Goal's declared paths. Production Swift and web
runtime files, `Package.swift`, and the two copied demo contracts remain
read-only inputs; a change to any of them requires a separate implementation
Goal.
