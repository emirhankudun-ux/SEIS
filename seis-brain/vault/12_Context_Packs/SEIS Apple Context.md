---
type: context-pack
module: apple-first
status: active-public-safe
priority: high
visibility: public
owner: SEIS
allowed_destinations:
  - Codex
  - Xcode
  - Public GitHub
forbidden_destinations:
  - private vault import
  - live provider prompt with secrets
---

# SEIS Apple Context

## Apple-First Direction

SEIS is Apple-first without copying Apple apps. Apple-first means disciplined
native direction, Swift/SwiftUI readiness, macOS as the primary Command Center
surface, iPadOS as the Brain and design-review surface, and iOS as a companion
status/search surface.

## Active Native Package

Use `packages/seis_platform_swift` as the active Swift Package. The recent Xcode
state shows `seis_platform_swift` selected, but Xcode presence is not build or
runtime evidence.

## Xcode Boundary

Xcode can inspect and edit repository files, so it remains handoff-gated under
the single-writer policy. Native claims require command output or Xcode build
evidence.

## Source Records

- `SEIS_APPLE_FIRST.md`
- `SEIS_APPLE_PLATFORM_STRATEGY.md`
- `docs/apple/APPLE_PUBLIC_READINESS.md`
- `packages/seis_platform_swift/README.md`

## Verification Commands

```bash
swift package describe --package-path packages/seis_platform_swift
swift test --package-path packages/seis_platform_swift
```

## Forbidden Claims

- Do not claim App Store readiness.
- Do not claim live AI provider routing.
- Do not claim live SEIS-SSH access.
- Do not add filler Swift files for language statistics.
- Do not store provider keys, SSH keys, tokens, or private vault material in
  native package files.
