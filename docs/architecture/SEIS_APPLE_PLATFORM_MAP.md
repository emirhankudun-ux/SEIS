# SEIS Apple Platform Map

Status: proposed specification
Goal: `SEIS-GOAL-0001`
Canonical machine-readable record: `data/seis-apple-platform-architecture.json`

## Decision Boundary

This map records the architecture that exists and the product roles that are
planned. It does not promote package code to a released application and does
not authorize feature work, signing, distribution, provider access, CloudKit
sync, or private-data handling.

## Current Swift Package Map

| Item                           | Kind                          | Current contract                                                                                                                                                                        | Maturity                                            |
| ------------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `packages/seis_platform_swift` | SwiftPM package               | Swift tools `6.0`; minimum macOS `13` and iOS `16`                                                                                                                                      | experimental package foundation                     |
| `SeisPlatformKit`              | library product and target    | Domain contracts, application runtimes, Core Data/infrastructure stores, diagnostics/observability, and conditional SwiftUI/AppKit/UIKit presentation; this is a current mixed boundary | experimental                                        |
| `SeisAppleNativeShell`         | executable product and target | Depends on `SeisPlatformKit`; mixes SwiftUI presentation with application state/routing, scenario orchestration, resource loading, local process integration, and telemetry              | prototype, not a signed app                         |
| `SeisPlatformKitTests`         | test target                   | Depends on `SeisPlatformKit`                                                                                                                                                            | tracked target; current native execution unverified |

The manifest declares no external Swift package dependencies. The executable
and test target consume the library. The library currently also contains a
conditional Apple presentation surface, so it does not yet satisfy the desired
domain/presentation separation; this map records that debt instead of treating
the target architecture as current evidence.

## Current Layer Inventory

`SeisPlatformKit` is a modular-monolith target, not a clean domain-only module.
Its current responsibilities include:

- domain and policy contracts such as `SeisPlatformPolicy` and
  `SeisAGISystemContract`;
- application/runtime behavior such as agent orchestration, context
  compression, research automation, and handoff flows;
- data/infrastructure behavior including Core Data-backed memory, handoff,
  diagnostics, and research stores plus CloudKit readiness declarations;
- observability and diagnostics contracts; and
- the conditional SwiftUI/AppKit/UIKit continuation View.

The target direction separates these responsibilities only when a focused
child Goal can preserve compatibility and add package-level tests. This Goal
does not pretend that a presentation-only split would resolve the application
and data boundaries already present.

`SeisAppleNativeShell` is also not presentation-only. Its current target owns
SwiftUI views together with application state and routing, demo-scenario
orchestration, bundled-contract loading, local process execution, and telemetry
records. Those responsibilities remain package-level prototype code and need
their own separation and permission review before stable application maturity.

## Platform Roles

| Platform | State       | Product role                                                                | Current evidence boundary                                                                                       |
| -------- | ----------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| macOS    | prototype   | Primary native Command Center and deep production-workflow surface.         | `SeisAppleNativeShell` exists as a SwiftPM executable; there is no signed, notarized, or released app evidence. |
| iPadOS   | planned     | SEIS Brain, knowledge review, design review, and creative-planning surface. | SwiftPM represents compatibility through the iOS 16 declaration; no dedicated iPadOS target or app exists.      |
| iOS      | planned     | Companion for status, alerts, search, capture, and quick notes.             | The package declares iOS 16; no standalone iOS application target exists.                                       |
| visionOS | research    | Spatial research after shared Apple foundations are healthy.                | No platform declaration, target, app, build, or release evidence exists.                                        |
| Web      | active-demo | No-key public demo, onboarding, documentation, and GitHub showcase.         | Static public surfaces exist; web is not the long-term native architectural center.                             |

## Dependency Direction

The following is the target direction, not a claim that every boundary is
already achieved:

1. Reusable public-safe domain contracts become independent from application
   presentation. Today both coexist in `SeisPlatformKit`; a child Goal must
   separate them before stable maturity.
2. `SeisAppleNativeShell` consumes `SeisPlatformKit` and currently mixes
   package-level SwiftUI presentation with routing, scenario orchestration,
   resource loading, local process integration, and observability. A child Goal
   must separate those responsibilities before stable maturity.
3. Future macOS, iPadOS, and iOS applications consume versioned shared
   contracts; they do not duplicate those contracts manually.
4. Web consumes public-safe contracts and content but does not become a second
   owner of native domain behavior.
5. Live AI, CloudKit, SSH, MCP, provider, and private-data adapters require
   separate Goals, permission review, explicit runtime state, and rollback.

