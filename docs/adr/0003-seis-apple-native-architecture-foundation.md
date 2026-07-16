# ADR-0003: SEIS Apple-Native Architecture Foundation

## Status

Proposed

## Context

SEIS already describes an Apple-first direction and contains a SwiftPM package
with the `SeisPlatformKit` library, `SeisAppleNativeShell` executable, and
`SeisPlatformKitTests` target. The package declares macOS 13 and iOS 16. Those
facts are real, but the repository lacks one decision record that separates
current package evidence from planned macOS, iPadOS, iOS, and visionOS product
surfaces.

Without that record, an experimental executable can be mistaken for a shipped
application, iPadOS support can be inferred from an iOS platform declaration,
and web/mobile guidance written for public experiences can conflict with the
Apple-first SEIS product strategy.

## Decision

1. macOS is the primary native Command Center and deep production-workflow
   surface.
2. iPadOS is a planned SEIS Brain, knowledge-review, design-review, and
   creative-planning surface. The current iOS 16 SwiftPM declaration is not a
   dedicated iPadOS app target.
3. iOS is a planned status, alert, search, capture, and quick-note companion.
4. visionOS remains research-only until shared Apple contracts and quality
   gates are healthy.
5. Web remains the no-key public demo, onboarding, documentation, and GitHub
   showcase. It is not the long-term native architectural center.
6. The target architecture separates shared public-safe contracts,
   application/runtime behavior, data/infrastructure adapters, observability,
   and platform presentation when compatibility evidence supports the split.
   The current `SeisPlatformKit` target contains all five layers: Core Data
   stores and agent runtimes coexist with contracts, diagnostics, and the
   `SeisAppleContinuationSurface.swift` conditional SwiftUI/AppKit/UIKit View.
   This is recorded technical debt; separation requires focused child Goals
   before stable maturity.
7. The `SeisAppleNativeShell` target also mixes SwiftUI presentation with
   application state/routing, demo-scenario orchestration, bundled-resource
   loading, local process integration, and telemetry. Its executable boundary
   is prototype evidence, not proof that those responsibilities are already
   separated or release-ready.
8. Current `ready` labels and aggregate booleans in persistence and platform
   policy contracts mean declarative checklist coverage, not verified runtime,
   CloudKit, provider, build, platform, or release readiness. A child Goal must
   introduce distinct planned/configured/verified/unavailable/failed states.
9. Existing package maturity remains experimental/prototype. No signed,
   notarized, distributed, beta, or stable Apple application is claimed.
10. The canonical current inventory is
   `data/seis-apple-platform-architecture.json`; the human-readable package,
   role, web-boundary, and validation map is
   `docs/architecture/SEIS_APPLE_PLATFORM_MAP.md`.

## Consequences

- Future Apple implementation Goals have an explicit platform role and
  dependency direction.
- iPadOS and iOS work cannot be reported as implemented merely because the
  package declares iOS compatibility.
- The existing SwiftPM package remains intact; this decision adds no dependency
  and changes no production Swift source.
- The existing mixed domain/application/data/observability/presentation
  boundary is visible and cannot be reported as already separated.
- The executable's mixed presentation/application/resource/process/telemetry
  responsibilities are visible and cannot be reported as presentation-only.
- Declarative readiness metadata cannot be used as runtime or release proof.
- The draft branch is checked against its pull-request base; out-of-scope
  changes and edits to read-only `Package.swift` or demo-contract evidence fail
  before this specification can be reviewed.
- Platform-specific build, accessibility, performance, signing, privacy, and
  release evidence remains required before maturity promotion.
- The public web experience stays useful without becoming a competing source
  of truth for native product behavior.

## Alternatives Considered

### Keep the current distributed documentation

Rejected because strategy, package facts, and product maturity can drift
without a deterministic cross-file gate.

### Make the web Command Center the canonical product center

Rejected because it conflicts with the manifest and constitution's Apple-first,
Swift-first direction. Web remains the public demonstration and onboarding
surface.

### Create separate packages and app targets immediately

Rejected for this Goal. Package restructuring, new app targets, Xcode projects,
and implementation changes require focused child Goals after the architecture
and security dependencies are reviewed.

### Treat iOS compatibility as dedicated iPadOS implementation

Rejected because the current manifest and repository provide no dedicated
iPadOS target, application, simulator, device, or release evidence.

## Security and Privacy

The new artifacts in this Goal are public-safe and contain no secret values,
private memory, credentials, SSH material, or personal data. This is not a
repository-wide privacy certification. Live AI, CloudKit, SSH, MCP, provider,
credential, or private-data behavior is outside scope and requires separate
permission, privacy, and rollback review. The web demo remains no-key.

## Accessibility and Performance

This Goal changes no interface. Future native surfaces must provide visible
focus, keyboard behavior where applicable, VoiceOver semantics, Dynamic Type,
touch-target, contrast, and reduced-motion evidence. They must also define and
measure launch, memory, energy, responsiveness, and rendering budgets before
release-candidate maturity.

## Migration and Rollback

No data or source migration occurs. Rollback is a focused revert of the Goal,
decision, platform map, machine-readable contract, validator, tests, package
scripts, and CI invocation. Existing Swift package source and web behavior are
not changed.

## Follow-up

- Complete human review of ECO-GOAL-0001, ECO-GOAL-0002, and ECO-GOAL-0003.
- Accept, revise, or reject this ADR.
- After acceptance, split native product implementation into platform-specific
  child Goals with their own application, accessibility, performance,
  security, test, release, and rollback evidence.
- Create focused child Goals for package-layer separation and for replacing
  overloaded readiness labels with evidence-backed operational states.