## Current Web-Native Contract

The public demo and native shell currently carry byte-identical copies of
`seis-demo-contract.json` at:

- `apps/seis-demo-web/contracts/seis-demo-contract.json`
- `packages/seis_platform_swift/Sources/SeisAppleNativeShell/Resources/seis-demo-contract.json`

This Goal adds a complete byte-equality drift gate but does not pretend the
duplication is a canonical distribution strategy. Ownership and sync direction
remain unresolved. A child Goal must select one shared canonical contract owner
or a generated one-way distribution path before either copy evolves
independently.

## Current Readiness Semantics

`SeisApplePersistenceReadinessContract` and `SeisPlatformPolicy` currently use
`ready` labels or aggregate booleans for declared checklist coverage and
configured policy strings. Those labels do not prove runtime CloudKit,
persistence, provider, platform, build, or release readiness. Until a child
Goal introduces distinct `planned`, `configured`, `verified`, `unavailable`,
and `failed` states backed by test or runtime evidence, user-facing readiness
must be interpreted as declarative prototype metadata only.

## Web Demo Boundary

Web remains a no-key public demo and onboarding surface. It may demonstrate
concepts, documentation, public fixtures, and GitHub-visible readiness, but it
must not imply that a native app is shipped or that credentials, providers,
private memory, CloudKit synchronization, signing, notarization, or deployment
are available. Native and web surfaces meet only through explicit public-safe
contracts and separately reviewed adapters. The public-safe claim applies to
this Goal's new artifacts; it is not a repository-wide privacy certification.

## Build and Test Strategy

Portable architecture gates run on every focused pull request:

```text
npm run check:seis-apple-platform-architecture
npm run test:seis-apple-platform-architecture
npm run check:ecosystem-foundation
npm run test:ecosystem-foundation
npm run check:foundation
npm run check:seis-platform-kernel
git diff --check
```

On the `apple/seis-native-architecture-foundation` pull-request branch, the
focused checker also compares the branch to its declared base and rejects any
changed path outside the Goal scope. `Package.swift` and both copied demo
contracts are read-only evidence inputs for this specification, so changing
them or any production Swift/web runtime file fails the scope gate.

The Darwin SwiftPM lane provides native package evidence:

```text
swift package --package-path packages/seis_platform_swift describe
swift build --package-path packages/seis_platform_swift --target SeisPlatformKit
swift build --package-path packages/seis_platform_swift --product SeisAppleNativeShell
swift test --package-path packages/seis_platform_swift
```

`.github/workflows/apple-platform-foundation.yml` runs that sequence on a
macOS runner. The portable Foundation job does not substitute for native build
or test evidence.

Toolchain unavailability or a skipped native command is disclosed evidence,
not a passing engineering result. A future product Goal must add the relevant
simulator/device, accessibility, reduced-motion, launch, memory, energy,
signing, entitlement, sandbox, notarization, privacy, and rollback evidence
before advancing product maturity.

## Validation Snapshot

On 2026-07-13, clean-scratch `swift package describe` passed and confirmed the
inventory in this map. A clean-scratch `swift build` for `SeisPlatformKit`
started but made no further progress during a 150-second observation window and
was interrupted; it is failed evidence, not a build pass. The
`SeisAppleNativeShell` product build and `swift test` were not run after that
incomplete library build. Apple Swift 6.1.2 is installed, but full Xcode is
unavailable because the active developer directory contains Command Line Tools
only. Simulator, application, signing, and notarization gates therefore remain
unverified.

## Current Gaps

- The architecture decision remains proposed until human review and its three
  ecosystem dependencies are complete.
- There are no dedicated iPadOS, iOS, or visionOS application targets.
- The duplicated web/native demo contract has an equality gate but still needs
  a canonical owner and one-way distribution decision.
- `SeisPlatformKit` currently mixes shared contracts and a conditional Apple UI
  continuation surface alongside application runtimes and Core Data-backed
  infrastructure; layer separation is pending.
- Current `ready` labels are declarative prototype metadata, not verified
  runtime or release evidence.
- The package executable is not evidence of a signed, notarized, distributed,
  beta, or stable macOS application.
- Package inventory is verified, but the library build did not complete; the
  executable build and package tests were not run in the current validation
  snapshot.
- Platform-specific accessibility and performance evidence belongs to future
  implementation Goals; this specification only defines the required gates.

## Rollback

Revert the focused Goal, ADR, platform map, machine-readable contract,
validator, tests, package scripts, and workflow invocation. Existing Swift
package source and application behavior remain unchanged by this slice.
